const config = require('../config/config.json');

const logger = require('./logger.js')('VLC-Discord-RPC', config.general.loglevel);
const Discord = require('discord-rich-presence')('410664151334256663');	// The last part is the app id for discord.
const VLC = require('./vlc.js')(config.vlc);

logger.debug('Configuration:');
logger.debug('- General:');
logger.debug(' - Refresh Interval: ' + config.general['refresh-interval']);
logger.debug(' - Logger Level: ' + config.general.loglevel);
logger.debug('- VLC:');
logger.debug(' - Hostname: ' + config.vlc.hostname);
logger.debug(' - Port: ' + config.vlc.port);
logger.debug(' - Password: ' + config.vlc.password);

function escapeHtml(text) {
	return text
		.replace(/(&#39;)/g, "'")
		.replace(/(&amp;)/g, '&')
		.replace(/(&lt;)/g, '<')
		.replace(/(&gt;)/g, '>')
		.replace(/(&quot;)/g, '"');
}

// Used to check if there have been updates
var nowPlaying = { state: '', details: '', smallImageKey: '' };

// Returns the now playing object for Discord from a status
function getNowPlaying(status) {
	var nowPlaying = { largeImageKey: 'vlc', instance: true };
	if (status) {
		nowPlaying.smallImageKey = status.state;
		nowPlaying.details = escapeHtml(status.title);
		nowPlaying.state = escapeHtml(status.artist + ' - ' + status.album);
		if (status.state === 'playing') {
			var now = Date.now() / 1000;
			nowPlaying.startTimestamp = now;
			nowPlaying.endTimestamp = parseInt(now) + (parseInt(status.duration) - parseInt(status.time));
		}
	} else {
		nowPlaying.smallImageKey = 'paused';
		nowPlaying.details = 'Nothing playing';
		nowPlaying.state = ' - ';
	}
	return nowPlaying;
}

VLC.requestStatus(function (status) {
	var newPlaying = getNowPlaying(status);
	if (newPlaying.state !== nowPlaying.state || newPlaying.details !== nowPlaying.details || newPlaying.smallImageKey !== nowPlaying.smallImageKey) {
		logger.info('Changes detected; Sending to Discord');
		logger.verbose('Details: "' + newPlaying.details + '"; State: "' + newPlaying.state + '"; SmallImagesKey: "' + newPlaying.smallImageKey + '";');
		Discord.updatePresence(newPlaying);
		nowPlaying = newPlaying;
	}
}, config.general['refresh-interval']);