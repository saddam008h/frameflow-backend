"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storageController_1 = require("../controllers/storageController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router(); // "api/storage"
// get storage by user id
router.get('/user/:userId', storageController_1.storageByUserId);
exports.default = router;
//# sourceMappingURL=StorageRoute.js.map