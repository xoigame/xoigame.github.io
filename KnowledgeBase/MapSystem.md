# Hệ thống XÂY MAP + ĐIỀU KIỆN THẮNG THUA

> Mục tiêu: "thêm một màn chơi" phải là **thêm một asset**, không phải viết thêm một tool dựng
> scene. Map, nhiệm vụ, quân đội hai phe và luật thắng thua đều là DỮ LIỆU; code chỉ có một
> đường dựng duy nhất, dùng chung cho map thiết kế tay, map sinh ngẫu nhiên và map bake ra scene.

## 1. Ba tầng

| Tầng | File | Việc |
|---|---|---|
| **Dữ liệu** | `MapDefinition` · `MapRecipe` · `MapLibrary` · `MapTypes` | Map là gì: rộng bao nhiêu, địa hình gì, nhiệm vụ gì, hai phe ra sao |
| **Dựng** | `MapAssembler` · `MapScenery` · `MapSpawn` | Biến dữ liệu thành object trong scene |
| **Trọng tài** | `MatchDirector` · `MapObjective` | Chấm thắng thua, hiện bảng mục tiêu + bảng kết quả |
| **Vỏ ngoài** | `MapArena` · `MapPopulator` | Chọn map / random map / chơi lại; ra quân cho map đã bake |

Runtime nằm ở `Assets/Scripts/Map/`, tool ở `Assets/Editor/Maps/StickmanMapSystemBuilder.cs`.

## 1b. BA THỂ LOẠI trên cùng một hệ

Trung cổ · Hiện đại · Fantasy chạy **cùng assembler, cùng trọng tài, cùng luật thắng**. Khác
nhau hoàn toàn ở DỮ LIỆU:

| | Trung cổ | Hiện đại | Fantasy |
|---|---|---|---|
| Sân chơi | `Demo_29_MapMedieval` | `Demo_30_MapModern` | `Demo_31_MapFantasy` |
| Bộ quân (`GenreKit`) | khiên · giáo · cung · thầy thuốc | súng săn · tiểu liên · súng trường · quân y | vệ binh rune · lưỡi hái · trượng phép · tăng lữ |
| Đội hình | có tuyến khiên thật, ~1/3 cung | ~50% tay súng, tuyến đầu 1 người | ~45% pháp sư, tuyến đầu mỏng |
| Địa hình hay dùng | đồi · pháo đài · hẻm vực | **nhiều vật che** (5–9), map rộng | nhiều tầng bục, ít vật che |
| Nền văn minh | **CÓ** (nón/giáp/skin vũ khí) | không | không |
| Công thức random | `Recipe_Medieval` | `Recipe_Modern` | `Recipe_Fantasy` |

Điểm nối duy nhất: `MapDefinition.genre` → `MapLibrary.LoadoutFor(genre, role)`.
`MapAssembler` **không biết gì về vũ khí**, nó chỉ hỏi kho map bộ quân của thể loại — nên thêm
thể loại thứ tư = thêm một `GenreKit` + một khối trong bảng `Blueprints`, không sửa code dựng.

⚠ **Nền văn minh CHỈ cho trung cổ** (`GenreKit.useCivilizations`). Bỏ cờ này là map hiện đại
ra một tiểu đội mặc giáp Viking cầm súng trường; `MapGenerator` cũng kiểm tra cờ đó trước khi
bốc nền văn minh cho map random.

Ô chọn scene (F1) dùng hai tầng: `Entry.genre` chọn **Trung cổ / Hiện đại / Fantasy**, rồi
`Entry.category` chọn **Cơ bản / AI / Chế độ chơi**. Ba sân map đăng ký `category = Gameplay`,
nên map Fantasy nằm ở `Fantasy → Chế độ chơi`, không phải một tab genre riêng lẫn với bài khác.

## 2. Luồng chạy

```
MapArena.Start
   └── MapLibrary.Load()                    Resources/MapLibrary.asset
   └── (map thiết kế tay)  hoặc  MapGenerator.Generate(recipe, seed)
        └── MapAssembler.Build(map, library, seed)
             ├── MapScenery.Build            đất · khe vực · bục · ụ chắn · thang · nền xa · prop
             ├── BuildMission                nhà chính / VIP / xe hàng / vùng chiếm / viện binh
             ├── BuildArmy ×2                đội hình theo tuyến + tướng + cây chỉ huy
             ├── SpawnPlayer                 nếu `playerJoins`
             └── MatchDirector.Setup         luật thắng thua lấy từ MapDefinition.ResolveRules()
```

Bake ra scene tĩnh đi đúng đường đó, chỉ khác hai chỗ:
`MapSpawn.InstantiateOverride` (giữ liên kết prefab) và `withArmies: false` (quân đội để
`MapPopulator` ra lúc bấm Play).

## 3. Thêm MAP mới — không cần code

1. `Create > Stickman > Map Definition` (hoặc nhân bản một asset trong `Assets/Settings/Maps/`).
2. Điền: `halfWidth`, `terrain`, số bục/vực/ụ chắn, `mission` + `missionSettings`, hai `ArmySpec`.
3. Kéo asset vào `MapLibrary.maps` (hoặc bấm lại `Tools > Stickman > Maps > 1` nếu map nằm trong
   bảng `Blueprints` của tool — **bảng đó là nguồn sự thật của map mẫu**, sửa số thì sửa ở đó
   rồi bấm lại, đừng sửa tay trong Inspector).
4. Bấm Play scene `Demo_29_MapMedieval`, phím **F2** chọn map.

## 4. Thêm KIỂU NHIỆM VỤ mới — 8 ĐIỂM NỐI, và có phép đo canh

⚠⚠ **Bản cũ của mục này ghi "đúng 3 chỗ" — SAI, và sai theo cách im lặng nhất.** Ba chỗ đó
(`MissionType` · `BuildMission` · `DefaultFor`) đủ để **biên dịch xanh và trận chạy được**, nên
người làm tưởng đã xong. Cái thiếu chỉ lộ ra khi có người ngồi chơi đúng màn đó: mở Xưởng map
trong chế độ mới thì thấy kho map của một chế độ **khác**, ô chọn map trống trơn, hoặc map sinh ra
theo bộ số mặc định (phẳng, hẹp, sai hẳn kiểu chơi). Đó chính là lỗi người dùng báo
*"xưởng map không đủ chế độ chơi"* (2026-09-07).

Chuỗi thật là **8 điểm**, và `StickmanMissionChainCheck` hỏi đủ 8 câu cho MỌI `MissionType`
trong một lần bấm:

| # | Chỗ nối | Thiếu thì hỏng thế nào |
|---|---|---|
| 1 | `MissionInfo` — `Name` · `Hint` · `NeedsClock` · `PlayerAttacks` | không tên, không lời dẫn, không đồng hồ |
| 2 | `MissionPlan.For` (+ `ForScene`) | AI không biết bên nào công; quân đi công không đập được công trình |
| 3 | `MapBlueprint.For` (+ `Validate`) | map sinh theo bộ số mặc định — phẳng, hẹp, sai kiểu chơi |
| 4 | `MapKitPlanner` | map lắp ghép không có lô nào hợp kiểu chơi |
| 5 | `MapAssembler.BuildMission` (+ `ResolveTargetsFromScene`) | **không dựng gì cả** — không mục tiêu, không bộ đo |
| 6 | `MatchRules.DefaultFor` | **không có luật thắng** ⇒ trận chạy vô tận |
| 7 | `MapStudio.Missions` | Xưởng map không xây được map cho kiểu đó |
| 8 | preset trong `StickmanMapSystemBuilder.Blueprints` | **kho map trống**, ô chọn map không có gì để bấm |

