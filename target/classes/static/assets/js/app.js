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
    aiAnalyze: "AI分析",
    legendTask: "タスク",
    legendLearning: "AIおすすめ学習",
    legendMeeting: "会議・打ち合わせ",
    legendMilestone: "マイルストーン",
    localSyncBadge: "Local Sync (Demo Mode)",
    localSyncBadgeTitle: "APIキーやOAuth連携なしで、ローカルの固定データのみでカレンダーを描画しています。",
    dragToSchedule: "ドラッグしてスケジュール",
    taskDetailEmpty: "タスクを選択すると、ここに詳細が表示されます。",
    briefingTitle: "Morning Briefing ＆ AIレコメンド",
    briefingSubtitle: "今日の状況をAIが要約しました。",
    briefingUrgentTitle: "至急対応が必要なタスク",
    briefingUrgentEmpty: "現在、期限超過のタスクはありません。素晴らしいです！",
    briefingUrgentMore: "他 {count} 件の期限超過タスクがあります",
    briefingAiTitle: "今日のAIレコメンド",
    briefingAiText: "14時までに保険料計算ロジックの実装を完了し、オフショアチームとの定例会議に備えましょう。",
    briefingActionsTitle: "クイックアクション",
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
    tabSystemLog: "Agent Log",
    tabGeneralQA: "Q&A・ナレッジ",
    qaEmptyHint: "保険業務・IT開発・BrSE業務について、何でも質問してください。",
    qaInputPlaceholder: "質問を入力、またはマイクで話してください...",
    voiceInputTitle: "🎤 音声入力",
    qaThinking: "AIが回答を作成中...",
    voiceNotSupported: "お使いのブラウザは音声入力（Web Speech API）に対応していません。Google Chromeでお試しください。",
    voiceListening: "話しかけると、そのままテキストが入力されます。",
    voiceEnded: "音声入力を終了しました。内容を確認して送信してください。",
    voiceNoSpeech: "音声を検出できませんでした。もう一度お試しください。",
    voiceMicDenied: "マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。",
    voiceError: "音声入力中にエラーが発生しました。",
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
    demoModeNote: "APIキー未設定時はデモ結果で操作を継続できます。APIキーを設定するとGeminiの実分析に切り替わります。",
    offlineDemoModeTitle: "⚡ Demo Mode（オフライン固定）",
    offlineDemoModeHint: "ONにすると、API通信を一切行わず、すべてのAI機能で高品質なデモ結果を即座に返します。登壇・オフライン発表時にご利用ください。",
    offlineDemoModeStatusOn: "ON（オフライン固定）",
    offlineDemoModeStatusOff: "OFF（通常運転）",
    offlineDemoModeToastOnMsg: "Demo Modeを有効にしました。以降、AI機能はAPI通信を行わずデモ結果を返します。",
    offlineDemoModeToastOffMsg: "Demo Modeを解除しました。APIキーが設定されていればGeminiに接続します。",
    aiThinkingMessage: "✨ AIエージェントがプロジェクトデータを分析中...",
    demoDataTitle: "デモデータ",
    demoDataHint: "追加したタスク・プロジェクト・完了状態だけを初期状態へ戻します。",
    resetDemoData: "デモデータをリセット",
    resetDemoConfirm: "追加したタスクや完了状態を初期状態へ戻します。続行しますか？",
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
    loading: "読み込み中...",
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
    aiAnalyze: "AI analysis",
    legendTask: "Task",
    legendLearning: "AI learning suggestion",
    legendMeeting: "Meeting",
    legendMilestone: "Milestone",
    localSyncBadge: "Local Sync (Demo Mode)",
    localSyncBadgeTitle: "The calendar renders from fixed local data only — no API key or OAuth login required.",
    dragToSchedule: "Drag to schedule",
    taskDetailEmpty: "Select a task to view its details here.",
    briefingTitle: "Morning Briefing & AI Recommendations",
    briefingSubtitle: "AI has summarized today's situation for you.",
    briefingUrgentTitle: "Tasks that need attention now",
    briefingUrgentEmpty: "No overdue tasks right now. Great job!",
    briefingUrgentMore: "{count} more overdue task(s)",
    briefingAiTitle: "Today's AI recommendation",
    briefingAiText: "You should focus on finishing the premium calculation logic before 2:00 PM to be ready for the meeting with the offshore team.",
    briefingActionsTitle: "Quick actions",
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
    tabSystemLog: "Agent Log",
    tabGeneralQA: "Q&A & Knowledge",
    qaEmptyHint: "Ask anything about insurance operations, IT development, or BrSE work.",
    qaInputPlaceholder: "Type a question, or speak using the microphone...",
    voiceInputTitle: "🎤 Voice input",
    qaThinking: "AI is preparing an answer...",
    voiceNotSupported: "Your browser does not support voice input (Web Speech API). Please try Google Chrome.",
    voiceListening: "Start speaking and your words will appear as text.",
    voiceEnded: "Voice input ended. Please review the text before sending.",
    voiceNoSpeech: "No speech detected. Please try again.",
    voiceMicDenied: "Microphone access was denied. Please allow microphone access in your browser settings.",
    voiceError: "An error occurred during voice recognition.",
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
    demoModeNote: "Without an API key, demo results keep the workflow usable. Add a key to switch to real Gemini analysis.",
    offlineDemoModeTitle: "⚡ Demo Mode (Offline)",
    offlineDemoModeHint: "When ON, no network calls are made — every AI feature instantly returns a high-quality demo result. Use this for on-stage or offline presentations.",
    offlineDemoModeStatusOn: "ON (offline demo)",
    offlineDemoModeStatusOff: "OFF (normal)",
    offlineDemoModeToastOnMsg: "Demo Mode enabled. AI features will now return demo results without any network call.",
    offlineDemoModeToastOffMsg: "Demo Mode disabled. Gemini will be used if an API key is configured.",
    aiThinkingMessage: "✨ AI Agent is analyzing project data...",
    demoDataTitle: "Demo data",
    demoDataHint: "Reset only added tasks, projects, and completion states to the initial scenario.",
    resetDemoData: "Reset demo data",
    resetDemoConfirm: "Added tasks and completion states will be reset. Continue?",
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
    loading: "Loading...",
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
    aiAnalyze: "Phân tích AI",
    legendTask: "Task",
    legendLearning: "Gợi ý học tập AI",
    legendMeeting: "Họp",
    legendMilestone: "Mốc quan trọng",
    localSyncBadge: "Local Sync (Demo Mode)",
    localSyncBadgeTitle: "Lịch chỉ hiển thị từ dữ liệu cục bộ cố định — không cần API key hay đăng nhập OAuth.",
    dragToSchedule: "Kéo để xếp lịch",
    taskDetailEmpty: "Chọn một task để xem chi tiết tại đây.",
    briefingTitle: "Morning Briefing & AI Đề xuất",
    briefingSubtitle: "AI đã tổng hợp tình hình hôm nay cho bạn.",
    briefingUrgentTitle: "Việc cần xử lý ngay",
    briefingUrgentEmpty: "Hiện không có task nào quá hạn. Tuyệt vời!",
    briefingUrgentMore: "Còn {count} task quá hạn khác",
    briefingAiTitle: "AI Đề xuất hôm nay",
    briefingAiText: "Bạn nên tập trung hoàn tất logic tính phí bảo hiểm trước 14:00 để kịp họp với Offshore Team.",
    briefingActionsTitle: "Quick Actions",
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
    tabSystemLog: "Agent Log",
    tabGeneralQA: "Q&A & Knowledge",
    qaEmptyHint: "Hãy hỏi bất cứ điều gì về nghiệp vụ bảo hiểm, phát triển IT hoặc công việc BrSE.",
    qaInputPlaceholder: "Nhập câu hỏi, hoặc nói bằng micro...",
    voiceInputTitle: "🎤 Nhập bằng giọng nói",
    qaThinking: "AI đang soạn câu trả lời...",
    voiceNotSupported: "Trình duyệt của bạn không hỗ trợ nhập liệu giọng nói (Web Speech API). Vui lòng thử Google Chrome.",
    voiceListening: "Hãy nói, nội dung sẽ tự động hiện thành văn bản.",
    voiceEnded: "Đã kết thúc nhập giọng nói. Vui lòng kiểm tra lại nội dung trước khi gửi.",
    voiceNoSpeech: "Không phát hiện giọng nói. Vui lòng thử lại.",
    voiceMicDenied: "Quyền truy cập micro đã bị từ chối. Vui lòng cho phép micro trong cài đặt trình duyệt.",
    voiceError: "Đã xảy ra lỗi trong quá trình nhận diện giọng nói.",
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
    demoModeNote: "Khi chưa có API key, hệ thống dùng kết quả demo để tiếp tục thao tác. Nhập key để chuyển sang phân tích Gemini thật.",
    offlineDemoModeTitle: "⚡ Demo Mode (Offline)",
    offlineDemoModeHint: "Khi bật, ứng dụng sẽ không gọi API thật — mọi tính năng AI sẽ trả về ngay kết quả demo chất lượng cao. Dùng khi thuyết trình hoặc không có mạng.",
    offlineDemoModeStatusOn: "ON (khóa chế độ offline)",
    offlineDemoModeStatusOff: "OFF (chế độ thường)",
    offlineDemoModeToastOnMsg: "Đã bật Demo Mode. Từ giờ các tính năng AI sẽ trả về kết quả demo mà không gọi API.",
    offlineDemoModeToastOffMsg: "Đã tắt Demo Mode. Nếu đã có API key, hệ thống sẽ gọi Gemini thật.",
    aiThinkingMessage: "✨ AI Agent đang phân tích dữ liệu dự án...",
    demoDataTitle: "Dữ liệu demo",
    demoDataHint: "Chỉ khôi phục task, project đã thêm và trạng thái hoàn thành về dữ liệu ban đầu.",
    resetDemoData: "Đặt lại dữ liệu demo",
    resetDemoConfirm: "Các task đã thêm và trạng thái hoàn thành sẽ được đặt lại. Bạn muốn tiếp tục?",
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
    loading: "Đang tải...",
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
    aiAnalyze: "AI分析",
    legendTask: "任务",
    legendLearning: "AI学习建议",
    legendMeeting: "会议",
    legendMilestone: "里程碑",
    localSyncBadge: "Local Sync (Demo Mode)",
    localSyncBadgeTitle: "日历仅通过本地固定数据渲染，无需API密钥或OAuth登录。",
    dragToSchedule: "拖拽以安排日程",
    taskDetailEmpty: "选择任务后，详情将显示在此处。",
    briefingTitle: "Morning Briefing 与 AI 推荐",
    briefingSubtitle: "AI 已为您总结了今天的情况。",
    briefingUrgentTitle: "需要立即处理的任务",
    briefingUrgentEmpty: "目前没有逾期任务，非常好！",
    briefingUrgentMore: "还有 {count} 项逾期任务",
    briefingAiTitle: "今日AI建议",
    briefingAiText: "建议在14点前完成保费计算逻辑的开发，以便准时参加与离岸团队的会议。",
    briefingActionsTitle: "快捷操作",
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
    tabSystemLog: "Agent Log",
    tabGeneralQA: "Q&A・知识库",
    qaEmptyHint: "关于保险业务、IT开发或BrSE工作，欢迎随时提问。",
    qaInputPlaceholder: "输入问题，或使用麦克风说话...",
    voiceInputTitle: "🎤 语音输入",
    qaThinking: "AI正在生成回答...",
    voiceNotSupported: "您的浏览器不支持语音输入（Web Speech API）。请尝试使用Google Chrome。",
    voiceListening: "请开始说话，内容将自动转换为文字。",
    voiceEnded: "语音输入已结束，请确认内容后再发送。",
    voiceNoSpeech: "未检测到语音，请重试。",
    voiceMicDenied: "麦克风访问被拒绝，请在浏览器设置中允许使用麦克风。",
    voiceError: "语音识别过程中发生错误。",
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
    demoModeNote: "未设置API密钥时会使用演示结果继续操作。设置密钥后将切换到真实Gemini分析。",
    offlineDemoModeTitle: "⚡ Demo Mode（离线固定）",
    offlineDemoModeHint: "开启后将不进行任何网络请求，所有AI功能都会立即返回高质量的演示结果。适用于上台演示或离线场景。",
    offlineDemoModeStatusOn: "ON（离线固定）",
    offlineDemoModeStatusOff: "OFF（正常模式）",
    offlineDemoModeToastOnMsg: "已开启Demo Mode。此后AI功能将不进行网络通信，直接返回演示结果。",
    offlineDemoModeToastOffMsg: "已关闭Demo Mode。如已设置API密钥，将连接真实的Gemini。",
    aiThinkingMessage: "✨ AI Agent正在分析项目数据...",
    demoDataTitle: "演示数据",
    demoDataHint: "仅将新增任务、项目和完成状态恢复为初始场景。",
    resetDemoData: "重置演示数据",
    resetDemoConfirm: "新增任务和完成状态将被重置。要继续吗？",
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
    loading: "加载中...",
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
  if (typeof updateDemoModeToggleUI === "function") updateDemoModeToggleUI();
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
// Local Sync (Demo Mode)：Googleカレンダーの実API・OAuthに依存せず、常にこのローカル配列だけで
// 保険システム開発のBrSE業務シナリオ（オフショア定例・PM報告・マイルストーンレビュー）を再現する。
const FIXED_MEETINGS = [
  { id: "mt1", title: "🗣 朝会（デイリースクラム）", start: `${toDateKey(TODAY)}T09:30:00`, end: `${toDateKey(TODAY)}T09:45:00`, category: "meeting" },
  { id: "mt2", title: "🌉 Offshore Teamとの進捗定例会議（BrSE）", start: `${toDateKey(TODAY)}T14:00:00`, end: `${toDateKey(TODAY)}T15:00:00`, category: "meeting" },
  { id: "mt3", title: "📊 保険API設計書 PM報告会", start: `${toDateKey(addDays(TODAY, 1))}T11:00:00`, end: `${toDateKey(addDays(TODAY, 1))}T11:30:00`, category: "meeting" },
  { id: "mt4", title: "🧑‍🏫 PMとの1on1", start: `${toDateKey(addDays(TODAY, 2))}T16:00:00`, end: `${toDateKey(addDays(TODAY, 2))}T16:30:00`, category: "meeting" },
  { id: "mt5", title: "🏁 マイルストーンレビュー：解約返戻金計算ロジック", start: `${toDateKey(addDays(TODAY, -3))}T17:00:00`, end: `${toDateKey(addDays(TODAY, -3))}T17:30:00`, category: "milestone" },
  { id: "mt6", title: "🏁 マイルストーンレビュー：契約更新機能改修", start: `${toDateKey(addDays(TODAY, 5))}T15:00:00`, end: `${toDateKey(addDays(TODAY, 5))}T16:00:00`, category: "milestone" },
];

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
  return [...TASKS_SEED, ...USER_ADDED_TASKS].map(applyTaskOverrides);
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
// シードタスク（TASKS_SEED）はオーバーライドとして永続化する（persistSeedTaskOverride）。
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

