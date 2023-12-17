import express from 'express';

import { createNewFolder, deleteFolder, folderAncestorsById, folderById, foldersByUserId, foldersByUserIdAndParent, rootFolderByUserId, updateFolder } from '../controllers/foldersController';

const router = express.Router(); // "api/feedback"

// GET a folder by ID
router.get('/:id',  folderById);
// CREATE a new feedback
router.post('/', createNewFolder);
// DELETE a folder by ID
router.delete('/:id', deleteFolder); 
// UPDATE a folder by ID
router.put('/:id', updateFolder);
// get folders by user id
router.get('/user/:userId', foldersByUserId);
// get ancestors of a folder by ID
router.get('/ancestors/:id', folderAncestorsById);
// get folders by user id and parent
router.get('/user/:userId/:parent', foldersByUserIdAndParent);
// get a root folder by user id
router.get('/root/:userId', rootFolderByUserId);

export default router;
