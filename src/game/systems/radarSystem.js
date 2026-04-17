import Phaser from "phaser";

export function createRadarSystem(scene, config) {
  const { player, zombies, obstacles, dimensions } = config
  const radarRadius = 64
  const radarScale = 0.05 // map 1.2k distance to 60px
  
  const bg = scene.add.circle(0, 0, radarRadius, 0x0f172a, 0.6)
  bg.setStrokeStyle(2, 0x334155, 0.8)
  bg.setDepth(110).setScrollFactor(0)
  
  const playerDot = scene.add.circle(0, 0, 3, 0xffffff, 1)
  playerDot.setDepth(111).setScrollFactor(0)

  const graphics = scene.add.graphics()
  graphics.setDepth(111).setScrollFactor(0)


  function refreshLayout(dim) {
    const margin = 24
    const cx = dim.width - radarRadius - margin
    const cy = radarRadius + margin
    bg.setPosition(cx, cy)
    playerDot.setPosition(cx, cy)
  }

  function update() {
    graphics.clear()
    if (!player || !zombies || player.isDead) return
    
    const cx = bg.x
    const cy = bg.y
    const viewWidth = scene.cameras.main.width
    const viewHeight = scene.cameras.main.height

    // Draw Obstacles (Gray rects)
    if (obstacles) {
      graphics.fillStyle(0x64748b, 0.7)
      obstacles.children?.iterate(obs => {
        if (!obs || !obs.active) return
        const dx = obs.x - player.x
        const dy = obs.y - player.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        
        if (dist * radarScale > radarRadius - 2) return // Don't draw outside radar
        
        const drawDist = dist * radarScale
        const angle = Math.atan2(dy, dx)
        graphics.fillCircle(cx + Math.cos(angle) * drawDist, cy + Math.sin(angle) * drawDist, 3)
      })
    }
    
    // Draw Zombies (Red dots)
    graphics.fillStyle(0xef4444, 0.8)
    zombies.children?.iterate(z => {
      if (!z || z.isDead || !z.active) return
      const dx = z.x - player.x
      const dy = z.y - player.y
      const dist = Math.sqrt(dx*dx + dy*dy)
      const drawDist = Math.min(dist * radarScale, radarRadius - 2)
      const angle = Math.atan2(dy, dx)
      graphics.fillCircle(cx + Math.cos(angle) * drawDist, cy + Math.sin(angle) * drawDist, z.isBoss ? 4 : 2)
    })
  }

  if (dimensions) {
    refreshLayout(dimensions)
  }

  return { update, refreshLayout }
}

