import PIXI from 'pixi.js';
import Game from './src/game/Game';
import Loader from './src/game/loader/Loader';

window.onload = () => {
	// const loader = new Loader();
	// loader.events.on('loadComplete', (resources) => {
	// 	const game = new Game(resources);
	// 	game.init();
	// })

	// loader.load();

	const game = new Game();
};
