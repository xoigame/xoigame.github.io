## ⚠⚠ BATTLE ROYALE — phương tiện mở màn theo THỜI KỲ · nhặt đồ · VÒNG BO · đơn/tổ 4 · mỗi ván một map (2026-09-08)

User: *"thêm chế độ battle royale cho trung cổ và hiện đại: thả dù xuống không có đồ, đi nhặt
đồ, map rộng rồi thu nhỏ lại, ai còn lại cuối cùng thắng, có đồ tiếp tế, có ăn máu, chơi đơn
và chơi team 4 người, AI phù hợp, mỗi lần chơi một map ngẫu nhiên"*. Quy trình, bảng số và
prompt đặt art: `Docs/KnowledgeBase/BattleRoyale.md`. Tham chiếu: PUBG/Fortnite/Apex.

**KHÔNG có mode mới, không có state AI mới.** Battle royale là **một `MissionType` của hệ map**
(`BattleRoyale = 17`) — nhờ đó "mỗi ván một map" là chuyện có sẵn (`MapGenerator` + seed), và
ba thể loại chỉ khác nhau ở DỮ LIỆU (kho vũ khí lọc theo `GenreDefinition.weapons`, thuốc là
bình thuốc hay băng bó, riêng hiện đại có xe và giỏ đạn). Bộ đo là `MapBattleRoyale` (7 file
phần, luật FileSize); trọng tài vẫn là `MatchGoal.LastStanding` của loạn chiến — **một TỔ là
một PHE**, nên "tổ cuối cùng" và "người cuối cùng" chung một luật.

### Muốn đổi gì thì sửa ở đâu

| Muốn đổi | Sửa file | Có phải dựng lại scene không |
|---|---|---|
| Nhịp/độ đau vòng bo | `MapBattleRoyale.Zone.cs` › `Phases[]` | KHÔNG (hằng trong code) |
| Mật độ · cấp đồ rải · khu đồ dày | `MapBattleRoyale.Loot.cs` › `ScatterLoot` · `RollGroundTier` · `PickHotZones` | KHÔNG |
| Thứ tự ưu tiên của AI tổ | `MapBattleRoyale.Brain.cs` › `TickBrain` | KHÔNG |
| HUD · la bàn · bảng xếp hạng | `MapBattleRoyale.Hud.cs` | KHÔNG |
| Phương tiện mở màn (tốc độ, cao độ, cách xuống) | `RoyaleCarrier` + `MapBattleRoyale.BoardCarrier` | KHÔNG |
| Cỡ tổ · quân số · bề rộng map mẫu | `StickmanMapSystemBuilder.Blueprints` | **CÓ** — `Maps > 1` rồi `Maps > 7` |
| Kho đồ nhặt · hình dù/thuốc/thùng | `MapLibrary` (builder nạp trong `FillIngredients`) | **CÓ** — `Maps > 1` |
| Map ngẫu nhiên của sân | `StickmanMapSystemBuilder.EnsureRoyaleRecipe` | **CÓ** — `Maps > 7` |

### Các mảnh

