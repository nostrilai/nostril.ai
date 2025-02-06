import { generateSecretKey, getPublicKey, Relay , nip44, finalizeEvent } from "nostr-tools";
import WebSocket from 'ws';

// **Generate Nostr key pair**
function generateKeyPair() {
    const privateKey = generateSecretKey(); // Uint8Array(32)
    const publicKey = getPublicKey(privateKey);
    return { privateKey, publicKey };
}

// **Encrypt message using NIP-44**
async function encryptMessage(senderPrivKey, receiverPubKey, message) {
    try {
        const sharedSecret = nip44.getConversationKey(senderPrivKey, receiverPubKey);
        const encryptedMessage = nip44.encrypt(message, sharedSecret);
        return encryptedMessage;
    } catch (error) {
        console.error("NIP-44 Encryption failed:", error);
        return null;
    }
}

// **Decrypt message using NIP-44**
async function decryptMessage(receiverPrivKey, senderPubKey, encryptedMessage) {
    try {
        const sharedSecret = nip44.getConversationKey(receiverPrivKey, senderPubKey);
        const decryptedMessage = nip44.decrypt(encryptedMessage, sharedSecret);
        return decryptedMessage;
    } catch (error) {
        console.error("NIP-44 Decryption failed:", error);
        return null;
    }
}

// **Create NIP-44 `kind: 4` event**
async function createEvent_nip44(senderPrivKey, senderPubKey, receiverPubKey, encryptedMessage) {
    let event = {
        kind: 4, // 4 = Private encrypted message
        pubkey: senderPubKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", receiverPubKey]], // Target receiver
        content: encryptedMessage,
    };

    if (typeof window !== "undefined" && window.nostr) {
        return await window.nostr.signEvent(event); // Use browser Nostr extension
    } else {
        return finalizeEvent(event, senderPrivKey); // Self-sign
    }
}

// Set up WebSocket
global.WebSocket = WebSocket;

// Connect to Relay and send event
async function sendEvent(event) {
    const relayUrl = "wss://relay.damus.io";
    const relay = new Relay(relayUrl);

    await relay.connect();
    await relay.publish(event);
    console.log("Message sent!");
    relay.close();
}

// **Receive Nostr event and decrypt**
async function receiveAndDecrypt(eventJson, receiverPrivKey) {
    try {
        const event = JSON.parse(eventJson);
        const senderPubKey = event.pubkey;
        const encryptedContent = event.content;

        const decryptedMessage = await decryptMessage(receiverPrivKey, senderPubKey, encryptedContent);
        return decryptedMessage;
    } catch (error) {
        console.error("Error parsing event:", error);
        return null;
    }
}

// **Test process**
async function testNostrMessaging() {
    // 1. Generate two key pairs
    const sender = generateKeyPair();
    const receiver = generateKeyPair();

    console.log("Sender Public Key:", sender.publicKey);
    console.log("Receiver Public Key:", receiver.publicKey);

    // 2. Encrypt message (using NIP-44)
    const message = "Hello, this is a secure NIP-44 message!";
    const encryptedMessage = await encryptMessage(sender.privateKey, receiver.publicKey, message);
    console.log("Encrypted Message:", encryptedMessage);

    // 3. Create event
    const event = await createEvent_nip44(sender.privateKey, sender.publicKey, receiver.publicKey, encryptedMessage);
    console.log("Created Event:", event);

    // 4. Send event to Nostr Relay
    await sendEvent(event);

    // 5. Decrypt message
    const decryptedMessage = await receiveAndDecrypt(JSON.stringify(event), receiver.privateKey);
    console.log("Decrypted Message:", decryptedMessage);
}

export { generateKeyPair, encryptMessage,decryptMessage, createEvent_nip44, sendEvent, receiveAndDecrypt, testNostrMessaging };
