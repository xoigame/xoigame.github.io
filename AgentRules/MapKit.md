### ⚠⚠ MAP LẮP GHÉP TỪ LÔ ĐẤT — `MapKit` cho cả 7 kiểu chơi (2026-09-04)

Bản mở rộng của `FortKit` lên toàn hệ map (`Demo_29/30/31`, Xưởng xây map, MapStudio, map
bake). Chi tiết: `Docs/KnowledgeBase/MapKit.md`.

**Một map = DÃY LÔ ĐẤT.** Mục tiêu của kiểu chơi là LÔ BẮT BUỘC (`MapKitPlanner.FixedLots`:
chỗ sinh quân hai đầu · trại · vùng chiếm · đích), địa hình là LÔ LẤP (`Wishlist`: thềm ·
đường trên · ụ che · hồ+cầu · chòi canh) nhét vào khoảng trống giữa chúng. Bản cũ rải địa hình
NGẪU NHIÊN rồi đặt mục tiêu bằng công thức cố định (`±0.88·hw`, vùng chiếm rải đều theo
`1.2·hw`) nên vùng chiếm có thể rơi cạnh một cái thềm vô nghĩa, còn thềm thì có thể mọc trúng
tuyến xuất phát. Nay `MapScenery.BuildWithKit` dựng theo lô và `MapAssembler` hỏi
`layout.kit` để đặt mục tiêu: trại → `MapLot.hallX/reach` · vùng chiếm → tâm lô, vòng ở
`SurfaceY` (trên thềm thì phải leo) · đích → lô đích · tuyến xuất phát/cửa viện binh/người
chơi → lô sinh quân, hoặc SÂN TRONG của thành khi phe có trại (`FortBuild.defendersNear*`).

| File | Vai |
|---|---|
| `MapKit.cs` | `MapLotDef`/`MapLotSet` (bảng mảnh — code là nguồn sự thật, asset `Settings/MapKit/MapLotSet_Default.asset` là bake) · `MapLot`/`MapKitPlan.Validate()` |
| `MapKitPlanner.cs` | `FixedLots` theo kiểu chơi → `FillGaps` theo `Wishlist` (kiểu chơi × kiểu địa hình), không vừa thì bỏ + ghi `concessions` |

⚠ **`MapDefinition.modularLayout` MẶC ĐỊNH BẬT** — 21 map mẫu đã lưu tự thành map lắp ghép
khi nạp (field mới nhận giá trị khởi tạo). Tắt cho một map = quay về rải ngẫu nhiên kiểu cũ;
`platformCount/coverCount/lakeCount` từ nay là SỐ MONG MUỐN cho planner, không phải số dựng.
⚠ **Hồ CẤM ở thủ trại / sinh tồn / hộ tống / VIP** (`Validate` + `Wishlist`): hồ là `pit`,
xe/VIP không nhảy, quân thủ bị cắt khỏi đình. **Vùng chiếm trên thềm** thì vòng đặt ở
`SurfaceY` và bán kính co theo mặt thềm — đặt ở mặt đất là đứng dưới chân thềm cũng chiếm được.
⚠ **LÔ NÀO PHẲNG, LÔ NÀO CÓ ĐỒI** (đổi 2026-09-06 — `TerrainProfile.NeedsFlatBase`): chỉ lô có
HÌNH HỌC CỨNG mới san phẳng về mặt gốc — trại · đích · thềm · đường trên · vùng chiếm trên thềm ·
chòi canh · hồ. Lô **sinh quân · đường · ụ che · vùng chiếm đất bằng** để ĐỒI chạy qua; cửa viện
binh, xe hàng và người chơi vẫn nằm trong lô sinh quân nhưng nay neo vào `Layout.TerrainY(x)` chứ
không neo vào `groundTop`. Trước đó mọi lô đều phẳng, và vì lô phủ gần hết bề ngang nên map khai
"đồi" mà chơi ra bãi đất (đỉnh đồi đo được 0.06–0.24). Xem `Docs/AgentRules/Terrain.md`.
⚠ **CHÒI CANH THEO KIỂU CHƠI, KHÔNG THEO DÁNG ĐỊA HÌNH**: `Wishlist` cũ chỉ thêm `Watchtower` khi
`terrain == Fortress`, mà chỉ 4/10 kiểu nhiệm vụ dùng dáng đó ⇒ dàn trận · chiếm điểm · cướp cờ ·
kéo co · hộ tống không có lấy một công sự nào. Nay: mọi kiểu đều có, trừ **bảo vệ VIP** (thang là
VIP leo lên rồi kẹt) và **hộ tống** chỉ khi `halfWidth ≥ 32`.
⚠ Thêm kiểu chơi = một nhánh `FixedLots` + một nhánh `Wishlist` + luật riêng ở `Validate`;
thêm mảnh = một dòng `DefaultLots()` rồi bấm *Bộ mảnh ghép ĐỊA HÌNH*. **Đừng sửa `FillGaps`.**
⚠ Kiểm: mô phỏng Python lô bắt buộc qua toàn dải `MapBlueprint` (678 tổ hợp) 0 chồng/lọt mép;
tool *Soi 7 kiểu chơi × 20 seed* chạy `Validate()` 140 kế hoạch + dựng 14 map vào scene tạm
với `MapBuildRules`. Bấm sau mỗi lần sửa bảng mảnh hay planner.
⚠ `MapScenery.BuildPlatforms`/`BuildCovers` giữ lại làm ĐƯỜNG CŨ; phần dựng đã tách ra
`BuildTerrace` / `BuildCoverCluster` để cả hai đường dùng chung một hình học.


