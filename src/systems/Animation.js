export class Animation {
  constructor({ clips, initial, spriteSheet }) {
    if (!clips || Object.keys(clips).length === 0) {
      throw new Error('Animation requires at least one clip.')
    }

    if (!clips[initial]) {
      throw new Error(`Unknown initial animation clip: ${initial}`)
    }

    this.clips = clips
    this.spriteSheet = spriteSheet
    this.currentKey = initial
    this.currentFrameIndex = 0
    this.accumulatorMs = 0
    this.completed = false
    this.finishedKey = null
  }

  get currentClip() {
    return this.clips[this.currentKey]
  }

  get isComplete() {
    return this.completed
  }

  play(nextKey, { force = false } = {}) {
    const nextClip = this.clips[nextKey]

    if (!nextClip) {
      throw new Error(`Unknown animation clip: ${nextKey}`)
    }

    const isSameClip = nextKey === this.currentKey

    if (!force && isSameClip) {
      if (nextClip.loop) {
        return false
      }

      if (!this.completed) {
        return false
      }
    }

    this.currentKey = nextKey
    this.currentFrameIndex = 0
    this.accumulatorMs = 0
    this.completed = false
    this.finishedKey = null

    return true
  }

  update(deltaMs) {
    const clip = this.currentClip

    if (!clip || clip.frames.length <= 1 || clip.fps <= 0) {
      return
    }

    if (!clip.loop && this.completed) {
      return
    }

    const frameDurationMs = 1000 / clip.fps
    this.accumulatorMs += deltaMs

    while (this.accumulatorMs >= frameDurationMs) {
      this.accumulatorMs -= frameDurationMs

      if (this.currentFrameIndex < clip.frames.length - 1) {
        this.currentFrameIndex += 1
        continue
      }

      if (clip.loop) {
        this.currentFrameIndex = 0
        continue
      }

      this.currentFrameIndex = clip.frames.length - 1
      this.completed = true
      this.finishedKey = this.currentKey
      this.accumulatorMs = 0
      break
    }
  }

  getCurrentFrameNumber() {
    return this.currentClip.frames[this.currentFrameIndex]
  }

  getCurrentFrameRect() {
    const frame = this.getCurrentFrameNumber()
    const columns = this.spriteSheet.columns
    const { frameWidth, frameHeight } = this.spriteSheet

    return {
      sx: (frame % columns) * frameWidth,
      sy: Math.floor(frame / columns) * frameHeight,
      sw: frameWidth,
      sh: frameHeight,
    }
  }

  consumeFinished(targetKey) {
    if (!this.finishedKey) {
      return false
    }

    if (targetKey && this.finishedKey !== targetKey) {
      return false
    }

    this.finishedKey = null
    return true
  }
}
