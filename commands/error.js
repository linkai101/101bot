const Discord = require("discord.js");
module.exports = {
    name: 'error',
    description: "Error message",
    execute(message, args, errorID) {
        const {embedSettings} = require('../config.json');

        const errorMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Error", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("An error occured!\n\nID: `" + errorID + "`")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        message.channel.send(errorMessage);
    }
}




