## ⚠⚠ XE · KHÍ TÀI MẶT ĐẤT · KHÔNG QUÂN — hình học theo art, lái bằng tia dò đất, ngồi TRONG xe · khinh khí cầu (2026-09-08)

User: *"thiết kế xe thiết giáp, xe tăng độ vị trí bánh bị sai và nó không chạy được bị kẹt, khi
lên xe phải ngồi trong xe, sửa lại tất cả chứ không chỉ xe trong chế độ hiện đại nhé, và xe bắn
được, AI sử dụng được"* — và *"thêm máy bay trực thăng, máy bay thả boom, thả dù lính, thả tiếp tế"*.

Code: `Assets/Scripts/Gameplay/Vehicles/VehicleSpec.cs` (bảng số) · `Vehicle.cs` + hai file phần
`Vehicle.Crew.cs` (người trên xe) + `Vehicle.Drive.cs` (cách đi · kíp AI) ·
`VehicleRider.cs` (ngồi) · `VehicleDepot.cs` (trạm sửa) · `VehicleCatalog.cs` · `CampVehicleWorkshop.cs` ·
`Assets/Scripts/Combat/World/DrivableVehicles.cs` (giao diện cho AI) ·
`Assets/Scripts/AI/Modules/AIVehicleModule.cs` · `Assets/Editor/Modes/StickmanVehicleBuilder.cs`.
Máy bay: `Aircraft.cs` · `AirSupportDirector.cs` · `Parachute.cs` · `SupplyCrate.cs`.

Xem thêm [ModernFront](ModernFront.md) (xưởng cơ giới · trần 2 xe/phe) và [Shooter](Shooter.md).

---

### 0a. ⚠⚠ PIVOT ĐÁY GIỮA BỊ ĐỐI XỬ NHƯ PIVOT TÂM — cả chiếc xe lơ lửng (2026-09-13)

User: *"bánh xe của các phương tiện xe trong game đang không khớp với thân xe, và vị trí đặt xe
không đúng, và có vẽ nó quá to so với nhân vật"*. Ba câu, **hai** nguyên nhân — và nguyên nhân
thứ nhất trả lời gọn hai câu đầu.

**Mọi tấm art sinh bởi `StickmanBuildingArt` mang pivot `(0.5, 0)` — ĐÁY GIỮA**
(`ConfigureImporter`), và đó là đúng: công trình đặt xuống đất chỉ bằng `y = groundY`. Nhưng
`StickmanVehicleBuilder` tính mốc theo **TÂM tấm hình** (`spec.LocalOf(artSize * 0.5f)`) và theo
**tâm bánh** (`WheelLocal`), rồi gán thẳng con số đó vào `localPosition`. Một toạ độ "tâm" đặt
vào một sprite neo ở "đáy" thì tấm art **trôi lên đúng nửa chiều cao của chính nó**:

| | trôi lên | nhìn ra |
|---|---|---|
| thân jeep | +0.50 | thân xe bay khỏi bánh |
| thân xe tải | +0.77 | ↑ |
| mỗi bánh | +1 bán kính | bánh treo hẳn trên mặt đất, không chạm đất |
| quả khinh khí cầu | +2.60 | |

Cộng lại: xe đứng lơ lửng, bánh rời gầm, và bóng dáng đo từ mặt đất lên đỉnh art cao gấp
**1.5 lần** cỡ thật — tức cả ba lời của user. **Không một dòng log nào**, vì không có gì hỏng:
bảng `VehicleSpecs` đúng, importer đúng, chỉ chỗ NỐI hai cái là sai.

**Luật.** Trong builder xe, art đi qua **`PlaceArt(target, sprite, center, w, h)`** — nó hỏi
`sprite.bounds.center` nên đúng với MỌI pivot (giữa ⇒ lệch 0, đáy ⇒ lệch nửa chiều cao). Không
gán `localPosition` cho một nút có `SpriteRenderer` nữa.

⚠ **Mảnh art BIẾT QUAY thì phải TÁCH HAI NÚT** (`SpinArt`): `Vehicle.SpinWheels` gọi
`_wheels[i].Rotate(...)`, mà `PlaceArt` bù pivot bằng cách dời chính cái transform — xoay một
transform nằm dưới tâm hình là cái bánh **lăn thành vòng tròn quanh mặt đất** thay vì quay tại
chỗ. Nút CHA đứng đúng tâm bánh, nút CON `Anh` mang tấm hình và tự bù. Cùng luật cho cánh quạt
trực thăng.

⚠ Chỗ khác trong file cũng dính: ụ pháo phòng không, quả mìn, thùng đồ nghề của trạm sửa, thân
máy bay, quả khinh khí cầu. **Kiện tiếp tế là ngoại lệ CỐ Ý**: `Parachute` hạ gốc nó xuống mặt
đất, nên pivot đáy làm cái thùng đứng đúng trên đất — để nguyên.

Doctor › **«Thân xe bake TRÔI LÊN khỏi bánh»** đọc `m_LocalPosition.y` của nút `Than` trong
YAML và so với `spec.LocalOf(artSize/2).y − height/2`.

### 0b. ⚠⚠ CỠ XE ĐO BẰNG MÉT, KHÔNG GÕ BẰNG MẮT (2026-09-13)

Vế *"quá to so với nhân vật"* còn một nửa nữa, và nó nằm trong **tỉ lệ tấm art**.

Đo trên `Character.prefab` (bàn chân IK → đỉnh đầu): **người cao 0.928 world**. Lấy người thật
1.75 m ⇒ **1 m = 0.530 world**. Đem thước đó soi bảng cũ:

| | dài cũ | quy ra mét | dài nay | quy ra mét | xe thật |
|---|---|---|---|---|---|
| Jeep | 3.07 | **5.8 m** | 1.908 | 3.6 m | Willys 3.3 m |
| Thiết giáp | 3.45 | **6.5 m** | 2.597 | 4.9 m | M113 4.9 m |
| Xe tải | 3.97 | **7.5 m** | 3.392 | 6.4 m | 6.4 m |
| Xe tăng | 3.82 | **7.2 m** | 3.286 | 6.2 m | T-34 6.7 m |
| Xe ngựa | 3.82 | 7.2 m | 3.127 | 5.9 m | ngựa 2.4 + thùng 2.5 |

Chiếc jeep cũ dài bằng **3.3 lần chiều cao một người** (xe thật: 1.9 lần). Chiều cao thì gần
đúng sẵn — nên cái sai nằm gọn ở **BỀ DÀI**, và bề dài thì bị `length/artW == height/artH` khoá
chặt vào tỉ lệ tấm art. Tức: **không sửa được bằng cách gõ lại `length`**; phải vẽ lại art.

**Luật.** Art khí tài vẽ ở **80 px / mét**, mép dưới canvas = **MẶT ĐẤT**. Rồi
`length = artSize.x × 0.006625` và `height = artSize.y × 0.006625` — một tỉ lệ duy nhất nên
`ScaleSkew` bằng 0 mà không phải dò. `wheelRadius` = (bán kính lốp tính bằng px) × 0.006625, và
lốp phải vẽ **sát mép ô vuông** của nó (r 47.5/48) — lốp nhỏ hơn ô là `wheelRadius` nói dối.

⚠ **Bảng số KHÔNG hỏi cỡ file, nó chia cho `artSize`.** Thay tấm art bằng một tấm khác khổ (art
đặt tay) là mọi mốc trượt theo mà ảnh vẫn vẽ ra bình thường. Doctor › «Thân xe BÓP DẸT» nay hỏi
luôn câu đó.

⚠ **Nhìn TRƯỚC khi mở Unity**: `.claude/skills/stickman-assets/scripts/vehicle_art.py` vẽ lại cả
bộ bằng bản Python của `EnvCanvas`, còn `vehicle_preview.py` đọc thẳng `VehicleSpec.cs` rồi RÁP
cả chiếc xe cạnh một hình người cao đúng 0.928. Ba lỗi trên đều VÔ HÌNH khi chỉ nhìn từng tấm
PNG — chúng chỉ hiện ra lúc tấm art, cái bánh và con người đứng chung một khung.

### 0c. HỐC BÁNH — thứ mà chỉnh toạ độ không mua được (2026-09-13)

Bánh vẽ SAU thân (`Prop − 2`), nên nếu gầm xe là một **cạnh thẳng** thì cái bánh chỉ là cái đĩa
thò ra dưới tấm ván — đặt đúng chỗ hay sai chỗ, mắt vẫn đọc ra *"hai vật rời nhau"*. Đó là vì
sao hai đợt sửa trước (2026-09-09) chỉnh đi chỉnh lại toạ độ mà lời kêu vẫn quay lại.

`StickmanBuildingArt.Hull(...)` dựng thân theo TỪNG CỘT và khoét một vòm tròn ở mỗi chỗ đặt
bánh; gọi hai lượt (vòm nhỏ màu sẫm, vòm to hơn 4 px màu thân) là có luôn vành chắn bùn ôm lấy
lốp. Vẽ XÂY chứ không vẽ rồi XOÁ — `Clear` là hình chữ nhật nên nó ăn luôn mép thân hai bên.

- Khoét hốc: **jeep · thiết giáp · xe tải**.
- Không khoét: **xe tăng** (bánh đè nằm dưới váy thân, dải xích đã viền sẵn) và **xe ngựa**
  (`wheelsInFront` — bánh gỗ nằm ngoài thành thùng).
- ⚠ Chi tiết vẽ SAU (cánh cửa đổ quân của thiết giáp) phải đặt đáy **trên đỉnh vòm**, không thì
  nó lấp lại đúng cái hốc vừa khoét.

Hốc khoét theo bảng `JeepWheelX`/`ApcWheelX`/`TruckWheelX` trong
`StickmanBuildingArt.Vehicles.cs`, bánh lắp theo `VehicleSpecs.wheelX` — hai bảng, một sự thật.
Doctor › **«Hốc bánh vẽ LỆCH chỗ lắp bánh»** đo hai bên khớp nhau.

⚠ **Art khí tài nay nằm hết ở `StickmanBuildingArt.Vehicles.cs`** (jeep · thiết giáp · tải ·
tăng · xe ngựa · khinh khí cầu · bánh · dải xích), không còn ở `.Modern.cs` — sổ nợ file dài
chốt `.Modern.cs` ở 899 dòng và file trong sổ chỉ được NGẮN đi.

⚠ **Phải bấm «Vẽ LẠI TOÀN BỘ art code»** rồi **dựng lại mọi scene có xe**: `EnsureOne` bỏ qua
tấm đã có, và cỡ xe nằm gọn trong `_axleHalfSpan` đã bake.

---

### 0. ⚠⚠ ĐO `GroundOffset` TRƯỚC KHI VẬT LÝ ĐỒNG BỘ = CON NGỰA CHÌM DƯỚI ĐẤT (2026-09-09)

User: *"tôi thấy nó sinh ra ngựa không đúng vị trí, ở dưới lòng đất"* — ở **mọi** kịch bản, mọi
map sinh lúc chạy.

