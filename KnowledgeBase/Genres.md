# Ba thể loại — Trung cổ · Hiện đại · Fantasy

> Code: `GenreDefinition` + `MapTheme` (runtime) · `StickmanGenreBuilder` +
> `StickmanGenreSceneBuilder` + các builder Văn minh Modern/Fantasy + `StickmanMapBuilder` (editor)
> Menu: `Tools > Stickman > Genres` · 11 scene test: `Genre_<TheLoai>_<Bai>`

Dự án dựng **ba game khác nhau trên CÙNG một bộ rig / AI / animation**. Thể loại là trục
phân chia CAO NHẤT — cao hơn cả vũ khí và chế độ chơi.

| | Trung cổ | Hiện đại | Fantasy |
|---|---|---|---|
| **Vũ khí** | kiếm · giáo · cung · khiên (18 cây) | súng lục → phóng lựu (10 cây) | trượng · đũa phép (6 cây + 4 mượn) |
| **Tài nguyên chặn** | cooldown | đạn + cooldown | **MANA + niệm chú** |
| **Nhịp trận** | đội hình, tầm với | tầm nhìn, vật che | chọn lúc tiêu mana |
| **Bộ AI (playbook)** | `FieldBattle` · `Siege` | `Shooter` | `Arcane` |
| **Khoác áo cho phe** | `CivilizationTeamAssigner` | `ModernFactionLook` | `FantasyRaceTeamAssigner` |
| **Tiếp tế** | `AmmoCache` | `AmmoCache` | `ManaFont` |
| **Nền map** | núi | nhà cao tầng | cột đá |
| **Bài test riêng** | Weapons · Battle · Siege | Weapons · Firefight · Cover · Văn minh | Spells · Battle · Duel · Văn minh |
| **Nhiệm vụ chung** | giao chiến · thủ/công trại · VIP · hộ tống · chiếm điểm · sinh tồn | cùng 7 nhiệm vụ, map + đội súng riêng | cùng 7 nhiệm vụ, map + đội phép riêng |

## 1. Luật module: THÊM THỂ LOẠI KHÔNG ĐƯỢC SỬA CODE CŨ

Đây là ràng buộc thiết kế của cả tầng này. Thêm thể loại thứ tư chỉ cần:

1. thêm 1 giá trị trong `enum GameGenre`
2. thêm 1 phần tử trong `StickmanGenreBuilder.Specs`
3. (nếu có vũ khí kiểu mới) thêm 1 file `Stickman<Ten>WeaponBuilder.cs` — **partial class**,
   không mở file cũ ra sửa

KHÔNG phải đụng vào: rig, `StickmanAgent`, hệ animation, `StickmanWeaponHolder`, hệ effect.

`GenreDefinition` chỉ **TRỎ** vào asset sẵn có (vũ khí, archetype, map theme, danh sách scene)
— nó không chứa logic. Đó là lý do nó an toàn để mở rộng.

## 2. Ba tầng, mỗi tầng một việc

```
GenreDefinition  (asset)   — thể loại này GỒM những gì
      ↓ trỏ vào
MapTheme         (asset)   — màu trời/đất, dáng nền xa, vật trang trí
WeaponType[]               — bộ lọc trên bảng vũ khí DÙNG CHUNG
      ↓ đọc bởi
StickmanGenreSceneBuilder  — dựng 9 bài khung chung + gọi hai builder Văn minh
StickmanModernCivilizationBuilder — dựng sân Liên quân / Đột kích / Dân quân riêng
StickmanFantasyCivilizationBuilder — dựng sân Tiên / Orc / Quái vật riêng
StickmanMapBuilder         — dựng bối cảnh từ MapTheme
```

**Vũ khí KHÔNG bị chia theo thể loại ở tầng prefab** — vẫn một bảng `LeafWeaponPaths` duy
nhất, `GenreDefinition.weapons` chỉ là bộ LỌC. Nhờ vậy một cây dùng cho nhiều thể loại là
chuyện bình thường (dao găm có ở cả trung cổ lẫn hiện đại; fantasy mượn kiếm/khiên/cung làm
lính thịt), và cân bằng vẫn đo trên một thang chung.

## 3. Nhánh vũ khí thứ tư: PHÉP THUẬT

