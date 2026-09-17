## ⚠⚠ ĐIỀN KINH THÂN MỀM — TRỤC ĐIỀU KHIỂN THỨ HAI CỦA DỰ ÁN (2026-09-16)

Code: `Assets/Scripts/Gameplay/Athletics/`. Màn: `Demo_85_Athletics`. Bộ dựng:
`StickmanAthleticsBuilder`. Tham khảo ngoài: *Ragdoll Runners* (điều khiển riêng hai chân).

### 1. Vì sao đây là một TRỤC, không phải mode thứ 51

50 mode cũ điều khiển nhân vật bằng **cùng một câu hỏi**: *"đi hướng nào"* — nút trái/phải,
cần gạt, hay AI tự đi. Ở đây câu hỏi đổi hẳn: **"chân nào, lúc nào"**.

| | Mọi mode khác | Điền kinh |
|---|---|---|
| Thao tác | giữ một nút → đi | chạm SO LE hai nửa màn hình |
| Tốc độ đến từ | `MaxSpeed` của locomotion | NHỊP TAY của người chơi |
| Thứ người chơi luyện | canh vị trí, chọn mục tiêu | một nhịp cơ học |

Cùng rig, cùng `StickmanLocomotion`, cùng ragdoll. Đây là phép NHÂN: bất kỳ nội dung nào cũng
chạy được trên trục này, và trục này chạy được với bất kỳ nhân vật nào của dự án.

### 2. ⚠⚠ MỘT TRANSFORM MỘT CHỦ — đi qua `SetActionLegs`, đừng chạm IK

Rig này là IK: animation chỉ ĐẶT `IKLegL`/`IKLegR`, `LimbSolver2D` tự giải xương. Chủ sở hữu duy
nhất của hai IK chân là **`StickmanLegWalker`**.

`AthleteLegs` **không** chạm vào IK. Nó gọi `SetActionLegs(offsetTrái, offsetPhải, nghiêngThân,
weight)` — đúng cửa mà `StickmanBodyAnimator` và `StickmanMount` đã đi qua. Ghi thẳng vào IK là
hai chỗ cùng ghi trong `LateUpdate` và chân giật theo thứ tự script.

⚠ Tốc độ cũng vậy: đi qua **`SetRaceTrim`** (kênh tốc độ của trục đua), KHÔNG ghi thẳng
`linearVelocity`. Ghi thẳng là bỏ qua dốc, bậc, va chạm, quán tính và hãm khi tiếp đất.

### 3. ⚠⚠ ĐỘ KHÓ PHẢI KHAI THẲNG TRÊN NHỊP CHẠM — bài học lặp lại lần thứ hai

**Bản đầu sai y như màn «chém đúng nhịp».** Nó cộng `gain` mỗi cú chạm và trừ `decay` mỗi giây,
tức tốc độ là kết quả một **cuộc đua giữa hai hằng số**. Đo (Python):

| Nhịp chạm | 100 m (bản đầu) |
|---:|---:|
| 0.45 s | 111 s |
| 0.28 s | 110 s |
| 0.20 s | 103 s |
| 0.15 s | **28 s** |
| 0.12 s | 21 s |

Một **VÁCH ĐÁ**: chậm hơn ngưỡng thì bò mãi, nhanh hơn một chút thì lập tức kịch trần, giữa hai
bên gần như không có vùng nào. Người chơi không học được gì vì không có phản hồi ở giữa.

Nay khoảng cách giữa hai cú chạm **ánh xạ trực tiếp** ra nhịp (`GapFast` 0.13 s → `GapSlow`
0.50 s), và nhịp chỉ được LÀM MƯỢT (`RiseRate` 2.2 / `FallRate` 1.1) chứ không cộng dồn:

| Người chơi | nhịp (s) | 100 m | 200 m | nhịp cuối |
|---|---:|---:|---:|---:|
| mới chơi (vô nhịp) | 0.46 | 85 s | 166 s | 0.00 |
| bình thường | 0.32 | 40 s | 79 s | 0.56 |
| khá | 0.24 | 26 s | 51 s | 0.71 |
| giỏi | 0.18 | 23 s | 45 s | 0.85 |
| tối đa | 0.13 | 20 s | 40 s | 0.99 |

Một **dốc đọc được**. Tốc độ sàn 0.90 u/s → trần 5.12 u/s (5.7×).

⚠ **Bấm trúng chân vừa bấm phải ĐAU** (nhịp còn một nửa). Bỏ qua cú sai thì cách chơi tối ưu là
đập loạn cả hai ngón, và cái "hai chân" biến mất khỏi trò chơi.

