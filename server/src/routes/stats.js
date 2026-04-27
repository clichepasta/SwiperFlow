const express = require("express");
const statsRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { adminAuth } = require("../middlewares/auth");

statsRouter.get("/stats/dashboard", adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalConnections = await ConnectionRequest.countDocuments({ status: "accepted" });
        const totalPendingRequests = await ConnectionRequest.countDocuments({ status: "interested" });
        
        // Personal stats for the logged-in user
        const userMatches = await ConnectionRequest.countDocuments({
            $or: [
                { fromUserId: req.user._id },
                { toUserId: req.user._id }
            ],
            status: "accepted"
        });

        res.status(200).json({
            data: {
                totalUsers,
                totalConnections,
                totalPendingRequests,
                userMatches
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch stats", error: error.message });
    }
});

module.exports = statsRouter;
