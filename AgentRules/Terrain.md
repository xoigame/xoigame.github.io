### ⚠⚠ ĐẤT CONG — `TerrainGround` (2026-09-05, user: *"ground bằng phẳng và cứng; muốn cong lượn đồi núi, AI lên xuống được, sau này đại bác bắn làm lõm lỗ"*)

Mặt đất của map LẮP GHÉP nay là **HEIGHTFIELD**: `Assets/Scripts/Combat/World/TerrainGround.cs` (mảng cao độ
cách đều 0.5 so với `BaseY` = mặt phẳng cũ) sinh ra CẢ BA THỨ từ một mảng số — mesh thân đất + dải
cỏ ôm mặt (`Ground_Top` lặp theo quãng đi) · `PolygonCollider2D` ĐẶC · mặt cho locomotion cõng.
Số sinh ở `MapScenery.TerrainProfile.Wave` (ba sóng sin lệch pha theo seed, 0…`hillAmplitude`,
× hệ số kiểu địa hình: Flat 0.55 · Fortress 0.7 · Plateaus 0.85 · còn lại 1) rồi **NHÂN MẶT NẠ SAN
PHẲNG**, rồi **KẸP DỐC**. `Layout.SurfaceY` cộng đồi vào trước khi hỏi thềm/dốc; `Layout.TerrainY`
trả riêng LÀN ĐẤT (đồi, không tính thềm/dốc). Xưởng map có hai núm «Đồi lượn».

### ⚠⚠ SỬA 2026-09-06 (user: *"ground có cao thấp đồi nối, công trình công sự phù hợp với game"*)

Bản 09-05 khai đúng cơ chế nhưng **ra map phẳng**: đo lại ba map mẫu thì đỉnh đồi cao nhất
**0.06 – 0.24** đơn vị (stickman cao ~1.8) — tức phẳng trong mắt người chơi. Ba nguyên nhân cộng lại,
và không cái nào có lỗi báo:

| Nguyên nhân | Sửa |
|---|---|
| **Mặt nạ san phẳng ăn hết map**: `NeedsFlatBase` cũ trả "có" cho MỌI lô, mà lô phủ gần hết bề ngang; đồi chỉ còn mọc ở mấy quãng đường hẹp, lại bị mép mềm 3 đơn vị nuốt nốt | Chỉ lô có **HÌNH HỌC CỨNG** mới phẳng: trại · đích · thềm · đường trên · vùng chiếm trên thềm · chòi canh · hồ (+ `reserved` + hai đầu map). Lô **sinh quân · đường · ụ che · vùng chiếm đất bằng** để đồi chạy qua |
| **Không bảng nào khai biên độ** — `MapBlueprint` (map mặc định) và `StickmanMapSystemBuilder.Blueprints` (map mẫu) đều bỏ trống ⇒ rơi về mặc định 0.7 | Cả hai bảng có `hills` + `hillLength` theo từng kiểu chơi. Mặc định `MapDefinition` lên **1.6 / 15** |
| **`Flat` = 0.35** biến mọi seed bốc trúng Flat thành bãi đất, dù "Flat" chỉ có nghĩa ÍT TẦNG | `StyleFactor(Flat)` = **0.55** |

Đo lại sau khi sửa (800 map mô phỏng, 10 kiểu chơi × 80 seed): đỉnh đồi **1.1 – 2.0**, phần map có
cao độ **42 – 53 %**, và **0 map** vượt trần dốc.

**TRẦN DỐC LÀ BẤT BIẾN, không phải lời khuyên.** `TerrainProfile.MaxSlope = 0.45` (≈24°); `Wave`
quét hai lượt kẹp `|Δh| ≤ MaxSlope × step` (phép kẹp chỉ HẠ nên vùng đã phẳng vẫn phẳng, thứ bị hạ
là sườn nối vào nó). Nhờ vậy **nới `hillAmplitude` là việc an toàn** — đồi cao hơn thì sườn dài ra
chứ không dựng đứng lên. Mép vùng phẳng cũng tự co giãn: `fade = max(3, amplitude / MaxSlope)`.
Luật kiểm: `MapBuildRules.CheckTerrainSlope` đo dốc THẬT của từng `TerrainGround` trong scene.

