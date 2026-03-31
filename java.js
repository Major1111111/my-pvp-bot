const { Bot, InlineKeyboard } = require("grammy");
const express = require('express');
const path = require('path');
const http = require('http'); // Добавили для работы сокетов
const { Server } = require("socket.io"); // Добавили socket.io

const bot = new Bot("8403757829:AAF4hUN5HOOlflO6NzRcLEBTd__T2e2AihE"); // Не забудь вставить токен

const app = express();
const server = http.createServer(app); // Создаем сервер через http
const io = new Server(server); // Подключаем сокеты к серверу

app.use(express.static(__dirname));

let onlineCount = 0; // Переменная для хранения онлайна

// Логика сокетов
io.on('connection', (socket) => {
  onlineCount++; // Кто-то зашел
  io.emit('updateOnline', onlineCount); // Рассылаем всем новое число

  socket.on('disconnect', () => {
    onlineCount--; // Кто-то вышел
    io.emit('updateOnline', onlineCount); // Обновляем у всех
  });
});

bot.command("start", async (ctx) => {
  try {
    await ctx.reply("Запускай PvP Рулетку!", {
      reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://your-mini-app-url.com"),
    });
  } catch (e) {
    console.error("Error start command");
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
// ВАЖНО: теперь запускаем server.listen, а не app.listen
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

bot.start();
