const Discord = require('discord.js');
const Commando = require('discord.js-commando');

const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class ServerInfoCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'serverinfo',
        aliases: [],
        group: 'misc',
        memberName: 'serverinfo',
        guildOnly: true,
        userPermissions: [],
        clientPermissions: [],
        description: 'Displays information about the guild'
        });
    }

    run(message) {
        message.guild.members.fetch().then(fetchedMembers => {
            const totalOnline = fetchedMembers.filter(member => member.presence.status === 'online');
            
            const serverInfoMessage = new Discord.MessageEmbed()
                .setColor(embedSettings.color)
                .setAuthor("Server Info", 'https://img.favpng.com/7/9/16/discord-emoji-png-favpng-4s9PZDJ0kCnAxaykuEpt2F6c0.jpg', '')
                .setThumbnail("https://cdn.discordapp.com/icons/"+message.guild.id+"/"+message.guild.icon+".png")
                //.setDescription("")
                .addFields(
                    { name: 'Server', value: message.guild.name + " (" + message.guild.region + ")" },
                    { name: 'Members (online)', value: totalOnline.size, inline: true },
                    { name: 'Members (total)', value: message.guild.memberCount, inline: true },
                    { name: 'Owner', value: message.guild.owner, inline: true },
                    { name: 'Creation Date', value: message.guild.joinedAt, inline: false },
                    { name: 'Large', value: message.guild.large, inline: true },
                    { name: 'Verified', value: message.guild.verified, inline: true },
                    { name: 'Boost Level', value: message.guild.premiumTier, inline: true },
                )
                //.setTimestamp()
                .setFooter(embedSettings.footer, embedSettings.footer_url);
            
            message.channel.send(serverInfoMessage);
        });
    }
};