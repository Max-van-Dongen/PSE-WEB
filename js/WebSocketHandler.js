var ws;
var canSend = false;
var connectedClient;
function sendOK(resp = true) {
    const jsonMessage = {
        "function": "response",
        "response": true
    }
    ws.send(JSON.stringify(jsonMessage));
}

function connectWS() {
    ws = new WebSocket(
        "wss://ws.prsonal.nl/",
    );
    ws.onerror = (event) => {
        console.log("WebSocket error: ", event);
    };
    ws.onopen = (event) => {
        document.getElementById("WSCONN").checked = true;
        const body = {
            "function": "setAvaliable",
            "name": document.getElementById("wsName").value,
        }
        canSend = true;
        notyf.success("Connected to WS");
        ws.send(JSON.stringify(body));
    };
    ws.onclose = (event) => {
        if (ws && canSend) {
            document.getElementById("WSCONN").checked = false;
            canSend = false;
            notyf.error("Connection to WS lost,reconnecting!");
            ws = null;
            setTimeout(connectWS(), 2000);
        }
    };

    ws.onmessage = (event) => {
        console.log(event.data);
        const message = JSON.parse(event.data);
        switch (message.function) {
            case "recieveCommand":
                writeToSerial(message.command);
                console.log(message.command);
                sendOK();
                break;
            case "listOfUsers":
                removeOptions(wsClientsElement);
                addOption(wsClientsElement,"Select Client","");
                message.users.forEach(clientName => {
                    addOption(wsClientsElement,clientName,clientName);
                });
                console.log(message.users);
                sendOK();
                break;
            default:
                break;
        }
    };

}

function ConnectWSClient() {
    connectedClient = wsClientsElement.value;
    console.log(connectedClient);
}

function messageWSUser(user, msg) {
    if (canSend) {
        const jsonMessage = {
            "function": "sendClientCommand",
            "toClient": user,
            "command": msg,
        }
        ws.send(JSON.stringify(jsonMessage));
        // ws.send(msg);
    }
}
// function testmsg(client) {
//     const jsonMessage = {
//         "function": "sendClientCommand",
//         "toClient": client,
//         "data": "*h:0*",
//     }
//     ws.send(JSON.stringify(jsonMessage));
// }
function startWS() {
    if (document.getElementById("wsName").value == "") {
        document.getElementById("wsName").value = randomName() + "-" + randomName() + "-" + randomName() + "-" + randomName();
    }
    if (!ws) {
        connectWS();
    }
}