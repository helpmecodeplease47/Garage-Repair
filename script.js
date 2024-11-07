document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    let selectedPiece = null;

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
        '6': '♙', // White Pawns (second row from the bottom)
        '1': '♟', // Black Pawns (second row from the top)
        '0': ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'], // White back row
        '7': ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']  // Black back row
    };

    let squares = board.querySelectorAll('.square');
    squares.forEach(square => {
        const x = parseInt(square.getAttribute('data-x'));
        const y = parseInt(square.getAttribute('data-y'));
        if (y === 1 || y === 6) {
            square.innerHTML = `<div class="piece">${pieces[y]}</div>`; 
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
                removeHighlight();
                selectedPiece = square.firstChild;
                highlightMoves(selectedPiece, square); // Highlight moves
            } else {
                removeHighlight();
                selectedPiece = null;
            }
        } else if (selectedPiece) {
            if (isValidMove(selectedPiece, square)) {
                square.appendChild(selectedPiece);
                removeHighlight();
                selectedPiece = null;
            }
        }
    });

    // Valid move checker for different pieces
    function isValidMove(piece, destinationSquare) {
        const pieceType = piece.textContent;
        const startX = parseInt(piece.parentElement.getAttribute('data-x'));
        const startY = parseInt(piece.parentElement.getAttribute('data-y'));
        const endX = parseInt(destinationSquare.getAttribute('data-x'));
        const endY = parseInt(destinationSquare.getAttribute('data-y'));

        switch (pieceType) {
            case '♙': // White pawn
                return endX === startX && endY === startY + 1;
            case '♟': // Black pawn
                return endX === startX && endY === startY - 1;
            case '♖': case '♜': // Rook
                return startX === endX || startY === endY;
            case '♘': case '♞': // Knight
                return (Math.abs(startX - endX) === 2 && Math.abs(startY - endY) === 1) ||
                       (Math.abs(startX - endX) === 1 && Math.abs(startY - endY) === 2);
            case '♗': case '♝': // Bishop
                return Math.abs(startX - endX) === Math.abs(startY - endY);
            case '♕': case '♛': // Queen
                return (startX === endX || startY === endY) || // Rook movement
                       (Math.abs(startX - endX) === Math.abs(startY - endY)); // Bishop movement
            case '♔': case '♚': // King
                return Math.abs(startX - endX) <= 1 && Math.abs(startY - endY) <= 1;
            default:
                return false;
        }
    }

    // Highlight possible moves for each piece
    function highlightMoves(piece, startSquare) {
        const pieceType = piece.textContent;
        const startX = parseInt(startSquare.getAttribute('data-x'));
        const startY = parseInt(startSquare.getAttribute('data-y'));

        removeHighlight();

        squares.forEach(square => {
            const x = parseInt(square.getAttribute('data-x'));
            const y = parseInt(square.getAttribute('data-y'));

            switch (pieceType) {
                case '♙': // White pawn
                    if (x === startX && y === startY + 1) square.classList.add('highlight');
                    break;
                case '♟': // Black pawn
                    if (x === startX && y === startY - 1) square.classList.add('highlight');
                    break;
                case '♖': case '♜': // Rook
                    if (x === startX || y === startY) square.classList.add('highlight');
                    break;
                case '♘': case '♞': // Knight
                    if ((Math.abs(startX - x) === 2 && Math.abs(startY - y) === 1) ||
                        (Math.abs(startX - x) === 1 && Math.abs(startY - y) === 2)) {
                        square.classList.add('highlight');
                    }
                    break;
                case '♗': case '♝': // Bishop
                    if (Math.abs(startX - x) === Math.abs(startY - y)) square.classList.add('highlight');
                    break;
                case '♕': case '♛': // Queen
                    if (x === startX || y === startY || // Rook movement
                        Math.abs(startX - x) === Math.abs(startY - y)) { // Bishop movement
                        square.classList.add('highlight');
                    }
                    break;
                case '♔': case '♚': // King
                    if (Math.abs(startX - x) <= 1 && Math.abs(startY - y) <= 1) square.classList.add('highlight');
                    break;
            }
        });
    }

    // Remove highlights from the board
    function removeHighlight() {
        squares.forEach(sq => sq.classList.remove('highlight'));
    }
});
