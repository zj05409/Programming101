const pieceCodes = 'TJLOSZI';
const pieces = new Map([
    ['I', [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ]],
    ['L', [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2],
    ]],
    ['J', [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0],
    ]],
    ['O', [
        [4, 4],
        [4, 4],
    ]],
    ['Z', [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
    ]],
    ['S', [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
    ]],
    ['T', [
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0],
    ]],
]);

const colors = [
    '#000000',
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const [UP, DOWN, LEFT, RIGHT, ROTATE, BOTTOM] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'ROTATE', 'BOTTOM'];

const keyCodeToAction = {
    37: LEFT,
    81: UP,
    39: RIGHT,
    40: DOWN,
    38: ROTATE,
    32: BOTTOM,
};

const ACTION_OFFSET = {
    [UP]: { x: 0, y: -1 },
    [DOWN]: { x: 0, y: 1 },
    [LEFT]: { x: -1, y: 0 },
    [RIGHT]: { x: 1, y: 0 },
    [ROTATE]: { x: 0, y: 0 },
    [BOTTOM]: { x: 0, y: 1 },
}

const [ARENA_WIDTH, ARENA_HEIGHT] = [12, 20];

const ZERO_OFFSET = { x: 0, y: 0 };

function deepCloneMatrix(matrixToClone) {
    return matrixToClone.map(row => [...row]);
}

function deepClonePosition({ x, y }) {
    return { x, y };
}

function deepClonePlayer({ pos, matrix, score }) {
    return {
        pos: deepClonePosition(pos),
        matrix: deepCloneMatrix(matrix),
        score,
    };
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// 1, -1, 2, -2, ...
function createZigZagSequence(max) {
    const result = [];
    for (let i = 1; i < max / 2 + 1; i++) {
        result.push(i, -i);
        // result.push(i * (i % 2 ? 1 : -1));
    }
    return result;
}

// 主界面
let arena = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);

// 当前操作的方块
let player = {
    pos: deepClonePosition(ZERO_OFFSET),
    matrix: null,
    score: 0,
};

// 偏移序列，方块旋转受阻时，尝试左右移动，找到空隙时用。
let zigzagSeq = null;

// 判断两个矩阵是否重叠
function matrixCollide(matrix1, offset1, matrix2, offset2 = ZERO_OFFSET) {
    return matrix1.some(
        (row, y) =>
            row.some(
                (value, x) =>
                    value !== 0 &&
                    (y + offset1.y - offset2.y < 0 || y + offset1.y - offset2.y >= matrix2.length ||
                        x + offset1.x - offset2.x < 0 || x + offset1.x - offset2.x >= matrix2[0].length ||
                        matrix2[y + offset1.y - offset2.y][x + offset1.x - offset2.x] !== 0)));
}

// 合并两个矩阵，第一个小，第二个大
function matrixMerge(matrix1, offset1, matrix2, offset2 = ZERO_OFFSET) {
    matrix1.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                matrix2[y + offset1.y - offset2.y][x + offset1.x - offset2.x] = value;
            }
        });
    });
}

// 旋转一个矩阵
function matrixRotate(matrix, clockwise = true) {
    const size = matrix.length;
    const indexes = matrix.map((_value, index) => index);
    function column(n) {
        return matrix.map((row) => row[n]);
    }
    return indexes.map((i) => clockwise ? column(i).reverse() : column(size - i));
};

// 判断主界面和当前方块是否重叠
function collide(arena, player) {
    return matrixCollide(player.matrix, player.pos, arena);
}

// 把当前方块合并到主界面
function merge(arena, player) {
    matrixMerge(player.matrix, player.pos, arena);
}

// 消除完整行
function arenaSweep() {
    const notFullRows = arena.filter((row) => row.includes(0));
    const fullRows = createMatrix(ARENA_WIDTH, arena.length - notFullRows.length);
    arena = [...fullRows, ...notFullRows];
    player.score += fullRows.length ? Math.pow(2, fullRows.length) * 10 : 0;
}

// 移动当前方块
function playerMove(offset) {
    const originalPlayerPos = deepClonePosition(player.pos);
    player.pos.x += offset.x;
    player.pos.y += offset.y;
    if (collide(arena, player)) {
        player.pos = originalPlayerPos;
        return true;
    }
    return false;

}

// 重建当前方块
function playerReset() {
    player.matrix = deepCloneMatrix(
        pieces.get(pieceCodes[pieceCodes.length * Math.random() | 0])
    );
    zigzagSeq = createZigZagSequence(player.matrix.length);
    player.pos.y = 0;
    player.pos.x = (arena[0].length - player.matrix[0].length) / 2 | 0;
    if (collide(arena, player)) {
        arena = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);
        player.score = 0;
    }
}

// 旋转当前方块
function playerRotate(force = false) {
    const originalMatrix = player.matrix;
    player.matrix = matrixRotate(player.matrix, true);
    if (force) {
        return false;
    }
    if (collide(arena, player)) {
        player.matrix = originalMatrix;
        return true;
    }
    return false;
}

// 方块旋转后如果与主界面冲突，则左右调整位置，尝试找到空隙
function playerAdjustOnCollide() {
    for (let i = 0; i < zigzagSeq.length; ++i) {
        if (!playerMove({ x: zigzagSeq[i], y: 0 })) {
            return true;
        };
    }
    return false;
}

// 当前方块执行各种操作。
function playerAction(action) {
    let collided = false;
    switch (action) {
        case LEFT: case RIGHT: case UP:
            collided = playerMove(ACTION_OFFSET[action]);
            return false;
        case DOWN:
            collided = playerMove(ACTION_OFFSET[action]);
            if (collided) {
                merge(arena, player);
                arenaSweep();
                return true;
            }
            return false;
        case BOTTOM:
            while (!collided) {
                collided = playerMove(ACTION_OFFSET[action]);
            }
            merge(arena, player);
            arenaSweep();
            return true;
        case ROTATE:
            collided = playerRotate();
            if (collided) {
                const originalPlayer = deepClonePlayer(player);
                playerRotate(true);
                const adjusted = playerAdjustOnCollide();
                if (!adjusted) {
                    player = originalPlayer;
                }
                return false;
            }
            return false;
    }
}

// 初始化画布
const canvas = document.getElementById('tetris');
// 初始化画笔
// @ts-ignore
const context = canvas.getContext('2d');

// 自动下落的时间间隔毫秒数
const dropInterval = 1000;

// 下落间隔时间累加器
let dropCounter = 0;

// 上次刷新画面的时间
let lastTime = 0;

// 画布放大20*20
context.scale(20, 20);

// 画一个矩形
function drawMatrix(matrix, offset = ZERO_OFFSET) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// 画分数
function drawScore() {
    // @ts-ignore
    document.getElementById('score').innerHTML = player.score;
}

// 画出整个游戏画面
function draw() {
    context.fillStyle = colors[0];
    // @ts-ignore
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena);
    drawMatrix(player.matrix, player.pos);
    drawScore();
}

// 重画整个画面
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        const playerMerged = playerAction(DOWN);
        if (playerMerged) {
            playerReset();
            dropCounter = 0;
        }
        dropCounter = 0;
    }

    lastTime = time;
    draw();
    requestAnimationFrame(update);
}

// 监听键盘按键，执行相应操作
document.addEventListener('keydown', event => {
    const action = keyCodeToAction[event.keyCode];
    if (action) {
        const playerMerged = playerAction(action);
        if (playerMerged) {
            playerReset();
            dropCounter = 0;
        }
    }
});

// 新建当前方块，并绘制画面
playerReset();
update();
