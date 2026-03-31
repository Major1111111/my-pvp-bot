const { Bot, InlineKeyboard } = require("grammy");
const express = require('express');
const http = require('http'); 
const { Server } = require("socket.io");

const bot = new Bot("YOUR_BOT_TOKEN"); 
const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

app.use(express.static(__dirname));

let players = {}; 
let currentBets = []; 
let timer = 30;
let isSpinning = false;
let onlineCount = 0;

// Список ярких цветов для игроков
const colors = ["#FF3B30", "#007AFF", "#34C759", "#FFCC00", "#AF52DE", "#5856D6", "#FF9500"];

setInterval(() => {
  if (currentBets.length >= 2 && timer > 0 && !isSpinning) {
    timer--;
    io.emit('timerUpdate', { timer, isSpinning });
  } 
  
  if (timer === 0 && !isSpinning && currentBets.length >= 2) {
    startDraw();
  }
}, 1000);

function startDraw() {
  isSpinning = true;
  const totalBank = currentBets.reduce((sum, b) => sum + b.amount, 0);
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

  players[winner.id] += totalBank; // Исправлено: добавление к балансу

  io.emit('winnerInfo', { 
    winner, 
    totalBank, 
    rotation: 2000 + Math.floor(Math.random() * 500)
  });

  setTimeout(() => {
    currentBets = [];
    timer = 30;
    isSpinning = false;
    io.emit('newBet', { bets: [], totalBank: 0 });
  }, 10000);
}

io.on('connection', (socket) => {
  onlineCount++;
  io.emit('onlineUpdate', onlineCount);

  socket.on('initPlayer', (data) => {
    if (!players[data.id]) players[data.id] = 1000;
    socket.emit('updateBalance', players[data.id]);
  });

  socket.on('placeBet', (data) => {
    if (isSpinning) return;

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) return;

    let balance = players[data.id] || 1000; // Исправлено: получение баланса
    if (balance >= amount) {
      players[data.id] -= amount; // Исправлено: уменьшение баланса
      
      let existing = currentBets.find(b => b.id === data.id);
      if (existing) {
        existing.amount += amount;
      } else {
        currentBets.push({ 
          id: data.id, 
          name: data.name, 
          amount: amount, 
          color: colors[currentBets.length % colors.length] 
        });
      }
      
      const totalBank = currentBets.reduce((sum, b) => sum + b.amount, 0);
      io.emit('newBet', { bets: currentBets, totalBank });
      socket.emit('updateBalance', players[data.id]);
    }
  });

  socket.on('disconnect', () => { onlineCount--; io.emit('onlineUpdate', onlineCount); });
});

bot.command("start", (ctx) => {
  ctx.reply("🎰 PvP Рулетка: Баланс 1000 TON зачислен!", {
    reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://onrender.com"), 
  });
});

server.listen(process.env.PORT || 3000); // Исправлено: оператор || для порта
bot.start();
