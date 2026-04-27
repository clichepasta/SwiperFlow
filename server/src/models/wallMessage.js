const mongoose = require("mongoose");

const wallMessageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxLength: 500
        }
    },
    { timestamps: true }
);

wallMessageSchema.index({ createdAt: -1 });

const WallMessage = mongoose.model("WallMessage", wallMessageSchema);

module.exports = WallMessage;
