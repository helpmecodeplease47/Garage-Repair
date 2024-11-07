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
        '1': '♙', // White Pawns
        '6': '♟', // Black Pawns
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
        if (!square) return; // Clicked outside the board

        if (square.children.length > 0) { // A piece exists here
            // If there's no piece selected or a different piece is clicked, select this piece
            if (!selectedPiece || selectedPiece !== e.target) {
                selectedPiece = e.target;
                highlightMoves(selectedPiece); // Highlighting possible moves is not implemented here
            } else {
                // Deselect if clicking same piece again
                removeHighlight(); // Remove any previous highlighting
                selectedPiece = null;
            }
        } else if (selectedPiece) {
            // Move the selected piece here if it's a valid move (this is where you'd check for legal moves)
            if (isValidMove(selectedPiece, square)) { // Placeholder function
                square.appendChild(selectedPiece);
                removeHighlight(); // Remove any highlighting after move
                selectedPiece = null; // Deselect the piece after moving
            }
        }
    });

    // Placeholder functions for move validation and highlighting
    function isValidMove(piece, destinationSquare) {
        // Here you would implement the chess rules for valid moves
        // This is a very simplified example that just allows any move
        return true;
    }

    function highlightMoves(piece) {
        // Here you would implement highlighting logic for possible moves
        console.log("Highlighting moves for ", piece);
    }

    function removeHighlight() {
        // Remove any highlighting from the board
    }
});
