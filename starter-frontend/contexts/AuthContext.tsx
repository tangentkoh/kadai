"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types/user";
import { API_BASE_URL } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: 課題3 - アプリ起動時にトークンを検証する
  // ヒント:
  // 1. localStorageからトークンを取得
  // 2. トークンがあれば /auth/me を呼び出してユーザー情報を取得
  // 3. トークンが無効ならlocalStorageから削除
  // 4. 最後に setIsLoading(false)
  useEffect(() => {
    // ここに実装してください
    setIsLoading(false);
  }, []);

  // TODO: 課題3 - login関数を実装してください
  // ヒント:
  // 1. localStorageにトークンを保存
  // 2. setToken(token)
  // 3. /auth/me を呼び出してユーザー情報を取得
  // 4. setUser(userData)
  const login = async (token: string) => {
    // ここに実装してください
    console.log("login not implemented");
  };

  // TODO: 課題3 - logout関数を実装してください
  // ヒント:
  // 1. localStorageからトークンを削除
  // 2. setUser(null)
  // 3. setToken(null)
  const logout = () => {
    // ここに実装してください
    console.log("logout not implemented");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
