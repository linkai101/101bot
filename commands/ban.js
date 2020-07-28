const Discord = require("discord.js");
module.exports = {
    name: 'ban',
    description: "Bans a member",
    aliases: ["ban"],
    execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }

        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"ban <@user> <reason>`")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (!message.member.hasPermission(["BAN_MEMBERS", "ADMINSTRATOR"])) {client.commands.get('noPermission').execute(message, args, Discord);return;}
        if (args.length < 2) {
            message.channel.send(usageMessage);
            return;
        }

        const banReason = message.content.substr(message.content.split(" ")[0].length+1,message.content.length-1);

        if (!message.guild.member(message.mentions.members.first())) {client.commands.get('error').execute(message, args, "User not in guild"); return;}

        const banSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Ban Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@"+message.mentions.members.first() + "> has been permanently banned from **" + message.guild.name + "** for `" + banReason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (message.mentions.members.first()) {
            message.guild.member(message.mentions.members.first()).ban({reason: banReason}).catch(catchErr);
            if (!message.guild.member(message.mentions.members.first()).bannable) {return;}
            message.channel.send(banSuccessMessage);
        } else {
            message.channel.send(usageMessage);
        }

    }
}




