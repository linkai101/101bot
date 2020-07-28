const Discord = require('discord.js');

const client = new Discord.Client();

const {token, bot_info, prefix} = require('./config.json');

const fs = require('fs');

// Command handler
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

// Getting sounds list for soundboard cuz it doesn't work in the file for some reason
const sounds = fs.readdirSync('./soundboard/').filter(file => file.endsWith('.mp3'));
var i;
for (i=0;i<sounds.length;i++) {
    sounds[i] = sounds[i].replace('.mp3','')
}

/*

ERROR MESSAGE HANDLING
(add ".catch(catchErr)" after function)

const catchErr = err => {
    console.log("ERROR> " + err);
    client.commands.get('error').execute(message, args, Discord, err);
}

*/


// Connected message
client.once('ready', () => {
    console.log('LOG> 101bot is now online!');

    client.user.setActivity(bot_info.status, { type: bot_info.statusType }) // PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM_STATUS
        .then(presence => console.log(`LOG> Activity set to '${presence.activities[0].type} ${presence.activities[0].name}'`))
        .catch(console.error);
});

// Executes when a message is sent
client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return; // Aborts if message doesn't start with prefix

    // Command args
    const args = message.content.slice(prefix.length).split(/ +/);
    // Converts command to lower case
    const command = args.shift().toLowerCase();
    
    // Commands
    if (client.commands.get('help').aliases.includes(command)) {
        client.commands.get('help').execute(client, message, args);
    }
    else if (client.commands.get('ping').aliases.includes(command)) {
        client.commands.get('ping').execute(message, args);
    }
    else if (client.commands.get('serverInfo').aliases.includes(command)) {
        client.commands.get('serverInfo').execute(message, args);
    }
    else if (client.commands.get('embed').aliases.includes(command)) {
        client.commands.get('embed').execute(client, message, args);
    }
    else if (client.commands.get('rickRoll').aliases.includes(command)) {
        client.commands.get('rickRoll').execute(client, message, args);
    }
    else if (client.commands.get('soundboard').aliases.includes(command)) {
        client.commands.get('soundboard').execute(client, message, args, sounds);
    }
    else if (client.commands.get('kick').aliases.includes(command)) {
        client.commands.get('kick').execute(client, message, args);
    }
    else if (client.commands.get('ban').aliases.includes(command)) {
        client.commands.get('ban').execute(client, message, args);
    }
    else if (client.commands.get('tempban').aliases.includes(command)) {
        client.commands.get('tempban').execute(client, message, args);
    }
    else if (client.commands.get('unban').aliases.includes(command)) {
        client.commands.get('unban').execute(client, message, args);
    }
    else if (client.commands.get('banList').aliases.includes(command)) {
        client.commands.get('banList').execute(client, message, args);
    }
    else if (client.commands.get('clear').aliases.includes(command)) {
        client.commands.get('clear').execute(client, message, args);
    }
    else {
        client.commands.get('unknownCommand').execute(message, args);
    }
});

client.login(process.env.BOT_TOKEN);


