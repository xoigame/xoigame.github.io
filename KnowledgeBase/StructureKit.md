# StructureKit — công trình LẮP từ chi tiết nhỏ (2026-09-05)

Tháp · nhà · tường · cổng không còn là một hàm dựng gõ tay toạ độ. Mỗi công trình là **một dãy
chi tiết** (đế · thân · sàn · lan can · mái · deco · tầng · khối tường · trụ · cánh cửa) xếp theo
**văn phạm** của loại và **seed**, tự kiểm luật trước khi có GameObject, rồi dựng bằng đúng
primitive gameplay của dự án nên AI đi được ngay.

Sân: `Demo_40_StructureKit` (Bảng điều khiển › *Thể loại & Map* › «Tủ kính công trình lắp ghép»).
Bộ chi tiết: `Assets/Settings/StructureKit/StructurePartSet_Default.asset` (bake từ
`StructurePartSet.DefaultParts()` — **code là nguồn sự thật**). Art: `Assets/Sprites/Structures/`.

## 1. Bốn tầng

| Tầng | File (`Assets/Scripts/Map/`) | Vai |
|---|---|---|
| CHI TIẾT | `StructureParts.cs` (`StructurePartDef`) + `StructurePartSet.cs` (asset) | một dòng = một chi tiết: cỡ · ô (`PartSlot`) · va chạm (`PartCollision`) · art · cách fit · lớp trước/sau · trọng số bốc |
| KẾ HOẠCH | `StructureParts.cs` (`StructurePlan`, `PlacedPart`) | chi tiết đã đặt chỗ + `walkY` · `access` · `garrisonSlots` · `Validate()` · `Describe()` |
| VĂN PHẠM | `StructureAssembler.cs` (`StructureGrammar`) | `Tower` · `House` · `Wall` · `Gate`: thứ tự lắp, ô bắt buộc / tuỳ chọn, lặp mấy lần, lối lên |
| LẮP | `StructureAssembler.cs` (`StructureAssembler.Plan/Build/Create`) | plan → GameObject qua `MapCastle.CreateLadder/CreatePost/FinishFort/BuildStairs` |

Tủ kính runtime: `StructureKitShowcase.cs` — bày **MỘT** công trình, HUD đổi loại · seed ·
«Ngẫu nhiên» · «Dựng lại» · 💾 lưu công thức · thả lính thử · soi collider. Editor: `StickmanStructureArt.cs` (art vẽ bù) · `StickmanStructureKitBuilder.cs`
(asset + scene + thước soi seed).

## 2. Ô cắm — pivot ĐÁY-GIỮA cho mọi chi tiết

Chi tiết cắm VÀO ở đáy (`y`), cắm RA ở đỉnh (`y + height`). Chồng lên nhau chỉ là cộng chiều
cao; thay art khác khổ thì `StructureAssembler.PlacePart` scale theo `width/height` khai trong
bảng, KHÔNG theo khổ ảnh — nên hình đổi mà collider và ô cắm đứng yên.

Collider đo theo **khung sprite gốc** (`sprite.bounds.size`, offset `(0, native.y/2)`) rồi để
scale của object co giãn ⇒ collider luôn trùng hình. Vì vậy art phải là **`FullRect` mesh** và
vẽ KÍN hai mép trên/dưới của chi tiết cắm chồng (thân · tầng · khối tường) — hở là lộ khe.

## 3. Va chạm là THUỘC TÍNH của chi tiết, không của công trình

| `PartCollision` | Dùng cho | Nghĩa với AI |
|---|---|---|
| `None` | mái · deco · lan can · răng cưa · lanh tô · cửa/cửa sổ | không có gì |
| `Trigger` | thân tháp · đế · tầng nhà | đi xuyên, đạn trúng (quy ước nhà cửa) |
| `OneWay` | sàn tháp (`PlatformEffector2D` cung 150) | trèo thang chui lên từ dưới, đứng được, tụt xuống được (`DropThroughPlatform`) |
| `Solid` | khối tường · lối đi · trụ · cánh cổng | đứng được trên nóc; tường nhường làn qua `Fortification.passableForEveryone`, cổng chặn thật |

