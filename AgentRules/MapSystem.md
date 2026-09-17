## Hệ thống XÂY MAP + ĐIỀU KIỆN THẮNG THUA (Assets/Scripts/Map/)

"Thêm một màn chơi" = **thêm một asset**, không phải viết thêm tool dựng scene. Map, nhiệm vụ,
quân đội hai phe và luật thắng thua đều là DỮ LIỆU; chỉ có MỘT đường dựng, dùng chung cho map
thiết kế tay, map sinh ngẫu nhiên và map bake ra scene.
Chi tiết: `Docs/KnowledgeBase/MapSystem.md`. Tám điều cần nhớ:

1. **Ba tầng, không lẫn nhau**: DỮ LIỆU (`MapDefinition` · `MapRecipe` · `MapLibrary`) →
   DỰNG (`MapAssembler` gọi `MapScenery` + `MapSpawn`) → TRỌNG TÀI (`MatchDirector` +
   `MapObjective`). Vỏ ngoài là `MapArena` (chọn map / random / chơi lại) và `MapPopulator`
   (ra quân cho map đã bake). Phím trong sân: **F2** chọn map · **N** map ngẫu nhiên ·
   **F5** chơi lại.
1b. **BA THỂ LOẠI CHẠY CHUNG MỘT HỆ** — `Demo_29_MapMedieval` · `Demo_30_MapModern` ·
   `Demo_31_MapFantasy`, mỗi sân chỉ chơi map của bộ mình (7 map + 1 công thức random mỗi bộ).
   Khác nhau nằm ở DỮ LIỆU chứ không ở code: `GenreKit` trong `MapLibrary` quyết định bộ quân
   (trung cổ khiên/cung · hiện đại súng nấp bắn · fantasy trượng phép), `MapTheme` của thể
   loại quyết định bối cảnh, bảng `Blueprints` quyết định map. `MapAssembler` KHÔNG biết gì về
   vũ khí — nó chỉ hỏi `MapLibrary.LoadoutFor(genre, role)`.
   ⚠ **Nền văn minh CHỈ cho trung cổ** (`GenreKit.useCivilizations`) — bỏ cờ này là map hiện
   đại ra tiểu đội mặc giáp Viking cầm súng trường.
   Ô chọn scene (F1) có tab riêng từng thể loại (`DemoSceneCatalog.Category.Medieval/Modern/
   Fantasy`, tab xuống dòng sau mỗi 3 nhóm).
