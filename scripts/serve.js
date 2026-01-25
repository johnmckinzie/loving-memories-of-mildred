const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 8000;
const baseDir = path.resolve(__dirname, '..', '_site');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function sendNotFound(res) {
  res.statusCode = 404;
  res.end('Not found');
}

function sendServerError(res) {
  res.statusCode = 500;
  res.end('Server error');
}

// Minimal static file server using only Node built-ins.
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = path.normalize(urlPath).replace(/^([.][.][\\/])+/, '');
  let filePath = path.join(baseDir, safePath);

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      return sendNotFound(res);
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        return sendNotFound(res);
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.statusCode = 200;
      res.end(data);
    });
  });
});

server.on('clientError', (_err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

fs.access(baseDir, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Cannot read _site at ${baseDir}. Did you run the build?`);
    process.exit(1);
  }

  server.listen(port, () => {
    console.log(`Serving _site at http://localhost:${port}`);
  });
});
