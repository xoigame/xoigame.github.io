## ⚠⚠ DÀN TRẬN — KIỂU CHƠI CHỈ HUY: kéo chọn quân · chạm ra lệnh (2026-09-08)

`Assets/Scripts/Gameplay/Command/SquadCommand.cs` · `SquadCommandControls.cs` · `SquadCommandHud.cs` ·
`SquadOrderRunner.cs` · dựng scene bằng `Assets/Editor/Units/StickmanArmyCommandBuilder.cs`
(`Demo_62_DanTran`, nút **★ DÀN TRẬN** trên Bảng điều khiển).

Nguyên văn yêu cầu: *"thay vì điều khiển nhân vật của mình thì kéo và drag thì chọn được nhóm
lính, hoặc click vào 1 lính để chọn và bấm cho nó di chuyển tới mục tiêu nào đó, hoặc ra lệnh
trên bảng ra lệnh, cho nó là scene khác"*.

**Đây là VAI THỨ BA của người chơi, không phải hệ game thứ hai.** `PlayerRole` đã có sẵn
`Hero` · `Commander` · `Observer`; map, quân, vũ khí, cây chỉ huy, trọng tài đều dùng lại
nguyên. Cái đổi duy nhất là CHỖ NGỒI — nên scene này **không có `SpawnPlayer`**.

### Ba tầng lệnh, đừng nhồi vào nhau

| Tầng | Cơ chế đã có | Câu nó trả lời |
|---|---|---|
| CẢ PHE | `TeamCommander.Issue` (bốn nút hàng dưới của HUD) | "toàn quân tiến hay giữ" |
| CẢ PHE, theo chỗ | `RallyBanner` / `CommanderPlayHud` — **DỜI CỘT MỐC** | "cả cánh quân bám vào đây" |
| **TỪNG NGƯỜI / TỪNG TỔ** | `SquadCommand` + `SquadOrderRunner` ← **mới** | "cho RIÊNG ba thằng cung này lên đồi kia" |

Hai tầng đầu không trả lời được câu thứ ba, và đó là lý do có bộ này. Ngược lại: **đừng dùng
`SquadCommand` để đẩy cả đạo quân** — cái đó đã có hai cửa rồi.

### Lệnh tay dịch ra đồ CÓ SẴN, không đẻ FSM/behavior mới

- ĐI TỚI · GIỮ CHỖ → `AIBehavior.GuardTarget` trỏ vào **một cột mốc RIÊNG của từng người**
  (`SquadOrderRunner.PlaceMarker`). Mỗi người một mốc thì cả tổ dàn thành hàng; thả chung một
  toạ độ là cả tổ chồng lên nhau và mọi cơ chế đội hình của `StickmanAgent` mất nghĩa.
- ĐÁNH → `AIBehavior.HuntTarget` trỏ vào chính mục tiêu người chơi chỉ.

⚠⚠ **MỌI LỆNH TAY PHẢI KÈM `StickmanAgent.SetKeepsOwnOrders(true)`.** `CommandNode.ApplyToAgent`
và `MatchModeBase.TickOrders` ghi đè `SetBehavior` MỖI NHỊP — thiếu cờ đó thì lính nhận lệnh
xong bị lôi về tuyến ngay giây sau, và nhìn vào chỉ thấy *"bấm không ăn"*. Cùng bài học với
người vác cờ (`CaptureTheFlag`), tổ canh nhà (`CampHomeGuard`), đội đổ bộ (`TroopTransport`).

⚠ **CÓ GIỮ THÌ PHẢI CÓ TRẢ — bốn đường, thiếu đường nào cũng để lại người "mất tích":**
① tới nơi → chuyển GIỮ CHỖ (đây là ý người chơi, KHÔNG trả quyền — nhưng HUD luôn in số người
đang nhận lệnh tay nên cờ không bao giờ ngầm, kèm nút **TRẢ HẾT**);
② người chơi bấm «Tự do»; ③ mục tiêu chết (lệnh đánh);
④ **van kẹt**: đi hoài mà không NGẮN LẠI ĐƯỢC khoảng cách trong 18 s thì tự trả quyền —
đo bằng *khoảng cách tốt nhất đã đạt*, không đo bằng "đứng yên", vì lính bị chặn vẫn dập dình
qua lại quanh chỗ tắc nên xét vận tốc thì van không bao giờ bung.

⚠ **TỚI NƠI PHẢI `SetHoldingLine(true)`.** Thiếu nó thì `AIStateGuard` coi người này là *"vệ sĩ
rảnh việc"* và cho **đi tới đi lui** quanh cột mốc (`StandGuard` → `PatrolAtPost`) — người chơi
vừa bảo "đứng đây" mà cả tổ dập dình thì lệnh giữ chỗ nhìn như không ăn. Cờ này phải trả về
`false` ở `Grab` (lệnh mới) và ở `Release`, không thì ai từng nhận lệnh giữ chỗ sẽ **đứng chôn
chân trong mọi lệnh về sau**.

⚠⚠ **TRẢ QUYỀN XONG THÌ VỀ NGHỈ, ĐỪNG `Destroy(this)`.** `CampRallyEscort` tự huỷ được vì cột
mốc của nó là của một hệ tự động; ở đây người chơi bấm liên tục. `Destroy` chỉ có hiệu lực CUỐI
FRAME mà `GetComponent` vẫn trả về component đang chờ huỷ ⇒ "trả quyền rồi ra lệnh mới ngay
trong cùng frame" hồi sinh đúng cái component sắp bị xoá, và **mệnh lệnh vừa phát biến mất lúc
cuối frame**. Không lỗi nào báo, chỉ là thỉnh thoảng bấm không ăn. Dùng `Phase.Idle`.

