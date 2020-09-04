const pool = require('./dbpool');

module.exports = {
    update: function (message) {
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
            if (message.content.length < 5/*|| !message.content.includes(' ')*/) {
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
};