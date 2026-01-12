console.log("Starting point");
const express = require('express');
const app = express();

app.use("/get", (req, res, next) => {
    res.send("Started from the server.")
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});