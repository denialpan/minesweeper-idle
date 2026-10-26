(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const storageKey = "minesweeper-idle-config";
    const minZoom = 0.5;
    const maxZoom = 5;
    const builtInZoom = 1;
    const solverAlgorithms = Object.freeze([
        "sequential",
        "random",
    ]);

    const normalizeZoom = (value, fallback = builtInZoom) => {
        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
            return fallback;
        }

        const boundedValue = Math.min(
            maxZoom,
            Math.max(minZoom, numericValue),
        );

        return Math.trunc(boundedValue * 100 + 1e-9) / 100;
    };

    const normalizeSolverAlgorithm = (value) => (
        solverAlgorithms.includes(value) ? value : "sequential"
    );

    const values = {
        zoom: builtInZoom,
        defaultZoom: builtInZoom,
        solverEnabled: true,
        solverAlgorithm: "sequential",
        autoResetEnabled: false,
    };

    try {
        const storedValues = JSON.parse(localStorage.getItem(storageKey));

        if (storedValues && typeof storedValues === "object") {
            values.zoom = normalizeZoom(storedValues.zoom);
            values.defaultZoom = normalizeZoom(storedValues.defaultZoom);

            if (typeof storedValues.solverEnabled === "boolean") {
                values.solverEnabled = storedValues.solverEnabled;
            }

            values.solverAlgorithm = normalizeSolverAlgorithm(
                storedValues.solverAlgorithm,
            );

            if (typeof storedValues.autoResetEnabled === "boolean") {
                values.autoResetEnabled = storedValues.autoResetEnabled;
            }
        }
    } catch {
        // Keep the built-in defaults when storage is unavailable or invalid.
    }

    const save = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(values));
        } catch {
            // The game remains usable when local storage is unavailable.
        }
    };

    const reset = () => {
        values.zoom = builtInZoom;
        values.defaultZoom = builtInZoom;
        values.solverEnabled = true;
        values.solverAlgorithm = "sequential";
        values.autoResetEnabled = false;
        save();
    };

    namespace.config = Object.freeze({
        minZoom,
        maxZoom,
        normalizeZoom,
        reset,

        get zoom() {
            return values.zoom;
        },

        get defaultZoom() {
            return values.defaultZoom;
        },

        get solverEnabled() {
            return values.solverEnabled;
        },

        get solverAlgorithm() {
            return values.solverAlgorithm;
        },

        get autoResetEnabled() {
            return values.autoResetEnabled;
        },

        setZoom(value) {
            values.zoom = normalizeZoom(value, values.zoom);
            save();
            return values.zoom;
        },

        setDefaultZoom(value) {
            values.defaultZoom = normalizeZoom(value, values.defaultZoom);
            save();
            return values.defaultZoom;
        },

        setSolverEnabled(value) {
            values.solverEnabled = Boolean(value);
            save();
            return values.solverEnabled;
        },

        setSolverAlgorithm(value) {
            values.solverAlgorithm = normalizeSolverAlgorithm(value);
            save();
            return values.solverAlgorithm;
        },

        setAutoResetEnabled(value) {
            values.autoResetEnabled = Boolean(value);
            save();
            return values.autoResetEnabled;
        },
    });
})();
