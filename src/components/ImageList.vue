<template>
  <div class="image-list" v-if="images.length">
    <div class="image-list__header">
      <span>{{ images.length }} 张图片</span>
      <button class="image-list__clear" @click="$emit('clear')">清空</button>
    </div>
    <div class="image-list__grid">
      <div
        v-for="(img, i) in images"
        :key="img.name + i"
        class="image-list__item"
        :class="{ 'image-list__item--dragging': dragIndex === i }"
        draggable="true"
        @dragstart="onDragStart(i)"
        @dragover.prevent="onDragOver(i)"
        @dragend="onDragEnd"
      >
        <img :src="img.url" :alt="img.name" />
        <div class="image-list__info">
          <span class="image-list__name">{{ img.name }}</span>
          <span class="image-list__size">{{ img.size }}</span>
        </div>
        <button class="image-list__remove" @click="$emit('remove', i)">×</button>
        <span class="image-list__index">{{ i + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  images: { type: Array, default: () => [] }
})

const emit = defineEmits(['remove', 'clear', 'reorder'])
const dragIndex = ref(null)

function onDragStart(i) {
  dragIndex.value = i
}

function onDragOver(i) {
  if (dragIndex.value === null || dragIndex.value === i) return
  emit('reorder', dragIndex.value, i)
  dragIndex.value = i
}

function onDragEnd() {
  dragIndex.value = null
}
</script>

<style scoped>
.image-list {
  margin-top: 16px;
}

.image-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.image-list__clear {
  background: none;
  color: var(--danger);
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.image-list__clear:hover {
  background: rgba(225, 112, 85, 0.15);
}

.image-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.image-list__item {
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: grab;
  border: 2px solid transparent;
  transition: border-color var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.image-list__item--dragging {
  opacity: 0.5;
  border-color: var(--accent);
}

.image-list__item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.image-list__info {
  padding: 6px 8px;
}

.image-list__name {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-list__size {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.image-list__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 16px;
  line-height: 26px;
  text-align: center;
  display: block;
}

.image-list__index {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 0.75rem;
  line-height: 22px;
  text-align: center;
  font-weight: 600;
}

@media (max-width: 480px) {
  .image-list__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
  .image-list__item img {
    height: 80px;
  }
}
</style>
