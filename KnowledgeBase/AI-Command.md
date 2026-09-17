# Hệ chỉ huy phân cấp (Command Hierarchy)

> Ông tướng điều phối lính: **bậc 2 nắm n thằng bậc 1, bậc 3 nắm n thằng bậc 2**, sâu bao
> nhiêu bậc tuỳ chỉnh. Lệnh chảy TỪ TRÊN XUỐNG, báo cáo chảy TỪ DƯỚI LÊN.
>
> Code: `Assets/Scripts/AI/Command/` · Tuning: asset `CommandDoctrine` · Soi: phím **F9** lúc Play.

---

## 1. Tại sao cần thêm tầng này

`StickmanAgent` (xem [AI-NPC.md](AI-NPC.md)) đã lo được **một thằng lính**: thấy địch thì đánh,
yếu máu thì chạy, đổi vũ khí thì đổi lối đánh. Nhưng nó không biết:

- lúc này cả phe nên **xông lên hay lui về giữ nhà**
- lính nào đi tuyến đầu, lính nào làm **đợt hai**
- khi nào cả tổ **dồn đánh một đứa** cho chết hẳn

Đó là việc của CHỈ HUY, không phải của lính. Tầng này tách hẳn ra:

| Tầng | Ai lo | Ở đâu |
|---|---|---|
| Chiến lược — đánh hay thủ, ở đâu | `CommandNode` + `CommandDoctrine` | `AI/Command/` |
| Chiến thuật — đi đứng, ngắm, ra đòn | `StickmanAgent` + FSM + Strategy | `AI/` |
| Cơ khí — vũ khí, đạn, ragdoll | `WeaponBase`, `ProjectileController` | `Combat/` |

Lính **không biết** mình đang bị chỉ huy: nó chỉ nhận thêm một cái **cột mốc** (Transform) để bám.
Nhờ vậy tắt hết hệ chỉ huy đi thì NPC vẫn chạy y như cũ.

---

## 2. Cây chỉ huy

```
★ Blue_Chief      (CommandNode bậc 3 — CHỦ TƯỚNG: nhân vật THẬT, đội vương miện,
│                  đứng lùi sau tuyến, MÁU 6, có nón + giáp + khiên — và CHẾT ĐƯỢC)
├── Blue_01_Shield   (CommandNode bậc 2 — TỔ TRƯỞNG: vừa đánh vừa chỉ huy)
│   ├── Blue_02_Shield   (bậc 1)
│   └── Blue_03_Shield   (bậc 1)
├── Blue_04_Melee    (bậc 2)
│   ├── Blue_05_Melee
│   └── Blue_06_Melee
└── ...

Commander_Blue    (TeamCommander — chỉ là "bộ máy hành chính": giữ căn cứ, học thuyết,
                   nút bấm. KHÔNG phải người chỉ huy.)
```

Bốn loại node, **cùng một class** `CommandNode` (Composite pattern):

| Loại | Có `StickmanAgent`? | Có cấp dưới? | Ghi chú |
|---|---|---|---|
| Lính (bậc 1) | ✔ | ✘ | lá của cây |
| Tổ trưởng (bậc ≥2) | ✔ | ✔ | **là một thằng lính thật** → chết được |
| **Chủ tướng (gốc)** | ✔ | ✔ | **nhân vật thật trên sân**, chết là cả phe mất chỉ huy |
| Sở chỉ huy ảo (gốc) | ✘ | ✔ | bất tử — chỉ dùng khi không chỉ định chủ tướng |

### Chủ tướng đứng ở đâu

Chỉ huy đứng **LÙI SAU mốc tuyến của mình** đúng `commandStandoff × (cấp bậc − 2)`:

- **Tổ trưởng (bậc 2)** → standoff = 0 → **dẫn đầu tổ**, chiếm slot tuyến đầu.
- **Chủ tướng (bậc 3)** → lùi 5 unit → tiến theo quân nhưng không xáp trận.

Quan trọng: chỉ huy có standoff > 0 nhận lệnh `Attack` sẽ chạy **`GuardTarget`** chứ không phải
`HuntTarget`. `Hunt` là thấy địch trong tầm nhìn là đuổi theo — tướng sẽ tự lao lên tuyến đầu
rồi chết lãng nhách. `Guard` = bám cột mốc (cột mốc vẫn tiến theo quân), chỉ đánh đứa bén mảng tới.

Địch cũng biết **chặt đầu rắn**: `AIProfile.commanderTargetBonus` trừ điểm khi chấm mục tiêu,
nên chủ tướng lọt vào tầm là bị ưu tiên xử. Muốn giết nó thì phải phá tuyến trước đã.

---

## 2b. Chỉ huy tử trận

Học thuyết quyết định (`CommandSuccession`), và **khác nhau giữa 2 cấp**:

