import express from 'express';
import userAuth from '../middlewares/auth.js';
import { generateImage } from '../controllers/imageController.js';

const router = express.Router();

router.post('/generate-image', userAuth, generateImage);

export default router;
