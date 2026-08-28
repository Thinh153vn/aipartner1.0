/* =========================================================
   BrSE Copilot - Dashboard quản lý dự án cho Kỹ sư Cầu nối
   File: assets/js/app.js
   Frontend gọi REST API thật của backend Spring Boot + Spring AI
   (cùng origin, không cần CORS). Calendar Task & MBO vẫn là state
   cục bộ vì không có endpoint tương ứng theo yêu cầu.
   ========================================================= */

/* ---------- 1. HELPER FUNCTIONS ---------- */

// Lấy nhanh phần tử theo id
function $(id) {
  return document.getElementById(id);
}

// Cộng/trừ số ngày vào 1 đối tượng Date, trả về Date mới
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

/* ---------- 2. MOCK DATA CỤC BỘ (Calendar Task) ----------
   Lưu ý: đây KHÔNG phải mock cho phản hồi AI - đây là danh sách Task hiển thị
   trên Calendar, không có endpoint CRUD nào được yêu cầu cho phần này nên vẫn
   giữ ở phía client. */
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const MOCK_DATA = {
  tasks: [
    { id: "t1", title: "保険料計算ロジック実装", date: toDateKey(addDays(TODAY, -1)) },
    { id: "t2", title: "解約返戻金計算ロジック調査", date: toDateKey(addDays(TODAY, -3)) },
    { id: "t3", title: "更新ロジック仕様書レビュー", date: toDateKey(addDays(TODAY, 1)) },
    { id: "t4", title: "契約者情報API仕様確認", date: toDateKey(addDays(TODAY, 2)) },
    { id: "t5", title: "単体テスト設計書作成", date: toDateKey(addDays(TODAY, 6)) },
    { id: "t6", title: "月次帳票出力機能テスト", date: toDateKey(addDays(TODAY, 9)) },
  ],
};

// Task lấy về từ Google Calendar sau khi bấm "🔄 Googleカレンダー同期" (state cục bộ,
// không lưu lại giữa các lần tải trang - mỗi lần sync sẽ thay thế toàn bộ danh sách này).
let GOOGLE_SYNCED_TASKS = [];

/* ---------- 2b. TRẠNG THÁI "ĐÃ HOÀN THÀNH" CỦA TASK (lưu localStorage) ----------
   Dùng chung cho: click tick trên task-pill của Calendar, checklist trong widget
   "leo núi", và card Reality-Check. Lưu theo taskId (không theo ngày) vì id của
   MOCK_DATA/Google Calendar là cố định. */
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

// Ghi nhớ task vừa được tick để phát hiệu ứng "pop" đúng vào đúng phần tử đó khi vẽ lại
// (Calendar/widget leo núi được render lại toàn bộ mỗi lần toggle nên cần biết target).
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
  buildCalendar();
  renderMountainWidget();
  renderRealityCheck();
}

// Hiệu ứng confetti ăn mừng khi hoàn thành 100% task hôm nay (leo lên đỉnh núi) - tăng
// độ "wow" khi demo tại hackathon.
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

// Hiệu ứng số đếm tăng dần (count-up) cho các số liệu thống kê - tạo cảm giác "sống" khi
// dữ liệu thay đổi, phù hợp cho phần trình diễn demo.
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

function getAllTasks() {
  return [...MOCK_DATA.tasks, ...GOOGLE_SYNCED_TASKS];
}

// Thu gọn/mở rộng 1 card (dùng cho các khối cài đặt ít dùng như Googleカレンダー連携設定)
// để giao diện chính gọn gàng, không rối mắt.
function toggleCollapse(cardId) {
  const card = $(cardId);
  if (card) card.classList.toggle("is-collapsed");
}

