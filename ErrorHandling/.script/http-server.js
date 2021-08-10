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

    res.writeHead(statusCode, {'Content-Type': 'text/html'});
    if (type === 'webview') {
      res.end(
        `<html lang="ja"><meta charset="utf-8"/><body>ステータスコードは${statusCode}です。<br><img src="http://localhost:3021" alt="img1"><img src="http://localhost:3000/400" alt="img2"></body></html>`,
      );
    } else {
      if (400 <= statusCode) {
        res.end(`{"errorCode": ${statusCode}, "message": "Error has occurred."}`);
        return;
      }
      res.end('{"message": "success"}');
    }
  })
  .listen(3000, () => console.log('Server http://localhost:3000'));
