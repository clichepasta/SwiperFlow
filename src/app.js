const express = require('express');
const bcrypt = require("bcrypt");
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const { adminAuth } = require("./middlewares/auth");
const { ReturnDocument } = require('mongodb');
const { validateSignupData } = require("./utils/validation");
const cookieParser = require("cookie-parser");
// import validateSignupData from "./utils/validation";

app.use(express.json());
app.use(cookieParser());

//sign up
app.post("/signup", async (req, res) => {
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
        res.send("User added successfully");
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/login", async (req, res) => {
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
})



app.get("/profile", adminAuth, async (req, res) => {
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

app.get("/feed", async (req, res) => {
    const user = await User.find({});
    res.send(user)
});

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const data = req.body;

    try {
        const allowedEditFields = [
            "firstName", "lastName", "age", "gender", "password", "emailId"
        ]
        const isUpdateAllowed = Object.keys(data).every((k) => allowedEditFields.includes(k));
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }
        if (data?.skills?.length > 10) {
            throw new Error("Skills can not be more than 10");
        }
        const user = await User.findByIdAndUpdate({ _id: userId }, data, {
            returnDocument: "after",
            runValidators: true,
        });
        res.send(user);
    }
    catch (err) {
        res.status(400).send("Update Failed:" + err.message);
    }
})

app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);

        res.send("User deleted Successfully");

    } catch (err) {
        res.status(400).send("Something went wrong");
    }
})

app.post("/sendConnectionRequest", adminAuth, async (req, res) => {
    const firstName = req.user.firstName;
    res.send("Connection Request Sent by " + firstName);

})

connectDB()
    .then(() => {
        app.listen(7000, () => {
            console.log("🚀 Server is running on port 7000");
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed", err.message);
    });