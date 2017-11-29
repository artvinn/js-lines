import TWEEN from 'tween.js';
import EventEmitter from 'eventemitter3';

export default class GameOver {
	constructor(game) {
		this.game = game;

		this._topBg = null
		this._bottomBg = null;
		this._gameOverText = null;
		this._cup = null;
		this._bestScore = null;
		this._currentScore = null;
		this._blackBg = null;
		this.events = new EventEmitter();
	}

	init() {
		this.content = new PIXI.Container();
		this.content.visible = false;
		this.game.root.addChild(this.content);

		this._initBlackBg();
		this._initSprites();
		this._initTexts();
		this._initTweens();
	}

	_initBlackBg() {
		var g = new PIXI.Graphics();
		g.beginFill(0x000000);
		g.drawRect(0, 0, 2, 2);
		g.endFill();

		const texture = Meow.renderer.generateTexture(g);
		Meow.cache.addTexture('black_overlay', texture);
		this._blackBg = new PIXI.Sprite(texture);
		this._blackBg.width = this.game.width;
		this._blackBg.height = this.game.height;
		this._blackBg.alpha = 0;
		this.content.addChild(this._blackBg);

		g.destroy(true);
		g = null;
	}

	_initSprites() {
		const texture = Meow.cache.getTexture('popup_bg');
		this._topBg = new PIXI.Sprite(texture);
		this._topBg.tint = 0x31bae6;
		this._topBg.anchor.set(0.5);
		this._topBg.x = this._topBg.width / 2;
		this._topBg.y = this.game.height / 2 - 140;
		this._topBg.width *= 0.8;
		this._topBg.height *= 0.8;

		this._bottomBg = new PIXI.Sprite(texture);
		this._bottomBg.tint = 0x31bae6;
		this._bottomBg.anchor.set(0.5);
		this._bottomBg.x = this._bottomBg.width / 2;
		this._bottomBg.y = this.game.height / 2 + 50;

		this._cup = new PIXI.Sprite(Meow.cache.getTexture('cup.png'));
		this._cup.scale.set(1.5);
		this._cup.anchor.set(0.5);
		this._topBg.addChild(this._cup);

		this._restartButton = new PIXI.Sprite(Meow.cache.getTexture('restart_white.png'));
		this._restartButton.scale.set(1.5);
		this._restartButton.anchor.set(0.5);
		this._restartButton.x = this.game.width / 2;
		this._restartButton.y = this.game.height / 1.5 + 70;
		this._restartButton.interactive = false;
		this._restartButton.buttonMode = true;
		this._restartButton.mousedown = () => this.onRestartClicked();
		this._restartButton.touchstart = () => this.onRestartClicked();

		this.content.addChild(this._topBg);
		this.content.addChild(this._bottomBg);
		this.content.addChild(this._restartButton);
	}

	_initTexts() {
		this._gameOverText = new PIXI.extras.BitmapText("GAME OVER", {font: "110px popupsFont"});
		this._gameOverText.anchor.set(0.5);
		this._gameOverText.y = this._bottomBg.height / 2 - this._gameOverText.height / 2;
		this._bottomBg.addChild(this._gameOverText);

		this._bestScore = new PIXI.extras.BitmapText("0", {font: "90px popupsFont"});
		this._bestScore.anchor.set(0.5);
		this._bestScore.x = this._cup.x + this._bestScore.width;
		this._bestScore.y = this._topBg.height / 2 - this._bestScore.height / 2;
		this._topBg.addChild(this._bestScore);

		this._currentScore = new PIXI.extras.BitmapText("0", {font: "90px popupsFont"});
		this._currentScore.anchor.set(0.5);
		this._currentScore.x = this._cup.x - this._currentScore.width;
		this._currentScore.y = this._topBg.height / 2 - this._currentScore.height / 2;
		this._topBg.addChild(this._currentScore);
	}

	_initTweens() {
		const topBg = this._topBg;
		const bottomBg = this._bottomBg;
		const restartButton = this._restartButton;
		this._scaleTween = new TWEEN.Tween({scale: 0})
			.to({scale: 1}, 1000)
			.easing(TWEEN.Easing.Exponential.Out)
			.onUpdate(function() {
				topBg.scale.set(this.scale * 0.8);
				bottomBg.scale.set(this.scale);
				restartButton.scale.set(this.scale * 1.5);

			})
			.onStart(() => this.content.visible = true)
			.onComplete(function() {
				this.scale = 0;
			});

		const blackBg = this._blackBg;
		this._alphaTween = new TWEEN.Tween({alpha: 0})
			.delay(50)
			.to({alpha: 0.5}, 500)
			.onUpdate(function() {
				blackBg.alpha = this.alpha;
			})
			.onComplete(function() {
				this.alpha = 0;
			});
	}

	set currentScore(value) {
		this._currentScore.text = value;
	}

	show() {
		this._bestScore.text = localStorage.getItem('bestScore');

		this._restartButton.interactive = true;
		this.game.root.setChildIndex(this.content, this.game.root.children.length - 1);

		this._bestScore.x = this._cup.x + 170;
		this._bestScore.y = this._topBg.height / 2 - this._bestScore.height / 2;

		this._currentScore.x = this._cup.x - 170;
		this._currentScore.y = this._topBg.height / 2 - this._currentScore.height / 2;

		this._alphaTween.start();
		this._scaleTween.start();
	}

	onRestartClicked() {
		this.events.emit('restart');
		this._restartButton.interactive = false;
		this.content.visible = false;
		this._blackBg.alpha = 0;
	}

	reposition() {
		this._topBg.x = this.game.width / 2;
		this._topBg.y = this.game.height / 2 - 140;

		this._bottomBg.x = this.game.width / 2;
		this._bottomBg.y = this.game.height / 2 + 50;

		this._gameOverText.y = this._bottomBg.height / 2 - this._gameOverText.height / 2;

		this._bestScore.x = this._cup.x + this._bestScore.width;
		this._bestScore.y = this._topBg.height / 2 - this._bestScore.height / 2;

		this._currentScore.x = this._cup.x - this._currentScore.width;
		this._currentScore.y = this._topBg.height / 2 - this._currentScore.height / 2;

		this._blackBg.width = this.game.width;
		this._blackBg.height = this.game.height;

		this._restartButton.x = this.game.width / 2;
		this._restartButton.y = this.game.height / 1.5 + 70;

		this._bestScore.x = this._cup.x + 170;
		this._bestScore.y = this._topBg.height / 2 - this._bestScore.height / 2;

		this._currentScore.x = this._cup.x - 170;
		this._currentScore.y = this._topBg.height / 2 - this._currentScore.height / 2;
	}
}