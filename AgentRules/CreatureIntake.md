## ⚠⚠ NHẬN SINH VẬT / NHÂN VẬT MỚI — quái Fantasy 9 điểm nối, nhân vật đặt tên 4 điểm (2026-09-09)

User chốt: *"làm sẵn thuật toán, sau này tôi yêu cầu thêm monster hay nhân vật gì thì tích hợp
AI · animation · hệ thống chiến đấu cho nó"*. Đây là nhánh thứ TƯ của dây chuyền nhận asset
(ba nhánh trước: [WeaponIntake](WeaponIntake.md) · [StructureIntake](StructureIntake.md) ·
[CivilizationIntake](CivilizationIntake.md)). Skill làm việc: `stickman-intake` (rẽ nhánh) +
`stickman-look` (vẽ). Phép đo: Bảng điều khiển › Nhân vật › **«★ Soát hồ sơ sinh vật»**
(`StickmanCreatureIntakeCheck`, cũng nằm trong Doctor).

### 0. Rẽ nhánh — hỏi ba câu, dừng ở câu đầu trả lời "có"

1. **Nó có HÀNH VI khác mọi con đang có không?** (bu vào người gục · chết chia đôi · đổi theo
   đêm · bào sĩ khí · gọi quân · bay…) → **QUÁI = một `FantasyCreatureKind` mới**, đi đủ 9 điểm.
   Không trả lời được câu "nó đổi QUYẾT ĐỊNH nào" thì **không thêm chủng** — đó chỉ là một
   hồ sơ ngoại hình (câu 2). Luật này ở `FantasyRaceTactics` từ trước, không phải mới.
2. **Nó chỉ trông khác?** (con orc đỏ · lính đeo mặt nạ · anh hùng tóc vàng) → **HỒ SƠ NGOẠI
   HÌNH** `Pf(...)` trong `StickmanLookBuilder.Specs` (luật [CharacterLook](CharacterLook.md)).
   Không đụng enum, không đụng AI.
3. **Nó là MỘT NGƯỜI có tên** (tướng, boss người, nhân vật kịch bản) → **NHÂN VẬT** = 4 điểm ở
   mục 3 (`StickmanArchetype` + hồ sơ ngoại hình + dáng + chỗ đứng trong màn).

### 1. Đọc yêu cầu / ảnh ra số (bảng tra — đừng đoán)

| Nét trên ảnh / trong câu yêu cầu | Ra số ở đâu |
|---|---|
| Nó **đánh thế nào** (bu · giữ · rút · săn tuyến sau · bay) | `FantasyRole` + `case` trong `FantasyRaceTactics` — mỗi case đổi ≤ 4 số của `AIProfile` (`canRun` · `runChaseDistance` · `retreatHealthPercent` · `maxAttackersPerTarget` · `targetSpreadPenalty` · `finishDownedBonus` · `coverSeekRadius` · `structureTargetBonus`…) |
| Nó có **cơ chế** (chia đôi, hét, đổi theo đêm, gọi quân) | một `MonoBehaviour` riêng ở `Assets/Scripts/Gameplay/Fantasy<Tên>.cs` + một `case` ở `FantasyRaceCatalog.EnsureBehaviour` — **có TRẦN, có nhịp, có suy giảm** (khuôn `FantasyLichSummon` / `FantasySlimeSplit`) |
| **Sợ gì · miễn gì** | `AffinityOf`: khắc ĐÚNG MỘT trường phái, miễn ≤ 1, cờ trạng thái (`Lifeless` cho xác/ma, `Knockdown` cho khối nặng) |
| **To/nhỏ** | `headScale` · `bodyScale` (⚠ bodyScale đổi TẦM VỚI — luật rig `arm-reach`) |
| **Bay** | `flies` + `cruiseHeight`; chủng bay **không** vào roster nhà, `FantasyRaceTactics` bỏ qua nó (bộ lái là `FantasyAirRaider` do màn gắn) |
| **Mặt** (mõm · hàm · tai · sừng · cánh · đuôi) | `FantasyEar/Horn/Jaw/Wing/Tail` + `Geometry` trong `FantasyRaceSilhouetteArt.GeometryOf` (đa giác hồ sơ: crown · brow · snoutLen · snoutDrop · jawDepth · chin) |
| **Thân** (dày · chân phụ · càng · mai · vũng · áo) | hồ sơ `Pf("<Chủng>", thick:, extra:, back:, torso:, tail:)` trong bộ Fantasy của `StickmanLookBuilder.Specs` — **không** tóc/mặt/dáng đầu (đầu là art phẳng của chủng) |
| **Cầm vũ khí người được không** | `FantasyRaceLoadout.RuleFor`: `RaceRule(true, …)` = cầm trượng/cung; mặc định = vũ khí cơ thể (nắm đấm vô hình) |
| **Ra sân ở đâu** | `FantasyHouses.KindFor` (tuyến trước/sau của một nhà) — hoặc quân ĐẶC BIỆT do màn đặt (`MapArcaneRift` · `FantasyDragonBoss` · `MapDragonHunt` · `StickmanFantasyInvasionBuilder`) |

