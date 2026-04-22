import Phaser from "phaser";

import { ARENA_MAP_ASSETS, GAME_DIMENSIONS } from "../../utils/constants";
import { getSceneGameDimensions } from "../../utils/gameViewport";

function drawFallbackArenaBackground(scene, ground, width, height) {
  ground.clear();

  ground.fillStyle(0x2d2421, 1);
  ground.fillRect(0, 0, width, height);

  for (let index = 0; index < 180; index += 1) {
    const alpha = Phaser.Math.FloatBetween(0.03, 0.08);
    const radius = Phaser.Math.Between(10, 44);
    const color = Phaser.Math.Between(0, 1) ? 0x3b302c : 0x241d1a;

    ground.fillStyle(color, alpha);
    ground.fillCircle(
      Phaser.Math.Between(0, width),
      Phaser.Math.Between(0, height),
      radius,
    );
  }

  ground.lineStyle(2, 0x1b1716, 0.2);
  for (let index = 0; index < 52; index += 1) {
    const startX = Phaser.Math.Between(24, width - 24);
    const startY = Phaser.Math.Between(24, height - 24);

    ground.beginPath();
    ground.moveTo(startX, startY);
    ground.lineTo(
      startX + Phaser.Math.Between(-60, 60),
      startY + Phaser.Math.Between(-18, 18),
    );
    ground.lineTo(
      startX + Phaser.Math.Between(-80, 80),
      startY + Phaser.Math.Between(-36, 36),
    );
    ground.strokePath();
  }

  for (let index = 0; index < 44; index += 1) {
    ground.fillStyle(0x76675d, 0.14);
    ground.fillRect(
      Phaser.Math.Between(16, width - 48),
      Phaser.Math.Between(16, height - 48),
      Phaser.Math.Between(8, 24),
      Phaser.Math.Between(6, 16),
    );
  }
}

function createFallbackArenaBackground(scene) {
  const ground = scene.add.graphics();
  const { width, height } = getSceneGameDimensions(scene);

  drawFallbackArenaBackground(scene, ground, width, height);

  const coolWash = scene.add.rectangle(
    width / 2,
    height / 2,
    width,
    height,
    0x0f171d,
    0.08,
  );
  coolWash.setDepth(0);

  function resize(dimensions = getSceneGameDimensions(scene)) {
    drawFallbackArenaBackground(
      scene,
      ground,
      dimensions.width,
      dimensions.height,
    );
    coolWash
      .setPosition(dimensions.width / 2, dimensions.height / 2)
      .setSize(dimensions.width, dimensions.height);
  }

  return {
    coolWash,
    ground,
    resize,
  };
}

function resizeArenaMap(
  scene,
  map,
  assetConfig,
  dimensions = getSceneGameDimensions(scene),
) {
  const sourceImage = scene.textures.get(assetConfig.key)?.getSourceImage();

  if (!sourceImage) {
    map
      .setPosition(0, 0)
      .setOrigin(0)
      .setDisplaySize(dimensions.width, dimensions.height);
    return;
  }

  const scale = Math.max(
    dimensions.width / Math.max(sourceImage.width, 1),
    dimensions.height / Math.max(sourceImage.height, 1),
  );

  map
    .setOrigin(0.5)
    .setPosition(dimensions.width * 0.5, dimensions.height * 0.5)
    .setDisplaySize(
      Math.ceil(sourceImage.width * scale),
      Math.ceil(sourceImage.height * scale),
    );
}

export function createArenaBackground(scene) {
  // Try to load the scheduled tilemap
  const scheduledMapKey = scene.gameStore?.currentRunMap ?? "arena1";

  // ── Adventure map: tile arena1 in a 2×2 grid to fill 4× world ──────────
  if (
    scheduledMapKey === "adventure" &&
    scene.cache.tilemap.has("arena1") &&
    scene.textures.exists("terrain-tiles")
  ) {
    const copies = [];
    let tileW = 0;
    let tileH = 0;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const m = scene.make.tilemap({ key: "arena1" });
        const ts = m.addTilesetImage("terrain", "terrain-tiles", 128, 128);
        tileW = m.widthInPixels;
        tileH = m.heightInPixels;

        const gl = m.createLayer("Ground", ts, col * tileW, row * tileH);
        gl.setDepth(0);

        const wl = m.createLayer("Walls", ts, col * tileW, row * tileH);
        if (wl) {
          wl.setDepth(15);
          wl.setTint(0x4a5a4a);
          wl.setAlpha(0.95);
        }

        copies.push({ map: m, groundLayer: gl, wallLayer: wl });
      }
    }

    scene.physics.world.setBounds(0, 0, tileW * 2, tileH * 2);

    return {
      map: copies[0].map,
      groundLayer: copies[0].groundLayer,
      wallLayer: copies[0].wallLayer,
      extraCopies: copies.slice(1),
      resize: () => {},
    };
  }

  if (
    scene.cache.tilemap.has(scheduledMapKey) &&
    scene.textures.exists("terrain-tiles")
  ) {
    const map = scene.make.tilemap({ key: scheduledMapKey });
    const tileset = map.addTilesetImage("terrain", "terrain-tiles", 128, 128);

    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const wallLayer = map.createLayer("Walls", tileset, 0, 0);

    groundLayer.setDepth(0);

    if (wallLayer) {
      wallLayer.setDepth(15); // Above ground, below player (depth 20)
      // Dark olive-grey tint makes wall blocks read clearly as stone obstacles
      wallLayer.setTint(0x4a5a4a);
      wallLayer.setAlpha(0.95);
    }

    // Set world bounds based on map dimensions
    const widthInPixels = map.widthInPixels;
    const heightInPixels = map.heightInPixels;
    scene.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);

    function resize(dimensions = getSceneGameDimensions(scene)) {
      // Center the map in the screen if it's smaller, otherwise offset
      const x = Math.max(0, (dimensions.width - widthInPixels) / 2);
      const y = Math.max(0, (dimensions.height - heightInPixels) / 2);
      groundLayer.setPosition(x, y);
      if (wallLayer) wallLayer.setPosition(x, y);
    }

    resize();

    return {
      map,
      groundLayer,
      wallLayer,
      resize,
    };
  }

  // Fallback to old background logic if map not loaded
  const selectedMapConfig = Phaser.Math.RND.pick(ARENA_MAP_ASSETS);

  if (scene.textures.exists(selectedMapConfig.key)) {
    const map = scene.add.image(
      GAME_DIMENSIONS.width * 0.5,
      GAME_DIMENSIONS.height * 0.5,
      selectedMapConfig.key,
    );
    map.setDepth(0);
    resizeArenaMap(scene, map, selectedMapConfig);

    return {
      map,
      resize: (dimensions) =>
        resizeArenaMap(scene, map, selectedMapConfig, dimensions),
    };
  }

  return createFallbackArenaBackground(scene);
}