### Dàn hàng = thứ tự TRƯỚC–SAU, vì sân là MỘT LÀN NGANG

`SquadCommand.OrderMove` xếp tổ theo vai (khiên → cận chiến → tầm xa/hỗ trợ), hàng **căn giữa**
điểm chỉ, khiên ở đầu phía địch. Trong cùng lớp thì ai đang đứng gần địch hơn nhận slot ngoài
hơn — để không ai phải chạy cắt ngang qua cả hàng.

⚠ **Hướng "phía địch" đo từ ĐỊCH ĐANG SỐNG**, không lấy quy ước "phe 1 ở trái": người chơi đổi
ghế được, và trận trôi qua nửa sân là quy ước cũ sai hướng — lúc đó khiên đứng SAU lưng cung
thủ mà không có gì báo.

### ⚠⚠ MỘT CỬ CHỈ MỘT CHỦ — chỗ dễ hỏng nhất của cả bộ

Cú kéo trái ở màn này là KHUNG CHỌN QUÂN. Hai hệ khác cũng rình đúng cú kéo đó, và cả hai đều
im lặng khi tranh nhau:

- `DemoCameraFollow._observerDrag` biến cú kéo thành LIA CAMERA ở **mọi scene không có nhân
  vật** ⇒ khoanh vùng nào cũng kéo trôi bản đồ. `SquadCommandControls` gọi
  `DemoCameraFollow.SetObserverDrag(false)` **lúc chạy** (không bake vào scene: cờ đó là của
  camera, và ai vừa nhận cử chỉ thì người đó phải tắt — bake thì lắp bộ này vào màn khác là
  cú kéo lại có hai chủ), rồi trả lại `true` ở `OnDisable`.
- `StickmanTouchControls` vẽ CẦN ẢO + cụm nút đánh cho một nhân vật KHÔNG TỒN TẠI và nuốt nửa
  dưới màn hình ⇒ đăng ký `StickmanUI.RegisterControlSuppressor` — đúng câu hỏi mà cơ chế đó
  sinh ra để trả lời (*"lúc này người chơi có đang lái nhân vật không"*). **Phải gỡ ở
  `OnDisable`**, để lại hàm trỏ vào object đã huỷ là scene sau mất luôn cần ảo.

Camera vẫn lia được, chỉ đổi kênh: **hai ngón** (kèm chụm–dang đổi cỡ nhìn) · **chuột giữa** ·
**phím mũi tên / WASD**, tất cả đi qua `StickmanTouchInput.AddCameraPan`.
⚠ Phím phải **đảo dấu**: kênh đó được đọc như một cú KÉO THẾ GIỚI (kéo sang phải = camera lùi
sang trái), còn bấm ▶ là muốn NHÌN sang phải.

### Bảng cử chỉ (đừng đổi mà không sửa cả `hint` trong catalog)

| Cử chỉ | Việc |
|---|---|
| KÉO trên sân | khoanh vùng chọn quân mình (Shift = cộng vào danh sách) |
| CHẠM vào lính mình | chọn riêng người đó (Shift = thêm/bớt) |
| CHẠM vào địch | cả tổ đang chọn xông vào đánh nó |
| CHẠM xuống đất | cả tổ DÀN HÀNG tới đó |
| Chuột PHẢI | luôn là RA LỆNH |
| Hai ngón · chuột giữa · mũi tên | lia camera · đổi cỡ nhìn |

⚠ **Quân MÌNH được hỏi TRƯỚC.** Đảo lại thì trong đám hỗn chiến, bấm vào đồng đội đang đứng
cạnh địch là ra lệnh xông vào chỗ đó — một cú bấm cho ra hai kết quả tuỳ đám đông, tức không
học được.

⚠ Cú chạm chỉ tính là RA LỆNH khi nó **không phải một cú kéo** (ngưỡng đo theo chiều cao màn
hình, không phải pixel chết). Khung kéo NGANG THUẦN vẫn phải bắt được người — sân một làn nên
đó là cú kéo tự nhiên nhất — nên chiều cao khung được nới tối thiểu 0.35 world.

### Trọng tài và scene

⚠ **Dùng lại `SkirmishMode`, KHÔNG viết mode mới.** Luật thắng của một trận dàn quân đúng là
*"diệt sạch phe kia"*, và lớp đó đã khai `DecideCampaign` cho `StickmanModeAudit`. Đẻ thêm một
trọng tài chỉ để đổi cái tên là thêm một bản chép tay của cùng vòng đếm quân.

⚠ **`SquadCommand` phải theo GHẾ của trọng tài** (`_mode.PlayerTeam`, hỏi lại mỗi 0.5 s).
`GameSession` cho chọn phe ở màn hình bắt đầu; bảng lệnh ghim cứng phe 1 thì người chọn phe đỏ
khoanh vùng **không chọn được ai**, còn chạm vào chính lính mình lại thành lệnh xông vào đánh.

⚠ **Sân là ĐỒI LƯỢN, hai đầu phẳng.** Dàn trận trên sân phẳng lì thì mọi chỗ đứng như nhau và
lệnh «cho tổ cung lên chỗ này» không có nghĩa gì (bài học `Demo_21_Arena`). Dải phẳng phải trùm
cả căn cứ lẫn tuyến xuất phát: quân bake trên sườn dốc sẽ trượt xuống chân dốc trước khi ai kịp
ra lệnh.

⚠ Mỗi phe **12 người đủ ba vai** (3 khiên · 5 cận · 4 xa) là bắt buộc, không phải trang trí:
HUD có ba nút lọc theo vai và `OrderMove` dàn hàng theo đúng thứ tự đó. Đạo quân một vai thì cả
hai cơ chế ấy thành nút chết mà không có gì báo.
