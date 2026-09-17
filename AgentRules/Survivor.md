# MỘT MÌNH GIỮA BIỂN QUÁI — `SurvivorMode` (2026-09-16)

Kiểu chơi đổi đúng **một** thứ so với 41 mode còn lại: **ai bấm nút đánh**. Không quái mới,
không luật chiến đấu mới, không map mới.

Code: `Assets/Scripts/Gameplay/Modes/SurvivorMode.cs` · `SurvivorUpgrades.cs` ·
`SurvivorAutoAttack.cs`. Màn: `Demo_77_Survivor`. Trọng tài rời: `ModeKind.Survivor`.

## 1. Bỏ nút đánh là một QUYẾT ĐỊNH THIẾT KẾ, không phải tiện ích

Còn đúng một câu hỏi — *"đứng ở đâu"* — nên mọi thứ khác mới thành lựa chọn: đám đông đang tụ
chỗ nào, chạy vòng hay cắt ngang, lá bài nào đáng đánh đổi.

⚠ `SurvivorAutoAttack` đánh theo NHỊP RIÊNG (`_cadence` 0.18 s), không gọi mỗi frame: cung/nỏ
tính lực theo thời gian giữ, gọi mỗi frame là mũi tên nào cũng bay với lực tối thiểu.

⚠ Chỉ ra đòn khi mục tiêu **trong tầm vũ khí** (`WeaponBase.EffectiveRange × rangeScale`).
Bắn vào khoảng không thì hết đạn mà không ai trúng, và người chơi đọc ra là "vũ khí hỏng".

⚠ Tìm mục tiêu bằng `TeamMember.QueryNear` (sổ chia ô), KHÔNG quét `TeamMember.All`: sân này
cố ý đông 40–50 người.

## 2. BA LÁ PHẢI THUỘC BA HỌ KHÁC NHAU

Bốc ba lá từ một túi chung thì phần lớn lần lên cấp là *"+12% hay +15% sát thương?"* — một câu
hỏi không có câu trả lời sai, tức **không phải một quyết định** (cùng bẫy với
[một hệ số toàn cục không ra quyết định nào]). Mỗi lần lên cấp mời đúng một lá mỗi họ:

| Họ | Nó mua gì | Nó bỏ gì |
|---|---|---|
| **ĐÒN** | giết nhanh hơn | vẫn mỏng, vẫn chậm |
| **THÂN** | sống dai | đám đông dày dần mà giết không kịp |
| **CHÂN** | chọn được trận (tốc độ · tầm) | không giết ai nhanh hơn |

⚠⚠ **Lá ghi qua `UnitStats` với nguồn `survivor:*`**, không ghi thẳng `StickmanController`:
ghi thẳng thì hai lá cùng loại đè nhau và hết ván không gỡ được. Lấy lại lá cũ thì ghi CÙNG
nguồn với trị luỹ thừa (1.25²), không thêm nguồn thứ hai — `StatChannel` khoá theo mã nguồn
nên thêm nguồn trùng là lần hai không đổi gì cả.

⚠⚠ **Gỡ sạch ở CẢ HAI chỗ** (`OnFinished` và `OnDestroy`): nhân vật người chơi sống qua scene
khác, mang theo +300% sát thương sang ván sau mà không lỗi nào báo.

## 3. Sức ép lên theo ĐỒNG HỒ, không theo số quái còn sống

Đứng một chỗ farm là cách chơi hợp lệ; nhưng nếu sức ép chỉ tăng khi dọn sạch thì cách chơi ấy
biến thành **đứng yên**.

⚠ Đo được (mô phỏng nhịp đợt của `Demo_77`, ván 7 phút):

| Người chơi hạ | Mạng | Cấp | Quân trên sân |
|---|---:|---:|---:|
| 0.4 /giây | 167 | 9 | bão hoà ~52 |
| 1.0 /giây | 412 | 15 | ~51 |
| 2.0 /giây | 788 | 21 | ~48 |

Sân **bão hoà ở trần `maxAlive` từ khoảng phút thứ 2**, và cả ván trần đó chỉ nới 40 → ~51
(+32%). Nghĩa là sau phút 2 thứ làm ván khó thêm KHÔNG còn là số lượng mà là **cấp AI**
(mỗi 2 phút, tối đa bậc 5). Đừng vặn `_pressureStep` lên để "cho khó hơn" — nó chỉ làm đợt đầu
đông hơn rồi lại chạm trần.

⚠ `EnemyWaveSpawner.AddPressure` đã tự nới `_maxAlive` cùng lúc với cỡ đợt. Đừng gọi
`SetPacing` để siết sức ép: nó GHI ĐÈ cả bảng và xoá số builder vừa cân cho scene.

## 4. Hai vế kết cục

Hết giờ = **thắng**, chết = **thua**. Một mode chỉ có vế thua thì người chơi không bao giờ biết
mình đã "xong" — nó là cái máy xay, không phải một ván.

⚠ Bảng ba lá **KHÔNG dừng `Time.timeScale`** (biến toàn cục cùng họ `Physics2D.gravity`, và
`HitStop` cũng đang ghi vào đó). Thay vào đó `SurvivorMode` **ngừng sinh thêm** trong lúc bảng
mở rồi bật lại khi chọn xong — sân vẫn sống, không ai bị một đợt mới úp lên đầu giữa lúc đọc bài.

⚠ `SupportedRoles` = **chỉ Hero**. Cả kiểu chơi là "người chơi đứng chỗ nào"; kê thêm
`Observer` là một ô chọn bấm vào rồi ngồi nhìn màn hình đứng im.

## 5. Bốn cửa quái, không phải hai

Hai cửa (khuôn của mọi màn thủ cũ) thì chỗ đứng tối ưu là GIỮA và nó đúng suốt cả ván — kiểu
chơi rút về một chỗ đứng. Bốn cửa thì không điểm nào an toàn với cả bốn.

⚠ Sân KHÔNG vực, KHÔNG bục: người chơi đang dán mắt vào đám đông chứ không nhìn chân.
