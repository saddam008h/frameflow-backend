"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateUser = exports.getUsers = void 0;
const users_1 = require("../db/users");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const getUsers = async (req, res) => {
    try {
        const users = await users_1.UserModel.find();
        return res.status(200).json({ status: true, msg: 'Users fetched', users: users });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userImage = req.file;
        console.log(userImage);
        if (!id || !name) {
            return res.status(400).json({ status: false, msg: 'Missing required fields' });
        }
        const user = await (0, users_1.getUserById)(id);
        if (!user) {
            return res.status(404).json({ status: false, msg: 'User not found' });
        }
        //if user just updated name
        if (!userImage) {
            await user.updateOne({ name: name });
            console.log('uppp');
            return res.status(200).json({ status: true, msg: 'Profile Updated Successfully', name: name });
        }
        //delete previous image from cloudinary
        if (user.imagePublicId) {
            cloudinary.uploader.destroy(user.imagePublicId);
            console.log('deleted');
        }
        const b64 = Buffer.from(userImage.buffer).toString('base64');
        const dataURI = "data:" + userImage.mimetype + ";base64," + b64;
        //upload image on cloudinary
        cloudinary.uploader.upload(dataURI, { folder: "Recapeo/user-profiles" })
            .then(async (result) => {
            //save image url and public id in db
            try {
                await user.updateOne({ name: name, image: result.url, imagePublicId: result.public_id });
                return res.status(200).json({ status: true, msg: 'Profile Updated Successfully', name, image: result.url });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ status: false, msg: 'Something went wrong' });
            }
        })
            .catch((error) => {
            console.log(error);
            return res.status(500).json({ status: false, msg: 'Something went wrong' });
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.updateUser = updateUser;
// change user password
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword, currentPassword } = req.body;
        if (!id || !newPassword || !currentPassword) {
            return res.status(400).json({ status: false, msg: 'Missing required fields' });
        }
        const user = await (0, users_1.getUserById)(id);
        if (!user) {
            return res.status(404).json({ status: false, msg: 'User not found' });
        }
        const validPassword = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!validPassword) {
            return res
                .status(401)
                .json({ status: false, msg: "Invalid current password." });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
        await user.updateOne({ password: hashedPassword });
        return res.status(200).json({ status: true, msg: 'Password Changed Successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=userController.js.map