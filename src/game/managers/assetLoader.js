import { WEAPON_DEFINITIONS, getWeaponDropTextureKey } from '../config/weapons'
import { HEALTH_DROP_DEFINITIONS, getHealthDropTextureKey } from '../config/dropItems'
import { PLAYER_CARRIED_WEAPON_TEXTURE, PLAYER_FRAME_POSES } from '../config/playerVisualConfig'

const zombieOutline = '#311a4d'
const zombieSkin = '#3fa06f'
const zombieSkinDark = '#256d54'
const zombieHair = '#b7c45a'
const zombieHairDark = '#8fa240'
const hoodieWhite = '#ececec'
const hoodieShadow = '#c4c4c4'
const blood = '#9e4d4a'
const pants = '#3a3a3d'
const shoeBlue = '#4a67c5'
const eyeWhite = '#f5efb1'
const survivorOutline = '#151924'
const survivorSkin = '#efbfab'
const survivorSkinShadow = '#d39182'
const survivorHair = '#d7d8dc'
const survivorHairShadow = '#aaafb7'
const survivorShirt = '#8b8550'
const survivorShirtShadow = '#66613c'
const survivorShirtDark = '#504c2d'
const survivorRibbonRed = '#d73e36'
const survivorRibbonBlue = '#274ac7'
const survivorRibbonGold = '#dfb74a'
const survivorPants = '#303845'
const survivorBoot = '#262830'
const survivorBootTop = '#515766'
const survivorGunDark = '#1a1e24'
const survivorGunAccent = '#444f5f'

const zombieSheetConfig = {
  rawKey: 'zombie-topdown',
  frameWidth: 192,
  frameHeight: 192,
  columns: 6,
  alphaTolerance: 32,
  animations: {
    idle: [0, 1, 2, 3, 4, 5],
    walk: [6, 7, 8, 9, 10, 11],
    attack: [12, 15, 16, 17, 16, 15],
    hit: [15],
    death: [16, 17],
  },
}

const ZOMBIE_SHEET_DEBUG = import.meta.env.DEV

const zombieFramePoses = [
  ['zombie-idle-0', { bob: 0, lean: 0.01, headTilt: -0.05, armLeft: 0.8, armRight: -0.58, legLeft: 0.08, legRight: -0.05 }],
  ['zombie-idle-1', { bob: -2, lean: -0.01, headTilt: 0.04, armLeft: 0.72, armRight: -0.5, legLeft: 0.03, legRight: -0.02 }],
  ['zombie-walk-0', { bob: -1, lean: 0.04, headTilt: -0.08, armLeft: 1.0, armRight: -0.78, legLeft: 0.22, legRight: -0.22 }],
  ['zombie-walk-1', { bob: 1, lean: -0.04, headTilt: 0.08, armLeft: 0.55, armRight: -0.35, legLeft: -0.18, legRight: 0.24 }],
  ['zombie-attack-0', { bob: -2, lean: 0.1, headTilt: -0.06, armLeft: 0.24, armRight: -0.12, legLeft: 0.04, legRight: -0.04, reach: 12 }],
  ['zombie-attack-1', { bob: -1, lean: 0.15, headTilt: -0.02, armLeft: 0.1, armRight: 0.02, legLeft: 0.08, legRight: -0.02, reach: 20 }],
  ['zombie-hit', { bob: 0, lean: -0.14, headTilt: 0.18, armLeft: 1.1, armRight: -0.3, legLeft: 0.14, legRight: -0.14, hit: true }],
  ['zombie-death-0', { bob: 8, lean: 0.28, headTilt: 0.28, armLeft: 1.52, armRight: -1.0, legLeft: 0.72, legRight: -0.42, dead: true }],
  ['zombie-death-1', { bob: 18, lean: 0.52, headTilt: 0.44, armLeft: 1.74, armRight: -1.26, legLeft: 1.04, legRight: -0.78, dead: true }],
]

const zombiePoseLibrary = {
  idle: [zombieFramePoses[0][1], zombieFramePoses[1][1]],
  walk: [zombieFramePoses[2][1], zombieFramePoses[3][1]],
  attack: [zombieFramePoses[4][1], zombieFramePoses[5][1], zombieFramePoses[4][1]],
  hit: [zombieFramePoses[6][1]],
  death: [zombieFramePoses[7][1], zombieFramePoses[8][1]],
}

