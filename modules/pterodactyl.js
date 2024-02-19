require('dotenv').config();

const pteroURL = process.env.PTERODACTYLURL;
const axios = require('axios');
const NodeCache = require("node-cache");

const webcache = new NodeCache({ stdTTL: 5 });

const grabAPIKey = async (bot, id) => {
    const key = await bot.pterodactylkeys.get(id);
    return key;
};

const checkvalidkey = async (bot, key) => {
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
};

const getrunningstate = async (bot, key, identifier) => {
    try {
        const requestURL = `${pteroURL}/api/client/servers/${identifier}/resources`
        let serverInfo = webcache.get(requestURL)

        if (!serverInfo) {
            let response = await axios.get(requestURL, {
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`,
                }
            })

        if (!response.statusText == "OK") {
            throw new Error('Failed to fetch data'); 
        }

        serverInfo = response.data;
        webcache.set(requestURL,serverInfo);
        }

        return serverInfo.attributes.current_state;
    } catch(error) {
        console.log(error);
        return null

    }
};

const getallservers = async (bot, key) => {
    try {
        const requestURL = `${pteroURL}/api/client`
        let serverArray = webcache.get(requestURL)

        if (!serverArray) {
            const response = await axios.get(requestURL, {
                "headers": {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${key}`,
                }
             })
    
            if (!response.statusText == "OK") {
                throw new Error('Failed to fetch data'); 
            }
    
            serverArray = response.data.data;
            webcache.set(requestURL,serverArray)
        } else {
            console.log("USING CACHE")
        }
        
        const serverList = {};

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
};


module.exports = {
    webcache,
    grabAPIKey,
    checkvalidkey,
    getrunningstate,
    getallservers
}