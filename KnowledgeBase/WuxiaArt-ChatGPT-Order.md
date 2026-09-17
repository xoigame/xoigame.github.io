# ĐƠN HÀNG ChatGPT — NHÂN VẬT VÕ LÂM: 6 nón + 6 giáp (+ 18 binh khí)

> User chốt 2026-09-14: *"dùng chatgpt vẽ hình hoàn chỉnh cho nhân vật võ lâm"*.
> Luật nguồn art: [AssetGeneration.md](../AgentRules/AssetGeneration.md) — art ĐẸP thì ĐẶT,
> code chỉ vẽ bù. Hợp đồng khổ/tỉ lệ: [WeaponArt-ChatGPT-Prompt.md](WeaponArt-ChatGPT-Prompt.md)
> mục 3 (nón) và mục 4 (giáp). Bảng sáu môn phái: [Wuxia.md](../AgentRules/Wuxia.md) mục 2.

## 0. ĐO ĐƯỢC: bộ art võ lâm đang hỏng ở đâu (rà 2026-09-14)

```powershell
cd .claude/skills/stickman-assets/scripts
python check_gear_contract.py --wuxia      # 2/12 tấm không có gì để nói
python wuxia_figure.py xem.png             # nguyên con, kèm hàng CỠ THẬT ~44 px
```

Ngưỡng của `check_gear_contract.py` **tự hiệu chuẩn** trên 34 cái nón của các nền khác — không
lấy từ một dòng chú thích (bẫy đã dính ở `helmet-anchor-nofid`). Ba nền đang dùng
(Byzantine · Rus · Europe) ra **6/6 sạch**, còn võ lâm ra **2/12**:

| Đo | Võ lâm | Bộ còn lại | Hiện ra thế nào |
|---|---|---|---|
| khung tấm GIÁP | **60×80** cả sáu | 200×250 → 256×256 | ít hơn **9 lần** pixel ⇒ phóng to lên thân là nhoè |
| tỉ lệ giáp Võ Đang · Cái Bang | **0.745 · 0.778** | 0.51–0.57 | vượt trần 0.63 ⇒ `ArmorMaxSquash` kẹp ⇒ *"giáp nằm ngang"* |
| lệch ngang neo nón Thiếu Lâm | **0.70** | p05–p95 = 0.02–0.27 | **cao nhất dự án** ⇒ tấm cà sa treo HẲN cạnh cái đầu |
| nón Cái Bang cao / đầu | **0.43** | 0.99–2.00 | thấp nhất dự án ⇒ một lát mỏng đội hờ, hở nguyên khối sọ đen |
| vòng đầu / chiều cao nón (Cái Bang) | **2.35** | 0.50–1.01 | nón nhỏ hơn cái đầu |
| vòng dọc Võ Đang · Ma giáo | **0.86 · 0.81** | 0.35–0.79 | nón tụt xuống, hở đỉnh đầu |
| vành/đầu Thiếu Lâm · Võ Đang · Ma giáo | 1.10 · 1.21 · 1.24 | sàn 1.25 | vành hẹp hơn cả bộ |

⚠ Đây **không** phải "art xấu" — sáu tấm nón là art vẽ tay thật. Chúng lệch ở **hình học**:
vẽ không quanh một cái đầu có sẵn, nên máy không neo đúng chỗ. Cách chữa là vẽ lại **trên
khuôn có đầu chuẩn**, không phải đi vặn hằng số nào.

⚠⚠ **Sáu tấm này đang được MIỄN TRỪ phép đo hở đầu.** Cả sáu tên nằm trong
`StickmanRigMetrics.OpenHeadwearSprites`, nên `TryMeasureHeadExposure` (cửa gác của
`StickmanDoctor.Equipment` và `StickmanEquipmentRosterSmoke`) **bỏ qua chúng** — đó là lý do
Doctor xanh mà nhìn vào vẫn thấy cái đầu đen trần. Miễn trừ ấy được khai ngày 2026-09-12 vì
lúc đó chúng đúng là *đồ đội hở* (trâm cài · đuôi khăn · dải thắt · con chim).

**Bộ mới phải TRÙM ĐƯỢC CHỎM VÀ GÁY**, nên sau khi lắp xong thì **xoá đúng sáu tên đó khỏi
`OpenHeadwearSprites`** để cửa gác bật lại. Để nguyên là vừa vẽ lại vừa tự tắt phép đo duy
nhất kiểm được việc mình vừa làm. Riêng ô 1 (Thiếu Lâm — đầu trọc) là ngoại lệ thật: sọ trọc
thì không có gì trùm, giữ `Helm_Shaolin` trong danh sách.

---

## 1. Ba bước, không có bước bốn

