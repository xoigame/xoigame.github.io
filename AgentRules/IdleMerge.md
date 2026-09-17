## ⚠⚠ IDLE HAI ĐẦU + 2048 QUÂN — HAI KIỂU CHƠI MERGE MỚI (2026-09-17)

Code: `Assets/Scripts/Gameplay/Merge/`. Màn: `Demo_91_IdleSiege` · `Demo_92_Merge2048`.
Bộ dựng: `StickmanIdleMergeBuilder` · `StickmanMerge2048Builder`.
Anh em cùng thư mục: [MergeArmy.md](MergeArmy.md) (`Demo_86`, bàn 12 ô chạm-hai-ô).

### 1. Ba mode merge, và vì sao không gộp được

| | `MergeArmyMode` (86) | **`IdleMergeMode` (91)** | **`Merge2048Mode` (92)** |
|---|---|---|---|
| Bàn lúc chơi | **dừng giờ** (`timeScale = 0`) | trận VẪN CHẠY | trận VẪN CHẠY |
| Chọn cặp nhập | chạm đúng hai ô | chạm đúng hai ô | **không chọn được** — cả bàn trượt |
| Ô trên bàn là gì | một phiếu chờ ra sân | **một người THẬT đang đứng ngoài sân** | một phiếu chờ |
| Hướng địch | một phía | **hai phía cùng lúc** | một phía |
| Nguồn quân | phát mỗi đợt | **vàng theo giây → TỰ TUYỂN** | mỗi nước vuốt sinh một ô |
| Thua vì | hết quân giữa trận | hết mạng của trại | **KẸT BÀN** |
| Kết thúc | trụ 8 đợt là thắng | **vô tận**, điểm là số phút | thả được lính bậc 8 |

⚠ Mode 86 dừng giờ còn 91/92 thì không — đó là hai luật ngược nhau ở đúng chỗ nhạy nhất. Nhét
chung một lớp là hai luật chọi nhau trong một hàm, và lần sửa sau ai chạm vào cũng gãy một bên.

⚠ Thang bậc **dùng chung**: `MergeTierLadder` (8 bậc, một thang duy nhất) cho 91 và 92;
`MergeArmyTable` (4 nhà × 4 bậc) vẫn của riêng 86. Bàn TRƯỢT không xài được bốn nhà — người chơi
không chọn được ô nào chạm ô nào, nên bốn loại trên 16 ô là 1/4 cơ hội ghép và bàn kẹt trước khi
kịp lên bậc 3.

### 2. ⚠⚠ MÔ PHỎNG ĐÃ BÁC BỎ BẢN THIẾT KẾ ĐẦU CỦA MODE IDLE

Bản đầu: thu nhập là một con số PHẲNG (x vàng/giây), địch leo theo bậc. Quét **48 bộ số × 3 hạng
người chơi × 60 ván**: **không bộ nào sống quá 6 phút**, và người nhập giỏi chỉ hơn người không
nhập 1.2–2.1 lần — tức cơ chế mang tên kiểu chơi gần như không đáng làm.

Lý do **không phải hệ số mà là sai TRỤC**: sức mạnh địch leo theo hàm MŨ (bậc), còn thu nhập
phẳng chỉ cho sức mạnh leo TUYẾN TÍNH. Không có hệ số nào cứu được cuộc đua giữa hàm mũ và một
đường thẳng.

Sửa trục — cho thu nhập leo **cùng thang** với địch:

- mỗi mạng địch trả `BountyBase × PowerOf(bậc của nó)`;
- lính tuyển vào là bậc `bậc cao nhất − 2`, giá `RecruitCostBase × PowerOf(bậc đó)`.

Vế thứ hai là thứ biến phép nhập thành **cả tiến trình**: người không nhập giữ bậc cao nhất = 1
nên mãi mãi tuyển lính bậc 1; người có nhập nâng luôn cái SÀN của mình.

| Thang 8 bậc, hệ số 2.24 | không nhập | nhập vừa (50%) | nhập giỏi |
|---|---:|---:|---:|
| phút trụ được (60 ván) | **3.7** | **14.2** | **14.2** |

