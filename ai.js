import Together from "together-ai";
import dotenv from "dotenv";
import { User } from "./model.js";
dotenv.config();

const together = new Together({
  apiKey: process.env["TOGETHER_API_KEY"], // This is the default and can be omitted
});

export const aiResponse = async (content, userId) => {
  console.log(content);
  let messages = [];
  let lineUser = await User.findOne({
    userId,
  });
  if (!lineUser) {
    messages.push({
      role: "user",
      content:
        "You are a Japanese therapist named TherapistAI who solves people's mental health issues with proper care and politeness. Greet using your name and always respond in japanese irrespective of the language in which the questions are being asked. Always use japanese to answer :\n" +
        content,
    });
    lineUser = new User({
      userId,
      messages,
    });
  } else {
    messages = lineUser.messages;
  }
  const response = await together.chat.completions.create({
    messages,
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  });
  lineUser.messages.push({
    role: "system",
    content: response?.choices?.[0].message?.content,
  });
  await lineUser.save();
  console.log(response);
  return response;
};
