const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class BanlistCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'banlist',
            group: 'moderation',
            memberName: 'banlist',
            description: 'View banned users from the guild',
            guildOnly: true,
            userPermissions: [
                'BAN_MEMBERS'
            ],
            clientPermissions: []
        })
    }

    async run (message) {
        const catchErr = err => {
            console.log("ERROR> " + err);
        }

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

