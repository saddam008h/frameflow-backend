"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foldersByUserIdAndParent = exports.foldersByUserId = exports.updateFolder = exports.deleteFolder = exports.createNewFolder = exports.folderAncestorsById = exports.rootFolderByUserId = exports.folderById = void 0;
const folders_1 = require("../db/folders");
const images_1 = require("../db/images"); //TODO: DEpendencies
const storage_1 = require("../db/storage"); //dependency
// GET a folder by ID
const folderById = async (req, res) => {
    const folderId = req.params.id;
    try {
        const folder = await (0, folders_1.getFolderById)(folderId);
        if (!folder) {
            return res.status(404).json({ status: false, msg: 'Folder not found' });
        }
        return res.status(200).json({ status: true, msg: 'Folder retrieved successfully', data: folder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.folderById = folderById;
// get root folder by user id
const rootFolderByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const folder = await (0, folders_1.getRootFolderByUserId)(userId);
        if (!folder) {
            return res.status(404).json({ status: false, msg: 'Root Folder not found' });
        }
        return res.status(200).json({ status: true, msg: 'Root Folder retrieved successfully', data: folder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.rootFolderByUserId = rootFolderByUserId;
// get ancestors of a folder by ID
const folderAncestorsById = async (req, res) => {
    const folderId = req.params.id;
    try {
        const ancestors = await (0, folders_1.getFolderAncestorsById)(folderId);
        return res.status(200).json({ status: true, msg: 'Folder ancestors retrieved successfully', data: ancestors });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.folderAncestorsById = folderAncestorsById;
// CREATE a new folder
const createNewFolder = async (req, res) => {
    const { name, user, parent } = req.body;
    try {
        const folder = await (0, folders_1.createFolder)({ name, user, parent });
        return res.status(201).json({ status: true, msg: 'Folder created successfully', data: folder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.createNewFolder = createNewFolder;
// DELETE a folder by ID
const deleteFolder = async (req, res) => {
    const folderId = req.params.id;
    try {
        const allImages = await (0, images_1.getImagesByFolderId)(folderId);
        // update user storage
        const totalSize = allImages.reduce((acc, image) => acc + image.imageSize, 0);
        const userStorage = await (0, storage_1.getStorageByUserId)(allImages[0].user);
        const newTotalStorage = userStorage[0].totalStorage - totalSize;
        await (0, storage_1.updateStorageById)(userStorage[0]._id, { totalStorage: newTotalStorage });
        // Delete images first
        await (0, images_1.deleteImagesByFolderId)(folderId);
        // Now, delete the folder
        const deletedFolder = await (0, folders_1.deleteFolderById)(folderId);
        if (!deletedFolder) {
            return res.status(404).json({ status: false, msg: 'Folder not found' });
        }
        return res.status(200).json({ status: true, msg: 'Folder deleted successfully', data: deletedFolder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.deleteFolder = deleteFolder;
// UPDATE a folder by ID
const updateFolder = async (req, res) => {
    const folderId = req.params.id;
    const { name, user } = req.body;
    try {
        const updatedFolder = await (0, folders_1.updateFolderById)(folderId, { name, user, });
        if (!updatedFolder) {
            return res.status(404).json({ status: false, msg: 'Folder not found' });
        }
        return res.status(200).json({ status: true, msg: 'Folder updated successfully', data: updatedFolder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.updateFolder = updateFolder;
// GET folderss by user ID
const foldersByUserId = async (req, res) => {
    const userId = req.params.userId; // Assuming the parameter name is 'userId'
    try {
        const userFolders = await (0, folders_1.getFoldersByUserId)(userId);
        if (!userFolders) {
            return res.status(404).json({ status: false, msg: 'No folders found' });
        }
        return res.status(200).json({ status: true, msg: 'Folders retrieved successfully', data: userFolders });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.foldersByUserId = foldersByUserId;
// GET folders by user ID and parent ID
const foldersByUserIdAndParent = async (req, res) => {
    const userId = req.params.userId;
    const parentId = req.params.parent;
    try {
        const userFolders = await (0, folders_1.getFoldersByUserIdAndParent)(userId, parentId);
        if (!userFolders) {
            return res.status(404).json({ status: false, msg: 'No folders found' });
        }
        return res.status(200).json({ status: true, msg: 'Folders retrieved successfully', data: userFolders });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.foldersByUserIdAndParent = foldersByUserIdAndParent;
// TODO: dependencies
//# sourceMappingURL=foldersController.js.map