(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.upgradeDefinitions = Object.freeze({
        autoSolver: Object.freeze({
            id: "autoSolver",
            name: "Auto solver",
            cost: 10,
            maximumLevel: 1,
            unlock: "autoSolver",
        }),
        autoSolverSpeed: Object.freeze({
            id: "autoSolverSpeed",
            name: "Auto solver speed",
            cost: 250,
            costMultiplier: 1.25,
            speedMultiplier: 1.1,
            maximumLevel: Number.MAX_SAFE_INTEGER,
            requiredUnlock: "autoSolver",
            unlock: "autoSolverSpeed",
        }),
        autoSolverExpansion: Object.freeze({
            id: "autoSolverExpansion",
            name: "Auto solver expansion",
            cost: 1000,
            maximumLevel: 1,
            requiredUnlock: "autoSolver",
            unlock: "autoSolverExpansion",
        }),
        autoSolverRandom: Object.freeze({
            id: "autoSolverRandom",
            name: "Random auto solver",
            cost: 100,
            maximumLevel: 1,
            requiredUnlock: "autoSolver",
            unlock: "autoSolverRandom",
        }),
        autoBoardReset: Object.freeze({
            id: "autoBoardReset",
            name: "Automatic board reset",
            cost: 10,
            maximumLevel: 1,
            unlock: "autoBoardReset",
        }),
        autoResetSpeed: Object.freeze({
            id: "autoResetSpeed",
            name: "Auto reset speed",
            cost: 100,
            costMultiplier: 1.5,
            speedMultiplier: 1.5,
            maximumSpeedMultiplier: 10,
            maximumLevel: 6,
            requiredUnlock: "autoBoardReset",
            unlock: "autoResetSpeed",
        }),
        board9x9: Object.freeze({
            id: "board9x9",
            name: "9 by 9 board",
            cost: 25,
            maximumLevel: 1,
            unlock: "board9x9",
        }),
        firstClickSafe: Object.freeze({
            id: "firstClickSafe",
            name: "First click safe",
            cost: 50,
            maximumLevel: 1,
            unlock: "firstClickSafe",
        }),
    });
})();
