require('dotenv').config();

const pteroURL = process.env.PTERODACTYLURL;
const axios = require('axios');

module.exports = {
    cache: {serverlookup: {}},
    async grabAPIKey(bot, id) {
        const key = await bot.pterodactylkeys.get(id);
        return key;
    },
    async getallservers(bot, key) {
        const response = await axios.get(`${pteroURL}/api/client`, {
            "headers": {
                "Accept": "application/json",
                "Authorization": key,
            }
         })

        console.log(response)

        if (!response.statusText == "OK") {
            throw new Error('Failed to fetch data'); 
        }
        const data = response.data
        return data;
    }
}