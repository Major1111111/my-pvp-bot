const express = require('express');
const app = express();

// 1. Настройка порта для Render
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Игра "Рулетка" запущена и работает!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Сервер активен на порту ${PORT}. Render увидит открытый порт.');
});

// --- Ваша логика игры ---

class Player {
    constructor(name) {
        this.name = name;
        this.balance = 10; 
        this.currentBet = 0;
    }

    placeBet(amount) {
        if (amount <= 0 || amount > this.balance) {
            console.log('Ошибка: ${this.name} ввел недопустимую сумму.');
            return;
        }
        this.currentBet = amount;
        this.balance -= amount;
    }

    win(amount) {
        this.balance += amount;
    }

    resetBet() {
        this.currentBet = 0;
    }
}

class RouletteGame {
    constructor() {
        this.players = [];
        this.roundTime = 30; 
    }

    addPlayer(name) {
        const player = new Player(name);
        this.players.push(player);
    }

    startRound() {
        console.log("===> Раунд начался! У игроков есть 30 секунд для ставок.");
        setTimeout(() => this.endRound(), this.roundTime * 1000);
    }

    endRound() {
        const totalBet = this.players.reduce((sum, player) => sum + player.currentBet, 0);
        
        if (totalBet === 0) {
            console.log("===> Никакие ставки не были сделаны.");
            // Запускаем проверку снова через 30 сек
            setTimeout(() => this.startRound(), 5000);
            return;
        }

        const winnerIndex = Math.floor(Math.random() * this.players.length);
        const winner = this.players[winnerIndex];
        
        // Исправлено: используем обратные кавычки  для вывода переменных
        console.log('===> Победитель: ${winner.name}');
        
        const winAmount = totalBet;
        winner.win(winAmount);

        this.players.forEach(player => {
            console.log( '===> [${player.name}]: ${player.balance} тонн' );
            player.resetBet();
        });

        // Запускаем новый раунд
        this.startRound();
    }
}

// Запуск игры
const game = new RouletteGame();
game.addPlayer("Игрок 1");
game.addPlayer("Игрок 2");

// Имитация ставок для теста
game.players[0].placeBet(5);
game.players[1].placeBet(3);

game.startRound();
