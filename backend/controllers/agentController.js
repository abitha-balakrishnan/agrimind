import { handleQuery } from '../agents/orchestrator.js';
import { pestAgent } from '../agents/pestAgent.js';

export const processFarmerQuery = async (req, res) => {
    try {
        const farmerQuery = req.body;
        // Example farmerQuery: { location, soilType, landSize, crop, growthStage }
        if (!farmerQuery.location || !farmerQuery.soilType) {
            return res.status(400).json({ error: "Location and Soil Type are basic requirements." });
        }

        const synthesisResult = await handleQuery(farmerQuery);
        
        // Log to DB here if needed
        // await QueryHistory.create({...})

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
        
        const b64 = req.file.buffer.toString('base64');
        const contextData = req.body; // e.g. { crop: "Tomato" }
        
        const diagnosis = await pestAgent(b64, req.file.mimetype, contextData);
        
        res.json(diagnosis);
    } catch (error) {
        console.error("Error in scanPestImage:", error);
        res.status(500).json({ error: "Failed to scan image." });
    }
};
