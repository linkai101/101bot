const Discord = require('discord.js');
const commando = require('discord.js-commando');
const pool = require('./lib/dbpool');
const xp = require('./lib/xp');
const modules = require('./lib/modules')
const prefixes = require('./lib/prefixes');
const presence = require('./lib/presence');

const path = require('path');
const config = require(path.join(__dirname, 'config', 'config.json'));

Discord.Structures.extend('Guild', Guild => {
    class MusicGuild extends Guild {
        constructor(client, data) {
            super(client, data);
            this.musicData = {
                queue: [],
                isPlaying: false,
                volume: 1,
                songDispatcher: null
            };
        }
    }
    return MusicGuild;
});

const client = new commando.CommandoClient({
    owner: config.ownerID,
    commandPrefix: config.prefix,
    support: config.discordInvite,
    nonCommandEditable: true, // Whether messages without commands can be edited to a command
    commandEditableDuration: 30, // Time in seconds that command messages should be editable
});


client.registry
    .registerDefaults()
    .registerGroups([
        ['music', 'Music'],
        ['levels', 'Levels'],
        ['economy', 'Economy'],
        ['misc', 'Misc']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log("BOT> Logged in successfully!");
    
    // Setting Discord Bot Presence
    presence.set(client);

    // Assigning all stored prefixes on mySQL
    prefixes.dbFetch();

    // Disabling disabled modules on mySQL
    modules.dbFetch(client);
})

// Joins a server
client.on("guildCreate", guild => {
    console.log(`GUILD> Joined "${guild.name}"`);

    const joinedGuildMessage = new Discord.MessageEmbed()
            .setColor(config.embedSettings.color)
            .setAuthor(`Joined ${guild.name}`, config.embedSettings.image_url, '')
            .setThumbnail(`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
            .setTitle(`Thank you for adding 101bot to ${guild.name}!`)
            .setDescription(
                `101bot is a multifunctional bot created by ${client.users.cache.get(config.ownerID).tag} with music, economy, and leveling features. (and more to come!)\n\n`+
                `Modules can be enabled and disabled for you guild. Run the command \`;modules\` for more info.\n\n`+
                `Get started by running the command \`;help\`. (The prefix for your guild can be changed with the \`prefix\` command.)`
            )
            .addFields(
                { name: 'Support', value: `Join the [support server](${config.discordInvite}) for support, changelog, and live development previews.` },
            )
            .setFooter(config.embedSettings.footer, config.embedSettings.footer_url);
    guild.owner.send(joinedGuildMessage);
})

// Removed from a server
client.on("guildDelete", guild => {
    console.log(`GUILD> Left "${guild.name}"`);
})

client.on("message", async message => {
    if (message.author.bot) return;
    if (message.guild) xp.update(message);
});

client.on('guildMemberAdd', member => { // When a new user joins
});

client.login(config.token);

