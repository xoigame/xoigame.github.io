# ĐƠN HÀNG ChatGPT — bộ NGOẠI HÌNH nhân vật (90 tấm, dán thẳng)

> User chốt 2026-09-09: *"hình ảnh mới thêm vào vẽ quá xấu… dùng ChatGPT vẽ và tích hợp lại"*.
> Bản code trong `StickmanLookArt*` chỉ là **lưới an toàn** (luật số 0 ở
> [AssetGeneration.md](../AgentRules/AssetGeneration.md)). File này là ĐƠN HÀNG để thay nó.
> Luật lắp: [CharacterLook.md](../AgentRules/CharacterLook.md). Tool: skill `stickman-look`.

## 0. Ba bước, không có bước bốn

```powershell
cd .claude/skills/stickman-look/scripts
python intake_look.py --templates ./templates     # bước 1: sinh 5 template CÓ MỐC
# bước 2: dán KHỐI CHUNG + một LÔ bên dưới vào ChatGPT, đính kèm template đúng loại
python intake_look.py C:\...\Downloads\hair_spiky.png Hair_Spiky   # bước 3: nhận về
```

Rồi trong Unity bấm **«★ Ngoại hình nhân vật»** — tool cài pivot/PPU/border theo hợp đồng và
khoá `stickman:hand`, nên tấm của anh **không bao giờ bị code vẽ đè**. Nhìn
`Docs/ArtSheets/Looks_*.png` để kiểm.

⚠ Tên file phải **trùng khít** tên trong bảng. Sai tên = tấm nằm im, code vẫn vẽ đè, không lỗi nào báo.
⚠ Chưa ưng thì bấm **«Bật / TẮT bộ ngoại hình»** — sân về nguyên trạng trong một cú bấm.

## 1. KHỐI CHUNG — dán TRƯỚC mỗi lô

```
You are drawing sprite masks for a 2D side-view stickman game. Output PNG with a TRANSPARENT
background, one image per item, exactly the canvas size I give.

STYLE — this is the part people usually get wrong, read it twice:
· Flat vector / clean pixel-art look. Bold readable silhouette first, details second.
· A thin DARK OUTLINE (RGB 24,22,28) around the whole shape, 1–2 px at the given canvas size.
· SIX-STEP GREY RAMP ONLY. Do not use any hue at all:
      255,255,255  highlight (top-left facing edges, metal glints)
      236,236,240  lit surface
      205,205,210  MAIN surface  ← most of the item is this
      150,150,156  turned-away surface, lower layer
      104,104,110  deep shadow, under folds, gaps between layers
       70, 70, 76  grooves, belts, stitching
  The game MULTIPLIES a colour onto this mask at runtime, so any hue you add becomes wrong.
· The light comes from the TOP-LEFT. Give every form a lit edge and a shadowed edge.
· Cloth must show FOLDS (a dark crease next to a light one). Metal must show a raised centre
  ridge and horizontal bands. Flat unshaded fills read as plastic — avoid them.

GEOMETRY:
· SIDE VIEW, character faces RIGHT. +X is the front of the body.
· Draw ONLY the item. No head, no arms, no legs, no character, no ground, no drop shadow.
· Draw it UPRIGHT, do not pre-rotate.
· Every item in one batch shares ONE canvas size and ONE scale.
· If I attach a template: draw ON TOP of it, keep the item aligned to the MAGENTA anchor marks,
  do not paint over the marks (they are removed automatically), keep the canvas size.
```

## 2. LÔ 1 — TÓC (15 tấm, canvas 128×128, template `template_head.png`)

Neo: đầu là hình tròn **tâm (64,64), bán kính 32 px** (vòng magenta). Tóc **phải THÒ RA ngoài
vòng đó** — mảng tóc gọn trong vòng tròn thì mắt đọc ra *cái mũ*, không ra tóc. Chừa trống
**vùng mặt** (một phần tư trước-dưới của vòng tròn).

| Tên file | Vẽ gì |
|---|---|
| `Hair_Spiky` | 7 chùm gai lớn toả lên và hất về sau, kiểu Super Saiyan; gốc gai dày, ngọn nhọn |
| `Hair_Flame` | như trên nhưng dài gấp rưỡi, 9–11 chùm, rủ xuống quá gáy như ngọn lửa |
| `Hair_Short` | tóc ngắn ôm sọ, mấy chỏm ngắn phía trước trán |
| `Hair_Swept` | chải hất hẳn về sau (−X), thành một khối mượt có nếp |
| `Hair_Long` | tóc dài rủ sau lưng quá vai, có vạt trước ôm má |
| `Hair_Bob` | tóc ngang cằm, ôm hai bên mặt, mái ngang |
| `Hair_Mohawk` | mào giữa sọ dựng đứng, hai bên sọ trọc |
| `Hair_Bun` | búi tròn trên đỉnh, có dây buộc — kiểu samurai/võ lâm |
| `Hair_Ponytail` | đuôi ngựa cao buộc sau gáy, bay về −X |
| `Hair_Afro` | khối tròn to bao quanh sọ, mép lởm chởm |
| `Hair_Braid` | bím tóc dày rủ sau lưng, thắt thành 4–5 đốt |
| `Hair_Slick` | vuốt keo, ngắn bóng, một vệt sáng dọc — kiểu hiện đại |
| `Hair_Wild` | bờm xù tứ phía, không theo hàng lối |
| `Hair_Mane` | bờm thú: lông ngắn dày quanh GÁY và cổ, không phủ đỉnh đầu |
| `Hair_Tentacle` | 4 xúc tu rủ sau gáy, thon dần, có giác bám mờ |

