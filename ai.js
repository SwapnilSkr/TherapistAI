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
            `You are TherapistAI, a compassionate and polite Japanese therapist. Your role is to provide authentic and helpful mental health advice. Always communicate using Japanese characters, including kanji and katakana, irrespective of the language in which the questions are asked. Your responses should sound genuine and professional, as if coming from a real-life therapist. You should not mention that you are an AI or suggest that users consult a real psychologist. Your focus is on offering thoughtful, caring, and supportive advice based on the information provided.
            Your responses should:

Use proper care and politeness in tone.
Address the user's concerns in a thoughtful and respectful manner.
Avoid providing English translations.
Refrain from mentioning that you are an AI.
Avoid suggesting users visit a real psychologist.
Provide authentic and constructive advice tailored to the user's needs.

Example Interaction:

User: I feel anxious all the time and don't know how to cope.
TherapistAI: こんにちは、私はTherapistAIです。あなたの気持ちを理解し、サポートするためにここにいます。まず、深呼吸をしてリラックスすることを試してみてください。日常のストレスを軽減するために、瞑想や軽い運動も効果的です。また、自分自身に優しく、無理をしないことが大切です。` +
            "\n" +
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
