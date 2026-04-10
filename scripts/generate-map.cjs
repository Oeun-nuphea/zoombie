const fs = require('fs');

const w = 40;
const h = 30;
const groundData = Array(w * h).fill(1); // Grass base
const wallData = Array(w * h).fill(0);   // Empty walls

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}

function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}

// Border walls with gaps
for (let x = 0; x < w; x++) {
  if (x < w/2 - 2 || x > w/2 + 2) {
    setWall(x, 0, 4);
    setWall(x, h-1, 4);
  }
}

// High ground Hills (Tile 2)
for (let x = 4; x < 12; x++) {
  for (let y = 3; y < 8; y++) {
    if (Math.abs(8-x) + Math.abs(5-y) < 5) {
      setGround(x, y, 2);
    }
  }
}

// A ruined building in the center-left
for (let x = 5; x < 15; x++) {
  for (let y = 14; y < 22; y++) {
    setGround(x, y, 3); // concrete floor
    if (x===5 || x===14 || y===14 || y===21) {
      if (y !== 18) setWall(x, y, 4); // walls with gap at y=18
    }
  }
}

// A lake / mud area on the bottom right (slow zone, ground type 5)
for (let x = 25; x < 35; x++) {
  for (let y = 20; y < 28; y++) {
    if (Math.abs(30-x) + Math.abs(24-y) < 6) {
      setGround(x, y, 5);
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

fs.writeFileSync('public/assets/maps/arena1.json', JSON.stringify(map, null, 2));
