<template>
  <div class="spinner-container" :class="sizeClass">
    <div class="spinner-circle"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  return sizes[props.size]
})
</script>

<style scoped>
.spinner-container {
  @apply inline-block;
}

.spinner-circle {
  @apply w-full h-full border-4 border-gray-200 dark:border-slate-600 border-t-primary-600 rounded-full;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
