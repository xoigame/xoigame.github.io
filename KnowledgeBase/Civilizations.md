# Nền văn minh trung cổ — chia phe bằng ĐỒ, không nhuộm màu

> Code: `CivilizationDefinition` (runtime) · `StickmanCivilizationBuilder` + `CivilizationArtGenerator` (editor)
> Scene test: `Demo_19_Civilizations` · Menu: `Tools > Stickman > Civilizations`

Sáu nền văn minh có sẵn: **Trung cổ châu Âu · Thập tự quân · Viking · Nhật (samurai) ·
Trung Hoa · Ả Rập**. Mỗi nền một bộ **nón + giáp + khiên + ĐỦ BỘ VŨ KHÍ** đúng chất — nhìn dáng đồ
là biết phe, không cần nhuộm màu thân.

## 0. Luật nền: THÂN + ĐẦU LUÔN ĐEN

Nhuộm màu thân là cách rẻ tiền để phân biệt lính, nhưng nó **giết chất stickman** — nhân vật
thành mấy hình nhân nhiều màu chứ không còn là bóng đen. Dự án này phân biệt bằng
**ĐỒ ĐEO TRÊN NGƯỜI**, theo thứ tự dễ đọc từ xa:

1. **VŨ KHÍ** — đọc được xa nhất (kích khác hẳn rìu, cung khác hẳn kiếm)
2. **NÓN** — mũ trụ chữ thập khác hẳn kabuto
3. **GIÁP + KHIÊN**
4. **CỜ HIỆU** — chỉ là phao cứu sinh cho scene demo, không phải cách chính

Cụ thể trong code: `StickmanArchetype.bodyTint`/`limbTint` **để TRẮNG** (`ApplyTint` thoát sớm,
không đụng sprite) và `StickmanArchetypeBuilder` truyền `NoTint` cho cả 9 archetype.
`CivilizationDefinition.ApplyTo` **không bao giờ** đụng màu sprite.

Trong `Demo_19` bấm **F** để tắt cờ hiệu — nếu tắt cờ mà không phân biệt nổi hai phe thì đó là
**lỗi ART** (nón/giáp hai nền giống nhau quá), không phải lỗi code.

## 1. Cơ chế thay hình của dự án — bảng tra nhanh

Dự án có 4 tầng thay hình, xếp từ DỄ đến KHÓ:

| Tầng | Cần rig lại? | Thay bằng cách | Dùng cho |
|---|---|---|---|
| **Mặt + nón** (`StickmanAppearance`) | ❌ overlay vẽ đè lên đầu | thả PNG vào folder → chạy tool quét | mặt người, mọi loại mũ |
| **Trang bị** (`EquipmentDefinition`) | ❌ sprite gắn lên xương | đổi `sprite` trong asset (hoặc thả PNG vào folder văn minh) | giáp ngực, khiên, đồ lưng |
| **Vũ khí** | ❌ sprite + pivot | `Sprite Pivot Tool`: click chỗ tay cầm → gán | 20 cây vũ khí |
| **Thân nhân vật** (`StickmanSkinSet` / `CosmeticPart`) | ✅ PHẢI rig đúng SỐ BONE | Skinning Editor → `Create SkinSet from Selection` | đổi hẳn hình dáng người |

**Hệ văn minh dùng 3 tầng đầu** — không đụng tầng 4, nên PNG bất kỳ đều dùng được ngay:
vẽ chính diện, nền trong suốt, cỡ nào cũng được (scale tool tự đo từ rig).

## 2. Quy ước folder + tên file (QUAN TRỌNG NHẤT)

```
Assets/Sprites/Civilizations/
├── Europe/                ← tên folder = civKey (không dấu, không cách)
│   ├── Helm_Europe.png    ← Helm_*  : nón (NHIỀU file = random mỗi lính)
│   ├── Armor_Europe.png   ← Armor*  : giáp ngực (lấy file ĐẦU TIÊN theo tên)
│   ├── Shield_Europe.png  ← Shield* : khiên (KHÔNG có file = văn minh không dùng khiên)
│   ├── Deco_*.png         ← Deco_*  : tóc/râu riêng (không có = dùng bộ chung ở Sprites/Heads/Decos)
│   └── Weapon_Bow.png     ← Weapon_<Loại> : SKIN VŨ KHÍ (xem mục 3b)
├── Crusader/ · Viking/ · Japan/ · China/ · Arab/   (cùng cấu trúc)
```

- Chỉ cần **ĐÚNG TIỀN TỐ** (`Helm_`, `Armor`, `Shield`, `Face_`), phần sau đặt tuỳ ý.
- Pivot khuyến nghị: nón `(0.5, 0.25)` — 25% dưới pivot trùm che trán; giáp/khiên tâm `(0.5, 0.5)`.
  Art placeholder sinh sẵn đúng pivot để làm mẫu đối chiếu.
- **Nhật cố tình không có `Shield_*.png`** — samurai không dùng khiên; đó là cách khai báo
  "văn minh này không có khiên", không phải thiếu sót.

**Thay art thật = thả PNG vào đúng folder → `Tools > Stickman > Civilizations > 2`. Hết.**

## 3. Bảng quân chủng 9 nền văn minh

Mỗi nền có **đủ bộ vũ khí của nó**, không phải 1 cây/vai trò. Spawn ra là mỗi lính một cây
(`CivilizationDefinition.LoadoutFor` bốc ngẫu nhiên trong các quân chủng cùng vai trò).

| Văn minh | Tuyến đầu | Cận chiến | Tầm xa |
|---|---|---|---|
| **Trung cổ châu Âu** | Khiên | Kiếm+khiên · Rìu+khiên · Chùy+khiên · Thương · Kích · Búa | Nỏ · Cung · **Trường cung** |
| **Thập tự quân** | Khiên | Kiếm+khiên · Chùy+khiên · Thương · Búa | Nỏ |
| **Viking** | Tường khiên | Rìu+khiên · Kiếm+khiên · Giáo · Búa | Phóng lao · Búa ném |
| **Nhật (samurai)** | Ashigaru (yari) | Katana · Đao · Song kiếm · Naginata | Cung yumi |
| **Trung Hoa** | Khiên mây | Kích ji · Thương qiang · Đao+khiên · Song đao | Nỏ liên châu · Cung |
| **Ả Rập** | Khiên đồng | Đao cong+khiên · Đao ngắn+khiên · Thương · Chùy+khiên | Cung · Phóng lao |

Bảng này = mảng `Specs` trong `StickmanCivilizationBuilder.cs` — **nguồn sự thật duy nhất**.
Máu theo vai trò giữ chuẩn dự án: tuyến đầu 2 · cận chiến 3 · tầm xa 1.

### Luật khiên trang bị

`UnitSpec.shield = true` chỉ đặt được cho vũ khí **MỘT TAY**. Xem `HandGrip` của từng cây:

| Nhóm | Cây | Đeo khiên? |
|---|---|---|
| Một tay | Kiếm · Đao · Đao ngắn · Rìu · Chùy · Búa ném | ✅ |
| Hai tay | Giáo · Lao · Đao dài · Thương · Búa cận chiến · Nỏ · Kích | ❌ |
| Song kiếm | Song đao · Song kiếm | ❌ (lưỡi thứ hai đã chiếm tay trái) |
| Tay trái | Cung | ❌ (cung nằm đúng chỗ khiên) |
| Khiên cầm tay | Khiên (index 14) | ❌ (luật MỘT KHIÊN — xem AGENTS.md) |

Đặt sai là ra cảnh hai tay hai khiên hoặc khiên đè lên cán vũ khí.

## 3b. Skin vũ khí theo văn hoá — cùng cây, khác hình

Cung của samurai (yumi) khác hẳn cung hiệp sĩ Âu, nhưng về **gameplay chúng là cùng một cây**.
`WeaponSkinSet` tách phần HÌNH ra khỏi phần SỐ:

```
Assets/Sprites/Civilizations/Japan/Weapon_Bow.png      → cung Nhật
Assets/Sprites/Civilizations/Europe/Weapon_Bow.png     → cung Âu
```

Tên sau dấu `_` phải khớp **đúng** một giá trị trong `enum WeaponType`
(`Bow`, `Sword`, `Longbow`, `Saber`, `Halberd`, `Lance`…). Sai tên thì tool log cảnh báo
chỉ rõ file nào, không im lặng bỏ qua.

**Chỉ đổi `Visual.sprite`** — `Tip` (điểm sinh đạn), chỗ nắm, hitbox và mọi chỉ số vẫn nằm
trên prefab dùng chung. Nhờ vậy hai phe cầm "cùng cây khác skin" thì cân bằng **tuyệt đối
bằng nhau**; làm 2 prefab riêng thì không bao giờ bảo đảm được điều đó.