| Mảnh | Ở đâu | Luật |
|---|---|---|
| Chia tổ | `MapBattleRoyale.FormSquads` | đơn: mỗi người một phe từ `TeamMember.SquadTeamBase + 1`; tổ N: người chơi + (N−1) quân cùng phe gốc giữ phe 1. Màu tổ TỰ SINH từ số phe (`TeamMember.ColorOf`, hue theo tỉ lệ vàng) |
| Lột đồ | `StickmanWeaponHolder.DropArsenal` + cởi 4 slot + xuống ngựa + hồi đầy máu | **`DropArsenal` ≠ `UseNaturalWeaponsOnly`**: không bật `_naturalWeaponsOnly` (bật là `AddWeapon` từ chối đồ nhặt), không kẹp `_swapPool` |
| **Phương tiện mở màn — MỖI THỜI KỲ MỘT THỨ, NHƯNG CẢ BA ĐỀU BAY** | `RoyaleCarrier` + `RoyaleCarrierKind` | cả sân một chuyến ở cao độ 13; **người chơi bấm NHẢY** (Space / nút NHẢY) rồi RƠI DÙ ~7.6 s, tổ máy xuống ở chỗ đã chọn, qua mép cuối thì đẩy hết xuống. Hành khách ngồi TẮT nên chưa bị bắn |
| ↑ Trung cổ | `Balloon` — KHINH KHÍ CẦU (`Prop_Balloon`, bộ MẶC ĐỊNH) | trôi chậm (8.5), không lật hình (quả cầu đối xứng), bung dù vải |
| ↑ Hiện đại | `Plane` — MÁY BAY VẬN TẢI (`Prop_Bomber`) | tốc độ 11, bung dù `Prop_Parachute` |
| ↑ Fantasy | `Beast` — ĐẠI BÀNG KHỔNG LỒ (`Eagle_Body`) | tốc độ 11, "dù" là đôi cánh lượn `Eagle_Wing` |
| Dù | `Parachute` (dùng chung lính dù trực thăng) | người chơi lái trái/phải; `KeepBehaviorOnLand` giữ lệnh tổ; `Landed` cho thùng tiếp tế |
| Đồ nhặt | `WeaponPickup` · `GearPickup` (Units) · `HealPickup` + `MedkitBag` (Combat) · `AmmoCache` trung lập | kho = `MapLibrary.lootWeapons` (cả bảng lá, builder nạp từ `WeaponPathAt`), giáp = `equipment` của loadout thể loại — KHÔNG bảng riêng |
| **Mật độ đồ** | nửa map × **0.26** vũ khí · **0.07** giáp · **0.11** thuốc (sàn 8/2/3); khu dày +7/+2/+3 | đồ dày quá thì cả ba quyết định của kiểu chơi tan: chỗ nào cũng có đồ nên không phải chọn chỗ nhảy, món nào cũng gần nên không phải cân nhắc, và thùng tiếp tế hết đáng tranh. Giữ NGOÀI khu dày thưa hơn một món / 2.5 đơn vị |
| Đọc cấp đồ từ xa | `LootTierMark` | vạch màu dưới món đồ theo quy ước độ hiếm (xám→trắng→lục→lam→tím→cam) |
| Khu đồ dày | `MapBattleRoyale.Loot.cs` › `PickHotZones` | 2 cụm (3 chỉ khi nửa map ≥ 50) có cột sáng, đồ dịch lên MỘT bậc; ~45% tổ nhắm vào đó lúc nhảy |
| Vòng bo | `Phases[]` 6 pha, tâm lệch ngẫu nhiên, vòng KẾ hiện ngay lúc chờ | ngoài vòng `TakeDamage(forceScale 0)` **theo PHẦN TRĂM máu tối đa** (3% → 25%/giây); pha cuối `factor 0` = khép hẳn ⇒ ván bắt buộc xong |
| Tiếp tế | thùng + `Parachute` mỗi ~45 s, rơi vào vòng KẾ | mở: 2 vũ khí cấp 3–5 + giáp 4–5 + 2 thuốc (+ giỏ đạn) |
| **LỘT XÁC** | `Hud.DropGearAsLoot` — nón/giáp/khiên của người vừa chết thành `GearPickup` thật, cấp lấy theo `GearTier` CỦA HỌ | hạ kẻ mặc giáp cấp 5 là cách nhanh nhất để giàu — đó là lý do người ta dám đánh nhau thay vì trốn tới hết ván |
| **Nhịp căng** | `Hud.AnnounceTension` — báo ở mốc còn 10 · 5 · 3 · 2 người | báo theo MỐC, không báo từng cái chết: 19 dòng "A hạ B" trong ván 20 người là nhiễu |
| **Thanh đỡ dậy** | `Hud.ReviveHint` — hiện % khi người chơi đứng cạnh đồng đội gục | cơ chế đã chạy sẵn nhưng VÔ HÌNH, xem mục dưới |
| Gục chờ cứu | `StickmanDowned` + `AIRescueModule` — **CHỈ khi chơi TỔ** | bản sao profile mở `rescueRadius = 8`; não tổ kéo cả tổ về chỗ người gục |
| ~~Xe bỏ hoang~~ | **ĐÃ GỠ 2026-09-08** — `SpawnVehicles` và `BuildRoyaleVehicleCatalog` xoá hẳn | user: *"tạm thời bỏ phương tiện xe cộ ra khỏi battle royale"*. Xoá HẲN, không để cờ tắt: một nhánh chết mang theo cả `VehicleCatalog` là thứ người sau bật lại vì tưởng đang thiếu |
| **ĐỒ TRONG NHÀ** | `Loot.StockHouses` — mặt đất giữ VŨ KHÍ, trong nhà giữ GIÁP + THUỐC; đồ trên GÁC hơn một bậc | vào nhà thành một ĐỔI CHÁC: được giáp và thuốc, nhưng lúc ở trong thì mù với bên ngoài và chỉ có một lối ra. Trước đợt này vào nhà **không được gì** nên nhà chỉ là vật cản với người chơi chủ động |
| **Nhà trú được** | `BuildingInteriorKit.Wants` (7 loại) + `MapBuildRules.ShelterDensity` = 1 cho mission này — xem [StructureKit.md](StructureKit.md) §V13 | vào nhà là biến mất khỏi radar kẻ ngoài; tổ có người tụt máu mà hết thuốc thì rút vào (`Brain` › `NearestShelter`, kẹp trong vòng bo) |
| Xếp hạng | `MapBattleRoyale.Hud.cs` › `TickPlacement` · `SaveResult` | hạng chốt NGAY khi tổ mình hết người; ghi `SaveSystem.RecordRoyale` + một dòng `royale.csv` |
| AI tổ | `TickBrain` dời MỘT MỐC/tổ; lính `GuardTarget` vào mốc | 9 bậc ưu tiên (`RoyaleGoal`): cứu đồng đội → chạy vào vòng → **núp khi vòng thu** → nhặt vũ khí → thuốc → thùng → khu đồ dày (đầu ván) → săn (tầm theo `aggression`) → lang thang. Qua bộ **quán tính ý định** `Commit` — xem mục dưới. Tổ người chơi: vệ sĩ Guard vào NGƯỜI CHƠI; gục thì thành tổ AI + camera xem đồng đội |

