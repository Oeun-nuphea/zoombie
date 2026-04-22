#!/usr/bin/env python3
"""
Generate a high-quality 512x512 terrain tileset (4x4 grid of 128x128 tiles).
Tiles are laid out as:
  [1] Grass (lush, varied)    [2] Dirt/Gravel (rough)   [3] Stone (cobble)   [4] Brick Wall
  [5] Dark Water              [6-16] empty/transparent
"""

import math, random
from PIL import Image, ImageDraw, ImageFilter

TILE = 128
COLS = 4
ROWS = 4
OUT_W = TILE * COLS   # 512
OUT_H = TILE * ROWS   # 512

rng = random.Random(42)  # deterministic seed

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

# ─── Simple value noise ────────────────────────────────────────────────────────
def value_noise(x, y, scale=8.0, seed=0):
    """Very fast 2D value noise in [0,1]."""
    xi = int(x / scale) ^ seed
    yi = int(y / scale) ^ (seed * 2654435761)
    def hash2(a, b):
        h = (a * 1664525 + b * 1013904223 + 0x9e3779b9) & 0xFFFFFFFF
        return (h ^ (h >> 16)) / 0xFFFFFFFF
    # bilinear interpolation
    fx = (x / scale) - int(x / scale)
    fy = (y / scale) - int(y / scale)
    v00 = hash2(xi, yi)
    v10 = hash2(xi+1, yi)
    v01 = hash2(xi, yi+1)
    v11 = hash2(xi+1, yi+1)
    # smooth step
    fx = fx*fx*(3-2*fx)
    fy = fy*fy*(3-2*fy)
    return v00*(1-fx)*(1-fy) + v10*fx*(1-fy) + v01*(1-fx)*fy + v11*fx*fy

def fbm(x, y, octaves=4, scale=16.0, seed=0):
    """Fractal brownian motion for richer noise."""
    val = 0.0; amp = 0.5; freq = 1.0; total_amp = 0.0
    for i in range(octaves):
        val += value_noise(x*freq, y*freq, scale, seed+i*97) * amp
        total_amp += amp; amp *= 0.5; freq *= 2.0
    return val / total_amp

# ─── Tile generators ──────────────────────────────────────────────────────────

def make_grass(size=TILE):
    img = Image.new("RGB", (size, size))
    pixels = img.load()
    for py in range(size):
        for px in range(size):
            n = fbm(px, py, octaves=5, scale=12.0, seed=1)
            n2 = fbm(px+200, py+100, octaves=3, scale=6.0, seed=77)
            # Base grass colour range: deep green to bright green
            r = int(clamp(28 + n*30 + n2*8,  20, 65))
            g = int(clamp(72 + n*55 + n2*20, 60, 145))
            b = int(clamp(18 + n*20 + n2*5,  10, 50))
            # Occasional slightly yellower blades
            if n2 > 0.65:
                r = clamp(r+15, 0, 255)
                g = clamp(g+10, 0, 255)
            pixels[px, py] = (r, g, b)
    # Add fine blade streaks
    draw = ImageDraw.Draw(img)
    for _ in range(200):
        sx = rng.randint(0, size-1); sy = rng.randint(0, size-1)
        length = rng.randint(3, 9)
        angle = rng.uniform(-0.4, 0.4)  # near-vertical
        ex = int(sx + length * math.sin(angle))
        ey = int(sy - length * math.cos(angle))
        bright = rng.random() > 0.5
        col = (45, 130, 30) if bright else (20, 80, 15)
        draw.line([(sx, sy), (ex, ey)], fill=col, width=1)
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    return img

