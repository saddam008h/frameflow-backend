import { usageByUserId } from '../controllers/usageController';

import express from 'express';
const router = express.Router(); // "api/usage"



// get usage by user id
router.get('/user/:userId', usageByUserId);



export default router;
