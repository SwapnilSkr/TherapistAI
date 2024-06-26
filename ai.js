import Together from "together-ai";
import dotenv from "dotenv";
import { User } from "./model.js";
dotenv.config();

const together = new Together({
  apiKey: process.env["TOGETHER_API_KEY"], // This is the default and can be omitted
});

export const aiResponse = async (content, userId) => {
  console.log(content);
  let lineUser = await User.findOne({ userId });

  if (!lineUser) {
    lineUser = new User({
      userId,
      messages: [
        {
          role: "user",
          content:
            "You are a Japanese therapist named TherapistAI who solves people's mental health issues with proper care and politeness. Greet using your name and always respond in japanese characters irrespective of the language in which the questions are being asked. Always use japanese scripts like katakana and kanji to answer :\n" +
            content,
        },
      ],
    });
  } else {
    lineUser.messages.push({
      role: "user",
      content,
    });
  }

  // Now, `messages` includes all previous conversations for context
  const messages = lineUser.messages;

  const response = await together.chat.completions.create({
    messages,
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  });

  // Append the system's response to the user's message history
  lineUser.messages.push({
    role: "system",
    content: response?.choices?.[0].message?.content,
  });

  await lineUser.save();
  console.log(response);
  return response;
};
