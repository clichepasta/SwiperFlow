const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    }
}

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "gender", "age", "about", "skills", "githubUsername"];
    const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field));

    return isEditAllowed;
}

module.exports = { validateSignupData, validateEditProfileData };