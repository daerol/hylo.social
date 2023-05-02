var mongoose = require("mongoose");
const newObjectId = () => {
    return new mongoose.Types.ObjectId();
};

module.exports = { newObjectId };
