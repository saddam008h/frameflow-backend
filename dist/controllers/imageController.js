"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImages = exports.imagesByUserIdAndFolder = exports.imagesByUserId = exports.addNewImages = void 0;
const images_1 = require("../db/images");
const storage_1 = require("../db/storage");
const usage_1 = require("../db/usage");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
// CREATE new Images
const addNewImages = async (req, res) => {
    try {
        const { user, folder } = req.body;
        const imagesArray = req.files;
        const totalSize = imagesArray.reduce((acc, image) => acc + image.size, 0);
        // Update user's storage
        let userStorage;
        userStorage = await (0, storage_1.getStorageByUserId)(user);
        if (!userStorage.length) {
            await (0, storage_1.addNewStorage)({
                totalStorage: 0,
                user,
            });
            userStorage = await (0, storage_1.getStorageByUserId)(user);
        }
        if (userStorage[0].totalStorage + totalSize > process.env.STORAGE_LIMIT) {
            return res.status(500).json({ status: false, msg: `Limit Exeeded. Total storage limit is 10MB` });
        }
        else {
            const newTotalStorage = userStorage[0].totalStorage + totalSize;
            await (0, storage_1.updateStorageById)(userStorage[0]._id, { totalStorage: newTotalStorage });
        }
        // update user's daily usage
        let userDailyUsage;
        userDailyUsage = await (0, usage_1.getUsageByUserId)(user);
        if (!userDailyUsage.length) {
            await (0, usage_1.addNewUsage)({
                totalUsage: 0,
                user,
            });
            userDailyUsage = await (0, usage_1.getUsageByUserId)(user);
        }
        if (userDailyUsage[0].totalUsage + totalSize > process.env.DAILY_USAGE_LIMIT) {
            return res.status(500).json({ status: false, msg: `Limit Exeeded. Daily usage limit is 25MB` });
        }
        else {
            const newTotalUsage = userDailyUsage[0].totalUsage + totalSize;
            await (0, usage_1.updateUsageById)(userDailyUsage[0]._id, { totalUsage: newTotalUsage });
        }
        const uploadPromises = imagesArray.map(async (image) => {
            const b64 = Buffer.from(image.buffer).toString('base64');
            const dataURI = "data:" + image.mimetype + ";base64," + b64;
            return cloudinary.uploader.upload(dataURI, { folder: "FlowFrame/user-images" })
                .then(async (result) => {
                // Save image URL and public ID in the database
                const newImage = await (0, images_1.addImage)({
                    imageName: image.originalname,
                    imageSize: image.size,
                    user,
                    folder,
                    imageUrl: result.url,
                    imagePublicId: result.public_id
                });
                return newImage;
            });
        });
        Promise.all(uploadPromises)
            .then((uploadedImages) => {
            return res.status(201).json({ status: true, msg: 'Images added successfully', data: uploadedImages });
        })
            .catch((error) => {
            console.log(error);
            return res.status(500).json({ status: false, msg: 'Something went wrong' });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.addNewImages = addNewImages;
// GET images by user ID
const imagesByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userFolders = await (0, images_1.getImagesByUserId)(userId);
        if (!userFolders) {
            return res.status(404).json({ status: false, msg: 'No images found' });
        }
        return res.status(200).json({ status: true, msg: 'Images retrieved successfully', data: userFolders });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.imagesByUserId = imagesByUserId;
// GET images by user ID and parent ID
const imagesByUserIdAndFolder = async (req, res) => {
    const userId = req.params.userId;
    const imageId = req.params.parent;
    try {
        const userImages = await (0, images_1.getImagesByUserIdAndFolder)(userId, imageId);
        if (!userImages) {
            return res.status(404).json({ status: false, msg: 'No images found' });
        }
        return res.status(200).json({ status: true, msg: 'Images retrieved successfully', data: userImages });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.imagesByUserIdAndFolder = imagesByUserIdAndFolder;
// DELETE multiple images by IDs
const deleteImages = async (req, res) => {
    const imageIds = req.body.imageIds;
    try {
        const deletedImages = await Promise.all(imageIds.map(async (imageId) => {
            // Delete from your database
            const deletedImage = await (0, images_1.deleteImageById)(imageId);
            // Delete from Cloudinary
            if (deletedImage && deletedImage.imagePublicId) {
                await cloudinary.uploader.destroy(deletedImage.imagePublicId);
            }
            return deletedImage;
        }));
        // Check if any image was deleted
        if (deletedImages.every((image) => !image)) {
            return res.status(404).json({ status: false, msg: 'Images not found' });
        }
        // Update user's storage
        const userStorage = await (0, storage_1.getStorageByUserId)(deletedImages[0].user);
        const totalSize = deletedImages.reduce((acc, image) => acc + image.imageSize, 0);
        const newTotalStorage = userStorage[0].totalStorage - totalSize;
        await (0, storage_1.updateStorageById)(userStorage[0]._id, { totalStorage: newTotalStorage });
        return res.status(200).json({ status: true, msg: 'Images deleted successfully', data: deletedImages });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.deleteImages = deleteImages;
//# sourceMappingURL=imageController.js.map