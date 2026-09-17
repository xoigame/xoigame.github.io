## BỐN THỂ LOẠI — trục phân chia CAO NHẤT

Dự án dựng **ba game khác nhau trên CÙNG một bộ rig / AI / animation**:
**Trung cổ** (kiếm/giáo/cung) · **Hiện đại** (súng) · **Fantasy** (pháp sư, mana).

Khai báo ở `GenreDefinition` + `MapTheme` (asset trong `Assets/Settings/Genres/`), nguồn sự
thật là mảng `Specs` trong `StickmanGenreBuilder.cs`. Mỗi thể loại có 3 bài test riêng
(`Genre_<TheLoai>_<Bai>`, tổng 9 scene).

**LUẬT MODULE — thêm thể loại KHÔNG được sửa code cũ:** thêm 1 giá trị `enum GameGenre` +
1 phần tử `Specs` + (nếu có vũ khí kiểu mới) 1 file builder **partial class** riêng.
KHÔNG đụng rig, `StickmanAgent`, hệ animation, `StickmanWeaponHolder`, hệ effect.

Vũ khí KHÔNG chia theo thể loại ở tầng prefab — vẫn một bảng `LeafWeaponPaths` duy nhất,
`GenreDefinition.weapons` chỉ là BỘ LỌC. Nhờ vậy cân bằng vẫn đo trên một thang chung và một
cây dùng được ở nhiều thể loại.

**VÕ LÂM (2026-09-08) là thể loại thứ tư** — sáu môn phái, NỘI CÔNG thay mana (hồi bằng cách
VẬN CÔNG tại chỗ, không phải chạy về `ManaFont`), KHINH CÔNG thay ngựa, CHIÊU THỨC thay bài phép.
Nó cũng là thể loại đầu tiên **cấm KHIẾN** — ô khiên khoá tay trái, tức khoá luôn mọi chiêu cần hai tay.
Đọc [Wuxia.md](Wuxia.md).

**FANTASY có luật riêng đủ dài để tách file** — hình hài chín chủng (`FantasyRaceTeamAssigner`),
AI pháp sư (núp để niệm · không mở bài dài khi sắp bị cắt · về mạch mana), và dáng niệm chú:
đọc [Fantasy.md](Fantasy.md). Bắn súng: [Shooter.md](Shooter.md).

## MÀN TRỘN HAI THỜI ĐẠI — bộ lọc thể loại là của CẢ SCENE, không của từng phe (2026-09-08)

Màn «Lạc về trung cổ» (`Demo_59_TimeSlip` — tiểu đội hiện đại thủ trại trước quân trung cổ)
là màn đầu tiên có HAI thời đại trên cùng một sân, và nó đụng đúng chỗ hở của bộ lọc thể loại:
`GenreWeaponPolicy` chỉ giữ **một** danh sách vũ khí cho cả scene, nên không có cách nào nói
"phe này súng, phe kia kiếm". Ép thể loại nào vào cũng hỏng CÂM đúng một nửa sân:

| Ép vào | Hỏng ở đâu |
|---|---|
| `Medieval` | lính hiện đại không TỰ ĐỔI được sang khẩu thứ hai lúc khẩu đầu cạn — `CanAutoSwapTo` hỏi bộ lọc thể loại TRƯỚC, mà `AllowRestrictedWeapons` chỉ mở được cửa `CanEquip` |
| `Modern` | cả đạo quân trung cổ không rút nổi cây kiếm nào |

⚠⚠ Nhưng **`FullRoster` cũng KHÔNG dùng được** — và đây là bẫy đắt hơn, đã dính thật:
`CivilizationDefinition.ApplyTo` → `UnitLoadout.ApplyTo` → `EquipWeapon(...)`, tức **phát lại
vũ khí theo quân chủng của nền** cho mọi lính sinh giữa trận; `EnemyWaveSpawner.Spawn` lại cố
ý gọi `Dress` SAU khi phát chu kỳ vũ khí, nên nền văn minh là tiếng nói cuối. Hệ quả: cả sáu
hồi công trại ra **cùng một bộ vũ khí**, bảng vẫn in "HỒI 2 — Cung thủ", và không lỗi nào báo.