1c. **THÀNH LUỸ** (`MapCastle` + `MapDefinition.fortStyle`): map có doanh trại thì tự dựng
   tường thành (mặt trên đứng bắn được) + cổng phá được + tháp canh có thang — trung cổ/fantasy
   xây `Castle`, hiện đại đắp `Barricades`. Dùng CHUNG `Fortification` + `GarrisonPost` +
   `StickmanClimbZone` nên AI biết sẵn: cung thủ trèo tháp bắn, quân công thành đập cổng, thợ
   vá tường. ⚠ Thành luỹ là CÁC CỤM RỜI, **không bịt kín chiều ngang map** — AI không leo tường.
   ⚠ **CỔNG map sinh là chốt chặn THẬT** (luật user chốt 2026-09-02: *"công thành = phá CỔNG
   + leo CẦU THANG, không phải đục tường"*): `passableForOwner` cho quân nhà, quân công phải
   PHÁ — từng có đợt để `passableForEveryone` cho cả cổng, cả toà thành không chặn được ai và
   "công thành" chỉ còn là đi bộ vào trại. Tường/tháp thì VẪN nhường làn (`passableForEveryone`)
   để không bịt map; giá trị của tường nằm ở CAO ĐỘ (garrison bắn xuống, cầu thang giành nhau),
   và `MapBuildRules` luật 1b miễn cho đúng `FortKind.Gate` còn sống — cổng phá được là một
   cách qua hợp lệ, tường đặc thì không được miễn kiểu đó.
1d. **HAI CÁCH CHƠI + CHẾ ĐỘ XEM** (`PlayerRole` trong `MapDefinition`): `Hero` cầm một nhân
   vật · `Commander` KHÔNG có nhân vật, chơi bằng LỆNH + ĐIỂM TẬP KẾT + XÂY (`CommanderPlayHud`,
   tiêu "điểm chỉ huy" cộng theo thời gian và số quân sống) · `Observer` ngồi xem máy đánh.
   Nút "Cách chơi" trên HUD sân map đổi qua lại (đổi xong dựng lại ván).
   ⚠ Vai `Commander` KHÔNG đẻ cơ chế mới: lệnh qua `TeamCommander.Issue`, tập kết bằng cách
   DỜI CỘT MỐC (đừng `SetBehavior` từng lính), xây bằng `MapCastle.BuildTower/BuildBarricade`.
   ⚠ Cố ý KHÔNG dùng `TeamEconomy` cho điểm chỉ huy — phần lớn map không có mỏ vàng, bắt
   phải có kinh tế là nửa số map mất luôn vai chỉ huy.
   **PHÒNG THÍ NGHIỆM AI có 2 tab**: *Hành vi & chỉ huy* (bài dựng sẵn) và *Bot điều hành*
   (mở thẳng một ván gameplay ở vai `Observer` qua `MapArenaRequest` — dùng lại đúng hệ map
   chứ không chép một bản mô phỏng riêng, chép là hôm sau sửa AI hai bên lệch nhau).
   ⚠ Scene QUAN SÁT (không bám ai) giờ **kéo màn hình để lia camera** được:
   `DemoCameraFollow._observerDrag` tự đọc chạm/chuột — `StickmanTouchControls` chỉ có ở scene
   có người chơi, nên trước đó điện thoại không có cách nào lia trong AI Lab.
2. **24 KIỂU NHIỆM VỤ** (`MissionType`; thứ 22 là **Tử chiến đồng đội**
   2026-09-09 — xem mục *TỬ CHIẾN ĐỒNG ĐỘI* bên dưới; thứ 21 là **Phố mở — GTA 2D** 2026-09-09, luật riêng ở
   [OpenWorld.md](OpenWorld.md) — **kiểu chơi duy nhất KHÔNG CÓ TRỌNG TÀI**: `MatchRules.DefaultFor` trả danh
   sách RỖNG, cố ý. Thứ 18 là **Battle Royale** 2026-09-08 — luật riêng ở
   [BattleRoyale.md](BattleRoyale.md), đi đủ chuỗi dưới đây + `MissionSettings.squadSize` +
   `MapArena._recipeOverride` cho sân có công thức riêng): Giao chiến · Bảo vệ doanh trại · Tấn công doanh trại ·
   Bảo vệ VIP · Hộ tống hàng · Chiếm cứ điểm · Sinh tồn · Cướp cờ · Kéo co · Cướp làng
   (ba kiểu 2026-09-05, xem mục *BA NHIỆM VỤ MỚI CỦA HỆ MAP*) · **Vây thành · Cứu tù binh ·
   Đấu tướng · Loạn chiến · Kinh tế·doanh trại · Zombie·giữ làng · Zombie·áp tải**
   (bảy kiểu 2026-09-07, xem mục *BẢY KIỂU CHƠI MỚI*) · **Tử chiến đồng đội** (2026-09-09).
   Thêm kiểu mới phải đủ CHUỖI: `MissionInfo` (tên/lời dẫn/đồng hồ) → `MissionPlan.For`
   (+ `ForScene`) → `MapBlueprint.For`/`Validate` → `MapKitPlanner` (lô) + `MapKit.Validate` →
   `MapAssembler.BuildMission` (+ `ResolveTargetsFromScene`) → `MatchRules.DefaultFor` →
   **`MapStudio.Missions`** → preset trong `StickmanMapSystemBuilder.Blueprints` +
   `StickmanGenreMissionCatalogBuilder`.
   ⚠⚠ **CÓ PHÉP ĐO CANH ĐỦ CHUỖI (2026-09-08): `StickmanMissionChainCheck`** — Doctor mục
   *«Kiểu chơi (MissionType) nối thiếu điểm»*, hoặc `Nâng cao > Rig & Kiểm tra > Soát chuỗi điểm
   nối của kiểu chơi`. Nó quét chữ `MissionType.X` trong BẢY file bắt buộc (`MissionPlan` ·
   `MapBlueprint` · `MapKitPlanner` · `MapAssembler` · `MapTypes` · `MapStudio` ·
   `StickmanMapSystemBuilder`) và hỏi `MapLibrary.HasMapFor` xem kiểu đó đã có map nào chưa.
   Thêm kiểu chơi xong thì bấm nó thay vì tự rà bằng trí nhớ. `Annihilation` được miễn vì nó là
   nhánh `default:` của mọi bảng — kiểu khác thì không được phép như vậy.
   ⚠⚠ **THIẾU DÒNG TRONG `MapStudio.Missions` LÀ KIỂU CHƠI ĐÓ KHÔNG CÓ KHO MAP.** Người dùng
   báo *"xưởng map không đủ chế độ chơi"* (2026-09-07): bảy kiểu trên trước đó chỉ có scene
   dựng tay, nên mở Xưởng map trong màn "Kinh tế" thì `MissionPlan.ForScene` quy nó về "Tấn
   công doanh trại" và cả kho map hiện ra là của một chế độ khác. Không lỗi nào báo.
   ⚠⚠ **"BÊN NÀO ĐI CÔNG, BÊN ĐÓ CÓ ĐẬP CÔNG TRÌNH KHÔNG" CHỈ ĐƯỢC HỎI `MissionPlan`** —
   đừng bao giờ tự suy từ `context.attackTarget* != null`. Chính vì thế mà `MissionPlan` tồn
   tại (nó ghi rõ ba chỗ phải đọc chung), nhưng `MapAssembler.SpawnUnit` còn sót bản gõ tay
   tới 2026-09-02 và nó SAI ở đúng hai kiểu có MỤC TIÊU BIẾT ĐI: **Bảo vệ VIP** (attackTarget
   = ông VIP) và **Hộ tống** (= cái xe). Cả hai khai `attackerBreaksStructures: false` vì phải
   ĐUỔI THEO mục tiêu, nhưng test cũ vẫn phát `siegeProfile` (`structureTargetBonus = +4`) cho
   TOÀN BỘ phe tấn công → cả toán cướp tách ra đập tường/tháp/nhà ven đường trong khi cái xe
   đi qua mặt. Điều kiện thắng của màn không bao giờ bị đụng tới, **không lỗi nào báo**.
   Đúng: `plan.attackerBreaksStructures && plan.IsAttacker(map, teamId)`.
3. **LUẬT THẮNG LÀ DANH SÁCH VẾ** `MatchRule`: "phe X thắng khi Y". Vế nào thành trước thì phe
   đó thắng — **không có luật thua**, thua là địch thắng trước. Trọng tài KHÔNG giữ tham chiếu
   tới nhà/VIP/xe: nó hỏi `MapObjective` theo VAI TRÒ (Headquarters/Vip/Cargo/CaptureZone/
   Structure), nên map dựng lúc chạy và map bake sẵn chấm điểm y hệt nhau.
4. **MAP RANDOM = bốc số + KIỂM TRA THỰC TẾ.** `MapRecipe` cho khoảng, `MapGenerator` bốc theo
   SEED (tất định — seed in trên HUD để dựng lại đúng ván có bug), rồi `Sanitize` sửa những tổ
   hợp hợp lệ về số nhưng hỏng về luật chơi: map hộ tống thì xoá hết khe vực (xe hàng không
   nhảy được), map chiếm điểm thì nới rộng cho ba vùng khỏi chồng nhau.
5. **KHÔNG dựng tường cao chắn ngang đường đi** — AI không leo tường, cả trận sẽ đứng nhìn nhau
   qua bức tường. Vật chắn của map luôn thấp hơn người; tháp dựng LỆCH sang hai bên chứ không
   bịt lối vào nhà. Nhà cửa dùng collider **TRIGGER** (lính đi xuyên, đạn vẫn trúng).
6. **Công trình phải `ConfigureAsStructure` TRƯỚC khi object được bật** — `_buildBodyHitboxes`
   chỉ đọc một lần trong Awake, bật trước là Unity đi dựng hitbox cơ thể cho một cái nhà.
   Mẫu đúng: tạo object TẮT → AddComponent → Configure → `SetActive(true)`.

6a-trung. ⚠⚠⚠ **`[RequireComponent]` LẶNG LẼ CHÈN MỘT `Fortification` MẶC ĐỊNH — LUÔN
   `GetComponent ?? AddComponent`, ĐỪNG `AddComponent` THẲNG**
   (2026-09-04, người dùng báo *"AI nó tập trung đánh cái tường thành"*).

   `VillageGate` khai `[RequireComponent(typeof(Fortification))]`. Hai đường dựng cổng làng
   gọi NGƯỢC THỨ TỰ nhau, và chỉ một đường dính:

   | Đường | Thứ tự | Kết quả |
   |---|---|---|
   | `StickmanFortBuilder.CreateVillageGate` (Editor) | `AttachFort` **trước**, `VillageGate` sau | ĐÚNG — 1 bản |
   | `MapCastle.BuildVillageGate` (runtime) | `AddComponent<VillageGate>` **trước**, `FinishFort` sau | Unity tự chèn `Fortification` MẶC ĐỊNH rồi builder thêm bản thứ hai ⇒ **HAI** |

   Bản Unity tự chèn mang **toàn giá trị khởi tạo**: `kind = 0 = Barricade`, `hp = 3` (máu mặc
   định của `StickmanController`), `passableForEveryone = 0` ⇒ **một rào chắn 3 máu chặn làn
   nằm chồng khít lên cái cổng**. `Fortification` KHÔNG khai `[DisallowMultipleComponent]`
   nên Unity không kêu một tiếng nào.

   **Hỏng dây chuyền, cả ba vế đều câm:**
   · `VillageGate.Awake` lấy `GetComponent<Fortification>()` = **bản ĐẦU TIÊN** = cái Barricade
     ⇒ `BindGate` gắn nhầm chỗ, cái Gate 70 máu **không biết mình là một cánh cửa** ⇒ quân nhà
     không đi xuyên được cổng nhà mình;
   · Barricade vỡ sau một nhát ⇒ `IsOpen` trả true (vì `_fort.IsDie`) trong khi Gate vẫn đứng
     chắn ⇒ **cổng khoá cứng CẢ HAI PHE tới hết trận**;
   · AI thấy một vật cản CÓ MÁU chắn làn ⇒ `UpdateBlockedPath` bám (có CAM KẾT), mà luật chia
     mục tiêu thì được MIỄN cho công trình ⇒ **cả toán xúm vào đập một chỗ** — đọc ra thành
     *"AI tập trung đánh tường thành"*, dù tường thật (`passableForEveryone=1` +
     `_indestructible=1`) hoàn toàn vô can.

   ⚠ **CHỮA Ở NÚT THẮT `FinishFort`, đừng đảo thứ tự ở chỗ gọi**: đảo thứ tự chỉ cứu đúng cái
   cổng, còn chi tiết thành thứ ba ngày mai lại dính. `TeamMember`/`Rigidbody2D` trong cùng hàm
   cũng đổi sang cùng khuôn.
   ⚠ **ĐỪNG chữa bằng `[DisallowMultipleComponent]` trên `Fortification`**: khi đã có một bản,
   `AddComponent` sẽ log lỗi và trả **null** ⇒ `FinishFort` ném `NullReferenceException` ⇒ đổi
   một lỗi câm lấy một lỗi làm vỡ cả đường dựng.

   ⚠⚠ **CÁCH SOI — ĐẾM COMPONENT TRONG FILE `.unity`, ĐỪNG NHÌN SCENE VIEW.** Hai
   `Fortification` chồng nhau trên một GameObject thì Inspector nhìn ra hai khối giống hệt và
   rất dễ lướt qua. Phép đo: gom `m_Script` guid theo `m_GameObject` rồi réo object nào có
   cùng một script **hơn một lần**. Đây cũng là cách bắt được lớp lỗi này ở mọi component
   khác — nó KHÔNG riêng gì `Fortification`.

   ⚠ Kèm bài học về DỤNG CỤ: `scan_lane.py` báo mấy khối đó là *"KHỐI ĐẶC (không ai mở được)"*
   — **sai**, vì bộ FortKit đặt `Fortification` ở object CHA còn collider ở object CON, mà
   script cũ giả định chúng cùng object. Đổi cấu trúc cây thì phải soát lại mọi phép đo đọc
   thẳng file `.unity`, không thì công cụ nói dối đúng lúc cần nó nhất.

6b. ⚠⚠ **SINH QUÂN PHẢI ĐỨNG TRÊN ĐẤT — ĐỪNG TIN MỘT CAO ĐỘ CHỐT SẴN**
   (`MapAssembler.StandOnGround`, rà 2026-09-03). Đường sinh quân của hệ map lấy
   `layout.groundTop + StandHeight(1f)` rồi thôi. Hai vế sai cộng lại:
   · dư nguyên hằng số **1.0** (con số chỉ có nghĩa nếu định thả cho rơi xuống);
   · thiếu vế trừ `StickmanLocomotion.GroundOffset` (**≈0.089**) — gốc transform nằm THẤP HƠN
     bàn chân, nên đặt gốc vào mặt đất là bàn chân nổi lên.
   ⇒ **bàn chân lơ lửng ~1.09** ở MỌI map sinh, cho cả lính, tướng, VIP, ninja lẫn người chơi.
   ⚠ Kỵ binh bay **CÙNG MỘT MỨC** chứ không lún: `StickmanMount` neo vào root nên nó tự nhất
   quán — bug KHÔNG nằm ở hệ vật cưỡi, đừng đi sửa `RaiseRider`/`SetVisualLift`.
   ⚠ Đo mặt đất bằng **`Layout.SurfaceY`**, KHÔNG raycast: lúc dựng map, collider vừa tạo trong
   cùng frame chưa chắc đã vào thế giới vật lý. Và phải `Physics2D.SyncTransforms()` trước khi
   hỏi `GroundOffset` — số đó đo từ `bounds` của chân đế, đọc ngay sau khi vừa dời transform là
   nhận khung bao của nhịp TRƯỚC.
   ⚠ Ép cao độ về `groundTop` (bản cũ) còn có nghĩa là ai rơi trúng X của một cái BỤC / DỐC cầu
   thang thì bị **CHÔN TRONG KHỐI ĐÁ** — `SafeX` cố ý không đá ra khỏi dốc. Muốn đội hình đứng
   ở làn đất chính thì chọn lại X (`OnRaisedGround`), đừng nói dối về Y.
   ⚠ Bản đúng để đối chiếu: `MapStudio.DropPeopleToGround`. `RespawnDirector.DropToGround` đúng
   phần raycast nhưng **còn thiếu vế trừ `GroundOffset`** (dư ~0.089).

6c. ⚠⚠ **`MapCastle.OpenLegacyPrimaryRoute` TỪNG MỞ TOANG CẢ CỔNG THÀNH.** Nó quét MỌI
   `Fortification` rồi `SetPassableForEveryone(true)`, mà `MapAssembler.Populate` — đường nạp
   **mọi map ĐÃ BAKE**, tức phần lớn map người chơi gặp — gọi thẳng nó. Nên `BuildCastle` cẩn
   thận đặt cổng làm chốt chặn thật (`passableForEveryone: false`) rồi bị mở ra vài dòng sau:
   "công thành" quay lại thành **đi bộ vào trại**, không lỗi nào báo. Nay `FortKind.Gate` còn
   sống được miễn trừ; tường/tháp vẫn nhường làn (giá trị của chúng là CAO ĐỘ, không phải bịt
   map). Cổng không cần miễn để tránh kẹt: nó **phá được**, và `MapBuildRules` luật 1b đã khai
   rõ "phá được là một cách qua hợp lệ".

6d. ⚠⚠ **THỦ THÀNH PHẢI KHAI `AIBehavior.Garrison` — KHÔNG CÓ AI "HÚT" AI LÊN THÁP CẢ.**
   Chú thích trong `MapAssembler` từng nói cung thủ phe giữ trại được `GarrisonPost` hút lên
   tháp. Đo lại: `AIBehavior.Garrison` chỉ có ĐÚNG MỘT đường vào (`DefaultState`), tức phải
   được KHAI lúc sinh quân — và **không builder nào của hệ map khai nó**. `MapCastle` dựng
   tường + 2 tháp kèm `GarrisonPost` tử tế rồi không một ai trèo lên: cả phe thủ dàn hàng dưới
   đất, mấy cái tháp đứng làm cảnh suốt trận. Đúng kiểu *"code có sẵn mà không ai gọi"*.
   ⚠ Chỉ khai khi map THẬT SỰ có thành luỹ (`fortStyle != None`): không tìm được post thì
   `AIStateGarrison.TickFind` đứng tại chỗ chờ địch, ở map trống đó là cả tuyến cung chôn chân.
   ⚠⚠ Vế thứ hai, thiếu là vế đầu vô nghĩa: **`CommandNode.ApplyToAgent` ghi đè `SetBehavior`
   MỖI NHỊP** nên cung thủ vừa bám được thang là bị lệnh "giữ tuyến" lôi xuống, nhịp sau lại
   leo — leo lên tụt xuống tới hết trận. Nay quân đang `Garrison` được miễn phần dời cột mốc
   (vẫn nhận gợi ý mục tiêu). **ĐỪNG chữa bằng cách loại Garrison khỏi `IsCombatant`**: lính
   gác vẫn là lực lượng thật, phải được đếm vào cán cân, phải nhận tin báo địch và phải hiện
   trong ô chọn cấp AI.
7b. **XÂY MAP THEO GAMEPLAY** (`MapBlueprint` + `Tools > Stickman > Maps > 0`): mỗi kiểu chơi
   một bộ số địa hình riêng, vì **địa hình phải phục vụ LUẬT THẮNG** — map mà địa hình không
   liên quan tới cách thắng thì kiểu chơi nào cũng ra một bãi đất như nhau.
   · Hai tầng, đừng lẫn: `MapBlueprint` là vế **CHỦ ĐỘNG** (map thế nào thì chơi HAY),
   `MapGenerator.Sanitize` là **LƯỚI AN TOÀN** chạy sau (chặn map chơi KHÔNG ĐƯỢC).
   · Vài mốc: hộ tống DÀI nhất (34–46) + tuyệt đối không vực · sinh tồn HẸP nhất (22–30) ·
   công trại nhiều vật che nhất và quân công ĐÔNG HƠN quân thủ · chiếm điểm cần ≥8 đơn vị
   cho mỗi vùng · VIP thì không vực KHÔNG THANG (leo lên rồi kẹt).
   ⚠ **LUÔN CÓ MAP MẶC ĐỊNH cho cả 7 kiểu** (`StickmanMapMaker.EnsureAllDefaults`, nằm trong
   `Build > 4`): thiếu là vào kiểu chơi chưa có map thì ô chọn trống trơn, KHÔNG lỗi nào báo.
   ⚠ Xây map chỉ có trên EDITOR (ghi asset vào `Assets/`); lúc chơi chỉ CHỌN trong kho — F2,
   có hàng lọc theo kiểu chơi, ★ = map mặc định.
   ⚠ Map chơi thấy sai thì sửa **BẢNG LUẬT** rồi xây lại, ĐỪNG sửa tay asset — sửa tay thì
   đúng được một map, map sau vẫn sai y hệt.

7. **Muốn quân đập nhà thì phải đủ CẢ BA** (bài học từ mode Doanh trại): học thuyết
   `pushToEnemyBase` · `AIProfile.structureTargetBonus` DƯƠNG · `SelectBestEnemy` nhận diện
   công trình. Hệ map lo hai cái đầu bằng `MapLibrary.assaultDoctrine` + `.siegeProfile`
   (tool `Maps > 1` sinh sẵn). Và `EliminateEnemies` **chỉ đếm NGƯỜI** — đếm cả nhà thì diệt
   sạch quân địch rồi trận vẫn không kết thúc vì còn cái tháp.

7b-terrain. **HỒ NƯỚC = KHE VỰC CÓ NƯỚC VÀ CẦU** (`MapDefinition.lakeCount`): hồ ghi vào CẢ
   `Layout.pits` nên mọi luật né vực có sẵn (SafeX, IsOverPit, tia dò mép, AI không nhảy
   xuống) TỰ ÁP — cho hồ đi đường riêng là phải sửa từng luật đó, quên một cái là lính spawn
   giữa hồ. Cầu gỗ ba vế: mặt cầu NGANG mặt đất (cao hơn = bậc phải trèo, thấp hơn = hố phải
   nhảy) · phủ QUÁ mép hồ 0.4 (hở khe là tia dò mép báo "không đất", AI khựng ở bờ) ·
   collider MỎNG chỉ ở mặt (khối đặc là người rơi xuống nước kẹt giữa trụ). Nước dùng
   `WaterZone` của thuỷ chiến, không đẻ hệ nước thứ hai. Lều/mỏ vàng/bãi gỗ THUẦN DECO —
   không collider (luật đồ trang trí).

7c-rules. **LUẬT DỰNG MAP KIỂM ĐƯỢC — `MapBuildRules`** (một chỗ trả lời "map có CHƠI ĐƯỢC
   không"): 5 bất biến — bậc thang ≤ 0.18 đo chênh cao THẬT · khối đặc giữa làn phải phá/leo/
   xuyên được · deco không collider · hồ phải có cầu phủ kín · mốc sinh quân có đất dưới chân.
   `MapAssembler` gọi sau khi dựng (log kèm seed), tool `Maps > 5` chạy tay trên scene mở.
   **Thêm loại công trình mới = tự hỏi có phạm bất biến nào / cần bất biến mới không**; luật
   mới là một hàm `Check*` + một dòng trong `Validate`, đừng rải if lẻ trong builder.

7d-buc. ⚠⚠ **BỤC ĐỊA HÌNH LÀ VẬT CHẮN TỆ NHẤT CỦA HỆ MAP — LUÔN DỰNG CẦU THANG HAI BÊN.**
   `MapScenery.BuildPlatforms` từng đặt một khối ĐẶC cao 1.3–3.0 rồi thôi, lối lên chỉ có khi
   `map.ladders` — mà Giữ VIP và Hộ tống CỐ Ý tắt cờ đó. Game đi ngang chỉ có MỘT làn, nên
   mỗi cái bục là một bức tường trọn vẹn: `TryStepUp` từ chối (cao hơn `_stepHeight` 0.18 cả
   chục lần) · không phải `Fortification` nên `UpdateBlockedPath` chẳng có gì để đập ·
   `StickmanAgent.TryStartClimb` chỉ leo khi ĐỊCH Ở TẦNG KHÁC, mà địch đứng bên kia bục thì
   cùng cao độ. Cả người chơi lẫn hai phe dí mặt vào đó tới hết trận, **không lỗi nào báo**.
   · Nay mỗi bục có **cầu thang CẢ HAI BÊN**, mượn thẳng `MapCastle.BuildStairs` (đã công
     khai) — cùng công thức khối thành giữa sân của màn cướp cờ, kèm `StickmanStairs` nên
     nhìn từ đỉnh vẫn đi xuyên được. Chép thêm một bản dựng bậc là hai nguồn sự thật, và bản
     nào quên `StickmanStairs` thì bục đó lại thành tường cụt.
   · **Chiều cao đo BẰNG SỐ BẬC** và kẹp trần `MaxPlatformHeight` 1.5 (10 bậc = 3.4 dốc mỗi
     bên): cao hơn thì hai dãy bậc dài hơn cả cái bục và bục sau bị loại vì giẫm lên bục trước.
   · **THANG TRÈO ĐÃ BỎ HẲN khỏi bục địa hình.** `StickmanClimbZone` là một TRỤC DỌC buộc
     phải nằm NGOÀI mép bục, nên trèo tới đỉnh buông ra là đứng giữa không khí rồi rơi — AI
     leo–rơi–leo mãi không thoát. Muốn giữ thang thì phải có SÀN NHÔ RA ở đỉnh (luật của
     `CreateCastleWall`); cầu thang rẻ hơn và đúng hơn.
   · `Layout` nay có **`ramps`** (dốc, ĐI ĐƯỢC — `SurfaceY` nội suy mặt nó, `SafeX` KHÔNG đá
     ai ra) tách khỏi **`reserved`** (vùng CẤM ĐỘNG — `SafeX` đá ra). Lẫn hai cái là cả một
     tuyến quân rơi trúng dốc bị dồn về đúng một toạ độ mép.
   ⚠ `MapBuildRules` luật 2 CHỈ soi `StickmanController` nên khối trần này lọt lưới suốt —
   nay có **luật 2b `CheckBlockingTerrain`** soi mọi `BoxCollider2D` đặc cao hơn 0.5 mà không
   thuộc người/công trình/cầu thang, và hẹp hơn 12 (rộng hơn thì đó là NỀN).

7d-vong. ⚠⚠⚠ **"CÓ CẦU THANG HAI BÊN" VẪN CHƯA ĐỦ — CẦU THANG MẶC ĐỊNH LÀ ĐI XUYÊN, VÀ KHÔNG
   AI BẢO NÓ ĐẶC LÊN** (`StickmanAgent.UpdateTerrainDetour`, thêm 2026-09-03 sau khi người
   dùng quay được cảnh AI đứng bám vách ở màn CƯỚP CỜ và màn CHIẾM ĐIỂM).

   Mục 7d-buc ngay trên chữa vế ĐỊA HÌNH (dựng thang hai bên) và coi như xong. Nó chưa xong:
   `StickmanStairs` mặc định **ĐI XUYÊN** (đúng, xem §3b), và thứ DUY NHẤT bật nó thành ĐẶC là
   `RequestStairsIfNeeded` — hàm chỉ lập kế hoạch khi **MỤC TIÊU Ở KHÁC CAO ĐỘ**
   (`focus = TargetAlive ? Target : Objective`). Nhưng suốt một trận đánh, mục tiêu của mỗi
   người lính là **một thằng lính khác đứng DƯỚI ĐẤT bên kia cái bục**: chênh cao bằng 0 ⇒
   không kế hoạch nào được lập ⇒ thang trong suốt ⇒ họ đi xuyên qua nó rồi **dí mặt vào vách**.

   Khối đá trần rơi vào ĐÚNG cái kẽ giữa BỐN cơ chế vượt chướng ngại, và cả bốn đều im lặng:

   | Cơ chế | Vì sao trượt |
   |---|---|
   | `TryStepUp` | khối cao hơn `_stepHeight` (0.18) cả chục lần |
   | `UpdateBlockedPath` | `ProbeObstacle` chỉ nhận `StickmanController` — khối đá không có máu nên KHÔNG phải công trình; nhánh cứu hộ `FindStairsOver` nằm bên trong đó nên cũng không bao giờ chạy |
   | `TryStartClimb` | đòi `StickmanClimbZone` — bục địa hình không có thang dây |
   | `RequestStairsIfNeeded` | chỉ chạy khi đích ở KHÁC CAO ĐỘ (xem trên) |

   Và `UpdateDeadlockBreaker` chỉ làm nó TỆ HƠN: "xông liều" + "chốt hướng" đều là dí vào vách
   mạnh hơn. Đó là hai tấm ảnh người dùng gửi — một đám lính chồng lên nhau ở chân cầu thang.

   Nay `UpdateTerrainDetour` hỏi đúng câu còn thiếu: **"ngay bây giờ tôi có đang bị chặn không,
   và cạnh đây có cái thang nào trèo qua được không"** — rồi CAM KẾT đường leo bằng đúng
   `_climbRouteStairs` / `ClimbRouteCommit` mà `UpdateBlockedPath` vẫn dùng cho tường thành.
   Không state mới, không behavior mới.
   · **Đo bằng `TravelSpeed`, không đo `Velocity`** — dí vào tường thì vận tốc vừa ghi vẫn báo
     đang chạy (cùng phép đo của van gỡ kẹt).
   · **Gọi RIÊNG, không nhét vào `UpdateBlockedPath`**: hàm đó thoát sớm khi
     `Profile.breakObstacles` tắt (ninja CỐ Ý không phá cửa) — mà không phá cửa thì lại càng
     cần biết đường vòng.
   · ⚠ **`ProbeTerrainWall` phải LOẠI BẬC THANG** (`BelongsToStairs`), không thì đứng ở chân
     thang là frame nào cũng "bị chặn" và cái thang tự nhận mình làm đường vòng qua CHÍNH NÓ
     (§5c). Loại luôn **sàn một chiều** (`usedByEffector` — nó không chặn ai đi ngang, mà tia
     raycast thì không biết điều đó) và **mọi thứ có `StickmanController`** (việc của
     `UpdateBlockedPath`).
   · ⚠⚠ **LÊN TỚI NƠI THÌ PHẢI BUÔNG ĐƯỜNG.** `RequestStairsIfNeeded` bản cũ vẫn
     `MoveTowardsX(LowEndX)` sau khi đã leo xong, tức lôi người vừa đặt chân lên mặt thềm
     QUAY NGƯỢC XUỐNG chân thang. Vô hại khi cả map có một cái thang; ở map nhiều tầng thì
     lúc nào cũng có một cam kết mới và họ đi lên đi xuống mãi. Nay buông khi
     `feet.y >= HighY − 0.25`, và **GIA HẠN cam kết khi đang đứng trên bậc** (một dãy 16 bậc
     dài hơn 2.5s — hết hạn giữa chừng là thang trả về "xuyên" ngay dưới chân và người đang
     leo RƠI THẲNG xuống đất).

7d-san. ⚠⚠ **CÁCH CHẮC CHẮN NHẤT ĐỂ KHÔNG BAO GIỜ KẸT: ĐỪNG ĐẶT KHỐI ĐẶC NÀO VÀO LÀN ĐI.**
   `StickmanFortBuilder.CreateTerrace` dựng một TẦNG bằng **sàn một chiều**
   (`PlatformEffector2D`) thay vì khối đá đặc. Ba vế cùng lúc:
   · đi ngang BÊN DƯỚI thoải mái ⇒ làn đất không bao giờ bị bịt ⇒ **không có chỗ nào để kẹt**;
   · `ShouldGuardEdge` cố ý không chặn mép sàn một chiều ⇒ lên rồi bước ra là RƠI, không phải
     "lên được mà không xuống được";
   · `DropThroughPlatform` cho cả người chơi lẫn AI TỤT XUỐNG ở bất kỳ đâu ⇒ mỗi cái thềm tự
     nó là một lối thoát VÀ một đường tấn công.
   Lối LÊN thì gọi `CreateStairs` riêng — "thềm này có mấy đường lên, ở đâu" là quyết định
   THIẾT KẾ MÀN, không phải thuộc tính của cái thềm.
   ⚠ Cách tự kiểm một scene nhiều tầng: đếm collider trong file `.unity`. Số `BoxCollider2D`
   phải bằng `số bậc thang + số thềm + 1 (mặt đất)`, và số `m_UsedByEffector: 1` phải bằng số
   thềm. Dư một cái là có một khối đặc lọt vào làn — tức có một chỗ để kẹt.

7d-sinh. ⚠⚠⚠ **DÃY BẬC CHIẾM MỘT KHOẢNG DÀI DƯỚI ĐẤT — ĐỪNG SINH QUÂN VÀO ĐÓ.**
   (dính ngay lần đầu dựng sân hai làn, 2026-09-03; người dùng báo *"map nhiều tầng thì đi bị
   kẹt, AI cũng kẹt không di chuyển được"*.)

   Cầu thang trông như một cái dốc mảnh, nhưng nó là **một chuỗi khối ĐẶC chạy từ mặt đất lên
   tới mặt thềm**, dài `chiềuCao ÷ 0.15 × 0.34` — thềm cao 1.5 ⇒ **3.40 đơn vị**. Và bậc gần
   đầu cao thì **CAO HƠN cả điểm sinh quân**: `SpawnNpcShared` đặt người ở `GroundTop + 1`,
   trong khi bậc thứ 8–10 đã ở `GroundTop + 1.2…1.5`. Ai bị đặt vào khúc đó **ra lò CHÔN
   TRONG KHỐI ĐÁ**.

   ⚠ Và họ **không tự thoát được**: `StickmanLocomotion.FixedUpdate` GHI THẲNG
   `linearVelocity` mỗi nhịp vật lý, nên nó triệt tiêu luôn xung lực đẩy-ra của Box2D. Đứng
   chôn chân tới hết trận — cả người chơi lẫn AI, **không lỗi nào báo**. Đo được ở bản đầu:
   `Demo_23_CTF` 1 lính mỗi phe chôn trong đá + 2 lính nữa ra lò lơ lửng giữa dãy bậc;
   `Demo_13_Capture` y hệt.

   ⚠ **HỆ MAP SINH KHÔNG DÍNH — và lý do nó không dính chính là cách chữa đúng.**
   `MapScenery.Layout.AddRamp` khai dãy bậc là **DỐC ĐI ĐƯỢC**, `SurfaceY` nội suy mặt nó, nên
   quân rơi xuống ĐÚNG mặt bậc; `SafeX` còn cố ý KHÔNG đá ai ra khỏi `ramps`. Scene DỰNG TAY
   thì đặt quân ở một cao độ CỐ ĐỊNH nên phải TỰ TRÁNH: **giữ chỗ sinh quân (và điểm hồi sinh,
   nhà chính, giáo sĩ) ngoài khoảng `[highX + direction × run … highX]` của mọi cầu thang.**

   ⚠ **ĐO ĐƯỢC, ĐỪNG TIN MẮT**: `StickmanSceneUtils.ValidateSpawnsClearOfStairs` (chạy trong
   `ValidateScene`, tức MỌI builder đều đi qua) réo hai mức — ĐỎ cho "sinh ra trong khối bậc"
   (chắc chắn kẹt), VÀNG cho "ra lò đứng trên bậc" (chạy được nhưng đội hình xiêu vẹo).
   Thêm scene nhiều tầng mới thì nhìn Console sau khi dựng, đừng nhìn Scene view — ở cỡ nhìn
   chuẩn thì một anh lính lún 0.35 vào đá trông y hệt một anh lính đứng trên bậc.

   ⚠⚠ **NAY CÒN TỰ NÉ, KHÔNG CHỜ NGƯỜI DỰNG MAP NHỚ** (2026-09-07).
   `StickmanSceneUtils.SpawnXClearOfStairs` gọi từ `SpawnPlayer`/`SpawnNpc` — nút thắt mà MỌI
   scene dựng tay đi qua. Lý do phải tự động: con số x là **quyết định THIẾT KẾ**
   (`9f + i * 2.3f` — hàng lính canh con tin) còn dãy bậc **mọc ra từ chiều cao sàn**, nên chỉ
   cần nhích cái sàn cao 1 đơn vị là cả hàng lại chôn chân; bắt người dựng map nhớ một luật
   hình học là bắt nhớ lại sau mỗi lần chỉnh sàn. Cùng khuôn với `CreateStairs` tự trung hoà
   `lossyScale` của cha: chữa ở hàm CHUNG thì builder viết sau này không dính lại.

   Cách nó dời: ra **mép GẦN NHẤT của CẢ dãy bậc** (giữ thiết kế màn nhiều nhất có thể), lùi
   thêm từng nấc 0.45 khi chỗ đó đã có người; mép này bí thì thử mép kia; **cả hai bí thì GIỮ
   NGUYÊN** — dời vào trong tường là đổi một lỗi lấy một lỗi, cứ để lưới bắt ở trên réo đỏ.
   Mỗi lần dời có một dòng VÀNG ghi cả x cũ lẫn x mới, để người dựng map biết mà chỉnh lại số
   gốc nếu vị trí đó có ý nghĩa chiến thuật.

   ⚠ **SÀN MỘT CHIỀU KHÔNG TÍNH LÀ VẬT CẢN** khi dò chỗ trống (`PlatformEffector2D`: thềm, nóc
   container, sàn cao). Cả lý do chúng là sàn một chiều là để **đi ngang bên dưới thoải mái**
   (`StickmanFortBuilder.CreateTerrace`) — coi chúng là tường thì hàm kết luận "cả gầm sàn cao
   đều kín" rồi bỏ cuộc, đúng chỗ rộng rãi nhất còn lại quanh dãy bậc.

   ⚠ Chỉ chữa được scene nào **dựng địa hình TRƯỚC rồi mới đặt quân** (thứ tự chuẩn của mọi
   builder hiện có). Scene nào đặt quân trước thì hàm không thấy dãy bậc nào và im lặng —
   lưới bắt cuối lượt dựng vẫn còn đó, nên không có đường nào lọt trong im lặng.

7e-studio. ⚠⚠ **THAY ĐỊA HÌNH DƯỚI MỘT MÀN ĐÃ BAKE — "CÓ SCRIPT KHÔNG" LÀ CÂU HỎI SAI.**
   `MapStudio.ApplyTerrain` dọn cảnh cũ rồi dựng địa hình của map đã chọn ngay trong màn đang
   chơi. Bản cũ nhận diện "cảnh" bằng **"cây object này không có `MonoBehaviour` nào"** — mà
   phần lớn CỘT MỐC của dự án là object RỖNG hoặc chỉ có mỗi `SpriteRenderer`. Ba thứ hỏng
   cùng lúc, cả ba trong im lặng (mọi chỗ dùng đều null-check tử tế rồi rơi về mặc định):

   | Bị dọn nhầm | Hậu quả |
   |---|---|
   | `StickmanDemoBuilder.RespawnAnchor` (root RỖNG) | `RespawnDirector.point` = null → *"sinh ra nhân vật không đúng vị trí"* |
   | `StickmanDemoBuilder.CreateBase` (chỉ `SpriteRenderer`) | `TeamCommander._homeBase/_enemyBase` = null → `ComputeForward` phải ĐOÁN, `MakeRoot` lấy `homeX` = vị trí object chỉ huy → *"AI điều phối không hoạt động, không điều phối nhân vật tấn công hay thực hiện mục tiêu"* |
   | waypoint tuần tra · điểm tập kết · mốc mục tiêu | lính về một chỗ vô nghĩa |

   Câu hỏi đúng là **"có ai đang TRỎ VÀO nó không"** (`CollectProtectedRoots`): giữ khi có
   `MonoBehaviour` · **hoặc KHÔNG VẼ GÌ CẢ** (không `Renderer` nào trong cây — cảnh thì theo
   định nghĩa phải nhìn thấy được, object không vẽ gì luôn là cột mốc) · **hoặc có component
   nào đó trong scene đang giữ tham chiếu** (quét reflection một lần; `SerializedObject` là
   API Editor nên không dùng được lúc chạy). ⚠ Kê TÊN object thì builder mới đặt tên khác là
   dính lại y hệt.
   ⚠ **MẶT ĐẤT CŨ LUÔN PHẢI ĐI, không có ngoại lệ** (`IsPlainGround`, nhận bằng tag `Ground`):
   đó là mặt trái của luật "có ai trỏ vào thì giữ" — chỉ cần một component cầm tham chiếu tới
   `Ground` là ta có HAI mặt đất chồng nhau.

   Ba vế còn lại của cùng một lỗi:
   · **ĐỊA HÌNH MỚI PHẢI CHỪA CHỖ** (`CollectReservedZones` → `MapScenery.Layout.reserved`):
     tường/tháp/lồng/cầu thang/điểm hồi sinh của màn cũ **không dựng lại được**. Đào một khe
     vực dưới chân dãy bậc, hay mọc một cái bục đè lên nó, là cầu thang đó thành bẫy kẹt —
     đúng triệu chứng *"cầu thang đứng và cầu thang xéo đều làm kẹt nhân vật"*.
   · **NỚI ĐẤT, ĐỪNG DỜI CỘT MỐC** (`MeasureContentHalfWidth` → `Build(minHalfWidth:)`): map
     mới có thể HẸP HƠN màn đang chơi, và lúc đó điểm hồi sinh / tháp / nhà chính nằm NGOÀI
     mặt đất. Kẹp NGƯỜI vào trong map thì mốc vẫn ở ngoài; nới mặt đất thì không phải dời một
     cột mốc nào — mà dời cột mốc mới đúng là thứ phá bố cục màn.
   · **CHỈ HẠ NGƯỜI XUỐNG ĐẤT, ĐỪNG ĐỘNG VÀO CÔNG TRÌNH** (`DropPeopleToGround`): bản cũ quét
     cả `StickmanController`, mà tường/cổng/rào (`CreateSolidFort`) đặt gốc transform ở TÂM
     khối → "hạ xuống mặt đất" là chôn đúng NỬA CHIỀU CAO xuống lòng đất, và `SafeX` còn xê
     ngang cả cái tháp. Công trình đã đứng đúng trên `GroundTop` từ lúc bake, địa hình mới
     cũng lấy đúng mốc đó — để yên là đúng.
   ⚠ Đặt kỵ sĩ theo BÀN CHÂN: trừ `StickmanLocomotion.GroundOffset` khi đổi map; ngựa
   là con của `Sprite` nên không được đặt root thẳng vào cao độ mặt đất.

8. **ĐỘ KHÓ TĂNG DẦN THEO THỜI GIAN** (`EscalationSettings` trong `MapDefinition` +
   `MapEscalation`): mở màn DỄ rồi mỗi `stepTime` giây lên một bậc. **Ba trục, KHÔNG có trục
   máu/damage** — quân số (`EnemyWaveSpawner.SetPacing`) · cái đầu (`SetSmartsLevel`) · đồ
   nghề (`WeaponBase.SetTier`); cho địch thêm máu là người chơi CẢM THẤY BỊ ĂN GIAN, đúng luật
   đã đặt ở `GameDifficulty`/`AIDifficultyDirector`. Chơi lại là về bậc 0 (map dựng lại =
   component mới). Bảng số theo KIỂU NHIỆM VỤ nằm ở `StickmanMapSystemBuilder.EscalationFor` —
   sửa BẢNG LUẬT rồi bấm `Maps > 1`, đừng sửa tay asset.
   ⚠ **Ramp CHỈ nâng phe địch** — đây là bài ĐO SỨC CHỊU, số đáng giá là "trụ tới bậc mấy".
   ⚠ **Viện binh do ramp dựng PHẢI CÓ ĐÁY** (`boundWaves` → kẹp bằng `maxStep`): luật "diệt
   sạch địch" hỏi `EnemyWaveSpawner.HasPendingWaves`, sóng vô hạn là map giao chiến KHÔNG BAO
   GIỜ thắng được và không lỗi nào báo. Sóng vốn của nhiệm vụ (thủ trại, sinh tồn) thì để
   nguyên — luật thắng của mấy mode đó viết ra khi đã biết có sóng.
   ⚠ **Áp lại theo nhịp 2s**, không áp một lần lúc lên bậc: viện binh sinh ra giữa hai bậc
   mang cấp mặc định của prefab — bậc 5 mà quân mới ra vẫn đánh như lính mới (cùng lý do
   `AIPlaybookBinder` có `reapplyInterval`).
   ⚠ **Trận xong là NGỪNG LEO** (`MatchDirector.MatchEnded`), không thì viện binh vẫn ùn ra
   trong lúc người chơi đọc bảng kết quả và con số "bậc cao nhất" bị đội lên.

10. **AI PHẢI ĐÁNH ĐỂ THẮNG CÁI MAP ĐÓ — ba chỗ, đã dính cả ba** (triệu chứng: hai phe hành
   quân ra giữa sân đánh nhau, còn xe hàng / điểm chiếm / cái nhà thì không ai ngó tới;
   không lỗi nào báo):
   · **CỘT MỐC CỦA CÂY CHỈ HUY LÀ CON SỐ CHỤP LÚC `Start`.** `CommandNode.ApplyToAgent` ghi đè
   behavior MỌI lính mỗi nhịp theo cột mốc ấy, nên lệnh đúng-mục-tiêu gán lúc spawn
   (`GuardTarget(xe hàng)`) chỉ sống vài frame. Và `TeamCommander.BuildHierarchy` đọc hai mốc
   ra hai CON SỐ đúng một lần → mục tiêu BIẾT ĐI không kéo được quân theo (map hộ tống hỏng
   hoàn toàn). Nay `CommandNode.SetBattlefield` + `TeamCommander.Update` đọc lại mốc mỗi 0.3s,
   và `MapAssembler` cho cây chỉ huy cầm ĐÚNG mục tiêu nhiệm vụ làm mốc
   (`HomeAnchorA = guardTargetA ?? baseA`, `EnemyAnchorA = attackTargetA ?? baseB`, và đối
   xứng cho phe B) — bốn dòng đó là chỗ nối duy nhất giữa LUẬT THẮNG và CHỖ TƯỚNG ĐIỀU QUÂN TỚI.
   · **HỌC THUYẾT CHỈ BIẾT ĐẾM QUÂN** (`PowerRatio`), không biết đồng hồ sắp hết / xe sắp về
   đích / đang thua điểm / địch đã vào sân nhà. `MapMissionAI` (cùng object với `MatchDirector`)
   trả lời bốn câu đó bằng cách **phát LỆNH** qua đúng API của nút HUD (`Issue`/`CommandHold`/
   `CommandAuto`) — không đụng từng lính, không thêm state.
   ⚠ Phải có QUÁN TÍNH (`_minHold` 6s): đây là luật đọc tình hình rồi ĐỔI tình hình, đúng
   khuôn §5c — thiếu là cả phe tiến-lùi tại chỗ. ⚠ Vai `Commander` thì bỏ qua phe người chơi.
   ⚠ Trận xong là ngừng phát lệnh.
   · **CHIẾM ĐIỂM**: `ComputeLineAnchor` chỉ ngó `CapturePoint` ở thế TẤN CÔNG → phe bị đẩy về
   thế thủ ngồi ôm căn cứ = chờ thua. Nay map chiếm điểm dùng học thuyết TẤN CÔNG cho CẢ HAI
   phe, và đạo quân không có tướng nhận đích là ĐIỂM GẦN TUYẾN MÌNH NHẤT.
   Kèm: viện binh **nhập ngũ** vào cây chỉ huy (`EnemyWaveSpawner.EnlistInCommand`) thay vì
   từng đứa lẻ chạy vào chỗ chết; `MapLibrary.defaultProfile` (trước BỎ TRỐNG = null) nay là
   `AIProfile_Map_Field` với `visionRange` 9 + `spotShareRadius` 8; và bảng mục tiêu hiện luôn
   **AI đang nghĩ gì** (`[TA] …` / `[ĐỊCH] …`) — không có dòng đó thì "AI vô tri" mãi là cảm
   giác chứ không tra được.

9. **SỐ LIỆU MỖI VÁN → CSV** (`MatchStats`): `matches.csv` một dòng mỗi ván (map · nhiệm vụ ·
   seed · thắng/thua · giây · bậc khó cao nhất · quân ra sân · tổn thất hai phe · người chơi
   hạ/gục) + `timeline.csv` một dòng mỗi 5 giây (quân sống hai phe + bậc khó) — cái vẽ ra
   ĐƯỜNG CONG của trận. Đọc ngay trong sân bằng nút **«Số liệu»** của `MapArena` và bảng kết
   quả cuối trận; vòng lặp thiết kế level là *chỉnh một số → chơi lại → so*, mở Excel giữa
   chừng là đứt vòng lặp.
   · **Đo bằng sự kiện có sẵn** (`TeamMember.AnyDied` + `MatchDirector.MatchEnded`), KHÔNG
   thêm dòng đếm nào vào `TakeDamage`.
   · ⚠ **Chỉ đếm NGƯỜI** — tường/tháp cũng có `TeamMember` và cũng chết được.
   · ⚠ **Ván bỏ dở cũng ghi** ("map này chơi 20 giây là chán") — chốt sổ ở `OnDisable`.
   · **Scene đã bake không phải bấm tool nào**: `MatchTelemetryBootstrap` tự gắn lúc nạp scene
   (khuôn `PlayerRespawnBootstrap`), và **thoát sớm khi scene có `MapArena`/`MapPopulator`** —
   sân map tự gắn bộ ghi riêng, hai bộ cùng chạy là mỗi ván ghi HAI dòng.


### BẢY KIỂU CHƠI MỚI (2026-09-07) — *"xưởng map không đủ chế độ chơi"*

Bảy kiểu chơi này trước đó CHỈ tồn tại dưới dạng scene dựng tay, nên hệ map không có kho map
cho chúng và Xưởng map mở ra trong màn đó lại hiện kho của một chế độ khác:

| Kiểu | Đối chiếu màn tay | Thắng bằng | Bộ đo mới |
|---|---|---|---|
| Vây thành (`SiegeStarve`) | `SiegeCamp` · Demo_28 | bên vây: bỏ đói / phá thành / diệt sạch — bên thủ: hết giờ | `MapSupplyLine` + `MatchGoal.StarveEnemy` |
| Cứu tù binh (`RescuePrisoners`) | `PrisonerRescue` · Demo_32 | đưa đủ N tù binh về điểm tập kết | `MapPrisonCamp` + `MatchGoal.RescueCount` |
| Đấu tướng (`ChampionDuel`) | `ChampionDuel` · Demo_27 | DIỆT SẠCH (cuộc đấu chỉ quyết sĩ khí) | `MapDuelRing`, vai `Champion` |
| Loạn chiến (`FreeForAll`) | `LastStandingMode` · Demo_16 | còn lại một phe | `MapFreeForAll` + `MatchGoal.LastStanding` |
| Kinh tế (`WarEconomy`) | `WarCamp` · Demo_20 | phá nhà chính địch | `MapWarEconomy` (kho + mỏ + thợ + cửa quân) |
| Zombie·giữ làng (`ZombieHorde`) | Genre_Medieval_ZombieDefense | trụ hết giờ | `MissionContext.hordeTeam` + `MapLibrary.hordePrefab` |
| Zombie·áp tải (`ZombieConvoy`) | Genre_Medieval_ZombieSupply | đưa xe tới đích | như trên |

Luật rút ra, áp cho MỌI kiểu thêm sau này:

- **Bộ đo nằm ở module Map, KHÔNG mượn trọng tài của màn tay.** `SiegeCamp`/`PrisonerRescue`/
  `ChampionDuel` là `MatchModeBase` — chúng TỰ chốt thắng thua, đặt vào map là có hai trọng
  tài. Khuôn đúng đã có sẵn từ ba kiểu 2026-09-05: `MapFlag` · `MapFrontLine` · `MapVillage`.
- **Vế thắng KHÔNG mang id phe thì phải xử riêng.** `LastStanding` là vế duy nhất như vậy (loạn
  chiến mỗi người một phe, không kê trước id được) — `MatchDirector.TryLastStandingVerdict`.
- **Kiểu chơi cần AI nghe lệnh riêng thì TẮT cây chỉ huy** (`MapBlueprint.Apply`: đấu tướng,
  loạn chiến). `CommandNode.ApplyToAgent` ghi đè behavior mỗi nhịp, nên "đứng xem" hay "mỗi
  người một phe" bị xoá sạch trong vài frame mà không lỗi nào báo.
- **Phe là BẦY thì đổi PREFAB, không đổi luật**: `hordeTeam` + `hordePrefab` (GameObject, không
  phải kiểu `ZombieUnit` — Map(6) nằm dưới Zombie(7)). `ZombieUnit` nay khai `INoAutoDress` để
  `CivilizationTeamAssigner.Dress` không khoác nón sắt cho zombie sinh giữa trận.
- **Chạy lại tool sau khi kéo code**: `Tools > Stickman > Nâng cao/Maps > 1` (sinh 21 map mẫu
  mới + nối `hordePrefab`), rồi `Maps > 2` nếu muốn dựng lại ba sân map.

### MAP BA TẦNG: MÁI · MẶT ĐẤT · CỐNG NGẦM (2026-09-07)

`MapDefinition.threeLevels`. Ba tầng đều ĐI BỘ ĐƯỢC và nối bằng **cầu thang thật**, nên
`LaneNav` — đồ thị dựng từ collider CÓ THẬT trong scene — tự tìm được đường giữa các tầng.
Đây không phải "mấy cái ground chồng lên nhau": mái là `MapLotKind.HighRoad` (def `HighRoad`
còn có cả tầng 3), cống là `MapLotKind.Underpass` (sàn đặc tag `Ground`, nóc liền đất, hai dãy
bậc ở hai miệng).

⚠⚠ **BỘ PHẬN CÓ ĐỦ MÀ KHÔNG BAO GIỜ RA MAP.** Cả hai lô đã có từ 2026-09-06 nhưng nằm trong
`Wishlist` = phần LẤP: chỉ được đặt khi còn khoảng trống ≥ bề rộng lô + hai lề, mà lúc đó
trại/đích/vùng chiếm/thềm/ụ che đã ăn gần hết map. Người dùng báo *"tôi chưa thấy chế độ 3 tầng
trong game"* — đúng: nó gần như không bao giờ xuất hiện. Chữa bằng `MapKitPlanner.ForceTiers`
(lô BẮT BUỘC, đặt sau lô nhiệm vụ và TRƯỚC phần lấp) + `MapKit.Validate` báo thiếu tầng nào.

- Bật: Xưởng map → *Tạo map mới* → «BA TẦNG: mái · đất · cống ngầm»; hoặc ba map mẫu
  `Med_ThreeTier` / `Mod_ThreeTier` / `Fan_ThreeTier`; Loạn chiến tự bật khi nửa rộng ≥ 24.
- Cần nửa rộng ≥ 24. Map ≥ 32 thì đặt HAI miệng cống (hai lối vòng).
- Cống đặt LỆCH khỏi mái: miệng cống trùng chân cầu thang đường trên thì hai dãy bậc chồng
  nhau và map đọc ra là một mớ bậc thang chứ không phải ba tầng.

### KHÔNG KHÍ CỦA MAP (2026-09-05)

Chân trời (hình + màu) và thời tiết áp **lúc nạp map**, không lúc bake scene — một sân map
chơi hàng chục map khác nhau.

```
MapScenery.Build → ApplyCamera(theme) → ApplyAtmosphere(theme, map)
     ├─ SkyBackdrop.ApplyHorizon(shape, hillFar, hillNear)
     └─ WeatherAmbience.Apply(...)
```

**Ba tầng, tầng sau đè tầng trước:**

| Tầng | Ở đâu | Nghĩa |
|---|---|---|
| 1 | `MapAtmosphere.For(mission, genre)` | mặc định CÓ CÁ TÍNH cho cả 10 nhiệm vụ |
| 2 | `MapTheme.weather` / `.motes` | thể loại khai gì thì đè — `None` = "không có ý kiến" |
| 3 | `MapDefinition.overrideWeather` | người thiết kế màn nói lời cuối (tab Xưởng map) |

⚠ Tầng 2 chỉ đè khi **THẬT SỰ khai** (khác `None`). Coi `None` là "trời quang" thì 63 asset
đang để mặc định sẽ xoá sạch cá tính của bảng tra, và không ai hiểu vì sao.

Bảng tra: cướp làng → **tàn lửa + bụi** · công trại → **tro + bụi** · thủ trại → tro nhẹ ·
bảo vệ VIP → **lá rơi + sương** · hộ tống → lá nhẹ + bụi · sinh tồn → **đom đóm** · kéo co →
bụi dày · còn lại → chỉ bụi lửng. Thời kỳ phủ quyết MỘT LỚP (`ForGenre`): hiện đại đổi lá rơi
→ tro (phố bê tông không có lá rụng); fantasy đổi bụi → đom đóm và tro → tàn lửa.

⚠ Xưởng map in **hàng "→ đang chạy: …"** kể cả khi ô đè đang tắt — không có nó thì người thiết
kế không biết map mình đang có trời gì, và bảng chọn thời tiết chỉ nói về một trường không
được đọc tới.

## Rải công trình lắp ghép — LÊN KẾ HOẠCH TRƯỚC RỒI MỚI HỎI CHỖ (2026-09-06)

`MapScenery.ScatterKitDeco`. Tỉ lệ: cây 46 % · đá 13 % · phế tích 7 % · ruộng 10 % ·
**NHÀ 18 %** · **MỎ 6 %**. Nhà và mỏ chỉ có collider TRIGGER — `LaneNav` và đường đi của AI
không đổi một ly.

⚠ **Bản cũ hỏi một ô CỐ ĐỊNH ±0.8 quanh `x` rồi mới dựng.** Với cây thì tạm được; với một căn
nhà lính rộng 3.8 (kể cả đồ đặt quanh nhà) thì ô ấy NÓI DỐI: nhà vẫn "vừa" và mọc đè lên chân
cầu thang, hoặc thò một nửa ra miệng vực. Nay: `Plan()` trước (không tốn GameObject nào mà biết
đúng `FootprintMinX/MaxX`) → hỏi `IsOverPit` ở cả hai mép + `IsReserved` theo chân đế thật →
dựng → **`Reserve` lại** để món kế tiếp không lồng vào món này.

`MapScenery.VillageRole(rng)`: Home 34 % · Granary 16 % · Market 14 % · Stable 14 % · Smith 12 %
· Shrine 10 %.

⚠ **KHÔNG có `Barracks`** — nhà lính thuộc về DOANH TRẠI; mọc hoang giữa đồng là nói dối người
chơi về chỗ địch đóng quân.
⚠ **KHÔNG có `Watch`** — trạm gác mang `GarrisonPost`, tức một chỗ AI sẽ leo lên và ĐỨNG LẠI
BẮN. Rải nó ngẫu nhiên khắp map là đổi thế trận mà không ai chọn điều đó. Hai vai ấy đặt TAY ở
Xưởng map (tab «Công trình» → núm «Vai»), hoặc qua lô `Watchtower`.

## ⚠ LUẬT 1b-BIS — ĐẦU CAO CỦA THANG PHẢI CÓ SÀN ĐỂ BƯỚC SANG

`MapBuildRules.ProbeLanding`, gọi trong `CheckStairsMeetTheirSurface`.

Phép đo cũ (`bestMismatch ≤ MaxStepRise`) chỉ hỏi **"mặt đứng gần đó có ngang tầm không"**. Nó
bỏ lọt đúng cái ca người chơi kêu nhiều nhất: thang dựng tới đúng cao độ nhưng **bên kia đỉnh
không có gì** — sàn hẹp hơn thân, sàn lệch tâm, hoặc mảnh nối không được dựng. Leo tới bậc chót
là bước vào không khí và rơi thẳng xuống đất, mà mọi phép đo cũ đều xanh vì mặt đứng CÓ tồn
tại... ở chỗ khác.

Đo bằng HÌNH THẬT: thò một ô `StepRun×0.9 × 0.20` ngay bên kia bậc chót, ngang tầm mặt bậc; có
collider ĐẶC nào (kể cả sàn một chiều — `usedByEffector` không phải trigger) chạm ô đó là có chỗ
đặt chân. KHÔNG có gì mới báo.

⚠ **Phải `Physics2D.SyncTransforms()` trước vòng lặp.** Collider vừa tạo trong cùng khung hình
chưa vào cây truy vấn của Physics2D — thiếu bước đó là **cả map báo thiếu sàn**, tức một bảng
báo động giả, thứ giết cái bảng nhanh hơn là không có bảng nào.

⚠ Ngưỡng cố ý LỎNG (chỉ báo khi bên kia rỗng hoàn toàn): hụt vài xăng-ti thì thân người bắc qua
được, réo lên là báo oan. Bản đo CHẶT nằm ở pha kế hoạch — `StructurePlan.Validate()`, xem
`StructureKit.md`.

## ⚠ LUẬT 1b-QUATER — THANG TREO: KHÔNG CÓ LÀN DƯỚI THÌ KHÔNG ĐƯỢC CHO ĐI XUYÊN (2026-09-07)

`StickmanStairs.HasLowLane`. Người dùng báo *"đi lên cầu thang tới chỗ này thì rớt xuống"*
(`Demo_13_Capture`, chỗ thềm cánh gặp thang lên tháp giữa).

Đo trên scene: mặt thềm cánh `MatSan` kết thúc ở **x −6.40**, còn bậc đầu tiên của thang lên
tháp bắt đầu ở **−6.38** và **đáy bậc nằm ở đúng cao độ mặt thềm** — tức dãy bậc TREO trên
khoảng không, dưới nó là 1.5 đơn vị rơi thẳng xuống đất.

Ghép với thiết kế *"ĐI XUYÊN là mặc định, LEO phải ĐÒI"* của `StickmanStairs`: người đứng ở
tầng thấp mà không đòi leo thì cả dãy bậc trong suốt với họ ⇒ đi tới đó là **đi vào khoảng
không**. Ba luật cũ đều không cứu được: `IsOnSurface` (chưa đứng trên bậc), `IsAtHighEntrance`
và `IsOnUpperDeck` (đều đòi bàn chân đã ở tầng trên). Không lỗi nào báo.

**Luật:** cầu thang chỉ được cho đi xuyên khi **BÊN DƯỚI NÓ CÓ LÀN ĐI THẬT**. `HasLowLane` đo
một lần bằng 6 tia dò dọc khung bao: mỗi điểm phải có sàn, và chênh cao giữa hai điểm liền
nhau ≤ 0.6 (dốc đồi thì đi được, VÁCH thì không). Không có làn ⇒ thang **ĐẶC** với người đang
ở tầng thấp; lập luận *"ép XUYÊN không bao giờ đẻ ra bế tắc"* vẫn đúng vì không có làn thì
cũng không có chỗ nào để đi tiếp — nó chỉ đổi một cú rơi thành một cú bước lên bậc.

⚠ **ĐỪNG đo bằng "có sàn trong 0.6 dưới chân thang"**: map có ĐỒI, thang dựng trên sườn thì
mặt đất dưới nó tụt cả mét — hỏi kiểu đó là mọi cầu thang trên đồi bị chấm nhầm thành thang
treo rồi đặc lại, tức dựng lại đúng cái bế tắc mà thiết kế kia sinh ra để diệt.

⚠ **Vế THỨ HAI, ở phía dựng map:** mép sàn tầng dưới phải CHẠY QUA chân thang, không được
dừng trước nó. `StickmanModeBuilder` nay tính mép thềm từ chính hình học cầu thang
(`CapWingInnerX = 4 + StairRunFor(1.05) − 0.4`) thay vì gõ tay ±6.4 — đổi số bậc hay chiều cao
tháp thì mép thềm tự chạy theo. Sửa scene phải **dựng lại màn** (`Tools > Stickman > Nâng cao >
Game Modes > 6. Capture Points`); còn vế `HasLowLane` thì có tác dụng ngay với scene đã bake.

## Rải V6 · thang trèo cũng được đo (2026-09-06)

Tỉ lệ rải `ScatterKitDeco`: cây 34 · đá 12 · phế tích 6 · ruộng 9 · nhà 18 · mỏ 6 · chợ 4 ·
cối xay 3 · giàn giáo 4 · hành lang vòm 4 (%). Giàn giáo và hành lang vòm CÓ sàn + thang/cầu
thang — chúng thêm làn trên, trụ/khung là trigger nên làn đất không đổi. Vẫn lập kế hoạch
trước → hỏi chân đế thật → dựng → giữ chỗ.

### ⚠ LUẬT 1b-TER — ĐỈNH THANG TRÈO CŨNG PHẢI CÓ CHỖ ĐẶT CHÂN

`MapBuildRules.CheckLaddersMeetTheirSurface`. Phép đo 1b/1b-bis chỉ soi `StickmanStairs`, mà
phần lớn lối lên trong game là THANG TRÈO (tháp, lô cốt, đình, trạm gác, giàn tời, dây leo,
thang công thành). Với mỗi `StickmanClimbZone`: dò hai ô hai bên đỉnh (`axis ± 0.34`, dải cao độ
`[đỉnh − 0.60, đỉnh + 0.12]`); **cả hai** rỗng mới báo.

⚠ **Đỉnh thang cao hơn mặt sàn quá `ClimbReleaseReach − 0.15` cũng là lỗi.**
`StickmanLocomotion.ClimbReleaseReach` (0.6) nay là hằng số công khai: locomotion chỉ cho thôi
leo khi chân đã lên tới `TopY − 0.6`. Thang nhô 0.6 trên sàn là cửa sổ đóng ngay mép sàn; AI
luôn dừng leo thấp hơn mặt sàn một chút → bị từ chối nhả → treo → tưởng kẹt → tụt xuống leo
lại. Không có gì rơi mà vẫn là "leo lên rồi rơi". `FortBuild.LadderHeight` dùng +0.35 là đúng.

### ⚠ Sàn gỗ tường thành: cửa lên không được rộng hơn phần sàn còn lại

`MapCastle.BuildCastleWall`: lối đi đặc chừa `HoardingHatch` (1.0) ở mép ngoài cho người trèo
thang công thành chui lên qua sàn gỗ một chiều. Chỗ chừa chỉ an toàn khi sàn gỗ còn phủ hết:
`hoardingOverhang + 0.6 ≥ 1.0`. `FortPieceSet.hoardingOverhang` là số người dùng chỉnh được —
hạ dưới 0.4 là mở một dải chỉ còn NÓC TƯỜNG, mà nóc tường thuộc `Fortification` nên phe chủ đi
xuyên được: quân mình đi trên tường mình rồi rơi lọt. Nay kẹp `hatch = min(1.0, overhang + 0.6)`.

## ⚠⚠ KHO MAP GIỮ MỌI MAP TRÊN ĐĨA (2026-09-11)

`StickmanMapSystemBuilder.BuildSystemSilent` từng gán `library.maps = BuildMaps()` — ghi đè sạch danh sách
bằng 89 map mẫu. Mỗi lần bấm «Hệ thống map» là **212 map mặc định** (`Saved/*_default`, thứ «FORCE dựng lại
default» sinh ra) và **128 map mặt đất** (`Map_Grd_*`, map mở màn của `Demo_70..73`) biến mất khỏi kho: file
vẫn nằm đó, F2 không liệt kê, `MapArena.FindByKey("Grd_…")` trả null nên sân mặt đất mở bằng map ngẫu nhiên.
Đo 2026-09-11: kho có 75 map, 0 mặc định, 0 mặt đất. Nay `MergeExistingMaps` giữ mọi `MapDefinition` còn dưới
`Assets/Settings/Maps` (file còn = map muốn có; `DeleteFromLibrary` xoá cả file), `_default` chèn lên đầu để
giữ nghĩa "map đầu tiên của kiểu chơi = mặc định" (`MapArena.IsDefaultMap`). Nút FORCE đúng thứ tự:
`Nâng cao › Maps › 10` (`StickmanMapRebuildBatch`).

## `MapDressing` — CẢNH CHO MỌI SCENE, KHÔNG CHỈ 3 SÂN MAP (2026-09-06)

Sân map (`MapArena`) chỉ có ở 3 scene: Demo_29/30/31. 51 scene còn lại — mọi chế độ chơi, mọi bài
demo, phòng thí nghiệm AI — chỉ có một dải đất phẳng và bầu trời trơn. Cùng một trò chơi mà hai
nửa trông như hai sản phẩm khác nhau.

`MapDressing` (tầng Map, gắn sẵn trong `StickmanDemoBuilder.NewScene` nên mọi scene đều có) **đắp
thêm** lên cái đã có: tường biên, núi khung, công trình rải, trời + đợt thời tiết theo seed.

### Ba luật của việc đắp thêm

1. **Không động vào thứ đang có** — không dời đất, không mọc đồi (thứ dựng tay đứng ở cao độ CỐ
   ĐỊNH; mọc một cái đồi dưới chân là chôn nó), không xoá gì.
2. **Giữ chỗ cho mọi thứ đã có** — mọi collider và sprite trong scene vào `layout.reserved` (chừa
   1.2 mỗi bên) trước khi rải. Thiếu bước này là một căn nhà rơi trúng chỗ lính xuất phát.
3. **Có `MapArena` thì đứng yên** — nó đã dựng đủ.

### ⚠ Mặt đất lấy từ dải đất RỘNG NHẤT, không phải cái CAO NHẤT

Nhiều thứ cũng mang tag `Ground`: mặt cầu, nóc hầm, sàn thềm, nóc lô cốt. Lấy `max` cao độ là mọi
thứ rải sau đứng ở cao độ của cái nóc cao nhất trong scene — cả rừng cây lơ lửng giữa trời, không
lỗi nào báo. Tường biên cũng mang tag `Ground` nhưng đứng ngoài mép nên bị loại theo tên.

⚠ **Đất ĐỒI thì mốc là mặt gốc, không phải đỉnh đồi** (2026-09-11): `TerrainGround` là MỘT PolygonCollider
phủ cả dải lượn nên `bounds.max.y` của nó là ĐỈNH ĐỒI CAO NHẤT — 7 scene có đồi (`Demo_20 · 52 · 55 · 61 ·
62 · 15 · 51`) đắp mọi thứ lơ lửng đúng bằng biên độ đồi. Nay `MeasureScene` lấy `TerrainGround.BaseY` và
nạp `layout.terrain = MapScenery.ProfileFromScene(...)` để `SurfaceY(x)` trả mặt đồi thật.

### ⚠ Phòng thí nghiệm: bật cảnh, TẮT công trình

`StickmanAILabBuilder.DressLab` gọi `Configure(era, structures: false)`. Bộ rải có `Scaffold` và
`Arcade` — hai loại mang SÀN THẬT và CẦU THANG THẬT. Một cái giàn giáo rơi vào khe giữa hai vùng
thử là từ hôm đó bench chạy trên địa hình khác, số đo lệch, và scene vẫn mở bình thường nên không
có gì báo. Trời và núi thì vô hại: không collider nào nằm trong tầm với của ai.

### MỖI LẦN CHƠI MỘT MAP MỚI (2026-09-07)

`Core/MapRandomPlay` — công tắc (`PlayerPrefs`, mặc định BẬT; tắt trên HUD sân map hoặc Xưởng
map) + trí nhớ seed/kiểu chơi theo scene. Người dùng: *"mỗi lần chơi trong chế độ game hay AI
lab nó ngẫu nhiên tạo 1 map cho tôi, không có chỉ play mỗi 1 map duy nhất nữa"*.

| Đường vào | Trước | Nay (khi bật) |
|---|---|---|
| Menu F1 / AI Lab → sân map (`MapArenaRequest.Set`) | mở đúng map mẫu | bốc map ngẫu nhiên **cùng nhiệm vụ** với map mẫu |
| Kho map / map nháp (`SetExact` / `DraftKey`) | đúng map | **vẫn đúng map** — kho là "chơi map này" |
| «Ván tiếp» (nạp lại scene sân map) | map cũ | map mới, **giữ kiểu chơi** của ván trước (`LastMission`) |
| «Chơi lại ván này» (`GameSession.RetrySame` → `MarkRetry`) | — | **cùng seed** — nút soi bug vẫn soi được |
| ~40 scene chế độ chơi đã bake (`MapStudioBootstrap`) | địa hình bake cố định | `MapGenerator` bốc theo `MissionPlan.ForScene` rồi `MapStudio.ApplyTerrain` ngay lúc nạp — đúng đường «Chơi thử» của Xưởng map |

⚠ Chỉ scene CÓ `MatchModeBase` mới được thay địa hình tự động; bàn thử vũ khí, AI Lab (29 vùng
đo), tủ kính, thuỷ chiến (tên có sea/pirate/island/naval) KHÔNG — thay đất dưới bài đo là phá bài.
⚠ `MapArenaRequest.LastWasExact` phân biệt "mở kiểu chơi" và "mở đúng map"; chỗ nào mở từ KHO
phải gọi `SetExact`, không thì bị bốc sang map khác.

⚠⚠ **ĐỊA HÌNH ĐỔI DƯỚI SCENE BAKE CHỈ ĐƯỢC ĐỔI MẶT ĐẤT + CẢNH, KHÔNG THÊM COLLIDER**
(`MapStudioBootstrap.TameForBakedScene`, 2026-09-07 — người dùng: *"collider lung tung làm nhân
vật bị kẹt, bị rớt không đúng vị trí"*). Màn dựng tay có luật chơi và toạ độ riêng; lô lắp ghép
(thềm, ụ che, chòi canh, hầm chui, hồ, ba tầng) và công trình có sàn mọc chen vào là thợ vướng
thềm, quân hồi sinh rơi xuống hầm vừa đào. Map cho scene bake: `modularLayout=false`, không
thềm/ụ/hồ/vực/hầm/ba tầng, `decoFloors=false` (giàn giáo · vòm · ổ nấp · cột · đống · quảng
trường → cây/đá), đồi ≤ 1.1 và phẳng dưới mọi thứ đã có. Đủ bộ địa hình thì ở SÂN MAP.

## ⚠⚠ TỬ CHIẾN ĐỒNG ĐỘI — `MissionType.TeamDeathmatch` (2026-09-09)

Hai phe HỒI SINH LIÊN TỤC, đấu nhau bằng SỐ MẠNG. Bộ đếm là `MapTeamDeathmatch`; đối chiếu
`TeamDeathmatchMode` (trọng tài của màn bắn súng dựng tay) — cùng luật chơi, khác trọng tài.
Bản TRUNG CỔ là preset `Med_TeamDeathmatch` (30 mạng · 5 phút · nửa rộng 30 · ba tầng).

### ⚠⚠ VẠCH ĐÍCH KHÔNG ĐƯỢC LÀ "DIỆT SẠCH ĐỊCH"

Đây là toàn bộ lý do kiểu chơi này phải có số enum riêng, thay vì là "giao chiến có thêm hồi
sinh". `MatchGoal.EliminateEnemies` hỏi *"phe kia còn ai không"*, mà ở đây ai cũng sống lại —
nên câu hỏi ấy sai theo **hai chiều trái ngược nhau**, và không lỗi nào báo cả hai:

| Nhịp | Chuyện xảy ra |
|---|---|
| Cả đội địch đang nằm trong hàng đợi hồi sinh | sân trống ⇒ tuyên bố THẮNG ở giây thứ 20, tỉ số 2–1 |
| `RespawnDirector` kịp báo *"còn đang đẻ quân"* (nó khai `ITroopSource`) | vế ấy KHÔNG BAO GIỜ thành ⇒ trận trôi vĩnh viễn |

Vạch đích đúng là **`MatchGoal.KillScore`** (11): CẢ HAI phe mang một vế, ai tới
`MissionSettings.killsToWin` trước thì thắng. Đừng thêm `Wipe` vào `MatchRules.DefaultFor` cho
"đủ bộ" — vế nào thành trước thì thắng, nên một vế thứ ba ở đây không phải "thêm một đường
thắng" mà là XOÁ luật chơi.

### ⚠ HỒI SINH: KIỂU CHƠI ĐẦU TIÊN CỦA HỆ MAP TỰ DỰNG `RespawnDirector`

Các mode tính giờ khác (cướp cờ · chiếm điểm · kéo co) có hồi sinh là nhờ sống trong scene bake
sẵn, nơi `StickmanDemoBuilder.AddRespawnDirectorShared` đã gắn; còn map SINH LÚC CHẠY thì trước
2026-09-09 **không dựng cái nào**. `MapAssembler.BuildTeamDeathmatch` dựng nó — bỏ đi thì tử
chiến tụt xuống thành đúng một ván giao chiến có bảng điểm: hai phe đánh hết nhau trong một
phút, sân trống, đồng hồ vẫn chạy, tỉ số đứng ở 6–5.

Kèm theo bốn điều:

* **Không bọc khai báo trong `#if UNITY_EDITOR`.** `RespawnDirector.Setup` là bản RUNTIME (bản
  `EditorSetup` nay chỉ gọi vào nó) — cùng luật với ba setter nối dây người chơi ở
  [Respawn.md](Respawn.md) §4. Hai đường khai báo chạy hai nhánh code riêng là cách chắc chắn
  để map dựng lúc chạy và scene bake sẵn hồi sinh theo hai nhịp khác nhau.
* **Gọi `Setup` TRƯỚC `Start`** — `Start` là lúc chụp khuôn, mà khuôn chụp theo `_teams`.
  `BuildMission` chạy trước `Deploy`, nên quân đã ra sân đủ đồ trước khi khuôn được chụp.
* **Mốc ra quân là MỐC RIÊNG**, không dùng lại `Base_A`/`Base_B`: `MapStudio` DẮT mốc hồi sinh
  khi người dùng thay địa hình, mà hai mốc căn cứ thì cả cây chỉ huy đang lấy làm nhà.
* **TẮT VÒNG HỒI SINH KHI TRẬN NGÃ NGŨ** (`MapTeamDeathmatch.Update` → `HoldRespawns`). Thiếu
  vế này thì bảng tổng kết hiện lên trong khi quân hai phe vẫn đều đặn ra lò và đánh nhau phía
  sau tấm bảng — trọng tài đã xong việc của nó, chỉ là không ai bảo cái vòng kia dừng.

### Ba chốt của bảng điểm (cùng luật với `TeamDeathmatchMode`)

1. **Chỉ đếm NGƯỜI giết NGƯỜI** — tường · cổng · tháp cũng có `TeamMember` và cũng "chết" được.
   Không lọc thì phá một cái cổng được 1 điểm, và ván tử chiến thành ván đập nhà.
2. **Bắn đồng đội bị TRỪ điểm** (không xuống dưới 0).
3. **Ngã vực · cháy · nổ vô chủ không ai được điểm** (`DamageInfo.source` rỗng). Hệ quả ở bảng
   số: `MapBlueprint.For` để **`pits = 0`** cho kiểu này — mỗi cái hố là một cái máy tiêu mạng
   mà không đẻ ra điểm, ván dài ra trong khi bảng điểm không nhúc nhích.

### Khác loạn chiến và battle royale ở đâu

* **Có ĐỒNG ĐỘI thật** — `MapFreeForAll` XÉ hai đạo quân thành N phe; tử chiến giữ nguyên hai
  đạo, nên **vẫn có tướng** (`MapBlueprint` không tắt `commander`, khác loạn chiến và royale).
  Cây chỉ huy là thứ duy nhất làm quân VỪA HỒI SINH biết nhập lại vào đội, thay vì lẻo đẻo đi
  một mình vào giữa đội hình địch.
* **Sân VỪA, không rộng như royale** (nửa rộng 26–34 so với 46–50): royale muốn người ta LÂU MỚI
  GẶP, tử chiến muốn GẶP LIÊN TỤC — đồng hồ ở đây đếm số mạng chứ không đếm người còn sống.
* **TẮT đường cong độ khó** — ramp chỉ đổ viện binh cho phe B, mà cuộc đua điểm này ĐỐI XỨNG:
  phát thêm quân cho một bên là phát thêm điểm cho bên đó. Van an toàn là **trần quân số**
  (`maxAlivePerTeam` = đúng quân số map khai): cao hơn thì sân đông dần lên sau mỗi pha giao
  tranh, thấp hơn thì lính xếp hàng quá `_npcSlotWaitLimit` rồi BỊ BỎ LƯỢT và một phe lặng lẽ
  mỏng đi.

### Bảng điểm phải trả lời HAI câu hỏi

`MatchDirector.DrawObjectives` trả lời *"phe nào đang thắng"*; nó **không** trả lời *"TÔI đang
đánh thế nào"* — mà tử chiến thì hỏi cả hai, và câu thứ hai mới là câu người chơi hỏi sau mỗi
pha giao tranh. Nên `MapTeamDeathmatch` giữ sổ riêng của người chơi (hạ / ngã) và một dòng nhắc
ngắn 2.5 giây:

* `+1 · bạn vừa hạ một địch` — ghi công đo bằng `PlayerCharacter.Current` **tại nhịp đó**, không
  nhớ sẵn tham chiếu: mode này có hồi sinh nên "người chơi" là một thân MỚI sau mỗi lượt chết,
  nhớ sẵn là từ lượt thứ hai trở đi mọi pha hạ gục của người chơi đều không được ghi công.
* `−1 · BẮN NHẦM ĐỒNG ĐỘI` — ⚠ **luật vô hình là luật không tồn tại.** Chốt 2 trừ điểm, nhưng
  không nói ra thì người chơi chỉ thấy tỉ số phe mình TỰ TỤT ngay sau một pha đánh thắng: đọc ra
  là "bảng điểm hỏng", không đọc ra là "đừng ném lựu đạn vào đám đông của mình".
* `bạn ngã` — đếm TRƯỚC mọi nhánh thoát, vì người chơi rơi vực thì không phe nào được điểm
  (chốt 3) nhưng đó vẫn là một lượt chết.

Dòng `CÒN N MẠNG NỮA` thay chỗ `mốc 30` khi một phe còn ≤3 mạng là tới đích — không có nó thì
bảng điểm chỉ là hai con số bò lên đều đều và ván kết thúc như một cái đèn tắt.

⚠ Bảng này **luôn hiện**, khác mọi dòng mục tiêu khác (nằm sau nút ≡, cảm ứng mặc định GOM —
`StickmanUI.HudOpen`). Giấu tỉ số của một mode đấu bằng tỉ số là giấu chính luật chơi.

### Ba chốt chặn tự động

| Chốt | Ở đâu | Bắt cái gì |
|---|---|---|
| Không vực · nửa rộng ≥ 20 | `MapBlueprint.Validate` (Doctor + Xưởng map gọi) | map ĐẶT TAY / map cũ nạp lại lọt qua `Spec` |
| Nửa rộng ≥ 24 | `MapGenerator.Sanitize` | map bốc ngẫu nhiên ra sân quá hẹp ⇒ quân vừa hồi sinh rơi thẳng vào đội hình địch |
| Đủ 8 điểm nối | `StickmanMissionChainCheck` | quên một file trong chuỗi kiểu chơi |

⚠ Nửa rộng có ngưỡng **vì có hồi sinh**, không phải vì thẩm mỹ: sân hẹp thì chỗ ra quân nằm sát
đội hình địch, và cái vòng hồi sinh biến thành một cái máy nộp mạng — phe đang thắng càng thắng
nhanh hơn. Đây là vế mà mode KHÔNG hồi sinh không có.

### ĐƯỢC PHÉP HOÀ — vế duy nhất của cả hệ map

Mọi kiểu chơi khác cố ý KHÔNG CÓ HOÀ (§7b tầng game), nên khi điểm bằng nhau chúng đi tiếp xuống
đếm quân còn sống. Ở tử chiến phép đếm ấy đo đúng một thứ vô nghĩa: có hồi sinh nên *"còn bao
nhiêu người đang đứng"* chỉ nói lên nhịp hồi sinh của ba giây cuối, không nói lên ai đánh hơn ai
suốt năm phút. `MatchDirector.TryTimeoutVerdict` vì thế **thoát riêng** cho `KillScore` và trả
`Finish(-1, ...)` khi bằng điểm — `MatchOutcome.winner = -1` đã được cả `MatchStats`
(`Verdict = "HOA"`) lẫn `Finish` (không kêu tiếng thắng/thua) hiểu sẵn.

## MAP VÒNG (`MapWrap`) — đi hết mép trái hiện ra ở mép phải (2026-09-07)

Bật bằng `MapDefinition.wrapAround`. Ba mảnh:

| Mảnh | Tầng | Việc |
|---|---|---|
| `MapWrap` | Core | HÌNH HỌC: `WrapX` · `Delta` (đường ngắn có dấu) · `Distance` · `LongDelta` · `Behind` |
| `MapWrapZone` | Combat | dời người qua mép mỗi `LateUpdate`, và GỠ tường biên |
| `MapScenery.BuildWrapZone` | Map | dựng thay cho `BuildEdgeWalls` khi map khai `wrapAround` |

### ⚠⚠ Vòng lặp KHÔNG phải "hiệu ứng dịch chuyển" — nó đổi HÌNH HỌC của cả tầng AI

Trên map vòng, **"hướng tới địch" không còn là một dấu ±1 cố định**: từ nhà mình tới nhà địch có
đường ngắn (đâm thẳng) và đường dài (vòng qua mép, đổ vào sau lưng). Cả hệ chỉ huy cũ tính bằng
phép trừ thẳng và so `x * _forward`, nên **nói dối ngay khi có ai bước qua mép**: một tổ vừa vòng
qua biên, đang đứng sát sau lưng địch, bị chấm là "xa địch nhất" nên bị gọi về làm quân dự bị.

Chốt: mọi phép đo hướng/khoảng cách của tầng AI đi qua `MapWrap.Delta`, và `CommandNode.Advance(x)`
thay cho mọi `x * _forward` (bốn chỗ). Trên map thẳng `Advance` chỉ lệch một hằng số nên mọi phép
SO SÁNH giữ nguyên kết quả — thay vào là an toàn tuyệt đối.

### ⚠⚠ HAI NHÀ PHẢI CÁCH NHAU DƯỚI NỬA CHU VI VÒNG

Xa hơn nửa vòng thì đường ngắn tới địch chạy **qua mép map** ⇒ `_forward` lật ngược ⇒ tuyến chính
hành quân ra mép và đánh nhau ở chỗ nối vòng, còn "cánh vòng sau lưng" lại đi qua giữa sân. Đảo
ngược sạch ý đồ, mà **mọi phép đo vẫn đúng nên không lỗi nào báo**.

Bắt được bằng mô phỏng (`sim_wrap.py`) chứ không phải bằng mắt: bài lab đầu tiên đặt hai trại ở
±34 trên vòng 92 (cách 68 > 46) và cánh vòng đi xuyên giữa sân, 0 lần qua mép.
`TeamCommander.ComputeForward` nay kêu MỘT lần khi phạm luật này.

### ⚠ Tường biên và vòng lặp LOẠI TRỪ NHAU

`Tuong_Bien_Trai/Phai` chặn đúng cái mép mà vòng cần mở. Map vòng mà còn tường thì nó chỉ là map
thẳng có hai đầu tường — AI húc vào rồi đứng đó, không lỗi nào báo. `MapWrapZone.Start` tự gỡ.

### Camera

`DemoCameraFollow` nghe `MapWrap.Wrapped` và DỜI CHÍNH NÓ đúng lượng đó. Không làm thì `SmoothDamp`
thấy mục tiêu nhảy cả chiều dài map và lia ngang toàn trận mất mấy giây. Kẹp `_minX/_maxX` cũng
tắt khi vòng đang bật — map vòng không có mép để mà kẹp.

`TeamMember.QueryNearWrapped` cho vùng cảnh giới nằm sát mép (nửa vùng nằm bên kia mép thì
`QueryNear` không thấy gì ở đó). Lưu ý `QueryNear` XOÁ danh sách mỗi lần gọi — lần quét thứ hai
phải NỐI.

### NHÀ CHÍNH KHÔNG ĐỨNG Ở MÉP MAP, VÀ MAP VÒNG ĐÃ ĐƯỢC BẬT (2026-09-07)

User: *"bạn xây map bị kẹt ngọn núi, tôi muốn núi có thể đi qua lại được; tôi muốn có thể đi
tới cuối map và nó vòng qua đầu map bên kia; có thêm khoảng trống xa hơn sau nhà chính của 2
team để có thể tấn công sau nhà; AI có thể điều phối đi ngược lại tấn công phía sau nhà địch"*.

**Cái "kẹt ngọn núi" KHÔNG PHẢI ngọn núi.** `StructureKind.Cliff` toàn `PartCollision.Trigger`
— đi xuyên được từ đầu. Thứ chặn là `MapScenery.BuildEdgeWalls`: hai bức tường VÔ HÌNH ở
`±halfWidth`, và `BuildFrameMountains` dựng núi ngay ngoài đó để *giải thích* bức tường. Người
chơi đâm vào tường, thấy núi, và kết luận núi chặn. Bài học: **vật giải thích một luật vô hình
sẽ bị đổ tội thay cho luật đó.**

| Số | Ở đâu | Cũ | Nay |
|---|---|---|---|
| Vị trí nhà chính (map thẳng) | `MapBuildRules.BaseAnchorStraight` | 0.88 × halfWidth | **0.82** |
| Vị trí nhà chính (map vòng) | `MapBuildRules.BaseAnchorWrapped` | — | **0.44** |
| Nửa bề ngang map vòng | `MapBuildRules.WrapWidthFactor` | — | **× 1.8** |
| Hậu phương sau nhà | đo | 2.9–4.1 | **20–50** (vòng) · 4.7–8.3 (thẳng) |

⚠⚠ **0.44 LÀ RÀNG BUỘC HÌNH HỌC, KHÔNG PHẢI GU.** Trên một vòng, từ nhà mình tới nhà địch có
hai chiều; `MapWrap.Delta` trả chiều NGẮN và `TeamCommander` lấy dấu của nó làm "hướng tới
địch". Hai nhà cách nhau quá NỬA VÒNG thì chiều ngắn chạy qua mép map — cả hai đạo quân quay
lưng lại chiến trường và đi vòng ra sau. Điều kiện: `2·baseX < halfWidth`. Đo lại toàn bảng
(script trong scratchpad phiên này): 11/11 kiểu chơi vòng đều đạt, đường vòng dài **1.27×**
đường thẳng — đủ xa để vòng cánh là một quyết định có giá, đủ gần để nó không vô vọng.

**Kiểu chơi nào vòng (cập nhật 2026-09-09 — user: *"tất cả chế độ chơi đều có thể đi loop map,
đi hết màn hình bên phải sẽ xuất hiện ở màn hình bên trái, và ngược lại"*)**

Khai ở `MapBlueprint.Spec.wrapAround`, và từ 2026-09-09 `MapDefinition.wrapAround` **mặc định
BẬT** — map đặt tay cũng vòng, không phải nhớ tick.

**VÒNG — 17/24 kiểu chơi** (đo bằng `wrapAround` trong `MapBlueprint.For`)**:** diệt sạch · thủ trại · công trại · chiếm điểm · cướp cờ · cướp làng ·
sinh tồn · cứu tù binh · đấu tướng · loạn chiến · kinh tế · zombie giữ làng · **battle royale** ·
**săn rồng** · **vết nứt hư không** · **phố mở** · **tử chiến đồng đội** — riêng phố mở là **BẮT BUỘC**, một thành phố có hai đầu thì không còn là thế giới mở (`MapBlueprint.Validate` chặn).

**KHÔNG VÒNG — 7 ngoại lệ:** năm dòng dưới đây đều đo TIẾN ĐỘ THEO TRỤC X; cộng hai
kiểu ARPG (`DungeonDelve` · `BossLair`, 2026-09-09) vốn là hầm CÓ ĐÁY chứ không phải chiến trường:

| Kiểu chơi | Vì sao vòng làm hỏng |
|---|---|
| Hộ tống · đưa VIP · áp tải zombie | tới đích là thắng; trên vòng thì đích nằm ở CẢ HAI phía, `MoveTowardsX` chọn đường ngắn ⇒ đoàn xe lách qua mép và bỏ hết quãng đường làm nên màn chơi |
| Kéo co | tuyến đầu LÀ một toạ độ x — trên vòng không có "trước/sau" toàn cục |
| Vây thành | dải tiếp lương chạy giữa map và phe vây phải CẮT được nó; có đường vòng thì lương luôn tới nơi |

Chốt ở BA chỗ, phải khớp nhau: `MapBlueprint.Spec.wrapAround` · `MapBlueprint.Validate` ·
`StickmanDoctor.AxisProgressMission`. Lệch nhau thì Doctor báo một đằng, tool dựng một nẻo.

⚠⚠ **BA LẦN "MAP VÒNG THÌ KHÔNG LÀM ĐƯỢC X" ĐÃ SAI.** Battle royale, săn rồng và vết nứt bị
tắt vòng lúc đầu vì ba lý lẽ nghe rất chắc, cả ba đều hỏng khi soi kỹ:

- *"Vòng bo là một dải trên trục thẳng, map vòng thì không có 'ngoài vòng'."* SAI: `PickTarget`
  đã kẹp vòng bo trong `±halfWidth` nên cung an toàn **không bao giờ vắt qua đường nối**, mà
  phần bù của một cung ngắn hơn chu vi thì vẫn là một cung.
- *"Con rồng lượn theo trục thẳng, map vòng thì nó biến mất ở một mép."* SAI: `MapWrapZone` chỉ
  dời ai có `StickmanLocomotion` — con rồng bay theo trục riêng, không đi qua đó.
- *"Vết nứt trôi ngang cần hai đầu sân."* Ngược lại: KHÔNG vòng mới là cụt — đuổi theo một vết
  nứt tới mép map thì pha đuổi kết thúc bằng một bức tường.

Bài học: hỏi *"cái gì THẬT SỰ đo theo trục x"*, đừng hỏi *"cái này có vẻ thẳng không"*.

⚠ **`WrapWidthFactor` (× 1.8) KHÔNG phải "map vòng thì nên rộng".** Nó bù đúng một việc: nhà
chính lùi từ 0.82 về 0.44 nửa map, nên phải nở ra chừng ấy thì hai phe vẫn gặp nhau ở cự ly cũ.
Kiểu chơi **không có nhà chính** (battle royale) thì không có gì để bù — khai
`Spec.noWrapWidening = true`, nếu không map 92 thành map 166 và vòng bo thu qua sáu pha trên
một sân trống.

⚠ **MAP VÒNG PHẢI CÓ VIỀN ĐẤT** (`MapScenery.WrapSkirt` = 16). `MapWrapZone` chỉ dời người sau
khi họ vượt mép 0.6 đơn vị; đất dựng tới đúng mép thì 0.6 đơn vị ấy là không khí. Nặng hơn:
van chặn mép vực của `StickmanLocomotion` DỪNG chân trước khoảng không, nên AI đi tới mép rồi
**đứng đó mãi** — đúng cái "đi tới cuối map thì kẹt", và van chặn vực đang làm đúng việc của nó.
Viền chỉ có đất + cỏ (`Layout.SafeX` kẹp cây/công trình trong `±halfWidth`).

⚠ Map vòng thì **KHÔNG dựng khung núi**: `halfWidth` là ĐƯỜNG NỐI chứ không phải bức tường,
nên dãy núi ngoài đó là hình không bao giờ với tới và nhảy giật mỗi lần ai đó vòng qua.

**AI đánh sau lưng đã có sẵn, chỉ thiếu công tắc**: `CommandNode.TryWrapFlank` (`AttackLane.Wrap`,
`doctrine.wrapFlankDepth` = 6) và `TryRearGuard` (`rearGuardDepth` = 5) viết xong từ trước
nhưng **không một map nào bật `wrapAround`** nên chúng là code chết. Cùng họ với "tính năng
làm xong không ai chọn" — thêm một luật thì phải có một đường DỮ LIỆU dẫn tới nó.
(2026-09-09: 51/72 map mẫu đã bật, nên hai nhánh này bắt đầu chạy thật.)

### ⚠⚠ `MoveTowardsX` LÀ ĐIỂM NÚT CỦA MỌI BƯỚC ĐI NGANG (2026-09-09)

```csharp
// StickmanLocomotion.MoveTowardsX
float dx = MapWrap.Delta(transform.position.x, targetX);   // KHÔNG phải targetX - x
```

**26 file gọi vào hàm này** (mọi `AIState*`, `CommandNode`, các module AI, `StructureAssembler`).
Trước 2026-09-09 nó trừ thẳng, nên trên map vòng ai có mốc ở bên kia đường nối sẽ **quay đầu đi
hết chiều ngang map** để tới một chỗ ngay sau lưng mình. Sửa ở đây là cả tầng AI đi đúng; sửa lẻ
ở từng state thì luôn sót chỗ và không có lỗi nào báo. Map thẳng: `MapWrap.Delta` trả đúng
`targetX - x`, hành vi không đổi.

⚠⚠ **ĐI ĐÚNG MÀ NHÌN SAI THÌ NHÂN VẬT ĐỨNG GIẬT TẠI CHỖ.** `MoveTowardsX` chỉ chữa phần ĐI
LẠI. Bản đầu để nguyên phần ĐO ĐẠC và hậu quả hiện ra ngay trong ván chơi: `StickmanAgent` hỏi
`Mathf.Abs(_objective.position.x - transform.position.x)` ra 88 nên tưởng còn xa lắm, trong khi
`MoveTowardsX` đi 4 bước qua mép là tới nơi rồi dừng. Hai câu trả lời đánh nhau mỗi khung hình.

Đã quét **86 chỗ trong 33 file** (`Assets/Scripts/AI`, `Combat`, `Units`):

| Trước | Sau |
|---|---|
| `Mathf.Abs(A.x - B.x)` | `MapWrap.Distance(B.x, A.x)` |
| `Mathf.Sign(A.x - B.x)` | `Mathf.Sign(MapWrap.Delta(B.x, A.x))` |

⚠ Giữ `Mathf.Sign` bọc ngoài chứ **không** dùng `MapWrap.DirectionTo`: `Sign(0)` trả 1 còn
`DirectionTo(0)` trả 0, và có chỗ đang dựa vào vế đó. Trên map thẳng `Delta` trả đúng `to − from`
nên cả hai phép thay là tương đương tuyệt đối.

⚠ Còn sót có chủ ý: phép trừ x KHÔNG nằm trong `Abs`/`Sign` (ví dụ `transform.position.x - wall`
trong mấy phép đo tường thành). Chúng đo trong phạm vi vài đơn vị nên đường vòng không đổi kết
quả — nhưng nếu thêm thứ gì đo xa thì nhớ vế này.

### ⚠⚠ HAI LỖ HỔNG LÀM MAP VÒNG "KẸT" — cả hai im lặng (2026-09-09, từ chơi thử)

**1. ĐIỂM ĐỐI XỨNG làm nhân vật xoay tại chỗ.** Mốc cách đúng NỬA VÒNG thì hai đường dài bằng
nhau, và `MapWrap.Delta` **đổi dấu chỉ vì ta nhích một bước chân**. Nhịp này nó bảo sang phải,
nhịp sau sang trái, mãi mãi. Người chơi thấy nhân vật *"xoay qua xoay lại"* — mà mỗi khung hình
`MoveTowardsX` đều đang trả lời ĐÚNG câu hỏi nó được hỏi, nên không có gì để mà bắt lỗi.
Chốt: `StickmanLocomotion._wrapHeading` + `WrapHeadingBand` = 3 — vào vùng lưỡng lự thì GIỮ
hướng đã chọn, ra khỏi vùng đó mới cập nhật.

**2. VÒNG BỊ TẮT NHẦM khi dựng map mới.** `OnEnable` của `MapWrapZone` MỚI chạy **trước**
`OnDisable` của vùng CŨ (F5 đổi map, `MapArena` dựng lại). Vùng cũ tắt vô điều kiện là tắt luôn
vòng của vùng mới — mà đất đã dựng theo kiểu vòng: có viền 16 đơn vị và **KHÔNG có tường biên**.
Người đi tới mép gặp đúng thứ van chặn vực sinh ra để tránh: một mép đất không có gì phía sau.
Họ đứng đó mãi. Đó chính là **"map bị kẹt"**.
Chốt: `MapWrap.Enable/Disable` nhận CHỦ SỞ HỮU, chỉ kẻ đã bật mới tắt được; và
`MapWrapZone.LateUpdate` tự bật lại nếu thấy vòng tắt oan.

⚠ Bài học chung của cả hai: **map vòng hỏng theo kiểu KHÔNG NÉM RA LỖI**. Cả hai đều là "code
chạy đúng luật của nó" cộng lại thành một ván không chơi được. Khi người chơi báo "kẹt" hay
"xoay", đi tìm chỗ có HAI câu trả lời đúng chứ đừng tìm exception.

⚠⚠ **TRỌNG TÂM MỘT NHÓM PHẢI TÍNH THEO VÒNG.** `sum / count` là bẫy im lặng hạng nặng: một tổ
có người ở x = −45 và người ở x = +45 đang ĐỨNG CẠNH NHAU ngay đường nối, mà phép trung bình
thẳng trả về 0 — giữa map, phía đối diện. Mỗi lần có người bước qua mép thì trọng tâm nhảy nửa
vòng ⇒ mốc giật qua giật lại ⇒ nhìn ra đúng như "AI bị loop". Cách đúng (xem
`MapBattleRoyale.SquadCenter`): đo LỆCH so với người đầu tiên bằng `MapWrap.Delta` rồi cộng lại,
cuối cùng `MapWrap.WrapX`.

## ⚠⚠ XẾP TUYẾN QUÂN — `SafeX` LÀ PHÉP CHIẾU MẤT THÔNG TIN (2026-09-09)

User gửi ảnh: một BÚI lính chồng khít nhau đứng im giữa sườn đồi, mấy người còn lại đi bình
thường. *"Thuật toán tạo map làm nhân vật bị kẹt."*

`Layout.SafeX` đúng cho MỘT vật: đẩy x ra khỏi hố / vùng cấm rồi trả chỗ đứng được gần nhất.
Nhưng nó **dồn mọi x rơi vào cùng một vùng cấm về ĐÚNG MỘT SỐ** (`zone.x - 0.1`), và mọi x vượt
mép map về đúng `±(halfWidth - 1.5)`. `MapAssembler.BuildArmy` gọi nó cho TỪNG người của một hàng
(`front + depth × 1.5 × i`) — nên nguyên một khúc hàng quân sinh chồng khít lên nhau.

Đo bằng bố cục thật (halfWidth 30, thành `[-26..-14]`, hồ `[-6..-1]`, 22 lính từ x = −8 lùi trái):

```
CŨ  (SafeX):  −8.0 −9.5 −11.0 −13.3 −14.0 −13.9 −13.9 −13.9 −13.9 −26.1 −26.1 −26.1 −26.0
              −27.5 −28.5 −28.5 −28.5 −28.5 −28.5 −28.5 −28.5 −28.5     → cụm 8 người, 3 cụm
MỚI (LineX):  −8.0 −8.98 −9.95 −10.93 … −27.52 −28.5                    → 0 cụm, cách đều 0.98
```

**Và chồng chỗ ở dự án này KHÔNG TỰ GỠ:**
* `TeamMember._passThroughAllies` mặc định **BẬT** ⇒ vật lý không đẩy đồng đội ra khỏi nhau;
* `MapAssembler.IsBlocked` cố ý bỏ qua người (*"họ tự giãn cách được"*);
* `StickmanAgent.ApplySeparation` tắt hẳn khi `IsBreakingDeadlock`, bị bóp còn
  `combatSeparationScale` lúc đánh nhau, và nó chỉ là một BIAS cộng vào hướng đi — hai người
  nhận cùng một lệnh hành quân thì bias triệt tiêu và họ đi song song, chồng khít, tới hết trận.

### Ba vế đã sửa

1. **`MapScenery.Layout.LineX(front, direction, spacing, index, count)`** (`MapScenery.Line.cs`)
   — con trỏ **NHẢY QUA** hố rồi đi tiếp, nên hai chỉ số khác nhau không bao giờ ra cùng một số.
   Hết chỗ thì **BÓP ĐỀU** khoảng cách (sàn `MinLineSpacing` 0.45) chứ không dồn đống ở mép.
   `BuildArmy` · sát thủ · tướng dùng chung một cột `columnCount`.

   ⚠⚠ **`LineX` CHỈ NÉ `pits`, KHÔNG NÉ `reserved`.** `reserved` nghĩa là *"đừng DỰNG ĐỊA HÌNH
   đè lên đây"* (sân thành, chân cầu thang, mốc hồi sinh) — nó KHÔNG có nghĩa *"đứng ở đây là
   sai"*. Đọc nhầm hai câu đó thành một là cấm cả đạo quân đứng trong chính sân thành của mình:
   đo lại thì hàng 22 người chỉ còn 6.7 đơn vị trống, vẫn phải chen. Vật CỨNG đã có phép dò vật
   lý của `FreeSpawnPoint` lo.

2. **`FreeSpawnPoint` coi chỗ ĐÃ CÓ NGƯỜI là chỗ vướng** (`MapAssembler.Spawn.cs`) — hỏi
   `TeamMember.All` chứ không `OverlapCircle` (người vừa `Instantiate` chưa chắc đã đồng bộ vào
   thế giới vật lý). Chỉ chặn trong mấy nhịp dò đầu để map chật vẫn còn đường lui.

3. **Luật 18 `CheckSpawnStacking`** (`MapBuildRules.Crowd.cs`) — gom CỤM (không báo từng cặp:
   6 người chồng nhau là 15 dòng log giống hệt nhau che mất mọi vi phạm khác).

Mô phỏng đối chiếu (in ra đúng hai dòng số ở trên):
`.claude/skills/stickman-assets/scripts/spawn_line_sim.py`.

## ⚠ MẶT VÁN CỦA CẦU PHẢI TRÙNG MẶT COLLIDER (2026-09-13)

`MapScenery.BuildBridge` gõ tay *"mặt ván trong art nằm ở ~64% chiều cao"*. Đo lại `Bridge.png`
(420×150) theo hàng pixel: y 3–13 là tay vịn trên, 14–32 là cọc lan can, **33–65 là tấm ván**,
66–149 là trụ chống — tức mặt ván ở **117/150 = 0.78**, không phải 0.64. Lệch 1.1 × 0.14 =
**0.15 đơn vị**: người đi qua cầu lún ngập bàn chân vào ván (*"đi qua cầu bị rời"*). Collider đúng,
art đúng, chỉ con số nối hai thứ ấy sai — không lỗi nào báo.

Số nay ở `MapBuildRules.BridgeArtDeckRatio`, cùng họ với `WallArtWalkableRatio` (tường cao hơn mặt
đi được) và `StairArtWalkableRatio` (thang có tay vịn nhô lên). **Thay ảnh cầu khác thì ĐO LẠI**
(hàng đặc rộng hết khung nằm thấp nhất = tấm ván), đừng đoán.

## ⚠⚠ ART CẦU THANG KHỚP THEO CỬA SỔ ĐI ĐƯỢC CỦA TỪNG TẤM (2026-09-15)

Bài học nâng cấp của mục trên: **một "tỉ lệ đi được" là DỮ LIỆU CỦA TỪNG SPRITE, không phải hằng
toàn cục.** `StairArtWalkableRatio` 0.792 đúng với `Stairs.png` nhưng bị áp cho MỌI tấm —
`Terrain_StoneStairs.png` (tấm của mọi bục địa hình `MapScenery`) vẽ mặt bậc ở **0.27…0.977**
chiều cao ảnh và **0.33…0.97** bề ngang (đo pixel), nên hình bị kéo cao thêm 23% và mũi thang vẽ
lơ lửng ⅓ — người đứng đúng khối bậc mà hình chôn nửa thân (*"đi GIỮA cầu thang"*). Đường cõng
collider của `StickmanStairs` thì vốn ĐÚNG (chạm mặt mỗi bậc ở mép trên-dốc) — cái sai là ART.

Chốt: `MapBuildRules.StairArtWindowFor(sprite)` (bảng cửa sổ theo TÊN tấm) +
`MapBuildRules.FitStairArt` tính chỗ đặt/scale/lật, dùng CHUNG cho `MapCastle.BuildStairs`
(map runtime) và `StickmanFortBuilder.CreateStairs` (scene bake). Phần ảnh NGOÀI cửa sổ tràn qua
mép là CỐ Ý: chiếu nghỉ đè lên mặt sàn/đỉnh đọc ra bệ đá, móng chìm dưới đất đọc ra nền móng.
**Thêm/thay art cầu thang thì ĐO PIXEL bằng Python rồi thêm một dòng cửa sổ** — đừng tin pivot,
đừng tin một hằng cũ.

## ⚠⚠ KHÔNG GÌ ĐƯỢC TREO NGANG ĐƯỜNG LEO CẦU THANG (luật 21, 2026-09-16)

User: *"cầu thang đi lên tường thành bị kẹt"*. Gốc rễ là một điều dễ quên: **người leo KHÔNG
bước trên mặt bậc.** `StickmanStairs` cõng họ theo MỘT MẶT DỐC PHẲNG nối chân thang tới đỉnh
(`SurfaceYAt`) — đó là cả lý do cầu thang ở dự án này không kẹt. Nhưng mặt dốc ấy **chỉ chạm
cao độ sàn ở ĐÚNG đỉnh thang**: lùi ra `bề_dày / độ_dốc` đơn vị là nó đã tụt xuống dưới ĐÁY
lớp mặt đi. Bất cứ khối đặc nào của tầng trên thò ra quá điểm đó sẽ nằm **NGANG THÂN** người
đang được cõng — họ bị ghim vào mặt dốc mỗi nhịp vật lý còn thân đâm vào khối ⇒ **đứng chết
ngay dưới nóc tường**.

Thủ phạm: `WalkwayOverStairs` gõ cứng **0.40** ở CẢ HAI builder (`MapCastle.BuildCastleWall`
map sinh lúc chạy, `StickmanFortBuilder.CreateCastleWall` scene bake), trong khi mép an toàn
chỉ **0.232–0.246**. Đo trên mọi chiều cao tường của bộ chi tiết (1.5 · 1.95 · 2.0 · 2.4 ·
3.0 · 3.4): lối đi thò quá **0.15–0.17** đơn vị vào đúng đường leo — tức **mọi tường thành của
dự án** đều kẹt. Không lỗi nào báo: bậc đúng, lối đi đúng, `LaneNav` vẫn nối, luật map vẫn xanh
— chỉ có hai thứ ấy đè lên nhau.

Nay mép tính bằng **`MapBuildRules.WalkwayOverStairsFor(wallHeight, walkwayThickness)`** (một
công thức, hai builder dùng chung). Vẫn phải **> 0**: lối đi phải CHỒNG MÉP với bậc trên cùng
(bậc ấy đã lấn vào tường `StairWallOverlap`), không thì hai hộp đồng phẳng chạm mép nhau và
sinh đúng cái cạnh đứng ở mặt phẳng bàn chân mà `SinkTop` vừa gỡ đi. Thang ĐỨNG không có dốc
bên dưới nên giữ mép rộng như cũ.

Phép đo: **`MapBuildRules.CheckNothingOverhangsTheRamp`** (`MapBuildRules.Stairs.cs`) — lấy mẫu
dọc mặt dốc THẬT trong scene, dựng hộp bằng thân người ở mỗi mẫu, réo khối đặc nào chặn. Bỏ qua
trigger · sàn một chiều · chính dãy bậc · nhân vật. **Luật này phủ MỌI chỗ nối dốc↔tầng trên,
không riêng tường thành** — cùng họ với ba lần hỏng đã ghi ở `StickmanWarCampBuilder` (rơi →
kẹt → kẹt lần nữa).

## ⚠ CHÂN DECO/CÔNG TRÌNH: ĐIỂM ĐẤT THẤP NHẤT + LÚN NHẸ, CÓ TRẦN (2026-09-15)

User chốt: *"pivot bám đất, hơi thấp xuống 1 xíu, dưới chân stickman"*. `MapScenery` nay neo chân
deco/prop theo điểm đất **THẤP NHẤT dưới footprint** rồi lún `DecoSink` 0.10 (công trình:
`StructureGroundY` dò ±1.2, lún 0.08) — trên sườn đồi mép xuôi dốc không bao giờ hở. Ba VAN đi kèm,
thiếu van nào cũng đo được lỗi ngay:
- `DecoEdgeCliff` 0.6 — chênh tâm↔mép lớn là MÉP THỀM/VÁCH chứ không phải dốc: giữ cao độ tâm,
  không thì cái cây ở mép bục rơi xuống tầng dưới;
- `DecoSlopeDrop` 0.22 — trần hạ theo dốc, vì luật 15 đo chân so với mặt đất tại TÂM với dung sai
  0.35: không kẹp thì smoke réo LÚN trên 100 map (đo 2026-09-15);
- loại CÓ SÀN/THANG (`HasFloors`) neo ĐÚNG `TerrainY(tâm)` không lún — hạ cả giàn giáo là chân
  thang đứng chui vào sườn đồi (luật «thang cắm vào khối đặc» réo).
Cụm ĐÁ cũng phải qua `StructureFitsTerrain` (trải ±1.5, vắt qua dốc là một hòn chôn 0.5+).

## ⚠ TRẦN CHIỀU CAO CHO LỚP TRƯỚC NHÂN VẬT (2026-09-13)

Luật của lớp trước vốn đã viết trong `MapScenery` — *"bụi, đá, túm cỏ thì thoải mái vì chúng chỉ che
tới đầu gối"*, *"một cái cây 3 đơn vị đứng trước mặt là mất nguyên một khoang trận đánh"* — nhưng
**không chỗ nào ĐO nó**. Hệ quả: `ScatterKitDeco` đẩy cả cụm ĐÁ lắp ghép (1–3 tảng, cao tới 1.15) và
cả CÂY lắp ghép ra lớp trước rồi phóng 1.3× ⇒ mảng cao ~1.5 rộng ~2.9 chắn ngay khoang giữa sân;
`ScatterFoliage` đẩy `Cay_Nho` cao 1.6–2.7 ra trước ⇒ 2.1–3.5.

`MapScenery.FrontSceneryMaxHeight` = **0.9** (ngang HÔNG một stickman — cùng cỡ lan can cầu/lan can
tháp: *"che thân, đầu vẫn lộ"*), đo SAU khi nhân `FrontSceneryScale`. Cao hơn trần thì món đó **vẫn
được dựng**, chỉ bị đẩy về lớp sau: không mất cảnh vật nào, chỉ mất chỗ che mặt trận đánh.

## ⚠⚠ MẢNG Ở LỚP TRƯỚC PHẢI ĐỨNG TRÊN ĐẤT (luật 17b, 2026-09-13)

User gửi ảnh: *"orderlayer và nhiều vị trí thấy chưa đúng"* — người chơi đứng trước cửa nhà bị
**cắt làm ba khúc**: còn đầu, mất khúc đùi–eo, còn bàn chân.

Không phải lỗi bậc vẽ. Layer `foreground` THẮNG mọi bậc vẽ, nên mảnh `PartDepth.Front` luôn đè lên
nhân vật — đúng thiết kế với bụi cỏ, lan can cầu, trụ hiên, vì **chúng đứng trên đất** nên mắt đọc
ra "thứ ở gần camera". Bệnh nằm ở chỗ neo:

> `floorY` của TẦNG TRỆT **không phải mặt đất** — nó là mặt trên của MÓNG (`House_Base` 0.3,
> móng đình 0.4). Neo một mảnh lớp trước vào `floorY` là treo nó lơ lửng đúng tầm THÂN người.

Hai thủ phạm, cùng một hình, đo được trên 11/29 map `Med_`:

| Mảnh | Bệnh | Sửa |
|---|---|---|
| `Face_LowWall` (tường lửng mặt tiền, `OpenBay`) | đáy 0.30 đỉnh 0.72; lại kéo `bayW + 0.1` mà `fullBay` = **trọn bề ngang nhà** ⇒ chắn hết mặt tiền, hoa văn gạch dãn 1.7× | đứng trên đất (`plan.groundY`), giữ đỉnh cũ 0.72 ≈ ngang HÔNG; bề ngang giữ cỡ GỐC của art, chừa hai bên để đi lọt |
| `Keep_Face_Step` (bậc thềm đình) | treo cách đất 0.40 — trong khi bậc thềm **chính là thứ nối đất với sàn đình** | đứng trên đất, cao lên tới `groundFloorY + step.height` |

**Luật đo:** `MapBuildRules.CheckFrontLayerBands` — réo mảnh ở layer `foreground` vừa RỘNG
(≥ 1.0, nên cột/cọc không tính) vừa TREO ở tầm thân (chân cách đất 0.15–1.0). Mái hiên · biển hiệu ·
lan can gác treo CAO hơn thế nên nằm ngoài — cố ý, vì chúng che đỉnh đầu chứ không cắt khúc giữa.

⚠ Vì sao không phép đo nào cũ bắt được: bậc vẽ HỢP LỆ (có trong bảng), chân ảnh ĐÚNG `floorY` của
tầng. Mọi con số đều tự nhất quán — chỉ cái mốc là sai. Cùng bài học với
[Tooling.md](Tooling.md) *"phép đo tự tin nhưng đo nhầm thứ"*.
