const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://rpatnaik:amazing555@patnaik.qizzzqr.mongodb.net/SwiperFlow?retryWrites=true&w=majority&appName=Cluster0&family=4");
};
module.exports = connectDB;