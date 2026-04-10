import Phaser from 'phaser'

import { createGameConfig } from '../config/gameConfig'

export function createGame(container) {
  const game = new Phaser.Game(createGameConfig(container));
  window.game = game;
  return game;
}
