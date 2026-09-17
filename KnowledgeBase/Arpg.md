# ARPG kiểu Diablo — quy trình, bảng số, cân bằng, «muốn sửa X thì mở file nào»

Luật bắt buộc nằm ở [Docs/AgentRules/Arpg.md](../AgentRules/Arpg.md). File này là phần TRA SÂU:
dựng thế nào, số nào đổi được ở đâu, và sửa gì khi *"chơi thấy sai"*.

## 1. Dựng và chơi

1. `★ Bảng điều khiển` (Ctrl+Alt+S) › **★ ARPG · Diablo 2D — thị trấn + hầm ngục**.
   Nút tự làm ba việc: dựng lại kho map (nạp `MapLibrary.lootWeapons` — **nguồn đồ rơi**) →
   dựng `Demo_64_ARPG_ThiTran` + `Demo_65_ARPG_HamNguc` → dựng lại vỏ game (menu chính lấy màn
   từ cùng một catalog).
2. Mở **`Demo_64_ARPG_ThiTran`** rồi Play. Lần đầu hiện màn **tạo nhân vật** (4 lớp).
3. Thị trấn: bấm một ô màn ở bảng thế giới để xuống hầm. Nút **«Nhân vật / Túi (I)»** mở bảng
   5 thẻ: Đồ · Chỉ số · Kỹ năng · Hòm · Cửa hàng.
4. Trong hầm: **F** nhặt món dưới chân · **I** mở túi (bảng này **dừng thời gian**) ·
   **1·2·3** ra chiêu. Đập vỡ hết **trụ phong ấn** → cửa ra mở → về thị trấn.
5. Gục thì về thị trấn, **không mất đồ, không mất cấp**.

## 2. «Muốn sửa X thì mở file nào»

| Muốn đổi | Sửa ở | Bấm lại nút? |
|---|---|---|
| Thêm/sửa MÀN, tên chương, cấp quái, số trụ, số cụm, bề rộng | `Core/ArpgWorld.cs` — bảng `Acts` | có |
| Tên/máu/đồ độc bản của TRÙM | `Core/ArpgWorld.cs` — `bossName`, `bossLifeScale`, `uniqueDrop` | có |
| Bậc khó (cộng cấp, nhân máu/sát thương/XP) | `ArpgWorld.LevelOffset/LifeScale/DamageScale/XpScale` | có |
| Hầm vô tận (cấp theo tầng, nhịp gặp trùm) | `ArpgWorld.Rift*` | có |
| Dòng chỉ số: khoảng roll, ô nào roll được, độ hiếm | `Core/ArpgAffix.cs` — bảng `Rows` | không |
| Số dòng theo độ hiếm | `ArpgItem.AffixCountFor` | không |
| Tỉ lệ rơi đồ, trọng số độ hiếm, vàng, XP mỗi con | `Combat/ArpgSpoils.cs` — `ArpgLootRoller` | không |
| Chiêu thức (sát thương, khí thế, hồi chiêu, tầm) | `Core/ArpgSkills.cs` — bảng `All` | có |
| Đổi 4 chỉ số gốc ăn vào cái gì | `Core/ArpgStats.cs` — mấy hằng `…Per…` | không |
| Trần chỉ số (chí mạng, giảm sát thương, tốc) | `ArpgStats.Clamp` — **một chỗ duy nhất** | không |
| 4 lớp nhân vật (máu gốc, chỉ số/cấp, vũ khí khởi điểm) | `Core/ArpgSkills.cs` — `ArpgClassTable.All` | không |
| **Dáng/màu của từng lớp** (nhìn là biết lớp nào) | `ArpgClassTable.All` — `bodyColor`, `limbThickness`, `headScale` | không |
| Bình thuốc (tỉ lệ rơi, hồi bao nhiêu) | `Combat/ArpgSpoils.cs` — `PotionChance`, `PotionHealFraction` | không |
| **Quái là xác sống hay lính giáp** | `MapAssembler.BuildArpgDungeon` (`hordeTeam`) + cờ `horde` ở `MapArpgDungeon` | có |
| **Trời tối / ban đêm** | `Map/ArpgArena.cs` — khối `DayNightSettings` | có |
| Độ rời rạc của cụm quái | `MapArpgDungeon.SpawnOnePack` — hệ số 1.7 + xê dịch 1.6 | không |
| Giá rửa điểm | `Core/ArpgHero.cs` — `RespecCost` | không |
| Đền thờ (6 loại, độ mạnh, 45 s) | `Combat/ArpgDungeonProps.cs` — `ArpgShrine.Activate` | không |
| Rương (số món, sàn độ hiếm, 12% vàng) | `ArpgChest.Open` + `MapArpgDungeon.Props.SpawnProps` | không |
| Phục kích khi trụ vỡ (mấy con) | `MapArpgDungeon.Props.AmbushAt` | không |
| Trùm: ngưỡng pha, nhịp đòn mạnh, quân gọi ở pha cuối | `MapArpgDungeon.Props.SetupBossPhases/TickBossEnrage` | không |
| Đánh cược: giá, trọng số | `ArpgInventoryHud.DrawGamble` · `ArpgLootRoller.GambleWeights` | không |
| Cỡ túi, điểm/cấp, cấp tối đa, đường cong XP | `Core/ArpgHero.cs` — hằng đầu file | không |
| Quái tinh nhuệ (tỉ lệ, nét riêng, nhân máu) | `Combat/ArpgMonsterRank.cs` + `MapArpgDungeon` | không |
| Hàng cửa hàng (số ô, trần độ hiếm) | `Gameplay/ArpgTown.cs` — `ShopSlots`, `ShopMaxTier` | không |

