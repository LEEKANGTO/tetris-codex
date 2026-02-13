const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const restartBtn = document.getElementById('restart');

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;

const colors = {
  I: '#00d1ff',
  O: '#ffd84d',
  T: '#bf7bff',
  S: '#53e08a',
  Z: '#ff6b6b',
  J: '#5aa0ff',
  L: '#ffa14f'
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

function makeBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
}

let board;
let current;
let score;
let level;
let lines;
let gameOver;
let dropCounter;
let lastTime;

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  const shape = SHAPES[type].map(row => [...row]);
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0
  };
}

function collides(piece, xOffset = 0, yOffset = 0, shape = piece.shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = piece.x + x + xOffset;
      const ny = piece.y + y + yOffset;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function mergePiece() {
  for (let y = 0; y < current.shape.length; y++) {
    for (let x = 0; x < current.shape[y].length; x++) {
      if (current.shape[y][x]) {
        const by = current.y + y;
        if (by < 0) {
          gameOver = true;
          return;
        }
        board[by][current.x + x] = current.type;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(''));
      cleared++;
      y++;
    }
  }

  if (cleared > 0) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared] * level;
    level = Math.floor(lines / 10) + 1;
    updateHud();
  }
}

function rotateMatrix(matrix) {
  const h = matrix.length;
  const w = matrix[0].length;
  const rotated = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      rotated[x][h - y - 1] = matrix[y][x];
    }
  }
  return rotated;
}

function rotatePiece() {
  const rotated = rotateMatrix(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const offset of kicks) {
    if (!collides(current, offset, 0, rotated)) {
      current.x += offset;
      current.shape = rotated;
      return;
    }
  }
}

function hardDrop() {
  while (!collides(current, 0, 1)) {
    current.y++;
    score += 2;
  }
  lockPiece();
}

function lockPiece() {
  mergePiece();
  if (gameOver) return;
  clearLines();
  current = randomPiece();
  if (collides(current)) gameOver = true;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
  ctx.strokeStyle = '#0f1220';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function drawBoard() {
  ctx.fillStyle = '#13182a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) drawCell(x, y, colors[board[y][x]]);
    }
  }

  for (let y = 0; y < current.shape.length; y++) {
    for (let x = 0; x < current.shape[y].length; x++) {
      if (current.shape[y][x]) drawCell(current.x + x, current.y + y, colors[current.type]);
    }
  }

  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px system-ui';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '16px system-ui';
    ctx.fillText('다시 시작 버튼을 눌러주세요', canvas.width / 2, canvas.height / 2 + 25);
  }
}

function dropInterval() {
  return Math.max(100, 900 - (level - 1) * 70);
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;

  if (!gameOver && dropCounter > dropInterval()) {
    dropCounter = 0;
    if (!collides(current, 0, 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }

  drawBoard();
  requestAnimationFrame(update);
}

function reset() {
  board = makeBoard();
  current = randomPiece();
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  dropCounter = 0;
  lastTime = 0;
  updateHud();
}

document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  if (e.key === 'ArrowLeft' && !collides(current, -1, 0)) {
    current.x--;
  } else if (e.key === 'ArrowRight' && !collides(current, 1, 0)) {
    current.x++;
  } else if (e.key === 'ArrowDown') {
    if (!collides(current, 0, 1)) {
      current.y++;
      score += 1;
      updateHud();
    }
  } else if (e.key === 'ArrowUp') {
    rotatePiece();
  } else if (e.key === ' ') {
    e.preventDefault();
    hardDrop();
    updateHud();
  }
});

restartBtn.addEventListener('click', reset);

reset();
update();
