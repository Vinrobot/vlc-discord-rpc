const config = require('./config.json');

const Discord = require('discord-rich-presence')('410664151334256663');	// The last part is the app id for discord.
const VLC = new (require('droopy-vlc'))('http://:' + config.vlc.password + '@' + config.vlc.hostname + ':' + config.vlc.port);

const debug = config.general.debug ? function() {
	console.log.apply(this, arguments);
} : function() {};

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
			nowPlaying.endTimestamp = parseInt(parseInt(now) + (parseInt(status.duration) - parseInt(status.time)));
		}
	} else {
		nowPlaying.smallImageKey = 'paused';
		nowPlaying.details = 'Nothing playing';
		nowPlaying.state = ' - ';
	}
	return nowPlaying;
}

function statusUpdateFromVLC(status) {
	var newPlaying = getNowPlaying(status);
	if (newPlaying.state !== nowPlaying.state || newPlaying.details !== nowPlaying.details || newPlaying.smallImageKey !== nowPlaying.smallImageKey) {
		console.log('Changes detected; Sending to Discord');
		debug("\tDetails:       \t" + newPlaying.details);
		debug("\tState:         \t" + newPlaying.state);
		debug("\tSmallImagesKey:\t" + newPlaying.smallImageKey);
		Discord.updatePresence(newPlaying);
		nowPlaying = newPlaying;
	}
}

// Function called to check for changes in playback
// Will update Discord Rich Presence if needed
function update() {
	VLC.status().then(function (status) {
		// Called when receiving the current status
		statusUpdateFromVLC(status);
	}, function(error) {
		// If there is no playback playing (nor in pause)
		// The call will fail with an error
		statusUpdateFromVLC(undefined);
	});
}

// Check for update every X milliseconds
// Value set in config.json general > refres-interval
setInterval(update, config.general["refresh-interval"]);
update();