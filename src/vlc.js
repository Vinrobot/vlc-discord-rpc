const VlcService = require('droopy-vlc');

VlcService.prototype.requestStatus = function (callback, interval) {
	if (typeof interval === 'number' && interval > 1) {
		this.requestStatus(callback);
		var self = this;
		return setInterval(function () {
			self.requestStatus(callback);
		}, interval);
	} else {
		this.status().then(function (status) {
			callback(status, undefined);
		}, function (error) {
			callback(undefined, error);
		}).catch(function (error) {
			console.log(error);
		});
	}
}

module.exports = function (config) {
	return new VlcService(typeof config === 'string' ? config : 'http://:' + config.password + '@' + config.hostname + ':' + config.port)
};