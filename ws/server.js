const ws =  require('ws');
const fs =  require('fs');
const https =  require('https');
const server = new https.createServer({
    cert: fs.readFileSync('certs/server.crt'),
    key: fs.readFileSync('certs/server.key'),
    rejectUnauthorized: false,
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
var clients = [];
wss.on('connection', function connection(ws,request,client) {
  ws.on('error', console.error);
  const userId = uuid.v4();
  map.set(userId, ws);
//   clients.push(client);
//   console.log(clients);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        console.log(userId);
    }
  });

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
  ws.on('upgrade', (request, socket, head) => {
    const origin = request && request.headers && request.headers.origin;
    const corsRegex = /^https?:\/\/(.*\.?)abc\.com(:\d+)?\/$/g
    if (origin && origin.match(corsRegex) != null) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });


  ws.send('Welcome!');
});
server.listen(8089);
server.setMaxListeners(0);