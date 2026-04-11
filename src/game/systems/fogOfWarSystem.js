/**
 * Fog of War — single smooth radial gradient.
 *
 * Uses a native Canvas `createRadialGradient` to generate a perfect,
 * ring-free gradient texture. Fully visible at the centre, smoothly
 * fades to pitch-black at the edge. One gradient, no layers.
 */
export function createFogOfWarSystem(
  scene,
  { player, visibilityFraction = 0.84 } = {},
) {
  // ── Build the gradient brush texture (done ONCE) ────────────────────────
  const BRUSH_SIZE = 512; // texture resolution — higher = smoother at large sizes
  const BRUSH_KEY  = '__fog_erase_brush__';

  // Remove any old texture from a previous run (hot-reload safety)
  if (scene.textures.exists(BRUSH_KEY)) {
    scene.textures.remove(BRUSH_KEY);
  }

  const brushTex = scene.textures.createCanvas(BRUSH_KEY, BRUSH_SIZE, BRUSH_SIZE);
  const ctx      = brushTex.getContext('2d');

  const half = BRUSH_SIZE / 2;

  // Single radial gradient: fully opaque centre → fully transparent edge
  ctx.clearRect(0, 0, BRUSH_SIZE, BRUSH_SIZE); // ensure alpha=0 outside gradient
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0.0,  'rgba(255,255,255,1)');  // visible
  grad.addColorStop(1.0,  'rgba(255,255,255,0)');  // fog (transparent in erase = no erase)

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, BRUSH_SIZE, BRUSH_SIZE);
  brushTex.refresh(); // push canvas pixels into the Phaser texture

  // Hidden image we position + scale each frame then pass to fog.erase()
  const brushImage = scene.add.image(0, 0, BRUSH_KEY);
  brushImage.setVisible(false).setDepth(-999);

  // ── RenderTexture fog ───────────────────────────────────────────────────
  const worldBounds = scene.physics.world.bounds;
  let fogW = worldBounds.width;
  let fogH = worldBounds.height;

  let fog = scene.add.renderTexture(0, 0, fogW, fogH);
  fog.setOrigin(0, 0).setDepth(50);

  // Intro fade
  let introAlpha = 0;
  fog.setAlpha(0);
  let introElapsed = 0;
  const INTRO_MS   = 1200;
  let introComplete = false;

  // ── update ─────────────────────────────────────────────────────────────
  function update(delta) {
    if (!player?.active) return;

    if (!introComplete) {
      introElapsed += delta;
      introAlpha = Math.min(1, introElapsed / INTRO_MS);
      fog.setAlpha(introAlpha);
      if (introAlpha >= 1) introComplete = true;
    }

    const radius = Math.min(fogW, fogH) * visibilityFraction;
    const scale  = (radius * 2) / BRUSH_SIZE;

    // Position and scale the gradient image to match the vision radius
    brushImage.setPosition(player.x, player.y);
    brushImage.setScale(scale);

    // 1. Fill with pure black
    fog.fill(0x000000, 1.0);

    // 2. Erase using the smooth radial gradient — no position override, uses image's own transform
    fog.erase(brushImage);
  }

  // ── resize ─────────────────────────────────────────────────────────────
  function resize() {
    const wb = scene.physics.world.bounds;
    fogW = wb.width;
    fogH = wb.height;
    fog.destroy();
    fog = scene.add.renderTexture(0, 0, fogW, fogH);
    fog.setOrigin(0, 0).setDepth(50);
    fog.setAlpha(introComplete ? 1 : introAlpha);
  }

  // ── destroy ─────────────────────────────────────────────────────────────
  function destroy() {
    fog?.destroy();
    brushImage?.destroy();
    if (scene.textures.exists(BRUSH_KEY)) scene.textures.remove(BRUSH_KEY);
  }

  return { update, resize, destroy };
}
