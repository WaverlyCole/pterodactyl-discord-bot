require('dotenv').config();

const pteroURL = process.env.PTERODACTYLURL;

module.exports = {
    cache: {serverlookup: {}},
    async grabAPIKey(bot, id) {
        const key = await bot.pterodactylkeys.get(id);
        return key;
    },
    async getallservers(bot, key) {
        const response = await fetch(`${pteroURL}/api/client`, {
            "method": "GET",
            "headers": {
                "Accept": "application/json",
                "Authorization": key,
            }
         })

        console.log(response)

        if (!response.ok) {
            throw new Error('Failed to fetch data'); 
        }
        const data = await response.body.json();
        return data;
    }
}