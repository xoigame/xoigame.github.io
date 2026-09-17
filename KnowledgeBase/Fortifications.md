# Công sự — vật cản · tường thành · cầu thang · tháp canh

Hệ này trả lời bốn câu hỏi: **cái gì chặn đường**, **AI làm gì khi bị chặn**, **ai xây/sửa nó**,
và **làm sao lên được chỗ cao mà bắn**.

Nguyên tắc xuyên suốt: **không dựng hệ mới song song với hệ cũ**. Công trình vẫn là một
`StickmanController` như mọi thứ khác trong game, nên máu · damage · chọn mục tiêu · effect ·
âm thanh đều đi đúng đường có sẵn. Phần thật sự mới chỉ có ba mẩu: reflex *đường bị chặn*,
state *trấn thủ*, và *bước lên bậc*.

---

## 1. Vật cản — `Fortification`

`Fortification : DestructibleTarget : StickmanController`. Bốn loại qua `FortKind`:

| Loại | Chặn đường | Đứng lên được | Dùng để |
|---|---|---|---|
| `Barricade` | ✔ | ✘ | rào tạm giữa đường, phá nhanh |
| `Gate` | ✔ | ✘ | cổng thành, dày máu hơn |
| `Wall` | ✔ | ✔ | tường thành, lên bằng **cầu thang** |
| `Tower` | ✔ | ✔ | tháp canh, lên bằng **thang** |

Ba thứ nó thêm so với `DestructibleTarget`:

1. **Chặn đường thật** — collider **KHÔNG trigger**. `BaseBuilding` (nhà chính) để trigger vì
   nó là hậu cảnh; rào/tường thì phải cản chân, không thì "phá mới đi tiếp" chỉ là lời nói.
   Sập rồi thì `_openWhenRuined` tắt collider = mở đường.
2. **Sửa được** — `Repair(amount)`. Chỉ vá lúc **còn sống**: sập rồi là gạch vụn, muốn có lại
   thì dựng công trường mới. Nhờ vậy phá được công trình mới thật sự là một thắng lợi.
3. **Mặt trên đi được** — `WalkableTopY`, đo từ collider nhưng **nhớ lại một lần** (sập là
   collider tắt hết và số đo thành 0).

Sổ đăng ký `Fortification.All` + `FindRepairJob(from, teamId, maxDistance)` — cùng kiểu
`TeamMember.All` / `StickmanClimbZone.All`, không `FindObjectsOfType` mỗi nhịp.

> **PHE −1 = TRUNG LẬP**: không gắn `TeamMember` thì `TeamMember.AreEnemies` trả **true** cho
> cả hai phe (thiếu TeamMember = coi như địch) → cả hai đều phải phá. Đúng thứ cần cho một
> cái rào nằm giữa map.

---

## 2. AI bị chặn thì đập — `StickmanAgent.UpdateBlockedPath()`

Bắn một tia theo **đúng hướng mình đang đòi đi** (`Locomotion.Steer` — **Ý ĐỊNH**, không phải
vận tốc thật: dí vào tường thì vận tốc bằng 0 mà ý định vẫn còn). Trúng một công trình không
phải phe mình → nhận làm mục tiêu, và toàn bộ hệ combat lo nốt.

Nhận diện vật cản bằng **"là `StickmanController` mà KHÔNG phải người"** — cùng một luật với
`SelectBestEnemy`. Đừng liệt kê class: lần sau thêm loại công trình mới là bỏ sót đúng cái đó
(bài học `BaseBuilding` không kế thừa `DestructibleTarget`).

**Hai vế bắt buộc, thiếu một là hỏng:**

- Chạy **TRƯỚC `UpdateRetarget`** — không thì nhịp chấm điểm ngay sau đó lại kéo mục tiêu về
  một thằng lính đứng bên kia rào, cái mà nó vĩnh viễn không với tới.
- `UpdateRetarget` **thoát sớm khi `IsBreakingObstacle`** — kẻ "đáng đánh hơn" luôn là thằng
  bên kia rào; chừng nào rào chưa đổ thì đổi mục tiêu sang nó là quay ra quay vào mãi.

Cửa sổ bám: `AIProfile.obstacleFocusTime` (4s). Trong cửa sổ đó **không dò lại mỗi frame** —
vừa tốn tia, vừa làm mục tiêu nhấp nháy giữa hai tấm ván cạnh nhau.

> **Vì sao van gỡ kẹt cũ không lo được việc này**: `UpdateDeadlockBreaker` chỉ biết "đòi đi mà
> không dời chỗ" nên nó **xông liều** hoặc **chốt hướng** — cả hai đều là dí mặt vào rào mạnh
> hơn. Cái rào chỉ có một cách qua là phá.

Tuning: `breakObstacles` · `obstacleProbeRange` (1.6) · `obstacleProbeHeight` (0.35 — bắn từ
sát chân là tia chạm mặt đất/bậc thềm, đi đâu cũng tưởng có rào) · `obstacleFocusTime`.

---

## 3. Cầu thang — `StickmanLocomotion.TryStepUp()`

