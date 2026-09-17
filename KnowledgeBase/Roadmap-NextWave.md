# Đợt tiếp theo — còn GAME nào, AI nào, TÍNH NĂNG nào đáng thêm (2026-09-08)

> Trả lời ba câu của user: *"còn game 2D nào phù hợp?"* · *"còn AI nào thêm được?"* ·
> *"tính năng nào dựng sẵn để sau này Luna (AI rẻ) làm game?"*
> Tham chiếu ngoài lấy từ web (xem mục 5). Tiếp nối [AI-GameModes-Roadmap.md](AI-GameModes-Roadmap.md)
> — file đó đã xong cả 8 mục của đợt 1.
> Đợt tiếp theo nữa (trục ĐUA · 12 game từ mount/xe/thuyền/cánh): [Roadmap-RaceWave.md](Roadmap-RaceWave.md).
> Rà soát 50 chế độ — cái nào sáp nhập được: [ModeConsolidation.md](ModeConsolidation.md).

## 0. ĐO TRƯỚC — dự án đang có gì (không đề xuất trùng)

| Đo | Số | Cách đo |
|---|---|---|
| Chế độ chơi | **31** class `: MatchModeBase` | `grep -rhoE "class [A-Za-z]+ *: *MatchModeBase"` |
| Scene demo | ~62 (`Demo_1` … `Demo_62`) | tên scene trong Editor |
| Thể loại | 4 (Trung cổ · Hiện đại · Fantasy · Võ lâm) | [Genres.md](../AgentRules/Genres.md) |
| Trạng thái AI | 17 file `AIState*.cs` | `ls Assets/Scripts/AI/States/AIState*.cs` |
| Module hành vi | 14 (`AI*Module.cs`) | `ls Assets/Scripts/AI/Modules/` |
| File C# | 712 | `find Assets/Scripts Assets/Editor -name "*.cs"` |
| **Công thức JSON biết mấy trọng tài** | **8 / 31** | `SceneRecipe.Referees` |

**Ba lỗ hổng đo được (0 kết quả grep):**

- `InfluenceMap` · `ThreatMap` → **không có bản đồ nguy hiểm dùng chung**. Cây chỉ huy đang suy ra
  tiền tuyến từ vị trí từng người, mỗi hệ tự đoán "chỗ nào nguy hiểm" một kiểu.
- `GOAP` · `BehaviorTree` · `UtilityAI` → không có planner. **Đây không phải lỗ hổng cần vá** — xem mục 2.6.
- `GameRun` không có `Perk` / `Reward` / `Draft` → thắng thua chỉ đổi bậc khó, **không có lựa chọn nào
  giữa hai ván**. Đây là thứ khiến 31 mode vẫn là 31 bài test rời chứ chưa thành MỘT game.

---

## 1. GAME — sáu kiểu chơi còn thiếu, xếp theo (giá trị ÷ công)

| # | Kiểu chơi | Tham chiếu ngoài | AI phải học gì MỚI | Dùng lại được gì | Công |
|---|---|---|---|---|---|
| 1.1 | **Chuyến đi có chặng** (run map + chọn thưởng) | Slay the Spire · FTL | không gì — đây là tầng TRÊN trận đánh | `GameRun`, `SaveSystem`, `Achievements`, cả 31 mode | ★★ |
| 1.2 | **Bày trận rồi bấm chạy** (ngân sách + thả quân) | TABS · Total Tank Simulator | không gì — **và đó chính là điểm mạnh** | `BattleSim`, `UnitLoadout`, `TeamEconomy`, `MapKit` | ★★ |
| 1.3 | **Thủ tháp theo tuyến** | Tower Rush · Stick Castles | quân địch phải **đi tới đích thay vì đánh người** | `EnemyWaveSpawner`, `GarrisonPost`, `CampBuildSite`, `LaneNav` | ★★ |
| 1.4 | **Ngày mở biên giới, đêm thủ trại** | Kingdom Two Crowns | dời tuyến phòng thủ theo đất chiếm được | `WarCamp`, `SurviveNights`, `DayNightCycle`, ngựa | ★★ |
| 1.5 | **Bắn cầu vồng theo lượt** | Worms · Pocket Tanks · Scorched Earth | **toán đạn đạo có gió + chọn chỗ đứng an toàn** | `SiegeEngine`, `TerrainGround.TryCrater` (đã có, đang TẮT) | ★★★ |
| 1.6 | **Một mình chống biển quái** (auto-attack + nâng cấp mỗi phút) | Survivor.io · Vampire Survivors | không gì — đổi ai bấm nút | `ZombieWaveMode`, `ZombieSquadUpgrades` | ★★ |

