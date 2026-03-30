const { Bot, InlineKeyboard } = require("grammy");

const bot = new Bot("8403757829:AAF4hUN5HOOlflO6NzRcLEBTd__T2e2AihE");

// Команда для открытия Mini App
bot.command("start", async (ctx) => {
  await ctx.reply("Запускай PvP Рулетку!", {
    reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://your-mini-app-url.com"),
  });
});

// Обработка данных из Mini App
bot.on("message:web_app_data", async (ctx) => {
  const data = JSON.parse(ctx.message.web_app_data.data);
  
  if (data.action === 'bet') {
    await ctx.reply(`@${ctx.from.username} создал ставку на ${data.amount} 💸!`);
    // Тут логика поиска оппонента и старта игры
  }
});


 const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(Сервер работает на порте ${port});
});
bot.start(); 
