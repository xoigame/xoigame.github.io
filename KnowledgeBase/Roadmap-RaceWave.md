# Đợt ĐUA — trục «cỗ máy di chuyển» và 12 game mọc ra từ core có sẵn (2026-09-15)

> User: *"thêm ý tưởng game từ core đang có, ví dụ đua ngựa, đua xe"*.
> Tiếp nối [Roadmap-NextWave.md](Roadmap-NextWave.md) và [Roadmap-GameFactory.md](Roadmap-GameFactory.md)
> — hai file đó đặt luật «NHÂN game, đừng CỘNG game»; file này áp đúng luật đó cho ĐUA.

## 0. ĐO TRƯỚC — core đang có sẵn gì cho một cuộc đua

| Thứ một cuộc đua cần | Dự án đã có | Đo bằng |
|---|---|---|
| Tuyến đường + **phần trăm đã đi** | `WaypointMover` (`Progress` · `Arrived` · `Blocked`, khai `IEscortJourney`) | `Assets/Scripts/Gameplay/Objectives/WaypointMover.cs` |
| Đồ hình đường đi (cầu thang, ngày/đêm) | `LaneNav` | `Assets/Scripts/Combat/World/LaneNav.cs` |
| Mặt đất **có vùng nhanh/chậm** | `GroundTerrainZone` (cost + `RouteDepth`) | [Terrain.md](../AgentRules/Terrain.md) |
| Con vật cưỡi | **18** `MountDefinition` (ngựa · lạc đà · voi · hổ · báo · sói · gấu · tê giác · nai · trâu · đà điểu · raptor…), mỗi con có `speedMultiplier` + `speedPerTier` | `ls Assets/Settings/Mounts/*.asset` |
| Xe lái được | `Vehicle` + `Vehicle.Drive` + `VehicleSpec.speed/accel`, 5 `VehicleKind`, 9 prefab | `Assets/Scripts/Gameplay/Vehicles/` |
| Bay | `StickmanWings` · `WingSpec` · `FlightPhase` · khí cầu (`Aircraft.Balloon`) · rồng | [Flight.md](Flight.md) |
| Thuỷ | `NavalBattle` · `ShipDefinition` · `IslandShore` | [NavalWarfare.md](NavalWarfare.md) |
| Kiểu nhìn cho **đường đua vòng** | `ViewPlane.Ground` (3/4) — Y là chiều sâu, art dùng lại 100% | [WorldPlane.md](../AgentRules/WorldPlane.md) |
| Trọng tài + băng-rôn + nối ván | `MatchModeBase` (**40** lớp con) · `GameSession` · `MatchDirector` | `grep "class \w* *: *MatchModeBase"` |
| Tầng trên trận đánh | `GamePack` JSON · `MutatorTable` (18 luật × 3 phe) · `MatchChallengeTable` · `PlayerRole` (Hero · Commander · **Observer**) | [GameFactory.md](../AgentRules/GameFactory.md) |
| AI cưỡi / lái | `AIMountModule` · `AIVehicleModule` · `AIBehavior.Travel` (13) | `Assets/Scripts/AI/` |
| Kiểu nhiệm vụ dựng lúc chạy | **28** `MissionType` | `MapTypes.cs` |

**Kết luận của phép đo: đua KHÔNG thiếu code, nó thiếu MỘT CÂU HỎI.**
Cả 40 mode chỉ hỏi *"đánh ai, giữ gì"*. Không mode nào hỏi *"ai TỚI TRƯỚC"*, nên
`speedMultiplier` của 18 con thú và `speed/accel` của 5 loại xe **chưa từng có người tiêu**:
chúng chỉ là con số phụ của một trận đánh.

## 1. Chẩn đoán — thiếu TRỤC THỨ NĂM: LỰC ĐẨY (`RacerSpec`)

Bốn trục nhân đã có: thể loại (4) × kiểu nhìn (2) × luật biến thể (18×3) × vai người chơi (3).
Trục còn thiếu là **thứ đẩy nhân vật đi**: chân · 18 con cưỡi · 5 loại xe · thuyền · cánh ·
khí cầu · rồng. `UnitLoadout` có ô `MountDefinition` (kỵ binh spawn được) nhưng **không hệ nào
hỏi «cái này đi nhanh bao nhiêu trên đường dài»** — không có ai tiêu thì không có ai cân.

