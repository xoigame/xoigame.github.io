# Sinh asset bằng code / AI — HÌNH · HẠT · TIẾNG

Dự án này sinh gần như toàn bộ asset bằng CODE: nón/giáp/khiên 13 nền văn minh, sprite vũ khí,
mặt người, bối cảnh, sprite effect, và (khi gói SFX không có sẵn) cả tiếng động. Lý do là lý
do của cả dự án: **thứ gì lặp lại được thì phải là tool** — art gõ tay một lần thì lần sau
thêm một nền văn minh lại phải mở Photoshop.

File này gom ba làn đó lại. Bộ script Python đi kèm nằm ở
`.claude/skills/stickman-assets/scripts/` (`canvas.py`, `sfx.py`), skill hướng dẫn dùng ở
`.claude/skills/stickman-assets/SKILL.md`.

---

## 0. Luật bao trùm — CẢ BA LÀN HỎNG TRONG IM LẶNG

| Sai cái gì | Triệu chứng | Có lỗi báo không |
|---|---|---|
| Nón vẽ sai khối | "cái chụp đèn trên tấm ván" | KHÔNG |
| Nón đo bằng cả khung ảnh | nón NHỎ HƠN CÁI ĐẦU | KHÔNG |
| Object hạt quên xoay −90° X | hạt bay vào camera, trông như đứng im | KHÔNG |
| Particle gán Sprite thay Material | không thấy hạt nào | KHÔNG |
| Vũ khí mới quên nối bảng SFX | cây đó lặng lẽ không kêu | KHÔNG |
| `PlayClipAtPoint` thay `StickmanAudio` | cắm clip đủ chỗ mà nghe rất nhỏ | KHÔNG |

Vì vậy quy trình BẮT BUỘC có bước kiểm bằng giác quan. Với art thì AI tự nhìn được; với
tiếng thì AI chỉ ĐO được, phải đưa file cho người nghe; với hạt thì phải vào Play mà xem.
Đọc lại code rồi tin là nó đúng — đó chính là cách bộ nón hỏng sống sót nhiều tháng.

---

## 1. HÌNH — pixel art sinh bằng code

### 1.1 Ai vẽ cái gì

| File | Vẽ |
|---|---|
| `WeaponArtGenerator` | sprite vũ khí + **`PixelCanvas`** (khổ vẽ dùng chung cho mọi generator) |
| `CivilizationArtGenerator` | nón · giáp · khiên · skin vũ khí của 13 nền + shape helper cấp cao |
| `HeadArtGenerator` | mặt người, mặt từng loại zombie (`EnsureBreedFace`) |
| `StickmanEnvironmentArt` | nền trời · đồi · cỏ · cây · đá · đế lửa + **material cho hạt** |
| `StickmanBuildingArt` | tường · tháp · cổng · nhà (art thật thì cắt sheet ở `Art_Incoming`) |
| `NavalArtGenerator` | thân thuyền · buồm · cờ · cột · pháo |
| `StickmanEffectBuilder` | sprite effect (vệt chém, chớp nòng, máu, khói, nổ) + prefab + bảng |

### 1.2 API vẽ

`WeaponArtGenerator.PixelCanvas` — gốc toạ độ ở **góc DƯỚI TRÁI** (texture Unity):

```
SetPixel(x, y, color)
Rect(x0, y0, x1, y1, color)                 // BAO GỒM cả hai đầu
Circle(cx, cy, radius, color)
TaperRight(x0, x1, centerY, halfStart, halfEnd, color)
Line(x0, y0, x1, y1, thickness, color)
```

`CivilizationArtGenerator` (private, khổ nón 96×72, pivot 0.5/0.25):

```
EllipseShape(canvas, cx, cy, rx, ry, color)              // khối đặc
EllipseRing(canvas, cx, cy, rx, ry, thickness, color)    // chỉ vành, không đụng ruột
ClipToEllipse(canvas, cx, cy, rx, ry)                    // xoá mọi thứ NGOÀI khối
ConeShape(canvas, cx, baseY, apexY, halfBase, curve, color)
Dome(canvas, cx, baseY, radius, fill)
TaperUp(canvas, cx, y0, y1, halfBottom, halfTop, outline, fill)
CutFace(canvas)                                          // FaceLine = 16
```

