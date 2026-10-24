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
    } = {}) => {
        const cellCount = width * height;
        const listeners = new Set();
        let mineGrid;
        let revealedCells;
        let cellMarks;
        let status;
        let hitMineIndex;
        let gameResult;

        const generateBoard = () => {
            mineGrid = namespace.createMineGrid({
                width,
                height,
                mineCount,
                random,
            });
            revealedCells = Array(cellCount).fill(false);
            cellMarks = Array(cellCount).fill(null);
            status = "playing";
            hitMineIndex = -1;
            gameResult = null;
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

            const changed = revealFrom(index);

            if (status === "playing" && hasWon()) {
                finishGame("won");
            }

            return changed;
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
            if (!action || !isValidIndex(action.index)) {
                return false;
            }

            let changed = false;

            if (action.type === "reveal") {
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
            subscribe,
        });
    };
})();
