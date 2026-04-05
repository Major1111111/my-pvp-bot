const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let players = [];
let timeLeft = 30; // Время таймера в секундах
let isSpinning = false;

// Функция для форматирования времени (0:30)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Главный цикл таймера (работает раз в секунду)
setInterval(() => {
    if (isSpinning) return;

    if (players.length >= 2) {
        // Если игроков 2 или больше — идет отсчет
        timeLeft--;
        
        if (timeLeft <= 0) {
            startSpin(); // Запуск рулетки
        } else {
            io.emit('timerUpdate', { 
                text: formatTime(timeLeft), 
                status: 'counting' 
            });
        }
    } else {
        // Если игроков меньше 2 — сброс таймера и режим ожидания
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

    // Сброс игры через 7 секунд после начала вращения
    setTimeout(() => {
        players = [];
        isSpinning = false;
        timeLeft = 30;
        io.emit('updatePlayers', players);
    }, 7000);
}

io.on('connection', (socket) => {
    console.log('Новое подключение');

    socket.on('joinGame', (userData) => {
        // Простая проверка, чтобы не добавлять одного и того же
        if (!players.find(p => p.id === userData.id)) {
            players.push(userData);
            io.emit('updatePlayers', players);
        }
    });

    socket.on('disconnect', () => {
        // Можно добавить удаление игрока при выходе, если нужно
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
