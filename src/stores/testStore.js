import { defineStore } from 'pinia'
import validationService from '@/services/validationService'
import storageService from '@/services/storageService'

export const useTestStore = defineStore('test', {
    state: () => ({
        // Test results per endpoint
        testResults: {},

        // Test execution status
        isRunning: false,
        isPaused: false,

        // Progress tracking
        progress: {
            current: 0,
            total: 0,
            currentTest: null
        },

        // False positives
        falsePositives: {},

        // Test history
        testHistory: [],

        // Base URL per endpoint
        baseUrls: {}
    }),

    getters: {
        /**
         * Get test results for endpoint
         */
        getEndpointResults: (state) => (endpointId) => {
            return state.testResults[endpointId] || []
        },

        /**
         * Get test statistics for endpoint
         */
        getEndpointStats: (state) => (endpointId) => {
            const results = state.testResults[endpointId] || []
            const falsePositives = state.falsePositives[endpointId] || []

            const passed = results.filter(r => r.passed === true ||
                falsePositives.some(fp => fp.testId === r.id))
            const failed = results.filter(r => r.passed === false &&
                !falsePositives.some(fp => fp.testId === r.id))
            const skipped = results.filter(r => r.passed === null)

            return {
                total: results.length,
                passed: passed.length,
                failed: failed.length,
                skipped: skipped.length
            }
        },

        /**
         * Get all failed tests (not marked as false positive)
         */
        getFailedTests: (state) => (endpointId) => {
            const results = state.testResults[endpointId] || []
            const falsePositives = state.falsePositives[endpointId] || []

            return results.filter(r =>
                r.passed === false &&
                !falsePositives.some(fp => fp.testId === r.id)
            )
        },

        /**
         * Check if test is false positive
         */
        isFalsePositive: (state) => (endpointId, testId) => {
            const fps = state.falsePositives[endpointId] || []
            return fps.some(fp => fp.testId === testId)
        },

        /**
         * Get progress percentage
         */
        progressPercentage: (state) => {
            if (state.progress.total === 0) return 0
            return Math.round((state.progress.current / state.progress.total) * 100)
        }
    },

    actions: {
        /**
         * Run tests for endpoint
         */
        async runTests(endpoint, selectedValidations, baseUrl) {
            this.isRunning = true
            this.isPaused = false
            this.testResults[endpoint.id] = []

            // Save base URL for this endpoint
            this.baseUrls[endpoint.id] = baseUrl

            // Build test cases
            const testCases = this.buildTestCases(endpoint, selectedValidations)
            this.progress.total = testCases.length
            this.progress.current = 0

            // Execute tests
            for (const testCase of testCases) {
                if (!this.isRunning || this.isPaused) break

                this.progress.currentTest = testCase

                const result = await this.executeTestCase(testCase, endpoint, baseUrl)
                this.testResults[endpoint.id].push(result)

                this.progress.current++

                // Delay between tests
                await this.delay(100)
            }

            // Save results
            storageService.saveTestResults(endpoint.id, this.testResults[endpoint.id])

            // Add to history
            this.testHistory.unshift({
                endpointId: endpoint.id,
                endpoint: endpoint.path,
                method: endpoint.method,
                timestamp: new Date().toISOString(),
                stats: this.getEndpointStats(endpoint.id)
            })

            this.isRunning = false
            this.progress.currentTest = null
        },

        /**
         * Build test cases from endpoint and validations
         */
        buildTestCases(endpoint, selectedValidations) {
            const testCases = []

            // Load false positives for this endpoint
            const falsePositives = storageService.loadFalsePositives()[endpoint.id] || []

            Object.entries(selectedValidations).forEach(([validationType, config]) => {
                if (!config.enabled) return

                const targetParams = config.params.length > 0
                    ? endpoint.parameters.filter(p => config.params.includes(p.name))
                    : endpoint.parameters

                targetParams.forEach(param => {
                    const testValues = validationService.getTestValues(validationType, param.schema)

                    testValues.forEach((value, index) => {
                        const testId = `${endpoint.id}_${validationType}_${param.name}_${index}`

                        // Skip if marked as false positive
                        const isFalsePositive = falsePositives.some(fp => fp.testId === testId)
                        if (isFalsePositive) {
                            console.log(`Skipping test ${testId} (marked as false positive)`)
                            return
                        }

                        testCases.push({
                            id: testId,
                            endpointId: endpoint.id,
                            validationType,
                            parameter: param,
                            testValue: value
                        })
                    })
                })
            })

            return testCases
        },

        /**
         * Execute single test case
         */
        async executeTestCase(testCase, endpoint, baseUrl) {
            const request = validationService.buildTestRequest(
                endpoint,
                testCase.parameter,
                testCase.testValue,
                baseUrl
            )

            const response = await validationService.executeTest(request)
            const analysis = validationService.analyzeResponse(response, testCase.validationType)

            return {
                id: testCase.id,
                endpointId: testCase.endpointId,
                validationType: testCase.validationType,
                validationName: validationService.getValidationName(testCase.validationType),
                parameterName: testCase.parameter.name,
                testValue: testCase.testValue,
                expectedBehavior: '400/422 Bad Request',
                actualStatus: response.status,
                passed: analysis.passed,
                message: analysis.message,
                severity: analysis.severity,
                recommendation: analysis.passed === false
                    ? validationService.getRecommendation(testCase.validationType, testCase.parameter)
                    : null,
                timestamp: new Date().toISOString()
            }
        },

        /**
         * Pause test execution
         */
        pauseTests() {
            this.isPaused = true
        },

        /**
         * Resume test execution
         */
        resumeTests() {
            this.isPaused = false
        },

        /**
         * Stop test execution
         */
        stopTests() {
            this.isRunning = false
            this.isPaused = false
        },

        /**
         * Mark test as false positive
         */
        markAsFalsePositive(endpointId, testId, reason = '') {
            if (!this.falsePositives[endpointId]) {
                this.falsePositives[endpointId] = []
            }

            this.falsePositives[endpointId].push({
                testId,
                reason,
                timestamp: new Date().toISOString()
            })

            storageService.saveFalsePositive(endpointId, testId, reason)
        },

        /**
         * Remove false positive mark
         */
        removeFalsePositive(endpointId, testId) {
            if (this.falsePositives[endpointId]) {
                this.falsePositives[endpointId] = this.falsePositives[endpointId].filter(
                    fp => fp.testId !== testId
                )
            }

            storageService.removeFalsePositive(endpointId, testId)
        },

        /**
         * Load test results from storage
         */
        loadResults(endpointId) {
            const stored = storageService.loadTestResults(endpointId)
            if (stored) {
                this.testResults[endpointId] = stored.results
            }

            this.falsePositives[endpointId] = storageService.loadFalsePositives()[endpointId] || []
        },

        /**
         * Clear results for endpoint
         */
        clearResults(endpointId) {
            delete this.testResults[endpointId]
            delete this.falsePositives[endpointId]
        },

        /**
         * Delay helper
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
        }
    }
})
