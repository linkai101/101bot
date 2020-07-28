const Discord = require("discord.js");
module.exports = {
    name: 'tempban',
    description: "Temporarily bans a member",
    aliases: ["tempban"],
    execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }

        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"tempban <@user> <days> <reason>`")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (!message.member.hasPermission(["BAN_MEMBERS", "ADMINSTRATOR"])) {client.commands.get('noPermission').execute(message, args, Discord);return;}
        if (args.length < 3) {
            message.channel.send(usageMessage);
            return;
        }

        const tempbanReason = message.content.substr(prefix.length+8+args[0].length+args[1].length+2,message.content.length-1);

        if (!message.guild.member(message.mentions.members.first())) {client.commands.get('error').execute(message, args, "User not in guild"); return;}

        const tempbanSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Tempban Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@"+message.mentions.members.first() + "> has been temporarily banned from **" + message.guild.name + "** for `" + tempbanReason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (message.mentions.members.first()) {
            message.guild.member(message.mentions.members.first()).ban({days: args[1], reason: tempbanReason}).catch(catchErr);
            if (!message.guild.member(message.mentions.members.first()).bannable) {return;}
            message.channel.send(tempbanSuccessMessage);
        } else {
            message.channel.send(usageMessage);
        }

    }
}




