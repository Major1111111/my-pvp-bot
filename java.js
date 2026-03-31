class Player {
    constructor(name) {
        this.name = name;
        this.balance = 10; // начальный баланс
        this.currentBet = 0;
    }

    placeBet(amount) {
        if (amount <= 0 || amount > this.balance) {
            throw new Error("Недопустимая сумма ставки.");
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
        this.roundTime = 30; // время раунда в секундах
    }

    addPlayer(name) {
        const player = new Player(name);
        this.players.push(player);
    }

    startRound() {
        console.log("Раунд начался! У игроков есть 30 секунд для ставок.");
        setTimeout(() => this.endRound(), this.roundTime * 1000);
    }

    endRound() {
        const totalBet = this.players.reduce((sum, player) => sum + player.currentBet, 0);
        
        if (totalBet === 0) {
            console.log("Никакие ставки не были сделаны.");
            return;
        }

        const winnerIndex = Math.floor(Math.random() * this.players.length);
        const winner = this.players[winnerIndex];
        
        console.log('Победитель: ${winner.name}');
        
        // Определяем выигрыш
        const winAmount = totalBet; // вся сумма ставок
        winner.win(winAmount);

        // Сбрасываем ставки
        this.players.forEach(player => player.resetBet());
        
        // Выводим балансы
        this.players.forEach(player => {
            console.log('${player.name}: ${player.balance} тонн');
        });

        // Запускаем новый раунд
        this.startRound();
    }
}

// Пример использования
const game = new RouletteGame();
game.addPlayer("Игрок 1");
game.addPlayer("Игрок 2");

// Игроки делают ставки
game.players[0].placeBet(5);
game.players[1].placeBet(3);

// Начинаем раунд
game.startRound();
