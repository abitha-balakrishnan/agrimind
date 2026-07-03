import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export let isMongoConnected = false;
let memoryServer = null;

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrimind';

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log('MongoDB connected successfully');
        isMongoConnected = true;
        return;
    } catch (error) {
        console.warn('MongoDB connection failed:', error.message);
    }

    if (process.env.USE_MEMORY_MONGO === 'true') {
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            memoryServer = await MongoMemoryServer.create();
            const memUri = memoryServer.getUri('agrimind');
            await mongoose.connect(memUri);
            console.log('MongoDB in-memory instance started');
            isMongoConnected = true;
            return;
        } catch (error) {
            console.warn('In-memory MongoDB failed:', error.message);
        }
    }

    console.warn('MongoDB unavailable. History persistence disabled. Set USE_MEMORY_MONGO=true or run docker-compose for MongoDB.');
    isMongoConnected = false;
};

export default connectDB;
