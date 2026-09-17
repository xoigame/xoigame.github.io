# MapKit — map LẮP GHÉP từ lô đất cho cả 7 kiểu chơi

Bản mở rộng của `FortKit` lên toàn bộ hệ map: một map = **DÃY LÔ ĐẤT** nối tiếp từ trái qua
phải (game đi ngang chỉ có một làn), mỗi lô là một mảnh ghép có nghĩa gameplay. Mục tiêu của
kiểu chơi là LÔ BẮT BUỘC, địa hình là LÔ LẤP nhét vào khoảng trống giữa chúng — nên địa hình
từ nay **biết mục tiêu nằm đâu**, không còn rải ngẫu nhiên rồi đặt mục tiêu đè lên.

Áp cho: 7 kiểu nhiệm vụ của hệ map (`Demo_29/30/31`, Xưởng xây map, MapStudio, map bake).
KHÔNG đụng các màn dựng tay (`Demo_13`, `Demo_23`, `Demo_26`…) — chúng có địa hình chỉnh
riêng; màn làng đã đi `FortKit`.

## Ba tầng, ba file (`Assets/Scripts/Map/`)

| Tầng | File | Vai |
|---|---|---|
| MẢNH | `MapKit.cs` — `MapLotDef` / `MapLotSet` | một dòng = một mảnh (thềm · đường trên · ụ che · hồ+cầu · vùng chiếm · chòi canh); asset `Assets/Settings/MapKit/MapLotSet_Default.asset` bake từ `DefaultLots()` |
| KẾ HOẠCH | `MapKit.cs` — `MapLot` / `MapKitPlan` / `MapKitRequest` | dãy lô theo x + `Validate()` (không chồng, trong mặt đất, đủ lô bắt buộc theo kiểu chơi, bậc thấp hơn tầm bước, mặt thềm ≥ 2, cấm hồ ở thủ trại/hộ tống/VIP) |
| XẾP | `MapKitPlanner.cs` | `FixedLots` (lô bắt buộc theo kiểu chơi) → `FillGaps` (lô lấp theo `Wishlist` kiểu chơi + kiểu địa hình) |

Dựng: `MapScenery.BuildWithKit` (hồ → pits → đất → nước/cầu → thềm/ụ/chòi vào đúng lô);
đặt mục tiêu: `MapAssembler` hỏi `layout.kit` (`BuildCamp` → lô trại, `BuildCaptureZones` → lô
vùng, `BuildDestination` → lô đích, `BuildArmy`/`CreateWaveSpawner`/`SpawnPlayer` → lô sinh
quân hoặc SÂN TRONG của thành khi phe có trại).

## Lô bắt buộc theo kiểu chơi (`FixedLots`)

| Kiểu chơi | Trái → phải |
|---|---|
| Diệt sạch | Sinh quân A · … · Sinh quân B |
| Thủ trại / Sinh tồn | **Trại A** (đình `−0.88hw`, thành vươn ≤ 26, chừa 8 đất trống) · … · Sinh quân B (cửa viện binh nằm trong lô) |
| Công trại | Sinh quân A · … · **Trại B** (gương) |
| Hộ tống / VIP | Sinh quân A (xe/VIP xuất phát sát mép nhà) · … · Sinh quân B (từ `0.55hw`, dừng trước đích) · **Đích** (`0.88hw − 2.5`) |
| Chiếm điểm | Sinh quân A · **n vùng chiếm rải đều** (vùng giữa lên THỀM nếu địa hình không phẳng) · Sinh quân B |

Bề rộng lô sinh quân = `quân × 1.5 + 2.5` kẹp [5, 14]. Quân xếp từ mép hướng-ra-giữa-sân lùi
dần về mép map; phe có thành xếp trong sân trong (giữa cổng và đình).

## Lô lấp theo kiểu chơi (`Wishlist`)

| Kiểu chơi | Muốn có |
|---|---|
| Diệt sạch | Đường trên (map ≥ 24, không phẳng) · thềm · ụ che · hồ · chòi canh (Fortress) |
| Thủ/Công trại | Đường trên (map ≥ 30) · 1–3 thềm · ≥ 2 ụ che · chòi canh (Fortress) — **không hồ** |
| Sinh tồn | 1–2 thềm · ụ che · chòi canh — không đường trên (map hẹp) |
| Hộ tống / VIP | 1–2 thềm THẤP · ≥ 2 ụ che · đường trên nếu map ≥ 36 — **không hồ** |
| Chiếm điểm | ụ che · tối đa 1 hồ (map ≥ 30) · chòi canh (Fortress) — thềm đã nằm trong vùng chiếm |

Kiểu địa hình: Flat cắt thềm còn 1 · Hills/Plateaus ≥ 2 thềm · Plateaus đẩy thềm ra HAI BÊN
(giữa trũng) · Fortress thêm chòi canh. Đường trên luôn xếp trước vào khoảng trống LỚN NHẤT.
Không vừa thì bỏ và ghi `plan.concessions`.

## Đã kiểm

- Mô phỏng Python lô bắt buộc qua toàn dải `MapBlueprint` (678 tổ hợp nửa rộng × quân số):
  0 chồng, 0 lọt mép; trại luôn chừa 8 đơn vị trước lô sinh quân địch.
- Tool *Soi 7 kiểu chơi × 20 seed*: kế hoạch `Validate()` cho 140 map + dựng 14 map vào scene
  tạm chạy `MapBuildRules` (bấm sau mỗi lần sửa bảng mảnh hay planner).

## Thêm mảnh / thêm kiểu chơi

- Mảnh mới: thêm dòng `MapLotSet.DefaultLots()` rồi bấm *Bộ mảnh ghép ĐỊA HÌNH* (Bảng điều
  khiển › Thể loại & Map). Thềm khai chiều cao bằng SỐ BẬC (`stepsRange`), trần 10.
- Kiểu chơi mới: một nhánh ở `FixedLots` (lô nào bắt buộc, ở đâu) + một nhánh ở `Wishlist`
  (lấp gì) + luật riêng ở `MapKitPlan.Validate`. Đừng sửa `FillGaps`.
- Tắt cho một map cụ thể: `MapDefinition.modularLayout = false` → quay về rải ngẫu nhiên cũ
  (`platformCount/coverCount/lakeCount`).

## Bẫy đã tránh

- **Hồ ở map trại / hộ tống là bẫy**: hồ là `pit` với mọi luật né vực; xe hàng/VIP không nhảy,
  quân thủ bị cắt khỏi đình. `Validate` cấm, `Wishlist` không xin.
- **Vùng chiếm trên thềm bán kính phải co theo mặt thềm** (`Clamp(deck/2 − 0.4, 1.4, 2.5)`),
  và vòng đặt ở `SurfaceY` — đặt ở mặt đất là đứng dưới chân thềm cũng chiếm được.
- **Lô sinh quân là đất phẳng**: cửa viện binh, điểm xuất phát, xe hàng đều nằm trong đó —
  thềm/hồ lọt vào là quân ra lò trên nóc hoặc dưới nước.
- **`MapStudio` đổi địa hình dưới màn đã bake**: `Layout.reserved` của màn được coi là lô
  `GiuCho` nên planner không xếp gì đè lên tường/lồng/điểm hồi sinh cũ.
