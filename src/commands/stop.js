const play = require("./play");
module.exports = async (msg,args,plainContent)=>{
    var server = play.servers[msg.guild.id];
    if (msg.guild.voice.connection){
        delete play.servers[msg.guild.id];
        msg.guild.voice.connection.disconnect();
    }
};