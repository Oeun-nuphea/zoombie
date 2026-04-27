import Phaser from "phaser";

export function createRadarSystem(scene, config) {
  const { player, zombies, obstacles, dimensions } = config;
  
  // Create a square/rectangular minimap for the entire arena
  const uiSize = 140; // Max dimension of the minimap
  const worldWidth = dimensions?.width || 3200;
  const worldHeight = dimensions?.height || 2400;

  // Maintain aspect ratio of the world
  const maxDim = Math.max(worldWidth, worldHeight);
  const scale = uiSize / maxDim;
  
  const mapW = worldWidth * scale;
  const mapH = worldHeight * scale;

  const bg = scene.add.rectangle(0, 0, mapW, mapH, 0x0f172a, 0.6).setOrigin(0.5);
  bg.setStrokeStyle(2, 0x334155, 0.8);
  bg.setDepth(110).setScrollFactor(0);
  
  const graphics = scene.add.graphics();
  graphics.setDepth(111).setScrollFactor(0);
  
  const staticGraphics = scene.add.graphics();
  staticGraphics.setDepth(110).setScrollFactor(0); // Right above the background, below dynamic entities
  
  function drawStaticElements() {
    staticGraphics.clear();
    if (!obstacles) return;
    
    // Top-left of the minimap rendering area
    const startX = bg.x - mapW / 2;
    const startY = bg.y - mapH / 2;

    staticGraphics.fillStyle(0x64748b, 0.7);
    obstacles.children?.iterate(obs => {
      if (!obs || !obs.active) return;
      const drawX = startX + (obs.x * scale);
      const drawY = startY + (obs.y * scale);
      staticGraphics.fillCircle(drawX, drawY, 2);
    });
  }

  function refreshLayout(dim) {
    const margin = 24;
    const hpOffsetY = 80; // Leave space for the HP element
    
    // Position at top-left
    const cx = mapW / 2 + margin;
    const cy = mapH / 2 + margin + hpOffsetY;
    
    bg.setPosition(cx, cy);
    drawStaticElements(); // Redraw static layer on resize/layout shift
  }

  let radarFrameSkip = 0;

  function update() {
    // Throttle: only redraw every 3 frames (minimap doesn't need 60fps)
    radarFrameSkip++;
    if (radarFrameSkip < 3) return;
    radarFrameSkip = 0;

    graphics.clear();
    if (!player || !zombies || player.isDead) return;
    
    // Top-left of the minimap rendering area
    const startX = bg.x - mapW / 2;
    const startY = bg.y - mapH / 2;
    
    // Draw Zombies (Red dots)
    graphics.fillStyle(0xef4444, 0.8);
    zombies.children?.iterate(z => {
      if (!z || z.isDead || !z.active) return;
      const drawX = startX + (z.x * scale);
      const drawY = startY + (z.y * scale);
      const size = z.isBoss ? 4 : 2;
      graphics.fillRect(drawX - size/2, drawY - size/2, size, size);
    });

    // Draw Player (White dot)
    graphics.fillStyle(0xffffff, 1);
    const pDrawX = startX + (player.x * scale);
    const pDrawY = startY + (player.y * scale);
    graphics.fillCircle(pDrawX, pDrawY, 3);
  }

  if (dimensions) {
    // Note: 'dimensions' contains the world width/height.
    // However, refreshLayout expects screen dimensions (the viewport) which we don't have stored here initially.
    // It will receive the correct viewport dim on the first refreshLayout call.
    // For safety, assume a generic 1920x1080 if not yet called.
    refreshLayout({ width: scene.cameras.main.width, height: scene.cameras.main.height });
  }

  return { update, refreshLayout };
}
