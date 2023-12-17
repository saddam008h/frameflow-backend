"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageByUserId = void 0;
const storage_1 = require("../db/storage");
// GET storage by user ID
const storageByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userStorage = await (0, storage_1.getStorageByUserId)(userId);
        if (!userStorage) {
            return res.status(404).json({ status: false, msg: 'No Storage found' });
        }
        return res.status(200).json({ status: true, msg: 'Storage retrieved successfully', data: userStorage });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.storageByUserId = storageByUserId;
//# sourceMappingURL=storageController.js.map