### 1.3 BA LUẬT VẼ NÓN

Phá luật nào cũng ra "cái bàn có chân". Đã dính với Đại Việt · Mông Cổ · Ấn Độ (nón thành
chụp đèn trên tấm ván, và cái bánh kem xếp tầng), rồi dính lại y hệt với 4 nón viết sau
(Byzantine · Ottoman · Rus · Persia).

1. **MỘT KHỐI LIỀN CÓ VIỀN** — chi tiết nằm TRONG khối. Ghép `Rect` phẳng cạnh nhau thì mắt
   đọc ra "mấy tấm ván xếp chồng", không đọc ra cái nón. Dùng `EllipseShape` + `EllipseRing`
   + `ClipToEllipse` (vẽ hoa văn TRÀN ra rồi cắt gọn theo khối) và `ConeShape` cho chóp.
2. **DẢI PHẢI HẸP HƠN VÒM** và cong theo vòm. Dải rộng hơn khối chính là ra ngay "tấm ván kê
   dưới" — đó đúng là thứ đã biến cái vòm Mông Cổ thành cây nấm.
3. **DƯỚI `FaceLine` (16) LÀ MẶT** — chỉ được vẽ hai BÊN, cấm bịt ngang. Và `CutFace` phải
   gọi **SAU CÙNG**: cắt trước rồi vẽ viền là cái viền vẽ lại đúng phần vừa cắt (ra một cung
   tròn lơ lửng dưới cằm).

Thêm hai luật chung cho mọi art của bộ:

4. **THÂN + ĐẦU LUÔN ĐEN** — chia phe bằng ĐỒ, không nhuộm màu thân. Nhuộm là mất chất stickman.
5. **Art cần TINT thì phải vẽ THANG XÁM** (lông ngựa, đồi xa): `SpriteRenderer.color` NHÂN
   vào sprite, vẽ nâu sẵn thì tô gì cũng ra nâu × màu đó.

### 1.4 Đo bằng PHẦN VẼ ĐƯỢC, không phải khung ảnh

`sprite.bounds` là **cả tấm ảnh kể cả viền trong suốt**, mà bộ nón dự án chừa viền từ **12%
tới 42%**. Cho khung ảnh vừa 1.35 lần cái đầu thì nón VẼ THẬT ra `0.79×`–`1.19×`: nón Viking
và Thập tự **nhỏ hơn cái đầu**.

- Runtime/editor: `StickmanRigMetrics.FitOpaqueWidth/FitOpaqueHeight` + `OpaqueCenterOffset`.
- Lúc thử ở Python: `Canvas.opaque_bounds()`.
- Bộ nhiều sprite thì **mỗi cái một hệ số** (`StickmanAppearanceSet.helmetScales[]`), một hệ
  số chung chỉ vừa đúng tấm đầu tiên. Tỉ lệ chuẩn: nón = **1.45 × đường kính đầu**.

### 1.5 Quy trình: vẽ ở Python TRƯỚC, port C# SAU

Mở Unity chỉ để xem một cái nón thì đắt, và tệ hơn là dễ bỏ qua. `canvas.py` là bản mô phỏng
`PixelCanvas` **cùng tên hàm, cùng công thức**, nên số bắt được ở đó dán sang C# là ra đúng
hình đó.

```python
import sys; sys.path.insert(0, r'.claude\skills\stickman-assets\scripts')
from canvas import Canvas, sheet, FACE_LINE

OUT = (38, 36, 28, 255); STEEL = (112, 118, 128, 255); GOLD = (198, 164, 74, 255)

def helm_new():
    c = Canvas(96, 72)
    c.EllipseShape(48, 32, 26, 28, OUT)
    c.EllipseShape(48, 32, 23, 25, STEEL)
    c.EllipseRing(48, 32, 26, 28, 3, OUT)
    c.ConeShape(48, 56, 68, 5, 0.3, GOLD)
    c.CutFace()
    return c

sheet([('New', helm_new()), ('Cũ', helm_old())], 'sheet.png', scale=4)
print(helm_new().opaque_bounds())
```

