const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let timeLeft = 30;
let isSpinning = false;
let onlineCount = 0;

setInterval(() => {
    // Таймер идет ТОЛЬКО если игроков 2 или больше
    if (players.length >= 2 && !isSpinning) {
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            startSpin();
        }
        io.emit('timerUpdate', timeLeft);
    } else {
        // Если игроков мало, сбрасываем таймер на 30 и ждем
        timeLeft = 30;
        io.emit('timerUpdate', timeLeft);
    }
}, 1000);

function startSpin() {
    isSpinning = true;
    const winnerSeed = Math.random();
    const totalBank = players.reduce((s, p) => s + p.amount, 0);
    
    let cumulative = 0;
    let winner = players[0];
    for (let p of players) {
        cumulative += p.amount / totalBank;
        if (winnerSeed <= cumulative) {
            winner = p;
            break;
        }
    }

    io.emit('startSpin', { seed: winnerSeed, winner: winner, bank: totalBank });
    
    setTimeout(() => {
        players = [];
        timeLeft = 30;
        isSpinning = false;
        io.emit('resetGame');
    }, 12000);
}

io.on('connection', (socket) => {
    onlineCount++;
    io.emit('onlineUpdate', onlineCount);
    socket.emit('init', { players, timeLeft });

    socket.on('makeBet', (data) => {
        if (isSpinning) return;

        // ЛОГИКА ОБЪЕДИНЕНИЯ: ищем игрока по username
        const existingPlayer = players.find(p => p.username === data.username);
        if (existingPlayer) {
            existingPlayer.amount += data.amount; // Прибавляем ставку к существующей
        } else {
            players.push(data); // Добавляем нового
        }
        
        io.emit('updatePlayers', players); // Рассылаем обновленный список всем
    });

    socket.on('disconnect', () => {
        onlineCount--;
        io.emit('onlineUpdate', onlineCount);
    });
});

server.listen(3000, () => console.log('Server started'));
