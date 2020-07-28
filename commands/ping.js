const Discord = require("discord.js");
module.exports = {
    name: 'ping',
    description: "Pings the bot",
    aliases: ["ping"],
    execute(message, args) {
        const {embedSettings} = require('../config.json');

        var ping = Date.now() - message.createdTimestamp + " ms";

        const pingMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('Pong!', 'https://images.emojiterra.com/google/android-nougat/512px/1f3d3.png', '')
            .addFields(
                { name: 'Latency', value:  `${Date.now() - message.createdTimestamp}` + " ms", inline: true }, // message.member.user.tag
            )
            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        message.channel.send(pingMessage);
    }
}




