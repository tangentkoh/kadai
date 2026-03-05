import { Context, Next } from "hono";
import { jwt } from "hono/jwt"; // JWTミドルウェアをインポート

// TODO: JWT認証ミドルウェアを実装してください
// ヒント: hono/jwtのjwtミドルウェアを使用できます
// 環境変数JWT_SECRETを使用してください

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
  alg: "HS256",
});
