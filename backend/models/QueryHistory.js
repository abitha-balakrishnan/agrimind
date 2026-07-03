import mongoose from 'mongoose';

const queryHistorySchema = new mongoose.Schema({
    farmerId: { type: String, default: 'default' },
    location: String,
    soilType: String,
    landSize: String,
    crop: String,
    executiveSummary: String,
    cropResult: mongoose.Schema.Types.Mixed,
    weatherResult: mongoose.Schema.Types.Mixed,
    fertilizerResult: mongoose.Schema.Types.Mixed,
    irrigationResult: mongoose.Schema.Types.Mixed,
    pestResult: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
});

export const QueryHistory = mongoose.models.QueryHistory
    || mongoose.model('QueryHistory', queryHistorySchema);
