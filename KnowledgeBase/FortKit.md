# FortKit — thành luỹ LẮP GHÉP từ chi tiết nhỏ

Bộ khung dựng một toà thành (tường · tháp canh · cổng · cầu thang) từ CHI TIẾT rời, theo
SEED, tự kiểm luật, dùng chung cho scene bake (`Demo_26_Raid`) và map sinh lúc chạy
(`MapAssembler.BuildCamp` → `MapCastle.Build`). Thay cho bốn con số gõ tay của bản cũ.

## Bốn tầng, mỗi tầng một file

| Tầng | File | Vai |
|---|---|---|
| CHI TIẾT | `Assets/Scripts/Map/Fort/FortPieces.cs` | `FortPieceDef` (một dòng = một kiểu tường/tháp/cổng) + `FortPieceSet` (asset bake từ `DefaultPieces()`) |
| KẾ HOẠCH | `FortPlan.cs` | `FortPlanRequest` (đơn đặt hàng) · `FortPlan` (danh sách chi tiết đã đặt chỗ theo trục `s`) · `Validate()` — 9 luật hình học |
| XẾP | `FortPlanner.cs` | `Generate(request)` — bốc chi tiết theo seed, xếp NỐI TIẾP, tự BỎ BỚT cho vừa `maxReach` |
| LẮP | `FortAssembler.cs` | `Build(plan, …)` → `FortBuild` (toạ độ cổng, mặt tường, sàn gỗ, sân trong, mép ngoài) — gọi primitive của `MapCastle` |

Primitive runtime mới trong `MapCastle`: `BuildCastleWall` (N khúc + sàn gỗ một chiều + lối
đi đặc + cầu thang trong + post) · `BuildWatchtower` (thân đi xuyên, KHÔNG `Fortification`) ·
`BuildVillageGate` (hai cánh, `VillageGate`) · `BuildGate` (khối cổng vòm). `VillageGate.Setup`
nay chạy được lúc runtime.

## Trục `s` — vì sao không dùng x thẳng

Mọi vị trí trong kế hoạch là `s` = quãng tính từ ĐÌNH LÀNG **theo hướng địch**. Quy ra x bằng
`plan.ToX(s) = hallX + towardEnemy × s`. Nhờ vậy cùng một kế hoạch dựng cho thành quay trái
(`Demo_26`: địch bên −X) và quay phải (map sinh: trại bên trái, địch bên +X) mà planner không
có một dấu trừ nào.

## Bố cục — LUÔN theo thứ tự này

```
ĐÌNH ── sân trong ── [tháp trong] ── CỔNG ── sân ngoài (chân cầu thang) ── TƯỜNG + sàn gỗ ── [tháp ngoài] ── … địch
 s=0                                                    ↑ chỗ tiếp đất                ↑ thang công thành tựa vào đây
```

Ba luật không đổi (đều được `Validate()` đo):
1. **CỔNG là chốt chặn DUY NHẤT của làn.** Tường `passableForEveryone` (giá trị ở CAO ĐỘ:
   post bắn, cầu thang giành nhau, thang công thành), tháp thân trigger. Tường/tháp
   `hpScale = 0` = KHÔNG PHÁ ĐƯỢC — chỉ cổng và đình (user chốt 2026-09-04).
2. **TƯỜNG đứng NGOÀI cổng.** Thang công thành tựa mặt ngoài tường; sàn gỗ nhô ra là chỗ đặt
   chân; cầu thang mặt trong đổ xuống SÂN NGOÀI cách cổng ≥ `landingGap − 0.5`.
3. **Thang tháp không lọt vào khối đặc nào**, và tháp cách sàn gỗ `towerClearance`.

## Vừa chỗ — thứ tự nhượng bộ

Khi `outerEdgeS > maxReach`: bỏ tháp ngoài → sân trong co về min → bỏ khoảng tiếp đất thêm →
tường gọn hơn (theo `Footprint` = cầu thang + thân + sàn gỗ) → bỏ tháp trong → tiếp đất tối
thiểu. Mỗi bước ghi vào `plan.concessions` để tool in ra.

