const pool = require('./dbpool');

const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'config.json'));

module.exports = {
    set: function (client) {
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
    }
};

