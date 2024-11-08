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

    // ... (Initialization code remains the same)

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
    }

    // ... (Keep other functions like `isValidMove`, `isValidPawnMove`, etc.)

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
                if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                    const destSquare = document.querySelector(`[data-x="${newX}"][data-y="${newY}"]`);
                    if ((!destSquare.hasChildNodes() || destSquare.firstChild.textContent.match(new RegExp(color === 'white' ? '[♟♜♝♞♛♚]' : '[♙♖♗♘♕♔]'))) && !wouldBeInCheck(board.querySelector(`.piece${color === 'white' ? '♔' : '♚'}`), destSquare)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function isStalemate() {
        const color = isWhiteTurn ? 'white' : 'black';
        for (let piece of board.querySelectorAll('.piece')) {
            if (piece.textContent.match(new RegExp(color === 'white' ? '[♙♖♗♘♕♔]' : '[♟♜♝♞♛♚]'))) {
                const startX = parseInt(piece.parentElement.getAttribute('data-x'));
                const startY = parseInt(piece.parentElement.getAttribute('data-y'));
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        const destSquare = document.querySelector(`[data-x="${i}"][data-y="${j}"]`);
                        if (isValidMove(piece, destSquare) && !wouldBeInCheck(piece, destSquare)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    function highlightMoves(piece, square) {
        const validMoves = getValidMoves(piece, square);
        validMoves.forEach(move => {
            const moveSquare = document.querySelector(`[data-x="${move.x}"][data-y="${move.y}"]`);
            moveSquare.classList.add('highlight');
        });
    }

    function getValidMoves(piece, square) {
        const moves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const endSquare = document.querySelector(`[data-x="${j}"][data-y="${i}"]`);
                if (isValidMove(piece, endSquare) && !wouldBeInCheck(piece, endSquare)) {
                    moves.push({ x: j, y: i });
                }
            }
        }
        return moves;
    }

    function removeHighlight() {
        document.querySelectorAll('.highlight').forEach(square => square.classList.remove('highlight'));
    }

    // ... (Ensure all functions are defined)
});
