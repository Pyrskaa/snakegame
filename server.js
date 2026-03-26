const express = require('express')
const bcrypt = require('bcrypt')
const fs = require('fs')
const app = express()
app.use(express.json())
const USERS_FILE = 'users.json'
const SCORES_FILE = 'scores.json'
const STATS_FILE = 'stats.json'

function load(file) {
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file))
}

function save(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

app.post('/register', async (req,res)=>{
    const {username, password} = req.body
    let users = load(USERS_FILE)
    if(users.find(u=>u.username===username)) return res.json({success:false, msg:"User exists"})
    const hash = await bcrypt.hash(password,10)
    users.push({username, password: hash})
    save(USERS_FILE, users)
    res.json({success:true})
})

app.post('/login', async (req,res)=>{
    const {username,password} = req.body
    let users = load(USERS_FILE)
    const user = users.find(u=>u.username===username)
    if(!user) return res.json({success:false})
    const match = await bcrypt.compare(password, user.password)
    res.json({success:match})
})

app.post('/score', (req,res)=>{
    const {username, score} = req.body
    let scores = load(SCORES_FILE)
    let entry = scores.find(s=>s.username===username)
    if(entry) {
        if(score>entry.score) entry.score = score
    } else {
        scores.push({username, score})
    }
    save(SCORES_FILE, scores)
    res.json({success:true})
})

app.post('/stats',(req,res)=>{
    const {username, score} = req.body
    let stats = load(STATS_FILE)
    let entry = stats.find(s=>s.username===username)
    if(entry){
        entry.games = (entry.games||0)+1
        entry.total_score = (entry.total_score||0)+score
        entry.high_score = Math.max(entry.high_score||0,score)
    } else {
        stats.push({username, games:1, total_score:score, high_score:score})
    }
    save(STATS_FILE, stats)
    res.json({success:true})
})

app.get('/scores',(req,res)=>{
    let scores = load(SCORES_FILE)
    scores.sort((a,b)=>b.score - a.score)
    res.json(scores)
})

app.get('/stats/:username',(req,res)=>{
    const username = req.params.username
    let stats = load(STATS_FILE)
    const entry = stats.find(s=>s.username===username)
    res.json(entry||{games:0,total_score:0,high_score:0})
})

app.listen(3000,()=>console.log("Server running on http://localhost:3000"))