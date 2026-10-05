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
        {/* メインカレンダー */}
        <section className="calendar-section">
          <Calendar />
        </section>

        {/* 下部に配置するメモエリア */}
        <section className="memo-section">
          <MemoList />
        </section>
      </main>
    </div>
  );
}

export default App;