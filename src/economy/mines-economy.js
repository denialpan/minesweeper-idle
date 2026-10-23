(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const storageKey = "minesweeper-idle-economy";

    namespace.createMinesEconomy = () => {
        const listeners = new Set();
        let minesDefused = 0;

        try {
            const storedValues = JSON.parse(localStorage.getItem(storageKey));

            if (
                storedValues &&
                Number.isFinite(storedValues.minesDefused)
            ) {
                minesDefused = Math.max(
                    0,
                    Math.floor(storedValues.minesDefused),
                );
            }
        } catch {
            // Start from zero when storage is unavailable or invalid.
        }

        const save = () => {
            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({ minesDefused }),
                );
            } catch {
                // Progress remains available for the current page session.
            }
        };

        const notify = () => {
            listeners.forEach((listener) => listener(minesDefused));
        };

        const addMinesDefused = (amount) => {
            const normalizedAmount = Number.isFinite(amount)
                ? Math.trunc(amount)
                : 0;

            minesDefused = Math.max(0, minesDefused + normalizedAmount);
            save();
            notify();

            return minesDefused;
        };

        const subscribe = (listener) => {
            listeners.add(listener);
            listener(minesDefused);

            return () => {
                listeners.delete(listener);
            };
        };

        return Object.freeze({
            addMinesDefused,
            getMinesDefused: () => minesDefused,
            subscribe,
        });
    };
})();
