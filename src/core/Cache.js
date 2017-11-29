export default class Cache {
	constructor() {
		this._textures = null;

		this._json = null;
	}

	init() {
		this._textures = {};
		this._json = {};
	}

	setup(resources) {
		for (let key in resources) {
			let res = resources[key];

			if (res.isImage) {
				this._processImage(res);
				continue;
			}

			if (res.isJson) {
				this._processJSON(res);
				continue;
			}
		}
	}

	_processImage(res) {
		this.addTexture(res.name, res.texture);
	}

	_processJSON(res) {
		const key = res.name;
		const data = res.data;

		if (this._json[key])
			throw new Error(`JSON with name: '${key}' already exists`);

		if (res.textures) {
			for (let key in res.textures) {
				const tex = res.textures[key];
				this.addTexture(key, tex);
			}
		}

		this._json[key] = data;
	}

	getJSON(id) {
		const json = this._json[id];

		if (!json)
			throw new Error(`JSON with id: '${id}' does not exist`);

		return json;
	}

	addTexture(id, texture) {
		if (this._textures[id])
			throw new Error(`Texture with id: '${id}' already exists`);

		this._textures[id] = texture;
	}

	getTexture(id) {
		const texture = this._textures[id];

		if (!texture)
			throw new Error(`Texture with id: '${id}' does not exist`);

		return texture;
	}
}