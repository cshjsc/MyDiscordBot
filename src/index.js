const Discord = require('discord.js');
const commandHandler = require('./commands');
require('dotenv').config();
const youtubeAuth = require('./quickstart.js');
const client = new Discord.Client();
console.log("login in youtube");
youtubeAuth();
client.once('ready',()=>{
    console.log('REadyyyyyy')
});

client.on('message',commandHandler);


client.login(process.env.BOT_TOKEN);