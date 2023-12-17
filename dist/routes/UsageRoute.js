"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usageController_1 = require("../controllers/usageController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router(); // "api/usage"
// get usage by user id
router.get('/user/:userId', usageController_1.usageByUserId);
exports.default = router;
//# sourceMappingURL=UsageRoute.js.map