import Phaser from 'phaser'

import { getGameRuntimeProfile } from '../../utils/device'

function getParticleScale() {
  return getGameRuntimeProfile().performance.particleScale ?? 1
}

export function createMuzzleFlash(scene, x, y, rotation) {
  const particleScale = getParticleScale()
  const flash = scene.add.graphics({ x, y })
  flash.fillStyle(0xfff7d6, 0.95)
  flash.fillTriangle(0, 0, 32, 8, 32, -8)
  flash.fillStyle(0xff9f43, 0.75)
  flash.fillTriangle(8, 0, 48, 5, 48, -5)
  flash.setRotation(rotation).setDepth(32).setBlendMode(Phaser.BlendModes.ADD)

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scaleX: 1.22 + particleScale * 0.18,
    scaleY: 0.34 + particleScale * 0.08,
    duration: 60 + Math.round(particleScale * 10),
    onComplete: () => flash.destroy(),
  })
}

export function createBloodSplatter(scene, x, y, intensity = 1) {
  const particleScale = getParticleScale()
  const scaledIntensity = Math.max(1, Math.round(intensity * particleScale))
  const stain = scene.add.graphics({ x, y })
  stain.setDepth(2)

  for (let index = 0; index < 4 + scaledIntensity * 3; index += 1) {
    stain.fillStyle(0x5c0b10, Phaser.Math.FloatBetween(0.18, 0.36))
    stain.fillEllipse(
      Phaser.Math.Between(-22, 22),
      Phaser.Math.Between(-14, 14),
      Phaser.Math.Between(6, 16),
      Phaser.Math.Between(4, 10),
    )
  }

  const burst = scene.add.graphics({ x, y })
  burst.setDepth(24)

  for (let index = 0; index < 6 + scaledIntensity * 4; index += 1) {
    burst.fillStyle(0xef4444, Phaser.Math.FloatBetween(0.45, 0.85))
    burst.fillCircle(
      Phaser.Math.Between(-18, 18),
      Phaser.Math.Between(-18, 18),
      Phaser.Math.Between(2, 5),
    )
  }

  scene.tweens.add({
    targets: burst,
    alpha: 0,
    duration: 260,
    onComplete: () => burst.destroy(),
  })

  // Stain fades and is destroyed after a few seconds to prevent accumulation
  scene.tweens.add({
    targets: stain,
    alpha: 0,
    delay: 4000,
    duration: 1200,
    onComplete: () => stain.destroy(),
  })
}

export function createImpactBurst(scene, x, y, options = {}) {
  const particleScale = getParticleScale()
  const {
    color = 0xffa14a,
    radius = 18,
    endRadius = 56,
    alpha = 0.26,
    particleCount = 8,
    depth = 28,
    duration = 220,
  } = options
  const resolvedParticleCount = Math.max(4, Math.round(particleCount * particleScale))

  const ring = scene.add.circle(x, y, radius, color, alpha)
  ring.setStrokeStyle(3, color, 0.75).setDepth(depth)

  const sparks = scene.add.graphics({ x, y })
  sparks.setDepth(depth + 1)

  for (let index = 0; index < resolvedParticleCount; index += 1) {
    sparks.fillStyle(color, Phaser.Math.FloatBetween(0.5, 0.9))
    sparks.fillCircle(
      Phaser.Math.Between(-26, 26),
      Phaser.Math.Between(-26, 26),
      Phaser.Math.Between(2, 5),
    )
  }

  scene.tweens.add({
    targets: ring,
    radius: endRadius,
    alpha: 0,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => ring.destroy(),
  })

  scene.tweens.add({
    targets: sparks,
    alpha: 0,
    scaleX: 1.18,
    scaleY: 1.18,
    duration: duration - 20,
    ease: 'Quad.easeOut',
    onComplete: () => sparks.destroy(),
  })
}

export function createFloatingCombatText(scene, x, y, text, options = {}) {
  const particleScale = getParticleScale()
  const {
    color = '#f8fafc',
    shadowColor = '#2b0b0b',
    fontSize = '22px',
    duration = 700,
    rise = 28,
    depth = 40,
  } = options

  const labelShadow = scene.add.text(x + 2, y + 3, text, {
    color: shadowColor,
    fontFamily: 'Trebuchet MS',
    fontSize,
    fontStyle: 'bold',
  })
  labelShadow.setOrigin(0.5).setDepth(depth).setAlpha(0.88)

  const label = scene.add.text(x, y, text, {
    color,
    fontFamily: 'Trebuchet MS',
    fontSize,
    fontStyle: 'bold',
    stroke: '#111111',
    strokeThickness: 4,
  })
  label.setOrigin(0.5).setDepth(depth + 1)

  scene.tweens.add({
    targets: [label, labelShadow],
    y: `-=${rise}`,
    alpha: 0,
    duration: Math.round(duration * (0.88 + particleScale * 0.12)),
    ease: 'Quad.easeOut',
    onComplete: () => {
      label.destroy()
      labelShadow.destroy()
    },
  })
}
