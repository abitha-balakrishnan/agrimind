import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/mongo.js';
import { setupChroma } from './db/chroma.js';
import apiRoutes from './routes/api.js';
import { startAlertAgent } from './agents/alertAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const startServer = async () => {
    try {
        await connectDB();
        await setupChroma();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            startAlertAgent(); // Start the background cron agent
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
