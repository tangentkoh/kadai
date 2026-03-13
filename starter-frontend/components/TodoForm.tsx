// TODO: 課題4 - 再利用可能なコンポーネントの設計を学ぶ
// このコンポーネントは「作成」と「編集」の両方で使われます
// - todo propsがあれば編集モード
// - todo propsがなければ作成モード
// これがコンポーネントの再利用性です！

"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types/todo";

// TODO: 課題4 - Props設計を確認してください
// - todo?: 編集時のみ渡される（オプショナル）
// - onSubmit: フォーム送信時のコールバック
// - onCancel: キャンセル時のコールバック
interface TodoFormProps {
  todo?: Todo;
  onSubmit: (title: string, description: string, completed: boolean) => void;
  onCancel: () => void;
}

export default function TodoForm({ todo, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);

  // TODO: 課題4 - useEffectで初期値を設定
  // todoが変わったら、フォームの値を更新する
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || "");
      setCompleted(todo.completed);
    } else {
      // 追加: 新規作成モード時のリセット
      setTitle("");
      setDescription("");
      setCompleted(false);
    }
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, description, completed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
          placeholder="Enter todo title"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
          placeholder="Enter todo description (optional)"
        />
      </div>

      {todo && (
        <div className="flex items-center gap-2">
          <input
            id="completed"
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label
            htmlFor="completed"
            className="text-sm font-medium text-gray-700"
          >
            Mark as completed
          </label>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {todo ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
