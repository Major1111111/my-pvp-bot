// Получаем ссылки на DOM-элементы
const wheel = document.getElementById('wheel');
const timerDisplay = document.getElementById('timer');
const poolDisplay = document.getElementById('pool-amount');

// Список игроков (в реальности эти данные придут с сервера)
let players = [
    { name: "Player1", bet: 10, color: "#34c759", avatar: "https://i.pravatar.cc/100?img=1" },
    { name: "Player2", bet: 2, color: "#007aff", avatar: "https://i.pravatar.cc/100?img=2" },
    { name: "Player3", bet: 1.5, color: "#ff3b30", avatar: "https://i.pravatar.cc/100?img=3" }
];

function updateWheel() {
    // Проверка, что poolDisplay существует
    if (!poolDisplay) {
        console.error("Элемент 'pool-amount' не найден.");
        return;
    }

    const totalBet = players.reduce((sum, p) => sum + p.bet, 0);
    poolDisplay.innerText = totalBet.toFixed(2);

    let currentPercent = 0;
    let gradientArray = [];

    // Проверка, что wheel существует
    if (!wheel) {
        console.error("Элемент 'wheel' не найден.");
        return;
    }

    wheel.innerHTML = ''; // Очищаем старые аватарки

    players.forEach(player => {
        const share = (player.bet / totalBet) * 100;
        const startDeg = (currentPercent / 100) * 360;
        const endDeg = ((currentPercent + share) / 100) * 360;

        // Добавляем сектор в градиент (ИСПРАВЛЕНО: добавлены обратные кавычки)
        gradientArray.push(`${player.color} ${currentPercent}% ${currentPercent + share}%`);

        // Считаем угол для аватарки (середина сектора)
        const middleAngle = startDeg + (endDeg - startDeg) / 2;
        placeAvatar(player.avatar, middleAngle);

        currentPercent += share;
    });

    // Рисуем цветные сектора (ИСПРАВЛЕНО: добавлены обратные кавычки)
    wheel.style.background = `conic-gradient(${gradientArray.join(', ')})`;
}

function placeAvatar(imgUrl, angle) {
    // Проверка, что wheel существует
    if (!wheel) {
        console.error("Элемент 'wheel' не найден. Невозможно разместить аватар.");
        return;
    }

    const img = document.createElement('div');
    img.className = 'player-avatar';
    // ИСПРАВЛЕНО: добавлены обратные кавычки
    img.style.backgroundImage = `url(${imgUrl})`;
    
    // Вынос аватарки на 100px от центра
    const radius = 100; 
    // Формула: поворот -> вынос -> возврат поворота (чтобы лицо не было боком)
    // ИСПРАВЛЕНО: добавлены обратные кавычки
    img.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
    
    wheel.appendChild(img);
}

// Простой таймер
let seconds = 15;
function startCountdown() {
    // Проверка, что timerDisplay существует
    if (!timerDisplay) {
        console.error("Элемент 'timer' не найден.");
        return;
    }

    const itv = setInterval(() => {
        seconds--;
        // ИСПРАВЛЕНО: добавлены обратные кавычки
        timerDisplay.innerText = `00:${seconds < 10 ? '0' + seconds : seconds}`;
        if (seconds <= 0) {
            clearInterval(itv);
            spinWheel(Math.random() * 360 + 1440); // Крутим минимум на 4 оборота
        }
    }, 1000);
}

function spinWheel(deg) {
    // Проверка, что wheel существует
    if (!wheel) {
        console.error("Элемент 'wheel' не найден. Невозможно вращать колесо.");
        return;
    }
    // ИСПРАВЛЕНО: добавлены обратные кавычки
    wheel.style.transform = `rotate(${deg}deg)`;
}

// Запуск при загрузке
updateWheel();
startCountdown();