`MagicWeapon` là nhánh thứ tư bên cạnh `RangedWeapon` / `MeleeWeapon` / `ThrowableWeapon`.

**Vì sao không dùng lại `RangedWeapon`:** cung/súng bị chặn bởi ĐẠN và COOLDOWN, pháp sư bị
chặn bởi **MANA + THỜI GIAN NIỆM CHÚ**. Hai tài nguyên đó tạo nhịp chiến đấu khác hẳn. Nhồi
vào `RangedWeapon` thì mọi cung thủ đều phải mang theo field mana vô dụng.

Ba thứ bài phép có mà mũi tên không có:

| Cơ chế | Field | Ý nghĩa gameplay |
|---|---|---|
| Mana | `_manaCost` / `_maxMana` / `_manaRegenPerSecond` | bắn tới lúc cạn thì phải chờ — không bắn vô hạn |
| Niệm chú | `_castTime` + `_interruptOnDamage` | **trúng đòn giữa lúc niệm = VỠ BÀI** (mất mana, không ra phép) |
| Phép hỗ trợ | `_supportSpell` | nhắm vào ĐỒNG ĐỘI (hồi máu) chứ không nhắm địch |

**`_interruptOnDamage` chính là cách cân bằng thể loại này.** Không có nó thì pháp sư đứng xa
bắn thoải mái, cận chiến không có cửa. Có nó thì luật kéo-búa-bao thành thật: áp sát được
pháp sư là nó không niệm nổi bài nào — đúng tinh thần mục 7b của `AGENTS.md`.

### Sáu cây phép

| Cây | Đặc điểm | Mana | Niệm |
|---|---|---|---|
| **Đũa phép** | vũ khí NỀN: rẻ, nhanh, yếu. 1 tay → cầm kèm khiên được | 8 | 0.18s |
| **Trượng lửa** | cầu lửa NỔ DIỆN RỘNG (bán kính 1.7) — dọn cả cụm | 32 | 0.6s |
| **Trượng băng** | yếu nhất nhưng ĐẨY LÙI, mở đường cho đồng đội áp sát | 14 | 0.3s |
| **Trượng sét** | 3 tia toè ra, mỗi tia XUYÊN 3 mục tiêu — dọn hàng ngang | 26 | 0.45s |
| **Trượng thánh** | KHÔNG đánh, chỉ HỒI MÁU đồng đội thương nặng nhất | 30 | 0.7s |
| **Trượng tử linh** | HÚT MÁU 50% sát thương — bù cho pháp sư máu giấy | 20 | 0.4s |

Đạn phép đều `gravityScale = 0` (bay THẲNG, khác mũi tên có độ rơi) nên
`CasterCombatStrategy` không phải bù độ cao khi ngắm.

## 4. AI: `CasterCombatStrategy`

Chọn tự động theo `WeaponCategory.Magic` trong `StickmanAgent.CurrentStrategy` — cầm trượng
lên là NPC tự đổi lối đánh, y như mọi vũ khí khác.

Ba điểm khác `RangedCombatStrategy` từ đầu:

1. **Cạn mana thì GIÃN RA XA** — `MinRange` tự nới lên `MaxRange × 0.95` khi hết mana, nên
   vòng giữ tầm của agent tự đẩy pháp sư lùi ra chờ hồi. (Không có hook `ShouldRetreat`
   trong `CombatStrategyBase`, nên diễn đạt ý đó bằng đúng thứ base đã có — đừng bịa hook mới.)
2. **Đang niệm thì không chồng bài** — `ShouldAttack` trả false khi `IsCasting`.
3. **Phép hỗ trợ không cần địch trong tầm** — trượng thánh cứ đủ mana là hồi cho đồng đội.

### Ba vế bổ sung (2026-09-08) — đều là *"hai thể loại kia đã có, Fantasy thiếu"*

**4a. NÚP ĐỂ NIỆM.** Pháp sư là lối đánh tầm xa DUY NHẤT không biết vật che, trong khi nó là
lối cần nhất: tay súng trúng một viên thì mất máu, pháp sư trúng một mũi tên giữa lúc niệm thì
**VỠ BÀI** — mất sạch mana đã trừ và không có gì bay ra. Cả tuyến phép đứng giữa sân trống đọc
bài rồi bị ngắt hết bài này tới bài khác; không lỗi nào báo, chỉ nhìn ra *"pháp sư chả bao giờ
ra được phép"*.

