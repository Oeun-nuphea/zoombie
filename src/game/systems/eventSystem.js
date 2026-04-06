import Phaser from 'phaser'

const SUPPORTED_EVENTS = Object.freeze([
  'onShoot',
  'onHitEnemy',
  'onKillEnemy',
  'onPlayerDamaged',
])

function getListenerBucket(listeners, eventName) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, [])
  }

  return listeners.get(eventName)
}

export function createGameEventSystem(scene) {
  const listeners = new Map(SUPPORTED_EVENTS.map((eventName) => [eventName, []]))

  function on(eventName, handler, options = {}) {
    if (!SUPPORTED_EVENTS.includes(eventName) || typeof handler !== 'function') {
      return () => {}
    }

    const bucket = getListenerBucket(listeners, eventName)
    const entry = {
      handler,
      owner: options.owner ?? null,
      priority: options.priority ?? 0,
    }

    bucket.push(entry)
    bucket.sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))

    return () => {
      const index = bucket.indexOf(entry)

      if (index >= 0) {
        bucket.splice(index, 1)
      }
    }
  }

  function emit(eventName, payload = {}) {
    const bucket = listeners.get(eventName)

    if (!bucket?.length) {
      return payload
    }

    for (const entry of [...bucket]) {
      entry.handler(payload)

      if (payload.cancelled) {
        break
      }
    }

    return payload
  }

  function clearByOwner(owner) {
    if (!owner) {
      return
    }

    listeners.forEach((bucket) => {
      for (let index = bucket.length - 1; index >= 0; index -= 1) {
        if (bucket[index].owner === owner) {
          bucket.splice(index, 1)
        }
      }
    })
  }

  function clear() {
    listeners.forEach((bucket) => {
      bucket.splice(0, bucket.length)
    })
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, clear)

  return {
    on,
    emit,
    clear,
    clearByOwner,
    supportedEvents: SUPPORTED_EVENTS,
  }
}
