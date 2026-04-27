const express = require("express");

profileRouter = express.Router();

const { adminAuth } = require("../middlewares/auth")
const { validateEditProfileData } = require("../utils/validation");
const upload = require("../utils/upload");

profileRouter.get("/profile", adminAuth, async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            res.json({ data: user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(400).send("Something went wrong")
    }
});

profileRouter.post("/profile/upload", adminAuth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("Please upload a file");
        }
        const user = req.user;
        // Construct the URL. In production, this would be an S3 URL.
        const photoUrl = `http://localhost:7000/uploads/profiles/${req.file.filename}`;
        user.photoUrl = photoUrl;
        await user.save();

        res.status(200).json({
            message: "Photo uploaded successfully",
            data: { photoUrl }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        res.status(200).json({ message: "User Updated Successfully", data: user });
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
        res.status(200).json({ message: "Password Updated Successfully" });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = profileRouter;
