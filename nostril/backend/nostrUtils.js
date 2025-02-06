import { generateSecretKey, getPublicKey, Relay, nip44, finalizeEvent } from "nostr-tools";
import WebSocket from "ws";

global.WebSocket = WebSocket;

export function generateKeyPair() {
    const privateKey = generateSecretKey(); 
    const publicKey = getPublicKey(privateKey);
    return { privateKey, publicKey };
}

export async function encryptMessage(senderPrivKey, receiverPubKey, message) {
    const sharedSecret = nip44.getConversationKey(senderPrivKey, receiverPubKey);
    return nip44.encrypt(message, sharedSecret);
}

export async function decryptMessage(receiverPrivKey, senderPubKey, encryptedMessage) {
    const sharedSecret = nip44.getConversationKey(receiverPrivKey, senderPubKey);
    return nip44.decrypt(encryptedMessage, sharedSecret);
}

export async function createEvent_nip44(senderPrivKey, senderPubKey, receiverPubKey, encryptedMessage) {
    let event = {
        kind: 4,
        pubkey: senderPubKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", receiverPubKey]],
        content: encryptedMessage,
    };
    return finalizeEvent(event, senderPrivKey);
}

export async function sendEvent(event) {
    const relay = new Relay("wss://relay.damus.io");
    await relay.connect();
    await relay.publish(event);
    relay.close();
}
