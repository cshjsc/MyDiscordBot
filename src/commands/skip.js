const play = require("./play");
const stop = require("./stop");
module.exports = async (msg,args,plainContent)=>{
    const server = play.servers[msg.guild.id];
    if (server.dispatcher&& server.queue[0]){
        console.log('skip command');
        play.playQueue(server.connection,msg)
    }else {
        await stop(msg,args,plainContent);
    }
};