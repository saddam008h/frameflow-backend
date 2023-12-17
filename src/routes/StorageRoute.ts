import { storageByUserId } from '../controllers/storageController';

import express from 'express';
const router = express.Router(); // "api/storage"



// get storage by user id
router.get('/user/:userId', storageByUserId);



export default router;