`foreground = true` ⇒ `StickmanWorldSorting.ApplyForeground(Occluder)` — lớp TRƯỚC che thân
lính đứng sau (lan can, răng cưa). Vẽ thưa (≥ 40 % trong suốt), không thì che mất người.

## 4. Văn phạm từng loại

| Loại | Dãy | Lối lên | Thân gameplay |
|---|---|---|---|
| **Tower** | đế → thân ×1..3 (mỗi khúc bốc lại: trơn/châu mai/gỗ, CÙNG BỀ NGANG) → sàn (rộng hơn thân ≥ 0.4) → lan can SAU + TRƯỚC → mái ở `walkY + 1.05` → 0..2 deco phía đối diện thang | thang trèo ở `x ± (thân/2 + 0.25)` cao `rise + TowerLadderOverrun`; hoặc CẦU THANG (45 %) khi `rise ≤ 1.75` | `Fortification` Tower, `walkableTop`, `passableForEveryone`, bất tử (máu 0) · `GarrisonPost` ở TÂM sàn, `accessOffsetX = EntryX − postX` |
| **House** | móng → tầng ×1..2 (cửa sổ) → cửa tầng trệt → mái (+ ống khói 60 %) | không | `Rigidbody2D` tĩnh + trigger; vai `MapObjective` do màn gắn |
| **Wall** | khối ×1..3 → lối đi chồng `StairWallOverlap` lên khối → răng cưa (trước) | cầu thang mặt trong (`accessSide`) | `Fortification` Wall, `walkableTop`, `passableForEveryone` + `passableForOwner`, bất tử |
| **Gate** | trụ ×2 + cánh (đặc) + lanh tô | không | `Fortification` Gate, máu 70, `passableForOwner` |
| **Keep** | móng → tầng lớn ×1..2 (cửa sổ) → nóc răng cưa / mái sảnh → cửa lớn + 2 cờ | không | trigger như nhà; máu mặc định 90 (màn gắn vai) |
| **Castle** | GHÉP: [tháp] tường×n CỔNG tường×n [tháp] — `plan.children` | từng mảnh tự có | mỗi mảnh một `Fortification`; `build.fort` = cổng |
| **Tree** | thân ×1..3 (hơi nghiêng, cỡ 0.8–1.3) → tán tròn/thông/liễu/trụi, 45 % bụi gốc | không | DECO, `collision = None`, `BackProp` |
| **Rock** | 1..3 tảng chồng mép | không | DECO, `Prop` |

**Chi tiết v2** (67 dòng): thân gạch / vữa khung gỗ, sàn đá, lan can sắt, mái vòm / chóp nhọn / nóc
răng cưa, đèn lồng, dây leo, cửa sổ chớp, tầng đá / khung gỗ có cửa sổ, mái đá đen / ván gỗ, cửa
vòm, bộ đình (móng · tầng đá / gạch · nóc răng cưa · mái sảnh · cửa lớn · cờ · cửa sổ), khối đá hộc /
vữa, răng cưa cao, lối đi ván, trụ gạch, cửa lưới sắt, lanh tô vòm, thân cây ngắn / cao, 4 tán, bụi,
3 tảng đá.

`heightHint` ép số khúc; `accessSide` 0 = bốc theo seed. Mọi số ngẫu nhiên qua
`System.Random(seed)` — cùng seed ra cùng công trình.

## 5. `Validate()` — sai thì không dựng

Tháp không sàn · sàn không rộng hơn thân · không lối lên · mái đè đầu (< 0.95 trên sàn) · tường
không lối đi / không cầu thang · bậc cao hơn `MaxStepRise` · trục thang lọt VÀO thân · hai khối
đặc chồng nhau (> 0.05 × 0.06, trừ lối đi chồng 0.04 cố ý). Tủ kính in từng dòng; tool «Soi 4
loại × 40 seed» chạy 160 kế hoạch ra Console.

