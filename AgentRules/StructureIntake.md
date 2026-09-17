# NHẬN CÔNG TRÌNH TỪ ẢNH (2026-09-07)

User gửi **ảnh một công trình** → nó vào game dựng được, có máu (nếu cần), AI biết dùng, và
người làm map chọn được. Đây là nhánh CÔNG TRÌNH của dây chuyền nhận asset.

> Ba nhánh: [WeaponIntake.md](WeaponIntake.md) (vũ khí · khí tài) · **file này** (công trình) ·
> [CivilizationIntake.md](CivilizationIntake.md) (nền văn minh). Skill: `.claude/skills/stickman-intake/`.

⚠ **Đọc trước:** [StructureKit.md](StructureKit.md), [Fortifications.md](Fortifications.md),
[FortKit.md](FortKit.md), [EnvironmentArt.md](EnvironmentArt.md).

---

## 1. RẼ NHÁNH — bốn thứ khác nhau cùng gọi là "công trình"

Nhìn ảnh và hỏi theo thứ tự. **Dừng ở câu ĐẦU TIÊN trả lời "có"**.

| Hỏi | Nó là | Đi mục |
|---|---|---|
| Người chơi **đánh vỡ được** nó, hoặc nó **chặn đường / cho đứng bắn**? (tường · cổng · tháp · chốt · máy công thành) | **CÔNG SỰ** — `Fortification` | mục 5 |
| Nó là **một CĂN NHÀ kiểu mới** (lò rèn, quán rượu, nhà tắm, chùa…)? | **VAI NHÀ** — `BuildingRole` | mục 2 → 3 |
| Nó là **một MẢNH** dùng chung cho nhiều nhà (kiểu mái, kiểu cửa sổ, ban công, đầu cột)? | **CHI TIẾT** — `StructurePartDef` | mục 4 |
| Nó là **bản riêng của một nền văn minh** cho tường/tháp/cổng/nhà đã có? | **ART THEO NỀN** | [CivilizationIntake.md](CivilizationIntake.md) mục 4 |

⚠ **ĐỪNG THÊM `BuildingRole` KHI CHỈ CẦN MỘT CHI TIẾT.** Vai là một *câu hỏi gameplay*
("công trình này để làm gì trên bản đồ"), không phải một cái hình. Một mái chóp mới, một kiểu
cửa sổ mới thì thêm **chi tiết** — số kiểu nhà là **TÍCH** của các ô chi tiết, nên một chi
tiết mới làm giàu cho **mọi** vai, còn một vai mới chỉ làm giàu cho chính nó.

---

## 2. ĐỌC ẢNH RA SỐ — bảng tra

Vai nhà = một `HouseStyle` trong `StructureGrammar.StyleFor`. Mỗi nét trên ảnh ra một trường:

| Nhìn thấy trên ảnh | Suy ra | Trường |
|---|---|---|
| nhà dài, bè ngang | `width` 1.2–1.5 | `width` |
| nhà hẹp mà cao | `width` 0.7–0.9 + `minFloors` ≥ 2 | `width` · `minFloors` |
| có sàn/lan can trên nóc để đứng | `deck = true` — **vai DUY NHẤT có cao độ là `Watch`**, thêm cái thứ hai là đổi thế trận của mọi map | `deck` |
| ống khói | `chimney = true` | `chimney` |
| cánh phụ thấp bên hông | `annex = true` | `annex` |
| tường đá dày, không cửa sổ | `windows = false`, `health` cao | `windows` · `health` |
| một món đồ nói ra "nhà này làm gì" (đe rèn, thùng rượu, bao lương) | **BẮT BUỘC** — đó là thứ người chơi đọc ra vai, không phải cái mái | `signature` + `signatureModern` |
| biển hiệu / đồ treo mặt tiền | `deco` | `deco` |

**Ba ràng buộc không được phá:**

1. **`signature` là bắt buộc.** Không có món đặc trưng thì vai mới chỉ là nhà dân đổi bề ngang —
   người chơi không đọc ra được, và cái vai đó không đáng tồn tại.
2. **`signatureModern` cũng bắt buộc** nếu vai có mặt ở thời hiện đại, không thì map hiện đại
   ra một cái đe rèn giữa khu công nghiệp.
3. **Chỉ `Watch` có `deck`.** Sàn nóc = một suất đứng bắn = đổi thế trận; thêm vai thứ hai có
   sàn là phải xem lại `GarrisonPost` và luật AI leo cao.

---

## 3. VAI NHÀ MỚI — bảy điểm nối

| # | Nối ở đâu | Quên thì hỏng thế nào |
|---|---|---|
| 1 | `Assets/Scripts/Map/Structure/StructureParts.cs` — `BuildingRole` (nối vào **CUỐI**) | chèn giữa là mọi map đã lưu đọc sai vai |
| 2 | `StructurePartSet.DefaultParts()` — ít nhất một chi tiết khai `role = <vai>` cho **cả hai** `PartEra` | **vai chỉ còn cái TÊN**: nhà dựng ra bằng bộ chung, trông y hệt nhà dân |
| 3 | `StructureGrammar.StyleFor` — một `case` khai `HouseStyle` | mượn luôn dáng mặc định (1..2 tầng, ống khói, cửa sổ) |
| 4 | `StickmanStructureArt.GenerateAll` — một hàm vẽ cho mỗi sprite mới | mục «Vẽ bù art» ĐỎ; Doctor «Chi tiết công trình trỏ vào art KHÔNG CÓ» réo |
| 5 | `MapStudio.BuildingRoles` + `RoleName` + `RoleHint` | dựng được bằng code nhưng người làm map **không bao giờ chọn tới** |
| 6 | `MapScenery` / `CampStructureArtist` — chỗ THẢ nó xuống map | vai có đủ mọi thứ mà không map nào có nó |
| 7 | Luật (file này) + `Docs/ProjectMap/index.html` mục 17 | hôm sau không ai tra lại được |

