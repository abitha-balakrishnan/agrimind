import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/mongo.js';
import { setupChroma } from './db/chroma.js';
import { isApiKeyConfigured } from './llm/claudeClient.js';
import { loadDatasets } from './knowledge/dataService.js';
import apiRoutes from './routes/api.js';
import { startAlertAgent } from './agents/alertAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({
    status: 'ok',
    claudeConfigured: isApiKeyConfigured(),
}));

const startServer = async () => {
    try {
        loadDatasets();
        await connectDB();
        await setupChroma();

        if (!isApiKeyConfigured()) {
            console.warn('\n⚠️  ANTHROPIC_API_KEY is not set — AI features will return errors until configured.');
            console.warn('   Copy backend/.env.example to backend/.env and add your Anthropic API key.\n');
        } else {
            console.log('✓ Claude API key configured — live AI responses enabled.');
        }
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            startAlertAgent();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
