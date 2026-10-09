import { useState, useEffect } from "react";
import "./Memo.css";
import { supabase } from "../../lib/supabase";

type Memo = {
  id: string;
  content: string;
  eventId: string | null;
  createdAt: string;
};

type EventOption = {
  id: string;
  title: string;
  startDate: string;
};

export function MemoList() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [input, setInput] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // 編集用のステート
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editEventId, setEditEventId] = useState<string>("");

  // Supabaseからメモ一覧と予定一覧を取得
  const fetchMemosAndEvents = async () => {
    setIsLoading(true);
    try {
      // 1. メモの取得
      const { data: memoData, error: memoError } = await supabase
        .from("memos")
        .select("*")
        .order("created_at", { ascending: false });

      if (memoError) {
        console.error("メモの取得に失敗しました:", memoError.message);
      } else if (memoData) {
        const formattedMemos: Memo[] = memoData.map((m) => ({
          id: m.id,
          content: m.content,
          eventId: m.event_id || null,
          createdAt: m.created_at,
        }));
        setMemos(formattedMemos);
      }

      // 2. 予定の取得（関連付け用ドロップダウン選択肢）
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, title, start_date")
        .order("start_date", { ascending: true });

      if (eventError) {
        console.error("予定一覧の取得に失敗しました:", eventError.message);
      } else if (eventData) {
        setEvents(
          eventData.map((e) => ({
            id: e.id,
            title: e.title,
            startDate: e.start_date,
          }))
        );
      }
    } catch (error) {
      console.error("データ取得中にエラーが発生しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemosAndEvents();
  }, []);

  // メモ追加
  const handleAddMemo = async () => {
    if (!input.trim()) return;

    const payload = {
      content: input.trim(),
      event_id: selectedEventId || null,
    };

    const { error } = await supabase.from("memos").insert([payload]);

    if (error) {
      alert("メモの保存に失敗しました: " + error.message);
      return;
    }

    setInput("");
    setSelectedEventId("");
    await fetchMemosAndEvents();
  };

  // メモ編集開始
  const handleStartEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditText(memo.content);
    setEditEventId(memo.eventId || "");
  };

  // メモ保存
  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("memos")
      .update({
        content: editText.trim(),
        event_id: editEventId || null,
      })
      .eq("id", id);

    if (error) {
      alert("メモの更新に失敗しました: " + error.message);
      return;
    }

    setEditingId(null);
    await fetchMemosAndEvents();
  };

  // メモ削除
  const handleDeleteMemo = async (id: string) => {
    if (confirm("このメモを削除しますか？")) {
      const { error } = await supabase.from("memos").delete().eq("id", id);

      if (error) {
        alert("メモの削除に失敗しました: " + error.message);
        return;
      }

      await fetchMemosAndEvents();
    }
  };

  return (
    <div className="memo-list-container">
      <div className="memo-header">
        <h2>メモ</h2>
      </div>

      {/* メモ入力エリア */}
      <div className="memo-input-stack">
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

        {/* 関連付ける予定の選択（任意） */}
        <div className="memo-event-select-row">
          <label>関連する予定（任意）:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">なし（日常メモ）</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.startDate} : {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* メモ一覧（スクロール対応） */}
      <div className="memos-scroll-area">
        {isLoading ? (
          <p className="loading-text">メモを読み込み中...</p>
        ) : memos.length === 0 ? (
          <p className="empty-text">メモはありません</p>
        ) : (
          memos.map((memo) => {
            const linkedEvent = events.find((e) => e.id === memo.eventId);

            return (
              <div className="memo-item" key={memo.id}>
                {editingId === memo.id ? (
                  <div className="memo-edit-stack">
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
                    <div className="memo-event-select-row">
                      <label>予定:</label>
                      <select
                        value={editEventId}
                        onChange={(e) => setEditEventId(e.target.value)}
                      >
                        <option value="">なし（日常メモ）</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.startDate} : {ev.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="memo-view-row">
                    <div className="memo-content-box">
                      <p>{memo.content}</p>
                      {linkedEvent && (
                        <span className="linked-event-badge">
                          📅 {linkedEvent.title} ({linkedEvent.startDate})
                        </span>
                      )}
                    </div>
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
            );
          })
        )}
      </div>
    </div>
  );
}