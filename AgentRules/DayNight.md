### ⚠⚠ NGÀY / ĐÊM LÀ THIẾT LẬP CỦA TỪNG MAP, VÀ ĐÊM PHẢI ĐỔI ĐƯỢC QUYẾT ĐỊNH CỦA AI (2026-09-05)

`MapDefinition.dayNight` (`DayNightSettings`) · `MapAssembler.AttachDayNight` gắn đúng
`DayNightCycle` mà `Demo_22` dùng · `Core/WorldLighting` (sổ tĩnh: `NightAmount` ·
`VisionScale` · `Hour`) · `SkyBackdrop.SetTimeOfDay` (mặt trời/trăng chạy CUNG trái→phải,
trời ửng cam ở hai đầu pha) · `StickmanAgent.VisionRange`.

⚠⚠ **ĐỌC TẦM NHÌN QUA `agent.VisionRange`, KHÔNG đọc thẳng `Profile.visionRange`.** Chu kỳ
cũ chỉ đổi MÀU TRỜI và bật/tắt spawner — một cái đồng hồ trang trí: đêm không đổi một quyết
định nào của ai. Nay đêm sâu thu tầm nhìn về `nightVisionScale` (0.65), hệ số nhân LÚC ĐỌC
(khuôn `SpeedTuning`): 34 asset `AIProfile` không phải sửa, scene không có chu kỳ thì hệ số
là 1. Đã đổi 14 chỗ đọc (agent · `AIStates` · `AIStateInfiltrate` · `CommandNode` ·
`AIWatchModule`); chỗ đọc mới mà gõ `Profile.visionRange` là đêm không tồn tại với chỗ đó.
⚠ **Sinh tồn LUÔN có chu kỳ và giặc CHỈ ra ban đêm** (`MapBlueprint.Spec.dayNight` +
`StickmanMapSystemBuilder`); kiểu chơi khác bật thì spawner vẫn chạy cả ngày — đêm chỉ làm
trận khó đọc hơn, không đổi luật.
⚠ Asset map CŨ nhận `DayNightSettings` toàn số 0 (trường mới) → `DayLength`/`NightLength`/
`NightVision` là thuộc tính ĐÃ KẸP, đọc qua đó chứ đừng đọc field trần.
⚠ `DayNightCycle.Start` đặt `_isNight = _startAtNight` TRƯỚC `BeginPhase` — `BeginPhase`
đếm "vừa qua một đêm" bằng cách so pha cũ, đặt ngược là mở màn đã ở ngày 2 (dính ngay lần đầu).
⚠ `OnDisable` gọi `WorldLighting.Clear()` — đổi map giữa đêm mà không dọn là ván sau AI
vẫn nhìn gần trong khi trời sáng.
⚠ Phải **bấm lại «Hệ thống map»** (21 map mẫu nhận `dayNight`) — `MapDefinition.cs` +
`MapBlueprint.cs` đã nằm trong `extraSources` của job đó nên Bảng điều khiển tự VÀNG.

### ⚠⚠ MỖI VÁN MỘT KHUNG GIỜ — BỐC THEO HẠT, KHÔNG ĐỘNG VÀO LUẬT CHƠI (2026-09-08)

`Core/SkyPhase.cs` (`SkyPhase` 6 pha + bảng số `SkyPhases`) · `Combat/SkyBackdrop.Phase.cs`
(`RollSky` · `ApplyPhase` · `SetOvercast` · quầng chân trời) · `MapScenery.ApplyAtmosphere`
gọi · `GameRun.Mix` trộn hạt của ván.

⚠⚠ **BỆNH CŨ: 50 scene vĩnh viễn GIỮA TRƯA.** Nền trời vẽ đủ cả bình minh/hoàng hôn từ lâu,
nhưng `SkyBackdrop.DuskAmount` trả 0 khi KHÔNG có `DayNightCycle` — mà chu kỳ chỉ có ở vài
mode. Cộng thêm hạt núi/mây/thời tiết bốc từ TÊN MAP, nên một map là mãi mãi một dãy núi,
một cơn mưa, một khung giờ. Người dùng gọi đúng tên: *"nền game hơi xấu và không đa dạng"*.

⚠ **BA CON SỐ, MỘT NGUỒN.** Pha bốc ra chỉ ghi: `_nightAmount` (nền trời), `_rolledDusk`
(độ ửng), `WorldLighting.Set(night, 1f, hour)`. Nhờ số cuối, `NightGlow` · `CampFire` ·
lớp phủ đêm của công trình · sương theo giờ **tự hửng theo** — không có hệ ánh sáng thứ hai.
⚠ **`nightVisionScale = 1f` — CỐ Ý.** Đây là cú bốc NGẪU NHIÊN mỗi ván; cho nó thu tầm nhìn
AI là mỗi lần chơi lại bot khôn dại khác nhau và bench Phòng thí nghiệm AI mất mốc so.
Muốn đêm ĐỔI LUẬT thì dùng `DayNightCycle` (mục trên) — có chu kỳ thì `ApplyPhase` im lặng.
⚠ `_startAtNight` (sân zombie, bài thủ đêm) KHÔNG bị bốc về giữa trưa.
⚠ **Chỉ bốc lúc Play.** `MapScenery.Build` còn chạy khi BAKE map trong Editor; bốc ở đó là
mỗi lần bake một màu trời khác và diff scene đầy rác.
⚠ **Mật độ mây = số ÷ dải cuộn.** `span` phải giữ theo `_cloudCount` GỐC; nới span theo số
mây mới là mây dày lên mà trong khung hình vẫn đúng 3 đám (đã dính khi viết bản đầu).
⚠ Nhân màu cam lên trời XANH ra màu NÂU BÙN, không ra hoàng hôn — `DuskTint` phải nhạt, phần
cam để `UpdateHorizonGlow` (cộng sáng, bám chỗ mặt trời đứng) lo. Trăng/sao chỉ hiện khi
`NightAmount > 0.55`, không thì chạng vạng có cả mặt trời lẫn mặt trăng chồng nhau.
⚠ Địa hình VẪN theo hạt của map (`GameRun.Mix` chỉ dùng cho TRANG TRÍ) — map trong kho phải
giữ đúng hình dáng của nó. Map ngẫu nhiên mỗi ván là việc của `MapRandomPlay` (mặc định BẬT).
