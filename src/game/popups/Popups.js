import TWEEN from 'tween.js';
import Screen from '../../core/view/Screen';
import Sound from '../sounds/Sound';

export default class Popups {
	constructor(game) {
		this.game = game;

		this._bg = null;
	}

	init() {
		this._strings = Meow.cache.getJSON('config')['popups']['strings'];
		this._colors = Meow.cache.getJSON('config')['balls']['colors'];

		this._initPopup();
		this._initBg();
		this._initText();
		this._initTweens();
	}

	_initBg() {
		var g = new PIXI.Graphics();
		g.beginFill(0xFFFFFF);
		g.drawRect(0, 0, 1080, 130);
		g.endFill();

		const texture = Meow.renderer.generateTexture(g);
		Meow.cache.addTexture('popup_bg', texture);
		this._bg = new PIXI.Sprite(texture);
		this._renderContainer.addChild(this._bg);

		g.destroy(true);
		g = null;
	}

	_initText() {
		this._message = new PIXI.extras.BitmapText("BRILLIANT!", {font: "100px popupsFont"});
		this._message.x = this.game.width / 2 - this._message.width / 2;
		this._message.y = this._popupSprite.height / 2 - this._message.height / 2;
		this._renderContainer.addChild(this._message);
	}

	_initPopup() {
		this._renderContainer = new PIXI.Container();
		this._renderTexture = PIXI.RenderTexture.create(1080, 130);
		this._popupSprite = new PIXI.Sprite(this._renderTexture);
		this._popupSprite.anchor.set(0.5);
		this._popupSprite.x = this._popupSprite.width / 2;
		this._popupSprite.y = this.game.height / 2;
		this.game.root.addChild(this._popupSprite);
	}

	_initTweens() {
		const sprite = this._popupSprite;
		this._scaleTween = new TWEEN.Tween({scale: 0})
			.to({scale: 1}, 700)
			.easing(TWEEN.Easing.Exponential.Out)
			.onUpdate(function() {
				sprite.scale.set(this.scale);
			})
			.onComplete(function() {
				this.scale = 0;
			});

		this._alphaTween = new TWEEN.Tween({alpha: 1})
			.delay(250)
			.to({alpha: 0}, 500)
			.onUpdate(function() {
				sprite.alpha = this.alpha;
			})
			.onComplete(function() {
				this.alpha = 1;
			});

		this._scaleTween.chain(this._alphaTween);
	}

	show(color) {
		this._reset();

		this._bg.tint = this._colors[color];
		this._message.text = this._randomMessage();
		this.lastMessage = this._message;
		this._message.x = this.game.width / 2 - this._message.width / 2;

		Meow.renderer.render(this._renderContainer, this._renderTexture, true);

		this._scaleTween.start();
	}

	_reset() {
		this._scaleTween.stop();
		this._alphaTween.stop();

		this._popupSprite.alpha = 1;
		this._popupSprite.scale.set(0);
	}

	reposition() {
		const orientation = Screen.orientation;
		const config = Meow.cache.getJSON(orientation);
		this._renderTexture.resize(config.width, 130);
		this._popupSprite.x = this._popupSprite.width / 2;
		this._popupSprite.y = this.game.height / 2;
	}

	_randomMessage() {
		const arr = this._strings.slice();
		if (this.lastMessage) {
			const index = arr.indexOf(this.lastMessage);
			arr.splice(index, 1);
		}
		return arr[Math.floor(Math.random() * arr.length)];
	}
}