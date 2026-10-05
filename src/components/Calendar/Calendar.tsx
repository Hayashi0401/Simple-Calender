import { useState, useRef } from "react";
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
  color: string; // 予定の色
};

// 利用可能なテーマカラー一覧
const COLOR_OPTIONS = [
  { label: "パープル", value: "#aa3bff" },
  { label: "ブルー", value: "#3182ce" },
  { label: "グリーン", value: "#38a169" },
  { label: "オレンジ", value: "#dd6b20" },
  { label: "ピンク", value: "#e53e3e" },
];

export function Calendar() {
  // 1. 年月変更機能のためのステート
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(12);

  // 2. カラーパレット用ステート
  const [selectedColor, setSelectedColor] = useState("#aa3bff");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
      color: "#aa3bff",
    },
    {
      id: "2",
      category: "旅行",
      title: "ゼミ合宿",
      allDay: true,
      startDate: "2026-12-10",
      endDate: "2026-12-12",
      startTime: "",
      endTime: "",
      repeat: "none",
      memo: "温泉旅館",
      color: "#38a169",
    },
  ]);

  // モーダル表示状態
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

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
  const [eventColor, setEventColor] = useState("#aa3bff");

  const touchStartX = useRef<number>(0);

  // 前月・次月移動
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 当月の全日付（1日〜末日）を取得
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  // 日付クリック時
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsListModalOpen(true);
  };

  // 新規登録フォームを開く
  const handleOpenNewForm = () => {
    setEditingEventId(null);
    setCategory("学校");
    setTitle("");
    setAllDay(false);
    setStartDate(selectedDate || "");
    setEndDate(selectedDate || "");
    setStartTime("09:00");
    setEndTime("10:00");
    setRepeat("none");
    setMemo("");
    setEventColor(selectedColor); // パレットで選択中の色を初期値に設定
    setIsListModalOpen(false);
    setIsFormModalOpen(true);
  };

  // 編集フォームを開く
  const handleOpenEditForm = (event: Event) => {
    setEditingEventId(event.id);
    setCategory(event.category);
    setTitle(event.title);
    setAllDay(event.allDay);
    setStartDate(event.startDate);
    setEndDate(event.endDate);
    setStartTime(event.startTime || "09:00");
    setEndTime(event.endTime || "10:00");
    setRepeat(event.repeat);
    setMemo(event.memo);
    setEventColor(event.color || "#aa3bff");
    setIsListModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingEventId(null);
  };

  // 保存処理
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEventId
            ? {
                ...ev,
                category,
                title: title.trim(),
                allDay,
                startDate,
                endDate: endDate || startDate,
                startTime: allDay ? "" : startTime,
                endTime: allDay ? "" : endTime,
                repeat,
                memo: memo.trim(),
                color: eventColor,
              }
            : ev
        )
      );
    } else {
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
        color: eventColor,
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    setIsFormModalOpen(false);
    setEditingEventId(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("この予定を削除してもよろしいですか？")) {
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setIsFormModalOpen(false);
      setIsListModalOpen(false);
      setEditingEventId(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX.current - touchEndX > 50) {
      handleDeleteEvent(id);
    }
  };

  const selectedDayEvents = events.filter(
    (ev) => selectedDate && selectedDate >= ev.startDate && selectedDate <= ev.endDate
  );

  return (
    <div className="calendar-layout-wrapper">
      {/* 2. サイドに配置するカラー選択パレットバー */}
      <aside className="color-palette-sidebar">
        <h4>予定の色</h4>
        <div className="color-picker-list">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              className={`color-btn ${selectedColor === c.value ? "is-active" : ""}`}
              style={{ backgroundColor: c.value }}
              onClick={() => setSelectedColor(c.value)}
              title={c.label}
            />
          ))}
        </div>
      </aside>

      <div className="calendar-container">
        {/* 1. 年月変更機能付きヘッダー */}
        <div className="calendar-header">
          <div className="month-control">
            <button className="nav-btn" onClick={handlePrevMonth}>‹</button>
            <h2>{currentYear}年 {currentMonth}月</h2>
            <button className="nav-btn" onClick={handleNextMonth}>›</button>
          </div>
          <span className="month-badge">月表示</span>
        </div>

        {/* 曜日 */}
        <div className="calendar-week">
          <div className="weekday sun">日</div>
          <div className="weekday">月</div>
          <div className="weekday">火</div>
          <div className="weekday">水</div>
          <div className="weekday">木</div>
          <div className="weekday">金</div>
          <div className="weekday sat">土</div>
        </div>

        {/* 3. 複数日にまたがる1つの枠表示に対応したグリッド */}
        <div className="calendar-grid">
          {/* 月初の空白セル */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty" />
          ))}

          {/* 各日付セル */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDate === dateStr;

            // 当日に関連する予定を取得
            const dayEvents = events.filter(
              (ev) => dateStr >= ev.startDate && dateStr <= ev.endDate
            );

            return (
              <div
                key={dateStr}
                className={`calendar-cell ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleDateClick(dateStr)}
              >
                <div className="cell-day-number">{day}</div>
                <div className="cell-event-list">
                  {dayEvents.map((ev) => {
                    const isStart = ev.startDate === dateStr;
                    const isEnd = ev.endDate === dateStr;
                    const isMultiDay = ev.startDate !== ev.endDate;

                    return (
                      <div
                        key={ev.id}
                        className={`cell-event-tag ${isMultiDay ? "is-span-event" : ""} ${isStart ? "span-start" : ""} ${isEnd ? "span-end" : ""}`}
                        style={{
                          backgroundColor: ev.color ? `${ev.color}22` : "rgba(170, 59, 255, 0.1)",
                          borderLeftColor: ev.color || "#aa3bff",
                          color: ev.color || "#aa3bff",
                        }}
                      >
                        {isStart && !ev.allDay && (
                          <span className="tag-time">{ev.startTime}</span>
                        )}
                        <span className="tag-title">
                          {isMultiDay && !isStart ? "↳ " : ""}{ev.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 予定一覧モーダル */}
        {isListModalOpen && selectedDate && (
          <div className="modal-overlay" onClick={() => setIsListModalOpen(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedDate} の予定一覧</h3>
                <button className="icon-close-btn" onClick={() => setIsListModalOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                {selectedDayEvents.length === 0 ? (
                  <p className="empty-text">予定はありません</p>
                ) : (
                  <div className="event-card-list">
                    {selectedDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="event-card clickable"
                        style={{ borderLeft: `5px solid ${ev.color || "#aa3bff"}` }}
                        onClick={() => handleOpenEditForm(ev)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={(e) => handleTouchEnd(e, ev.id)}
                      >
                        <div className="event-card-top">
                          <span
                            className="category-tag"
                            style={{
                              backgroundColor: `${ev.color || "#aa3bff"}22`,
                              color: ev.color || "#aa3bff",
                            }}
                          >
                            {ev.category}
                          </span>
                          <strong>{ev.title}</strong>
                        </div>
                        <div className="event-card-time">
                          {ev.startDate !== ev.endDate
                            ? `${ev.startDate} 〜 ${ev.endDate}`
                            : ev.allDay
                            ? "終日"
                            : `${ev.startTime} 〜 ${ev.endTime}`}
                        </div>
                        {ev.memo && <p className="event-card-memo">{ev.memo}</p>}
                        <span className="swipe-hint">← スワイプで削除</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer justify-end">
                <button className="btn-primary" onClick={handleOpenNewForm}>
                  ＋ 予定を追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 予定作成・編集モーダル */}
        {isFormModalOpen && (
          <div className="modal-overlay" onClick={handleCloseForm}>
            <div className="modal-box form-modal-box" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSaveEvent}>
                <div className="modal-body form-stack">
                  <div className="field-group">
                    <label>カラー指定</label>
                    <div className="color-picker-row">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          type="button"
                          key={c.value}
                          className={`color-btn ${eventColor === c.value ? "is-active" : ""}`}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setEventColor(c.value)}
                        />
                      ))}
                    </div>
                  </div>

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

                <div className="modal-footer split-footer">
                  <button
                    type="button"
                    className="btn-cancel-icon"
                    onClick={handleCloseForm}
                    title="キャンセル"
                  >
                    ✕
                  </button>

                  <div className="right-action-buttons">
                    {editingEventId && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDeleteEvent(editingEventId)}
                      >
                        削除
                      </button>
                    )}
                    <button type="submit" className="btn-primary">
                      保存
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}