| Ai ngã | Field | Mặc định | Chuyện gì xảy ra |
|---|---|---|---|
| Tổ trưởng | `officerSuccession` | `Promote` | cấp phó khoẻ nhất lên thay, ôm luôn quân của người chết |
| **Chủ tướng** | `commanderSuccession` | **`GoFree`** | **CẢ PHE TAN HÀNG** |

Ba chế độ:

- **`Promote`** — `PickHeir` đôn đứa khoẻ nhất lên đúng cấp bậc người chết; cái xác tụt xuống làm
  lính (vẫn trong cây để đếm tổn thất). Nếu chẳng còn ai để đôn thì tự rơi về `GoFree`.
- **`GoFree`** — `Disband()` chạy đệ quy cả cây con: mỗi lính còn sống nhận
  `SetLeaderless(true)` + `SetBehavior(FreeRoam)` + một cú **sốc tinh thần** `leaderlessShock` giây.
  Từ đó **không ai ra lệnh nữa**, và nhánh đó cũng **không được đếm vào cán cân lực lượng**
  (`BuildReport` bỏ qua) — ông tướng phe kia không tưởng nhầm là mình vẫn còn đủ quân.
- **`Rout`** — như `GoFree` nhưng ép `ForceRetreat()` trước: chạy về nhà đã, hết giờ rút thì
  ai lo thân nấy.

### "Tự do theo ý nó" nghĩa là gì

Lính vô chủ về `AIBehavior.FreeRoam` → `AIStateIdle`, và **tự đi tìm địch** chứ không đứng
tuần tra quanh chỗ spawn: `AIProfile.leaderlessHuntRange` (mặc định 30) cho nó nhìn xa hơn tầm
nhìn thường, thấy hướng nào có địch thì lần tới đó (tính lại theo nhịp quét, không phải mỗi frame).
Vào tầm nhìn thật thì FSM bình thường tiếp quản: tự chọn mục tiêu, tự đánh, **tự bỏ chạy khi
yếu máu**. Không còn đội hình, không còn đợt sóng, không còn tập trung hoả lực — đúng nghĩa
mạnh ai nấy đánh.

Bảng F9 ghi `TAN HÀNG` ở nhánh mất chỉ huy và `· TỰ DO` sau từng lính.

### Dựng cây

Tự động lúc `Play`, trong `TeamCommander.Start()`:

```csharp
CommandStructure.Build(root, teamId, ranks, branching, doctrine, forward, homeX, enemyBaseX);
```

- `ranks` — số BẬC (2 = chủ tướng + lính, 3 = thêm tổ trưởng, 4 = thêm đại đội trưởng…)
- `branching` — mỗi chỉ huy nắm bao nhiêu cấp dưới
- `commanderUnit` — **nhân vật làm chủ tướng**; nó bị loại khỏi danh sách chia tổ vì chính nó
  là gốc cây. Bỏ trống + bật `_autoPickCommander` → tự chọn đứa **trâu máu nhất, đứng xa địch nhất**
  (`CommandStructure.PickCommander`). Tắt hẳn → quay về sở chỉ huy ảo bất tử như cũ.

Chỉnh 2 số này ngay trên Inspector của `TeamCommander`. Ví dụ 27 lính:

| ranks | branching | Ra cây |
|---|---|---|
| 2 | – | sở chỉ huy → 27 lính (chỉ huy trực tiếp, không tổ trưởng) |
| 3 | 3 | sở chỉ huy → 9 tổ trưởng → mỗi tổ 2 lính |
| 4 | 3 | sở chỉ huy → 3 đại đội trưởng → mỗi ông 3 tổ trưởng → mỗi tổ 2 lính |

Lính spawn giữa trận: `TeamCommander.Enlist(agent)` → `CommandStructure.Attach` nhét vào ông
chỉ huy đang ít quân nhất.

---

## 3. Lệnh đi xuống — 6 thế trận

`CommandStance` (`CommandTypes.cs`) — mỗi thế trận dịch ra hành vi của lính như sau:

| Thế trận | Cột mốc đặt ở đâu | Lính làm gì (`StickmanAgent`) |
|---|---|---|
| `Attack` | sâu hơn tiền tuyến địch `pushDepth` | `HuntTarget` → hành quân tới mốc, gặp ai đánh nấy<br>(chỉ huy đứng lùi thì dùng `GuardTarget`, xem mục 2) |
| `Hold` | ngay tuyến đầu hiện tại | `GuardTarget` → đứng đó đánh, không tiến thêm |
| `Defend` | cách căn cứ nhà `defenseDepth` | `GuardTarget` → lui về dàn trận trước nhà |
| `Regroup` | tâm đội hình | `GuardTarget` với giãn cách hẹp → gom quân |
| `Retreat` | căn cứ nhà | `GuardTarget` + `ForceRetreat()` → bỏ chạy |
| `FreeRoam` | – | `FreeRoam` → tự tuần tra, ai thấy địch thì đánh |