⚠⚠ **VÌ SAO ĐIỂM 2 LÀ CÁI BẪY TỆ NHẤT DỰ ÁN:** `StructureAssembler` **không bao giờ dựng ra
khoảng trống**. Thiếu chi tiết thì nó bốc chi tiết của bộ chung (`BuildingRole.Any`) và vẫn ra
một căn nhà đứng vững, có collider, có máu. Không log, không lỗi, không khoảng trống trên màn
hình — chỉ là căn nhà đó *trông y hệt nhà dân*, và chuyện đó chỉ lộ ra khi có người ngồi so
hai căn cạnh nhau.

---

## 4. CHI TIẾT MỚI (`StructurePartDef`) — ba điểm nối

1. Một dòng trong `StructurePartSet.DefaultParts()`: `key` · `kind` · `slot` · `era` · `role`
   (để `Any` nếu dùng chung) · `width`/`height` **theo world** (PPU 100 ⇒ 1.0 = 100 px) ·
   `collision` · `sprite` · `weight`.
2. Một hàm vẽ trong `StickmanStructureArt.GenerateAll` đúng tên `sprite`.
3. Không cần nối gì thêm — `AllSpriteNames` đọc thẳng từ `DefaultSpriteNames()`, nên tấm còn
   thiếu tự vào bảng đòi art.

**Cỡ phải đúng ô cắm**, không thì văn phạm ghép ra nhà hở: thân tháp 1.0×1.0 (LẶP) · sàn rộng
hơn thân 1.0 · lan can cao 0.6 (dưới tầm mắt stickman 0.73) · mái ngồi cao ≥ 1.0 trên sàn.

---

## 5. CÔNG SỰ (`Fortification`) — có máu, AI đánh được

Khác nhánh trên hoàn toàn: đây là công trình **tham gia trận đánh**.

| # | Nối ở đâu |
|---|---|
| 1 | Lớp con của `Fortification` (hoặc dùng lại `SiegeEngine` / `SiegeLadder` / `VillageGate`) — **chỉ khi** không lớp nào đang trả lời cùng câu hỏi |
| 2 | `StickmanFortBuilder` — hàm dựng + bộ số (máu · bề ngang · chỗ đứng) |
| 3 | `StickmanBuildingArt` — hàm vẽ + tên trong bảng kiểm của `EnsureAll` |
| 4 | `GarrisonPost` nếu có chỗ đứng bắn; `StickmanClimbZone` nếu trèo được |
| 5 | Một builder màn đặt nó xuống, không thì cả dự án không map nào có |
| 6 | `AIProfile` / `StickmanAgent` nếu AI phải **ưu tiên** đánh nó |

⚠ **Art không được nói ngược lại cơ chế.** Bánh xe = di động; chân chống = cố định; tời to =
nạp chậm. Đã dính: mái chóp tháp vẽ như tháp canh trong khi cơ chế là `GarrisonPost`, và tay
quay 15 px của nỏ cố định đọc ra thành "bánh xe" — tức nói ngược lại chữ *cố định* trong chính
tên cỗ máy.

---

## 6. ĐO LẠI — bắt buộc

```
Tools > Stickman > ★ Bảng điều khiển > Thể loại & Map > «★ Soát hồ sơ công trình (vai nhà nối đủ chưa)»
```

`StickmanStructureIntakeCheck` hỏi cho **mọi** `BuildingRole`: có chi tiết riêng chưa · có dáng
riêng chưa · đủ cả trung cổ lẫn hiện đại chưa · người làm map chọn tới được chưa. Nó cũng nằm
trong `StickmanDoctor`.

Rồi: «Art chi tiết công trình lắp ghép (vẽ bù)» → «★ KHÁM SỨC KHOẺ DỰ ÁN» → mở
`Demo_StructureKit` (tủ kính) **nhìn thật**.

⚠ Sửa code xong thì sprite **chưa tồn tại trên đĩa** — chúng chỉ sinh khi có người bấm nút.

---

## 7. ĐANG NỢ (phép đo báo, chưa sửa)

Lần chạy đầu 2026-09-07 báo ba vai có chi tiết trung cổ mà **không có bản hiện đại** —
`Smith` · `Workshop` · `Tavern`. Ở map hiện đại chúng lặng lẽ dựng bằng bộ chung. Không phải lỗi
mới; phép đo chỉ vừa làm nó **nhìn thấy được**. Sửa = thêm dòng `era = PartEra.Modern` tương ứng
vào `StructurePartSet.DefaultParts()` (xưởng cơ khí · kho hàng · quán bar).
