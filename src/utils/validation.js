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

module.exports = { validateSignupData };