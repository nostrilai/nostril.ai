package nostr

import (
	"context"
	"fmt"
	"log"

	"github.com/nbd-wtf/go-nostr"
)

func ListenToRelay(senderPubKey, receiverPrivKey, receiverPubKey string) {
	// Connect to a Nostr relay
	relay, err := nostr.RelayConnect(context.Background(), "wss://relay.damus.io")
	if err != nil {
		log.Fatal("Failed to connect to relay:", err)
	}
	defer relay.Close()

	// Subscribe to direct messages (kind: 4) addressed to the receiver
	filters := nostr.Filters{
		{
			Kinds: []int{4},                                    // Kind 4 = Encrypted Direct Message
			Tags:  nostr.TagMap{"p": []string{receiverPubKey}}, // Messages sent to this pubkey
		},
	}
	sub, err := relay.Subscribe(context.Background(), filters)
	if err != nil {
		log.Fatal("Failed to subscribe to relay:", err)
	}
	// Listen for incoming messages
	for event := range sub.Events {
		fmt.Println("Received Encrypted Event:", event.Content)
		receivedEventJson, _ := event.MarshalJSON()
		decryptMessage, err := receiveAndDecrypt(string(receivedEventJson), receiverPrivKey)
		if err != nil {
			log.Fatal("Error decrypting message:", err)
		}
		fmt.Println("Decrypted message:", decryptMessage)
	}
}
