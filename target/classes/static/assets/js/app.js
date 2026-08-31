/* =========================================================
   GROWTH PARTNER - カレンダー中心のSaaSワークスペース
   File: assets/js/app.js
   フロントは同一オリジンの Spring Boot + Spring AI REST API を呼び出す（CORS不要）。
   プロジェクト／タスクは CRUD API が無いため、ブラウザの localStorage で保持する。
   ========================================================= */

/* ---------- 1. 共通ヘルパー ---------- */

function $(id) {
  return document.getElementById(id);
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

/* ---------- 1b. 多言語（表示設定：言語切替） ---------- */
const I18N_STORAGE_KEY = "app_language";
const I18N_DEFAULT = "ja";

const translations = {
  ja: {
    pageTitle: "GROWTH PARTNER | ワークスペース",
    menu: "メニュー",
    notifications: "通知",
    userRole: "BrSE / 保険システム開発",
    addTask: "タスク追加",
    search: "検索",
    searchPlaceholder: "タスクを検索...",
    today: "今日",
    calendar: "カレンダー",
    projects: "プロジェクト（WBS）",
    addNew: "新規追加",
    aiTools: "AIツール",
    wbsImport: "WBSインポート",
    nippo: "日報作成",
    offshore: "オフショア支援",
    apiKeySettings: "APIキー設定",
    settings: "表示設定",
    aiAutoSchedule: "AIタスク自動調整",
    sos: "緊急SOS",
    backToToday: "今日のタスクへ戻る",
    statTodo: "未着手",
    statInProgress: "対応中",
    statDone: "完了",
    statOverdue: "期限超過",
    chartCompletion: "タスク完了率",
    chartPriority: "優先度別タスク件数",
    taskList: "タスク一覧",
    colDone: "完了",
    colTaskName: "タスク名（クリックで詳細）",
    colDue: "期日",
    colPriority: "優先度",
    googleSync: "Google同期",
    aiAnalyze: "AI分析",
    legendTask: "タスク",
    legendLearning: "AIおすすめ学習",
    legendMeeting: "会議・打ち合わせ",
    legendGoogle: "Googleカレンダー",
    dragToSchedule: "ドラッグしてスケジュール",
    taskDetailEmpty: "タスクを選択すると、ここに詳細が表示されます。",
    close: "閉じる",
    taskName: "タスク名",
    project: "プロジェクト",
    dueDate: "期日",
    priority: "優先度",
    priorityHigh: "高",
    priorityMedium: "中",
    priorityLow: "低",
    memo: "メモ",
    memoPlaceholder: "引き継ぎ事項や補足情報を記入...",
    subtasks: "サブタスク",
    addSubtaskPlaceholder: "サブタスクを追加...",
    add: "追加",
    markDone: "完了にする",
    markUndone: "未完了に戻す",
    autoReschedule: "自動リスケジュール",
    chatEmpty: "ここにAIエージェントの実行ログと会話が表示されます。",
    chatPlaceholder: "AIに話しかける（例：今週のタスクを整理して）",
    talkToAi: "GROWTH PARTNERに話しかける",
    splashStart: "業務を開始する",
    languageLabel: "🌐 言語 / Language / Ngôn ngữ",
    settingsSubtitle: "お好みのテーマを選択してください。設定は自動的に保存されます。",
    themeLight: "ライト",
    themeDark: "ダーク",
    themeGlass: "グラスモーフィズム",
    accentColor: "アクセントカラー",
    bgImage: "背景画像",
    selectImage: "画像を選択",
    delete: "削除",
    bgHint: "背景画像を設定すると、画面全体にうっすらと表示されます（カード等の可読性は保たれます）。",
    sosResultTitle: "緊急SOS - AI分析結果",
    riskSummary: "リスク要約",
    sosEmailLabel: "PM／先輩への連絡文面（編集可能）",
    sosSend: "PM・先輩へ送信（Gmail）",
    newTask: "新しいタスク",
    taskNameExample: "例）保険料計算ロジックの実装",
    addSubmit: "追加する",
    newProject: "新規プロジェクト",
    projectName: "プロジェクト名",
    projectNameExample: "例）解約返戻金システム改修",
    color: "カラー",
    nippoTitle: "日報の自動生成",
    nippoLogLabel: "本日の作業ログ（Git commit・メモなど）",
    nippoLogPlaceholder: "git commit -m \"feat: 保険料計算ロジックの実装\" のように貼り付けてください...",
    nippoGenerate: "AIで日報を自動作成",
    nippoOutputLabel: "生成された日報（編集可能）",
    nippoOutputPlaceholder: "「AIで日報を自動作成」を押すと、ここに日報が生成されます。送信前に自由に編集できます...",
    nippoSend: "上司へ報告書を送信（Gmail）",
    tabSpecDiff: "仕様とコード比較",
    tabShadow: "顧客質問レビュー",
    tabTest: "テスト支援",
    specFileLabel: "仕様書ファイル（PDF / テキスト・複数選択可）",
    selectFile: "ファイルを選択",
    selectFolder: "フォルダを選択",
    fileStatusSample: "未選択（サンプルを使用）",
    codeFolderLabel: "コードフォルダ（フォルダ選択・複数ファイル可）",
    specDiffNote: "「🤖 AIで比較する」を押すと、仕様書とコードの不整合・セキュリティリスクをAIが分析します。",
    runSpecDiff: "AIで比較する",
    rawQuestionPlaceholder: "お客様への質問を、母国語または簡単な日本語で入力...",
    reviewQuestion: "AIで確認・翻訳",
    businessJp: "ビジネス日本語訳",
    aiRisk: "AIによるリスク警告",
    sendQA: "お客様へ質問を送信（Gmail）",
    testSupportIntro: "要件からテストケース（リスクベース）を作成し、ソースコードからユニットテストを自動生成します。未入力の場合は保険システムのサンプルを使用します。",
    reqFileLabel: "要件ファイル（PDF / Markdown・任意）",
    reqStatusDefault: "未選択（下のテキストまたはサンプルを使用）",
    reqTextLabel: "要件・受け入れ条件",
    reqTextPlaceholder: "モジュール、受け入れ条件、正常系／代替系／異常系を記入...",
    sourceCodeLabel: "ソースコード（フォルダ選択可）",
    unittestStatusDefault: "未選択（サンプルコードを使用）",
    frameworkLabel: "ユニットテストのフレームワーク",
    frameworkAuto: "自動判定（Java→JUnit5 / JS,TS→Jest）",
    frameworkJunit: "JUnit5 + Mockito（Java）",
    frameworkJest: "Jest（JavaScript / TypeScript）",
    genTestCases: "テストケースを生成",
    genUnitTests: "ユニットテストを生成",
    outputLabel: "生成結果（編集・コピー可能）",
    outputPlaceholder: "生成ボタンを押すと、ここにテストケースまたはテストコードが表示されます...",
    copyResult: "結果をコピー",
    gcalTitle: "Googleカレンダー連携設定",
    gcalSettingsTitle: "Google連携設定",
    loading: "読み込み中...",
    calendarId: "カレンダーID",
    calendarIdExample: "例）your-account@gmail.com",
    gcalApiKey: "APIキー（登録済みの場合は空欄でも構いません）",
    gcalApiKeyPlaceholder: "Google Cloud Consoleで発行したAPIキー",
    saveSettings: "設定を保存",
    processing: "処理中...",
    apiKeyDesc: "AI機能をご利用いただくには、ご自身のGemini APIキーを入力してください。キーはこのブラウザ内（localStorage）にのみ保存され、サーバーへはAIリクエスト時だけ送信されます。",
    apiKeyWarning: "AI機能を利用する前に、APIキーを入力してください。",
    apiKeyLabel: "APIキー",
    apiKeyPlaceholder: "AIza... または Gemini APIキー",
    cancel: "キャンセル",
    save: "保存",
    progressDone: "{done}/{total} 完了",
    overdueBanner: "{count}件のタスクが期限を超過しています（最大{days}日超過）",
    overdueDays: "期限超過（{days}日）",
    noTasks: "表示できるタスクがありません。",
    dashboardTitle: "{name} ダッシュボード",
    projectDashboard: "プロジェクトダッシュボード",
    noProjectTasks: "このプロジェクトにはまだタスクがありません。",
    noSubtasks: "サブタスクはありません。",
    unset: "未設定",
    noSchedulable: "スケジュール可能なタスクはありません。",
    toggleDoneTitle: "クリックで完了/未完了を切り替え",
    openDetailTitle: "クリックで詳細を開く",
    taskCount: "タスク件数",
    greetingMorning: "おはようございます！",
    greetingAfternoon: "こんにちは！",
    greetingEvening: "お疲れ様です！",
    splashNoTasks: "本日期日のタスクはありません。個人目標の達成に時間を使いましょう！",
    splashHasTasks: "本日は期日のタスクが{count}件あります。一緒に頑張りましょう！",
    agentNoTasks: "本日期日のタスクはありません。個人目標に集中しましょう！",
    agentTodayStatus: "本日のタスク: {done}/{total} 完了です。",
    apiKeySavedStatus: "このブラウザにAPIキーが保存されています。上書きする場合は新しいキーを入力してください。",
    needApiKey: "AI機能を利用する前に、APIキーを入力してください。",
    enterApiKey: "APIキーを入力してください。",
    apiKeySaved: "APIキーをこのブラウザに保存しました。",
    gcalConfigured: "✅ 設定済みです。「Google同期」ボタンで最新の予定を取り込めます。",
    gcalNotConfigured: "⚠️ 未設定です。カレンダーIDとAPIキーを登録してください。",
    gcalLoadFailed: "⚠️ 設定状態を取得できませんでした。",
  },
  en: {
    pageTitle: "GROWTH PARTNER | Workspace",
    menu: "Menu",
    notifications: "Notifications",
    userRole: "BrSE / Insurance systems",
    addTask: "Add task",
    search: "Search",
    searchPlaceholder: "Search tasks...",
    today: "Today",
    calendar: "Calendar",
    projects: "Projects (WBS)",
    addNew: "Add new",
    aiTools: "AI tools",
    wbsImport: "Import WBS",
    nippo: "Daily report",
    offshore: "Offshore support",
    apiKeySettings: "API key",
    settings: "Display settings",
    aiAutoSchedule: "AI auto-schedule",
    sos: "Emergency SOS",
    backToToday: "Back to today's tasks",
    statTodo: "To do",
    statInProgress: "In progress",
    statDone: "Done",
    statOverdue: "Overdue",
    chartCompletion: "Task completion",
    chartPriority: "Tasks by priority",
    taskList: "Task list",
    colDone: "Done",
    colTaskName: "Task name (click for details)",
    colDue: "Due date",
    colPriority: "Priority",
    googleSync: "Google sync",
    aiAnalyze: "AI analysis",
    legendTask: "Task",
    legendLearning: "AI learning suggestion",
    legendMeeting: "Meeting",
    legendGoogle: "Google Calendar",
    dragToSchedule: "Drag to schedule",
    taskDetailEmpty: "Select a task to view its details here.",
    close: "Close",
    taskName: "Task name",
    project: "Project",
    dueDate: "Due date",
    priority: "Priority",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    memo: "Memo",
    memoPlaceholder: "Handover notes and extra details...",
    subtasks: "Subtasks",
    addSubtaskPlaceholder: "Add a subtask...",
    add: "Add",
    markDone: "Mark as done",
    markUndone: "Mark as not done",
    autoReschedule: "Auto reschedule",
    chatEmpty: "AI agent logs and conversation appear here.",
    chatPlaceholder: "Talk to AI (e.g. Organize this week's tasks)",
    talkToAi: "Talk to GROWTH PARTNER",
    splashStart: "Start work",
    languageLabel: "🌐 言語 / Language / Ngôn ngữ",
    settingsSubtitle: "Choose your preferred theme. Settings are saved automatically.",
    themeLight: "Light",
    themeDark: "Dark",
    themeGlass: "Glassmorphism",
    accentColor: "Accent color",
    bgImage: "Background image",
    selectImage: "Choose image",
    delete: "Remove",
    bgHint: "A background image appears faintly behind the UI while keeping cards readable.",
    sosResultTitle: "Emergency SOS - AI analysis",
    riskSummary: "Risk summary",
    sosEmailLabel: "Message to PM / senior (editable)",
    sosSend: "Send to PM / senior (Gmail)",
    newTask: "New task",
    taskNameExample: "e.g. Implement premium calculation logic",
    addSubmit: "Add",
    newProject: "New project",
    projectName: "Project name",
    projectNameExample: "e.g. Surrender value system update",
    color: "Color",
    nippoTitle: "Daily report generation",
    nippoLogLabel: "Today's work log (Git commits, notes, etc.)",
    nippoLogPlaceholder: "Paste like: git commit -m \"feat: implement premium calculation\"",
    nippoGenerate: "Generate report with AI",
    nippoOutputLabel: "Generated report (editable)",
    nippoOutputPlaceholder: "Press “Generate report with AI” to create a draft you can edit before sending.",
    nippoSend: "Send report to manager (Gmail)",
    tabSpecDiff: "Spec vs code",
    tabShadow: "Client question review",
    tabTest: "Test support",
    specFileLabel: "Specification files (PDF / text, multiple)",
    selectFile: "Choose file",
    selectFolder: "Choose folder",
    fileStatusSample: "None selected (sample will be used)",
    codeFolderLabel: "Code folder (folder select, multiple files)",
    specDiffNote: "Press “Compare with AI” to analyze spec/code mismatches and security risks.",
    runSpecDiff: "Compare with AI",
    rawQuestionPlaceholder: "Enter the customer question in your language or simple Japanese...",
    reviewQuestion: "Review and translate with AI",
    businessJp: "Business Japanese draft",
    aiRisk: "AI risk warning",
    sendQA: "Send question to customer (Gmail)",
    testSupportIntro: "Create risk-based test cases from requirements and unit tests from source code. Samples are used if nothing is entered.",
    reqFileLabel: "Requirement files (PDF / Markdown, optional)",
    reqStatusDefault: "None selected (text below or sample will be used)",
    reqTextLabel: "Requirements / acceptance criteria",
    reqTextPlaceholder: "Enter module, acceptance criteria, and happy / alternate / exception paths...",
    sourceCodeLabel: "Source code (folder selectable)",
    unittestStatusDefault: "None selected (sample code will be used)",
    frameworkLabel: "Unit test framework",
    frameworkAuto: "Auto-detect (Java→JUnit5 / JS,TS→Jest)",
    frameworkJunit: "JUnit5 + Mockito (Java)",
    frameworkJest: "Jest (JavaScript / TypeScript)",
    genTestCases: "Generate test cases",
    genUnitTests: "Generate unit tests",
    outputLabel: "Result (editable / copyable)",
    outputPlaceholder: "Generated test cases or test code will appear here...",
    copyResult: "Copy result",
    gcalTitle: "Google Calendar settings",
    gcalSettingsTitle: "Google Calendar settings",
    loading: "Loading...",
    calendarId: "Calendar ID",
    calendarIdExample: "e.g. your-account@gmail.com",
    gcalApiKey: "API key (leave blank if already saved)",
    gcalApiKeyPlaceholder: "API key from Google Cloud Console",
    saveSettings: "Save settings",
    processing: "Processing...",
    apiKeyDesc: "Enter your own Gemini API key to use AI features. The key is stored only in this browser (localStorage) and sent only with AI requests.",
    apiKeyWarning: "Please enter an API key before using AI features.",
    apiKeyLabel: "API key",
    apiKeyPlaceholder: "AIza... or Gemini API key",
    cancel: "Cancel",
    save: "Save",
    progressDone: "{done}/{total} done",
    overdueBanner: "{count} task(s) are overdue (max {days} day(s))",
    overdueDays: "Overdue ({days} days)",
    noTasks: "No tasks to display.",
    dashboardTitle: "{name} dashboard",
    projectDashboard: "Project dashboard",
    noProjectTasks: "This project has no tasks yet.",
    noSubtasks: "No subtasks.",
    unset: "Not set",
    noSchedulable: "No tasks available to schedule.",
    toggleDoneTitle: "Click to toggle done / not done",
    openDetailTitle: "Click to open details",
    taskCount: "Task count",
    greetingMorning: "Good morning!",
    greetingAfternoon: "Good afternoon!",
    greetingEvening: "Good evening!",
    splashNoTasks: "No tasks due today. Use the time for your personal goals!",
    splashHasTasks: "You have {count} task(s) due today. Let's get started!",
    agentNoTasks: "No tasks due today. Focus on your personal goals!",
    agentTodayStatus: "Today's tasks: {done}/{total} done.",
    apiKeySavedStatus: "An API key is saved in this browser. Enter a new key to replace it.",
    needApiKey: "Please enter an API key before using AI features.",
    enterApiKey: "Please enter an API key.",
    apiKeySaved: "API key saved in this browser.",
    gcalConfigured: "✅ Configured. Use “Google sync” to import the latest events.",
    gcalNotConfigured: "⚠️ Not configured. Please register a Calendar ID and API key.",
    gcalLoadFailed: "⚠️ Could not load the settings status.",
  },
  vi: {
    pageTitle: "GROWTH PARTNER | Không gian làm việc",
    menu: "Menu",
    notifications: "Thông báo",
    userRole: "BrSE / Hệ thống bảo hiểm",
    addTask: "Thêm task",
    search: "Tìm kiếm",
    searchPlaceholder: "Tìm task...",
    today: "Hôm nay",
    calendar: "Lịch",
    projects: "Dự án (WBS)",
    addNew: "Thêm mới",
    aiTools: "Công cụ AI",
    wbsImport: "Nhập WBS",
    nippo: "Báo cáo ngày",
    offshore: "Hỗ trợ offshore",
    apiKeySettings: "Cài đặt API key",
    settings: "Cài đặt giao diện",
    aiAutoSchedule: "AI tự điều chỉnh lịch",
    sos: "SOS khẩn cấp",
    backToToday: "Quay lại task hôm nay",
    statTodo: "Chưa làm",
    statInProgress: "Đang làm",
    statDone: "Hoàn thành",
    statOverdue: "Quá hạn",
    chartCompletion: "Tỷ lệ hoàn thành",
    chartPriority: "Số task theo ưu tiên",
    taskList: "Danh sách task",
    colDone: "Xong",
    colTaskName: "Tên task (bấm để xem chi tiết)",
    colDue: "Hạn",
    colPriority: "Ưu tiên",
    googleSync: "Đồng bộ Google",
    aiAnalyze: "Phân tích AI",
    legendTask: "Task",
    legendLearning: "Gợi ý học tập AI",
    legendMeeting: "Họp",
    legendGoogle: "Google Calendar",
    dragToSchedule: "Kéo để xếp lịch",
    taskDetailEmpty: "Chọn một task để xem chi tiết tại đây.",
    close: "Đóng",
    taskName: "Tên task",
    project: "Dự án",
    dueDate: "Hạn",
    priority: "Ưu tiên",
    priorityHigh: "Cao",
    priorityMedium: "Trung bình",
    priorityLow: "Thấp",
    memo: "Ghi chú",
    memoPlaceholder: "Nội dung bàn giao và thông tin bổ sung...",
    subtasks: "Task con",
    addSubtaskPlaceholder: "Thêm task con...",
    add: "Thêm",
    markDone: "Đánh dấu hoàn thành",
    markUndone: "Đưa về chưa hoàn thành",
    autoReschedule: "Tự sắp xếp lại lịch",
    chatEmpty: "Nhật ký và hội thoại với AI sẽ hiện ở đây.",
    chatPlaceholder: "Nói với AI (ví dụ: Sắp xếp task tuần này)",
    talkToAi: "Trò chuyện với GROWTH PARTNER",
    splashStart: "Bắt đầu công việc",
    languageLabel: "🌐 言語 / Language / Ngôn ngữ",
    settingsSubtitle: "Chọn giao diện bạn thích. Cài đặt được lưu tự động.",
    themeLight: "Sáng",
    themeDark: "Tối",
    themeGlass: "Kính mờ",
    accentColor: "Màu nhấn",
    bgImage: "Ảnh nền",
    selectImage: "Chọn ảnh",
    delete: "Xóa",
    bgHint: "Ảnh nền hiển thị mờ phía sau, vẫn đảm bảo chữ trên thẻ dễ đọc.",
    sosResultTitle: "SOS khẩn cấp - Kết quả AI",
    riskSummary: "Tóm tắt rủi ro",
    sosEmailLabel: "Nội dung gửi PM / tiền bối (có thể sửa)",
    sosSend: "Gửi PM / tiền bối (Gmail)",
    newTask: "Task mới",
    taskNameExample: "VD) Implement logic tính phí bảo hiểm",
    addSubmit: "Thêm",
    newProject: "Dự án mới",
    projectName: "Tên dự án",
    projectNameExample: "VD) Cải tiến hệ thống hoàn phí",
    color: "Màu",
    nippoTitle: "Tạo báo cáo ngày",
    nippoLogLabel: "Nhật ký công việc hôm nay (Git commit, ghi chú...)",
    nippoLogPlaceholder: "Dán như: git commit -m \"feat: implement premium calculation\"",
    nippoGenerate: "AI tạo báo cáo ngày",
    nippoOutputLabel: "Báo cáo đã tạo (có thể sửa)",
    nippoOutputPlaceholder: "Bấm “AI tạo báo cáo ngày” để sinh bản nháp, rồi chỉnh trước khi gửi.",
    nippoSend: "Gửi báo cáo cho cấp trên (Gmail)",
    tabSpecDiff: "So sánh spec và code",
    tabShadow: "Rà soát câu hỏi khách",
    tabTest: "Hỗ trợ test",
    specFileLabel: "File đặc tả (PDF / text, chọn nhiều)",
    selectFile: "Chọn file",
    selectFolder: "Chọn thư mục",
    fileStatusSample: "Chưa chọn (sẽ dùng mẫu)",
    codeFolderLabel: "Thư mục code (chọn folder, nhiều file)",
    specDiffNote: "Bấm “AI so sánh” để phân tích lệch spec/code và rủi ro bảo mật.",
    runSpecDiff: "AI so sánh",
    rawQuestionPlaceholder: "Nhập câu hỏi gửi khách bằng tiếng mẹ đẻ hoặc tiếng Nhật đơn giản...",
    reviewQuestion: "AI kiểm tra và dịch",
    businessJp: "Bản dịch tiếng Nhật business",
    aiRisk: "Cảnh báo rủi ro từ AI",
    sendQA: "Gửi câu hỏi cho khách (Gmail)",
    testSupportIntro: "Tạo test case theo rủi ro từ yêu cầu và unit test từ source. Nếu để trống sẽ dùng mẫu hệ thống bảo hiểm.",
    reqFileLabel: "File yêu cầu (PDF / Markdown, tùy chọn)",
    reqStatusDefault: "Chưa chọn (dùng text bên dưới hoặc mẫu)",
    reqTextLabel: "Yêu cầu / tiêu chí nghiệm thu",
    reqTextPlaceholder: "Nhập module, tiêu chí, luồng bình thường / thay thế / ngoại lệ...",
    sourceCodeLabel: "Source code (có thể chọn folder)",
    unittestStatusDefault: "Chưa chọn (sẽ dùng code mẫu)",
    frameworkLabel: "Framework unit test",
    frameworkAuto: "Tự nhận diện (Java→JUnit5 / JS,TS→Jest)",
    frameworkJunit: "JUnit5 + Mockito (Java)",
    frameworkJest: "Jest (JavaScript / TypeScript)",
    genTestCases: "Tạo test case",
    genUnitTests: "Tạo unit test",
    outputLabel: "Kết quả (sửa / sao chép được)",
    outputPlaceholder: "Test case hoặc mã test sẽ hiện ở đây...",
    copyResult: "Sao chép kết quả",
    gcalTitle: "Cài đặt Google Calendar",
    gcalSettingsTitle: "Cài đặt Google Calendar",
    loading: "Đang tải...",
    calendarId: "Calendar ID",
    calendarIdExample: "VD) your-account@gmail.com",
    gcalApiKey: "API key (để trống nếu đã lưu)",
    gcalApiKeyPlaceholder: "API key từ Google Cloud Console",
    saveSettings: "Lưu cài đặt",
    processing: "Đang xử lý...",
    apiKeyDesc: "Nhập API Key của bạn để sử dụng các tính năng AI. Key sẽ được lưu an toàn trên trình duyệt của bạn (localStorage).",
    apiKeyWarning: "Vui lòng nhập API Key trước khi sử dụng tính năng AI!",
    apiKeyLabel: "API key",
    apiKeyPlaceholder: "AIza... hoặc Gemini API key",
    cancel: "Hủy",
    save: "Lưu",
    progressDone: "{done}/{total} hoàn thành",
    overdueBanner: "{count} task đã quá hạn (tối đa {days} ngày)",
    overdueDays: "Quá hạn ({days} ngày)",
    noTasks: "Không có task để hiển thị.",
    dashboardTitle: "Bảng điều khiển {name}",
    projectDashboard: "Bảng điều khiển dự án",
    noProjectTasks: "Dự án này chưa có task.",
    noSubtasks: "Không có task con.",
    unset: "Chưa đặt",
    noSchedulable: "Không có task để xếp lịch.",
    toggleDoneTitle: "Bấm để đổi hoàn thành / chưa xong",
    openDetailTitle: "Bấm để mở chi tiết",
    taskCount: "Số task",
    greetingMorning: "Chào buổi sáng!",
    greetingAfternoon: "Xin chào!",
    greetingEvening: "Chào buổi tối!",
    splashNoTasks: "Hôm nay không có task đến hạn. Hãy dùng thời gian cho mục tiêu cá nhân!",
    splashHasTasks: "Hôm nay có {count} task đến hạn. Cùng bắt đầu nhé!",
    agentNoTasks: "Hôm nay không có task đến hạn. Tập trung mục tiêu cá nhân nhé!",
    agentTodayStatus: "Task hôm nay: {done}/{total} hoàn thành.",
    apiKeySavedStatus: "API key đã lưu trên trình duyệt này. Nhập key mới nếu muốn thay.",
    needApiKey: "Vui lòng nhập API Key trước khi sử dụng tính năng AI!",
    enterApiKey: "Vui lòng nhập API key.",
    apiKeySaved: "Đã lưu API key trên trình duyệt này.",
    gcalConfigured: "✅ Đã cấu hình. Bấm “Đồng bộ Google” để lấy lịch mới nhất.",
    gcalNotConfigured: "⚠️ Chưa cấu hình. Hãy đăng ký Calendar ID và API key.",
    gcalLoadFailed: "⚠️ Không lấy được trạng thái cài đặt.",
  },
  zh: {
    pageTitle: "GROWTH PARTNER | 工作区",
    menu: "菜单",
    notifications: "通知",
    userRole: "BrSE / 保险系统开发",
    addTask: "添加任务",
    search: "搜索",
    searchPlaceholder: "搜索任务...",
    today: "今天",
    calendar: "日历",
    projects: "项目（WBS）",
    addNew: "新建",
    aiTools: "AI工具",
    wbsImport: "导入WBS",
    nippo: "日报",
    offshore: "离岸支援",
    apiKeySettings: "API密钥设置",
    settings: "显示设置",
    aiAutoSchedule: "AI自动调整任务",
    sos: "紧急SOS",
    backToToday: "返回今日任务",
    statTodo: "未开始",
    statInProgress: "进行中",
    statDone: "已完成",
    statOverdue: "已逾期",
    chartCompletion: "任务完成率",
    chartPriority: "按优先级统计",
    taskList: "任务一览",
    colDone: "完成",
    colTaskName: "任务名（点击查看详情）",
    colDue: "截止日期",
    colPriority: "优先级",
    googleSync: "Google同步",
    aiAnalyze: "AI分析",
    legendTask: "任务",
    legendLearning: "AI学习建议",
    legendMeeting: "会议",
    legendGoogle: "Google日历",
    dragToSchedule: "拖拽以安排日程",
    taskDetailEmpty: "选择任务后，详情将显示在此处。",
    close: "关闭",
    taskName: "任务名",
    project: "项目",
    dueDate: "截止日期",
    priority: "优先级",
    priorityHigh: "高",
    priorityMedium: "中",
    priorityLow: "低",
    memo: "备注",
    memoPlaceholder: "请填写交接事项和补充信息...",
    subtasks: "子任务",
    addSubtaskPlaceholder: "添加子任务...",
    add: "添加",
    markDone: "标为完成",
    markUndone: "标为未完成",
    autoReschedule: "自动重新排期",
    chatEmpty: "AI代理的执行日志和对话将显示在这里。",
    chatPlaceholder: "向AI提问（例如：整理本周任务）",
    talkToAi: "与GROWTH PARTNER对话",
    splashStart: "开始工作",
    languageLabel: "🌐 言語 / Language / Ngôn ngữ",
    settingsSubtitle: "请选择喜欢的主题。设置会自动保存。",
    themeLight: "浅色",
    themeDark: "深色",
    themeGlass: "玻璃拟态",
    accentColor: "强调色",
    bgImage: "背景图片",
    selectImage: "选择图片",
    delete: "删除",
    bgHint: "设置背景图后，画面会淡淡显示，同时保持卡片上的文字可读。",
    sosResultTitle: "紧急SOS - AI分析结果",
    riskSummary: "风险摘要",
    sosEmailLabel: "发给PM／前辈的文案（可编辑）",
    sosSend: "发送给PM／前辈（Gmail）",
    newTask: "新任务",
    taskNameExample: "例）实现保费计算逻辑",
    addSubmit: "添加",
    newProject: "新项目",
    projectName: "项目名",
    projectNameExample: "例）解约返还金系统改造",
    color: "颜色",
    nippoTitle: "自动生成日报",
    nippoLogLabel: "今日工作日志（Git commit、备忘等）",
    nippoLogPlaceholder: "请粘贴，例如：git commit -m \"feat: 实现保费计算\"",
    nippoGenerate: "用AI生成日报",
    nippoOutputLabel: "已生成的日报（可编辑）",
    nippoOutputPlaceholder: "点击“用AI生成日报”后，将在此生成草稿，发送前可自由修改。",
    nippoSend: "向上司发送报告（Gmail）",
    tabSpecDiff: "规格与代码对比",
    tabShadow: "客户提问审阅",
    tabTest: "测试支援",
    specFileLabel: "规格书文件（PDF / 文本，可多选）",
    selectFile: "选择文件",
    selectFolder: "选择文件夹",
    fileStatusSample: "未选择（将使用示例）",
    codeFolderLabel: "代码文件夹（可选文件夹、多文件）",
    specDiffNote: "点击“用AI对比”后，AI将分析规格与代码的不一致及安全风险。",
    runSpecDiff: "用AI对比",
    rawQuestionPlaceholder: "请用母语或简单日语输入给客户的提问...",
    reviewQuestion: "用AI确认并翻译",
    businessJp: "商务日语译文",
    aiRisk: "AI风险提醒",
    sendQA: "向客户发送提问（Gmail）",
    testSupportIntro: "根据需求生成基于风险的测试用例，并根据源代码生成单元测试。未输入时使用保险系统示例。",
    reqFileLabel: "需求文件（PDF / Markdown，可选）",
    reqStatusDefault: "未选择（将使用下方文本或示例）",
    reqTextLabel: "需求 / 验收条件",
    reqTextPlaceholder: "请填写模块、验收条件、正常／替代／异常路径...",
    sourceCodeLabel: "源代码（可选择文件夹）",
    unittestStatusDefault: "未选择（将使用示例代码）",
    frameworkLabel: "单元测试框架",
    frameworkAuto: "自动判断（Java→JUnit5 / JS,TS→Jest）",
    frameworkJunit: "JUnit5 + Mockito（Java）",
    frameworkJest: "Jest（JavaScript / TypeScript）",
    genTestCases: "生成测试用例",
    genUnitTests: "生成单元测试",
    outputLabel: "生成结果（可编辑／复制）",
    outputPlaceholder: "点击生成后，测试用例或测试代码将显示在这里...",
    copyResult: "复制结果",
    gcalTitle: "Google日历联动设置",
    gcalSettingsTitle: "Google联动设置",
    loading: "加载中...",
    calendarId: "日历ID",
    calendarIdExample: "例）your-account@gmail.com",
    gcalApiKey: "API密钥（若已保存可留空）",
    gcalApiKeyPlaceholder: "在Google Cloud Console发行的API密钥",
    saveSettings: "保存设置",
    processing: "处理中...",
    apiKeyDesc: "使用AI功能请输入您自己的Gemini API密钥。密钥仅保存在本浏览器（localStorage），并仅在AI请求时发送。",
    apiKeyWarning: "使用AI功能前，请先输入API密钥。",
    apiKeyLabel: "API密钥",
    apiKeyPlaceholder: "AIza... 或 Gemini API密钥",
    cancel: "取消",
    save: "保存",
    progressDone: "{done}/{total} 已完成",
    overdueBanner: "有{count}个任务已逾期（最长逾期{days}天）",
    overdueDays: "已逾期（{days}天）",
    noTasks: "没有可显示的任务。",
    dashboardTitle: "{name} 仪表板",
    projectDashboard: "项目仪表板",
    noProjectTasks: "此项目还没有任务。",
    noSubtasks: "没有子任务。",
    unset: "未设置",
    noSchedulable: "没有可安排的任务。",
    toggleDoneTitle: "点击切换完成／未完成",
    openDetailTitle: "点击打开详情",
    taskCount: "任务数",
    greetingMorning: "早上好！",
    greetingAfternoon: "你好！",
    greetingEvening: "辛苦了！",
    splashNoTasks: "今天没有到期任务。可以把时间用于个人目标！",
    splashHasTasks: "今天有{count}个到期任务。一起加油！",
    agentNoTasks: "今天没有到期任务。请专注个人目标！",
    agentTodayStatus: "今日任务：{done}/{total} 已完成。",
    apiKeySavedStatus: "此浏览器已保存API密钥。如需覆盖请输入新密钥。",
    needApiKey: "使用AI功能前，请先输入API密钥。",
    enterApiKey: "请输入API密钥。",
    apiKeySaved: "已将API密钥保存在此浏览器。",
    gcalConfigured: "✅ 已设置。请点击“Google同步”导入最新日程。",
    gcalNotConfigured: "⚠️ 尚未设置。请登记日历ID和API密钥。",
    gcalLoadFailed: "⚠️ 无法获取设置状态。",
  },
};

let currentLang = I18N_DEFAULT;

function t(key, vars) {
  const pack = translations[currentLang] || translations[I18N_DEFAULT];
  let text = (pack && pack[key]) || translations[I18N_DEFAULT][key] || key;
  if (vars) {
    Object.keys(vars).forEach((name) => {
      text = text.replaceAll(`{${name}}`, String(vars[name]));
    });
  }
  return text;
}

function getFullCalendarLocale() {
  if (currentLang === "zh") return "zh-cn";
  if (currentLang === "vi") return "vi";
  if (currentLang === "en") return "en";
  return "ja";
}

function applyI18n() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : currentLang;
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.getAttribute("data-i18n-title"));
  });

  const select = $("languageSelect");
  if (select) select.value = currentLang;

  if (mainCalendar) {
    mainCalendar.setOption("locale", getFullCalendarLocale());
  }
  if (typeof donutChartInstance !== "undefined" && donutChartInstance) {
    donutChartInstance.data.labels = [t("statInProgress"), t("statDone"), t("statOverdue")];
    donutChartInstance.update();
  }
  if (typeof barChartInstance !== "undefined" && barChartInstance) {
    barChartInstance.data.labels = [t("priorityHigh"), t("priorityMedium"), t("priorityLow")];
    if (barChartInstance.data.datasets[0]) barChartInstance.data.datasets[0].label = t("taskCount");
    barChartInstance.update();
  }
}

