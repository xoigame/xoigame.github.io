# Đặt ChatGPT vẽ art Fantasy — 30 chủng tộc

> Bộ code (`FantasyRaceSilhouetteArt`) đã vẽ đủ 30 đầu và **chạy được ngay**. File này dành cho
> bản ĐẸP: bạn sinh bằng ChatGPT rồi thả vào, tool sẽ không đè lên (xem mục 5).

---

## 0. VÌ SAO BỘ PAINTED CŨ KHÔNG DÙNG ĐƯỢC — đọc trước khi đặt bản mới

Atlas `FantasyRaceParts_v3` vẽ **rất đẹp** cho 9 chủng × 5 mảnh (đầu · thân · chi · bàn tay ·
bàn chân), kiểu render 3D bán tả thực. Nhưng runtime chỉ dùng **CÁI ĐẦU**: `FantasyRigPaint`
giữ nguyên silhouette stickman cho thân/tay/chân rồi nhuộm một màu phẳng qua alpha-mask.

Kết quả trên sân: **đầu orc đổ bóng chi tiết cắm trên một hình que xanh lá phẳng lì.**

⚠⚠ **Đây là lỗi LẮP RÁP, không phải lỗi chất lượng.** Đặt lại một bộ painted đẹp hơn nữa mà
vẫn chỉ dùng cái đầu thì kết quả **y hệt**. Nên bản đặt mới chỉ có hai đường hợp lệ:

| Đường | Đặt gì | Đổi gì trong code |
|---|---|---|
| **A. Đầu phẳng đẹp** (khuyên dùng) | 17 tấm ĐẦU, kiểu phẳng, hợp thân stickman | không đổi gì — thả file là xong |
| **B. Painted đủ thân** | 17 × 5 mảnh, đúng tỉ lệ rig | phải sửa `FantasyRigPaint` để gắn thân/chi thật |

Đường B **phá luật lõi của dự án** (*thân stickman đen; nhận diện bằng mặt/dáng/trang bị* —
AGENTS.md) và cần rig lại từng mảnh. Đừng chọn nó trừ khi bạn đã quyết đổi bản sắc cả game.

---

## 1. RÀNG BUỘC KỸ THUẬT (dán nguyên vào prompt)

```
- Nền TRONG SUỐT (PNG, alpha thật, không nền caro, không nền trắng).
- Nhìn NGANG (side profile), mũi/mõm quay về BÊN PHẢI (+X).
- Vẽ ĐỨNG THẲNG, KHÔNG xoay nghiêng sẵn — rig tự xoay, xoay sẵn là lệch hai lần.
- Chỉ vẽ CÁI ĐẦU + phần cổ ngắn. Không thân, không vai, không vũ khí, không nền.
- Khổ 96×96 px, đầu chiếm ~80% khung, CÂN GIỮA (pivot của dự án là tâm ảnh).
- Cả 30 tấm CHUNG MỘT KHỔ và CHUNG MỘT TỈ LỆ đầu — cỡ khác nhau giữa các chủng
  do tham số rig lo, không phải do bạn vẽ to nhỏ khác nhau.
```

## 2. RÀNG BUỘC PHONG CÁCH — chỗ dễ sai nhất

```
PHONG CÁCH: vector phẳng, độ tương phản cao, đọc được ở cỡ 40 px.
- MÀU PHẲNG. Tối đa 3 sắc độ cho mỗi mảng (nền / sáng / tối). KHÔNG airbrush,
  KHÔNG chuyển sắc mượt, KHÔNG bóng đổ mềm, KHÔNG kết cấu da/vảy chi tiết.
- VIỀN NGOÀI TỐI, DÀY VÀ LIỀN MẠCH (khoảng 2–3 px ở khổ 96). Màu viền là màu
  thân nhân vật nhân 0.32 — KHÔNG dùng đen tuyệt đối (lộ ở chủng màu tối).
- ĐÚNG MỘT điểm nhấn sáng: CON MẮT. Không thêm rune phát sáng, đốm lửa, hạt
  lấp lánh ở chỗ khác — nhiều điểm sáng là mất chỗ nhìn.
- ĐƯỜNG GÃY NGHIÊNG phải rõ: trán → gò mày → hõm sống mũi → mõm → mép → cằm →
  góc hàm. Đây mới là thứ làm người ta đọc ra chủng ở cỡ nhỏ, không phải chi tiết.
- Sừng · tai · mào · nanh là SILHOUETTE: chúng phải nhô ra khỏi khối đầu đủ để
  nhận ra khi tô đen toàn bộ hình.
```