### 1.1 Chuyến đi có chặng — ĐỀ XUẤT LÀM ĐẦU TIÊN

Bản đồ nút (3–4 nhánh), mỗi nút là một màn có sẵn; thắng thì **chọn 1 trong 3 phần thưởng**
(một cây vũ khí · một cấp AI cho cả đội · một nền văn minh mở khoá · vàng), thua thì hết run.

Vì sao đứng đầu: nó **không đẻ mode mới** mà làm 31 mode có sẵn đáng chơi lại. `ThreeKingdomsCampaign`
đã chứng minh mô hình chạy được — nhưng nó **khoá cứng vào Tam Quốc** (13 file `.Generals` / `.Sieges` / …).
Cần một `RunMap` + `RewardDraft` **trung lập thể loại**, dùng được cho cả zombie lẫn võ lâm.

- `RunMap`: danh sách nút + cạnh, sinh từ seed (`GameRun.Seed` đã có).
- `RewardDraft`: bảng phần thưởng trong **JSON**, mỗi dòng `{id, tên, mô tả, hiệu lực}`.
  Hiệu lực nối vào hệ có sẵn: `SetGearTier` · cấp `AISmartsTable` · `UnitLoadout` · `TeamEconomy`.
- Với Luna: **"làm một game mới" = viết một file JSON chuỗi màn**, không phải viết code.

⚠ Bẫy: phần thưởng phải sống qua reload scene → để trong `GameRun` (đã static, đã sống qua reload),
không để trong mode.

### 1.2 Bày trận rồi bấm chạy — mode RẺ NHẤT cho Luna

Hai bên có ngân sách; người chơi thả quân lên sân; bấm CHẠY thì ragdoll tự đánh tới hết.

Đây là kiểu chơi **hợp bộ khung này nhất mà dự án chưa có**: giá trị nằm ở vật lý ragdoll + AI có sẵn,
phần phải viết chỉ là giai đoạn bày trận. Với Luna, **nội dung của cả một game = một bảng giá đơn vị**.

- Mới: `DeployPhaseMode` (ngân sách, thả/xoá quân, nút CHẠY, khoá sửa sau khi chạy).
- Dùng lại: `UnitLoadout.ApplyTo` sinh quân, `TeamEconomy` giữ ví, `BattleSim` chạy tự động N trận.
- Tặng kèm: đây là **máy đo cân bằng trực quan** — "50 xu cung thủ có thắng 50 xu kỵ binh không?"
  hiện phải đọc CSV, sau này nhìn là thấy.

### 1.3 Thủ tháp theo tuyến

Khác `TowerHoldMode` (giữ một cái tháp có sẵn): đây là **xây tháp bằng tiền giữa các đợt**.

- Mới: `TowerDefenseMode` + bảng đợt JSON (`{đợt, loại quân, số lượng, giãn cách}`).
- AI mới cần: quân địch **đi tới đích, không dừng đánh người** — luật ngược đã có ở `IEscortJourney`
  (người đi đường không bao giờ đánh, thấy địch thì đứng đợi). Ở đây cần: *đi tiếp kể cả bị bắn*.
- Tháp = `GarrisonPost` có sẵn; móng = `CampBuildSite`; đường đi = `LaneNav`.

### 1.5 Bắn cầu vồng theo lượt — mode DUY NHẤT bắt AI học toán mới

Mọi mode hiện tại AI đều bắn thẳng hoặc bù độ rơi theo bảng. Bắn theo lượt hỏi câu khác hẳn:
**góc + lực + gió + địa hình chắn**, và *"bắn xong mình có bị lộ không"*.

