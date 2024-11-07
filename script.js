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
                if ((isWhiteTurn && square.firstChild.textContent === '♙') || (!isWhiteTurn && square.firstChild.textContent === '♟')) {
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

        removeHighlight();

        squares.forEach(square => {
            const x = parseInt(square.getAttribute('data-x'));
            const y = parseInt(square.getAttribute('data-y'));

            if (isValidMove(piece, square)) {
                square.classList.add('highlight');
            }
        });
    }

    // Validate move for each piece type
    function isValidMove(piece, square) {
        const pieceType = piece.textContent;
        const startX = parseInt(square.getAttribute('data-x'));
        const startY = parseInt(square.getAttribute('data-y'));
        const pieceX = parseInt(piece.parentElement.getAttribute('data-x'));
        const pieceY = parseInt(piece.parentElement.getAttribute('data-y'));
        const hasMoved = piece.getAttribute('data-has-moved') === 'true';

        if (pieceType === '♙' || pieceType === '♟') {
            // White Pawn
            if (pieceType === '♙') {
                // Check for normal move (1 square forward)
                if (startX === pieceX && startY === pieceY - 1) {
                    return true;
                }
                // Check for first move (2 squares forward)
                if (!hasMoved && startX === pieceX && startY === pieceY - 2) {
                    return true;
                }
                return false;
            }
            // Black Pawn
            if (pieceType === '♟') {
                // Check for normal move (1 square forward)
                if (startX === pieceX && startY === pieceY + 1) {
                    return true;
                }
                // Check for first move (2 squares forward)
                if (!hasMoved && startX === pieceX && startY === pieceY + 2) {
                    return true;
                }
                return false;
            }
        }
        return true; // For other pieces (non-pawn), we can keep the default behavior.
    }
});