⚠⚠ **ĐIỂM 8 CÒN MỘT VẾ NỮA MÀ QUÉT CHỮ KHÔNG BẮT:** thêm dòng `Blueprints` rồi bấm `Maps > 1` thì
map asset sinh đúng và vào kho đúng — nhưng **dòng menu «Chế độ chơi» lại do
`StickmanGenreMissionCatalogBuilder.RegisterAll` đẻ ra**. Trước 2026-09-09 không nút nào trong nhóm
`Maps` gọi hàm ấy, nên kiểu chơi mới **vô hình** cho tới khi ai đó tình cờ bấm
`Demo Scenes > 0. Làm mới danh sách bài`. Nay `Maps > 1` và `Maps > 2` tự gọi
(`StickmanMapSystemBuilder.RefreshMissionMenu`) — nếu bạn sửa tay bảng `Blueprints` của một bản cũ,
nhớ bấm thêm nút làm mới danh sách bài.

Bấm **`Nâng cao > Rig & Kiểm tra > Soát chuỗi điểm nối của kiểu chơi`** (hoặc Doctor, mục
*«Kiểu chơi (MissionType) nối thiếu điểm»*) — nó chỉ ra đúng chỗ thiếu, kèm câu sửa. Đừng tự rà
bằng trí nhớ. Nó cũng hỏi `MapLibrary.HasMapFor`: có dòng preset rồi mà **chưa bấm `Maps > 1`**
thì asset map chưa tồn tại, và quét chữ không bắt được vế đó.

### Năm chỗ NGOÀI chuỗi 8 điểm — phép đo không canh, phải tự nhớ

Đo được khi thêm `MissionType.TeamDeathmatch` (2026-09-09): chuỗi 8 điểm xanh mà vẫn còn 5 chỗ
rẽ nhánh theo `MissionType` chưa nối. Cách tìm: `rg -n "MissionType\.(FreeForAll|BattleRoyale)"`
rồi hỏi từng file *"kiểu mới có cần mặt ở đây không"*.

| Chỗ | Cần khi nào |
|---|---|
| `MapGenerator.Sanitize` | nhiệm vụ có ràng buộc HÌNH HỌC (không vực, nửa rộng tối thiểu) — chỗ giữ cho map random luôn chơi được |
| `MapBlueprint.Validate` | ràng buộc đó cũng phải chặn được map **ĐẶT TAY** và map cũ nạp lại (Doctor + Xưởng map gọi hàm này) |
| `MapStudio.DrawWinRules` | nhiệm vụ có ô số riêng (`killsToWin`, `squadSize`…) — không thêm là **có trường mà không có núm**, cả kho map dùng đúng một con số mặc định |
| `StickmanMapMaker.Missions` | Xưởng map bản Editor mới thấy kiểu chơi |
| `MapMissionAI.Decide` | chỉ khi thế trận của kiểu chơi KHÁC "cán cân lực lượng" (chiếm điểm · cướp cờ · kéo co). Không thì `CampaignIntent.Auto` là đúng — đừng thêm nhánh cho có |

Hai chỗ **không** cần chạm: `MapRecipe.missions` (công thức chung cố ý chỉ bốc 7 kiểu cũ; kiểu
mới có sân riêng thì làm recipe riêng như `EnsureRoyaleRecipe`) và `GamePackRunner` (nó
`Enum.TryParse` nên gói chiến dịch JSON nhận kiểu mới ngay, khỏi sửa gì).

## 5. Điều kiện thắng thua

Luật là **danh sách vế** `MatchRule`, mỗi vế là "phe X thắng khi Y". Vế nào thành trước thì phe
đó thắng — nên **không có luật thua**: thua là địch thắng trước.

| `MatchGoal` | Thành khi |
|---|---|
| `EliminateEnemies` | Phe địch hết quân NGƯỜI và hết sóng viện binh |
| `DestroyEnemyObjective` | Mọi mục tiêu (vai trò chỉ định) của địch đã sập |
| `DeliverCargo` | Xe hàng của phe mình tới đích |
| `CaptureScore` | Điểm chiếm ≥ `amount` |
| `SurviveTime` | Đồng hồ trận chạy đủ `amount` giây |

Trọng tài **không giữ tham chiếu** tới nhà/VIP/xe. Nó hỏi `MapObjective` theo VAI TRÒ
(`Headquarters` · `Vip` · `Cargo` · `CaptureZone` · `Structure`). Nhờ vậy map dựng lúc chạy và
map bake sẵn chấm điểm y hệt nhau, và sửa tay bố cục trong scene bake không làm hỏng luật.

Muốn luật riêng cho một map: điền `MapDefinition.customRules` (để trống = luật mặc định).

## 6. Map ngẫu nhiên

`MapRecipe` mô tả KHOẢNG (map rộng bao nhiêu, mấy lính, nhiệm vụ nào được phép), `MapGenerator`
bốc số trong khoảng đó. Hai điều quan trọng:

- **Tất định theo seed** — cùng seed ra đúng cùng map. Seed hiện trên HUD (góc trái) để dựng lại
  đúng ván có bug. Generator lưu/khôi phục `Random.state` nên không kéo phần còn lại của game
  vào cùng chuỗi ngẫu nhiên.
- **`Sanitize` sau khi bốc** — bốc xong còn một bước "kiểm tra thực tế": map hộ tống thì xoá hết
  khe vực (xe hàng không nhảy), map chiếm điểm thì nới rộng cho ba vùng không chồng nhau, map
  thủ trại thì đủ chỗ dựng tường/tháp. Đây là lý do map random vẫn CHƠI ĐƯỢC chứ không chỉ
  "khác nhau mỗi lần".

## 6b. THÀNH LUỸ (tường · cổng · tháp canh)

Map nào có DOANH TRẠI (thủ trại · công trại · sinh tồn) thì `MapAssembler.BuildCamp` gọi
`MapCastle` dựng thành luỹ quanh nhà chính. Kiểu thành lấy theo thể loại
(`MapCastle.DefaultFor`, ghi vào `MapDefinition.fortStyle`):

| `MapFortStyle` | Dựng gì | Dùng cho |
|---|---|---|
| `Castle` | tháp trong → **tường thành** (có bậc thang + chỗ đứng bắn) → **cổng phá được** → tháp ngoài | Trung cổ · Fantasy |
| `Barricades` | 3 ụ chắn thấp + 1 chòi quan sát | Hiện đại |
| `None` | trại trống | map không có doanh trại |

Dùng CHUNG hệ công trình sẵn có, không đẻ khái niệm mới: `Fortification` (máu · chặn đường ·
sửa được · mặt trên đi được) + `GarrisonPost` (chỗ đứng bắn) + `StickmanClimbZone` (thang).
Nhờ vậy AI biết sẵn phải làm gì — cung thủ trèo tháp đứng bắn (`AIStateGarrison`), quân công
thành đập cổng (`siegeProfile` có `structureTargetBonus` dương), thợ vá tường.

Bản Editor dựng sẵn trong scene là `StickmanFortBuilder` (`Demo_21_Fortress`) — cùng một hệ,
khác lối vào.

⚠ **Thành luỹ là CÁC CỤM RỜI, không bịt kín chiều ngang map.** AI không leo tường; bịt kín là
cả trận đứng nhìn nhau qua bức tường. Cổng phá được chỉ là lối đi NGẮN NHẤT, không phải duy nhất.

## 6c. LÍNH GÁC THÁP & SÁT THỦ trong map

Hai vai mới đi kèm thành luỹ, cả hai đều là DỮ LIỆU chứ không phải map riêng:

| | Ai | Bật thế nào |
|---|---|---|
| **Lính gác** | tuyến TẦM XA của phe GIỮ TRẠI | tự động: `MapAssembler` gán `MapLibrary.guardProfile` + lắp module `Watch` + `Spotter` |
| **Sát thủ** | quân đi lẻ của phe ĐI CÔNG | `ArmySpec.infiltrators` = số ninja (map mẫu: 1 con ở map thủ/công, 2 con ở map bảo vệ VIP) |