/* =========================================================
   3a-2. Ironclad Demo Mode
   Mục tiêu: khi lên sân khấu demo, KHÔNG BAO GIỜ được phép vỡ trận vì
   API key thiếu/sai, mạng rớt, timeout hay hết quota. Toàn bộ lời gọi AI
   trong app phải đi qua safeCallAI() bên dưới để được bảo vệ.
   ========================================================= */

// Trạng thái Demo Mode được lưu độc lập với API key, cho phép ép toàn bộ
// tính năng AI chạy offline ngay cả khi đã có key hợp lệ (an toàn tuyệt đối khi demo).
const DEMO_MODE_STORAGE_KEY = "brseCopilotDemoModeOffline";

// Đọc trạng thái Demo Mode hiện tại từ localStorage (mặc định: OFF)
function isDemoModeEnabled() {
  try {
    return localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true";
  } catch (e) {
    return false;
  }
}

// Lưu trạng thái Demo Mode và đồng bộ lại giao diện toggle trong Settings modal
function setDemoModeEnabled(enabled) {
  try {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? "true" : "false");
  } catch (e) {
    /* localStorage không khả dụng (VD: chế độ ẩn danh) -> chỉ giữ trạng thái trong phiên hiện tại */
  }
  updateDemoModeToggleUI();
}

