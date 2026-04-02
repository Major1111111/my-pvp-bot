const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

// Данные игроков (потом будем получать с сервера)
let players = [
    { name: "Ivan", bet: 500, color: "#FF5733" },
    { name: "Dmitry", bet: 300, color: "#33FF57" },
    { name: "Alex", bet: 200, color: "#3357FF" }
];

let totalBet = players.reduce((sum, p) => sum + p.bet, 0);
let startAngle = 0;

players.forEach(player => {
    // Вычисляем размер сектора в радианах
    let sliceAngle = (player.bet / totalBet) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    startAngle += sliceAngle;
});
