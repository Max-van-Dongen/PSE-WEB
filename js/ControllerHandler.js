//KEYBOARD FUNCTIONS
var holdingDown = [];
function HandleInputCounts(key, updown) {
    if (updown == "keydown") {
        if (!holdingDown.includes(key)) {
            holdingDown.push(key);
        }
    } else {
        if (holdingDown.includes(key)) {
            holdingDown = holdingDown.filter(e => e !== key);
        }
    }
}
//END OF KEYBOARD FUNCTIONS


window.addEventListener('keyup', (event) => {
    const tagName = event.target.tagName.toLowerCase();
    console.log(tagName);
    if (tagName === 'textarea' || tagName === 'input') {
        // Ignore the event when typing in a textbox
        return;
    }
    // console.log(holdingDown);
    const key = event.key.toUpperCase();
    switch (key) {
        case 'W':
        case 'A':
        case 'S':
        case 'D':
            HandleInputCounts(key, "keyup");
            break;
        case 'SHIFT':
            printToConsole("No Turbo :(\n");
            turbo = false;
            break;

        default:
            break;
    }
    console.log("up: " + key);
});

//KEYBOARD
window.addEventListener('keydown', (event) => {
    const tagName = event.target.tagName.toLowerCase();
    if (event.repeat) return;
    if (tagName === 'textarea') {
        // Ignore the event when typing in a textbox
        return;
    }
    // console.log(holdingDown);
    const key = event.key.toUpperCase();
    switch (key) {
        case 'SHIFT':
            printToConsole("TURBO!!!!\n");
            turbo = true;
            break;
        case 'ALT':
        case 'CONTROL':
        case 'TAB':
        case 'F5':
        case 'MEDIAPLAYPAUSE':
        case 'META':
            //do nothing
            break;

        default:
            HandleInputCounts(key, "keydown");
            writeToSerial(key.toLowerCase());
            break;
    }
    // console.log("down: " + key)
});


