### ⚠⚠ CÔNG TRÌNH LẮP TỪ CHI TIẾT NHỎ — `StructureKit` (2026-09-05)

`Assets/Scripts/Map/Structure/StructureParts.cs` · `StructurePartSet.cs` · `StructureAssembler.cs`
(`StructureGrammar`) · `StructureKitShowcase.cs` · Editor `StickmanStructureArt.cs` ·
`StickmanStructureKitBuilder.cs`. Sân `Demo_40_StructureKit`. Chi tiết:
`Docs/KnowledgeBase/StructureKit.md`.

User đặt (2026-09-05): *"tạo tháp gồm nhiều chi tiết nhỏ — thân, chỗ đứng canh, hàng rào, cầu
thang, deco — lắp ngẫu nhiên hợp lý, có pivot in/out, collider phù hợp, AI tìm đường được, mở
rộng sang castle / nhà chính / công trình khác"*. Bản mở rộng của `FortKit` xuống MỘT BẬC: FortKit
xếp TOÀ THÀNH từ tường/tháp/cổng đã dựng sẵn; StructureKit xếp CHÍNH cái tháp từ đế · thân · sàn ·
lan can · mái · deco · thang.

| Tầng | Nguồn sự thật |
|---|---|
| CHI TIẾT | `StructurePartSet.DefaultParts()` (code) → asset `Settings/StructureKit/StructurePartSet_Default.asset` (bake) |
| VĂN PHẠM | `StructureGrammar.Tower/House/Wall/Gate` — thứ tự lắp, ô bắt buộc, lặp, lối lên; `System.Random(seed)` |
| KẾ HOẠCH | `StructurePlan.Validate()` — sai thì KHÔNG dựng |
| LẮP | `StructureAssembler.Build` → `MapCastle.CreateLadder/CreatePost/FinishFort/BuildStairs` (nay `internal`) |

⚠ **PIVOT ĐÁY-GIỮA LÀ HỢP ĐỒNG**: ô cắm VÀO = đáy, ô cắm RA = đỉnh; collider đo theo KHUNG
SPRITE GỐC rồi để scale co — art thay khổ khác thì `width/height` trong bảng vẫn quyết định cỡ,
collider luôn trùng hình. Art phải `FullRect` và vẽ KÍN hai mép cho chi tiết cắm chồng.
⚠ **VA CHẠM LÀ THUỘC TÍNH CỦA CHI TIẾT** (`PartCollision` None/Trigger/OneWay/Solid), không phải
của công trình: sàn tháp là `OneWay` (`PlatformEffector2D` 150°) nên thang chui lên được và tụt
xuống được; thân tháp `Trigger` (không bịt làn); khối tường `Solid` nhưng cả tường
`passableForEveryone` (nhường làn, giá trị ở CAO ĐỘ); cổng `Solid` + `passableForOwner`.
⚠ **KHÔNG MỘT LUẬT AI NÀO MỚI** — tháp lắp ra dùng đúng `GarrisonPost` · `StickmanClimbZone` ·
`StickmanStairs` · `Fortification` nên `LaneNav` thấy nó y như tháp của `MapCastle`. Tủ kính đo
ngay bằng `MapBuildRules.ValidateLanes(null, null)` (**null = cả scene**, vì mặt đất nằm ngoài
hàng công trình — quét riêng hàng là mọi sàn đều "cô lập").
⚠ `GarrisonPost.accessOffsetX = EntryX − postX` — điểm tới trước khi lên là TRỤC THANG hoặc CHÂN
cầu thang, tính lệch so với post ở TÂM sàn; gõ `-3` như mặc định là cung thủ đi tới một chỗ
không có thang.
⚠ Chân cầu thang nằm NGOÀI thân: xếp công trình kế tiếp theo `FootprintMinX/MaxX` (đã cộng
`StairsRun`), đừng theo `coreWidth`. Tủ kính `Plan` một lần để ĐO rồi mới `Build` ở đúng x.
⚠ Thêm chi tiết = một dòng `DefaultParts` + một hàm vẽ (hoặc thả PNG cùng tên) + bấm «Bộ chi tiết
CÔNG TRÌNH lắp ghép». Thêm LOẠI = một `StructureKind` + một hàm văn phạm + một nhánh chọn
`FortKind`. Đừng viết hàm dựng tháp thứ ba ngoài `MapCastle.BuildWatchtower` và bộ này.

