const fs = require('fs');

const w = 40;
const h = 30;
// Base: Massive Water Lake (Tile 5)
const groundData = Array(w * h).fill(5);
const wallData = Array(w * h).fill(0);

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}

function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}

// Serene Pagoda Design: A tiny floating structure connected by scattered stepping stones and long bridges.

// 1. Main cross bridges (Concrete Tile 3)
for (let x = 0; x < w; x++) { setGround(x, h/2, 3); setGround(x, h/2 - 1, 3); }
for (let y = 0; y < h; y++) { setGround(w/2, y, 3); setGround(w/2 - 1, y, 3); }

// 2. Central Pagoda Platform (Concrete Tile 3)
for (let x = 14; x < w - 14; x++) {
  for (let y = 10; y < h - 10; y++) {
    setGround(x, y, 3);
  }
}

// 3. Pagoda Pillars / Small walls (Tile 4)
// Only in the corners of the central platform
setWall(14, 10, 4); setWall(15, 10, 4); setWall(14, 11, 4);
setWall(w-15, 10, 4); setWall(w-16, 10, 4); setWall(w-15, 11, 4);
setWall(14, h-11, 4); setWall(15, h-11, 4); setWall(14, h-12, 4);
setWall(w-15, h-11, 4); setWall(w-16, h-11, 4); setWall(w-15, h-12, 4);

// 4. Lilypads / Stepping stones scattered randomly (Grass Tile 1)
// We add strategic patches of grass in the water to run through
for (let i = 0; i < 40; i++) {
  const cx = Math.floor(Math.random() * (w - 4)) + 2;
  const cy = Math.floor(Math.random() * (h - 4)) + 2;
  // create a small blob
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (Math.random() > 0.3) {
        setGround(cx + dx, cy + dy, 1);
      }
    }
  }
}

const map = {
  compressionlevel: -1,
  height: h, width: w,
  infinite: false,
  layers: [
    { data: groundData, height: h, width: w, id: 1, name: "Ground", opacity: 1, type: "tilelayer", visible: true, x: 0, y: 0 },
    { data: wallData, height: h, width: w, id: 2, name: "Walls", opacity: 1, type: "tilelayer", visible: true, x: 0, y: 0 }
  ],
  nextlayerid: 3, nextobjectid: 1,
  orientation: "orthogonal", renderorder: "right-down",
  tiledversion: "1.10.2", tileheight: 64, tilewidth: 64,
  tilesets: [{ firstgid: 1, name: "terrain", image: "terrain-tiles.png", imageheight: 256, imagewidth: 256, margin: 0, spacing: 0, tilecount: 16, tileheight: 64, tilewidth: 64 }],
  type: "map", version: "1.10"
};

fs.writeFileSync('public/assets/maps/pagoda.json', JSON.stringify(map, null, 2));
console.log('Pagoda map completely redesigned!');