**Cột mốc là một Transform thật** (`Anchor_<tên>`, treo dưới một object rỗng ĐỨNG YÊN
`CommandAnchors_*` — không treo vào chủ tướng, vì chủ tướng là người thật, nó đi thì cả đội hình
sẽ trôi theo giữa 2 nhịp suy nghĩ). Chỉ huy chỉ **dời cột
mốc**, KHÔNG gọi lại `SetBehavior` — nên FSM của lính không bị reset, nó vẫn đang đánh thì đánh
tiếp, chỉ là cái đích di chuyển.

> ⚠️ `StickmanAgent.SetBehavior` giờ **thoát sớm nếu lệnh không đổi**. Trước đây gọi lại nó
> mỗi nhịp là `Target = null` + `ChangeState` → lính văng khỏi Combat đúng lúc sắp ra đòn,
> cả trận đứng nhìn nhau. Muốn dời quân thì DỜI ANCHOR.

### Chia đợt sóng

Cấp trên xếp cấp dưới theo **độ gần địch** rồi rải ra phía sau:

```
mốc của con thứ i = mốc của mình − hướng_tiến × spacing × i
```

`spacing` = `squadSpacing` (chia cho LÍNH, ~1.3) hoặc `waveSpacing` (chia cho TIỂU ĐỘI, ~4) —
xét theo cấp dưới có phải lá hay không, không theo cấp bậc. Kết quả: tổ 1 xáp trận, tổ 2 cách
4 unit làm đợt hai, tổ 3 làm dự bị.

Chỉ huy **đứng trên tuyến** (standoff = 0, tức tổ trưởng) chiếm slot 0 → đi đầu tổ.
Chủ tướng lùi hẳn ra sau thì **không chiếm slot nào**, nhường cả tuyến cho quân.

### Đội hình thích ứng toàn phe — `TeamCommander`

Chia đợt sóng ở trên là hình mặc định của **cây chỉ huy**. Khi có `TeamCommander`, nó còn phát
**một slot độ sâu cho từng lính** theo `UnitRole`, rồi `CommandNode.ComputeSelfAnchor` cộng slot
vào chính anchor của người đó. Vì game chỉ có một làn ngang, đội hình có nghĩa là *lớp trước /
giữa / sau theo hướng tiến*, không có toạ độ Y giả khiến lính bay khỏi nền:

| Đội hình thực tế | Khi nào tướng chọn | Slot vai trò |
|---|---|---|
| `BattleLine` | giao chiến hoặc tranh điểm bình thường | khiên trước · cận chiến giữa · tầm xa/hỗ trợ sau |
| `ShieldWall` | giữ mục tiêu, hoặc địch tầm xa chiếm nhiều | khiên nhô xa nhất · tuyến sau lùi sâu hơn |
| `AssaultColumn` | được giao phá/chiếm mục tiêu, đang Attack và đủ sức | khiên + cận chiến nén ở mũi · tầm xa bọc sau |
| `EscortScreen` | bảo vệ VIP/xe hàng biết đi | lớp bảo vệ ôm sát anchor di động · cung/súng sau |
| `MarchColumn` | `Retreat` hoặc `Regroup` | nén mọi vai trò để rút/tập kết, không giữ phân vai cứng |
| `Loose` | `FreeRoam` | xoá slot — lính tự do như thiết kế cũ |

`MapAssembler` dịch `MissionPlan` sang `TeamFormationIntent` **từ Map xuống AI**: công thành /
săn mục tiêu → `AssaultObjective`; giữ nhà/VIP → `DefendObjective`; hộ tống →
`EscortObjective`; chiếm điểm → `CaptureObjective`. AI không được biết `MissionPlan` hay type
Map nào — đó là tham chiếu ngược tầng.

Số tuning nằm trong `CommandDoctrine`: `formationThinkInterval`, `formationChangeCooldown`,
`formationSlotSpacing`, `formationRankSpacing`, `formationCompactSpacing`,
`formationEnemyRangedShare`, `formationAssaultPowerRatio`. Đổi kiểu phải có cooldown, nếu không
chỉ một cung thủ chết là toàn phe giật giữa tường khiên và tuyến thường. Để đạo diễn cảnh/test,
gọi `TeamCommander.SetFormationOverride`; để trả quyền tự chọn, gán `Auto`.

**Không cộng hai lần spacing.** Khi layout này bật, mọi node con nhận cùng tâm tuyến; chỉ slot
của CHÍNH lính đó mới tạo khoảng cách. Nếu vẫn rải `squadSpacing/waveSpacing` theo từng cấp,
lính rank 3 sẽ bị lùi thêm ở mọi cấp và đội hình thành một đoàn dài vô lý. Các nhánh dự bị/cứu
nhà vẫn ghi đè anchor sau bước chia lệnh như cũ, nên cánh tách ra giữ đội hình nhỏ quanh mục tiêu
của chính nó.