function changeLanguage(lang) {
  currentLang = translations[lang] ? lang : I18N_DEFAULT;
  try {
    localStorage.setItem(I18N_STORAGE_KEY, currentLang);
  } catch (e) {
    /* プライベートモード等で保存できない場合 */
  }
  applyI18n();
  if (typeof refreshAll === "function") refreshAll();
  if (typeof loadCalendarSettings === "function") loadCalendarSettings();
}

function initLanguage() {
  try {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    currentLang = translations[saved] ? saved : I18N_DEFAULT;
  } catch (e) {
    currentLang = I18N_DEFAULT;
  }
  applyI18n();
}

// Date をローカル日付の YYYY-MM-DD に変換（toISOString のタイムゾーンずれを避ける）
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ファイルサイズを人が読める単位に変換（WBS／オフショアの大容量処理表示用）
function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function getPriorityLabel(priority) {
  if (priority === "high") return t("priorityHigh");
  if (priority === "low") return t("priorityLow");
  return t("priorityMedium");
}

/* ---------- 2. 画面用のモックデータ（プロジェクト／タスク／会議） ----------
   AI応答のモックではない。サイドバー・中央・右パネル表示用の案件データ。
   対応する CRUD API が無いためクライアント側で保持する。 */

const PROJECTS_SEED = [
  { id: "proj1", name: "保険システム開発（新契約）", color: "#4d8fe8" },
  { id: "proj2", name: "契約更新機能改修", color: "#45b994" },
  { id: "proj3", name: "個人成長目標（MBO）", color: "#f5b74f" },
];

