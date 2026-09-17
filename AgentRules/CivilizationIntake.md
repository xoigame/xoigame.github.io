# NHẬN NỀN VĂN MINH MỚI (2026-09-07)

User nói *"thêm nền Triều Tiên / Aztec / Xiêm…"* (hoặc gửi ảnh giáp trụ của một nền) → nền đó
vào game **ra trận được**: có đủ quân chủng, có nón/giáp/khiên riêng, có skin vũ khí, có công
trình, và chọn được ở ô chọn nền. Đây là nhánh NỀN VĂN MINH của dây chuyền nhận asset.

> Ba nhánh: [WeaponIntake.md](WeaponIntake.md) (vũ khí · khí tài) ·
> [StructureIntake.md](StructureIntake.md) (công trình) · **file này** (nền văn minh).
> Skill: `.claude/skills/stickman-intake/`.

⚠ **Đọc trước:** `Docs/KnowledgeBase/Civilizations.md`,
`Docs/KnowledgeBase/Archetypes-Visual-Identity.md`, [Appearance.md](Appearance.md),
[Equipment.md](Equipment.md). Đường dẫn tính từ gốc repo.

Hiện có **29** nền/lực lượng: 22 trung cổ (`Specs` — gồm ba nước Tam Quốc `Wei` · `Shu` ·
`Wu` thêm 2026-09-08, xem [ThreeKingdoms.md](ThreeKingdoms.md), ba nền CỔ ĐẠI `Sparta` ·
`Rome` · `Troy` và `Tribal` thêm 2026-09-09) + 7 hiện đại (`ModernSpecs`):
bốn LỰC LƯỢNG (Cảnh sát · Quân đội · Cướp · Khủng bố) và ba QUỐC GIA (`NorthPact` · `RedSand` ·
`GoldRidge` thêm 2026-09-08, xem [ModernFront.md](ModernFront.md)).

---

## 1. LUẬT NỀN MÓNG — đọc trước khi thiết kế

1. **THÂN STICKMAN LUÔN ĐEN.** Không nhuộm màu thân/đầu để phân biệt phe. Nhận diện đi qua
   **nón · giáp · khiên · vũ khí**, và trong bốn thứ đó **NÓN gánh nhiều nhất** — đó là lý do
   thiếu `CivilizationHelmetArt.Tones` là hỏng nặng chứ không phải thiếu một tấm hình.
2. **KHÔNG ĐẺ CÂY VŨ KHÍ RIÊNG CHO NỀN.** Nền chỉ chọn *cây nào* (chỉ số theo
   `StickmanWeaponBuilder.LeafWeaponPaths`) và *hình nào* (`Weapon_<Loại>.png` trong folder
   nền). Chỉ số của cây là chỉ số CHUNG — nền không đổi damage/nhịp của ai.
3. **MỖI NỀN CÓ ĐỦ BỘ**, không phải một cây cho mỗi vai. Tuyến cận chiến châu Âu có
   kiếm · thương · búa · kích · chuỳ · rìu, spawn ra là mỗi lính một cây.
4. **CẤM chỉ số 20 (`Weapon_Pistol`) ở nền TRUNG CỔ** — đó là súng lục bộ hiện đại. Trung cổ
   cần thuốc súng thì dùng `WMatchlock = 42`. Bảng vũ khí là bảng CHUNG nên sai chỗ này biên
   dịch sạch, chạy sạch, chỉ có người chơi nhìn ra lính thế kỷ 15 rút súng bán tự động.
5. **Nền hiện đại vào `ModernSpecs`** (`StickmanCivilizationBuilder.Modern.cs`) với
   `genre = GameGenre.Modern`, và phải khai `rank` TAY từng quân chủng — luật mặc định
   `Ranged → Levy` (đầu trần) đúng cho cung thủ, sai cho cả một lực lượng cầm súng.

---

## 2. ĐỌC YÊU CẦU RA BỘ SỐ

