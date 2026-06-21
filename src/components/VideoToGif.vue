<template>
  <div class="video-to-gif">
    <DropZone
      :accept="ACCEPT_VIDEOS"
      text="点击上传或拖拽视频到此处"
      hint="支持 MP4, WebM, AVI, MOV"
      @files="onFiles"
    />
    <div class="video-info" v-if="videoMeta">
      <div class="video-info__item">
        <span class="video-info__label">时长</span>
        <span>{{ formatDuration(videoMeta.duration) }}</span>
      </div>
      <div class="video-info__item">
        <span class="video-info__label">分辨率</span>
        <span>{{ videoMeta.width }} × {{ videoMeta.height }}</span>
      </div>
      <div class="video-info__item">
        <span class="video-info__label">文件名</span>
        <span>{{ videoName }}</span>
      </div>
      <button class="video-info__clear" @click="clearVideo">× 清除</button>
    </div>
    <div class="video-preview" v-if="videoUrl">
      <video ref="videoRef" :src="videoUrl" controls @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMeta"></video>
      <div class="video-timeline">
        <div class="video-timeline__label">截取段落</div>
        <div class="video-timeline__bar" ref="barRef" @click="seekBar">
          <div class="video-timeline__track">
            <div class="video-timeline__playhead" :style="{ left: playheadPct + '%' }"></div>
            <div class="video-timeline__range" :style="rangeStyle"></div>
            <div
              class="video-timeline__handle video-timeline__handle--start"
              :style="{ left: startPct + '%' }"
              @mousedown.prevent="startDrag('start', $event)"
              @touchstart.prevent="startDrag('start', $event)"
            ></div>
            <div
              class="video-timeline__handle video-timeline__handle--end"
              :style="{ left: endPct + '%' }"
              @mousedown.prevent="startDrag('end', $event)"
              @touchstart.prevent="startDrag('end', $event)"
            ></div>
          </div>
          <div class="video-timeline__labels">
            <span>{{ settings.startTime.toFixed(1) }}s</span>
            <span>{{ settings.endTime.toFixed(1) }}s</span>
          </div>
        </div>
      </div>
    </div>
    <GifSettings
      v-if="videoMeta"
      :settings="settings"
      showVideo
      @update="onSettingsUpdate"
    />
    <div class="actions" v-if="videoMeta">
      <div class="actions__load" v-if="!ffmpegLoaded && !ffmpegLoading">
        <button class="actions__btn actions__btn--secondary" @click="loadFfmpeg">
          加载 FFmpeg (首次需要)
        </button>
      </div>
      <div class="actions__load" v-if="ffmpegLoading">
        <span class="actions__hint">正在加载 FFmpeg...</span>
      </div>
      <div class="actions__load" v-if="loadError">
        <span class="actions__error">{{ loadError }}</span>
      </div>
      <button
        class="actions__btn"
        :disabled="isProcessing || !ffmpegLoaded"
        @click="generate"
      >
        <span v-if="isProcessing">处理中 {{ progress }}%</span>
        <span v-else>生成 GIF</span>
      </button>
    </div>
    <div class="progress-bar" v-if="isProcessing">
      <div class="progress-bar__fill" :style="{ width: progress + '%' }"></div>
    </div>
    <Preview :gifBlob="gifBlob" :settings="settings" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import DropZone from './DropZone.vue'
import GifSettings from './GifSettings.vue'
import Preview from './Preview.vue'
import { useGifEncoder } from '../composables/useGifEncoder.js'
import { useVideoDecoder } from '../composables/useVideoDecoder.js'
import { getVideoMeta, formatDuration } from '../utils/helpers.js'
import { DEFAULT_SETTINGS, ACCEPT_VIDEOS } from '../utils/constants.js'

const settings = reactive({ ...DEFAULT_SETTINGS })
const videoFile = ref(null)
const videoMeta = ref(null)
const videoName = ref('')
const videoUrl = ref('')
const videoRef = ref(null)
const barRef = ref(null)
const { isProcessing, progress, gifBlob, encodeFromFrames } = useGifEncoder()
const { isLoaded: ffmpegLoaded, isLoading: ffmpegLoading, loadError, load: loadFfmpeg, extractFrames } = useVideoDecoder()

const playheadPct = ref(0)

const startPct = computed(() => {
  if (!videoMeta.value) return 0
  return (settings.startTime / videoMeta.value.duration) * 100
})

const endPct = computed(() => {
  if (!videoMeta.value) return 100
  return (settings.endTime / videoMeta.value.duration) * 100
})

