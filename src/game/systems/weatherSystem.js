import Phaser from 'phaser';

export function createWeatherSystem(scene, { fogOfWar, soundManager }) {
  const STORM_INTERVAL_MIN = 35000; // 35s
  const STORM_INTERVAL_MAX = 55000; // 55s
  
  let nextStormAt = scene.time.now + Phaser.Math.Between(STORM_INTERVAL_MIN, STORM_INTERVAL_MAX);
  let isStorming = false;

  function triggerLightning() {
    if (isStorming) return;
    isStorming = true;

    // 1. Darken the atmosphere slightly before the flash
    // We'll use a local screen tint/overlay if needed, but for now let's just do the flash
    
    // 2. Pre-flash rumble (optional but cool)
    // soundManager?.play('zombie-hit', { volume: 0.3, rate: 0.5 });

    scene.time.delayedCall(800, () => {
      // 3. THE FLASH
      const flash = scene.add.rectangle(
        scene.cameras.main.midPoint.x, 
        scene.cameras.main.midPoint.y, 
        scene.cameras.main.width * 2, 
        scene.cameras.main.height * 2, 
        0xffffff, 
        0.8
      );
      flash.setDepth(200).setScrollFactor(0);
      
      // Lift Fog of War
      fogOfWar?.setReveal(true);

      // Sound - Loud thunder crack
      // We use zombie-death slowed down for a heavy boom
      soundManager?.play('zombie-death', { volume: 1.5, rate: 0.35, ignoreCooldown: true });

      // Screen Shake
      scene.cameras.main.shake(400, 0.008);

      // Fade out flash and return fog
      scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          flash.destroy();
          // Keep revealed for a tiny bit longer for the "snapshot" effect
          scene.time.delayedCall(150, () => {
            fogOfWar?.setReveal(false);
            isStorming = false;
            nextStormAt = scene.time.now + Phaser.Math.Between(STORM_INTERVAL_MIN, STORM_INTERVAL_MAX);
          });
        }
      });

      // Second smaller "after-flash"
      scene.time.delayedCall(100, () => {
        const flash2 = scene.add.rectangle(
          scene.cameras.main.midPoint.x, 
          scene.cameras.main.midPoint.y, 
          scene.cameras.main.width * 2, 
          scene.cameras.main.height * 2, 
          0xffffff, 
          0.4
        );
        flash2.setDepth(200).setScrollFactor(0);
        scene.tweens.add({
          targets: flash2,
          alpha: 0,
          duration: 300,
          onComplete: () => flash2.destroy()
        });
      });
    });
  }

  function update() {
    if (scene.time.now > nextStormAt && !isStorming) {
      triggerLightning();
    }
  }

  return { update, triggerLightning };
}