- `TerrainGround.CratersEnabled = false` — **hố đạn đã viết xong và đang bị tắt**. Mode này là lý do
  chính đáng để bật nó (và là chỗ để đo xem bật thì map có vỡ không).
- Rủi ro: giao diện ngắm + luật lượt là hai hệ mới; đừng làm trước 1.1–1.3.

### 1.6 KHÔNG nên làm (để khỏi mất công đo lại)

| Kiểu | Vì sao không hợp bộ khung này |
|---|---|
| Merge / hyper-casual | Không dùng gì của rig · ragdoll · AI. Làm mới từ đầu còn rẻ hơn. |
| Idle thuần | Thị trường đã bão hoà, và giá trị bộ khung (vật lý, chiến thuật) bị vứt bỏ hết. |
| Match-3 / puzzle | Cùng lý do trên. |
| PvP nhiều người cùng máy (Stick Fight) | Đòi hệ input đa người chơi — việc lớn, để sau cùng nếu vẫn muốn. |

---

## 2. AI — năm thứ đáng thêm

### 2.1 ⭐ Bản đồ nguy hiểm dùng chung (`ThreatField`) — nâng cấp AI LỚN NHẤT còn lại

Hôm nay mỗi hệ tự đoán "chỗ nào nguy hiểm" một kiểu: `CoverTactics` soi vật che, `CommandNode` suy tiền
tuyến từ vị trí quân, `AIStateFlee` chạy ngược hướng địch. Không hệ nào biết ĐIỀU HỆ KIA BIẾT.

Map là **cảnh bên (side-view)** nên bản đồ ảnh hưởng ở đây rẻ hơn RTS nhiều: một mảng **1 chiều theo x**
(thêm một tầng nữa nếu map có sàn trên), ô rộng ~2m, mỗi phe một mảng, cập nhật vài lần/giây.

Ai được lợi ngay, không cần viết state mới:
- `CommandNode.ComputeLineAnchor` — tiền tuyến đọc từ chỗ hai đường ảnh hưởng cắt nhau, chuẩn hơn đếm người.
- `AIStateFlee` / `AIStateRetreat` — chạy về ô nguy hiểm THẤP thay vì chạy ngược hướng (hết cảnh chạy vào ổ phục kích).
- `CoverTactics` — chọn vật che **ở phía ít đạn**, không phải vật che gần nhất.
- Đặt mìn · đặt tháp · chọn chỗ đổ bộ · pháo chọn mục tiêu — đều đang thiếu một câu trả lời chung.

⚠ Luật khi thêm: **một file mới + một API hỏi** (`ThreatField.At(x, team)`), không sửa nghĩa file trục.
Chạy `python Docs/Tools/BlastRadius.py` trên `StickmanAgent.cs` trước khi nối vào.

### 2.2 Bảng tin của phe (`TeamBlackboard`) — trí nhớ chung

Đã có hô hoán (`RaiseAlert`, `alertShoutRadius`) nhưng **không ai NHỚ**: thấy địch rồi mất dấu là quên ngay.

Một bảng nhỏ mỗi phe — *"vừa thấy địch ở x=…, lúc t=…, ai báo"* — mở ra bốn thứ cùng lúc: truy đuổi thật ·
phục kích có căn cứ · pháo bắn theo toạ độ được báo · lính đi TÌM chứ không đứng ngơ.
Đây cũng là nền cho mọi mode lén lút sau này.

### 2.3 Tính cách (`AITraits`) — rẻ nhất, thấy ngay

Một lớp hệ số rời nhân vào `AIProfile`: liều/nhát · tham/kỷ luật · nóng/lì. Mỗi lính bốc một bộ theo seed
→ cùng một phe mà mỗi đứa đánh một kiểu, **không phải đẻ thêm profile**. Luna chỉnh được bằng bảng.

⚠ Phải **mặc định trung tính** (mọi hệ số = 1) để 62 scene cũ không đổi hành vi — đúng kiểu `AIProfile`
đã làm với các số của chế độ chơi.

### 2.4 Học trong trận, cấp tiểu đội

