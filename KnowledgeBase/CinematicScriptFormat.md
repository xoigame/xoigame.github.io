# ĐỊNH DẠNG KỊCH BẢN PHIM (JSON inbox) — tham chiếu đầy đủ

Mỗi bộ phim nay là **một kịch bản người dùng duyệt**, không phải một bản máy tự soạn. Kịch bản
đi vào Unity qua đúng một cửa: file JSON ở
`Assets/Resources/Cinematics/CinematicAiProjectInbox.json`, dựng bằng

```powershell
# Editor đang mở thì chạy bản clone (Unity khoá project bằng Temp/UnityLockfile)
./Docs/Tools/BatchClone.ps1 -Run CinematicAiBridge.CreateFromInboxBatch
```

hoặc bằng tay: **Bảng điều khiển (Ctrl+Alt+S) › 🎬 Trường quay › «📡 Tạo asset từ inbox»**.

File này là **tham chiếu trường-theo-trường** để viết kịch bản mà không phải đọc code. Nguồn sự
thật: `Assets/Editor/Cinematic/CinematicAiBridge.cs` ·
`Assets/Editor/Cinematic/CinematicAiBridge.Setting.cs` ·
`Assets/Scripts/Map/Cinematic/CinematicTypes.cs`. Luật và lịch sử bẫy:
[Docs/AgentRules/Cinematic.md](../AgentRules/Cinematic.md); thao tác dựng/quay:
[CinematicStudio.md](CinematicStudio.md); quy trình nhập kịch bản: skill `stickman-story`.

> ⚠ **Hợp đồng chung:** cầu KIỂM HẾT rồi mới ghi. Sai một trường thì **cả storyboard bị từ chối**
> và asset không bị sửa một chữ (`"…; chưa ghi gì vào asset."`). Không có trạng thái "ghi được
> một nửa" — nên cứ sửa JSON rồi bấm lại, đừng sửa asset bằng tay.

---

## 1. Đường đi của một kịch bản (thứ tự QUAN TRỌNG)

`TryApplyJson` chạy đúng thứ tự này; biết thứ tự là đoán được ai đè ai:

1. `CleanJson` — bóc rào ``` ``` ``` và cắt lấy đoạn từ `{` đầu tới `}` cuối. Dán thừa lời dẫn
   vẫn nạp được.
2. `JsonUtility.FromJson<Draft>` — **trường lạ bị bỏ qua trong im lặng**. (File inbox hiện tại có
   `"subTitle"` — Draft không có trường này, nó không đi tới đâu cả.)
3. Kiểm `beats`: rỗng ⇒ từ chối; > **96** nhịp ⇒ từ chối; phải có **ít nhất một nhịp `Shot`**.
4. Chuyển từng nhịp (`TryConvertBeat`) — sai một nhịp là dừng, báo *"Nhịp {i+1}: …"*.
5. Kiểm `setting` → `hero` → `nemesis`.
6. Bù nhịp thiếu: `Title` (chèn đầu) · `Verdict` (chèn trước `End`) · `End` (dồn về cuối) ·
   `Order: AllowVerdict` (chèn ngay trước `Verdict`).
7. **Áp `setting`** — `CinematicTemplates.Fill` đổ lại sân + đội hình mẫu của cốt truyện
   (và **xoá sạch beats của asset**), rồi các trục bạn khai mới đè lên.
8. Áp `hero`/`nemesis`, chữ, `arc`, `visualMood`, `setPreset`, rồi mới gán `beats` của bạn.
9. `CinematicAutoWriter.AutoRepairForProfile` — cân thời lượng về khuôn, dán tiếng.

Console in ra hai dòng đo được, đọc TRƯỚC khi quay:

```
Đã tạo asset AI mới: Assets/Resources/Cinematics/Cine_Ai_THE_BRIDGE_20260915.asset (57.4 giây).
 · Sân 6 u · khung thấy 7.5 u · 5 quân ⇒ CẢ SÂN lọt một khung.
