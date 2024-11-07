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

    // Place pieces (simplified setup for demonstration)
    const pieces = {
        '1': '♙', '6': '♟', // Pawns
        '0': '♜', '7': '♖', // Rooks
    };

    let squares = board.querySelectorAll('.square');
    squares.forEach(square => {
        let x = parseInt(square.getAttribute('data-x'));
        let y = parseInt(square.getAttribute('data-y'));
        if (y === 1 || y === 6) square.innerHTML = `<div class="piece">${pieces[y]}</div>`;
        if (y === 0 || y === 7) {
            if (x === 0 || x === 7) square.innerHTML = `<div class="piece">${pieces[y]}</div>`;
        }
    });

    // Handle piece movement (very basic, needs improvement for real chess)
    board.addEventListener('click', (e) => {
        if (e.target.classList.contains('piece')) {
            const square = e.target.parentElement;
            const x = square.getAttribute('data-x');
            const y = square.getAttribute('data-y');
            console.log(`Moving piece at (${x}, ${y})`);
            // Implement move logic here
        }
    });
});