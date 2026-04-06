const MOVEMENT_INPUT_STORE_KEY = '__zoombieMovementInputStore__'

const MOVEMENT_KEY_MAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyD: 'right',
  ArrowRight: 'right',
}

function createMovementInputStore() {
  return {
    keys: {
      up: false,
      left: false,
      down: false,
      right: false,
    },
    listenersAttached: false,
  }
}

function getMovementInputStore() {
  if (!globalThis[MOVEMENT_INPUT_STORE_KEY]) {
    globalThis[MOVEMENT_INPUT_STORE_KEY] = createMovementInputStore()
  }

  return globalThis[MOVEMENT_INPUT_STORE_KEY]
}

function setKeyState(code, isPressed) {
  const movementKey = MOVEMENT_KEY_MAP[code]

  if (!movementKey) {
    return false
  }

  getMovementInputStore().keys[movementKey] = isPressed
  return true
}

function handleKeyDown(event) {
  if (setKeyState(event.code, true)) {
    event.preventDefault()
  }
}

function handleKeyUp(event) {
  if (setKeyState(event.code, false)) {
    event.preventDefault()
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    resetPersistentMovementKeys()
  }
}

export function resetPersistentMovementKeys() {
  const { keys } = getMovementInputStore()

  for (const key in keys) {
    keys[key] = false
  }
}

export function getPersistentMovementKeys() {
  const store = getMovementInputStore()

  if (!store.listenersAttached && typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', resetPersistentMovementKeys)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    store.listenersAttached = true
  }

  return store.keys
}
