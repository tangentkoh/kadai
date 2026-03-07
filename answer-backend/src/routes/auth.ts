import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { pool } from "../db/pool";
import * as bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// バリデーションスキーマ
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
app.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const { email, password, name } = c.req.valid("json");

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return c.json({ error: "メールアドレスが既に登録されています" }, 409);
    }

    // Hash password with bcrypt (saltRounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const result = await pool.query(
      "INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name, created_at",
      [email, hashedPassword, name],
    );

    const user = result.rows[0];

    // Generate JWT token
    const secret =
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    const token = await sign(
      {
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      secret,
    );

    return c.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// POST /api/auth/login
app.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid("json");

    // Find user by email
    const result = await pool.query(
      "SELECT id, email, password, name, created_at FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return c.json(
        { error: "メールアドレスまたはパスワードが間違っています" },
        401,
      );
    }

    const user = result.rows[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return c.json(
        { error: "メールアドレスまたはパスワードが間違っています" },
        401,
      );
    }

    // Generate JWT token
    const secret =
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    const token = await sign(
      {
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      secret,
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// GET /api/auth/me - Get current user
app.get("/me", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    const userId = payload.sub;

    const result = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return c.json({ error: "ユーザーが見つかりません" }, 404);
    }

    return c.json(result.rows[0]);
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default app;
