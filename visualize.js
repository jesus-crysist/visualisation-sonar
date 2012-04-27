// JavaScript Document
//if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame;
	} )();
//}

var canvas, source, analyser, freqByteData;

window.addEventListener('load', function() {
	var c = document.getElementById('drawingBoard');
	canvas = c.getContext('2d');
	
	canvas.fillStyle = 'black';
	canvas.strokeStyle = 'black';
	
	var context = new webkitAudioContext();
	
	source = context.createBufferSource();
	analyser = context.createAnalyser();
	analyser.fftSize = 2048;
	
	source.connect(analyser);
	analyser.connect(context.destination);
	
	loadAudioBuffer(context, '/audio/ovningskora.ogg');
//	loadAudioBuffer(context, '/audio/Rammstein.ogg');
	
	freqByteData = new Uint8Array(analyser.frequencyBinCount);

	
});

window.addEventListener('keydown', function() {
	source.noteOff(0);
	stopDrawing = false;
});

function loadAudioBuffer(context, url) {
	// Load asynchronously

	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	request.onload = function() { 
		audioBuffer = context.createBuffer(request.response, true);
		
		source.buffer = audioBuffer;
		source.loop = false;
	
		source.noteOn(0.0);
		
		window.requestAnimationFrame(draw);
	}

	request.send();
}

var displayArr = [], stopDrawing = true;

function draw() {
	
	analyser.smoothingTimeConstant = 0.1;
	analyser.getByteFrequencyData(freqByteData);
	
	var i, len, j, lenJ, buffer, data = freqByteData, max = 0;
	
	displayArr.push(data);

//	canvas.clearRect(0, 0, 1024, displayArr.length);
	i = (displayArr.length - 1) % 512;

	if (!i) {
		canvas.clearRect(0, 0, 1024, 512);
	}
	
//	for (i = 0, len = displayArr.length; i < len; i++) {
		buffer = displayArr[i];
		
		for (j = 0, lenJ = buffer.length; j < lenJ; j++) {
			data = 255 - buffer[j];
			drawPixel(j, i, '#' + data.toString(16) + data.toString(16) + data.toString(16));
			/*canvas.beginPath();
			canvas.moveTo(j, i);
			canvas.lineTo(j + 1, i + 1);
			canvas.stroke();*/
		}
//	}
	
	if (stopDrawing) {
		window.requestAnimationFrame(draw);
	}
	/*	count--;
	} else {
		source.noteOff(0);
	}*/
}

function drawPixel(x, y, rgb) {
	canvas.fillStyle = rgb;
	canvas.fillRect(x, y, 1, 1);
}
