import Ball from '../balls/Ball';
import R from 'ramda';
import EventEmitter from 'eventemitter3';
import TWEEN from 'tween.js';
import Board from '../Board';
import Particles from '../balls/Particles';
import Sound from '../sounds/Sound';
import {getDiagonals} from '../utils/matrix';

const MATCH_COUNT = 5;

export default class BallsController {
	constructor(game) {
		this.game = game;

		this._textures = null;

		//2d array that represent current balls layout on the grid
		this._balls = null;

		//pool of ball objects
		this._pool = null;

		this._selectedBall = null;

		this._moving = false;

		this._particles = false;

		this._toActivate = null;

		this._matchingCount = 0;

		this.events = new EventEmitter();
	}

	init() {
		this._textures = {};
		this._balls = R.times(_ => R.times(_ => null, 9), 9);
		this._pool = [];
		this._toActivate = [];

		this._initBallTexture();
		this._initBalls();
		this._initParticles();
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
			graphics.drawCircle(radius, radius, radius);
			graphics.endFill();

			const texture = Meow.renderer.generateTexture(graphics, PIXI.SCALE_MODES.LINEAR, 2);
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

	_initParticles() {
		this._particles = new Particles();
		this._particles.init();
	}

	spawn() {
		const spawned = [];
		this._toActivate = [];

		this._matchingCount = 0;
		this._blowedUp = false;

		for (let i = 0; i < 3; i++) {
			const ball = this._pool.pop();
			if (!ball)
				break;

			const {x, y} = this._randomGridPos();
			ball.revive();
			ball.deactivate();
			ball.color = Ball.randomColor();
			// ball.color = 'blue'
			this._repositionBall(ball);
			this._toActivate.push(ball);
			spawned.push(ball);
		}

		this.events.emit('appendBalls', spawned);

		this._blowMatchingBalls();

		if (!R.contains(null, R.flatten(this._balls))) {
			this.activateBalls();
			setTimeout(() => {
				this.events.emit('gameOver');
				Sound.playGameOver();
			}, 500);
		}
	}

	//activates previously spawned balls
	activateBalls() {
		this._toActivate.forEach(ball => ball.activate());
	}

	_randomGridPos() {
		const empty = [];
		for (let i = 0; i < this._balls.length; i++) {
			for (let j = 0; j < this._balls[i].length; j++) {
				let ball = this._balls[i][j];
				if (ball === null)
					empty.push({x: i, y: j})
			}
		}

		return empty[Math.floor(Math.random() * empty.length)];
	}

	_getBall(x, y) {
		return this._balls[x][y];
	}

	selectBall(x, y) {
		const ball = this._getBall(x, y);

		//if no ball in this cell, ball is already selected or is not active in this round
		if (ball === null || ball === this._selectedBall || !ball.isActive())
			return;

		Sound.playSelection();

		if (this._selectedBall) {
			this._selectedBall.stopBounceAnimation();
		}

		this.deselectCurrentBall();

		this._selectedBall = ball;
		this._selectedBall.selected = true;
		this._selectedBall.startBounceAnimation();

		this._blowedUp = false;
	}

	deselectCurrentBall() {
		if (this._selectedBall === null)
			return;

		this._selectedBall.selected = false;
		this._selectedBall = null;
	}

	moveBallByPath(path, endNode) {
		const ball = this._selectedBall;
		const sprite = ball.sprite;
		let currentPos = 0;

		ball.stopBounceAnimation();

		if (path === null) {
			return;
		}

		const makeTween = _ => {
			if (currentPos >= path.length) {
				this._ballMovementComplete(endNode);
				return;
			}

			new TWEEN.Tween({x: sprite.x, y: sprite.y})
				.to({x: path[currentPos][0], y: path[currentPos][1]}, 60)
				.onUpdate(function() {
					sprite.x = this.x;
					sprite.y = this.y;
				})
				.onComplete(_ => {
					currentPos++;
					makeTween();
				})
				.start();
		};

		this._moving = true;
		makeTween();
	}

	_ballMovementComplete(endNode) {
		const {gridX, gridY} = this._selectedBall;
		this._balls[gridX][gridY] = null;

		const newGridX = endNode.x;
		const newGridY = endNode.y;
		if (this.exists(newGridX, newGridY)) {
			this._repositionBall(this._balls[newGridX][newGridY]);
			this.events.emit('appendBalls', this._balls[newGridX][newGridY])
		}

		this._selectedBall.setGridPos(newGridX, newGridY);
		this._balls[newGridX][newGridY] = this._selectedBall;

		this._blowMatchingBalls()

		if (this._blowedUp) {
			this._shouldMultiply = true;
			setTimeout(() => {
				this.deselectCurrentBall();
				this._moving = false;
			}, 300)
		} else {
			this._shouldMultiply = false;
			this.deselectCurrentBall();
			this._moving = false;
			this.events.emit("resetMultiplier");
		}

		setTimeout(() => {
			if (!this._blowedUp) {
				this.activateBalls();
				this.spawn();
			}
		}, 100);
	}

	_blowMatchingBalls() {
		this._blowVerticals();
		this._blowHorizontals();
		this._blowDiagonals();

		this.events.emit('updateGrid');
	}

	_blowVerticals() {
		const columns = this._balls.filter(col => col.length >= MATCH_COUNT);
		columns.forEach(col => this._removeBallsLine(col))
	}

	_blowHorizontals() {
		const rows = R.times(_ => [], 9);
		for (let i = 0; i < this._balls.length; i++) {
			for (let j = 0; j < this._balls[i].length; j++) {
				rows[i][j] = this._balls[j][i];
			}
		}

		rows
			.filter(row => row.length >= MATCH_COUNT)
			.forEach(row => this._removeBallsLine(row));
	}

	_blowDiagonals(x, y) {
		const diagonals = getDiagonals(this._balls, true);
		const hasAnyBalls = arr => arr.some(ball => ball !== null);
		const diagonalsWithBalls = diagonals.filter(hasAnyBalls);

		diagonalsWithBalls
			.filter(diagonal => diagonal.length >= MATCH_COUNT)
			.forEach(diagonal => this._removeBallsLine(diagonal));
	}

	//get following balls which colors match
	_getInSequence(arr) {
		const sequenced = [];
		let cur, next;
		let temp = [];

		for (let i = 0; i < arr.length; i++) {
			cur = arr[i];
			if (!cur || !cur.isActive())
				continue;

			next = arr[i + 1];
			temp.push(cur);

			if (!next || cur.color !== next.color || !next.isActive()) {
				sequenced.push(temp.slice());
				temp.length = 0;
			} 
		}

		return sequenced;
	}

	_removeBallsLine(line) {
		const sequenced = this._getInSequence(line);
		const isEnough = arr => arr.length >= MATCH_COUNT;
		const toRemove = R.flatten(sequenced.filter(isEnough));

		if (toRemove.length > 0) {
			this._removeBalls(toRemove);
			this._blowedUp = true;
			if (++this._matchingCount >= 2 || toRemove.length >= 7) {
				this.events.emit('showPopup', toRemove[0].color);
			}
			this.events.emit('updateScore', {
				balls: toRemove.length, 
				color: toRemove[0].color,
				incrementMultiplier: this._shouldMultiply
			});
		}
	}

	_removeBalls(arr) {
		const balls = arr;
		this._particles.show(balls);
		Sound.playSplash();
		arr.forEach(ball => this._discardBall(ball));

		setTimeout(() => {
			this.events.emit('removeBalls', balls);
		}, 10);
	}

	_discardBall(ball) {
		const {gridX, gridY} = ball;
		this._balls[gridX][gridY] = null;
		ball.kill();
		ball.setGridPos(null, null);
		this._pool.unshift(ball);
	}

	_repositionBall(ball) {
		const {x, y} = this._randomGridPos();
		this._balls[x][y] = ball;
		ball.setGridPos(x, y);
	}

	exists(x, y) {
		return this._balls[x][y] !== null;
	}

	existsAndActive(x, y) {
		const ball = this._balls[x][y];
		return ball !== null && ball.isActive();
	}

	undoMove() {
		
	}

	restart() {
		const balls = R.flatten(this._balls).filter(ball => ball !== null);
		balls.forEach(ball => {
			const isInPool = this._pool.indexOf(ball) === 1;
			if (!isInPool) {
				if (ball.selected) {
					ball.selected = false;
					ball.stopBounceAnimation();
				}
				this._discardBall(ball);
			}
		});

		this._selectedBall = null;

		this.events.emit('removeBalls', balls);
		this.spawn();
		this.activateBalls();
		this.spawn();
		this.events.emit('updateGrid');
	}

	get moving() {
		return this._moving;
	}

	get existingBalls() {
		const exists = ball => ball !== null;
		return R.filter(exists, R.flatten(this._balls));
	}

	get activeBalls() {
		return this.existingBalls.filter(ball => ball.isActive());
	}

	get balls() {
		return R.clone(this._balls);
	}

	get isSelected() {
		return this._selectedBall !== null;
	}

	get selectedBall() {
		return this._selectedBall;
	}
}