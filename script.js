document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    let selectedPiece = null;
    let isWhiteTurn = true;
    let gameEnded = false;
    let kingsPosition = {
        white: { x: 4, y: 0 },
        black: { x: 4, y: 7 }
    };
    let enPassant = null;

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
        // Regular move
        if (startX === endX && !document.querySelector(`[data-x="${endX}"][data-y="${endY}"]`).hasChildNodes() && endY - startY === direction) {
            return true;
        }
        // Capture move
        if (Math.abs(startX - endX) === 1 && endY - startY === direction) {
            const targetSquare = document.querySelector(`[data-x="${endX}"][data-y="${endY}"]`);
            if (targetSquare && targetSquare.hasChildNodes()) {
                return true;
            }
        }
        return false;
    }

    function isValidRookMove(startX, startY, endX, endY) {
        // Rooks can move horizontally or vertically, but not through other pieces
        if (startX !== endX && startY !== endY) return false;
        if (startX === endX) {
            const step = startY < endY ? 1 : -1;
            for (let y = startY + step; y !== endY; y += step) {
                if (document.querySelector(`[data-x="${startX}"][data-y="${y}"]`).hasChildNodes()) {
                    return false;
                }
            }
            return true;
        } else if (startY === endY) {
            const step = startX < endX ? 1 : -1;
            for (let x = startX + step; x !== endX; x += step) {
                if (document.querySelector(`[data-x="${x}"][data-y="${startY}"]`).hasChildNodes()) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function isValidKnightMove(startX, startY, endX, endY) {
        // Knights move in an "L" shape
        return (Math.abs(startX - endX) === 2 && Math.abs(startY - endY) === 1) || (Math.abs(startX - endX) === 1 && Math.abs(startY - endY) === 2);
    }

    function isValidBishopMove(startX, startY, endX, endY) {
        // Bishops move diagonally
        if (Math.abs(startX - endX) === Math.abs(startY - endY)) {
            const stepX = startX < endX ? 1 : -1;
            const stepY = startY < endY ? 1 : -1;
            let x = startX + stepX;
            let y = startY + stepY;
            while (x !== endX && y !== endY) {
                if (document.querySelector(`[data-x="${x}"][data-y="${y}"]`).hasChildNodes()) {
                    return false;
                }
                x += stepX;
                y += stepY;
            }
            return true;
        }
        return false;
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

    function checkGameEnd() {
        if (gameEnded) return;
        // Add conditions for stalemate, check, or checkmate
    }

    function removeHighlight() {
        squares.forEach(square => square.classList.remove('highlight'));
    }

    function highlightMoves(piece, square) {
        const pieceType = piece.textContent;
        const x = parseInt(square.getAttribute('data-x'));
        const y = parseInt(square.getAttribute('data-y'));
        // Logic to highlight valid moves goes here
    }
});
