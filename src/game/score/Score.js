import Screen from '../../core/view/Screen';
import TWEEN from 'tween.js';
import R from 'ramda';

export default class Score {
	constructor(game) {
		this.game = game;

		this._currentText = null;
		this._multiplierText = null;
		this._addedScoreText = null;
		this._currentScore = 0;
		this._multiplier = 0;
		this._scrollTween = null;
	}

	init() {
		this._content = new PIXI.Container();
		this.game.root.addChild(this._content);
		this._initTexts();
		this.reposition();
	}

	_initTexts() {
		const color = this._randomColor();
		this._currentText = new PIXI.extras.BitmapText("0", {font: "90px scoreFont"});
		this._currentText.tint = color;
		this._currentText.anchor.set(0.5);
		this._content.addChild(this._currentText);

		this._multiplierText = new PIXI.extras.BitmapText("x1", {font: "50px scoreFont"});
		this._multiplierText.tint = color;
		this._multiplierText.anchor.set(0.5);
		this._content.addChild(this._multiplierText);

		this._addedScoreText = new PIXI.extras.BitmapText("", { font: "42px scoreFont"});
		this._addedScoreText.tint = color;
		this._addedScoreText.anchor.set(0.5);
		this._addedScoreText.alpha = 0;
		this._content.addChild(this._addedScoreText);
	}

	update(data) {
		const {color, balls, incrementMultiplier} = data;
		const hexColor = parseInt(Meow.cache.getJSON('config')['balls']['colors'][color]);
		this._currentText.tint = hexColor;
		this._currentText.text = this._currentScore + '';

		if (incrementMultiplier)
			this._multiplier += this._multiplier;
		else
			this.resetMultiplier();

		this._multiplierText.tint = hexColor;
		this._multiplierText.text = `x${this._multiplier}`;

		const addedScore = (balls * 55) * this._multiplier;

		this._addedScoreText.tint = hexColor;
		this._addedScoreText.text = `+${addedScore}`;
		this._animate(this._currentScore + addedScore);
		this._animateAddedScore();
	}

	resetMultiplier() {
		this._multiplier = 1;
		this._multiplierText.text = "x1";
	}

	_animateAddedScore() {
		const self = this;
		this._addedScoreText.alpha = 1;
		this._addedScoreText.x = this._currentText.x;
		this._addedScoreText.y = this._currentText.y - this._currentText.height / 2;

		new TWEEN.Tween({y: this._addedScoreText.y})
			.to({y: this._addedScoreText.y - 30}, 600)
			.onUpdate(function() {
				self._addedScoreText.y = this.y;
			})
			.start();

		new TWEEN.Tween({alpha: 1})
			.to({alpha: 0}, 1000)
			.onUpdate(function() {
				self._addedScoreText.alpha = this.alpha
			})
			.start();
	}

	_animate(newScore) {
		const self = this;
		new TWEEN.Tween({score: this._currentScore})
			.to({score: newScore}, 600)
			.onUpdate(function() {
				self._currentText.text = this.score.toFixed(0);
			})
			.onComplete(function() {
				self._currentScore = this.score;
			})
			.start();
	}

	_randomColor() {
		const obj = Meow.cache.getJSON('config')['balls']['colors'];
		const colors = R.values(obj);
		return parseInt(colors[Math.floor(Math.random() * colors.length)]);
	}

	reset() {
		const color = this._randomColor();
		this._multiplier = 0;
		this._multiplierText.tint = color;
		this._multiplierText.text = 'x1';

		this._currentText.tint = color;
		this._currentText.text = '0';

		this._currentScore = 0;
	}

	checkBestScore() {
		const bestScore = localStorage.getItem('bestScore');
		if (this._currentScore > bestScore) {
			localStorage.setItem('bestScore', this._currentScore);
		}
	}

	reposition() {
		const orientation = Screen.orientation;
		const config = Meow.cache.getJSON(orientation)['score'];

		this._currentText.x = config.currentText.x;
		this._currentText.y = config.currentText.y;

		this._multiplierText.x = config.multiplierText.x;
		this._multiplierText.y = config.multiplierText.y;
	}

	get currentScore() {
		return this._currentScore;
	}
}