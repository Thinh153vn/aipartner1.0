# GROWTH PARTNER — Hackathon presentation

Thời lượng mục tiêu: 8 phút 30 giây. Có thể co xuống 7 phút hoặc kéo lên 10 phút bằng cách rút/ngắt phần demo.

## Thông điệp chính

> GROWTH PARTNER biến task, lịch làm việc và những rủi ro khó nhìn thấy thành một kế hoạch hành động rõ ràng cho từng ngày.

Không trình bày sản phẩm như một task manager. Hãy trình bày như một **AI execution desk** giúp nhân viên biết việc gì cần làm tiếp theo và giúp BrSE/PM xử lý rủi ro sớm hơn.

## Kịch bản theo thời gian

| Thời gian | Nội dung | Mục tiêu |
|---|---|---|
| 0:00–0:40 | Mở bài bằng vấn đề | Tạo sự đồng cảm |
| 0:40–1:30 | Nỗi đau hiện tại | Cho thấy chi phí của việc phân tán thông tin |
| 1:30–2:25 | Giải pháp GROWTH PARTNER | Nói rõ sản phẩm làm gì |
| 2:25–3:10 | Luồng giá trị | Giải thích AI nằm ở đâu |
| 3:10–7:20 | Demo trực tiếp | Chứng minh sản phẩm chạy được |
| 7:20–8:10 | Giá trị cho công ty | Kết nối với business |
| 8:10–8:30 | Kết luận | Để lại một câu nhớ được |

## Slide 1 — Title / 0:00–0:40

**Tiêu đề đề xuất:**

`GROWTH PARTNER`

`From scattered tasks to the next best action`

**Câu nói mở đầu:**

“Mỗi ngày, chúng ta không thiếu task. Điều khó hơn là biết task nào cần được xử lý trước, task nào đang có nguy cơ trễ và bước tiếp theo nên là gì.”

Nếu thuyết trình bằng tiếng Nhật:

> 「私たちはタスクが足りないのではなく、次に何をすべきかを判断するための時間が足りません。」

Chuyển ý:

“GROWTH PARTNER được tạo ra để rút ngắn khoảng cách giữa dữ liệu công việc và quyết định hành động.”

## Slide 2 — Problem / 0:40–1:30

Hiển thị 3 vấn đề lớn:

- Task nằm ở nhiều nơi: WBS, calendar, chat, memo.
- Deadline có thể trễ nhưng chỉ được phát hiện khi đã quá muộn.
- Các công việc như daily report, review tài liệu, hỏi PM vẫn tốn nhiều thao tác thủ công.

**Lời nói:**

“Khi thông tin bị chia nhỏ, mỗi người phải tự ghép lại bức tranh trong đầu. Điều này tạo ra thời gian chờ, bỏ sót rủi ro và phụ thuộc nhiều vào kinh nghiệm cá nhân.”

Không nên nói “AI thay thế nhân viên”. Nên nói: **AI giảm thời gian tổng hợp để con người tập trung vào quyết định.**

## Slide 3 — Solution / 1:30–2:25

**Tiêu đề:** `One workspace. One daily execution view.`

Ba lớp giá trị:

1. **See** — gom task, deadline, calendar và project vào một workspace.
2. **Understand** — AI phân tích task trễ, xung đột lịch và nội dung tài liệu.
3. **Act** — đề xuất lịch mới, tạo daily report, chuẩn bị email và hỗ trợ review.

**Lời nói:**

“Điểm khác biệt của GROWTH PARTNER không chỉ là hiển thị dữ liệu. Sản phẩm đưa ra next best action để người dùng có thể hành động ngay trong cùng một luồng.”

## Slide 4 — Product flow / 2:25–3:10

Dùng sơ đồ 4 bước:

`WBS / Calendar / Notes` → `AI detects risk` → `Next best action` → `Execution`

Ví dụ trên slide:

`期限超過を検知` → `優先順位を再計算` → `PM向け相談文を作成` → `予定を更新`

Nhấn mạnh các điểm đang có trong prototype:

- WBS CSV import.
- Today’s Focus.
- AI auto-schedule.
- Emergency SOS.
- Nippo generation.
- Offshore/spec review support.

## Slide 5 — Live demo / 3:10–7:20

### Demo setup — trước khi trình bày

- Mở sẵn `http://localhost:8080`.
- Nhấn `Ctrl + F5` trước buổi demo.
- Đặt browser ở khoảng 1280×800 hoặc fullscreen.
- Không mở DevTools.
- Nếu không có API key, giữ demo mode; đây là chủ ý để demo không phụ thuộc mạng/API.
- Chuẩn bị sẵn một file CSV nhỏ với các cột: `Task,Due Date,Priority,Memo`.

### Demo flow chi tiết

#### 3:10–3:45 — Màn hình tổng quan

Nói:

“Đây là Execution Desk của hôm nay. Thay vì bắt đầu từ một danh sách dài, người dùng thấy ngay Today’s Focus — việc nên xử lý trước.”

Chỉ vào:

- `TODAY'S FOCUS`.
- Thanh tiến độ.
- Task quá hạn/cảnh báo.
- Header `SYSTEM EXE / EXECUTION DESK`.

#### 3:45–4:30 — Import WBS

Thao tác:

