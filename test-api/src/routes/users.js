import express from 'express'

const router = express.Router()

// In-memory storage
const users = [
    { id: 1, username: 'john_doe', email: 'john@example.com', age: 30, phone: '+1234567890', bio: 'Software developer' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com', age: 25, phone: '+9876543210', bio: 'Designer' }
]

let nextId = 3

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: age
 *         schema:
 *           type: integer
 *         description: Filter by age
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', (req, res) => {
    // ❌ VALIDATION GAP: No validation on query parameters
    // ❌ Should check if age is a valid number
    // ❌ Should check maxLength on search
    let filtered = users

    if (req.query.age) {
        filtered = filtered.filter(u => u.age === parseInt(req.query.age))
    }

    if (req.query.search) {
        filtered = filtered.filter(u =>
            u.username.includes(req.query.search) ||
            u.email.includes(req.query.search)
        )
    }

    res.json(filtered)
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', (req, res) => {
    // ❌ VALIDATION GAP: No type checking on ID
    // ❌ Should reject string IDs
    const user = users.find(u => u.id === parseInt(req.params.id))

    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.post('/', (req, res) => {
    // ❌ VALIDATION GAPS:
    // ❌ No whitespace trimming on username/email
    // ❌ No email format validation
    // ❌ No phone format validation
    // ❌ No maxLength check on bio
    // ❌ No age range validation
    const { username, email, age, phone, bio } = req.body

    // Only basic required field check
    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' })
    }

    const newUser = {
        id: nextId++,
        username,
        email,
        age: age || null,
        phone: phone || null,
        bio: bio || null
    }

    users.push(newUser)
    res.status(201).json(newUser)
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put('/:id', (req, res) => {
    // ❌ VALIDATION GAPS: Same as POST
    const user = users.find(u => u.id === parseInt(req.params.id))

    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }

    Object.assign(user, req.body)
    res.json(user)
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id))

    if (index === -1) {
        return res.status(404).json({ error: 'User not found' })
    }

    users.splice(index, 1)
    res.status(204).send()
})

export default router
