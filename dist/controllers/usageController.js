"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageByUserId = void 0;
const usage_1 = require("../db/usage");
// GET usage by user ID
const usageByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userUsage = await (0, usage_1.getUsageByUserId)(userId);
        if (!userUsage) {
            return res.status(404).json({ status: false, msg: 'No Usage found' });
        }
        return res.status(200).json({ status: true, msg: 'Usage retrieved successfully', data: userUsage });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
};
exports.usageByUserId = usageByUserId;
//# sourceMappingURL=usageController.js.map