Muốn đổi cả TẦM VỚI / sát thương thì đó không còn là skin — phải tạo vũ khí mới
(`New Weapon Variant from Selection`, xem `WeaponDesign.md` mục 6).

Vẽ theo đúng quy ước vũ khí: **mũi quay sang +X**, pivot ở chỗ tay cầm.

### ⚠ SKIN PHẢI TRÙNG KHUNG + PIVOT VỚI HÌNH GỐC

Vì skin chỉ thay sprite còn prefab giữ nguyên pivot / `Tip` / `OffHandGrip`, hình mới mà
khác **kích thước** hoặc khác **pivot** là lệch hết: vũ khí rời khỏi bàn tay, hoặc hitbox
nằm ngoài mũi (vung trúng khoảng không). `BuildWeaponSkins` kiểm lại và **log cảnh báo chỉ
rõ file nào lệch bao nhiêu** — đừng bỏ qua cảnh báo đó.

Khung chuẩn (chép từ `WeaponArtGenerator`): Kiếm 190×46 pivot (38,23) · Đao 180×52 (34,26) ·
Đao ngắn 112×44 (24,22) · Đao dài 300×58 (84,29) · Giáo 340×30 (90,15) · Thương 420×34
(100,17) · Kích 380×66 (95,33) · Rìu 160×90 (34,46) · Chùy 140×64 (30,32).

### Bộ skin đã dựng sẵn (`CivilizationArtGenerator.GenerateWeapons`)

**34 skin, phủ cả 6 nền.** Khung chuẩn thêm: Búa cận chiến 240×100 pivot (110,50) ·
Nỏ 150×90 (25,30) · **Cung 164×710 (82,355)** — cung vẽ DỌC, pivot tâm.

| Nền | Vũ khí có skin riêng | Nét nhận dạng |
|---|---|---|
| Âu (8) | kiếm · rìu · chùy · thương · kích · búa · nỏ · cung | lưỡi THẲNG, chắn tay chữ thập, chuôi xanh; kích = poleaxe; thương có loa chắn tay; nỏ có **bàn đạp lên dây**; búa có **mỏ nhọn xuyên giáp**; cung gỗ liền cân đối |
| Thập tự (5) | kiếm · chùy · thương · búa · nỏ | chuôi trắng, chắn tay RẤT dài, **chữ thập đỏ** trên núm chuôi và trên thân nỏ, đồng thau |
| Viking (4) | kiếm · rìu · giáo · búa | lưỡi BẢN TO, chuôi gỗ; rìu có **râu** thõng xuống; giáo lưỡi lá bầu; búa cán **đai sắt**, đầu khối thô, KHÔNG mỏ nhọn |
| Nhật (6) | katana · đao · song kiếm · yari · naginata · **yumi** | lưỡi **CONG** một bên, chuôi quấn sơn mài, chắn tay **TRÒN** (tsuba); yari lưỡi thẳng hẹp; **yumi LỆCH — tay nắm ở 1/3 dưới, cánh trên dài gần gấp đôi** |
| Trung Hoa (6) | dao · song đao · ji · qiang · **nỏ liên châu** · cung | lưỡi cong **PHÌNH RA gần mũi**, chắn tay **ĐĨA**, núm **VÒNG** + tua đỏ; ji có **lưỡi liềm** bên; nỏ có **HỘP ĐẠN trên nóc + cần gạt**; cung tổng hợp **quặp đầu cánh** |
| Ả Rập (5) | scimitar · đao ngắn · thương · chùy · cung | cong **SÂU nhất**, bản hẹp, đồng thau + chuôi ngà; cung **ngắn nhất nhưng quặp đầu sâu nhất** (bắn trên lưng ngựa) |

Đúng ví dụ hay được hỏi: **kiếm Nhật ≠ kiếm Trung Quốc** — katana cong đều, thuôn dần,
tsuba tròn; còn dao Trung Hoa cong nhẹ nhưng bản rộng dần về mũi, chắn tay đĩa, núm vòng
có tua. Cùng chỉ số, khác hẳn hình.

Cây nào một nền KHÔNG có skin thì tự dùng hình mặc định — không lỗi, chỉ là chưa vẽ.
Còn lại chưa vẽ: **lao · búa ném · trường cung** (Viking/Ả Rập dùng lao, Âu dùng trường cung)
— ba cây này hình mặc định đã hợp cả ba nền nên chưa cần tách.

Thêm skin cho một cây = thêm 1 dòng gọi hàm trong `CivilizationArtGenerator.GenerateWeapons()`.
Các hàm vẽ đều THAM SỐ HOÁ (`BowVertical`, `KatanaLike`, `DaoLike`, `ScimitarLike`,
`SwordStraight`, `CrossbowLike`, `WarhammerLike`...) — truyền độ cong / độ lệch / màu là ra
kiểu mới, không phải vẽ tay lại từ đầu.

## 3c. CHIA VŨ KHÍ — "chia bài", không bốc ngẫu nhiên từng đứa

Triệu chứng cũ: *"có lúc nó sinh ra toàn vũ khí tầm xa"*. Mỗi lính bốc `Random` riêng thì
hoàn toàn có thể ra cả tuyến cầm giống nhau — xác suất nhỏ nhưng **không bao giờ bằng 0**,
và người chơi thấy ngay.

`CivilizationDefinition.LoadoutFor` giờ **chia bài không lặp**: mỗi vai trò có một "túi",
rút ra thì bỏ khỏi túi, hết túi mới xáo lại. 6 lính cận chiến của châu Âu ra đúng 6 cây
**khác nhau** — phân bố đều theo THIẾT KẾ chứ không nhờ may rủi.

`ResetDealer()` xáo lại toàn bộ — `CivilizationArena.Restart()` và
`CivilizationTeamAssigner` gọi ở đầu mỗi trận, không thì trận sau tiếp tục từ chỗ trận
trước bỏ dở.

## 3d. KỴ BINH (`MountDefinition` + `StickmanMount` + `StickmanHorse`)

Mỗi nền có một quân chủng cưỡi ngựa: nhanh hơn **×1.55**, dày thêm **+3 máu**.

### Con ngựa có RIG IK 2D THẬT — đúng công nghệ của stickman

Ngựa **không phải** một tấm sprite xoay qua xoay lại. Nó dùng đúng bộ đồ nghề của nhân vật:
**chuỗi xương + `LimbSolver2D` + dời IK target**, chỉ khác là dựng bằng code lúc lên ngựa.

```
Mount                       ← con của nhóm `Sprite` (xem "Lật theo nhân vật")
├── Leg0..3   (LimbSolver2D)
│     └── Upper  (đùi)
│           └── Lower  (ống chân + móng)
│                 └── Foot          ← EFFECTOR
├── IKTarget0..3                    ← TARGET, code dời mỗi frame
└── Body
```

- `Horse_Body.png` — thân + cổ + đầu + đuôi + yên, **KHÔNG có chân**
- `Horse_LegUpper.png` / `Horse_LegLower.png` — **hai khúc** chân, dùng lại 4 lần,
  **pivot ở ĐẦU TRÊN** (khớp vai/hông và khớp gối)
- `StickmanHorse` **chỉ dời 4 IK target**, `LimbSolver2D` tự giải hai khúc → móng **bám đất
  thật**. Xoay chân thay vì IK thì móng vẽ vòng cung trên không, IK thì móng đi thẳng trên
  mặt đất.

**KHÔNG dùng SpriteSkin cho ngựa**: SpriteSkin bind theo **chỉ số** nên sprite mới bắt buộc
qua Skinning Editor, không sinh bằng code được. `LimbSolver2D` thì chỉ cần **chuỗi transform**
— gắn sprite rời từng khúc là đủ. Đó là cả lý do con ngựa có IK được mà thân người thì không.

#### XƯƠNG KHÔNG MANG SCALE — hình treo làm con riêng

```
Leg_i (LimbSolver2D)     scale 1
 └── Upper               scale 1      ← chain[0]
      ├── Visual  (SpriteRenderer, co cho vừa khúc)
      └── Lower          scale 1      ← chain[1]
           ├── Visual
           └── Foot                   ← chain[2], EFFECTOR
```

Gắn SpriteRenderer thẳng lên khúc xương rồi co khúc xương cho vừa sprite là **sai**: khúc
dưới là con của khúc trên nên nó ăn scale **hai lần** (`0.686² ≈ 47%`), và `localPosition`
của nó cũng bị co theo. Cả cái chân ngắn hơn chiều cao khớp → `Limb.Solve` không bao giờ với
tới đích, chân duỗi đơ, móng lơ lửng trên không — nhìn y như **"ngựa không có IK"**.

#### Bốn con số hình học, sai một cái là hỏng cả con ngựa

