const tg = window.Telegram.WebApp;
tg.expand();

// Если сервер запущен на этом же домене, оставляем io(). 
// Если сервер на другом порту, например 3000, пишем io('http://localhost:3000')
const socket = io(); 

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let players = [];
let images = {};

// Функция отрисовки колеса
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
        ctx.beginPath();
        ctx.fillStyle = p.color || '#28a745';
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.fill();
        
        const img = images[p.photo];
        if (img && img.complete) {
            ctx.save();
            const middleAngle = startAngle + sliceAngle / 2;
            const imgX = centerX + Math.cos(middleAngle) * (radius * 0.65);
            const imgY = centerY + Math.sin(middleAngle) * (radius * 0.65);
            ctx.beginPath();
            ctx.arc(imgX, imgY, 30, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, imgX - 30, imgY - 30, 60, 60);
            ctx.restore();
        }
        startAngle += sliceAngle;
    });
}

// Слушатели событий от сервера
socket.on('updatePlayers', (p) => {
    players = p;
    const total = players.reduce((s, p) => s + p.amount, 0);
    const bankEl = document.getElementById('total-bank-amount');
    if(bankEl) bankEl.innerText = total.toFixed(2);
    
    const list = document.getElementById('player-list');
    if(list) {
        // ИСПРАВЛЕНО: Добавлены обратные кавычки для формирования строки
        list.innerHTML = players.map(p => 
            <div class="player-item">
                <img src="${p.photo || ''}" style="width:40px;height:40px;border-radius:50%;"/>
                <span>@${p.username}</span>
                <span>${p.amount} TON</span>
            </div>
        ).join('');
    }
    
    drawWheel(0);
});

// Таймер
socket.on('timerUpdate', (data) => {
    const timerEl = document.getElementById('timer');
    if(timerEl) timerEl.innerText = data.timeLeft;
});

// Работа с модальными окнами (кнопки из вашего HTML)
const makeBetBtn = document.getElementById('make-bet-btn');
if(makeBetBtn) {
    makeBetBtn.onclick = () => {
        const modal = document.getElementById('modal');
        if(modal) modal.style.display = 'flex';
    };
}

const closeBtn = document.getElementById('close-bet-modal-btn');
if(closeBtn) {
    closeBtn.onclick = () => {
        const modal = document.getElementById('modal');
        if(modal) modal.style.display = 'none';
    };
}

const confirmBtn = document.getElementById('confirm-bet-btn');
if(confirmBtn) {
    confirmBtn.onclick = () => {
        const amountInput = document.getElementById('bet-amount');
        const amount = amountInput ? amountInput.value : 0;
        socket.emit('placeBet', { amount: parseFloat(amount) });
        const modal = document.getElementById('modal');
        if(modal) modal.style.display = 'none';
    };
}
