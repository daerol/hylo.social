const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Link = new Schema({
    // user ID
    userId: {type: String , required: true},
    // title of link
    linkName: {type: String , required: true},
    // url of link
    linkURL: {type: String , required: true},
})

module.exports = mongoose.model("Link",Link)