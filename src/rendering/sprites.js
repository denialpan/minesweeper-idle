(() => {
    const namespace = window.MinesweeperIdle = window.MinesweeperIdle || {};
    const textureMap = new Image();
    const tileSize = 16;
    const tileAt = (column, row) => Object.freeze({
        image: textureMap,
        x: column * tileSize,
        y: row * tileSize,
        width: tileSize,
        height: tileSize,
    });

    namespace.sprites = Object.freeze({
        tileSize,
        textureMap,
        numbers: Object.freeze([
            tileAt(0, 2),
            tileAt(0, 0),
            tileAt(1, 0),
            tileAt(2, 0),
            tileAt(3, 0),
            tileAt(0, 1),
            tileAt(1, 1),
            tileAt(2, 1),
            tileAt(3, 1),
        ]),
        covered: tileAt(1, 2),
        flagged: tileAt(2, 2),
        wrongFlag: tileAt(3, 2),
        questionPressed: tileAt(0, 3),
        question: tileAt(1, 3),
        mine: tileAt(2, 3),
        hitMine: tileAt(3, 3),
    });

    textureMap.src = "assets/texturemap.png";
})();
