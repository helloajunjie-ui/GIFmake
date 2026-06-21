<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <h1 class="header__title">GIF 工具</h1>
      </div>
      <div class="header__tabs">
        <button
          class="header__tab"
          :class="{ 'header__tab--active': mode === 'image' }"
          @click="$emit('update:mode', 'image')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          图片合成
        </button>
        <button
          class="header__tab"
          :class="{ 'header__tab--active': mode === 'video' }"
          @click="$emit('update:mode', 'video')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          视频转 GIF
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  mode: { type: String, default: 'image' }
})

defineEmits(['update:mode'])
</script>

<style scoped>
.header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header__title {
  font-size: 1.15rem;
  font-weight: 700;
}

.header__tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.header__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: none;
  transition: all var(--transition);
  white-space: nowrap;
}

.header__tab--active {
  background: var(--accent);
  color: #fff;
}

.header__tab:not(.header__tab--active):hover {
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .header__inner {
    padding: 0 10px;
    height: 48px;
  }
  .header__title {
    font-size: 1rem;
  }
  .header__tab {
    padding: 5px 10px;
    font-size: 0.8rem;
    gap: 4px;
  }
  .header__tab svg {
    width: 14px;
    height: 14px;
  }
}
</style>
