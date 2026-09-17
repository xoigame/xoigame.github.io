# Bộ PROMPT sinh ART BỐI CẢNH bằng ChatGPT — chân trời · mặt đất · cây theo MÔI TRƯỜNG

> Theo **LUẬT NGUỒN ASSET** trong `AGENTS.md`: art bối cảnh vẽ bằng code
> (`StickmanEnvironmentArt`) là **bản nháp**: đủ để bảy môi trường KHÁC NHAU ngay hôm nay,
> nhưng là sin + tam giác. Muốn đẹp thì đặt art thật qua ChatGPT theo bộ prompt này — **cùng
> tên file là thế vào được**, không phải sửa code (mọi tấm đều được nạp theo tên).

---

## 0. Cách hệ thống đọc art bối cảnh (đọc trước khi đặt hàng)

| Lớp | File | Ai nạp | Hợp đồng |
|---|---|---|---|
| Chân trời xa / gần theo môi trường | `Sprites/Environment/Hill_Far_<Suffix>.png` · `Hill_Near_<Suffix>.png` | `StickmanEnvironmentBuilder.AddSky` → `SkyBackdrop.EditorSetBiomeHills` | **THANG XÁM** (trắng trên nền trong suốt), **LẶP LIỀN MẠCH theo X**, pivot mép dưới, 512×256 |
| Dải mặt đất theo môi trường | `Sprites/Environment/Ground_Top_<Suffix>.png` | `StickmanMapSystemBuilder.FillIngredients` → `MapLibrary.biomeGroundTops` | **CÓ MÀU** (không nhuộm), lặp theo X, 256×128, pivot mép trên |
| Đỉnh núi rời · mây | `Peak_*.png` · `Cloud_*.png` | `SkyBackdrop.ScatterHorizon` | thang xám (vẽ bằng ALPHA), pivot đáy giữa |
| Tán cây lắp ghép | `Part_Tree_Canopy*.png` | `StructurePartSet` | có màu; biome nhuộm thêm (`canopyTint`) nên vẽ **XANH TRUNG TÍNH** |

`<Suffix>` theo `BiomePalette.Look`: **Forest** (rừng, dùng chung cho rừng thu) · **Dunes** (sa
mạc) · **Snow** · **Swamp** · **Volcano**. Mặt đất: **Sand · Snow · Ash · Marsh · Autumn**.

⚠ Vì sao chân trời phải **thang xám**: `SkyBackdrop` NHÂN màu ngày/đêm/hoàng hôn vào cả tấm.
Vẽ màu sẵn là về đêm sa mạc vẫn vàng rực — "trời không tối". Màu thật nằm ở `BiomePalette`.
⚠ Vì sao phải **lặp liền mạch**: tấm được lát gạch ngang 6 lần khung nhìn. Biên trái không khớp
biên phải là một vết gãy chạy dọc trời, không lỗi nào báo.

---

## 1. SÁU RÀNG BUỘC — dán vào ĐẦU mọi prompt bối cảnh

```
Kỹ thuật bắt buộc, không được bỏ qua cái nào:
1. NỀN TRONG SUỐT hoàn toàn (PNG alpha). Không khung, không chữ, không watermark.
2. NHÌN NGANG (side view) — đây là game 2D đi ngang. Không phối cảnh chim bay.
3. LẶP LIỀN MẠCH THEO CHIỀU NGANG: mép trái ảnh phải nối khít mép phải (seamless tile).
   Tự kiểm bằng cách ghép hai bản cạnh nhau — không được thấy đường nối.
4. Chân trời: vẽ THANG XÁM (silhouette trắng đặc, càng xa càng nhạt), KHÔNG tô màu — máy
   nhuộm màu lúc chạy theo giờ trong ngày.
5. Mép dưới ảnh là ĐƯỜNG CHÂN TRỜI: phần dưới đặc kín (không hở), phần trên là hình dáng.
6. Đơn giản, bóng đặc, không chi tiết vụn: ảnh bị thu nhỏ còn ~3 đơn vị cao trên màn; thứ còn
   đọc được là ĐƯỜNG VIỀN ĐỈNH và NHỊP LẶP.
```

---

## 2. CHÂN TRỜI — mỗi môi trường HAI tấm (xa + gần)

Khổ **512×256**. Tuyến XA: đỉnh chiếm 40–55% chiều cao, ít chi tiết. Tuyến GẦN: đỉnh 30–45%,
nhiều chi tiết hơn (cây, đá), đậm hơn.

