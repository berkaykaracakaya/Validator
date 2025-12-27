<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-primary p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-primary mb-2">
          🔍 Swagger API Validator
        </h1>
        <p class="text-gray-600 dark:text-dark-secondary">
          Test API endpoint validations and find security vulnerabilities
        </p>
      </div>

      <!-- Import Form -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold mb-4">🚀 Start New Project</h2>
        <form @submit.prevent="importSwagger" class="flex gap-3">
          <input
            v-model="swaggerUrl"
            type="url"
            class="input flex-1"
            placeholder="Enter Swagger/OpenAPI URL (e.g., http://localhost:4000/api-docs-json)"
            required
          />
          <Button type="submit" :loading="loading" variant="primary">
            Import
          </Button>
        </form>
        
        <p v-if="error" class="mt-3 text-sm text-error-600 dark:text-error-400">
          ❌ {{ error }}
        </p>
      </div>

      <!-- Recent Projects -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">📊 Recent Projects</h2>
        
        <div v-if="projects.length === 0" class="card text-center text-gray-500 dark:text-dark-secondary">
          No projects yet. Import a Swagger URL to get started!
        </div>
        
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="project in projects" 
            :key="project.id"
            class="card cursor-pointer hover:shadow-xl transition-shadow"
            @click="loadProject(project.id)"
          >
            <h3 class="font-semibold text-lg mb-2">{{ project.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-dark-secondary mb-3">
              {{ project.version }}
            </p>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">
                {{ formatDate(project.createdAt) }}
              </span>
              <Badge v-if="project.lastTestedAt" variant="success">
                Tested
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="stats.totalProjects > 0">
        <h2 class="text-xl font-semibold mb-4">📈 Statistics</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="card text-center">
            <div class="text-3xl font-bold text-primary-600">{{ stats.totalProjects }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary mt-1">Projects</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-success-600">{{ stats.totalTests }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary mt-1">Tests Run</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-error-600">{{ stats.totalIssues }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary mt-1">Issues Found</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-warning-600">{{ stats.falsePositives }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary mt-1">False Positives</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSwaggerStore } from '@/stores/swaggerStore'
import storageService from '@/services/storageService'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'

const router = useRouter()
const swaggerStore = useSwaggerStore()

const swaggerUrl = ref('')
const loading = ref(false)
const error = ref(null)
const projects = ref([])

const stats = computed(() => {
  const allResults = storageService.loadAllTestResults()
  const allFalsePositives = storageService.loadFalsePositives()
  
  let totalTests = 0
  let totalIssues = 0
  let falsePositivesCount = 0
  
  Object.values(allResults).forEach(result => {
    totalTests += result.results.length
    totalIssues += result.results.filter(r => r.passed === false).length
  })
  
  Object.values(allFalsePositives).forEach(fps => {
    falsePositivesCount += fps.length
  })
  
  return {
    totalProjects: projects.value.length,
    totalTests,
    totalIssues,
    falsePositives: falsePositivesCount
  }
})

const importSwagger = async () => {
  loading.value = true
  error.value = null
  
  const success = await swaggerStore.importSwagger(swaggerUrl.value)
  
  if (success) {
    router.push(`/project/${swaggerStore.currentProject.id}/endpoints`)
  } else {
    error.value = swaggerStore.error
  }
  
  loading.value = false
}

const loadProject = (projectId) => {
  swaggerStore.loadProject(projectId)
  router.push(`/project/${projectId}/endpoints`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

onMounted(() => {
  projects.value = storageService.loadProjects()
})
</script>
