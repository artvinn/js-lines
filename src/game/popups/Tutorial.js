import Screen from './../../core/view/Screen';

export default class Tutorial {
	constructor(game) {
		this.game = game;
	}

	init() {
		this.content = new PIXI.Container();
		this.game.root.addChild(this.content);

		this.initOverlay();
		this.initText();
		this.initHand();

		this.reposition();
	}

	initOverlay() {
		const texture = Meow.cache.getTexture('black_overlay');
		this._overlay = new PIXI.Sprite(texture);
		this._overlay.alpha = 0.7;
		this._overlay.interactive = true;
		this._overlay.mousedown = () => this.hide();
		this._overlay.touchstart = () => this.hide();
		this.content.addChild(this._overlay);
	}

	initText() {
		this._text = new PIXI.extras.BitmapText(
			`Remove balls by forming lines
			(horizontal, vertical or diagonal) 
			of at least 5 balls of the same color.`, 
			{font: "46px popupsFont",
			align: 'center',
			});
		this.content.addChild(this._text);
	}

	initHand() {
		const texture = Meow.cache.getTexture('hand.png');
		this._hand = new PIXI.Sprite(texture);
		this._hand.x = this.game.width / 2 - this._hand.width / 2;
		this._hand.y = 400;
		this.content.addChild(this._hand);
	}

	show() {
		this.content.visible = true;
	}

	hide() {
		this.content.visible = false;
		localStorage.setItem('showTutorial', false);
	}

	reposition() {
		const orientation = Screen.orientation;
		const config = Meow.cache.getJSON(orientation);

		this._overlay.width = config.width;
		this._overlay.height = config.height;

		this._text.x = config.tutorial.text.x;
		this._text.y = config.tutorial.text.y;

		this._hand.x = this.game.width / 2 - this._hand.width / 2;
		this._hand.y = this.game.height / 2 + 50;
	}
}