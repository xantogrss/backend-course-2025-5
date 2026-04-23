const { program } = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Налаштування аргументів командного рядка
program
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

// 2. Створення директорії кешу, якщо її не існує
if (!fs.existsSync(options.cache)) {
  fs.mkdirSync(options.cache, { recursive: true });
}

// 3. Створення сервера
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

// 4. Запуск сервера на вказаному хості та порту
server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}/`);
  console.log(`Директорія кешу: ${options.cache}`);
});