| Câu hỏi | Ra cái gì | Ghi vào |
|---|---|---|
| Nền này **đánh bằng gì** là chính? | 8–12 `UnitSpec` (vai · chỉ số vũ khí · máu · khiên · kỵ) | `Specs[].units` |
| Cái **nón** của nó nhìn ra ngay ở cỡ 40 px không? | `capApex` · `capHalf` · `capTop` (ball/spire/…) · `domeRx/Ry` · `cheek` · `skirt` · `crest` | `CivilizationHelmetArt.Tones` |
| Ba màu nhận diện? | `metal` · `cloth` · `accent` (nón) + `banner` (cờ) | `Tones` + `Specs[].banner` |
| Kỵ binh cưỡi **con gì**? | khoá trong bảng `Horses`: Horse · Destrier · Courser · Steppe · Camel · Elephant · Buffalo… | `Specs[].mount` |
| **Nhà chính** của nó dáng gì? | `Hall` · `Donjon` · `Longhouse` · `Pagoda` · `Terrace` · `Villa` | `StructureGrammar.KeepStyles` |
| Có dùng **khiên** không? | có `Shield*.png` trong folder hay không — **không có file = nền không dùng khiên** (VD Nhật) | folder art |

**Máu chuẩn theo vai:** `HpShield = 2` · `HpMelee = 3` · `HpRanged = 2`. Đừng bịa số mới —
lệch là phá luật "không ai chết bởi đúng một nhát damage cơ bản".

⚠ **Nền mới phải KHÁC ĐƯỢC ở cỡ 40 px.** Kiểm rẻ nhất: thu hình nón/giáp xuống 40 px rồi nhìn
cạnh nón của nền gần nhất. Giống nhau thì nền đó chỉ là một cái tên trong danh sách.

---

## 3. TÁM ĐIỂM NỐI

| # | Nối ở đâu | Quên thì hỏng thế nào |
|---|---|---|
| 1 | `StickmanCivilizationBuilder.Specs` (hoặc `.ModernSpecs`) — `key`·`displayName`·`note`·`banner`·`mount`·`units[]` | nền có art mà **không có lính nào** ra trận |
| 2 | Folder `Assets/Sprites/Civilizations/<Key>/` | bước dựng **QUÉT FOLDER** chứ không đọc bảng ⇒ nó **bỏ qua nền trong im lặng** |
| 3 | `CivilizationArtGenerator.CivKeys` + nhánh vẽ giáp/khiên | không sinh được art tạm, folder rỗng ⇒ quay lại lỗi số 2 |
| 4 | `CivilizationHelmetArt.Tones` — một `CivTone` | lính nền này **đội nón của nền khác** — mất luôn nhận diện |
| 5 | `StickmanBuildingArt.CivOrder` | tường · tháp · cổng · nhà của nền **không có bản riêng** |
| 6 | `StructureGrammar.KeepStyles` | nhà chính lặng lẽ rơi về **Đại sảnh châu Âu** |
| 7 | Asset `Assets/Settings/Civilizations/Civ_<Key>.asset` (+ `AppearanceSet_<Key>`) — **tool sinh**, không gõ tay | nền **không vào sổ** `CivilizationLibrary`: ô chọn nền, tủ kính, AI Lab, mọi builder đều không thấy |
| 8 | `mount` phải khớp khoá bảng `Horses` | kỵ binh nền đó lặng lẽ **cưỡi ngựa mặc định** — đã dính: `case "Arabia"` trong khi khoá thật là `"Arab"` |

### Hai móc nối THÊM (2026-09-09) — không bắt buộc, nhưng nền mới nên có

| # | Nối ở đâu | Quên thì hỏng thế nào |
|---|---|---|
| 9 | `CivSpec.doctrine` → `EnsureDoctrine` (`StickmanCivilizationBuilder.Doctrine.cs`) | nền mới **đánh y hệt mọi nền khác** — bảng quân chủng khác nhau mà lối đánh thì không |
| 10 | Hồ sơ `Civ_<Khoá>` trong `StickmanLookBuilder` (bộ theo THỜI KỲ) | lính nền mới **là dàn người y hệt nền cũ**, khác đúng mỗi cái nón |

