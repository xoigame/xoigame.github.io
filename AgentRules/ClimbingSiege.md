## THANG CÔNG THÀNH · TRÈO TƯỜNG · MÁY CÔNG THÀNH

`SiegeLadder` · `SiegeEngine` · `AIStateEscalade` · `StickmanFallDamage`. Sân test:
**`Demo_34_Escalade`** (`Fortifications > 2`). Sáu điều cần nhớ:

1. **THANG LÀ `Fortification`** — công trình DUY NHẤT thuộc phe TẤN CÔNG. Kế thừa để có máu +
   lọt radar AI + ăn damage qua đường sẵn có; viết class mới là chép lại cả ba thứ đó.
   `FortKind.SiegeLadder`.
2. **ĐỔ THÌ HẤT NGƯỜI XUỐNG** (`DropRiders`) — và phải làm **TRƯỚC** khi tắt vùng leo:
   `StickmanLocomotion` chỉ tự buông khi thấy mình ra khỏi vùng, mà vùng đã biến mất thì nó
   không còn gì để so — người trèo treo lơ lửng với trọng lực vẫn đang tắt. Quét
   `TeamMember.All` chứ ĐỪNG giữ danh sách người đang bám (phải bắt đủ mọi đường rời thang).
   ⚠ **HƯỚNG ĐỔ phải ép RA XA TƯỜNG** (`_toppleDirection`, builder truyền −1 khi tường ở +X):
   đổ theo hướng đòn thì tên phe thủ bắn từ mặt tường quật cái thang XUYÊN QUA khối tường —
   sprite không có vật lý nên nó nằm vắt lơ lửng giữa sân, nhìn như "cầu thang ma" (đã dính).
   Kèm bug dấu: Euler z DƯƠNG là quay NGƯỢC kim đồng hồ (đỉnh ngã về −X) — bản cũ nhân thẳng
   `Sign(directionX)` nên thang luôn đổ NGƯỢC hướng đòn.
