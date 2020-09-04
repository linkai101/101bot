const Discord = require('discord.js');
const Commando = require('discord.js-commando');

const path = require('path');
const {embedSettings, bot_info, ownerID} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class BotInfoCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'info',
        aliases: [],
        group: 'misc',
        memberName: 'info',
        guildOnly: false,
        userPermissions: [],
        clientPermissions: [],
        description: 'Displays information about the bot'
        });
    }

    run(message) {
        const infoMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('Bot info', embedSettings.image_url, '')
            .setTitle(bot_info.name)
            .addFields(
                { name: 'Tag', value: `${this.client.user.tag}`, inline: true },
                { name: 'Version', value: `v${bot_info.version}`, inline: true },
                { name: 'Owner', value: `${this.client.users.cache.get(ownerID).tag}`, inline: false },
                { name: 'Ping', value: `${Math.round(this.client.ws.ping)} ms`, inline: true },
                { name: 'Uptime', value: `${module.exports.msToTime(this.client.uptime)}`, inline: true },
            )
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        message.channel.send(infoMessage);
    }

    static msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
      
        return hrs + ':' + mins + ':' + secs + '.' + ms;
    }
};