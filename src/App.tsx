// これが親元。ここから子コンポーネントのCalendarとMemoListを呼び出している。

import { Calendar } from "./components/Calendar/Calendar";
import { MemoList } from "./components/Memo/MemoList";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Simplia Calendar</h1>
      </header>

      <main className="app-main">
        <section className="calendar-section">
          <Calendar />
        </section>

        <aside className="memo-section">
          <MemoList />
        </aside>
      </main>
    </div>
  );
}

export default App;