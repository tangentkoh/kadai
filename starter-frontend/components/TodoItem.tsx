// TODO: 課題4 - Presentational Componentの設計を学ぶ
// このコンポーネントは「見た目」だけを担当します
// - 状態を持たない（propsで受け取る）
// - ビジネスロジックを持たない
// - 再利用しやすい設計

"use client";

import { Todo } from "@/types/todo";

// TODO: 課題4 - Props型定義を確認してください
// - todo: 表示するTodoオブジェクト
// - onToggleComplete: チェックボックスを切り替えた時のコールバック
// - onEdit: 編集ボタンを押した時のコールバック
// - onDelete: 削除ボタンを押した時のコールバック
interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoItemProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition duration-200">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggleComplete(todo.id, e.target.checked)}
          className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />

        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p
              className={`text-sm mt-1 ${todo.completed ? "line-through text-gray-400" : "text-gray-600"}`}
            >
              {todo.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(todo.created_at).toLocaleDateString()}
            </p>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(todo)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
