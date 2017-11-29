import Screen from '../../core/view/Screen';

export default class Info {
	constructor(game) {
		this.game = game;
	}

	init() {
		this.content = new PIXI.Container();
		this.game.root.addChild(this.content);

		this.initOverlay();
		this.initLogo();
		this.initText();
		this.reposition();

		this.hide();
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

	initLogo() {
		const texture = Meow.cache.getTexture('branding');
		this._logo = new PIXI.Sprite(texture);
		this.content.addChild(this._logo);
	}

	initText() {
		this._byText = new PIXI.extras.BitmapText(
			`Made by`, 
			{font: "70px popupsFont",
			align: 'center',
		});
		this._text = new PIXI.extras.BitmapText(
			`This game is HTML5 conversion of old game 
			Color Lines by Oleg Demin`, 
			{font: "25px popupsFont",
			align: 'center',
		});

		this.content.addChild(this._byText);
		// this.content.addChild(this._text);
	}

	show() {
		this.content.visible = true;
	}

	hide() {
		this.content.visible = false;
	}

	reposition() {
		const orientation = Screen.orientation;
		const config = Meow.cache.getJSON(orientation);

		this._overlay.width = config.width;
		this._overlay.height = config.height;

		this._logo.x = this.game.width / 2 - this._logo.width / 2;
		this._logo.y = this.game.height / 2 - this._logo.height / 2;

		this._text.x = this.game.width / 2 - this._text.width / 2;
		this._text.y = this.game.height / 2 + 280;

		this._byText.x = this.game.width / 2 - this._byText.width / 2;
		this._byText.y = this.game.height / 2 - 220;
	}
}