const { Bot, InlineKeyboard } = require("grammy");

// Твой токен бота
const bot = new Bot("8403757829:AAF4hUN5HOOlflO6NzRcLEBTd__T2e2AihE");

// 1. Команда для открытия Mini App
bot.command("start", async (ctx) => {
  await ctx.reply("Запускай PvP Рулетку!", {
    reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://your-mini-app-url.com"),
  });
});

// 2. Обработка данных из Mini App
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    
    if (data.action === 'bet') {
      // ИСПРАВЛЕНО: Добавлены обратные кавычки (клавиша Ё)
      await ctx.reply(@${ctx.from.username} создал ставку на ${data.amount} 💸!);
    }
  } catch (e) {
    console.error("Ошибка парсинга данных:", e);
  }
});

// 3. Настройка Express сервера
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
}); 

const port = process.env.PORT || 3000;

// 4. Запуск сервера и бота
app.listen(port, "0.0.0.0", () => {
  // ИСПРАВЛЕНО: Добавлены обратные кавычки (клавиша Ё)
  console.log(Server is running on port ${port});
});

bot.start();
