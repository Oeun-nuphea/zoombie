import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MAP_WIDTH = 1920
const MAP_HEIGHT = 1080
const CENTER_X = MAP_WIDTH / 2
const CENTER_Y = MAP_HEIGHT / 2

const assetDir = path.resolve(__dirname, '../public/assets/maps')
const svgPath = path.join(assetDir, 'field-map-source.svg')
const pngPath = path.join(assetDir, 'field-map.png')
const renderPagePath = path.join(assetDir, 'field-map-render.html')
const candidatePngPath = path.join(assetDir, 'field-map-candidate.png')

function mulberry32(seed) {
  return function generate() {
    let value = seed += 0x6d2b79f5
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(0x4d372b11)
const tau = Math.PI * 2
const n = (value) => Number(value.toFixed(2))
const random = (min, max) => min + (max - min) * rng()
const int = (min, max) => Math.floor(random(min, max + 1))
const pick = (items) => items[int(0, items.length - 1)]

function attrs(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(' ')
}

function shape(name, attributes, content = '') {
  const serialized = attrs(attributes)
  if (!content) {
    return `<${name} ${serialized} />`
  }

  return `<${name} ${serialized}>${content}</${name}>`
}

function rotate(degrees, cx, cy) {
  return `rotate(${n(degrees)} ${n(cx)} ${n(cy)})`
}

function poly(points, attributes) {
  return shape('polygon', {
    ...attributes,
    points: points.map(([x, y]) => `${n(x)},${n(y)}`).join(' '),
  })
}

function pathElement(d, attributes) {
  return shape('path', {
    ...attributes,
    d,
  })
}

function circle(cx, cy, r, attributes) {
  return shape('circle', {
    ...attributes,
    cx: n(cx),
    cy: n(cy),
    r: n(r),
  })
}

function ellipse(cx, cy, rx, ry, attributes) {
  return shape('ellipse', {
    ...attributes,
    cx: n(cx),
    cy: n(cy),
    rx: n(rx),
    ry: n(ry),
  })
}

function rect(x, y, width, height, attributes) {
  return shape('rect', {
    ...attributes,
    x: n(x),
    y: n(y),
    width: n(width),
    height: n(height),
  })
}

function line(x1, y1, x2, y2, attributes) {
  return shape('line', {
    ...attributes,
    x1: n(x1),
    y1: n(y1),
    x2: n(x2),
    y2: n(y2),
  })
}

function generateGroundTexture() {
  const layers = []
  const earthTones = ['#2c221f', '#332825', '#241d1a', '#3a2f2c']
  const stoneTones = ['#61534c', '#76665d', '#4d403a', '#8b7c73']

  layers.push(rect(0, 0, MAP_WIDTH, MAP_HEIGHT, { fill: 'url(#ground-base)' }))
  layers.push(rect(0, 0, MAP_WIDTH, MAP_HEIGHT, { fill: '#12171c', opacity: 0.08 }))

  for (let index = 0; index < 220; index += 1) {
    const x = random(0, MAP_WIDTH)
    const y = random(0, MAP_HEIGHT)
    const radius = random(24, 110)
    layers.push(ellipse(x, y, radius * random(0.7, 1.45), radius * random(0.45, 1.05), {
      fill: pick(earthTones),
      opacity: n(random(0.04, 0.1)),
      transform: rotate(random(0, 360), x, y),
    }))
  }

  for (let index = 0; index < 170; index += 1) {
    const startX = random(40, MAP_WIDTH - 40)
    const startY = random(40, MAP_HEIGHT - 40)
    const ctrlX = startX + random(-100, 100)
    const ctrlY = startY + random(-44, 44)
    const endX = startX + random(-130, 130)
    const endY = startY + random(-70, 70)
    layers.push(pathElement(`M ${n(startX)} ${n(startY)} Q ${n(ctrlX)} ${n(ctrlY)} ${n(endX)} ${n(endY)}`, {
      fill: 'none',
      stroke: pick(['#171312', '#211918', '#43342f']),
      'stroke-width': n(random(1, 2.8)),
      opacity: n(random(0.14, 0.24)),
      'stroke-linecap': 'round',
    }))
  }

  for (let index = 0; index < 260; index += 1) {
    const cx = random(20, MAP_WIDTH - 20)
    const cy = random(20, MAP_HEIGHT - 20)
    const sides = int(4, 7)
    const radius = random(3, 10)
    const points = Array.from({ length: sides }, (_, pointIndex) => {
      const angle = (pointIndex / sides) * tau
      const pointRadius = radius * random(0.72, 1.28)
      return [
        cx + Math.cos(angle) * pointRadius,
        cy + Math.sin(angle) * pointRadius,
      ]
    })

    layers.push(poly(points, {
      fill: pick(stoneTones),
      opacity: n(random(0.2, 0.42)),
    }))
  }

  for (let index = 0; index < 120; index += 1) {
    const x = random(28, MAP_WIDTH - 28)
    const y = random(28, MAP_HEIGHT - 28)
    layers.push(rect(x, y, random(8, 18), random(4, 10), {
      fill: pick(['#8a7767', '#57453d', '#6c5c53']),
      opacity: n(random(0.12, 0.22)),
      rx: n(random(1, 3)),
      transform: rotate(random(-30, 30), x, y),
    }))
  }

  return layers.join('\n')
}

function scatterDebris(areaX, areaY, areaWidth, areaHeight, count) {
  const parts = []

  for (let index = 0; index < count; index += 1) {
    const x = random(areaX, areaX + areaWidth)
    const y = random(areaY, areaY + areaHeight)
    parts.push(rect(x, y, random(4, 14), random(2, 7), {
      fill: pick(['#7c6b5f', '#4a3d37', '#2b2421', '#9b897f']),
      opacity: n(random(0.22, 0.46)),
      rx: n(random(1, 2)),
      transform: rotate(random(-44, 44), x, y),
    }))
  }

  return parts.join('\n')
}

function bloodCluster(cx, cy, scale = 1) {
  const parts = []
  const coreColor = '#621514'
  const edgeColor = '#8c221b'

  parts.push(ellipse(cx, cy, 30 * scale, 18 * scale, {
    fill: coreColor,
    opacity: 0.24,
    transform: rotate(random(-30, 30), cx, cy),
  }))

  for (let index = 0; index < 8; index += 1) {
    const angle = random(0, tau)
    const distance = random(12, 72) * scale
    const x = cx + Math.cos(angle) * distance
    const y = cy + Math.sin(angle) * distance
    parts.push(ellipse(x, y, random(4, 14) * scale, random(3, 8) * scale, {
      fill: pick([coreColor, edgeColor]),
      opacity: n(random(0.16, 0.3)),
      transform: rotate(random(0, 360), x, y),
    }))
  }

  return parts.join('\n')
}

function createFenceSegment({ x1, y1, x2, y2 }) {
  const parts = []
  const horizontal = Math.abs(y1 - y2) < 1
  const length = horizontal ? x2 - x1 : y2 - y1
  const baseThickness = 16
  const meshHeight = 30
  const postSpacing = 56
  const step = 14

  if (horizontal) {
    parts.push(rect(x1, y1, length, baseThickness, {
      fill: '#857a73',
      opacity: 0.94,
      rx: 4,
    }))

    for (let offset = 0; offset < length; offset += 34) {
      parts.push(rect(x1 + offset, y1 + 1, Math.min(32, length - offset), baseThickness - 2, {
        fill: pick(['#938780', '#766d67', '#a0938d']),
        opacity: 0.86,
        rx: 3,
      }))
    }

    for (let offset = -meshHeight; offset < length + meshHeight; offset += step) {
      parts.push(line(x1 + offset, y1 - meshHeight, x1 + offset + meshHeight, y1, {
        stroke: '#596067',
        'stroke-width': 1,
        opacity: 0.38,
      }))
      parts.push(line(x1 + offset + meshHeight, y1 - meshHeight, x1 + offset, y1, {
        stroke: '#383d42',
        'stroke-width': 1,
        opacity: 0.24,
      }))
    }

    for (let offset = 0; offset <= length; offset += postSpacing) {
      const postX = x1 + offset
      parts.push(line(postX, y1 - meshHeight - 8, postX, y1 + baseThickness + 4, {
        stroke: '#686d70',
        'stroke-width': 4,
        opacity: 0.96,
        'stroke-linecap': 'round',
      }))
      parts.push(circle(postX, y1 - meshHeight - 11, 3.8, {
        fill: '#71767b',
      }))
    }

    parts.push(line(x1, y1 - meshHeight, x2, y1 - meshHeight, {
      stroke: '#80868c',
      'stroke-width': 2,
      opacity: 0.5,
    }))
  } else {
    parts.push(rect(x1, y1, baseThickness, length, {
      fill: '#857a73',
      opacity: 0.94,
      rx: 4,
    }))

    for (let offset = 0; offset < length; offset += 34) {
      parts.push(rect(x1 + 1, y1 + offset, baseThickness - 2, Math.min(32, length - offset), {
        fill: pick(['#938780', '#766d67', '#a0938d']),
        opacity: 0.86,
        rx: 3,
      }))
    }

    for (let offset = -meshHeight; offset < length + meshHeight; offset += step) {
      parts.push(line(x1 - meshHeight, y1 + offset, x1, y1 + offset + meshHeight, {
        stroke: '#596067',
        'stroke-width': 1,
        opacity: 0.38,
      }))
      parts.push(line(x1, y1 + offset, x1 - meshHeight, y1 + offset + meshHeight, {
        stroke: '#383d42',
        'stroke-width': 1,
        opacity: 0.24,
      }))
    }

    for (let offset = 0; offset <= length; offset += postSpacing) {
      const postY = y1 + offset
      parts.push(line(x1 - meshHeight - 8, postY, x1 + baseThickness + 4, postY, {
        stroke: '#686d70',
        'stroke-width': 4,
        opacity: 0.96,
        'stroke-linecap': 'round',
      }))
      parts.push(circle(x1 - meshHeight - 11, postY, 3.8, {
        fill: '#71767b',
      }))
    }

    parts.push(line(x1 - meshHeight, y1, x1 - meshHeight, y2, {
      stroke: '#80868c',
      'stroke-width': 2,
      opacity: 0.5,
    }))
  }

  return parts.join('\n')
}

function leaningFencePanel(x, y, width, height, angle) {
  const parts = []
  const cx = x + width / 2
  const cy = y + height / 2

  for (let offset = -height; offset < width + height; offset += 12) {
    parts.push(line(x + offset, y, x + offset + height, y + height, {
      stroke: '#596067',
      'stroke-width': 1,
      opacity: 0.38,
      transform: rotate(angle, cx, cy),
    }))
    parts.push(line(x + offset + height, y, x + offset, y + height, {
      stroke: '#383d42',
      'stroke-width': 1,
      opacity: 0.22,
      transform: rotate(angle, cx, cy),
    }))
  }

  parts.push(rect(x, y, width, height, {
    fill: 'none',
    stroke: '#788085',
    'stroke-width': 3,
    opacity: 0.7,
    rx: 3,
    transform: rotate(angle, cx, cy),
  }))

  return parts.join('\n')
}

function createPerimeter() {
  const topY = 34
  const bottomY = MAP_HEIGHT - 50
  const leftX = 34
  const rightX = MAP_WIDTH - 50

  return [
    createFenceSegment({ x1: leftX + 10, y1: topY, x2: 864, y2: topY }),
    createFenceSegment({ x1: 1026, y1: topY, x2: rightX - 10, y2: topY }),
    createFenceSegment({ x1: leftX + 10, y1: bottomY, x2: 938, y2: bottomY }),
    createFenceSegment({ x1: 1088, y1: bottomY, x2: rightX - 10, y2: bottomY }),
    createFenceSegment({ x1: leftX, y1: 42, x2: leftX, y2: 430 }),
    createFenceSegment({ x1: leftX, y1: 610, x2: leftX, y2: MAP_HEIGHT - 40 }),
    createFenceSegment({ x1: rightX, y1: 42, x2: rightX, y2: 430 }),
    createFenceSegment({ x1: rightX, y1: 610, x2: rightX, y2: MAP_HEIGHT - 40 }),
    leaningFencePanel(916, 22, 102, 42, -8),
    leaningFencePanel(964, MAP_HEIGHT - 88, 110, 46, 7),
    leaningFencePanel(14, 492, 44, 86, -12),
    leaningFencePanel(MAP_WIDTH - 68, 506, 44, 86, 11),
    scatterDebris(0, 0, MAP_WIDTH, 76, 40),
    scatterDebris(0, MAP_HEIGHT - 84, MAP_WIDTH, 84, 40),
    scatterDebris(0, 70, 74, MAP_HEIGHT - 140, 26),
    scatterDebris(MAP_WIDTH - 84, 70, 84, MAP_HEIGHT - 140, 26),
  ].join('\n')
}

function building({ x, y, width, height, litWindow = false, flipped = false }) {
  const roofHeight = height * 0.48
  const roofY = y - 14
  const doorWidth = 46
  const doorHeight = 66
  const doorX = x + width * 0.5 - doorWidth / 2
  const doorY = y + height - doorHeight - 14
  const leftWindowX = x + 28
  const rightWindowX = x + width - 82
  const windowY = y + 42
  const litFill = litWindow ? 'url(#window-glow)' : '#15191d'
  const parts = []

  parts.push(rect(x + 10, y + 12, width, height, {
    fill: '#060607',
    opacity: 0.18,
    rx: 10,
  }))
  parts.push(rect(x, y, width, height, {
    fill: '#5a5654',
    stroke: '#25211e',
    'stroke-width': 5,
    rx: 10,
  }))
  parts.push(rect(x - 8, roofY, width + 16, roofHeight, {
    fill: 'url(#roof-fill)',
    stroke: '#292422',
    'stroke-width': 5,
    rx: 12,
  }))
  parts.push(line(x + 20, y + roofHeight + 4, x + width - 20, y + roofHeight + 4, {
    stroke: '#3f3a38',
    'stroke-width': 4,
    opacity: 0.8,
  }))
  parts.push(rect(doorX, doorY, doorWidth, doorHeight, {
    fill: '#181514',
    stroke: '#090909',
    'stroke-width': 4,
    rx: 4,
  }))
  parts.push(rect(leftWindowX, windowY, 50, 34, {
    fill: flipped ? '#15191d' : litFill,
    stroke: '#191b1d',
    'stroke-width': 4,
    rx: 4,
  }))
  parts.push(rect(rightWindowX, windowY, 50, 34, {
    fill: flipped ? litFill : '#15191d',
    stroke: '#191b1d',
    'stroke-width': 4,
    rx: 4,
  }))
  parts.push(pathElement(`M ${n(x + 28)} ${n(y + 64)} L ${n(x + 64)} ${n(y + 34)} L ${n(x + 94)} ${n(y + 72)}`, {
    fill: 'none',
    stroke: '#837970',
    'stroke-width': 3.5,
    opacity: 0.42,
    'stroke-linecap': 'round',
  }))
  parts.push(pathElement(`M ${n(x + width - 74)} ${n(y + 72)} L ${n(x + width - 44)} ${n(y + 44)} L ${n(x + width - 18)} ${n(y + 82)}`, {
    fill: 'none',
    stroke: '#81766f',
    'stroke-width': 3.5,
    opacity: 0.42,
    'stroke-linecap': 'round',
  }))
  parts.push(poly([
    [doorX - 16, y + height - 4],
    [doorX + doorWidth + 16, y + height - 4],
    [doorX + doorWidth + 28, y + height + 12],
    [doorX - 28, y + height + 12],
  ], {
    fill: '#45403b',
    opacity: 0.82,
  }))
  parts.push(scatterDebris(x - 6, y + height - 2, width + 12, 32, 16))

  return parts.join('\n')
}

function createBuildings() {
  return [
    building({ x: 46, y: 58, width: 280, height: 154, litWindow: false, flipped: false }),
    building({ x: MAP_WIDTH - 332, y: 58, width: 286, height: 158, litWindow: true, flipped: true }),
    building({ x: 48, y: MAP_HEIGHT - 232, width: 284, height: 160, litWindow: true, flipped: true }),
    building({ x: MAP_WIDTH - 338, y: MAP_HEIGHT - 236, width: 290, height: 162, litWindow: false, flipped: false }),
  ].join('\n')
}

function crate(x, y, width, height, angle) {
  const cx = x + width / 2
  const cy = y + height / 2
  const parts = []

  parts.push(rect(x + 6, y + 6, width, height, {
    fill: '#000000',
    opacity: 0.18,
    rx: 6,
    transform: rotate(angle, cx + 6, cy + 6),
  }))
  parts.push(rect(x, y, width, height, {
    fill: 'url(#crate-fill)',
    stroke: '#151917',
    'stroke-width': 4,
    rx: 6,
    transform: rotate(angle, cx, cy),
  }))
  parts.push(line(x + 8, y + height * 0.32, x + width - 8, y + height * 0.32, {
    stroke: '#6e8562',
    'stroke-width': 3,
    opacity: 0.58,
    transform: rotate(angle, cx, cy),
  }))
  parts.push(line(x + width * 0.5, y + 6, x + width * 0.5, y + height - 6, {
    stroke: '#455a48',
    'stroke-width': 3,
    opacity: 0.7,
    transform: rotate(angle, cx, cy),
  }))
  parts.push(rect(x + width * 0.18, y + height * 0.16, width * 0.18, height * 0.12, {
    fill: '#c4aa56',
    opacity: 0.82,
    rx: 2,
    transform: rotate(angle, cx, cy),
  }))
  parts.push(rect(x + width * 0.54, y + height * 0.16, width * 0.16, height * 0.12, {
    fill: '#c4aa56',
    opacity: 0.76,
    rx: 2,
    transform: rotate(angle, cx, cy),
  }))

  return parts.join('\n')
}

function createCrates() {
  const crateSpecs = [
    [214, 230, 74, 48, -12],
    [418, 180, 70, 46, 9],
    [706, 262, 76, 48, -10],
    [940, 202, 74, 48, 8],
    [1162, 270, 76, 50, -11],
    [1452, 188, 78, 50, 10],
    [1688, 262, 80, 52, -12],
    [188, 480, 74, 48, 7],
    [514, 438, 76, 48, -8],
    [1318, 430, 72, 46, 11],
    [1626, 494, 78, 50, -9],
    [236, 732, 74, 48, -11],
    [612, 808, 80, 52, 8],
    [982, 770, 76, 48, -9],
    [1266, 808, 74, 48, 7],
    [1546, 726, 80, 52, -10],
    [262, 930, 80, 52, -8],
    [846, 928, 74, 48, 8],
    [1126, 930, 72, 46, -11],
    [1630, 926, 78, 50, 9],
  ]

  return crateSpecs
    .map(([x, y, width, height, angle]) => crate(x, y, width, height, angle))
    .join('\n')
}

function sandbagArc(cx, cy, rx, ry, startDeg, endDeg, count) {
  const parts = []

  for (let row = 0; row < 2; row += 1) {
    const offsetX = row === 0 ? -8 : 8
    const offsetY = row === 0 ? 6 : -6

    for (let index = 0; index < count; index += 1) {
      const progress = count === 1 ? 0.5 : index / (count - 1)
      const angle = ((startDeg + (endDeg - startDeg) * progress) * Math.PI) / 180
      const x = cx + Math.cos(angle) * rx + offsetX
      const y = cy + Math.sin(angle) * ry + offsetY
      const rotation = (angle * 180) / Math.PI + 90 + row * 4
      const bagWidth = row === 0 ? 42 : 44
      const bagHeight = row === 0 ? 18 : 20

      parts.push(ellipse(x + 6, y + 8, bagWidth * 0.54, bagHeight * 0.62, {
        fill: '#050505',
        opacity: 0.15,
        transform: rotate(rotation, x + 6, y + 8),
      }))
      parts.push(ellipse(x, y, bagWidth * 0.5, bagHeight * 0.5, {
        fill: pick(['#a88f73', '#c0a688', '#b59879']),
        stroke: '#4d3f31',
        'stroke-width': 2.5,
        opacity: row === 0 ? 0.9 : 1,
        transform: rotate(rotation, x, y),
      }))
      parts.push(line(x - bagWidth * 0.18, y, x + bagWidth * 0.18, y, {
        stroke: '#d6ba98',
        'stroke-width': 1.8,
        opacity: 0.65,
        transform: rotate(rotation, x, y),
      }))
    }
  }

  return parts.join('\n')
}

function createSandbags() {
  return [
    sandbagArc(CENTER_X, CENTER_Y, 180, 116, 208, 318, 7),
    sandbagArc(CENTER_X, CENTER_Y, 180, 116, 28, 138, 7),
    sandbagArc(CENTER_X, CENTER_Y, 180, 116, 122, 200, 6),
    sandbagArc(CENTER_X, CENTER_Y, 180, 116, 340, 418, 6),
  ].join('\n')
}

function createConcretePads() {
  return [
    rect(56, 44, 298, 176, { fill: '#292d31', opacity: 0.22, rx: 12 }),
    rect(MAP_WIDTH - 358, 44, 302, 178, { fill: '#292d31', opacity: 0.22, rx: 12 }),
    rect(56, MAP_HEIGHT - 244, 302, 186, { fill: '#292d31', opacity: 0.22, rx: 12 }),
    rect(MAP_WIDTH - 362, MAP_HEIGHT - 248, 306, 188, { fill: '#292d31', opacity: 0.22, rx: 12 }),
  ].join('\n')
}

function createLowLightWash() {
  return [
    rect(0, 0, MAP_WIDTH, MAP_HEIGHT, { fill: '#10171c', opacity: 0.08 }),
    rect(0, 0, MAP_WIDTH, MAP_HEIGHT, { fill: 'url(#night-wash)' }),
  ].join('\n')
}

function generateMapSvg() {
  const bloodMarks = [
    bloodCluster(CENTER_X - 128, CENTER_Y - 118, 0.7),
    bloodCluster(CENTER_X + 160, CENTER_Y + 126, 0.76),
    bloodCluster(284, 860, 0.66),
    bloodCluster(MAP_WIDTH - 274, 758, 0.6),
  ].join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}">
  <defs>
    <linearGradient id="ground-base" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d2421" />
      <stop offset="50%" stop-color="#342a27" />
      <stop offset="100%" stop-color="#241d1a" />
    </linearGradient>
    <linearGradient id="night-wash" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0a1116" stop-opacity="0.08" />
      <stop offset="50%" stop-color="#111920" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#091116" stop-opacity="0.08" />
    </linearGradient>
    <linearGradient id="roof-fill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#75706d" />
      <stop offset="100%" stop-color="#5d5855" />
    </linearGradient>
    <linearGradient id="crate-fill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#39483f" />
      <stop offset="100%" stop-color="#283429" />
    </linearGradient>
    <linearGradient id="window-glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f4ddaa" />
      <stop offset="100%" stop-color="#bf8843" />
    </linearGradient>
  </defs>
  <g id="ground">
    ${generateGroundTexture()}
    ${createLowLightWash()}
  </g>
  <g id="pads">
    ${createConcretePads()}
  </g>
  <g id="fence">
    ${createPerimeter()}
  </g>
  <g id="structures">
    ${createBuildings()}
  </g>
  <g id="props">
    ${createCrates()}
    ${createSandbags()}
    ${bloodMarks}
    ${scatterDebris(180, 110, MAP_WIDTH - 360, MAP_HEIGHT - 220, 120)}
  </g>
</svg>
`
}

function buildRenderPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>field-map-render</title>
    <style>
      html, body {
        margin: 0;
        width: ${MAP_WIDTH}px;
        height: ${MAP_HEIGHT}px;
        overflow: hidden;
        background: #241d1a;
      }

      body {
        display: grid;
        place-items: stretch;
      }

      img {
        display: block;
        width: ${MAP_WIDTH}px;
        height: ${MAP_HEIGHT}px;
      }
    </style>
  </head>
  <body>
    <img src="./field-map-source.svg" alt="" />
  </body>
</html>
`
}

function isUsablePng(filePath) {
  if (!fs.existsSync(filePath)) {
    return false
  }

  try {
    const report = execFileSync('identify', ['-format', '%r|%m|%wx%h', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    if (!report.includes('sRGB') || !report.endsWith(`|PNG|${MAP_WIDTH}x${MAP_HEIGHT}`)) {
      return false
    }

    const samples = execFileSync('convert', [
      filePath,
      '-format',
      '%[pixel:p{480,270}]|%[pixel:p{960,540}]|%[pixel:p{1440,810}]|%[pixel:p{760,580}]|%[pixel:p{1160,440}]',
      'info:',
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    const matches = [...samples.matchAll(/(?:rgb|srgb|rgba|srgba)\((\d+),(\d+),(\d+)/g)]
    if (matches.length === 0) {
      return false
    }

    const brightestSample = matches.reduce((maxChannel, match) => {
      const channel = Math.max(Number(match[1]), Number(match[2]), Number(match[3]))
      return Math.max(maxChannel, channel)
    }, 0)

    return brightestSample > 12
  } catch {
    return false
  }
}

function renderWithChrome() {
  fs.writeFileSync(renderPagePath, buildRenderPage(), 'utf8')

  const browsers = [
    process.env.CHROME_BIN,
    'google-chrome',
    'chromium-browser',
    'chromium',
  ].filter(Boolean)

  for (const browser of browsers) {
    try {
      execFileSync(browser, [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--allow-file-access-from-files',
        '--force-device-scale-factor=1',
        '--window-size=1920,1080',
        '--virtual-time-budget=1000',
        `--screenshot=${candidatePngPath}`,
        pathToFileURL(renderPagePath).href,
      ], {
        stdio: 'ignore',
      })

      if (isUsablePng(candidatePngPath)) {
        return browser
      }
    } catch {
      // Fall through and try the next available browser binary.
    }
  }

  return null
}

function renderWithConvert() {
  try {
    execFileSync('convert', [svgPath, `png32:${candidatePngPath}`], {
      stdio: 'ignore',
    })

    return isUsablePng(candidatePngPath) ? 'convert' : null
  } catch {
    return null
  }
}

function writeMap() {
  fs.mkdirSync(assetDir, { recursive: true })
  fs.writeFileSync(svgPath, generateMapSvg(), 'utf8')

  if (fs.existsSync(candidatePngPath)) {
    fs.unlinkSync(candidatePngPath)
  }

  let renderer = renderWithChrome()

  if (!renderer) {
    renderer = renderWithConvert()
  }

  let pngGenerated = false

  try {
    if (renderer && fs.existsSync(candidatePngPath)) {
      fs.renameSync(candidatePngPath, pngPath)
      pngGenerated = true
    } else if (fs.existsSync(candidatePngPath)) {
      fs.unlinkSync(candidatePngPath)
    }
  } finally {
    if (fs.existsSync(renderPagePath)) {
      fs.unlinkSync(renderPagePath)
    }
  }

  console.log(`[field-map] SVG: ${svgPath}`)
  console.log(`[field-map] PNG: ${pngPath}`)
  console.log(`[field-map] PNG generated: ${pngGenerated}`)
  console.log(`[field-map] Renderer: ${renderer ?? 'none'}`)

  if (!pngGenerated) {
    console.warn('[field-map] PNG export did not produce a valid color image. The SVG source is still available.')
  }
}

writeMap()