Dự án **tắt** `m_AutoSyncTransforms` (`ProjectSettings/Physics2DSettings.asset`), nên
`Collider2D.bounds` chỉ cập nhật theo NHỊP VẬT LÝ. Đường sinh quân của `MapAssembler.SpawnUnit` là:

    Instantiate (prefab neo ở y = −1.93) → gán transform.position (chỗ sinh, y ≈ −1)
    → MẶC ĐỒ  ← `UnitLoadout.ApplyTo` gọi `StickmanMount.Mount` ở ĐÂY
    → StandOnGround (có `SyncTransforms` của riêng nó)

Ngay lúc `Mount` chạy, khung bao của `groundCollider` **vẫn nằm ở chỗ prefab**, nên
`StickmanLocomotion.GroundOffset` (= `bounds.min.y − transform.position.y`) trả về **−0.84** thay
vì **+0.089** — lệch 0.93 unit, gần ba lần chiều dài chân ngựa.

Và đây không phải sai số thoáng qua: `BuildMountVisual` **NƯỚNG** con số đó vào `localPosition`
của con ngựa, `MeasureRiderLift` nướng nó vào quãng nâng kỵ sĩ. `StandOnGround` chạy ngay sau đó
đặt ĐÚNG cái gốc — nên **kỵ sĩ đứng đúng, chỉ con ngựa nằm dưới đất**, và dời transform về sau
không sửa được dữ liệu đã nướng.

**Luật:** ai ĐO một khoảng cách từ `bounds` rồi **lưu lại** (nướng vào `localPosition`, vào một
trường serialized, vào một offset) thì phải `Physics2D.SyncTransforms()` ngay trước khi đo.
Đọc `GroundOffset` để dùng NGAY trong frame đang chạy thì không cần — lúc đó vật lý đã đồng bộ.
Chốt hiện tại nằm ở dòng đầu `StickmanMount.Mount`.

---

### 1. GỐC TOẠ ĐỘ CỦA XE LÀ ĐƯỜNG TRỤC BÁNH

`transform.position` của một chiếc xe nằm ở **TÂM BÁNH**, cao hơn mặt đất đúng `wheelRadius` —
cùng quy ước với «root nhân vật nằm ở bàn chân» (xem `MountDefinition`). Hệ quả:

- đặt xe xuống đất = `y = StickmanSceneUtils.SurfaceYOf(x) + wheelRadius`, không phải một phép
  cộng nửa chiều cao thân;
- bộ bám đất không phải nhớ chiều cao thân xe;
- collider thân nằm **TRÊN** đường trục nên không góc nào quệt mặt đất.

### 2. MỌI MỐC LẮP RÁP ĐO BẰNG PIXEL CỦA TẤM ART — `VehicleSpecs`

Bảng `VehicleSpecs.Of(kind)` giữ: cỡ tấm art, đường chạm đất trong tấm, khung thân đặc, chỗ
từng bánh, giá súng, ghế lái, ghế chở quân, và cả bảng cân bằng (tốc độ · máu · giáp · nổ).
Bảng nằm ở **module Gameplay (runtime)**, không nằm trong tool:

- tool `StickmanVehicleBuilder` đọc nó để **lắp** xe;
- `Vehicle` đọc nó lúc chạy để biết bán kính bánh của chính mình (`_wheelRadius = 0` ⇒ tra bảng),
  nên scene bake từ trước vẫn **lái đúng** mà không cần dựng lại;
- `VehicleCatalog` nhân bản xe **giữa trận** — lúc đó tool không tồn tại.

⚠ **VÌ SAO KHÔNG DÙNG TỈ LỆ CHUNG.** Bản cũ đặt hai bánh cứng ở `±30%` chiều dài cho mọi loại.
Con số đó không hỏi tấm hình một câu nào, nên:

| Loại | Bản cũ sai ở đâu | Nay |
|---|---|---|
| Xe tăng | 2 bánh con thụt vào giữa thân dài 4.6 — không ra dải xích | 5 bánh đè trải hết thân + `Prop_TrackBelt` |
| Xe ngựa | bánh trước lăn dưới **bụng con ngựa** (tấm `Prop_Wagon` vẽ cả ngựa, thùng chỉ chiếm nửa trái) | cả 2 bánh nằm dưới thùng (px 66 · 252 / 560) |
| Xe tải | 2 bánh đối xứng, không đọc ra đầu xe | cầu sau KÉP + 1 bánh trước dưới cabin |
| Mọi loại | gầm hở một khe: mép dưới **thân vẽ** ≠ mép dưới **tấm hình** | `artGroundY` + `groundLift` |

⚠ Đổi tấm art là **sửa đúng mấy con số trong bảng**, không đi dò lại tỉ lệ ở tool.

### 2b. MỘT TỈ LỆ CHO CẢ HAI TRỤC — VÌ CÁI BÁNH NÓ QUAY (2026-09-09)

User: *"sửa lại hệ thống phương tiện xe trong chế độ trung cổ, bánh xe đang không khớp với
thân xe"*.

**Luật.** `length / artSize.x` phải **bằng** `height / artSize.y`. Đo bằng `VehicleSpec.ScaleSkew`;
Doctor réo khi quá **2%**.

⚠ **Vì sao không thoả hiệp được.** Thân xe `Fit` theo `length`×`height`, còn bánh `Fit` VUÔNG.
Hai tỉ lệ lệch nhau thì thân bị bóp dẹt một trục, và lúc đó **không cỡ bánh nào đúng**: lấy theo
bề ngang thì bánh lùn, lấy theo bề cao thì bánh gầy. Bóp dẹt luôn cái bánh cho khớp lại càng
hỏng — **bánh QUAY**, hình bầu dục quay là bánh méo lắc từng vòng.

