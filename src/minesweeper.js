const GRID_SIZE = 9;
const MINE_COUNT = 10;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

const mineLocations = new Set();

while (mineLocations.size < MINE_COUNT) {
    mineLocations.add(Math.floor(Math.random() * CELL_COUNT));
}

const mineGrid = Array.from(
    { length: CELL_COUNT },
    (_, index) => mineLocations.has(index),
);
const revealedCells = Array(CELL_COUNT).fill(false);
const cellMarks = Array(CELL_COUNT).fill(null);
let gameOver = false;
let hitMineIndex = -1;

const numberTiles = [
    tile_0,
    tile_1,
    tile_2,
    tile_3,
    tile_4,
    tile_5,
    tile_6,
    tile_7,
    tile_8,
];

const countAdjacentMines = (index) => {
    const column = index % GRID_SIZE;
    const row = Math.floor(index / GRID_SIZE);
    let adjacentMines = 0;

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            if (rowOffset === 0 && columnOffset === 0) {
                continue;
            }

            const adjacentColumn = column + columnOffset;
            const adjacentRow = row + rowOffset;

            if (
                adjacentColumn >= 0 &&
                adjacentColumn < GRID_SIZE &&
                adjacentRow >= 0 &&
                adjacentRow < GRID_SIZE
            ) {
                const adjacentIndex = adjacentRow * GRID_SIZE + adjacentColumn;
                adjacentMines += Number(mineGrid[adjacentIndex]);
            }
        }
    }

    return adjacentMines;
};

const getAdjacentIndexes = (index) => {
    const column = index % GRID_SIZE;
    const row = Math.floor(index / GRID_SIZE);
    const adjacentIndexes = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            if (rowOffset === 0 && columnOffset === 0) {
                continue;
            }

            const adjacentColumn = column + columnOffset;
            const adjacentRow = row + rowOffset;

            if (
                adjacentColumn >= 0 &&
                adjacentColumn < GRID_SIZE &&
                adjacentRow >= 0 &&
                adjacentRow < GRID_SIZE
            ) {
                adjacentIndexes.push(adjacentRow * GRID_SIZE + adjacentColumn);
            }
        }
    }

    return adjacentIndexes;
};

const revealCell = (index) => {
    if (
        gameOver ||
        revealedCells[index] ||
        cellMarks[index] === "flag"
    ) {
        return;
    }

    if (mineGrid[index]) {
        gameOver = true;
        hitMineIndex = index;
        return;
    }

    revealedCells[index] = true;

    if (countAdjacentMines(index) === 0) {
        getAdjacentIndexes(index).forEach(revealCell);
    }
};

const tileForCell = (index) => {
    if (gameOver) {
        if (mineGrid[index]) {
            return index === hitMineIndex ? tile_mine_hit : tile_mine;
        }

        if (cellMarks[index] === "flag") {
            return tile_mine_wrong;
        }

        return numberTiles[countAdjacentMines(index)];
    }

    if (revealedCells[index]) {
        return numberTiles[countAdjacentMines(index)];
    }

    if (cellMarks[index] === "flag") {
        return tile_flag;
    }

    if (cellMarks[index] === "question") {
        return tile_questionable_blank;
    }

    return tile_blank;
};

const renderMineGrid = () => {
    const canvas = document.getElementById("minesweeper");
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    mineGrid.forEach((_, index) => {
        const tile = tileForCell(index);
        const column = index % GRID_SIZE;
        const row = Math.floor(index / GRID_SIZE);

        context.drawImage(
            tile.image,
            tile.x,
            tile.y,
            tile.width,
            tile.height,
            column * TILE_SIZE,
            row * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
        );
    });
};

const cellIndexFromMouseEvent = (event) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const column = Math.floor(
        ((event.clientX - bounds.left) * canvas.width) /
            bounds.width /
            TILE_SIZE,
    );
    const row = Math.floor(
        ((event.clientY - bounds.top) * canvas.height) /
            bounds.height /
            TILE_SIZE,
    );

    return row * GRID_SIZE + column;
};

const chordCell = (index) => {
    if (gameOver || !revealedCells[index] || mineGrid[index]) {
        return;
    }

    const adjacentIndexes = getAdjacentIndexes(index);
    const adjacentFlags = adjacentIndexes.filter(
        (adjacentIndex) => cellMarks[adjacentIndex] === "flag",
    ).length;

    if (adjacentFlags !== countAdjacentMines(index)) {
        return;
    }

    for (const adjacentIndex of adjacentIndexes) {
        if (cellMarks[adjacentIndex] !== "flag") {
            revealCell(adjacentIndex);
        }
    }
};

const minesweeperCanvas = document.getElementById("minesweeper");
const game = document.getElementById("game");
const zoomInput = document.getElementById("zoom-input");
const resetZoomButton = document.getElementById("reset-zoom");
const setDefaultZoomButton = document.getElementById("set-default-zoom");
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
let currentZoom = 1;
let defaultZoom = 1;

const updateCanvasZoom = (requestedZoom, formatInput = true) => {
    const boundedZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, requestedZoom),
    );
    const zoom = Math.trunc(boundedZoom * 100 + 1e-9) / 100;
    const formattedZoom = zoom.toFixed(2);
    currentZoom = zoom;

    if (formatInput) {
        zoomInput.value = formattedZoom;
    }

    minesweeperCanvas.style.width = `${minesweeperCanvas.width * zoom}px`;
    minesweeperCanvas.style.height = `${minesweeperCanvas.height * zoom}px`;
    game.style.width = `${minesweeperCanvas.width * zoom}px`;
    game.style.setProperty("--control-scale", Math.min(1, zoom));
};

zoomInput.addEventListener("input", () => {
    if (zoomInput.value !== "" && zoomInput.validity.valid) {
        updateCanvasZoom(zoomInput.valueAsNumber, false);
    }
});

zoomInput.addEventListener("change", () => {
    if (Number.isFinite(zoomInput.valueAsNumber)) {
        updateCanvasZoom(zoomInput.valueAsNumber);
    } else {
        updateCanvasZoom(currentZoom);
    }
});

resetZoomButton.addEventListener("click", () => {
    updateCanvasZoom(defaultZoom);
});

setDefaultZoomButton.addEventListener("click", () => {
    defaultZoom = currentZoom;
    resetZoomButton.title = `Reset zoom to ${defaultZoom.toFixed(2)}×`;
});

updateCanvasZoom(currentZoom);

minesweeperCanvas.addEventListener("mousedown", (event) => {
    if (event.button !== 0 && event.button !== 1) {
        return;
    }

    event.preventDefault();
    const index = cellIndexFromMouseEvent(event);

    if (event.button === 0) {
        revealCell(index);
    } else {
        chordCell(index);
    }

    renderMineGrid();
});

minesweeperCanvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    if (gameOver) {
        return;
    }

    const index = cellIndexFromMouseEvent(event);

    if (revealedCells[index]) {
        return;
    }

    if (cellMarks[index] === null) {
        cellMarks[index] = "flag";
    } else if (cellMarks[index] === "flag") {
        cellMarks[index] = "question";
    } else {
        cellMarks[index] = null;
    }

    renderMineGrid();
});

minesweeperCanvas.addEventListener("auxclick", (event) => {
    if (event.button === 1) {
        event.preventDefault();
    }
});

if (textureMap.complete) {
    renderMineGrid();
} else {
    textureMap.addEventListener("load", renderMineGrid, { once: true });
}
