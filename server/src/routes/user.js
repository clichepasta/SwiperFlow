const express = require("express");
const userRouter = express.Router();

const { adminAuth } = require("../middlewares/auth");
const User = require("../models/user");
const connectionRequestModel = require("../models/connectionRequest");

userRouter.get("/user/request/received", adminAuth, async (req, res) => {
    try {
        const user = req.user;
        const receivedRequests = await connectionRequestModel.find({
            toUserId: user._id,
            status: "interested"
        }).populate(
            "fromUserId",
            ["firstName", "lastName", "age", "gender", "about", "skills"]
        ).populate(
            "toUserId",
            ["firstName", "lastName", "age", "gender", "about", "skills"]
        );
        res.status(200).json({
            message: "Received Requests",
            data: receivedRequests
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

userRouter.get("/user/connections", adminAuth, async (req, res) => {
    try {
        const user = req.user;
        const connections = await connectionRequestModel.find({
            $or: [
                { fromUserId: user._id },
                { toUserId: user._id }
            ],
            status: "accepted"
        }).populate(
            "fromUserId",
            ["firstName", "lastName", "age", "gender", "about", "skills"]
        ).populate(
            "toUserId",
            ["firstName", "lastName", "age", "gender", "about", "skills"]
        );
        res.status(200).json({
            message: "Connections",
            data: connections
        });
    } catch (error) {
        res.status(500).send(error);
    }
})

userRouter.get("/user/feed", adminAuth, async (req, res) => {
    try {

        //user see all the other card except:
        //0. his own card
        //1. his connection
        //2. ignored profile
        //3. already sent the connection request

        const loggedInUser = req.user;
        console.log(req.query);

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await connectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId status").populate(
            "fromUserId",
            ["firstName"]
        ).populate(
            "toUserId",
            ["firstName"]
        );

        const alreadyConnectedUserIds = connectionRequests.map((request) => {
            if (request.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return request.toUserId._id.toString();
            }
            return request.fromUserId._id.toString();
        });

        const finalUser = await User.find({
            _id: { $nin: [...alreadyConnectedUserIds, loggedInUser._id] }
        }).select("firstName lastName age gender about skills").skip(skip).limit(limit);

        res.status(200).json({
            message: "Feed",
            data: finalUser
        });


    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = userRouter;