export const DEFAULT_SETTINGS = {
  width: 0,
  height: 0,
  keepAspectRatio: true,
  delay: 100,
  loop: 0,
  quality: 10,
  fps: 10,
  startTime: 0,
  endTime: 3,
  targetSize: 0
}

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime', 'video/x-matroska']

export const ACCEPT_IMAGES = IMAGE_TYPES.join(',')
export const ACCEPT_VIDEOS = VIDEO_TYPES.join(',')
