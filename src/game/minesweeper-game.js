(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    const getAdjacentIndexes = (index, width, height) => {
        const column = index % width;
        const row = Math.floor(index / width);
        const adjacentIndexes = [];

        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset += 1
            ) {
                if (rowOffset === 0 && columnOffset === 0) {
                    continue;
                }

                const adjacentColumn = column + columnOffset;
                const adjacentRow = row + rowOffset;

                if (
                    adjacentColumn >= 0 &&
                    adjacentColumn < width &&
                    adjacentRow >= 0 &&
                    adjacentRow < height
                ) {
                    adjacentIndexes.push(
                        adjacentRow * width + adjacentColumn,
                    );
                }
            }
        }

        return adjacentIndexes;
    };

    namespace.createMinesweeperGame = ({
        width = 9,
        height = 9,
        mineCount = 10,
        random = Math.random,
        firstRevealSafe = false,
    } = {}) => {
        let cellCount = width * height;
        const listeners = new Set();
        let mineGrid;
        let revealedCells;
        let cellMarks;
        let status;
        let hitMineIndex;
        let gameResult;
        let boardGenerated;

        const placeMines = (excludedIndexes = []) => {
            mineGrid = namespace.createMineGrid({
                width,
                height,
                mineCount,
                random,
                excludedIndexes,
            });
            boardGenerated = true;
        };

        const generateBoard = () => {
            revealedCells = Array(cellCount).fill(false);
            cellMarks = Array(cellCount).fill(null);
            status = "playing";
            hitMineIndex = -1;
            gameResult = null;

            if (firstRevealSafe) {
                mineGrid = Array(cellCount).fill(false);
                boardGenerated = false;
            } else {
                placeMines();
            }
        };

        const countProperlyFlaggedMines = () => mineGrid.reduce(
            (total, hasMine, index) => (
                total + Number(hasMine && cellMarks[index] === "flag")
            ),
            0,
        );

        const countIncorrectlyFlaggedCells = () => mineGrid.reduce(
            (total, hasMine, index) => (
                total + Number(!hasMine && cellMarks[index] === "flag")
            ),
            0,
        );

        const finishGame = (outcome) => {
            status = outcome;
            gameResult = Object.freeze({
                outcome,
                startingMines: mineCount,
                correctlyFlagged: countProperlyFlaggedMines(),
                incorrectlyFlagged: countIncorrectlyFlaggedCells(),
                hitMine: outcome === "lost" && hitMineIndex >= 0,
            });
        };

        const countAdjacentMines = (index) => getAdjacentIndexes(
            index,
            width,
            height,
        ).reduce(
            (total, adjacentIndex) => (
                total + Number(mineGrid[adjacentIndex])
            ),
            0,
        );

        const revealFrom = (index) => {
            if (
                status !== "playing" ||
                revealedCells[index] ||
                cellMarks[index] === "flag"
            ) {
                return false;
            }

            cellMarks[index] = null;

            if (mineGrid[index]) {
                hitMineIndex = index;
                finishGame("lost");
                return true;
            }

            revealedCells[index] = true;

            if (countAdjacentMines(index) === 0) {
                getAdjacentIndexes(index, width, height).forEach(revealFrom);
            }

            return true;
        };

        const hasWon = () => mineGrid.every(
            (hasMine, index) => hasMine || revealedCells[index],
        );

        const reveal = (index) => {
            if (
                status !== "playing" ||
                revealedCells[index] ||
                cellMarks[index] === "flag"
            ) {
                return false;
            }

            if (!boardGenerated) {
                placeMines([index]);
            }

            const changed = revealFrom(index);

            if (status === "playing" && hasWon()) {
                finishGame("won");
            }

            return changed;
        };

        const revealNextSafeCell = () => {
            if (status !== "playing") {
                return false;
            }

            if (!boardGenerated) {
                placeMines();
            }

            const index = mineGrid.findIndex((hasMine, cellIndex) => (
                !hasMine &&
                !revealedCells[cellIndex] &&
                cellMarks[cellIndex] !== "flag"
            ));

            if (index < 0) {
                return false;
            }

            cellMarks[index] = null;
            revealedCells[index] = true;

            if (hasWon()) {
                finishGame("won");
            }

            return true;
        };

        const chord = (index) => {
            if (
                status !== "playing" ||
                !revealedCells[index] ||
                mineGrid[index]
            ) {
                return false;
            }

            const adjacentIndexes = getAdjacentIndexes(index, width, height);
            const adjacentFlags = adjacentIndexes.filter(
                (adjacentIndex) => cellMarks[adjacentIndex] === "flag",
            ).length;

            if (adjacentFlags !== countAdjacentMines(index)) {
                return false;
            }

            let changed = false;

            for (const adjacentIndex of adjacentIndexes) {
                if (cellMarks[adjacentIndex] !== "flag") {
                    changed = revealFrom(adjacentIndex) || changed;
                }
            }

            if (status === "playing" && hasWon()) {
                finishGame("won");
            }

            return changed;
        };

        const cycleMark = (index) => {
            if (status !== "playing" || revealedCells[index]) {
                return false;
            }

            if (cellMarks[index] === null) {
                cellMarks[index] = "flag";
            } else if (cellMarks[index] === "flag") {
                cellMarks[index] = "question";
            } else {
                cellMarks[index] = null;
            }

            return true;
        };

        const getCellState = (index) => {
            const adjacentMines = mineGrid[index]
                ? null
                : countAdjacentMines(index);

            if (status === "won") {
                return mineGrid[index]
                    ? { state: "flagged", adjacentMines }
                    : { state: "revealed", adjacentMines };
            }

            if (status === "lost") {
                if (mineGrid[index]) {
                    return {
                        state: index === hitMineIndex ? "hit-mine" : "mine",
                        adjacentMines,
                    };
                }

                return {
                    state: cellMarks[index] === "flag"
                        ? "wrong-flag"
                        : "revealed",
                    adjacentMines,
                };
            }

            if (revealedCells[index]) {
                return { state: "revealed", adjacentMines };
            }

            if (cellMarks[index] === "flag") {
                return { state: "flagged", adjacentMines: null };
            }

            if (cellMarks[index] === "question") {
                return { state: "question", adjacentMines: null };
            }

            return { state: "covered", adjacentMines: null };
        };

        const getPublicState = () => ({
            width,
            height,
            mineCount,
            status,
            result: gameResult ? { ...gameResult } : null,
            cells: Array.from(
                { length: cellCount },
                (_, index) => getCellState(index),
            ),
        });

        const notify = () => {
            const publicState = getPublicState();
            listeners.forEach((listener) => listener(publicState));
        };

        const prepareDebugBoard = () => {
            generateBoard();

            if (!boardGenerated) {
                placeMines();
            }

            notify();
        };

        const debugForceWin = () => {
            prepareDebugBoard();

            mineGrid.forEach((hasMine, index) => {
                if (!hasMine) {
                    revealedCells[index] = true;
                    cellMarks[index] = null;
                }
            });

            finishGame("won");
            notify();
        };

        const debugForceLoss = (withIncorrectFlags = false) => {
            prepareDebugBoard();

            if (withIncorrectFlags) {
                mineGrid
                    .map((hasMine, index) => ({ hasMine, index }))
                    .filter(({ hasMine }) => !hasMine)
                    .slice(0, 2)
                    .forEach(({ index }) => {
                        cellMarks[index] = "flag";
                    });
            }

            hitMineIndex = mineGrid.findIndex(Boolean);
            finishGame("lost");
            notify();
        };

        const isValidIndex = (index) => (
            Number.isInteger(index) &&
            index >= 0 &&
            index < cellCount
        );

        const applyAction = (action) => {
            if (!action) {
                return false;
            }

            let changed = false;

            if (action.type === "reveal-next-safe") {
                changed = revealNextSafeCell();
            } else if (!isValidIndex(action.index)) {
                return false;
            } else if (action.type === "reveal") {
                changed = reveal(action.index);
            } else if (action.type === "chord") {
                changed = chord(action.index);
            } else if (action.type === "cycle-mark") {
                changed = cycleMark(action.index);
            }

            if (changed) {
                notify();
            }

            return changed;
        };

        const reset = () => {
            generateBoard();
            notify();
        };

        const setBoardSize = (
            nextWidth,
            nextHeight,
            nextMineCount = mineCount,
        ) => {
            if (
                !Number.isInteger(nextWidth) ||
                !Number.isInteger(nextHeight) ||
                !Number.isInteger(nextMineCount) ||
                nextWidth <= 0 ||
                nextHeight <= 0 ||
                nextMineCount < 0 ||
                nextMineCount >= nextWidth * nextHeight
            ) {
                return false;
            }

            if (
                width === nextWidth &&
                height === nextHeight &&
                mineCount === nextMineCount
            ) {
                return false;
            }

            width = nextWidth;
            height = nextHeight;
            mineCount = nextMineCount;
            cellCount = width * height;
            generateBoard();
            notify();

            return true;
        };

        const setFirstRevealSafe = (enabled) => {
            const normalizedEnabled = Boolean(enabled);

            if (firstRevealSafe === normalizedEnabled) {
                return false;
            }

            firstRevealSafe = normalizedEnabled;
            generateBoard();
            notify();

            return true;
        };

        const subscribe = (listener) => {
            listeners.add(listener);
            listener(getPublicState());

            return () => {
                listeners.delete(listener);
            };
        };

        generateBoard();

        return Object.freeze({
            applyAction,
            debugForceLoss,
            debugForceWin,
            getPublicState,
            reset,
            setBoardSize,
            setFirstRevealSafe,
            subscribe,
        });
    };
})();
