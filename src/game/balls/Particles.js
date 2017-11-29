import Heartbeat from '../../core/sys/Heartbeat';
import root from '../../core/view/root';
import 'pixi-particles';

export default class Particles {
	constructor() {
		this._emittersCount = 9;

		this._emitters = null;

		this._updateEnabled = false;
	}

	init() {
		this._emitters = [];
		this._toUpdate = [];

		this._initEmitters();
		this.cfg = Meow.cache.getJSON('config')['particles'];

		Heartbeat.addCb((dt) => this._update(dt))
	}

	_initEmitters() {
		for (let i = 0; i < 9; i++) {
			const container = new PIXI.particles.ParticleContainer(20, {
				alpha: true,
			    scale: true,
			    position: true
			});
			container.depth = 3;
			const emitter = new PIXI.particles.Emitter(container);
			emitter.init();
			this._emitters.push(emitter);
		}
	}

	show(balls) {
		this._toUpdate = [];
		for (let i = 0; i < balls.length; i++) {
			const ball = balls[i];
			const texture = ball.sprite.texture;
			const conf = this._getBaseConfig();
			const localPos = ball.sprite.toLocal(ball.sprite.position, ball.sprite);
			const emitter = this._emitters[i];
			emitter.init(texture, conf);
			emitter.resetPositionTracking();
			emitter.updateOwnerPos(localPos.x, localPos.y);
			ball.sprite.parent.addChild(emitter.parent);
			this._toUpdate.push(emitter);
		}
		this._updateEnabled = true;
	}

	_update(dt) {
		if (!this._updateEnabled)
			return;

		for (let i = 0; i < this._toUpdate.length; i++) {
			let emitter = this._toUpdate[i];
			emitter.update(dt * 0.002);
		}
	}

	_getBaseConfig() {
		return this.cfg;
	}

	randomNumber(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}