const rangeStyle = computed(() => {
  return { left: startPct.value + '%', width: (endPct.value - startPct.value) + '%' }
})

let dragging = null

function onFiles(files) {
  const file = files[0]
  if (!file || !ACCEPT_VIDEOS.split(',').includes(file.type)) return
  videoFile.value = file
  videoName.value = file.name
  videoUrl.value = URL.createObjectURL(file)
  getVideoMeta(file).then(meta => {
    videoMeta.value = meta
    settings.width = meta.width
    settings.height = meta.height
    settings.endTime = Math.min(settings.endTime, meta.duration)
  })
}

function clearVideo() {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoFile.value = null
  videoMeta.value = null
  videoName.value = ''
  videoUrl.value = ''
}

function onLoadedMeta() {
  if (videoRef.value) {
    videoRef.value.currentTime = settings.startTime
  }
}

function onTimeUpdate() {
  if (!videoRef.value || !videoMeta.value) return
  playheadPct.value = (videoRef.value.currentTime / videoMeta.value.duration) * 100
}

function getClientX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX
}

function startDrag(type, e) {
  dragging = type
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  e.preventDefault()
  if (!barRef.value || !videoMeta.value) return
  const rect = barRef.value.getBoundingClientRect()
  const clientX = getClientX(e)
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const time = pct * videoMeta.value.duration

  if (dragging === 'start') {
    const newStart = Math.max(0, Math.min(time, settings.endTime - 0.5))
    settings.startTime = Math.round(newStart * 10) / 10
    if (videoRef.value) videoRef.value.currentTime = settings.startTime
  } else if (dragging === 'end') {
    const newEnd = Math.min(videoMeta.value.duration, Math.max(time, settings.startTime + 0.5))
    settings.endTime = Math.round(newEnd * 10) / 10
  }
}

function stopDrag() {
  dragging = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function seekBar(e) {
  if (!barRef.value || !videoMeta.value) return
  const rect = barRef.value.getBoundingClientRect()
  const clientX = getClientX(e)
  const pct = (clientX - rect.left) / rect.width
  const time = pct * videoMeta.value.duration
  if (videoRef.value) videoRef.value.currentTime = time
}

function onSettingsUpdate(s) {
  Object.assign(settings, s)
}

async function generate() {
  if (!videoFile.value) return
  const frameDataList = await extractFrames(videoFile.value, { ...settings }, (p) => {
    progress.value = p
  })
  if (frameDataList.length) {
    await encodeFromFrames(frameDataList, { ...settings })
  }
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.video-to-gif {
  min-width: 0;
}

.video-info {
  margin-top: 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 14px 16px;
}

.video-info__item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.85rem;
}

.video-info__label {
  color: var(--text-muted);
}

.video-info__clear {
  margin-top: 8px;
  background: none;
  color: var(--danger);
  font-size: 0.85rem;
  padding: 4px 0;
}

.video-preview {
  margin-top: 16px;
}

.video-preview video {
  width: 100%;
  border-radius: var(--radius);
  background: #000;
  max-height: 300px;
}

.video-timeline {
  margin-top: 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 14px 16px;
}

.video-timeline__label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.video-timeline__bar {
  cursor: pointer;
}

.video-timeline__track {
  height: 32px;
  background: var(--bg-secondary);
  border-radius: 4px;
  position: relative;
}

.video-timeline__playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #fff;
  z-index: 3;
  pointer-events: none;
  transition: left 0.1s linear;
  box-shadow: 0 0 4px rgba(255,255,255,0.5);
}

.video-timeline__range {
  position: absolute;
  top: 0;
  height: 100%;
  background: var(--accent-light);
  border: 2px solid var(--accent);
  border-radius: 4px;
  pointer-events: none;
}

.video-timeline__handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border: 3px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: ew-resize;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.video-timeline__handle:hover {
  background: var(--accent-hover);
}

.video-timeline__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.actions {
  margin-top: 16px;
  text-align: center;
}

.actions__load {
  margin-bottom: 10px;
}

.actions__btn {
  padding: 12px 40px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  transition: background var(--transition);
  width: 100%;
}

.actions__btn--secondary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.actions__btn--secondary:hover {
  border-color: var(--accent);
}

.actions__btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.actions__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.actions__hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.actions__error {
  font-size: 0.85rem;
  color: var(--danger);
}

.progress-bar {
  margin-top: 12px;
  height: 4px;
  background: var(--bg-card);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
  border-radius: 2px;
}
</style>
