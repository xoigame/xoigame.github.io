## ⚠⚠ PHỐ MỞ — THẾ GIỚI MỞ KIỂU GTA, 2D (`MissionType.OpenWorldCity` = 20, 2026-09-09)

Một **thành phố nối vòng** chia bốn quận, ba tầng (mái · lòng đường · cống ngầm). Người chơi đi
đâu cũng được: cướp xe, nhận việc thuê, gây chuyện rồi bị truy nã, mua vũ khí, ngủ lấy điểm lưu.
Bộ đo là `MapOpenWorld` (10 file phần trong `Assets/Scripts/Map/`).

**HAI SÂN, MỘT BỘ MÁY** — `Demo_70_CityOpenWorld` (hiện đại) và `Demo_71_TownOpenWorld`
(trung cổ). Xem mục 1b.

### 1. ĐIỂM KHÁC BIỆT LỚN NHẤT: KHÔNG CÓ TRỌNG TÀI

Hai mươi kiểu chơi kia đều trả lời câu *"ai thắng"*. Kiểu này **cố ý không trả lời**:
`MatchRules.DefaultFor(OpenWorldCity)` trả về danh sách **RỖNG**, nên `MatchDirector` không bao
giờ tuyên bố kết thúc.

Hệ quả bắt buộc phải giữ — mọi thứ đo bằng "một ván" đều TẮT:

| Thứ phải tắt | Tắt ở đâu | Bật lên thì sao |
|---|---|---|
| Vế thắng | `MatchRules.DefaultFor` → `break;` | Ván sandbox tự kết thúc sau vài phút |
| Đường cong độ khó | `MapAssembler.BuildOpenWorld` → `escalation.enabled = false` | Viện binh đổ vào một thành phố |
| Quân mở màn phe địch | `enemyOpeningScale = 0f` | Giây đầu tiên đã có tiểu đội cầm súng chạy tới |
| Đồng hồ trận | `timeLimit = 0` trong công thức + blueprint | Bảng mục tiêu hiện một cái đếm ngược nói dối |
| Tướng (`TeamCommander`) | `MapOpenWorld.SilenceCommanders` | Cây chỉ huy ghi đè lệnh của dân và cảnh sát mỗi nhịp |

⚠ **Đừng "chữa" cái trống bằng cách thêm `Wipe(teamA)`.** Phe địch của thành phố là CẢNH SÁT, mà
cảnh sát sinh ra theo sao truy nã — bắn hết tốp đầu là sân sạch bóng địch và ván tự tuyên bố
THẮNG ở giây thứ 90. Không lỗi nào báo, chỉ là hết game.

Thứ thay chỗ trọng tài là **ba cái đồng hồ ngắn chạy song song**, và cả ba do người chơi bấm nút:
sao truy nã (áp lực bây giờ) · việc đang làm (mục tiêu năm phút tới) · tiền + ngày (tiến trình
dài, lưu ra đĩa).

### 1b. HAI THỜI KỲ — cùng bộ máy, khác LỚP DA (`CityEra`)

⚠⚠ **KHÔNG đẻ `MissionType.OpenWorldTown` riêng.** «Phố mở trung cổ» và «phố mở hiện đại» có
cùng một bộ máy: bốn quận, sao truy nã, cướp phương tiện, việc thuê, cửa hàng, tiền, điểm lưu.
Đẻ kiểu chơi thứ hai là chép lại 3 300 dòng để đổi mấy chuỗi và hai `VehicleKind` — rồi mỗi lần
sửa một luật (nhiệt · streaming · thứ tự ô hỏi) phải nhớ sửa hai chỗ. Đây đúng là luật «một
nguồn sự thật», và là cách battle royale đã chạy cho ba thể loại trên MỘT kiểu nhiệm vụ.

| Thứ | Hiện đại | Trung cổ |
|---|---|---|
| Quận | KHU Ổ CHUỘT · BẾN CẢNG · TRUNG TÂM · KHU CÔNG NGHIỆP | XÓM BẦN · BẾN SÔNG · QUẢNG TRƯỜNG · PHỐ THỢ RÈN |
| Phương tiện | ô tô (`Jeep`) · xe tải (`Truck`) | **xe ngựa** (`Wagon`) |
| Giữ trật tự | CẢNH SÁT · ĐẶC NHIỆM | LÍNH TUẦN · KỴ BINH |
| 🔫 → ⚒ | TIỆM SÚNG | LÒ RÈN |
| 🎨 → ✝ | GARA SƠN XE | **NHÀ THỜ** (mua ơn xá) |
| ✚ → 🌿 | BỆNH VIỆN | NHÀ THẦY LANG |
| 🏠 → 🛏 | NHÀ AN TOÀN | NHÀ TRỌ |
| ☕ → 🍺 | QUÁN ĂN | QUÁN RƯỢU |
| Báo động | `City/Siren` · `City/SirenSwat` (còi hai bậc) | `City/Alarm` (chuông ba tiếng) · `City/AlarmHorn` (tù và) |
| Bộ chi tiết nhà | `PartEra.Modern` | `PartEra.Medieval` |
| Vai nhà | cao ốc · kho · xưởng | đại sảnh · đền · kho · chuồng ngựa · lò rèn |

⚠⚠ **BẢNG `CityDistricts` LÀ NƠI DUY NHẤT ĐỔI CHỮ.** Rắc `if (era == Medieval)` vào tám file
phần của `MapOpenWorld` là tám chỗ phải nhớ mỗi lần thêm một thời kỳ.

⚠ **Giữ đúng CƠ CHẾ rồi mới chọn cái tên.** `Garage` ở trung cổ là **NHÀ THỜ** chứ không phải
"chuồng ngựa": việc của nó là XOÁ LỆNH TRUY NÃ, và thứ làm được điều đó trong một thị trấn là
mua ơn xá / xin lánh nạn. Chọn ngược lại thì người chơi dắt ngựa vào chuồng và không hiểu vì
sao hết bị truy nã.