### Bẫy đã chặn — đừng làm lại

- ⚠⚠ **SÁT THƯƠNG VÒNG BO PHẢI GHI BẰNG PHẦN TRĂM MÁU, KHÔNG PHẢI SỐ MÁU.** Bản đầu ghi 0.25 →
  2.0 máu/giây, tính như thể ai cũng có ~10 máu. Nhưng thang máu của dự án là **2–3 cho lính**
  (`UnitLoadout.maxHealth`), nên pha MỘT giết một anh lính trong **8 giây**. Đo trên ảnh người
  chơi gửi: **còn 2/21 người khi vòng mới ở pha 1/6** — cả vòng bo, thùng tiếp tế và pha cuối
  không bao giờ được dùng tới, mà trận vẫn "kết thúc đúng luật" nên KHÔNG lỗi nào báo. Nay
  `Phase.burn` là PHẦN máu tối đa mỗi giây (3% → 25%), nhân với `fighter.MaxHealth` lúc trừ.
- ⚠⚠ **MỘT MỐC THỜI GIAN CHỈ TRẢ LỜI MỘT CÂU HỎI.** Bản đầu đặt lại `_startedAt` lúc chuyến mở
  màn xong, rồi lại dùng chính nó để tính "sống bao lâu" — mà hạng cũng chỉ được chấm sau khi
  chuyến đó xong. Hai việc rơi vào cùng một frame ⇒ bảng ghi *"HẠNG #11/26 — sống 0s"* trong
  khi Console ghi ván dài 70 giây, và dòng `royale.csv` dùng để cân bằng thì nói dối. Nay
  `_startedAt` (ván bắt đầu, KHÔNG đặt lại) tách khỏi `_landedAt` (cả sân chạm đất).
- ⚠ **ĐẦU VÁN LÀ PHA NHẶT ĐỒ.** Tầm săn của não tổ thu còn 35% trong `LootRushSeconds` đầu.
  Để nguyên 8–24 từ giây thứ nhất thì trên map rộng 80 với ~20 người, ai cũng nằm trong tầm
  của ai đó và cả sân lao vào nhau ngay khi chạm đất. Tổ vẫn đánh trả kẻ dí sát — đó là việc
  của `AIStateGuard`, không phải của cột mốc.

- ⚠⚠ **TRUNG CỔ KHÔNG CÓ MÁY BAY — NHƯNG VẪN PHẢI BAY** (user 2026-09-08, hai lượt). Lượt một:
  *"trung cổ không có máy bay"* ⇒ đổi sang ĐOÀN XE NGỰA chạy trên đất. Lượt hai: *"bấm nhảy thì
  nó thả dù xuống từ từ thôi, hiện tại xuất hiện luôn trên mặt đất"* ⇒ xe ngựa đúng thời kỳ
  nhưng **giết mất pha rơi dù**. Đáp án giữ được cả hai là **KHINH KHÍ CẦU**.
  **Bài học chung: pha rơi chậm KHÔNG phải hiệu ứng cho đẹp** — đó là quãng người chơi nhìn
  xuống map, đổi ý, né chỗ ba tổ khác đang rơi. Bỏ nó là "chọn chỗ vào trận" mất một nửa. Thời
  kỳ mới thì tìm thứ BAY ĐƯỢC của thời kỳ đó, đừng bỏ pha rơi.
- ⚠ Ba thời kỳ ba phương tiện nhưng **MỘT lớp** (`RoyaleCarrier`): khác nhau đúng hai thứ —
  tấm hình và tốc độ. Thêm thời kỳ = thêm một `RoyaleCarrierKind` + một sprite trong
  `MapLibrary`, đừng chép lớp thứ hai.