2b-dapnha. ⚠⚠⚠ **ĐÁNH CÔNG TRÌNH LÀ MỘT LỐI ĐÁNH KHÁC — `MeleeCombatStrategy.UpdatePosition`
   TỪNG KHÔNG CÓ NHÁNH NÀO CHO NÓ** (2026-09-04: *"AI team tấn công cứ nhấp nhử ở cổng thành,
   không dám tấn công quyết liệt"*).

   Cả hàm giữ-vị-trí của cận chiến viết cho một ĐỐI THỦ BIẾT VUNG:
   **né đòn** · **vòng ra sau lưng** · **giữ TẦM ƯU THẾ** (đứng ngoài tầm với của nó) ·
   **đánh xong lùi lấy nhịp** · **dính chùm thì lùi**. Áp nguyên bộ đó lên một CÁI CỔNG thì ra
   đúng chữ người dùng dùng: vào đập một nhát, lùi ra lấy tầm đẹp, vào lại, lùi ra. Cái cổng
   thì đứng yên, không đỡ, không đánh trả — và nó CHÍNH LÀ đường thắng của màn.

   ⚠⚠ **VÀ NÓ VỪA TỆ ĐI VÌ MỘT BẢN VÁ KHÁC CỦA CHÍNH NGÀY HÔM ĐÓ**: `FlankCommitFloor`
   (§2e-quet) bật vòng-sau-lưng cho cả dự án, nên mọi người trừ đứa gần nhất bỏ ra "vòng ra sau
   lưng" cái cổng — mà sau lưng nó là BÊN TRONG LÀNG, chỗ họ chưa vào được, và mỗi lượt vòng
   cam kết 2.4 giây. Bài học: **bật một hành vi cho "cả dự án" thì phải soát xem nó có nghĩa gì
   với những loại MỤC TIÊU không phải người.**

   Chốt: một nhánh riêng đặt TRƯỚC mọi luật khác (trước cả chúc-giáo-chống-kỵ và lính khiên —
   hai luật đó cũng nói về kẻ địch biết ra đòn):

   > Mục tiêu KHÔNG phải `StickmanFighterController` → áp vào `MaxRange × 0.85` rồi ĐỨNG ĐÓ mà
   > đập. Không né, không vòng, không lùi.

   `0.85` chọn để nằm ngoài TẦM HỤT của mọi vũ khí (`_minRangePercent` cao nhất là 0.62), nếu
   không thì giáo dài đứng sát cổng sẽ đâm hụt và `ShouldAttack` từ chối vung — lại một vòng
   nhấp nhử nữa, lần này im lặng hoàn toàn.
   ⚠ `TryFlank` có thêm chốt thứ hai, cố ý thừa: nó là `protected` nên lối đánh khác gọi được.

2b-batpha. ⚠⚠⚠ **CÔNG TRÌNH LÀ ĐỊA HÌNH HAY LÀ MỤC TIÊU — `Fortification._indestructible`**
   (user chốt 2026-09-04: *"tôi không muốn nó là công trình có thể bị phá hủy, chỉ có cổng
   thành và nhà chính là bị phá hủy được; cầu thang dựng lên rồi cũng không phá hủy được"*).

   `Fortification` gộp HAI vai vào một class: **luật ĐI XUYÊN** (ai được qua chân tường) và
   **mục tiêu CÓ MÁU**. Bức tường làng cần vai thứ nhất và không cần vai thứ hai — nhưng vì
   dính chung class nên nó có 110 máu, và bảng chấm điểm của AI nhìn thấy một mục tiêu hợp lệ
   nằm chình ình giữa đường.

   ⚠⚠ **ĐÃ VÁ BA LẦN Ở BẢNG ĐIỂM VÀ CẢ BA ĐỀU CHỈ BỊT ĐƯỢC MỘT CỬA**: `LivingFirstPenalty`
   (người trước, nhà sau) → bỏ qua `PassableForEveryone` → bỏ qua `FortKind.Wall`. Mỗi lần
   người dùng lại báo *"nó vẫn đánh cái tường"*, vì cửa thứ tư mở ra ở chỗ khác. Chữa ở GỐC là
   **bỏ máu đi**: không có gì để mất thì không còn cửa nào cả.

   | Còn phá được | Vì sao |
   |---|---|
   | **CỔNG** | phá xong là MỞ ĐƯỜNG — nằm trong điều kiện thắng |
   | **ĐÌNH LÀNG** | đích của trận |
   | tường · tháp · thang công thành | phá xong KHÔNG mở được gì và không cộng điểm nào |

   ⚠ Không đi theo đường của `CreateWatchtower` (không gắn `Fortification` gì cả): tường CẦN
   luật đi xuyên, mà luật đó sống trong chính class này. Một cờ là đủ.
   ⚠ Ba chỗ phải hỏi cờ, thiếu chỗ nào cũng còn triệu chứng cũ: `TakeDamage` (bỏ qua sát
   thương) · `ProbeObstacle` (đừng nhận làm vật cản — đập một thứ không có máu là đứng đó tới
   hết trận, mà `IsBreakingObstacle` còn có CAM KẾT nên nó bám luôn) · `SelectBestEnemy`.

   **THANG CÔNG THÀNH cũng không phá được** (`SiegeLadder.IsIndestructible => true`). Cách
   chặn nó nay là **GIẾT NGƯỜI VÁC**: thang rơi tại chỗ, ai khác phải đi tới đúng chỗ đó mà
   nhặt. Đó là một pha chơi đọc được — có một người cụ thể để nhắm, và mất thang là mất công
   đi lại chứ không mất hẳn.
   ⚠ Đánh đổi, ghi rõ để đừng đi tìm: `AIProfile.ladderTargetBonus` (phe thủ ưu tiên bắn gãy
   thang) từ nay VÔ TÁC DỤNG, và `DropRiders`/`BeginTopple` hết đường chạy vì chúng treo ở
   `OnDeath`. Muốn trả lại cơ chế đó thì bỏ dòng override, đừng đi sửa bảng điểm.

2b-vacthang. **VÁC THANG THÌ ĐI CHẬM VÀ KHÔNG LEO ĐƯỢC** (`StickmanLocomotion.SetCarryLoad`,
   `SiegeLadder.CarrySpeedScale` = 0.62).
   · **Ô TỐC ĐỘ RIÊNG**, đúng tiền lệ `SetStatusSlowdown` · `SetEncumbrance` ·
     `SetActionSlowdown` · `WoundedScale` (§5c-move): nhét chung ô là buông thang xong bộ giáp
     cũng hết nặng.
   · **KHÔNG LEO ĐƯỢC** (`EnterClimb` trả false khi `IsCarryingLoad`) — đây là LUẬT chứ không
     phải thẩm mỹ: hai tay đang ôm một cây thang dài hơn thân người. Bỏ vế này thì người vác
     trèo tót lên tháp canh cùng cây thang, trong khi việc của họ là KHIÊNG NÓ TỚI CHÂN TƯỜNG.
   · Ghi lại tải MỖI FRAME trong `UpdateCarry` chứ không chỉ lúc nhấc: người vác có thể vừa
     hồi sinh, hoặc bị hệ khác ghi lại ô tốc độ. Gỡ tải ở CẢ BA đường ra (`Drop` · `PlantAt` ·
     người vác chết) — quên một đường là ai đó đi chậm 62% tới hết trận mà không hiểu vì sao.

2b-dungsan. ⚠⚠⚠ **`plantedOnStart` LÀ TRẠNG THÁI, KHÔNG PHẢI VỊ TRÍ** (2026-09-04 —
   *"team công thành phải lấy thang tấn công thành, hiện tại AI cứ leo lên leo xuống cái thang
   ở ngoài này"*).

   `SiegeLadder.SetPlanted` chỉ **bật vùng leo TẠI CHỖ**; nó KHÔNG dời cây thang tới `plantX`.
   Nên `plantedOnStart: true` trên một cây sinh ở trại cướp (x −20) = **một cái thang trèo được
   dựng giữa đồng trống, cách tường 14 đơn vị**. Quân cướp nhắm cung thủ trên mặt tường (mục
   tiêu ở TẦNG KHÁC) thấy ngay một vùng leo sát bên → trèo lên 2.6 đơn vị → trên đó KHÔNG CÓ GÌ
   → tụt xuống → lại trèo. **Không lỗi nào báo**: đó là một vùng leo hoàn toàn hợp lệ.

   ⚠ Muốn có thang dựng sẵn ở chân tường thì phải **SINH NÓ NGAY TẠI `plantX`**, đừng bật cờ ở
   chỗ nó được sinh ra.

   ⚠⚠ Và cái cờ đó được bật vì một TIỀN ĐỀ ĐÃ HẾT ĐÚNG: *"tường ĐẶC nên thang là lối vượt duy
   nhất, chờ vác là cả toán kẹt ở chân tường"*. Tường nay khai `passableForEveryone` — phe công
   đi bộ xuyên qua chân tường được, chốt chặn thật là CÁI CỔNG. **Bỏ một tiền đề thì phải đi
   soát lại mọi thứ đã dựng lên trên nó**, không thì cái giá ở lại còn lý do thì đi mất.

2b. **THANG ĐƯỢC KHIÊNG TỚI, KHÔNG DỰNG SẴN** (hai màn công/thủ thành): thang sinh CHƯA DỰNG
   ở phía trại công (`plantedOnStart: false` + `plantX` = chỗ dựng trong dải sàn gỗ), lính
   `Escalade` tự **XÍ CHỖ → ĐI TỚI → VÁC LÊN VAI → KHIÊNG TỚI `PlantX` → DỰNG** (hai pha mới
   trong `AIStateEscalade`; dáng khiêng = `StickmanBodyAnimator.SetCarrying` → clip `Carry`).
   · **KHÔNG parent thang vào nhân vật** — root nhân vật scale 0.25, parent vào là thang co
   còn 1/4 (bẫy `localScale`); thang tự bám theo người khiêng mỗi frame (`UpdateCarry`).
   · **Người vác chết là thang RƠI TẠI CHỖ**, ai khác nhặt khiêng tiếp — không teleport về trại.
   · "Xí chỗ" (`TryReserve`) hạn NGẮN + gia hạn mỗi tick: người xí chết giữa đường thì thang
   tự mở cho người khác, không ai phải dọn.
   · **Phe thủ ưu tiên bắn thang** qua `AIProfile.ladderTargetBonus` (ô điểm RIÊNG, mặc định
   +5): `structureTargetBonus` mặc định −6 là đúng cho nhà/tháp nhưng áp luôn cho thang thì
   phe thủ NÉ chính thứ đang bắc lên tường nhà mình. `SiegeLadder` nhận diện bằng kiểu class
   trong `ScoreStrategicTarget`, KHÔNG đi nhánh structure chung.
3. **ĐỘ CAO PHẢI CÓ GIÁ** — `StickmanFallDamage` (component rời, nghe event `Landed`, đúng
   khuôn `StickmanFootsteps`). Không có nó thì nhảy từ đỉnh tháp y hệt bước xuống bậc thềm, và
   mọi thứ dựng theo chiều dọc mất hẳn vế "trèo lên là mạo hiểm".
4. **`AIStateEscalade` KHÁC `AIStateGarrison`** dù leo cùng cái thang: Garrison leo lên chốt
   CỦA MÌNH để ĐỨNG LẠI bắn (giữ suất, bám suất); Escalade leo lên chốt CỦA ĐỊCH để GIÀNH nó —
   **lên tới nơi là BUÔNG THANG** và đánh như lính thường. Nhồi hai ý vào một class bằng cờ
   `isAttacker` thì mỗi nhánh `if` lại phải hỏi lại cờ ấy.
   ⚠ `OwnsTraversal` khi đang trèo là BẮT BUỘC (cùng bài học Garrison: pipeline có luật "hết
   địch thì buông thang", mà người đang trèo lúc chưa ai thấy thì đúng là chưa có địch).
   ⚠ Không tìm được thang thì **đánh như lính thường**, đừng đứng chờ — không có vế đó là cả
   cánh quân chôn chân dưới chân tường vì cái thang không bao giờ tới.
5. **MÁY CÔNG THÀNH CẦN TỔ VẬN HÀNH** (`_crewNeeded`) — vế cân bằng quan trọng nhất. Máy tự
   chạy thì phe công dựng máy xong đứng nhìn; bắt phải có người đứng cạnh thì phe thủ có ĐƯỜNG
   THỨ HAI để vô hiệu hoá nó (giết tổ), và cả hai bên đều có lý do dồn quân về chỗ cái máy.
   Đếm bằng `QueryNear` theo nhịp, KHÔNG bằng trigger + danh sách.
   ⚠⚠ **VÀ ĐƯỜNG THỨ HAI ĐÓ TỪNG CHỈ TỒN TẠI CHO NGƯỜI CHƠI.** AI không có cách nào biết ai
   đang là TỔ MÁY — `SiegeEngine` không có sổ đăng ký, `_crewRadius` không lộ ra ngoài, nên
   trong trận máy-đấu-máy cái vế cân bằng "quan trọng nhất" của cỗ máy chưa bao giờ được dùng.
   Nay có `SiegeEngine.AllEngines` + `CrewRadius` + `NeedsCrew`, và `AIProfile.siegeCrewBonus` (5)
   cộng ưu tiên cho địch đang đứng vận hành.
   ⚠ Chỉ cộng cho máy **CÒN SỐNG** và **CÓ ĐÒI TỔ**: máy `_crewNeeded = 0` tự chạy nên giết tổ
   chẳng đổi được gì — cộng điểm ở đó là lừa cả cánh quân đi làm việc vô ích.
   ⚠ **Xe phá thành CHỈ đánh CÔNG TRÌNH.** Cán cả bộ binh thì nó thành xe tăng bất khả chiến
   bại và cả trận thành "ai có xe thì thắng".
   ⚠ Hitbox máy để **TRIGGER**: đặc thì `UpdateBlockedPath` coi nó là vật cản và cả cánh quân
   đứng lại đập chính cỗ máy của phe mình.
6. **Scene test phải dựng tường LIỀN MẠCH, KHÔNG CỔNG.** Có cổng thì `UpdateBlockedPath` dẫn cả
   cánh quân về đập cổng và cái thang không bao giờ được dùng tới — bài test nói dối.

*Chết khi đang leo thì xác tự rơi* — đã có sẵn ở `StickmanLocomotion.FixedUpdate`
(`if (IsDie && IsClimbing) ExitClimb()`), ragdoll rơi bằng physics của chính nó.