// Được gọi khi người dùng bấm nút "⚡ Demo Mode (Offline)" trong màn hình 表示設定
function toggleDemoMode() {
  const nextState = !isDemoModeEnabled();
  setDemoModeEnabled(nextState);
  showToast(
    nextState ? "⚡ Demo Mode ON" : "Demo Mode OFF",
    nextState ? t("offlineDemoModeToastOnMsg") : t("offlineDemoModeToastOffMsg"),
    "info"
  );
}

// Đồng bộ nút gạt + nhãn trạng thái trong modal Settings theo giá trị đã lưu
function updateDemoModeToggleUI() {
  const enabled = isDemoModeEnabled();
  const toggleBtn = $("demoModeToggleBtn");
  const statusLabel = $("demoModeStatusLabel");
  if (toggleBtn) {
    toggleBtn.classList.toggle("is-active", enabled);
    toggleBtn.setAttribute("aria-checked", enabled ? "true" : "false");
  }
  if (statusLabel) {
    statusLabel.textContent = enabled ? t("offlineDemoModeStatusOn") : t("offlineDemoModeStatusOff");
  }
}

// Hiệu ứng "AI đang suy nghĩ" tối thiểu 1 giây trước khi trả mock response,
// giúp phần demo trông tự nhiên như đang thực sự gọi AI thật.
async function showAiThinkingSpinner() {
  showToast("🤖 GROWTH PARTNER", t("aiThinkingMessage"), "info");
  await sleep(1000);
}

/**
 * safeCallAI: lớp bọc toàn cục (global wrapper) cho MỌI lời gọi AI trong app.
 *
 * @param {Function} realCallFn - hàm async thực hiện lời gọi AI thật (VD: () => postJson(url, body))
 * @param {Function} mockResponseCallback - hàm (có thể async) trả về mock response chất lượng cao,
 *        bằng tiếng Nhật business, dùng khi không thể gọi AI thật.
 *
 * Quy tắc "Ironclad": nếu Demo Mode đang BẬT, hoặc chưa có/API key không hợp lệ,
 * hoặc bản thân lời gọi thật thất bại (lỗi HTTP, timeout, hết quota, mất mạng...),
 * hàm này sẽ NGAY LẬP TỨC "nuốt" lỗi, hiện spinner AI trong 1 giây rồi trả về
 * mockResponseCallback(). Không bao giờ để lỗi thật lộ ra màn hình khi đang demo.
 */
async function safeCallAI(realCallFn, mockResponseCallback) {
  const shouldForceDemo = isDemoModeEnabled() || !getStoredUserApiKey();

  if (shouldForceDemo) {
    await showAiThinkingSpinner();
    return mockResponseCallback();
  }

  try {
    return await realCallFn();
  } catch (err) {
    // Bất kể lý do thất bại là gì (HTTP lỗi, timeout, hết quota, network down...),
    // ta không throw tiếp mà âm thầm chuyển sang kết quả demo.
    console.warn("[safeCallAI] Real AI call failed, falling back to demo response:", err);
    await showAiThinkingSpinner();
    return mockResponseCallback();
  }
}

/* ---------- 3a-3. Mock response chất lượng cao (tiếng Nhật, nghiệp vụ bảo hiểm) ---------- */

// Mock cho "AIタスク自動調整"／"AI分析"／"自動リスケジュール" (POST /api/v1/copilot/analyze-schedule)
function buildMockAutoScheduleResponse(overdueTasksPayload) {
  const tasks = Array.isArray(overdueTasksPayload) ? overdueTasksPayload : [];
  const rebalancedTasks = tasks.slice(0, 3).map((task, index) => ({
    taskId: task.id,
    title: task.title,
    delayDays: index + 2,
    newDueDate: toDateKey(addDays(new Date(), index + 2)),
  }));
  const taskNameList = tasks
    .slice(0, 3)
    .map((task) => `「${task.title}」`)
    .join("、");
  const taskNamesText = taskNameList || "対象の遅延タスク";

  return Promise.resolve({
    rebalancedTasks,
    findingsSummary:
      `【AI分析】現在 ${tasks.length} 件のタスクが期限を超過しています。優先度・工数・依存関係を踏まえて再計算した結果、` +
      `${taskNamesText} を含む上位タスクの期日を再配置しました。まずは保険料計算ロジック（PremiumCalculator.java）まわりの実装を最優先で着手し、` +
      `契約更新バッチとの依存関係が解消され次第、残りのタスクに着手することを推奨します。この再配置により、今週末までに約1.5日分のバッファを確保できる見込みです。`,
    draftEmailBody:
      `お疲れ様です。\n\n現在対応中のタスクについて、AIが工数とバッファを再計算し、以下の通りスケジュールを見直しましたのでご報告いたします。\n\n` +
      `・対象タスク：${taskNamesText}\n` +
      `・見直し後の優先順位：保険料計算ロジックの実装 → 契約更新バッチとの疎通確認 → 単体テストの整備\n` +
      `・想定リスク：仕様確認待ちが発生した場合、さらに1〜2日の遅延が見込まれます。\n\n` +
      `つきましては、上記の進め方で問題ないか、また仕様確認が必要な箇所について15分ほどお時間をいただけますと幸いです。\n\nよろしくお願いいたします。`,
  });
}

// Mock cho "緊急SOS" (POST /api/v1/copilot/sos-alert)
function buildMockSosResponse() {
  return Promise.resolve({
    alertMessage:
      "【AI緊急分析】PremiumCalculator.java（保険料計算ロジック）の実装が180分以上停滞しています。直近のコード差分から、" +
      "成人判定の境界値（仕様書：18歳以上 ／ 実装：20歳以上）の解釈違いで手が止まっている可能性が高いと推測されます。" +
      "契約更新バッチとの結合テストにも影響する範囲のため、早めのエスカレーションを推奨します。",
    slackMessageDraft:
      "お疲れ様です。\n\n保険料計算ロジック（PremiumCalculator.java）の実装で180分ほど進捗が停滞しております。\n" +
      "仕様書では成人の定義が「18歳以上」となっていますが、現行コードでは「20歳以上」を基準に判定しており、この差異の扱いについて確認が必要な状況です。\n\n" +
      "お手数ですが、以下のいずれかでご支援いただけますと助かります。\n" +
      "・仕様の最終確認（18歳／20歳のどちらを正とするか）\n" +
      "・15分程度のペアプログラミングまたはレビュー\n\n" +
      "何卒よろしくお願いいたします。",
  });
}

