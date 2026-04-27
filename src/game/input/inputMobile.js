import Phaser from "phaser";

import { getGameRuntimeProfile } from "../../utils/device";

const MOBILE_INPUT_STORE_KEY = "__zoombieMobileInputStore__";
const MOBILE_AIM_DISTANCE = 320;
const MOBILE_ACTIONS = ["dash", "shield"];

function createMobileInputStore() {
  return {
    joystick: {
      x: 0,
      y: 0,
      intensity: 0,
    },
    aimStick: {
      x: 0,
      y: 0,
      intensity: 0,
      active: false,
    },
    actions: {
      dash: false,
      shield: false,
    },
  };
}

function getMobileInputStore() {
  if (!globalThis[MOBILE_INPUT_STORE_KEY]) {
    globalThis[MOBILE_INPUT_STORE_KEY] = createMobileInputStore();
  }

  return globalThis[MOBILE_INPUT_STORE_KEY];
}

function resetActions(store) {
  MOBILE_ACTIONS.forEach((action) => {
    store.actions[action] = false;
  });
}

// ── Movement joystick (left) ────────────────────────────────────────────

export function setMobileJoystick(vector = {}) {
  const store = getMobileInputStore();
  const x = Phaser.Math.Clamp(Number(vector.x) || 0, -1, 1);
  const y = Phaser.Math.Clamp(Number(vector.y) || 0, -1, 1);
  const intensity = Phaser.Math.Clamp(
    Number(vector.intensity) || Math.max(Math.abs(x), Math.abs(y)),
    0,
    1,
  );

  store.joystick.x = x;
  store.joystick.y = y;
  store.joystick.intensity = intensity;
}

export function releaseMobileJoystick() {
  setMobileJoystick({
    x: 0,
    y: 0,
    intensity: 0,
  });
}

// ── Aim joystick (right) ────────────────────────────────────────────────

export function setMobileAimStick(vector = {}) {
  const store = getMobileInputStore();
  const x = Phaser.Math.Clamp(Number(vector.x) || 0, -1, 1);
  const y = Phaser.Math.Clamp(Number(vector.y) || 0, -1, 1);
  const intensity = Phaser.Math.Clamp(
    Number(vector.intensity) || Math.max(Math.abs(x), Math.abs(y)),
    0,
    1,
  );

  store.aimStick.x = x;
  store.aimStick.y = y;
  store.aimStick.intensity = intensity;
  store.aimStick.active = intensity > 0.05;
}

export function releaseMobileAimStick() {
  const store = getMobileInputStore();
  store.aimStick.x = 0;
  store.aimStick.y = 0;
  store.aimStick.intensity = 0;
  store.aimStick.active = false;
}

// ── Actions ─────────────────────────────────────────────────────────────

export function triggerMobileAction(action) {
  const store = getMobileInputStore();

  if (!Object.hasOwn(store.actions, action)) {
    return false;
  }

  store.actions[action] = true;
  return true;
}

export function consumeMobileAction(action) {
  const store = getMobileInputStore();

  if (!Object.hasOwn(store.actions, action)) {
    return false;
  }

  const value = Boolean(store.actions[action]);
  store.actions[action] = false;
  return value;
}

export function resetMobileInput() {
  const store = getMobileInputStore();
  releaseMobileJoystick();
  releaseMobileAimStick();
  resetActions(store);
}

// ── Controller factory ──────────────────────────────────────────────────

export function createMobileInput(scene, config = {}) {
  const { player } = config;
  const virtualPointer = {
    worldX: player?.x ?? 0,
    worldY: player?.y ?? 0,
    isDown: false,
  };

  function getMoveVector() {
    const { joystick } = getMobileInputStore();
    const vector = new Phaser.Math.Vector2(joystick.x, joystick.y);

    if (vector.lengthSq() > 0) {
      vector
        .normalize()
        .scale(
          (player?.getMoveSpeed?.() ?? 0) *
            Math.max(0.42, joystick.intensity || 1),
        );
    }

    return vector;
  }

  function updateVirtualPointer() {
    const { aimStick } = getMobileInputStore();

    if (aimStick.active) {
      // Right stick is active — aim in that direction
      const center = player?.getPlayerCenter?.() ?? {
        x: player.x,
        y: player.y,
      };

      virtualPointer.worldX = center.x + aimStick.x * MOBILE_AIM_DISTANCE;
      virtualPointer.worldY = center.y + aimStick.y * MOBILE_AIM_DISTANCE;
      virtualPointer.isDown = true;
      return;
    }

    // No aim stick — just face forward based on last angle
    const center = player?.getPlayerCenter?.() ?? {
      x: player.x,
      y: player.y,
    };
    const aimAngle = player?.lastAimAngle ?? 0;

    virtualPointer.worldX = center.x + Math.cos(aimAngle) * MOBILE_AIM_DISTANCE;
    virtualPointer.worldY = center.y + Math.sin(aimAngle) * MOBILE_AIM_DISTANCE;
    virtualPointer.isDown = false;
  }

  function read(time = scene.time.now, delta = scene.game.loop.delta) {
    const { aimStick } = getMobileInputStore();
    const moveVector = getMoveVector();

    updateVirtualPointer();

    return {
      time,
      delta,
      moveVector,
      pointer: virtualPointer,
      shouldShoot: aimStick.active,
      actions: {
        dash: consumeMobileAction("dash"),
        shield: consumeMobileAction("shield"),
      },
    };
  }

  return {
    mode: "mobile",
    read,
    destroy() {
      resetMobileInput();
    },
  };
}
