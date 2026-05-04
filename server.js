const express = require('express')
const cors = require('cors')
const fs = require('fs')
const bcrypt = require('bcrypt')
const app = express()
const PORT = process.env.PORT || 3000
const SALT_ROUNDS = 10

app.set('trust proxy', true)

app.use(cors())
app.use(express.json())

function load(file) {
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file))
}

function save(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

app.get('/', (req, res) => {
    res.send("Snake Game Server Running")
})

app.get('/register', async (req, res) => {
    const username = req.query.username
    const password = req.query.password

    if (!username || !password) {
        return res.json({ success: false, reason: "Missing username or password" })
    }

    let users = load('users.json')

    if (users.find(u => u.username === username)) {
        return res.json({ success: false, reason: "Username already taken" })
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    users.push({ username, password: hash })
    save('users.json', users)

    res.json({ success: true })
})

app.get('/login', async (req, res) => {
    const username = req.query.username
    const password = req.query.password

    if (!username || !password) {
        return res.json({ success: false, reason: "Missing username or password" })
    }

    let users = load('users.json')
    const user = users.find(u => u.username === username)

    if (!user) {
        return res.json({ success: false, reason: "User not found" })
    }

    const match = await bcrypt.compare(password, user.password)
    res.json({ success: match })
})

app.get('/score', (req, res) => {
    const username = req.query.username
    const score = Number(req.query.score)

    if (!username || isNaN(score)) {
        return res.json({ success: false })
    }

    let scores = load('scores.json')
    scores.push({ username, score })
    save('scores.json', scores)

    res.json({ success: true })
})

app.get('/stats', (req, res) => {
    const username = req.query.username
    const score = Number(req.query.score)

    if (!username || isNaN(score)) {
        return res.json({ success: false })
    }

    let stats = load('stats.json')
    let user = stats.find(s => s.username === username)

    if (user) {
        user.games += 1
        user.total += score
        if (score > user.high) user.high = score
    } else {
        stats.push({ username, games: 1, total: score, high: score })
    }

    save('stats.json', stats)
    res.json({ success: true })
})

app.get('/stats/:username', (req, res) => {
    const username = req.params.username
    let stats = load('stats.json')
    let user = stats.find(s => s.username === username)
    res.json(user || {})
})

app.get('/scores', (req, res) => {
    let scores = load('scores.json')
    scores.sort((a, b) => b.score - a.score)
    res.json(scores.slice(0, 10))
})

app.get('/users', (req, res) => {
    let users = load('users.json')
    res.json(users.map(u => u.username))
})

app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})

app.get('/users/full', (req, res) => {
    let users = load('users.json')
    res.json(users)
})