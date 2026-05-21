import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function makeToken(userId: number, username: string): string {
  const payload = JSON.stringify({ userId, username, ts: Date.now() });
  return Buffer.from(payload).toString("base64");
}

router.post("/signup", async (req, res) => {
  const { username, displayName, password } = req.body ?? {};

  if (!username || !displayName || !password) {
    res.status(400).json({ error: "username, displayName, and password are required." });
    return;
  }
  if (username.length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters." });
    return;
  }
  if (displayName.trim().length < 1) {
    res.status(400).json({ error: "Display name cannot be empty." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken. Choose another." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        username: username.toLowerCase(),
        displayName: displayName.trim(),
        passwordHash,
      })
      .returning();

    res.status(201).json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      token: makeToken(user.id, user.username),
    });
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Something went wrong in the abyss." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required." });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      token: makeToken(user.id, user.username),
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Something went wrong in the abyss." });
  }
});

export default router;