Roster lấy từ **cây `CommandNode`**, không lấy danh sách chụp lúc đầu trận: lính `Enlist` hay
`CommandStructure.Attach` giữa trận nhận slot ở nhịp kế tiếp. Bài thử: `Demo_8_AILab` ›
**"Đội hình thích ứng (AI team)"**; dòng trong `TeamCommandHud` hiện đúng đội hình đang áp.

### Đội hình SÂN 3/4 — bảy hình thật, hai cách ra lệnh (2026-09-12)

Bảng trên là của **sân ngang**: một trục thì "đội hình" chỉ trả lời được *ai trước ai sau*.
Trên sân 3/4 (`WorldPlane.IsGround`) có trục sâu thật, nên câu *"đứng thành hình gì"* mới có
nghĩa — `Assets/Scripts/AI/Command/GroundFormation.cs`:

| Hình | Ăn tiền khi | Nhìn ra |
|---|---|---|
| **Hàng ngang** | đánh trực diện — cả tuyến chạm địch cùng lúc | rộng, nông; khiên ngoài cùng |
| **Hàng dọc** | hành quân xa · rút lui · chui cửa hẹp | sâu, hẹp, nối đuôi |
| **Mũi nêm** | chọc thủng giữa tuyến địch | chữ V chĩa vào địch, khiên ở mũi |
| **Hạc dực** | quân đông hơn — hai cánh bọc sườn (`StickmanFlankBonus` ×1.25) | cung ôm ngược, hai cánh nhô trước |
| **Ô vuông** | hộ tống thứ phải giữ | vành chữ nhật, tầm xa nằm trong |
| **Vòng tròn** | bị vây tứ phía, ít quân mà phải trụ | vành tròn, tầm xa nằm trong |
| **Tản khai** | địch bắn mưa tên / có sát thương vùng | thưa gấp rưỡi, so le |

**Hai mode, một đường ống.** Cả hai đều: chọn hình → `GroundFormation.Build` → slot xuống cây
chỉ huy → mỗi lính một cột mốc riêng. Không có đường thứ hai nào cho lính đi vào chỗ đứng.

| Mode | Ai chọn hình | Cửa vào |
|---|---|---|
| **① Người chơi chỉ định** | người chơi | bảng **Đội hình** góc trên-phải (`FormationHud`, phím **F4**) → `TeamCommander.SetGroundFormation`; bấm «Trả quyền» về mode ② |
| **② Tướng máy điều phối** | `TeamCommander.ChooseGroundShape` mỗi `formationThinkInterval` | tự chạy cho **mọi** phe máy |

Mode ② lấy nền là thế trận sân ngang (`GroundFormation.FromKind`) rồi ghi đè bằng ba luật chỉ
sống được ở sân hai trục: **bị kẹp hai đầu** (≥ `groundEncircledEnemies` địch sau lưng) → vòng
tròn; **đông hơn** ≥ `groundCraneWingRatio` lần → hạc dực; **địch bắn nhiều mà mình không có
khiên** → tản khai. Lệnh rút / thả rông vẫn thắng tất cả.

Chỗ hình căn vào là **cột mốc** (căn cứ địch khi tiến, nhà mình khi thủ), không phải chỗ ông
chỉ huy đang đứng — ghế Chỉ huy dời cột mốc tập kết là dời luôn cả đội hình. Số tuning:
`groundFileSpacing` (ngang) · `groundRankSpacing` (dọc) · `groundCraneWingRatio` ·
`groundEncircledEnemies`.

⚠ **Sân hẹp hơn hình thì ĐỔI HÌNH, không bóp nát** — bảng lệnh in ra hình THẬT SỰ đang dàn, kèm
một câu vì sao. Đo được: hạc dực 24 quân trên sân `halfDepth 5.5` phải ép còn 0.48 đơn vị giữa
hai người (ngưỡng chồng người 0.7), nên nó tự lùi về hàng ngang — hình duy nhất biết **gấp
xuống tuyến sau** thay vì nở rộng ra.

Kiểm: bảng khám «Đội hình sân 3/4» (7 hình × 5 cỡ quân × 3 bề sâu + quân số thật của 249 map
3/4), và `python Docs/Tools/sim_groundformation.py` (thêm `--draw` để nhìn bảy hình bằng mắt).

### Tập trung hoả lực

Mỗi tổ trưởng chọn 1 mục tiêu chung (`UpdateFocusTarget`): **gần + yếu máu nhất**, giữ ít nhất
`focusFireHold` giây rồi mới đổi. Truyền xuống lính qua `SuggestTarget()` — là *gợi ý*, lính
đang kề dao vào cổ đứa khác thì cứ dứt điểm nốt.

---