**Trục bánh là một NÉT VẼ, không phải số gõ cho vừa mắt.** Tâm bánh luôn nằm đúng `wheelRadius`
trên mặt đất, nên `wheelRadius` = quãng từ **đường chạm đất** lên **chỗ trục** đo trong tấm art.
`VehicleSpec.AxlePixelY` in ra px mà trục đang rơi vào — soi lại nét vẽ gầm xe là biết ngay.

Xe ngựa (`Prop_Wagon` 560×220, móng ngựa y 24, gầm thùng y 56, thành trên y 134):

| | Bản cũ | Nay |
|---|---|---|
| `length` × `height` | 5.0 × 1.5 → lệch **24%** | **3.82** × 1.5 → lệch 0% |
| `wheelRadius` | 0.30 gõ tay ⇒ trục **cao hơn sàn thùng 0.08**, bánh Ø0.60 cao hơn cả thành thùng (0.53) | **0.22** = (56−24)×1.5/220 ⇒ trục đúng dưới sàn, đỉnh bánh tới 41% sườn xe |
| Thứ tự vẽ | bánh ở layer thế giới ⇒ tấm `_Near` **nuốt 2/3 cái bánh**, chỉ còn mẩu cong dưới gầm | `wheelsInFront = true` ⇒ bánh lên `foreground`, trên `Occluder` |
| Tỉ lệ với người (0.73) | lưng ngựa 0.93 · mui 1.36 — ngựa dachshund | lưng ngựa 0.71 · mui 1.04 |
| Gờ bò qua được | 0.405 | 0.30 — ngang xe tăng (0.31) |

⚠ **`wheelsInFront` có giá của nó**: bánh lên layer `foreground` là nó **che luôn người đi phía
trước xe**, đúng cái giá của `nearPanel`. Chỉ bật cho xe có bánh **lộ hẳn ra ngoài** thành thùng
(xe ngựa). Xe cơ giới bánh thụt trong hốc gầm — để `false`.

### 2c. BÁNH VẼ **SAU** THÂN — mép dưới thân phải CẮT cái bánh (2026-09-09)

User (đợt hai, sau khi sửa xe ngựa): *"kiểm tra cả xe trong chế độ hiện đại, bánh xe đang rời
xa thân xe"*. Cả bốn xe cơ giới cùng một bệnh, cộng hai lỗi riêng.

**Luật.** Bánh vẽ ở `StickmanWorldSorting.Prop − 2`, dải xích ở `Prop − 1`, thân ở `Prop`.
Ngoại lệ duy nhất: `wheelsInFront` (xe ngựa) — bánh vượt lên `foreground`, trên `Occluder`.

⚠ **Vì sao.** Bánh xe hơi nằm TRONG hốc gầm. Chỉ khi mép dưới thân **cắt ngang** cái bánh thì
mắt mới đọc ra «bánh gắn vào xe»; vẽ đè lên thân (`Prop + 1`, bản cũ) là một cái **đĩa dán lên
sườn**. Đây là toàn bộ nội dung của lời *"bánh xe đang rời xa thân xe"* — không phải chỗ đặt sai.

**`groundLift` là cái quyết định bánh ăn vào thân bao nhiêu**, vì nó nâng gầm xe lên khỏi trục:

| `groundLift` | Gầm xe nằm đâu | Bánh nấp | Dáng |
|---|---|---|---|
| **1.00** | ngang ĐÚNG trục bánh | 50% | xe bánh hơi — jeep · thiết giáp · xe tải |
| **1.30** | cao hơn trục | 35% | xe tăng: lộ cụm bánh đè + dải xích |
| **0** | chạm đất | — | xe ngựa (móng ngựa chạm đất, bánh vẽ ra ngoài) |

⚠ **1.00 là SÀN**, không hạ thấp hơn: dưới đó hộp va chạm thân tụt xuống dưới đường trục bánh,
mất bảo đảm «không góc nào quệt mặt đất» ở mục 1. Bản cũ để **1.35** cho jeep · tải · thiết giáp
— gầm cao hơn cả đỉnh bánh một quãng, cái bánh gần như treo hẳn dưới một cạnh đáy phẳng.

**Dải xích phải cao ĐÚNG đường kính bánh**, không phải `2.3 × r`. Tấm `Prop_TrackBelt` vẽ bánh
chủ động / dẫn hướng bằng đĩa **bán kính 35 trong ô cao 70** — tấm ấy tự khai «cao của tôi =
đường kính bánh». Kéo lên 2.3 r là nhánh xích dưới **treo 0.03 trên mặt đất** còn nhánh trên
vượt khỏi đỉnh bánh: xích rời khỏi bánh, bánh rời khỏi xe.

Bảng sau đợt sửa 2026-09-09 (tỉ lệ đồng nhất — `length` co lại cho khớp `height`, art không
đổi). ⚠ **Số cột "mới" đã LỖI THỜI**: đợt 2026-09-13 vẽ lại toàn bộ art ở 80 px/mét và tính lại
cả bảng — xem §0b. Giữ lại để đối chiếu vì sao một tỉ lệ đồng nhất vẫn chưa đủ:

| | `length` cũ → mới | `groundLift` | lệch tỉ lệ | bánh nấp |
|---|---|---|---|---|
| Jeep | 3.4 → **3.07** | 1.35 → **1.00** | 10% → 0.1% | 50% |
| Thiết giáp | 4.0 → **3.45** | 1.30 → **1.00** | 14% → 0% | 50% |
| Xe tải | 4.4 → **3.97** | 1.35 → **1.00** | 10% → 0% | 50% |
| Xe tăng | 4.6 → **3.82** | 1.30 (giữ) | 17% → 0.1% | 35% |
| Xe ngựa | 5.0 → **3.82** | 0 (giữ) | 24% → 0.05% | vẽ ra ngoài |

