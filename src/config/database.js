const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://rpatnaik:amazing555@patnaik.pddex3u.mongodb.net/");
};
module.exports = connectDB;