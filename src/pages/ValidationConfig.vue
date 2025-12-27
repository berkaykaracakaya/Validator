<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-primary">
    <PageHeader 
      title="Validation Configuration" 
      :project-name="swaggerStore.currentProject?.name"
    >
      <template #breadcrumb>
        <Breadcrumb :items="breadcrumbItems" />
      </template>
    </PageHeader>

    <div class="max-w-4xl mx-auto px-8 pb-8">
      <!-- Endpoint Info -->
      <div class="card mb-6">
        <div class="flex items-center gap-3 mb-2">
          <Badge :variant="getMethodColor(endpoint?.method)">
            {{ endpoint?.method }}
          </Badge>
          <code class="text-lg">{{ endpoint?.path }}</code>
        </div>
        <p class="text-sm text-gray-600 dark:text-dark-secondary">
          {{ endpoint?.summary || 'No description' }}
        </p>
      </div>

      <!-- Parameters -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold mb-4">📝 Parameters ({{ endpoint?.parameters.length || 0 }})</h2>
        <div v-if="endpoint?.parameters.length === 0" class="text-gray-500 text-center py-8">
          No parameters for this endpoint
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="param in endpoint.parameters"
            :key="param.name"
            class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-tertiary rounded"
          >
            <input type="checkbox" checked disabled class="w-4 h-4" />
            <div>
              <span class="font-medium">{{ param.name }}</span>
              <Badge v-if="param.required" variant="error" class="ml-2">required</Badge>
              <span class="text-sm text-gray-500 ml-2">({{ param.schema.type }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Selection -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">✅ Select Validations</h2>
          <div class="flex gap-2">
            <Button variant="secondary" size="sm" @click="applySuggestions">
              💡 Smart Suggestions
            </Button>
            <Button variant="secondary" size="sm" @click="selectAll">
              Select All
            </Button>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="[type, config] in Object.entries(validationStore.validationConfig)"
            :key="type"
            class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-tertiary rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            <input
              v-model="selectedValidations[type]"
              type="checkbox"
              class="w-5 h-5 mt-1"
            />
            <div class="flex-1">
              <div class="font-medium">{{ config.name }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Severity: 
                <Badge :variant="getSeverityColor(config.severity)">{{ config.severity }}</Badge>
              </div>
              <div v-if="getApplicableParams(type).length > 0" class="text-xs text-gray-500 mt-1">
                Applicable to: {{ getApplicableParams(type).join(', ') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Base URL Input -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium">API Base URL</label>
          <span v-if="swaggerStore.currentProject?.baseUrl" class="text-xs text-success-600 dark:text-success-400 flex items-center gap-1">
            <span>✓</span> Auto-detected from Swagger
          </span>
        </div>
        <input
          v-model="baseUrl"
          type="url"
          class="input"
          placeholder="https://api.example.com"
          required
        />
        <p class="text-xs text-gray-500 mt-2">
          The base URL where the API is hosted for testing
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <Button variant="secondary" @click="goBack">
          Cancel
        </Button>
        <Button variant="primary" @click="startTests" :disabled="!canRunTests">
          Run Tests →
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSwaggerStore } from '@/stores/swaggerStore'
import { useValidationStore } from '@/stores/validationStore'
import swaggerService from '@/services/swaggerService'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'
import PageHeader from '@/components/PageHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const swaggerStore = useSwaggerStore()
const validationStore = useValidationStore()

const selectedValidations = ref({})
const baseUrl = ref('')

const endpoint = computed(() => {
  return swaggerStore.getEndpointById(route.params.id)
})

const breadcrumbItems = computed(() => [
  { label: 'Dashboard', to: '/' },
  { label: swaggerStore.currentProject?.name || 'Project', to: `/project/${swaggerStore.currentProject?.id}/endpoints` },
  { label: 'Configure', to: null }
])

const canRunTests = computed(() => {
  return Object.values(selectedValidations.value).some(v => v === true) && baseUrl.value
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

const getSeverityColor = (severity) => {
  const colors = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return colors[severity] || 'info'
}

const getApplicableParams = (validationType) => {
  if (!endpoint.value) return []
  
  return endpoint.value.parameters
    .filter(param => {
      const suggestions = swaggerService.suggestValidations(param)
      return suggestions.includes(validationType)
    })
    .map(p => p.name)
}

const applySuggestions = () => {
  endpoint.value.parameters.forEach(param => {
    const suggestions = swaggerService.suggestValidations(param)
    suggestions.forEach(type => {
      selectedValidations.value[type] = true
    })
  })
}

const selectAll = () => {
  Object.keys(validationStore.validationConfig).forEach(type => {
    selectedValidations.value[type] = true
  })
}

const startTests = () => {
  // Save selections
  const validations = {}
  Object.entries(selectedValidations.value).forEach(([type, enabled]) => {
    if (enabled) {
      validations[type] = {
        enabled: true,
        params: getApplicableParams(type)
      }
    }
  })
  
  validationStore.setEndpointValidations(endpoint.value.id, validations)
  
  // Navigate to test runner
  router.push({
    path: `/endpoint/${endpoint.value.id}/test`,
    query: { baseUrl: baseUrl.value }
  })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  // Auto-fill base URL from project
  if (swaggerStore.currentProject?.baseUrl) {
    baseUrl.value = swaggerStore.currentProject.baseUrl
  }
  
  // Load existing selections if any
  const existing = validationStore.getEnabledValidations(route.params.id)
  existing.forEach(type => {
    selectedValidations.value[type] = true
  })
  
  // Auto-apply suggestions if no existing selections
  if (existing.length === 0) {
    applySuggestions()
  }
})
</script>
