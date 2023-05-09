const ws =  require('ws');
const fs =  require('fs');
// const server = createServer({
//     // cert: ws.readFileSync('certs/cert.pem'),
//     // key: ws.readFileSync('certs/key.pem'),
//     port: 8089
//   });
const wss = new ws.WebSocketServer({
    port: 8089,
    cert: fs.readFileSync('certs/server.crt'),
    key: fs.readFileSync('certs/server.key'),
});

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