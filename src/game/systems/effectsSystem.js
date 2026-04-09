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

  // Wider, darker stains
  for (let index = 0; index < 6 + scaledIntensity * 4; index += 1) {
    stain.fillStyle(0x3e0108, Phaser.Math.FloatBetween(0.2, 0.5))
    stain.fillEllipse(
      Phaser.Math.Between(-32, 32),
      Phaser.Math.Between(-24, 24),
      Phaser.Math.Between(10, 24),
      Phaser.Math.Between(6, 14),
    )
  }

  const burst = scene.add.graphics({ x, y })
  burst.setDepth(24)

  for (let index = 0; index < 8 + scaledIntensity * 5; index += 1) {
    burst.fillStyle(0xdc2626, Phaser.Math.FloatBetween(0.5, 0.9))
    burst.fillCircle(
      Phaser.Math.Between(-24, 24),
      Phaser.Math.Between(-24, 24),
      Phaser.Math.Between(2, 6),
    )
  }

  scene.tweens.add({
    targets: burst,
    alpha: 0,
    duration: 320,
    onComplete: () => burst.destroy(),
  })

  // Stain fades and is destroyed after a much longer wait to keep the arena messy
  scene.tweens.add({
    targets: stain,
    alpha: 0,
    delay: 12000, 
    duration: 2500,
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

export function createLightningArc(scene, x1, y1, x2, y2, options = {}) {
  const { color = 0xa5f3fc, depth = 32, segments = 6, duration = 180 } = options
  const gfx = scene.add.graphics()
  gfx.setDepth(depth).setBlendMode(Phaser.BlendModes.ADD)

  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len
  const ny = dx / len
  const points = [{ x: x1, y: y1 }]

  for (let i = 1; i < segments; i++) {
    const t = i / segments
    const jitter = Phaser.Math.Between(-22, 22)
    points.push({
      x: x1 + dx * t + nx * jitter,
      y: y1 + dy * t + ny * jitter,
    })
  }

  points.push({ x: x2, y: y2 })

  // Outer glow pass
  gfx.lineStyle(4, color, 0.28)
  gfx.beginPath()
  gfx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    gfx.lineTo(points[i].x, points[i].y)
  }
  gfx.strokePath()

  // Core bright pass
  gfx.lineStyle(1.5, 0xffffff, 0.9)
  gfx.beginPath()
  gfx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    gfx.lineTo(points[i].x, points[i].y)
  }
  gfx.strokePath()

  scene.tweens.add({
    targets: gfx,
    alpha: 0,
    duration,
    ease: 'Quad.easeIn',
    onComplete: () => gfx.destroy(),
  })
}

export function createGrenadeExplosion(scene, x, y, radius = 120, options = {}) {
  const { depth = 30, duration = 320 } = options

  // Outer shockwave ring
  const outerRing = scene.add.circle(x, y, 16, 0xfbbf24, 0.8)
  outerRing.setDepth(depth).setBlendMode(Phaser.BlendModes.ADD)
  scene.tweens.add({
    targets: outerRing,
    radius,
    alpha: 0,
    duration,
    ease: 'Cubic.easeOut',
    onComplete: () => outerRing.destroy(),
  })

  // Inner hot-white core flash
  const core = scene.add.circle(x, y, 28, 0xfffde7, 0.95)
  core.setDepth(depth + 1).setBlendMode(Phaser.BlendModes.ADD)
  scene.tweens.add({
    targets: core,
    radius: 6,
    alpha: 0,
    duration: duration * 0.6,
    ease: 'Quad.easeOut',
    onComplete: () => core.destroy(),
  })

  // Sparks
  const sparks = scene.add.graphics({ x, y })
  sparks.setDepth(depth + 2).setBlendMode(Phaser.BlendModes.ADD)
  const sparkCount = Math.min(14, Math.max(6, Math.round(radius / 10)))
  for (let i = 0; i < sparkCount; i++) {
    sparks.fillStyle(0xfb923c, Phaser.Math.FloatBetween(0.6, 1))
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
    const r = Phaser.Math.Between(Math.round(radius * 0.15), Math.round(radius * 0.55))
    sparks.fillCircle(Math.cos(angle) * r, Math.sin(angle) * r, Phaser.Math.Between(3, 7))
  }
  scene.tweens.add({
    targets: sparks,
    alpha: 0,
    scaleX: 1.3,
    scaleY: 1.3,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => sparks.destroy(),
  })

  // Ground scorch
  const scorch = scene.add.circle(x, y, radius * 0.38, 0x1c0a00, 0.55)
  scorch.setDepth(2)
  scene.tweens.add({
    targets: scorch,
    alpha: 0,
    delay: 2500,
    duration: 800,
    onComplete: () => scorch.destroy(),
  })
}
