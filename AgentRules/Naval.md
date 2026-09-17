## THUỶ CHIẾN (Assets/Scripts/Naval/)

Hai hạm đội nã pháo, móc xích, tràn boong; hải tặc cướp thuyền buôn; đổ bộ chiếm đảo;
**chiến tranh hai đảo có kinh tế doanh trại** (§14 — thay cho ván giành cảng ở §12).
Chi tiết: `Docs/KnowledgeBase/NavalWarfare.md`.

1. **CON THUYỀN LÀ MỘT MẢNH ĐẤT BIẾT ĐI.** `ShipVessel` là MonoBehaviour thuần, KHÔNG kế thừa
   `StickmanController` — `StickmanLocomotion.HasGroundAt` cố tình bỏ qua mọi collider có
   `StickmanController` ở nhánh cha (người không phải đất), nên cho thuyền kế thừa
   `Fortification` là **cả boong thành hố không đáy**: người trên thuyền bị coi là ĐANG RƠI,
   không nhảy được, không chặn được mép, `BodyAnimator` chơi động tác rơi vĩnh viễn, và
   KHÔNG có lỗi nào báo. Máu nằm ở con `ShipHull : Fortification` với collider **TRIGGER**
   (để đặc là quân trên boong bị chính thuyền mình chặn lối, và `ProbeObstacle` nhận thân
   thuyền địch làm vật cản đáng đập giữa lúc giáp lá cà).
   ⚠ **Chỉ MỘT `Rigidbody2D` (kinematic) đặt ở ROOT** — thêm RB cho thân là `MovePosition`
   kéo boong đi còn thân đứng lại. ⚠ **Boong KHÔNG nằm trong nhóm `Visual`** (nhóm đó nghiêng
   lúc chìm; boong nghiêng là người đứng trên trượt lung tung).
2. **THUYỀN ĐI THÌ NGƯỜI ĐI THEO — sửa ở ĐÚNG CHỖ GHI VẬN TỐC.** `StickmanLocomotion.FixedUpdate`
   tính trong HỆ QUY CHIẾU CỦA BOONG (`velocity.x = carrierX + MoveTowards(velocity.x - carrierX, …)`),
   nên người chơi · AI · giãn cách · né đạn · kite · rút lui đều đi theo thuyền mà không nguồn
   nào phải biết mình đang trên thuyền. Con thuyền được **dò ra từ chính tia dò đất đã có**
   (`Locomotion.Carrier`), không có hàm lên-thuyền / xuống-thuyền nào cả.
   ⚠⚠ **CON THUYỀN PHẢI ĐỌC `_body.position`, KHÔNG ĐỌC `transform.position`.** Thuyền là
   Rigidbody2D KINEMATIC bật `Interpolate`, nên `transform` là vị trí ĐÃ NỘI SUY cho khâu VẼ —
   lệch sau vị trí vật lý tới một nhịp. Lấy nó làm mốc rồi cộng `_speed × dt` thì mỗi nhịp con
   thuyền được lệnh đi tới một chỗ NGAY SAU LƯNG chính nó: thuyền vẫn nhích, nhưng nhích ÍT HƠN
   `_speed × dt`. Kết quả là *"cầm lái thì tàu chạy mà mình với đồng đội bị thụt lùi lại sau"* —
   người trên boong ăn `DeckVelocity`, mà số đó đo từ cùng cái transform lệch ấy, nên đi chậm
   hơn con thuyền và trôi dần về đuôi. Không lỗi nào báo.
   `StickmanLocomotion.MeasureTravel` đã đọc `_body.position` đúng vì lý do này từ đầu; chỉ có
   `ShipVessel` là còn sót (cả lúc đi, lúc đo vận tốc boong, lẫn lúc chìm).

   Ba vế phụ: `MeasureTravel` phải **TRỪ** vận tốc boong (không thì đứng im mà chân quạt rối
   rít) · giữ `_carrier` khi đang BAY (không thì nhảy trên boong bị hãm lại giữa trời) ·
   `SetSwimming` là **Ô HỆ SỐ RIÊNG** (nguồn thứ tư ghi chung ô với ngựa/giáp/trạng thái là
   lại đúng bug mặc-giáp-xong-con-ngựa-hết-nhanh).
3. **ÁP MẠN = ĐƯỜNG ĐI KHÔNG TRÙNG HƯỚNG TỚI ĐỊCH** (`AIBehavior.Board` + `AIStateBoarding`).
   `MoveTowardsX(target.x)` hỏng câm trên biển: giữa hai thuyền là nước, chặn mép vực làm lính
   đứng ở mạn vĩnh viễn còn van gỡ kẹt thì bật XÔNG LIỀU = dí mặt vào lan can mạnh hơn. Phải
   đi tới TẤM VÁN trước, dù ván nằm ngược hướng kẻ định giết (cùng lý do `AIStateGarrison` có
   pha tới-chân-thang). Bốn pha: **DỌN BOONG** (địch trên thuyền mình thì xử trước — bỏ vế
   này là hai bên đi xuyên qua nhau, mỗi bên chiếm một thuyền rỗng) → **CHỜ Ở MẠN** (cận chiến
   ĐỨNG, tầm xa trao lái cho `CombatState` mà bắn) → **QUA VÁN** (`OwnsTraversal`, hai chặng) →
   **SANG TỚI NƠI**. ⚠ `HandOff()` KHÔNG gọi `DefaultState()` — hành vi vẫn là `Board` nên nó
   trả về chính state này: vòng lặp vô tận.
4. **VÁN PHẢI KHOÁ THUYỀN TRƯỚC** (`BoardingPlank.Deploy` → `ShipVessel.Grapple`): hai thuyền
   trôi độc lập thì đầu kia tuột khỏi mạn ngay nhịp sau và người đang đi giữa ván rơi xuống
   biển. ⚠ **Ván nằm NGANG → mọi hạng thuyền phải cùng `deckHeight`** (hệ di chuyển ghi thẳng
   vận tốc ngang nên mặt dốc thì trượt — đúng lý do công sự dùng CẦU THANG BẬC RỜI).
   ⚠ **Đã móc xích thì KHÔNG RÚT ĐƯỢC**: bung xích giữa chừng là cả đội áp mạn kẹt lại trên
   thuyền địch còn thuyền nhà bỏ đi.
5. **CON THUYỀN CẦN NGƯỜI — đây là khác biệt lớn nhất so với bộ chiến.** `ShipStation` (Helm ·
   Gun · Marine) là **ĐẦU VÀO GHI MỖI FRAME**, không phải cờ bền (cùng khuôn `SetActionLegs` /
   `RequestSentry`): giết người lái là thuyền TRÔI, đánh văng pháo thủ là pháo im, thuyền chìm
   kéo cả tổ xuống nước cũng tự làm liệt con thuyền — cả ba mà không có dòng xử lý riêng nào.
   `AINavalModule` (nằm trong `DefaultKinds`, **tự tắt khi scene không có `WaterZone`**) lo hai
   việc: **BỎ THUYỀN ĐANG CHÌM** (đè lên tất cả — thuyền-đang-chìm là thông tin KHÔNG state
   nào biết đọc, thiếu nó là cả tiểu đội đứng đánh nhau tới lúc chết đuối) và **VÀO SUẤT** (ưu
   tiên theo VŨ KHÍ ĐANG CẦM, không đẻ thêm trường vai-trò-thuỷ-thủ; có địch lên boong là BỎ
   SUẤT ngay — cùng bài học `AIStateGarrison`).
5b-loi. ⚠⚠ **THUYỀN TRƯỞNG CHỌN LỐI ĐÁNH BẰNG TÌNH HÌNH, KHÔNG BẰNG ĐỒNG HỒ** (2026-09-07).

   Bản cũ chạy một kịch bản CỐ ĐỊNH: nã pháo `_broadsideDuration` giây rồi **luôn luôn** sáp
   vào áp mạn — bất kể boong mình còn hai người hay tám, bất kể địch còn nguyên hay sắp chìm.
   Nhìn từ ngoài là *"mọi con thuyền lao vào vô nghĩa"*, và tệ nhất là nó lao vào cả những
   trận cầm chắc thua (chiến thuyền 3 thuỷ thủ tự bắc ván sang thuyền cướp 6 tên).

   Nay `ShipCaptain` chấm bằng thứ ĐO ĐƯỢC (`ShipVessel.CrewCount`, `HealthFraction`,
   `CanBombard`, `cruiseSpeed`) và chọn một trong ba: **Board** (hơn quân `_boardingEdge` lần ·
   địch sắp chìm · mình không có pháo · nã mãi không xuống máu) · **Bombard** (giữ tầm mà nã —
   nước đi mà bản cũ KHÔNG BAO GIỜ chọn, và là lý do mấy khẩu pháo tồn tại) · **Withdraw**
   (về cảng vá, xem §12).
   ⚠ **Nghĩ lại mỗi `_thinkInterval`, đã quyết thì giữ `_closeCommit`** — nghĩ lại mỗi frame là
   thuyền rung tại chỗ (§5c). Ngoại lệ DUY NHẤT được phá cam kết là Withdraw.
   ⚠ **Chỉ LÙI khi chạy nhanh hơn nó** (`IsFasterThan`): chiến thuyền 1.4 lùi trước thuyền cướp
   2.1 là vừa mất tầm vừa quay lưng. Chậm hơn thì ĐỨNG mà nã — cùng cách nghĩ `IsCornered`.
   ⚠ **Sát mạn rồi thì AI CŨNG móc xích**, không hỏi lối đánh nữa: chiếc đang "giữ tầm" mà bị
   dí sát mạn thì không còn tầm nào để giữ; bỏ vế này là hai thuyền chạm nhau mà không bên nào
   bắc ván, cứ thế trôi song song.
   ⚠ **Van chống bế tắc**: nã `_bombardPatience` giây mà máu địch không xuống nổi 8% thì vào
   luôn — pháo thủ chết hết là pháo câm, mà con thuyền không có cách nào tự biết điều đó.
6. **PHÁO KHÔNG PHẢI `WeaponBase`.** Cho pháo thủ cầm một `RangedWeapon` 6 damage tầm 16 là
   **phá nát bảng cân bằng vũ khí** (mốc điểm 3.5) và ai nhặt được là chạy bộ với khẩu pháo.
   Pháo là THIẾT BỊ CỦA THUYỀN, nhắm **THÂN THUYỀN** chứ không nhắm người — đó là cái làm hai
   tuyến hoả lực không giẫm nhau (pháo đánh chìm, cung thủ dọn người). Nhịp nạp CỐ Ý CHẬM
   (4.5s): pháo bắn nhanh là trận xong trước khi ai kịp áp mạn, mà áp mạn mới là phần chơi được.
   Chia đều HAI MẠN — game nhìn ngang, để pháo một mạn là nửa số trận đứng nhìn.
   ⚠⚠ **SÁT THƯƠNG ĐI THẲNG VÀO MỤC TIÊU; VIÊN ĐẠN CHỈ LÀ PHẦN NHÌN THẤY** (vá 2026-09-07).
   Bản cũ bắn một `ProjectileLaunch` rồi trông vào cú va chạm của nó để trừ máu. Cái đó
   **HỎNG CÂM**: `Fortification` (thân thuyền LẪN cảng) khai `ImmuneToRanged = true`, mà cả
   `ProjectileController` lẫn `Explosion` đều BỎ QUA công trình miễn đòn tầm xa. Nghĩa là chỉ
   cần trong scene có MỘT người cầm cây ném bom — lúc `Equip` nó tự `Register("bomb")` — là
   mọi khẩu pháo trên bản đồ thành đồ trang trí: vẫn nháy lửa, vẫn có đạn bay, mà không con
   thuyền nào mất một điểm máu. Nay pháo cư xử đúng như nó được khai: THIẾT BỊ CỦA THUYỀN gây
   damage thẳng (cùng đường `SiegeEngine` húc cổng), viên đạn bắn thêm để nhìn thấy và để quét
   NGƯỜI trên đường bay. Cũng chính nhờ vế này mà pháo bắn được CẢNG (§12).