⚠⚠ **ĐỪNG VIẾT `HorseRaceMode` RỒI `CarRaceMode`.** Đó là CỘNG game: hai class cho hai tấm hình.
Viết **một** `RaceMode` + **một bảng** `RacerSpec` thì đua ngựa · đua lạc đà · đua voi · đua xe
jeep · đua chiến xa · đua thuyền · đua rồng · chạy bộ đều là **một dòng dữ liệu**, và mỗi dòng ăn
luôn 4 thể loại × 2 kiểu nhìn × 18 luật biến thể.

Trục này **trả tiền hai lần**: `RacerSpec` xong thì 40 mode cũ cũng chọn được lực đẩy —
cướp cờ trên lưng ngựa, hộ tống bằng xe tải, vây thành có kỵ binh — mà không viết mode nào.

## 2. Mười hai game mọc ra từ trục đó — xếp theo (giá trị ÷ công)

Công: ★ = một buổi · ★★ = một phiên đầy đủ · ★★★ = cần thêm art/đo đạc mới.

| # | Game | Dùng lại gì | AI phải học gì MỚI | Công |
|---|---|---|---|---:|
| **R1** | **ĐUA VÒNG** (`RaceMode` + `MissionType.Race`) — n tay đua, k vòng, thứ hạng, chạm vạch | `WaypointMover.Progress`, `MatchModeBase`, `ViewPlane.Ground`, `MapKit` | `AIStateRace`: tới cọc kế tiếp, **không bao giờ dừng**, vượt mặt, gỡ kẹt | ★★ |
| **R2** | **ĐUA VƯỢT CHƯỚNG NGẠI** (side) — hố, tường, cầu gãy; ngã là ragdoll | R1 + `FortKit`/`StructureKit` + nhảy/leo/vault sẵn có + heightfield | nhận biết vật cản → nhảy hay vòng | ★ |
| **R3** | **TRUY ĐUỔI** (`ChaseMode`) — một bên chạy thoát, một bên bắt kịp | R1 + `OpenWorld` sao truy nã + `Vehicle` + mount | kẻ săn cắt góc (đón đầu), kẻ chạy chọn đường rộng | ★★ |
| **R4** | **ĐUA + BẮN BIA** (kỵ xạ · gymkhana) — chạy hết đường, bắn bia dọc đường | R1 + `ArcheryTrialMode` + `StickmanMount.ReachesGroundWith` | bắn khi đang phi (đã có mốc lean) | ★ |
| **R5** | **THUẦN NGỰA & CHUỒNG TRẠI** — bắt ngựa hoang → thuần → nuôi → đem đua | `RiderlessHorse`, `RanchMode`, `HuntMode`, `WildlifeDirector`, `GearTiers` | thú hoang chống cự rồi quen người | ★★ |
| **R6** | **ĐUA THUYỀN** (đua thuyền rồng · regatta) | R1 + `NavalBattle` + vùng dòng chảy = `GroundTerrainZone` trên nước | giữ làn theo dòng | ★★ |
| **R7** | **ĐUA TRÊN KHÔNG** (rồng · khí cầu · cánh) — chui qua vòng treo | R1 + `FlightPhase` + `StickmanWings` + khí cầu | độ cao là một trục lái nữa | ★★ |
| **R8** | **GIAO HÀNG CÓ GIỜ** (courier) — một mình, đường dài, thế giới có địch | R1 + `Escort` + `OpenWorldCity` | lệch đường khi thấy nguy | ★ |
| **R9** | **ĐỔ ĐÈO RAGDOLL** — chỉ nghiêng người, điểm = quãng đường + số cú ngã đẹp | heightfield, ragdoll, `HitReaction` | không cần AI (một mình) | ★ |
| **R10** | **GIẢI ĐUA NHIỀU CHẶNG** — mùa giải, bảng điểm, tiền thưởng | `ChampionshipCupMode` (đã có nhánh đấu) + `GamePack` | không | ★ |
| **R11** | **ĐẤU THƯƠNG** (joust) — hai kỵ sĩ lao vào nhau, ba lượt | `DuelCombat`, `VersusCup`, mount, lance | canh thời điểm hạ thương | ★★ |
| **R12** | **ĐẤU TRƯỜNG THÚ** — 18 con vật đánh nhau, người chơi là khán giả cá cược | `WildAnimal`, mount rig, `PlayerRole.Observer` | không (dùng AI thú sẵn) | ★ |