/* ---------- 2a. ユーザー追加プロジェクト（➕ 新規追加）- localStorage に保存 ---------- */
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

// 固定の会議イベント。カレンダー表示のみ（タスクではないためチェックボックスなし）。
const FIXED_MEETINGS = [
  { id: "mt1", title: "🗣 朝会（デイリースクラム）", start: `${toDateKey(TODAY)}T09:30:00`, end: `${toDateKey(TODAY)}T09:45:00` },
  { id: "mt2", title: "🧑‍🏫 PMとの1on1", start: `${toDateKey(addDays(TODAY, 2))}T16:00:00`, end: `${toDateKey(addDays(TODAY, 2))}T16:30:00` },
];

// 「Google同期」後に取り込んだ予定。セッション内の状態で、同期のたびに置き換える。
let GOOGLE_SYNCED_TASKS = [];

/* ---------- 2b. ユーザー追加タスク（➕ タスク追加）- localStorage に保存 ---------- */
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

/* ---------- 2c. タスク完了状態（localStorage に保存） ---------- */
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

// 直前に完了にしたタスクID。再描画時にその行へ bounce 演出を付ける。
let lastToggledTaskId = null;

// AIが期日を動かしたタスクID。カレンダー上のパルス演出用（永続化しない）。
let AI_NEW_TASK_IDS = new Set();