6c-chon. ⚠⚠ **THUYỀN TRƯỞNG PHẢI CHẤM ĐIỂM, KHÔNG ĐÁNH "CÁI GẦN NHẤT"**
   (`ShipVessel.SelectBestEnemy`, 2026-09-05).

   `ShipCaptain.TickEngage` gọi `ShipVessel.NearestEnemy` — hàm trả đúng thứ nó hứa, chỉ là
   bị hỏi SAI CÂU. Hệ quả: cả hạm đội đánh như nhau, và hai thứ hỏng trong im lặng:
   · **hải tặc đâm vào chiến thuyền hộ tống** vì nó đậu gần hơn, còn chiếc THUYỀN BUÔN — thứ
     mà cả `Demo_35_PirateRaid` xoay quanh — đi ngang qua mặt; luật thắng của màn gần như
     không bao giờ được chạm tới;
   · **cả hạm đội dồn vào một chiếc đã bị khoá xích** (trận đó đã do giáp lá cà quyết, thêm
     thuyền nữa cũng không nhanh hơn) trong khi chiếc địch còn lại rảnh tay bắn phá.

   Bốn ô điểm, cùng khuôn `StickmanAgent.SelectBestEnemy` của bộ binh: **con mồi của cướp**
   (Raider/Longboat gặp Merchant, −14) · **kết liễu** (theo máu đã mất, tối đa −9) · **đừng
   dồn vào chiếc đã khoá xích** (+16) · **thuyền mất lái** (−5). Khoảng cách vẫn là nền, nên
   mấy ô này chỉ DỜI thứ tự trong tầm nhìn chứ không cho bỏ mặt trận đi tìm mồi ở đầu kia map.

   ⚠ **`TickFlee` GIỮ NGUYÊN `NearestEnemy`** — chạy trốn thì câu hỏi đúng là *"đứa gần nhất
   ở đâu để chạy ngược lại"*, không phải *"đứa nào đáng đánh nhất"*. Hai câu hỏi khác nhau thì
   hai phép đo khác nhau (§2b-cong-bis).

   ⚠ Đo bằng mô phỏng bảng điểm trước khi tin: hải tặc bỏ chiếc gần nhất (d=6, đã khoá xích)
   để đi bắt thuyền buôn ở d=16; chiến thuyền bỏ chiếc nguyên vẹn ở d=10 để kết liễu chiếc
   còn 20% máu ở d=14. Không mô phỏng thì mấy con số này chỉ là ước đoán.

