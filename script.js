document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const undoBtn = document.getElementById('undoBtn');
    let selectedPiece = null;
    let isWhiteTurn = true;
    let gameEnded = false;
    let kingsPosition = {
        white: { x: 4, y: 0 },
        black: { x: 4, y: 7 }
    };
    let enPassant = null;
    let moveHistory = []; // Store the history of moves for undo

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
        '0': ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'], // White back row
        '7': ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']  // Black back row
    };

    // Get all squares to place pieces
    let squares = board.querySelectorAll('.square');
    
    // Loop over squares and place pieces
    squares.forEach((square, idx) => {
        const x = parseInt(square.getAttribute('data-x'));
        const y = parseInt(square.getAttribute('data-y'));

        // Place pawns on row 6 (white) and row 1 (black)
        if (y === 6) {
            square.innerHTML = `<div class="piece">${pieces['6']}</div>`; // White Pawns
        } else if (y === 1) {
            square.innerHTML = `<div class="piece">${pieces['1']}</div>`; // Black Pawns
        } 

        // Place pieces on the back rows (0 for white, 7 for black)
        else if (y === 0) {
            square.innerHTML = `<div class="piece">${pieces['0'][x]}</div>`; // White back row
        } else if (y === 7) {
            square.innerHTML = `<div class="piece">${pieces['7'][x]}</div>`; // Black back row
        }
    });

    // Handle piece movement
    board.addEventListener('click', (e) => {
        const square = e.target.closest('.square');
        if (!square) return;

        if (square.children.length > 0 && square.firstChild.classList.contains('piece')) {
            const piece = square.firstChild;
            const correctColor = isWhiteTurn ? piece.textContent.match(/[♙♖♗♘♕♔]/) : piece.textContent.match(/[♟♜♝♞♛♚]/);
            if (!selectedPiece || selectedPiece !== piece) {
                if (correctColor && !gameEnded) {
                    removeHighlight();
                    selectedPiece = piece;
                    highlightMoves(selectedPiece, square);
                }
            } else {
                removeHighlight();
                selectedPiece = null;
            }
        } else if (selectedPiece) {
            if (isValidMove(selectedPiece, square)) {
                const originSquare = selectedPiece.parentElement;
                
                // Save the move to history for undo
                moveHistory.push({
                    piece: selectedPiece,
                    from: { x: parseInt(originSquare.getAttribute('data-x')), y: parseInt(originSquare.getAttribute('data-y')) },
                    to: { x: parseInt(square.getAttribute('data-x')), y: parseInt(square.getAttribute('data-y')) }
                });

                // Move the piece to the new square
                square.appendChild(selectedPiece);
                
                // Clear the original square
                originSquare.innerHTML = '';
                
                if (selectedPiece.getAttribute('data-has-moved') === 'false') {
                    selectedPiece.setAttribute('data-has-moved', 'true');
                }
                promotePawnIfNeeded(selectedPiece, square);
                updateKingPosition(selectedPiece, square);
                handleEnPassant(selectedPiece, square);
                removeHighlight();
                selectedPiece = null;
                isWhiteTurn = !isWhiteTurn; // Flip turn
                checkGameEnd();
            }
        }
    });

    // Undo the last move
    undoBtn.addEventListener('click', () => {
        if (moveHistory.length === 0) return;

        const lastMove = moveHistory.pop();
        const { piece, from, to } = lastMove;
        const fromSquare = document.querySelector(`[data-x="${from.x}"][data-y="${from.y}"]`);
        const toSquare = document.querySelector(`[data-x="${to.x}"][data-y="${to.y}"]`);
        
        // Move the piece back to its original position
        fromSquare.appendChild(piece);
        toSquare.innerHTML = ''; // Clear the target square
        
        // Update game state
        isWhiteTurn = !isWhiteTurn; // Reverse the turn
    });

    // Check if a move is valid for the piece
    function isValidMove(piece, square) {
        const pieceType = piece.textContent;
        const startX = parseInt(piece.parentElement.getAttribute('data-x'));
        const startY = parseInt(piece.parentElement.getAttribute('data-y'));
        const endX = parseInt(square.getAttribute('data-x'));
        const endY = parseInt(square.getAttribute('data-y'));
        
        switch (pieceType) {
            case '♙': case '♟':
                return isValidPawnMove(piece, startX, startY, endX, endY);
            case '♖': case '♜':
                return isValidRookMove(startX, startY, endX, endY);
            case '♘': case '♞':
                return isValidKnightMove(startX, startY, endX, endY);
            case '♗': case '♝':
                return isValidBishopMove(startX, startY, endX, endY);
            case '♕': case '♛':
                return isValidQueenMove(startX, startY, endX, endY);
            case '♔': case '♚':
                return isValidKingMove(startX, startY, endX, endY);
            default:
                return false;
        }
    }

    function isValidPawnMove(piece, startX, startY, endX, endY) {
        const direction = piece.textContent === '♙' ? -1 : 1;
        const startRow = piece.textContent === '♙' ? 6 : 1;
        const targetSquare = document.querySelector(`[data-x="${endX}"][data-y="${endY}"]`);

        // Regular move
        if (startX === endX && !targetSquare.hasChildNodes() && endY - startY === direction) {
            return true;
        }

        // Double move from starting position
        if (startX === endX && !targetSquare.hasChildNodes() && !document.querySelector(`[data-x="${endX}"][data-y="${endY - direction}"]`).hasChildNodes() && endY - startY === direction * 2) {
            return startY === startRow;
        }

        return false;
    }

    function isValidRookMove(startX, startY, endX, endY) {
        // Rook move logic here
    }

    function isValidKnightMove(startX, startY, endX, endY) {
        // Knight move logic here
    }

    function isValidBishopMove(startX, startY, endX, endY) {
        // Bishop move logic here
    }

    function isValidQueenMove(startX, startY, endX, endY) {
        return isValidRookMove(startX, startY, endX, endY) || isValidBishopMove(startX, startY, endX, endY);
    }

    function isValidKingMove(startX, startY, endX, endY) {
        return Math.abs(startX - endX) <= 1 && Math.abs(startY - endY) <= 1;
    }

    function promotePawnIfNeeded(piece, square) {
        if ((piece.textContent === '♙' && square.getAttribute('data-y') === '0') || (piece.textContent === '♟' && square.getAttribute('data-y') === '7')) {
            piece.textContent = piece.textContent === '♙' ? '♕' : '♛'; // Promote to Queen
        }
    }

    function updateKingPosition(piece, square) {
        const color = piece.textContent === '♙' || piece.textContent === '♖' || piece.textContent === '♘' || piece.textContent === '♗' || piece.textContent === '♕' || piece.textContent === '♔' ? 'white' : 'black';
        if (piece.textContent === '♔') {
            kingsPosition[color] = { x: parseInt(square.getAttribute('data-x')), y: parseInt(square.getAttribute('data-y')) };
        }
    }

    function handleEnPassant(piece, square) {
        if (enPassant) {
            const targetSquare = document.querySelector(`[data-x="${square.getAttribute('data-x')}"][data-y="${parseInt(square.getAttribute('data-y')) + (piece.textContent === '♙' ? -1 : 1)}"]`);
            if (targetSquare && targetSquare.hasChildNodes()) {
                targetSquare.innerHTML = ''; // Remove the captured pawn
                enPassant = null;
            }
        }
    }

    function removeHighlight() {
        squares.forEach(square => square.classList.remove('highlight'));
    }

    function highlightMoves(piece, square) {
        // Add logic to highlight valid moves
    }

    function checkGameEnd() {
        if (gameEnded) return;
        // Check for check, checkmate, stalemate
    }
});
