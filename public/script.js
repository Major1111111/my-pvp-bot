javascript
const socket = io();
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let players = [];
let images = {};

socket.on('timerUpdate', (data) => {
    document.getElementById('timer').innerText = data.timeLeft;
});

socket.on('updatePlayers', (p) => {
    players = p;
    const total = players.reduce((s, pl) => s + pl.amount, 0);
    document.getElementById('total-bank-amount').innerText = total.toFixed(2);
    
    // Отрисовка списка
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(pl => `
        <div class="player-item">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${pl.photo}">
                <span>@${pl.username}</span>
            </div>
            <span>${pl.amount} TON</span>
        </div>
    `).join('');

    // Предзагрузка фото
    players.forEach(pl => {
        if (!images[pl.photo]) {
            const img = new Image();
            img.src = pl.photo;
            img.onload = () => drawWheel(0);
            images[pl.photo] = img;
        }
    });
    drawWheel(0);
});

function drawWheel(rotation) {
    const total = players.reduce((s, pl) => s + pl.amount, 0);
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
    players.forEach(pl => {
        const sliceAngle = (pl.amount / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.fillStyle = pl.color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.fill();

        // Рисуем фото внутри
        const middleAngle = startAngle + sliceAngle / 2;
        const imgX = centerX + Math.cos(middleAngle) * (radius * 0.65);
        const imgY = centerY + Math.sin(middleAngle) * (radius * 0.65);
        
        if (images[pl.photo]) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(imgX, imgY, 25, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(images[pl.photo], imgX - 25, imgY - 25, 50, 50);
            ctx.restore();
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        startAngle += sliceAngle;
    });
}

socket.on('startSpin', (data) => {
    let start = null;
    const duration = 6000;
    const totalRotation = Math.PI * 15 + (data.seed % 10);

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        drawWheel(totalRotation * ease);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
});

document.getElementById('make-bet-btn').onclick = () => {
    const amount = parseFloat(prompt("Введите ставку TON:", "0.1"));
    if (amount > 0) {
        socket.emit('makeBet', {
            username: "User" + Math.floor(Math.random()*100),
            photo: "https://via.placeholder.com/100",
            amount: amount
        });
    }
};

socket.on('resetGame', () => {
    players = [];
    drawWheel(0);
});
