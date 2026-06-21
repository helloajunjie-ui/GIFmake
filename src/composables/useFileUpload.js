import { ref } from 'vue'

export function useFileUpload(acceptTypes) {
  const files = ref([])
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      acceptTypes.includes(f.type)
    )
    if (droppedFiles.length) {
      files.value = [...files.value, ...droppedFiles]
    }
  }

  function onFileSelect(e) {
    const selected = Array.from(e.target.files).filter(f =>
      acceptTypes.includes(f.type)
    )
    if (selected.length) {
      files.value = [...files.value, ...selected]
    }
    e.target.value = ''
  }

  function removeFile(index) {
    files.value.splice(index, 1)
  }

  function clearFiles() {
    files.value = []
  }

  return {
    files,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    removeFile,
    clearFiles
  }
}