// Mock cho "日報の自動生成" (POST /api/v1/copilot/generate-nippo)
// Cố gắng phản chiếu lại nội dung log thật của người dùng để bản demo trông "sống" hơn.
function buildMockNippoResponse(rawLogs) {
  const trimmedLogs = (rawLogs || "").trim();
  const logLines = trimmedLogs
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  const bulletedLogs =
    logLines.length > 0
      ? logLines
          .map((line) => `・${line.replace(/^git\s+commit\s+-m\s+["']?/i, "").replace(/["']$/, "")}`)
          .join("\n")
      : "・保険料計算ロジック（PremiumCalculator.java）の実装\n・契約更新バッチとの疎通確認";

  return Promise.resolve({
    nippoText:
      `【本日の実施内容】\n${bulletedLogs}\n\n` +
      `【進捗状況】\n保険料計算モジュールの主要ロジックの実装が完了し、現在は契約更新バッチとの結合部分を確認中です。想定していたスケジュール通りに進捗しています。\n\n` +
      `【課題・所感】\n成人判定の年齢基準（仕様書：18歳以上／実装：20歳以上）について差異を確認したため、明日改めて仕様担当者へ確認を行う予定です。\n\n` +
      `【明日の予定】\n・仕様差異の確認結果を実装へ反映\n・保険料計算ロジックの単体テストを追加\n・契約更新バッチとの結合テストを実施`,
  });
}

// テストフレームワークの自動判定（Java系ソース→JUnit5 / それ以外→Jest）
function detectOffshoreMockFramework(requestedFramework, codeText) {
  const normalized = (requestedFramework || "").toUpperCase();
  if (normalized === "JUNIT5" || normalized === "JEST") return normalized;
  return /public\s+class|private\s+void|import\s+java\./i.test(codeText || "") ? "JUNIT5" : "JEST";
}

function buildMockJUnitCode() {
  return `import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PremiumCalculatorTest {

    private PremiumCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new PremiumCalculator();
    }

    @ParameterizedTest
    @ValueSource(ints = {18, 19, 20, 25})
    void applyPremium_成人年齢では例外が発生しないこと(int age) {
        assertDoesNotThrow(() -> calculator.applyPremium(age));
    }

    @Test
    void applyPremium_年齢がnullの場合はValidationExceptionを送出すること() {
        assertThrows(ValidationException.class, () -> calculator.applyPremium(null));
    }

    @Test
    void applyPremium_年齢が負数の場合はValidationExceptionを送出すること() {
        assertThrows(ValidationException.class, () -> calculator.applyPremium(-1));
    }

    @Test
    void applyPremium_同一契約を連続実行しても例外なく処理できること() {
        calculator.applyPremium(20);
        assertDoesNotThrow(() -> calculator.applyPremium(20));
    }
}`;
}

function buildMockJestCode() {
  return `const { PremiumCalculator, ValidationException } = require("./PremiumCalculator");

describe("PremiumCalculator", () => {
  let calculator;

  beforeEach(() => {
    calculator = new PremiumCalculator();
  });

  test.each([18, 19, 20, 25])("applyPremium(%i) は例外を投げない", (age) => {
    expect(() => calculator.applyPremium(age)).not.toThrow();
  });

  test("age が null の場合は ValidationException を送出する", () => {
    expect(() => calculator.applyPremium(null)).toThrow(ValidationException);
  });

  test("age が負数の場合は ValidationException を送出する", () => {
    expect(() => calculator.applyPremium(-1)).toThrow(ValidationException);
  });

  test("同一契約を連続実行しても例外なく処理できる", () => {
    calculator.applyPremium(20);
    expect(() => calculator.applyPremium(20)).not.toThrow();
  });
});`;
}

// Mock cho "オフショア支援" (POST /api/v1/copilot/review-offshore) - dùng chung cho cả 4 chế độ
function buildMockOffshoreResponse(mode, payload = {}) {
  if (mode === "SPEC_DIFF") {
    return Promise.resolve({
      analysisText:
        "【AI比較結果】仕様書 第3.2節では「成人の定義は18歳以上」と明記されていますが、現行コード（PremiumCalculator.java）は " +
        "`if (age >= 20)` として20歳以上を基準に判定しています。この差異により、18歳・19歳の契約者に誤った保険料区分が適用される可能性があります。\n\n" +
        "【推奨対応】\n" +
        "1. 仕様担当者へ「18歳」「20歳」のどちらが正であるかを確認する\n" +
        "2. 境界値（17, 18, 19, 20歳）のテストケースを追加する\n" +
        "3. 修正時は契約更新バッチ側の年齢判定ロジックにも同様の差異がないか横展開で確認する",
      riskWarningText: "これはデモ結果です。実際の仕様書・コードに基づく最終判断は、レビュー担当者が行ってください。",
    });
  }

  if (mode === "SHADOW_CLIENT") {
    const rawQuestion = (payload.rawQuestion || "").trim();
    return Promise.resolve({
      analysisText:
        `お世話になっております。\n\n表題の件につきまして、${rawQuestion ? "ご質問いただいた内容" : "現行仕様"}を確認させていただきたく、ご連絡いたしました。\n\n` +
        "保険料計算における成人の定義（18歳以上／20歳以上）について、貴社仕様書と現行実装との間に差異が見られるため、" +
        "どちらを正としてよいか、恐れ入りますがご教示いただけますでしょうか。\n\n" +
        "お忙しいところ恐縮ですが、ご確認のほどよろしくお願いいたします。",
      riskWarningText:
        "年齢の基準に関する質問は契約条件に直結するため、送信前に必ずPMまたは仕様担当者のレビューを受けてください。専門用語を避け、背景（なぜ確認が必要か）を添えると誤解が減ります。",
    });
  }

  if (mode === "TEST_CASE_GEN") {
    return Promise.resolve({
      analysisText:
        "【テストケース一覧（リスクベース）】\n\n" +
        "■正常系\n" +
        "TC-01: age=18 → applyAdultPremium() が呼ばれる\n" +
        "TC-02: age=25 → applyAdultPremium() が呼ばれる\n\n" +
        "■境界値\n" +
        "TC-03: age=17 → 成人保険料が適用されない\n" +
        "TC-04: age=18（下限） → 成人保険料が適用される\n" +
        "TC-05: age=19 → 仕様書と実装の差異を検証（現行コードは20歳未満のため不適用となる想定）\n\n" +
        "■異常系\n" +
        "TC-06: age=null → ValidationException が送出される\n" +
        "TC-07: age=-1（負数） → ValidationException が送出される\n\n" +
        "■非機能・二重実行\n" +
        "TC-08: 同一契約IDに対して applyPremium() を連続2回呼び出しても保険料が二重計上されない",
      riskWarningText: "これはデモ結果です。実装方針の確定後、テストケースの過不足を最終確認してください。",
    });
  }

  // UNIT_TEST_GEN
  const framework = detectOffshoreMockFramework(payload.testFramework, payload.codeText);
  const analysisText = framework === "JEST" ? buildMockJestCode() : buildMockJUnitCode();
  return Promise.resolve({
    analysisText,
    riskWarningText: `これはデモ結果です（${framework === "JEST" ? "Jest" : "JUnit5 + Mockito"} 想定）。実際のクラス名・依存関係に合わせて調整してください。`,
  });
}

