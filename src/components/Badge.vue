<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info' // success, error, warning, info
  }
})

const badgeClasses = computed(() => {
  const base = 'badge'
  
  const variants = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info'
  }
  
  return `${base} ${variants[props.variant]}`
})
</script>