Hệ di chuyển ghi thẳng **vận tốc ngang**, nên gặp một cái hộp cao 0.15 là Box2D chặn cứng và
nhân vật dí mặt vào đó mãi mãi. `TryStepUp` chạy **ngay sau chỗ ghi vận tốc**, nên mọi nguồn
di chuyển (người chơi, AI, đội hình) đều được hưởng — không phải sửa chỗ nào khác.

⚠ **RÀO / CỔNG không bao giờ được bước lên**, bất kể thấp cỡ nào. Không có luật này thì chỉ
cần dựng một cái rào thấp hơn `_stepHeight` là cả hệ "phá vật cản mới đi tiếp" tan thành mây
khói.

Nhưng luật đó **không được vơ đũa cả nắm** — xem mục 3b ngay dưới.

---

## 3b. ⚠ CÔNG TRÌNH CÓ MẶT TRÊN ĐI ĐƯỢC **LÀ ĐẤT** — `IsStandableSurface`

Đây là cái bẫy tốn nhiều thời gian nhất của cả hệ công sự, và nó hỏng **trong im lặng**:
không log, không lỗi, chỉ là *"cái thành ở trên cao, không di chuyển lên được"*.

**Gốc rễ:** `Fortification : DestructibleTarget : StickmanController`. Bản cũ của
`StickmanLocomotion` loại **mọi** collider có `StickmanController` ở nhánh cha ra khỏi tia dò
đất và khỏi `TryStepUp`, với lý do "người không phải đất". Đúng với NGƯỜI, nhưng nó quét luôn:

| Thứ bị loại nhầm | Hậu quả |
|---|---|
| **Mặt tường thành** | ai lên tới nơi cũng `_grounded = false` VĨNH VIỄN → animator chơi động tác RƠI, không nhảy được, và vì hai tia dò vực hai bên đều báo "không có đất" nên van chặn mép vực **cắt sạch vận tốc cả hai chiều**: đứng chôn chân trên tường |
| **Sàn tháp canh** | cung thủ trấn thủ đứng được (vì `AIStateGarrison` giữ chỗ) nhưng cận chiến trèo lên là kẹt — mất hẳn vế "leo lên giết cung thủ" |
| **Bậc cầu thang** (con của object tường) | `TryStepUp` từ chối đúng những cái bậc sinh ra để bước lên → cầu thang thành vật trang trí |

**Chữa ở MỘT chỗ**: `StickmanLocomotion.IsStandableSurface(Collider2D)` — cả `HasGroundAt`
(tia dò đất + tia dò vực) lẫn `TryStepUp` đều hỏi nó. Hai bản chép tay thì kiểu gì cũng lệch:
một bên coi mặt tường là đất, bên kia từ chối bước lên bậc thang dẫn tới đó.

```
người              → KHÔNG phải đất
Fortification có `walkableTop`  → LÀ đất  (tường, sàn tháp, bậc thang treo dưới tường)
Fortification không walkableTop → KHÔNG   (rào, cổng, máy công thành) → luật cản đường giữ nguyên
```

Bức tường cao 2.6 vẫn không ai *bước* lên được — luật `rise > _stepHeight` lo việc đó; thứ duy
nhất lọt qua là cái bậc cao 0.15. Và công trình **sập** thì `HasWalkableTop` trả false ngay,
nên ai đang đứng trên nóc rơi xuống theo, khỏi viết thêm dòng nào.

⚠ **Hệ quả cho ai thêm cờ mới:** một công trình `walkableTop` mà đồng thời `passableForOwner`
(bỏ qua va chạm với quân nhà) là **quân nhà rơi xuyên qua sàn**. Cờ đi xuyên chỉ dành cho
CỔNG/RÀO, không bao giờ cho tường có người đứng trên.

### Ba cái bẫy hình học đi kèm (đã dính đủ cả ba ở `Demo_34_Escalade`)

1. **Toạ độ mặt đất phải lấy `StickmanSceneUtils.DefaultGroundTop` (−2), đừng gõ 0.**
   Builder gõ tay `GroundTop = 0` làm cả toà thành, hai cái thang và hai cỗ máy công thành lơ
   lửng cách đất 2 đơn vị — gần ba lần chiều cao nhân vật.

2. **Thang phải tựa vào MẶT NGOÀI thật của tường.** `CreateWall` tự nới bề ngang tường theo
   chiều cao, nên toạ độ gõ tay kiểu `WallX ± 1.1` rơi gọn vào trong khối đá: không ai đứng
   vào trục thang được, `AIStateEscalade` đi tới `_ladder.AxisX` mãi mà không bao giờ bám
   được. Lấy `CastleWall.outerFaceX` do builder trả về, đừng gõ số.

3. **Trèo tới đỉnh vẫn rơi nếu không có SÀN GỖ NHÔ RA.** `StickmanClimbZone` là một TRỤC DỌC,
   mà trục ấy buộc phải nằm ngoài mặt tường → buông thang ở đỉnh là rơi thẳng về chỗ cũ.
   `CreateCastleWall` dựng sẵn sàn gỗ `PlatformEffector2D` **một chiều** nhô quá mặt tường
   (đúng mẹo của sàn tháp canh): người trèo chui qua từ dưới lên rồi đứng lên trên. Trục thang
   phải nằm trong `[hoardingEdgeX, outerFaceX]`.

