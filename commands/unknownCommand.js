const Discord = require("discord.js");
module.exports = {
    name: 'unknownCommand',
    description: "Unknown command message",
    execute(message, args) {
        const {prefix, embedSettings} = require('../config.json');
        const unknownCommandMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('Unknown command', embedSettings.image_url, '')
            .setDescription("Type `" + prefix + "help` for the help page.")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        message.channel.send(unknownCommandMessage);
    }
}