⚠ **Phép thử một câu:** tô cả tấm thành màu đen tuyền. Vẫn phân biệt được orc với gryphon
không? Không thì silhouette chưa đủ — bảo ChatGPT làm sừng/tai/mõm nhô rõ hơn, đừng thêm chi tiết.

## 3. BẢNG ĐẶT HÀNG — 30 chủng (sinh từ `FantasyRaceCatalog`, không gõ tay)

Mã HEX lấy từ `FantasyRaceCatalog.Of()`. **Đưa nguyên mã HEX vào prompt**, đừng tả bằng lời — đó là cách duy nhất để 30 tấm khớp màu với thân stickman đã nhuộm. Cột *Tai · Sừng · Hàm* là silhouette BẮT BUỘC phải nhô rõ khỏi khối đầu (phép thử: tô đen toàn hình vẫn phân biệt được).

| # | Chủng | Thân (HEX) | Nhấn/mắt (HEX) | Tai | Sừng/mào | Hàm/mõm | Vai | Vũ khí đặc trưng |
|---|---|---|---|---|---|---|---|---|
| 1 | Fairy (Tiên) | `#AD6BF0` | `#9EFFF5` | dài vút sau | — | phẳng | pháp sư | Wand |
| 2 | Orc (Orc) | `#61942E` | `#FFC729` | nhọn ngắn | — | hai nanh chìa lên | tuyến trước | Axe |
| 3 | Skeleton (Skeleton) | `#C9BF91` | `#66F2FF` | — | — | hàng răng kề | tuyến trước | Sword |
| 4 | Harpy (Harpy) | `#B24733` | `#FFCC38` | chùm lông | mào liền | mỏ nêm | bay | vũ khí cơ thể |
| 5 | Dragon (Rồng) | `#C22129` | `#FF9E1F` | vây màng | vòng gai ngả sau | mõm dài răng cưa | trùm | vũ khí cơ thể |
| 6 | Dwarf (Lùn) | `#AB632E` | `#F5D666` | cụp | — | phẳng | tuyến trước | Warhammer |
| 7 | Goblin (Goblin) | `#7A9E29` | `#E6FF3D` | dài vút sau | — | nanh nhỏ | quấy rối | Dagger |
| 8 | Troll (Troll) | `#30949E` | `#FFB829` | cụp | gai | hai nanh chìa lên | công thành | Club |
| 9 | Demon (Quỷ) | `#A11C3D` | `#FF5924` | nhọn ngắn | sừng cừu cuộn | nanh nhỏ | quấy rối | Scythe |
| 10 | Minotaur (Minotaur) | `#754229` | `#FF6B2E` | cụp | sừng bò cong lên | mõm bò | tuyến trước | Greataxe |
| 11 | Treant (Treant) | `#546B38` | `#B8FF61` | — | gạc hươu | phẳng | công thành | vũ khí cơ thể |
| 12 | Golem (Golem) | `#737885` | `#5CEBFF` | — | mào liền | phẳng | tuyến trước | vũ khí cơ thể |
| 13 | Imp (Imp) | `#C74C6B` | `#FFDB4C` | dài vút sau | gai | nanh nhỏ | bay | vũ khí cơ thể |
| 14 | Naga (Naga) | `#29858F` | `#85FFE0` | vây màng | mào liền | nanh nhỏ | pháp sư | FrostStaff |
| 15 | Wisp (Wisp) | `#94DBFF` | `#FFFFCC` | — | — | phẳng | hỗ trợ | vũ khí cơ thể |
| 16 | Gryphon (Gryphon) | `#CCA847` | `#FFF5B8` | chùm lông | mào liền | mỏ nêm | bay | vũ khí cơ thể |
| 17 | Lich (Lich) | `#665794` | `#70FFB8` | — | vòng gai ngả sau | hàng răng kề | pháp sư | NecroStaff |
| 18 | Spider (Nhện) | `#3B2440` | `#FF4A4A` | — | gai | Mandible | quấy rối | vũ khí cơ thể |
| 19 | Slime (Nhớt) | `#5EC46B` | `#D9FF8C` | — | — | phẳng | tuyến trước | vũ khí cơ thể |
| 20 | Werewolf (Người sói) | `#4A3D33` | `#FFD14A` | chùm lông | — | mõm bò | quấy rối | vũ khí cơ thể |
| 21 | Banshee (Oan hồn) | `#8FA8D9` | `#A8F0FF` | — | — | phẳng | pháp sư | vũ khí cơ thể |
| 22 | Wyvern (Wyvern) | `#2E6B45` | `#FFBD33` | vây màng | gai | mõm dài răng cưa | bay | vũ khí cơ thể |
| 23 | Elf (Elf) | `#C7D999` | `#FFF5B8` | dài vút sau | — | phẳng | tầm xa | Longbow |
| 24 | Human (Con người) | `#E3B087` | `#59A6FF` | — | — | phẳng | tuyến trước | Sword |
| 25 | Giant (Khổng lồ) | `#8A7A69` | `#FFD966` | cụp | — | phẳng | công thành | Warhammer |
| 26 | Ogre (Ogre) | `#B0A147` | `#FF8C33` | cụp | — | hai nanh chìa lên | tuyến trước | Club |
| 27 | Centaur (Nhân mã) | `#A88059` | `#F2E6BF` | nhọn ngắn | — | phẳng | quấy rối | HorseBow |
| 28 | Dragonborn (Long nhân) | `#3861B0` | `#FFB233` | vây màng | gai | mõm dài răng cưa | tuyến trước | Greatsword |
| 29 | Vampire (Ma cà rồng) | `#7A2957` | `#FF404C` | nhọn ngắn | — | nanh nhỏ | quấy rối | Runeblade |
| 30 | Lizardman (Người thằn lằn) | `#3D8061` | `#F2D94C` | vây màng | mào liền | nanh nhỏ | quấy rối | Trident |

