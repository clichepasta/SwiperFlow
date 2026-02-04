const express = require("express");
const requestRouter = express.Router();

const { adminAuth } = require("../middlewares/auth")
const connectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");

//status: intrested, rejected, accepted, ignore

requestRouter.post("/request/send/:status/:toUserId", adminAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if (fromUserId.toString() === toUserId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }

        const allowedStatus = ["ignore", "intrested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingConnectionRequest = await connectionRequestModel.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ message: "Connection Request Already Exists!!" });
        }

        const connectionRequest = new connectionRequestModel({
            fromUserId,
            toUserId,
            status
        });
        const data = await connectionRequest.save();
        res.status(200).json({
            message: "Connection Request Sent",
            data
        });

    } catch (error) {
        res.status(500).send(error);
    }

})

module.exports = requestRouter;