(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const properFlagReward = 1;
    const misplacedFlagPenalty = 1;

    const roundMines = (amount) => Math.round(
        (amount + Number.EPSILON) * 100,
    ) / 100;

    const calculateMisplacedFlagPenalty = (incorrectlyFlagged) => roundMines(
        incorrectlyFlagged * misplacedFlagPenalty,
    );

    const calculateProperFlagReward = (correctlyFlagged) => roundMines(
        correctlyFlagged * properFlagReward,
    );

    namespace.progressionRules = Object.freeze({
        calculateMisplacedFlagPenalty,
        calculateProperFlagReward,

        calculateMinesDefusedReward(result) {
            if (result.outcome === "won") {
                return roundMines(
                    result.startingMines +
                    calculateProperFlagReward(result.correctlyFlagged),
                );
            }

            return -calculateMisplacedFlagPenalty(
                result.incorrectlyFlagged,
            );
        },
    });
})();
