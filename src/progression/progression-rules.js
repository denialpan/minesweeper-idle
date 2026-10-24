(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const boardCompletionRewardRate = 1.5;
    const incorrectFlagPenalty = 2;
    const hitMinePenaltyRate = 0.4;

    namespace.progressionRules = Object.freeze({
        calculateMinesDefusedReward(result) {
            const boardCompletionReward = result.outcome === "won"
                ? Math.floor(
                    result.startingMines * boardCompletionRewardRate,
                )
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
