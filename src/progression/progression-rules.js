(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const incorrectFlagPenalty = 2;
    const hitMinePenaltyRate = 0.4;

    namespace.progressionRules = Object.freeze({
        calculateMinesDefusedReward(result) {
            const correctFlagReward = result.correctlyFlagged;
            const incorrectFlagsPenalty = (
                result.incorrectlyFlagged * incorrectFlagPenalty
            );
            const hitMinePenalty = result.hitMine
                ? Math.ceil(result.startingMines * hitMinePenaltyRate)
                : 0;

            return (
                correctFlagReward -
                incorrectFlagsPenalty -
                hitMinePenalty
            );
        },
    });
})();