1. Chọn `WBSインポート`.
2. Chọn file CSV mẫu.
3. Cho task mới xuất hiện trong danh sách.

Nói:

“Từ một file WBS, task được đưa vào workspace và có thể tiếp tục chỉnh sửa, theo dõi deadline hoặc mở chi tiết.”

Nếu không muốn phụ thuộc file: bỏ qua bước này và nói “Trong demo này, dữ liệu WBS đã được chuẩn bị sẵn”.

#### 4:30–5:10 — Task detail

Thao tác:

1. Click một task.
2. Hiện panel chi tiết bên phải.
3. Đổi priority hoặc memo.
4. Đánh dấu hoàn thành.

Nói:

“Người dùng không cần rời khỏi màn hình để cập nhật task. Thay đổi được phản ánh ngay vào tiến độ trong ngày.”

#### 5:10–6:20 — AI auto-schedule

Thao tác:

1. Bấm `AIタスク自動調整`.
2. Để hiệu ứng AI chạy và agent chat hiện timeline.
3. Chỉ vào finding summary/kết quả.

Nói:

“Khi có task quá hạn, AI đọc danh sách và đề xuất cách sắp xếp lại. Người dùng nhìn thấy lý do, kế hoạch mới và có thể tiếp tục hành động — không chỉ nhận một câu trả lời dạng chat.”

Nếu hệ thống không có task quá hạn:

“Hiện tại toàn bộ task đang đúng hạn, vì vậy AI xác nhận không cần reschedule. Đây cũng là một kết quả có giá trị: không tạo thêm thay đổi không cần thiết.”

#### 6:20–6:55 — SOS / daily report

Chỉ nên demo **một** trong hai để giữ thời gian:

- `緊急SOS`: tạo risk summary và draft email cho PM.
- `日報作成`: biến work log thành daily report có thể chỉnh sửa và mở Gmail draft.

Lời nói:

“Các tác vụ giao tiếp lặp lại cũng được nối vào workflow. AI tạo bản nháp, nhưng người dùng vẫn kiểm tra và quyết định trước khi gửi.”

#### 6:55–7:20 — Kết thúc demo

Quay lại Today view và nói:

“Từ dữ liệu ban đầu, chúng ta đã đi qua một vòng hoàn chỉnh: import, phát hiện ưu tiên, cập nhật task và chuẩn bị hành động tiếp theo.”

## Slide 6 — Business value / 7:20–8:10

Ba giá trị nên nói:

- **Giảm thời gian điều phối:** giảm thao tác tổng hợp WBS, calendar và memo.
- **Phát hiện rủi ro sớm:** task quá hạn và vấn đề cần báo cáo được đưa lên trước.
- **Chuẩn hóa cách làm việc:** hỗ trợ BrSE/nhân viên mới bằng next best action và mẫu giao tiếp.

Có thể dùng câu:

“Giá trị lớn nhất không phải là AI viết được bao nhiêu chữ, mà là đội ngũ có thể phát hiện và xử lý vấn đề sớm hơn bao nhiêu.”

## Slide 7 — Roadmap / closing / 8:10–8:30

Roadmap ngắn:

- Kết nối database và phân quyền theo user/team.
- Tích hợp OAuth/Google Calendar đầy đủ.
- Học từ lịch sử task để dự báo rủi ro deadline.
- Dashboard cho PM/team lead.

**Câu kết đề xuất:**

“GROWTH PARTNER không cố gắng làm việc thay con người. Nó giúp mỗi người nhìn thấy việc quan trọng tiếp theo sớm hơn — và giúp cả team cùng tiến về phía trước.”

Nếu nói tiếng Nhật:

> 「GROWTH PARTNERは人の代わりに仕事をするのではなく、次に進むべき一歩を、チーム全体に早く見せるプロダクトです。」

## Nếu chỉ có 7 phút

- Bỏ Slide 4 hoặc nói trong 20 giây.
- Demo chỉ làm: Today’s Focus → chọn task → AI auto-schedule.
- Không demo cả SOS và daily report; chỉ giới thiệu bằng một câu.

## Nếu có đủ 10 phút

- Thêm 1 phút cho CSV WBS import.
- Thêm 45 giây cho SOS hoặc daily report.
- Thêm 45 giây giải thích kiến trúc: Spring Boot API, Gemini integration, localStorage demo fallback.

## Câu trả lời dự phòng cho câu hỏi của ban giám khảo

### AI có thực sự gọi model không?

“Có. Khi cấu hình API key, các endpoint AI gọi Gemini. Để demo ổn định, prototype có demo fallback khi chưa cấu hình key; UI và luồng trải nghiệm vẫn giữ nguyên.”

### Dữ liệu đang lưu ở đâu?

“Prototype hiện lưu task và trạng thái trên localStorage để tối ưu tốc độ hackathon. Roadmap tiếp theo là database, authentication và phân quyền theo team.”

### Khác gì với task manager thông thường?

“Task manager giúp lưu việc. GROWTH PARTNER tập trung vào quyết định tiếp theo: task nào cần ưu tiên, rủi ro nào cần báo cáo và hành động nào có thể thực hiện ngay.”

### Làm sao đo hiệu quả?

“Có thể đo thời gian lập daily report, thời gian phát hiện task trễ, số lần bỏ sót deadline và thời gian chuẩn bị trao đổi với PM/khách hàng.”
