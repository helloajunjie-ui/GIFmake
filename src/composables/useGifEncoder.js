import { ref } from 'vue'
import GIF from 'gif.js'

export function useGifEncoder() {
  const isProcessing = ref(false)
  const progress = ref(0)
  const gifBlob = ref(null)

  function encodeFromImages(images, settings) {
    isProcessing.value = true
    progress.value = 0
    gifBlob.value = null

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = settings.width
      canvas.height = settings.height
      const ctx = canvas.getContext('2d')

      const gif = new GIF({
        workers: 2,
        quality: settings.quality,
        width: settings.width,
        height: settings.height,
        workerScript: '/gif.worker.js'
      })

      gif.on('progress', (p) => {
        progress.value = Math.round(p * 100)
      })

      gif.on('finished', (blob) => {
        gifBlob.value = blob
        isProcessing.value = false
        progress.value = 100
        resolve(blob)
      })

      let loaded = 0
      images.forEach((img, i) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const imgRatio = img.width / img.height
        const canvasRatio = canvas.width / canvas.height
        let sx, sy, sw, sh
        if (imgRatio > canvasRatio) {
          sh = img.height
          sw = img.height * canvasRatio
          sx = (img.width - sw) / 2
          sy = 0
        } else {
          sw = img.width
          sh = img.width / canvasRatio
          sx = 0
          sy = (img.height - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
        gif.addFrame(ctx, {
          copy: true,
          delay: settings.delay
        })
        loaded++
        progress.value = Math.round((loaded / images.length) * 50)
      })

      gif.render()
    })
  }

  function encodeFromFrames(frameDataList, settings) {
    isProcessing.value = true
    progress.value = 0
    gifBlob.value = null

    return new Promise((resolve, reject) => {
      const gif = new GIF({
        workers: 2,
        quality: settings.quality,
        width: settings.width,
        height: settings.height,
        workerScript: '/gif.worker.js'
      })

      gif.on('progress', (p) => {
        progress.value = Math.round(p * 100)
      })

      gif.on('finished', (blob) => {
        gifBlob.value = blob
        isProcessing.value = false
        progress.value = 100
        resolve(blob)
      })

      frameDataList.forEach((data, i) => {
        gif.addFrame(data, {
          copy: true,
          delay: settings.delay
        })
        progress.value = Math.round(((i + 1) / frameDataList.length) * 50)
      })

      gif.render()
    })
  }

  function reset() {
    isProcessing.value = false
    progress.value = 0
    gifBlob.value = null
  }

  return {
    isProcessing,
    progress,
    gifBlob,
    encodeFromImages,
    encodeFromFrames,
    reset
  }
}
