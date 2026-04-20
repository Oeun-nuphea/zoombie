import Phaser from 'phaser'

import BootScene from '../scenes/BootScene'
import MainScene from '../scenes/MainScene'
import { getGameRuntimeProfile } from '../../utils/device'
import { getRuntimeGameDimensions } from '../../utils/gameViewport'

export function createGameConfig(parent) {
  const runtimeProfile = getGameRuntimeProfile()
  const runtimeDimensions = getRuntimeGameDimensions()

  return {
    type: Phaser.AUTO,
    parent,
    width: runtimeDimensions.width,
    height: runtimeDimensions.height,
    backgroundColor: '#020617',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    render: {
      antialias: !runtimeProfile.isMobile,
      roundPixels: false,
      powerPreference: 'high-performance',
    },
    fps: {
      target: 60,
      forceSetTimeOut: true,
    },
    input: {
      activePointers: runtimeProfile.isMobile ? 5 : 2,
      touch: {
        capture: runtimeProfile.isMobile,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: true,
      autoRound: true,
    },
    scene: [BootScene, MainScene],
  }
}
