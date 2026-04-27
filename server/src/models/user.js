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
        select: false,
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
    },
    about: {
        type: String,
        default: "No bio"
    },
    skills: {
        type: [String]
    },
    photoUrl: {
        type: String,
        default: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3IodewMw9SuUREwOQrzxb8FxC7GKhOpQEwq-V2boIAKPneWcnNgyOHp-vn1oLMoOLpM8HZ14UGANEgBgJ0oOqDbagLJ3t61lw3RBbJYn9SDf36V7RQOLuEmHcbL536ejdoFuOP8mxJpJak1NE4SfpRt2BkuTehWIzhD24Jd0YBlExnShqLiz9jflVMyrsTTX0Sbj-M9ppveyiRu3CYYRsgahy72KAmNk20wRycgOFX78Nd4sOsdsiNl-10B1MdnCAbdM9Cro8ikSP"
    },
    githubUsername: {
        type: String,
        trim: true,
        default: ""
    }
},
    { timestamps: true });

UserSchema.methods.getJwtToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET || "DEV_TINDER$790", {
        expiresIn: "1h"
    });
}

UserSchema.methods.passwordValidate = function (password) {
    return bcrypt.compare(password, this.password);
}


const userModel = mongoose.model("User", UserSchema);

module.exports = userModel;