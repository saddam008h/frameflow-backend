"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImagesByUserIdAndFolder = exports.deleteImagesByFolderId = exports.getImagesByFolderId = exports.getImagesByUserId = exports.updateImageById = exports.deleteImageById = exports.addImage = exports.getImageById = exports.ImageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Feedback Config
const ImageSchema = new mongoose_1.default.Schema({
    imageName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageSize: { type: Number, required: true },
    imagePublicId: { type: String, required: true },
    folder: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Folder', required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});
exports.ImageModel = mongoose_1.default.model('Image', ImageSchema);
// Feedback Actions
const getImageById = (id) => exports.ImageModel.findById(id).populate('user');
exports.getImageById = getImageById;
const addImage = (values) => new exports.ImageModel(values).save().then((image) => image.toObject());
exports.addImage = addImage;
const deleteImageById = (id) => exports.ImageModel.findOneAndDelete({ _id: id });
exports.deleteImageById = deleteImageById;
const updateImageById = (id, values) => exports.ImageModel.findByIdAndUpdate(id, values);
exports.updateImageById = updateImageById;
const getImagesByUserId = (userId) => exports.ImageModel.find({ user: userId }).sort({ _id: -1 });
exports.getImagesByUserId = getImagesByUserId;
const getImagesByFolderId = (folderId) => exports.ImageModel.find({ folder: folderId }).sort({ _id: -1 });
exports.getImagesByFolderId = getImagesByFolderId;
const deleteImagesByFolderId = (folderId) => exports.ImageModel.deleteMany({ folder: folderId });
exports.deleteImagesByFolderId = deleteImagesByFolderId;
const getImagesByUserIdAndFolder = async (userId, folderId) => {
    try {
        const userImages = await exports.ImageModel.find({ user: userId, folder: folderId });
        return userImages;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};
exports.getImagesByUserIdAndFolder = getImagesByUserIdAndFolder;
//# sourceMappingURL=images.js.map