rồi **Read `sheet.png`** — nhìn thật, không đọc code. Lặp tới khi đạt rồi mới chép sang C#
và bấm tool sinh art trong Unity.

⚠ **Trục y ngược nhau**: Unity y=0 ở ĐÁY, PIL y=0 ở ĐỈNH. `Canvas.save()` tự lật, nên lúc vẽ
cứ nghĩ theo Unity, đừng tự bù trừ.

### 1.6 Sinh art xong

- `CivilizationArtGenerator.EnsureAll` chỉ **BÙ FILE THIẾU** (`GenerateMissing`); menu "1"
  mới ghi đè và có hộp xác nhận — trước đó `EnsureAll` gọi `GenerateAll` nên suýt đè mất bộ
  nón art thật.
- ⚠ Đừng dò "đã đủ art chưa" bằng DANH SÁCH RÚT GỌN. Đã sai hai lần theo đúng một kiểu (lần
  đầu mất skin vũ khí, lần sau mất sạch GIÁP của 5 nền) vì danh sách kiểm không được cập nhật
  khi thêm loại file mới.
- ⚠ Đừng bọc bước sinh asset trong `AssetDatabase.StartAssetEditing()` — trong batch đó
  `LoadAssetAtPath` trả **null** cho file vừa ghi, mà mọi generator đều load lại sprite ngay
  sau khi ghi.
- **Art thật (vẽ tay / AI vẽ)** thì đi đường khác: thả PNG vào `Assets/Art_Incoming/` →
  `Buildings > 2. Cắt sheet` (cắt theo ĐẢO PIXEL ĐẶC, pivot đáy giữa). Đọc file bằng
  `File.ReadAllBytes` + `Texture2D.LoadImage`, KHÔNG qua `sprite.texture.GetPixels`.

---

### 1.7 Bản sắc theo NỀN / MÔI TRƯỜNG + nút vẽ lại toàn bộ (2026-09-08)

**Vì sao.** 7 nền có sheet công trình thật; **11 nền** (Europe · Crusader · Viking · Rus ·
Persia · Egypt · Ottoman · Pirate · Wei · Shu · Wu) rơi về bộ `Default` đá xám. Đồi theo biome
là tổng sin đổi biên độ. Người dùng chốt: bản dự phòng cũng phải đọc ra được nền và môi trường.

**Công trình theo nền** — `StickmanBuildingArt.Civilizations.cs`, một bảng `CivStyles`
(18 dòng) + 4 generator tham số hoá. Mỗi dòng chọn: `Masonry` (Ashlar · Rubble · Brick · Log ·
Adobe · Banded · Plank) · `Battlement` (Square · Stepped · Stake · Eave · Rail · Band) · `Cap`
(Machicolated · Cone · Dome · Onion · Pagoda · Thatch · Pylon · CrowNest · Yurt) · `Arch`
(Round · Pointed · Square · Eave) · `Roof` (Tile · Thatch · Curved · Dome · Flat · Gable · Yurt
· Onion) + màu tường/mái/viền/nhấn. Ví dụ: Viking = Log + Stake + Thatch + Square + Thatch;
Rus = Log + Square + Onion; Egypt = Adobe + Band + Pylon (tường xiên); Tam Quốc = khung Trung
Hoa đổi màu viền (Nguỵ xanh · Thục đỏ · Ngô vàng). Khổ canvas và mốc đi/sàn giữ y bộ Default.
Xem trước không cần Unity: `scratchpad/preview_civ.py` (port cùng công thức, `polish()` của
`envcanvas.py`) — đã nhìn cả 18 nền ở 40 px/đơn vị trước khi port.

