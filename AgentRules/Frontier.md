## ⚠⚠ NGÀY MỞ BIÊN, ĐÊM THỦ TRẠI — KHI MÔ PHỎNG BÁC BỎ CẢ BẢN THIẾT KẾ (2026-09-16)

Code: `Assets/Scripts/Gameplay/Frontier/`. Màn: `Demo_89_Frontier`. Bộ dựng:
`StickmanFrontierBuilder`. Tham khảo ngoài: *Kingdom Two Crowns*.

### 1. Bản thiết kế đầu tiên — và phép đo giết nó

Bản đầu: ban ngày tiêu vàng để **mở chốt xa hơn** (lãnh thổ = thu nhập) hoặc **củng cố chốt
trong**. Nghe như hai đường chơi. Mô phỏng 8 bộ số × 3 chiến lược:

| máu chốt | sát thương quái | tốc bắn | mở rộng | co lại | trộn |
|---:|---:|---:|---:|---:|---:|
| 500 | 4 | 0.30 | 6.0 | 6.0 | 6.0 |
| 500 | 6 | 0.45 | 4.0 | 4.0 | 4.0 |
| 700 | 4 | 0.45 | 8.0 | 8.0 | 8.0 |
| 700 | 6 | 0.30 | 5.0 | 5.0 | 5.0 |

**Chênh lệch đúng `0.0` đêm ở MỌI bộ số.** Ba cách chơi khác hẳn nhau về ý định mà ra cùng một
kết cục ⇒ *"mở rộng hay củng cố"* **không phải một quyết định**, chỉ là hai cách tiêu cùng một số
vàng.

> ⚠⚠ **Khi cả ba đường đều đo ra một con số, thứ thiếu là một CHIỀU — không phải một hệ số.**
> Vặn thêm hằng số nữa chỉ dời cả ba cột lên xuống cùng nhau. Đây là lần đầu trong dự án một
> phép đo bác bỏ **bản thiết kế** chứ không phải bản cân bằng.

⚠ Và bản mô phỏng ĐẦU TIÊN còn sai thô hơn: nó không cho ai bắn trả, nên 3 con quái gây 675 sát
thương lên một bức tường 260 máu và mọi chiến lược chết ở đêm 1. Phát hiện đó cũng là một luật
thiết kế: **tường không tự giữ được, phải có cung thủ đứng trên nó** — nếu không, "xây tường" chỉ
là mua thêm vài giây.

### 2. Chiều còn thiếu: SỰ CÓ MẶT CỦA NGƯỜI CHƠI

Trong bản gốc của thể loại, thứ khan hiếm **không phải vàng mà là BAN NGÀY**: muốn dựng một chốt
thì phải ĐỨNG Ở ĐÓ, mà ngày chỉ dài 34 giây và vòng ngoài cách trại 48 đơn vị.

Nên ở đây **mọi thứ mua được đều đòi người chơi đứng trong `ReachRadius` (3.2 đơn vị)**. Mở biên
tiêu **cả vàng lẫn ánh sáng**, và không ai có mặt ở cả hai bên cùng lúc — đó mới là quyết định.

⚠ Quãng đường 48 đơn vị là **cơ chế, không phải cỡ sân**. Rút ngắn nó là quay về bản đã bị phép
đo bác bỏ.

⚠ **Bản này phải CHƠI THỬ mới chấm được.** Mô phỏng vô hướng không tả được quãng đường, nên số ở
đây không có bảo chứng nào ngoài lý lẽ — khác hẳn `MergeArmy` (hệ số 2.6 đo ra được).

### 3. Ba thứ dùng lại nguyên vẹn

| Dùng lại | Vì sao khớp |
|---|---|
| `AIBehavior.March` (làm cho thủ tuyến) | quái đi tới trại, **phá cái chắn**, không đuổi người chơi |
| `Fortification` | kế thừa `DestructibleTarget : StickmanController` ⇒ bộ dò vật chắn của `March` **thấy tường mà không phải sửa gì** |
| `DayNightCycle.PhaseChanged` | nhịp ngày/đêm + đổi màu camera đã có sẵn |

Seam làm cho game #4 trả tiền cho game #5 — đúng nghĩa phép NHÂN.

### 4. Bốn cái bẫy đã chặn

⚠⚠ **DỰNG SẴN RỒI TẮT, KHÔNG DỰNG LÚC CHẠY.** `StickmanFortBuilder.CreateWall` là **Editor-only**
và nó lo cả art, skin, bề dày theo tỉ lệ ảnh, chỗ đứng cho lính. Viết một đường dựng tường thứ hai
cho runtime là chép lại nửa `CreateSolidFort`, rồi hai bản lệch dần — bản Editor sửa mà bản
runtime thì không, và không có gì báo.

⚠⚠ **KHÔNG khai `nightSpawners` cho `DayNightCycle`.** Quái do mode sinh, vì nó phải biết **đêm
thứ mấy** và phải gán `March` + đích là cái trại. Để `DayNightCycle` cũng đẻ quân là **hai nguồn
quái trên cùng một sân**, và con số trên HUD nói dối ngay đêm đầu.

⚠ **Huỷ đăng ký `PhaseChanged` trong `OnDestroy`.** `DayNightCycle` sống qua scene; để lại là một
người nghe đã chết.

⚠ **Cung thủ khai `GuardTarget` neo vào chốt**, không `HuntTarget` — cùng luật với lính thủ của
`LaneDefenseMode`: cho chúng đi tìm địch là cả hàng phòng thủ bỏ chốt, và đêm sau quái đi thẳng
vào trại qua một tuyến trống.

### 5. Bảng số hiện tại (chưa có bảo chứng đo)

| Thứ | Số |
|---|---|
| Ngày / đêm | 34 s / 22 s — ngày dài hơn vì ban ngày là lúc phải ĐI |
| Vòng chốt | 12 · 24 · 36 · 48 đơn vị, hai bên |
| Giá chốt | `55 + 45 × vòng` |
| Giá cung thủ | `40 + 20 × đã có` (tối đa 4) |
| Thu mỗi sáng | `26 + 13 × (vòng+1)` mỗi chốt còn đứng |
| Quái mỗi đêm | `2 + đêm` mỗi bên, máu `×(1 + 0.18×(đêm−1))` |
| Thắng | giữ trại qua 8 đêm |
