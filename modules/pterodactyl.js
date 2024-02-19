require('dotenv').config()

const pteroURL = process.env.PTERODACTYLURL

module.exports = {
    cache: {serverlookup: {}},
    async grabAPIKey(id) {
        const key = await bot.pterodactylkeys.get(id)
        return key
    },
    async getallservers(key) {
        return fetch(`${pteroURL}/api/client`, {
        "method": "GET",
        "headers": {
            "Accept": "application/json",
            "Authorization": key,
        }
        })
        .then(response => resolve(response))
        .catch(err => console.error(err))
    }
}