## ⚠⚠ THỦ TUYẾN — VÀ HÀNH VI AI THỨ 17 (2026-09-16)

Code: `Assets/Scripts/Gameplay/LaneDefense/` + `Assets/Scripts/AI/States/AIStateMarch.cs`.
Màn: `Demo_87_LaneDefense`. Bộ dựng: `StickmanLaneDefenseBuilder`.

### 1. Cả thể loại nằm trong MỘT câu, và câu đó dự án chưa có

20 mode đánh nhau của dự án đều dựng trên một câu: *"tìm địch mà đánh"*. Thủ tuyến đứng trên câu
**ngược lại** — quân địch **không quan tâm bạn**, nó chỉ muốn đi tới cuối đường; bạn mới là kẻ
phải chặn nó.

Không hành vi nào đã có tả được điều đó:

| | `Travel` (VIP, sứ giả) | `Race` (tay đua) | **`March`** (quân thủ tuyến) |
|---|---|---|---|
| Bị chắn đường | **ĐỨNG ĐỢI** vệ sĩ dọn | **LÁCH QUA** | **PHÁ CÁI CHẮN** |
| Thấy địch bên cạnh | không đánh | không đánh | **không đuổi** — chỉ đánh cái chặn mình |
| Tới đích | đứng hẳn, hết việc | đích chỉ là một cổng | **đích là điều kiện THUA của người chơi** |

Nhét luật này vào `Travel` bằng một cờ là hai luật ngược nhau sống trong một hàm; lần sửa sau ai
sửa cho VIP thì quân thủ tuyến gãy mà không lỗi nào báo.

**Thêm một `AIBehavior` = 5 chỗ:** giá trị enum · field `MarchState` · khởi tạo trong ctor · một
dòng trong `DefaultState()` · một dòng loại trừ trong `IsCombatant`. (Rẻ hơn `MissionType` — cái
đó 13 chỗ.)

### 2. ⚠⚠ "Không đánh gì cả" là SAI — cái chắn phải hỏng được

Quân hoàn toàn không đánh thì mọi bức tường là tường **vĩnh viễn**: người chơi xây một hàng rào
bịt kín lối đi và ván chơi đứng lại mãi mãi — không thắng, không thua. Cả thể loại sống bằng câu
hỏi *"chặn ở đâu và chặn được bao lâu"*, mà câu đó chỉ có nghĩa khi cái chặn **hỏng được**.

⚠ Nhưng **chỉ đánh thứ ĐANG CHẶN**, đo bằng một cú dò ngay trước mặt **theo hướng đi** (không theo
hướng nhìn — nhân vật quay mặt theo nhiều thứ). Cho nó aggro bình thường là quân rẽ ngang đuổi
người chơi, và thủ tuyến biến thành một trận hỗn chiến — tức đúng mode mà dự án đã có 20 cái.

⚠ Dò trả về **cả công trình lẫn người**: ba anh lính đứng chắn cũng là một bức tường.

⚠⚠ **Gặp vật chắn thì GIAO cho `AIStateCombat`, đừng tự viết lại cách đánh.** Cả nhịp đánh — đỡ
đòn, nhích tầm, đánh-rồi-rút, chọn chiêu theo vũ khí — nằm trong `ICombatStrategy`. Đường về miễn
phí: `AIStateCombat` hết mục tiêu thì tự gọi `Agent.DefaultState()`, mà với hành vi `March` thì đó
chính là `MarchState`.

⚠ `NavigationFocus` **luôn là cái đích**, kể cả khi đang đánh. Trả về mục tiêu (như lớp gốc) thì
quân đánh xong một cái tường bên lề đường sẽ đứng luôn ở đó — nó đã "tới nơi" theo tầng tìm đường.

### 3. Ba lỗi thiết kế của bản đầu (sửa trong cùng ngày)

⚠⚠ **Chốt khoá vĩnh viễn.** Bản đầu ghi chốt đã bán vào một `HashSet`. Lính thủ chết trong đợt thì
chốt của nó không ai đứng nữa **mà cũng không mua lại được** — sau vài đợt cả tuyến thành một hàng
nút không bấm được, và người chơi thua mà không hiểu vì sao. Nay sổ là `chốt → lính`, và "trống" đo
bằng *"người ở đó còn sống không"*.

⚠⚠ **Vàng không có chỗ tiêu.** Tuyến chỉ có 7 chốt còn vàng cộng dồn mỗi đợt ⇒ từ khoảng đợt 5
người chơi ngồi trên một đống vàng không mua được gì, và mọi quyết định của nửa sau ván chơi biến
mất. Nay bấm lại chốt đã có người là **NÂNG CẤP** (giá `45 + 35×bậc`) — giữ cho vàng luôn có chỗ
tiêu mà **không nới cái trần chốt**, tức không phá mất câu hỏi "chặn ở đâu".

⚠ **Đợt leo gấp đôi.** `3 + 2×đợt` cho ra **27 tên ở đợt 12** trong khi tuyến chỉ có 7 chốt — từ
khoảng đợt 8 không có cách chơi nào giữ nổi, và "khó dần" biến thành "đến lúc thì thua". Nay
`3 + đợt`.

### 4. Hai cái bẫy của sân

⚠⚠ **ĐÍCH KHÔNG CÓ COLLIDER.** Gắn collider cho nó là mời cả đợt đứng lại đánh nhau với một cái
cột — và vì `March` là "cái gì chặn thì phá", quân sẽ **phá đúng cái đích** và không bao giờ "lọt
tới nơi". Mode đo bằng khoảng cách ngang.

⚠⚠ **Quân phải khai `SetKeepsOwnOrders(true)`** — cùng bẫy mà `Racer.Awake` đã ghi. Thiếu nó thì
`MatchModeBase.ApplyOrders` ghi đè hành vi ở nhịp sau và cả đợt quay sang đánh nhau như một trận
thường, không lỗi nào báo.

⚠ **Lính thủ khai `GuardTarget` neo vào chỗ đứng, KHÔNG `HuntTarget`.** Cho chúng đi tìm địch là cả
hàng phòng thủ bỏ chốt chạy lên đầu tuyến, và đợt sau đi thẳng vào nhà qua một tuyến trống.

⚠ Nút chốt bám theo thế giới ⇒ phải đổi qua `StickmanUI.FromScreen`. `WorldToScreenPoint` trả pixel
THẬT còn khung GUI đã bị `StickmanUI` co giãn và đếm từ góc trên-trái — dùng thẳng thì desktop
trông đúng (scale 1) mà điện thoại thì mọi nút bay ra ngoài màn.
