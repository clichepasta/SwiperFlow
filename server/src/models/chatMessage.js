const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true,
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000
        }
    },
    { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;
