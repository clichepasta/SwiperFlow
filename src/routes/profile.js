const express = require("express");

profileRouter = express.Router();

const { adminAuth } = require("../middlewares/auth")
const { validateEditProfileData } = require("../utils/validation");


profileRouter.get("/profile", adminAuth, async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            res.send(user)
        } else {
            res.status(400).send("User not found")
        }
    } catch (err) {
        res.status(400).send("Something went wrong")
    }
});

profileRouter.patch("/profile/edit", adminAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }
        const user = req.user;
        Object.keys(req.body).forEach((key) => {
            user[key] = req.body[key];
        });
        await user.save();
        res.status(200).json({ message: "Used Updated Successfully", data: user });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

profileRouter.patch("/profile/password", adminAuth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            throw new Error("Password is required");
        }
        const user = req.user;
        user.password = password;
        await user.save();
        res.status(200).json({ message: "Password Updated Successfully", data: user });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = profileRouter;
