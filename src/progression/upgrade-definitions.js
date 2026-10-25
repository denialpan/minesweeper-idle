(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.upgradeDefinitions = Object.freeze({
        safeSolver: Object.freeze({
            id: "safeSolver",
            name: "Safe solver",
            cost: 10,
            maximumLevel: 1,
            unlock: "safeSolver",
        }),
        autoBoardReset: Object.freeze({
            id: "autoBoardReset",
            name: "Automatic board reset",
            cost: 10,
            maximumLevel: 1,
            unlock: "autoBoardReset",
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
