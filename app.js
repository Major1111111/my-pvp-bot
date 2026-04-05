const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = [];
let timeLeft = 30; // Время до начала игры
let isSpinning = false;
let gameId = 123456;

// Логика таймера
setInterval(() => {
    if (players.length > 0 && !isSpinning) {
        timeLeft--;
        if (timeLeft <= 0) {
            startSpin();
        }
    }
    io.emit('timerUpdate', { timeLeft: formatTime(timeLeft), gameId });
}, 1000);

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startSpin() {
    isSpinning = true;
    const totalBank = players.reduce((sum, p) => sum + p.amount, 0);
    
    // Выбор победителя (случайно на основе веса ставки)
    let random = Math.random() * totalBank;
    let winner = players[0];
    for (let p of players) {
        if (random < p.amount) {
            winner = p;
            break;
        }
        random -= p.amount;
    }

    const seed = Math.floor(Math.random() * 1000000);
    io.emit('startSpin', { seed, winner, bank: totalBank * 0.95 }); // 5% комиссия

    // Сброс через 10 секунд после начала вращения
    setTimeout(() => {
        players = [];
        timeLeft = 30;
        isSpinning = false;
        gameId++;
        io.emit('resetGame');
    }, 10000);
}

io.on('connection', (socket) => {
    console.log('User connected');
    socket.emit('updatePlayers', players);

    socket.on('makeBet', (data) => {
        if (isSpinning) return;
        
        // Проверка: если игрок уже есть, добавляем к ставке
        const existingPlayer = players.find(p => p.username === data.username);
        if (existingPlayer) {
            existingPlayer.amount += data.amount;
        } else {
            players.push({
                username: data.username,
                photo: data.photo,
                amount: data.amount,
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
            });
        }
        io.emit('updatePlayers', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
