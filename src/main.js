(() => {
    const namespace = window.MinesweeperIdle;
    const { config } = namespace;
    const minesweeperCanvas = document.getElementById("minesweeper");
    const gameElement = document.getElementById("game");
    const minesDefusedOutput = document.getElementById("mines-defused");
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
    const solverEnabledInput = document.getElementById("solver-enabled");
    const game = namespace.createMinesweeperGame();
    const economy = namespace.createMinesEconomy();
    const renderer = namespace.createCanvasRenderer(minesweeperCanvas);
    const solver = namespace.createRandomSolver({
        getState: game.getPublicState,
        applyAction: game.applyAction,
    });
    let currentZoom = config.zoom;
    let defaultZoom = config.defaultZoom;
    let rewardApplied = false;

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

        if (state.status === "playing") {
            rewardApplied = false;
            gameResultMessage.textContent = "";
            gameResult.hidden = true;
            return;
        }

        if (!rewardApplied) {
            economy.addMinesDefused(state.minesDefusedReward);
            rewardApplied = true;
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

    solverEnabledInput.addEventListener("change", () => {
        const enabled = config.setSolverEnabled(
            solverEnabledInput.checked,
        );

        if (enabled) {
            solver.start();
        } else {
            solver.stop();
        }
    });

    namespace.createMouseController(
        minesweeperCanvas,
        game.getPublicState,
        game.applyAction,
    );

    economy.subscribe((minesDefused) => {
        minesDefusedOutput.value = minesDefused;
    });
    game.subscribe(updateView);
    updateCanvasZoom(currentZoom);
    updateResetZoomTitle();
    solverEnabledInput.checked = config.solverEnabled;

    if (config.solverEnabled) {
        solver.start();
    }
})();