def make_dirt(size=TILE):
    img = Image.new("RGB", (size, size))
    pixels = img.load()
    for py in range(size):
        for px in range(size):
            n = fbm(px, py, octaves=5, scale=10.0, seed=3)
            n2 = fbm(px+50, py+300, octaves=3, scale=5.0, seed=55)
            # Earth tones
            r = int(clamp(105 + n*65 + n2*15, 80, 200))
            g = int(clamp(70  + n*40 + n2*10, 50, 140))
            b = int(clamp(35  + n*25 + n2*5,  20, 80))
            pixels[px, py] = (r, g, b)
    # Pebble dots
    draw = ImageDraw.Draw(img)
    for _ in range(60):
        px2 = rng.randint(2, size-2); py2 = rng.randint(2, size-2)
        rad = rng.randint(1, 3)
        shade = rng.randint(55, 95)
        draw.ellipse([px2-rad, py2-rad, px2+rad, py2+rad],
                     fill=(shade+10, shade, shade-10))
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    return img

def make_stone(size=TILE):
    """Cobblestone with mortar lines."""
    img = Image.new("RGB", (size, size))
    pixels = img.load()
    # Base stone colour
    for py in range(size):
        for px in range(size):
            n = fbm(px, py, octaves=4, scale=14.0, seed=7)
            n2 = fbm(px+100, py+400, octaves=2, scale=6.0, seed=13)
            v = int(clamp(115 + n*60 + n2*15, 90, 210))
            pixels[px, py] = (v-5, v, v+8)  # slight blue-grey

    # Draw cobble grid with offset rows
    draw = ImageDraw.Draw(img)
    STONE_W, STONE_H = 28, 22
    mortar = (55, 58, 62)
    for row in range(-1, size // STONE_H + 2):
        offset = (row % 2) * (STONE_W // 2)
        for col in range(-1, size // STONE_W + 2):
            x0 = col * STONE_W + offset - 2
            y0 = row * STONE_H
            x1, y1 = x0 + STONE_W - 2, y0 + STONE_H - 2
            # mortar gap
            draw.rectangle([x0-1, y0-1, x1+1, y1+1], fill=mortar)
    # stone faces
    for row in range(-1, size // STONE_H + 2):
        offset = (row % 2) * (STONE_W // 2)
        for col in range(-1, size // STONE_W + 2):
            x0 = col * STONE_W + offset
            y0 = row * STONE_H
            x1, y1 = x0 + STONE_W - 3, y0 + STONE_H - 3
            if x1 <= x0 or y1 <= y0: continue
            # per-stone random shade
            shade = rng.randint(-20, 20)
            n = fbm(x0+5, y0+5, octaves=2, scale=20.0, seed=11)
            base = int(clamp(140 + n*40 + shade, 100, 210))
            face_col = (base-8, base-2, base+5)
            draw.rectangle([x0, y0, x1, y1], fill=face_col)
            # highlight top-left edge
            draw.line([(x0,y0),(x1,y0)], fill=(base+30, base+25, base+25), width=1)
            draw.line([(x0,y0),(x0,y1)], fill=(base+25, base+20, base+20), width=1)
            # shadow bottom-right edge
            draw.line([(x0,y1),(x1,y1)], fill=(base-30, base-25, base-20), width=1)
            draw.line([(x1,y0),(x1,y1)], fill=(base-25, base-20, base-15), width=1)
    img = img.filter(ImageFilter.GaussianBlur(0.3))
    return img

def make_brick_wall(size=TILE):
    """Top-down stone wall block — viewed from above, with thick shadow border
    suggesting solid height. Used for collision walls in the game."""
    img = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(img)

    # 1. OUTER SHADOW BORDER (suggests the wall has height casting shadow)
    # Multi-layer gradient shadow from outside in
    for i in range(6):
        darkness = int(20 + i * 6)  # gets lighter as we go inward
        c = (darkness, darkness-5, darkness-8)
        draw.rectangle([i, i, size-1-i, size-1-i], outline=c)

    # 2. STONE TOP FACE (the actual top surface of the wall)
    face_margin = 6
    for py in range(face_margin, size - face_margin):
        for px in range(face_margin, size - face_margin):
            n = fbm(px, py, octaves=4, scale=20.0, seed=31)
            n2 = fbm(px+80, py+120, octaves=2, scale=8.0, seed=43)
            # Grey stone with subtle warm tint
            v = int(clamp(80 + n*70 + n2*15, 60, 175))
            img.putpixel((px, py), (v-3, v, v+4))

    # 3. MORTAR CRACK LINES in the stone face (irregular, organic)
    crack_cols = [size//4, size//2, 3*size//4]
    crack_rows = [size//3, 2*size//3]
    mortar = (38, 40, 44)
    for cx in crack_cols:
        jitter = rng.randint(-4, 4)
        draw.line([(cx+jitter, face_margin), (cx, size-face_margin)],
                  fill=mortar, width=1)
    for cy in crack_rows:
        jitter = rng.randint(-4, 4)
        draw.line([(face_margin, cy+jitter), (size-face_margin, cy)],
                  fill=mortar, width=1)

    # 4. HIGHLIGHT CORNER (top-left light source)
    # Top face of wall gets a bright edge
    highlight = (200, 195, 185)
    draw.line([(face_margin, face_margin), (size-face_margin, face_margin)],
              fill=highlight, width=2)
    draw.line([(face_margin, face_margin), (face_margin, size-face_margin)],
              fill=highlight, width=2)

    # 5. SHADOW EDGE (bottom and right = cast shadow)
    shadow = (30, 32, 35)
    draw.line([(face_margin, size-face_margin), (size-face_margin, size-face_margin)],
              fill=shadow, width=3)
    draw.line([(size-face_margin, face_margin), (size-face_margin, size-face_margin)],
              fill=shadow, width=3)

    img = img.filter(ImageFilter.GaussianBlur(0.6))
    return img


def make_water(size=TILE):
    """Deep desert sand/quicksand with wavy dune patterns."""
    img = Image.new("RGB", (size, size))
    pixels = img.load()
    for py in range(size):
        for px in range(size):
            # Dune waves: sine waves at angle + noise
            wave = math.sin((px * 0.8 + py * 0.5) * 0.15) * 0.5 + 0.5
            wave2 = math.sin((px * 0.3 - py * 0.7) * 0.12 + 1.5) * 0.5 + 0.5
            n = fbm(px, py, octaves=4, scale=12.0, seed=23)
            v = wave * 0.4 + wave2 * 0.4 + n * 0.2
            
            # Desert sand tones (yellow/orange/beige)
            r = int(clamp(170 + v*60, 140, 240))
            g = int(clamp(140 + v*55, 110, 210))
            b = int(clamp(100 + v*45,  70, 170))
            pixels[px, py] = (r, g, b)
            
    # Add scattered pebbles/grain
    draw = ImageDraw.Draw(img)
    for _ in range(80):
        gx = rng.randint(3, size-3); gy = rng.randint(3, size-3)
        rad = rng.randint(1, 2)
        draw.ellipse([gx, gy, gx+rad, gy+rad], fill=(150, 120, 80))
        
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    return img

# ─── Assemble tileset ─────────────────────────────────────────────────────────
sheet = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))

tiles = [
    (0, 0, make_grass()),   # tile 1 — top-left
    (1, 0, make_dirt()),    # tile 2
    (2, 0, make_stone()),   # tile 3
    (3, 0, make_brick_wall()), # tile 4
    (0, 1, make_water()),   # tile 5
]

for col, row, tile_img in tiles:
    tile_rgba = tile_img.convert("RGBA")
    sheet.paste(tile_rgba, (col * TILE, row * TILE))

out_path = "public/assets/images/terrain-tiles.png"
sheet.save(out_path, "PNG", optimize=False)
print(f"Saved {OUT_W}x{OUT_H} terrain tileset to {out_path}")
print(f"  Tile size: {TILE}x{TILE}px, Layout: {COLS}x{ROWS}")
print(f"  Tiles: 1=grass, 2=dirt, 3=stone, 4=brick_wall, 5=water")