Sau khi dựng, tủ kính gọi `MapBuildRules.ValidateLanes(null, null)` — tức hỏi **chính `LaneNav`
mà AI dùng**: tầng cô lập, lên được mà không xuống, mặt đứng không nối nền. Đo cả scene (null)
chứ không riêng hàng công trình, vì mặt đất nằm ngoài hàng.

## 5b. Art theo nền văn minh + deco trong map

· `StructurePartDef.tint` (`Banner` · `Roof` · `Accent`): `StructureAssembler.ApplyTint` nhân màu cờ
  của `StructureRequest.civ` vào `color` — không có nền thì giữ nguyên art. Cờ treo đúng màu cờ,
  mái pha 45 %, điểm nhấn 30 %.
· Art thật theo nền: thả `Sprites/Structures/<CivKey>/Part_X.png`, bấm «Bộ chi tiết CÔNG TRÌNH
  lắp ghép» → `StructurePartSet.civSprites`; `SpriteFor(name, civKey)` ưu tiên nó. Đơn đặt
  ChatGPT: `WeaponArt-ChatGPT-Prompt.md` §6c.
· `MapScenery.ScatterKitDeco`: rải cây/đá lắp ghép dọc map (bước 4–10, tránh lô giữ chỗ và miệng
  vực, cao độ theo `SurfaceY`). Tắt bằng `MapDefinition.kitDeco`.

## 6. Lưu một công trình và dùng lại khi tạo map

Tủ kính bày **MỘT** công trình ở giữa sân. Ưng cái nào thì bấm 💾 «Lưu công trình này»:

| Bước | Chuyện gì xảy ra |
|---|---|
| 💾 | ghi `Assets/Settings/StructureKit/Recipes/<Loại>_<seed>.asset` (`StructureRecipe`) |
| | nối luôn vào `MapLibrary.structureRecipes` (hỏi lại `LoadAssetAtPath` để không dính bẫy `m_Script: 0`) |
| tạo map | `MapScenery` ô **chòi canh** gọi `MapLibrary.RecipeFor(Tower, rng)`; có công thức thì dựng nó, không thì `MapCastle.BuildWatchtower` như cũ |

⚠ Công thức lưu **SEED + núm** (`kind` · `seed` · `heightHint` · `accessSide` · bảng chi tiết),
KHÔNG lưu toạ độ từng chi tiết — cùng lý do `FortLayoutDefinition` chỉ lưu seed: mỗi lần dựng
phải đo lại theo mặt đất và chỗ đặt của map đó.
⚠ Trước khi dựng, map chạy `plan.Validate()`; phạm luật thì **bỏ công thức, lùi về tháp mặc
định**. Một công trình không ai leo lên được thì thà đừng có.
⚠ Muốn map dùng được thì `MapLibrary.structureParts` phải trỏ vào bảng chi tiết (nút «Bộ chi
tiết CÔNG TRÌNH lắp ghép» tạo asset; nút 💾 tự nối công thức).

**Đặt tay vào map — Xưởng map tab «Công trình»**: chọn loại + seed (hoặc một công thức đã lưu)
→ «Đặt tại giữa màn hình». Có map nháp thì ghi vào `MapDefinition.structures` (`PlacedStructure`:
công thức hoặc loại+seed, `x`, phe) và dựng lại địa hình — `MapScenery` giữ chỗ chân đế TRƯỚC khi
xếp lô rồi dựng SAU; lưu map là đi theo. Không có nháp thì đặt THỬ vào màn đang chơi (không lưu),
mặt đất đo bằng tia dò xuống (bỏ người, trigger, sàn một chiều, bậc thang), rồi hỏi lại đồ thị làn.

## 7. Thêm chi tiết / thêm loại

