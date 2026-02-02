const mongoose = require("mongoose");

const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email address: " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter a strong Password: " + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        }
    }
},
    { timestamps: true });

UserSchema.methods.getJwtToken = function () {
    return jwt.sign({ _id: this._id }, "DEV_TINDER$790", {
        expiresIn: "1h"
    });
}

UserSchema.methods.passwordValidate = function (password) {
    return bcrypt.compare(password, this.password);
}


const userModel = mongoose.model("User", UserSchema);

module.exports = userModel;