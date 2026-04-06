export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function formatScore(value) {
  return String(value).padStart(4, '0')
}

export function normalizeVector(x, y) {
  const length = Math.hypot(x, y)

  if (!length) {
    return { x: 0, y: 0 }
  }

  return {
    x: x / length,
    y: y / length,
  }
}

export function blendValue(current, target, blend) {
  return current + (target - current) * blend
}

export function formatDuration(durationMs = 0) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
