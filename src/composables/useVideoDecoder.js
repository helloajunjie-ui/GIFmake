import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export function useVideoDecoder() {
  const ffmpeg = new FFmpeg()
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const loadError = ref('')

  async function load() {
    if (isLoaded.value) return
    isLoading.value = true
    loadError.value = ''

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      })
      isLoaded.value = true
    } catch (e) {
      loadError.value = 'FFmpeg 加载失败: ' + e.message
    } finally {
      isLoading.value = false
    }
  }

  async function extractFrames(file, settings, onProgress) {
    await load()
    if (!isLoaded.value) return []

    const inputName = 'input' + getExtension(file.name)
    const outputPattern = 'frame_%04d.png'

    await ffmpeg.writeFile(inputName, await fetchFile(file))

    const fps = settings.fps
    const startTime = settings.startTime
    const endTime = settings.endTime
    const duration = endTime - startTime
    const width = settings.width
    const height = settings.height

    const args = [
      '-ss', String(startTime),
      '-i', inputName,
      '-t', String(duration),
      '-vf', `fps=${fps},scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      '-frames:v', String(fps * duration),
      outputPattern,
      '-y'
    ]

    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) onProgress(Math.round(progress * 100))
    })

    await ffmpeg.exec(args)

    const totalFrames = Math.ceil(fps * duration)
    const frameFiles = []
    for (let i = 0; i < totalFrames; i++) {
      const name = `frame_${String(i + 1).padStart(4, '0')}.png`
      try {
        const data = await ffmpeg.readFile(name)
        frameFiles.push(data)
      } catch {
        break
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = settings.width
    canvas.height = settings.height
    const ctx = canvas.getContext('2d')

    const frameDataList = []
    for (let i = 0; i < frameFiles.length; i++) {
      const blob = new Blob([frameFiles[i]], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      const img = await new Promise((resolve) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.src = url
      })
      URL.revokeObjectURL(url)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      frameDataList.push(ctx.getImageData(0, 0, canvas.width, canvas.height))

      if (onProgress) {
        const p = 50 + Math.round(((i + 1) / frameFiles.length) * 50)
        onProgress(p)
      }
    }

    return frameDataList
  }

  return {
    isLoaded,
    isLoading,
    loadError,
    load,
    extractFrames
  }
}

function getExtension(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return '.' + ext
}