| Số | Giá trị | Vì sao |
|---|---|---|
| Khớp vai/hông đặt ở | đúng `legLength` trên mặt đất | móng duỗi thẳng thì chạm đúng `y = 0`. Đặt sai là ngựa lơ lửng hoặc lún xuống đất |
| Một khúc chân dài | `0.62 × legLength` (`SegmentFraction`) | phải **> 0.5**. Đúng 0.5 thì hai khúc cộng lại vừa khít chiều cao khớp, **gối không còn chỗ gập**: `Limb.Solve` gặp đích ngoài tầm với là trả góc 0 và duỗi thẳng → móng lơ lửng ở hai đầu sải |
| Biên độ sải | `strideDistance / 4`, kẹp ≤ `0.73 × legLength` | tính ra chứ không gõ tay (chống trượt chân, xem dưới); trần 0.73 = `√(1.24² − 1)`, tức chỗ xa nhất móng còn với tới mặt đất |
| Cỡ thân | co theo `bodyLength` (mõm → đuôi) | đừng suy ra từ chiều cao. Bản cũ co thân theo "khoảng từ yên xuống bụng" — số gián tiếp — còn `bodyLength` thì chẳng ai dùng, nên ra con ngựa **bé bằng con lừa** dù bảng số ghi hẳn 0.93 unit |

Khớp vai/hông đặt theo chiều dài thân, **đo từ pivot (yên)**: trước `+0.17`, sau `−0.15`
(`FrontLegOffset`/`RearLegOffset`). Không đối xứng vì sprite còn cả cổ + đầu nhô ra trước và
đuôi nhô ra sau; để `±0.34` là bốn móng chọc hẳn ra ngoài thân, trông như ngựa gỗ dang chân.

**Gối trước và gối sau gập NGƯỢC NHAU** (`LimbSolver2D.flip`): chân trước gập về sau, chân
sau (khuỷu kheo) gập về trước. Cho cả 4 gập cùng chiều là ra con vật 4 chân nào đó chứ không
ra ngựa.

**Nước kiệu (trot)**: hai chân **chéo nhau cùng pha** — trước-xa đi với sau-gần. Cho cả
4 chân cùng pha thì nhìn như con ngựa bập bênh.

**Chống trượt chân, y hệt `StickmanLegWalker`**: móng chạm đất suốt nửa chu kỳ, nửa đó thân
đi được `strideDistance / 2`, mà móng lướt `2 × biênĐộ` → `biênĐộ = strideDistance / 4`.
Gõ tay số khác là móng trượt trên mặt đất.

Pha đi theo **quãng đường** chứ không theo thời gian, và đo bằng `TravelSpeed` chứ không
`Velocity` — bị chắn đường thì `Velocity` vẫn báo đang chạy trong khi ngựa đứng im, chân quạt
tại chỗ. Cùng cái bẫy của `StickmanLegWalker`.

### Kỵ sĩ NGỒI, không đứng

`StickmanLegWalker.SetMounted(true, ...)` giữ hai chân ở một dáng kẹp hai bên sườn ngựa và
**bỏ hẳn chu kỳ bước**. Đi qua cửa này chứ không ghi thẳng IK chân: component đó là **chủ sở
hữu duy nhất** của IKLegL/R, hai chỗ cùng ghi trong LateUpdate là chân giật theo thứ tự script.

Lúc cưỡi, `SetActionLegs`/`ClearActionLegs` bị **khoá** — không cho động tác toàn thân
(nhảy/ngồi/né) mượn chân nữa, không thì tư thế ngồi bị đè mất.

Dáng ngồi chỉnh bằng `sitLegNear` / `sitLegFar` / `sitBodyAngle` trên asset — offset so với
tư thế nghỉ, cùng quy ước `StickmanActionPose`.

### Tỉ lệ — đo từ rig, không gõ số

| Số | Công thức | Ý nghĩa |
|---|---|---|
| `withersHeight` | **82%** chiều cao nhân vật | ngựa thật có lưng ngang **VAI** người (1.6 m / 1.75 m ≈ 0.91); 0.82 là bản rút gọn cho hợp mắt game 2D. Số cũ 62% lấy "ngang hông người" nên ra con ngựa bé bằng con lừa |
| `legLength` | 55% chiều cao lưng | **cũng là chiều cao khớp vai/hông** — phần còn lại là thân |
| `bodyLength` | **175%** chiều cao lưng | chiều dài **TRỌN SPRITE** (mõm → đuôi) — đây là thứ quyết định con ngựa to hay bé |

Với nhân vật cao 0.649: lưng 0.532 · chân 0.293 · thân dài 0.931 · nâng kỵ sĩ 0.170.

**Bậc vẽ**: `MountFarLeg` 0 · `MountBody` 1 · `MountNearLeg` 2 — cả con ngựa nằm **dưới toàn
bộ** kỵ sĩ (bậc thấp nhất của rig là `FarExtremity` 3). Không được để trùng bậc nào của rig:
bậc trùng thì Unity xếp tiếp theo **khoảng cách camera**, mà hai vật gần như cùng z nên thứ
tự đảo qua đảo lại tuỳ frame — đúng cái bẫy đã làm nón nhấp nháy trên/dưới đầu.

### NÂNG KỴ SĨ BAO NHIÊU — "tính từ chân ngựa"

Chuỗi độ cao: **mặt đất → `legLength` (móng tới khớp) → `withersHeight` (chỗ yên)**.
Ngồi lên yên nghĩa là **HÔNG** kỵ sĩ nằm ở `withersHeight`, **không phải bàn chân**:

```
nâng = withersHeight − (hông cao hơn mặt đất bao nhiêu lúc đứng)
```

Nâng thẳng cả nhóm `Sprite` lên `withersHeight` là nâng theo **bàn chân** — nhân vật đứng
thẳng trên yên, hông vọt lên cao hơn lưng ngựa đúng một quãng bằng chiều cao hông của chính
nó (0.36 trên 0.53, tức **sai gần hai phần ba**). `StickmanMount.MeasureRiderLift` đo hông
từ rig (`body_1`, so với root vốn nằm sát đất) nên đổi skin / phóng to boss vẫn đúng.

Con ngựa (con của nhóm `Sprite`) phải hạ đúng **quãng nâng đó**, không phải `withersHeight` —
hai số này khác nhau.

### MỐC 0 LÀ MẶT ĐẤT, KHÔNG PHẢI GỐC TRANSFORM

**Gốc nhân vật nằm THẤP HƠN mặt đất 0.089.** `groundCollider` là hình TRÒN bán kính 0.2 đặt ở
`Sprite`-local y = 0.555, nên chỗ thật sự chạm đất là ĐÁY nó:

```
0.555 × 0.25 − 0.2 × 0.25 = 0.089   ← mặt đất, tính từ gốc transform
```

Ai đặt vật lên "mặt đất" mà lấy `transform.position.y` là chôn vật đó xuống đúng ngần ấy.
0.089 nghe nhỏ nhưng bằng **gần 1/3 chiều dài chân ngựa** nên nhìn ra ngay: móng lún dưới đất,
kỵ sĩ ngồi thấp hơn yên (đã dính 1 lần). Hai chỗ phải cộng nó vào:

| Chỗ | Công thức |
|---|---|
| Móng ngựa | `mountY = −(riderBaseY + riderLift) + `**`groundOffset`** |
| Nâng kỵ sĩ | `lift = withersHeight − (hông − `**`mặt đất`**`)`, không phải `hông − gốc` |

Đo bằng `StickmanLocomotion.GroundOffset` (từ collider), đừng gõ số — đổi skin hay phóng to
boss là số này khác ngay.

### KHÔNG nâng root nhân vật

Root vẫn nằm sát đất nên `Rigidbody2D`, `groundCollider`, tia dò đất, tia dò vực **không phải
sửa một dòng nào**.

### LẬT THEO NHÂN VẬT — ngựa là con của nhóm `Sprite`, không phải của root

Nhân vật quay đầu bằng `Sprite.localScale.x = -1`. Treo con ngựa vào **root** thì nó nằm
**ngoài** phép lật đó — quay trái là kỵ sĩ nhìn một đằng, ngựa nhìn một nẻo. Treo vào
`Sprite` thì nó soi gương theo, **khỏi viết một dòng xử lý lật nào**.

Đổi lại phải **bù ngược chiều cao**: `Sprite` vừa được nâng lên `withersHeight`, nên con ngựa
(con của nó) hạ đúng ngần ấy — móng mới chạm đất.

> `LimbSolver2D` chạy đúng qua scale âm vì nó giải bằng `InverseTransformPoint` /
> `localRotation`, mà hai thứ đó **có** tính scale (khác `TransformDirection` — xem
> "bẫy hình học" số 4 trong AGENTS.md). Toạ độ local ra y hệt lúc chưa lật, chỉ khung vẽ
> là soi gương.