**Môi trường** — `StickmanEnvironmentArt`: `HillShape` (Rolling · Dunes · Peaks · Cone · Marsh)
trong `RidgeHeight`, và 7 prop mới `Tree_Palm · Cactus · Tree_PineSnow · Tree_Birch ·
Tree_Willow · Reeds · Rock_Basalt`. Nối vào map qua `MapLibrary.biomeProps` (builder
`StickmanMapSystemBuilder` điền; `MapScenery.ScatterFoliage` hỏi trước bộ chung). Thông/sồi/đá
gốc thêm tầng lá, bóng dưới tán, mặt thứ ba — silhouette giữ nguyên.

**Nút force** — `StickmanArtSource.RedrawAllCodeArt` chạy: `WeaponArtGenerator.GenerateAll` →
`CivilizationArtGenerator.RegenerateAll` + `EnsureModernFactions(overwrite: true)` →
`HeadArtGenerator.GenerateAll` → `StickmanEnvironmentArt.GenerateAll` →
`StickmanBuildingArt.RegenerateAll` (cờ `_forceRedraw` mở khoá `EnsureOne`) →
`StickmanStructureArt.GenerateAll` → `StickmanEffectBuilder.EnsureAll(force)` →
`NavalArtGenerator.RegenerateAll` → `StickmanCivilizationBuilder.BuildAssets` +
`StickmanRanchBuilder.BuildAll` → `ReportSkipped` → `StickmanArtSheet.BuildSheets`.
Sheet mới `Buildings_Civilizations.png` gom 18 nền, tên tấm kèm thư mục cha.

## 2. HẠT — particle effect

### 2.1 Luật phân chia: TĨNH là SPRITE, CHUYỂN ĐỘNG là HẠT

| | Sprite | ParticleSystem |
|---|---|---|
| Ví dụ | ngọn lửa, vệt chém, nền trời, đồi, đế lửa | sao lấp lánh, tàn lửa, khói, bụi, tia |
| Vì sao | cần đọc ra DÁNG từ xa, cần lặp liền mạch | nhiều mảnh, **mỗi mảnh một nhịp riêng** |

Bản đầu của trời sao làm kiểu ảnh lát gạch cho mờ-tỏ: cả mảng sao nhấp nháy **cùng một
nhịp** nên mắt đọc ra "màn hình đang chớp", không đọc ra "sao đang lấp lánh". Bản đầu của
tàn lửa thì tự nuôi một mảng `SpriteRenderer` rồi dời tay mỗi frame — chạy được, nhưng đó là
**viết lại một hệ hạt tệ hơn**: không noise, không dải màu theo đời hạt, sửa gì cũng phải mở
code thay vì đổi số trên component.

### 2.2 Bốn bẫy "dựng xong mà không thấy gì"

1. **Object hạt phải xoay −90° quanh X.** `ParticleSystem` phát theo **+Z local**, game này
   2D — không xoay là hạt bay dọc trục nhìn, trông như đứng im tại chỗ.
2. **Particle KHÔNG nhận `Sprite`, nó cần `Material`.** Dùng shader **`Sprites/Default`**:
   luôn có mặt (không bị strip khỏi build) và tôn trọng MÀU ĐỈNH, tức `startColor` /
   `colorOverLifetime` ăn thẳng. `StickmanEnvironmentArt` sinh sẵn `Mat_Star.mat`, `Mat_Ember.mat`.
3. **`prewarm = true`** — thiếu là vào trận đêm trời TRỐNG TRƠN rồi sao mới lác đác mọc.
4. **Ô phát co giãn theo khung nhìn** (mỗi scene một `orthographicSize`) và nền trời phải
   **bám camera** (map dài 60 unit mà màn hình chỉ thấy ~24).

### 2.3 Mẫu chuẩn để chép

- `Assets/Scripts/Combat/Structures/CampFire.cs` — tàn lửa: dải màu theo đời hạt (vàng → cam → đỏ → tắt),
  nhỏ dần, noise lắc ngang, trọng lực ÂM cho hơi nóng đẩy lên, `simulationSpace = World`.
