console.log("Starting point");
const express = require('express');
const app = express();
const {adminAuth} = require('./middlewares/auth');

// app.use("/get", (req, res, next) => {
//     res.send("Started from the server.")
// });

app.use("/admin",adminAuth)

app.post("/user/login", (req, res)=> {
    res.send("User logged in.");
})
app.get("/admin/get", (req, res, next) => {
    // res.send("Started from the server.");
    next();
},
(req, res, next) => {
    res.send("Started from the server2.");
}
);


app.delete("/hello", (req, res, next) => {    
    res.send("Hello Hello Hello.")
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});