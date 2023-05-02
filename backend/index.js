const app = require("./app")
const mongoose = require("mongoose");
require("dotenv").config();

app.listen(process.env.PORT || 8000, () => {
    console.log("Running");
});

// ==================connect to mongoose==================
async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected");
    } catch (error) {
        console.log(error);
    }
}

connect();
