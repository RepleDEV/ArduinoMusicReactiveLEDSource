const SerialPort = require("serialport");
const fs = require("fs").promises;
const path = require('path');

let port;

(async () => {
    let profilePath = path.join(__dirname, "/Settings/user.profile.json");

    var profile;
    await fs.readFile(profilePath, {encoding:"utf-8"}).then(data => profile = JSON.parse(data)).catch(console.error);

    port = new SerialPort(profile.port, {baudRate:9600});
})();

function sendInput(input) {
    if (input[input.length - 1] != '\n')input += '\n';
    port.write(input);
}