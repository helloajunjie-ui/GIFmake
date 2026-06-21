<template>
  <div class="app">
    <Header :mode="mode" @update:mode="mode = $event" />
    <main class="main">
      <ImageToGif v-if="mode === 'image'" />
      <VideoToGif v-else />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import ImageToGif from './components/ImageToGif.vue'
import VideoToGif from './components/VideoToGif.vue'

const mode = ref('image')
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px 40px;
}
</style>
