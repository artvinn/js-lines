import root from './view/root';

export default class Container {
	constructor() {
		this.content = null;
	}

	init() {
		this.content = new PIXI.Container();
		this.content.depth = 1;

		root.addChild(this.content);
	}

	show() {
		this.content.visible = true;
	}

	hide() {
		this.content.visible = false;
	}

	get depth() {
		return this.content.depth;
	}

	set depth(depth) {
		this.content.depth = depth;
	}
}