/* ---------- 2d. タスク共通ヘルパー（サイドバー／中央／右パネル） ---------- */

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

// ユーザー追加タスクなら変更後に localStorage へ保存する。
// シード／Google同期タスクはセッション内のみのため永続化しない。
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

// 中央パネルの一覧。初期は「今日」（本日期日または期限超過）。
// プロジェクト絞り込み時はそのWBS配下。検索語があればさらに絞り込む。
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

/* ---------- 3. APIクライアント（実fetch） ---------- */

const API_TIMEOUT_MS = 30000;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ---------- 3a. BYOK：ユーザーAPIキー（localStorage） ---------- */
const USER_API_KEY_STORAGE_KEY = "user_custom_api_key";

function getStoredUserApiKey() {
  try {
    return (localStorage.getItem(USER_API_KEY_STORAGE_KEY) || "").trim();
  } catch (e) {
    return "";
  }
}

function isAiEndpoint(url) {
  return typeof url === "string" && url.includes("/api/v1/copilot/");
}

function openApiKeyModal(options = {}) {
  const input = $("userApiKeyInput");
  const warning = $("apiKeyModalWarning");
  const status = $("apiKeyModalStatus");
  const stored = getStoredUserApiKey();

  if (input) input.value = stored;
  if (warning) warning.classList.toggle("hidden", !options.required);
  if (status) {
    status.textContent = stored ? t("apiKeySavedStatus") : "";
  }

  $("apiKeyModal")?.classList.remove("hidden");
  if (options.required) {
    showToast("⚠️", t("needApiKey"), "error");
  }
}