- ⚠ **Chữ trên HUD phải theo phương tiện** — `RoyaleCarrier.DisplayName`/`LeaveVerb` giữ chữ,
  HUD chỉ đọc lại. Fantasy nói "buông tay lượn xuống" chứ không phải "nhảy dù".
- ⚠⚠ **VẠCH CẤP PHẢI GỠ LÚC TRAO TAY — `LootTierMark.Remove`** (user: *"ở stickman có cái gì ở
  giữa bụng vậy"*). Nhặt vũ khí là cây đó `SetParent` vào XƯƠNG TAY, và mọi thứ treo dưới nó đi
  theo — kể cả vạch màu, mà `LateUpdate` còn ép nó nằm ngang ⇒ một thanh màu lơ lửng ngang bụng
  nhân vật, đi đâu theo đó tới hết ván. Không lỗi nào báo. `WeaponPickup.GiveTo` gọi `Remove`
  (tắt renderer NGAY vì `Destroy` hoãn tới cuối frame); `LateUpdate` còn một lưới an toàn.
  Nón/giáp/thuốc không dính bẫy này vì cả GameObject bị huỷ khi nhặt.
- ⚠⚠ **TRỌNG TÀI PHẢI ĐỢI CHUYẾN MỞ MÀN — `MatchDirector.HoldVerdict`.** Hành khách ngồi TẮT nên
  KHÔNG nằm trong `TeamMember.All`; trọng tài nhìn vào thấy 0 phe còn người, mà ân hạn đầu trận
  chỉ 3 giây còn chuyến bay dài 7–9 giây ⇒ **ván nào cũng "hoà" ở giây thứ ba**, không lỗi nào
  báo. Nới `_startGrace` không chữa được (số bake trong scene, mà độ dài pha mở màn là chuyện
  của KIỂU CHƠI). Cờ này cũng dừng đồng hồ trận — pha mở màn không được ăn gian giờ.
- ⚠⚠ **Không tướng · không viện binh · không vực · rộng ≥ 26.** Tướng
  (`CommandNode`) ghi đè lệnh tổ mỗi nhịp; viện binh làm "tổ cuối cùng" không bao giờ tới;
  vực = chết vì địa hình. Chốt ở BA chỗ: `MapBlueprint.Apply`
  (map random) · `StickmanMapSystemBuilder.EnsureMap` (map mẫu) · `MapAssembler.BuildBattleRoyale`
  (tắt `context.escalation` + `enemyOpeningScale = 1`, vì ramp mở màn cố ý cho phe B ra MỎNG).
  `MapBlueprint.Validate` + Doctor «Battle royale» đo lại.
- ⚠ **GỤC CHỜ CỨU CHỈ CHO TỔ.** Chơi đơn thì không có ai để cứu, "gục" chỉ là 14 giây nằm chờ
  chết dài thêm. Đây là thứ khiến tổ 4 khác chơi đơn về CHẤT, không phải chỉ đông người hơn.
- ⚠ **Profile là ASSET DÙNG CHUNG** — `Instantiate` ra bản sao rồi mới mở `rescueRadius`, một
  bản cho MỖI profile gốc. Sửa thẳng là mọi scene khác cũng có lính đi cứu nhau.
- ⚠ **`SetGearTier` TRƯỚC `Equip`** (`GearPickup`): `Equip` ở cấp 0 chỉ CẤT món đồ (cấp 0 = đầu
  trần), mà lính vừa bị lột có thể đứng ở cấp 0. AI mang `UnitRankGear` áp cấp AI MỖI FRAME
  nên phải `PinTier`, không thì cái nón cấp 4 vừa nhặt tụt về cấp 2 ngay nhịp sau.
- ⚠ **Đổi mốc bằng cách DỜI TRANSFORM**, `SetBehavior` chỉ khi behavior/objective khác.
- ⚠ Người treo dù (`GetComponent<Parachute>() != null`) KHÔNG bị vòng bo trừ máu, không tính vào
  trọng tâm tổ, không bị săn — chưa vào cuộc. Vòng bo cũng KHÔNG đếm giờ khi máy bay còn bay.
- ⚠ Thuốc hồi `max(3, 40% máu tối đa)` (`HealPickup.FractionOfMax`): lính 2 máu và người chơi
  10 máu cùng nhặt một món phải cùng thấy nó đáng nhặt. `MedkitBag` tự dùng dưới 55% máu và
  **yên tiếng súng 1.6 s**; người chơi bấm **H** hoặc nút **THUỐC** (vòng 1 của cụm cảm ứng,
  chỉ hiện khi có liều và đang thiếu máu — `StickmanTouchInput.HealAvailable`).
- ⚠ Sân map thường KHÔNG có `StickmanPickupPrompt` — `MapBattleRoyale.Begin` tự dựng nếu thiếu.
- ⚠ Hình dù / máy bay / băng bó / bình thuốc / thùng là art VẼ BÙ (`StickmanBuildingArt.Modern`:
  `Prop_Parachute · Prop_Bomber · Prop_Balloon · Prop_Medkit · Prop_Potion · Prop_SupplyCrate`) — đặt art thật
  theo prompt trong KnowledgeBase rồi thả vào `Assets/Sprites/Buildings/Modern/`.

### MAP VÒNG · NÃO TỔ CÓ QUÁN TÍNH · MAP RỘNG HƠN (2026-09-09)

Người chơi báo ba việc trong một tin: *"tất cả chế độ chơi đều có thể đi loop map… AI phải biết
chạy núp khi map thu hẹp, trang bị rớt rải rác ít hơn hiện tại quá nhiều"*, cộng tin trước đó
*"map rộng hơn xíu, AI thông minh hơn hiện tại nó đang bị loop qua loop lại"*.

| Việc | Chốt ở | Số |
|---|---|---|
| Map vòng | `Spec.wrapAround = true` + `noWrapWidening = true` | nửa map **40–52** (KHÔNG nhân 1.8) |
| AI hết đi qua đi lại | `Brain` › `Commit` + `RoyaleGoal` | giữ ý định 3–14 s tuỳ việc; lề dời mốc 3; coi như tới nơi trong 2.5 |
| Núp khi vòng thu | `Brain` › `WantsCover` | vòng đang/sắp thu **và** pha ≥ 1 **và** `aggression < 0.7` |
| Chạy vào vòng | `Brain` › `SafeSpot` | lề mép 3.5; mỗi tổ một `zoneBias` ±0.75 |
| Đồ rơi | `Loot` › `ScatterLoot` | 0.15 / 0.055 / 0.085 × nửa map |

⚠⚠ **BỐN NGUỒN CỦA "AI LOOP QUA LOOP LẠI" — cả bốn đều im lặng.** Đây là bốn lớp lỗi khác nhau
cùng biểu hiện ra một triệu chứng, nên chữa một cái rồi thấy vẫn loop là chuyện bình thường:

1. **Chọn lại từ đầu mỗi nhịp.** `TickBrain` chạy 0.8 s/lần; hai cây súng gần bằng nhau thì
   nhịp này ngắm trái, nhịp sau ngắm phải. → `Commit`: việc mới chỉ chen ngang khi KHẨN HƠN.
2. **Mốc "chạy vào vòng" đặt quá gần.** Bản đầu nhích 35% quãng đường về tâm vòng mỗi nhịp ⇒
   mốc nằm ngay cạnh chân ⇒ `AIStateGuard` coi như ĐÃ TỚI và cho dừng ⇒ vòng thu thêm, lại
   nhích một tí. Cả tổ giậm chân ở rìa bo và chết vì bo. → `SafeSpot` đi HẲN vào trong.
3. **Trọng tâm tổ tính bằng `sum / count` trên map vòng.** Người ở −45 và +45 đứng cạnh nhau,
   trung bình thẳng ra 0 — phía đối diện map. Ai bước qua mép là trọng tâm nhảy nửa vòng.
   → `SquadCenter` dùng `MapWrap.Delta` + `WrapX`.
4. **`MoveTowardsX` trừ thẳng.** Mốc ở bên kia đường nối ⇒ quay đầu đi hết chiều ngang map.
   → sửa ở `StickmanLocomotion`, xem [MapSystem.md](MapSystem.md).

⚠ **Đừng cho CẢ SÂN cùng núp.** `WantsCover` chặn bằng `aggression < 0.7`: tổ hung hăng vẫn đi
săn. Bỏ vế đó thì không ai đánh nhau và ván chỉ còn là cái đồng hồ vòng bo chạy hết sáu pha.

⚠ **Mỗi tổ một chỗ đứng riêng trong vòng** (`Squad.zoneBias`, bốc MỘT LẦN lúc lập tổ). Cho mọi
tổ chạy về đúng tâm vòng thì cả sân chồng một cục, và mốc các tổ trùng nhau nên `AIStateGuard`
của tổ này đẩy tổ kia ra. Bốc lại mỗi nhịp thì chính nó thành nguồn đi qua đi lại thứ năm.

⚠⚠ **VÒNG BO VẪN CÓ "NGOÀI VÒNG" TRÊN MAP VÒNG** — lý lẽ tắt vòng lúc đầu là sai. `PickTarget`
kẹp cung an toàn trong `±halfWidth` nên nó **không bao giờ vắt qua đường nối**, mà phần bù của
một cung ngắn hơn chu vi thì vẫn là một cung. Thứ map vòng thật sự đổi là ĐƯỜNG CHẠY: kẻ ở mép
phải khi bo dạt sang trái có hai lối, và mép map thôi là chỗ bị dồn vào tường mà chết.

### ĐỢT CHƠI THỬ THỨ HAI — "ít trang bị" ≠ "đủ vũ khí" (2026-09-09)

Người chơi báo bốn thứ: *"map bị kẹt và quá ít vũ khí, AI xoay qua xoay lại, không biết tìm vũ
khí để tiêu diệt, đi núp — mục đích của AI là sống sót cuối cùng — không có nhiều công trình để
chui vào núp trốn trong nhà"*.

**⚠⚠ BÀI HỌC ĐẮT NHẤT: "ÍT TRANG BỊ" VÀ "ĐỦ VŨ KHÍ" KHÔNG CÙNG MỘT TRỤC.** Tôi hạ cả ba hệ số
cùng lúc và hụt ngay lượt sau. Người chơi muốn mặt đất **bớt rác** — nón, giáp, thuốc nằm vương
vãi — chứ không muốn **thiếu vũ khí**, vì thiếu vũ khí thì không đánh nhau được và cả ván không
có gì xảy ra. Nên vũ khí giữ hào phóng (0.26), còn GIÁP mới là thứ cắt sâu: 0.35 → **0.07**,
còn một phần năm. Khi một lời phàn nàn gộp nhiều thứ, tách trục ra trước khi chỉnh.

| Triệu chứng | Nguyên nhân thật | Chốt |
|---|---|---|
| Map bị kẹt | vòng bị TẮT NHẦM lúc dựng map mới ⇒ đất kiểu vòng (không tường biên) mà không ai dời người qua mép | `MapWrap` có chủ sở hữu — xem [MapSystem.md](MapSystem.md) |
| AI xoay tại chỗ | mốc ở ĐIỂM ĐỐI XỨNG của vòng ⇒ `Delta` đổi dấu mỗi bước; và AI **đo** bằng phép trừ thẳng trong khi **đi** bằng đường vòng | `_wrapHeading` + quét 86 chỗ đo sang `MapWrap.Distance` |
| Không biết tìm vũ khí | `NearestWeapon` chỉ quét bán kính **18** trên map rộng 92 ⇒ phần lớn lượt không thấy gì và tổ rơi về `Roam` (một điểm NGẪU NHIÊN) | quét CẢ VÒNG (`ZoneWideSearch`); không có cây nào thì ra KHU ĐỒ DÀY, không lang thang |
| Không có nhà để núp | rải cảnh cho ~13 công trình/map, nhà chiếm ~16% ⇒ **hai căn cho cả sân** | `Wants` nới lên 7 loại + `ShelterDensity(BattleRoyale) = 1` (bước ngắn lại, trọng số kéo về loại trú được) |

**MỤC ĐÍCH CỦA AI LÀ SỐNG TỚI CUỐI, KHÔNG PHẢI GIẾT NGƯỜI.** Ba chốt trong `Brain`:

- `ArmedAndReady` — có vũ khí thật **và** còn quá nửa máu mới được đi SĂN. Tay không mà đi săn
  là đi nộp mạng.
- `WantsCover` mở rộng: trốn khi vòng đang thu (tính khí < 0.8, từ pha 2), **hoặc** tổ dưới 55%
  máu, **hoặc** tổ 4 rụng còn một người. Trốn không bao giờ vĩnh viễn — `Flee` xếp trên
  `Shelter` nên vòng bo nuốt mất căn nhà là tổ tự bỏ đi.
- Bậc "không có việc gì": tổ YẾU bám lấy một căn nhà thay vì đi loanh quanh giữa sân trống.

⚠ Vẫn phải chừa cửa cho tổ hung hăng đi săn. Cho cả sân cùng trốn thì không ai đánh nhau và ván
chỉ còn là cái đồng hồ vòng bo chạy hết sáu pha.

**ĐỌC SỐ ĐO, ĐỪNG ĐOÁN.** `ReportSetup` in một dòng vào Console lúc ván bắt đầu: nửa map · số
người · số vũ khí dưới đất (và trên đầu người) · số chỗ trú (một chỗ mỗi bao nhiêu bước) · số khu
đồ dày · map vòng có hay không. Bốn đợt chỉnh vừa rồi đều đi qua vòng "thấy sai → đoán → chỉnh
hệ số → chơi lại" mà không lần nào có một con số để đối chiếu; mật độ là tích của mấy bảng nhân
nhau nên ước bằng mắt luôn sai.

### RÀ SOÁT AI + LỐI CHƠI (2026-09-09, đợt ba) — năm lỗi, tất cả đều im lặng

Người dùng: *"kiểm tra và sửa lại AI và gameplay của nó"*. Rà toàn bộ chuỗi quyết định. Năm lỗi
dưới đây **không cái nào ném ra lỗi** — ván vẫn chạy, vẫn có kẻ thắng, chỉ là thắng vì nhầm lý do.

| Lỗi | Vì sao im lặng | Chốt |
|---|---|---|
| **Ý định bám vào một VẬT ĐÃ MẤT.** Quán tính giữ mốc 7–9 s; kẻ khác nhặt mất cây súng ở giây thứ nhất thì sáu giây còn lại cả tổ vẫn hành quân tới chỗ trống | nhìn ra là "AI chạy lung tung", thật ra nó rất kiên định với một lời hứa đã hết hạn | `Squad.goalTarget` + `goalTracked`; `GoalTargetGone` coi cả `Ready == false` là mất |
| **Tổ tay không ôm mãi việc "tìm vũ khí"** dù trong vòng không còn cây nào | vẫn mang nhãn `Weapon`, hạn giữ 7 s, lặp mãi ⇒ đứng chôn chân | `TryWeaponRun` trả `false` để chuỗi ưu tiên CHẢY TIẾP — đánh bằng tay còn hơn đợi thứ không tồn tại |
| **Tổ tụt máu nằm im tới hết ván.** Máu KHÔNG tự hồi, nên ăn vài phát ở phút đầu là trốn vĩnh viễn | cả khúc giữa trận im lặng, người chơi không hiểu AI đang làm gì | `WantsCover` đòi có ĐỊCH TRONG 16 mới cho trốn vì lý do yếu máu |
| **Cuối ván cả sân MÙ.** `NearestEnemy` lọc theo vòng bo, mà vòng cuối chỉ rộng vài đơn vị ⇒ hai tổ cách 10 bước không thấy nhau | ván kết thúc bằng CÁI ĐỒNG HỒ vòng bo, ai nhiều máu hơn thì thắng | vòng hẹp hơn `CloseQuarters` (22) thì **bỏ hẳn** bộ lọc; và cho phép săn dù tay không |
| **Sàn gác + cầu thang + `GarrisonPost` KHÔNG AI DÙNG** | cả bộ dựng đúng, chạy đúng, chỉ là không ai được phái tới — lớp bẫy "viết xong nhưng không ai gắn" | `UpdateLookout`: tổ đang trú trong nhà có gác thì cắt MỘT người lên `AIBehavior.Garrison` |

⚠⚠ **BỐN TRONG NĂM LỖI CÙNG MỘT HÌNH DẠNG: một điều kiện ĐÚNG ở lúc đặt ra, sai khi hoàn cảnh
đổi.** Lọc theo vòng bo đúng ở pha 1 và sai ở pha 6; "trốn khi yếu máu" đúng khi có địch và sai
khi sân trống; "giữ ý định" đúng khi mục tiêu còn đó. Khi thêm một luật AI, hỏi ngay: *luật này
còn đúng ở PHA CUỐI không, và khi thứ nó bám vào biến mất thì sao?*

⚠ `UpdateLookout` phải chừa người gác ra khỏi `IssueGuard`: lệnh Guard phát cho CẢ tổ mỗi nhịp,
không chừa là nó đè lên lệnh Garrison ngay nhịp sau và anh ta tụt xuống đất — sàn gác lại thành
đồ trang trí. Và chỉ cắt người khi tổ còn ≥ 2: tổ một người leo lên gác là bỏ trống cửa.

### BA LỖ HỔNG "ĐỦ CHƯA" (2026-09-09, đợt bốn)

Người dùng: *"kiểm tra xem đã đầy đủ chưa, thêm tính năng, và sửa lỗi nếu có"*. Rà theo vòng
chơi của thể loại chứ không theo danh sách file — ba chỗ thiếu, cả ba đều **nhìn vào tưởng có**.

**1. ⚠⚠ LỘT XÁC KHÔNG TỒN TẠI — và đây là nửa vòng chơi của thể loại.**

`StickmanWeaponHolder._dropWeaponOnDeath` lo phần VŨ KHÍ. Nhưng trang bị thì
`StickmanEquipment.DropSlot` chỉ đẻ ra **`DroppedItem`** — và đó là chỗ dễ nhầm nhất:

| Lớp | Là gì | Nhặt được? |
|---|---|---|
| `DroppedItem` | RÁC TRANG TRÍ, tự tan sau khi chạm đất (`despawnAfterLanding`) | **KHÔNG** |
| `GearPickup` · `WeaponPickup` · `HealPickup` | ĐỒ THẬT, có trigger, vào kho `All` | CÓ |

Nhìn vào ván chơi thì "có rơi đồ đấy chứ" — cái nón bay ra, lăn lóc, rồi mờ đi. Không lỗi nào
báo. Nhưng hạ một kẻ mặc giáp cấp 5 lại **không được gì**, nên đánh nhau không có phần thưởng
và nước đi tối ưu là trốn tới hết ván. Nay `DropGearAsLoot` đẻ `GearPickup` thật cho ba ô
ĐẦU · THÂN · KHIÊN, cấp lấy theo `GearTier` của chính người chết.

⚠ KHÔNG gọi `Unequip` để gỡ khỏi xác: cái chết đang chạy giữa chừng (ragdoll vừa bật, xương vừa
đổi group) và `Unequip` huỷ hình ngay trong pha đó — đúng lớp bẫy mà chú thích dài trong
`DropSlot` đã phải chữa một lần. Xác cứ đội nón của nó rồi mờ đi cùng ragdoll.

**2. ĐỠ ĐỒNG ĐỘI DẬY: cơ chế chạy sẵn nhưng VÔ HÌNH.** `StickmanDowned.CountHelpers` đếm mọi
đồng đội còn đứng trong tầm — người chơi nằm trong số đó, nên chỉ cần ĐỨNG CẠNH là đã đỡ. Nhưng
màn hình không hiện gì: người chơi đứng ba giây, không biết mình đang làm gì, rồi bỏ đi đúng lúc
thanh sắp đầy. **Một cơ chế không ai biết là một cơ chế không tồn tại** — cùng họ với "viết xong
nhưng không ai gắn", chỉ khác là thiếu mắt chứ không thiếu dây.

**3. KHÔNG CÓ NHỊP CĂNG.** Sân tụt từ 20 xuống 2 người mà chỉ có một con số nhỏ trên thanh tiêu
đề. Bốn mốc (10 · 5 · 3 · 2) là bốn thời điểm lối chơi THẬT SỰ đổi, nên báo ở đó.

### Chuỗi điểm nối — và phép đo canh nó

Thêm kiểu chơi = nối **8 điểm** (xem MapSystem §2). Từ 2026-09-08 có phép đo tự hỏi cả 8 câu
cho MỌI `MissionType`: **`StickmanMissionChainCheck`** (Doctor › *Kiểu chơi nối thiếu điểm*, hoặc
`Nâng cao > Rig & Kiểm tra > Soát chuỗi điểm nối của kiểu chơi`). Nó quét chữ `MissionType.X`
trong bảy file bắt buộc và hỏi `MapLibrary` xem kiểu đó đã có map nào chưa — nên "đã nối đủ
chưa" là con số đo được, không phải trí nhớ của người vừa thêm.

Battle royale đi qua: `MissionType` · `MissionInfo` · `MissionPlan.For/ForScene("royale")` ·
`MapBlueprint.For/Apply/Validate` · `MapKitPlanner` · `MapGenerator.Sanitize/BuildSettings
(squadSize)` · `MapAssembler.BuildMission` · `MatchRules.DefaultFor` · `MapStudio.Missions` +
ô cỡ tổ · `Blueprints` 6 map mẫu (`Med/Mod/Fan_Royale` và `…RoyaleSquad`) · `Recipe_Royale_*`
(NGOÀI `MapLibrary.recipes`, ba sân cầm qua `MapArena._recipeOverride`) ·
`StickmanGenreMissionCatalogBuilder` · ba sân `Demo_56/57/58` (`newMapEachRound`, F5 = map mới) ·
Job/Tool «★ Battle Royale — 3 sân» · hai phép đo Doctor.

**Cần chạy lại tool sau khi kéo code:** `★ Battle Royale — 3 sân` (= `Maps > 7`) — nút này tự
vẽ bù art, dựng lại kho map, dựng ba sân và **dựng lại vỏ game** (menu chính đọc cùng catalog).
Kiểm: Doctor hai mục «Battle royale» và «Kiểu chơi nối thiếu điểm» xanh; Play `Demo_56`, bấm
NHẢY, nhìn đồ có vạch màu, dải xanh co lại, thùng rơi, nút «Xem bot đấu» chạy được một ván
không người chơi.
