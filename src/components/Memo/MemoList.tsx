import { useState } from "react";
import "./Memo.css";

type Memo = {
  id: string;
  text: string;
};

export function MemoList() {
  const [memos, setMemos] = useState<Memo[]>([
    { id: "1", text: "卒業研究を進める" },
    { id: "2", text: "LIGの準備" },
    { id: "3", text: "買い物に行く" },
  ]);
  const [input, setInput] = useState("");

  // 編集用のステート
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // メモ追加
  const handleAddMemo = () => {
    if (!input.trim()) return;
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      text: input.trim(),
    };
    setMemos([newMemo, ...memos]);
    setInput("");
  };

  // メモ編集開始
  const handleStartEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditText(memo.text);
  };

  // メモ保存
  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: editText.trim() } : m))
    );
    setEditingId(null);
  };

  // メモ削除
  const handleDeleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="memo-list-container">
      <div className="memo-header">
        <h2>メモ</h2>
      </div>

      <div className="memo-input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいメモを入力..."
          onKeyDown={(e) => e.key === "Enter" && handleAddMemo()}
        />
        <button onClick={handleAddMemo}>追加</button>
      </div>

      {/* メモ一覧（スクロール対応） */}
      <div className="memos-scroll-area">
        {memos.map((memo) => (
          <div className="memo-item" key={memo.id}>
            {editingId === memo.id ? (
              <div className="memo-edit-row">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(memo.id)}
                  autoFocus
                />
                <button
                  className="memo-btn save-btn"
                  onClick={() => handleSaveEdit(memo.id)}
                >
                  保存
                </button>
                <button
                  className="memo-btn cancel-btn"
                  onClick={() => setEditingId(null)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="memo-view-row">
                <p>{memo.text}</p>
                <div className="memo-actions">
                  <button
                    className="memo-action-btn"
                    onClick={() => handleStartEdit(memo)}
                  >
                    編集
                  </button>
                  <button
                    className="memo-action-btn delete"
                    onClick={() => handleDeleteMemo(memo.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}