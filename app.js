const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = []; // Список активных игроков
let totalBank = 0;

io.on('connection', (socket) => {
    console.log('Игрок зашел:', socket.id);

    socket.on('place_bet', (data) => {
        // Добавляем игрока
        const betAmount = parseFloat(data.amount);
        players.push({ id: socket.id, amount: betAmount });
        totalBank += betAmount;

        // Пересчитываем шансы для всех
        players = players.map(p => ({
            ...p,
            chance: ((p.amount / totalBank) * 100).toFixed(1)
        }));

        // Отправляем всем обновленные данные
        io.emit('update_game', { players, totalBank });

        // Если игроков двое или больше — крутим через 3 секунды
        if (players.length >= 2) {
            const randomDeg = Math.floor(Math.random() * 360) + 1440; // Минимум 4 полных оборота
            io.emit('start_spin', { deg: randomDeg });
            
            // Очищаем банк после игры (через 10 сек)
            setTimeout(() => {
                players = [];
                totalBank = 0;
            }, 10000);
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
    });
});

server.listen(3000, () => {
    console.log('Сервер: http://localhost:3000');
});
