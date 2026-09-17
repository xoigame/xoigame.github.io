# Bộ PROMPT sinh ART bằng ChatGPT — vũ khí · nón · giáp · khiên · vật cưỡi

> Theo **LUẬT NGUỒN ASSET** trong `AGENTS.md`: art vẽ bằng code chỉ là **bản nháp / bản chữa
> cháy**. Nó dựng bằng `Rect`/`Circle` nên mãi mãi là mấy khối màu phẳng — lớp viền
> (`WeaponArtGenerator.Polish`) làm nó **ĐỌC ĐƯỢC**, không làm nó **ĐẸP**.
>
> **AI CÓ THỂ TỰ LÁI ChatGPT** qua Chrome của user (`claude-in-chrome`, phiên đăng nhập sẵn):
> mở chatgpt.com → gõ prompt → chờ vẽ → cho chính trang tự tải PNG về `Downloads` bằng một
> `<a download>` dựng trong page (URL ảnh có chữ ký nên KHÔNG đọc thẳng được) → `intake_sheet.py`.
> User chỉ cần nhìn kết quả. Nếu không lái được thì quay về đường cũ: AI đưa prompt, user dán.

---

## ⚠ TỪ 2026-09-09: DANH SÁCH MÓN LẤY TỪ TOOL, FILE NÀY GIỮ PHẦN CHỈ ĐẠO HÌNH

Bấm `★ Bảng điều khiển > Hình > ★ ĐẶT HÀNG ART` (hoặc `Nâng cao > Art > ★ Đặt hàng ART`) →
`Docs/ArtOrders/` có sẵn đơn hàng cho **từng nền văn minh, từng nhóm vũ khí, từng thư mục art**,
kèm CỠ tính từ bảng cân bằng thật và ĐƯỜNG DẪN nhận art. Mở `Docs/ArtOrders/INDEX.md` trước.

Chia việc giữa hai nơi:

| | Ở đâu |
|---|---|
| *"đợt này đặt những món nào, cỡ bao nhiêu, đổ vào đâu"* | tool (`StickmanArtPrompt`) — đọc bảng lúc bấm nên không bao giờ cũ |
| *"nón phải có vành rộng nhất ở 70% trên, giáp tỉ lệ 0.45–0.55, cung không vẽ dây…"* | **file này** — luật hình, đã trả giá từng cái một |
| ràng buộc kỹ thuật chung (6 điều) + phong cách | `StickmanArtPrompt.StyleBible` — MỘT bản, tool tự dán vào đầu mọi đơn hàng |

⚠ Mục 1 dưới đây là bản CHÉP TAY của sáu ràng buộc. Nó còn ở đây để đọc; bản thi hành là hằng
số trong code. Lệch nhau thì tin code.

---

## 0. Quy trình ba bước

| Bước | Ai làm | Làm gì |
|---|---|---|
| 1 | **AI** | đưa prompt (§1 + đúng một mục §2–§6 + đoạn nền văn minh ở §7) |
| 2 | **AI hoặc USER** | AI tự lái Chrome; hoặc user dán prompt rồi thả PNG vào folder ở §8 |
| 3 | **AI** | cắt/đo/chấm pivot/gắn vào asset, chạy tool, soi lại ở cỡ thật |

⚠ Xin **TỪNG BỘ MỘT** (một nền văn minh, hoặc một nhóm vũ khí), đừng xin 40 tấm một lượt —
ChatGPT trả về khổ ảnh và tỉ lệ không đồng nhất khi danh sách quá dài, mà **cả bộ phải chung
một tỉ lệ** thì lên người mới đều nhau.

---

## 1. SÁU RÀNG BUỘC — dán vào ĐẦU mọi prompt

```
Kỹ thuật bắt buộc, không được bỏ qua cái nào:
1. NỀN TRONG SUỐT hoàn toàn (PNG alpha). Không nền trắng, không bóng đổ, không khung viền.
2. NHÌN NGANG (side view), vật quay sang PHẢI. Đây là art cho game 2D đi ngang.
3. VẼ ĐỨNG THẲNG, KHÔNG xoay nghiêng sẵn trong file. Máy tự xoay lúc chạy.
4. KHÔNG ĐỐI XỨNG TRÁI–PHẢI. Hình cân đối hai bên là quy ước NHÌN CHÍNH DIỆN — nhìn ngang
   thì đuôi khăn, vạt áo, dải lông chỉ rủ về MỘT phía (phía sau, tức bên TRÁI ảnh).
5. Chỉ vẽ ĐÚNG món đó. Không vẽ kèm nhân vật, mặt đất, tay cầm, hay nhiều biến thể trong
   một ảnh.
6. Cả bộ CHUNG MỘT KHỔ ẢNH và CHUNG MỘT TỈ LỆ. Vật to hơn thì chiếm nhiều pixel hơn TRONG
   cùng khổ ảnh đó, không phải đổi khổ ảnh.

Phong cách: pixel art / vector phẳng, viền tối rõ, 3–4 mảng màu lớn tách bạch. Hình sẽ bị
thu nhỏ xuống ~40 px khi chơi, nên chi tiết vụn (đinh tán, vân vải, chữ khắc) là vô ích —
thứ duy nhất còn đọc được là BÓNG NGOÀI và MẢNG MÀU LỚN NHẤT.
```

---

## 2. VŨ KHÍ

Cỡ đo bằng **% chiều cao nhân vật** (`StickmanWeaponBuilder.WeaponHeightRatio` — nguồn sự
thật). Nhân vật = **2.848 rig unit**, PPU 100 ⇒ `chiều dài px = % × 285`.

⚠ **Bảng này đã đối chiếu CHIỀU DÀI THẬT** (người 175 cm) — số đầy đủ nằm trong chú thích
ngay trên `WeaponHeightRatio`. Sáu cây từng nhỏ hơn đời thật (giáo · đinh ba · kích · thương
kỵ · trường cung · súng hoả mai) đã được nâng. Nhóm cây NGẮN cố ý to hơn đời thật để còn đọc
được ở ~40 px.

⚠ Từ nay tool đo **PHẦN VẼ ĐƯỢC**, không đo khung ảnh — nên hãy vẽ **kín khung** (≥95%),
đừng chừa viền rộng. Chừa viền không làm sai cỡ nữa nhưng làm phí độ phân giải.

| Nhóm | Cây | % | Khổ nên xin |
|---|---|---|---|
| Ngắn 1 tay | Đao ngắn | 38% | 108 × 40 |
| | Chuỳ | 48% | 137 × 64 |
| | Gậy gộc | 50% | 143 × 56 |
| | Rìu · Song kiếm | 54% | 154 × 92 |
| | Xích chuỳ | 56% | 160 × 80 |
| | Đao · Song đao | 58% | 165 × 52 |
| | Kiếm | 60% | 171 × 48 |
| 2 tay | Búa chiến | 72% | 205 × 100 |
| | Đao dài | 80% | 228 × 58 |
| | Kiếm rune | 82% | 234 × 58 |
| Cán dài | Giáo · Đinh ba | **118%** | 336 × 32 |
| | Lưỡi hái | 105% | 299 × 150 |
| | Kích | **118%** | 336 × 62 |
| | Côn | 110% | 313 × 26 |
| | Thương kỵ | **145%** | 413 × 34 |
| Tầm xa | Súng lục | 26% | 74 × 56 |
| | Tiểu liên | 40% | 114 × 70 |
| | Nỏ · Súng phóng lựu | 52% | 148 × 90 |
| | Súng hoả mai | **82%** | 234 × 80 | ← `Matchlock.png`, khổ code-gen hiện tại 176 × 92
| | Súng ngắn nòng | 60% | 171 × 78 |
| | Súng trường | 62% | 177 × 62 |
| | Súng bắn tỉa | 72% | 205 × 58 |
| | **Cung** | **74%** | **100 × 211 (VẼ DỌC)** |
| | **Cung dài** | **103%** | **100 × 294 (VẼ DỌC)** |
| | Lao | 100% | 285 × 18 |
| Phép | Đũa phép | 34% | 97 × 26 |
| | Trượng | 105% | 299 × 60 |
| Phụ | Khiên | 50% | 143 × 143 |
| | Vuốt quỷ | 30% | 86 × 72 |
| | Ná | 34% | 97 × 54 |
| | Búa ném | 42% | 120 × 78 |
| | Lựu đạn / Bom | 16–18% | 51 × 51 |
| **Mở rộng 2026-09-05** | Dao găm (`Dagger`) | 32% | 91 × 34 |
| | Đại kiếm (`Greatsword`) | 86% | 245 × 60 |
| | Rìu hai tay (`Greataxe`) | 78% | 222 × 116 |
| | Rìu ném (`ThrowingAxe`) | 40% | 114 × 72 |
| | **Cung kỵ (`HorseBow`)** | **58%** | **80 × 165 (VẼ DỌC, cánh ngoặt chữ C)** |
| | Nỏ liên châu (`RepeatingCrossbow`) | 56% | 160 × 90 (HỘP TÊN trên thân) |
| | Đại đao cán dài (`Glaive`) | 115% | 328 × 60 |
| | Bình lửa (`Firepot`) | 20% | 57 × 66 |
| | Trung liên (`Lmg`) | 72% | 205 × 80 (hộp đạn + chân chống) |
| | Súng phun lửa (`Flamethrower`) | 66% | 188 × 94 (bình đỏ ở SAU, vòi ở +X) |
| | Tia lửa (`Flame`, đạn) | — | 40 × 24 |
| **Bắn súng 2026-09-05** | Ổ xoay (`Revolver`) | 30% | 92 × 74 |
| | AK (`Carbine`) | 64% | 182 × 92 (băng cong, báng gỗ) |
| | Súng săn liên thanh (`AutoShotgun`) | 62% | 177 × 86 (ổ đạn trống dưới nòng) |
| | Súng trường ngắm nhẹ (`ScoutRifle`) | 68% | 194 × 88 (ống ngắm ngắn, báng mảnh) |
| | Lựu đạn chớp (`Flashbang`) | 16% | 46 × 92 (ống thép trơn, chốt) |
| | Lựu đạn khói (`SmokeGrenade`) | 17% | 48 × 96 (ống thép, đai màu) |
| | Molotov | 22% | 63 × 108 (chai thuỷ tinh, giẻ cháy ở MIỆNG — miệng quay +X) |
| | RPG (`Rpg`) | 80% | 228 × 90 (ống phóng + đầu đạn hình nón ở +X) |
| | Đạn RPG (`Rocket`, đạn) | — | 64 × 20 |
| **Nhận từ ảnh 2026-09-07** | Búa rìu cán dài (`Pollaxe`) | 105% | 300 × 68 (cán có ỐP SẮT dọc, lưỡi rìu bản to + GAI ĐÂM ở đỉnh) | ← khổ code-gen hiện tại 360 × 80
| | Nỏ giàn (`Arbalest`) | 62% | 177 × 102 (TỜI TAY QUAY ở đuôi + BÀN ĐẠP sắt ở mũi — hai thứ nói ra "nạp rất chậm") | ← khổ code-gen hiện tại 190 × 110

### 2c. ⚠ ĐƠN HÀNG — **BIẾN THỂ: một loại vũ khí NHIỀU HÌNH** (mở ngày 2026-09-05)

Mỗi loại vũ khí nay có thể có N hình; mỗi lính bốc một hình theo hạt giống của chính nó nên
cả tiểu đội cầm kiếm mà không ai cầm cây y hệt ai. Cỡ · pivot · chỉ số vẫn của prefab — biến
thể CHỈ đổi hình, vẽ theo ĐÚNG KHỔ + PIVOT của tấm gốc (bảng §2).

Hai chỗ đặt, cùng quy ước tên `<gốc>_<số>`:
· **Bộ mặc định** (lính không khoác nền: hiện đại · fantasy · bàn thử):
  `Assets/Sprites/Weapons/Variants/Sword_2.png`, `Sword_3.png`, `Rifle_2.png`… → bấm
  «Quét BIẾN THỂ skin vũ khí» (hoặc bước dựng vũ khí tự chạy).
· **Theo nền văn minh**: `Assets/Sprites/Civilizations/<Nền>/Weapon_Sword_2.png` cạnh tấm gốc
  `Weapon_Sword.png` → bấm «★ 15 nền văn minh». Biến thể mà không có tấm gốc thì tool réo tên.

Prompt mẫu:

```
[dán §1]

Vẽ cho tôi BA BIẾN THỂ của cây kiếm một tay thời trung cổ châu Âu, mỗi cây một file PNG
171 × 48 px, cùng khổ, cùng chỗ tay nắm (chuôi ở 1/5 bên trái, mũi quay sang PHẢI):
- Sword_2: kiếm arming lưỡi thẳng, chắn tay thẳng, đốc tròn
- Sword_3: falchion lưỡi bản rộng cong ở mũi, chắn tay ngắn
- Sword_4: kiếm dài chắn tay chữ S, đốc hình quả lê
Cùng chất liệu thép sáng, cán da nâu.
```

**Ba luật riêng của vũ khí — sai là lắp ngược:**

1. **MŨI quay sang +X (bên PHẢI ảnh).** Quy ước của cả dự án.
2. **CUNG: BỤNG quay về bên PHẢI, DÂY nằm bên TRÁI.** Thứ gần mục tiêu nhất là chỗ bàn tay
   bóp vào; hai đầu cánh và sợi dây ở phía sau. Vẽ ngược là kéo dây thì dây chạy xuyên qua
   thân gỗ. (Đã dính hai lần: `Longbow.png` và cả 7 skin văn minh.)
   ⚠ Nỏ thì NGƯỢC LẠI — cánh nỏ nằm ở MŨI.
3. **Điểm nắm tay phải nằm trong khung ảnh**, và **cán phải đủ dài** để tay phụ nắm được
   (vũ khí 2 tay). Đừng vẽ cán bị cắt cụt ở mép ảnh.

**Prompt mẫu (một nhóm vũ khí của một nền):**

```
[dán §1]

Vẽ cho tôi bộ vũ khí TRUNG HOA thời trung cổ, mỗi cây một file PNG riêng:
- Kích ji      308 × 66 px
- Thương qiang 299 × 32 px
- Đao          165 × 52 px
- Song đao     165 × 52 px
- Nỏ liên châu 148 × 90 px
- Cung          100 × 211 px (VẼ DỌC, bụng cung quay sang PHẢI, dây ở bên TRÁI)

Mũi/lưỡi của mọi cây quay sang PHẢI. Chuôi và cán ở bên trái.
Chất liệu: thép sáng, cán gỗ đỏ sẫm, khâu và bao chuôi màu ĐỒNG VÀNG, tua đỏ ở chuôi.
```

---

## 2b. ⚠⚠ ĐƠN ĐẶT HÀNG ĐANG MỞ — **51 TẤM SKIN VŨ KHÍ** (rà ngày 2026-09-01)

**Vì sao có mục này:** user báo *"các nền văn minh đang dùng lại hình ảnh giáp nón và vũ khí
của nhau"*. Đo ra thì **đúng, và nặng hơn tưởng** — nhưng chỉ ở VŨ KHÍ:

| Món | Tình trạng |
|---|---|
| **Nón** | 45 tấm / 15 nền — **không tấm nào trùng tấm nào**. Ổn. |
| **Giáp** | 15 tấm / 15 nền — **không trùng**. Ổn. |
| **Khiên** (trang bị) | 13 tấm (Nhật + Hải tặc cố ý không có) — **không trùng**. Ổn. |
| **Vũ khí** | roster 15 nền dùng **111 cây**, chỉ **75 cây có skin riêng** ⇒ **36 cây (32%) đang vẽ bằng ART CHUNG của cả dự án**, cộng **15 tấm trùng byte y hệt nhau** giữa các nền. |

**15 tấm TRÙNG BYTE** (cùng một file, khác tên nền):

  · `Arab/Weapon_Mace.png` = `India/Weapon_Mace.png`
  · `China/Weapon_DualSabers.png` = `China/Weapon_Saber.png` = `DaiViet/Weapon_Saber.png`
  · `China/Weapon_Halberd.png` = `DaiViet/Weapon_Halberd.png`
  · `China/Weapon_Lance.png` = `DaiViet/Weapon_Lance.png` = `India/Weapon_Lance.png` = `Mongol/Weapon_Lance.png`
  · `Crusader/Weapon_Lance.png` = `Europe/Weapon_Lance.png`
  · `Europe/Weapon_Halberd.png` = `India/Weapon_Halberd.png`

⚠ Cây nào **THIẾU** skin thì `WeaponSkinSet` không có gì để thay, `WeaponBase` giữ nguyên
sprite gốc — tức **cả 15 nền cầm y hệt một cây**. Nó không phải lỗi code: hệ skin chạy đúng,
chỉ là chưa có art. Vì vậy đây là ĐƠN ĐẶT HÀNG, không phải bug.

### Danh sách việc — 51 tấm

| Nền | Cần | Tấm phải vẽ |
|---|---|---|
| **Ả Rập** (`Arab`) | 3 THIẾU, 1 TRÙNG | **Lao** `Weapon_Javelin.png` — 285 × 18<br>**Đao ngắn** `Weapon_ShortSaber.png` — 108 × 40<br>**Khiên** `Weapon_Shield.png` — 143 × 143<br>**Chuỳ** `Weapon_Mace.png` — 137 × 64 |
| **Đông La Mã** (`Byzantine`) | 2 THIẾU | **Cung** `Weapon_Bow.png` — 100 × 211 — VẼ DỌC<br>**Khiên** `Weapon_Shield.png` — 143 × 143 |
| **Trung Hoa** (`China`) | 1 THIẾU, 4 TRÙNG | **Khiên** `Weapon_Shield.png` — 143 × 143<br>**Song đao** `Weapon_DualSabers.png` — 165 × 52<br>**Kích** `Weapon_Halberd.png` — 336 × 62<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34<br>**Đao** `Weapon_Saber.png` — 165 × 52 |
| **Thập tự** (`Crusader`) | 1 THIẾU, 1 TRÙNG | **Khiên** `Weapon_Shield.png` — 143 × 143<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34 |
| **Đại Việt** (`DaiViet`) | 2 THIẾU, 3 TRÙNG | **Đao dài** `Weapon_LongSaber.png` — 228 × 58<br>**Khiên** `Weapon_Shield.png` — 143 × 143<br>**Kích** `Weapon_Halberd.png` — 336 × 62<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34<br>**Đao** `Weapon_Saber.png` — 165 × 52 |
| **Ai Cập** (`Egypt`) | 3 THIẾU | **Cung** `Weapon_Bow.png` — 100 × 211 — VẼ DỌC<br>**Lao** `Weapon_Javelin.png` — 285 × 18<br>**Khiên** `Weapon_Shield.png` — 143 × 143 |
| **Trung cổ châu Âu** (`Europe`) | 2 THIẾU, 2 TRÙNG | **Cung dài** `Weapon_Longbow.png` — 100 × 294 — VẼ DỌC<br>**Khiên** `Weapon_Shield.png` — 143 × 143<br>**Kích** `Weapon_Halberd.png` — 336 × 62<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34 |
| **Ấn Độ** (`India`) | 3 THIẾU, 3 TRÙNG | **Lao** `Weapon_Javelin.png` — 285 × 18<br>**Cung dài** `Weapon_Longbow.png` — 100 × 294 — VẼ DỌC<br>**Khiên** `Weapon_Shield.png` — 143 × 143<br>**Kích** `Weapon_Halberd.png` — 336 × 62<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34<br>**Chuỳ** `Weapon_Mace.png` — 137 × 64 |
| **Nhật** (`Japan`) | 1 THIẾU | **Đao dài** `Weapon_LongSaber.png` — 228 × 58 |
| **Mông Cổ** (`Mongol`) | 3 THIẾU, 1 TRÙNG | **Lao** `Weapon_Javelin.png` — 285 × 18<br>**Đao ngắn** `Weapon_ShortSaber.png` — 108 × 40<br>**Khiên** `Weapon_Shield.png` — 143 × 143<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34 |
| **Ottoman** (`Ottoman`) | 3 THIẾU | **Cung** `Weapon_Bow.png` — 100 × 211 — VẼ DỌC<br>**Súng hoả mai** `Weapon_Matchlock.png` — 234 × 80<br>**Khiên** `Weapon_Shield.png` — 143 × 143 |
| **Ba Tư** (`Persia`) | 3 THIẾU | **Cung** `Weapon_Bow.png` — 100 × 211 — VẼ DỌC<br>**Cung dài** `Weapon_Longbow.png` — 100 × 294 — VẼ DỌC<br>**Khiên** `Weapon_Shield.png` — 143 × 143 |
| **Hải tặc** (`Pirate`) | 2 THIẾU | **Song đao** `Weapon_DualSabers.png` — 165 × 52<br>**Lao** `Weapon_Javelin.png` — 285 × 18 |
| **Slav (Rus)** (`Rus`) | 4 THIẾU | **Cung** `Weapon_Bow.png` — 100 × 211 — VẼ DỌC<br>**Lao** `Weapon_Javelin.png` — 285 × 18<br>**Thương kỵ** `Weapon_Lance.png` — 413 × 34<br>**Khiên** `Weapon_Shield.png` — 143 × 143 |
| **Viking** (`Viking`) | 3 THIẾU | **Búa ném** `Weapon_Hammer.png` — 120 × 78<br>**Lao** `Weapon_Javelin.png` — 285 × 18<br>**Khiên** `Weapon_Shield.png` — 143 × 143 |