function closeApiKeyModal() {
  $("apiKeyModal")?.classList.add("hidden");
  $("apiKeyModalWarning")?.classList.add("hidden");
}

function saveUserApiKey() {
  const input = $("userApiKeyInput");
  const keyValue = (input?.value || "").trim();
  if (!keyValue) {
    alert(t("enterApiKey"));
    return;
  }

  try {
    localStorage.setItem(USER_API_KEY_STORAGE_KEY, keyValue);
  } catch (e) {
    showToast("⚠️ 保存できませんでした", "ブラウザの保存領域を利用できません。", "error");
    return;
  }

  closeApiKeyModal();
  showToast("✅", t("apiKeySaved"), "success");
}

function ensureUserApiKeyForAi(url) {
  if (!isAiEndpoint(url)) return true;
  if (getStoredUserApiKey()) return true;
  openApiKeyModal({ required: true });
  return false;
}

function buildRequestHeaders(baseHeaders, url) {
  const headers = { ...(baseHeaders || {}) };
  if (!isAiEndpoint(url)) return headers;

  const apiKey = getStoredUserApiKey();
  if (!apiKey) return headers;

  headers.Authorization = `Bearer ${apiKey}`;
  headers["x-goog-api-key"] = apiKey;
  headers["X-User-Api-Key"] = apiKey;
  return headers;
}