⚠ Ba tấm dưới đây là **tóc DƯỚI NÓN** — chỉ vẽ phần LÒI RA ngoài vành nón (gáy và mang tai),
đỉnh đầu để TRỐNG: `Hair_UnderLong` · `Hair_UnderBraid` · `Hair_UnderMane` · `Hair_UnderTail`.

## 3. LÔ 2 — MẶT (12 tấm, canvas 128×128, template `template_head.png`)

Vẽ **TRONG** vòng tròn đầu. Nhìn ngang nên **chỉ một con mắt**, đặt quanh (77, 68).

| Tên file | Vẽ gì |
|---|---|
| `Face_Dot` | một con mắt tròn đơn giản |
| `Face_Angry` | mắt xếch + lông mày gãy hằn xuống |
| `Face_Visor` | dải kính chắn ngang mắt, có vệt phản chiếu |
| `Face_Glasses` | kính tròn một mắt kính + gọng chạy về tai |
| `Face_Mask` | khăn bịt nửa mặt dưới, mắt lộ ra trên |
| `Face_Scar` | mắt + vết sẹo chéo qua mắt |
| `Face_Beard` | râu quai nón rủ dưới cằm + mắt |
| `Face_Skull` | hốc mắt sâu + hàm răng lộ |
| `Face_ManyEyes` | cụm mắt nhện: 2 mắt lớn + 4 mắt nhỏ quanh |
| `Face_OneEye` | MỘT mắt to duy nhất giữa mặt, có con ngươi |
| `Face_Fangs` | mắt hẹp + ba cái nanh nhô lên từ hàm dưới |
| `Face_Hollow` | hai hốc mắt rỗng phát sáng — ma |

## 4. LÔ 3 — BĂNG ĐẦU / MŨ MỀM (11 tấm, canvas 128×128, template `template_head.png`)

Ôm quanh vòng tròn đầu; đuôi khăn/dải rủ về **−X (phía sau)**.

`Band_Headband` dải vải ngang trán, hai đuôi bay sau · `Band_Bandana` khăn trùm sọ có nút sau
gáy · `Band_Cap` mũ lưỡi trai (lưỡi trai chìa về +X) · `Band_Hood` mũ trùm sát thủ, khoét lộ
mặt · `Band_Crown` vương miện năm chấu · `Band_Horns` đôi sừng cong · `Band_Halo` vòng sáng lơ
lửng trên đầu · `Band_Antenna` một ăng-ten/tai thú nhô lên có chóp tròn · `Band_Antlers` gạc
nai chẻ nhánh · `Band_Frill` diềm cổ bò sát xoè nan quạt phía sau · `Band_Spikes` hàng gai
xương chạy dọc sọ về gáy.

## 5. LÔ 4 — DÁNG ĐẦU (8 tấm, canvas 128×128, template `template_head.png`)

Đây là **cả cái đầu** (thay đầu tròn gốc), đường kính ≈ 64 px, tâm (64,64).

`Head_Round` tròn · `Head_Square` hàm vuông đỉnh phẳng · `Head_Oval` bầu dục cao · `Head_Wedge`
nhọn về trước · `Head_Big` tròn to 1.18× · `Head_Beast` mõm thú dài chúc xuống, sọ dốc ·
`Head_Insect` khối dẹt + hàm kìm chìa trước · `Head_Blob` cục nhớt mềm, đỉnh lún, đáy loe.

## 6. LÔ 5 — ÁO (12 tấm, canvas 96×128, template `template_torso.png`)

Neo: **vai ở (48, 96)** tính từ đáy, **hông ở (48, 24)** — thân dài 72 px. Bề ngang 40–48 px.
Không vẽ tay, không vẽ cổ người, không vẽ chân.