**«Bấm lại nút?» = có** nghĩa là số đó đã BAKE vào scene/asset map — sửa mà không bấm lại thì
hai scene vẫn chạy, chỉ là chạy bộ số cũ, và **không lỗi nào báo**. Nút khai mấy file đó trong
`extraSources` nên Bảng điều khiển tự báo "cũ".

## 3. Bảng số hiện tại (hằng trong code)

| Số | Giá trị | Ở đâu |
|---|---|---|
| Cấp tối đa | 60 | `ArpgHero.MaxLevel` |
| Điểm mỗi cấp | 3 chỉ số + 1 kỹ năng | `ArpgHero.StatPointsPerLevel` |
| Túi | 24 ô (hòm không giới hạn) | `ArpgHero.BagSize` |
| XP để đạt cấp `n` | `60 × (n−1)^2.2` (~1.4 triệu ở cấp 60) | `ArpgHero.XpToReach` |
| Chí mạng nền / trần | 5% / 75%, sát thương ×1.5 nền | `ArpgStats` |
| Giảm sát thương nhận | trần 75% | `ArpgStats.MinDamageTaken` |
| Khí thế | nền 100, +6/đòn trúng, +4/bị đánh, tụt 9/giây sau 5 s không đánh | `ArpgFury` |
| Bậc khó | Thường 0 / Ác Mộng +12 cấp ×2.2 máu / Địa Ngục +24 cấp ×4.5 máu | `ArpgWorld` |
| **Quái lớn theo CẤP** | máu ×(1 + 0.12/cấp) · sát thương ×(1 + 0.09/cấp) | `ArpgWorld.LevelLifeScale/LevelDamageScale` |
| Hầm vô tận nhân THÊM theo tầng | máu ×(1 + 0.10/tầng) · sát thương ×(1 + 0.06/tầng) | `ArpgWorld.Rift*Scale` |
| Rơi thuốc | quái thường 16% · tinh nhuệ 100%, hồi 35% máu tối đa | `ArpgLootRoller` |
| Rửa điểm | 40 + 25 × cấp vàng, mỗi loại điểm một lần trả | `ArpgHero.RespecCost` |
| Đồ rơi | quái thường 30% ra 1 món · đầu cụm 1 · hiếm 2 · trùm 4 | `ArpgLootRoller` |
| Trọng số độ hiếm 0→5 | 40 · 33 · 18 · 7 · 1.8 · 0.2 | `ArpgLootRoller.BaseWeights` |
| Cụm quái | 3–6 con, cách nhau ≥7 unit, cách chỗ xuất phát 9 unit | `MapArpgDungeon` |
| Tỉ lệ cụm có tinh nhuệ | 45% đầu cụm · 15% hiếm | `MapArpgDungeon` |

### 3b. Đường cong đã hiệu chuẩn bằng số (chưa chơi thử)

Bảng dưới đo trên **máu quái nền 15 · sát thương vũ khí nền 5**, anh hùng Chiến Binh chia đều điểm:

| Màn | cấp quái | cấp AH | máu AH | sát thương/đòn | **số đòn để AH gục** |
|---|---:|---:|---:|---:|---:|
| Thường · C1 màn 1 | 1 | 3 | 56 | 5.0 | 11 |
| Thường · C3 màn 1 | 17 | 17 | 292 | 12.2 | 24 |
| Thường · C5 TRÙM | 45 | 27 | 461 | 24.8 | 19 |
| Ác Mộng · C5 TRÙM | 57 | 58 | 985 | 51.3 | 19 |
| Địa Ngục · C5 TRÙM | 69 | 60 | 1019 | 103.2 | 10 |

⚠⚠ **Cột cuối phải PHẲNG.** Bản đầu (trước khi quái lớn theo cấp) cột này đi từ 11 lên **47** —
tức chiến dịch càng đi càng dễ, và tới giữa game không có cách nào thua. Sửa bảng số thì tính
lại cột này; nó là phép đo duy nhất bắt được chuyện đó, vì code vẫn chạy đúng y như cũ.

XP một lượt (chạy đúng một lần mỗi màn): Thường ~79k → **cấp 27** · Ác Mộng ~444k → **cấp 58** ·
Địa Ngục ~1.64M → **cấp 60** (cần 472k để đạt cấp 60). Anh hùng cố ý THẤP CẤP HƠN quái ở cuối
mỗi bậc — đó là chỗ trang bị phải bù vào.

## 4. Kiểm

