import { WEAPON_DEFINITIONS, getWeaponDropTextureKey } from '../config/weapons'
import { HEALTH_DROP_DEFINITIONS, getHealthDropTextureKey } from '../config/dropItems'
import { PLAYER_CARRIED_WEAPON_TEXTURE, PLAYER_FRAME_POSES, PLAYER_SKINS } from '../config/playerVisualConfig'
import { readStorage } from '../../services/storageService'

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
let survivorOutline = '#151924'
let survivorSkin = '#ff9249' // Vibrant orange skin from the image
let survivorSkinShadow = '#d47b40'
let survivorHair = '#3b4559' // Balaclava color
let survivorHairShadow = '#282d3b'
let survivorShirt = '#343841' // Vest color
let survivorShirtShadow = '#1f2128' 
let survivorShirtDark = '#1f2128'
let survivorRibbonRed = '#1a1f2e' // Darkened to blend in
let survivorRibbonBlue = '#485172'
let survivorRibbonGold = '#1a1f2e'
let survivorPants = '#4f5b7d' // Slate blue pants
let survivorBoot = '#111216'
let survivorBootTop = '#242831'
let survivorGunDark = '#1a1e24'
let survivorGunAccent = '#677182'
let survivorSleeve = '#d6a073'
let survivorUnderShirt = '#edb483'

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
  const { x, y, angle, length, thickness, color, end = 'hand', kneePad, holster } = config

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

  if (kneePad) {
    context.fillStyle = survivorOutline
    context.fillRect(-thickness / 2 - 2, length / 2 - 2, thickness + 4, 10)
    context.fillStyle = '#111216' // Knee pad black
    context.fillRect(-thickness / 2, length / 2, thickness, 6)
  }

  if (holster) {
    context.fillStyle = survivorOutline
    context.fillRect(-thickness / 2 - 3, length / 4 - 4, thickness + 6, 16)
    context.fillStyle = '#1f2128' // Holster material
    context.fillRect(-thickness / 2 - 1, length / 4 - 2, thickness + 2, 12)
    // Wood gun handle sticking back
    context.fillStyle = '#6b4c3a' 
    context.fillRect(-thickness / 2 - 6, length / 4 - 6, 6, 6)
  }

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
  } else if (end === 'glove') {
    // Fingerless glove
    context.fillStyle = survivorOutline
    context.beginPath()
    context.arc(0, length, 6, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#22252b' // Glove material
    context.beginPath()
    context.arc(0, length, 4.6, 0, Math.PI * 2)
    context.fill()
    // Skin fingers
    context.fillStyle = survivorSkin
    context.beginPath()
    context.arc(0, length + 3, 2.5, 0, Math.PI * 2)
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
  const gripX = shoulderX + 22 // Moves hand forward onto the handguard
  const gripY = shoulderY + 5  // Moves hand UP onto the handguard
  
  const rearShoulderX = shoulderX - 20
  const rearShoulderY = shoulderY - 1
  const triggerX = shoulderX - 2
  const triggerY = shoulderY + 4

  context.clearRect(0, 0, PLAYER_CARRIED_WEAPON_TEXTURE.width, PLAYER_CARRIED_WEAPON_TEXTURE.height)
  context.lineJoin = 'round'
  context.lineCap = 'round'
  
  // --- Back Arm Connection (Holding Trigger) ---
  context.strokeStyle = survivorSkinShadow
  context.lineWidth = 10
  context.beginPath()
  context.moveTo(rearShoulderX, rearShoulderY)
  context.lineTo(triggerX, triggerY)
  context.stroke()

  context.strokeStyle = survivorSleeve // Short sleeve
  context.lineWidth = 12
  context.beginPath()
  context.moveTo(rearShoulderX, rearShoulderY)
  context.lineTo(rearShoulderX + (triggerX - rearShoulderX) * 0.4, rearShoulderY + (triggerY - rearShoulderY) * 0.4)
  context.stroke()

  // Rear glove
  context.fillStyle = survivorOutline
  context.beginPath()
  context.arc(triggerX, triggerY, 6, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#22252b'
  context.beginPath()
  context.arc(triggerX, triggerY, 4.6, 0, Math.PI * 2)
  context.fill()

  // --- M4 / AR-15 Gun Base ---
  // Stock sticking out back
  context.fillStyle = '#111216' // black stock
  context.fillRect(shoulderX - 16, shoulderY - 2, 12, 8)
  
  // Buffer tube (connects stock to receiver)
  context.fillStyle = survivorGunAccent
  context.fillRect(shoulderX - 6, shoulderY, 6, 4)

  // Receiver/Magwell (middle body)
  context.fillStyle = '#2a2e38' // dark grey receiver
  context.fillRect(shoulderX, shoulderY - 4, 16, 12)
  
  // Magazine hanging down
  context.fillStyle = '#111216' 
  context.fillRect(shoulderX + 6, shoulderY + 8, 8, 14)
  
  // Handguard / Barrel shroud
  context.fillStyle = '#1f2128' // dark ribbed handguard
  context.fillRect(shoulderX + 16, shoulderY - 2, 22, 8)
  
  // Barrel sticking out
  context.fillStyle = survivorGunAccent // lighter grey barrel
  context.fillRect(shoulderX + 38, shoulderY, 18, 4)
  
  // Front Sight (Triangle)
  context.fillStyle = '#111216'
  context.beginPath()
  context.moveTo(shoulderX + 46, shoulderY)
  context.lineTo(shoulderX + 50, shoulderY)
  context.lineTo(shoulderX + 48, shoulderY - 6)
  context.fill()

  // Carrying Handle / Optics mount on top of receiver
  context.fillStyle = '#111216'
  context.fillRect(shoulderX + 2, shoulderY - 8, 12, 4)
  
  // --- Back arm connection ---
  // Draws the right arm (front arm visually) holding the handguard
  context.strokeStyle = survivorSkin
  context.lineWidth = 10
  context.beginPath()
  context.moveTo(shoulderX, shoulderY) // Connects from pivot
  context.lineTo(gripX, gripY) // Stretches to handguard
  context.stroke()

  context.strokeStyle = survivorSleeve // Short sleeve (tan shirt)
  context.lineWidth = 12
  context.beginPath()
  context.moveTo(shoulderX, shoulderY)
  context.lineTo(shoulderX + (gripX - shoulderX) * 0.4, shoulderY + (gripY - shoulderY) * 0.4)
  context.stroke()

  // Front tactical glove (fingerless) resting on Handguard
  context.fillStyle = survivorOutline
  context.beginPath()
  context.arc(gripX, gripY, 6, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#22252b'
  context.beginPath()
  context.arc(gripX, gripY, 4.6, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = survivorSkin // Fingers
  context.beginPath()
  context.arc(gripX + 3, gripY, 2.5, 0, Math.PI * 2)
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
    kneePad: true,
  })
  drawSoldierLimb(context, {
    x: bodyX + 10,
    y: bodyY + 24,
    angle: pose.legFront,
    length: 40,
    thickness: 15,
    color: survivorPants,
    end: 'boot',
    kneePad: true,
    holster: true,
  })

  context.save()
  context.translate(bodyX, bodyY)
  context.rotate(pose.torsoLean)

  // Body Base (Tan shirt showing at shoulders and side)
  roundedRect(context, -24, -10, 48, 46, 15)
  fillStroke(context, survivorUnderShirt, survivorOutline, 4)

  // Tactical Vest (Black rig over the torso)
  roundedRect(context, -20, -5, 40, 40, 10)
  fillStroke(context, survivorShirt, survivorOutline, 3)

  // Horizontal ribbed vest details
  context.strokeStyle = survivorOutline
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(-18, 4)
  context.lineTo(18, 4)
  context.moveTo(-18, 12)
  context.lineTo(18, 12)
  context.moveTo(-18, 20)
  context.lineTo(18, 20)
  context.moveTo(-18, 28)
  context.lineTo(18, 28)
  context.stroke()

  context.restore()

  context.save()
  context.translate(58, 31 + pose.bob * 0.4)
  context.rotate(pose.headTilt)

  // Balaclava head shape
  context.beginPath()
  context.ellipse(0, 0, 17, 20, -0.12, 0, Math.PI * 2)
  fillStroke(context, survivorHair, survivorOutline, 3.5)

  // Face hole (showing orange skin and eye)
  context.fillStyle = survivorOutline
  context.beginPath()
  context.ellipse(12, -2, 8, 6, 0.2, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = survivorSkin
  context.beginPath()
  context.ellipse(12, -2, 6, 4, 0.2, 0, Math.PI * 2)
  context.fill()

  // Angry eye
  context.fillStyle = '#ffffff'
  context.beginPath()
  context.ellipse(13, -3, 2, 2, 0.2, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#000000'
  context.beginPath()
  context.ellipse(14, -3, 1, 1, 0, 0, Math.PI * 2)
  context.fill()
  
  // Ear hole (optional detail)
  context.fillStyle = survivorOutline
  context.beginPath()
  context.ellipse(0, 2, 3, 4, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = survivorSkinShadow
  context.beginPath()
  context.ellipse(0, 2, 2, 3, 0, 0, Math.PI * 2)
  context.fill()

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
  const store = window.__VUE_PINIA__ ? Array.from(window.__VUE_PINIA__.state.value.values())[0] : null;
  const skinId = readStorage('selectedSkin', 'swat');
  const skinConfig = PLAYER_SKINS[skinId] || PLAYER_SKINS['swat'];

  // Apply colors dynamically
  survivorSkin = skinConfig.skin || '#ff9249';
  survivorSkinShadow = skinConfig.skinShadow || '#d47b40';
  survivorHair = skinConfig.hair || '#3b4559';
  survivorShirt = skinConfig.shirt || '#343841';
  survivorPants = skinConfig.pants || '#4f5b7d';
  survivorSleeve = skinConfig.sleeve || '#d6a073';
  survivorUnderShirt = skinConfig.underShirt || '#edb483';
  
  if (scene.textures.exists('player-idle-0')) {
    const playerFrames = [
      'player-idle-0', 'player-idle-1',
      'player-walk-0', 'player-walk-1',
      'player-aim-0', 'player-aim-1',
      'player-shoot-0', 'player-shoot-1',
      'player-hit', 'player-death-0', 'player-death-1',
      PLAYER_CARRIED_WEAPON_TEXTURE.key
    ];
    playerFrames.forEach(f => {
      if (scene.textures.exists(f)) {
        scene.textures.remove(f);
      }
    });
  }

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

  // Tree 1: default green
  if (!scene.textures.exists('obstacle-tree-1')) {
    const obGraphic = scene.make.graphics({ add: false })
    obGraphic.fillStyle(0x3e2723, 1) // Brown trunk
    obGraphic.fillRoundedRect(36, 40, 24, 40, 4)
    obGraphic.fillStyle(0x5d4037, 1) // Trunk highlight
    obGraphic.fillRoundedRect(38, 40, 12, 38, 3)
    obGraphic.fillStyle(0x064e3b, 1) // Dark green
    obGraphic.fillCircle(48, 40, 36)
    obGraphic.fillStyle(0x059669, 1) // Green
    obGraphic.fillCircle(48, 32, 28)
    obGraphic.fillStyle(0x10b981, 1) // Light green
    obGraphic.fillCircle(38, 22, 16)
    obGraphic.fillCircle(62, 28, 14)
    obGraphic.fillCircle(48, 18, 12)
    obGraphic.generateTexture('obstacle-tree-1', 96, 96)
    obGraphic.destroy()
  }

  // Tree 2: Pine tree / triangular and darker green
  if (!scene.textures.exists('obstacle-tree-2')) {
    const obGraphic = scene.make.graphics({ add: false })
    obGraphic.fillStyle(0x4e342e, 1) // Dark brown trunk
    obGraphic.fillRoundedRect(40, 40, 16, 40, 2)
    // Triangular pine layers
    obGraphic.fillStyle(0x004d40, 1) // Very dark cyan/green base
    obGraphic.fillTriangle(48, 10, 16, 64, 80, 64)
    obGraphic.fillStyle(0x00695c, 1) // Dark cyan highlight
    obGraphic.fillTriangle(48, 20, 26, 64, 70, 64)
    obGraphic.fillStyle(0x00897b, 1) // Light highlight
    obGraphic.fillTriangle(48, 30, 34, 64, 62, 64)
    obGraphic.generateTexture('obstacle-tree-2', 96, 96)
    obGraphic.destroy()
  }

  // Tree 3: Autumn / orange tree
  if (!scene.textures.exists('obstacle-tree-3')) {
    const obGraphic = scene.make.graphics({ add: false })
    obGraphic.fillStyle(0x3e2723, 1) // Brown trunk
    obGraphic.fillRoundedRect(36, 40, 24, 40, 4)
    obGraphic.fillStyle(0x5d4037, 1)
    obGraphic.fillRoundedRect(38, 40, 12, 38, 3)
    obGraphic.fillStyle(0x9a3412, 1) // Dark orange
    obGraphic.fillCircle(48, 40, 34)
    obGraphic.fillStyle(0xc2410c, 1) // Orange
    obGraphic.fillCircle(48, 32, 26)
    obGraphic.fillStyle(0xea580c, 1) // Bright orange
    obGraphic.fillCircle(38, 22, 15)
    obGraphic.fillCircle(62, 28, 13)
    obGraphic.fillCircle(48, 18, 11)
    obGraphic.generateTexture('obstacle-tree-3', 96, 96)
    obGraphic.destroy()
  }

  // Tree 4: Split-shaded Pine (like in the image)
  if (!scene.textures.exists('obstacle-tree-4')) {
    const obGraphic = scene.make.graphics({ add: false })
    // Trunk
    obGraphic.fillStyle(0x795548, 1) // Brown trunk
    obGraphic.fillRoundedRect(42, 50, 12, 35, 2)
    obGraphic.fillStyle(0x5D4037, 1) // Trunk shadow (right)
    obGraphic.fillRoundedRect(48, 50, 6, 35, 1)

    // Base triangle
    obGraphic.fillStyle(0x2E7D32, 1) // Left side (lighter)
    obGraphic.beginPath()
    obGraphic.moveTo(48, 30) // Top center
    obGraphic.lineTo(16, 70) // Bottom left
    obGraphic.lineTo(48, 70) // Bottom center
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.fillStyle(0x1B5E20, 1) // Right side (darker)
    obGraphic.beginPath()
    obGraphic.moveTo(48, 30) // Top center
    obGraphic.lineTo(48, 70) // Bottom center
    obGraphic.lineTo(80, 70) // Bottom right
    obGraphic.closePath()
    obGraphic.fill()

    // Middle triangle
    obGraphic.fillStyle(0x388E3C, 1)
    obGraphic.beginPath()
    obGraphic.moveTo(48, 15)
    obGraphic.lineTo(24, 55)
    obGraphic.lineTo(48, 55)
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.fillStyle(0x2E7D32, 1)
    obGraphic.beginPath()
    obGraphic.moveTo(48, 15)
    obGraphic.lineTo(48, 55)
    obGraphic.lineTo(72, 55)
    obGraphic.closePath()
    obGraphic.fill()

    // Top triangle
    obGraphic.fillStyle(0x43A047, 1)
    obGraphic.beginPath()
    obGraphic.moveTo(48, 0)
    obGraphic.lineTo(32, 35)
    obGraphic.lineTo(48, 35)
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.fillStyle(0x388E3C, 1)
    obGraphic.beginPath()
    obGraphic.moveTo(48, 0)
    obGraphic.lineTo(48, 35)
    obGraphic.lineTo(64, 35)
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.generateTexture('obstacle-tree-4', 96, 96)
    obGraphic.destroy()
  }

  // Tree 5: Clustered Fluffy Tree (like in the image)
  if (!scene.textures.exists('obstacle-tree-5')) {
    const obGraphic = scene.make.graphics({ add: false })
    // Trunk
    obGraphic.fillStyle(0x6D4C41, 1)
    obGraphic.fillRoundedRect(42, 60, 12, 30, 2)
    obGraphic.fillStyle(0x4E342E, 1) // Trunk shadow (right)
    obGraphic.fillRoundedRect(48, 60, 6, 30, 1)

    // Leaves shadow circles
    obGraphic.fillStyle(0x2E7D32, 1)
    obGraphic.fillCircle(38, 48, 22)
    obGraphic.fillCircle(62, 44, 20)
    obGraphic.fillCircle(48, 28, 24)
    obGraphic.fillCircle(30, 32, 18)
    obGraphic.fillCircle(68, 28, 16)
    
    // Leaves highlight circles
    obGraphic.fillStyle(0x43A047, 1)
    obGraphic.fillCircle(34, 44, 20)
    obGraphic.fillCircle(58, 40, 18)
    obGraphic.fillCircle(44, 24, 22)
    obGraphic.fillCircle(26, 26, 16)
    obGraphic.fillCircle(64, 24, 14)

    obGraphic.generateTexture('obstacle-tree-5', 96, 96)
    obGraphic.destroy()
  }

  // Tree 6: Tree stump
  if (!scene.textures.exists('obstacle-tree-6')) {
    const obGraphic = scene.make.graphics({ add: false })
    
    // Stump base (cylinder body)
    obGraphic.fillStyle(0x5D4037, 1) // Base brown
    obGraphic.fillRoundedRect(34, 50, 28, 30, 4)
    
    // Roots / bottom flare
    obGraphic.beginPath()
    obGraphic.moveTo(36, 75)
    obGraphic.lineTo(24, 85)
    obGraphic.lineTo(38, 80)
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.beginPath()
    obGraphic.moveTo(60, 75)
    obGraphic.lineTo(72, 85)
    obGraphic.lineTo(58, 80)
    obGraphic.closePath()
    obGraphic.fill()

    // Shadow on right side
    obGraphic.fillStyle(0x3E2723, 1)
    obGraphic.fillRoundedRect(48, 50, 14, 30, 4)

    // Stump top (cut center)
    obGraphic.fillStyle(0x8D6E63, 1) // Lighter wood color inside
    obGraphic.fillEllipse(48, 50, 28, 10)
    
    // Tree rings
    obGraphic.lineStyle(1, 0x5D4037, 0.6)
    obGraphic.strokeEllipse(48, 50, 20, 7)
    obGraphic.strokeEllipse(48, 50, 10, 3)

    obGraphic.generateTexture('obstacle-tree-6', 96, 96)
    obGraphic.destroy()
  }

  // Stone 1: Round/Hexagonal boulder
  if (!scene.textures.exists('obstacle-stone-1')) {
    const obGraphic = scene.make.graphics({ add: false })
    // Center at 48, 56. Radius ~24
    obGraphic.fillStyle(0x444A59, 1) // Shadow base
    obGraphic.beginPath()
    obGraphic.moveTo(34, 40)
    obGraphic.lineTo(62, 40)
    obGraphic.lineTo(76, 56)
    obGraphic.lineTo(62, 72)
    obGraphic.lineTo(34, 72)
    obGraphic.lineTo(20, 56)
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.fillStyle(0x5C6374, 1) // Mid-tone
    obGraphic.beginPath()
    obGraphic.moveTo(34, 40)
    obGraphic.lineTo(62, 40)
    obGraphic.lineTo(72, 54)
    obGraphic.lineTo(60, 68)
    obGraphic.lineTo(34, 68)
    obGraphic.lineTo(22, 54)
    obGraphic.closePath()
    obGraphic.fill()

    obGraphic.fillStyle(0x7B8497, 1) // Highlight top
    obGraphic.beginPath()
    obGraphic.moveTo(34, 40)
    obGraphic.lineTo(62, 40)
    obGraphic.lineTo(54, 52)
    obGraphic.lineTo(40, 52)
    obGraphic.closePath()
    obGraphic.fill()

    // Cracks
    obGraphic.lineStyle(2, 0x333845, 0.8)
    obGraphic.beginPath()
    obGraphic.moveTo(60, 40)
    obGraphic.lineTo(50, 52)
    obGraphic.lineTo(54, 62)
    obGraphic.stroke()

    obGraphic.generateTexture('obstacle-stone-1', 96, 96)
    obGraphic.destroy()
  }

  // Stone 2: Wide flat rock
  if (!scene.textures.exists('obstacle-stone-2')) {
    const obGraphic = scene.make.graphics({ add: false })
    // Center at 48, 56. Width ~56, Height ~30
    obGraphic.fillStyle(0x444A59, 1) // Shadow base
    obGraphic.fillRoundedRect(18, 46, 60, 26, 6)

    obGraphic.fillStyle(0x5C6374, 1) // Mid-tone
    obGraphic.fillRoundedRect(20, 46, 56, 22, 4)

    obGraphic.fillStyle(0x7B8497, 1) // Highlight
    obGraphic.fillRoundedRect(22, 46, 52, 10, 4)

    // Details/cracks
    obGraphic.lineStyle(2, 0x333845, 0.8)
    obGraphic.beginPath()
    obGraphic.moveTo(30, 46)
    obGraphic.lineTo(36, 56)
    obGraphic.lineTo(26, 66)
    obGraphic.stroke()

    obGraphic.beginPath()
    obGraphic.moveTo(65, 46)
    obGraphic.lineTo(55, 58)
    obGraphic.stroke()

    obGraphic.generateTexture('obstacle-stone-2', 96, 96)
    obGraphic.destroy()
  }

  // Stone 3: Messy Rubble Pile
  if (!scene.textures.exists('obstacle-stone-3')) {
    const obGraphic = scene.make.graphics({ add: false });

    const drawJagged = (points, baseC, midC, highC, crack) => {
      obGraphic.fillStyle(baseC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      for(let i=1; i<points.length; i++) obGraphic.lineTo(points[i].x, points[i].y);
      obGraphic.closePath();
      obGraphic.fill();

      // Top face/mid-tone
      obGraphic.fillStyle(midC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo(points[2].x, points[2].y);
      obGraphic.lineTo(points[3].x, points[3].y);
      obGraphic.closePath();
      obGraphic.fill();

      // Highlight
      obGraphic.fillStyle(highC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo((points[1].x + points[2].x)/2, (points[1].y + points[2].y)/2);
      obGraphic.closePath();
      obGraphic.fill();

      if(crack) {
        obGraphic.lineStyle(2, 0x333845, 0.8);
        obGraphic.beginPath();
        obGraphic.moveTo(points[1].x, points[1].y);
        obGraphic.lineTo((points[0].x + points[3].x)/2, (points[0].y + points[3].y)/2);
        obGraphic.stroke();
      }
    };

    // Rock 1 (bottom left)
    drawJagged([
      {x: 22, y: 56}, {x: 44, y: 52}, {x: 40, y: 68}, 
      {x: 26, y: 72}, {x: 18, y: 64}
    ], 0x333845, 0x5C6374, 0x7B8497, true);

    // Rock 2 (bottom right)
    drawJagged([
      {x: 42, y: 54}, {x: 68, y: 48}, {x: 74, y: 60}, 
      {x: 64, y: 68}, {x: 46, y: 66}
    ], 0x444A59, 0x5C6374, 0x7B8497, false);

    // Rock 3 (center middle)
    drawJagged([
      {x: 32, y: 40}, {x: 58, y: 35}, {x: 52, y: 55}, 
      {x: 38, y: 58}, {x: 28, y: 48}
    ], 0x333845, 0x5C6374, 0x7B8497, true);

    // Rock 4 (left middle)
    drawJagged([
      {x: 20, y: 45}, {x: 34, y: 35}, {x: 36, y: 45}, 
      {x: 28, y: 52}, {x: 22, y: 50}
    ], 0x444A59, 0x5C6374, 0x7B8497, false);

    // Rock 5 (top)
    drawJagged([
      {x: 38, y: 24}, {x: 54, y: 26}, {x: 48, y: 42}, 
      {x: 36, y: 38}, {x: 34, y: 30}
    ], 0x444A59, 0x5C6374, 0x7B8497, true);

    obGraphic.generateTexture('obstacle-stone-3', 96, 96);
    obGraphic.destroy();
  }

  // Stone 4: Tall, Precarious Messy Cairn
  if (!scene.textures.exists('obstacle-stone-4')) {
    const obGraphic = scene.make.graphics({ add: false });

    const drawJagged = (points, baseC, midC, highC, crack) => {
      obGraphic.fillStyle(baseC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      for(let i=1; i<points.length; i++) obGraphic.lineTo(points[i].x, points[i].y);
      obGraphic.closePath();
      obGraphic.fill();

      // Top face/mid-tone
      obGraphic.fillStyle(midC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo(points[2].x, points[2].y);
      obGraphic.lineTo(points[3].x, points[3].y);
      obGraphic.closePath();
      obGraphic.fill();

      // Highlight
      obGraphic.fillStyle(highC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo((points[1].x + points[2].x)/2, (points[1].y + points[2].y)/2);
      obGraphic.closePath();
      obGraphic.fill();

      if(crack) {
        obGraphic.lineStyle(2, 0x333845, 0.8);
        obGraphic.beginPath();
        obGraphic.moveTo(points[1].x, points[1].y);
        obGraphic.lineTo((points[0].x + points[3].x)/2, (points[0].y + points[3].y)/2);
        obGraphic.stroke();
      }
    };

    // Base rock
    drawJagged([
      {x: 25, y: 55}, {x: 65, y: 60}, {x: 60, y: 72}, 
      {x: 35, y: 75}, {x: 20, y: 65}
    ], 0x333845, 0x5C6374, 0x7B8497, true);

    // Angled second rock
    drawJagged([
      {x: 35, y: 40}, {x: 68, y: 45}, {x: 62, y: 58}, 
      {x: 40, y: 62}, {x: 30, y: 50}
    ], 0x444A59, 0x5C6374, 0x7B8497, false);

    // Shorter third rock wedged inside
    drawJagged([
      {x: 28, y: 35}, {x: 52, y: 28}, {x: 56, y: 45}, 
      {x: 40, y: 48}, {x: 24, y: 42}
    ], 0x333845, 0x5C6374, 0x7B8497, true);

    // Precarious fourth rock
    drawJagged([
      {x: 45, y: 15}, {x: 62, y: 22}, {x: 55, y: 35}, 
      {x: 42, y: 30}, {x: 38, y: 25}
    ], 0x444A59, 0x5C6374, 0x7B8497, false);

    // Tip rock balancing
    drawJagged([
      {x: 50, y: 5}, {x: 60, y: 8}, {x: 58, y: 18}, 
      {x: 48, y: 15}, {x: 46, y: 10}
    ], 0x444A59, 0x5C6374, 0x7B8497, true);

    obGraphic.generateTexture('obstacle-stone-4', 96, 96);
    obGraphic.destroy();
  }

  // Stone 5: Loose Messy Scattered Rocks
  if (!scene.textures.exists('obstacle-stone-5')) {
    const obGraphic = scene.make.graphics({ add: false });

    const drawJagged = (points, baseC, midC, highC, crack) => {
      obGraphic.fillStyle(baseC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      for(let i=1; i<points.length; i++) obGraphic.lineTo(points[i].x, points[i].y);
      obGraphic.closePath();
      obGraphic.fill();

      obGraphic.fillStyle(midC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo(points[2].x, points[2].y);
      obGraphic.lineTo(points[3].x, points[3].y);
      obGraphic.closePath();
      obGraphic.fill();

      obGraphic.fillStyle(highC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo((points[1].x + points[2].x)/2, (points[1].y + points[2].y)/2);
      obGraphic.closePath();
      obGraphic.fill();

      if(crack) {
        obGraphic.lineStyle(2, 0x333845, 0.8);
        obGraphic.beginPath();
        obGraphic.moveTo(points[1].x, points[1].y);
        obGraphic.lineTo((points[0].x + points[3].x)/2, (points[0].y + points[3].y)/2);
        obGraphic.stroke();
      }
    };

    // Loose rock 1 (bottom left)
    drawJagged([ {x: 15, y: 55}, {x: 35, y: 50}, {x: 40, y: 70}, {x: 20, y: 75}, {x: 10, y: 65} ], 0x333845, 0x5C6374, 0x7B8497, true);
    // Loose rock 2 (bottom right, further away)
    drawJagged([ {x: 60, y: 65}, {x: 80, y: 60}, {x: 85, y: 75}, {x: 65, y: 80}, {x: 55, y: 70} ], 0x444A59, 0x5C6374, 0x7B8497, false);
    // Loose rock 3 (center top)
    drawJagged([ {x: 40, y: 35}, {x: 60, y: 40}, {x: 55, y: 55}, {x: 35, y: 50}, {x: 30, y: 40} ], 0x333845, 0x5C6374, 0x7B8497, true);
    // Loose pebble 1
    drawJagged([ {x: 20, y: 30}, {x: 30, y: 25}, {x: 35, y: 35}, {x: 25, y: 40} ], 0x444A59, 0x5C6374, 0x7B8497, false);
    // Loose pebble 2
    drawJagged([ {x: 75, y: 40}, {x: 85, y: 45}, {x: 80, y: 55}, {x: 70, y: 50} ], 0x333845, 0x5C6374, 0x7B8497, false);

    obGraphic.generateTexture('obstacle-stone-5', 96, 96);
    obGraphic.destroy();
  }

  // Stone 6: Shattered wide scattered debris
  if (!scene.textures.exists('obstacle-stone-6')) {
    const obGraphic = scene.make.graphics({ add: false });

    const drawJagged = (points, baseC, midC, highC, crack) => {
      obGraphic.fillStyle(baseC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      for(let i=1; i<points.length; i++) obGraphic.lineTo(points[i].x, points[i].y);
      obGraphic.closePath();
      obGraphic.fill();

      obGraphic.fillStyle(midC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo(points[2].x, points[2].y);
      obGraphic.lineTo(points[3].x, points[3].y);
      obGraphic.closePath();
      obGraphic.fill();

      obGraphic.fillStyle(highC, 1);
      obGraphic.beginPath();
      obGraphic.moveTo(points[0].x, points[0].y);
      obGraphic.lineTo(points[1].x, points[1].y);
      obGraphic.lineTo((points[1].x + points[2].x)/2, (points[1].y + points[2].y)/2);
      obGraphic.closePath();
      obGraphic.fill();

      if(crack) {
        obGraphic.lineStyle(2, 0x333845, 0.8);
        obGraphic.beginPath();
        obGraphic.moveTo(points[1].x, points[1].y);
        obGraphic.lineTo((points[0].x + points[3].x)/2, (points[0].y + points[3].y)/2);
        obGraphic.stroke();
      }
    };

    // Split broken half 1
    drawJagged([ {x: 10, y: 45}, {x: 35, y: 40}, {x: 40, y: 60}, {x: 20, y: 70}, {x: 5, y: 55} ], 0x444A59, 0x5C6374, 0x7B8497, true);
    // Split broken half 2
    drawJagged([ {x: 45, y: 35}, {x: 85, y: 30}, {x: 75, y: 55}, {x: 50, y: 60}, {x: 40, y: 45} ], 0x333845, 0x5C6374, 0x7B8497, true);
    // Shattered chunk
    drawJagged([ {x: 42, y: 65}, {x: 55, y: 60}, {x: 60, y: 75}, {x: 45, y: 80} ], 0x444A59, 0x5C6374, 0x7B8497, false);
    // Pebble 1
    drawJagged([ {x: 30, y: 20}, {x: 40, y: 25}, {x: 35, y: 35}, {x: 25, y: 30} ], 0x333845, 0x5C6374, 0x7B8497, false);
    // Pebble 2
    drawJagged([ {x: 60, y: 15}, {x: 75, y: 20}, {x: 70, y: 30}, {x: 55, y: 25} ], 0x444A59, 0x5C6374, 0x7B8497, false);

    obGraphic.generateTexture('obstacle-stone-6', 96, 96);
    obGraphic.destroy();
  }

  // Cactus 1: Saguaro
  if (!scene.textures.exists('obstacle-cactus-1')) {
    const obGraphic = scene.make.graphics({ add: false });
    // shadow
    obGraphic.fillStyle(0x1B5E20, 1);
    obGraphic.fillRoundedRect(40, 20, 16, 70, 8); // main body
    obGraphic.fillRoundedRect(20, 40, 16, 35, 8); // left arm
    obGraphic.fillRoundedRect(25, 40, 30, 14, 6); // left arm connect
    obGraphic.fillRoundedRect(60, 30, 16, 40, 8); // right arm
    obGraphic.fillRoundedRect(45, 56, 30, 14, 6); // right arm connect
    
    // highlight
    obGraphic.fillStyle(0x388E3C, 1);
    obGraphic.fillRoundedRect(42, 22, 10, 66, 5); 
    obGraphic.fillRoundedRect(22, 42, 10, 30, 5); 
    obGraphic.fillRoundedRect(25, 42, 20, 10, 5); 
    obGraphic.fillRoundedRect(62, 32, 10, 35, 5); 
    obGraphic.fillRoundedRect(53, 58, 15, 10, 5); 

    // spikes
    obGraphic.fillStyle(0xAED581, 1);
    for(let i=0; i<25; i++) {
        obGraphic.fillCircle(Phaser.Math.Between(20, 76), Phaser.Math.Between(20, 85), 1.5);
    }
    
    // flower on top
    obGraphic.fillStyle(0xF48FB1, 1);
    obGraphic.fillCircle(48, 20, 5);
    obGraphic.fillCircle(28, 40, 4);
    obGraphic.fillCircle(68, 30, 4);
    
    obGraphic.generateTexture('obstacle-cactus-1', 96, 96);
    obGraphic.destroy();
  }

  // Cactus 2: Barrel Cactus Cluster
  if (!scene.textures.exists('obstacle-cactus-2')) {
    const obGraphic = scene.make.graphics({ add: false });
    obGraphic.fillStyle(0x1B5E20, 1);
    obGraphic.fillCircle(48, 60, 24);
    obGraphic.fillCircle(65, 70, 16);
    obGraphic.fillCircle(30, 75, 14);

    obGraphic.fillStyle(0x43A047, 1);
    obGraphic.fillCircle(48, 60, 20);
    obGraphic.fillCircle(65, 70, 12);
    obGraphic.fillCircle(30, 75, 10);

    // Ribs
    obGraphic.lineStyle(2, 0x1B5E20, 0.5);
    obGraphic.beginPath(); obGraphic.moveTo(48, 40); obGraphic.lineTo(48, 80); obGraphic.stroke();
    
    // Spikes
    obGraphic.fillStyle(0xDCEDC8, 1);
    for(let i=0; i<30; i++) {
        obGraphic.fillCircle(Phaser.Math.Between(20, 76), Phaser.Math.Between(40, 85), 1.5);
    }

    // flower
    obGraphic.fillStyle(0xFF8A80, 1);
    obGraphic.fillCircle(48, 38, 7);
    obGraphic.fillCircle(65, 55, 5);

    obGraphic.generateTexture('obstacle-cactus-2', 96, 96);
    obGraphic.destroy();
  }
  
  // Cactus 3: Prickly Pear
  if (!scene.textures.exists('obstacle-cactus-3')) {
    const obGraphic = scene.make.graphics({ add: false });
    obGraphic.fillStyle(0x1B5E20, 1);
    obGraphic.fillEllipse(48, 65, 24, 25);
    obGraphic.fillEllipse(30, 48, 18, 22);
    obGraphic.fillEllipse(66, 45, 16, 20);
    obGraphic.fillEllipse(40, 25, 14, 18);

    obGraphic.fillStyle(0x4CAF50, 1);
    obGraphic.fillEllipse(48, 65, 20, 21);
    obGraphic.fillEllipse(30, 48, 15, 18);
    obGraphic.fillEllipse(66, 45, 13, 16);
    obGraphic.fillEllipse(40, 25, 11, 14);

    obGraphic.fillStyle(0xDCEDC8, 1);
    for(let i=0; i<30; i++) {
        obGraphic.fillCircle(Phaser.Math.Between(15, 80), Phaser.Math.Between(15, 85), 1.5);
    }

    // flower
    obGraphic.fillStyle(0xFF8A80, 1);
    obGraphic.fillCircle(30, 27, 4);
    obGraphic.fillCircle(66, 26, 4);

    obGraphic.generateTexture('obstacle-cactus-3', 96, 96);
    obGraphic.destroy();
  }
}

export function registerCustomZombieAnimations(scene) {
  const customKeys = ['z1', 'z2', 'z3', 'z4', 'z5', 'giantBoss', 'miniBoss'];
  for (const key of customKeys) {
    
    // Safety check - ensures textures are actually loaded before setting animations
    if (!scene.textures.exists(key)) continue;

    const tex = scene.textures.get(key)
    // Force manual slice if the Phaser Spritesheet Parser failed to slice it during load
    if (tex.frameTotal <= 2) {
      let index = 0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
          tex.add(index++, 0, x * 316, y * 256, 316, 256)
        }
      }
    }

    try {
      if (!scene.anims.exists(`${key}-idle`)) {
        scene.anims.create({
          key: `${key}-idle`,
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
          frameRate: 6,
          repeat: -1
        })
      }

      if (!scene.anims.exists(`${key}-walk`)) {
        scene.anims.create({
          key: `${key}-walk`,
          frames: scene.anims.generateFrameNumbers(key, { start: 3, end: 6 }),
          frameRate: 10,
          repeat: -1
        })
      }

      if (!scene.anims.exists(`${key}-attack`)) {
        scene.anims.create({
          key: `${key}-attack`,
          // Frames 7-9 only — avoids overlap with death animation which starts at frame 9
          frames: scene.anims.generateFrameNumbers(key, { start: 7, end: 9 }),
          frameRate: 12,
          repeat: 0
        })
      }

      if (!scene.anims.exists(`${key}-death`)) {
        scene.anims.create({
          key: `${key}-death`,
          // Frames 9-11: red enraged death sequence (no overlap with attack end frame)
          frames: scene.anims.generateFrameNumbers(key, { start: 9, end: 11 }),
          frameRate: 6,
          repeat: 0
        })
      }
      
      if (!scene.anims.exists(`${key}-hit`)) {
        scene.anims.create({
          key: `${key}-hit`,
          frames: [{ key: key, frame: 8 }],
          frameRate: 10,
          repeat: 0
        })
      }
    } catch (e) {
      console.warn('Failed to parse frame animation for', key, e)
    }
  }
}

