const Discord = require("discord.js");
module.exports = {
    name: 'noPermission',
    description: "No permission message",
    execute(message, args) {
        const {embedSettings} = require('../config.json');

        const noPermsMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('No permission', 'https://images.emojiterra.com/google/android-pie/512px/1f6d1.png', '')
            .setDescription("You do not have permission to run that command!")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        message.channel.send(noPermsMessage);
    }
}