⚠ Cả hai đều **CỤC BỘ**: không khai thì đường cũ chạy nguyên vẹn (`profile = null` ·
`TryGet` trả false). Đó là điều kiện để thêm nền mà không đụng 21 nền kia — đừng đổi
chúng thành "mặc định cho mọi nền".

⚠ **ANIMATION không có móc nối theo nền, và đó là chủ ý.** Animation đi theo CÂY VŨ KHÍ
(`AGENTS.md`: *giữ rig/AI/animation dùng chung*). Nền mới không mở cây nào thì mọi đòn
của nó đã có animation sẵn; đẻ bộ riêng là nuôi hai bộ song song.

**Tuỳ chọn:** `Docs/KnowledgeBase/Civilizations.md` (mô tả nền) ·
`WeaponArt-ChatGPT-Prompt.md` mục "15 nền" (đơn hàng art đẹp) · `StickmanGenreBuilder` nếu nền
mở thêm cây vũ khí mà thể loại đang chặn.

⚠ **Điểm 2 là cái bẫy tệ nhất:** bảng có tên nền, art generator có tên nền, nhưng nếu folder
chưa tồn tại thì bước «Build Civilization Assets» đi qua nó **không một dòng log**. Nền cứ thế
"có trong code" mà vĩnh viễn không ra trận.

---

## 4. CHỈ THÊM ART CHO NỀN ĐÃ CÓ

### WWII — chốt silhouette giáp (2026-09-11)

Khi intake gear cho năm nền WWII, phần `Armor_<Key>.png` phải là **một thân áo/tunic liền,
nhìn ngang +X**, có ngực/eo/tà áo cong để vẫn ra dáng áo tham khảo trung cổ. Không biến thành
khối chữ nhật cứng. Cấm cầu vai rời, tay áo/ống tay, bao tay, cổ tay, bàn tay, lỗ nách hoặc
armhole opening và mọi khoảng khoét; vai chỉ là mép dốc thuộc cùng một khối thân. Dùng prompt
chuẩn trong `stickman-assets` và để `WorldWarTwoArtBuilder` flood-fill alpha/cắt sprite.

Không phải lúc nào cũng là nền mới. User gửi ảnh giáp/nón/tường đẹp hơn cho một nền **đang có**
thì **không đụng bảng nào**:

- thả PNG vào `Assets/Sprites/Civilizations/<Key>/` theo quy ước tên:
  `Deco_*` (tóc/râu) · `Helm_*` (nón, nhiều cái = mỗi lính một cái) · `Armor*` (giáp ngực) ·
  `Shield*` (khiên) · `Weapon_<Loại>.png` (skin vũ khí, tên sau `_` phải khớp `WeaponType`);
- công trình theo nền: sheet 4 ô theo thứ tự `StickmanBuildingArt.Roles`
  = **Wall · Tower · Gate · House**;
- rồi bấm «★ 15 nền văn minh».

Scale/offset tool **tự đo từ rig** (`StickmanRigMetrics`) — PNG cỡ nào cũng được.
`StickmanArtSource` chặn ở tầng ghi file nên tấm bạn tự đặt **không tool nào đè**.

---

## 5. ĐO LẠI — bắt buộc

```
Tools > Stickman > ★ Bảng điều khiển
  1. Nhân vật > «★ 15 nền văn minh»            → sinh art thiếu + dựng asset + đổ vào sổ
  2. Nhân vật > «★ Soát hồ sơ nền văn minh»    → phải XANH (8 điểm × mọi nền)
  3. Rig & Kiểm tra > «★ KHÁM SỨC KHOẺ DỰ ÁN»  → không thêm mục đỏ mới
  4. Mở Demo_19_Civilizations                   → NHÌN THẬT, đổi nền bằng nút ◀ ▶
```

`StickmanCivilizationIntakeCheck` gom khoá từ **mọi nguồn** (bảng quân chủng · art · nón · công
trình · folder trên đĩa · asset) rồi hỏi ngược từng nguồn — cố ý **không** lấy một bảng làm
chuẩn, vì lấy `Specs` làm gốc thì nền có folder mà thiếu bảng sẽ không bao giờ bị nhìn thấy.

