(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const boardCompletionRewardRate = 1.5;
    const startingLossRate = 0.5;

    const calculateBoardCompletionReward = (startingMines) => Math.floor(
        startingMines * boardCompletionRewardRate,
    );

    namespace.progressionRules = Object.freeze({
        calculateBoardCompletionReward,

        calculateMinesDefusedReward(result) {
            if (result.outcome === "won") {
                return (
                    calculateBoardCompletionReward(result.startingMines) +
                    result.correctlyFlagged
                );
            }

            const revealedPercentage = result.boardCells > 0
                ? result.revealedCells / result.boardCells
                : 0;
            const boardLoss = Math.max(
                0,
                (startingLossRate - revealedPercentage) *
                    result.startingMines,
            );
            const totalLoss = Math.ceil(
                boardLoss + result.incorrectlyFlagged,
            );

            return -totalLoss;
        },
    });
})();