// Nội dung mẫu (Spec/Code) gửi cho API review-offshore ở chế độ SPEC_DIFF.
// Đây là dữ liệu đầu vào minh hoạ (không phải phản hồi AI), mô phỏng cặp
// Spec/Code hiện có trong dự án bảo hiểm.
const OFFSHORE_SPEC_SAMPLE = {
  specText: "第3.2節：保険料計算における成人の定義は「18歳以上」とする。",
  codeText: 'if (age >= 20) { applyAdultPremium(); }',
};

/* ---------- 3. API CLIENT (fetch thật, không còn setTimeout mock) ---------- */

const API_TIMEOUT_MS = 30000;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Gọi fetch tới backend với method bất kỳ (GET/POST/PUT), luôn ném ApiError với
 * message thân thiện khi thất bại (timeout, mất mạng, hoặc lỗi trả về từ
 * GlobalExceptionHandler phía Spring Boot). postJson/putJson/getJson bên dưới
 * chỉ là các hàm rút gọn dựa trên hàm này.
 */
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

/**
 * Upload 1 file (multipart/form-data) tới backend, dùng riêng cho tính năng trích xuất
 * text từ file (PDF/text) - KHÔNG dùng chung requestJson() vì không set JSON header/body.
 */
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

/* ---------- 4. TOAST NOTIFICATION (dùng chung, có thêm biến thể lỗi) ---------- */
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

// Hiển thị lỗi chung khi gọi AI thất bại (dùng ở nhiều nơi)
// err.message đã là câu tiếng Nhật thân thiện (từ ApiError - postJson() hoặc từ
// GlobalExceptionHandler phía backend), nên hiển thị trực tiếp không cần bọc thêm text.
function notifyAiFailure(err) {
  showToast("⚠️ エラー", err.message || "AIエージェントとの通信に失敗しました。", "error");
}

/* ---------- 5. ĐIỀU HƯỚNG TAB CHÍNH (Sidebar -> Main Content) ---------- */
// Right Panel (MBO) không bị ảnh hưởng bởi việc chuyển Tab.
function switchMainTab(tabName) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".main-tab").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `tab-${tabName}`);
  });
}

/* ---------- 6. TAB "QUẢN LÝ TIẾN ĐỘ": CALENDAR LƯỚI ---------- */

// Xác định trạng thái màu của Task dựa trên khoảng cách tới hạn (so với hôm nay)
function getTaskStatus(dateKey) {
  const taskDate = new Date(`${dateKey}T00:00:00`);
  const diffDays = Math.round((taskDate - TODAY) / 86400000);

  if (diffDays < 0) return "coral"; // đã trễ hạn
  if (diffDays <= 2) return "warning"; // sắp đến hạn (trong 2 ngày tới)
  return "mint"; // hạn còn dài
}

// Dựng Calendar lưới cho tháng hiện tại, gắn Task (pill màu) vào đúng ngày
function buildCalendar() {
  const grid = $("calendarGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];
  weekdayLabels.forEach((label) => {
    const el = document.createElement("div");
    el.className = "calendar-weekday";
    el.textContent = label;
    grid.appendChild(el);
  });

  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startWeekday; i += 1) {
    const empty = document.createElement("div");
    empty.className = "calendar-cell is-empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    if (day === TODAY.getDate()) cell.classList.add("is-today");

    const dateLabel = document.createElement("span");
    dateLabel.className = "calendar-date";
    dateLabel.textContent = day;
    cell.appendChild(dateLabel);

    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    getAllTasks()
      .filter((task) => task.date === dateKey)
      .forEach((task) => {
        const isFromGoogle = task.source === "google";
        const isDone = DONE_TASK_IDS.has(task.id);
        const pill = document.createElement("div");
        pill.className = `task-pill status-${getTaskStatus(task.date)}${
          isFromGoogle ? " task-pill-google" : ""
        }${isDone ? " is-done" : ""}${task.id === lastToggledTaskId ? " just-toggled" : ""}`;
        pill.textContent = `${isDone ? "✓ " : isFromGoogle ? "📅 " : ""}${task.title}`;
        pill.title = `${task.title}（クリックで完了/未完了を切り替え）`;
        pill.addEventListener("click", () => toggleTaskDone(task.id));
        cell.appendChild(pill);
      });

    grid.appendChild(cell);
  }
}

