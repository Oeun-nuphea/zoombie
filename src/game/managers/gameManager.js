import Phaser from 'phaser'

import { createGameConfig } from '../config/gameConfig'

export function createGame(container) {
  return new Phaser.Game(createGameConfig(container))
}
