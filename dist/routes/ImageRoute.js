"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const imageController_1 = require("../controllers/imageController");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = express_1.default.Router(); // "api/feedback"
// GET a image by ID
// CREATE a new images
router.post('/', multerMiddleware_1.default.array('images', 5), imageController_1.addNewImages);
// get images by user id
router.get('/user/:userId', imageController_1.imagesByUserId);
// get folders by user id and parent
router.get('/user/:userId/:parent', imageController_1.imagesByUserIdAndFolder);
// delete multiple images by ids
router.delete('/', imageController_1.deleteImages);
exports.default = router;
//# sourceMappingURL=ImageRoute.js.map