/* ---------- 6b. GOOGLE CALENDAR 連携（設定の読込・保存・同期） ---------- */

// Đọc trạng thái cấu hình hiện tại từ backend, đổ vào ô CalendarID + cập nhật dòng trạng thái.
// Gọi 1 lần khi tải trang; lỗi ở đây bị bỏ qua âm thầm để không làm phiền user ngay khi mở app.
async function loadCalendarSettings() {
  const statusEl = $("gcalStatusText");
  const idInput = $("gcalCalendarIdInput");
  try {
    const settings = await getJson("/api/v1/calendar/settings");
    if (idInput && settings.calendarId) idInput.value = settings.calendarId;

    if (statusEl) {
      const isConfigured = Boolean(settings.calendarId) && settings.apiKeyConfigured;
      statusEl.textContent = isConfigured
        ? "✅ 設定済みです。「Googleカレンダー同期」ボタンで最新の予定を取り込めます。"
        : "⚠️ 未設定です。カレンダーIDとAPIキーを登録してください。";
      statusEl.classList.toggle("is-configured", isConfigured);
      statusEl.classList.toggle("is-missing", !isConfigured);
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ 設定状態を取得できませんでした。";
  }
}

// Nút "💾 設定を保存" - lưu CalendarID/APIKey vào file cấu hình cục bộ của backend.
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
    if (apiKeyInput) apiKeyInput.value = ""; // Không giữ lại APIキー đã nhập trên màn hình vì lý do bảo mật.
    showToast("✅ 保存完了", "Googleカレンダーの連携設定を保存しました。", "success");
    await loadCalendarSettings();
  } catch (err) {
    notifyAiFailure(err);
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
  }
}

// Nút "🔄 Googleカレンダー同期" - gọi backend lấy toàn bộ event (±1 tháng quanh hôm nay)
// và tự động gắn vào Calendar lưới dưới dạng Task, không cần người dùng nhập tay lại.
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
    buildCalendar();
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

/* ---------- 6c. WIDGET "LEO NÚI" - Mục tiêu hằng ngày (gamification) ---------- */

// Theo dõi % trước đó để chỉ bắn confetti đúng lúc "vừa mới" lên tới 100% (không lặp lại
// mỗi lần render nếu trạng thái không đổi, và không bắn ngay khi mới load trang).
let lastMountainPercent = -1;
let mountainWidgetInitialized = false;