### Ba luật riêng cho đợt này

1. **KHÔNG NỀN NÀO DÙNG LẠI CỦA NỀN NÀO.** Đó là cả lý do có đơn hàng này. Hai nền cùng dùng
   "thương kỵ" thì vẫn phải là HAI tấm khác nhau — khác đầu mũi, khác khâu, khác màu cán.
2. **KHÁC NHAU PHẢI ĐỌC ĐƯỢC Ở ~40 px.** Vũ khí lên tay chỉ cao 40–60 px, và thân stickman là
   khối ĐEN ĐẶC nên chi tiết bên trong biến mất sạch. Chỉ còn **ĐƯỜNG BAO** và **mảng màu lớn
   nhất** — đúng luật đã ghi cho bộ nón ở §3. Khác nhau ở hoa văn khắc trên lưỡi là khác nhau
   trên giấy, không khác nhau trong game.
3. **PIVOT NẰM Ở CHỖ NẮM TAY, và sai pivot Y = SAI GÓC VŨ KHÍ.** `weaponAngle` xoay cây vũ khí
   sao cho +X (đo TỪ PIVOT) trỏ theo hướng ngắm — đặt pivot thấp hơn đường sống lưỡi một chút
   là cây vũ khí ngóc lên chừng ấy độ dù không đổi con số nào. Đã dính: Rus Sword +11.8°,
   Pirate SaberShort +19.3°, Ottoman Crossbow +16.7°. Nhận file về thì chạy `intake_sheet.py`
   (§8b) chứ đừng cắt tay.

### ⚠⚠ TÊN FILE SAI = SKIN CHẾT, KHÔNG LỖI NÀO BÁO

Phần sau dấu `_` phải là **giá trị `enum WeaponType`** (`Assets/Scripts/Core/Combat/WeaponTypes.cs`) — `WeaponSkinSet` tra skin bằng enum đó. Tên nghe đúng về lịch sử nhưng không phải giá trị enum thì file nằm trên đĩa mãi mãi mà **không ai nạp**, và nhìn vào game chỉ thấy cả 15 nền cầm y hệt một cây.

Đã dính **năm lần**, hai đợt khác nhau:

| File chết | Đúng phải là |
|---|---|
| `Japan/Weapon_Katana.png` | `Weapon_Saber.png` |
| `Japan/Weapon_Naginata.png` | `Weapon_Halberd.png` |
| `Japan/Weapon_Yari.png` | `Weapon_Spear.png` |
| `Ottoman/Weapon_SaberLong.png` | `Weapon_LongSaber.png` — **đã đổi tên 2026-09-02** |
| `Pirate/Weapon_SaberShort.png` | `Weapon_ShortSaber.png` — **đã đổi tên 2026-09-02** |

⚠ Hai dòng cuối là art VẼ TAY thật (28–35 KB) nằm chết từ đợt trước — và chính BẢNG Ở TRÊN của tài liệu này đã ghi sai thứ tự (`SaberLong`/`SaberShort` thay vì `LongSaber`/`ShortSaber`), nên làm theo tài liệu là đẻ thêm file chết. Đã sửa.

`intake_wep.py` chặn sẵn bằng danh sách `WEAPON_TYPES` — nhận art về thì cho nó cắt, đừng đổi tên tay.

### Nhận file về

Thả PNG vào `Assets/Sprites/Civilizations/<Key>/` đúng tên `Weapon_<Loại>.png`
(phần sau dấu `_` phải khớp `enum WeaponType`), rồi bấm
`Tools > Stickman > Nâng cao > Civilizations > 2`.

⚠ **Bản theo CẤP tự sinh, ĐỪNG đặt vẽ 5 lần.** `CivilizationArtGenerator.GenerateWeaponSkinTiers`
đổi bảng màu kim loại trên chính tấm gốc ra `<nền>/Tier1..Tier5/` — đó là ngoại lệ DUY NHẤT
được phép vẽ bằng code (xem AGENTS.md, mục LUẬT NGUỒN ASSET).

---

## 3. NÓN — khổ **256 × 256**, khó nhất bộ

Đây là nơi đã hỏng **năm lần** vì cùng một kiểu lỗi. Bốn luật, thiếu cái nào cũng lắp sai:

| Luật | Vì sao | Hỏng thế nào |
|---|---|---|
| **VÀNH NÓN = hàng ngang RỘNG NHẤT** trong 70% trên của hình | máy neo đúng hàng đó vào tâm đầu | vẽ chỗ khác rộng hơn là nón đặt sai chỗ |
| **PHẢI có diềm gáy / khăn rủ DƯỚI vành** | máy bỏ qua **30% dưới** để khỏi ăn phải tấm che gáy | không có gì dưới vành ⇒ chính cái vành lọt vùng bỏ qua ⇒ sai cỡ, sai chỗ |
| **VÒM cao ≥ 96 px TRÊN vành** | thấp hơn là ra "viên thuốc dẹp" đội hờ, hở nguyên khối sọ đen | khăn hải tặc từng chỉ 52 px |
| **Diềm gáy phải HẸP HƠN vành** | nếu rộng hơn thì nó CƯỚP MẤT vai trò của vành | nón tụt xuống che mặt |

Thêm ba yêu cầu để nón đọc được ở cỡ thật (~44 px):

- **BÓNG NGOÀI KHÔNG ĐỐI XỨNG** — một nét rủ hẳn về phía sau (bên trái ảnh);
- **BA MẢNG MÀU TÁCH BẠCH** (kim loại · vải · viền kim loại quý), không phải một khối kẻ sọc;
- **MỘT NÉT THÒ RA** (che má, chóp, chùm lông, vạt khăn) — thứ duy nhất còn nhận ra được;
- ⚠ **hai nền khác nhau phải khác ở MÀU TRỘI và DÁNG VÒM**, không phải ở hoa văn. Đông La Mã
  và Mông Cổ từng trùng hệt nhau dù mở file 256 px ra thì rõ ràng là hai cái nón khác nhau.

### 3b. ⚠ ĐO ĐƯỢC: bộ nón hiện tại đang hỏng ở đâu (rà ngày 2026-08-28)

Bấm `Nâng cao > Civilizations > 6. Soi bộ nón 15 nền` để tự chạy lại bảng này bất cứ lúc nào.

**(1) HAI THẾ HỆ ART SỐNG CHUNG — đây là gốc của câu "nón to nhỏ không đều".**
Fit theo vành xong, chiều cao nón quy ra "mấy lần đường kính đầu":

| Còn là BẢN NHÁP 96×72 | cao | | Bộ 256×256 | cao |
|---|---|---|---|---|
| `Helm_Arab` | **0.77** | | `Helm_DaiViet` | 1.51 |
| `Helm_China` | **0.98** | | `Helm_Byzantine` | 1.55 |
| `Helm_Viking` | **1.04** | | `Helm_Persia` | 1.66 |
| `Helm_Japan` | **1.09** | | `Helm_Rus` | 1.71 |
| `Helm_Europe` | **1.36** | | `Helm_India` | 1.81 |
| `Helm_Pirate` (256 nhưng dẹp) | **0.94** | | `Helm_Ottoman` | **1.92** |

Chênh **2.49 lần** giữa cao nhất và thấp nhất — và ranh giới rơi gần đúng vào ranh giới hai
thế hệ. **Vẽ lại 5 tấm nháp + `Helm_Pirate` là kéo chênh lệch về ~1.3 lần**, không phải đi
chỉnh hằng số nào cả.

⚠ Tài liệu này trước đây ghi *"mẫu chuẩn để nhìn theo: `Helm_Arab.png` (art thật, đã được
chấm là đẹp)"* — **SAI**: file trên đĩa hôm nay là bản nháp 96×72, và nó là tấm DẸP NHẤT bộ.
Muốn có mẫu để nhìn theo thì lấy `Helm_Byzantine.png` hoặc `Helm_Rus.png` (đúng khổ 256, đúng
cấu tạo vòm + đai + diềm).

**(2) NÓN TRÙM KÍN MẶT.** Đo phần tư TRƯỚC-DƯỚI của khối đầu (chỗ mắt đọc ra là "cái mặt") còn
nhìn thấy được bao nhiêu:

| Nón | mặt còn thấy |
|---|---|
| `Helm_Byzantine` | **0.2%** |
| `Helm_Persia` | **0.8%** |
| `Helm_Rus` | **1.4%** |
| `Helm_Mongol` | **3.3%** |
| `Helm_Europe` | **5.3%** |
| `Helm_Crusader` | 1.7% — **cố ý**, mũ trụ kín mặt |

Nguyên nhân: **diềm gáy vẽ chạy đều hai bên**, nên nửa của nó nằm đúng trước mặt. Đã chữa ở
hàm vẽ (`Skirt` cắt mép trước ở `Cx − FaceClear`), nhưng **art nhận từ ngoài về phải tự theo
luật**: nhìn NGANG thì diềm gáy buông từ GÁY và hai bên, tới gò má là hết.

**(3) BÓNG NGOÀI TRÙNG NHAU — VẪN CÒN NGUYÊN (rà lại 2026-09-01).** 30/45 tấm
(`Helm_*_Cap` và `Helm_*_Guard` của cả 15 nền) từng có alpha **giống hệt nhau tới từng pixel**.
Bản vá 2026-08-28 cho mỗi nền một bộ số dáng riêng và báo *"30/30 bóng ngoài khác nhau"* —
**con số đó nói dối**: nó đo bằng một CHUỖI đem so BẰNG NHAU, nên lệch một pixel là đã "khác".

Đo lại bằng **CHỒNG KHỚP (IoU)** trên mặt nạ 64×64:

| Họ | IoU trung bình | số cặp ≥ 0.85 | cặp sát nhất |
|---|---|---|---|
| `_Guard` (15 tấm) | **0.85** | **53/105** | `Byzantine_Guard` ~ `Europe_Guard` **0.97** |
| `_Cap` (15 tấm) | **0.80** | **40/105** | `Crusader_Cap` ~ `Viking_Cap` **0.97** |
| bộ chính (15 tấm) | 0.64 | 3/105 | `Europe` ~ `Viking` **0.99** |

Vặn con số trong một hàm vẽ KHÔNG đẻ ra cái nón thứ hai — 30 tấm đó vẫn là **một cái nón chóp
và một cái nón vòm**. Đây là ràng buộc số 1 của đơn hàng: khác nhau ở **CẤU TẠO**, không ở
tham số. `Nâng cao > Civilizations > 7` nay in cột **GẦN GIỐNG** để không báo `OK` được nữa.

---

### 3c. Trạng thái sau đợt sửa 2026-08-28 — còn thiếu gì

Bản code đã được vá tới mức **chạy được và đo được**, nhưng nó vẫn là art dựng bằng
`Circle`/`Rect`, tức mãi mãi là mấy khối màu phẳng:

| Đã sửa bằng code | Còn phải nhờ ChatGPT |
|---|---|
| 5 nền hết khổ nháp 96×72 (Âu · Viking · Nhật · Trung Hoa · Ả Rập) → chênh cỡ 2.49× còn ~1.37× | **HÌNH DÁNG** — vẫn là vòm + đai + diềm, không ra kiểu nón của từng nền |
| Vòm ngồi trên vành, diềm gáy chừa mặt → bộ `_Guard` từ **0%** mặt hiện lên **59–68%** | |
| ~~30/30 bóng ngoài `_Cap`/`_Guard` khác nhau~~ — **phép đo sai, xem 3b (3)** | **VẪN LÀ HAI HỌ DÁNG**: IoU tb 0.85 / 0.80, chưa phải 45 kiểu riêng |
| Pivot chấm ngay lúc ghi file, không còn kẹt ở `0.5/0.5` | |

**Bảng ở mục 3d là danh sách đặt hàng đầy đủ: 45 tấm, mỗi nền ba kiểu riêng của chính nền đó.**

⚠⚠ **ĐƠN HÀNG NÀY CHƯA NHẬN ĐƯỢC TẤM NÀO** (rà 2026-09-01). Cả 45 tấm trên đĩa vẫn là art
`Circle`/`Rect` do `CivilizationHelmetArt` vẽ, và người dùng đã báo lại đúng hai triệu chứng
mà bảng 3d sinh ra để chữa: *"nón các nền giống nhau"* và *"không phải style của nền đó"*.
Ba khối duy nhất mà code dựng được — nón CHÓP, nón VÒM, cái HỘP — không phủ nổi typology nón
trung cổ thật (kettle hat · great helm · bascinet · sallet · barbute · armet · morion ·
spangenhelm · burgonet). **Đừng thêm hàm vẽ thứ ba; gửi bảng 3d cho ChatGPT.**

### 3d. BỘ 45 CÁI NÓN — mỗi nền BA kiểu RIÊNG, không nền nào dùng lại của nền nào

⚠ **LUẬT SỐ 1 CỦA BẢNG NÀY: KHÔNG GHÉP NÓN CỦA NỀN NÀY SANG NỀN KHÁC.** Bản code hiện tại
từng làm đúng chuyện đó — `_Cap` của cả 15 nền là **một đường bao duy nhất tô lại màu**,
`_Guard` cũng vậy. Ở cỡ thật (~44 px) chỉ còn đường bao đọc được, nên 30 cái nón ấy thật ra
là 2 cái nón. Thiếu kiểu thì **VẼ THÊM**, đừng mượn của nền khác.

Mỗi nền ba kiểu, xếp theo hạng lính: **`_Cap` = dân binh / lính nhẹ** · **`<Nền>` = chính quy
(kiểu tiêu biểu nhất của nền)** · **`_Guard` = tinh nhuệ / kỵ binh**. Cả ba phải cùng đọc ra
MỘT nền, nhưng khác hẳn nhau về ĐƯỜNG BAO.

| File | Nền | Kiểu lịch sử | Đường bao phải đọc ra | Màu trội |
|---|---|---|---|---|
| `Helm_Europe_Cap` | Âu | **Kettle hat** (chapel-de-fer) | vành RỘNG loe đều, như cái chảo lật ngược | thép + lam |
| `Helm_Europe` | Âu | **Spangenhelm có sống mũi** | vòm bầu có nẹp, một dải mũi hẹp thõng trước | thép |
| `Helm_Europe_Guard` | Âu | **Bascinet mũi chó** | vòm cao + **mõm nhọn chìa hẳn ra trước** | thép |
| `Helm_Crusader_Cap` | Thập tự | **Cervelliere + coif xích** | chỏm tròn sát sọ, mạng xích rủ xuống vai | trắng + xám |
| `Helm_Crusader` | Thập tự | **Great helm** | HỘP TRỤ mặt phẳng, khe mắt ngang, chữ thập đỏ | trắng + đỏ |
| `Helm_Crusader_Guard` | Thập tự | **Great helm có mào lông** | như trên + chùm lông ngả hẳn về SAU | trắng + đỏ |
| `Helm_Viking_Cap` | Viking | **Mũ da khâu có gờ sắt** | vòm mềm thấp, đường khâu dọc thấy rõ | nâu da |
| `Helm_Viking` | Viking | **Gjermundbu** | vòm 4 múi + **GỌNG MẮT** hai vòng tròn | sắt xám |
| `Helm_Viking_Guard` | Viking | **Spangenhelm che má + đuôi xích** | vòm có nẹp, hai má vuông, xích rủ gáy | sắt + đồng |
| `Helm_Japan_Cap` | Nhật | **Jingasa** | ĐĨA CHÓP DẸT rộng, gần như phẳng | đen sơn mài |
| `Helm_Japan` | Nhật | **Kabuto** | vòm nhỏ + **shikoro loe** + sừng maedate vàng | đen + đỏ + vàng |
| `Helm_Japan_Guard` | Nhật | **Kabuto có mengu** | như trên + **mặt nạ quỷ** che nửa dưới mặt | đen + đỏ |
| `Helm_China_Cap` | Trung Hoa | **Mũ vải bọc đồng che tai** | vòm thấp, hai tấm tai vuông rủ hai bên | đỏ + đồng |
| `Helm_China` | Trung Hoa | **Mũ trụ chóp tua đỏ** (Minh) | chóp nhọn + **CHÙM TUA ĐỎ** xoè trên đỉnh | thép + đỏ |
| `Helm_China_Guard` | Trung Hoa | **Mũ trụ che má lớn + diềm lụa** | vòm + hai má CONG rộng + diềm lụa dài | vàng + đỏ |
| `Helm_Arab_Cap` | Ả Rập | **Kufiya + vòng agal** | KHÔNG kim loại: vải rủ vai, vòng đen quanh đầu | trắng ngà |
| `Helm_Arab` | Ả Rập | **Turban helmet** | vòm thép QUẤN khăn thành vòng dày quanh vành | trắng + thép |
| `Helm_Arab_Guard` | Ả Rập | **Mũ trụ mạng xích che mặt** | vòm cao + **màn xích** phủ từ vành xuống | thép + đồng |
| `Helm_DaiViet_Cap` | Đại Việt | **Nón dấu (nón tre)** | NÓN LÁ chóp nón, vành tròn rộng | vàng tre |
| `Helm_DaiViet` | Đại Việt | **Mũ trụ đồng có chỏm** | chóp đồng + chỏm tròn + diềm vải xanh | đồng + xanh lục |
| `Helm_DaiViet_Guard` | Đại Việt | **Mũ trụ diềm vải che gáy** | vòm thấp + diềm vải DÀY phủ gáy và má | đồng + đỏ |
| `Helm_India_Cap` | Ấn Độ | **Pagri quấn quanh chỏm thép** | khối vải TRÒN BÈ, nếp quấn chéo | vàng nghệ |
| `Helm_India` | Ấn Độ | **Khud** | vòm + **hai ống cắm lông** dựng + mạng xích | thép + hồng sen |
| `Helm_India_Guard` | Ấn Độ | **Khud có mũi trượt** | như trên + thanh mũi DÀI chỉnh lên xuống | thép + vàng |
| `Helm_Mongol_Cap` | Mông Cổ | **Mũ da mềm có tai che** | mềm, hai vạt tai TO rủ hai bên | nâu da |
| `Helm_Mongol` | Mông Cổ | **Chóp nón vành lông thú** | HÌNH NÓN + vành lông dày quanh chân | nâu lông |
| `Helm_Mongol_Guard` | Mông Cổ | **Mũ sắt lá + che gáy da** | chóp sắt ghép lá + tấm gáy da vuông | sắt + nâu |
| `Helm_Byzantine_Cap` | Đông La Mã | **Pilos thép** | chóp CONG VỀ TRƯỚC (dáng mũ phrygian) | vàng nhạt |
| `Helm_Byzantine` | Đông La Mã | **Mũ trụ sống vàng + diềm xích** | vòm có **sống vàng dọc** + màn xích dài | VÀNG + thép |
| `Helm_Byzantine_Guard` | Đông La Mã | **Mũ có mào lông NGANG** | mào lông chạy NGANG đỉnh (La Mã muộn) | vàng + đỏ tía |
| `Helm_Ottoman_Cap` | Ottoman | **Börk (mũ Janissary)** | ỐNG VẢI CAO, vạt rủ hẳn về sau | trắng |
| `Helm_Ottoman` | Ottoman | **Chichak** | vòm + mũi trượt + **hai tấm tai tròn** + gáy | thép + xanh lục |
| `Helm_Ottoman_Guard` | Ottoman | **Turban helm có rãnh xoắn** | vòm PHÌNH có rãnh xoắn ốc, chóp nhỏ | thép + lục |
| `Helm_Rus_Cap` | Rus | **Mũ da viền lông** | vòm thấp, viền lông dày quanh chân | nâu + lông xám |
| `Helm_Rus` | Rus | **Shishak** | **CHÓP NHỌN CAO NHẤT BỘ** + màn xích | thép + nâu |
| `Helm_Rus_Guard` | Rus | **Mũ mặt nạ Yaroslavl** | chóp + **MẶT NẠ SẮT** có mũi và ria nổi | thép + vàng |
| `Helm_Persia_Cap` | Ba Tư | **Mũ vải quấn chóp thấp** | khối vải thấp bè, nếp quấn ngang | lam ngọc |
| `Helm_Persia` | Ba Tư | **Kulah khud** | vòm + **chóp vàng có khía** + màn xích | lam ngọc + vàng |
| `Helm_Persia_Guard` | Ba Tư | **Kulah khud hai sừng** | như trên + **hai sừng nhỏ** cong ra trước | vàng + lam |
| `Helm_Pirate_Cap` | Hải tặc | **Khăn đỏ trùm sọ** | vải bó sọ, nút buộc + hai đuôi rủ về SAU | đỏ |
| `Helm_Pirate` | Hải tặc | **Mũ ba góc (tricorne)** | ba mép vành LẬT LÊN — bóng ngoài tam giác bẹt | đen + vàng |
| `Helm_Pirate_Guard` | Hải tặc | **Morion cướp được** | **MÀO LƯỢC** dọc đỉnh + vành nhọn hai đầu | thép xỉn |
| `Helm_Egypt_Cap` | Ai Cập | **Khat (mũ vải trơn)** | vải bó sọ, một đuôi buộc rủ về sau | trắng lanh |
| `Helm_Egypt` | Ai Cập | **Nemes** | sọc vàng–lam, vạt rủ trước vai, rắn uraeus | vàng + lam |
| `Helm_Egypt_Guard` | Ai Cập | **Khepresh (mũ chiến xanh)** | khối cao NGẢ RA SAU, mặt phủ vảy tròn | xanh lam |
| `Helm_Wei_Cap` | Ngụy | **Mũ vải bọc sắt Hán** | vòm thấp, hai tấm tai vuông rủ hai bên | lam + đồng |
| `Helm_Wei` | Ngụy | **Mũ trụ Ngụy có ống cắm** | vòm + ỐNG CẮM đồng trên đỉnh + chùm lông LAM ngả sau, sống mũi | thép + lam |
| `Helm_Wei_Guard` | Ngụy | **Mũ Hổ Báo kỵ** | vòm + hai má CONG + đốn hạng dài + lông lam, dải đồng dọc vòm | thép + lam + đồng |
| `Helm_Shu_Cap` | Thục | **Khăn đầu Ba Thục** | KHÔNG kim loại: khăn đỏ bó sọ, đuôi rủ sau | đỏ |
| `Helm_Shu` | Thục | **Phượng sí khôi** | vòm + MỘT CÁNH PHƯỢNG vàng vút chéo ra sau + tua đỏ trên chỏm | thép + đỏ + vàng |
| `Helm_Shu_Guard` | Thục | **Mũ Ngũ hổ tướng** | như trên + hai cánh + hai má cong vàng | vàng + đỏ |
| `Helm_Wu_Cap` | Ngô | **Khăn lụa vàng Giang Đông** | KHÔNG kim loại: khăn quấn vàng, nút thắt sau | vàng |
| `Helm_Wu` | Ngô | **Mũ Giang Đông** | vòm THẤP BÈ + khăn vàng quấn DÀY quanh vành + nút thắt + chỏm đen | thép + vàng + đen |
| `Helm_Wu_Guard` | Ngô | **Mũ thuỷ quân Đông Ngô** | vòm thấp + hai má sơn mài đen + khăn vàng | đen + vàng |

