const SerialPort = require("serialport");

const port = new SerialPort('COM8', {baudRate:9600});

function sendInput(input) {
    if (input[input.length - 1] != '\n')input += '\n';
    port.write(input);
}