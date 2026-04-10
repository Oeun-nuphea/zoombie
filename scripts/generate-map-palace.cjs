const fs = require('fs');

const w = 40;
const h = 30;
// Concrete base everywhere for Palace (Tile 3)
const groundData = Array(w * h).fill(3);
const wallData = Array(w * h).fill(0);

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}

function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}

// Royal Palace: Extensive concrete and long brick walls forming a maze-like courtyard

// 1. Some decorative grass rings (Tile 1) in the corners
const cornerCenters = [
  {x: 6, y: 6}, {x: w - 7, y: 6},
  {x: 6, y: h - 7}, {x: w - 7, y: h - 7}
];
for (let c of cornerCenters) {
  for (let x = c.x - 3; x <= c.x + 3; x++) {
    for (let y = c.y - 3; y <= c.y + 3; y++) {
      if (Math.abs(x - c.x) + Math.abs(y - c.y) <= 4) {
        setGround(x, y, 1);
      }
    }
  }
}

// 2. Central Courtyard walls
for (let x = 6; x < w - 6; x++) {
  for (let y = 6; y < h - 6; y++) {
    // Draw columns / pillars
    if (x % 6 === 0 && y % 5 === 0) {
      setWall(x, y, 4);
    }
  }
}

// 3. Hallway barriers
for (let x = 12; x < w - 12; x++) {
  // Horizontal walls blocking direct line of sight
  setWall(x, 10, 4);
  setWall(x, h - 11, 4);
}

for (let y = 10; y < h - 10; y++) {
  // Vertical walls creating a central chamber box
  // With huge gaps
  if (y < 12 || y > h - 13) {
    setWall(12, y, 4);
    setWall(w - 13, y, 4);
  }
}

// 4. Mini moat inside the palace (Tile 5, decorative water fountain)
for (let x = w/2 - 2; x < w/2 + 2; x++) {
  for (let y = h/2 - 2; y < h/2 + 2; y++) {
    setGround(x, y, 5);
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

fs.writeFileSync('public/assets/maps/palace.json', JSON.stringify(map, null, 2));
console.log('Palace map created!');
