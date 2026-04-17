const fs = require('fs');

// SERENE PAGODA MAP — Islands on a massive lake, connected by narrow bridges.
// Player must use bridges as choke points — zombies can be funnelled.
const w = 50;
const h = 38;

const groundData = Array(w * h).fill(5); // base: all water
const wallData = Array(w * h).fill(0);

function setWall(x, y) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = 4;
}
function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}
function fillGround(x1, y1, x2, y2, type) {
  for (let x = x1; x <= x2; x++)
    for (let y = y1; y <= y2; y++)
      setGround(x, y, type);
}
function bridge(x1, y1, x2, y2) {
  // 2-tile wide bridge between two points (horizontal or vertical or diagonal)
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  let x = x1, y = y1;
  while (x !== x2 || y !== y2) {
    setGround(x, y, 3); setGround(x + (dy !== 0 ? 1 : 0), y + (dx !== 0 ? 1 : 0), 3);
    x += dx; y += dy;
  }
  setGround(x2, y2, 3);
}

const cx = Math.floor(w / 2);
const cy = Math.floor(h / 2);

// ─── 5 ISLANDS ──────────────────────────────────────────────────────────────

// 1. Central Main Island (stone base with grass garden ring)
fillGround(cx - 6, cy - 5, cx + 6, cy + 5, 3);  // stone core
fillGround(cx - 4, cy - 3, cx + 4, cy + 3, 1);  // grass garden center
fillGround(cx - 2, cy - 1, cx + 2, cy + 1, 3);  // stone shrine center
// Pagoda pillars
setWall(cx - 3, cy - 2); setWall(cx + 3, cy - 2);
setWall(cx - 3, cy + 2); setWall(cx + 3, cy + 2);
// Corner shrine walls
setWall(cx - 4, cy - 3); setWall(cx + 4, cy - 3);
setWall(cx - 4, cy + 3); setWall(cx + 4, cy + 3);

// 2. North Island (grass lush garden)
fillGround(cx - 5, 2, cx + 5, 12, 1);
fillGround(cx - 3, 4, cx + 3, 10, 2); // dirt center path
// Small pagoda corner pillars
setWall(cx - 4, 3); setWall(cx + 4, 3);
setWall(cx - 4, 11); setWall(cx + 4, 11);

// 3. South Island (ruined stone courtyard)
fillGround(cx - 5, h - 13, cx + 5, h - 3, 3);
fillGround(cx - 3, h - 11, cx + 3, h - 5, 2);
setWall(cx - 4, h - 12); setWall(cx + 4, h - 12);
setWall(cx - 4, h - 4); setWall(cx + 4, h - 4);
// Ruined walls
setWall(cx - 2, h - 9); setWall(cx - 2, h - 8);
setWall(cx + 2, h - 9); setWall(cx + 2, h - 8);

// 4. West Island (dirt outpost with wooden feel — dirt + stone mix)
fillGround(2, cy - 5, 14, cy + 5, 2);
fillGround(4, cy - 3, 12, cy + 3, 3);
setWall(3, cy - 4); setWall(13, cy - 4);
setWall(3, cy + 4); setWall(13, cy + 4);
setWall(7, cy - 3); setWall(7, cy + 3); // internal room divider with gap

// 5. East Island (stone watchtower outpost)
fillGround(w - 15, cy - 5, w - 3, cy + 5, 2);
fillGround(w - 13, cy - 3, w - 5, cy + 3, 3);
setWall(w - 4, cy - 4); setWall(w - 14, cy - 4);
setWall(w - 4, cy + 4); setWall(w - 14, cy + 4);
// Watchtower walls (small inner square)
setWall(w - 9, cy - 2); setWall(w - 9, cy + 2);
setWall(w - 7, cy - 2); setWall(w - 7, cy + 2);

// ─── BRIDGES connecting islands ──────────────────────────────────────────────
// Central ↔ North
for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 5; y > 12; y--) setGround(x, y, 3);
// Central ↔ South
for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy + 5; y < h - 13; y++) setGround(x, y, 3);
// Central ↔ West (zigzag bridge)
for (let x = 14; x < cx - 6; x++) setGround(x, cy, 3);
for (let x = 14; x < cx - 6; x++) setGround(x, cy + 1, 3);
// Central ↔ East
for (let x = cx + 7; x < w - 15; x++) setGround(x, cy, 3);
for (let x = cx + 7; x < w - 15; x++) setGround(x, cy + 1, 3);

// ─── STEPPING STONE CLUSTERS (scattered in far corners) ─────────────────────
const stoneSeeds = [
  [4, 4], [8, 7], [4, h-5], [8, h-8],
  [w-5, 4], [w-9, 7], [w-5, h-5], [w-9, h-8],
  [6, cy-9], [6, cy+9], [w-7, cy-9], [w-7, cy+9],
];
stoneSeeds.forEach(([sx, sy]) => {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (Math.abs(dx) + Math.abs(dy) < 2) setGround(sx + dx, sy + dy, 2); // dirt lily-pad
    }
  }
});

const map = {
  compressionlevel: -1,
  height: h, width: w,
  infinite: false,
  layers: [
    { data: groundData, height: h, width: w, id: 1, name: 'Ground', opacity: 1, type: 'tilelayer', visible: true, x: 0, y: 0 },
    { data: wallData,   height: h, width: w, id: 2, name: 'Walls',  opacity: 1, type: 'tilelayer', visible: true, x: 0, y: 0 }
  ],
  nextlayerid: 3, nextobjectid: 1,
  orientation: 'orthogonal', renderorder: 'right-down',
  tiledversion: "1.10.2", tileheight: 128, tilewidth: 128,
  tilesets: [{ firstgid: 1, name: "terrain", image: "terrain-tiles.png", imageheight: 512, imagewidth: 512, margin: 0, spacing: 0, tilecount: 16, tileheight: 128, tilewidth: 128 }],
  type: 'map', version: '1.10'
};

fs.writeFileSync('public/assets/maps/pagoda.json', JSON.stringify(map, null, 2));
console.log(`Pagoda map: ${w}x${h} — 5 islands on a vast lake with choke-point bridges`);
