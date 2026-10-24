(() => {
    const namespace = window.MinesweeperIdle;
    const { config } = namespace;
    const minesweeperCanvas = document.getElementById("minesweeper");
    const gameElement = document.getElementById("game");
    const actionConsoleElement = document.getElementById("action-console");
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
    const unlockRandomSolverButton = document.getElementById(
        "unlock-random-solver",
    );
    const unlockAutoResetButton = document.getElementById(
        "unlock-auto-reset",
    );
    const solverEnabledInput = document.getElementById("solver-enabled");
    const autoResetEnabledInput = document.getElementById(
        "auto-reset-enabled",
    );
    const game = namespace.createMinesweeperGame();
    const progression = namespace.createProgressionStore();
    const renderer = namespace.createCanvasRenderer(minesweeperCanvas);
    const actionConsole = namespace.createActionConsole(
        actionConsoleElement,
    );
    const solver = namespace.createRandomSolver({
        getState: game.getPublicState,
        applyAction: game.applyAction,
    });
    let currentZoom = config.zoom;
    let defaultZoom = config.defaultZoom;
    let rewardApplied = false;
    let autoResetTimeoutId = null;

    const cancelAutoReset = () => {
        if (autoResetTimeoutId !== null) {
            clearTimeout(autoResetTimeoutId);
            autoResetTimeoutId = null;
        }
    };

    const scheduleAutoReset = () => {
        cancelAutoReset();

        const autoResetUnlocked = (
            progression.getSnapshot().unlocks.autoBoardReset
        );
        const gameFinished = game.getPublicState().status !== "playing";

        if (
            autoResetUnlocked &&
            config.autoResetEnabled &&
            gameFinished
        ) {
            autoResetTimeoutId = setTimeout(() => {
                autoResetTimeoutId = null;
                game.reset();
            }, 1000);
        }
    };

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
            cancelAutoReset();
            rewardApplied = false;
            gameResultMessage.textContent = "";
            gameResult.hidden = true;
            return;
        }

        if (!rewardApplied) {
            const { reward } = progression.recordGame(state.result);

            if (state.status === "won") {
                const completionReward = (
                    namespace.progressionRules
                        .calculateBoardCompletionReward(
                            state.result.startingMines,
                        )
                );

                actionConsole.log(
                    "successfully defused! " + `+${state.result.correctlyFlagged}, bonus ` + `+${completionReward}.`
                );
            } else {
                const loss = Math.max(0, -reward);

                actionConsole.log(
                    `mine hit! it blew up ${loss} mines from your supply.`,
                );
            }

            rewardApplied = true;
        }

        gameResultMessage.textContent = state.status === "won"
            ? "you win!"
            : "you lost.";
        gameResult.hidden = false;
        scheduleAutoReset();
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
        cancelAutoReset();
        game.reset();
    });

    unlockRandomSolverButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("randomSolver")) {
            actionConsole.log("Upgrade purchased - random solver unlocked.");
        }
    });

    unlockAutoResetButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoBoardReset")) {
            actionConsole.log("Upgrade purchased - auto reset unlocked.");
            scheduleAutoReset();
        }
    });

    solverEnabledInput.addEventListener("change", () => {
        config.setSolverEnabled(
            solverEnabledInput.checked,
        );
        const solverUnlocked = (
            progression.getSnapshot().unlocks.randomSolver
        );

        if (solverUnlocked && config.solverEnabled) {
            solver.start();
        } else {
            solver.stop();
        }
    });

    autoResetEnabledInput.addEventListener("change", () => {
        config.setAutoResetEnabled(autoResetEnabledInput.checked);

        if (config.autoResetEnabled) {
            scheduleAutoReset();
        } else {
            cancelAutoReset();
        }
    });

    namespace.createMouseController(
        minesweeperCanvas,
        game.getPublicState,
        game.applyAction,
    );

    progression.subscribe((state) => {
        const solverUnlocked = state.unlocks.randomSolver;
        const autoResetUnlocked = state.unlocks.autoBoardReset;
        minesDefusedOutput.value = state.currencies.minesDefused;
        unlockRandomSolverButton.hidden = solverUnlocked;
        unlockRandomSolverButton.disabled = (
            !progression.canPurchaseUpgrade("randomSolver")
        );
        unlockAutoResetButton.hidden = autoResetUnlocked;
        unlockAutoResetButton.disabled = (
            !progression.canPurchaseUpgrade("autoBoardReset")
        );
        solverEnabledInput.disabled = !solverUnlocked;
        solverEnabledInput.checked = config.solverEnabled;
        autoResetEnabledInput.disabled = !autoResetUnlocked;
        autoResetEnabledInput.checked = config.autoResetEnabled;

        if (solverUnlocked && config.solverEnabled) {
            solver.start();
        } else {
            solver.stop();
        }

        if (!autoResetUnlocked) {
            cancelAutoReset();
        }
    });
    game.subscribe(updateView);
    updateCanvasZoom(currentZoom);
    updateResetZoomTitle();
})();