⚠ Sửa code xong thì asset và PNG **chưa tồn tại trên đĩa** — chúng chỉ sinh khi bấm nút.

---

## 6. ĐÃ ĐO

Lần chạy đầu 2026-09-07: **19/19 nền nối đủ tám điểm** (15 trung cổ + 4 lực lượng hiện đại),
sau khi `StructureGrammar` đổi `switch` thành bảng `KeepStyles` — bốn nền Âu · Thập tự · Hải
tặc · Lục lâm nay khai THẲNG `Hall` thay vì rơi vào nhánh `default`, để phép đo phân biệt được
"cố ý là Đại sảnh" với "quên khai".

Đợt 2026-09-08 (b): thêm **NorthPact · RedSand · GoldRidge** — ba quốc gia HIỆN ĐẠI. Nền hiện đại
đi đường ngắn hơn (phép đo bỏ ba câu nhón/art-người/công-trình trung cổ): `ModernSpecs` + `ModernKeys`
(art người **và** art công trình đều quét bảng này) + palette ở `StickmanBuildingArt.Modern` +
`StructureGrammar.KeepStyles` + hàm vẽ ở `ModernNationArt.cs` được `EnsureModernFactions` gọi.
**Chưa đo** — cũng chưa bấm được nút; «★ Soát hồ sơ» phải ra 25/25.

Đợt 2026-09-08: thêm **Wei · Shu · Wu** (Tam Quốc) qua đúng tám điểm (Specs · CivKeys · Tones ·
CivOrder · KeepStyles · mount `Destrier`/`Steppe`/`Horse`). **Chưa đo** — lúc nối Unity đang mở ở
phiên khác nên chưa bấm «★ 15 nền văn minh»; folder + asset của ba nước chỉ có sau khi bấm, và
«★ Soát hồ sơ» phải ra 22/22.

Đợt 2026-09-09: thêm **Sparta · Rome · Troy** (cổ đại Địa Trung Hải) qua đúng tám điểm — `Specs`
(nối CUỐI mảng) · `CivKeys` · `Tones` · `CivOrder` · `CivStyles` · `KeepStyles`
(`Terrace`/`Villa`/`Donjon`) · mount `Courser`/`Horse`/`Courser`. Art vẽ bù nằm ở hai file phần
`CivilizationHelmetArt.Antiquity.cs` và `CivilizationArtGenerator.Antiquity.cs`; nón đã render và
ĐO trước bằng `helm_antiquity.py` — vành rơi đúng hàng y≈124 (RimY = 118), tức mào/nanh không
cướp mất vành. **Chưa đo trong Unity**: folder `Sprites/Civilizations/Sparta|Rome|Troy/` và
asset `Civ_*.asset` chỉ sinh khi bấm nút; «★ Soát hồ sơ» phải ra 28/28.

⚠ Nét đáng nhớ của đợt này: ba nền cùng thời, cùng vùng, cùng họ "vòm kim loại + khiên" thì
**bảng quân chủng phải khác nhau về HÌNH DẠNG**, không chỉ khác tên lính. Sparta bỏ hẳn cung,
La Mã đổi cả tuyến cung lấy một cây nỏ giàn, Troy dồn bốn cây bắn — đó mới là ba nền; ba bảng
cùng hình dạng tô ba màu thì chỉ là một nền có ba cái tên.

Đợt 2026-09-09 (b): thêm **Tribal** (thổ dân — nền duy nhất không kim loại, không có quân
tinh nhuệ nào) và mở **hai móc nối 9 · 10** ở trên. Móc số 9 là một **ô chết đo được**:
`UnitLoadout.profile` khai từ lâu, builder chưa bao giờ ghi, `ApplyTo` chưa bao giờ đọc —
nên mọi nền đánh giống hệt nhau mà không lỗi nào báo. **Biên dịch 0 lỗi** ở cả bốn assembly
bị đụng (Editor · Units · Map · Gameplay); **chưa bấm nút trong Unity** nên art, folder,
`Civ_*.asset`, `AIProfile_Civ_*.asset` và `LookSet_Medieval` chưa sinh trên đĩa.

