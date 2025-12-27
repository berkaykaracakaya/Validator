/**
 * LocalStorage persistence service
 */
class StorageService {
    constructor() {
        this.STORAGE_KEYS = {
            PROJECTS: 'validator_projects',
            CURRENT_PROJECT: 'validator_current_project',
            TEST_RESULTS: 'validator_test_results',
            FALSE_POSITIVES: 'validator_false_positives',
            SETTINGS: 'validator_settings'
        }
    }

    /**
     * Save project
     */
    saveProject(project) {
        const projects = this.loadProjects()
        const existingIndex = projects.findIndex(p => p.id === project.id)

        if (existingIndex >= 0) {
            projects[existingIndex] = project
        } else {
            projects.push(project)
        }

        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
        return project
    }

    /**
     * Load all projects
     */
    loadProjects() {
        const data = localStorage.getItem(this.STORAGE_KEYS.PROJECTS)
        return data ? JSON.parse(data) : []
    }

    /**
     * Get project by ID
     */
    getProject(id) {
        const projects = this.loadProjects()
        return projects.find(p => p.id === id) || null
    }

    /**
     * Delete project
     */
    deleteProject(id) {
        const projects = this.loadProjects()
        const filtered = projects.filter(p => p.id !== id)
        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(filtered))

        // Clean up related data
        this.deleteTestResults(id)
    }

    /**
     * Set current project
     */
    setCurrentProject(projectId) {
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_PROJECT, projectId)
    }

    /**
     * Get current project ID
     */
    getCurrentProjectId() {
        return localStorage.getItem(this.STORAGE_KEYS.CURRENT_PROJECT)
    }

    /**
     * Save test results for an endpoint
     */
    saveTestResults(endpointId, results) {
        const allResults = this.loadAllTestResults()
        allResults[endpointId] = {
            results,
            timestamp: new Date().toISOString()
        }
        localStorage.setItem(this.STORAGE_KEYS.TEST_RESULTS, JSON.stringify(allResults))
    }

    /**
     * Load test results for an endpoint
     */
    loadTestResults(endpointId) {
        const allResults = this.loadAllTestResults()
        return allResults[endpointId] || null
    }

    /**
     * Load all test results
     */
    loadAllTestResults() {
        const data = localStorage.getItem(this.STORAGE_KEYS.TEST_RESULTS)
        return data ? JSON.parse(data) : {}
    }

    /**
     * Delete test results for a project
     */
    deleteTestResults(projectId) {
        const allResults = this.loadAllTestResults()
        Object.keys(allResults).forEach(key => {
            if (key.startsWith(projectId)) {
                delete allResults[key]
            }
        })
        localStorage.setItem(this.STORAGE_KEYS.TEST_RESULTS, JSON.stringify(allResults))
    }

    /**
     * Save false positive
     */
    saveFalsePositive(endpointId, testId, reason = '') {
        const falsePositives = this.loadFalsePositives()

        if (!falsePositives[endpointId]) {
            falsePositives[endpointId] = []
        }

        falsePositives[endpointId].push({
            testId,
            reason,
            timestamp: new Date().toISOString()
        })

        localStorage.setItem(this.STORAGE_KEYS.FALSE_POSITIVES, JSON.stringify(falsePositives))
    }

    /**
     * Load false positives
     */
    loadFalsePositives() {
        const data = localStorage.getItem(this.STORAGE_KEYS.FALSE_POSITIVES)
        return data ? JSON.parse(data) : {}
    }

    /**
     * Check if a test is marked as false positive
     */
    isFalsePositive(endpointId, testId) {
        const falsePositives = this.loadFalsePositives()
        const endpointFPs = falsePositives[endpointId] || []
        return endpointFPs.some(fp => fp.testId === testId)
    }

    /**
     * Remove false positive
     */
    removeFalsePositive(endpointId, testId) {
        const falsePositives = this.loadFalsePositives()
        if (falsePositives[endpointId]) {
            falsePositives[endpointId] = falsePositives[endpointId].filter(
                fp => fp.testId !== testId
            )
        }
        localStorage.setItem(this.STORAGE_KEYS.FALSE_POSITIVES, JSON.stringify(falsePositives))
    }

    /**
     * Save settings
     */
    saveSettings(settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    }

    /**
     * Load settings
     */
    loadSettings() {
        const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS)
        return data ? JSON.parse(data) : {
            darkMode: true,
            maxConcurrentTests: 5,
            testDelay: 100
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
        })
    }

    /**
     * Export data as JSON
     */
    exportData() {
        return {
            projects: this.loadProjects(),
            testResults: this.loadAllTestResults(),
            falsePositives: this.loadFalsePositives(),
            settings: this.loadSettings(),
            exportedAt: new Date().toISOString()
        }
    }

    /**
     * Import data from JSON
     */
    importData(data) {
        if (data.projects) {
            localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects))
        }
        if (data.testResults) {
            localStorage.setItem(this.STORAGE_KEYS.TEST_RESULTS, JSON.stringify(data.testResults))
        }
        if (data.falsePositives) {
            localStorage.setItem(this.STORAGE_KEYS.FALSE_POSITIVES, JSON.stringify(data.falsePositives))
        }
        if (data.settings) {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
        }
    }
}

export default new StorageService()
