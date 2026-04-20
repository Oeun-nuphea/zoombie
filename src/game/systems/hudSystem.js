import { getGameRuntimeProfile } from '../../utils/device'
import { getSceneGameDimensions } from '../../utils/gameViewport'

export function createCombatHud(scene, _gameStore) {
  const runtimeProfile = getGameRuntimeProfile()
  const isMobileHud = runtimeProfile.isMobile

  const initialDimensions = getSceneGameDimensions(scene)
  const initialCenterX = initialDimensions.width * 0.5

  // ── Layout constants ──────────────────────────────────────────────────────
  // Boss bar sits near the top-centre of the screen
  const BOSS_BAR_W    = isMobileHud ? 340 : 440   // total bar width in px
  const BOSS_BAR_H    = isMobileHud ? 16  : 18     // bar fill height
  const BOSS_FRAME_H  = isMobileHud ? 22  : 24
  const bossGroupY    = isMobileHud ? 58  : 54     // Y of the whole boss UI group
  const bossLabelY    = bossGroupY
  const bossBarY      = bossGroupY + (isMobileHud ? 26 : 28)
  const bannerBaseY   = isMobileHud ? 310 : 290
  const bannerShadowY = bannerBaseY + 6

  // ── Boss UI elements ──────────────────────────────────────────────────────
  let bossTarget          = null
  let displayedHpRatio    = 1   // smoothly animated ratio
  let lastKnownHpRatio    = 1
  let bossBarVisible      = false
  let isPhaseTwo          = false
  let flashTween          = null
  let slideTween          = null
  const SLIDE_AMOUNT      = isMobileHud ? 18 : 24  // px to slide in/out
  let slideOffsetY        = 0   // current offset from canonical Y positions

  // Dark background panel behind the whole boss block
  const bossBg = scene.add.rectangle(initialCenterX, bossLabelY + 14, BOSS_BAR_W + 40, 58, 0x000000, 0.55)
  bossBg.setDepth(99).setVisible(false).setScrollFactor(0)

  // Skull + name label (rendered as a single text object)
  const bossLabel = scene.add.text(initialCenterX, bossLabelY, '💀 BOSS', {
    color: '#fed7aa',
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontSize: isMobileHud ? '15px' : '17px',
    fontStyle: 'bold',
    stroke: '#1a0000',
    strokeThickness: 4,
    shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true },
  })
  bossLabel.setOrigin(0.5, 0).setDepth(102).setVisible(false).setScrollFactor(0)

  // Outer dark frame
  const bossBarFrame = scene.add.rectangle(initialCenterX, bossBarY, BOSS_BAR_W + 8, BOSS_FRAME_H, 0x0a0505, 1)
  bossBarFrame.setStrokeStyle(2, 0x7c2d12, 1).setDepth(100).setVisible(false).setScrollFactor(0)

  // "Ghost" trail bar (white, slides behind the fill to show damage taken)
  const bossBarGhost = scene.add.rectangle(
    initialCenterX - BOSS_BAR_W / 2,
    bossBarY,
    BOSS_BAR_W,
    BOSS_BAR_H,
    0xffffff,
    0.28,
  )
  bossBarGhost.setOrigin(0, 0.5).setDepth(100).setVisible(false).setScrollFactor(0)

  // Main coloured fill
  const bossBarFill = scene.add.rectangle(
    initialCenterX - BOSS_BAR_W / 2,
    bossBarY,
    BOSS_BAR_W,
    BOSS_BAR_H,
    0xf97316,
    1,
  )
  bossBarFill.setOrigin(0, 0.5).setDepth(101).setVisible(false).setScrollFactor(0)

  // HP fraction text  e.g.  "1240 / 2000"
  const bossHpText = scene.add.text(initialCenterX, bossBarY, '', {
    color: '#fff7ed',
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontSize: isMobileHud ? '11px' : '13px',
    fontStyle: 'bold',
    stroke: '#1a0000',
    strokeThickness: 3,
  })
  bossHpText.setOrigin(0.5).setDepth(103).setVisible(false).setScrollFactor(0)

  // ── Banner (flash-up) elements ─────────────────────────────────────────────
  const bannerShadow = scene.add.text(initialCenterX, bannerShadowY, '', {
    color: '#290f09',
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontSize: '34px',
    fontStyle: 'bold',
  })
  bannerShadow.setOrigin(0.5).setDepth(101).setVisible(false).setScrollFactor(0)

  const banner = scene.add.text(initialCenterX, bannerBaseY, '', {
    color: '#f8fafc',
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
    fontSize: '34px',
    fontStyle: 'bold',
    stroke: '#111111',
    strokeThickness: 4,
  })
  banner.setOrigin(0.5).setDepth(102).setVisible(false).setScrollFactor(0)

  // ── Internal helpers ──────────────────────────────────────────────────────
  const ALL_BOSS_NODES = [bossBg, bossLabel, bossBarFrame, bossBarGhost, bossBarFill, bossHpText]

  function _setGroupAlpha(alpha) {
    ALL_BOSS_NODES.forEach((n) => n.setAlpha(alpha))
  }

  function _setGroupVisible(visible) {
    ALL_BOSS_NODES.forEach((n) => n.setVisible(visible))
  }

  function _applyBarWidth(ratio) {
    const w = Math.max(ratio, 0.001) * BOSS_BAR_W
    bossBarFill.setSize(w, BOSS_BAR_H)
  }

  function _applyGhostWidth(ratio) {
    const w = Math.max(ratio, 0.001) * BOSS_BAR_W
    bossBarGhost.setSize(w, BOSS_BAR_H)
  }

  function _barColorForRatio(ratio, isFinal) {
    if (isFinal) return ratio > 0.45 ? 0xef4444 : 0xb91c1c
    return ratio > 0.5 ? 0xf97316 : 0xef4444
  }

  // Apply a Y-offset to all boss nodes relative to their canonical positions.
  // This keeps slide-in/out from drifting on repeated calls.
  function _applySlideOffset(offsetY) {
    slideOffsetY = offsetY
    const cx = getSceneGameDimensions(scene).width * 0.5
    bossBg.setPosition(cx, bossLabelY + 14 + offsetY)
    bossLabel.setPosition(cx, bossLabelY + offsetY)
    bossBarFrame.setPosition(cx, bossBarY + offsetY)
    bossBarGhost.setPosition(cx - BOSS_BAR_W / 2, bossBarY + offsetY)
    bossBarFill.setPosition(cx - BOSS_BAR_W / 2, bossBarY + offsetY)
    bossHpText.setPosition(cx, bossBarY + offsetY)
  }

  function refreshLayout(dimensions = getSceneGameDimensions(scene)) {
    const cx = dimensions.width * 0.5

    bossBg.setPosition(cx, bossLabelY + 14 + slideOffsetY)
    bossLabel.setPosition(cx, bossLabelY + slideOffsetY)
    bossBarFrame.setPosition(cx, bossBarY + slideOffsetY)
    bossBarGhost.setPosition(cx - BOSS_BAR_W / 2, bossBarY + slideOffsetY)
    bossBarFill.setPosition(cx - BOSS_BAR_W / 2, bossBarY + slideOffsetY)
    bossHpText.setPosition(cx, bossBarY + slideOffsetY)
    bannerShadow.setPosition(cx, bannerShadowY)
    banner.setPosition(cx, bannerBaseY)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  function clearBossTarget() {
    if (!bossBarVisible) return
    bossBarVisible = false
    bossTarget = null
    isPhaseTwo = false

    // Slide up + fade out using tracked offset
    slideTween?.stop()
    const slideProxy = { offset: slideOffsetY }
    slideTween = scene.tweens.add({
      targets: slideProxy,
      offset: -SLIDE_AMOUNT,
      duration: 420,
      ease: 'Quad.easeIn',
      onUpdate: () => _applySlideOffset(slideProxy.offset),
      onComplete: () => {
        _setGroupVisible(false)
        _setGroupAlpha(1)
        _applySlideOffset(0)  // reset to canonical position for next show
      },
    })
    scene.tweens.add({
      targets: ALL_BOSS_NODES,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeIn',
    })
  }

  function setBossTarget(target, label = 'BOSS') {
    slideTween?.stop()
    bossTarget = target
    displayedHpRatio = 1
    lastKnownHpRatio = 1
    isPhaseTwo = false

    bossLabel.setText(`💀  ${label.toUpperCase()}`)
    bossBarFrame.setStrokeStyle(2, 0x7c2d12, 1)  // reset frame colour

    // Reset bar to full instantly
    _applyBarWidth(1)
    _applyGhostWidth(1)
    bossBarFill.setFillStyle(0xf97316)
    bossHpText.setText('')

    // Start offscreen above, then slide down to canonical position
    _applySlideOffset(-SLIDE_AMOUNT)
    _setGroupVisible(true)
    _setGroupAlpha(0)

    const slideProxy = { offset: -SLIDE_AMOUNT }
    slideTween = scene.tweens.add({
      targets: slideProxy,
      offset: 0,
      duration: 500,
      ease: 'Back.easeOut',
      onUpdate: () => _applySlideOffset(slideProxy.offset),
    })
    scene.tweens.add({
      targets: ALL_BOSS_NODES,
      alpha: 1,
      duration: 360,
      ease: 'Quad.easeOut',
    })

    bossBarVisible = true
  }

  function flashPhaseTwo() {
    if (isPhaseTwo) return
    isPhaseTwo = true

    // Red flash on the bar frame to signal enrage
    flashTween?.stop()
    let flashes = 0
    flashTween = scene.tweens.add({
      targets: bossBarFrame,
      strokeAlpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onRepeat: () => {
        flashes++
        bossBarFrame.setStrokeStyle(2, flashes % 2 === 0 ? 0x7c2d12 : 0xef4444, 1)
      },
      onComplete: () => {
        bossBarFrame.setStrokeStyle(2, 0xef4444, 1)
      },
    })
  }

  // Ghost bar lags behind the real fill (delayed tween toward real value)
  let ghostTween = null

  function update() {
    const hasLivingBoss = bossTarget?.active && !bossTarget.isDead

    if (!hasLivingBoss) {
      clearBossTarget()
      return
    }

    if (!bossBarVisible) return

    const maxHp  = Math.ceil(Math.max(1, bossTarget.maxHealth ?? bossTarget.health))
    const currHp = Math.ceil(Math.max(0, bossTarget.health))
    const ratio  = Math.max(0, currHp / maxHp)

    // Detect phase-two transition inside hud
    if (bossTarget.isFinalBoss && ratio <= 0.45 && !isPhaseTwo) {
      flashPhaseTwo()
    } else if (!bossTarget.isFinalBoss && ratio <= 0.5 && !isPhaseTwo) {
      flashPhaseTwo()
    }

    // Smooth fill: instantly snap fill to ratio, ghost lags behind with tween
    if (ratio < lastKnownHpRatio) {
      // HP dropped — snap fill, start ghost catch-up 
      displayedHpRatio = ratio
      _applyBarWidth(displayedHpRatio)
      bossBarFill.setFillStyle(_barColorForRatio(ratio, bossTarget.isFinalBoss))

      // Ghost starts catching up after a short delay
      ghostTween?.stop()
      ghostTween = scene.tweens.add({
        targets: { val: lastKnownHpRatio },
        val: ratio,
        delay: 220,
        duration: 380,
        ease: 'Quad.easeOut',
        onUpdate: (tween) => {
          _applyGhostWidth(tween.targets[0].val)
        },
      })

      lastKnownHpRatio = ratio
    } else if (ratio > lastKnownHpRatio) {
      // HP restored (heal) — both snap forward
      displayedHpRatio = ratio
      lastKnownHpRatio = ratio
      _applyBarWidth(ratio)
      _applyGhostWidth(ratio)
      bossBarFill.setFillStyle(_barColorForRatio(ratio, bossTarget.isFinalBoss))
    }

    bossHpText.setText(`${currHp} / ${maxHp}`)
  }

  function flashBanner(text, color = '#f8fafc') {
    scene.tweens.killTweensOf([banner, bannerShadow])

    banner.setY(bannerBaseY)
    bannerShadow.setY(bannerShadowY)
    banner.setText(text).setColor(color).setVisible(true).setAlpha(1).setScale(1)
    bannerShadow.setText(text).setVisible(true).setAlpha(0.9).setScale(1)

    scene.tweens.add({
      targets: [banner, bannerShadow],
      alpha: 0,
      y: '-=22',
      duration: 900,
      onComplete: () => {
        banner.setVisible(false).setY(bannerBaseY)
        bannerShadow.setVisible(false).setY(bannerShadowY)
      },
    })
  }

  refreshLayout()

  return {
    update,
    flashBanner,
    refreshLayout,
    setBossTarget,
    clearBossTarget,
  }
}
