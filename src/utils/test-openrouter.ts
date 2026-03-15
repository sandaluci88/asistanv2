import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  console.log("Key length:", apiKey?.length);
  console.log("Key starts with:", apiKey?.substring(0, 10));

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });

  try {
    const response = await client.chat.completions.create({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: "Hi" }],
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error status:", error.status);
    console.error("Error message:", error.message);
    if (error.response) {
       console.error("Error body:", error.response.data);
    }
  }
}

test();
