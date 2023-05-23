//WEB CONSOLE
var ATLogs = "";
var Channel = 69;
var ChangingChannel = false;
async function printToConsole(msg, incoming = true) {
    // console.log(msg)
    if (!msg) return;
    if (msg.indexOf("\r") === -1) {
        msg = msg + "\r";
    }
    if (msg.indexOf("\n") === -1) {
        msg = msg + "\n";
    }
    outputElement.textContent += (incoming ? "GOT: " : "SENT: ") + msg
    outputElement.scrollTo(0, outputElement.scrollHeight)
    if (ATMode) {
        ATLogs += msg;
        if (ATLogs == "OK\r") {
            ATLogs = "";
            if (!ChangingChannel) {
                await writeToSerial("ATID " + Channel + "\r", true);
                ChangingChannel = true;
            } else {
                notyf.success("Changed Channels");
                ChangingChannel = false;
                ATMode = false;
                await setTimeout(async function () {
                    await writeToSerial("ATCN \r", true)
                }, 500);
            }
        }
    }
}
//END OF WEB CONSOLE
async function ChangeChannel(channel) {
    Channel = channel;
    ATMode = true;
    await setTimeout(async function () {
        await writeToSerial("+++", true);
    }, 1000);

}
var DistanceMemory = {}
var timeout;
function handleRumbleLogic(sensor, readout) {
    DistanceMemory[sensor] = readout;
    if (timeout || !rumble || !gamepad) return;
    // console.log("reading vars");
    if (DistanceMemory["PSMR"] >= 15 && DistanceMemory["PSML"] >= 15) {
        gamepad.vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 500,
            weakMagnitude: 1.0,
            strongMagnitude: 1.0,
        });
        // console.log('vibrating');
    }
    timeout = setTimeout(() => {
        timeout = null;
    }, 500);
}

function SendMessage() {
    var input = document.getElementById("TextInput")
    writeToSerial(input.value);
    printToConsole("SENT: " + input.value + "\r\n", false)
    input.value = "";
}

async function connect() {
    if (!navigator.serial) {
        outputElement.textContent = 'Web Serial API not supported.';
        return;
    }
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        HandleUiConnections("USB", true);
        while (port.readable) {
            try {
                const reader = port.readable.getReader();
                const { value, done } = await reader.read();
                reader.releaseLock();
                if (done) {
                    break;
                }
                var data = new TextDecoder().decode(value)
                printToConsole(data);
                HandleSpecialMessages(data);
            } catch (error) {
                HandleUiConnections("USB", false);
                console.error('Error reading from serial port:', error);
                break;
            }
        }
        await port.close();
    } catch (error) {
        console.error('Error connecting to serial device:', error);
    }
}
function HandleZumoSelector() {
    const dropdown = document.getElementById("ZumoSelector")
    ChangeChannel(dropdown.value);
}
async function writeToSerial(data, AT) {
    if (connectedClient) {
        messageWSUser(connectedClient, data);
        if (debug) {
            printToConsole("REMOTE: " + data, false);
        }
    }
    if (ATMode && !AT) return;
    if (!port) return;
    if (!port.writable) {
        HandleUiConnections("USB", false);
        console.error('Serial port not writable');
        return;
    }
    // console.log(data);

    try {
        const writer = port.writable.getWriter();
        const encodedData = new TextEncoder().encode(data);
        await writer.write(encodedData);
        writer.releaseLock();
        printToConsole(data, false);
    } catch (error) {
        console.error('Error writing to serial port:', error);
    }
}
//END OF COMM

//DATA EXTRACTION
function createChart() {
    var options = {
        series: [{
            name: 'Distance',
            data: [0,0,16,16,0,0]
        }, ],
        grid: {
            show: false,
        },
        chart: {
            height: 150,
            type: 'area',
            toolbar: {
                show: false,
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'text',
            categories: ["1","2","3","4","5","6"],
            labels: {
                show: false
              }
        },
        tooltip: {
            enabled: false,
        },
        yaxis: {
            type: 'text',
            min: 0,
            max: 16,
            labels: {
                show: false
              }
        },
    };

    distanceChart = new ApexCharts(document.querySelector("#DistanceChart"), options);

    distanceChart.render();
}
createChart();
function scale(number, inMin, inMax, outMin, outMax) {//StackOverflow
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
var LineSensorMemory = {};
var ProxSensorMemory = {};
function HandleIncoming(index, value) {
    if (connectedRemote) {
        WSDataFromZumo("*" + index + ":" + value + "*");
    }
    switch (index) {
        case "PSL":
        case "PSMLL":
        case "PSML":
        case "PSMR":
        case "PSMRR":
        case "PSR":
            if (!ProxSensorMemory[index] || ProxSensorMemory[index] != value) {//PS Changed
                ProxSensorMemory[index] = value;
                console.log("changed");
                handleRumbleLogic(index, value)
                // document.getElementById(index).style.height = scale(value, 0, 16, 0, 100) + "%";
                distanceChart.updateSeries([{
                    name: 'Distance',
                    data: [ProxSensorMemory["PSL"]??0,ProxSensorMemory["PSMLL"]??0,ProxSensorMemory["PSML"]??0,ProxSensorMemory["PSMR"]??0,ProxSensorMemory["PSMRR"]??0,ProxSensorMemory["PSR"]??0].reverse()
                  }])
            }
            break;
        case "LSL":
        case "LSML":
        case "LSM":
        case "LSMR":
        case "LSR":
            if (!LineSensorMemory[index] || LineSensorMemory[index] != value) {//LS Changed
                LineSensorMemory[index] = value;
                document.getElementById(index).style.height = scale(value, 0, 1000, 0, 100) + "%";
            }
            break;
        case "GX":
            document.getElementById(index).style.height = scale(value, -90, 90, 0, 100) + "%";
            break;
        case "hb":
            heartBeat = parseInt(value);
            break;
        case "bt":
            outputElement.textContent = "";
            break;
        case "initls":
            document.getElementById("LineTracking").checked = value == "0" ? false : true;
            break;
        case "initps":
            document.getElementById("DistanceTracking").checked = value == "0" ? false : true;
            break;
        case "initfls":
            document.getElementById("FollowLine").checked = value == "0" ? false : true;
            break;
        case "initclb":
            console.log("calibrated? " + (value == "0" ? false : true))
            // document.getElementById("DistanceTracking").checked = value == "0" ? false : true;
            break;
        default:
            break;
    }
}
function HandleSpecialMessages(msg) {
    if (!msg) return;
    messagepart += msg;
    const regex = /\*(.*?):(.*?)\*/g;
    let match;
    const result = [];

    while ((match = regex.exec(messagepart)) !== null) {
        result.push({ index: match[1], value: match[2] });
        messagepart = messagepart.replace("*" + match[1] + ":" + match[2] + "*", "");
    }
    if (result.length > 0) {
        result.forEach(element => {
            const index = element.index
            const value = element.value
            HandleIncoming(index, value);
        });
    }
    return result;
}
//END OF DATA EXTRACTION


const HeartBeatTime = 1000;
async function CheckHeartBeat() {
    if (port) {
        await writeToSerial("*hb:0*");
        var OldHeartBeat = heartBeat
        setTimeout(function () {
            if (OldHeartBeat == heartBeat) {
                HandleUiConnections("Zumo", false);
            } else {
                HandleUiConnections("Zumo", true);
            }
        }, HeartBeatTime + 500);
    }
}
setInterval(function () {
    CheckHeartBeat();
}, HeartBeatTime);