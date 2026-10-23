(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createMineGrid = ({
        width,
        height,
        mineCount,
        random = Math.random,
    }) => {
        const cellCount = width * height;

        if (
            !Number.isInteger(width) ||
            !Number.isInteger(height) ||
            width <= 0 ||
            height <= 0
        ) {
            throw new RangeError("Board dimensions must be positive integers.");
        }

        if (
            !Number.isInteger(mineCount) ||
            mineCount < 0 ||
            mineCount >= cellCount
        ) {
            throw new RangeError(
                "Mine count must be a non-negative integer below the cell count.",
            );
        }

        const mineLocations = new Set();

        while (mineLocations.size < mineCount) {
            mineLocations.add(Math.floor(random() * cellCount));
        }

        return Array.from(
            { length: cellCount },
            (_, index) => mineLocations.has(index),
        );
    };
})();
