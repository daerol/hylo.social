const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const protection = async (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            console.log("req.headers.authorization",req.headers.authorization)
            token = req.headers.authorization.split(" ")[1]; //just the token
            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // get user from token
            req.currUser = await User.findById(decoded.id).select("-password");
            console.log("req.user",req.currUser)
            next();
        } catch (err) {
            console.log(err);
            return res.status(403).json({
                message: "Unauthorised",
            });
        }
    } else {
        return res.status(403).json({
            message: "Unauthorised",
        });
    }
};

module.exports = { protection };