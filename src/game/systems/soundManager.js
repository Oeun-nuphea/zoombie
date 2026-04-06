import Phaser from 'phaser'

import { SOUND_DEFINITIONS, DEFAULT_SOUND_VOLUME } from '../config/audio'
import { readStorage, writeStorage } from '../../services/storageService'
import { STORAGE_KEYS } from '../../utils/constants'

const SOUND_MANAGER_KEY = Symbol('zoombie.sound-manager')

function clampVolume(value) {
  return Phaser.Math.Clamp(Number(value) || 0, 0, 1)
}

function getDefinition(key) {
  return SOUND_DEFINITIONS[key] ?? null
}

function applySoundState(sound, definition, state, options = {}) {
  const definitionVolume = options.definitionVolume ?? definition?.volume ?? 1
  const localVolume = options.localVolume ?? 1
  const rate = options.rate ?? 1

  sound.setMute(state.muted)
  sound.setVolume(definitionVolume * state.volume * localVolume)
  sound.setRate(rate)

  if (typeof sound.setDetune === 'function') {
    sound.setDetune(options.detune ?? 0)
  }
}

function createManagedSoundPool(game, definition) {
  const pool = []

  for (let index = 0; index < (definition.poolSize ?? 1); index += 1) {
    pool.push(game.sound.add(definition.key))
  }

  return pool
}

function createSoundManager(scene) {
  const { game } = scene
  const state = {
    muted: Boolean(readStorage(STORAGE_KEYS.soundMuted, false)),
    volume: clampVolume(readStorage(STORAGE_KEYS.soundVolume, DEFAULT_SOUND_VOLUME)),
  }
  const pools = new Map()
  const lastPlayedAt = new Map()
  let musicSound = null
  let queuedMusicKey = null

  function getPool(key) {
    if (!pools.has(key)) {
      const definition = getDefinition(key)

      if (!definition) {
        return []
      }

      pools.set(key, createManagedSoundPool(game, definition))
    }

    return pools.get(key)
  }

  function updateAllSoundState() {
    for (const [key, pool] of pools.entries()) {
      const definition = getDefinition(key)

      if (!definition) {
        continue
      }

      pool.forEach((sound) => applySoundState(sound, definition, state))
    }

    if (musicSound) {
      const definition = getDefinition(musicSound.key)

      if (definition) {
        applySoundState(musicSound, definition, state)
      }
    }
  }

  function resolveDetune(definition, overrideDetune) {
    if (Number.isFinite(overrideDetune)) {
      return overrideDetune
    }

    if (!definition?.detuneRange) {
      return 0
    }

    const [minDetune, maxDetune] = definition.detuneRange
    return Phaser.Math.Between(minDetune, maxDetune)
  }

  function play(key, options = {}) {
    const definition = getDefinition(key)

    if (!definition) {
      return null
    }

    const now = game.loop?.time ?? performance.now()
    const cooldownMs = options.ignoreCooldown ? 0 : definition.cooldownMs ?? 0
    const lastPlayed = lastPlayedAt.get(key) ?? -Infinity

    if (cooldownMs > 0 && now - lastPlayed < cooldownMs) {
      return null
    }

    lastPlayedAt.set(key, now)

    const pool = getPool(key)
    let sound = pool.find((entry) => !entry.isPlaying)

    if (!sound) {
      if (definition.allowRestart === false) {
        return null
      }

      sound = pool[0] ?? game.sound.add(key)

      if (!pool.includes(sound)) {
        pool.push(sound)
      } else {
        sound.stop()
      }
    }

    applySoundState(sound, definition, state, {
      definitionVolume: options.definitionVolume,
      localVolume: options.volume,
      rate: options.rate,
      detune: resolveDetune(definition, options.detune),
    })

    sound.play({
      loop: Boolean(options.loop ?? definition.loop),
    })

    return sound
  }

  function stop(key) {
    getPool(key).forEach((sound) => sound.stop())
  }

  function playMusic(key = 'bgm') {
    const definition = getDefinition(key)

    if (!definition?.loop) {
      return null
    }

    queuedMusicKey = key

    if (musicSound?.key === key) {
      if (musicSound.isPlaying || game.sound.locked) {
        return musicSound
      }

      musicSound.play({ loop: true })
      return musicSound
    }

    stopMusic()
    musicSound = game.sound.add(key)
    applySoundState(musicSound, definition, state)

    const startMusic = () => {
      if (!musicSound || musicSound.isPlaying) {
        return
      }

      musicSound.play({ loop: true })
    }

    if (game.sound.locked) {
      game.sound.once(Phaser.Sound.Events.UNLOCKED, startMusic)
      return musicSound
    }

    startMusic()
    return musicSound
  }

  function stopMusic() {
    if (musicSound) {
      musicSound.stop()
      musicSound.destroy()
      musicSound = null
    }
  }

  function setMuted(nextMuted) {
    state.muted = Boolean(nextMuted)
    writeStorage(STORAGE_KEYS.soundMuted, state.muted)
    updateAllSoundState()

    if (!state.muted && queuedMusicKey && (!musicSound || !musicSound.isPlaying)) {
      playMusic(queuedMusicKey)
    }

    return state.muted
  }

  function toggleMuted() {
    return setMuted(!state.muted)
  }

  function setVolume(nextVolume) {
    state.volume = clampVolume(nextVolume)
    writeStorage(STORAGE_KEYS.soundVolume, state.volume)
    updateAllSoundState()
    return state.volume
  }

  function destroy() {
    stopMusic()
    pools.forEach((pool) => {
      pool.forEach((sound) => sound.destroy())
    })
    pools.clear()
    lastPlayedAt.clear()
  }

  game.events.once(Phaser.Core.Events.DESTROY, destroy)

  return {
    play,
    stop,
    playMusic,
    stopMusic,
    setMuted,
    toggleMuted,
    setVolume,
    destroy,
    get muted() {
      return state.muted
    },
    get volume() {
      return state.volume
    },
  }
}

export function preloadGameAudio(scene) {
  Object.values(SOUND_DEFINITIONS).forEach((definition) => {
    scene.load.audio(definition.key, definition.src)
  })
}

export function getSoundManager(scene) {
  if (!scene.game[SOUND_MANAGER_KEY]) {
    scene.game[SOUND_MANAGER_KEY] = createSoundManager(scene)
  }

  return scene.game[SOUND_MANAGER_KEY]
}

export function registerSoundHotkeys(scene, handlers = {}) {
  const keyboard = scene.input.keyboard

  if (!keyboard) {
    return null
  }

  const soundManager = getSoundManager(scene)
  const muteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M)

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMuted()
    handlers.onMuteChange?.(muted, soundManager.volume)
  }

  muteKey.on('down', handleMuteToggle)

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    muteKey.off('down', handleMuteToggle)
  })

  return soundManager
}
