/* =========================================================
   AI PARTNER - Calendar-Centric SaaS Workspace
   File: assets/js/app.js
   Frontend gọi REST API thật của backend Spring Boot + Spring AI
   (cùng origin, không cần CORS). Project/Task vẫn là state cục bộ
   (localStorage) vì không có endpoint CRUD tương ứng.
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

// Định dạng dung lượng file dễ đọc (dùng cho UI xử lý file lớn, WBS/Offshore import).
function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const PRIORITY_LABELS = { high: "高", medium: "中", low: "低" };

/* ---------- 2. MOCK DATA CỤC BỘ (Project WBS / Task / Meeting) ----------
   Đây KHÔNG phải mock cho phản hồi AI - đây là dữ liệu Project/Task hiển thị
   trên Sidebar/Center/Right Panel, không có endpoint CRUD nào được yêu cầu
   cho phần này nên vẫn giữ ở phía client. */

const PROJECTS_SEED = [
  { id: "proj1", name: "保険システム開発（新契約）", color: "#4d8fe8" },
  { id: "proj2", name: "契約更新機能改修", color: "#45b994" },
  { id: "proj3", name: "個人成長目標（MBO）", color: "#f5b74f" },
];

/* ---------- 2a. PROJECT DO NGƯỜI DÙNG THÊM (➕ 新規追加) - lưu localStorage ---------- */
const USER_PROJECTS_STORAGE_KEY = "brseCopilotUserProjects";

