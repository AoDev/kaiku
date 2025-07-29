export function createBlobFromImageUrl(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Could not get canvas context')
        return resolve(null)
      }
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        0.9
      ) // Adjust type and quality as needed
    }

    img.onerror = (err) => {
      console.error('Failed to load image for blob conversion:', url, err)
      resolve(null)
    }

    img.src = url
  })
}