Lính gác trèo tháp bằng `AIBehavior.Garrison` sẵn có và giữ thế cảnh giới. Sát thủ mang
`StickmanStealth`: chỉ vô hình với radar AI khi ĐỨNG IM; lẻn tới, di chuyển/leo thang sẽ lộ,
đâm sau lưng VIP hoặc tướng, rồi rút vào bóng tối chờ ẩn lại.

Sân test riêng cho cặp này: `Demo_33_Infiltration` (`Tools > Stickman > AI > 9`).

## 6d. HAI CÁCH CHƠI + CHẾ ĐỘ XEM (`PlayerRole`)

Cùng một map, cùng luật thắng thua, chỉ đổi CHỖ NGỒI của người chơi:

| `PlayerRole` | Người chơi làm gì | Dựng thêm gì |
|---|---|---|
| `Hero` | cầm một nhân vật, đánh bằng tay (bản gốc) | spawn nhân vật ở tuyến sau phe A |
| `Commander` | **ra lệnh + đặt điểm tập kết + xây tháp/rào** bằng ĐIỂM CHỈ HUY | `CommanderPlayHud` + cột mốc `Rally_Player`, KHÔNG có nhân vật |
| `Observer` | ngồi xem hai bộ não máy đánh nhau | không gì cả |

Đổi lúc chơi: nút **"Cách chơi"** trên HUD sân map (đổi xong tự dựng lại ván — vai quyết định
có spawn nhân vật hay không nên không sửa giữa ván được).

Vai `Commander` **không đẻ cơ chế mới**: ra lệnh qua `TeamCommander.Issue`, tập kết bằng cách
DỜI CỘT MỐC (không `SetBehavior` từng lính — bài học `RallyBanner`), xây bằng
`MapCastle.BuildTower/BuildBarricade` (đúng bộ công trình AI đã biết dùng). Điểm chỉ huy cộng
theo thời gian + số quân sống, cố ý KHÔNG dùng `TeamEconomy`: mode chiến thuật phải chơi được
trên MỌI map, mà phần lớn map không có mỏ vàng.

`MapArenaRequest` là lời nhắn tĩnh "mở map này với vai này" qua một lần nạp scene — phòng thí
nghiệm AI dùng nó để mở một ván gameplay ở vai `Observer`.

## 7. Trang trí / hình ảnh của map

Tông màu, nền xa, vật trang trí nằm trong `MapTheme` (asset của từng thể loại, ở
`Assets/Settings/Genres/MapTheme_*.asset`) — đổi tông map là kéo thanh màu, không mở code:

- `skyColor` → màu camera; `groundColor` / `platformColor` → đất và bục;
- `backdropLayers` + `backdropShape` → dải nền xa (núi / nhà cao tầng / cột đá). Lớp càng xa
  càng nhạt dần về phía màu trời — mẹo aerial perspective, rẻ hơn parallax thật;
- `props` + `propsPer10Units` → prefab rải trên mặt đất (cây, thùng, bia đá).

Effect (đánh/trúng/nổ) vẫn đi qua `EffectManager` + `EffectLibrary` như mọi nơi khác trong dự án;
`MapAssembler` chỉ đảm bảo scene có sẵn `EffectManager` và `ProjectilePoolManager`.

## 8. Bake map thành scene tĩnh

`Tools > Stickman > Maps > 3` (chọn asset MapDefinition trong Project trước).

Scene bake chứa **cảnh + mục tiêu** (mở ra kéo tay chỉnh bố cục được) và một `MapPopulator`
giữ bản đồ chỗ đứng (khe vực, bục). Quân đội **cố tình không bake**: lính phải đi qua Awake của
rig/vũ khí/trang bị rồi mới khoác được loadout và nền văn minh — làm việc đó trong Editor thì chỉ
ra một đám lính trần.

## 7c. BỘ CÔNG TRÌNH DÂN SINH + ĐỊA HÌNH — hồ nước, cầu, lều, mỏ

Map giờ dựng được thêm: **hồ nước có cầu gỗ bắc qua** · **lều trại** quanh doanh trại ·
**mỏ vàng / bãi gỗ** rải giữa map · **cầu thang hai chất liệu** (gạch cho thành đá, gỗ cho
công trình gỗ). Art nằm ở `Sprites/Buildings/Default/` (code-gen là bản nháp — thay art thật
bằng cách thả PNG cùng tên rồi bấm `Maps > 1`).

### Hồ nước = MỘT KHE VỰC CÓ NƯỚC VÀ CẦU (`MapDefinition.lakeCount`)

Đây là quyết định kiến trúc quan trọng nhất của cả bộ: hồ được ghi vào **CẢ `Layout.pits`**.
Nhờ vậy toàn bộ luật né vực có sẵn — `SafeX` dời spawn, `IsOverPit` chặn platform, tia dò
mép vực của `StickmanLocomotion`, AI không tự nhảy xuống — **tự áp cho hồ mà không sửa một
dòng nào**. Cho hồ đi đường riêng là phải sửa từng luật đó, quên một cái là lính spawn giữa
hồ và không lỗi nào báo.

**Luật cầu — ba vế, thiếu vế nào cũng hỏng trong im lặng:**
· **mặt cầu NGANG mặt đất** (`groundTop`): cầu là đường đi tiếp của cái làn duy nhất — cao
  hơn là thành bậc phải trèo, thấp hơn là thành hố phải nhảy;
· **cầu phủ QUÁ mép hồ** mỗi bên 0.4: hở một khe là tia dò mép vực báo "không có đất" và AI
  đứng khựng ở bờ vĩnh viễn;
· **collider MỎNG chỉ ở mặt cầu**: khối đặc cả thân là phần dưới chắn ngang hồ, ai rơi xuống
  nước kẹt giữa hai trụ không bơi ra được.

Nước là `WaterZone` của hệ thuỷ chiến (trigger, CHỈ ăn người) — không đẻ hệ nước thứ hai.
Bảng chia hồ theo kiểu nhiệm vụ nằm ở `StickmanMapSystemBuilder.EnsureMap`: dàn trận / chiếm
điểm 1 hồ (cây cầu thành nút thắt chiến thuật), các kiểu còn lại 0, map đã có khe vực thì thôi.

### Đồ dân sinh (`MapDefinition.economyProps`)

Lều trại dựng quanh doanh trại (`MapScenery.PlaceCampTents`, gọi từ `MapAssembler.BuildCamp` —
lều dạt về phía MÉP map, đặt về phía địch là lều chắn tầm nhìn trận đánh); mỏ vàng + bãi gỗ
rải nửa giữa map. **Tất cả THUẦN TRANG TRÍ, không collider** — gắn collider là
`UpdateBlockedPath` nhận nhầm làm vật cản và cả tiểu đội đứng đập một cái mỏ vàng.

## 7d. LUẬT DỰNG MAP — `MapBuildRules` (một chỗ trả lời "map có CHƠI ĐƯỢC không")

Mọi lỗi map đều cùng một họ: từng mảnh dựng đúng, ghép lại thì hỏng — và hỏng TRONG IM LẶNG.
`MapBuildRules.Validate` gom các bất biến thành phép kiểm chạy được, ba cửa gọi:
· `MapAssembler` sau khi dựng map runtime (log warning kèm seed — dựng lại đúng ván mà sửa);
· tool `Maps > 5. Kiểm tra luật map` trên scene đang mở;
· builder nào muốn tự kiểm thì gọi thẳng.

