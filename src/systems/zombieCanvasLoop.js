import { zombieConfig } from '../config/zombieConfig.js'
import { Zombie } from '../entities/Zombie.js'
import { loadSpriteImage } from './spriteImage.js'

export async function createZombieCanvasLoop(options) {
  const {
    canvas,
    player = { x: 0, y: 0, width: 24, height: 24 },
    zombieOptions = {},
    debug = false,
  } = options

  if (!canvas) {
    throw new Error('createZombieCanvasLoop requires a canvas.')
  }

  const context = canvas.getContext('2d')
  const spriteImage = await loadSpriteImage(zombieConfig.sprite.src, zombieConfig.sprite)
  const zombie = new Zombie({
    x: zombieOptions.x ?? canvas.width * 0.5,
    y: zombieOptions.y ?? canvas.height * 0.28,
    config: {
      ...zombieOptions.config,
      debug,
    },
  })

  let lastTime = performance.now()
  let rafId = 0

  function frame(now) {
    const deltaMs = now - lastTime
    lastTime = now

    context.clearRect(0, 0, canvas.width, canvas.height)
    zombie.update(deltaMs, player)
    zombie.render(context, spriteImage)

    if (debug) {
      context.strokeStyle = '#4da3ff'
      context.lineWidth = 2
      context.strokeRect(player.x - player.width * 0.5, player.y - player.height * 0.5, player.width, player.height)
    }

    rafId = window.requestAnimationFrame(frame)
  }

  rafId = window.requestAnimationFrame(frame)

  return {
    zombie,
    spriteImage,
    stop() {
      window.cancelAnimationFrame(rafId)
    },
  }
}
