<template>
  <span :class="statusClass">
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useTestStore } from '@/stores/testStore'

const props = defineProps({
  endpointId: {
    type: String,
    required: true
  }
})

const testStore = useTestStore()

const stats = computed(() => testStore.getEndpointStats(props.endpointId))

const statusText = computed(() => {
  if (stats.value.total === 0) return 'Not tested'
  if (stats.value.failed === 0) return `✅ All passed (${stats.value.passed})`
  return `⚠️ ${stats.value.failed} issues`
})

const statusClass = computed(() => {
  if (stats.value.total === 0) return 'text-gray-500'
  if (stats.value.failed === 0) return 'text-success-600'
  return 'text-error-600'
})
</script>
