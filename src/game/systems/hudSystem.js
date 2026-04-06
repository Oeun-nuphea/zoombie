import { getGameRuntimeProfile } from '../../utils/device'
import { getSceneGameDimensions } from '../../utils/gameViewport'

export function createCombatHud(scene, _gameStore) {
  const runtimeProfile = getGameRuntimeProfile()
  const isMobileHud = runtimeProfile.isMobile
  const initialDimensions = getSceneGameDimensions(scene)
  const initialCenterX = initialDimensions.width * 0.5
  const bossLabelY = isMobileHud ? 160 : 150
  const bossBarY = isMobileHud ? 188 : 178
  const bannerBaseY = isMobileHud ? 250 : 230
  const bannerShadowY = bannerBaseY + 6
  let bossTarget = null

  const bossLabel = scene.add.text(initialCenterX, bossLabelY, 'BOSS', {
    color: '#fed7aa',
    fontFamily: 'Trebuchet MS',
    fontSize: '16px',
    fontStyle: 'bold',
    stroke: '#111111',
    strokeThickness: 3,
  })
  bossLabel.setOrigin(0.5).setDepth(101).setVisible(false)

  const bossBarFrame = scene.add.rectangle(initialCenterX, bossBarY, 432, 22, 0x120b0c, 0.92)
  bossBarFrame.setStrokeStyle(2, 0x7c2d12, 0.95).setDepth(100).setVisible(false)

  const bossBarFill = scene.add.rectangle(initialCenterX - 210, bossBarY, 420, 12, 0xf97316, 1)
  bossBarFill.setOrigin(0, 0.5).setDepth(101).setVisible(false)

  const bossHpText = scene.add.text(initialCenterX, bossBarY, '', {
    color: '#fff7ed',
    fontFamily: 'Trebuchet MS',
    fontSize: '13px',
    fontStyle: 'bold',
    stroke: '#111111',
    strokeThickness: 3,
  })
  bossHpText.setOrigin(0.5).setDepth(102).setVisible(false)

  const bannerShadow = scene.add.text(initialCenterX, bannerShadowY, '', {
    color: '#290f09',
    fontFamily: 'Trebuchet MS',
    fontSize: '34px',
    fontStyle: 'bold',
  })
  bannerShadow.setOrigin(0.5).setDepth(101).setVisible(false)

  const banner = scene.add.text(initialCenterX, bannerBaseY, '', {
    color: '#f8fafc',
    fontFamily: 'Trebuchet MS',
    fontSize: '34px',
    fontStyle: 'bold',
    stroke: '#111111',
    strokeThickness: 4,
  })
  banner.setOrigin(0.5).setDepth(102).setVisible(false)

  function refreshLayout(dimensions = getSceneGameDimensions(scene)) {
    const centerX = dimensions.width * 0.5

    bossLabel.setPosition(centerX, bossLabelY)
    bossBarFrame.setPosition(centerX, bossBarY)
    bossBarFill.setPosition(centerX - 210, bossBarY)
    bossHpText.setPosition(centerX, bossBarY)
    bannerShadow.setPosition(centerX, bannerShadowY)
    banner.setPosition(centerX, bannerBaseY)
  }

  function setBossBarVisible(visible) {
    bossLabel.setVisible(visible)
    bossBarFrame.setVisible(visible)
    bossBarFill.setVisible(visible)
    bossHpText.setVisible(visible)
  }

  function clearBossTarget() {
    bossTarget = null
    setBossBarVisible(false)
  }

  function setBossTarget(target, label = 'MINI BOSS') {
    bossTarget = target
    bossLabel.setText(label.toUpperCase())
    setBossBarVisible(Boolean(target))
  }

  function update() {
    const hasLivingBoss = bossTarget?.active && !bossTarget.isDead

    if (!hasLivingBoss) {
      clearBossTarget()
      return
    }

    const bossHealthRatio = Math.max(0, bossTarget.health / Math.max(1, bossTarget.maxHealth ?? bossTarget.health))
    bossBarFill.setScale(Math.max(bossHealthRatio, 0.001), 1)
    bossBarFill.setFillStyle(
      bossTarget.isFinalBoss
        ? (bossHealthRatio > 0.45 ? 0xef4444 : 0xb91c1c)
        : (bossHealthRatio > 0.5 ? 0xf97316 : 0xef4444),
    )
    bossHpText.setText(`${Math.ceil(Math.max(0, bossTarget.health))} / ${Math.ceil(Math.max(1, bossTarget.maxHealth ?? bossTarget.health))}`)
    setBossBarVisible(true)
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
