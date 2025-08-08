import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/mongodb.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/image', imageRoutes);

app.get('/', (req, res) => res.send('API Working'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