- `Assets/Scripts/Combat/World/SkyBackdrop.cs` — sao: `simulationSpace = Local`, shape Box co theo
  khung nhìn trong `LateUpdate`, chỉ bật ban đêm qua sự kiện `DayNightCycle.PhaseChanged`.

Ngọn lửa (phần sprite) nhấp nháy bằng **TỔNG BA SIN lệch tần** (11.3 / 6.7 / 3.1 Hz), KHÔNG
bằng `Random` mỗi frame — random mỗi frame ra lửa rung giật. Mỗi đống lửa một `seed`, không
thì cả sân cháy đồng loạt như một.

### 2.4 Effect chiến đấu đi qua BẢNG CHUNG

`EffectManager.Play(EffectEvent.Attack, vị trí, hướng, vũ khí)` — KHÔNG `Instantiate` prefab
hiệu ứng trực tiếp. Bảng `EffectLibrary` (`Assets/Resources/EffectLibrary.asset`) tra theo
**(sự kiện + LỚP VŨ KHÍ)** nên thêm vũ khí mới chỉ là thêm 1 dòng; effect chạy qua
`ObjectPool`, không sinh rác. Prefab cắm riêng vẫn thắng bảng chung (`_attackVfx`,
`_deathVfx`, `_explosionVfx`). Prefab `ParticleSystem` cũng dùng được, miễn có `EffectInstance`.

⚠ **Đồ trang trí KHÔNG BAO GIỜ CÓ COLLIDER.** Cây/đá/bụi/lửa là hình thuần — gắn collider là
`StickmanAgent.UpdateBlockedPath` nhận nhầm làm vật cản và cả tiểu đội đứng đập một bụi cỏ.

---

## 3. TIẾNG — SFX

### 3.1 Tìm trong gói TRƯỚC, tự sinh SAU

86 clip có sẵn trong `Assets/Sounds/SFX` (chọn từ *Ultimate SFX Bundle*). Bảng
`StickmanAudioBuilder.Library` là **nguồn sự thật**: thêm 1 dòng rồi bấm `Audio > 2`, ĐỪNG
kéo tay từng ô `AudioClip`. Chỉ tự sinh khi gói không có thứ cần (tiếng niệm chú của một cây
trượng kiểu mới, tiếng một trạng thái mới, tiếng máy công thành).

### 3.2 Sinh bằng `sfx.py`

WAV 16-bit mono 44.1 kHz — đúng định dạng các clip đang có.

```python
import sys; sys.path.insert(0, r'.claude\skills\stickman-assets\scripts')
from sfx import *

clip = trim_silence(magic_cast(0.9, base=380, seed=11))
save_wav('Assets/Sounds/SFX/Magic/Cast_Frost.wav', clip)
print(report('Assets/Sounds/SFX/Magic/Cast_Frost.wav', png='cast.png'))
```

| Nhóm | Hàm |
|---|---|
| Nguyên liệu | `noise` · `tone` · `sweep` |
| Bao biên độ | `env_decay` (va chạm) · `env_adsr` (ngân) · `env_swell` (vung qua) |
| Lọc | `lowpass` · `highpass` · `bandpass` (có `order` — chồng tầng) · `resonator` |
| Công thức sẵn | `swing` · `impact_metal` · `impact_flesh` · `bow_release` · `magic_cast` · `magic_release` · `explosion` · `footstep` · `pickup` |
| Xuất & đo | `normalize` · `trim_silence` · `fade_edges` · `save_wav` · `report` |

**Bốn bẫy đã dính khi viết bộ này** (đều bắt được bằng `report()`, không bắt được bằng cách
đọc code):

- **Lọc một tầng là chưa lọc.** `lowpass` một cực dốc 6 dB/quãng tám: nhiễu trắng lọc ở 700 Hz
  vẫn cho `centroid_hz` ≈ 4000 — cú thụi vào người nghe ra tiếng "xì". Phải `order=3..4`.
