document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');

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
        if (y === 1) {
            square.innerHTML = `<div class="piece">${pieces[y]}</div>`; // White Pawns
        } else if (y === 6) {
            square.innerHTML = `<div class="piece">${pieces[y]}</div>`; // Black Pawns
        } else if (y === 0 || y === 7) {
            square.innerHTML = `<div class="piece">${pieces[y][x]}</div>`; // Other pieces
        }
    });

    // Handle piece movement (basic implementation)
    board.addEventListener('click', (e) => {
        if (e.target.classList.contains('piece')) {
            const piece = e.target;
            const square = piece.parentElement;
            const x = parseInt(square.getAttribute('data-x'));
            const y = parseInt(square.getAttribute('data-y'));
            console.log(`Moving piece at (${x}, ${y})`);
            // Here you would implement your game logic for moving pieces
        }
    });
});
