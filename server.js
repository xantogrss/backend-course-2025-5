const { program } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <address>', 'address of the server')
  .requiredOption('-p, --port <number>', 'port of the server')
  .requiredOption('-c, --cache <path>', 'directory for cached files');

program.parse(process.argv);
const options = program.opts();

const server = http.createServer(async (req, res) => {
  const statusCode = req.url.slice(1);
  const filePath = path.join(options.cache, `${statusCode}.jpg`);

  try {
    if (req.method === 'GET') {
      try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        return res.end(data);
      } catch {
        const response = await superagent.get(`https://http.cat/${statusCode}`);
        await fs.writeFile(filePath, response.body);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        return res.end(response.body);
      }
    } 
    else if (req.method === 'PUT') {
      let body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', async () => {
        await fs.writeFile(filePath, Buffer.concat(body));
        res.writeHead(201);
        res.end('Created');
      });
    } 
    else if (req.method === 'DELETE') {
      await fs.unlink(filePath);
      res.writeHead(200);
      res.end('Deleted');
    } 
    else {
      res.writeHead(405);
      res.end('Method Not Allowed');
    }
  } catch (err) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});