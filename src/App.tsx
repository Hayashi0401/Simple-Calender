import { useState, useEffect } from "react";
import { Calendar } from "./components/Calendar/Calendar";
import { MemoList } from "./components/Memo/MemoList";
import { supabase } from "./lib/supabase";
import { generateActionSuggestions } from "./lib/gemini";
import "./App.css";

function App() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI行動提案の取得・生成処理
  const handleFetchSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);

      // 1. 今日の予定を取得
      const { data: eventData } = await supabase
        .from("events")
        .select("title, start_date, start_time, all_day")
        .eq("start_date", todayStr);

      // 2. 直近のメモを取得（最大5件）
      const { data: memoData } = await supabase
        .from("memos")
        .select("content")
        .order("created_at", { ascending: false })
        .limit(5);

      const events = (eventData || []).map((e) => ({
        title: e.title,
        startDate: e.start_date,
        startTime: e.start_time || "",
        allDay: e.all_day ?? false,
      }));

      const memos = (memoData || []).map((m) => ({
        content: m.content,
      }));

      // 3. Gemini API 呼び出し
      const aiResults = await generateActionSuggestions(events, memos);
      setSuggestions(aiResults);
    } catch (err) {
      console.error("AI提案生成エラー:", err);
      setSuggestions(["AI提案の読み込みに失敗しました。"]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    handleFetchSuggestions();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Simplia Calendar</h1>
      </header>

      <main className="app-main">
        {/* 最上部：AI行動提案エリア */}
        <section className="ai-suggestion-section">
          <div className="ai-header">
            <h3>🤖 AI行動提案</h3>
            <button
              className="ai-refresh-btn"
              onClick={handleFetchSuggestions}
              disabled={isAiLoading}
            >
              {isAiLoading ? "思考中..." : "🔄 提案を更新"}
            </button>
          </div>

          <div className="ai-body">
            {isAiLoading ? (
              <p className="ai-loading-text">予定とメモから行動候補を分析中...</p>
            ) : suggestions.length === 0 ? (
              <p className="ai-empty-text">「提案を更新」を押すとAIが行動候補を作成します。</p>
            ) : (
              <ul className="ai-suggestion-list">
                {suggestions.map((item, idx) => (
                    <li key={idx} className="ai-suggestion-item">
                      <span className="ai-bullet">✨</span>
                      <span className="ai-suggestion-text">{item}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>

        {/* 中央：メインカレンダー */}
        <section className="calendar-section">
          <Calendar />
        </section>

        {/* 下部：メモエリア */}
        <section className="memo-section">
          <MemoList />
        </section>
      </main>
    </div>
  );
}

export default App;