## 4. PROMPT MẪU (một chủng)

```
Vẽ MỘT tấm PNG nền trong suốt, 96×96 px: ĐẦU nhìn nghiêng của một ORC, mõm quay
về bên phải. Chỉ vẽ đầu và một đoạn cổ ngắn — không thân, không vai, không vũ khí.

Phong cách: vector PHẲNG, tương phản cao, đọc được ở cỡ 40 px. Màu phẳng, tối đa
3 sắc độ mỗi mảng. Viền ngoài tối, dày 2–3 px, liền mạch. KHÔNG airbrush, KHÔNG
chuyển sắc mượt, KHÔNG bóng đổ mềm, KHÔNG kết cấu da chi tiết.

Màu thân #61942E. ĐÚNG MỘT điểm nhấn sáng là CON MẮT, màu #FFC729.

Nét nhận dạng bắt buộc (phải nhô rõ khỏi khối đầu, nhìn thấy được cả khi tô đen
toàn hình): HAI NANH CHÌA LÊN từ hàm dưới, gò mày nặng đổ bóng xuống mắt, hàm bạnh,
tai nhọn ngắn hướng ra sau.

Đường gãy nghiêng phải rõ: trán → gò mày → hõm sống mũi → mõm → mép → cằm → góc hàm.
Đầu chiếm khoảng 80% khung và cân giữa.
```

Đổi ba chỗ cho chủng khác: **tên chủng · hai mã HEX · dòng "nét nhận dạng"** (cột cuối bảng mục 3).

## 5. NHẬN VỀ RỒI LÀM GÌ

1. Thả 30 file vào `Assets/Resources/Fantasy/Races/Flat/`, **đặt tên đúng tên enum**:
   `Fairy.png`, `Orc.png`, `Skeleton.png`, `Harpy.png`, `Dragon.png`, `Dwarf.png`, `Goblin.png`, `Troll.png`, `Demon.png`, `Minotaur.png`, `Treant.png`, `Golem.png`, `Imp.png`, `Naga.png`, `Wisp.png`, `Gryphon.png`, `Lich.png`, `Spider.png`, `Slime.png`, `Werewolf.png`, `Banshee.png`, `Wyvern.png`, `Elf.png`, `Human.png`, `Giant.png`, `Ogre.png`, `Centaur.png`, `Dragonborn.png`, `Vampire.png`, `Lizardman.png`.
