import { handleQuery } from '../agents/orchestrator.js';
import { pestAgent } from '../agents/pestAgent.js';
import { chatAgent } from '../agents/chatAgent.js';
import { QueryHistory } from '../models/QueryHistory.js';
import { isMongoConnected } from '../db/mongo.js';

export const processFarmerQuery = async (req, res) => {
    try {
        const farmerQuery = req.body;
        if (!farmerQuery.location || !farmerQuery.soilType) {
            return res.status(400).json({ error: "Location and Soil Type are basic requirements." });
        }

        const synthesisResult = await handleQuery(farmerQuery);

        if (isMongoConnected) {
            await QueryHistory.create({
                farmerId: farmerQuery.farmerId || 'default',
                location: farmerQuery.location,
                soilType: farmerQuery.soilType,
                landSize: farmerQuery.landSize,
                crop: farmerQuery.crop,
                executiveSummary: synthesisResult.executiveSummary,
                cropResult: synthesisResult.crop,
                weatherResult: synthesisResult.weather,
                fertilizerResult: synthesisResult.fertilizer,
                irrigationResult: synthesisResult.irrigation,
            });
        }

        res.json(synthesisResult);
    } catch (error) {
        console.error("Error in processFarmerQuery:", error);
        res.status(500).json({ error: "Failed to process query." });
    }
};

export const scanPestImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image provided." });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: `Unsupported image type: ${req.file.mimetype}` });
        }

        const b64 = req.file.buffer.toString('base64');
        const contextData = req.body;

        const diagnosis = await pestAgent(b64, req.file.mimetype, contextData);

        if (isMongoConnected) {
            await QueryHistory.create({
                farmerId: contextData.farmerId || 'default',
                crop: contextData.crop || 'Unknown',
                pestResult: diagnosis,
            });
        }

        res.json(diagnosis);
    } catch (error) {
        console.error("Error in scanPestImage:", error);
        res.status(500).json({ error: error.message || "Failed to scan image." });
    }
};

export const processChatMessage = async (req, res) => {
    try {
        const { message, language = 'en', context = {} } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const validLanguages = ['en', 'ta', 'hi'];
        const lang = validLanguages.includes(language) ? language : 'en';

        const result = await chatAgent({ message: message.trim(), language: lang, context });

        if (isMongoConnected) {
            await QueryHistory.create({
                farmerId: context.farmerId || 'default',
                crop: context.crop || 'Chat',
                executiveSummary: result.reply,
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error in processChatMessage:', error);
        res.status(500).json({ error: 'Failed to process chat message.' });
    }
};

export const getFarmerHistory = async (req, res) => {
    try {
        if (!isMongoConnected) {
            return res.status(503).json({ error: "MongoDB not available." });
        }

        const history = await QueryHistory.find({ farmerId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        res.json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history." });
    }
};