//GAMEPAD FUNCTIONS
var layout =
{
    0: "padDown",
    1: "padRight",
    2: "padLeft",
    3: "padUp",
    4: "L1",
    5: "R1",
    6: "ThrottleLeft",
    7: "ThrottleRight",
    10: "JoyLPress",
    11: "JoyRPress",
    12: "dpadUp",
    13: "dpadDown",
    14: "dpadLeft",
    15: "dpadRight",
    100: "JoyLX",
    101: "JoyLY",
    102: "JoyRX",
    103: "JoyRY",
};
var holdingDownController = [];
var ThrottleMemory = {
    "ThrottleLeft": 0,
    "ThrottleRight": 0,
};
var AxisMemory = {
    "JoyLX": 0,
    "JoyLY": 0,
    "JoyRX": 0,
    "JoyRY": 0,
    "ThrottleLeft": 0,
    "ThrottleRight": 0,
};
var holdingDownControllerAxes = [];
async function HandleControllerInputCounts(key, pressed, value = 0) {
    if (pressed) {
        if (!holdingDownController.includes(key)) {
            if (key != "ThrottleLeft" && key != "ThrottleRight") {
                holdingDownController.push(key);
            }
            // console.log("pressed controller: " + key + value);
            switch (key) {
                case 'padUp':
                    toggleFF();
                    var Button = document.getElementById("ForceFeedback")
                    Button.checked = !Button.checked
                    break;
                case 'L1':
                    await writeToSerial('*q:0*')
                    var Button = document.getElementById("LineTracking")
                    Button.checked = !Button.checked
                    break;
                case 'R1':
                    await writeToSerial('*l:0*')
                    var Button = document.getElementById("DistanceTracking")
                    Button.checked = !Button.checked
                    break;
                case 'JoyLPress':
                    await writeToSerial("*h:1*");
                    break;
                case 'padDown':
                    printToConsole("TURBO!!!!\n");
                    turbo = true;
                    break;
                case 'padRight':
                    await writeToSerial("*|:0*")
                    turbo = true;
                    break;
                case "ThrottleLeft":
                    AxisMemory[key] = value;
                    if (!holdingDownControllerAxes.includes(key)) {
                        holdingDownControllerAxes.push(key);
                    }
                    break;
                case "ThrottleRight":
                    AxisMemory[key] = value;
                    if (!holdingDownControllerAxes.includes(key)) {
                        holdingDownControllerAxes.push(key);
                    }
                default:
                    break;
            }
        } else if (key == "ThrottleLeft" || key == "ThrottleRight") {
            AxisMemory[key] = value;
            if (Math.abs(AxisMemory[key] - value) >= 0.05) {// don't detect tiny changes, causes too much data to be sent!
                if (!holdingDownControllerAxes.includes(key)) {
                    holdingDownControllerAxes.push(key);
                }
            }
        }
    } else {
        if (holdingDownController.includes(key) || holdingDownControllerAxes.includes(key)) {
            if (key == "ThrottleLeft" || key == "ThrottleRight") {
                holdingDownControllerAxes = holdingDownControllerAxes.filter(e => e !== key);
            } else {
                holdingDownController = holdingDownController.filter(e => e !== key);
            }
            // console.log("released controller: " + key);
            switch (key) {
                case 'dpadUp':
                case 'dpadDown':
                case 'dpadLeft':
                case 'dpadRight':
                    // if (!holdingDownControllerAxes.includes("JoyLX")) {
                    //     await writeToSerial('*e:0*');
                    // }
                    break;
                case 'ThrottleLeft':
                case 'ThrottleRight':
                    AxisMemory[key] = 0;
                    break;
                case 'padDown':
                    printToConsole("No Turbo :(\n");
                    turbo = false;
                    break;

                default:
                    break;
            }
        }
    }
}
var MotorStates = {
    "leftSpeed": 0,
    "rightSpeed": 0,
}
async function HandleMotorControl(keyboard = true) {
    var throttle = 0;
    var steer = 0;
    //KEYBOARD INPUT
    if (keyboard && holdingDown.length !== 0) {
        if (holdingDown.includes("W")) {
            throttle += turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
        if (holdingDown.includes("A")) {
            steer += turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
        if (holdingDown.includes("S")) {
            throttle -= turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
        if (holdingDown.includes("D")) {
            steer -= turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
    } else if (holdingDownController.length !== 0) {//DPAD INPUT
        if (holdingDownController.includes("dpadDown")) {
            throttle -= turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
        if (holdingDownController.includes("dpadUp")) {
            throttle += turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
        if (holdingDownController.includes("dpadLeft")) {
            steer += turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
        if (holdingDownController.includes("dpadRight")) {
            steer -= turbo ? 1 : scale(kbSpeed, 0, 400, 0, 1);
        }
    } else if (holdingDownControllerAxes.length !== 0) {//JOY INPUT
        throttle = AxisMemory["ThrottleRight"] !== 0 ? AxisMemory["ThrottleRight"] : (AxisMemory["ThrottleLeft"] * -1);
        steer = AxisMemory["JoyLX"] * -1;
    }

    const maxSpeed = 400;
    if (throttle < 0) {
        steer = steer * -1
    }
    // Map throttle to the range [-maxSpeed, maxSpeed]
    let mappedThrottle = scale(throttle, -1, 1, -maxSpeed, maxSpeed);

    // Map steer to the range [-maxSpeed, maxSpeed]
    let mappedSteer = scale(steer, -1, 1, -maxSpeed, maxSpeed);

    // Calculate left and right speeds
    let leftSpeed = mappedThrottle - mappedSteer;
    let rightSpeed = mappedThrottle + mappedSteer;

    // Clamp the speeds to the range [-maxSpeed, maxSpeed]
    leftSpeed = Math.round(Math.min(Math.max(leftSpeed, -maxSpeed), maxSpeed));
    rightSpeed = Math.round(Math.min(Math.max(rightSpeed, -maxSpeed), maxSpeed));

    if (Math.abs(MotorStates["leftSpeed"] - leftSpeed) > 10) {//detect > 10 difference in current speed and target speed, send to arduino
        await writeToSerial("*ls:" + leftSpeed + "*");
    }
    if (Math.abs(MotorStates["rightSpeed"] - rightSpeed) > 10) {//detect > 10 difference in current speed and target speed, send to arduino
        await writeToSerial("*rs:" + rightSpeed + "*");
    }
    // console.log("Left: " + leftSpeed + " Right: " + rightSpeed);
    if (leftSpeed === 0 && rightSpeed === 0 && (MotorStates["rightSpeed"] !== 0 || MotorStates["leftSpeed"] !== 0)) {//one motor currently moving, all motors target 0, stop!
        await writeToSerial("*e:0*");
        console.log("Stopping");
    }
    MotorStates["leftSpeed"] = leftSpeed;
    MotorStates["rightSpeed"] = rightSpeed;
}

async function HandleControllerAxes(key, value) {
    if (Math.abs(AxisMemory[key] - value) >= 0.10) {// don't detect tiny changes, causes too much data to be sent!
        // console.log("Axis Change: " + key + " " + value);
        AxisMemory[key] = value;
        var posval = value <= 0 ? value * -1 : value;
        var scaledValue = Math.round(scale(posval, 0, 1, 0, 400));
        // console.log("Axis Scaled: " + scaledValue);
        switch (key) {
            case 'JoyLX':
                if (posval < 0.2) {//deadzone
                    holdingDownControllerAxes = holdingDownControllerAxes.filter(e => e !== key);
                    AxisMemory[key] = 0;
                    break;
                }
                if (value > 0 && posval > 0.2) {
                    if (!holdingDownControllerAxes.includes(key)) {
                        holdingDownControllerAxes.push(key);
                    }
                }
                if (value < 0 && posval > 0.2) {
                    if (!holdingDownControllerAxes.includes(key)) {
                        holdingDownControllerAxes.push(key);
                    }
                }
                break;
            default:
                break;
        }

    }

}
//END OF GAMEPAD FUNCTIONS



//GAMEPAD
function HandleGameInputs() {
    var gamepads = navigator.getGamepads();
    gamepads.forEach((controller) => {
        console.log(controller);
        if (controller && controller.id.search("STANDARD GAMEPAD")) {
            if (!gamepad) {
                gamepad = controller
                document.getElementById("CTRLR").checked = true;
            }
            controller.buttons.forEach((button, index) => {
                HandleControllerInputCounts(layout[index], button.pressed, button.value)
            });
            controller.axes.forEach((button, index) => {
                HandleControllerAxes(layout[index + 100], button)
            });

        }
    });
    HandleMotorControl()
}
setInterval(function () {
    HandleGameInputs(useKeyboard);
}, 1000);
//END OF GAMEPAD