import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import {connectDB} from './config/db.js';
import routes from './routes/index.js';
import {handleValidationError} from './middleware/validation.js';
import {ipRateLimiter, userRateLimiter} from './config/upstash.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting middleware (applied to all routes)
// app.use(ipRateLimiter);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend dev ports
  credentials: true, // Allow cookies/sessions if needed
}));
app.use(express.json());

// Routes with user-based rate limiting and caching (applied within routes after auth)
// app.use('/api', userRateLimiter, routes);
app.use('/api', routes);

// Error handling middleware
app.use(handleValidationError);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
