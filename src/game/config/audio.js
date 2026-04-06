import bgmUrl from '../../assets/sounds/bgm.wav'
import gameOverUrl from '../../assets/sounds/game-over.wav'
import healUrl from '../../assets/sounds/heal.wav'
import pickupUrl from '../../assets/sounds/pickup.wav'
import playerHitUrl from '../../assets/sounds/player-hit.wav'
import shootUrl from '../../assets/sounds/shoot.wav'
import zombieDeathUrl from '../../assets/sounds/zombie-death.wav'
import zombieHitUrl from '../../assets/sounds/zombie-hit.wav'

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
}
