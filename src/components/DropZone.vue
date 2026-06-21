<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--active': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="inputRef.click()"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      hidden
      @change="onFileSelect"
    />
    <div class="dropzone__icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    </div>
    <p class="dropzone__text">{{ text }}</p>
    <p class="dropzone__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  text: { type: String, default: '点击上传或拖拽文件到此处' },
  hint: { type: String, default: '' }
})

const emit = defineEmits(['files'])
const inputRef = ref(null)
const isDragOver = ref(false)

function onDragOver(e) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave(e) {
  e.preventDefault()
  isDragOver.value = false
}

function onDrop(e) {
  e.preventDefault()
  isDragOver.value = false
  emit('files', Array.from(e.dataTransfer.files))
}

function onFileSelect(e) {
  emit('files', Array.from(e.target.files))
  e.target.value = ''
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition);
  background: var(--bg-card);
  -webkit-tap-highlight-color: transparent;
}

.dropzone:hover,
.dropzone--active {
  border-color: var(--accent);
  background: var(--accent-light);
}

.dropzone__icon {
  color: var(--text-muted);
  margin-bottom: 12px;
  transition: color var(--transition);
}

.dropzone:hover .dropzone__icon,
.dropzone--active .dropzone__icon {
  color: var(--accent);
}

.dropzone__text {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.dropzone__hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .dropzone {
    padding: 24px 16px;
  }
  .dropzone__icon svg {
    width: 36px;
    height: 36px;
  }
  .dropzone__text {
    font-size: 0.9rem;
  }
}
</style>
