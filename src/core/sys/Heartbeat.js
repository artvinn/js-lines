import EventEmitter from 'eventemitter3';

class Heartbeat {
	constructor() {
		this._delta = 0;

		this._lastFrameTime = 0;

		this._callbacks = [];

		this.loop = (time) => this.update(time);

		this.events = new EventEmitter();
	}

	_updateCallbacks(dt) {
		for (let i = 0; i < this._callbacks.length; i++) {
			this._callbacks[i](dt);
		}
	}

	addCb(cb) {
		this._callbacks.push(cb);
	}

	update(timestamp) {
		requestAnimationFrame(this.loop);

		this._delta = timestamp - this._lastFrameTime; 
    	this._lastFrameTime = timestamp;

		this._updateCallbacks(this._delta);
		this.events.emit('tick');
	}

	getTime() {
		return window.performance.now;
	}

	get delta() {
		return this._delta;
	}
};

export default new Heartbeat();