⚠ Xe áp giải trung cổ phải là `Wagon`, và điều kiện thật là **CÓ GHẾ HÀNH KHÁCH**
(`_passengerSeats`) — `Jeep` không có, nên `Embark` trả false và cái xe chạy tới nơi RỖNG.
Đó là lý do bảng ở trên nói "xe ngựa", không nói "ngựa".

⚠ **Fantasy và Võ lâm hiện MƯỢN bộ trung cổ** (`CityDistricts.EraOf`). Đó là quyết định TẠM,
không phải "fantasy là trung cổ". Tách ra = thêm một giá trị `CityEra` + một cột trong các bảng
tra của `CityDistricts`, KHÔNG đụng `MapOpenWorld.*`.

⚠ `randomCivilizations` TẮT ở cả hai bản — kể cả trung cổ. Nó khoác nón/giáp/skin của một nền
lên MỌI người ra sân, nên dân đi chợ, thợ rèn và lính tuần đều thành lính Viking mặc giáp.
Bản sắc của map này là QUẬN, không phải nền văn minh.

### 2. BỐN QUẬN — bảng số ở `CityDistricts.cs`

Thành phố chia bốn cung bằng nhau theo trục x, thứ tự theo enum:

Số ở bảng này DÙNG CHUNG cho cả hai thời kỳ — chỉ cái TÊN đổi (xem mục 1b).

| Quận | Nhà | Dân · xe | Lính tới | Tiền việc | Cửa hàng |
|---|---|---:|---:|---:|---|
| **Ổ chuột** | 1–2 tầng, hẻm hẹp | 7 · 2 | ×1.7 (chậm) | ×0.75 | Nhà an toàn · Quán ăn |
| **Bến cảng** | kho bè, 1–3 tầng | 3 · 4 | ×1.25 | ×1.1 | Gara · Quán ăn |
| **Trung tâm** | cao ốc 4–6 tầng | 10 · 5 | ×0.7 (nhanh) | ×1.5 | Bệnh viện · Quán ăn |
| **Công nghiệp** | xưởng 2–4 tầng | 4 · 3 | ×1.35 | ×1.2 | Tiệm súng · Gara |

⚠ **Địa lý là thứ sinh ra quyết định.** Một thành phố rải đều là một hành lang dài: đi 200 bước
thì thấy đúng thứ đã thấy ở bước thứ 10, và không có lý do nào để đi đâu cả. Cái làm thế giới
mở đáng đi là **chỗ này có thứ chỗ kia không có** — súng chỉ bán ở khu công nghiệp, việc trả cao
chỉ có ở trung tâm (nơi cảnh sát cũng tới nhanh nhất), chỗ trốn tốt nhất nằm ở khu ổ chuột.

⚠ **Chỉnh số quận thì chỉnh ở `CityDistricts.Table`, đừng rắc hằng số vào `MapOpenWorld.*`.**

### 3. SAO TRUY NÃ — cái được cộng là NHIỆT, không phải sao

`MapOpenWorld.Wanted.cs`. Sao chỉ là cách đọc `_heat` (`StarsFor`). Vì sao không cộng thẳng sao:
"đấm một người = +1 sao" thì ba cú đấm vặt bằng một vụ giết cảnh sát.

| Tội (`CityCrime`) | Nhiệt |
|---|---:|
| Hành hung (`Assault`) | 9 |
| Trấn lột (`Robbery`) | 11 |
| **Cướp tiệm** | 11 ×3 (qua thẳng 3 sao) |
| Cướp xe (`Carjack`) | 14 |
| Phá hoại (`Vandalism`) | 16 |
| Giết người (`Killing`) | 26 |
| Giết cảnh sát (`KillCop`) | 45 |

Ngưỡng sao: `0 · 12 · 32 · 62 · 105 · 165`. Tội ở chỗ đông người nặng hơn (×1 → ×2.2 theo số dân
trong bán kính 10).

**Hai đồng hồ ngược nhau:**
- **Bị thấy** (`AnyCopSees`) → nhiệt KHÔNG nguội; ở 4–5 sao còn tăng nhẹ. Đứng bắn nhau tới cùng
  không bao giờ là lời giải.
- **Mất dấu** → nguội `4.2 / (1 + sao × 0.55)` mỗi giây.

⚠⚠ Phép đo "có bị thấy không" đi qua **`BuildingInterior.Hidden`** — chính hệ nhà của bộ khung,
không phải một phép đo thứ hai. Đây là **cả lý do map phố mở BẮT BUỘC ba tầng**: mái nhà, trong
nhà và cống ngầm là ba chỗ cắt được tầm nhìn cảnh sát. Map một tầng thì lên 3 sao là không còn
đường nào ngoài đánh nhau tới chết — và đó không phải GTA.

**Đường thoát thứ ba: GARA SƠN XE** — lái xe vào, trả $120, xoá sạch nhiệt. Tốn tiền và phải còn
một chiếc xe, nên nó là một quyết định chứ không phải một cái nút.

⚠ **Trần cảnh sát `MaxCops = 14`.** Thiếu nó thì ở 5 sao mỗi nhịp điều thêm một tốp, hai phút sau
sân có 200 `StickmanAgent` — máy đứng hình, và không lỗi nào báo vì "đúng luật, 5 sao thì phải đông".

⚠ Cảnh sát **không dày máu hơn theo sao**. Cái leo thang là SỐ LƯỢNG và VŨ KHÍ (`UnitRole.Melee`
→ `Ranged` từ 3 sao) — đúng luật `GameDifficulty` *"đừng cộng/trừ máu ẩn cho riêng ai"*.

⚠ Người chơi hồi sinh là một object KHÁC ⇒ `RebindWantedToPlayer` phải trỏ lại mốc cho mọi cảnh
sát đang truy đuổi. Thiếu vế này thì sau lần chết đầu tiên cả tốp đứng nhìn về phía một cái xác.

