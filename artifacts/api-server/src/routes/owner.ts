import { Router } from "express";

const router = Router();

const ACCESS_KEY = process.env.ACCESS_KEY ?? "LORDFYT123";

let runtimeGroqKey: string | null = null;

function checkOwner(req: import("express").Request, res: import("express").Response): boolean {
  const key = (req.headers["x-owner-key"] as string) || req.body?.ownerKey;
  if (key !== ACCESS_KEY) {
    res.status(401).json({ error: "Not the owner. Get out." });
    return false;
  }
  return true;
}

router.post("/verify", (req, res) => {
  if (!checkOwner(req, res)) return;
  res.json({ success: true });
});

router.post("/set-groq-key", (req, res) => {
  if (!checkOwner(req, res)) return;
  const { groqKey } = req.body as { groqKey?: string };
  if (!groqKey || groqKey.trim().length === 0) {
    res.status(400).json({ error: "groqKey is required." });
    return;
  }
  runtimeGroqKey = groqKey.trim();
  res.json({ success: true, message: "Groq API key sealed in the abyss." });
});

router.get("/groq-key-status", (req, res) => {
  if (!checkOwner(req, res)) return;
  const key = runtimeGroqKey ?? process.env.GROQ_API_KEY ?? null;
  const hasKey = !!key && key.length > 0;
  res.json({ hasKey, preview: hasKey ? key!.slice(0, 8) + "••••••••" : null });
});

export function getGroqApiKey(): string | null {
  return runtimeGroqKey ?? process.env.GROQ_API_KEY ?? null;
}

export default router;
