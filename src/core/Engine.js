import View from './view/View';
import Screen from './view/Screen';
import Heartbeat from './sys/Heartbeat';
import TWEEN from 'tween.js';
import Charm from './tween/Charm';
import root from './view/root';
import Cache from './Cache';

window.Meow = {};

export default class Engine {
	constructor(width, height) {
		this._width = width;

		this._height = height;
	}

	init() {
		this.view = new View(this._width, this._height);
		this.view.init();

		this.root = root;

		Meow.renderer = this.view.renderer;
		Meow.Tween = new Charm(PIXI);
		Meow.cache = new Cache();
		Meow.cache.init();
		Meow.screen = Screen;

		Heartbeat.events.on('tick', () => this.update());
		Heartbeat.update();
	}

	update() {
		TWEEN.update();
		Meow.Tween.update();
		
		this.view.render();
	}

	get width() {
		const isLandscape = Screen.isLandscape();
		const width = isLandscape ? this._height : this._width;

		return width;
	}

	get height() {
		const isLandscape = Screen.isLandscape();
		const height = isLandscape ? this._width : this._height;

		return height;
	}
}