import { zip, ZipInputFile } from 'fflate'

async function fetchImageAsUint8Array(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

export async function downloadImagesAsZip(imageUrls: string[], zipFilename = 'ai-images.zip'): Promise<void> {
  const files: Record<string, ZipInputFile> = {}
  
  const promises = imageUrls.map(async (url, index) => {
    try {
      const data = await fetchImageAsUint8Array(url)
      const filename = `image-${index + 1}-${Date.now()}.png`
      files[filename] = [data, { level: 0 }]
    } catch (e) {
      console.error(`Failed to process image ${index + 1}:`, e)
    }
  })
  
  await Promise.all(promises)
  
  if (Object.keys(files).length === 0) {
    throw new Error('No valid images to download')
  }
  
  zip(files, (err, data) => {
    if (err) throw err
    
    const blob = new Blob([data], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = zipFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

export function downloadSingleImage(imageUrl: string, filename = 'ai-image.png'): void {
  const a = document.createElement('a')
  a.href = imageUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
