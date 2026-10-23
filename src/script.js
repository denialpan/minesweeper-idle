const counterElement = document.getElementById("counter");
let counter = 0;

const textureMap = new Image();
textureMap.src = "assets/texturemap.png";

const TILE_SIZE = 16;
const tileAt = (column, row) => Object.freeze({
    image: textureMap,
    x: column * TILE_SIZE,
    y: row * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
});

const tile_1 = tileAt(0, 0);
const tile_2 = tileAt(1, 0);
const tile_3 = tileAt(2, 0);
const tile_4 = tileAt(3, 0);
const tile_5 = tileAt(0, 1);
const tile_6 = tileAt(1, 1);
const tile_7 = tileAt(2, 1);
const tile_8 = tileAt(3, 1);
const tile_0 = tileAt(0, 2);
const tile_blank = tileAt(1, 2);
const tile_flag = tileAt(2, 2);
const tile_mine_wrong = tileAt(3, 2);
const tile_questionable = tileAt(0, 3);
const tile_questionable_blank = tileAt(1, 3);
const tile_mine = tileAt(2, 3);
const tile_mine_hit = tileAt(3, 3);

const tiles = [
    tile_1,
    tile_2,
    tile_3,
    tile_4,
    tile_5,
    tile_6,
    tile_7,
    tile_8,
    tile_0,
    tile_blank,
    tile_flag,
    tile_mine_wrong,
    tile_questionable,
    tile_questionable_blank,
    tile_mine,
    tile_mine_hit,
];

textureMap.addEventListener("load", () => {
    const tilesCanvas = document.getElementById("tiles");
    const context = tilesCanvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    tiles.forEach((tile, index) => {
        context.drawImage(
            tile.image,
            tile.x,
            tile.y,
            tile.width,
            tile.height,
            index * TILE_SIZE,
            0,
            TILE_SIZE,
            TILE_SIZE,
        );
    });
});

setInterval(() => {
    counter += 1;
    counterElement.textContent = counter;
}, 100);
