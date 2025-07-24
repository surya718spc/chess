document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('chess-board');
    const statusDisplay = document.getElementById('status-display');
    let selectedSquare = null;
    let currentPlayer = 'white'; // 'white' or 'black'

    const pieces = {
        'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
        'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
    };

    const boardState = [
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
    ];

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const pieceChar = boardState[row][col];
                if (pieceChar) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    pieceElement.innerText = pieces[pieceChar];
                    pieceElement.classList.add(pieceChar === pieceChar.toUpperCase() ? 'piece-black' : 'piece-white');
                    square.appendChild(pieceElement);
                }
                square.addEventListener('click', handleSquareClick);
                boardElement.appendChild(square);
            }
        }
        statusDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    }

    function handleSquareClick(event) {
        const clickedSquare = event.currentTarget;
        const toRow = parseInt(clickedSquare.dataset.row);
        const toCol = parseInt(clickedSquare.dataset.col);
        const piece = boardState[toRow][toCol];

        if (selectedSquare) {
            // This is the second click (destination)
            const fromRow = parseInt(selectedSquare.dataset.row);
            const fromCol = parseInt(selectedSquare.dataset.col);
            
            // Clear previous highlights before anything else
            clearPossibleMoves();

            if (isMoveLegal(fromRow, fromCol, toRow, toCol)) {
                // Make the move
                boardState[toRow][toCol] = boardState[fromRow][fromCol];
                boardState[fromRow][fromCol] = '';
                currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
                renderBoard(); // Full re-render to reflect the move
            }
            
            // Deselect piece regardless of move legality
            selectedSquare.classList.remove('selected');
            selectedSquare = null;

        } else if (piece) {
            // This is the first click (selecting a piece)
            const pieceColor = (piece === piece.toUpperCase()) ? 'black' : 'white';
            if (pieceColor === currentPlayer) {
                selectedSquare = clickedSquare;
                selectedSquare.classList.add('selected');
                showPossibleMoves(toRow, toCol); // Show hints for the selected piece
            }
        }
    }

    /**
     * NEW: Iterates through the board and highlights legal moves
     */
    function showPossibleMoves(fromRow, fromCol) {
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (isMoveLegal(fromRow, fromCol, toRow, toCol)) {
                    const square = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
                    if (square) {
                        square.classList.add('possible-move');
                    }
                }
            }
        }
    }

    /**
     * NEW: Clears all move highlights from the board
     */
    function clearPossibleMoves() {
        document.querySelectorAll('.possible-move').forEach(sq => sq.classList.remove('possible-move'));
    }
    
    // --- Piece Specific Move Logic (Unchanged) ---

    function isMoveLegal(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        if (!piece) return false;
        const pieceType = piece.toLowerCase();
        const targetPiece = boardState[toRow][toCol];

        if (targetPiece) {
            const sourceColor = (piece === piece.toUpperCase()) ? 'black' : 'white';
            const targetColor = (targetPiece === targetPiece.toUpperCase()) ? 'black' : 'white';
            if (sourceColor === targetColor) return false;
        }

        switch (pieceType) {
            case 'p': return isPawnMoveLegal(fromRow, fromCol, toRow, toCol, piece);
            case 'r': return isRookMoveLegal(fromRow, fromCol, toRow, toCol);
            case 'n': return isKnightMoveLegal(fromRow, fromCol, toRow, toCol);
            case 'b': return isBishopMoveLegal(fromRow, fromCol, toRow, toCol);
            case 'q': return isQueenMoveLegal(fromRow, fromCol, toRow, toCol);
            case 'k': return isKingMoveLegal(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }

    function isPawnMoveLegal(fromRow, fromCol, toRow, toCol, piece) {
        const direction = (piece === 'p') ? -1 : 1;
        const startRow = (piece === 'p') ? 6 : 1;
        const targetPiece = boardState[toRow][toCol];

        if (fromCol === toCol && toRow === fromRow + direction && !targetPiece) return true;
        if (fromCol === toCol && fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece && !boardState[fromRow + direction][fromCol]) return true;
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) return true;
        return false;
    }

    function isRookMoveLegal(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }

    function isKnightMoveLegal(fromRow, fromCol, toRow, toCol) {
        const dRow = Math.abs(fromRow - toRow);
        const dCol = Math.abs(fromCol - toCol);
        return (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2);
    }

    function isBishopMoveLegal(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }

    function isQueenMoveLegal(fromRow, fromCol, toRow, toCol) {
        return isRookMoveLegal(fromRow, fromCol, toRow, toCol) || isBishopMoveLegal(fromRow, fromCol, toRow, toCol);
    }

    function isKingMoveLegal(fromRow, fromCol, toRow, toCol) {
        const dRow = Math.abs(fromRow - toRow);
        const dCol = Math.abs(fromCol - toCol);
        return dRow <= 1 && dCol <= 1;
    }
    
    function isPathClear(fromRow, fromCol, toRow, toCol) {
        const dRow = Math.sign(toRow - fromRow);
        const dCol = Math.sign(toCol - fromCol);
        let r = fromRow + dRow;
        let c = fromCol + dCol;
        while (r !== toRow || c !== toCol) {
            if (boardState[r][c]) return false;
            r += dRow;
            c += dCol;
        }
        return true;
    }

    // Initial render
    renderBoard();
});