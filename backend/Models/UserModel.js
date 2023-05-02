const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const User = new Schema({
    // user register
    email: {type: String , required: true},
    // username is changeable (similar to IG)
    username: {type: String , required: true},
    // similar to link tree
    shortenedURL: {type: String , required: true},
    // the encrypted pass
    password: {type: String , required: true},
})

module.exports = mongoose.model("User",User)