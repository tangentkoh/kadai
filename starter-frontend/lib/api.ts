// API utility functions

// TODO: 課題1 - fetchWithAuth関数を実装してください
// ヒント:
// 1. localStorageからトークンを取得
// 2. Authorizationヘッダーに Bearer トークンを設定
// 3. fetch()でAPIを呼び出し
// 4. レスポンスのエラーチェック
// 5. JSONをパースして返す

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

export { API_BASE_URL };