Chết → tách ngựa ra world **trước** khi hạ `Sprite`, `SetActive(true)` lại (vì
`EnableRagdoll` tắt cả nhóm `Sprite` trước khi bắn event `Died`) rồi tắt component
`StickmanHorse` để xác đứng im. Trả chân lại cho `StickmanLegWalker`; ragdoll rơi từ độ cao
lưng ngựa, đúng cảm giác ngã ngựa.

### Bốn giống ngựa — cùng art, khác SỐ và MÀU

Cùng một bộ sprite (thang xám) nên khác nhau ở **số** và **màu lông**, không phải ở hình:
cân bằng vẫn đo được trên một thang chung, và thêm giống mới không cần vẽ gì. Ba trục đánh
đổi, không giống nào ăn cả ba: **to/khoẻ** ↔ **nhanh** ↔ **rẻ (máu ít)**.

| Giống | Lưng (× cao nhân vật) | Tốc độ | Máu | Hứng đòn | Ai cưỡi |
|---|---|---|---|---|---|
| `Horse` — Ngựa chiến | 0.82 | ×1.55 | 8 | 40% | Viking · Nhật (mặc định) |
| `Destrier` — Chiến mã nặng | 0.90 | ×1.32 | 14 | 55% | Âu · Thập tự |
| `Courser` — Tuấn mã | 0.78 | ×1.80 | 6 | 32% | — (dành cho mode riêng) |
| `Steppe` — Ngựa thảo nguyên | 0.70 | ×1.68 | 5 | 30% | Ả Rập · Trung Hoa |

Nguồn sự thật là mảng `Horses` trong `StickmanCivilizationBuilder.cs`; asset ra
`Assets/Settings/Mounts/Mount_*.asset`. Nhờ chia giống mà hai phe khác nhau ngay ở **cách
chạy**, không chỉ ở bộ giáp.

### HỆ MÀU LÔNG — art phải vẽ THANG XÁM

`SpriteRenderer.color` **nhân** vào sprite. Art vẽ nâu sẵn thì tô màu gì cũng ra nâu × màu đó
— không bao giờ ra ngựa trắng hay ngựa xám. Vẽ **trắng (255)** thì tint chính là màu lông
thật, còn phần tối (bụng · bờm · móng) giữ nguyên **tỉ lệ** nên con nào cũng có bờm sẫm hơn
thân đúng một mức.

- `MountDefinition.coatColors[]` — mỗi con **bốc ngẫu nhiên** một màu, nên một tiểu đội kỵ
  binh không ra bốn con giống hệt nhau
- `coatVariation` — nhiễu sáng/tối theo **hệ số NHÂN**, không phải cộng: cộng thì ngựa đen
  cộng lên thành xám còn ngựa trắng bị kẹp trần
- **YÊN LÀ SPRITE RIÊNG** (`Horse_Saddle.png`, treo đúng pivot của thân): vẽ chung thì yên bị
  tint theo lông — ngựa trắng ra yên trắng. Đồ da thì con ngựa nào cũng màu da.
- `StickmanHorse.SetCoat` **NHÂN** vào màu đang có, không GÁN: chân xa đã bị làm tối 0.72 để
  tạo chiều sâu, gán thẳng là bốn chân dẹt thành một mảng màu.

### Ngựa có MÁU RIÊNG — bắn ngựa gục dưới chân kỵ sĩ

`MountDefinition.maxHealth` + `damageShare`. Đòn trúng kỵ binh thì **con ngựa hứng
`damageShare` phần** — đây chính là "giáp" của kỵ binh, và cũng là chỗ trả giá.

Trừ máu ngựa ở một **bể máu song song** (`StickmanMount.OnOwnerDamaged`) chứ **không** chặn
bớt damage trong `TakeDamage`: chen vào đó là phải xếp hàng với khiên, thế thủ và trang bị.
Đổi lại `bonusHealth` để **0** — từ khi ngựa có máu riêng thì cộng thêm máu cho kỵ sĩ là tính
hai lần.

**Ngựa gục mà kỵ sĩ còn sống** → tụt xuống đất đánh tiếp bằng chân (`FellFromHorse`), ngựa nằm
lại thành xác có diễn cú ngã. Mất sạch lợi thế tốc độ — đó là cách khắc chế kỵ binh.

### Cú NGÃ NGỰA — bằng chính bộ IK, không ragdoll

`StickmanHorse.PlayDeath()`: kéo 4 IK target chụm vào gầm rồi hạ + nghiêng thân, **chân tự gập
theo** — đúng chất "chân gập dưới bụng" của ngựa ngã thật.

Không ragdoll hoá: con ngựa không có khớp vật lý, và dựng ragdoll lúc chạy là thêm 5
Rigidbody + 4 joint cho **mỗi con** — trận đông kỵ binh gánh không nổi.

### NGỰA MẤT CHỦ (`RiderlessHorse`)

Kỵ sĩ ngã mà ngựa còn sống → ngựa **tách hẳn khỏi cái xác**, đi lang thang quanh chỗ mất chủ,
và từ đó là một vật thể độc lập.

- **Giết được nhưng KHÔNG ai đi săn**: kế thừa `StickmanController` (có máu + đường
  `TakeDamage` chung) nhưng **KHÔNG gắn `TeamMember`**. Thiếu `TeamMember` thì
  `TeamMember.AreEnemies` trả true cho mọi phe (ai cũng chém được), trong khi `TeamMember.All`
  không chứa nó nên `FindNearestEnemy` không bao giờ lôi nó ra làm mục tiêu. Con ngựa hoang
  không phải mục tiêu quân sự.
- **Collider để TRIGGER**: đặc thì nó chắn lối và cả tiểu đội đứng lại đập nó
  (`UpdateBlockedPath` nhận diện mọi `StickmanController` không phải người là VẬT CẢN).
- **Đi lại KHÔNG qua `StickmanLocomotion`**: ngựa hoang không cần thang/vực/thể lực/đội hình,
  lắp cả bộ vào là trả phí cho chín thứ không dùng. Nó chỉ dịch ngang trong một dây xích
  `strayRoamRadius` quanh chỗ mất chủ, xen kẽ **đi** và **đứng gặm cỏ**.
- **Phải TỰ LẬT**: không còn là con của nhóm `Sprite` nên không được hưởng phép lật của nhân
  vật — `FaceDirection` đặt dấu `localScale.x`.
- **Phải cắt nguồn tốc độ** (`StickmanHorse.DetachFromRider`): không cắt thì nó vẫn đọc
  `TravelSpeed` của **cái xác** — luôn bằng 0, nên ngựa trượt đi mà chân đứng im.
- **Lính nào chưa có ngựa đi ngang là leo lên cưỡi**. Có `remountDelay` 1.5s để đứa vừa nhảy
  xuống không nhảy lên lại ngay. Đổi chủ thì **dựng lại một con nguyên vẹn** (`Mount(def, coat)`)
  chứ không bê nguyên object cũ sang — object cũ đang mang `RiderlessHorse` + collider + máu
  đã sứt, gỡ từng thứ ra rồi lắp lại là đúng loại việc để sót một mảnh. Màu lông truyền theo
  để vẫn là "con ngựa đó".

| Nền | Kỵ binh | Vũ khí |
|---|---|---|
| Âu | Kỵ sĩ | Thương |
| Thập tự | Kỵ sĩ Thập tự | Thương |
| Viking | Kỵ binh cướp | Rìu + khiên |
| Nhật | Kỵ mã samurai | Katana |
| Trung Hoa | Kỵ binh | Thương |
| Ả Rập | Kỵ binh | Đao cong + khiên |

Số liệu ngựa nằm ở `Assets/Settings/Mount_Horse.asset` (tool đo từ rig, dùng chung 6 nền).

## 3e. GIÁP & CẤP LÍNH

### Art giáp — nhận ra phe từ xa

Nhân vật là que ĐEN, nên bộ giáp gần như là **tất cả** những gì phân biệt hai phe. Mỗi nền
phải nhận ra được từ xa, bằng ba thứ theo đúng thứ tự:

1. **Dáng ngoài** (vai vuông hay tròn, có váy giáp hay không) — nhìn thấy trước nhất
2. **Mảng màu lớn** (thép xám · áo trắng chữ thập · da nâu · sơn mài đỏ...)
3. Hoa văn nhỏ — chỉ để nhìn gần cho đẹp, **đừng dựa vào nó để phân biệt phe**

| Nền | Nét nhận dạng |
|---|---|
| Âu | giáp thép TẤM: vai vuông, sống giáp nổi giữa ngực, váy giáp xếp phiến, đai xanh |
| Thập tự | áo choàng TRẮNG phủ giáp xích, **chữ thập đỏ chiếm nguyên ngực** |
| Viking | áo DA + cổ LÔNG dày lởm chởm, vảy sắt hàng dưới, đai da chéo |
| Nhật | ō-yoroi: giáp PHIẾN sơn mài xếp hàng buộc dây vàng, hai miếng vai (sode) to bản |
| Trung Hoa | giáp ĐINH TÁN vàng trên vải đỏ, **cổ mây** hai cánh tròn, tua thắt lưng |
| Ả Rập | áo choàng sáng màu mở vạt phủ giáp xích, đai chéo đỏ, thắt lưng đồng |

