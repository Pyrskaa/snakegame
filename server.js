const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
let users = {};
let leaderboard = [];

try {
    users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
} catch (e) {
    users = {};
}

try {
    leaderboard = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8'));
} catch (e) {
    leaderboard = [];
}

function saveUsers() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

function saveLeaderboard() {
    fs.writeFileSync('leaderboard.json', JSON.stringify(leaderboard, null, 2));
}

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ error: 'Missing fields' });
    if (users[username]) return res.status(400).send({ error: 'User exists' });

    users[username] = { password: password };
    saveUsers();
    res.send({ success: true });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!users[username] || users[username].password !== password) {
        return res.status(400).send({ error: 'Invalid credentials' });
    }
    res.send({ success: true });
});

app.post('/score', (req, res) => {
    const { username, score } = req.body;
    if (!username || typeof score !== 'number') return res.status(400).send({ error: 'Invalid data' });
    leaderboard.push({ username, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); 
    saveLeaderboard();
    res.send({ success: true });
});

app.get('/leaderboard', (req, res) => {
    res.send(leaderboard);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});