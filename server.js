const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Этой строкой мы говорим серверу показывать файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Если кто-то заходит на главную страницу, отдаем index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен! Адрес в браузере: http://localhost:${PORT}`);
});
