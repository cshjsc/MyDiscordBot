const messages = require('./resources/messages.json');


module.exports = async (msg,args,plainContent) => {
    if (messages.hasOwnProperty(plainContent)) {
        const reply = messages[plainContent];
        await msg.channel.send(`${msg.author} ${reply}`);
    }
};