**XE CẢNH SÁT từ 3 SAO.** Đây là bậc cuộc rượt đuổi đổi CHẤT: đi bộ thì cướp một chiếc xe là
thoát, nên phải có thứ đuổi kịp một chiếc xe. Xe là `VehicleKind.Truck` phe cảnh sát, `aiCrew`
BẬT, chở 2 người.

⚠ KHÔNG viết bộ não riêng cho nó: `Vehicle.DriveCrew` đã biết bò về phía **địch gần nhất trên
cả bản đồ** (`CruiseToFront`) rồi **ĐỔ QUÂN** khi tới tầm — mà "địch gần nhất" của phe cảnh sát
chính là người chơi. Cả cuộc rượt đuổi bằng xe là một lời gọi `VehicleCatalog.Spawn` + hai lần
`Embark`.
⚠ Phải là `Truck` chứ không `Jeep`: chỉ xe tải mới có `_passengerSeats`. Không ghế thì `Embark`
trả false và cái xe chạy tới nơi **RỖNG** — nhìn ra là một chiếc xe vô hại lượn quanh.

**ĐÊM THÌ KHÓ BỊ THẤY HƠN** — `CopSightNow` co tầm nhìn còn 55% theo `WorldLighting.NightAmount`.
Trước vế này, ngày/đêm của map chỉ đổi MÀU, không đổi một quyết định nào; nay nó là câu hỏi
*"làm vụ này bây giờ, hay đợi tối?"*. Hỏi `WorldLighting` chứ không hỏi `DayNightCycle` vì đó là
nguồn mà hệ đèn (`NightGlow`) đọc — "tối" theo mắt và "tối" theo luật phải là MỘT.

### 3b. TỘI PHẠM PHẢI CÓ LÃI (`MapOpenWorld.Crime.cs`)

⚠⚠ Bản đầu có đủ hệ để GÂY TỘI và đủ hệ để BỊ PHẠT, nhưng **không đồng nào chảy vào ví từ phía
tội phạm** — tiền chỉ đến từ việc thuê. Hệ quả: sao truy nã là một cái giá THUẦN, và lời giải
tối ưu của cả kiểu chơi là *"đừng bao giờ phạm tội"*, tức cảnh sát · gara · nhà an toàn thành
đồ trang trí. Hai đường tiền dưới đây sửa đúng chỗ đó, và cả hai đều CÓ GIÁ (nhiệt):

| Đường tiền | Cách | Tiền | Nhiệt |
|---|---|---:|---:|
| **Trấn lột** | [F] cạnh người đi đường | 12–34 × payScale | 11 |
| **Tiền rơi từ dân** | người chơi hạ một người dân | 15–40 | 26 (giết người) |
| **Tiền rơi từ cảnh sát** | người chơi hạ một cảnh sát | 45–90 | 45 (nặng nhất bảng) |

Món lãi nhất cũng là món đắt nhất — đó là cái đánh đổi một thế giới mở cần.

⚠ Trấn lột **mỗi người một lần** (`Ped.robbed`). Thiếu cờ đó thì đứng bấm [F] liên tục là máy
in tiền và cả hệ kinh tế vô nghĩa trong mười giây.
⚠ Tiền chỉ rơi khi **CHÍNH NGƯỜI CHƠI** ra tay (`IsPlayerSource`). Dân bị xe tông hay bị cảnh
sát bắn nhầm mà cũng rơi tiền thì cách kiếm tiền tốt nhất là **đứng nhìn**.
⚠ `CityCash` là TRIGGER và **tự tan sau 45 giây**: thế giới mở chạy hàng giờ, mỗi người ngã để
lại một object sống mãi thì sau 40 phút là vài trăm xấp tiền nằm rải rác.

**CƯỚP TIỆM  [Y]** — món tiền LỚN nhất, cái giá cũng lớn nhất.

| Tiệm | Két (× payScale × 0.8–1.25) |
|---|---:|
| 🔫 Tiệm súng | 380 |
| ✚ Bệnh viện | 260 |
| 🎨 Gara | 220 |
| ☕ Quán ăn | 140 |
| 🏠 Nhà an toàn | **không cướp được** — đó là nhà mình, và là điểm lưu duy nhất |

Phải **đang cầm vũ khí** (nắm đấm không doạ được ai). Trả bằng **3 sao ngay lập tức** (qua
thẳng bậc có xe cảnh sát) và **tiệm đóng cửa 90 giây**.

⚠ Vì sao đáng có: trấn lột và tiền rơi đều là món LẺ. Không có món lớn thì con đường tội phạm
chỉ là *"làm việc thuê, chậm hơn"* — không phải một lựa chọn khác, chỉ là một lựa chọn tệ hơn.
⚠ Tiệm PHẢI đóng cửa sau khi bị cướp. Thiếu vế đó thì đứng tại chỗ bấm [Y] liên tục là máy in
tiền — đúng lỗi mà `Ped.robbed` đã phải chặn cho trấn lột, chỉ là với số tiền gấp mười.
⚠ Cộng nhiệt bằng cách gọi `ReportCrime` **ba lần**, không cộng thẳng `_heat`: mọi luật phụ của
nó (nhân theo số người chứng kiến · băng chữ · tiếng · ghi `PeakStars`) phải áp cho vụ cướp tiệm
y như mọi tội khác.

⚠⚠ **PHÍM Y, và Y là phím DUY NHẤT còn trống.** Lựa chọn hiển nhiên là **R** ("rob") — nhưng
`DemoSceneSwitcher` (CÓ MẶT trong sân này) đã dùng R để chơi lại màn. Bấm R sẽ vừa cướp tiệm vừa
nạp lại scene, và triệu chứng *"cướp xong game tự khởi động lại"* trông không giống một xung đột
phím chút nào. Đã đếm lại cả `Assets/`: G · T · B · Q · C · V đều có chủ. Vì Y không gợi nhớ gì,
chữ **[Y] CƯỚP** phải nằm ngay trong ô hỏi của tiệm — không có chỗ nào khác để học phím này.

### 3c. TIẾNG (`StickmanAudioSynth.City.cs`)

