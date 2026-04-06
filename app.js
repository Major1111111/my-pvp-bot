const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ВАЖНО: Определяем путь к папке public
// '..' означает "выйти из текущей папки (molls) на уровень выше"
const publicPath = path.join(__dirname, '..', 'public');

// 1. Указываем, где искать стили и скрипты
app.use(express.static(publicPath));

// 2. Указываем путь к самому index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// --- Дальше идет твой старый код с сокетами ---

let players = []; 
let totalBank = 0;

io.on('connection', (socket) => {
    console.log('Игрок подключился:', socket.id);

    socket.on('place_bet', (data) => {
        const betAmount = parseFloat(data.amount);
        const existingPlayer = players.find(p => p.id === socket.id);
        
        if (existingPlayer) {
            existingPlayer.amount += betAmount;
        } else {
            players.push({ id: socket.id, amount: betAmount });
        }
        
        totalBank += betAmount;

        players = players.map(p => ({
            ...p,
            chance: ((p.amount / totalBank) * 100).toFixed(1)
        }));

        io.emit('update_game', { players, totalBank });

        if (players.length >= 2) {
            const randomDeg = Math.floor(Math.random() * 360) + 1440;
            io.emit('start_spin', { deg: randomDeg });
            
            setTimeout(() => {
                players = [];
                totalBank = 0;
                io.emit('update_game', { players, totalBank });
            }, 10000);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен! Порт: ${PORT}`);
});
