(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createAutoSolver = ({
        getState,
        applyAction,
        intervalMilliseconds = 1000,
    }) => {
        let intervalId = null;
        let currentIntervalMilliseconds = intervalMilliseconds;

        const step = () => {
            if (getState().status !== "playing") {
                return false;
            }

            return applyAction({ type: "auto-solve" });
        };

        const start = () => {
            if (intervalId === null) {
                intervalId = setInterval(
                    step,
                    currentIntervalMilliseconds,
                );
            }
        };

        const stop = () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        const setSpeedMultiplier = (multiplier) => {
            const normalizedMultiplier = Number.isFinite(multiplier)
                ? Math.max(1, multiplier)
                : 1;
            const nextIntervalMilliseconds = Math.max(
                1,
                intervalMilliseconds / normalizedMultiplier,
            );

            if (nextIntervalMilliseconds === currentIntervalMilliseconds) {
                return false;
            }

            const wasRunning = intervalId !== null;
            stop();
            currentIntervalMilliseconds = nextIntervalMilliseconds;

            if (wasRunning) {
                start();
            }

            return true;
        };

        return Object.freeze({
            setSpeedMultiplier,
            start,
            step,
            stop,
        });
    };
})();
