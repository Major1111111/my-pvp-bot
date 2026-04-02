const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let timeLeft = 30; // Установили 30 секунд
let isSpinning = false;

setInterval(() => {
    if (timeLeft > 0 && !isSpinning) {
        timeLeft--;
        io.emit('timerUpdate', timeLeft);
    } else if (timeLeft === 0 && !isSpinning && players.length > 0) {
        startSpin();
    }
}, 1000);

function startSpin() {
    isSpinning = true;
    const winnerSeed = Math.random(); 
    io.emit('startSpin', winnerSeed);
    
    setTimeout(() => {
        players = [];
        timeLeft = 30; // Сброс на 30 секунд
        isSpinning = false;
        io.emit('resetGame');
    }, 10000);
}

io.on('connection', (socket) => {
    socket.emit('init', { players, timeLeft });
    socket.on('makeBet', (data) => {
        if (!isSpinning) {
            players.push(data);
            io.emit('newBet', data);
        }
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
