# Nostril.ai - Distributed Private AI using P2P Network

To provide cost-effective private AI against a large # of AI models, Nostril.ai combines:

- Users interact with an open Ethereum P2P Network to submit and query GPU nodes holding Private AI models, using an Ethereum wallet. All queries in the network are encrypted for security.
- NVIDIA Confidential Computing: GPU nodes operate within Trusted Execution Environments (TEEs). Before processing a query, a GPU node provides a cryptographic attestation to confirm it is running in a secure environment with the correct AI model. This attestation is verified by users, ensuring the node's integrity before accepting the computation results.
- Lightning and Ethereum-based smart contracts enable seamless, trustless payments for AI queries, ensuring transparency and security.

## Key Features

- **Verifiable AI Execution**: Users request a specific **LLM model** (e.g., `gpt-4`), and GPU nodes **must cryptographically prove** they ran the requested model.
- **Tamperproof Execution**: Queries and responses are securely transmitted via **HTTPS TLS**.
- **Decentralized Reputation System**: Users can **flag fraudulent nodes** and **approve trusted nodes**.
- **Private Payments**: Ethereum transactions are processed via smart contracts to ensure security.




## 1. User Requests Available GPU Nodes for a Model

The user requests a specific [model](https://red-pill.ai/model-list) which will generally map into a specific docker image hash.  Each model corresponds to a **Docker image** that represents a **confidential VM image** capable of secure execution inside a GPU node's enclave.   

This request is broadcast into the p2p network of GPU nodes.   

## 2. GPU Nodes Respond with Availability and Attest with a TEE proof

Only GPU nodes that can provide a valid TEE proof containing the docker image hash, where the image only loads the precise LLM.

This is the [Docker image](https://github.com/nearai/private-ml-sdk/tree/main?tab=readme-ov-file#run-the-tdx-guest-image)

## 3. User Submits Query via HTTPS to Secure TEE Enclave

Once a GPU node is selected, the user securely transmits the query via **HTTPS TLS** directly to the node's Trusted Execution Environment (TEE) with their client.

* [TLS setup related docs compatible with the GPU SDK](https://github.com/Dstack-TEE/dstack?tab=readme-ov-file#https-certificate-transparency) 
* [TEE-Controlled Domain Certificates](https://docs.phala.network/dstack/design-documents/tee-controlled-domain-certificates)

## 4. GPU Node Verifies & Processes Query, Sends Response & Attestation via HTTPS

The GPU node [signs chat completion](https://github.com/nearai/private-ml-sdk/blob/9b851dfa36dfa76ee07371106658179c420b9bb5/vllm-proxy/src/app/api/v1/openai.py#L127)  and returns them via **HTTPS** :

```
# Get signature for chat_id of chat history
@router.get("/signature/{chat_id}", dependencies=[Depends(verify_authorization_header)])
async def signature(request: Request, chat_id: str):
    if chat_id not in cache:
        return error("Chat id not found or expired", "chat_id_not_found")

    # Retrieve the cached request and response
    chat_data = cache[chat_id]
    signature = quote.sign(chat_data)
    return dict(
        text=chat_data,
        signature=signature,
    )
```

This signature could be embedded in 200 OK, using [pricing](https://red-pill.ai/pricing):

```binary
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
X-User-ID: 0xUserEthereumAddress
X-Query-Chain-ID: qchain-789123
X-Total-Tokens-Used: 15840
X-Cost-Per-Token: 0.0005 USDT
X-Outstanding-Balance: 7.92 USDT
X-Last-Signed-Query: sha256=ab12cd34ef56...
X-Server-Signature: sig=0xServerSignedBalanceProof
```

## 6. User Verifies Execution client 

The user can verify attestations -- [see this Video](https://youtu.be/N9Od_2Z1adc) by hashing the query + response to confirm authenticity.

## 7. GPU Settles Outstanding Balance 

The last signed response from the user with a specific balance is sufficient proof for the GPU node to collect payment on:
* Ethereum, with SP1 proofs of the TLS exchange
* Bitcoin Lightning Network


# Phala Cloud

Phala has [OP Succinct](https://blog.succinct.xyz/succinct-phala/) chain and has provided us with paid ssh access to 1 GPU out of 8 in a H200 to try out this [Private ML SDK](https://github.com/nearai/private-ml-sdk).  

```
root@s-gpu224-224:~# nvidia-detectornvidia-driver-550
```

`nvidia-smi` is supposed to work in the guest, because the host side doesn’t have driver

You can query all the GPUs using this command:
```
lspci -nn -d 10de:
```
Still on the host side, you can configure GPU using the admin tool:
```
gpu-admin-tools: git clone https://github.com/nvidia/gpu-admin-tools
```