⚠ Mọi scene có xe **phải dựng lại**: `length` không có field riêng trong scene nhưng nó nằm gọn
trong `_axleHalfSpan`, và Doctor đối chiếu đúng số đó.

### 3. XE ĐI BẰNG TIA DÒ ĐẤT, KHÔNG BẰNG TRỌNG LỰC

Thân xe là `Rigidbody2D` **Kinematic**, tự đi bằng `MovePosition`; độ cao lấy từ **hai tia dò
đất** ở trục trước / trục sau (`Vehicle.ProbeGround`), rồi `MoveRotation` nghiêng cả xe theo dốc.

⚠⚠ **BẢN CŨ LÀ NGUỒN CỦA «xe không chạy được, bị kẹt».** Thân ĐỘNG + hộp va chạm đáy phẳng +
ghi thẳng `linearVelocity.x`:

- mặt đất thật của dự án là `TerrainGround` (đồi lượn, `PolygonCollider2D`) ⇒ hai **góc dưới**
  của hộp cắm vào sườn dốc, Box2D chặn lại, còn vận tốc ta ghi vào chỉ là một con số — xe đứng
  im mà bánh vẫn quay;
- gờ 20 cm (mép bậc, chân bao cát, mép cầu) chặn y hệt một bức tường;
- lính ngồi trong xe là `Kinematic` **ghim vào ghế nằm trong hộp va chạm** ⇒ mỗi `LateUpdate`
  Box2D lại đẩy cái xe ra khỏi chính người ngồi trong nó.

Luật của bộ bám đất:

- **gờ bò qua được** = `StepHeight` ≈ `wheelRadius × 1.35`. Cao hơn ⇒ coi như vách, dừng lại.
- **dốc** nghiêng tối đa `_maxTiltDegrees` (26°).
- **đỡ được xe** (`SupportsVehicle`): không trigger, không phải chính mình, **không phải người
  hay xe khác** — công trình thì đứng được.
- **chắn được xe** (`BlocksVehicle`): công trình hỏi `Fortification.WouldLetThrough` (vật che
  «nhường làn» thì cán qua); sàn một chiều không chặn đường ngang; người và xe **không bao giờ**
  chắn đường (cùng luật `TeamMember._passThroughEnemies`).
- tia dò «chắn đường» bắn ở **ngang ngực thân xe**, không sát đất: tia thấp thì mọi sườn đồi
  thành vật chắn và xe không leo được con dốc nào.
- `_groundMask` rỗng (0) ⇒ tia không thấy gì ⇒ **xe rơi xuyên thế giới trong im lặng**.
  `Awake` tự vá về `Everything`.

**KẸT THÌ CÓ LỐI RA** (`_blockedTime`): quá 1.1 s thì xe chở quân **đổ quân** cho họ đi bộ tiếp;
vật chắn là công trình của địch thì nó thành **mục tiêu** (pháo tăng sinh ra để làm đúng việc đó).
⚠ Đứng yên **không phải** là kẹt — đồng hồ kẹt phải reset khi ga về 0, không thì xe nã pháo vào
một vật chắn đã bỏ lại sau lưng từ lâu.

### 4. KÍP AI PHẢI RA MẶT TRẬN

⚠⚠ Bản cũ quét địch trong `standoff + 6` và **không thấy ai thì lùi về chỗ đứng ban đầu**. Hai
phe cách nhau 60 đơn vị nên cái xe không bao giờ thấy một mống nào — nó đỗ ở vạch xuất phát tới
hết trận, nhìn ra **y hệt đang bị kẹt**.

- tầm quét mục tiêu = `max(standoff + 8, 16)` — rộng hơn tầm bắn, để xe biết quay đầu về đâu;
- không thấy ai ⇒ `CruiseToFront`: bò về phía **địch gần nhất trên cả bản đồ**
  (`TeamMember.FindNearestEnemy`, bán kính 200) — **chỉ hỏi ở nhịp quét 0.4 s**, hỏi mỗi frame là
  hai trăm ô lưới × số xe;
- `_patrolRadius = 0` nghĩa là **cả bản đồ** và đó là mặc định mới. Xe đứng một chỗ suốt trận là
  xe vô dụng.

### 5. LÊN XE = NGỒI **TRONG** XE — BA VIỆC, THIẾU MỘT LÀ HỎNG

`VehicleRider`. Bản cũ chỉ làm việc thứ nhất nên nhân vật **đứng thẳng trên nóc xe**:

1. **GHIM VỊ TRÍ** vào ghế. Root của rig nằm ở **bàn chân**, nên ghế phải đặt ở **SÀN** xe;
   ghim vào một điểm trên nóc là người đứng trên nóc.
2. **DÁNG NGỒI** qua `StickmanLegWalker.SetMounted` — đúng cửa mà kỵ binh đã dùng. Component đó
   là **chủ sở hữu duy nhất** của IK chân; ghi thẳng từ ngoài vào là hai chỗ cùng ghi trong
   `LateUpdate` và chân giật theo thứ tự script.
3. **BỊ THÂN XE CHE**. Rig ở sorting layer `character`, mà layer đó **luôn vẽ trên cả thế giới**
   — không con số nào đưa thân xe ra trước người ngồi (xem `StickmanWorldSorting`). Hai lối ra,
   chọn theo loại xe:
   - xe **KÍN** (tăng · thiết giáp): `hideDriver`/`hideTroops` — tắt renderer của rig. Không ai
     nhìn thấy tổ lái trong một hộp thép, và đó mới là đúng;
   - xe **HỞ** (jeep · tải · xe ngựa): **tấm che mạn gần** `Prop_*_Near` vẽ ở layer `foreground`
     bậc `StickmanWorldSorting.Occluder`; người ngồi lọt giữa hai lớp thân xe.

