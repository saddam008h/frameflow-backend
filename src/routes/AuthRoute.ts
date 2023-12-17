import express from 'express';
import { login, register, google, emailConfirmation } from '../controllers/authController';
import validateToken from '../middlewares/validateToken'

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/googlelogin', google)
router.get('/email-confirmation',emailConfirmation)

export default router;