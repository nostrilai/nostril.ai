import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Relay } from "nostr-tools";
import { generateKeyPair, encryptMessage, decryptMessage, createEvent_nip44, sendEvent } from "./nostrUtils.js";
import fs from 'fs';
import path from 'path';
// Set up Express API
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Generate bot keys
const bot = generateKeyPair();
console.log("🤖 Bot Public Key:", bot.publicKey);

// Connect to Nostr Relay and listen for messages
async function startListening() {
    console.log("📡 Connecting to Nostr Relay...");
    const relay = new Relay("wss://relay.damus.io");
    await relay.connect();
    console.log("✅ Connected to relay: wss://relay.damus.io");

    // Subscribe to kind: 4 (encrypted direct messages)
    relay.subscribe(
        [{ kinds: [4], "#p": [bot.publicKey] }], 
        {
            onevent: async (event) => {
                console.log("📩 Received encrypted message:", event);
                const senderPubKey = event.pubkey;
                const encryptedMessage = event.content;
                // save the event json to a file
                const filePath = path.join("./", 'event.json');
                fs.writeFileSync(filePath, JSON.stringify(event, null, 2));
                try {
                    // **確保 `decryptMessage` 使用 `await`**
                    const decryptedMessage = await decryptMessage(bot.privateKey, senderPubKey, encryptedMessage);
                    
                    console.log("🔓 Decrypted message:", decryptedMessage);

                    // Generate a bot reply
                    const botReply = `Echo: ${decryptedMessage}`;

                    // Encrypt the bot reply using NIP-44
                    const encryptedReply = await encryptMessage(bot.privateKey, senderPubKey, botReply);

                    // Create a Nostr event for the bot's response
                    const botEvent = await createEvent_nip44(bot.privateKey, bot.publicKey, senderPubKey, encryptedReply);

                    // Send the encrypted response back to the relay
                    await relay.publish(botEvent);
                    console.log("📨 Sent encrypted reply!");

                } catch (error) {
                    console.error("❌ Failed to decrypt message:", error);
                }
            }
        }
    );
}

// Start listening for messages on Nostr Relay
startListening();

// Start Express API server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
