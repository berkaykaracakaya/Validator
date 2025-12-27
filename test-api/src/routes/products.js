import express from 'express'

const router = express.Router()

// In-memory storage
const products = [
    { id: 1, name: 'Laptop', price: 999.99, stock: 10, description: 'High-performance laptop' },
    { id: 2, name: 'Mouse', price: 29.99, stock: 50, description: 'Wireless mouse' }
]

let nextId = 3

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', (req, res) => {
    // ❌ VALIDATION GAP: No number validation on price parameters
    // ❌ Should reject string values for numbers
    let filtered = products

    if (req.query.minPrice) {
        filtered = filtered.filter(p => p.price >= parseFloat(req.query.minPrice))
    }

    if (req.query.maxPrice) {
        filtered = filtered.filter(p => p.price <= parseFloat(req.query.maxPrice))
    }

    res.json(filtered)
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id))

    if (!product) {
        return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 */
router.post('/', (req, res) => {
    // ❌ VALIDATION GAPS:
    // ❌ No whitespace check on name
    // ❌ No max length on name/description
    // ❌ No minimum price check (should be > 0)
    // ❌ No stock validation (should be >= 0)
    const { name, price, stock, description } = req.body

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' })
    }

    const newProduct = {
        id: nextId++,
        name,
        price,
        stock: stock || 0,
        description: description || ''
    }

    products.push(newProduct)
    res.status(201).json(newProduct)
})

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.put('/:id', (req, res) => {
    // ❌ VALIDATION GAPS: Same as POST
    const product = products.find(p => p.id === parseInt(req.params.id))

    if (!product) {
        return res.status(404).json({ error: 'Product not found' })
    }

    Object.assign(product, req.body)
    res.json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id))

    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' })
    }

    products.splice(index, 1)
    res.status(204).send()
})

export default router
