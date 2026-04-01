class Player {
    constructor(name) {
        this.name = name;
        this.balance = 1000; // начальный баланс
        this.bets = [];
    }

    placeBet(amount, type, numbers) {
        if (amount > this.balance) {
            console.log(${this.name} не может поставить ${amount}. Недостаточно средств.);
            return false;
        }
        this.bets.push({ amount, type, numbers });
        this.balance -= amount;
        console.log(${this.name} поставил ${amount} на ${type}: ${numbers.join(", ")});
        return true;
    }
}

class Roulette {
    constructor() {
        this.players = [];
        this.timer = null;
        this.betsCount = 0;
    }

    addPlayer(player) {
        this.players.push(player);
        console.log(Игрок ${player.name} добавлен.);
    }

    placeBet(player, amount, type, numbers) {
        if (player.placeBet(amount, type, numbers)) {
            this.betsCount++;
            if (this.betsCount === 2 && !this.timer) {
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
        const winningNumber = Math.floor(Math.random() * 37); // числа от 0 до 36
        console.log(Рулетка крутится... Выигрышный номер: ${winningNumber});
        
        this.determineWinners(winningNumber);
        this.endGame();
    }

    determineWinners(winningNumber) {
        this.players.forEach(player => {
            player.bets.forEach(bet => {
                let winnings = 0;
                switch (bet.type) {
                    case "straight":
                        if (bet.numbers.includes(winningNumber)) {
                            winnings = bet.amount * 35; // Прямые ставки
                        }
                        break;
                    case "split":
                        if (bet.numbers.length === 2 && bet.numbers.some(num => num === winningNumber)) {
                            winnings = bet.amount * 17; // Ставки на разделенные числа
                        }
                        break;
                    case "street":
                        if (bet.numbers.length === 3 && bet.numbers.some(num => num === winningNumber)) {
                            winnings = bet.amount * 11; // Ставки на улицу
                        }
                        break;
                    case "column":
                        // Здесь можно добавить логику для колонн
                        break;
                    case "color":
                        // Здесь можно добавить логику для цвета
                        break;
                    default:
                        break;
                }

                if (winnings > 0) {
                    player.balance += winnings + bet.amount; // возвращаем ставку + выигрыш
                    console.log(${player.name} выиграл ${winnings} за ставку на ${bet.type}: ${bet.numbers.join(", ")}. Новый баланс: ${player.balance});
                } else {
                                        console.log(${player.name} проиграл ставку на ${bet.type}: ${bet.numbers.join(", ")}.);
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
roulette.placeBet(player2, 200, "split", [17, 18]); // Запускает таймер

