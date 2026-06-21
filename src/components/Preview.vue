<template>
  <div class="preview">
    <h3 class="preview__title">预览</h3>
    <div class="preview__container" v-if="gifBlob">
      <img :src="previewUrl" alt="GIF 预览" class="preview__image" />
    </div>
    <div class="preview__placeholder" v-else>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>生成 GIF 后将在此处预览</span>
    </div>
    <div class="preview__info" v-if="gifBlob">
      <div class="preview__stat">
        <span class="preview__label">文件大小</span>
        <span class="preview__value">{{ fileSize }}</span>
      </div>
      <div class="preview__stat">
        <span class="preview__label">尺寸</span>
        <span class="preview__value">{{ settings.width }} × {{ settings.height }}</span>
      </div>
      <div class="preview__stat">
        <span class="preview__label">帧延迟</span>
        <span class="preview__value">{{ settings.delay }}ms</span>
      </div>
      <div class="preview__stat">
        <span class="preview__label">循环</span>
        <span class="preview__value">{{ settings.loop === 0 ? '无限' : settings.loop + '次' }}</span>
      </div>
    </div>
    <div class="preview__actions" v-if="gifBlob">
      <button class="preview__btn preview__btn--primary" @click="download">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        下载
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatFileSize } from '../utils/helpers.js'

const props = defineProps({
  gifBlob: { type: Blob, default: null },
  settings: { type: Object, required: true }
})

const previewUrl = computed(() => {
  if (!props.gifBlob) return ''
  return URL.createObjectURL(props.gifBlob)
})

const fileSize = computed(() => {
  if (!props.gifBlob) return ''
  return formatFileSize(props.gifBlob.size)
})

function download() {
  if (!props.gifBlob) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(props.gifBlob)
  a.download = 'output.gif'
  a.click()
}
</script>

<style scoped>
.preview {
  margin-top: 20px;
}

.preview__title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.preview__container {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  justify-content: center;
}

.preview__image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-sm);
}

.preview__placeholder {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.preview__info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.preview__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview__label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.preview__value {
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
}

.preview__actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.preview__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  transition: background var(--transition);
}

.preview__btn--primary {
  background: var(--accent);
  color: #fff;
}

.preview__btn--primary:hover {
  background: var(--accent-hover);
}

.preview__btn--secondary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.preview__btn--secondary:hover {
  border-color: var(--accent);
}

@media (max-width: 480px) {
  .preview {
    margin-top: 16px;
  }
  .preview__container {
    padding: 10px;
  }
  .preview__image {
    max-height: 250px;
  }
  .preview__btn {
    width: 100%;
    justify-content: center;
    padding: 12px 24px;
  }
}
</style>
