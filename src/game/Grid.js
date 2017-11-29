class Node {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.G = 0;
		this.H = 0;
		this._parentNode = null;
		this._walkable = true;
		this._score = 0;
	}

	get walkable() {
		return this._walkable;
	}

	set walkable(bool) {
		this._walkable = bool;
	}

	get score() {
		return this.G + this.H;
	}

	get parentNode() {
		return this._parentNode;
	}

	set parentNode(node) {
		this._parentNode = node;
	}

	reset() {
		this.G = 0;
		this.H = 0;
		this._parentNode = null;
		this._walkable = true;
		this._score = 0;
	}
};

export default class Grid {
	constructor() {
		this.width = 9;
		this.height = 9;
		this._nodes = [];
	}

	init() {
		this.initMatrix();
	}

	initMatrix() {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this._nodes.push(new Node(i, j));
			}
		}
	}

	getNode(x, y) {
		for (let node of this._nodes) {
			if (node.x === x && node.y === y)
				return node;
		}

		throw new Error(`Node with coordinates x: ${x}, y: ${y} not found`);
	}

	occupyNode(x, y) {
		const node = this.getNode(x, y);
		node.walkable = false;
	}

	freeNode(x, y) {
		const node = this.getNode(x, y);
		node.walkable = true;
	}

	getNeighbours(node) {
		const neibs = [];
		const {x, y} = node;

		if (y + 1 <= this.height - 1) {
			neibs.push(this.getNode(x, y + 1));
		}

		if (x + 1 <= this.width - 1) {
			neibs.push(this.getNode(x + 1, y));
		}

		if (y - 1 >= 0) {
			neibs.push(this.getNode(x, y - 1));
		}

		if (x - 1 >= 0) {
			neibs.push(this.getNode(x - 1, y));
		}
		
		return neibs;
	}

	resetNodes() {
		this._nodes.forEach(node => node.reset());
	}
}