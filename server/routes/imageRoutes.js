import express from 'express';
import userAuth from '../middlewares/auth.js';
import { generateGeminiImage } from '../controllers/imageController.js';

const router = express.Router();

router.post('/generate-image', userAuth, generateGeminiImage);

export default router;