| Khoá | Khi nào | Ghi chú |
|---|---|---|
| `City/Siren` · `City/SirenSwat` | điều xe cảnh sát, và **hú đều khi đang bị THẤY** | hai bậc cao độ đổi qua lại; đặc nhiệm nhanh + cao hơn |
| `City/Horn` | (dành cho xe phanh) | hai kèn lệch quãng bốn |
| `City/Cash` | nhặt tiền | hai nốt ĐI LÊN + tiếng giấy |
| `City/Wanted` | lên sao | hai nốt ĐI XUỐNG — ngữ pháp ngược hẳn tiếng tiền |
| `City/Clear` | thoát truy nã | hợp âm mở dần, dài nhất (1.1 s) |

⚠⚠ **CÒI CHỈ HÚ KHI `Spotted`.** Hú suốt lúc còn sao thì tiếng thành nền và mất nghĩa; hú đúng
lúc bị nhìn thấy thì **im lặng cũng là một tín hiệu** — người chơi biết mình vừa cắt được tầm
nhìn mà không cần nhìn HUD. Đây là nửa còn lại của cơ chế trốn.
⚠⚠ Hai kiểu còi phải là **HAI KHOÁ RIÊNG**, không phải hai biến thể của một khoá:
`StickmanAudio.PlayKey` bốc NGẪU NHIÊN trong các biến thể, nên gộp lại là tiếng đặc nhiệm rơi
vào đợt thường — người chơi nghe một tín hiệu nói dối.
⚠ `PlayKey` **im lặng trả về** khi bảng tiếng thiếu khoá. Nút «★ PHỐ MỞ» vì thế gọi sẵn
`Audio > 5` rồi `Audio > 4`; Doctor có phép đo riêng canh năm file này.

**ĐÈN XOAY** trên nóc xe cảnh sát (`CityBlinker`): hai ô xanh/đỏ nhấp nháy LỆCH PHA. Chuyển động
là thứ mắt bắt trước màu — từ xa, giữa một dòng xe, đó là cái duy nhất đọc ra "xe cảnh sát".
⚠ Đổi `enabled` của renderer, KHÔNG đổi alpha: alpha 0 vẫn là một lượt vẽ.
⚠ Bật/tắt DỨT KHOÁT, không `PingPong`: lượn mượt nhìn ra đèn trang trí, không ra đèn ưu tiên.

### 3d. THÀNH PHỐ TỰ LÀM GÌ ĐÓ (`MapOpenWorld.Streets.cs`, đợt bốn)

⚠⚠ Bản trước thành phố chỉ PHẢN ỨNG — người chơi làm gì nó đáp lại. Không ai làm gì trước.
Một thành phố như thế là sân khấu chờ diễn viên, và diễn viên duy nhất là người chơi. Bốn thứ
dưới đây là bốn cách thành phố tự làm gì đó, mỗi cái trả lời một câu thiết kế riêng:

| Thứ | Trả lời câu | Cơ chế |
|---|---|---|
| **Lính tuần tra** (có ở 0 sao) | *"có ai đang nhìn không?"* | 2 ở trung tâm, +1 mỗi 2 điểm tai tiếng. Thấy tội (`PatrolSees`, qua `BuildingInterior.Hidden`) ⇒ +80% nhiệt + cảnh sát tới trong 1.5 s. NGHE súng/nổ (`NoiseField.TryHear`) ⇒ tội `Gunfire` |
| **Băng đảng về đêm** | *"đêm khác ngày ở đâu, ngoài trốn dễ hơn?"* | `NightAmount > 0.5`: xóm bần 3, bến sông 2 kẻ rình (`AIBehavior.Ambush`, phe `GangTeam`). Dân đêm còn 40%. Sáng là rút |
| **Chuyện trên phố** | *"thành phố có sống khi mình không đụng vào?"* | mỗi ~55 s (khi 0 sao): CƯỚP ĐANG DIỄN RA (cứu ⇒ nạn nhân trả $25–60, không lên sao vì kẻ cướp là phe băng đảng) · XE CHỞ TIỀN (nổ ⇒ 5–7 xấp $40–90, Phá hoại ×2) · ĐÁM ĐÔNG (chỉ trung tâm, 5–6 người: nhiều nhân chứng VÀ nhiều túi) |
| **Kho giấu** | *"ba tầng để làm gì khi không bị đuổi?"* | tiền trên MÁI (`Layout.platforms`) và dưới CỐNG (`Layout.tunnels`, sàn dò bằng raycast), tối đa 10, đẻ lại mỗi sáng |

⚠⚠ **LÍNH TUẦN Ở 0 SAO KHÔNG THỂ MANG PHE CẢNH SÁT.** `TeamMember.AreEnemies` coi MỌI phe khác
nhau là địch — không có phe trung lập. Lính tuần phe 2 sẽ đánh người chơi (phe 1) đang đi dạo
vô tội. Nên họ mang phe DÂN + tính cách dân + bị `Unequip` sau khi mặc đồ; sức mạnh của họ là
NHÂN CHỨNG. Tiếng còi làm phần còn lại.
⚠ Xe chở tiền có `aiCrew` bật ⇒ không cướp lái được. Nó phải BỊ PHÁ giữa phố, không phải bị
lấy đi — cái nhịp "làm nó nổ rồi nhặt kịp trước khi cảnh sát tới" mới là lý do để liều.
⚠ Chuyện trên phố chỉ nổ ra khi **0 sao**: đang bị đuổi mà thành phố còn mời thêm chuyện là
nhiễu, không phải sống động.

### 3e. XE TÔNG NGƯỜI (`CityRammer`)

`Vehicle` của bộ khung KHÔNG có va chạm với người — nó là khí tài, thân xe chỉ là vật cản.
Trong thế giới mở thì cái xe là VŨ KHÍ đầu tiên người chơi có; lái vào đám đông mà không ai
ngã là cả cái phố đọc ra một tấm phông. Đây là lỗ hổng cảm giác lớn nhất của bản đầu.

