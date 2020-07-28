const Discord = require("discord.js");
module.exports = {
    name: 'banList',
    description: "Shows a list of banned users in the guild",
    aliases: ["banlist"],
    execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }

        if (!message.member.hasPermission(["BAN_MEMBERS", "ADMINSTRATOR"])) {client.commands.get('noPermission').execute(message, args, Discord);return;}

        message.guild.fetchBans()
            .then(banned => {
                let list = banned.map(ban => ban.user.tag).join('\n');


                // Make sure if the list is too long to fit in one message, you cut it off appropriately.
                if (list.length >= 1950) list = `${list.slice(0, 1948)}...`;

                let banlistMessage = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setAuthor(message.guild.name+' Banlist', "https://cdn.discordapp.com/icons/"+message.guild.id+"/"+message.guild.icon+".png", '')
                    .setThumbnail("https://cdn.discordapp.com/icons/"+message.guild.id+"/"+message.guild.icon+".png")
                    .setDescription("`"+banned.size+"` users are banned from **"+message.guild.name+"**\n\n"+list)
                    .addFields(
                    )
                    //.setTimestamp()
                    .setFooter(embedSettings.footer, embedSettings.footer_url);

                message.channel.send(banlistMessage);
            }).catch(catchErr);

    }
}




