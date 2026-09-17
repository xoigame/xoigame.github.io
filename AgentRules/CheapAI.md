## ⚠⚠ BỘ KHUNG NÀY LÀ ĐỂ AI YẾU DÙNG — mười luật giữ cho nó vẫn dùng được (2026-09-09)

User nói rõ đích đến: *"sau này dùng AI rẻ và ít thông minh hơn (Luna) làm mà vẫn hoàn thành
được một game hoàn chỉnh"*. Điều này đổi tiêu chí «code tốt». Một hệ chỉ đúng khi AI mạnh đọc
hết ngữ cảnh là **vô dụng** với mục tiêu này. Mọi thứ thêm vào từ nay phải qua mười câu hỏi
dưới đây; skill đường đi cho AI yếu ở `.claude/skills/stickman-luna/SKILL.md`, và **sổ tay dài**
(làm một GAME hoàn chỉnh · thêm khả năng mới · luật performance) ở
[Luna-Handbook.md](../KnowledgeBase/Luna-Handbook.md).

### 1. DỮ LIỆU trước, code sau
Thứ gì một AI yếu có thể phải đổi (số, tên, danh sách, thứ tự) thì phải nằm trong bảng
(JSON · ScriptableObject · mảng hằng ở đầu file), không nằm rải trong thân hàm. Kiểm: "muốn
đổi X thì mở file nào, dòng nào?" — câu trả lời phải là MỘT chỗ.

### 2. MỘT NÚT, không phải một quy trình
Việc nào cần nhớ thứ tự >2 bước thì phải có nút gộp trong `StickmanToolbox` (bảng điều khiển).
Bằng chứng: `Create Demo Scenes (All)`, `★ Dựng NHẠC · THÀNH TỰU · HƯỚNG DẪN · NGÔN NGỮ`,
`★ Dựng MỌI màn từ công thức`. Lời dặn "nhớ bấm A rồi B" trong chat KHÔNG tính.

### 3. HỎNG-MỀM: làm dở một nửa thì vẫn chạy
Khuôn mẫu: `Loc.T("key", "chữ tiếng Việt")` — quên điền bảng vẫn ra đúng chữ. `MusicBank`
thiếu thì im, không ném. `Achievements.Unlock` id lạ thì cảnh báo, không sập. Khi thiết kế
API mới, hỏi: "AI yếu gọi thiếu một tham số / quên một bước thì người chơi thấy gì?" — đáp án
phải là "như cũ", không phải "màn hình trống".

### 4. DOCTOR RÉO trước khi người thấy
Hệ mới = phép đo mới trong `StickmanDoctor` (khai tên · vì sao · cách sửa), viết TRƯỚC code
runtime. AI yếu không nhìn ra thiếu gì; Doctor phải nói thay. Đo bằng file thật / YAML, không
bằng cờ nhớ. Ví dụ: `AreaShellContent`, `AreaSceneShell`, `AreaAllocPhysics`.

### 5. LỖI PHẢI GỌI TÊN TRƯỜNG
`SceneRecipe.Validate()` là chuẩn: *"`referee` là Hostage cần ĐÚNG 1 objectives loại
Extraction"* — không phải `NullReferenceException` ở dòng 812. Mọi thứ AI yếu điền (JSON,
bảng) phải có `Validate` kiểu này chạy TRƯỚC khi dựng.

### 6. MỌI KIỂU CHƠI PHẢI VÀO ĐƯỢC CÔNG THỨC
Một `MatchModeBase` không có dòng trong `StickmanRefereeTable` = kiểu chơi **chỉ AI mạnh
dựng được**. Đo 2026-09-08 buổi sáng: 28 mode, công thức biết 8.

**Đã sửa cùng ngày**: danh sách + luật + cách dựng gộp vào MỘT bảng
(`Assets/Editor/Modes/StickmanRefereeTable.cs`) — thêm kiểu chơi là thêm một dòng ở đó và một hàm
dựng trong `StickmanRefereeBuilds`, không còn hai chỗ để lệch nhau. Đo lại: **34 mode, công
thức biết 29, 3 cố ý loại** (`NotInRecipe`, kèm lý do). Phép đo canh chừng: Doctor «Kiểu chơi
vào được công thức JSON». Con số này chỉ được TĂNG.

### 7. JSON, không phải Inspector
Đối tượng là một AI chỉ sửa được VĂN BẢN. Thứ nó phải đổi thì để ở file text (JSON, `.cs`
bảng hằng), không để ở field kéo-thả trong scene/prefab. Asset `.asset` chấp nhận được khi
tool sinh ra nó từ code (bấm lại là có).

