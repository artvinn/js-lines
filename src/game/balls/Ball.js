import EventEmitter from 'eventemitter3';
import TWEEN from 'tween.js';

export default class Ball {
	constructor() {

		this.sprite = null;

		this._color = null;

		this.gridX = null;

		this.gridY = null;

		this.alignedPosition = null;

		this._selected = false;

		this._tween = null;

		this._moving = false;

		this._conf = null;

		this._alive = false;

		this._active = false;

		this.init();
	}

	init() {
		this._conf = Meow.cache.getJSON('config')['balls'];
		this.initSprite();
	}

	initSprite(texture) {
		this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
		this.sprite.anchor.set(0.5);
		this.sprite.interactive = true;
		this.sprite.depth = 2;
	}

	startBounceAnimation() {
		const sprite = this.sprite;
		//save sprite position when it's aligned to the grid
		this.alignedPosition = {x: this.sprite.x, y: this.sprite.y};
		this._tween = new TWEEN.Tween({y: this.sprite.y})
			.to({y: this.sprite.y - 5}, 170)
			.onUpdate(function() {
				sprite.y = this.y;
			})
			.easing(TWEEN.Easing.Quintic.Out)
			.repeat(Infinity)
			.yoyo(true)
			.start();
	}

	stopBounceAnimation() {
		const sprite = this.sprite;

		this._tween.stop();
		this._tween = new TWEEN.Tween({y: this.sprite.y})
			.to({y: this.alignedPosition.y}, 100)
			.onUpdate(function() {
				sprite.y = this.y;
			})
			.start();
	}

	setGridPos(x, y) {
		this.gridX = x;
		this.gridY = y;
	}

	setSpritePos({x, y}) {
		this.sprite.position.set(x, y);
	}

	kill() {
		this._alive = false;
	}

	revive() {
		this._alive = true;
	}

	isAlive() {
		return this._alive;
	}

	activate() {
		this._active = true;
		this.sprite.depth = 2;

		const sprite = this.sprite;
		new TWEEN.Tween({x: sprite.scale.x})
			.to({x: 1}, 100)
			.onUpdate(function() {
				sprite.scale.set(this.x);
			})
			.start();
	}

	deactivate() {
		this._active = false;
		this.sprite.depth = 1;
		this.sprite.scale.set(0.5);
	}

	isActive() {
		return this._active;
	}

	get selected() {
		return this._selected;
	}

	set selected(bool) {
		this._selected = bool;
	}

	get moving() {
		return this._moving;
	}

	get color() {
		return this._color;
	}

	set color(color) {
		this._color = color;
		this.sprite.texture = Meow.cache.getTexture(`ball_${color}`);
	}

	static randomColor() {
		const colors = Object.keys(Meow.cache.getJSON('config')['balls']['colors']);
		return colors[Math.floor(Math.random() * colors.length)];
	}
}