// APIキーが未設定でも、ハッカソンの導線を止めないためのローカルデモ応答（requestJson の最終防衛ライン）。
// safeCallAI 経由の呼び出しでは通常ここに到達しないが、直接 postJson を呼ぶ将来のコードのための保険。
function getDemoAiResponse(url, body = {}) {
  if (url.includes("analyze-schedule")) return buildMockAutoScheduleResponse(body.tasks);
  if (url.includes("sos-alert")) return buildMockSosResponse();
  if (url.includes("generate-nippo")) return buildMockNippoResponse(body.rawLogs);
  if (url.includes("review-offshore")) return buildMockOffshoreResponse(body.mode, body);
  return Promise.resolve({});
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
  // 保険：safeCallAI を経由せず直接 postJson/getJson/putJson を呼んだ場合でも、
  // Demo ModeがONまたはAPIキー未設定であればここでデモ応答を返す（Ironclad Demo Modeの最終防衛ライン）。
  if (isAiEndpoint(url) && (isDemoModeEnabled() || !getStoredUserApiKey())) {
    return getDemoAiResponse(url, body);
  }

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
  updateTodayFocus(visible);
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

let todayFocusTaskId = null;

function updateTodayFocus(tasks) {
  const titleEl = $("todayFocusTitle");
  const metaEl = $("todayFocusMeta");
  if (!titleEl || !metaEl) return;

  const candidates = tasks.filter((task) => !isTaskDone(task));
  const focusTask = candidates.sort((a, b) => {
    const overdueDiff = Number(isTaskOverdue(b)) - Number(isTaskOverdue(a));
    if (overdueDiff !== 0) return overdueDiff;
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1) || a.dueDate.localeCompare(b.dueDate);
  })[0];

  if (!focusTask) {
    todayFocusTaskId = null;
    titleEl.textContent = "今日のタスクはすべて完了です";
    metaEl.textContent = "次のチャレンジを追加してみましょう";
    return;
  }

  todayFocusTaskId = focusTask.id;
  titleEl.textContent = focusTask.title;
  metaEl.textContent = isTaskOverdue(focusTask)
    ? "期限超過 — まずこのタスクから片付けましょう"
    : `優先度 ${getPriorityLabel(focusTask.priority)} · 期日 ${formatDeadlineLabel(focusTask.dueDate, false)}`;
}

function openTodayFocusTask() {
  if (todayFocusTaskId) openTaskDetail(todayFocusTaskId);
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
  renderMorningBriefing();
}

/* ---------- 右パネル：タスク未選択時に表示する「🌟 Morning Briefing & AIレコメンド」 ----------
   何もしていない「空白」状態を放置せず、AIが能動的に「今やるべきこと」を提示する（Proactive方針）。
   カード1では期限超過タスクを一覧表示し、クリックでそのままタスク詳細を開ける。 */
function renderMorningBriefing() {
  const listEl = $("briefingUrgentList");
  if (!listEl) return;

  // 超過日数が大きい（＝期日が古い）順に並べ、最も緊急性の高いタスクを先頭に表示する
  const overdueTasks = getOverdueTasks()
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  listEl.innerHTML = "";

  if (overdueTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "briefing-urgent-empty";
    emptyItem.textContent = t("briefingUrgentEmpty");
    listEl.appendChild(emptyItem);
    return;
  }

  const projects = getAllProjects();
  const MAX_VISIBLE_URGENT_TASKS = 4;

  overdueTasks.slice(0, MAX_VISIBLE_URGENT_TASKS).forEach((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    const overdueDays = Math.max(
      1,
      Math.round((TODAY - new Date(`${task.dueDate}T00:00:00`)) / 86400000)
    );

    const item = document.createElement("li");
    item.className = "briefing-urgent-item";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.title = t("openDetailTitle");

    const titleEl = document.createElement("span");
    titleEl.className = "briefing-urgent-item-title";
    titleEl.textContent = task.title;

    const metaEl = document.createElement("span");
    metaEl.className = "briefing-urgent-item-meta";
    const projectPart = project ? `${project.name} ・ ` : "";
    metaEl.textContent = `${projectPart}${t("overdueDays", { days: overdueDays })}`;

    item.appendChild(titleEl);
    item.appendChild(metaEl);

    const openThisTask = () => openTaskDetail(task.id);
    item.addEventListener("click", openThisTask);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openThisTask();
      }
    });

    listEl.appendChild(item);
  });

  if (overdueTasks.length > MAX_VISIBLE_URGENT_TASKS) {
    const moreItem = document.createElement("li");
    moreItem.className = "briefing-urgent-more";
    moreItem.textContent = t("briefingUrgentMore", { count: overdueTasks.length - MAX_VISIBLE_URGENT_TASKS });
    listEl.appendChild(moreItem);
  }
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
    extendedProps: { taskId: meeting.id, category: meeting.category || "meeting" },
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
      else if (category === "milestone") classes.push("fc-event-milestone");

      const taskId = arg.event.extendedProps.taskId || arg.event.id;
      if (DONE_TASK_IDS.has(taskId)) classes.push("fc-event-done");
      if (AI_NEW_TASK_IDS.has(taskId)) classes.push("fc-event-ai-new");
      return classes;
    },

    // 会議・マイルストーンイベントはタスクではないためクリックしても完了切替の対象外
    eventClick: function (arg) {
      const category = arg.event.extendedProps.category;
      if (category === "meeting" || category === "milestone") return;
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

/* ---------- 12. カレンダー：Local Sync (Demo Mode) ----------
   要件：ライブ登壇でのリスクを完全に排除するため、Googleカレンダーの実API連携／OAuth／
   APIキー設定は撤去した。カレンダーは常に TASKS_SEED・USER_ADDED_TASKS・FIXED_MEETINGS という
   ローカルの固定モックデータのみで構築され、ネットワーク通信や認証ポップアップなしに
   瞬時に描画される（詳細は buildCalendarEvents() を参照）。 */

/* ---------- 13. AIチャット（マスコット押下時のみオーバーレイ表示） ---------- */

function openAgentChat() {
  document.body.classList.add("agent-chat-open");
  // 自動化ワークフロー（AIタスク自動調整など）が開くのは常にTab1（システムログ）
  switchAgentPanelTab("systemLog");
}

function toggleAgentChat() {
  document.body.classList.toggle("agent-chat-open");
}

/* ---------- 13a. Dual-Tab Architecture：Tab1(システムログ／Agent) ⇔ Tab2(Q&A・ナレッジ) ---------- */
function switchAgentPanelTab(tabName) {
  const isSystemLog = tabName !== "generalQA";

  const tabSystemLogBtn = $("tabSystemLog");
  const tabGeneralQaBtn = $("tabGeneralQA");
  const viewSystemLogEl = $("viewSystemLog");
  const viewGeneralQaEl = $("viewGeneralQA");

  tabSystemLogBtn?.classList.toggle("active", isSystemLog);
  tabSystemLogBtn?.setAttribute("aria-selected", String(isSystemLog));
  tabGeneralQaBtn?.classList.toggle("active", !isSystemLog);
  tabGeneralQaBtn?.setAttribute("aria-selected", String(!isSystemLog));

  viewSystemLogEl?.classList.toggle("is-active", isSystemLog);
  viewSystemLogEl?.classList.toggle("hidden", !isSystemLog);
  viewGeneralQaEl?.classList.toggle("is-active", !isSystemLog);
  viewGeneralQaEl?.classList.toggle("hidden", isSystemLog);

  // Tab2（Q&A）に切り替えた際、録音中のTab1向けマイクは無いため念のため録音を止めない。
  // Tab1に戻る際は、進行中の音声入力があれば混乱を避けるため停止する。
  if (isSystemLog) stopVoiceInput();
}

// 複数のフィード（システムログ／Q&A）で共通利用する「空状態を消す」ヘルパー
function clearFeedEmptyState(feedEmptyId) {
  const empty = $(feedEmptyId);
  if (empty) empty.remove();
}

function clearAgentFeedEmptyState() {
  clearFeedEmptyState("agentFeedEmpty");
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

// フィードにチャット吹き出しを追加する共通処理（システムログ／Q&A共通）
function appendFeedBubble(feedId, feedEmptyId, role, text, options = {}) {
  clearFeedEmptyState(feedEmptyId);
  const feed = $(feedId);
  if (!feed) return null;

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
  return bubble;
}

// Tab1（システムログ）向け：既存の呼び出し元はシグネチャ変更なしでそのまま動作する。
function appendChatBubble(role, text, options = {}) {
  return appendFeedBubble("agentFeed", "agentFeedEmpty", role, text, options);
}

// Tab2（Q&A・ナレッジ）向け
function appendQaChatBubble(role, text, options = {}) {
  return appendFeedBubble("qaFeed", "qaFeedEmpty", role, text, options);
}

function appendQaThinkingBubble() {
  clearFeedEmptyState("qaFeedEmpty");
  const feed = $("qaFeed");
  if (!feed) return null;

  const el = document.createElement("div");
  el.className = "agent-msg agent-msg-ai qa-thinking-bubble";
  el.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span></span>';
  const span = el.querySelector("span");
  if (span) span.textContent = t("qaThinking");
  feed.appendChild(el);
  feed.scrollTop = feed.scrollHeight;
  return el;
}

/* ---------- 13b. Tab2：Enterprise Knowledge Q&A（BrSE Knowledge Copilot / RAG Ready） ----------
   要件2-3：社内ナレッジ（保険ドメイン・BrSE業務）に特化したシステムインストラクションを付与して
   /api/v1/copilot/knowledge-qa を呼び出す。バックエンドが未実装／APIキー未設定／Demo Modeの場合は
   safeCallAI() が自動的に高品質なモック回答へフォールバックする（Ironclad Demo Mode）。 */
const KNOWLEDGE_QA_SYSTEM_INSTRUCTION =
  "You are an AI BrSE Senior Consultant specializing in Insurance Domain Systems and IT Project Management. " +
  "Answer questions strictly within professional BrSE context, Business Japanese phrasing, or Insurance logic. " +
  "Keep answers concise and structured.";

// Demo Mode用モック回答：保険ドメイン・BrSE業務に関するよくある質問に構造化された回答を返す。
function buildMockKnowledgeQaResponse(question) {
  const q = String(question || "").toLowerCase();

  if (/(保険料|premium)/.test(q)) {
    return Promise.resolve({
      answer:
        "【保険料計算ロジックについて】\n" +
        "1. 前提：契約者の年齢・性別・保険期間・特約の有無を入力パラメータとして使用します。\n" +
        "2. 計算：一般的に「基本保険料 ×（年齢係数）×（特約係数）」で算出します。\n" +
        "3. 注意点：消費税・地域係数を含める場合は、要件定義書で「税込／税抜」の扱いを必ず確認してください。\n" +
        "オフショアチームへ説明する際は、計算式をExcelサンプルで共有すると認識齟齬を防げます。",
    });
  }

  if (/(更新|更改|renewal|renew)/.test(q)) {
    return Promise.resolve({
      answer:
        "【契約更新（更改）処理について】\n" +
        "1. 更新対象の抽出：満期日のNヶ日前をバッチで抽出するのが一般的です。\n" +
        "2. 保険料の再計算：更新時点の年齢・特約内容をもとに再計算する必要があります。\n" +
        "3. 通知タイミング：お客様への更新案内状の発送時期を要件定義書で確認してください。\n" +
        "BrSEとしては、更新バッチ失敗時のリカバリ手順も仕様書に明記することを推奨します。",
    });
  }

  if (/(オフショア|offshore)/.test(q)) {
    return Promise.resolve({
      answer:
        "【オフショアチームとのコミュニケーションについて】\n" +
        "1. 仕様は日本語だけでなく、英語または簡易図解を併記すると認識齟齬が減ります。\n" +
        "2. 質問は「背景 → 質問内容 → 期待する回答」の順で構造化すると、相手も回答しやすくなります。\n" +
        "3. 定例会議の前に論点を1枚のドキュメントへまとめ、事前共有することを推奨します。",
    });
  }

  // 汎用フォールバック：質問文をそのまま踏まえた構造化された一般回答
  return Promise.resolve({
    answer:
      `ご質問「${question}」について、BrSE／保険システムの観点から整理します。\n\n` +
      "1. 論点の整理：まず要件定義書・設計書に該当箇所がないか確認しましょう。\n" +
      "2. 保険業務の観点：保険料計算・契約管理・給付金支払いなど、関連する業務フローを特定します。\n" +
      "3. 次のアクション：不明点はオフショアチームまたはPMへ、背景・質問・期待する回答をセットで確認することを推奨します。\n\n" +
      "※本回答はDemo Mode（社内ナレッジRAG準備中）による参考情報です。正式な判断は必ず仕様書・PMにご確認ください。",
  });
}

function autoResizeQaInput(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
}

function handleQaInputKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendKnowledgeQaMessage();
  }
}

