## Chỉ huy phân cấp (Assets/Scripts/AI/Command/)

Mỗi phe có một CHỦ TƯỚNG SỐNG đứng đầu CÂY CHỈ HUY: **bậc 2 nắm n thằng bậc 1, bậc 3 nắm n
thằng bậc 2**, sâu bao nhiêu bậc tuỳ chỉnh (`TeamCommander._ranks` / `._branching`).
Chi tiết: `Docs/KnowledgeBase/AI-Command.md`. Năm điều cần nhớ:

1. **Một class `CommandNode` cho cả cây** (Composite): lính (bậc 1) · tổ trưởng (bậc ≥2) ·
   **CHỦ TƯỚNG (gốc)**. Chỉ GỐC chạy `Update`, rồi đệ quy xuống cả cây nên thứ tự luôn xác định.
2. **CHỦ TƯỚNG LÀ NHÂN VẬT THẬT, CHẾT ĐƯỢC** (`TeamCommander._commanderUnit`, bỏ trống thì tự
   chọn đứa trâu máu nhất). Nó đứng LÙI sau tuyến `commandStandoff` và dùng `GuardTarget` chứ
   không `HuntTarget` — nếu không tướng tự lao lên tuyến đầu chết lãng nhách.
   **Nó ngã là cả phe TAN HÀNG**: lính về `FreeRoam`, tự tìm địch trong `leaderlessHuntRange`,
   tự đánh tự chạy, không ai ra lệnh và cũng không được đếm vào cán cân nữa.
   Sĩ quan cấp giữa ngã thì mặc định `PickHeir` đôn cấp phó lên thay — đổi bằng
   `CommandDoctrine.commanderSuccession` / `.officerSuccession` (Promote / GoFree / Rout).