Bảng chấm điểm chỗ nấp được tách khỏi `RangedCombatStrategy` sang **`CoverTactics`** (sổ xí
phần · chấm điểm · cỡ vật che) để hai thể loại dùng CHUNG một phép chọn. Phần ở lại bên tay
súng là thứ nói về SÚNG: nhịp ngồi/nằm, áp chế, vé tiến theo cặp. Pháp sư tới nơi thì chỉ ĐỨNG
YÊN — niệm chú đòi đứng yên, mà nhích qua lại kiểu strafe thì bài nào cũng chậm thêm một nhịp.

Cổng bật: `AIProfile.coverSeekRadius > 0` — cùng cổng của tay súng, profile cũ (bằng 0) giữ
nguyên hành vi.

**4b. KHÔNG MỞ BÀI DÀI KHI SẮP BỊ CẮT.** Luật `_interruptOnDamage` có từ đầu, nhưng AI KHÔNG
BIẾT nó tồn tại: thấy địch trong tầm là mở bài, kể cả khi một tay orc đang chạy tới cách 2 đơn
vị. Bài 0.6 s + orc chạy 3.9/s ⇒ nó tới trước khi bài xong, mana đổ xuống đất. Lặp cả trận thì
đọc ra *"pháp sư vô dụng"*, còn bảng số thì mọi con số đều đúng.

Nay pháp sư đo trước bằng bán kính `castTime × 3.9 + 1.0` và chỉ tính địch CẬN CHIẾN còn sống.
Có kẻ trong đó thì nhịn bài — `ManaSpacing` vẫn đẩy nó lùi, nên cái nó làm thay là RÚT RA chờ
khoảng thở. Đó chính là thế kéo-búa-bao: áp sát được pháp sư là nó câm.

⚠ KHÔNG áp cho bài niệm nhanh (`castTime < 0.25`, tức đũa phép 0.18 s) và cây không vỡ bài —
chúng là lối thoát của pháp sư lúc bị dí, chặn luôn thì hết đường đánh trả.

**4c. CẠN MANA THÌ VỀ MẠCH.** `ManaFont` + `AIManaWellModule` (`AIModuleKind.ManaWell`) — bản
Fantasy của giỏ tiếp đạn. Xem mục 4d.

### 4d. `ManaFont` — vì sao KHÔNG dùng lại `AmmoCache`

Trượng khai `UsesAmmo = false` (mana không phải đạn), nên `AmmoCache.NeedsRefill` không bao giờ
thấy pháp sư cần gì; ngược lại nếu nhập hai đường thì `AIResupplyModule` lôi cả cung thủ về
đứng cạnh mạch mana. Hai tài nguyên, hai đường tiếp tế.

Khác giỏ tên ở một điểm THIẾT KẾ: mạch mana **rót liên tục theo giây** (55/s, so với
`_manaRegenPerSecond` 12–16/s của trượng) thay vì "đứng đủ 1.1 s rồi đầy một phát" — mana vốn là
thanh liên tục, nên pháp sư tự quyết *"đủ cho một bài rồi, chạy ra đánh tiếp"*, và quyết định đó
chính là phần chơi được.

Thứ tự quyết định của module: còn đủ mana cho một bài → ở lại đánh · địch dí sát → đừng chạy ·
có mạch trong `resupplyRange` → đi nạp · không có mạch → không làm gì (vẫn tự hồi như cũ).
⚠ Cố ý KHÔNG bắt chước `SwitchAwayFromEmpty` của tiếp tế đạn: đổi trượng lấy kiếm là mất luôn
vai pháp sư, mà chỉ để chờ vài giây.

### 4e. `Playbook_Arcane` — bộ AI của thể loại

Trước 2026-09-08, cả ba bài Fantasy gắn `Playbook_FieldBattle`: một bộ khai `genre = Medieval`
phát tính cách CUNG THỦ (`CanTrong`) cho pháp sư. Ba thứ lặng lẽ sai, không cái nào báo lỗi:

| Hậu quả | Vì sao |
|---|---|
| pháp sư không bao giờ tìm vật che | `coverSeekRadius = 0` |
| cạn mana thì đứng chờ, không về mạch | playbook không có module `ManaWell` |
| cứ 3 s bế tắc là pháp sư XÔNG LÊN cận chiến | `stalemateTimeout` mặc định, và `IsCharging` tắt luôn hệ bám vật che |

`AIProfile_PhapSu` tắt `stalemateTimeout`, đặt `coverSeekRadius = 9`, `coverProneBelowBodyFraction = 0`
(pháp sư KHÔNG nằm — nằm là không niệm được), `rangedSteadyAimTime = 0.12` (để cao thì "chắc
tay" cộng dồn với thời gian niệm thành cả giây bất động, người xem đọc ra là "đơ").
Tuyến thịt vẫn dùng `guardian`/`berserk` như trung cổ — điều đó ĐÚNG: lùn cầm khiên và orc
xung phong đánh y hệt bộ binh, cái khác nằm ở tuyến sau.

### 4f. DÁNG NIỆM CHÚ — `WeaponBase.IsChanneling`

`_castTime` bắt pháp sư đứng yên 0.18–0.7 s mỗi bài, mà THÂN NGƯỜI trước nay giữ nguyên dáng
nghỉ: người xem thấy quả cầu lửa tự bay ra, còn trượng thánh (0.7 s, không có gì bay ra) thì
nhìn ra đúng *"pháp sư đứng đơ rồi đồng đội tự đầy máu"*.

Nguyên nhân: `StickmanWeaponHolder` chỉ biết hỏi `RangedWeapon.IsReloading`. Nay đó là một câu
hỏi CHUNG — `WeaponBase.IsChanneling` / `ChannelPose` — nên súng nạp băng và trượng niệm chú đi
cùng một đường, và cây thứ năm sau này tự có dáng.

- Đang niệm: base pose nội suy nghỉ → **giơ trượng** theo `CastProgress` (SmoothStep).
  Giơ càng cao = bài càng sắp ra ⇒ địch đọc được lúc nào đáng lao vào cắt. Bỏ dáng đi là luật
  vỡ bài mất nửa còn lại của nó.
- Bài rời tay: cú **ĐẨY PHÉP** qua `Animator.PlayAttack` (như độ giật của súng) để thân và chân
  vào tấn theo — chỉ đổi cổ tay thì cú phóng không có lực.
- ⚠ Tắt cờ `_isCasting` TRƯỚC khi gọi `PlayAttack`: `ApplyChannelPose` ghi base pose MỖI FRAME
  khi `IsChanneling`, nên gọi lúc cờ còn bật là hai bên tranh nhau dáng tay và cú đẩy chỉ giật
  một cái rồi biến mất.
- `_windupPose` / `_strikePose` đã được `StickmanMagicWeaponBuilder.SetMagicPoses` ghi từ lâu —
  nhưng `MagicWeapon` KHÔNG có hai field đó, nên mỗi lần dựng vũ khí là 12 dòng cảnh báo
  "không tìm thấy field" và không ai để ý. Nay hai field tồn tại và bộ số cũ được dùng đúng ý.

### 4g. HÌNH HÀI CHÍN CHỦNG PHẢI ĐI QUA MỘT CỬA

`FantasyRaceTeamAssigner` (bản Fantasy của `CivilizationTeamAssigner`) + bảng nhà `FantasyHouses`
(một nguồn, sân Văn minh đọc tên/ghi chú từ đó). Builder gọi
`StickmanDemoBuilder.AddFantasyRaceAssignerShared(...)`.

⚠ Trước đó bộ art chín chủng chỉ được gắn ở ĐÚNG MỘT bài test; mọi scene Fantasy khác — giá
phép, pháp sư giao chiến, tay đôi, 7 nhiệm vụ map — ra trận bằng stickman ĐEN TRƠN cầm trượng.
Cùng bài học với art 15 nền văn minh ở `Genre_Medieval_Battle`.

⚠ Quân sinh GIỮA TRẬN đi qua hook `CivilizationTeamAssigner.Dressing`: `Dress` là NÚT THẮT mà
mười đường sinh quân đã đi qua, còn Units thì KHÔNG tham chiếu lên Gameplay được. Thêm một dòng
vào cả mười chỗ gọi là kiểu gì cũng sót một, mà sót thì giữa trận một phe có hai kiểu lính.

⚠ Chủng chọn theo `UnitRole`, không bốc ngẫu nhiên: khiên/cận chiến = tuyến trước
(lùn · orc · skeleton), tầm xa/hỗ trợ = tuyến sau (tiên · goblin · quỷ). Hình và hành vi phải
nói cùng một câu — bốc ngẫu nhiên thì có trận troll đi làm pháp sư.

Hai phép đo canh hai bẫy trên nằm ở `StickmanDoctor`: *"Màn Fantasy mà cả sân là stickman ĐEN
TRƠN"* và *"Màn Fantasy có pháp sư mà thiếu MẠCH MANA"*.

## 5. Xây map: `MapTheme` + `StickmanMapBuilder`

Trước đây mỗi tool dựng scene tự vẽ đất + tự chọn màu → đổi tông một thể loại phải sửa 6 chỗ.
Nay đổi tông là **đổi asset**, không mở code.

Ba dáng nền xa dựng bằng chính `Square.png`, không cần art mới:
`Mountains` (bậc thang tam giác) · `Skyline` (khối hộp) · `Spires` (cột đá hẹp cao).
Lớp càng xa càng nhạt dần về phía màu trời — mẹo aerial perspective, rẻ hơn parallax thật.

### ⚠ Hai bẫy đã dính

**1. ĐẤT CHỒNG ĐẤT.** `StickmanDemoBuilder.NewScene` ĐÃ gọi `CreateGround` + tạo
`ProjectilePoolManager` + `EffectManager`. Gọi thêm `StickmanMapBuilder.Build` là dựng đất
lần hai: hai `BoxCollider2D` trùng nhau, nhân vật nảy ở mép và tia dò vực đọc sai.
→ Scene đã có đất thì gọi **`Decorate`**, không gọi `Build`.

**2. CATALOG BỊ RESET.** `Prepare()` gọi `EnsureCatalog()`, mà hàm đó **ghi đè** catalog bằng
danh sách gốc. Dựng lẻ 1 scene rồi chỉ đăng ký 1 entry là các bài còn lại biến mất khỏi ô chọn.
→ `RegisterAll()` quét lại **cả 9 bài dùng chung theo file .unity có thật**; Văn minh Fantasy
được builder riêng tự đăng ký sau khi dựng.

Rải nền xa và vật trang trí đều dùng `Mathf.PerlinNoise` theo toạ độ / chỉ số —
**tất định**, chạy lại tool ra đúng map cũ, để so sánh ảnh chụp được.

## 6. Mười một bài test — mỗi bài soi MỘT thứ

| Scene | Soi cái gì |
|---|---|
| `Genre_Medieval_Weapons` | dáng cầm + combo chém/đâm từng cây |
| `Genre_Medieval_Battle` | đội hình 2 tuyến + chỉ huy phân cấp |
| `Genre_Medieval_Siege` | AI vượt tường, giữ tuyến khi thủ |
| `Genre_Modern_Weapons` | 6 loại súng, kiểu ngắm |
| `Genre_Modern_Firefight` | mỗi loại súng tự chọn cự ly nào |
| `Genre_Modern_Cover` | AI có biết dùng vật che không |
| `Genre_Modern_Civilizations` | đổi từng phe giữa Liên quân · Đột kích · Dân quân |
| `Genre_Fantasy_Spells` | thanh mana, 6 bài phép · **ba cự ly biết trước · ba loại vật che · một con bia BIẾT XÔNG VÀO để thấy vỡ bài · mạch mana** |
| `Genre_Fantasy_Battle` | **pháp sư có đứng đúng chỗ không + niệm chú có bị cắt không** · tháp căn cứ · đại pháp sư chỉ huy · ba tuyến vật che · mạch mana mỗi phe |
| `Genre_Fantasy_Duel` | 1v1 soi rõ cơ chế mana (hút máu vs làm chậm) |
| `Genre_Fantasy_Civilizations` | đổi từng phe giữa Liên minh Tiên · Bộ tộc Orc · Quái vật |

Bài quan trọng nhất là `Genre_Fantasy_Battle`: nếu pháp sư xông lên tuyến đầu hoặc lùi quá xa
không tới được, lỗi nằm ở `CasterCombatStrategy`, không phải ở `MagicWeapon`.

### Văn minh Hiện đại: lực lượng chiến đấu, không phải quốc gia bị tô màu

`Genre_Modern_Civilizations` giữ thân stickman đen và dùng mũ/visor/armband rời để đọc lực
lượng. Khác biệt chính vẫn là **loadout súng**, nên dùng nguyên chiến lược AI theo `WeaponCategory`:

| Lực lượng | Loadout | Câu hỏi khi test |
|---|---|---|
| **Liên quân Kỷ luật** | khiên · súng trường · bắn tỉa | giữ được tầm trung và bắn tỉa có khoảng trống không? |
| **Đội Đột kích** | tiểu liên · súng săn · phóng lựu | có áp sát hoặc ép địch rời chỗ nấp không? |
| **Dân quân Thành thị** | súng nhẹ, ít máu | giữ được tầm thì bắn dai, bị ép gần có vỡ nhanh không? |

### Văn minh Fantasy không phải văn minh Trung cổ đổi nhãn

`Genre_Fantasy_Civilizations` không dùng `CivilizationDefinition`: asset đó mô tả nón, giáp và
skin vũ khí lịch sử, nên đưa Orc vào đó sẽ làm scene Trung cổ có thể bốc ra quái. Sân Fantasy
dùng chung `StickmanNPC`/rig/FSM nhưng mỗi nhà có roster riêng trong `FantasyCivilizationArena`:

| Nhà | Tuyến quân | Câu hỏi khi test |
|---|---|---|
| **Liên minh Tiên** | lùn cầm tuyến · tiên dùng trượng | tuyến có giữ đủ lâu để phép niệm xong? |
| **Bộ tộc Orc** | orc xung phong · goblin quấy | áp lực cận chiến có xuyên được tuyến sau? |
| **Quái vật** | skeleton dồn bầy · troll · quỷ | có chặn troll/phá tuyến trước khi quỷ chạm pháp sư? |

Bấm **◀ / ▶** ở từng phe để đổi nhà, **R** để đấu lại. `FantasyCreatureLook` lo mặt/sừng/cánh,
`FantasyRaceTactics` chỉ tinh chỉnh bản sao `AIProfile`, nên không có nhánh AI hoặc rig riêng.

## 6b. Bảy nhiệm vụ chung — có mặt đủ ba thời kỳ

`MapSystem` có một bộ bảy câu hỏi gameplay dùng chung. F1 tạo **21 entry riêng** nhưng không
nhân bản 21 scene: mỗi thời kỳ dùng sân `MapArena` của chính nó và `mapKey` chỉ rõ preset phải
mở. Vì thế, chọn `Fantasy → Chế độ chơi → Hộ tống` mở `Fan_Escort`, còn chọn `Hiện đại → Hộ tống`
mở `Mod_Convoy` — không thể đổi nhãn map Trung cổ rồi mang nguyên đội hình/địa hình sang.

| Câu hỏi gameplay | Trung cổ | Hiện đại | Fantasy |
|---|---|---|---|
| Giao chiến | `Med_Clash` | `Mod_Firefight` | `Fan_Clash` |
| Thủ trại | `Med_DefendCamp` | `Mod_Outpost` | `Fan_DefendTower` |
| Công trại | `Med_Siege` | `Mod_Raid` | `Fan_DarkTower` |
| Bảo vệ VIP | `Med_Vip` | `Mod_Vip` | `Fan_Vip` |
| Hộ tống | `Med_Escort` | `Mod_Convoy` | `Fan_Escort` |
| Chiếm điểm | `Med_Capture` | `Mod_Capture` | `Fan_Capture` |
| Sinh tồn | `Med_Survival` | `Mod_Survival` | `Fan_Survival` |

Ở mỗi dòng, F2 vẫn chỉ đổi những map cùng thời kỳ; N sinh một map ngẫu nhiên theo đúng công
thức map của thời kỳ đó. Đây là phần **tương đương để test** giữa ba game. Nội dung vốn có bản
chất riêng như Zombie Trung cổ vẫn nằm riêng, không bị sao chép thành “zombie hiện đại/fantasy”
chỉ để đủ số lượng.

## 6c. ZOMBIE TRUNG CỔ — hai chế độ

> Code: `ZombieUnit` · `ZombieInfection` · `ZombieDirector` (runtime) ·
> `StickmanZombieBuilder` (editor) · Menu: `Genres > Trung cổ > Zombie`

**Zombie KHÔNG phải một loại nhân vật riêng.** Vẫn là `StickmanNPC` cũ, chỉ gắn thêm
`ZombieUnit` + đổi `AIProfile` + đổi bộ động tác. Rig, ragdoll, hitbox, hệ vũ khí, hệ chỉ huy,
hệ effect dùng lại NGUYÊN VẸN — không có nhánh `if (isZombie)` nào rải trong code. Đó là điều
kiện để zombie ghép được vào mọi chế độ mà không phá cái gì.

| Thành phần | Việc |
|---|---|
| `ZombieUnit` | đánh dấu + áp tính cách: đi chậm, tắt thể lực, dáng nền theo LOẠI. Khai `INoPlaybook` |
| `ZombieInfection` | gắn lên LÍNH SỐNG: bị zombie giết thì đứng dậy thành zombie |
| `ZombieDirector` | chỗ DUY NHẤT biết "zombie sinh ra thế nào" — lây nhiễm, bầy tràn, đặt sẵn |
| `ZombieScream` | XÁC HÚ: hô thúc cả bầy quanh nó (đi qua `ZombieUnit.Rally`, không tự ghi tốc độ) |
| `ZombieWaveDirector` | bầy THEO ĐỢT, tung quân HAI BÊN cột mốc, có bán kính CẤM SINH quanh người |
| `ZombieSquadUpgrades` | bảng 3 lá bài giữa hai đợt — áp cho CẢ ĐỘI, không riêng người chơi |
| `ZombieWaveMode` | trọng tài: tới nơi / trụ đủ đợt = thắng; xe nát · đội chết · bạn chết = thua |
| `AIProfile_Zombie` | không rút lui, không kite, tầm nhìn 14 — nó không khôn hơn, nó KHÔNG DỪNG |
| `ActionSet_Zombie` | `BuildSet(0.9, 0.5, 0.9)` + `shamble`·`reach`·`lurch`·`rise`·`lunge`·`maul`·`numb`·`twitch` |

⚠ **`INoPlaybook` là vế dễ quên nhất.** `AIPlaybookBinder` không khai phe nào thì quét CẢ SCENE
và áp lại mỗi 3 giây, tức trả lại cho zombie: profile của lính · cấp AI của màn · bộ module mặc
định. Mọi thứ `EnsureZombieProfile` và `StripModules` vừa tắt được bật lại hết, **không lỗi nào
báo** — nhìn vào chỉ thấy "zombie đánh như lính đi chậm".

### Lây nhiễm — cái làm trận zombie khác trận thường

Mỗi lính ngã xuống không chỉ là MẤT một quân, mà còn là địch ĐƯỢC một quân. Cán cân lật rất
nhanh khi tuyến vỡ — đó chính là áp lực bắt người chơi giữ đội hình thay vì đánh lẻ.

Chỉ lây khi kẻ kết liễu là zombie (`DamageInfo.source`). Chết vì tên lạc, ngã vực hay đồng đội
đánh nhầm thì nằm yên — không thì cả sân thành zombie vì những cái chết chẳng liên quan tới dịch.

⚠ **Sinh CON MỚI chứ không "hồi sinh cái xác".** Lúc chết `StickmanController` đã tắt physics,
tháo part sang group Ragdoll, tắt hàng loạt script per-frame, đóng băng rồi dọn xác. Bật ngược
tất cả lên là phải đảo đúng thứ tự một flow phức tạp — sai một bước là zombie đứng đơ hoặc
ragdoll dính vào người sống. Sinh con mới thì mọi hệ khởi tạo sạch, xác cứ mờ dần theo luật cũ.

⚠ **`_maxAlive` là van an toàn bắt buộc.** Lây nhiễm là vòng lặp TỰ NHÂN: không có trần thì
một trận kéo dài sẽ sinh zombie tới lúc tụt khung hình. Trần được kiểm lúc TRỖI DẬY chứ không
lúc hẹn giờ — trong lúc chờ có thể đã đủ zombie rồi.

### Hai chế độ

| Scene | Chơi gì |
|---|---|
| `Genre_Medieval_ZombieSupply` | **ÁP TẢI** — xe hàng tự bò từ rừng (mép trái) về LÀNG (mép phải); đội 3 lính cận chiến + 1 giáo sĩ + người chơi bám XE. Về tới làng = thắng |
| `Genre_Medieval_ZombieDefense` | **GIỮ LÀNG** — 3 người + 1 giáo sĩ + người chơi, hai cổng dồn bầy lại ở cửa. Trụ đủ 8 đợt = thắng; nhà chính sập = thua |

Cả hai chạy CÙNG một vòng (`ZombieWaveMode`): mở đợt → bầy ập vào **TỪ HAI PHÍA** → dọn sạch →
**BẢNG NÂNG CẤP ĐỘI** → đợt sau đông hơn và LÊN CẤP. Đội người **KHÔNG AI HỒI SINH**
(`RespawnDirector.SetLivesPerTeam(0)`) — mất một người là mất vĩnh viễn, mà người đó còn đứng
dậy đi theo bầy. Chi tiết + các bẫy: `AGENTS.md`, mục *VÒNG CHƠI THEO ĐỢT*.

Cả hai đăng ký vào nhóm **Chế độ chơi** của ô chọn scene.

## 7. Ô chọn bài có TAB CHA thời kỳ

Sau khi thêm 11 bài thể loại, catalog lên hơn 25 scene — đổ phẳng một cột thì cuộn mãi mới tới
bài cần. `DemoSceneSwitcher` lọc catalog theo HAI trục: `Entry.genre` là TAB CHA, còn
`Entry.category` là TAB CON.

| Tab cha | Tab con | Gồm |
|---|---|---|
| **Trung cổ** | Cơ bản · AI · Chế độ chơi | Vũ khí/công thành/văn minh trung cổ; 7 nhiệm vụ map; zombie và mode trung cổ riêng |
| **Hiện đại** | Cơ bản · AI · Chế độ chơi | Giá súng · đấu súng · nấp bắn · **Văn minh (Liên quân/Đột kích/Dân quân)** · 7 nhiệm vụ map hiện đại |
| **Fantasy** | Cơ bản · AI · Chế độ chơi | Giá phép · pháp sư · tay đôi · **Văn minh (Tiên/Orc/Quái vật)** · 7 nhiệm vụ map fantasy |

Ví dụ: `Trung cổ → AI → Văn minh` không thể lẫn nội dung Fantasy. Một factory fantasy mới chỉ
cần đăng ký `genre = Fantasy` và `category = AI` hoặc `Gameplay`; UI không cần sửa.

Phím: **F1** mở · **◀ ▶** đổi thời kỳ · **PageUp/PageDown** đổi tab con · **▲ ▼ + Enter**
chọn bài · **Esc** đóng · **R** chơi lại.

Catalog cũ được đọc tương thích ngay lúc chạy; bấm **Rig & Kiểm tra → Làm mới danh sách bài
test** để ghi chúng sang hai trục chính thức. Bảng điều khiển theo dõi asset catalog, nên thay
đổi builder/catalog sẽ tự báo cần làm mới.

## 8. Chạy

```
Tools > Stickman > Genres > 1. Build Genre Assets (3 thể loại)
Tools > Stickman > Genres > 2. Build ALL Genre Scenes (11 bài)
```

Hoặc bấm **`Create Demo Scenes (All)`** — nút tổng đã gọi cả hai bước này.
Dựng lẻ một bài: `Genres > Trung cổ | Hiện đại | Fantasy > <tên bài>`; các bài mới là
`Hiện đại > 4. Văn minh — Liên quân / Đột kích / Dân quân` và
`Fantasy > 5. Văn minh — Tiên / Orc / Quái vật`.

## 9. Thể loại BẮN SÚNG — đủ độ sâu như trung cổ (2026-09-05)

Bốn lực lượng (Cảnh sát · Quân đội · Cướp · Khủng bố) là `CivilizationDefinition` thể loại
Hiện đại; băng đạn + nạp trên `RangedWeapon`; khói/lửa/chớp qua `AreaHazard`; năm chế độ
Demo_42..46 (tử chiến · đặt bom · zombie bùng phát · con tin · gun game). Toàn bộ ở
**`Shooter.md`** — đọc file đó trước khi thêm súng, lực lượng hay chế độ bắn súng mới.
