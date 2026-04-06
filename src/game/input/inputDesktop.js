import Phaser from 'phaser'

import { getPersistentMovementKeys, resetPersistentMovementKeys } from '../systems/movementInput'

export function createDesktopInput(scene, config = {}) {
  const { player } = config
  const keys = getPersistentMovementKeys()
  const spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  const shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)

  function getMoveVector() {
    const horizontal = Number(keys.right) - Number(keys.left)
    const vertical = Number(keys.down) - Number(keys.up)
    const input = new Phaser.Math.Vector2(horizontal, vertical)

    if (input.lengthSq() > 0) {
      input.normalize().scale(player?.getMoveSpeed?.() ?? 0)
    }

    return input
  }

  function read(time = scene.time.now, delta = scene.game.loop.delta) {
    const pointer = scene.input.activePointer

    pointer.updateWorldPoint?.(scene.cameras.main)

    const dashPressed = Phaser.Input.Keyboard.JustDown(spaceKey) || Phaser.Input.Keyboard.JustDown(shiftKey)

    return {
      time,
      delta,
      moveVector: getMoveVector(),
      pointer,
      shouldShoot: Boolean(pointer?.isDown),
      actions: {
        dash: dashPressed,
        shield: false,
      },
    }
  }

  return {
    mode: 'desktop',
    read,
    destroy() {
      resetPersistentMovementKeys()
    },
  }
}
