## ⚠⚠ VÒNG CHƠI DÀI — phần thưởng giữa hai ván · bày trận rồi bấm chạy (2026-09-08)

Hai hệ ở tầng game, cùng trả lời một câu: *"chơi ván thứ hai để làm gì?"*.

---

## 1. PHẦN THƯỞNG GIỮA HAI VÁN (`RunPerks`)

`GameRun` đã nối các ván lại (thắng thì bậc khó lên, thua thì xuống, có seed, có chuỗi thắng)
nhưng giữa hai ván người chơi **không quyết định gì cả** — ván sau chỉ là ván trước cộng một
bậc khó. Thiếu đúng vế mà mọi roguelite sống nhờ nó: *"thắng rồi, chọn một trong ba"*.

### Bốn mảnh, và vì sao chúng nằm ở bốn tầng khác nhau

| Mảnh | Tầng | Việc |
|---|---|---|
| `RunPerks` | Core | sổ perk đã lấy · bày ba lá · cộng dồn hiệu lực · chuỗi để lưu |
| `RunPerkTable` | Core | bảng perk, đọc `Resources/RunPerks.json`, thiếu file thì dùng bảng gốc |
| `RunPerkBinder` | Gameplay | ĐEM SỐ ÁP VÀO LÍNH (`SetGearTier` · `SetSmartsLevel` · `SetMaxHealth` · `SetStock`) |
| `RunPerkPicker` | Gameplay | bảng chọn ba lá, ô `MidRight` |

⚠ **Core không được nhìn lên AI/Units/Gameplay**, nên `RunPerks` chỉ giữ **con số và cái tên**
("+1 cấp trang bị", "+25% máu"). Việc áp là của binder ở tầng trên. Đừng "gộp cho gọn" —
gộp là Core phải tham chiếu ngược lên, đúng thứ mà luật module cấm.

### Luật giữ cho nó không làm hỏng màn nào

⚠⚠ **GẮN BẰNG BOOTSTRAP, KHÔNG BẮT BUILDER NHỚ.** `RunPerkBootstrap` nghe `sceneLoaded` rồi tự
gắn binder + bảng chọn — hơn 60 scene đã bake trên đĩa không phải dựng lại. Bắt từng builder
thêm một dòng thì builder thứ 21 chắc chắn quên, mà quên thì **không lỗi nào báo**: phần
thưởng lặng lẽ không có tác dụng ở đúng màn đó. (Cùng bài học với `AddCivilizationAssignerShared`
và `PlayerRespawn`.)

⚠ **CHỈ GẮN Ở MÀN CÓ TRỌNG TÀI.** Bàn thử, AI Lab và sân đo cân bằng KHÔNG được cộng máu/cấp
cho ai — mọi con số đo ở đó sẽ lệch mà người đo không biết vì sao. «Có `MatchModeBase`» chính
là định nghĩa "màn chơi thật" của dự án này.

⚠ **KHÔNG AI CHỌN THÌ MÁY CHỌN** (`RunPerks.AutoPick`, sau 25 giây thực). Nợ một lần chọn mãi
mãi là một cái kẹt không lỗi nào báo, và nó chặn cả những ván sau.

⚠ **CHỈ NÂNG NGƯỜI ĐÃ CÓ CẤP.** `AISmartsTable.Off` nghĩa là "màn này không dùng hệ cấp"; ép
cấp 1 cho họ là đổi hành vi cả màn vì một phần thưởng.

⚠ **CỘNG MÁU CHỈ CHO NGƯỜI.** Công trình cũng là `StickmanController` — cộng máu cho cái nhà
là đổi luật thắng của mode công thành. Lọc bằng "có `StickmanAgent` không".

⚠ **GIỎ VÔ HẠN THÌ ĐỪNG CỘNG.** `AmmoCache` có `RefillsLeft == 0` nghĩa là VÔ HẠN; cộng vào
là biến nó thành có đáy — phần thưởng làm người chơi yếu đi.

