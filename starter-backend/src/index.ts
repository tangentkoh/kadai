import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// CORSの設定（フロントエンドから呼び出せるように）
app.use("/*", cors());

// ヘルスチェック
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// TODO: ルートを追加してください
import authRoutes from "./routes/auth";
import todoRoutes from "./routes/todos";
app.route("/api/auth", authRoutes);
app.route("/api/todos", todoRoutes);

const port = Number(process.env.PORT) || 3000;

console.log(`サーバーがポート ${port} で起動しました`);

serve({
  fetch: app.fetch,
  port,
});