| # | Luật | Vì sao |
|---|---|---|
| 1 | Bậc thang chênh ≤ 0.18 (đo chênh cao THẬT trong scene) | cao hơn là `TryStepUp` từ chối — cầu thang thành bức tường (bẫy lossyScale đã dính) |
| 2 | Khối đặc cao > 0.5 giữa làn phải PHÁ được / LEO được / đi XUYÊN được | game một làn: khối không lối qua = map đứt làm đôi, trận đứng vĩnh viễn |
| 3 | Đồ trang trí (Leu_/Mo_/Bai_/Cay/Da_) KHÔNG collider đặc | AI nhận nhầm vật cản, cả tiểu đội đứng đập bụi cỏ |
| 4 | Hồ phải có cầu PHỦ KÍN mặt hồ | cầu hụt một khe = AI khựng ở bờ vĩnh viễn |
| 5 | Mốc sinh quân (Cua_Quan/DiemTapKet/Rally/Base_) có ĐẤT dưới chân trong 5 đơn vị | mốc lơ lửng = quân sinh trên trời (đã dính ở Demo_32) |

**Thêm loại công trình mới** thì tự hỏi: nó phạm bất biến nào không, và có cần bất biến MỚI
không. Luật mới = một hàm `Check*` + một dòng trong `Validate` — đừng rải if lẻ trong builder.

## 7e. CHỌN MAP / TẠO MAP TỪ MỌI NƠI

**`MapQuickPicker` là bảng CHUNG — một chỗ vẽ, ba nơi cắm.** Trước đó "chọn / tạo / xoá map"
nằm rải: sân map có đủ bộ, AI Lab chỉ có danh sách xem, chế độ chơi không có gì — ba bản vẽ
tay thì thêm một nút phải sửa ba chỗ, và thực tế đã sót đúng vậy. Bảng gồm: hàng lọc thể loại
· nút **🎲 TẠO MAP NGẪU NHIÊN** · danh sách kho, mỗi dòng kèm nút **✕ xoá** (hai nhịp: bấm lần
đầu HỎI, lần hai mới xoá — xoá asset là mất vĩnh viễn).

· **AI Lab › tab "Bot điều hành"**: bảng chung + chọn VAI trước khi mở (Ngồi xem / Cầm 1 nhân
  vật / Chỉ huy).
· **Mọi scene chơi được**: nút **🗺 Chọn map** trên màn hình bắt đầu + bảng kết quả của
  `GameSession` bật ra chính bảng đó.
· **LƯU map** thì chỉ có ở SÂN MAP (`CanSaveMap`) — lưu cần một map ĐANG CHẠY, mà chỉ sân map
  mới có. Bấm 🎲 ở nơi khác là sang sân map, thích thì bấm "Lưu map này vào kho" ở đó.
⚠ Nút ✕ tự ẩn ngoài Editor (`MapEditing.Available`) — bản build không ghi được vào `Assets/`.
· Đường chuyển vẫn là `MapArenaRequest` (một chỗ tĩnh sống qua lần nạp scene); khoá đặc biệt
  `RandomKey = "*"` nghĩa là "bốc map mới theo công thức của thể loại sân đó".
⚠ Nút chuyển scene chỉ ĐẶT CỜ trong `OnGUI`, `Update` mới `LoadScene` (luật IMGUI).

## 7f. XƯỞNG MAP TRONG GAME — `MapStudio`

Một nút **🗺 Xưởng map** nổi ở góc phải, **tự gắn vào MỌI scene** lúc nạp
(`MapStudioBootstrap`, khuôn `PlayerRespawnBootstrap`). Bấm ra bảng hai tab:

| Tab | Có gì |
|---|---|
| **Kho map** | danh sách map đã lưu · bấm để chơi · **✕ xoá** (hai nhịp: bấm lần đầu HỎI, lần hai mới xoá) |
| **Tạo map mới** | 🎲 bốc map · chỉnh **thông số** (nhiệm vụ · địa hình · rộng · bục · hố · hồ · vật chắn · thang · deco · quân số hai phe) · ▶ chơi thử · **💾 LƯU vào kho** |

⚠ **VÌ SAO PHẢI LÀ NÚT NỔI.** Bản trước cắm bảng vào màn hình bắt đầu + bảng kết quả của
`GameSession` — cả hai chỉ hiện khi ván CHƯA CHẠY hoặc ĐÃ XONG, mà scene nào không có
`GameSession` thì không có luôn hai màn hình đó. Đang chơi thì không có gì để bấm, nhìn vào
chỉ thấy "chẳng có nút nào cả". HUD riêng tự gắn thì không phụ thuộc mode nào, pha nào.

⚠ **LƯU chỉ có trong Editor** — ghi asset vào `Assets/Settings/Maps/` qua `MapEditing.Save`
(`MapEditingBridge` nối bằng `[InitializeOnLoad]`). Ngoài Editor không ghi được vào `Assets/`
nên nút Lưu tự ẩn; map đã lưu thì **đi theo bản build**, trên điện thoại chọn lại bình thường.
Đúng như yêu cầu: *lưu ở Editor, mobile chỉ chọn map đã lưu.*

### KHO MAP LÀ CỦA TỪNG CHẾ ĐỘ, KHÔNG PHẢI MỘT DANH SÁCH CHUNG

Xưởng map đọc **kiểu nhiệm vụ của chế độ đang chơi** (`MatchDirector.Map.mission` nếu có trận
đang chạy, không thì tra tên scene qua `MissionPlan.ForScene`) rồi:
· **Kho map** chỉ liệt kê map CÙNG kiểu — 21 map của 7 kiểu đổ lẫn vào nhau thì người đang
  chơi "AI đánh nhau" phải lội qua map hộ tống, map VIP, map công thành mới tìm ra cái mình
  cần, mà mấy map kia mở lên cũng thành một trận khác hẳn. Có ô *"Xem cả kho"* để thoát hiểm;
· **Tạo map mới** ép `MapGenerator.Generate(..., forceMission:)` đúng kiểu đó, và **bỏ ô đổi
  nhiệm vụ** — đổi nhiệm vụ là đổi luôn LUẬT THẮNG, map lưu xong sẽ biến mất khỏi danh sách
  vì bị chính bộ lọc loại ra;
· **Lưu** vào kho thì nó nằm đúng ngăn của chế độ đó.

### BẤM CHỌN MAP = DỰNG TẠI CHỖ, KHÔNG NHẢY SCENE

⚠ Bản đầu bấm chọn map là `LoadScene` sang sân map. Nhưng người đang chơi màn "Bảo vệ VIP"
chọn một map bảo vệ VIP thì họ muốn **vẫn ở màn đó, chỉ đổi địa hình** — nhảy sang scene khác
là mất luôn ngữ cảnh. Nay `MapStudio.BuildHere` dựng ngay trong scene hiện tại, ba bước theo
đúng thứ tự:
1. **buông map cũ** (`MapInstance.Dispose` — nó biết dọn cả viện binh và đồ rơi nằm ngoài cây map);
2. **dọn cảnh BAKE của scene đúng MỘT LẦN** — đất/nhà/quân/mode bake sẵn trong file scene không
   thuộc map nào nên `Dispose` không đụng tới; để nguyên là hai mặt đất lồng nhau. Giữ lại hạ
   tầng bằng cách hỏi **COMPONENT** (Camera · MapStudio · DemoSceneSwitcher · TouchControls ·
   pool đạn · effect), không hỏi tên object — tên là thứ ai đổi cũng được, không gì bắt lỗi;
3. dựng map mới + ra quân.

⚠ **KỴ SĨ ĐẶT THEO BÀN CHÂN**: `transform.position` là gốc rig, không phải mặt đất.
`DropPeopleToGround` raycast lấy mặt nền rồi trừ `StickmanLocomotion.GroundOffset`, chỉ
chừa `GroundClearance` 0.02 ở bàn chân. Cộng thẳng `surface + 0.1` sẽ làm người lơ lửng/
lún và ngựa (con của `Sprite`) lệch móng sau khi chọn map.

