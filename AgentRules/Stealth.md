# TRỐN TRẠI — giác quan AI thành LUẬT CHƠI (2026-09-16)

Code: `Assets/Scripts/Gameplay/Modes/StealthEscapeMode.cs` · `StealthTakedown.cs`.
Màn: `Demo_78_StealthEscape`. Bộ dựng: `StickmanStealthEscapeBuilder`.

## 1. Không viết giác quan mới — dự án đã có đủ

| Thứ | Ở đâu | Đã có từ |
|---|---|---|
| NÓN TẦM NHÌN (`visionHalfAngle` · `visionBackRange` · `useVisionCone`) | `StickmanAgent.CanSee` + `AIProfile` | trước |
| TAI | `NoiseField` + `AIHearingModule` (`AIModuleKind.Hearing`) | trước |
| DÁNG CẢNH GIỚI + nhịp đảo hướng | `AIWatchModule` (`AIModuleKind.Watch`) | trước |
| TUẦN TRA | `AIStatePatrolRoute` + `agent.SetPatrolRoute` | trước |
| HỒ SƠ LÍNH GÁC | `StickmanStealthBuilder.EnsureGuardProfile()` → `AIProfile_TowerGuard` | trước |
| ẨN THÂN (ninja đứng im) | `StickmanStealth` | trước |

⚠ **Đừng đẻ hồ sơ lính gác thứ hai.** Một nghề thì một hồ sơ; `Demo_33_Infiltration` (ninja đi
ám sát) và `Demo_78` (đi qua trại) dùng CHUNG `EnsureGuardProfile()`.

⚠⚠ `useVisionCone` mặc định **false** — tức `CanSee` trả true 360°. Màn lén lút mà quên gán hồ
sơ có nón nhìn thì lính thấy xuyên gáy, và **không lỗi nào báo**.

⚠⚠ **KHÔNG gắn playbook vào scene lén lút.** `AIPlaybook.ApplyTo` phát lại `AIProfile` theo VAI
TRÒ ở `Start` và đè mất hồ sơ lính gác — cùng cái bẫy đã ghi trong `AIWatchModule`.

## 2. Thứ DUY NHẤT phải thêm: THANH NGHI NGỜ

Ba vế, thiếu cái nào cũng hỏng câm:

1. **Nghi ngờ có ĐỘ TRỄ** (`_spotSeconds` 1.3 s). Thấy một frame mà hú còi ngay thì nón tầm
   nhìn chỉ còn là một cái công tắc, và người chơi không có khoảng nào để rút — đó là chỗ duy
   nhất kỹ năng thể hiện được.
2. **NGUỘI DẦN, không reset** (`_coolPerSecond`). Reset thẳng về 0 là thò ra thụt vào liên tục
   vẫn an toàn tuyệt đối.
3. **Có CỬA RA**, thắng bằng chạm đích. Một màn lén lút tính giờ thì cách chơi tối ưu là nằm
   im trong bụi cỏ tới hết ván.

⚠ Nghi ngờ dâng theo **người nhìn rõ nhất**, KHÔNG cộng dồn mọi con mắt: cộng dồn thì mọi khu
đông lính thành cấm địa tuyệt đối và chỉ còn đúng một đường đi vòng.

⚠ Thanh chỉ hiện khi CÓ người đang nhìn — bản thân việc nó hiện ra đã là tin tức. Vẽ thường
trực thì nó là một thanh trang trí.

## 3. Hạ gục từ sau lưng là một CƠ CHẾ, không phải phần thưởng sát thương

Màn lén lút mà "ba nhát mới chết" thì mọi cú tiếp cận đều kết thúc bằng tiếng kêu; người chơi
học được rằng đừng chạm vào ai, và nửa bản đồ có lính gác thành một bức tường.

⚠ `StealthTakedown` cắm vào `StickmanController.DealtHit` — mọi vũ khí đi qua đúng sự kiện đó,
nên cơ chế hợp lệ ở cả bốn thể loại mà không phải kê danh sách vũ khí.

⚠ Hỏi **chính `agent.CanSee`** của nạn nhân, đừng tự tính lại góc: tự tính là hai định nghĩa
"sau lưng" trong một dự án, và chúng sẽ lệch nhau.

⚠ Đánh **từ trước mặt thì không có gì đặc biệt** — thiếu vế này thì cơ chế thành "bấm đánh để
thắng" và cái nón tầm nhìn hết nghĩa.

## 4. Báo động phải có ĐƯỜNG TRẢ LẠI

⚠⚠ Lộ xong mà lính đuổi mãi thì một lần lộ = thua, dù luật ghi được lộ ba lần. `_chaseSeconds`
hết là trả lính về `AIBehavior.PatrolRoute` — cùng khuôn «việc riêng của mode phải có đường
trả lại» của `ZoneGarrisonDuty`.

⚠ Tiếng hô đi qua `NoiseField.Report`, không chỉ gán mục tiêu cho người trong bán kính: lính
có tai ở xa cũng phải quay đầu, và đó là hệ đã có.

## 5. Bộ dựng màn

⚠ **Tuyến tuần phải CHỒNG LẤN.** Mỗi lính một khúc riêng thì bài toán rút gọn thành "đợi nó
quay lưng rồi chạy", lặp lại n lần. Chồng lấn làm khe an toàn DI CHUYỂN.

⚠ Người chơi **tay không**: cầm cung thì cách chơi tối ưu là bắn tỉa từ xa và cả hệ nón tầm
nhìn không còn đất dùng.

⚠ Cửa ra phải **nhìn thấy từ đầu map** — đích vô hình biến màn lén lút thành màn đi lạc.
