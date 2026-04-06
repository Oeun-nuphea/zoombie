import { GAME_DIMENSIONS } from '../../utils/constants'

const overlayDepth = 140
const cardY = 300
const cardWidth = 220
const cardHeight = 160
const cardSpacing = 246

function createCard(scene, x, chooseIndex) {
  const panel = scene.add.rectangle(x, cardY, cardWidth, cardHeight, 0x0a1320, 0.94)
  panel.setStrokeStyle(2, 0x29425d, 0.92)
  panel.setDepth(overlayDepth + 2)
  panel.setInteractive({ useHandCursor: true })

  const slot = scene.add.text(x - 86, cardY - 56, '', {
    color: '#94a3b8',
    fontFamily: 'Trebuchet MS',
    fontSize: '15px',
    fontStyle: 'bold',
  })
  slot.setDepth(overlayDepth + 3)

  const title = scene.add.text(x - 86, cardY - 26, '', {
    color: '#f8fafc',
    fontFamily: 'Trebuchet MS',
    fontSize: '28px',
    fontStyle: 'bold',
    stroke: '#08111c',
    strokeThickness: 3,
  })
  title.setDepth(overlayDepth + 3)

  const subtitle = scene.add.text(x - 86, cardY + 12, '', {
    color: '#d7dde8',
    fontFamily: 'Trebuchet MS',
    fontSize: '15px',
    wordWrap: { width: 172 },
  })
  subtitle.setDepth(overlayDepth + 3)

  const prompt = scene.add.text(x - 86, cardY + 58, 'CLICK OR PRESS', {
    color: '#ffd166',
    fontFamily: 'Trebuchet MS',
    fontSize: '14px',
    fontStyle: 'bold',
  })
  prompt.setDepth(overlayDepth + 3)

  panel.on('pointerover', () => {
    panel.setFillStyle(0x122033, 0.98)
    panel.setStrokeStyle(2, 0x5aa9e6, 1)
  })

  panel.on('pointerout', () => {
    panel.setFillStyle(0x0a1320, 0.94)
    panel.setStrokeStyle(2, 0x29425d, 0.92)
  })

  panel.on('pointerup', () => {
    chooseIndex()
  })

  return {
    panel,
    slot,
    title,
    subtitle,
    prompt,
    setVisible(visible) {
      panel.setVisible(visible)
      slot.setVisible(visible)
      title.setVisible(visible)
      subtitle.setVisible(visible)
      prompt.setVisible(visible)
    },
  }
}

export function createWeaponSelectionOverlay(scene) {
  const { width, height } = GAME_DIMENSIONS
  const backdrop = scene.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.78)
  backdrop.setDepth(overlayDepth).setVisible(false).setInteractive()

  const title = scene.add.text(width / 2, 124, 'CHOOSE YOUR LOADOUT', {
    color: '#f8fafc',
    fontFamily: 'Trebuchet MS',
    fontSize: '34px',
    fontStyle: 'bold',
    stroke: '#08111c',
    strokeThickness: 4,
  })
  title.setOrigin(0.5).setDepth(overlayDepth + 1).setVisible(false)

  const subtitle = scene.add.text(width / 2, 164, 'Pick one weapon before the next wave begins.', {
    color: '#cbd5e1',
    fontFamily: 'Trebuchet MS',
    fontSize: '18px',
  })
  subtitle.setOrigin(0.5).setDepth(overlayDepth + 1).setVisible(false)

  const cards = [
    createCard(scene, width / 2 - cardSpacing, () => choose(0)),
    createCard(scene, width / 2, () => choose(1)),
    createCard(scene, width / 2 + cardSpacing, () => choose(2)),
  ]

  let currentChoices = []
  let onSelect = null
  let keyHandler = null
  let isOpen = false

  function setVisible(visible) {
    isOpen = visible
    backdrop.setVisible(visible)
    title.setVisible(visible)
    subtitle.setVisible(visible)
    cards.forEach((card) => card.setVisible(visible))
  }

  function choose(index) {
    if (!isOpen) {
      return
    }

    const choice = currentChoices[index]

    if (!choice) {
      return
    }

    hide()
    onSelect?.(choice.id)
  }

  function hide() {
    setVisible(false)

    if (keyHandler) {
      scene.input.keyboard?.off('keydown', keyHandler)
      keyHandler = null
    }
  }

  function show(choices, selectedWeaponId, selectionHandler) {
    currentChoices = choices
    onSelect = selectionHandler

    cards.forEach((card, index) => {
      const choice = choices[index]
      const isSelected = choice.id === selectedWeaponId

      card.slot.setText(`${index + 1}. ${isSelected ? 'EQUIPPED' : 'LOADOUT'}`)
      card.title.setText(choice.name)
      card.subtitle.setText(choice.description)
      card.prompt.setText(isSelected ? 'CLICK OR PRESS TO KEEP' : 'CLICK OR PRESS TO EQUIP')
      card.panel.setFillStyle(isSelected ? 0x10253a : 0x0a1320, 0.96)
      card.panel.setStrokeStyle(2, isSelected ? 0x76c7ff : 0x29425d, 1)
    })

    setVisible(true)

    keyHandler = (event) => {
      if (event.code === 'Digit1' || event.code === 'Numpad1') {
        choose(0)
      }

      if (event.code === 'Digit2' || event.code === 'Numpad2') {
        choose(1)
      }

      if (event.code === 'Digit3' || event.code === 'Numpad3') {
        choose(2)
      }
    }

    scene.input.keyboard?.on('keydown', keyHandler)
  }

  setVisible(false)

  return {
    hide,
    show,
    get isOpen() {
      return isOpen
    },
  }
}
