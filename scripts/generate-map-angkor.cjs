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

// 1. The Moat (Water/Mud: Tile 5)
// Outer rectangle of water, with gaps for the Dirt paths (Tile 2)
for (let x = 4; x < w - 4; x++) {
  for (let y = 3; y < h - 3; y++) {
    // Border thickness of 3 tiles for the moat
    const isMoatEdge = x < 7 || x > w - 8 || y < 6 || y > h - 7;
    if (isMoatEdge) {
      // Create gaps in the middle of each edge for the path
      const isPathX = Math.abs(x - w/2) < 2;
      const isPathY = Math.abs(y - h/2) < 2;
      if (isPathX || isPathY) {
        setGround(x, y, 2); // Dirt path across the moat
      } else {
        setGround(x, y, 5); // Water/Mud
      }
    }
  }
}

// 2. Inner Temple Ground (Concrete: Tile 3)
for (let x = 8; x < w - 8; x++) {
  for (let y = 7; y < h - 7; y++) {
    setGround(x, y, 3);
  }
}

// 3. Inner Temple Walls (Brick: Tile 4)
// Draw a rectangular border wall with entrances
for (let x = 8; x < w - 8; x++) {
  for (let y = 7; y < h - 7; y++) {
    const isWallEdge = x === 8 || x === w - 9 || y === 7 || y === h - 8;
    const isEntranceX = Math.abs(x - w/2) < 2;
    const isEntranceY = Math.abs(y - h/2) < 2;
    
    if (isWallEdge && !isEntranceX && !isEntranceY) {
      setWall(x, y, 4);
    }
  }
}

// 4. Central Sanctuary (Brick walls making a smaller square)
for (let x = 16; x < w - 16; x++) {
  for (let y = 12; y < h - 12; y++) {
    const isSanctuaryEdge = x === 16 || x === w - 17 || y === 12 || y === h - 13;
    const isEntranceY = Math.abs(y - h/2) < 1; // 2-tile gap
    const isEntranceX = Math.abs(x - w/2) < 1;
    
    // Only open on North/South/East/West centers
    if (isSanctuaryEdge && !(isEntranceX && (y===12 || y===h-13)) && !(isEntranceY && (x===16 || x===w-17))) {
      setWall(x, y, 4);
    } else {
      // Inside sanctuary is slightly different, maybe dirt (2) or grass (1)
      if (!isSanctuaryEdge) {
        setGround(x, y, 2);
      }
    }
  }
}

// 5. Four Corner Towers (2x2 Brick walls in the corners of the temple grounds)
const corners = [
  {x: 10, y: 9}, {x: w - 12, y: 9},
  {x: 10, y: h - 11}, {x: w - 12, y: h - 11}
];
for (let c of corners) {
  setWall(c.x, c.y, 4);
  setWall(c.x + 1, c.y, 4);
  setWall(c.x, c.y + 1, 4);
  setWall(c.x + 1, c.y + 1, 4);
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

fs.writeFileSync('public/assets/maps/angkor.json', JSON.stringify(map, null, 2));
console.log('Angkor map created at public/assets/maps/angkor.json');