async function requestJson(url, method, body) {
  if (!ensureUserApiKeyForAi(url)) {
    throw new ApiError(t("needApiKey"));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const headers = buildRequestHeaders(body !== undefined ? { "Content-Type": "application/json" } : {}, url);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
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
  if (!ensureUserApiKeyForAi(url)) {
    throw new ApiError(t("needApiKey"));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const headers = buildRequestHeaders({}, url);

  let response;
  try {
    response = await fetch(url, { method: "POST", headers, body: formData, signal: controller.signal });
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

/* ---------- 4. トースト通知 ---------- */
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

/* ---------- 4b. 処理オーバーレイ（大規模ファイル処理のシミュレーション） ---------- */
// WBS取込とオフショアフォルダ選択で共用。大規模案件（最大約1GB想定）でもUIを止めないため、
// ファイル絞り込み・ツリー描画・大容量読込の各段階で進捗バーを更新する。
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

// 大容量ファイルの「読込／解析」をサイズに応じて模擬する（実体をメモリへは読み込まない）。
// デモが長くなり過ぎないよう、所要時間は 0.6〜3.5 秒に収める。
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

/* ---------- 5. 中央ビュー切替（今日／カレンダー） ---------- */
function switchCenterView(viewName) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === viewName);
  });
  document.querySelectorAll(".center-view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${viewName}`);
  });

  // 非表示中に初期化した FullCalendar はサイズが崩れるため、表示時に再計算する。
  if (viewName === "calendar" && mainCalendar) {
    setTimeout(() => mainCalendar.updateSize(), 50);
  }
}

/* ---------- 6. サイドバー：クイック操作（検索） ---------- */

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

/* ---------- 7. モーダル：タスク追加 ---------- */

// presetProjectId: ダッシュボードの「タスク追加」から開いたとき、所属プロジェクトを先に選ぶ。
// presetDueDate: FullCalendar の空セルクリック時に、その日を期日として入れる。
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

/* ---------- 8. サイドバー：プロジェクト（WBS） ---------- */

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

// モーダル「➕ 新規プロジェクト追加」
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

/* ---------- 9. 中央：今日のタスク一覧 ---------- */

