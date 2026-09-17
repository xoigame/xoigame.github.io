## Công sự (Assets/Scripts/Combat/Structures/Fortification.cs + AI/GarrisonPost.cs)

Vật cản chặn đường · tường thành + cầu thang · tháp canh cho cung thủ trấn thủ · thợ xây và SỬA.

### ⚠ CÔNG TRÌNH BẮT LỬA (2026-09-07) — `IFlammable`

Rào chắn · thang công thành **CHÁY**; tường thành · tháp canh là **ĐÁ nên KHÔNG**.

⚠⚠ **CỔNG THÀNH KHÔNG CHÁY THEO MẶC ĐỊNH**, dù nó làm bằng gỗ thật — và đây là chỗ dễ sai nhất
vì cái sai nghe rất hợp lý. Cổng là **MỤC TIÊU của cả trận công thành**: cho nó cháy từ xa là một
tuyến cung đứng ngoài tầm với thắng trọn màn, và máy công thành · thang · đội phá cửa · học thuyết
công-thủ mất sạch lý do tồn tại — mà nhìn vào không ra "lỗi", chỉ ra "màn này dễ quá". Map nào MUỐN
cổng cháy thì khai `FlammableRule.Always` trên chính cái cổng đó.
Quyết theo `FortKind` ngay trong code (`Fortification.FlammableByKind`, ô Inspector để `Auto`) chứ
không bắt builder khai tay — khai tay thì builder nào quên là công trình đó không bao giờ cháy, mà
nhìn vào không phân biệt được với "cố ý làm bằng đá".

⚠ **`IFlammable` KHÁC `IRangedDamageImmune`, đừng gộp.** Mũi tên thường vẫn KHÔNG trừ máu công
trình nào (giữ nguyên luật cũ, không thì một tuyến cung hạ được thành mà chẳng cần máy công thành);
mũi tên **LỬA** thì không đến để trừ máu — nó CHÂM LỬA, và lửa trừ máu theo đồng hồ của chính công
trình. Bắn dồn bao nhiêu mũi cũng chỉ **gia hạn** một đám cháy. Luật đầy đủ + bảng cây nào châm được
lửa: [Weapons.md](Weapons.md) mục *CẤP VẬT LIỆU 0–5 · KIỂU RÈN · TÊN LỬA*.
Chi tiết: `Docs/KnowledgeBase/Fortifications.md`. Năm điều cần nhớ:

1. **Công trình VẪN LÀ `StickmanController`** (`Fortification : DestructibleTarget`) nên máu ·
   damage · chọn mục tiêu · effect · âm thanh đi đúng đường có sẵn — KHÔNG dựng hệ thứ hai.
   Khác `BaseBuilding` ở chỗ collider **KHÔNG trigger**: rào phải cản chân thật, không thì
   "phá mới đi tiếp" chỉ là lời nói. `FortKind`: Barricade · Gate · Wall · Tower.
   **Phe −1 = TRUNG LẬP** (không gắn `TeamMember`) → `AreEnemies` trả true cho cả hai phe nên
   ai cũng phải phá.
2. **BỊ CHẶN THÌ ĐẬP — NHƯNG CÔNG THÀNH KHÔNG PHẢI LÀ ĐỤC TƯỜNG** (`StickmanAgent.
   UpdateBlockedPath`): bắn tia theo `Locomotion.Steer` (Ý ĐỊNH đi, không phải vận tốc — dí
   vào tường thì vận tốc bằng 0 mà ý định vẫn còn), trúng công trình không phải phe mình thì
   nhận làm mục tiêu. Nhận diện bằng "**là `StickmanController` mà KHÔNG phải người**", ĐỪNG
   liệt kê class (bài học `BaseBuilding`).
   ⚠ Hai vế bắt buộc: chạy **TRƯỚC `UpdateRetarget`**, và `UpdateRetarget` **thoát sớm khi
   `IsBreakingObstacle`** — kẻ "đáng đánh hơn" luôn là thằng đứng BÊN KIA rào, đổi mục tiêu
   sang nó là quay ra quay vào mãi trước cái rào.
   Van gỡ kẹt cũ KHÔNG lo được việc này: nó chỉ biết xông liều / chốt hướng = dí mặt vào rào
   mạnh hơn.
   ⚠⚠ **HAI NGOẠI LỆ, thiếu cái nào cũng ra "AI đục tường thành"** (rà 2026-09-02):
   · **Công trình SẼ CHO MÌNH ĐI XUYÊN thì không phải vật cản** — `ProbeObstacle` hỏi
     `Fortification.WouldLetThrough` trước khi nhận mục tiêu. Raycast KHÔNG biết gì về
     `Physics2D.IgnoreCollision` (đó là chuyện của va chạm, không của query), nên tường
     `passableForEveryone` của map sinh vẫn bị tia chạm — và cả cánh quân đứng ĐẬP một bức
     tường mà chân họ đi xuyên qua được. Không lỗi nào báo.
   · **Tường có MẶT TRÊN ĐI ĐƯỢC + có CẦU THANG leo được từ PHÍA MÌNH → LEO QUA, đừng đập**
     (`FindStairsOver` → cam kết `ClimbRouteCommit` 2.5s → `RequestStairsIfNeeded` lái tới
     chân thang). Tường là ĐỊA HÌNH CAO cho hai bên giành nhau, không phải cục máu để cả cánh
     quân đứng gặm. Vế "cùng phía" là bắt buộc: nhận cái thang bên KIA tường làm đường là AI
     đi tìm cách xuyên tường tới chân thang — quay lại đúng chỗ kẹt. CỔNG (`walkableTop =
     false`) vẫn đập như cũ — phá cổng là đường công thành chủ lực, và `ScoreStrategicTarget`
     cộng thêm +2 cho `FortKind.Gate` để quân công ưu tiên cổng hơn khúc tường gần nhất.
2b. **CỔNG NHÀ MÌNH THÌ TỰ MỞ** (`Fortification._passableForOwner`, `CreateGate` bật sẵn):
   quân CÙNG PHE đi xuyên qua cổng, địch vẫn bị chặn và phải đập.
   Vì sao bắt buộc: game đi ngang chỉ có **MỘT LÀN**. Một cái cổng đặc nằm giữa làn đó chặn
   đều tay cả chủ nhà — người chơi đứng trong trại của chính mình mà không ra được, phải chém
   vỡ cổng nhà mình mới đi tiếp (đã dính ở scene zombie thủ trại, nơi cổng để phe −1).
   · Làm bằng `Physics2D.IgnoreCollision` theo TỪNG CẶP collider, **không** tắt collider —
   sập mới tắt hẳn (`_openWhenRuined`), và lúc đó ai cũng qua được.
   · **QUÉT TRƯỚC theo bán kính**, đừng chờ `OnCollisionEnter2D`: chờ chạm rồi mới bỏ qua là
   mất một nhịp vật lý, lính KHỰNG một cái ở cửa và cả tiểu đội đi qua thì lộ rõ.
   · ⚠ **Phải THU HỒI khi ai đó ĐỔI PHE** (`RevokeStalePasses`). `IgnoreCollision` là trạng
   thái BỀN theo cặp — cấp rồi là cấp mãi, nên kẻ vừa quay giáo vẫn đi xuyên cổng nhà cũ mà
   không có lỗi nào báo.
   · ⚠⚠ **ĐANG ĐỨNG TRÊN NÓC thì KHÔNG cấp quyền xuyên — và đã cấp thì THU HỒI.** Tường thành
   `passableForOwner` có mặt trên ĐI ĐƯỢC: quyền "đi xuyên" là cho người đứng BÊN CẠNH, còn
   người đứng TRÊN thì chính collider đó là đất dưới chân — cấp là cung thủ nhà vừa leo cầu
   thang lên tới mặt tường RƠI XUYÊN QUA tường, rơi rồi leo lại, quay vòng mãi không lỗi nào
   báo (đã dính ở Demo_25 thủ thành). `ScanPassableUnits` chặn theo `WalkableTopY - 0.45`
   (phủ luôn mấy bậc thang trên cùng để va chạm được trả TRƯỚC khi đặt chân lên nóc).
   · ⚠ Công trình TRUNG LẬP (phe −1, không `TeamMember`) không có "quân nhà" nào nên vẫn chặn
   tất — đúng ý đồ của vật cản giữa đường.
   · ⚠ Đổi cổng từ trung lập sang CÓ PHE còn được thêm một thứ: **thợ phe đó vá được cổng**,
   thứ mà cổng trung lập không cho.
2c. **CÓ ÁO ART thì phải nháy hư hại lên ART.** `StructureSkin` TẮT renderer khối vuông cũ,
   nên `DestructibleTarget` mà cứ lấy renderer đầu tiên (khối vuông trên root) thì vệt đỏ báo
   sắp sập và hình đổ nát khi sập đều vẽ vào một renderer VÔ HÌNH — người chơi đập tường mà
   không thấy nó suy suyển gì, tưởng vũ khí không ăn. `Awake` hỏi `StructureSkin.ArtRenderer`
   trước, không có mới rơi về renderer thường.
