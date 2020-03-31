const servers = {};
const YTDL = require("ytdl-core");
module.exports = async (msg, args, plainContent) => {
    const voiceChannel = msg.member.voice.channel;
    console.log(servers);
    if (voiceChannel) {
        if (!servers[msg.guild.id]) {
            console.log('not in server');
            servers[msg.guild.id] = {
                queue: []
            }
        }
        const server = servers[msg.guild.id];
        if (args.length === 0) {
            server.queue.push("https://www.youtube.com/watch?v=6xUnSVTh8fI");
        }else{
            server.queue.push(args[0])
        }
        if (!servers[msg.guild.id].connection) {
            console.log("no connection");
            voiceChannel.join().then(connection => {
                servers[msg.guild.id].connection = connection;
                playQueue(connection, msg);
            }).catch(err => console.log(err));
        }
    } else {
        await msg.reply('You need to join a voice channel first!');
    }
};
module.exports.servers = servers;
const playQueue = function (connection, msg) {
    const server = servers[msg.guild.id];
    server.dispatcher = connection.play(YTDL(server.queue[0]),{filter: "audioonly"});
    server.queue.shift();
    server.dispatcher.on("finish", finish => {
        if (server.queue[0]) {
            console.log("playing queue");
            playQueue(connection, msg);
        } else {
            delete servers[msg.guild.id];
            connection.disconnect();
        }
    })
};
module.exports.playQueue = playQueue;
