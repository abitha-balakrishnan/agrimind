import express from 'express';
import multer from 'multer';
import { processFarmerQuery, scanPestImage, getFarmerHistory } from '../controllers/agentController.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/agent/query', processFarmerQuery);
router.post('/agent/pest-scan', upload.single('image'), scanPestImage);
router.get('/farmer/:id/history', getFarmerHistory);

router.get('/weather/:location', (req, res) => {
    res.json({ location: req.params.location, temp: 28, condition: "Sunny" });
});

export default router;
