<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-primary">
    <PageHeader :title="swaggerStore.currentProject?.name || 'Project'" :project-name="null">
      <template #breadcrumb>
        <Breadcrumb :items="breadcrumbItems" />
      </template>
    </PageHeader>

    <div class="max-w-6xl mx-auto px-8 pb-8">
      <!-- Search and Filter -->
      <div class="card mb-6">
        <div class="flex gap-3">
          <input
            v-model="searchQuery"
            type="text"
            class="input flex-1"
            placeholder="Search endpoints..."
          />
          <Button variant="primary" @click="configureAll">
            Configure All
          </Button>
        </div>
      </div>

      <!-- Endpoints by Tag -->
      <div v-if="loading" class="card text-center py-12">
        <Spinner size="lg" />
        <p class="mt-4 text-gray-600 dark:text-dark-secondary">Loading endpoints...</p>
      </div>

      <div v-else-if="filteredEndpointsByTag.length === 0" class="card text-center py-12">
        <p class="text-gray-600 dark:text-dark-secondary">No endpoints found</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="[tag, endpoints] in filteredEndpointsByTag" :key="tag">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            📁 {{ tag }}
            <span class="text-sm text-gray-500 font-normal">({{ endpoints.length }})</span>
          </h2>
          
          <div class="space-y-3">
            <div
              v-for="endpoint in endpoints"
              :key="endpoint.id"
              class="card flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
              @click="configureEndpoint(endpoint.id)"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <Badge :variant="getMethodColor(endpoint.method)">
                    {{ endpoint.method }}
                  </Badge>
                  <code class="text-sm">{{ endpoint.path }}</code>
                </div>
                <p class="text-sm text-gray-600 dark:text-dark-secondary">
                  {{ endpoint.summary || 'No description' }}
                </p>
                <div class="mt-2 flex items-center gap-4 text-xs">
                  <span class="text-gray-500">
                    {{ endpoint.parameters.length }} parameters
                  </span>
                  <TestStatus :endpoint-id="endpoint.id" />
                </div>
              </div>
              
              <Button variant="secondary" size="sm">
                Configure →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSwaggerStore } from '@/stores/swaggerStore'
import { useTestStore } from '@/stores/testStore'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'
import Spinner from '@/components/Spinner.vue'
import TestStatus from '@/components/TestStatus.vue'
import PageHeader from '@/components/PageHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const swaggerStore = useSwaggerStore()
const testStore = useTestStore()

const searchQuery = ref('')
const loading = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Dashboard', to: '/' },
  { label: swaggerStore.currentProject?.name || 'Project', to: null }
])

const filteredEndpointsByTag = computed(() => {
  const endpointsByTag = swaggerStore.endpointsByTag
  
  if (!searchQuery.value) {
    return Object.entries(endpointsByTag)
  }
  
  const query = searchQuery.value.toLowerCase()
  const filtered = {}
  
  Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
    const matchingEndpoints = endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(query) ||
      endpoint.method.toLowerCase().includes(query) ||
      endpoint.summary.toLowerCase().includes(query)
    )
    
    if (matchingEndpoints.length > 0) {
      filtered[tag] = matchingEndpoints
    }
  })
  
  return Object.entries(filtered)
})

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

const configureEndpoint = (endpointId) => {
  router.push(`/endpoint/${endpointId}/configure`)
}

const configureAll = () => {
  // TODO: Implement bulk configuration
  alert('Bulk configuration coming soon!')
}

onMounted(async () => {
  if (!swaggerStore.hasProject) {
    const projectId = route.params.id
    loading.value = true
    swaggerStore.loadProject(projectId)
    loading.value = false
  }
})
</script>
