console.log('start');

function randomIntSmallerThan(max) {
    return Math.random() * max | 0;
}
function nDistinctRandomInts(max, n) {
    const results = new Set();
    while (results.size < n) {
        results.add(randomIntSmallerThan(max));
    }
    return [...results];
}
function toRowAndCol(num, n) {
    return [num / n | 0, num % n];
}

function randomCellIndexes(rowCount, colCount, n) {
    return nDistinctRandomInts(colCount * rowCount, n).map(
        (num) => toRowAndCol(num, colCount));
}
function neighbourCells(cell) {
    const result = [];
    for (let m = cell.i - 1; m <= cell.i + 1; ++m) {
        for (let n = cell.j - 1; n <= cell.j + 1; ++n) {
            if (0 <= m && m < cell.game.length && 0 <= n && n < cell.game[m].length) {
                const thisCell = cell.game[m][n];
                if (thisCell !== cell) {
                    result.push(thisCell);
                }
            }
        }
    }
    return result;
}
function makeGame(rowCount, columnCount, mineCount) {
    const game = new Array(rowCount).fill(null).map((_, i) => new Array(columnCount).fill(null).map((_, j) => ({ mineCount: 0, markedMine: false, revealed: false, i, j})));
    game.forEach((row) => row.forEach((cell) => { cell.game = game; }));
    const mineLocations = randomCellIndexes(rowCount, columnCount, mineCount);
    mineLocations.forEach(([i, j]) => {
        let cell = game[i][j];
        cell.isMine = true;
        neighbourCells(cell).forEach((cell) => {
           ++cell.mineCount;
        })
    });
    game.remainingMines = mineCount;
    // console.log(randomCellIndexes(rowCount, columnCount, mineCount));
    return game;
    // console.log(game);
}

function printCell(cell, revealed) {
    const text = cell.isMine ? 'X' : cell.mineCount;
    if (cell.game.revealed || revealed) {
        return text;
    } else {
        return cell.revealed ? text : (cell.markedMine ? '*' : ' ');
    }
}

function printGame(game, revealed) {
    game.forEach((row) => {
        console.log(row.map((cell) => {
            return printCell(cell, revealed);
        }).join(' '));
    });
}
function toggleCellMarkMineIndex(game, i, j) {
    const cell = game[i][j];
    toggleCellMarkMine(cell);
}
function toggleCellMarkMine(cell) {
    if (cell.revealed) {
        return false;
    }
    cell.markedMine = !cell.markedMine;
    game.remainingMines += (cell.markedMine ? -1 : 1);
    printGame(cell.game);
    return true;
}
function checkGameSuccess(game) {
    if (game.some((row) => row.some((cell) => !cell.isMine && !cell.revealed))) {
        game.revealed = false;
        return;
    }
    console.log('GameSuccess!');
    game.revealed = true;
}
function clickCellIndex(game, i, j) {
    const cell = game[i][j];
    clickCell(cell, true);
}
function clickCell(cell, root = false) {
    if ((cell.revealed && cell.mineCount === 0) || cell.markedMine) {
        return;
    }
    if (cell.isMine) {
        // console.log('ClickMine');
        console.log('GameFailure!');
        cell.game.revealed = true;
    } else {
        cell.revealed = true;
        const neighbours = neighbourCells(cell);
        if (cell.mineCount === 0) {
            neighbours.forEach((cell) => {
                clickCell(cell);
            })
        } else if (root) {
            const unmarkedCells = neighbours.filter((cell) => !cell.markedMine);
            if (unmarkedCells.length === neighbours.length - cell.mineCount) {
                unmarkedCells.filter((cell) => !cell.revealed && !cell.isMine).forEach(clickCell);
            } else {
                console.log(neighbours.length, cell.mineCount, unmarkedCells.length);
            }
        }
        if (root) {
            checkGameSuccess(cell.game);
            printGame(cell.game);
        }
    }
}
// let game = makeGame(16,16, 40);
// printGame(game, true);
// printGame(game);
// checkGameSuccess(game);
// markMine(game, 2, 2);
// clickCellIndex(game, 1, 1);
// clickCell(game, 1, 2);
// printGame(game);
//
// module.exports = {
//     makeGame,
//     clickCellIndex,
//     printGame,
//     checkGameSuccess,
// }
