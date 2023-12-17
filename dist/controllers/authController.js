"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConfirmation = exports.google = exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../db/users");
const generateToken_1 = require("../utils/generateToken");
const confirmRegisterEmailTemplate_1 = require("../utils/confirmRegisterEmailTemplate");
const sendEmail_1 = require("../utils/sendEmail");
const tokens_1 = require("../db/tokens");
const confirmationSuccessEmailTemplate_1 = require("../utils/confirmationSuccessEmailTemplate");
const folders_1 = require("../db/folders"); //dependency, TODO: remove this in microservice architecture
//google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//develpment or production
let client_path = '';
if (process.env.NODE_ENV === 'production') {
    client_path = process.env.CLIENT_PATH_PROD;
}
else {
    client_path = process.env.CLIENT_PATH_DEV;
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, msg: 'Missing required fields' });
        }
        const user = await (0, users_1.getUserByEmail)(email);
        if (!user) {
            return res.status(400).json({ status: false, msg: 'Invalid Email and Password.' });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res
                .status(401)
                .json({ status: false, msg: "Invalid Email and Password." });
        }
        const token = (0, generateToken_1.generateToken)({ _id: user._id, email: user.email });
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            image: user.image,
            token: token
        };
        return res.status(200).json({ status: true, msg: 'User logged in', user: userResponse });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ status: false, msg: 'Missing required fields' });
        }
        const existingUser = await (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            if (!existingUser.verified) {
                await (0, users_1.deleteUserById)(existingUser._id);
            }
            else {
                return res.status(400).json({ status: false, msg: 'Email already exists' });
            }
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const bcryptPassword = await bcrypt_1.default.hash(password, salt);
        const user = await (0, users_1.createUser)({
            name,
            email,
            password: bcryptPassword,
        });
        const token = (0, generateToken_1.generateToken)({ _id: user._id, email: user.email });
        // sending confirmation email
        await (0, tokens_1.createToken)({ userId: user._id, token: token });
        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const subject = "FrameFlow - Please confirm your registration";
        let link = '';
        if (process.env.NODE_ENV === 'production') {
            link = `${process.env.SERVER_PATH_PROD}/api/auth/email-confirmation?token=${token}`;
        }
        else {
            link = `${process.env.SERVER_PATH_DEV}/api/auth/email-confirmation?token=${token}`;
        }
        const message = (0, confirmRegisterEmailTemplate_1.confirmRegisterEmailTemplate)(link, name);
        const result = await (0, sendEmail_1.sendEmail)(subject, message, send_to, sent_from);
        if (!result) {
            await (0, users_1.deleteUserById)(user._id);
            return res.status(400).json({ status: false, msg: 'Unable to send confirmation email' });
        }
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            image: user.image,
            token: token
        };
        return res.status(200).json({ status: true, msg: 'Confirmation email has been sent to your email.', user: userResponse });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.register = register;
//google
const google = async (req, res) => {
    const { token } = req.body;
    try {
        const response = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const data = await response.payload;
        const email_verified = data.email_verified;
        const email = data.email;
        const jti = data.jti;
        const name = data.name;
        const picture = data.picture;
        if (email_verified) {
            const user = await (0, users_1.getUserByEmail)(email);
            if (!user) {
                const salt = await bcrypt_1.default.genSalt(10);
                const bcryptPassword = await bcrypt_1.default.hash(jti, salt);
                const user1 = new users_1.UserModel({
                    name: name,
                    email: email,
                    verified: true,
                    image: picture,
                    password: bcryptPassword
                });
                await user1.save();
                // Create a default root folder for the user
                const defaultRootFolder = await createRootFolder(user1._id);
                if (!defaultRootFolder) {
                    return res.status(500).json({ status: false, msg: 'Unable to create default root folder' });
                }
                //sending success confirmation email
                const send_to = email;
                const sent_from = process.env.EMAIL_USER;
                const subject = "FrameFlow - Your registration is successfull";
                const message = (0, confirmationSuccessEmailTemplate_1.confirmationSuccessEmailTemplate)(name);
                const result = await (0, sendEmail_1.sendEmail)(subject, message, send_to, sent_from);
                const token = (0, generateToken_1.generateToken)({ _id: user1._id, email: user1.email });
                const userResponse = {
                    _id: user1._id,
                    name: user1.name,
                    email: user1.email,
                    verified: user1.verified,
                    image: user1.image,
                    token: token
                };
                return res.status(200).json({ status: true, msg: 'User logged in', user: userResponse });
            }
            else {
                const token = (0, generateToken_1.generateToken)({ _id: user._id, email: user.email });
                const userResponse = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    verified: user.verified,
                    image: user.image,
                    token: token
                };
                return res.status(200).json({ status: true, msg: 'User logged in', user: userResponse });
            }
        }
        else {
            return res.status(400).json({ status: false, msg: 'email is not registered' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.google = google;
//verify confirmation email link
const emailConfirmation = async (req, res) => {
    try {
        const token = req.query.token;
        const verifiedToken = await (0, tokens_1.getTokenByTokenValue)(token);
        if (!verifiedToken) {
            return res.redirect(`${client_path}/?invalid=true`);
        }
        const userId = verifiedToken.userId;
        // Create a default root folder for the user
        const defaultRootFolder = await createRootFolder(userId);
        if (!defaultRootFolder) {
            return res.status(500).json({ status: false, msg: 'Unable to create default root folder' });
        }
        const verifiedUser = await (0, users_1.updateUserById)(userId, { verified: true });
        if (!verifiedUser) {
            return res.redirect(`${client_path}/?invalid=true`);
        }
        await (0, tokens_1.deleteTokenByTokenValue)(token);
        const send_to = verifiedUser.email;
        const sent_from = process.env.EMAIL_USER;
        const subject = "FrameFlow - Your registration is successfull";
        const message = (0, confirmationSuccessEmailTemplate_1.confirmationSuccessEmailTemplate)(verifiedUser.name);
        const result = await (0, sendEmail_1.sendEmail)(subject, message, send_to, sent_from);
        if (!result) {
            return res.status(400).json({ status: false, msg: 'Unable to send success confirmation email' });
        }
        const userResponse = {
            _id: verifiedUser._id,
            name: verifiedUser.name,
            email: verifiedUser.email,
            verified: verifiedUser.verified,
            image: verifiedUser.image,
            token: token
        };
        res.redirect(`${client_path}/?verified=true&user=${JSON.stringify(userResponse)}`);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.emailConfirmation = emailConfirmation;
const createRootFolder = async (userId) => {
    try {
        // Implement logic to create a root folder for the user
        const rootFolder = await (0, folders_1.createFolder)({
            name: 'Root',
            parent: 'root itselft',
            user: userId,
        });
        return rootFolder;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
//# sourceMappingURL=authController.js.map