function loadUserProjects() {
  try {
    const raw = localStorage.getItem(USER_PROJECTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveUserProjects() {
  localStorage.setItem(USER_PROJECTS_STORAGE_KEY, JSON.stringify(USER_ADDED_PROJECTS));
}

let USER_ADDED_PROJECTS = loadUserProjects();

function getAllProjects() {
  return [...PROJECTS_SEED, ...USER_ADDED_PROJECTS];
}

const TASKS_SEED = [
  { id: "t1", projectId: "proj1", title: "保険料計算ロジックの実装", priority: "high", dueDate: toDateKey(addDays(TODAY, -1)), category: "work" },
  { id: "t2", projectId: "proj1", title: "解約返戻金計算ロジックの調査", priority: "medium", dueDate: toDateKey(addDays(TODAY, -3)), category: "work" },
  { id: "t3", projectId: "proj1", title: "更新ロジック仕様書レビュー", priority: "high", dueDate: toDateKey(TODAY), category: "work" },
  { id: "t4", projectId: "proj2", title: "契約者情報API仕様確認", priority: "medium", dueDate: toDateKey(addDays(TODAY, 1)), category: "work" },
  { id: "t5", projectId: "proj2", title: "単体テスト設計書作成", priority: "low", dueDate: toDateKey(addDays(TODAY, 4)), category: "work" },
  { id: "t6", projectId: "proj3", title: "Spring Boot設計パターンを学ぶ（短期目標）", priority: "low", dueDate: toDateKey(TODAY), category: "learning", memo: "個人目標：デザインパターンを1つずつ実装し、レビューで説明できるようにする。", subtasks: [] },
  { id: "t7", projectId: "proj3", title: "更新ロジックのQ&Aを自走でこなす（中期目標）", priority: "medium", dueDate: toDateKey(addDays(TODAY, 20)), category: "learning" },
];

// Sự kiện họp/công việc cố định - chỉ hiển thị trên Calendar (không phải Task nên không có checkbox).
const FIXED_MEETINGS = [
  { id: "mt1", title: "🗣 朝会（デイリースクラム）", start: `${toDateKey(TODAY)}T09:30:00`, end: `${toDateKey(TODAY)}T09:45:00` },
  { id: "mt2", title: "🧑‍🏫 PMとの1on1", start: `${toDateKey(addDays(TODAY, 2))}T16:00:00`, end: `${toDateKey(addDays(TODAY, 2))}T16:30:00` },
];

// Task lấy về từ Google Calendar sau khi bấm "Google同期" (state cục bộ, thay thế mỗi lần sync)
let GOOGLE_SYNCED_TASKS = [];

/* ---------- 2b. TASK DO NGƯỜI DÙNG THÊM (➕ タスク追加) - lưu localStorage ---------- */
const USER_TASKS_STORAGE_KEY = "brseCopilotUserTasks";

function loadUserTasks() {
  try {
    const raw = localStorage.getItem(USER_TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveUserTasks() {
  localStorage.setItem(USER_TASKS_STORAGE_KEY, JSON.stringify(USER_ADDED_TASKS));
}

let USER_ADDED_TASKS = loadUserTasks();

/* ---------- 2c. TRẠNG THÁI "ĐÃ HOÀN THÀNH" CỦA TASK (lưu localStorage) ---------- */
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

// Ghi nhớ task vừa được tick để phát hiệu ứng "bounce" đúng vào đúng phần tử đó khi vẽ lại.
let lastToggledTaskId = null;

// ID của các task vừa được AI dời lịch (hiệu ứng pulse tạm thời trên Calendar, không cần persist).
let AI_NEW_TASK_IDS = new Set();

/* ---------- 2d. TASK HELPERS (dùng chung cho Sidebar/Center/Right Panel) ---------- */

function getAllTasksCombined() {
  return [...TASKS_SEED, ...USER_ADDED_TASKS, ...GOOGLE_SYNCED_TASKS].map(applyTaskOverrides);
}

function isTaskDone(task) {
  return DONE_TASK_IDS.has(task.id);
}

function isTaskOverdue(task) {
  return !isTaskDone(task) && task.dueDate < toDateKey(TODAY);
}

function getOverdueTasks() {
  return getAllTasksCombined().filter((task) => isTaskOverdue(task));
}

// Nếu task đến từ danh sách người dùng tự thêm -> lưu lại localStorage sau khi sửa đổi
// (task mock/Google Calendar không cần persist vì chỉ tồn tại trong phiên hiện tại).
function persistIfUserTask(task) {
  if (USER_ADDED_TASKS.some((t) => t.id === task.id)) {
    saveUserTasks();
    return;
  }
  persistSeedTaskOverride(task);
}

const TASK_OVERRIDES_STORAGE_KEY = "brseCopilotTaskOverrides";

function loadTaskOverrides() {
  try {
    const raw = localStorage.getItem(TASK_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveTaskOverrides() {
  localStorage.setItem(TASK_OVERRIDES_STORAGE_KEY, JSON.stringify(TASK_OVERRIDES));
}

let TASK_OVERRIDES = loadTaskOverrides();

function persistSeedTaskOverride(task) {
  TASK_OVERRIDES[task.id] = {
    title: task.title,
    dueDate: task.dueDate,
    priority: task.priority,
    memo: task.memo || "",
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
  };
  saveTaskOverrides();
}

function applyTaskOverrides(task) {
  const override = TASK_OVERRIDES[task.id];
  if (override) Object.assign(task, override);
  return task;
}

// Danh sách Task hiển thị ở Center Panel: mặc định là "Hôm nay" (đến hạn hôm nay hoặc quá hạn),
// hoặc toàn bộ Task của 1 Project nếu đang lọc theo Project (WBS), có áp thêm từ khoá tìm kiếm.
let activeProjectFilter = null;
let searchQuery = "";

function getVisibleTasks() {
  let list = getAllTasksCombined();

  if (activeProjectFilter) {
    list = list.filter((task) => task.projectId === activeProjectFilter);
  } else {
    const todayKey = toDateKey(TODAY);
    list = list.filter((task) => task.dueDate <= todayKey);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter((task) => task.title.toLowerCase().includes(q));
  }

  return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

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

  toast.classList.add("is-visible");

  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 6000);
}

function notifyAiFailure(err) {
  showToast("⚠️ エラー", err.message || "AIエージェントとの通信に失敗しました。", "error");
}

/* ---------- 4b. PROCESSING OVERLAY（プロジェクト大規模ファイル処理のシミュレーション UI） ---------- */
// Dùng chung cho WBS Import và Offshore Folder Upload để mô phỏng việc xử lý project có quy mô
// lớn (tối đa ~1GB) mà không làm treo UI: hiển thị 1 progress bar cập nhật dần theo % thực tế
// của từng bước xử lý (chunk lọc file / chunk render tree / giả lập đọc file lớn).
function showProcessingOverlay(label) {
  const overlay = $("fileProcessingOverlay");
  if (!overlay) return;
  const labelEl = $("processingLabel");
  if (labelEl) labelEl.textContent = label;
  updateProcessingProgress(0);
  overlay.classList.remove("hidden");
}

function updateProcessingProgress(percent) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const fill = $("processingProgressFill");
  const label = $("processingProgressPercent");
  if (fill) fill.style.width = `${clamped}%`;
  if (label) label.textContent = `${clamped}%`;
}

function hideProcessingOverlay() {
  $("fileProcessingOverlay")?.classList.add("hidden");
}

// Giả lập tiến trình "đọc/phân tích" 1 file có dung lượng lớn (thời gian mô phỏng tỉ lệ với
// kích thước thật của file, không đọc toàn bộ nội dung file nặng vào bộ nhớ trình duyệt) -
// luôn giới hạn trong khoảng 0.6s~3.5s để không làm chậm bản demo dù file thật lên đến ~1GB.
async function simulateStreamProgress(totalBytes, label) {
  showProcessingOverlay(label);
  const simulatedDurationMs = Math.min(3500, Math.max(600, (totalBytes / (80 * 1024 * 1024)) * 1000));
  const steps = 14;
  for (let i = 1; i <= steps; i += 1) {
    await sleep(simulatedDurationMs / steps);
    updateProcessingProgress((i / steps) * 100);
  }
  hideProcessingOverlay();
}

/* ---------- 5. ĐIỀU HƯỚNG TRUNG TÂM (今日 / カレンダー) ---------- */
function switchCenterView(viewName) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === viewName);
  });
  document.querySelectorAll(".center-view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${viewName}`);
  });

  // FullCalendar được khởi tạo khi tab đang ẩn ở lần chuyển tab trước đó -> cần tính lại kích thước.
  if (viewName === "calendar" && mainCalendar) {
    setTimeout(() => mainCalendar.updateSize(), 50);
  }
}

/* ---------- 6. SIDEBAR: QUICK ACTIONS (Tìm kiếm) ---------- */

function toggleSearchBox() {
  const input = $("sidebarSearchInput");
  if (!input) return;

  const willShow = input.classList.contains("hidden");
  input.classList.toggle("hidden");

  if (willShow) {
    input.focus();
  } else {
    input.value = "";
    searchQuery = "";
    renderTodayList();
  }
}

function handleSearchInput(value) {
  searchQuery = value.trim();
  switchCenterView("today");
  renderTodayList();
}

/* ---------- 7. MODAL: タスク追加 (➕ タスク追加) ---------- */

// presetProjectId: mở modal và chọn sẵn Project (dùng bởi nút "➕ Task追加" trong Project Dashboard).
// presetDueDate ("YYYY-MM-DD"): điền sẵn ngày (dùng bởi dateClick trên FullCalendar).
function openAddTaskModal(presetProjectId, presetDueDate) {
  const projectSelect = $("newTaskProjectSelect");
  if (projectSelect) {
    projectSelect.innerHTML = getAllProjects().map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    if (presetProjectId) projectSelect.value = presetProjectId;
  }
  const titleInput = $("newTaskTitleInput");
  if (titleInput) titleInput.value = "";
  const dueDateInput = $("newTaskDueDateInput");
  if (dueDateInput) dueDateInput.value = presetDueDate || toDateKey(TODAY);
  const prioritySelect = $("newTaskPrioritySelect");
  if (prioritySelect) prioritySelect.value = "medium";

  $("addTaskModal")?.classList.remove("hidden");
  titleInput?.focus();
}

function closeAddTaskModal() {
  $("addTaskModal")?.classList.add("hidden");
}

function submitNewTask() {
  const title = $("newTaskTitleInput")?.value.trim();
  const projectId = $("newTaskProjectSelect")?.value || null;
  const dueDate = $("newTaskDueDateInput")?.value;
  const priority = $("newTaskPrioritySelect")?.value || "medium";

  if (!title) {
    alert("タスク名を入力してください。");
    return;
  }
  if (!dueDate) {
    alert("期日を選択してください。");
    return;
  }

  const newTask = {
    id: `u-${Date.now()}`,
    projectId,
    title,
    priority,
    dueDate,
    category: "work",
  };

  USER_ADDED_TASKS.push(newTask);
  saveUserTasks();
  closeAddTaskModal();
  refreshAll();
  showToast("✅ 追加完了", `「${title}」を追加しました。`, "success");
}

/* ---------- 8. SIDEBAR: PROJECTS (WBS) ---------- */

function computeProjectProgress(projectId) {
  const tasks = getAllTasksCombined().filter((task) => task.projectId === projectId);
  if (tasks.length === 0) return { done: 0, total: 0, percent: 0 };
  const done = tasks.filter((task) => isTaskDone(task)).length;
  return { done, total: tasks.length, percent: Math.round((done / tasks.length) * 100) };
}

function renderProjectList() {
  const container = $("projectList");
  if (!container) return;
  container.innerHTML = "";

  getAllProjects().forEach((project) => {
    const { total, percent } = computeProjectProgress(project.id);

    const row = document.createElement("div");
    row.className = `project-row${project.id === activeProjectFilter ? " is-active" : ""}`;
    row.dataset.projectId = project.id;
    row.innerHTML =
      '<span class="project-color-dot"></span><span class="project-name"></span><span class="project-progress-mini"></span>';
    row.querySelector(".project-color-dot").style.background = project.color;
    row.querySelector(".project-name").textContent = project.name;
    row.querySelector(".project-progress-mini").textContent = total === 0 ? "-" : `${percent}%`;

    row.addEventListener("click", () => openProjectDashboardView(project.id));
    container.appendChild(row);
  });
}

// Modal "➕ 新規プロジェクト追加"
function openAddProjectModal() {
  const nameInput = $("newProjectNameInput");
  const colorInput = $("newProjectColorInput");
  if (nameInput) nameInput.value = "";
  if (colorInput) colorInput.value = "#4d8fe8";
  $("addProjectModal")?.classList.remove("hidden");
  nameInput?.focus();
}

function closeAddProjectModal() {
  $("addProjectModal")?.classList.add("hidden");
}

function submitNewProject() {
  const name = $("newProjectNameInput")?.value.trim();
  const color = $("newProjectColorInput")?.value || "#4d8fe8";

  if (!name) {
    alert("プロジェクト名を入力してください。");
    return;
  }

  const newProject = { id: `p-${Date.now()}`, name, color };
  USER_ADDED_PROJECTS.push(newProject);
  saveUserProjects();
  closeAddProjectModal();
  renderProjectList();
  showToast("✅ 追加完了", `プロジェクト「${name}」を追加しました。`, "success");
}

function clearProjectFilter() {
  activeProjectFilter = null;
  renderProjectList();
  renderTodayList();
}

/* ---------- 9. CENTER PANEL: TODAY LIST (今日のタスク) ---------- */

function formatDeadlineLabel(dueDate, overdue) {
  if (overdue) {
    const diffDays = Math.round((TODAY - new Date(`${dueDate}T00:00:00`)) / 86400000);
    return `期限超過（${diffDays}日）`;
  }
  if (dueDate === toDateKey(TODAY)) return "今日";
  return dueDate;
}

function buildTaskRow(task) {
  const done = isTaskDone(task);
  const overdue = isTaskOverdue(task);
  const project = getAllProjects().find((p) => p.id === task.projectId);

  const row = document.createElement("div");
  row.className = `task-row${done ? " is-done" : ""}${task.id === lastToggledTaskId ? " is-done-anim" : ""}${task.id === taskDetailModalTaskId ? " is-selected" : ""}`;
  row.dataset.taskId = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = done;
  checkbox.title = "クリックで完了/未完了を切り替え";
  checkbox.addEventListener("click", (event) => event.stopPropagation());
  checkbox.addEventListener("change", () => toggleTaskDoneRow(task.id));

  const main = document.createElement("div");
  main.className = "task-main";
  main.title = "クリックで詳細を開く";
  main.innerHTML = '<span class="task-title"></span><span class="task-project-tag"></span>';
  main.querySelector(".task-title").textContent = task.title;
  main.querySelector(".task-project-tag").textContent = project ? project.name : "";
  main.addEventListener("click", () => openTaskDetail(task.id));

  const deadline = document.createElement("span");
  deadline.className = `task-deadline${overdue ? " is-overdue" : ""}`;
  deadline.textContent = formatDeadlineLabel(task.dueDate, overdue);

  const badge = document.createElement("span");
  badge.className = `priority-badge priority-badge-${task.priority}`;
  badge.textContent = PRIORITY_LABELS[task.priority] || "中";

  row.appendChild(checkbox);
  row.appendChild(main);
  row.appendChild(deadline);
  row.appendChild(badge);
  return row;
}

function renderTodayList() {
  const listEl = $("todayTaskList");
  const titleEl = $("todayViewTitle");
  const progressFill = $("todayProgressFill");
  const progressLabel = $("todayProgressLabel");
  const alertBanner = $("overdueAlertBanner");
  const alertText = $("overdueAlertText");
  const filterChip = $("activeFilterChip");
  const filterLabel = $("activeFilterLabel");
  if (!listEl || !titleEl || !progressFill || !progressLabel || !alertBanner || !alertText) return;

  const visible = getVisibleTasks();
  const doneCount = visible.filter((task) => isTaskDone(task)).length;
  const totalCount = visible.length;
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  if (activeProjectFilter) {
    const project = getAllProjects().find((p) => p.id === activeProjectFilter);
    titleEl.textContent = project ? project.name : "今日";
    if (filterChip && filterLabel) {
      filterChip.classList.remove("hidden");
      filterLabel.textContent = project ? project.name : "";
    }
  } else {
    titleEl.textContent = "今日";
    filterChip?.classList.add("hidden");
  }

  progressFill.style.width = `${percent}%`;
  progressLabel.textContent = `${doneCount}/${totalCount} 完了`;

  const overdueVisible = visible.filter((task) => isTaskOverdue(task));
  if (overdueVisible.length > 0) {
    alertBanner.classList.remove("hidden");
    const maxDelay = Math.max(
      ...overdueVisible.map((task) => Math.round((TODAY - new Date(`${task.dueDate}T00:00:00`)) / 86400000))
    );
    alertText.textContent = `${overdueVisible.length}件のタスクが期限を超過しています（最大${maxDelay}日超過）`;
  } else {
    alertBanner.classList.add("hidden");
  }

  listEl.innerHTML = "";
  if (totalCount === 0) {
    listEl.innerHTML = '<div class="task-list-empty">表示できるタスクがありません。</div>';
  } else {
    visible.forEach((task) => listEl.appendChild(buildTaskRow(task)));
  }

  lastToggledTaskId = null;
  updateNotifBadge();
}

// Toggle trạng thái hoàn thành của 1 task, rồi vẽ lại toàn bộ nơi hiển thị liên quan.
function toggleTaskDoneRow(taskId) {
  if (DONE_TASK_IDS.has(taskId)) {
    DONE_TASK_IDS.delete(taskId);
  } else {
    DONE_TASK_IDS.add(taskId);
  }
  lastToggledTaskId = taskId;
  saveDoneTaskIds();
  refreshAll();
}

function updateNotifBadge() {
  const badge = $("notifBadge");
  if (!badge) return;
  const overdueCount = getOverdueTasks().length;
  if (overdueCount > 0) {
    badge.textContent = overdueCount > 9 ? "9+" : String(overdueCount);
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

/* ---------- 9b. PROJECT DASHBOARD (khi click 1 Project ở Sidebar) ---------- */

let donutChartInstance = null;
let barChartInstance = null;

// Trạng thái "để hiển thị" của Task được suy ra từ dữ liệu hiện có (done/dueDate), không cần
// thêm field status riêng: quá hạn (chưa xong + qua hạn) / đang thực hiện (chưa xong + đến hạn
// hôm nay) / chưa thực hiện (chưa xong + hạn ở tương lai) / hoàn tất (đã tick done).
function computeProjectDashboardStats(projectId) {
  const tasks = getAllTasksCombined().filter((task) => task.projectId === projectId);
  const todayKey = toDateKey(TODAY);

  let overdue = 0;
  let todo = 0;
  let inProgress = 0;
  let done = 0;

  tasks.forEach((task) => {
    if (isTaskDone(task)) {
      done += 1;
    } else if (task.dueDate < todayKey) {
      overdue += 1;
    } else if (task.dueDate === todayKey) {
      inProgress += 1;
    } else {
      todo += 1;
    }
  });

  return { overdue, todo, inProgress, done };
}

// Số task theo mức độ ưu tiên trong 1 Project - dùng làm dữ liệu thật cho Bar Chart
// (thay cho mock "công đoạn" trước đây, vì Task model hiện tại không có field "công đoạn").
function computeProjectPriorityBreakdown(projectId) {
  const tasks = getAllTasksCombined().filter((task) => task.projectId === projectId);
  const counts = { high: 0, medium: 0, low: 0 };
  tasks.forEach((task) => {
    counts[task.priority] = (counts[task.priority] || 0) + 1;
  });
  return counts;
}

function openProjectDashboardView(projectId) {
  activeProjectFilter = projectId;
  renderProjectList();
  switchCenterView("project-dashboard");
  renderProjectDashboard(projectId);

  // Canvas Chart.js có thể đã bị co kích thước về 0 trong lúc View này ẩn (display:none) ->
  // cần resize lại sau khi hiển thị để biểu đồ không bị vẽ méo/mất tỷ lệ.
  setTimeout(() => {
    donutChartInstance?.resize();
    barChartInstance?.resize();
  }, 50);
}

// Được gọi lại từ refreshAll() mỗi khi dữ liệu Task thay đổi (tick done, sửa, thêm mới, kéo-thả
// lịch...) để Dashboard của Project đang mở luôn phản ánh đúng số liệu + biểu đồ theo thời gian thực.
function refreshActiveProjectDashboardIfVisible() {
  const view = $("view-project-dashboard");
  if (activeProjectFilter && view && view.classList.contains("is-active")) {
    renderProjectDashboard(activeProjectFilter);
  }
}

function renderProjectDashboard(projectId) {
  const project = getAllProjects().find((p) => p.id === projectId);

  const titleEl = $("dashboardProjectTitle");
  if (titleEl) titleEl.textContent = project ? `${project.name} - Dashboard` : "プロジェクト Dashboard";

  const stats = computeProjectDashboardStats(projectId);
  const overdueEl = $("dashboardOverdueCount");
  const todoEl = $("dashboardTodoCount");
  const inProgressEl = $("dashboardInProgressCount");
  const doneEl = $("dashboardDoneCount");
  if (overdueEl) overdueEl.textContent = stats.overdue;
  if (todoEl) todoEl.textContent = stats.todo;
  if (inProgressEl) inProgressEl.textContent = stats.inProgress;
  if (doneEl) doneEl.textContent = stats.done;

  renderProjectCharts(projectId);
  renderProjectTaskTable(projectId);
}

// Khởi tạo (lần đầu) hoặc cập nhật dữ liệu (.update()) 2 biểu đồ Chart.js dựa trên trạng thái
// Task THẬT của Project (không còn dùng số liệu mock cố định). Vì canvas luôn tồn tại sẵn trong
// DOM (chỉ ẩn/hiện qua View), ta chỉ tạo Chart 1 lần rồi tái sử dụng - tránh phải destroy/recreate
// liên tục, đồng thời giúp biểu đồ tự "động" (reactive) mỗi khi trạng thái Task thay đổi.
function renderProjectCharts(projectId) {
  const donutCanvas = $("progressDonutChart");
  const barCanvas = $("teamPerformanceChart");
  if (!donutCanvas || !barCanvas || typeof Chart === "undefined") return;

  const stats = computeProjectDashboardStats(projectId);
  const priorityBreakdown = computeProjectPriorityBreakdown(projectId);
  const donutData = [stats.inProgress, stats.done, stats.overdue];
  const barData = [priorityBreakdown.high, priorityBreakdown.medium, priorityBreakdown.low];

  if (donutChartInstance) {
    donutChartInstance.data.datasets[0].data = donutData;
    donutChartInstance.update();
  } else {
    donutChartInstance = new Chart(donutCanvas, {
      type: "doughnut",
      data: {
        labels: ["対応中", "完了", "期限超過"],
        datasets: [
          {
            data: donutData,
            backgroundColor: ["#4d8fe8", "#45b994", "#e0524a"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
        },
      },
    });
  }

  if (barChartInstance) {
    barChartInstance.data.datasets[0].data = barData;
    barChartInstance.update();
  } else {
    barChartInstance = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: ["高（High）", "中（Medium）", "低（Low）"],
        datasets: [
          {
            label: "タスク件数",
            data: barData,
            backgroundColor: ["#e0524a", "#f5a623", "#22b8a0"],
            borderRadius: 6,
            maxBarThickness: 42,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#e5e7eb" } },
          x: { grid: { display: false } },
        },
      },
    });
  }
}

/* ---------- 9c. PROJECT DASHBOARD > TASK 一覧（Project riêng: inline edit + Task 追加 riêng） ---------- */

// Task đang được mở trong Sidebar Task Detail Panel (null nếu Panel đang đóng).
let taskDetailModalTaskId = null;

function buildProjectTaskRow(task) {
  const done = isTaskDone(task);

  const row = document.createElement("div");
  row.className = `project-task-row${done ? " is-done" : ""}${task.id === taskDetailModalTaskId ? " is-selected" : ""}`;
  row.dataset.taskId = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = done;
  checkbox.title = "クリックで完了/未完了を切り替え";
  checkbox.addEventListener("change", () => toggleTaskDoneRow(task.id));

  const titleCell = document.createElement("span");
  titleCell.className = "project-task-title";
  titleCell.textContent = task.title;
  titleCell.title = "クリックで詳細を開く";
  titleCell.addEventListener("click", () => openTaskDetail(task.id));

  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.className = "project-task-date-input";
  dueDateInput.value = task.dueDate;
  dueDateInput.addEventListener("change", () => {
    if (!dueDateInput.value) return;
    task.dueDate = dueDateInput.value;
    persistIfUserTask(task);
    refreshAll();
  });

  const prioritySelect = document.createElement("select");
  prioritySelect.className = "project-task-priority-select";
  prioritySelect.innerHTML =
    '<option value="high">高</option><option value="medium">中</option><option value="low">低</option>';
  prioritySelect.value = task.priority;
  prioritySelect.addEventListener("change", () => {
    task.priority = prioritySelect.value;
    persistIfUserTask(task);
    refreshAll();
  });

  row.appendChild(checkbox);
  row.appendChild(titleCell);
  row.appendChild(dueDateInput);
  row.appendChild(prioritySelect);
  return row;
}

// Danh sách Task hiển thị TRONG Project Dashboard: chỉ lấy Task thuộc đúng Project đang mở
// (khác với "Hôm nay" ở Center Panel View 1 - nơi luôn lọc theo hạn đến hôm nay/quá hạn).
function renderProjectTaskTable(projectId) {
  const body = $("projectTaskTableBody");
  if (!body) return;

  const tasks = getAllTasksCombined()
    .filter((task) => task.projectId === projectId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  body.innerHTML = "";
  if (tasks.length === 0) {
    body.innerHTML = '<div class="project-task-table-empty">このプロジェクトにはまだタスクがありません。</div>';
    return;
  }
  tasks.forEach((task) => body.appendChild(buildProjectTaskRow(task)));
}

// Nút "➕ Task追加" bên trong Project Dashboard: mở lại Modal タスク追加 chung nhưng luôn
// preselect đúng Project đang mở, để không phải chọn lại từ đầu.
function openAddTaskModalForProject() {
  openAddTaskModal(activeProjectFilter);
}

/* ---------- 9d. RIGHT SIDEBAR: タスク詳細 ---------- */

function getSelectedTask() {
  if (!taskDetailModalTaskId) return null;
  return getAllTasksCombined().find((t) => t.id === taskDetailModalTaskId) || null;
}

function ensureTaskSubtasks(task) {
  if (!Array.isArray(task.subtasks)) task.subtasks = [];
  return task.subtasks;
}

function updateTaskDetailDoneButton(task) {
  const btn = $("taskDetailToggleDoneBtn");
  if (!btn) return;
  btn.textContent = isTaskDone(task) ? "↩ 未完了に戻す" : "✓ 完了にする";
}

function renderTaskDetailSubtasks(task) {
  const list = $("taskDetailSubtaskList");
  if (!list) return;
  const subtasks = ensureTaskSubtasks(task);
  list.innerHTML = "";
  if (subtasks.length === 0) {
    list.innerHTML = '<p class="task-detail-subtask-empty">サブタスクはありません。</p>';
    return;
  }
  subtasks.forEach((item, index) => {
    const row = document.createElement("label");
    row.className = `task-detail-subtask-row${item.done ? " is-done" : ""}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(item.done);
    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      persistIfUserTask(task);
      renderTaskDetailSubtasks(task);
    });
    const text = document.createElement("span");
    text.textContent = item.title;
    row.appendChild(checkbox);
    row.appendChild(text);
    list.appendChild(row);
  });
}

function fillTaskDetailPanel(task) {
  const project = getAllProjects().find((p) => p.id === task.projectId);
  const titleInput = $("taskDetailTitleInput");
  const projectLabel = $("taskDetailProjectLabel");
  const dueDateInput = $("taskDetailDueDateInput");
  const prioritySelect = $("taskDetailPrioritySelect");
  const memoInput = $("taskDetailMemoInput");
  if (titleInput) titleInput.value = task.title;
  if (projectLabel) projectLabel.textContent = project ? project.name : "未設定";
  if (dueDateInput) dueDateInput.value = task.dueDate;
  if (prioritySelect) prioritySelect.value = task.priority;
  if (memoInput) memoInput.value = task.memo || "";
  updateTaskDetailDoneButton(task);
  renderTaskDetailSubtasks(task);
}

function showTaskDetailPanel(visible) {
  $("taskDetailEmpty")?.classList.toggle("hidden", visible);
  $("taskDetailPanel")?.classList.toggle("hidden", !visible);
}

function openTaskDetail(taskId) {
  const task = getAllTasksCombined().find((t) => t.id === taskId);
  if (!task) return;

  taskDetailModalTaskId = taskId;
  fillTaskDetailPanel(task);
  showTaskDetailPanel(true);
  renderTodayList();

  if (window.innerWidth <= 1024) {
    document.body.classList.add("sidebar-right-open");
  }
}

function closeTaskDetail() {
  taskDetailModalTaskId = null;
  showTaskDetailPanel(false);
  document.body.classList.remove("sidebar-right-open");
  renderTodayList();
}

function refreshTaskDetailIfOpen() {
  const task = getSelectedTask();
  if (!task) {
    showTaskDetailPanel(false);
    return;
  }
  fillTaskDetailPanel(task);
  showTaskDetailPanel(true);
}

function toggleTaskDetailDone() {
  if (!taskDetailModalTaskId) return;
  toggleTaskDoneRow(taskDetailModalTaskId);
}

function saveTaskDetail() {
  const task = getSelectedTask();
  if (!task) return;

  const title = $("taskDetailTitleInput")?.value.trim();
  const dueDate = $("taskDetailDueDateInput")?.value;
  if (!title || !dueDate) return;

  task.title = title;
  task.dueDate = dueDate;
  task.priority = $("taskDetailPrioritySelect")?.value || task.priority;
  task.memo = $("taskDetailMemoInput")?.value || "";
  persistIfUserTask(task);
  refreshAll();
}

function addTaskDetailSubtask() {
  const task = getSelectedTask();
  const input = $("taskDetailNewSubtaskInput");
  if (!task || !input) return;
  const title = input.value.trim();
  if (!title) return;
  ensureTaskSubtasks(task).push({ title, done: false });
  input.value = "";
  persistIfUserTask(task);
  renderTaskDetailSubtasks(task);
}

function handleNewSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addTaskDetailSubtask();
  }
}

/* ---------- 10. REFRESH TỔNG (gọi sau mỗi lần dữ liệu thay đổi) ---------- */
function refreshAll() {
  renderProjectList();
  renderTodayList();
  refreshCalendarEvents();
  updateAgentStatusLine();
  refreshActiveProjectDashboardIfVisible();
  refreshTaskDetailIfOpen();
}

/* ---------- 11. CENTER PANEL: CALENDAR (FullCalendar Week + Drag & Drop) ---------- */

let mainCalendar = null;

function buildCalendarEvents() {
  const taskEvents = getAllTasksCombined().map((task) => ({
    id: task.id,
    title: task.title,
    start: task.dueDate,
    allDay: true,
    extendedProps: { taskId: task.id, category: task.category || "work" },
  }));

  const meetingEvents = FIXED_MEETINGS.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    start: meeting.start,
    end: meeting.end,
    extendedProps: { taskId: meeting.id, category: "meeting" },
  }));

  return [...taskEvents, ...meetingEvents];
}

function refreshCalendarEvents() {
  if (!mainCalendar) return;
  mainCalendar.removeAllEvents();
  buildCalendarEvents().forEach((evt) => mainCalendar.addEvent(evt));
  renderCalendarDragRail();
}

function initFullCalendar() {
  const el = $("fullCalendar");
  if (!el || typeof FullCalendar === "undefined") return;

  mainCalendar = new FullCalendar.Calendar(el, {
    locale: "ja",
    initialView: "timeGridWeek",
    headerToolbar: { left: "prev,next today", center: "title", right: "timeGridWeek,dayGridMonth" },
    height: "100%",
    nowIndicator: true,
    dayMaxEvents: true,
    droppable: true,
    events: buildCalendarEvents(),

    // Click vào 1 ô ngày/giờ còn trống (không phải click lên Event có sẵn - FullCalendar tự
    // phân biệt 2 trường hợp này) -> mở nhanh Modal タスク追加 với ngày đã chọn được điền sẵn.
    dateClick: function (info) {
      openAddTaskModal(activeProjectFilter, toDateKey(info.date));
    },

    eventClassNames: function (arg) {
      const classes = [];
      const category = arg.event.extendedProps.category;
      if (category === "work") classes.push("fc-event-work");
      else if (category === "learning") classes.push("fc-event-learning");
      else if (category === "meeting") classes.push("fc-event-meeting");
      else if (category === "google") classes.push("fc-event-google");

      const taskId = arg.event.extendedProps.taskId || arg.event.id;
      if (DONE_TASK_IDS.has(taskId)) classes.push("fc-event-done");
      if (AI_NEW_TASK_IDS.has(taskId)) classes.push("fc-event-ai-new");
      return classes;
    },

    // 会議イベントはタスクではないためクリックしても完了切替の対象外
    eventClick: function (arg) {
      if (arg.event.extendedProps.category === "meeting") return;
      const taskId = arg.event.extendedProps.taskId || arg.event.id;
      openTaskDetail(taskId);
    },

    // ドラッグ元（未完了タスクのチップ）をドロップした時に呼ばれる。ドロップ位置の日付を
    // そのタスクの新しい期日として反映し、FullCalendarが自動生成した一時イベントは削除
    // （再描画は Task データを Single Source of Truth とする refreshAll() に任せる）。
    eventReceive: function (info) {
      const taskId = info.event.extendedProps.taskId;
      const startDate = info.event.start;
      info.event.remove();

      const task = getAllTasksCombined().find((t) => t.id === taskId);
      if (!task || !startDate) return;

      task.dueDate = toDateKey(startDate);
      task.category = "work";
      persistIfUserTask(task);
      refreshAll();
      showToast("✅ スケジュール完了", `「${task.title}」を ${task.dueDate} に予定しました。`, "success");
    },
  });

  mainCalendar.render();
}

// Dải chip có thể kéo (draggable) hiển thị trên View 3、để người dùng kéo trực tiếp vào
// FullCalendar nhằm đặt/dời lịch cho task (chỉ hiển thị task chưa hoàn thành).
function renderCalendarDragRail() {
  const container = $("calendarDragRailItems");
  if (!container) return;

  const candidates = getAllTasksCombined()
    .filter((task) => !isTaskDone(task))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 14);

  container.innerHTML = "";
  if (candidates.length === 0) {
    container.innerHTML = '<span class="calendar-drag-rail-empty">スケジュール可能なタスクはありません。</span>';
    return;
  }

  candidates.forEach((task) => {
    const chip = document.createElement("div");
    chip.className = "drag-chip";
    chip.dataset.taskId = task.id;
    chip.innerHTML = `<span class="drag-chip-dot priority-dot-${task.priority}"></span><span class="drag-chip-title"></span>`;
    chip.querySelector(".drag-chip-title").textContent = task.title;
    container.appendChild(chip);
  });
}

let taskDraggableInstance = null;

// Khởi tạo FullCalendar.Draggable đúng 1 lần trên container cố định (#calendarDragRailItems).
// Vì Draggable lắng nghe sự kiện theo cơ chế delegation trên chính container, việc render lại
// các chip con bên trong (renderCalendarDragRail) không cần init lại instance này.
function initTaskDragDrop() {
  const container = $("calendarDragRailItems");
  if (!container || typeof FullCalendar === "undefined" || !FullCalendar.Draggable || taskDraggableInstance) return;

  taskDraggableInstance = new FullCalendar.Draggable(container, {
    itemSelector: ".drag-chip",
    eventData: function (el) {
      const taskId = el.dataset.taskId;
      const task = getAllTasksCombined().find((t) => t.id === taskId);
      if (!task) return null;
      return {
        title: task.title,
        duration: "01:00",
        extendedProps: { taskId: task.id },
      };
    },
  });
}

/* ---------- 12. MODAL: Googleカレンダー連携設定 ---------- */

function openGcalSettingsModal() {
  $("gcalSettingsModal")?.classList.remove("hidden");
  loadCalendarSettings();
}

function closeGcalSettingsModal() {
  $("gcalSettingsModal")?.classList.add("hidden");
}

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
      projectId: null,
      title: task.title,
      priority: "medium",
      dueDate: task.dueDate,
      category: "google",
    }));
    refreshAll();
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

/* ---------- 13. AI AGENT CHAT（マスコット押下時のみオーバーレイ表示） ---------- */

function openAgentChat() {
  document.body.classList.add("agent-chat-open");
}

function toggleAgentChat() {
  document.body.classList.toggle("agent-chat-open");
}

function clearAgentFeedEmptyState() {
  const empty = $("agentFeedEmpty");
  if (empty) empty.remove();
}

function appendTimelineStep(text) {
  clearAgentFeedEmptyState();
  const feed = $("agentFeed");
  if (!feed) return null;

  const el = document.createElement("div");
  el.className = "agent-msg-step";
  el.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span></span>';
  el.querySelector("span").textContent = text;
  feed.appendChild(el);
  feed.scrollTop = feed.scrollHeight;
  return el;
}

// Chạy tuần tự nhiều bước timeline (giả lập quá trình suy nghĩ của AI Agent) trước khi có
// kết quả thật từ backend, để trông giống 1 Agent thực sự đang xử lý từng bước.
async function runTimelineSteps(stepTexts) {
  for (const text of stepTexts) {
    const el = appendTimelineStep(text);
    await sleep(500);
    if (el) {
      const iconEl = el.querySelector("i");
      if (iconEl) iconEl.className = "fa-solid fa-check";
    }
  }
}

function appendChatBubble(role, text, options = {}) {
  clearAgentFeedEmptyState();
  const feed = $("agentFeed");
  if (!feed) return;

  const bubble = document.createElement("div");
  bubble.className = `agent-msg agent-msg-${role === "user" ? "user" : "ai"}`;

  const textEl = document.createElement("div");
  textEl.textContent = text; // AIが生成した文章は信頼せず textContent で描画（XSS対策）
  bubble.appendChild(textEl);

  if (options.actionLabel && typeof options.onAction === "function") {
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "btn btn-secondary";
    actionBtn.style.marginTop = "8px";
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

// Áp dụng đề xuất dời lịch của AI (RebalancedTaskDto[]): cập nhật thẳng dueDate + category của
// Task tương ứng (learning/AI đề xuất), rồi làm nổi bật tạm thời trên Calendar.
function applyRebalancedTasks(rebalancedTasks) {
  if (!Array.isArray(rebalancedTasks) || rebalancedTasks.length === 0) return;

  const appliedIds = [];
  rebalancedTasks.forEach((item) => {
    const task = getAllTasksCombined().find((t) => t.id === item.taskId);
    if (!task || !item.newDueDate) return;
    task.dueDate = item.newDueDate;
    task.category = "learning";
    persistIfUserTask(task);
    appliedIds.push(task.id);
  });

  if (appliedIds.length === 0) return;

  AI_NEW_TASK_IDS = new Set(appliedIds);
  refreshAll();

  setTimeout(() => {
    AI_NEW_TASK_IDS = new Set();
    refreshCalendarEvents();
  }, 3000);
}

// Nút "✨ AIタスク自動調整"（今日ビュー）/ "✨ AI分析"（カレンダービュー）/ chip "自動リスケジュール"
// (Right Sidebar) dùng chung 1 luồng: gọi thật /api/v1/copilot/analyze-schedule.
async function runAiAutoSchedule(buttonEl) {
  const triggerButtons = [$("btnAiAutoSchedule"), $("btnAiAnalyzeCalendar"), $("btnQuickRebalance")].filter(
    Boolean
  );
  if (triggerButtons.some((b) => b.disabled)) return;

  openAgentChat();

  const overdueTasks = getOverdueTasks();
  if (overdueTasks.length === 0) {
    appendChatBubble("ai", "現在、期限を超過しているタスクはありません。素晴らしい進捗です！");
    showToast("🎉 完了", "期限を超過しているタスクはありません。", "success");
    return;
  }

  const originalHtmlMap = new Map(triggerButtons.map((b) => [b, b.innerHTML]));
  triggerButtons.forEach((b) => {
    b.disabled = true;
  });

  appendChatBubble("user", "✨ AIタスク自動調整を実行");
  await runTimelineSteps([
    "タスクとカレンダーを読み込み中...",
    "遅延タスクを分析中...",
    "AIが再スケジュール案を作成中...",
  ]);

  try {
    const tasksPayload = overdueTasks.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate }));
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
    showToast("✅ 完了", "AIによるタスク自動調整が完了しました。", "success");
  } catch (err) {
    appendChatBubble("ai", `⚠️ ${err.message}`);
    notifyAiFailure(err);
  } finally {
    triggerButtons.forEach((b) => {
      b.disabled = false;
      b.innerHTML = originalHtmlMap.get(b);
    });
  }
}

function handleAgentInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendAgentChatMessage();
  }
}

// Ô chat tự do: tái sử dụng nghiệp vụ Auto-Rebalance (endpoint AI phù hợp nhất cho câu hỏi kiểu
// "hãy sắp xếp giúp tôi lịch tuần này"), hiển thị đúng câu người dùng gõ.
async function sendAgentChatMessage() {
  const input = $("agentChatInput");
  const sendBtn = $("btnAgentSend");
  if (!input || !sendBtn || sendBtn.disabled) return;

  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  appendChatBubble("user", text);

  const overdueTasks = getOverdueTasks();
  if (overdueTasks.length === 0) {
    appendChatBubble(
      "ai",
      "現在、期限を超過しているタスクはありません。素晴らしい進捗です！新しいタスクが追加されたら、またお声がけください。"
    );
    return;
  }

  sendBtn.disabled = true;
  await runTimelineSteps(["タスクとカレンダーを読み込み中...", "AIが最適なプランを検討中..."]);

  try {
    const tasksPayload = overdueTasks.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate }));
    const result = await postJson("/api/v1/copilot/analyze-schedule", { tasks: tasksPayload });
    applyRebalancedTasks(result.rebalancedTasks || []);
    appendChatBubble("ai", result.findingsSummary || "現在、緊急の遅延タスクはありません。");
  } catch (err) {
    appendChatBubble("ai", `⚠️ ${err.message}`);
    notifyAiFailure(err);
  } finally {
    sendBtn.disabled = false;
  }
}

function updateAgentStatusLine() {
  const el = $("agentStatusLine");
  if (!el) return;
  const todayKey = toDateKey(TODAY);
  const todayTasks = getAllTasksCombined().filter((task) => task.dueDate === todayKey);
  const doneCount = todayTasks.filter((task) => isTaskDone(task)).length;
  el.textContent =
    todayTasks.length === 0
      ? "本日期日のタスクはありません。個人目標に集中しましょう！"
      : `本日のタスク: ${doneCount}/${todayTasks.length} 完了です。`;
}

/* ---------- 14. SOS: 🆘 緊急SOS（スピナー → Action Modal） ---------- */

// Bấm SOS ở Today View hoặc chip trong Right Sidebar: hiện spinner tối thiểu 1.5s (giả lập AI
// phân tích), sau đó gọi thật /api/v1/copilot/sos-alert và mở Modal kết quả (risk + email draft).
async function runQuickSos(buttonEl) {
  const triggerButtons = [$("btnQuickSos"), $("btnQuickSos2")].filter(Boolean);
  if (triggerButtons.some((b) => b.disabled)) return;

  const originalHtmlMap = new Map(triggerButtons.map((b) => [b, b.innerHTML]));
  triggerButtons.forEach((b) => {
    b.disabled = true;
    b.innerHTML = "⏳ AIが分析中...";
  });

  try {
    await sleep(1500);
    const result = await postJson("/api/v1/copilot/sos-alert", {
      fileName: "PremiumCalculator.java",
      stuckMinutes: 180,
    });
    openSosResultModal(result);
  } catch (err) {
    notifyAiFailure(err);
  } finally {
    triggerButtons.forEach((b) => {
      b.disabled = false;
      b.innerHTML = originalHtmlMap.get(b);
    });
  }
}

function openSosResultModal(result) {
  const riskBox = $("sosRiskSummaryBox");
  const emailInput = $("sosEmailDraftInput");
  if (riskBox) riskBox.textContent = result.alertMessage || "リスクは検出されませんでした。";
  if (emailInput) emailInput.value = result.slackMessageDraft || "";
  $("sosResultModal")?.classList.remove("hidden");
}

function closeSosResultModal() {
  $("sosResultModal")?.classList.add("hidden");
}

function sendSosMail(buttonEl) {
  const content = $("sosEmailDraftInput")?.value.trim();
  if (!content) {
    alert("送信する内容がありません。");
    return;
  }
  handleSendAction(buttonEl, () => {
    openGmailDeepLink("pm@company.co.jp", "【至急】タスク遅延に関するご報告", content);
    showToast("📧 Gmail作成完了", "PM・先輩への報告メールを下書きしました。", "success");
  });
}

/* ---------- 15. MODAL: 日報作成 (📝 Viết Nippo) ---------- */

function openNippoModal() {
  $("nippoModal")?.classList.remove("hidden");
}

function closeNippoModal() {
  $("nippoModal")?.classList.add("hidden");
}

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

/* ---------- 16. MODAL: オフショア支援 (Spec vs Code + Shadow Client) ---------- */

function openOffshoreModal() {
  const reqInput = $("requirementTextInput");
  if (reqInput && !reqInput.value.trim()) {
    reqInput.value = OFFSHORE_TEST_SAMPLE.requirementText;
  }
  $("offshoreModal")?.classList.remove("hidden");
}

function closeOffshoreModal() {
  $("offshoreModal")?.classList.add("hidden");
}

function switchOffshorePane(paneId, btnEl) {
  document.querySelectorAll("#offshoreModal .modal-tab").forEach((btn) => btn.classList.remove("is-active"));
  if (btnEl) btnEl.classList.add("is-active");

  document.querySelectorAll("#offshoreModal .modal-pane").forEach((pane) => {
    pane.classList.toggle("is-active", pane.id === `pane-${paneId}`);
  });
}

const OFFSHORE_UPLOADED_TEXT = { spec: null, code: null, unittest: null, requirement: null };

const OFFSHORE_KIND_UI = {
  spec: { statusId: "specFileStatus", treeId: null, storeKey: "spec" },
  code: { statusId: "codeFileStatus", treeId: "codeFolderTree", storeKey: "code" },
  unittest: { statusId: "unittestFileStatus", treeId: "unittestFolderTree", storeKey: "unittest" },
  requirement: { statusId: "requirementFileStatus", treeId: null, storeKey: "requirement" },
};

const OFFSHORE_CODE_EXTENSIONS = [
  ".java", ".js", ".jsx", ".ts", ".tsx", ".py", ".cs", ".go", ".rb", ".php",
  ".c", ".cpp", ".h", ".hpp", ".kt", ".swift", ".sql", ".xml", ".yml", ".yaml",
  ".json", ".html", ".css", ".md", ".txt",
];
const OFFSHORE_EXCLUDED_DIR_SEGMENTS = [
  "node_modules", ".git", "target", "build", "dist", ".idea", ".vscode",
  "venv", "__pycache__", ".gradle", "vendor", "coverage", ".next", "out",
];
// Giới hạn số file thực sự được gửi lên AI để trích xuất/phân tích nội dung (giữ ở mức hợp lý vì
// LLM có giới hạn context - gửi quá nhiều sẽ bị cắt/kém chính xác). Việc DUYỆT & HIỂN THỊ folder
// tree thì KHÔNG bị giới hạn bởi số này - xem renderFolderTreeChunked()/filterOffshoreFilesChunked().
const OFFSHORE_MAX_BATCH_FILES = 300;
// Ngưỡng số file để coi là "project lớn" và cần xử lý theo chunk (tránh treo UI) + hiện Progress Overlay.
const OFFSHORE_LARGE_SELECTION_THRESHOLD = 300;
const OFFSHORE_SPEC_SAMPLE = {
  specText: "第3.2節：保険料計算における成人の定義は「18歳以上」とする。",
  codeText: 'if (age >= 20) { applyAdultPremium(); }',
};

const OFFSHORE_TEST_SAMPLE = {
  requirementText: `【モジュール】保険料計算（成人判定）
【システム】生命保険 新契約システム
【概要】契約者の年齢に応じて成人保険料を適用する。成人の定義は満18歳以上。

【受け入れ条件】
AC-01: age=18 の場合、applyAdultPremium() が呼ばれること
AC-02: age=17 の場合、成人保険料を適用しないこと
AC-03: age が null または負数の場合、ValidationException を送出すること
AC-04: 二重送信（同一契約の計算を連続実行）しても保険料が二重計上されないこと`,
  codeText: `public class PremiumCalculator {
  public void applyPremium(Integer age) {
    if (age == null || age < 0) {
      throw new ValidationException("年齢が不正です");
    }
    if (age >= 20) {
      applyAdultPremium();
    }
  }
  private void applyAdultPremium() { /* 保険料テーブル参照 */ }
}`,
};

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
  if (kind === "spec" || kind === "requirement") {
    return [".pdf", ".txt", ".md"].some((ext) => path.endsWith(ext));
  }
  return OFFSHORE_CODE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

// Lọc danh sách file theo chunk (không xử lý toàn bộ trong 1 vòng lặp đồng bộ) + nhường lại main
// thread giữa các chunk (await sleep(0)) - giúp browser không bị "đơ" khi người dùng chọn cả 1
// project rất lớn (hàng chục nghìn file, quy mô mô phỏng tới ~1GB).
async function filterOffshoreFilesChunked(allFiles, kind, onProgress) {
  const CHUNK_SIZE = 500;
  const result = [];

  for (let i = 0; i < allFiles.length; i += CHUNK_SIZE) {
    const chunk = allFiles.slice(i, i + CHUNK_SIZE);
    chunk.forEach((file) => {
      if (isOffshoreFileAllowed(file, kind)) result.push(file);
    });

    if (onProgress) {
      onProgress(Math.min(100, ((i + CHUNK_SIZE) / allFiles.length) * 100));
    }
    await sleep(0);
  }

  return result;
}

// Hiển thị dạng "tree/list" trực quan của folder code đã chọn (thu gọn theo thư mục cha). Việc
// dựng DOM được chia theo lô (chunk) + requestAnimationFrame giữa các lô để không block main
// thread dù danh sách hiển thị lớn hơn nhiều so với trước đây (MAX_VISIBLE tăng lên 300).
async function renderFolderTreeChunked(files, treeId = "codeFolderTree") {
  const treeEl = $(treeId);
  if (!treeEl) return;

  treeEl.innerHTML = "";
  if (!files || files.length === 0) {
    treeEl.classList.add("hidden");
    return;
  }
  treeEl.classList.remove("hidden");

  const MAX_VISIBLE = 300;
  const sortedPaths = files.map((file) => getRelativePath(file)).sort();
  const visiblePaths = sortedPaths.slice(0, MAX_VISIBLE);
  const RENDER_CHUNK_SIZE = 40;
  let lastDir = null;

  for (let i = 0; i < visiblePaths.length; i += RENDER_CHUNK_SIZE) {
    const chunk = visiblePaths.slice(i, i + RENDER_CHUNK_SIZE);
    const fragment = document.createDocumentFragment();

    chunk.forEach((path) => {
      const segments = path.split("/");
      const dir = segments.slice(0, -1).join("/");
      const fileName = segments[segments.length - 1];
      const depth = Math.max(segments.length - 1, 0);

      if (dir && dir !== lastDir) {
        const dirRow = document.createElement("div");
        dirRow.className = "folder-tree-item is-dir-header";
        dirRow.style.paddingLeft = `${Math.max(depth - 1, 0) * 14}px`;
        dirRow.innerHTML = '<i class="fa-solid fa-folder-open"></i><span></span>';
        dirRow.querySelector("span").textContent = dir;
        fragment.appendChild(dirRow);
        lastDir = dir;
      } else if (!dir) {
        lastDir = null;
      }

      const fileRow = document.createElement("div");
      fileRow.className = "folder-tree-item";
      fileRow.style.paddingLeft = `${depth * 14}px`;
      fileRow.innerHTML = '<i class="fa-regular fa-file-code"></i><span></span>';
      fileRow.querySelector("span").textContent = fileName;
      fragment.appendChild(fileRow);
    });

    treeEl.appendChild(fragment);
    // Chờ 1 khung hình trước khi dựng lô tiếp theo, giữ UI mượt khi hiển thị project lớn.
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  if (sortedPaths.length > MAX_VISIBLE) {
    const more = document.createElement("div");
    more.className = "folder-tree-more";
    more.textContent = `...他 ${sortedPaths.length - MAX_VISIBLE} 件のファイル`;
    treeEl.appendChild(more);
  }
}

async function handleOffshoreFileSelect(inputEl, kind) {
  const kindUi = OFFSHORE_KIND_UI[kind] || OFFSHORE_KIND_UI.code;
  const statusEl = $(kindUi.statusId);
  const treeId = kindUi.treeId;
  const storeKey = kindUi.storeKey;
  const allFiles = inputEl.files ? Array.from(inputEl.files) : [];
  if (allFiles.length === 0) return;

  const totalBytes = allFiles.reduce((sum, file) => sum + file.size, 0);
  const isLargeSelection = allFiles.length > OFFSHORE_LARGE_SELECTION_THRESHOLD;

  let filteredFiles;
  if (isLargeSelection) {
    showProcessingOverlay(
      `📂 ${allFiles.length.toLocaleString()}件のファイル（合計${formatFileSize(totalBytes)}）を走査しています...`
    );
    filteredFiles = await filterOffshoreFilesChunked(allFiles, kind, updateProcessingProgress);
    hideProcessingOverlay();
  } else {
    filteredFiles = allFiles.filter((file) => isOffshoreFileAllowed(file, kind));
  }

  if (filteredFiles.length === 0) {
    if (statusEl) {
      statusEl.textContent = "⚠️ 対応する形式のファイルが見つかりませんでした。";
    }
    if (treeId) await renderFolderTreeChunked([], treeId);
    inputEl.value = "";
    return;
  }

  if (treeId) await renderFolderTreeChunked(filteredFiles, treeId);

  const uploadTargets = filteredFiles.slice(0, OFFSHORE_MAX_BATCH_FILES);
  const skippedCount = filteredFiles.length - uploadTargets.length;

  if (statusEl) {
    statusEl.textContent =
      uploadTargets.length === 1
        ? "⏳ ファイルを読み込み中..."
        : `⏳ ${uploadTargets.length}個のファイルを読み込み中...`;
  }

  try {
    let text;
    let statusMessage;

    if (uploadTargets.length === 1) {
      const formData = new FormData();
      formData.append("file", uploadTargets[0]);
      const result = await postFormData("/api/v1/files/extract-text", formData);
      text = result.text;
      statusMessage = `✅ ${result.originalFilename}（${result.text.length}文字${
        result.truncated ? "・切り捨て" : ""
      }）`;
    } else {
      const formData = new FormData();
      uploadTargets.forEach((file) => formData.append("files", file, getRelativePath(file)));
      const result = await postFormData("/api/v1/files/extract-text-batch", formData);
      text = result.text;
      statusMessage = `✅ ${result.includedFileCount}個のファイルを読み込みました（合計${
        result.text.length
      }文字${result.truncated ? "・切り捨て" : ""}）`;
    }

    if (skippedCount > 0) {
      statusMessage += `\n※ 選択した${filteredFiles.length}件のうち、AI分析には先頭${uploadTargets.length}件のみ使用されました。`;
    }

    OFFSHORE_UPLOADED_TEXT[storeKey] = text;
    if (kind === "requirement") {
      const reqInput = $("requirementTextInput");
      if (reqInput && text) reqInput.value = text;
    }
    if (statusEl) {
      statusEl.textContent = statusMessage;
    }
  } catch (err) {
    OFFSHORE_UPLOADED_TEXT[storeKey] = null;
    if (statusEl) {
      statusEl.textContent = `⚠️ ${err.message}`;
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
  box.textContent = "🤖 AIが仕様書とコードを比較しています...";
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

function resolveUnitTestSourceCode() {
  return OFFSHORE_UPLOADED_TEXT.unittest || OFFSHORE_UPLOADED_TEXT.code || OFFSHORE_TEST_SAMPLE.codeText;
}

function resolveRequirementText() {
  const typed = $("requirementTextInput")?.value.trim();
  return typed || OFFSHORE_UPLOADED_TEXT.requirement || OFFSHORE_TEST_SAMPLE.requirementText;
}

function showUnitTestResult(analysisText, riskWarningText) {
  const output = $("unittestOutput");
  const note = $("unittestRiskNote");
  if (output) output.value = analysisText || "";
  if (note) note.textContent = riskWarningText ? `⚠️ ${riskWarningText}` : "";
}

async function runTestCaseGeneration() {
  const btn = $("btnGenerateTestCases");
  const output = $("unittestOutput");
  if (!btn || !output) return;

  const specText = resolveRequirementText();
  const codeText = OFFSHORE_UPLOADED_TEXT.unittest || OFFSHORE_UPLOADED_TEXT.code || "";

  const originalLabel = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "🤖 生成中...";
  output.value = "";
  output.placeholder = "AIがRBTテストケースを生成しています...";

  try {
    const result = await postJson("/api/v1/copilot/review-offshore", {
      mode: "TEST_CASE_GEN",
      specText,
      codeText: codeText || null,
    });
    showUnitTestResult(result.analysisText, result.riskWarningText);
    showToast("✅ 完了", "テストケースを生成しました。", "success");
  } catch (err) {
    showUnitTestResult(`⚠️ ${err.message}`, "");
    notifyAiFailure(err);
  } finally {
    output.placeholder = "生成ボタンを押すと、ここにテストケースまたはテストコードが表示されます...";
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }
}

async function runUnitTestGeneration() {
  const btn = $("btnGenerateUnitTests");
  const output = $("unittestOutput");
  if (!btn || !output) return;

  const originalLabel = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "🤖 生成中...";
  output.value = "";
  output.placeholder = "AIがUnit Testを生成しています...";

  try {
    const result = await postJson("/api/v1/copilot/review-offshore", {
      mode: "UNIT_TEST_GEN",
      codeText: resolveUnitTestSourceCode(),
      testFramework: $("unittestFrameworkSelect")?.value || null,
    });
    showUnitTestResult(result.analysisText, result.riskWarningText);
    showToast("✅ 完了", "Unit Testを生成しました。", "success");
  } catch (err) {
    showUnitTestResult(`⚠️ ${err.message}`, "");
    notifyAiFailure(err);
  } finally {
    output.placeholder = "生成ボタンを押すと、ここにテストケースまたはテストコードが表示されます...";
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }
}

function copyUnitTestOutput(buttonEl) {
  const content = $("unittestOutput")?.value.trim();
  if (!content) {
    alert("先にテストケースまたはUnit Testを生成してください。");
    return;
  }
  handleSendAction(buttonEl, () => {
    navigator.clipboard.writeText(content).then(
      () => showToast("📋 コピー完了", "生成結果をクリップボードにコピーしました。", "success"),
      () => {
        $("unittestOutput")?.select();
        document.execCommand("copy");
        showToast("📋 コピー完了", "生成結果をクリップボードにコピーしました。", "success");
      }
    );
  });
}

/* ---------- 17. GMAIL DEEP-LINK & CHỐNG SPAM CLICK ---------- */

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

/* ---------- 18. WBS IMPORT (📁 WBSインポート) ---------- */

// Giả lập AI phân tích file WBS được chọn (không parse nội dung thật - đúng như yêu cầu demo):
// hiện Progress Overlay mô phỏng việc "đọc" file theo dung lượng thật (hỗ trợ hình dung tới quy
// mô project ~1GB mà không đọc toàn bộ nội dung vào bộ nhớ), rồi tự động thêm 3 task mock vào
// Project đang được lọc (hoặc Project đầu tiên nếu chưa chọn Project nào) và cập nhật lại UI.
async function handleWbsFileImport(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;

  await simulateStreamProgress(
    file.size,
    `✨ AIがWBSファイル「${file.name}」（${formatFileSize(file.size)}）を解析しています...`
  );

  const allProjects = getAllProjects();
  const targetProjectId = activeProjectFilter || (allProjects[0] && allProjects[0].id) || null;
  const stamp = Date.now();
  const mockTasks = [
    { id: `wbs-${stamp}-1`, projectId: targetProjectId, title: "API設計", priority: "medium", dueDate: toDateKey(addDays(TODAY, 2)), category: "work" },
    { id: `wbs-${stamp}-2`, projectId: targetProjectId, title: "ロジック実装", priority: "high", dueDate: toDateKey(addDays(TODAY, 4)), category: "work" },
    { id: `wbs-${stamp}-3`, projectId: targetProjectId, title: "単体テスト", priority: "medium", dueDate: toDateKey(addDays(TODAY, 6)), category: "work" },
  ];

  USER_ADDED_TASKS.push(...mockTasks);
  saveUserTasks();
  refreshAll();
  showToast("✅ インポート完了", `WBSファイルから${mockTasks.length}件のタスクを追加しました。`, "success");
  inputEl.value = "";
}

/* ---------- 19. THEME (⚙️ 表示設定: Light / Dark / Glassmorphism) ---------- */

const THEME_STORAGE_KEY = "brseCopilotTheme";

function applyTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch (e) {
    /* localStorage が使用できない環境（プライベートモード等）では保存をスキップ */
  }
  updateThemeModalActiveState(themeName);
}

function updateThemeModalActiveState(themeName) {
  document.querySelectorAll(".theme-option-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.themeValue === themeName);
  });
}

function openThemeModal() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  updateThemeModalActiveState(current);
  updateAccentSwatchActiveState(localStorage.getItem(ACCENT_COLOR_STORAGE_KEY) || DEFAULT_ACCENT_COLOR);
  $("themeModal")?.classList.remove("hidden");
}

function closeThemeModal() {
  $("themeModal")?.classList.add("hidden");
}

/* ---------- 19b. ACCENT COLOR（表示設定：アクセントカラーを自由に選択） ---------- */

const ACCENT_COLOR_STORAGE_KEY = "brseCopilotAccentColor";
const DEFAULT_ACCENT_COLOR = "#4d8fe8";

// Làm tối 1 màu hex theo tỷ lệ (0~1) để dùng cho --blue-dark (hover/active state) - tính thủ công
// thay vì dùng color-mix() ở đây vì cần set qua JS (style.setProperty), không phải trong CSS tĩnh.
function darkenHexColor(hex, amount) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const factor = 1 - amount;
  const toHex = (channel) => Math.max(0, Math.round(channel * factor)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function applyAccentColor(hex) {
  if (!hex) return;
  document.documentElement.style.setProperty("--blue", hex);
  document.documentElement.style.setProperty("--blue-dark", darkenHexColor(hex, 0.18));
  try {
    localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, hex);
  } catch (e) {
    /* localStorage が使用できない環境（プライベートモード等）では保存をスキップ */
  }
  updateAccentSwatchActiveState(hex);
}

function updateAccentSwatchActiveState(hex) {
  const normalized = (hex || "").toLowerCase();
  document.querySelectorAll(".accent-color-swatch[data-accent-value]").forEach((swatch) => {
    swatch.classList.toggle("is-active", swatch.dataset.accentValue.toLowerCase() === normalized);
  });
}

/* ---------- 19c. 背景画像（表示設定：画面全体にうっすら表示する背景画像） ---------- */

const BG_IMAGE_STORAGE_KEY = "brseCopilotBgImage";
const BG_IMAGE_MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB（localStorageに保存するため大きすぎる画像は拒否）

function applyBgImage(dataUrl) {
  if (!dataUrl) {
    document.documentElement.style.removeProperty("--custom-bg-image");
    document.documentElement.classList.remove("has-custom-bg");
    return;
  }
  document.documentElement.style.setProperty("--custom-bg-image", `url("${dataUrl}")`);
  document.documentElement.classList.add("has-custom-bg");
}

function handleBgImageSelect(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("画像ファイルを選択してください。");
    inputEl.value = "";
    return;
  }
  if (file.size > BG_IMAGE_MAX_SIZE_BYTES) {
    alert(`画像サイズが大きすぎます（上限${formatFileSize(BG_IMAGE_MAX_SIZE_BYTES)}）。`);
    inputEl.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    applyBgImage(dataUrl);
    try {
      localStorage.setItem(BG_IMAGE_STORAGE_KEY, dataUrl);
    } catch (e) {
      showToast("⚠️ 保存できませんでした", "画像が大きすぎるため保存に失敗しました。表示のみ反映されます。", "error");
    }
    showToast("✅ 設定完了", "背景画像を設定しました。", "success");
  };
  reader.onerror = () => {
    alert("画像の読み込みに失敗しました。");
  };
  reader.readAsDataURL(file);
  inputEl.value = "";
}

function clearBgImage() {
  applyBgImage(null);
  try {
    localStorage.removeItem(BG_IMAGE_STORAGE_KEY);
  } catch (e) {
    /* localStorage が使用できない環境（プライベートモード等）では無視 */
  }
  showToast("✅ 削除完了", "背景画像を削除しました。", "success");
}

// Khôi phục Accent Color + Background Image đã lưu khi tải lại trang (theme Light/Dark/Glass đã
// được áp dụng SỚM bằng inline <script> trong <head> để tránh flash; 2 setting này áp dụng ở đây
// vì cần chạy sau khi DOM đã sẵn sàng, mức độ ưu tiên chống-flash thấp hơn theme chính).
function restoreSavedAppearanceSettings() {
  try {
    const savedAccent = localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
    if (savedAccent) {
      applyAccentColor(savedAccent);
      const customInput = $("accentColorCustomInput");
      if (customInput && /^#[0-9a-f]{6}$/i.test(savedAccent)) customInput.value = savedAccent;
    }

    const savedBgImage = localStorage.getItem(BG_IMAGE_STORAGE_KEY);
    if (savedBgImage) applyBgImage(savedBgImage);
  } catch (e) {
    /* localStorage bị chặn (private mode...) - bỏ qua, dùng mặc định */
  }
}

/* ---------- 20. WELCOME SPLASH - Chào hỏi đầu ngày (chỉ hiện 1 lần/ngày) ---------- */

const LAST_GREETED_STORAGE_KEY = "brseCopilotLastGreetedDate";

function buildGreetingHeadline() {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます！";
  if (hour < 18) return "こんにちは！";
  return "お疲れ様です！";
}

function checkAndShowWelcomeSplash() {
  const todayKey = toDateKey(TODAY);
  const splash = $("welcomeSplash");
  const headlineEl = $("splashHeadline");
  const textEl = $("splashText");
  if (!splash || !headlineEl || !textEl) return;

  if (localStorage.getItem(LAST_GREETED_STORAGE_KEY) === todayKey) return;

  const todayTaskCount = getAllTasksCombined().filter((task) => task.dueDate === todayKey).length;
  headlineEl.textContent = buildGreetingHeadline();
  textEl.textContent =
    todayTaskCount === 0
      ? "本日期日のタスクはありません。個人目標の達成に時間を使いましょう！"
      : `本日は期日のタスクが${todayTaskCount}件あります。一緒に頑張りましょう！`;

  splash.classList.remove("is-hidden");
  localStorage.setItem(LAST_GREETED_STORAGE_KEY, todayKey);
}

function closeSplashScreen() {
  $("welcomeSplash")?.classList.add("is-hidden");
}

/* ---------- 21. HAMBURGER & OFF-CANVAS PANELS (Tablet/Mobile) ---------- */

function toggleLeftSidebar() {
  document.body.classList.toggle("sidebar-left-open");
}

function closeOffCanvasPanels() {
  document.body.classList.remove("sidebar-left-open");
  document.body.classList.remove("sidebar-right-open");
  document.body.classList.remove("agent-chat-open");
}

function initSidebarRightDefaultState() {
  /* Cột phải là Task Detail: luôn hiện trên desktop; chat không dùng class này. */
}

/* ---------- 22. INIT ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarRightDefaultState();
  restoreSavedAppearanceSettings();
  renderProjectList();
  renderTodayList();
  initFullCalendar();
  renderCalendarDragRail();
  initTaskDragDrop();
  loadCalendarSettings();
  updateAgentStatusLine();
  checkAndShowWelcomeSplash();
});