⚠⚠ **Không sửa `Vehicle`.** Thêm va chạm vào đó là đổi cân bằng hai mươi kiểu chơi khác (xe
tăng cán lính, thiết giáp nghiền quân mình lúc đổ bộ) — vùng ảnh hưởng quá lớn (`BlastRadius`).
`CityRammer` là component riêng ở module Map, chỉ gắn lên xe của thành phố.
- Quét `OverlapBox` ở MŨI xe mỗi `FixedUpdate` (đúng cách `DriveCivilian` dò vật chắn) —
  không dựa `OnCollisionEnter2D` vì ma trận lớp va chạm lọc theo phe, không đọc ra được.
- Sát thương + `forceScale` theo TỐC ĐỘ (2.2 → 7 world/s): bò chậm thì xô, phóng thì văng.
- NGUỒN là NGƯỜI LÁI (`CityRammer.Driver`, `TickCarjackWatch` đặt khi người chơi cướp xe):
  truyền cái xe thì cán chết dân không lên sao. Xe không người lái ⇒ tai nạn, không tội.
- Mỗi nạn nhân một lần / 0.6 s — không thì người kẹt ở mũi xe đang phanh ăn 60 đòn/giây.

### 3f. TAI TIẾNG THEO QUẬN (`MapOpenWorld.Notoriety.cs`)

Sao truy nã là trí nhớ NGẮN (nguội trong một phút, xoá khi ngủ) ⇒ thành phố mất trí: cướp lò
rèn sáu lần, sáng hôm sau vẫn mở cửa đón. Tai tiếng là trí nhớ DÀI: mỗi tội +1 cho QUẬN nơi
xảy ra (giết người +2), mỗi đêm ngủ −1, trần 9, lưu vào `PlayerProfile.cityNotoriety`.

Hiệu lực: lính tuần dày hơn (`WantedPatrols`) · cảnh sát tới nhanh hơn (`NotorietyDispatchScale`,
9 điểm = nhanh gấp đôi) · đầu lâu ☠ trên HUD và bản đồ [M] (một ☠ mỗi 3 điểm). Nó chuyển câu
hỏi từ *"làm gì"* sang *"làm ở ĐÂU"*.
⚠ Trần 9: không trần thì sau một tuần chơi bẩn quận nào cũng 40 điểm và bốn quận giống hệt
nhau — tai tiếng không còn là ĐỊA LÝ.
⚠ Chưa nối vào GIÁ tiệm (`NotorietyPriceScale` có sẵn): `Shops.cs` đang được phiên khác sửa
song song theo lỗi người dùng báo — hai phiên cùng sửa một file là mất công của nhau.

### 4. GỤC = MỘT CÁI GIÁ, KHÔNG PHẢI THUA

- Còn sao mà gục ⇒ **BỊ BẮT**: phạt `min(35% ví, 8%×sao) + 40×sao`, xoá sạch sao.
- Không sao mà gục ⇒ **VÀO VIỆN**: mất `5% ví + 25`.

`PlayerRespawn` của bộ khung lo phần dựng lại thân (tự gắn qua `PlayerRespawnBootstrap`).

**MẤT SẠCH VŨ KHÍ khi hồi sinh** (`MapOpenWorld.StripPlayer`, chạy trong `OnPlayerChanged`).
Mất tiền thì kiếm lại nhanh; mất khẩu súng vừa mua $260 mới là thứ khiến người chơi cân nhắc
trước khi gây chuyện — và là thứ cho tiệm súng một lý do tồn tại lâu dài.

⚠⚠ Cùng hàm đó lo luôn việc **ra sân TAY TRẮNG**, và phải làm ở đây chứ không ở công thức map:
đặt `MapRecipe.playerWeapons = new int[0]` KHÔNG có tác dụng — `MapGenerator` coi mảng rỗng là
"công thức không nói gì" rồi rơi về bộ vũ khí của THỂ LOẠI (`MapLibrary.PlayerWeaponsFor`), tức
người chơi vẫn ra sân với một khẩu súng trường. Công thức khai đúng ý, kết quả ngược hẳn.

### 5. TIỀN & ĐIỂM LƯU

Ví nằm ở `MapOpenWorld.Money`, lưu vào `PlayerProfile.cityMoney` (**−1 = chưa từng chơi**, 0 là
giá trị hợp lệ). Không dùng `TeamEconomy` — đó là ví của một ĐẠO QUÂN và reset theo ván.

⚠⚠ **Không dùng `Achievements.Count` làm ví**: bộ đếm dài hạn CHỈ TĂNG (`amount <= 0` bị bỏ qua),
nên mọi lần tiêu tiền sẽ im lặng không có tác dụng.

⚠ **Chỉ lưu ở NHÀ AN TOÀN.** Lưu liên tục thì cái chết không còn giá nào, và ghi đĩa mỗi lần nhặt
$5 là một lượt I/O giữa lúc đang chạy trốn. Điểm lưu là một CHỖ trong thế giới, đúng khuôn GTA.

⚠ Không cho ngủ khi còn sao — nếu không, mọi cuộc rượt đuổi kết thúc bằng "chạy về nhà, bấm F".

### 6. VIỆC LÀM — sáu loại, ba ô

`MapOpenWorld.Jobs.cs`. Một việc = **một mốc** + **một điều kiện xong** + **một cái giá**.
Thêm loại thứ bảy là thêm một nhánh ở `StartJob` và một ở `CheckDone`; không đụng HUD, tiền, la bàn.

| Việc | Xong khi | Tiền gốc |
|---|---|---:|
| Giao hàng | tới mốc trước khi hết giờ | 120 |
| Trộm xe theo đơn | lái **xe** về gara | 220 |
| Đòi nợ | con nợ còn < 34% máu | 140 |
| Chở khách | tới nơi **trên xe** | 160 |
| Dọn ổ băng đảng | hạ hết 3–4 tay súng | 260 |
| Hộ tống | **người được hộ tống** tới nơi | 200 |