- **`resonator` đừng nhân hệ số `(1 - r)`.** q cao thì hệ số đó ≈ 0.002, tiếng ngân bị dìm
  mất và cú gõ kim loại chỉ còn là nhiễu (`centroid_hz` ~11 kHz = đúng bằng nhiễu trắng).
  Chuẩn hoá theo đỉnh của chính nó.
- **Vuốt đầu file 3 ms là ĂN MẤT cú đánh.** Năng lượng dồn hết vào mấy mili-giây đầu; đo ra
  `peak_dbfs` tụt từ −1 xuống −5.5 (đã dính với `footstep`). Đầu vuốt 0.5 ms, đuôi mới vuốt dài.
- **Đuôi im lặng.** Bao hàm mũ không về 0 thật: clip 0.45 s có thể chỉ kêu 0.159 s rồi kéo
  theo 0.3 s im — mỗi cú đánh giữ một `AudioSource` sống lâu gấp ba lần cần. `trim_silence()`.

### 3.3 Kiểm — AI KHÔNG NGHE ĐƯỢC

Đây là khác biệt lớn nhất so với làn HÌNH. Không bao giờ tuyên bố "tiếng chém nghe rất đã".
Làm được đúng hai việc:

1. `report()` trả số: `duration` · `peak_dbfs` (≈ −1 là vừa) · `rms_dbfs` · `clipped` (phải 0)
   · `dc_offset` (lệch xa 0 = loa ục, phí biên độ) · `centroid_hz` (< 400 đục, > 4000 chói).
2. `png=` vẽ **dạng sóng + phổ theo thời gian** — nhìn ra ngay bao biên độ, chỗ chạm trần,
   đuôi thừa. Đọc bằng Read tool.

Rồi **đưa file .wav cho user nghe** và chờ xác nhận. Cùng tinh thần với luật "phải NHÌN art
trước khi chốt", chỉ khác là tai người thay cho mắt.

### 3.4 Luật gắn tiếng của dự án

- **Phát tiếng qua `StickmanAudio.Play/PlayVaried`, KHÔNG `AudioSource.PlayClipAtPoint`** —
  nó tạo AudioSource 3D, camera game ở z = −10 nên rolloff bóp âm lượng còn ~1/10. Triệu
  chứng: cắm clip đủ chỗ mà chơi không nghe thấy gì.
- `MagicWeapon` **đi nhánh riêng** trong `WireWeapon` (`_castClip` niệm + `_releaseClip` phóng)
  — nó không kế thừa `MeleeWeapon`/`RangedWeapon` nên không nhánh nào khác chạm tới. Nghe ra
  đang niệm hay đã phóng là điều kiện để ĐỌC TRẬN: niệm dở mà trúng đòn là vỡ bài.
- **Đạn phép không gán `Launch`** — tiếng phóng đã do `_releaseClip` kêu, gán thêm là hai
  tiếng chồng nhau (cùng bẫy với `_attackClip` của khiên).
- **Thế thủ** lấy `DefaultGuardClip` cho MỌI cây cận chiến, không kê tay từng dòng.
- `EffectLibrary.clip` để TRỐNG là **cố ý** — cả 8 `EffectEvent` đã có tiếng ở phía vũ khí
  hoặc phía giọng nói, đổ thêm vào bảng effect là kêu hai lần.
- Đừng gán `StickmanController._hurtClip/_deathClip` — đã có `StickmanCombatVoice`.
- **Không dùng nhạc nền** (đã thử rồi bỏ): chỉ tiếng vũ khí + tiếng người + bước chân.
- ⚠ **Thêm vũ khí mà quên nối vào bảng thì KHÔNG có lỗi nào báo** — cây đó chỉ lặng lẽ không
  kêu, giữa trận đông người thì tai không nghe ra. Đã dính đúng vậy với 20 cây và 5 loại đạn
  phép. `WireToPrefabs` nay tự đối chiếu với **prefab CÓ THẬT trên đĩa** (`FindSilentPrefabs`)
  rồi réo tên cây còn câm — đừng thay bằng danh sách gõ tay, chính nó sẽ lỗi thời.

---

## 4. Xong việc thì còn hai bước