⚠ Tấm `_Near` chỉ được vẽ **khoang lái / thành thùng**, không vẽ cả sườn xe: mọi pixel ở đó cũng
che luôn người **đang đi phía trước** xe — che rộng là bộ binh biến mất sau một chiếc jeep.

### 6. SÚNG GẮN XE

Khẩu trên giá là **một instance thật** của `Weapon_*.prefab`: cùng bảng số, cùng băng đạn, cùng
kiểu nạp với khẩu lính cầm. Không có «súng của xe» là một bảng số thứ hai.

- xe TRỐNG ⇒ chủ khẩu súng là **chính cái xe** (`Equip(this, null)`); có người lái ⇒ chủ là
  người lái, nên mạng bắn được tính cho họ;
- `Vehicle.Update` phải gọi `_mountedWeapon.Tick` — đó là chỗ `RangedWeapon` tự nạp băng;
- đạn của phe mình **bay xuyên qua** thân xe (`ProjectileController` hỏi `TeamMember.CanDamage`),
  nên nòng nằm sát thân không tự bắn vào mình;
- khẩu có `antiAir` mới ngước lên bắn máy bay (`CreateAaMount`).

### 7. AI DÙNG XE

- `AIModuleKind.Vehicle` nằm sẵn trong `AIModuleLibrary.DefaultKinds`; cửa duy nhất là
  **`AIProfile.vehicleSeekRadius > 0`**. Đang bật ở: `BanSung` 14 · `NhatGan` 13 · `CanTrong` 12 ·
  `HoVe` 11 · `CuongChien` 7.
- module chỉ chạy khi **đang có địch** — thiếu vế đó thì mở màn cả sân chạy đi đỗ xe.
- **sổ xí phần tĩnh**: mỗi xe chỉ một người đi tới, không thì cả tiểu đội cùng nhắm một cái xe.
- ⚠⚠ `IDrivableVehicle.IsDrivenBy` **bắt buộc**: xe nổ thì `Vehicle.Leave` bật lại
  `StickmanAgent` mà không báo cho module. Thiếu câu hỏi này thì anh lính sống sót ôm cờ «đang
  lái» tới hết trận và không bao giờ lên xe nào nữa — không lỗi nào báo.

### 8. KHÔNG QUÂN — BOM · LÍNH DÙ · TIẾP TẾ

`AirSupportDirector` (mỗi phe một hàng: `homeX` · `farX` · `dropX`) gọi hai prefab máy bay dựng
bởi `StickmanVehicleBuilder.EnsureAircraftPrefabs`.

- **NÉM BOM**: bay ngang ở `_altitude`, thả bom khi **dưới bụng có địch** (có tính đà bay), hết
  lượt thì bay ra ngoài rồi tự huỷ.
- **TRỰC THĂNG**: tới `dropX`, treo, thả **lính dù** rồi thả **kiện tiếp tế**, xong mới lượn xả
  súng nóc; máu dưới 30% là rút.
  ⚠ Thả kiện **sau** quân, không xen kẽ: lính dù rơi vào giữa mấy cái thùng đang lơ lửng thì tia
  dò chạm đất của họ gặp thùng trước mặt đất và họ «đáp» ngay trên không.
- **KIỆN TIẾP TẾ** (`SupplyCrate`): ruột là `AmmoCache` + `HealingPost` **có sẵn**, TẮT cho tới
  lúc dù đáp, sống 45 s rồi tự biến mất (nháy dần 6 s cuối). Không viết hệ «hồi tiếp tế» thứ hai
  — AI và HUD đã biết tra `AmmoCache.All` / `HealingPost.All`. Kiện **không có collider**: nằm
  giữa đường mà chắn lối là cả tuyến ùn lại.
- Kiện là prefab **rời**, không phải con của máy bay: máy bay bị bắn rơi thì hàng đã thả vẫn đáp.

Đang bật ở: 3 màn của `StickmanShooterModeBuilder` và `Demo mặt trận ba nước`
(`StickmanModernFrontBuilder.BuildAirSupport` — nhịp thưa hơn vì có **ba** phe cùng gọi).

### 9. VÒNG ĐỜI CỦA MỘT CHIẾC XE — bỏ xe · cướp · sửa (2026-09-08)

Trước đợt này khí tài chỉ có hai trạng thái: **chạy** và **nổ**. Nay có bốn, và ba tính năng
mới nối chúng thành một vòng.

```
  chạy  ──(máu < 45%)──►  lùi về TRẠM SỬA  ──(vá tới 90%)──►  chạy
    │                                                          ▲
    └──(máu < 22%)──►  TỔ LÁI BỎ XE  ──►  xe VÔ CHỦ  ──────────┘
                            │                 │        (công binh / trạm vá lại)
                            │                 └──►  phe kia trèo lên = CƯỚP
                            └──(máu 0)────────────►  NỔ
```

**a. TỔ LÁI BỎ XE** (`Vehicle.BailOut`, ngưỡng `_bailHealthFraction` = 22%).

⚠⚠ Bản cũ mới gọi `Leave` + `Unload` **bên trong `Explode`** — tức tổ lái được đặt xuống đất
ĐÚNG LÚC quả nổ phát ra, đứng trọn trong bán kính và chết sạch. Nhìn ra là *"cứ lên thiết giáp
là chết cả tổ"*, nên chở quân bằng xe thành nước đi tệ hơn đi bộ. Nay họ ra TRƯỚC, lúc xe còn
22% máu, và cái xe hỏng đó thành một thứ đáng tranh giành thay vì một quả bom hẹn giờ.

