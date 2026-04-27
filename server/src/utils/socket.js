const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const initializeSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: ["http://localhost:4200", "http://13.201.63.201", "http://swiperflow.clichepasta.site"], // Added production origins
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("New Socket Connection: " + socket.id);

        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = [userId, targetUserId].sort().join(":");
            console.log(firstName + " joined room : " + roomId);
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
            const roomId = [userId, targetUserId].sort().join(":");
            console.log(firstName + " sent message to room : " + roomId);
            
            io.to(roomId).emit("messageReceived", {
                firstName,
                lastName,
                text,
                senderId: userId,
                receiverId: targetUserId, // Added receiverId for frontend filtering
                createdAt: new Date()
            });
        });

        socket.on("typing", ({ userId, targetUserId, firstName }) => {
            const roomId = [userId, targetUserId].sort().join(":");
            socket.to(roomId).emit("userTyping", { userId, firstName });
        });

        socket.on("stopTyping", ({ userId, targetUserId }) => {
            const roomId = [userId, targetUserId].sort().join(":");
            socket.to(roomId).emit("userStoppedTyping", { userId });
        });

        socket.on("wallMessage", (message) => {
            io.emit("newWallMessage", message);
        });

        socket.on("disconnect", () => {
            console.log("Socket Disconnected: " + socket.id);
        });
    });
};

module.exports = initializeSocket;