## HẦM CHUI · TƯỜNG BIÊN · Ụ CHE THẬT (2026-09-06)

### Ụ che là `Fortification`, không phải khối vẽ

`BuildCoverCluster` từng dựng khối `solid:false` cao 0.1–0.17: đạn xuyên, `FindCover` không thấy
(chỉ quét `Fortification` có `BlocksProjectiles`), người chơi đứng sau vẫn trúng. Nay là
`MapCastle.BuildCover` = Barricade trung lập (`teamId −1`, `passableForEveryone`, bất tử,
`objective:false`), cao **0.5–0.65** so với stickman 0.73: đạn ngang tầm nòng cắm vào ụ, người
ngồi khuất, người đứng ló đầu vai. `Stack` (chồng thùng/container) và `Nest` (ổ nấp) của
StructureKit cũng đi qua `FinishFort` cùng cách — xem StructureKit V9.

Chỉ xạ thủ CẦM SÚNG mới tìm ụ (`Profile.coverSeekRadius` > 0 ở hồ sơ bắn súng, và
`HoldingFirearm`). Cung thủ trung cổ KHÔNG nấp — cố ý, vì mũi tên bay vòng và cung thủ đứng
bắn; muốn đổi thì mở `coverSeekRadius` cho hồ sơ cung, không sửa `FindCover`.

### Lô `Underpass` — tầng dưới

`MapLotKind.Underpass = 11`, def `Underpass` (sàn 4–6, 7–8 bậc ⇒ sâu 1.05–1.2, lô 9–11.5,
`minHalfWidth 26`). Planner thêm cho Annihilation/TugOfWar (`halfWidth ≥ 28`) và ba kiểu trại
(`≥ 30`). `MakeLot` cộng hai `stairRun` vào bề rộng như thềm.

Dựng (`MapScenery.BuildUnderpass`): `Layout.tunnels` chừa lỗ đất (**không** nằm trong `pits`:
`IsOverPit` phải false trên nóc, `MapFallGuard` vẫn bật); `BuildGround` gộp `pits ∪ tunnels`
theo x; `TerrainProfile` san phẳng ±2.5 quanh hầm. Hình từ trái sang: dãy bậc xuống ‖ sàn
giữa ‖ dãy bậc lên. Nóc trên sàn giữa = khối đặc tag `Ground`; nóc trên hai dãy bậc = nắp
`Nap_*` (Fortifications «Nắp hầm»). Đầu cao của thang ở ĐÚNG mép lô — không có sàn phủ lên
bậc (`WarnDeckOverStairs` = 0).

