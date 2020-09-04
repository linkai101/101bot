const pool = require('./dbpool');

module.exports = {
    dbFetch: function (client) {
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
    }
};

