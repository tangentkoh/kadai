import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { pool } from "../db/pool";
import * as bcrypt from "bcrypt";
import { sign } from "hono/jwt";

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
  // TODO: ユーザー登録処理を実装してください
  // 1. リクエストボディから email, password, name を取得
  try {
    const { email, password, name } = c.req.valid("json");
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    // 注意: メールアドレスが既に存在する場合は409エラーを返す

    if (existingUser.rows.length > 0) {
      return c.json({ error: "メールアドレスが既に登録されています" }, 409);
    }
    // 2. bcryptでパスワードをハッシュ化（saltRounds: 10）
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3. データベースにユーザーを保存
    const result = await pool.query(
      "INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name, created_at",
      [email, hashedPassword, name],
    );
    const user = result.rows[0];
    // 4. JWTトークンを生成
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
    // 5. ユーザー情報とトークンを返す
    return c.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
        token,
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
  // TODO: ログイン処理を実装してください
  // 1. リクエストボディから email, password を取得
  try {
    const { email, password } = c.req.valid("json");
    // 2. メールアドレスでユーザーを検索
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
    // 3. bcryptでパスワードを検証
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return c.json(
        { error: "メールアドレスまたはパスワードが間違っています" },
        401,
      );
    }
    // 4. JWTトークンを生成
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
    // 5. ユーザー情報とトークンを返す
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
      token,
    });
    // 注意: 認証失敗時は401エラーを返す
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "ログインエラーが発生しました" }, 401);
  }
});

export default app;
