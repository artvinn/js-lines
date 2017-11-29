import Container from '../core/Container';
import Ball from './balls/Ball';
import EventEmitter from 'eventemitter3';
import Screen from '../core/view/Screen';

export default class Board {
	constructor(game) {
		this.game = game;

		this.nodeTexture = null;

		this.board = null;

		this.nodeSize = 74;

		this.nodeOffset = 4;

		this.nodeBasePos = this.nodeSize + this.nodeOffset;

		this.events = new EventEmitter();
	}

	init() {
		this.initBaseNode();
		this.initBoard();
		this.reposition();
	}

	initBaseNode() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xe7eded);
		graphics.drawRect(0, 0, this.nodeSize, this.nodeSize);
		graphics.endFill();

		this.nodeTexture = Meow.renderer.generateTexture(graphics);
		Meow.cache.addTexture('node', this.nodeTexture);
		graphics.destroy(true);
	}

	processInput(event) {
		const inputPoint = event.data.getLocalPosition(this.board);
		const gridX = Math.floor(inputPoint.x / (this.nodeSize + this.nodeOffset));
		const gridY = Math.floor(inputPoint.y / (this.nodeSize + this.nodeOffset));
		
		this.events.emit('inputReceived', {gridX, gridY});
	}

	initBoard() {
		this.board = new PIXI.Container();
		this.board.interactive = true;
		this.board.mousedown = event => this.processInput(event);
		this.board.touchstart = event => this.processInput(event);
		this.game.root.addChild(this.board);

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				const node = new PIXI.Sprite(this.nodeTexture);
				node.gridX = i;
				node.gridY = j;
				node.x = (node.width + this.nodeOffset) * i;
				node.y = (node.height + this.nodeOffset) * j;
				node.depth = 0;
				this.board.addChild(node);
			}
		}
	}

	appendBall(ball) {
		this.board.addChild(ball.sprite);
		ball.setSpritePos(this.getNormBallPos(ball));
	}

	removeBall(ball) {
		this.board.removeChild(ball.sprite);
	}

	depthSort() {
		this.board.children.sort((a, b) => {
			return a.depth - b.depth;
		})
	}

	getNormBallPos(ball) {
		const x = ball.gridX * this.nodeBasePos + (this.nodeSize) / 2;
		const y = ball.gridY * this.nodeBasePos + (this.nodeSize) / 2;

		return {x, y};
	}

	toBoardCoords(pos) {
		//TODO: get ball size from layout
		const x = pos.x * this.nodeBasePos + (this.nodeSize) / 2;
		const y = pos.y * this.nodeBasePos + (this.nodeSize) / 2;

		return {x, y};
	}

	static toGridCoords(pos) {
		const x = pos.x / this.nodeBasePos - (this.nodeSize - 64) / 2;
		const y = pos.x / this.nodeBasePos - (this.nodeSize - 64) / 2;

		return {x, y};
	}

	reposition() {
		const orientation = Screen.orientation;
		const config = Meow.cache.getJSON(orientation)['board'];
		this.board.x = this.game.width / 2 - this.board.width / 2;
		this.board.y = config.y;
	}
}