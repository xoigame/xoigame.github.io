## ÔNG TƯỚNG PHẢI BIẾT LUẬT THẮNG CỦA MÀN — `CampaignOrders` + `DecideCampaign`

`Assets/Scripts/Gameplay/Camp/CampaignOrders.cs` · `MatchModeBase.DecideCampaign` · soi bằng
`Tools > Stickman > Nâng cao > Rig & Kiểm tra > Soi TẤT CẢ màn chơi`.

⚠⚠ **`CommandDoctrine` CHỈ HỎI ĐÚNG MỘT CÂU: "quân mình so với quân địch mạnh yếu thế nào"**
(`PowerRatio`). Câu đó đúng cho một trận dàn quân và SAI ở gần như mọi kiểu chơi khác — nó
không biết đồng hồ sắp hết, không biết điểm đang thua, không biết cái tuyến đang bị đẩy về
sân nhà. Hậu quả nhìn ra được nhưng **không có lỗi nào báo**:

| Màn | Học thuyết làm gì | Nghĩa thật |
|---|---|---|
| Đua điểm (`CaptureScoreMode`) | yếu hơn một chút → lùi giữ tuyến nhà | **ngồi chờ thua**: điểm địch vẫn nhảy |
| Kéo co (`TugOfWarLine`) | bị đẩy lùi → lùi thêm | vòng xoáy tự sát; và ở thế thủ `ComputeLineAnchor` lấy CĂN CỨ làm mốc ⇒ cả phe bỏ hẳn cái tuyến |
| Công thành (`CastleAssault`) | tổn thất nặng → giữ tuyến | bên công **không có gì để giữ**, đứng ngoài = thua chậm hơn |
| Đua kinh tế (`EconomyRaceMode`) | không thấy gì bất thường | địch nâng trại đủ cấp rồi thắng, không cần đánh trận nào |

**Cách chữa:** mode tự trả lời `DecideCampaign(teamId, out reason)` → `Press` / `Hold` /
`Fallback` / `Auto`, còn `CampaignOrders` lo phần phát lệnh. Không đẻ cơ chế mới: nó gọi
đúng API mà nút HUD của người chơi vẫn dùng (`Issue` · `CommandHold` · `CommandAuto`), tức
vẫn là "chỉ huy DỜI CỘT MỐC", không đụng vào từng lính.

⚠ **Cơ chế nằm ở tầng GAMEPLAY, không phải ở Map.** Nó vốn chỉ có trong `MapMissionAI` (tầng
Map), mà gần hai chục scene chế độ chơi dựng tay lại nằm THẤP HƠN nên không với tới được —
đó là lý do hệ map thì tướng biết đi tranh điểm còn `Demo_13` thì không. Nay `MapMissionAI`
dùng chung lớp này; phần riêng của nó chỉ còn BẢNG LUẬT "map kiểu này thì thế nào là đang thua".

⚠ **PHẢI CÓ QUÁN TÍNH** (`minHold` 6s). Đây là luật ĐỌC tình hình rồi ĐỔI tình hình (đổi lệnh
→ quân dời chỗ → tình hình đổi) — đúng khuôn §5c, không có quán tính là cả phe tiến-lùi mỗi
nhịp chấm.

⚠⚠ **NGƯỜI RA LỆNH THÌ MÁY IM — hai cửa, thiếu cửa nào cũng thành "bấm nút không ăn".**
Giương **CỜ THEO TÔI** (`RallyBanner.PointFor(team) != null`) thì nhường tuyệt đối; bấm nút
trên bảng chỉ huy thì nhận ra bằng cách so THẾ TRẬN với cái lệnh của ta để lại
(`HumanTookTheWheel`).
⚠ Vế thứ hai phải **NHƯỜNG MỘT NHỊP RỒI QUÊN**, đừng khoá vĩnh viễn: thế trận còn đổi vì lý
do khác (tổ vỡ trận, tung quân dự bị, cấp dưới tự hạ thế theo học thuyết), mà khoá cứng thì
chỉ cần MỘT lần như vậy là cả tầng chiến dịch tắt ngóm suốt trận — im lặng tuyệt đối.