2. Không phải bấm nút nào. `FantasyRaceArt.FaceFor` đọc thẳng thư mục đó.
3. Kiểm: bấm **★ KHÁM SỨC KHOẺ DỰ ÁN** — mục *"Chủng Fantasy THIẾU ART ĐẦU"* phải xanh.

⚠⚠ **Art bạn thả vào KHÔNG BỊ ĐÈ.** `StickmanArtSource` chặn ở tầng ghi file: tấm nào không
mang nhãn `stickman:codegen` thì nút «Vẽ LẠI toàn bộ» bỏ qua và báo số tấm đã chừa.

⚠ **Đừng đoán "tấm này do code vẽ" bằng khổ ảnh** — art ChatGPT vẽ đúng chuẩn dự án (96×96)
TRÙNG khổ generator. Hỏi `StickmanArtSource.IsCodeGenerated`.

⚠ Muốn quay lại bản code cho một chủng: xoá tấm đó đi rồi bấm nút vẽ lại.

## 6. NHỮNG THỨ **KHÔNG** ĐẶT Ở ĐÂY

- **Cánh · đuôi**: ĐÃ có cửa nạp (từ 2026-09-08) — đặt được như đầu. Tên file
  `Wing_{Chủng}.png` (128×96) và `Tail_{Chủng}.png` (112×64), cùng thư mục `Flat/`.
  ⚠ Hai ràng buộc riêng, sai là hỏng chuyển động chứ không chỉ xấu:
  **vẽ CHĨA VỀ BÊN TRÁI (−X, tức ra sau lưng)** và **pivot ở MÉP PHẢI** (chỗ nó cắm vào thân).
  Vẽ ngược là nhịp vỗ thành chong chóng quay trước mặt con vật.
  Chủng có cánh (7): Fairy · Harpy · Dragon · Imp · Wisp · Gryphon · Wyvern.
  Chủng có đuôi (15): Harpy · Dragon · Demon · Minotaur · Treant · Imp · Naga · Wisp · Gryphon · Spider · Werewolf · Wyvern · Centaur · Dragonborn · Lizardman.
- **Nón · giáp · khiên**: là `EquipmentDefinition` dùng chung cả ba thể loại — đặt theo bảng ở
  `WeaponArt-ChatGPT-Prompt.md`, không đặt theo file này.
- **Trượng · đũa phép**: là vũ khí, cũng theo `WeaponArt-ChatGPT-Prompt.md`.
- **Vật che Fantasy** (rune stone · pha lê · mạch mana): theo
  `EnvironmentArt-ChatGPT-Prompt.md`.

## 7. TRANG PHỤC THEO CHỦNG — `Assets/Sprites/Looks/` (2026-09-09)

Từ 2026-09-09 mỗi chủng còn có **áo · sau lưng · đuôi · bộ phận phụ** qua hệ `StickmanLook`
(hồ sơ đặt tên trong `StickmanLookBuilder`, thẻ = tên chủng). Khối chung, khổ canvas và luật
màu xám nằm ở `WeaponArt-ChatGPT-Prompt.md` **mục 12** — dán khối đó trước, rồi thêm phần này.

### Luật rút ra từ lỗi thật (phe Tiên trắng bệch, 2026-09-09)

⚠⚠ **ÁO PHẢI TỐI HƠN THÂN.** Sprite áo vẽ bằng TRẮNG rồi nhân với màu áo lúc chạy; thân cũng là
một màu phẳng. Nếu màu áo *sáng hơn* màu thân thì áo thành **nền** chứ không thành **trang
phục** — nó nuốt sạch màu chủng, và ba con đứng cạnh nhau dính thành một mảng. Đúng lỗi của
Tiên (áo `#e8e8f0` trắng trên thân tím `#ad6bf0`) và Naga (`#c0d0d0` trên lam).

⚠ **Áo cùng sắc với thân mà chỉ khác độ sáng chút ít = áo vô hình.** Minotaur từng khai khố
`#6a4a2a` trên thân `#754229` — tương phản **1.02**, tức không có gì cả. Golem 1.11, Lùn 1.35.
Phép đo: tỉ số độ chói (WCAG) áo/thân phải **≥ 1.6** *và* áo phải tối hơn.