### 4. Tám nội dung = BỐN cơ chế × bảng số

| Cơ chế | Nội dung | Điểm |
|---|---|---|
| `Sprint` | 100 m · 200 m | GIÂY (thấp hơn tốt hơn) |
| `Hurdle` | vượt rào 110 m | GIÂY |
| `Jump` | nhảy xa · ba bước · nhảy cao | MÉT (xa, hoặc CAO nếu góc > 60°) |
| `Throw` | ném lao · đẩy tạ | MÉT vật bay |

Thêm nội dung thứ chín = thêm **một dòng** trong `AthleticTable`, không thêm file nào.

⚠ **Rào KHÔNG phải collider.** Một hàng collider chắn ngang đường chạy thì cú va chạm do
`Locomotion` xử lý (trèo · dừng · đẩy lùi) và nó không biết đây là một cuộc thi — vận động viên
bị **dán vào rào** chứ không "vấp rồi chạy tiếp". Mode đo rào bằng TOẠ ĐỘ; hình cái rào chỉ để
người chơi canh.

⚠ **Quá vạch giậm là PHẠM QUY.** Không có luật đó thì cách chơi tối ưu là chạy tới cuối sân rồi
mới bật, và vạch giậm chỉ còn là một vệt sơn.

⚠ **Cú bật đi qua `Locomotion.Jump()` TRƯỚC** rồi mới cộng thêm vận tốc dọc. `Jump()` còn đổi
TRẠNG THÁI (rời đất, mở van điều khiển trên không, khoá bám thang); đặt thẳng `linearVelocity` là
nhân vật bay trong lúc hệ đi bộ vẫn tin nó đang đứng — và cú tiếp đất không bao giờ được ghi nhận.

⚠ **Đo tầm ném bằng chỗ vật NẰM YÊN**, không bằng chỗ chạm đất lần đầu: tạ nảy, lao trượt. Lấy
điểm chạm đầu là một con số nhỏ hơn thứ người chơi nhìn thấy — và con số cãi lại mắt thì không ai
tin.

### 5. ⚠ Kỷ lục "càng NHỎ càng tốt"

`SaveBag.Best` chỉ biết giữ số **lớn** hơn. Không có `BestLow` thì "kỷ lục" chạy 100 m là lần
chạy **tệ nhất**, và mỗi lần chơi con số đó chỉ có tăng. Cất bằng số ÂM rồi đổi dấu khi đọc.

⚠ `SaveBag` chỉ giữ số nguyên ⇒ cất bằng **centigiây / centimét** (`score × 100`), nếu không mọi
thành tích dưới 1 đơn vị đều làm tròn về 0.

### 6. ⚠⚠ Chỉ chạy được ở SÂN NGANG

`StickmanLocomotion.Jump` trả về `false` khi `WorldPlane.IsGround` (sân 3/4 không có phương thẳng
đứng). Ba trong bốn cơ chế ở đây là bật/ném. Mode **kiểm lại và thua thẳng kèm lý do** chứ không
chạy tiếp rồi để người chơi tự đoán vì sao không nhảy được.

### 7. ⚠ `ArcadeTouch`: hai nửa màn hình quét MỌI ngón

Nhóm một-ngón (`Pressed`/`Drag`/`Released`) cố ý chỉ đọc `GetTouch(0)`. Màn này thì hai ngón phải
ĐỘC LẬP: đọc bằng `GetTouch(0)` là chân nào được đếm phụ thuộc thứ tự Unity xếp ngón — nhấc ngón
trái một nhịp là ngón phải tụt xuống index 0 và **đổi luôn chân**.

**Một màn chọn một lối**: hoặc nhóm một-ngón, hoặc hai nửa. Dùng lẫn là cùng một cú chạm được đếm
hai lần theo hai luật. Trên máy tính: chuột trái = chân trái, chuột phải = chân phải.

### 8. ⚠ HUD phải nói CHÂN NÀO TỚI LƯỢT

Cả trò chơi là "so le", mà so le là thứ người chơi **không tự biết** mình đang đúng hay sai cho
tới khi vấp. Hai vệt sáng sát đáy màn hình nói thẳng: bên nào sáng thì bấm bên đó. Vẽ ở đáy —
ngón tay đang đặt ở nửa dưới, và một chỉ dẫn nằm **dưới** ngón tay là chỉ dẫn không ai thấy.
