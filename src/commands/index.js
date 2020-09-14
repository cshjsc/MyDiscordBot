const channels_ids = [
	"693470943892209686",
	"694104583777157190",
	"645225006351122435",
	"687647691676581915",
	"690720242216730650",
	"718885842520637472",
];
const reply = require("./reply");
const play = require("./play");
const stop = require("./stop");
const skip = require("./skip");
//we could change names
const commands = {
	reply: reply,
	play: play,
	stop: stop,
	skip: skip,
};

module.exports = async (msg) => {
	if (channels_ids.includes(msg.channel.id)) {
		// /s means search for a white space btu /s+ means search for any amount of whitespaces
		const args = msg.content.split(/\s+/g);
		if (args.length === 0 || args[0].charAt(0) !== "!") return;
		const command = args.shift().substring(1);
		console.log("args" + args.toString());
		console.log("msg" + msg.content.toString());
		if (Object.keys(commands).includes(command)) {
			const plainContent = args.join(" ");
			commands[command](msg, args, plainContent);
		}
	}
};