**b. XE VÔ CHỦ** (`IsAbandoned`) = còn chạy được · không ai trong đó · không còn kíp ảo. Đây là
trạng thái mà cả cướp lẫn sửa dựa vào. Một chiếc **đang bắn thì không vô chủ** — cho cướp một
chiếc đang nã pháo vào mình là xoá luôn phần nguy hiểm của khí tài địch.

**c. CƯỚP** (`Capture`) — người chơi bấm [F], lính AI thì qua `AIVehicleModule` (cùng một luật,
không có hai bảng). Đổi phe **qua `TeamMember.TeamId` (setter)**, không ghi thẳng field: setter
lọc lại toàn bộ va chạm đồng đội và nhuộm lại màu phe. Cướp xong `_homeX` tính lại từ chỗ đứng —
giữ mốc cũ là chiếc vừa đoạt được đòi chạy ngược về sân địch.

**d. SỬA** — hai đường, cùng một cửa `IRepairSite`:
- **`VehicleDepot`** (trạm sửa ở căn cứ): xe đỗ trong bán kính thì hồi máu dần;
- **công binh** (`AIStateWork` → `RepairSites.FindJob`): `Vehicle` đăng ký vào sổ sửa chữa CHUNG
  nên thợ đang vá tường cũng vá xe, không phải dạy thêm gì.

Ba cái van của trạm, thiếu cái nào cũng vỡ cân bằng:
1. **vừa trúng đòn thì chưa sửa** (`_combatLockout` 3 s) — không có vế này thì xe tăng cứ lùi về
   nhà là **bất tử**, vì thợ vá nhanh hơn đạn;
2. **bán kính nằm TRONG căn cứ** — xe phải rời tuyến mới được sửa, đó là cái giá;
3. **sửa chậm hơn bắn** (1.2 máu/giây so với một phát pháo 5.5).

⚠ Vá đủ lành thì `Repair` **trả kíp lái về** (`_aiCrew` = giá trị lúc dựng). Thiếu vế đó thì mọi
chiếc từng bị bỏ đều đứng yên tới hết trận dù thanh máu đã đầy — công binh làm việc mà không ai
thấy kết quả.

⚠ **HAI NGƯỠNG cho việc rút về sửa, không phải một** (`WantsRepair`): xuống dưới 45% thì rút,
nhưng phải vá tới **90%** mới quay ra. Một ngưỡng duy nhất là chiếc xe rung lắc ở đúng mốc đó —
vá một nhịp là lao ra, trúng một phát lại quay về — và nó đứng ngay cửa trạm cả trận.
Map **không có trạm** thì vế rút tự tắt: không có chỗ để về thì rút là bỏ trận.

### 10. KHÔNG QUÂN THEO ĐIỂM — một quyết định, không phải một sự kiện nền (2026-09-08)

`AirSupportDirector._callMode`:

- **`Timer`** (cũ): cứ tới giờ là bay. Không ai quyết định gì — nó là thời tiết.
- **`Points`**: đổi chiến quả lấy **PHIẾU**. Nguồn điểm = `CapturePoint.ScoreOf` (giữ cứ điểm)
  **+** 2 điểm mỗi mạng địch (nghe `TeamMember.AnyDied`). Đủ `_pointsPerToken` (22) thì được một
  phiếu; phe người chơi **giữ phiếu chờ bấm** (G = trực thăng · B = ném bom, hoặc nút ở bảng khí
  tài), phe máy tự tiêu và **luân phiên** bom / trực thăng.

⚠ **Trần phiếu** (`_maxTokens` = 2) là bắt buộc: phe nào quên tiêu sẽ dồn năm phiếu rồi gọi một
lượt năm chuyến — bầu trời kín máy bay và trận đánh xong trong mười giây.

⚠ **Không dùng phím H** cho không quân: H đã là BĂNG BÓ (`MedkitBag`).

⚠ Bỏ qua đòn tự sát và đòn đồng đội khi cộng điểm hạ địch — cộng bừa là phe nào nhiều thương
vong nhất lại gọi được nhiều máy bay nhất.

Doctor «Không quân đòi ĐIỂM mà map không có chỗ kiếm điểm» réo khi một scene bật `Points` mà
không có `CapturePoint` nào: lúc đó chỉ còn điểm hạ địch, tức 11 mạng mới được một chuyến, và
trong một màn 5 phút thì không quân **coi như không tồn tại** — mà nhìn vào không có gì báo.

### 11. BẢNG KHÍ TÀI TRÊN MÀN HÌNH

Vẽ trong `GameModeHud` (bảng CÓ SẴN), **không đẻ bảng nổi thứ hai** — luật một-chủ-cho-một-vùng
-màn-hình ở `StickmanUI.LeftPanelRight` đã trả giá đúng vì hai bảng tự tính chỗ rồi đè lên nhau.
Nó trả lời ba câu mà trước đó người chơi không có cách nào biết: *phe mình còn mấy xe* · *chiếc
bị bỏ kia có cứu được không* · *bao giờ gọi được không quân*.

Thanh máu trên nóc xe vẽ ở sorting layer **`character`** chứ không ở layer thế giới: thân
stickman là khối đen đặc và bộ binh đứng dày quanh xe, để ở `Default` là bị lính đứng trước che
mất đúng lúc cần đọc nhất (cùng bài học với hiệu ứng chiến đấu).

### 12. KHINH KHÍ CẦU — SÀN BẮN BIẾT BAY (2026-09-08)

`AircraftKind.Balloon` + `Aircraft.Balloon.cs`. Dùng ở `Demo_49 Chiến tuyến` (tổ SÚNG) và
`Genre_Medieval_Battle` (tổ CUNG) — cùng một cỗ, khác mỗi bảng vũ khí phát cho tổ bắn.

