const fs = require('fs');

const w = 40;
const h = 30;
// Grass base (Tile 1)
const groundData = Array(w * h).fill(1);
// Empty walls (0 is empty)
const wallData = Array(w * h).fill(0);

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}

function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}

// Map Design: Serene Pagoda
// Surrounded mostly by water/mud. Narrow dirt bridges lead to a central concrete pagada.

// 1. Enormous moat surrounding the entire area (except edges where zombies spawn)
for (let x = 2; x < w - 2; x++) {
  for (let y = 2; y < h - 2; y++) {
    setGround(x, y, 5); // Water/mud by default
  }
}

// 2. Dirt Bridges (Vertical and Horizontal to the center)
for (let x = 0; x < w; x++) {
  if (Math.abs(x - w/2) < 2) {
    for (let y = 0; y < h; y++) setGround(x, y, 2);
  }
}
for (let y = 0; y < h; y++) {
  if (Math.abs(y - h/2) < 3) {
    for (let x = 0; x < w; x++) setGround(x, y, 2);
  }
}

// 3. Central Pagoda Concrete Floor
for (let x = 12; x < w - 12; x++) {
  for (let y = 10; y < h - 10; y++) {
    // Octagonal shaped-like concrete pad
    if (Math.abs(x - w/2) + Math.abs(y - h/2) < 14) {
      setGround(x, y, 3);
    }
  }
}

// 4. Shrine walls inside
for (let x = 16; x < w - 16; x++) {
  for (let y = 12; y < h - 12; y++) {
    const isEdge = x === 16 || x === w - 17 || y === 12 || y === h - 13;
    const isGate = x === w/2 || y === h/2; // tiny 1-wide gap gates
    
    if (isEdge && !isGate) {
      setWall(x, y, 4);
    }
  }
}

const map = {
  compressionlevel: -1,
  height: h, width: w,
  infinite: false,
  layers: [
    {
      data: groundData,
      height: h, width: w,
      id: 1, name: "Ground",
      opacity: 1, type: "tilelayer", visible: true, x: 0, y: 0
    },
    {
      data: wallData,
      height: h, width: w,
      id: 2, name: "Walls",
      opacity: 1, type: "tilelayer", visible: true, x: 0, y: 0
    }
  ],
  nextlayerid: 3, nextobjectid: 1,
  orientation: "orthogonal", renderorder: "right-down",
  tiledversion: "1.10.2", tileheight: 64, tilewidth: 64,
  tilesets: [{
    firstgid: 1, name: "terrain", image: "terrain-tiles.png",
    imageheight: 256, imagewidth: 256, margin: 0, spacing: 0,
    tilecount: 16, tileheight: 64, tilewidth: 64
  }],
  type: "map", version: "1.10"
};

fs.writeFileSync('public/assets/maps/pagoda.json', JSON.stringify(map, null, 2));
console.log('Pagoda map created implicitly!');
