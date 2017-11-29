const Screen = {
	isLandscape() {
		const w = window.innerWidth;
		const h = window.innerHeight;

		return w > h;
	},

	isPortrait() {
		const w = window.innerWidth;
		const h = window.innerHeight;

		return w < h;
	},

	get width() {
		return window.innerWidth;
	},

	get height() {
		return window.innerHeight;
	},

	get orientation() {
		if (this.isLandscape())
			return 'landscape';
		else
			return 'portrait';
	}
};

export default Screen;