Đường xuống: từ nóc phải ĐÒI (▼ / `RequestStairsIfNeeded`); đường lên: từ chân thang trong
hầm như mọi cầu thang (bậc 0.15 ≤ trần 0.18, đi bộ lên cũng được).

### Tường biên

`BuildEdgeWalls` (map ghép, gọi cuối `BuildGround`) và `StickmanSceneUtils.CreateEdgeWalls`
(scene bake, gọi trong `NewScene` ngay sau `CreateGround`): hai khối vô hình dày 0.6 ở NGOÀI
mép (`collider` chạm đúng `±halfWidth`), cao 6 trên đất, tag `Ground` (lane check bỏ qua, đạn
cắm như đất), renderer tắt. Scene đã bake chỉ có tường sau khi dựng lại.

## SÔNG · CẦU · NÚI · THỜI TIẾT THEO SEED (2026-09-06)

### Mưa và tuyết đã nằm chết trong code

`WeatherAmbience` có đủ vật liệu, hình hạt và nhịp rơi cho `Rain` và `Snow` từ lâu, nhưng
`MapAtmosphere.For` chỉ trả `Embers`/`Ash`/`Leaves`/`None` — **hai lớp thời tiết đẹp nhất không
map nào dùng**, và không lỗi nào báo. Nay có trục thứ ba: `MapAtmosphere.Roll(setting, genre, seed)`,
42 % số map có một đợt mưa hoặc tuyết.

Ba luật của đợt thời tiết:
* màn đang cháy (`Embers`) **không bị đè** — tàn lửa là tín hiệu người chơi phải thấy;
* mưa/tuyết kéo hạt lửng sang `Fog` — bụi khô bay trong mưa là hai lớp cãi nhau;
* đêm giữ `Fireflies` — đom đóm là nguồn sáng duy nhất của `Survival`, đổi sang sương là tối đen.

Tỉ lệ tuyết: hiện đại 28 %, trung cổ 40 %, fantasy 55 %. `MapScenery.ApplyAtmosphere(theme, map, seed)`
lấy seed của map; seed 0 = rơi về tên map, nên map mở lại vẫn đúng cái trời đó.

### Lô `River` — sông, khác hồ

`MapLotKind.River = 12`, hai def (`River_Narrow` 6.5–8 · `River_Wide` 8.5–10.5, `minHalfWidth` 24/30).
Sông đi vào `pits` + `lakes` như hồ (được hưởng cả bộ luật né vực) **và** thêm vào `Layout.rivers`
để dựng ra khác: dòng chảy ngang mặt nước, lau sậy hai bờ, cầu có trụ.

⚠ Sông **THAY** một cái hồ chứ không cộng thêm (`MapKitPlanner.Wishlist`) — cộng thêm là map toàn nước.

### Cầu

`DressBridge` chạy cho MỌI cây cầu: hai cột đầu cầu, tay vịn ngang, cọc lan can thưa; thêm trụ
xuống nước khi cầu dài hơn 4.5 hoặc bắc qua sông.

⚠⚠ **Lan can không được có collider.** Mặt cầu là một đoạn của làn chính (`MapBuildRules` miễn trừ
theo tên cha `Cau_Go_*`); hai cây cột đặc ở hai đầu cầu là hai vật cản đặt đúng chỗ hẹp nhất của
map, và AI sẽ xúm vào đập cái lan can.

### `StructureKind.Cliff` — núi

6 mảnh mới (chân · thân · đỉnh · mũ tuyết · đá vụn · thông). Toàn TRIGGER: núi là CẢNH, phần chơi
được của độ cao đã có thềm và tháp lo. Cao 2.2–4.6 so với stickman 0.73.

