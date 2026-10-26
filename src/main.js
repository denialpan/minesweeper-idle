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
    const unlockAutoSolverButton = document.getElementById(
        "unlock-auto-solver",
    );
    const upgradeAutoSolverSpeedButton = document.getElementById(
        "upgrade-auto-solver-speed",
    );
    const unlockAutoSolverExpansionButton = document.getElementById(
        "unlock-auto-solver-expansion",
    );
    const unlockAutoSolverRandomButton = document.getElementById(
        "unlock-auto-solver-random",
    );
    const unlockAutoResetButton = document.getElementById(
        "unlock-auto-reset",
    );
    const upgradeAutoResetSpeedButton = document.getElementById(
        "upgrade-auto-reset-speed",
    );
    const unlockBoard9x9Button = document.getElementById(
        "unlock-board-9x9",
    );
    const unlockFirstClickSafeButton = document.getElementById(
        "unlock-first-click-safe",
    );
    const solverEnabledInput = document.getElementById("solver-enabled");
    const solverControl = document.getElementById("solver-control");
    const solverAlgorithmSelect = document.getElementById(
        "solver-algorithm",
    );
    const solverAlgorithmControl = document.getElementById(
        "solver-algorithm-control",
    );
    const solverAlgorithmRandomOption = document.getElementById(
        "solver-algorithm-random",
    );
    const autoResetEnabledInput = document.getElementById(
        "auto-reset-enabled",
    );
    const autoResetControl = document.getElementById(
        "auto-reset-control",
    );
    const progression = namespace.createProgressionStore();
    const autoResetSpeedDefinition = (
        namespace.upgradeDefinitions.autoResetSpeed
    );
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
    const solver = namespace.createAutoSolver({
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

    const getAutoResetSpeed = (level) => Math.min(
        autoResetSpeedDefinition.maximumSpeedMultiplier,
        autoResetSpeedDefinition.speedMultiplier ** level,
    );

    const scheduleAutoReset = () => {
        cancelAutoReset();

        const progressionState = progression.getSnapshot();
        const autoResetUnlocked = progressionState.unlocks.autoBoardReset;
        const autoResetSpeed = getAutoResetSpeed(
            progressionState.upgrades.autoResetSpeed,
        );
        const resetDelay = (
            autoResetSpeed >=
            autoResetSpeedDefinition.maximumSpeedMultiplier
        )
            ? 0
            : 1000 / autoResetSpeed;
        const gameFinished = game.getPublicState().status !== "playing";

        if (
            autoResetUnlocked &&
            config.autoResetEnabled &&
            gameFinished
        ) {
            autoResetTimeoutId = setTimeout(() => {
                autoResetTimeoutId = null;
                game.reset();
            }, resetDelay);
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

    unlockAutoSolverButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoSolver")) {
            actionConsole.log("Upgrade purchased - auto solver unlocked.");
        }
    });

    upgradeAutoSolverSpeedButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoSolverSpeed")) {
            const level = (
                progression.getSnapshot().upgrades.autoSolverSpeed
            );
            const speed = 1.1 ** level;
            actionConsole.log(
                `Upgrade purchased - auto solve speed is ${speed.toFixed(2)}x.`,
            );
        }
    });

    unlockAutoSolverExpansionButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoSolverExpansion")) {
            actionConsole.log(
                "Upgrade purchased - auto solve expansion unlocked.",
            );
        }
    });

    unlockAutoSolverRandomButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoSolverRandom")) {
            actionConsole.log(
                "Upgrade purchased - random auto solve unlocked.",
            );
        }
    });

    unlockAutoResetButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoBoardReset")) {
            actionConsole.log("Upgrade purchased - auto reset unlocked.");
            scheduleAutoReset();
        }
    });

    upgradeAutoResetSpeedButton.addEventListener("click", () => {
        if (progression.purchaseUpgrade("autoResetSpeed")) {
            const level = (
                progression.getSnapshot().upgrades.autoResetSpeed
            );
            const speed = getAutoResetSpeed(level);
            const speedDescription = (
                speed >= autoResetSpeedDefinition.maximumSpeedMultiplier
            )
                ? "instant"
                : `${speed.toFixed(2)}x`;

            actionConsole.log(
                `Upgrade purchased - auto reset is ${speedDescription}.`,
            );
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
            progression.getSnapshot().unlocks.autoSolver
        );

        if (solverUnlocked && config.solverEnabled) {
            solver.start();
        } else {
            solver.stop();
        }
    });

    solverAlgorithmSelect.addEventListener("change", () => {
        const randomUnlocked = (
            progression.getSnapshot().unlocks.autoSolverRandom
        );
        const requestedAlgorithm = solverAlgorithmSelect.value;
        const algorithm = requestedAlgorithm === "random" && !randomUnlocked
            ? "sequential"
            : requestedAlgorithm;

        solverAlgorithmSelect.value = config.setSolverAlgorithm(algorithm);
        game.setAutoSolveAlgorithm(config.solverAlgorithm);
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
        const solverUnlocked = state.unlocks.autoSolver;
        const solverExpansionUnlocked = (
            state.unlocks.autoSolverExpansion
        );
        const solverRandomUnlocked = state.unlocks.autoSolverRandom;
        const solverSpeedLevel = state.upgrades.autoSolverSpeed;
        const solverSpeed = 1.1 ** solverSpeedLevel;
        const nextSolverSpeed = solverSpeed * 1.1;
        const solverSpeedCost = progression.getUpgradeCost(
            "autoSolverSpeed",
        );
        const autoResetUnlocked = state.unlocks.autoBoardReset;
        const autoResetSpeedLevel = state.upgrades.autoResetSpeed;
        const autoResetSpeed = getAutoResetSpeed(autoResetSpeedLevel);
        const nextAutoResetSpeed = getAutoResetSpeed(
            autoResetSpeedLevel + 1,
        );
        const autoResetSpeedCost = progression.getUpgradeCost(
            "autoResetSpeed",
        );
        const autoResetSpeedIsMaximum = (
            autoResetSpeedLevel >= autoResetSpeedDefinition.maximumLevel
        );
        const board9x9Unlocked = state.unlocks.board9x9;
        const firstClickSafeUnlocked = state.unlocks.firstClickSafe;
        minesDefusedOutput.value = state.currencies.minesDefused;
        debugCurrencyInput.value = state.currencies.minesDefused;
        unlockAutoSolverButton.hidden = solverUnlocked;
        unlockAutoSolverButton.disabled = (
            !progression.canPurchaseUpgrade("autoSolver")
        );
        upgradeAutoSolverSpeedButton.hidden = !solverUnlocked;
        upgradeAutoSolverSpeedButton.disabled = (
            !progression.canPurchaseUpgrade("autoSolverSpeed")
        );
        upgradeAutoSolverSpeedButton.textContent = (
            `Auto solve speed ${solverSpeed.toFixed(2)}× → ` +
            `${nextSolverSpeed.toFixed(2)}× (${solverSpeedCost} mines)`
        );
        unlockAutoSolverExpansionButton.hidden = (
            !solverUnlocked || solverExpansionUnlocked
        );
        unlockAutoSolverExpansionButton.disabled = (
            !progression.canPurchaseUpgrade("autoSolverExpansion")
        );
        unlockAutoSolverRandomButton.hidden = (
            !solverUnlocked || solverRandomUnlocked
        );
        unlockAutoSolverRandomButton.disabled = (
            !progression.canPurchaseUpgrade("autoSolverRandom")
        );
        unlockAutoResetButton.hidden = autoResetUnlocked;
        unlockAutoResetButton.disabled = (
            !progression.canPurchaseUpgrade("autoBoardReset")
        );
        upgradeAutoResetSpeedButton.hidden = !autoResetUnlocked;
        upgradeAutoResetSpeedButton.disabled = (
            !progression.canPurchaseUpgrade("autoResetSpeed")
        );

        if (autoResetSpeedIsMaximum) {
            upgradeAutoResetSpeedButton.textContent = (
                "Auto reset: instant (maximum)"
            );
        } else {
            const nextSpeedLabel = (
                nextAutoResetSpeed >=
                autoResetSpeedDefinition.maximumSpeedMultiplier
            )
                ? "instant"
                : `${nextAutoResetSpeed.toFixed(2)}×`;

            upgradeAutoResetSpeedButton.textContent = (
                `Auto reset speed ${autoResetSpeed.toFixed(2)}× → ` +
                `${nextSpeedLabel} (${autoResetSpeedCost} mines)`
            );
        }
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
        solverAlgorithmControl.hidden = !solverUnlocked;
        solverAlgorithmRandomOption.hidden = !solverRandomUnlocked;
        solverAlgorithmRandomOption.disabled = !solverRandomUnlocked;

        if (!solverRandomUnlocked && config.solverAlgorithm === "random") {
            config.setSolverAlgorithm("sequential");
        }

        solverAlgorithmSelect.value = config.solverAlgorithm;
        autoResetEnabledInput.disabled = !autoResetUnlocked;
        autoResetControl.hidden = !autoResetUnlocked;
        autoResetEnabledInput.checked = config.autoResetEnabled;
        solver.setSpeedMultiplier(solverSpeed);
        game.setAutoSolveAlgorithm(config.solverAlgorithm);
        game.setAutoSolveExpansion(solverExpansionUnlocked);

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