⚠ Nút bấm trong `OnGUI` chỉ ĐẶT LỊCH (`QueueBuild`), `Update` mới dựng: huỷ hàng loạt
GameObject giữa `OnGUI` thì IMGUI vỡ khối GUIClip đang mở — cùng lý do không `LoadScene` ở đó.

⚠ Bấm **R (Chơi lại)** nạp lại scene là về nguyên cảnh bake ban đầu.

⚠ Sân map (`Demo_29..31`) **không gắn** xưởng — nó đã có bộ nút riêng, hai bảng chồng nhau ở
cùng một góc thì không bấm được cái nào.

### Map = PREFAB + BẢNG THÔNG SỐ

Hệ này vốn đã đúng cấu trúc đó, xưởng map chỉ là mặt tiền để sửa mà không phải mở Inspector:
· **bảng thông số** = `MapDefinition` (ScriptableObject);
· **prefab + art** = `MapLibrary` (prefab lính/người chơi, sprite nhà · tường · tháp · cổng ·
  cầu · lều · mỏ · bãi gỗ);
· vào scene thì `MapAssembler` đọc bảng thông số, lấy prefab trong kho ra mà dựng.

## 7g. CHUẨN HOÁ AI THEO GAMEPLAY — `MissionPlan`

Câu hỏi *"kiểu nhiệm vụ này thì ai công, ai thủ, thứ quyết định thắng là cái gì"* từng được
trả lời RỜI ở **ba chỗ**: `MapAssembler.PickDoctrine` (chọn học thuyết) · `MapAssembler.SpawnUnit`
(ai được `siegeProfile` để dám đập công trình) · `MapMissionAI.Decide` (lúc nào dốc toàn lực,
lúc nào lùi giữ). Ba bản `switch` gõ tay thì thêm một kiểu nhiệm vụ phải sửa ba chỗ, và
**lệch nhau lúc nào không ai biết** — quân được lệnh tiến mà tính cách lại né công trình.

`MissionPlan.For(mission)` là bảng luật một dòng mỗi kiểu:

| Nhiệm vụ | Phe A | Mục tiêu | Đập công trình | Cả hai cùng tiến | Mục tiêu biết đi |
|---|---|---|---|---|---|
| Giao chiến | công | — | không | **có** | không |
| Thủ trại | thủ | Nhà chính | **có** | không | không |
| Công trại | công | Nhà chính | **có** | không | không |
| Bảo vệ VIP | thủ | VIP | không | không | **có** |
| Hộ tống | thủ | Xe hàng | không | không | **có** |
| Chiếm điểm | công | Vùng chiếm | không | **có** | không |
| Sinh tồn | thủ | Nhà chính | **có** | không | không |

**Thêm kiểu nhiệm vụ mới = thêm MỘT dòng ở `MissionPlan.For`** (và luật thắng ở
`MatchRules.DefaultFor`) — không đụng ba file kia.

⚠ Bảng này KHÔNG quyết định luật thắng thua (đó là `MatchRules`). Nó nói **AI phải hiểu trận
đấu thế nào** để đánh đúng hướng. Hai thứ phải khớp, và để khớp thì mỗi thứ phải có đúng một chủ.

## 8b. ĐỘ KHÓ TĂNG DẦN + SỐ LIỆU MỘT VÁN


Hai thứ đi cùng nhau: ramp làm trận CÓ NHỊP, bảng số liệu làm cái nhịp đó ĐO ĐƯỢC.

### Đường cong độ khó (`EscalationSettings` + `MapEscalation`)

Mọi map trước đó dàn sẵn hai đạo quân rồi thả ra một lượt — phút đầu đã là lúc căng nhất và
trận chỉ có MỘT nhịp. Nay map mở màn nhẹ rồi mỗi `stepTime` giây lên một bậc, tới `maxStep`.

| Trục | Làm gì | Đi qua |
|---|---|---|
| SỐ LƯỢNG | quân địch ra sân mỏng hơn số khai (`startCountScale`), rồi viện binh đông dần + mau dần | `EnemyWaveSpawner.SetPacing` |
| CÁI ĐẦU | `startSmarts` → `topSmarts` | `StickmanAgent.SetSmartsLevel` |
| ĐỒ NGHỀ | cấp 1 → `topWeaponTier` | `WeaponBase.SetTier` |

⚠ **KHÔNG có trục máu/damage** — đúng luật đã đặt ở `GameDifficulty` và `AIDifficultyDirector`:
cho địch thêm máu là người chơi CẢM THẤY BỊ ĂN GIAN (chém đúng ba nhát như mọi khi mà nó không
chết). Cấp vũ khí là ngoại lệ duy nhất vì "đồ tốt hơn" NHÌN THẤY ĐƯỢC và nhặt được thì cũng
dùng được.

⚠ **RAMP CHỈ NÂNG PHE ĐỊCH** — cố ý. Đây là bài ĐO SỨC CHỊU: con số đáng giá là *"trụ tới bậc
mấy, trong bao lâu"*, không phải một trận cân bằng tuyệt đối.

⚠ **VIỆN BINH PHẢI CÓ ĐÁY.** Luật "diệt sạch địch" hỏi `EnemyWaveSpawner.HasPendingWaves`, nên
sóng vô hạn biến MỌI map giao chiến thành map không bao giờ thắng được — không lỗi nào báo,
chỉ là trận chạy mãi. Vì vậy `MapEscalation.Setup(boundWaves:)` chia hai đường:
· sóng do RAMP dựng ra → kẹp tổng số sóng bằng `maxStep`;
· sóng vốn của NHIỆM VỤ (thủ trại, sinh tồn) → để nguyên vô hạn, vì luật thắng của mấy mode
  đó viết ra khi đã biết có sóng.

⚠ **ÁP LẠI THEO NHỊP (2s), không áp một lần lúc lên bậc.** Viện binh sinh ra GIỮA hai lần lên
bậc mang cấp mặc định của prefab — nhìn vào không thấy gì sai, chỉ là bậc 5 mà quân mới ra vẫn
đánh như lính mới. Cùng lý do `AIPlaybookBinder` có `reapplyInterval`.

⚠ **TRẬN XONG LÀ NGỪNG LEO** (`MatchDirector.MatchEnded`): trọng tài hạ `Time.timeScale` rồi
hiện bảng kết quả — để ramp chạy tiếp là viện binh vẫn ùn ra trong lúc đọc bảng, và con số
"bậc cao nhất" bị đội lên bởi mấy giây SAU khi ván đã kết thúc.

Bảng số theo KIỂU NHIỆM VỤ nằm ở `StickmanMapSystemBuilder.EscalationFor` — **sửa BẢNG LUẬT
rồi bấm `Maps > 1`, đừng sửa tay từng asset**. Map có `timeLimit` thì `stepTime` tự chia theo
giờ trận (chừa 15% cuối cho bậc đỉnh) — không thì trận hết giờ lúc ramp mới leo tới bậc 3 và
nửa đường cong không bao giờ được dùng.

Chơi lại (F5 / "Dựng lại") là dựng map mới → component mới → **ramp về bậc 0**.

### Số liệu một ván (`MatchStats`)

Mỗi ván chốt sổ thành MỘT DÒNG, ghi ra `Application.persistentDataPath/StickmanStats/`:

| File | Một dòng là gì |
|---|---|
| `matches.csv` | một VÁN: map · nhiệm vụ · thể loại · vai · seed · thắng/thua · giây · bậc khó cao nhất · quân ra sân · tổn thất hai phe · công trình mất · người chơi hạ/gục · phút đổ máu đầu tiên |
| `timeline.csv` | một MỐC 5 GIÂY: quân sống hai phe + bậc khó lúc đó — đây mới là thứ vẽ ra ĐƯỜNG CONG của trận |

