import { useState } from "react";
import "./Calendar.css";

type Event = {
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
  const [currentMonth] = useState(12); // 2026年12月表示
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // 登録された予定のリスト
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      category: "学校",
      title: "学校",
      allDay: false,
      startDate: "2026-12-01",
      endDate: "2026-12-01",
      startTime: "09:00",
      endTime: "14:30",
      repeat: "none",
      memo: "卒業研究打ち合わせ",
    },
  ]);

  // モーダルの開閉状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // フォームの入力項目ステート
  const [category, setCategory] = useState("学校");
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [repeat, setRepeat] = useState<Event["repeat"]>("none");
  const [memo, setMemo] = useState("");

  // 日付セルをクリックしたとき
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setStartDate(date);
    setEndDate(date);
    setIsModalOpen(true);
  };

  // 新規予定追加ボタンを押したとき
  const handleOpenForm = () => {
    setTitle("");
    setMemo("");
    setAllDay(false);
    setStartTime("09:00");
    setEndTime("10:00");
    setIsFormOpen(true);
  };

  // フォームを閉じるとき
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // 予定の保存処理
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
    setIsFormOpen(false); // フォームを閉じる
  };

  // 選択中の日付の予定フィルタリング
  const selectedDayEvents = events.filter(
    (ev) => selectedDate && selectedDate >= ev.startDate && selectedDate <= ev.endDate
  );

  return (
    <div className="calendar-app">
      {/* メインカレンダーエリア */}
      <div className="calendar-card">
        {/* ヘッダー */}
        <div className="calendar-header">
          <h2>{currentYear}年 {currentMonth}月</h2>
          <div className="header-controls">
            <span className="badge">月表示</span>
          </div>
        </div>

        {/* 曜日ヘッダー */}
        <div className="calendar-week">
          <div className="weekday sun">日</div>
          <div className="weekday">月</div>
          <div className="weekday">火</div>
          <div className="weekday">水</div>
          <div className="weekday">木</div>
          <div className="weekday">金</div>
          <div className="weekday sat">土</div>
        </div>

        {/* 日付セルグリッド (2026年12月例: 1日〜31日) */}
        <div className="calendar-days">
          {Array.from({ length: 31 }, (_, index) => {
            const day = index + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            // この日に当てはまる予定を取得
            const dayEvents = events.filter(
              (event) => dateStr >= event.startDate && dateStr <= event.endDate
            );

            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={dateStr}
                className={`calendar-day ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleDateClick(dateStr)}
              >
                <div className="day-header">
                  <span className="day-number">{day}</span>
                </div>
                <div className="event-list">
                  {dayEvents.map((ev) => (
                    <div key={ev.id} className="event-tag">
                      {!ev.allDay && <span className="event-time">{ev.startTime}</span>}
                      <span className="event-title">{ev.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* モーダル1：指定日の予定確認ダイアログ */}
      {isModalOpen && selectedDate && !isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDate} の予定一覧</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              {selectedDayEvents.length === 0 ? (
                <p className="no-events">予定はありません</p>
              ) : (
                <ul className="events-detail-list">
                  {selectedDayEvents.map((ev) => (
                    <li key={ev.id} className="event-detail-item">
                      <div className="event-item-main">
                        <span className="category-pill">{ev.category}</span>
                        <strong>{ev.title}</strong>
                      </div>
                      <div className="event-item-sub">
                        {ev.allDay ? (
                          <span>終日</span>
                        ) : (
                          <span>{ev.startTime} 〜 {ev.endTime}</span>
                        )}
                        {ev.memo && <p className="event-memo-text">{ev.memo}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-footer">
              <button className="primary-btn" onClick={handleOpenForm}>
                ＋ 新しい予定を追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* モーダル2：予定登録フォーム */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={handleCloseForm}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>予定の登録</h3>
              <button className="close-btn" onClick={handleCloseForm}>×</button>
            </div>

            <form onSubmit={handleSaveEvent} className="modal-body form-body">
              <div className="form-group">
                <label>カテゴリ</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="例：学校、仕事、プライベート"
                  required
                />
              </div>

              <div className="form-group">
                <label>タイトル <span className="required">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="予定の件名"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                  />
                  終日予定にする
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>開始日</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
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
                <div className="form-row">
                  <div className="form-group">
                    <label>開始時刻</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>終了時刻</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>繰り返し</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as Event["repeat"])}
                >
                  <option value="none">繰り返さない</option>
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>

              <div className="form-group">
                <label>メモ・説明</label>
                <textarea
                  rows={3}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="場所や補足情報を入力"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={handleCloseForm}>
                  キャンセル
                </button>
                <button type="submit" className="primary-btn">
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}