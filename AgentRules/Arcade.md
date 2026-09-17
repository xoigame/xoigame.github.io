# MÀN ĂN LIỀN — một ngón tay, dưới một phút (2026-09-16)

Code: `Assets/Scripts/Gameplay/Arcade/`. Màn: `Demo_81_Launch` · `Demo_82_Stack` ·
`Demo_83_Timing` · `Demo_84_Run`. Bộ dựng: `StickmanArcadeBuilder`.

Tham khảo ngoài: khuôn hyper-casual 2026 — một cử chỉ, lượt 30–60 giây, hiểu trong 10 giây,
điểm cao làm đối thủ (xem mục 5).

## 1. Vì sao arcade có `ArcadeModeBase` riêng

`MatchModeBase` trả lời *"ai thắng ván này"* rồi giao cho `GameSession` lo màn hình kết quả và
bậc khó — đúng cho trận 5–10 phút, **sai** cho lượt 40 giây:

1. **CHƠI LẠI TỨC THÌ.** Vòng "một lần nữa thôi" chết ngay khi giữa hai lượt có một màn hình
   trung gian. Chạm một cái là lượt mới, **không nạp lại scene** (nạp scene mất cả giây).
2. **ĐIỂM CAO LÀ ĐỐI THỦ.** Không phe địch, không bậc khó. Điểm cất bằng **`SaveBag.Best`** —
   thứ đã có sẵn; KHÔNG thêm trường mới vào `PlayerProfile` (đó là bệnh CỘNG mà `SaveBag` sinh
   ra để chữa).
3. **TẮT GẦN HẾT CÁC HỆ** (`FeatureSet.Without`: chatter · garrison · thăm nhà · perk · hồi
   sinh · đuốc đêm). Mỗi hệ còn bật là một thứ có thể hỏng trong một màn chẳng dùng tới nó.

⚠ `SaveBag` **không tự ghi ra đĩa** — `EndRound` phải gọi `SaveIfDirty`, nếu không kỷ lục biến
mất khi tắt game và người chơi mất đúng thứ mà cả kiểu chơi xoay quanh.

⚠ Có **khoảng chết 0.6 giây** sau khi hết lượt: ngón tay đang bấm dở cú cuối vẫn còn trên màn
hình, không có khoảng chết thì lượt mới bắt đầu ngay trong cùng cú chạm.

## 2. `ArcadeTouch` — đọc `Input.touches` TRƯỚC, chuột sau

⚠⚠ Unity có giả lập chuột từ chạm, nhưng nó chỉ giả lập ngón ĐẦU TIÊN và **bỏ qua
`TouchPhase.Canceled`** (điện thoại gọi đến, kéo thanh thông báo). Ngón bị huỷ mà đọc bằng
chuột thì sự kiện THẢ không bao giờ tới — cú phóng treo lơ lửng mãi mãi.

⚠ KHÔNG dùng `StickmanTouchInput` (bộ nút ảo của game chính): arcade không có nút nào, cả thao
tác là "chạm ở đâu, kéo tới đâu, thả lúc nào". Bốn màn này cũng **không dựng HUD nút ảo** — có
nút thì ngón tay phải đi tìm nó và cái "ăn liền" mất ngay.

## 3. `ArcadeRagdoll` — ragdoll làm NỘI DUNG, không phải hậu quả

45 mode cũ đều dùng ragdoll làm hậu quả của một cú đánh. Ở đây nó là món chính.

⚠⚠ **NHÂN XUNG LỰC VỚI KHỐI LƯỢNG TỪNG KHỚP.** Cộng cùng một xung lực cho cả 20 khớp thì
Δv = xung ÷ khối lượng — bàn tay nhẹ vọt đi trước và cái thân **bị xé tại khớp**: người chơi
thấy một bó tay chân bay tán loạn chứ không thấy một người bị phóng.

⚠⚠ **ĐO QUÃNG ĐƯỜNG BẰNG `ArcadeRagdoll.Center`**, không bằng `transform.position`: bật ragdoll
xong thì 20 khớp đổi cha sang nhóm ragdoll và bay theo vật lý, còn transform gốc đứng nguyên —
đo bằng nó thì cú phóng nào cũng dài **0 mét**, và không lỗi nào báo.

⚠ Cửa hợp lệ để chuyển sang thân mềm là `TakeDamage` chí mạng. `EnableRagdoll` là `private` và
đúng ra phải vậy (nó còn tắt nhóm sprite, đổi cha 20 khớp, hãm khớp cho sân 3/4, gọi
`StickmanGroundCorpse`).

## 4. Bốn màn — luật riêng của từng màn

| Màn | Class | Khoá điểm cao |
|---|---|---|
| `Demo_81_Launch` | `RagdollLaunchMode` | `arcade.launch.best` |
| `Demo_82_Stack` | `RagdollStackMode` | `arcade.stack.best` |
| `Demo_83_Timing` | `TimingStrikeMode` | `arcade.timing.best` |
| `Demo_84_Run` | `EndlessRunMode` | `arcade.run.best` |

| Màn | Thao tác | Thắng/thua | Bẫy đã chặn |
|---|---|---|---|
| **Phóng người** | kéo ngược + thả | xa nhất | lực quy theo **cạnh ngắn màn hình**, không theo chiều ngang (điện thoại dọc vs máy tính ngang ra hai lực khác nhau) |
| **Xếp người** | chạm để thả | có người **rơi khỏi bệ** là hết | thua theo "tháp đổ" thì **không đo được** — một đống thân mềm luôn nhúc nhích, mọi ngưỡng độ nghiêng đều hoặc kêu oan hoặc không bao giờ kêu |
| **Chém đúng nhịp** | chạm đúng vùng vàng | 3 nhát là gục | xem mục 4b |
| **Chạy vô tận** | chạm để nhảy | va vật cản là hết | khoảng cách vật cản tính bằng **GIÂY** chạy, không phải mét |

