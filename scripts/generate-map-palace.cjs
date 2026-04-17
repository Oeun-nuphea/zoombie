const fs = require('fs');

// ROYAL PALACE MAP — Fortified maze of corridors, throne room, armouries, and fountains.
const w = 50;
const h = 38;

const groundData = Array(w * h).fill(3); // base: stone/concrete
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
function wallH(x1, x2, y, gapStart = -1, gapSize = 0) {
  for (let x = x1; x <= x2; x++) {
    if (x >= gapStart && x < gapStart + gapSize) continue;
    setWall(x, y);
  }
}
function wallV(y1, y2, x, gapStart = -1, gapSize = 0) {
  for (let y = y1; y <= y2; y++) {
    if (y >= gapStart && y < gapStart + gapSize) continue;
    setWall(x, y);
  }
}

const cx = Math.floor(w / 2);
const cy = Math.floor(h / 2);

// ─── OUTER PALACE WALL (brick perimeter) ─────────────────────────────────────
// Border of solid walls — gameplay is entirely inside
wallH(0, w - 1, 0);
wallH(0, w - 1, h - 1);
wallV(0, h - 1, 0);
wallV(0, h - 1, w - 1);

// ─── THRONE ROOM — Dead center, grand hall with carpet and throne ──────────────
fillGround(cx - 5, cy - 4, cx + 5, cy + 4, 1); // grass "red carpet"
// Throne room walls with entry from N, S, E, W
wallH(cx - 5, cx + 5, cy - 4, cx - 2, 4);   // top wall, gap in middle
wallH(cx - 5, cx + 5, cy + 4, cx - 2, 4);   // bottom wall, gap in middle
wallV(cy - 4, cy + 4, cx - 5, cy - 2, 4);   // left wall, gap in middle
wallV(cy - 4, cy + 4, cx + 5, cy - 2, 4);   // right wall, gap in middle
// Throne alcove back wall
setWall(cx - 1, cy - 4); setWall(cx, cy - 4); setWall(cx + 1, cy - 4);

// ─── ARMOURY ROOMS (4 corners) — walled off with single entries ──────────────
const armouryConfig = [
  { x1: 2, y1: 2, x2: 12, y2: 10, gx: 7, gy: 10, gSide: 'bottom' },
  { x1: w - 13, y1: 2, x2: w - 3, y2: 10, gx: w - 8, gy: 10, gSide: 'bottom' },
  { x1: 2, y1: h - 11, x2: 12, y2: h - 3, gx: 7, gy: h - 11, gSide: 'top' },
  { x1: w - 13, y1: h - 11, x2: w - 3, y2: h - 3, gx: w - 8, gy: h - 11, gSide: 'top' },
];
armouryConfig.forEach(({ x1, y1, x2, y2, gx, gy, gSide }) => {
  fillGround(x1, y1, x2, y2, 2); // dirt floor
  // walls with 2-tile door
  wallH(x1, x2, y1);
  wallH(x1, x2, y2);
  wallV(y1, y2, x1);
  wallV(y1, y2, x2);
  // gap on one side
  if (gSide === 'bottom') { setWall(gx, gy, 0); setWall(gx + 1, gy, 0); wallData[gy * w + gx] = 0; wallData[gy * w + gx + 1] = 0; }
  if (gSide === 'top')    { wallData[gy * w + gx] = 0; wallData[gy * w + gx + 1] = 0; }
  // small crate (wall block) inside each armoury
  setWall(x1 + 3, y1 + 3);
  setWall(x2 - 3, y2 - 3);
});

// ─── MAIN CORRIDORS — Cross-shaped grand hallways ─────────────────────────────
// N-S hall carpet
fillGround(cx - 1, 0, cx + 1, h - 1, 1);
// E-W hall carpet
fillGround(0, cy - 1, w - 1, cy + 1, 1);

// ─── SIDE ROOMS — 6 small rooms along the main corridors ─────────────────────
// Left side rooms (along E-W corridor, on top row)
[[2, 13, 12, 22], [15, 13, 22, 22], [w - 23, 13, w - 16, 22]].forEach(([x1, y1, x2, y2]) => {
  fillGround(x1, y1, x2, y2, 3);
  wallH(x1, x2, y1); wallH(x1, x2, y2);
  wallV(y1, y2, x1); wallV(y1, y2, x2);
  // 2-tile opening on bottom
  wallData[y2 * w + Math.floor((x1 + x2) / 2)] = 0;
  wallData[y2 * w + Math.floor((x1 + x2) / 2) + 1] = 0;
  // water pool inside
  const mx = Math.floor((x1 + x2) / 2), my = Math.floor((y1 + y2) / 2);
  setGround(mx, my, 5); setGround(mx + 1, my, 5);
  setGround(mx, my + 1, 5); setGround(mx + 1, my + 1, 5);
});

// Right side rooms (below corridor)
[[2, h - 23, 12, h - 14], [15, h - 23, 22, h - 14], [w - 23, h - 23, w - 16, h - 14]].forEach(([x1, y1, x2, y2]) => {
  fillGround(x1, y1, x2, y2, 3);
  wallH(x1, x2, y1); wallH(x1, x2, y2);
  wallV(y1, y2, x1); wallV(y1, y2, x2);
  wallData[(y1) * w + Math.floor((x1 + x2) / 2)] = 0;
  wallData[(y1) * w + Math.floor((x1 + x2) / 2) + 1] = 0;
  const mx = Math.floor((x1 + x2) / 2), my = Math.floor((y1 + y2) / 2);
  setGround(mx, my, 5); setGround(mx + 1, my, 5);
  setGround(mx, my + 1, 5); setGround(mx + 1, my + 1, 5);
});

// ─── PILLAR ROWS along the corridors ─────────────────────────────────────────
for (let x = 5; x < w - 5; x += 5) {
  if (Math.abs(x - cx) > 2) {
    setWall(x, cy - 3);
    setWall(x, cy + 3);
  }
}
for (let y = 5; y < h - 5; y += 5) {
  if (Math.abs(y - cy) > 2) {
    setWall(cx - 3, y);
    setWall(cx + 3, y);
  }
}

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

fs.writeFileSync('public/assets/maps/palace.json', JSON.stringify(map, null, 2));
console.log(`Palace map: ${w}x${h} — grand throne room, 4 armouries, 6 side rooms with water pools`);