Tầng kinh tế đã biết khắc chế (`ChooseRole`: địch nhiều cung → mua khiên). Tầng lính thì chưa: bị cung bắn
ba lần liên tiếp vẫn xông thẳng. Một bộ đếm nhỏ + bảng luật
(*"nguồn sát thương chính là tầm xa → giơ khiên / đổi đường / tìm vật che"*) là đủ.

### 2.5 Bình luận viên (`MatchNarrator`)

Không phải AI chiến đấu, nhưng: `MatchModeBase` đã phát đủ sự kiện (thắng vòng, cắm cờ, tướng chết).
Một bảng câu (JSON, qua `Loc.T`) biến chúng thành lời thuật. Rẻ, và cho Luna một cách **thêm nội dung
mà không đụng gameplay**.

### 2.6 ⚠ KHÔNG nên thêm: GOAP / Behavior Tree / planner tổng quát

Tài liệu ngoài xếp GOAP cho "hành vi nổi lên bất ngờ", BT cho "logic đoán trước được". Hệ hiện tại
(FSM + chấm điểm mục tiêu + module cắm thêm) **đã là utility AI trên thực tế** và đang chạy 31 mode.
Thay trục sẽ lan ra ~10 file — đúng cái giá mà đợt 1 đã từ chối trả khi bỏ `IDamageable`.
Và quan trọng hơn: **AI yếu không debug nổi một planner**. Giữ FSM.

---

## 3. TÍNH NĂNG DỰNG SẴN CHO LUNA — theo đúng chín luật [CheapAI.md](../AgentRules/CheapAI.md)

| # | Tính năng | Luật CheapAI nó phục vụ | Vì sao cần |
|---|---|---|---|
| 3.1 | **Công thức JSON biết đủ 31 trọng tài** | 6 (mọi kiểu chơi vào được công thức) | Hôm nay 8/31 → 23 mode chỉ AI mạnh dựng được |
| 3.2 | **Một file JSON = một GAME** (`GamePack`) | 1 · 7 | Luna làm GAME, không phải sửa một scene |
| 3.3 | **Chạy thử không cần mắt** (smoke test mode) | 9 (kiểm bằng lệnh) | Bắt lỗi kinh điển "trận không bao giờ kết thúc" |
| 3.4 | **Nút «Tạo mode mới»** (scaffold) | 2 (một nút, không phải quy trình) | Thêm mode đúng cách là 5 chỗ nối, không ai nhớ nổi |
| 3.5 | **Xuất/nhập JSON cho các bảng số** | 7 (JSON, không Inspector) | Đợt quái · giá đơn vị · phần thưởng đang nằm trong `.asset` |
| 3.6 | **Mẫu công thức đủ mọi trọng tài** | 8 (mẫu đầy đủ) | Trường không có trong mẫu = không tồn tại với Luna |

### 3.1 Cách rẻ để làm — bảng thay vì 8 khối `if`

`StickmanRecipeBuilder` đang có 8 khối `if (SceneRecipe.Is(referee, "…"))`. Thêm mode thứ 32 nghĩa là
phải nhớ sửa **hai** file. Đổi thành một bảng:

```csharp
// Một dòng cho một trọng tài. Thêm mode = thêm MỘT dòng, không sửa hàm nào.
new RefereeSpec("Capture",   typeof(CaptureScoreMode), required: "Capture>=1"),
new RefereeSpec("TowerHold", typeof(TowerHoldMode),    required: "Tower>=1"),
```

Kèm **một phép đo Doctor mới**: *"có class `: MatchModeBase` mà không có dòng `RefereeSpec` → mode này
Luna không dựng được"*. Đúng kiểu «hỏng trong im lặng» mà luật 4 bắt phải réo trước khi người chơi thấy.

### 3.3 Chạy thử không cần mắt

`StickmanModeAudit` đã soi **tĩnh** (đọc YAML: scene này có trọng tài không). Còn thiếu phép đo **động**:
mở scene → `Time.timeScale = 10` → chạy N giây → khẳng định `Finish()` đã được gọi và HUD có chữ.
`BattleSim` đã có khuôn chạy hàng loạt + xuất CSV — mở rộng nó, đừng viết hệ thứ hai.

Bắt được đúng ba lỗi Luna chắc chắn mắc: trận không kết thúc · phe thứ hai không sinh · HUD trống.

