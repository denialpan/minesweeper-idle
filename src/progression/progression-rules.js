(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const boardCompletionRewardRate = 1.5;
    const incorrectFlagPenalty = 2;
    const hitMinePenaltyRate = 0.4;

    const calculateBoardCompletionReward = (startingMines) => Math.floor(
        startingMines * boardCompletionRewardRate,
    );

    namespace.progressionRules = Object.freeze({
        calculateBoardCompletionReward,

        calculateMinesDefusedReward(result) {
            const boardCompletionReward = result.outcome === "won"
                ? calculateBoardCompletionReward(result.startingMines)
                : 0;
            const correctFlagReward = result.correctlyFlagged;
            const incorrectFlagsPenalty = (
                result.incorrectlyFlagged * incorrectFlagPenalty
            );
            const hitMinePenalty = result.hitMine
                ? Math.ceil(result.startingMines * hitMinePenaltyRate)
                : 0;

            return (
                boardCompletionReward +
                correctFlagReward -
                incorrectFlagsPenalty -
                hitMinePenalty
            );
        },
    });
})();
