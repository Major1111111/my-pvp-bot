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

let players = {}; 
let currentBets = []; 
let timer = 30;
let isSpinning = false;

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
    timer = 30; 
    return;
  }

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

  players[winner.id] = (players[winner.id] || 1000) + totalBank;

  io.emit('winnerInfo', { 
    winner, 
    totalBank, 
    winningTicket: random,
    bets: currentBets 
  });

  setTimeout(() => {
    currentBets = [];
    timer = 30;
    isSpinning = false;
  }, 10000);
}

io.on('connection', (socket) => {
  socket.on('initPlayer', (data) => {
    if (!players[data.id]) players[data.id] = 1000;
    socket.emit('updateBalance', players[data.id]);
  });

  socket.on('placeBet', (data) => {
    if (isSpinning) return;
    let currentBalance = players[data.id] || 1000;
    if (currentBalance >= data.amount) {
      players[data.id] = currentBalance - data.amount;
      currentBets.push({ id: data.id, name: data.name, amount: data.amount, photo: data.photo });
      io.emit('newBet', currentBets);
      socket.emit('updateBalance', players[data.id]);
    }
  });
});

bot.command("start", async (ctx) => {
  await ctx.reply("Запускай PvP Рулетку! Твой баланс: 1000 TON", {
    reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://onrender.com"), 
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
