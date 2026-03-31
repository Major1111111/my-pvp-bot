const { Bot, InlineKeyboard } = require("grammy");
const express = require('express');
const path = require('path');
const http = require('http'); 
const { Server } = require("socket.io");

// ВСТАВЬ СВОЙ ТОКЕН НИЖЕ (в кавычках)
const bot = new Bot("8403757829:AAF4hUN5HOOlflO6NzRcLEBTd__T2e2AihE"); 

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

app.use(express.static(__dirname));

let onlineCount = 0; 

// Логика сокетов
io.on('connection', (socket) => {
  onlineCount++; 
  io.emit('updateOnline', onlineCount); 

  socket.on('disconnect', () => {
    onlineCount--; 
    io.emit('updateOnline', onlineCount); 
  });
});

bot.command("start", async (ctx) => {
  try {
    await ctx.reply("Запускай PvP Рулетку!", {
      reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://my-pvp-bot.onrender.com"), // Замени на свою ссылку
    });
  } catch (e) {
    console.error("Ошибка в команде start:", e);
  }
});

app.get('/', (req, res) => {
  // Убедись, что файл index.html лежит в этой же папке!
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;

server.listen(port, "0.0.0.0", () => {
  console.log('Сервер запущен на порту ${port}');
});

// Запуск бота
bot.start();