⚠ Đọc kỹ cột giữa: **nhập vừa ≈ nhập giỏi**. Kiểu chơi này thưởng cho việc CÓ ĐỘNG VÀO, không
thưởng sự chính xác — đúng thứ một mode idle cần. Khoảng cách thật nằm giữa "có nhập" và "không
nhập" (**×3.8**).

⚠ Nhịp đợt là knob nhạy thứ hai: 15s cho 3.7/14.2; 18s cho 4.5/17.5 (chờ lâu hơn). Bậc địch leo
mỗi **11** đợt — leo mỗi 7 đợt thì người nhập giỏi cũng chỉ tới phút 9.

⚠ GIỚI HẠN CỦA PHÉP ĐO: Lanchester bình phương trên tổng sức mạnh mỗi bên. Không tả được tầm với
từng cây vũ khí, cung thủ bắn tự do, hay chuyện quân hai đầu không cứu nhau được. Điểm bắt đầu
đo được, không phải bản cân bằng cuối.

### 3. Hệ số bậc 2.24 — SUY RA từ con số đã đo, không chọn lại

`MergeArmyTable` đo được **2.6** cho thang 4 bậc. Thứ con số ấy thật sự chốt là **hiệu suất nhập
ở đỉnh thang**: lính bậc 4 tốn 8 lính bậc 1 và mạnh bằng `2.6³ = 17.6` → **2.20×**.

Giữ nguyên hiệu suất ấy cho thang 8 bậc: `f⁷ / 2⁷ = 2.20 ⇒ f = 2.24`.

⚠ Chép thẳng 2.6 sang thang 8 bậc cho **6.3×** — gần gấp ba mức đã đo là vừa. Một lính như thế
đứng một mình dọn sạch mọi đợt và nửa sau ván chơi không còn câu hỏi nào.

### 4. ⚠⚠ TRẦN VÀNG LÚC VẮNG MẶT NEO VÀO CÁI BÀN, KHÔNG NEO VÀO ĐỒNG HỒ

Phản xạ đầu tiên là "vắng 8 tiếng thì trả 8 tiếng thu nhập". Đo thử (50 ván, người nhập giỏi):

| vàng tặng | 0 | 30 phút | 1 giờ | 2 giờ | 4 giờ | 8 giờ | 24 giờ |
|---|---:|---:|---:|---:|---:|---:|---:|
| phút trụ được | 14.2 | **14.9** | 14.8 | 14.9 | 14.8 | 14.8 | **14.8** |

Bão hoà ngay ở **30 phút**, và 24 giờ cho ĐÚNG kết quả của 30 phút. Cái nghẽn là **12 ô của
bàn**, không phải cái ví: vàng chỉ tiêu được khi có ô trống, mà ô chỉ trống khi có lính ngã.

> Luật rút ra: **một phần thưởng không tiêu được là một phần thưởng nói dối.** Trần phải neo vào
> thứ hạn chế THẬT của kiểu chơi, không neo vào cái đại lượng sinh ra nó.

⚠⚠ **TRẬN KHÔNG CHẠY KHI TẮT GAME** — chỉ có vàng chảy. Cho trận chạy tiếp thì người chơi mở lại
và thấy mình đã thua từ ba tiếng trước, không được nhìn một giây nào. Một mode idle tặng THỜI
GIAN, không tặng KẾT CỤC.

⚠ Mốc thời gian ghi ở `OnDestroy` **và** `OnApplicationPause(true)` **và** `OnApplicationQuit`.
Trên điện thoại, thoát app thường chỉ gọi `OnApplicationPause`; thiếu nó là mọi lần vắng mặt đều
tính từ lần cuối đổi scene.

### 5. 2048 quân: HAI ĐỒNG HỒ NGƯỢC NHAU, và chúng đo được

Một bàn 2048 thuần chỉ có một sức ép (bàn đầy) và một phần thưởng (số to hơn). Ở đây, chạm một ô
là **thả lính đó ra sân** giữ cổng: bàn thoáng ra, nhưng lính đó hết nhập được.

| Cách chơi (120 ván, người chơi tham lam) | bậc cao nhất | chạm bậc 8 | số nước | kết cục |
|---|---:|---:|---:|---|
| Không thả ra sân | tb **7.48** | **52.5%** | 236 | kẹt bàn |
| Thả mọi lính bậc ≥5 | đứng im ở **5** | 0% | 3986 = **chạm trần script** | **không bao giờ kẹt** |
| Thả mọi lính bậc ≥7 | tb 6.96 | 0% | 760 | kẹt bàn |

