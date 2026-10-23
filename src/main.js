(() => {
    const namespace = window.MinesweeperIdle;
    const { config } = namespace;
    const minesweeperCanvas = document.getElementById("minesweeper");
    const gameElement = document.getElementById("game");
    const tilesClickedOutput = document.getElementById("tiles-clicked");
    const gameResult = document.getElementById("game-result");
    const gameResultMessage = document.getElementById(
        "game-result-message",
    );
    const resetGameButton = document.getElementById("reset-game");
    const zoomInput = document.getElementById("zoom-input");
    const resetZoomButton = document.getElementById("reset-zoom");
    const setDefaultZoomButton = document.getElementById(
        "set-default-zoom",
    );
    const game = namespace.createMinesweeperGame();
    const renderer = namespace.createCanvasRenderer(minesweeperCanvas);
    let currentZoom = config.zoom;
    let defaultZoom = config.defaultZoom;

    const updateResetZoomTitle = () => {
        resetZoomButton.title = (
            `Reset zoom to ${defaultZoom.toFixed(2)}\u00d7`
        );
    };

    const updateCanvasZoom = (requestedZoom, formatInput = true) => {
        const zoom = config.setZoom(requestedZoom);
        const formattedZoom = zoom.toFixed(2);
        currentZoom = zoom;

        if (formatInput) {
            zoomInput.value = formattedZoom;
        }

        const scaledWidth = minesweeperCanvas.width * zoom;
        const scaledHeight = minesweeperCanvas.height * zoom;
        minesweeperCanvas.style.width = `${scaledWidth}px`;
        minesweeperCanvas.style.height = `${scaledHeight}px`;
        gameElement.style.width = `${scaledWidth}px`;
        gameElement.style.setProperty(
            "--control-scale",
            Math.min(1, zoom),
        );
    };

    const updateView = (state) => {
        renderer.render(state);
        tilesClickedOutput.value = state.tilesClicked;

        if (state.status === "playing") {
            gameResultMessage.textContent = "";
            gameResult.hidden = true;
            return;
        }

        gameResultMessage.textContent = state.status === "won"
            ? "You win!"
            : "You lost!";
        gameResult.hidden = false;
    };

    zoomInput.min = config.minZoom;
    zoomInput.max = config.maxZoom;

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
        defaultZoom = config.setDefaultZoom(currentZoom);
        updateResetZoomTitle();
    });

    resetGameButton.addEventListener("click", () => {
        game.reset();
    });

    namespace.createMouseController(
        minesweeperCanvas,
        game.getPublicState,
        game.applyAction,
    );

    game.subscribe(updateView);
    updateCanvasZoom(currentZoom);
    updateResetZoomTitle();
})();