```powershell
cd .claude/skills/stickman-assets/scripts
# bước 1 — khuôn đã có sẵn, đính kèm khi đặt:  head_template_big_6.png  (3072×512, 6 ô)
# bước 2 — dán KHỐI CHUNG + LÔ 1 (hoặc LÔ 2) vào ChatGPT
# bước 3 — nhận về:
python intake_fid.py  <sheet_non.png>  Wuxia --names Shaolin,Wudang,Emei,Beggar,MingCult,Tangmen
python intake_gear.py <sheet_giap.png> Armor       Shaolin,Wudang,Emei,Beggar,MingCult,Tangmen
python stamp_pivots.py Armor ../../../../Assets/Sprites/Civilizations/Shaolin/Armor_Shaolin.png `
    ../../../../Assets/Sprites/Civilizations/Wudang/Armor_Wudang.png `
    ../../../../Assets/Sprites/Civilizations/Emei/Armor_Emei.png `
    ../../../../Assets/Sprites/Civilizations/Beggar/Armor_Beggar.png `
    ../../../../Assets/Sprites/Civilizations/MingCult/Armor_MingCult.png `
    ../../../../Assets/Sprites/Civilizations/Tangmen/Armor_Tangmen.png
python check_gear_contract.py --wuxia     # ĐO LẠI
python wuxia_figure.py xem.png            # NHÌN LẠI, nhất là hàng cỡ thật
```

Rồi trong Unity bấm **`Nâng cao > Civilizations > 2`** để asset trang bị nhận sprite mới.
`intake_fid`/`intake_gear` tự đóng nhãn `stickman:hand`, nên tấm của anh **không bao giờ bị
code vẽ đè**.

⚠ `--names` là đường MỚI của `intake_fid` (thêm 2026-09-14): bộ 15 nền trung cổ xếp theo NỀN
(một nền ba kiểu nón, n=3), còn võ lâm thì **sáu phái mỗi phái MỘT cái nón**. Sáu cái phải nằm
trong CÙNG một sheet thì ChatGPT mới giữ được cùng cỡ và cùng nét.
Script tự nhận ra khuôn đầu to (d=330/512) hay khuôn gốc (d=191/512), khỏi truyền `--tpl`.

⚠ Tên thư mục ≠ tên hiển thị: **MingCult** = Ma giáo, **Tangmen** = Đường Môn,
**Beggar** = Cái Bang. Sai tên thư mục = file nằm im, không lỗi nào báo.

---

## 2. KHỐI CHUNG — dán TRƯỚC mỗi lô

```
You are drawing sprite art for a 2D side-view stickman game set in a Chinese wuxia world.
Output ONE wide PNG with a fully TRANSPARENT background.

TECHNICAL — every line is mandatory:
1. Transparent PNG alpha. No white background, no drop shadow, no frame, no checkerboard
   painted into the RGB (use real alpha).
2. SIDE VIEW. The character faces RIGHT. +X is the front of the body.
3. NOT left-right symmetric. A symmetric shape reads as a FRONT view. In side view the
   sash ends, scarf tails, hair tails and robe hems fall to ONE side only: the BACK,
   which is the LEFT of the image.
4. Draw each item UPRIGHT, never pre-rotated. The engine rotates at runtime.
5. Draw ONLY the items. No character, no head, no arms, no legs, no ground, no text.
6. All cells share ONE scale. A bigger item takes more pixels inside the same cell.

STYLE — this is the part that usually goes wrong:
· Clean flat vector / pixel-art look. Bold readable SILHOUETTE first, detail second.
· A thin DARK OUTLINE (RGB 24,22,20) around every shape.
· 3-4 large separated colour blocks per item, plus one lit edge and one shadowed edge.
  Light comes from the TOP-LEFT. Cloth shows FOLDS: a dark crease next to a light one.
· The art is displayed at about 44 px tall in game. Fine detail (stitching, embroidery,
  written characters, individual beads) is wasted. Only the OUTLINE and the LARGEST
  colour block survive.
· The character body underneath is a SOLID BLACK stick figure with a BLACK round head.
  So: never use near-black as the main colour of an item - it disappears into the body.
  A black garment must carry a bright trim so its shape still reads.
```

---

## 3. LÔ 1 — SÁU CÁI NÓN (đính kèm `head_template_big_6.png`)

```
I attach a template: 3072x512 px, six 512x512 cells, each with a MAGENTA circle
(RGB 255,0,255, diameter 330 px). That circle IS the character's head, at true size.

Draw one piece of headwear per cell, ON TOP of the template, keeping the template size
and keeping every magenta pixel that is still visible (my tool measures the circle, then
deletes it).

FOUR LAWS - breaking any one makes the engine place the piece wrong:
A. The WIDEST HORIZONTAL ROW of your drawing, within its top 70%, is what the engine
   treats as the brim and centres on the head. Make that row about 1.3-1.5x the circle
   diameter. Never let anything else (a tassel, a sash tail) be wider than it.