---

## 4. THỨ TỰ ĐỀ XUẤT

```
Đợt A — mở đường cho Luna (làm trước, rẻ):
    3.1 bảng RefereeSpec (8→31)  →  3.3 smoke test  →  3.6 mẫu JSON đủ trọng tài

Đợt B — biến 31 mode thành MỘT game:
    1.1 RunMap + RewardDraft  →  3.2 GamePack (một JSON = một game)

Đợt C — kiểu chơi mới (độc lập nhau, chọn theo hứng):
    1.2 bày trận  →  1.3 thủ tháp  →  1.4 mở biên giới  →  1.6 một mình chống biển quái

Đợt D — AI:
    2.1 ThreatField  →  2.2 TeamBlackboard  →  2.3 AITraits  →  2.4 học trong trận

Để cuối / cân nhắc:  1.5 bắn theo lượt (bật CratersEnabled) · 2.5 bình luận viên
```

**Luật giữ nguyên khi làm bất cứ mục nào ở trên:** mode mới = 1 class `MatchModeBase` + 1 dòng
`RefereeSpec` + 1 hàm dựng + 1 phép đo Doctor; số tuning vào bảng/JSON; AI mới mặc định **trung tính**
để 62 scene cũ không đổi hành vi.

---

## 5. Nguồn tham chiếu (web, 2026-09)

