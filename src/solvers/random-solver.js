(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createRandomSolver = ({
        getState,
        applyAction,
        intervalMilliseconds = 1000,
        random = Math.random,
    }) => {
        let intervalId = null;

        const step = () => {
            const state = getState();

            if (state.status !== "playing") {
                return false;
            }

            const coveredIndexes = [];

            state.cells.forEach((cell, index) => {
                if (cell.state === "covered") {
                    coveredIndexes.push(index);
                }
            });

            if (coveredIndexes.length === 0) {
                return false;
            }

            const selectedIndex = coveredIndexes[
                Math.floor(random() * coveredIndexes.length)
            ];

            return applyAction({
                type: "reveal",
                index: selectedIndex,
            });
        };

        const start = () => {
            if (intervalId === null) {
                intervalId = setInterval(step, intervalMilliseconds);
            }
        };

        const stop = () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        return Object.freeze({
            start,
            step,
            stop,
        });
    };
})();
