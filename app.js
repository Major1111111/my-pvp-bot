const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Сообщаем Express, что статика (картинки, стили) в папке public
app.use(express.static(path.join(__dirname, 'public')));

// Отдаем главный файл из папки public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Логика игры через сокеты
io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);

    socket.on('place_bet', (data) => {
        console.log('Ставка получена:', data);
        // Тут можно добавить логику начала игры, когда игроков станет 2+
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log('Для запуска в консоли пиши: node app.js');
});
