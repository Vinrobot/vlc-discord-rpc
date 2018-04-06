const winston = require('winston');

function pad(number) {
	return number < 10 ? '0' + number : number;
}

function formatDate(date) {
	return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate()) + ' ' + pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes()) + ':' + pad(date.getUTCSeconds());
}

module.exports = function(loggerName, logLevel) {
	return new (winston.Logger)({
		level: logLevel,
		transports: [
			new (winston.transports.Console)({
				formatter: function (options) {
					return '[' + formatDate(new Date()) + '] ' + 
						'[' + loggerName + '] ' + 
						'<' + winston.config.colorize(options.level, options.level.toUpperCase()) + '> ' + 
						(options.message ? options.message : '') + 
						(options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
				}
			})
		]
	});
}