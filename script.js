document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    let selectedPiece = null;
    let isWhiteTurn = true;
    let gameEnded = false;
    let kingsPosition = {
        white: { x: 4, y: 0 },
        black: { x: 4, y: 7 }
    };

    // Initialize the board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let square = document.createElement('div');
            square.className = `square ${(i + j) % 2 === 0 ? 'light' : 'dark'}`;
            square.setAttribute('data-x', j);
            square.setAttribute('data-y', i);
            board.appendChild(square);
        }
    }

    // Place all pieces correctly
    const pieces = {
        '6': '♙', // White Pawns
        '1': '♟', // Black Pawns
        '0': ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'], // White back row
        '7': ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']  // Black back row
    };

    let squares = board.querySelectorAll('.square');
    squares.forEach(square => {
        const x = parseInt(square.getAttribute('data-x'));
        const y = parseInt(square.getAttribute('data-y'));
        if (y === 6) {
            square.innerHTML = `<div class="piece" data-has-moved="false">${pieces[y]}</div>`; // White Pawns
        } else if (y === 1) {
            square.innerHTML = `<div class="piece" data-has-moved="false">${pieces[y]}</div>`; // Black Pawns
        } else if (y === 0 || y === 7) {
            square.innerHTML = `<div class="piece">${pieces[y][x]}</div>`;
        }
    });

    // Handle piece movement
    board.addEventListener('click', (e) => {
        const square = e.target.closest('.square');
        if (!square) return;

        if (square.children.length > 0 && square.firstChild.classList.contains('piece')) { // A piece exists here
            if (!selectedPiece || selectedPiece !== e.target) {
                if ((isWhiteTurn && square.firstChild.textContent === '♙') || 
                    (isWhiteTurn && square.firstChild.textContent === '♟')) {
                    removeHighlight();
                    selectedPiece = square.firstChild;
                    highlightMoves(selectedPiece, square); // Highlight moves
                }
            } else {
                removeHighlight();
                selectedPiece = null;
            }
        } else if (selectedPiece) {
            if (isValidMove(selectedPiece, square)) {
                square.appendChild(selectedPiece);
                // If the moved piece is a pawn, mark it as moved
                if (selectedPiece.getAttribute('data-has-moved') === 'false') {
                    selectedPiece.setAttribute('data-has-moved', 'true');
                }
                // Handle pawn promotion
                if ((selectedPiece.textContent === '♙' && parseInt(square.getAttribute('data-y')) === 0) || 
                    (selectedPiece.textContent === '♟' && parseInt(square.getAttribute('data-y')) === 7)) {
                    promotePawn(selectedPiece);
                }
                // Update kings' positions
                if (selectedPiece.textContent === '♔' && isWhiteTurn) {
                    kingsPosition.white = { x: parseInt(square.getAttribute('data-x')), y: parseInt(square.getAttribute('data-y')) };
                } else if (selectedPiece.textContent === '♔' && !isWhiteTurn) {
                    kingsPosition.black = { x: parseInt(square.getAttribute('data-x')), y: parseInt(square.getAttribute('data-y')) };
                }
                removeHighlight();
                selectedPiece = null;
                isWhiteTurn = !isWhiteTurn; // Flip turn
                checkGameEnd();
            }
        }
    });

    // Check game-ending conditions (checkmate, stalemate, etc.)
    function checkGameEnd() {
        if (isInCheck('white') || isInCheck('black')) {
            // Check if it's checkmate
            if (!canKingMoveOut('white') || !canKingMoveOut('black')) {
                gameEnded = true;
                alert(`${isWhiteTurn ? 'Black' : 'White'} wins by checkmate!`);
            }
        } else if (isStalemate()) {
            gameEnded = true;
            alert('Stalemate! It\'s a draw.');
        }
    }

    // Check if a king is in check
    function isInCheck(color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        const kingPos = kingsPosition[color];
        const opponentPieces = board.querySelectorAll('.piece');
        for (let piece of opponentPieces) {
            const pieceType = piece.textContent;
            // Check if opponent's piece threatens the king
            if (pieceType === '♙' || pieceType === '♟') {
                // Pawns only attack diagonally
                const directions = color === 'white' ? [[-1, 1], [1, 1]] : [[-1, -1], [1, -1]];
                for (let [dx, dy] of directions) {
                    const targetX = kingPos.x + dx;
                    const targetY = kingPos.y + dy;
                    if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
                        const square = document.querySelector(`[data-x="${targetX}"][data-y="${targetY}"]`);
                        if (square.hasChildNodes() && square.firstChild === piece) {
                            return true;
                        }
                    }
                }
            } else if (pieceType === '♖' || pieceType === '♖') {
                // Rooks and Queens (Horizontal & Vertical)
                const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                for (let [dx, dy] of directions) {
                    let x = kingPos.x;
                    let y = kingPos.y;
                    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                        x += dx;
                        y += dy;
                        const square = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                        if (square.hasChildNodes()) {
                            if (square.firstChild === piece) {
                                return true;
                            }
                            break;
                        }
                    }
                }
            } else {
                // To be improved for Bishop, Knight, Queen, etc.
            }
        }
        return false;
    }

    // Check if it's stalemate
    function isStalemate() {
        const color = isWhiteTurn ? 'white' : 'black';
        const kingPos = kingsPosition[color];
        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = board.querySelectorAll('.piece');
        let isSafe = false;
        for (let piece of opponentPieces) {
            // If the opponent has no moves that can threaten the king, it's stalemate
            if (piece.textContent === '♙' || piece.textContent === '♟') {
                // Handle pawn movements
            } else if (piece.textContent === '♘') {
                // Handle knight movements
            }
            // Handle other pieces (bishop, rook, queen)
        }
        return !isSafe; // If the king is not safe and no moves are available
    }

    // Promote pawn when it reaches the other side
    function promotePawn(piece) {
        const promotion = prompt("Promote pawn to (Q = Queen, R = Rook, B = Bishop, N = Knight):");
        if (promotion === 'Q' || promotion === 'R' || promotion === 'B' || promotion === 'N') {
            piece.textContent = promotion === 'Q' ? (isWhiteTurn ? '♕' : '♛') : 
                                promotion === 'R' ? (isWhiteTurn ? '♖' : '♖') : 
                                promotion === 'B' ? (isWhiteTurn ? '♗' : '♝') : 
                                (isWhiteTurn ? '♘' : '♞');
        }
    }

    // Remove highlights from the board
    function removeHighlight() {
        squares.forEach(sq => sq.classList.remove('highlight'));
    }

    // Highlight possible moves for each piece including path checking
    function highlightMoves(piece, startSquare) {
        const pieceType = piece.textContent;
        const startX = parseInt(startSquare.getAttribute('data-x'));
        const startY = parseInt(startSquare.getAttribute('data-y'));
        const possibleMoves = [];
        
        // Move logic for each piece type
        switch (pieceType) {
            case '♙': // Pawn move
                let direction = isWhiteTurn ? -1 : 1;
                let startRow = startY;
                let moveOneSquare = { x: startX, y: startY + direction };
                let moveTwoSquares = { x: startX, y: startY + (direction * 2) };
                // Pawn moves forward by 1 or 2 squares if not moved yet
                if (moveOneSquare.y >= 0 && moveOneSquare.y < 8) {
                    possibleMoves.push(moveOneSquare);
                }
                if (startRow === 6 && isWhiteTurn || startRow === 1 && !isWhiteTurn) {
                    if (moveTwoSquares.y >= 0 && moveTwoSquares.y < 8) {
                        possibleMoves.push(moveTwoSquares);
                    }
                }
                break;
            case '♘': // Knight move
                const knightMoves = [
                    { x: startX + 2, y: startY + 1 }, { x: startX + 2, y: startY - 1 },
                    { x: startX - 2, y: startY + 1 }, { x: startX - 2, y: startY - 1 },
                    { x: startX + 1, y: startY + 2 }, { x: startX + 1, y: startY - 2 },
                    { x: startX - 1, y: startY + 2 }, { x: startX - 1, y: startY - 2 }
                ];
                knightMoves.forEach(move => {
                    if (move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8) {
                        possibleMoves.push(move);
                    }
                });
                break;
            case '♗': // Bishop move
                // Add logic for Bishop movement diagonally
                break;
            case '♖': // Rook move
                // Add logic for Rook movement horizontally and vertically
                break;
            case '♕': // Queen move
                // Add logic for Queen movement (combination of Rook and Bishop)
                break;
            case '♔': // King move
                // Add logic for King movement (one square in any direction)
                break;
        }

        // Highlight the possible moves
        possibleMoves.forEach(move => {
            const square = document.querySelector(`[data-x="${move.x}"][data-y="${move.y}"]`);
            square.classList.add('highlight');
        });
    }

    // Check if the move is valid for the piece
    function isValidMove(piece, square) {
        const pieceType = piece.textContent;
        const startX = parseInt(square.getAttribute('data-x'));
        const startY = parseInt(square.getAttribute('data-y'));
        
        // Handle move validation for each piece type here (simplified)
        return true; // Placeholder
    }

});