### Và hai cái bẫy SCALE

* **Đừng treo dãy bậc dưới object tường.** Object tường mang `localScale = (dày, cao, 1)`,
  con thừa hưởng cái méo đó nên bậc 0.15 bị nhân thành ~0.39 — **vượt `_stepHeight`**, không
  ai bước lên nổi. Art thoát nạn vì `StructureSkin.SetArt` bù ngược `lossyScale`; dãy bậc thì
  không có ai bù cho.
* **Bề ngang tường phải theo TỈ LỆ ART** (`WallArtAspect` = 460/320), và art phải cao hơn
  collider theo `WallArtWalkwayRatio` (246/320) vì mặt sàn trong ảnh nằm ở 77% chiều cao —
  phần trên là lỗ châu mai. Ép cả tấm ảnh vào đúng chiều cao collider là lính đứng chênh vênh
  trên đỉnh răng cưa; ép khung hẹp hơn tỉ lệ gốc là lỗ châu mai bè ra như bánh đa.
  Thành DÀI thì ghép nhiều **KHÚC** đúng tỉ lệ (`CreateCastleWall`) để art tự LẶP, đừng kéo
  giãn một khối.

Số: `_stepHeight` = **0.18** (nhân vật cao ~0.65). Bậc cầu thang dựng ở **0.15** — phải THẤP
HƠN, cao hơn là không ai lên nổi.

**Cầu thang là dãy bậc rời, không phải dốc nghiêng** — dốc thì trượt (vận tốc ngang thuần),
bậc thì `TryStepUp` nhấc lên từng nấc, chắc chắn và dùng lại được cho mọi địa hình khác.
Mỗi bậc là khối **đặc từ mặt đất lên**, không phải tấm mỏng: đứng ở đâu trên cầu thang cũng có
đất dưới chân nên tia dò vực không báo động.

---

## 4. Trấn thủ trên cao — `GarrisonPost` + `AIStateGarrison`

`AIBehavior.Garrison`. Vòng đời: **tìm post → tới đường lên → LÊN → ra suất đứng → BẮN**.

### Hai đường lên

| | Tháp canh | Tường thành |
|---|---|---|
| Đường lên | `StickmanClimbZone` (thang) | **cầu thang**, `AccessX` = chân thang |
| Cơ chế | `EnterClimb` / `Climb` / `ExitClimb` | đi bộ, `TryStepUp` lo phần bậc |

`GarrisonPost.IsUsable` **không đòi phải có thang** — tường lên bằng chân.

### Ba điều làm state này khác mọi state khác

1. **Tự lái cái thang** (`AIState.OwnsTraversal`) — pipeline của agent có luật "hết địch thì
   buông thang", đúng với lính đuổi nhau nhưng người đang leo lên **trực chiến thì chưa có
   địch nào**; để pipeline lái là rơi xuống đất ngay nhịp đầu. Đây là luật "mỗi transform chỉ
   một chủ" áp cho cái thang.
2. **Đứng bắn qua CHÍNH strategy của vũ khí** — bật cờ `Agent.IsGarrisoned`, `CombatStrategyBase.Tick`
   tự bỏ khâu giữ tầm (`UpdatePosition`) và giữ nguyên mọi khâu còn lại. Nhờ vậy cung thủ trên
   tháp vẫn **tích lực · bù độ rơi của tên · bắn theo nhịp loạt của chỉ huy** — không chép lại
   một dòng nào. Viết riêng vòng bắn cho cung thủ tháp là ngày mai thêm vũ khí phải sửa hai chỗ.
3. **Địch trèo lên tới sàn là BỎ SUẤT** — nhường lại cho FSM thường (Seek/Combat/Retreat).
   Lúc đó không còn là bắn tỉa nữa mà là đánh giáp lá cà trên một cái sàn hẹp. Đây chính là chỗ
   *"cận chiến leo lên giết cung thủ"* thành **trận đánh** chứ không thành cảnh cung thủ đứng
   ngây ra chịu chém.

### Vì sao chia SUẤT chứ không để ai lên cũng được

Sàn tháp hẹp, ba bốn ông cung chen một chỗ là hệ giãn cách đẩy nhau rơi xuống đất. Chia suất
còn cho AI biết tháp **đầy rồi** thì đi tìm tháp khác thay vì xúm lại.

Kèm theo: `SeparationPriority` của người đang chốt trên sàn là **bậc 2 (cao nhất)** — bị đồng
đội hích một cái là rơi xuống giữa đám địch.

### Cận chiến leo lên giết cung thủ — không phải viết gì

`StickmanAgent.TryStartClimb` sẵn có luật *"địch ở cao hơn hẳn mà quanh đây có thang thì bám
vào leo"*. Cái thang của tháp là `StickmanClimbZone` như mọi thang khác, nên địch dùng luôn.

**Sàn tháp là `PlatformEffector2D` (một chiều)** — người trèo thang chui qua từ dưới lên rồi
đứng lên trên. Sàn đặc thì thang có dài mấy cũng chỉ đội đầu vào đáy sàn.

---

## 5. Xây và sửa — thợ

