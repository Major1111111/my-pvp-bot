// 1. Инициализация необходимых переменных (пример данных)
const canvas = document.getElementById('wheelCanvas'); // Убедитесь, что в HTML есть <canvas id="wheelCanvas"></canvas>
const ctx = canvas.getContext('2d');
const images = {};
const players = [
    { username: 'Player1', photo: 'https://placeholder.com', amount: 100, color: '#ff4500' },
    { username: 'Player2', photo: 'https://placeholder.com', amount: 200, color: '#1e90ff' }
];
const currentGameId = "12345";
// 2. Логика загрузки изображений
players.forEach(p => {
    const img = new Image();

    img.onload = () => {
        images[p.photo] = img;
        drawWheel(); // Убрали 'e', если она не определена
    };

    img.onerror = () => {
        console.warn('Failed to load image for ${p.username}: ${p.photo}');
        const placeholder = new Image();
        placeholder.src = "https://placeholder.com"; // Проверьте этот URL
        placeholder.onload = () => {
            images[p.photo] = placeholder;
            drawWheel(); 
        };
    };

    img.src = p.photo; // Запуск загрузки
});

// 3. Функция отрисовки колеса
function drawWheel(rotation) {
    const total = players.reduce((s, p) => s + p.amount, 0);
    const centerX = 250, centerY = 250, radius = 240; 
    ctx.clearRect(0, 0, 500, 500); 
    
    if (players.length === 0) {
        ctx.beginPath();
        ctx.fillStyle = '#1c1c1e';
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    let startAngle = rotation - Math.PI / 2; 
    players.forEach(p => {
        const slice = (p.amount / total) * Math.PI * 2; 
        ctx.beginPath(); 
        ctx.fillStyle = p.color || '#cccccc'; 
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + slice);
        ctx.fill();
        
        ctx.strokeStyle = '#2c2c2e'; 
        ctx.lineWidth = 2; 
        ctx.stroke();

        // Отрисовка аватара игрока
        if (images[p.photo] && images[p.photo].complete) {
            ctx.save(); 
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + slice / 2);
            ctx.beginPath(); 
            ctx.arc(radius * 0.75, 0, 25, 0, Math.PI * 2); 
            ctx.clip(); 
            ctx.drawImage(images[p.photo], radius * 0.75 - 25, -25, 50, 50);
            ctx.restore();
        }
        startAngle += slice; 
    });
}

// 4. Функция анимации
function animateWheel(seed, winner, bank) {
    console.log('Starting wheel animation with seed:', seed, 'winner:', winner.username);
    let start = null;
    const duration = 6000; 
    const totalRotation = (20 + (seed % 10)) * Math.PI * 2; 

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); 
        const currentRotation = ease * totalRotation; 
        drawWheel(currentRotation); 

        if (progress < 1) {
            requestAnimationFrame(step); 
        } else {
            showWinnerUI(winner, bank);
        }
    }
    requestAnimationFrame(step); 
}

// 5. Функция отображения UI победителя (проверьте ID элементов в HTML)
function showWinnerUI(winner, bank) {
    const elId = document.getElementById('win-game-id');
    const elImg = document.getElementById('win-u-img');
    const elNick = document.getElementById('win-u-nick');
    const elSum = document.getElementById('win-u-sum');
    const elCard = document.getElementById('win-card-sum');

    if (elId) elId.innerText = currentGameId;
    if (elImg) elImg.src = winner.photo;
    if (elNick) elNick.innerText = winner.username; // Исправлены кавычки
    if (elSum) elSum.innerText = bank.toFixed(2);
    if (elCard) elCard.innerText = bank.toFixed(2);
}

// Первичная отрисовка
drawWheel(0);