- Stick War Legacy và họ hàng — [MiniReview](https://minireview.io/tower-rush/stick-war-legacy/games-like)
- Ragdoll stickman trên Steam — [Stick Ragdoll Battle Simulator](https://store.steampowered.com/app/3418270/Stick_Ragdoll_Battle_Simulator/) ·
  [Stickman Physics Battle Arena](https://store.steampowered.com/app/3649420/Stickman_Physics_Battle_Arena/)
- Bày trận theo ngân sách — [danh sách game kiểu TABS](https://www.ranker.com/list/games-like-totally-accurate-battle-simulator-ranked/ashton-knight) ·
  [alternativeto: TABS](https://alternativeto.net/software/totally-accurate-battle-simulator)
- Xây–thủ–mở rộng cảnh bên — [Kingdom Two Crowns (hướng dẫn cộng đồng)](https://steamcommunity.com/sharedfiles/filedetails/?id=1588497381)
- Roguelite / meta-progression — [How to Design a Roguelite Meta-Progression](https://bugnet.io/blog/how-to-design-a-roguelite-meta-progression) ·
  [roguelite 2026](https://entaltostudios.com/the-5-most-innovative-roguelites-of-2026/)
- Kỹ thuật AI (GOAP · utility · BT · influence map) — [Game AI Planning](https://tonogameconsultants.com/game-ai-planning/) ·
  [Co-evolving RTS micro (influence map)](https://arxiv.org/pdf/1803.10314)
- Bắn theo lượt / địa hình phá được — [Artillery game](https://grokipedia.com/page/Artillery_game)
- Thị trường mobile 2026 (vì sao KHÔNG làm merge/idle) — [Hypercasual & hybrid casual 2026](https://azurgames.com/blog/hypercasual-and-hybrid-casual-in-2026-full-report/) ·
  [Casual Games Market 2026](https://www.blog.udonis.co/mobile-marketing/mobile-games/casual-games)

---

## 6. ÁNH SÁNG vừa mở ra những gì (bổ sung 2026-09-08)

Hệ đèn 2D thật ([AgentRules/Lighting.md](../AgentRules/Lighting.md)) đẻ ra một trục thiết kế mà
roadmap này viết ra khi **chưa có ánh sáng nào tồn tại**, nên chưa mục nào tính tới.

**Đã làm** — ánh sáng đổi được quyết định: tầm nhìn theo chỗ đứng · bóng tối làm chậm việc bị
phát hiện · `StickmanStealth` cuối cùng cũng dùng tới bóng tối · dáng `peer` khi nhìn vào đêm.

**Còn lại, xếp theo (giá trị ÷ công):**

| # | Ý tưởng | Vì sao đáng | Công |
|---|---|---|---|
| 6.1 | **Đuốc là một món trang bị** | biến "đứng chỗ sáng" thành một lựa chọn MANG THEO. Người cầm đuốc thấy đường nhưng là mục tiêu số một — cái giá tự nó cân bằng. Cần art + một ô `EquipmentSlot` | ★★ |
| 6.2 | ~~**Lính gác đốt đuốc quanh chốt khi trời tối**~~ | **LÀM RỒI 2026-09-09** ở dạng rẻ hơn: `Combat/NightTorches` phát đuốc cho 30% quân (trừ người chơi · trừ `INoAutoDress`) khi `NightAmount > 0.42`, trần 16 ngọn, tắt theo cái chết của người cầm. Chưa nối vào `AIWatchModule`/`CampBuildSite` — tức chưa ai CHỌN đốt đuốc ở đâu | — |
| 6.3 | **Kẻ lẻn CHỌN đường tối** | `AIStateInfiltrate` đã có sẵn, nay có lý do thật để bám bóng tối — chấm điểm đường đi bằng `StickmanLightField.LitAmountAt` | ★★ |
| 6.4 | **Bắn vỡ đèn / dập lửa** | nước đi chiến thuật đầu tiên NHẮM VÀO ánh sáng thay vì vào người. Nửa đường đã có: **giết người cầm đuốc là tắt đèn** (`NightTorches.DropDeadTorches`); còn thiếu đèn treo / đống lửa bắn vỡ được | ★★ |
| 6.5 | **Mode «Tập kích đêm»** | một trọng tài dùng đủ cả bốn thứ trên; đây là chỗ hệ đèn trả hết vốn | ★★★ |

⚠ Bẫy chung của cả năm: **ban ngày phải là số trung tính**. Ánh sáng chỉ được XOÁ lợi thế của
bóng tối, không tự nó là một hình phạt — nếu không thì 62 scene ban ngày đổi hành vi.

## 7. ANIMATION — mục roadmap này bỏ trống

Đợt 1 và đợt 2 đều không có mục animation. Đo lại ngày 2026-09-08: **không có style chết** (12
hằng số style đều có đường xuất hiện; `WoundedStyle` không có chỗ gọi ngoài animator nhưng được
lái từ bên trong — kiểm rồi, không phải lỗi).

Luật nền: [Animation.md](../AgentRules/Animation.md) — **thêm STYLE, đừng thêm LOẠI**. Thêm loại
là phải nhớ nối `IsAmbientClip` · bảng ưu tiên · `DefaultLegWeightWhileMoving` · `DefaultOvershoot`.

| # | Ý tưởng | Nhóm | Vì sao |
|---|---|---|---|
| 7.1 | **Dáng theo ĐỘ NẶNG vũ khí** | style của `Idle`/`Walk` | bảng `kg` đã có (2026-09-05) nhưng chỉ đổi TỐC ĐỘ; búa tạ và dao găm đứng y như nhau |
| 7.2 | **Hơ tay bên lửa** | style `Idle`, trạng thái lái | dùng lại đúng `StickmanLightField` — đứng cạnh `Campfire` lúc đêm |
| 7.3 | **Dáng theo SĨ KHÍ** | style `Idle` | sĩ khí đã lái quyết định rút lui nhưng **không đọc được trên hình**; một hàng quân sắp vỡ trận nên nhìn ra được |
| 7.4 | **Chuyển tiếp giữa hai style** | `StickmanBodyAnimator` | nay đổi style là NHẢY CÓC một frame; một lớp blend ngắn ăn cho mọi style có sẵn |
| 7.5 | **Dáng chết theo hướng đòn** | ragdoll | ragdoll đã lo phần vật lý, còn thiếu nhịp "khựng một cái rồi mới mềm" |

⚠ Mọi mục ở đây đều phải **bấm lại «Dựng bộ ĐỘNG TÁC»** — bảng số nằm trong code, asset là bản
bake. Doctor «Animator XIN một style mà bộ động tác BAKE không có» canh đúng cái bẫy đó.

---

---

## 6. ĐÃ LÀM (2026-09-08, cùng ngày) — và ai đang làm phần nào

| Mục | Trạng thái | Ở đâu |
|---|---|---|
| 3.1 Công thức biết đủ trọng tài | **XONG** — 8 → 29 (34 mode, 3 cố ý loại) | `StickmanRefereeTable.cs` · `StickmanRefereeBuilds*.cs` · Doctor «Kiểu chơi vào được công thức JSON» |
| 3.6 Mẫu đủ mọi trọng tài | **XONG** — mẫu SINH từ bảng, tự chạy `Validate` | `StickmanRecipeSamples.cs`, nút «4. Tạo công thức mẫu CHO MỌI TRỌNG TÀI» |
| 1.1 Phần thưởng giữa hai ván | **XONG** (phần chơi được) | `RunPerks` · `RunPerkTable` · `RunPerkBinder` · `RunPerkPicker` · `RunPerkBootstrap`; lưu ở `PlayerProfile.runPerks` |
| 1.2 Bày trận rồi bấm chạy | **XONG** | `DeployPhaseMode.cs` + trọng tài `Deploy` (bảng giá là trường `deploy` trong JSON) |
| 2.1 Bản đồ nguy hiểm | **XONG — do phiên khác làm**, tên là `DangerField` | `Assets/Scripts/Combat/Weapons/DangerField.cs` (1 chiều theo x, đúng lý lẽ đã nêu ở mục 2.1) |
| 2.2 Bảng tin của phe | **một phần** — `NoiseField` + `AIHearingModule` (nghe), `ThreatBoard` (sổ hung thần) | phiên khác đang làm |
| 1.1 Bản đồ nút (RunMap) | **XONG — sửa lại 2026-09-16** | ⚠ Dòng cũ ghi «chưa» và đã HẾT HẠN: `SagaRun` + `SagaForkHud` (2026-09-09) chính là chuyến đi có chặng — hồi · hai ngả mỗi chặng · đường đi lưu bằng chuỗi số · perk giữ qua chặng · vào được từ ngăn kéo `⚙` ở mọi scene. **Một đợt sau suýt dựng bản thứ hai vì tin dòng này.** |
| 3.2 GamePack (một JSON = một game) | **chưa** | — |
| 3.3 Chạy thử không cần mắt | **chưa** — `StickmanModeAudit` vẫn chỉ soi TĨNH | — |
| 3.4 Nút «Tạo mode mới» | **chưa** | — |
| 2.3 Tính cách (`AITraits`) | **chưa** — hoãn có chủ đích, xem dưới | — |
| 1.3–1.6 các kiểu chơi còn lại | **chưa** | — |

### Hai điều học được khi làm

⚠ **PHIÊN SONG SONG ĐANG SỬA CÙNG KHO.** Trong lúc làm đợt này, một phiên khác đã tự làm mục
2.1 (`DangerField`) và đang sửa `AIProfile.cs`, `StickmanAgent.cs`, `CoverTactics.cs`. Vì vậy
mục **2.3 (`AITraits`) bị hoãn có chủ đích**: nó phải nhân hệ số vào `AIProfile` và đọc trong
`StickmanAgent` — hai file đang có người sửa dở. Làm song song ở đó là mất công của một trong
hai bên. Trước khi làm tiếp phần AI: `git status` rồi `CompileCheck.py --mine`.

⚠ **CON SỐ 8/31 KHÔNG PHẢI DO LƯỜI.** Nó là hệ quả của việc một kiểu chơi được khai ở HAI chỗ
(danh sách tên + nhánh dựng). Mọi luật dạng *"nhớ sửa cả hai chỗ"* rồi sẽ ra một con số như
thế; cách chữa duy nhất chạy được lâu dài là gộp hai chỗ thành một dòng bảng.

### Việc CÒN NỢ lộ ra khi làm

**CampKit** — dựng một doanh trại (kho · mỏ · nhà chính · công trường · điểm tuyển · giá vũ khí
· tướng máy) từ MỘT bảng, kiểu `FortKit`/`MapKit`/`StructureKit` đã làm cho thành và cho map.
`WarCamp.EditorSetup` đang đòi 12 mối nối có thật trong sân, nên `EconomyRaceMode` — "chế độ
đinh" — là mode duy nhất còn nợ, chứ không phải bị loại. Có CampKit thì công thức biết 30/34.
