const { Bot, InlineKeyboard } = require("grammy");

const bot = new Bot("YOUR_BOT_TOKEN");

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

bot.start();
