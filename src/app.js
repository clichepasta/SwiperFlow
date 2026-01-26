const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const { ReturnDocument } = require('mongodb');

app.use(express.json());

//sign up
app.post("/signup", async (req, res) => {
    const user = new User(req.body); //creating a new instance of User
    await user.save();

    res.send("User added successfully");
})

app.get("/user", async (req, res) => {
    try {
        const emailId = req.body.emailId;
        const user = await User.find({ emailId: emailId });
        if (user.length !== 0) {
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

connectDB()
    .then(() => {
        app.listen(7000, () => {
            console.log("🚀 Server is running on port 7000");
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed", err.message);
    });