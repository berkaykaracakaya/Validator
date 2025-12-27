<template>
  <header class="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 px-8 py-4 mb-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-dark-primary">
          {{ title }}
        </h1>
        <div v-if="projectName" class="flex items-center gap-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">Project:</span>
          <span class="font-medium text-gray-900 dark:text-dark-primary">{{ projectName }}</span>
        </div>
      </div>
      <slot name="breadcrumb"></slot>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    default: null
  }
})
</script>
