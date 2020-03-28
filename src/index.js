const Discord = require('discord.js');

const client = new Discord.Client();

client.once('ready',()=>{
    console.log('REadyyyyyy')
});
client.login(process.env.BOT_TOKEN);