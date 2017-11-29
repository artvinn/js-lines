import root from '../../core/view/root';
import TWEEN from 'tween.js';

export default class LoaderView {
	constructor(game) {
		this.logo = null;

		this.game = game;
	}

	show() {
		this.logo = new PIXI.Sprite.fromFrame('resources/images/logo.png');
		this.logo.rotation = -0.087;
		this.logo.anchor.set(0.5);
		this.logo.x = this.game.width / 2;
		this.logo.y = this.game.height / 2;
		root.addChild(this.logo);

		const sprite = this.logo;
		this.tween = new TWEEN.Tween({scale: 1})
			.to({scale: 1.5}, 5000)
			.onUpdate(function() {
				sprite.scale.set(this.scale);
			})
			.start();
	}

	hide() {
		this.tween.stop();
		root.removeChild(this.logo);
	}
}