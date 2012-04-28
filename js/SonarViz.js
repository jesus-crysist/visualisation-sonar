// JavaScript Document
if (!window.requestAnimationFrame) {

	window.requestAnimationFrame = (function() {
		return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.oRequestAnimationFrame
				|| window.msRequestAnimationFrame || function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
	})();
}

var SonarViz = function(audioSrc, canvasSrc) {

	var loc, configCanvas, canvas;
	
	loc = window.location.pathname;
	this.filePath = audioSrc.indexOf('/') === 0 ? audioSrc : loc.substring(0, loc.lastIndexOf('/') + 1) + audioSrc;

	configCanvas = canvasSrc, canvas;
	try {
		canvas = (configCanvas.getContext ? configCanvas : document.getElementById(configCanvas));
	} catch (e) {
		alert("Canvas element does not exist.");
		return;
	}

	this.canvas = canvas.getContext('2d');
	this.scrollingSize = canvas.height;
	this.canvasWidth = canvas.width;

	this.initAudio();

	return this;

};

SonarViz.prototype.initAudio = function() {
	
	var context, source, analyser;

	try {
		context = new webkitAudioContext();
		this.context = context;
	} catch (e) {
		alert('Web Audio API is not supported in this browser');
		return;
	}

	analyser = context.createAnalyser();
	analyser.fftSize = 2048;
	analyser.connect(context.destination);
	this.analyser = analyser;
	
	this.frequencyByteData = new Uint8Array(analyser.frequencyBinCount);
	this.dataArray = [];
	this.volStep = 10;

	this.loadAudioBuffer();
	
};

SonarViz.prototype.loadAudioBuffer = function() {
	// Load asynchronously

	var request, self;
	self = this;
	
	request = new XMLHttpRequest();
	request.open("GET", this.filePath, true);
	request.responseType = "arraybuffer";

	request.onload = function() {
		self.buffer = self.context.createBuffer(request.response, true);
	};

	request.send();
};

SonarViz.prototype.reload = function() {
	// init source
	var source = this.context.createBufferSource(),
		gn = this.context.createGainNode();
	
	gn.connect(this.analyser);
	this.gain = gn.gain;
	
//	source.connect(this.analyser);
	source.connect(gn);
	source.buffer = this.buffer;
	source.loop = this.loop || false;
	this.source = source;
	
	return source;
};

SonarViz.prototype.draw = function() {
	
	var analyser = this.analyser,
		freqByteData = this.frequencyByteData,
		canvas = this.canvas,
		scrollingSize = this.scrollingSize,
		dataArray = this.dataArray,
		i, j, lenJ, buffer;

	analyser.smoothingTimeConstant = 0.5;
	analyser.getByteFrequencyData(freqByteData);

	dataArray.push(freqByteData);

	// clear content when canvas is filled
	i = (dataArray.length - 1) % scrollingSize;
	if (!i) {
		canvas.clearRect(0, 0, this.canvasWidth, scrollingSize);
	}

	buffer = dataArray[i];
	
//	console.log(buffer[25]);

	for (j = 0, lenJ = buffer.length; j < lenJ; j++) {
		freqByteData = 255 - buffer[j];
		this.drawPixel(j, i, '#' + freqByteData.toString(16)
				+ freqByteData.toString(16) + freqByteData.toString(16));
	}
	
	this.nextFrame();

};

SonarViz.prototype.nextFrame = function() {
	if (!this.playing) { return; }
	var self = this;
	window.requestAnimationFrame(function() {
		self.draw.call(self);
	});
};

SonarViz.prototype.drawPixel = function(x, y, rgb) {
	this.canvas.fillStyle = rgb;
	this.canvas.fillRect(x, y, 1, 1);
};

SonarViz.prototype.stop = function() {
	if (this.playing) {
		this.source.noteOff(0);
		this.source.disconnect(this.analyser);
		this.source = null;
		this.playing = false;
		
		// clear canvas and data array
		this.canvas.clearRect(0, 0, this.canvasWidth, this.scrollingSize);
		this.dataArray = [];
	}
};

SonarViz.prototype.setVolume = function(vol) {
	this.gain.value = (vol < 100 ? vol > 0 ? vol : 0 : 100) / 100;
	
	console.log(this.gain.value);
};

SonarViz.prototype.getVolume = function() {
	return Math.round(this.gain.value * 100);
};

SonarViz.prototype.volumeUp = function() {
	this.setVolume(this.getVolume() + this.volStep);
};

SonarViz.prototype.volumeDown = function() {
	this.setVolume(this.getVolume() - this.volStep);
};

SonarViz.prototype.play = function() {
	
	if (!this.playing) {
		
		var context = this.context;
		
		// play
		source = this.reload();
		source.noteOn(0);
		
		this.playing = true;
		
		this.setVolume(60);
	
		// start visualisation
		this.nextFrame();
	}
};

SonarViz.prototype.isPlaying = function() {
	return this.playing;
};
