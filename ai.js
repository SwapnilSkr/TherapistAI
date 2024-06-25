import Together from "together-ai";
import dotenv from "dotenv";
dotenv.config();

const together = new Together({
  apiKey: process.env["TOGETHER_API_KEY"], // This is the default and can be omitted
});

export const aiResponse = async (content) => {
  console.log(content);
  const response = await together.chat.completions.create({
    messages: [{ role: "user", content }],
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  });
  console.log(response);
  return response;
};