### 4b. ⚠⚠ Độ khó phải khai THẲNG TRÊN CỬA SỔ BẤM

Bản đầu vặn RIÊNG tốc độ kim và RIÊNG bề rộng vùng vàng. Đo ra (Python):

| Đã hạ | Cửa sổ bấm |
|---:|---:|
| 0 | 416 ms |
| 6 | 125 ms |
| 9 | **43 ms** |
| 12 | **24 ms** |

Chỉ riêng độ trễ chạm của điện thoại đã 50–100 ms ⇒ từ đối thủ thứ 9 màn **bất khả thi**, không
phải khó. Nay cửa sổ là thứ khai thẳng (0.42 s → sàn **0.14 s**) còn bề rộng vùng vàng **tính
ngược** ra từ cửa sổ và tốc độ kim: kim nhanh gấp đôi thì vùng vàng tự rộng gấp đôi.

Cùng một lỗi ở màn chạy: khoảng cách cố định + tốc độ tăng dần ⇒ tới một lúc khoảng cách **ngắn
hơn một cú nhảy**. Tính bằng giây thì tốc độ tăng, khoảng cách tự giãn.

## 4c. TẦNG TIẾN TRÌNH — `ArcadeMeta` (2026-09-16)

Khuôn hyper-casual thuần giữ chân được vài ngày rồi hết: người chơi đã thấy hết thứ nó có.
Khuôn **hybrid-casual 2026** thêm đúng một tầng — vàng · nâng cấp · mốc — và đó là chỗ người
chơi có lý do quay lại.

| Tuyến | Mua gì | Giá |
|---|---|---|
| **LỰC PHÓNG** | +8% vận tốc rời bệ | 40, +35/cấp, tối đa 10 |
| **TRƠN** | −10% lực hãm (lăn lâu hơn) | 55, +45/cấp, tối đa 8 |
| **HÁM VÀNG** | +15% vàng mỗi lượt | 70, +60/cấp, tối đa 8 |

⚠⚠ **Ba tuyến phải kéo về ba hướng khác nhau.** Ba tuyến cùng cộng vào một chỗ (+5% lực ×3)
thì cửa hàng chỉ là cái nút "bấm để mạnh lên" — không ai phải chọn gì.

⚠ **Giá tăng dần** (`costStep`): giá phẳng thì người chơi mua sạch tuyến rẻ nhất trước rồi mới
nhìn tuyến khác, và "tiêu vào đâu" biến mất sau lượt thứ ba.

⚠ Cất trong `SaveBag` (`arcade.*`) — KHÔNG thêm trường vào `PlayerProfile`.

⚠⚠ **Cửa hàng đo cú bấm ở `Update`, KHÔNG ở `OnGUI`.** `OnGUI` chạy sau `Update`, nên cửa hàng
nuốt cú chạm lúc vẽ thì vòng "chạm để chơi lại" đã cướp mất trước — bấm mua một cái là vừa mất
tiền vừa bị quăng vào ván mới. `ArcadeShop.TickBuy` (logic) tách hẳn khỏi `ArcadeShop.Draw` (vẽ).

⚠ Nút vẽ bằng `GUI.Box` + tự đo chạm, KHÔNG `GUI.Button` (nút IMGUI điếc trên điện thoại), và
phải **lật trục Y** — `Input` đếm từ đáy, `Rect` đếm từ đỉnh.

### Vòng kinh tế đo được (mô phỏng 60 lượt, mua rẻ nhất trước)

| Lượt | Xa (m) | Vàng/lượt | Vừa mua |
|---:|---:|---:|---|
| 1 | 26.7 | 16 | — |
| 3 | 27.5 | 16 | LỰC Lv1 |
| 20 | 55.7 | 38 | — |
| 40 | 94.4 | 82 | LỰC Lv6 |
| 60 | 162.6 | 171 | LỰC Lv10 |

Mua lần đầu ở **lượt 3** (đủ sớm để dạy vòng chơi), không có quãng tắc, và sau 60 lượt vẫn còn
TRƠN 7/8 · HÁM VÀNG 5/8 chưa max — tức vẫn còn lý do chơi tiếp. Tầm bay 26.7 → 162.6 m (6×).

⚠⚠ Chính phép đo này buộc **kéo dài đường đua 240 → 400**: người chơi chăm nhất bay 178 m, và
một đường 240 nghĩa là phần thưởng của cả tầng tiến trình biến thành bức tường biên.

## 5. Số đo của bốn màn

| Màn | Số | Đo bằng |
|---|---|---|
| Phóng người | v = 26 u/s ⇒ tầm bay ~69 u (chưa kể nảy và chưa nâng cấp); đường dài **400 u** | ballistic, g = 9.81 |
| Chạy vô tận | 3.20 → 7.68 u/s (chạm trần ở 778 m); đường 4000 u = **9.5 phút** | mô phỏng Python |
| Chạy vô tận | khoảng cách vật cản 3.5 u (đầu) → 16.9 u (trần) | gap giây × tốc độ |
| Chém đúng nhịp | cửa sổ 420 ms → 140 ms, chạm sàn ở đối thủ thứ 10 | bảng ở mục 4b |

⚠ Sau đối thủ thứ ~10, cửa sổ và tốc độ kim đều chạm sàn ⇒ độ khó phẳng. Đó là chủ ý (arcade
đua điểm), nhưng ai muốn kéo dài đường cong thì thêm **trục thứ ba** (ví dụ hai vùng vàng),
đừng hạ sàn cửa sổ xuống dưới 0.12 s.
