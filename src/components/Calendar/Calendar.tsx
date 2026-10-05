// これが子コンポーネント。親元のApp.tsxから呼び出されている。

import "./Calendar.css";

export function Calendar() {
  return (
    <div className="calendar">
      <div className="calendar-header">
        <button>←</button>

        <h2>2026年10月</h2>

        <button>→</button>
      </div>

      <div className="calendar-week">
        <span>日</span>
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span>土</span>
      </div>

      <div className="calendar-days">
        {Array.from({ length: 31 }, (_, index) => (
          <button key={index}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}