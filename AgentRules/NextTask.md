## ⚠⚠ XONG MỘT VIỆC THÌ PHẢI SOÁT VIỆC TIẾP THEO — VÀ SOÁT BẰNG SỐ ĐO (2026-09-15)

Lỗi đắt nhất của dự án này không phải code sai. Là **làm xong một nửa rồi đi mất**: enum khai ra
không ai chọn, field thêm vào mà mọi asset đều 0, tool viết xong không vào Bảng điều khiển, luật
ghi vào tài liệu mà không có Check nào đo. Biên dịch xanh, Doctor xanh, và tính năng **chưa chạy
lần nào**. Cả kho memory của dự án là một danh sách dài đúng loại này: *khai mà không ai bật* ·
*dựng xong mà không ai trang bị* · *tính năng hoàn chỉnh mà không chỗ nào chọn* · *bỏ một thiết
kế mà chỉ cắt một đầu*.

Cuối phiên ai cũng mang máng "hình như còn gì đó", nhưng **không ai đo**, nên việc rơi lại thành
nợ không tên — đến phiên sau thì không còn ai nhớ nó là nợ.

Vì thế: **xong một việc thì chạy phép đo, rồi đề xuất — không đoán, cũng không im.**

### Phép đo

```powershell
./Docs/Tools/NextTasks.ps1 -Changed <file>,<file>      # ~5 giây
./Docs/Tools/NextTasks.ps1                             # lấy cả git status; ~40 giây, lẫn phiên khác
./Docs/Tools/NextTasks.ps1 -Since HEAD~1 -All          # việc vừa commit
```

Đọc-only: không mở Unity, không sửa file. Nó trả về **hai rổ**:

| Rổ | Nghĩa | Xử lý |
|---|---|---|
| **NỢ CỦA VIỆC VỪA LÀM** | nghĩa vụ do chính thay đổi này đẻ ra | làm nốt **trong phiên này**, trước khi bàn giao |
| **VIỆC TIẾP THEO — ỨNG VIÊN** | việc đứng riêng được, có bằng chứng | **đề xuất**, để người dùng chọn |

Tám phép đo, mỗi phép một triệu chứng thật: assembly cũ hơn file vừa sửa (chưa có bằng chứng biên
dịch) · bảng học chưa ghi · asset mới thiếu `.meta` · class mới không tài liệu nào nhắc · ký hiệu
vừa thêm chỉ xuất hiện **đúng một lần** trong `Assets/` (khai mà chưa nối) · TODO mới thêm · file
trong sổ nợ lại dài thêm · dòng "Còn nợ" phiên trước tự ghi trong nhật ký bảng học.

⚠ Nó **không thay** `Verify.ps1` và Doctor. Nó chỉ trả lời "còn gì chưa nối", không trả lời "có
đúng không".

### Tự động — vì luật bằng chữ thì không tự chạy

Đo được ngày 2026-09-16: các phiên khác kết thúc mà **không đề xuất gì**. Không phải chúng cãi
luật — phiên nạp `AGENTS.md` lúc KHỞI ĐỘNG, nên bản cũ vẫn nằm trong đầu chúng; và một dòng
trong file dài thì lượt nào cũng có thể quên. Một luật chỉ tồn tại khi có thứ CHẠY nó.

Phần máy móc (Claude Code, `.claude/settings.json` → `Docs/Tools/NextTasksHook.ps1`):

| Móc | Làm gì |
|---|---|
| `PostToolUse` (Write·Edit) | ghi đường dẫn file vừa sửa vào sổ tay của phiên — để hook biết **chính xác** phiên này đụng gì |
| `Stop` | cuối mỗi lượt: đo đúng những file đó, còn việc thì trả ngược kết quả cho AI (`decision: block`) |

Ba van giữ cho nó không thành tiếng ồn — và tiếng ồn thì bị tắt, tắt rồi thì luật chết lần nữa:

1. `stop_hook_active` — lượt sinh ra từ chính lần chặn trước thì im (không lặp vô hạn).
2. Sổ tay của phiên; không có sổ (sửa bằng lệnh shell) thì lùi về cửa sổ **20 phút**, chứ không
   quét cả `git status` — repo này lúc nào cũng có phiên khác đang ghi hàng trăm file.
3. Cùng một bản báo cáo chỉ nhắc **một lần trong 90 phút**; **báo xong thì xoá sổ tay**, nên
   lần sau đo việc MỚI chứ không nhắc lại y nguyên đống cũ. Sổ dài thì chỉ lấy 40 file gần
   nhất — đo 42 file mất 9 giây, để phình mãi thì cuối mỗi lượt lại đắt thêm.

