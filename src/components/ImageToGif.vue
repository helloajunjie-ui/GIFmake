<template>
  <div class="image-to-gif">
    <DropZone
      :accept="ACCEPT_IMAGES"
      multiple
      text="点击上传或拖拽图片到此处"
      hint="支持 PNG, JPG, WebP, GIF"
      @files="onFiles"
    />
    <ImageList
      :images="imageItems"
      @remove="removeImage"
      @clear="clearImages"
      @reorder="reorderImages"
    />
    <GifSettings
      v-if="imageItems.length"
      :settings="settings"
      @update="onSettingsUpdate"
    />
    <div class="actions" v-if="imageItems.length">
      <button
        class="actions__btn"
        :disabled="isProcessing"
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
import { ref, reactive } from 'vue'
import DropZone from './DropZone.vue'
import ImageList from './ImageList.vue'
import GifSettings from './GifSettings.vue'
import Preview from './Preview.vue'
import { useGifEncoder } from '../composables/useGifEncoder.js'
import { loadImage, formatFileSize } from '../utils/helpers.js'
import { DEFAULT_SETTINGS, ACCEPT_IMAGES } from '../utils/constants.js'

const settings = reactive({ ...DEFAULT_SETTINGS })
const imageItems = ref([])
const { isProcessing, progress, gifBlob, encodeFromImages } = useGifEncoder()

async function onFiles(files) {
  for (const file of files) {
    if (!ACCEPT_IMAGES.split(',').includes(file.type)) continue
    const url = URL.createObjectURL(file)
    imageItems.value.push({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      url
    })
  }
  if (imageItems.value.length && (!settings.width || !settings.height)) {
    const first = await loadImage(imageItems.value[0].file)
    settings.width = first.width
    settings.height = first.height
  }
}

function removeImage(i) {
  URL.revokeObjectURL(imageItems.value[i].url)
  imageItems.value.splice(i, 1)
}

function clearImages() {
  imageItems.value.forEach(item => URL.revokeObjectURL(item.url))
  imageItems.value = []
}

function reorderImages(from, to) {
  const item = imageItems.value.splice(from, 1)[0]
  imageItems.value.splice(to, 0, item)
}

function onSettingsUpdate(s) {
  Object.assign(settings, s)
}

async function generate() {
  const loadedImages = []
  for (const item of imageItems.value) {
    const img = await loadImage(item.file)
    loadedImages.push(img)
  }
  await encodeFromImages(loadedImages, { ...settings })
}
</script>

<style scoped>
.image-to-gif {
  min-width: 0;
}

.actions {
  margin-top: 16px;
  text-align: center;
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

.actions__btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.actions__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