| Môi trường | File | Mô tả cho ChatGPT |
|---|---|---|
| Rừng rậm | `Hill_Far_Forest` | dãy đồi tròn thấp, sống đồi lởm chởm ngọn thông nhỏ đều nhau |
| | `Hill_Near_Forest` | hàng cây dày đặc sát nhau (thông + sồi), tán chồng tán, cao thấp lẫn lộn |
| Sa mạc | `Hill_Far_Dunes` | cồn cát sóng dài, thoải, không cây; vài mỏm đá bàn (mesa) xa |
| | `Hill_Near_Dunes` | cồn cát gần với sống cát sắc, một hai cây xương rồng, mỏm đá |
| Tuyết | `Hill_Far_Snow` | dãy núi nhọn cao, đỉnh răng cưa |
| | `Hill_Near_Snow` | đồi tuyết tròn + lác đác thông phủ tuyết |
| Đầm lầy | `Hill_Far_Swamp` | gần như phẳng, vài gò thấp |
| | `Hill_Near_Swamp` | cây chết trơ cành, liễu rủ, lau sậy — cao thấp lởm chởm |
| Núi lửa | `Hill_Far_Volcano` | vài nón núi lửa dốc, một cái có miệng phẳng |
| | `Hill_Near_Volcano` | vách đá đen sắc cạnh, cột đá, không cây |

Prompt mẫu (một tấm):

```
[6 ràng buộc ở §1]
Vẽ SILHOUETTE THANG XÁM một dãy đồi rừng rậm nhìn ngang cho game 2D, khổ 512×256, lặp liền
mạch theo chiều ngang. Tuyến GẦN: hàng cây thông và sồi dày đặc sát nhau, tán chồng tán, cao
thấp lẫn lộn, đỉnh cây cao nhất chạm 45% chiều cao ảnh, phần dưới đặc kín tới mép dưới.
Trắng đặc trên nền trong suốt, mép trên hơi mềm (anti-alias), không texture, không màu.
```

---

## 3. DẢI MẶT ĐẤT — mỗi môi trường MỘT tấm

Khổ **256×128**, lặp theo X, **có màu**. Bố cục từ trên xuống: lớp phủ (cỏ/cát/tuyết/tro/bùn/
lá) dày ~25% → đất chuyển màu đậm dần xuống đáy, rải sỏi. Mép TRÊN là mặt đất (pivot mép trên).

| File | Lớp phủ | Đất |
|---|---|---|
| `Ground_Top_Sand` | cát vàng sáng, gờ cát nhỏ | nâu cát, sỏi nhạt |
| `Ground_Top_Snow` | tuyết trắng xanh, mép gợn | đất xám lam lạnh |
| `Ground_Top_Ash` | tro xám nâu ám đỏ, vệt than | đất đen |
| `Ground_Top_Marsh` | cỏ úa xanh vàng, vũng bùn | đất tối ẩm |
| `Ground_Top_Autumn` | cỏ ngả vàng cam, lá rụng | đất nâu |

Bảng màu tham chiếu nằm trong `StickmanEnvironmentArt.GenerateGroundTop` (năm bộ số) — dán
mã màu vào prompt để art thật khớp với màu đất mà `BiomePalette.Ground` nhuộm thân đất cong.

---

## 3b. VẬT CHE FANTASY — năm tấm (2026-09-08)

Bản nháp do `StickmanBuildingArt.Fantasy` vẽ bằng code. Thả PNG cùng tên vào
`Assets/Sprites/Buildings/Fantasy/` là code tự chừa tấm đó ra (`StickmanArtSource.CanCodeWrite`).

| File | Khổ | Vai trò trong trận | Cao THẬT trên sân |
|---|---|---|---|
| `Prop_ArcaneWard.png` | 160×90 | vật che THẤP — ngồi sau thì khuất, đứng lên là hở | 0.32 |
| `Prop_RuneStone.png` | 180×110 | vật che NGANG NGỰC — đối ứng rào bê tông của Hiện đại | 0.48 |
| `Prop_Crystal.png` | 260×160 | vật che CAO — che cả người đứng, đáng đi thêm vài bước | 0.72 |
| `Prop_ManaFont.png` | 200×160 | MẠCH MANA: chỗ pháp sư nạp phép (`ManaFont`) | 1.15 |
| `Prop_ManaGlow.png` | 160×160 | vầng sáng của mạch — **THANG XÁM**, máy nhuộm theo phe | (con của mạch) |

