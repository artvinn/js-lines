import EventEmitter from 'eventemitter3';
import LoaderView from './LoaderView';
import Sound from '../sounds/Sound';

export default class Loader {
	constructor(game) {
		this.events = new EventEmitter();

		this._resources = null;

		this.view = new LoaderView(game);
	}

	load() {
		this._bootLoad();
		Sound.load();
	}

	_bootLoad() {
		PIXI.loader
			.add('logo', 'resources/images/logo.png')
			.load(() => this._mainLoad());
	}

	_mainLoad() {
		this.events.emit('bootLoadComplete');
		this.view.show();

		PIXI.loader
			.add('config', 'resources/config.json')
			.add('landscape', 'resources/landscape.json')
			.add('portrait', 'resources/portrait.json')
			.add('popupsFont', 'resources/fonts/popupsFont.fnt')
			.add('scoreFont', 'resources/fonts/scoreFont.fnt')
			.add('images', 'resources/images/images.json')
			.add('branding', 'resources/images/branding.png')
			.load((loader, resources) => this._loadComplete(loader, resources))
	}

	_loadComplete(loader, resources) {
		this._resources = resources;

		setTimeout(() => {
			this.view.hide();

			this.events.emit('loadComplete', this._resources);
		}, 1500);
	}
}