### 2. QUÁI — 9 điểm nối (thiếu điểm nào cũng biên dịch sạch)

| # | Điểm | File | Hỏng im lặng nếu thiếu |
|---|---|---|---|
| 1 | giá trị enum, nối **CUỐI** | `FantasyCreatureLook.cs` › `FantasyCreatureKind` | chèn giữa = mọi scene bake đổi chủng |
| 2 | `case` trong `Of` | `FantasyRaceCatalog.cs` | rơi về `default` tím trơn, tên = tên enum |
| 3 | `case` trong `AffinityOf` | `FantasyRaceCatalog.cs` | không sợ gì, không miễn gì — mất một câu trả lời của hệ 8 trường phái |
| 4 | `case` trong `FantasyRaceTactics` **hoặc** `flies = true` | `FantasyRaceTactics.cs` | đánh như lính thường — "chủng" chỉ là màu |
| 5 | luật đồ | `FantasyRaceLoadout.RuleFor` | mặc định là vũ khí cơ thể; pháp sư mà quên = tay không |
| 6 | cơ chế (nếu khai) + `case` ở `EnsureBehaviour` | `Fantasy<Tên>.cs` · `FantasyRaceBehaviour.cs` | "chết chia đôi" chỉ là một câu trong tooltip |
| 7 | hình học đầu | `FantasyRaceSilhouetteArt.GeometryOf` (+ `Wings.cs` nếu cánh/đuôi kiểu mới) | đầu mặc định — con nào cũng một khuôn |
| 8 | hồ sơ dáng/áo | `StickmanLookBuilder.Specs` (bộ Fantasy) | que nhuộm màu như trước khi có hệ ngoại hình |
| 9 | chỗ ra sân | `FantasyHouse.cs` hoặc một màn | có đủ 8 điểm mà **chưa từng xuất hiện** (bẫy Pollaxe/Arbalest) |
| 10 | **vũ khí đặc trưng** | `FantasyRaceCatalog.TrySignatureWeapon` | cầm CÂY TÌNH CỜ SINH RA VỚI — orc cầm cung, elf cầm búa; "đặc trưng" chỉ có trong tooltip. Chủng đánh bằng thân thì KHÔNG khai (trả false là chủ ý) |

Sau đó: «★ Ngoại hình nhân vật» (dựng lại set) → `Art > Fantasy — Vẽ LẠI toàn bộ đầu chủng tộc`
→ «★ Soát hồ sơ sinh vật» → xanh mới xong. Sân kiểm: `Genre_Fantasy_Civilizations` phải lộ chủng
mới (thêm vào nhà, hoặc quân đặc biệt của một màn).

Animation: **không có điểm nối riêng** — cùng rig, cùng `StickmanActionSet` Soldier (luật
[Fantasy](Fantasy.md): không ép Agile/Boss vì to/nhanh), `FantasyRaceMotion` tự đọc `wing`/`tail`
từ catalog để vỗ cánh/vẫy đuôi, `FantasyFlight` tự đọc `flies`. Thêm dáng riêng chỉ khi cơ chế
đòi (VD hét = `PlayAction(Cheer)`), và khai qua `StickmanActionType` có sẵn.

### 3. NHÂN VẬT ĐẶT TÊN — 4 điểm

| # | Điểm | File |
|---|---|---|
| 1 | hồ sơ ngoại hình `Pf("<Tên>", …)` + thẻ | `StickmanLookBuilder.Specs` (thời kỳ của nhân vật) |
| 2 | `StickmanArchetype` (loadout · AIProfile · ActionSet · `look`) | `StickmanArchetypeBuilder.Make(...)` |
| 3 | dáng riêng (nếu có) | `StickmanActionSetBuilder` — thêm một dòng `BuildSet(scale, speed, weighty)` |
| 4 | chỗ đứng | builder màn gọi `ApplyArchetypeShared`; `ScriptedUnit` đi đường `ApplyLookTo` (luật Appearance) |

Hồ sơ nhân vật áp **khoá** (`locked`) nên bộ bốc ngẫu nhiên của màn không đè.

### 4. Bẫy đã tính

- **Cơ chế gắn ở một cửa** (`FantasyRaceTactics.Start` → `EnsureBehaviour`): sáu chỗ sinh quái
  đều gắn Tactics, không chỗ nào phải nhớ gắn cơ chế. Đừng `AddComponent<FantasySlimeSplit>`
  ở builder.
- **Nhân bản chính mình** là ĐÚNG với slime (đời giảm dần, dừng ở 0) và là LỖI với lich (gọi
  lich đẻ lich). Khác nhau ở chỗ có `_generation` hay không.
- **Chủng bay** không có tính cách mặt đất — `Flies(kind)` chặn; đừng viết case cho nó rồi
  thắc mắc sao không chạy.
- **`FantasyJaw`/`FantasyTail` nối CUỐI** — enum serialize theo số.
- Bộ phận quái vẽ **trắng + xám + viền**, màu đổ lúc chạy — một tấm chân nhện dùng cho nhện
  đen, nhện đỏ, nhện băng.
