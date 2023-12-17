"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootFolderByUserId = exports.getFoldersByUserIdAndParent = exports.getFolderAncestorsById = exports.getFoldersByUserId = exports.updateFolderById = exports.deleteFolderById = exports.createFolder = exports.getFolderById = exports.getFolders = exports.FolderModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Feedback Config
const FolderSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    parent: { type: String, required: true, default: "root" },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
});
exports.FolderModel = mongoose_1.default.model('Folder', FolderSchema);
// Feedback Actions
const getFolders = () => exports.FolderModel.find().sort({ _id: -1 });
exports.getFolders = getFolders;
const getFolderById = (id) => exports.FolderModel.findById(id);
exports.getFolderById = getFolderById;
const createFolder = (values) => new exports.FolderModel(values).save().then((folder) => folder.toObject());
exports.createFolder = createFolder;
const deleteFolderById = (id) => exports.FolderModel.findOneAndDelete({ _id: id });
exports.deleteFolderById = deleteFolderById;
const updateFolderById = (id, values) => exports.FolderModel.findByIdAndUpdate(id, values);
exports.updateFolderById = updateFolderById;
const getFoldersByUserId = (userId) => exports.FolderModel.find({ user: userId }).sort({ _id: -1 });
exports.getFoldersByUserId = getFoldersByUserId;
const getFolderAncestorsById = async (folderId) => {
    const ancestors = [];
    let currentFolder = await exports.FolderModel.findById(folderId);
    while (currentFolder && currentFolder.parent !== 'root itselft') {
        currentFolder = await exports.FolderModel.findById(currentFolder.parent);
        if (currentFolder) {
            ancestors.unshift(currentFolder); // Add current folder to the beginning of the array
        }
    }
    return ancestors;
};
exports.getFolderAncestorsById = getFolderAncestorsById;
const getFoldersByUserIdAndParent = async (userId, parentId) => {
    try {
        const userFolders = await exports.FolderModel.find({ user: userId, parent: parentId });
        return userFolders;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};
exports.getFoldersByUserIdAndParent = getFoldersByUserIdAndParent;
// get Root Folder by user id
const getRootFolderByUserId = async (userId) => {
    try {
        const rootFolder = await exports.FolderModel.find({ user: userId, name: 'Root' });
        return rootFolder;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};
exports.getRootFolderByUserId = getRootFolderByUserId;
//# sourceMappingURL=folders.js.map