· Đọc ngay trong sân: nút **"Số liệu (N ván)"** trên bảng điều khiển của `MapArena`, và tóm
  tắt hiện luôn trên bảng kết quả cuối trận. Vòng lặp thiết kế level là *chỉnh một số → chơi
  lại → so*; mở Excel giữa chừng là đứt vòng lặp đó.
· **Đo bằng sự kiện có sẵn**: `TeamMember.AnyDied` (đường mà `StickmanExperience` đã đi) +
  `MatchDirector.MatchEnded`. KHÔNG thêm dòng đếm nào vào `TakeDamage` — chỗ đông chủ nhất
  của dự án.
· ⚠ **Chỉ đếm NGƯỜI** (`StickmanFighterController`): tường/tháp cũng có `TeamMember` và cũng
  chết được, gộp chung là con số tổn thất nói dối (cùng bẫy với `RespawnDirector` đếm quân).
· ⚠ **Ván BỎ DỞ cũng là số liệu** ("map này chơi 20 giây là chán") — `OnDisable` chốt sổ.
· **Scene thường cũng được ghi**: `MatchTelemetryBootstrap` tự gắn `MatchStats` lúc nạp scene
  (khuôn `PlayerRespawnBootstrap`) nên gần 40 scene đã bake KHÔNG cần bấm tool vá nào. Nó
  thoát sớm khi scene có `MapArena`/`MapPopulator` — sân map tự gắn bộ ghi riêng, hai bộ cùng
  chạy là mỗi ván ghi hai dòng. Ván không có ai ngã thì không ghi dòng nào (mở bàn thử ra ngắm
  vũ khí không phải một ván chơi).

## 8c. AI PHẢI ĐÁNH ĐỂ THẮNG CÁI MAP NÀY (đã sửa — đừng làm lại)

Triệu chứng: hai phe hành quân ra giữa sân đánh nhau, còn xe hàng / điểm chiếm / cái nhà thì
không ai ngó tới. Không lỗi nào báo, mọi hệ vẫn chạy đủ. Ba nguyên nhân CHỒNG NHAU:

### (1) Cột mốc của cây chỉ huy là con số CHỤP LÚC `Start`

`CommandNode.ApplyToAgent` ghi đè behavior của MỌI lính **mỗi nhịp** theo cột mốc của cây chỉ
huy. Nên lệnh đúng-mục-tiêu gán lúc spawn (`GuardTarget(xe hàng)`, `HuntTarget(VIP)`) chỉ sống
được vài frame rồi bị thay bằng "đi tới mốc căn cứ địch".

Tệ hơn: `TeamCommander.BuildHierarchy` đọc hai cột mốc ra hai CON SỐ rồi nhét vào cây đúng một
lần — mọi mục tiêu BIẾT ĐI không kéo được cánh quân theo. Map hộ tống vì thế hỏng hoàn toàn:
xe lăn bánh sang bên kia map một mình còn cả hai phe đứng đánh nhau ở vạch xuất phát.

Chữa **ở gốc**, không chữa ở từng chỗ gọi `SetBehavior` (chữa ở chỗ gọi thì mai thêm kiểu
nhiệm vụ lại dính lại):
· `CommandNode.SetBattlefield(forward, homeX, enemyBaseX)` — dời cột mốc chiến trường giữa trận;
· `TeamCommander.Update` đọc lại vị trí hai mốc mỗi **0.3s** rồi truyền xuống cây;
· `MapAssembler` cho cây chỉ huy cầm ĐÚNG mục tiêu nhiệm vụ làm mốc:

```
HomeAnchorA  = guardTargetA  ?? baseA      EnemyAnchorA = attackTargetA ?? baseB
HomeAnchorB  = guardTargetB  ?? baseB      EnemyAnchorB = attackTargetB ?? baseA
```

Bốn dòng đó là toàn bộ chỗ nối giữa LUẬT THẮNG THUA và CHỖ TƯỚNG ĐIỀU QUÂN TỚI.

### (2) Học thuyết chỉ biết ĐẾM QUÂN, không biết đang chơi trò gì

`CommandDoctrine` quyết thế trận bằng đúng một câu hỏi (`PowerRatio`). Nó không biết đồng hồ
sắp hết, xe sắp về đích, điểm chiếm đang thua, hay địch đã vào tới sân nhà.

`MapMissionAI` (gắn cùng object với `MatchDirector`) là tầng trả lời bốn câu đó. Nó **chỉ phát
LỆNH** qua đúng API mà nút HUD của người chơi vẫn dùng (`Issue` / `CommandHold` / `CommandAuto`)
— không đụng từng lính, không thêm state, không thêm behavior.

| Nhiệm vụ | Phe thủ | Phe công |
|---|---|---|
| Thủ trại · Sinh tồn · Bảo vệ VIP | địch vào trong 9 đơn vị quanh mục tiêu, hoặc mục tiêu còn <40% máu → **LÙI VỀ GIỮ** | còn <40% giờ trận, hoặc mục tiêu địch còn <50% máu → **DỐC TOÀN LỰC** |
| Công trại | (phe B giữ nhà — như trên) | (phe A công — như trên) |
| Hộ tống | có địch bám xe → quây quanh xe · đường thoáng → **đi trước dọn đường** | xe qua 55% quãng đường → **chặn bằng mọi giá** |
| Chiếm điểm | đang dẫn >25 điểm → **giữ chỗ đang đứng** | đang thua → **đi tranh điểm** |
| Dàn trận | trả lái cho học thuyết (cán cân quân số là câu hỏi đúng ở đây) | |

⚠ **PHẢI CÓ QUÁN TÍNH** (`_minHold` 6s). Đây là luật ĐỌC tình hình rồi ĐỔI tình hình (đổi lệnh
→ quân dời chỗ → tình hình đổi) — đúng khuôn "hai luật kéo ngược nhau" ở AGENTS §5c. Không có
quán tính là cả phe tiến-lùi-tiến-lùi mỗi nhịp chấm.

⚠ **Không tranh tay lái với NGƯỜI**: vai `PlayerRole.Commander` thì phe người chơi được bỏ qua.

⚠ **Trận xong là ngừng phát lệnh**, không thì quân vẫn xông lên trong lúc bảng kết quả hiện ra.

### (3) Chiếm điểm: phe bị đẩy về thế thủ ngồi chờ thua

`CommandNode.ComputeLineAnchor` chỉ ngó tới `CapturePoint` **ở thế TẤN CÔNG**. Hai vế chữa:
· `PickDoctrine` cho map chiếm điểm dùng **học thuyết tấn công cho CẢ HAI phe**;
· đạo quân KHÔNG có tướng (map ít quân, `army.commander = size >= 4`) nhận đích hành quân là
  **điểm gần tuyến mình nhất** thay vì căn cứ địch.

### Kèm theo

· **Viện binh NHẬP NGŨ** (`EnemyWaveSpawner.EnlistInCommand`): quân mới ra vào thẳng cây chỉ
  huy của phe. Không có vế này thì từng đứa lẻ tẻ chạy vào chỗ chết trong khi cả cánh quân
  đang dàn tuyến ở chỗ khác.
· **`MapLibrary.defaultProfile` trước đây BỎ TRỐNG** (null) — lính map lấy đại tính cách nằm
  sẵn trên prefab NPC và không có chỗ nào chỉnh được. Nay là `AIProfile_Map_Field`:
  `visionRange` 9 (map rộng 26–46, tầm 7 là hai tuyến đi ngang nhau vẫn chưa thấy nhau) và
  `spotShareRadius` 8 (thấy địch thì HÔ — khác biệt giữa ĐÁM ĐÔNG và ĐỘI HÌNH).
