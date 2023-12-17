import { forgotPassword, newPassword } from '../controllers/resetPasswordController';
import express from 'express';
const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/new-password', newPassword)
export default router;