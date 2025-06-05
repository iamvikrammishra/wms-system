// server/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// 1) Load .env (OPENAI_API_KEY)
dotenv.config();

// 2) Confirm the key exists
if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: Missing OPENAI_API_KEY in environment");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors()); // allow requests from any origin (or restrict to 'http://localhost:5173')
app.use(express.json({ limit: "5mb" })); // parse JSON bodies up to 5MB (CSV text might be large)

// POST /api/ai-query
app.post("/api/ai-query", async (req, res) => {
  try {
    const { question, csvText } = req.body;

    if (!question || !csvText) {
      return res.status(400).json({ error: "Missing `question` or `csvText` in request body." });
    }

    // 3) Compose a prompt that includes the CSV data and the user’s question.
    //    For very large CSVs, you might trim or summarize, but for MVP we pass raw text.
    const prompt = `
You are a warehouse analytics assistant. You have access to the following CSV data (headers on first line, comma-separated). Use this data to answer the user’s question. Do not hallucinate—base your answer strictly on the data below.

CSV DATA:
${csvText}

QUESTION:
${question}
`;

    // 4) Call OpenAI’s chat completion endpoint (GPT-4o-mini or GPT-3.5-turbo)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0, // deterministic responses
    });

    // 5) Extract the assistant’s reply
    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error("Error in /api/ai-query:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server on port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 AI backend listening on http://localhost:${PORT}`);
});