· **Bảng mục tiêu hiện luôn AI ĐANG NGHĨ GÌ** (`[TA] …` / `[ĐỊCH] …`): không có dòng đó thì
  "AI đánh vu vơ" mãi là một cảm giác, không tra được. Cùng tinh thần với bảng chỉ huy F9.

## 9. Bẫy đã dính / đã phòng — đừng làm lại

1. **KHÔNG dựng tường cao chắn ngang đường đi.** AI không leo tường: cả trận sẽ đứng nhìn nhau
   qua bức tường. Vật chắn của map luôn thấp hơn người (`MapScenery.BuildCovers`), tháp thì dựng
   LỆCH sang hai bên chứ không bịt lối vào nhà.
2. **Nhà cửa dùng collider TRIGGER.** Nhà đặc là cả tiểu đội xúm lại chen trước cửa; trigger thì
   lính đi xuyên còn tên/kiếm/bom vẫn trúng.
3. **`ConfigureAsStructure` phải chạy TRƯỚC khi object được bật.** `_buildBodyHitboxes` chỉ được
   đọc một lần trong `Awake` — bật trước là Unity đi dựng hitbox cơ thể cho một cái nhà. Mẫu
   đúng: tạo object tắt → AddComponent → Configure → `SetActive(true)`.
4. **Xoá điểm chiếm giữa hai ván** (`CapturePoint.ResetScores`). Điểm cộng dồn trong biến TĨNH:
   không xoá là ván mới vừa bắt đầu đã thắng bằng điểm của ván trước.
5. **Dựng lại map phải chờ một frame.** `Destroy` chỉ thật sự xảy ra cuối frame — dựng ngay lập
   tức là có HAI trận cùng tồn tại một nhịp và trọng tài mới đếm nhầm quân của trận cũ
   (`MapArena.Rebuild` có `yield return null`).
6. **Đồ rơi không nằm trong cây map.** Lúc chết, vũ khí/trang bị `SetParent(null)` — dọn map mà
   chỉ `Destroy(root)` thì sân vẫn còn kiếm của ván trước (`MapInstance.Dispose` quét `DroppedItem`).
7. **Muốn quân đập nhà thì phải đủ CẢ BA** (bài học từ mode Doanh trại):
   `CommandDoctrine.pushToEnemyBase` · `AIProfile.structureTargetBonus` DƯƠNG ·
   `SelectBestEnemy` nhận diện công trình. Hệ map lo hai cái đầu bằng
   `MapLibrary.assaultDoctrine` + `MapLibrary.siegeProfile` (tool `Maps > 1` sinh sẵn).
8. **`EliminateEnemies` chỉ đếm NGƯỜI.** Nhà cửa cũng là `TeamMember`; đếm cả vào thì diệt sạch
   quân địch rồi trận vẫn không kết thúc vì còn cái tháp đứng đó.
9. **Vế "phá mục tiêu địch" không áp dụng khi địch không có mục tiêu đó** — nếu không, map không
   có nhà là phe kia thắng ngay giây 0.
10. **Trả `Time.timeScale` về 1.** Trận kết thúc có slow-motion; đổi scene hoặc dựng lại mà quên
    trả là ván sau chạy chậm (`MatchDirector.OnDisable`, `MapArena.OnDestroy`).

## 10. Bảng tool

| Menu | Việc |
|---|---|
| `Maps > 1. Build Map System (3 thể loại)` | Sinh `Resources/MapLibrary.asset` + **21 map mẫu (7 × 3 thể loại)** + 3 công thức random + 3 bộ quân (`GenreKit`) + loadout hiện đại/fantasy + học thuyết công/thủ + tính cách quân công thành/dân thường |
| `Maps > 2. Create Map Arenas (3 sân)` | Dựng `Demo_29_MapMedieval` · `Demo_30_MapModern` · `Demo_31_MapFantasy` |
| `Maps > Sân > Trung cổ / Hiện đại / Fantasy` | Dựng lại lẻ một sân |
| `Maps > 3. Bake map đang chọn` | MapDefinition → scene tĩnh `Map_<key>.unity` |
| `Maps > 4. Sinh 1 map ngẫu nhiên thành asset` | Lưu một map random ra đĩa để chỉnh tiếp |

Phím trong sân map: **F2** chọn map · **N** map ngẫu nhiên mới · **F5** chơi lại.
Mỗi sân chỉ hiện map của thể loại mình (`MapArena._genre`), nút "Map mới" bốc theo đúng công
thức của thể loại đó.


## 9. BA NHIỆM VỤ MỚI — cướp cờ · kéo co · cướp làng (2026-09-05)

Hệ map lúc ấy có **10 kiểu** (nay 24) (`MissionType.CaptureFlag` · `TugOfWar` · `RaidVillage`). Ba kiểu này KHÔNG
mượn `CaptureTheFlag`/`TugOfWarLine`/`VillageRaid` của scene dựng tay (chúng là `MatchModeBase` —
trọng tài thứ hai, lái AI bằng `TeamOrder`, giằng với cây chỉ huy); chúng đi đúng đường của hệ map.

| Kiểu | Cơ chế | Vế thắng | Mốc cho cây chỉ huy |
|---|---|---|---|
| `CaptureFlag` | `MapFlag` (nhặt · theo người vác · +1/giây · rơi khi ngã · 22 s tự về) | `FlagScore` ≥ `captureScoreToWin` (hai phe) | cả hai: `EnemyAnchor = lá cờ` |
| `TugOfWar` | `MapFrontLine` (trôi về phía ít quân hơn trong bán kính 7) | `PushLine` chạm trại địch | cả hai: `EnemyAnchor = tuyến` |
| `RaidVillage` | đình + thành luỹ có cổng + dãy nhà dân vai `House` + `MapVillage` | cướp `RazeCount` ≥ `housesToBurn`; làng `SurviveTime` + `Wipe` | cướp: mốc = nóc nhà còn sống gần nhất; làng: `guardTarget = đình` |

**Hết giờ → `MatchDirector.TryTimeoutVerdict`**: nhiệm vụ có giờ mà không có vế `SurviveTime` thì
hết giờ so điểm cờ / vị trí tuyến / điểm chiếm → quân số còn sống → phe chủ nhà. Không có hoà.

**Xưởng map**: tab Tạo map có khối **LUẬT THẮNG / THUA** (`DrawWinRules`) — núm theo nhiệm vụ
(giờ trận · điểm · số nóc nhà · máu nhà · sóng) + danh sách vế thật (`ResolveRules()`).

**Thêm kiểu nhiệm vụ = 13 chỗ** (§4 ghi "3 chỗ" là số của ngày đầu): enum · `MissionInfo` ·
`MatchRules` · `MatchDirector` · `MissionPlan` · `MapMissionAI` · `MapBlueprint` · `MapGenerator` ·
`MapKitPlanner` · `MapCastle.DefaultFor` · `MapAssembler` · ba bảng `Missions` (+`CoveredByScene`) ·
`StickmanMapSystemBuilder` (map mẫu × 3 thời kỳ + `SettingsFor` + `EscalationFor`).


## 10. ĐẤT CONG — đồi lượn (2026-09-05)

Map lắp ghép không còn là một khối vuông: `MapScenery.TerrainProfile.Build` sinh mảng cao độ (ba
sóng sin theo seed × `hillAmplitude` × hệ số kiểu địa hình) rồi san phẳng mọi LÔ + chân đế công
trình + mép hồ + hai đầu map (mép mềm 3). `BuildGround` dựng mỗi dải đất (giữa hai hồ) thành một
`TerrainGround` (Combat): mesh thân đất + dải cỏ theo mặt, `PolygonCollider2D` đặc, tag `Ground`.

- **Đi lại**: `StickmanLocomotion.UpdateTerrainRide` — mặt dốc giả như cầu thang; lên dốc chậm
  (`_slopeScale`). AI không cần luật mới: `HasGroundAt`/`IsLedgeAhead` đọc đa giác đặc như bậc thang.
