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
    let moveHistory = [];

    // Handle piece movement
    board.addEventListener('click', (e) => {
        const square = e.target.closest('.square');
        if (!square) return;

        if (square.children.length > 0 && square.firstChild.classList.contains('piece')) {
            const piece = square.firstChild;
            if (isWhiteTurn ? piece.textContent.match(/[♙♖♗♘♕♔]/) : piece.textContent.match(/[♟♜♝♞♛♚]/)) {
                if (!selectedPiece || selectedPiece !== piece) {
                    removeHighlight();
                    selectedPiece = piece;
                    highlightMoves(selectedPiece, square);
                } else {
                    removeHighlight();
                    selectedPiece = null;
                }
            }
        } else if (selectedPiece) {
            if (isValidMove(selectedPiece, square) && !wouldBeInCheck(selectedPiece, square)) {
                const originSquare = selectedPiece.parentElement;
                if (moveWillBeLegal(selectedPiece, square)) {
                    square.appendChild(selectedPiece);
                    originSquare.innerHTML = '';
                    
                    if (selectedPiece.getAttribute('data-has-moved') === 'false') {
                        selectedPiece.setAttribute('data-has-moved', 'true');
                    }
                    updateGameState(selectedPiece, square);
                    recordMove(selectedPiece, originSquare, square); // Record the move
                    removeHighlight();
                    selectedPiece = null;
                    isWhiteTurn = !isWhiteTurn;
                    checkGameEnd();
                }
            }
        }
    });

    function moveWillBeLegal(piece, square) {
        const color = piece.textContent.match(/[♙♖♗♘♕♔]/) ? 'white' : 'black';
        const tempPiece = piece.cloneNode(true);
        const origin = piece.parentElement;
        square.appendChild(tempPiece);
        const kingInCheck = isInCheck(color);
        square.removeChild(tempPiece);
        origin.appendChild(tempPiece);
        return !kingInCheck;
    }

    function wouldBeInCheck(piece, square) {
        const color = piece.textContent.match(/[♙♖♗♘♕♔]/) ? 'white' : 'black';
        const tempPiece = piece.cloneNode(true);
        const origin = piece.parentElement;
        square.appendChild(tempPiece);
        const check = isInCheck(color);
        square.removeChild(tempPiece);
        origin.appendChild(tempPiece);
        return check;
    }

    function isInCheck(color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        const kingPos = kingsPosition[color];
        for (let piece of board.querySelectorAll('.piece')) {
            if (piece.textContent.match(new RegExp(opponentColor === 'white' ? '[♙♖♗♘♕♔]' : '[♟♜♝♞♛♚]'))) {
                if (isValidMove(piece, document.querySelector(`[data-x="${kingPos.x}"][data-y="${kingPos.y}"]`))) {
                    return true;
                }
            }
        }
        return false;
    }

    function updateGameState(piece, square) {
        promotePawnIfNeeded(piece, square);
        updateKingPosition(piece, square);
        handleEnPassant(piece, square);
        handleCastling(piece, square); // Check for castling
    }

    function handleCastling(piece, square) {
        // Castling logic: Only valid if the king and rook have not moved
        if (piece.textContent === '♔' && square.getAttribute('data-y') === '0' && isWhiteTurn && !gameEnded) {
            if (square.getAttribute('data-x') === '2' && !selectedPiece.getAttribute('data-has-moved') && 
                !document.querySelector('[data-x="0"][data-y="0"]').hasChildNodes()) {
                // Move rook if it's a valid castling move
                const rook = document.querySelector('[data-x="0"][data-y="0"]');
                rook.parentElement.innerHTML = '';
                document.querySelector('[data-x="3"][data-y="0"]').appendChild(rook);
            } else if (square.getAttribute('data-x') === '6' && !selectedPiece.getAttribute('data-has-moved') && 
                !document.querySelector('[data-x="7"][data-y="0"]').hasChildNodes()) {
                const rook = document.querySelector('[data-x="7"][data-y="0"]');
                rook.parentElement.innerHTML = '';
                document.querySelector('[data-x="5"][data-y="0"]').appendChild(rook);
            }
        }
    }

    function promotePawnIfNeeded(piece, square) {
        if (piece.textContent === '♙' && square.getAttribute('data-y') === '0' || 
            piece.textContent === '♟' && square.getAttribute('data-y') === '7') {
            const promotion = prompt("Promote to (Q = Queen, R = Rook, B = Bishop, N = Knight):");
            piece.textContent = {
                'Q': piece.textContent === '♙' ? '♕' : '♛',
                'R': piece.textContent === '♙' ? '♖' : '♜',
                'B': piece.textContent === '♙' ? '♗' : '♝',
                'N': piece.textContent === '♙' ? '♘' : '♞'
            }[promotion] || '♕'; // Default to Queen if invalid input
        }
    }

    function updateKingPosition(piece, square) {
        const color = piece.textContent === '♔' ? 'white' : 'black';
        if (piece.textContent.match(/[♔♚]/)) {
            kingsPosition[color] = { 
                x: parseInt(square.getAttribute('data-x')), 
                y: parseInt(square.getAttribute('data-y'))
            };
        }
    }

    function handleEnPassant(piece, square) {
        if (enPassant) {
            const targetSquare = document.querySelector(`[data-x="${square.getAttribute('data-x')}"][data-y="${parseInt(square.getAttribute('data-y')) + (piece.textContent === '♙' ? 1 : -1)}"]`);
            if (targetSquare && targetSquare.hasChildNodes()) {
                targetSquare.innerHTML = ''; // Remove the captured pawn
                enPassant = null;
            }
        }
        // Set en passant if pawn moved two squares
        const startY = parseInt(piece.parentElement.getAttribute('data-y'));
        const endY = parseInt(square.getAttribute('data-y'));
        if ((piece.textContent === '♙' && startY === 6 && endY === 4) || 
            (piece.textContent === '♟' && startY === 1 && endY === 3)) {
            enPassant = { x: parseInt(square.getAttribute('data-x')), y: endY };
        } else {
            enPassant = null;
        }
    }

    function recordMove(piece, originSquare, targetSquare) {
        moveHistory.push({
            piece: piece.textContent,
            from: { x: originSquare.getAttribute('data-x'), y: originSquare.getAttribute('data-y') },
            to: { x: targetSquare.getAttribute('data-x'), y: targetSquare.getAttribute('data-y') }
        });
    }

    function undoLastMove() {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            const piece = document.querySelector(`[data-x="${lastMove.to.x}"][data-y="${lastMove.to.y}"]`).firstChild;
            const originSquare = document.querySelector(`[data-x="${lastMove.from.x}"][data-y="${lastMove.from.y}"]`);
            originSquare.appendChild(piece);
            document.querySelector(`[data-x="${lastMove.to.x}"][data-y="${lastMove.to.y}"]`).innerHTML = '';
            isWhiteTurn = !isWhiteTurn;
            checkGameEnd();
        }
    }

    function checkGameEnd() {
        const color = isWhiteTurn ? 'white' : 'black';
        if (isInCheck(color)) {
            if (!canKingMoveOut(color)) {
                gameEnded = true;
                alert(`${color === 'white' ? 'Black' : 'White'} wins by checkmate!`);
            }
        } else if (isStalemate()) {
            gameEnded = true;
            alert('Stalemate! It\'s a draw.');
        }
    }

    function canKingMoveOut(color) {
        const kingPos = kingsPosition[color];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newX = kingPos.x + j;
                const newY = kingPos.y + i;
                if (isValidMove(kingPos, newX, newY) && !isInCheckAfterMove(newX, newY, color)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isStalemate() {
        return false; // Implement stalemate detection here
    }
});
