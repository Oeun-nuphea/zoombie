import { defineStore } from 'pinia'

import { PLAYER_CONFIG } from '../game/config/gameplayConfig'
import { applyUpgradeToStats, createDefaultPlayerStats, getUpgradeDefinition } from '../game/config/upgrades'
import { DEFAULT_WEAPON_ID } from '../game/config/weapons'
import { readStorage, writeStorage } from '../services/storageService'
import { STORAGE_KEYS } from '../utils/constants'

function getElapsedRunTime(startedAt, finishedAt = Date.now()) {
  if (!startedAt) {
    return 0
  }

  return Math.max(0, finishedAt - startedAt)
}

export const useGameStore = defineStore('game', {
  state: () => ({
    phase: 'idle',
    runMode: 'normal',
    challengeMode: 'none',
    endlessUnlocked: true, // Unlocked by default for demo
    souls: readStorage(STORAGE_KEYS.souls, 0),
    metaUpgrades: readStorage(STORAGE_KEYS.metaUpgrades, { health: 0, speed: 0 }),
    score: 0,
    bestScore: readStorage(STORAGE_KEYS.bestScore, 0),
    lastScore: 0,
    lastWave: 1,
    lastKills: 0,
    lastHeadshots: 0,
    lastSurvivalTimeMs: 0,
    lastOutcome: 'defeat',
    lastRunMode: 'normal',
    health: PLAYER_CONFIG.maxHealth,
    wave: 1,
    zombiesRemaining: 0,
    kills: 0,
    headshots: 0,
    runStartedAt: 0,
    runFinishedAt: 0,
    waveInfo: null,
    weaponId: DEFAULT_WEAPON_ID,
    weaponAmmo: null,
    weaponAmmoMax: null,
    playerStats: createDefaultPlayerStats(),
    upgradeCounts: {},
    upgradeHistory: [],
    upgradeChoices: [],
    upgradeAutoPickEndsAt: 0,
    pendingUpgradeChoice: null,
    temporaryCombatBuff: {
      damage: 0,
      fireRate: 0,
      moveSpeed: 0,
      expiresAt: 0,
      label: '',
    },
    pausedFromPhase: null,
    runId: 0,
  }),
  getters: {
    maxPlayerHealth(state) {
      const metaHealth = Math.min(state.metaUpgrades?.health ?? 0, 20)  // cap at +20
      return state.playerStats.maxHP + metaHealth
    },
    canAccessEndlessMode(state) {
      return Boolean(state.endlessUnlocked)
    },
    playerCombatStats(state) {
      const metaSpeedBonus = Math.min(state.metaUpgrades?.speed ?? 0, 10) * 0.05  // cap at +50%
      
      let baseLifesteal = state.playerStats.lifesteal ?? 0;
      if (state.challengeMode === 'vampire') {
        baseLifesteal += 0.25; // +25% lifesteal
      }

      return {
        ...state.playerStats,
        lifesteal: baseLifesteal,
        damage: Number(((state.playerStats.damage ?? 1) + (state.temporaryCombatBuff?.damage ?? 0)).toFixed(2)),
        fireRate: Number(((state.playerStats.fireRate ?? 1) + (state.temporaryCombatBuff?.fireRate ?? 0)).toFixed(2)),
        moveSpeed: Number(((state.playerStats.moveSpeed ?? 1) + (state.temporaryCombatBuff?.moveSpeed ?? 0) + metaSpeedBonus).toFixed(2)),
      }
    },
  },
  actions: {
    setPhase(phase) {
      this.phase = phase
    },
    setRunMode(mode = 'normal') {
      const wantsEndless = mode === 'endless'
      this.runMode = wantsEndless && !this.endlessUnlocked ? 'normal' : mode
    },
    setChallengeMode(challenge = 'none') {
      this.challengeMode = challenge
    },
    addScore(amount = 1) {
      this.score += amount

      if (this.score > this.bestScore) {
        this.bestScore = this.score
        writeStorage(STORAGE_KEYS.bestScore, this.bestScore)
      }
    },
    addSouls(amount) {
      this.souls += amount
      writeStorage(STORAGE_KEYS.souls, this.souls)
    },
    buyMetaUpgrade(type, cost) {
      const caps = { health: 20, speed: 10 }
      const cap = caps[type] ?? Infinity
      if (!this.metaUpgrades) this.metaUpgrades = { health: 0, speed: 0 }
      if ((this.metaUpgrades[type] ?? 0) >= cap) {
        return false  // already at cap
      }
      if (this.souls >= cost) {
        this.souls -= cost
        this.metaUpgrades[type] = (this.metaUpgrades[type] ?? 0) + 1
        writeStorage(STORAGE_KEYS.souls, this.souls)
        writeStorage(STORAGE_KEYS.metaUpgrades, this.metaUpgrades)
        return true
      }
      return false
    },
    setHealth(value) {
      this.health = value
    },
    setWave(value) {
      this.wave = value
    },
    setWaveInfo(info) {
      this.waveInfo = info
    },
    setWeapon(weaponId) {
      this.weaponId = weaponId
    },
    setWeaponAmmo(ammo, ammoMax = ammo) {
      this.weaponAmmo = Number.isFinite(ammo) ? Math.max(0, Math.floor(ammo)) : null
      this.weaponAmmoMax = Number.isFinite(ammoMax) ? Math.max(0, Math.floor(ammoMax)) : null
    },
    setUpgradeChoices(choices = [], options = {}) {
      this.upgradeChoices = Array.isArray(choices)
        ? choices.map((choice) => ({
            id: choice.id,
            name: choice.name,
            description: choice.description,
            shortDescription: choice.shortDescription ?? choice.description,
            quickLabel: choice.quickLabel ?? '',
            accentColor: choice.accentColor,
            type: choice.type,
          }))
        : []
      this.upgradeAutoPickEndsAt = Number.isFinite(options.autoPickEndsAt) ? options.autoPickEndsAt : 0
      this.pendingUpgradeChoice = null
    },
    chooseUpgrade(upgradeId) {
      this.pendingUpgradeChoice = upgradeId
    },
    consumePendingUpgradeChoice() {
      const nextChoice = this.pendingUpgradeChoice
      this.pendingUpgradeChoice = null
      return nextChoice
    },
    clearUpgradeChoices() {
      this.upgradeChoices = []
      this.upgradeAutoPickEndsAt = 0
      this.pendingUpgradeChoice = null
    },
    setPlayerStats(stats) {
      this.playerStats = {
        ...this.playerStats,
        ...stats,
      }
      this.health = Math.min(this.maxPlayerHealth, this.health)
    },
    setTemporaryCombatBuff(buff = {}, expiresAt = 0, label = '') {
      this.temporaryCombatBuff = {
        damage: Number(buff.damage) || 0,
        fireRate: Number(buff.fireRate) || 0,
        moveSpeed: Number(buff.moveSpeed) || 0,
        expiresAt: Number(expiresAt) || 0,
        label,
      }
    },
    clearTemporaryCombatBuff() {
      this.temporaryCombatBuff = {
        damage: 0,
        fireRate: 0,
        moveSpeed: 0,
        expiresAt: 0,
        label: '',
      }
    },
    equipWeapon(weaponId, ammo = null, ammoMax = ammo) {
      this.weaponId = weaponId
      this.setWeaponAmmo(ammo, ammoMax)
    },
    setZombiesRemaining(value) {
      this.zombiesRemaining = value
    },
    addKill(amount = 1) {
      this.kills += amount
    },
    addHeadshot(amount = 1) {
      this.headshots += amount
    },
    beginRunTimer() {
      this.runStartedAt = Date.now()
      this.runFinishedAt = 0
    },
    consumeWeaponAmmo(amount = 1) {
      if (!Number.isFinite(this.weaponAmmo)) {
        return {
          ammo: null,
          ammoMax: null,
          depleted: false,
        }
      }

      this.weaponAmmo = Math.max(0, this.weaponAmmo - amount)

      return {
        ammo: this.weaponAmmo,
        ammoMax: this.weaponAmmoMax,
        depleted: this.weaponAmmo <= 0,
      }
    },
    restoreWeaponAmmo(amount = 1) {
      if (!Number.isFinite(this.weaponAmmo) || !Number.isFinite(this.weaponAmmoMax)) {
        return {
          ammo: this.weaponAmmo,
          ammoMax: this.weaponAmmoMax,
          restored: 0,
        }
      }

      const previousAmmo = this.weaponAmmo
      this.weaponAmmo = Math.min(this.weaponAmmoMax, this.weaponAmmo + Math.max(0, Math.floor(amount)))

      return {
        ammo: this.weaponAmmo,
        ammoMax: this.weaponAmmoMax,
        restored: this.weaponAmmo - previousAmmo,
      }
    },
    healPlayer(amount = 1) {
      this.health = Math.min(this.maxPlayerHealth, this.health + amount)
    },
    restoreFullHealth() {
      this.health = this.maxPlayerHealth
    },
    damagePlayer(amount = 1) {
      this.health = Math.max(0, this.health - amount)
    },
    pauseRun() {
      if (!['running', 'spawning', 'wave-clear'].includes(this.phase)) {
        return false
      }

      this.pausedFromPhase = this.phase
      this.phase = 'paused'
      return true
    },
    resumeRun() {
      if (this.phase !== 'paused') {
        return false
      }

      this.phase = this.pausedFromPhase ?? 'running'
      this.pausedFromPhase = null
      return true
    },
    togglePause() {
      return this.phase === 'paused'
        ? this.resumeRun()
        : this.pauseRun()
    },
    applyUpgrade(upgradeId) {
      const upgrade = getUpgradeDefinition(upgradeId)

      if (!upgrade) {
        return null
      }

      const previousMaxHealth = this.maxPlayerHealth
      this.playerStats = applyUpgradeToStats(this.playerStats, upgradeId)
      this.upgradeCounts = {
        ...this.upgradeCounts,
        [upgradeId]: (this.upgradeCounts[upgradeId] ?? 0) + 1,
      }
      this.upgradeHistory = [
        ...this.upgradeHistory,
        upgradeId,
      ]

      const gainedMaxHealth = this.maxPlayerHealth - previousMaxHealth
      this.health = Math.min(this.maxPlayerHealth, this.health + Math.max(0, gainedMaxHealth))

      return upgrade
    },
    finishVictory() {
      const finishedAt = Date.now()
      const earnedSouls = Math.max(1, Math.floor(this.score / 15))
      this.addSouls(earnedSouls)

      this.phase = 'victory'
      this.zombiesRemaining = 0
      this.pausedFromPhase = null
      this.clearUpgradeChoices()
      this.runFinishedAt = finishedAt
      this.lastScore = this.score
      this.lastWave = this.wave
      this.lastKills = this.kills
      this.lastHeadshots = this.headshots
      this.lastSurvivalTimeMs = getElapsedRunTime(this.runStartedAt, finishedAt)
      this.lastOutcome = 'victory'
      this.lastRunMode = this.runMode
      this.clearTemporaryCombatBuff()
      this.endlessUnlocked = true
      writeStorage(STORAGE_KEYS.endlessUnlocked, true)
    },
    finishRun() {
      const finishedAt = Date.now()
      const earnedSouls = Math.max(1, Math.floor(this.score / 15))
      this.addSouls(earnedSouls)

      this.phase = 'game-over'
      this.zombiesRemaining = 0
      this.pausedFromPhase = null
      this.clearUpgradeChoices()
      this.runFinishedAt = finishedAt
      this.lastScore = this.score
      this.lastWave = this.wave
      this.lastKills = this.kills
      this.lastHeadshots = this.headshots
      this.lastSurvivalTimeMs = getElapsedRunTime(this.runStartedAt, finishedAt)
      this.lastOutcome = 'defeat'
      this.lastRunMode = this.runMode
      this.clearTemporaryCombatBuff()
    },
    startRun(mode = this.runMode, challenge = this.challengeMode) {
      this.setRunMode(mode)
      this.setChallengeMode(challenge)
      this.phase = 'starting'
      this.score = 0
      this.kills = 0
      this.headshots = 0
      this.runStartedAt = 0
      this.runFinishedAt = 0
      this.playerStats = createDefaultPlayerStats()
      this.upgradeCounts = {}
      this.upgradeHistory = []
      this.pausedFromPhase = null
      this.clearUpgradeChoices()
      this.clearTemporaryCombatBuff()
      this.health = this.maxPlayerHealth
      this.wave = 1
      this.zombiesRemaining = 0
      this.equipWeapon(DEFAULT_WEAPON_ID, null, null)
    },
    reset() {
      this.startRun()
    },
    requestRestart(mode = this.runMode, challenge = this.challengeMode) {
      if (this.phase === 'restarting') {
        console.debug('[GameReset] duplicate restart ignored', {
          runId: this.runId,
        })
        return
      }

      this.setRunMode(mode)
      this.setChallengeMode(challenge)
      this.pausedFromPhase = null
      this.clearUpgradeChoices()
      this.clearTemporaryCombatBuff()
      console.debug('[GameReset] store restart request', {
        currentRunId: this.runId,
        nextRunId: this.runId + 1,
      })
      this.phase = 'restarting'
      this.runId += 1
    },
  },
})
