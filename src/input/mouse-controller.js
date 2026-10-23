(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};

    namespace.createMouseController = (
        canvas,
        getState,
        applyAction,
    ) => {
        const cellIndexFromMouseEvent = (event) => {
            const state = getState();
            const bounds = canvas.getBoundingClientRect();
            const column = Math.floor(
                ((event.clientX - bounds.left) * state.width) /
                    bounds.width,
            );
            const row = Math.floor(
                ((event.clientY - bounds.top) * state.height) /
                    bounds.height,
            );

            if (
                column < 0 ||
                column >= state.width ||
                row < 0 ||
                row >= state.height
            ) {
                return null;
            }

            return row * state.width + column;
        };

        const handleMouseDown = (event) => {
            if (event.button !== 0 && event.button !== 1) {
                return;
            }

            event.preventDefault();
            const index = cellIndexFromMouseEvent(event);

            if (index === null) {
                return;
            }

            applyAction({
                type: event.button === 0 ? "reveal" : "chord",
                index,
            });
        };

        const handleContextMenu = (event) => {
            event.preventDefault();
            const index = cellIndexFromMouseEvent(event);

            if (index !== null) {
                applyAction({ type: "cycle-mark", index });
            }
        };

        const handleAuxClick = (event) => {
            if (event.button === 1) {
                event.preventDefault();
            }
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("contextmenu", handleContextMenu);
        canvas.addEventListener("auxclick", handleAuxClick);

        return Object.freeze({
            destroy() {
                canvas.removeEventListener("mousedown", handleMouseDown);
                canvas.removeEventListener(
                    "contextmenu",
                    handleContextMenu,
                );
                canvas.removeEventListener("auxclick", handleAuxClick);
            },
        });
    };
})();
