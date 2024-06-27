// life-worker.js
// Обновление поколения
function updateGrid(grid, width, height) {
    const newGrid = grid.slice(); // Используем существующий массив как буфер
    const totalCells = width * height;

    for (let idx = 0; idx < totalCells; idx++) {
        const x = idx % width;
        const y = Math.floor(idx / width);
        const neighbors = countNeighbors(grid, x, y, width, height);
        const alive = grid[idx];

        // Правила игры "Жизнь"
        newGrid[idx] = alive && (neighbors === 2 || neighbors === 3) || !alive && neighbors === 3 ? 1 : 0;
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

// Обработчик сообщений от основного потока
self.onmessage = function(event) {
    const { grid, width, height } = event.data;
    const newGrid = updateGrid(grid, width, height);
    postMessage(newGrid);
};
