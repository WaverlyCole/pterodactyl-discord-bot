require('dotenv').config();

const pteroURL = process.env.PTERODACTYLURL;
const axios = require('axios');

module.exports = {
    cache: {serverlookup: {}},
    async grabAPIKey(bot, id) {
        const key = await bot.pterodactylkeys.get(id);
        return key;
    },
    async getrunningstate(bot, key, identifier) {
        const response = await axios.get(`${pteroURL}/api/client/servers/${identifier}/resources`, {
            "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            }
         })

        if (!response.statusText == "OK") {
            throw new Error('Failed to fetch data'); 
        }

        const serverInfo = response.data

        console.log(serverInfo)

        return serverInfo.attributes.current_state
    },
    async getallservers(bot, key) {
        const response = await axios.get(`${pteroURL}/api/client`, {
            "headers": {
                "Accept": "application/json",
                "Authorization": `Bearer ${key}`,
            }
         })

        if (!response.statusText == "OK") {
            throw new Error('Failed to fetch data'); 
        }

        const serverArray = response.data.data;
        const serverList = {};

        //console.log(serverArray)

        serverArray.forEach(server => {
            const serverName = server.attributes.name
            const serverInfo = {
                identifier: server.attributes.identifier,
                description: server.attributes.description
            }

            serverList[serverName] = serverInfo
        });

        return serverList
    }
}