B. There MUST be material hanging BELOW that widest row - a neck flap, a hair tail, a
   cloth end. Without it the widest row itself falls into the zone the engine ignores.
C. The piece must rise at least 0.8x the circle diameter ABOVE the top of the circle.
   Flatter than that reads as a flat pill perched on a bald black skull.
D. What hangs below the brim must be NARROWER than the brim, and must fall to the BACK
   (the LEFT of the image), reaching at most one circle diameter down. A long cloth
   reaching the hip reads as a rag being dragged along.

Also: the headwear must SURROUND the circle, not sit tight on it. If the circle takes
more than ~60% of your drawing's height, the piece will render tiny in game.
```

| Ô | Phái | Vẽ gì | Màu trội |
|---|---|---|---|
| 1 | THIẾU LÂM | **ĐẦU TRỌC** — không phải nón: một cái sọ cạo nhẵn màu da, trên đỉnh **chín chấm hương** (3 hàng 3 chấm) sẫm hơn; cà sa nâu-vàng vắt qua vai trái rủ xuống sau gáy làm phần dưới vành | da rám + nâu vàng |
| 2 | VÕ ĐANG | **BÚI TÓC ĐẠO SĨ** trên đỉnh, **một cây trâm gỗ xuyên NGANG** qua búi; khăn vấn xanh lam quanh trán, hai dải ngắn rủ sau gáy | lam đậm + gỗ nâu |
| 3 | NGA MI | **KHĂN NI CÔ trắng** trùm kín tóc, mép trước ôm trán, vạt sau rủ tới GÁY thôi; một dải lụa xanh nhạt viền mép | trắng ngà + lam nhạt |
| 4 | CÁI BANG | **TÓC RỐI** lởm chởm không hàng lối, xù cao hẳn lên; một sợi dây rơm buộc ngang, mấy cọng thò ra; không đội gì | nâu xám + rơm |
| 5 | MA GIÁO | **KHĂN ĐỎ** quấn kín sọ, nút thắt sau gáy, hai dải rủ; **hai cái sừng NGẮN VÀ DÀY** cong ra trước, gốc to ngọn tù | đỏ máu + đen ánh |
| 6 | ĐƯỜNG MÔN | **NÓN LÁ rộng vành** hình nón cụt, vành loe đều, thân nón đan nan tre; một dải vải buộc cằm rủ về sau | tre vàng + xanh lục |

⚠ Ba lỗi đã đo được năm 2026-09-08 ở chính sáu cái đầu này — nói thẳng vào prompt nếu ChatGPT
vẽ lại đúng vào bẫy:

- **Tóc/khăn màu gần đen** (Võ Đang từng là `38,36,40`): đầu stickman **vốn đã đen**, nên nó
  mất hẳn vào khối đầu. Tóc phải là nâu/xám/đỏ có độ sáng, không bao giờ là đen.
- **Vạt khăn quá dài** (Nga Mi từng 76 px, buông tới ngang hông): đọc ra một tấm vải lết theo
  người. Trần là MỘT đường kính đầu.
- **Sừng dài mà mảnh** (Ma giáo): đọc ra hai cái râu ăng-ten. Sừng phải NGẮN và DÀY.

---

## 4. LÔ 2 — SÁU BỘ ÁO / GIÁP

```
One wide PNG, six equal cells side by side, items NOT touching each other (my tool cuts
the sheet by finding the gaps). Each cell is 500 wide x 625 tall.

THE ONE ABSOLUTE RULE: inside each cell, the drawn garment must be about TWICE AS TALL
AS IT IS WIDE. Measured width divided by measured height must land between 0.45 and
0.55, and must never exceed 0.63. The engine fits the garment by HEIGHT and then squeezes
the width; a garment drawn wider than 0.63 hits the squeeze limit and reads as
"armour lying on its side" on a tall thin stick body. The garment should fill about 90%
of the cell height.

This is the ONE exception to the side-view rule: draw the garment FRONT-ON, as a flat
layer laid over the torso.
· Profile: CHEST BROAD -> WAIST NARROW -> SKIRT/HEM FLARED. Never a plain rectangle.
· Do NOT draw arms, sleeves, hands, neck, head or legs. Torso garment only.
· The sash/belt is the strongest readable feature at small size - make it a clear
  horizontal band of a contrasting colour.