| Vế | Ở đâu | Vì sao |
|---|---|---|
| **ĐI LẠI = CẦU THANG GIẢ** | `StickmanLocomotion.UpdateTerrainRide` (sau `UpdateStairRide`, KHÔNG return sớm) | hệ di chuyển ghi thẳng vận tốc NGANG: để vật lý tự lo dốc là xuống dốc nảy từng nấc (`IsGrounded` nhấp nháy, nhảy được giữa trời), lên dốc bị đẩy ngược. Kéo bàn chân về `SurfaceYAt(x)` mỗi nhịp, xoá vận tốc rơi; **lên dốc chậm lại** qua ô riêng `_slopeScale` (−40 % ở 45°) |
| **VA CHẠM = ĐA GIÁC ĐẶC**, không phải `EdgeCollider2D` | `TerrainGround.BuildCollider` | tia dò đất bắn từ bàn chân + 0.05 đi XUỐNG; dốc lên phía trước thì mặt đất ở CAO HƠN điểm bắt đầu — cạnh mỏng không bao giờ bị chạm ⇒ `IsLedgeAhead` báo VỰC, vận tốc bị cắt ngay chân đồi. Đa giác đặc + `m_QueriesStartInColliders` trả hit ở khoảng cách 0 y như bậc thang |
| **LaneNav: cả dải = MỘT nút ở `BaseY`** | `LaneNav.CollectSurfaces` + `FindNode` | `bounds.max.y` là ĐỈNH đồi, không phải mặt đứng; chân thang/lô đều đã san phẳng về `BaseY`. Người đứng trên đồi (cao hơn nút quá `tolY`) được quy về nút gốc của dải đó |
| **Xe hàng bám đất** | `WaypointMover.FollowGround` | dời thẳng transform mà giữ y cũ là xe lơ lửng trên dốc xuống |
| **Deco theo mặt đồi** | `SpawnDeco`/`ScatterProps` đọc `SurfaceY(x)` | đồi không âm nên chỗ còn đặt thẳng `groundTop` chỉ LÚN, không bao giờ lơ lửng |
| **ĐỒI KHÔNG PHẢI TẦNG** | `StickmanAgent.OnSameHillAs` — hỏi `Locomotion.TerrainRide` | `LevelGap` chỉ 0.81 còn đồi cao tới ~1.7 ⇒ hai lính hai bên quả đồi đọc ra "khác tầng": cận chiến bị `TargetOutOfVerticalReach` chặn, `UpdateUnreachableTarget` đẩy đi tìm cầu thang giữa đồng, bảng chấm mục tiêu phạt −60. Cùng một dải `TerrainGround` = sườn đồi, KHÔNG phải tầng. Ai đứng trên bục/mặt tường/sàn tháp thì `TerrainRide` null ⇒ luật cũ giữ nguyên |
| **Neo vào LÀN ĐẤT** | `Layout.TerrainY(x)` thay cho `layout.groundTop` ở: `GroundPoint` · `OnRaisedGround` · `CreateBuilding` · `CreateKeepHall` · `BuildFrontLine` · `BuildVillage` · `CommanderPlayHud.Build` | `groundTop` chỉ còn là MỐC 0 của hồ sơ độ cao. `OnRaisedGround` là chỗ nguy nhất: so với mốc 0 thì mọi chỗ trên sườn đồi đọc ra "nóc bục", `FreeSpawnPoint` đẩy cả tuyến quân trượt ngang cả chục đơn vị đi tìm đất phẳng |
| **Map ĐÃ BAKE đọc lại đồi từ scene** | `MapScenery.ProfileFromScene` ← `MapPopulator.BuildLayout` | scene bake lưu `groundTop`/`pits`/`platforms` nhưng KHÔNG lưu mảng đồi; thiếu vế này thì cả đạo quân ra sân bị đặt chôn trong sườn đồi |
| **Viện binh theo sóng bám đồi** | `EnemyWaveSpawner.SpawnWave` | cả tốp lùi ra sau theo trục X từ CÙNG một `origin.y`; đứa thứ ba đã lệch mặt đất hơn một mét |
| **Cứu người rơi khỏi map** | `MapFallGuard` thả lại lên `TerrainGround.SurfaceYAt` | thả về `groundTop + 1` giữa một quả đồi cao 1.7 là rơi thẳng vào lòng đất |