2b-tuong. ⚠⚠ **"TỰ CHỌN ĐỨA TRÂU MÁU NHẤT" KHÔNG PHẢI MỘT ÔNG TƯỚNG — `FieldCommander`**
   (user chốt 2026-09-04: *"tôi muốn team địch khác với team tôi cũng có 1 thằng tướng mạnh
   cấp độ AI cao, và điều phối quân đội, khi chết cũng chờ hồi sinh"*).

   `CommandStructure.PickCommander` chấm theo MÁU, nên chủ tướng là **một anh lính bất kỳ,
   khác nhau mỗi ván**. Ba thứ hỏng, không cái nào báo lỗi:
   · **không ai nhìn ra ai là tướng** — hôm nay anh khiên này, ván sau anh khác;
   · **tướng không mạnh hơn lính** ⇒ hạ tướng y như hạ một anh lính, trong khi tướng ngã là
     CẢ PHE TAN HÀNG — một sự kiện lớn tới vậy mà không có gì báo trước;
   · **hồi sinh không trả lại chức**: `PickHeir` đôn cấp phó lên, tướng cũ sống lại thành lính.

   Nay có nhãn **`FieldCommander`** dán lên một nhân vật dựng riêng (`StickmanDemoBuilder.
   SpawnGeneralShared`: máu ×2.4 · cấp AI 4 · vũ khí cấp 4 · giáp tinh nhuệ · vương miện).
   `PickCommander` **ưu tiên người mang nhãn**, phép so máu chỉ còn là lối lùi cho scene không
   dựng tướng riêng. Không sửa một dòng nào trong cây chỉ huy.

   ⚠⚠ **NHÃN, KHÔNG PHẢI THAM CHIẾU.** Đừng gán thẳng `TeamCommander.SetCommanderUnitDirect` —
   hàm đó TẮT `_autoPickCommander`, nên tướng ngã một cái là phe đó **vĩnh viễn không còn chủ
   tướng**, mất sạch tầng điều phối tới hết trận.

   ⚠⚠ **`BuildHierarchy` KHÔNG CÓ NHỊP DỰNG LẠI** — nó chỉ chạy ở `Start` (và khi ai đó phát
   lệnh lúc cây chưa dựng). Nên tướng hồi sinh sẽ đứng làm lính quèn trong khi cả phe nghe
   lệnh một anh cấp phó. `TeamCommander.WatchNamedCommander` hỏi lại mỗi 1.5 s.
   ⚠ Điều kiện phải TỰ TẮT sau khi dựng (`named != _commanderUnit`): dựng lại cây là RESET cả
   thế trận lẫn đội hình, gọi mỗi 1.5 giây suốt trận là §5c ở dạng nặng nhất.

   ⚠⚠ **`ScriptedUnit` TỪNG TRẢ LỜI HAI CÂU KHÁC NHAU — nay có `ScriptedUnit.Respawns`:**

   | Câu hỏi | Ai hỏi | Đáp án cho CHỦ TƯỚNG |
   |---|---|---|
   | bậc khó có được NHÂN BẢN tôi không | `GameSession.ApplyTroopCount` | **KHÔNG** — hai tướng một phe là cây chỉ huy loạn |
   | chết rồi có HỒI SINH không | `RespawnDirector.CaptureTemplates` | **CÓ** |

   Gộp chung nghĩa là muốn tướng khỏi bị nhân đôi thì phải chấp nhận tướng chết một lần là mất
   luôn. Mặc định `Respawns = false` nên boss · VIP · tù binh · hai đấu sĩ giữ nguyên hành vi.

   ⚠ **Chủ tướng còn được MIỄN trần quân số và MIỄN gom đợt hồi sinh** (`Pending.priority`):
   trần `_maxAlivePerTeam` không phân biệt ai với ai, nên tướng xếp hàng chung sẽ bị lính chen
   trước và **bị BỎ LƯỢT** sau `_npcSlotWaitLimit` — mất tướng vĩnh viễn, không lỗi nào báo.

   ⚠⚠ **GỠ `CommandNode` KHỎI KHUÔN HỒI SINH** (`RespawnDirector.MakeTemplate`). Cây chỉ huy
   dựng LÚC CHẠY, nên bản sao đông cứng của nó là dữ liệu ôi — và ở chủ tướng thì node có
   `_superior == null`, mà `CommandNode.Update` lấy đúng điều kiện đó làm nghĩa "TÔI LÀ GỐC":
   thân hồi sinh tự nhận mình là bộ chỉ huy THỨ HAI của phe và phát lệnh song song.
   ⚠ Lỗi này KHÔNG mới: `CaptureTemplates` và `TeamCommander.Start` cùng chạy ở `Start` với
   thứ tự KHÔNG XÁC ĐỊNH, nên tới nay khuôn của lính thường lúc có lúc không mang theo node.
3. **Lệnh xuống, báo cáo lên**: `CommandOrder` (thế trận + cột mốc) chảy từ trên xuống;
   `SectorReport` (quân số, sức chiến đấu, tuyến đầu, đang chạm địch) gom từ dưới lên.
   Ông tướng đọc báo cáo của cấp dưới, KHÔNG quét từng thằng lính.
4. **Chỉ huy DỜI CỘT MỐC, không gọi lại `SetBehavior`.** Mỗi node có 1 Transform `Anchor_*`;
   lính lấy làm `_objective`. `SetBehavior` giờ thoát sớm khi lệnh không đổi — gọi lại nó
   mỗi nhịp là `Target = null` + reset FSM, lính văng khỏi Combat đúng lúc sắp ra đòn.
4b. **QUÂN DỰ BỊ** (`CommandDoctrine.keepReserve` + `CommandNode.UpdateReserve`): chủ tướng
   giữ MỘT cánh (đứng lùi nhất lúc chỉ định) đứng GIỮ ở hậu cứ, chỉ TUNG khi một cánh khác
   thất thế (`PowerRatio` sector < `reserveCommitRatio` và đang chạm địch) hoặc các cánh khác
   bị xoá sổ — tung một lần, có `reserveMinHold` chống tung ngay phút đầu. Ghi đè lệnh SAU
   `DistributeToChildren`, TRƯỚC khi cấp dưới Resolve. `Doctrine_Balanced` (phe xanh Demo_3)
   và `Doctrine_Defensive` bật sẵn; Aggressive dốc toàn quân. Bài test: AI Lab › "Quân dự bị".
4b-bis. **BA TẦNG AI THEO NGÔN NGỮ GAMEPLAY** — mọi thiết kế màn hỏi đúng ba câu, mỗi câu một
   chỗ trả lời: **AI CÁ NHÂN** (một thằng lính đánh/né/chạy thế nào — `StickmanAgent` +
   `AIProfile`) · **AI TEAM** (tổ trưởng `CommandNode` bậc ≥2: dẫn đầu tổ, dồn đánh,
   **che chở lính tụt máu** — `UpdateOfficerCover`, số `officerCover*`) · **AI ĐIỀU PHỐI**
   (chủ tướng gốc cây + `CommandDoctrine`: đánh/thủ theo cán cân, tấn công mục tiêu nào
   qua `ComputeLineAnchor` (cờ hiệu > điểm chiếm > nhà địch), phòng thủ mục tiêu nào qua
   **chia cánh về cứu nhà** — `UpdateHomeDefense`, số `homeDefense*`). Cả hai vế mới mặc
   định TẮT trong code (0), bật trong asset học thuyết do tool sinh; Aggressive/Guerrilla/
   MapAssault CỐ Ý không giữ nhà — đó là điểm yếu trả giá cho sức ép tuyến đầu.
   ⚠ Màn KỊCH BẢN (hộ tống · cướp làng · đấu tướng · vây thành · giải cứu · zombie · thuỷ
   chiến · đột nhập) thì **mode script/`ZombieDirector`/`ShipCaptain` CHÍNH LÀ tầng điều
   phối** — ĐỪNG nhét thêm `TeamCommander` vào đó: `ApplyToAgent` ghi đè behavior kịch bản
   mỗi nhịp (vệ sĩ bị lôi khỏi đoàn hộ tống, lính gác bị kéo khỏi tháp). Bản đồ đầy đủ:
   `Docs/KnowledgeBase/AI-Architecture.md` mục 1b. Hai bài test: AI Lab › "Tổ trưởng che
   chở (AI team)" · "Điều phối: chia quân cứu nhà".
4f. **VỠ TRẬN THEO TINH THẦN** (`CommandDoctrine.routCasualtyRatio` > 0, `CommandNode.CheckRout`):
   một TỔ (không phải gốc) còn dưới tỉ lệ quân đó MÀ ĐANG CHẠM ĐỊCH thì tan hàng bỏ chạy
   về nhà — trận trung cổ tan bằng tinh thần chứ không phải bằng người cuối cùng.
   Balanced/Aggressive 0.34 · Defensive 0.25 (thủ nhà lì hơn) · Guerrilla 0.5 (tan sớm rồi
   tụ lại) · WarCamp 0.4. Chủ tướng KHÔNG áp luật này (`commanderSuccession` lo).
4g. **SĨ KHÍ CÁ NHÂN — KHỰNG KHÔNG PHẢI LÀ VỠ TRẬN** (`AIProfile.morale*` +
   `StickmanAgent`): `shakenDuration` chỉ là một nhịp khựng, còn thanh sĩ khí MỚI là thứ
   quyết định lính có rút khỏi tuyến hay không. Mỗi cái chết đồng minh trong `moraleRadius`
   **đều** trừ `moraleLossPerAllyDeath` (cấm debounce phần mất điểm), trúng đòn cũng trừ ít.
   Tụt dưới `moraleRoutThreshold` (~8%) thì `AIStateRetreat` chạy **về SAU đồng đội còn vững**;
   cả tuyến vỡ mới chạy về `CommandNode.HomeX`/spawn. Đến hậu phương/căn cứ hồi nhanh, đạt
   `moraleReturnThreshold` mới quay lại đúng behavior/lệnh cũ — KHÔNG đổi sang FreeRoam và
   KHÔNG chạy khỏi map. `moraleRadius = 0` tắt TRỌN hệ cho zombie/quái vô cảm; đừng chỉ tắt
   `shakenDuration` vì thanh mới vẫn còn. `UnitLoadout.rank` (Levy/Regular/Elite) và
   `CommandNode.rank` nâng tier, lấy tier CAO NHẤT nên cấp thấp vỡ trước mà không kéo Elite
   xuống. `SectorReport.power` phải nhân `CombatReadiness`; nếu không chỉ huy vẫn tưởng tuyến
   đang tháo chạy đủ sức tổng tiến công. Bài test/dựng lại: **Bảng điều khiển › AI › AI Lab**.
4b-tuyen. **ĐI HAI TUYẾN — CHIA MỘT CÁNH LÊN ĐƯỜNG TRÊN** (`CommandDoctrine.useHighRoad` +
   `.highRoadHold`, `CommandNode.UpdateHighRoad`). Map sinh nào cũng có sẵn dải đất TẦNG 2 +
   cầu thang hai bên, và từng người lính đã biết leo (`RequestStairsIfNeeded`) — nhưng lính
   chỉ leo khi MỤC TIÊU ở trên hoặc khi bị tường chắn. Đánh một cái làng nằm dưới đất thì cả
   phe dồn vào MỘT LÀN và tuyến trên thành đồ trang trí. Đó là quyết định ĐÚNG của từng cá
   nhân (leo lên rồi xuống là đường vòng vô ích) nhưng SAI ở tầm đại cục.
   · **"Đi đường nào" là câu hỏi của NGƯỜI CHỈ HUY** nên nó nằm ở tầng điều phối, và cách ra
     lệnh vẫn là **DỜI CỘT MỐC** chứ không `SetBehavior`: đặt mốc của một cánh lên ĐỈNH cầu
     thang thì `RequestStairsIfNeeded` của từng lính tự thấy "mục tiêu ở tầng khác" và tự leo.
     Không state mới, không pathfinding, không sửa một dòng nào trong `AIStates`.
   · ⚠ **PHẢI CÓ CAM KẾT** (`highRoadHold` 9s): mốc vừa dời lên là cánh đó rời tuyến, mà rời
     tuyến thì nhịp sau `SortSubordinatesByFront` xếp lại và có thể chọn cánh khác — đúng cặp
     "hai luật đúng kéo ngược nhau" §5c.
   · ⚠ **CHỈ Ở THẾ TẤN CÔNG**, và cánh đang làm DỰ BỊ / đang VỀ CỨU NHÀ thì nhường: hai lệnh
     đè nhau thì "nhà đang cháy" gấp hơn "vòng lên tầng trên". Giương CỜ HIỆU cũng tắt (dốc
     toàn quân một hướng).
   · Cầu thang phải nằm GIỮA quân mình và mốc tuyến — leo ngược ra sau là đi lạc. Map không
     có cầu thang thì `PickHighRoad` không tìm được gì và cả phe đánh một tuyến như cũ, nên
     bật sẵn ở `Doctrine_Balanced`/`Aggressive`/`MapAssault` là an toàn.
   · ⚠⚠ **QUÂN ÍT THÌ KHÔNG CHIA** (`HighRoadMinTroops` = 8, đo bằng `_report.alive`). Một
     toán bảy người mà tách một cánh lên mặt tường thì mũi chính còn bốn, và hai mũi lần lượt
     lao vào một đội hình đông hơn — người xem đọc ra đúng câu *"không tấn công tổng lực"*,
     mà mỗi cánh vẫn đang làm đúng phần việc của nó nên không có gì báo. Đây là §7b-dot
     (*"đừng chia cánh khi quân ít"*) áp cho tuyến trên.
     ⚠ Đếm QUÂN CÒN SỐNG, đừng đếm SỐ CÁNH: hai cánh mỗi cánh ba người vẫn chỉ là sáu người.

4b-kim. **GỌNG KÌM** (`CommandDoctrine.pincerDepth` + `.pincerHold`, `CommandNode.UpdatePincer`):
   một cánh nhận mốc nằm **QUÁ** mốc tuyến một quãng, nên nó lách qua tuyến địch rồi quay lại
   đánh ngược — địch bị kẹp giữa tuyến chính và gọng vòng.
   · **Đi xuyên qua được là điều kiện tiên quyết**, và dự án vốn có sẵn
     (`TeamMember._passThroughEnemies`): "vòng ra sau" trong game đi ngang là LÁCH QUA, không
     phải đi đường vòng. Không có nó thì cánh này chỉ dí vào lưng tuyến đầu của chính mình.
   · ⚠ **Cần ÍT NHẤT 3 CÁNH.** Cây có 2 cánh mà một cánh đi vòng thì tuyến chính chỉ còn một —
     đó không phải gọng kìm, đó là chia nhỏ quân trước mặt địch.
   · ⚠ Vẫn CAM KẾT (`pincerHold` 10s): cánh vòng sau lưng luôn là cánh "đứng xa địch nhất" ở
     nhịp quét kế, nên không chốt là mỗi nhịp lại chọn một cánh khác (§5c).
   · Bật ở `Doctrine_Balanced` (7) và `Doctrine_MapAssault` (8); tướng MÁU CHIẾN cố ý KHÔNG —
     dốc cả nắm đấm vào giữa là bản sắc của nó.

4b-yem. **RÚT LUI CÓ YỂM HỘ** (`CommandDoctrine.coveringRetreatTime`,
   `CommandNode.UpdateCoveringRetreat`): cánh nào đang RÚT thì cánh còn khoẻ đứng GẦN ĐỊCH
   NHẤT bị đổi stance sang `Hold` — đứng lại giữ chân thay vì rút theo.
   Trước đây vỡ trận là ai nấy chạy (`routCasualtyRatio` cho từng tổ, `AIStateRetreat` cho
   từng người): cả phe cùng quay lưng một lượt và địch chém sau gáy trọn vẹn. Một cánh đứng
   lại là thứ biến "vỡ trận" thành "rút lui", và nó KHÔNG đòi cơ chế mới nào — chỉ đổi stance
   của đúng một cánh.
   ⚠ **PHẢI CHẠY SAU MỌI BƯỚC CHIA LỆNH KHÁC**: nó đọc kết quả cuối cùng (cánh nào rốt cuộc
   mang stance Retreat) rồi mới sửa. Chạy trước là đọc lệnh của nhịp TRƯỚC.
   ⚠ Có cam kết: cánh yểm hộ vừa đứng lại thì cánh kia rút xa ra, nhịp sau "ai đang rút" đổi
   và lệnh yểm hộ nhảy sang cánh khác — nhấp nháy đúng §5c.

4b-vien. **XIN TIẾP VIỆN** (`CommandNode.NeedsHelp`): tổ nào thương vong chạm ngưỡng báo động
   (`routCasualtyRatio × 1.6` — còn sống hơn ngưỡng vỡ một quãng) thì **GIƠ TAY**, và
   `UpdateReserve` coi lời xin đó ngang một cánh thất thế.
   ⚠ Vì sao cần dù đã có `reserveCommitRatio`: `PowerRatio` là con số của cả sector, nó chỉ
   tụt đủ sâu KHI ĐÃ CHẾT gần hết — quân tiếp viện tới nơi thì cánh kia tan rồi, và người xem
   đọc ra "giữ dự bị để làm gì". Lời xin tới sớm hơn hẳn.

4b-dongbang. ⚠⚠⚠ **TẬP KẾT LÀ ĐÓNG BĂNG — VÀ ĐIỂM HỒI SINH LÀM NÓ KHÔNG BAO GIỜ XONG**
   (`CommandNode.Decide`, 2026-09-04 — *"AI đứng im quá trời"*, *"phe tấn công cũng đứng im"*).
   `_report.Spread` đo từ thằng LÙI NHẤT tới thằng XA NHẤT của cả cánh quân. Từ ngày MỌI màn
   đều có `RespawnDirector`, thằng lùi nhất gần như luôn là người **VỪA HỒI SINH** ở điểm hồi
   sinh. Đo ở `Demo_26_Raid`: điểm hồi sinh phe cướp x = −24, cái cổng x ≈ +6 ⇒ bề dày đội
   hình **~30** trong khi `regroupSpread` = **22**. Vòng lặp:
   `Attack → Spread > 22 → Regroup → ApplyToAgent gọi SetHoldingLine(true) → CẢ CÁNH QUÂN ĐỨNG
   IM → hết regroupTimeout 8 s → Attack đúng MỘT NHỊP → Regroup lại`. Cả trận đứng im 8 giây
   một lần, và vì hồi sinh không bao giờ ngừng nên **nó không bao giờ thoát**. Không lỗi nào
   báo — mọi hàm đều trả lời đúng câu nó được hỏi.
   Hai chốt: **đang chạm địch (hoặc vừa chạm trong `noContactTimeout`) thì KHÔNG tập kết** —
   lính đi sau cứ chạy thẳng vào chỗ đang đánh, đó mới là chiến trường; và `RegroupSpreadTuning`
   (×2) nới ngưỡng **lúc ĐỌC** vì `regroupSpread`/`regroupedSpread` đã bake vào mọi asset
   `CommandDoctrine` (bẫy "sửa bug bằng đổi mặc định").
   ⚠ Thêm nguồn đẻ quân ở XA tuyến (hồi sinh, viện binh, doanh trại) thì tự hỏi ngay: **bề dày
   đội hình của màn này có vượt `regroupSpread` không?**

4b-tuong. ⚠⚠⚠ **"AI CỨ TỤ TẬP Ở BỨC TƯỜNG THÀNH" — CỘT MỐC TUYẾN RƠI VÀO GIỮA KHỐI ĐÁ**
   (2026-09-04). Hai vế, và cả hai đều là hệ quả của việc cho tường nhường làn:

   · **Mốc BÁM THEO ĐỊCH.** Thế `Attack` mà không bật `pushToEnemyBase` lấy mốc là *"áp sâu hơn
     TIỀN TUYẾN ĐỊCH"* (`_enemyFrontX + forward × pushDepth`) — tức nó bám theo chỗ địch đang
     đứng. Toán cướp dừng ở bức tường thì cả làng cũng dồn ra bức tường; tường lại cho đi xuyên
     nên hai bên **lồng vào nhau thành một cục ở đúng một toạ độ**. Không lỗi nào báo: đi tới
     một điểm nằm trong khối cho-đi-xuyên là hợp lệ.
     → `CommandNode.PushOutOfWalls` đẩy mốc ra MẶT GẦN của công trình theo hướng nhà mình. Áp
     cho cả CỔNG: đứng TRƯỚC cổng mà giữ, không đứng trong ô cửa.
   · **Phe THỦ không nên bám theo địch.** Tuyến thủ phải là một chỗ CỐ ĐỊNH — thế `Defend` lấy
     `_homeX + forward × defenseDepth`. `Demo_26_Raid` truyền `hallX − gateX` nên tuyến thủ rơi
     ĐÚNG CÁI CỔNG: nút cổ chai thật của màn, có cánh cửa đóng mở, có máu, và là thứ HUD đang
     đếm. `attackRatio` nâng lên 1.35 để cán cân ngang thì ra `Defend` chứ không ra `Attack`.
   ⚠ `Defend` KHÔNG đóng băng (chỉ `Hold`/`Regroup` mới khoá chân — §4e), nên đây không phải
   quay lại lỗi "hàng tượng" của §4b-hold.
   ⚠ Bài học chung: **mốc của phe CÔNG bám theo địch là đúng; mốc của phe THỦ thì phải neo vào
   thứ mình đang giữ.** Cho cả hai cùng bám theo nhau là hai đạo quân dính vào nhau ở một điểm.

4b-vekhi. ⚠⚠ **BA LUẬT CÙNG KÉO QUÂN VỀ HẬU CỨ — `Doctrine_Defensive` KHÔNG DÙNG ĐƯỢC CHO
   MÀN THỦ CÓ TUYẾN** (2026-09-04, báo *"AI bảo vệ nhà hơi đông"*). Bộ đó giữ **HAI cánh** ở
   phía sau cùng lúc và còn khoá cả việc dâng lên:

   | Số | Nghĩa |
   |---|---|
   | `keepReserve = true` | một cánh DỰ BỊ đứng hậu cứ |
   | `homeDefenseRadius = 12` | một cánh nữa TÁCH RA về canh nhà |
   | `attackRatio = 1.5` | phải mạnh gấp rưỡi mới dám đánh — mà hai phe vốn cân sức |

   Ba cái cộng lại: phần lớn dân binh đứng ở dãy nhà tới hết trận. Không lỗi nào báo, mỗi luật
   đều làm đúng việc của nó. `Demo_26_Raid` nay dùng `Doctrine_VillageHold` riêng: tắt cả hai
   van kéo về hậu cứ, `attackRatio = 1`, và `pushToEnemyBase = false` để vẫn là THỦ (mốc tuyến
   lúc Attack là *"áp sâu hơn tiền tuyến địch"* = đúng chỗ cái cổng).
   ⚠ Vế *"địch lọt vào trong làng thì lùi về giữ nhà"* KHÔNG mất — nó nằm ở
   `VillageRaid.DecideCampaign`, tức chỉ bật khi CÓ THẬT, chứ không phải một cánh nằm chờ sẵn
   suốt trận. **Phòng thủ là PHẢN ỨNG, không phải một khoản quân đặt cọc.**
   ⚠ Phe TẤN CÔNG thì `homeDefenseRadius = 0`: cái trại chỉ là chỗ ra quân, không có gì để giữ.
   ⚠ Đừng sửa thẳng `Doctrine_Defensive` — nó còn dùng ở màn hộ tống, thủ trại và bộ AI
   `Defense` của hệ playbook.

4b-hold. ⚠⚠ **`CampaignIntent.Hold` LÀ ĐÓNG BĂNG, KHÔNG PHẢI "PHÒNG THỦ".**
   `CommandNode.ApplyToAgent` dịch `Hold`/`Regroup` ra `SetHoldingLine(true)` = KHOÁ CHÂN.
   `VillageRaid.DecideCampaign` từng trả `Hold` cho phe làng với ý *"giữ tuyến ở cổng, đừng
   dâng ra ngoài"* — ý đúng, kết quả là một **HÀNG TƯỢNG đứng trước dãy nhà** trong khi toán
   cướp đập cổng cách đó vài bước. Nay trả `Auto`: học thuyết THỦ không bật `pushToEnemyBase`
   nên mốc tuyến lúc Attack là *"áp sâu hơn tiền tuyến địch"* — đúng chỗ cái cổng. Làng vẫn
   giữ làng, chỉ khác là họ RA GẶP địch. Vế `Fallback` khi địch đã lọt vào trong giữ nguyên.
   ⚠ Muốn "đứng yên tại chỗ" thật thì đó là `AIBehavior.Garrison` hoặc `GuardTarget`, không
   phải một thế trận của cả cánh quân.

4b-hold-cay. ⚠⚠⚠ **VÀ BÀI HỌC §4b-hold MỚI ÁP CHO TẦNG MODE — TẦNG CÂY CHỈ HUY CÒN NGUYÊN**
   (2026-09-04, người dùng báo *"AI đứng chụm lại một chỗ nên dễ bị địch đánh chết, ngoài ra
   không tấn công tổng lực, cứ đứng im"* — BA triệu chứng, MỘT gốc).

   `DecideAsCommander` chấm cán cân rồi trả `Hold` cho cả một dải `ratio`. Mà `Hold` đi qua
   `ApplyToAgent` → `SetHoldingLine(true)`, và cờ đó làm **ba việc cùng lúc** — đây là chỗ
   ba triệu chứng gặp nhau:

   | `HoldingLine` bật thì | Người dùng nhìn ra |
   |---|---|
   | `AIStateGuard` nhánh 4 gọi `Locomotion.Stop()` | *"cứ đứng im"* |
   | `ShouldHuntAlone` tắt (không tự đi tìm địch) | *"không tấn công tổng lực"* |
   | `SeparationPriority` lên bậc 2 — **không ai xô được** | *"đứng chụm lại một chỗ"* |

   **ĐO ĐƯỢC** (`attackAt = attackRatio / aggression`, `holdAt = holdRatio / aggression`):

   | Học thuyết | dải ra `Hold` | nghĩa thật |
   |---|---|---|
   | **`Doctrine_Balanced`** (MẶC ĐỊNH của phần lớn màn) | **[0.85 .. 1.10)** | **ôm trọn cán cân 1.0 của hai đạo quân NGANG CƠ** |
   | `Doctrine_Defensive` | [1.25 .. 1.88) | đang **MẠNH HƠN** địch thì đứng yên (!) |
   | `Doctrine_Aggressive` · `MapAssault` | [0.52..0.70) · [0.48..0.68) | |
   | `Doctrine_Raid` · `VillageHold` | *(không bao giờ)* | đã vá tay bằng `attackRatio == holdRatio` |

   ⚠⚠ **CẢ HAI PHE CÙNG CHẠY MỘT LUẬT, NÊN CẢ HAI CÙNG ĐỨNG IM.** Hai đạo quân ngang sức thì
   `ratio` của cả hai đều quanh 1.0 ⇒ cả hai cùng rơi vào dải `Hold` ⇒ hai hàng người đứng
   nhìn nhau. Không lỗi nào báo: mọi hàm đều chấm đúng công thức của nó.

   ⚠ Hai học thuyết cuối bảng CHÍNH LÀ triệu chứng của việc chữa sai chỗ: chúng được vá tay
   ở tầng DỮ LIỆU (đặt `attackRatio == holdRatio` để nhánh `Attack` ăn trước) khi màn cướp
   làng bị báo lỗi. Vá vậy chỉ cứu được đúng hai asset — cái thứ ba gõ tay ngày mai lại dính.

   **Chốt, ở đúng nguồn (`CommandNode`):** *"giữ tuyến chờ địch tới"* chỉ có nghĩa khi **địch
   chưa tới**. Đã giáp lá cà thì nửa vời là chết — đứng chịu đòn không làm cán cân khá lên,
   nó chỉ làm cán cân tệ đi mỗi giây, tức thế trận **tự nuôi chính nó** (ratio tụt → càng giữ
   `Hold` → càng tụt).
   · `DecideAsCommander`: `ratio >= holdAt` → `IsFighting ? Attack : Hold`;
   · `DecideAsSubordinate`: tổ yếu tự hạ thế → `IsFighting ? Defend : Hold` — **đang bị áp đảo
     là lúc TỆ NHẤT để đứng chôn chân**; lùi về mốc phòng thủ thì vẫn đi lại và đánh trả được;
   · `orderCooldown` **miễn cho đường THOÁT khỏi đóng băng** (đi VÀO thì vẫn phải chờ): địch
     xông tới đúng lúc vừa đổi sang `Hold` thì ba giây cooldown là đủ mất mấy mạng.

   ⚠⚠ **`IsFighting` PHẢI CÓ NGƯỠNG RIÊNG (`EngagedMemory` = 4s), TUYỆT ĐỐI KHÔNG MƯỢN
   `noContactTimeout`.** Đã suýt dính: van chống bế tắc ngay phía trên ép `Attack` khi
   `t > noContactTimeout`, nên nếu phép đo này CŨNG dùng `noContactTimeout` thì hai nhánh
   **phủ kín trục thời gian** và thế `Hold` không bao giờ xảy ra nữa — xoá sổ một thế trận mà
   đọc code vào vẫn tưởng nó còn dùng được. Hai câu hỏi khác nhau: TẬP KẾT hỏi *"cả khu vực
   có đang trong trận không"* (ngưỡng RỘNG), ĐÓNG BĂNG hỏi *"ngay lúc này địch có ở trước mặt
   không"* (ngưỡng HẸP). Cùng họ với §2b-cong-bis: **thêm một câu hỏi mới thì thêm một phép
   đo mới**, đừng mượn cái đang có vì "nó cũng đang đúng".

   ⚠ **LỆNH TAY KHÔNG BỊ ĐỤNG**: `_manualLocked` `return` ở đầu `DecideAsCommander`, nên tới
   được nhánh cán cân nghĩa là MÁY tự quyết. Người chơi bấm «GIỮ TUYẾN» vẫn đóng băng thật.

   ⚠ **Kiểm bằng số, không bằng mắt** — mô phỏng `DecideAsCommander` theo trục thời gian kể
   từ lần chạm địch cuối: sau khi sửa, **không học thuyết nào còn đóng băng lúc đang giao
   chiến**, mà thế `Hold` **vẫn còn dải sống** khi chưa giao chiến (Balanced [4..6]s,
   Defensive [4..12]s) — tức không tính năng nào bị xoá.

   ⚠ **KHÔNG phải dựng lại scene nào** (thuần code runtime, không bake số nào). Nhưng
   `CommandNode.cs` nằm trong `extraSources` của job *Demo_8 — Phòng thí nghiệm AI*, nên mục
   đó sẽ chuyển **VÀNG** trên ★ Bảng điều khiển — bấm lại vô hại, không bấm cũng không sai.

4c. **NHỊP XUẤT QUÂN** (`CommandDoctrine.sortieInterval` > 0, dùng cho mode Doanh trại):
   tướng chủ động TỔNG TẤN CÔNG `sortieDuration` giây rồi RÚT VỀ PHÒNG THỦ chờ đợt sau
   (quân mới kịp ra lò + ra xưởng lấy vũ khí) — ghi đè luật cán cân trừ khi thua thảm
   (ratio < retreatRatio thì vẫn rút lui). Lệnh tay (nút HUD) vẫn thắng tất.
   ⚠ **`sortieDuration` PHẢI ĐỦ ĐỂ HÀNH QUÂN HẾT QUÃNG ĐƯỜNG rồi mới đánh** — quãng 2 nhà
   44 unit, lính chạy ~3 unit/s = ~15s; để 12s là quân vừa tới nơi đã có lệnh rút, đúng
   triệu chứng "qua đánh một xíu rồi về" (đã dính 1 lần). Kèm đó `regroupSpread` phải rộng
   hơn cả quãng hành quân, không thì cả phe kẹt TẬP KẾT giữa đường.
4d. **SAN PHẲNG TRẠI ĐỊCH** — ba thứ phải ĐỦ CẢ BA, thiếu một là không ai đập nhà:
   · `CommandDoctrine.pushToEnemyBase` — mốc tiến quân lúc Attack là NHÀ ĐỊCH, không phải
   "áp sâu hơn tiền tuyến địch" (`pushDepth`) vốn làm quân dừng ngay chỗ gặp địch;
   · `AIProfile.structureTargetBonus` **DƯƠNG** (mặc định game là −6 = né công trình);
   · `SelectBestEnemy` nhận diện công trình bằng "**không phải `StickmanFighterController`**"
   chứ KHÔNG liệt kê class (`BaseBuilding` không kế thừa `DestructibleTarget` — liệt kê là
   bỏ sót đúng cái nhà chính), và **miễn luật chia mục tiêu cho công trình**
   (`targetSpreadPenalty`/`maxAttackersPerTarget`): nhà to, đứng yên, cả tiểu đội xúm vào
   đập được — áp như với một người thì đứa thứ 4 bị đuổi đi và nhà không bao giờ sập.
4e. **`HoldingLine` chỉ khoá chân khi GIỮ TUYẾN / TẬP KẾT**, KHÔNG khoá khi PHÒNG THỦ:
   quân đã về tới doanh trại mà bắt đứng như tượng là mất hẳn cảm giác lính gác đi tuần
   (`AIStateGuard.PatrolAtPost` bị chặn). Bán kính tuần kẹp theo **`guardSpacing × 0.45`**
   (hai chỗ gác cạnh nhau không lấn nhau) — đừng kẹp thêm theo `guardFollowDistance`, nó
   không liên quan mà kéo bán kính xuống ~0.4 nên nhìn như đứng im (đã dính 1 lần).
   ⚠ Cây chỉ huy KHÔNG BẮT LÍNH dân sự: `CollectAgents`/`RefreshMembers` lọc qua
   `StickmanAgent.IsCombatant` (Work/Flee/Fetch không phải quân nhân) — bỏ filter là
   thợ đang đốn cây bị lệnh tổng tiến công lôi ra tiền tuyến.
5. **Số tuning nằm trong asset `CommandDoctrine`** (Create > Stickman > Command Doctrine):
   ngưỡng cán cân lực lượng cho Attack/Hold/Defend/Retreat, `aggression`, chống bế tắc
   (`noContactTimeout`), tập trung hoả lực, quyền tự quyết của cấp dưới. Cấp dưới chỉ được
   NHÁT HƠN lệnh trên, không được liều hơn.
6. **Soi bằng phím F9** (`CommandHierarchyHud`): cả cây + thế trận + state/mục tiêu/vũ khí
   từng lính. Đây là chỗ đầu tiên nhìn khi "2 phe không chịu đánh nhau".
   ⚠⚠ **DẤU HIỆU VƯỢT TẦNG** (2026-09-04): `↑thang` đang đi tới một cái thang để vượt tầng ·
   `↑bậc` đang đi lối cầu thang · `⇅bỏ-tầng` đã bỏ cả tầng vì không tìm ra lối lên.
   Vì sao phải có: mọi vòng lặp của hệ vượt tầng đều **VÔ HÌNH** với người xem — nhìn vào chỉ
   thấy một anh lính đi qua đi lại trước bức tường. Không có dấu trên bảng thì mỗi lần báo lỗi
   lại phải ĐOÁN xem nó đang giằng giữa hai luật nào, và đoán sai vài lượt là chuyện đã xảy ra.
   **Thêm một cơ chế lái chân nhân vật thì thêm luôn một dấu ở đây.**
   ⚠️ `regroupSpread`/`regroupedSpread` phải RỘNG HƠN bề dày đội hình tự nhiên, không thì cả phe
   kẹt ở TẬP KẾT vĩnh viễn và không bao giờ đánh (đã dính 1 lần ở Demo_3).


---

## ⚠⚠ NGOẠI LỆ THỨ BA CỦA LỆNH TUYẾN — `StickmanAgent.KeepsOwnOrders` (2026-09-05)

`CommandNode.ApplyToAgent` ghi đè `SetBehavior` **mỗi nhịp**, nên bất kỳ nhiệm vụ NHIỀU PHA
nào của một tầng khác đều bị lôi đi giữa chừng — và hỏng TRONG IM LẶNG (nhìn vào chỉ thấy một
anh lính bỏ việc). Hai ngoại lệ cũ là `AIBehavior.Garrison` và `AIBehavior.Escalade`.

Cái thứ ba khác ở chỗ nó là **TRẠNG THÁI đổi được lúc chạy** (hôm nay canh nhà, mai ra trận)
chứ không phải một giá trị `AIBehavior` cố định, nên nó là một CỜ trên chính agent —
`SetKeepsOwnOrders(bool)`. Nhờ vậy `CommandNode` không phải `GetComponent` mỗi nhịp.

Cờ này còn tắt luôn `SetHoldingLine`: `HoldingLine` nâng bậc giãn cách lên 2 và tắt việc tự đi
tìm địch, áp cho một người đang đi tuần là cả tổ canh nhà đứng chôn chân mỗi lần tướng hô
«giữ tuyến».

`MatchModeBase.ApplyOrders` miễn trừ theo CÙNG cờ đó — tầng MODE cũng ghi đè behavior mỗi 2
giây, chỉ chữa một tầng là bên kia vẫn kéo người đi.

⚠ Người NHẬN cờ vẫn nghe gợi ý mục tiêu (`SuggestTarget` nằm ngoài khối `if`) — giống quân đồn
trú: không bị dời CHỖ ĐỨNG, nhưng vẫn nghe "tập trung bắn thằng kia".

⚠ Ai bật cờ thì phải có đường TẮT ở mọi lối ra (`OnDisable`, người chơi đổi lệnh, chết). Cờ còn
bật mà chủ của nó biến mất là người đó **không bao giờ nhận lệnh tuyến nữa**, không lỗi nào báo.
Chủ hiện tại: `CampHomeGuard` · `CampUnitOrderHud` (lệnh «theo tôi») của mode kinh tế doanh trại.

---

## ⚠⚠ THANG QUYỀN RA LỆNH — ba tầng chỉ huy đi CHUNG MỘT CỬA (2026-09-16)

User: *"3 tầng AI 4·5·6 đang chồng chéo và gây lỗi, thống nhất nó lại với nhau"*.

Code: `Assets/Scripts/AI/Agent/StickmanAgent.Orders.cs` · cổng ở `CommandNode.ApplyToAgent` ·
lời khai của state ở `AIState.OwnsItsOrders`. Đo: Doctor › «Thang quyền ra lệnh».

**Mục ngay trên đã hết hiệu lực một nửa.** Nó mô tả *ngoại lệ thứ ba*; vấn đề là mỗi ngoại lệ
mới lại là một cơ chế mới. Ba tầng cùng ghi vào đúng một ô `SetBehavior(behavior, objective)`:

| Tầng | Ai | Nhịp ghi |
|---|---|---|
| 4 ĐIỀU PHỐI | `CommandNode.ApplyToAgent` | mỗi `thinkInterval` (0.5 s) |
| 5 ĐẠO DIỄN | mode · spawner · map script · thuyền đổ bộ | mỗi mode một nhịp riêng |
| 6 CHIẾN DỊCH | `ThreeKingdomsDuel` · `CampaignBattleMode` | lúc lôi người ra khỏi trận |

Việc phân xử từng là **ba cơ chế rời nhau**, không cái nào trả lời được câu *"ai đang chỉ huy
người này"*: ① cờ trần `KeepsOwnOrders` (một bit, **không danh tính chủ, không đường trả**);
② hai giá trị enum chép tay trong `ApplyToAgent`; ③ một điều CẤM trong tài liệu (*"đừng nhét
`TeamCommander` vào màn kịch bản"*) — luật sống trong văn bản thì không phép đo nào bắt được.

**Số đo lúc hợp nhất: 55 file gọi `SetBehavior`, chỉ 13 file khai chủ** ⇒ 42 file ra lệnh mà
cây chỉ huy được phép ghi đè hai lần mỗi giây, và không một dòng log nào.

**Nay: một PHIẾU GIỮ QUYỀN `(chủ · cấp · hạn)`.**

```
Commander 10  tầng 4 — chỉ HỎI (`CanOrder`), cố ý KHÔNG giữ phiếu
Director  20  tầng 5+6 — gộp một cấp, vì trong một trận chúng làm đúng cùng một việc
Player    30  lệnh tay, thắng tất cả
```

- **Ngang cấp không cướp được** — hai đạo diễn giật một người lính thì người đó bị kéo qua kéo
  lại mỗi nhịp, đúng họ "máy rung" ở [AI-Command §5b](../KnowledgeBase/AI-Command.md).
- **Tầng 4 không giữ phiếu** là CỐ Ý: giữ thì một người lính được chuyển sang cánh khác
  (`Enlist` · `CommandStructure.Attach` · cấp phó lên thay) sẽ bị phiếu của node CŨ khoá ra
  ngoài — đổi một lỗi im lặng lấy một lỗi im lặng khác.
- **Nhiệm vụ nhiều pha TỰ KHAI** (`AIState.OwnsItsOrders`, cùng khuôn `OwnsTraversal`) thay cho
  danh sách chép tay. Thêm state nhiều pha mới **không phải sửa file ở tầng chỉ huy** nữa.

⚠⚠ **PHIẾU TỰ HẾT THEO BA ĐƯỜNG** — đây là cả lý do nó tồn tại: chủ bị `Destroy` · chủ là
`Behaviour` đã tắt · hết hạn giờ. Cả lớp lỗi *"chủ cũ bỏ đi mà lính bị khoá tới hết trận"*
(`TroopTransport` dính **hai lần**) biến mất mà không ai phải nhớ gọi nhả.

⚠ Ngoại lệ của ngoại lệ: phiếu do `SetKeepsOwnOrders(true)` đặt có chủ là **chính agent**, nên
KHÔNG áp luật "chủ tắt thì nhả" — lính bị `SetActive(false)` rồi bật lại (pool hồi sinh, đổi
vùng AI Lab, dọn xác cuối đợt) không phải bằng chứng là chủ đã bỏ đi.

⚠ `KeepsOwnOrders` nay là số ĐO RA từ phiếu, và **cố ý không tính** vế `OwnsItsOrders`: cờ này
có ~38 chỗ đọc sẵn (thuyền đổ bộ, dây xích đội hình, đơn đấu), đổi nghĩa của nó là đổi hành vi
cả 38 chỗ trong một lượt sửa vốn chỉ định hợp nhất cơ chế. Ai cần vế kia thì hỏi `CanOrder`.

**Code mới giao việc nhiều pha thì viết thế này**, đừng dùng `SetKeepsOwnOrders`:

```csharp
if (agent.TryTakeOrders(this, OrderAuthority.Director))
    agent.SetBehavior(AIBehavior.March, _goal);
...
agent.ReleaseOrders(this);   // hoặc để phiếu tự hết khi component này bị huỷ/tắt
```

⚠ Phép đo **chỉ đòi đường trả với cờ VÔ DANH**. `TryTakeOrders` khai chủ thật nên đã có đường
trả tự động — bắt nó viết tay `ReleaseOrders` là đòi làm bằng tay đúng cái vừa tự động hoá, và
dòng đỏ đó sẽ không bao giờ xoá được ([bẫy «dòng vàng không ai xoá nổi»](FileSize.md)).

⚠ Và phép đo **đọc theo dòng, bỏ chú thích**: bản đầu quét cả file bằng `Contains` nên đỏ 7 file,
trong đó 5 là dương tính giả — ba file chỉ NHẮC TÊN hàm trong chú thích cảnh báo. Một phép đo
trừng phạt tài liệu tốt là một phép đo người ta học cách tắt đi.

---

## ⚠⚠ MỘT CÁNH QUÂN — MỘT VIỆC (2026-09-16)

Code: `CommandNode.WingJob` · `ResetWingClaims` · `TryClaimWing`.

Sau `DistributeToChildren`, **tám cơ chế** lần lượt ghi đè lệnh của một cánh nào đó: dự bị ·
cứu nhà · đường trên · đường hầm · gọng kìm · vòng sau lưng · giữ hậu · yểm hộ rút. Trước đợt
này mỗi cơ chế tự tránh các cơ chế khác bằng một danh sách **so đôi chép tay** — và bảng đó
không đối xứng. Đo ra **bốn ô trống có thật**:

| Bộ chọn | Thiếu | Hậu quả |
|---|---|---|
| `PickPincerWing` | `_lowRoad` | gọng kìm cướp đúng cánh đang đi trong hầm |
| `PickWrapWing` | `_lowRoad`, `_homeGuard` | cánh vừa được gọi **về cứu nhà** bị lôi đi vòng sau lưng địch |
| `PickRearGuard` | `_highRoad`, `_lowRoad` | tổ giữ hậu bốc mất cánh đang leo tầng trên |
| `UpdateHighRoad` | `_homeGuard` | chú thích ghi rõ *"dự bị / VỀ CỨU NHÀ thì nhường"* — **vế thứ hai chưa bao giờ được viết** |

⚠⚠ **Hỏng CÂM, không phải hỏng ồn.** Cơ chế chạy SAU thắng (nó ghi `_order` sau), nhưng cơ chế
chạy TRƯỚC vẫn giữ nguyên cờ bám và đồng hồ cam kết của nó — vẫn tin là mình đang điều một cánh
quân, trong khi cánh đó đi chỗ khác. Nhìn ra chỉ là *"cái hầm / gọng kìm không bao giờ chạy"*.

Nay: **một phiếu, đặt lại đầu mỗi nhịp**, giành theo đúng thứ tự pipeline. Cơ chế thứ chín chỉ
cần gọi `TryClaimWing`, không phải đọc tám cái trước.

⚠ Phiếu sống đúng MỘT nhịp — cam kết dài hạn vẫn nằm ở đồng hồ riêng (`lowRoadHold`,
`pincerHold`…), nên mỗi cơ chế tự giành lại phiếu của mình mỗi nhịp. Giữ phiếu qua nhiều nhịp
thì một cánh chết sẽ mang phiếu xuống mồ — đúng lớp lỗi vừa phải chữa ở tầng dưới.

⚠⚠ **Mất phiếu thì phải BỎ CỜ BÁM, không được chỉ `return`.** Giữ cờ là cơ chế đó tự khoá mình
vĩnh viễn vào một cánh nó không bao giờ điều được — đổi một lỗi im lặng lấy một lỗi im lặng
khác. Bỏ cờ thì nhịp sau nó tự chọn một cánh RẢNH và chạy tiếp.

⚠ **Một ngoại lệ được cướp phiếu:** nhà đang mất máu thì CỨU NHÀ thắng cả quân dự bị — bộ chọn
cố ý cho lấy chính cánh dự bị trong ca đó (*"nhà tụt máu tức là dự bị đang KHÔNG cản nổi"*).
Không mở ngoại lệ là cơ chế cứu nhà tắt lặng ĐÚNG LÚC nhà đang bị phá. Yểm hộ rút lui **không
có ô phiếu**, cố ý: nó chạy cuối và ghi đè tất cả — cả phe đang tan thì cái hầm không còn nghĩa.

---

## ⚠⚠ ĐỘI HÌNH ĐI ≠ ĐỘI HÌNH ĐỨNG — `deployRange` (2026-09-16)

Code: `TeamCommander.UpdateDeployed` + nhánh trong `ChooseFormation` / `ChooseGroundShape`.
Đo: `python Docs/Tools/sim_deploy.py` · Doctor › «Kỷ luật đội hình» (mục `deployRange`).

Đội hình cũ hỏi *thế trận · ý đồ · số khiên · tỉ lệ địch bắn xa* — **không ai hỏi "quân đang
hành quân hay đang dàn trận"**. `MarchColumn` có sẵn nhưng CHỈ dùng lúc `Retreat`/`Regroup`:
dự án đã biết hình hành quân tồn tại mà chỉ dùng khi chạy trốn.

Nay: đang **Attack** mà địch gần nhất còn xa hơn `deployRange` → đi thành **cột**; vào trong
tầm đó → **TRIỂN KHAI** sang hình đánh. `deployRange = 0` = tắt (mặc định code; builder đặt
10–14 cho bộ chuẩn).

**Số đo (`sim_deploy.py`, 24 quân, dải đi lại 11):**

| | bề NGANG | bề SÂU |
|---|---|---|
| Hàng dọc | **1.30** | 24.15 |
| Ba lớp tuyến | 9.10 | 3.00 |

Cửa rộng 3.0: cột **0/24** người không lọt, tuyến **18/24**.

⚠⚠ **CHỈ SÂN 3/4.** Sân ngang chỉ có MỘT trục nên "cột" không hẹp hơn "tuyến" — nó **DÀI HƠN**:
24 quân xếp cột chiếm 19.2 đơn vị theo X, ba lớp tuyến chỉ chiếm ~6.3. Bật ở sân ngang là kéo
đạo quân dài gấp ba rồi gọi đó là "hành quân gọn". **Cột chỉ hẹp khi có trục thứ hai để mà hẹp.**

⚠⚠ **NGƯỠNG PHẢI TRÊN SÀN 8.5** (tầm nhìn 7 + nửa bề dày đội hình 1.5; với 40 quân là 8.9).
Đặt bằng tầm nhìn là dàn trận SAU khi tuyến đầu đã đánh nhau — cơ chế có đủ số, có đủ nhánh, mà
không bao giờ làm được việc của nó. **Đúng họ với bẫy `formationLeash == visionRange`.** Bản đầu
tôi đặt du kích 9 (biên 0.1 ở trận đông) và phép đo bắt được ⇒ nâng 10.

⚠ **Phải có SCHMITT TRIGGER**, dùng lại `stanceHysteresis` chứ đừng đẻ hằng số thứ hai: số đo
rung ±1.5 quanh ngưỡng cho **40 lần đổi hình / 40 nhịp** khi không quán tính, **0** khi có. Mỗi
lần đổi là 24 người đổi chỗ đứng cùng lúc.

⚠ Ở sân 3/4, luật hành quân phải đứng **TRƯỚC** tản khai · hạc dực · `FromKind`. Ba luật đó trả
lời câu *"dàn trận thế nào"*, chỉ có nghĩa khi đã dừng để dàn — mà "đông hơn → hạc dực" gần như
lúc nào cũng đúng ở đầu trận, nên để `FromKind` quyết ở cuối thì **cột không bao giờ được chọn**.

⚠ Và `MarchColumn` nay có HAI nghĩa (rút lui: gấp · đi đường: không gấp). Chỉ nghĩa thứ nhất
được vượt `formationChangeCooldown` — bỏ sót vế đó là mỗi lần bước qua ngưỡng, cả đạo quân đổi
hình NGAY trong khi chiều ngược lại vẫn phải chờ 2.5 s.

---

## ⚠⚠ QUÂN ÍT THÌ ĐỪNG DỰNG CÂY SÂU — "RA LỆNH TẤN CÔNG MÀ KHÔNG AI ĐI" (2026-09-05)

Hai thiết lập rất hợp lý ở trận 40 quân lại nuốt sạch lệnh của người chơi ở trận 5 quân:

* **`keepReserve = true`** — `UpdateReserve` GHI ĐÈ lệnh của một cánh SAU khi lệnh chung đã
  chia, **kể cả lệnh TAY của người chơi**. Ở mode kinh tế doanh trại quân được mua từng người,
  lúc bấm «Tấn công» thường mới có 3–5 lính, nên "một cánh dự bị" chính là PHẦN LỚN quân:
  người chơi bấm tấn công và nhìn cả đội đứng yên ở nhà. Không lỗi nào báo.
* **`commandStandoff > 0`** — biến mọi nút CÓ CẤP DƯỚI thành "chỉ huy đứng sau":
  `ApplyToAgent` phát `GuardTarget` thay vì `HuntTarget`. Cây 3 bậc / nhánh 3 thì một đội 6
  người có 2–3 "sĩ quan" như vậy ⇒ nửa đội không chịu xông lên.

Luật rút ra: **số bậc cây phải tương xứng với quân số của màn.** Màn mua quân từng người thì
dựng cây PHẲNG (`ranks: 2`, `branching: 12` — một sở chỉ huy nắm thẳng cả đội), `keepReserve
= false`, `commandStandoff = 0`. Xem `StickmanWarCampBuilder.EnsureWarDoctrine`.

## ⚠⚠ LỆNH TAY PHẢI THẮNG Ở CẢ CẤP DƯỚI — "BẤM TẤN CÔNG, LÍNH ĐỨNG NHÌN" (2026-09-08)

Người dùng báo ở War Camp: *"ra lệnh tấn công thì lính không tấn công"*. Gốc cây khoá
`Attack` đúng luật, nhưng BA tầng khác nhau cùng tự sửa lệnh đó, không lỗi nào báo:

* **Cấp dưới "nhát hơn lệnh trên" (`CommandNode.DecideAsSubordinate`)**: cây PHẲNG
  (`ranks: 2`) treo TỪNG LÍNH thẳng vào gốc, nên mỗi anh là một node cấp dưới tự đo
  `PowerRatio` trong KHU VỰC CỦA RIÊNG MÌNH với `subordinateAutonomy` mặc định 0.6. Một người
  gặp hai địch là ratio < `defendRatio` ⇒ `Hold` (đóng băng) / `Defend` (lùi về nhà). Luật này
  chỉ hợp lý với lệnh MÁY. Nay `CommandNode.UnderManualOrder` (đi lên chuỗi `_superior`, hỏi
  `_manualLocked`): có lệnh tay thì cấp dưới trả đúng `fromAbove`. Sĩ khí cá nhân
  (`AIProfile.morale*`) vẫn cho từng người bỏ chạy khi vỡ thật — cây chỉ huy không được tự
  sửa lệnh của người.
* **Mốc «về cứu nhà» của gốc (`_rescueUntil` trong `ComputeLineAnchor`)**: nhà tụt máu là
  gốc kéo cả tuyến về `guardX` ≥ 6 giây, và báo động nhà (`HomeAlarmSeconds` 10 s) được làm
  mới mỗi nhát cung / mỗi giây cháy — War Camp để nhà chính KHÔNG miễn tầm xa nên vế này gần
  như luôn bật. Nay mốc cứu nhà NHƯỜNG lệnh tay (`!_manualLocked`); người chơi có nút «Về
  thủ». Chia MỘT cánh về (`UpdateHomeDefense`) vẫn chạy — ở cây phẳng đó là một người.
* **Tổ canh nhà tự quyết (`CampHomeGuard.DecideTarget`, tầng Gameplay)**: vế răn đe rút
  `RivalShare` (40 %) quân địch về tuần tra với `KeepsOwnOrders = true` — địch GOM QUÂN 15
  người thì 6 lính của người chơi không bao giờ nghe lệnh tuyến. Nay có lệnh tay `Attack`
  (`TeamCommander.IsAuto == false && Stance == Attack`) thì bỏ vế răn đe, chỉ giữ mức yên
  bình + số kẻ đã lọt vào sân. Kèm: `SetTarget` (nút ±) TẮT `_autoDecide` — trước đây
  `Update` áp lại `DecideTarget()` mỗi 1,5 s nên nút ± chỉ sống đúng một nhịp.

Cùng gốc, triệu chứng thứ hai *"mua bộ binh mà ra cung thủ"*: lính bị đóng băng thì khoảng
cách tới địch không bao giờ rút ngắn ⇒ nhánh 4 của `AIWeaponSwapModule` rút cung ra sau hai
nhịp — xem AI.md (vế thứ tư «phải đang rảnh chân để đuổi»).

Luật rút ra: **mọi tầng tự sửa thế trận (cấp dưới · cứu nhà · tổ canh nhà · dự bị) phải hỏi
"có lệnh TAY không" trước** — cùng họ với `keepReserve`/`commandStandoff` ở mục trên và
`CampaignOrders.HumanTookTheWheel`. Thêm một tầng tự quyết mới thì thêm đúng câu hỏi đó.
Kiểm: War Camp, mua 5 lính, để địch gom quân, bấm «Tấn công» — F9 phải thấy mọi lính
`Attack`/`HuntTarget`, ô «Giữ nhà» không tự tăng theo quân địch, không ai đổi sang cung khi
đang đứng chờ.

## VÒNG SAU LƯNG · GIỮ HẬU (2026-09-07)

Hai cơ chế mới của cây chỉ huy, **chỉ chạy trên map vòng** (`MapWrap.IsActive`) và chỉ khi phe có
**≥ 3 cánh** — phe hai cánh mà chẻ một cánh đi vòng thì tuyến chính mỏng đi một nửa và thua ở mặt
trước trước khi ai kịp tới nơi.

### `AttackLane.Wrap` — cánh vòng sau lưng

Khác gọng kìm (`Pincer` đâm SÂU qua tuyến địch theo hướng tiến): cánh này đi **ngược hướng tiến**,
ra khỏi mép map, hiện lại ở mép kia, đổ vào sau lưng nhà địch.

⚠⚠ **Không được đưa thẳng toạ độ "sau lưng nhà địch" làm mốc.** Lính bám mốc bằng `MoveTowardsX`,
mà hàm đó lấy `Mathf.Sign(targetX - x)` — phép trừ THẲNG, không biết map vòng. Đưa điểm sau lưng
địch thì đường ngắn theo phép trừ ấy vẫn là **đâm thẳng qua tuyến địch**: cánh vòng biến thành mũi
húc chính diện, mất sạch ý đồ, không lỗi nào báo.

Nên mốc là một **CỦ CÀ RỐT**: mỗi nhịp đặt cách cánh quân `wrapFlankStep` về phía vòng, **KHÔNG
kéo về trong vòng** (`WrapX`) — để `targetX - x` giữ đúng dấu kể cả khi mốc nằm ngoài mép. Người đi
tới mép, `MapWrapZone` dời họ sang bên kia, nhịp sau củ cà rốt tính lại từ chỗ mới. Khi đường ngắn
tới đích ĐÃ ĐỔI CHIỀU sang phía đang vòng ⇒ đã qua nửa vòng ⇒ bám thẳng vào đích.

Đo bằng mô phỏng: hai trại cách 40 trên vòng 92, cánh vòng tới sau lưng địch sau **9.5 giây**, qua
mép đúng **1 lần**. `focusTarget` để null trong lúc đang vòng — bu vào mục tiêu chung là quay đầu.

### Tổ giữ hậu (`rearGuardDepth`)

Cả hệ cũ chỉ biết MỘT hướng: `CommandStance.Defend` cho mốc `_homeX + _forward * defenseDepth`, tức
**toàn phe quay mặt về một phía**. Một cánh địch vòng qua mép đập nhà từ phía sau thì không ai thấy
cho tới lúc nhà mất máu. `UpdateHomeDefense` có phản ứng nhưng đó là chữa cháy (kéo quân từ tiền
tuyến về, mất hàng chục giây đường); tổ giữ hậu là ĐỀ PHÒNG — đứng sẵn ở `MapWrap.Behind(homeX,
forward, rearGuardDepth)`.

### Số mới trong `CommandDoctrine`

| Trường | Mặc định | Ý |
|---|---|---|
| `wrapFlankDepth` | 6 | nhắm sâu quá nhà địch bấy nhiêu. **0 = tắt cánh vòng** |
| `wrapFlankStep` | 14 | bước củ cà rốt mỗi nhịp |
| `wrapFlankHold` | 16 | giữ cánh đã chọn (đi nửa vòng rất lâu — đổi ý giữa đường là cánh đó không bao giờ tới nơi) |
| `rearGuardDepth` | 5 | tổ giữ hậu đứng sau nhà bấy nhiêu. 0 = không cắt tổ |

## ⚠⚠ ĐỘI HÌNH SÂN 3/4 — HÌNH THẬT, HAI CÁCH RA LỆNH (2026-09-12)

`Assets/Scripts/AI/Command/GroundFormation.cs` · `TeamCommander.Ground.cs` ·
`Assets/Scripts/Map/Match/FormationHud.cs` · đo bằng `Docs/Tools/sim_groundformation.py`.

Nguyên văn yêu cầu: *"trong chế độ 3/4 tôi muốn AI biết xếp đội hình: có 2 mode — 1 là tôi kêu
AI lập đội hình theo chỉ định, 2 là 1 AI tướng khác điều phối lập thành đội hình"*.

Bảy hình (hàng ngang · hàng dọc · mũi nêm · hạc dực · ô vuông · vòng tròn · tản khai) và bảng
"ăn tiền khi nào" nằm ở `Docs/KnowledgeBase/AI-Command.md` § *Đội hình SÂN 3/4*. Ở đây chỉ ghi
những chỗ **hỏng trong im lặng**.

### Một chỗ đứng chỉ có MỘT chủ

Ba hệ cùng muốn trải quân quanh một mốc: slot đội hình (mới), `StickmanAgent.StationAt` (khe
tự bốc), và `CommandNode.DistributeToChildren` (chia theo cây). Cộng hai cái bất kỳ là hình vỡ
— đo được: khoảng cách gần nhất **1.30 → 0.35**, tức hàng ngang vừa dàn ra lại thành từng cụm
chồng nhau, và **không lỗi nào báo** vì cả ba đều đang làm đúng phần việc của mình.

Luật: có slot đội hình thì `SetFormationStationed(true)` ⇒ `StationAt` **trả nguyên mốc**, và
`DistributeToChildren` phát **cùng một tâm tuyến** cho mọi node con (vế này đã có từ bản sân
ngang). Thêm bất kỳ phép trải thứ tư nào cũng phải đi qua đúng hai cửa đó.

### ⚠⚠ KHÔNG `Clamp` TỪNG NGƯỜI VÀO MÉP SÂN

`Mathf.Clamp` từng chỗ đứng là phép chiếu MẤT MÁT: nhiều toạ độ khác nhau cho ra cùng một mép,
và cả cánh quân **hàn thành một cục** ngay tại vạch — đúng lỗi `SafeX` đã gây một lần
(`MapSystem.md`). `GroundFormation.FitToBand` **dịch tâm trước, ép tỉ lệ sau**.

Và ép tỉ lệ cũng có trần: hạc dực 24 quân trên sân `halfDepth 5.5` phải ép còn 35 % ⇒ hai người
cách nhau **0.48** (ngưỡng chồng người `separationRadius` = 0.7). Nên khi ép xong mà vẫn chật,
bộ giải **ĐỔI sang hàng ngang** — hình duy nhất biết gấp xuống tuyến sau thay vì nở rộng ra —
và trả về `applied` để bảng lệnh in ĐÚNG hình đang dàn. Đổi hình trong im lặng thì bảng ghi
«hạc dực» còn sân bày ra một tuyến thẳng, và người chơi kết luận nút hỏng.

### Chiều sâu là TUYỆT ĐỐI, lấy theo CỘT MỐC

`FormationSlot.depth` là toạ độ Y thật, không phải độ lệch cộng vào anchor. Cộng dồn thì hình
bám theo chỗ ông chỉ huy đang đứng — mà ông ta vừa đi vừa né, nên cả tuyến 24 người **trôi
ngang** theo từng nhịp nghĩ (0.75 s một lần). Tâm lấy từ `FormationCenterDepth()`: căn cứ địch
khi tiến, nhà mình khi thủ — ghế Chỉ huy dời cột mốc tập kết là dời luôn đội hình.

### Đổi hình phải có KHOÁ CHỜ

Phép chọn hình đọc quân số hai bên; ngay tại ngưỡng `groundCraneWingRatio` một cái chết là đủ
lật qua lật lại hạc dực ↔ hàng ngang mỗi 0.75 s. Dùng chung `formationChangeCooldown` với sân
ngang (`HoldShape`). **Ba trường hợp không được chờ**: lệnh rút (hàng dọc), thả rông, và người
chơi vừa bấm chỉ định — bấm nút mà hai giây sau mới đổi thì nhìn như nút hỏng.

### Sân ngang không đổi một dòng nào

Mọi nhánh mới thoát ngay khi `!WorldPlane.IsGround`, và `RefreshFormation` **tách hẳn hai
nhánh** chứ không dùng nhánh cũ làm dự phòng: bộ giải 2D trả `false` khi hình là *thả rông*, mà
rơi xuống bộ 1D lúc đó là phát ra một tuyến ba lớp đúng vào lúc vừa ra lệnh bỏ đội hình.

### Phép đo

Bảng khám «Đội hình sân 3/4» (`StickmanDoctor.GroundFormation.cs`) gọi thẳng
`GroundFormation.BuildOffsets` — **hình học thuần**, không cần Play, không cần agent:

1. **chồng người** — 7 hình × 5 cỡ đội quân × 3 bề sâu sân, ngưỡng 0.7;
2. **chữ ký hình** — hàng ngang phải rộng hơn sâu, hàng dọc ngược lại, mũi nêm có tương quan
   ÂM giữa «ra biên» và «tiến lên», hạc dực DƯƠNG, ô vuông/vòng tròn phải có tầm xa nằm TRONG
   vành. Thiếu vế này thì một hệ số chỉnh "cho đẹp" biến bảy nút thành ba hình;
3. **hình không ai bấm được** — giá trị enum thiếu trong `GroundFormation.All` (bảng lệnh
   không mọc nút) hoặc `FromKind` (tướng máy không bao giờ chọn);
4. **map có đủ bề sâu không** — quân số THẬT của từng phe trong 249 map 3/4.

⚠ Tách `BuildOffsets` (hình học thuần) khỏi `Build` (bản gắn agent) chính là để đo được: bản
gộp chỉ chạy khi đang Play trên sân 3/4 với agent thật, nên bảng khám không có cách nào kiểm —
mà một bộ giải hình học không có phép đo thì mỗi lần chỉnh số là một lần cầu may.

---

## ⚠⚠ TƯỚNG MÁY PHẢI BỊ LỪA ĐƯỢC — `intelSightScale` (2026-09-16)

Code: `CommandNode.ScanEnemySector` + `IsPerceived`. Đo: Doctor › «Tầng niềm tin của chủ tướng».

Trước đợt này `ScanEnemySector` duyệt `TeamMember.All` và cộng **mọi địch còn sống** trong
`sectorRadius` — không hỏi quân mình có trông thấy hay không. Nghĩa là `StickmanStealth`, nón
tầm nhìn, đêm tối (`WorldLighting.VisionScale` 0.65), `NoiseField` và mọi cú mai phục chỉ có
giá trị với **từng người lính**; ông tướng thì **luôn biết đủ**. Không một mưu nào ở tầng chiến
thuật có nghĩa cả — mà nhìn vào code thì mọi hệ giác quan đều "đã có".

Nay `intelSightScale > 0` ⇒ chỉ đếm địch mà **quân mình thật sự thấy**, dùng tầm nhìn của
CHÍNH người quan sát (đã qua bảng cấp IQ) nên đêm tối và hồ sơ mắt kém tự có tác dụng.
`0` = toàn tri như cũ.

⚠ **Trận dàn quân bình thường gần như KHÔNG đổi**, và đó là lý do bật rộng an toàn: hai bên
tiến lại, chưa thấy nhau thì luật *"chưa thấy địch → TẤN CÔNG"* cho cả hai tiến lên; gặp nhau
là đếm đủ như cũ. Khác biệt chỉ hiện ra đúng chỗ nó phải hiện — ẩn thân, mai phục, đêm, nấp.

⚠⚠ **TIN CŨ PHẢI PHAI, KHÔNG ĐƯỢC TẮT PHỰT** (`intelMemory`, 6 s). Địch bước sau một bức tường
mà sổ quân rơi thẳng về 0 là cán cân nhảy dựng và cả phe lật lệnh mỗi lần có người nấp — đúng
sáu vòng lặp phản hồi mà §5b đã phải bịt. Tin **mới luôn thắng** (thấy đông hơn thì tin ngay);
chỉ chiều **đi xuống** mới phải chờ.

⚠⚠ Bẫy cỡ hệ số: `visionRange × intelSightScale ≥ sectorRadius` thì **không kẻ nào từng nằm
ngoài tầm mắt** ⇒ sổ quân y hệt bản toàn tri, chỉ tốn thêm một vòng quét. Cùng họ với
`formationLeash == visionRange` và `deployRange == visionRange`. Doctor đo thẳng cặp số này.

⚠ Cố ý KHÔNG bắn tia kiểm vật cản — cùng lý do `NoiseField` không bắn: vài trăm phép mỗi nhịp
cho một hệ chạy 2 lần/giây. Muốn tường che mắt thì hạ tầm nhìn ở nơi đó.

Số trong builder: bộ chuẩn **1.0 / 6 s** · thủ nhà **1.2 / 9 s** (quen địa hình) · du kích
**0.8 / 3.5 s** — đánh nhanh rút nhanh thì không ai đứng lại quan sát, và quên cũng nhanh. Đó
là vế ĐỐI TRỌNG của việc du kích khó bị bắt.


## ⚠⚠ GÓI CHỦ TƯỚNG — TƯỚNG PHẢI MẠNH HƠN LÍNH VÀ NHÌN RA ĐƯỢC (2026-09-17)

User: *"nâng cấp nhận dạng tướng lĩnh: nó có sức mạnh, và ngoại hình trang bị ấn tượng hơn so
với lính thường"*.

`CommanderPresence` (Units) + `CommanderPresenceDirector` (Units) — **dán theo CHỨC, không theo
người**: director hỏi `CommandNode.Roots` mỗi 0.5 s và gắn gói cho ai đang là GỐC cây; gói tự
soát mỗi 2 s rồi **tự huỷ** khi mất chức.

### Vì sao không nhét vào builder

| Chỗ hỏng trước 2026-09-17 | Hệ quả, không lỗi nào báo |
|---|---|
| gói chỉ được bake ở `SpawnGeneralShared` | `PickHeir` đôn cấp phó lên, `PickCommander` chấm theo MÁU → **người kế nhiệm không nhận được gì**; từ giữa trận cả phe không còn ai ra dáng tướng |
| mạnh CHỈ Ở MÁU (×2.4) | ba anh lính quèn khoá chết ông tướng trong hitstun |
| dấu hiệu = một **Ô VUÔNG** tô vàng (`LoadSquare`), bake trong scene | ở cỡ thật là một chấm, và nó không đi theo người kế nhiệm |

### Năm vế, đều là hệ có sẵn được vặn lên

máu ×2.5 · sát thương ×1.35 · tốc đánh ×1.15 · nhận sát thương ×0.8 · đẩy lùi ×1.4 ·
kháng choáng 0.6 · kháng ngã 0.5 · cấp AI ≥ 4 · bậc sĩ khí 3 · trang bị `GearTiers.Max`
(+ nón/giáp của nền văn minh nếu đang thiếu) · hào quang bán kính 7.

Chỉ số ghi qua **`UnitStats` theo NGUỒN** (`"commander"`, `"aura:commander"`) nên gỡ được sạch
khi mất chức — không dùng đường ghi thẳng `controller.DamageDealtScale`.

### Bốn cái bẫy đã bịt (đừng mở lại)

1. ⚠⚠ **MÁU CÓ HAI CHỦ.** Tướng dựng sẵn đã được builder nhân máu và số đó **bake trong 45
   scene**; nhân thêm lúc chạy là ×2.4 × ×2.5 ≈ **×6**. Ranh giới đo được: **có nhãn
   `FieldCommander` ⇒ builder đã lo vế máu**, gói bỏ qua máu và chỉ thêm bốn vế còn lại.
   Người kế nhiệm không có nhãn ⇒ nhận đủ cả năm.
2. ⚠⚠ **NGƯỜI ĐÃ CÓ CHỦ KHÁC THÌ NHƯỜNG HẲN** (`IOwnsUnitBuffs`, Core): `HeroCommander` (×4) và
   `CampGeneral` ghi THẲNG vào `StickmanController`, hai kiểu ghi vào cùng một ô thì ai ghi sau
   xoá số của người trước — nhìn vào chỉ thấy *"ông tướng lúc mạnh lúc yếu"*. Builder mode hiện
   đại/doanh trại **gắn cả hai** lên cùng một sĩ quan, nên đây không phải ca giả định.
3. ⚠ **BẢN SAO MANG THEO GÓI.** Ba đường nhân bản người đang sống bê nguyên component, nên
   `CommanderPresence.Verify` phải tự soát — director chỉ lo đầu GẮN.
4. ⚠ **CHƯA THẤY `CommandNode` THÌ CHỜ, ĐỪNG GỠ**: cây dựng ở `Start` và `RespawnDirector` gỡ
   hẳn node khỏi khuôn hồi sinh, nên "chưa có node" là trạng thái bình thường mấy giây đầu.

### Nhận diện — ba dấu, BA CÂU khác nhau

| Dấu | Nói gì | Màu | Treo ở đâu |
|---|---|---|---|
| VƯƠNG MIỆN | «tôi là chủ tướng» | **luôn VÀNG** ở mọi phe | xương đầu, order `HeadGear`, nhích Z |
| ÁO CHOÀNG | «của phe nào» | màu phe | xương thân, order `Back`, nghiêng theo thân |
| QUẦNG dưới chân | «hào quang đang bật» (tắt khi tướng ngã) | vàng pha màu phe | gốc, `BehindBodyGlow` |

⚠ Đây KHÔNG phạm luật *"ba trục phải cùng khác nhau"* (thứ đã khai tử cờ lệnh + ngù ngày
2026-09-04): ba dấu trả lời ba câu khác nhau, và người mang chúng là **duy nhất trong phe**.
⚠ **KHÔNG VẼ CHỮ/HUY HIỆU LÊN ÁO CHOÀNG** — rig lật mặt bằng `localScale.x = -1` nên mọi thứ
treo dưới nhóm `Sprite` đều soi gương; vải trơn soi gương vẫn là vải trơn, còn một cái huy hiệu
thì đọc ra ngay là *"cờ bị lật"*. Đó đúng là lý do cờ lệnh bị bỏ.
⚠ Có vương miện thật thì gói **XOÁ** ô vuông vàng cũ (`RetireLegacyCrown`) — một dấu, một chủ.

### Art + công tắc + phép đo

- Art vẽ bù: **Bảng điều khiển › «Phù hiệu chỉ huy + quân hàm cấp AI»** (`StickmanInsigniaBuilder`)
  sinh `Insignia_Crown` + `Insignia_Cape` rồi ĐO cỡ/chỗ đặt từ rig và bake vào
  `CommandInsigniaSet`. **Chưa bấm lại thì hai ô mới còn trống** ⇒ tướng vẫn mạnh nhưng nhìn y
  hệt lính. Art thật đặt ChatGPT: `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md`.
- Công tắc: `GameFeature.CommanderPresence` (cổng ở `Awake` của chính component). Tắt = hành vi
  trước 2026-09-17. Đáng tắt ở đấu tay đôi · thi bắn · đua, nơi "ai cũng ngang nhau" là luật chơi.
- Doctor: ba dòng ở `StickmanDoctor.Look.cs` — asset thiếu vương miện/áo choàng · director mất
  `SceneManager.sceneLoaded` · director không còn gọi `CommanderPresence.Install(`.
- Số đo và cách vặn: `Docs/KnowledgeBase/AI-Command.md` mục GÓI CHỦ TƯỚNG.