const zombieVisualStyles = {
  walker: {
    outline: '#121418',
    skin: '#93b15a',
    skinShade: '#586d30',
    scalp: '#b4c974',
    torso: '#7a7369',
    torsoShade: '#4b453d',
    pants: '#43485a',
    shoe: '#5c6273',
    shoeTip: '#b7bcc8',
    eyeGlow: '#f3e56d',
    mouth: '#3a2218',
    blood: '#6f232a',
    shadow: '#000000',
    shadowAlpha: 0.24,
    torsoWidth: 54,
    torsoHeight: 42,
    torsoRadius: 16,
    shoulderOffset: 24,
    hipOffset: 12,
    armLength: 30,
    legLeft: 36,
    legRight: 39,
    limbThickness: 13,
    handSize: 10,
    headX: 28,
    headY: 31,
    headRadiusX: 27,
    headRadiusY: 30,
    bodyY: 58,
    walkFps: 6,
    attackFps: 8,
  },
  runner: {
    outline: '#101217',
    skin: '#8ca55a',
    skinShade: '#495f2a',
    scalp: '#abbd64',
    torso: '#89817a',
    torsoShade: '#59524c',
    pants: '#2f3d67',
    shoe: '#485265',
    shoeTip: '#a6b1c2',
    eyeGlow: '#ffd36a',
    mouth: '#412016',
    blood: '#7b2424',
    shadow: '#000000',
    shadowAlpha: 0.22,
    torsoWidth: 48,
    torsoHeight: 38,
    torsoRadius: 14,
    shoulderOffset: 22,
    hipOffset: 10,
    armLength: 28,
    legLeft: 39,
    legRight: 42,
    limbThickness: 11,
    handSize: 8,
    headX: 26,
    headY: 30,
    headRadiusX: 24,
    headRadiusY: 27,
    bodyY: 56,
    baseLean: 0.05,
    walkFps: 9,
    attackFps: 11,
  },
  tank: {
    outline: '#0e1115',
    skin: '#9aa287',
    skinShade: '#677055',
    scalp: '#b3b89b',
    torso: '#5f625f',
    torsoShade: '#3c413f',
    pants: '#353741',
    shoe: '#565b62',
    shoeTip: '#999faa',
    eyeGlow: '#f7c76b',
    mouth: '#311b16',
    blood: '#652127',
    shadow: '#000000',
    shadowAlpha: 0.3,
    torsoWidth: 66,
    torsoHeight: 50,
    torsoRadius: 20,
    shoulderOffset: 30,
    hipOffset: 15,
    armLength: 34,
    legLeft: 38,
    legRight: 40,
    limbThickness: 17,
    handSize: 13,
    headX: 30,
    headY: 30,
    headRadiusX: 29,
    headRadiusY: 31,
    bodyY: 60,
    baseLean: 0.02,
    walkFps: 5,
    attackFps: 7,
  },
  toxic: {
    outline: '#101412',
    skin: '#6f9a3b',
    skinShade: '#36511d',
    scalp: '#94bc4f',
    torso: '#536640',
    torsoShade: '#324028',
    pants: '#38442c',
    shoe: '#4a5d31',
    shoeTip: '#a8b56f',
    eyeGlow: '#c8ff63',
    mouth: '#253114',
    blood: '#4f7b24',
    shadow: '#203514',
    shadowAlpha: 0.3,
    torsoWidth: 56,
    torsoHeight: 40,
    torsoRadius: 15,
    shoulderOffset: 24,
    hipOffset: 12,
    armLength: 31,
    legLeft: 36,
    legRight: 38,
    limbThickness: 13,
    handSize: 10,
    headX: 28,
    headY: 31,
    headRadiusX: 26,
    headRadiusY: 29,
    bodyY: 58,
    fumeColor: '#7dff4a',
    walkFps: 7,
    attackFps: 8,
  },
  miniBoss: {
    outline: '#2c0f15',
    skin: '#8fa36c',
    skinShade: '#5a6b43',
    scalp: '#c18a3b',
    torso: '#5f2d34',
    torsoShade: '#31161b',
    pants: '#272a31',
    shoe: '#484e58',
    shoeTip: '#c2c6cf',
    eyeGlow: '#ff914d',
    mouth: '#18090a',
    blood: '#a12a2f',
    shadow: '#23070b',
    shadowAlpha: 0.36,
    torsoWidth: 72,
    torsoHeight: 56,
    torsoRadius: 22,
    shoulderOffset: 32,
    hipOffset: 16,
    armLength: 38,
    legLeft: 42,
    legRight: 44,
    limbThickness: 18,
    handSize: 14,
    headX: 31,
    headY: 30,
    headRadiusX: 31,
    headRadiusY: 33,
    bodyY: 61,
    baseLean: 0.02,
    walkFps: 5,
    attackFps: 7,
  },
  giantBoss: {
    outline: '#220b0d',
    skin: '#8c8d74',
    skinShade: '#575843',
    scalp: '#c2663d',
    torso: '#4d2024',
    torsoShade: '#241014',
    pants: '#23252c',
    shoe: '#474b53',
    shoeTip: '#d0d3da',
    eyeGlow: '#ff6767',
    mouth: '#130708',
    blood: '#a72027',
    shadow: '#160709',
    shadowAlpha: 0.4,
    torsoWidth: 84,
    torsoHeight: 66,
    torsoRadius: 24,
    shoulderOffset: 36,
    hipOffset: 18,
    armLength: 44,
    legLeft: 46,
    legRight: 48,
    limbThickness: 20,
    handSize: 15,
    headX: 33,
    headY: 31,
    headRadiusX: 34,
    headRadiusY: 37,
    bodyY: 64,
    baseLean: 0.01,
    walkFps: 4,
    attackFps: 6,
  },
}

const survivorFramePoses = Object.entries(PLAYER_FRAME_POSES)

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}

function fillStroke(context, fillStyle, strokeStyle = zombieOutline, lineWidth = 4) {
  context.fillStyle = fillStyle
  context.fill()
  context.strokeStyle = strokeStyle
  context.lineWidth = lineWidth
  context.stroke()
}

