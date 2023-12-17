import express from 'express';

import { addNewImages, deleteImages, imagesByUserId, imagesByUserIdAndFolder } from '../controllers/imageController';
import upload from '../middlewares/multerMiddleware';
const router = express.Router(); // "api/feedback"

// GET a image by ID

// CREATE a new images
router.post('/', upload.array('images',5), addNewImages);
// get images by user id
router.get('/user/:userId', imagesByUserId);
// get folders by user id and parent
router.get('/user/:userId/:parent', imagesByUserIdAndFolder);
// delete multiple images by ids
router.delete('/', deleteImages);


export default router;