⚠ Ba nền có kiểu **KHÔNG KIM LOẠI** (`Arab_Cap` khăn kufiya · `Pirate_Cap` khăn đỏ ·
`Egypt_Cap` khăn khat) — đó là chủ ý: dân binh mấy nền đó thật sự chỉ có vải, và nó cho tuyến
đầu / tuyến sau đọc khác nhau ngay từ đường bao.

⚠ Ba kiểu TRÙM KÍN MẶT là chủ ý và chỉ có ba: `Crusader` · `Crusader_Guard` · `Japan_Guard`
(mengu) · `Rus_Guard` (mặt nạ). Còn lại **BẮT BUỘC hở mặt** — xem ràng buộc trong prompt.

### 3e. Prompt mẫu — gửi THEO TỪNG NỀN (ba tấm một lượt)

Gửi cả ba cùng lúc thì ChatGPT giữ được bảng màu và nét vẽ đồng nhất trong một nền; gửi 45 tấm
một lượt là nó trôi phong cách từ giữa chừng.

~~~
Vẽ 3 cái nón pixel-art cho game stickman 2D nhìn NGANG, mỗi cái một file PNG riêng.

RÀNG BUỘC KỸ THUẬT (bắt buộc, áp cho cả ba tấm):
- Khổ 256 x 256, nền TRONG SUỐT hoàn toàn.
- Nhìn NGANG (side view), nhân vật quay mặt sang PHẢI. Vẽ ĐỨNG THẲNG, KHÔNG xoay nghiêng sẵn.
- Chỉ vẽ cái nón. Không vẽ đầu, người, đất, bóng đổ, khung viền, chữ ký, chữ.
- VIỀN NGOÀI ĐEN dày 3-4 px bao trọn khối; bên trong 3 tông (nền tối -> thân -> một vệt sáng
  mỏng men theo mép trên-trái).
- Hàng ngang RỘNG NHẤT của hình phải là VÀNH NÓN (chỗ ôm quanh sọ), và phải nằm trong 70%
  TRÊN của hình. Máy neo đúng hàng đó vào đầu nhân vật.
- Vòm cao ÍT NHẤT 96 px tính TỪ vành lên đỉnh.
- DƯỚI vành: chỉ được vẽ ở phía SAU (bên TRÁI ảnh) - diềm gáy, khăn rủ, mạng xích. Phía TRƯỚC
  (bên PHẢI ảnh) phải ĐỂ TRỐNG: đó là chỗ khuôn mặt. Ngoại lệ duy nhất là một dải sống mũi HẸP.
- Phải có VẬT LIỆU nào đó dưới vành ở phía sau (diềm / khăn / xích). Không có thì máy đo sai cỡ.
- Bóng ngoài KHÔNG đối xứng trái-phải, và phải có ĐÚNG MỘT nét thò ra khỏi khối chính.
- Chi tiết nhỏ hơn 6 px là vô nghĩa: tấm này sẽ bị thu về khoảng 44 px trong game.

BA TẤM CẦN VẼ - <TÊN NỀN>:
1. <file>_Cap    - <kiểu lịch sử> - <đường bao> - màu trội <màu>
2. <file>        - <kiểu lịch sử> - <đường bao> - màu trội <màu>
3. <file>_Guard  - <kiểu lịch sử> - <đường bao> - màu trội <màu>

Ba tấm phải KHÁC HẲN NHAU về đường bao, nhưng cùng bảng màu để đọc ra cùng một nền.
~~~

Điền ba dòng cuối bằng đúng một hàng trong bảng ở mục 3d.

### 3f. Nhận file về

1. Thả PNG vào `Assets/Sprites/Civilizations/<Nền>/`, ĐÚNG TÊN trong bảng
   (`Helm_Rus_Guard.png`, `Helm_Egypt_Cap.png`...).
   Với nón cần ôm đầu (đặc biệt khăn/quấn như Ấn Độ, Byzantine), hãy dùng
   `head_template_5.png` hoặc `head_template_big_5.png` và nhận bằng `intake_fid.py`.
   Script sẽ ghi thêm `<tên>.png.headanchor.json`; đây là tâm đầu thật mà Unity dùng làm
   pivot/cỡ, nên không bị nhầm với vành nón loe.
   Nón placeholder sinh bằng code cũng tự ghi sidecar khi lưu; không cần chấm lại bằng mắt
   hay sửa một hằng số chung cho cả 15 nền.
2. `Tools > Stickman > Nâng cao > Civilizations > 2. Build Civilization Assets`.
3. Mở `Demo_37_CivRoster`, bấm «Đủ bộ nón», kéo ngang xem cả dàn trên rig thật.
4. `Civilizations > 6. Soi bộ nón 15 nền` — kiểm bằng SỐ: chênh cỡ, vành có kẹp mép cửa sổ
   không, bóng ngoài có tấm nào trùng tấm nào, pivot đã chấm chưa.

⚠ **ĐỪNG bấm `Civilizations > 0` sau khi đã thả art thật.** Nút đó xoá art code-gen rồi vẽ
lại, và nó nhận diện art code-gen **bằng KHỔ ẢNH** — art thật của bạn cũng 256×256 nên sẽ bị
coi là code-gen và bị xoá. Sau khi thay art thật thì chỉ dùng mục **2**.

---

### 3g. ⚠⚠ 15 PROMPT ĐÃ ĐIỀN SẴN — dán thẳng, không phải soạn lại

Cách dùng: mỗi lượt dán **KHỐI CHUNG** rồi dán tiếp **một khối nền**. Gửi từng nền một —
gửi 45 tấm một lượt là ChatGPT trôi phong cách từ giữa chừng (đã ghi ở mục 3e).

⚠ **PHONG CÁCH ĐÃ ĐƯỢC CHỐT (2026-09-01)**, đừng để ChatGPT tự chọn: **thép có khối + đinh
tán**, giữ **màu riêng từng nền**. Cụ thể là ba điểm dưới đây, và thiếu điểm nào thì tấm art
lại rơi về "hình vẽ phẳng" — đúng thứ vừa phải bỏ đi.

#### ⚠⚠ BỐN BÀI HỌC TỪ ĐỢT GIAO 45 NÓN (2026-09-02) — dán thêm vào KHỐI CHUNG

Đợt đầu nhận về phải vẽ lại gần hết, vì bốn lỗi lặp đi lặp lại. Prompt nào cũng phải chèn:

1. **GÓC NHÌN**: ChatGPT mặc định vẽ góc 3/4 (thấy mặt trước + hai bên má) — trên stickman
   nhìn ngang nó đọc ra *"cảm giác hai bên cái đầu"*. Phải đòi **MẶT CẮT NGANG THUẦN TUÝ**
   (pure side elevation, orthographic): chỉ thấy MỘT bên, vành nón là ĐƯỜNG chứ không phải elip.
2. **TỈ LỆ**: nó nhồi kín khung + kéo màn xích dài lụt thụt → vành hẹp so với tổng cao, mà game
   phóng cả tấm theo VÀNH nên nón to gấp ba cái đầu. Đòi: **cao toàn tấm ≤ 1.15 × bề rộng
   vành**, phần dưới vành ≤ 30% chiều cao và HẸP HƠN vành.
3. **NÓ TỰ VẼ THÊM CÁI ĐẦU ĐEN** làm bối cảnh — phải cấm rõ, và cấm một lần là các lượt sau
   trong CÙNG chat nghe theo.
4. **"Nền trong suốt" của nó có BA biến thể giả**: ô caro vẽ vào RGB · nền trắng đặc · màn
   voan trắng/bóng xám alpha 10–160 phủ cả sheet (nối các đảo làm một khi cắt). `intake_gear.py`
   tự khử cả ba (`dechecker` · `strip_veil` · ngưỡng đảo 64), nhưng sheet sạch từ đầu vẫn hơn.

⚠ Khâu nhận đã có ba lưới đo tự động trong `intake_gear.py`: `check_proportion` (réo tấm cao
quá 1.15×vành) · `normalise_gear` (cắt bớt phần rủ dưới vành) · `narrow_below_brim` (bóp ngang
màn xích rộng hơn vòm — chỉ khi phép đo vành THẬT SỰ bị kẹp). Và mọi tấm nhận về được tự đóng
nhãn `stickman:hand` — xem AGENTS.md mục 2e-0l.

#### KHỐI CHUNG (dán trước mỗi lượt)

~~~
Vẽ 3 cái nón pixel-art cho game stickman 2D nhìn NGANG, mỗi cái một file PNG riêng.

RÀNG BUỘC KỸ THUẬT — áp cho cả ba tấm:
- Khổ 256 x 256, nền TRONG SUỐT hoàn toàn (alpha thật, KHÔNG vẽ ô caro giả trong suốt).
- Nhìn NGANG (side view), nhân vật quay mặt sang PHẢI. Vẽ ĐỨNG THẲNG, KHÔNG xoay nghiêng sẵn.
- Chỉ vẽ cái nón. Không vẽ đầu, người, đất, bóng đổ, khung viền, chữ ký, chữ, watermark.
- Hàng ngang RỘNG NHẤT của hình phải là VÀNH NÓN (chỗ ôm quanh sọ), nằm trong 70% TRÊN của
  hình. Máy neo đúng hàng đó vào đầu nhân vật.
- Vòm cao ít nhất 96 px tính TỪ vành lên đỉnh.
- DƯỚI vành chỉ được vẽ ở phía SAU (bên TRÁI ảnh): diềm gáy, khăn rủ, mạng xích. Phía TRƯỚC
  (bên PHẢI ảnh) để TRỐNG — đó là chỗ khuôn mặt. Ngoại lệ duy nhất: một dải sống mũi HẸP,
  và mõm che mặt của bascinet.
- Phải có vật liệu nào đó dưới vành ở phía sau. Không có thì máy đo sai cỡ.
- Chi tiết nhỏ hơn 6 px là vô nghĩa: tấm này sẽ bị thu về khoảng 44 px trong game.

PHONG CÁCH — THÉP CÓ KHỐI, không phải hình vẽ phẳng:
1. Chuyển tông LIÊN TỤC trên mặt cong (không phải 2-3 mảng màu phẳng ghép cạnh nhau).
   Nguồn sáng ở TRÊN-TRÁI. Kim loại thêm một dải sáng ngang giữa thân (phản xạ chân trời)
   và một vệt bắt sáng HẸP ở góc trên-trái.
2. Nẹp ghép mảnh vẽ thành CẶP: một đường tối ở dưới-phải kèm một đường sáng ở trên-trái —
   đó là thứ làm mắt đọc ra "hai tấm thép chồng lên nhau". Đinh tán NỔI: nửa dưới tối,
   chấm sáng lệch lên trên-trái.
3. Viền ngoài: một nét tối MỎNG 2 px, cộng thêm viền SÁNG men mép trên-trái. KHÔNG dùng
   viền đen dày bao quanh kiểu hoạt hình.
   Vải / da thì NGƯỢC LẠI: dải tông hẹp, không bắt sáng, có hạt và nếp gấp.

MÀU: phần KIM LOẠI để xám thép. Phần VẢI / DA / LÔNG / SƠN dùng màu của nền văn minh ghi
ở dưới — đó là thứ để người chơi đọc ra phe giữa trận đông người.

Ba tấm phải KHÁC HẲN NHAU về ĐƯỜNG BAO (không phải chỉ khác màu), nhưng cùng bảng màu để
đọc ra cùng một nền.
~~~

#### 15 KHỐI NỀN (dán một khối sau khối chung)

Cột *kiểu* lấy từ bảng 3d. Màu ghi là màu VẢI/DA của nền — kim loại luôn xám thép.

~~~
BA TẤM — CHÂU ÂU (màu vải: xanh lam thẫm)
1. Helm_Europe_Cap   - Kettle hat (chapel-de-fer) - vành RỘNG loe đều như chảo lật ngược
2. Helm_Europe       - Spangenhelm - vòm bầu 4 múi có nẹp đồng, sống mũi hẹp, màn xích rủ gáy
3. Helm_Europe_Guard - Bascinet mũi chó - vòm CAO nhọn + MÕM NHỌN chìa hẳn ra trước, màn xích
~~~
~~~
BA TẤM — THẬP TỰ QUÂN (màu vải: trắng ngà + chữ thập đỏ)
1. Helm_Crusader_Cap   - Cervelliere + coif xích - chỏm tròn sát sọ, mạng xích rủ xuống vai
2. Helm_Crusader       - Great helm - HỘP TRỤ mặt phẳng, khe mắt ngang, lỗ thở, chữ thập đỏ nổi
3. Helm_Crusader_Guard - Great helm có mào - như trên + chùm lông ngả hẳn về SAU
~~~
~~~
BA TẤM — VIKING (màu da: nâu da bò, nẹp đồng)
1. Helm_Viking_Cap   - Mũ da khâu có gờ sắt - vòm mềm thấp, ba nẹp sắt, đường khâu thấy rõ
2. Helm_Viking       - Gjermundbu - vòm 4 múi + GỌNG MẮT hai vòng tròn quanh hốc mắt
3. Helm_Viking_Guard - Spangenhelm che má - vòm có nẹp, hai má vuông, đuôi xích rủ gáy
~~~
~~~
BA TẤM — NHẬT (màu: đen sơn mài + đỏ + vàng)
1. Helm_Japan_Cap   - Jingasa - ĐĨA CHÓP DẸT rộng, gần như phẳng, chỏm nhỏ giữa đỉnh
2. Helm_Japan       - Kabuto - bát hachi có via ghép, SHIKORO loe bậc thang che gáy,
                      FUKIGAESHI hai cánh lật ngược nhỏ hai bên trán, lưỡi trai mabizashi,
                      MAEDATE hình lưỡi liềm vàng gắn TRƯỚC trán
3. Helm_Japan_Guard - Kabuto có mengu - như trên + MẶT NẠ QUỶ che nửa dưới mặt
~~~
~~~
BA TẤM — TRUNG HOA (màu vải: đỏ son + vàng kim)
1. Helm_China_Cap   - 笠形盔 nón đấu bằng sắt - vành nón chóp dốc đều quanh vòm thấp
2. Helm_China       - 鐵盔 nhà Minh - chóp CAO + ống cắm trên đỉnh + CHÙM TUA ĐỎ (红缨) rủ
                      xuống + đốn hạng ghép lá vuông che gáy và tai
3. Helm_China_Guard - 鳳翅盔 phượng sí khôi - vòm + HAI CÁNH PHƯỢNG vàng vượt lên chéo ra sau
                      + chóp có tua đỏ
~~~
~~~
BA TẤM — Ả RẬP (màu vải: trắng ngà + viền vàng cát)
1. Helm_Arab_Cap   - Kufiya + vòng agal - KHÔNG kim loại: vải rủ vai, hai vòng dây đen quanh đầu
2. Helm_Arab       - Turban helmet - vòm thép cao QUẤN khăn thành vòng dày quanh vành
3. Helm_Arab_Guard - Mũ trụ mạng xích che mặt - vòm cao + MÀN XÍCH phủ từ vành xuống
~~~
~~~
BA TẤM — ĐẠI VIỆT (màu: xanh lục + đồng vàng)
1. Helm_DaiViet_Cap   - Nón dấu (nón tre) - NÓN LÁ chóp, vành tròn rộng, quai vải
2. Helm_DaiViet       - Mũ trụ đồng có chỏm - chóp đồng + chỏm tròn + diềm vải xanh lục
3. Helm_DaiViet_Guard - Mũ trụ diềm vải che gáy - vòm thấp + diềm vải DÀY phủ gáy và má
~~~
~~~
BA TẤM — ẤN ĐỘ (màu vải: vàng nghệ + hồng sen)
1. Helm_India_Cap   - Pagri quấn quanh chỏm thép - khối vải TRÒN BÈ, nếp quấn chéo
2. Helm_India       - Khud - vòm + HAI ỐNG CẮM LÔNG dựng song song + màn xích
3. Helm_India_Guard - Khud có mũi trượt - như trên + thanh mũi DÀI chỉnh lên xuống được
~~~
~~~
BA TẤM — MÔNG CỔ (màu da: nâu da + lông xám nâu)
1. Helm_Mongol_Cap   - Mũ da mềm có tai che - mềm, hai vạt tai TO rủ hai bên
2. Helm_Mongol       - Chóp nón vành lông thú - HÌNH NÓN + vành lông dày quanh chân
3. Helm_Mongol_Guard - Mũ sắt ghép lá + che gáy da - chóp sắt ghép lá + tấm gáy da vuông
~~~
~~~
BA TẤM — HẢI TẶC (màu vải: đỏ thẫm + đen)
1. Helm_Pirate_Cap   - Khăn đỏ trùm sọ - vải bó sọ, nút buộc bên trái, hai đuôi rủ về SAU
2. Helm_Pirate       - Mũ ba góc (tricorne) - ba mép vành LẬT LÊN, bóng ngoài tam giác bẹt
3. Helm_Pirate_Guard - Morion cướp được - MÀO LƯỢC dọc đỉnh + vành nhọn vượt lên hai đầu
~~~
~~~
BA TẤM — ĐÔNG LA MÃ (màu: vàng kim + đỏ tía)
1. Helm_Byzantine_Cap   - Pilos thép - chóp CONG VỀ TRƯỚC (dáng mũ phrygian)
2. Helm_Byzantine       - Mũ trụ sống vàng - vòm có SỐNG VÀNG chạy dọc đỉnh + màn xích dài
3. Helm_Byzantine_Guard - Mũ mào lông NGANG - mào lông chạy NGANG qua đỉnh (La Mã muộn)
~~~
~~~
BA TẤM — OTTOMAN (màu vải: trắng + xanh lục ngọc)
1. Helm_Ottoman_Cap   - Börk (mũ Janissary) - ỐNG VẢI CAO, vạt rủ hẳn về sau
2. Helm_Ottoman       - Chichak - vòm + mũi trượt + HAI TẤM TAI TRÒN + tấm gáy
3. Helm_Ottoman_Guard - Turban helm có rãnh xoắn - vòm PHÌNH có rãnh xoắn ốc, chóp nhỏ
~~~
~~~
BA TẤM — RUS (màu da: nâu sẫm + lông xám, viền vàng)
1. Helm_Rus_Cap   - Mũ da viền lông - vòm thấp, viền lông dày quanh chân
2. Helm_Rus       - Shishak - CHÓP NHỌN CAO NHẤT BỘ + màn xích
3. Helm_Rus_Guard - Mũ mặt nạ Yaroslavl - chóp + MẶT NẠ SẮT có sống mũi và ria nổi
~~~
~~~
BA TẤM — BA TƯ (màu vải: lam ngọc + vàng)
1. Helm_Persia_Cap   - Mũ vải quấn chóp thấp - khối vải thấp bè, nếp quấn ngang
2. Helm_Persia       - Kulah khud - vòm + CHÓP VÀNG CÓ KHÍA + màn xích
3. Helm_Persia_Guard - Kulah khud hai sừng - như trên + HAI SỪNG nhỏ cong ra trước
~~~
~~~
BA TẤM — AI CẬP (màu: lam + vàng, vải lanh trắng)
1. Helm_Egypt_Cap   - Khat - vải trơn bó sọ, một đuôi buộc rủ về sau
2. Helm_Egypt       - Nemes - sọc vàng-lam, vạt rủ trước vai, rắn uraeus giữa trán
3. Helm_Egypt_Guard - Khepresh (mũ chiến xanh) - khối cao NGẢ RA SAU, mặt phủ vảy tròn
~~~
~~~
BA TẤM — NGỤY / TÀO NGỤY (Tam Quốc; màu vải: LAM thẫm + đồng)
1. Helm_Wei_Cap   - Mũ vải bọc sắt Hán - vòm thấp, hai tấm che tai vuông rủ hai bên, đai đồng
2. Helm_Wei       - Mũ trụ Ngụy - vòm sắt + ĐỐN HẠNG ghép lá lam che gáy + ỐNG CẮM đồng trên đỉnh
                    với CHÙM LÔNG LAM ngả hẳn về SAU, sống mũi hẹp
