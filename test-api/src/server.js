import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import userRoutes from './routes/users.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const app = express()
const PORT = 4000

// Middleware
app.use(cors())
app.use(express.json())

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Test API - Intentional Validation Gaps',
            version: '1.0.0',
            description: 'API with intentional validation issues for testing the Swagger API Validator',
            contact: {
                name: 'Test API',
                email: 'test@example.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'username'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        username: {
                            type: 'string',
                            description: 'Username',
                            minLength: 3,
                            maxLength: 50
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email'
                        },
                        age: {
                            type: 'integer',
                            description: 'User age',
                            minimum: 0,
                            maximum: 150
                        },
                        phone: {
                            type: 'string',
                            description: 'Phone number'
                        },
                        bio: {
                            type: 'string',
                            description: 'User biography'
                        }
                    }
                },
                Product: {
                    type: 'object',
                    required: ['name', 'price'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Product ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Product name'
                        },
                        price: {
                            type: 'number',
                            description: 'Product price',
                            minimum: 0
                        },
                        stock: {
                            type: 'integer',
                            description: 'Stock quantity'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    required: ['userId', 'products'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Order ID'
                        },
                        userId: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        products: {
                            type: 'array',
                            items: {
                                type: 'integer'
                            },
                            description: 'Product IDs'
                        },
                        total: {
                            type: 'number',
                            description: 'Total amount'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'completed', 'cancelled'],
                            description: 'Order status'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Test API is running',
        swagger: `http://localhost:${PORT}/api-docs`,
        swaggerJson: `http://localhost:${PORT}/api-docs-json`
    })
})

// Serve Swagger JSON
app.get('/api-docs-json', (req, res) => {
    res.json(swaggerSpec)
})

app.listen(PORT, () => {
    console.log(`🚀 Test API running on http://localhost:${PORT}`)
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`)
    console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs-json`)
    console.log('')
    console.log('⚠️  This API intentionally has validation gaps for testing!')
})