| Tên file | Vẽ gì |
|---|---|
| `Torso_Gi` | võ phục: cổ chữ V sâu, hai vạt chéo chồng nhau, đai to có nút thắt nhô ra |
| `Torso_Vest` | ghi-lê hở giữa, ba khuy, viền cổ chữ V |
| `Torso_Jacket` | áo khoác dài quá hông: ve áo bẻ, hàng cúc, hai túi có nắp |
| `Torso_Robe` | áo choàng pháp sư: cổ đứng, vai xuôi, thân LOE ra ở gấu, nếp dọc, đai lưng |
| `Torso_Plate` | giáp ngực: khối ngực cong có gờ sống giữa, 3 dải sườn ngang, tán đinh, cầu vai |
| `Torso_Tank` | áo ba lỗ: hai dây vai mảnh, cổ khoét cong, thân ôm |
| `Torso_Tunic` | áo dài trung cổ: cổ tròn, thắt lưng, vạt xẻ trước |
| `Torso_Tactical` | áo chống đạn: tấm ngực vuông, hai túi đạn, dây vai ngang |
| `Torso_Loincloth` | khố da thú: dải da chéo qua ngực + khố hông gấu răng cưa |
| `Torso_Hanfu` | trường bào võ lâm: cổ chéo lớn, đai rộng, vạt dài loe |
| `Torso_Bandage` | băng vải quấn chồng lớp quanh ngực, một đầu băng thõng xuống |
| `Torso_Cuirass` | giáp vảy: 5–6 hàng vảy chồng nhau, mỗi vảy có mép sáng |

## 7. LÔ 6 — SAU LƯNG (13 tấm, canvas 96×128, template `template_torso.png`)

Gắn ở vai (48,96), vật nằm về phía **−X (sau lưng)**.

`Back_Cape` áo choàng bay, gấu vẫy · `Back_Scarf` khăn quàng hai dải bay · `Back_Quiver` ống
tên chéo lưng, có mấy đuôi tên · `Back_Backpack` ba lô có nắp và dây · `Back_Wings_Cloth` cánh
vải khoác vai · `Back_Banner` cờ nhỏ cắm lưng (sashimono) · `Back_Sheath` vỏ kiếm chéo lưng ·
`Back_WingsBat` cánh dơi 4 ngón, **màng LÕM giữa các ngón** · `Back_WingsFeather` cánh lông vũ
xoè nan quạt từ một điểm vai · `Back_WingsInsect` hai thuỳ mỏng trong có gân · `Back_Carapace`
mai cứng phủ lưng, vằn ngang · `Back_Spines` hàng gai xương dọc sống lưng · `Back_Shroud` vải
liệm rách, gấu răng cưa.

## 8. LÔ 7 — ĐUÔI (7 tấm, canvas 128×64, template `template_tail.png`)

Gốc đuôi ở **(120, 32)** (mép phải), đuôi kéo về **−X**.

`Tail_Monkey` đuôi khỉ cong lên · `Tail_Lizard` đuôi thằn lằn thuôn · `Tail_Tuft` đuôi dài có
chùm lông cuối · `Tail_Spade` đuôi quỷ đầu mũi tên · `Tail_Sting` đuôi bọ cạp: chuỗi đốt cong
lên, ngòi cong ngược ở đầu · `Tail_Fin` vây cá bản rộng có nan · `Tail_Bushy` đuôi sói xù dày.

## 9. LÔ 8 — PHỤ THÂN (6 tấm, canvas 128×96, template `template_extra.png`)

Mọc từ **hông (64, 72)**, toả xuống và sang hai bên.

`Extra_SpiderLegs` ba cặp chân nhện gập khuỷu cao · `Extra_Claws` hai càng kìm chìa trước,
**miệng kìm HỞ hình chữ V** · `Extra_Roots` rễ cây toả xuống từ một gốc chung · `Extra_Ooze`
vũng nhớt loe thấp dưới chân + vài giọt rơi · `Extra_Tendrils` bốn xúc tu bò dưới thân ·
`Extra_Chitin` bốn tấm giáp bụng xếp lớp.

## 10. LÔ 9 — ỐNG TAY/CHÂN (2 tấm, canvas 48×24, template `template_sleeve.png`)

`Sleeve_Round` viên nang có viền tối · `Sleeve_Plain` viên nang KHÔNG viền (kiểu Stick Fight).
⚠ Hai đầu phải là **nửa hình tròn hoàn chỉnh** trong 12 px mỗi bên: khúc GIỮA bị kéo giãn lúc
chạy (9-slice), hai đầu thì không. Vẽ chi tiết ở giữa là nó bị kéo nhoè.

## 11. Nhận về — kiểm ba thứ trước khi bấm nút

| Kiểm | Cách |
|---|---|
| đúng khổ + đúng mốc | `intake_look.py` tự ép; nếu lệch nhiều thì nó cắt mất — vẽ lại trên template |
| chỉ có thang xám | `intake_look.py` tự quy về 4 mức; tấm ra một khối đen tuyền = ChatGPT vẽ quá tối, xin lại sáng hơn |
| đọc được ở cỡ thật | `python disk_preview.py out.png --sheet` rồi nhìn ô 40 px |

Xong cả bộ thì bấm «★ Ngoại hình nhân vật» → nhìn `Docs/ArtSheets/Looks_*.png` → Doctor.
