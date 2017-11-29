import Engine from '../core/Engine';
import Board from './Board';
import Grid from './Grid';
import findPath from './findPath';
import BallsController from './balls/BallsController';
import Panel from './panel/Panel';
import Popups from './popups/Popups';
import GameOver from './popups/GameOver';
import Score from './score/Score';
import Loader from './loader/Loader';
import Tutorial from './popups/Tutorial';
import Info from './popups/Info';
import R from 'ramda';

class Game extends Engine {
	constructor() {
		super(720, 1080);

		this.inputDisabled = false;
		this.load();
	}

	load() {
		const loader = new Loader(this);
		loader.events.on('bootLoadComplete', () => this.init());
		loader.events.on('loadComplete', (resources) => {
			this.initGame(resources);
		});
		loader.load();
	}

	init() {
		super.init();
	}

	initGame(resources) {
		Meow.cache.setup(resources);

		this.initBoard();
		this.initBallsController();
		this.initGrid();
		this.initPanel();
		this.initPopups();
		this.initGameOver();
		this.initScore();
		this.initInfo();
		this.initListeners();

		this.updateGrid();

		this.ballsController.spawn();
		this.ballsController.activateBalls();
		this.ballsController.spawn();

		const showTutorial = localStorage.getItem('showTutorial');
		if (showTutorial === null)
			this.initTutorial();

		this.onResize();
	}

	initListeners() {
		this.view.events.on('resize', () => this.onResize());
		this.board.events.on('inputReceived', (data) => this.processInput(data));

		this.ballsController.events.on('updateGrid', () => this.updateGrid());
		this.ballsController.events.on('removeBalls', (arr) => this.removeBalls(arr));
		this.ballsController.events.on('appendBalls', (arr) => this.appendBalls(arr));
		this.ballsController.events.on('showPopup', (color) => this.showPopup(color));
		this.ballsController.events.on('updateScore', (data) => this.updateScore(data));
		this.ballsController.events.on('gameOver', () => this.gameOver());

		this.gameOverComp.events.on('restart', () => this.restart());

		this.panel.events.on('restart', () => this.restart());
		this.panel.events.on('showInfo', () => this.info.show())
	}

	initBoard() {
		this.board = new Board(this);
		this.board.init();
	}

	initBallsController() {
		this.ballsController = new BallsController(this);
		this.ballsController.init();
	}

	initGrid() {
		this.grid = new Grid();
		this.grid.init();
	}

	initPanel() {
		this.panel = new Panel(this);
		this.panel.init();
	}

	initPopups() {
		this.popups = new Popups(this);
		this.popups.init();
	}

	initGameOver() {
		this.gameOverComp = new GameOver(this);
		this.gameOverComp.init();
	}

	initScore() {
		this.score = new Score(this);
		this.score.init();
	}

	initInfo() {
		this.info = new Info(this);
		this.info.init();
	}

	initTutorial() {
		this.tutorial = new Tutorial(this);
		this.tutorial.init();
		this.tutorial.show();
	}

	processInput(data) {
		if (this.inputDisabled) {
			return;
		}

		const {gridX, gridY} = data;
		const existsAndActive = this.ballsController.existsAndActive(gridX, gridY);

		if (this.ballsController.moving) {
			return;
		}

		//if ball in the input position exists and is approved select it
		if (existsAndActive) {
			this.ballsController.selectBall(gridX, gridY);
			return;
		}

		//if no ball in input position move current ball there
		if (this.ballsController.isSelected) {
			const ball = this.ballsController.selectedBall;
			const startNode = this.grid.getNode(ball.gridX, ball.gridY);
			const endNode = this.grid.getNode(data.gridX, data.gridY);
			const nodes = findPath(startNode, endNode, this.grid);

			if (nodes === null) {
				this.ballsController.selectedBall.stopBounceAnimation();
				this.ballsController.deselectCurrentBall();
				return;
			}

			const path = this.constructPath(nodes);
			this.ballsController.moveBallByPath(path, endNode);
		}
	}

	constructPath(nodes) {
		const pick = node => R.pick(['x', 'y'], node);
		const sequence = nodes.map(node => pick(node));
		const toBoardCoords = (node) => this.board.toBoardCoords(node);
		const path = sequence.map(node => toBoardCoords(node));

		return R.reverse(path.map(obj => [obj.x, obj.y]));
	}

	updateGrid() {
		const balls = this.ballsController.activeBalls;
		this.grid.resetNodes();
		balls.forEach(ball => {
			const {gridX, gridY} = ball;
			this.grid.occupyNode(gridX, gridY);
		})
	}

	removeBalls(balls) {
		const arr = Array.isArray(balls) ? balls.slice() : [balls];
		arr.forEach(ball => {
			this.board.removeBall(ball);
		});
	}

	appendBalls(balls) {
		const arr = Array.isArray(balls) ? balls.slice() : [balls];

		arr.forEach(ball => {
			this.board.appendBall(ball);
		});

		this.board.depthSort();
	}

	updateScore(data) {
		this.score.update(data);
		this.score.checkBestScore();
	}

	showPopup(color) {
		this.popups.show(color);
	}

	gameOver() {
		this.score.checkBestScore();
		this.gameOverComp.currentScore = this.score.currentScore;
		this.gameOverComp.show()
		this.panel.disable();
		this.inputDisabled = true;
	}

	restart() {
		this.score.checkBestScore();
		this.score.reset();
		this.panel.enable();
		this.grid.resetNodes();
		this.ballsController.restart();

		this.inputDisabled = false;
	}

	onResize() {
		this.popups.reposition();
		this.panel.reposition();
		this.board.reposition();
		this.gameOverComp.reposition();
		this.score.reposition();
		this.info.reposition();

		if (this.tutorial)
			this.tutorial.reposition();
	}
}

export default Game;