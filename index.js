const client = require('discord-rich-presence')('410664151334256663');	//last part is the app id for discord. Dont change.
const config = require('./config.json');
var vlcService = require('droopy-vlc'),
	vlc = new vlcService('http://:' + config.vlc.password + '@' + config.vlc.hostname + ':' + config.vlc.port);

function escapeHtml(text) {
	return text
		.replace(/(&#39;)/g, "'")
		.replace(/(&amp;)/g, '&')
		.replace(/(&lt;)/g, '<')
		.replace(/(&gt;)/g, '>')
		.replace(/(&quot;)/g, '"');
}

//used to check if there have been updates
var nowPlaying = { state: '', details: '', smallImageKey: '' };

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
		console.log('Changes detected; sending to Discord');
		client.updatePresence(newPlaying);
		nowPlaying = newPlaying;
	}
}

//checks for changes in playback and if it finds any it updates your presence
function update() {
	vlc.status().then(function (status) {
		statusUpdateFromVLC(status);
	}, function(error) {
		statusUpdateFromVLC(undefined);
	});
}

update();
setInterval(update, 5000);	//check for updates every 5000ms (5 seconds)