const fetch = require("node-fetch");
const { GOOGLE_API_KEY, GOOGLE_MAP_ADDRESS_URL } = require("../helpers/constant")

exports.randomPassword = () => {
    let password = "";
    let possible = "0123456789abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < 8; i++) {
        password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return password;
}

exports.randomNumber = Math.floor(100000 + Math.random() * 900000)

exports.getExpiryDate = (duration) => {
    const month = parseInt(duration.split(' ')[0])
    const date = new Date()
    const mili_sec = date.setMonth(date.getMonth() + month)
    return expires_at = new Date(mili_sec).toISOString();
}

exports.getPlanExpiry = (days) => {
    const date = new Date()
    const mili_sec = date.setDate(date.getDate() + days)
    return expires_at = new Date(mili_sec).toISOString();
}

exports.getAddress = async (lat, long) => {
    const response = await fetch(`${GOOGLE_MAP_ADDRESS_URL}=${lat},${long}&key=${GOOGLE_API_KEY}`);
    const { results } = await response.json();
    if (results.length == 0) return { address: null };
    return results[0].formatted_address
};