const fs = require('fs');

const w = 40;
const h = 30;
// Base: Concrete (Tile 3)
const groundData = Array(w * h).fill(3);
const wallData = Array(w * h).fill(0);

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}

function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}

// Royal Palace Design: A fortified maze. Long straight brick corridors, separated by walled rooms.
// Emphasizes extreme line-of-sight blocking.

// 1. Red carpet middle hall (simulated with Grass tile 1 because we lack red carpet)
for (let y = 0; y < h; y++) {
  setGround(w/2 - 1, y, 1);
  setGround(w/2, y, 1);
}

// 2. The Great Walls (Vertical and Horizontal labyrinths)
// Outer ring
for (let x = 2; x < w - 2; x++) {
  for (let y = 2; y < h - 2; y++) {
    const isEdge = x === 2 || x === w - 3 || y === 2 || y === h - 3;
    // huge gaps for entry
    const isGap = Math.abs(x - w/2) < 4 || Math.abs(y - h/2) < 3;
    if (isEdge && !isGap) setWall(x, y, 4);
  }
}

// Chamber walls
for(let y = 6; y < h - 6; y += 6) {
  for(let x = 6; x < w - 6; x++) {
    // Leave the red carpet hall open completely
    if (Math.abs(x - w/2) <= 3) continue;
    
    // Create 2-tile wide doors in the middle of horizontal segments
    if (x % 8 === 3 || x % 8 === 4) continue;

    setWall(x, y, 4);
  }
}

for(let x = 8; x < w - 8; x += 8) {
  for(let y = 6; y < h - 6; y++) {
    // Leave the central vertical area clear
    if (Math.abs(y - h/2) <= 3) continue;

    // Create 2-tile wide doors in the middle of vertical segments
    if (y % 6 === 2 || y % 6 === 3) continue;
    
    setWall(x, y, 4);
  }
}

// 3. Mini Water Fountains in chambers
const centers = [
  {x: 12, y: 9}, {x: w - 12, y: 9},
  {x: 12, y: h - 9}, {x: w - 12, y: h - 9}
]
for (let c of centers) {
  setGround(c.x, c.y, 5); setGround(c.x+1, c.y, 5);
  setGround(c.x, c.y+1, 5); setGround(c.x+1, c.y+1, 5);
  // surround with walls to make them look like solid fountains
  setWall(c.x-1, c.y-1, 4); setWall(c.x+2, c.y-1, 4);
  setWall(c.x-1, c.y+2, 4); setWall(c.x+2, c.y+2, 4);
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

fs.writeFileSync('public/assets/maps/palace.json', JSON.stringify(map, null, 2));
console.log('Palace map completely redesigned!');
