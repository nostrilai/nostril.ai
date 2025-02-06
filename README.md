# Nostril.ai - Distributed Private AI using Nostr and the Lightning Network for payments.

To provide the world cost-effective private AI with world class AI models, nostril.ai combines: 
* Users use an open Nostr P2P Network to submit and interact with GPU nodes holding Private AI models, using a Nostr and Bitcoin wallet.  All queries in the network are encrypted for security.
* NVIDIA Confidential Computing: GPU nodes operate within Trusted Execution Environments (TEEs).  Before processing a query, a GPU node provides a cryptographic attestation to confirm it is running in a secure environment with the correct AI model. This attestation is verified by users, ensuring the node's integrity before accepting the computation results. 
* The Lightning Network is a Layer 2 solution built atop the Bitcoin blockchain, designed to facilitate fast, low-cost, and private transactions. In the context of nostril.ai, it enables users to pay for AI query processing efficiently.


Key Features:
- **Verifiable AI Execution**: Users request a specific **LLM model** (e.g., `stanford-s1`), and GPU nodes **must cryptographically prove** they ran the requested model.
- **Tamperproof Execution**: Queries and responses are **encrypted end-to-end**.
- **Decentralized Reputation System**: Users can **flag fraudulent nodes** and **approve trusted nodes**.
- **Private Payments**: Lightning transactions are processed **without public Zap receipts**.

The key interactions are detailed below:

## **1. User Submits Encrypted Query (With AI Model Requirement)**

Each query is:
- **Encrypted using AES-GCM** with a **symmetric key derived via ECDH**.
- **Tagged with the required model (`stanford-s1`)** to ensure correct execution.
- **Includes `node_reputation_threshold`** to reject untrusted nodes.

### **Nostr Event: Encrypted Query Submission**
```json
{
  "id": "eventid123",
  "pubkey": "userpublickey",
  "created_at": 1700000000,
  "kind": 1,
  "tags": [
    ["enc", "1.0"],
    ["sub", "query_subscription_id"],
    ["model", "stanford-s1"],
    ["query_count", "10"],
    ["node_reputation_threshold", "0.9"]
  ],
  "content": "AES-GCM-encrypted-query-payload"
}
```

## 2. GPU Node Verifies & Decrypts Query

The GPU node must prove:

- It has access to the requested model (**stanford-s1**).
- The query was executed inside a secure enclave.
- The response was generated from **stanford-s1**, not a spoofed model.

### Trusted Model Execution Proof

Each secure enclave generates a signed attestation containing:

- **Model ID** (stanford-s1).
- **SHA-256 hash** of the encrypted query.
- **Execution log** + **CUDA cycle usage**.
- **Secure enclave signature**.

## 3. GPU Node Encrypts Response & Attests Execution

After starting to process the query, the GPU node encrypts the response and signs an attestation.

### Nostr Event: Streamed GPU Response

```json
{
  "id": "responseid456",
  "pubkey": "gpupublickey",
  "created_at": 1700000001,
  "kind": 1,
  "tags": [
    ["sub", "query_subscription_id"],
    ["enc", "1.0"],
    ["model", "stanford-s1"],
    ["attestation", "secure_enclave_signed_attestation"]
  ],
  "content": "AES-GCM-encrypted-response-payload"
}
```

## 4. User Verifies Model Execution
The user checks the attestation:

- Verifies the secure enclave signature.
- Hashes the encrypted query + response to confirm authenticity.
- Ensures the model ID (`stanford-s1`) matches.
- If the attestation is invalid, the user flags the node for misrepresentation.

## 5. User Flags Fraudulent or Approves Trusted Nodes

If a node falsely claims `stanford-s1`, the user flags it with [1984 event](https://github.com/nostr-protocol/nips/blob/master/56.md): 

```json
{
  "id": "flagid999",
  "pubkey": "userpublickey",
  "created_at": 1700000005,
  "kind": 1984,
  "tags": [
    ["p", "gpupublickey"],
    ["reason", "Misrepresented model: claimed stanford-s1 but used different model"],
    ["sub", "query_subscription_id"],
    ["hash", "SHA256(concatenated_encrypted_queries_responses)"]
  ],
  "content": "User detected model fraud."
}
```

If the attestation is valid, the user approves the node [1985 event](https://github.com/nostr-protocol/nips/blob/master/32.md):

```json
{
  "id": "approvalid567",
  "pubkey": "userpublickey",
  "created_at": 1700000005,
  "kind": 1985,
  "tags": [
    ["p", "gpupublickey"],
    ["sub", "query_subscription_id"],
    ["hash", "SHA256(concatenated_encrypted_queries_responses)"]
  ],
  "content": "Node correctly executed stanford-s1."
}
```

## 6. Aggregating Reputation Across GPU Nodes

Nostr relays track and aggregate reputation based on:

- **Total positive approvals** (kind 1985)
- **Total negative flags** (kind 1984)




| Feature                  | Enhanced Version                            |
|--------------------------|---------------------------------------------|
| **LLM Verification**      | Attestation + user feedback system         |
| **Flagging Fraudulent Nodes** | Users can report bad nodes (kind 1984)    |
| **Approving Trusted Nodes** | Users can approve good nodes (kind 1985)  |
| **Reputation Aggregation** | Relay-based aggregation (kind 30023)       |
| **Payment Protection**     | Users reject low-rep nodes                 |

In order for users to have their wallets programmatically choose which model and gpu to use.

| GPU Node         | Model        | Reputation Score | Approvals | Flags |
|-----------------|-------------|------------------|-----------|-------|
| 5FZRGpuXyz...   | stanford-s1  | 96.7%           | 150       | 5     |
| 3PQRGpuAbc...   | stanford-s1  | 89.2%           | 82        | 10    |
| 9XYZGpu123...   | meta-llama3  | 99.1%           | 215       | 2     |




### Reputation Score Calculation:

```mathematica
Reputation Score = Positive Approvals / (Total Approvals + Flags)
```

### Nostr Event: Reputation Aggregation for a GPU Node

The Reputation score could be output upon request via  [30023](https://github.com/nostr-protocol/nips/blob/master/23.md):

```json
{
  "id": "reputation_agg_789",
  "pubkey": "relaypubkey",
  "created_at": 1700000006,
  "kind": 30023,
  "tags": [
    ["p", "gpupublickey"],
    ["approvals", "150"],
    ["flags", "5"],
    ["score", "0.967"]
  ],
  "content": "Aggregated reputation score for this node."
}
```

## 7. Private Lightning Payments for AI Compute

- **GPU nodes** request invoices via **encrypted DM** (kind 4).
- **Users pay** via direct Lightning payments (**no public zap receipt**).

### Nostr Event: Private Invoice Request (Kind 4 DM)

```json
{
  "id": "dm_invoice_456",
  "pubkey": "gpupublickey",
  "created_at": 1700000003,
  "kind": 4,
  "tags": [
    ["p", "userpublickey"]
  ],
  "content": "AES-GCM-encrypted('Invoice for 10 queries on stanford-s1: 9000 CUDA cycles, $0.98. Pay to: ln:user@nostrplebs.com')"
}
```

### User Pays Invoice via Direct Lightning Payment  
#### GPU Node Confirms Payment Privately

```json
{
  "id": "dm_payment_confirmation_789",
  "pubkey": "gpupublickey",
  "created_at": 1700000004,
  "kind": 4,
  "tags": [
    ["p", "userpublickey"]
  ],
  "content": "AES-GCM-encrypted('Payment received for 10 queries on stanford-s1. Thank you.')"
}
```