⚠ **Worktree không tự có hook.** Phiên chạy trong `.claude/worktrees/…` là một checkout git
riêng: file chưa commit thì không có ở đó. Muốn MỌI phiên của dự án đều soát việc tiếp theo thì
`.claude/settings.json`, `Docs/Tools/NextTasksHook.ps1` và `NextTasks.ps1` phải được **commit**.
Phiên đang mở sẵn ở cây chính cũng chỉ nạp `settings.json` khi khởi động — đo ngày 2026-09-16:
sau khi thêm hook, 5 phiên khác sinh sổ tay ngay, nhưng 4/5 worktree thì không có gì.

⚠ Chế độ `-Fast` của hook **bỏ** mục «nợ cũ»: nợ tồn đọng không phải hậu quả của việc vừa làm.
Hook hỏng thì luôn `exit 0` — không bao giờ chặn phiên làm việc vì lỗi của chính nó.
Tắt tạm: xoá móc `Stop` trong `.claude/settings.json`. AI tool khác (Codex, Cursor) không đọc
file này — với chúng, bước 7 của `AGENTS.md` vẫn là đường duy nhất.

### Sửa X thì thường còn nợ Y

Bảng này là kinh nghiệm đã trả giá của chính dự án, không phải lý thuyết:

| Vừa làm | Việc thường còn nợ | Đo bằng |
|---|---|---|
| Thêm enum / vai / chế độ mới | chỗ **CHỌN** nó: `switch`, bảng, menu, playbook | `NextTasks.ps1` mục «chưa ai gọi» |
| Thêm field vào `AIProfile`/`CommandDoctrine`/ScriptableObject | builder hoặc asset **ghi giá trị ≠ 0** | `.claude/skills/stickman-ai/scripts/scan_dead_ai.py` |
| Thêm tool editor | đăng ký `StickmanToolCenter`/pipeline, `proof`, `extraSources` | mở Bảng điều khiển: có hàng, và báo "cần dựng lại" đúng lúc |
| Đổi bảng số đã bake vào scene/prefab | **dựng lại kho** rồi smoke lại | Build › 9c (FORCE), map smoke |
| Thêm một luật vào tài liệu | một **Check trong Doctor** — luật không đo được là luật không tồn tại | cố ý làm hỏng một lần để thấy nó ĐỎ |
| Thêm file `.cs` | đúng thư mục tính năng; vào INDEX + bảng tra nếu là cơ chế | Doctor mục bố cục thư mục |
| Bỏ / nghỉ hưu một thiết kế cũ | cắt **cả hai đầu** — nơi sinh dữ liệu **và** nơi đọc | grep chỗ đọc còn lại |
| Thêm art / sprite | thứ tự vẽ, điểm chạm đất, và **nhìn ảnh ghép thật** | render composite, không xem từng sprite |
| Thêm map / chế độ chơi | chỗ chọn ở menu/`GameShell` + smoke | dựng xong phải **chọn được** mới tính |
| Tách một file dài | chính phép đo tìm-bằng-tên-file có thể **câm** sau khi tách | chạy lại phép đo đó |
| Sửa file có trong sổ nợ | số dòng **chỉ được giảm** | `NextTasks.ps1` mục «file dài» |

### Đề xuất thế nào

- **Tối đa 3 việc.** Danh sách dài là danh sách không ai đọc. Xếp theo: chặn người khác >
  hỏng im lặng > nợ tích luỹ > việc dễ.
- Mỗi việc **một dòng ba phần**: *làm gì* · *vì sao (số đo thật)* · *dấu hiệu xong*. Không có số
  đo thì không phải đề xuất, chỉ là cảm giác — bỏ.
- **Không tự làm.** Đề xuất xong thì dừng, chờ người dùng chọn. Việc ngoài phạm vi mà tự làm
  thêm là cách nhanh nhất để một phiên đang xanh thành một phiên phải xem lại từ đầu.
- **Không có gì thì nói không có gì.** Một dòng "không còn nợ nào đo được" là kết quả hợp lệ;
  bịa ra việc để trông chăm chỉ thì tệ hơn im lặng.
- Việc đã **cân nhắc và từ chối** → ghi vào [`Docs/Tools/NextTasksIgnore.txt`](../Tools/NextTasksIgnore.txt)
  kèm lý do, để phiên sau không đề xuất lại. Không ghi vào đó thứ mình chỉ đang ngại làm.

### Không được đề xuất

Refactor chung chung ("nên dọn lại code"), audit toàn dự án, viết lại tài liệu không liên quan,
thêm test cho mảng không có bài test thật, hay bất cứ việc nào không có một con số đứng sau. Đó
là các đường mở rộng phạm vi mà [Cách làm tiết kiệm token](../../AGENTS.md) đã cấm.

### Liên quan

[FileSize](FileSize.md) · [Tooling](Tooling.md) · [FolderLayout](FolderLayout.md) ·
[TaskIndex](TaskIndex.md) · skill `stickman-next`.