async function sendKnowledgeQaMessage() {
  const input = $("qaChatInput");
  const sendBtn = $("btnQaSend");
  if (!input || !sendBtn || sendBtn.disabled) return;

  const text = input.value.trim();
  if (!text) return;

  if (isVoiceRecording) stopVoiceInput();

  input.value = "";
  autoResizeQaInput(input);
  appendQaChatBubble("user", text);

  sendBtn.disabled = true;
  const thinkingEl = appendQaThinkingBubble();

  try {
    const result = await safeCallAI(
      () =>
        postJson("/api/v1/copilot/knowledge-qa", {
          question: text,
          systemInstruction: KNOWLEDGE_QA_SYSTEM_INSTRUCTION,
        }),
      () => buildMockKnowledgeQaResponse(text)
    );
    thinkingEl?.remove();
    appendQaChatBubble("ai", result.answer || "回答を生成できませんでした。もう一度お試しください。");
  } catch (err) {
    thinkingEl?.remove();
    appendQaChatBubble("ai", `⚠️ ${err.message}`);
    notifyAiFailure(err);
  } finally {
    sendBtn.disabled = false;
  }
}

/* ---------- 13c. Web Speech API：音声入力（Tab2 Q&A専用マイクボタン） ----------
   要件2：ブラウザ標準の webkitSpeechRecognition / SpeechRecognition を用い、
   アプリの表示言語（ja/vi/en/zh）に応じた認識言語を設定してリアルタイムにテキスト化する。 */
let voiceRecognition = null;
let isVoiceRecording = false;
let voiceRecognitionHadError = false;

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getVoiceRecognitionLang() {
  if (currentLang === "ja") return "ja-JP";
  if (currentLang === "vi") return "vi-VN";
  if (currentLang === "zh") return "zh-CN";
  return "en-US";
}

function stopVoiceInput() {
  if (!voiceRecognition) return;
  try {
    voiceRecognition.stop();
  } catch (e) {
    /* すでに停止している場合は無視 */
  }
}

