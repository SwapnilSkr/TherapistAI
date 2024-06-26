import * as line from "@line/bot-sdk";
import express from "express";
import dotenv from "dotenv";
import { aiResponse } from "./ai.js";
import { db } from "./db.js";
dotenv.config();

// create LINE SDK config from env variables
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // AI response
  const response = await aiResponse(event.message.text, event.source.userId);

  // create an echoing text message
  const echo = { type: "text", text: response?.choices?.[0].message?.content };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await db(process.env.MONGODB_URI);
  console.log(`listening on ${port}`);
});