· **Chi tiết mới** = một dòng `DefaultParts()` (khai `kind` + `slot` + cỡ + `collision` + tên
  sprite) + một hàm vẽ trong `StickmanStructureArt` (hoặc thả PNG cùng tên) + bấm «Bộ chi tiết
  CÔNG TRÌNH lắp ghép». Văn phạm bốc theo `slot` + `weight`, không sửa dòng nào khác.
· **Loại mới** (castle, đình, xưởng…) = một giá trị `StructureKind` + một hàm trong
  `StructureGrammar` + một nhánh trong `StructureAssembler.Build` chọn `FortKind`/thân gameplay.
  Chi tiết dùng lại được giữa các loại nếu cùng `slot` (khai `kind` cho khớp).
· **Ghép nhiều công trình thành map**: gọi `StructureAssembler.Create(parent, request)` liên
  tiếp, đọc `StructureBuild.MinX/MaxX/EntryX/WalkY` để đặt cái sau không đè cái trước (tủ kính
  làm đúng vậy: `Plan` một lần để đo chân đế rồi mới `Build`).

## 8. Bẫy đã tính trước

· `Fortification` root tạo TẮT rồi `FinishFort` bật (`ConfigureAsStructure` trước Awake).
· `FinishFort` dùng `GetComponent ?? AddComponent` (bẫy `[RequireComponent]` chèn bản thứ hai).
· Chân cầu thang nằm NGOÀI chân đế phần thân — `FootprintMinX/MaxX` tính cả `StairsRun`, đừng
  xếp công trình kế tiếp theo `coreWidth`.
· Art `Part_*` là VẼ BÙ (`stickman:codegen`); thả art thật cùng tên vào folder là được giữ.
  Đơn đặt ChatGPT: khổ ảnh = cỡ world × 100, pivot đáy-giữa, kín hai mép cho chi tiết cắm chồng.
· **`Destroy` hoãn tới cuối frame**: dọn công trình cũ bằng vòng theo `childCount`, đừng
  `while (Find(...) != null)` — trong Play mode nó là vòng lặp vô tận và **Unity treo cứng**.


## 9. V3 — ĐÌNH LÊN NÓC · TRẠI LÍNH · PHẾ TÍCH · đình làm nhà chính map (2026-09-05)

### 9a. Đình (`Keep`) lên nóc được
Văn phạm: móng → tầng ×1..3 (cửa sổ) → **cửa vào** → **`Keep_Deck`** (sàn MỘT CHIỀU 3.4×0.18,
`walkY`, 1..4 suất gác) → **`Keep_Parapet`** răng cưa (hai lớp: sau + trước `foreground`) → mái
sảnh TUỲ CHỌN (`Keep_Roof_Hall`) ngồi SAU lối đi ở `walkY + 0.3` → cờ hai mép.
Lối lên là **cầu thang trong nhà**: `access = Ladder`, `accessX` = trục cửa; `Build` dựng thang trèo
như tháp rồi `HideLadderInside` tụt hình xuống `Structure − 2` (mặt tiền che, vùng leo giữ nguyên
— tủ kính «Soi collider» vẫn thấy). Art `Part_Keep_Door` là CỬA MỞ với bậc thang tối bên trong.
`Validate`: đình phải có tầng + sàn nóc + lối lên + lan can.
Vì sao AI đi được mà không thêm luật: với `LaneNav` đó là một cạnh thang nối đất ↔ một sàn một chiều
— cùng thứ tháp canh đã có. `GarrisonPost` trên nóc: `accessOffsetX = EntryX − postX` như tháp.
`Keep_Roof_Open` là ô "nóc trống": sprite rỗng, cao 0 — văn phạm bỏ qua, đừng cho nó art.

### 9b. Hai loại deco mới
- **`Camp`** (trại lính): `[đồ] LỀU [lửa] LỀU [đồ]` — lều `Base` ×1..2, `Camp_Fire` (`Floor`),
  1..3 `Prop` (thùng · hòm · xe · cỏ khô · giếng · giá vũ khí) hai mép, `Camp_Flag` cạnh lều.
  Lều vẽ SÁNG để `tint = Banner` nhuộm màu cờ phe.
