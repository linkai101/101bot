const Discord = require("discord.js");
module.exports = {
    name: 'rickRoll',
    description: "Sends a rick roll message to a channel",
    aliases: ["rickroll", "rr"],
    execute(client, message, args) {
        const {prefix, embedSettings, rickRollMessages} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }
        
        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"rickroll <#channel/channelID>`")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        const noPermsMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('No permission', 'https://images.emojiterra.com/google/android-pie/512px/1f6d1.png', '')
            .setDescription("You do not have permission to send messages in that channel!")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        const unknownChannelMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('Unknown channel', 'https://images.emojiterra.com/google/android-nougat/512px/26a0.png', '')
            .setDescription("The channel that you've specified doesn't exist!")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (args.length == 0) {
            message.channel.send(usageMessage);
            return;
        }

        let rickRollChannel = client.channels.cache.get(args[0].split("<#").join("").split(">").join(""));

        if (!rickRollChannel) {
            message.channel.send(unknownChannelMessage);
            return;
        }
        
        if (!message.guild.member(message.author).permissionsIn(rickRollChannel).has("SEND_MESSAGES")) {
            message.channel.send(noPermsMessage);
            return;
        }

        /*let rickRollMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("101bot", embedSettings.image_url, '')
            .setDescription(rickRollMessages[Math.floor(Math.random()*rickRollMessages.length)])

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);*/

            rickRollMessage = rickRollMessages[Math.floor(Math.random()*rickRollMessages.length)];
        
        try {rickRollChannel.send(rickRollMessage).catch(catchErr);}
        catch(err) {
            message.channel.send(usageMessage);
        }

    }
}