function drawLimb(context, config) {
  const { x, y, angle, length, thickness, color, handSize = 10, foot = false } = config

  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.lineCap = 'round'
  context.lineJoin = 'round'

  context.strokeStyle = zombieOutline
  context.lineWidth = thickness + 6
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, length)
  context.stroke()

  context.strokeStyle = color
  context.lineWidth = thickness
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, length)
  context.stroke()

  if (foot) {
    context.save()
    context.translate(0, length + 2)
    context.fillStyle = zombieOutline
    context.beginPath()
    context.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = shoeBlue
    context.beginPath()
    context.ellipse(0, -1, 12, 8, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#f4efe7'
    context.beginPath()
    context.ellipse(-1, -2, 8, 5, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  } else {
    context.fillStyle = zombieOutline
    context.beginPath()
    context.arc(0, length, handSize * 0.56, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = zombieSkin
    context.beginPath()
    context.arc(0, length, handSize * 0.44, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}

function getZombieFrameKey(typeId, state, index) {
  return `zombie-${typeId}-${state}-${index}`
}

function getZombieAnimationKey(typeId, state) {
  return `zombie-${typeId}-${state}`
}

function drawZombieVariantLimb(context, config) {
  const {
    x,
    y,
    angle,
    length,
    thickness,
    color,
    outlineColor,
    handColor,
    handSize = 10,
    foot = false,
    shoeColor,
    shoeTipColor,
  } = config

  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.lineCap = 'round'
  context.lineJoin = 'round'

  context.strokeStyle = outlineColor
  context.lineWidth = thickness + 6
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, length)
  context.stroke()

  context.strokeStyle = color
  context.lineWidth = thickness
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, length)
  context.stroke()

  if (foot) {
    context.save()
    context.translate(0, length + 2)
    context.fillStyle = outlineColor
    context.beginPath()
    context.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = shoeColor
    context.beginPath()
    context.ellipse(0, -1, 12, 8, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = shoeTipColor
    context.beginPath()
    context.ellipse(-1, -2, 8, 5, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  } else {
    context.fillStyle = outlineColor
    context.beginPath()
    context.arc(0, length, handSize * 0.56, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = handColor
    context.beginPath()
    context.arc(0, length, handSize * 0.44, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}

function drawZombieFumes(context, style, pose) {
  if (!style.fumeColor) {
    return
  }

  context.save()
  context.globalAlpha = 0.18
  context.fillStyle = style.fumeColor

  const bobOffset = pose.bob * 0.25
  const clouds = [
    { x: 88, y: 26 + bobOffset, rx: 10, ry: 8 },
    { x: 100, y: 36 + bobOffset, rx: 14, ry: 11 },
    { x: 92, y: 48 + bobOffset, rx: 11, ry: 9 },
    { x: 38, y: 60 + bobOffset, rx: 9, ry: 7 },
  ]

  clouds.forEach((cloud) => {
    context.beginPath()
    context.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, 0, 0, Math.PI * 2)
    context.fill()
  })

  context.restore()
}

function drawZombieVariantFrame(scene, typeId, state, index, pose) {
  const key = getZombieFrameKey(typeId, state, index)

  if (scene.textures.exists(key)) {
    return
  }

  const style = zombieVisualStyles[typeId]
  const texture = scene.textures.createCanvas(key, 128, 128)
  const context = texture.context

  context.clearRect(0, 0, 128, 128)
  context.lineJoin = 'round'
  context.lineCap = 'round'

  drawZombieFumes(context, style, pose)

  const bodyX = 64
  const bodyY = style.bodyY + pose.bob

  drawZombieVariantLimb(context, {
    x: bodyX - style.hipOffset,
    y: bodyY + 20,
    angle: pose.legLeft,
    length: style.legLeft,
    thickness: style.limbThickness + (typeId === 'tank' ? 1 : 0),
    color: style.pants,
    outlineColor: style.outline,
    handColor: style.skin,
    foot: true,
    shoeColor: style.shoe,
    shoeTipColor: style.shoeTip,
  })
  drawZombieVariantLimb(context, {
    x: bodyX + style.hipOffset,
    y: bodyY + 20,
    angle: pose.legRight,
    length: style.legRight,
    thickness: style.limbThickness + (typeId === 'tank' ? 1 : 0),
    color: style.pants,
    outlineColor: style.outline,
    handColor: style.skin,
    foot: true,
    shoeColor: style.shoe,
    shoeTipColor: style.shoeTip,
  })

  context.save()
  context.translate(bodyX, bodyY)
  context.rotate((style.baseLean ?? 0) + pose.lean)

  drawZombieVariantLimb(context, {
    x: -style.shoulderOffset - (pose.reach ?? 0) * 0.18,
    y: -8,
    angle: pose.armLeft,
    length: style.armLength + (pose.reach ?? 0) * 0.28,
    thickness: style.limbThickness,
    color: style.skinShade,
    outlineColor: style.outline,
    handColor: style.skin,
    handSize: style.handSize,
  })
  drawZombieVariantLimb(context, {
    x: style.shoulderOffset + (pose.reach ?? 0) * 0.22,
    y: -8,
    angle: pose.armRight,
    length: style.armLength + (pose.reach ?? 0) * 0.34,
    thickness: style.limbThickness,
    color: style.skinShade,
    outlineColor: style.outline,
    handColor: style.skin,
    handSize: style.handSize,
  })

  context.fillStyle = style.skinShade
  context.beginPath()
  context.moveTo(-9, -10)
  context.lineTo(0, -28)
  context.lineTo(10, -10)
  context.closePath()
  context.fill()

  roundedRect(context, -style.torsoWidth / 2, -8, style.torsoWidth, style.torsoHeight, style.torsoRadius)
  fillStroke(context, pose.hit ? '#8f3f45' : style.torso, style.outline, 4)

  context.fillStyle = style.torsoShade
  context.beginPath()
  context.ellipse(-style.torsoWidth * 0.26, 12, 10, 16, 0.32, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(style.torsoWidth * 0.24, 14, 11, 17, -0.28, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = style.blood
  context.beginPath()
  context.ellipse(style.torsoWidth * 0.18, 0, 7, 5, -0.25, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(-style.torsoWidth * 0.22, 11, 4, 8, 0.45, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = style.outline
  context.lineWidth = 2.5
  context.beginPath()
  context.moveTo(-style.torsoWidth * 0.2, 10)
  context.lineTo(style.torsoWidth * 0.08, 2)
  context.stroke()
  context.beginPath()
  context.moveTo(-4, style.torsoHeight - 5)
  context.lineTo(6, style.torsoHeight - 12)
  context.stroke()

  if (typeId === 'tank') {
    context.fillStyle = style.skinShade
    context.beginPath()
    context.ellipse(-style.torsoWidth * 0.32, -2, 11, 13, 0, 0, Math.PI * 2)
    context.ellipse(style.torsoWidth * 0.32, -2, 11, 13, 0, 0, Math.PI * 2)
    context.fill()
  }

  if (typeId === 'miniBoss') {
    roundedRect(context, -24, -2, 48, 24, 10)
    fillStroke(context, '#7a262f', style.outline, 3)

    context.strokeStyle = '#ff9b4b'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(-10, 8)
    context.lineTo(0, 1)
    context.lineTo(10, 8)
    context.stroke()

    context.fillStyle = '#d1822f'
    context.beginPath()
    context.ellipse(-style.torsoWidth * 0.34, -10, 10, 12, 0, 0, Math.PI * 2)
    context.ellipse(style.torsoWidth * 0.34, -10, 10, 12, 0, 0, Math.PI * 2)
    context.fill()
  }

  if (typeId === 'giantBoss') {
    roundedRect(context, -32, -8, 64, 34, 12)
    fillStroke(context, '#6a1d22', style.outline, 4)

    context.fillStyle = '#d16440'
    context.beginPath()
    context.moveTo(-18, -8)
    context.lineTo(-4, -20)
    context.lineTo(0, -6)
    context.lineTo(14, -19)
    context.lineTo(20, -4)
    context.closePath()
    context.fill()

    context.fillStyle = '#8f353c'
    context.beginPath()
    context.ellipse(-style.torsoWidth * 0.36, -12, 13, 14, 0, 0, Math.PI * 2)
    context.ellipse(style.torsoWidth * 0.36, -12, 13, 14, 0, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = '#ff8f7a'
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(-16, 6)
    context.lineTo(-2, -2)
    context.lineTo(12, 8)
    context.stroke()
  }

  context.restore()

  context.save()
  context.translate(bodyX, style.headY + pose.bob * 0.4)
  context.rotate(pose.headTilt)

  context.fillStyle = style.scalp
  context.beginPath()
  context.moveTo(-style.headRadiusX + 4, -style.headRadiusY + 2)
  context.lineTo(-6, -style.headRadiusY - 8)
  context.lineTo(style.headRadiusX - 5, -style.headRadiusY + 2)
  context.lineTo(8, -style.headRadiusY + 4)
  context.closePath()
  context.fill()

  context.beginPath()
  context.ellipse(0, 0, style.headRadiusX, style.headRadiusY, 0, 0, Math.PI * 2)
  fillStroke(context, pose.hit ? '#8c4e50' : style.skin, style.outline, 3.5)

  context.fillStyle = style.skinShade
  context.beginPath()
  context.arc(-style.headRadiusX + 1, 2, 6, 0, Math.PI * 2)
  context.arc(style.headRadiusX - 1, 6, 6, 0, Math.PI * 2)
  context.fill()

  context.save()
  context.shadowColor = style.eyeGlow
  context.shadowBlur = 12
  context.fillStyle = style.eyeGlow
  context.beginPath()
  context.ellipse(-10, -6, 9, 11, -0.2, 0, Math.PI * 2)
  context.ellipse(12, -4, 9, 11, 0.2, 0, Math.PI * 2)
  context.fill()
  context.restore()

  context.fillStyle = style.outline
  context.beginPath()
  context.arc(-8, -4, 3, 0, Math.PI * 2)
  context.arc(13, -2, 3, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = style.skinShade
  context.beginPath()
  context.moveTo(-4, 6)
  context.lineTo(0, -4)
  context.lineTo(4, 6)
  context.closePath()
  context.fill()

  context.fillStyle = style.mouth
  context.beginPath()
  context.moveTo(-13, 14)
  context.quadraticCurveTo(0, 6, 13, 14)
  context.lineTo(11, 20)
  context.lineTo(-10, 20)
  context.closePath()
  context.fill()

  context.strokeStyle = '#e8d1a3'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(-9, 15)
  context.lineTo(-5, 18)
  context.lineTo(-1, 15)
  context.lineTo(3, 18)
  context.lineTo(7, 15)
  context.stroke()

  context.strokeStyle = style.outline
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(-18, -20)
  context.lineTo(14, -16)
  context.stroke()
  context.beginPath()
  context.moveTo(-16, 11)
  context.lineTo(-6, 16)
  context.lineTo(4, 17)
  context.lineTo(16, 11)
  context.stroke()

  if (typeId === 'toxic') {
    context.save()
    context.globalAlpha = 0.24
    context.fillStyle = style.fumeColor
    context.beginPath()
    context.arc(22, -24, 7, 0, Math.PI * 2)
    context.arc(30, -15, 10, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  context.restore()
  texture.refresh()
}

function drawZombieFrame(scene, key, pose) {
  if (scene.textures.exists(key)) {
    return
  }

  const texture = scene.textures.createCanvas(key, 128, 128)
  const context = texture.context

  context.clearRect(0, 0, 128, 128)
  context.lineJoin = 'round'
  context.lineCap = 'round'

  const bodyY = 58 + pose.bob

  drawLimb(context, {
    x: 53,
    y: bodyY + 20,
    angle: pose.legLeft,
    length: 36,
    thickness: 18,
    color: pants,
    foot: true,
  })
  drawLimb(context, {
    x: 75,
    y: bodyY + 20,
    angle: pose.legRight,
    length: 40,
    thickness: 18,
    color: pants,
    foot: true,
  })

  context.save()
  context.translate(64, bodyY)
  context.rotate(pose.lean)

  drawLimb(context, {
    x: -25 - (pose.reach ?? 0) * 0.2,
    y: -8,
    angle: pose.armLeft,
    length: 30 + (pose.reach ?? 0) * 0.3,
    thickness: 14,
    color: zombieSkinDark,
    handSize: 11,
  })
  drawLimb(context, {
    x: 25 + (pose.reach ?? 0) * 0.24,
    y: -8,
    angle: pose.armRight,
    length: 30 + (pose.reach ?? 0) * 0.34,
    thickness: 14,
    color: zombieSkinDark,
    handSize: 11,
  })

  context.fillStyle = zombieSkinDark
  context.beginPath()
  context.moveTo(-8, -8)
  context.lineTo(0, -30)
  context.lineTo(10, -8)
  context.closePath()
  context.fill()

  roundedRect(context, -28, -8, 56, 46, 18)
  fillStroke(context, hoodieWhite)

  context.strokeStyle = '#8a8a8a'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(0, -8)
  context.lineTo(0, 36)
  context.stroke()

  context.fillStyle = hoodieShadow
  context.beginPath()
  context.ellipse(-18, 12, 10, 16, 0.4, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(18, 14, 11, 17, -0.4, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = blood
  context.beginPath()
  context.ellipse(12, -2, 8, 6, -0.2, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(-16, 10, 4, 8, 0.5, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(18, 24, 5, 7, 0.2, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = zombieOutline
  context.fillRect(20, 18, 3, 18)
  context.fillStyle = '#7a1b2b'
  context.fillRect(16, 17, 12, 4)

  context.restore()

  context.save()
  context.translate(64, 36 + pose.bob * 0.4)
  context.rotate(pose.headTilt)

  context.fillStyle = zombieOutline
  context.beginPath()
  context.moveTo(-26, -34)
  context.lineTo(-8, -48)
  context.lineTo(18, -46)
  context.lineTo(34, -32)
  context.lineTo(8, -34)
  context.closePath()
  context.fill()

  context.fillStyle = zombieHair
  context.beginPath()
  context.moveTo(-22, -34)
  context.lineTo(-4, -44)
  context.lineTo(14, -42)
  context.lineTo(26, -30)
  context.lineTo(8, -30)
  context.closePath()
  context.fill()
  context.fillStyle = zombieHairDark
  context.beginPath()
  context.moveTo(-8, -42)
  context.lineTo(6, -38)
  context.lineTo(10, -28)
  context.closePath()
  context.fill()

  context.beginPath()
  context.ellipse(0, 0, 28, 31, 0, 0, Math.PI * 2)
  fillStroke(context, pose.hit ? '#58b48c' : zombieSkin)

  context.fillStyle = zombieSkinDark
  context.beginPath()
  context.arc(-28, 2, 6, 0, Math.PI * 2)
  context.arc(28, 6, 6, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = '#5ed2b1'
  context.lineWidth = 4
  context.beginPath()
  context.arc(-18, 4, 18, 0.2, 2.6)
  context.stroke()
  context.beginPath()
  context.arc(16, 2, 16, -0.3, 0.9)
  context.stroke()

  context.fillStyle = eyeWhite
  context.beginPath()
  context.ellipse(-11, -6, 11, 13, -0.24, 0, Math.PI * 2)
  context.ellipse(13, -4, 11, 13, 0.22, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = zombieOutline
  context.lineWidth = 3
  context.beginPath()
  context.ellipse(-11, -6, 11, 13, -0.24, 0, Math.PI * 2)
  context.ellipse(13, -4, 11, 13, 0.22, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = '#2f243f'
  context.beginPath()
  context.arc(-9, -4, 3.5, 0, Math.PI * 2)
  context.arc(14, -2, 3.5, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = zombieSkinDark
  context.beginPath()
  context.moveTo(-4, 6)
  context.lineTo(0, -6)
  context.lineTo(4, 6)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(-10, 14)
  context.quadraticCurveTo(0, 8, 10, 14)
  context.quadraticCurveTo(0, 18, -10, 14)
  context.fill()

  context.strokeStyle = zombieOutline
  context.lineWidth = 2.5
  context.beginPath()
  context.moveTo(-16, 12)
  context.lineTo(-6, 15)
  context.lineTo(6, 16)
  context.lineTo(16, 12)
  context.stroke()

  context.strokeStyle = zombieOutline
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(-20, -22)
  context.lineTo(18, -18)
  context.stroke()

  context.restore()

  texture.refresh()
}

function registerZombieTextures(scene) {
  Object.keys(zombieVisualStyles).forEach((typeId) => {
    Object.entries(zombiePoseLibrary).forEach(([state, poses]) => {
      poses.forEach((pose, index) => {
        drawZombieVariantFrame(scene, typeId, state, index, pose)
      })
    })
  })
}

function registerZombieAnimations(scene) {
  Object.entries(zombieVisualStyles).forEach(([typeId, style]) => {
    if (!scene.anims.exists(getZombieAnimationKey(typeId, 'idle'))) {
      scene.anims.create({
        key: getZombieAnimationKey(typeId, 'idle'),
        frames: zombiePoseLibrary.idle.map((_, index) => ({ key: getZombieFrameKey(typeId, 'idle', index) })),
        frameRate: 3,
        repeat: -1,
        yoyo: true,
      })
    }

    if (!scene.anims.exists(getZombieAnimationKey(typeId, 'walk'))) {
      scene.anims.create({
        key: getZombieAnimationKey(typeId, 'walk'),
        frames: zombiePoseLibrary.walk.map((_, index) => ({ key: getZombieFrameKey(typeId, 'walk', index) })),
        frameRate: style.walkFps,
        repeat: -1,
      })
    }

    if (!scene.anims.exists(getZombieAnimationKey(typeId, 'attack'))) {
      scene.anims.create({
        key: getZombieAnimationKey(typeId, 'attack'),
        frames: zombiePoseLibrary.attack.map((_, index) => ({ key: getZombieFrameKey(typeId, 'attack', index) })),
        frameRate: style.attackFps,
        repeat: -1,
      })
    }

    if (!scene.anims.exists(getZombieAnimationKey(typeId, 'hit'))) {
      scene.anims.create({
        key: getZombieAnimationKey(typeId, 'hit'),
        frames: [{ key: getZombieFrameKey(typeId, 'hit', 0) }, { key: getZombieFrameKey(typeId, 'idle', 1) }],
        frameRate: 10,
        repeat: 0,
      })
    }

    if (!scene.anims.exists(getZombieAnimationKey(typeId, 'death'))) {
      scene.anims.create({
        key: getZombieAnimationKey(typeId, 'death'),
        frames: zombiePoseLibrary.death.map((_, index) => ({ key: getZombieFrameKey(typeId, 'death', index) })),
        frameRate: 6,
        repeat: 0,
      })
    }
  })
}

function getZombieSheetFrameKey(frameNumber) {
  return `zombie-sheet-frame-${frameNumber}`
}

function samplePixel(data, width, x, y) {
  const clampedX = Math.max(0, Math.min(width - 1, x))
  const clampedY = Math.max(0, Math.min((data.length / 4) / width - 1, y))
  const index = (clampedY * width + clampedX) * 4

  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
  }
}

function buildMatteColor(data, width, height) {
  const samples = [
    samplePixel(data, width, 2, 2),
    samplePixel(data, width, width - 3, 2),
    samplePixel(data, width, 2, height - 3),
    samplePixel(data, width, width - 3, height - 3),
  ]

  const total = samples.reduce(
    (accumulator, sample) => ({
      r: accumulator.r + sample.r,
      g: accumulator.g + sample.g,
      b: accumulator.b + sample.b,
    }),
    { r: 0, g: 0, b: 0 },
  )

  return {
    r: Math.round(total.r / samples.length),
    g: Math.round(total.g / samples.length),
    b: Math.round(total.b / samples.length),
  }
}

function colorDistance(a, b) {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b))
}

function isLikelyMattePixel(color, matteColor, tolerance) {
  const max = Math.max(color.r, color.g, color.b)
  const min = Math.min(color.r, color.g, color.b)
  const isBrightNeutral = min >= 210 && max - min <= 28

  return isBrightNeutral || colorDistance(color, matteColor) <= tolerance
}

function findLargestOpaqueComponent(mask, width, height) {
  const visited = new Uint8Array(mask.length)
  const neighbors = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
  ]

  let best = null
  let componentCount = 0

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) {
      continue
    }

    componentCount += 1

    const queue = [start]
    const indices = []
    visited[start] = 1

    while (queue.length > 0) {
      const index = queue.pop()
      const x = index % width
      const y = Math.floor(index / width)
      indices.push(index)

      for (const [offsetX, offsetY] of neighbors) {
        const nextX = x + offsetX
        const nextY = y + offsetY

        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
          continue
        }

        const nextIndex = nextY * width + nextX

        if (!mask[nextIndex] || visited[nextIndex]) {
          continue
        }

        visited[nextIndex] = 1
        queue.push(nextIndex)
      }
    }

    if (!best || indices.length > best.area) {
      best = {
        area: indices.length,
        indices,
      }
    }
  }

  return {
    componentCount,
    largest: best,
  }
}

function resetZombieSheetAnimationSet(scene) {
  ;['zombie-idle', 'zombie-walk', 'zombie-attack', 'zombie-hit', 'zombie-death'].forEach((key) => {
    if (scene.anims.exists(key)) {
      scene.anims.remove(key)
    }
  })
}

function createTransparentZombieFrame(scene, sourceImage, frameNumber) {
  const key = getZombieSheetFrameKey(frameNumber)

  if (scene.textures.exists(key)) {
    scene.textures.remove(key)
  }

  const { frameWidth, frameHeight, columns, alphaTolerance } = zombieSheetConfig
  const sx = (frameNumber % columns) * frameWidth
  const sy = Math.floor(frameNumber / columns) * frameHeight
  const texture = scene.textures.createCanvas(key, frameWidth, frameHeight)
  const context = texture.context

  context.clearRect(0, 0, frameWidth, frameHeight)
  context.drawImage(sourceImage, sx, sy, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)

  const imageData = context.getImageData(0, 0, frameWidth, frameHeight)
  const data = imageData.data
  const matteColor = buildMatteColor(data, frameWidth, frameHeight)
  const opaqueMask = new Uint8Array(frameWidth * frameHeight)

  for (let pixelIndex = 0; pixelIndex < opaqueMask.length; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4
    const color = {
      r: data[dataIndex],
      g: data[dataIndex + 1],
      b: data[dataIndex + 2],
    }

    if (data[dataIndex + 3] === 0 || isLikelyMattePixel(color, matteColor, alphaTolerance)) {
      data[dataIndex + 3] = 0
      continue
    }

    opaqueMask[pixelIndex] = 1
  }

  const { componentCount, largest } = findLargestOpaqueComponent(opaqueMask, frameWidth, frameHeight)
  const keepMask = new Uint8Array(opaqueMask.length)

  largest?.indices.forEach((index) => {
    keepMask[index] = 1
  })

  for (let pixelIndex = 0; pixelIndex < opaqueMask.length; pixelIndex += 1) {
    if (keepMask[pixelIndex]) {
      continue
    }

    data[pixelIndex * 4 + 3] = 0
  }

  context.putImageData(imageData, 0, 0)
  texture.refresh()

  if (ZOMBIE_SHEET_DEBUG) {
    console.debug('[ZombieSheetFrame]', {
      currentFrame: frameNumber,
      sx,
      sy,
      sw: frameWidth,
      sh: frameHeight,
      drawImageCalls: 1,
      componentCount,
      keptPixels: largest?.area ?? 0,
      matteColor,
    })
  }

  return key
}

function registerZombieSheetTextures(scene) {
  if (!scene.textures.exists(zombieSheetConfig.rawKey)) {
    return false
  }

  const sourceImage = scene.textures.get(zombieSheetConfig.rawKey).getSourceImage()

  if (!sourceImage) {
    return false
  }

  const frameNumbers = new Set([
    ...zombieSheetConfig.animations.idle,
    ...zombieSheetConfig.animations.walk,
    ...zombieSheetConfig.animations.attack,
    ...zombieSheetConfig.animations.hit,
    ...zombieSheetConfig.animations.death,
  ])

  frameNumbers.forEach((frameNumber) => {
    createTransparentZombieFrame(scene, sourceImage, frameNumber)
  })

  return true
}

function registerZombieSheetAnimations(scene) {
  resetZombieSheetAnimationSet(scene)

  if (!scene.anims.exists('zombie-idle')) {
    scene.anims.create({
      key: 'zombie-idle',
      frames: zombieSheetConfig.animations.idle.map((frameNumber) => ({
        key: getZombieSheetFrameKey(frameNumber),
      })),
      frameRate: 5,
      repeat: -1,
      yoyo: true,
    })
  }

  if (!scene.anims.exists('zombie-walk')) {
    scene.anims.create({
      key: 'zombie-walk',
      frames: zombieSheetConfig.animations.walk.map((frameNumber) => ({
        key: getZombieSheetFrameKey(frameNumber),
      })),
      frameRate: 8,
      repeat: -1,
    })
  }

  if (!scene.anims.exists('zombie-attack')) {
    scene.anims.create({
      key: 'zombie-attack',
      frames: zombieSheetConfig.animations.attack.map((frameNumber) => ({
        key: getZombieSheetFrameKey(frameNumber),
      })),
      frameRate: 10,
      repeat: -1,
    })
  }

  if (!scene.anims.exists('zombie-hit')) {
    scene.anims.create({
      key: 'zombie-hit',
      frames: zombieSheetConfig.animations.hit.map((frameNumber) => ({
        key: getZombieSheetFrameKey(frameNumber),
      })),
      frameRate: 12,
      repeat: 0,
    })
  }

  if (!scene.anims.exists('zombie-death')) {
    scene.anims.create({
      key: 'zombie-death',
      frames: zombieSheetConfig.animations.death.map((frameNumber) => ({
        key: getZombieSheetFrameKey(frameNumber),
      })),
      frameRate: 6,
      repeat: 0,
    })
  }
}

function drawSoldierLimb(context, config) {
  const { x, y, angle, length, thickness, color, end = 'hand' } = config

  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.lineCap = 'round'
  context.lineJoin = 'round'

  context.strokeStyle = survivorOutline
  context.lineWidth = thickness + 5
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, length)
  context.stroke()

  context.strokeStyle = color
  context.lineWidth = thickness
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, length)
  context.stroke()

  if (end === 'boot') {
    context.save()
    context.translate(0, length + 2)
    context.fillStyle = survivorOutline
    context.beginPath()
    context.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = survivorBoot
    context.beginPath()
    context.ellipse(0, -1, 11, 7, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = survivorBootTop
    context.beginPath()
    context.ellipse(-1, -3, 8, 4, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  } else if (end === 'hand') {
    context.fillStyle = survivorOutline
    context.beginPath()
    context.arc(0, length, 6, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = survivorSkin
    context.beginPath()
    context.arc(0, length, 4.6, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}

function drawPlayerCarriedWeapon(scene) {
  if (scene.textures.exists(PLAYER_CARRIED_WEAPON_TEXTURE.key)) {
    return
  }

  const texture = scene.textures.createCanvas(
    PLAYER_CARRIED_WEAPON_TEXTURE.key,
    PLAYER_CARRIED_WEAPON_TEXTURE.width,
    PLAYER_CARRIED_WEAPON_TEXTURE.height,
  )
  const context = texture.context
  const shoulderX = PLAYER_CARRIED_WEAPON_TEXTURE.originX
  const shoulderY = PLAYER_CARRIED_WEAPON_TEXTURE.originY
  const gripX = shoulderX + 15
  const gripY = shoulderY + 19

  context.clearRect(0, 0, PLAYER_CARRIED_WEAPON_TEXTURE.width, PLAYER_CARRIED_WEAPON_TEXTURE.height)
  context.lineJoin = 'round'
  context.lineCap = 'round'

  context.strokeStyle = survivorOutline
  context.lineWidth = 15
  context.beginPath()
  context.moveTo(shoulderX, shoulderY)
  context.lineTo(gripX, gripY)
  context.stroke()

  context.strokeStyle = survivorSkin
  context.lineWidth = 10
  context.beginPath()
  context.moveTo(shoulderX, shoulderY)
  context.lineTo(gripX, gripY)
  context.stroke()

  context.fillStyle = survivorGunDark
  roundedRect(context, shoulderX + 6, shoulderY + 8, 35, 7, 3)
  fillStroke(context, survivorGunDark, survivorOutline, 3)
  roundedRect(context, shoulderX + 38, shoulderY + 9, 15, 4, 2)
  fillStroke(context, survivorGunAccent, survivorOutline, 2)
  roundedRect(context, shoulderX + 10, shoulderY + 14, 10, 10, 3)
  fillStroke(context, survivorGunAccent, survivorOutline, 2)
  context.fillStyle = survivorGunAccent
  context.fillRect(shoulderX + 0, shoulderY + 10, 8, 4)

  context.fillStyle = survivorOutline
  context.beginPath()
  context.arc(gripX, gripY, 6, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = survivorSkin
  context.beginPath()
  context.arc(gripX, gripY, 4.6, 0, Math.PI * 2)
  context.fill()

  texture.refresh()
}

function drawPlayerFrame(scene, key, pose) {
  if (scene.textures.exists(key)) {
    return
  }

  const texture = scene.textures.createCanvas(key, 128, 128)
  const context = texture.context

  context.clearRect(0, 0, 128, 128)
  context.lineJoin = 'round'
  context.lineCap = 'round'

  const bodyX = 56
  const bodyY = 58 + pose.bob

  drawSoldierLimb(context, {
    x: bodyX - 8,
    y: bodyY + 24,
    angle: pose.legRear,
    length: 38,
    thickness: 14,
    color: survivorPants,
    end: 'boot',
  })
  drawSoldierLimb(context, {
    x: bodyX + 10,
    y: bodyY + 24,
    angle: pose.legFront,
    length: 40,
    thickness: 15,
    color: survivorPants,
    end: 'boot',
  })

  context.save()
  context.translate(bodyX, bodyY)
  context.rotate(pose.torsoLean)

  drawSoldierLimb(context, {
    x: -18,
    y: -11,
    angle: pose.armRear,
    length: 28,
    thickness: 10,
    color: survivorSkinShadow,
  })

  roundedRect(context, -24, -10, 48, 46, 15)
  fillStroke(context, pose.hit ? '#9f765f' : survivorShirt, survivorOutline, 4)

  context.fillStyle = survivorShirtShadow
  context.beginPath()
  context.ellipse(-16, 12, 8, 14, 0.4, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(17, 13, 9, 15, -0.35, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = survivorShirtDark
  context.beginPath()
  context.moveTo(-8, -10)
  context.lineTo(0, -20)
  context.lineTo(8, -10)
  context.closePath()
  context.fill()

  roundedRect(context, -20, 8, 14, 12, 3)
  fillStroke(context, survivorShirtDark, survivorOutline, 2)
  roundedRect(context, 5, 8, 14, 12, 3)
  fillStroke(context, survivorShirtDark, survivorOutline, 2)

  context.fillStyle = survivorRibbonRed
  context.fillRect(7, 4, 5, 8)
  context.fillStyle = '#ffffff'
  context.fillRect(12, 4, 4, 8)
  context.fillStyle = survivorRibbonBlue
  context.fillRect(16, 4, 4, 8)
  context.fillStyle = survivorRibbonGold
  context.fillRect(20, 4, 7, 8)

  context.fillStyle = survivorSkinShadow
  context.beginPath()
  context.moveTo(-4, -10)
  context.lineTo(2, -26)
  context.lineTo(9, -10)
  context.closePath()
  context.fill()

  context.restore()

  context.save()
  context.translate(58, 31 + pose.bob * 0.4)
  context.rotate(pose.headTilt)

  context.fillStyle = survivorOutline
  context.beginPath()
  context.arc(16, 1, 5.5, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = pose.hit ? '#e3aa95' : survivorSkin
  context.beginPath()
  context.arc(16, 1, 4.2, 0, Math.PI * 2)
  context.fill()

  context.beginPath()
  context.ellipse(0, 0, 18, 22, -0.12, 0, Math.PI * 2)
  fillStroke(context, pose.hit ? '#f0a798' : survivorSkin, survivorOutline, 3.5)

  context.fillStyle = survivorHair
  context.beginPath()
  context.moveTo(-13, -6)
  context.quadraticCurveTo(-7, -22, 9, -20)
  context.quadraticCurveTo(20, -16, 20, -3)
  context.lineTo(12, -10)
  context.lineTo(2, -17)
  context.lineTo(-6, -15)
  context.closePath()
  context.fill()

  context.fillStyle = survivorHairShadow
  context.beginPath()
  context.moveTo(-3, -18)
  context.lineTo(7, -17)
  context.lineTo(10, -8)
  context.lineTo(1, -11)
  context.closePath()
  context.fill()

  context.strokeStyle = survivorOutline
  context.lineWidth = 3.4
  context.beginPath()
  context.moveTo(-8, -5)
  context.lineTo(2, -7)
  context.stroke()
  context.beginPath()
  context.moveTo(4, -5)
  context.lineTo(12, -4)
  context.stroke()

  context.strokeStyle = survivorOutline
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(5, 0)
  context.lineTo(11, 1)
  context.stroke()

  context.fillStyle = survivorOutline
  context.beginPath()
  context.arc(-1, -1, 1.8, 0, Math.PI * 2)
  context.arc(8, 0, 1.7, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = survivorOutline
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(4, 3)
  context.lineTo(7, 8)
  context.lineTo(4, 12)
  context.stroke()
  context.beginPath()
  context.moveTo(-2, 13)
  context.quadraticCurveTo(3, 15, 9, 13)
  context.stroke()

  context.restore()
  texture.refresh()
}

function registerPlayerTextures(scene) {
  drawPlayerCarriedWeapon(scene)
  survivorFramePoses.forEach(([key, pose]) => {
    drawPlayerFrame(scene, key, pose)
  })
}

function registerPlayerAnimations(scene) {
  if (!scene.anims.exists('player-idle')) {
    scene.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player-idle-0' }, { key: 'player-idle-1' }],
      frameRate: 3,
      repeat: -1,
      yoyo: true,
    })
  }

  if (!scene.anims.exists('player-walk')) {
    scene.anims.create({
      key: 'player-walk',
      frames: [{ key: 'player-walk-0' }, { key: 'player-walk-1' }],
      frameRate: 7,
      repeat: -1,
      yoyo: true,
    })
  }

  if (!scene.anims.exists('player-aim')) {
    scene.anims.create({
      key: 'player-aim',
      frames: [{ key: 'player-aim-0' }, { key: 'player-aim-1' }],
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    })
  }

  if (!scene.anims.exists('player-shoot')) {
    scene.anims.create({
      key: 'player-shoot',
      frames: [{ key: 'player-shoot-0' }, { key: 'player-shoot-1' }],
      frameRate: 16,
      repeat: 0,
    })
  }

  if (!scene.anims.exists('player-hit')) {
    scene.anims.create({
      key: 'player-hit',
      frames: [{ key: 'player-hit' }, { key: 'player-aim-1' }],
      frameRate: 11,
      repeat: 0,
    })
  }

  if (!scene.anims.exists('player-death')) {
    scene.anims.create({
      key: 'player-death',
      frames: [{ key: 'player-death-0' }, { key: 'player-death-1' }],
      frameRate: 6,
      repeat: 0,
    })
  }
}

function drawWeaponDropSilhouette(context, weaponId, strokeColor) {
  context.save()
  context.strokeStyle = strokeColor
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (weaponId === 'shotgun') {
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(13, 25)
    context.lineTo(34, 19)
    context.stroke()
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(12, 27)
    context.lineTo(18, 31)
    context.lineTo(22, 30)
    context.stroke()
  } else if (weaponId === 'rifle') {
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(12, 24)
    context.lineTo(35, 21)
    context.stroke()
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(16, 28)
    context.lineTo(22, 31)
    context.lineTo(27, 29)
    context.stroke()
  } else if (weaponId === 'smg') {
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(14, 24)
    context.lineTo(31, 21)
    context.stroke()
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(18, 25)
    context.lineTo(19, 31)
    context.lineTo(23, 29)
    context.stroke()
  } else {
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(15, 24)
    context.lineTo(28, 22)
    context.stroke()
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(18, 24)
    context.lineTo(18, 30)
    context.stroke()
  }

  context.restore()
}

function registerWeaponDropTextures(scene) {
  Object.values(WEAPON_DEFINITIONS).forEach((weapon) => {
    const key = getWeaponDropTextureKey(weapon.id)

    if (scene.textures.exists(key)) {
      return
    }

    const texture = scene.textures.createCanvas(key, 48, 48)
    const context = texture.context
    const colorHex = `#${weapon.dropColor.toString(16).padStart(6, '0')}`

    context.clearRect(0, 0, 48, 48)
    context.fillStyle = 'rgba(4, 10, 18, 0.82)'
    context.beginPath()
    context.arc(24, 24, 18, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = colorHex
    context.lineWidth = 3
    context.beginPath()
    context.arc(24, 24, 17, 0, Math.PI * 2)
    context.stroke()

    context.fillStyle = colorHex
    context.globalAlpha = 0.14
    context.beginPath()
    context.arc(24, 24, 13, 0, Math.PI * 2)
    context.fill()
    context.globalAlpha = 1

    drawWeaponDropSilhouette(context, weapon.id, '#f8fafc')

    texture.refresh()
  })
}

function drawHeartDropIcon(context, fillColor) {
  context.save()
  context.translate(24, 24)
  context.fillStyle = fillColor
  context.beginPath()
  context.moveTo(0, 13)
  context.bezierCurveTo(18, 0, 17, -14, 7, -14)
  context.bezierCurveTo(2, -14, -1, -10, -2, -7)
  context.bezierCurveTo(-3, -10, -6, -14, -11, -14)
  context.bezierCurveTo(-21, -14, -22, 0, -4, 13)
  context.closePath()
  context.fill()
  context.restore()
}

function drawBigHealthDropIcon(context, accentColor) {
  context.save()
  context.translate(24, 24)
  context.rotate(-0.18)
  context.fillStyle = '#f8fafc'
  context.strokeStyle = '#e11d48'
  context.lineWidth = 3
  roundedRect(context, -14, -8, 28, 16, 8)
  fillStroke(context, '#f8fafc', '#e11d48', 3)
  context.fillStyle = accentColor
  context.fillRect(-2, -8, 4, 16)
  context.fillRect(-8, -2, 16, 4)
  context.restore()
}

function registerHealthDropTextures(scene) {
  Object.values(HEALTH_DROP_DEFINITIONS).forEach((drop) => {
    const key = getHealthDropTextureKey(drop.id)

    if (scene.textures.exists(key)) {
      return
    }

    const texture = scene.textures.createCanvas(key, 48, 48)
    const context = texture.context
    const glowHex = `#${drop.glowColor.toString(16).padStart(6, '0')}`

    context.clearRect(0, 0, 48, 48)
    context.fillStyle = 'rgba(4, 10, 18, 0.82)'
    context.beginPath()
    context.arc(24, 24, 18, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = glowHex
    context.lineWidth = 3
    context.beginPath()
    context.arc(24, 24, 17, 0, Math.PI * 2)
    context.stroke()

    context.fillStyle = glowHex
    context.globalAlpha = 0.14
    context.beginPath()
    context.arc(24, 24, 13, 0, Math.PI * 2)
    context.fill()
    context.globalAlpha = 1

    if (drop.id === 'big') {
      drawBigHealthDropIcon(context, glowHex)
    } else {
      drawHeartDropIcon(context, glowHex)
    }

    texture.refresh()
  })
}

export function registerPlaceholderTextures(scene) {
  registerPlayerTextures(scene)
  registerPlayerAnimations(scene)

  registerZombieTextures(scene)
  registerZombieAnimations(scene)
  registerWeaponDropTextures(scene)
  registerHealthDropTextures(scene)

  if (!scene.textures.exists('bullet')) {
    const bulletGraphic = scene.make.graphics({ add: false })
    bulletGraphic.fillStyle(0xfff7cc, 1)
    bulletGraphic.fillRoundedRect(0, 2, 18, 4, 2)
    bulletGraphic.fillStyle(0xffa94d, 1)
    bulletGraphic.fillRoundedRect(14, 2, 6, 4, 2)
    bulletGraphic.generateTexture('bullet', 20, 8)
    bulletGraphic.destroy()
  }

  if (!scene.textures.exists('obstacle-wall')) {
    const obGraphic = scene.make.graphics({ add: false })
    obGraphic.fillStyle(0x334155, 1)
    obGraphic.fillRoundedRect(0, 0, 120, 48, 6)
    obGraphic.fillStyle(0x475569, 1)
    obGraphic.fillRoundedRect(2, 2, 116, 44, 5)
    obGraphic.lineStyle(2, 0x1e293b, 1)
    obGraphic.strokeRoundedRect(2, 2, 116, 44, 5)
    obGraphic.generateTexture('obstacle-wall', 120, 48)
    obGraphic.destroy()
  }

  // ── Terrain Tileset Generation ──
  if (!scene.textures.exists('terrain-tiles')) {
    const tg = scene.make.graphics({ add: false })
    // We are creating a 256x256 tileset (4x4 tiles of 64x64 each)
    
    // Tile 1 (Grass base) at x:0, y:0
    tg.fillStyle(0x2d3a21, 1)
    tg.fillRect(0, 0, 64, 64)
    tg.fillStyle(0x3a4a2b, 1)
    tg.fillCircle(16, 16, 8)
    tg.fillCircle(48, 40, 12)
    tg.fillStyle(0x455635, 1)
    tg.fillRect(20, 20, 4, 8)

    // Tile 2 (Dirt/Path) at x:64, y:0
    tg.fillStyle(0x4a3b2b, 1)
    tg.fillRect(64, 0, 64, 64)
    tg.fillStyle(0x5a4a35, 1)
    tg.fillRect(70, 10, 20, 10)
    tg.fillCircle(100, 40, 12)
    
    // Tile 3 (Concrete floor) at x:128, y:0
    tg.fillStyle(0x2e353b, 1)
    tg.fillRect(128, 0, 64, 64)
    tg.fillStyle(0x3e474f, 1)
    tg.fillRect(130, 2, 60, 60)
    tg.fillStyle(0x4e5860, 1)
    tg.fillRect(140, 10, 8, 8)

    // Tile 4 (Brick Wall - Obstacle) at x:192, y:0
    tg.fillStyle(0x5a2b2b, 1)
    tg.fillRect(192, 0, 64, 64)
    tg.fillStyle(0x7a3a3a, 1)
    for(let y=0; y<64; y+=16) {
      for(let x=0; x<64; x+=32) {
        tg.fillRect(192 + x + (y%32===0?0:16), y, 28, 12)
      }
    }
    
    // Tile 5 (Water/Mud) at x:0, y:64
    tg.fillStyle(0x1a2b3a, 1)
    tg.fillRect(0, 64, 64, 64)
    tg.fillStyle(0x2a3e5c, 1)
    tg.fillRect(10, 74, 44, 44)
    
    tg.generateTexture('terrain-tiles', 256, 256)
    tg.destroy()
  }

  if (!scene.textures.exists('obstacle-pillar')) {
    const obGraphic = scene.make.graphics({ add: false })
    obGraphic.fillStyle(0x1e293b, 1)
    obGraphic.fillRoundedRect(0, 0, 56, 56, 8)
    obGraphic.fillStyle(0x334155, 1)
    obGraphic.fillRoundedRect(6, 6, 44, 44, 6)
    obGraphic.fillStyle(0x475569, 1)
    obGraphic.fillCircle(28, 28, 14)
    obGraphic.generateTexture('obstacle-pillar', 56, 56)
    obGraphic.destroy()
  }

  if (!scene.textures.exists('obstacle-crate')) {
    const obGraphic = scene.make.graphics({ add: false })
    obGraphic.fillStyle(0x78350f, 1) // Dark brown
    obGraphic.fillRoundedRect(0, 0, 64, 64, 4)
    obGraphic.fillStyle(0x92400e, 1) // Lighter brown
    obGraphic.fillRoundedRect(4, 4, 56, 56, 2)
    obGraphic.lineStyle(4, 0x78350f, 1)
    obGraphic.strokeRect(4, 4, 56, 56)
    obGraphic.beginPath()
    obGraphic.moveTo(4, 4)
    obGraphic.lineTo(60, 60)
    obGraphic.stroke()
    obGraphic.beginPath()
    obGraphic.moveTo(60, 4)
    obGraphic.lineTo(4, 60)
    obGraphic.stroke()
    obGraphic.generateTexture('obstacle-crate', 64, 64)
    obGraphic.destroy()
  }
}

