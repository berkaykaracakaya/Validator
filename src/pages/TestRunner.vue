<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-primary">
    <PageHeader 
      title="Test Runner" 
      :project-name="swaggerStore.currentProject?.name"
    >
      <template #breadcrumb>
        <Breadcrumb :items="breadcrumbItems" />
      </template>
    </PageHeader>

    <div class="max-w-4xl mx-auto px-8 pb-8">
      <!-- Endpoint Info -->
      <div class="card mb-6">
        <div class="flex items-center gap-3">
          <Badge :variant="getMethodColor(endpoint?.method)">
            {{ endpoint?.method }}
          </Badge>
          <code class="text-lg">{{ endpoint?.path }}</code>
        </div>
      </div>

      <!-- Progress -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Progress</h2>
          <span class="text-sm text-gray-600">
            {{ testStore.progress.current }} / {{ testStore.progress.total }}
          </span>
        </div>
        
        <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-4">
          <div
            class="bg-primary-600 h-4 rounded-full transition-all duration-300"
            :style="{ width: `${testStore.progressPercentage}%` }"
          ></div>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-dark-secondary">
          {{ testStore.progressPercentage }}% complete
        </p>
      </div>

      <!-- Controls -->
      <div class="card mb-6 flex justify-center gap-3">
        <Button v-if="!testStore.isRunning" variant="primary" @click="startTests">
          ▶️ Start
        </Button>
        <Button v-if="testStore.isRunning && !testStore.isPaused" variant="warning" @click="pauseTests">
          ⏸️ Pause
        </Button>
        <Button v-if="testStore.isPaused" variant="success" @click="resumeTests">
          ▶️ Resume
        </Button>
        <Button v-if="testStore.isRunning" variant="error" @click="stopTests">
          ⏹️ Stop
        </Button>
      </div>

      <!-- Current Test -->
      <div v-if="testStore.progress.currentTest" class="card mb-6">
        <h3 class="text-sm font-semibold mb-2">⏳ Running:</h3>
        <p class="text-sm text-gray-600 dark:text-dark-secondary">
          {{ testStore.progress.currentTest.validationType }} - {{ testStore.progress.currentTest.parameter.name }}
        </p>
      </div>

      <!-- Results (Live) -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">
          📊 Results ({{ results.length }})
        </h2>
        
        <div v-if="results.length === 0" class="text-center py-8 text-gray-500">
          No results yet. Click Start to begin testing.
        </div>
        
        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="result in results"
            :key="result.id"
            class="flex items-start gap-3 p-3 rounded"
            :class="{
              'bg-success-50 dark:bg-success-900/20': result.passed === true,
              'bg-error-50 dark:bg-error-900/20': result.passed === false,
              'bg-gray-50 dark:bg-slate-700': result.passed === null
            }"
          >
            <span class="text-xl">
              {{ result.passed === true ? '✅' : result.passed === false ? '❌' : '⚠️' }}
            </span>
            <div class="flex-1 text-sm">
              <div class="font-medium">
                {{ result.parameterName }} - {{ result.validationName }}
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                Test value: <code>{{ formatTestValue(result.testValue) }}</code>
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ result.message }}
              </div>
            </div>
            <span class="text-xs text-gray-500">
              {{ formatDuration(result.timestamp) }}
            </span>
          </div>
        </div>
      </div>

      <!-- View Results Button -->
      <div v-if="!testStore.isRunning && results.length > 0" class="mt-6 text-center">
        <Button variant="primary" size="lg" @click="viewResults">
          View Detailed Results →
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSwaggerStore } from '@/stores/swaggerStore'
import { useValidationStore } from '@/stores/validationStore'
import { useTestStore } from '@/stores/testStore'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'
import PageHeader from '@/components/PageHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const swaggerStore = useSwaggerStore()
const validationStore = useValidationStore()
const testStore = useTestStore()

const interval = ref(null)

const endpoint = computed(() => swaggerStore.getEndpointById(route.params.id))
const results = computed(() => testStore.getEndpointResults(route.params.id))

const breadcrumbItems = computed(() => [
  { label: 'Dashboard', to:'/' },
  { label: swaggerStore.currentProject?.name || 'Project', to: `/project/${swaggerStore.currentProject?.id}/endpoints` },
  { label: 'Configure', to: `/endpoint/${route.params.id}/configure` },
  { label: 'Test', to: null }
])

const getMethodColor = (method) => {
  const colors = {
    GET: 'success',
    POST: 'info',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'error'
  }
  return colors[method] || 'info'
}

const startTests = async () => {
  const validations = {}
  const endpointValidations = validationStore.selectedValidations[route.params.id]
  
  Object.entries(endpointValidations || {}).forEach(([type, config]) => {
    if (config.enabled) {
      validations[type] = config
    }
  })
  
  await testStore.runTests(endpoint.value, validations, route.query.baseUrl)
}

const pauseTests = () => {
  testStore.pauseTests()
}

const resumeTests = () => {
  testStore.resumeTests()
}

const stopTests = () => {
  testStore.stopTests()
}

const viewResults = () => {
  router.push({
    path: `/endpoint/${route.params.id}/results`,
    query: { baseUrl: route.query.baseUrl }
  })
}

const formatTestValue = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return JSON.stringify(value)
}

const formatDuration = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  return date.toLocaleTimeString()
}

onMounted(async () => {
  // Auto-start tests
  if (!testStore.isRunning && results.value.length === 0) {
    await startTests()
  }
  
  // Poll for updates
  interval.value = setInterval(() => {
    // Force reactivity update
  }, 100)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>
