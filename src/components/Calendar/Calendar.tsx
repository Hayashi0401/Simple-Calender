import { useState } from "react";
import "./Calendar.css";

export type Event = {
  id: string;
  category: string;
  title: string;
  allDay: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  memo: string;
};

export function Calendar() {
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(12);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 登録された予定リスト
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      category: "学校",
      title: "卒研打ち合わせ",
      allDay: false,
      startDate: "2026-12-01",
      endDate: "2026-12-01",
      startTime: "09:00",
      endTime: "14:30",
      repeat: "none",
      memo: "ゼミ室にて進捗報告",
    },
  ]);

  // モーダル管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // フォームステート
  const [category, setCategory] = useState("学校");
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [repeat, setRepeat] = useState<Event["repeat"]>("none");
  const [memo, setMemo] = useState("");

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setStartDate(date);
    setEndDate(date);
    setIsModalOpen(true);
  };

  const handleOpenForm = () => {
    setTitle("");
    setMemo("");
    setAllDay(false);
    setStartTime("09:00");
    setEndTime("10:00");
    setIsFormOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    const newEvent: Event = {
      id: crypto.randomUUID(),
      category,
      title: title.trim(),
      allDay,
      startDate,
      endDate: endDate || startDate,
      startTime: allDay ? "" : startTime,
      endTime: allDay ? "" : endTime,
      repeat,
      memo: memo.trim(),
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsFormOpen(false);
  };

  const selectedDayEvents = events.filter(
    (ev) => selectedDate && selectedDate >= ev.startDate && selectedDate <= ev.endDate
  );

  return (
    <div className="calendar-container">
      {/* カレンダーヘッダー */}
      <div className="calendar-header">
        <h2>{currentYear}年 {currentMonth}月</h2>
        <span className="month-badge">月表示</span>
      </div>

      {/* 曜日標記 */}
      <div className="calendar-week">
        <div className="weekday sun">日</div>
        <div className="weekday">月</div>
        <div className="weekday">火</div>
        <div className="weekday">水</div>
        <div className="weekday">木</div>
        <div className="weekday">金</div>
        <div className="weekday sat">土</div>
      </div>

      {/* 日付グリッド */}
      <div className="calendar-grid">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = events.filter(
            (ev) => dateStr >= ev.startDate && dateStr <= ev.endDate
          );
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={dateStr}
              className={`calendar-cell ${isSelected ? "is-selected" : ""}`}
              onClick={() => handleDateClick(dateStr)}
            >
              <div className="cell-day-number">{day}</div>
              <div className="cell-event-list">
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="cell-event-tag">
                    {!ev.allDay && <span className="tag-time">{ev.startTime}</span>}
                    <span className="tag-title">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 日付クリック時の予定一覧モーダル */}
      {isModalOpen && selectedDate && !isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDate} の予定</h3>
              <button className="icon-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {selectedDayEvents.length === 0 ? (
                <p className="empty-text">予定はありません</p>
              ) : (
                <div className="event-card-list">
                  {selectedDayEvents.map((ev) => (
                    <div key={ev.id} className="event-card">
                      <div className="event-card-top">
                        <span className="category-tag">{ev.category}</span>
                        <strong>{ev.title}</strong>
                      </div>
                      <div className="event-card-time">
                        {ev.allDay ? "終日" : `${ev.startTime} 〜 ${ev.endTime}`}
                      </div>
                      {ev.memo && <p className="event-card-memo">{ev.memo}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleOpenForm}>
                ＋ 予定を追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 予定作成フォームモーダル */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新規予定の登録</h3>
              <button className="icon-close-btn" onClick={() => setIsFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="modal-body form-stack">
                <div className="field-group">
                  <label>カテゴリ</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="例：学校、仕事、プライベート"
                  />
                </div>

                <div className="field-group">
                  <label>タイトル <span className="req">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="件名を入力"
                    required
                    autoFocus
                  />
                </div>

                <div className="field-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                    />
                    終日予定
                  </label>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label>開始日</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>終了日</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!allDay && (
                  <div className="field-row">
                    <div className="field-group">
                      <label>開始時刻</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="field-group">
                      <label>終了時刻</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="field-group">
                  <label>繰り返し</label>
                  <select
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value as Event["repeat"])}
                  >
                    <option value="none">なし</option>
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>メモ</label>
                  <textarea
                    rows={2}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="詳細やメモを入力"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsFormOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}