// Vẽ lại vị trí nhân vật trên núi + danh sách task hôm nay dựa trên % hoàn thành.
function renderMountainWidget() {
  const mascotEl = $("mountainMascot");
  const progressText = $("mountainProgressText");
  const taskListEl = $("mountainTaskList");
  const widgetEl = $("mountainWidget");
  if (!mascotEl || !progressText || !taskListEl || !widgetEl) return;

  const todayKey = toDateKey(TODAY);
  const todayTasks = getAllTasks().filter((task) => task.date === todayKey);
  const doneCount = todayTasks.filter((task) => DONE_TASK_IDS.has(task.id)).length;
  const totalCount = todayTasks.length;
  // Không có task hôm nay -> coi như đã "lên đỉnh" (100%) để khích lệ, không phải vì trễ hạn.
  const percent = totalCount === 0 ? 100 : Math.round((doneCount / totalCount) * 100);

  // Nội suy vị trí trên đường chéo trái của ngọn núi (tam giác đỉnh (150,10), đáy (0,140)).
  const x = 150 * (percent / 100);
  const y = 140 - 130 * (percent / 100);
  mascotEl.style.left = `${(x / 300) * 100}%`;
  mascotEl.style.top = `${(y / 140) * 100}%`;

  widgetEl.classList.toggle("is-summit", percent >= 100 && totalCount > 0);

  progressText.textContent =
    totalCount === 0
      ? "本日期日のタスクはありません。素晴らしい一日を！"
      : `本日期日のタスク: ${doneCount}/${totalCount} 完了（${percent}%）`;

  taskListEl.innerHTML = "";
  todayTasks.forEach((task) => {
    const isDone = DONE_TASK_IDS.has(task.id);
    const item = document.createElement("div");
    item.className = `mountain-task-item${isDone ? " is-done" : ""}${
      task.id === lastToggledTaskId ? " just-toggled" : ""
    }`;
    item.innerHTML = `<span class="mountain-task-check">${isDone ? "✓" : ""}</span><span class="mountain-task-title"></span>`;
    item.querySelector(".mountain-task-title").textContent = task.title; // textContent để tránh XSS
    item.addEventListener("click", () => toggleTaskDone(task.id));
    taskListEl.appendChild(item);
  });

  // Vừa đạt 100% (không phải trạng thái mặc định "không có task") -> bắn confetti ăn mừng.
  if (mountainWidgetInitialized && totalCount > 0 && percent >= 100 && lastMountainPercent < 100) {
    spawnConfetti(widgetEl);
  }
  lastMountainPercent = percent;
  mountainWidgetInitialized = true;
}

/* ---------- 6d. REALITY-CHECK CARD - Thực tế vs Kế hoạch, cảnh báo quá hạn ---------- */

// Tính toán hoàn toàn phía client dựa trên task hiện có (không gọi AI) để phản hồi ngay lập tức.
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

/* ---------- 6e. GREETING MODAL - Chào hỏi đầu ngày (chỉ hiện 1 lần/ngày) ---------- */

const LAST_GREETED_STORAGE_KEY = "brseCopilotLastGreetedDate";

function buildGreetingHeadline() {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます！";
  if (hour < 18) return "こんにちは！";
  return "お疲れ様です！";
}