function toggleVoiceInput() {
  const micBtn = $("btnVoiceInput");
  if (!micBtn) return;

  // 録音中に再度クリック → 停止（onendで後片付けされる）
  if (isVoiceRecording) {
    stopVoiceInput();
    return;
  }

  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
  if (!SpeechRecognitionCtor) {
    showToast("⚠️ 音声入力は未対応です", t("voiceNotSupported"), "warning");
    return;
  }

  const input = $("qaChatInput");
  if (!input) return;

  const recognition = new SpeechRecognitionCtor();
  voiceRecognition = recognition;
  voiceRecognitionHadError = false;
  recognition.lang = getVoiceRecognitionLang();
  recognition.continuous = true;
  recognition.interimResults = true;

  // 録音開始前に入力欄へ既に入力されていたテキストは保持し、認識結果を後ろへ追記する。
  const baseText = input.value.trim();
  const baseTextWithSpace = baseText ? `${baseText} ` : "";
  let finalTranscript = "";

  recognition.onstart = () => {
    isVoiceRecording = true;
    micBtn.classList.add("recording");
    micBtn.setAttribute("aria-pressed", "true");
    showToast("🎤 録音中...", t("voiceListening"), "info");
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    input.value = `${baseTextWithSpace}${finalTranscript}${interimTranscript}`;
    autoResizeQaInput(input);
  };

  recognition.onerror = (event) => {
    voiceRecognitionHadError = true;
    console.warn("[voiceInput] recognition error:", event.error);
    if (event.error === "no-speech") {
      showToast("🎤 音声を検出できませんでした", t("voiceNoSpeech"), "warning");
    } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      showToast("⚠️ マイクへのアクセスが拒否されました", t("voiceMicDenied"), "error");
    } else {
      showToast("⚠️ 音声入力エラー", t("voiceError"), "error");
    }
  };

  recognition.onend = () => {
    isVoiceRecording = false;
    micBtn.classList.remove("recording");
    micBtn.setAttribute("aria-pressed", "false");
    if (!voiceRecognitionHadError) {
      showToast("🎤 録音終了", t("voiceEnded"), "success");
    }
    voiceRecognition = null;
  };

  try {
    recognition.start();
  } catch (err) {
    showToast("⚠️ 音声入力エラー", t("voiceError"), "error");
    voiceRecognition = null;
  }
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
  document.body.classList.add("ai-processing");
  triggerButtons.forEach((b) => {
    b.disabled = true;
    b.classList.add("is-processing");
  });

  appendChatBubble("user", "✨ AIタスク自動調整を実行");
  await runTimelineSteps([
    "タスクとカレンダーを読み込み中...",
    "遅延タスクを分析中...",
    "AIが再スケジュール案を作成中...",
  ]);

  try {
    const tasksPayload = overdueTasks.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate }));
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/analyze-schedule", { tasks: tasksPayload }),
      () => buildMockAutoScheduleResponse(tasksPayload)
    );

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
    document.body.classList.remove("ai-processing");
    triggerButtons.forEach((b) => {
      b.disabled = false;
      b.innerHTML = originalHtmlMap.get(b);
      b.classList.remove("is-processing");
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
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/analyze-schedule", { tasks: tasksPayload }),
      () => buildMockAutoScheduleResponse(tasksPayload)
    );
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
  const triggerButtons = [$("btnQuickSos"), $("btnQuickSos2"), $("btnQuickSos3")].filter(Boolean);
  if (triggerButtons.some((b) => b.disabled)) return;

  const originalHtmlMap = new Map(triggerButtons.map((b) => [b, b.innerHTML]));
  triggerButtons.forEach((b) => {
    b.disabled = true;
    b.innerHTML = "⏳ AIが分析中...";
  });

  try {
    await sleep(1500);
    const result = await safeCallAI(
      () =>
        postJson("/api/v1/copilot/sos-alert", {
          fileName: "PremiumCalculator.java",
          stuckMinutes: 180,
        }),
      () => buildMockSosResponse()
    );
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
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/generate-nippo", { rawLogs }),
      () => buildMockNippoResponse(rawLogs)
    );
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
    const specDiffPayload = {
      mode: "SPEC_DIFF",
      specText: OFFSHORE_UPLOADED_TEXT.spec || OFFSHORE_SPEC_SAMPLE.specText,
      codeText: OFFSHORE_UPLOADED_TEXT.code || OFFSHORE_SPEC_SAMPLE.codeText,
    };
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/review-offshore", specDiffPayload),
      () => buildMockOffshoreResponse("SPEC_DIFF", specDiffPayload)
    );

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
    const shadowPayload = { mode: "SHADOW_CLIENT", rawQuestion };
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/review-offshore", shadowPayload),
      () => buildMockOffshoreResponse("SHADOW_CLIENT", shadowPayload)
    );

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
    const testCasePayload = { mode: "TEST_CASE_GEN", specText, codeText: codeText || null };
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/review-offshore", testCasePayload),
      () => buildMockOffshoreResponse("TEST_CASE_GEN", testCasePayload)
    );
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
    const unitTestPayload = {
      mode: "UNIT_TEST_GEN",
      codeText: resolveUnitTestSourceCode(),
      testFramework: $("unittestFrameworkSelect")?.value || null,
    };
    const result = await safeCallAI(
      () => postJson("/api/v1/copilot/review-offshore", unitTestPayload),
      () => buildMockOffshoreResponse("UNIT_TEST_GEN", unitTestPayload)
    );
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

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function normalizeWbsHeader(value) {
  return String(value || "").toLowerCase().replace(/[\s_\-（）()]/g, "");
}

function normalizeWbsDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return toDateKey(addDays(TODAY, 7));
  const match = raw.match(/(\d{4})[./年-](\d{1,2})[./月-](\d{1,2})/);
  if (!match) return toDateKey(addDays(TODAY, 7));
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? toDateKey(addDays(TODAY, 7)) : toDateKey(date);
}

function normalizeWbsPriority(value) {
  const raw = String(value || "").toLowerCase();
  if (/(high|urgent|critical|高|緊急)/.test(raw)) return "high";
  if (/(low|低)/.test(raw)) return "low";
  return "medium";
}

function parseWbsCsv(text, projectId) {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeWbsHeader);
  const findColumn = (names) => headers.findIndex((header) => names.some((name) => header.includes(name)));
  const titleIndex = findColumn(["title", "task", "name", "タスク", "作業", "項目"]);
  const dueIndex = findColumn(["duedate", "deadline", "date", "期日", "期限"]);
  const priorityIndex = findColumn(["priority", "優先"]);
  const memoIndex = findColumn(["memo", "note", "description", "メモ", "備考"]);
  if (titleIndex < 0) return [];

  return lines.slice(1).map(splitCsvLine).map((cells, index) => {
    const title = String(cells[titleIndex] || "").trim();
    if (!title) return null;
    return {
      id: `wbs-${Date.now()}-${index}`,
      projectId,
      title,
      priority: normalizeWbsPriority(priorityIndex >= 0 ? cells[priorityIndex] : ""),
      dueDate: normalizeWbsDate(dueIndex >= 0 ? cells[dueIndex] : ""),
      category: "work",
      memo: memoIndex >= 0 ? String(cells[memoIndex] || "").trim() : "",
    };
  }).filter(Boolean);
}

// 実CSVは FileReader() で読み込んで本物のタスクとして取り込む。
// Excel(.xlsx)やヘッダーを検出できないCSVなど「解析不可能」なファイルは、
// ハッカソン用の「大容量ファイル解析」演出（Demo Mode: Processing Large Structure）へ
// シームレスにフォールバックする。
const WBS_DEMO_FALLBACK_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1GB相当のダミーサイズ（デモ演出専用）

// FileReader() でファイルをテキストとして読み込む（Promiseでラップ）。
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("FileReaderでの読み込みに失敗しました。"));
    reader.readAsText(file, "UTF-8");
  });
}

