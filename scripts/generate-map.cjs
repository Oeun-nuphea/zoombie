const fs = require('fs');

// ARENA 1 — Open battlefield with strategic cover: hills, ruins, and mud traps.
// The classic starter map should feel like a real battlefield.
const w = 50;
const h = 38;

const groundData = Array(w * h).fill(1); // base: grass
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

const cx = Math.floor(w / 2);
const cy = Math.floor(h / 2);

// ─── PERIMETER WALLS with 4 large entry gaps ─────────────────────────────────
// Top & bottom border with gaps at center and 1/4 positions
for (let x = 0; x < w; x++) {
  const skip = (Math.abs(x - cx) < 3) || (Math.abs(x - cx * 0.5) < 2) || (Math.abs(x - cx * 1.5) < 2);
  if (!skip) { setWall(x, 0); setWall(x, h - 1); }
}
for (let y = 0; y < h; y++) {
  const skip = (Math.abs(y - cy) < 3) || (Math.abs(y - cy * 0.5) < 2) || (Math.abs(y - cy * 1.5) < 2);
  if (!skip) { setWall(0, y); setWall(w - 1, y); }
}

// ─── CENTRAL OPEN ARENA (smooth dirt pad for player spawn) ───────────────────
fillGround(cx - 5, cy - 4, cx + 5, cy + 4, 2);

// ─── RUINED BUILDING (top-left) ──────────────────────────────────────────────
fillGround(3, 3, 14, 11, 3); // stone floor
// L-shaped ruined walls
for (let x = 3; x <= 14; x++) setWall(x, 3);
for (let y = 3; y <= 11; y++) setWall(3, y);
setWall(14, 3); setWall(14, 4); setWall(14, 5); // partial right wall
setWall(3, 9); setWall(3, 10); setWall(3, 11); // still partial
// Interior pillar
setWall(7, 7); setWall(8, 7);
setWall(7, 8);

// ─── RUINED BUILDING (top-right) ─────────────────────────────────────────────
fillGround(w - 15, 3, w - 4, 11, 3);
for (let x = w - 15; x <= w - 4; x++) setWall(x, 3);
for (let y = 3; y <= 11; y++) setWall(w - 4, y);
setWall(w - 15, 3); setWall(w - 15, 4); setWall(w - 15, 5);
setWall(w - 4, 9); setWall(w - 4, 10); setWall(w - 4, 11);
setWall(w - 9, 7); setWall(w - 8, 7);
setWall(w - 8, 8);

// ─── RUINED BUILDING (bottom-left) ───────────────────────────────────────────
fillGround(3, h - 12, 14, h - 4, 3);
for (let x = 3; x <= 14; x++) setWall(x, h - 4);
for (let y = h - 12; y <= h - 4; y++) setWall(3, y);
setWall(14, h - 4); setWall(14, h - 5); setWall(14, h - 6);
setWall(3, h - 10); setWall(3, h - 11); setWall(3, h - 12);
setWall(7, h - 8); setWall(8, h - 8);
setWall(7, h - 7);

// ─── RUINED BUILDING (bottom-right) ──────────────────────────────────────────
fillGround(w - 15, h - 12, w - 4, h - 4, 3);
for (let x = w - 15; x <= w - 4; x++) setWall(x, h - 4);
for (let y = h - 12; y <= h - 4; y++) setWall(w - 4, y);
setWall(w - 15, h - 4); setWall(w - 15, h - 5); setWall(w - 15, h - 6);
setWall(w - 4, h - 10); setWall(w - 4, h - 11); setWall(w - 4, h - 12);
setWall(w - 9, h - 8); setWall(w - 8, h - 8);
setWall(w - 8, h - 7);

// ─── MUD TRAPS (slow water tiles in mid-field) ────────────────────────────────
// Left mud bog
fillGround(16, cy - 2, 20, cy + 2, 5);
// Right mud bog  
fillGround(w - 21, cy - 2, w - 17, cy + 2, 5);
// Top-center mud puddle
fillGround(cx - 3, 13, cx + 3, 16, 5);
// Bottom-center mud puddle
fillGround(cx - 3, h - 17, cx + 3, h - 14, 5);

// ─── COVER WALLS (scattered for tactical play) ───────────────────────────────
// Horizontal cover walls left side
setWall(17, cy - 6); setWall(18, cy - 6); setWall(19, cy - 6);
setWall(17, cy + 6); setWall(18, cy + 6); setWall(19, cy + 6);
// Horizontal cover walls right side
setWall(w - 20, cy - 6); setWall(w - 19, cy - 6); setWall(w - 18, cy - 6);
setWall(w - 20, cy + 6); setWall(w - 19, cy + 6); setWall(w - 18, cy + 6);
// Vertical cover walls top/bottom
setWall(cx - 7, 17); setWall(cx - 7, 18); setWall(cx - 7, 19);
setWall(cx + 7, 17); setWall(cx + 7, 18); setWall(cx + 7, 19);
setWall(cx - 7, h - 20); setWall(cx - 7, h - 19); setWall(cx - 7, h - 18);
setWall(cx + 7, h - 20); setWall(cx + 7, h - 19); setWall(cx + 7, h - 18);

// ─── DIRT PATHS connecting key areas ─────────────────────────────────────────
// Dirt roads between ruins
fillGround(14, 6, 16, 7, 2);         // top ruin → left mud
fillGround(21, cy - 1, cx - 5, cy, 2); // left mud → center
fillGround(cx + 5, cy - 1, w - 22, cy, 2); // center → right mud
fillGround(w - 16, 6, w - 15, 7, 2);  // top ruin → right mud

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

fs.writeFileSync('public/assets/maps/arena1.json', JSON.stringify(map, null, 2));
console.log(`Arena1 map: ${w}x${h} — 4 corner ruins, mud bogs, cover walls, and dirt paths`);
