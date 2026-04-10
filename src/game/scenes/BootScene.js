import Phaser from 'phaser'

import { registerPlaceholderTextures } from '../managers/assetLoader'
import { getSoundManager, preloadGameAudio } from '../systems/soundManager'
import { ARENA_MAP_ASSETS } from '../../utils/constants'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    preloadGameAudio(this)

    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
      const asset = ARENA_MAP_ASSETS.find((a) => a.key === file.key)
      if (asset) {
        console.warn('[ArenaMap] failed to load map image', {
          key: file.key,
          src: asset.url,
        })
      }
    })

    ARENA_MAP_ASSETS.forEach(asset => {
      this.load.image(asset.key, asset.url)
    })
    
    this.load.tilemapTiledJSON('arena1', '/assets/maps/arena1.json')
    this.load.tilemapTiledJSON('angkor', '/assets/maps/angkor.json')
  }

  create() {
    registerPlaceholderTextures(this)

    const missingMaps = ARENA_MAP_ASSETS.filter((a) => !this.textures.exists(a.key))
    if (missingMaps.length > 0) {
      console.warn('[ArenaMap] missing map images, using procedural fallback for missing ones', {
        expectedPaths: missingMaps.map((a) => `public${a.url}`),
      })
    }

    getSoundManager(this)
    this.scene.start('MainScene')
  }
}