- **«Soát hệ ARPG»** (`Tools > Stickman > Nâng cao > Rig & Kiểm tra`), và **Doctor gọi tự động**.
  Nó đo sáu thứ: mỗi hình chiêu có nhánh code chưa · mỗi dòng chỉ số có ai đọc chưa · chiêu khai
  trạng thái có `duration` chưa · bảng chương hợp lệ chưa · hai scene đã dựng chưa · hai chốt
  chống tranh ô máu còn nguyên chưa.
- **«Soát chuỗi điểm nối của kiểu chơi»** — hai `MissionType` mới phải đủ 8 điểm nối.
- Vòng kiểm rẻ không cần Unity: `powershell -File Docs/Tools/Verify.ps1 -Changed <file>`.

## 5. Khi «chơi thấy sai»

| Triệu chứng | Nguyên nhân hay gặp nhất |
|---|---|
| Không có món nào rơi ra | `MapLibrary.lootWeapons` rỗng → chạy `Maps > 1` rồi bấm lại nút ARPG |
| Cửa hàng trống, đồ trong túi mất hình | scene thị trấn thiếu `ArpgCatalogBootstrap` → bấm lại nút ARPG |
| Bấm "vào hầm" thì đứng hình | hai scene chưa có trong Build Settings → bấm lại nút ARPG |
| Vào Chương III mà rơi vào map khác | `ArpgArena` chạy sau `MapArena` — kiểm `[DefaultExecutionOrder(-120)]` |
| Máu tối đa nhảy qua nhảy lại khi lên cấp | `StickmanExperience` còn trên người chơi — xem `MapArpgDungeon.TryBindHero` |
| Mở túi ra là đầy máu | binder gọi `SetMaxHealth` thay vì `SetMaxHealthKeepingRatio` |
| Bấm chiêu, mất khí thế, không có gì xảy ra | thiếu `case` trong `ArpgSkillCaster.Execute` |
| Trận chạy vô tận, mục tiêu 0/0 | màn khai `seals = 0` trong `ArpgWorld` |
| Mọi nhát chém đều đốt cháy địch | chiêu có `duration > 0` mà quên khai `status` (mặc định là `Burn`) |
| Chiêu "bảy mũi" chỉ bắn ra một mũi | mất `TickBurst`/`ClearCooldown` — `TryAttack` chặn ở `!IsReady` |
| Bấm chiêu lướt mà nhân vật đứng yên | mất `FixedUpdate` giữ vận tốc — `StickmanLocomotion` ghi đè mỗi nhịp vật lý |
| Bốn lớp trông y hệt nhau | thiếu `LookSet_Medieval` trong Resources (bỏ qua lặng lẽ — chạy `Maps > 1`) |
| Đi vào cửa ra mà không có gì xảy ra | mất `TickExitWalk` — cổng chỉ còn là một vệt sáng |
| **Thanh máu ghi `0 / 30`** (cấp 1 phải là 22/22) | `ArpgStatBinder.Start` dừng giữa chừng — xem Console, HUD có dòng đỏ chỉ đúng chỗ |
| Nhân vật/quái lún trong đất | `StickmanMount` nâng nhóm `Sprite`; `LandOnGround` + `StripMount` kéo lên |
| Nhìn như ván dàn trận, không như hầm ngục | thiếu `hordeTeam`, thiếu `startAtNight`, hoặc cụm quái xếp cách đều |
| Ba ô chiêu trống ở cấp 1 | mất `ArpgRun.GrantFirstSkill` |
| Game đứng hình ngay nhát đầu khi gặp quái «Gai Ngược» | phản đòn không lọc `forceScale = 0` — dội vô hạn |
| Đền/rương không thấy đâu | thiếu `MapLibrary.square` (chúng là đồ ô vuông) — Doctor «Soát hệ ARPG» báo |
| Trùm không đổi pha / không gọi quân | quái là horde nên không có `StickmanAgent`? — trùm phải `horde = false` |
| Thoát ở màn tạo nhân vật rồi kẹt thành Chiến Binh | `_picking` phải đo bằng `kills == 0`, không phải `bag.Count == 0` |
| Đập cột được XP và rơi đồ | mất chốt `StickmanFighterController` trong `ArpgSpoils` |
| Càng đi càng dễ, cấp 30 trở đi không thể thua | mất `LevelDamageScale` trong `ArpgRun.CurrentDamageScale` |
| Túi đầy giữa hầm, không có đường ra | mất nút «Bỏ dở · về thị trấn» ở bảng túi |
| Hầm vô tận chỉ chơi được tầng 1 | mất nút «Xuống tầng kế» ở bảng kết ván |

## 6. Còn thiếu

**Chưa chơi thử thật một ván nào** — toàn bộ mới biên dịch xanh. Bảng số ở mục 3b đã hiệu chuẩn
BẰNG PHÉP TÍNH (máu quái nền 15 / sát thương nền 5 là ước lượng), chưa hiệu chuẩn trên dữ liệu
đo từ trận thật.

Thị trấn là màn hình chứ chưa đi lại được. Chưa có mercenary, ổ ngọc, chế đồ, minimap.
Chưa có tiếng "nhặt đồ" trong `StickmanSoundBank`. Sát thương chưa hiện số bay (chỉ chí mạng
có dấu vàng).
