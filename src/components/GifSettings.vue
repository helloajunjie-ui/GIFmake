<template>
  <div class="settings">
    <h3 class="settings__title">参数设置</h3>
    <div class="settings__grid">
      <div class="settings__field">
        <label>宽度</label>
        <input type="number" :value="settings.width || ''" @input="update('width', Number($event.target.value))" min="50" max="4096" placeholder="自动" />
      </div>
      <div class="settings__field">
        <label>高度</label>
        <input type="number" :value="settings.height || ''" @input="update('height', Number($event.target.value))" min="50" max="4096" placeholder="自动" />
      </div>
    </div>
    <label class="settings__checkbox">
      <input type="checkbox" :checked="settings.keepAspectRatio" @change="update('keepAspectRatio', $event.target.checked)" />
      <span>保持宽高比</span>
    </label>
    <div class="settings__grid">
      <div class="settings__field">
        <label>帧延迟 (ms)</label>
        <input type="number" :value="settings.delay" @input="update('delay', Number($event.target.value))" min="10" max="5000" step="10" />
      </div>
      <div class="settings__field">
        <label>循环次数 (0=无限)</label>
        <input type="number" :value="settings.loop" @input="update('loop', Number($event.target.value))" min="0" max="100" />
      </div>
    </div>
    <div class="settings__field">
      <label>质量 (1=最佳, 20=最差)</label>
      <div class="settings__range">
        <input type="range" :value="settings.quality" @input="update('quality', Number($event.target.value))" min="1" max="20" />
        <span>{{ settings.quality }}</span>
      </div>
    </div>
    <div class="settings__field">
      <label>目标文件大小 (KB, 0=不限制)</label>
      <input type="number" :value="settings.targetSize" @input="update('targetSize', Number($event.target.value))" min="0" max="102400" step="100" />
    </div>
    <template v-if="showVideo">
      <div class="settings__divider"></div>
      <div class="settings__grid">
        <div class="settings__field">
          <label>FPS</label>
          <input type="number" :value="settings.fps" @input="update('fps', Number($event.target.value))" min="1" max="30" />
        </div>
        <div class="settings__field">
          <label>起始时间 (秒)</label>
          <input type="number" :value="settings.startTime" @input="update('startTime', Number($event.target.value))" min="0" step="0.5" />
        </div>
      </div>
      <div class="settings__field">
        <label>结束时间 (秒)</label>
        <input type="number" :value="settings.endTime" @input="update('endTime', Number($event.target.value))" min="0.5" step="0.5" />
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  settings: { type: Object, required: true },
  showVideo: { type: Boolean, default: false }
})

const emit = defineEmits(['update'])

function update(key, value) {
  emit('update', { ...props.settings, [key]: value })
}
</script>

<style scoped>
.settings {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  margin-top: 16px;
}

.settings__title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--text-primary);
}

.settings__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.settings__field {
  margin-bottom: 10px;
}

.settings__field label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.settings__field input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  transition: border-color var(--transition);
}

.settings__field input[type="number"]:focus {
  border-color: var(--accent);
}

.settings__field input[type="number"]::placeholder {
  color: var(--text-muted);
}

.settings__range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings__range input[type="range"] {
  flex: 1;
  accent-color: var(--accent);
}

.settings__range span {
  min-width: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.settings__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  cursor: pointer;
}

.settings__checkbox input {
  accent-color: var(--accent);
}

.settings__divider {
  height: 1px;
  background: var(--border-color);
  margin: 14px 0;
}

@media (max-width: 480px) {
  .settings {
    padding: 12px;
  }
  .settings__grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .settings__field input[type="number"] {
    padding: 10px 10px;
    font-size: 16px;
  }
}
</style>
