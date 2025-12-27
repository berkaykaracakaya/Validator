import express from 'express'

const router = express.Router()

// In-memory storage
const orders = [
    { id: 1, userId: 1, products: [1, 2], total: 1029.98, status: 'completed' }
]

let nextId = 2

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/', (req, res) => {
    // ❌ VALIDATION GAP: No enum validation on status
    // ❌ Should reject invalid status values
    let filtered = orders

    if (req.query.userId) {
        filtered = filtered.filter(o => o.userId === parseInt(req.query.userId))
    }

    if (req.query.status) {
        filtered = filtered.filter(o => o.status === req.query.status)
    }

    res.json(filtered)
})

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id))

    if (!order) {
        return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
})

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 */
router.post('/', (req, res) => {
    // ❌ VALIDATION GAPS:
    // ❌ No validation on userId (could be string)
    // ❌ No array length check on products
    // ❌ No minimum total check (should be > 0)
    // ❌ No enum validation on status
    const { userId, products, total, status } = req.body

    if (!userId || !products) {
        return res.status(400).json({ error: 'userId and products are required' })
    }

    const newOrder = {
        id: nextId++,
        userId,
        products,
        total: total || 0,
        status: status || 'pending'
    }

    orders.push(newOrder)
    res.status(201).json(newOrder)
})

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.put('/:id', (req, res) => {
    // ❌ VALIDATION GAPS: Same as POST
    const order = orders.find(o => o.id === parseInt(req.params.id))

    if (!order) {
        return res.status(404).json({ error: 'Order not found' })
    }

    Object.assign(order, req.body)
    res.json(order)
})

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted
 *       404:
 *         description: Order not found
 */
router.delete('/:id', (req, res) => {
    const index = orders.findIndex(o => o.id === parseInt(req.params.id))

    if (index === -1) {
        return res.status(404).json({ error: 'Order not found' })
    }

    orders.splice(index, 1)
    res.status(204).send()
})

export default router
