const ws = require('ws');
const fs = require('fs');
const https = require('https');
const uuid = require('uuid');

const clients = new Map(); // Map to store the WebSocket connections with their UUIDs

const server = new https.createServer({
    cert: fs.readFileSync('certs/server.crt'),
    key: fs.readFileSync('certs/server.key'),
    rejectUnauthorized: false,
});

const wss = new ws.Server({ server });
wss.on('connection', function connection(ws, request, client) {
    const clientId = uuid.v4(); // Generate a unique UUID for the client
    clients.set(clientId, ws); // Add the WebSocket connection to the clients map
    console.log(`Client connected: ${clientId}`);

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
        if (data == 'hoi') {
            ws.send('hello');
        }
        if (data == 'doei') {
            ws.send('goodbye');
        }
        if (data == 'hey') {
            clients.forEach((clientWs, clientUUID) => {
                if (clientUUID !== clientId) { // Don't send the message back to the sender
                    clientWs.send(`Client ${clientId} says: hey`);
                }
            });
        }
    });

    ws.on('close', function close() {
        // Remove the WebSocket connection of the disconnected client
        clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
    });

    ws.send('Welcome!');
});

server.listen(8089);
server.setMaxListeners(0);
