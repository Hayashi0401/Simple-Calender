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
  color: string;
};

const COLOR_OPTIONS = [
  { label: "パープル", value: "#8a2be2" },
  { label: "ブルー", value: "#1e6091" },
  { label: "グリーン", value: "#2e7d32" },
  { label: "オレンジ", value: "#d97706" },
  { label: "レッド", value: "#c53030" },
];

// 日本の祝日判定用関数 (簡易計算ロジック)
function getJapaneseHoliday(year: number, month: number, day: number): string | null {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0: 日, 1: 月...
  const nthWeek = Math.ceil(day / 7);

  // 固定祝日
  if (month === 1 && day === 1) return "元日";
  if (month === 2 && day === 11) return "建国記念の日";
  if (month === 2 && day === 23) return "天皇誕生日";
  if (month === 4 && day === 29) return "昭和の日";
  if (month === 5 && day === 3) return "憲法記念日";
  if (month === 5 && day === 4) return "みどりの日";
  if (month === 5 && day === 5) return "こどもの日";
  if (month === 8 && day === 11) return "山の日";
  if (month === 11 && day === 3) return "文化の日";
  if (month === 11 && day === 23) return "勤労感謝の日";

  // ハッピーマンデー (月曜日固定)
  if (dayOfWeek === 1) {
    if (month === 1 && nthWeek === 2) return "成人の日";
    if (month === 7 && nthWeek === 3) return "海の日";
    if (month === 9 && nthWeek === 3) return "敬老の日";
    if (month === 10 && nthWeek === 2) return "スポーツの日";
  }

  // 春分の日・秋分の日 (簡易計算)
  if (month === 3 && day === Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))) {
    return "春分の日";
  }
  if (month === 9 && day === Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))) {
    return "秋分の日";
  }

  return null;
}

export function Calendar() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedColor, setSelectedColor] = useState("#8a2be2");
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      category: "学校",
      title: "卒研打ち合わせ",
      allDay: false,
      startDate: todayStr,
      endDate: todayStr,
      startTime: "09:00",
      endTime: "14:30",
      repeat: "none",
      memo: "ゼミ室にて進捗報告",
      color: "#8a2be2",
    },
  ]);

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
  const [eventColor, setEventColor] = useState("#8a2be2");

  const touchStartX = useRef<number>(0);

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

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsListModalOpen(true);
  };

  const handleOpenNewForm = () => {
    setEditingEventId(null);
    setCategory("学校");
    setTitle("");
    setAllDay(false);
    setStartDate(selectedDate || todayStr);
    setEndDate(selectedDate || todayStr);
    setStartTime("09:00");
    setEndTime("10:00");
    setRepeat("none");
    setMemo("");
    setEventColor(selectedColor);
    setIsListModalOpen(false);
    setIsFormModalOpen(true);
  };

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
    setEventColor(event.color || "#8a2be2");
    setIsListModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingEventId(null);
  };

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
        <div className="calendar-header">
          <div className="month-control">
            <button className="nav-btn" onClick={handlePrevMonth}>‹</button>
            <h2>{currentYear}年 {currentMonth}月</h2>
            <button className="nav-btn" onClick={handleNextMonth}>›</button>
          </div>
          <span className="month-badge">月表示</span>
        </div>

        <div className="calendar-week">
          <div className="weekday sun">日</div>
          <div className="weekday">月</div>
          <div className="weekday">火</div>
          <div className="weekday">水</div>
          <div className="weekday">木</div>
          <div className="weekday">金</div>
          <div className="weekday sat">土</div>
        </div>

        <div className="calendar-grid">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const isSelected = selectedDate === dateStr;
            const holidayName = getJapaneseHoliday(currentYear, currentMonth, day);

            const dayEvents = events.filter(
              (ev) => dateStr >= ev.startDate && dateStr <= ev.endDate
            );

            return (
              <div
                key={dateStr}
                className={`calendar-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleDateClick(dateStr)}
              >
                <div className="cell-header">
                  <span className={`cell-day-number ${holidayName ? "is-holiday" : ""}`}>
                    {day}
                  </span>
                  {holidayName && <span className="holiday-label">{holidayName}</span>}
                </div>

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
                          backgroundColor: ev.color ? `${ev.color}25` : "rgba(138, 43, 226, 0.15)",
                          borderLeftColor: ev.color || "#8a2be2",
                          color: ev.color || "#222",
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
                        style={{ borderLeft: `6px solid ${ev.color || "#8a2be2"}` }}
                        onClick={() => handleOpenEditForm(ev)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={(e) => handleTouchEnd(e, ev.id)}
                      >
                        <div className="event-card-top">
                          <span
                            className="category-tag"
                            style={{
                              backgroundColor: `${ev.color || "#8a2be2"}25`,
                              color: ev.color || "#8a2be2",
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

        {/* 2. 編集画面モーダル（サイズ大きめ） */}
        {isFormModalOpen && (
          <div className="modal-overlay" onClick={handleCloseForm}>
            <div className="modal-box form-modal-box large-modal" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSaveEvent}>
                <div className="modal-header">
                  <h3>{editingEventId ? "予定の編集" : "新規予定作成"}</h3>
                  <button type="button" className="icon-close-btn" onClick={handleCloseForm}>×</button>
                </div>

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
                      rows={3}
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