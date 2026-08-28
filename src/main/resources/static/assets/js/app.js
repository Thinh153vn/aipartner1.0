/* =========================================================
   BrSE Copilot - Calendar-Centric Workspace
   File: assets/js/app.js
   Frontend gọi REST API thật của backend Spring Boot + Spring AI
   (cùng origin, không cần CORS). Task/Backlog/Calendar event vẫn là
   state cục bộ (localStorage) vì không có endpoint CRUD tương ứng.
   ========================================================= */

/* ---------- 1. HELPER FUNCTIONS ---------- */

function $(id) {
  return document.getElementById(id);
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

// Format Date -> chuỗi "YYYY-MM-DD" theo giờ local (tránh lệch múi giờ của toISOString)
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

/* ---------- 2. MOCK DATA CỤC BỘ (Backlog / Fixed Events) ----------
   Đây KHÔNG phải mock cho phản hồi AI - đây là dữ liệu Task/Lịch hiển thị
   trên Backlog (trái) và Calendar (giữa), không có endpoint CRUD nào được
   yêu cầu cho phần này nên vẫn giữ ở phía client. */

// Task chưa xếp lịch cụ thể (kéo thả sang Calendar để đặt giờ)
const BACKLOG_SEED = [
  { id: "bk1", title: "保険料計算ロジックの実装", priority: "high", category: "work", dueDate: toDateKey(TODAY) },
  { id: "bk2", title: "解約返戻金計算ロジックの調査", priority: "medium", category: "work", dueDate: toDateKey(addDays(TODAY, 1)) },
  { id: "bk3", title: "更新ロジック仕様書レビュー", priority: "high", category: "work", dueDate: toDateKey(addDays(TODAY, -1)) },
  { id: "bk4", title: "契約者情報API仕様確認", priority: "medium", category: "work", dueDate: toDateKey(addDays(TODAY, 2)) },
  { id: "bk5", title: "単体テスト設計書作成", priority: "low", category: "work", dueDate: toDateKey(addDays(TODAY, 5)) },
  { id: "bk6", title: "Spring Boot設計パターン学習（個人目標）", priority: "low", category: "learning", dueDate: toDateKey(addDays(TODAY, 3)) },
];

// Sự kiện cố định (họp/công việc đã có giờ) - hiển thị thẳng trên Calendar, không nằm trong Backlog
const FIXED_EVENTS = [
  { id: "fx1", title: "🗣 朝会（デイリースクラム）", start: `${toDateKey(TODAY)}T09:30:00`, end: `${toDateKey(TODAY)}T09:45:00` },
  { id: "fx2", title: "📋 契約更新機能 定例会議", start: `${toDateKey(addDays(TODAY, 1))}T14:00:00`, end: `${toDateKey(addDays(TODAY, 1))}T15:00:00` },
  { id: "fx3", title: "🧑‍🏫 PMとの1on1", start: `${toDateKey(addDays(TODAY, 3))}T16:00:00`, end: `${toDateKey(addDays(TODAY, 3))}T16:30:00` },
];

// Task lấy về từ Google Calendar sau khi bấm "Google同期" (state cục bộ, thay thế mỗi lần sync)
let GOOGLE_SYNCED_TASKS = [];

/* ---------- 2b. TASK ĐÃ ĐƯỢC XẾP LỊCH (kéo thả hoặc AI tự xếp) - lưu localStorage ---------- */
const SCHEDULED_EVENTS_STORAGE_KEY = "brseCopilotScheduledEvents";

function loadScheduledEvents() {
  try {
    const raw = localStorage.getItem(SCHEDULED_EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveScheduledEvents() {
  localStorage.setItem(SCHEDULED_EVENTS_STORAGE_KEY, JSON.stringify(SCHEDULED_EVENTS));
}

let SCHEDULED_EVENTS = loadScheduledEvents();

// Backlog thực tế = seed ban đầu TRỪ những task đã được xếp lịch ở phiên trước (tránh trùng lặp
// vừa nằm trong Backlog vừa nằm trên Calendar sau khi tải lại trang).
let BACKLOG_TASKS = BACKLOG_SEED.filter(
  (task) => !SCHEDULED_EVENTS.some((evt) => evt.taskId === task.id)
);

/* ---------- 2c. TRẠNG THÁI "ĐÃ HOÀN THÀNH" CỦA TASK (lưu localStorage) ----------
   Dùng chung cho: click event trên FullCalendar, checklist widget "leo núi", Reality-Check.
   Lưu theo taskId (không theo ngày) vì id của BACKLOG_SEED/FIXED_EVENTS/Google Calendar cố định. */
const DONE_TASKS_STORAGE_KEY = "brseCopilotDoneTaskIds";

function loadDoneTaskIds() {
  try {
    const raw = localStorage.getItem(DONE_TASKS_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    return new Set();
  }
}

let DONE_TASK_IDS = loadDoneTaskIds();

function saveDoneTaskIds() {
  localStorage.setItem(DONE_TASKS_STORAGE_KEY, JSON.stringify([...DONE_TASK_IDS]));
}

// Ghi nhớ task vừa được tick để phát hiệu ứng "pop" đúng vào đúng phần tử đó khi vẽ lại.
let lastToggledTaskId = null;

// Toggle trạng thái hoàn thành của 1 task, rồi vẽ lại toàn bộ nơi hiển thị liên quan
// (Calendar, widget leo núi, Reality-Check) để luôn đồng bộ dữ liệu.
function toggleTaskDone(taskId) {
  if (DONE_TASK_IDS.has(taskId)) {
    DONE_TASK_IDS.delete(taskId);
  } else {
    DONE_TASK_IDS.add(taskId);
  }
  lastToggledTaskId = taskId;
  saveDoneTaskIds();
  refreshCalendarEvents();
  renderMountainWidget();
  renderRealityCheck();
}

// Hiệu ứng confetti ăn mừng khi hoàn thành 100% task hôm nay (leo lên đỉnh núi).
function spawnConfetti(containerEl) {
  if (!containerEl) return;
  const colors = ["#cf2e2e", "#45b994", "#f5b74f", "#4d8fe8", "#ffffff"];
  for (let i = 0; i < 26; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${(Math.random() * 0.3).toFixed(2)}s`;
    piece.style.setProperty("--rotate", `${Math.round(Math.random() * 360)}deg`);
    piece.addEventListener("animationend", () => piece.remove());
    containerEl.appendChild(piece);
  }
}

// Hiệu ứng số đếm tăng dần (count-up) cho các số liệu thống kê.
function animateCountUp(el, newValue) {
  if (!el) return;
  const startValue = parseInt(el.textContent, 10) || 0;
  if (startValue === newValue) {
    el.textContent = String(newValue);
    return;
  }
  const duration = 450;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.round(startValue + (newValue - startValue) * progress);
    el.textContent = String(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Gộp toàn bộ nguồn Task (Backlog + đã xếp lịch + cố định + Google) thành 1 dạng thống nhất
// {id, title, date} để dùng cho gamification (widget leo núi, Reality-Check, lời chào đầu ngày).
function getAllTasks() {
  const backlogAsTasks = BACKLOG_TASKS.map((t) => ({ id: t.id, title: t.title, date: t.dueDate }));
  const scheduledAsTasks = SCHEDULED_EVENTS.map((e) => ({
    id: e.taskId,
    title: e.title,
    date: (e.start || "").slice(0, 10),
  }));
  const fixedAsTasks = FIXED_EVENTS.map((e) => ({ id: e.id, title: e.title, date: e.start.slice(0, 10) }));
  return [...backlogAsTasks, ...scheduledAsTasks, ...fixedAsTasks, ...GOOGLE_SYNCED_TASKS];
}

// Thu gọn/mở rộng 1 card (dùng cho khối cài đặt Googleカレンダー連携)
function toggleCollapse(cardId) {
  const card = $(cardId);
  if (card) card.classList.toggle("is-collapsed");
}

// Nội dung mẫu (Spec/Code) gửi cho API review-offshore ở chế độ SPEC_DIFF.
const OFFSHORE_SPEC_SAMPLE = {
  specText: "第3.2節：保険料計算における成人の定義は「18歳以上」とする。",
  codeText: 'if (age >= 20) { applyAdultPremium(); }',
};

/* ---------- 3. API CLIENT (fetch thật) ---------- */

const API_TIMEOUT_MS = 30000;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function requestJson(url, method, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError.name === "AbortError") {
      throw new ApiError("応答がタイムアウトしました。しばらくしてから再度お試しください。");
    }
    throw new ApiError("ネットワークエラーが発生しました。接続をご確認のうえ、再度お試しください。");
  } finally {
    clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok) {
    const message = (payload && payload.message) || "サーバーとの通信でエラーが発生しました。";
    throw new ApiError(message, response.status);
  }

  return payload;
}

function postJson(url, body) {
  return requestJson(url, "POST", body);
}

function putJson(url, body) {
  return requestJson(url, "PUT", body);
}

function getJson(url) {
  return requestJson(url, "GET");
}

async function postFormData(url, formData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, { method: "POST", body: formData, signal: controller.signal });
  } catch (networkError) {
    if (networkError.name === "AbortError") {
      throw new ApiError("応答がタイムアウトしました。しばらくしてから再度お試しください。");
    }
    throw new ApiError("ネットワークエラーが発生しました。接続をご確認のうえ、再度お試しください。");
  } finally {
    clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError((payload && payload.message) || "ファイルの処理でエラーが発生しました。", response.status);
  }

  return payload;
}

/* ---------- 4. TOAST NOTIFICATION ---------- */
let toastHideTimer = null;

function showToast(title, message, variant = "info") {
  const toast = $("appToast");
  const titleEl = $("appToastTitle");
  const textEl = $("appToastText");
  const iconEl = $("appToastIcon");
  if (!toast || !titleEl || !textEl) return;

  titleEl.textContent = title;
  textEl.textContent = message;

  const icons = { success: "✅", error: "⚠️", info: "🔔" };
  iconEl.textContent = icons[variant] || icons.info;

  toast.classList.remove("toast-info", "toast-success", "toast-error");
  toast.classList.add(`toast-${icons[variant] ? variant : "info"}`);
  toast.classList.add("is-visible");

  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 6000);
}

function notifyAiFailure(err) {
  showToast("⚠️ エラー", err.message || "AIエージェントとの通信に失敗しました。", "error");
}

/* ---------- 5. ĐIỀU HƯỚNG TAB TRUNG TÂM (Calendar / MBO / Nippo / Offshore) ---------- */
function switchMainTab(tabName) {
  document.querySelectorAll(".center-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".main-tab").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `tab-${tabName}`);
  });

  // FullCalendar được khởi tạo khi tab đang ẩn ở lần chuyển tab trước đó -> cần tính lại kích thước.
  if (tabName === "calendar" && mainCalendar) {
    setTimeout(() => mainCalendar.updateSize(), 50);
  }
}

/* ---------- 6. LEFT SIDEBAR: BACKLOG (draggable task card) ---------- */

const PRIORITY_LABELS = { high: "高", medium: "中", low: "低" };

function renderBacklog() {
  const container = $("backlogList");
  const countEl = $("backlogCount");
  if (!container || !countEl) return;

  countEl.textContent = String(BACKLOG_TASKS.length);

  if (BACKLOG_TASKS.length === 0) {
    container.innerHTML =
      '<div class="backlog-empty">積み残しタスクはありません。素晴らしい進捗です！</div>';
    return;
  }

  const sorted = [...BACKLOG_TASKS].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  container.innerHTML = "";

  sorted.forEach((task) => {
    const isOverdue = new Date(`${task.dueDate}T00:00:00`) < TODAY;

    const card = document.createElement("div");
    card.className = `backlog-card${isOverdue ? " is-overdue" : ""}`;
    card.dataset.taskId = task.id;

    const head = document.createElement("div");
    head.className = "backlog-card-head";

    const titleEl = document.createElement("span");
    titleEl.className = "backlog-card-title";
    titleEl.textContent = task.title; // textContent để tránh XSS

    const badge = document.createElement("span");
    badge.className = `priority-badge priority-${task.priority}`;
    badge.textContent = PRIORITY_LABELS[task.priority] || "中";

    head.appendChild(titleEl);
    head.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "backlog-card-meta";
    meta.innerHTML = '<i class="fa-regular fa-clock"></i><span></span>';
    meta.querySelector("span").textContent = isOverdue
      ? `期限超過（${task.dueDate}）`
      : `期日: ${task.dueDate}`;

    card.appendChild(head);
    card.appendChild(meta);
    container.appendChild(card);
  });
}

// Cho phép kéo card từ Backlog thả thẳng vào FullCalendar (FullCalendar.Draggable lắng nghe
// theo itemSelector nên vẫn hoạt động đúng dù backlog-list được render lại động).
function initBacklogDraggable() {
  const container = $("backlogList");
  if (!container || typeof FullCalendar === "undefined") return;

  new FullCalendar.Draggable(container, {
    itemSelector: ".backlog-card",
    eventData: function (cardEl) {
      const taskId = cardEl.dataset.taskId;
      const task = BACKLOG_TASKS.find((t) => t.id === taskId);
      if (!task) return null;
      return {
        id: task.id,
        title: task.title,
        duration: "01:00",
        extendedProps: { taskId: task.id, category: task.category },
      };
    },
  });
}

/* ---------- 7. MAIN CENTER: DYNAMIC CALENDAR (FullCalendar) ---------- */

let mainCalendar = null;

// Gộp 3 nguồn sự kiện (cố định / đã xếp lịch / Google) thành mảng event cho FullCalendar.
function buildCalendarEvents() {
  const fixed = FIXED_EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    extendedProps: { taskId: e.id, category: "work" },
  }));

  const scheduled = SCHEDULED_EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end || undefined,
    allDay: Boolean(e.allDay),
    extendedProps: { taskId: e.taskId, category: e.category, isAiNew: Boolean(e.isAiNew) },
  }));

  const google = GOOGLE_SYNCED_TASKS.map((t) => ({
    id: t.id,
    title: `📅 ${t.title}`,
    start: t.date,
    allDay: true,
    extendedProps: { taskId: t.id, category: "google" },
  }));

  return [...fixed, ...scheduled, ...google];
}

// Vẽ lại toàn bộ event trên Calendar dựa theo state hiện tại (gọi sau mỗi lần dữ liệu thay đổi).
function refreshCalendarEvents() {
  if (!mainCalendar) return;
  mainCalendar.removeAllEvents();
  buildCalendarEvents().forEach((evt) => mainCalendar.addEvent(evt));
}

function initFullCalendar() {
  const el = $("fullCalendar");
  if (!el || typeof FullCalendar === "undefined") return;

  mainCalendar = new FullCalendar.Calendar(el, {
    locale: "ja",
    initialView: "timeGridWeek",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "timeGridWeek,timeGridDay,dayGridMonth",
    },
    height: "100%",
    nowIndicator: true,
    droppable: true,
    dayMaxEvents: true,
    events: buildCalendarEvents(),

    // Màu/実線 theo category(work=青/learning=緑/google=枠線), thêm hiệu ứng khi vừa toggle/AI追加
    eventClassNames: function (arg) {
      const classes = [];
      const category = arg.event.extendedProps.category;
      if (category === "work") classes.push("fc-event-work");
      else if (category === "learning") classes.push("fc-event-learning");
      else if (category === "google") classes.push("fc-event-google");

      const taskId = arg.event.extendedProps.taskId || arg.event.id;
      if (DONE_TASK_IDS.has(taskId)) classes.push("fc-event-done");
      if (arg.event.extendedProps.isAiNew) classes.push("fc-event-ai-new");
      if (taskId === lastToggledTaskId) classes.push("just-toggled");
      return classes;
    },

    // Click vào 1 event -> toggle hoàn thành/chưa hoàn thành (giống task-pill trước đây)
    eventClick: function (arg) {
      const taskId = arg.event.extendedProps.taskId || arg.event.id;
      toggleTaskDone(taskId);
    },

    // Nhận task được kéo thả từ Backlog (Left Sidebar) sang Calendar
    eventReceive: function (info) {
      const taskId = info.event.extendedProps.taskId;
      const task = BACKLOG_TASKS.find((t) => t.id === taskId);
      if (!task) {
        info.event.remove();
        return;
      }

      SCHEDULED_EVENTS.push({
        id: info.event.id,
        taskId: task.id,
        title: task.title,
        start: info.event.startStr,
        end: info.event.endStr || null,
        allDay: info.event.allDay,
        category: task.category,
      });
      saveScheduledEvents();

      BACKLOG_TASKS = BACKLOG_TASKS.filter((t) => t.id !== task.id);
      renderBacklog();
      renderMountainWidget();
      renderRealityCheck();
      showToast("✅ 配置完了", `「${task.title}」をカレンダーに配置しました。`, "success");
    },
  });

  mainCalendar.render();
}

/* ---------- 7b. GOOGLE CALENDAR 連携（設定の読込・保存・同期） ---------- */

async function loadCalendarSettings() {
  const statusEl = $("gcalStatusText");
  const idInput = $("gcalCalendarIdInput");
  try {
    const settings = await getJson("/api/v1/calendar/settings");
    if (idInput && settings.calendarId) idInput.value = settings.calendarId;

    if (statusEl) {
      const isConfigured = Boolean(settings.calendarId) && settings.apiKeyConfigured;
      statusEl.textContent = isConfigured
        ? "✅ 設定済みです。「Google同期」ボタンで最新の予定を取り込めます。"
        : "⚠️ 未設定です。カレンダーIDとAPIキーを登録してください。";
      statusEl.classList.toggle("is-configured", isConfigured);
      statusEl.classList.toggle("is-missing", !isConfigured);
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ 設定状態を取得できませんでした。";
  }
}

async function saveCalendarSettings(buttonEl) {
  const calendarId = $("gcalCalendarIdInput")?.value.trim();
  const apiKey = $("gcalApiKeyInput")?.value.trim();

  if (!calendarId) {
    alert("カレンダーIDを入力してください。");
    return;
  }

  if (!buttonEl || buttonEl.disabled) return;
  const originalHtml = buttonEl.innerHTML;
  buttonEl.disabled = true;
  buttonEl.innerHTML = "⏳ 保存中...";

  try {
    await putJson("/api/v1/calendar/settings", { calendarId, apiKey: apiKey || null });
    const apiKeyInput = $("gcalApiKeyInput");
    if (apiKeyInput) apiKeyInput.value = "";
    showToast("✅ 保存完了", "Googleカレンダーの連携設定を保存しました。", "success");
    await loadCalendarSettings();
  } catch (err) {
    notifyAiFailure(err);
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
  }
}

async function syncGoogleCalendar(buttonEl) {
  if (!buttonEl || buttonEl.disabled) return;
  const originalHtml = buttonEl.innerHTML;
  buttonEl.disabled = true;
  buttonEl.innerHTML = "⏳ 同期中...";

  try {
    const result = await postJson("/api/v1/calendar/sync");
    GOOGLE_SYNCED_TASKS = (result.tasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      date: task.dueDate,
      source: "google",
    }));
    refreshCalendarEvents();
    renderMountainWidget();
    renderRealityCheck();
    showToast(
      "✅ 同期完了",
      `Googleカレンダーから${GOOGLE_SYNCED_TASKS.length}件の予定を取り込みました。`,
      "success"
    );
  } catch (err) {
    notifyAiFailure(err);
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
  }
}

/* ---------- 7c. WIDGET "LEO NÚI" - Mục tiêu hằng ngày (gamification, thu gọn cho Right Panel) ---------- */

let lastMountainPercent = -1;
let mountainWidgetInitialized = false;

function renderMountainWidget() {
  const progressFill = $("mountainProgressFill");
  const progressText = $("mountainProgressText");
  const taskListEl = $("mountainTaskList");
  const widgetEl = $("mountainWidget");
  const statusLineEl = $("agentStatusLine");
  if (!progressFill || !progressText || !taskListEl || !widgetEl) return;

  const todayKey = toDateKey(TODAY);
  const todayTasks = getAllTasks().filter((task) => task.date === todayKey);
  const doneCount = todayTasks.filter((task) => DONE_TASK_IDS.has(task.id)).length;
  const totalCount = todayTasks.length;
  // Không có task hôm nay -> coi như đã "lên đỉnh" (100%) để khích lệ.
  const percent = totalCount === 0 ? 100 : Math.round((doneCount / totalCount) * 100);

  progressFill.style.width = `${percent}%`;
  widgetEl.classList.toggle("is-summit", percent >= 100 && totalCount > 0);

  progressText.textContent =
    totalCount === 0
      ? "本日期日のタスクはありません。素晴らしい一日を！"
      : `本日期日のタスク: ${doneCount}/${totalCount} 完了（${percent}%）`;

  if (statusLineEl) {
    statusLineEl.textContent =
      totalCount === 0
        ? "本日期日のタスクはありません。個人目標に集中しましょう！"
        : `本日のタスク: ${doneCount}/${totalCount} 完了です。`;
  }

  taskListEl.innerHTML = "";
  todayTasks.forEach((task) => {
    const isDone = DONE_TASK_IDS.has(task.id);
    const item = document.createElement("div");
    item.className = `mountain-task-item${isDone ? " is-done" : ""}${
      task.id === lastToggledTaskId ? " just-toggled" : ""
    }`;
    item.innerHTML = `<span class="mountain-task-check">${isDone ? "✓" : ""}</span><span class="mountain-task-title"></span>`;
    item.querySelector(".mountain-task-title").textContent = task.title;
    item.addEventListener("click", () => toggleTaskDone(task.id));
    taskListEl.appendChild(item);
  });

  if (mountainWidgetInitialized && totalCount > 0 && percent >= 100 && lastMountainPercent < 100) {
    spawnConfetti(widgetEl);
  }
  lastMountainPercent = percent;
  mountainWidgetInitialized = true;
}

/* ---------- 7d. REALITY-CHECK - Thực tế vs Kế hoạch, cảnh báo quá hạn ---------- */

function renderRealityCheck() {
  const totalEl = $("rcTotalCount");
  const doneEl = $("rcDoneCount");
  const overdueEl = $("rcOverdueCount");
  const alertBox = $("rcAlertBox");
  const alertText = $("rcAlertText");
  if (!totalEl || !doneEl || !overdueEl || !alertBox || !alertText) return;

  const currentMonthTasks = getAllTasks().filter((task) => {
    const d = new Date(`${task.date}T00:00:00`);
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  });

  const doneCount = currentMonthTasks.filter((task) => DONE_TASK_IDS.has(task.id)).length;
  const overdueTasks = currentMonthTasks.filter((task) => {
    if (DONE_TASK_IDS.has(task.id)) return false;
    return new Date(`${task.date}T00:00:00`) < TODAY;
  });

  animateCountUp(totalEl, currentMonthTasks.length);
  animateCountUp(doneEl, doneCount);
  animateCountUp(overdueEl, overdueTasks.length);

  if (overdueTasks.length === 0) {
    alertBox.classList.add("hidden");
    return;
  }

  alertBox.classList.remove("hidden");
  alertText.textContent = overdueTasks
    .map((task) => {
      const diffDays = Math.round((TODAY - new Date(`${task.date}T00:00:00`)) / 86400000);
      return `・${task.title}（${diffDays}日超過）`;
    })
    .join("\n");
}

/* ---------- 7e. GREETING MODAL - Chào hỏi đầu ngày (chỉ hiện 1 lần/ngày) ---------- */

const LAST_GREETED_STORAGE_KEY = "brseCopilotLastGreetedDate";

function buildGreetingHeadline() {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます！";
  if (hour < 18) return "こんにちは！";
  return "お疲れ様です！";
}

function checkAndShowDailyGreeting() {
  const todayKey = toDateKey(TODAY);
  if (localStorage.getItem(LAST_GREETED_STORAGE_KEY) === todayKey) return;

  const todayTaskCount = getAllTasks().filter((task) => task.date === todayKey).length;
  const headlineEl = $("greetingHeadline");
  const textEl = $("greetingText");
  const modal = $("greetingModal");
  if (!headlineEl || !textEl || !modal) return;

  headlineEl.textContent = buildGreetingHeadline();
  textEl.textContent =
    todayTaskCount === 0
      ? "本日期日のタスクはありません。個人目標の達成に時間を使いましょう！"
      : `本日は期日のタスクが${todayTaskCount}件あります。一緒に頑張りましょう！`;

  modal.classList.remove("hidden");
  localStorage.setItem(LAST_GREETED_STORAGE_KEY, todayKey);
}

function closeGreetingModal() {
  const modal = $("greetingModal");
  if (modal) modal.classList.add("hidden");
}

/* ---------- 8. RIGHT PANEL: AI AGENT COMMAND CENTER (timeline + chat) ---------- */

function clearAgentFeedEmptyState() {
  const empty = $("agentFeedEmpty");
  if (empty) empty.remove();
}

// Thêm 1 dòng "quá trình suy nghĩ" của AI vào timeline (ví dụ: "カレンダーを読み込み中...")
function appendTimelineStep(text, icon) {
  clearAgentFeedEmptyState();
  const feed = $("agentFeed");
  if (!feed) return null;

  const el = document.createElement("div");
  el.className = "agent-timeline-step is-processing";
  el.innerHTML = `<i class="${icon}"></i><span></span>`;
  el.querySelector("span").textContent = text;
  feed.appendChild(el);
  feed.scrollTop = feed.scrollHeight;
  return el;
}

// Chạy tuần tự nhiều bước timeline (giả lập quá trình suy nghĩ của AI Agent), mỗi bước có delay
// ngắn để tạo cảm giác "đang xử lý" trước khi có kết quả thật từ backend.
async function runTimelineSteps(steps) {
  for (const step of steps) {
    const el = appendTimelineStep(step.text, step.icon);
    await sleep(500);
    if (el) {
      el.classList.remove("is-processing");
      el.classList.add("is-done");
      const iconEl = el.querySelector("i");
      if (iconEl) iconEl.className = "fa-solid fa-check";
    }
  }
}

// Thêm 1 bong bóng chat (role: 'user' | 'ai') vào Command Center, có thể kèm 1 nút hành động
// (ví dụ "PMへ相談メールを送る") để tái sử dụng luồng Gmail deep-link/Slack toast hiện có.
function appendChatBubble(role, text, options = {}) {
  clearAgentFeedEmptyState();
  const feed = $("agentFeed");
  if (!feed) return;

  const bubble = document.createElement("div");
  bubble.className = `agent-bubble agent-bubble-${role}${options.isError ? " is-error" : ""}`;

  const textEl = document.createElement("div");
  textEl.textContent = text; // AIが生成した文章は信頼せず textContent で描画（XSS対策）
  bubble.appendChild(textEl);

  if (options.actionLabel && typeof options.onAction === "function") {
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "agent-bubble-action-btn";
    actionBtn.textContent = options.actionLabel;
    actionBtn.addEventListener("click", () => {
      actionBtn.disabled = true;
      options.onAction();
    });
    bubble.appendChild(actionBtn);
  }

  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
}

// Áp dụng đề xuất dời lịch của AI (RebalancedTaskDto[]) lên Calendar: mỗi task được rời khỏi
// Backlog và thêm thành 1 block "học tập/đề xuất AI" (màu xanh mint) tại ngày mới đề xuất.
function applyRebalancedTasks(rebalancedTasks) {
  if (!Array.isArray(rebalancedTasks) || rebalancedTasks.length === 0) return;

  let appliedCount = 0;
  rebalancedTasks.forEach((item) => {
    const task = BACKLOG_TASKS.find((t) => t.id === item.taskId);
    if (!task || !item.newDueDate) return;

    SCHEDULED_EVENTS.push({
      id: `ai-${task.id}-${Date.now()}`,
      taskId: task.id,
      title: `🤖 ${task.title}`,
      start: item.newDueDate,
      end: null,
      allDay: true,
      category: "learning",
      isAiNew: true,
    });
    BACKLOG_TASKS = BACKLOG_TASKS.filter((t) => t.id !== task.id);
    appliedCount += 1;
  });

  if (appliedCount === 0) return;

  saveScheduledEvents();
  renderBacklog();
  refreshCalendarEvents();
  renderMountainWidget();
  renderRealityCheck();

  // Sau vài giây, bỏ hiệu ứng "vừa thêm" để Calendar trở lại trạng thái bình thường.
  setTimeout(() => {
    let changed = false;
    SCHEDULED_EVENTS.forEach((e) => {
      if (e.isAiNew) {
        e.isAiNew = false;
        changed = true;
      }
    });
    if (changed) {
      saveScheduledEvents();
      refreshCalendarEvents();
    }
  }, 3000);
}

// Nút "✨ AI自動スケジューリング" (toolbar Calendar) và chip "⚖️ 自動リスケジュール" (Command Center)
// dùng chung 1 luồng: gọi thật /api/v1/copilot/analyze-schedule với các task tồn đọng trong Backlog.
async function runAiAutoSchedule(buttonEl) {
  const triggerButtons = [$("btnAiAutoSchedule"), $("btnQuickRebalance")].filter(Boolean);
  if (triggerButtons.some((b) => b.disabled)) return;

  if (BACKLOG_TASKS.length === 0) {
    showToast("🎉 完了", "積み残しタスクがありません。素晴らしい進捗です！", "success");
    return;
  }

  const originalHtmlMap = new Map(triggerButtons.map((b) => [b, b.innerHTML]));
  triggerButtons.forEach((b) => {
    b.disabled = true;
  });
  if (buttonEl) buttonEl.innerHTML = "⏳ 実行中...";

  appendChatBubble("user", "✨ AI自動スケジューリングを実行");
  await runTimelineSteps([
    { icon: "fa-solid fa-calendar-days", text: "カレンダーとタスクを読み込み中..." },
    { icon: "fa-solid fa-magnifying-glass", text: "遅延タスクを分析中..." },
    { icon: "fa-solid fa-robot", text: "AIが再スケジュール案を作成中..." },
  ]);

  try {
    const tasksPayload = BACKLOG_TASKS.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate }));
    const result = await postJson("/api/v1/copilot/analyze-schedule", { tasks: tasksPayload });

    applyRebalancedTasks(result.rebalancedTasks || []);
    appendChatBubble("ai", result.findingsSummary || "遅延タスクは検出されませんでした。", {
      actionLabel: result.draftEmailBody ? "📧 PMへ相談メールを送る" : null,
      onAction: result.draftEmailBody
        ? () => {
            openGmailDeepLink("pm@company.co.jp", "【相談】スケジュール調整のご相談", result.draftEmailBody);
            showToast("📧 Gmail作成完了", "PMへスケジュール相談メールを下書きしました。", "success");
          }
        : null,
    });
    showToast("✅ 完了", "AIによるスケジュール再調整が完了しました。", "success");
  } catch (err) {
    appendChatBubble("ai", `⚠️ ${err.message}`, { isError: true });
    notifyAiFailure(err);
  } finally {
    triggerButtons.forEach((b) => {
      b.disabled = false;
      b.innerHTML = originalHtmlMap.get(b);
    });
  }
}

// Chip "🆘 緊急SOS" (Command Center) - gọi thật /api/v1/copilot/sos-alert với 1 ví dụ minh hoạ
// (giống dữ liệu demo trước đây: file đang dở dang + thời gian kẹt logic).
async function runQuickSos(buttonEl) {
  if (!buttonEl || buttonEl.disabled) return;
  const originalHtml = buttonEl.innerHTML;
  buttonEl.disabled = true;
  buttonEl.innerHTML = "⏳ 分析中...";

  appendChatBubble("user", "🆘 緊急SOSを実行");
  await runTimelineSteps([
    { icon: "fa-solid fa-file-code", text: "停滞中のファイルを検知中..." },
    { icon: "fa-solid fa-robot", text: "AIがSOSメッセージを作成中..." },
  ]);

  try {
    const result = await postJson("/api/v1/copilot/sos-alert", {
      fileName: "PremiumCalculator.java",
      stuckMinutes: 180,
    });

    const message = [result.alertMessage, result.slackMessageDraft].filter(Boolean).join("\n\n");
    appendChatBubble("ai", message || "停滞は検出されませんでした。", {
      actionLabel: result.slackMessageDraft ? "🆘 先輩へSlackで送信" : null,
      onAction: result.slackMessageDraft
        ? () => showToast("🆘 Slack送信完了", "先輩へSOSメッセージを送信しました。", "success")
        : null,
    });
  } catch (err) {
    appendChatBubble("ai", `⚠️ ${err.message}`, { isError: true });
    notifyAiFailure(err);
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
  }
}

// Ô chat tự do ở dưới Command Center: tái sử dụng nghiệp vụ Auto-Rebalance (endpoint AI duy nhất
// phù hợp cho câu hỏi kiểu "hãy sắp xếp giúp tôi lịch tuần này"), hiển thị đúng câu người dùng gõ.
function handleAgentInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendAgentChatMessage();
  }
}

async function sendAgentChatMessage() {
  const input = $("agentChatInput");
  const sendBtn = $("btnAgentSend");
  if (!input || !sendBtn || sendBtn.disabled) return;

  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  appendChatBubble("user", text);

  if (BACKLOG_TASKS.length === 0) {
    appendChatBubble(
      "ai",
      "現在、積み残しタスクはありません。素晴らしい進捗です！新しいタスクが追加されたら、またお声がけください。"
    );
    return;
  }

  sendBtn.disabled = true;
  await runTimelineSteps([
    { icon: "fa-solid fa-calendar-days", text: "カレンダーとタスクを読み込み中..." },
    { icon: "fa-solid fa-robot", text: "AIが最適なプランを検討中..." },
  ]);

  try {
    const tasksPayload = BACKLOG_TASKS.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate }));
    const result = await postJson("/api/v1/copilot/analyze-schedule", { tasks: tasksPayload });
    applyRebalancedTasks(result.rebalancedTasks || []);
    appendChatBubble("ai", result.findingsSummary || "現在、緊急の遅延タスクはありません。");
  } catch (err) {
    appendChatBubble("ai", `⚠️ ${err.message}`, { isError: true });
    notifyAiFailure(err);
  } finally {
    sendBtn.disabled = false;
  }
}

/* ---------- 9. TAB "日報作成" (gọi API thật) ---------- */
async function generateNippoReport() {
  const input = $("nippoLogInput");
  const output = $("nippoOutput");
  const btn = $("btnGenerateNippo");
  if (!input || !output || !btn) return;

  const rawLogs = input.value.trim();

  if (!rawLogs) {
    alert("作業ログを入力してください。");
    return;
  }
  if (rawLogs.length > 4000) {
    alert("作業ログは4000文字以内で入力してください。");
    return;
  }

  const originalLabel = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "🤖 生成中...";
  output.value = "";
  const originalPlaceholder = output.placeholder;
  output.placeholder = "AIが日報を生成しています...";

  try {
    const result = await postJson("/api/v1/copilot/generate-nippo", { rawLogs });
    output.value = result.nippoText || "";
  } catch (err) {
    notifyAiFailure(err);
  } finally {
    output.placeholder = originalPlaceholder;
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }
}

/* ---------- 10. TAB "オフショア支援": SPEC VS CODE + SHADOW CLIENT ---------- */

const OFFSHORE_UPLOADED_TEXT = { spec: null, code: null };

const OFFSHORE_CODE_EXTENSIONS = [
  ".java", ".js", ".jsx", ".ts", ".tsx", ".py", ".cs", ".go", ".rb", ".php",
  ".c", ".cpp", ".h", ".hpp", ".kt", ".swift", ".sql", ".xml", ".yml", ".yaml",
  ".json", ".html", ".css", ".md", ".txt",
];
const OFFSHORE_EXCLUDED_DIR_SEGMENTS = [
  "node_modules", ".git", "target", "build", "dist", ".idea", ".vscode",
  "venv", "__pycache__", ".gradle", "vendor", "coverage", ".next", "out",
];
const OFFSHORE_MAX_BATCH_FILES = 60;

function getRelativePath(file) {
  return file.webkitRelativePath && file.webkitRelativePath.length > 0
    ? file.webkitRelativePath
    : file.name;
}

function isOffshoreFileAllowed(file, kind) {
  const path = getRelativePath(file).toLowerCase();
  if (OFFSHORE_EXCLUDED_DIR_SEGMENTS.some((seg) => path.includes(`/${seg}/`) || path.startsWith(`${seg}/`))) {
    return false;
  }
  if (kind === "spec") {
    return [".pdf", ".txt", ".md"].some((ext) => path.endsWith(ext));
  }
  return OFFSHORE_CODE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

async function handleOffshoreFileSelect(inputEl, kind) {
  const statusEl = $(kind === "spec" ? "specFileStatus" : "codeFileStatus");
  const allFiles = inputEl.files ? Array.from(inputEl.files) : [];
  if (allFiles.length === 0) return;

  const filteredFiles = allFiles
    .filter((file) => isOffshoreFileAllowed(file, kind))
    .slice(0, OFFSHORE_MAX_BATCH_FILES);

  if (filteredFiles.length === 0) {
    if (statusEl) {
      statusEl.textContent = "⚠️ 対応する形式のファイルが見つかりませんでした。";
      statusEl.classList.add("is-error");
    }
    inputEl.value = "";
    return;
  }

  if (statusEl) {
    statusEl.textContent =
      filteredFiles.length === 1
        ? "⏳ ファイルを読み込み中..."
        : `⏳ ${filteredFiles.length}個のファイルを読み込み中...`;
    statusEl.classList.remove("is-loaded", "is-error");
  }

  try {
    let text;
    let statusMessage;

    if (filteredFiles.length === 1) {
      const formData = new FormData();
      formData.append("file", filteredFiles[0]);
      const result = await postFormData("/api/v1/files/extract-text", formData);
      text = result.text;
      statusMessage = `✅ ${result.originalFilename}（${result.text.length}文字${
        result.truncated ? "・切り捨て" : ""
      }）`;
    } else {
      const formData = new FormData();
      filteredFiles.forEach((file) => formData.append("files", file, getRelativePath(file)));
      const result = await postFormData("/api/v1/files/extract-text-batch", formData);
      text = result.text;
      statusMessage = `✅ ${result.includedFileCount}個のファイルを読み込みました（合計${
        result.text.length
      }文字${result.truncated ? "・切り捨て" : ""}）`;
    }

    OFFSHORE_UPLOADED_TEXT[kind] = text;
    if (statusEl) {
      statusEl.textContent = statusMessage;
      statusEl.classList.add("is-loaded");
    }
  } catch (err) {
    OFFSHORE_UPLOADED_TEXT[kind] = null;
    if (statusEl) {
      statusEl.textContent = `⚠️ ${err.message}`;
      statusEl.classList.add("is-error");
    }
    notifyAiFailure(err);
    inputEl.value = "";
  }
}

async function runSpecDiffReview() {
  const box = $("specDiffBox");
  const note = $("specDiffNote");
  const btn = $("btnRunSpecDiff");
  if (!box || !note || !btn) return;

  const originalLabel = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "🤖 AI分析中...";
  box.innerHTML = '<span class="ai-loading">🤖 AIが仕様書とコードを比較しています...</span>';
  note.textContent = "";

  try {
    const result = await postJson("/api/v1/copilot/review-offshore", {
      mode: "SPEC_DIFF",
      specText: OFFSHORE_UPLOADED_TEXT.spec || OFFSHORE_SPEC_SAMPLE.specText,
      codeText: OFFSHORE_UPLOADED_TEXT.code || OFFSHORE_SPEC_SAMPLE.codeText,
    });

    box.textContent = result.analysisText || "分析結果がありませんでした。";
    note.textContent = result.riskWarningText ? `⚠️ ${result.riskWarningText}` : "";
  } catch (err) {
    box.textContent = `⚠️ ${err.message}`;
    notifyAiFailure(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }
}

async function runShadowClientReview() {
  const input = $("rawQuestionInput");
  const btn = $("btnReviewQuestion");
  const resultBox = $("shadowResult");
  const draftText = $("shadowDraftText");
  const riskText = $("shadowRiskText");
  if (!input || !btn || !resultBox || !draftText || !riskText) return;

  const rawQuestion = input.value.trim();

  if (!rawQuestion) {
    alert("質問内容を入力してください。");
    return;
  }
  if (rawQuestion.length > 2000) {
    alert("質問内容は2000文字以内で入力してください。");
    return;
  }

  const originalLabel = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "🤖 AIが確認中...";

  try {
    const result = await postJson("/api/v1/copilot/review-offshore", {
      mode: "SHADOW_CLIENT",
      rawQuestion,
    });

    draftText.textContent = result.analysisText || "";
    riskText.textContent = result.riskWarningText || "";
    resultBox.classList.remove("hidden");
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    notifyAiFailure(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }
}

/* ---------- 11. GMAIL DEEP-LINK & CHỐNG SPAM CLICK ---------- */

function openGmailDeepLink(to, subject, bodyContent) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body: bodyContent,
  });
  window.open(`https://mail.google.com/mail/?${params.toString()}`, "_blank");
}

function handleSendAction(buttonEl, actionFn) {
  if (!buttonEl || buttonEl.disabled) return;

  const originalHtml = buttonEl.innerHTML;
  buttonEl.disabled = true;
  buttonEl.innerHTML = "⏳ 処理中...";

  setTimeout(() => {
    actionFn();
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
  }, 1000);
}

function sendNippoMail(buttonEl) {
  const content = $("nippoOutput")?.value.trim();
  if (!content) {
    alert("先に「AIで日報を自動作成」を実行してください。");
    return;
  }
  handleSendAction(buttonEl, () => {
    openGmailDeepLink("boss@company.co.jp", "【日報】本日の業務報告", content);
    showToast("📧 Gmail作成完了", "日報メールの下書きを新しいタブで開きました。", "success");
  });
}

function sendQAMail(buttonEl) {
  const content = $("shadowDraftText")?.textContent.trim();
  if (!content) {
    alert("先に「AIで確認・翻訳」を実行してください。");
    return;
  }
  handleSendAction(buttonEl, () => {
    openGmailDeepLink("customer@client.co.jp", "【確認事項】仕様に関するご質問", content);
    showToast("📧 Gmail作成完了", "お客様への確認メールを下書きしました。", "success");
  });
}

/* ---------- 12. TAB "MBO目標" - CHỈNH SỬA MỤC TIÊU INLINE (client-only) ---------- */
function editGoal(buttonEl) {
  const card = buttonEl.closest(".mbo-card");
  if (!card || card.classList.contains("is-editing")) return;

  const textEl = card.querySelector('[data-role="text"]');
  if (!textEl) return;

  const currentText = textEl.textContent.trim();
  card.classList.add("is-editing");

  const textarea = document.createElement("textarea");
  textarea.className = "mbo-edit-textarea";
  textarea.value = currentText;
  textEl.replaceWith(textarea);
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);

  const commitEdit = () => {
    const newTextEl = document.createElement("p");
    newTextEl.className = "mbo-text";
    newTextEl.dataset.role = "text";
    newTextEl.textContent = textarea.value.trim() || currentText;
    textarea.replaceWith(newTextEl);
    card.classList.remove("is-editing");
  };

  textarea.addEventListener("blur", commitEdit);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textarea.blur();
    }
  });
}

/* ---------- 13. INIT ---------- */
function renderTodayDate() {
  const el = $("sidebarDate");
  if (!el) return;
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  el.textContent = `${TODAY.getFullYear()}年${
    TODAY.getMonth() + 1
  }月${TODAY.getDate()}日（${weekdays[TODAY.getDay()]}）`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderTodayDate();
  renderBacklog();
  initFullCalendar();
  initBacklogDraggable();
  renderMountainWidget();
  renderRealityCheck();
  loadCalendarSettings();
  checkAndShowDailyGreeting();
});