### Biến thể MIỄN PHÍ của R1 — chỉ là dữ liệu, không thêm class

| Biến thể | Cách bật |
|---|---|
| Đua có đánh nhau (kiểu Mario Kart nhưng bằng vũ khí thật) | luật biến thể «cho dùng vũ khí» + `GenreWeaponPolicy` |
| Đua loại dần (cuối mỗi vòng, người chót bị loại) | một vế luật thắng trong `RaceRules` |
| Đua tính giờ + bóng ma vòng trước | ghi lại `Progress` theo thời gian |
| Đua tiếp sức theo đội | tay đua chạm tay ở vạch → đổi người |
| **Cá cược — người chơi chỉ NGỒI XEM** | `PlayerRole.Observer` (đang **0/40** mode khai — đua là nội dung đầu tiên đúng vai này) |
| Đua đêm / đua trong bão | `DayNightCycle` + thời tiết đã có |

## 2b. ĐÃ DỰNG XONG — R1 (2026-09-15)

| Thứ | Ở đâu |
|---|---|
| Bảng lực đẩy (26 dòng, 4 thể loại) | `Assets/Scripts/Core/Run/RacerSpec.cs` |
| Luật một cuộc đua | `Assets/Scripts/Core/Run/RaceRules.cs` |
| Cổng · đường đua · tay đua · trọng tài | `Assets/Scripts/Gameplay/Race/` (5 file) |
| AI tay đua | `Assets/Scripts/AI/States/AIStateRace.cs` + `AIBehavior.Race = 15` |
| Ô tốc độ riêng của cuộc đua | `StickmanLocomotion.SetRaceTrim` (KHÔNG dùng ô của vật cưỡi) |
| Ga theo cổng cho xe | `Vehicle.SetRaceThrottle` (KHÔNG dùng chế độ xe phố) |
| Ba màn chơi được | `Demo_74_HorseRace` · `Demo_75_CarRace` · `Demo_76_ObstacleRace` |
| Nút dựng | `Tools > Stickman > Nâng cao > Đua` (4 nút) + 4 dòng trong ★ Bảng điều khiển |
| **Kiểu chơi của hệ map** | `MissionType.Race = 28` — đủ 8/8 điểm của `StickmanMissionChainCheck` |
| Map mẫu | 3 blueprint: `Med_Race` · `Fan_Race` · `Wux_Race` (bấm «Hệ thống map» để sinh) |
| Phim | `CinematicScenario.RaceFinish` + `CinematicTemplates.Race.cs` (Doctor đòi mọi kiểu chơi có bảng phân cảnh) |
| Kho vật cưỡi cho map sinh lúc chạy | `Resources/RaceLibrary.asset` (nút «Đua > 0») |

Ba màn dựng tay chạy ở sân NGANG, tuyến A→B. **Đường đua VÒNG KÍN tự hiện ở sân 3/4**: hình
dạng do `MapAssembler.BuildRace` quyết theo `WorldPlane`, không để người dựng map tự nhớ — nên
một map đua trên sân 3/4 là vòng kín 3 vòng, còn cùng kiểu chơi ấy ở sân ngang là một lượt A→B.

### Bốn bẫy đã gặp và đã chặn khi dựng R1

| Bẫy | Nó câm thế nào | Chặn bằng |
|---|---|---|
| `float.MaxValue − giây` để xếp người đã về đích | float 7 chữ số ⇒ 3.4e38 trừ 90 vẫn bằng 3.4e38 ⇒ **mọi người về đích hoà nhau** | mốc `1e6 − giây` |
| Bị knockback BAY QUA vòng kiểm của cổng | tay đua quay đầu chạy ngược về cổng sau lưng, mãi mãi | `Racer.PassedBeyond` (hình chiếu lên hướng lao vào) |
| Hướng «cổng này → cổng sau» ở tuyến A→B | cổng cuối vòng lại cổng 0 ⇒ ngược 180° ⇒ **về đích sớm nửa đường** | `RaceTrack.ApproachDirection(index, loop)` |
| Dùng ô `SetSpeedMultiplier` cho tốc độ đua | ghi đè ô của `StickmanMount` ⇒ mất chênh lệch giống ngựa | ô riêng `SetRaceTrim` |