⚠⚠ **LÕM LỖ CÓ SẴN NHƯNG TẠM ẨN** (ý người dùng): `TerrainGround.CratersEnabled = false`.
`Explosion.Detonate` gọi `TerrainGround.TryCrater(center, r × 0.6, clamp(r × 0.12, 0.12, 0.35))` —
bật cờ là vụ nổ khoét hố parabol (sâu tối đa `MaxCraterDepth` 0.55 dưới mặt gốc — sâu hơn là
người rơi vào không leo ra được), mesh + collider dựng lại tại chỗ, `LaneNav.MarkDirty()`.
⚠ Mesh KHÔNG lưu vào scene (`HideFlags.DontSave`) — bake map chỉ lưu MẢNG SỐ, `[ExecuteAlways]`
dựng lại khi nạp. ⚠ Map LẮP GHÉP có đồi; đường `modularLayout = false` vẫn là khối vuông phẳng.

**SCENE DỰNG TAY**: `StickmanSceneUtils.CreateRollingGround(from, to, groundTop, seed, amplitude,
wavelength, flat)` dựng một `TerrainGround` bằng ĐÚNG công thức `TerrainProfile.Wave` — một kiểu
địa hình cho cả game. Đã dùng cho **29 vùng của `Demo_8_AILab`** (biên độ 1.1 · bước sóng 13,
`StickmanAILabBuilder.ZoneHills`); vùng có tường thành (Zone 26) khai khoảng phẳng cho `BeginZone`.
Mọi thứ trong vùng được nhấc lên mặt đồi ở MỘT chỗ — `SettleZoneOntoTerrain`, chạy sau khi dựng
xong cả 29 vùng — chứ không sửa ~40 điểm đặt lẻ. Các scene demo/mode còn lại vẫn phẳng.

⚠ **Đổi bảng thì phải DỰNG LẠI asset**: `Maps > 1` (map mẫu) · nút *Map mặc định cho 7 kiểu chơi*
(bảng điều khiển, gọi `StickmanMapMaker.RebuildAllDefaults`) · `AI > 4` (Demo_8). Asset đã lưu giữ
số cũ tới lúc đó, và **đừng sửa tay `MapDefinition`** — sửa bảng rồi xây lại.

Mô phỏng Python cùng công thức: `.claude/skills/stickman-assets/scripts/terrain_preview.py`
(in cao nhất + dốc lớn nhất + % map có cao độ).


## NẮP HẦM PHẢI ĐẶT TÊN `Nap_*` (2026-09-07)

Cầu thang của dự án theo luật **ĐI XUYÊN LÀ MẶC ĐỊNH, LEO/XUỐNG PHẢI ĐÒI** (`StickmanStairs.CanStartRide`). Riêng cầu thang CÓ NẮP (miệng hầm) thì mặt trên là nóc hầm liền với đất — ai cũng đạp lên đó, nên *"đã ở trên cao"* không còn nói được gì về ý định, và luật đổi thành "xuống hầm phải ĐÒI". Van ấy hoi đúng MỘT thứ: `_lidCount > 0`.

`_lidCount` đếm bằng **TÊN** con: `StickmanStairs.LidPrefix` = `"Nap_"`. Đặt `"Nap"` (thiếu gạch dưới) là `_lidCount` = 0 và cầu thang **cõng vô điều kiện** mọi người đi ngang qua — đã dính thật (Demo_20, nông dân bị kéo xuống hầm thay vì đi đào vàng). Nay `LidPrefix` là **public**: builder dùng hằng, không gõ chuỗi; và `MeasureSpan` `LogError` khi thấy con ĐẶC trong dãy bậc không phải `Bac_*` lẫn `Nap_*`.