Ba hàm dùng chung: `Torso` (khối thân + viền) · `Pauldron` (miếng che vai) · `Fauld`
(váy giáp). Thêm nền mới thì **ghép lại**, đừng vẽ tay từ đầu.

⚠ `CivilizationArtGenerator` chỉ **bù file thiếu**. Muốn art mới hiện ra thì **xoá file
`Armor_*.png` cũ** (giữ `.meta` để không mất GUID) rồi chạy tool dựng scene bất kỳ.
**ĐỪNG bấm menu "1"** — nó `GenerateAll` và sẽ đè mất bộ **nón art thật** (38–65 KB mỗi cái)
lẫn **giáp Nhật art thật**.

### Giáp = bể điểm riêng từng slot

`EquipmentDefinition.armor`: nón một bể, giáp thân một bể. Đòn trúng người trừ vào giáp
trước, thừa bao nhiêu mới vào máu; **hết điểm là món đồ văng ra**.

Khác `hitsBlocked` (khiên/nón đếm theo LƯỢT — chặn trọn một đòn rồi rơi) ở chỗ đây đếm
**sát thương**: giáp dày chịu được nhiều đòn nhẹ nhưng vẫn thủng vì một cú búa nặng. Đếm
lượt thì cây kim và cái búa tạ tốn như nhau, không cân bằng được. Hai hệ chạy song song,
món nào dùng hệ nào là do asset khai.

⚠ **Món có `armor` phải được cấp hitbox** — thiếu thì mọi đòn rơi về slot THÂN: bắn vỡ đầu
vẫn trừ giáp ngực, và cái nón không bao giờ văng được. Đòn không rõ chỗ trúng (vụ nổ) thì
THÂN hứng, cố ý vậy (thân là phần to nhất).

### Cấp lính — và cái giá của giáp

| Cấp | Nón | Giáp | Điểm giáp | Tốc độ |
|---|---|---|---|---|
| `Levy` — dân binh | ✘ | ✘ | 0 | **100%** |
| `Regular` — chính quy | ✔ | ✘ | 3 | 89% |
| `Elite` — tinh nhuệ | ✔ | ✔ | 9 | **62%** |

Cấp **suy ra từ vai trò** (`UnitSpec.DefaultRank`): kỵ binh + lính khiên = Elite · cận chiến
= Regular · **tầm xa = Levy**. Chỉ khai rõ khi muốn phá luật cho một quân chủng — không thì
sửa cán cân giáp lại thành đi sửa 50 dòng bảng quân chủng.

Vế **"tầm xa không giáp"** là vế cân bằng quan trọng nhất: cung thủ đầu trần chính là lý do
cận chiến áp sát được thì thắng. Cho cung thủ mặc giáp là quay lại đúng cảnh *tầm xa áp chế
tầm gần* đã phải đi sửa một lần (xem `WeaponDesign.md` mục 2b).

Sức nặng giảm tốc theo **hàm mũ** (mỗi đơn vị lấy 11% phần còn lại) + sàn 62%: hàm tuyến
tính thì chồng đủ đồ là đứng yên tại chỗ. Hệ số này để **riêng** với hệ số vật cưỡi — hai chủ
khác nhau cùng ghi một biến là mặc giáp xong con ngựa hết nhanh.

## 4. Một nền văn minh gồm những asset nào

Chạy bước 2 là mỗi nền sinh ra trọn bộ trong `Assets/Settings/Civilizations/`:

```
Civ_<Key>.asset                    ← CivilizationDefinition — asset TỔNG
├── AppearanceSet_<Key>.asset      ← bộ mặt + nón riêng
├── Equip_<Key>_Armor.asset        ← giáp ngực (slot Body, keepUpright)
├── Equip_<Key>_Shield.asset       ← khiên đeo (slot Shield, đỡ 2 đòn) — nếu có sprite
├── WeaponSkins_<Key>.asset        ← skin vũ khí — nếu folder có Weapon_*.png
└── Loadout_<Key>_<QuânChủng>.asset  ← 6–9 loại lính, mỗi loại một cây vũ khí
```

`Civ_*.roster` là MẢNG các `UnitLoadout`; vai trò đọc từ chính `UnitLoadout.role`.
Thêm quân chủng = thêm 1 dòng `UnitSpec` trong `Specs`, không sửa code khác.

Dùng lúc chạy: `civ.ApplyTo(nhânVật, UnitRole.Melee)` — khoác trọn vũ khí + máu + giáp/khiên
+ mặt + nón (random trong bộ của nền đó). Xem `CivilizationArena.SpawnSide` làm mẫu.

## 5. Thêm nền văn minh MỚI (VD: Mông Cổ)

1. Tạo folder `Assets/Sprites/Civilizations/Mongol/` + thả PNG theo quy ước mục 2
2. Thêm 1 phần tử vào `Specs` trong `StickmanCivilizationBuilder.cs` với mảng `units`
   liệt kê đủ quân chủng (Mông Cổ: cung ngựa · đao · lao · khiên...)
3. Muốn có art placeholder: thêm nhánh vẽ trong `CivilizationArtGenerator` (không bắt buộc —
   có PNG thật rồi thì thôi)
4. `Tools > Stickman > Civilizations > 2` — sân Demo_19 tự quét thấy nền mới

Nền văn minh KHÔNG cần vũ khí mới: 20 cây hiện có phủ đủ (đao cong = scimitar = katana ngắn,
kích = ji, nỏ = chukonu...). Chỉ khi thật sự thiếu (VD: chakram Ấn Độ) mới thêm vũ khí
theo quy trình `WeaponDesign.md` mục 6.

## 5b. Chia phe NGẪU NHIÊN theo nền văn minh (`CivilizationTeamAssigner`)

Thả một `CivilizationTeamAssigner` vào scene là mỗi lần chơi hai phe bốc **hai nền khác nhau**
(hiệp sĩ Âu vs samurai, Viking vs Ả Rập…). Không cần sửa gì trong hàm dựng scene.

**Hai kiểu áp — chọn đúng kiểu là mấu chốt:**

| Kiểu | Đổi gì | Dùng cho |
|---|---|---|
| `FullRoster` | vũ khí + máu + trang bị + vẻ ngoài | scene ĐÁNH TRẬN: `Demo_3`, `Demo_6`, 6 chế độ chơi |
| `LookOnly` | **chỉ** nón/giáp/khiên/skin vũ khí, GIỮ NGUYÊN vũ khí | `Demo_8_AILab` |

Vì sao AI Lab phải là `LookOnly`: bài "combo" phát kiếm, bài "đỡ đòn" phát cận chiến — áp cả
loadout thì lính đổi sang cung và **bài test mất sạch ý nghĩa**. Kiểu này cho hai phe nhìn
khác hẳn nhau mà điều kiện thí nghiệm vẫn y nguyên.

Quân sinh GIỮA TRẬN (wave spawner, mua lính) gọi `CivilizationTeamAssigner.Dress(go, teamId)`
để mặc đúng nền của phe mình. Scene không có assigner thì hàm này không làm gì — gọi ở đâu
cũng an toàn.

Runtime tra nền văn minh qua `CivilizationLibrary` ở `Assets/Resources/` (asset trong
`Settings/` không đi vào build) — tool bước 2 tự ghi lại.

## 6. Scene test — `Demo_19_Civilizations`

- Hai phe hai văn minh, tự dàn trận 3 tuyến (khiên → cận chiến → tầm xa) rồi đánh nhau
- Nút **◀ ▶** hai góc trên đổi văn minh từng phe — đổi là dọn quân, sinh lại theo bộ mới
- **R** đấu lại cùng cặp; mở màn mặc định: Thập tự quân vs Ả Rập
- Lính sinh LÚC CHẠY (không đặt sẵn trong scene) nên `ValidateScene` không áp dụng ở đây

## 7. Những chỗ dễ sai

### Chốt chống tái lỗi nón/giáp (2026-09-11)

Hai tool ở `Tools > Stickman > Nâng cao > Civilizations` là cửa kiểm bắt buộc sau khi
thêm hoặc thay art:

- **8. Smoke trang bị trên dàn nhân vật**: kiểm từng `EquipmentDefinition` văn minh, cấp
  1–5 và cả hai hướng. Smoke không tự sửa asset; thiếu sprite, scale/offset sai, nón không
  đúng cỡ/neo đầu, cùng chiều art hoặc giáp không khớp khung thân đều làm run FAIL. Chạy batch bằng
  `StickmanEquipmentRosterSmoke.RunBatch` khi cần CI.
