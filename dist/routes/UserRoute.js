"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../controllers/userController");
const express_1 = __importDefault(require("express"));
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = express_1.default.Router();
router.get('/', userController_1.getUsers);
router.put('/update-user/:id', multerMiddleware_1.default.single('userImage'), userController_1.updateUser);
router.put('/update-password/:id', userController_1.changePassword);
exports.default = router;
//# sourceMappingURL=UserRoute.js.map