3. Helm_Wei_Guard - Mũ Hổ Báo kỵ - vòm sắt + hai má CONG rộng + đốn hạng dài + chùm lông lam,
                    thêm một dải đồng dọc sống vòm
~~~
~~~
BA TẤM — THỤC / THỤC HÁN (Tam Quốc; màu vải: ĐỎ son + vàng kim)
1. Helm_Shu_Cap   - Khăn đầu Ba Thục - khăn vải đỏ bó sọ, nút buộc + đuôi rủ sau, KHÔNG kim loại
2. Helm_Shu       - Phượng sí khôi - vòm sắt + diềm lụa đỏ + MỘT CÁNH PHƯỢNG vàng vút chéo lên
                    ra SAU + chỏm với TUA ĐỎ toả về sau, KHÔNG sống mũi
3. Helm_Shu_Guard - Mũ Ngũ hổ tướng - như trên + hai cánh phượng + hai má cong vàng, tua đỏ dài hơn
~~~
~~~
BA TẤM — NGÔ / ĐÔNG NGÔ (Tam Quốc; màu vải: VÀNG + đen sơn mài)
1. Helm_Wu_Cap   - Khăn lụa vàng Giang Đông - khăn quấn vàng KHÔNG kim loại, nút thắt sau, vạt rủ gáy
2. Helm_Wu       - Mũ Giang Đông - vòm sắt THẤP BÈ + KHĂN VÀNG quấn dày quanh vành (nếp chéo rõ)
                   + nút thắt sau gáy + đốn hạng sơn mài đen ngắn + chỏm đen đinh vàng
3. Helm_Wu_Guard - Mũ thuỷ quân Đông Ngô - vòm thấp + hai má sơn mài đen + khăn vàng + vành trước hẹp
~~~

⚠ Ba kiểu **KHÔNG KIM LOẠI** là chủ ý (`Arab_Cap` · `Pirate_Cap` · `Egypt_Cap`): dân binh mấy
nền đó thật sự chỉ có vải, và nó cho tuyến đầu / tuyến sau đọc khác nhau ngay từ đường bao.
⚠ Bốn kiểu **TRÙM KÍN MẶT** và chỉ có bốn: `Crusader` · `Crusader_Guard` · `Japan_Guard`
(mengu) · `Rus_Guard` (mặt nạ). Còn lại BẮT BUỘC hở mặt.

---

---

### 3h. ⚠⚠ ĐƠN HÀNG — **NÓN THEO CẤP: đổi CÁI NÓN, không đổi màu kim loại**

**Yêu cầu của người dùng (2026-09-02):** *"tôi muốn có nón theo cấp độ nữa, không phải nguyên
liệu mà nón theo cấp độ."*

Hiện `<nền>/Tier1..Tier5/Helm_*.png` là phép **ĐỔI BẢNG MÀU KIM LOẠI** trên chính tấm gốc —
cùng một cái nón, năm nước sơn. Ở cỡ thật (~44 px) thì màu là thứ **mất trước tiên**: có khói,
có đêm, có thanh máu chồng lên là năm cấp đọc ra như nhau. Nên cấp trang bị hiện **không đọc
được trên chiến trường**, dù bảng vật liệu vẫn đúng về nguyên tắc.

#### Thang 5 bậc — đo bằng ĐƯỜNG BAO, không đo bằng màu

Cùng MỘT thang cho cả 15 nền, nhưng mỗi nền kể bằng ngôn ngữ của mình. Hai trục chạy song song
và cả hai đều đọc được ở 44 px:

| Cấp | Cấu tạo | Đường bao | Che mặt |
|---|---|---|---|
| **1** | mũ VẢI / mũ DA, không kim loại | **NHỎ NHẤT** — ôm sát sọ, gần như chỉ là cái chỏm | hở gần hết |
| **2** | chỏm sắt + đai vành, ghép mảnh thô | nhỏ, bắt đầu có vành ngang | hở hoàn toàn |
| **3** | **nón chữ ký của nền**, bản trơn | vừa — đây là cái nón đang có hiện nay | hở mặt |
| **4** | nón chữ ký + che má / diềm gáy / sống mũi | to hơn, mép rủ xuống hai bên | hở mắt và mũi |
| **5** | nón kín + mào / chùm lông / nạm quý | **LỚN NHẤT** — cao nhất, phủ rộng nhất | có thể kín hẳn |

**Vì sao thang này chứ không phải thang khác:** ở 44 px chỉ còn ĐƯỜNG BAO và mảng màu lớn nhất
(luật §3 của chính tài liệu này, đã trả giá một lần với 30 cái nón trùng bóng). Một thang
*nhỏ → lớn* và *hở → kín* thì đọc được ngay cả khi nhân vật chạy ngang màn hình, còn thang
*đồng → sắt → thép* thì không.

⚠ **Chất liệu VẪN đi kèm** (da → sắt thô → sắt → thép sáng → vàng/bạc nạm) — nó là trục PHỤ
chạy cùng chiều, không phải trục bị bỏ. Bỏ nó là mất liên kết với thang vật liệu của vũ khí,
mà cả hai phải đọc chung một bảng (AGENTS.md 7b-gear).

#### Ba ràng buộc hình học — phá cái nào cũng hỏng trong im lặng

1. **CÙNG KHUÔN ĐẦU CHUẨN.** Dùng `head_template_5.png` (5 vòng tròn hồng #FF00FF, đường kính
   191 px, cách đều). Vẽ nón ĐỘI LÊN mấy cái đầu đó và **giữ nguyên màu hồng**. Cả năm cấp
   phải đội lên cái đầu **CÙNG CỠ** — đó là thứ giữ cho lên cấp không làm nhân vật đổi kích cỡ.
2. **CẤP 5 ĐƯỢC PHÉP KÍN MẶT, CẤP 1–4 THÌ KHÔNG.** Nón kín là phần thưởng của bậc cuối. Cấp
   1–4 phải thấy được mặt (đo bằng phần tư TRƯỚC-DƯỚI của khối đầu, ≥ 45% nhìn thấy được) —
   đúng luật đã chốt ở §3b sau ba lần sửa `HelmetBrimLift`.
3. **KHÔNG VẼ ĐỐI XỨNG TRÁI–PHẢI.** Đây là art nhìn NGANG, mặt quay **+X (sang phải)**. Vạt
   khăn · diềm gáy · đuôi mào rủ về phía **SAU (−X, bên trái ảnh)**. Đối xứng hai bên là quy
   ước hình CHÍNH DIỆN, lên người ra hai cái chân vải thò xuống hai bên đầu (đã dính với nón
   Ai Cập).

#### Prompt mẫu — gửi kèm `head_template_5.png`