## 4. Báo cáo đi lên — `SectorReport`

Ông tướng **không quét từng thằng lính trên bản đồ**. Mỗi nhịp, node gom báo cáo của cấp dưới
rồi cộng lại (`Absorb`):

| Trường | Nghĩa |
|---|---|
| `alive` / `total` | quân số còn sống / tổng (tính cả cây con) |
| `power` | tổng sức chiến đấu = vai trò × tình trạng máu |
| `frontX` / `rearX` | tuyến đầu / tuyến cuối → `Spread` = đội hình dàn rộng bao nhiêu |
| `engaged` | bao nhiêu lính đang thực sự chạm địch |
| `lastContactTime` | lần cuối khu vực này đụng địch |

Cả lượt gom + chia lệnh là **O(n) một lần mỗi `thinkInterval`** (mặc định 0.5s), chạy đệ quy từ
gốc nên thứ tự luôn xác định — không phụ thuộc thứ tự `Update` của Unity.

---

## 5. Quyết định: khi nào đánh, khi nào thủ

Số liệu nằm trong asset **`CommandDoctrine`** (Create > Stickman > Command Doctrine).

**Cán cân lực lượng** `ratio = sức mình / sức địch` trong khu vực mình phụ trách
(bán kính = `sectorRadius × cấp bậc` → cấp càng cao nhìn càng rộng):

```
ratio ≥ attackRatio / aggression   → TẤN CÔNG
ratio ≥ holdRatio  / aggression    → GIỮ TUYẾN
ratio ≥ retreatRatio               → PHÒNG THỦ
còn lại                            → RÚT LUI
```

Chồng thêm 3 luật:

1. **Chưa thấy địch → TẤN CÔNG** (đứng chờ thì 2 phe nhìn nhau tới sáng).
2. **Im ắng quá `noContactTimeout` giây → ép TẤN CÔNG** — chống bế tắc ở tầm chiến lược
   (khác với `AIProfile.stalemateTimeout` là chống bế tắc giữa 2 cá nhân).
3. **Đội hình dàn rộng quá `regroupSpread` → TẬP KẾT trước**, gom tới khi hẹp hơn
   `regroupedSpread` mới đánh tiếp.

Đổi thế trận xong phải giữ `orderCooldown` giây mới được đổi tiếp (chống lật lệnh như chong
chóng) — **trừ RÚT LUI**, sắp bị xoá sổ thì không đợi ai.

### Quyền tự quyết của cấp dưới

`subordinateAutonomy` (0..1), hoặc `_autonomy` riêng trên từng node:

| Mức | Cấp dưới được phép |
|---|---|
| 0 | tuân lệnh mù quáng |
| ≥ 0.33 | yếu thế (`ratio < defendRatio`) thì thôi không xông lên nữa, đứng giữ tuyến |
| ≥ 0.66 | sắp bị xoá sổ (`ratio < retreatRatio`) thì tự rút, kệ lệnh trên |

**Cấp dưới chỉ được NHÁT HƠN lệnh trên, không được liều hơn** — nếu không thì cây chỉ huy
chẳng còn ý nghĩa gì.

### Tính cách ông tướng

Đổi vài số là ra tính cách khác — không đụng code:

| Kiểu | aggression | attackRatio | Kết quả |
|---|---|---|---|
| Cân bằng | 1.0 | 1.1 | hơn quân mới đánh (`Doctrine_Balanced`) |
| Máu chiến | 1.35 | 0.95 | thua quân vẫn xông (`Doctrine_Aggressive`) |
| Rùa thủ | 0.75 | 1.4 | hơn hẳn mới dám ra khỏi nhà |

> ⚠️ **`regroupSpread` / `regroupedSpread` phải RỘNG HƠN bề dày đội hình tự nhiên**
> (số đợt × `waveSpacing` + `commandStandoff`). Đặt chặt quá là điều kiện "gom xong" không bao giờ
> đạt được → cả phe kẹt ở TẬP KẾT vĩnh viễn, dồn đống giữa sân và **không đánh nhau**.
> Code có 2 lớp chống: ngưỡng tự giãn theo quân số (`RegroupedTargetSpread`) và hạn giờ
> `regroupTimeout` (quá giờ là đánh luôn). Đừng gỡ hai cái đó ra.

---

## 5c. Tổ trưởng che chở (tầng AI TEAM) — `UpdateOfficerCover`

Trước đây tổ trưởng chỉ khác lính ở chỗ dẫn đầu tổ + chỉ định mục tiêu chung — người của nó
sắp chết ngay bên cạnh thì nó **không phản ứng gì**. Nay: lính trong tổ tụt máu dưới
`officerCoverHealthPercent` mà đang bị đánh → tổ trưởng bỏ mục tiêu đang săn, quay sang
**xử kẻ đang đánh thằng em** (kẻ đó lấy từ `Target` của chính thằng em, không quét radar).

