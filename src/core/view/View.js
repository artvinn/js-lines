import root from './root';
import Screen from './Screen';
import Device from '../sys/Device';
import EventEmitter from 'eventemitter3';
import scaleToWindow from '../utils/scaleToWindow';

export default class View {
	constructor(width, height) {
		this.renderer = null;

		this._width = width;

		this._height = height;

		this.events = new EventEmitter();
	}

	init() {
		this.renderer = PIXI.autoDetectRenderer(this._width, this._height, {
			resolution: this.detectResolution(),
			backgroundColor : 0xFFFFFF,
			autoResize: true,
			// antialias: true
		}, this.isCanvasAllowed());

		//add canvas to the DOM tree
		this.gameContainer = document.getElementById("gameContainer");
		this.gameContainer.appendChild(this.renderer.view);

		window.addEventListener("resize", () => this.resize());
		window.addEventListener("fullscreenchange", () => this.resize());
		window.addEventListener("orientationchange", () => this.resize());

		this.resize();
	}

	resize() {
		const isLandscape = Screen.isLandscape();
		const width = isLandscape ? this._height : this._width;
		const height = isLandscape ? this._width : this._height;

		this.renderer.resize(width, height);
		scaleToWindow(this.renderer.view, width, height);

		this.events.emit('resize');
	}

	render() {
		this.renderer.render(root);
	}

	detectResolution() {
		const isIphone4 = Device.isLowEnd();

		if (isIphone4) {
			return 1;
		} else {
			return window.devicePixelRatio > 1 ? 2 : 1;
		}
	}

	isCanvasAllowed() {
		return Device.isLowEnd();
	}
}