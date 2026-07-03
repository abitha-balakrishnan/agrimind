import cron from 'node-cron';
import twilio from 'twilio';
import dotenv from 'dotenv';
// In a real app we'd query the DB for farmers. For this mock we'll use dummy data.

dotenv.config();

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'mock_sid') {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendAlert = async (to, message, method = 'sms') => {
    try {
        if (!client) {
            console.log(`[MOCK ALERT - ${method}] To: ${to} | Message: ${message}`);
            return;
        }
        
        const fromNumber = method === 'whatsapp' ? 'whatsapp:+14155238886' : process.env.TWILIO_PHONE_NUMBER;
        const toNumber = method === 'whatsapp' ? `whatsapp:${to}` : to;

        await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber
        });
        console.log(`Alert sent to ${to} via ${method}`);
    } catch (error) {
        console.error('Failed to send alert:', error);
    }
};

// Cron job running every hour (mocking daily/frequent checks)
export const startAlertAgent = () => {
    console.log("Alert Agent Scheduled (Runs every hour).");
    cron.schedule('0 * * * *', async () => {
        console.log("Running Alert Agent Job...");
        
        // This is where we would:
        // 1. Fetch farmer profiles & their opt-in preferences (SMS or WA)
        // 2. Fetch live weather & pest risks for their regions
        // 3. Draft a short Claude message if risk threshold crossed
        // 4. Send via Twilio

        // Mock Logic:
        const mockFarmers = [{ phone: '+1234567890', preference: 'sms', region: 'Pune' }];
        for (const farmer of mockFarmers) {
            // Mock condition: "Heavy rain expected"
            const draftedMessage = "AgriMind Alert: Heavy rainfall predicted for Pune area tomorrow. Please delay your pesticide spray.";
            await sendAlert(farmer.phone, draftedMessage, farmer.preference);
        }
    });
};