Nhân `CityDistricts.payScale`; xong khi còn hơn nửa giờ thì +25%.

⚠⚠ **Việc phải có đường THẤT BẠI.** Chỉ có "xong / chưa xong" thì một việc bị bỏ dở để cái mốc ❢
nằm đó mãi mãi và bảng HUD nói dối. Mỗi việc có `deadline`; hết giờ là huỷ và nói rõ vì sao.
Mốc biến mất giữa chừng (con nợ bị xe cán) cũng huỷ.

⚠ Ổ băng đảng ở **phe riêng** (`PoliceTeam + 1`), không phải phe cảnh sát — chúng phải đánh cả
cảnh sát, nếu không thì trận đánh không đọc ra ai là ai.

### 7. DÂN + XE — thành phố chỉ tồn tại QUANH NGƯỜI CHƠI

`MapOpenWorld.Life.cs`. Sinh trong vành `SpawnRing = 22` (ngoài khung hình), thu về khi ra quá
`StreamRadius = 34`. Số lượng đọc từ quận × `MissionSettings.cityDensity`.

⚠⚠ **Không thu người/xe đang dính dáng tới người chơi**, ba trường hợp:
(1) cái xe người chơi **đang lái**, (2) người đang bị đánh dở (`Ped.involved`),
(3) người/vật là mục tiêu của việc đang nhận. Điều kiện thu phải hỏi cả ba, không chỉ khoảng cách.

**Dân** dùng `AIBehavior.PatrolRoute` (đi hết đoạn rồi quay đầu = "đang đi đâu đó"), không
`FreeRoam` (đi quanh chỗ đứng = "một người bồn chồn tại chỗ"). Hoảng thì đổi sang `Flee` có hạn
giờ — thiếu vế hết hoảng thì một tiếng súng làm cả quận bỏ chạy vĩnh viễn.

**Phe dân = 7 (`CivilianTeam`)**, trung lập và RIÊNG. Không dùng phe 0 và tuyệt đối không dùng
phe người chơi: dân cùng phe người chơi thì cảnh sát bắn họ trước, và cả thành phố thành một
trận đánh mà người chơi chỉ đứng xem.

**Xe** dùng `Vehicle.SetCivilianCruise(direction, throttle)` — một nhánh mới trong `Vehicle.Drive.cs`,
KHÔNG phải một lớp xe thứ hai. Chiếc taxi phải làm được đúng những việc `Vehicle` đã làm: bấm [F]
lên lái, đạn bắn thủng, nổ văng người, AI thấy nó là mục tiêu.
⚠ Xe phố **phanh khi có người trước mũi** (`OverlapBox` hẹp). Thiếu vế đó thì mọi chuyến đi bộ
qua đường kết thúc bằng bị tông, và cái phố thành một cái máy xay.
⚠ Chỉ **bán tải + xe tải**, phe −1. Không xe tăng: một cỗ tăng đỗ bên đường là lời giải cho mọi
bài toán, kể cả 5 sao.

**Cướp xe phát hiện bằng cách HỎI LẠI mỗi frame** (`TickCarjackWatch` → `Vehicle.IsDrivenBy`),
không nối sự kiện từ `Vehicle`. Bắt tầng Gameplay (4) bắn ra sự kiện "có người cướp tôi" là bắt
tầng dưới biết tầng trên có một hệ truy nã — đúng thứ luật module cấm.
Người lái cũ sinh ra **đúng lúc bị cướp**, không ngồi sẵn trong xe: ở góc nhìn ngang, người trong
xe bị thân xe che kín, nên một anh tài xế ngồi suốt ván là một FSM không ai từng nhìn thấy.

### 8. CỬA HÀNG — một phím cho cả thành phố

`MapOpenWorld.Shops.cs` implement `IModePrompt`, nên toàn bộ tương tác đi qua **[F]** của
`ModePrompt`. Giá nằm hết ở `PriceOf` / `PriceOfWeapon`.

| Tiệm | Làm gì | Giá |
|---|---|---:|
| 🔫 Tiệm súng | mua vũ khí (bấm lại = đổi món) | 60 / 140 / 260 / 420 theo `WeaponClass` |
| 🎨 Gara | xoá sạch sao — **phải đang lái xe** | 120 |
| ✚ Bệnh viện | hồi đầy máu | 80 |
| ☕ Quán ăn | hồi 40% máu | 15 |
| 🏠 Nhà an toàn | ngủ: qua ngày + hồi máu + **LƯU** | 0 |

Mọi tiệm (trừ nhà an toàn) **cướp được bằng [Y]** khi đang cầm vũ khí — xem mục 3b.

⚠⚠ **`ModePrompt` chọn nguồn ĐĂNG KÝ TRƯỚC NHẤT, không phải nguồn gần nhất** (đọc
`ModePrompt.Update`). Thành phố đăng ký ở `Begin` còn xe sinh sau, nên ô hỏi của thành phố
LUÔN thắng ô "lên xe" của `Vehicle`. Bản đầu vì thế có lỗi thật: đứng cạnh xe mà có người đi
đường lảng vảng thì [F] hiện "TRẤN LỘT" và **không bao giờ lên được xe**.

Thứ tự hỏi vì thế là một QUYẾT ĐỊNH, xếp theo mức *"người chơi có chủ đích tới đây không"*:

| # | Nguồn | Vì sao ở bậc này |
|---|---|---|
| 1 | Cửa hàng | chỗ cố định, tìm tới có chủ đích |
| 2 | Mốc việc ❢ | cũng cố định |
| 3 | **Nhường cho XE** (`VehicleWantsPrompt` → trả false) | lên xe là động tác quan trọng nhất, vùng bấm rất hẹp |
| 4 | Trấn lột | người đi đường đi ngang liên tục — lên trước là nút đổi nghĩa dưới tay |

