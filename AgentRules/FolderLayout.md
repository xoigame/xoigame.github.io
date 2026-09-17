## ⚠⚠ BỐ CỤC THƯ MỤC NGUỒN — XẾP THEO **TÍNH NĂNG**, VÀ ĐÓ LÀ PHÉP ĐO (2026-09-14)

`Modules.md` trả lời câu **"file này thuộc TẦNG nào"** (assembly nào). File này trả lời câu còn
lại: **"trong tầng đó thì nó nằm ở đâu"**. Thiếu vế thứ hai nên trước ngày 2026-09-14 dự án đo
được:

| Thư mục | File .cs nằm PHẲNG trong một thư mục |
|---|---:|
| `Assets/Editor` | **315** |
| `Assets/Scripts/Gameplay` | 229 |
| `Assets/Scripts/Map` | 189 |
| `Assets/Scripts/Combat` | 164 |
| `Assets/Scripts/Core` | 100 |

Không ai sai ở bước nào — mỗi phiên chỉ thả thêm một file vào gốc module. Nhưng hệ quả là **không
tìm được gì nếu không biết sẵn tên class**, và AI rẻ thì `ls` một thư mục 315 dòng rồi đoán bừa.
Biên dịch xanh, Doctor xanh, tool chạy được: đúng khuôn **bẫy im lặng**, chỉ có giá mỗi lần sửa
là tăng dần. Vì vậy luật này đi kèm phép đo, không chỉ là một đoạn ⚠.

### Luật

1. **Module đã chia thì gốc chỉ còn `.asmdef`.** Không để file `.cs` trần ở
   `Core` · `Combat` · `AI` · `Gameplay` · `Map` · `Editor`. → **ĐỎ**
2. **Module còn phẳng được phẳng tới 40 file** (`Units` · `Naval` · `Zombie` · `Demo`).
   Vượt 40 thì phải chia. → VÀNG
3. **Một thư mục trần 65 file.** Vượt thì chia tiếp theo tính năng con. → VÀNG
4. **Tên thư mục nói TÍNH NĂNG, không nói LOẠI KỸ THUẬT.** Cấm `Utils` · `Helpers` · `Managers` ·
   `Misc` · `Common` · `Shared` · `Other` · `New` · `Temp` · `Old`. Cái tên nào không loại trừ thứ
   gì thì rác sẽ dồn về đó. → **ĐỎ**
5. **Thư mục mới phải được KHAI hai chỗ:** bảng `FeatureFolders` trong
   [`StickmanDoctor.Layout.cs`](../../Assets/Editor/Doctor/StickmanDoctor.Layout.cs) *và* bảng
   dưới đây. Khai một chỗ thôi thì bảng tra sai ngay hôm sau. → VÀNG
6. **Đặt file theo TÍNH NĂNG NÓ PHỤC VỤ, không theo loại đối tượng nó là.** `ArpgCrit.cs` vào
   `Combat/Arpg`, không vào `Combat/Weapons`; `CinematicCamera.cs` vào `Map/Cinematic`, không vào
   một thư mục `Camera` nào đó.
7. **Không mở thư mục cho 1–2 file.** Chưa đủ một cụm việc thì để ở thư mục gần nhất.

### Bảng thư mục — tra "sửa X thì mở đâu"

