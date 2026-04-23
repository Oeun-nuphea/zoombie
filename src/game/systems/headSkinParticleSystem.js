import Phaser from 'phaser'

import { HEAD_SKINS } from '../config/playerVisualConfig'

const BLEND_MAP = {
  ADD: Phaser.BlendModes.ADD,
  NORMAL: Phaser.BlendModes.NORMAL,
}

/**
 * Spawn one particle originating from above the player's head.
 * headOffset: emit above the head center instead of body center.
 */
function spawnHeadParticle(scene, centerX, centerY, layer, depthBase) {
  const color = Math.random() > 0.45 ? layer.color : layer.altColor
  const size = Phaser.Math.Between(layer.size[0], layer.size[1])
  const driftX = Phaser.Math.Between(layer.drift.x[0], layer.drift.x[1])
  const driftY = Phaser.Math.Between(layer.drift.y[0], layer.drift.y[1])
  const lifetime = Phaser.Math.Between(layer.lifetime[0], layer.lifetime[1])
  const spreadX = Phaser.Math.Between(-layer.spread, layer.spread)
  const spreadY = Phaser.Math.Between(-layer.spread * 0.4, layer.spread * 0.4)

  // headOffset: emit above the head (roughly -28px from body center)
  const baseX = centerX + spreadX
  const baseY = centerY - 28 + spreadY

  const blendMode = BLEND_MAP[layer.blendMode] ?? Phaser.BlendModes.NORMAL
  const gfx = scene.add.graphics({ x: baseX, y: baseY })
  gfx.setDepth(depthBase)
  gfx.setBlendMode(blendMode)

  if (layer.shape === 'petal') {
    gfx.fillStyle(color, 1)
    gfx.fillEllipse(0, 0, size * 0.6, size * 1.4)
  } else {
    gfx.fillStyle(color, 1)
    gfx.fillCircle(0, 0, size)
  }

  const startRot = layer.spin ? Phaser.Math.FloatBetween(0, Math.PI * 2) : 0
  if (layer.spin) gfx.setRotation(startRot)
  gfx.setAlpha(layer.alphaStart)

  const tweenProps = {
    targets: gfx,
    x: baseX + driftX,
    y: baseY + driftY,
    alpha: 0,
    duration: lifetime,
    ease: layer.wisp ? 'Sine.easeInOut' : 'Quad.easeOut',
    onComplete: () => gfx.destroy(),
  }

  if (layer.shrink)  { tweenProps.scaleX = 0.05; tweenProps.scaleY = 0.05 }
  if (layer.spin)    { tweenProps.rotation = startRot + Phaser.Math.FloatBetween(-Math.PI, Math.PI) }

  scene.tweens.add(tweenProps)
}

/**
 * Create and return a head skin particle system.
 */
export function createHeadSkinParticleSystem(scene, config) {
  const { player, gameStore } = config

  let timers = []

  function getSkinId() {
    return gameStore?.selectedHeadSkin ?? 'none'
  }

  function getDepthBase() {
    return (player?.depth ?? 20) + 3 // above the player sprite
  }

  function getHeadCenter() {
    if (!player?.active) return null
    return { x: player.x, y: player.y }
  }

  function startEmitters() {
    stopEmitters()
    const skinId = getSkinId()
    const skinCfg = HEAD_SKINS[skinId]?.particles
    if (!skinCfg) return

    for (const layer of skinCfg.layers) {
      const timer = scene.time.addEvent({
        delay: layer.intervalMs,
        loop: true,
        callback: () => {
          if (!player?.active || scene.physics.world.isPaused) return
          const pos = getHeadCenter()
          if (!pos) return
          const depth = getDepthBase()
          for (let i = 0; i < layer.count; i++) {
            spawnHeadParticle(scene, pos.x, pos.y, layer, depth)
          }
        },
      })
      timers.push(timer)
    }
  }

  function stopEmitters() {
    for (const t of timers) t.remove(false)
    timers = []
  }

  function destroy() {
    stopEmitters()
  }

  startEmitters()

  return { startEmitters, stopEmitters, destroy, getSkinId }
}
