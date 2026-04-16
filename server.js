const express = require('express')
const cors = require('cors')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000

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

app.post('/register', (req, res) => {
    const { username, password } = req.body

    let users = load('users.json')

    if (users.find(u => u.username === username)) {
        return res.json({ success: false })
    }

    users.push({ username, password })
    save('users.json', users)

    res.json({ success: true })
})

app.post('/login', (req, res) => {
    const { username, password } = req.body

    let users = load('users.json')

    const user = users.find(u => u.username === username && u.password === password)

    res.json({ success: !!user })
})

app.post('/score', (req, res) => {
    const { username, score } = req.body

    let scores = load('scores.json')

    scores.push({ username, score })
    save('scores.json', scores)

    res.json({ success: true })
})

app.post('/stats', (req, res) => {
    const { username, score } = req.body

    let stats = load('stats.json')

    let user = stats.find(s => s.username === username)

    if (user) {
        user.games += 1
        user.total += score
        if (score > user.high) user.high = score
    } else {
        stats.push({
            username,
            games: 1,
            total: score,
            high: score
        })
    }

    save('stats.json', stats)

    res.json({ success: true })
})

app.get('/leaderboard', (req, res) => {
    let scores = load('scores.json')

    scores.sort((a, b) => b.score - a.score)

    res.json(scores.slice(0, 10))
})

app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})