<template>
  <nav class="flex items-center gap-2 text-sm mb-4">
    <router-link 
      v-for="(item, index) in items" 
      :key="index"
      :to="item.to || '#'"
      class="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      :class="{
        'text-gray-500 dark:text-gray-400': item.to,
        'text-gray-900 dark:text-dark-primary font-medium': !item.to,
        'pointer-events-none': !item.to
      }"
    >
      <span>{{ item.label }}</span>
      <span v-if="index < items.length - 1" class="text-gray-400">/</span>
    </router-link>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // Each item: { label: String, to: String (optional) }
  }
})
</script>