⚠ **`Auto` ở nhịp ĐẦU TIÊN là KHÔNG PHÁT GÌ CẢ.** `Auto` vốn đã là trạng thái mặc định, còn
`CommandAuto()` thì HUỶ lệnh tay — phát nó ở nhịp đầu là cướp mất lệnh người chơi vừa bấm.

⚠⚠⚠ **TẦNG CHIẾN DỊCH TỪNG BỎ CUỘC VĨNH VIỄN SAU ĐÚNG MỘT LẦN THẾ TRẬN TRÔI**
(`CampaignOrders`, 2026-09-04 — *"AI tụ tập chỗ bức tường mà không tấn công"*).
Nó nhớ lệnh đã phát trong `_applied` và có chốt *"đã ra lệnh này rồi thì thôi"*. Nhánh nhường
tay lái (`HumanTookTheWheel`) chỉ xoá `_expected` mà **quên xoá `_applied`** — nên nhịp sau nó
thấy *"đã Press rồi"* và **không bao giờ ra lệnh lại**.
Mà thế trận của chủ tướng trôi được vì cả tá lý do KHÔNG PHẢI người chơi: một tổ vỡ trận, tung
quân dự bị, chớm tập kết, hoặc học thuyết tự hạ thế theo cán cân. Chỉ cần MỘT lần như vậy là
phe đó rơi về "đánh theo cán cân" — mà đánh vào một cái làng có tường · cổng · tháp thì cán cân
luôn nghiêng về làng ⇒ thế `Hold` ⇒ **cả toán đứng tụ ở tuyến của mình tới hết trận**. Không
lỗi nào báo: mọi hàm vẫn chạy, chỉ là cái vô lăng đã bị buông.
⚠ Ý đồ vốn ghi rõ là *"nhường MỘT NHỊP rồi QUÊN"* — vế QUÊN nằm ở chỗ này, và nó thiếu. **Cờ
nhớ "đã làm rồi" mà đặt cạnh một nhánh thoát sớm thì phải hỏi: nhánh ấy có xoá cờ không?**

⚠ **`DecideCampaign` chỉ chạy khi mode gọi `TickOrders()` trong `Update` của nó.** Quên gọi
là hàm không bao giờ được hỏi và ông tướng vẫn đo quân số như cũ. `MatchModeBase` réo một
dòng warning sau 4 giây nếu mode khai `DecideCampaign` mà không ai chấm — đừng bỏ qua nó.

⚠ **"KHÔNG CAN THIỆP" CŨNG PHẢI KHAI RA.** `SkirmishMode` override `DecideCampaign` để trả
`Auto` kèm lý do *"diệt sạch phe kia — cán cân lực lượng là câu hỏi đúng"*. Im lặng dùng mặc
định thì tool soi màn chơi réo nhầm, mà một bảng cảnh báo réo nhầm vài chỗ là lần sau người
ta bỏ qua cả bảng.

⚠ **ĐỪNG ra lệnh suốt trận cho màn có NHỊP RIÊNG.** `Doctrine_WarCamp` có nhịp xuất quân
(§4c) mà lệnh tay thì TẮT chế độ tự động và xoá luôn cái nhịp đó — nên `EconomyRaceMode` chỉ
giành tay lái đúng lúc địch sắp thắng bằng cấp trại, còn lại trả về `Auto`.

**SOI CẢ BỘ BẰNG MỘT NÚT** (`StickmanModeAudit`): đọc THẲNG file scene trên đĩa (không mở
scene nào) rồi đối chiếu với định nghĩa thật của mode trong assembly, in ra bảng
*scene · trọng tài · thế trận · tầng game · bộ AI* và réo hai thứ: **màn có AI đánh nhau mà
không có trọng tài** (trận trôi mãi) và **màn có `TeamCommander` mà mode không khai
`DecideCampaign`**.
⚠ Nó CỐ Ý không réo "thiếu bộ AI": nhiều màn tự gán profile riêng cho từng vai (đột nhập,
thuỷ chiến, đấu boss) và ở đó playbook là thừa — cột trên bảng đã nói đủ.

