const socket = io();

// Элементы интерфейса
const timerElement = document.getElementById('timer');
const playersList = document.getElementById('players-list'); // Если есть список

// Слушаем обновление таймера от сервера
socket.on('timerUpdate', (data) => {
    if (timerElement) {
        timerElement.innerText = data.text;
        
        // Меняем стиль, если нужно
        if (data.status === 'waiting') {
            timerElement.style.color = "#888"; // Серый цвет в ожидании
            timerElement.style.fontSize = "20px";
        } else {
            timerElement.style.color = "#fff"; // Белый цвет при отсчете
            timerElement.style.fontSize = "32px";
        }
    }
});

// Слушаем начало вращения
socket.on('startSpin', (data) => {
    if (timerElement) {
        timerElement.innerText = "Крутим!";
        timerElement.style.color = "#f1c40f";
    }
    console.log("Победитель будет:", data.winner.name);
    // Здесь твоя анимация вращения колеса
});

// Обновление списка игроков
socket.on('updatePlayers', (players) => {
    console.log("Список игроков обновлен:", players);
    // Тут код отрисовки аватарок и процентов на круге
});

// Пример функции ставки (вызывать при клике на кнопку)
function makeBet() {
    const user = {
        id: "123", // Уникальный ID из Telegram
        name: "@bo4st",
        avatar: "url_to_photo"
    };
    socket.emit('joinGame', user);
}