- **9. Đo lại cỡ · chỗ đặt giáp**: bake `ArmorScale` và `OpaqueCenterOffset(Vector2)` từ
  `Character.prefab`, giữ đúng scale X/Y và neo vai. Chạy tool này trước, rồi chạy smoke;
  không gõ tay `tierScales`/`tierOffsets`.
- **10. Đo lại cỡ · chỗ đặt nón**: bake từng cấp bằng vành hoặc `.headanchor.json`, dùng
  `FitBrimWidth` + `HelmetOffsetOnHead`. Chạy sau khi thay art/sidecar nón, rồi chạy smoke;
  không dùng offset cũ của tấm trước.
- **11. Tách lớp nón: mặt ngoài · đầu · mặt sau**: `StickmanHelmetLayerTool` giữ nguyên canvas
  và **toàn bộ pixel nguồn ở Front**; `HeadBack` chỉ là bản sao lưỡi liềm sau gáy
  (`−0.50 × bán-kính` theo −X). PNG một lớp không có dữ liệu sâu, nên tách-alpha để suy ra mặt
  sau sẽ khoét lỗ/làm mất nón. Runtime cố định thứ tự `HeadGear (8) > Head (6) > HeadBack (5)`;
  root vẫn giữ collider/hitbox, child chỉ phụ trách vẽ. Tool gate `frontOpaque = sourceOpaque`,
  nên không được thay bằng crop theo bounds.

Thuật toán chỉ có một nguồn ở `StickmanRigMetrics`: nón giữ rotation world nhưng soi hướng
art bằng `TransformVector(Vector3.right)` + `SpriteRenderer.flipX`; giáp đo vùng alpha opaque,
áp scale từng trục, rồi so chiều rộng, tâm, mép trên và mép dưới với rig. Vì vậy lỗi "nón bị
ngược" và "giáp hở/lòi phía dưới" không còn bị che bởi một phép đo bounds canvas duy nhất.
Nón văn minh còn đi qua `StickmanHelmetLayerTool`: mọi pixel được phân lớp không mất dữ liệu,
đầu luôn nằm giữa mặt ngoài và mặt sau; lớp sau cũng nhận cùng `flipX` nên không bị ngược riêng.
`StickmanDoctor` kiểm cả source wiring của runtime/preview/tool và dữ liệu asset; phải chạy
Doctor sau smoke trước khi bàn giao.

| Triệu chứng | Nguyên nhân |
|---|---|
| Thả PNG rồi mà hình không đổi | quên chạy lại bước 2 (tool quét folder lúc BUILD, không quét lúc chạy) |
| Nón mới lệch cao/thấp | pivot PNG chưa để `(0.5, 0.25)` — chỉnh trong Import Settings của sprite |
| Nón to/nhỏ so với các nón khác cùng nền | các PNG trong 1 folder dùng CHUNG 1 scale (đo từ file đầu tiên) — vẽ cùng cỡ canvas |
| Văn minh mới không hiện trên HUD Demo_19 | scene dựng TRƯỚC khi có asset mới — chạy lại bước 3 (`Create Civilization Scene`) |
| Lính Nhật tự nhặt khiên rơi rồi giơ lên | đúng thiết kế (`_shieldIsOffHandOnly`) — nhặt được đồ tốt thì dùng; không muốn thì tắt cờ đó trên holder |
| Cả tiểu đội cầm giống hệt một cây | nền đó chỉ khai báo 1 `UnitSpec` cho vai trò đó — thêm dòng vào `Specs` |
| Lính đeo 2 khiên / khiên đè cán vũ khí | đặt `shield: true` cho vũ khí 2 tay — xem bảng luật khiên mục 3 |
| Muốn 2 nền cùng vũ khí nhưng HÌNH vũ khí khác nhau | đã có: thả `Weapon_<Loại>.png` vào folder nền đó rồi chạy bước 2 (mục 3b). Chỉ khi cần đổi cả TẦM/SÁT THƯƠNG mới phải tạo variant vũ khí mới |
| Hai phe cầm vũ khí giống hệt nhau | nền đó chưa có `Weapon_*.png` → chạy `Civilizations > 1` sinh bộ skin, hoặc kiểm `weaponSkins` trong `Civ_<Key>.asset` có bị `None` không |
| Skin mới mà vũ khí rời khỏi tay / đánh trúng khoảng không | PNG lệch khung hoặc lệch pivot so với hình gốc — đọc log cảnh báo của bước 2, sửa theo bảng khung chuẩn ở mục 3b |

## Ba nền thêm sau + VẬT CƯỠI KHÔNG PHẢI NGỰA

### Vì sao lạc đà / voi KHÔNG cần code mới

`StickmanHorse` không biết gì về "ngựa": nó dựng THÂN + 4 CHÂN IK từ 3 sprite và mấy con số.
Nên một con lạc đà hay con voi chỉ là **bộ sprite khác + bộ số khác** — không thêm dòng code
chạy nào, không có nhánh "nếu là lạc đà".

Thêm loài mới đúng 2 chỗ:
1. 4 hàm vẽ trong `WeaponArtGenerator` (`<Tên>_Body` · `_Saddle` · `_LegUpper` · `_LegLower`)
   + nối tên vào `AllSpriteNames`
2. 1 dòng trong mảng `Horses` của `StickmanCivilizationBuilder`, khai `art:` và `legRatio:`

⚠ **Hai ràng buộc hình học khi vẽ**, sai là con vật lơ lửng hoặc chân mọc sai chỗ:
- **Pivot thân = CHỖ YÊN** (code thả pivot vào đúng `withersHeight`)
- **Bụng nằm dưới pivot đúng `W × (1 − legRatio) / bodyRatio` pixel**, chân trước/sau ở
  `pivotX ± 0.17/0.15 × W` (theo `StickmanHorse.FrontLegOffset` / `RearLegOffset`)

### Bảng vật cưỡi

| Khoá | Tên | Lưng | Tốc | Máu | Hứng đòn | Dùng cho |
|---|---|---|---|---|---|---|
| Horse | Ngựa chiến | 0.82 | 1.55 | 8 | 40% | Viking · Nhật |
| Destrier | Chiến mã nặng | 0.90 | 1.32 | 14 | 55% | Âu · Thập tự |
| Courser | Tuấn mã | 0.78 | 1.80 | 6 | 32% | — |
| Steppe | Ngựa thảo nguyên | 0.70 | 1.68 | 5 | 30% | Trung Hoa · Mông Cổ |
| **Camel** | **Lạc đà** | 0.95 | 1.34 | 11 | 48% | **Ả Rập** |
| **Elephant** | **Voi chiến** | 1.15 | 1.05 | 26 | 62% | **Đại Việt · Ấn Độ** |

**Lưng cao thì đòi vũ khí dài** — `minMeleeReach = withersHeight × 1.3` nên lạc đà và voi tự
loại đao/kiếm ngắn, buộc phải cầm thương/kích. Đó chính là lý do lịch sử tượng binh và kỵ lạc
đà cầm thương chứ không cầm đao — **luật cũ tự áp, không viết thêm điều kiện nào**.
Vì thế kỵ binh Ả Rập đã đổi từ đao cong sang **thương**.

Xem bảng đầy đủ cây-nào-cưỡi-được-con-gì bằng
`Tools > Stickman > Weapons > Balance Report` (mục *VỚI TỚI TỪ TRÊN YÊN*) — tool MOUNT THẬT
từng cây lên nhân vật để đo, không phải số gõ tay.

### Ba nền mới

| Nền | Nét riêng | Vật cưỡi |
|---|---|---|
| **Đại Việt** | Nón chóp vành rộng · khiên mây đan · **NỎ** (bắn nhanh) · đại đao · giáo tre | Voi chiến (tượng binh) |
| **Ấn Độ** | Khăn xếp có trâm · khiên dhal **4 núm đồng** · talwar · khanda · chùy gada | Voi chiến (tượng binh) |
| **Mông Cổ** | Mũ viền lông · giáp lá · khiên tròn NHỎ · cung quặp sâu nhất bộ | Ngựa thảo nguyên |

**KỴ XẠ Mông Cổ** là binh chủng đáng chú ý nhất và **không cần code mới**:
`CavalryCombatStrategy` chỉ nhận kỵ binh CẬN CHIẾN, nên cung thủ trên lưng ngựa vẫn kite như
thường — vừa chạy vừa bắn là kết quả tự nhiên của hai hệ có sẵn ghép lại.

⚠ Kỵ xạ khai rõ `rank: UnitRank.Levy` để **phá** luật "cưỡi ngựa = tinh nhuệ": vế cân bằng
*tầm xa KHÔNG giáp* quan trọng hơn — cho kỵ xạ mặc giáp là vừa nhanh, vừa bắn xa, vừa dày,
không có cách nào bắt kịp.


### Nền thứ 15 — AI CẬP CỔ ĐẠI

