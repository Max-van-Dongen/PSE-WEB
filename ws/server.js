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
const kickProtect = {};
function removeClient(name) {
  delete clients[name];
}
function sendOK(ws, resp = true) {
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
        if (!clients[ClientName]) {//check for no duplicate users
          clients[ClientName] = ws;
          console.log(ClientName);
          const response = {
            "function": "listOfUsers",
            "users": [],
          }
          for (const [name, wsClient] of Object.entries(clients)) {
            if (name != ClientName) {
              response["users"].push(name);
            }
          }
          for (const [name, wsClient] of Object.entries(clients)) {
            if (name != ClientName) {
              ws.send(JSON.stringify(response));
            } else {
              sendOK(ws);
            }
          }
        } else {//duplicate found
          sendOK(ws, false);
          kickProtect[ClientName] = true;//protect first user from being kicked by the duplicate user leaving with ws.on('close')
          ws.close();
        }
        break;
      case "removeAvaliable":
        console.log(ClientName);
        if (ClientName && clients[ClientName]) {
          removeClient(ClientName);
          sendOK(ws);
        }
        break;
      case "messageClient":
        if (clients[message.toClient]) {
          const jsonMessage = {
            "function": "recieveMessage",
            "fromClient": ClientName,
            "data": message.data,
          }
          clients[message.toClient].send(JSON.stringify(jsonMessage));
          sendOK(ws);
        } else {
          sendOK(ws, false);
        }
        break;
      case "sendClientCommand":
        if (clients[message.toClient]) {
          const jsonMessage = {
            "function": "recieveCommand",
            "fromClient": ClientName,
            "command": message.command,
          }
          clients[message.toClient].send(JSON.stringify(jsonMessage));
          sendOK(ws);
        } else {
          sendOK(ws, false);
        }
        break;
      default:
        sendOK(ws, false);
        break;
    }
  });

  ws.on('close', function close() {
    if (kickProtect[ClientName]) {//prevent duplicate user from deleting the origional user
      kickProtect[ClientName] = false;
      return;
    }
    if (ClientName && clients[ClientName]) {
      removeClient(ClientName);
      console.log("Deleted" + ClientName);
    }
  });

  sendOK(ws);
});

server.listen(8089);
server.setMaxListeners(0);
console.log("Starting Server!");