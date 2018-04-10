import EventEmitter from 'eventemitter3';
import Screen from '../../core/view/Screen';
import Sound from '../sounds/Sound';

export default class Panel {
	constructor(game) {
		this.game = game;

		this._config = null;

		this.events = new EventEmitter();
	}

	init() {
		this.content = new PIXI.Container();
		this.game.root.addChild(this.content);
		this._config = Meow.cache.getJSON('config')['panel'];

		this._initButtons();
		this.reposition();
	}

	_initButtons() {
		this._restartButton = new PIXI.Sprite(Meow.cache.getTexture('restart.png'));
		this._restartButton.scale.set(1.2);
		this._restartButton.x = 70;
		this._restartButton.y = 160;
		this._restartButton.interactive = true;
		this._restartButton.buttonMode = true;
		this._restartButton.mousedown = () => this.events.emit('restart');
		this._restartButton.touchstart = () => this.events.emit('restart');
		this.content.addChild(this._restartButton);

		this._soundButton = new PIXI.Sprite(Meow.cache.getTexture('sound_on.png'));
		this._soundButton.x = 70;
		this._soundButton.y = 50;
		this._soundButton.interactive = true;
		this._soundButton.buttonMode = true;

		this._soundButton.mousedown = () => this._toggleSound();
		this._soundButton.touchstart = () => this._toggleSound();
		this.content.addChild(this._soundButton);

		this._info = new PIXI.Sprite(Meow.cache.getTexture('info.png'));
		this._info.interactive = true;
		this._info.mousedown = () => this.events.emit('showInfo');
		this._info.touchstart = () => this.events.emit('showInfo');
		this.content.addChild(this._info);
	}

	_toggleSound() {
		const soundOnTex = Meow.cache.getTexture('sound_on.png');
		const soundOffTex = Meow.cache.getTexture('sound_off.png');

		if (this._soundButton.texture === soundOnTex) {
			Sound.mute();
			this._soundButton.texture = soundOffTex;
		}
		else {
			Sound.unmute();
			this._soundButton.texture = soundOnTex;
		}
	}

	enable() {
		this._restartButton.interactive = true;
		this._soundButton.interactive = true;
	}

	disable() {
		this._restartButton.interactive = false;
		this._soundButton.interactive = false;
	}

	reposition() {
		const orientation = Screen.orientation;
		const config = Meow.cache.getJSON(orientation)['panel'];

		this._restartButton.x = config.restart.x;
		this._restartButton.y = config.restart.y;

		this._soundButton.x = config.sound.x;
		this._soundButton.y = config.sound.y;

		this._info.x = config.info.x;
		this._info.y = config.info.y;
	}
}