const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let timeLeft = 60;
let isSpinning = false;

// Таймер на сервере (один для всех)
setInterval(() => {
    if (timeLeft > 0 && !isSpinning) {
        timeLeft--;
        io.emit('timerUpdate', timeLeft); // Отправляем время всем игрокам
    } else if (timeLeft === 0 && !isSpinning && players.length > 0) {
        startSpin();
    }
}, 1000);

function startSpin() {
    isSpinning = true;
    const winnerSeed = Math.random(); // Генерируем случайное число для победы
    io.emit('startSpin', winnerSeed); // Команда всем браузерам: "КРУТИТЕ!"
    
    // Через 10 секунд сбрасываем игру для нового раунда
    setTimeout(() => {
        players = [];
        timeLeft = 60;
        isSpinning = false;
        io.emit('resetGame');
    }, 10000);
}

io.on('connection', (socket) => {
    // Отправляем новому игроку текущее состояние
    socket.emit('init', { players, timeLeft });

    // Когда кто-то делает ставку
    socket.on('makeBet', (data) => {
        if (!isSpinning) {
            players.push(data);
            io.emit('newBet', data); // Сообщаем всем о новой ставке
        }
    });
});

server.listen(4000, () => {
    console.log('Сервер запущен! Адрес: http://localhost:3000');
});
