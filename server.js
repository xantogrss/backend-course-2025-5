const { program } = require('commander');
const http = require('http');
const fs = require('fs').promises; // Використовуємо асинхронний fs [cite: 45]
const path = require('path');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <address>', 'address of the server')
  .requiredOption('-p, --port <number>', 'port of the server')
  .requiredOption('-c, --cache <path>', 'directory for cached files');

program.parse(process.argv);
const options = program.opts();

const server = http.createServer(async (req, res) => {
  const statusCode = req.url.slice(1); // отримуємо код (напр. 200) з шляху /200 [cite: 46]
  const filePath = path.join(options.cache, `${statusCode}.jpg`);

  try {
    if (req.method === 'GET') { [cite: 47]
      try {
        const data = await fs.readFile(filePath); [cite: 48]
        res.writeHead(200, { 'Content-Type': 'image/jpeg' }); [cite: 53, 54]
        return res.end(data);
      } catch {
        // Якщо в кеші нема — Частина 3: запит до http.cat [cite: 59]
        const response = await superagent.get(`https://http.cat/${statusCode}`); [cite: 61, 62]
        await fs.writeFile(filePath, response.body); [cite: 64]
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        return res.end(response.body);
      }
    } 
    
    else if (req.method === 'PUT') { [cite: 49]
      let body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', async () => {
        await fs.writeFile(filePath, Buffer.concat(body)); [cite: 50]
        res.writeHead(201); [cite: 53]
        res.end('Created');
      });
    } 
    
    else if (req.method === 'DELETE') { [cite: 50]
      await fs.unlink(filePath);
      res.writeHead(200);
      res.end('Deleted');
    } 
    
    else {
      res.writeHead(405); [cite: 50]
      res.end('Method Not Allowed');
    }
  } catch (err) {
    res.writeHead(404); [cite: 51, 63]
    res.end('Not Found');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});