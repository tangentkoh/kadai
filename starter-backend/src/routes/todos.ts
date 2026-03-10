import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { pool } from "../db/pool";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// すべてのルートに認証を適用
app.use("/*", authMiddleware);

// バリデーションスキーマ
const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

// GET /api/todos - ToDo一覧取得
app.get("/", async (c) => {
  // TODO: ログインユーザーのToDo一覧を取得
  // 1. JWTペイロードからユーザーIDを取得（c.get('jwtPayload')）
  try {
    const payload = c.get("jwtPayload");
    const userId = payload.sub;
    // 2. データベースから該当ユーザーのToDoを全件取得
    const result = await pool.query(
      "SELECT id, user_id, title, description, completed, created_at, updated_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    // 3. 結果を返す
    return c.json(result.rows);
  } catch (error) {
    console.error("Get todos error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// GET /api/todos/:id - ToDo詳細取得
app.get("/:id", async (c) => {
  // TODO: 指定されたIDのToDoを取得
  // 1. パスパラメータからIDを取得
  try {
    const id = parseInt(c.req.param("id"));
    // 2. JWTペイロードからユーザーIDを取得
    const payload = c.get("jwtPayload");
    const userId = payload.sub;
    // 3. データベースから該当のToDoを取得
    const result = await pool.query(
      "SELECT id, user_id, title, description, completed, created_at, updated_at FROM todos WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    // 4. ユーザー自身のToDoかチェック
    if (result.rows.length === 0) {
      return c.json({ error: "ToDoが見つかりません" }, 404);
    }
    // 5. 結果を返す
    return c.json(result.rows[0]);
    // 注意: ToDoが存在しないまたは他人のToDoの場合は404を返す
  } catch (error) {
    console.error("Get todos error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// POST /api/todos - ToDo作成
app.post("/", zValidator("json", createTodoSchema), async (c) => {
  // TODO: ToDoを新規作成
  try {
    // 1. リクエストボディから title, description を取得
    const { title, description } = c.req.valid("json");
    // 2. JWTペイロードからユーザーIDを取得
    const payload = c.get("jwtPayload");
    const userId = payload.sub;
    // 3. データベースに新しいToDoを保存
    const result = await pool.query(
      "INSERT INTO todos (user_id, title, description, completed, created_at, updated_at) VALUES ($1, $2, $3, false, NOW(), NOW()) RETURNING id, user_id, title, description, completed, created_at, updated_at",
      [userId, title, description || null],
    );
    // 4. 作成されたToDoを返す（ステータス201）
    return c.json(result.rows[0], 201);
  } catch (error) {
    console.error("Create todos error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// PUT /api/todos/:id - ToDo更新
app.put("/:id", zValidator("json", updateTodoSchema), async (c) => {
  // TODO: ToDoを更新
  try {
    // 1. パスパラメータからIDを取得
    const id = parseInt(c.req.param("id"));
    // 2. リクエストボディから更新データを取得
    const updateData = c.req.valid("json");
    // 3. JWTペイロードからユーザーIDを取得
    const payload = c.get("jwtPayload");
    const userId = payload.sub;
    // 4. データベースの該当ToDoを更新
    // 5. ユーザー自身のToDoかチェック
    const checkResult = await pool.query(
      "SELECT id FROM todos WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    if (checkResult.rows.length === 0) {
      return c.json({ error: "ToDoが見つかりません" }, 404);
    }
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    if (updateData.title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(updateData.title);
      paramCount++;
    }
    if (updateData.description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(updateData.description);
      paramCount++;
    }
    if (updateData.completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(updateData.completed);
      paramCount++;
    }
    updates.push(`updated_at = NOW()`);
    values.push(id, userId);
    const result = await pool.query(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING id, user_id, title, description, completed, created_at, updated_at`,
      values,
    );
    // 6. 更新されたToDoを返す
    return c.json(result.rows[0]);
    // 注意: ToDoが存在しないまたは他人のToDoの場合は404を返す
  } catch (error) {
    console.error("Update todos error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// DELETE /api/todos/:id - ToDo削除
app.delete("/:id", async (c) => {
  // TODO: ToDoを削除
  try {
    // 1. パスパラメータからIDを取得
    const id = parseInt(c.req.param("id"));
    // 2. JWTペイロードからユーザーIDを取得
    const payload = c.get("jwtPayload");
    const userId = payload.sub;
    // 3. データベースから該当のToDoを削除
    // 4. ユーザー自身のToDoかチェック
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    if (result.rows.length === 0) {
      return c.json({ error: "ToDoが見つかりません" }, 404);
    }
    // 5. ステータス204を返す
    return c.body(null, 204);
    // 注意: ToDoが存在しないまたは他人のToDoの場合は404を返す
  } catch (error) {
    console.error("Delete todo error:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default app;