**Xây**: đã có sẵn — `ResourceNode` kiểu `ResourceType.Build` (công trường: thợ cộng công tại
chỗ tới khi nhà hiện lên). Muốn xây RÀO thì đặt `_doneVisual` của công trường là một
`Fortification`.

**Sửa**: pha mới trong `AIStateWork` — `ToRepair` → `Repairing`.

- **Sửa trước, kiếm sau** (`TickFind` gọi `TryTakeRepairJob` đầu tiên): tường thủng thì mai
  không còn kho mà chở gỗ về.
- `Fortification.NeedsRepair` lọc sẵn *"sứt đủ nhiều mới đáng gọi thợ"* (`_repairThreshold`
  0.9) — không thì thợ bỏ mỏ vàng để chạy đi vá một vết xước.
- Chia suất `_maxRepairWorkers` như `ResourceNode`, và **bỏ suất khi chạy trốn** — không thì
  đồng đội tưởng công trình đã có người vá.
- Nhịp búa vào công trình phe MÌNH không gây damage (`TeamMember.CanDamage` chặn sẵn), đây
  thuần là động tác + tiếng.

Tuning: `AIProfile.repairSearchRadius` (25, 0 = không sửa) · `Fortification._repairPerBeat`.

---

## 6. Dựng bằng tool

`Tools > Stickman > Fortifications > 1. Create Fortress Scene` → `Demo_21_Fortress`.

API dùng lại được từ builder khác / hệ map:

```csharp
StickmanFortBuilder.CreateBarricade(name, x, groundTop, teamId, hp);
StickmanFortBuilder.CreateGate(name, x, groundTop, teamId, hp);
StickmanFortBuilder.CreateWall(name, x, groundTop, height, thickness, teamId, hp,
                               stairsToTheLeft, garrisonSlots);   // kèm cầu thang + post
StickmanFortBuilder.CreateStairs(name, startX, groundTop, topY, direction);
StickmanFortBuilder.CreateTower(name, x, groundTop, height, teamId, hp, slots);
```

Tất cả làm bằng `Square.png` tô màu, đúng cách `StickmanSceneUtils.CreateGround` dựng mặt đất:
hợp chất stickman, và **không có sprite nào để mà thiếu**. Thay art thật = đổi
`SpriteRenderer.sprite`, kích thước vẫn do collider quyết định.

⚠ **Set size collider bằng tay, không tin auto-fit** — sprite null là collider ra size 0 và
lính đi xuyên qua tường thành.

⚠ **`ConfigureAsStructure` phải gọi LÚC DỰNG**, không phải trong `Awake` của `Fortification`:
nó tắt `_buildBodyHitboxes`, mà cờ đó chỉ được đọc **một lần** trong `StickmanController.Awake`
— gọi sau `base.Awake()` là đã muộn.

---

## 7. Bốn con số phải ăn khớp với nhau

| Số | Giá trị | Ràng buộc |
|---|---|---|
| `StickmanLocomotion._stepHeight` | 0.18 | mốc gốc |
| Bậc cầu thang (`StepRise`) | 0.15 | **< `_stepHeight`**, không thì không ai lên nổi |
| Chiều cao rào tối thiểu | 0.55 | **> `_stepHeight`** (vế thứ hai; vế thứ nhất là `IsStandableSurface` từ chối mọi công trình KHÔNG khai `walkableTop`) |
| `obstacleProbeRange` | 1.6 | hơn tầm với vũ khí cận chiến một chút, để lính dừng đúng tầm chém chứ không dán mặt vào rào |


---

## 8. TOÀ THÀNH CÓ CỔNG + hai màn công/thủ

### 8.1 `StickmanFortBuilder.CreateGatedCastle` — MỘT chỗ dựng thành

Trước đó mỗi builder tự ghép thành bằng tay, và đã lệch thật: `Demo_14_Siege` (chế độ chơi
"Công thành") chỉ có **hai khối vuông tô xám** dựng bằng `SpriteRenderer` + `BoxCollider2D`,
không `StructureSkin` nào — nên tuy dự án có đủ art tường/cổng/tháp cho 13 nền văn minh thì
đúng cái màn công thành vẫn xám ngoét, và `CivilizationTeamAssigner.DressStructures` (quét
`StructureSkin`) không có gì để khoác áo. `Genre_Medieval_Siege` cũng vậy: "tường thành" của
nó là một khối `BuildWall` không máu, không mặt trên, không cổng.

Nay cả ba màn thành đi qua cùng một hàm:

```
[TƯỜNG + sàn gỗ + cầu thang] — khoảng sân — [CỔNG] — [THÁP CANH] — sân trong
     ↑ thang tựa vào đây            ↑ quân thủ đứng đón        ↑ nhà chính
```

Trả về `GatedCastle` với đủ số đo để đặt tiếp: `wallOuterFaceX` · `hoardingEdgeX` (dải dựng
thang) · `walkY` · `stairsFootX` · `courtyardX` · `gateX` · `yardX`.

**Bốn luật, phá cái nào cũng hỏng câm:**

