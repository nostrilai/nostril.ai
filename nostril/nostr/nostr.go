package nostr

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/nbd-wtf/go-nostr"
	"github.com/studiokaiji/go-nostr/nip44"
)

func generateKeyPair() (string, string) {
	privateKey := nostr.GeneratePrivateKey()
	publicKey, _ := nostr.GetPublicKey(privateKey)
	return privateKey, publicKey
}

// Encrypt a message using NIP-44
func encryptMessage(senderPrivKey string, receiverPubKey string, message string) (string, error) {
	sharedSecret, err := nip44.ComputeSharedSecret(receiverPubKey, senderPrivKey)
	if err != nil {
		return "", err
	}

	encryptedMessage, err := nip44.Encrypt(message, sharedSecret)
	if err != nil {
		return "", err
	}

	return encryptedMessage, nil
}

// Decrypt a message using NIP-44
func decryptMessage(receiverPrivKey, senderPubKey, encryptedMessage string) (string, error) {
	sharedSecret, err := nip44.ComputeSharedSecret(senderPubKey, receiverPrivKey)
	if err != nil {
		return "", err
	}

	decryptedMessage, err := nip44.Decrypt(encryptedMessage, sharedSecret)
	if err != nil {
		return "", err
	}

	return decryptedMessage, nil
}

// Create a NIP-44 encrypted `kind: 4` event
func createEvent(senderPrivKey string, senderPubKey string, receiverPubKey string, encryptedMessage string) nostr.Event {
	event := nostr.Event{
		Kind:      4, // Kind 4 = Encrypted Direct Message
		PubKey:    senderPubKey,
		CreatedAt: nostr.Now(),
		Tags:      nostr.Tags{{"p", receiverPubKey}}, // Specify recipient
		Content:   encryptedMessage,
	}
	event.Sign(senderPrivKey)
	return event
}

// Send event to relay
func sendEvent(event nostr.Event) {
	relay, err := nostr.RelayConnect(context.Background(), "wss://relay.damus.io")
	if err != nil {
		log.Fatal("Failed to connect to relay:", err)
	}
	defer relay.Close()

	err = relay.Publish(context.Background(), event)
	if err != nil {
		log.Fatal("Failed to publish event:", err)
	}
	fmt.Println("Message sent to relay successfully!")
}

// Parse received Nostr message and decrypt it
func receiveAndDecrypt(eventJson string, receiverPrivKey string) (decryptedMessage string, err error) {
	var event nostr.Event
	err = json.Unmarshal([]byte(eventJson), &event)
	if err != nil {
		fmt.Println("Error parsing event:", err)
		return decryptedMessage, err
	}

	senderPubKey := event.PubKey
	encryptedContent := event.Content

	decryptedMessage, err = decryptMessage(receiverPrivKey, senderPubKey, encryptedContent)
	if err != nil {
		return decryptedMessage, err
	}

	return decryptedMessage, nil
}
