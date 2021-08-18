const http = require('http');
http
  .createServer(async (req, res) => {
    const path = req.url;
    const resources = path.split('/');
    const type = resources[1].length ? resources[1] : 'api';
    const parsed = parseInt(resources[2]);
    const statusCode = isNaN(parsed) ? 200 : parsed;

    // タイムアウトの検証でSleepしたい場合はコメントを解除してください
    // await new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 1200000);
    // });

    if (type === 'webview') {
      let headers = {'Content-Type': 'text/html'};
      if (statusCode >= 300 && statusCode < 400) {
        headers = {...headers, Location: '/webview/200'};
      }
      res.writeHead(statusCode, headers);
      res.end(
        `<html lang="ja"><meta charset="utf-8"/><body>ステータスコードは${statusCode}です。<br><img src="http://localhost:3021" alt="img1"><img src="http://localhost:3000/400" alt="img2"></body></html>`,
      );
    } else {
      const method = req.method;
      let headers = {'Content-Type': 'application/json'};
      if (statusCode >= 300 && statusCode < 400) {
        headers = {...headers, Location: '/api/200'};
      }
      res.writeHead(statusCode, headers);
      if (400 <= statusCode) {
        res.end(`{"code": ${statusCode}, "message": "Error has occurred. method=[${method}]"}`);
        return;
      }
      res.end(`{"message": "success. status=[${statusCode}] method=[${method}]"}`);
    }
  })
  .on('connection', function (socket) {
    socket.on('data', function (chunk) {
      console.log(chunk.toString());
    });
  })
  .listen(3100, () => console.log('Server http://localhost:3100'));
