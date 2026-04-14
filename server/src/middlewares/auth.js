const User = require("../models/user");
const jwt = require("jsonwebtoken");

const adminAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        const token = cookies.token;
        if (!token) {
            throw new Error("Unauthorized");
        }
        const decodedToken = jwt.verify(token, "DEV_TINDER$790");
        const id = decodedToken._id;
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();

    }
    catch (err) {
        res.status(401).send("Unauthorized");
    }

}

module.exports = { adminAuth };