1. **TƯỜNG ĐỨNG NGOÀI CÙNG, KHÔNG PHẢI CỔNG.** Thang công thành tựa vào mặt ngoài TƯỜNG
   (`hoardingEdgeX`..`wallOuterFaceX`). Để cổng ra ngoài là hai cái thang nằm lọt phía sau
   nó — cả tốp `AIBehavior.Escalade` phải đập vỡ cổng mới sờ được vào thang, mất sạch vế
   "có hai đường vào" ngay từ đầu trận.
2. **KHÔNG "khoét cổng giữa tường".** Game đi ngang chỉ có MỘT LÀN nên các lớp là vật cản
   NỐI TIẾP chứ không song song; nhét một khúc tường ngay sau cổng thì đập vỡ cổng xong lại
   đụng vách đá.
3. **KHOẢNG SÂN sau chân cầu thang là bắt buộc.** Kẻ trèo tường đi hết sàn rồi rơi xuống phía
   sân — chỗ tiếp đất phải là ĐẤT hoặc BẬC THANG. Rơi trúng nóc cổng thì hỏng câm: cổng khai
   `walkableTop: false` nên `StickmanLocomotion` không coi đó là đất, nhân vật "rơi mãi" tại
   chỗ (không nhảy được, không đánh chuẩn, không lỗi nào báo).
4. **TƯỜNG PHẢI `passableForOwner`, y như cổng.** Hệ quả trực tiếp của luật một làn đã ghi ở
   `CreateGate`: tường đặc giữa làn chặn đều tay cả CHỦ NHÀ, nên quân thủ (và người chơi) bị
   nhốt trong thành của chính mình — bấm "THEO TÔI" để xuất kích thì cả đội dồn vào mặt trong
   bức tường mà đứng.

⚠ **Cung thủ trấn thủ phải khai `UnitRole.Ranged` lúc spawn.** `SpawnNpcShared` chỉ đặt CHỈ SỐ
VŨ KHÍ; `_role` mặc định là `Melee`, mà `CivilizationTeamAssigner` (chế độ `FullRoster`, gắn
trong gần như mọi scene) **phát lại vũ khí theo `agent.Role`** lúc vào trận. Không khai thì
ông cung thủ vừa spawn xong bị nhét kiếm vào tay, trèo lên tháp đứng nhìn — cả bộ trấn thủ
mất ý nghĩa mà không một dòng log nào báo.

### 8.2 Hai màn chơi

| Scene | Ai giữ thành | Thắng khi | Thua khi |
|---|---|---|---|
| `Demo_14_Siege` — CÔNG THÀNH (`CastleAssault`) | ĐỊCH | hạ đủ CỔNG + THÁP + NHÀ CHÍNH | hết quân **và** hết tiếp viện |
| `Demo_25_CastleDefense` — THỦ THÀNH (`CastleDefense`) | MÌNH | giữ nhà chính qua 5 đợt | nhà chính sập |

Hai class rời chứ không một class có cờ `isAttacker`: hai bên hỏi hai câu khác hẳn nhau
("giữ được tới đợt cuối chưa" vs "đập xong chưa") — đúng bài học `AIStateEscalade` tách khỏi
`AIStateGarrison`.

Không có cơ chế AI mới nào: quân thủ dùng `AIBehavior.Garrison` (tự trèo lên tường/tháp),
quân công dùng `AIBehavior.Escalade` (tự tìm thang), thợ dùng `AIBehavior.Work` (vá tường),
đợt quân dùng `EnemyWaveSpawner` — tất cả đều có sẵn.

### 8.3 CỜ HIỆU "THEO TÔI" (`RallyBanner`) — bị vây thì đánh ra

Người chơi đứng trong thành bị vây trước đây **không có cách nào** nói với quân mình: tướng
máy đang ở thế THỦ nên cả phe đứng yên quanh chốt, còn người chơi lao ra một mình rồi chết.

Cờ hiệu gắn lên người chơi (phím **G**, và **NÚT trên màn hình** ở mép phải — luật giao diện:
phím tắt không bao giờ là đường duy nhất). Nó chỉ làm hai việc:

1. ra **LỆNH TAY** "tấn công" cho `TeamCommander` của phe (y như bấm nút trong HUD chỉ huy);
2. công bố chỗ đứng của mình qua `RallyBanner.PointFor(teamId)` — `CommandNode.ComputeLineAnchor`
   lấy đó làm **MỐC TUYẾN** khi đang ở thế tấn công.

Cả cây chỉ huy tự dàn đội hình quanh mốc đó và tiến theo. **Không state mới, không behavior
mới** — đúng khuôn `CapturePoint` đã dùng ở cùng chỗ trong hàm ấy: *lái lính bằng ANCHOR*.

⚠ **ĐỪNG chuyển từng lính sang `AIBehavior.Follow`**: `CommandNode.ApplyToAgent` ghi lại
behavior theo cột mốc MỖI NHỊP, nên lệnh Follow bị đè ngay nhịp sau — quân giật qua giật lại
giữa hai chủ. `Follow` là cho lính hộ vệ KHÔNG nằm trong cây chỉ huy.

⚠ **Giương cờ là DỐC TOÀN QUÂN**: `UpdateReserve` thoát sớm khi có cờ. Giữ lại một cánh dự bị
lúc này là phản bội đúng cái người chơi vừa bấm — họ thấy một phần ba quân đứng yên trong sân
và tưởng nút hỏng.

