import axios from 'axios'

/**
 * Validation test generators and execution
 */
class ValidationService {
    /**
     * Get test values for a specific validation type
     */
    getTestValues(validationType, schema = {}) {
        const generators = {
            WHITESPACE: () => [' ', '   ', '\t', '\n', '\r\n', '  \t \n  '],

            NO_STRING: () => ['abc', 'test123', '!@#$', 'null', 'undefined', 'true'],

            MAX_STRING: () => {
                const max = schema.maxLength || 255
                return [
                    'a'.repeat(max + 1),
                    'a'.repeat(max * 2),
                    'a'.repeat(10000)
                ]
            },

            MAX_NUMBER: () => {
                const max = schema.maximum || 100
                return [
                    max + 1,
                    max * 10,
                    Number.MAX_SAFE_INTEGER
                ]
            },

            MIN_NUMBER: () => {
                const min = schema.minimum || 0
                return [
                    min - 1,
                    min - 100,
                    Number.MIN_SAFE_INTEGER
                ]
            },

            MAX_DATE: () => {
                const future = new Date()
                future.setFullYear(future.getFullYear() + 1)
                return [
                    new Date(Date.now() + 86400000).toISOString(),
                    future.toISOString(),
                    '2099-12-31T23:59:59Z',
                    '9999-12-31T23:59:59Z'
                ]
            },

            MIN_DATE: () => {
                const past = new Date()
                past.setFullYear(past.getFullYear() - 1)
                return [
                    new Date(Date.now() - 86400000).toISOString(),
                    past.toISOString(),
                    '1900-01-01T00:00:00Z',
                    '1970-01-01T00:00:00Z'
                ]
            },

            EMAIL_CHECK: () => [
                'plaintext',
                '@domain.com',
                'user@',
                'user @domain.com',
                'user..name@domain.com',
                'user@domain..com',
                '.user@domain.com',
                'user@domain',
                '<script>@domain.com',
                'user@<script>.com',
                'a'.repeat(255) + '@domain.com'
            ],

            PHONE_CHECK: () => [
                '123',
                '12345',
                'abc-def-ghij',
                '123 456 789',
                '123-456-789!',
                '123@456#789',
                '<script>alert()</script>',
                'a'.repeat(50)
            ],

            REQUIRED_CHECK: () => [null, undefined, '', '   ']
        }

        const generator = generators[validationType]
        return generator ? generator() : []
    }

    /**
     * Build test request for an endpoint and parameter
     */
    buildTestRequest(endpoint, parameter, testValue, baseUrl) {
        const url = new URL(endpoint.path, baseUrl)
        const request = {
            method: endpoint.method,
            url: url.toString(),
            headers: {},
            params: {},
            data: null
        }

        // Path parameter
        if (parameter.in === 'path') {
            request.url = request.url.replace(`{${parameter.name}}`, testValue)
        }

        // Query parameter
        if (parameter.in === 'query') {
            request.params[parameter.name] = testValue
        }

        // Header parameter
        if (parameter.in === 'header') {
            request.headers[parameter.name] = testValue
        }

        // Body parameter
        if (parameter.in === 'body') {
            if (!request.data) {
                request.data = {}
            }
            request.data[parameter.name] = testValue
        }

        return request
    }

    /**
     * Execute a single test
     */
    async executeTest(request) {
        try {
            const response = await axios({
                method: request.method,
                url: request.url,
                headers: request.headers,
                params: request.params,
                data: request.data,
                timeout: 10000,
                validateStatus: () => true // Accept all status codes
            })

            return {
                success: true,
                status: response.status,
                statusText: response.statusText,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    /**
     * Analyze response and determine if test passed
     */
    analyzeResponse(response, validationType) {
        // For validation tests, we expect 4xx status codes
        const expectedFailureStatuses = [400, 422, 413]

        // If validation type is testing bad data, we expect failure
        if (expectedFailureStatuses.includes(response.status)) {
            return {
                passed: true,
                message: `API correctly rejected invalid input (${response.status})`
            }
        } else if (response.status >= 200 && response.status < 300) {
            return {
                passed: false,
                message: `API accepted invalid input (${response.status})`,
                severity: this.getSeverity(validationType)
            }
        } else if (response.status === 401 || response.status === 403) {
            return {
                passed: null,
                message: 'Authentication required - cannot test',
                severity: 'info'
            }
        } else {
            return {
                passed: null,
                message: `Unexpected response (${response.status})`,
                severity: 'warning'
            }
        }
    }

    /**
     * Get severity level for validation type
     */
    getSeverity(validationType) {
        const severityMap = {
            REQUIRED_CHECK: 'high',
            EMAIL_CHECK: 'high',
            PHONE_CHECK: 'medium',
            NO_STRING: 'high',
            MAX_STRING: 'medium',
            MAX_NUMBER: 'medium',
            MIN_NUMBER: 'medium',
            MAX_DATE: 'low',
            MIN_DATE: 'low',
            WHITESPACE: 'low'
        }

        return severityMap[validationType] || 'medium'
    }

    /**
     * Get human-readable validation name
     */
    getValidationName(validationType) {
        const names = {
            WHITESPACE: 'Whitespace Validation',
            NO_STRING: 'Type Safety (No String)',
            MAX_STRING: 'Maximum String Length',
            MAX_NUMBER: 'Maximum Number Value',
            MIN_NUMBER: 'Minimum Number Value',
            MAX_DATE: 'Maximum Date',
            MIN_DATE: 'Minimum Date',
            EMAIL_CHECK: 'Email Format',
            PHONE_CHECK: 'Phone Format',
            REQUIRED_CHECK: 'Required Field'
        }

        return names[validationType] || validationType
    }

    /**
     * Get recommendation for failed validation
     */
    getRecommendation(validationType, parameter) {
        const recommendations = {
            WHITESPACE: `Add trim() and check for empty string on "${parameter.name}"`,
            NO_STRING: `Add type validation to ensure "${parameter.name}" is numeric`,
            MAX_STRING: `Add maxLength constraint (e.g., 100-255 chars) on "${parameter.name}"`,
            MAX_NUMBER: `Add maximum value constraint on "${parameter.name}"`,
            MIN_NUMBER: `Add minimum value constraint on "${parameter.name}"`,
            MAX_DATE: `Add maximum date constraint on "${parameter.name}"`,
            MIN_DATE: `Add minimum date constraint on "${parameter.name}"`,
            EMAIL_CHECK: `Use proper email validation (RFC 5322) on "${parameter.name}"`,
            PHONE_CHECK: `Add phone number format validation on "${parameter.name}"`,
            REQUIRED_CHECK: `Mark "${parameter.name}" as required and validate presence`
        }

        return recommendations[validationType] || 'Add appropriate validation'
    }
}

export default new ValidationService()
