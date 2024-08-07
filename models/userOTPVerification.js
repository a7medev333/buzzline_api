
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserOTPVerificationSchema = new Schema({
    userId: String,
    otp:String,
    createAt:Date,
    expiresAt:Date
});

const UserOTPVerification = mongoose.model(
    "user_otp_verification",
    UserOTPVerificationSchema
);

module.exports = UserOTPVerification;