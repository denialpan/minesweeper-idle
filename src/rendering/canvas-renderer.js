(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createCanvasRenderer = (
        canvas,
        sprites = namespace.sprites,
    ) => {
        let latestState = null;

        const tileForCell = (cell) => {
            if (cell.state === "revealed") {
                return sprites.numbers[cell.adjacentMines];
            }

            if (cell.state === "flagged") {
                return sprites.flagged;
            }

            if (cell.state === "question") {
                return sprites.question;
            }

            if (cell.state === "mine") {
                return sprites.mine;
            }

            if (cell.state === "hit-mine") {
                return sprites.hitMine;
            }

            if (cell.state === "wrong-flag") {
                return sprites.wrongFlag;
            }

            return sprites.covered;
        };

        const draw = () => {
            if (
                !latestState ||
                !sprites.textureMap.complete ||
                sprites.textureMap.naturalWidth === 0
            ) {
                return;
            }

            const { tileSize } = sprites;
            const requiredWidth = latestState.width * tileSize;
            const requiredHeight = latestState.height * tileSize;

            if (canvas.width !== requiredWidth) {
                canvas.width = requiredWidth;
            }

            if (canvas.height !== requiredHeight) {
                canvas.height = requiredHeight;
            }

            const context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);

            latestState.cells.forEach((cell, index) => {
                const tile = tileForCell(cell);
                const column = index % latestState.width;
                const row = Math.floor(index / latestState.width);

                context.drawImage(
                    tile.image,
                    tile.x,
                    tile.y,
                    tile.width,
                    tile.height,
                    column * tileSize,
                    row * tileSize,
                    tileSize,
                    tileSize,
                );
            });
        };

        const render = (state) => {
            latestState = state;
            draw();
        };

        sprites.textureMap.addEventListener("load", draw);

        return Object.freeze({ render });
    };
})();
