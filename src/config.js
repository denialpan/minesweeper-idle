const gameConfig = (() => {
    const STORAGE_KEY = "minesweeper-idle-config";
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 5;
    const DEFAULT_ZOOM = 1;

    const normalizeZoom = (value, fallback = DEFAULT_ZOOM) => {
        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
            return fallback;
        }

        const boundedValue = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, numericValue),
        );

        return Math.trunc(boundedValue * 100 + 1e-9) / 100;
    };

    const values = {
        zoom: DEFAULT_ZOOM,
        defaultZoom: DEFAULT_ZOOM,
    };

    try {
        const storedValues = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (storedValues && typeof storedValues === "object") {
            values.zoom = normalizeZoom(storedValues.zoom);
            values.defaultZoom = normalizeZoom(storedValues.defaultZoom);
        }
    } catch {
        // Keep the built-in defaults when storage is unavailable or invalid.
    }

    const save = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        } catch {
            // The game remains usable when local storage is unavailable.
        }
    };

    return Object.freeze({
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        normalizeZoom,

        get zoom() {
            return values.zoom;
        },

        get defaultZoom() {
            return values.defaultZoom;
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
    });
})();
