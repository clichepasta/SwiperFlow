const express = require("express");
const mongoose = require("mongoose");

const chatRouter = express.Router();

const { adminAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const ChatMessage = require("../models/chatMessage");
const WallMessage = require("../models/wallMessage");

const MAX_DM_LIMIT = 100;
const MAX_WALL_LIMIT = 100;

const createConversationId = (firstUserId, secondUserId) => {
    return [firstUserId.toString(), secondUserId.toString()].sort().join(":");
};

const isConnected = async (firstUserId, secondUserId) => {
    const connection = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
            { fromUserId: firstUserId, toUserId: secondUserId },
            { fromUserId: secondUserId, toUserId: firstUserId }
        ]
    }).select("_id");

    return !!connection;
};

chatRouter.get("/chat/conversation/:targetUserId", adminAuth, async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { targetUserId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid target user id" });
        }

        if (currentUserId.toString() === targetUserId) {
            return res.status(400).json({ message: "Cannot chat with yourself" });
        }

        const targetUser = await User.findById(targetUserId).select("_id");
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        const canChat = await isConnected(currentUserId, targetUserId);
        if (!canChat) {
            return res.status(403).json({ message: "Chat is allowed only with accepted connections" });
        }

        const limitRaw = Number.parseInt(req.query.limit, 10);
        const limit = Number.isNaN(limitRaw) ? 50 : Math.min(Math.max(limitRaw, 1), MAX_DM_LIMIT);

        const conversationId = createConversationId(currentUserId, targetUserId);

        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            message: "Conversation fetched successfully",
            data: messages.reverse()
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch conversation", error: error.message });
    }
});

chatRouter.post("/chat/conversation/:targetUserId", adminAuth, async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { targetUserId } = req.params;
        const text = (req.body?.text || "").trim();

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid target user id" });
        }

        if (currentUserId.toString() === targetUserId) {
            return res.status(400).json({ message: "Cannot chat with yourself" });
        }

        if (!text) {
            return res.status(400).json({ message: "Message text is required" });
        }

        if (text.length > 1000) {
            return res.status(400).json({ message: "Message must be 1000 characters or less" });
        }

        const targetUser = await User.findById(targetUserId).select("_id");
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        const canChat = await isConnected(currentUserId, targetUserId);
        if (!canChat) {
            return res.status(403).json({ message: "Chat is allowed only with accepted connections" });
        }

        const message = await ChatMessage.create({
            conversationId: createConversationId(currentUserId, targetUserId),
            senderId: currentUserId,
            receiverId: targetUserId,
            text
        });

        return res.status(201).json({
            message: "Message sent successfully",
            data: message
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to send message", error: error.message });
    }
});

chatRouter.get("/chat/wall", adminAuth, async (req, res) => {
    try {
        const limitRaw = Number.parseInt(req.query.limit, 10);
        const limit = Number.isNaN(limitRaw) ? 50 : Math.min(Math.max(limitRaw, 1), MAX_WALL_LIMIT);

        const messages = await WallMessage.find({})
            .populate("userId", ["firstName", "lastName"])
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            message: "Wall messages fetched successfully",
            data: messages.reverse()
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch wall messages", error: error.message });
    }
});

chatRouter.post("/chat/wall", adminAuth, async (req, res) => {
    try {
        const text = (req.body?.text || "").trim();
        if (!text) {
            return res.status(400).json({ message: "Message text is required" });
        }

        if (text.length > 500) {
            return res.status(400).json({ message: "Wall message must be 500 characters or less" });
        }

        const message = await WallMessage.create({
            userId: req.user._id,
            text
        });

        const populatedMessage = await message.populate("userId", ["firstName", "lastName"]);

        return res.status(201).json({
            message: "Wall message posted successfully",
            data: populatedMessage
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to post wall message", error: error.message });
    }
});

module.exports = chatRouter;
