class BallsController {
	constructor(game) {
		this.game = game;
		this.events = new EventEmitter();
	}

	init() {
		this._textures = {};
		this._balls = R.times(_ => R.times(_ => null, 9), 9);
		this._pool = [];

		this._initBallTexture();
		this._initBalls();
		// this._initParticles();
	}

	_initBallTexture() {
		const conf = Meow.cache.getJSON('config')['balls'];
		const colors = conf['colors'];
		const radius = conf.radius;

		for (let key in colors) {
			const hex = colors[key];
			const color = key;
			const graphics = new PIXI.Graphics();
			graphics.beginFill(hex);
			graphics.drawCircle(0, 0, radius);
			graphics.endFill();

			const texture = Meow.renderer.generateTexture(graphics, null, Meow.renderer.resolution);
			Meow.cache.addTexture(`ball_${color}`, texture);

			graphics.destroy(true);
		}
	}

	_initBalls() {
		const gridWidth = 9;
		const gridHeight = 9;

		for (let i = 0; i < gridWidth * gridHeight; i++) {
			const ball = new Ball();
			ball.init();
			ball.color = Ball.randomColor();
			this._pool.push(ball);
		}
	}

	// _initParticles() {
	// 	this._particles = new Particles();
	// 	this._particles.init();
	// }
}