- Đi qua đúng `SuggestTarget` nên có sẵn luật lịch sự: đang kề dao vào cổ đứa khác thì dứt
  điểm nốt, đang rút thì kệ. Gọi SAU `ApplyToAgent` để gợi ý "cứu em" **thắng** gợi ý
  "tập trung hoả lực".
- Chỉ sĩ quan **ĐỨNG TRÊN TUYẾN** (standoff 0). Chủ tướng đứng lùi mà lao vào cứu lính là
  tự nộp mạng — cả phe tan hàng vì một pha nghĩa hiệp.
- Kẻ phải xử nằm ngoài `officerCoverRange` quanh tổ trưởng thì thôi — chạy tới nơi em nó
  cũng chết rồi.
- Có quán tính (`focusFireHold`): nhận che ai thì theo tới hạn giữ, không đổi mỗi nhịp (§5b).
- `officerCoverHealthPercent = 0` = tắt (mặc định code — asset builder bật 0.55).

Bài test: `Demo_8_AILab` › **"Tổ trưởng che chở (AI team)"**.

## 5d. Chia cánh về cứu nhà (tầng ĐIỀU PHỐI) — `UpdateHomeDefense`

Trước đây gốc cây chỉ chọn **một** mốc tuyến cho cả phe: nhà bị đột kích sau lưng thì không
luật nào phản ứng, trừ khi cán cân TOÀN TRẬN tụt tới mức đổi cả thế trận (quá muộn, quá đắt).
Nay: có **NGƯỜI** địch (lọc fighter, bài học đếm-quân-lọc-người) lọt vào `homeDefenseRadius`
quanh căn cứ trong lúc cả phe đang Attack/Hold → chủ tướng **tách cánh đứng lùi nhất** quay
về (`Defend`, mốc đặt ngay giữa bọn đột kích), các cánh khác đánh tiếp.

- Cùng khuôn `UpdateReserve`: ghi đè lệnh SAU `DistributeToChildren`, TRƯỚC khi cấp dưới
  `Resolve` — cánh được chọn nhận lệnh mới ngay nhịp đó.
- Dẹp xong phải Ở LẠI thêm `homeDefenseMinHold` giây mới được gọi lên tuyến — quán tính
  chống lật lệnh (§5b).
- **Dự bị đang giữ hậu cứ thì KHÔNG chia thêm** — chính cánh dự bị đón mũi đột kích; bóc
  thêm cánh nữa là tự bóc tuyến đầu hai lần cho một mũi lẻ.
- Cờ hiệu "THEO TÔI" thắng (dốc toàn quân), thế trận Defend/Retreat/Regroup thì khỏi chia
  (toàn quân vốn đã quay về).
- `homeDefenseRadius = 0` = tắt (mặc định code — bật ở Doctrine_Balanced/Defensive/
  MapDefend/WarCamp; Aggressive/Guerrilla/MapAssault CỐ Ý bỏ ngỏ hậu phương).

Bài test: `Demo_8_AILab` › **"Điều phối: chia quân cứu nhà"** (Console: `CHIA CÁNH VỀ CỨU
NHÀ` / `nhà đã yên`).

---

## 5b. Chống dao động — vì sao AI từng "xoay qua xoay lại không biết đi đâu"

Sáu vòng lặp phản hồi đã tìm ra và bịt. Đây là danh sách để không ai vô tình mở lại:

| # | Vòng lặp | Cách bịt |
|---|---|---|
| 1 | **Lệnh lật Attack↔Hold**: 2 phe ngang cơ → cán cân quanh 1.0, dao động qua ngưỡng `attackRatio` → cứ hết `orderCooldown` là đổi ý, cả đại đội tiến lên rồi quay lại | **Schmitt trigger**: `stanceHysteresis` hạ ngưỡng GIỮ thế đang có xuống 15% |
| 2 | **Mốc `Hold` bám `frontX`**: mốc = vị trí thằng đi đầu → lính dịch theo mốc → mốc dịch theo lính | **Đóng băng** mốc lúc vào thế Hold, không tính lại mỗi nhịp |
| 3 | **Vệ sĩ đi tuần giữa trận**: cả đội hình đứng chờ mà đứa nào cũng dập dình quanh chỗ gác | `Agent.HoldingLine` — có lệnh chỉ huy thì **đứng yên**, chỉ vệ sĩ rảnh mới đi dạo |
| 4 | **Lật mặt khi bị kẹp hai bên**: `left <= right` đổi kết quả mỗi frame khi 2 địch xấp xỉ | `WatchSide()` có quán tính — phải gần hơn 1.5 unit mới đổi hướng |
| 5 | **Lật mặt do giãn cách**: bias đội hình đẩy `MoveInput` qua lại quanh 0 | `FaceMoveDirection` có **vùng chết 0.25** |
| 6 | **Lính vô chủ đổi mục tiêu**: 2 địch hai bên xấp xỉ → mỗi nhịp quét lại đổi hướng | bám hướng cũ tới khi hướng mới gần hơn 3 unit |

