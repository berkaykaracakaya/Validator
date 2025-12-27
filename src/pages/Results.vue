<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-primary">
    <PageHeader 
      title="Test Results" 
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

      <!-- Summary -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold mb-4">📊 Summary</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-success-600">{{ stats.passed }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary">Passed</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-error-600">{{ stats.failed }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary">Failed</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-500">{{ stats.skipped }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary">Skipped</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-600">{{ stats.total }}</div>
            <div class="text-sm text-gray-600 dark:text-dark-secondary">Total</div>
          </div>
        </div>
      </div>

      <!-- Failed Tests (Issues) -->
      <div v-if="failedTests.length > 0" class="mb-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          🔴 Issues Found ({{ failedTests.length }})
        </h2>
        
        <div class="space-y-4">
          <div
            v-for="result in failedTests"
            :key="result.id"
            class="card border-l-4 border-error-500"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <Badge :variant="result.severity === 'high' ? 'error' : result.severity === 'medium' ? 'warning' : 'info'">
                  {{ result.severity?.toUpperCase() }}
                </Badge>
                <span class="ml-2 font-semibold">
                  {{ result.parameterName }} - {{ result.validationName }}
                </span>
              </div>
            </div>
            
            <div class="text-sm space-y-2">
              <div class="bg-gray-50 dark:bg-dark-tertiary p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Test Value:</span>
                <code class="ml-2">{{ formatValue(result.testValue) }}</code>
              </div>
              
              <div class="flex gap-4">
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Expected:</span>
                  <span class="ml-2">{{ result.expectedBehavior }}</span>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Actual:</span>
                  <span class="ml-2 text-error-600">{{ result.actualStatus }}</span>
                </div>
              </div>
              
              <div v-if="result.recommendation" class="bg-primary-50 dark:bg-primary-900/20 p-3 rounded">
                <span class="font-medium">💡 Recommendation:</span>
                <p class="mt-1 text-gray-700 dark:text-gray-300">
                  {{ result.recommendation }}
                </p>
              </div>
            </div>
            
            <div class="mt-4 flex gap-3">
              <Button 
                size="sm" 
                variant="secondary"
                @click="showFalsePositiveModal(result)"
              >
                Mark as False Positive
              </Button>
              <Button size="sm" variant="secondary" @click="copyToClipboard(result)">
                Copy Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Passed Tests (Collapsible) -->
      <div v-if="passedTests.length > 0" class="card">
        <button
          class="w-full flex items-center justify-between text-left"
          @click="showPassed = !showPassed"
        >
          <h2 class="text-lg font-semibold flex items-center gap-2">
            ✅ Passed Tests ({{ passedTests.length }})
          </h2>
          <span>{{ showPassed ? '▼' : '▶' }}</span>
        </button>
        
        <div v-if="showPassed" class="mt-4 space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="result in passedTests"
            :key="result.id"
            class="flex items-center gap-3 p-2 bg-success-50 dark:bg-success-900/20 rounded text-sm"
          >
            <span>✅</span>
            <span>{{ result.parameterName }} - {{ result.validationName }}</span>
            <span class="ml-auto text-gray-500">{{ result.message }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-between">
        <div class="flex gap-3">
          <Button variant="secondary" @click="exportResults">
            📥 Export Results
          </Button>
          <Button variant="secondary" @click="runAgain">
            🔄 Run Again
          </Button>
        </div>
        <Button variant="primary" @click="configure">
          ⚙️ Configure
        </Button>
      </div>
    </div>

    <!-- False Positive Modal -->
    <Modal v-model="falsePositiveModal" title="Mark as False Positive">
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-dark-secondary">
          Endpoint: <strong>{{ endpoint?.method }} {{endpoint?.path }}</strong><br>
          Parameter: <strong>{{ selectedResult?.parameterName }}</strong><br>
          Validation: <strong>{{ selectedResult?.validationName }}</strong>
        </p>
        
        <div>
          <label class="block text-sm font-medium mb-2">Reason (optional):</label>
          <textarea
            v-model="falsePositiveReason"
            class="input"
            rows="3"
            placeholder="e.g., API intentionally trims whitespace on server side"
          ></textarea>
        </div>
        
        <div class="bg-warning-50 dark:bg-warning-900/20 p-3 rounded text-sm">
          ⚠️ This test will be skipped in future runs and won't appear in reports.
        </div>
      </div>
      
      <template #footer>
        <Button variant="secondary" @click="falsePositiveModal = false">
          Cancel
        </Button>
        <Button variant="primary" @click="confirmFalsePositive">
          Confirm & Save
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSwaggerStore } from '@/stores/swaggerStore'
import { useTestStore } from '@/stores/testStore'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import PageHeader from '@/components/PageHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()
const swaggerStore = useSwaggerStore()
const testStore = useTestStore()

const showPassed = ref(false)
const falsePositiveModal = ref(false)
const falsePositiveReason = ref('')
const selectedResult = ref(null)

const endpoint = computed(() => swaggerStore.getEndpointById(route.params.id))
const stats = computed(() => testStore.getEndpointStats(route.params.id))
const failedTests = computed(() => testStore.getFailedTests(route.params.id))
const passedTests = computed(() => {
  const results = testStore.getEndpointResults(route.params.id)
  return results.filter(r => r.passed === true)
})

const breadcrumbItems = computed(() => [
  { label: 'Dashboard', to: '/' },
  { label: swaggerStore.currentProject?.name || 'Project', to: `/project/${swaggerStore.currentProject?.id}/endpoints` },
  { label: 'Results', to: null }
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

const formatValue = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...'
  }
  return JSON.stringify(value)
}

const showFalsePositiveModal = (result) => {
  selectedResult.value = result
  falsePositiveReason.value = ''
  falsePositiveModal.value = true
}

const confirmFalsePositive = () => {
  if (selectedResult.value) {
    testStore.markAsFalsePositive(
      route.params.id,
      selectedResult.value.id,
      falsePositiveReason.value
    )
  }
  falsePositiveModal.value = false
  selectedResult.value = null
}

const exportResults = () => {
  const results = testStore.getEndpointResults(route.params.id)
  const data = {
    endpoint: endpoint.value,
    stats: stats.value,
    results: results,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `validation-results-${Date.now()}.json`
  a.click()
}

const copyToClipboard = (result) => {
  const text = `
Issue: ${result.parameterName} - ${result.validationName}
Severity: ${result.severity}
Test Value: ${formatValue(result.testValue)}
Expected: ${result.expectedBehavior}
Actual: ${result.actualStatus}
Recommendation: ${result.recommendation}
  `.trim()
  
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard!')
}

const runAgain = () => {
  const baseUrl = testStore.baseUrls[route.params.id] || route.query.baseUrl || ''
  testStore.clearResults(route.params.id)
  router.push({
    path: `/endpoint/${route.params.id}/test`,
    query: { baseUrl }
  })
}

const configure = () => {
  router.push(`/endpoint/${route.params.id}/configure`)
}
</script>
