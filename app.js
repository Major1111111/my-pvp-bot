const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
// Render сам назначает порт через process.env.PORT
const PORT = process.env.PORT || 3000;

// ПУТЬ К ПАПКЕ PUBLIC:
// __dirname — это папка, где лежит этот файл (app.js). 
// Мы просто добавляем к ней 'public'.
const publicPath = path.join(__dirname, 'public');

// --- БЛОК ДИАГНОСТИКИ (поможет увидеть ошибки в логах) ---
console.log('=== ДИАГНОСТИКА ЗАПУСКА ===');
console.log('Текущая папка сервера:', __dirname);
console.log('Пытаюсь найти папку public здесь:', publicPath);

if (fs.existsSync(publicPath)) {
    console.log('✅ Папка public найдена!');
    console.log('Содержимое папки public:', fs.readdirSync(publicPath));
} else {
    console.log('❌ ОШИБКА: Папка public НЕ НАЙДЕНА по пути:', publicPath);
}
console.log('============================');
// --- КОНЕЦ БЛОКА ДИАГНОСТИКИ ---

// Раздаем статические файлы из папки public
app.use(express.static(publicPath));

// Если пользователь зашел на главную страницу, отдаем index.html
app.get('*', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Ошибка: Файл index.html не найден в папке public!');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