function checkAndShowDailyGreeting() {
  const todayKey = toDateKey(TODAY);
  if (localStorage.getItem(LAST_GREETED_STORAGE_KEY) === todayKey) return; // đã chào hôm nay rồi

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

/* ---------- 7. TAB "BÁO CÁO NIPPO" (gọi API thật) ---------- */
async function generateNippoReport() {
  const input = $("nippoLogInput");
  const output = $("nippoOutput");
  const btn = $("btnGenerateNippo");
  if (!input || !output || !btn) return;

  const rawLogs = input.value.trim();

  // Edge case 1: input rỗng -> chặn ngay ở client, không gọi API
  if (!rawLogs) {
    alert("作業ログを入力してください。");
    return;
  }
  // Edge case 2: input quá dài -> chặn ở client trước khi backend từ chối (400)
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

/* ---------- 8. TAB "TRỢ LÝ OFFSHORE": SPEC VS CODE + SHADOW CLIENT ---------- */

// Text đã trích xuất từ file người dùng upload (spec/code). null = chưa upload -> dùng sample.
const OFFSHORE_UPLOADED_TEXT = { spec: null, code: null };

// Đuôi file được coi là "code/text" hợp lệ khi upload cả 1 thư mục project.
const OFFSHORE_CODE_EXTENSIONS = [
  ".java", ".js", ".jsx", ".ts", ".tsx", ".py", ".cs", ".go", ".rb", ".php",
  ".c", ".cpp", ".h", ".hpp", ".kt", ".swift", ".sql", ".xml", ".yml", ".yaml",
  ".json", ".html", ".css", ".md", ".txt",
];
// Thư mục nặng/không liên quan tới logic nghiệp vụ -> loại bỏ khi chọn cả thư mục project
// (tránh upload thừa node_modules, .git, build output... vừa chậm vừa không cần thiết cho AI).
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

// Xử lý khi người dùng chọn file(s) (仕様書 hoặc コード, có thể chọn cả 1 thư mục project) -
// gọi backend trích xuất text (PDF dùng PDFBox, file khác đọc thẳng dạng text), lưu lại để
// dùng khi bấm "AIで比較する". 1 file -> gọi API đơn; nhiều file -> gọi API batch (ghép nội dung).
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

    // Render bằng textContent (không dùng innerHTML) vì đây là nội dung do AI sinh ra,
    // không tin cậy tuyệt đối -> tránh XSS.
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

/* ---------- 9. MODAL: AI PHÂN TÍCH & ĐỀ XUẤT (3 pane, mỗi pane gọi API riêng) ---------- */

// Lưu lại kết quả AI cho từng pane để nút Gửi Mail/Slack dùng lại, và để biết pane
// nào đã load thành công (nếu lỗi, loaded vẫn là false -> tự động thử lại khi mở lại pane).
const modalState = {
  rebalance: { loaded: false, draftEmailBody: "" },
  sos: { loaded: false, slackMessageDraft: "" },
  nippo: { loaded: false, nippoText: "" },
};

function openAiModal() {
  const modal = $("aiModal");
  if (modal) modal.classList.remove("hidden");
  if (!modalState.rebalance.loaded) loadRebalancePane();
}

function closeAiModal() {
  const modal = $("aiModal");
  if (modal) modal.classList.add("hidden");
}

// Chuyển giữa 3 chức năng bên trong Modal: Auto-Rebalance / Auto SOS / Git to Nippo
function switchModalPane(paneId, btnEl) {
  document.querySelectorAll(".modal-tab").forEach((btn) => {
    btn.classList.remove("is-active");
  });
  if (btnEl) btnEl.classList.add("is-active");

  document.querySelectorAll(".modal-pane").forEach((pane) => {
    pane.classList.toggle("is-active", pane.id === `pane-${paneId}`);
  });

  if (paneId === "sos" && !modalState.sos.loaded) loadSosPane();
  if (paneId === "nippo" && !modalState.nippo.loaded) loadNippoPane();
}

// Đóng Modal khi click ra ngoài vùng modal-box (click trúng overlay)
function initModalOutsideClick() {
  const overlay = $("aiModal");
  if (!overlay) return;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAiModal();
  });
}

async function loadRebalancePane() {
  const box = $("rebalanceFindingBox");
  const btn = $("btnRebalanceMail");
  if (!box) return;

  box.innerHTML = '<span class="ai-loading">🤖 AIがWBSを分析中です...</span>';
  if (btn) btn.disabled = true;

  try {
    const tasksPayload = MOCK_DATA.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.date,
    }));

    const result = await postJson("/api/v1/copilot/analyze-schedule", { tasks: tasksPayload });

    box.textContent = result.findingsSummary || "遅延タスクは検出されませんでした。";
    modalState.rebalance.loaded = true;
    modalState.rebalance.draftEmailBody = result.draftEmailBody || "";
    if (btn) btn.disabled = !modalState.rebalance.draftEmailBody;
  } catch (err) {
    box.textContent = `⚠️ ${err.message}`;
    notifyAiFailure(err);
  }
}

async function loadSosPane() {
  const findingBox = $("sosFindingBox");
  const messageBox = $("sosMessageBox");
  const btn = $("btnSosSlack");
  if (!findingBox || !messageBox) return;

  findingBox.innerHTML = '<span class="ai-loading">🤖 AIが分析中です...</span>';
  messageBox.textContent = "—";
  if (btn) btn.disabled = true;

  try {
    const result = await postJson("/api/v1/copilot/sos-alert", {
      fileName: "PremiumCalculator.java",
      stuckMinutes: 180,
    });

    findingBox.textContent = result.alertMessage || "";
    messageBox.textContent = result.slackMessageDraft || "";
    modalState.sos.loaded = true;
    modalState.sos.slackMessageDraft = result.slackMessageDraft || "";
    if (btn) btn.disabled = !modalState.sos.slackMessageDraft;
  } catch (err) {
    findingBox.textContent = `⚠️ ${err.message}`;
    notifyAiFailure(err);
  }
}

