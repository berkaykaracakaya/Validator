import axios from 'axios'
import yaml from 'js-yaml'

/**
 * Swagger/OpenAPI parsing service
 */
class SwaggerService {
    /**
     * Fetch and parse Swagger documentation
     */
    async fetchSwagger(url) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json, application/yaml'
                }
            })

            // Parse YAML if string
            const data = typeof response.data === 'string'
                ? yaml.load(response.data)
                : response.data

            return {
                success: true,
                data: data,
                version: this.detectVersion(data)
            }
        } catch (error) {
            return {
                success: false,
                error: this.formatError(error)
            }
        }
    }

    /**
     * Detect OpenAPI/Swagger version
     */
    detectVersion(data) {
        if (data.openapi) {
            return `OpenAPI ${data.openapi}`
        } else if (data.swagger) {
            return `Swagger ${data.swagger}`
        }
        return 'Unknown'
    }

    /**
     * Format error messages
     */
    formatError(error) {
        if (error.code === 'ECONNABORTED') {
            return 'Request timeout - Swagger endpoint took too long to respond'
        } else if (error.response) {
            return `HTTP ${error.response.status}: ${error.response.statusText}`
        } else if (error.request) {
            return 'Network error - Unable to reach Swagger endpoint'
        }
        return error.message || 'Unknown error occurred'
    }

    /**
     * Extract all endpoints from Swagger data
     */
    extractEndpoints(swaggerData) {
        const endpoints = []
        const paths = swaggerData.paths || {}

        Object.entries(paths).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, details]) => {
                if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
                    endpoints.push({
                        id: this.generateId(path, method),
                        path: path,
                        method: method.toUpperCase(),
                        summary: details.summary || '',
                        description: details.description || '',
                        tags: details.tags || [],
                        parameters: this.extractParameters(details, swaggerData),
                        requestBody: this.extractRequestBody(details, swaggerData),
                        responses: this.extractResponses(details, swaggerData),
                        security: details.security || []
                    })
                }
            })
        })

        return endpoints
    }

    /**
     * Extract base URL from Swagger data
     */
    extractBaseUrl(swaggerData) {
        // OpenAPI 3.0+ uses servers array
        if (swaggerData.servers && swaggerData.servers.length > 0) {
            return swaggerData.servers[0].url
        }

        // Swagger 2.0 uses host + basePath
        if (swaggerData.host) {
            const protocol = swaggerData.schemes && swaggerData.schemes[0] || 'https'
            const basePath = swaggerData.basePath || ''
            return `${protocol}://${swaggerData.host}${basePath}`
        }

        // Fallback to empty string
        return ''
    }

    /**
     * Generate unique endpoint ID
     */
    generateId(path, method) {
        return `${method.toUpperCase()}_${path.replace(/\//g, '_').replace(/{|}/g, '')}`
    }

    /**
     * Extract parameters from endpoint
     */
    extractParameters(operation, swaggerData) {
        const parameters = []

        // Path, Query, Header, Cookie parameters
        if (operation.parameters) {
            operation.parameters.forEach(param => {
                const resolvedParam = this.resolveRef(param, swaggerData)
                parameters.push({
                    name: resolvedParam.name,
                    in: resolvedParam.in,
                    required: resolvedParam.required || false,
                    schema: this.resolveSchema(resolvedParam.schema, swaggerData),
                    description: resolvedParam.description || ''
                })
            })
        }

        // Request Body parameters
        if (operation.requestBody) {
            const body = this.resolveRef(operation.requestBody, swaggerData)
            const content = body.content || {}

            Object.entries(content).forEach(([mediaType, details]) => {
                if (mediaType.includes('json')) {
                    const schema = this.resolveSchema(details.schema, swaggerData)
                    const bodyParams = this.schemaToParameters(schema, 'body')
                    parameters.push(...bodyParams)
                }
            })
        }

        return parameters
    }

    /**
     * Extract request body schema
     */
    extractRequestBody(operation, swaggerData) {
        if (!operation.requestBody) return null

        const body = this.resolveRef(operation.requestBody, swaggerData)
        const content = body.content || {}

        for (const [mediaType, details] of Object.entries(content)) {
            if (mediaType.includes('json')) {
                return {
                    mediaType,
                    schema: this.resolveSchema(details.schema, swaggerData)
                }
            }
        }

        return null
    }

    /**
     * Extract responses
     */
    extractResponses(operation, swaggerData) {
        const responses = []
        const responsesData = operation.responses || {}

        Object.entries(responsesData).forEach(([code, details]) => {
            responses.push({
                code,
                description: details.description || ''
            })
        })

        return responses
    }

    /**
     * Resolve $ref references
     */
    resolveRef(obj, swaggerData) {
        if (!obj || !obj.$ref) return obj

        const refPath = obj.$ref.replace('#/', '').split('/')
        let resolved = swaggerData

        refPath.forEach(key => {
            resolved = resolved[key]
        })

        return resolved
    }

    /**
     * Resolve schema with all constraints
     */
    resolveSchema(schema, swaggerData) {
        if (!schema) return {}

        // Resolve $ref if present
        if (schema.$ref) {
            return this.resolveSchema(this.resolveRef(schema, swaggerData), swaggerData)
        }

        const result = {
            type: schema.type,
            format: schema.format,
            required: schema.required || []
        }

        // String constraints
        if (schema.type === 'string') {
            result.minLength = schema.minLength
            result.maxLength = schema.maxLength
            result.pattern = schema.pattern
            result.enum = schema.enum
        }

        // Number constraints
        if (['integer', 'number'].includes(schema.type)) {
            result.minimum = schema.minimum
            result.maximum = schema.maximum
            result.exclusiveMinimum = schema.exclusiveMinimum
            result.exclusiveMaximum = schema.exclusiveMaximum
        }

        // Array constraints
        if (schema.type === 'array') {
            result.items = this.resolveSchema(schema.items, swaggerData)
            result.minItems = schema.minItems
            result.maxItems = schema.maxItems
        }

        // Object properties
        if (schema.type === 'object' && schema.properties) {
            result.properties = {}
            Object.entries(schema.properties).forEach(([key, value]) => {
                result.properties[key] = this.resolveSchema(value, swaggerData)
            })
        }

        return result
    }

    /**
     * Convert schema to parameter list
     */
    schemaToParameters(schema, location) {
        const parameters = []

        if (schema.type === 'object' && schema.properties) {
            Object.entries(schema.properties).forEach(([key, value]) => {
                parameters.push({
                    name: key,
                    in: location,
                    required: schema.required?.includes(key) || false,
                    schema: value,
                    description: value.description || ''
                })
            })
        }

        return parameters
    }

    /**
     * Suggest relevant validations based on parameter schema
     */
    suggestValidations(parameter) {
        const suggestions = []
        const schema = parameter.schema

        // Required check
        if (parameter.required) {
            suggestions.push('REQUIRED_CHECK')
        }

        // String validations
        if (schema.type === 'string') {
            suggestions.push('WHITESPACE')

            if (schema.format === 'email') {
                suggestions.push('EMAIL_CHECK')
            }

            if (schema.format === 'phone' || parameter.name.toLowerCase().includes('phone')) {
                suggestions.push('PHONE_CHECK')
            }

            if (schema.maxLength) {
                suggestions.push('MAX_STRING')
            }

            if (schema.format === 'date' || schema.format === 'date-time') {
                suggestions.push('MIN_DATE', 'MAX_DATE')
            }
        }

        // Number validations
        if (['integer', 'number'].includes(schema.type)) {
            suggestions.push('NO_STRING')

            if (schema.minimum !== undefined) {
                suggestions.push('MIN_NUMBER')
            }

            if (schema.maximum !== undefined) {
                suggestions.push('MAX_NUMBER')
            }
        }

        return suggestions
    }
}

export default new SwaggerService()
