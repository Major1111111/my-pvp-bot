const { Bot, InlineKeyboard } = require("grammy");
const express = require('express');
const path = require('path');
const http = require('http'); 
const { Server } = require("socket.io");

const bot = new Bot("8403757829:AAF4hUN5HOOlflO6NzRcLEBTd__T2e2AihE"); 
const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

app.use(express.static(__dirname));

let players = {}; // Балансы игроков { userId: 1000 }
let currentBets = []; // Ставки в текущем раунде
let timer = 30;
let isSpinning = false;

// Игровой цикл (каждые 30 секунд)
setInterval(() => {
  if (timer > 0) {
    timer--;
  } else if (!isSpinning) {
    startDraw();
  }
  io.emit('timerUpdate', { timer, isSpinning });
}, 1000);

function startDraw() {
  if (currentBets.length < 2) {
    timer = 30; // Ждем игроков
    return;
  }

  isSpinning = true;
  const totalBank = currentBets.reduce((sum, b) => sum + b.amount, 0);
  
  // Логика выбора победителя (чем больше ставка, тем выше шанс)
  let random = Math.random() * totalBank;
  let currentSum = 0;
  let winner = currentBets[0];

  for (let bet of currentBets) {
    currentSum += bet.amount;
    if (random <= currentSum) {
      winner = bet;
      break;
    }
  }

  // Начисляем выигрыш
  players[winner.id] = (players[winner.id] || 1000) + totalBank;

  io.emit('winnerInfo', { 
    winner, 
    totalBank, 
    winningTicket: random,
    bets: currentBets 
  });

  // Сброс раунда через 10 сек после анимации
  setTimeout(() => {
    currentBets = [];
    timer = 30;
    isSpinning = false;
  }, 10000);
}

io.on('connection', (socket) => {
  // При подключении выдаем 1000 TON если новый игрок
  socket.on('initPlayer', (data) => {
    if (!players[data.id]) players[data.id] = 1000;
    socket.emit('updateBalance', players[data.id]);
  });

  socket.on('placeBet', (data) => {
    if (isSpinning) return;
    if (players[data.id] >= data.amount) {
      players[data.id] -= data.amount;
      currentBets.push({ id: data.id, name: data.name, amount: data.amount, photo: data.photo });
      io.emit('newBet', currentBets);
      socket.emit('updateBalance', players[data.id]);
    }
  });
});

bot.command("start", async (ctx) => {
  await ctx.reply("Запускай PvP Рулетку! Твой баланс: 1000 TON", {
    reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://my-pvp-bot.onrender.com"), 
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log('Сервер запущен на порту ${port}');
});

bot.start();
