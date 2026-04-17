// Shared tileset config for all map generators
// Tileset: 512x512 PNG, 4x4 grid of 128x128 tiles
// Tile IDs (1-indexed):
//   1 = Grass,  2 = Dirt/Gravel,  3 = Cobblestone,  4 = Brick Wall,  5 = Dark Water

const TILE_CONFIG = {
  tileheight: 128,
  tilewidth: 128,
  tileset: {
    firstgid: 1,
    name: 'terrain',
    image: 'terrain-tiles.png',
    imageheight: 512,
    imagewidth: 512,
    margin: 0,
    spacing: 0,
    tilecount: 16,
    tileheight: 128,
    tilewidth: 128,
  }
};

module.exports = { TILE_CONFIG };
