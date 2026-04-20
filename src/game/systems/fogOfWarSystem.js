/**
 * Fog of War — single smooth radial gradient.
 *
 * Uses a native Canvas `createRadialGradient` to generate a perfect,
 * ring-free gradient texture. Fully visible at the centre, smoothly
 * fades to pitch-black at the edge. One gradient, no layers.
 */
export function createFogOfWarSystem(
  scene,
  { player, radius = 700 } = {},
) {
  // ── Build the gradient brush texture (done ONCE) ────────────────────────
  const BRUSH_SIZE = radius * 2; // Exact diameter for the requested radius (no dynamic scaling needed)
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

  // Hidden image we position each frame then pass to fog.erase()
  // By using an Image object, Phaser respects the default (0.5, 0.5) origin, centering it perfectly.
  const brushImage = scene.add.image(0, 0, BRUSH_KEY);
  brushImage.setVisible(false).setDepth(-999);

  // ── RenderTexture fog ───────────────────────────────────────────────────
  // The fog sheet is centered on the CAMERA midpoint (not the player).
  // This prevents the gap that appears when the player is near a world edge:
  // in that case the camera is bounded and shows far more world on the opposite
  // side than the player-centered approach could cover.
  //
  // The light-circle erase position is computed each frame as the player's
  // world position relative to the fog sheet's top-left corner, so it still
  // correctly follows the player regardless of camera lag.
  //
  // FOG_W / FOG_H must be large enough to cover the full camera viewport at
  // any supported zoom level plus generous margin.  3200×2400 covers a 1920×1080
  // screen at up to ~0.6× zoom with 400 px margin each side — plenty.
  const FOG_W = 3200;
  const FOG_H = 2400;

  let fog = scene.add.renderTexture(0, 0, FOG_W, FOG_H);
  fog.setOrigin(0, 0).setDepth(50);

  // Intro fade
  let introAlpha = 0;
  fog.setAlpha(0);
  let introElapsed = 0;
  const INTRO_MS   = 1200;
  let introComplete = false;

  let isRevealed = false;

  // ── update ─────────────────────────────────────────────────────────────
  function update(delta) {
    if (!player?.active) return;

    if (isRevealed) {
      fog.setAlpha(0);
      return;
    }

    if (!introComplete) {
      introElapsed += delta;
      introAlpha = Math.min(1, introElapsed / INTRO_MS);
      fog.setAlpha(introAlpha);
      if (introAlpha >= 1) introComplete = true;
    } else {
      fog.setAlpha(1);
    }
    
    // Center the fog sheet on the CAMERA midpoint so it always covers the
    // full viewport, even when the camera is bounded at a world edge.
    const cam   = scene.cameras.main;
    const camCX = cam.midPoint.x;
    const camCY = cam.midPoint.y;
    const fogX  = camCX - FOG_W / 2;
    const fogY  = camCY - FOG_H / 2;
    fog.setPosition(fogX, fogY);

    // 1. Fill the sheet with pure black
    fog.fill(0x000000, 1.0);

    // 2. Erase the gradient at the PLAYER'S position within the fog texture.
    //    Offset Y by -40 to centre the light on the torso rather than the feet.
    const eraseX = (player.x       - fogX) - half;
    const eraseY = (player.y - 40  - fogY) - half;
    fog.erase(BRUSH_KEY, eraseX, eraseY);
  }

  function setReveal(reveal) {
    isRevealed = reveal;
  }

  // ── resize ─────────────────────────────────────────────────────────────
  function resize() {
    // handled dynamically in update() due to possible camera zooms
  }

  // ── destroy ─────────────────────────────────────────────────────────────
  function destroy() {
    fog?.destroy();
    brushImage?.destroy();
    if (scene.textures.exists(BRUSH_KEY)) scene.textures.remove(BRUSH_KEY);
  }

  return { update, resize, destroy, setReveal };
}