Số đo (đình → mép ngoài, cả hai tháp): `Wall_Low` 22.3 · `Wall_Standard` 24.2 ·
`Wall_High` 26.0 · `Wall_Double` 27.8 · `Wall_High_Double` 30.5 (thêm tới +5 khi sân trong
rộng nhất + tiếp đất dài nhất). `Demo_26` đặt đình ở 16 và giới hạn mép ngoài −14 ⇒ reach 30.

## Đã kiểm

- Vét cạn 1 800 tổ hợp (6 tường × 2 cổng × 5 tháp trong × 5 tháp ngoài × 2 sân × 3 tiếp đất)
  bằng bản mô phỏng Python cùng công thức: **0 vi phạm** hình học.
- Tool `Soi 90 tổ hợp` (30 seed × 3 cỡ) chạy `Validate()` rồi dựng 9 toà vào scene tạm và
  chạy `MapBuildRules.Validate` — bấm sau mỗi lần sửa bảng chi tiết hay planner.

## Thêm một kiểu chi tiết

Thêm MỘT phần tử vào `FortPieceSet.DefaultPieces()` rồi bấm *Bộ chi tiết thành lắp ghép*
(Bảng điều khiển › Thể loại & Map). Không sửa planner: nó bốc theo `kind` + `minSize` +
`weight`. Muốn một kiểu chỉ dùng khi gọi đích danh thì `weight = 0`.

Tường: `height` là bội số của `StepRise` 0.15 (10/13/16 bậc) — bề ngang suy từ art. Tháp:
`width` thân, `height` sàn, `ladderTowardEnemy` (mồi nhử). Cổng: `doubleLeaf` (VillageGate)
hay khối vòm (`width = 0` → suy từ `GateWidthFor(2.5)`).

## Tool

| Tool | Làm gì |
|---|---|
| **Xưởng dựng THÀNH lắp ghép** (`StickmanFortStudio`) | seed / cỡ / gọi đích danh → xây thử vào scene đang mở → kiểm luật → 💾 lưu `FortLayout_VillageRaid.asset` → Dựng lại `Demo_26_Raid` |
| Bộ chi tiết thành lắp ghép + bố cục làng | bake `FortPieceSet_Medieval.asset` + bảo đảm có layout (KHÔNG đè seed đã lưu) |
| Tủ kính chi tiết thành (`Demo_39_FortPieces`) | mọi chi tiết xếp một hàng có nhãn + một toà thành mẫu |
| Soi 90 tổ hợp thành ngẫu nhiên | kiểm hàng loạt, in bảng ra Console |

`Demo_26_Raid` đọc `FortLayout_VillageRaid.asset` — asset đó nằm trong `extraSources` của màn
nên đổi seed trong Xưởng là Bảng điều khiển báo màn cần dựng lại. Map runtime lấy seed = seed
ván ^ phe, `pieces` từ `MapLibrary.fortPieces`.

## Bẫy đã tránh (ghi lại để đừng dựng lại)

- **Chi tiết là DỮ LIỆU, không phải prefab.** Mỗi lần đặt phải đo lại theo x, chiều cao, phe, art
  nền — prefab đông cứng vẫn phải chạy đúng phần setup đó, và art thì `StructureSkin` khoác
  lúc chạy. Tủ kính `Demo_39` là chỗ nhìn từng chi tiết.
- **`FinishFort` gắn `MapObjective.Structure`** cho tường/cổng — vô hại ở màn không có
  `MatchDirector`, và đúng ở map runtime.
- `MapObjective.Attach` / `TeamMember.TeamId` an toàn trong edit mode (registry rỗng).
- **`StickmanStairs.All` KHÔNG điền trong edit mode** (OnEnable không chạy) — nên phần kiểm
  `MapBuildRules` trong Editor không thấy cầu thang qua registry; `FortPlan.Validate()` mới
  là chỗ kiểm chân cầu thang và khoảng cách tháp, `MapBuildRules` chỉ bắt thêm collider chắn làn
  + art lệch footprint.