| Nền | Nét riêng | Vật cưỡi |
|---|---|---|
| **Ai Cập** | Khăn **NEMES** sọc vàng-lam + rắn uraeus · áo vải lanh có **vòng cổ usekh** · khiên da bò **đáy phẳng đỉnh vòm** · KHOPESH + chuỳ thay kiếm thẳng · tuyến cung dày, có cả **cung thủ chiến xa** | Tuấn mã (`Courser` — ngựa kéo xe: nhẹ và nhanh) |

**DÁNG NGOÀI mới phải KHÁC, màu chỉ là vế thứ hai.** Cả 14 nền còn lại đội VÒM · CHÓP ·
KHĂN XẾP tròn, nên Ai Cập lấy đúng thứ không ai có: khăn nemes **thấp mà rộng**, xoè ra hai
bên mặt, kẻ **sọc ngang**. Khiên cũng làm ngược khuôn `Heater` sẵn có (heater = vuông trên /
nhọn dưới; khiên Ai Cập = phẳng dưới / vòm trên) — hai cái đối nhau nên không lẫn được.

**KHÔNG thêm cây vũ khí nào.** Khopesh là đao lưỡi liềm, và `WSaber` đã đúng lớp (lưỡi cong
một tay, đeo khiên được) — vẽ thêm một prefab chỉ để đổi cái tên là đẻ ra một cây phải cân
bằng lại, phải gắn tiếng, phải nối vào bảng, mà không được gì. Cùng lý do, chiến xa dùng lại
đúng khuôn **kỵ xạ Mông Cổ** (`mounted: true` + `rank: UnitRank.Levy`) chứ không có "xe kéo"
nào trong code.

⚠ Nền mới nối vào **CUỐI** mảng `Specs`, không chèn giữa: `LoadAllCivilizations` đi theo đúng
thứ tự mảng đó, mà `CivilizationArena` của `Demo_19` lưu **CHỈ SỐ** hai phe vào scene đã bake.
Chèn giữa là mọi nền sau nó tụt một bậc — không lỗi nào báo, chỉ là bấm vào ra nền khác.


## Ba nước TAM QUỐC — Ngụy · Thục · Ngô (2026-09-08)

> Luật: `Docs/AgentRules/ThreeKingdoms.md` · màn: `Demo_51_ThreeKingdoms` · xem trước nón:
> `.claude/skills/stickman-assets/scripts/helm_three_kingdoms.py`

Ba nền **cùng họ vũ khí Hán với `China`** (đao · kích ji · thương · nỏ) và cùng họ mũ trụ
(vòm sắt + đốn hạng ghép lá), nên cả ba phải tách nhau bằng **đường bao** và **một nét quân sự
riêng** — chỉ tô ba màu là ba nước thành một cái nón ở cỡ 44 px.

| Nước | Phe · cờ | Nón (nét thò ra) | Giáp (khối) | Khiên | Nét quân sự | Vật cưỡi |
|---|---|---|---|---|---|---|
| **Wei** — Ngụy (Tào Ngụy) | 1 · xanh | ống cắm đồng + chùm lông LAM ngả sau, sống mũi | lá sắt xếp so le trên vải lam, đai vai lam chéo | bầu dục cao viền sắt | nỏ cường · HỔ BÁO KỴ nặng | `Destrier` |
| **Shu** — Thục (Thục Hán) | 2 · đỏ | CÁNH PHƯỢNG vàng vút chéo ra sau + tua đỏ, không sống mũi | hộ tâm kính (gương đồng tròn giữa ngực) trên vải đỏ | mây đan tròn (đằng bài), tâm đỏ | nỏ Gia Cát (`WRepeatingCrossbow`) · Vô Đương phi quân phóng lao · kỵ Tây Lương | `Steppe` |
| **Wu** — Ngô (Đông Ngô) | 4 · vàng | vòm THẤP BÈ + khăn vàng quấn dày, nút thắt sau gáy | vảy cá sơn mài đen trên vải vàng | tròn vàng viền đen, chữ V sóng nước | song đao Cẩm Phàm · HOẢ CẦU Xích Bích (`WFirepot`) · kích Thái Sử | `Horse` |

- ⚠ Ngô là phe **4**, không phải 3 — 3 là xanh bệnh của zombie (`TeamMember.ColorOf`).
- Không có cây vũ khí mới: Thanh Long đao = `WGlaive`, xà mâu = `WLance`, roi sắt Hoàng Cái = `WMace`.
- Ba nền nối **CUỐI** `Specs` (sau Ai Cập) — luật chỉ số nền của Demo_19 giữ nguyên.
- Skin vũ khí: dùng lại các hàm tham số hoá của Trung Hoa (`DaoLike` · `HalberdPole` ·
  `LanceKnight` · `CrossbowLike` · `BowVertical` · `SpearLeaf` · `MaceFlanged`), khác nhau ở
  màu cán / cánh cung: Ngụy lam-đồng, nỏ KHÔNG hộp đạn · Thục đỏ-vàng, nỏ CÓ hộp đạn · Ngô
  vàng-đen, cung ngắn quấn dây.


## Ba nền CỔ ĐẠI — Sparta · La Mã · Troy (2026-09-09)

> Luật: `Docs/AgentRules/CivilizationIntake.md` · sân: `Demo_19_Civilizations` · xem trước nón:
> `.claude/skills/stickman-assets/scripts/helm_antiquity.py`

**Vì sao ba nền cổ đại nằm trong bảng TRUNG CỔ.** Thể loại của dự án chia theo **bộ vũ khí**,
không theo niên đại: chưa có thuốc súng thì là `GameGenre.Medieval`. Ai Cập cổ đại đã vào đúng
cửa này từ trước, và nhờ vậy ba nền mới dùng lại nguyên bộ rig · AI · animation · map.

Ba nền cùng họ "vòm kim loại + khiên" với châu Âu và Đông La Mã, nên chúng phải tách nhau bằng
**đường bao** và **một nét quân sự riêng**:

| Nền | Nón (nét thò ra) | Giáp (khối) | Khiên (bóng ngoài) | Nét quân sự | Vật cưỡi · nhà chính |
|---|---|---|---|---|---|
| **Sparta** (Hy Lạp) | vòm ĐỒNG gần bán cầu + MÀO BỜM NGỰA **nằm ngang** vắt qua đỉnh + sống mũi | thorax ĐỒNG đúc hình cơ ngực + múi bụng, váy tua đỏ | **ASPIS** tròn đồng kín, chữ **Λ** đen | TUYẾN GIÁO ĐẶC — giáo dory · thương dài · kỵ thương, **không một cây cung nào** | `Courser` · `Terrace` |
| **Rome** (Lê dương) | galea sắt bát **thấp bè** + MÀO VÂY **đứng** đỏ trên ống cắm + gờ gáy chìa sau | **lorica segmentata** — đai sắt NGANG chạy hết bề ngang trên áo đỏ | **SCUTUM chữ nhật** đỏ + cánh vàng, núm sắt | khiên dày + đoản kiếm, pilum mở màn, **Scorpio** (`WArbalest`) thay cả tuyến cung | `Horse` · `Villa` |
| **Troy** (Ilion) | vòm CAO ghép bốn dải NANH LỢN RỪNG + **đôi nanh vểnh ra trước** + đai vải tím | vải lanh TÍM + đai đồng bản rộng (mitra) + ba vòng xoáy đồng | khiên **SỐ 8** bọc da bò, thắt eo | TUYẾN CUNG DÀY nhất bộ — cung · cung sừng (`WHorseBow`) · cung thủ chiến xa · lao | `Courser` · `Donjon` |

### Ba câu hỏi khác nhau, không phải ba bảng màu

Sparta **không có vũ khí bắn** (chỉ lao + ná dây helot) · La Mã cũng không có cung nhưng đổi lại
có nỏ giàn xuyên giáp mạnh nhất bộ · Troy có **bốn** cây bắn. Ba nền đứng cạnh nhau là ba cách
đánh: áp sát, giữ tuyến rồi mở giáp, và áp chế từ xa. Nếu ba nền chỉ khác nhau ở màu cờ thì
chúng chỉ là ba cái tên trong ô chọn nền — xem luật số 1 của `CivilizationIntake.md`.

### Ba nét hình cố ý vuông góc nhau

Nét thò ra của nón đi **NGANG** (Sparta) · **ĐỨNG** (Rome) · **CHÉO RA TRƯỚC** (Troy). Đó là thứ
duy nhất còn đọc được khi chi tiết bên trong tan hết ở ~44 px. Cộng thêm hai chất liệu chưa nền
nào dùng: **ĐỒNG** làm kim loại nón/giáp (Sparta · Troy) và vải **TÍM** (Troy).

