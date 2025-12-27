import { defineStore } from 'pinia'
import swaggerService from '@/services/swaggerService'
import storageService from '@/services/storageService'

export const useSwaggerStore = defineStore('swagger', {
    state: () => ({
        currentProject: null,
        endpoints: [],
        loading: false,
        error: null,
        swaggerData: null
    }),

    getters: {
        /**
         * Get endpoints grouped by tags
         */
        endpointsByTag: (state) => {
            const grouped = {}

            state.endpoints.forEach(endpoint => {
                const tag = endpoint.tags[0] || 'Untagged'
                if (!grouped[tag]) {
                    grouped[tag] = []
                }
                grouped[tag].push(endpoint)
            })

            return grouped
        },

        /**
         * Get endpoint by ID
         */
        getEndpointById: (state) => (id) => {
            return state.endpoints.find(e => e.id === id)
        },

        /**
         * Check if project is loaded
         */
        hasProject: (state) => {
            return state.currentProject !== null
        }
    },

    actions: {
        /**
         * Import Swagger from URL
         */
        async importSwagger(url) {
            this.loading = true
            this.error = null

            try {
                // Fetch Swagger
                const result = await swaggerService.fetchSwagger(url)

                if (!result.success) {
                    this.error = result.error
                    this.loading = false
                    return false
                }

                this.swaggerData = result.data

                // Extract endpoints
                this.endpoints = swaggerService.extractEndpoints(result.data)

                // Extract base URL
                const baseUrl = swaggerService.extractBaseUrl(result.data)

                // Check if project with this URL already exists
                const existingProjects = storageService.loadProjects()
                const existingProject = existingProjects.find(p => p.url === url)

                let project
                if (existingProject) {
                    // Update existing project
                    project = {
                        ...existingProject,
                        name: result.data.info?.title || existingProject.name,
                        version: result.version,
                        baseUrl: baseUrl || existingProject.baseUrl || '',
                        updatedAt: new Date().toISOString(),
                        info: {
                            title: result.data.info?.title || '',
                            description: result.data.info?.description || '',
                            version: result.data.info?.version || ''
                        }
                    }
                } else {
                    // Create new project
                    project = {
                        id: this.generateProjectId(),
                        name: result.data.info?.title || 'Unnamed API',
                        url: url,
                        baseUrl: baseUrl || '',
                        version: result.version,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastTestedAt: null,
                        info: {
                            title: result.data.info?.title || '',
                            description: result.data.info?.description || '',
                            version: result.data.info?.version || ''
                        }
                    }
                }

                this.currentProject = project

                // Save to storage
                storageService.saveProject(project)
                storageService.setCurrentProject(project.id)

                this.loading = false
                return true
            } catch (error) {
                this.error = error.message
                this.loading = false
                return false
            }
        },

        /**
         * Load project from storage
         */
        async loadProject(projectId) {
            const project = storageService.getProject(projectId)

            if (!project) {
                this.error = 'Project not found'
                return false
            }

            this.currentProject = project
            storageService.setCurrentProject(projectId)

            // Re-fetch Swagger to get fresh endpoints (but don't save as new project)
            this.loading = true
            try {
                const result = await swaggerService.fetchSwagger(project.url)

                if (result.success) {
                    this.swaggerData = result.data
                    this.endpoints = swaggerService.extractEndpoints(result.data)
                }
            } catch (error) {
                console.error('Error refreshing endpoints:', error)
            }
            this.loading = false

            return true
        },

        /**
         * Clear current project
         */
        clearProject() {
            this.currentProject = null
            this.endpoints = []
            this.swaggerData = null
            this.error = null
        },

        /**
         * Update last tested timestamp
         */
        updateLastTested() {
            if (this.currentProject) {
                this.currentProject.lastTestedAt = new Date().toISOString()
                storageService.saveProject(this.currentProject)
            }
        },

        /**
         * Generate unique project ID
         */
        generateProjectId() {
            return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
    }
})
