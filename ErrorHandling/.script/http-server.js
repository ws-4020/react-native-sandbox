const http = require('http');
http
  .createServer((req, res) => {
    const path = req.url;
    const parsed = parseInt(path.replace('/', ''));
    const statusCode = isNaN(parsed) ? 200 : parsed;
    res.writeHead(statusCode, {'Content-Type': 'text/html'});
    res.end(
      `<html lang="ja"><meta charset="utf-8"/><body>ステータスコードは${statusCode}です。<br><img src="http://localhost:3021" alt="img1"><img src="http://localhost:3000/400" alt="img2"></body></html>`,
    );
  })
  .listen(3000, () => console.log('Server http://localhost:3000'));