function formatDeadlineLabel(dueDate, overdue) {
  if (overdue) {
    const diffDays = Math.round((TODAY - new Date(`${dueDate}T00:00:00`)) / 86400000);
    return t("overdueDays", { days: diffDays });
  }
  if (dueDate === toDateKey(TODAY)) return t("today");
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
  checkbox.title = t("toggleDoneTitle");
  checkbox.addEventListener("click", (event) => event.stopPropagation());
  checkbox.addEventListener("change", () => toggleTaskDoneRow(task.id));

  const main = document.createElement("div");
  main.className = "task-main";
  main.title = t("openDetailTitle");
  main.innerHTML = '<span class="task-title"></span><span class="task-project-tag"></span>';
  main.querySelector(".task-title").textContent = task.title;
  main.querySelector(".task-project-tag").textContent = project ? project.name : "";
  main.addEventListener("click", () => openTaskDetail(task.id));

  const deadline = document.createElement("span");
  deadline.className = `task-deadline${overdue ? " is-overdue" : ""}`;
  deadline.textContent = formatDeadlineLabel(task.dueDate, overdue);

  const badge = document.createElement("span");
  badge.className = `priority-badge priority-badge-${task.priority}`;
  badge.textContent = getPriorityLabel(task.priority);

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
    titleEl.textContent = project ? project.name : t("today");
    if (filterChip && filterLabel) {
      filterChip.classList.remove("hidden");
      filterLabel.textContent = project ? project.name : "";
    }
  } else {
    titleEl.textContent = t("today");
    filterChip?.classList.add("hidden");
  }

  progressFill.style.width = `${percent}%`;
  progressLabel.textContent = t("progressDone", { done: doneCount, total: totalCount });

  const overdueVisible = visible.filter((task) => isTaskOverdue(task));
  if (overdueVisible.length > 0) {
    alertBanner.classList.remove("hidden");
    const maxDelay = Math.max(
      ...overdueVisible.map((task) => Math.round((TODAY - new Date(`${task.dueDate}T00:00:00`)) / 86400000))
    );
    alertText.textContent = t("overdueBanner", { count: overdueVisible.length, days: maxDelay });
  } else {
    alertBanner.classList.add("hidden");
  }

  listEl.innerHTML = "";
  if (totalCount === 0) {
    listEl.innerHTML = `<div class="task-list-empty">${t("noTasks")}</div>`;
  } else {
    visible.forEach((task) => listEl.appendChild(buildTaskRow(task)));
  }

  lastToggledTaskId = null;
  updateNotifBadge();
}

// 完了状態を切り替え、関連する表示をすべて再描画する。
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

/* ---------- 9b. プロジェクトダッシュボード（サイドバーのプロジェクト押下） ---------- */

let donutChartInstance = null;
let barChartInstance = null;

// 表示用ステータスは done／dueDate から算出する（専用statusフィールドは持たない）。
// 期限超過／対応中（本日期日）／未着手（未来日）／完了。
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

// プロジェクト内の優先度別件数。棒グラフの実データ。
// 現行タスクモデルに工程フィールドが無いため、工程モックは使わない。
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

  // 非表示中の Chart.js canvas は幅0になることがある。表示後に resize して比率を直す。
  setTimeout(() => {
    donutChartInstance?.resize();
    barChartInstance?.resize();
  }, 50);
}

// refreshAll() から呼ぶ。完了・編集・追加・カレンダーD&Dのあと、開いているダッシュボードを即時更新する。
function refreshActiveProjectDashboardIfVisible() {
  const view = $("view-project-dashboard");
  if (activeProjectFilter && view && view.classList.contains("is-active")) {
    renderProjectDashboard(activeProjectFilter);
  }
}

