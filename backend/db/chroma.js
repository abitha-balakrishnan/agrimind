import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
import { queryFallback } from './ragFallback.js';

dotenv.config();

let chromaConnected = false;

const parseChromaUri = (uri) => {
    const url = new URL(uri || 'http://localhost:8000');
    return { host: url.hostname, port: url.port ? Number(url.port) : 8000, ssl: url.protocol === 'https:' };
};

export const chromaClient = new ChromaClient(parseChromaUri(process.env.CHROMA_URI));

export const isChromaConnected = () => chromaConnected;

export const setupChroma = async () => {
    try {
        const heartbeat = await chromaClient.heartbeat();
        console.log(`ChromaDB connected. Heartbeat: ${heartbeat}`);
        chromaConnected = true;
        return true;
    } catch (error) {
        console.warn('ChromaDB connection error. Using local RAG fallback.', error.message);
        chromaConnected = false;
        return false;
    }
};

export const getCollection = async (name) => {
    return chromaClient.getOrCreateCollection({ name });
};

export const queryKnowledge = async (collectionName, queryText, nResults = 3) => {
    if (!chromaConnected) {
        return queryFallback(collectionName, queryText, nResults);
    }
    try {
        const collection = await getCollection(collectionName);
        const results = await collection.query({ queryTexts: [queryText], nResults });
        if (results?.documents?.[0]?.length > 0) {
            return results.documents[0].join('\n');
        }
    } catch (error) {
        console.warn(`Chroma query failed for ${collectionName}:`, error.message);
    }
    return queryFallback(collectionName, queryText, nResults);
};
