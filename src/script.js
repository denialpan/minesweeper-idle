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

setInterval(() => {
    counter += 1;
    counterElement.textContent = counter;
}, 100);