⚠ Ba số đã phải sửa SAU KHI NHÌN BẢN VẼ THỬ (`cliff_preview.png`) — cả ba đều "đúng" khi đọc code:
| Sai | Ra cái gì | Chốt |
|---|---|---|
| mỗi khúc cao 1.3, tới 3 khúc, cỡ tới ×1.6 | cột đá cao 6–10, hẹp hơn chiều cao của nó | khúc cao 0.8, tối đa 2 khúc, đỉnh là khối lớn nhất |
| mặt trên vẽ theo parabol | chồng ổ bánh mì, biên phình ở mỗi khúc | hình thang, sườn thẳng, lún vào nhau 28 % |
| đỉnh lấy bề ngang gốc của mảnh | hai vai chìa ra ngoài sườn ⇒ CÂY THÔNG | đỉnh rộng = mặt trên khối dưới (`CliffTopFace` 0.62) |
| mũ tuyết rộng 62 % đỉnh | vành nón chìa ra hai bên | 40 %, vì ở độ cao 58 % tam giác chỉ còn 42 % |

`MapScenery.BuildFrameMountains` dựng 2–4 ngọn NGOÀI vùng chơi ở hai đầu map (bóng nền, lùi thứ tự
vẽ 24). Núi trong sân che mất nửa màn hình ở đúng chỗ đánh nhau; núi ngoài mép thì nói cho người
chơi biết map kết thúc ở đâu — đi cùng tường biên vô hình: tường chặn, núi giải thích.

## ⚠⚠ KHAI 0 BỤC LÀ 0 BỤC — bảng số không được nói dối (2026-09-09)

`MapDefinition.platformCount` là số THỀM muốn có (mặc định 2; ô «Bục cao» trong Xưởng map
kéo được về 0). Trước ngày này **cả hai đường dựng đều ép tối thiểu một cái**:

| Chỗ | Câu cũ | Hậu quả |
|---|---|---|
| `MapScenery.BuildPlatforms` (map rải ngẫu nhiên) | `Mathf.Max(1, platformCount)` | luôn có `Tuyen_Ground_Tang_2` rộng 10–16 đơn vị |
| `MapKitPlanner.Wishlist` (map lắp ghép) | `Mathf.Clamp(terraces, 1, …)` ở 8 chỗ | luôn có 1–2 lô `Terrace`, có chỗ còn thêm `HighRoad` |

Kéo thanh trượt về 0 mà map vẫn mọc thềm thì người xây map **không có cách nào tắt**, và
không một dòng log nào nói vì sao — đúng kiểu "bấm không ăn" mà LUẬT VÀNG cấm.

**Nay:** `platformCount <= 0` ⇒ KHÔNG thềm, và cũng không `HighRoad` trong phần mong muốn
(`TerraceWish` + cờ `noHighGround`). Kiểu địa hình (Hills/Plateaus) vẫn được NÂNG số thềm,
nhưng không được ĐẺ RA thềm từ con số 0.

⚠ `request.threeLevels` KHÔNG bị đụng tới: đó là công tắc riêng, bật là cố ý muốn đủ
mái + cống (`ForceTiers`), không liên quan ô bục. Muốn một nhiệm vụ luôn có cao độ thì
**đặt số trong bảng map mẫu** (`MapBlueprint`), đừng ép lại trong planner.

### ⚠⚠ LUẬT HÌNH ẢNH CỦA MAP — bốn bất biến 15–18 (2026-09-09)

