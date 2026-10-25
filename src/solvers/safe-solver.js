(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createSafeSolver = ({
        getState,
        applyAction,
        intervalMilliseconds = 1000,
    }) => {
        let intervalId = null;

        const step = () => {
            if (getState().status !== "playing") {
                return false;
            }

            return applyAction({ type: "reveal-next-safe" });
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
