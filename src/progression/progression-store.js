(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const storageKey = "minesweeper-idle-progression";
    const legacyEconomyStorageKey = "minesweeper-idle-economy";
    const saveVersion = 10;

    const toNonNegativeInteger = (value) => (
        Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
    );

    const toNonNegativeAmount = (value) => (
        Number.isFinite(value)
            ? Math.max(0, Math.round((value + Number.EPSILON) * 100) / 100)
            : 0
    );

    const createDefaultState = () => ({
        version: saveVersion,
        currencies: {
            minesDefused: 0,
        },
        statistics: {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            correctFlags: 0,
            incorrectFlags: 0,
            minesHit: 0,
        },
        upgrades: {
            autoSolver: 0,
            autoSolverSpeed: 0,
            autoSolverExpansion: 0,
            autoSolverRandom: 0,
            autoBoardReset: 0,
            autoResetSpeed: 0,
            board9x9: 0,
            firstClickSafe: 0,
        },
        unlocks: {
            autoSolver: false,
            autoSolverSpeed: false,
            autoSolverExpansion: false,
            autoSolverRandom: false,
            autoBoardReset: false,
            autoResetSpeed: false,
            board9x9: false,
            firstClickSafe: false,
        },
    });

    const hydrateState = (storedState) => {
        const state = createDefaultState();

        if (!storedState || typeof storedState !== "object") {
            return state;
        }

        const currencies = storedState.currencies || {};
        const statistics = storedState.statistics || {};
        const upgrades = storedState.upgrades || {};

        state.currencies.minesDefused = toNonNegativeAmount(
            currencies.minesDefused,
        );
        state.statistics.gamesPlayed = toNonNegativeInteger(
            statistics.gamesPlayed,
        );
        state.statistics.gamesWon = toNonNegativeInteger(
            statistics.gamesWon,
        );
        state.statistics.gamesLost = toNonNegativeInteger(
            statistics.gamesLost,
        );
        state.statistics.correctFlags = toNonNegativeInteger(
            statistics.correctFlags,
        );
        state.statistics.incorrectFlags = toNonNegativeInteger(
            statistics.incorrectFlags,
        );
        state.statistics.minesHit = toNonNegativeInteger(
            statistics.minesHit,
        );
        Object.values(namespace.upgradeDefinitions).forEach((definition) => {
            const storedUpgradeLevel = definition.id === "autoSolver"
                ? upgrades.autoSolver ?? upgrades.safeSolver ?? upgrades.randomSolver
                : upgrades[definition.id];

            state.upgrades[definition.id] = Math.min(
                definition.maximumLevel,
                toNonNegativeInteger(storedUpgradeLevel),
            );
            state.unlocks[definition.unlock] = (
                state.upgrades[definition.id] > 0
            );
        });

        return state;
    };

    const loadState = () => {
        try {
            const storedProgression = localStorage.getItem(storageKey);

            if (storedProgression !== null) {
                return hydrateState(JSON.parse(storedProgression));
            }

            const legacyEconomy = JSON.parse(
                localStorage.getItem(legacyEconomyStorageKey),
            );
            const migratedState = createDefaultState();

            if (legacyEconomy) {
                migratedState.currencies.minesDefused = (
                    toNonNegativeAmount(legacyEconomy.minesDefused)
                );
            }

            return migratedState;
        } catch {
            return createDefaultState();
        }
    };

    namespace.createProgressionStore = () => {
        const listeners = new Set();
        let state = loadState();

        const getSnapshot = () => ({
            version: state.version,
            currencies: { ...state.currencies },
            statistics: { ...state.statistics },
            upgrades: { ...state.upgrades },
            unlocks: { ...state.unlocks },
        });

        const save = () => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(state));
            } catch {
                // Progress remains available for the current page session.
            }
        };

        const notify = () => {
            const snapshot = getSnapshot();
            listeners.forEach((listener) => listener(snapshot));
        };

        const recordGame = (result) => {
            const reward = (
                namespace.progressionRules
                    .calculateMinesDefusedReward(result)
            );

            state.currencies.minesDefused = toNonNegativeAmount(
                state.currencies.minesDefused + reward,
            );
            state.statistics.gamesPlayed += 1;
            state.statistics.gamesWon += Number(
                result.outcome === "won",
            );
            state.statistics.gamesLost += Number(
                result.outcome === "lost",
            );
            state.statistics.correctFlags += result.correctlyFlagged;
            state.statistics.incorrectFlags += result.incorrectlyFlagged;
            state.statistics.minesHit += Number(result.hitMine);
            save();
            notify();

            return Object.freeze({
                reward,
                balance: state.currencies.minesDefused,
            });
        };

        const getUpgradeCost = (upgradeId) => {
            const definition = namespace.upgradeDefinitions[upgradeId];

            if (!definition) {
                return null;
            }

            const level = state.upgrades[upgradeId];
            const costMultiplier = definition.costMultiplier || 1;
            const scaledCost = definition.cost * costMultiplier ** level;

            return Number.isFinite(scaledCost)
                ? Math.ceil(scaledCost)
                : Number.MAX_SAFE_INTEGER;
        };

        const canPurchaseUpgrade = (upgradeId) => {
            const definition = namespace.upgradeDefinitions[upgradeId];
            const cost = getUpgradeCost(upgradeId);

            return Boolean(
                definition &&
                cost !== null &&
                (
                    !definition.requiredUnlock ||
                    state.unlocks[definition.requiredUnlock]
                ) &&
                state.upgrades[upgradeId] < definition.maximumLevel &&
                state.currencies.minesDefused >= cost,
            );
        };

        const purchaseUpgrade = (upgradeId) => {
            if (!canPurchaseUpgrade(upgradeId)) {
                return false;
            }

            const definition = namespace.upgradeDefinitions[upgradeId];
            const cost = getUpgradeCost(upgradeId);
            state.currencies.minesDefused -= cost;
            state.upgrades[upgradeId] += 1;
            state.unlocks[definition.unlock] = true;
            save();
            notify();

            return true;
        };

        const resetProgression = () => {
            state = createDefaultState();
            save();
            notify();
        };

        const setMinesDefused = (amount) => {
            state.currencies.minesDefused = toNonNegativeAmount(amount);
            save();
            notify();

            return state.currencies.minesDefused;
        };

        const subscribe = (listener) => {
            listeners.add(listener);
            listener(getSnapshot());

            return () => {
                listeners.delete(listener);
            };
        };

        save();

        return Object.freeze({
            canPurchaseUpgrade,
            getSnapshot,
            getUpgradeCost,
            purchaseUpgrade,
            recordGame,
            resetProgression,
            setMinesDefused,
            subscribe,
        });
    };
})();
