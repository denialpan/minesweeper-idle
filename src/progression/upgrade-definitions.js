(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.upgradeDefinitions = Object.freeze({
        randomSolver: Object.freeze({
            id: "randomSolver",
            name: "Random solver",
            cost: 10,
            maximumLevel: 1,
            unlock: "randomSolver",
        }),
        autoBoardReset: Object.freeze({
            id: "autoBoardReset",
            name: "Automatic board reset",
            cost: 10,
            maximumLevel: 1,
            unlock: "autoBoardReset",
        }),
    });
})();
