"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resetPasswordController_1 = require("../controllers/resetPasswordController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/forgot-password', resetPasswordController_1.forgotPassword);
router.post('/new-password', resetPasswordController_1.newPassword);
exports.default = router;
//# sourceMappingURL=ResetPasswordRoute.js.map