> Vẽ 1 sheet PNG nền TRONG SUỐT, khổ 2560 × 512, chứa ĐÚNG 5 cái nón xếp NGANG thành 5 ô.
> Đây là **năm CẤP ĐỘ của cùng một dòng nón** thuộc nền văn minh **&lt;TÊN NỀN&gt;**, dùng cho
> game 2D nhìn ngang.
>
> Tôi đính kèm file mẫu có 5 vòng tròn HỒNG CÁNH SEN (#FF00FF) — đó là 5 CÁI ĐẦU. Hãy **giữ
> nguyên 5 vòng hồng đó đúng vị trí và đúng kích thước**, rồi vẽ mỗi cái nón ĐỘI LÊN đầu của ô
> đó. Đừng xoá, đừng dời, đừng đổi cỡ vòng hồng.
>
> · Ô 1 — mũ VẢI/DA, không kim loại, ôm sát sọ, đường bao nhỏ nhất.
> · Ô 2 — chỏm sắt thô + đai vành ghép mảnh.
> · Ô 3 — &lt;KIỂU NÓN CHỮ KÝ CỦA NỀN&gt;, bản trơn, không phụ kiện.
> · Ô 4 — vẫn kiểu đó nhưng thêm che má / diềm gáy / sống mũi, sắt sáng hơn.
> · Ô 5 — bản nghi lễ: kín nhất, cao nhất, có mào hoặc chùm lông, kim loại quý và nạm.
>
> Ràng buộc: nền trong suốt hoàn toàn (KHÔNG ô caro, KHÔNG nền trắng, KHÔNG bóng đổ) · nhìn
> NGANG, mặt quay sang PHẢI · phần rủ (vạt khăn, diềm gáy, đuôi mào) rủ về phía SAU tức bên
> TRÁI ảnh · **ô 1 đến ô 4 phải thấy rõ khuôn mặt**, chỉ ô 5 được che kín · năm ô phải khác
> nhau ở ĐƯỜNG BAO (nhỏ → lớn, hở → kín) chứ không chỉ khác màu · chỉ vẽ nón, không vẽ người,
> không chữ, không khung.

#### Nhận file về

```
python .claude/skills/stickman-assets/scripts/intake_fid.py <sheet.png> China --tier Helm_China
```

Script cắt 5 ô, đo lại chính cái đầu hồng của từng ô, khoét phần nón nằm sau đầu, tự lật nếu
vẽ ngược, rồi ghi `<nền>/Tier1..Tier5/Helm_China.png` + `.headanchor.json` từng cấp, và **đóng
nhãn `stickman:hand`** cho cả 5 tấm.

Xong thì bấm **`★ Bảng điều khiển` → `★ THAY ART NỀN VĂN MINH XONG → BẤM CÁI NÀY`**.

⚠ **Đóng nhãn là vế BẮT BUỘC.** `StickmanArtSource` cho code ghi đè tự do trong `TierN/` (vì
bộ đó vốn 100% do code đổi màu), **trừ** tấm mang nhãn `stickman:hand`. Quên nhãn thì lần bấm
tool kế tiếp vẽ đè hết, và nhìn vào chỉ thấy "cấp nào cũng như cấp nào" — không lỗi nào báo.

#### Vế CODE đã làm sẵn cho đơn hàng này (2026-09-02)

Trước đây `EquipmentDefinition` chỉ có **MỘT** `localScale` + **MỘT** `localPosition`, đo từ
tấm gốc, còn cấp thì chỉ đổi `renderer.sprite`. Đúng khi năm cấp trùng khít nhau (bản đổi màu),
nhưng **sai cho bốn trong năm cấp** ngay khi cấp 1 là mũ da còn cấp 5 là mũ trụ kín — và sai
trong im lặng: cấp nào cũng có một cái nón, chỉ là cái trùm quá cằm, cái bé hơn cái đầu.

Nay có `tierScales[]` / `tierOffsets[]` + `ScaleForTier` / `OffsetForTier`:
· `StickmanCivilizationBuilder.BakeTierTransforms` ĐO từng cấp bằng điểm neo đầu của chính
  tấm đó, nhưng **chỉ bake khi các cấp thật sự khác hình** (lệch > 2% cỡ hoặc > 2% bán kính
  đầu). Bản đổi màu để mảng RỖNG ⇒ hành vi cũ y nguyên, không nhích một pixel — giữ đúng luật
  AGENTS.md 7b-gear *"cỡ và chỗ đặt không đo lại theo từng cấp"*.
· `StickmanEquipment` áp số theo cấp ở **cả hai đường**: lúc `Equip` và lúc `SetGearTier` đổi
  cấp giữa trận. Thiếu đường thứ hai thì lính lên cấp giữa trận đổi hình mà giữ cỡ cũ.
· `EquipmentStabilizer.SetWorldOffset` — đổi độ lệch mà KHÔNG đo lại tư thế nghỉ. Gọi `Setup`
  lại thì nó chụp `_restAngle` ngay giữa một cú vung, và từ đó món đồ nghiêng lệch vĩnh viễn.

⚠ Cùng cơ chế áp luôn cho **GIÁP** và **KHIÊN** theo cấp — cả ba đều gọi `BakeTierTransforms`.

---

## 4. GIÁP — khổ **200 × 250**

Một luật duy nhất nhưng tuyệt đối:

> **TỈ LỆ phần vẽ được phải ≈ 0.45–0.55 (rộng ÷ cao), và KHÔNG ĐƯỢC vượt 0.63.**

⚠⚠ **CON SỐ 0.80 GHI Ở ĐÂY TRƯỚC ĐÂY LÀ SAI — và nó làm giáp BÈ RA** (rà 2026-09-02, sau khi
người dùng báo *"giáp sai, giáp phải vẽ xoay 90 độ"*). Tính thẳng từ rig:

| | |
|---|---|
| `ArmorHeight` = `bodyHalfHeight`×2×0.92 | **0.368** |
| `ArmorWidth` = `headRadius`×2×0.60 | **0.15** |
| ⇒ tỉ lệ ĐÍCH game muốn | **0.408** |

`ArmorScale` fit theo CHIỀU CAO rồi nén bề ngang, nhưng phép nén **bị kẹp** ở
`ArmorMaxSquash = 0.65`:

| Tỉ lệ art | squash | Hiện ra trong game |
|---|---|---|
| 0.55 | 0.74 (không kẹp) | **0.408** — đúng đích |
| 0.80 | 0.51 → **kẹp 0.65** | **0.52** — bè hơn đích 27% |

Nên art phải **nhỏ hơn 0.63** thì mới không chạm trần kẹp. Con số 0.80 là tỉ lệ của bộ
code-gen 57×71 — bộ đó cũng đang bị kẹp, chỉ là không ai đo. Đừng kéo ngang tấm art cho
"đúng 0.80": game đã tự nén bề ngang rồi, kéo thêm là tự đẩy nó vào vùng bị kẹp, và trên thân
stickman cao mảnh thì nó đọc ra *"giáp nằm ngang"*.

Máy fit giáp theo **CHIỀU CAO** (phủ 92% thân), nên tỉ lệ tấm art quyết định bề rộng. Bộ vẽ
bằng code là 57×71 = 0.80 và ra bộ giáp cân đối. `Armor_Japan` từng là art thật **vẽ nghiêng
3/4**, phần vẽ được 98×252 = **0.39** ⇒ cùng công thức ra một dải giáp hẹp bằng **nửa cái
đầu**. Art sai tỉ lệ thì phải VẼ LẠI — đừng đi chữa công thức, chữa là 14 nền kia hỏng theo.

Kèm theo:
- vẽ **CHÍNH DIỆN thân giáp** (đây là ngoại lệ duy nhất của luật nhìn ngang — giáp là lớp
  đắp lên khối thân dẹt);
- **biên dạng NGỰC NỞ → EO TÓP → VÁY GIÁP LOE**, KHÔNG phải cái hộp chữ nhật;
- không vẽ tay, không vẽ cổ, không vẽ đầu.

---

## 4b. ⚠⚠ ĐƠN ĐẶT HÀNG — **VẼ LẠI 15 BỘ GIÁP** (rà ngày 2026-09-01)

### Đo được: 15 bộ giáp chỉ là MỘT cái bình hoa tô 15 màu

Băm BYTE thì 15 tấm khác nhau hết (nên đợt rà trước báo "không trùng" — **kết luận đó SAI**).
Băm **ĐƯỜNG BAO** (alpha, chuẩn hoá về 48×48) thì ra sự thật:

| Nhóm | Số tấm | Số ĐƯỜNG BAO khác nhau |
|---|---|---|
| Nón | 45 | **45** ✔ (đã sửa đợt trước) |
| **Giáp** | 15 | **7** — và nhìn bằng mắt thì cả 15 là MỘT dáng |
| **Khiên** | 13 | **7** |
| Vũ khí | 81 | 68 |

Bốn nhóm giáp trùng đường bao TỚI TỪNG PIXEL:
`Arab = China = Pirate = Viking` · `Crusader = DaiViet = Mongol` · `Europe = India` ·
`Ottoman = Persia = Rus`.

⚠ **Con số 7 còn LẠC QUAN HƠN sự thật.** Băm chỉ bắt được đường bao trùng tới từng pixel;
nhìn bản render ở cỡ thật thì **cả 15 tấm đều là một khối bình hoa** — cùng chỏm vai, cùng eo
thắt, cùng váy giáp loe. Khác nhau chỉ ở hoa văn tô BÊN TRONG, mà ở ~60 px thì hoa văn biến
mất và chỉ còn đường bao. Đó đúng là bài học đã ghi cho bộ nón ở §3b, lặp lại nguyên xi ở giáp.

### Nguyên tắc: mỗi nền một KIỂU GIÁP CÓ THẬT, khác nhau ở KHỐI chứ không ở màu

| Nền | Kiểu giáp lịch sử | Đường bao phải đọc ra |
|---|---|---|
| **Europe** | tấm ngực thép (cuirass) | ngực NỞ có sống dọc giữa, eo tóp, váy lame ngang loe |
| **Crusader** | áo choàng surcoat trùm mail | **áo VẢI phẳng**, buông thẳng, xẻ tà — không có khối kim loại |
| **Viking** | áo mail byrnie ngắn | ống THẲNG tới hông, không eo, gấu bằng |
| **Japan** | ō-yoroi / dō | **VAI VUÔNG BÈ** (sode) + váy kusazuri 4–5 mảnh RỜI có khe hở |
| **China** | brigandine nhà Minh | áo dài tới hông rải **ĐINH TÁN thành hàng** + **tấm ngực VUÔNG** + váy giáp BỀ |
| **Mongol** | lamellar buộc dây | hàng ngang phiến nhỏ **KHÂU DÂY** (không đinh tán), dài tới gối, xẻ hai bên để cưỡi |
| **Byzantine** | klivanion | **PTERUGES** — dải da rủ ở vai và gấu, đó là dấu nhận dạng |
| **Rus** | giáp VẢY cá | hàng vảy chồng nhau, dài tới gối, thắt lưng rõ |
| **Persia** | chahar-aina | mail + **BỐN GƯƠNG TRÒN** đánh bóng, đĩa ngực to nhất |
| **India** | chahar-aina Mughal | mail + **bốn tấm CHỮ NHẬT** khảm vàng, váy mail dài hơn |
| **Ottoman** | krug | tấm thép LỚN nối bằng mail + **thắt lưng khăn quấn bản to** |
| **Arab** | mail trùm áo chần | dài, RỘNG, không eo |
| **Egypt** | yếm vải lanh | **KHÔNG kim loại** — lanh trắng xếp nếp + **vòng cổ usekh** bán nguyệt to |
| **DaiViet** | **da trâu SƠN ĐỎ** | phiến da đỏ, mũ *Tứ phương bình đính* đỉnh PHẲNG bốn cạnh |
| **Pirate** | không giáp | **áo khoác dài MỞ NGỰC** + gi-lê + khăn thắt lưng, có cúc |
| **Wei** (Ngụy) | lamellar sắt nhà Hán | hàng LÁ SẮT nhỏ xếp so le phủ ngực-bụng trên áo LAM, hai dải đai vai lam chéo, đai lưng đồng |
| **Shu** (Thục) | giáp vải đỏ có hộ tâm kính | vải ĐỎ + **GƯƠNG ĐỒNG TRÒN** to giữa ngực, dây đeo vàng lên hai vai, váy giáp đỏ sẫm |
| **Wu** (Ngô) | giáp vảy cá sơn mài | hàng **VẢY CÁ** đen bóng chồng nhau trên áo VÀNG, đai đen khoá vàng — nhìn ra "sông nước" |

Nguồn tra: [Giáp trụ Việt Nam](https://vi.wikipedia.org/wiki/Gi%C3%A1p_tr%E1%BB%A5_Vi%E1%BB%87t_Nam) ·
[Áo giáp Đại Việt](https://nghiencuulichsu.com/2013/03/06/ao-giap-dai-viet/) ·
[Ming brigandine](https://greatmingmilitary.blogspot.com/2024/09/brigandine-armours-of-ming-dynasty.html) ·
[Chinese armour](https://en.wikipedia.org/wiki/Chinese_armour) ·
[Mirror armour](https://en.wikipedia.org/wiki/Mirror_armour) ·
[Four Mirrors armour — Louvre Abu Dhabi](https://collection.louvreabudhabi.ae/en/object/mail-and-plate-armour-called-four-mirrors-armour)

### 5b. KHIÊN — phân biệt bằng DÁNG và CHẤT ĐAN, không bằng màu

Bảy nền đang cùng một cái đĩa tròn. Tròn là ĐÚNG lịch sử cho nhiều nền, nên đừng đổi dáng bừa
— hãy để **chất liệu** làm việc phân biệt:

| Nền | Dáng | Chất phải nhìn ra |
|---|---|---|
| Europe · Crusader | heater (tam giác đáy cong) | thép trơn / vải phủ có huy hiệu |
| Rus | **hạnh nhân (kite)** dài | gỗ bọc da, viền sắt |
| Viking | tròn LỚN | **ván gỗ ghép dọc** + núm sắt + viền sắt |
| Ottoman | tròn | **KALKAN — mây đan quấn CHỈ MÀU xoắn ốc** + núm thép |
| China · DaiViet | tròn / vuông | **mây tre đan ô vuông** |
| Persia | tròn | thép đánh bóng + **4 núm** |
| India | tròn | thép + 4 núm + **khảm vàng koftgari** |
| Arab · Mongol | tròn nhỏ | da thú khâu, gờ đồng tâm |
| Egypt | **chữ nhật đỉnh vòm** | **da bò còn lông đốm** |
| Wei (Ngụy) | **bầu dục CAO** | mặt lam, viền sắt, núm sắt giữa + 4 đinh đồng |
| Shu (Thục) | tròn | **mây đan (đằng bài)** vòng đồng tâm màu mây, tâm đỏ |
| Wu (Ngô) | tròn | vàng viền **đen sơn mài**, chữ V sóng nước, núm đen đinh vàng |

---

## 4c. ⚠⚠ ĐƠN HÀNG — **TRANG BỊ THEO CẤP: thô sơ → tinh xảo**

Yêu cầu: *"art trang bị bình thường, cấp cao trang bị xịn hơn đẹp hơn chi tiết hơn"*.

Hiện `<nền>/TierN/` chỉ là **đổi bảng màu kim loại** trên chính tấm gốc — cùng một cái nón,
sáng hơn. Đơn này thay bằng **5 bản VẼ THẬT** cho mỗi món.

| Cấp | Lính | Nón/giáp phải đọc ra |
|---|---|---|
| 1 | dân binh | da trần, dây buộc thô, **không hoa văn** |
| 2 | chính quy | thêm đai đồng, đinh tán thưa |
| 3 | lão luyện | sắt, đinh tán kín, gờ nổi |
| 4 | tinh nhuệ | thép sáng, **cán/quai bọc DA**, khảm một viên ngọc |
| 5 | cận vệ | vàng, chạm trổ kín, **chỏm/mào** |

### ⚠⚠ RÀNG BUỘC HÌNH HỌC — phá là mỗi lần lên cấp món đồ NHÍCH một chút

Tool đo cỡ và chỗ đặt TỪ CHÍNH TẤM ART. Nếu năm bản khác nhau về phép đo thì lên cấp là cái
nón dịch đi — không lỗi nào báo. Luật khác nhau theo slot:

- **NÓN** — đo bằng **VÀNH** (hàng ngang rộng nhất, bỏ 30% dưới; `TryMeasureBrim`). Nên cả 5
  cấp phải giữ **CÙNG bề rộng vành và cùng cao độ vành**. Phần TRÊN vành thì **thoải mái thêm
  mào, chỏm, lông, hào quang** — nó không đụng phép đo. Đây là chỗ để "xịn hơn".
- **GIÁP · KHIÊN** — đo bằng **KHUNG PHẦN VẼ ĐƯỢC** (`FitOpaqueHeight`/`ArmorScale` +
  `OpaqueCenterOffset`). Nên cả 5 cấp phải giữ **CÙNG khung bao**; chạm trổ phải nằm **BÊN
  TRONG**, không thò ra ngoài.
- Cả 5 cấp **CÙNG KHỔ CANVAS**, cùng nền trong suốt.

### ⚠ Art vẽ tay đặt vào `TierN/` NAY MỚI SỐNG ĐƯỢC

`CivilizationArtGenerator.DeleteWeaponSkinTiers` trước đây quét sạch thư mục `TierN` **không
hỏi nhãn** — đúng vì lúc đó bộ theo cấp 100% do code sinh. Ngay khi có một tấm vẽ tay đặt vào,
lần chạy tool kế tiếp XOÁ MẤT NÓ, không lỗi nào báo (nhìn vào chỉ thấy cấp cao lại trơn như
cấp thấp). Đã sửa: chỉ xoá tấm mang nhãn `stickman:codegen`. **Cứ thả art vào, nó ở lại.**

---

## 4d. ⚠⚠ ĐƠN HÀNG — **TƯỚNG LĨNH PHẢI KHÁC LÍNH LÁC**

Yêu cầu: *"tướng lĩnh, chỉ huy phải khác lính"*. Hiện chủ tướng chỉ có **VƯƠNG MIỆN** cắm trên
đầu (`DemoTeamFlag` object `TeamFlag`) — cùng bộ nón, cùng bộ giáp với lính thường, nên ở cỡ
thật **không đọc ra ai là tướng**.

Mỗi nền cần thêm **1 nón + 1 giáp cấp CHỦ TƯỚNG**, và chúng phải khác ở thứ đọc được từ xa:

| Đòn bẩy | Vì sao dùng được |
|---|---|
| **CHÙM LÔNG / MÀO CAO** trên đỉnh nón | nằm TRÊN vành → không đụng phép đo, mà làm bóng ngoài cao hẳn lên: nhìn một cái là thấy ai chỉ huy |
| **ÁO CHOÀNG rủ sau lưng** | slot `Back` đã có sẵn, vẽ vào đó là xong |
| **MÀU TRỘI khác hẳn** (vàng/đỏ thẫm) | ở ~44 px thì màu là thứ thứ hai còn đọc được sau đường bao |

⚠ **ĐỪNG phân biệt bằng hoa văn tinh xảo hơn** — đó đúng là cái sai của bộ giáp hiện tại:
tinh xảo hơn ở 256 px, nhưng ở 60 px thì không khác gì.

⚠ **Còn thiếu CHỖ CẮM trong code**: `CivilizationDefinition` mới có `helmet`/`armor`/`shield` +
`helmetVariants`/`armorVariants`, chưa có ô cho đồ chủ tướng, và `UnitRank` chỉ tới `Elite`.
Nhận art về thì phải thêm ô đó + cho `CommandNode` gốc mặc — **việc CODE, làm sau khi có art**.

---

## 4e. ⚠⚠ ĐƠN HÀNG — **KIỂU NÓN/GIÁP THEO CẤP BẬC** (mở ngày 2026-09-02)

Cấp AI nay đọc bằng **KIỂU đồ trên người** (`UnitRankGear`): cấp 1 đầu trần, cấp 2 kiểu 1,
cấp 3 kiểu 2, cấp 4 kiểu 3, cấp 5 kiểu 4. Nhưng art hiện có **không đủ bậc**:

| Có sẵn | Cần | Thiếu |
|---|---|---|
| 3 kiểu NÓN mỗi nền | 4 | **15 tấm** (1 × 15 nền) |
| **1 kiểu GIÁP** mỗi nền | 4 | **45 tấm** (3 × 15 nền) |

Hậu quả đang thấy: cấp 2·3·4 chỉ khác nhau ở cái nón, giáp y hệt; **cấp 4 và cấp 5 nhìn không
phân biệt được**.

**Quy ước đặt tên** (builder quét theo tiền tố): nón `Helm_<Nền>_<Kiểu>.png`, giáp
`Armor_<Nền>_<Kiểu>.png`. Khổ giữ nguyên như bộ đang có — nón **256 × 256**, giáp **200 × 250**.

⚠ **BẬC PHẢI ĐỌC ĐƯỢC TỪ XA, VÀ ĐỌC THEO MỘT CHIỀU.** Đây không phải 4 kiểu ngang hàng như
`helmetVariants` cũ (vốn sinh ra để chống ĐỒNG PHỤC trong tiểu đội) — nay chúng xếp THÀNH
THANG. Người xem phải đọc được ngay "cái này cao cấp hơn cái kia" ở cỡ thật (nón ~44 px, giáp
~60 px), tức chỉ còn **ĐƯỜNG BAO** và **mảng màu lớn nhất**:

| Bậc | Nón | Giáp |
|---|---|---|
| kiểu 1 | chỏm trần, không vành, không mào | áo vải / da trơn, không tấm kim loại |
| kiểu 2 | thêm VÀNH hoặc đai quanh sọ | thêm tấm ngực |
| kiểu 3 | thêm che má / che gáy | thêm phiến vai |
| kiểu 4 | thêm MÀO đỉnh (bóng ngoài cao hẳn lên) | thêm váy giáp + phiến vai dày |

⚠ **CHỈ THÊM KHỐI, ĐỪNG ĐỔI HỌ DÁNG.** Bốn bậc vẫn phải đọc ra CÙNG MỘT NỀN VĂN MINH — đó là
trục vuông góc và nó phải giữ (xem mục 3d). Bậc là "nhiều đồ hơn", không phải "nền khác".

⚠ **ĐỪNG DÙNG MÀU ĐỂ NÓI BẬC.** Màu đã có hai chủ: màu phe (thanh máu) và **chất liệu theo
cấp NÂNG CẤP** (gỗ→đồng→sắt→thép→vàng). Bậc phải nói bằng ĐƯỜNG BAO.

⚠ Vẫn theo 6 ràng buộc ở mục 1, và luật vẽ nón ở mục 3 (vành · diềm gáy · vòm ≥ 96 px · dải
hẹp hơn vành · chừa MẶT).

## 5. KHIÊN — khổ **143 × 143**

- Vẽ **CHÍNH DIỆN mặt khiên** (mặt hướng về người xem).
- Bố cục **ĐỐI XỨNG QUANH TÂM** — đây là ngoại lệ thứ hai, vì khiên là đĩa tròn/giọt nước
  nhìn thẳng.
- Có **NÚM GIỮA (boss)** hoặc hoa văn tâm rõ ràng: đó là thứ phân biệt khiên với cái đĩa.
- Nền nào **không dùng khiên thì ĐỪNG vẽ** — thiếu file `Shield_*` chính là cách builder hiểu
  "nền này không có khiên" (Nhật, Hải tặc).

---

## 6. VẬT CƯỠI — **4 file mỗi loài**, và phải vẽ **THANG XÁM**

⚠⚠ **Luật quan trọng nhất: art vẽ TRẮNG/XÁM, KHÔNG tô màu lông.** `SpriteRenderer.color`
NHÂN vào sprite, nên art vẽ nâu sẵn thì tô gì cũng ra nâu × màu đó — mất hẳn hệ 4 màu lông
ngẫu nhiên mỗi con. Vẽ trắng thì tint chính là màu lông thật, phần tối (bụng · bờm · móng)
giữ nguyên TỈ LỆ.

| File | Khổ | Pivot | Ghi chú |
|---|---|---|---|
| `<Loài>_Body` | ~250 × 210 | **CHỖ YÊN** | KHÔNG vẽ chân |
| `<Loài>_Saddle` | ~64 × 30 | tâm | vẽ MÀU THẬT (yên không đổi màu theo lông) |
| `<Loài>_LegUpper` | ~40 × 68 | **ĐẦU TRÊN** | đùi |
| `<Loài>_LegLower` | ~36 × 70 | **ĐẦU TRÊN** | cẳng + móng/bàn |

Hai ràng buộc hình học, sai là móng lún xuống đất hoặc con vật lơ lửng:

```
BỤNG nằm dưới pivot đúng  W × (1 − legRatio) / bodyRatio  pixel
chân trước ở x = pivotX + 0.17 × W       chân sau ở x = pivotX − 0.15 × W
```

Bốn loài đang có + hai loài mới:

| Loài | Nền | legRatio | Nét BẮT BUỘC (thiếu là đọc ra con khác) |
|---|---|---|---|
| Ngựa | phần lớn | 0.55 | bờm + đuôi dài |
| Lạc đà | Ả Rập | 0.52 | **bướu** + cổ cong chữ S |
| Voi | Ấn Độ | 0.52 | **vòi + ngà + tai to** — thiếu một cái là ra lợn rừng khổng lồ |
| **Trâu nước** | **Đại Việt** | **0.42** | **sừng lưỡi liềm quặt ra sau** + **đầu mang THẤP hơn u vai** |
| **Gấu** | **Rus** | **0.44** | **bướu vai** (sống lưng dốc xuống về mông) + **tai tròn** + **mõm ngắn** + **KHÔNG đuôi** + bàn chân BỆT có vuốt |

⚠ Yên của trâu **không phải yên chiến** — Lạc Việt cưỡi trâu thì đó là con vật nhà nông đem
ra trận: một tấm chiếu/thảm buộc dây. Vẽ yên da kỵ binh là nói dối về nền văn hoá đó.

---

## 6b. PHÙ HIỆU CHỈ HUY — **2 tấm**, và phải vẽ **THANG XÁM**

Hai tấm này nói ra AI NÀO ĐANG CHỈ HUY, đọc từ cây chỉ huy lúc chạy (`UnitInsignia`).
Bản đang có trên đĩa là **art VẼ BÙ bằng code** — đủ đọc, chưa đẹp.

| File | Khổ | Pivot | Ai đeo |
|---|---|---|---|
| `Insignia_Banner.png` | 96 × 256 | **(0.18, 0.02)** — CHÂN CÁN | chủ tướng (gốc cây chỉ huy) |
| `Insignia_Plume.png` | 128 × 144 | **(0.61, 0.02)** — ĐÁY ĐẾ CẮM | tổ trưởng (chỉ huy một tổ) |

Thả vào `Assets/Sprites/Insignia/` rồi bấm
`Tools > Stickman > Nâng cao > AI > 10. Phù hiệu chỉ huy + quân hàm cấp AI`.

⚠⚠ **VẼ THANG XÁM (trắng / xám / viền đen), TUYỆT ĐỐI KHÔNG TÔ MÀU.** Runtime nhân màu phe
vào (`SpriteRenderer.color` ← `TeamMember.ColorOf`), nên vẽ sẵn màu là tô gì cũng ra màu đó
NHÂN màu phe — cùng luật với bộ lông ngựa ở mục 6.

⚠ **Cỡ hiển thị thật rất nhỏ**: cây cờ ~**89 px** cao trên màn hình, chùm ngù chỉ ~**28 px**.
Ở cỡ đó chỉ còn ĐƯỜNG BAO và mảng màu lớn nhất — hoa văn, chữ, sọc mảnh biến mất sạch. Kiểm
bằng cách thu ảnh về đúng hai con số đó rồi nhìn (đúng phép soi đã dùng cho bộ nón).

**Cờ lệnh** — cán dọc chạy suốt chiều cao, chuôi ở ĐỈNH, lá cờ chiếm ~60% phía trên, treo
bên **phải cán** (+X là hướng mặt nhân vật). Đuôi nheo nếu có thì phải **NÔNG**: đã thử khoét
sâu 26 px và cả hình đọc thành CÁI NƠ chứ không ra lá cờ.

**Ngù** — đế cắm nhỏ ở ĐÁY ảnh (nó ngồi trên vòm nón), chùm lông phình ở giữa rồi thu về
ngọn, **ngả về SAU (−X)**. Viền tối phải dày ≥ 4 px trên khổ 128: mỏng hơn là thu về 28 px
thì viền biến mất và cả chùm nhoè thành một vệt xám.

⚠ Đây là art nhìn NGANG như mọi thứ khác của dự án — **đối xứng trái–phải là dấu hiệu vẽ sai
góc nhìn** (xem lỗi khăn NEMES của Ai Cập).

## 6b-bis. ⚠⚠ ĐƠN HÀNG ĐANG MỞ — **VƯƠNG MIỆN + ÁO CHOÀNG CHỦ TƯỚNG** (mở 2026-09-17)

Hai tấm MỚI, cùng thư mục và cùng luật thang xám với mục 6b. Đây là thứ trả lời câu của user
*"tướng lĩnh phải có ngoại hình trang bị ấn tượng hơn lính thường"* — bản đang có trên đĩa là
**art VẼ BÙ bằng code** (`StickmanInsigniaBuilder.DrawCrown` / `.DrawCape`): đủ đọc, chưa đẹp.

| File | Khổ | Pivot | Nhuộm màu gì lúc chạy |
|---|---|---|---|
| `Insignia_Crown.png` | 128 × 88 | **(0.50, 0.07)** — GIỮA ĐÁY VÀNH | **VÀNG ở mọi phe** |
| `Insignia_Cape.png` | 176 × 208 | **(0.78, 0.90)** — KHOÁ VAI (góc trên-phải) | **màu phe** |

Thả vào `Assets/Sprites/Insignia/` rồi bấm
`Tools > Stickman > Nâng cao > AI > 10. Phù hiệu chỉ huy + quân hàm cấp AI`
(tool ĐO lại cỡ + chỗ đặt từ rig và bake vào `CommandInsigniaSet` — đừng gõ số tay).

⚠⚠ **VẪN VẼ THANG XÁM CẢ HAI**, dù vương miện sẽ ra màu vàng: runtime nhân màu vào, nên vẽ sẵn
vàng thì thành vàng × vàng, còn áo choàng vẽ sẵn vàng thì phe xanh ra màu rêu.

⚠ **CỠ HIỂN THỊ THẬT**: vương miện cao ~**26 px**, áo choàng dài ~**58 px** trên màn hình
(nhân vật cao ~110 px). Thu ảnh về đúng hai con số đó rồi nhìn — đó là phép kiểm duy nhất đáng tin.

**VƯƠNG MIỆN** — vành ngang dày ở ĐÁY ảnh (nó ngồi lên vòm nón / đỉnh đầu), **NĂM chóp** nhô
lên với nhịp thấp–cao–**cao nhất ở giữa**–cao–thấp, mỗi chóp một hạt ngọc tròn trên đỉnh.
Đã thử và LOẠI: ba chóp → đọc ra CÁI ĐINH BA; một khối trơn → đọc ra CÁI NÓN SẮT (mà lính cấp
cao cũng đội mũ trụ, nên mất sạch ý nghĩa). Bề ngang vành ≈ bằng đường kính đầu, đừng rộng hơn.

**ÁO CHOÀNG** — một tấm vải treo ở KHOÁ VAI (góc trên-phải) xoè về **SAU (−X)** và xuống dưới,
gấu áo viền dày, có 2–3 nếp gấp sẫm chạy dọc. Bề ngang phải xoè theo đường **hơi lõm ở vai**;
xoè thẳng ra tam giác cân thì đọc thành CÁI CÁNH hoặc lá cờ cầm tay.

⚠⚠ **TUYỆT ĐỐI KHÔNG VẼ CHỮ, HUY HIỆU, HOA VĂN CÓ HƯỚNG LÊN ÁO CHOÀNG.** Rig lật mặt nhân vật
bằng `localScale.x = -1`, nên mọi thứ treo trên xương đều SOI GƯƠNG khi nhân vật quay trái. Vải
trơn soi gương vẫn là vải trơn; một cái huy hiệu thì đọc ra ngay *"cờ bị lật"* — và đó đúng là
lý do CỜ LỆNH ở mục 6b bị khai tử ngày 2026-09-04. Nếp gấp dọc thì an toàn.

⚠ Nhìn NGANG như mọi thứ khác của dự án: áo choàng **không đối xứng** (nó chỉ xoè một phía);
vương miện thì đối xứng trái–phải là ĐÚNG, vì nó nhìn từ trước.

## 6c. CHI TIẾT CÔNG TRÌNH LẮP GHÉP theo nền — `Sprites/Structures/<CivKey>/Part_*.png`

Bộ lắp ghép (`StructureKit`, sân `Demo_40`) dựng tháp · nhà · tường · cổng · đình · thành · cây · đá
từ 67 chi tiết. Bản hiện có là VẼ BÙ bằng code; mỗi nền văn minh đặt riêng một bộ (hoặc chỉ mấy
tấm đáng nhất: thân tháp, tầng nhà, khối tường, cánh cổng, mái). Không có tấm nào thì phe đó dùng
tấm chung + nhuộm màu cờ — tức bộ này là TUỲ CHỌN, thiếu không hỏng gì.

Sáu ràng buộc CỨNG (lắp sai một cái là chi tiết lệch ô cắm):
1. **Khổ ảnh = cỡ world × 100** (bảng dưới). Sai khổ thì code vẫn scale cho vừa, nhưng art sẽ bị bóp.
2. **Pivot ĐÁY-GIỮA** (tool tự đặt) — chân ảnh là ô cắm VÀO, đỉnh ảnh là ô cắm RA.
3. Chi tiết CẮM CHỒNG (thân, tầng, khối tường, trụ) vẽ **KÍN hai mép trên/dưới**, không viền trong suốt.
4. Lan can / răng cưa là lớp TRƯỚC: **thưa ≥ 40 % trong suốt**, không thì che mất người đứng sau.
5. Nhìn NGANG, nền trong suốt, một chi tiết mỗi file, **không vẽ bóng đổ, không vẽ đất**.
6. Tên file **y hệt tên chung** (`Part_Tower_Trunk.png`…), đặt trong folder tên nền (`Europe`, `Japan`…).

| Tên file | Khổ | Vẽ gì |
|---|---|---|
| Part_Tower_Base / BaseTimber | 150×50 / 140×40 | đế loe |
| Part_Tower_Trunk · TrunkWindow · TrunkTimber · TrunkBrick · TrunkPlaster | 100×100 | một khúc thân, LẶP được |
| Part_Tower_Deck · DeckStone / DeckWide | 200×18 / 260×18 | sàn nhìn ngang, mặt đi ở đỉnh |
| Part_Rail_Wood · Rail_Iron | 200×105 | lan can, hai cột góc cao hết ảnh đỡ mái |
| Part_Rail_Stone | 200×60 | răng cưa thấp |
| Part_Roof_Cone · Dome · Spire · Flat | 220×100 · 220×90 · 160×130 · 200×40 | mái |
| Part_Deco_Banner · Torch · Shield · Lantern · Vines · Window | 35×70 · 22×45 · 40×50 · 24×40 · 60×80 · 40×50 | deco treo thân |
| Part_House_Base / Floor* / Roof* / Door* / Window / Chimney | 280×30 / 260×120 / 320×100 (Wood 320×80) / 60×90 / 40×45 / 30×60 | nhà |
| Part_Keep_Base · FloorStone · FloorBrick · RoofBattlement · RoofHall · Door | 360×40 · 340×130 · 340×130 · 360×60 · 380×110 · 90×120 | đình / nhà chính |
| Part_Wall_Block* · Walkway* · Crenel · CrenelTall | 120×90 · 120×15 · 120×40 · 120×55 | tường |
| Part_Gate_Pillar* · Lintel · LintelArch · Leaf* | 40×200 · 240×50 · 240×60 · 150×190 | cổng |
| Part_Tree_TrunkShort / TrunkTall · Canopy* · Bush | 36×60 / 36×90 · 160×140 (Pine 140×180, Willow 170×130, Bare 130×120) · 90×50 | cây (deco) |
| Part_Rock_Small · Big · Flat | 70×45 · 120×80 · 140×40 | đá (deco) |

Prompt mẫu (một tấm): *"Side-view 2D game sprite, transparent background, <mô tả nền §7>, a
single stone watchtower wall segment tile 100×100 px that tiles vertically (top and bottom edges
fully opaque and continuous), pixel-clean edges, no ground, no shadow, no characters."*

Nhận về: thả vào `Assets/Sprites/Structures/<CivKey>/`, bấm «Bộ chi tiết CÔNG TRÌNH lắp ghép» —
tool quét vào `civSprites`, không cần sửa bảng.

## 7. BẢNG NỀN VĂN MINH — đoạn mô tả để dán vào prompt

| Nền | Nón | Giáp | Khiên | Màu trội | Vũ khí đặc trưng |
|---|---|---|---|---|---|
| **Europe** | vòm thép có che mũi | giáp thép tấm | tam giác (heater) | thép + xanh lam | kiếm, thương, kích, nỏ |
| **Crusader** | mũ trụ KÍN mặt có khe | áo choàng trắng chữ thập đỏ | tam giác | trắng + đỏ | kiếm, chuỳ, nỏ |
| **Viking** | vòm sắt có sống mũi, **KHÔNG SỪNG** | áo xích + da | **TRÒN gỗ** có núm sắt | nâu gỗ + sắt xám | rìu, giáo, búa ném |
| **Japan** | **kabuto** có vành cong + sừng maedate | **giáp phiến buộc dây** đen–đỏ | *(không có)* | đen sơn mài + đỏ | katana, yari, naginata, cung yumi |
| **China** | vòm có chóp + diềm vải | **giáp đinh đỏ viền vàng** | tròn nhỏ | đỏ + vàng đồng | kích ji, thương, đao, nỏ liên châu |
| **Arab** | vòm thép **quấn khăn trắng**, che má | áo giáp xích nhẹ | **tròn đồng** | trắng + đồng vàng | scimitar, thương, cung tổng hợp |
| **DaiViet** | **nón chóp tre** rộng vành | **giáp vải** khâu chỉ | **mây đan** | vàng nâu tre + nâu | đại đao, giáo tre, kích, **nỏ** |
| **India** | **khăn xếp** có ghim ngọc | giáp vảy | **tròn dhal** có 4 núm | cam + vàng | talwar, khanda, chuỳ gada |
| **Mongol** | **chóp NÓN + vành lông thú nâu** | giáp lá da | tròn nhỏ | **NÂU lông** + thép | đao cong, thương, **cung kỵ xạ** |
| **Byzantine** | vòm thép + **sống vàng dọc đỉnh** + diềm lưới dài | giáp vảy | **bầu dục LỚN** | **VÀNG** + thép | giáo dài, tuyến khiên dày |
| **Ottoman** | **khăn xếp trắng có chóp thép** | giáp lá + xích | tròn | trắng + xanh lá | đao cong, nỏ, **súng hoả mai** |
| **Rus** | **chóp nhọn CAO nhất bộ** + màng lưới + che mũi | áo xích DÀI | **giọt nước** | thép + đỏ sẫm | rìu chiến, chuỳ, búa hai tay |
| **Persia** | vòm thấp + **chóp vàng có khía** + khăn quấn mảnh | giáp vảy | mây tròn | **lam ngọc** + vàng | trường cung, thương |
| **Pirate** | **khăn đỏ trùm sọ**, nút buộc + đuôi rủ về sau | *(không giáp nặng)* | *(không có)* | đỏ + da nâu | đao ngắn, song đao, rìu, hoả mai |
| **Egypt** | **khăn nemes sọc vàng–lam** + rắn uraeus | vải lanh trắng + **vòng cổ usekh** | **da bò đáy PHẲNG đỉnh vòm** | trắng + vàng + lam | **khopesh** (đao lưỡi liềm), chuỳ, cung |
| **Wei** (Ngụy) | vòm sắt + **ống cắm** + chùm lông LAM ngả sau, sống mũi | **lá sắt so le** trên vải lam | **bầu dục cao** viền sắt | lam + thép + đồng | nỏ cường, kích ji, thương, chuỳ |
| **Shu** (Thục) | vòm sắt + **cánh phượng vàng** chéo ra sau + tua đỏ | vải đỏ + **hộ tâm kính** tròn | mây đan tròn, tâm đỏ | đỏ + vàng | nỏ Gia Cát, Thanh Long đao, xà mâu, phóng lao |
| **Wu** (Ngô) | vòm **thấp bè** + **khăn vàng quấn** + nút thắt | **vảy cá** đen trên vải vàng | tròn vàng viền đen | vàng + đen | song đao, kích, hoả cầu, nỏ |
| **Sparta** | mũ **Corinth ĐỒNG** + **mào bờm ngựa NẰM NGANG** vắt qua đỉnh + sống mũi | **thorax đồng đúc hình cơ ngực**, váy tua đỏ | **tròn aspis đồng kín**, chữ **Λ** đen | **ĐỒNG** + đỏ thẫm | giáo dory, xiphos, **kopis** (cong về trước), lao |
| **Rome** (La Mã) | **galea sắt bát THẤP BÈ** + gờ gáy chìa sau + **mào vây ĐỨNG đỏ** trên ống cắm | **lorica segmentata** — đai sắt NGANG trên áo đỏ | **SCUTUM CHỮ NHẬT** đỏ + cánh vàng, núm sắt | sắt + đỏ + đồng thau | gladius, pilum, hasta, **scorpio** (nỏ giàn) |
| **Troy** | **mũ NANH LỢN RỪNG** xếp bốn dải + **đôi nanh vểnh ra trước** | vải lanh **TÍM** + **đai đồng bản rộng** + vòng xoáy đồng | **khiên SỐ 8** bọc da bò, **thắt eo** | **TÍM** + đồng + xương | giáo đồng, kiếm đồng, rìu, **cung sừng** |
| **Tribal** (Thổ dân) | mũ DA **thấp bè** + **QUẠT LÔNG CHIM** xoè lên-sau + mỏ xương + răng thú | áo da **vẽ chevron xương** + vòng cổ răng thú + tua cỏ, **KHÔNG kim loại** | **hình LÁ** nhọn hai đầu, bọc da, zigzag trắng | đất son + xương + cam | giáo xương, rìu đá, chuỳ đá, ná, **rìu ném** |

⚠ **Ba nền CỔ ĐẠI (2026-09-09) là chỗ dễ ra ba tấm giống nhau nhất bộ** — cùng thời, cùng
vùng Địa Trung Hải, cùng họ "vòm kim loại + khiên". Khi đặt hàng, nhấn vào **hướng của nét
thò ra**, vì đó là thứ duy nhất còn đọc được ở ~44 px: mào Sparta chạy **NGANG** (từ gáy ra
trước, cung thấp và dài) · mào Rome dựng **ĐỨNG** (tấm vây hẹp, cao) · nanh Troy vút **CHÉO
RA TRƯỚC**. Và giữ hai chất liệu riêng: **ĐỒNG** (Sparta · Troy — 18 nền kia đều thép xám)
và vải **TÍM** (chỉ Troy). Khiên scutum **phải là chữ nhật**; bo tròn nó là mất luôn bóng
ngoài không-tròn duy nhất của dự án.

---

## 8. NHẬN FILE VỀ — thả vào đâu, bấm nút nào

| Loại | Folder | Tên file | Tool phải bấm |
|---|---|---|---|
| Nón / giáp / khiên / skin vũ khí của một nền | `Assets/Sprites/Civilizations/<Key>/` | `Helm_<Key>.png` · `Armor_<Key>.png` · `Shield_<Key>.png` · `Weapon_<Loại>.png` | `Nâng cao > Civilizations > 2` |
| Vũ khí gốc (dùng chung) | `Assets/Sprites/` hoặc `Assets/Sprites/Weapons/` | đúng tên cũ | `Build > 1. Asset gốc` |
| Vật cưỡi | `Assets/Sprites/Weapons/` | `<Loài>_Body/Saddle/LegUpper/LegLower.png` | `Build > 1` |
| Tóc / trang trí đầu | `Assets/Sprites/Heads/Decos/` | tên gì cũng được | `Nâng cao > Appearance > 2` |
| Công trình (sheet nhiều vật một hàng) | `Assets/Art_Incoming/<Nền>.png` | tên bộ | `Nâng cao > Buildings > 2. Cắt sheet` |

⚠ **`Weapon_<Loại>` phải khớp ĐÚNG tên trong `enum WeaponType`** (Bow, Sword, Longbow, Saber,
Halberd...) — sai tên thì tool bỏ qua và chỉ log một dòng cảnh báo.

⚠ **Art sinh bằng code KHÔNG tự bị đè.** `GenerateMissing` cố ý bỏ qua file đã có (để không
xoá mất art thật). Thay art thật thì cứ thả đè lên; còn muốn tool VẼ LẠI bản code thì phải
XOÁ file `.png` trước (giữ `.meta` cho khỏi mất GUID).

⚠ **Cỡ và offset thì ĐỪNG gõ tay** — tool đo từ rig (`StickmanRigMetrics`). Việc của người
đưa art vào là đặt đúng folder, đúng tên, đúng khổ.

---

## 8b. NHẬN SHEET VŨ KHÍ — ba script, đừng cắt tay

`.claude/skills/stickman-assets/scripts/` có sẵn bộ nhận art:

```bash
python intake_sheet.py <sheet.png> <NềnVănMinh> <Loại1,Loại2,...>
python check_skins.py [NềnVănMinh ...]
```

`intake_sheet.py` cắt sheet theo **đảo pixel đặc** rồi làm bốn việc mà cắt tay chắc chắn sai:

| Bước | Vì sao |
|---|---|
| **Neo PIVOT vào chỗ nắm tay của cây GỐC** | đọc pivot cây gốc, quy ra % dọc phần vẽ được rồi áp lại. Gán 0.5 hay 0.2 cố định là vũ khí rời khỏi bàn tay — mỗi cây một khác (rìu 0.2195, kiếm 0.2062) |
| **XOAY khớp TRỤC LƯỠI của cây gốc** | `WeaponHoldPose.weaponAngle` trên prefab được chỉnh theo tấm art GỐC. Súng lục gốc vẽ **chếch 33.7°**; ChatGPT vẽ nằm ngang ⇒ trong tay chĩa lệch 23°. Skin chỉ được đổi HÌNH, không được đổi HƯỚNG |
| **KÉO CÁN cho khớp tỉ lệ** (`stretch.py`) | bộ sinh ảnh của ChatGPT luôn **lấp đầy khung** nên cây nào cũng ~1:1 — giáo ra 1.26:1 trong khi cần 16:1, đọc ra cái chày. Tìm **đoạn cột giống nhau dài nhất** (khúc cán trơn) rồi nhân bản cột đó |
| **Ghi `.meta` GUID riêng** | chép phần còn lại từ `.meta` của cây gốc nên PPU/filter/compression đồng bộ |

⚠ **Ba trần đã chốt bằng đo, đừng nới bừa:**
· `MAX_STRETCH 1.6` / `MAX_STRETCH_POLE 2.2` — ép ĐÚNG tỉ lệ gốc thì cán dài ra nhưng ở
  cỡ ~40 px cái **ĐẦU teo mất** (bảng tỉ lệ gốc vốn viết cho art code-gen vốn đầu nhỏ);
· xoay chỉ khi lệch **8°–40°** — quá 40° gần như chắc chắn là đo sai (đầu vũ khí bè ngang
  kéo trục đi), xoay theo là hỏng hẳn (lựu đạn từng đòi xoay 97°);
· **KHÔNG kéo cán cây vẽ chéo** — `stretch` chèn thêm CỘT dọc, cây nằm chéo bị chèn là thân
  đứt làm đôi và pivot văng ra ngoài hình (đo được: pivot 22% → −3%).

`check_skins.py` là lưới bắt cuối, đo ba thứ **không cần mở Unity**: pivot nằm ở đâu dọc thân ·
góc từ pivot tới điểm xa nhất · trục chính (PCA) của khối pixel. Vật gần TRÒN (lựu đạn, bom,
ná) được bỏ qua vế góc — đo góc của một quả cầu là vô nghĩa, chính cây GỐC cũng ra 73.9°.
⚠ Cảnh báo *MŨI-LỆCH* mà *TRỤC* vẫn ≈0 thì là **BÁO GIẢ**: lưỡi rìu ChatGPT xoè xuống còn bản
gốc xoè lên, cán vẫn ngang. Nhìn cột TRỤC trước, cột MŨI sau.

---

## 8a. CUNG THEO CẤP — khuôn DỌC, và **TUYỆT ĐỐI KHÔNG VẼ DÂY**

Cung vẽ DỌC (Bow 164×710, Longbow 104×404) nên KHÔNG dùng `hand_template_6.png`.

```bash
python .claude/skills/stickman-assets/scripts/bow_template.py     # -> bow_template_6.png
```

Khuôn `1020×736`, **6 ô xếp NGANG** (cung cao và hẹp), mỗi ô có: **chấm hồng ĐẶC** ở 72% bề
ngang = bụng cung = chỗ tay nắm · **vạch hồng MỜ** ở 26% = chỗ sợi dây sẽ chạy.

⚠⚠ **SỢI DÂY LÀ `LineRenderer` CỦA UNITY, KHÔNG PHẢI ART** (`BowString`, dời bởi
`RangedWeapon.SetBowStringPoint` để làm hiệu ứng kéo căng). Vẽ dây vào PNG là trong game có
**HAI sợi**: sợi trong ảnh đứng im, sợi thật kéo ra sau. Prompt PHẢI ghi rõ: *chỉ vẽ thân cung
và hai đầu cánh, giữa hai đầu cánh TRONG SUỐT hoàn toàn* — vẽ rãnh/khấc mắc dây thì được.
Đã đặt nhầm một lần và phải vẽ lại cả 12 tấm.

⚠ Luật thứ hai, dễ phạm không kém: **BỤNG cung ở +X (đè lên chấm hồng, bên PHẢI), hai đầu
cánh và dây ở −X**. Vẽ ngược là sợi dây chắn giữa cung và mục tiêu.

```bash
python .claude/skills/stickman-assets/scripts/intake_bow.py <sheet.png> Bow
```

Intake **tự kiểm cả hai luật** và réo tên cấp nào phạm: `!! LẬP NGƯỢC` (so tâm hàng giữa thân
với tâm hàng hai đầu cánh) và `!! CÓ DÂY VẼ SẴN` kèm tỉ lệ % (ở khúc giữa thân, cung không dây
chỉ có MỘT khối; có dây thì thêm một vệt mỏng bên trái cách biệt khối thân).

---

## 8b. GIÁP NGỰA THEO CẤP (vật cưỡi) — khuôn BÓNG HỒNG

Cấp của vật cưỡi **là giáp ngựa**, không phải con ngựa khác (`AGENTS.md` mục *7b-thang05-cuoi*).
Năm loài: `Horse` · `Camel` · `Elephant` · `Buffalo` · `Bear`. **Cấp 0 = ngựa TRẦN, không đặt art.**

**Bước 1 — sinh khuôn** (chạy một lần cho mỗi loài):

```bash
python .claude/skills/stickman-assets/scripts/barding_template.py Horse
```

Ra `barding_template_Horse.png`: 5 ô dọc, mỗi ô là **BÓNG HỒNG (#FF00FF) của chính
`Horse_Body.png`** phóng to lên rộng 1024.

⚠⚠ **VÌ SAO PHẢI CÓ BÓNG:** `StickmanHorse.SetBarding` co tấm giáp bằng `rộngThân / rộngGiáp`
rồi treo vào ĐÚNG PIVOT của thân. Nghĩa là tấm giáp phải **cùng tỉ lệ khung và cùng pivot** với
`<loài>_Body.png`. Vẽ tự do rồi căn bằng mắt thì không bao giờ khớp — miếng giáp lệch khỏi lưng
con vật mà **không có lỗi nào báo** (nó vẫn hiện ra, chỉ là đeo sai chỗ).

**Bước 2 — prompt** (gửi kèm file khuôn):

> Vẽ giúp tôi 1 file PNG duy nhất, ĐÚNG khổ của cái khuôn tôi vừa gửi, nền HOÀN TOÀN TRONG
> SUỐT (alpha).
>
> KHUÔN: 5 ô xếp DỌC, mỗi ô có một BÓNG MÀU HỒNG CÁNH SEN — đó là hình con NGỰA nhìn ngang
> (quay phải). Bóng đó chỉ để canh chỗ, tôi sẽ xoá nó đi.
>
> VIỆC: vẽ **GIÁP NGỰA / ÁO CHOÀNG CHIẾN (barding, caparison)** ĐÈ LÊN bóng hồng đó, 5 cấp:
> · Cấp 1: tấm vải trơn phủ lưng, buông xuống hai bên sườn.
> · Cấp 2: vải có viền + huy hiệu, thêm tấm da che ngực.
> · Cấp 3: thêm CHE MẶT bằng thép (chanfron) + vảy thép trên vải.
> · Cấp 4: che mặt có chóp, giáp phiến che cổ và sườn, vải thêu.
> · Cấp 5: giáp bản đầy đủ — che mặt, che cổ, che sườn, che mông; kim loại sáng có hoa văn vàng.
>
> BỐN LUẬT: (1) chỉ vẽ TẤM GIÁP, **KHÔNG vẽ con ngựa, không vẽ chân, không vẽ kỵ sĩ, không vẽ
> yên** — chỗ nào không có giáp thì để TRONG SUỐT; (2) giáp phải nằm ĐÚNG trên bóng hồng, đừng
> xê dịch, đừng phóng to thu nhỏ; (3) nền trong suốt thật, KHÔNG ô caro, KHÔNG voan mờ; (4) cấp
> càng cao thì che càng KÍN — đó là thứ duy nhất đọc được ở cỡ thật.

**Bước 3 — nhận về:**

```bash
python .claude/skills/stickman-assets/scripts/intake_barding.py <sheet.png> Horse
```

Nó xoá hồng → thu nhỏ về đúng khung `<loài>_Body.png` → chép PIVOT của thân → đóng nhãn
`stickman:hand`. **KHÔNG trim, KHÔNG căn giữa** — vị trí trong khung chính là thông tin.

Rồi bấm **★ Bảng điều khiển → ★ 15 nền văn minh — art theo CẤP + asset**. Thiếu cấp nào thì
Console réo tên cấp đó (`LoadBarding`) — nó hỏng theo kiểu khó thấy nhất: ngựa ở cấp thiếu art
chỉ đơn giản là TRẦN, vẫn chạy vẫn đánh.

---

## 9. BỐN THỨ KHÔNG NHỜ ChatGPT

| Thứ | Vì sao |
|---|---|
| Hình cần **LẶP LIỀN MẠCH** (mặt cỏ, nền trời) | AI vẽ ra là hở mạch ở chỗ nối |
| Hình cần **MÀU KHỚP TUYỆT ĐỐI** với thứ khác | lệch một sắc là lộ đường ghép |
| **Sprite của RIG** (thân, tay, chân stickman) | bắt buộc đúng SỐ BONE + THỨ TỰ, sai là vỡ rig |
| **HẠT** (lửa, sao, tàn, khói) | nó là `ParticleSystem`, không phải một tấm ảnh |

Và **âm thanh thì nhờ Gemini**, không nhờ ChatGPT: xin **WAV mono 44.1 kHz, 0.2–1.5 s, KHÔNG
fade đầu, KHÔNG nhạc nền, KHÔNG khoảng lặng đầu/cuối**. Nhận về thì đo bằng
`.claude/skills/stickman-assets/scripts/sfx.py` (`report()`), thả vào `Assets/Sounds/SFX/`,
nối một dòng vào bảng `StickmanAudioBuilder.Library`, rồi bấm `Nâng cao > Audio > 2`.
⚠ Quên nối bảng thì cây đó **câm lặng, không có lỗi nào báo**.

> Tình trạng hiện tại (đo ngày rà soát): **86 file trên đĩa, phủ đủ 68 mục trong bảng — không
> thiếu tiếng nào.** Chưa cần nhờ Gemini cho tới khi thêm vũ khí/cơ chế mới.


### 6c-bis. Chi tiết V3 (2026-09-05) — đình lên nóc · rào cọc · trại lính · phế tích

Cùng luật §6c (PNG nền trong suốt, pivot ĐÁY-GIỮA, khổ = cỡ world × 100, nhìn ngang, không nhân vật).

| Tên file | Khổ (px) | Mô tả |
|---|---|---|
| `Part_Keep_Door` | 90×120 | CỬA VÒM MỞ SẴN của đình: khung đá sáng, lòng cửa tối, **bậc thang đá đi lên về phía sau** nhìn thấy bên trong, ánh đuốc mờ — phải đọc ra "vào đây là lên nóc" |
| `Part_Keep_Deck` | 340×18 | sàn nóc đá, mặt đi ở ĐỈNH ảnh, kín hai mép |
| `Part_Wall_BlockPalisade` | 100×100 | khối rào cọc gỗ dọc, hai thanh ngang buộc, kín trên/dưới (cắm chồng) |
| `Part_Wall_CrenelStakes` | 120×40 | 4 cọc nhọn thưa (≥ 40% trong suốt), lớp foreground |
| `Part_Camp_TentSmall` / `_TentLarge` | 140×90 / 200×120 | lều vải tam giác / lều lớn có sào nóc, **vẽ SÁNG** (sẽ nhuộm màu cờ phe), cửa lều tối |
| `Part_Camp_Fire` | 50×45 | vòng đá + củi + ngọn lửa tĩnh (deco) |
| `Part_Prop_Barrels` · `_Crates` · `_Cart` · `_Hay` · `_Well` · `_Rack` | 80×60 · 80×70 · 140×90 · 100×70 · 90×100 · 90×90 | thùng đai sắt · hòm chồng · xe kéo hai bánh chở hàng · đống cỏ khô · giếng có mái · giá cắm giáo |
| `Part_Ruin_StubLow` / `_StubHigh` | 120×60 / 100×140 | mảng tường gãy, mép trên răng cưa vỡ, bản cao có lỗ thủng |
| `Part_Ruin_Arch` | 160×150 | vòm đá gãy một bên |
| `Part_Ruin_Pillar` · `_Rubble` | 40×120 · 130×45 | trụ gãy chéo · đá vụn sát đất |


### 6c-ter. Chi tiết HIỆN ĐẠI + LÔ CỐT + CỔNG SẬP (2026-09-05)

Cùng luật §6c (PNG nền trong suốt, **pivot ĐÁY-GIỮA**, khổ = cỡ world × 100, nhìn NGANG, không
vẽ nhân vật/đất/bóng đổ). Thả vào `Assets/Sprites/Structures/` (bộ chung; thư mục con `<CivKey>/` là bản riêng của nền) rồi bấm
*Bộ chi tiết CÔNG TRÌNH lắp ghép*.

⚠ **BẢNG MÀU HIỆN ĐẠI**: bê tông xám ngả vàng (`#9E9E99`) · thép lạnh (`#858C94`) · gỉ sét
(`#824D2E`) · cát bao (`#B3A170`) · ô-liu quân đội (`#6B7050`). **Không dùng gỗ/đá** — đó là
dấu hiệu nhận dạng của bộ trung cổ, lẫn vào là hai thời kỳ nhìn như một.
⚠ **Ở cỡ thật (~40–110 px) chỉ còn ĐƯỜNG BAO và MẢNG MÀU LỚN NHẤT** — vết ố bê tông, đinh tán,
vân thép đều biến mất. Thứ phân biệt trung cổ ↔ hiện đại phải là **cạnh THẲNG + góc VUÔNG +
mảng phẳng lớn**, đối lập với khối đá lởm chởm và mái dốc của bộ trung cổ.

| Tên file | Khổ (px) | Mô tả |
|---|---|---|
| `Part_Tower_TrunkConcrete` | 100×100 | khối thân bê tông vuông, một ô cửa sổ kính tối giữa, mạch đổ ngang, **kín trên/dưới** (cắm chồng) |
| `Part_Tower_TrunkVent` | 100×100 | cùng khối, thay cửa sổ bằng **3 khe thông gió lá sách** thép |
| `Part_Tower_DeckSteel` | 220×18 | sàn thép tấm, mặt đi ở ĐỈNH ảnh, dầm chữ I nhô xuống đều |
| `Part_Rail_Mesh` | 220×105 | lan can **LƯỚI THÉP** (foreground, ≥ 45% trong suốt), hai cột góc, thanh ngang trên/giữa |
| `Part_Roof_Antenna` | 90×140 | cột ăng-ten giàn thép chữ X + đèn báo đỏ trên chóp |
| `Part_Deco_Floodlight` | 60×130 | cột đèn pha nghiêng, chụp thép, quầng sáng nhạt |
| `Part_House_FloorConcrete` | 240×110 | tầng nhà bê tông, **3 cửa sổ kính lớn** khung thép chia ô, kín hai mép |
| `Part_House_RoofConcrete` | 260×40 | mái BẰNG bê tông, gờ chắn mái, ống thoát nước rủ |
| `Part_House_DoorShutter` | 90×100 | **cửa cuốn** kim loại kẻ sọc ngang, khung dày |
| `Part_Wall_BlockConcrete` | 100×100 | khối tường bê tông đúc, một mạch dọc giữa, kín trên/dưới |
| `Part_Wall_Razor` | 120×35 | **dây thép gai** cuộn tròn trên thanh đỡ (foreground, ≥ 55% trong suốt) |
| `Part_Wall_WalkwaySteel` | 100×18 | lối đi thép rãnh chống trượt, mặt đi ở ĐỈNH |
| `Part_Gate_LeafSteel` | 150×190 | cánh cổng thép hộp, hai thanh giằng chéo, bản lề đinh tán — mặt phẳng, không hoa văn |
| `Part_Gate_PillarConcrete` | 40×220 | trụ cổng bê tông, đai ngang đều |
| `Part_Camp_TentField` | 200×110 | lều dã chiến mái vòm, sọc vải, cửa tối — **vẽ SÁNG** (sẽ nhuộm màu cờ phe) |
| `Part_Prop_Sandbags` | 120×50 | ba hàng bao cát so le, mép trên gợn tròn |
| `Part_Prop_Container` | 220×110 | thùng container sóng dọc, cửa hai cánh một đầu, gỉ sét loang |
| `Part_Deco_Streetlamp` | 50×220 | cột đèn đường cong, chụp đèn, bóng sáng ấm |
| `Part_Bunker_Base` | 280×30 | bệ bê tông loe, mép trên sáng |
| `Part_Bunker_Body` | 260×85 | thân lô cốt **thành nghiêng vào trong**, một **KHE BẮN** ngang dài tối om giữa |
| `Part_Bunker_Deck` | 300×18 | nóc bê tông dày, mặt đi ở ĐỈNH, gờ chống trượt |

⚠ **Hai ô của lô cốt DÙNG LẠI tranh khác, đừng đặt vẽ riêng**: ụ chắn nóc dùng `Part_Prop_Sandbags`, cửa dùng `Part_House_DoorShutter`. Đặt thêm một tấm trùng vai là hai tấm phải nhớ sửa cùng nhau.

**Và một tấm cho CỔNG SẬP** (bộ công trình, không phải chi tiết lắp ghép) — thả vào
`Assets/Sprites/Buildings/Default/`:

| Tên file | Khổ (px) | Mô tả |
|---|---|---|
| `Gate_Ruined` | 400×170 | **đống đổ nát của cánh cổng**: hai chân trụ còn sót gãy nham nhở, dầm ngang gãy đôi nằm chéo, ván/thanh thép vụn, đá vụn phủ chân. Thấp và BÈ NGANG — nó phải đọc ra "cổng vỡ rồi, đi qua được", tuyệt đối không được cao bằng cổng lành |

## 10. BỐN LỰC LƯỢNG HIỆN ĐẠI — nón · giáp · khiên · mặt (2026-09-05)

Cùng luật khổ của nón (§3, 256×256, nhìn NGANG, vành ôm đầu 1.40×) · giáp (§4, 200×250) ·
khiên (§5) · mặt/kính (§ trang trí đầu, 96×104). Thả vào `Assets/Sprites/Civilizations/<Key>/`
với `Key` = `Police` · `Army` · `Robbers` · `Terrorist`, tên file `Helm_<Key>` · `Armor_<Key>` ·
`Shield_Police` · `Deco_<Key>_*`, rồi bấm *★ 15 nền văn minh* (tool dựng luôn bốn lực lượng).

⚠ **Ở cỡ thật chỉ còn ĐƯỜNG BAO và MẢNG MÀU LỚN NHẤT** — bốn lực lượng phải khác nhau ở KHỐI:

| Lực lượng | Nón | Giáp | Khác |
|---|---|---|---|
| Cảnh sát (`Police`) | **mũ bảo hiểm chống bạo động** tròn có TẤM KÍNH che mặt (kính trong, hở mặt) — xanh dương đậm `#2F5FA8`, sọc trắng | áo giáp chống đạn xanh navy, dải trắng "POLICE" ngang ngực, túi trước | **khiên chống bạo động** chữ nhật TRONG SUỐT (`Shield_Police`, ≥40% trong, viền đen, ô nhìn); kính râm (`Deco`) |
| Quân đội (`Army`) | **mũ sắt kevlar** lùm ô-liu `#5E6B45`, có lưới nguỵ trang, quai cằm | giáp chiến thuật ô-liu, nhiều túi, đai đạn chéo | băng đội đầu / kính đêm (`Deco`) |
| Cướp (`Robbers`) | **mũ len trùm** (balaclava) đen `#1F1F24` chỉ hở HAI MẮT, hoặc mũ lưỡi trai ngược | áo hoodie/áo khoác da tím sẫm `#6B2F5F`, KHÔNG giáp | khăn bịt mặt, mặt nạ hề (`Deco`) |
| Khủng bố (`Terrorist`) | **khăn trùm đầu kiểu shemagh** đỏ sẫm `#9C2A24` quấn kín, đuôi rủ về SAU (−X) | áo gi-lê đạn nâu bụi `#6E5236` trên áo dài, băng đạn chéo | băng đỏ quấn đầu (`Deco`) |

Nền TRONG SUỐT · nhìn NGANG quay +X · KHÔNG vẽ nhân vật/đất/bóng · cả bộ chung một khổ và tỉ lệ.

## 11. VẬT CHE GAME BẮN SÚNG — `Sprites/Buildings/Modern/Prop_*.png`

Bảng màu §6c-ter (bê tông `#9E9E99` · thép `#858C94` · gỉ `#824D2E` · cát `#B3A170` · ô-liu
`#6B7050`). PNG nền trong suốt, **pivot GIỮA**, nhìn NGANG, không nhân vật/đất/bóng. Thả vào
`Assets/Sprites/Buildings/Modern/` là tool chừa ra (nhãn nguồn art), bấm *★ Vẽ bù art* để kiểm đủ.

| Tên file | Khổ (px) | Là gì |
|---|---|---|
| `Prop_Sandbag` | 160×90 | tường bao cát xếp 3 lớp, mép trên gợn |
| `Prop_Jersey` | 180×110 | rào bê tông hình thang (jersey barrier), sọc phản quang |
| `Prop_Container` | 520×260 | container vận tải gân dọc, hai cửa có then, cỡ đúng 5.2 × 1.6 world |
| `Prop_Crate` | 120×110 | thùng gỗ đóng đinh |
| `Prop_Barrel` | 80×120 | thùng phuy thép hai đai |
| `Prop_Car` | 420×160 | xe con nhìn ngang (bánh, kính), cửa hé |
| `Prop_BombSite` | 120×90 | bảng sơn "A/B" + thùng gỗ chồng — điểm đặt bom |
| `Prop_AmmoCrate` | 200×80 | thùng đạn quân dụng xanh ô-liu, nắp hé thấy băng đạn |
| `Prop_Wire` | 240×70 | hàng rào dây thép gai trên cọc, ≥55% trong suốt |
| `Prop_Catwalk` | 400×40 | lối đi thép rãnh, mặt đi ở ĐỈNH ảnh |


### 6c-quater. Chi tiết V5 + BỐI CẢNH theo thời kỳ + HẠT THỜI TIẾT (2026-09-05)

#### A. 21 chi tiết công trình — thả vào `Assets/Sprites/Structures/`

Cùng luật §6c (nền trong suốt, **pivot ĐÁY-GIỮA**, khổ = cỡ world × 100, nhìn NGANG, không vẽ
nhân vật/đất/bóng đổ), rồi bấm *Bộ chi tiết CÔNG TRÌNH lắp ghép*.

| Tên file | Khổ (px) | Mô tả |
|---|---|---|
| `Part_Prop_Anvil` | 70×50 | đe rèn trên gốc gỗ, **sừng đe nhô một bên** (thứ làm nó đọc ra "đe" chứ không ra "cục đá") |
| `Part_Prop_Stall` | 160×110 | sạp chợ: bốn cọc, mặt bàn có hàng, **mái vải sọc vẽ SÁNG** (sẽ nhuộm màu nền) |
| `Part_Prop_Sacks` | 90×56 | ba bao vải xếp chồng, cổ bao buộc dây |
| `Part_Prop_Logs` | 110×50 | khúc gỗ xếp kim tự tháp, vân tròn ở đầu khúc |
| `Part_Ruin_Statue` | 70×150 | tượng đá **GÃY, KHÔNG ĐẦU** — mặt gãy lởm chởm; đó mới là thứ nói "phế tích" |
| `Part_Prop_Dumpster` | 130×80 | thùng rác thép có nắp nghiêng + hai bánh nhỏ, gỉ loang |
| `Part_Prop_Pallet` | 110×60 | ba tấm pallet gỗ xếp chồng, khe hở đọc rõ |
| `Part_Prop_Generator` | 100×75 | máy phát: lưới tản nhiệt, bảng điều khiển, ống xả cong |
| `Part_Prop_Cone` | 34×46 | cọc tiêu cam có vạch phản quang trắng |
| `Part_Deco_Ivy` | 50×90 | dây leo rủ — **lớp TIỀN CẢNH nên phải THƯA (≥45% trong suốt)**, không thì thành mảng xanh che mất công trình |
| `Part_Deco_Sign` | 60×50 | biển gỗ treo trên tay sắt (nhuộm theo nền) |
| `Part_Deco_AC` | 46×40 | cục nóng máy lạnh có quạt tròn, treo trên giá |
| `Part_Roof_Thatch` | 230×70 | mái rạ hình nón, **mép dưới lởm chởm**, chóp buộc dây |
| `Part_Wall_BlockTimber` | 100×100 | tường khung gỗ (half-timbered): vữa trắng + dầm chéo, **kín trên/dưới** để cắm chồng |
| `Part_Wall_Chainlink` | 120×55 | rào lưới B40 — tiền cảnh, phải nhìn xuyên qua được |
| `Part_Farm_Fence` / `_FenceWire` | 160×55 | rào ruộng: gỗ ba cọc hai thanh / thép ba dây — **cùng khối, khác chất** |
| `Part_Farm_Crop` | 120×50 | luống lúa: gò đất + hàng cây thưa đều; ở cỡ thật chỉ còn NHỊP đứng của thân |
| `Part_Farm_Drum` | 60×80 | thùng phuy hai đai, vệt gỉ dọc |
| `Part_Farm_Scarecrow` | 70×140 | bù nhìn: cọc chữ thập, áo rơm **vẽ SÁNG**, đầu bao tải đội mũ |
| `Part_Farm_Post` | 40×130 | cột thép + biển tam giác cảnh báo (bản hiện đại của bù nhìn) |

#### B. Bối cảnh + hạt — thả vào `Assets/Sprites/Environment/`

⚠⚠ **CẢ CHÍN TẤM PHẢI VẼ THANG XÁM (TRẮNG).** Màu thật do code tint lúc chạy: chân trời lấy
màu của `MapTheme`, hạt lấy `startColor` của ParticleSystem. Vẽ sẵn màu vào art là mọi map ra
cùng một tông, và một tấm không dùng lại được cho mưa lạnh lẫn tro nóng.

| Tên file | Khổ (px) | Mô tả |
|---|---|---|
| `Hill_Far_City` | 512×256 | chân trời thành phố XA: khối nhà đều, thấp, không ăng-ten. **LẶP LIỀN MẠCH theo X** — bề rộng khối phải chia hết bề rộng ảnh |
| `Hill_Near_City` | 512×256 | thành phố GẦN: khối cao thấp rõ hơn, **cửa sổ khoét thành lỗ**, vài ăng-ten trên nóc |
| `Hill_Far_Spire` | 512×256 | cột đá fantasy XA: nền THẤP và PHẲNG, 6–8 cột nhọn cao vừa |
| `Hill_Near_Spire` | 512×256 | cột đá GẦN: 4–6 cột cao hơn hẳn, mỗi cột kèm một cột phụ nép bên |
| `Rain` | 12×64 | giọt mưa: vệt dọc **thon về HAI đầu**, pivot giữa |
| `Snow` | 32×32 | bông tuyết: đĩa mềm + sáu tia mờ |
| `Leaf` | 40×28 | lá: hình thoi có **gân giữa đậm** (thứ duy nhất còn đọc được ở cỡ thật), vẽ ĐỨNG — particle tự xoay |
| `Haze` | 128×128 | mảng sương: đĩa RẤT mềm, mép tan hẳn, alpha đỉnh ~40% |
| `Dust` | 16×16 | hạt bụi: chấm mờ có quầng |

⚠ Bốn tấm chân trời phải **TILEABLE theo chiều ngang** — kiểm bằng cách so cột trái với cột
phải, lệch > 8/255 là hở mạch và trong game sẽ thấy một đường dọc chạy giữa trời.
⚠ Pivot bốn tấm chân trời là **MÉP DƯỚI GIỮA** (cắm đúng chân trời rồi cho dâng lên); năm tấm
hạt là **TÂM**.

## §6c-quinquies — 32 tấm V5: NHÀ THEO VAI + MỎ (2026-09-06)

Thả PNG cùng tên vào `Assets/Sprites/Structures/`. **PPU 100, pivot ĐÁY-GIỮA, khổ ảnh = cỡ
world × 100** (ghi sẵn dưới). Tấm nào có sẵn thì code chừa ra vĩnh viễn (`StickmanArtSource`).

⚠ **TẦNG NHÀ bị KÉO NGANG theo vai** (nhà lính ×1.45, kho lương ×0.72). Hoa văn phải là NHỊP
LẶP theo chiều ngang, **không** phải một hình vẽ căn giữa — kéo ngang một cái cửa vẽ giữa tấm
là ra cái cửa méo.
⚠ **Cửa ra vào cắm ở x = 0.** Nét nhận dạng của tầng nhà phải LỆCH khỏi giữa, không thì cánh
cửa đè lên (đúng lỗi đã mắc với miệng lò rèn).
⚠ Lan can là lớp TRƯỚC: vẽ thưa, ≥ 40 % trong suốt.

### Nhà theo vai (22 tấm)

| Tệp | px | Nội dung |
|---|---|---|
| `Part_House_FloorBarracks` | 260×115 | NHÀ LÍNH: vách gỗ ngang, DÃY cửa sổ nhỏ đều nhau, chân đá |
| `Part_House_RoofBarracks` | 320×85 | mái dốc THOẢI và dài (nhà bè mái phải thấp) |
| `Part_House_FloorBunkhouse` | 260×115 | nhà lính hiện đại: tôn gân ĐỨNG, dải sơn, cửa sổ băng |
| `Part_House_RoofCorrugated` | 300×45 | mái tôn gần phẳng + máng nước |
| `Part_House_FloorForge` | 260×120 | LÒ RÈN: vách đá, MIỆNG LÒ đỏ lửa **lệch trái**, bễ thổi bên phải |
| `Part_House_FloorGranary` | 260×125 | KHO LƯƠNG: ván ĐỨNG hở khe, hai đai ngang, không cửa sổ |
| `Part_House_RoofCone` | 310×115 | mái nón rạ |
| `Part_House_FloorSilo` | 260×135 | silo: tôn múi + đai bu-lông + thang sắt bên hông |
| `Part_House_RoofSiloCap` | 280×70 | chóp vòm + ống thoát khí |
| `Part_House_FloorShrine` | 260×150 | ĐỀN: hàng CỘT ĐÁ, lòng đền tối, bậc thềm |
| `Part_House_RoofPagoda` | 360×115 | mái hai tầng, đầu đao cong hếch |
| `Part_House_DecoBell` | 40×50 | chuông treo giá gỗ (nhuộm theo cờ) |
| `Part_House_FloorShop` | 260×115 | QUÁN: mặt trước MỞ, quầy gỗ, hàng bày, trong tối |
| `Part_House_RoofAwning` | 320×60 | mái hiên SỌC mép lượn (nhuộm cờ ⇒ vẽ trắng–xám) |
| `Part_House_FloorStorefront` | 260×120 | cửa hiệu: kính chia ô, biển hiệu |
| `Part_House_FloorWatch` | 260×130 | TRẠM GÁC: bốn cột + giằng chéo, hở giữa |
| `Part_House_DeckWatch` | 220×18 | sàn ván (mặt đi ở ĐÚNG đỉnh ảnh) |
| `Part_House_RailWatch` | 230×50 | lan can thưa |
| `Part_House_RoofWatch` | 280×135 | LỌNG: **bốn cột cao 95 px** rồi mới tới mái |
| `Part_House_FloorStable` | 260×105 | CHUỒNG NGỰA: ba ô cửa nửa thân, trong tối |
| `Part_House_RoofLean` | 310×65 | mái MỘT DỐC |
| `Part_House_FloorGarage` | 260×120 | nhà xe: cửa cuốn tôn, vạch sơn |

⚠ `Part_House_RoofWatch` **cao 135 px chứ không phải 70**: chiều cao đầu (0.73) phải nằm TRONG
chính tấm art. Bản đầu vẽ mái 70 px rồi để văn phạm nhấc lên 1.05 — ở cỡ thật nó là một cái mái
BAY LƠ LỬNG không có gì đỡ.

### Mỏ (10 tấm)

| Tệp | px | Nội dung |
|---|---|---|
| `Part_Mine_AditStone` | 220×160 | vách đá + miệng hầm ĐEN HẲN, cột chống gỗ, xà đỡ |
| `Part_Mine_AditConcrete` | 220×160 | cổng bê tông + song sắt + vạch cảnh báo |
| `Part_Mine_FrameWood` | 160×240 | giàn tời gỗ: hai chân choãi + giằng + BÁNH RÒNG RỌC |
| `Part_Mine_FrameSteel` | 160×280 | giàn tời thép, giằng dày hơn |
| `Part_Mine_Deck` | 220×18 | sàn thép mắt cáo |
| `Part_Mine_RailDeck` | 230×45 | lan can ống thép, thưa |
| `Part_Mine_Cart` | 90×65 | xe goòng gỉ, quặng nhô miệng thùng |
| `Part_Mine_Rail` | 180×12 | tà vẹt + hai thanh ray (nằm bẹp dưới chân) |
| `Part_Mine_Spoil` | 130×60 | gò quặng thải |
| `Part_Mine_Crystal` | 55×60 | cụm quặng lộ thiên (nhuộm cờ ⇒ vẽ sáng, nhạt) |

⚠ Lòng hầm phải ĐEN HẲN — trên một game hoàn toàn phẳng đó là thứ duy nhất làm mắt đọc ra
"có chiều sâu".
⚠ Đỉnh ảnh giàn tời phải CHỪA TRỐNG: văn phạm cắm SÀN ĐỨNG ngay tại đó.

## §6c-sexies — 47 tấm V6: LỚP PHỦ NHÀ + hành lang vòm · giàn giáo · cối xay · chợ (2026-09-06)

PPU 100, pivot đáy-giữa, khổ = cỡ world × 100. Lớp phủ nhà là tấm NHỎ nền TRONG SUỐT, đè lên
tường — phải đọc ra ở 15–40 px, không viền dày.

| Tệp | px | Nội dung |
|---|---|---|
| `Part_Win_Arch` 40×50 · `Part_Win_Shutter` 55×45 · `Part_Win_Round` 40×40 | | cửa sổ trung cổ: vòm · có cánh chớp mở · tròn |
| `Part_Win_Wide` 90×45 · `Part_Win_Slit` 25×50 | | cửa sổ hiện đại: băng kính · khe |
| `Part_Band_Stone` / `Part_Band_Steel` | 100×12 | phào kéo ngang |
| `Part_Corner_Quoin` 25×100 · `Part_Corner_Pilaster` 20×100 | | đá góc so le · trụ áp góc (kéo theo cao tầng) |
| `Part_Balcony_Wood` 120×55 · `Part_Balcony_Concrete` 130×45 | | ban công, con tiện THƯA |
| `Part_Att_Lantern` 25×40 · `Part_Att_FlowerBox` 60×30 · `Part_Att_Ivy` 50×70 · `Part_Att_Shutters` 70×50 · `Part_Att_Pipe` 20×100 · `Part_Att_Clothesline` 140×40 | | đồ gắn TƯỜNG (được lật theo nửa nhà) |
| `Part_Att_Antenna` 30×90 · `Part_Att_Dish` 45×45 · `Part_Att_Vent` 35×35 · `Part_Att_Vane` 30×60 | | đồ gắn MÁI |
| `Part_House_DoorPlank` 60×90 · `Part_House_DoorGlass` 70×100 | | cửa ván · cửa kính |
| `Part_House_RoofGambrel` 320×120 · `Part_House_RoofHip` 320×90 | | mái gãy · mái bốn dốc |
| `Part_House_FloorBrick` · `Part_House_FloorWattle` | 260×120 | tầng gạch · tầng trát đất khung gỗ |
| `Part_Arcade_Pier` / `_PierConcrete` 55×140 · `Part_Arcade_Span` / `_SpanConcrete` 190×140 · `Part_Arcade_Walk` 100×20 · `Part_Arcade_Rail` 100×45 | | trụ · nhịp (vòm HỞ bên dưới, KÍN mép trên) · lối đi · lan can |
| `Part_Scaffold_Frame` / `_FrameSteel` 140×120 · `Part_Scaffold_Deck` 190×14 · `Part_Scaffold_Rail` 180×40 | | khung hở giữa · sàn ván · lan can thưa |
| `Part_Windmill_Base` 200×50 · `Part_Windmill_Tower` 150×130 · `Part_Windmill_Cap` 170×80 · `Part_Windmill_Sail` 320×320 | | cối xay: cánh chữ thập nghiêng 45°, nền trong suốt |
| `Part_Turbine_Tower` 70×160 · `Part_Turbine_Hub` 70×60 · `Part_Turbine_Blades` 340×340 | | tua-bin ba cánh thon |
| `Part_Market_StallA` 160×130 · `Part_Market_StallB` 160×125 · `Part_Market_Kiosk` 150×140 | | sạp bạt sọc (nhuộm cờ ⇒ trắng–xám) · sạp mái rạ · ki-ốt |

## §6c-septies — 25 tấm V7 (2026-09-06)

PPU 100, pivot đáy-giữa, khổ = cỡ world × 100.

| Tệp | px | Nội dung |
|---|---|---|
| `Part_Post_Wood` 22×100 · `Part_Post_Stone` · `Part_Post_Steel` | | **CỘT CHỐNG MÁI — bị kéo cao theo khoảng hở**: thân TRƠN ba dải sáng–gốc–tối, chi tiết chỉ ở đầu (đỡ mái) và chân |
| `Part_Tower_TrunkRuined` | 100×100 | thân tháp nứt, một lỗ thủng LỆCH TÂM |
| `Part_Roof_Onion` 220×125 · `Part_Roof_Pyramid` 220×105 | | mái củ hành (phình rồi vút) · mái chóp vuông có gờ góc |
| `Part_Deco_Clock` 55×55 · `Part_Deco_Nest` 45×30 | | mặt đồng hồ · tổ chim gắn hông |
| `Part_Wall_BlockSandbag` 120×90 | | bốn hàng bao cát so le |
| `Part_Wall_CrenelHoard` 120×60 | | sàn gỗ nhô + kèo chống (lớp TRƯỚC, vẽ thưa) |
| `Part_Gate_LeafBarrier` 160×140 | | rào chắn thép vạch vàng |
| `Part_Stack_Crate` 100×75 · `Part_Stack_Hay` 110×65 · `Part_Stack_Container` 220×105 · `Part_Stack_PalletWrap` 130×70 | | **mặt trên phải SÁNG hơn thân** — đó là chỗ đặt chân |
| `Part_Stack_Tarp` 120×35 | | bạt phủ lượn sóng |
| `Part_Mast_Base` 90×35 · `Part_Mast_PoleWood` 22×140 · `Part_Mast_PoleSteel` 34×140 | | cột gỗ tròn · cột thép lưới giằng chéo |
| `Part_Mast_TopFlag` 75×75 · `Part_Mast_TopArray` 80×90 | | cờ bay mép lượn (nhuộm cờ ⇒ vẽ TRẮNG–XÁM) · ba chảo + đèn báo không |
| `Part_Plaza_Fountain` 180×95 · `Part_Plaza_Planter` 140×80 · `Part_Plaza_Bench` 90×40 · `Part_Plaza_Lamp` 40×180 | | đài phun có tia nước · bồn cây · ghế đá · cột đèn |

## §6c-octies — 19 tấm V8 + 7 tấm bối cảnh (2026-09-06)

### Nhà chính theo nền văn minh (12 tấm, `Sprites/Structures/`)

⚠ Mọi TẦNG nhà chính bị nhân bề ngang theo kiểu (nhà dài ×1.45, tháp vuông ×0.74) — hoa văn
phải là NHỊP LẶP ngang, và nét nhận dạng đặt LỆCH khỏi giữa vì cửa chính luôn ở x = 0.

| Tệp | px | Nội dung |
|---|---|---|
| `Part_Keep_FloorDonjon` · `Part_Keep_RoofDonjon` | 340×135 · 380×90 | đá đẽo vuông + khe châu mai cao · nóc răng cưa + hai tháp góc |
| `Part_Keep_FloorLonghouse` · `Part_Keep_RoofLonghouse` | 340×120 · 460×115 | gỗ ngang + cột chạm · mái VÕNG giữa, hai đầu vút lên |
| `Part_Keep_FloorPagoda` · `Part_Keep_RoofPagodaHall` | 340×125 · 440×130 | cột sơn đỏ + ô lưới · hai tầng mái, đầu đao cong |
| `Part_Keep_FloorTerrace` · `Part_Keep_RoofTerrace` | 340×130 · 320×85 | sa thạch khối lớn, thu vào trên · mái bằng gờ loe |
| `Part_Keep_FloorVilla` · `Part_Keep_RoofVilla` | 340×130 · 400×85 | vòm móng ngựa · mái ngói thấp + ngói ống |
| `Part_Keep_FloorBastion` · `Part_Keep_RoofBastion` | 340×130 · 360×50 | bê tông + cửa chớp thép · nóc bằng + ăng-ten |

### Bốn vai nhà mới (7 tấm)

`Part_House_FloorInfirmary` 260×120 (vải trắng căng + giá thuốc) · `Part_House_DecoHerb` 45×50 ·
`Part_House_FloorClinic` 260×120 (gạch men + dải xanh) · `Part_House_FloorWorkshop` 260×120
(mặt trước mở, bàn nguội) · `Part_House_FloorTavern` 260×120 (**cửa sổ SÁNG** — nguồn sáng ấm
duy nhất trong xóm về đêm) · `Part_House_DecoTankard` 40×45 · `Part_House_FloorTenement` 260×115.

### Bối cảnh (7 tấm, `Sprites/Environment/`)

`Peak_Round` 260×150 · `Peak_Jagged` 220×210 (có tuyết) · `Peak_Mesa` 300×120 · `Peak_Twin`
280×175 (có tuyết) · `Cloud_Puff` 180×90 · `Cloud_Wide` 300×80 · `Cloud_Wisp` 220×56.

⚠ **Bảy tấm này vẽ TRẮNG/XÁM thuần** — màu do `SkyBackdrop` nhuộm theo ngày/đêm. Đặt hàng art
màu cho chúng là về đêm ra sai sắc.
⚠ Núi: pivot ĐÁY-GIỮA (đứng trên đường chân trời). Mây: pivot TÂM.

## 11. TAM QUỐC — CÔNG TRÌNH HÁN · BẢN ĐỒ CHIẾN DỊCH (mở ngày 2026-09-08)

Người dùng: *"tôi muốn art đậm chất Tam Quốc và công trình hay map cũng vậy"*. Code hiện
vẽ TẠM (cột đá, mái nhà bằng hình chữ nhật, biểu tượng thành 48 px sinh lúc chạy); art
thật đặt ChatGPT theo ba đơn dưới. Dán SÁU RÀNG BUỘC (mục 1) vào đầu mọi prompt.

### 11a. Chi tiết công trình theo nền — `Sprites/Structures/<Wei|Shu|Wu>/Part_*.png`

Cùng bộ tên `Part_*` và khổ của mục 6c (`StructureAssembler` tự nhặt theo `CivKey`;
`KeepStyles` của ba nền là **Pagoda** nên nóc kinh đô đã cong sẵn). Mỗi nền một bộ, khác
nhau ở KHỐI và HOA VĂN, không chỉ màu:

| Nền | Tường | Mái | Cổng | Tháp canh |
|---|---|---|---|---|
| **Wei** (Ngụy) | gạch xám xanh xây so le, chân tường đá đen, lỗ châu mai vuông | ngói ống lam đậm, đầu đao ngắn, bờ nóc có "si vẫn" | cổng gỗ hai cánh đóng đinh đồng, khung lam, mái che hai tầng | lầu vuông hai tầng, lan can gỗ lam, cờ lam |
| **Shu** (Thục) | tường đất nện vàng nâu + cọc gỗ, chân đá núi thô | ngói đỏ son, mái cong nhiều, đầu đao dài, bờ nóc phượng | cổng gỗ đỏ khung đồng, lối lên bằng thang gỗ ghép (Thục đạo) | chòi gỗ trên cọc cao kiểu sạn đạo, cờ đỏ |
| **Wu** (Ngô) | tường trắng vôi + gỗ đen sơn mài, chân đá xám kè nước | ngói đen sơn mài, mái thấp rộng, đầu đao vàng | cổng thuỷ (vòm thấp có lưới), khung đen vàng | tháp canh bến nước, mái vàng, cờ vàng |

Prompt mẫu (một nền một lượt):

```
BỘ CHI TIẾT CÔNG TRÌNH — NGỤY / TÀO NGỤY (Tam Quốc, phong cách kiến trúc HÁN)
[SÁU RÀNG BUỘC]
Mỗi file đúng tên và khổ của bộ Part_* (xem danh sách đính kèm). Gạch xám xanh so le, ngói
ống LAM đậm, đầu đao ngắn, đinh đồng, cờ lam. Không viết chữ. Nền trong suốt.
```

### 11b. Bản đồ chiến dịch — `Resources/Campaign/`

| File | Khổ | Nội dung |
|---|---|---|
| `Map_ThreeKingdoms.png` | 1536 × 1024 | nền bản đồ giấy dó ố vàng, sông Trường Giang uốn ngang giữa-dưới, núi Tần Lĩnh phía Tây vẽ kiểu tranh thuỷ mặc, KHÔNG chữ, KHÔNG biểu tượng thành (code đặt) |
| `Icon_City_Capital.png` | 96 × 96 | KINH ĐÔ: thành ba tầng mái cong, tường có lỗ châu mai, cổng giữa — nhìn từ trước, hơi chếch trên; viền tối 2 px |
| `Icon_City.png` | 96 × 96 | THÀNH: tường + hai tầng mái, nhỏ hơn kinh đô |
| `Icon_City_Camp.png` | 96 × 96 | DOANH TRẠI: lều vải + rào cọc + cột cờ (cờ để TRẮNG, code nhuộm theo phe) |
| `Icon_Forest.png` | 96 × 96 | RỪNG GỖ: ba tán thông, đống gỗ xẻ dưới gốc |
| `Icon_Mine.png` | 96 × 96 | MỎ VÀNG: núi đá cửa hầm tối, vài vệt quặng vàng |
| `Icon_City_Ruin.png` | 96 × 96 | thành bỏ hoang: tường đổ, cỏ mọc |

`ThreeKingdomsCampaignMap` nạp năm icon đầu từ `Resources/Campaign/` nếu có, không có thì vẽ
tạm — không cần đổi code khi thả file. Nền bản đồ và icon phế tích là đơn hàng CHỜ code
(chưa nạp). Quân nổi dậy (phe trắng) không có nền văn minh — nếu muốn bộ giáp riêng "Khăn
Trắng" thì đặt thêm một nền `Rebel` theo quy trình CivilizationIntake.

## 12. BỘ NGOẠI HÌNH NHÂN VẬT — tóc · mặt · băng đầu · dáng đầu · áo · sau lưng · đuôi (2026-09-09)

Bản code ở `Assets/Sprites/Looks/<Loại>/` là lưới an toàn (58 tấm). Đặt vẽ thật thì thả PNG
**CÙNG TÊN** vào đúng thư mục con — tool chừa ra theo nhãn. Luật hợp đồng ở
`Docs/AgentRules/CharacterLook.md` mục 3; xem trước bằng skill `stickman-look`.

### Khối chung (dán trước mỗi lượt)

```
Pixel-art / flat vector sprite for a 2D side-view stickman game. TRANSPARENT background.
SIDE VIEW facing RIGHT (+X is the front of the face). Draw ONLY the item, no head, no body,
no ground, no shadow. Style: bold flat shapes with a thin dark outline (RGB 24,22,28).
COLOR RULE (important): the main area must be PURE WHITE (#FFFFFF) — the game multiplies it by
the character's colour at runtime; secondary areas mid-grey (#969696); dark details (#5C5C5C).
Do NOT use any other hue. Same canvas size and the same anchor for every item in the set.
```

### Khổ + mốc từng loại

| Loại | Canvas | Mốc phải giữ | Tên file |
|---|---|---|---|
| Tóc | 128×128 | đầu là hình tròn TÂM (64,64) BÁN KÍNH 32 px (không vẽ đầu); tóc phải THÒ RA ngoài vòng đó; chừa MẶT (vùng trước-dưới) | `Hair_<Kiểu>.png` |
| Mặt | 128×128 | vẽ TRONG vòng đầu; MỘT con mắt ở (77, 68) | `Face_<Kiểu>.png` |
| Băng đầu / mũ mềm / sừng / hào quang | 128×128 | ôm vòng đầu; đuôi khăn rủ về −X | `Band_<Kiểu>.png` |
| Dáng đầu | 128×128 | thay cả cái đầu; đường kính ≈ 64 px, tâm (64,64) | `Head_<Kiểu>.png` |
| Áo | 96×128 | KHỚP VAI ở (48, 96 từ đáy); hông ở (48, 24); rộng 40–48 px | `Torso_<Kiểu>.png` |
| Sau lưng | 96×128 | cùng mốc vai; vật nằm phía −X | `Back_<Kiểu>.png` |
| Đuôi | 128×64 | gốc đuôi ở (120, 32), kéo về −X | `Tail_<Kiểu>.png` |

Kiểu đang có (tên phải trùng để thay bản code): tóc Spiky · Flame · Short · Swept · Long · Bob
· Mohawk · Bun · Ponytail · Afro · Braid · Slick · Wild; mặt Dot · Angry · Visor · Glasses · Mask
· Scar · Beard · Skull; băng Headband · Bandana · Cap · Hood · Crown · Horns · Halo · Antenna;
đầu Round · Square · Oval · Wedge · Big; áo Gi · Vest · Jacket · Robe · Plate · Tank · Tunic ·
Tactical · Loincloth · Hanfu · Bandage · Cuirass; sau lưng Cape · Scarf · Quiver · Backpack ·
Wings_Cloth · Banner · Sheath; đuôi Monkey · Lizard · Tuft · Spade.

Kiểu MỚI: thêm tên vào `StickmanLookArt.*Names` + `StickmanLookBuilder.Specs`, thả PNG, bấm
«★ Ngoại hình nhân vật». Nhận về: nhìn `Docs/ArtSheets/Looks_*.png` (contact sheet cỡ thật).

### 12b. TEMPLATE CÓ MỐC + tool nhận về (2026-09-09)

Đừng bắt ChatGPT tự đoán "tâm đầu ở (64,64)": sinh template rồi đính kèm.

```powershell
cd .claude/skills/stickman-look/scripts
python intake_look.py --templates ./templates      # template_head/torso/tail/extra/sleeve.png (×4)
```

Thêm vào prompt: *"Draw ON TOP of the attached template. The MAGENTA marks are anchors (head
circle / shoulder-and-hip line / tail root / hip point) — keep the item aligned to them and do
NOT paint over them; they will be removed automatically. Keep the exact canvas size."*

Nhận về — một lệnh, không mở Photoshop:

```powershell
python intake_look.py C:\Users\...\Downloads\robe.png Torso_Robe
```

Tool xoá nền nối mép + magenta, quy thang xám (trắng · xám 150 · xám 92 · viền), co về đúng khổ,
ghi vào `Assets/Sprites/Looks/Torso/Torso_Robe.png`. Giữ màu thật thì thêm `--keep-color` (tấm
đó sẽ chỉ có một màu, mất phép nhân màu). Trong Unity bấm «★ Ngoại hình nhân vật» — pivot/PPU/
border được cài theo hợp đồng và tấm được khoá `stickman:hand`.

Prompt riêng theo loại (dán sau khối chung mục 12):
- **Tóc**: *"a HAIRSTYLE for a round head of radius 32 px centred on the circle mark; hair must
  extend OUTSIDE the circle; leave the face area (front-lower quarter) empty."*
- **Áo**: *"a TORSO GARMENT hanging from the shoulder mark down to the hip mark (72 px); no arms,
  no neck; width 40–48 px; belt/seams in mid-grey."*
- **Sau lưng**: *"a BACK item (cape / wings / carapace) attached at the shoulder mark, extending
  to the LEFT (behind the character)."*
- **Đuôi**: *"a TAIL rooted at the circle mark on the right edge, extending LEFT."*
- **Phụ thân**: *"extra limbs (spider legs / claws / roots) growing from the hip mark, spreading
  down and to both sides."*
