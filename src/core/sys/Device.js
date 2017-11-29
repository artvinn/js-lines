import * as isMobile from 'ismobilejs';

const Device = {
	isMobile() {
		return isMobile.any;
	},

	isLowEnd() {
		return navigator.userAgent.match(/iPhone/i) !== null  && window.screen.height === (960 / 2);
	}
};

export default Device;