3b. **CẦU THANG CÓ HAI CHẾ ĐỘ: ĐI XUYÊN QUA hoặc LEO LÊN** (`StickmanStairs` trên root dãy bậc).
   Dãy bậc là các khối ĐẶC chạy từ mặt đất lên mặt bậc, nên **nhìn từ phía ĐỈNH nó là một BỨC
   TƯỜNG** — game đi ngang chỉ có MỘT LÀN, đi ngược lại là dí mặt vào đó đứng mãi (`TryStepUp`
   từ chối vì `rise > _stepHeight`, mà bậc thang không phải `Fortification` nên cũng không có
   gì để đập). Chữa bằng `Physics2D.IgnoreCollision` THEO TỪNG CẶP — đúng khuôn
   `Fortification._passableForOwner`: cùng một cái thang, người này đi xuyên còn người kia vẫn
   leo. ĐỪNG tắt collider (tắt là hết leo được, mà leo lên mặt tường mới là lý do nó tồn tại).
   ⚠⚠ **ĐI XUYÊN LÀ MẶC ĐỊNH, LEO LÊN PHẢI ĐÒI.** Bản đầu để NGƯỢC LẠI ("bậc trước mặt bước
   lên được thì đặc"), nghe hợp lý nhưng nghĩa thật là **đi ngang qua chân cầu thang là bị nhấc
   lên nóc tường**: người chơi chỉ định đi tiếp thì tự nhiên thấy mình đứng trên tường thành và
   không có đường xuống — đúng câu *"bị kẹt ở cầu thang"*; AI thì cả tiểu đội trèo lên đi trên
   nóc thay vì đi thẳng qua. Nay `Auto` hỏi NĂM câu: chế độ ép tay → đang ĐỨNG TRÊN thang (luôn
   đặc, cho xuyên lúc đó là rơi thẳng xuống đất) → xin LÁCH QUA GẦM → đang ĐÒI LEO → còn lại
   thì hỏi hình học: không có bậc nào chắn trước mặt = **đặc** (đang ở trên cao ngó xuống, để
   còn đi bộ xuống từng bậc) · bậc trước mặt CAO QUÁ TẦM = **xuyên** (phía vách cụt) · bậc trèo
   được = **chỉ đặc khi thang là ĐƯỜNG DUY NHẤT ĐI TIẾP**.
   · ⚠ **"Đường duy nhất đi tiếp" phải hỏi THEO TỪNG NGƯỜI** (`LeadsOverObstacle`): bắn một tia
   ở BÊN KIA đầu cao của thang, ngang tầm bàn chân. Cùng một bức tường mà với quân NHÀ thì
   `passableForOwner` cho đi xuyên (không chắn → thang nhường đường, đi thẳng qua cổng nhà mình)
   còn với quân ĐỊCH thì đúng là tường (thang ĐẶC → trèo lên đánh). Nhờ vế này mà khối thành
   giữa sân của màn cướp cờ (`CreateKeep` — khối đặc, KHÔNG phải `Fortification` nên
   `UpdateBlockedPath` chẳng có gì để đập) vẫn phải trèo qua như cũ, không ai bị dí mặt vào vách.
   ⚠ Hỏi bằng **`Fortification.WouldLetThrough` (LUẬT)**, đừng chỉ hỏi `GetIgnoreCollision`
   (TRẠNG THÁI): quyền đi xuyên chỉ được CẤP trong bán kính 4 quanh tường, mà chân cầu thang
   cách tâm tường hơn 6 (dãy bậc dài `steps × StepRun`) — chỉ hỏi trạng thái là đứng ở chân
   thang lúc nào cũng nghe "bị chắn" và cái thang lại nhấc người lên y như trước khi sửa.
   · Ba nguồn "tôi muốn leo", đều là ĐẦU VÀO GHI MỖI FRAME (`Locomotion.RequestStairs`, khuôn
   `RequestSentry`): **ô "▲ Leo lên" hiện ngay tại chân thang** (`StickmanStairsPrompt` — đường
   CHÍNH, vì luật giao diện bắt mọi tính năng phải dùng được chỉ bằng ngón tay) · người chơi giữ
   phím LÊN (lối tắt desktop, dùng CHUNG phím leo thang) · AI khi mục tiêu cao hơn mình quá hai
   bước chân, **và `AIStateGarrison.RequestStairsUp` khi đang trèo lên post trên MẶT TƯỜNG** —
   post trên tường không có `StickmanClimbZone` nên đường lên duy nhất là đi bộ lên từng bậc;
   thiếu dòng đó thì cung thủ đi XUYÊN QUA cầu thang rồi đứng dưới chân tường tới hết trận,
   không lỗi nào báo, chỉ là cái tháp không bao giờ có người gác.
   · Ô hỏi là **CHỐT, không phải giữ**: `RequestStairs` tự hết hạn sau 0.2s nên bấm một phát
   rồi thôi thì thang đặc đúng một nhịp, chưa kịp bước lên bậc nào. Chốt theo TỪNG CẦU THANG,
   rời khỏi nó là quên. Bị chắn bên kia thì **KHÔNG hỏi** — lúc đó thang tự đặc, hỏi một câu mà
   trả lời "không" dẫn tới dí mặt vào vách thì hỏi làm gì.
   · **CHỌN ĐI DƯỚI GẦM, KHÔNG LEO** (`RequestStairsPass` + `WantsStairsPass`): giữ phím
   XUỐNG trong lúc đi ngang, hoặc đang **BÒ** (`Stance == Crawl` — đường của điện thoại, nút
   BÒ có sẵn) → ép xuyên kể cả khi bên kia có vật chắn. Luật "đang ĐỨNG TRÊN thang thì luôn
   đặc" vẫn thắng nên không ai tự làm mình rơi được.
   ⚠⚠ **VAN CỨU KẸT PHẢI VÔ ĐIỀU KIỆN — kể cả khi người ta ĐANG ĐÒI LEO.** Có lúc van này
   bị chặn bằng `!WantsStairs` (lý do: "vừa bấm leo mà chân lún vào bậc đã bị cấp xuyên rồi
   rơi"). Lý do đúng, cách chặn SAI, và nó đẻ ra một bẫy kẹt cứng: người đang ĐI XUYÊN QUA dãy
   bậc thì thân nằm GIỮA khối đá — đúng lúc đó mà có lệnh leo (người chơi bấm W, hoặc tướng
   điều cánh này lên đường trên) là collider trả về ĐẶC quanh cái thân đang chồng lên nó,
   Box2D không đẩy ra được, và họ **đứng chôn chân ở chân cầu thang tới hết trận**. Đã dính
   ngay khi cơ chế "đi hai tuyến" ra đời — vì nó làm AI đòi leo thường xuyên hơn hẳn.
   Chữa ở ĐỘ SÂU chứ không ở Ý ĐỊNH: `IsInsideSteps` dò cao hơn bàn chân **một bậc**
   (`StepHeight`) — đang leo thì nhích một bậc là ra khỏi đá (không cứu), bị chôn thì nhích
   một bậc vẫn trong đá (cứu).
   ⚠⚠ **ĐANG ĐƯỢC ĐI XUYÊN MÀ THÂN CÒN CHẠM KHỐI BẬC THÌ ĐỪNG THU LẠI GIỮA CHỪNG** — đó là cú
   *"cà giật ở cầu thang"* (2026-09-04). Luật đặc/xuyên đổi theo TỪNG NHỊP QUÉT, mà đi ngang
   chân thang là liên tục ra vào các ô hỏi (`IsAtLowEntrance` · `IsOnSurface` · `WantsStairs`…);
   mỗi lần lật về ĐẶC trong lúc thân còn chồng lên khối bậc là Box2D đẩy bật ra một cái, nhịp
   sau lại cho xuyên, lại lọt vào, lại đẩy. Cùng luật với `Fortification.StillInsideMe` và
   `StickmanLocomotion.ClearedOneWayFloor`: **thu quyền lúc thân còn chồng lên khối là đẩy
   văng loạn xạ.** Không rò: rời hẳn khối bậc là nhịp sau thu lại ngay.

   ⚠ **VAN CỨU KẸT — ai đã LỌT VÀO TRONG khối bậc thì LUÔN được đi xuyên**, bất kể luật nói gì
   (`Scan`). Lọt vào được là chuyện có thật: rơi từ mặt tường xuống trong lúc thang đang cho
   mình qua, bị hệ giãn cách xô vào, hoặc luật đổi giữa chừng. Trả collider về ĐẶC lúc thân
   đang chồng lên khối là Box2D đẩy văng loạn xạ, hoặc kẹp cứng giữa hai bậc và **kẹt luôn tới
   hết trận** — đúng triệu chứng *"rớt vào là kẹt"*.
   ⚠⚠ **ĐANG ĐI TRÊN MẶT THANG THÌ LUÔN ĐẶC** (`StickmanStairs.IsOnSurface`). `Owns(Ground
   Collider)` chỉ đúng khi bàn chân ĐANG CHẠM một bậc — nhưng đi XUỐNG thang là chuỗi những
   cú hụt chân nhỏ (rời mép bậc này, rơi 0.14 xuống bậc kế), và trong đúng khoảnh khắc lơ
   lửng đó ai không giữ `WantsStairs` liên tục (người chơi buông phím, AI vừa đổi mục tiêu)
   bị cấp quyền XUYÊN giữa lưng chừng thang → rơi thẳng xuống đất, ăn cả sát thương độ cao.
   Đọc ra đúng câu *"leo cầu thang lên xuống bị rớt"*, không lỗi nào báo. Luật đo bằng HÌNH
   HỌC (bàn chân ngang mặt một bậc, cửa dưới −0.12 để người đứng DƯỚI ĐẤT cạnh chân thang
   không bị giữ đặc) nên không phụ thuộc ai nhớ gọi gì.
   ⚠⚠ **BẬC CHIA ĐỀU — ĐỈNH THANG PHẢI KẾT THÚC ĐÚNG MẶT TƯỜNG** (`rise = height / steps`,
   cả `MapCastle.BuildStairs` lẫn `StickmanFortBuilder.CreateStairs`). Công thức cũ cho mỗi
   bậc đúng `StepRise` rồi `Ceil` số bậc, nên bậc chót cao `steps × 0.15` — VƯỢT mặt tường
   tới 0.149 trừ khi chiều cao chia hết cho 0.15 (tường map cao 2.0 thì đỉnh thang lơ lửng ở
   2.10, kèm một KHE 0.1 giữa bậc chót và mặt tường). Leo tới đỉnh là HỤT CHÂN xuống mặt
   tường, đi ngược lại thì vấp gờ — *"cầu thang tường thành không liền mạch"*. Nay đỉnh thang
   ôm sát mặt tường (chồng 0.04 vào thân, hai khối tĩnh chồng nhau thì vật lý không phiền) và
   `MapBuildRules` có **luật 1d `CheckStairsMeetTheirSurface`**: mặt đứng-được gần đầu CAO
   của thang phải chênh ≤ 0.18, đo trên hình THẬT.
   ⚠⚠⚠ **BỐN ĐƯỜNG KẸT CÒN SÓT — rà 2026-09-03, cả bốn đều câm lặng và cả bốn đều ra CÙNG
   MỘT triệu chứng *"đi ngang qua chân cầu thang thì bị nhấc lên nóc tường / kẹt"*:**

   | # | Sai ở đâu | Vì sao câm | Chốt |
   |---|---|---|---|
   | 1 | `ShouldBeSolidFor` mở đầu bằng `Owns(GroundCollider)` | `HasGroundAt` bắn tia từ **bàn chân +0.05**, mà `m_QueriesStartInColliders = 1` ⇒ tia bắt đầu TRONG bậc 1 (cao 0.075–0.15) vẫn trả hit ở khoảng cách 0; và **`IgnoreCollision` không tắt query** ⇒ người vừa được cấp quyền xuyên vẫn nhận `GroundCollider = Bac_1` ⇒ thang tự lật về ĐẶC quanh thân đang chồng khối ⇒ Box2D đẩy LÊN NÓC | **BỎ HẲN nhánh đó** — `IsOnSurface` (hình học) bao trọn mọi ca nó bắt được |
   | 2 | `Scan`/`DropStale` quét từ `transform.position.x` với bán kính 5 | cả hai builder đặt gốc thang ở **ĐẦU CAO**, còn dãy bậc dài `steps × 0.34`: tường 2.4 ⇒ 16 bậc ⇒ **run 5.44 > 5** ⇒ người ở CHÂN THANG nằm ngoài tầm quét, không bao giờ được cấp xuyên. Thang cao hơn ~3.5 còn tệ hơn: `DropStale` THU HỒI quyền lúc thân đang lọt trong khối ⇒ kẹt cứng | quét theo `_span` (`ScanCenterX`/`ScanRadius`), không theo gốc transform |
   | 3 | `StickmanStairsBootstrap` nhận diện bằng MỖI CÁI TÊN `Bac_*` | `StickmanFortBuilder.CreateTower` đặt tên nấc thang TRANG TRÍ của tháp là `Bac_1..N` **treo thẳng dưới root THÁP** ⇒ bootstrap gắn `StickmanStairs` lên cả cái tháp. `_steps` hoá ra là THÂN THÁP + SÀN, `_span` cao 3.6 nên `TryPlanTraversal`/`FindStairsOver`/`PickHighRoad` đều nhận nó là "cầu thang hợp lệ", và **`UpdateBlockedPath` thấy có đường leo nên KHÔNG cho đập tháp** ⇒ AI dí mặt vào chân tháp tới hết trận | bậc phải có **collider ĐẶC** + hai bậc kề nhau chênh ≤ 0.18. Kèm đổi tên nấc tháp thành `NacThang_` |
   | 4 | `Apply` tin CÁI SỔ `_passing` | Unity **RESET `IgnoreCollision` mỗi khi collider tắt/bật lại** (chết → ragdoll, hồi sinh → thân mới, mặc giáp → thêm hitbox). Quyền xuyên biến mất trong im lặng còn sổ vẫn ghi `true` ⇒ chốt chống-trùng `return` sớm, **không bao giờ cấp lại** ⇒ ai đang lọt trong khối bậc lúc đó kẹt tới hết trận, van cứu kẹt cũng bất lực vì nó rơi vào đúng chốt ấy | `MatchesPhysics` hỏi lại VẬT LÝ một cặp collider trước khi tin sổ; `SetIgnore` bỏ qua bậc đang TẮT |

   ⚠⚠⚠ **ĐƯỜNG KẸT THỨ NĂM — `IsAtHighEntrance` CHỈ PHỦ ±1.05, MÀ MẶT TƯỜNG DÀI 5 ĐƠN VỊ**
   (`StickmanStairs.IsOnUpperDeck`, 2026-09-03 — *"đi qua đoạn tường thành này là rơi xuống"*).
   Đo trên `Demo_26_Raid`: nóc tường chạy x −6.5 → −1.26, còn cửa sổ "đang ở miệng thang" chỉ
   là x −2.31 → −0.21. Nghĩa là **phần lớn mặt tường** rơi vào nhánh cuối của `ShouldBeSolidFor`
   và được cấp quyền ĐI XUYÊN cả dãy bậc. Quyền ấy BỀN theo cặp collider, còn vòng quét chỉ
   với tới `ScanRadius × 1.6` nên đi xa hơn là nó ĐÓNG BĂNG ở trạng thái "được xuyên"; quay
   lại bước sang **bậc trên cùng — bậc cao ĐÚNG BẰNG mặt tường, tức một khúc của chính con
   đường đang đi** — thì không có gì đỡ chân: rơi thẳng 2 đơn vị. Không lỗi nào báo, và vì bậc
   chót nằm ở đúng MỘT đầu nên nó chỉ rơi khi đi về MỘT HƯỚNG.
   Câu hỏi đúng không phải *"có đứng sát miệng thang không"* mà **"có đang ở TẦNG TRÊN không"**:
   từ tầng đó cầu thang là ĐƯỜNG ĐI XUỐNG, không bao giờ là thứ để chui qua. Người đi dưới GẦM
   (bàn chân ở tầng dưới) không đụng luật này nên vế *"đi xuyên là mặc định"* còn nguyên.
   ⚠ Đây là lần thứ hai cùng một triệu chứng bị quy nhầm cho `Fortification._passableForOwner`.
   Cách phân biệt trong một bước: **đo hình học scene** (bóc `.unity` lấy span collider) rồi hỏi
   *"ở toạ độ đó, cái gì đang đỡ chân?"*. Ở đây câu trả lời là một BẬC THANG, không phải tường.

   ⚠ Bài học chung của #1 và #3: **đừng hỏi một câu mà nguồn trả lời không biết gì về luật
   mình đang thi hành.** Tia dò đất không biết ai đang được đi xuyên; cái tên không biết object
   đó có phải bậc thang không.

   ⚠⚠ **THANG PHẢI TREO NGANG HÀNG VỚI TƯỜNG, KHÔNG TREO DƯỚI NÓ** — `MapCastle.CreateWall`
   từng gọi `BuildStairs(root.transform, …)` với chính cái root sắp nhận `Fortification`. Tường
   sập thì `DestructibleTarget._openWhenRuined` **tắt collider của MỌI object con** rồi xoay
   ±12° + hạ 0.3 cả cây: mất luôn lối lên mặt tường, và `_span` (đo MỘT LẦN ở `Awake`) thành số
   rác trong khi component vẫn bật — AI tiếp tục được lái tới một cái thang không còn tồn tại.
   `StickmanFortBuilder.CreateWall` đã học bài này (treo vào `wall.transform.parent`); đường map
   sinh thì sót tới 2026-09-03.

3b-doc. ⚠⚠⚠ **CẦU THANG NAY LÀ MẶT DỐC GIẢ, KHÔNG CÒN LÀ VA CHẠM TỪNG BẬC**
   (`StickmanStairs.SurfaceYAt` + `StickmanLocomotion.UpdateStairRide`; người dùng chốt
   2026-09-04: *"đi lên xuống không mượt, làm cơ chế cầu thang giả được rồi, ngoài ra bị kẹt
   khi lên tầng trên"*).

   Hình vẫn là dãy bậc. Nhưng thứ nhân vật ĐI TRÊN là một **mặt dốc phẳng nội suy thẳng từ
   chân thang lên đỉnh thang**, và **`StickmanLocomotion` là chủ duy nhất của cao độ đó** —
   mỗi nhịp vật lý nó kéo bàn chân về đúng `SurfaceYAt(x)`. Khối bậc thì `Scan` NHẢ VA CHẠM
   cho người đang được cõng, nên không còn gì để vấp, để lọt vào, hay để bị đẩy văng.

   **Ba bệnh cũ đều là hệ quả TẤT YẾU của việc bắt vật lý làm việc này**, không phải ba lỗi
   rời rạc — đừng đi chữa lẻ từng cái nữa:

   | Bệnh | Vì sao tất yếu |
   |---|---|
   | KHÔNG MƯỢT | nhích 0.15 mỗi 0.34 đơn vị = 10 cú giật một tầng. Đo được: mặt dốc cho **0.0247/nhịp liên tục** thay cho **0.15 mỗi 6 nhịp** — biên độ giật giảm **6.1 lần** |
   | KẸT | khe giữa hai bậc lọt vào được, mà locomotion ghi thẳng `linearVelocity` nên triệt tiêu luôn xung lực đẩy-ra của Box2D |
   | VAN CỨU KẸT BẮN NHẦM | `TryStepUp` chỉ nhấc khi `TravelSpeed` THẤP ⇒ **leo bình thường trông y hệt bị kẹt** ⇒ mọi van gỡ kẹt đều bắn vào chính động tác leo, nhả va chạm giữa chừng và người leo RƠI THẲNG XUỐNG |

   ⚠⚠ **QUÃNG CÕNG NHÔ QUÁ ĐỈNH (`RideOvershoot` 0.45) LÀ VẾ CHỮA "KẸT KHI LÊN TẦNG TRÊN",
   không phải chi tiết làm đẹp.** Đầu cao của dãy bậc dừng ở mép sàn, mà sàn tầng trên là
   `PlatformEffector2D` MỘT CHIỀU: đi ngang vào đúng CÁI GÓC của nó thì pháp tuyến va chạm
   nằm NGANG ⇒ **ngoài cung 150° ⇒ va chạm bị bỏ qua** ⇒ bàn chân thụt vào trong tấm sàn, mà
   đã ở trong rồi thì effector cũng không đẩy ra ⇒ rơi lại đúng bậc chót ⇒ nảy lên nảy xuống
   ở mép. Không lỗi nào báo. Cõng thêm một quãng NGANG ở đúng cao độ mặt sàn là người ta đặt
   chân vào GIỮA tấm sàn chứ không vào cái góc. Đo trên `Demo_23_CTF`: thả ra ở x = −20.55,
   **nằm sâu 1.45 trong lòng sàn**.

   ⚠ **CỬA VÀO HẸP, CỬA RA RỘNG** (§5c). Vào: ở chân thang thì **phải có ý định leo**
   (`WantsStairs`) — không thì đi ngang qua chân cầu thang là bị cõng lên tận tầng trên, đúng
   cái bẫy §3b đã ghi; còn ai đã ở TRÊN dốc thì cõng luôn khỏi hỏi (vừa từ tầng trên bước
   xuống, hoặc rơi trúng dốc). Ra: **KHÔNG hỏi lại `WantsStairs` giữa dốc** — ý định là thứ
   nhấp nháy (AI đổi mục tiêu, người chơi buông phím một nhịp), hỏi lại là thả người ta rơi
   giữa chừng. Muốn xuống giữa chừng thì BÒ hoặc giữ phím xuống (`WantsStairsPass`).

   ⚠ Ba cửa thoát khác, thiếu cửa nào cũng thành một cái bẫy mới: **đang BAY LÊN** (vừa nhảy —
   dính xuống thì không nhảy khỏi thang được) · **đang CƯỠI** · **ra khỏi dốc**.

   ⚠ `TryStepUp` bị BỎ QUA khi đang được cõng — để nó chạy là nhấc thêm một nấc nữa lên trên
   mặt dốc. Nó vẫn lo mọi gờ đá KHÁC như cũ.

   ⚠ Khối bậc + `ShouldBeSolidFor` + ba van nhả quyền **vẫn còn** làm lưới đỡ cho người KHÔNG
   được cõng (rơi từ trên xuống trúng dãy bậc, kỵ sĩ, người đang bò). Đừng xoá; nhưng cũng
   đừng đi chỉnh chúng để chữa chuyện leo trèo nữa — chuyện đó nay do mặt dốc lo.

   ⚠⚠⚠ **VAN CỨU KẸT CỦA CẦU THANG PHẢI HỎI "THÂN CÓ CHỒNG LÊN ĐÁ KHÔNG", KHÔNG HỎI "CÓ Ở
   GẦN KHÔNG"** (dính 2026-09-04: *"không lên cầu thang được, lên là bị rơi xuống, AI không
   di chuyển toàn map"*).

   `StickmanStairs` có ba van nhả quyền đi xuyên. Hai van sau từng dùng chung một phép đo
   `IsTouchingSteps` = một hộp 0.36 có **ĐÁY ĐÚNG NGANG BÀN CHÂN**, mà `Bounds.Intersects`
   tính cả chạm mép ⇒ **ai đứng trên bậc cũng đúng**. Ghép với hai điều kiện còn lại thì nó
   mô tả CHÍNH XÁC động tác leo cầu thang:

   · `TravelSpeed` THẤP **không phải dấu hiệu kẹt — nó là ĐIỀU KIỆN CẦN của `TryStepUp`**
     (hàm đó thoát sớm khi `TravelSpeed > MaxSpeed × 0.6`: *phải bị chặn rồi mới được nhấc*).
     Nên mỗi nấc thang đều có một khoảnh khắc "đòi đi mà không đi được";
   · `|Steer| > 0.2` thì người đang leo luôn đúng.

   Hậu quả dây chuyền, và **không lỗi nào báo**: tới sát mặt bậc → cả dãy thang được cấp ĐI
   XUYÊN → `TryStepUp` bỏ qua (nó cố ý không trèo lên collider đang `GetIgnoreCollision`) VÀ
   cái bậc đang đỡ chân biến mất → **rơi thẳng xuống**; van thứ ba (`wasPassing`, chống rung)
   thấy vẫn "đang chạm" nên **KHOÁ CỨNG** quyền xuyên → chạm thang một lần là vĩnh viễn không
   leo lại được. Ba câu người dùng đọc ra cùng lúc: *không lên được* · *lên là rơi* · *AI đứng
   im cả map* (không đổi tầng thì mọi mục tiêu ở tầng khác đều với không tới).

   Chốt bằng **`IsWedgedInSteps`** — bàn chân nằm trong CỘT của một bậc mà MẶT bậc đó CAO HƠN
   bàn chân. Leo bình thường: bậc đang đứng có mặt NGANG chân, bậc phía trước ở CỘT KHÁC ⇒ im.
   Kẹt thật (rơi trúng khe / đi xuyên ở tầm mặt đất): chân lọt vào cột của bậc cao hơn ⇒ đúng.
   Kèm **quán tính** cho van cứu kẹt (`BlockedTooLong`: giữ nguyên 0.45s VÀ không nhích lên
   được tí nào) — người leo bị chặn đúng một nhịp vật lý rồi được nhấc, người kẹt thật thì
   đứng một cao độ mãi. Đây là §5c áp cho một VAN chứ không cho một luật đi.

   ⚠ Bài học chung: **van cứu kẹt nào cũng phải phân biệt được "đang kẹt" với "đang làm đúng
   việc mà việc đó trông giống kẹt".** Ở đây "việc đó" là leo cầu thang — và nó BẮT BUỘC phải
   trông giống kẹt, vì `TryStepUp` chỉ nhấc người khi họ đã bị chặn.

   ⚠ `StepAhead` · `LeadsOverObstacle` · `OffersClimb` · `RequestStairsPass` hiện **KHÔNG AI
   GỌI** (nhánh hình học đã bị gỡ khỏi `ShouldBeSolidFor` vì nó tự đặc khi raycast chạm nhầm
   tường/tháp/đồng đội). Đừng nối chúng lại mà chưa đọc lịch sử này.

   ⚠⚠⚠ **ART CẦU THANG CAO HƠN PHẦN ĐI ĐƯỢC — "nhân vật đi trên không trung"** (2026-09-03).
   `Stairs.png` có **TAY VỊN nhô lên trên mặt bậc**: đo ra mặt đá cao nhất chỉ ở **206/260 =
   0.792** chiều cao ảnh. Nhưng cả hai builder (`StickmanFortBuilder.AttachStairArt` và
   `MapCastle.BuildStairs`) scale TOÀN TẤM cho vừa đúng `rise`, nên mặt đá chỉ lên tới
   `0.792 × rise` — với tường cao 2.0 là **thấp hơn khối bậc 0.42 đơn vị**. Người chơi đứng
   ĐÚNG trên bậc (va chạm không sai một ly), chỉ có HÌNH vẽ mặt thang thấp hơn nửa thân người.
   Không lỗi nào báo, và đọc code thì cả hai bên đều "đúng".
   Chốt bằng `StairArtWalkRatio` (206/260) ở CẢ HAI builder — đúng khuôn `WallArtWalkwayRatio`
   mà tường đã có từ trước (răng lược cũng nhô lên trên mặt sàn đi).
   ⚠ **Thay tấm art cầu thang khác tỉ lệ thì phải đo lại hằng số đó**, ở cả hai chỗ. Cách đo:
   quét cột tìm mép trên của phần ĐÁ (bỏ màu gỗ của tay vịn), lấy `max / chiều cao ảnh`.

   ⚠⚠ **VÀ ĐI XUỐNG CẦU THANG CẦN MỘT LUẬT RIÊNG — `IsAtHighEntrance`.** Người đứng trên MẶT
   TƯỜNG có bàn chân KHÔNG nằm trên bậc nào (`IsOnSurface` false vì `feet.x` còn ngoài dãy
   bậc) ⇒ được cấp quyền ĐI XUYÊN. Bước tới mép để xuống thì trong 0.08s trước nhịp quét kế,
   bậc chót vẫn "trong suốt" với họ — mà một sải chân đi được 0.24, rộng hơn cả bề ngang một
   bậc (0.34) ⇒ **rơi thẳng xuống đất thay vì đi xuống từng bậc**. Đọc ra đúng câu *"không leo
   xuống cầu thang đứng được"*. Vế này từng do nhánh hình học cũ lo, và mất theo khi nhánh đó
   bị gỡ. Nay `ShouldBeSolidFor` hỏi thêm `IsAtHighEntrance` (hàm đã có sẵn, chính ô hỏi
   "▼ Xuống cầu thang" đang dùng) — vẫn là hình học thuần, không raycast.

   ⚠ **"LỌT TRONG" KHÁC "ĐỨNG TRÊN", VÀ LẪN LÀ RƠI XUYÊN CẦU THANG.** `Bounds.Contains` tính cả
   điểm nằm ĐÚNG TRÊN MẶT BIÊN, mà bàn chân người đứng trên bậc thì ở đúng `bounds.max.y` — hỏi
   thẳng là ai leo thang cũng bị coi là "đang kẹt trong khối", van cứu kẹt cấp quyền xuyên và
   họ rơi thẳng xuống đất. Nên `IsInsideSteps` dò bằng điểm NHÍCH LÊN khỏi bàn chân + co khối
   lại (`Expand(-0.04)`).
   ⚠ **Cửa sổ nhìn-trước của `StepAhead` (2.0) phải RỘNG HƠN quãng đi được trong một nhịp
   quét** (0.2s × ~5 = 1 đơn vị lúc chạy). Hẹp bằng đúng một sải chân thì người đang chạy tới
   sát chân thang mới được cấp quyền, và bị nhấc lên một bậc trước khi kịp qua.
   ⚠ **Phải THU HỒI khi rời tầm quét** — `IgnoreCollision` là trạng thái BỀN, ai từng đi xuyên
   một lần sẽ đi xuyên MÃI MÃI kể cả lúc quay lại định leo.
   ⚠ Scene ĐÃ BAKE không tự có component này → `StickmanStairsBootstrap` gắn bù lúc nạp scene
   (nhận diện bằng quy ước tên bậc `Bac_*`, khuôn `PlayerRespawnBootstrap`).
   ⚠ **Ba bệnh của `TryStepUp` đã chữa cùng lúc**, cả ba đều hỏng trong im lặng:
   **bay lên trời** (tia dò với xa 0.26 nên nhân vật bị nhấc khi còn cách bậc cả gang tay →
   nhấc giữa không trung → rơi → nhấc tiếp, nhịp vật lý nhanh hơn nhịp rơi nên CỘNG DỒN;
   chốt: chỉ nhấc khi `TravelSpeed` tụt dưới 60% tốc độ tối đa = **bị chặn thật**, và mỗi lần
   nhấc phải cách lần trước một quãng NGANG `StepRunGate` 0.16 — đo bằng QUÃNG chứ không bằng
   đồng hồ, vì quãng mới khớp hình học cầu thang) · **kẹt** (nhấc thân vào TRONG khối đặc rồi
   Box2D đẩy loạn xạ; chốt: `HasHeadroom` — chỗ mới phải trống) · **trèo lên cái vừa cho đi
   xuyên** (chốt: bỏ qua collider đang `GetIgnoreCollision` với thân mình).

2e-tut. ⚠⚠ **LÊN ĐƯỢC THÁP MÀ KHÔNG XUỐNG ĐƯỢC — phải có TỤT QUA SÀN**
   (`StickmanLocomotion.DropThroughPlatform`, thêm 2026-09-03).
   Hai luật ĐÚNG ghép lại thành một cái bẫy: sàn tháp là `PlatformEffector2D` MỘT CHIỀU (để
   người trèo thang chui qua từ dưới lên) và mép sàn là MÉP VỰC (luật "không bao giờ đi xuống
   vực" cắt vận tốc). Nên ai lên tới nóc thì **không còn đường nào xuống**: rơi xuyên không
   được, bước ra mép không được, mà trục thang lại nằm DƯỚI cái sàn nhô ra. Người chơi lẫn AI
   đứng trên nóc tới hết trận trong khi trận đánh diễn ra ngay dưới chân — không lỗi nào báo.
   · Người chơi: **giữ XUỐNG + bấm NHẢY**. Thử tụt TRƯỚC rồi mới nhảy — `DropThroughPlatform`
     tự trả false khi dưới chân là đất đặc, nên cử chỉ đó ở mặt đất vẫn nhảy như thường.
   · AI: `StickmanAgent.TryDropOffPlatform`, đặt **SAU** `RequestStairsIfNeeded` — có cầu thang
     thì đi bộ xuống, vì tụt là ăn sát thương rơi. Nhảy xuống là LỐI THOÁT, không phải lối tắt.
     `AIStateGarrison` được miễn qua `OwnsTraversal` (nó CỐ Ý ở lại chốt).

⚠⚠ **`OwnsTraversal` KHÔNG có nghĩa là tự chế một bộ tìm đường thứ hai** (2026-09-07).
`AIStateGarrison` từng đi thẳng tới `post.Ladder` rồi `EnterClimb` — đúng với tháp canh /
lô cốt / tường (một thang từ đất lên nóc), **sai** với công trình nhiều tầng có CHUỖI thang
(`StructureKind.Scaffold`): chân thang của post nằm lơ lửng mấy tầng trên đầu, `EnterClimb`
trả false và cung thủ đứng ở chân công trình tới hết trận, không lỗi nào báo. Nay
`NextLadderUp()` hỏi **chính `LaneNav`** bước kế tiếp và `TickClimbing` buông theo từng
CHẶNG. Luật rút ra: state tự lái cái thang thì vẫn phải hỏi ĐÚNG đồ thị mà cả dự án dùng.
Chi tiết + hai phép kiểm kèm theo: [StructureKit](StructureKit.md) §V10.
   ⚠ Làm bằng `Physics2D.IgnoreCollision` theo TỪNG CẶP rồi **trả lại** (hết giờ, hoặc đã rơi
   qua đáy sàn, hoặc `OnDisable`). **ĐỪNG** đụng `PlatformEffector2D.rotationalOffset`: nó là
   thuộc tính CỦA CÁI SÀN — đổi một cái là mọi người đang đứng trên đó cùng rơi.

2e-sango. ⚠⚠⚠ **"ĐI LÊN NÓC TƯỜNG LÚC ĐỨNG ĐƯỢC LÚC RƠI" = TRẢ LẠI VA CHẠM VỚI SÀN MỘT
   CHIỀU KHI CHÂN CÒN Ở DƯỚI NÓ** (`StickmanLocomotion.ClearedOneWayFloor`, 2026-09-04).

   Đo trên `Demo_26_Raid`: nóc tường ở y = 0 gồm hai mảnh — khối đá đặc (x −5.0…−1.26) và
   **SÀN GỖ MỘT CHIỀU** nhô ra ngoài (x −6.5…−4.4). Ở khúc −6.5…−5.0 thì sàn gỗ là thứ DUY
   NHẤT đỡ chân. Người trèo thang công thành được cấp quyền đi xuyên nó (`IgnoreOneWayFloors`)
   để chui lên từ dưới — đúng. Nhưng `ExitClimb` nhả thang khi bàn chân mới tới `TopY − 0.6`,
   tức **có thể vẫn còn DƯỚI mặt sàn**; trả lại va chạm ngay lúc đó thì với sàn MỘT CHIỀU,
   người ở DƯỚI mặt sàn không được nó đỡ chút nào ⇒ rơi thẳng xuống đất. Hơn hay kém mặt sàn
   vài centimet là chuyện của đúng cái frame nhả thang ⇒ **ăn may**, đúng câu *"lâu lâu thì nó
   đứng được một lần"*. Không lỗi nào báo.

   Hai vế, thiếu vế nào cũng còn rơi:
   · **GIỮ quyền đi xuyên tới khi họ THẬT SỰ cao hơn mặt sàn** (`RestoreOneWayFloors` để lại
     phần chưa vượt qua, rút dần mỗi nhịp vật lý). Cùng luật với
     `Fortification.RevokeStalePasses`: *thu lại lúc thân còn chồng lên khối là Box2D đẩy văng
     loạn xạ*. ⚠ Kèm VAN CHỐNG RÒ: đi ra khỏi bề ngang cái sàn thì trả lại luôn, không thì họ
     đi xuyên sàn đó vĩnh viễn.
   · **THÔI LEO Ở GẦN ĐỈNH THÌ CHỈ BUÔNG KHI CÓ CHỖ ĐẶT CHÂN** (dò đất sâu 0.35). Đứng yên
     trên thang là chuyện BÌNH THƯỜNG; không có đất thì cứ bám tiếp. Bản trước bỏ hẳn phép dò
     này để chữa *"qua khỏi thang vẫn còn dáng leo"* — chữa đúng triệu chứng, đẻ ra cú rơi này.
   ⚠ **ĐỪNG gộp phép rút sổ vào van canh gác `_gravityParked`**: van đó gọi `ExitClimb`, mà
   `ExitClimb` nạp lại một lượt nhảy — gọi mỗi frame là nhảy được VÔ HẠN giữa trời.

2e-nhayvohan. ⚠⚠⚠ **ĐỨNG TRONG LÒNG TƯỜNG NHẢY ĐƯỢC VÔ HẠN — TIA DÒ ĐẤT KHÔNG BIẾT GÌ VỀ
   QUYỀN ĐI XUYÊN** (`StickmanLocomotion.IsPassingThrough`, 2026-09-04).

   Tường nhường làn cho người đi bộ NGANG QUA chân tường, nên lúc đó thân họ nằm GIỮA khối đá.
   Mà `Physics2D.Raycast` **chỉ tắt VA CHẠM chứ không tắt QUERY** (luật đã ghi ở
   `StickmanStairs`), lại thêm `m_QueriesStartInColliders` của dự án bật — nên tia dò đất bắn
   ra từ TRONG khối đá trả hit ở khoảng cách **0**. Hệ quả:
   `IsGrounded` đúng ở MỌI ĐỘ CAO trong lòng tường → `UpdateGroundState` nạp lại lượt nhảy mỗi
   frame → **nhảy vô hạn, leo thẳng lên nóc**. Không lỗi nào báo.

   Chốt: `IsStandableSurface` hỏi thẳng vật lý *"tôi có đang bỏ qua va chạm với chính nó
   không"* (`Physics2D.GetIgnoreCollision`). Áp cho cả SÀN MỘT CHIỀU đang được đi xuyên (người
   trèo thang chui lên) — đứng trên một cái sàn mình đang xuyên qua là vô nghĩa.
   ⚠ Hỏi VẬT LÝ chứ đừng tra sổ của từng hệ (`Fortification._passIgnored` ·
   `StickmanStairs._passing` · `_ignoredFloors`): ba hệ cấp quyền độc lập nhau và sổ có thể
   lệch với thực tế (Unity RESET `IgnoreCollision` mỗi khi collider tắt/bật lại). Vật lý là
   nguồn sự thật duy nhất mà cả ba đều ghi vào.
   ⚠ Người đứng TRÊN NÓC không được cấp quyền đi xuyên (`AtFootOf`) nên vẫn đứng bình thường —
   luật này không đụng tới họ.

2e-loidi. ⚠⚠⚠ **NÓC TƯỜNG PHẢI LÀ MỘT KHỐI ĐẶC LIỀN MẠCH — CHỮA BẰNG HÌNH HỌC, ĐỪNG CHỮA
   BẰNG LUẬT** (`StickmanFortBuilder.BuildWalkway`, ý người dùng chốt 2026-09-04).

   Nóc tường vốn là **ba mảnh ghép sát nhau**: sàn gỗ một chiều (−6.5…−4.4) · khối đá đặc
   (−5.0…−1.26) · bậc thang trên cùng (−1.26…−0.92). Hai chỗ NỐI là đúng hai chỗ người dùng
   báo hay rơi, và mỗi mảnh lại có một hệ riêng có quyền mở nó ra. Đi sửa từng luật là đuổi
   theo triệu chứng: sửa xong mảnh này thì lộ ra mảnh khác.

   Nay có **MỘT khối `BoxCollider2D` đặc, không hình, treo dưới GỐC toà thành**, chạy liền từ
   mép sàn gỗ tới phủ qua bậc thang trên cùng. Vì sao nó chắc chắn:
   · **không ai mở được** — không mang `Fortification` (không quyền đi xuyên nào cấp lên nó),
     không phải bậc `StickmanStairs`, không phải sàn một chiều (`DropThroughPlatform` không
     đụng tới). Cả ba đường CỐ Ý mở mặt sàn đều không với tới;
   · **hết mối nối** — Box2D còn vướng "va chạm ma" ở cạnh trong giữa hai khối kề nhau, đó là
     cú GIẬT khi đi ngang qua. Một khối dài thì không có cạnh trong nào.

   ⚠ **CHỪA CỬA LÊN** (`HoardingHatch` = 1.0 ở mép ngoài): thang công thành phải cắm TRONG
   khoảng đó, vì người trèo cần chui lên qua sàn MỘT CHIỀU. Phủ đặc hết là bịt luôn đường công
   thành — đổi một lỗi lấy một lỗi to hơn. Đổi `hoardingOverhang` hay đổi chỗ cắm thang thì
   phải soát lại cặp số này.
   ⚠ Treo dưới GỐC, KHÔNG dưới khúc tường: phá thủng một khúc thì lối đi vẫn còn, và nó không
   bị `_openWhenRuined` tắt collider theo.

   ⚠⚠ **CHƯA ĐỦ — 2026-09-09, người dùng lại báo kẹt/rớt khi đứng trên tường.** Lối đi liền một
   khối, nhưng mặt trên của **N khúc đá** vẫn nằm ĐÚNG ở `walkY`, tức đồng phẳng với nó: Box2D
   vẫn sinh tiếp xúc với từng khúc và ở mối nối lấy được mặt ĐỨNG của khúc kế làm pháp tuyến.
   Nay `BuildCastleWall` **hạ mép trên collider của khúc tường** xuống đúng `WalkwayThickness`
   (0.12) — hình giữ nguyên chiều cao, `Fortification.topHeight` giữ nguyên — nên mặt phẳng bàn
   chân chỉ còn MỘT hộp. Sàn gỗ cũng phủ CHỒNG mép ngoài lối đi thay vì chạm mép.
   Luật đầy đủ + phép đo: `Terrain.md` mục *"Lần thứ năm"* và `StickmanColliderProof`.
   ⚠ Bản Editor `StickmanFortBuilder.CreateCastleWall` phải sửa CÙNG LÚC (`SinkColliderTop`),
   không thì scene bake bằng tool và map sinh lúc chạy cho ra hai cái tường khác nhau.

2e-tuthanh. ⚠⚠⚠ **"AI ĐI TRÊN TƯỜNG THÀNH LÀ RỚT, KHÔNG ĐI TRÊN ĐÓ ĐƯỢC" — KHÔNG PHẢI SÀN
   THỦNG, MÀ LÀ CHÍNH NÓ TỰ THẢ MÌNH XUỐNG** (2026-09-04).

   Đây là bài học đắt nhất của cả đợt: tôi đi soi va chạm, quyền đi xuyên, hiệu ứng sàn một
   chiều suốt nhiều vòng — trong khi thứ mở sàn ra là **một lệnh CỐ Ý**, `DropThroughPlatform`.

   | Ai gọi | Điều kiện cũ | Nghĩa thật ở màn công thành |
   |---|---|---|
   | `StickmanAgent.TryDropOffPlatform` | *"địch thấp hơn một tầng"* | **lúc nào cũng đúng** — dưới đất luôn có địch ⇒ ai đặt chân lên mặt tường là nhịp sau tự nhảy xuống |
   | `StickmanFighterController` (nút NHẢY) | `crouchHeld \|\| vertical < -0.01f` | cần ảo gần như luôn có chút thành phần đi xuống ⇒ **mọi cú bấm NHẢY trên tường = tụt qua sàn** |

   Cả hai đều chỉ ăn trên SÀN MỘT CHIỀU, nên chỉ khúc sàn gỗ mới thủng — đúng chỗ người dùng
   khoanh đỏ, và đúng lý do nó "lúc rớt lúc không".

   Chốt: AI phải hỏi thêm hai câu trước khi tự thả — **có cầu thang trong 9 đơn vị không**
   (có đường bộ thì đi đường bộ, nhảy là ăn sát thương rơi) và **từ trên này có bắn tới nó
   không** (đứng cao bắn xuống vốn là chỗ tốt nhất; chỉ cận chiến mới cần tụt). Người chơi thì
   ngưỡng lên **−0.5**, nằm ngoài hẳn vùng chết dọc của cần ảo (0.32).

   ⚠ **BÀI HỌC CHẨN ĐOÁN:** khi một mặt sàn "thủng", hãy liệt kê **mọi đường CỐ Ý mở nó ra**
   trước khi đi soi va chạm. Trong dự án này chỉ có ba: `Fortification` (quyền đi xuyên),
   `StickmanStairs` (bậc), và `DropThroughPlatform` (tự thả). Cái thứ ba không để lại dấu vết
   nào trong sổ ignore nên soi sổ mãi cũng không thấy.

2e-mep. ⚠⚠ **MÉP SÀN CAO KHÔNG PHẢI MÉP VỰC — `StickmanLocomotion.ShouldGuardEdge`.**
   Luật "không bao giờ đi xuống vực" sinh ra cho KHE VỰC dưới đất, nơi rơi xuống là mất quân
   vô lý. Nhưng nó áp luôn cho mép SÀN THÁP — chỗ mà rơi xuống là chuyện bình thường và đã có
   `StickmanFallDamage` tính giá. Ghép với sàn một chiều (không cho rơi xuyên) thì thành:
   **bước tới mép bị giữ chân, phải NHẢY mới ra khỏi được**, mà AI thì không biết nhảy để tự
   tụt ⇒ cả người chơi lẫn quân đứng chôn trên nóc tháp. Nay đứng trên **SÀN MỘT CHIỀU** thì
   bước qua mép là RƠI, đúng như mắt nhìn vào chờ đợi.
   ⚠⚠ **ĐÃ ĐẢO NGƯỢC 2026-09-03 — MÉP NÀO CŨNG CHẶN.** Ngoại lệ trên chữa "lên tháp không
   xuống được", nhưng lối xuống ĐÀNG HOÀNG đã có ở mục 2e-tut ngay trên (`DropThroughPlatform`:
   người chơi giữ XUỐNG + NHẢY, AI qua `TryDropOffPlatform`). Giữ cả hai là thừa MỘT — và cái
   thừa đó biến mọi mép sàn gỗ thành BẪY: sàn gỗ trên mặt tường (`BuildHoarding`) **nhô ra
   ngoài mặt tường 1.4 đơn vị và dưới nó không có gì**, nên đi bộ dọc nóc tường về phía ngoài
   là bước hụt xuống đất mà không hề bấm gì. Cả người chơi lẫn AI đều dính. Nay `ShouldGuardEdge`
   luôn true; muốn xuống thì phải NÓI ra.
   ⚠ Bài học: **đừng chữa "không có đường ra" bằng cách BỎ MỘT LUẬT AN TOÀN** khi có thể THÊM
   một đường ra tường minh. Luật an toàn bị bỏ thì hỏng ở chỗ chẳng ai ngờ tới.
   ⚠ **Chỉ nới cho sàn một chiều** (`PlatformEffector2D`). Mặt tường đá và mọi mặt đất thường
   VẪN CHẶN — bỏ chặn ở đó là cả cánh quân đi trên tường rơi hàng loạt, và khe vực dưới đất
   lại thành cái bẫy nuốt quân.
   ⚠ **Lính đang GIỮ SUẤT BẮN phải khoá mép lại** (`RequestEdgeGuard`, ghi mỗi frame trong
   `AIStateGarrison`): sàn tháp hẹp, hệ giãn cách đẩy ngang liên tục, không khoá là cả tổ cung
   thủ lần lượt bị đẩy rơi — đúng bug mà `GarrisonPost` chia suất để tránh ngay từ đầu.
   ⚠ **ĐỪNG đổi `IsLedgeAhead`** — đó là phép ĐO, và ba chỗ khác đọc nó để ra quyết định
   (`IsCornered`/tử chiến · `AIStateGarrison` chốt suất ngoài mép · `UpdateJumpOverGap`). Đổi
   phép đo là đổi luôn hành vi của chúng. Chỉ đổi chỗ CẮT VẬN TỐC.
   ⚠⚠ **VAN CHẶN MÉP TỪNG NGHỈ ĐÚNG LÚC CẦN NHẤT — TRONG LÚC CƯỠI MẶT DỐC CẦU THANG**
   (2026-09-06, `LedgeAheadWhileRiding`). `IsLedgeAhead` tự tắt khi `!_grounded`, mà mặt dốc
   của `StickmanStairs` **không phải collider**: nó là phép nội suy, `UpdateStairRide` ghi
   thẳng `_body.position` để dán bàn chân vào đó. Ở quãng NHÔ QUÁ ĐỈNH (`RideOvershoot` 0.45)
   dãy bậc đã hết, thứ duy nhất còn đỡ chân là cái SÀN trên kia — mà đo thật trên 6 scene thì
   nhiều sàn chỉ rộng **2.5–3.5** đơn vị (`SanCao_*.MatSan` 3.5, mặt tường `Demo_26_Raid` 4.7).
   Sàn hụt ⇒ tia dò đất không thấy gì ⇒ `_grounded` false ⇒ van nghỉ ⇒ **đi thẳng ra khoảng
   không rồi rơi**. Không lỗi nào báo: cầu thang đúng, `ProbeLanding` xanh, sàn CÓ tồn tại.
   Đúng câu người dùng tả: *"lên cầu thang xéo sau đó đi ngang thì nó bị rơi xuống"*.
   Bản vá giữ nguyên `IsLedgeAhead` theo luật ngay trên, chỉ thêm một phép đo RIÊNG mà **chỉ
   chỗ cắt vận tốc** đọc.

2e-roi. ⚠⚠ **NGƯỜI CHƠI TỪNG KHÔNG MẤT MÁU KHI RƠI — hai vế, cả hai câm lặng.**
   · `StickmanActionBuilder` chỉ gắn `StickmanFallDamage` khi prefab **đã có**
     `StickmanLocomotion`. Mà `StickmanFighter.prefab`/`Character.prefab` KHÔNG kèm bộ đi lại
     (nó được `AddComponent` lúc chạy — xem `MapAssembler.SpawnPlayer`), nên điều kiện đó luôn
     trượt ở đúng prefab NGƯỜI CHƠI: mọi NPC đều mất máu khi ngã, riêng người chơi thì không.
   · Và kể cả gắn rồi vẫn chưa xong: `StickmanFallDamage.Awake` lấy locomotion bằng
     `GetComponent`, mà locomotion được thêm SAU `Instantiate` ⇒ `_locomotion` null vĩnh viễn,
     component ngồi im. Nay nối dây lại ở `Start` (chạy sau mọi `Awake` cùng frame), và gỡ
     trước khi nối để không trừ máu hai lần.
   ⚠ Bài học chung: **đừng lấy "prefab có sẵn component X" làm điều kiện gắn component Y** khi
   X được thêm lúc chạy. Hỏi ở thời điểm CHẠY, hoặc gắn vô điều kiện rồi tự chịu null.

3. **CẦU THANG = `StickmanLocomotion.TryStepUp`** — hệ di chuyển ghi thẳng vận tốc NGANG nên
   dốc nghiêng thì trượt, phải là DÃY BẬC RỜI rồi nhấc thân lên từng nấc. Chạy ngay sau chỗ
   ghi vận tốc nên mọi nguồn (người chơi, AI, đội hình) đều được hưởng.
   ⚠ **CỐ TÌNH BỎ QUA MỌI `StickmanController`**: công trình không bao giờ được bước lên, bất
   kể thấp cỡ nào — thiếu luật này là chỉ cần một cái rào thấp hơn `_stepHeight` (0.18) làm cả
   hệ vật cản thành vô nghĩa. Bậc thang dựng 0.15 (phải THẤP HƠN `_stepHeight`).
   ⚠ **DÃY BẬC KHÔNG ĐƯỢC ĂN `lossyScale` CỦA CHA.** Vị trí từng bậc đặt bằng `transform.position`
   (toạ độ THẾ GIỚI) nên luôn đúng, còn `localScale` thì bị nhân với cỡ của cha. Treo dãy bậc
   dưới object tường (`localScale = (dày, cao, 1)`) là mỗi bậc cao lên gấp `cao` lần — bậc 0.15
   thành ~0.39, vượt `_stepHeight` → `TryStepUp` từ chối và **không ai leo lên nổi**, không lỗi
   nào báo. `StickmanFortBuilder.CreateStairs` nay **tự chia ngược `lossyScale` của cha** (cùng
   khuôn `StructureSkin.SetArt`) nên ai parent vào đâu cũng ra đúng bậc — chữa ở HÀM chứ không
   chữa ở từng chỗ gọi, vì chữa ở chỗ gọi thì builder mới lại dính.
   ⚠ **`TryStepUp` phải nhận Ý ĐỊNH đi, không nhận biến đã bị luật chặn mép vực cắt về 0.**
   Hai luật đúng ghép chung một biến thì hễ tia dò vực báo "trước mặt không có đất" là
   bước-lên-bậc chết theo — dù thứ chắn trước mặt là một cái bậc hoàn toàn bước lên được.
   Chân cầu thang hay nằm sát mép đúng kiểu đó (đây là họ hàng của cặp luật giằng nhau ở
   mục AI §5c). An toàn vì `TryStepUp` chỉ nhấc khi tia NGANG chạm một mặt đứng-được thật.
   ⚠ Soi bằng `Tools > Stickman > Nâng cao > Rig & Kiểm tra > Kiểm tra scene đang mở`:
   `StickmanSceneUtils.ValidateStairs` đo chênh cao THẬT giữa hai bậc trong scene rồi réo tên
   nhóm bậc nào vượt `_stepHeight`. Scene đã bake KHÔNG tự sửa theo code builder, nên đây là
   cách duy nhất biết scene cũ có còn leo được không mà không phải dựng lại cả bộ.
4. **TRẤN THỦ TRÊN CAO** (`AIBehavior.Garrison` + `GarrisonPost`): tìm post → tới đường lên →
   LÊN → ra suất đứng → bắn. Hai đường lên: tháp có `StickmanClimbZone`, tường đi CẦU THANG.
   ⚠⚠ **AI GÁC PHẢI ĐƯỢC ĐIỀU PHỐI LÚC CHẠY — `GarrisonDirector`** (2026-09-04, user báo
   *"nó lên có 1 lần"*). `AIBehavior.Garrison` trước nay chỉ được gán ở **ba chỗ, cả ba đều
   là LÚC DỰNG**: builder scene · `MapAssembler` · `StructureKitShowcase`. Không một dòng nào
   gán nó giữa trận ⇒ mấy cung thủ khai lúc bake mà ngã xuống thì **không ai thay**, tháp
   đứng trống tới hết trận. Không lỗi nào báo: post vẫn còn suất, chỉ là không ai được bảo đi
   lấy. Đo ở `Demo_26_Raid`: **5 suất** (tháp ngoài 2 · tháp trong 1 · tường 2) mà chỉ **4
   cung thủ** được khai, và chết là hết.
   Cùng họ `RespawnDirector`/`TeamAILevelDirector`: **thứ gì builder gán MỘT LẦN lúc dựng thì
   phải có ai đó áp lại theo nhịp**, vì gần như mọi màn đáng chơi đều có nguồn đẻ quân.
   · **CHỈ LÍNH TẦM XA LÊN GÁC** (`UnitRole.Ranged`): chỗ đứng trên cao đáng giá vì TẦM BẮN;
     đưa một anh kiếm lên đó là mất một suất mà chẳng bắn được ai, lại trống một chỗ ở tuyến
     đầu. `Support` (thầy thuốc) cũng không — nó phải đứng cạnh đồng đội mà hồi máu.
   · ⚠ **ĐẾM BẰNG "tổng suất − số người đang nhận Garrison", KHÔNG bằng `HasFreeSlot`**:
     người đang trên đường tới chân thang thì CHƯA `Claim`, nên hỏi `HasFreeSlot` sẽ thấy
     trống mãi và cả tiểu đội bị dồn lên cùng một cái tháp.
   · ⚠ **CHỈ CƯỚP LÍNH ĐANG RẢNH** (`FreeRoam`·`HuntTarget`·`GuardTarget`). Kẻ đang vác thang,
     khiêng hàng, chạy trốn, bò đi ám sát, đứng trên thuyền đều có việc NHIỀU PHA.
   · ⚠ **HẾT POST THÌ TRẢ NGƯỜI VỀ TUYẾN** — tháp sập mà cứ để `Garrison` thì
     `AIStateGarrison.TickFind` đứng tại chỗ chờ một cái sàn đã biến mất.
   · Tự gắn qua `[RuntimeInitializeOnLoadMethod]` + `sceneLoaded` (khuôn
     `PlayerRespawnBootstrap`) nên **45 scene đã bake KHÔNG phải dựng lại**.

   ⚠⚠ **CẬN CHIẾN LÊN THÁP LÀ ĐỂ GIẾT CUNG THỦ, KHÔNG PHẢI ĐỂ GÁC**
   (`StickmanAgent.HighGroundArcherRelief` = 0.35). `OtherFloorPenalty` (60) nói *"đánh người
   cùng tầng trước"* — vẫn đúng. Nhưng giữa HAI mục tiêu đều ở tầng khác nó chấm một anh kiếm
   trên tường ngang hệt một cung thủ trên tường, trong khi chỉ cung thủ mới là LÝ DO đáng leo
   lên (nó bắn xuống được; anh kiếm trên đó vô hại với người đứng dưới). Nay mục tiêu TẦM XA
   ở tầng khác chỉ chịu **60 × 0.35 = 21**.
   ⚠ **ĐỪNG HẠ THÊM**: 21 vẫn phải lớn hơn mọi khoản CỘNG của bảng điểm gộp lại (kết liễu 6 +
   tướng 8 + hung thần tối đa 21…), không thì cả tuyến bỏ trận dưới đất để đi leo tháp — đúng
   cái mà `OtherFloorPenalty` sinh ra để chặn.

   ⚠ **MUỐN ĐÔNG HƠN NỮA THÌ PHẢI NỚI SÀN, KHÔNG CHỈ TĂNG `_slotCount`.** Suất rải theo
   `_slotSpacing` (0.7) trên mặt sàn; nhồi thêm suất mà sàn vẫn hẹp là hệ giãn cách đẩy nhau
   RƠI XUỐNG — đúng lý do `GarrisonPost` chia suất ngay từ đầu. Bảng suất nằm ở
   `FortPieces.DefaultPieces()` (`slots`), sửa xong phải dựng lại thành.
   · **State tự lái cái thang** (`AIState.OwnsTraversal`) — pipeline có luật "hết địch thì
   buông thang", mà người đang leo lên trực chiến chưa có địch nào, để pipeline lái là rơi
   ngay nhịp đầu.
   · **Đứng bắn qua CHÍNH strategy của vũ khí**: bật cờ `Agent.IsGarrisoned`, strategy tự bỏ
   khâu giữ tầm. Cung thủ trên tháp vẫn tích lực / bù độ rơi / bắn theo loạt — không chép lại
   dòng nào. Viết riêng vòng bắn cho tháp là ngày mai thêm vũ khí phải sửa hai chỗ.
   · **Địch trèo lên tới sàn là BỎ SUẤT**, nhường cho FSM thường — đó là chỗ "cận chiến leo
   lên giết cung thủ" thành TRẬN ĐÁNH thay vì cảnh cung thủ đứng chịu chém. Cận chiến leo được
   là nhờ `TryStartClimb` sẵn có, không phải viết gì.
   · Sàn tháp là `PlatformEffector2D` **một chiều** — trèo thang chui qua từ dưới lên rồi đứng
   lên trên; sàn đặc thì thang dài mấy cũng đội đầu vào đáy sàn.
   ⚠ **BUÔNG THANG PHẢI ĐO BẰNG BÀN CHÂN, KHÔNG ĐO BẰNG GỐC TRANSFORM** (`AIState.ClimbReleaseY`,
   dùng chung cho Garrison · Infiltrate). Gốc nhân vật nằm THẤP HƠN bàn chân đúng
   `Locomotion.GroundOffset` ≈ 0.089 — cùng cái bẫy đã làm móng ngựa lún xuống đất. Bản cũ
   buông ở `platformY − 0.1`, tức bàn chân còn ~1cm DƯỚI mặt sàn; mà sàn một chiều KHÔNG đỡ
   người đang ở dưới → rơi thẳng xuống đất rồi state cho leo lại. **Cung thủ leo lên tụt xuống
   mãi, không lỗi nào báo** — chỉ là cái tháp không bao giờ có người gác.
   ⚠ Cùng lý do, `AlreadyOnPlatform` cũng đo bằng BÀN CHÂN và cửa dưới phải HẸP: để rộng
   (±0.6 quanh gốc) thì người còn lơ lửng dưới sàn cũng tính là "tới nơi".
   ⚠⚠ **TRÈO LÊN THÌ TRÈO CHO HẾT — CAM KẾT LEO** (`StickmanAgent._climbGoingUp` +
   `ClimbCommitTime` 6 s, 2026-09-03 — *"AI leo nửa cầu thang rồi nhảy xuống chứ không leo hết"*).
   `UpdateClimbing` đo bằng `heightGap` so với **MỤC TIÊU HIỆN TẠI**, mà mục tiêu thì đổi:
   `UpdateRetarget` chấm lại cả sân mỗi `retargetInterval`. Đang ở lưng chừng cây thang tháp
   canh thì kẻ đứng NGAY DƯỚI CHÂN THÁP có **khoảng cách NGANG ≈ 0** — mà mọi phép đo của AI là
   khoảng cách ngang (§5b-tang) — nên nó gần như luôn thắng điểm. `heightGap` lật dấu ⇒ dòng
   cuối hàm ra `Climb(-1)` ⇒ **tụt xuống**; xuống tới đất thì thằng trên nóc lại đáng đánh nhất
   ⇒ leo lại. Vòng lặp vô tận, **không lỗi nào báo**: mỗi nhịp nó đều đang đi về phía kẻ đáng
   đánh nhất.
   Đây là §5c ở dạng quen thuộc (hai luật đúng kéo ngược nhau) nên chữa bằng QUÁN TÍNH, đúng
   khuôn `cavalryRaidCommit` / `flankCommitTime` / `SlipCommitTime`: nhớ chiều leo lúc bám
   thang, và trong 6 giây thì **chiều LÊN không đọc `heightGap` nữa** — cứ trèo tới
   `zone.TopY` rồi mới xét lại. Mục tiêu chết thì vẫn buông ngay (`TargetAlive`).
   ⚠ Đừng chữa bằng cách cấm `UpdateRetarget` lúc đang leo: đổi mục tiêu giữa chừng là ĐÚNG khi
   con mồi trên nóc vừa chết. Thứ sai là để nó đổi luôn cả CHIỀU ĐI.

   ⚠⚠ **VÀ LUẬT ĐÓ PHẢI ÁP CHO CẢ BA ĐƯỜNG LEO — hai đường còn sót tới 2026-09-03** (người
   dùng quay được video: lính leo lên tháp, rớt xuống, leo lại, lặp mãi):
   · **`StickmanAgent.UpdateClimbing`** — đường PIPELINE, tức đường mà LÍNH THƯỜNG dùng để
     trèo lên giết cung thủ trên tháp. Nó buông thang khi *"chênh cao so với ĐỊCH < nửa
     `climbHeightThreshold`"*. Mà địch đứng TRÊN sàn có gốc transform thấp hơn mặt sàn đúng
     `GroundOffset`, nên "ngang tầm địch" rơi vào lúc **bàn chân còn dưới mép sàn hơn nửa
     mét** ⇒ buông là rơi ⇒ `TryStartClimb` lại thấy địch ở tầng trên ⇒ leo lại. Nay chiều
     LÊN chỉ buông khi bàn chân vượt `ClimbZone.TopY`, bất kể địch ở đâu; chiều XUỐNG giữ
     luật cũ (dưới chân là đất thật, nó đỡ mọi phía).
   · **`AIStateEscalade.TickClimbing`** — so `transform.position.y` với `TopY − 0.1`, tức hụt
     ~0.19. Nay dùng `ClimbedAbove`.
   ⚠ Bài học: `ClimbReleaseY` đặt ở LỚP GỐC `AIState` là để ba state DÙNG CHUNG — nhưng
   `StickmanAgent` KHÔNG phải `AIState`, nên nó nằm ngoài tầm với của cái lớp gốc ấy và bị bỏ
   quên đúng hai năm. **Thêm một đường leo mới thì tự hỏi nó có đi qua `ClimbReleaseY` không.**
   · Chia SUẤT vì sàn hẹp: mấy ông cung chen một chỗ là hệ giãn cách đẩy nhau rơi xuống.
   Người đang chốt trên sàn xếp `SeparationPriority` bậc 2 (cao nhất).
   ⚠ **POST ĐẶT Ở TÂM SÀN, KHÔNG TRÙNG TRỤC THANG.** Suất rải quanh trục post (±0.35 với 2
   suất) còn thang bám MÉP tháp — lấy trục thang làm tâm là suất ngoài cùng lọt RA NGOÀI mép
   sàn, hệ chặn-mép-vực giữ chân nên `MoveTowardsX` không bao giờ báo "tới nơi" và người giữ
   suất đó đứng đẩy vào không khí tới hết trận. `AIStateGarrison` có chốt chặn thứ hai (gặp
   mép thì đứng luôn tại chỗ, `_holdX`) để một post đặt sai vẫn dùng được.
   · **`CreateTower(..., passable: true)`** = chân tháp CHO ĐI XUYÊN QUA (collider thân thành
   trigger), sàn vẫn đặc. Game nhìn ngang chỉ có một làn: một cột đặc rộng 1 đơn vị là bịt kín
   đường. Với thành luỹ thì đó đúng là ý đồ; với CHÒI CANH rải giữa đồng thì nó biến cái tháp
   thành bức tường. Dùng lại quy ước của NHÀ CỬA ("collider TRIGGER — lính đi xuyên, đạn vẫn
   trúng"), và `HasGroundAt`/`ProbeObstacle` đều bỏ qua trigger nên không phải sửa gì ở AI.
   ⚠ **Hình cây thang phải nằm ở object CON.** `StickmanClimbZone` lấy `transform.position` làm
   CHÂN thang, mà sprite `Square` có pivot ở TÂM: kéo chính object ấy cao lên là nửa dưới tấm
   hình CHÔN XUỐNG ĐẤT còn thang chỉ lên tới lưng chừng tháp (đã dính 1 lần — nhìn ra ngay
   một cây cột thò xuống dưới mặt đất).
5. **THỢ SỬA CHỮA** (pha mới trong `AIStateWork`): **sửa trước, kiếm sau** — tường thủng thì
   mai không còn kho mà chở gỗ về. `NeedsRepair` lọc sẵn "sứt đủ nhiều mới đáng
   gọi thợ" (0.9) để thợ không bỏ mỏ vàng đi vá vết xước; chia suất `_maxRepairWorkers`; bỏ
   suất khi chạy trốn. Xây thì dùng lại `ResourceNode` kiểu `Build` có sẵn.
   ⚠ **SỔ SỬA CHỮA LÀ SỔ CHUNG** (`IRepairSite` + `RepairSites.FindJob`): cả `Fortification`
   (tường/cổng/tháp) lẫn **`BaseBuilding` (NHÀ CHÍNH)** đều vá được — trước đó hệ gõ cứng kiểu
   `Fortification` nên nông dân đứng cạnh nhìn nhà chính sập. Thợ hỏi MỘT chỗ; thêm loại công
   trình vá được = implement interface + `Register`, KHÔNG sửa AI. Nông dân thả vào scene bằng
   `SpawnFarmerShared`, giáo sĩ hồi máu bằng `SpawnPriestShared` (đúng công thức AI Lab bài 3:
   trượng thánh + profile Thầy thuốc GÁN THẲNG, không tin archetype).
   ⚠ Sổ đăng ký giữ kiểu `StickmanController`, KHÔNG giữ interface: null-check qua interface
   không đi qua phép `==` của Unity — công trình bị phá giữa chừng mà tham chiếu vẫn "khác
   null" (bẫy fake-null). `AIStateWork._repairTarget` cũng vậy.
   Dựng bằng `Tools > Stickman > Fortifications > 1` (sân test `Demo_21_Fortress`).



## ⚠⚠ QUYỀN ĐI XUYÊN KHÔNG ĐƯỢC NUỐT MẶT ĐỨNG (2026-09-06)

`Fortification.IgnoreWith` cấp `Physics2D.IgnoreCollision` giữa đơn vị và **mọi collider đặc**
của công trình. Nó chỉ chừa bậc cầu thang. Đó là GỐC RỄ của cả loạt báo lỗi «trèo lên rồi rơi»:

`StructureAssembler` khai tháp lắp ghép `passableForEveryone: true` (thân là trigger, ai cũng
đi xuyên) và tường lắp ghép `passableForOwner: true`. Vòng lặp ấy vì thế **vô hiệu hoá luôn
cái SÀN trên nóc** — lính trèo thang lên tới nơi thì sàn không còn tồn tại với riêng họ và họ
rơi xuyên xuống đất.

Không phép đo nào bắt được: kế hoạch hợp lệ, `StructurePlan.Validate()` xanh, collider CÓ tồn
tại và `MapBuildRules.ProbeLanding` vẫn dò thấy nó — vì nó chỉ bị bỏ qua với riêng CẶP collider
đó, thứ không ai truy vấn được từ ngoài.

Nay chừa thêm hai loại, cả hai đo trên hình thật:

| Chừa | Vì sao |
|---|---|
| `mine.usedByEffector` (sàn một chiều) | bỏ qua nó chẳng được gì — nó vốn không chặn đường đi ngang — mà mất trắng chỗ đứng |
| lớp mỏng ≤ 0.35 có mặt trên trong 0.2 dưới `WalkableTopY` | sàn/lối đi/sàn gỗ dày 0.12–0.18; THÂN tường dày 0.9–1.5 nên vẫn được cho qua như cũ |

⚠ Ngưỡng 0.35 / 0.2 hiệu chuẩn trên số THẬT của bảng chi tiết, không phải số tròn. Hạ ngưỡng
dày xuống dưới 0.18 là sàn tháp mất chừa; nâng lên quá 0.9 là thân tường hết đi xuyên được.
⚠ Tường thành `MapCastle.BuildCastleWall` không dính vì `FinishFort` gắn trên TỪNG KHÚC, còn
lối đi/sàn gỗ là con của gốc — tức cùng một lỗi mà hai đường dựng cho hai kết quả. Đừng chữa
bằng cách đổi chỗ gắn `Fortification`: chữa ở `IgnoreWith` thì mọi đường dựng đều được hưởng.

## DẢI TÓM CỦA MẶT DỐC GIẢ · NẮP HẦM (2026-09-06)

### ⚠ «Đi qua chỗ đó là rớt xuống» — không phải hình học, là dải tóm

Demo_46 (container), Demo_26 và tường thành: đi NGANG trên sàn, tới đúng chỗ dãy bậc kết thúc
dưới sàn là **tụt xuống một nấc rồi trôi xuống cầu thang**. Sổ hình học nói "khớp" (đỉnh thang
= mặt sàn, `audit_scene_landings` 0/4 lỗi) — vì lỗi không nằm ở hình học.

`StickmanStairs.CanStartRide` tha bàn chân cao hơn mặt dốc tới **+0.35**. Ở container
(`Container`: thang ở `leftX + 0.9`) và tường thành (`WalkwayOverStairs 0.4`) ba bậc trên cùng
CHUI DƯỚI SÀN, nên người đi trên sàn ở dải ấy có chân chỉ hơn mặt dốc 0.02–0.30 ⇒ bị coi là
"đã ở trên dốc", `UpdateStairRide` DÁN xuống mặt dốc (thấp hơn sàn) rồi cõng đi.

Chốt: `RideGrabAbove = 0.12` — cửa vào hợp lệ từ phía trên chỉ có MỘT (bước từ mép sàn vào
miệng dốc, chênh ≈ 0). Cao hơn thế là người ta đang đứng trên một mặt KHÁC, và mặt ấy giữ chân
họ. `MapBuildRules.WarnDeckOverStairs` đo quãng sàn phủ lên đầu thang; chỉ réo khi > 1.0
(tường thành 0.4 và container 0.9 là số thật, cố ý).

### Nắp hầm (`Nap_*`) — con của cầu thang nhưng KHÔNG phải bậc

Hầm chui (`MapScenery.BuildUnderpass`) có dãy bậc nằm DƯỚI mặt đất; mặt đất trên dãy bậc là
NẮP: con của root cầu thang, tên `Nap_*`, tag `Ground`.

| Ai | Bậc (`Bac_*`) | Nắp (`Nap_*`) |
|---|---|---|
| đi ngang trên nóc | đi xuyên (mặc định Auto) | **ĐẶC** |
| đang được cõng xuống | nhả | **nhả** |
| đứng trên bậc / đòi leo | đặc | đặc |

* `MeasureSpan` chỉ đo `Bac_*` — nắp kéo khung bao là `HighEndX` lệch, mặt dốc dẫn người tới
  chỗ không có bậc.
* `SetIgnore(unit, ignore, riding)`: nắp lấy `riding`, bậc lấy `ignore`. "Được đi xuyên dãy bậc"
  KHÔNG kéo theo nắp — không thì ai đi trên nóc hầm cũng rơi.
* Có nắp (`_lidCount > 0`) thì **xuống hầm phải ĐÒI** (`WantsStairs`): nóc hầm là làn chính,
  ai đi ngang cũng đạp lên đầu thang — cõng tự động là kéo cả đoàn xuống hầm.
* Nắp gắn SAU `Awake` ⇒ gọi `RescanSteps()`. Không gọi là nắp vô hình với sổ va chạm: đặc với
  cả người đang cõng ⇒ Box2D đẩy bật họ khỏi dốc.

## TỤT QUA SÀN MỘT CHIỀU — BA VAN AN TOÀN (2026-09-07)

Người dùng: *"đi tới chỗ này thì nó bị rớt xuống — sửa là lên cầu thang có thể đi qua lại bình
thường trên cầu"*. Nguyên nhân không nằm ở hình học cây cầu.

⚠⚠ `StickmanLocomotion.DropThroughPlatform` **KHÔNG NHÌN XUỐNG lấy một lần**. Nó chỉ hỏi "mình có
đang đứng trên sàn một chiều không" rồi nhả va chạm và đẩy người xuống. Ba hậu quả, không cái nào
có lỗi báo:

| Tình huống | Kết quả |
|---|---|
| giàn giáo 3 tầng, mục tiêu ở dưới đất | AI tự thả rơi cả chiều cao giàn, ăn sát thương, có khi chết |
| sàn bắc qua vực / sát mép map | tụt xuống là RƠI KHỎI MAP, `MapFallGuard` phải đi vớt |
| cầu gỗ thấp, mục tiêu dưới đất (gần như LÚC NÀO CŨNG vậy) | vừa leo lên là tụt xuống ⇒ vòng lặp **leo lên → rơi → leo lên**, cây cầu vô dụng |

Từ ngày `MapDressing` rải hành lang vòm và giàn giáo vào MỌI scene, mỗi cây cầu gỗ là một cái bẫy
như vậy — nên lỗi nổ ra ở khắp nơi cùng lúc.

### Ba van, tất cả ở MỘT nút thắt

`DropThroughPlatform` là chỗ duy nhất mọi đường tụt sàn đi qua (AI điều hướng · AI né đòn · người
chơi bấm xuống+nhảy), nên chặn ở đây là chặn hết.

1. **`HasLandingBelow`** — bắn tia xuống từ ĐÁY sàn đang đứng (không phải từ bàn chân: bắn từ bàn
   chân thì chính cái sàn dưới chân là vật cản đầu tiên, mọi cú tụt đều "đáp ngay tại chỗ"). Không
   có gì bên dưới, hoặc sâu quá `MaxDropThroughHeight` = 4.5 ⇒ từ chối.
2. **`HasProperWayDown`** — có cầu thang / thang trèo có ĐỈNH ngang mặt mình đang đứng, trong tầm
   9 đơn vị ⇒ đi lối đó, đừng nhảy. Chỉ áp cho **AI** (qua `CanDropThrough`); người chơi bấm là
   họ muốn, và cú tụt đã được xác nhận an toàn ở van 1.
3. **`LaneNav.MaxPlannedDrop`** — đồ thị làn thôi đẻ cạnh «tụt xuống» cao hơn 4.5.

⚠⚠ Van 3 BẮT BUỘC phải khớp số với van 1. Lệch nhau đẻ ra lỗi câm khó tra nhất trong nhóm này: đồ
thị vạch đường "từ sàn này tụt xuống đất", AI đi tới đúng chỗ đó rồi `DropThroughPlatform` từ chối
⇒ nó **đứng chôn chân ở mép sàn tới hết trận**, không rơi mà cũng không đi tiếp, và mọi hệ khác vẫn
báo "đang đi theo kế hoạch".

4.5 chọn theo `StickmanFallDamage._safeSpeed` (11): rơi tự do 4.5 đơn vị đạt chừng 9.4, vẫn dưới
ngưỡng ăn máu.

## ⚠⚠ LÊN THANG PHẢI LÊN TỪ MỘT ĐẦU — KHÔNG BỐC NGƯỜI TỪ LƯNG CHỪNG DỐC (2026-09-13)

User: *"vị trí leo lên cầu thang đúng hơn, hiện tại đang leo lưng chừng"*.

`StickmanStairs.CanStartRide` có vế *"đã ở TRÊN CAO thì cõng luôn"*, đo bằng
`feet.y > LowY + 0.25`. Vế ấy nói về **CAO ĐỘ**, và từ ngày mặt đất có đồi lượn / thềm / nóc công
trình thì cao độ **không còn đồng nghĩa với "đang ở trên dãy bậc"**: sườn đồi cạnh chân thành cắt
ngang thân dốc ở lưng chừng, người đi bộ trên sườn ấy có bàn chân nằm đúng trong dải
`[surface − 0.30, surface + 0.12]` ⇒ bị TÓM và cõng lên **từ giữa dãy bậc**. Không lỗi nào báo:
hình học của cả cầu thang lẫn quả đồi đều đúng, chỉ chỗ chúng gặp nhau là sai.

**Ba cửa vào hợp lệ ở trên cao, và cả ba đều KHÔNG phải "đang đứng trên một mặt khác":**

| Cửa vào | Đo bằng |
|---|---|
| Bước từ sàn trên vào miệng dốc | `IsOnUpperDeck` / `IsAtHighEntrance` |
| RƠI trúng mặt dốc | `GroundCollider == null` (phải cõng, không thì lọt xuyên) |
| Đang đứng trên chính dãy bậc này | `Owns(GroundCollider)` |

Còn lại là người ta đang được một mặt KHÁC giữ chân — mặt ấy đỡ họ, không phải mình ⇒ **từ chối**.
Họ đi nốt tới chân thang rồi leo; `StickmanAgent.RequestStairsIfNeeded` vốn đã lái về `LowEndX` nên
AI không mất đường nào, chỉ mất cú nhấc người giữa dốc. Bất biến gốc
**"ĐI XUYÊN LÀ MẶC ĐỊNH, LEO PHẢI ĐÒI"** không đổi, và vế NẮP HẦM (`_lidCount`) giữ nguyên.
