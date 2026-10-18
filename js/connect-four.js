// Connect Four game (moved out of index.html so it can load with defer)
(function () {
    'use strict';
    // --- GAME LOGIC (Connect Four) ---
    const boardElement = document.getElementById('board');
    const columnSelectorsElement = document.getElementById('column-selectors');
    const statusElement = document.getElementById('status');
    const newGameButton = document.getElementById('newGame');
    const winnerModal = document.getElementById('winnerModal');
    const winnerModalContent = winnerModal.querySelector('div');
    const winnerText = document.getElementById('winnerText');
    const winnerSubText = document.getElementById('winnerSubText');
    const playAgainButton = document.getElementById('playAgain');

    const ROWS = 6;
    const COLS = 7;
    const HUMAN_PLAYER = 1;
    const AI_PLAYER = 2;
    const AI_DEPTH = 6;
    
    let board = [];
    let currentPlayer = HUMAN_PLAYER;
    let gameOver = false;

    function createBoard() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        gameOver = false;
        currentPlayer = HUMAN_PLAYER;
        
        boardElement.innerHTML = '';
        columnSelectorsElement.innerHTML = '';
        
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }

        for (let col = 0; col < COLS; col++) {
            const column = document.createElement('div');
            column.classList.add('column');
            column.dataset.col = col;
            column.setAttribute('role', 'button');
            column.setAttribute('aria-label', `Drop piece in column ${col + 1}`);
            column.addEventListener('click', () => handleColumnClick(col));
            columnSelectorsElement.appendChild(column);
        }
        
        updateStatus();
        toggleColumnSelectors(true);
    }

    function handleColumnClick(col) {
        if (gameOver || currentPlayer !== HUMAN_PLAYER) return;
        const row = findAvailableRow(board, col);
        if (row === -1) return;
        
        dropPiece(row, col, HUMAN_PLAYER);
        if (gameOver) return;
        
        currentPlayer = AI_PLAYER;
        updateStatus();
        toggleColumnSelectors(false);
        
        setTimeout(() => {
            requestAnimationFrame(aiMove);
        }, 100);
    }

    function aiMove() {
        statusElement.textContent = "Computer is thinking...";
        setTimeout(() => {
            const { col } = minimax(board, AI_DEPTH, -Infinity, Infinity, true);
            
            if (col === null) {
                const valid = getValidLocations(board);
                if (valid.length > 0) {
                     const randomCol = valid[Math.floor(Math.random() * valid.length)];
                     const row = findAvailableRow(board, randomCol);
                     dropPiece(row, randomCol, AI_PLAYER);
                } else {
                    gameOver = true;
                    showWinner("It's a Draw!");
                }
                return;
            }
            
            const row = findAvailableRow(board, col);
            dropPiece(row, col, AI_PLAYER);
            
            if (gameOver) return;
            
            currentPlayer = HUMAN_PLAYER;
            updateStatus();
            toggleColumnSelectors(true);
        }, 50);
    }

    function findAvailableRow(b, col) {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (b[row][col] === 0) return row;
        }
        return -1;
    }

    function dropPiece(row, col, player) {
        board[row][col] = player;
        const piece = document.createElement('div');
        piece.classList.add('piece', `player${player}`);
        
        const targetCell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        targetCell.appendChild(piece);
        
        if (checkForWin(board, player)) {
            gameOver = true;
            if (player === HUMAN_PLAYER) {
                showWinner("You Won!", "Screenshot this for a 5% discount!");
            } else {
                showWinner("Computer Wins!");
            }
            highlightWinningCells(board, player);
        } else if (isBoardFull(board)) {
            gameOver = true;
            showWinner("It's a Draw!");
        }
    }

    function updateStatus() {
        if (gameOver) return;
        if (currentPlayer === HUMAN_PLAYER) {
            statusElement.textContent = "Your Turn (Red)";
            statusElement.className = "text-xl font-bold h-8 text-red-500 transition-colors duration-300";
        } else {
            statusElement.textContent = "Computer's Turn (Yellow)";
            statusElement.className = "text-xl font-bold h-8 text-wd-yellow transition-colors duration-300";
        }
    }
    
    function toggleColumnSelectors(enabled) {
        columnSelectorsElement.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    function showWinner(message, subMessage = "") {
        statusElement.textContent = message;
        winnerText.textContent = message;
        
        if (subMessage) {
            winnerSubText.textContent = subMessage;
            winnerSubText.classList.remove('hidden');
        } else {
            winnerSubText.classList.add('hidden');
        }
        
        winnerModal.classList.remove('hidden');
        winnerModal.classList.add('flex');
        
        setTimeout(() => {
            winnerModalContent.style.transform = 'scale(1)';
            winnerModalContent.style.opacity = '1';
        }, 10);
    }
    
    function resetGame() {
        winnerModal.classList.remove('flex');
        winnerModal.classList.add('hidden');
        winnerModalContent.style.opacity = '0';
        winnerModalContent.style.transform = 'scale(0.95)';
        createBoard();
    }

    function isBoardFull(b) { return b[0].every(cell => cell !== 0); }

    function checkForWin(b, player) {
        for (let r = 0; r < ROWS; r++) { for (let c = 0; c <= COLS - 4; c++) { if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return true; } }
        for (let c = 0; c < COLS; c++) { for (let r = 0; r <= ROWS - 4; r++) { if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return true; } }
        for (let r = 0; r <= ROWS - 4; r++) { for (let c = 0; c <= COLS - 4; c++) { if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return true; } }
        for (let r = 3; r < ROWS; r++) { for (let c = 0; c <= COLS - 4; c++) { if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) return true; } }
        return false;
    }
    
    function highlightWinningCells(b, player) {
         const findLine = () => {
            for (let r = 0; r < ROWS; r++) { for (let c = 0; c <= COLS - 4; c++) { if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return [{r,c},{r,c:c+1},{r,c:c+2},{r,c:c+3}]; } }
            for (let c = 0; c < COLS; c++) { for (let r = 0; r <= ROWS - 4; r++) { if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return [{r,c},{r:r+1,c},{r:r+2,c},{r:r+3,c}]; } }
            for (let r = 0; r <= ROWS - 4; r++) { for (let c = 0; c <= COLS - 4; c++) { if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return [{r,c},{r:r+1,c:c+1},{r:r+2,c:c+2},{r:r+3,c:c+3}]; } }
            for (let r = 3; r < ROWS; r++) { for (let c = 0; c <= COLS - 4; c++) { if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) return [{r,c},{r:r-1,c:c+1},{r:r-2,c:c+2},{r:r-3,c:c+3}]; } }
            return [];
        };
        const winningLine = findLine();
        winningLine.forEach(pos => {
            const cellElement = document.querySelector(`.cell[data-row='${pos.r}'][data-col='${pos.c}']`);
            if (cellElement) cellElement.classList.add('winning-cell');
        });
    }

    function evaluateWindow(window, player) {
        let score = 0;
        const opponent = player === AI_PLAYER ? HUMAN_PLAYER : AI_PLAYER;
        
        const pieceCount = window.filter(p => p === player).length;
        const emptyCount = window.filter(p => p === 0).length;
        const oppCount = window.filter(p => p === opponent).length;

        if (pieceCount === 4) {
            score += 100;
        } else if (pieceCount === 3 && emptyCount === 1) {
            score += 5;
        } else if (pieceCount === 2 && emptyCount === 2) {
            score += 2;
        }

        if (oppCount === 3 && emptyCount === 1) {
            score -= 4;
        }

        return score;
    }

    function scorePosition(b, player) {
        let score = 0;
        
        const centerArray = [];
        for(let r = 0; r < ROWS; r++) {
            centerArray.push(b[r][Math.floor(COLS/2)]);
        }
        const centerCount = centerArray.filter(p => p === player).length;
        score += centerCount * 3;

        for (let r = 0; r < ROWS; r++) {
            const rowArray = b[r];
            for (let c = 0; c < COLS - 3; c++) {
                const window = rowArray.slice(c, c + 4);
                score += evaluateWindow(window, player);
            }
        }

        for (let c = 0; c < COLS; c++) {
            const colArray = [];
            for(let r = 0; r < ROWS; r++) {
                colArray.push(b[r][c]);
            }
            for (let r = 0; r < ROWS - 3; r++) {
                const window = colArray.slice(r, r + 4);
                score += evaluateWindow(window, player);
            }
        }

        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]];
                score += evaluateWindow(window, player);
            }
        }

        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                const window = [b[r+3][c], b[r+2][c+1], b[r+1][c+2], b[r][c+3]];
                score += evaluateWindow(window, player);
            }
        }

        return score;
    }

    function getValidLocations(b) {
        const valid = [];
        for (let c = 0; c < COLS; c++) {
            if (b[0][c] === 0) valid.push(c);
        }
        return valid;
    }

    function isTerminalNode(b) {
        return checkForWin(b, AI_PLAYER) || checkForWin(b, HUMAN_PLAYER) || getValidLocations(b).length === 0;
    }

    function minimax(b, depth, alpha, beta, maximizingPlayer) {
        const validLocations = getValidLocations(b);
        const isTerminal = isTerminalNode(b);
        
        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (checkForWin(b, AI_PLAYER)) {
                    return { col: null, score: 1000000000 };
                } else if (checkForWin(b, HUMAN_PLAYER)) {
                    return { col: null, score: -1000000000 };
                } else {
                    return { col: null, score: 0 };
                }
            } else {
                return { col: null, score: scorePosition(b, AI_PLAYER) };
            }
        }

        validLocations.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));

        if (maximizingPlayer) {
            let value = -Infinity;
            let column = validLocations[Math.floor(Math.random() * validLocations.length)];
            for (let col of validLocations) {
                const row = findAvailableRow(b, col);
                const bCopy = b.map(arr => [...arr]);
                bCopy[row][col] = AI_PLAYER;
                const newScore = minimax(bCopy, depth - 1, alpha, beta, false).score;
                if (newScore > value) {
                    value = newScore;
                    column = col;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
            return { col: column, score: value };
        } else {
            let value = Infinity;
            let column = validLocations[Math.floor(Math.random() * validLocations.length)];
            for (let col of validLocations) {
                const row = findAvailableRow(b, col);
                const bCopy = b.map(arr => [...arr]);
                bCopy[row][col] = HUMAN_PLAYER;
                const newScore = minimax(bCopy, depth - 1, alpha, beta, true).score;
                if (newScore < value) {
                    value = newScore;
                    column = col;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
            return { col: column, score: value };
        }
    }

    newGameButton.addEventListener('click', createBoard);
    playAgainButton.addEventListener('click', resetGame);
    createBoard();
})();