⚠ **Đây là màu ÁO, không phải màu bạn vẽ.** Bạn vẽ sprite bằng thang xám (mục 12); bảng dưới là
số mà runtime nhân vào. Đưa HEX vào prompt chỉ để ChatGPT hiểu *tông* mà chọn đường nét
(áo tối thì nét sáng phải rõ hơn), không phải để tô.

### Bảng — sinh từ `StickmanLookBuilder` + `FantasyRaceCatalog`, không gõ tay

| Chủng | Thân (nhuộm) | Áo | Màu áo | Sau lưng | Màu | Sáng/tối so với thân |
|---|---|---|---|---|---|---|
| Dragon | `#C22129` | — | — | Back_Spines | #c8703a | (không áo) |
| Dwarf | `#AB632E` | Torso_Plate | `#46525f` | — | — | TỐI hơn ✔ |
| Fairy | `#AD6BF0` | Torso_Robe | `#3a2168` | Back_Scarf | `#5ef0d8` | TỐI hơn ✔ |
| Goblin | `#7A9E29` | Torso_Vest | `#5a4a2a` | Back_Backpack | `#4a3a2a` | TỐI hơn ✔ |
| Golem | `#737885` | Torso_Plate | `#2f3b46` | — | — | TỐI hơn ✔ |
| Gryphon | `#CCA847` | — | — | — | — | (không áo) |
| Harpy | `#B24733` | Torso_Loincloth | `#5a3a2a` | — | — | TỐI hơn ✔ |
| Imp | `#C74C6B` | — | — | — | — | (không áo) |
| Minotaur | `#754229` | Torso_Loincloth | `#2e2018` | Back_Scarf | `#ff6b2e` | TỐI hơn ✔ |
| Naga | `#29858F` | Torso_Robe | `#123a44` | Back_Scarf | `#85ffe0` | TỐI hơn ✔ |
| Orc | `#61942E` | Torso_Loincloth | `#7a5a36` | — | — | TỐI hơn ✔ |
| Skeleton | `#C9BF91` | Torso_Bandage | `#a09080` | Back_Sheath | `#5a4a3a` | TỐI hơn ✔ |
| Slime | `#5EC46B` | — | — | — | — | (không áo) |
| Treant | `#546B38` | — | — | — | — | (không áo) |
| Troll | `#30949E` | Torso_Loincloth | `#5a4a3a` | — | — | TỐI hơn ✔ |
| Wisp | `#94DBFF` | — | — | — | — | (không áo) |
| Wyvern | `#2E6B45` | — | — | — | — | (không áo) |

Chủng ghi "(không áo)" nhận diện bằng đầu · cánh · đuôi · bộ phận phụ (mục 3 và 6) — đừng đặt áo
cho rồng hay wisp, chúng không mặc gì và đó là chủ ý.

### Đặt gì cho chủng nào

Mỗi chủng cần đúng những tấm nó khai ở cột **Áo / Sau lưng**, tên file = tên trong bảng
(`Torso_Robe.png`, `Back_Scarf.png`…). ⚠ Một tấm dùng CHUNG cho mọi chủng khai cùng tên —
`Torso_Robe` của Tiên và của Naga là **một** file, khác nhau ở màu nhân vào. Muốn hai kiểu áo
choàng khác nhau thì phải thêm tên mới vào `lookart.py` + `StickmanLookArt.Body.cs` trước
(skill `stickman-look`), rồi mới đặt vẽ.

### Prompt mẫu — áo choàng pháp sư (`Torso_Robe`)

```
[dán KHỐI CHUNG ở WeaponArt-ChatGPT-Prompt.md mục 12]

Item: a long MAGE ROBE for a stickman, side view facing RIGHT. Canvas 96×128 px.
The shoulder anchor is at (48, 96) from the bottom-left; the robe hangs 72 px down from
there and flares slightly at the hem. One vertical seam down the front, a belt line at
about 60% height. Main cloth = PURE WHITE, belt and seam = #5C5C5C, inner shadow of the
flare = #969696. Thin dark outline (24,22,28). No arms, no head, no legs, no hands.
This robe will be tinted DARK (e.g. deep violet #3a2168) at runtime, so make the belt and
seam lines READ AS LIGHTER than the cloth, not darker — otherwise they vanish after tinting.
```

Đổi ba chỗ cho tấm khác: **tên món · mô tả hình · chỗ neo** (khổ + neo của từng loại ở mục 12).