async function loadNippoPane() {
  const messageBox = $("modalNippoMessageBox");
  const btn = $("btnModalNippoMail");
  if (!messageBox) return;

  messageBox.innerHTML = '<span class="ai-loading">🤖 AIが日報を作成中です...</span>';
  if (btn) btn.disabled = true;

  try {
    const result = await postJson("/api/v1/copilot/generate-nippo", {
      rawLogs: 'git commit -m "feat: 保険料計算ロジック（PremiumCalculator.java）の実装"',
    });

    messageBox.textContent = result.nippoText || "";
    modalState.nippo.loaded = true;
    modalState.nippo.nippoText = result.nippoText || "";
    if (btn) btn.disabled = !modalState.nippo.nippoText;
  } catch (err) {
    messageBox.textContent = `⚠️ ${err.message}`;
    notifyAiFailure(err);
  }
}

/* ---------- 10. GMAIL DEEP-LINK & CHỐNG SPAM CLICK ---------- */

// Mở cửa sổ soạn Gmail mới với nội dung được điền sẵn
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

/**
 * Bọc logic chống Spam Click cho các nút gửi mail/Slack:
 * disable nút -> hiện "Đang xử lý..." -> delay 1s (giả lập UX xác nhận) -> thực thi hành động -> phục hồi nút.
 */
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

// Nút "📧 Gửi Báo cáo cho Sếp (Gmail)" - Tab Nippo
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

// Nút "📧 Gửi Q&A cho Khách hàng (Gmail)" - Tab Offshore
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

// Nút "📧 Gửi xin phép PM (Gmail)" - Modal Auto-Rebalance
function sendRebalanceMail(buttonEl) {
  if (!modalState.rebalance.draftEmailBody) {
    alert("AIの分析が完了していません。しばらくしてから再度お試しください。");
    return;
  }
  handleSendAction(buttonEl, () => {
    openGmailDeepLink(
      "pm@company.co.jp",
      "【相談】スケジュール調整のご相談",
      modalState.rebalance.draftEmailBody
    );
    showToast("📧 Gmail作成完了", "PMへスケジュール相談メールを下書きしました。", "success");
  });
}

// Nút "🆘 Gửi cầu cứu Senior (Slack)" - Modal Auto SOS
function sendSosSlack(buttonEl) {
  if (!modalState.sos.slackMessageDraft) {
    alert("AIの分析が完了していません。しばらくしてから再度お試しください。");
    return;
  }
  handleSendAction(buttonEl, () => {
    showToast(
      "🆘 Slack送信完了",
      "先輩へSOSメッセージを送信しました：" + modalState.sos.slackMessageDraft,
      "success"
    );
  });
}

// Nút "📧 Gửi Báo cáo (Gmail)" - Modal Git to Nippo
function sendModalNippoMail(buttonEl) {
  if (!modalState.nippo.nippoText) {
    alert("AIの分析が完了していません。しばらくしてから再度お試しください。");
    return;
  }
  handleSendAction(buttonEl, () => {
    openGmailDeepLink("boss@company.co.jp", "【日報】本日の業務報告", modalState.nippo.nippoText);
    showToast("📧 Gmail作成完了", "Gitログから生成した日報を下書きしました。", "success");
  });
}

/* ---------- 11. RIGHT PANEL: MBO - CHỈNH SỬA MỤC TIÊU INLINE (không đổi, client-only) ---------- */
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

/* ---------- 12. INIT ---------- */
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
  buildCalendar();
  renderMountainWidget();
  renderRealityCheck();
  loadCalendarSettings();
  initModalOutsideClick();
  checkAndShowDailyGreeting();
});
