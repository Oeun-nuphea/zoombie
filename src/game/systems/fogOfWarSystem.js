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
  // We use a fixed-dimension texture large enough to cover any zoomed camera view (3200x2400).
  // Instead of dealing with camera offsets which cause physics tearing and UI scaling bugs,
  // the player simply drags this massive black square with them, and the mask hole is permanently in the center!
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

  // ── update ─────────────────────────────────────────────────────────────
  function update(delta) {
    if (!player?.active) return;

    if (!introComplete) {
      introElapsed += delta;
      introAlpha = Math.min(1, introElapsed / INTRO_MS);
      fog.setAlpha(introAlpha);
      if (introAlpha >= 1) introComplete = true;
    }

    // The fog is physically carried by the player, ensuring it never offsets or tears due to camera lag
    // Offset by 40 upwards to align the center of the sheet with the torso, not the feet.
    fog.setPosition(player.x - FOG_W / 2, player.y - 40 - FOG_H / 2);

    // 1. Fill the massive sheet with pure black
    fog.fill(0x000000, 1.0);

    // 2. Erase the gradient by stamping it exactly dead-center in the sheet!
    fog.erase(BRUSH_KEY, FOG_W / 2 - half, FOG_H / 2 - half);
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

  return { update, resize, destroy };
}