Rà cả hệ map ngày 2026-09-09 (user: *"tránh kẹt, tránh rớt, order layer phải đúng, pivot trục y
phù hợp, có chi tiết bên trong nhà, deco nhiều chi tiết, AI phải tìm được đường"*). Kết quả đo:
**14 luật cũ của `MapBuildRules` đã phủ hết vế CHƠI ĐƯỢC** — bậc thang (`CheckStairs`), thang
leo/tụt (`CheckLaddersCanBeDescended`), thềm cao phải có lối lên (`CheckElevatedPlatformsHaveAccess`),
làn đất chính (`CheckMainGroundLane`), công trình chắn ngang (`CheckBlockingStructures`), hồ phải
có cầu (`CheckLakes`), spawn trên trời (`CheckSpawnMarkers`), **đồ thị làn**
(`CheckLaneConnectivity`) và **dốc đồi** (`CheckTerrainSlope`). Cái thiếu là vế **NHÌN CÓ ĐÚNG
KHÔNG** — bốn luật dưới đây, ở file phần `MapBuildRules.Art.cs`, chạy tự động sau mỗi lượt dựng.

| # | Luật | Bẫy nó canh |
|---|---|---|
| 15 | Cảnh vật phải đứng trên đất | sprite mới có pivot GIỮA thay vì ĐÁY GIỮA ⇒ cây lún nửa thân; hoặc đặt y = `groundTop` phẳng thay vì `layout.SurfaceY(x)` ⇒ cây bay trên đồi |
| 16 | Bậc vẽ phải lấy từ bảng | số thô cạnh `StickmanWorldSorting`; đo trên SCENE vì order đã **bake** |
| 17 | Map không được trống | ít hơn 1.2 món cảnh / 10 đơn vị ⇒ mất mốc định hướng, AI mất chỗ nấp (chỉ cảnh báo) |
| 18 | Nhà chui vào được phải CÓ THẬT | `BuildingInteriorKit.Apply` trả `null` ở ba nhánh **không kêu một tiếng**; ngưỡng `MinShellHeight` 1.9 có thể loại sạch nhà của một thời kỳ |

⚠ **LUẬT 15 ĐO BOUNDS, KHÔNG ĐỌC PIVOT.** Pivot đúng mà cha bị scale, hay object đặt nhầm y,
đều cho cùng triệu chứng. Đo `renderer.bounds.min.y` so `layout.SurfaceY(x)` là bắt cả ba
nguyên nhân bằng một phép đo — cùng bài học với luật bậc thang (đo mảng số của chính scene,
không tin số của builder).

⚠ **LUẬT 16 ĐO SCENE, KHÔNG QUÉT CODE.** `sortingOrder` được **bake** vào scene lúc dựng: sửa
số trong bảng mà không dựng lại thì quét code báo XANH trong khi map thật vẫn sai. Luật bỏ qua
thứ nằm trong `SortingGroup` (nhân vật là MỘT KHỐI VẼ, bậc bên trong là bậc bộ phận theo
`StickmanSorting`) và nới ±2 quanh mỗi hằng vì bảng có sẵn nếp `Bậc + 1` cho lớp chồng.

⚠ **LUẬT 18 ĐỌC-RỒI-DỌN** ba bộ đếm của `BuildingInteriorKit`. Cố ý không bắt `MapAssembler`
gọi `ResetCounters()`: `Validate` chạy ngay sau mỗi lượt dựng nên "số kể từ lần soát trước"
chính là "số của lượt dựng này" — **không thêm điểm nối nào, nên không có điểm nối nào để quên**.

### Ba phép đo Doctor đi kèm (`StickmanDoctor.MapArt.cs`)

Chúng đo thứ mà scene không nói được:

| Phép đo | Đo gì | Trạng thái 2026-09-09 |
|---|---|---|
| Sprite công trình/cảnh vật: pivot ở ĐÁY | mọi `.png.meta` trong `Sprites/Buildings\|Structures\|Environment\|Scenery\|Props\|Terrain\|Fort` | **947/947 đúng** — phép đo giữ con số đó cho ảnh nhập SAU |
| Bậc vẽ: lấy từ bảng, không viết số | quét code module thế giới | 7 chỗ còn số thô, đều là dấu treo trên NHÂN VẬT (trong `SortingGroup`) → cảnh báo |
| Builder dựng địa hình phải soát luật | builder Editor gọi `MapScenery.Build`/`StructureAssembler`/`TerrainGround` mà không gọi `MapBuildRules` | 0 (đã vá `StickmanStructureKitBuilder`) |

⚠ Builder chỉ dựng MỘT MẢNH (không phải cả map) thì khai vào `BuilderNoRulesAllowed` kèm lý do —
`StickmanTieredTerrain` là thư viện dựng một dải đất, luật map phải chạy ở builder GỌI nó.

⚠ **`CreateHealthBar` từng để số thô 40** — trùng đúng `StickmanWorldSorting.WeatherFront`, nên
thanh máu công trình và lớp mưa/tuyết phía trước tranh nhau vẽ đè (đảo thứ tự tuỳ frame). Nay là
`OverlayMark`. Đây là lý do luật 16 tồn tại: một số thô thì không ai biết nó đụng ai.

## ⚠⚠ SMOKE MỌI MAP + AI ĐI THỬ — sáu lỗi đo được và cách chúng đã trốn (2026-09-11)

User: *"công trình và trang trí lơ lửng trên đường · cầu thang đứng AI không di chuyển được · order
layer không đúng · sửa xong thì force lại hết map, smoke test từng cái · map có cản AI thì sửa"*.

Ba tool mới (Bảng điều khiển › Map, hoặc `Nâng cao › Maps › 9 · 9b · 10`), đều là THƯỚC trừ tool 10:

| Tool | Làm gì | Batch |
|---|---|---|
| `StickmanMapSmokeTest.RunFromMenu` (9) | dựng THẬT từng `MapDefinition` (cả `Saved/`) bằng `MapAssembler.Build` không quân, chạy 18 luật + `kit.Validate` + hai phép đo mới: thang/cầu thang phải CÓ CẠNH trong `LaneNav`, chân CÔNG TRÌNH phải đứng trên `SurfaceY` | `-executeMethod StickmanMapSmokeTest.RunBatch -smokeFilter Maps/Map_Med` |
| `RunPlayFromMenu` (9b) | vào Play, dựng CÓ QUÂN, 15–18 s mỗi map: quân KẸT (đứng yên 6 s dù mục tiêu xa, không leo, không phải trạng thái gác) · RƠI khỏi đất · ra NGOÀI map · lỗi Console; luật map đo ở FRAME ĐẦU sau khi dựng | `-executeMethod StickmanMapSmokeTest.RunPlayBatch -smokeFilter … -smokeSeconds 15` (KHÔNG kèm `-quit`) |
| `RunScenesFromMenu` (9c) | mở 97 scene đã bake trong Play, đo chân mọi hình `MapDressing` đắp thêm so mặt đất thật (đồi / tia dò), thang có cạnh `LaneNav`, lỗi Console lúc nạp | `-executeMethod StickmanMapSmokeTest.RunScenesBatch -sceneFilter Demo_` (không `-quit`) |
| `StickmanMapRebuildBatch` (10) | FORCE dựng lại kho map → sân mặt đất → map mặc định MỌI thể loại · kiểu nhìn → 3 sân map → 3 sân Battle Royale, đúng thứ tự | `-executeMethod StickmanMapRebuildBatch.RunBatch` |

Báo cáo: `Logs/MapSmoke.result.txt` · `Logs/MapSmokePlay.result.txt`. Muốn chạy song song với Editor đang
mở: nhân bản `Library/` sang thư mục khác, junction `Assets` · `Packages` · `ProjectSettings` về repo, chạy
Unity `-batchmode -projectPath <bản sao>` (đã dùng ở đây, 7.4 GB, 2 phút chép).

| # | Triệu chứng đo được | Nguyên nhân | Sửa |
|---|---|---|---|
| 1 | Cây · cột buồm · ruộng · mỏ vàng · thùng tiền cảnh **LÚN 0.6–1.7 vào dốc cầu thang / tường thành** ở mọi map có trại (Blockade · Siege · DefendCamp · Economy · ZombieHold…) | `BuildWithKit` chỉ giữ chỗ **`hallX ± 1.6`** cho lô trại; cảnh vật rải TRƯỚC, `MapCastle.Build` dựng thành lên đúng chỗ đó SAU | giữ chỗ **cả lô trại** (+3.5 quanh đình) |
| 2 | Scene bake có đồi (`Demo_20 · 52 · 55 · 61 · 62 · 15 · 51`): mọi thứ `MapDressing` đắp thêm đứng ở cao độ **ĐỈNH ĐỒI** | `MeasureScene` lấy `bounds.max.y` của `TerrainGround` (PolygonCollider phủ cả dải) làm `groundTop`, và `layout.terrain` để null | mốc = `TerrainGround.BaseY`; `layout.terrain = MapScenery.ProfileFromScene(...)` |
| 3 | **Thang đứng trong nhà** (`Gian_Trong/Thang_Dung_*` của đình) — LaneNav không có cạnh, AI coi thang không tồn tại | `LaneNav.CollectSurfaces` chỉ nhận mặt trên của CÔNG SỰ; sàn gác (`PlatformEffector2D`) của nhà chính bị bỏ vì chủ nó là `BaseBuilding` | nhận SÀN MỘT CHIỀU của mọi công trình không phải công sự; công sự giữ luật cũ (chồng thùng `Stack` có 4 nóc thùng — nhận hết là 4 tầng giả) |
| 4 | Map BA TẦNG **thiếu cống** (Brawl 24 · Economy 42 · ThreeTier 34) | mái bốc bề rộng ngẫu nhiên 15–21 rồi đặt GIỮA khe; trại kinh tế vươn 26 mỗi bên ăn hết khoảng giữa | `ForceTiers`: CỐNG trước, dồn về một mép khe to nhất, MÁI lấy phần liền còn lại (mọi bề rộng — mái đặt giữa khe 36 vẫn để lại hai khe 10.4 < 12), không vừa thì co về bề rộng NHỎ NHẤT rồi mới rơi về `HighRoad_Flat`, map ≥ 32 thêm cống thứ hai; `AddCamp` kẹp tầm vươn 45 % nửa rộng khi ba tầng; Brawl bật ba tầng từ **26** (cả 4 map mẫu `*_Brawl` nới 24 → 26) (24 không xếp nào vừa: 21.5 sinh quân + 8.8 cống + 13.4 mái + 6.4 lề) |
| 5 | Kho map chỉ còn **75 map**: 0 map mặc định `Saved/*_default`, 0 map mặt đất `Grd_*` — F2 không liệt kê, `Demo_70..73` mở màn bằng map ngẫu nhiên | `BuildSystemSilent` gán `library.maps = BuildMaps()` ghi đè sạch | `MergeExistingMaps`: giữ mọi `MapDefinition` còn trên đĩa, `_default` chèn lên đầu |
| 6 | **400+ vi phạm GIẢ** khi soát trong edit mode (bake, tool Soi, smoke 9): 142 "LEO LÊN RỒI RƠI (x≈0.19, y≈0.00)", 91 "Tầng cao thiếu cầu thang", 30 "'Than' cắt làn / 'Doanh_Trai' khối đặc" | luật đọc `StickmanStairs.All` / `StickmanClimbZone.All` (điền ở `OnEnable`, rỗng trong edit mode) và `_span` chưa đo (`Awake` chưa chạy) | `MapBuildRules.Registry.cs`: `RefreshSceneRegistries()` quét thẳng + `EnsureMeasured()` ở đầu `Validate` |
| 7 | Sau khi giữ chỗ cả lô trại: **7 quân thủ chồng lên một điểm** ở mép lô | `reserved` cũng là vùng cấm của `LineX`/`SafeX` — quân sân thành bị đẩy hết ra mép | vùng cấm CẢNH VẬT riêng: `Layout.decoBlocked` / `BlockDeco` / `IsDecoReserved`; nền đình vẫn `Reserve(hallX ± 1.6)` |
| 8 | «Lô sinh quân KHÔNG TỚI ĐƯỢC đình» · «tầng y=−2 KHÔNG LÊN ĐƯỢC» ở 8 map trại, **lúc có lúc không** | `LaneNav.SplitByBlockers`: chốt nằm ở MÉP nút (tường bất tử xử trước, cổng tới sau) chỉ gọt mép, không thêm cạnh — đồ thị tuỳ thứ tự `FindObjectsByType` | `LinkAcross`: gọt mép xong vẫn nối nút với hàng xóm bên kia chốt bằng cạnh Gate của chính chốt đó |
| 9 | Map kinh tế: «Spawn·A chồng lên Camp·A» ở mọi seed | `FixedLots(WarEconomy)` đặt hai lô sinh quân 13 đơn vị ở mép, đè lên lô trại (đình ở 0.88·hw) | hai trại, không lô sinh quân — quân xếp trong sân thành như phe A của thủ trại |
| 10 | «tầng y=1.20 x[a..a+1] CÔ LẬP» ở mọi map hiện đại có `Choi_Quan_Sat` | cột tháp canh (đặc) kết thúc dưới sàn 0.25 — quá `LevelMerge` 0.14 nên thành nút riêng không cạnh | `LaneNav.CollectSurfaces`: thân đặc của công sự nhận qua luật `WalkableTopY` thì kéo `y` về đúng `WalkableTopY` để gộp với sàn |
| 11 | «Bậc vẽ: Visual=11» ở mọi map battle royale | khiên rớt xuống đất còn mang `StickmanSorting.NearShield` (bậc bộ phận) trên layer Default | `DroppedItem.MakeDropped` áp `StickmanWorldSorting.Prop` cho đồ nằm đất; nhặt lên holder áp lại bậc bộ phận |
| 12 | Smoke scene: 76/77 scene bake đo được **0 công trình đắp thêm** — `MapDressing` tắt trong im lặng | `MeasureScene` ghi tấm cỏ `MatCo` (bậc `GroundCover` −65, phủ trọn bề ngang) vào `occupied` ⇒ cả map là vùng cấm | miễn bậc nền tới `WaterSurface` và bỏ mọi renderer rộng > 12 (nền, không phải vật) |
| 13 | Map mặc định Vết nứt · Săn rồng (8 map): «Spawn·A chồng lên Camp·A» + «Thiếu lô sinh quân phe B»; vết nứt còn «cắt làn đất chính» | `FixedLots` đặt lô sinh quân 14 ở mép đè lên lô làng (đình 0.88·hw) và đo mép địch sai phía; hai kiểu này cố ý một phe; `ArcaneRift` là khối đặc 0.55 giữa làn | chỉ lô LÀNG (quân xếp trong sân), `Validate` miễn phe B cho ArcaneRift/DragonHunt như ARPG, collider vết nứt thành trigger (đòn vẫn trúng) |

Hai luật cho chính cái thước (đã dính cả hai): **nạp asset map SAU `NewScene`** — `NewScene` dọn asset không
dùng, `MapDefinition` chỉ còn tham chiếu C# thành fake-null, 128 map 3/4 báo "Build trả null"; và **đo luật
ở frame đầu sau khi dựng**, không phải sau 15 s — luật 18 «sinh chồng chỗ» réo mọi cụm giáp lá cà.

Kết quả sau sửa: xem `Docs/ProjectMap/index.html` mục 17 (dòng 11·09·2026). Bậc vẽ: ba số thô của phố mở
(`BackProp + 4/5`, `NearProp − 3`) vào bảng thành `StreetKerb · StreetLine · ShopGlow`.

### Còn vướng sau đợt 2026-09-11 (đo bằng chính ba tool trên)

- 5 scene dựng tay có sàn mà `LaneNav` không nhận làm nút nên thang/cầu thang lên đó bị réo CÔ LẬP: `Demo_63_Moba`
  (`ThangLeo_*`, `ThangDa_*` lên làn trên y 2.6–3.2), `Demo_65_WuxiaTournament` (`TiVoDaiHoi/Thang_*`),
  `Demo_66_WuxiaPractice` (`LuyenVoTruong/Thang`), `Demo_12_Traversal` (`Day_Thung` sân tập), `Demo_8_AILab` vùng 26
  (x≈5000). Mode vẫn chạy bằng đường cũ (`TryPlanTraversal`/`FindClimbZoneNear`); muốn AI lập lộ trình qua đó thì sàn
  phải là collider đặc/one-way KHÔNG treo dưới `StickmanController`, hoặc công sự có `walkableTop`.
- Ngựa/khiên «Visual» bậc 11 trên layer Default còn ở vài map battle royale nếu là VẬT CƯỠI không chủ (`StickmanHorse`
  không có SortingGroup) — khiên rớt đã sửa ở `DroppedItem`.
- Scene có đồi (`Demo_20 · 52 · 55 · 61 · 15 · 51`) sau sửa `MapDressing`: 3–11 công trình đắp thêm, 0 bay / 0 lún.
  31/77 scene không có chỗ trống nào để đắp (sân đấu, phòng thí nghiệm) — đúng ý, không phải lỗi.
