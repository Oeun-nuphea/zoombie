function isColorMatch(red, green, blue, target, tolerance) {
  return (
    Math.abs(red - target.r) <= tolerance &&
    Math.abs(green - target.g) <= tolerance &&
    Math.abs(blue - target.b) <= tolerance
  )
}

export function createTransparentSpriteSource(image, options = {}) {
  if (!image) {
    return null
  }

  const { transparentColor = null, transparentTolerance = 0 } = options
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height

  if (!width || !height) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.clearRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  if (!transparentColor) {
    return canvas
  }

  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let index = 0; index < data.length; index += 4) {
    if (isColorMatch(data[index], data[index + 1], data[index + 2], transparentColor, transparentTolerance)) {
      data[index + 3] = 0
    }
  }

  context.putImageData(imageData, 0, 0)
  return canvas
}

export function loadSpriteImage(src, options = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const prepared = createTransparentSpriteSource(image, options)

      if (!prepared) {
        reject(new Error(`Failed to prepare sprite image: ${src}`))
        return
      }

      resolve(prepared)
    }
    image.onerror = () => reject(new Error(`Failed to load sprite image: ${src}`))
    image.src = src
  })
}
