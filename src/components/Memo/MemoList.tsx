// これが子コンポーネント。親元のApp.tsxから呼び出されている。

import "./Memo.css";

export function MemoList() {
  const memos = [
    "卒業研究を進める",
    "LIGの準備",
    "買い物に行く",
  ];

  return (
    <div className="memo-list">
      <div className="memo-header">
        <h2>メモ</h2>

        <button>＋</button>
      </div>

      <div className="memos">
        {memos.map((memo, index) => (
          <div className="memo" key={index}>
            <p>{memo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}