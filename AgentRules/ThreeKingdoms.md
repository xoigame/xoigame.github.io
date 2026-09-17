## ⚠⚠ TAM QUỐC — BA NƯỚC MỘT SÂN · TRẬN PHÁP · DOANH TRẠI MAP VÒNG · CHIẾN DỊCH THEO LƯỢT (2026-09-08)

User: *"thêm 1 chế độ game tam quốc chí 3 team Ngụy Thục Ngô (Xanh, Đỏ, Vàng), vẽ hình
trang bị giáp nón lại theo chủ đề tam quốc chí, chế độ chơi theo dàn trận tam quốc"*.

Code: `Assets/Scripts/Gameplay/ThreeKingdoms/ThreeKingdoms.cs` (bảng ba nước + trận pháp) ·
`Assets/Scripts/Gameplay/ThreeKingdoms/ThreeKingdomsMode.cs` (trọng tài) ·
`Assets/Editor/Modes/StickmanThreeKingdomsBuilder.cs` (màn `Demo_51_ThreeKingdoms`) ·
ba nền `Wei` · `Shu` · `Wu` trong `StickmanCivilizationBuilder.Specs`, art vẽ bù ở
`CivilizationHelmetArt.ThreeKingdoms.cs` + `CivilizationArtGenerator.ThreeKingdoms.cs`.
Bảng điều khiển: «★ 15 nền văn minh» (sinh art + asset ba nước) rồi «Tam Quốc dàn trận — Demo_51».

### 1. Ba nước là BA NỀN VĂN MINH, không phải ba màu

- Đi đúng dây chuyền [CivilizationIntake.md](CivilizationIntake.md) — tám điểm nối, khoá
  `Wei` · `Shu` · `Wu`, nối **CUỐI** `Specs` (Demo_19 lưu chỉ số nền vào scene bake).
- Phe: **NGỤY = 1 (xanh) · THỤC = 2 (đỏ) · NGÔ = 4 (vàng)**. ⚠ KHÔNG dùng 3 —
  `TeamMember.ColorOf(3)` là XANH BỆNH của zombie; `case 4` mới thêm màu vàng. Thứ tự tăng dần
  1 · 2 · 4 chính là thứ tự `CivilizationTeamAssigner._fixedByTeam` ghim nền, nên đổi số là
  đổi luôn ai mặc áo gì. Nguồn sự thật: `ThreeKingdoms.Teams`.
