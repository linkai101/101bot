const Discord = require("discord.js");
module.exports = {
    name: 'kick',
    description: "Kicks a member",
    aliases: ["kick"],
    execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }

        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"kick <@user> <reason>`")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (!message.member.hasPermission(["KICK_MEMBERS", "ADMINSTRATOR"])) {client.commands.get('noPermission').execute(message, args, Discord);return;}
        if (args.length < 2) {
            message.channel.send(usageMessage);
            return;
        }
    
        const kickReason = message.content.substr(prefix.length+5+args[0].length+1,message.content.length-1);

        if (!message.guild.member(message.mentions.members.first())) {client.commands.get('error').execute(message, args, "User not in guild"); return;}

        const kickSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Kick Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@"+message.mentions.members.first() + "> has been kicked from **" + message.guild.name + "** for `" + kickReason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (message.mentions.members.first()) {
            message.mentions.members.first().kick(kickReason).catch(catchErr);
            if (!message.guild.member(message.mentions.members.first()).kickable) {return;}
            message.channel.send(kickSuccessMessage);
        } else {
            message.channel.send(usageMessage);
        }

    }
}




