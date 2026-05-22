import { Router } from "express";
import { db } from "@workspace/db";
import { settings } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const ACCESS_KEY = process.env.ACCESS_KEY ?? "LORDFYT123";

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

router.post("/set-groq-key", async (req, res) => {
  if (!checkOwner(req, res)) return;
  const { groqKey } = req.body as { groqKey?: string };
  if (!groqKey || groqKey.trim().length === 0) {
    res.status(400).json({ error: "groqKey is required." });
    return;
  }
  await db.insert(settings).values({ key: "groq_api_key", value: groqKey.trim() })
    .onConflictDoUpdate({ target: settings.key, set: { value: groqKey.trim(), updatedAt: new Date() } });
  res.json({ success: true, message: "Groq API key sealed in the abyss." });
});

router.get("/groq-key-status", async (req, res) => {
  if (!checkOwner(req, res)) return;
  const row = await db.select().from(settings).where(eq(settings.key, "groq_api_key"));
  const hasKey = row.length > 0 && row[0].value.length > 0;
  res.json({ hasKey, preview: hasKey ? row[0].value.slice(0, 8) + "••••••••" : null });
});

export async function getGroqApiKey(): Promise<string | null> {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  try {
    const row = await db.select().from(settings).where(eq(settings.key, "groq_api_key"));
    return row.length > 0 ? row[0].value : null;
  } catch {
    return null;
  }
}

export default router;