- Thân stickman vẫn ĐEN; nước đọc bằng nón · giáp · khiên. Ba nón cùng họ mũ trụ Hán với
  `China`, nên phải khác **ĐƯỜNG BAO** chứ không chỉ khác màu (bẫy "30/45 nón là hai đường bao
  tô lại"): Ngụy = ống cắm + chùm lông lam ngả sau + sống mũi · Thục = cánh phượng vàng vút
  chéo ra sau + tua đỏ · Ngô = vòm THẤP BÈ + khăn vàng quấn dày, không sống mũi.
  Giáp: Ngụy lá sắt so le trên vải lam · Thục hộ tâm kính (gương đồng tròn giữa ngực) trên
  vải đỏ · Ngô vảy cá sơn mài đen trên vải vàng. Khiên: Ngụy bầu dục cao · Thục mây đan tròn ·
  Ngô tròn vàng viền đen.
- Kiểm ở **44 px** trước khi mở Unity:
  `python .claude/skills/stickman-assets/scripts/helm_three_kingdoms.py <thư-mục-ra>` — vẽ
  ba nón + `China` để so, xuất sheet 256 và bản đặt lên đầu ở cỡ thật. Đã nhìn 2026-09-08:
  bốn cái tách nhau ở 44 px.
- Art code-gen là **VẼ BÙ** (luật nguồn asset). Đơn hàng ChatGPT nằm ở
  `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md`: ba khối nền ở mục 3g, ba hàng ở bảng giáp
  4b, khiên 5b và bảng nền §7. Thả PNG thật cùng tên vào `Sprites/Civilizations/Wei|Shu|Wu/`
  là `Save` tự chừa ra.
- Vật cưỡi cố ý khác nhau: Ngụy `Destrier` (Hổ Báo kỵ nặng) · Thục `Steppe` (kỵ Tây Lương nhanh)
  · Ngô `Horse`. Không cây vũ khí mới: nỏ Gia Cát = `WRepeatingCrossbow`, hoả cầu Xích Bích =
  `WFirepot`, xà mâu = `WLance`, Thanh Long đao = `WGlaive`.

### 2. Trọng tài ba phe — hai câu hệ hai phe chưa từng trả lời

Mọi trọng tài đang có viết cho HAI phe (`_enemyTeam`, `EnemyTeamOf(1) = 2`); loạn chiến nhiều
phe nhưng mỗi phe một người, không cây chỉ huy. `ThreeKingdomsMode` là ba ĐẠO QUÂN có tướng,
có cây chỉ huy, có kinh đô.

- **"Đánh AI trước?"** — `TeamCommander` chỉ biết MỘT `_enemyBase`. Mỗi nước được một CỘT MỐC
  ĐỊCH riêng (`Kingdom.target`), trọng tài DỜI nó tới kinh đô của nước bị nhắm — đúng khuôn
  cây chỉ huy (dời mốc, không gọi lại `SetBehavior`). Luật nhắm: **kẻ MẠNH NHẤT**
  (`PowerOf` = quân sống + máu kinh đô × 4, hoà thì nước gần hơn) — liên minh tự nhiên chống
  kẻ đang dẫn, cán cân tự cân mà không ai buff ai. Kèm QUÁN TÍNH `_retargetHold` 8 s (§5c:
  không có là hai nước ngang sức đổi mục tiêu mỗi nửa giây).
- **"Thua khi nào?"** — một nước DIỆT VONG khi **kinh đô thất thủ** HOẶC hết quân mà
  `RespawnDirector.CanRespawn(team)` = false (quỹ **4 mạng/nước** — không có quỹ thì ba nước sống
  lại vô hạn và không ai diệt vong, bài học loạn chiến). Tàn quân nhận `CommandRetreat`.
  Người chơi THUA khi nước mình diệt vong (kể cả khi hai nước kia còn đánh); THẮNG khi còn một
  mình. Quá `_timeLimit` 300 s → SINH TỬ ĐỘT NGỘT (khuôn `LastStandingMode`, trừ máu qua
  `TakeDamage` + `forceScale = 0`).
- ⚠ Phải THẤY cả ba nước có quân rồi mới chấm (chốt chặn 2 của `SkirmishMode`); sau 6 s mà
  còn nước chưa có quân thì log cảnh báo "màn dựng thiếu đạo quân".
- ⚠ **`AllowsSideChoice = false` là cố ý**: hai nút của `GameSession.DrawSidePicker` chỉ lật
  1 ↔ 2. Mode tự vẽ BA nút nước ở màn hình bắt đầu và gọi `GameSession.SwitchSide` (nay
  `public`) — cửa DUY NHẤT dời đủ năm thứ (phe session · phe mode · `TeamMember` · chỗ đứng ·
  bộ giáp). `GameSession.IsBriefing` là câu hỏi "đang màn hình bắt đầu"; bảng chọn phải
  `StickmanUI.ClaimPanel` không thì bấm nút cũng bị tính là "chạm nền → vào trận".
- ⚠ **`TroopCountIsRule = true`**: ba đạo quân cân nhau là LUẬT. Bậc khó vào CẤP AI
  (`TeamAILevels.Set`) + CẤP VŨ KHÍ (`SetTier`) cho **CẢ HAI** nước máy, mode tự áp —
  `GameSession.ApplyDifficultyToScene` chỉ biết một `_enemyTeam`, thiếu vế này là đánh bậc 4
  mà một nước vẫn tân binh, không lỗi nào báo. Đổi ghế thì nước cũ thành nước máy (bốc trận
  pháp theo seed) và bậc khó áp lại.
- Mọi số luật (giờ sinh tử · quán tính · quỹ mạng · nhịp đếm) là field SERIALIZED bake vào
  scene — đổi mặc định trong code là phải dựng lại `Demo_51` (đã khai `extraSources` ở job).

### 3. Trận pháp = LỚP TÊN GỌI đặt lên hệ đội hình có sẵn

`ThreeKingdomsFormation` không phải hệ đội hình mới: mỗi trận pháp dịch ra
`TeamFormationKind` (ép qua `SetFormationOverride`) + thế trận chiến dịch (`DecideCampaign`).

| Trận pháp | `TeamFormationKind` | `CampaignIntent` |
|---|---|---|
| Hạc Dực (鶴翼) | `BattleLine` | Auto |
| Ngư Lân (魚鱗) | `AssaultColumn` | Press |
| Phương Viên (方圓) | `ShieldWall` | Hold — Press khi nước bị nhắm còn < 60 % sức mình |
| Trường Xà (長蛇) | `MarchColumn` | Press |
| Bát Quái (八卦) | `Auto` | Auto |

- ⚠ KHÔNG `Issue` lệnh tay trong mode — lệnh tay KHOÁ ông tướng máy tới khi ai đó bấm «Tự
  động». Tiến/thủ đi qua `DecideCampaign` mỗi 1.5 s, nên đổi trận pháp giữa trận là thấy đổi.
- Người chơi đổi trận pháp ở màn hình bắt đầu và giữa trận (hàng nút dưới dòng trạng thái, chỉ
  khi HUD mở). Hai nước máy bốc theo `GameRun.Range` — cùng seed cùng thế trận, dựng lại được.
- Năm cái phải KHÁC NHAU ở thứ nhìn thấy trên sân (lớp trước/sau + dâng lên hay giữ chỗ);
  trận pháp chỉ là một cái nhãn thì người chơi bấm xong không thấy gì đổi.

### 4. Bố cục Demo_51 — Thục ở giữa được bù bằng địa hình

Ngụy −36 · Thục 0 · Ngô +36 (kinh đô = `CreateHouseShared` 110 máu); đạo quân 14 người/nước
(3 khiên · 7 cận chiến · 4 tầm xa — vũ khí lúc spawn CHỈ để suy vai, `FullRoster` phát lại theo
quân chủng của nước); tướng `SpawnGeneralShared` đứng sau đội hình; người chơi mở màn trong
hàng ngũ Ngụy.

- Giữa là chỗ bất lợi nhất của sân đi ngang (hai mặt giáp địch) ⇒ hai THỀM "Thục đạo"
  (±13…±19, cao 1.50 = 10 bậc × 0.15, sàn một chiều nên làn đất không bị bịt — §7d-san) + cầu
  thang quay VÀO phía Thục + `GarrisonPost` cho cung Thục (khai `Garrison`). Địch muốn lên phải
  qua tuyến khiên Thục trước; tên từ dưới vẫn xuyên sàn.
- Hồi sinh ba nước TỰ DỰNG (`RespawnDirector.EditorSetup` + `SetLivesPerTeam(4)`), KHÔNG dùng
  bản nhiều phe của `AddRespawnDirectorShared`: nó đặt MỘT giỏ trung lập ở trung bình x = ngay
  kinh đô Thục. Mỗi nước một giỏ đạn ngoài tầm mốc hồi sinh (3.0 / bán kính 1.3).
- Builder **DỪNG** nếu thiếu `Civ_Wei/Shu/Wu.asset` và réo tên nút — không dựng một màn ba nước
  mặc đồ ngẫu nhiên trông như đã xong.
- Đăng ký: job nhóm 2 «Demo_51 — Tam Quốc dàn trận» · tool cùng tên · `StickmanCatalogRefresh`.

### 5. Đo lại

```
Tools > Stickman > ★ Bảng điều khiển
  1. Nhân vật › «★ 15 nền văn minh»            → sinh art + asset Wei · Shu · Wu
  2. Nhân vật › «★ Soát hồ sơ nền văn minh»    → phải XANH 22/22 (18 trung cổ + 4 hiện đại)
  3. «Tam Quốc dàn trận — Demo_51»              → dựng màn; mở, chọn nước, chọn trận pháp
  4. «Tam Quốc doanh trại — Demo_52»            → mục 6: ba trại · map vòng · ba tầng
  5. «Tam Quốc chiến dịch — Demo_53 + Demo_54»  → mục 7: bản đồ theo lượt ↔ màn công thành
  6. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN»  → không thêm mục đỏ mới
```

Trạng thái 2026-09-08: code biên dịch sạch (`dotnet build Xoi.Stickman.Editor.csproj`, 0 lỗi);
nón đã nhìn ở 44 px bằng script Python. **CHƯA bấm các nút trên** (Unity đang mở ở một phiên
khác lúc làm) — PNG · asset · scene chưa tồn tại trên đĩa cho tới khi bấm.

### 6. Doanh trại Tam Quốc — `Demo_52_ThreeKingdomsCamp` (map VÒNG, ba tầng, hai mặt)

Yêu cầu: *"làm giống war camp là xây nhà từ từ và mua lính, 3 nước đánh nhau, đi ngược về
bên trái thì đánh được phía sau nước kia… đường hầm và đồi núi làm thành 3 tầng… khoảng
cách 3 team đều nhau giữa mặt trước và mặt sau… 3 team trang bị khác nhau… mua xe công
thành… hệ thống tường thành"*.

- **Map vòng KHÔNG cuộn thế giới**: hai `RingPortal` ở hai mép (±81) dịch chuyển người đi
  qua sang mép kia (giữ y, cooldown 0.6 s). Ngụy −56 · Thục 0 · Ngô +56 trên sân 168 ⇒ mặt
  trước và mặt sau cách nhau như nhau (56 trên đất, ~50 qua cổng). Trọng tài
  `ThreeKingdomsCampMode` (kế thừa `ThreeKingdomsMode`, `EliminateOnTroopLoss = false` —
  chỉ mất KINH ĐÔ mới diệt vong) tách **cánh kỳ binh** 35 % (`KeepsOwnOrders`) đi vòng
  qua cổng rồi đánh sau lưng; nước bị đánh vì thế phải giữ CẢ HAI cổng.
- **Ba tầng** = `StickmanTieredTerrain` nhiều tâm đồi (`hillCenters` ±28): hầm sáu giếng ·
  mặt đất · cầu đá trên hai đèo. Mỗi trại có tường + cổng HAI MẶT (`CreateVillageGate`,
  `_commandedOnly = false` để tướng máy tự xuất quân) + sàn thành một chiều có thang mặt
  trong + `GarrisonPost`; tổ canh nhà tuần giữa hai cổng.
- **Kinh tế** dùng lại War Camp: `TeamEconomy` (máy `SetAutoSpend`, người chơi tự mua) + ba
  `EconomyProfile_TamQuoc_{Wei,Shu,Wu}` (sở trường: Ngụy đông rẻ, `Massing`; Thục kỵ + nỏ
  liên châu, `Raider`; Ngô tinh nhuệ đắt, `Elite`) + `Doctrine_TamQuoc`. Đổi nước ở màn bắt
  đầu ⇒ `RebindCamp()` đảo cờ tự mua và `CampGameUi.Rebind`.
- **Xe công thành mua được**: `CampBuildKind.SiegeWorkshop` (nhà thứ 15 — nhớ 6 chỗ phải
  thêm một kind) dựng `CampSiegeWorkshop`; kho mẫu `SiegeEngineCatalog` là các cỗ
  `CreateSiegeEngine` TẮT sẵn theo loại × hướng (helper là editor-only nên runtime chỉ
  NHÂN BẢN). Hướng xe đi theo mục tiêu hiện tại (`OnTargetChanged → SetTargetDirection`).
- Máu công trình: kinh đô 40 (`SetSiegeRules` cháy được, không biến mất khi sập), cổng 90.
  Thời hạn 900 s rồi sinh tử đột ngột.

### 7. Chiến dịch Tam Quốc — `Demo_53_ThreeKingdomsCampaign` ↔ `Demo_54_ThreeKingdomsSiege`

Yêu cầu: *"bản đồ 2D có nhiều ô biểu tượng doanh trại/thành phố, chia ba nước… bấm thành
thì chuyển qua map 2D mua lính xây nhà, chuyển lính tới doanh trại hay tấn công địch… trên
bản đồ theo turn base, trong màn đánh nhau thì real time, giống Total War nhưng màn hình
ngang 2D"*. Hai tầng, hai scene, MỘT nguồn sự thật:

| Tầng | Ở đâu | Là gì |
|---|---|---|
| Luật + dữ liệu | `ThreeKingdomsCampaign` (static, sống qua reload như `GameRun`) | 12 thành (Lạc Dương · Trường An · Nghiệp · Hứa Xương · Hợp Phì / Thành Đô · Hán Trung · Giang Lăng / Kiến Nghiệp · Giang Hạ · Sài Tang · Cối Kê), đường nối, ngân khố, đồn trú **bốn con số** (khiên · cận · xa · kỵ), tháp/tường 0..2, thu nhập, lệnh mỗi thành, `EndTurn`, tướng máy, tự quyết, ghi kết quả trận |
| Bản đồ (lượt) | `ThreeKingdomsCampaignMap` — Demo_53, scene trống + camera, IMGUI | ô thành + đường + mũi tên lệnh; bảng thành: mua · tháp · tường · «Điều quân / Tấn công» (chọn % rồi bấm thành kề) · «Vào thành»; «Kết thúc lượt»; hỏi «Đánh tay / Tự quyết» |
| Gói tay | `CampaignBattleContext` (static) | trận nào · ai công/thủ · quân · tháp · tường; `Kind = Battle` hay `Visit`; `LoadScene` cảnh báo nếu chưa vào Build Settings |
| Màn trận (thời gian thật) | `CampaignBattleMode : MatchModeBase` — Demo_54 | sân dựng MỘT LẦN: công vào từ mép trái, thành bên phải (cổng + sàn thành · hai tháp · toà thành). Mỗi lần nạp: giao thành cho nước thủ (đổi `TeamMember` + `GarrisonPost.SetTeam`), bật đúng tháp/tường, SINH hai đạo quân ở frame đầu (sau mọi `Start`, để `RespawnDirector` không chụp họ vào khuôn), đặt người chơi về đúng phe |

Luật giữ cho đúng:

- **Một lượt = ba pha** (`TurnStage`): *Orders* (mình ra lệnh) → *PlayerAttacks* (quân mình
  điều tới thành nhà đến ngay; mỗi trận mình công vào HÀNG CHỜ `PendingBattles`, bản đồ hỏi
  từng trận «Đánh tay / Tự quyết») → *AiTurn* (thu nhập, ba nước máy xây · mua · điều ·
  đánh; máy đánh thành MÌNH cũng vào hàng chờ — mình thủ, đánh tay được; máy–máy tự quyết).
  Bản đồ gọi `Advance()` mỗi khi hàng chờ trống. ⚠ Bản đầu chỉ cho MỘT trận đánh tay mỗi
  lượt và tự quyết phần còn lại trong im lặng ⇒ người chơi đem quân đi đánh, thành nhà bị
  phản công cùng lượt và mất mà không được đánh — đúng câu *"tấn công thành khác mà thua thì
  mất thành của tôi luôn"* (2026-09-08). Hàng chờ + ba pha là câu trả lời; không được quay
  lại "một trận mỗi lượt".
- **Thua không mất sạch**: công thua (kể cả bấm «Rút quân») thì người sống sót VỀ THÀNH XUẤT
  PHÁT; tự quyết thì giữ 35 %. Thủ mất thành thì quân sống sót chạy sang thành nhà kề (tự
  quyết: 25 %). `TryOrder` bắt để lại ≥ 1 lính khi đi đánh.
- **Mỗi thành MỘT lệnh mỗi lượt**; quân ra lệnh RỜI đồn trú ngay (huỷ thì trả về) — không
  thì một toán đếm hai lần. Trận trong hàng chờ mà chủ thành đã đổi (mình vừa mất thành đó)
  → `PruneForeignBattles` tự quyết, không hỏi.
- **Công trình** (`Building`, 5 loại, mỗi thành một cái mỗi loại): Nông trại +4 vàng · Chợ +6
  (cần Nông trại) · Trại lính +3 lính/lượt và lính rẻ 2 · Chuồng ngựa mở kỵ binh · Lò rèn
  +15 % sức (tự quyết) và +15 % máu (màn trận). Trần mua lính 3/thành/lượt (+3 Trại lính).
  Kinh đô mở màn có Nông trại + Trại lính + Chuồng. Chiếm thành: mất một tháp, lò rèn cháy.
  Máy xây một cái mỗi lượt theo thứ tự enum.
- Tự quyết: bảng sức × lò rèn × (1 + 0.15/tháp + 0.15/tường) ± 15 % qua `GameRun.Range`.
- Màn trận: sau khi sinh quân là pha **DÀN TRẬN** (`Time.timeScale = 0`, cùng khuôn với màn
  bắt đầu của `GameSession`): chọn trận pháp cho phe mình (`SetFormationOverride`), máy bốc
  theo seed, «XUẤT TRẬN». «RÚT QUÂN» / «BỎ THÀNH» có ở mọi lúc. Công thắng khi **toà thành
  sập** hoặc quân thủ bị diệt; thủ thắng khi quân công tan rã hoặc **hết 240 s**. Kết thúc
  đếm người CÒN SỐNG theo vai (kỵ = đang cưỡi) → `ResolvePlayerBattle`. Không dùng
  `GameSession` (phe do chiến dịch quyết); mode tự vẽ bảng kết quả + «Về bản đồ». Năm công
  trình là prop `_buildingProps` bật theo thành.
- «Vào thành» = cùng scene Demo_54 với `Kind = Visit`: đồn trú đứng gác là người thật; mua
  lính SINH người + trừ vàng qua `TryRecruit`; xây tháp/tường bật công trình; điều quân rút
  đúng số người theo vai ra khỏi sân (`RemoveVisuals`).
- Builder ghi CẢ HAI scene vào Build Settings (`LoadScene` theo tên cần thế) — không bắt
  bấm thêm «0. Đăng ký lại scene». Mở thẳng Demo_54 thì chơi trận mẫu, không ghi đâu cả.
- Biểu tượng thành / nền bản đồ: code vẽ tạm (`CampaignMapIcons`, texture 48 px sinh lúc
  chạy); có file ở `Resources/Campaign/` thì nạp thay — đơn hàng ChatGPT ở
  `WeaponArt-ChatGPT-Prompt.md` mục 11.

### 7b. Bản đồ v4 — ba mục · ba loại lính · gỗ + vàng · vua · tướng giữ ô · nổi dậy · cướp bóc · xem trận (2026-09-08 tối)

Yêu cầu chốt sau khi chơi thử: *"chỉ cần mua 3 loại: cận chiến, tầm xa, kỵ binh… điều tướng ra
giữ doanh trại, tướng đó sẽ giữ doanh trại và điều phối lính đánh các nhà xung quanh, bên
địch cũng vậy. Mình là vua (điều khiển 1 thằng có dấu hiệu trên map), 2 nước còn lại cũng có
vua, mua tướng, điều phối tướng và quân. Trên map có 3 mục: Thành thị · Doanh trại · Tài nguyên
(gỗ và vàng)… thành thị xây nhà kiếm tài nguyên + mua lính, doanh trại chỉ mua lính, tài
nguyên chỉ kiếm tài nguyên"*. (Bản v3 có lương, ải, đồng lúa, khiên, nút thái thú — đã bỏ.)

- **Ba mục** (`NodeKind`): THÀNH THỊ (`City`: 5 nhà · mua 3 lính/lượt (+3 Trại lính) · tháp 2 ·
  tường 2) · DOANH TRẠI (`Camp`: chỉ mua lính 6/lượt, rẻ 2, cả kỵ binh không cần chuồng; một
  tháp) · TÀI NGUYÊN (`Forest` +6 gỗ · `Mine` +8 vàng; `CanRecruit = CanBuild = false`, chỉ
  chuyển quân tới giữ). 25 ô: mỗi nước kinh đô + 2 thành + 2 trại + rừng + mỏ; 4 ô trung lập.
- **Gỗ + vàng**: vàng mua lính · thuê tướng · phần nhà; gỗ xây nhà · tháp · tường
  (`BuildingCost`/`TowerCost`/`WallCost` là tuple `(gold, wood)`; `Afford`/`Missing`/`Pay`
  một chỗ). Nhà: Xưởng gỗ +4 gỗ · Chợ +6 vàng · Trại lính · Chuồng ngựa · Lò rèn. Thành thị
  gốc +2 gỗ. Cướp bóc lấy vàng + gỗ.
- **Ba loại lính** (`Garrison { melee, ranged, cavalry }`): khiên bỏ hẳn khỏi chiến dịch —
  màn trận vẫn có lính khiên do nền văn minh phát theo `UnitRole`, nhưng chiến dịch không đếm.
- **Vua** (`General.isKing`, tên Tào Tháo · Lưu Bị · Tôn Quyền): vua người chơi `isPlayer`,
  ★ trên bản đồ; vua máy ♛ ở kinh đô. Vua cũng dời được (một bước/lượt) — dời ★ tới ô nào là
  người chơi tự cầm quân ở ô đó và trận ở ô đó là ĐÁNH TAY. **Tướng giữ ô** (`KeeperOf`): tướng
  máy đứng ở ô nào thì tự quản ô đó — `EndTurn` gọi `AiManageCity` cho mọi ô của nước mình có
  tướng và KHÔNG có ★ (ngân khố chia 60 % cho các tướng), ghi `Events`. Không còn nút thái
  thú. Tướng không dẫn quân đi (giữ ô) — quân công không có tướng máy trên sân
  (`AttackerGeneral` rỗng); ô thủ có tướng thì tướng ra sân (`DefenderGeneral`, máu theo Dũng).
- **Vua máy** (`AiTurn`): thuê tướng khi > 80 vàng và số tướng < số trại/thành ngoài kinh đô;
  tướng rảnh tự dời ra trại/thành biên giới chưa có ai giữ; rồi từng ô `AiManageCity`.
- Còn nguyên từ v3: quân nổi dậy phe 5 trắng, cướp bóc `Raid`, hàng chờ ba pha, thua rút về,
  xem trận khi không có ★, pha dàn trận.
- ⚠ Đã chơi thử Demo_54 «vào thành» (ảnh 2026-09-08 tối) — bảng cũ hiện 4 nút lính; bản này
  ba nút và ẩn phần xây ở doanh trại. Chưa chơi thử bản v4 trên bản đồ.

### 7c. Đợt «làm hết» (2026-09-08 tối) — mô phỏng · lưu · sân theo ô · lệnh trong trận · hành quân · ngoại giao · nuôi quân · cấp tướng · trung lập · zoom · tổng kết · tan rã · xe công thành · trống trận

Mười bốn mục tôi đề nghị, người dùng chốt *"làm hết giúp tôi"*. Chỗ nào nằm ở đâu:

| Mục | Ở đâu | Luật |
|---|---|---|
| 1 Mô phỏng | `Assets/Editor/Doctor/StickmanCampaignSimulator.cs`, tool «Mô phỏng chiến dịch Tam Quốc — 30 lượt × 3 nước», menu Demo Scenes | `ThreeKingdomsCampaign.AutoPilot = true` → nước người chơi cũng do vua máy điều, mọi trận tự quyết; `SimulateTurn()` đẩy trọn một lượt. Chạy ba lần (mỗi nước làm người chơi, seed 1000+k), in ai thắng · vàng/gỗ/quân mỗi 5 lượt · số trận chiếm/cướp · tin nổi dậy · lần đào ngũ · mọi ngoại lệ. **Bấm sau mỗi lần đổi giá/thu nhập/AI.** |
| 2 Lưu/tải | `ThreeKingdomsCampaign.Save()/Load()` → `persistentDataPath/tamquoc_campaign.json` (JsonUtility, `Snapshot`) | Nút Lưu/Tải trên thanh trên, F5/F9, «Tiếp tục chiến dịch đã lưu» ở màn chọn nước. `Load` gọi `NewCampaign` để dựng đường rồi đè trạng thái; `GameRun.Reseed(seed)` để cùng seed. Thêm trường mới vào dữ liệu là phải thêm vào `Snapshot` — không có sổ thứ hai. |
| 3 Sân theo ô | `CampaignBattleContext.NodeKind`; builder `BuildCampScenery` (rào cọc + lều) · `BuildResourceScenery` (cây + cửa hầm); mode `ApplyScenery` | Ba gốc `_sceneryCity/Camp/Resource`, bật một; ô không phải thành thì toà thành hạ máu (45 trại · 35 tài nguyên). Cổng/sàn/tường theo `walls` (chỉ thành có). |
| 4 Lệnh trong trận | `CampaignBattleMode.DrawOrderBar` | Tấn công [1] · Giữ [2] · Về thủ [3] · Tự động [4] → `TeamCommander.CommandAttack/Hold/Defend/Auto` của phe người chơi. Xem trận cũng ra lệnh được. |
| 5 Hành quân | `March { order, eta }`, `Marching`, `ExecuteOrders` → lên đường (eta 1), `ProcessArrivals(kingdom)` ở ĐẦU pha của nước đó | Quân tới nơi lượt sau; bản đồ vẽ mũi tên mờ + số quân; `AnnounceIncoming` báo «⚠ X đang tiến tới Y». `ThreatOn` tính cả quân đang tới. Nổi dậy từ rừng núi eta 0 (ập tới ngay). Đình chiến ký sau khi quân lên đường → quân quay về. Huỷ lệnh chỉ được tới khi kết thúc lượt. |
| 6 Ngoại giao | `TruceTurns/InTruce`, `TryProposeTruce` (cống 30 vàng, xác suất theo tương quan sức + có kẻ dẫn đầu), `TickDiplomacy`, `LeaderKingdom` (≥ 45 % ô) | Thẻ NGOẠI GIAO trên bản đồ. Đình chiến: `TryOrder` chặn, `IsFrontier/ThreatOn/BestTarget` bỏ qua nước đình chiến. Hai nước không dẫn đầu tự đình chiến 4 lượt và `BestTarget` ×1.6 cho ô của kẻ dẫn đầu. Vua máy xin đình chiến khi bị ép (không ép người chơi). |
| 7 Nuôi quân | `UpkeepOf` = ⌈lính/5⌉ vàng/lượt (kể cả quân hành quân), `NetGoldOf`, `CollectIncome` | Âm vàng → mỗi ô mất 10 % quân + tin. Máy giữ `reserve = 10 + upkeep` và không mộ thêm khi `NetGoldOf < 0`. Thanh trên hiện «thu − nuôi quân». |
| 8 Cấp tướng | `General.xp/level/XpToNext`, `GrantXp` trong `Settle` | Thủ thắng +2 cho tướng giữ ô; ô xuất quân chiếm được +3, cướp thắng +1 cho tướng giữ ô xuất quân. Lên cấp: +1 chỉ số ngẫu nhiên (tối đa 5), tin trong `Events`. |
| 9 Trung lập | `NeutralTurn`, `City.raidedTimes` | Bị cướp ≥ 2 lần → thành ô nổi dậy (+3 quân). Kề đúng một nước → 8 %/lượt xin theo nước đó. |
| 10 Art bản đồ | `Resources/Campaign/Map_ThreeKingdoms` + 5 icon | Có file là nạp; nền vẽ theo zoom/pan. Đơn art: WeaponArt-ChatGPT-Prompt.md mục 11b. |
| 11 Zoom · tổng kết | bản đồ: lăn chuột 1–2.5×, chuột phải/giữa kéo, phím mũi tên; `DrawSummary` | Tổng kết mở ở đầu mỗi lượt mới (mọi trận + mọi tin), Space/Esc đóng. `Point()` = tâm + (điểm − tâm)·zoom + pan; mọi thứ vẽ trong `GUI.BeginGroup`. |
| 12 Tan rã | `CampaignBattleMode.CheckOutcome`, `_routRatio 0.25` | Bên còn < 25 % quân lúc vào trận VÀ ít hơn nửa đối phương → tan rã (thủ còn cần toà thành < 60 % máu). Quân sống sót vẫn đếm về chiến dịch. |
| 13 Xe công thành | `City.siegeEngines` (trại, tối đa 3, 20 vàng + 15 gỗ), `Order.engines` (đi theo tấn công, tối đa 2), `CampaignBattleContext.SiegeEngines`, mode `SpawnSiegeEngines` từ `SiegeEngineCatalog` (builder `BuildSiegeCatalog`) | Tự quyết: +3 sức/xe khi ô có tường, +1 khi không. Trên sân: xe phá cổng → máy bắn đá → nỏ, tổ lái do playbook Siege (`SiegeCrew`) lo. Chiếm ô thì xe ở đó mất; xe không về khi thua. |
| 14 Trống trận | `StickmanAmbience.SetBattle(1)` lúc XUẤT TRẬN, 0 khi kết thúc | Dùng lớp nền battle sẵn có của dự án — không thêm nhạc mới (art/nhạc là việc đặt ngoài). |

⚠ Chưa chơi thử đợt này. Trong lúc làm, phiên khác đang sửa `CampGameUi/CampBuildYard/CampGeneral*` nên
Gameplay có lúc không biên dịch được vì file của họ — không phải lỗi của bộ Tam Quốc.

### 8. Bảy hệ tính năng của chiến dịch (2026-09-08 khuya)

Yêu cầu: *"cải thiện thêm tính năng cho chế độ chơi này"*. Bảy hệ dưới đây thêm vào tầng chiến
lược; mỗi hệ nằm trong MỘT file phần của `ThreeKingdomsCampaign` (trần 800 dòng — mục 7c).

| Hệ | File | Luật rút gọn |
|---|---|---|
| **Mùa** | `.Seasons.cs` | Năm 12 lượt, mùa 3 lượt. Xuân +25 % gỗ · Thu +25 % vàng · Đông −30 % cả hai và quân NGOÀI TRẠI (hành quân, vây thành) hao 8 %/lượt. |
| **Lòng dân** | `.Unrest.cs` | 0..100, thu nhập × (0.6 + 0.4·lòng dân). Ô vừa chiếm còn 30 → thu ít và có thể NỔI LOẠN về tay phe trắng. Giữ bằng đồn trú ≥ 5, tháp, tướng cai trị, hoặc chi 15 vàng «Phủ dụ». Kinh đô không nổi loạn. |
| **Cựu binh** | `.Veterancy.cs` | Ô có cấp 0..3; thắng trận thì lên cấp, +10 % sức mỗi cấp. Trong màn 2D: cấp trang bị 1..4 và +8 % máu mỗi cấp. Mua tân binh nhiều hơn quân cũ thì TỤT một cấp (trừ tướng «Tinh binh»). |
| **Vây thành** | `.Sieges.cs` | Lệnh thứ tư bên cạnh điều/đánh/cướp, chỉ dùng được với ô CÓ tường hoặc tháp. Mỗi lượt: trong thành −10 % quân và −8 lòng dân, ngoài thành −4 % quân, xe công thành đục 1 lớp tường mỗi 2 lượt. Tối đa 6 lượt. Người chơi bấm «Tổng công kích» hoặc «Bỏ vây»; máy tự quyết theo tương quan. |
| **Tù binh** | `.Captives.cs` | Thua trận mà tướng có mặt → 35 % bị bắt, tướng RỜI bản đồ. Bên bắt: đòi chuộc (lấy vàng của nước kia), chiêu hàng (xác suất giảm theo cấp, tăng nếu nước cũ đã mất), hoặc thả (được đình chiến 2 lượt). Giữ quá 5 lượt phải thả. |
| **Kỹ năng tướng** | `.Perks.cs` | Lên cấp 2 chọn 1 trong 2: Mãnh tướng (+20 % công) · Trấn thủ (+25 % thủ) · Trị dân (+2 lòng dân, +15 % vàng) · **Thần tốc (quân từ ô này tới nơi NGAY)** · Tinh binh (không loãng cựu binh). Tướng máy tự chọn theo tính cách. |
| **Tỉ lệ thắng** | `.Odds.cs` | Suy ĐÚNG từ mô hình `AutoResolve` (mỗi bên nhân ngẫu nhiên ±15 %), nên con số hiện ra là thật. Hiện ở bảng hỏi trận, lúc ra lệnh, và khi đang vây. |

⚠ **Thêm trường mới vào `City`/`General` là phải thêm vào `Snapshot`** (`.Save.cs`), không thì
chơi đúng mà TẢI LẠI là mất. Doctor có phép đo canh đúng việc này (mục 7c, bảng phép đo).

⚠ **Thứ tự nhịp cuối lượt có ý nghĩa** (`.Turn.cs`): vây thành siết TRƯỚC (có thể sinh trận vào
hàng chờ) → lòng dân (ô đang bị vây tụt nhanh hơn) → mùa đông hao quân → tù binh → sự kiện.
Đảo thứ tự là đổi luật chơi.

**Sự kiện ngẫu nhiên** (`.Events.cs`, 35 %/lượt): dịch bệnh · thổ phỉ cướp kho · bão đổ rừng ·
sao chổi (lòng dân cả nước) · được mùa · hiền sĩ xin theo (thêm tướng vào kho thuê) · thương
nhân Tây Vực (tặng Chuồng ngựa). ⚠ Mùa đông chỉ bốc trúng chuyện xấu.

**Đo lại**: «★ Tự kiểm luật chơi» có 7 nhóm phép thử mới cho đúng bảy hệ này; «Mô phỏng chiến
dịch Tam Quốc» chạy 30 lượt × 3 nước để xem hệ mới có làm một nước thắng quá nhanh không.

### 9. Ba đợt «chiến thuật · AI · sửa lỗi» (2026-09-08 khuya, sau khi soát lại)

#### 9a. Sáu lỗi đã sửa — đọc trước khi sửa lại mấy chỗ này

| Lỗi | Vì sao nó xảy ra | Cách chốt |
|---|---|---|
| Lòng dân bị trừ **hai lần** khi bị vây | `TickSieges` trừ 8 và `OrderDeltaOf` cũng trừ 8 | **Chỉ `TickPublicOrder` được đổi lòng dân.** Nơi khác muốn tác động thì thêm vế vào `OrderDeltaOf` để bảng hiện đúng con số |
| Cựu binh tụt nhiều cấp một lượt | `recruitedThisTurn` là số TÍCH LUỸ, mua lính thứ 4·5·6 đều thoả điều kiện | cờ `City.dilutedThisTurn`, reset mỗi lượt |
| Vây thành không phong toả gì | `TryRecruit`/`TryBuild`/`TryOrder` không hỏi `IsBesieged` | ba cửa đó chặn; thu nhập ô bị vây × 0.35 |
| AI có thước đo riêng | `AiManageCity` so `power >= need × ratio`, người chơi nhìn `WinOdds` | AI hỏi **đúng `WinOddsOf`**; ngưỡng theo tính cách tướng + `KingdomStyle.oddsBias` |
| Vua máy ngồi lì kinh đô | vòng dời tướng loại `g.isKing` | vua máy ra trận khi nhà yên (`ThreatOn(seat) == 0`) |
| Tù binh của nước đã diệt vong trôi lơ lửng | `ReleaseTo` đặt `cityId = -1` | không còn nhà thì theo luôn người bắt |

#### 9b. Chiến thuật — bốn hệ mới

| Hệ | File | Ý |
|---|---|---|
| **Khắc chế binh chủng** | `.Composition.cs` | Tam giác **KỴ xé CUNG · CUNG bắn BỘ · BỘ chặn KỴ** (+40/30/35 % theo tỉ lệ loại bị khắc bên kia). Tường: kỵ công ×0.5, cung thủ trên tường ×1.4. Đồng trống: kỵ ×1.25. **Ba nơi (`AutoResolve`, thanh tỉ lệ, tướng máy) cùng gọi `EffectiveStrength`** — không có thước đo thứ hai. |
| **Sông Trường Giang** | `.Rivers.cs` | Cờ trên CẠNH, không phải loại ô mới. Đánh qua sông: ×0.75 và kỵ mất lợi thế đồng trống. Tám khúc chia Bắc–Nam, nên Ngô thủ sông và Ngụy phải trả giá để xuống. |
| **Tiếp tế** | `.Supply.cs` | Ô có tiếp tế = loang được về kinh đô qua ô nhà KHÔNG bị vây. Mất tiếp tế: thu 40 %, **không mộ lính**, lòng dân −5, quân hao 5 %/lượt. Tính bằng BFS mỗi lượt, KHÔNG cache vào ô (đổi chủ một ô là cả dây đổi). |
| **Sương mù · do thám** | `.Fog.cs` | Thấy rõ = ô mình · ô kề ô mình · ô đang vây · ô vừa do thám (10 vàng, 3 lượt). ⚠ **Che ở TẦNG VẼ**: luật giữ số thật, bản đồ hỏi `IsVisible` rồi mới quyết in gì. ⚠ AI không bị che (quy ước chung của thể loại). |

**Trận pháp nay ăn cả ở tầng bản đồ** (`.Formations.cs`): mỗi trận pháp chỉ lợi trong đúng hoàn
cảnh của nó (Hạc Dực khi đông hơn · Ngư Lân khi thủ · Phương Viên khi ít quân · Trường Xà khi
nhiều kỵ · Bát Quái đều đều). Chọn ở bảng hỏi trận, dùng cho cả «Tự quyết» lẫn màn 2D.

#### 9c. AI — một tầng trên từng ô

`.Plans.cs` thêm **kế hoạch cấp nước**, mỗi lượt chọn đúng một việc lớn:

- **THỦ** khi có ô nhà thiếu sức thủ (kinh đô nhân 1.6): ô kề dồn 70 % quân về, ô khác **không
  xuất quân đi đâu**, và mọi vòng vây của nước đó **bỏ để về cứu nhà**.
- **CÔNG**: chọn một mục tiêu chung (giá trị / sức thủ, ×1.6 nếu là ô của kẻ dẫn đầu, ×1.5 nếu
  là ô vừa mất, ×0.7 nếu phải qua sông) và một **ô TẬP KẾT**; ô quanh tập kết dồn 60 % quân về,
  ô tập kết đánh đúng mục tiêu đó khi đủ cửa thắng.

⚠ Đây là vế bản cũ thiếu: mỗi ô tự quyết một mình thì hai ô mười quân KHÔNG BAO GIỜ hợp lại để
lấy một ô hai mươi quân — cả hai cùng thấy "chưa đủ sức" rồi cùng ngồi im.

**Tính cách ba nước** (`KingdomStyle`): Ngụy dám đánh hơn (ngưỡng −0.08) · Thục đắp tường sớm ở
mọi ô biên giới, thích kỵ binh · Ngô xây kinh tế trước, dựa sông mà thủ.

**Trong màn 2D**, mỗi phe nay có HAI lệnh thay vì một (`TeamOrder.share`):
- thủ: 40 % lên tháp/sàn thành (`AIBehavior.Garrison`), phần còn lại giữ cổng và toà thành;
- công: 45 % mũi PHÁ CỬA nhắm cổng/tháp (`targetsStructures`), phần còn lại vào đốt toà thành.
Kỹ năng tướng ăn vào máu quân: «Mãnh tướng» +10 % cho bên công, «Trấn thủ» +15 % cho bên thủ.

#### 9d. Còn nợ (cố ý chưa làm)

- **Quân đoàn dã chiến** đi nhiều bước trên bản đồ: đổi hẳn mô hình "quân nằm trong ô", đáng một
  đợt riêng.
- **Thuỷ chiến thật** (thuyền, bến, chở quân): dự án có sẵn hệ naval nhưng nối vào chiến dịch là
  một hệ mới, không phải một cờ trên cạnh như `.Rivers.cs`.
- **Tinh thần từng cánh quân** trong màn 2D: hiện chỉ có luật tan rã cấp trận.

### 10. Đợt «một đại lượng — một nơi ghi» (2026-09-08 cuối ngày)

#### 10a. Bốn lỗi, và cái luật rút ra từ hai lỗi đầu

| Lỗi | Cách chốt |
|---|---|
| Lòng dân bị ghi ở ba nơi (tiếp tế trừ thẳng, bảy sự kiện cộng trừ thẳng) nên **bảng dự báo nói dối** | `AdjustOrder` / `ResetOrder` trong `.Unrest.cs` là **cửa duy nhất**; tác động lâu dài phải thêm vế vào `OrderDeltaOf` để bảng cũng thấy |
| Đệm tiếp tế không xoá khi ô đổi chủ vì **nổi loạn** hoặc **xin theo** | `SetOwner` là **cửa duy nhất** ghi `City.owner`, và nó xoá đệm |
| Thu nhập tính bằng dây tiếp tế của **lượt trước** | `InvalidateSupply()` chạy TRƯỚC `CollectIncome` |
| 40 % quân thủ đứng không ở ô **không tường không tháp** | chỉ chia vai «lên tháp» khi `Towers > 0 \|\| Walls > 0` |

⚠⚠ **LUẬT: MỘT ĐẠI LƯỢNG — MỘT NƠI GHI.** Hai lỗi đầu là cùng một lỗi, cách nhau vài giờ, và cả
hai lần biên dịch đều XANH. Doctor nay có phép đo «Một đại lượng — một nơi ghi» quét mọi file
`ThreeKingdomsCampaign.*` tìm câu gán thẳng vào `.order` / `.owner` ngoài cửa cho phép. Thêm một
đại lượng có cửa riêng thì thêm một dòng vào bảng `guarded` của phép đo đó.

#### 10b. Ba thứ mở rộng

| Thứ | File | Ý |
|---|---|---|
| **Độ khó** | `.Goals.cs` | DỄ (mình +50 % thu, máy dè dặt) · THƯỜNG · KHÓ (máy +35 % thu, dám đánh hơn). Chọn ở màn mở, ăn vào `IncomeScaleOf` và ngưỡng đánh của máy. |
| **Mục tiêu** | `.Goals.cs` | Năm cái đích gần có thưởng: yên trong nhà · mở cõi 10 ô · quân tinh nhuệ · bắt tướng · diệt một nước. Chấm cuối mỗi lượt, thẻ MỤC TIÊU hiện tiến độ. ⚠ Thưởng đủ để chú ý, không đủ để thắng hộ. |
| **Nhân vật người chơi** | `.King.cs` | Vua được kinh nghiệm khi CÓ MẶT trong trận (thắng 3, thua 1) nên có lý do ra tuyến đầu; sắm trang bị bốn bậc ở kinh đô → trong màn 2D cầm đồ cấp cao hơn và dày máu hơn. |

**Tướng máy nay mua lính THEO MỤC TIÊU**: mục tiêu có tường thì bớt kỵ binh (còn ¼ ý thích) và
tăng cung thủ lên 55 % — trước đây nó cứ mua ngựa theo thói quen rồi đứng nhìn bức tường.

**Bảng tỉ lệ cho mọi ô địch kề**: chọn một ô của mình là thấy ngay thanh phần trăm cho từng ô
địch bên cạnh, kèm chữ «qua sông». ⚠ Trước đây bảng hiện «sức thủ» tính theo một đạo quân TRUNG
BÌNH giả định, còn thanh tỉ lệ tính theo đạo quân THẬT — hai con số cạnh nhau, khác nhau, không
ai giải thích.

#### 10c. Lưới cân bằng (thay cho việc chưa chạy được ván nào)

`StickmanSelfTest` › «LƯỚI CÂN BẰNG khắc chế binh chủng» canh hai ngưỡng tối thiểu để game còn
chơi được:
- quân **cân đối gấp ba** quân thủ phải có ≥ 50 % cửa thắng trước thành hai tường hai tháp;
- quân **toàn kỵ** cùng quy mô phải kém hơn rõ rệt (đó là toàn bộ ý của khắc chế).

Hỏng một trong hai câu đó nghĩa là số trong `.Composition.cs` đã chỉnh quá tay: hoặc công thành
thành bất khả thi (cả bản đồ đứng im), hoặc khắc chế mất tác dụng.

### 11. Đợt «danh tướng · đơn đấu · cờ trống · mưu kế · động tác» (2026-09-08, khuya)

Yêu cầu: *"Chế độ tam quốc có gì thêm mới, thêm ý tưởng giúp tôi, AI, gameplay, animation thêm
hết vào"*. Năm hệ dưới đây lấp năm chỗ trống mà chín đợt trước để lại.

#### 11a. Vì sao năm hệ này chứ không phải năm hệ khác

| Chỗ trống trước đợt này | Đo được ở đâu |
|---|---|
| **21 danh tướng chỉ là 21 CHUỖI KÝ TỰ** — `MakeGeneral` bốc chỉ số ngẫu nhiên 0..3 cho cả ba mặt, nên Quan Vũ ra Dũng 1 được; trên sân họ là một lính cận chiến máu dày cầm cây mặc định của nền | `ThreeKingdomsCampaign.Generals.cs` cũ · `CampaignBattleMode.SpawnGeneral` cũ |
| **Không có đơn đấu** — hình ảnh biểu tượng nhất của Tam Quốc không tồn tại trong cả bốn màn | không có class nào |
| **Sĩ khí là đồng hồ đếm ngược** — `StickmanAgent` có đủ hệ sĩ khí nhưng chỉ MỘT đường làm nó tụt (đồng đội chết gần) và MỘT đường hồi (đứng yên hậu phương); người chơi không có nút nào tác động | `StickmanAgent.LoseMorale` / `UpdateMorale` |
| **Chiến dịch không có MƯU** — có quân, tiền, tường, vây, tiếp tế, mùa, lòng dân; chỉ số `command` chỉ ăn vào vài phép nhân sức | không có class nào |
| **Tướng KHÔNG BAO GIỜ ra trận cùng quân** — `SetBattle` đặt `AttackerGeneral = ""` cứng | `CampaignBattleContext.SetBattle` cũ |

#### 11b. Danh tướng — `ThreeKingdomsHeroes.cs`

Bảng 21 hàng: biệt hiệu · **binh khí** · **tuyệt kỹ** · chỉ số SÀN · có cưỡi ngựa không.

- Chỉ số là **SÀN**, không phải giá trị chốt: `MakeGeneral` vẫn bốc ngẫu nhiên rồi NÂNG lên cho
  đủ sàn (`FloorsOf`). Tướng không có trong bảng trả 0/0/0 → hành vi cũ y nguyên.
- **Binh khí trỏ bằng TÊN, không bằng chỉ số** (`StickmanWeaponHolder.EquipNamed`): kho vũ khí
  của một nhân vật dựng lại mỗi lần và bị lọc theo thể loại + nền, nên "cây thứ 7" không cố
  định. ⚠ `EquipNamed` **trả false là bình thường** (cây không có trong kho / bị lọc thể loại /
  đang cưỡi ngựa nên quá ngắn) — tướng giữ cây mặc định, thà cầm nhầm cây còn hơn ra trận tay
  không. Ba mưu sĩ dùng `WarFan` là ca dễ rơi vào đây nhất.
- **Tám tuyệt kỹ, không phải 21**: mỗi chiêu cần một dáng thân dựng tay 6–10 khung. 21 dáng thì
  hoặc chúng na ná nhau (đúng bẫy «30/45 nón là hai đường bao tô lại») hoặc số bịa cho đủ bảng.
  Tám lối đánh khác nhau ở **HÌNH VÙNG ĐÁNH** — vòng · vệt dài · lướt · nổ quanh mình · bắn xa ·
  quạt lửa · gồng · liên hoàn — thì mắt đọc ra ngay; hai tướng chung lối vẫn khác binh khí, chỉ
  số và TÊN CHIÊU riêng (`skillName`).
- Thi triển: `ThreeKingdomsHeroSkill` (Gameplay). ⚠ **KHÔNG dùng lại `MartialArtist` của Võ lâm**:
  nó bắt buộc có `MartialQi`, mà Tam Quốc không có nội lực. Nới `MartialArtist` cho "khí tuỳ chọn"
  là phá luật của Võ lâm (KHÔNG KHÍ = KHÔNG CHIÊU là cả thiết kế). Chỉ khuôn quét vùng đánh là
  **chép có ý thức** từ `MartialArtist.Strike` — sửa luật quét một bên thì soát bên kia.
- Tướng máy tự bấm chiêu khi CÓ ĂN (đủ số địch trong tầm; chiêu gồng thì bấm lúc máu < 55 %).
  Không có chốt đó là ông tướng đốt Thanh Long trảm vào khoảng không ở giây đầu trận.

#### 11c. Đơn đấu 單挑 — `ThreeKingdomsDuel.cs`

Nút «KHIÊU CHIẾN [K]» → bên kia gật/lắc → hai đạo quân đứng lại → hai tướng ra giữa, **bái nhau**
→ đánh → kẻ thua ngã thì quân bên đó **vỡ sĩ khí 55 %**, bên thắng hồi 27 %.

- **Đã có `ChampionDuel` — vì sao không dùng lại**: nó là một `MatchModeBase`, tức CẢ MỘT MÀN có
  luật thắng thua riêng và mốc bake sẵn. Ở đây câu hỏi khác hẳn: một trận công thành ĐANG DIỄN RA
  phải tạm dừng được rồi đánh tiếp. Chung ý tưởng, không chung được dòng nào.
- **AI gật hay lắc** theo ba vế đọc được: chênh Dũng (±0.18/điểm) · tính cách (hiếu chiến +25 %,
  thận trọng −25 %, VUA −35 % trừ khi hiếu chiến) · máu dưới 60 % thì né. **Từ chối vẫn có giá**:
  bên từ chối mất 15 % sĩ khí — khiêu chiến không bao giờ vô ích.
- ⚠ **HẠN GIỜ Ở MỌI PHA** (chờ trả lời 1.6 s · ra điểm hẹn 14 s · bái 1.3 s · đấu 45 s). Hai ông
  tướng kẹt hai bên một bức tường mà không có hạn giờ là **cả trận đứng hình vĩnh viễn**, không
  lỗi nào báo.
- ⚠ **`CommandAuto()` khi tan.** Giữ quân bằng `CommandHold` là LỆNH TAY, mà lệnh tay KHOÁ tướng
  máy tới khi ai đó bấm «Tự động» (§3). Quên thả = hai đạo quân đứng nhìn nhau tới hết giờ.
- Điểm hẹn là **trung điểm GIỮA HAI NGƯỜI**, không phải giữa sân — giữa sân có thể nằm trong tường.
- Nối vào hai chỗ, bằng hai cách khác nhau vì lý do khác nhau:
  · **Demo_54** (`CampaignBattleMode.Duel.cs`) ghi danh NGAY TẠI CHỖ SINH tướng — chắc chắn nhất.
  · **Demo_51/52** (`ThreeKingdomsMode.Duel.cs`) phải TÌM trong scene: ba vua được bake sẵn bởi
    builder. Hợp đồng: `FieldCommander` **và** tên bắt đầu bằng `Tuong_` (hai điều kiện — cái
    nhãn một mình còn gắn cho tổ trưởng ở màn khác). Tên hiển thị suy TỪ PHE, không đọc ngược
    từ tên GameObject. Tìm được < 2 người thì **log cảnh báo và tắt hẳn** — không để nút hiện
    ra mà bấm không ra gì.

#### 11d. Cờ hiệu · trống trận — `ThreeKingdomsStandard.cs` + sổ `WarStandards` (Core)

Hai cái van cho hệ sĩ khí: một cái người chơi **mua được**, một cái người chơi **chặt được**.

| | bán kính | nhịp | hồi mỗi nhịp | cờ đổ |
|---|---|---|---|---|
| CỜ `Banner` | 9 | 2.5 s | 12 % | −30 % cả phe |
| TRỐNG `Drum` | 16 | 3.5 s | 22 % | −22 % cả phe |

- ⚠ **Cắm lên LÍNH THẬT, và lính đó chết được.** Đó là toàn bộ ý: AI địch có ô điểm ưu tiên chặt
  cờ, và cờ đổ thì cả tuyến ăn cú sốc. Làm chúng thành prop bất tử = biến hệ hai chiều thành một
  cái buff đứng im.
- ⚠ **`_fallenAnnounced` không bỏ được**: `Update` vẫn chạy trên cái xác, nên thiếu cờ chặn là
  phe mình ăn cú sốc MỖI FRAME và vỡ sạch trong nửa giây.
- **Sổ `WarStandards` ở Core**, không ở Gameplay: bảng chấm điểm mục tiêu nằm ở `StickmanAgent`
  (module 2) còn cờ hiệu ở module 4, và AI không được tham chiếu lên. Đúng cách `ContestedZones`
  giải bài toán y hệt cho điểm chiếm. Ô điểm **4** — THẤP hơn `zoneTargetBonus` (5) có chủ ý:
  chặt cờ đáng làm khi lá cờ ở trước mặt, KHÔNG đáng bỏ vị trí băng nửa sân.
- Cửa trừ sĩ khí từ ngoài: **`StickmanAgent.ShockMorale`** (cặp đối xứng của `RecoverMorale`).
  Trừ thẳng `_morale` từ ngoài là đúng hai lỗi đã trả giá ở mục 9a và 10a.

#### 11e. Mưu kế — `ThreeKingdomsCampaign.Stratagems.cs`

Bốn kế, mỗi kế đổi **một thứ khác loại** — không phải bốn phép nhân sức khác tên:

| Kế | Giá | Đòi | Trên bản đồ | Trên sân (Demo_54) |
|---|---|---|---|---|
| 火計 HOẢ CÔNG | 25v | Chỉ huy 3 · **không dùng được mùa ĐÔNG** | quân xuất phát từ ô này +30 % | ba đám `AreaHazard.Fire` cháy 14 s trước tuyến thủ |
| 伏兵 PHỤC KÍCH | 20v | Chỉ huy 2 | thủ ô này +35 % | cả tuyến thủ đổi sang `AIBehavior.Ambush` |
| 空城計 KHÔNG THÀNH KẾ | 15v | Cai trị 3 · đồn trú ≤ 3 | **tướng máy ĐỌC** sức thủ ×3 | không có gì — cố ý |
| 離間計 LY GIÁN | 40v | tướng mình Chỉ huy ≥ 4 | tướng địch bị **nghi kỵ 3 lượt** | không có gì |

- ⚠⚠ **`PerceivedDefenceOf` là chỗ DUY NHẤT được trả về con số khác sự thật**, và chỉ được gọi
  từ tầng QUYẾT ĐỊNH của AI. Nhét nó vào `AutoResolve` hay thanh tỉ lệ là không thành kế biến
  thành buff thủ ×3 — kế lừa hoá ra lừa cả luật chơi. Nó **không có tác dụng với người chơi**:
  người chơi tự nhìn thấy đồn trú thật, và có quyền không mắc lừa.
- ⚠ **Không thành kế cố ý KHÔNG có vế trên sân** (`CampaignBattleMode.Stratagem.cs`) — cùng lý do.
- Ly gián chặn ở **đầu `AiManageCity`**, một chỗ duy nhất: `EndTurn` gọi cho nước người chơi và
  `AiTurn` gọi cho hai nước máy — chốt đặt ở một trong hai chỗ là kế chỉ ăn với một nửa số nước.
- Cửa ghi duy nhất: `SetPlot`/`ClearPlot` cho `City.plot`·`plotTurns`, `Suspect` cho
  `General.suspectTurns`. `SetOwner` **xoá kế** khi ô đổi chủ.
- `TickPlots()` đếm lùi **SAU** khi mọi trận trong lượt đã xử — kế bày lượt này phải còn hiệu lực
  cho chính trận của lượt này.

#### 11f. Tướng dẫn quân — `Order.escort`

Trước đợt này tướng CHỈ giữ ô, nên phe công không bao giờ có tướng trên sân và **đơn đấu không
thể xảy ra trong chiến dịch**. Nhưng `Settle` thì ĐÃ coi tướng ô xuất phát (`sender`) là người
chỉ huy trận (cộng xp khi thắng, bị `TryCapture` khi thua) — mô hình đã nửa chừng. `escort` nối
nốt: tướng **ra sân**, thắng thì **dời theo quân** sang ô vừa chiếm.

- Nút ☐/☑ ở bảng ô, chỉ hiện khi ô THẬT SỰ có tướng máy rảnh. Cờ nằm ở bản đồ và **tự tắt** khi
  chọn sang ô không có ai đi được.
- Dòng báo đọc lại cờ **từ lệnh vừa ghi** (`OrderOf(from).escort`), không in lại ý muốn: `TryOrder`
  có thể đã bỏ cờ, và in theo ý muốn là người chơi tưởng Quan Vũ đang trên đường mà ông ở nhà.
- Tướng máy tự dẫn quân khi cửa thắng rộng (hiếu chiến: ngưỡng +0.05; còn lại: ≥ 78 %) **và**
  nhà không bị đe doạ.

#### 11g. Động tác — `StickmanActionSetBuilder.ThreeKingdoms.cs` (13 clip)

**KHÔNG một `StickmanActionType` nào mới**: 8 tuyệt kỹ là style của `AttackBody`, 3 lễ nghi
(`tk_challenge` · `tk_salute` · `tk_triumph`) là style của `Cheer`, `tk_banner` là style của
`Idle`, `tk_drum` là style của `Work`.

- ⚠ **MỌI CLIP `weight = 0`** — để > 0 là lính Trung cổ thỉnh thoảng giương Thanh Long đao, hoặc
  zombie đứng ôm quyền bái nhau.
- ⚠ Hai trần đo được, đã ĐO bằng script trước khi mở Unity: |ikArm| max **1.307** < 1.396
  (`ClampToReach` 95 % của tầm với 1.469) · bodyAngle max **36°** ×1.6 (bộ Boss) = 57.6 < 110
  (`SpinThreshold`).
- ⚠ **`weighty` đi theo dạng NỀN + HỆ SỐ**, không nhân thẳng vào toạ độ tay. `weighty` chạy 0
  (bộ Agile) → 1.4 (bộ Boss); bản đầu viết `-1.10f * weighty` nên bộ Boss ra |ikArm| ≈ 1.54
  (tay duỗi đơ) còn bộ Agile ra 0 (tay sụp vào thân). Dạng đúng: `-(0.90f + 0.12f * weighty)`.
- ⚠ **Tên style là HỢP ĐỒNG** với `ThreeKingdomsHeroes` · `ThreeKingdomsDuel` · `ThreeKingdomsStandard`.
  Sai một chữ thì `Pick` không tìm thấy và **rơi về dáng ngẫu nhiên — không lỗi nào báo**.

#### 11h. Hai phép đo mới, và một phép đo cũ ĐÃ CÂM

`StickmanDoctor.Invariants.cs`:

1. **«Tam Quốc: động tác đã bake chưa»** (MỚI) — rút 13 tên style THẲNG từ builder (không kê bảng
   thứ hai) rồi soi `ActionSet_Soldier.asset` đã bake. Đây là bẫy im lặng nặng nhất của đợt này:
   quên bấm «Dựng 4 bộ động tác» thì chiêu vẫn ra, đơn đấu vẫn chạy, chỉ là bằng dáng ngẫu nhiên.
2. ⚠⚠ **«Chiến dịch: trường mới có được lưu không» CHƯA TỪNG ĐO GÌ.** Nó đọc `Save()`/`Load()`
   từ `ThreeKingdomsCampaign.cs`, nhưng hai hàm đó ở file phần `.Save.cs` từ hôm tách file (mục
   7c) — `Section` trả null và hàm **thoát ngay dòng đầu**. Phép đo canh đúng cái bẫy mà mục 8
   dán ⚠ to nhất ("thêm trường mà quên lưu") đã im lặng từ lúc tách file. Đã sửa: đọc Save/Load
   từ `.Save.cs`, và gộp cả `Pack(General)`/`Unpack(GeneralData)` (chúng nằm NGOÀI thân Save/Load
   — không gộp thì mọi trường của `General` đều bị báo thiếu). Mẫu regex cũng phải thêm `(?!>)`
   để bỏ property thân biểu thức, không thì 8 property suy-ra-được bị báo thiếu lưu.

   **Bài học: một phép đo im lặng không chạy còn tệ hơn không có phép đo — vì nó làm bảng khám
   xanh.** Tách file mà không chạy lại phép đo là cách chắc chắn nhất tạo ra loại này.

#### 11i. Đo lại

```
Tools > Stickman > ★ Bảng điều khiển
  1. Rig & Animation › «Dựng 4 bộ động tác toàn thân»   → BẮT BUỘC: 13 style tk_* chưa có trên đĩa
  2. «Tam Quốc dàn trận — Demo_51»                       → dựng lại (ba vua nay có binh khí + tuyệt kỹ)
  3. «Tam Quốc chiến dịch — Demo_53 + Demo_54»           → dựng lại
  4. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN»            → hai phép đo trên phải XANH
  5. «Mô phỏng chiến dịch Tam Quốc — 30 lượt × 3 nước»   → xem mưu kế + tướng dẫn quân có làm một nước thắng quá nhanh không
```

Trạng thái 2026-09-08 khuya: `Verify.ps1` XANH (0 lỗi biên dịch; lỗi còn lại trong
`WuxiaScripture.cs` / `MobaHero.cs` là của phiên khác đang sửa dở). Hai trần động tác đã ĐO bằng
script Python; phép đo style đã mô phỏng và cho đúng kết quả mong đợi (13/13 thiếu, vì asset chưa
bake lại — đối chứng: 8 style Võ lâm CÓ trong asset). **CHƯA bấm các nút trên** và **chưa chơi thử**.

### 12. Đợt «soát lại đợt 11» (2026-09-09) — bốn chỗ nối thiếu, không phải bốn tính năng mới

Yêu cầu: *"kiểm tra xem đã đầy đủ chưa, thêm tính năng và sửa lỗi"*. Soát lại năm hệ của mục 11
thì cả năm **biên dịch xanh và đều đúng**, nhưng bốn trong số đó chưa có đường chạy tới ở màn
chính. Đây là họ lỗi đắt nhất của dự án: *viết xong nhưng KHÔNG AI GẮN.*

#### 12a. Bốn chỗ, và triệu chứng trong game

| Chỗ nối thiếu | Trong game thấy gì | Vá ở đâu |
|---|---|---|
| `ThreeKingdomsStandard` chỉ được **Demo_54** cắm | Demo_51 · Demo_52 chạy cả trận **không lá cờ nào** — sĩ khí lại là đồng hồ đếm ngược của trước mục 11, và ô điểm «chặt cờ» không bao giờ được chấm | `ThreeKingdomsMode.Standards.cs` (mới) |
| event `Fell` **không ai nghe** | cú sốc 22–30 % ập xuống cả tuyến, người chơi chỉ thấy "tự nhiên quân mình bỏ chạy" | `OnStandardFell` ở cả hai trọng tài |
| `WarStandards.TeamHasStanding` viết cho "HUD đọc" mà **không HUD nào đọc** | không đọc được nước nào sắp vỡ | `DrawStandardBar` |
| `Attach` gọi `SetKind` **SAU** khi `AddComponent` đã chạy `OnEnable` | người khiêng **trống** đứng **giương cờ** suốt trận và dội nhịp theo bộ số của cờ (2.5 s thay vì 3.5 s) | `SetKind` nay ghi lại dáng + nhịp |

⚠ **`AddComponent` chạy `Awake` + `OnEnable` NGAY TRONG DÒNG ĐÓ.** Mọi hàm `Setup`/`SetKind` gọi
sau nó đều là "đổi cấu hình lúc chạy", không phải "cấu hình trước khi bật" — nên chúng phải tự
áp dụng lại thứ mà `OnEnable` đã làm. Bẫy này im hoàn toàn: không lỗi, không warning.

#### 12b. `WuxiaMode` réo cảnh báo oan — `UsesThreeKingdomsRituals`

`WuxiaMode : ThreeKingdomsMode`, nên `Start` của Tam Quốc chạy luôn cho màn sáu phái. Chưởng môn
đặt tên `ChuongMon_` chứ không `Tuong_`, nên `SetUpDuel` tìm được 0 người rồi **log cảnh báo mỗi
lần vào màn Võ lâm**, bảo người chơi đi *"dựng lại «Tam Quốc dàn trận — Demo_51»"*.

Cổng `protected virtual bool UsesThreeKingdomsRituals` (mặc định `true`, `WuxiaMode` trả `false`)
chặn cả đơn đấu lẫn cờ trống. ⚠ **Báo động giả là thứ AGENTS.md cấm thẳng** — bảng bị réo oan là
bảng không ai đọc nữa. Đơn đấu chưởng môn là việc đáng làm nhưng là **đợt riêng**: sáu phái có
`MartialArtist` + nội công, luật thắng thua khác hẳn hai ông tướng cầm đao.

#### 12c. Cắm cờ ở màn bake sẵn — ba luật chọn người

Demo_51/52 **bake quân vào scene**, không sinh lúc chạy, nên không có chỗ "cắm ngay lúc sinh" như
Demo_54. `RaiseStandards` đi tìm trong `TeamMember.All`, và:

- **chọn người gần NHÀ nhất**, không phải người đứng mũi: cờ hiệu đi SAU tuyến (bán kính 9 phủ
  hàng trước từ phía sau); vác cờ đứng mũi thì chết trong mười giây đầu và cả nước ăn cú sốc 30 %
  trước khi giao tranh thật sự bắt đầu; và để địch chặt được cờ thì phải **đánh xuyên** tuyến —
  đó mới là lúc ô điểm ưu tiên của `StickmanAgent` có nghĩa;
- **không cắm lên chủ tướng** (`FieldCommander`): ông ấy phải ra đơn đấu, lúc đó cả đạo quân đứng
  lại — cờ theo ông ra giữa sân là hồi sĩ khí ở khoảng cách sai, rồi ông thua là dồn hai cú sốc
  vào một sự kiện;
- ⚠⚠ **cắm lại theo nhịp (8 s), không chỉ một lần ở `Start`.** Demo_52 sinh quân DẦN từ nhà lính
  nên lúc `Start` chưa trại nào đủ năm người — cắm một lần là cả màn doanh trại không bao giờ có
  cờ. Và cờ đổ thì phải **dựng lại được**, nếu không «chặt cờ» là đòn một lần. Có
  `StandardRaiseCooldown` **40 s** để việc dựng lại không xoá ngay cú sốc vừa gây ra.

Ngưỡng quân (**5** cho cờ, **9** thêm trống) chuyển thành `ThreeKingdomsStandard.MinTroopsForBanner`
/ `MinTroopsForDrum` — trước đó mỗi màn giữ một bản `private const` riêng, đúng cái bẫy "một đại
lượng, hai nơi ghi" của mục 10a. `TeamHasStanding` trả true khi **còn cờ HOẶC còn trống**, nên mất
lá cờ mà trống vẫn đứng thì chưa dựng lại — đúng ý, tránh cắm lại liên tục.

#### 12d. Phép đo mới — «Tam Quốc: hệ đã viết có ai gắn chưa»

`StickmanDoctor.ThreeKingdoms.cs`: đếm **số file gọi** năm mắt xích (`Standard.Attach` · `Fell +=` ·
`TeamHasStanding` · `HeroSkill.Attach` · `AddComponent<ThreeKingdomsDuel>`). 0 người gọi ⇒ **ĐỎ**,
kèm luôn câu `rg` để tự kiểm. Đo trên **mã nguồn**, không quét scene — quét scene để đoán "màn này
lẽ ra phải có cờ" là réo oan mọi màn cố ý không có (§12b).

⚠⚠ **Phép đo phải LOẠI CHÍNH FILE NÓ.** Bảng mắt xích chứa đúng những chuỗi đang đi tìm, nên bản
đầu luôn tìm thấy "một người gọi" — chính nó. Xoá sạch mọi đường nối mà bảng khám vẫn XANH. Cùng
bài học với «Chiến dịch: trường mới có được lưu không» ở mục 11h: **một phép đo không bao giờ đỏ
được còn tệ hơn không có phép đo nào.**

#### 12e. `EquipNamed` khớp CHUỖI CON — binh khí danh tướng đi nhầm cây

`StickmanWeaponHolder.EquipNamed("Sword")` trúng cả `Weapon_DualSwords` và `Weapon_Greatsword`;
`"Saber"` trúng `SaberShort` · `SaberLong` · `DualSabers`. Bảng `LeafWeaponPaths` **tình cờ** xếp
cây đúng lên trước (Sword 1, DualSwords 11) nên nhìn qua vẫn đúng — nhưng kho của một nhân vật là
bản **đã lọc** theo thể loại + nền, và `_sceneWeapons` còn nạp TRƯỚC cả bảng đó. Lọc mất
`Weapon_Sword` là **Tào Tháo ra trận cầm song kiếm** trong khi bảng vẫn ghi «Thanh Cang kiếm».

Nay quét **hai lượt**: đúng tên (`Weapon_<fragment>`) trước, chuỗi con sau. Giữ lượt sau làm dự
phòng — ra trận tay không tệ hơn cầm nhầm cây (đoạn ⚠ sẵn có của `EquipNamed`). Bốn danh tướng
dính: Tào Tháo · Lữ Mông (`Sword`), Tôn Quyền · Cam Ninh (`Saber`); 12/12 tên binh khí trong bảng
đều có prefab thật.

#### 12f. Đo lại

```
Tools > Stickman > ★ Bảng điều khiển
  1. «Tam Quốc dàn trận — Demo_51»            → dựng lại (extraSources nay đủ 8 file nguồn)
  2. «Tam Quốc doanh trại — Demo_52»          → dựng lại
  3. «Tam Quốc chiến dịch — Demo_53 + 54»     → dựng lại
  4. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN» → phép đo mới phải XANH (5/5 mắt xích có người gọi)
  5. Chơi thử Demo_51: mỗi nước phải có 1 lá cờ + 1 cái trống ở HẬU tuyến; chặt cờ địch →
     một dòng «⚑ … đã đổ» và quân họ nao núng; 40 s sau họ dựng lại.
```

⚠ **`extraSources` của ba nút Tam Quốc trước đợt này thiếu 12 file** (`ThreeKingdomsHeroes` ·
`ThreeKingdomsDuel` · `ThreeKingdomsStandard` · các file phần `.Save` · `.Stratagems` · `.Panels` …),
nên sửa chúng xong bảng «cần chạy lại» **không réo** — scene giữ nguyên bản bake cũ mà trông như
đã cập nhật. Thêm một file phần cho hệ nào thì thêm luôn vào `extraSources` của nút dựng hệ đó.

Trạng thái 2026-09-09: `CompileCheck.py` — runtime **0 lỗi**, Editor chỉ còn 13 lỗi CS0012
`mscorlib` của `StickmanCinematicRecorder.cs` (giới hạn có sẵn của compile tay, không phải lỗi
code). Phép đo mới đã mô phỏng bằng script: 5/5 mắt xích có người gọi. **CHƯA bấm các nút trên**
và **chưa chơi thử**.
