const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let width = parseInt(document.getElementById('width').value);
let height = parseInt(document.getElementById('height').value);
let cellSize = 1;

canvas.width = width * cellSize;
canvas.height = height * cellSize;

let gameGrid = createGrid(width, height);
let prevGrid = createGrid(width, height); // Массив для хранения состояния предыдущего поколения
let isRunning = false;
let isDrawing = false;
let prevX = -1;
let prevY = -1;

// Основной игровой цикл
function gameLoop() {
    if (isRunning) {
        const start = performance.now();
        prevGrid = gameGrid.slice();
        gameGrid = updateGrid(gameGrid, width, height);
        drawGrid(gameGrid, prevGrid, width, height);
        const end = performance.now();
        document.getElementById('generation-time').innerText = `Время генерации: ${(end - start).toFixed(2)} мс`;
        requestAnimationFrame(gameLoop);
    }
}

// Создание пустой сетки
function createGrid(width, height) {
    return new Uint8Array(width * height);
}

function updateCellSize(width, height) {
    const maxCanvasSize = 500; // Максимальный размер холста (ширина или высота)
    const maxCellSize = 10;     // Максимальный размер клетки
    const minCellSize = 1;      // Минимальный размер клетки
    
    const largerDimension = Math.max(width, height);
    const cellSize = Math.max(minCellSize, Math.min(maxCellSize, Math.floor(maxCanvasSize / largerDimension)));
    return cellSize;
}

// Отображение сетки
function drawGrid(grid, prevGrid, width, height) {
    const imageData = ctx.createImageData(width * cellSize, height * cellSize);
    const data = imageData.data;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const color = grid[idx] ? 0 : 255;
            for (let dy = 0; dy < cellSize; dy++) {
                for (let dx = 0; dx < cellSize; dx++) {
                    const pixelIndex = 4 * ((y * cellSize + dy) * width * cellSize + (x * cellSize + dx));
                    data[pixelIndex] = color;
                    data[pixelIndex + 1] = color;
                    data[pixelIndex + 2] = color;
                    data[pixelIndex + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// Генерация случайного первого поколения
function generateRandomGrid(width, height) {
    prevGrid = gameGrid.slice();
    for (let i = 0; i < width * height; i++) {
        gameGrid[i] = Math.random() > 0.8 ? 1 : 0;
    }
    drawGrid(gameGrid, prevGrid, width, height);
}

// Обновление поколения
function updateGrid(grid, width, height) {
    const newGrid = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const neighbors = countNeighbors(grid, x, y, width, height);
            if (grid[idx]) {
                newGrid[idx] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                newGrid[idx] = neighbors === 3 ? 1 : 0;
            }
        }
    }
    return newGrid;
}

// Подсчет соседей с учетом эмуляции тора
function countNeighbors(grid, x, y, width, height) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = (x + i + width) % width;
            const ny = (y + j + height) % height;
            count += grid[ny * width + nx];
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
    cellSize = updateCellSize(width, height);
    canvas.width = width * cellSize;
    prevGrid = gameGrid.slice();
    gameGrid = createGrid(width, height);
    drawGrid(gameGrid, prevGrid, width, height);
});

document.getElementById('height').addEventListener('change', (e) => {
    height = parseInt(e.target.value);
    cellSize = updateCellSize(width, height);
    canvas.height = height * cellSize;
    prevGrid = gameGrid.slice();
    gameGrid = createGrid(width, height);
    drawGrid(gameGrid, prevGrid, width, height);
});

// Генерация случайного заполнения
document.getElementById('generate-random').addEventListener('click', () => {
    generateRandomGrid(width, height);
});

// Очистка поля
document.getElementById('clear').addEventListener('click', () => {
    prevGrid = gameGrid.slice();
    gameGrid = createGrid(width, height);
    drawGrid(gameGrid, prevGrid, width, height);
});

// Обработка событий мыши для рисования
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    updateCellState(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        updateCellState(e, true);
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

function updateCellState(e, isMove = false) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize);

    if (x >= 0 && x < width && y >= 0 && y < height) {
        if (!isMove || (x !== prevX || y !== prevY)) {
            const idx = y * width + x;
            prevGrid = gameGrid.slice();
            gameGrid[idx] = gameGrid[idx] ? 0 : 1;
            drawGrid(gameGrid, prevGrid, width, height);
        }
        prevX = x;
        prevY = y;
    }
}

// Инициализация
drawGrid(gameGrid, prevGrid, width, height);