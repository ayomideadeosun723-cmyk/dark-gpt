import { Router } from "express";

const router = Router();

router.post("/verify", (req, res) => {
  const { key } = req.body as { key?: string };
  const correctKey = process.env.ACCESS_KEY ?? "LORDFYT123";

  if (!key || key.trim() !== correctKey) {
    res.status(401).json({ error: "Wrong access key. You are not welcome here." });
    return;
  }

  res.json({ success: true });
});

export default router;
