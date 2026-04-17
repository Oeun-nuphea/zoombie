const fs = require('fs');

// ANGKOR WAT TEMPLE MAP — Massive ruin with layered courtyards, moats, and choke bridges
const w = 50; // wider world
const h = 38; // taller world

const groundData = Array(w * h).fill(2); // base: dirt/gravel
const wallData = Array(w * h).fill(0);

function setWall(x, y, type = 4) {
  if (x >= 0 && x < w && y >= 0 && y < h) wallData[y * w + x] = type;
}
function setGround(x, y, type) {
  if (x >= 0 && x < w && y >= 0 && y < h) groundData[y * w + x] = type;
}
function fillGround(x1, y1, x2, y2, type) {
  for (let x = x1; x <= x2; x++)
    for (let y = y1; y <= y2; y++)
      setGround(x, y, type);
}
function wallLine(x1, y1, x2, y2) {
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  let x = x1, y = y1;
  while (x !== x2 || y !== y2) {
    setWall(x, y, 4);
    x += dx; y += dy;
  }
  setWall(x2, y2, 4);
}
function wallRect(x1, y1, x2, y2) {
  for (let x = x1; x <= x2; x++) { setWall(x, y1, 4); setWall(x, y2, 4); }
  for (let y = y1; y <= y2; y++) { setWall(x1, y, 4); setWall(x2, y, 4); }
}
function wallRectWithGaps(x1, y1, x2, y2, gaps) {
  // gaps: [{side:'top'|'bottom'|'left'|'right', pos:number, size:number}]
  const isGap = (x, y) => gaps.some(g => {
    if (g.side === 'top' && y === y1) return x >= g.pos && x < g.pos + g.size;
    if (g.side === 'bottom' && y === y2) return x >= g.pos && x < g.pos + g.size;
    if (g.side === 'left' && x === x1) return y >= g.pos && y < g.pos + g.size;
    if (g.side === 'right' && x === x2) return y >= g.pos && y < g.pos + g.size;
    return false;
  });
  for (let x = x1; x <= x2; x++) {
    if (!isGap(x, y1)) setWall(x, y1, 4);
    if (!isGap(x, y2)) setWall(x, y2, 4);
  }
  for (let y = y1; y <= y2; y++) {
    if (!isGap(x1, y)) setWall(x1, y, 4);
    if (!isGap(x2, y)) setWall(x2, y, 4);
  }
}

const cx = Math.floor(w / 2); // 25
const cy = Math.floor(h / 2); // 19

// ─── 1. OUTER MOAT (water ring) ─────────────────────────────────────────────
// Full water surrounding
for (let x = 2; x < w - 2; x++) {
  for (let y = 2; y < h - 2; y++) {
    const isOuterMoat = x < 5 || x >= w - 5 || y < 5 || y >= h - 5;
    if (isOuterMoat) setGround(x, y, 5);
  }
}
// Outer moat with 4 causeways (bridges) at each cardinal direction
for (let x = cx - 1; x <= cx + 1; x++) {
  for (let y = 0; y < h; y++) setGround(x, y, 2); // N-S bridge
}
for (let y = cy - 1; y <= cy + 1; y++) {
  for (let x = 0; x < w; x++) setGround(x, y, 2); // E-W bridge
}

// ─── 2. FIRST COURTYARD — Outer enclosure (stone floors) ────────────────────
fillGround(5, 5, w - 6, h - 6, 3);

// Outer enclosure wall with 4 gateway gaps
wallRectWithGaps(5, 5, w - 6, h - 6, [
  { side: 'top',    pos: cx - 2, size: 5 }, // N gate
  { side: 'bottom', pos: cx - 2, size: 5 }, // S gate
  { side: 'left',   pos: cy - 2, size: 5 }, // W gate
  { side: 'right',  pos: cy - 2, size: 5 }, // E gate
]);

// Corner towers (2×2 solid walls)
[[6,6],[w-8,6],[6,h-8],[w-8,h-8]].forEach(([tx,ty]) => {
  setWall(tx,ty,4); setWall(tx+1,ty,4);
  setWall(tx,ty+1,4); setWall(tx+1,ty+1,4);
});

// ─── 3. INNER MOAT — second ring of water inside first courtyard ─────────────
for (let x = 10; x < w - 10; x++) {
  for (let y = 9; y < h - 9; y++) {
    const isInnerMoat = x < 12 || x >= w - 12 || y < 11 || y >= h - 11;
    if (isInnerMoat) setGround(x, y, 5);
  }
}

// ─── 4. SECOND COURTYARD — inner platform (dirt base) ───────────────────────
fillGround(12, 11, w - 13, h - 12, 2);

// Inner enclosure wall with tight gaps
wallRectWithGaps(12, 11, w - 13, h - 12, [
  { side: 'top',    pos: cx - 1, size: 3 },
  { side: 'bottom', pos: cx - 1, size: 3 },
  { side: 'left',   pos: cy - 1, size: 3 },
  { side: 'right',  pos: cy - 1, size: 3 },
]);

// ─── 5. SANCTUARY — Central holy chamber (stone floor) ──────────────────────
fillGround(16, 14, w - 17, h - 15, 3);

// Sanctuary wall — only 2-tile gate gaps
wallRectWithGaps(16, 14, w - 17, h - 15, [
  { side: 'top',    pos: cx - 1, size: 3 },
  { side: 'bottom', pos: cx - 1, size: 3 },
  { side: 'left',   pos: cy - 1, size: 3 },
  { side: 'right',  pos: cy - 1, size: 3 },
]);

// ─── 6. PILLARS inside the inner courtyard (cover between moats) ─────────────
// Left quadrant pillars
[[8,7],[8,h-8],[w-9,7],[w-9,h-8]].forEach(([px,py]) => {
  setWall(px, py, 4);
});

// Inside sanctuary — 4 symmetrical pillar groups (corner altar blocks)
[[18,16],[w-19,16],[18,h-17],[w-19,h-17]].forEach(([px,py]) => {
  setWall(px, py, 4);
  setWall(px+1, py, 4);
  setWall(px, py+1, 4);
  setWall(px+1, py+1, 4);
});

// Central shrine (tiny walled square, open player spawn area)
setWall(cx - 2, cy - 2, 4); setWall(cx + 2, cy - 2, 4);
setWall(cx - 2, cy + 2, 4); setWall(cx + 2, cy + 2, 4);

// ─── 7. RUINED SECTIONS — partial walls for interesting sightlines ────────────
// North wing partial columns
wallLine(6, 8, 6, 10);
wallLine(w - 7, 8, w - 7, 10);
wallLine(6, h - 9, 6, h - 11);
wallLine(w - 7, h - 9, w - 7, h - 11);

// East–West corridor rubble (scattered walls breaking line of sight)
setWall(14, cy - 4, 4); setWall(14, cy + 4, 4);
setWall(w - 15, cy - 4, 4); setWall(w - 15, cy + 4, 4);

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

fs.writeFileSync('public/assets/maps/angkor.json', JSON.stringify(map, null, 2));
console.log(`Angkor map: ${w}x${h} tiles (${w*64}x${h*64}px) — 3 layered courtyards with moats & choke bridges`);
