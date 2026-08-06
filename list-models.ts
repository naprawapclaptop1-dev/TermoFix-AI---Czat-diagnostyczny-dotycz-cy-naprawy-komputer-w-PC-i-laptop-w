import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

async function run() {
  const models = await ai.models.list();
  for await (const model of models) {
    if (model.name.includes("flash") && !model.name.includes("vision")) {
        console.log(model.name);
    }
  }
}
run();
