//COMM
connectButton.addEventListener('click', () => {
    connect();
});
function toggleFF() {
    rumble = !rumble;
}
function ChangeSpeed(speed) {
    kbSpeed = speed;
}
function ChangeLineSpeed(speed) {
    writeToSerial("*lspd:" + speed + "*")
}
function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }

 function addOption(el,text,value) {
    var option = document.createElement("option");
    option.text = text;
    option.value = value;
    el.add(option);
 }

function HandleUiConnections(type, status, internal = false) {
    if (type == "USB") {
        if ((status != connectedUSB)) {
            connectedUSB = status;
            if (status) {
                notyf.success("Connected USB");
                document.getElementById("ConnectedUSBCheck").checked = true;
                document.getElementById("connectbutton").classList.add("disabled");
                document.getElementById("ZumoSelector").disabled = false;
            } else {
                notyf.error("Disconnected USB");
                document.getElementById("ConnectedUSBCheck").checked = false;
                document.getElementById("connectbutton").classList.remove("disabled");
                document.getElementById("ZumoSelector").disabled = true;
                port = null;
                HandleUiConnections("Zumo", false, true);
            }
        }
    } else {
        if ((status != connectedZumo) && (internal || connectedUSB)) {
            connectedZumo = status;
            if (status) {
                notyf.success("Connected Zumo");
                document.getElementById("ConnectedZumoCheck").checked = true;
                document.getElementById("stopbutton").classList.remove("disabled");
                document.getElementById("killbutton").classList.remove("disabled");
                document.getElementById("calibratebutton").classList.remove("disabled");
                writeToSerial("*init:0*")
            } else {
                notyf.error("Disconnected Zumo");
                document.getElementById("ConnectedZumoCheck").checked = false;
                document.getElementById("stopbutton").classList.add("disabled");
                document.getElementById("killbutton").classList.add("disabled");
                document.getElementById("calibratebutton").classList.add("disabled");
            }
        }
    }
}
var nameList = [
    'Time', 'Past', 'Future', 'Dev',
    'Fly', 'Flying', 'Soar', 'Soaring', 'Power', 'Falling',
    'Fall', 'Jump', 'Cliff', 'Mountain', 'Rend', 'Red', 'Blue',
    'Green', 'Yellow', 'Gold', 'Demon', 'Demonic', 'Panda', 'Cat',
    'Kitty', 'Kitten', 'Zero', 'Memory', 'Trooper', 'XX', 'Bandit',
    'Fear', 'Light', 'Glow', 'Tread', 'Deep', 'Deeper', 'Deepest',
    'Mine', 'Your', 'Worst', 'Enemy', 'Hostile', 'Force', 'Video',
    'Game', 'Donkey', 'Mule', 'Colt', 'Cult', 'Cultist', 'Magnum',
    'Gun', 'Assault', 'Recon', 'Trap', 'Trapper', 'Redeem', 'Code',
    'Script', 'Writer', 'Near', 'Close', 'Open', 'Cube', 'Circle',
    'Geo', 'Genome', 'Germ', 'Spaz', 'Shot', 'Echo', 'Beta', 'Alpha',
    'Gamma', 'Omega', 'Seal', 'Squid', 'Money', 'Cash', 'Lord', 'King',
    'Duke', 'Rest', 'Fire', 'Flame', 'Morrow', 'Break', 'Breaker', 'Numb',
    'Ice', 'Cold', 'Rotten', 'Sick', 'Sickly', 'Janitor', 'Camel', 'Rooster',
    'Sand', 'Desert', 'Dessert', 'Hurdle', 'Racer', 'Eraser', 'Erase', 'Big',
    'Small', 'Short', 'Tall', 'Sith', 'Bounty', 'Hunter', 'Cracked', 'Broken',
    'Sad', 'Happy', 'Joy', 'Joyful', 'Crimson', 'Destiny', 'Deceit', 'Lies',
    'Lie', 'Honest', 'Destined', 'Bloxxer', 'Hawk', 'Eagle', 'Hawker', 'Walker',
    'Zombie', 'Sarge', 'Capt', 'Captain', 'Punch', 'One', 'Two', 'Uno', 'Slice',
    'Slash', 'Melt', 'Melted', 'Melting', 'Fell', 'Wolf', 'Hound',
    'Legacy', 'Sharp', 'Dead', 'Mew', 'Chuckle', 'Bubba', 'Bubble', 'Sandwich', 'Smasher', 'Extreme', 'Multi', 'Universe', 'Ultimate', 'Death', 'Ready', 'Monkey', 'Elevator', 'Wrench', 'Grease', 'Head', 'Theme', 'Grand', 'Cool', 'Kid', 'Boy', 'Girl', 'Vortex', 'Paradox'
];
function randomName() {
    return nameList[Math.floor(Math.random() * nameList.length)];
};