⚠ Nắp cũng phải là **CON của dãy bậc** (không phải của root map): có vậy `SetIgnore` mới nhả nó cùng dãy bậc lúc cõng người xuống. Nắp nằm giữa hai miệng (không đè lên bậc nào) thì là ĐẤT thường, đặt ở root — và ĐừNG đặt tên `Nap_*` kẻo bị đếm nhầm.

## MẶT ĐI BỘ NHIỀU MẢNH PHẢI ĐẶC — KHÔNG GHÉP SÀN MỘT CHIỀU (2026-09-07)

`PlatformEffector2D` chỉ đỡ người **tới từ bên trên**. Bước NGANG từ mảnh này sang mảnh kế, bàn chân chưa nằm trên mặt mảnh mới nên nó từ chối, mà mảnh cũ thì đã rời chân ⇒ **rơi**. Một con đường ghép từ N tấm một chiều là N chỗ rơi, và không lỗi nào báo.

Đã cắn hai lần ở `Demo_20`: cầu vượt gỗ (thềm effector ghép bậc đặc) và vòm đá (36 tấm rời).

**Luật:**
* Mặt đi bộ ghép từ NHIỀU mảnh ⇒ **ĐẶC**. `TryStepUp` nhấc qua chênh ≤ `MaxStepRise` (0.18) như nhấc một bậc đá — không có luật "tới từ đâu" nào cả.
* Effector chỉ dùng cho **MỘT khối đơn** (nắp giếng, sàn tháp) hoặc **MỘT collider liền** — không bao giờ cho một chuỗi.
* Muốn đi được BÊN DƯỚI thì cho **HỞ ĐẦU**, đừng cho một chiều: đo hở nhỏ nhất trên TOÀN tuyến (stickman cao 0.73).
* Chỗ Rẽ NHÁNH trên/dưới: dùng **cầu thang xéo** (`MapCastle.BuildStairs`). Nó đặc, `StickmanStairs` lo mặt dốc, và `CanStartRide` đòi Ý ĐỊNH ở chân dốc — đi bộ = tuyến dưới, đẩy cần lên = tuyến trên. Không cần thêm nút.

### VÀ KHÔNG GHÉP BẰNG NHIỀU KHỐI ĐẶC KỀ NHAU (2026-09-07, bổ sung)

Đổi chuỗi sàn một chiều sang chuỗi khối ĐẶC thì hết RƠI — nhưng đẻ ra KẸT. Mỗi cạnh đứng chung giữa hai khối kề nhau là một chỗ Box2D sinh **"va chạm ma"**: pháp tuyến hất ngang, nhân vật vướng mặt đứng dù bậc chỉ cao 0.13. N khối = N−1 chỗ kẹt. `StickmanFortBuilder.BuildWalkway` đã phải chữa đúng thứ này bằng MỘT khối dài liền.

**Luật đầy đủ cho một mặt đi bộ cong/dốc:**
1. **MỘT collider duy nhất** ôm cả đường cong — không cạnh trong, không mối nối.
2. Hình (bậc thang, tảng đá…) là **RENDERER thuần** (`solid: false`). Collider KHÔNG cần đúng hình dáng — người dùng chốt: *"vòng cung giả bậc thang thôi"*.
3. `PolygonCollider2D` chứ **không** `EdgeCollider2D` — tia dò đất bắt đầu ở TRONG khối, cạnh rỗng không trả hit (`TerrainGround` đã ghi).
   ⚠ Hệ quả cho các phép KIỂM: đừng hỏi `GetComponent<BoxCollider2D>()` trên object `Ground`. `StickmanSceneUtils.ValidateScene` từng làm vậy nên
   **mọi map có đồi** đều bị réo đỏ *"Ground thiếu BoxCollider2D — nhân vật sẽ rơi xuyên"* trong khi đất hoàn toàn lành; nay nó hỏi *bề mặt thật*
   (Collider2D đặc bất kỳ, đo bằng `bounds` nên tính luôn `lossyScale`). Một dòng đỏ luôn sai là một dòng đỏ người ta học cách bỏ qua — và nó kéo
   theo cả những dòng đỏ THẬT ở dưới.
4. HỞ ĐẦU đo theo **mặt DƯỚI** collider, không phải mặt trên: trừ bề dày rồi mới so với 0.73.

