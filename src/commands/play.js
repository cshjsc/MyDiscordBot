const servers = {};
const YTDL = require("ytdl-core");
const { google } = require("googleapis");
require("dotenv").config();
module.exports = async (msg, args, plainContent) => {
	const voiceChannel = msg.member.voice.channel;
	if (voiceChannel) {
		if (!servers[msg.guild.id]) {
			servers[msg.guild.id] = {
				queue: [],
				search: [],
			};
		}
		const server = servers[msg.guild.id];
		if (validURL(args[0])) {
			server.queue.push(args[0]);
		} else if (!isNaN(args[0])) {
			if (server.search.length === 0) {
				msg.reply(
					"You probably haven't search anything try searching by saying !play <name>"
				);
			} else {
				if (args[0] <= 0 || args[0] > server.search.length) {
					msg.reply("Enter a valid number");
				} else {
					const url = server.search[args[0] - 1].url;
					server.queue.push(url);
				}
			}
			//just play a song if no arguments
		} else if (args.length === 0) {
			server.queue.push("https://www.youtube.com/watch?v=6xUnSVTh8fI");
		} else {
			await searchByKeyword(server, msg, plainContent);
			return;
		}
		if (!servers[msg.guild.id].connection) {
			voiceChannel
				.join()
				.then((connection) => {
					servers[msg.guild.id].connection = connection;
					playQueue(connection, msg);
				})
				.catch((err) => console.log(err));
		}
	} else {
		await msg.reply("You need to join a voice channel first!");
	}
};
const playQueue = function (connection, msg) {
	const server = servers[msg.guild.id];
	const currentUrl = server.queue[0];
	server.dispatcher = connection.play(
		YTDL(currentUrl, { filter: "audioonly" })
	);
	server.queue.shift();
	server.dispatcher.on("finish", (finish) => {
		if (server.queue[0]) {
			playQueue(connection, msg);
		} else {
			delete servers[msg.guild.id];
			connection.disconnect();
		}
	});
	server.dispatcher.on("error", (onerror) => {
		console.log("Error:" + onerror.toString());
		msg.reply("error" + onerror.toString());
	});
};

module.exports.servers = servers;
module.exports.playQueue = playQueue;

function validURL(str) {
	var pattern = new RegExp(
		"^(https?:\\/\\/)?" + // protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // fragment locator
	return !!pattern.test(str);
}

async function searchByKeyword(server, msg, plainContent) {
	const service = google.youtube("v3");
	service.search.list(
		{
			part: "id,snippet",
			key: process.env.YOUTUBE_API_KEY,
			q: plainContent,
			type: "video",
			maxResults: 5,
		},
		function (err, response) {
			let output = "\n";
			if (err) {
				console.log("The API returned an error: " + err);
				return;
			}
			if (response.data.items.length === 0) {
				output = "No results found";
			} else {
				server.search = [];
				for (let i in response.data.items) {
					const item = response.data.items[i];
					server.search.push({
						url: "https://www.youtube.com/watch?v=" + item.id.videoId,
						name: item.snippet.title,
					});
					const outputIndex = +i + +1;
					output += outputIndex + ") " + item.snippet.title + "\n";
				}
			}
			msg.reply(output);
		}
	);
}
