"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foldersController_1 = require("../controllers/foldersController");
const router = express_1.default.Router(); // "api/feedback"
// GET a folder by ID
router.get('/:id', foldersController_1.folderById);
// CREATE a new feedback
router.post('/', foldersController_1.createNewFolder);
// DELETE a folder by ID
router.delete('/:id', foldersController_1.deleteFolder);
// UPDATE a folder by ID
router.put('/:id', foldersController_1.updateFolder);
// get folders by user id
router.get('/user/:userId', foldersController_1.foldersByUserId);
// get ancestors of a folder by ID
router.get('/ancestors/:id', foldersController_1.folderAncestorsById);
// get folders by user id and parent
router.get('/user/:userId/:parent', foldersController_1.foldersByUserIdAndParent);
// get a root folder by user id
router.get('/root/:userId', foldersController_1.rootFolderByUserId);
exports.default = router;
//# sourceMappingURL=FolderRoute.js.map