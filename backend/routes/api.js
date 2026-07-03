import express from 'express';
import multer from 'multer';
import { processFarmerQuery, scanPestImage } from '../controllers/agentController.js';

const router = express.Router();

// Memory storage for buffer-based handling
const upload = multer({ storage: multer.memoryStorage() });

// Orchestrator Query endpoint
router.post('/agent/query', processFarmerQuery);

// Pest Vision endpoint
router.post('/agent/pest-scan', upload.single('image'), scanPestImage);

// Mock endpoints for the sake of completeness defined in Plan
router.get('/farmer/:id/history', (req, res) => {
    res.json([{ role: "user", text: "past query" }, { role: "assistant", text: "past response" }]);
});

router.get('/weather/:location', (req, res) => {
    res.json({ location: req.params.location, temp: 28, condition: "Sunny" });
});

export default router;
