const ws = require('ws');
const fs = require('fs');
const https = require('https');
const uuid = require('uuid');

const server = new https.createServer({
  cert: fs.readFileSync('certs/server.crt'),
  key: fs.readFileSync('certs/server.key'),
  rejectUnauthorized: false,
});

const wss = new ws.Server({ server });
const clients = {};

function removeClient(name) {
  delete clients[name];
}
function sendOK(ws) {
  const jsonMessage = {
    "function": "response",
    "response": true
  }
  ws.send(JSON.stringify(jsonMessage));
}

wss.on('connection', function connection(ws, request, client) {
  var ClientName;

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    const message = JSON.parse(data);
    switch (message.function) {
      case "setAvaliable":
        ClientName = message.name
        if (!clients[ClientName]) {
          clients[ClientName] = ws;
          console.log(ClientName);
          sendOK(ws);
        } else {
          sendOK(ws);
          ws.close();
          // client.close();
        }
        // ws.send('Added ' + ClientName);
        break;
      case "removeAvaliable":
        console.log(ClientName);
        if (ClientName && clients[ClientName]) {
          removeClient(ClientName);
          sendOK(ws);
          // ws.send('Deleted' + ClientName);
        }
        break;
      case "messageClient":
        for (const [name, wsClient] of Object.entries(clients)) {
          if (name == message.toClient) {
            const jsonMessage = {
              "function": "recieveMessage",
              "fromClient": ClientName,
              "data": message.data,
            }
            wsClient.send(JSON.stringify(jsonMessage));
          }
        }
        sendOK(ws);
        break;
      case "sendClientCommand":
        for (const [name, wsClient] of Object.entries(clients)) {
          if (name == message.toClient) {
            const jsonMessage = {
              "function": "recieveMessage",
              "fromClient": ClientName,
              "command": message.command,
            }
            wsClient.send(JSON.stringify(jsonMessage));
          }
        }
        sendOK(ws);
        break;

      default:
        sendOK(ws);
        // ws.send("Ok!");
        break;
    }
  });

  ws.on('close', function close() {
    // Remove the WebSocket connection of the disconnected client
    if (ClientName && clients[ClientName]) {
      removeClient(ClientName);
      console.log("Deleted" + ClientName);
    }
  });

  sendOK(ws);
});

server.listen(8089);
server.setMaxListeners(0);
