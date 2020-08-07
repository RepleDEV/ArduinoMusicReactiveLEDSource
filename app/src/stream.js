navigator.mediaDevices.getUserMedia({
    audio:{mandatory:{chromeMediaSource:'desktop'}},
    video:{mandatory:{chromeMediaSource:'desktop'}}
}).then(handleStream).catch(e => console.error(e));

const audioContext = new AudioContext();
var meter, pitch, analyser;
function handleStream(stream) {
    var audioStream = audioContext.createMediaStreamSource(stream);

    meter = createAudioMeter(audioContext,0.4,0.99);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    audioStream.connect(meter);
    audioStream.connect(analyser);

    updatePitch();
    calculate();
}

var multiplier = 2;
function calculate() {
    var volume_ceil = 50;
    volume = meter.volume * 1000 * multiplier;
    volume = volume > volume_ceil ? volume_ceil : volume;
    volume = Math.round(volume * 255 / volume_ceil);

    updateMultiplier();

    var pitch_ceil = 16000;
    pitch = pitch > pitch_ceil ? pitch_ceil : pitch;
    pitch *= 100 / pitch_ceil;

    var colors = [0,0,0];
    if (pitch < 50) {
        if (pitch < 25) {
            colors[2] = 255;
            colors[1] = pitch / 25 * 255;
        } else if (pitch > 25) {
            colors[1] = 255;
            colors[2] = 255 - (pitch / 25 * 255);
        } else {
            colors[1], colors[2] = 255,255;
        }
    } else if (pitch > 50) {
        if (pitch < 75) {
            colors[1] = 255;
            colors[0] = (pitch - 50) / 25 * 255;
        } else if (pitch > 75) {
            colors[0] = 255;
            colors[1] = 255 - ((pitch - 75) / 25 * 255);
        } else {
            colors[0], colors[1] = 255,255;
        }
    } else {
        colors[1] = 255;
    }

    colors = colors.map(val => Math.round(val * (volume / 255)));
    sendInput(colors.join(','));
    var color = `rgb(${colors.join(',')})`;
    document.getElementById("debug_box").style.backgroundColor = color;

    setTimeout(calculate, 25);
}

var multiplier_buffer = [];
function updateMultiplier(average, clip, samples) {
    average = average || 220;
    clip = clip || 440;
    samples = samples || 16;

    if (pitch < clip) {
        multiplier_buffer = [];
        return;
    }
    if (multiplier_buffer.length < samples) {
        multiplier_buffer.push(volume);
        return;
    }
    var multiplier_average = multiplier_buffer.reduce((a, b) => a + b, 0) / multiplier_buffer.length;
    if (multiplier_average > average - 10 && multiplier_average < average + 10) {
        multiplier_buffer = [];
        return;
    }
    if (multiplier_average < average + 10) {
        multiplier+=0.1;
    } else {
        multiplier-=0.1;
    }
    multiplier_buffer = [];
}
