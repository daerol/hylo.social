// shorten URL
const short = require('short-uuid');
const generateShortenedID = () => {
    const id = short.generate();
    return id;
};

module.exports = { generateShortenedID };
