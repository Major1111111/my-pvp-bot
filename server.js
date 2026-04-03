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
    if (timeLeft > 0 && !isSpinning) {
        timeLeft--;
        io.emit('timerUpdate', timeLeft);
    } else if (timeLeft === 0 && !isSpinning && players.length > 0) {
        startSpin();
    }
}, 1000);

function startSpin() {
    isSpinning = true;
    const winnerSeed = Math.random(); // Число от 0 до 1
    
    // Считаем общую ставку
    const totalBank = players.reduce((s, p) => s + p.amount, 0);
    let cumulative = 0;
    let winner = players[0];

    // Определяем победителя на сервере заранее
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
    }, 12000); // Даем время на анимацию и показ победителя
}

io.on('connection', (socket) => {
    onlineCount++;
    io.emit('onlineUpdate', onlineCount);

    socket.emit('init', { players, timeLeft });

    socket.on('makeBet', (data) => {
        if (!isSpinning) {
            players.push(data);
            io.emit('newBet', data);
        }
    });

    socket.on('disconnect', () => {
        onlineCount--;
        io.emit('onlineUpdate', onlineCount);
    });
});

server.listen(3000, () => console.log('Work on port 3000'));
