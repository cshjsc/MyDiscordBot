const servers = {};
const YTDL = require("ytdl-core");
const {google} = require('googleapis');
require("dotenv").config();
module.exports = async (msg, args, plainContent) => {
    const voiceChannel = msg.member.voice.channel;
    console.log(servers);
    if (voiceChannel) {
        if (!servers[msg.guild.id]) {
            console.log('not in server');
            servers[msg.guild.id] = {
                queue: [],
                search: []
            };
            console.log(servers);
        }
        const server = servers[msg.guild.id];
        if (validURL(args[0])) {
            server.queue.push(args[0])
        } else if (!isNaN(args[0])) {
            if (server.search.length === 0){
                msg.reply("You probably haven't search anything try searching by saying !play <name>");
            }else{
                if (args[0] <= 0 || args[0]> server.search.length){
                    msg.reply("Enter a valid number");
                }else {
                    const url = server.search[(args[0]-1)].url;
                    server.queue.push(url);
                }
            }
        } else if (args.length === 0) {

            server.queue.push("https://www.youtube.com/watch?v=6xUnSVTh8fI");
        } else {
            await searchByKeyword(server, msg,plainContent);
            return;
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
const playQueue = function (connection, msg) {
    const server = servers[msg.guild.id];
    console.log("playing"+server.queue[0]);
    server.dispatcher = connection.play(YTDL(server.queue[0]), {filter: "audioonly"});
    server.queue.shift();
    console.log(server.queue);
    server.dispatcher.on("finish", finish => {
        if (server.queue[0]) {
            console.log("playing queue");
            playQueue(connection, msg);
        } else {
            console.log("deleting queue and server");
            delete servers[msg.guild.id];
            connection.disconnect();
        }
    })
};

module.exports.servers = servers;
module.exports.playQueue = playQueue;

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

async function searchByKeyword(server, msg , plainContent) {

    const service = google.youtube('v3');
    service.search.list({
        part: 'id,snippet',
        key: process.env.YOUTUBE_API_KEY,
        q: plainContent,
        maxResults: 5
    }, function (err, response) {
        let output = "";
        if (err) {
            console.log('The API returned an error: ' + err);
            output = "The API returned an error";
            return;
        }
        if (response.data.items.length === 0) {
            output = "No results found"
        } else {
            server.search = [];
            for (let i in response.data.items) {
                console.log(i);
                const item = response.data.items[i];
                console.log('[%s] Title: %s', item.id.videoId, item.snippet.title);
                server.search.push({
                    "url": 'https://www.youtube.com/watch?v='+item.id.videoId,
                    "name": item.snippet.title
                });
                const outputIndex= +i+ +1;
                output += outputIndex+") "+item.snippet.title+"\n";
            }
        }
        // console.log(server.search[0]);
        msg.reply(output);
    });

}