⚠⚠ **CÁCH ĐÚNG — nền văn minh chỉ KHOÁC ÁO, màn tự khai kho vũ khí:**

1. `AddCivilizationAssignerShared(ApplyMode.**LookOnly**, genre, fixedByTeam)` — hai nền ghim
   tay (`Civ_Army` cho tiểu đội, một nền trung cổ cho bên kia). LookOnly không phát vũ khí và
   cũng không gắn bộ lọc thể loại.
2. Cái giá của LookOnly là mất luôn `SetSwapPool`, nên **màn phải tự khai kho được phép tự
   rút**: builder gọi `holder.SetSwapPool(...)` cho quân đặt sẵn, còn quân sinh giữa trận thì
   trọng tài khai qua hook `CivilizationTeamAssigner.Dressing` (xem `TimeSlipDefenseMode`).
   Thiếu vế này là lính giáo trung cổ móc khẩu tiểu liên trong bảng vũ khí của prefab ra bắn.
3. Một chỗ cho MỌI đường dựng: `StickmanTimeSlipBuilder.ApplyMixedEraCivilizations()`. Màn
   dựng từ **công thức JSON** đi qua `StickmanRecipeBuilder` bước 6, mà bước đó chỉ chọn giữa
   `FullRoster` và bộ lọc thể loại — tức cả hai đều sai với màn trộn; hàm này gỡ thứ vừa gắn
   rồi đặt lại cho đúng.

Phép đo: Doctor › «Màn Lạc về trung cổ» (`StickmanTimeSlipCheck`) réo khi scene có
`GenreWeaponPolicyBinder` **hoặc** khi nền văn minh không phải LookOnly.

⚠ **ĐẠN LÀ TÀI NGUYÊN ĐẾM ĐƯỢC, không phải nút chỉnh sát thương.** Ít chọi đông cân bằng
được là nhờ `AmmoCache.SetStock(n)` — hòm tiếp tế **có đáy**, hết thì tiểu đội phải nhặt vũ
khí trung cổ dưới đất (đường nhặt đồ không bị luật nào chặn). `SetStock(0)` = vô hạn như cũ,
nên 40+ màn sẵn có không đổi hành vi. Giỏ cạn **tự rời sổ `AmmoCache.All`**: để nó trong sổ
là `AIResupplyModule` cứ dẫn cả tuyến bỏ chốt chạy về một cái hòm không cho gì.

⚠ Kịch bản theo HỒI viết ở `TimeSlipDefenseMode.Assault[]`, không viết trong builder:
`EnemyWaveSpawner.WaveStarted` phát **SAU** khi đợt đã sinh và đã cầm vũ khí, nên mode áp
cấu hình cho hồi **kế tiếp**. Nghe sự kiện rồi mới đổi chu kỳ vũ khí của chính đợt đó là muộn
đúng một nhịp — hồi "cung thủ" ra toàn kiếm, và nhìn vào không ai biết vì sao.

⚠ **Đủ bộ cho một màn chơi được, không chỉ trọng tài** (2026-09-09): builder của màn tự gắn
`GameShellRuntime` (`MusicCue` · `MusicBattleDriver` · `NoticeBoard` · `CompassBar` ·
`ProgressTracker`) và tự gọi `StickmanShellBuilder.BuildConfig()`. Trông vào tool vá hàng loạt
(«Dựng NHẠC · THÀNH TỰU…») thì mỗi lần dựng lại màn là màn lại CÂM và biến mất khỏi menu chính
cho tới khi có người nhớ bấm nó — Doctor có phép đo riêng, nhưng phép đo chỉ nói "đang thiếu",
không tự vá.
