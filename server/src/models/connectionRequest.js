const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: {
            values: ["ignore", "interested", "accepted", "rejected"],
            message: `{VALUE} is not a valid status`
        },
        required: true
    }
},
    { timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", async function () {
    const connectionRequest = this;
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Cannot send connection request to yourself!");
    }
});

const connectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = connectionRequestModel;
