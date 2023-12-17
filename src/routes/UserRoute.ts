import { changePassword, getUsers, updateUser } from '../controllers/userController';
import express from 'express';
import upload from '../middlewares/multerMiddleware';

const router = express.Router();


router.get('/', getUsers)
router.put('/update-user/:id', upload.single('userImage'), updateUser)
router.put('/update-password/:id', changePassword)

export default router;