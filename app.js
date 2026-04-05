const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// 1. Указываем Express, что статические файлы (CSS, JS, картинки) лежат в папке public
app.use(express.static(path.join(__dirname, 'public')));

let players = [];
let timeLeft = 30; 
let isSpinning = false;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 2. Исправленный путь к главной странице (ищем index.html ВНУТРИ папки public)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Таймер и логика игры
setInterval(() => {
    if (isSpinning) return;

    if (players.length >= 2) {
        timeLeft--;
        if (timeLeft <= 0) {
            startSpin();
        } else {
            io.emit('timerUpdate', { 
                text: formatTime(timeLeft), 
                status: 'counting' 
            });
        }
    } else {
        timeLeft = 30;
        io.emit('timerUpdate', { 
            text: 'Ожидание игроков...', 
            status: 'waiting' 
        });
    }
}, 1000);

function startSpin() {
    isSpinning = true;
    const winner = players[Math.floor(Math.random() * players.length)];
    io.emit('startSpin', { winner });

    setTimeout(() => {
        players = [];
        isSpinning = false;
        timeLeft = 30;
        io.emit('updatePlayers', players);
    }, 7000);
}

io.on('connection', (socket) => {
    socket.on('joinGame', (userData) => {
        if (!players.find(p => p.id === userData.id)) {
            players.push(userData);
            io.emit('updatePlayers', players);
        }
    });
});

// 3. Динамический порт для Render (обязательно process.env.PORT)
const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
    console.log('Сервер запущен на порту ${PORT}');
});