| Module | Thư mục tính năng |
|---|---|
| **Core** | `Foundation` pool·save·hợp đồng · `Rig` dữ liệu rig/động tác · `Combat` enum vũ khí·trạng thái · `Run` ván chơi·mode·perk·thành tích · `World` mặt phẳng·biome·thời tiết · `Lighting` · `Audio` · `UI` màn hình·chữ·chạm · `Wuxia` · `Arpg` |
| **Combat** | `Character` controller·di chuyển·trạng thái · `Rig` animator·xác · `Appearance` look·tô màu·thứ tự vẽ · `Weapons` vũ khí·đạn·nổ · `Equipment` trang bị·rơi đồ·nhặt · `Effects` · `Structures` công trình·cổng·máy công thành · `World` đất·đường·nền trời · `Animals` thú·ngựa·chim · `Flight` · `Wuxia` · `Arpg` |
| **AI** | `Agent` StickmanAgent·hồ sơ·bảng đe doạ · `States` FSM · `Tactics` lối đánh·ẩn thân · `Command` chỉ huy·đồn trú·cờ hiệu · `Modules` module lắp rời · `Work` việc dân sự·tài nguyên |
| **Units** | *(phẳng — 16 file)* |
| **Gameplay** | `Modes` luật thắng thua · `Objectives` mục tiêu trên sân · `Camp` doanh trại·kinh tế · `Command` đội·anh hùng chỉ huy · `Shell` vỏ ván chơi·camera·HUD·hồi sinh · `Vehicles` · `Animals` · `Race` đường đua·tay đua·trọng tài đua · `Arcade` màn ăn liền một ngón · `Athletics` điền kinh — hai ngón là hai chân · `Merge` hợp nhất quân rồi bấm đánh · `LaneDefense` thủ tuyến · `Frontier` ngày mở biên đêm thủ trại · `Bridge` dựng cầu rồi xem nó sập · `Fantasy` · `ThreeKingdoms` · `Wuxia` · `Arpg` · `Moba` |
| **Naval** · **Zombie** · **Demo** | *(phẳng)* |
| **Map** | `Build` bộ dựng·luật dựng·kit · `Maps` từng map cụ thể · `Match` trọng tài·nhiệm vụ·thống kê · `Story` cốt truyện·gói game·chiến dịch · `Cinematic` trường quay · `Fort` thành luỹ · `Structure` công trình lắp ghép · `City` |
| **Editor** | `Pipeline` hàng đợi dựng·bảng điều khiển·module · `Doctor` mọi phép đo·self-test·smoke · `Art` bộ SINH hình · `ArtTools` pivot·cắt·đặt hàng·nhập art · `Rig` · `Weapons` · `Units` văn minh·archetype·AI·look · `Maps` · `Modes` bộ dựng mode/scene · `Cinematic` · `Audio` · `Effects` · `Intake` nhập thứ mới · `FantasyGenerated` |

### Phép đo

«★ KHÁM SỨC KHOẺ DỰ ÁN» → bốn dòng của
[`StickmanDoctor.Layout.cs`](../../Assets/Editor/Doctor/StickmanDoctor.Layout.cs):
«File .cs nằm trần ở gốc module» · «Thư mục tính năng phải có trong bảng» · «Thư mục quá đông
file» · «Thư mục đặt tên theo loại, không theo tính năng». Bảng `FeatureFolders` trong file đó là
**nguồn sự thật** của cả luật lẫn phép đo.

### ⚠ Dời file thì phải làm đủ bốn việc

Đợt 2026-09-14 dời **1 048 file** và đây là bốn chỗ dễ quên (đã dính đủ cả bốn):

1. **Kèm `.meta`.** GUID nằm trong đó; thiếu là mọi prefab/scene trỏ vào script thành
   `Missing (Mono Script)` mà biên dịch vẫn xanh.
2. **Dời cả FILE, không dời CLASS.** `MonoBehaviour`/`ScriptableObject` nối vào asset bằng GUID
   của FILE — xem [Modules.md](Modules.md).
3. **Viết lại đường dẫn hardcode.** Đợt này có **2 038** chỗ: `extraSources`/`proof` của
   `StickmanBuildPipeline` và `StickmanToolCenter` (hơn 500 chỗ), phép đo của Doctor đọc mã
   nguồn theo đường dẫn, `Docs/Tools/FileSizeBaseline.txt`, tài liệu và skill. Sai một chỗ trong
   `extraSources` thì nút tool đó **báo "cũ" vĩnh viễn** mà không ai biết vì sao.
4. **Đừng đụng `.claude/worktrees/`.** Đó là bản sao repo của phiên khác, file ở đó CHƯA dời —
   sửa đường dẫn trong đó là làm hỏng việc đang dở của người khác. (Đã dính, đã hoàn tác.)

Xong rồi chạy `Docs/Tools/Verify.ps1` (tự đồng bộ `.csproj` — Unity sinh csproj theo đĩa, không
đồng bộ thì build đỏ vì thiếu file), rồi bấm Doctor.

### Nguyên tắc gốc

> Xếp theo TÍNH NĂNG thì người tìm bằng "tôi muốn sửa cái gì". Xếp theo LOẠI thì phải tìm bằng
> "cái đó tên là gì" — mà nếu đã biết tên thì đâu cần thư mục.
