const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs'); // Добавь этот модуль для проверки файлов

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Определяем путь к папке public
const publicPath = __dirname;

// --- ОТЛАДОЧНЫЙ ЛОГ (потом удалим) ---
console.log("Текущая папка (__dirname):", __dirname);
console.log("Ищу папку public по пути:", publicPath);

if (fs.existsSync(publicPath)) {
    console.log("✅ Папка public найдена!");
    console.log("Содержимое папки public:", fs.readdirSync(publicPath));
} else {
    console.log("❌ Папка public НЕ НАЙДЕНА по этому пути!");
    console.log("Содержимое корня проекта:", fs.readdirSync(path.join(__dirname, '..')));
}
// --------------------------------------

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`Файл index.html не найден по пути: ${indexPath}`);
    }
});

// ... дальше остальной код (io.on и т.д.)
