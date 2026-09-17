## GỤC NGÃ & CỨU VIỆN (`StickmanDowned` + `AIRescueModule`)

Đòn chí mạng KHÔNG giết ngay: nhân vật GỤC XUỐNG, nằm đếm ngược `_bleedOutTime`, đồng đội
đứng cạnh đủ lâu thì đỡ dậy; hết giờ mà không ai tới mới chết thật.

Vì sao đáng có: trước đây mỗi mạng là một sự kiện TỨC THÌ và không đảo ngược được — người
chơi không có quyết định nào để ra, đồng đội gục thì chẳng khác gì cái xác. Một khoảng "chưa
chết hẳn" đẻ ra cả một lớp quyết định mới cho cả người lẫn AI: **bỏ mặc để giữ tuyến, hay lao
vào cứu và hở sườn?**

⚠⚠ **KHÔNG ĐƯỢC ĐẢO NGƯỢC FLOW CHẾT.** Đây là chỗ dễ làm sai nhất, và luật đã có sẵn ở hệ hồi
sinh: *"SINH NGƯỜI MỚI, KHÔNG DỰNG XÁC DẬY"*. Flow chết tắt `simulated` của root, tháo
`*Ragdoll` sang nhóm khác, tắt nhóm `Sprite`, tắt loạt script per-frame, hẹn giờ đóng băng +
dọn xác. Dựng dậy = chép lại nửa flow chết theo chiều ngược, và mỗi lần ai đó thêm một bước
vào flow chết là phải nhớ thêm một bước vào đây.
Nên hệ này nằm **TRƯỚC** cái chết: `StickmanController.TakeDamage` hỏi `TryGoDown` NGAY TRƯỚC
nhánh `_isDie = true`, máu giữ ở một tia, và người đó bị **QUẬT NGÃ** bằng đúng cơ chế sẵn có
(`StickmanStatus.TryKnockdown` → `IsIncapacitated` khoá cả pipeline AI lẫn tầng đọc input).
Không một dòng nào của flow chết bị đụng; hết giờ thì gọi `Die()` và mọi thứ chạy y như cũ.
⚠ Hỏi ở `TakeDamage`, KHÔNG nghe event `Died` — nghe `Died` là đã muộn.

Bốn chốt chặn:
· **MIỄN NHIỄM SAU KHI ĐƯỢC CỨU** (`_reviveImmunity`) — không có thì hai ông búa thay nhau
  quật là gục lại ngay giây sau (cùng lý do `StickmanStatus._knockdownImmunity`);
· **GỤC LẦN THỨ N THÌ CHẾT LUÔN** (`_maxRevives` 2) — bất tử qua cứu viện là trận không bao
  giờ kết thúc, mà "trận phải có kết cục" là luật của cả dự án;
· **NHIỀU NGƯỜI ĐỠ THÌ NHANH HƠN NHƯNG KHÔNG TUYẾN TÍNH** (`√n`) — tuyến tính là cả tiểu đội
  xúm vào cứu tức thì và không ai còn phải chọn "cứu hay giữ tuyến";
· **Người đang gục KHÔNG rời `TeamMember.All`** — trọng tài đếm quân sống bằng đó, gỡ ra là
  "diệt sạch địch" bắn sớm trong khi nửa số họ đang chờ đỡ dậy.

`AIRescueModule` (module thứ 10, `AIProfile.rescueRadius` mặc định 0 = tắt) là vế AI: bốn chốt
— đang giáp lá cà thì thôi · MỘT người cứu MỘT người (sổ xí phần STATIC, chung cả sân) · có
cam kết `rescueCommit` · bán kính hẹp (6..9) để lính không bỏ tuyến chạy nửa map.

⚠⚠ **VÀ ĐÓ MỚI LÀ MỘT NỬA — CÒN VẾ ĐỊCH.** Hệ này đẻ ra một LOẠI MỤC TIÊU MỚI mà bảng chấm
điểm chưa từng biết tới, và để nguyên thì nó hỏng theo hướng tệ nhất: người gục còn đúng MỘT
TIA MÁU, nên `finishWoundedBonus` đạt mức TỐI ĐA ⇒ **cả tiểu đội bỏ kẻ đang vung kiếm vào mặt
mình để đi đâm một cái xác nằm im**, và hệ cứu viện chết yểu vì không ai kịp được đỡ dậy lần
nào. Không lỗi nào báo — mọi hàm đều chấm đúng công thức của nó.

Luật: **kẻ đang nằm KHÔNG phải mục tiêu quân sự** (`downedTargetPenalty` = 5) — nó không đánh
trả được, và không ai tới đỡ thì tự hết giờ. **TRỪ KHI đang có người đỡ nó dậy thật**
(`finishDownedBonus` = 7, đọc `StickmanController.ReviveProgress > 0`): lúc đó nó là thứ đáng
giá nhất trên sân trong vài giây. Cú tranh giành ấy CHÍNH LÀ phần đáng xem của hệ cứu viện —
địch đổ về cái xác đúng lúc thầy thuốc chạm vào.
⚠ Kẻ đang gục phải **BỊ LOẠI khỏi `finishWoundedBonus`**, không thì hai ô điểm cộng dồn và ô
kia nói dối về mọi thứ khác (nó luôn "thương nặng nhất sân").
⚠ Đọc `ReviveProgress` chứ ĐỪNG quét đồng đội quanh nó: `StickmanDowned` đã đếm số người đang
đỡ mỗi frame rồi, mà vòng chấm điểm chạy cho MỌI ứng viên.


### BẬT GỤC-CHỜ-CỨU CHO MỘT MÀN LÚC CHẠY (2026-09-08, battle royale)

`StickmanDowned` **không nằm sẵn trên prefab** — màn nào muốn có thì tự gắn. `MapBattleRoyale.
EnableDownedForSquads` là khuôn mẫu đúng, ba vế:

1. `AddComponent<StickmanDowned>()` rồi `Configure(bleedOutTime, reviveSeconds, maxRevives)`.
   Gắn lúc chạy vẫn ăn vì `StickmanController` tra `_downed` LƯỜI ngay trong `TakeDamage`.
2. Mở `AIProfile.rescueRadius` (mặc định 0 = module tự tắt) trên **BẢN SAO** profile —
   `Instantiate(source)` rồi `agent.SetProfile(tuned)`, một bản cho MỖI profile gốc. Sửa thẳng
   asset là mọi scene khác cũng có lính bỏ tuyến đi cứu nhau, và trong Editor thì file bị ghi bẩn.
3. Bộ điều phối của màn phải KÉO ĐỒNG ĐỘI VỀ chỗ người gục (dời cột mốc). `AIRescueModule` chỉ
   lo phần "đứng cạnh đủ lâu"; nó không kéo cả tổ đi nửa map, và `rescueRadius` cố ý hẹp.

⚠⚠ **CHỈ BẬT KHI CÓ ĐỒNG ĐỘI.** Ở chế độ chơi ĐƠN (mỗi người một phe) thì không ai cứu được ai,
nên "gục" chỉ là một khoảng nằm chờ chết dài thêm — vừa nhạt vừa kéo ván dài vô lý. Đây là thứ
làm chế độ TỔ khác chế độ ĐƠN về CHẤT, không phải chỉ đông người hơn.
