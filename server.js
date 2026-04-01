const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {}; 
let gameState = {
    status: 'waiting', 
    timer: 30,
    totalBank: 0,
    bets: []
};

const INITIAL_BALANCE = 10.0;

io.on('connection', (socket) => {
    socket.on('join', (userData) => {
        const id = userData.id;
        if (!players[id]) {
            players[id] = {
                id: id,
                name: userData.first_name || 'Игрок',
                balance: INITIAL_BALANCE
            };
        }
        socket.emit('init_data', { user: players[id], gameState });
    });

    socket.on('place_bet', (data) => {
        const { userId, amount } = data;
        const player = players[userId];
        const betAmount = parseFloat(amount);

        if (!player || betAmount < 0.1 || player.balance < betAmount || gameState.status === 'spinning') {
            return;
        }

        player.balance -= betAmount;
        
        const newBet = {
            userId,
            amount: betAmount,
            name: player.name,
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
        };

        gameState.bets.push(newBet);
        gameState.totalBank += betAmount;

        if (gameState.bets.length === 1 && gameState.status === 'waiting') {
            startTimer();
        }

        io.emit('update_game', { bets: gameState.bets, totalBank: gameState.totalBank });
        socket.emit('update_balance', player.balance);
    });
});

function startTimer() {
    gameState.status = 'betting';
    gameState.timer = 30;
    const interval = setInterval(() => {
        gameState.timer--;
        io.emit('timer_tick', gameState.timer);
        if (gameState.timer <= 0) {
            clearInterval(interval);
            calculateWinner();
        }
    }, 1000);
}

function calculateWinner() {
    if (gameState.bets.length === 0) {
        gameState.status = 'waiting';
        return;
    }
    gameState.status = 'spinning';
    let random = Math.random() * gameState.totalBank;
    let currentRange = 0;
    let winner = gameState.bets[0];

    for (let bet of gameState.bets) {
        currentRange += bet.amount;
        if (random <= currentRange) {
            winner = bet;
            break;
        }
    }

    players[winner.userId].balance += gameState.totalBank;
    io.emit('round_result', { winner, totalBank: gameState.totalBank });

    setTimeout(() => {
        gameState = { status: 'waiting', timer: 30, totalBank: 0, bets: [] };
        io.emit('game_reset', gameState);
    }, 8000);
}

server.listen(3001);