⚠ `Activate` phải theo ĐÚNG thứ tự đó. Lệch nhau là ô hỏi ghi một việc mà bấm ra việc khác —
lỗi mà người chơi mô tả thành "nút bị loạn", và không ai tìm ra vì đọc riêng hai hàm đều đúng.
⚠ Hỏi thẳng `Vehicle.TryGetPrompt` chứ đừng tự đo khoảng cách lại: `Vehicle.IsWithinReach` đo
tới MÉP THÂN xe, không tới tâm.

⚠ **Đang bị truy nã thì tiệm súng không bán.** Không có vế này thì lời giải cho 4 sao là chạy vào
tiệm mua khẩu mạnh nhất rồi quay ra — tức sao càng cao người chơi càng mạnh.

⚠ Hàng trong tiệm = kho vũ khí của THỂ LOẠI (`MapLibrary.lootWeapons` lọc theo `GenreDefinition.weapons`),
không tự kê một bảng "tiệm bán gì": thêm súng mới mà phải nhớ thêm vào tiệm là luật «nhớ mới đúng».

⚠ Mua đi qua `WeaponPickup.GiveTo` — đường nhặt đồ thật của bộ khung (có chốt `WeaponMastery`,
gỡ vạch cấp, tiếng nhặt), không nhét thẳng vào tay.

### 8b. THỨ TỰ VẼ — layer THẾ GIỚI, không phải layer nhân vật

⚠⚠ **Lỗi người dùng thấy đầu tiên khi chơi thử** (*"order, vị trí trục x, trục y"*): bản đầu vẽ
mọi ô của thành phố (vỉa hè, vạch đường, biển hiệu, cột đèn, quầng đèn) ở layer **`character`**.
Layer đó nằm TRÊN toàn bộ nhà cửa (nhà vẽ ở `Default`), nên vỉa hè đè lên chân mọi toà nhà và
biển hiệu chen vào giữa người đi đường. Số `sortingOrder` của `StickmanWorldSorting` chỉ có nghĩa
TRONG một layer — sai layer thì mọi con số order đều vô ích.

Nay `MapOpenWorld.Block` mặc định vẽ ở `WorldLayerId` (`Default`); `onCharacterLayer` chỉ cho
thứ phải xen kẽ với người (chưa có thứ nào). Bậc order dùng:

| Thứ | Order | Vì sao |
|---|---|---|
| Vỉa hè · vạch đường | `BackProp + 4/5` (−46/−45) | trên đất (−70), dưới nhà (−40) |
| Biển hiệu · cột đèn · mốc ❢ · đích | `NearProp` (−14) ± 2 | "trước công trình, sau nhân vật" — đúng chữ trong `StickmanWorldSorting` |
| Quầng đèn / vệt sáng biển | `NearProp − 3` | trước mặt tiền (−30…−28), sau biển |
| Đèn xoay xe cảnh sát | `Prop + 3/4` | xe vẽ ở `Prop` (−6) cùng layer ⇒ nằm trên xe |

⚠ **Biển hiệu treo theo NÓC THẬT** (`StructurePlan.TopY`), kẹp 1.9…4.2 trên đất. Số cứng 2.6 thì
nhà trọ 2.4 có biển lơ lửng trên trời, bệnh viện 3.1 có biển chìm trong tường.
⚠ **Cột đèn phải `SafeX`** — bản đầu chỉ né TIỆM, không né nhà thường, nên vài quận lại có một
cây cột xuyên mặt tiền. Đẩy quá 2.5 (hết chỗ) thì bỏ cây đèn đó.

### 9. MAP — bắt buộc bốn thứ

`MapBlueprint.For(OpenWorldCity)` + `MapBlueprint.Validate` canh:

- **Nối vòng** — đi tới mép mà đụng tường vô hình thì nó chỉ là một cái sân dài.
- **Ba tầng** — xem mục 3.
- **Nửa map ≥ 50** (bảng cho **110–130**, nới 2026-09-09 theo user *"map rộng dài"*) — mỗi quận
  ~60 world unit = 6–8 dãy nhà; đi bộ hết vòng ~2 phút. Dân/xe stream nên rộng thêm không tốn
  frame; cái tốn là lượt DỰNG nhà lúc mở màn.
- **Không vực** — trong map đi lại suốt ván, một cái hố là chỗ người chơi rơi xuống lần thứ mười
  mà không hiểu vì sao.

Đất **PHẲNG** (`TerrainStyle.Flat`, đồi 0.15–0.35): đây là lòng đường; đồi lượn 1.5 dưới chân toà
nhà là nhà lún nửa người. `noWrapWidening` bật (cùng lý do battle royale — không có nhà chính nên
hệ số vòng 1.8 không bù cái gì).

`MapKitPlanner` chỉ xin **thềm + ụ che**: nhà cửa, cửa hàng, mốc việc đều do `MapOpenWorld.BuildCity`
đặt **theo quận** — thứ mà lô đất ngẫu nhiên không biết. Không chòi canh, không hồ/sông.

⚠ **Mọi thứ đặt xuống phải `layout.Reserve` dải x của nó.** `SafeX` đọc danh sách đó để đẩy
người/xe ra khỏi chỗ đã có nhà. Quên là dân sinh ra ĐỨNG TRONG tường và không lỗi nào báo.

### 10. NÚT BẤM & PHÉP ĐO

- Dựng: **★ Bảng điều khiển › ★ PHỐ MỞ — GTA 2D** (hoặc `Tools > Stickman > Nâng cao > Maps > 8`).
  Ra `Demo_70_CityOpenWorld`.
- Khám: **Doctor › «Phố mở — kho xe · hàng trong tiệm · nhà cửa · map mẫu»**
  (`StickmanDoctor.OpenWorld.cs`).

⚠⚠ **Vì sao kiểu chơi này cần phép đo riêng:** mười chín kiểu kia tự tố cáo khi hỏng (trận không
kết thúc, đồng hồ chạy mãi). Thế giới mở thì **hỏng mà vẫn chạy**, vì nó vốn không có điều kiện
kết thúc nào để sai. Thiếu kho xe ⇒ phố không có xe (nhìn như "vắng"). Kho vũ khí rỗng ⇒ tiệm
súng không bán gì (nhìn như "hết hàng"). Thiếu bộ chi tiết công trình ⇒ cả thành phố chỉ còn vỉa
hè — **không một dòng lỗi nào**. Người chơi kết luận "game chán", không kết luận "thiếu asset".

