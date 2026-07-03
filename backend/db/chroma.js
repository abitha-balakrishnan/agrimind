import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
dotenv.config();

export const chromaClient = new ChromaClient({
    path: process.env.CHROMA_URI || 'http://localhost:8000'
});

export const setupChroma = async () => {
    try {
        // Just verify connection
        const heartbeat = await chromaClient.heartbeat();
        console.log(`ChromaDB connected. Heartbeat: ${heartbeat}`);
    } catch (error) {
        console.error('ChromaDB connection error:', error);
        process.exit(1);
    }
};

/**
 * Gets or creates the knowledge base collection.
 */
export const getCollection = async (name) => {
    return await chromaClient.getOrCreateCollection({ name });
};