Nguyên tắc chung rút ra: **mọi quyết định nhị phân đọc từ số đo liên tục đều phải có quán tính**
(hysteresis / vùng chết / margin). Thiếu nó thì chỉ cần số đo rung quanh ngưỡng là AI rung theo.

Và: **đừng bao giờ để cột mốc phụ thuộc vào chính vị trí của quân bám nó** — đó là vòng lặp
phản hồi kinh điển, kiểu gì cũng trôi hoặc dao động.

---

## 6. Lệnh tay (người chơi giành quyền)

`TeamCommandHud` (đáy màn hình, scene demo): **Tấn công · Giữ tuyến · Về thủ** →
`root.SetManualStance(...)` khoá ông tướng máy lại. Bấm **"Trả quyền cho tướng máy"**
(`CommandAuto()`) để nhả ra.

Kịch bản màn chơi gọi thẳng:

```csharp
commander.Issue(CommandStance.Hold);      // giữ tuyến chờ viện binh
commander.Issue(CommandStance.Retreat);   // cắt cảnh rút lui
commander.CommandAuto();                  // trả lại cho AI
```

---

## 7. Soi lỗi — phím F9

`CommandHierarchyHud` vẽ nguyên cây: thế trận từng cấp, quân số, cán cân lực lượng, tuyến đầu,
và với từng lính là **state FSM + mục tiêu + vũ khí đang cầm + tầm với**.

Đọc bảng đó là ra bệnh ngay:

| Thấy gì | Bệnh |
|---|---|
| lính đứng `Idle` mãi | không nhận được lệnh — thiếu `TeamCommander`, hoặc `teamId` trùng nhau nên không ai là địch |
| `Seek` mà không tới nơi | cột mốc đặt sai chỗ (xem `frontX` / mốc của tổ) |
| `Combat` mà không ra đòn | vũ khí `TAY KHÔNG`, hoặc tầm với quá ngắn so với khoảng cách |
| cán cân nhảy loạn | `thinkInterval` quá nhỏ, hoặc `sectorRadius` quá hẹp |
| cả 2 phe `GIỮ TUYẾN` mãi | `noContactTimeout` = 0 (đã tắt chống bế tắc) |
| lính **xoay qua xoay lại tại chỗ** | xem mục 5b — 6 nguồn dao động đã sửa; nhìn cột `giữ Xs` trên F9, nhảy về 0 liên tục = lệnh đang lật |
| cả 2 phe `TẬP KẾT` mãi, dồn đống | ngưỡng regroup đặt chặt hơn bề dày đội hình — xem cảnh báo ở mục 5 |
| nhánh ghi `TAN HÀNG` | chủ tướng đã tử trận, quân đang tự đánh — đúng thiết kế, không phải lỗi |
| chủ tướng chết sớm liên tục | `commandStandoff` quá nhỏ, hoặc `commanderTargetBonus` của địch quá cao |
| lính dồn đống ở mép đất, ghi `BỜ VỰC` | đúng thiết kế: chúng bị chặn không cho rơi xuống vực và đang quay lại đánh |
| lính đi xuyên qua mép rơi xuống | `StickmanLocomotion._blockLedges` bị tắt, hoặc mặt đất không có collider (xem `StickmanSceneUtils.CreateGround`) |

---

## 8. Bản đồ design pattern

| Pattern | Ở đâu | Vì sao |
|---|---|---|
| **Composite** | `CommandNode` | node nào cũng cùng một class → phát lệnh vào gốc là chảy hết xuống lá, thêm bậc không phải viết class mới |
| **Chain of command** | `_order` xuống / `SectorReport` lên | mỗi cấp chỉ nói chuyện với cấp kề nó, ông tướng không cần biết từng thằng lính |
| **Strategy** | `CommandDoctrine` | "khi nào đánh" là DỮ LIỆU, đổi asset là đổi tính cách tướng |
| **Facade** | `StickmanAgent.SetBehavior / SuggestTarget / ForceRetreat` | chỉ huy không đụng vào FSM, vũ khí, pool đạn |
| **Observer** | `StickmanController.Died` → `OnOwnerDied` | chỉ huy chết thì cây tự kế nhiệm hoặc tự tan hàng, không cần manager gọi |
| **Template Method** | `Think() = BuildReport() → Resolve()` | khung cố định, `Decide()` khác nhau giữa gốc và cấp dưới |

---

## 9. Tool