⚠ `MapArena` của sân này đặt `newMapEachRound: false` — **thành phố phải giữ nguyên**. Cả tiến
trình dài ("gara ở bến cảng", "nhà an toàn chỗ kia") chỉ có nghĩa nếu thành phố còn ở chỗ cũ sau
khi bấm chơi lại.

### 10b. BẢN ĐỒ TOÀN CẢNH  [M]

Thanh la bàn dưới đáy chỉ phủ **60 đơn vị** quanh người chơi; thành phố rộng 156–192. Cửa hàng ở
quận đối diện KHÔNG hiện trên la bàn, nên nếu chỉ có la bàn thì người chơi không có cách nào
biết thành phố có những gì ngoài tầm mắt. Phím **M** mở một dải phủ **cả vòng**: bốn quận có
tên, mọi cửa hàng, mốc việc, đích việc đang làm, và chỗ mình đứng.

⚠ Trục bản đồ là **trục THẾ GIỚI**, không xoay theo người chơi — một bản đồ xoay theo mình thì
không học thuộc được, và "gara ở bên phải trung tâm" mất nghĩa ngay khi quay đầu.
⚠ Đọc phím trong `Update`, KHÔNG trong `OnGUI`: IMGUI vẽ lại nhiều lần một frame (Layout rồi
Repaint) nên một lần bấm bị đọc hai lần và bảng mở rồi đóng ngay — nhìn ra là "phím không ăn".
⚠ Bản đồ **KHÔNG dừng game**. Đặt `Time.timeScale = 0` ở đây là giành quyền với `HitStop`
(hệ khựng hình lúc trúng đòn) — hai chủ một biến toàn cục là bẫy đã ghi ở `MutatorBinder`.

### 10c. NHUỘM MÀU: ART MANG MÀU ≠ CODE MANG MÀU (2026-09-09)

User gửi ảnh phố mở trung cổ, 6 sao: *"xe ngựa bị rời bánh"* — cỗ xe là một **bóng trắng**,
hai cái bánh là hai đĩa trắng rời rạc.

Thủ phạm là `TintBuilding` (sơn xe áp giải xanh cho đọc ra phe). Công thức cũ:

```csharp
mixed = Lerp(color, tint * color.grayscale * 1.6f, strength);
```

⚠⚠ Nó đúng cho **khối vẽ bằng code** (tường · mái · biển hiệu): ở đó `renderer.color` CHÍNH LÀ
nước sơn, nên `grayscale` giữ được chỗ nào sáng chỗ nào tối.

⚠⚠ Nó **phá sạch** mọi thứ có ART THẬT: ở đó `renderer.color` là **trắng** (màu nằm trong
texture), nên `grayscale` luôn = 1 và công thức trả về `tint × 1.6` ≈ **(0.74, 0.94, 1.00)** cho
MỌI bộ phận. Thùng xe, con ngựa, hai cái bánh — cùng một màu gần trắng. Mất hết nét sáng-tối
từng nối chúng lại, và mắt đọc ra là **cái xe rời ra từng mảnh**. Không lỗi, không log.

**Luật.** Nhuộm thứ có art thật thì dùng phép **NHÂN**, và chuẩn hoá tông trước:
`color × Lerp(trắng, tint/kênh-sáng-nhất, strength)`. Texture giữ nguyên sáng tối của nó, chỉ
đổi tông. Chuẩn hoá là để «sơn xanh» không kiêm luôn «làm cho tối đi».

⚠ Nhân không thêm được màu mà texture không có: xe gỗ nâu nhuộm xanh ra **nâu-xám lạnh**, không
ra xanh lơ. Muốn đọc ra «xe của phe kia» ở xa thì trông vào **chuyển động** (đèn xoay
`CityBlinker`), không trông vào màu — đúng như chú thích ở `AttachLightBar`.

### 11. CÒN THIẾU (chưa làm, 2026-09-09)

Ghi ở đây để người sau không tưởng là đã có:

- **Chưa chơi thử thật** — code biên dịch sạch, nhưng chưa ai bấm Play. Số cân bằng (tiền, nhiệt,
  nhịp điều cảnh sát) là bộ số ĐẦU, chưa hiệu chuẩn trên dữ liệu chơi.
- **Chưa có art riêng** — nhà cửa mượn `StructurePartSet` hiện đại, cửa hàng phân biệt bằng biển
  hiệu MÀU chứ chưa có sprite riêng. Đặt hàng art theo `Docs/AgentRules/AssetGeneration.md`.
- **Chưa có SPRITE riêng** cho xe cảnh sát (hiện là xe tải nhuộm xanh + đèn xoay vẽ bằng ô
  vuông) và cho mặt tiền cửa hàng (hiện phân biệt bằng biển hiệu MÀU).
- **Chưa có tiếng phố nền** (đám đông, động cơ xa) và **chưa có nhạc/radio theo quận** —
  `MusicBank` + `MusicMood` đã có sẵn, chỉ chưa nối `CityDistrict` → khí sắc.
- **Chưa có xe máy/xe đạp** (cần `VehicleSpec` mới), chưa vào được BÊN TRONG cửa hàng bằng cửa
  riêng (mới là vùng đứng bấm trước mặt tiền).
- **Tai tiếng chưa nối vào GIÁ tiệm** (`NotorietyPriceScale` có sẵn, chờ `Shops.cs` rảnh).
- **Chưa có `City/Horn` được gọi** — clip đã sinh nhưng `Vehicle.DriveCivilian` chưa bấm còi
  khi phanh (nó nằm ở module Gameplay, không thấy `MapOpenWorld`). Doctor «enum chưa gắn»
  không bắt được vì đây là chuỗi, không phải enum.
