(() => {
    const namespace = window.MinesweeperIdle;
    const { config } = namespace;
    const minesweeperCanvas = document.getElementById("minesweeper");
    const gameElement = document.getElementById("game");
    const boardColumn = document.getElementById("board-column");
    const actionConsoleElement = document.getElementById("action-console");
    const debugEnabledInput = document.getElementById("debug-enabled");
    const debugControls = document.getElementById("debug-controls");
    const debugResetSaveButton = document.getElementById(
        "debug-reset-save",
    );
    const debugForceWinButton = document.getElementById(
        "debug-force-win",
    );
    const debugForceLossButton = document.getElementById(
        "debug-force-loss",
    );
    const debugForceBadFlagsButton = document.getElementById(
        "debug-force-bad-flags",
    );
    const debugCurrencyInput = document.getElementById("debug-currency");
    const debugSetCurrencyButton = document.getElementById(
        "debug-set-currency",
    );
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
    const unlockSafeSolverButton = document.getElementById(
        "unlock-safe-solver",
    );
    const unlockAutoResetButton = document.getElementById(
        "unlock-auto-reset",
    );
    const unlockBoard9x9Button = document.getElementById(
        "unlock-board-9x9",
    );
    const unlockFirstClickSafeButton = document.getElementById(
        "unlock-first-click-safe",
    );
    const solverEnabledInput = document.getElementById("solver-enabled");
    const solverControl = document.getElementById("solver-control");
    const autoResetEnabledInput = document.getElementById(
        "auto-reset-enabled",
    );
    const autoResetControl = document.getElementById(
        "auto-reset-control",
    );
    const progression = namespace.createProgressionStore();
    const initialProgression = progression.getSnapshot();
    const initialBoardSize = initialProgression.unlocks.board9x9
        ? 9
        : 7;
    const initialMineCount = initialBoardSize === 9 ? 10 : 6;
    const game = namespace.createMinesweeperGame({
        width: initialBoardSize,
        height: initialBoardSize,
        mineCount: initialMineCount,
        firstRevealSafe: initialProgression.unlocks.firstClickSafe,
    });
    const renderer = namespace.createCanvasRenderer(minesweeperCanvas);
    const actionConsole = namespace.createActionConsole(
        actionConsoleElement,
    );
    const solver = namespace.createSafeSolver({
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

    const applyCanvasScale = (zoom) => {
        const scaledWidth = minesweeperCanvas.width * zoom;
        const scaledHeight = minesweeperCanvas.height * zoom;
        minesweeperCanvas.style.width = `${scaledWidth}px`;
        minesweeperCanvas.style.height = `${scaledHeight}px`;
        boardColumn.style.width = `${scaledWidth}px`;
        gameElement.style.setProperty(
            "--control-scale",
            Math.min(1, zoom),
        );
    };

    const updateCanvasZoom = (requestedZoom, formatInput = true) => {
        const zoom = config.setZoom(requestedZoom);
        const formattedZoom = zoom.toFixed(2);
        currentZoom = zoom;

        if (formatInput) {
            zoomInput.value = formattedZoom;
        }

        applyCanvasScale(zoom);
    };

    const updateView = (state) => {
        renderer.render(state);
        applyCanvasScale(currentZoom);

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

    debugEnabledInput.addEventListener("change", () => {
        debugControls.hidden = !debugEnabledInput.checked;
    });

    debugResetSaveButton.addEventListener("click", () => {
        const confirmed = window.confirm(
            "Reset all saved progression, currency, and upgrades?",
        );

        if (confirmed) {
            cancelAutoReset();
            config.reset();
            currentZoom = config.zoom;
            defaultZoom = config.defaultZoom;
            updateCanvasZoom(currentZoom);
            updateResetZoomTitle();
            progression.resetProgression();
            game.reset();
            actionConsole.log("Debug - local progression save reset.");
        }
    });

    debugForceWinButton.addEventListener("click", () => {
        game.debugForceWin();
    });

    debugForceLossButton.addEventListener("click", () => {
        game.debugForceLoss();
    });

    debugForceBadFlagsButton.addEventListener("click", () => {
        game.debugForceLoss(true);
    });

    debugSetCurrencyButton.addEventListener("click", () => {
        if (Number.isFinite(debugCurrencyInput.valueAsNumber)) {
            const currency = progression.setMinesDefused(
                debugCurrencyInput.valueAsNumber,
            );
            actionConsole.log(
                `Debug - mines defused set to ${currency}.`,
            );
        }
    });

    unlockSafeSolverButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("safeSolver")) {
            actionConsole.log("Upgrade purchased - safe solver unlocked.");
        }
    });

    unlockAutoResetButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoBoardReset")) {
            actionConsole.log("Upgrade purchased - auto reset unlocked.");
            scheduleAutoReset();
        }
    });

    unlockBoard9x9Button.addEventListener("click", () => {
        if (progression.purchaseUpgrade("board9x9")) {
            actionConsole.log("Upgrade purchased - 9x9 board unlocked.");
        }
    });

    unlockFirstClickSafeButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("firstClickSafe")) {
            actionConsole.log("Upgrade purchased - first click safe unlocked.");
        }
    });

    solverEnabledInput.addEventListener("change", () => {
        config.setSolverEnabled(
            solverEnabledInput.checked,
        );
        const solverUnlocked = (
            progression.getSnapshot().unlocks.safeSolver
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
        const solverUnlocked = state.unlocks.safeSolver;
        const autoResetUnlocked = state.unlocks.autoBoardReset;
        const board9x9Unlocked = state.unlocks.board9x9;
        const firstClickSafeUnlocked = state.unlocks.firstClickSafe;
        minesDefusedOutput.value = state.currencies.minesDefused;
        debugCurrencyInput.value = state.currencies.minesDefused;
        unlockSafeSolverButton.hidden = solverUnlocked;
        unlockSafeSolverButton.disabled = (
            !progression.canPurchaseUpgrade("safeSolver")
        );
        unlockAutoResetButton.hidden = autoResetUnlocked;
        unlockAutoResetButton.disabled = (
            !progression.canPurchaseUpgrade("autoBoardReset")
        );
        unlockBoard9x9Button.hidden = board9x9Unlocked;
        unlockBoard9x9Button.disabled = (
            !progression.canPurchaseUpgrade("board9x9")
        );
        unlockFirstClickSafeButton.hidden = firstClickSafeUnlocked;
        unlockFirstClickSafeButton.disabled = (
            !progression.canPurchaseUpgrade("firstClickSafe")
        );
        solverEnabledInput.disabled = !solverUnlocked;
        solverControl.hidden = !solverUnlocked;
        solverEnabledInput.checked = config.solverEnabled;
        autoResetEnabledInput.disabled = !autoResetUnlocked;
        autoResetControl.hidden = !autoResetUnlocked;
        autoResetEnabledInput.checked = config.autoResetEnabled;

        if (solverUnlocked && config.solverEnabled) {
            solver.start();
        } else {
            solver.stop();
        }

        if (!autoResetUnlocked) {
            cancelAutoReset();
        }

        game.setBoardSize(
            board9x9Unlocked ? 9 : 7,
            board9x9Unlocked ? 9 : 7,
            board9x9Unlocked ? 10 : 6,
        );
        game.setFirstRevealSafe(firstClickSafeUnlocked);
    });
    game.subscribe(updateView);
    updateCanvasZoom(currentZoom);
    updateResetZoomTitle();
})();