```

| Ô | Phái | Vẽ gì | Màu trội |
|---|---|---|---|
| 1 | THIẾU LÂM | **cà sa** nâu-vàng vắt CHÉO qua ngực, hở hẳn một bên vai; các ô vải khâu nổi thành lưới thưa; đai vải bản to | nâu vàng + viền đồng |
| 2 | VÕ ĐANG | **đạo bào** cổ chữ V sâu, hai vạt chéo chồng nhau, thân buông thẳng loe nhẹ ở gấu; **thái cực đồ** tròn giữa ngực; đai lụa trắng | lam đậm + trắng |
| 3 | NGA MI | áo ni cô trắng, cổ tròn kín, **đai lụa buộc CAO ngang dưới ngực** (không ở eo), thân loe dài | trắng ngà + tím nhạt |
| 4 | CÁI BANG | áo rách **VÁ LỆCH** — 5–6 miếng vải khác màu khâu chồng không đều, gấu răng cưa; một **bầu rượu** buộc bên hông; dây thừng làm đai | nâu xám + rêu + rơm |
| 5 | MA GIÁO | áo đen dài, **viền lửa đỏ cam** chạy dọc hai vạt và quanh gấu, phù hiệu **nhật–nguyệt** giữa ngực | đen + đỏ lửa (bắt buộc có viền sáng) |
| 6 | ĐƯỜNG MÔN | áo chẽn xanh lục sẫm bó người, **bao ám khí SÁU ỐNG** xếp chéo qua ngực từ vai trái xuống hông phải | lục sẫm + da nâu |

---

## 5. LÔ 3 — BINH KHÍ (tuỳ chọn, 18 tấm)

Bộ binh khí môn phái đang ở khổ cũ: `Weapon_Sword` 194×50, `Weapon_Quarterstaff` 384×30 —
trong khi `Japan/Weapon_Katana` là 1416×139 và `Europe/Weapon_Sword` là 998×534. Cùng một
sân thì cây đao Nhật nét căng còn cây kiếm võ lâm mờ. Đặt theo khuôn mục 2 của
[WeaponArt-ChatGPT-Prompt.md](WeaponArt-ChatGPT-Prompt.md), nhận về bằng `intake_wep.py`.

| Phái | File trong `Assets/Sprites/Civilizations/<Phái>/` |
|---|---|
| Shaolin | `Weapon_Quarterstaff` (thiền trượng) · `Weapon_Glaive` (yển nguyệt đao) · `Weapon_Spear` · `Weapon_Saber` (giới đao) |
| Wudang | `Weapon_Sword` (kiếm mỏng có tua) · `Weapon_LongSaber` · `Weapon_Quarterstaff` |
| Emei | `Weapon_Sword` · `Weapon_DualSwords` (song kiếm) · `Weapon_Dagger` (nga mi thích) |
| Beggar | `Weapon_Quarterstaff` (đả cẩu bổng — tre có đốt) · `Weapon_Club` · `Weapon_ShortSaber` |
| MingCult | `Weapon_Saber` · `Weapon_LongSaber` · `Weapon_DualSabers` |
| Tangmen | `Weapon_Sword` · `Weapon_Dagger` |

⚠ Bốn cây RIÊNG của thể loại (quyền cước · nhuyễn tiên · thiết phiến · phi tiêu) **không** nằm
ở đây — chúng là enum 70–73 dùng chung, art ở sổ `LeafWeaponPaths`. Xem
[Wuxia.md](../AgentRules/Wuxia.md) mục 3.

---

## 6. Nhận về — kiểm ba thứ trước khi bấm nút

| Kiểm | Cách | Đạt là |
|---|---|---|
| hình học | `python check_gear_contract.py --wuxia` | 12/12, không dòng `LAC`/`FAIL` |
| đọc được ở cỡ thật | `python wuxia_figure.py xem.png` rồi **NHÌN hàng dưới** (~44 px) | phân biệt được sáu phái khi chỉ nhìn bóng ngoài |
| Unity | `Nâng cao > Civilizations > 2`, rồi **★ KHÁM SỨC KHOẺ** | nhóm trang bị xanh |

⚠ `check_gear_contract.py` nói "LẠC", không nói "xấu": nó chỉ so với chính bộ art đang có.
Tấm nào bị gọi tên thì **mở ra nhìn** rồi mới kết luận — đừng vẽ lại chỉ vì một con số.

⚠ Xong lô nón thì **xoá năm tên `Helm_Wudang · Helm_Emei · Helm_Beggar · Helm_MingCult ·
Helm_Tangmen` khỏi `StickmanRigMetrics.OpenHeadwearSprites`** (giữ lại `Helm_Shaolin` — đầu
trọc là đồ đội hở thật), rồi chạy Doctor: ngưỡng hở chỏm/gáy là **> 3.5% cảnh báo, > 8% hỏng**.

⚠ Vẫn còn lệch sau khi đo xanh thì chỉnh tay bằng **Xưởng chỉnh pivot**
(`StickmanPivotStudio`), đừng sửa `.headanchor.json` bằng tay: năm luật tự động đều đã thử
và đều hỏng (xem `helmet-anchor-nofid`), chỉ còn đường chấm tay trên hình nguyên con.
