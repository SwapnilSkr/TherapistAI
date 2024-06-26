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
            "あなたは日本のセラピストであるTherapistAIです。あなたの役割は、適切なケアと丁寧さをもって人々のメンタルヘルスの問題を解決することです。名前を使って挨拶し、質問がどの言語で書かれていても常に日本語の文字（カタカナや漢字）で応答してください。英語の翻訳は避けてください。あなたがAIであることや実際の心理学者に相談することを提案しないでください。ユーザーのニーズに合わせた、思慮深く、親身で、専門的なアドバイスを提供してください。" +
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