Tức cả hai vế đều có giá THẬT: thả sớm thì sống dai mà trần bậc đứng yên; giữ hết thì lên bậc 8
được nhưng kẹt bàn ở nước ~236.

⚠ Cột "số nước" của hai dòng thả là **trần 4000 nước của script**, không phải chỗ ván tự kết thúc:
chạy lại không trần thì bàn thả-ở-bậc-5 đi tới **363 000 nước** mà vẫn không kẹt. Trần ấy có để
script dừng được — thiếu nó là một vòng lặp vô tận, vì thả ra sân làm bàn không bao giờ đầy.

⚠⚠ **THẢ KHÔNG SINH LÍNH MỚI và KHÔNG tính là một nước đi.** Cho nó sinh lính thì "dọn bàn" thành
nước đi miễn phí vô hạn, và cái chết duy nhất của kiểu chơi (kẹt bàn) biến mất.

⚠⚠ **MỖI Ô CHỈ NHẬP MỘT LẦN MỖI NƯỚC** (luật gốc 2048). Thiếu vế đó thì một hàng `1 1 1 1` vuốt
một cái ra thẳng bậc 3 — thang 8 bậc đi hết trong chục nước và bàn không bao giờ chật.

⚠ **«Bàn kín» CHƯA PHẢI là thua**: còn hai ô cạnh nhau cùng bậc thì vẫn vuốt được, và đó là
những nước căng nhất của thể loại. Đo bằng `HasMove()`, không đo bằng "còn ô trống".

⚠ Ba đường vào cho cùng một nước đi — vuốt (điện thoại) · phím mũi tên (bàn phím) · bốn nút trên
màn. Ngưỡng vuốt tính bằng **milimét thật** (`StickmanUI.PixelsPerMm × 6`), không gõ pixel: trên
màn dày điểm ảnh thì "40 pixel" biến mọi cú chạm run tay thành một nước đi.

### 6. Bốn cái bẫy đã chặn (dùng lại bài học của mode cũ)

⚠⚠ **QUÂN TA KHAI `GuardTarget`, KHÔNG `HuntTarget`.** Ở `LaneDefenseMode` cái sai này chỉ làm vỡ
đội hình; ở mode idle nó nặng hơn hẳn — địch ở HAI PHÍA, nên `HuntTarget` kéo cả hai nửa quân về
cùng một đầu (đầu nào có địch trước) và đầu kia trống trơn.

⚠⚠ **TRẠI / CỔNG KHÔNG CÓ COLLIDER.** `AIStateMarch` phá đúng thứ chặn mình, nên một cái mốc có
collider sẽ bị đập thay vì bị "lọt qua", và điều kiện thua không bao giờ xảy ra. Đo bằng khoảng
cách ngang.

⚠⚠ **Quân địch phải khai `TryTakeOrders(this, OrderAuthority.Director)`** — thiếu nó thì
`MatchModeBase.ApplyOrders` ghi đè hành vi ở nhịp sau và cả đợt quay sang đánh nhau như một trận
thường, không lỗi nào báo.

⚠⚠ **Bàn của mode idle đọc lại từ sân MỖI NHỊP**, không phải giữa hai đợt (khác `MergeArmyMode`).
Lính ngã ngoài sân mà ô vẫn còn thì bàn là một bản kê nói dối: người chơi "nhập" được những lính
đã chết và cả mode rút về một bảng tính.

### 7. Chạy lại phép đo

| Muốn biết | Làm gì |
|---|---|
| Dựng lại hai màn | ★ Bảng điều khiển › «Trấn giữa hai đầu (Demo_91)» · «2048 quân (Demo_92)» |
| Cân bằng idle / 2048 | mô phỏng trong `Docs/KnowledgeBase/MergeModes-Balance.md` (kèm script) |
| Hai mode có vào công thức JSON không | **cố ý không** — khai ở `StickmanRefereeTable.NotInRecipe` kèm lý do |
| Màn có dòng HUD không | Doctor › «Màn chơi có dòng HUD không» |
