const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// --- ВАЖНАЯ СТРОЧКА: она заставляет сервер видеть ваши файлы (index.html, script.js) ---
app.use(express.static(__dirname)); 

let players = [];
let timeLeft = 30; 
let isSpinning = false;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер запущен! Ссылка: http://localhost:${PORT}`);
});