⚠ **Khiên scutum là hình CHỮ NHẬT duy nhất của dự án** — 18 nền còn lại đều tròn hoặc bầu dục.
Đây là bóng ngoài rẻ nhất mà đọc được xa nhất; đừng "sửa" nó thành bo tròn. Khiên số 8 của Troy
cũng vậy: chỗ **thắt eo** là thứ phân biệt nó với khiên bầu dục của Ngụy.

### Không thêm cây vũ khí nào

Xiphos = `WSword` · kopis = `WSaber` (skin cong về trước, phình ở mũi) · gladius = `WSword` ·
pugio = `WSaberShort` · pilum = `WJavelin` · Scorpio = `WArbalest` · cung sừng = `WHorseBow`.
Cùng lý do đã ghi ở Ai Cập: thêm một prefab chỉ để đổi cái tên là đẻ ra một cây phải cân bằng
lại, phải gắn tiếng, phải nối vào bảng. Chiến xa Troy dùng lại khuôn **kỵ xạ** (`mounted: true`
+ `rank: UnitRank.Levy`), không có "xe kéo" nào trong code.

⚠ Ba nền nối vào **CUỐI** mảng `Specs`, sau Tam Quốc — cùng luật chỉ số của `Demo_19`.

### Nhà chính chia ba kiểu khác nhau

`Villa` (hiên cột) cho La Mã đúng nghĩa đen · `Terrace` (bệ đá thu dần, mái bằng) cho Sparta,
đúng chất "Sparta không có tường thành" · `Donjon` (tháp vuông cao) cho Troy, vì thành Ilion nổi
tiếng vì tháp. Ba nền cùng dùng **ngói đất nung** và **cổng vòm tròn** (hai thứ Hy-La để lại cho
châu Âu sau này), tách nhau bằng vật liệu tường: đá vôi trắng · gạch đỏ nung · đá hộc xám.
Troy để `Battlement.Band` — **không răng cưa**, vì răng cưa là phát minh muộn hơn cả nghìn năm.


## THỔ DÂN — và hai móc nối mới: HỌC THUYẾT AI · NGOẠI HÌNH THEO NỀN (2026-09-09)

> Xem trước nón: `.claude/skills/stickman-assets/scripts/helm_antiquity.py` (bốn nón)

### Nền thứ 22 — `Tribal`

| Nón | Giáp | Khiên | Nét quân sự | Vật cưỡi · nhà chính |
|---|---|---|---|---|
| vòm DA **thấp bè nhất bộ** (74×38) + **QUẠT LÔNG CHIM** xoè lên-sau + mỏ xương + răng thú quanh vành | áo da sẫm **vẽ ba chevron xương** + vòng cổ răng thú + gấu tua cỏ (KHÔNG kim loại) | hình **LÁ** nhọn hai đầu, bọc da, zigzag trắng | **nền duy nhất không có quân TINH NHUỆ nào** — bù bằng tuyến NÉM dày nhất (lao · rìu ném · ná) và quân rẻ | `Buffalo` · `Longhouse` |

`UnitRank.Elite` trong dự án này đúng nghĩa là *"được mặc giáp"* (xem `UnitSpec.DefaultRank`).
Thổ dân không có thợ rèn, nên hai quân chủng vốn mặc định lên Elite — **lính khiên** và **kỵ
binh** — được khai TAY xuống `Regular`. Đó là một câu **đo được**, không phải một dòng mô tả:
mở `Loadout_Tribal_*.asset` ra đếm là thấy.

### ⚠⚠ Móc nối 9 — HỌC THUYẾT AI (`CivSpec.doctrine`)

**Ô `UnitLoadout.profile` từng là Ô CHẾT.** Nó khai từ lâu, vài builder có ghi vào
(`StickmanMapSystemBuilder`, `StickmanStealthBuilder`), nhưng:

- `StickmanCivilizationBuilder` **chưa bao giờ ghi** ⇒ cả 22 nền để `null`;
- `UnitLoadout.ApplyTo` **chưa bao giờ đọc** ⇒ dù có ghi cũng không tới được AI (chỉ
  `MapAssembler` mới tự tay gọi `SetProfile`).

Tức "AI theo nền văn minh" có đủ chỗ cắm mà **không có dây nào nối** — biên dịch sạch, chạy
sạch, chỉ là mọi nền đánh giống hệt nhau. Hai đầu dây nay đã nối
(`StickmanCivilizationBuilder.Doctrine.cs` + `UnitLoadout.ApplyTo`).

| Học thuyết | Nền | AI làm gì khác | Vì sao khớp bảng quân chủng |
|---|---|---|---|
| `Phalanx` | Sparta | **không đuổi** (bỏ đuổi sớm), đỡ nhiều, ít vây, không vỡ trận | ba cây họ giáo + không cung ⇒ giá trị nằm ở GIỮ TUYẾN |
| `Legion` | Rome | giữ tuyến như Sparta nhưng nhìn xa hơn, ra đòn liên hoàn hơn | khiên dày + đoản kiếm ⇒ ép sát rồi băm; scorpio cần thấy sớm |
| `Skirmish` | Troy | thích giữ TẦM XA, lùi sớm khi bị ép, chạy nhiều | bốn cây bắn ⇒ để bị áp sát là thua |
| `Swarm` | Tribal | **vây đông** một mục tiêu, đánh liên hoàn, ít đỡ, vỡ trận sớm | quân rẻ không giáp ⇒ thắng bằng số đông |

⚠ **Học thuyết là CỤC BỘ, không phải hệ số toàn cục.** Nền không khai `doctrine` thì
`profile` vẫn `null` và `ApplyTo` không đụng gì — 18 nền cũ giữ nguyên hành vi tới từng nhịp.
Nhân đều một hệ số cho tất cả thì đó là **độ khó**, không phải lối đánh.

⚠ Chỉ chỉnh những ô nói ra đúng câu ở cột "AI làm gì khác". Đụng thêm ô cho "mạnh hơn" là
độ khó trá hình, và làm lệch cả thang cấp AI — `AIPlaybook.SetSmartsLevel` áp bảng cấp **lên
trên** profile gốc, profile lệch chuẩn thì cả năm cấp lệch theo.

### ⚠⚠ Móc nối 10 — NGOẠI HÌNH THEO NỀN (hồ sơ `Civ_<Khoá>`)

Trước 2026-09-09, `StickmanLook` chỉ bốc **ngẫu nhiên theo THỜI KỲ**: hai phe khác nền vẫn ra
cùng một dàn người, khác nhau đúng mỗi cái nón. Nay `CivilizationDefinition.ApplyCivLook` tra
`LookSet_<thời kỳ>` tìm hồ sơ tên **`Civ_<Khoá>`**; có thì lính của nền đó mặc hồ sơ ấy và
**khoá lại**, không thì bốc ngẫu nhiên như cũ.

| Nền | Tóc · mặt | Áo · vật mang |
|---|---|---|
| Sparta | tóc dài + râu (người Sparta để tóc dài — và nó đọc được ở cỡ thật) | áo chẽn + **áo choàng đỏ thẫm** |
| Rome | tóc **cắt sát**, không râu (đối lại Sparta) | áo chẽn đỏ + bao kiếm |
| Troy | tóc bện + băng đầu **tím** | áo choàng **tím** + ống tên |
| Tribal | tóc bù xù + **mặt vẽ**, chi dày 0.085 (không mặc gì che dáng) | khố + băng đầu cam đất |

⚠ **THÂN VẪN ĐEN** — luật số 1 không đổi. Bốn hồ sơ chỉ đụng tóc · mặt · áo · băng đầu · vật
sau lưng. Nền cần thân màu là chủng Fantasy, không phải nền văn minh trung cổ.

⚠ **Không khai `Torso_Plate`** cho nền nào ở đây: giáp THẬT (có điểm giáp, đánh rớt được) do
`EquipmentDefinition` phát. Hai lớp giáp chồng nhau thì lúc giáp thật rớt vẫn còn cái vẽ dính
trên người — đúng bệnh *"vớt nón rồi mà vẫn thấy nón"*.

⚠ Phải `locked: true`, không thì thứ tự `Start` quyết định ai thắng: `StickmanLookAssigner`
cố ý nhường hồ sơ đã khoá, nhưng hai đường đều "đúng phần việc của mình" nên không lỗi nào báo.

### Còn ANIMATION thì sao

**Không có, và đó là câu trả lời đúng.** Animation trong dự án này đi theo **CÂY VŨ KHÍ**, không
theo nền — `AGENTS.md` chốt *"giữ rig/AI/animation dùng chung"*. Bốn nền mới không mở cây vũ khí
nào (đếm được: số cây có ít nhất một nền phát vẫn là **34** trước và sau), nên mọi đòn của họ
dùng lại đúng animation đã có. Đẻ animation riêng cho một nền là đẻ một bộ phải nuôi song song
với bộ chung, và lần sau sửa nhịp đánh thì sửa hai chỗ.

