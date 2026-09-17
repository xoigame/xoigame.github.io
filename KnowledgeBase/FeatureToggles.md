# Công tắc tính năng theo chế độ chơi — quy trình

> Luật ở [Docs/AgentRules/FeatureToggles.md](../AgentRules/FeatureToggles.md). File này trả lời
> đúng ba câu: *"muốn mode Y không chạy hệ X thì bấm gì"*, *"hệ X chưa có công tắc thì lắp thế
> nào"*, *"kiểm bằng gì"*. Nguồn sự thật: `Assets/Scripts/Core/Run/GameFeature.cs`.
>
> Nhìn toàn cảnh trước khi sửa: `Tools > Stickman > Nâng cao > Gameplay > ★ Xưởng game` › khối
> **«TÍNH NĂNG THEO CHẾ ĐỘ CHƠI»** — 41 kiểu chơi, ai đã khai tắt gì, tính năng nào chưa ai tắt.

---

## 1. Mode Y không cần hệ X — hệ X ĐÃ có trong `GameFeature`

Một dòng trong lớp mode:

```csharp
public override FeatureSet Features => FeatureSet.All.Without(GameFeature.Chatter, GameFeature.Garrison);
```

Xong. `MatchModeBase.Awake` khai lên sổ; mọi component đã `Bind` bật/tắt lại ngay frame đó, kể
cả khi mode được gắn muộn bởi `MapModeBinder`. Mẫu: `AppleShotMode` · `ArcheryTrialMode`.

⚠ Property được đọc trong `Awake` — trả biểu thức thuần, không đọc field mà `Start`/`Configure`
mới gán.

## 2. Gói game JSON không cần hệ X

`Assets/Resources/GamePacks.json` (hoặc `GamePacksExtra.json`):

```json
{ "id": "duong-vao-hem-nui", "featuresOff": "RunPerks, Chatter",
  "stages": [ { "mission": "Escort", "featuresOff": "NightTorches" } ] }
```

Gói tắt cho cả chuyến; chặng tắt thêm. Tên không phân biệt hoa thường; tên sai ⇒ một dòng cảnh
báo Console lúc chạy và Doctor «Gói game: featuresOff trỏ vào tính năng có thật» réo trước đó.
HUD của gói hiện `⊘ <tên>` khi có gì bị tắt.

## 3. Hệ X CHƯA có công tắc — lắp cổng (bốn bước, một đợt sửa)

1. **Hỏi ranh giới.** Tháo hệ X ra thì ván còn chơi được không? Không ⇒ nó là lõi, dừng ở đây.
   Nó là khả năng CỦA MỘT NPC ⇒ dùng `AIModule` + `AIPlaybook`, không phải cổng này.
2. **Thêm giá trị vào CUỐI `enum GameFeature`** kèm một dòng `///` nói hệ nào, file nào.
3. **Đặt cổng trong `Awake` của CHÍNH component** — một dòng, trong file của nó:

   ```csharp
   private void Awake() => GameFeatures.Bind(this, GameFeature.X);
   ```

   Component đã có `Awake` thì thêm dòng đó vào đầu thân hàm. Chỗ tạo (`AddComponent<X>()`)
   để trơn, không bọc gì.

   ⚠⚠ **ĐỪNG đặt ở chỗ tạo.** Đo 2026-09-16: 14 component có cổng nhưng **22 chỗ tạo** —
   `HeroCommander` 6 (năm builder Editor bake thẳng vào scene), `MatchStats` ·
   `StickmanMountPrompt` · `RunPerkBinder` · `RunPerkPicker` · `PlayerRespawn` mỗi cái 2. Cổng
   ở installer phủ đúng một đường; phần còn lại vẫn chạy trong khi HUD nói đã tắt.

   Hệ KHÔNG phải component (một mảng hàm trong lớp lớn như `StickmanAgent`) thì cổng là một vế
   `GameFeatures.Has` ở **property/hàm vào** duy nhất của hệ — xem mục 5b.
4. **Soát `enabled = false` có đủ tắt không** — ba đường đi vòng:

   | Đường vòng | Chữa |
   |---|---|
   | coroutine đang chạy | `StopAllCoroutines()` trong `OnDisable` |
   | event tĩnh đã đăng ký | gỡ trong `OnDisable` (mẫu `StickmanScreenFx`) |
   | **cửa TĨNH đi qua `_instance`** | thêm `!_instance.enabled` vào chính hàm tĩnh (mẫu `BattleChatter.Event`/`.Say` — cả dự án gọi cửa này, thiếu vế đó là tắt mà vẫn nói) |

   Tìm nhanh: `rg "public static" <file component>` rồi xem hàm nào chạm `_instance`.

Rồi chạy Doctor: phép đo «mỗi tính năng phải có người GẮN» phải sạch; «installer toàn cục mới
phải qua cổng» không tăng.

## 4. Kiểm

| Việc | Lệnh / nút |
|---|---|
| Biên dịch phần mình sửa | `python Docs/Tools/CompileCheck.py --mine` |
| Năm phép đo công tắc | `★ KHÁM SỨC KHOẺ DỰ ÁN` → nhóm «Công tắc tính năng» |
| **Ai đã khai tắt gì** | `★ Xưởng game` › khối «TÍNH NĂNG THEO CHẾ ĐỘ CHƠI» — một hàng một kiểu chơi, kèm dòng «chưa mode nào tắt» |
| Xem lúc chạy | Inspector: component bị tắt có ô tick `enabled` trống; `GameFeatures.Describe()` trả «Tắt: … (TênMode)»; HUD gói game hiện `⊘` |
| Vùng ảnh hưởng trước khi sửa file trục | `python Docs/Tools/BlastRadius.py` |

