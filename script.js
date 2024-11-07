document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    let selectedPiece = null;
    let isWhiteTurn = true;

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
                removeHighlight();
                selectedPiece = null;
                isWhiteTurn = !isWhiteTurn; // Flip turn
            }
        }
    });

    // Valid move checker for different pieces including path checking
    function isValidMove(piece, destinationSquare) {
        const pieceType = piece.textContent;
        const hasMoved = piece.getAttribute('data-has-moved') === 'true';
        const startX = parseInt(piece.parentElement.getAttribute('data-x'));
        const startY = parseInt(piece.parentElement.getAttribute('data-y'));
        const endX = parseInt(destinationSquare.getAttribute('data-x'));
        const endY = parseInt(destinationSquare.getAttribute('data-y'));

        switch (pieceType) {
            case '♙': // White Pawn
                // If pawn has moved
                if (hasMoved) {
                    // White pawn can move one square forward
                    if (startX === endX && endY === startY + 1 && !destinationSquare.hasChildNodes()) {
                        return true; // Move one square forward
                    }
                    // White pawn can capture diagonally
                    if (Math.abs(startX - endX) === 1 && endY === startY + 1 && destinationSquare.hasChildNodes()) {
                        return true; // Capture
                    }
                } else {
                    // White pawn can move one or two squares forward on its first move
                    if (startX === endX && (endY === startY + 1 || endY === startY + 2) && !destinationSquare.hasChildNodes()) {
                        return true; // Move one or two squares forward
                    }
                    // White pawn can capture diagonally on its first move
                    if (Math.abs(startX - endX) === 1 && endY === startY + 1 && destinationSquare.hasChildNodes()) {
                        return true; // Capture
                    }
                }
                return false;

            case '♟': // Black Pawn
                // If pawn has moved
                if (hasMoved) {
                    // Black pawn can move one square forward
                    if (startX === endX && endY === startY - 1 && !destinationSquare.hasChildNodes()) {
                        return true; // Move one square forward
                    }
                    // Black pawn can capture diagonally
                    if (Math.abs(startX - endX) === 1 && endY === startY - 1 && destinationSquare.hasChildNodes()) {
                        return true; // Capture
                    }
                } else {
                    // Black pawn can move one or two squares forward on its first move
                    if (startX === endX && (endY === startY - 1 || endY === startY - 2) && !destinationSquare.hasChildNodes()) {
                        return true; // Move one or two squares forward
                    }
                    // Black pawn can capture diagonally on its first move
                    if (Math.abs(startX - endX) === 1 && endY === startY - 1 && destinationSquare.hasChildNodes()) {
                        return true; // Capture
                    }
                }
                return false;

            // Handle other piece types here (rooks, knights, bishops, etc.)

            default:
                return false;
        }
    }

    // Highlight possible moves for each piece including path checking
    function highlightMoves(piece, startSquare) {
        const pieceType = piece.textContent;
        const hasMoved = piece.getAttribute('data-has-moved') === 'true';
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

    // Remove highlights from the board
    function removeHighlight() {
        squares.forEach(sq => sq.classList.remove('highlight'));
    }
});