⚠ **Điểm 1 ở trên CHƯA ĐỦ — xem mục kế.** "Một collider" chặn được kẹt GIỮA tuyến, nhưng không chặn được kẹt ở HAI ĐẦU tuyến, và một `PolygonCollider2D` hình dải cong là đa giác LÕM nên Unity vẫn băm nó thành nhiều mảnh lồi bên trong.

## MỐI NỐI GIỮA HAI MẶT ĐI BỘ LÀ CHỖ HỎNG THẬT SỰ (2026-09-07)

Lần thứ TƯ dựng lại tuyến trên của `Demo_20`, và lần này tìm ra thứ ba lần trước đều bỏ sót: **không phải thân đường hỏng, mà là CHỖ NỐI**.

Cầu thang xéo lên vòm có bậc trên cùng trải `x ∈ [−9.34, −9.00]`, cao tới `topY`. Vòm bắt đầu ở đúng `x = −9.00`, mặt trên cũng đúng `topY`. Hai **mặt đứng trùng nhau**, cùng một cao độ — và `StickmanStairs` nhả người ra khỏi lượt cõng ở đúng toạ độ đó. Người chơi đi hết cầu thang, tới sát vòm, rồi đứng im. Không lỗi nào báo: cả hai vật đều đúng, chỉ có chỗ chúng gặp nhau là sai.

**Luật:** *mỗi chỗ hai MẶT ĐI BỘ gặp nhau là một cái bẫy.* Đếm số mối nối trước, rồi mới bàn tới hình dáng.

| Cách nối | Số mối nối | Kết quả |
|---|---|---|
| Chuỗi sàn một chiều | N−1 | RƠI ở từng mối |
| Chuỗi khối đặc | N−1 | KẸT (va chạm ma) |
| Một đa giác cong + cầu thang xéo hai đầu | 2 | KẸT ở hai đầu |
| **Mặt phẳng + THANG ĐỨNG** | **0** | đi được |

**Cách dựng đúng cho một tuyến trên:**
* Mặt đi là **một `BoxCollider2D` PHẲNG** (`MapSpawn.Block(..., solid: true)`). Phẳng = LỒI = Unity không băm nhỏ. Hình cong thì đẹp, nhưng hình cong nào cũng lõm, mà lõm thì lại là nhiều mảnh.
* Đường lên là **`StickmanClimbZone` (thang đứng)**, không phải cầu thang xéo. Thang không phải mặt đi bộ nên **không có mối nối nào**: người tới TỪ BÊN DƯỚI rồi chui qua.
* Muốn chui qua được thì mặt đi phải **MỘT CHIỀU** — và ở đây một chiều là AN TOÀN vì chỉ có ĐÚNG MỘT khối, không có mối nối nào để mà rơi. Đúng khuôn nắp giếng xuống hầm.
* Một chiều còn giết luôn nỗi lo chặn đầu người đi tuyến dưới.
* Đổi lại: bước ra khỏi mép là RƠI (`ShouldGuardEdge` cố ý không chặn mép sàn một chiều). Chấp nhận được nếu độ cao rơi nhỏ; nếu không thì để lan can **renderer thuần**.

⚠ Người dùng cho chọn hình (*"ngọn đồi hình vòm cung, hay 1 tường thành, 1 cây cầu cũng được"*) thì **chọn CÂY CẦU**: mặt cầu phẳng là hình duy nhất mà collider của nó là một hộp lồi duy nhất.

⚠ Chân cầu/cột chống phải **renderer thuần**: màn đi ngang không đi vòng qua cột được, một cái cột đặc giữa làn là một bức tường cụt. Đây là ngoại lệ có ý thức của luật "art không được nói ngược cơ chế" — ghi rõ trong code kẻo người sau "sửa" lại.

## LẦN THỨ NĂM — MẶT ĐI ĐÚNG, NHƯNG THỨ KHÁC ĐỒNG PHẲNG VỚI NÓ (2026-09-09)

Người dùng đứng trên **tường thành** và báo *"collider đừng quá phức tạp gây kẹt, và bị rơi…
không di chuyển được mà bị rớt"*. Nóc tường lúc đó ĐÃ có một lối đi liền mạch — luật ở mục
trên đã được áp. Vẫn kẹt.

