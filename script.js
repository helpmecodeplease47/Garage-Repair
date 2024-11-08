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

    // Pawn Move Validation
    function isValidPawnMove(piece, startX, startY, endX, endY) {
        const direction = piece.textContent === '♙' ? -1 : 1;
        const startRow = piece.textContent === '♙' ? 6 : 1;
        const targetSquare = document.querySelector(`[data-x="${endX}"][data-y="${endY}"]`);

        // Regular move
        if (startX === endX && !targetSquare.hasChildNodes() && endY - startY === direction) {
            return true;
        }

        // Double move from starting position
        if (startX === endX && !targetSquare.hasChildNodes() && !document.querySelector(`[data-x="${endX}"][data-y="${endY - direction}"]`).hasChildNodes() && endY - startY === 2 * direction && startY === startRow) {
            return true;
        }

        // Capture move
        if (Math.abs(startX - endX) === 1 && endY - startY === direction) {
            if (targetSquare && targetSquare.hasChildNodes()) {
                return true;
            }
        }
        return false;
    }

    // Rook Move Validation
    function isValidRookMove(startX, startY, endX, endY) {
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

    // Knight Move Validation
    function isValidKnightMove(startX, startY, endX, endY) {
        return (Math.abs(startX - endX) === 2 && Math.abs(startY - endY) === 1) || (Math.abs(startX - endX) === 1 && Math.abs(startY - endY) === 2);
    }

    // Bishop Move Validation
    function isValidBishopMove(startX, startY, endX, endY) {
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

    // Queen Move Validation
    function isValidQueenMove(startX, startY, endX, endY) {
        return isValidRookMove(startX, startY, endX, endY) || isValidBishopMove(startX, startY, endX, endY);
    }

    // King Move Validation
    function isValidKingMove(startX, startY, endX, endY) {
        return Math.abs(startX - endX) <= 1 && Math.abs(startY - endY) <= 1;
    }

    // Pawn Promotion
    function promotePawnIfNeeded(piece, square) {
        if ((piece.textContent === '♙' && square.getAttribute('data-y') === '0') || (piece.textContent === '♟' && square.getAttribute('data-y') === '7')) {
            square.innerHTML = `<div class="piece">${piece.textContent === '♙' ? '♕' : '♛'}</div>`;
        }
    }

    // King Position Update
    function updateKingPosition(piece, square) {
        if (piece.textContent === '♔') {
            kingsPosition.white = { x: parseInt(square.getAttribute('data-x')), y: parseInt(square.getAttribute('data-y')) };
        } else if (piece.textContent === '♚') {
            kingsPosition.black = { x: parseInt(square.getAttribute('data-x')), y: parseInt(square.getAttribute('data-y')) };
        }
    }

    // En Passant
    function handleEnPassant(piece, square) {
        if (enPassant) {
            const enPassantTarget = document.querySelector(`[data-x="${enPassant.x}"][data-y="${enPassant.y}"]`);
            if (square === enPassantTarget) {
                enPassantTarget.innerHTML = '';
                removeHighlight();
            }
        }
    }

    // Game End Check
    function checkGameEnd() {
        if (gameEnded) return;

        const whiteKing = document.querySelector('.square[data-x="' + kingsPosition.white.x + '"][data-y="' + kingsPosition.white.y + '"]').firstChild;
        const blackKing = document.querySelector('.square[data-x="' + kingsPosition.black.x + '"][data-y="' + kingsPosition.black.y + '"]').firstChild;
        
        if (!whiteKing) {
            alert('Black wins by checkmate!');
            gameEnded = true;
        } else if (!blackKing) {
            alert('White wins by checkmate!');
            gameEnded = true;
        }
    }

    // Remove Highlights
    function removeHighlight() {
        const highlights = board.querySelectorAll('.highlight');
        highlights.forEach(highlight => highlight.classList.remove('highlight'));
    }

    // Highlight Moves
    function highlightMoves(piece, square) {
        const pieceType = piece.textContent;
        const startX = parseInt(square.getAttribute('data-x'));
        const startY = parseInt(square.getAttribute('data-y'));

        let moves = [];
        switch (pieceType) {
            case '♙':
            case '♟':
                moves = getPawnMoves(piece, startX, startY);
                break;
            case '♖':
            case '♜':
                moves = getRookMoves(startX, startY);
                break;
            case '♘':
            case '♞':
                moves = getKnightMoves(startX, startY);
                break;
            case '♗':
            case '♝':
                moves = getBishopMoves(startX, startY);
                break;
            case '♕':
            case '♛':
                moves = getQueenMoves(startX, startY);
                break;
            case '♔':
            case '♚':
                moves = getKingMoves(startX, startY);
                break;
        }

        moves.forEach(move => {
            const targetSquare = document.querySelector(`[data-x="${move.x}"][data-y="${move.y}"]`);
            if (targetSquare && !targetSquare.hasChildNodes()) {
                targetSquare.classList.add('highlight');
            }
        });
    }

    function getPawnMoves(piece, startX, startY) {
        const direction = piece.textContent === '♙' ? -1 : 1;
        const moves = [];
        if (startY + direction >= 0 && startY + direction <= 7) {
            moves.push({ x: startX, y: startY + direction });
        }
        return moves;
    }

    function getRookMoves(startX, startY) {
        const moves = [];
        // Add rook moves...
        return moves;
    }

    function getKnightMoves(startX, startY) {
        const moves = [];
        // Add knight moves...
        return moves;
    }

    function getBishopMoves(startX, startY) {
        const moves = [];
        // Add bishop moves...
        return moves;
    }

    function getQueenMoves(startX, startY) {
        const moves = [];
        // Add queen moves...
        return moves;
    }

    function getKingMoves(startX, startY) {
        const moves = [];
        // Add king moves...
        return moves;
    }
});