1. **Chạy lại tool sinh asset** (`Tools > Stickman > ★ Bảng điều khiển`, Ctrl+Alt+S). Sửa code
   generator KHÔNG tự chui vào file art/prefab đã có trên đĩa. Tool nào SINH RA FILE thì phải
   khai `proof:` — không khai thì `StickmanReadiness` **không bao giờ báo thiếu**, đúng cái
   vòng im lặng đang chữa.
2. **Scene đã bake không tự sửa theo code builder** — cần thì dựng lại qua `Build > 0. Bảng dựng`.

## Liên quan

- `Docs/KnowledgeBase/Effects.md` — bảng `EffectLibrary`, pool, thay art thật
- `Docs/KnowledgeBase/Audio.md` — bộ SFX đã chọn, clip nào kêu ở đâu
- `Docs/KnowledgeBase/Civilizations.md` — quy ước folder/tên sprite từng nền
- `Docs/KnowledgeBase/Archetypes-Visual-Identity.md` — làm nhân vật khác biệt mà không vẽ thân mới
- `.claude/skills/stickman-assets/` — skill + hai script `canvas.py`, `sfx.py`

## VIỀN + BÓNG SÁNG cho sprite vũ khí — làm ở TẦNG SAVE

`WeaponArtGenerator.Polish`, gọi trong `Save`.

**Vấn đề:** art vũ khí cũ là **khối màu PHẲNG, KHÔNG VIỀN**. Trên nền trời xám và cạnh cái thân
stickman **ĐEN ĐẶC**, cây vũ khí không có đường bao thì bệt vào nền — đúng cái người chơi đọc ra
là *"vẽ cũ và xấu"*. Không phải sai cỡ, không phải sai hình: thiếu đường bao.

**Đòn bẩy:** `Save` là chỗ **DUY NHẤT** mọi cây đi qua — kể cả **5 bản theo CẤP** và **skin vũ
khí của 15 nền văn minh** (cả hai đều gọi lại chính hàm đó). Một chỗ sửa, cả nghìn tấm đổi theo,
**không hàm vẽ nào phải sửa**. Cùng đòn bẩy đã dùng cho vật liệu theo cấp.

Ba bước, **thứ tự quan trọng**:
1. chụp mặt nạ ĐẶC/RỖNG của bản GỐC — làm sau bước 2 thì chính viền vừa vẽ bị tính là đặc, vòng
   sau lại nở thêm một lớp viền nữa;
2. pixel RỖNG mà cạnh một pixel đặc → tô màu viền;
3. pixel ĐẶC ở mép TRÊN → nhân sáng 1.28, mép DƯỚI → nhân tối 0.80. Cho ra hướng sáng nhất quán
   cả bộ mà không hàm vẽ nào phải biết.

⚠ **Viền nở RA NGOÀI, không thụt vào trong** — canvas nới `OutlinePad` = 2 px mỗi phía. Vẽ viền
thụt vào thì lưỡi kiếm mảnh 6 px bị ăn mất 2 px mỗi bên, còn 2 px, mất hẳn hình.

⚠ **Nới canvas thì PIVOT PHẢI QUY ĐỔI LẠI** (`Polish` tự làm) — quên là chỗ nắm tay lệch vài
pixel trên toàn bộ 53 cây.

⚠ **Màu viền KHÔNG dùng đen tuyệt đối** (dùng `20,18,24`): thân stickman đã là khối đen, viền
đen tuyệt đối làm vũ khí dính vào thân đúng lúc cần tách ra nhất.

⚠⚠ **CHỈ ÁP CHO VŨ KHÍ** (`Save(..., polish: false)` cho phần còn lại). Nón · giáp · khiên của
nền văn minh đã TỰ VẼ VIỀN bên trong (luật "một khối liền có viền"), thêm lớp nữa là dày gấp
đôi; và khổ ảnh của chúng là **dấu nhận diện** của `CivilizationArtGenerator.GeneratedSizes` —
nới khổ là tool *"dọn art code-gen lỗi thời"* không còn nhận ra chính sản phẩm của mình.