6b-song. ⚠⚠ **SÓNG NƯỚC VÀ THUYỀN NỔI — MỘT CÔNG THỨC, HAI HỆ ĐỌC CHUNG**
   (`WaterWaves` · `WaterSurface` · `ShipWaveMotion`, 2026-09-05).

   Trước đó biển **đứng im tuyệt đối**: `WaterZone` chỉ là vùng trigger + một dải màu phẳng,
   `ShipVessel` chỉ biết CHÌM. Thứ duy nhất báo "đây là nước" là lúc rơi xuống rồi mất máu.

   ⚠⚠ **`WaterWaves` LÀ NGUỒN SỰ THẬT DUY NHẤT VỀ HÌNH DẠNG SÓNG.** Mặt nước và con thuyền là
   hai hệ khác nhau; cho mỗi bên tự dao động bằng một `sin` riêng thì **chạy đúng nhưng nhìn
   ra ngay là sai** — thuyền nhô lên trong lúc mặt nước dưới nó trũng xuống, mắt đọc ra
   *"thuyền không dính vào nước"*, và không lỗi nào báo vì cả hai đều đang dao động rất đẹp.
   Ai muốn biết mặt nước ở đâu thì HỎI ĐÓ.
   · **Tổng BA sin** lệch cả tần số lẫn HƯỚNG CHẠY (sóng thứ ba chạy ngược) — một `sin` đơn ra
     sóng hình cưa đều tăm tắp, mắt đọc ra "đồ thị" chứ không ra "biển". Cùng thủ thuật ba sin
     lệch tần của ngọn lửa `CampFire`.
   · **KHÔNG `Random` mỗi frame**: sóng phải là hàm của (x, thời gian), có vậy hỏi lại cùng
     một điểm mới ra cùng kết quả và con thuyền mới bám được vào mặt nước.
   · Biên độ nền CỐ Ý NHỎ (0.14): nhân vật cao 0.73, boong cao hơn mặt nước ~1.1 — sóng nửa
     mét là thuyền chồm như tàu lượn. Biển động vặn bằng `WaterWaves.Swell` (hệ số nhân LÚC
     ĐỌC, vì `WaterZone` đã bake trong ba scene).

   ⚠⚠ **THUYỀN NHẤP NHÔ Ở PHẦN HÌNH, TUYỆT ĐỐI KHÔNG Ở BOONG.** `ShipVessel` vốn đã tách
   `_visual` khỏi `_deckCollider` (chú thích ở đó: *"boong nghiêng là người đứng trên trượt
   lung tung"*). Nâng **hình** thì thuyền trông như đang nổi; nâng **boong** thì cả tiểu đội
   trên đó bị Box2D đẩy lên rồi rơi tự do mỗi nhịp sóng — hệ di chuyển chỉ bù trục X của sàn
   biết đi (`Locomotion.Carrier`), trục Y không ai lo.
   · **NGHIÊNG THEO ĐỘ DỐC MẶT NƯỚC** (`SlopeAt`), không theo đạo hàm thời gian: thuyền phải
     song song với sườn sóng nó đang nằm trên; đo "đang lên hay đang xuống" cho ra thuyền chúi
     mũi lúc sóng phẳng.
   · **NHƯỜNG KHI ĐANG CHÌM** — lúc đó `_visual` đã có chủ khác (hệ chìm hạ + nghiêng nó).
     Hai chủ một transform là đúng luật số 1 của hệ animation.
   · **Chụp tư thế nghỉ MỘT LẦN** ở `Start`; đọc lại mỗi frame là phần bù của chính mình cộng
     dồn và con thuyền trôi dần lên trời (bẫy "đầu vào ↔ biến tích luỹ").

   ⚠ **HẠNG THUYỀN NAY ĐỌC ĐƯỢC BẰNG MẮT**: biên độ chia theo `HalfDeck` — longboat chòng
   chành rõ, chiến thuyền gần như đứng yên. Trước đó bốn hạng chỉ khác nhau ở bảng số, đứng
   cạnh nhau nhìn y như nhau.

   ⚠ **KHÔNG cần art**: `LineRenderer` chỉ đòi một `Material` — shader `Sprites/Default` (luôn
   có trong build, tôn trọng màu đỉnh). Vẽ ở bậc `StickmanWorldSorting.WaterSurface`, tức DƯỚI
   thuyền: sóng là NỀN. Đưa lên trên thân thuyền là mỗi con thuyền bị một vệt trắng cắt ngang.
   ⚠ Đường BỌT đọc mặt nước LỆCH PHA (`FoamLead`) — trùng khít sóng thì hai đường chồng thành
   một vệt dày vô nghĩa.

   ⚠ **KHÔNG phải dựng lại scene**: `WaterSurface` tự gắn ở `WaterZone.OnEnable`,
   `ShipWaveMotion` tự gắn ở `ShipVessel.Awake` (khuôn `PlayerRespawnBootstrap`).

7. **BIỂN LÀ CÁI VỰC — phần hay nhất là phần KHÔNG phải viết.** Mép boong vốn đã là mép vực nên
   lính tự biết không bước xuống, AI kite lùi tới mạn là tự dừng, bị dồn ra mũi thuyền thì
   `IsCornered` → **TỬ CHIẾN**. `WaterZone` chỉ còn vế rơi-xuống-là-chết-đuối, trừ máu qua
   đúng một đường `TakeDamage`. ⚠ **Chỉ ăn NGƯỜI** (lọc bằng có-`StickmanLocomotion`) — không
   lọc thì `ShipHull` ngập nước cũng mất máu và **mọi con thuyền tự chìm** mà không ai bắn.
   ⚠ Đáy biển = object **Ground bị dìm xuống** (`ValidateScene` bắt buộc phải có nó, và nó
   đúng: thiếu mặt đất thì tên bay ra khỏi map không bao giờ thu hồi được).

8. **AI TỪNG TỰ NHẢY XUỐNG BIỂN — đã sửa ở GỐC, đừng vá lại ở tầng thuyền.**
   `StickmanAgent.UpdateJumpOverGap` cũ hỏi đúng ba câu (*có mép trước mặt · địch có ở bên kia ·
   hồi đủ nhịp nhảy chưa*) và **không câu nào hỏi bên kia CÓ GÌ**. Trên bộ sống sót được vì khe
   thường hẹp; trên biển thì "bên kia mép" là mặt nước trải tới chân trời mà địch thì luôn đứng
   ở đó — điều kiện nhảy đúng MỌI LÚC, nên cả hai phe lần lượt nhảy khỏi mạn chết đuối.
   Chữa bằng `StickmanLocomotion.HasLandingSpot(direction, maxDistance)` + `AIProfile.jumpGapReach`
   (2.6): **có chỗ đáp mới nhảy**. Đặt ở tầng locomotion vì đây không phải bệnh của thuỷ chiến
   mà là bệnh của mọi map có hố sâu — vá riêng cho thuyền là để nguyên bug cho map khác và đẻ
   thêm một nhánh `if (đang ở trên thuyền)`.
   Hai chỗ cùng bệnh đã vá kèm: `AINavalModule.Abandon` (thuyền chìm thì tới mép là nhảy →
   nay phải có chỗ đáp) và `BoardingPlank` (**không thu ván khi còn người đang đi trên đó** —
   thu đúng lúc đó là người ta rơi thẳng xuống nước).
9. **TAY LÁI: một điểm, nhìn thấy được, có dáng đứng riêng, và người chơi giành được.**
   Mỗi thuyền đúng MỘT `ShipStation` vai Helm ở ĐUÔI, kèm **BÁNH LÁI vẽ ra** (`Ship_Wheel`) —
   không có hình thì cách duy nhất để người chơi biết chỗ nào lái được là đi mò dọc boong.
   · **Dáng lái** = STYLE `"helm"` của `Idle` (`StickmanBodyAnimator.HelmStyle`, `weight = 0`),
   KHÔNG phải `StickmanActionType` mới — đúng tiền lệ dáng canh gác. Hai tay `Override` nắm
   vành (`Blend` thì pose cầm vũ khí kéo tay về thế thủ, thành nửa nắm lái nửa giơ kiếm).
   ⚠ `IsSteering` **TỰ HẾT HẠN sau một frame** (`RequestSteering()` ghi mỗi frame), khác
   `IsStandingWatch` vốn được `StickmanAgent.ApplySentry` dọn hộ: **người chơi KHÔNG có agent**,
   nên bắt bên gọi nhớ tắt là buông lái xong vẫn ôm bánh lái vô hình đi khắp boong.
   ⚠ Phải chạy lại bộ động tác mới có style này — `Naval > 2` gọi thẳng
   `StickmanActionSetBuilder.EnsureAll(rebuild: true)`, vì `EnsureAll(false)` thấy bộ cũ còn đủ
   sẽ bỏ qua và `Pick` rơi về idle ngẫu nhiên: không lỗi, chỉ là không thấy dáng lái.
   · **Người chơi cầm lái** qua `ShipHelmPrompt`: ô **`GUI.Button`** (không phải `GUI.Label` —
   luật "mọi tính năng phải dùng được chỉ bằng ngón tay"), phím **F** (không dùng chung E với
   nhặt đồ). Lúc cầm lái thì `UseMoveInput` tắt và trái/phải chuyển sang `ShipVessel.SteerManual`
   — không tắt thì bấm sang trái là vừa bẻ lái vừa đi khỏi bánh lái, mà rời vị trí là mất lái:
   bấm lái thì mất lái. `SteerManual` **đè lệnh thuyền trưởng theo TỪNG FRAME** chứ không tắt
   hẳn `ShipCaptain` (ông ta còn lo móc xích + bắc ván; tắt là lái sát mạn địch mà không có
   cầu nào bắc ra). Buông lái ở BỐN đường: bấm lại · chết · thuyền chìm · mất suất.

10. ⚠⚠ **NGƯỜI ĐỨNG TRÊN SÀN BIẾT ĐI KHÔNG NHẬN LỆNH TUYẾN CỦA MODE**
   (`MatchModeBase.ApplyOrders`, hỏi `Locomotion.Carrier != null`). Cột mốc của mode nằm trên
   ĐẤT LIỀN, giữa boong và bờ là NƯỚC — bảo người trên thuyền đi tới đó là bảo họ đi xuống
   biển, mà mép boong vốn đã là mép vực nên họ đứng rung ở mạn còn van gỡ kẹt thì bật XÔNG
   LIỀU (§3). Nặng hơn: `AINavalModule.UpdateStation` chỉ giữ suất khi `Behavior == FreeRoam`,
   nên **một bản lệnh của mode là cả hạm đội buông tay lái và bỏ pháo** — thuyền trôi, pháo im,
   KHÔNG LỖI NÀO BÁO. Cùng họ hai ca đã có sẵn ở đó (`Garrison` · `Escalade`): nhiệm vụ NHIỀU
   PHA thì mode không được cắt ngang.
   ⚠ Hỏi bằng `IMovingPlatform` (hợp đồng Core), ĐỪNG hỏi `ShipVessel` — Gameplay nằm DƯỚI Naval.

11. ⚠⚠ **CHIẾM ĐẢO TỪNG KHÔNG CÓ AI BƯỚC VÀO VÒNG CHIẾM.** `NavalBattle` chấm bằng
   `CapturePoint.ScoreOf` nhưng **không khai `BuildOrders`**, nên đội đổ bộ sinh ra với
   `HuntTarget` + mục tiêu NULL = *"đánh đứa gần nhất"*: lên tới bờ là đánh nhau ngay mép nước
   rồi đứng đó, điểm chiếm đứng im ở 0, **trận không bao giờ ngã ngũ**. Nay cả hai phe nhận
   `GuardTarget` vào chính cái vòng — không thêm cơ chế nào, `AIStateGuard` vốn đã biết đứng
   chốt rồi xông ra khi địch tới gần.
   ⚠ CHỈ khai cho `SeizeIsland`: hai mục tiêu kia thắng bằng THUYỀN và `ShipCaptain` mới là
   tầng điều phối ở đó — phát thêm lệnh bộ binh là hai hệ giằng nhau (§4b-bis).

**CHÒI QUAN SÁT TRÊN CỘT BUỒM** là phép thử của kiến trúc: `StickmanClimbZone` + `GarrisonPost`
+ sàn `PlatformEffector2D` một chiều, cung thủ `AIBehavior.Garrison` tự trèo lên bắn — **không
một dòng AI mới**. Một cái tháp trôi trên mặt nước vẫn là một cái tháp.

**HẢI TẶC** là nền văn minh thứ 10 (`Pirate`), không phải loại nhân vật mới: khăn bịt đầu + áo
choàng da, **KHÔNG khiên** (thiếu file `Shield_*` = builder hiểu nền này không dùng khiên, y
như Nhật), tuyến đầu là **song đao** thay lính khiên, có súng hoả mai (`Weapon_Pistol` mượn
của bộ hiện đại — bảng vũ khí là bảng CHUNG, `GenreDefinition.weapons` chỉ là bộ lọc) và lựu
đạn.
⚠ **ĐÔNG và NHẸ — cả bộ khai `rank: UnitRank.Levy`.** Luật cấp mặc định cho vai `Shield` →
Tinh nhuệ và `Melee` → Chính quy; áp thẳng vào là ra một bọn cướp biển mặc giáp 9 điểm và chạy
còn **62% tốc độ**, chậm hơn cả bộ binh chính quy — ngược hẳn thứ định làm. Khai rõ `Levy` để
phá luật đó (đúng cách kỵ xạ Mông Cổ phá luật "cưỡi ngựa = tinh nhuệ"), đổi lại bằng SỐ LƯỢNG:
5–6 tên áp mạn mỗi thuyền so với 2–3 của hải quân.
⚠ **"Hải tặc không có sprite" từng là bug thật, và không nằm ở art**: bộ art đã sinh đủ và
`Civ_Pirate` đã có, nhưng **không ai ÁP nó lên quân trong scene thuỷ chiến** nên hai phe ra
trận đều là stickman đen trơn giống hệt nhau. Nay `CrewShip`/`SpawnAshore` nhận tham số `civ`,
và `StickmanNavalBuilder.CivOf(key)` tự dựng bộ văn minh nếu máy chưa từng bấm
`Civilizations > 2` (bộ đó KHÔNG nằm trong `EnsureAllAssets`).
⚠ **NGƯỜI CHƠI TRÊN BOONG CŨNG PHẢI KHOÁC NỀN CỦA PHE MÌNH** (`SpawnPlayerOnDeck(..., civ:)`).
Thuỷ chiến KHÔNG có `CivilizationTeamAssigner` (nền chốt lúc dựng scene) nên không ai vá lại
lúc chạy: `SpawnCrew` khoác áo cho thuỷ thủ, còn người chơi thì trước đây chỉ được ĐẶT VỊ TRÍ —
ra một ông stickman đen trơn đứng giữa tổ mặc đồ hải quân. Phải TRUYỀN civ vào, đừng mượn
`_crewCiv` của đợt spawn gần nhất: ở cả ba bài, lần `CrewShip` cuối là của HẢI TẶC.
⚠ Dùng `ApplyLookTo(unit, wearEquipment:)` chứ KHÔNG dùng `ApplyTo` — `ApplyTo` áp cả loadout
nên đổi luôn cây vũ khí theo quân chủng của nền, xoá sạch việc phân vai (người lái cầm cận
chiến, xạ thủ cầm cung). `wearEquipment` chính là chỗ chia hai bên: hải quân `true` (nón + giáp
thật, có sức nặng), hải tặc `false` (chỉ lớp nhìn). ⚠ Thuỷ thủ + hải tặc để `retreatHealthPercent = 0`: trên biển **không có chỗ nào để chạy**,
cho ngưỡng rút lui > 0 là cả boong lùi về đuôi rồi đứng rung ở mép (§5c, chữa bằng cách bỏ hẳn
một vế thay vì thêm vùng chết).

12. ⚠⚠ **VÁN THUỶ CHIẾN PHẢI CÓ CHỖ ĐỂ GIỮ, CHỖ ĐỂ PHÁ VÀ TIỀN ĐỂ TIÊU** (2026-09-07).

   Bốn hệ mới, và cả bốn là HỆ CHUNG chứ không phải mã riêng của một scene:
   `NavalPort` · `NavalWarChest` · `NavalFleetCommand` · tầng chọn lối đánh trong `ShipCaptain`.
   Bài mẫu: `Demo_49_NavalCommand` (`NavalGoal.PortAssault`).

   **Bệnh cũ:** luật thắng duy nhất đáng kể là *giết tới khi bên kia hết thuyền hoặc hết người*,
   nên **không có chỗ nào đáng tới và không có chỗ nào đáng giữ** — mọi con thuyền lao vào nhau
   ở giây đầu, người chơi đọc ra đúng một câu *"nó lao vào vô nghĩa"*, và cả ván không có một
   quyết định nào ngoài vung kiếm.

   · **`NavalPort` = cảng nhà.** Phần có máu là một `Fortification` bình thường (kho hàng), file
     kia chỉ là cái nhãn "khối đó là cảng phe 1, bến ở X". Nó trả lời BỐN câu một lúc: đánh đi
     đâu · giữ cái gì · rút về đâu (ụ sửa vá thuyền đậu gần bến) · tiền ở đâu ra.
     ⚠ **CHỈ PHÁO PHÁ ĐƯỢC CẢNG** (`Fortification.ImmuneToRanged`, mà bộ binh thì không lội qua
     biển) — ràng buộc CÓ CHỦ Ý: một hạm đội toàn thuyền cướp là một hạm đội không có cửa thắng,
     nên "mua chiến thuyền / nâng pháo" mới là quyết định thật.
   · **`NavalWarChest` = ví tiền** (bản thuỷ của `TeamEconomy`, rút gọn): 4 khoản —
     thuỷ thủ · vá thân · nâng pháo · hạ thuỷ thuyền dự bị. Thu nhập nền **NHÂN với máu cảng**
     (mỗi phát đạn vào cảng có tác dụng ngay, không phải đợi nó sập) + thưởng giết người +
     thưởng đánh chìm. Cả ba đi qua đúng cửa `Earn`.
     ⚠⚠ **Người và thuyền mua về đều là BẢN SAO của thứ đã dựng sẵn trong scene**, không
     `Instantiate` từ prefab — đúng lý do `GameSession.ApplyTroopCount` nhân bản lính có sẵn:
     bản dựng tay chắc chắn sót `AIModuleBinder` (module Naval), và sót là lính mua về không
     vào suất pháo, không bỏ thuyền đang chìm, chết đuối theo thuyền mà KHÔNG lỗi nào báo.
     ⚠⚠ **Thuyền dự bị phải cất theo NHÓM (thuyền + tổ lái), tắt cả nhóm.** Thuỷ thủ không được
     parent vào thuyền (§1) nên họ là object rời: tắt mỗi con thuyền là cả tổ đứng lơ lửng giữa
     biển và chết đuối ở giây đầu trong khi thuyền còn nằm trong kho. Nhóm cha phải ĐỨNG YÊN.
     ⚠ Vá thân đi qua `Fortification.Repair` (tức `Heal`), **KHÔNG** `SetMaxHealth`: hàm đó tiện
     tay hồi ĐẦY máu cho thứ còn sống, nên một khoản "+máu tối đa" giá rẻ lặng lẽ thành một
     khoản hồi máu toàn phần.
     ⚠ Nâng pháo tính từ **SỐ GỐC** (`ShipCannon.SetUpgradeTier`), không nhân dồn vào số đang có
     (bẫy "đầu vào ↔ biến tích luỹ" của §6b-song), và phải áp lại sau MỖI lần hạ thuỷ — không
     thì chiếc mới ra khơi bắn yếu hơn chiếc cũ.
   · **`NavalFleetCommand` = ai giữ nhà, ai đi đánh.** Bắt từng thuyền trưởng tự quyết "có nên bỏ
     nhà đi săn không" là mỗi chiếc quyết một kiểu và **cả hạm đội cùng bỏ nhà**. Giữ lại đúng số
     chiếc bằng số mối đe doạ quanh bến (cảng thủng nửa máu thì +1), phần còn lại: có pháo → đánh
     cảng, không pháo → săn thuyền.
     ⚠ **Luôn chừa ít nhất MỘT chiếc đi đánh** — hai bên cùng thủ nhà là ván đứng im tới hết giờ,
     đúng bệnh "chiếm đảo mà không ai bước vào vòng chiếm" (§11).
     ⚠ **Không cướp lệnh `SailTo`** — đó là việc riêng trọng tài đã giao (thuyền buôn, thuyền đổ bộ).
   · **Luật thắng** (`NavalBattle.TickPorts`): phá cảng địch = thắng, mất cảng nhà = thua, hết giờ
     thì so **máu cảng** (tuyên hoà khi một bên còn 20% bên kia còn 90% là xoá sạch cả ván chơi).
     ⚠ **Van chống bế tắc bắt buộc**: phe không còn chiếc nào nổi VÀ hết thuyền dự bị là hết đường
     ra khơi — chấm dứt ở đó, không thì trận treo vĩnh viễn với một bên gõ cửa cảng bên kia.
   · **Doctor canh bốn mối nối này** (`StickmanDoctor` › «Thuỷ chiến — cảng / ví tiền nối thiếu»):
     khai `PortAssault` mà scene không có `NavalPort` · ví thiếu mẫu thuỷ thủ · kho thuyền rỗng ·
     có ví mà không có cảng. Cả bốn hỏng CÂM nên phải là PHÉP ĐO, không phải một đoạn ⚠.
   · **Máu cảng đo theo hoả lực thật** (200): game nhìn ngang nên chỉ khẩu ĐÚNG MẠN bắn được,
     một chiến thuyền ra ~1.33 dps ⇒ 150s cho một chiếc ở cấp pháo gốc, 47s khi pháo cấp 3.
     Bản nháp để 320 là 240s — gần hết cả ván 300s, nên cảng gần như không bao giờ sập.
   · ⚠⚠ **`NavalBattle` phải `override OnPlayerTeamChanged`** (đã vá kèm): `GameSession` cho chọn
     phe SAU `Start`, mà `_enemyTeam` là field cố định — chọn phe đỏ là `_playerTeam == _enemyTeam`
     và mọi phép so đem phe mình so với chính mình. Bẫy này lớp cha đã ghi sẵn, thuỷ chiến vẫn dính.

13. ⚠⚠ **BA THỨ PHẢI SỬA NGAY SAU KHI CÓ VÁN GIÀNH CẢNG** (2026-09-07, đo trong ván thật).

   · **QUÂN SỐ LÀ LUẬT CỦA MÀN** — `NavalBattle.TroopCountIsRule => true`. `ApplyTroopCount`
     nhân quân theo bậc khó rồi KẸP bản sao vào boong cho khỏi rơi xuống biển; kẹp thì đúng
     nhưng cái sai chuyển chỗ: boong dài 13 (thiết kế cho 8 người) bị nhồi 19. Đo được:
     **ta 26 — địch 39** trên hai thuyền mỗi bên. Nhìn ra ngay là *"AI tụ tập ở mạn thuyền"*.
     Ván giành cảng còn một lý do nữa: quân số ở đó là thứ NGƯỜI CHƠI MUA BẰNG VÀNG.
   · **LÍNH CHỜ ÁP MẠN PHẢI XẾP HÀNG** (`AIStateBoarding.QueueOffset`). Bản cũ gửi MỌI lính
     tới đúng một toạ độ `railX`; với 3 người thì lực giãn cách xếp hộ, nhưng từ ngày thuyền
     trưởng biết GIỮ TẦM MÀ NÃ (§5b-loi) thì tấm ván cả phút mới bắc và cả tốp đứng chờ ở đó.
     Mỗi người một BẬC lùi vào trong boong, chỗ suy từ mã băm của chính người đó (tất định —
     bốc ngẫu nhiên mỗi frame là cả hàng nhảy chỗ), kẹp trong 70% nửa boong (sâu hơn là người
     cuối hàng bị đẩy qua mạn bên kia).
     ⚠ `GetInstanceID()` nay là API CẤM (obsolete-as-error trên Unity 6.5) — dùng `GetHashCode()`.
   · ⚠⚠ **KHOÁC NỀN VĂN MINH: `ApplyLookTo` MỘT MÌNH KHÔNG ĐỦ** (`DressForCivilization`).
     Đây là lý do thật của *"không thấy có nền văn hoá nào"* — builder truyền `civ` vào đủ mọi
     chỗ mà hai phe vẫn trông y hệt nhau, vì CẢ HAI đường của hàm đó đều rơi vào khoảng trống:
     `WearEquipment` chốt bằng `StickmanEquipment.HasSlot`, mà hàm đó trả lời *"slot này ĐANG
     MẶC gì chưa"* — nó là hàm **THAY đồ đang mặc**, còn thuỷ thủ do `SpawnNpcShared` sinh ra
     thì không mặc gì; nhánh `appearanceSet` thì cần `StickmanAppearance`, mà component đó chỉ
     có khi ai đó bấm tool «Thêm vẻ ngoài vào nhân vật» (KHÔNG nằm trong `EnsureAll`).
     Nên phải PHÁT ĐỒ THẬT: ghi `_startingEquipment` = nón + giáp của nền.
     ⚠ `heavyGear` chia **hai cơ chế**, không chỉ hai bộ hình: hải quân `FollowMatch` (giáp thật,
     có điểm giáp, có sức nặng, thủng thì rớt) · hải tặc `Insignia` (**chỉ để nhìn** — không
     giáp, không sức nặng, không rớt). Vế "đông và nhẹ" của hải tặc từ trước tới nay chỉ nằm
     trong tài liệu vì đường phát đồ chưa bao giờ chạy.
     Doctor canh thêm «Nhân vật chưa có lớp VẺ NGOÀI» cho phần tóc/râu/nón overlay.
   · **CON THUYỀN CŨNG MANG NỀN**: `BuildShip(..., civ)` nhuộm **BUỒM** (mảng màu to nhất, cao
     nhất, nhìn từ xa vẫn đọc ra) 55% về `bannerColor`, thân 28%, chi tiết 40%.
     ⚠ **BOONG GIỮ NGUYÊN MÀU GỖ** — đó là nền để nhìn thấy người đứng trên; nhuộm nó là quân
     đen lẫn vào sàn. ⚠ **CỜ GIỮ MÀU PHE**: phân biệt ta–địch quan trọng hơn phân biệt văn
     minh, và hai phe có thể cùng một nền.

Bốn bài: `Demo_34_SeaBattle` (đánh chìm hạm đội) · `Demo_35_PirateRaid` (đưa thuyền hàng về
cảng) · `Demo_36_IslandAssault` (đổ bộ chiếm đảo qua CẦU TÀU — boong và bờ ngang nhau nên đi
thẳng lên được, không cần ván) · `Demo_49_IslandWar` (chiến tranh hai đảo, §14).
⚠ Luật thắng phải đếm **CẢ THUYỀN CẢ NGƯỜI**: giết sạch thuỷ thủ đoàn thì thuyền địch vẫn nổi
(không ai bắn nó) và trận đứng lại với một chiếc thuyền ma — đúng bài học `EliminateEnemies`
của hệ map soi từ đầu kia.
⚠ Thuỷ chiến NAY ĐÃ vào tầng game: `GameSession.ApplyTroopCount` hỏi `ShipVessel.SpansX`
(hàm `VesselUnder`) rồi **kẹp bản sao vào trong boong** — lính thêm theo bậc khó không còn
rơi xuống biển chết đuối nữa. Bài học giữ lại: **nhân bản lính ở map có vực/biển thì phải
kẹp vị trí vào nền đứng được**, xê ngang mù quáng là bậc khó càng cao phe máy càng chết nhiều.


14. ⚠⚠ **CHIẾN TRANH HAI ĐẢO — thuỷ chiến NẰM TRONG một ván kinh tế** (2026-09-07).

   `Demo_49_IslandWar` **thay hẳn** `Demo_49_NavalCommand`. Bài cũ chữa đúng bệnh nó nhắm tới
   (§12: hạm đội thôi lao vào nhau vô nghĩa) nhưng còn nguyên một cái trần: cả ván chỉ có
   BỐN nút mua, và mọi thứ đáng làm đều xảy ra trên mặt nước. Hai hòn đảo thì trống trơn.

   Bản mới lấy nguyên bộ máy `Demo_20_WarCamp` — nông dân · mỏ vàng · rừng củi · cây công
   trình · nhà lính có cấp · tổ canh nhà · bảng Canvas — rồi **cắt đôi bản đồ bằng biển**.
   Chỉ MỘT mảnh mới: `CampBuildKind.Harbor`.
   ⚠ Luật thắng KHÔNG đổi (`EconomyRaceMode`, bản `EconomyRaceSkin.Island`): **phá nhà chính
   địch**. Cái biển chỉ đổi ĐƯỜNG ĐI tới đó. Viết một trọng tài thuỷ chiến riêng là nuôi
   song song hai bản của cùng một luật.
   ⚠ **`NavalPort` · `NavalWarChest` · `NavalFleetCommand` · `NavalGoal.PortAssault` VẪN CÒN
   trong code nhưng KHÔNG scene nào dùng nữa.** Giữ lại vì chúng là hệ chung, dựng được lúc
   chạy; nếu sau này chắc chắn không cần thì xoá CẢ BỐN cùng lúc, đừng xoá lẻ.

   · **BẾN CẢNG LÀ CHỖ HAI MODULE GẶP NHAU, và đó là toàn bộ cái khó.** Phần "một cái nhà có
     máu, có cấp, nông dân xây được" thuộc Gameplay (4); phần "chiếc nào đậu đâu, đóng được
     mấy chiếc" thuộc Naval (5). Nối bằng **`CampBuildSite.Raised`** (sự kiện tĩnh: Gameplay
     KỂ LẠI, Naval nghe) và **`CampHarborShop`** (sổ đăng ký: HUD HỎI, Naval trả lời). Hai
     khuôn đảo cạnh đã có sẵn của dự án, không thêm một reference ngược nào.
     ⚠ Người nghe phải TỰ GỠ trong `OnDisable`, và gỡ CÓ ĐIỀU KIỆN (`ReferenceEquals`):
     xoá thẳng là scene vừa nạp bị scene đang tắt xoá mất bên bán.
   · ⚠⚠ **BẾN CÓ Ô ĐẤT CỐ ĐỊNH, KHÔNG XẾP THEO DÃY** (`CampBuildYard._harborX`). Cái bến buộc
     phải nằm đúng mép nước vì **mặt cầu tàu là đất đứng được, và mép cầu là chỗ mạn thuyền
     gối vào**. Để nó xếp theo dãy ô đất tiền tuyến thì một cái tháp canh xây trước sẽ đẩy nó
     lùi vào giữa đảo, cầu tàu nằm trọn trên cạn, và **chiếc đò cập vào một chỗ không có
     cầu**. Nhìn vào chỉ thấy quân đứng ở mép nước không chịu lên thuyền.
     Kèm theo: bến được MIỄN phép đo bán kính đất trại (`SpotBlockReason(…, ignoreRadius)`)
     và **KHÔNG DỜI ĐƯỢC** — dời một nấc là mép cầu rời khỏi mặt nước.
   · ⚠⚠ **HÀNH KHÁCH PHẢI CÓ MỤC TIÊU NẰM TRÊN CHÍNH CON THUYỀN** (`TroopTransport.Muster` —
     một object CON của thuyền). Đây là mảnh ghép làm cả hệ chạy được mà không thêm một
     trạng thái AI nào: mục tiêu trôi theo boong, nên "đứng cạnh mục tiêu" và "đứng yên trên
     boong" là CÙNG một việc. Giao cho họ một điểm trên ĐẤT LIỀN là họ đi tới đó — tức bước
     xuống biển; mép boong là mép vực nên họ đứng rung ở mạn, rồi `IsCornered` bật TỬ CHIẾN
     (đúng §10, chỉ khác là ở đây không ai phát lệnh sai — chỉ là chưa ai phát lệnh ĐÚNG).
     ⚠ Kèm `SetKeepsOwnOrders(true)` lúc còn trên thuyền, và **GIỮ NGUYÊN khi đổ bộ**
     (đổi luật 2026-09-08). Bản đầu bỏ cờ lúc lên bờ ("cây chỉ huy được giành lại họ") và đó
     là lý do *"quân đổ bộ tới nơi rồi đứng ở mép nước"*: cây chỉ huy của phe nằm Ở BÊN KIA
     BIỂN — thế trận không phải Tấn công thì `CommandNode.ApplyToAgent` phát
     `GuardTarget(anchor)` ngay nhịp sau, anchor ở đảo nhà, người vừa lên bờ đi ngược ra cầu
     tàu địch rồi «Giữ tuyến» đóng băng họ đúng đó. ĐỘI ĐỔ BỘ LÀ MỘT CAM KẾT:
     `HuntTarget(nhà chính địch)` + giữ cờ — có mục tiêu thì không bao giờ "đứng im không hệ
     nào nhận lại", và đường về nhà vốn không tồn tại. Người CHƯA đứng trên boong lúc cập bến
     thì vẫn trả tự do như cũ (giữ cam kết cho anh ta là bắt anh ta bơi).
     ⚠ RỜI BẾN là thả ngay người được gọi mà chưa kịp lên boong (`ReleaseAshore`) — mục tiêu
     `Muster` của anh ta trôi ra giữa biển, còn cờ thì không ai gỡ.
     ⚠ Thuyền chìm thì phải trả tự do cho hành khách (`ShipVessel.Sank`), không thì người
     nhảy sang được thuyền khác vẫn ôm `KeepsOwnOrders` và một mục tiêu đã bị huỷ.
   · **CHUYẾN ĐÒ KHÔNG ĐÁNH NHAU** — cả chuyến chạy bằng `ShipOrder.SailTo`, đúng khuôn
     thuyền buôn của `Demo_35`. Một chiếc vừa chở quân vừa quay ra dàn mạn là một chiếc không
     bao giờ tới nơi, và người chơi mất hẳn lý do mua CHIẾN THUYỀN hộ tống.
   · ⚠ **BẾN PHẢI CÓ HÀNG ĐỢI, VÀ BIỂN PHẢI ĐỦ RỘNG CHO NÓ** (`IslandHarbor.QueueX` +
     `TroopTransport.HomeSlot` / `LandingSlot`). Từ cấp bến 1 đã có HAI chiếc cùng phe và cả
     hai nhắm đúng một chỗ đậu. ⚠ Bản nháp để hai đảo cách nhau 36 thì chỗ đợi của chiếc thứ
     hai rơi sang **nửa sân địch** — đo ra mới thấy; nay hai bến cách nhau 42.5.
     Hai boong chồng nhau là lỗi THẬT: `ShipVessel.At` trả về chiếc nào là tuỳ thứ tự sổ, nên
     người đứng ở khúc chồng KHÔNG BIẾT mình trên chiếc nào — chiếc kia chạy đi thì anh ta bị
     kéo theo con thuyền sai. Bậc xếp hàng suy từ thứ tự trong sổ (tất định, tự dồn lên khi
     một chiếc chìm); chỉ chiếc ở slot 0 mới nhận khách.
   · **NÂNG CẤP — hai trục, và cả hai phải NHÌN THẤY ĐƯỢC:**
     *cấp bến* = số thuyền ra khơi cùng lúc (`MaxShips = Level + 1`; cấp 1 cho HAI chiếc —
     một chiếc thì không bao giờ mua nổi chiến thuyền đầu tiên vì hết chỗ đậu, mà chiến
     thuyền lại là thứ duy nhất chặn được đò địch);
     *cấp sức chở* = số quân mỗi chuyến (`TroopTransport.SetTier` nhận CẤP chứ không cộng
     dồn — bẫy §12 của `ShipCannon` — và phải áp lại sau MỖI lần hạ thuỷ, không thì chiếc
     mua sau chở ÍT HƠN chiếc mua trước).
     ⚠ Bến **KHÔNG được phóng to khi nâng cấp**: `CampProductionBuilding.TryUpgrade` có đường
     dự phòng `localScale *= 1.06f`, mà thân bến mang theo CẦU TÀU — 6 % là mép cầu dịch mấy
     tấc trong khi `IslandHarbor` đã chốt toạ độ từ lúc lắp.
     ⚠ Bến cũng phải bị loại khỏi `OfferedTiers`: nó `IsProduction()` nên không loại là bấm
     vào bến lại ra bảng bán BỘ BINH.
   · **AI ĐIỀU PHỐI** (`IslandWarCommand`) là tầng thứ tư: *một người* → *một con thuyền* →
     *một cái trại* → **cả một hòn đảo**. Nó làm ba việc: lắp bến, tiêu tiền, gọi lính xuống
     thuyền.
     ⚠ **Điều phối cho CẢ HAI phe, kể cả phe người chơi.** Tiêu tiền là quyết định của người
     chơi (nút bấm), còn "ai bước lên cái thuyền đang đậu" thì không: bắt người chơi dắt từng
     anh lính ra cầu tàu là biến một ván chiến thuật thành một ván bấm chuột. Người chơi vẫn
     đè lên được ở hai chỗ — tự đi bộ lên boong, và nút «Xuất phát».
     ⚠⚠ **CHUYẾN ĐÒ NGHE THEO THẾ TRẬN CỦA TƯỚNG** (`DispatchFerries`, 2026-09-08 — người
     dùng báo *"ra lệnh tấn công thì AI phải lái thuyền đánh địch"*). Chuyến đò là ĐƯỜNG TIẾN
     QUÂN duy nhất của map, nên nút «Tấn công»/«Về thủ» mà không đụng tới nó thì lệnh chỉ
     huy chỉ điều được quân đi tới... mép nước. **Tấn công** (máy hay tay): gọi lính rảnh
     TRÊN CẢ ĐẢO, và XUẤT PHÁT NGAY khi `BookedCount == AboardCount` (còn người đang đi tới
     cầu tàu mà nhổ neo là mục tiêu của anh ta trôi ra giữa biển). Riêng lệnh TAY «Tấn công»
     bỏ cả `_homeReserve` lẫn `_minArmyToAttack` — đi từ 1 người (cùng vế `CampHomeGuard`
     thôi răn đe khi có lệnh tay); MÁY tấn công thì giữ hai mốc, vì `DecideAsCommander` chọn
     Attack gần như mọi lúc chưa chạm địch — bỏ mốc theo nó là phe máy nhỏ giọt từng anh lính
     sang đảo địch chết dần. **Giữ tuyến** (tay): ngừng gọi thêm. **Về thủ / Rút** (tay):
     `TroopTransport.CancelLoading()` — huỷ chuyến đang chờ, trả lính về, không thì đồng hồ
     kiên nhẫn 14 giây vẫn chở đúng tốp đó đi ngược lệnh vừa bấm. ⚠ Lệnh MÁY Hold/Defend
     (nhịp xuất quân) KHÔNG huỷ và không chặn — nhịp xuất quân trên bộ ngắn hơn một chuyến
     đò, huỷ theo nó là không chuyến nào kịp rời bến.
     ⚠⚠ **PHÂN BIỆT "thiếu tiền" VỚI "bị chặn vì cấu trúc"**
     (`IslandFleetYard.StructureBlockReason`). Ông tướng máy ĐỂ DÀNH cho khoản đang ưu tiên —
     đúng với thiếu vàng (chờ là mua được), **treo vĩnh viễn** với hết chỗ đậu: ngồi trên một
     đống vàng tới hết trận trong khi khoản đáng mua thật (nâng cấp bến) đứng ngay dòng dưới.
     ⚠ Không đua đóng thuyền khi trên đảo chưa có quân — xưởng thuyền và `TeamEconomy` moi
     tiền từ CÙNG một cái kho.
   · **TƯỚNG MÁY PHẢI BIẾT XÂY BẾN** — `CampBuildYard._navalMap` đẩy `Harbor` lên ngay sau
     nhà lính trong `SuggestNext`. Thiếu cờ này thì phe máy chơi rất giỏi ván kinh tế của
     chính nó rồi **hoà tới hết giờ**, đúng bệnh "chiếm đảo mà không ai bước vào vòng chiếm"
     (§11). Là một CỜ DỮ LIỆU của map chứ không phải phép dò lúc chạy: câu hỏi thật ("không
     có bến thì có sang được đảo địch không") chỉ Naval trả lời được, mà Gameplay nằm DƯỚI.
   · ⚠ **MỌI THỨ ĐẶT BẰNG HELPER DÙNG CHUNG PHẢI ĐƯỢC NHẤC LÊN** (`Lift`). Mặt đảo cao đúng
     bằng mặt boong (`WaterY + 1.1`), còn `CreateHouseShared` · `SpawnNpcShared` ·
     `SpawnFarmerShared` · `StickmanAILabBuilder.Node` đều đặt ở `DefaultGroundTop` = mặt
     NƯỚC. Quên nhấc thì nhà chính chôn nửa thân, nông dân sinh ra TRONG lòng đảo, mỏ vàng
     nằm dưới chân không ai đào được — và không lỗi nào báo.
   · ⚠⚠ **KHO THUYỀN LÀ VAN CHỐNG BẾ TẮC.** Chiếc đã hạ thuỷ KHÔNG quay lại kho được
     (`NextReserve` tìm nhóm còn TẮT; chìm là bị huỷ, không có gì để bật lại), nên **số chiếc
     trong kho chính là tổng số thuyền một phe đóng được trong CẢ TRẬN**. Kho nông thì hai
     phe bắn chìm hết thuyền của nhau là không ai sang được đảo ai nữa — mà `EconomyRaceMode`
     KHÔNG có giới hạn giờ, nên ván treo vĩnh viễn với hai bên cày vàng nhìn nhau. Đang để
     **5 đò + 3 chiến thuyền mỗi bên**; chúng đang TẮT nên không tốn gì ngoài dung lượng scene.
   · **Doctor canh bốn mối nối** («Hai đảo — bến / xưởng thuyền nối thiếu»): xưởng thuyền mà
     không có bộ điều phối · kho thuyền rỗng · không chiếc nào mang `TroopTransport` ·
     `_navalMap` bật mà `_harborX = 0`.

14b. ⚠⚠ **BẢY MỐI NỐI CÒN THIẾU CỦA VÁN HAI ĐẢO** (2026-09-08). Bản §14 dựng xong bộ máy
   nhưng bảy chỗ chưa nối vào nhau; cả bảy hỏng CÂM.

   · ⚠⚠ **TUYỆT ĐỐI KHÔNG THẢ QUÂN Ở CHỖ KHÔNG CÓ ĐẤT** (`TroopTransport.TickCrossing`).
     Bản cũ, khi không tìm thấy bến địch, gọi thẳng `EnterPhase(Landing)` = thả quân **ngay
     tại chỗ con thuyền đang đứng**; chú thích hứa *"đổ quân ở mép đảo gần nhất"* nhưng không
     có dòng nào đi tới mép đảo nào. Và nhánh đó tự nổ ĐÚNG LÚC ĐANG THẮNG: bến địch nằm ngay
     chỗ quân mình đặt chân lên nên nó là công trình đầu tiên bị đập. Phá xong là chuyến sau
     thả nguyên tốp tại bến nhà, họ mang mục tiêu ở bên kia biển nên ra đứng ở mạn, và vì đội
     đổ bộ GIỮ `KeepsOwnOrders` (§14) nên không hệ nào nhận lại — mỗi chuyến chồng thêm một
     tốp, quân hụt dần mà không ai chết. Nay ba lối ra và cả ba kết thúc trên ĐẤT: còn bến thì
     cập bến · mất bến thì **ỦI BÃI** · chưa đo được bờ thì **CHỞ QUÂN VỀ**. Kèm van
     `_crossingTimeout` (45s) và `ReleaseHome()` — về tới bến là trả quân lại cho đảo.
   · ⚠⚠ **BỜ ĐẢO PHẢI SỐNG LÂU HƠN CÁI BẾN** (`IslandShore`). Mép cầu là câu trả lời duy nhất
     về chỗ cập bờ, mà cái bến thì có máu. Nên bờ được ĐO một lần bằng hình học thật (dò từ
     nhà chính ra phía địch) rồi nhớ trong sổ TĨNH.
     ⚠ **Dò ở 1 mét DƯỚI mặt đất, không dò ngang mặt**: mặt cầu tàu cũng khai `solid: true`
     nên dò ngang mặt sẽ đi hết cầu và trả về mép CẦU — đúng con số sẽ biến mất cùng cái bến,
     tức đo xong vẫn không trả lời được câu đã hỏi. Thân đảo dày 5, mặt cầu dày 0.22.
     ⚠ Bỏ collider TRIGGER (vùng nước, hitbox nhà) và bỏ người (`StickmanController` ở cha).
     ⚠ `Clear()` lúc `OnEnable`: sổ tĩnh sống qua ván sau khi tắt domain reload.
     ⚠ Hai chốt `LogError` — dò hết tầm mà còn đất, hoặc mép ra ngay tại điểm xuất phát (thân
     đảo mỏng hơn độ sâu dò). Cả hai đều cho ra một con số *trông hợp lý* nếu không kêu.
   · ⚠ **MÉP CHẠY TÀU PHẢI NỚI LÚC CHẠY** (`ShipVessel.SetSailLimits` ←
     `IslandWarCommand.WidenSailLimits`). Mép ±19 bake trong scene được chọn hồi chỗ đậu xa
     nhất là bến (±16.65); chỗ ủi bãi là ±20.4 nên nằm ngoài. Sửa lúc chạy chứ không sửa hằng
     số builder: hằng số chỉ có tác dụng cho scene DỰNG LẠI, mà luật phải với tới ván đã lưu.
     Mỗi hạng thuyền một mép riêng (suy từ `HalfDeck`).
   · ⚠⚠ **VỀ VÁ PHẢI HỎI CẢ HAI LOẠI CẢNG** (`ShipCaptain.TryFindRepairDock`). Cả file chỉ hỏi
     `NavalPort`, mà ván hai đảo cố ý KHÔNG dùng nó (§14) — nên ở đây `NavalPort.Of` luôn null
     và ba thứ chết cùng lúc: chiếc thủng máu chỉ chạy khỏi địch chứ không bao giờ về bến · ụ
     sửa của `IslandHarbor` gần như không bao giờ được dùng · vùng chết `_returnHullPercent`
     không hoạt động nên nó rút rồi quay ra ở CÙNG một ngưỡng.
     ⚠ Chỗ đậu vá là **BẬC 1 hàng đợi** (`IslandHarbor.RepairX`), không dùng chung `BerthX`
     với chuyến đò — hai boong chồng nhau là lỗi thật. Hệ quả phải chấp nhận: ụ sửa nằm ngoài
     khơi (17–20 từ mép cầu), nên `_repairRadius` phải là **20** chứ không phải 9.
   · **CHIẾN THUYỀN PHẢI BIẾT HỘ TỐNG** (`ShipOrder.Escort` + `SetEscort`). `OrderWarships` cũ
     phát `Engage` cho MỌI chiếc, nên vế "hộ tống đò nhà" trong tài liệu chưa bao giờ tồn tại
     trong code: người chơi mua chiến thuyền rồi nhìn nó bơi đi đâu đó. `Engage` hỏi *"đứa nào
     đáng đánh nhất trên cả bản đồ"* — câu đó gần như không bao giờ trỏ vào kẻ đang chặn
     chuyến đò của mình. Luật: **mỗi chuyến đò đang vượt biển kèm ĐÚNG MỘT chiếc**, chiếc gần
     nhất; còn dư thì đi săn.
     ⚠ Tầm phát hiện đo từ **CHIẾC ĐƯỢC HỘ TỐNG**, không đo từ mình — đo từ mình là chiếc hộ
     tống bơi chệch ra rồi "không thấy ai" trong khi con thuyền nó phải giữ đang bị bắn.
     ⚠ `screenSide` do người gọi truyền vào: "phía có địch" là câu hỏi địa lý của cả bản đồ,
     `ShipCaptain` chỉ nhìn thấy mặt biển quanh mình.
   · **THUYỀN CÁ PHẢI BIẾT CHẠY.** Chú thích lớp nói *"gặp địch phải chạy"* từ đầu nhưng vòng
     `Update` không có một câu hỏi nào về địch, và nhịp thả lưới còn `Stop()` đứng yên 12 giây
     — nó không chạy, nó ĐỨNG CHỜ. Nay bỏ lưới chạy **về bến** (không chạy ra khơi: ngoài đó
     không có gì che) khi có thuyền địch trong `_fleeRange` = 16 — phải lớn hơn tầm pháo 11,
     không thì nó chỉ bắt đầu chạy sau khi đã ăn loạt đạn đầu. Và **ở lại bến** khi địch còn
     lởn vởn: ra khơi lúc đó là dâng con thuyền.
   · **QUÂN ĐỔ BỘ NHẮM BẾN ĐỊCH TRƯỚC, NHÀ CHÍNH SAU** (`TroopTransport.EnemyAnchor`). Cái bến
     là toàn bộ năng lực hải quân của đối phương, và nó nằm ĐÚNG TRÊN ĐƯỜNG từ bãi (±21–25)
     tới nhà chính (±44) nên không làm quân đi lạc. ⚠ Vế này CHỈ an toàn từ khi `TickCrossing`
     biết ủi bãi — trước đó, phá bến địch là tự khoá đường đổ bộ của chính mình.
   · ⚠⚠ **VÁN PHẢI CHẤM ĐƯỢC KHI KHÔNG BÊN NÀO SANG NỔI** (`CampHarborShop.CrossingBlock` →
     `EconomyRaceMode.TickCrossingDeadlock`). `EconomyRaceMode` cố ý không có giới hạn giờ —
     trên bộ thì luôn ngã ngũ được vì quân đi bộ sang được, nhưng trên map đảo "sang được" là
     một năng lực CÓ THỂ MẤT HẲN (kho thuyền không nạp lại). Chấm bằng **máu nhà chính** —
     cùng thước `StatusLine` đang hiện — và tuyên HOÀ khi chênh dưới 10%.
     ⚠ Chỉ báo cản trở KHÔNG THỂ ĐẢO NGƯỢC (hết đò nổi VÀ kho cạn). Báo "chưa có bến" hay
     "thiếu vàng" là trọng tài kết thúc ván trong lúc hai phe vẫn đánh nhau bình thường —
     một cái bến vừa sập là ván tự dừng, tệ hơn hẳn cái bế tắc nó định chữa.
     ⚠ Câu hỏi thứ hai đi qua ĐÚNG cây cầu `CampHarborShop` đã có, không đẻ sổ đăng ký thứ hai.
   · **DẢI ĐẤT VEN BIỂN** (`CampBuildYard.SpotBlockFor` + `IsCoastal`). Vành đất trại đo từ
     nhà chính (±44, bán kính 14) cho ô đất [±30…±58], còn cầu tàu ở ±21.25 — nên **không một
     tháp canh hay rào chắn nào đặt được ở chỗ duy nhất quân địch bước lên đảo**. Nay dãy TIỀN
     TUYẾN trên map có biển neo vào CÁI BẾN và chạy lùi vào trong đảo, được miễn vành đất trại
     (miễn vành ≠ đặt đâu cũng được: `GroundBlockReason` vẫn đòi đất thật, nên không mọc xuống
     biển được). Kèm **chừa ô đất cho bến**: công trình khác mọc lên ô cố định của bến là cái
     bến vĩnh viễn không xây được và phe đó mất hẳn đường ra biển.
   · **BẢNG MẶT BIỂN** (`IslandWarHud`, tự gắn ở `IslandWarCommand.OnEnable` theo khuôn
     `WaterSurface`). Ba nguồn tin `PlanOf` · `PhaseLabel` · `LastPurchase` viết xong mà **0
     người gọi** — người chơi mù nửa trận vì camera nhìn ngang còn hai nhà cách nhau 88 đơn
     vị. Dòng đáng giá nhất là **«ĐỊCH ĐANG ĐỔ BỘ»**, và nó đọc NHỊP của chuyến đò địch chứ
     không đếm thuyền địch: đếm thuyền cho ra một con số luôn khác 0 và người chơi học cách
     bỏ qua nó. Bảng CHỈ ĐỌC, đặt bên PHẢI (bảng doanh trại đã chiếm cột trái + đáy).

14c. **NĂM TÍNH NĂNG LÀM MẶT BIỂN ĐÁNG TRANH** (2026-09-08). §14b vá cho mode chạy đúng; mục
   này thêm thứ để CHƠI. Chẩn đoán chung: vòng chơi cũ là *đào vàng → xây bến → mua đò → gửi
   quân → lặp*, mọi thứ đáng làm nằm ở hai đầu bản đồ còn khoảng giữa chỉ để đi qua — đúng
   bệnh §12 đã chữa cho bài «Giành cảng» nhưng bản hai đảo còn nguyên ở phần biển.

   · **PHÒNG THỦ BỜ: `CampBuildKind.ShoreBattery` + `SeaStakes`** (Gameplay dựng nhà có máu,
     Naval gắn phần nhìn-ra-biển — cùng cây cầu `CampBuildSite.Raised` của bến cảng). Trước
     đó **không có gì trên đảo bắn được ra mặt nước**: tháp canh cho cung thủ chỗ đứng nhưng
     cung thủ nhắm NGƯỜI, nên cửa duy nhất vào đảo cũng là cửa duy nhất không ai canh được.
     ⚠ **Ụ pháo ưu tiên chiếc CHỞ QUÂN**, khác `ShipCannon` (nã chiếc bắn lại được trước). Ụ
     đứng trên bờ nên nó không sợ bị bắn chìm — câu hỏi đúng của nó không phải *"đứa nào nguy
     hiểm với tôi"* mà *"đứa nào sắp thả chín người lên đảo tôi"*. Bỏ vế này thì cả ván ụ pháo
     bận nã chiếc hộ tống, đúng việc mà chiếc hộ tống sinh ra để dụ nó làm.
     ⚠ **Bãi cọc chỉ ăn thuyền ĐỊCH** — thuyền nhà đi qua bãi cọc của chính mình phải bình
     thường, không thì mua nó là tự khoá bến của mình. Và làm chậm bằng `ShipVessel.RequestDrag`
     (đầu vào ghi MỖI FRAME, khuôn `RequestHelm`): ra khỏi vùng là tự hết, không có đường nào
     để quên gỡ. Nhiều nguồn thì lấy cái CHẶT NHẤT, **không nhân dồn** — hai bãi cọc chồng tầm
     mà nhân nhau là thuyền đứng hẳn.
     ⚠ Giá lệch nhau CÓ CHỦ Ý (cọc 6 vàng, ụ pháo 28): chúng chỉ đáng tiền khi đủ CẶP — một
     mình bãi cọc chỉ làm địch tới trễ vài giây, một mình ụ pháo lấy được khoảng nửa thân chiếc
     đò trước khi nó chạy qua.
     ⚠ Cả hai xếp vào `IsFrontLine`, tức mọc ở DẢI VEN BIỂN của §14b. Không có vế đó thì chúng
     mọc giữa đảo và canh một cái cửa không ai đi.
   · **BÃI CẠN GIỮA BIỂN (`SeaControlZone`)** — chỗ đáng giữ đầu tiên nằm trên mặt nước. Chiếm
     bằng **thuyền CHIẾN** (đò và thuyền cá không tính, không thì cách chiếm tối ưu là thả một
     chiếc đò rỗng ra đậu); bên nào ĐÔNG HƠN HẲN thì kéo thanh, hoà quân số thì thanh đứng im
     — và đó chính là lúc trận hải chiến phải xảy ra. Giữ được thì vàng chảy vào kho ≈ 1.5
     nông dân.
     ⚠⚠ **VÌ SAO KHÔNG PHẢI MỘT HÒN ĐẢO NHỎ CHIẾM BẰNG BỘ BINH** (thiết kế đầu, đã bỏ): game
     đi ngang nên mặt biển là hành lang MỘT CHIỀU, mà `ShipVessel` là Rigidbody2D kinematic tự
     `MovePosition` — nó KHÔNG va chạm địa hình. Đặt khối đất đặc giữa hành lang thì **mọi con
     thuyền đi xuyên qua hòn đảo**, và không có đường vòng nào để bắt chúng tránh. Chữa được
     thì phải viết lại toàn bộ cách thuyền di chuyển, cho một tính năng phụ.
     ⚠ **Không reset thanh chiếm khi mất quyền kiểm soát**, chỉ kéo ngược. Reset thì một chiếc
     lảng vảng ngang qua là xoá sạch công của cả hạm đội.
   · **NÂNG PHÁO Ở BẾN (`FleetPurchase.Cannon`)** — trục nâng cấp duy nhất KHÔNG ăn suất bến.
     Trước đó mọi đồng vàng đổ vào hạm đội đều đổi ra SỐ LƯỢNG, mà số lượng thì bị
     `IslandHarbor.MaxShips` chặn cứng: bến đầy là tiền hết chỗ chảy và người chơi hết quyết
     định. Nối vào `ShipCannon.SetUpgradeTier` có sẵn, **không viết bảng số pháo thứ hai**.
     ⚠ Áp lại sau MỖI lần hạ thuỷ (`ApplyCannonTier` trong `Launch`) — cùng bẫy mà sức chở đã
     dính: chiếc mua sau bắn yếu hơn chiếc mua trước và người chơi đọc ra là "nâng không ăn".
   · **MỤC TIÊU ĐỔ BỘ: NHÀ CHÍNH ↔ PHÁ KINH TẾ (`FerryObjective`)** — cùng chuyến đò, cùng số
     quân, cùng chỗ cập bến; khác duy nhất cái MỐC quân vừa lên bờ nhắm tới (kho địch = chỗ
     nông dân đứng). Đủ để thành hai lối chơi, và vế đáng giá nhất là nó **cho nút «Giữ nhà»
     một lý do tồn tại** — trước đó địch chỉ biết đi thẳng tới nhà chính.
     ⚠ Đọc lúc CẬP BẾN chứ không lúc rời bến, nên đổi giữa đường vẫn kịp. Chốt lúc xuất phát
     là khoá quyết định vào đúng lúc người chơi có ít thông tin nhất.
     ⚠ Đẩy xuống ferry MỖI NHỊP NGHĨ (`PushObjective`), không chỉ lúc bấm nút — chiếc mới hạ
     thuỷ sinh ra với nhiệm vụ GỐC, cùng bẫy `ApplyCapacityTier`.
   · **TIN TÌNH BÁO PHẢI TRẢ GIÁ (`IslandWarHud.AddScoutLines`)** — bảng chỉ nói về đảo địch
     khi phe mình CÓ THUYỀN trong 16 đơn vị quanh bờ nó, và tin hết hạn sau 20 giây. Quân số
     với cấp bến của địch là hai con số quyết định mọi khoản mua, mà `TeamEconomy` trả lời
     chúng cho bất kỳ ai hỏi: đổ thẳng lên bảng là người chơi biết TẤT CẢ mà không tốn gì.
     ⚠ MỌI hạng thuyền đều do thám được — không đẻ thêm "thuyền do thám". Chiếc đò đang đổ
     quân cũng đang nhìn thấy đảo địch, và bắt mua thêm một loại thuyền nữa chỉ để xem bảng là
     tốn một suất bến cho việc chiếc họ đã có làm được.
   · **BIỂN LẶNG / BIỂN ĐỘNG (`SeaWeather`)** — dùng lại `WaterWaves.Swell` (chú thích ở đó đã
     ghi *"biển động là chuyện của Swell"*), cộng `RequestDrag` gọi mỗi frame. Nó chữa việc câu
     hỏi *"khi nào gửi chuyến đò"* trước nay có đúng một câu trả lời: **ngay khi đủ tiền**.
     ⚠ **Hai phe chịu chung một cơn sóng** — thời tiết đổi NHỊP của ván, không đổi cán cân.
     Một cơn bão chỉ rơi vào phe đang vượt biển là một cái máy random quyết định ai thắng.
     ⚠ `OnDisable` trả `Swell` về 1: trường TĨNH, bỏ lại cơn bão dang dở là scene sau mở ra
     giữa sóng lớn mà không gì giải thích nổi.
   · ⚠⚠ **«CHỌN ĐIỂM ĐỔ BỘ» ĐÃ BỊ BỎ — và lý do đáng nhớ hơn tính năng.** Ý định là cho người
     chơi chọn *cập cầu tàu* (nhanh, nhưng địch canh) hay *ủi bãi ở khúc bờ trống* (vòng qua
     tuyến phòng thủ). Đo lại hình học mới thấy **khúc bờ trống không tồn tại**: đảo chạy từ
     ±25 tới ±60 và mép map cũng ở ±60, nên mặt bờ hướng ra biển của mỗi đảo là **đúng MỘT
     điểm**. Ủi bãi chỉ lệch cầu tàu 3.75 đơn vị — không phải một đường vòng, chỉ là cùng một
     cửa. Muốn có hai cửa thật thì phải chẻ hòn đảo bằng một cái phá (đất [25,30] · nước
     [30,33] · đất [33,60]) để thuyền lách vào trong — đó là đổi ĐỊA HÌNH map, cần dựng lại
     scene và cân bằng lại, không làm mù được. Ủi bãi vẫn giữ nguyên vai trò ở §14b: đường
     dự phòng khi bến địch sập.

15. ⚠⚠ **THUỶ CHIẾN TỪNG CÓ NGƯỜI NÉM BOM TRÊN BOONG** (2026-09-07) — và gốc KHÔNG nằm ở
   thuỷ chiến. `GenreWeaponPolicy` đã ghi sẵn cả cơ chế lẫn bài học; thuỷ chiến chỉ là mảng
   duy nhất chưa bao giờ đi qua chốt đó, vì nó hở CẢ HAI cửa:

   · scene thuỷ chiến **không có `CivilizationTeamAssigner`** (nền chốt lúc dựng scene), nên
     `AddCivilizationAssignerShared` — chỗ tiện tay gắn bộ lọc thể loại cho hơn 20 builder
     khác — không bao giờ chạy;
   · `CrewShip` **cố ý** dùng `ApplyLookTo` chứ không `ApplyTo` (giữ việc phân vai), mà
     `ApplyTo` mới là chỗ DUY NHẤT gọi `SetSwapPool`.

   Và điều kiện kích hoạt thì trên biển đúng gần như MỌI LÚC: `AIWeaponSwapModule` đi tìm
   "cây NỔ" khi địch **túm tụm ≥3**, mà một cái BOONG THUYỀN thì lúc nào cũng túm tụm — đó
   chính là thiết kế của áp mạn. `FindWeaponIndex` lấy cây đầu tiên khớp = `Weapon_Bomb`
   (chỉ số 6).

   Chữa bằng MỘT dòng ở `CreateSea` (`EnsureNoThrownBombs` → `AddGenrePolicyShared(Medieval)`),
   vì đó là hàm mà **mọi** scene thuỷ chiến đều gọi ở dòng đầu. Bắt từng bài tự nhớ thêm một
   dòng là kiểu gì cũng sót một bài, và bài sót thì lặng lẽ có người ném bom giữa một trận
   kiếm-cung.

16. ⚠⚠ **HAI LỖI CỦA BẢN DỰNG ĐẦU TIÊN — người dùng báo *"AI không hoạt động, nhà ở dưới đất"***
   (2026-09-07, đo trong scene đã bake).

   Cả hai đều KHÔNG phải lỗi của thuỷ chiến, và cả hai đều lộ ra vì map này là map đầu tiên
   có **mặt đất khác cao độ mặc định** (đảo ở −0.9, `StickmanSceneUtils.DefaultGroundTop` −2.0).

   · ⚠⚠ **"NHÀ Ở DƯỚI ĐẤT" = ART BÁM VÀO MỘT CAO ĐỘ ĐÃ BAKE, KHÔNG BÁM VÀO CÁI THÂN.**
     `StructureSkin` giữ riêng `_groundY` và mỗi lần khoác art nó ĐẶT LẠI hình về đúng đó:
     `_artRenderer.transform.position = (transform.position.x, _groundY, …)`.
     `CreateHouseShared` thì bake thẳng `GroundTop` vào số đó. Nên **dời cái nhà sau khi dựng
     là thân đi còn hình ở lại** — nhà chính đứng ở −0.9 mà hình nằm ở −2.0, tức chìm ngang
     mặt nước. Không lỗi nào báo, và **không chữa được từ phía người gọi** vì `_groundY` là
     dữ liệu đã bake.
     Chữa ở GỐC: `CreateHouseShared(..., float? groundY = null)` — mặc định `GroundTop` nên
     hơn 20 builder cũ không đổi một ly, còn map đảo truyền `ShoreY` vào lúc dựng.
     ⚠ Bài học rộng hơn, và nó lớn hơn cái map này: **một phép dời `transform` KHÔNG với tới
     được dữ liệu đã bake bên trong component.** Hàm `Lift()` của builder đảo dùng được cho
     nhân vật và mỏ vàng (chúng không giữ cao độ nào), nhưng KHÔNG dùng được cho bất cứ thứ
     gì tự nhớ mặt đất của mình.
     · **Doctor canh bằng PHÉP ĐO** («Công trình khoác art vào SAI CAO ĐỘ ĐẤT»): so `_groundY`
       với toạ độ world thật của chính object đó, ngưỡng 0.35. ⚠ Phải **cộng dồn chuỗi cha** —
       builder gom công trình vào object thư mục của từng phe nên nhà chính LUÔN có cha; chỉ
       đo object ở gốc scene là phép đo không bao giờ chạm tới ca cần bắt.
       ⚠ Cắt khối YAML bằng `Split("--- !u!")`, ĐỪNG dùng regex nhiều dòng: `\r?\n` trong
       chuỗi verbatim rất dễ thành xuống dòng thật lúc soạn file, và khi đó regex vẫn biên
       dịch sạch nhưng KHÔNG KHỚP GÌ CẢ — một phép đo câm đi bắt lỗi câm.
       Lần chạy đầu bắt được `Demo_49_IslandWar` (lệch 1.10) **và 6 scene cũ có cùng dấu
       hiệu** (`Demo_28_SiegeCamp`, `Demo_3_AIBattle`, `Demo_41_SiegeTrain`, `Demo_8_AILab`,
       `Genre_Medieval_Siege`, `Genre_Medieval_ZombieDefense`) — lỗi có sẵn, chưa ai đụng tới,
       chỉ là tới giờ mới *nhìn thấy được*.

   · **"AI KHÔNG HOẠT ĐỘNG" = MÀN MỞ RA VỚI ĐÚNG BỐN NGƯỜI TRÊN CẢ BẢN ĐỒ.**
     Đo lại toàn bộ scene thì mọi mối nối đều ĐÚNG: nông dân khai `_behavior = 8` (Work), mỏ
     vàng/rừng củi đúng phe đúng loại, `ResourceNode.FindNearestAvailable` chỉ đo `|Δx|` (nên
     cao độ không ảnh hưởng), `CampBuildYard` bake `_navalMap = 1` · `_harborX = ±26.5` ·
     `_groundY = −0.9`, ví tiền nối đủ kho + nhà chính. Không có gì hỏng.
     Cái sai là THIẾT KẾ MỞ MÀN: mode cố ý bắt MUA mọi thứ, nên mỗi đảo chỉ có hai nông dân,
     không một người lính, và cả hạm đội nằm trong kho. Chuỗi phải chạy xong trước khi có thứ
     đáng nhìn là **đào vàng → nhà lính → mua quân → bến cảng → đóng thuyền → chở quân** —
     vài phút ngồi xem hai ông nông dân đi lại. `Demo_20_WarCamp` không dính vì nó có sẵn một
     ông TƯỚNG ĐỎ trên sân; bản đảo bỏ mất vế đó.
     Chữa: mỗi đảo **bốn lính mở màn** (kiếm · giáo · khiên · cung) + **tướng đỏ**
     (`HeroCommander`). Bốn là con số nhỏ nhất mà cả ba hệ có việc ngay từ giây đầu — tổ canh
     nhà có người để giữ (`_target` = 2), bộ điều phối còn dư người để đưa xuống thuyền
     (`_minArmyToAttack` = 3), và sân đảo có người để nhìn.
     ⚠ **VẪN KHÔNG phát thuyền sẵn.** Con thuyền phải là thành quả của chuỗi quyết định — đó
     là khác biệt lớn nhất so với ba bài thuỷ chiến cũ. Cái thiếu là QUÂN, không phải TÀU.

17. **CÁ — ba tầng khác nhau, đừng gộp làm một** (2026-09-07).

   Người dùng xin *"hiệu ứng cá bơi và câu cá, đánh cá"*. Đó là BA thứ, và mỗi thứ trả lời
   một câu khác nhau — gộp chung thành "hệ thống cá" là hỏng cả ba.

   | Tầng | Là gì | Nối vào |
   |---|---|---|
   | **Cá bơi** | lớp NHÌN, không phải hệ chơi | `FishSchool`, gắn ở `CreateSea` |
   | **Câu cá** | một NGƯỜI ngồi câu ở chòi | `CampBuildKind.FishingHut` + `ResourceNode` |
   | **Đánh cá** | một CON THUYỀN ra khơi kiếm vàng | `FishingBoat` + `FleetPurchase.Fisher` |

   · **`FishSchool` rẻ có chủ ý**: không vật lý, không collider, không `Instantiate` giữa
     trận, không cấp phát mỗi frame — một mảng dựng sẵn lúc `Start` rồi chỉ ghi
     `transform.position`. Cá KHÔNG phải `TeamMember`, không vào sổ nào, nên không hệ AI hay
     chiến đấu nào phải biết chúng tồn tại. Tự tắt khi scene không có `WaterZone` (đúng khuôn
     `AINavalModule`), và gắn ở `CreateSea` nên MỌI bài thuỷ chiến đều có.
     ⚠⚠ **SORTING PHẢI DƯỚI LỚP `Sea`** (−5). Lớp đó là khối nước bán trong suốt vẽ TRƯỚC cả
     con thuyền (cố ý — để thân chìm bị nhuộm xanh). Đặt cá lên trên nó là cá dán ĐÈ lên mặt
     biển: nhìn ra một con cá BAY. Dùng `WaterSurface + 2` (−61) — sau đường sóng, trước đáy
     biển (−70), và vẫn dưới thân thuyền (−34) nên cá bơi qua GẦM thuyền.

   · ⚠⚠ **TÁCH "LÀM VIỆC GÌ" KHỎI "MANG VỀ CỦA CẢI GÌ"** (`ResourceNode.Payout`, mặc định
     chính là `Resource` nên mười hai loại node cũ không đổi một ly).
     Chòi câu là ca ĐẦU TIÊN hai câu đó tách nhau: **việc** là `Water` — để mượn đúng dáng
     NGỒI THỤP của `AIStateWork.IsCrouchWork` (tức dáng ngồi câu, **không một dòng animation
     nào mới**) và đúng ô lệnh «Cá»; **của cải** là `Gold` (bán cá).
     Nhét chung một trường thì phải chọn một đằng, và đằng nào cũng hỏng: khai `Water` thì cá
     rơi vào một ô kho **không hệ nào tiêu được** (`TeamEconomy` chỉ đọc Gold và Wood) — cả
     cái chòi thành đồ trang trí mà không lỗi nào báo; khai `Gold` thì thợ ĐỨNG VUNG CUỐC
     xuống mặt nước và thẻ lệnh hiện «Vàng».

   · ⚠⚠ **«CÁ» PHẢI CÓ TRONG VÒNG THẺ LỆNH**, không thì chòi câu là NỘI DUNG CHẾT.
     `AIStateWork` chọn node theo KHOẢNG CÁCH (`|Δx|`), mà chòi câu nằm ngoài mép nước còn
     nông dân thì sinh ra cạnh kho — thợ «Tự động» sẽ KHÔNG BAO GIỜ ra đó. Nay vòng thẻ là
     VÀNG → CỦI → XÂY → **CÁ** → TỰ, và ô «Cá» bị bỏ qua khi phe chưa có chòi (đúng cách ô
     «Xây» bị bỏ qua khi chưa có móng). Đây là bệnh «tính năng làm xong mà không có đường nào
     chọn tới» — xem `CampGameUi.BuildKinds`.

   · **`FishingBoat` là một quyết định thật vì nó ĂN MỘT SUẤT BẾN** (`IslandHarbor.MaxShips`
     đếm MỌI thuyền đang nổi). Ba khoản ở cùng một cái bến, cùng một trần: *sang đảo địch
     nhanh hơn* · *giữ mặt biển* · *giàu hơn*. Và nó ra khơi TAY KHÔNG — chiến thuyền địch
     bắt gặp là mất trắng, tức chiến thuyền có việc mà không cần thêm luật nào.
     ⚠ Tiền vào kho qua `ResourceDepot.Store`, ĐÚNG CỬA nông dân đổ vàng vào — hai nguồn tiền
     ghi hai chỗ là hai con số có thể nói ngược nhau.
     ⚠ Chạy bằng `ShipOrder.SailTo` như chuyến đò, nên `IslandWarCommand.OrderWarships` phải
     bỏ qua CẢ HAI: cướp lệnh của thuyền cá là nó quay ra đánh nhau giữa đường.

   · **BẢNG SỐ ĐO, KHÔNG GÕ CẢM TÍNH.** Ngư trường cách bến 8, Longboat chạy 1.7 ⇒ mỗi chiều
     4.7 giây; cộng 12 giây thả lưới ⇒ chuyến **21.4 giây**. 22 vàng/chuyến ⇒ **1.03
     vàng/giây**, so với một nông dân đào vàng **0.58** (2.2 giây một nhát + 2×7 đơn vị đường
     về kho): con thuyền bằng khoảng HAI nông dân, tốn 26 vàng + 20 củi, không cần người, ăn
     một suất bến.
     ⚠ Bản nháp để 9 giây / 26 vàng ra **1.41 vàng/giây** (≈ 2.4 nông dân) — ở mức đó mua
     thuyền cá là nước đi hiển nhiên và ván kinh tế hết ngã rẽ. Đo mới thấy; con số đầu tiên
     tôi gõ ra còn ghi nhầm quãng đường là 8 giây thay vì 4.7.

   · **Art cá là art VẼ BÙ** (`NavalArtGenerator.FishSprite` → `Fish_Small` · `Fish_Big`).
     Vẽ TRẮNG/XÁM để `SpriteRenderer.color` tô được, đầu quay +X như bộ vũ khí.
     ⚠⚠ **THÂN PHẢI CHỒM VÀO ĐUÔI** (`bodyX0 = tailLen × 0.72`): bản đầu để hai mảnh sát nhau
     đúng mép, mà chỗ tiếp giáp thân mỏng gần bằng 0 nên **cái đuôi rời hẳn ra** — nhìn thành
     một cái nơ trôi lơ lửng cạnh con cá. Chỉ thấy được bằng cách render ra PNG rồi NHÌN.
     ⚠⚠ `Mathf.Pow` phải nhận số ĐÃ KẸP [0..1]: `t` âm (vòng lặp bắt đầu ở `RoundToInt` của
     một số thực) đưa vào `Pow(t, 0.85)` là **NaN**, mà `RoundToInt(NaN)` ra 0 — con cá mất
     nửa thân, không lỗi nào báo.
     Muốn cá đẹp thì đặt hình rồi thả PNG cùng tên vào `Assets/Sprites/Naval/` — `Save`
     KHÔNG ĐÈ file đã có.
