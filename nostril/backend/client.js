import { generateKeyPair, encryptMessage, createEvent_nip44, decryptMessage } from "./nostrUtils.js";
import readlineSync from "readline-sync";
import { Relay } from "nostr-tools";
// **Generate a random Nostr key pair**
const user = generateKeyPair();

console.log("🔑 Your Nostr Keys:");
console.log("📝 Public Key:", user.publicKey);
console.log("🔒 Private Key:", user.privateKey);

// **Nostr bot public key (Replace with the actual bot's public key)**
const botPublicKey = "c418821caf6b8006ea57ea9171c7f74e1b684e24b953ec5bb757294d515cb973"; // Replace with actual bot key

async function sendMessage() {
    const relay = new Relay("wss://relay.damus.io");
    await relay.connect();
    console.log("\n📡 Connecting to Nostr...");
    
    // **Get user input message**
    const message = readlineSync.question("💬 Enter your message: ");

    // **Encrypt the message using NIP-44**
    const encryptedMessage = await encryptMessage(user.privateKey, botPublicKey, message);
    if (!encryptedMessage) {
        console.error("❌ Failed to encrypt the message!");
        process.exit(1);
    }

    console.log("🔐 Encrypted Message:", encryptedMessage);

    // **Create a NIP-44 event**
    const event = await createEvent_nip44(user.privateKey, user.publicKey, botPublicKey, encryptedMessage);
    console.log("📨 Sending Encrypted Event:", event);

    // **Send the encrypted event to Nostr Relay**
    await relay.publish(event);
    console.log("✅ Message successfully sent!");
    
    // **Listen for the bot's response**
    console.log("\n⏳ Waiting for bot's response...");

    // Subscribe to kind: 4 (encrypted direct messages)
    await new Promise((resolve) => {
        relay.subscribe(
            [{ kinds: [4], "#p": [user.publicKey] }], 
            {
                onevent: async (event) => {
                    console.log("📩 Received encrypted message:", event);
                    const encryptedMessage = event.content;

                    try {
                        // **Ensure `decryptMessage` uses `await`**
                        const decryptedMessage = await decryptMessage(user.privateKey, botPublicKey, encryptedMessage);
                        
                        console.log("🔓 Decrypted message:", decryptedMessage);
                        resolve(); // Resolve the promise once a message is decrypted

                    } catch (error) {
                        console.error("❌ Failed to decrypt message:", error);
                    }
                }
            }
        );
    });
    process.exit(0);
}

// **Start the client**
sendMessage();