function renderProjectDashboard(projectId) {
  const project = getAllProjects().find((p) => p.id === projectId);

  const titleEl = $("dashboardProjectTitle");
  if (titleEl) titleEl.textContent = project ? t("dashboardTitle", { name: project.name }) : t("projectDashboard");

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

// 実タスク状態でドーナツ／棒グラフを初回生成、以降は .update() のみ。
// canvas はDOMに常駐するため destroy/recreate せず、変更のたびに追従させる。
function renderProjectCharts(projectId) {
  const donutCanvas = $("progressDonutChart");
  const barCanvas = $("teamPerformanceChart");
  if (!donutCanvas || !barCanvas || typeof Chart === "undefined") return;

  const stats = computeProjectDashboardStats(projectId);
  const priorityBreakdown = computeProjectPriorityBreakdown(projectId);
  const donutData = [stats.inProgress, stats.done, stats.overdue];
  const barData = [priorityBreakdown.high, priorityBreakdown.medium, priorityBreakdown.low];

  if (donutChartInstance) {
    donutChartInstance.data.labels = [t("statInProgress"), t("statDone"), t("statOverdue")];
    donutChartInstance.data.datasets[0].data = donutData;
    donutChartInstance.update();
  } else {
    donutChartInstance = new Chart(donutCanvas, {
      type: "doughnut",
      data: {
        labels: [t("statInProgress"), t("statDone"), t("statOverdue")],
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
    barChartInstance.data.labels = [t("priorityHigh"), t("priorityMedium"), t("priorityLow")];
    if (barChartInstance.data.datasets[0]) barChartInstance.data.datasets[0].label = t("taskCount");
    barChartInstance.data.datasets[0].data = barData;
    barChartInstance.update();
  } else {
    barChartInstance = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: [t("priorityHigh"), t("priorityMedium"), t("priorityLow")],
        datasets: [
          {
            label: t("taskCount"),
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

/* ---------- 9c. プロジェクトダッシュボード > タスク一覧（インライン編集／追加） ---------- */

// 右パネルで開いているタスクID。閉じていれば null。
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
  checkbox.title = t("toggleDoneTitle");
  checkbox.addEventListener("change", () => toggleTaskDoneRow(task.id));

  const titleCell = document.createElement("span");
  titleCell.className = "project-task-title";
  titleCell.textContent = task.title;
  titleCell.title = t("openDetailTitle");
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
    `<option value="high">${t("priorityHigh")}</option><option value="medium">${t("priorityMedium")}</option><option value="low">${t("priorityLow")}</option>`;
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

// ダッシュボード内一覧は、開いているプロジェクト配下のみ（今日ビューの期日フィルタとは別）。
function renderProjectTaskTable(projectId) {
  const body = $("projectTaskTableBody");
  if (!body) return;

  const tasks = getAllTasksCombined()
    .filter((task) => task.projectId === projectId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  body.innerHTML = "";
  if (tasks.length === 0) {
    body.innerHTML = `<div class="project-task-table-empty">${t("noProjectTasks")}</div>`;
    return;
  }
  tasks.forEach((task) => body.appendChild(buildProjectTaskRow(task)));
}

// ダッシュボードの「タスク追加」は共通モーダルを開き、所属プロジェクトを先に選んでおく。
function openAddTaskModalForProject() {
  openAddTaskModal(activeProjectFilter);
}

/* ---------- 9d. 右サイドバー：タスク詳細 ---------- */

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
  btn.textContent = isTaskDone(task) ? `↩ ${t("markUndone")}` : `✓ ${t("markDone")}`;
}

function renderTaskDetailSubtasks(task) {
  const list = $("taskDetailSubtaskList");
  if (!list) return;
  const subtasks = ensureTaskSubtasks(task);
  list.innerHTML = "";
  if (subtasks.length === 0) {
    list.innerHTML = `<p class="task-detail-subtask-empty">${t("noSubtasks")}</p>`;
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
  if (projectLabel) projectLabel.textContent = project ? project.name : t("unset");
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

/* ---------- 10. 一括再描画（データ変更後） ---------- */
function refreshAll() {
  renderProjectList();
  renderTodayList();
  refreshCalendarEvents();
  updateAgentStatusLine();
  refreshActiveProjectDashboardIfVisible();
  refreshTaskDetailIfOpen();
}

/* ---------- 11. 中央：カレンダー（週表示＋ドラッグ＆ドロップ） ---------- */

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
    locale: getFullCalendarLocale(),
    initialView: "timeGridWeek",
    headerToolbar: { left: "prev,next today", center: "title", right: "timeGridWeek,dayGridMonth" },
    height: "100%",
    nowIndicator: true,
    dayMaxEvents: true,
    droppable: true,
    events: buildCalendarEvents(),

    // 空きセルのクリック（既存イベント以外）。選択日を期日にしたタスク追加モーダルを開く。
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
    // （再描画はタスクデータを正として refreshAll() に任せる）。
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

// 未完了タスクをチップ化し、カレンダーへドロップして期日を置く／動かす。
function renderCalendarDragRail() {
  const container = $("calendarDragRailItems");
  if (!container) return;

  const candidates = getAllTasksCombined()
    .filter((task) => !isTaskDone(task))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 14);

  container.innerHTML = "";
  if (candidates.length === 0) {
    container.innerHTML = `<span class="calendar-drag-rail-empty">${t("noSchedulable")}</span>`;
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

// FullCalendar.Draggable は #calendarDragRailItems に一度だけ付ける。
// 子チップの再描画は委譲で拾えるため、インスタンスの再初期化は不要。
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

/* ---------- 12. モーダル：Googleカレンダー連携設定 ---------- */

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
      statusEl.removeAttribute("data-i18n");
      const isConfigured = Boolean(settings.calendarId) && settings.apiKeyConfigured;
      statusEl.textContent = isConfigured ? t("gcalConfigured") : t("gcalNotConfigured");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.removeAttribute("data-i18n");
      statusEl.textContent = t("gcalLoadFailed");
    }
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

/* ---------- 13. AIチャット（マスコット押下時のみオーバーレイ表示） ---------- */

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

// バックエンド応答の前に、思考過程を示すタイムラインを順に進める。
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

// AIの再配置案（RebalancedTaskDto[]）を dueDate／category に反映し、カレンダーで一時強調する。
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

// 「AIタスク自動調整」「AI分析」「自動リスケジュール」は同一処理。
// /api/v1/copilot/analyze-schedule を呼び出す。
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

// 自由入力チャットは自動リスケジュール業務を再利用し、入力文をそのまま会話に出す。
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
      ? t("agentNoTasks")
      : t("agentTodayStatus", { done: doneCount, total: todayTasks.length });
}

/* ---------- 14. SOS：緊急SOS（スピナー → 結果モーダル） ---------- */

// SOSは最低1.5秒の分析表示のあと /api/v1/copilot/sos-alert を呼び、結果モーダルを開く。
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

/* ---------- 15. モーダル：日報作成 ---------- */

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

/* ---------- 16. モーダル：オフショア支援（仕様比較／顧客質問／テスト） ---------- */

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
// AIへ送るファイル数の上限（コンテキスト制限のため）。フォルダツリーの閲覧・表示はこの上限の対象外。
// 大量表示は renderFolderTreeChunked()／filterOffshoreFilesChunked() を参照。
const OFFSHORE_MAX_BATCH_FILES = 300;
// この件数を超えたら大規模案件とみなし、チャンク処理と進捗オーバーレイを使う。
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

// ファイル絞り込みをチャンク分割し、チャンク間でメインスレッドを返す（await sleep(0)）。
// 数万ファイル級の選択でも画面が固まりにくくする。
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

// 選択フォルダを親ディレクトリ単位のツリー／リストで示す。DOM構築はチャンク＋rAFで分割し、
// 表示上限（MAX_VISIBLE=300）でもメインスレッドをブロックしにくくする。
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
    // 次チャンクの前に1フレーム待ち、大規模表示でも描画を滑らかにする。
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
      statusEl.removeAttribute("data-i18n");
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
    statusEl.removeAttribute("data-i18n");
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
  output.placeholder = "AIがテストケースを生成しています...";

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
  output.placeholder = "AIがユニットテストを生成しています...";

  try {
    const result = await postJson("/api/v1/copilot/review-offshore", {
      mode: "UNIT_TEST_GEN",
      codeText: resolveUnitTestSourceCode(),
      testFramework: $("unittestFrameworkSelect")?.value || null,
    });
    showUnitTestResult(result.analysisText, result.riskWarningText);
    showToast("✅ 完了", "ユニットテストを生成しました。", "success");
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
    alert("先にテストケースまたはユニットテストを生成してください。");
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

/* ---------- 17. Gmailディープリンクと連打防止 ---------- */

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

/* ---------- 18. WBSインポート ---------- */

// WBS取込のデモ。実ファイルは解析せず、サイズに応じた進捗表示のあと、
// 絞り込み中（なければ先頭）のプロジェクトへサンプルタスク3件を追加する。
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

/* ---------- 19. テーマ（表示設定：ライト／ダーク／グラス） ---------- */

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

/* ---------- 19b. アクセントカラー（表示設定） ---------- */

const ACCENT_COLOR_STORAGE_KEY = "brseCopilotAccentColor";
const DEFAULT_ACCENT_COLOR = "#4d8fe8";

// hover/active 用の --blue-dark を、hex を割合で暗くして求める。
// JSの style.setProperty 向けのため、ここでは color-mix() を使わない。
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

// 再読込時にアクセントカラーと背景画像を復元する。
// テーマ本体は head のインラインスクリプトで先に当て、ちらつきを防ぐ。こちらはDOM準備後でよい。
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
    /* プライベートモード等で localStorage が使えない場合は既定値を使う */
  }
}

/* ---------- 20. 初日あいさつ（1日1回） ---------- */

const LAST_GREETED_STORAGE_KEY = "brseCopilotLastGreetedDate";

function buildGreetingHeadline() {
  const hour = new Date().getHours();
  if (hour < 11) return t("greetingMorning");
  if (hour < 18) return t("greetingAfternoon");
  return t("greetingEvening");
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
      ? t("splashNoTasks")
      : t("splashHasTasks", { count: todayTaskCount });

  splash.classList.remove("is-hidden");
  localStorage.setItem(LAST_GREETED_STORAGE_KEY, todayKey);
}

function closeSplashScreen() {
  $("welcomeSplash")?.classList.add("is-hidden");
}

/* ---------- 21. ハンバーガーとオフキャンバス（タブレット／モバイル） ---------- */

function toggleLeftSidebar() {
  document.body.classList.toggle("sidebar-left-open");
}

function closeOffCanvasPanels() {
  document.body.classList.remove("sidebar-left-open");
  document.body.classList.remove("sidebar-right-open");
  document.body.classList.remove("agent-chat-open");
}

function initSidebarRightDefaultState() {
  /* 右列はタスク詳細。デスクトップでは常時表示。チャットはこのクラスを使わない。 */
}

/* ---------- 22. 初期化 ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
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
