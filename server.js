class Player {
    constructor(name) {
        this.name = name;
        this.balance = 1000;
        this.bets = [];
    }

    placeBet(amount, type, numbers) {
        if (amount > this.balance) {
            console.log('${this.name} не может поставить ${amount}. Недостаточно средств.');
            return false;
        }
        this.bets.push({ amount, type, numbers });
        this.balance -= amount;
        console.log('${this.name} поставил ${amount} на ${type}: ${numbers.join(", ")}');
        return true;
    }
}

class Roulette {
    constructor() {
        this.players = [];
        this.timer = null;
    }

    addPlayer(player) {
        this.players.push(player);
        console.log('Игрок ${player.name} добавлен.');
    }

    placeBet(player, amount, type, numbers) {
        if (player.placeBet(amount, type, numbers)) {
            // Проверяем количество ставок
            const totalBets = this.players.reduce((count, p) => count + p.bets.length, 0);
            if (totalBets === 2 && !this.timer) {
                this.startTimer();
            }
        }
    }

    startTimer() {
        console.log("Таймер запущен на 30 секунд.");
        this.timer = setTimeout(() => {
            console.log("Время вышло! Ставки больше не принимаются.");
            this.spinRoulette();
        }, 30000);
    }

    spinRoulette() {
        const winningNumber = Math.floor(Math.random() * 37); // Рулетка от 0 до 36
        console.log('Рулетка крутится... Выигрышный номер: ${winningNumber}');
        this.determineWinners(winningNumber);
        this.endGame();
    }

    determineWinners(winningNumber) {
        this.players.forEach(player => {
            player.bets.forEach(bet => {
                const payouts = { straight: 35, split: 17, street: 11 }; // Выплаты для различных типов ставок
                const winnings = bet.numbers.includes(winningNumber) ? bet.amount * (payouts[bet.type] || 0) : 0;
                if (winnings > 0) {
                    player.balance += winnings + bet.amount; // Возвращаем ставку и добавляем выигрыш
                    console.log('${player.name} выиграл ${winnings} за ставку на ${bet.type}: ${bet.numbers.join(", ")}. Новый баланс: ${player.balance}');
                } else {
                    console.log('${player.name} проиграл ставку на ${bet.type}: ${bet.numbers.join(", ")}.');
                }
            });
        });
    }

    endGame() {
        clearTimeout(this.timer);
        this.timer = null;
        console.log("Игра завершена. Подсчет результатов...");
    }
}

// Пример использования
const roulette = new Roulette();
const player1 = new Player("Игрок 1");
const player2 = new Player("Игрок 2");

roulette.addPlayer(player1);
roulette.addPlayer(player2);

// Игроки делают ставки
roulette.placeBet(player1, 100, "straight", [7]);
roulette.placeBet(player2, 200, "split", [17, 18]);
