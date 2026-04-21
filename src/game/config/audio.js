import bgmUrl from '../../assets/sounds/bgm.wav'
import gameOverUrl from '../../assets/sounds/game-over.wav'
import healUrl from '../../assets/sounds/heal.wav'
import pickupUrl from '../../assets/sounds/pickup.wav'
import playerDieUrl from '../../assets/sounds/player--die.mp3'
import playerHitUrl from '../../assets/sounds/player-hit.wav'
import shootUrl from '../../assets/sounds/gun-sound.wav'
import shotgunShootUrl from '../../assets/sounds/snop-sound.wav'
import waveSoundUrl from '../../assets/sounds/wave_sound.mp3'
import zombieDeathUrl from '../../assets/sounds/zombie-die.mp3'
import zombieDieUrl from '../../assets/sounds/zombie-die.mp3'
import zombieHitUrl from '../../assets/sounds/zombie-hit.wav'
import zombieComingUrl from '../../assets/sounds/zombie_coming.mp3'

export const DEFAULT_SOUND_VOLUME = 0.72

export const SOUND_DEFINITIONS = {
  shoot: {
    key: 'shoot',
    src: shootUrl,
    volume: 0.24,
    poolSize: 6,
    cooldownMs: 24,
    detuneRange: [-45, 25],
  },
  'shotgun-shoot': {
    key: 'shotgun-shoot',
    src: shotgunShootUrl,
    volume: 0.38,
    poolSize: 4,
    cooldownMs: 80,
    detuneRange: [-30, 20],
  },
  'zombie-hit': {
    key: 'zombie-hit',
    src: zombieHitUrl,
    volume: 0.22,
    poolSize: 5,
    cooldownMs: 28,
    detuneRange: [-80, 20],
  },
  'headshot-hit': {
    key: 'headshot-hit',
    src: zombieHitUrl,
    volume: 0.28,
    poolSize: 4,
    cooldownMs: 24,
    detuneRange: [40, 120],
  },
  'zombie-death': {
    key: 'zombie-death',
    src: zombieDeathUrl,
    volume: 0.32,
    poolSize: 4,
    cooldownMs: 50,
    detuneRange: [-60, 15],
  },
  'player-hit': {
    key: 'player-hit',
    src: playerHitUrl,
    volume: 0.3,
    poolSize: 3,
    cooldownMs: 110,
    detuneRange: [-30, 0],
  },
  'player-die': {
    key: 'player-die',
    src: playerDieUrl,
    volume: 0.55,
    poolSize: 1,
    cooldownMs: 800,
    allowRestart: false,
  },
  'zombie-die': {
    key: 'zombie-die',
    src: zombieDieUrl,
    volume: 0.36,
    poolSize: 5,
    cooldownMs: 40,
    detuneRange: [-90, 30],
  },
  pickup: {
    key: 'pickup',
    src: pickupUrl,
    volume: 0.28,
    poolSize: 3,
    cooldownMs: 80,
    detuneRange: [-20, 20],
  },
  heal: {
    key: 'heal',
    src: healUrl,
    volume: 0.34,
    poolSize: 3,
    cooldownMs: 100,
    detuneRange: [-10, 10],
  },
  'game-over': {
    key: 'game-over',
    src: gameOverUrl,
    volume: 0.48,
    poolSize: 1,
    cooldownMs: 400,
    allowRestart: true,
  },
  bgm: {
    key: 'bgm',
    src: bgmUrl,
    volume: 0.18,
    poolSize: 1,
    cooldownMs: 0,
    loop: true,
    allowRestart: false,
  },
  'wave-sound': {
    key: 'wave-sound',
    src: waveSoundUrl,
    volume: 1.0,
    poolSize: 1,
    cooldownMs: 0,
  },
  'zombie-coming': {
    key: 'zombie-coming',
    src: zombieComingUrl,
    volume: 0.55,
    poolSize: 2,
    cooldownMs: 2500,
    detuneRange: [-20, 20],
  },
}