async function handleWbsFileImport(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;

  const allProjects = getAllProjects();
  const targetProjectId = activeProjectFilter || (allProjects[0] && allProjects[0].id) || null;
  const stamp = Date.now();
  const fallbackTasks = [
    { id: `wbs-${stamp}-1`, projectId: targetProjectId, title: "API設計", priority: "medium", dueDate: toDateKey(addDays(TODAY, 2)), category: "work" },
    { id: `wbs-${stamp}-2`, projectId: targetProjectId, title: "ロジック実装", priority: "high", dueDate: toDateKey(addDays(TODAY, 4)), category: "work" },
    { id: `wbs-${stamp}-3`, projectId: targetProjectId, title: "単体テスト", priority: "medium", dueDate: toDateKey(addDays(TODAY, 6)), category: "work" },
  ];

  // ステップ1：CSVであれば FileReader() で実データの読み込み・解析を先に試みる。
  const isCsv = /\.csv$/i.test(file.name);
  let realCsvTasks = null;
  if (isCsv) {
    try {
      const csvText = await readFileAsText(file);
      const parsedTasks = parseWbsCsv(csvText, targetProjectId);
      if (parsedTasks.length) realCsvTasks = parsedTasks;
    } catch (error) {
      console.warn("[handleWbsFileImport] CSVの読み込み・解析に失敗しました。Demo Modeへフォールバックします:", error);
    }
  }

  let importedTasks;
  if (realCsvTasks) {
    // 実データを検出できた場合：ファイルの実サイズに応じた軽量プログレスで「解析中」を演出する
    await simulateStreamProgress(
      file.size,
      `✨ AIがCSV「${file.name}」（${formatFileSize(file.size)}）を解析しています...`
    );
    importedTasks = realCsvTasks;
  } else {
    // .xlsx / .pdf / .txt、またはヘッダー（Task／タスク名・Deadline／期日・Priority／優先度）を
    // 検出できなかったCSVは、常に成功して見える「大容量ファイル解析」のデモ演出へフォールバックする。
    await simulateStreamProgress(
      WBS_DEMO_FALLBACK_FILE_SIZE_BYTES,
      `🗂️ Demo Mode: Processing Large Structure「${file.name}」...`
    );
    importedTasks = fallbackTasks;
  }

  USER_ADDED_TASKS.push(...importedTasks);
  saveUserTasks();
  refreshAll();

  if (realCsvTasks) {
    showToast("✅ インポート完了", `CSVから${importedTasks.length}件のタスクを実際に取り込みました。`, "success");
  } else {
    showToast("✅ インポート完了（Demo Mode）", `Demo Modeとして${importedTasks.length}件のサンプルタスクを追加しました。`, "success");
  }
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
  updateDemoModeToggleUI();
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

function resetDemoData() {
  if (!window.confirm(t("resetDemoConfirm"))) return;

  [USER_PROJECTS_STORAGE_KEY, USER_TASKS_STORAGE_KEY, DONE_TASKS_STORAGE_KEY, TASK_OVERRIDES_STORAGE_KEY].forEach(
    (key) => localStorage.removeItem(key)
  );
  showToast("✅", t("resetDemoData"), "success");

  // A reload also resets in-memory state and returns the demo to its initial scenario.
  setTimeout(() => window.location.reload(), 500);
}

/* =========================================================
   21b. 🚨 Emergency Demo Controls
   Nút "cứu hỏa" dùng khi đang thuyết trình mà demo bị lỗi (task rối, chat rác,
   calendar loạn...). Khác với resetDemoData() (chỉ xoá vài key), hàm này XOÁ SẠCH
   toàn bộ localStorage rồi dựng lại đúng 1 kịch bản demo chuẩn: 4 task nghiệp vụ
   bảo hiểm (2 quá hạn / 1 đến hạn hôm nay / 1 đã hoàn thành).
   ========================================================= */

// Kịch bản demo chuẩn: ghi đè lên đúng 4 task có sẵn trong TASKS_SEED (t1〜t4) bằng nội
// dung nghiệp vụ bảo hiểm thực tế, đồng thời đẩy các task còn lại (t5, t6) ra tương lai xa
// để không bị lẫn vào danh sách "今日" (t7 vốn đã ở tương lai nên không cần đụng tới).
function buildEmergencyDemoTaskOverrides() {
  return {
    t1: {
      title: "保険料計算ロジックの実装（成人判定バグ修正）",
      dueDate: toDateKey(addDays(TODAY, -2)),
      priority: "high",
      memo: "仕様書は18歳以上、現行コードは20歳以上を成人と判定しており差異あり。至急修正が必要。",
      subtasks: [],
    },
    t2: {
      title: "契約更新バッチとの疎通確認",
      dueDate: toDateKey(addDays(TODAY, -1)),
      priority: "high",
      memo: "保険料計算モジュールの修正後、契約更新バッチとの結合テストが未着手のまま遅延中。",
      subtasks: [],
    },
    t3: {
      title: "解約返戻金計算ロジックの単体テスト追加",
      dueDate: toDateKey(TODAY),
      priority: "medium",
      memo: "境界値（契約期間の端数月）のテストケースを追加する。",
      subtasks: [],
    },
    t4: {
      title: "更新ロジック仕様書レビュー",
      dueDate: toDateKey(TODAY),
      priority: "medium",
      memo: "PMレビュー済み。指摘事項なしでクローズ。",
      subtasks: [],
    },
    // 以下2件は「今日」ビューに写り込まないよう、期日を十分先へ逃がしておくだけ（内容は据え置き）。
    t5: { title: "単体テスト設計書作成", dueDate: toDateKey(addDays(TODAY, 10)), priority: "low", memo: "", subtasks: [] },
    t6: {
      title: "Spring Boot設計パターンを学ぶ（短期目標）",
      dueDate: toDateKey(addDays(TODAY, 12)),
      priority: "low",
      memo: "",
      subtasks: [],
    },
  };
}

// 🚨 Emergency Demo Controls パネルの「🔄 Reset Demo Data」ボタンから呼ばれる。
function emergencyResetDemoData() {
  const confirmed = window.confirm(
    "ローカルデータをすべて消去し、標準デモシナリオ（保険システムのタスク4件）へ復元します。よろしいですか？"
  );
  if (!confirmed) return;

  // 1. localStorage を完全に消去（APIキー・テーマ・言語・タスクなど、保存内容を問わず全て）。
  try {
    localStorage.clear();
  } catch (e) {
    /* プライベートモード等で使用できない場合は無視して続行（リロード後は既定値で動作する） */
  }

  // 2. 標準デモシナリオのタスク上書き（期限超過2件／本日期限1件／完了1件）を書き込む。
  TASK_OVERRIDES = buildEmergencyDemoTaskOverrides();
  try {
    saveTaskOverrides();
  } catch (e) {
    /* 保存に失敗しても、この後のリロードまではメモリ上の状態で表示される */
  }

  // 3. t4（更新ロジック仕様書レビュー）を「完了済み」としてマークする。
  DONE_TASK_IDS = new Set(["t4"]);
  try {
    saveDoneTaskIds();
  } catch (e) {
    /* 同上 */
  }

  // 4. ユーザー追加タスク／プロジェクトをメモリ上でも空にする
  //    （進捗バー・チャット履歴・カレンダーは、直後の reload で自然に初期状態へ戻る）。
  USER_ADDED_TASKS = [];
  USER_ADDED_PROJECTS = [];
  AI_NEW_TASK_IDS = new Set();

  showToast("✅ 標準デモシナリオに復元しました！", "Đã khôi phục kịch bản Demo chuẩn!", "success");

  // reload により、進捗バー・チャット履歴・カレンダー表示もすべて初期状態から再構築される。
  setTimeout(() => window.location.reload(), 800);
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
  updateDemoModeToggleUI();
  renderProjectList();
  renderTodayList();
  initFullCalendar();
  renderCalendarDragRail();
  initTaskDragDrop();
  updateAgentStatusLine();
  checkAndShowWelcomeSplash();
});
