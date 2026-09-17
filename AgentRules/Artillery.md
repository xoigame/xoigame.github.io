# ĐẤU PHÁO THEO LƯỢT + ĐẤT LÕM DẦN (2026-09-16)

Code: `Assets/Scripts/Gameplay/Modes/ArtilleryDuelMode.cs` · `ArtilleryGunner.cs`.
Màn: `Demo_80_Artillery`. Bộ dựng: `StickmanArtilleryBuilder` (màn dựng sẵn) ·
`StickmanRefereeBuilds.Artillery` (từ công thức JSON, tên trọng tài `Artillery`).
Hệ đất: `Assets/Scripts/Combat/World/TerrainGround.cs`.

⚠⚠ **GẮN MODE KHÔNG ĐỦ — LÍNH ĐỊCH PHẢI THÀNH PHÁO THỦ.** Cả hai đường dựng đều phải: gắn
`ArtilleryGunner` cho từng lính phe địch **và TẮT `StickmanAgent`**. Để não bật thì lính vừa
chạy tới đánh giáp lá cà vừa nã pháo — hai chủ cùng lái một cái thân, và kiểu chơi "đứng yên
tính đường đạn" biến mất mà không có gì báo.

⚠ **Tay nghề ba khẩu phải KHÁC NHAU** (`learnRate` 0.45 / 0.60 / 0.75): 0.45 thì bốn năm phát
mới chụm, 0.75 thì phát thứ hai đã sát. Ba khẩu cùng mức thì "dọn khẩu nào trước" là tung đồng
xu — người chơi mất hẳn một quyết định.

⚠ **Vũ khí là LỰU ĐẠN**, vì chỉ `Explosion.Detonate` mới khoét được đất. Điền công thức JSON
thì khai `weapon: 8`; cầm kiếm thì pháo thủ vung kiếm vào không khí suốt ván.

## 1. ⚠⚠ LÕM ĐẤT LÀ CÔNG TẮC TOÀN CỤC DO **NGƯỜI DÙNG** TẮT

`TerrainGround.CratersEnabled = false` — ghi rõ trong file đó là *"tạm ẩn theo ý người dùng
(2026-09-05)"*, **không phải vì tính năng chưa xong**: `Deform` · `Rebuild` mesh + collider ·
`LaneNav.MarkDirty` · trần sâu `MaxCraterDepth = 0.55` (đủ nông để leo ra) đều đã có.

⚠⚠ **Đừng lật công tắc ở mức dự án.** Mode nào cần thì BẬT TRONG VÁN CỦA MÌNH rồi TRẢ LẠI đúng
giá trị cũ — cùng họ với `Physics2D.gravity` (`WorldPlane`) và `Time.timeScale`
(`MatchMutators`). Lật toàn cục là đổi luật của 40 mode kia sau lưng người dùng.

⚠ Nhớ giá trị cũ **đúng một lần** (`_cratersTouched`): gọi hai lần mà nhớ lại lần hai là nhớ
đúng cái mình vừa đặt ⇒ trả về `true` ⇒ mọi map sau đó lõm đất vĩnh viễn. Đúng bẫy của
`WorldPlane.Enter`.

⚠ Trả lại ở **CẢ** `OnFinished` **LẪN** `OnDestroy`: ván có thể kết thúc mà object còn sống
(màn hình kết quả), và cũng có thể bị huỷ giữa chừng (đổi scene) mà `OnFinished` không chạy.

## 2. Chỉ VỤ NỔ mới khoét được đất

`Explosion.Detonate` → `TerrainGround.TryCrater`. Mũi tên/đạn thường **không** khoét.

⚠ Dựng màn đấu pháo bằng CUNG thì bản đồ không đổi một ly và toàn bộ lý do tồn tại của kiểu
chơi biến mất — không lỗi nào báo. `Demo_80` dùng **lựu đạn** cho cả hai bên.

## 3. Pháo thủ máy: BẮN → NHÌN → SỬA, không giải phương trình

Giải góc bắn đúng cần TỐC ĐỘ RỜI NÒNG, mà nó nằm riêng tư trong `RangedWeapon`
(`_minSpeed`/`_maxSpeed` × cấp rèn × lực tích). Một AI đọc thẳng số bên trong vũ khí thì đổi vũ
khí là AI sai mà không lỗi nào báo.

Bắn-rồi-sửa không cần biết gì: phát 1 ước lượng thô → đo chỗ rơi → nhích điểm ngắm theo độ lệch
× `_learnRate` → phát 2 gần hơn → phát 3 thường trúng. Và nó **đúng về cảm giác**: người chơi
thấy loạt đạn địch bò dần về phía mình — nhịp căng của một trận đấu pháo thật, thứ mà một phát
trúng ngay từ đầu không có.

⚠ `_learnRate` **là cả thang độ khó** (0.45 = bốn năm phát mới chụm · 0.75 = phát thứ hai đã
sát). Ba khẩu ba mức khác nhau để người chơi luôn có một khẩu "đáng sợ hơn" đáng dọn trước;
ba khẩu cùng mức thì chọn mục tiêu là tung đồng xu.

⚠ `Observe` phải được gọi **trước khi sang lượt**: bỏ vế đó thì phát nào cũng là phát đầu tiên
và loạt đạn không bao giờ bò tới gần.

⚠ Chặn hai đầu cho `_correction`: một cú đo hỏng (đạn nổ ngay đầu nòng vì vướng đồng đội) không
được đẩy pháo thủ vào trạng thái bắn thẳng lên trời mãi mãi.

## 4. Nhịp lượt

`PlayerAim` (đợi CÓ ĐẠN trên sân) → `PlayerShot` (đợi đạn biến mất) → `EnemyAim` → `EnemyShot`
→ quay lại. **Không có đồng hồ ép trong lượt người chơi**: đây là kiểu chơi theo lượt, ép giờ
là biến nó thành một mode phản xạ khác.

⚠ Mỗi phát có `_shotTimeout` (8 s): một quả đạn kẹt trong khe đá không được treo cả ván.

⚠ Dò đạn bằng `FindObjectsByType` **mỗi 0.2 giây**, không mỗi frame — kiểu chơi theo lượt nên
không ai thấy độ trễ, còn quét mỗi frame là đúng khoản chi phí `Performance.md` gọi là
«tìm object mỗi nhịp».

## 5. Bộ dựng màn

⚠ **Đồi CAO** (biên độ 1.4): bắn cầu vồng chỉ có nghĩa khi giữa hai bên có thứ CHẮN. Sân phẳng
thì đường đạn tối ưu là đường thẳng và cả kiểu chơi rút về "ai bấm nhanh hơn".

⚠ Pháo thủ máy **tắt `StickmanAgent`**: mode là chủ duy nhất. Để não chạy thì giữa lượt chúng
tự bò sang đánh giáp lá cà — và một trận đấu pháo mà hai bên đi bộ tới ôm nhau thì không còn là
đấu pháo.
