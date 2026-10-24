(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createActionConsole = (element, maximumLines = 5) => {
        const lines = [];

        const render = () => {
            const visibleLines = [
                ...Array(Math.max(0, maximumLines - lines.length)).fill(""),
                ...lines,
            ];

            element.replaceChildren(
                ...visibleLines.map((message) => {
                    const line = document.createElement("div");
                    line.className = "console-line";
                    line.textContent = message || "\u00a0";
                    return line;
                }),
            );
        };

        const log = (message) => {
            lines.push(String(message));

            if (lines.length > maximumLines) {
                lines.splice(0, lines.length - maximumLines);
            }

            render();
        };

        render();

        return Object.freeze({ log });
    };
})();
