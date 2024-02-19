require('dotenv').config();

const pteroURL = process.env.PTERODACTYLURL;
const axios = require('axios');

module.exports = {
    cache: {serverlookup: {}},
    async grabAPIKey(bot, id) {
        const key = await bot.pterodactylkeys.get(id);
        return key;
    },
    async checkvalidkey(bot, key) {
        try {
            const response = await axios.get(`${pteroURL}/api/client`, {
                "headers": {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${key}`,
                }
             })

             if (!response.statusText == "OK") {
                return false
             }

             console.log(typeof response.data)

             return true
        } catch (error) {
            return false
        }
    },
    async getrunningstate(bot, key, identifier) {
        try {
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
    
            const serverInfo = response.data;
    
            return serverInfo.attributes.current_state;
        } catch(error) {
            console.log(error);
            return null
        }
    },
    async getallservers(bot, key) {
        try {
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
        } catch (error) {
            console.log(error)
            return null
        }
    }
}