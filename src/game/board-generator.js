(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createMineGrid = ({
        width,
        height,
        mineCount,
        random = Math.random,
        excludedIndexes = [],
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

        const excludedIndexSet = new Set(
            excludedIndexes.filter((index) => (
                Number.isInteger(index) && index >= 0 && index < cellCount
            )),
        );
        const availableIndexes = Array.from(
            { length: cellCount },
            (_, index) => index,
        ).filter((index) => !excludedIndexSet.has(index));

        if (
            !Number.isInteger(mineCount) ||
            mineCount < 0 ||
            mineCount > availableIndexes.length
        ) {
            throw new RangeError(
                "Mine count exceeds the available board cells.",
            );
        }

        const mineLocations = new Set();

        for (let index = 0; index < mineCount; index += 1) {
            const remainingIndexes = availableIndexes.length - index;
            const randomValue = Math.min(
                1 - Number.EPSILON,
                Math.max(0, random()),
            );
            const selectedIndex = (
                index + Math.floor(randomValue * remainingIndexes)
            );

            [availableIndexes[index], availableIndexes[selectedIndex]] = [
                availableIndexes[selectedIndex],
                availableIndexes[index],
            ];
            mineLocations.add(availableIndexes[index]);
        }

        return Array.from(
            { length: cellCount },
            (_, index) => mineLocations.has(index),
        );
    };
})();