⚠ **Chủ cờ ngã là hạ cờ** (và `OnDisable` cũng hạ) — không thì cả phe xúm về chỗ cái xác, và
lệnh tay còn khoá trên ông tướng máy tới hết trận.

## 8b. CẦU THANG HAI CHẾ ĐỘ — ĐI XUYÊN QUA hoặc LEO LÊN

Cầu thang là một DÃY KHỐI ĐẶC cao dần (mỗi bậc chạy từ mặt đất lên tới mặt bậc, để đứng chỗ
nào trên thang cũng có đất dưới chân). Hệ quả không ai để ý: **nhìn từ phía ĐỈNH, cả dãy đó là
một BỨC TƯỜNG** cao bằng mặt tường thành. Game đi ngang chỉ có MỘT LÀN, nên đi ngược lại là dí
mặt vào đó đứng mãi — `TryStepUp` từ chối (`rise > _stepHeight`) và không có gì để đập, vì bậc
thang không phải `Fortification`.

`StickmanStairs` (gắn trên root dãy bậc) cho **cùng một cái thang** vừa leo được vừa đi xuyên
được, tuỳ TỪNG NGƯỜI — bằng `Physics2D.IgnoreCollision` theo từng cặp collider, đúng khuôn
`Fortification._passableForOwner` ("cổng nhà mình thì tự mở"). KHÔNG tắt collider: tắt là hết
leo được, mà leo lên mặt tường mới là lý do cái thang tồn tại.

| Chế độ | Nghĩa |
|---|---|
| `Auto` (mặc định) | ĐẶC với người leo được nó, XUYÊN với người chỉ đi ngang qua |
| `Climb` | luôn đặc — như cầu thang cũ |
| `Pass` | luôn xuyên — chỉ còn là hình trang trí |

`Auto` hỏi bốn câu, theo thứ tự: **(1)** chế độ ép bằng tay · **(2)** đang ĐỨNG TRÊN thang →
luôn đặc (cho xuyên lúc đó là rơi thẳng xuống đất) · **(3)** đang ĐÒI LEO (`RequestStairs`) →
đặc · **(4)** còn lại: đặc **khi và chỉ khi** bậc trước mặt bước lên được. Nghĩa là cái thang
chỉ chặn ở chỗ nó THẬT SỰ LÀ THANG; chỗ nó là vách cụt thì cho đi xuyên.

**Hai nguồn "tôi muốn leo"**, đều là ĐẦU VÀO GHI MỖI FRAME (`StickmanLocomotion.RequestStairs`,
cùng khuôn `RequestSentry` — không ai phải nhớ TẮT):
· **người chơi** giữ phím lên/xuống (W/S · cần ảo dọc) — dùng chung phím với leo thang vì cùng
  một ý định, không đẻ phím thứ hai;
· **AI** khi mục tiêu ở cao hơn mình quá hai bước chân (`StickmanAgent.RequestStairsIfNeeded`).

⚠ **PHẢI THU HỒI quyền đi xuyên** khi người đó rời tầm quét: `IgnoreCollision` là trạng thái
BỀN theo cặp — cấp rồi là cấp mãi, nên ai từng đi xuyên một lần sẽ đi xuyên MÃI MÃI, kể cả lúc
quay lại định leo lên.

⚠ **Scene ĐÃ BAKE không tự có component này** (cầu thang của `StickmanFortBuilder` nằm sẵn
trong file scene). `StickmanStairsBootstrap` gắn bù lúc nạp scene — nhận diện bằng quy ước tên
bậc `Bac_*`, là đặc điểm duy nhất phân biệt được dãy bậc với một chồng khối trang trí. Đổi tên
bậc trong builder thì phải sửa hằng số đó.

### Ba bệnh của `TryStepUp` đã chữa cùng lúc

| Bệnh | Nguyên nhân | Chốt chặn |
|---|---|---|
| **Bay lên trời** | Tia dò với xa `extents.x + 0.12` ≈ 0.26 — rộng hơn hẳn khoảng "đã dí vào bậc". Nhân vật bị nhấc khi CÒN CÁCH bậc cả gang tay: nhấc giữa không trung → rơi → nhấc tiếp, mà nhịp vật lý nhanh hơn nhịp rơi nên nó CỘNG DỒN | chỉ nhấc khi `TravelSpeed` tụt dưới 60% tốc độ tối đa (**bị chặn thật**), và mỗi lần nhấc phải cách lần trước một quãng NGANG (`StepRunGate` 0.16) |
| **Kẹt ở cầu thang** | nhấc thân vào TRONG một khối đặc (gầm thang, mép tường, sàn tháp phía trên) rồi Box2D đẩy ra loạn xạ | `HasHeadroom` — chỗ mới phải trống mới nhấc (bỏ qua chính mình, người khác, và thứ đang được phép đi xuyên) |
| **Trèo lên cái vừa cho đi xuyên** | `TryStepUp` không biết gì về `IgnoreCollision` | bỏ qua collider nào đang `Physics2D.GetIgnoreCollision` với thân mình |

