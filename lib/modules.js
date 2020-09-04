const pool = require('./dbpool');

module.exports = {
    dbFetch: function (client) {
        pool.query(`SELECT * FROM modules`, function (err, result) {
			if (err) throw err;
            //console.log(result);

            for (let i=0; i<result.length; i++) {
                let modulesRecord = [];
                if (result.length != 0) modulesRecord = JSON.parse(result[0].modules);

                for (let j=0; j<Object.keys(modulesRecord).length; j++) {
                    let group = client.registry.groups.get(Object.keys(modulesRecord)[j]);
                    group.setEnabledIn(client.guilds.cache.get(result[i].guildID), modulesRecord[Object.keys(modulesRecord)[j]]);
                }
            }
        });
    }
};