## 5. Bảng 27 installer toàn cục (đo 2026-09-15)

| Installer | Module | Trạng thái | Ghi chú |
|---|---|---|---|
| `BattleChatterBootstrap` | Gameplay/Shell | ✔ `Chatter` | hai component cùng một cổng |
| `GarrisonDirector.Install` | AI/Command | ✔ `Garrison` | cổng ở `EnsureInScene` |
| `NightTorches.Install` | Combat/World | ✔ `NightTorches` | |
| `BuildingVisitDirectorBootstrap` | AI/Work | ✔ `BuildingVisits` | |
| `RunPerkBootstrap` | Gameplay/Shell | ✔ `RunPerks` | binder + picker |
| `HeroCommanderBootstrap` | Gameplay/Command | ✔ `HeroCommander` | `HeroCommander.Enabled` là công tắc của NGƯỜI CHƠI, cổng này của MODE |
| `MatchTelemetryBootstrap` | Map/Match | ✔ `Telemetry` | |
| `StickmanScreenFx.Install` | Combat/Effects | ✔ `ScreenFx` | `OnDisable` đã gỡ event |
| `PlayerRespawnBootstrap` | Gameplay/Shell | ✔ `PlayerRespawn` | |
| `StickmanMountPromptBootstrap` · `BuildingEnterPromptBootstrap` · `SiegeEnginePromptBootstrap` | Combat | ✔ `Prompts` | ba lời nhắc bấm, một công tắc; `MapAssembler` cũng tạo cái đầu |
| `MatchBattleDirector` | Gameplay/Modes | — | lõi trận (phá thế · báo động), không tắt |
| `StickmanStairsBootstrap` | Combat/Character | — | quét hình học bậc thang, không phải tuỳ chọn |
| `MapStudioBootstrap` · `SagaDevPanel` | Map | — | khung / đồ nghề (Doctor đếm hai cái này trong mốc 7) |
| `GamePackRunner` | Map/Story | — | người chạy gói — tự cắm `MutatorBinder`; không `AddComponent` trong hook nên Doctor không đếm |
| `UnitRankGearBootstrap` | Units | ○ | gắn lên từng `StickmanEquipment` — cổng `Has` lúc gắn, đợt sau |
| `NavalBootstrap` | Naval | — | cắm factory vào AI; bỏ module Naval là tự hết, không cần cổng |
| `AILevelPickerBootstrap` · `CivilizationPickerBootstrap` · `StickmanDevMenu` · `StickmanHudToggle` · `StickmanLookBootstrap` | Demo | — | đồ nghề của người làm, game thật bỏ cả module |
| `HitStop` · `StickmanPerformanceBootstrap` · `WorldPlane` | Core | — | hạ tầng của chính bộ khung |

## 5b. Bốn hệ tuỳ chọn trong `StickmanAgent` (2026-09-16)

Không phải component nên không `Bind`; cổng là một vế `GameFeatures.Has` ở **property/hàm vào**
duy nhất của hệ — không đụng pipeline `Update`:

| Tính năng | Cổng ở | Vì sao đặt đó |
|---|---|---|
| `Morale` | `MoraleEnabled` | mọi nhánh sĩ khí (hoảng · hồi · sẵn sàng chiến đấu) đều đọc property này |
| `TakeCover` | `UpdateTakeCover`, SAU vế "hết giờ thì đứng dậy" | tắt giữa lúc đang nấp vẫn đứng lên đúng giờ |
| `AoeAvoid` | `UpdateAoeAvoid`, cạnh `Profile.aoeAvoidEnabled` | cùng chỗ với công tắc của hồ sơ |
| `LastStand` | `BeginLastStand` (cửa vào), không phải `UpdateLastStand` | không cắt ngang ai đang tử chiến |

Còn lại trong pipeline (`UpdateDodge` · né đạn · vượt địa hình · phá bế tắc) là LÕI — không có
cổng, đúng ranh giới của `AIModule`.

## 6. Câu hỏi hay gặp

**Tắt rồi mà vẫn thấy chạy?** Hai nguyên nhân, theo thứ tự hay gặp:
1. **Cổng đặt ở chỗ tạo** nên component sinh ra bằng đường khác không qua cổng. Đếm bằng
   `rg "AddComponent<X>"` toàn dự án — kể cả `Assets/Editor` (builder bake vào scene). Chữa:
   chuyển cổng vào `Awake` của chính nó.
2. Hệ đó dùng **coroutine hoặc event tĩnh** — `enabled = false` không ngừng hai thứ ấy. Gỡ
   trong `OnDisable`.

**Mode gắn muộn (map sinh lúc chạy) thì sao?** Đã tính: `Bind` ghi sổ, `SetMode` áp lại. Chỉ cổng
`Has` (hỏi một lần) mới cần chạy SAU khi mode có mặt.

**Muốn tắt cho MỘT PHE?** Không phải việc của công tắc này — dùng luật biến thể (`MutatorTable`
có phe đích), xem [GameFactory](../AgentRules/GameFactory.md).

**Muốn tắt theo THỂ LOẠI hay KIỂU NHÌN?** Thể loại lọc DỮ LIỆU (`GenreKit`), kiểu nhìn là trục
hình học (`WorldPlane`). Nếu một hệ chỉ có nghĩa ở một thể loại thì cổng vẫn đặt ở hệ đó, và
mode của thể loại kia khai `Without`.

**Tắt để né một lỗi?** Không. Tắt là để bớt việc cho ván không cần; hệ chạy sai thì sửa hệ.