## 3. Ba thứ nên làm trước (và đúng thứ tự)

### Bước 1 — `RacerSpec` (bảng lực đẩy) · KHÔNG đụng mode nào

`Assets/Scripts/Core/Run/RacerSpec.cs` — một dòng khai: `propulsion` (Foot · Mount · Vehicle ·
Boat · Wings · Balloon · Dragon) · id con vật/loại xe · `topSpeed` · `accel` · `turn` ·
`stamina` · thể loại nào dùng được.

⚠ **ĐO trước khi điền số.** `MountDefinition.speedMultiplier` (1.55 mặc định) là **hệ số nhân lên
locomotion**, mà locomotion còn bị giảm tiếp — đúng cái bẫy [dash reach](../AgentRules/CombatFeel.md)
đã dính: viết số vào bảng theo tốc độ *danh nghĩa* là cả bảng cân bằng sai. Chạy thử 10 giây,
đo **quãng đường thật**, rồi mới điền.

### Bước 2 — `RaceMode` + `MissionType.Race` (R1)

- Trọng tài: đếm cọc đã qua → vòng → thứ hạng; hết giờ thì **`MatchDirector.TryTimeoutVerdict`
  phải có vế cho đua** (ai đi xa nhất thắng), không thì ván treo vô hạn.
- Đường đua: máy dựng vòng kín trên `ViewPlane.Ground` (3/4) hoặc tuyến A→B trên `Side`;
  lấy `MapKit` dựng hai bên đường, `GroundTerrainZone` rải bùn/cát/tuyết làm khúc cua có giá.
- HUD: thứ hạng · vòng · khoảng cách tới người trước.

⚠⚠ **THÊM MỘT `MissionType` = 13 CHỖ** ([MapMissions.md](../AgentRules/MapMissions.md)):
`MissionType` · `MissionInfo` · `MatchRules.DefaultFor` · `MatchDirector.IsMet/ProgressText` ·
`MissionPlan.For/ForScene` · `MapMissionAI.Decide` · `MapBlueprint.For/Validate` ·
`MapGenerator.BuildSettings/Sanitize` · `MapKitPlanner.FixedLots/Wishlist` · `MapCastle.DefaultFor` ·
`MapAssembler.BuildMission` · ba bảng `Missions` (`MapStudio` · `StickmanMapMaker` ·
`StickmanGenreMissionCatalogBuilder`) · `StickmanMapSystemBuilder.Blueprints/SettingsFor`.
Sót chỗ nào là đua **hỏng câm** đúng chỗ đó.

### Bước 3 — `AIStateRace` (thứ DUY NHẤT AI chưa biết)

`AIBehavior.Travel` **không dùng được**: người đi đường *"ĐỨNG LẠI ĐỢI vệ sĩ dọn đường"* — tay
đua đứng lại là thua. Tay đua cần: bám cọc kế tiếp → chọn làn trống → vượt bên trong khúc cua →
kẹt quá 1.5 s thì lùi và đổi làn → (nếu luật cho) chèn ép đối thủ ở khúc hẹp.

⚠ Tay đua phải khai `KeepsOwnOrders`, nếu không `CommandNode.ApplyToAgent` kéo cả đám ra tuyến
đánh nhau ở nhịp sau ([AI.md](../AgentRules/AI.md), đúng lỗi `ZoneGarrisonDuty` đã trả giá).
Scene có playbook thì mode đua phải chặn như `ZombieWaveMode` chặn (`INoPlaybook`).

## 4. Bẫy im lặng — đoán trước từ những lần đã trả giá

