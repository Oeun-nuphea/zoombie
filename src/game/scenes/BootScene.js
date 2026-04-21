import Phaser from "phaser";

import { registerPlaceholderTextures, registerCustomZombieAnimations } from "../managers/assetLoader";
import { getSoundManager, preloadGameAudio } from "../systems/soundManager";
import { ARENA_MAP_ASSETS } from "../../utils/constants";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    preloadGameAudio(this);

    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
      const asset = ARENA_MAP_ASSETS.find((a) => a.key === file.key);
      if (asset) {
        console.warn("[ArenaMap] failed to load map image", {
          key: file.key,
          src: asset.url,
        });
      }
    });

    ARENA_MAP_ASSETS.forEach((asset) => {
      this.load.image(asset.key, asset.url);
    });

    // Load our new highly detailed photorealistic terrain tiles
    this.load.image("terrain-tiles", "/assets/images/terrain-tiles.png");

    // Load custom zombie sprites as 316x256 (3 cols, 4 rows grid from 948x1024)
    // ?v=${Date.now()} forcefully bypasses all browser caching strategies
    const cacheBuster = Date.now();
    for (let i = 1; i <= 5; i++) {
        this.load.spritesheet(`z${i}`, `/assets/zombiles/z${i}_frame.png?v=${cacheBuster}`, { 
            frameWidth: 316, 
            frameHeight: 256 
        });
    }
    
    // Load custom bosses
    this.load.spritesheet(`giantBoss`, `/assets/zombiles/giantBoss_frame.png?v=${cacheBuster}`, { 
        frameWidth: 316, 
        frameHeight: 256 
    });
    this.load.spritesheet(`miniBoss`, `/assets/zombiles/miniBoss_frame.png?v=${cacheBuster}`, { 
        frameWidth: 316, 
        frameHeight: 256 
    });

    this.load.tilemapTiledJSON("arena1", "/assets/maps/arena1.json");
    this.load.tilemapTiledJSON("angkor", "/assets/maps/angkor.json");
    this.load.tilemapTiledJSON("pagoda", "/assets/maps/pagoda.json");
    this.load.tilemapTiledJSON("palace", "/assets/maps/palace.json");
  }

  create() {
    registerPlaceholderTextures(this);
    registerCustomZombieAnimations(this);

    const missingMaps = ARENA_MAP_ASSETS.filter(
      (a) => !this.textures.exists(a.key),
    );
    if (missingMaps.length > 0) {
      console.warn(
        "[ArenaMap] missing map images, using procedural fallback for missing ones",
        {
          expectedPaths: missingMaps.map((a) => `public${a.url}`),
        },
      );
    }

    getSoundManager(this);
    this.scene.start("MainScene");
  }
}