- **`Ruin`** (phế tích): 2..3 mảng tường gãy (`WallBlock`), trụ đổ (`Pillar`) 55%, đá vụn (`Rock`).
  `MapScenery.ScatterKitDeco` rải cây 70% · đá 18% · phế tích 12%.
- Rào cọc: `Wall_Block_Palisade` (Solid, cùng bề ngang khối đá để `SameWidthOr` chấp nhận) +
  `Wall_Crenel_Stakes` (foreground).

### 9c. Đình lắp ghép làm NHÀ CHÍNH của map sinh (`MapAssembler.CreateKeepHall`)
`BuildCamp` gọi `CreateKeepHall` trước, không được thì rơi về `CreateBuilding` (khối nhà một tấm).
Nó: `Plan` (seed = seed ván × 31 + phe × 7919) → `Validate` → `Build` → **dời `Keep_Deck` · thang ·
`GarrisonPost` sang object anh em `<tên>_Noc`** → tắt root → `BoxCollider2D` trigger phủ thân +
`TeamMember` + thanh máu + `BaseBuilding.ConfigureAsStructure/Setup` + `MapObjective.Headquarters`
→ bật. Kèm một `Camp` deco sau đình khi `economyProps`. Phe có post được ghi vào
`MissionContext.teamsWithPost` → cung thủ phe thủ khai `AIBehavior.Garrison` dù map không thành luỹ.

⚠⚠ Vì sao phải dời nóc ra ngoài: `StickmanLocomotion.IsStandableSurface` bỏ qua mọi collider có
`StickmanController` ở nhánh cha (trừ `Fortification` có mặt đi được). Để sàn nóc dưới
`BaseBuilding` là người đứng trên nóc bị coi là ĐANG RƠI — đúng bẫy `ShipVessel`.
⚠ Root đã bật lúc `Build` → `SetActive(false)` trước khi gắn `BaseBuilding` (`_buildBodyHitboxes`
đọc một lần ở Awake).
⚠ Đình-nhà-chính không có `StructureSkin` nên nút «NỀN» đổi nền giữa trận không khoác lại art đình
(art chọn theo `request.civ` lúc dựng). Chấp nhận được; muốn hơn thì thêm `civSprites` đổi lúc chạy.


## 10. THỜI KỲ · LÔ CỐT · CỔNG BA TRẠNG THÁI (2026-09-05)

### 10a. `PartEra` — một cột trên bảng chi tiết, không phải một loại công trình mới

```
enum PartEra { Any, Medieval, Modern }      // StructureParts.cs
StructurePartDef.era                        // khai trên TỪNG DÒNG chi tiết
StructurePlan.era                           // chốt lúc Plan, dùng suốt lúc Build
StructurePartSet.Pick(kind, slot, rng, era) // bốc theo trọng số TRONG thời kỳ đó
```

`PickFiltered` có **chuỗi lùi**: đúng thời kỳ → `Any` → bất kỳ. Nhờ nó, ô nào chưa có bản hiện
đại thì lấy bản trung cổ chứ không bao giờ trả rỗng — trả rỗng là `Validate` đánh trượt cả công
trình, tức một chi tiết thiếu có thể giết một loại công trình cũ **trong im lặng**.

**21 chi tiết hiện đại** (`StructurePartSet.DefaultParts` + `StickmanStructureArt`):

| Ô | Chi tiết |
|---|---|
| Tháp | `Tower_Trunk_Concrete` · `Tower_Trunk_Vent` · `Tower_Deck_Steel` · `Tower_Rail_Mesh` · `Tower_Roof_Antenna` · `Deco_Floodlight` |
| Nhà | `House_Floor_Concrete` · `House_Roof_Flat` · `House_Door_Metal` |
| Tường | `Wall_Block_Concrete` · `Wall_Crenel_Razor` · `Wall_Walkway_Steel` |
| Cổng | `Gate_Leaf_Steel` · `Gate_Pillar_Concrete` |
| Trại | `Camp_Tent_Field` · `Camp_Sandbags` · `Camp_Container` · `Camp_Lamp` |
| Lô cốt | `Bunker_Base` · `Bunker_Body` · `Bunker_Deck` · `Bunker_Parapet` · `Bunker_Door` |

