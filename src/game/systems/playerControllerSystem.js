import Phaser from 'phaser'

import { createDesktopInput } from '../input/inputDesktop'
import { createMobileInput } from '../input/inputMobile'
import { isMobileInputPreferred } from '../../utils/device'

export function createPlayerController(scene, config) {
  const { player, weaponDirector, upgradeDirector, zombies, onShot } = config
  const inputController = isMobileInputPreferred()
    ? createMobileInput(scene, {
        player,
        zombies,
      })
    : createDesktopInput(scene, {
        player,
      })

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    inputController?.destroy?.()
  })

  function update(time, delta) {
    const inputState = inputController.read(time, delta)
    const moveVector = inputState.moveVector ?? new Phaser.Math.Vector2()
    const pointer = inputState.pointer

    player.move(moveVector, delta)
    player.facePointer(pointer, time)
    upgradeDirector?.handleInput({
      time,
      delta,
      moveVector,
      pointer,
      actions: inputState.actions ?? {},
    })

    if (inputState.actions?.dash) {
      player.dodge(time)
    }

    if (!inputState.shouldShoot || player.isDodging) {
      return
    }

    const shot = weaponDirector.fire(pointer, time)

    if (shot) {
      onShot?.(shot)
    }
  }

  return {
    update,
    get mode() {
      return inputController.mode
    },
  }
}