⚠ Quãng chặn đo bằng **QUÃNG ĐƯỜNG NGANG**, không bằng đồng hồ: quãng là thứ khớp với hình học
cầu thang (đi hết một `StepRun` mới lên một `StepRise`), còn đồng hồ thì đi nhanh hay chậm lại
ra tỉ lệ leo khác nhau.

## 8c. CỔNG LÀNG BIẾT ĐÓNG MỞ — `VillageGate`

`Fortification._passableForOwner` cho quân nhà đi xuyên cổng, nhưng quyền đó **vô hình**:
nhìn vào chỉ thấy quân mình lướt qua một khối gỗ đặc còn địch thì đứng đập. `VillageGate` là
hai cánh cửa động ngồi TRÊN `Fortification` sẵn có — không đẻ hệ công trình thứ hai, chỉ trả
lời thêm một câu cho `WouldLetThrough`.

| Việc | Ai lo |
|---|---|
| máu · sát thương · thợ vá · sổ đăng ký · AI đập cổng | `Fortification` (không đổi một dòng) |
| ai được đi xuyên (phe, đứng trên nóc) | `Fortification.WouldLetThrough` |
| **lúc này cửa đã hé chưa** | `VillageGate.LetsThrough` |
| hình hai cánh cửa | `StickmanFortBuilder.CreateVillageGate` |

### Luật

1. Quân nhà (hoặc người chơi) vào `_openRadius` → **MỞ**, kể cả đang có địch bâu quanh.
2. Người cuối rời đi → giữ mở thêm `_holdOpen` giây cho cả tốp qua hết, rồi khép.
3. **Cửa chưa hé đủ `_passThreshold` thì chưa qua được.** Đây là phần CƠ CHẾ: cái cổng có
   TRỌNG LƯỢNG, rút vào trong khi đang bị truy kích mất mấy nhịp ở cửa. Địch KHÔNG BAO GIỜ
   được cấp quyền — đóng hay mở cũng vậy, muốn vào phải PHÁ.

`_keepOpenScale` nới bán kính khi đang mở = VÙNG CHẾT chống nhấp nháy (§5c của AGENTS).

### Bốn cái bẫy

· ⚠⚠ **ĐỪNG thêm luật "có địch gần thì đóng chặt".** Đã cân nhắc và loại: game đi ngang chỉ
  có MỘT LÀN nên nó tự nhốt chủ nhà — quân thủ hồi sinh trong trại, địch cắm chốt trước cổng
  ⇒ cổng không bao giờ mở ⇒ cả tuyến dồn cục sau cánh cửa của chính mình tới hết trận, không
  lỗi nào báo.
· ⚠⚠ **Hỏi ở `WouldLetThrough`, đừng kê lại luật trong vòng cấp quyền.** `ScanPassableUnits`
  bản cũ chép tay phần phe phái + "đứng trên nóc", nên từ ngày có cánh cửa nó thành chỗ THỨ
  HAI có thể nói ngược với luật thật. Nay cả vòng cấp lẫn `RevokeStalePasses` hỏi một hàm.
· ⚠ **Ai đang đứng TRONG ô cửa thì luôn giữ quyền** — thu lại lúc thân còn chồng lên khối là
  Box2D đẩy văng loạn xạ (bẫy `StickmanStairs`).
· ⚠ **Nhịp quét phải ngắn** (`SetPassScanInterval(0.08)`): mặc định 0.25s mà cánh cửa quay
  hết trong 0.28s thì người ta đứng đợi thêm gần một nhịp trước một cánh cửa ĐÃ MỞ.

### Vì sao KHÔNG đắp `StructureSkin`

Art cổng của 15 nền vẽ SẴN hai cánh cửa vào trong tấm hình (380×380: hai trụ đá + vòm cuốn +
hai cánh gỗ). Mở cửa thật thì hai cánh VẼ SẴN ấy vẫn đứng nguyên ⇒ nhìn ra y như đang đóng:
cơ chế chạy đúng mà mắt đọc ra là hỏng. Cổng làng vì vậy tự dựng hình của mình — ô cửa TỐI làm
nền (hé ra là lộ lối đi phía sau), khung gỗ, hai cánh động. Đổi lại nó không khoác được art
nền văn minh; chấp nhận được, cổng làng là hàng rào gỗ chứ không phải cổng thành đá.

⚠ Cánh cửa co `localScale.x` chứ **không quay quanh Z** — nhìn ngang thì quay quanh Z là cánh
cửa ĐỔ NGHIÊNG xuống đất. Pivot ở MÉP NGOÀI, hình vẽ ở object con.

### Vế AI đi kèm — miễn trừ quân đồn trú ở tầng MODE

`MatchModeBase.ApplyOrders` ghi đè `SetBehavior` mỗi 2 giây. Cung thủ `AIBehavior.Garrison`
vừa bám được thang là bị lệnh tuyến lôi xuống, nhịp sau lại leo — **leo lên tụt xuống tới hết
trận, không lỗi nào báo**. `CommandNode.ApplyToAgent` đã chữa bẫy này ở tầng cây chỉ huy;
tầng mode thì tới nay còn sót, vì nó chỉ lộ ra ở màn vừa phát lệnh vừa có tháp canh.