⚠ Ba cỡ cao khác nhau là CÓ CHỦ ĐÍCH, đừng vẽ đều nhau: bảng chấm điểm chỗ nấp
(`CoverTactics.Find`) cộng điểm theo chiều cao, nên ba tấm bằng nhau là AI chọn bừa cái gần
nhất và bài test *"AI có biết chọn chỗ nấp tốt không"* mất sạch ý nghĩa.

⚠ `Prop_ManaGlow` phải THANG XÁM (trắng trên nền trong suốt): `ManaFont` nhuộm nó bằng
`TeamMember.ColorOf` lúc chạy. Vẽ sẵn màu xanh là hai phe có mạch giống hệt nhau, mà `Serves()`
lại chặn theo phe — đứng nhầm mạch của địch là **đứng mãi không nạp được và không có gì nói vì
sao**.

### Prompt

```
Pixel art nhìn NGANG (side view) cho game 2D stickman, nền trong suốt (PNG alpha).
Không khung, không chữ, không watermark, không bóng đổ xuống nền.

Chủ đề: đồ đá phép thuật của một khu rừng pha lê — đá xám tím lạnh, rune phát sáng
xanh lam, pha lê trong xanh biếc. Bóng đặc, ít chi tiết vụn: ảnh bị thu xuống còn
30–70 px cao trên màn, thứ còn đọc được là ĐƯỜNG VIỀN và MẢNG MÀU LỚN NHẤT.

Vẽ 1 tấm: <tên + khổ + mô tả từ bảng dưới>
- Prop_ArcaneWard 160×90  — ba trụ đá lùn nối nhau bằng một màng phép mờ, thấp ngang hông.
- Prop_RuneStone  180×110 — một bia đá dựng, chân loe đỉnh vát, mặt khắc 3 dấu rune sáng.
- Prop_Crystal    260×160 — cụm ba phiến pha lê cao thấp chụm gốc, mọc lên từ một bệ đá.
- Prop_ManaFont   200×160 — bể đá tròn hai bậc chứa nước phép sáng, ba phiến pha lê mọc lên.
- Prop_ManaGlow   160×160 — CHỈ một vầng sáng tròn mờ dần ra rìa, vẽ TRẮNG trên nền trong
                            suốt (không màu), dùng làm lớp nhuộm màu phe.

Pivot ĐÁY GIỮA (vật đứng trên đất). Toàn bộ chiều cao ảnh là chiều cao vật —
đừng chừa lề trên/dưới, máy co ảnh theo chiều cao để ra đúng cỡ thật.
```

⚠ Xin **TỪNG TẤM MỘT**. Xin cả năm một lượt là ChatGPT trả về một bảng sưu tập cùng tỉ lệ,
trong khi năm tấm này cố ý KHÁC tỉ lệ nhau.

---

## 4. THẢ FILE VÀO ĐÂU, BẤM NÚT NÀO

1. Thả PNG đúng tên vào `Assets/Sprites/Environment/` (đè lên bản nháp cùng tên).
   **Vật che Fantasy (§3b) thì vào `Assets/Sprites/Buildings/Fantasy/`**, rồi dựng lại ba bài
   `Genre_Fantasy_*` để `StructureSkin` khoác tấm mới.
2. Kiểm import: PPU 100, pivot như bảng §0, `Wrap = Repeat` cho tấm lặp — bấm
   `Tools > Stickman > Nâng cao > Environment > Vẽ bù art còn thiếu` để tool đặt lại import
   settings mà **không** vẽ đè tấm đã có.
3. Bấm `Maps > 1. Build Map System` (nối `Ground_Top_*` vào `MapLibrary`) rồi dựng lại scene
   (`Build > 0. Bảng dựng`) để `SkyBackdrop` nhận bộ chân trời mới.
4. Mở Xưởng map → *Tạo map mới* → xoay «Môi trường» qua cả bảy, nhìn ở cỡ thật.

⚠ Xin **TỪNG MÔI TRƯỜNG MỘT** (hai tấm chân trời + một tấm đất), đừng xin cả bảy một lượt —
ChatGPT đổi tỉ lệ khi danh sách dài, mà chân trời xa/gần phải cùng tỉ lệ mới ghép được.