**Ai chọn thời kỳ:** `MapScenery.EraOf(map)` — `GameGenre.Modern` → `PartEra.Modern`, còn lại
Medieval. Đó là chỗ **DUY NHẤT** hỏi câu đó; bốn đường dựng `StructureRequest` của `MapScenery`
(công trình đặt tay · chòi canh · trại · deco) đều đọc nó. Tủ kính `Demo_40` có nút
**TRUNG CỔ / HIỆN ĐẠI** để soi cả hai bộ.

### 10b. `StructureKind.Bunker` — loại thứ chín

`[đế loe] → thân có KHE BẮN ×1..2 → NÓC ĐI ĐƯỢC → [ụ chắn] [cửa]`, lối lên là thang bên hông.
Nóc là `PartCollision.OneWay` + `GarrisonPost`, tức **cùng bộ máy tháp canh** — `LaneNav` thấy
một cạnh thang y hệt, không thêm luật AI nào. `Validate`: phải có nóc + có lối lên.

Vì sao đáng thêm một loại (trong khi thời kỳ thì không): lô cốt có **hình học khác** (đế loe,
không lan can, thân thấp và bè), còn nhà kho / nhà xưởng hiện đại chỉ là `House` + chi tiết bê
tông. Thêm loại chỉ khi VĂN PHẠM khác, không phải khi VẬT LIỆU khác.

### 10c. Cổng ba trạng thái — `Combat/FortGateArt.cs`

| Trạng thái | Điều kiện | Hình |
|---|---|---|
| **Sập** | `Fortification.IsDie` | trả bậc vẽ về như cũ · TẮT thân cổng · hiện `Gate_Ruined` |
| **Mở** | `VillageGate.OpenAmount >= 0.5` | thân cổng ở bậc TIỀN CẢNH |
| **Đóng** | còn lại | thân cổng ở bậc TIỀN CẢNH |

Nó **không giữ trạng thái của riêng mình** — mỗi `LateUpdate` hỏi lại hai nguồn đã có rồi mới
đổi hình, nên không đẻ ra nguồn sự thật thứ hai. `Setup(ruined, width, height, groundY)` cache
layer/order gốc của mọi renderer thân cổng.

⚠ **TIỀN CẢNH = ĐỔI LAYER, không phải tăng order.** `StickmanWorldSorting.ApplyForeground(...,
Occluder + độ lệch bậc)` — giữ nguyên thứ tự tương đối giữa trụ · vòm · cánh rồi nhấc cả cụm lên
layer `foreground`. Tăng `sortingOrder` trong `Default` là không có gì xảy ra.
⚠ **Sập thì trả bậc về**: đống đổ nát nằm tiền cảnh sẽ che mất trận đánh phía sau, mà lúc đó nó
không còn chắn ai để mà đáng che.
⚠ **Không tranh `enabled` với `VillageGate.ApplyGateVisuals`** — nó là chủ của hai cánh
(`GateLeaf`), `FortGateArt` chỉ đụng thân cổng + đống đổ nát.

### 10d. Tháp: art quyết định hình học, collider vẫn là luật

Xem `MapArtGeometryRules.md` và AGENTS §*HỢP ĐỒNG NỐI ART MAP*. Tóm tắt: `MapCastle.BuildTowerCore`
suy `artHeight → artWidth → nửa sàn → trục thang` từ bốn hằng số đo trên `Tower.png`
(`397/470` mặt đi · `320/470` tỉ lệ · `245/320` ban công · `195/320` thân). Có art thì **tắt
renderer** thanh ván gỗ + lan can gỗ dự phòng (collider giữ nguyên).
