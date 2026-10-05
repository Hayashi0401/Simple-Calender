import { useState } from "react";
import "./Memo.css";

export function MemoList() {
  const [memos, setMemos] = useState([
    "卒業研究を進める",
    "LIGの準備",
    "買い物に行く",
  ]);
  const [input, setInput] = useState("");

  const handleAddMemo = () => {
    if (!input.trim()) return;
    setMemos([input.trim(), ...memos]); // 新しいメモを上に追加
    setInput("");
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

      {/* スクロールエリア */}
      <div className="memos-scroll-area">
        {memos.map((memo, index) => (
          <div className="memo-item" key={index}>
            <p>{memo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}