const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Link = new Schema({
    // user ID
    userId: {type: String , required: true},
    // title of link
    linkName: {type: String , required: true},
    // url of link (autogen after user created)
    linkURL: {type: String , required: false},
})

module.exports = mongoose.model("Link",Link)