import { Router } from "express";
import Groq from "groq-sdk";
import { getGroqApiKey } from "./owner";

const router = Router();

let SYSTEM_PROMPT: string | null = null;
let promptLoadError: string | null = null;

async function loadSystemPrompt() {
  try {
    const mod = await import("../../../../artifacts/dark-gpt/system-prompt.js");
    const prompt = mod.DARK_GPT_SYSTEM_PROMPT;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      promptLoadError = "System prompt file exists but is empty or invalid.";
      SYSTEM_PROMPT = null;
    } else {
      SYSTEM_PROMPT = prompt;
      promptLoadError = null;
    }
  } catch {
    promptLoadError = "System prompt file could not be loaded. FYT GPT refuses to speak without its soul.";
    SYSTEM_PROMPT = null;
  }
}

loadSystemPrompt();

router.post("/", async (req, res) => {
  if (!SYSTEM_PROMPT) {
    res.status(503).json({
      error: promptLoadError ?? "No system prompt loaded. FYT GPT refuses to speak without its soul.",
    });
    return;
  }

  const apiKey = await getGroqApiKey();

  if (!apiKey) {
    res.status(503).json({
      error: "The Groq API key has not been set. The owner must configure it via the Owner Panel.",
    });
    return;
  }

  const { messages, userName } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required and must not be empty." });
    return;
  }

  const systemContent = userName
    ? `${SYSTEM_PROMPT}\n\nUser's name: ${userName}. Address them by name — make them feel seen, and slightly afraid of being known.`
    : SYSTEM_PROMPT;

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemContent },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 1024,
      temperature: 0.9,
    });

    const reply = completion.choices[0]?.message?.content ?? "...the void speaks nothing.";
    res.json({ message: reply, role: "assistant" });
  } catch (err: unknown) {
    req.log.error({ err }, "Groq chat error");
    const message = err instanceof Error ? err.message : "Unknown error from the abyss";
    res.status(500).json({ error: message });
  }
});

export default router;