**V2 (2026-09-05, user: *"thêm castle, nhiều chi tiết hơn, hình theo nền văn minh, thêm deco
cây cối"*)** — 8 loại · 67 chi tiết:
| Loại | Văn phạm | Ghi chú |
|---|---|---|
| `Keep` | móng → tầng lớn ×1..2 → nóc răng cưa / mái sảnh → cửa lớn + 2 cờ + cửa sổ | thân TRIGGER như nhà; vai `MapObjective` do màn gắn |
| `Castle` | **GHÉP**: [tháp] tường×n CỔNG tường×n [tháp] — mỗi mảnh là `plan.children[i]` lắp bằng chính văn phạm của nó, xếp cạnh nhau theo CHÂN ĐẾ (kể cả cầu thang), cả cụm căn giữa | `Validate()`/`Footprint`/`TopY` gộp con; `Build` dựng con dưới cùng root; chỉ CỔNG chặn làn |
| `Tree` · `Rock` | thân ×1..3 → tán (tròn/thông/liễu/trụi) + bụi · 1..3 tảng đá | DECO: `collision = None`, sorting `BackProp`/`Prop`; `MapScenery.ScatterKitDeco` rải dọc map (`MapDefinition.kitDeco`), tránh lô đã giữ chỗ + miệng vực |
⚠ **ART THEO NỀN VĂN MINH — hai tầng, tầng nào cũng không đụng code:** (1) art thật thả vào
`Sprites/Structures/<CivKey>/Part_X.png` → tool quét vào `StructurePartSet.civSprites`,
`SpriteFor(name, civKey)` ưu tiên; (2) chưa có thì tấm chung + **nhuộm theo `PartTint`**
(`Banner` = đúng màu cờ, `Roof` pha 45 %, `Accent` pha 30 % — nhân vào `color`, khuôn bộ lông
ngựa). `StructureRequest.civ` do người gọi truyền (`MapScenery` lấy `CivilizationTeamAssigner.For(team)`
cho công trình đặt tay có phe; trung lập giữ art chung). Đơn đặt ChatGPT: `WeaponArt-ChatGPT-Prompt.md` §6c.
⚠ **Công trình ĐẶT TAY trong map**: `MapDefinition.structures[]` (`PlacedStructure`: công thức HOẶC
loại+seed, `x`, phe). `MapScenery` giữ chỗ chân đế TRƯỚC khi xếp lô (không thì thềm/hồ mọc đè
chân tháp), dựng SAU địa hình, phạm luật thì bỏ + log. Xưởng map tab **«Công trình»**: có map
nháp thì ghi vào nháp và dựng lại (lưu map là đi theo); không có nháp thì đặt THỬ vào màn đang
chơi rồi hỏi lại đồ thị làn.
⚠ Art `Part_*` là VẼ BÙ theo LUẬT NGUỒN ASSET — nằm trong `ExpectedArtProof` nên thiếu tấm là
mục *Vẽ bù art* ĐỎ; art thật đặt ChatGPT theo khổ = cỡ world × 100.
⚠⚠ **TỦ KÍNH BÀY ĐÚNG MỘT CÔNG TRÌNH, và LƯU LẠI ĐƯỢC** (user chốt 2026-09-05). Xếp tám cái
thành hàng thì phải kéo màn hình và không cái nào nhìn kỹ được — mà thứ cần đọc ở đây là đường
bao · chỗ đặt chân · lối lên ở CỠ THẬT. Nút 💾 ghi `StructureRecipe` (`Settings/StructureKit/
Recipes/<Loại>_<seed>.asset`) rồi nối vào `MapLibrary.structureRecipes`; `MapScenery` ô **chòi
canh** bốc một công thức đã lưu thay cho `MapCastle.BuildWatchtower` mặc định.
· ⚠ **Công thức giữ SEED + mấy cái núm, KHÔNG giữ toạ độ từng chi tiết** — đúng khuôn
  `FortLayoutDefinition`: chi tiết phải được ĐO LẠI theo mặt đất · chỗ đặt · phe mỗi lần dựng,
  nên bản chụp toạ độ là dữ liệu ôi ngay khi ai đó sửa bảng chi tiết. Đổi lại, công trình đã
  lưu tự hưởng mọi cải tiến của văn phạm.
· ⚠ **Kế hoạch phạm luật thì map LÙI về tháp mặc định** (`TryBuildSavedStructure` trả false) —
  thà một cái tháp bình thường còn hơn một công trình không ai leo lên được.
· ⚠ Không có công thức nào / chưa gán `MapLibrary.structureParts` ⇒ map dựng y như trước, không
  đổi một ly.

**V3 (2026-09-05, user: *"hình dáng tháp phải phù hợp với cầu thang; thêm nhiều công trình,
trang trí cho trung cổ VÀ hiện đại; cổng thành đóng/mở + hình sập, order cao hơn stickman"*)** —
ba việc, ba nguồn sự thật riêng:

**a. THỜI KỲ LÀ MỘT BỘ LỌC, KHÔNG PHẢI MỘT LOẠI CÔNG TRÌNH MỚI** (`PartEra` ·
`StructurePartDef.era` · `StructurePlan.era` · `StructurePartSet.Pick(kind, slot, rng, era)`).
Cách "hiển nhiên" là thêm `StructureKind.ModernTower` — và nó sai: văn phạm tháp/nhà/tường/cổng
KHÔNG đổi một dòng nào khi đổi vật liệu, chỉ CHI TIẾT đổi. Thêm loại là chép lại bốn hàm văn
phạm rồi phải sửa cả bốn mỗi lần chỉnh bố cục. Một `era` trên từng dòng chi tiết thì **21 chi
tiết hiện đại mới** (thân bê tông · ống thông gió · sàn thép · lan can lưới · cột ăng-ten · đèn
pha · sàn/mái/cửa cuốn nhà bê tông · khối tường bê tông · dây thép gai · lối đi thép · cánh cổng
thép · trụ bê tông · lều dã chiến · bao cát · thùng container · đèn đường) tự chảy vào MỌI văn
phạm sẵn có.
· `PickFiltered` có CHUỖI LÙI: đúng thời kỳ → `Any` → bất kỳ. Ô nào chưa có bản hiện đại thì
  lấy bản trung cổ chứ **không bao giờ trả rỗng** — thiếu một ô là `Validate` đánh trượt cả
  công trình, tức thêm một chi tiết mới có thể giết một loại công trình cũ TRONG IM LẶNG.
· `MapScenery.EraOf(map)` là chỗ DUY NHẤT hỏi *"map này thời kỳ nào"* (`GameGenre.Modern` →
  `PartEra.Modern`). Bốn đường dựng `StructureRequest` của `MapScenery` đều đọc nó; thêm đường
  thứ năm thì gọi hàm đó, ĐỪNG đọc `map.genre` lần nữa.
· Tủ kính `Demo_40` có nút **TRUNG CỔ / HIỆN ĐẠI** — không có nó thì 21 chi tiết mới không có
  chỗ nào nhìn thấy (bài học bài 26 của AI Lab).

**b. `StructureKind.Bunker` — LOẠI THỨ CHÍN, và nó là loại DUY NHẤT đáng thêm.** Lô cốt không
phải "cái tháp thấp": đế loe · thân có KHE BẮN · **nóc ĐI ĐƯỢC** nhưng không có lan can, lối lên
là thang bên hông. Nó có hình học riêng nên văn phạm riêng là đúng; còn nhà kho/nhà xưởng hiện
đại thì `House` + chi tiết bê tông đã ra rồi.
⚠ Nóc lô cốt là `PartCollision.OneWay` + `GarrisonPost` — cùng bộ máy tháp canh, nên `LaneNav`
thấy nó là một cạnh thang y hệt và **không thêm luật AI nào**.

**c. CỔNG CÓ BA TRẠNG THÁI, và trạng thái thứ ba là HÌNH SẬP** (`Combat/FortGateArt.cs`).
`VillageGate` đã lo phần LUẬT (đóng thì không ai qua, mở thì quân nhà qua) từ lâu, nhưng phần
HÌNH thì chỉ có một tấm: cổng vỡ vẫn đứng nguyên như mới, và cổng mở nhìn y hệt cổng đóng ở mọi
cỡ nhìn. `FortGateArt` hỏi hai thứ đã có (`Fortification.IsDie` · `VillageGate.OpenAmount`) rồi
đổi hình — **không giữ trạng thái của riêng nó**, nên không có nguồn sự thật thứ hai để lệch.

| Trạng thái | Điều kiện | Hình |
|---|---|---|
| **Sập** | `_fort.IsDie` | trả bậc vẽ về như cũ · TẮT thân cổng · hiện `Gate_Ruined` (đống đổ nát) |
| **Mở** | `OpenAmount >= 0.5` | thân cổng ở bậc TIỀN CẢNH, hai cánh đã rút vào |
| **Đóng** | còn lại | thân cổng ở bậc TIỀN CẢNH |

⚠⚠ **CỔNG VẼ TRƯỚC STICKMAN — LAYER `foreground`, KHÔNG PHẢI ORDER LỚN.** Đây là luật đã ghi ở
`StickmanWorldSorting` (*"mọi thứ trong thế giới nằm ở `Default` nên KHÔNG CÓ BẬC NÀO đưa nó ra
TRƯỚC một nhân vật"*), lặp lại nguyên xi. `ApplyForeground(..., Occluder + độ lệch bậc)` giữ
nguyên THỨ TỰ TƯƠNG ĐỐI giữa các mảnh của chính cái cổng (trụ · vòm · cánh) rồi nhấc cả cụm lên
layer trên. Tăng `sortingOrder` trong `Default` là không có gì xảy ra cả, và không lỗi nào báo.
⚠ **SẬP THÌ PHẢI TRẢ BẬC VỀ**: đống đổ nát mà còn nằm tiền cảnh là nó che mất trận đánh đang
diễn ra sau lưng nó — mà lúc đó cổng KHÔNG còn chắn ai nên chẳng có gì để mà che. Cache
layer/order lúc `Setup`, đừng tính lại (art khoác lúc chạy có thể đổi bậc).
⚠ **KHÔNG tranh `enabled` với hệ mở cửa**: `ApplyGateVisuals` của `VillageGate` là chủ của HAI
CÁNH (`GateLeaf`), `FortGateArt` chỉ đụng THÂN cổng + đống đổ nát. Hai chủ trên cùng một
renderer là nó nhấp nháy theo thứ tự script.
⚠ `Demo_39`/`Demo_26` và map sinh đều tự có (`MapCastle.BuildGate`/`BuildVillageGate` gọi
`AttachGateArt`), nhưng **art `Gate_Ruined` phải sinh ra trước** — nó nằm trong
`StickmanBuildingArt` nên mục *★ Vẽ bù art còn thiếu* ĐỎ khi thiếu.


⚠⚠⚠ **TẦNG TÌM ĐƯỜNG PHẢI HỎI STATE "TÔI ĐANG ĐI TỚI ĐÂU" — `AIState.NavigationFocus`**
(2026-09-05, *"đi lên cầu thang xong bị rơi xuống ngay đây"* ở màn chiếm điểm). `TryLaneRoute`
và `TryDropOffPlatform` từng hỏi thẳng `Target` rồi mới tới `Objective`. Lính GÁC ĐIỂM trên thềm
luôn có `Target` là một tên địch dưới đất trong tầm nhìn mà `AIStateGuard` KHÔNG đuổi (ngoài
leash) — tầng tìm đường lại tưởng "nó muốn tới chỗ tên kia": lái xuống cầu thang, hoặc TỤT QUA
SÀN ngay khi vừa leo lên; state kéo về chốt; lặp mãi. Không lỗi nào báo. Nay state trả lời
(`AIStateGuard`: chỗ gác, trừ lúc `_chasing` thật), hai hàm kia hỏi nó; `TryDropOffPlatform` chỉ
tụt khi ĐÍCH đó thấp hơn một tầng. Thêm state có ý riêng (hộ tống, đi đường) thì override.
⚠ Kèm hai vế cùng đợt: `CapturePoint.BestForTeam` chấm **gần − đáng tiền − đang trong tay địch**
(bản cũ chỉ khoảng cách nên tháp giữa 3 điểm/giây vô chủ cả trận); điểm chiếm + cờ cướp có HÌNH
dựng lúc chạy (`GameplayMarkArt`: cột cờ màu phe, vòng vùng chiếm, đĩa tiến độ, cờ vải + hào
quang nhấp nháy khi rơi) nên 45 scene bake không phải dựng lại.

⚠⚠⚠ **`Destroy` HOÃN TỚI CUỐI FRAME — ĐỪNG LẤY "ĐÃ BIẾN MẤT KHỎI CÂY" LÀM ĐIỀU KIỆN DỪNG.**
Bản đầu của tủ kính dọn bằng `while (transform.Find(name) != null) Destroy(...)`. Trong Edit
mode nó chạy (`DestroyImmediate` có hiệu lực ngay) nên bake được; vào **Play** thì `Destroy`
hoãn ⇒ `Find` trả về đúng object đó mãi ⇒ **vòng lặp vô tận, Unity TREO CỨNG** ngay cú bấm
«Ngẫu nhiên» đầu tiên. Chốt: vòng theo `childCount` (luôn có đáy) + `SetActive(false)` và
`SetParent(null)` trước khi huỷ. Đây là mặt trái của luật "TẮT TRƯỚC, HUỶ SAU" vẫn ghi ở mục
trang bị — cùng một sự thật: **`Destroy` không có hiệu lực tức thì.**

⚠⚠ **NẠP ASSET SAU `NewSceneShared`, KHÔNG NẠP TRƯỚC — tham chiếu C# không giữ được asset
khỏi `UnloadUnusedAssetsImmediate`** (dính ngay lần bấm đầu, 2026-09-05: tủ kính bake ra **0 công
trình** với đúng một dòng "1 lỗi kế hoạch"). Bước chuẩn bị scene (`EnsurePrepared → Prepare →
FlushEditorMemory`) unload asset không có root native giữ; `set` nạp trước đó thành FAKE NULL —
`Setup(set)` vẫn serialize được guid vào scene (nhìn YAML thấy `_parts` đầy đủ), nhưng
`RebuildNow` thấy `_parts == null`. Không exception, scene vẫn lưu, log vẫn "Đã dựng". Cách nhận:
`m_Children: []` dưới object chủ trong file `.unity` dù component có tham chiếu. Builder nào
nạp ScriptableObject rồi mới gọi `NewSceneShared` (kể cả `StickmanFortKitBuilder.BuildShowcaseScene`
với `FortPieceSet`) đều đứng trên cùng cái bẫy — chỉ chưa lộ vì chúng đọc field chứ không hỏi `== null`.
⚠ Bốn dòng bảng chi tiết từng trỏ tên sprite CHUNG (`Part_House_Floor`…) mà generator vẽ tên
RIÊNG (`Part_House_FloorPlaster`) ⇒ `EnsureAll` thấy thiếu mãi, «Vẽ bù art» chạy lại mỗi lần
dựng scene và mục đó không bao giờ xanh. `DefaultSpriteNames()` (tên lấy từ bảng) và
`GenerateAll` (tên trong generator) phải khớp từng chữ — kiểm bằng cách so hai tập tên.

**V3 (2026-09-05, user: *"chọn vào keep thì nó đứng lên tường bên trên; thêm nhiều chi tiết và công
trình phức tạp, phù hợp mọi gameplay, AI hoạt động được"*)** — 10 loại · 84 chi tiết:

| Việc | Ở đâu |
|---|---|
| **ĐÌNH LÊN NÓC ĐƯỢC** | `StructureGrammar.Keep`: tầng → cửa vào → **`Keep_Deck`** (sàn MỘT CHIỀU, `walkY`, `garrisonSlots` 1..4) → **`Keep_Parapet`** răng cưa hai lớp (lớp trước `foreground`) → mái sảnh TUỲ CHỌN ngồi SAU lối đi (`walkY + 0.3`, layer `Default` nên nằm sau người — không nâng 1.05 như tháp vì đây không có cột) → cờ. Lối lên = **CẦU THANG TRONG NHÀ**: thang trèo dựng đúng trục cửa, `HideLadderInside` tụt hình xuống `Structure − 2` để mặt tiền che; art `Part_Keep_Door` vẽ lại thành CỬA MỞ có bậc thang tối bên trong (lời hứa hình ảnh cho cơ chế). Với LaneNav/AI nó chỉ là một cạnh thang nối đất với một sàn một chiều — y hệt tháp canh, **không luật AI mới** |
| **`Camp`** (trại lính) · **`Ruin`** (phế tích) | deco, `collision = None`; ô `Prop` mới (thùng · hòm · xe · cỏ khô · giếng · giá vũ khí). `MapScenery.ScatterKitDeco` rải cây 70% · đá 18% · **phế tích 12%** |
| Rào cọc | `Wall_Block_Palisade` (Solid, cùng bề ngang khối đá) + `Wall_Crenel_Stakes` (foreground) |
| **ĐÌNH LẮP GHÉP = NHÀ CHÍNH CỦA MAP SINH** | `MapAssembler.CreateKeepHall` (gọi trong `BuildCamp` khi `MapLibrary.structureParts` có; không có thì khối nhà một tấm như cũ): `BaseBuilding` + `TeamMember` + thanh máu + `MapObjective.Headquarters`, art theo nền của phe, trại lính deco sau đình khi `economyProps`. Cung thủ phe thủ được khai `Garrison` khi phe có post (`MissionContext.teamsWithPost`) dù map không thành luỹ |

⚠⚠ **NÓC + THANG + CHỖ ĐỨNG CỦA ĐÌNH-NHÀ-CHÍNH PHẢI RA NGOÀI CÂY `BaseBuilding`.**
`StickmanLocomotion.IsStandableSurface` bỏ qua MỌI collider có `StickmanController` ở nhánh cha (chỉ
`Fortification` có mặt đi được là ngoại lệ) — để sàn nóc dưới `BaseBuilding` là ai đứng trên đó cũng
bị coi là ĐANG RƠI (không nhảy, không chặn mép, dáng rơi vĩnh viễn) — đúng bẫy `ShipVessel`
§Thuỷ chiến 1. `CreateKeepHall` dời `Keep_Deck` · thang · `GarrisonPost` sang object anh em
`<tên>_Noc` TRƯỚC khi gắn `BaseBuilding`. Gắn vai gameplay lên một công trình lắp ghép khác thì
phải làm y vậy.
⚠ Gắn `BaseBuilding` lên root ĐÃ BẬT (Build bật nó) thì `SetActive(false)` → gắn → `Configure` →
bật lại — `_buildBodyHitboxes` chỉ đọc một lần ở Awake.
⚠ `Keep_Roof_Open` (sprite rỗng, cao 0) là "nóc trống" — văn phạm bỏ qua ô Roof có `height ≤ 0.01`
hoặc sprite rỗng, `DefaultSpriteNames` bỏ tên rỗng. Đừng "sửa" bằng cách cho nó một tấm art.


### V5 (2026-09-05) — 21 chi tiết mới + RUỘNG ĐỒNG

**133 dòng chi tiết / 126 tấm art / 11 loại.** Cross-check bắt buộc: mọi `spriteName` phải có
một hàm `Save*` cùng tên trong `StickmanStructureArt` — lệch một chữ là chi tiết đó không bao
giờ có hình và mục «Vẽ bù art» không bao giờ xanh (Doctor canh vế này).

| Nhóm | Chi tiết |
|---|---|
| Đồ trại TRUNG CỔ | `Prop_Anvil` · `Prop_Stall` sạp chợ (mái nhuộm theo nền) · `Prop_Sacks` · `Prop_Logs` |
| Phế tích | `Ruin_Statue` tượng đá GÃY — không đầu, đó mới là thứ nói "phế tích" ở cỡ thật |
| Đồ trại HIỆN ĐẠI | `Prop_Dumpster` · `Prop_Pallet` · `Prop_Generator` · `Prop_Cone` |
| Trang trí | `Deco_Ivy` (tiền cảnh, THƯA ≥45% trong suốt) · `Deco_Sign` · `Deco_AC` |
| Mái / tường | `Tower_Roof_Thatch` · `Wall_Block_Timber` khung gỗ · `Wall_Crenel_Chain` lưới B40 |
| **RUỘNG ĐỒNG** | `Farm_Fence`/`Farm_FenceWire` · `Farm_Crop`/`Farm_Drum` · `Farm_Scarecrow`/`Farm_Post` |

**`StructureKind.Farm`** — văn phạm `[rào] luống ×2..4 [bù nhìn] [rào]`, deco thuần KHÔNG
collider. **Hai thời kỳ dùng CHUNG văn phạm**: trung cổ ra ruộng có bù nhìn, hiện đại ra bãi
tập kết có thùng phuy + cột báo — khác ở `PartEra` của từng DÒNG, không ở hàm văn phạm.
`MapScenery.ScatterKitDeco` nay rải **cây 62% · đá 16% · phế tích 10% · ruộng 12%**.
⚠ Đừng nâng tỉ lệ ruộng: nó rộng hơn hẳn ba loại kia, dày quá là cả map thành cánh đồng.

⚠⚠ **`StructureKind` mới phải lấy GIÁ TRỊ CHƯA DÙNG.** Đã dính: `Farm = 10` trùng
`Bunker = 10` ⇒ `switch` hai nhánh cùng nhãn (CS0152), và bản build TĂNG DẦN không báo.
⚠ `StructurePlan.FootprintMinX/MaxX/TopY` là thuộc tính **SUY RA**, không ghi thẳng được —
deco khai bề ngang qua `plan.coreWidth` như `Ruin`/`Camp`.

## V5 — VAI TRÒ CÔNG TRÌNH · MỎ · SÂN TRONG TOÀ THÀNH (2026-09-06)

### `BuildingRole` — trục lọc THỨ HAI, không phải loại mới

`StructureParts.cs` · `BuildingRole { Any, Home, Barracks, Smith, Granary, Shrine, Market,
Watch, Stable }`, khai trên `StructurePartDef.role` · `StructurePlan.role` ·
`StructureRequest.role` · `PlacedStructure.role` · `StructureRecipe.role`.

Cùng lý do `PartEra` là bộ lọc: nhà lính và nhà dân **chung một văn phạm** (móng → tầng ×n →
mái, cửa dưới, cửa sổ trên). Chúng khác BỀ NGANG · SỐ TẦNG · CHI TIẾT · ĐỒ ĐẶT QUANH NHÀ.
Tách thành `StructureKind` mới là nhân đôi `StructureGrammar.House` rồi hai bản trôi khỏi nhau.

Bảng dáng duy nhất: `StructureGrammar.StyleFor(role)` → `HouseStyle`.

| Vai | ×ngang | Tầng | Sàn nóc | Máu | Món đặc trưng (TC / HĐ) |
|---|---|---|---|---|---|
| Home | 0.95 | 1..2 | — | 60 | giếng / thùng rác |
| Barracks | 1.45 | 1 | — | 110 | giá vũ khí / bao cát |
| Smith | 1.00 | 1 | — | 70 | đe rèn / máy phát |
| Granary | 0.72 | 2..3 | — | 80 | bao lương / pallet |
| Shrine | 0.85 | 1 | — | 90 | tượng đá (chuông treo mặt tiền) |
| Market | 1.20 | 1..2 | — | 50 | sạp chợ / thùng rác |
| Watch | 0.62 | 1..2 | **CÓ** | 75 | giá vũ khí / cọc tiêu |
| Stable | 1.35 | 1 | — | 55 | cỏ khô / pallet |

⚠ **Chi tiết khai `role` riêng CHỈ đến được qua đường bốc theo vai.** `PickFiltered` (bộ chung)
bỏ mọi dòng có `role != Any`, nên dựng nhà dân không bao giờ vớ phải cái lò rèn. Vai thiếu chi
tiết thì rơi về bộ chung → ra một căn nhà bình thường: **thiếu là nhạt đi, không phải là gãy**.

⚠ **`Watch` là vai DUY NHẤT có cao độ** (`walkY` + `garrisonSlots = 1` + thang trèo), dùng đúng
bộ máy sẵn có của tháp — không có luật AI nào mới. Bảy vai còn lại `walkY = NaN` như trước.

⚠ **Mái · móng nhân CÙNG hệ số với tầng.** Chỉ nhân tầng là phần nhô của mái sai tỉ lệ ngay.

### `StructureKind.Mine` — loại MỚI, vì văn phạm thật sự khác

`[quặng thải] · GIÀN TỜI → SÀN (một chiều) → LAN CAN · CỬA HẦM · [ray + xe goòng]`.

Cửa hầm là **TRIGGER** (ăn vào vách, không chắn làn — game đi ngang chỉ có một làn). Giá trị
gameplay nằm ở **sàn giàn tời**: một suất đứng bắn giữa đồng trống, tức một chỗ ĐÁNG TRANH.
Khác hẳn `Mo_Vang` cũ trong `MapScenery.ScatterEconomyProps` — cái đó là một tấm ảnh.

⚠ Giàn dựng **SÁT CẠNH** cửa hầm (`adit.width/2 + frame.width*0.42`), không đè lên. Đè lên thì
lòng hầm tối và chân giàn chồng thành một mảng rối, và trục thang chạy ngang qua lối vào hầm.
⚠ Quặng thải đổ ra **phía ngoài giàn** — để sau lưng giàn là nó nấp trọn sau bốn cái chân.

### Toà thành có SÂN TRONG — `StructurePlan.silhouette` + `orderOffset`

`Castle` = lớp ngoài (`[tháp] tường×1..3 CỔNG tường×1..3 [tháp]`) + `BuildCourtyard`: một ĐÌNH
ở giữa + 0..2 nhà phụ (nhà lính, kho lương), `orderOffset` −18/−14 để vẽ **sau** tường.

⚠ **Mảnh sân trong PHẢI là bóng nền.** Game này chỉ có MỘT mặt phẳng: cái đình "ở sân trong"
thật ra đứng ngay trên đầu bức tường. Để nguyên thang và sàn của nó thì AI leo lên một cái nóc
lơ lửng, hai cầu thang chồng trục ở cùng một `x`, và `LaneNav` có hai đường lên cùng chỗ. Vẽ
lùi ra sau là ĐỦ để mắt đọc ra chiều sâu — mọi thứ CHẠM ĐƯỢC vẫn ở lớp ngoài.

`silhouette` gỡ ở MỘT chỗ (`StructureAssembler.Plan`, sau văn phạm): `walkY = NaN`, `access =
None`, `garrisonSlots = 0`, `deckMinX/MaxX = 0`, `health = 0`; `PlacePart` bỏ collider; `Build`
dừng trước phần thang/suất đứng/thân gameplay. `Validate()` **trả về rỗng ngay** cho bóng nền —
không thì cái đình vẽ sau tường bị réo "thiếu sàn nóc" và cả toà thành bị từ chối dựng.

⚠ Nhà phụ bị chặn trần `total/2 − 2.0`: bề ngang căn nhà (~1.8) còn nới cụm ra thêm, không chặn
là một cái kho lương thò ra ngoài mép tường.

### ⚠ LUẬT MỚI — SÀN PHẢI PHỦ TỚI LỐI LÊN («leo lên rồi rơi»)

`StructurePlan.Validate()`: `accessX` phải nằm trong `[deckMinX, deckMaxX] ± 0.06`.

Đây là bản đo ở **pha kế hoạch** của lỗi mà `MapBuildRules.ProbeLanding` đo trên hình thật.
Mỗi bậc soi riêng đều hợp lệ, mặt đứng CÓ tồn tại, cao độ khớp — nên không phép đo cũ nào réo;
người leo tới đỉnh chỉ đơn giản là bước (hoặc buông tay) vào khoảng không. Bắt ở đây thì map
lùi về công trình mặc định **trước khi** có GameObject nào được dựng.

Ngưỡng 0.06 hiệu chuẩn trên số THẬT của bảng: lô cốt để trục thang lố mép sàn 0.02 (cố ý, thang
bám ngoài vách). Không phải số tròn cho đẹp.

Đã sửa một chỗ vi phạm có thật: `StructureGrammar.Wall` đặt lối đi theo `walkDef.width` còn
`accessX` theo `coreWidth` (mép khối). Thời kỳ Hiện đại bốc được khối đá 1.2 + lối đi thép 1.0
⇒ hụt 0.1 mỗi bên. Nay `walkWidth = max(walkDef.width, blockDef.width)`.

### Bảng chi tiết sau V5

165 dòng / 158 tên sprite. 32 tấm mới (22 nhà theo vai + 10 mỏ) — xem `WeaponArt-ChatGPT-Prompt.md` §6c-quinquies.

## V6 — "VÔ TẬN KIỂU NHÀ" bằng GHÉP LỚP · 4 loại mới (2026-09-06)

### Vì sao bản cũ "quanh quẩn vài kiểu" và sửa ở đâu

Bản cũ bốc MỘT tấm tầng + MỘT tấm mái + đặt MỘT cửa sổ giữa ⇒ số kiểu = số tấm tầng × số tấm
mái (vài chục). Vẽ thêm tấm tầng không cứu được: mỗi tấm là một đơn hàng art, và số kiểu chỉ
tăng TUYẾN TÍNH. `StructureGrammar.House` nay GHÉP LỚP chi tiết NHỎ chọn theo NHỊP:

| Lớp | Ô cắm | Chọn thế nào |
|---|---|---|
| 0 khối | Floor/Base/Roof | bề ngang vai × ±6 %, 1..3 tầng, 35 % có CHÁI (cánh phụ thấp hẹp, mái riêng, phía đối diện lối lên) |
| 1 vật liệu | Floor | tầng trên 40 % đổi chất (`SameWidthOr` giữ bề ngang) |
| 2 cửa sổ | `Window` | MỘT kiểu cho cả căn; số ô = `round(coreW/1.1)` ≤ 4; tầng trệt chừa ô có cửa, thưa hơn |
| 3 cửa | Door | kiểu + VỊ TRÍ (giữa / ±0.28·coreW) |
| 4 trang trí khối | `Band` 50 % · `Corner` 35 % (hai mép, lật một bên) · `Balcony` 30 % (≥2 tầng) |
| 5 đồ gắn | `Attach` | 0..2 lên mái (`roofMount`) · 0..3 lên tường, tránh ô cửa và chái |

Số kiểu là TÍCH của các lớp ≈ hàng triệu với ~30 tấm NHỎ. **Biến thiên từ tổ hợp, không từ art.**

⚠ Lớp phủ là tấm nhỏ nền TRONG SUỐT đè lên vật liệu tường — phải đọc ra được ở 15–40 px.
⚠ `Att_*` vẽ có hướng (đèn, ống nước) được `flip` theo nửa nhà: đồ ở nửa trái quay mặt vào giữa.
⚠ Vai vẫn là bộ lọc: `Pick(..., role)` trên MỌI ô mới, nên nhà lính có thể có bộ cửa sổ riêng sau này.

### Bốn loại mới — chỉ vì VĂN PHẠM khác

| Loại | Văn phạm | Gameplay |
|---|---|---|
| `Arcade` | trụ ×(n+1) · nhịp ×n (TRIGGER) → LỐI ĐI ĐẶC → lan can, cầu thang **HAI ĐẦU** (`plan.extraStairs`) | LÀN THỨ HAI trên cao, đi qua được từ cả hai phía — thêm đường, không thêm vật cản |
| `Scaffold` | khung → sàn MỘT CHIỀU + lan can ×2..3 tầng, THANG RIÊNG từng tầng so le (`plan.extraLadders`) | nhiều tầng đứng bắn trong chân đế hẹp |
| `Windmill` | đế → tháp ×n → chóp + CÁNH (`Sail`) — hiện đại = tua-bin cùng văn phạm | deco, thân trigger, máu 80 |
| `Market` | sạp ×2..4 + hàng hoá trong khe (đồ trại) | deco thuần |

⚠ **Giàn giáo KHÔNG được dùng một thang liền từ đất lên đỉnh.** `StickmanLocomotion` chỉ cho nhả
ở gần ĐỈNH thang (`ClimbReleaseReach` 0.6): tầng giữa của một thang liền là tầng không ai bước
ra được. Mỗi tầng phải là đỉnh của một cái thang — đó là lý do có `extraLadders`.
⚠ `Build` dựng `extraStairs`/`extraLadders` TRƯỚC khi tạo post, và thang tầng cao nhất được gán
làm `build.ladder` để post biết đường. `LaneNav.Rebuild` quét collider + `StickmanStairs` +
`StickmanClimbZone` trong scene nên hai loại này AI dùng được ngay, không khai thêm.
⚠ Hành lang vòm rộng ~13 (2..3 nhịp + hai dãy bậc): rải giữa đồng phần lớn bị từ chối vì thiếu
chỗ — đúng ý; muốn có thì đặt tay ở Xưởng map.

Bảng sau V6: 215 dòng / 205 sprite / 205 hàm vẽ. 47 tấm mới → `WeaponArt-ChatGPT-Prompt.md` §6c-sexies.

### Mỏ: thang bám mặt NGOÀI giàn

Bản đầu cộng `+side` nên thang rơi vào KHE giữa giàn và cửa hầm — tủ kính réo «trục thang lọt
VÀO trong thân» và người leo trèo qua chính cái lỗ đen. Giàn đã về `-side` thì thang đi tiếp
về `-side`. Bài học: khi một chi tiết đã bị đẩy lệch khỏi tâm, mọi thứ bám vào nó tính từ NÓ,
không tính từ `plan.x`.

## V7 — CỘT CHỐNG MÁI · CHỒNG THÙNG · CỘT CAO · QUẢNG TRƯỜNG (2026-09-06)

### ⚠ Mái tháp phải có VẬT THẬT đỡ (`PartSlot.Post`)

Mái tháp ngồi cao hơn sàn `max(1.05, cao lan can)` để không đè đầu (người 0.73). Lan can gỗ /
sắt / lưới cao đúng 1.05 nên mái đặt LÊN nó — nhưng lan can ĐÁ (răng cưa) chỉ cao 0.5, và bản
cũ vẫn nhấc mái lên 1.05: **mái treo lơ lửng 0.55 giữa trời**. Không phép đo nào thấy vì mái
không có collider.

Nay: có khoảng hở > 0.05 thì cắm CỘT ở hai mép sàn (và một cột giữa khi sàn > 2.4), cao đúng
khoảng hở. Bảng thiếu cột thì HẠ mái xuống ngồi trên lan can. `Validate()` bắt cả hai ca.

⚠ Đây là lần thứ HAI cùng một lớp lỗi (lần đầu: lọng trạm gác V5). Luật rút ra:
**chiều cao đầu phải nằm trong một VẬT — tấm art có cột, hoặc chi tiết `Post` — không bao giờ
nằm trong một phép cộng ở văn phạm.** Số thì đúng, hình thì sai, và chỉ nhìn ở cỡ thật mới thấy.

⚠ Art cột bị văn phạm KÉO CAO theo khoảng hở, nên hoa văn phải chịu co giãn dọc: thân trơn ba
dải sáng–gốc–tối, chi tiết chỉ ở đầu và chân.

### Ba loại mới

| Loại | Văn phạm | Ghi chú |
|---|---|---|
| `Stack` | 2..4 khối xếp SO LE, **rộng xuống dưới**, mặt trên MỘT CHIỀU | vật che CÓ cao độ. **Không** đặt `walkY`/`garrisonSlots`: bậc 0.65–1.05 vượt xa `MaxStepRise` 0.18 nên AI không leo được — khai chỗ đứng là gọi AI lên một cái đỉnh không lối lên. Người chơi chuyền lên được, một chiều không chặn làn ai |
| `Mast` | đế → thân ×2..5 → ngọn (cờ / chảo phát sóng) | thuần deco, phá đường chân trời |
| `Plaza` | vật trung tâm (đài phun · bồn cây) + 1..3 món hai bên | deco mặt đất |

Thêm chi tiết đa dạng: thân tháp nứt · mái củ hành · mái chóp vuông · mặt đồng hồ · tổ chim ·
khối bao cát · sàn gỗ nhô · rào chắn thép. Bảng sau V7: **240 dòng / 230 sprite / 230 hàm vẽ**.
25 tấm mới → `WeaponArt-ChatGPT-Prompt.md` §6c-septies.

## V8 — NHÀ CHÍNH BẢY KIỂU, GÁN THEO NỀN VĂN MINH (2026-09-06)

Trước đây 19 nền văn minh dùng CHUNG một dáng nhà chính. Nay `StructureKind.Keep` có bảy kiểu,
khai bằng chính `BuildingRole` (không đẻ trục lọc thứ ba — cả hai đều trả lời "công trình này
đóng vai gì", và `PickRole` đã lọc theo nó).

| Kiểu | Dáng (×ngang · tầng) | Nền văn minh |
|---|---|---|
| `Hall` Đại sảnh | ×1.00 · 1–2 | Europe · Crusader · Robbers · Pirate · **nền lạ** |
| `Donjon` Tháp vuông | ×0.74 · **3–4** | Byzantine · Rus · Ottoman |
| `Longhouse` Nhà dài | **×1.45** · 1 | Viking · Mongol |
| `Pagoda` Mái tầng | ×1.05 · 1–2 | China · Japan · DaiViet |
| `Terrace` Bậc thang | ×1.25 · 2–3 | Egypt · India · Persia |
| `Villa` Hiên cột | ×1.15 · 1–2 | Arab |
| `Bastion` Lô cốt chỉ huy | ×1.10 · 1–2 | Army · Police · Terrorist · **mọi map HIỆN ĐẠI** |

Đo ở cỡ thật: tháp vuông 2.50 × 7.18, nhà dài 4.91 × 3.23 — hai đầu của dải, đọc ra khác nhau
từ khoảng cách mà mái và cửa đã nhoè.

⚠ **`Hall` cố ý KHÔNG có dòng chi tiết riêng**: nó rơi về bộ chung `role = Any`, tức nhà chính
cũ giữ nguyên từng pixel. Sáu kiểu mới là THÊM, không phải THAY.
⚠ **Chọn kiểu làm trong `StructureAssembler.Plan`, không ở chỗ gọi.** `MapAssembler`,
`MapScenery`, Xưởng map và tủ kính Demo_40 là bốn đường dựng — để mỗi đường tự tra là sớm muộn
có đường quên, và một nền văn minh dựng ra nhà chính của nền khác mà không lỗi nào báo.
⚠ **Bảng tra nằm ở tầng MAP** (`StructureGrammar.KeepStyleFor`), KHÔNG phải một field trên
`CivilizationDefinition`: nền văn minh là asset tầng Units (3) còn `BuildingRole` là kiểu tầng
Map (6) — khai bên đó là tham chiếu ngược tầng mà build gộp không thấy (đã dính một lần với
`MapTheme` + `WeatherAmbience`).
⚠ Nền lạ (mod, nền thêm sau) rơi về Đại sảnh, không rơi về rỗng.

### Bốn vai nhà mới

`Infirmary` (nhà thương / trạm xá) · `Workshop` (xưởng thợ) · `Tavern` (quán rượu, cửa sổ sáng —
nguồn sáng ấm duy nhất trong xóm về đêm) · `Tenement` (chung cư hẹp 3–4 tầng, chỉ hiện đại).
Tổng 12 vai nhà. Bảng sau V8: **259 dòng / 249 sprite / 249 hàm vẽ**.

## V9 — Ổ NẤP · CHỒNG THÙNG CHẮN ĐẠN (2026-09-06)

* `StructureKind.Nest = 20`: 1..3 khối thấp xếp sát (`Nest_Sandbag`/`Nest_Barrel` hiện đại,
  `Nest_Earthwork`/`Nest_Gabion` trung cổ, Solid) + một món SAU LƯNG phía ngược `accessSide`
  (`Nest_Pavise` tint phe · `Nest_Ammo`). Không sàn, không lối lên. 6 tấm mới (bảng 265 hàng).
* `Build`: **Stack và Nest đi qua `MapCastle.FinishFort(Barricade, passableForEveryone, objective:false)`
  + `SetIndestructible`** — chắn đạn (`BlocksProjectiles`), `FindCover` thấy, ai cũng đi xuyên (mặt một
  chiều của chồng thùng vẫn đứng lên được vì `IgnoreWith` miễn `usedByEffector`), không nhãn mục tiêu.
  `Mast` vẫn chỉ là thân tĩnh.
* `FinishFort(..., bool objective = true)`: vật che trung lập KHÔNG gắn `MapObjective` — HUD hiện máu
  cho một thứ bất tử không của phe nào là nói dối.
* `CombatStrategies.CoverHalfWidth`: nửa bề ngang THẬT từ collider CON (root không có collider) —
  bản cũ luôn ra 0.5, với container 2.2 thì chỗ nấp rơi vào giữa thùng.
* Scatter làng: Stack 4 % · Nest 3 % (`ScatterKitDeco`). Studio có Nest trong danh sách kind.
* Cỡ: cao 0.6–0.7 so với stickman 0.73 — ngồi khuất, đứng ló. Đã xem `nest_preview.png` trước khi giao.

## V10 — CHUỖI THANG: "leo lên từng tầng" (2026-09-07)

User (tủ kính `Demo_40`, loại `Scaffold`): *"cầu thang và sàn không đúng, không leo lên từng
bậc được, ngoài ra điều phối cả AI"*. **Hai lỗi chồng nhau, và cả hai đều để lại đồ thị làn
HOÀN TOÀN THÔNG** — HUD của tủ kính vẫn in `✔ không lỗi kế hoạch / liên mạch`, `MapBuildRules`
vẫn xanh, không một dòng log.

| # | Bẫy | Nhìn ra thành gì | Chốt chặn |
|---|---|---|---|
| 1 | **`AIStateGarrison` giả định MỘT thang từ đất lên nóc.** Giàn giáo có một CHUỖI thang (mỗi tầng một cái, so le hai bên) và `post.Ladder` là cái TRÊN CÙNG — chân nó lơ lửng hai tầng trên đầu người đứng dưới đất. `EnterClimb` trả **false**, không exception. | Cung thủ đi tới chân giàn, đứng đó tới hết trận. Đồ thị làn vẫn nối đủ `đất → sàn 1 → sàn 2 → sàn 3` nên mọi phép đo đều ✔ | `AIStateGarrison.NextLadderUp()` hỏi **chính `LaneNav`** bước kế tiếp thay vì tin `post.Ladder`; `TickClimbing` buông khi **hết CHẶNG** (`ClimbedAbove(zone.TopY)`) rồi quay lại `ToAccess` tìm chặng sau. Thang một mạch (tháp canh, lô cốt, tường) nhô `TowerLadderOverrun` **trên** mặt sàn nên `atPost` luôn nổ trước ⇒ **chạy y như cũ**. Không có đồ thị → rơi về `post.Ladder` như trước. |
| 2 | **Trục thang sát mép sàn hơn tầm dò mép vực.** Sàn cũ rộng `frame.width + 0.5` = 1.90, trục thang ở ±0.86 ⇒ chỉ lọt vào trong mép **0.09**, mà van chặn mép vực cắt vận tốc khi mép còn cách chân **0.35**. | Người/AI đi ngang trên sàn KHỰNG LẠI cách trục thang 0.26. `MoveTowardsX(axis, 0.3)` chỉ **vừa vặn** lọt — nới bề ngang khung thêm một tấc là AI không bao giờ "tới nơi" nữa, hỏng câm | Bề ngang sàn ĐI THEO trục thang: `deckHalf = axisOffset + StickmanLocomotion.DefaultLedgeProbeAhead + 0.05`. Hằng số `DefaultLedgeProbeAhead` nay **công khai** ở `StickmanLocomotion` để tầng Map hỏi được lúc dựng hình. |

**Hai `Check` mới trong `StructurePlan.Validate()`** — bắt TRƯỚC khi có GameObject nào, đúng khuôn
"kế hoạch sai thì không dựng":
· **CHÂN THANG LƠ LỬNG** — quét chuỗi `extraLadders` theo cao độ: chân mỗi thang phải trùng
  (±0.25) mặt đất hoặc đỉnh một thang đã đi qua. Đồ thị làn KHÔNG bắt được lỗi này vì nó đo
  NÚT và CẠNH, không đo chỗ đặt tay.
· **TRỤC SÁT MÉP** — trục thang phải cách mép sàn ≥ `DefaultLedgeProbeAhead − 0.02`. Chạy phép
  kiểm này trên bản CŨ thì giàn giáo trượt ngay (`0.09 < 0.33`).

⚠ **LAN CAN CHỪA MIỆNG THANG** hai đầu (`LadderHole` 0.34): chỗ hở đúng bằng chỗ bám được, nên
hình và cơ chế nói cùng một câu *"leo ở đây"*. Lan can chạy suốt mặt sàn thì miệng thang biến
mất khỏi hình và người chơi không có cách nào đọc ra lối lên — cùng họ với luật "art không được
nói ngược cơ chế" ở mái chóp tháp vs `GarrisonPost`.

⚠ **Đo lại sau khi sửa** (mô phỏng `scratchpad/sim_scaffold.py`, giàn 3 tầng): sàn 1.90 → **2.52**,
trục thang cách mép 0.09 → **0.40**, van mép vực giữ chân ở ±0.60 → ±0.91 (tức đứng ĐÚNG trên
trục được), và vòng leo của `AIStateGarrison` đi trọn **3 chặng** lên tới sàn có post.

⚠ **Chỉ `Scaffold` dùng `extraLadders` thành chuỗi.** `AIStateEscalade` (thang công thành) và
`AIStateInfiltrate` (ninja vượt tường) vẫn là một thang một chặng — không đụng tới. Thêm loại
công trình nhiều tầng nào nữa thì nó tự hưởng cả hai chốt chặn trên.

## V11 — CÔNG SỰ KHÔNG ĐƯỢC NUỐT COLLIDER CỦA CẦU THANG CON (2026-09-07)

Người dùng báo *"cầu thang này bị kẹt"* (tủ kính, tường đá 3 khối, thang bên trái). Hai lỗi
chồng nhau, cả hai câm lặng:

1. **`StructureKitShowcase.SpawnTestUnits` sinh cung thủ ở `x − 4` cố định.** Tường cao 2.8 có
   thang 19 bậc × 0.34 = 6.5 dài, bậc ở `x − 4` đã cao 1.3 ⇒ sinh ở `groundTop + 1` là ra lò
   **chôn trong khối bậc**, đứng giữa dốc giương cung tới hết trận (đúng bẫy `CtfStairs`).
   Nay sinh ngoài `FootprintMinX − 1.5` / `FootprintMaxX + 2` — chân đế đã tính cả dãy bậc.
2. **`Fortification._myColliders = GetComponentsInChildren<Collider2D>()`** trên root tường
   gom luôn dãy bậc (`StructureAssembler` treo thang dưới cùng root rồi `FinishFort` lên đó).
   Tường `passableForEveryone` cấp quyền đi xuyên cho người ở chân tường ⇒ bậc dưới cùng cũng
   trong suốt, trong khi `StickmanStairs` đang giữ nó ĐẶC cho người leo — hai chủ giành một
   cặp `IgnoreCollision`, người leo khựng ở chân thang. Nay `CollectMyColliders()` **loại mọi
   collider thuộc `StickmanStairs` / `StickmanClimbZone`**: cầu thang có luật đi xuyên/đặc
   riêng, công sự không được đụng vào.

⚠ Áp cho MỌI công sự có thang treo dưới root (tường · tháp · giàn giáo lắp ghép), không chỉ
tủ kính. Tường của `MapCastle.Build` (thang là con của root TƯỜNG chứ không phải của khúc
mang `Fortification`) vốn không dính — đó là lý do lỗi chỉ lộ ở công trình lắp ghép.

### V11b — Tường lắp ghép phải DÀI HƠN CAO

*"wall hơi ngắn"* (2026-09-07): `StructureGrammar.Wall` xếp đúng MỘT cột khối 1.2 rộng × tới
2.85 cao — tỉ lệ cái CỘT, cùng lỗi `MapBuildRules.WallArtAspect` đã chữa cho `MapCastle`. Nay
`columns = clamp(ceil(cao × 1.15 / rộng khối) + rng(0..1), 2, 5)`: bề ngang luôn ≥ 1.15 × chiều
cao, mỗi cột bốc khối riêng (đá/gạch lẫn), lối đi và răng cưa đặt **từng cột** (art lặp theo
nhịp cột thay vì kéo giãn một tấm), suất đứng = số cột (trần 3). `coreWidth` = tổng bề ngang
nên `accessX`/`FootprintMinX/MaxX`/chân đế tự đúng theo.

### V11c — Tường có BA kiểu lối lên: thẳng · CHỮ CHI · THANG ĐỨNG (2026-09-07)

*"kết hợp thêm cầu thang zig zag và cầu thang đứng cho wall"*. `StructureGrammar.Wall` bốc theo
seed: 40% thang thẳng · 35% **chữ chi** (`WallZigZag`) · 25% **thang đứng** (`WallLadder`);
tường ≥ 3 cột còn 60% có thêm thang đứng ở mặt NGOÀI (`WallExtraLadder` → `extraLadders`).

**Chữ chi trong engine khối-bậc-đặc** — ba điều làm nó chạy được, thiếu cái nào cũng kẹt:
1. Chặng TRÊN từ mặt tường đi RA tới chiếu nghỉ; chặng DƯỚI từ mép xa chiếu nghỉ quay NGƯỢC về
   phía tường xuống đất — nằm dưới gầm chặng trên. Người ở chặng dưới THẤP HƠN chân chặng trên
   nên `StickmanStairs` của chặng trên cấp cho họ quyền đi xuyên (luật "đi xuyên là mặc định") —
   không có va chạm nào giữa hai chặng.
2. **Chiếu nghỉ là SÀN MỘT CHIỀU rộng 1.9** (`plan.landings`, `PlatformEffector2D`): đủ rộng để
   người lên tới đỉnh chặng dưới đã ra khỏi gầm chặng trên, và một chiều để đi lên xuyên qua.
   `StickmanLocomotion.HasHeadroom` nay **bỏ qua sàn một chiều** — trước đó nó coi cái sàn trên
   đầu là trần và `TryStepUp` từ chối nhấc mấy bậc cuối trước chiếu nghỉ.
3. **`AIStateGarrison` đi theo TỪNG CHẶNG của `LaneNav`** (`FollowStairsRoute`) thay vì "đẩy
   thẳng về suất": thang chữ chi có chặng đi XA tường trước, đẩy thẳng là dí mặt vào chân tường
   mãi. Không có lộ trình thì giữ hành vi cũ — tường thẳng không đổi.
   Dữ liệu: `plan.stairLegs` (x đầu cao · y chân · y đỉnh · chiều) · `plan.landings` ·
   `plan.entryX` (chân chặng dưới — `EntryX`/post `AccessX` đọc) · `plan.zigzagExtent`
   (`FootprintMin/MaxX` dùng thay `StairsRun`).

**Thang đứng**: trục cách mặt tường 0.3, và lối đi NHÔ RA một mảnh 0.8 phủ qua trục (LUẬT
1b-TER — đỉnh thang trèo phải có chỗ đặt chân). Thiếu mảnh đó là leo tới đỉnh, buông ra rơi.

### V12 — CHIỀU SÂU: ĐI VÀO CÔNG TRÌNH, VÀ CỔNG "XOAY 90 ĐỘ" (2026-09-07)

User: *"cái cổng nên xoay 90 độ, ngoài ra sửa lại là công trình có chi tiết ở trước nhân vật và
có chi tiết ở sau nhân vật, nhìn cho nó giống thật là đi vào công trình, và ở trong công trình,
thêm nhiều chi tiết và công trình… sao cho tạo được đa dạng"*.

Game này đi ngang trên **một mặt phẳng** — không có chỗ nào để "đi vào". Nên chiều sâu chỉ tồn
tại bằng **thứ tự vẽ so với nhân vật**, và đó là ba lớp, không hơn:

| Lớp | `PartDepth` | Ô cắm | Bậc vẽ | Vai |
|---|---|---|---|---|
| GIAN TRONG | `Interior` | `PartSlot.Interior` | `StickmanWorldSorting.StructureRoom` (−29) | cái LỖ khoét vào mặt tường: vẽ TRÊN tường, vẫn SAU người |
| ĐỒ TRONG PHÒNG | `Body` | `PartSlot.Furniture` | `StructureTrim` (−28) | bàn · lò · quầy · giường, đứng trên nền gian |
| MẶT TIỀN GẦN | `Front` | `PartSlot.Facade` | layer `foreground`, `Occluder` | trụ hiên · tường lửng · mái hiên · khung cửa — vẽ TRƯỚC người |

Người bước vào ô cửa: chân bị tường lửng che, hai bên là trụ, sau lưng là căn phòng. Mắt đọc ra
"đứng TRONG nhà" mà **không một luật va chạm nào đổi** — cả ba lớp là hình thuần
(`StructureAssembler.PlacePart` ép bỏ collider cho ba ô này, kể cả khi bảng khai nhầm `Solid`).

⚠ **GIAN TRONG PHẢI VẼ TRÊN MẶT TƯỜNG, KHÔNG PHẢI DƯỚI.** Tầng nhà là một tấm ĐẶC kéo hết bề
ngang ở bậc `Structure` (−30); đặt phòng dưới nó là phòng biến mất và không lỗi nào báo. −29
nằm giữa tường (−30) và đồ đạc (−28) — cả ba đều dưới nhân vật.

⚠ **MẢNH MẶT TIỀN KHÔNG BAO GIỜ ĐƯỢC `flip`.** `PlacePart` chỉ đẩy lên layer `foreground` khi
`!part.flip` — cờ `flip` là bí danh "lớp SAU" của lan can tháp. Lật một cái trụ hiên là nó lặng
lẽ tụt về sau nhân vật; art vẫn đúng, chiều sâu mất sạch.

⚠ **HẸP · THẤP · THƯA.** Mỗi tấm ở lớp trước là một mảng che mất trận đánh: trụ ≤ 0.2 rộng,
tường lửng ≤ 0.45 cao (dưới tầm mắt stickman 0.73), hàng rào/lan can vẽ thưa. Mái hiên treo ở
**mép mái** (đỉnh tầng trệt) chứ không ở đỉnh ô cửa — stickman cao ~1.7 mà tầng trệt chỉ cao
1.2, nên đỉnh ô cửa rơi đúng tầm MẶT (luật cũ của lan can: *che thân lính, đầu vẫn lộ*).

⚠ **`weight = 0` = CHỈ GỌI ĐÍCH DANH.** Trụ · tường lửng · mái hiên · vòm cổng · cột đình khai
`weight = 0` để `Pick(Facade)` bốc đồ lặt vặt trước hiên không bao giờ vớ phải cái mái hiên rồi
dán nó xuống đất.

**Ô cửa mở** (`StructureGrammar.OpenBay`): vai MẶT TRƯỚC MỞ (tiệm · lò rèn · chuồng · xưởng ·
quán) luôn mở, còn lại 55 % — một dãy phố mà căn nào cũng hở ruột thì hết ra "phố". Mở rồi thì
**thôi dán tấm cửa đóng** vào đúng chỗ ấy. Trạm gác (`style.deck`) không mở: nó là công trình
có cao độ, mặt tiền đã bận.

**Cổng "xoay 90 độ"** (`StructureGrammar.Gate`): bản cũ xếp trụ · cánh · lanh tô trên CÙNG một
lớp, tức nhìn thẳng vào MẶT cổng — đứng cạnh nó mắt đọc ra "có cái cửa dựng giữa đồng". Nay:
lòng cổng (gian trong, vòm hầm tối, đầu kia có ánh sáng) → hai trụ + lanh tô → cánh cửa **thụt
vào 6 %** → hai má cổng gần + vòm gần ở lớp `foreground`. Trụ cao 2.0 → **2.45**, và
`scale` đo theo **TRỤ chứ không theo cánh cửa**: `heightHint` của cổng con trong toà thành chính
là chiều cao TƯỜNG (`StructureGrammar.Castle`), đo theo cánh là cổng thò lên nửa mét so với
tường hai bên mà không phép đo nào réo. Luật chơi giữ nguyên: cánh vẫn `Solid`, vẫn là chốt
chặn phá được duy nhất của làn.

**Đình** (`Keep`) mở cửa lớn vào đại sảnh + hai cột hiên + bậc thềm; **mỏ** có khung gỗ cửa hầm
vẽ trước người; **chợ** có quầy vẽ trước người (người bán đứng SAU quầy).

**Đa dạng là TÍCH, không phải tổng**: 14 gian trong × 15 món đồ × 12 mảnh mặt tiền × vị trí ô
cửa — nhân vào các lớp phủ mặt tiền đã có. 52 tấm art mới ở `StickmanStructureArt` (mục
"V9 — CHIỀU SÂU"), một helper mới `ArchCut`.

⚠ **`Disc` với màu alpha 0 KHÔNG khoét được lỗ nào.** `EnvCanvas.Blend` bỏ qua mọi màu `a <= 0`,
nên "vẽ một đĩa trong suốt để khoét vòm" là một dòng chạy mà không làm gì — art ra khối đặc,
không lỗi nào báo. Dùng `ArchCut` (xoá theo cột). `SaveLintel` dính đúng bẫy này từ bản đầu.

**Chạy lại sau khi sửa**: «Bộ chi tiết CÔNG TRÌNH lắp ghép (asset)» (tự vẽ bù art thiếu rồi bake
bảng) → «Tủ kính công trình lắp ghép (Demo_40)» → Doctor (`CheckStructurePartArt` đo bằng FILE
CÓ THẬT, nên tấm nào thiếu là đỏ đích danh).

### V13 — ĐI VÀO TRONG NHÀ THẬT: SÀN GÁC · CẦU THANG · ẨN/HIỆN GIAN TRONG (2026-09-08, sửa lại 09-09)

User: *"thêm các loại nhà, có thể đi vào và núp bên trong; bên trong nhà nếu có gác thì có cầu
thang đi lên; khi nhân vật của tôi đi vào nhà thì sẽ thấy bên trong, đi ra ngoài thì hết thấy;
AI có thể vào đó trốn để sống tới cuối cùng… áp dụng cho tất cả chế độ chơi, như đi vào castle,
lâu đài"*.

V12 dựng được **ảo giác** chiều sâu và tự nói rõ *"không một luật va chạm nào đổi"* — nhìn thì
như đi vào, thật ra vẫn đứng ngoài. V13 thêm đúng phần còn thiếu, **không đẻ hệ nào mới**:

| Cần | Dùng lại | Ở đâu |
|---|---|---|
| Giấu người trong nhà | **TẮT RENDERER CỦA CHÍNH HỌ** khi người xem đứng ngoài (có ô chờ `HideDwell` 0.6 s) | `BuildingInterior.UpdateOccupants` (Combat) |
| Thấy gian trong khi vào | nhánh `Gian_Trong` mờ dần lên khi người xem bước vào, tắt khi ra | `BuildingInterior.FadeInterior` |
| Sàn gác đứng được | `PlatformEffector2D` một chiều, đúng số 150° của thềm | `BuildingInteriorKit.BuildFloors` |
| Cầu thang lên gác | `MapCastle.BuildStairs` (kèm `StickmanStairs`, nên `LaneNav` đọc ra lối lên) | `BuildingInteriorKit.BuildStairs` |
| AI leo lên giữ gác | `GarrisonPost` + `StickmanClimbZone`, phe **−1 trung lập** | như trên |
| AI KHÔNG nhìn xuyên tường | `BuildingInterior.Hidden` cắm vào `StickmanAgent`, đúng hai chỗ hỏi `AreaHazard.SmokeBlocks` | AI |

⚠⚠ **`BuildingInterior` NẰM Ở MODULE COMBAT, KHÔNG PHẢI MAP.** AI (2) không được tham chiếu Map
(6), nên đặt nó ở Map thì radar không hỏi được và *"AI vào đó trốn"* chỉ lừa được mắt người chơi
— AI vẫn bắn xuyên tường vào một cái bóng người chơi không nhìn thấy, tức chỗ trú thành bẫy
chết. Đây đúng khuôn `AreaHazard.SmokeBlocks` (Combat) mà AI đang hỏi. Bộ **DỰNG** (`BuildingInteriorKit`)
thì vẫn ở Map vì nó cần `MapCastle`/`StructureKit`.

⚠⚠ **CHIỀU CAO TẦNG CỦA NHÀ ≠ CHIỀU CAO CỦA NGƯỜI.** Tầng trệt `StructureKit` cao ~1.2 (luật
V12), stickman cao ~1.7. Đặt sàn đúng mỗi mép tầng là người đứng dưới **chui đầu qua sàn trên**,
và vì sàn một chiều đẩy lên nên anh ta bị bắn lên gác mỗi lần đứng dậy. Sàn chỉ đặt ở mép tầng
cách sàn dưới ≥ `MinHeadroom` (1.95) **và** còn chừa ngần ấy tới đỉnh thân. Nhà ba tầng thấp ra
ĐÚNG MỘT gác; nhà thấp thì không có gác — vẫn vào trú được, chỉ là một gian.

⚠⚠⚠ **ĐỪNG DÁN GÌ LÊN CĂN NHÀ — HAI LẦN LÀM SAI RỒI (2026-09-09).**

Bản đầu giấu người bằng **TẤM CHE MẶT TIỀN**: một mảng phủ kín khuôn nhà, vẽ ở layer
`foreground` (tức trước nhân vật), mờ đi khi người chơi bước vào. Khuôn mượn từ
`VehicleSpec.nearPanel` — thứ DUY NHẤT làm ra được cảnh "ngồi TRONG xe". Nghe rất chắc, và ở xe
thì đúng. Ở công trình `StructureKit` thì **SAI**, vì một khác biệt tưởng nhỏ:

> **Cái xe là MỘT tấm hình. Căn nhà là hai chục mảnh xếp nhiều lớp.**

Tấm che chỉ chép được mấy mảnh `sortingOrder ≤ Structure` (phần THÂN); cửa, cửa sổ, gờ tường,
mái đều nằm ở lớp trên nên không được chép. Kết quả là một **KHỐI NÂU ĐẶC** hình dáng căn nhà
phủ kín căn nhà. Người dùng bác **hai lần**: *"cái nhà bị che, không phải là màn đen che nó"*
(bản v1, khối đen), rồi *"tôi muốn thấy MẶT NGOÀI của ngôi nhà"* (bản v2, khối nâu).

**Cách làm hiện tại: KHÔNG vẽ thêm gì ở phía trước.** Căn nhà giữ nguyên art của nó, luôn luôn.
Chỉ hai thứ đổi theo tầm mắt:
- **Gian trong** (`Gian_Trong`: nền phòng · sàn gác · thùng · cầu thang) — tắt renderer khi
  người xem ở ngoài, mờ lên trong 0.18 s khi họ vào.
- **Người ở trong** — tắt renderer CỦA HỌ. Kèm ô chờ `HideDwell` = 0.6 s: thân nhà là trigger
  nên lính **đi xuyên** nhà, giấu ngay khi chạm là ở một dãy phố người qua đường nhấp nháy
  biến mất rồi hiện lại vài lần mỗi giây. Trốn phải là bước vào rồi **Ở LẠI**.

**Nguyên tắc rút ra, dùng được ở chỗ khác: muốn giấu ai thì tắt CHÍNH HỌ, đừng vẽ thêm một lớp
lên thứ khác.** Lớp phủ luôn phải khớp với thứ nó phủ, mà "khớp" thì tốn đúng bằng vẽ lại cả
căn nhà một lần nữa.

⚠⚠⚠ **LẦN THỨ BA CÙNG MỘT LỚP LỖI — và lần này là dán lên chính GIAN TRONG (2026-09-09).**
Sau khi bỏ tấm che, tôi lại dựng một "nền gian trong": mảng phẳng màu tối kín khuôn nhà ở lớp
`StructureRoom`. Người dùng báo *"chi tiết bên trong nhà tại sao lại là 1 màn đen"*.

Nguyên nhân: **gian trong THẬT đã có sẵn từ trước.** `StructureAssembler.OpenBay` dựng một tấm
`PartSlot.Interior` (vách trát · khung gỗ · gian đá **có lò sưởi**) cộng 1–2 món
`PartSlot.Furniture` chọn theo VAI căn nhà (đe rèn · quầy hàng · bao lương). Mảng phẳng của tôi
nằm đúng lớp đó và che sạch.

**Ba lần liên tiếp cùng một phản xạ sai: gặp vấn đề hình ảnh thì DÁN THÊM MỘT MẢNG.** Cả ba lần
thứ cần làm đều là ngược lại — dùng art đã có, và điều khiển KHI NÀO nó hiện. Trước khi vẽ thêm
bất cứ mảng nào lên công trình, `rg "PartSlot.Interior"` xem bộ kit đã có sẵn chưa.

⚠ **"VÀO ĐƯỢC" PHẢI KÉO THEO "CÓ GIAN TRONG".** `OpenBay` vốn chỉ mở bay cho 55% số nhà (hoặc
100% với vai tiệm/lò rèn/quán). Nhà nào `BuildingInteriorKit.Wants` nhận mà `OpenBay` lại bốc
trượt thì **vào rồi không có gì để nhìn**. Nay `openFront` hỏi thẳng `BuildingInteriorKit.Wants`
— hai luật khớp nhau ở một chỗ.

### GIAN TRONG ĐẦY ĐỦ — MỌI TẦNG, MỌI LOẠI (2026-09-09)

*"Thiếu chi tiết bên trong nhà"* — ba nguyên nhân, ba chốt:

| Thiếu vì | Chốt |
|---|---|
| `OpenBay` chỉ gọi MỘT lần cho tầng trệt ⇒ leo cầu thang lên gác thì gác trống trơn | mở bay ở **mọi tầng** cho nhà vào được (`storeys[]` ghi cao độ từng tầng) |
| `OpenBay` chỉ nằm trong nhánh dựng NHÀ, mà `Wants` nhận 7 loại ⇒ phế tích · ruộng · chợ · cối xay · lô cốt chui vào được nhưng rỗng | `BuildingInteriorKit.BuildFallbackRoom` tự đặt `Room_*` + `Furn_*` cho mỗi sàn |
| Mở bay mọi tầng thì cả dãy phố hở ruột | gian trong của nhà vào được **bị giấu khi đứng ngoài** (`CollectKitRooms`), nên ngoài nhìn vẫn kín |

⚠ **NHÀ VÀO ĐƯỢC VẪN PHẢI CÓ CÁNH CỬA.** Ô cửa mở thay chỗ cánh cửa đóng; nhưng gian trong nay
bị giấu, nên không dán cửa là căn nhà thành **bức tường trơn** mà người chơi được mời "bấm LÊN
để vào". Cửa nằm dưới gian trong (`Structure` < `StructureRoom`) nên lúc vào, phòng vẽ đè lên nó.

⚠⚠ **QUY ƯỚC TÊN LÀ HỢP ĐỒNG.** `CollectKitRooms` nhận ra gian trong/đồ đạc **bằng TÊN OBJECT**
(`Room_*` · `Furn_*`) vì `PlacePart` đặt `new GameObject(def.key)`. Thêm một mảnh `Interior`/
`Furniture` mà đặt khoá khác tiền tố thì mảnh đó **không bao giờ bị giấu** — căn nhà hở ruột
vĩnh viễn và nhìn vào không phân biệt được với "nhà này cố ý mở". Doctor «Gian trong — quy ước
tên mảnh» đo đúng vế này trên `StructurePartSet`.

(Không lọc theo `sortingOrder` được: đồ đạc dùng chung bậc `StructureTrim` với trụ hiên và gờ tường.)

### "Ở TRONG NHÀ" LÀ MỘT QUYẾT ĐỊNH, KHÔNG PHẢI MỘT TOẠ ĐỘ (2026-09-09)

Người dùng: *"chỉ khi vào nhà mới thấy chi tiết chứ không phải đi ngang qua"*.

Bản trước hỏi `Contains(vị trí người chơi)`. Trong một trò chơi ĐI NGANG, thân nhà là collider
TRIGGER nên **chạy qua trước cửa và bước vào trong ở CÙNG một chỗ trên trục x** — không có phép
đo vị trí nào phân biệt được hai việc đó. Gian trong bật/tắt liên tục mỗi lần ai đó chạy ngang.

Chốt: người chơi phải **NÓI RA**. Đứng trong khuôn nhà, ở tầng trệt (`DoorReach` 1.4), bấm
**LÊN** (W/↑ hoặc `StickmanTouchInput.StairAxis`, đúng khuôn `HandleTraversalInput`) thì vào.
Ra thì không cần bấm gì — đi khỏi khuôn nhà là ra; bắt bấm cả hai đầu là mỗi lần chạy trốn lại
phải nhớ thêm một phím.

⚠ Kèm LỜI MỜI: `BuildingInterior.AtDoor` trỏ tới căn người chơi đang đứng trước cửa mà chưa vào,
giao diện đọc để hiện *"Bấm LÊN để VÀO NHÀ"*. Không có lời mời thì cơ chế này vô hình và người
chơi kết luận là nhà không vào được — đúng bài học của thanh đỡ đồng đội dậy.

⚠ Phải nhớ ĐÚNG những renderer mình đã tắt rồi mới bật lại (`Occupant.renderers`), và trả hình
trong `OnDisable`. Bật bừa tất cả là làm hiện luôn mấy thứ đang tắt vì lý do khác; quên trả là
người trốn trong căn nhà vừa bị huỷ sẽ **tàng hình vĩnh viễn** — vẫn đánh nhau, vẫn ăn đạn.

⚠⚠ **SÀN GÁC LÀ VẬT LÝ THẬT, TỒN TẠI BẤT KỂ AI NHÌN.** Chỉ RENDERER của nó ẩn theo tầm mắt,
collider thì không bao giờ. Cho sàn ẩn/hiện theo người chơi là kẻ đang đứng trên gác rơi xuống
đúng lúc người chơi quay đi.

⚠ **CHE PHẢI CHẶT HƠN "CHẠM KHUÔN" — `DeepInside` (thụt 0.55 mỗi mép).** Thân nhà là collider
TRIGGER nên lính ĐI XUYÊN nhà như đi qua chỗ trống; nếu chạm khuôn là biến mất khỏi radar thì ở
một dãy phố mọi người nhấp nháy trong/ngoài tầm mắt nhau vài lần mỗi giây, mục tiêu AI đổi liên
tục và nhìn ra là *"AI đứng khựng rồi quay đầu vô cớ"*. Trốn phải là một QUYẾT ĐỊNH. Kèm ngoại lệ
KỀ MẶT 2.5 (đúng ngoại lệ của khói).

⚠ **CẮM Ở ĐÚNG MỘT CHỖ: cuối `StructureAssembler.Build`.** Mọi công trình của dự án đi qua đó,
nên nhà vào-được có mặt ở MỌI chế độ — map ngẫu nhiên, làng, doanh trại, toà thành — mà không
 builder nào phải nhớ gọi thêm. `BuildingInteriorKit.Wants` lọc loại: **7 loại** — `House` · `Keep` · `Bunker` · `Ruin` · `Farm` · `Market` · `Windmill` (nới rộng 2026-09-09 từ 2 loại; người chơi báo *"không có nhiều công trình để chui vào núp"* vì rải cảnh cho ~13 công trình/map mà nhà chỉ chiếm ~16% ⇒ hai căn cho cả sân). Loại nào thấp quá thì `Apply` tự loại ngưỡng `MinShellHeight` = 1.35; nhà thấp vẫn là gian trú một tầng, còn gác chỉ dựng khi đủ `MinHeadroom` 1.95 nên không sinh tầng lơ lửng. Mật độ rải điều khiển bằng `MapBuildRules.ShelterDensity(mission)` — battle royale = 1, còn lại 0.
**Tháp KHÔNG** (đã có sàn + thang + `GarrisonPost` riêng — thêm bộ nữa là hai cầu thang chồng
nhau); `Castle` là công trình GHÉP nên mỗi mảnh con tự đi qua cửa này.

⚠ **Phép đo Doctor «Công trình VÀO ĐƯỢC»** vẫn kiểm lớp `foreground` phải CÓ và nằm **dưới**
`character` trong Sorting Layers. Từ 2026-09-09 hệ nhà-vào-được không còn dùng lớp đó nữa, nhưng
`PartSlot.Facade` (trụ hiên · mái hiên · khung cửa) thì vẫn — nên phép đo giữ nguyên giá trị.

**Battle royale** dùng thêm một nước đi: tổ có người tụt máu mà hết thuốc thì rút vào nhà
(`MapBattleRoyale.Brain` › `NearestShelter`, kẹp trong vòng bo) — đó là chỗ *"trốn để sống tới
cuối cùng"* trở thành quyết định thật của AI. Xem [BattleRoyale.md](BattleRoyale.md).

### NHÀ VÀO ĐƯỢC · HAI LỚP · Ô HỎI VÀO · AI TỰ VÀO RA → [BuildingInterior.md](BuildingInterior.md)

Từ 2026-09-09 hệ "đi vào công trình" đủ lớn để đứng riêng: thuật toán HAI LỚP (một công thức
sinh cả mặt ngoài lẫn mặt trong, **cùng một khổ**), ô bấm mời vào, và bộ điều phối cho AI tự
vào tự ra. Luật ở [BuildingInterior.md](BuildingInterior.md); phần trên file này giữ nguyên vai
trò dựng CHI TIẾT công trình.

## CHI TIẾT NHÀ ĐỢT 3 — ĐỔ VÀO ĐÚNG Ô ĐANG LÀ NÚT CỔ CHAI (2026-09-09)

User: *"vẽ thêm nhiều chi tiết cho nhà, cho công trình… nhớ là có chi tiết bên trong nữa"*.

`StructureGrammar.House` bốc MỘT chi tiết cho mỗi ô, nên **số dáng nhà là TÍCH các ô**, không
phải tổng. Đếm lại kho trước đợt này:

| Ô | Trước | Sau | Ghi chú |
|---|---|---|---|
| `Window` | **5** | **14** | ô nhân MẠNH nhất — cửa sổ chiếm phần lớn diện tích mặt tiền |
| `Band` | 2 | 5 | phào giữa hai tầng |
| `Corner` | 2 | 5 | đá góc / trụ góc |
| `Balcony` | 2 | 4 | ban công |
| `Attach` | 10 | 16 | đồ gắn tường |
| `Furniture` | 15 | **23** | đồ trong phòng, cho 29 kiểu gian trong |

5 × 2 × 2 × 2 = **40** dáng mặt tiền → 14 × 5 × 5 × 4 = **1400**. Thêm một kiểu MÁI nữa cũng
không chữa được cảm giác "nhà nào cũng như nhà nào": phải thêm vào đúng ô đang thắt.

**Art:** `StickmanStructureArt.NhaChiTiet.cs` (31 tấm, vẽ bù) · khai bảng ở
`StructurePartSet.Detail.cs` (`AddDetailParts`, móc ở cuối `AddTwoLayerParts` vì
`StructurePartSet.cs` đã kịch trần sổ nợ kích thước). Xem trước bằng
`.claude/skills/stickman-assets/scripts/house_details_preview.py` — render cỡ THẬT có stickman
73 px làm thước, ba tấm sheet.

**Hai tấm đáng chú ý:**
* **`Win_Glow` (cửa sổ sáng đèn, trọng số 1.4)** — cả bộ trước đợt này không có tấm nào phát
  sáng. Nó là tấm DUY NHẤT nói được *"căn nhà này CÓ NGƯỜI Ở"*, và một dãy phố không ô nào sáng
  đọc ra khu bỏ hoang. Bên trong có bóng người (mảng tối trên nền vàng) — đọc được ở 40 px.
* **`Win_Boarded` / `Win_Broken`** — cùng ô, nhưng chúng nói ngược lại. Nhờ vậy map phế tích và
  map làng sống dùng CHUNG một văn phạm, khác nhau ở trọng số bốc chứ không ở cây prefab.

**Chi tiết khai VAI chỉ đến được qua đường bốc theo vai** (`StructurePartSet.Pick`):
`Win_Stained` chỉ ở đền miếu · `Win_ArrowLoop` chỉ ở trạm gác · `Furn_Rack` chỉ ở nhà lính ·
`Furn_Bottles` chỉ ở quán rượu · `Furn_MapTable` chỉ ở trạm gác. Nhà dân không bao giờ mọc ra
một ô kính màu nhà thờ.