⚠ **Là một `AircraftKind`, không phải lớp riêng**: nó cần đúng những thứ máy bay đã có — bay
bằng code, đo mặt đất bằng tia dò, bị bắn thì rơi rồi mới nổ, nằm trong `Aircraft.All` để **ụ
pháo phòng không nhìn thấy**. Đẻ một lớp `Balloon` là phải đi vá lại từng thứ đó.

**Bốn chặng** (`BalloonPhase`): `Rising` dâng lên → `Station` trôi giữ `standoff` cho tổ bắn nã
→ `Landing` về mép nhà và hạ → `Grounded` thả quân. Chuyển sang hạ cánh khi **hết tổ bắn**,
**máu < 35%** (thủng vỏ thì mất khí — xuống đất còn cứu được người), hoặc **hết giờ trực**.

**Lơ lửng** = hai nhịp LỆCH PHA: bồng bềnh sin (biên độ 0.35, chu kỳ 4.5 s) + quả cầu lắc ±3.5°
theo một nhịp khác. Hai nhịp trùng pha thì mắt đọc ra một chuyển động máy móc.

**Lính đứng trong giỏ bắn xuống** — `RiderPosture.Gunner`:

| | Hành khách (`Vehicle.Embark`) | Xạ thủ (`Aircraft.BoardCrew`) |
|---|---|---|
| dáng | ngồi (`SetMounted`) | ĐỨNG, không đổi dáng chân |
| vũ khí | cất (`SetStowed`) | **giữ nguyên** |
| `StickmanAgent` | tắt | **vẫn chạy** |
| hành vi | — | `GuardTarget` neo vào cái giỏ |

Nhờ vậy **không hệ nào phải học thêm gì**: cung thủ vẫn giương cung, lính súng vẫn nạp băng, cả
hai vẫn tự chọn mục tiêu bên dưới. Thứ duy nhất bị lấy đi là đôi chân.

⚠⚠ **CHẾT LÀ PHẢI THẢ NGAY** (`PruneCrew`): `VehicleRider` ghim theo `LateUpdate`, nên một cái
xác không được thả sẽ **treo lơ lửng cạnh giỏ tới hết trận** — ragdoll đã bật, tay chân vẫn động
đậy, mà cả người dính vào một điểm giữa trời. Khí cầu trúng đạn rơi cũng vậy: `Update` thả cả tổ
TRƯỚC khi gọi `Fall`.

⚠ **VÌ SAO KHÔNG ĐỂ LÍNH ĐỨNG TRÊN MỘT MẶT SÀN THẬT** (`IMovingPlatform`, như boong thuyền): con
thuyền chỉ đi NGANG, còn khí cầu **lên xuống và bồng bềnh**. Một sàn một chiều đang dập dềnh dưới
chân thì người trên đó nảy, tụt qua sàn, hoặc bị bỏ lại giữa trời mỗi lần cầu dâng. Ghim là tất
định; sàn vật lý biết bay thì không.

⚠ **CAO ĐỘ LÀ MỘT CON SỐ GAMEPLAY**, không phải thẩm mỹ: 4.5, vì tầm cung ~7.5 và đường bắn là
đường CHÉO. Doctor «Khinh khí cầu bay CAO HƠN tầm với của tổ bắn» réo khi một scene bake cao độ
> 6 — lúc đó khí cầu vẫn bay đẹp, tổ bắn vẫn giương cung, và không mũi tên nào tới đất.

⚠ **BỀ NGANG GIỎ cũng là con số gameplay**: phải chứa vừa ba chỗ đứng cách nhau 0.42, không thì
ba người lính chồng khít thành một khối đen. Giỏ và mọi mốc lắp ráp đo bằng **pixel của tấm
`Prop_Balloon`** (260×420) — cùng quy ước với `VehicleSpec`. Gốc đặt ở **đáy giỏ** nên "đáp
xuống đất" chỉ là `y = mặt đất`.

⚠ `MoveBalloon` **không lật `localScale`** như `Aircraft.Move`: quả cầu đối xứng nên lật chẳng
được gì, mà lật là soi gương luôn cái giỏ — chỗ đứng của tổ bắn nhảy sang bên kia mỗi lần khí
cầu đổi chiều trôi.

### 13. BẪY IM LẶNG ĐÃ CÓ PHÉP ĐO

- `StickmanDoctor` › **«Xe bake theo HÌNH HỌC CŨ»**: đọc YAML scene, khối `MonoBehaviour` của
  `Vehicle` phải có `_wheelRadius > 0` **và cả `_wheelRadius` lẫn `_axleHalfSpan` bằng đúng số
  trong `VehicleSpecs`** (đọc `_kind` ra loại xe rồi đối chiếu — `_axleHalfSpan` là chỗ duy nhất
  `length` để lại dấu vết trong scene). Bỏ qua **ụ súng đứng yên** (`_driveSpeed = 0`): chúng là
  `Vehicle` nhưng không dựng theo bảng chassis, đo chúng là réo nhầm mãi mãi. Cố ý chỉ **VÀNG**: `Vehicle.Awake` bù được phần LÁI lúc chạy, nhưng
  chỗ đặt bánh · ghế · tấm che đã bake vào scene thì chỉ dựng lại mới ra.
- `StickmanDoctor` › **«Thân xe BÓP DẸT so với bánh»** (2026-09-09): đo thẳng trên bảng, không
  cần scene — mọi loại có `wheelArt` phải có `ScaleSkew ≤ 2%`. Xem mục 2b.
- Art mới (`Prop_TrackBelt` · `Prop_Jeep_Near` · `Prop_Truck_Near` · `Prop_Wagon_Near` ·
  `Prop_SupplyCrate`) đã khai trong `ModernPropNames` / `DefaultRoles` nên chứng art và mục
  «Art còn thiếu» của Doctor tự đòi.
