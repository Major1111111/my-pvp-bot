javascript
const socket = io();
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let players = [];
let images = {};

// Обновление общего банка на верхней панели
function updateTotalBank() {
    const total = players.reduce((s, p) => s + p.amount, 0);
    document.getElementById('total-bank-amount').innerText = total.toFixed(2);
}
socket.on('timerUpdate', (data) => {
    document.getElementById('timer').innerText = data.timeLeft;
    // Здесь можно высчитывать stroke-dashoffset для анимации круга вокруг таймера
});

socket.on('updatePlayers', (p) => {
    players = p;
    updateTotalBank();
    updateUI();
});

function updateUI() {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="player-item">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.photo}">
                <span>@${p.username}</span>
            </div>
            <span>${p.amount} TON</span>
        </div>
    `).join('');

    players.forEach(p => {
        if(!images[p.photo]) {
            const img = new Image();
            img.src = p.photo;
            img.onload = () => drawWheel(0);
            images[p.photo] = img;
        }
    });
    drawWheel(0);
}

function drawWheel(rotation) {
    const total = players.reduce((s, p) => s + p.amount, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (players.length === 0) {
        ctx.beginPath();
        ctx.fillStyle = '#1c1d21';
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    let startAngle = rotation - Math.PI / 2;

    players.forEach(p => {
        const sliceAngle = (p.amount / total) * Math.PI * 2;
        
        // Рисуем сегмент
        ctx.beginPath();
        ctx.fillStyle = p.color || '#28a745';
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.fill();
        ctx.closePath();

        // Рисуем аватар игрока внутри сегмента
        const img = images[p.photo];
        if (img && img.complete) {
            ctx.save();
            // Находим центр сегмента для размещения фото
            const middleAngle = startAngle + sliceAngle / 2;
            const imgX = centerX + Math.cos(middleAngle) * (radius * 0.65);
            const imgY = centerY + Math.sin(middleAngle) * (radius * 0.65);

            ctx.beginPath();
            ctx.arc(imgX, imgY, 30, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, imgX - 30, imgY - 30, 60, 60);
            ctx.restore();
            
            // Золотая рамка для фото (как на скрине)
            ctx.beginPath();
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.arc(imgX, imgY, 30, 0, Math.PI * 2);
            ctx.stroke();
        }

        startAngle += sliceAngle;
    });
}

// Функция вращения (аналогична предыдущей, но с вызовом drawWheel)
socket.on('startSpin', (data) => {
    let start = null;
    const duration = 5000;
    const totalRotation = Math.PI * 10 + (data.seed % Math.PI);

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        drawWheel(totalRotation * ease);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
});

// Кнопка ставки
document.getElementById('make-bet-btn').onclick = () => {
    document.getElementById('modal').style.display = 'flex';
};
