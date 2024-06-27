const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let width = parseInt(document.getElementById('width').value);
let height = parseInt(document.getElementById('height').value);
let cellSize = 10;

canvas.width = width * cellSize;
canvas.height = height * cellSize;

let gameGrid = createGrid(width, height);
let isRunning = false;
let isDrawing = false;
let prevX = -1;
let prevY = -1;

// Основной игровой цикл
function gameLoop() {
    if (isRunning) {
        const start = performance.now();
        gameGrid = updateGrid(gameGrid);
        //drawGrid(gameGrid);
        const end = performance.now();
        document.getElementById('generation-time').innerText = `Время генерации: ${(end - start).toFixed(2)} мс`;
        requestAnimationFrame(gameLoop);
    }
}

// Создание пустой сетки
function createGrid() {
    let grid = new Array(height);
    for (let y = 0; y < height; y++) {
        grid[y] = new Array(width).fill(0);
    }
    return grid;
}

// Отображение сетки
function drawGrid(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            ctx.strokeStyle = 'lightgray';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[y][x] ? 'black' : 'white';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

// Генерация случайного первого поколения
function generateRandomGrid() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            gameGrid[y][x] = Math.random() > 0.8 ? 1 : 0;
        }
    }
    drawGrid(gameGrid);
}

// Обновление поколения
function updateGrid(grid) {
    const newGrid = createGrid();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const neighbors = countNeighbors(grid, x, y);
            if (grid[y][x]) {
                newGrid[y][x] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                newGrid[y][x] = neighbors === 3 ? 1 : 0;
            }
        }
    }
    return newGrid;
}

// Подсчет соседей с учетом эмуляции тора
function countNeighbors(grid, x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = (x + i + width) % width;
            const ny = (y + j + height) % height;
            count += grid[ny][nx];
        }
    }
    return count;
}

// Запуск симуляции
const startStopBtn = document.getElementById('start-stop-simulation');
document.getElementById('start-stop-simulation').addEventListener('click', () => {
    isRunning = !isRunning;
    if (isRunning) {
        startStopBtn.classList.remove('green-btn');
        startStopBtn.classList.add('red-btn');
        startStopBtn.innerHTML = 'Стоп';
        gameLoop();
    } else {
        startStopBtn.classList.remove('red-btn');
        startStopBtn.classList.add('green-btn');
        startStopBtn.innerHTML = 'Старт';
    }
});

// Изменение размера поля
document.getElementById('width').addEventListener('change', (e) => {
    width = parseInt(e.target.value);
    canvas.width = width * cellSize;
    gameGrid = createGrid();
    drawGrid(gameGrid);
});

document.getElementById('height').addEventListener('change', (e) => {
    height = parseInt(e.target.value);
    canvas.height = height * cellSize;
    gameGrid = createGrid();
    drawGrid(gameGrid);
});

// Генерация случайного заполнения
document.getElementById('generate-random').addEventListener('click', () => {
    generateRandomGrid();
});

// Очистка поля
document.getElementById('clear').addEventListener('click', () => {
    gameGrid = createGrid();
    drawGrid(gameGrid);
});

// Обработка событий мыши для рисования
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    updateCellState(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        updateCellState(e);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    prevX = -1;
    prevY = -1;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    prevX = -1;
    prevY = -1;
});

function updateCellState(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize);

    if (x !== prevX || y !== prevY) {
        gameGrid[y][x] = gameGrid[y][x] ? 0 : 1;
        drawGrid(gameGrid);
        prevX = x;
        prevY = y;
    }
}

// Инициализация
drawGrid(gameGrid);