⚠ Miễn trừ phải ĐÒI CÒN POST DÙNG ĐƯỢC (`GarrisonPost.All`) — miễn vô điều kiện thì tháp bị
phá xong mấy ông cung đứng chôn chân chờ một cái sàn đã biến mất.

### Bố cục làng (`Demo_26_Raid`)

`[tháp ngoài] → [CỔNG] → [tháp trong] → dãy nhà → đình làng`, các lớp NỐI TIẾP nhau vì game đi
ngang không có lớp nào đứng cạnh lớp nào.

· **Cổng là vật chắn DUY NHẤT trong làn** — đắp thêm khúc tường đặc cạnh nó là hai nút cổ chai
  nối tiếp mà cái thứ hai chẳng thêm quyết định nào cho người chơi.
· **Hai tháp `passable: true`** — cột đá rộng 1 đơn vị đứng giữa làn là bịt kín đường và cái
  tháp biến thành bức tường thứ hai. Sàn tháp vẫn đặc nên đứng bắn được như thường.
· **Một tháp nằm NGOÀI cổng** có chủ ý: bắn được vào đầu toán cướp từ xa, đổi lại chúng trèo
  thang lên giết cung thủ trên đó — `StickmanClimbZone` + `AIStateGarrison` lo sẵn, không thêm
  dòng AI nào.
· Phe thủ chia hai tuyến qua `TeamOrder.share`: 45% GIỮ CỔNG (`noRetreat`), còn lại bám nóc
  nhà đang bị nhắm. Cột mốc của toán cướp trỏ vào **CỔNG trước, nhà sau** — trỏ thẳng vào nhà
  là cả toán chạy tới dí mặt vào cổng rồi mới nhờ `UpdateBlockedPath` nhận ra phải đập.

## 9. FORM CỦA THÀNH QUÁCH — rút từ 13 ảnh tham chiếu (2026-08)

Style vẽ thì tuỳ (pixel · flat · vẽ tay), nhưng **FORM** thì cả 13 ảnh đều giống nhau. Bốn nét
này thiếu cái nào là công trình đọc không ra "thành quách":

| Nét | Vì sao bắt buộc |
|---|---|
| **RĂNG CƯA (lỗ châu mai)** — răng HẸP, NHIỀU, khe rộng gần bằng răng | silhouette nhận dạng số một: từ xa chỉ thấy đường răng cưa là đã biết là thành |
| **CHÂN LOE (battered base)** — chân dày hơn ngọn | không có là bức tường trông như tấm bìa dựng đứng |
| **TRỤ ĐỨNG chia nhịp (buttress)** | tường dài mà phẳng lì thì đọc ra một tấm ván |
| **KHE BẮN TÊN rải đều**, có gờ đá quanh | một vệt đen dán lên tường không đọc ra khe bắn |

### ⚠ ĐỈNH THÁP PHẢI LOE RA VÀ ĐỂ HỞ

Nét form quan trọng nhất của cái tháp: **đỉnh rộng hơn thân** (machicolation — dãy corbel đỡ
nhô dần ra) và **sàn để HỞ**, có răng cưa quanh mép.

Bản art cũ đội **mái chóp nhọn** — vừa sai form, vừa **nói ngược lại chính cơ chế của mình**:
`GarrisonPost` cho cung thủ ĐỨNG TRÊN sàn tháp, mà mái chóp thì không ai đứng lên được.
Người chơi nhìn cái tháp có mái mà thấy ông cung thủ đứng lơ lửng trên nóc.

Mái chóp vẫn dùng được cho **tháp trang trí** (chòi, tháp canh nhà dân) — chỉ đừng dùng cho
công trình có `GarrisonPost`.

### ⚠ BÓNG CỦA TRỤ PHẢI CÙNG HỌ MÀU VỚI ĐÁ

Bản vẽ thử đầu kẻ một vệt gần đen bên phải mỗi trụ. Mắt đọc vệt đó ra **RÃNH**, không đọc ra
bóng — và cả bức tường thành ra "mặt tiền nhà có cột". Bóng dùng `StoneDark` (cùng thang xám
với đá), mép sáng dùng `StoneLit`; đừng lấy màu `Shadow` gần đen.

### Quy trình đã dùng (làm lại y vậy khi sửa art công trình)

1. **Nhìn art ĐANG CÓ trước** — ghép `Wall/Tower/Gate` thành một tấm rồi xem, đừng đọc code
   mà đoán. Chính bước này lộ ra cái mái chóp mâu thuẫn với `GarrisonPost`.
2. **Vẽ thử bằng Python** — `scratchpad/envcanvas.py` là bản mô phỏng `EnvCanvas` (trùng tên
   hàm + trùng công thức, tự lật trục y vì Unity y-up còn PIL y-down). Vẽ → NHÌN → sửa → nhìn
   lại. Rẻ hơn nhiều so với mở Unity chạy tool.
3. **Port số sang C#** khi đã ưng mắt, rồi biên dịch kiểm.

Đây đúng khuôn của `canvas.py` bên bộ vũ khí — xem `AssetGeneration.md`.
