import 'waud.js';

class Sound {
	constructor() {
		this.sounds = null;
		Waud.init();
		Waud.enableTouchUnlock();
	}

	load() {
		var base64 = new WaudBase64Pack("resources/sounds/sounds.json", (sounds) => this.onLoad(sounds));
	}

	onLoad(sounds) {
		this.sounds = sounds;
	}

	playSelection() {
		this.sounds.get('select.mp3').play();
	}

	playSplash() {
		this.sounds.get('splash.mp3').play();
	}


	playGameOver() {
		this.sounds.get('game_over.mp3').play();
	}

	randomNumber(min, max) {
 		return Math.floor(Math.random() * (max - min + 1)) + min;
 	}

 	mute() {
 		Waud.mute(true);
 	}

 	unmute() {
 		Waud.mute(false);
 	}
}

export default new Sound();