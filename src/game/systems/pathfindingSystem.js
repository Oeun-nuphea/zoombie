import Phaser from 'phaser'

export function createPathfindingSystem(scene, config = {}) {
  const { arena, target, obstacles, updateIntervalMs = 200 } = config
  const map = arena?.map
  const wallLayer = arena?.wallLayer

  if (!map || !wallLayer) {
    return {
      update: () => {},
      getFlowDirection: () => null,
    }
  }

  const width = map.width
  const height = map.height
  const tileW = map.tileWidth
  const tileH = map.tileHeight
  const obstacleMap = new Uint8Array(width * height)
  const integrationField = new Uint16Array(width * height)
  const vectorFieldX = new Float32Array(width * height)
  const vectorFieldY = new Float32Array(width * height)

  // 1. Build static cost map (0 = walkable, 255 = wall)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = wallLayer.getTileAt(x, y)
      // Any tile > 0 in wall layer is an obstacle (0/empty is -1 in Phaser)
      if (tile && tile.index > 0) {
        obstacleMap[y * width + x] = 255
      } else {
        obstacleMap[y * width + x] = 1
      }
    }
  }

  // Inject dynamic obstacles into cost map
  if (obstacles) {
    obstacles.children?.iterate(obs => {
      if (!obs || !obs.active || !obs.body) return
      
      const leftTile = Math.floor(obs.body.left / tileW)
      const rightTile = Math.floor(obs.body.right / tileW)
      const topTile = Math.floor(obs.body.top / tileH)
      const bottomTile = Math.floor(obs.body.bottom / tileH)
      
      for (let ty = topTile; ty <= bottomTile; ty++) {
        for (let tx = leftTile; tx <= rightTile; tx++) {
          if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            obstacleMap[ty * width + tx] = 255
          }
        }
      }
    })
  }

  let lastUpdateTime = 0

  function update(time, force = false) {
    if (!force && time < lastUpdateTime + updateIntervalMs) {
      return
    }
    lastUpdateTime = time

    if (!target || target.isDead) return

    // Find target tile
    // Note: getTileAtWorldXY is relative to the layer's position.
    // If the layer is offset, we must account for it, or use tilemap.worldToTileXY
    const playerPos = wallLayer.worldToTileXY(target.x, target.y)
    if (!playerPos) return
    let startX = playerPos.x
    let startY = playerPos.y

    // Clamp coordinates safely
    startX = Phaser.Math.Clamp(startX, 0, width - 1)
    startY = Phaser.Math.Clamp(startY, 0, height - 1)

    // Reset integration field (65535 = unreachable)
    integrationField.fill(65535)

    // BFS Queue [x, y]
    const queue = [startX, startY]
    integrationField[startY * width + startX] = 0

    const dirs = [
      [0, -1], // N
      [1, 0],  // E
      [0, 1],  // S
      [-1, 0], // W
      [1, -1], // NE
      [1, 1],  // SE
      [-1, 1], // SW
      [-1, -1],// NW
    ]

    // 2. Generate Integration Field (BFS)
    let head = 0
    while (head < queue.length) {
      const cx = queue[head++]
      const cy = queue[head++]
      const currDist = integrationField[cy * width + cx]

      for (const [dx, dy] of dirs) {
        const nx = cx + dx
        const ny = cy + dy

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx
          const cost = obstacleMap[idx]

          // Skip walls
          if (cost === 255) continue

          const newDist = currDist + cost
          if (newDist < integrationField[idx]) {
            integrationField[idx] = newDist
            queue.push(nx, ny)
          }
        }
      }
    }

    // 3. Generate Vector Field (Flow Field)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (obstacleMap[idx] === 255) {
          vectorFieldX[idx] = 0
          vectorFieldY[idx] = 0
          continue
        }

        let bestDist = integrationField[idx]
        let bestX = 0
        let bestY = 0

        for (const [dx, dy] of dirs) {
          const nx = x + dx
          const ny = y + dy

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nDist = integrationField[ny * width + nx]
            if (nDist < bestDist) {
              bestDist = nDist
              bestX = dx
              bestY = dy
            }
          }
        }

        // Normalize vector
        if (bestX !== 0 || bestY !== 0) {
          const len = Math.sqrt(bestX * bestX + bestY * bestY)
          vectorFieldX[idx] = bestX / len
          vectorFieldY[idx] = bestY / len
        } else {
          vectorFieldX[idx] = 0
          vectorFieldY[idx] = 0
        }
      }
    }
  }

  function getFlowDirection(worldX, worldY) {
    const tilePos = wallLayer.worldToTileXY(worldX, worldY)
    if (!tilePos) return null;
    
    const tx = Phaser.Math.Clamp(tilePos.x, 0, width - 1)
    const ty = Phaser.Math.Clamp(tilePos.y, 0, height - 1)
    
    const idx = ty * width + tx
    
    // If the zombie is stuck inside a wall (e.g. knocked back), steer them toward the center or closest open space
    // For now, return what we have (walls default to 0,0 anyway)
    return {
      x: vectorFieldX[idx],
      y: vectorFieldY[idx]
    }
  }

  return {
    update,
    getFlowDirection,
  }
}