- **LaneNav**: cả dải = một nút ở `BaseY`; người trên đồi được quy về nút đó.
- **Xưởng map**: hai núm «Đồi lượn (biên độ · bước sóng)»; mặc định 0.7 / 11 → dốc tối đa ~16°.
- **Lõm lỗ**: `TerrainGround.Deform` + `Explosion.Detonate → TryCrater`, ẩn sau
  `TerrainGround.CratersEnabled = false` (tạm ẩn theo ý người dùng).
- Mô phỏng: `python .claude/skills/stickman-assets/scripts/terrain_preview.py --amp 0.7 --wave 11`.


## 11. MỐC SỰ KIỆN CỦA MAP — `MapEventMarker` (2026-09-05)

Một điểm trên map kèm **loại · phe · bán kính · sức chứa**, không collider, **không `TeamMember`**
(gắn vào là nó lọt radar chọn mục tiêu và mọi vòng đếm quân phải nhớ lọc ra — đúng khuôn
`RiderlessHorse.All` / `AmmoCache`). Phe `−1` = trung lập.

`MapEventKind`: `Spawn` · `Rally` · `Ambush` · `Sniper` · `Breach` · `Supply` · `Defend` ·
`Patrol` · `Retreat` · `Objective`.

**Ba đầu, nối đủ ngay từ lần đầu** (khai mà không ai gọi là khai suông — bài học `volleyWaitTime`):

| Đầu | Ở đâu |
|---|---|
| ĐẶT TAY | `MapDefinition.events[]` (`PlacedEvent`) + tab **«Mốc sự kiện»** của Xưởng map |
| TỰ SUY | `MapAssembler.BuildEventMarkers` khi `map.autoEvents` (mặc định BẬT): mốc sinh quân → `Spawn`, mục tiêu → `Objective`, mặt ngoài tường thành → `Breach` |
| AI ĐỌC | `MapAssembler.ApplyEventRoles`: lính RẢNH trong 18 đơn vị nhận vai — `Ambush` → `AIBehavior.Ambush`, `Sniper`/`Defend` → `GuardTarget` vào chính cái mốc |

API: `MapEventMarker.FindNearest(kind, team, from, needRoom)` · `Collect` · `Any` · `TryClaim()` ·
`ResetClaims()` · `Create(parent, kind, at, team, radius, capacity, label)`. Gizmo mỗi loại một màu.

⚠ **Sức chứa là vế bắt buộc** — không có trần thì cả tiểu đội dồn vào một ổ phục kích (bệnh mà
`GarrisonPost` chia suất để tránh ngay từ đầu).
⚠ **Chỉ cướp lính RẢNH** (`FreeRoam`/`HuntTarget` không cột mốc): kẻ đang vác thang, trấn thủ,
hộ tống, đẩy xe công thành đều có việc nhiều pha.
⚠ **`MapBuildRules.CheckEventMarkers`** đo từng mốc: trong map · không lơ lửng trên vực · không
cao hơn mặt đất 3.5 / thấp hơn 0.6. Mốc đặt giữa không khí thì AI đi tới rồi đứng dưới chân nó
tới hết trận, **không lỗi nào báo**.

### 11b. Đu dây lên tường thành

`StickmanClimbZone.IsRope` đã có từ lâu mà **chưa map nào dựng một sợi dây nào**. Nay
`MapAssembler.AutoBreachMarkers` thả dây dọc MẶT NGOÀI tường thành (`Setup(isRope: true, ...)`)
kèm một mốc `Breach`, nên quân công có đường lên mặt tường ngoài cổng và ngoài cầu thang.

⚠⚠ **`LaneNav` từng lọc `!zone.IsRope`** ⇒ sợi dây dựng ra không nằm trong đồ thị: AI không bao
giờ lập được lộ trình qua nó, và luật 6 vẫn báo *"tầng cô lập"*. Nay dây là một cạnh leo bình
thường, **chi phí ×1.35** — có cầu thang thì AI vẫn chọn cầu thang; dây là đường CÓ GIÁ, không
phải đường tắt.
⚠ Đất cong (`TerrainGround`) quy về MỘT nút ở `BaseY`, và `FindNode` lùi về nút đó cho ai đang
đứng trên đỉnh đồi — không thì người trên đồi rơi ra ngoài đồ thị.

**Phải dựng lại map đã bake** để có mốc + dây: bấm *Hệ thống map* rồi mở lại sân map.

## Ý tưởng xây map — trung cổ & bắn súng (2026-09-06)

Đã có sẵn (chỉ cần bật trong `MapLotSet`/wishlist): thềm bậc (`Terrace`), đường trên (`HighRoad`),
tầng 3 (`upperTier`), hồ + cầu gỗ (`Lake`), ụ che thật (`Cover`), chòi canh (`Watchtower`), hầm chui
(`Underpass`), tường biên. Cấu trúc scatter: nhà 7 kiểu × vai, mỏ, chợ, cối xay, giàn giáo, hành lang
vòm, chồng thùng (leo + chắn đạn), ổ nấp, cột cao, quảng trường.

Chưa làm — mỗi ý là một lô/kind mới, dựng bằng primitive có sẵn (bậc `BuildStairs`, sàn một chiều,
`FinishFort`, `Nap_*`), không cần luật AI mới:

| Ý | Trung cổ | Bắn súng | Primitive |
|---|---|---|---|
| **Cống ngầm dài** — hầm nối hai thềm, nóc là đường | hào nước rút vào cống | cống bê tông có lưới cửa | `Underpass` + cửa `Fortification` Gate `passableForOwner` |
| **Cầu vượt + gầm cầu** — làn trên qua sông, làn dưới là bãi | cầu đá vòm | cầu cạn bê tông | `Arcade` nhiều nhịp + `Lake` dưới |
| **Hố bom / hố sụt** có bậc leo lên — thấp hơn đất, che đạn cả hai chiều | hố công thành | hố pháo | `Underpass` không nóc (pits + hai `BuildStairs`) |
| **Dốc thoải** thay bậc (xe/ngựa qua được) | đường lên cổng | dốc bãi đỗ | `AddRamp` + `Layout.ramps` (đã có) |
| **Tường chắn có cửa sổ bắn** — cover có khe: đứng thì bắn, ngồi thì kín | lỗ châu mai | bao cát có khe | `Nest` cao 0.9 + `BlocksProjectiles` theo tầm cao đạn |
| **Nhà hai tầng vào được** — sàn trong, thang trong, cửa sổ bắn | nhà phố | chung cư | `House` với `walkY` + `extraStairs` trong thân |
| **Tháp nước / silo** trèo bằng thang treo, đứng bắn trên nóc | tháp chuông | tháp nước | `Tower` `CreateLadder` + `CreatePost` |
| **Thùng nổ / rào có máu** — cover phá được | rào gỗ | thùng phuy nổ | `BuildBarricade` health > 0, `AreaHazard` khi vỡ |
| **Đường ray / băng chuyền** sàn dời (nhánh cơ khí) | — | băng tải kho | `PlatformEffector2D` + `IPinnedInPlace` |
| **Ngày/đêm theo lô** — đèn quảng trường sáng đêm | đuốc | đèn đường | `DayNight` + `Part_Plaza_Lamp` glow |

Nguyên tắc cho mọi ý: (1) mọi mặt đứng được phải có lối lên/xuống mà `MapBuildRules` đo được;
(2) sàn KHÔNG phủ lên dãy bậc quá 1.0 (`WarnDeckOverStairs`); (3) thứ nằm trên làn chính phải
`passableForEveryone` hoặc là Gate; (4) vật che phải là `Fortification` — khối vẽ không chắn gì.
