const { Bot, InlineKeyboard } = require("grammy");
const express = require('express');
const path = require('path');

const bot = new Bot("8403757829:AAF4hUN5HOOlflO6NzRcLEBTd__T2e2AihE");

bot.command("start", async (ctx) => {
  try {
    await ctx.reply("Запускай PvP Рулетку!", {
      reply_markup: new InlineKeyboard().webApp("Играть 🎮", "https://your-mini-app-url.com"),
    });
  } catch (e) {
    console.error("Error start command");
  }
});

bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    if (data.action === 'bet') {
      // Убрали все сложные кавычки и переменные из строки, чтобы не было SyntaxError
      await ctx.reply("Ставка создана!"); 
    }
  } catch (e) {
    console.error("JSON error");
  }
});

const app = express();
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Фиксируем порт для Render
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("Server is running");
});

bot.start();
