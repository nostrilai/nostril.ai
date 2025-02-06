import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { encryptMessage, decryptMessage, createEvent_nip44, sendEvent, generateKeyPair } from "./nostrUtils.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const bot = generateKeyPair();

app.post("/send-message", async (req, res) => {
    const { userPrivKey, userPubKey, message } = req.body;
    const encryptedMessage = await encryptMessage(userPrivKey, bot.publicKey, message);
    const event = await createEvent_nip44(userPrivKey, userPubKey, bot.publicKey, encryptedMessage);
    await sendEvent(event);

    const botReply = `Echo: ${message}`;
    const encryptedBotReply = await encryptMessage(bot.privateKey, userPubKey, botReply);
    const botEvent = await createEvent_nip44(bot.privateKey, bot.publicKey, userPubKey, encryptedBotReply);
    await sendEvent(botEvent);

    res.json({ success: true, encryptedBotReply });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
