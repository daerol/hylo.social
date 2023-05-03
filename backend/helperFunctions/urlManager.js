// shorten URL
const short = require('short-uuid');
const generateShortenedID = () => {
    let id = short.generate();
    // 22-6 = 16
    // rng from 0 to 15
    const randomPart = Math.floor(Math.random() * 16)
    const generatedId = id.slice(randomPart,randomPart+6);
    return generatedId;
};

module.exports = { generateShortenedID };
