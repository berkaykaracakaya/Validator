import { defineStore } from 'pinia'
import swaggerService from '@/services/swaggerService'

export const useValidationStore = defineStore('validation', {
    state: () => ({
        // Validation configuration per endpoint
        // { endpointId: { validationType: { enabled: true, params: [] } } }
        selectedValidations: {},

        // Global validation config
        validationConfig: {
            WHITESPACE: { enabled: true, severity: 'low', name: 'Whitespace Validation' },
            NO_STRING: { enabled: true, severity: 'high', name: 'Type Safety (No String)' },
            MAX_STRING: { enabled: true, severity: 'medium', name: 'Maximum String Length' },
            MAX_NUMBER: { enabled: true, severity: 'medium', name: 'Maximum Number Value' },
            MIN_NUMBER: { enabled: true, severity: 'medium', name: 'Minimum Number Value' },
            MAX_DATE: { enabled: false, severity: 'low', name: 'Maximum Date' },
            MIN_DATE: { enabled: false, severity: 'low', name: 'Minimum Date' },
            EMAIL_CHECK: { enabled: true, severity: 'high', name: 'Email Format' },
            PHONE_CHECK: { enabled: true, severity: 'medium', name: 'Phone Format' },
            REQUIRED_CHECK: { enabled: true, severity: 'high', name: 'Required Field' }
        }
    }),

    getters: {
        /**
         * Get enabled validations for an endpoint
         */
        getEnabledValidations: (state) => (endpointId) => {
            const endpointValidations = state.selectedValidations[endpointId] || {}
            return Object.keys(endpointValidations).filter(
                type => endpointValidations[type].enabled
            )
        },

        /**
         * Get validation count for endpoint
         */
        getValidationCount: (state) => (endpointId) => {
            const enabled = state.getEnabledValidations(endpointId)
            return enabled.length
        },

        /**
         * Get suggested validations for parameter
         */
        getSuggestedValidations: () => (parameter) => {
            return swaggerService.suggestValidations(parameter)
        },

        /**
         * Get all validation types
         */
        allValidationTypes: (state) => {
            return Object.keys(state.validationConfig)
        }
    },

    actions: {
        /**
         * Toggle validation for endpoint + validation type
         */
        toggleValidation(endpointId, validationType, parameters = []) {
            if (!this.selectedValidations[endpointId]) {
                this.selectedValidations[endpointId] = {}
            }

            if (!this.selectedValidations[endpointId][validationType]) {
                this.selectedValidations[endpointId][validationType] = {
                    enabled: true,
                    params: parameters
                }
            } else {
                this.selectedValidations[endpointId][validationType].enabled =
                    !this.selectedValidations[endpointId][validationType].enabled
            }
        },

        /**
         * Set validations for endpoint (bulk)
         */
        setEndpointValidations(endpointId, validations) {
            this.selectedValidations[endpointId] = validations
        },

        /**
         * Apply smart suggestions to endpoint
         */
        applySmartSuggestions(endpointId, endpoint) {
            const validations = {}

            endpoint.parameters.forEach(param => {
                const suggestions = swaggerService.suggestValidations(param)

                suggestions.forEach(validationType => {
                    if (!validations[validationType]) {
                        validations[validationType] = {
                            enabled: true,
                            params: []
                        }
                    }
                    validations[validationType].params.push(param.name)
                })
            })

            this.selectedValidations[endpointId] = validations
        },

        /**
         * Enable all validations for endpoint
         */
        enableAllValidations(endpointId) {
            const allValidations = {}

            Object.keys(this.validationConfig).forEach(type => {
                allValidations[type] = {
                    enabled: true,
                    params: []
                }
            })

            this.selectedValidations[endpointId] = allValidations
        },

        /**
         * Clear validations for endpoint
         */
        clearEndpointValidations(endpointId) {
            delete this.selectedValidations[endpointId]
        },

        /**
         * Update global validation config
         */
        updateValidationConfig(validationType, config) {
            if (this.validationConfig[validationType]) {
                this.validationConfig[validationType] = {
                    ...this.validationConfig[validationType],
                    ...config
                }
            }
        }
    }
})