### 8. MẪU ĐẦY ĐỦ, không mẫu tối giản
File mẫu (`CreateSample`) phải khai **mọi** trường kể cả trường đang mặc định, kèm chú thích
`_ghiChu`. AI yếu chép mẫu rồi sửa; trường không có trong mẫu là trường không tồn tại với nó.

### 8b. CHỖ ĐỨNG TRÊN MÀN HÌNH LÀ THỨ ĐI XIN, KHÔNG PHẢI THỨ TỰ GÕ
HUD mới gọi `ScreenZones.Request(zone, "TênClass")` rồi `CampUiKit.PlaceInZone(...)`. Gõ toạ
độ tay là kiểu lỗi mà AI yếu chắc chắn mắc và không ai phát hiện được cho tới lúc người chơi
báo *"bấm không được"*. Canvas thì treo vào `CampUiKit.SafeRoot(canvas)` — xem `UI.md`.

### 8c. CHỮ HIỆN CHO NGƯỜI CHƠI PHẢI QUA `Loc.T("key", "chữ tiếng Việt")`
Game mặc định TIẾNG ANH. Bọc xong thì thêm một dòng vào `StickmanEnglishStrings.Map` — cùng
một file code, sửa bằng trình soạn thảo. Quên bọc thì chữ Việt lọt ra giữa game tiếng Anh, và
Doctor «Chữ LỘ TIẾNG VIỆT» réo đúng khoá.

### 8d. VÙNG ẢNH HƯỞNG PHẢI ĐO ĐƯỢC TRƯỚC KHI SỬA
`python Docs/Tools/BlastRadius.py` trả lời "sửa file này thì còn phải kiểm gì" bằng ba con số:
fan-in · tầng lan tới · đã bake vào prefab/scene chưa. AI yếu không giữ được con số đó trong
đầu — nó phải hỏi máy. Luật đi kèm ở `BlastRadius.md`: trên FILE TRỤC chỉ được THÊM, không
được ĐỔI NGHĨA; và nhu cầu mới thì làm bằng FILE MỚI + điểm nối, không sửa vào trục.

### 9. KIỂM BẰNG LỆNH, không bằng mắt
`BlastRadius.py` (trước khi sửa) → `CompileCheck.py --mine` → Doctor. Kết quả gom theo file, đánh
dấu file của mình. Không có "chạy thử thấy ổn".

### 10. ĐỪNG QUÉT CẢ SỔ MỖI KHUNG HÌNH (2026-09-09)

Khuôn mà một AI yếu chắc chắn viết ra: `foreach (var m in TeamMember.All) { var a = m.GetComponent<…>(); … }`
đặt trong `Update`. Nó **đúng**, biên dịch xanh, Doctor xanh, chơi thử một mình thấy ổn — và
giết FPS khi đông quân, mà lúc ấy ai cũng đổ cho "đông thì chậm". Đo thật ngày 2026-09-09 ở
`StickmanAgent.SelectBestEnemy`: ~20 000 lượt `GetComponent` cho MỘT người, MỘT nhịp quét.

Bốn khuôn ĐƯỢC PHÉP, chép nguyên: `TeamMember.QueryNear(x, r, bộĐệm)` ·
`TeamMember.QueryNearWrapped(...)` (khi phép lọc dùng `MapWrap.Distance`) ·
`agent.FindNearestEnemy(tầm)` · `StickmanAgent.AgentOf(member)` thay cho `GetComponent`.
Và luôn: **so toạ độ TRƯỚC, hỏi component SAU**.

Hai phép đo canh (`StickmanDoctor.Perf.cs`) đọc văn bản nguồn nên bắt được chỗ mới ngay khi
chưa ai bật Play. Đã cân nhắc và vẫn rẻ thì viết `per-frame-ok:` **kèm lý do** trong thân vòng —
sổ nợ có lý do, không phải công tắc tắt cảnh báo. Chi tiết: [Performance.md](../KnowledgeBase/Performance.md).

### Bẫy đã gặp khi làm cho AI yếu
- **Phiên song song**: compile 0 lỗi rồi 6 lỗi ở file mình không đụng — phiên khác đang sửa.
  Quy lỗi theo FILE, đối chiếu `git status`. Xem `CompileCheck.py`.
- **Vá bằng Python đọc-sửa-ghi cả file** có thể đè công của phiên khác cùng file. Sau mỗi vá:
  `git diff <file> | grep "^-"` — chỉ được thấy đúng dòng mình định xoá.
- **Heredoc Bash dài** bị cắt «unexpected EOF» → ghi `.py` rồi chạy. Chuỗi C# verbatim có
  `""""` phá triple-quote Python → dùng `'''`.