| Menu | Việc |
|---|---|
| `Tools > Stickman > AI > 3. Add Team Commanders to Scene` | quét scene, gom NPC theo phe, dựng sẵn sở chỉ huy + cột mốc căn cứ + HUD (F9) |
| `Tools > Stickman > Demo Scenes > 3. AI Battle` | dựng lại `Demo_3_AIBattle` — 2 phe 10 lính, mỗi phe một học thuyết khác nhau |

Asset sinh ra: `Assets/Settings/Doctrines/Doctrine_Balanced.asset` (phe xanh) và
`Doctrine_Aggressive.asset` (phe đỏ) — sửa số trong đó rồi bấm Play là thấy khác ngay.


---

## 10. GÓI CHỦ TƯỚNG — bảng số và cách vặn (2026-09-17)

Luật: [`Docs/AgentRules/Command.md`](../AgentRules/Command.md) mục *GÓI CHỦ TƯỚNG*.
Code: `Assets/Scripts/Units/CommanderPresence.cs` · `CommanderPresenceDirector.cs`.

### Ai nhận, nhận lúc nào

```
CommandNode.Roots  ──(0.5 s)──>  CommanderPresenceDirector.Tick
                                     │  root.IsCommander && còn sống
                                     ▼
                              CommanderPresence.Install(người đó)
                                     │  Awake: GameFeatures.Bind(...)
                                     │  OnEnable/Start: Apply() + BuildMarks()
                                     ▼
                              (2 s) Verify(): mất chức → Release() + Destroy
```

Ba đường đổi chủ mà builder KHÔNG với tới: `PickHeir` (đôn cấp phó) · `PickCommander` (chấm
theo máu ở scene không dựng tướng riêng) · `WatchNamedCommander` (tướng cũ hồi sinh, cây dựng
lại). Cả ba đều được phủ vì gói hỏi CHỨC chứ không hỏi người.

### Bảng số (sửa trong Inspector của component, hoặc đổi mặc định trong file)

| Ô | Mặc định | Vặn khi nào |
|---|---:|---|
| `_healthScale` | 2.5 | **chỉ áp cho người KHÔNG có nhãn `FieldCommander`** — xem bẫy nhân hai lần |
| `_damageScale` | 1.35 | tướng hạ lính thường trong 2–3 nhát; hạ thấp nếu người chơi đơn độc phải solo tướng |
| `_attackSpeedScale` | 1.15 | |
| `_damageTakenScale` | 0.8 | tướng lì hơn 20% — thấp hơn 0.6 là người chơi cận chiến không đục nổi |
| `_knockbackScale` | 1.4 | đòn tướng đẩy lính bật ra, đọc ra "nó khoẻ" mà không cần con số |
| `_hitStunResistance` | 0.6 | **vế quan trọng nhất**: dưới 0.4 là ba anh lính khoá chết tướng trong hitstun |
| `_knockdownResistance` | 0.5 | |
| `_minSmarts` | 4 | CHỈ NÂNG, không hạ — ai đang cao hơn thì giữ |
| `_moraleTier` | 3 | `SetMoraleTier` là đường MỘT CHIỀU, `Release` không trả lại được |
| `_auraRadius` | 7 | 0 = tắt hào quang (và tắt luôn quầng dưới chân) |
| `_auraMoralePerSecond` | 3 | cột cờ trại là 2 — tướng đứng đó hô mạnh hơn cái cột |
| `_auraDamageTaken` | 0.9 | buff cho CẢ cánh quân nên số phải nhỏ; 0.8 là đã đổi hẳn cán cân trận |
| `_auraAttackSpeed` | 1.1 | |

### Hào quang: ghi theo nguồn, gỡ khi ra khỏi vòng

Mỗi 2 giây: ai còn trong bán kính thì `UnitStats.Set("aura:commander", …)`, ai đi ra thì
`Remove`. **Không dùng hạn giờ** — hạn giờ buộc mỗi lính mang thêm một bộ đếm, mà `UnitStats`
đã gỡ được theo tên nguồn. Tướng ngã ⇒ `RevokeAura()` gỡ sạch **và** quầng dưới chân tắt: cả
tuyến tụt sức NGAY, đọc ra được, chứ không chỉ "mất lệnh" như trước.

### Cách kiểm nhanh (không cần đọc code)

1. Mở `Demo_3_AIBattle` (hoặc AI Lab), bấm Play — hai ông tướng phải đội vương miện vàng và
   khoác áo choàng màu phe.
2. Bấm F9 (`CommandHierarchyHud`) xem ai đang là gốc cây.
3. **Giết ông tướng.** Cấp phó được đôn lên phải đội vương miện **trong vòng ~2 giây** — đây
   đúng là ca mà bản trước thất bại trong im lặng.
4. Chưa thấy vương miện nào: Bảng điều khiển › «Phù hiệu chỉ huy + quân hàm cấp AI» chưa bấm
   lại (hai ô `crown`/`cape` trong `CommandInsigniaSet` còn trống). Doctor có dòng réo đúng việc này.
