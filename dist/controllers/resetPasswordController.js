"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPassword = exports.forgotPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../db/users");
const generateToken_1 = require("../utils/generateToken");
const tokens_1 = require("../db/tokens");
const resetPasswordEmailTemplate_1 = require("../utils/resetPasswordEmailTemplate");
const sendEmail_1 = require("../utils/sendEmail");
const resetPasswordSuccessEmailTemplate_1 = require("../utils/resetPasswordSuccessEmailTemplate");
//develpment or production
let client_path = '';
if (process.env.NODE_ENV === 'production') {
    const client_path = process.env.CLIENT_PATH_PROD;
}
else {
    const client_path = process.env.CLIENT_PATH_DEV;
}
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: false, msg: 'Missing required fields' });
        }
        const user = await (0, users_1.getUserByEmail)(email);
        if (!user) {
            return res.status(400).json({ status: false, msg: 'Email is not registered' });
        }
        const token = (0, generateToken_1.generateToken)({ email, _id: user._id });
        await (0, tokens_1.createToken)({ token, userId: user._id });
        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const subject = "FrameFlow - Password reset request";
        const resetPasswordLink = `${client_path}/forgot-password/reset-password?token=${token}`;
        const message = (0, resetPasswordEmailTemplate_1.resetPasswordEmailTemplate)(resetPasswordLink, user.name);
        const result = await (0, sendEmail_1.sendEmail)(subject, message, send_to, sent_from);
        if (!result) {
            await (0, tokens_1.deleteTokenByTokenValue)(token);
            return res.status(400).json({ status: false, msg: 'Email is unable to send' });
        }
        return res.status(200).json({ status: true, msg: 'Reset password link is sent successfully. Please check your email.' });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.forgotPassword = forgotPassword;
const newPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ status: false, msg: 'Missing required fields' });
        }
        const tokenData = await (0, tokens_1.deleteTokenByTokenValue)(token);
        if (!tokenData) {
            return res.status(400).json({ status: false, msg: 'invalid access' });
        }
        console.log(tokenData);
        const user = await (0, users_1.getUserById)(tokenData.userId);
        if (!user) {
            return res.status(400).json({ status: false, msg: 'Email is not registered' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        await user.updateOne({ password: hashedPassword });
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;
        const subject = "FrameFlow - Successful reset password";
        const message = (0, resetPasswordSuccessEmailTemplate_1.resetPasswordSuccessEmailTemplate)(user.name);
        const result = await (0, sendEmail_1.sendEmail)(subject, message, send_to, sent_from);
        const newToken = (0, generateToken_1.generateToken)({ email: user.email, _id: user._id });
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            image: user.image,
            token: newToken
        };
        return res.status(200).json({ status: true, msg: 'Password is reset successfully.', user: userResponse });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.newPassword = newPassword;
//# sourceMappingURL=resetPasswordController.js.map