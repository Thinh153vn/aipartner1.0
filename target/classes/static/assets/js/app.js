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
 * Gọi POST JSON tới backend, luôn ném ApiError với message thân thiện khi thất bại
 * (timeout, mất mạng, hoặc lỗi trả về từ GlobalExceptionHandler phía Spring Boot).
 */
async function postJson(url, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (networkError) {
    if (networkError.name === "AbortError") {
      throw new ApiError("AIの応答がタイムアウトしました。しばらくしてから再度お試しください。");
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
    const message = (payload && payload.message) || "AIエージェントとの通信でエラーが発生しました。";
    throw new ApiError(message, response.status);
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

    MOCK_DATA.tasks
      .filter((task) => task.date === dateKey)
      .forEach((task) => {
        const pill = document.createElement("div");
        pill.className = `task-pill status-${getTaskStatus(task.date)}`;
        pill.textContent = task.title;
        pill.title = task.title;
        cell.appendChild(pill);
      });

    grid.appendChild(cell);
  }
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
      specText: OFFSHORE_SPEC_SAMPLE.specText,
      codeText: OFFSHORE_SPEC_SAMPLE.codeText,
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
  initModalOutsideClick();
});
