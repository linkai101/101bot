const Discord = require('discord.js');
const commando = require('discord.js-commando');
const pool = require('./lib/dbpool');

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


// MYSQL
var addTablePrefixes = "CREATE TABLE prefixes (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), prefix VARCHAR(255))";
pool.query(addTablePrefixes, function (err, result) {
    //if (err) console.log("MYSQL> 'prefixes' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'prefixes'");
});

var addTableExperience = "CREATE TABLE experience (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), userID VARCHAR(255), xp INT(9), messages INT(9), lastMsgTimestamp BIGINT(15))";
pool.query(addTableExperience, function (err, result) {
    //if (err) console.log("MYSQL> 'experience' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'experience'");
});

var addTableEconomy = "CREATE TABLE economy (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), userID VARCHAR(255), balance INT(9), lastDailyTimestamp BIGINT(15), lastDailyXP INT(9))";
pool.query(addTableEconomy, function (err, result) {
    //if (err) console.log("MYSQL> 'economy' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'economy'");
});

var addTableTimezone = "CREATE TABLE timezone (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), utcOffset TINYINT(3))";
pool.query(addTableTimezone, function (err, result) {
    //if (err) console.log("MYSQL> 'timezone' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'timezone'");
});



client.registry
    .registerDefaults()
    .registerGroups([
        ['music', 'Music commands'],
        ['moderation', 'Moderation commands'],
        ['levels', 'Leveling commands'],
        ['economy', 'Economy commands'],
        ['misc', 'Miscellaneous commands']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log("BOT> Logged in successfully!");
    
    /*client.user.setActivity(config.bot_info.status, { type: config.bot_info.statusType }) // PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM_STATUS
        .then(presence => console.log(`BOT> Activity set to '${presence.activities[0].type} ${presence.activities[0].name}'`))
        .catch(console.error);*/

    var statusIndex = 0;
    setInterval(() => {
        var statusText = config.bot_info.statuses[statusIndex].status;
        var statusType = config.bot_info.statuses[statusIndex].type

        if (statusText.includes("%servers%")) statusText = statusText.replace("%servers%", client.guilds.cache.array().length);
        if (statusText.includes("%users%")) statusText = statusText.replace("%users%", client.users.cache.array().length);

        client.user.setActivity(statusText, { type: statusType }) // sets bot's activities to one of the phrases in the arraylist.
        //.then(presence => console.log(`BOT> Activity set to '${presence.activities[0].type} ${presence.activities[0].name}'`))
        .catch(console.error);
        statusIndex++;
        if (statusIndex >= config.bot_info.statuses.length) statusIndex = 0;
    }, 10000); // Runs this every 10 seconds.

    // Assigning all stored prefixes on mySQL
    pool.query("SELECT * FROM prefixes", function (err, resultAll, fields) {
        if (err) throw err;
        //console.log(result);
    
        var i;
        for (i=0;i<Object.keys(resultAll).length;i++) {
            pool.query(`SELECT * FROM prefixes WHERE guildID = '${resultAll[i].guildID}'`, function (err, resultRecord) {
                if (err) throw err;
                i--;
                client.guilds.cache.get(resultAll[i].guildID).commandPrefix = resultRecord[0].prefix;
            });
        }
    });
})

function updateXP(message) {
    pool.query(`SELECT * FROM experience WHERE userID = '${message.author.id}' AND guildID = '${message.guild.id}'`, function (err, result) {
        if (err) throw err;
        //console.log(result);

        var xpRecord = result[0];

        if (!xpRecord) {
            var addXPRecord = `INSERT INTO experience (guildID, userID, xp, messages, lastMsgTimestamp) VALUES ('${message.guild.id}', '${message.author.id}', 0, 0, ${message.createdTimestamp})`;
            pool.query(addXPRecord, function (err) {
                if (err) throw err;
                //console.log("1 record inserted");
            });

            return;
        }
        
        const xpMin = 10;
        const xpMax = 20;
        const xpCooldown = 60000; // In ms
        var newXP = Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin;

        // Multiplys XP based on when last message was sent
        var xpMultiplier = 1;
        if (message.createdTimestamp - xpRecord.lastMsgTimestamp < 300000) {
            xpMultiplier = 1+0.5*(300000 - (message.createdTimestamp - xpRecord.lastMsgTimestamp))/300000;
        }
        if (message.createdTimestamp - xpRecord.lastMsgTimestamp < xpCooldown) {
            xpMultiplier = 0;
        }
        newXP = Math.floor(newXP*xpMultiplier);

        // Checks if longer than minimum message length
        var badLength = false;
        if (message.content.length < 10 || !message.content.includes(' ')) {
            badLength = true;
            newXP = 0;
        }

        var updateXP = `UPDATE experience SET xp = ${xpRecord.xp+newXP} WHERE id = ${xpRecord.id}`;
        pool.query(updateXP, function (err, result) {if (err) throw err;});

        var updateMessages = `UPDATE experience SET messages = ${xpRecord.messages+1} WHERE id = ${xpRecord.id}`;
        pool.query(updateMessages, function (err, result) {if (err) throw err;});
        
        if (message.createdTimestamp - xpRecord.lastMsgTimestamp >= xpCooldown && !badLength) {
            var updateLastMsgTimestamp = `UPDATE experience SET lastMsgTimestamp = ${message.createdTimestamp} WHERE id = ${xpRecord.id}`;
            pool.query(updateLastMsgTimestamp, function (err, result) {if (err) throw err;});
        }
    });
}

client.on("message", async message => {
    if (message.author.bot) return;
    if (message.guild) updateXP(message);
});

client.on('guildMemberAdd', member => { // When a new user joins
});

client.login(config.token);