```

---

## 2. Khối gốc `Draft` — 14 trường

| Trường | Kiểu | Bỏ trống thì sao |
|---|---|---|
| `version` | string | Không ai đọc; giữ `"1"` cho dễ tra. |
| `title` | string | Lấy `title` của asset nền, cuối cùng là `"OPEN BATTLE"`. Cũng thành TÊN FILE asset (`Cine_Ai_<title>_<|seed|>`, ký tự lạ thành `_`). |
| `logline` | string | Lấy của asset nền, cuối cùng là `"<title> — a battle that has to reach an answer."` |
| `storyQuestion` | string | Mặc định `"Who pays the price before this battle has an answer?"` |
| `seriesPremise` | string | Giữ nguyên của asset nền (chỉ ghi khi bạn khai). |
| `previousEpisodeRecap` | string | nt. |
| `episodeHook` | string | nt. |
| `arc` | enum `CinematicArc` | Giữ của asset. ⚠ **Gõ sai bị bỏ qua trong im lặng** (không từ chối). |
| `visualMood` | enum `CinematicVisualMood` | Bỏ trống ⇒ nếu asset đang `Neutral` thì máy tự bốc theo seed. Gõ sai ⇒ bỏ qua im lặng. |
| `setPreset` | enum `CinematicSetPreset` | Khai đúng ⇒ chạy luôn `CinematicSetPresets.Apply` (đè biome/địa hình/trời/grade). Gõ sai ⇒ bỏ qua im lặng. |
| `setting` | object | **Không có, hoặc `scenario` rỗng ⇒ giữ nguyên bối cảnh của asset nền.** Xem mục 3. |
| `hero` | object | `name` rỗng = không có nhân vật chính. Xem mục 5. |
| `nemesis` | object | nt. |
| `beats` | mảng | **BẮT BUỘC**, ≤ 96 phần tử, ≥ 1 nhịp `Shot`. Xem mục 6. |

---

## 3. Khối `setting` — 23 trường

Khối chỉ **có hiệu lực khi `scenario` khác rỗng**. Khi đã có hiệu lực, nó đổ lại sân từ template
của cốt truyện, nên **ba trường luôn bị ghi kể cả khi bạn không khai**: `format` (⇒ `Single`),
`povHero` (⇒ `false`), `silent` (⇒ `false`), và `genre` rỗng ⇒ **`Medieval`**. Muốn giữ bối cảnh
cũ thì bỏ hẳn khối, đừng khai nửa vời.

| Trường | Kiểu | Khoảng hợp lệ | Rỗng / 0 nghĩa là |
|---|---|---|---|
| `scenario` | enum `CinematicScenario` | 28 giá trị, **không nhận `Custom`** | khối bị coi như không có |
| `genre` | enum `GameGenre` | Medieval · Modern · Fantasy · Wuxia | **Medieval** (không phải "giữ nguyên") |
| `plane` | enum `ViewPlane` | `Side` · `Ground` | giữ mặt sân của template |
| `aspect` | enum `CinematicAspect` | 4 khổ | giữ khổ của asset nền |
| `civA` / `civB` | string | `displayName` THẬT trong `CivilizationLibrary` theo `genre` | để sân tự bốc |
| `soldiersA` / `soldiersB` | int | kẹp 0–80 | 0 = giữ đội hình mẫu |
| `forceA` / `forceB` | object | xem mục 4 | không đè ô nào |
| `night` | bool | — | ⚠ chỉ BẬT được đêm, không tắt được |
| `timeOfDay` | string | `"Day"` \| `"Night"` (không phân biệt hoa thường) | giữ của mẫu |
| `waveSize` | int | **0–12**, ngoài khoảng ⇒ từ chối | 0 = giữ của mẫu |
| `waveInterval` | float (giây) | **0–60**, ngoài khoảng ⇒ từ chối | 0 = giữ của mẫu |
| `weather` | enum `WeatherKind` | 10 giá trị | giữ của mẫu. ⚠ khai `"None"` **không xoá được** mưa của mẫu (xem bẫy) |
| `seed` | int | bất kỳ | 0 ⇒ lấy seed của asset, không có nữa thì `Environment.TickCount` (phim không dựng lại được) |
| `halfWidth` | float (unit) | **3–40**, ngoài khoảng ⇒ từ chối | 0 = giữ của template (VD `Survival` = 24) |
| `format` | enum `CinematicFormat` | Single · Rounds · Ladder · Highlight | **Single** |
| `rounds` | int | kẹp 2–`MaxRounds(aspect)` | 0 ⇒ 3 (khi format là Rounds/Ladder) |
| `ladderStep` | float | > 0.01 ⇒ kẹp 0.1–1.5 | 0 = giữ của asset (0.5). ⚠ lúc chạy còn bị kẹp lại 0.15–1.5 |
| `highlightCount` | int | kẹp 3–8 | 0 ⇒ 5 (khi format = Highlight) |
| `povHero` | bool | — | `false`. Bật thì máy quay không rời vai chính, khung ≤ **9 u** (`PovMaxWidth`); không có `hero` thật thì cờ bị bỏ qua |
| `silent` | bool | — | `false`. Bật = phim không lời: bỏ CHỮ, giữ MÁY QUAY |

### Cái gì bị TỪ CHỐI, và câu báo ra sao

| Điều kiện | Câu báo (rút gọn) |
|---|---|
| `scenario` sai hoặc `= Custom` | *"setting.scenario không hợp lệ (không nhận Custom). Cốt truyện thật: …"* |
| `genre` sai | *"setting.genre không hợp lệ. Dùng: Medieval, Modern, Fantasy, Wuxia…"* |
| `plane` không phải Side/Ground | *"setting.plane chỉ nhận Side hoặc Ground…"* |
| `plane = Ground` cho cốt truyện sống bằng CHIỀU CAO | *"Cốt truyện X sống bằng CHIỀU CAO nên không quay được ở sân 3/4. Ground chỉ cho: …"* |
| `aspect` / `format` / `weather` sai tên | *"…không hợp lệ. Dùng: <danh sách thật>"* |
| `format = Rounds\|Ladder` ở khổ mà `MaxRounds < 2` | *"Khổ Portrait916 chỉ dài 59–60 giây nên không chứa nổi hai hiệp (một hiệp tối thiểu ~50 giây). Đặt setting.aspect = Landscape169, hoặc dùng format = Highlight…"* |
| `halfWidth` ngoài 3–40 | *"setting.halfWidth = X nằm ngoài khoảng 3–40 unit (nửa bề ngang sân)…"* |
| `waveSize` > 12 hoặc `waveInterval` > 60 | *"setting.waveSize phải 0–12 và waveInterval 0–60 giây…"* |
| `timeOfDay` khác Day/Night | *"setting.timeOfDay chỉ nhận \"Day\" hoặc \"Night\"…"* |
| `civA`/`civB` không có trong thư viện | *"setting.civA \"X\" không có trong CivilizationLibrary (Medieval). Tên thật: …"* |

### Nền văn minh có thật (đo 2026-09-15: 40 asset `CivilizationDefinition`)

- **Medieval (22):** Ai Cập cổ đại · Ba Tư · Hải tặc · La Mã (Lê dương) · Mông Cổ · Ngô (Đông Ngô)
  · Ngụy (Tào Ngụy) · Nhật Bản (Samurai) · Ottoman · Rus (Slav) · Sparta (Hy Lạp) · Thập tự quân
  · Thổ dân (bộ lạc) · Thục (Thục Hán) · Troy (Ilion) · Trung Hoa · Trung cổ châu Âu · Viking ·
  Đông La Mã · Đại Việt · Ả Rập · Ấn Độ
- **Modern (12):** Băng cướp · Bắc Phong · Cảnh sát · Hoa Kỳ — WWII · Hồng Sa · Khủng bố · Kim Sơn
  · Liên Xô — WWII · Nhật Bản — WWII · Quân đội · Vương quốc Anh — WWII · Đức — WWII
- **Wuxia (6):** Cái Bang (đả cẩu bổng) · Ma giáo (Nhật Nguyệt) · Nga Mi (song kiếm) · Thiếu Lâm
  (Tung Sơn) · Võ Đang (Thái Cực) · Đường Môn (ám khí)
- **Fantasy: 0.** ⚠ Khai `civA`/`civB` với `genre: "Fantasy"` là **bị từ chối** kèm câu
  *"(chưa có nền văn minh cho thể loại này)"*. Phim Fantasy phải để hai ô đó trống.

### Cốt truyện quay được ở sân 3/4 (`plane: "Ground"`) — 11 / 29

`Encirclement` · `BrawlStreet` · `OpenBattle` · `ChampionDuel` · `LoneDuel` · `FreeForAll` ·
`TugOfWar` · `Deathmatch` · `HoldPoints` · `Survival` · `FlagRun`.
Còn lại sống bằng CHIỀU CAO (công thành, tử thủ trên tường, hầm ngục, rồng bay…) nên bị từ chối.

---

## 4. Khối `forceA` / `forceB` — 8 trường (ĐỘI HÌNH TỪNG Ô)

Khai `force` là nói **con số CUỐI CÙNG**, kể cả 0 — và nó **ghi đè phép chia theo
`soldiersA/B`** (`ApplyForce` chạy sau `ScaleArmy`).

| Trường | Kiểu | `-1` (hoặc 0 với `health`) | Ghi chú |
|---|---|---|---|
| `shields` | int | giữ ô của mẫu | lính khiên |
| `melee` | int | giữ | cận chiến |
| `ranged` | int | giữ | cung/nỏ/súng theo thời kỳ |
| `support` | int | giữ | thầy thuốc / pháp sư trợ chiến |
| `infiltrators` | int | giữ | sát thủ ẩn thân, không nhập cây chỉ huy |
| `commander` | int | giữ | `0` = không có chủ tướng, `> 0` = có |
| `smarts` | int | giữ | kẹp **0–3**: 0 tắt AI · 2 chuẩn · 3 lão luyện |
| `health` | float | giữ | máu CẢ PHE, kẹp **0.2–4.0** |

> ⚠ **Vì sao phải có khối này:** `soldiersA` là TỔNG rồi chia cho MỌI ô mà mẫu có, **tối thiểu 1
> mỗi ô**. Nên «một người giữ cầu» khai `soldiersA: 1` ra **5 người** (khiên + kiếm + cung + hỗ
> trợ + chủ tướng): đúng luật chia, sai hoàn toàn ý đồ (luật 74 Cinematic.md).
>
> ⚠ Ô bạn **không khai** trong một khối đã có sẽ giữ giá trị khởi tạo `-1` = "giữ của mẫu", KHÔNG
> phải 0. Chưa có phép đo riêng cho trường hợp khai thiếu — **khai đủ 8 ô là cách chắc chắn**.

---

## 5. Khối `hero` / `nemesis` — 6 trường

Không sinh thêm người: Đạo diễn lấy đúng người đang giữ vai neo sau khi quân ra sân, đặt tên,
khoác ngoại hình, nhân máu, treo bảng tên.

| Trường | Kiểu | Luật |
|---|---|---|
| `name` | string | **Rỗng = không có nhân vật này** (cả khối bị bỏ qua, kể cả khi `anchor` sai). Được `Trim()`. |
| `title` | string | Danh hiệu ngắn dưới tên. Rỗng = không có. |
| `anchor` | enum `CinematicActor` | **Bắt buộc là một NGƯỜI**: `ChampionA` · `ChampionB` · `CommanderA` · `CommanderB` · `Assassin` · `Vip` · `FrontlinerA` · `FrontlinerB`. Sai ⇒ từ chối cả storyboard. |
| `lookTag` | string | Thẻ hồ sơ trong `StickmanLookSet` của thời kỳ. Không có thẻ đó ⇒ **cảnh báo lúc chạy** rồi bốc theo `lookSeed` (không từ chối). |
| `lookSeed` | int | 0 = giữ ngoại hình sân đã bốc; khác 0 = bốc tất định theo hạt này. |
| `healthMultiplier` | float | ≤ 0.01 ⇒ **1**; ngược lại kẹp **0.25–60**. Xem mục 8 để tính đúng số. |

Chọn cốt truyện có vai đó: đấu tướng → `ChampionA/B`; công thành → `CommanderA/B`; ám sát →
`Assassin`/`Vip`; tử thủ/cầm cự → `FrontlinerA/B`. Neo hụt vai thì Console báo
*"…nhưng sân không có ai giữ vai đó"* và phim vẫn chạy — không có nhân vật chính.

Sau khi khai, nhịp `Shot`/`Say` dùng `actor: "Hero"` / `"Nemesis"`, và các mốc
`HeroHurt` · `HeroDown` · `NemesisDown` mới có người để đo.

---

## 6. Mảng `beats` — 21 trường, dùng theo `kind`

Trường không thuộc `kind` đang dùng thì **bỏ trống** (JsonUtility điền 0/rỗng/false).

| `kind` | Bắt buộc | Nhận thêm | Giây (kẹp) |
|---|---|---|---|
| `Shot` | `shot` | `actor` · `transition` · `landmark` · `width` · `widthFrom` · `fromX` · `toX` · `killCam` | 0–120; bỏ trống ⇒ 5 cho `Reveal`/`Rush`, 2.5 cho cảnh khác, **0 cho `Action`** |
| `Title` | `text` | `subText` | 0.5–8 |
| `Caption` | `text` | — | 0.5–8 |
| `Say` | `text` + `actor` (≠ `None`) | `shout` | 0–12; **0 = tự tính theo độ dài câu** |
| `Order` | `order` | — | — |
| `WaitUntil` | — | `cue` (rỗng ⇒ `Elapsed`) | 0.2–120 = HẠN CHỜ |
| `SlowMo` | — | `timeScale` (≤0.01 ⇒ 0.3; kẹp 0.1–1) | 0.1–8 |
| `Music` | `mood` | — | — |
| `Sfx` | `sfx` (≠ `None`) | — | — |
| `Shake` | — | `timeScale` (≤0.01 ⇒ 0.35; kẹp 0.05–1) | — |
| `Fade` | — | `timeScale` > 0.5 = TỐI, ngược lại = MỞ | 0.1–3 |
| `Weather` | `weather` **hoặc** `nightPhase` 1/2 | `timeScale` = độ dày hạt (0–2) | — |
| `Verdict` | — | — | 1.5–6 |
| `End` | — | — | — |

Trường hình học của `Shot`: `width` kẹp 0–60 (bề ngang LÚC KẾT) · `widthFrom` kẹp 0–60 (bề ngang
LÚC MỞ, chỉ `Reveal`/`Rush`) · `fromX`/`toX` kẹp **−1…+1** (tỉ lệ nửa map: −1 mép trái, 0 giữa).

**Bẫy im lặng của nhịp:** `shot` · `order` · `mood` · `sfx` · `actor` của `Say` đi qua phép kiểm
NGHIÊM (sai ⇒ từ chối). Nhưng `actor` của `Shot`, `transition`, `landmark`, `cue`, `weather` đi
qua `OptionalEnum` — **gõ sai là rơi về mặc định trong im lặng** (`None` · `Cut` · `None` ·
`Elapsed` · `None`). Một `actor: "Heroo"` biến cảnh bám nhân vật thành cảnh không bám ai, và
không có dòng nào báo.

Ngoại lệ có kiểm: `actor = Landmark` mà `landmark = None` ⇒ từ chối
(*"actor = Landmark thì phải khai landmark (Gate, Tower, Wall, Bridge…)"*).

### Máy tự bù — đừng viết tay lại

- Thiếu `Title` ⇒ chèn ở đầu (2 s, lấy `title`).
- Thiếu `Verdict` ⇒ chèn ngay trước `End` (3 s).
- Thiếu `End` ⇒ thêm ở cuối; đặt `End` giữa mảng ⇒ **dồn về cuối** (nhịp sau nó không bị nuốt).
- Thiếu `Order: AllowVerdict` ⇒ chèn ngay trước `Verdict` (không có nó thì trọng tài không chấm).
- `AutoRepairForProfile` cân tổng thời lượng về khuôn và dán tiếng.
- ⚠ Bảng của bạn có **≥ 4 nhịp `Shot`** thì lượt "trang điểm" `DressVisualRhythm` **đứng ngoài**
  (luật 75): 10 cảnh `Static` cố ý đứng yên sẽ không bị chèn thêm Follow/PanAcross. Dưới 4 cảnh
  bị coi là bảng còn dở và vẫn bị vá.

---

## 7. Enum hợp lệ (đọc từ `CinematicTypes.cs`, 2026-09-15)

| Enum | Số giá trị | Giá trị |
|---|---:|---|
| `CinematicScenario` | 29 (nhận 28) | OpenBattle · Assassination · Siege · ChampionDuel · ~~Custom~~ · Ambush · LastStand · Raid · ZombieOutbreak · FlagRun · TugOfWar · PrisonBreak · StarveSiege · Survival · FreeForAll · DragonHunt · ArcaneRift · Escort · LoneDuel · ZombieEscape · NightHorde · HoldPoints · RoyaleDrop · CampRise · Deathmatch · BossLair · DungeonRun · BrawlStreet · Encirclement |
| `ShotKind` | 8 | Establishing · PanAcross · Follow · Action · PunchIn · Static · Reveal · Rush |
| `BeatKind` | 14 | Shot · Title · Caption · Order · WaitUntil · SlowMo · Music · Fade · End · Say · Sfx · Shake · Verdict · Weather |
| `CinematicActor` | 18 | None · CommanderA · CommanderB · Assassin · Vip · ChampionA · ChampionB · FrontlinerA · FrontlinerB · LastVictim · LastKiller · Convoy · BaseA · BaseB · Contested · Hero · Nemesis · Landmark |
| `CinematicCue` | 16 | Elapsed · FirstClash · FirstDeath · VipDead · AssassinNearVip · AssassinRevealed · ChampionDead · SideWiped · HalfFallen · CommanderDead · ObjectiveLost · HeroDown · NemesisDown · HeroHurt · LastFew · LandmarkLost |
| `CinematicOrder` | 10 | HoldAll · ChargeAll · ChargeA · ChargeB · DefendA · DefendB · RetreatA · RetreatB · AutoAll · AllowVerdict |
| `CinematicSfx` | 15 | None · Whoosh · Boom · Riser · Horn · Drum · Sting · Heartbeat · SwordRing · ArrowVolley · Wind · Crowd · Bell · Growl · Siren |
| `CinematicTransition` | 6 | Cut · Fade · Glide · Flash · WhipPan · Wipe |
| `CinematicAspect` | 4 | Portrait916 (1080×1920) · Landscape169 (1920×1080) · Square11 · Portrait45 (1080×1350) |
| `CinematicFormat` | 4 | Single · Rounds · Ladder · Highlight |
| `CinematicLandmark` | 12 | None · Gate · Tower · Wall · Barricade · Village · Prison · Flag · Depot · HighGround · BreachPoint · Chokepoint |
| `CinematicArc` | 6 | Straight · Underdog · Revenge · Betrayal · Legend · LastWords |
| `CinematicVisualMood` | 8 | Neutral · Dawn · Storm · Fire · Arcane · Night · Victory · Defeat |
| `CinematicSetPreset` | 9 | Auto · DawnMeadow · NightForest · BurningVillage · StormFront · ArcaneRift · SnowSiege · DesertAmbush · WuxiaMoonlight |
| `WeatherKind` | 10 | None · Rain · Snow · Leaves · Ash · Embers · Thunderstorm · Blizzard · Sandstorm · Petals |
| `MusicMood` | 6 | Menu · Prepare · Battle · Danger · Victory · Defeat |
| `GameGenre` | 4 | Medieval · Modern · Fantasy · Wuxia |

Khuôn thời lượng theo khổ (`CinematicVideoProfiles.DurationRange`): **Portrait916 59–60 s** ·
**Landscape169 180–300 s** · Portrait45 22–34 s · Square11 24–38 s.

Số hiệp tối đa (`MaxRounds` = `⌊(cao − 1.8) / (50 + 1.8)⌋`, với `MinRoundSeconds = 50`,
`RoundCardSeconds = 1.8`): **Landscape169 ⇒ 5**; ba khổ còn lại ⇒ **1**, tức `Rounds`/`Ladder`
bị **từ chối** ở đó. Khổ dọc muốn chia khúc thì dùng `Highlight`.

---

## 8. RÀNG BUỘC HÌNH HỌC — bề ngang thấy được là TRẦN CỨNG

Luật «người phải cao ≥ **105 px** trong file video» (`CinematicCamera.MinBodyPixels`) chặn cỡ
nhìn, nên `width` khai bao nhiêu cũng vô nghĩa quá ngưỡng. Công thức thật:

```csharp
// CinematicCamera.cs
FrameHeightPixels(aspect) = 1080f / Mathf.Min(1f, Mathf.Max(0.2f, aspect));   // cạnh ngắn luôn 1080
MaxViewHeightFor(aspect)  = BodyHeight * FrameHeightPixels(aspect) / MinBodyPixels;  // 0.73 · px / 105
MaxVisibleWidth(aspect)   = MaxViewHeightFor(aspect) * aspect;
```

Thay số của bản đang chạy (`BodyHeight = 0.73`, `MinBodyPixels = 105`):

| Khổ | aspect | Cao khung (px) | Cao thấy được (u) | **Bề ngang thấy được (u)** |
|---|---:|---:|---:|---:|
| Landscape169 | 1.778 | 1080 | 7.5 | **13.3** |
| Portrait916 | 0.5625 | 1920 | 13.3 | **7.5** |
| Portrait45 | 0.8 | 1350 | 9.4 | **7.5** |
| Square11 | 1.0 | 1080 | 7.5 | **7.5** |

> ⚠ **Số 17.0 u trong luật 73 và trong chú thích `CinematicCamera` / `CinematicAiBridge` là số
> CŨ**: nó ứng với `MinBodyPixels ≈ 82.5`. Với hằng số hiện tại, khổ ngang chỉ thấy **13.3 u**
> (khổ dọc **7.5 u** thì khớp). Dùng con số bạn tự tính bằng công thức trên — hoặc đọc thẳng
> dòng `FrameFitLine` mà cầu in ra lúc nhận kịch bản, vì dòng đó gọi đúng hàm.

**Hệ quả:** một hàng 20 lính đứng cạnh nhau đã ~18–20 u, nên khổ dọc **không bao giờ thấy quá
~8 người trong một khung**. Muốn "toàn cảnh" thì **THU SÂN**, không có cách nào nới camera.

| Khổ | `halfWidth` nên đặt | Sân (= 2 × halfWidth) | Tổng quân hai phe |
|---|---|---|---|
| Dọc 9:16 (Shorts/TikTok) | **4–7** | 8–14 u | **2–8** |
| Ngang 16:9 (YouTube/Facebook) | **10–13** | 20–26 u | **10–16** |

**Mẹo «một khung hình duy nhất»:** máy quay kẹp `x` trong `±(halfWidth − halfView)` với
`halfView = size × aspect = width / 2`. Khi `halfView ≥ halfWidth` thì `limit = 0` và **camera
đứng yên tuyệt đối, bất kể cảnh loại gì** — không cần cờ "khoá camera" nào. Điều kiện: sân ≤ bề
ngang thấy được, và mọi cảnh khai `width` đủ rộng (VD sân 6 u + `width: 8`).
⚠ Kill-cam khai bề ngang riêng **4.5 u** nên nó vẫn nhích được ±0.4 u ở sân 6 u; muốn đứng im
tuyệt đối thì bỏ `killCam`.

---

## 9. CÂN BẰNG THEO DPS — đừng bốc số (luật 78)

Số gốc đo từ asset thật:

| Thứ | Số | Nguồn |
|---|---:|---|
| Máu một người thường | **3.0** | `StickmanController._maxHealth` |
| Kiếm: sát thương / nhịp | **1.0** mỗi **0.35 s** ⇒ **2.86 DPS** | `WeaponBase._damage`, `Weapon_Sword.prefab._cooldown = 0.35` |
| Cung: sát thương / nhịp | **1.5** mỗi ~**1.2 s** ⇒ **1.25 DPS** | `Weapon_Bow.prefab` (`_damage = 1.5`, `_cooldown = 0.94` + thì giương cung) |

**Công thức hệ số máu cho nhân vật chính:**

```
DPS_ép   = 2.86 × (số kiếm đánh ĐỒNG THỜI) + 1.25 × (số cung bắn ĐỒNG THỜI)
hệ số k  = DPS_ép × (số giây muốn trụ) / 3.0        →  hero.healthMultiplier
số giây trụ được với k = 3.0 × k / DPS_ép
```

Bảng suy ra thẳng (2 kiếm + 1 cung = **6.96 DPS**):

| `healthMultiplier` | Máu thật | Trụ được |
|---:|---:|---:|
| ×6 (trần CŨ) | 18 HP | **2.6 s** ⇒ phim kết thúc ở giây thứ năm |
| ×40 | 120 HP | 17.2 s |
| ×60 (**trần hiện tại**) | 180 HP | 25.9 s |
| ×104 | 312 HP | 44.8 s — **vượt trần**, phải giảm áp lực thay vì thổi máu |

> ⚠ Trần `Mathf.Clamp(multiplier, 0.25f, 60f)` là trần THẬT (`CinematicDirector.ScalePrincipalHealth`).
> Muốn trụ lâu hơn 26 giây dưới áp lực đầy thì **giảm DPS_ép**, đừng xin thêm máu — và nhớ máu vẫn
> chỉ là nửa câu chuyện: thêm `forceA.smarts = 3` (đỡ được, chọn đòn được) mới ra "người giỏi
> hơn" thay vì "bao cát dai" (luật 76).

**Ba lẽ thiết kế rẻ hơn thổi máu:**

1. **Bỏ tay bắn xa khỏi phe địch** (`forceB.ranged = 0`) trong phim có khiên — tên bay qua khiên
   thì cái khiên và cả tiền đề "cầu hẹp" thành vô nghĩa. DPS_ép 6.96 → 5.72.
2. **Hạ máu tốp lính** (`forceB.health = 0.7`): mỗi địch còn 2.1 HP, người hùng hạ trong
   **0.73 s** thay vì 1.05 s ⇒ áp lực giảm ~30% mà không ai thành bao cát.
3. **Đợt nhỏ, thưa ra** (`waveSize: 2`, `waveInterval: 8`): số người **ĐỒNG THỜI** mới là thứ
   giết, không phải tổng số người. ⚠ Mẫu `Survival` mặc định `waveSize = 5, waveInterval = 14` —
   hợp phim NGANG 3 phút, quá thưa và quá đông cho phim DỌC 60 giây.

---

## 10. Ví dụ đầy đủ, chạy được — «THE BRIDGE»

Đây là nội dung thật của `Assets/Resources/Cinematics/CinematicAiProjectInbox.json` (rút gọn phần
nhịp lặp; cắt bớt chỉ làm phim ngắn hơn, không làm nó sai). Chép nguyên khối, sửa chữ, rồi chạy.

```json
{
  "title": "THE BRIDGE",
  "logline": "A lone shieldman holds a plank bridge one man wide. They come in threes.",
  "storyQuestion": "How long can one man hold a road wide enough for one man?",
  "setting": {
    "scenario": "Survival",
    "genre": "Medieval",
    "aspect": "Portrait916",
    "halfWidth": 3.0,
    "timeOfDay": "Day",
    "weather": "Rain",
    "seed": 20260915,
    "forceA": { "shields": 1, "melee": 0, "ranged": 0, "support": 0,
                "infiltrators": 0, "commander": 0, "smarts": 3, "health": 4.0 },
    "forceB": { "shields": 0, "melee": 2, "ranged": 0, "support": 0,
                "infiltrators": 0, "commander": 0, "smarts": 1, "health": 0.7 },
    "waveSize": 2,
    "waveInterval": 8.0
  },
  "hero": { "name": "HOLDFAST", "title": "the bridge",
            "anchor": "FrontlinerA", "healthMultiplier": 15.0 },
  "beats": [
    { "kind": "Fade", "seconds": 0.6 },
    { "kind": "Title", "text": "THE BRIDGE", "subText": "one shield · one road", "seconds": 2.0 },
    { "kind": "Caption", "text": "ONE MAN. ONE BRIDGE.", "seconds": 2.2 },
    { "kind": "Shot", "shot": "Static", "seconds": 3.0, "width": 8.0, "fromX": 0.0 },
    { "kind": "Say", "actor": "Hero", "text": "This far." },
    { "kind": "Sfx", "sfx": "Horn" },
    { "kind": "Order", "order": "ChargeAll" },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0 },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0 },
    { "kind": "Caption", "text": "FIRST THREE", "seconds": 1.6 },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0 },
    { "kind": "Caption", "text": "THE PLANKS ARE SLICK", "seconds": 1.6 },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0 },
    { "kind": "Say", "actor": "Hero", "text": "Still standing." },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0 },
    { "kind": "Caption", "text": "FOURTH WAVE", "seconds": 1.6 },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0 },
    { "kind": "WaitUntil", "cue": "LastFew", "seconds": 5.0 },
    { "kind": "Sfx", "sfx": "Heartbeat" },
    { "kind": "SlowMo", "timeScale": 0.55, "seconds": 0.9 },
    { "kind": "Shot", "shot": "Action", "seconds": 3.0, "width": 8.0, "killCam": true },
    { "kind": "Shot", "shot": "Static", "seconds": 2.6, "width": 8.0, "fromX": 0.0 },
    { "kind": "Verdict", "seconds": 2.6 },
    { "kind": "Sfx", "sfx": "Sting" },
    { "kind": "Title", "text": "XOIGAME", "subText": "stickman war", "seconds": 1.4 },
    { "kind": "Fade", "seconds": 0.5 },
    { "kind": "End" }
  ]
}
```

### Vì sao từng khối là con số đó

| Khối | Con số | Lý do đo được |
|---|---|---|
| `scenario: "Survival"` + `waveSize/waveInterval` | 2 người mỗi 8 s | Đây là cách DUY NHẤT diễn đạt *"từng đợt 2–3 địch"*. Khai thẳng `forceB.melee: 7` là bảy người XÔNG VÀO CÙNG LÚC — bị vây, không phải giữ cầu; và bảy người không lọt nổi khung dọc 7.5 u. |
| `aspect: "Portrait916"` | — | Khuôn 59–60 s. Kéo theo: không được dùng `format: "Rounds"` (MaxRounds = 1). |
| `halfWidth: 3.0` | sân **6 u** | Sàn cho phép của cầu là 3 (cây cầu hẹp nhất). 6 u < 7.5 u thấy được ⇒ **cả sân lọt một khung**, và vì `halfView ≥ halfWidth` nên camera đứng yên tuyệt đối (mục 8). |
| Mọi `Shot` khai `width: 8.0` | 8 > 6 | Cùng một cỡ khung cho mọi cảnh ⇒ không có cú zoom nào, `limit = 0` ở mọi nhịp. |
| `forceA` = 1 khiên, `smarts: 3`, `health: 4.0` | một người | Khai TỪNG Ô nên đúng **1 người**; `soldiersA: 1` sẽ ra 5 người. `smarts 3` = lão luyện (đỡ được). |
| `forceB` = 2 kiếm, `ranged: 0`, `smarts: 1`, `health: 0.7` | 5.72 DPS | Bỏ cung: khiên mới có nghĩa (lẽ 1). Máu 0.7 ⇒ hạ mỗi địch trong 0.73 s (lẽ 2). |
| `hero.healthMultiplier: 15.0` | 45 HP | 45 / 5.72 = **7.9 s** dưới áp lực ĐẦY của một đợt 2 người — đủ sống qua nhiều đợt vì giữa hai đợt có 8 s nghỉ, mà chưa thành bất tử. |
| `hero.anchor: "FrontlinerA"` | — | `Survival` không sinh `Champion`/`Commander`; `FrontlinerA` là vai chắc chắn có người giữ. |
| `WaitUntil: LastFew` | hạn 5 s | Chờ MỐC THẬT ("còn vài người") thay vì đoán giây nào là cao trào. |
| `seed: 20260915` | — | Khác 0 ⇒ dựng lại được y hệt. Để 0 là mỗi lần bấm ra một sân khác. |

---

## 11. Tự kiểm trước khi giao

1. **Dựng thử bằng batch** (không cần đóng Editor):
   `./Docs/Tools/BatchClone.ps1 -Run CinematicAiBridge.CreateFromInboxBatch`.
   Thoát mã 0 = nhận; mã 1 = Console in đúng trường sai.
2. **Đọc dòng `FrameFitLine`**: *"Sân X u · khung thấy Y u · N quân ⇒ …"*. Thấy
   *"khung chỉ ôm được 63% bề ngang sân"* thì **thu sân**, đừng sửa `width`.
3. **Đọc dòng máu**: *"«TÊN» neo vào FrontlinerA · máu 45.0 (hệ số khai ×15)"*. Không có dòng
   này = neo hụt vai, nhân vật chính không tồn tại.
4. **Đọc số giây**: *"… (57.4 giây)"* — so với khuôn của khổ (mục 7). Với `format` nhiều hiệp,
   số phải xem là `WholeVideoSeconds`, không phải `EstimatedSeconds` (cái sau là MỘT hiệp).
5. Chỉ sửa tài liệu thì chạy `./Docs/Tools/AgentContext.ps1 -Check`.
