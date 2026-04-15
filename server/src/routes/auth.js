const express = require("express");
const authRouter = express.Router();
const User = require('../models/user');
const { validateSignupData } = require("../utils/validation");
const { adminAuth } = require("../middlewares/auth")

const bcrypt = require("bcrypt");


authRouter.post("/signup", async (req, res) => {
    try {
        validateSignupData(req);
        const { firstName, lastName, emailId, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        }); //creating a new instance of User
        await user.save();

        const token = user.getJwtToken();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 3600000)
        });

        res.status(200).json({ message: "User added successfully", data: user });
    } catch (err) {
        res.status(400).send(err)
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({
            emailId: emailId
        });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await user.passwordValidate(password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }
        const token = user.getJwtToken();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 3600000)
        });
        res.status(200).json({ message: "Login successful" });

    } catch (err) {
        res.status(400).send(err);
    }
});

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });

    res.send();
})



module.exports = authRouter;