⚠ **`id` LÀ THỨ ĐƯỢC LƯU** (`PlayerProfile.runPerks`, ngăn cách bằng dấu phẩy). Đổi `id` của
một perk đã phát hành = xoá nó khỏi mọi bản lưu đang có; đổi `name`/`brief`/`amount` thì an toàn.

⚠ **NẠP PERK SAU `RestoreFromProfile`**: hàm đó gọi `Reseed`, còn `StartNew` (đường vào game
mới) gọi `RunPerks.Clear()`. Nạp trước là bị dọn sạch ngay sau đó.

### Thêm một loại hiệu lực mới

Ba chỗ: một giá trị `RunPerkKind` → một nhánh trong `RunPerkBinder` → một dòng trong bảng gốc
(và trong `Resources/RunPerks.json` nếu có). Loại nào tầng Gameplay **không áp được bằng một
API đã có** thì đừng thêm — `Lives` từng được đề xuất rồi bỏ, vì `RespawnDirector._livesPerTeam`
là quỹ CHUNG cả sân: cộng cho mình thì địch cũng được.

---

## 2. BÀY TRẬN RỒI BẤM CHẠY (`DeployPhaseMode`)

Người chơi có một số xu, chạm xuống nửa sân của mình để đặt lính, bấm CHẠY thì buông tay.
Không điều khiển ai giữa trận — **cả trò chơi nằm ở phút bày trận**.

Vì sao nó hợp bộ khung này: giá trị đã nằm sẵn trong ragdoll và trong AI; phần phải viết chỉ
là phút bày trận. Với AI yếu, **nội dung của cả một game = một bảng giá** (`deploy` trong công
thức JSON) — không phải viết một dòng luật nào.

⚠ **DỪNG BẰNG `Time.timeScale = 0`**, không phải bằng một cờ "chưa bắt đầu" trên từng lính.
Đi đường kia là phải thêm cờ vào `StickmanAgent` rồi nhớ tắt nó ở năm đường sinh quân khác nhau.
Kèm theo: `OnDestroy` phải TRẢ LẠI nhịp cũ, không thì bỏ scene giữa lúc đang bày là scene sau
mở ra đứng hình và không có gì trỏ về đây. Ghi lại nhịp cũ chứ đừng trả về `1f` cứng — sân đo
có thể đang chạy `timeScale = 10`.

⚠ **HỎI `StickmanUI.PointerOverHud` TRƯỚC KHI ĐẶT.** IMGUI và `Input` là hai kênh không biết
nhau: bấm lên bảng giá cũng bị tính là chạm xuống sân, và người chơi đọc ra là *"bấm nút lại
đẻ ra một ông lính"*.

⚠ **`EquipFirstUsableWeapon`, KHÔNG phải `EquipWeapon(index)`** — cây bị bộ lọc thể loại hoặc
tay nghề chặn thì lính ra sân TAY KHÔNG và không lỗi nào báo.

⚠ **THẢ THEO `TerrainGround.SurfaceYAt(x)`**, không theo một hằng số: map đồi thì lính rơi lửng
giữa không trung, chỗ trũng thì kẹt trong lòng đất.

⚠ **ĐẶT XONG KHÔNG SỬA ĐƯỢC** — cho gỡ ra đặt lại thì phút bày trận thành một cái bàn nghịch
không có giá. Đó là một game khác.

⚠ **NGÂN SÁCH HAI BÊN CÓ CÂN HAY KHÔNG LÀ VIỆC CỦA NGƯỜI VIẾT CÔNG THỨC**: máy không biết mấy
tốp lính khai trong `squads` đáng bao nhiêu xu. Muốn dùng ván này làm phép đo cân bằng
("50 xu cung thủ có thắng 50 xu kỵ binh không?") thì tự quy giá cho phe địch bằng đúng bảng `deploy`.

Xem thêm: [GameShell.md](GameShell.md) mục bảng trọng tài · [Gameplay.md](Gameplay.md) ·
[CheapAI.md](CheapAI.md) luật 3 (hỏng mềm) và 8b (chỗ đứng đi xin).
