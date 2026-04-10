const fs = require('fs');

const w = 40;
const h = 30;
// Base: Dirt (Tile 2)
const groundData = Array(w * h).fill(2);
const wallData = Array(w * h).fill(0);

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}

function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}

// Angkor Temple Design: Concentric rectangles, large moats, and a central sanctuary.
// 1. Surrounding Moat (Tile 5)
for (let x = 3; x < w - 3; x++) {
  for (let y = 3; y < h - 3; y++) {
    // Leave some dirt bridges at the midpoints
    if (Math.abs(x - w/2) > 2 && Math.abs(y - h/2) > 2) {
      if (x < 6 || x > w - 7 || y < 6 || y > h - 7) {
        setGround(x, y, 5); // slow water
      }
    }
  }
}

// 2. Outer Enclosure Wall (Tile 4)
for (let x = 6; x < w - 6; x++) {
  for (let y = 6; y < h - 6; y++) {
    const isEdge = x === 6 || x === w - 7 || y === 6 || y === h - 7;
    const isGap = Math.abs(x - w/2) <= 1 || Math.abs(y - h/2) <= 1;
    if (isEdge && !isGap) {
      setWall(x, y, 4);
    }
  }
}

// 3. Inner Sanctuary (Concrete Floor Tile 3)
for (let x = 12; x < w - 12; x++) {
  for (let y = 10; y < h - 10; y++) {
    setGround(x, y, 3);
  }
}

// 4. Inner Walls & Pillars
for (let x = 14; x < w - 14; x++) {
  for (let y = 12; y < h - 12; y++) {
    const isEdge = x === 14 || x === w - 15 || y === 12 || y === h - 13;
    const isGap = Math.abs(x - w/2) <= 2;
    if (isEdge && !isGap) {
      setWall(x, y, 4);
    }
  }
}
// Central pillar cluster
setWall(w/2 - 1, h/2 - 1, 4);
setWall(w/2 + 1, h/2 - 1, 4);
setWall(w/2 - 1, h/2 + 1, 4);
setWall(w/2 + 1, h/2 + 1, 4);

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

fs.writeFileSync('public/assets/maps/angkor.json', JSON.stringify(map, null, 2));
console.log('Angkor map completely redesigned!');