| # | Bẫy | Vì sao nó CÂM |
|---|---|---|
| 1 | Tay đua rơi xuống hố / lật xe | Không ai thua, không ai thắng — ván treo. Phải có **đưa về cọc gần nhất** + phạt giây |
| 2 | `Physics2D.gravity` khi vào `ViewPlane.Ground` | `WorldPlane.Enter/Restore` — quên trả là mọi scene ngang sau đó mất trọng lực, **không lỗi nào báo** ([WorldPlane.md](../AgentRules/WorldPlane.md)) |
| 3 | Vạch xuất phát trên 3/4 | Chiếu mất thông tin thì cả hàng xuất phát dồn về một điểm (bẫy «lossy projection collapses formations») |
| 4 | Thứ tự vẽ trên 3/4 | Theo Y — xe/ngựa phải dùng **cùng một điểm chạm đất** với người, không thì xe chạy dưới đất |
| 5 | Camera | **Một chủ cho một transform**: camera đua và camera rung không được cùng ghi (`Camera.md`) |
| 6 | «Hạ gục ≠ biến mất» | Hỏi `IsDie`, đừng đếm object — tay đua ngã vẫn còn trên sân |
| 7 | Đồng hồ không có verdict | Đua có giờ mà thiếu vế ⇒ chạy mãi (`MatchDirector.TryTimeoutVerdict`) |
| 8 | Xong rồi mà **không ai chọn được** | Đua phải hiện ở: `MapStudio` · menu F1 · `GamePack` · thang bậc màn ([Levels.md](Levels.md)) · `SceneRecipe.Referees`. Xem «đếm cái mà bộ chọn chọn được» |
| 9 | Tốc độ ngựa theo cấp giáp | `GearTier` cộng `speedPerTier` — bảng đua phải khoá cấp, không thì ai giàu hơn thì nhanh hơn |

## 5. Đo thế nào để biết đua CHẠY ĐÚNG (không phải «nhìn thấy nó chạy»)

1. **Bảng tốc độ thật — HAI mức, đừng lẫn (đo 2026-09-15).**
   Tốc độ thật = `_runSpeed` 3.9 × `SpeedTuning` 0.82 × `speedMultiplier` của giống × `trim`.

   | | Mục tiêu | Đo được |
   |---|---|---|
   | CẢ BẢNG asset (voi 1.05 … báo 1.95) | 1.6× – 2.2× | **1.86×** ✔ |
   | MỘT SÂN ĐUA (8 con của `Demo_74`) | **≤ 1.4×** | **1.34×** ✔ |

   Hai mức khác nhau và đây là chỗ dễ lẫn: bảng asset RỘNG để mỗi giống có tính cách, nhưng
   một sân đua lấy cả hai đầu bảng thì người chót về sau người nhất **7.6 giây** (đo: 22.6 s
   so với 30.2 s) — hết nửa đường đua là không còn ai trong khung hình. Chọn sân đua là chọn
   một LÁT CẮT hẹp của bảng, không phải lấy hết.

1b. **Trần giờ lấy từ phép đo, không gõ tay:** ≈ 3× thời gian của người thắng (đua ngựa 22.6 s
   ⇒ trần 90 s). Bản đầu để 150 s — cái đồng hồ đó không bao giờ có nghĩa gì, và một ván hỏng
   vẫn chạy thêm hai phút trước khi ai đó nhận ra.
2. **Không ai kẹt:** chạy 3 vòng với 8 tay đua AI, đếm số lần `Progress` đứng yên > 2 s. Mục tiêu 0.
3. **Có kết cục:** 20 ván tự chạy, 20 ván phải có người thắng (không ván nào chạm trần giờ mà
   không verdict).
4. **Thứ hạng đổi ngôi:** ghi thứ hạng mỗi 2 s — nếu người dẫn đầu ở giây thứ 5 luôn là người
   thắng thì cuộc đua không có nội dung, phải thêm khúc cua có giá hoặc vật phẩm.
5. Trước bàn giao: `Docs/Tools/Verify.ps1 -Changed <file>` → «★ Tự kiểm luật chơi» → Doctor.

## 6. Việc KHÔNG nên làm

- ❌ Mỗi loại đua một scene dựng tay (đúng cái `GamePack` đã cấm — sửa một dòng là dựng lại N scene).
- ❌ Mỗi loại đua một class `MatchModeBase`.
- ❌ Vẽ art mới cho đường đua trước khi trọng tài chạy được: đường đua đầu tiên nên là
  `MapKit` + `GroundTerrainZone` có sẵn.
- ❌ Đổi `StickmanLocomotion` để «cho nhanh hơn khi đua» — tốc độ phải đi qua `RacerSpec`,
  không thì mọi mode cũ đổi theo.
