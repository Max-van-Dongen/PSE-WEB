const ws =  require('ws');
const fs =  require('fs');
const https =  require('https');
const server = new https.createServer({
    cert: fs.readFileSync('certs/server.crt'),
    key: fs.readFileSync('certs/server.key'),
    // port: 8089,
  });
//   console.log('');
// const wss = new ws.WebSocketServer({
//     port: 8089,
//     cert: fs.readFileSync('certs/server.crt'),
//     key: fs.readFileSync('certs/server.key'),
// });
const wss = new ws.Server({ server });
// console.log(wss);

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    if (data == "hoi") {
        ws.send("hello");
    }
    if (data == "doei") {
        ws.send("goodbye");
    }
    // ws.send('something');
  });

  ws.send('Welcome!');
});
server.listen(8089);