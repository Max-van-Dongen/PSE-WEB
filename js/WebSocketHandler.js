var ws;
var canSend = false;
function ConnectWS() {
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
        document.getElementById("WSCONN").checked = false;
        canSend = false;
        notyf.error("Connection to WS lost");
        ws = null;
    };

    ws.onmessage = (event) => {
        console.log(event.data);
        const message = JSON.parse(event.data);
        switch (message.function) {
            case "recieveCommand":
                console.log(message.command);
                break;

            default:
                break;
        }
    };

}

function SendWS(msg) {
    if (canSend) {
        ws.send(msg);
    }
}
function StartWS() {
    if (document.getElementById("wsName").value == "") {
        document.getElementById("wsName").value = randomName() + "-" + randomName() + "-" + randomName() + "-" + randomName();
    }
    if (!ws) {
        ConnectWS();
    }
}