const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Этой строкой мы говорим серверу показывать файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Массив для хранения игроков
let players = [];

// Функция для инициализации игроков
function initializePlayers(numPlayers) {
    for (let i = 0; i < numPlayers; i++) {
        players.push({ id: i, tons: 10 }); // Каждому игроку по 10 тонн
    }
}

// Инициализируем 4 игроков (например)
initializePlayers(4);

// Если кто-то заходит на главную страницу, отдаем index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Сервер запущен! Адрес в браузере: http://localhost:${PORT}');
});
