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

    // Place pieces
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

        // Place pawns only in their initial rows
        if (y === 6 && !square.hasChildNodes()) {
            square.innerHTML = `<div class="piece" data-has-moved="false">${pieces['6']}</div>`; // White Pawns
        } else if (y === 1 && !square.hasChildNodes()) {
            square.innerHTML = `<div class="piece" data-has-moved="false">${pieces['1']}</div>`; // Black Pawns
        } else if (y === 0 || y === 7) {
            if (!square.hasChildNodes()) {
                square.innerHTML = `<div class="piece">${pieces[y][x]}</div>`; // Place non-pawn pieces
            }
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

    function promotePawnIfNeeded(piece, square) {
        if ((piece.textContent === '♙' && parseInt(square.getAttribute('data-y')) === 0) || 
            (piece.textContent === '♟' && parseInt(square.getAttribute('data-y')) === 7)) {
            promotePawn(piece);
        }
    }

    function updateKingPosition(piece, square) {
        if (piece.textContent === (isWhiteTurn ? '♔' : '♚')) {
            kingsPosition[isWhiteTurn ? 'white' : 'black'] = { 
                x: parseInt(square.getAttribute('data-x')), 
                y: parseInt(square.getAttribute('data-y'))
            };
        }
    }

    function handleEnPassant(piece, square) {
        if (enPassant) {
            const startX = parseInt(piece.parentElement.getAttribute('data-x'));
            const startY = parseInt(piece.parentElement.getAttribute('data-y'));
            const endX = parseInt(square.getAttribute('data-x'));
            const endY = parseInt(square.getAttribute('data-y'));

            if (piece.textContent === (isWhiteTurn ? '♙' : '♟') &&
                Math.abs(startX - endX) === 1 && endY === (isWhiteTurn ? startY - 1 : startY + 1) &&
                enPassant.x === endX && enPassant.y === endY) {
                const targetSquare = board.querySelector(`[data-x="${endX}"][data-y="${startY}"]`);
                targetSquare.innerHTML = ''; // Capture the piece
                enPassant = null; // Clear en passant
            }
        }
    }

    function checkGameEnd() {
        const color = !isWhiteTurn ? 'white' : 'black'; // Opponent's king is checked
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

    function isInCheck(color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        const kingPos = kingsPosition[color];
        const opponentPieces = board.querySelectorAll('.piece');
        for (let piece of opponentPieces) {
            if (isValidMove(piece, document.querySelector(`[data-x="${kingPos.x}"][data-y="${kingPos.y}"]`))) {
                return true;
            }
        }
        return false;
    }

    function canKingMoveOut(color) {
        const kingPos = kingsPosition[color];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip current position
                const newX = kingPos.x + j;
                const newY = kingPos.y + i;
                if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                    const destSquare = board.querySelector(`[data-x="${newX}"][data-y="${newY}"]`);
                    if ((!destSquare.hasChildNodes() || destSquare.firstChild.textContent.match(/[♟♙]/)) && moveWillBeLegal(board.querySelector('.piece').textContent.match(/[♔♚]/), destSquare)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function isStalemate() {
        const color = isWhiteTurn ? 'white' : 'black';
        const pieces = board.querySelectorAll('.piece');
        for (let piece of pieces) {
            if (piece.textContent.match(new RegExp(color === 'white' ? '[♙♖♗♘♕♔]' : '[♟♜♝♞♛♚]'))) {
                const startX = parseInt(piece.parentElement.getAttribute('data-x'));
                const startY = parseInt(piece.parentElement.getAttribute('data-y'));
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        const destSquare = board.querySelector(`[data-x="${i}"][data-y="${j}"]`);
                        if (isValidMove(piece, destSquare) && moveWillBeLegal(piece, destSquare)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    function promotePawn(piece) {
        const promotion = prompt("Promote pawn to (Q = Queen, R = Rook, B = Bishop, N = Knight):");
        piece.innerHTML = {
            'Q': isWhiteTurn ? '♕' : '♛',
            'R': isWhiteTurn ? '♖' : '♖',
            'B': isWhiteTurn ? '♗' : '♝',
            'N': isWhiteTurn ? '♘' : '♞'
        }[promotion.toUpperCase()] || piece.textContent;
    }

    function highlightMoves(piece, square) {
        // Add logic for each piece's move pattern (currently only for pawns)
        const validMoves = getValidMoves(piece, square);
        validMoves.forEach(move => {
            move.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Highlight valid move
        });
    }

    function removeHighlight() {
        board.querySelectorAll('.square').forEach(sq => sq.style.backgroundColor = '');
    }

    function isValidMove(piece, square) {
        return true; // Implement actual move validation logic here
    }
});
