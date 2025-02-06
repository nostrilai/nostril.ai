package nostr

import (
	"fmt"
	"log"
	"testing"
)

func TestNIP_44(t *testing.T) {
	// Generate key pairs for sender and receiver
	senderPrivKey, senderPubKey := generateKeyPair()
	receiverPrivKey, receiverPubKey := generateKeyPair()
	fmt.Println("Sender Private Key:", senderPrivKey)
	fmt.Println("Sender Public Key:", senderPubKey)
	fmt.Println("Receiver Private Key:", receiverPrivKey)
	fmt.Println("Receiver Public Key:", receiverPubKey)

	// Encrypt message
	message := "Hello, this is an encrypted message!"
	encryptedMessage, err := encryptMessage(senderPrivKey, receiverPubKey, message)
	fmt.Printf("Encrypted message: %s\n", encryptedMessage)
	if err != nil {
		log.Fatal("Error encrypting message:", err)
	}
	// try to decrypt it
	_, err = decryptMessage(receiverPrivKey, senderPubKey, encryptedMessage)
	if err != nil {
		log.Fatal("Error decrypting message:", err)
	}
	// Create event
	event := createEvent(senderPrivKey, senderPubKey, receiverPubKey, encryptedMessage)
	valid, _ := event.CheckSignature()
	if !valid {
		log.Fatal("Event signature is invalid")
	}
	// Send event to relay
	go ListenToRelay(senderPubKey, receiverPrivKey, receiverPubKey)
	sendEvent(event)
	// Simulate receiving event and decrypting message
	select {}
}