Chỗ sót: `BuildCastleWall` xếp **N khúc đá**, mặt trên của cả N khúc nằm ĐÚNG ở `walkY`, rồi
mới đắp lối đi lên. Lối đi liền một khối, nhưng nó **đồng phẳng** với N khúc kia — Box2D vẫn
sinh tiếp xúc với từng khúc, và ở mối nối nó có thể lấy mặt ĐỨNG của khúc kế làm pháp tuyến.
Bàn chân của một `CapsuleCollider2D` lún vào mặt sàn vài mm là đủ để chọn nhầm trục.

**Luật (bổ sung, tổng quát hơn mục trên):**

> Mặt phẳng bàn chân được phép có **ĐÚNG MỘT** collider. Mọi collider khác của cùng công trình
> phải nằm **DƯỚI** nó — không phải "bằng nó".

Ba hệ quả bắt buộc:

1. **Thân hạ xuống, hình giữ nguyên.** Khúc tường vẫn cao đúng `height` về mặt HÌNH; chỉ
   `BoxCollider2D` hạ mép trên đi `MapCastle.WalkwayThickness` (0.12) — xem `MapCastle.SinkTop`
   và bản Editor `StickmanFortBuilder.SinkColliderTop`. `Fortification.topHeight` không đổi nên
   `WalkableTopY`, `GarrisonPost`, `AtFootOf` giữ nguyên.
2. **Hai lớp mặt đi kề nhau thì CHỒNG mép, không chạm mép.** Chạm mép (chồng 0) là một cạnh
   đứng chung — y hệt lỗi trên. Sàn gỗ phủ quá mép ngoài lối đi ≥ 0.05; chi tiết lắp ghép nới
   sàn ra khỏi thân `StructureGrammar.WalkEavePad` mỗi đầu.
3. **Công trình lắp ghép tự GỘP collider.** `StructureColliderMerge.Apply` chạy cuối
   `StructureAssembler.BuildInto`: các hộp cùng hàng, liền mép, cùng loại va chạm nhập thành
   MỘT. Tường 5 cột × 3 khối + 5 tấm lối đi = 20 hộp → 4.
   ⚠ **Chỉ gộp NGANG với hộp đặc/một chiều.** Gộp dọc là làm DÀY lớp mặt đi lên, mà
   `Fortification.IgnoreWith` phân biệt "lớp mặt đi mỏng ≤ 0.35" với "thân tường" đúng bằng bề
   dày — gộp lối đi 0.15 vào khối tường 0.9 là quân nhà được cấp quyền đi xuyên CẢ MẶT SÀN và
   rơi lọt xuống khi đi trên tường mình. Trigger thì gộp cả hai chiều (bớt cảnh một mũi tên ăn
   sát thương nhiều lần).

**Phép đo:** `StickmanColliderProof` (Doctor: *"Collider công trình: mặt đi có liền một khối
không"*, và menu `Tools ▸ Stickman ▸ Nâng cao ▸ Map ▸ Soi collider mọi công trình`). Nó quét
mọi loại × thời kỳ × 12 hạt, chạy ĐÚNG ba bước của pha dựng (lọc chi tiết → đổi ra hộp → gộp)
nên đo trên chính bộ collider mà map sinh ra, và báo bốn thứ: **mối nối hở** (kẹt), **khe hụt
chân** (rớt), **gờ đặc thò lên mặt đi** (không đi được), **số hộp vượt trần**.

⚠ **Đất cong cũng là đa giác LÕM.** `TerrainGround` lấy mẫu mỗi 0.5, nên một dải 240 đơn vị là
480 đỉnh — Unity băm ra hàng chục mảnh lồi, mỗi đường băm một cạnh trong. `BuildCollider` nay
bỏ mẫu THẲNG HÀNG (dung sai 2 cm, và **chỉ cắt ở chỗ lồi**: cắt chỗ lõm là dây cung nằm cao
hơn mặt đất thật ⇒ bàn chân lọt trong collider ⇒ rung).
