## TẦNG GAME — biến scene test thành VÁN CHƠI (Assets/Scripts/Gameplay/)

Dự án này vốn là bộ asset test: mỗi mode là một scene chạy mãi, thắng thua xong bấm R dựng lại
Y HỆT — không có lý do chơi ván thứ hai. Tầng game thêm đúng phần còn thiếu, **nằm TRÊN các
mode, không thay gì cả**. Sáu điều cần nhớ:

1. **`GameRun` (static) = một lượt chơi dài hơi**, SỐNG QUA RELOAD SCENE (chơi lại = nạp lại
   scene). Giữ: `Seed` · `Round` · `Tier` (0–4) · thắng/thua/chuỗi thắng. Chỉ reset khi vào
   Play mới (`ResetStatics`, cùng khuôn `TeamMember`/`CommandNode`).
   **Thắng thì bậc khó LÊN, thua thì XUỐNG** — đó là toàn bộ giá trị chơi lại.
2. **MỌI THỨ NGẪU NHIÊN CỦA MỘT VÁN PHẢI ĐI QUA `GameRun.Range/Chance`**, KHÔNG dùng
   `UnityEngine.Random`: cùng một seed phải ra đúng một ván (cùng map, cùng cặp văn minh) để
   người chơi báo "ván seed 48213 kẹt ở cổng" là dựng lại được y hệt. `CivilizationLibrary.
   RandomExcept` đã chuyển sang `GameRun.Range` vì lý do đó.
3. **`GameDifficulty` chỉ đổi CÁI ĐẦU và QUÂN SỐ, không đụng máu/damage** — cùng lý do
   `AIDifficultyDirector` đã đặt: cho địch thêm máu là người chơi CẢM THẤY BỊ ĂN GIAN (chém
   đúng ba nhát như mọi khi mà nó không chết). Ngoại lệ duy nhất là CẤP VŨ KHÍ — đó là "đồ tốt
   hơn" nhìn thấy được, nhặt được thì cũng dùng được.
4a-lang. ⚠⚠ **CÔNG / THỦ LÀNG (`Demo_26_Raid`) — BA ĐƯỜNG THẮNG, VÀ LỬA LÀ THẬT** (2026-09-08).
   Ba đường của toán cướp: **đốt đủ nóc** · **hạ ĐÌNH LÀNG** · **vét đủ CỦA CẢI mang về trại**
   (`VillageRaid._lootToSteal`, mặc định 16 trên tổng 24 có trên sân). Đường thứ ba không phá gì
   cả — làng còn nguyên mà vẫn thua, đúng nghĩa một trận cướp bóc — và nó không đẻ hệ nào mới:
   `ResourceNode` (kho thóc · hòm của, đặt SÂU trong làng, khai PHE CƯỚP để chỉ thợ vác của
   chúng lấy được) + `ResourceDepot` ở trại + `AIStateWork` sẵn có.
   · Thợ vác **tự bỏ chạy khi thấy địch** (`AIStateWork` pha Flee) ⇒ cướp của là phần thưởng cho
     việc TRÀN VÀO ĐƯỢC, không phải đường tắt đi vòng. Vế này chưa chơi thử trên máy thật.
   · **LỬA**: nhà bắt lửa qua `IFlammable.Ignite` (mũi tên lửa của `AIFireArrowModule`, hoặc đòn
     nổ). Trước 2026-09-08 chuyện này KHÔNG BAO GIỜ xảy ra vì `Playbook_Raid` rụng module —
     xem `AI.md` mục 2b-dan. Nay mode HÔ khi một nóc bắt lửa và đếm số nóc đang cháy trên thanh
     trạng thái, vì cháy là đồng hồ chạy ngầm.
   · **Phe thủ có việc để làm**: hai `Tho_Va` (`AIBehavior.Work`) chạy vá nhà đang cháy —
     `BaseBuilding` là `IRepairSite`, `_maxRepairWorkers = 2`. Trước đó làng chỉ có đúng một
     việc là đứng cầm chân cho hết giờ.

   **Đợt hai (cùng ngày) — năm vế nữa, tất cả nối vào hệ đã có:**
   · ⚠⚠ **HAI PHE THÌ HAI BẢN TÓM TẮT.** `MissionBrief` từng là MỘT chuỗi mở đầu *"Giữ làng!"*,
     nên chọn phe CƯỚP xong vẫn bị dạy cách thủ cổng — `SideName` đã biết hai phe từ lâu, brief
     thì chưa. Nay `PlayerIsVillage` chia đôi cả brief lẫn DÒNG TRẠNG THÁI: cùng một con số
     ("nhà cháy 2/3") là TIN XẤU với làng và là TIẾN ĐỘ với cướp, phải nói bằng giọng của phe
     đang ngồi. Mode nào bất đối xứng cũng phải qua cửa này.
   · **Bốn đợt viện binh phải NGHE THẤY**: `EnemyWaveSpawner.WaveStarted` có sẵn từ lâu mà
     không mode nào nghe. Nay hô «ĐỢT 2/4» (thêm `EnemyWaveSpawner.MaxWaves`) và hiện
     `TimeToNextWave` — quãng NGHỈ giữa hai đợt chính là cửa sổ chữa cháy/vá cổng, không hiện
     ra thì không ai biết nó tồn tại.
   · **Của cải là CUỘC ĐUA, không phải hàng rào**: node của cải đổi sang **TRUNG LẬP**
     (`_teamId = -1`, đảo lại quyết định buổi sáng) + thêm `ResourceDepot` của LÀNG cạnh đình.
     Hai bên cùng một hệ `AIStateWork`: cướp khiêng về trại để thắng, thợ làng khiêng vào đình
     để cứu. Vế "dân bỏ tuyến đi gặt" tự giải vì `AIStateWork` ưu tiên SỬA CHỮA trước khi kiếm
     việc — có nhà cháy là thợ bỏ của mà chạy đi vá.
   · **CHUÔNG BÁO ĐỘNG** (`VillageRaid` là `IModePrompt`, ô [F] dùng chung với đặt bom/cởi
     trói): dân thường vốn ĐÃ cầm rìu đốn củi, chuông chỉ đổi `AIBehavior.Flee → FreeRoam`.
     Không phát vũ khí, không đổi chỉ số, không thêm quân. Đánh đổi tự cân: dân 2 máu chết
     nhanh, nhưng từ giây đó họ là LÍNH nên **luật cộng giờ cho toán cướp tắt** (`IsCombatant`
     loại `Flee`) ⇒ kéo sớm mất người, kéo muộn mất giờ. Làng do MÁY cầm thì máy tự kéo khi
     cổng vỡ hoặc mất người thứ hai — cùng khuôn "cần gạt là của người chơi" như cổng làng.
   · **Tướng cướp gục thì phải ĐỌC RA**: `CommandDoctrine.leaderlessShock` làm cả toán choáng
     từ lâu nhưng không ai nói ra, nên chẳng người chơi nào nhắm ông ta. Một dòng hô + một ô
     trạng thái 12 s là đủ biến ông tướng thành mục tiêu đáng liều.
   · **TRỜI ĐÊM**: `DayNightCycle` mở màn ban đêm (`EditorSetupNight`), đêm 600 s > trận 150 s
     nên cả trận nằm trong một đêm. Không chỉ là ánh sáng — nó nhân tầm nhìn AI với
     `nightVisionScale` 0.72, tức cung thủ trên tháp thấy ngắn hơn và toán cướp bò gần hơn mới
     bị phát hiện. ⚠ TẮT đồng hồ ngày/đêm (`_showClock = false`): màn này đã có đồng hồ riêng,
     hai cái trên một màn hình là không ai đọc cái nào.

   **Đợt ba — hai vế nặng nhất, mỗi vế một cửa an toàn riêng:**
   · ⚠⚠ **MỖI VÁN MỘT CÁI LÀNG KHÁC** (`VillageLayoutShuffle`, module **Map**): dựng lại toà
     thành lúc CHẠY theo seed `GameRun`, rồi **GHIM CỔNG về đúng toạ độ vừa bake**. Cổng là
     cái neo vì hơn hai chục thứ trong scene đo từ `FortBuild.gateX` (tổ giữ cổng, người chơi,
     tuyến cung, khẩu nỏ, chỗ cắm thang) — thả cho toà thành rơi đâu thì rơi chính là con đường
     đã đẻ ra *"2 team sinh cùng một chỗ"*. Cái đổi giữa các ván là **hình dạng** (tường cao/
     thấp, một hay hai tháp, thang thẳng hay chữ chi), không phải bố cục sân.
     - Chỉ hai thứ đo từ MẶT TƯỜNG phải chỉnh lại: **chỗ cắm thang** (`SiegeLadder.SetPlantX`)
       và **chiều cao thang** (`SetPlantHeight` + `StickmanClimbZone.SetHeight`) — thiếu vế thứ
       hai thì bốc trúng tường 2.4 trong khi thang bake cho tường 1.95 là trèo lên tới đỉnh vẫn
       còn dưới sàn gỗ, leo mãi không lên nổi và KHÔNG có lỗi nào báo. Cộng khẩu nỏ lùi theo sân.
     - **Bốn cửa an toàn, cửa nào cũng GIỮ BẢN BAKE**: thiếu bố cục/nút gốc · `FortPlan.Validate`
       có lỗi · không nạp được `MapLibrary` (art rỗng ⇒ thành vô hình) · lắp xong không có cổng.
       Mỗi cửa một `LogWarning` — im lặng bỏ qua thì lần sau không ai biết vì sao làng không đổi.
     - ⚠ Chạy ở `Awake`, và gọi `VillageRaid.SetGate` để trọng tài thôi cầm cái cổng sắp bị huỷ
       (tham chiếu Unity đã `Destroy` vẫn `!= null` — fake-null).
   · **BẮT DÂN VỀ LỒNG** thay vì chỉ giết: cướp kèm sát một người đang chạy đủ 1.2 s thì người
     đó bị bắt — chuyển `AIBehavior.Travel` với mốc là cái lồng (`AIStateTravel` sẵn có tự dẫn
     đi, và `Travel` nằm trong danh sách KHÔNG PHẢI LÍNH nên họ không đánh trả). Tới nơi thì
     `PrisonerCage.Capture` nhốt lại — **cửa mới của lồng**, vì `Demo_32_Rescue` bake sẵn tù
     binh còn ở đây ai bị bắt là chuyện giữa trận.
     - Bắt vẫn cộng giờ như giết, **nhưng lấy lại được**: phá lồng thì dân về và số giờ đó bị
       TRỪ LẠI. Không có vế trừ giờ thì đi cứu chỉ đổi mấy cái xác lấy mấy người chạy loạn.
     - ⚠ `Capture` nhốt xong gọi lại `LockUp()` cho CẢ lồng thay vì viết bản "nhốt một người":
       `LockUp` tính khoảng lệch từ chỗ đứng hiện tại, mà người đã ghim thì chỗ đứng hiện tại
       chính là chỗ ghim ⇒ chạy lại không đổi gì cho họ. Một đường nhốt, một luật (bảy bước).
     - Lồng dựng ở SAU trại cướp: muốn cứu thì phe làng phải đánh ngược ra sân địch.

   **Đợt bốn — trả cần gạt cho phe CÔNG, và kể lại ván vừa đánh:**
   · **CẦN GẠT CỦA PHE CƯỚP** (`RaidFocus`: Tuỳ nghi · Đốt nhà · Hạ đình · Vét của). Phe thủ có
     cổng và chuông; phe công trước nay KHÔNG có nút nào, dù mode có tới BA đường thắng — chọn
     đường nào lẽ ra là quyết định lớn nhất của họ. Nút đổi mốc tiến quân của cả toán
     (`_raidAnchor`), hàng nút chỉ hiện khi người chơi ngồi ghế cướp.
     ⚠ **CỔNG LUÔN ĐI TRƯỚC**, kể cả khi đã chọn mục tiêu khác: cổng còn đứng thì nó CHÍNH LÀ
     thứ chắn đường, trỏ mốc qua đầu nó là cả toán chạy tới dí mặt vào cổng rồi mới nhờ
     `UpdateBlockedPath` nhận ra phải đập. Cần gạt chỉ có nghĩa SAU khi cổng vỡ.
     ⚠ Mỗi lựa chọn đều CÓ THỂ RỖNG (đình sập, của hết) ⇒ rơi về nóc nhà ngoài cùng.
   · **`MatchModeBase.MatchStatsLine`** — chỗ cho MỌI mode kể lại ván vừa rồi trên bảng kết quả.
     `MatchOutcome.reason` chỉ có ĐÚNG MỘT DÒNG 28 px, nên mode đếm nhiều thứ (cướp làng đếm
     bảy con số) thì thắng thua xong là mất sạch — không có gì để nhìn lại, không đo được ván
     này khá hơn ván trước. `GameSession.DrawResult` hỏi mode trước, không có thì rơi về
     `CampStatsLine` của màn kinh tế.

4b. ⚠⚠ **AI PHẢI BIẾT ĐIỀU KIỆN THẮNG CỦA MÀN — `MatchModeBase.BuildOrders`.**
   Scene chế độ chơi dựng tay đều spawn quân với `AIBehavior.HuntTarget` + mục tiêu **NULL**,
   nghĩa là *"đánh đứa gần nhất"*. Với màn "diệt sạch địch" thì đúng; với **mọi màn có điều
   kiện thắng khác** thì AI không hề biết điều kiện đó là gì — hai phe ra giữa sân đánh nhau
   rồi trận đứng đó. Đã dính **cả ba** màn trung cổ mới:
   · cướp làng — toán cướp không đi đốt nhà · vây thành — quân vây không ra giữ đường tiếp
   lương · cứu tù binh — đội cứu không đi phá lồng.
   ⚠ **Tệ hơn: `AIProfile.structureTargetBonus` mặc định là −6 (NÉ công trình).** Nên ở màn
   mà công trình CHÍNH LÀ điều kiện thắng, AI vừa không biết mục tiêu vừa **CHỦ ĐỘNG TRÁNH**
   đúng thứ phải phá — điều kiện thắng không bao giờ đạt được. Khai `targetsStructures = true`
   trong `TeamOrder` để đảo dấu (trên **BẢN SAO** profile — asset là của chung).
   · Lệnh phát lại theo nhịp 2s (`TickOrders`), không chỉ một lần lúc Start: màn có máy sinh
   quân / hồi sinh thì lính MỚI không nhận được lệnh nào và lại về "đánh đứa gần nhất".
   · Mốc là **TRANSFORM DỜI ĐƯỢC** (nhà còn sống gần nhất, lồng chưa mở gần nhất) — dời mốc
   thay vì gọi lại `SetBehavior`, đúng khuôn cây chỉ huy.
   · `brief` của phe người chơi hiện trên **màn hình bắt đầu**: người chơi và quân mình đọc
   cùng một mục tiêu.
   ⚠⚠ **`HuntTarget` + mục tiêu NULL = "đánh đứa gần nhất" — KHÔNG phải "đi tuần".** Lúc
   chưa thấy địch nào thì lính KHÔNG CÓ GÌ để đi tới nên lang thang tại chỗ, tách hẳn khỏi
   thứ đáng lẽ phải bảo vệ. Đã dính khi thử chia một phần đội áp tải sang vai "đi trước dọn
   đường": họ bỏ xe hàng đứng vơ vẩn. **Việc "ra chặn địch từ xa rồi lùi về" đã có sẵn trong
   `AIStateGuard`** (`guardScreenDistance` + `guardAlertRange`, có leash giữ lại quanh mốc) —
   muốn xông ra xa hơn thì nới `AIPlaybook.guardRangeScale`, ĐỪNG đổi hành vi.
   ⚠ **`TeamOrder.noRetreat` cho màn phải BÁM MỤC TIÊU.** Ngưỡng rút lui nằm trong TÍNH CÁCH
   (cẩn trọng 0.45 · rình rập 0.5), hợp lý cho trận đánh thường nhưng sai hẳn ở màn hộ tống:
   lính tụt 1/4 máu là bỏ xe chạy, mà xe không tự vệ được. "Có được bỏ mục tiêu không" là
   chuyện của NHIỆM VỤ — khai ở `TeamOrder`, đừng đi sửa từng profile.
   ⚠ Mode tự lái tay (`ChampionDuel`) thì để `BuildOrders` rỗng — nhưng `Start()` vẫn phải
   `base.Start()`, không thì `private void Start()` CHE MẤT base và lệnh không bao giờ chạy.
   ⚠⚠ Bẫy này đã dính HÀNG LOẠT chứ không phải một lần: rà 2026-09-02 ra **9 mode** khai
   `private void Start()` đè mất base (Arena · Assassination · BaseWar · BossFight ·
   CaptureScore · LastStanding · SurviveNights · NavalBattle · ZombieSupply) — hôm nay chưa
   sao vì cả 9 chưa khai `BuildOrders`, nhưng ai thêm bản lệnh vào là nó chết lặng đúng kiểu
   §4b. Đã sửa hết thành `protected override void Start()` + `base.Start()`. **Cách tự bắt:
   compiler réo `warning CS0114` — thấy nó ở một class MatchModeBase là sửa ngay, đừng để
   warning trôi.**

4. **`MatchModeBase` = gốc chung của mọi mode**: giữ `IsOver`, `Win/Lose/Finish`, `Announce`.
   Mode chỉ nói AI THẮNG, không tự vẽ băng-rôn nữa. ⚠ **Vế bắt buộc: không có `GameSession`
   thì tự vẽ băng-rôn như cũ** — nhờ vậy mọi scene test mở ra chạy một mình vẫn được, không
   bắt buộc kéo theo cả tầng game.
5. **`GameSession` áp điều kiện ván lên scene** (`[DefaultExecutionOrder(-50)]` để chạy TRƯỚC
   mode): cấp IQ + cấp vũ khí phe máy · **quân số** (`ApplyTroopCount` NHÂN BẢN lính có sẵn
   trong scene, KHÔNG Instantiate từ prefab — lính trong scene đã được builder gắn đủ loadout/
   archetype/cờ phe/cây chỉ huy, dựng lại từ prefab là chắc chắn sót) · xê dịch map · rồi hiện
   MÀN HÌNH BẮT ĐẦU (dừng giờ) và MÀN HÌNH KẾT QUẢ.
   ⚠ Quân số KHÔNG nướng được vào lúc dựng scene: scene bake một lần, bậc khó thì mỗi ván một khác.
   ⚠ `OnDestroy` phải trả `Time.timeScale = 1` — màn hình bắt đầu dừng giờ, thoát scene mà quên
   trả là scene sau đứng hình.
6. **`ScriptedUnit` = nhãn "đừng nhân bản, đừng xoá tôi"** (chủ tướng · đấu sĩ · tù binh · VIP).
   Nhân đôi tướng là cả phe có hai tướng; xoá mất tù binh là không còn ai để cứu. Nhận diện
   bằng NHÃN chứ không kê tên class — thêm loại nhân vật kịch bản mới thì dán nhãn là xong.
   **`MapJitter` = nhãn "được phép xê dịch"**: chỉ cây cối/đá/rào phụ. Nhà · mục tiêu · điểm
   spawn · lồng giam thì KHÔNG — map phải đổi CẢM GIÁC chứ không được đổi LUẬT (đúng bài học
   `MapGenerator.Sanitize`: hợp lệ về số vẫn có thể hỏng về luật chơi).

6b. ⚠⚠ **ĐỔI GHẾ LÀ MỘT TÍNH NĂNG CÓ THẬT — MODE PHẢI TRẢ LỜI CHO NÓ, HAI ĐƯỜNG.**
   `GameSession.SwitchSide` chạy ở màn hình BẮT ĐẦU, tức **SAU `Start()` của mode**. Mọi thứ
   mode đã chốt theo phe trong `Start` (ai là địch, nhà nào của mình, trại nào của mình) từ đó
   nói NGƯỢC — và vì màn đối xứng nên mọi hàm vẫn "chạy", chỉ có kết quả sai. Không lỗi nào báo.

   | Màn | Trả lời thế nào |
   |---|---|
   | ĐỐI XỨNG (giao chiến · đua điểm · sống qua đêm · đua kinh tế) | `override OnPlayerTeamChanged()` — tra lại địch/nhà/trại |
   | **BẤT ĐỐI XỨNG** (ám sát · đấu boss) | **`AllowsSideChoice => false`** |

   ⚠ Vế thứ hai hay bị quên hơn. `AssassinationMode.Win` là `Finish(_playerTeam)` còn luật
   thắng chốt cứng vào *"VIP đã chết"* — cho ngồi ghế phe GÁC thì người chơi giết chính VIP
   của mình vẫn được tuyên bố THẮNG. Ghế bên kia không có màn nào để chơi thì đừng mở nó ra.

7. **MỌI SCENE CHƠI ĐƯỢC ĐỀU PHẢI CÓ KẾT CỤC + TẦNG GAME.** Đợt rà soát giá trị chơi lại đã
   vá đúng lỗ này: quá nửa số scene chơi được KHÔNG có ai tuyên bố thắng thua (điểm chiếm cộng
   vô tận, xe hàng tới đích thì đứng đó, nhà sập thì trại ngừng sản xuất rồi... trận cứ trôi) —
   **không có kết cục thì không có ván sau, và đó là chỗ giá trị chơi lại chết**. Luật:
   · Mode mới BẮT BUỘC kế thừa `MatchModeBase` và gọi `Win/Lose/Finish` — đừng tự vẽ băng-rôn.
   · Kiểu chơi "vô tận" phải có VẠCH ĐÍCH: đua điểm (`CaptureScoreMode` 120đ) · sống N đêm
     (`SurviveNightsMode`) · trụ N đợt (`ArenaMode._wavesToWin`) · trụ N giây (`HoldoutMission`) ·
     đồng hồ ám sát (`AssassinationMode` — cố ý KHÔNG lấy "chết là thua" vì scene có hồi sinh:
     chết = mất thời gian, và chính đồng hồ làm cái giá đó đau).
   · ⚠⚠⚠ **VẠCH ĐÍCH LÀ ĐIỀU KIỆN CẦN, KHÔNG PHẢI ĐIỀU KIỆN ĐỦ — «ĐỢT SAU» PHẢI HỎI MỘT CÂU
     HỎI KHÁC, KHÔNG PHẢI THÊM HAI NGƯỜI** (user 2026-09-05: *"cải thiện gameplay đấu trường"*).
     `Demo_21_Arena` đã có vạch đích (8 đợt) mà vẫn nhạt, vì cả ván chỉ có MỘT tình huống lặp
     lại. Đo ra bốn chỗ, và ba trong bốn là *"hệ đã có sẵn mà đấu trường không dùng"*:

     | Đo được | Nghĩa |
     |---|---|
     | sân là **dải đất phẳng 36 đơn vị**, không cao độ, không vật che | không có một quyết định nào về CHỖ ĐỨNG — mà "đứng đâu" mới là câu hỏi của màn sống-sót |
     | mọi đợt bốc chung **một bảng 5 cây vũ khí** | đợt 8 = đợt 1 có thêm người; bộ khiên · bộ cung · đòn phá thế thủ nằm không |
     | `SetSpawnedSmartsLevel` kẹp **0..2** trong khi thang cấp AI là **0..5** | từ đợt 6 địch KHÔNG khôn thêm được nữa; quá nửa cái thang cả dự án xây ra thì màn này không chạm tới |
     | quân số `1 + đợt/2` ⇒ **2 → 5 lính** qua 8 đợt | đường cong gần như phẳng |

     **Bốn chốt, không đẻ hệ mới nào:**
     · **SÂN CÓ TẦNG** — hai THỀM (`CreateTerrace`, sàn MỘT CHIỀU nên không bịt làn) + cầu
       thang quay vào giữa + `GarrisonPost` cho cung thủ. Leo lên bắn xuống, hết đường thì
       THẢ MÌNH XUỐNG; tên bắn từ dưới đi XUYÊN sàn một chiều nên không có góc cắm trại.
     · **MỖI ĐỢT MỘT CÔNG THỨC** (`ArenaMode.RecipeFor`): HỖN CHIẾN → MƯA TÊN (toàn tầm xa) →
       TƯỜNG KHIÊN (khiên + vũ khí nặng: chém bừa là bị DỘI LẠI) → **THỦ LĨNH** (đợt 4 và 8).
       Đợt trùm bớt một lính: thứ đáng sợ là thủ lĩnh, không phải thêm một anh cầm kiếm.
     · **THỦ LĨNH VẪN LÀ `StickmanNPC`** — chỉ khác SỐ và ĐỒ NGHỀ (máu ×8 · đồ cấp 5 · vũ khí
       cấp 4 · cấp AI 5 · `DamageDealtScale`/`HitStunResistance`/`KnockbackScale` — đúng bộ
       chỉ số nhân runtime mà `HeroCommander` dùng). Không có nhánh `if (isBoss)` ở đâu cả nên
       choáng · đỡ đòn · vây đánh · hung thần · dọn xác chạy nguyên.
       ⚠ Vào sân từ MÉP và kẹp x trong lòng sân, đừng cộng mù một quãng từ chỗ người chơi:
       họ có thể đang đứng sát mép hoặc TRÊN THỀM ⇒ trùm rơi ra ngoài đất, hoặc rơi từ trên
       cao xuống ăn sát thương rơi ngay lúc vừa xuất hiện.
     · **PHẦN THƯỞNG PHẢI CÓ ÍCH MỌI LÚC** — 10 loại, và **lọc TRƯỚC khi bốc**: băng bó chỉ
       mời khi máu < 85%, huấn luyện chỉ khi còn đồng đội chưa kịch cấp, xạ thủ chỉ khi thềm
       còn suất, +mạng chỉ khi quỹ mạng CÓ HẠN. Ba lá bài mà một lá vô dụng thì lượt chọn đó
       chỉ còn hai lựa chọn thật, và người chơi học được rằng thưởng ở đây là hên xui.
       Ba món mới (`Fury`/`Swift`/`Tough`) là CHỈ SỐ NHÂN LÚC CHẠY trên `StickmanController` —
       không asset, không prefab, và vũ khí đọc qua `Damage`/`Cooldown` nên đổi cây vẫn ăn.
     · **KỶ LỤC** (`SaveSystem.RecordArenaWave` → `PlayerProfile.bestArenaWave`): đấu trường là
       kiểu chơi DUY NHẤT không có "màn sau", nên thứ khiến người ta bấm chơi lại chỉ có thể
       là một CÁI MỐC để phá. Trường mới nhận 0 ở hồ sơ cũ nên không phải nâng `SaveSystem.Version`.

     ⚠ Số đã đo, đừng gõ lại bằng cảm giác: quân **2 → 7** qua 8 đợt (`1 + đợt×3/4`), cấp AI
     **0 → 4** (lên mỗi 2 đợt), thềm cao **1.50** = ~11 bậc × 0.136 (`CreateStairs` tự chia đều
     nên bậc chót luôn khớp mặt sàn), chân thang đo bằng `MapBuildRules.StairRunFor` chứ không
     gõ tay — gõ tay là `GarrisonPost.accessOffsetX` trỏ vào chỗ không có bậc nào và cung thủ
     đứng đó tới hết trận.
     ⚠ **PHẢI DỰNG LẠI `Demo_21_Arena`**: nhịp lên cấp AI · máu thủ lĩnh · số đợt để thắng là
     field SERIALIZED đã bake trong scene — sửa mặc định trong code thì KHÔNG CÓ GÌ ĐỔI CẢ.
     `ArenaMode.cs` nay nằm trong `extraSources` của job «4 kiểu chơi mới» nên bảng tự báo VÀNG.

   · ⚠⚠ **VÒNG CHƠI PHẢI KHÉP KÍN — "làm việc ban ngày" mà không đổi ra thứ gì thì ngày là
     THỜI GIAN CHẾT.** `Demo_22_DayNight` có thợ · cây · mỏ · ruộng · kho và cả bộ chạy đúng,
     nhưng **không ai TIÊU cái kho** (`ResourceDepot` chỉ cộng vào `_stock`; màn này không có
     `WarCamp`/`TeamEconomy`) ⇒ người chơi cày cả ngày để nhìn một con số tăng. Nay
     `SurviveNightsMode` tiêu GỖ để VÁ NHÀ lúc rạng sáng, và mỗi đêm giặc đông thêm
     (`EnemyWaveSpawner.AddPressure`) — đêm phá nhà → ngày kiếm gỗ → rạng sáng vá lại → đêm
     sau nặng hơn. **Vạch đích không thay được vòng chơi**: bản vá trước chỉ thêm "sống qua 3
     đêm", nên đêm 3 vẫn dễ y như đêm 1 và con số đó chỉ là một cái đồng hồ trá hình.
     ⚠ Vá lúc RẠNG SÁNG chứ không vá liên tục — vá real-time thì trận đêm mất hết sức nặng.
     ⚠ `AddPressure` chỉ nới ĐỘ ĐÔNG, không đụng máu/sát thương (luật `GameDifficulty`) và
     không rút ngắn nhịp ra quân (đợt sau chồng đợt trước là mất luật "dọn gần hết mới ra đợt").
   · **`EconomyRaceMode`** — một luật thắng, BA BẢN (`EconomyRaceSkin`): `Camp`
     (`Demo_20_WarCamp`) · `Shooter` (`Demo_48_ModernCamp`) · `Island` (`Demo_49_IslandWar`).
     Thắng = **phá NHÀ CHÍNH địch**; chỉ bản đảo có van chống bế tắc (`TickCrossingDeadlock`).
     ⚠ **Đường thắng theo CẤP TRẠI đã bỏ** (`_levelToWin` không còn; overload `EditorSetup` cũ
     giữ lại chỉ để scene trên đĩa còn nạp được). Tài liệu cũ tả nó là *"nâng trại lên cấp đích
     hoặc phá trại địch"* — sai từ bản một-luật-thắng trở đi.
     ⚠ **Component `WarCamp` KHÔNG nằm trong scene nào** (đã đo bằng GUID trên `Assets/_Scenes`).
     Cỗ máy thật của mode là `TeamEconomy` (tiền · mua quân · tính cách tướng máy) +
     `CampBuildYard` (xây) + `CampHomeGuard` (tổ canh nhà) + cây chỉ huy. Đừng đi sửa `WarCamp.cs`
     rồi tưởng đã đổi được ván — nó là code còn lại của bản cũ.
     ⚠⚠ **Hết ván phải TẮT cỗ máy kinh tế** (`OnFinished` → `TeamEconomy.HaltForMatchEnd`).
     `MatchModeBase.Finish` chỉ treo băng-rôn, KHÔNG đóng băng sân giùm ai — thiếu vế này thì phe
     máy vẫn đổ vàng ra lính mới và cả một đợt quân chạy ra đánh nhau dưới màn hình kết quả.
     ⚠⚠ **Nhà chính phải tra bằng NGUỒN SỰ THẬT, không bằng "cái đầu tiên tìm thấy"**. Bản cũ
     nhặt `BaseBuilding` đầu tiên `FindObjectsByType` trả về cho phe đó — mà người chơi xây được
     nhà kho, nhà lính, tháp canh, rào chắn, tất cả đều là `BaseBuilding` cùng phe. Trúng một cái
     rào là điều kiện thắng của cả ván trỏ vào cái rào ấy. Nay hỏi `TeamEconomy.Headquarters`
     (ô builder đã cắm), dự phòng là công trình DÀY MÁU NHẤT của phe.
   · **CHIẾM ĐIỂM NỐI TIẾP** (`CapturePoint._requires`): điểm B khoá tới khi phe đó giữ được
     điểm A → bản đồ thành một TUYẾN ĐẨY thay vì ba ô rời ai muốn nhảy vào đâu thì nhảy.
     ⚠ Khoá theo TỪNG PHE, không khoá chung — khoá chung là hai bên cùng kẹt ở A và trận đứng.
     ⚠⚠ **`Demo_13` ĐÃ BỎ khoá này (2026-09-03) — cơ chế còn nguyên, chỉ là màn đó không dùng.**
     Ba điểm dưới đất + điểm giữa làm bản lề = cả hai đạo quân dồn vào ĐÚNG MỘT vòng tròn, mà
     luật cũ nói "hai phe cùng đứng → tiến độ ĐỨNG IM" và `RespawnDirector` thì bơm quân vào
     đó sau mỗi 6 giây. Đo được: cả ba điểm ở `vô chủ` suốt trận, hai phe cùng 0 điểm, ván nào
     cũng `hết giờ — hoà 0–0`. Không lỗi nào báo. Nay thay bằng ĐỊA HÌNH (điểm ở ba cao độ,
     tháp giữa chỉ lên được qua hai thềm cánh) + CHÊNH LỆCH GIÁ TRỊ (giữa 3 điểm/giây, hai
     cánh 1) — bỏ hai cánh là thua chậm, ôm hai cánh bỏ giữa cũng thua, đó mới là quyết định.
   · ⚠⚠ **GIẰNG CO PHẢI CÓ ĐƯỜNG NGÃ NGŨ — `CapturePoint` tính PHẦN QUÂN THỪA.**
     "Cả hai phe cùng đứng thì đứng im" đúng cho một trận có hồi kết, nhưng ở màn CÓ HỒI SINH
     thì giằng co không phải một khoảnh khắc mà là TRẠNG THÁI VĨNH VIỄN. Nay tiến độ chạy cho
     phe ĐÔNG HƠN, tốc độ tính bằng `đôngNhất − phầnCònLại`: 3 chọi 3 vẫn đứng im, 4 chọi 3
     thì bên đông hơn nhích chậm bằng một người. Muốn chiếm vẫn phải THẮNG cái vòng, chỉ khác
     là thắng bằng cách dồn quân chứ không phải bằng cách giết sạch — thứ bất khả thi khi địch
     sống lại sau 6 giây.
     ⚠ `CountTeamsInside` **chỉ đếm `StickmanFighterController`**: tường/tháp/cổng cũng mang
     `TeamMember` và cũng "còn sống", nên một cái tháp trong vòng chiếm là phe đó vĩnh viễn có
     một "người" đứng đó — hoặc điểm tự thuộc về họ, hoặc vùng giằng co mãi mãi.
   · ⚠⚠ **BÁN KÍNH VÙNG CHIẾM PHẢI NHỎ HƠN CHÊNH CAO TỚI MẶT ĐẤT.** Vùng chiếm là hình TRÒN
     (`ContainsPoint` đo `sqrMagnitude`), nên một vòng bán kính 2.5 đặt trên thềm cao 1.5 vẫn
     TRÙM XUỐNG đất — đứng dưới đất cũng chiếm được và cả cái sân nhiều tầng thành đồ trang
     trí. `Demo_13`: thềm +1.50 → bán kính 1.4; tháp giữa +2.55 → bán kính 2.2.
   · ⚠⚠ **`Demo_13` CỐ Ý KHÔNG CÓ `TeamCommander` — MỘT PHE MỘT TẦNG ĐIỀU PHỐI.** Cây chỉ huy
     lái quân bằng ĐÚNG MỘT cột mốc tuyến và ghi đè `SetBehavior` mỗi nhịp, nên cả sáu người
     cùng đi tới một vòng tròn: chiếm xong bỏ đó đi tiếp, địch lấy lại ngay sau lưng. Nay
     `CaptureScoreMode.BuildOrders` chia mỗi phe làm BA vai bằng `TeamOrder.share` — **ĐỘI
     CHIẾM** (`GuardTarget` vào mốc "điểm đáng tranh nhất") · **ĐỘI GIỮ** (`GuardTarget` vào
     mốc `CapturePoint.HeldAtRisk` = điểm của mình đang bị gặm) · **ĐỘI CHẶN** (`HuntTarget`,
     hứng phần dư). Không state mới: `AIStateGuard` vốn đã biết bám mốc, tuần quanh nó và
     xông ra đánh kẻ bén mảng.
     ⚠ Hai đội bám điểm khai `noRetreat` — đứng TRONG vòng mới là việc phải làm.
     ⚠ Mốc CHIẾM phải có QUÁN TÍNH (`_targetHold` 6s + `_targetMargin` 3): nó được chấm theo
     khoảng cách tới TRỌNG TÂM đội hình, mà đội hình lại di chuyển theo chính cái mốc đó —
     đúng vòng lặp §5c, không có quán tính là cả cánh quân đi nửa đường rồi quay lại.
     ⚠⚠ **`CapturePoint.BestForTeam` PHẢI HỎI `IsOpenFor`.** Đó là CỬA DUY NHẤT cây chỉ huy hỏi
     *"đi đâu"*; thiếu dòng lọc đó thì cả cánh quân hành quân tới một điểm đang khoá rồi đứng
     trong vòng tròn tới hết trận — không lỗi nào báo, và nhìn ra y hệt "AI vô tri". Thêm điều
     kiện khoá mới (giờ giấc, phải phá cổng trước…) thì cũng phải đi qua đúng cửa đó.
   · Bộ trọng tài dùng lại được: **`SkirmishMode` (giao chiến thuần — diệt sạch quân địch
     thắng, mất sạch quân thua; gắn một dòng `AddSkirmishShared`)** · `BaseWarMode` (phá nhà
     chính — Demo_17 · Demo_20) · `EscortMissionMode` (xe tới đích/xe nát) ·
     `LastStandingMode` (FFA) · `BossFightMode` · `ZombieSupplyMission` (đếm CHUYẾN GIAO qua
     event `FetchDelivered`, không đếm kiện ngoài rừng — kiện có thể nằm chỗ không ai còn
     sống để lấy).
     ⚠ `SkirmishMode` có BA chốt chặn, thiếu cái nào cũng ra kết cục sai: chỉ đếm NGƯỜI
     (`StickmanFighterController` — đếm cả tháp là trận không bao giờ xong) · phải THẤY cả
     hai phe có quân rồi mới chấm (thứ tự OnEnable không xác định + `ApplyTroopCount` nhân
     quân sau Start — chấm sớm là thắng ở frame đầu) · còn `ITroopSource.IsProducing` thì
     chưa tuyên bố thắng (màn viện binh theo đợt có quãng sạch bóng địch giữa hai đợt).
     Đã gắn: Demo_3 dàn trận · Demo_21 công sự · Demo_34 trèo tường · Genre_Fantasy_Duel.
   · Mode cần nhà chính thì đặt **`CreateHouseShared` (BaseBuilding THẬT, có máu)** —
     `CreateBaseShared` chỉ là cái sào sơn màu, không phá được, trọng tài không có gì để chấm.

7b. ⚠⚠ **CÓ VẠCH ĐÍCH VẪN CHƯA ĐỦ — PHẢI HỎI "CÓ AI ĐANG TIẾN VỀ NÓ KHÔNG".**
   Đợt rà 2026-09-03 tìm ra ba màn đã có vạch đích tử tế mà vẫn **treo vĩnh viễn**, vì vạch
   đích chỉ tới được khi một bên NHỈNH HƠN — mà builder nào cũng dựng hai phe cân sức:

   | Màn | Vạch đích | Vì sao không bao giờ tới |
   |---|---|---|
   | Kéo co | tuyến chạm căn cứ | tuyến chỉ trôi khi một bên ĐÔNG HƠN ở khu giao tranh; cân quân ⇒ `advantage = 0` ⇒ **cột mốc đứng im** |
   | Chiếm điểm | 120 điểm | điểm chỉ cộng cho phe GIỮ ĐƯỢC vùng; giằng co ⇒ không ai cộng ⇒ cả hai ở dưới mốc mãi |
   | Loạn chiến | còn một người | hai kẻ cuối KHÔNG có lý do gặp nhau, và AI máu thấp thì tự rút lui |

   **Chốt: mỗi màn một cái đồng hồ + một luật phân định KHÔNG PHẢI HOÀ nếu có thước đo sẵn.**
   Kéo co so VỊ TRÍ TUYẾN (luôn nghiêng về một bên) · chiếm điểm so ĐIỂM (hoà là kết cục hợp
   lệ, hai bên cùng 0 sau 5 phút thì đúng là không ai hơn ai) · loạn chiến thì **SINH TỬ ĐỘT
   NGỘT**: quá giờ là mọi người mất máu, tăng dần — hoà trong một ván sinh tử là câu trả lời
   rỗng, còn ép hai kẻ cuối lao vào nhau thì cái đồng hồ thành một pha chơi thật.
   ⚠ Trừ máu qua `TakeDamage` + `forceScale = 0`, ĐỪNG trừ thẳng `_health` (luật cả dự án).

7c. ⚠⚠ **CHUỖI "THẮNG/THUA" PHẢI VIẾT THEO GHẾ NGƯỜI CHƠI.** `TugOfWarLine` viết cứng
   *"…— THẮNG!"* cho phe A và *"…— THUA!"* cho phe B. `Finish` trao đúng phe thắng, chỉ có
   CÂU CHỮ nói ngược — nên từ ngày có nút chọn phe thì ngồi ghế ĐỎ mà thắng sẽ đọc được chữ
   **"THUA!"** trên chính màn hình chiến thắng. Không lỗi nào báo, và đó là dòng chữ CUỐI CÙNG
   người chơi đọc. Dòng `StatusLine` cùng bệnh (*"tuyến ở 80% về phía địch"* trong khi nó đang
   ở sát cửa nhà mình). Suy "thắng hay thua" từ `_playerTeam` ngay tại chỗ viết.

7d. ⚠⚠ **MỌI THỨ TRỎ VÀO NGƯỜI CHƠI ĐỀU PHẢI NGHE `PlayerCharacter.Changed` — KỂ CẢ MÁY SINH
   QUÂN.** Đấu trường giao `player.transform` làm mục tiêu cho `EnemyWaveSpawner`, mà hồi sinh
   thì HUỶ cái xác rồi dựng thân MỚI ⇒ `_target` null ⇒ spawner `return` ngay dòng đầu của cả
   hai vòng ra quân ⇒ **đấu trường ngừng đẻ quân VĨNH VIỄN sau lần chết đầu tiên**, và vì
   `_wave` đứng im nên cũng không còn đường nào thắng. Nay có `EnemyWaveSpawner.SetTarget`.
   Danh sách phải nối lại dây nay là: camera · HUD · ô nhặt đồ · nền văn minh · **máy sinh quân**.

7e. ⚠ **QUỸ MẠNG (`RespawnDirector.SetLivesPerTeam`) LÀ CỦA CẢ PHE, KHÔNG PHẢI CỦA RIÊNG
   NGƯỜI CHƠI.** Màn boss có 2 đồng minh + giáo sĩ cùng tiêu chung: để 3 mạng thì hai ông lính
   AI xài hết trước, và người chơi gục lần ĐẦU TIÊN là thua ngay — một cái thua họ không hiểu
   vì sao. Đặt quỹ thì phải đếm xem phe đó có mấy người, và **hiện số mạng còn lại trên
   `StatusLine`**: nó tụt kể cả lúc người chơi chưa chết lần nào.

8. **BỐ CỤC SINH LÍNH MỖI VÁN MỘT KHÁC** (`GameSession.ShuffleFormations`, mặc định bật):
   hoán CHỖ ĐỨNG giữa các lính TUYẾN cùng phe theo seed — ván này cung thủ nấp cánh trái, ván
   sau dàn giữa. Chỉ xáo lính `HuntTarget`/`FreeRoam`; lính cắm chỗ (GuardTarget/Garrison/
   Follow/Ambush) đứng đâu là LUẬT của màn, dời họ là hỏng bài — đúng tinh thần `MapJitter`
   "đổi CẢM GIÁC, không đổi LUẬT". Người chơi không bị xáo.
9. ⚠ **`MapJitter` PHẢI ĐƯỢC GẮN THÌ MỚI CÓ TÁC DỤNG** — nhãn này từng KHÔNG được gắn ở đâu
   cả: `ApplyMapJitter` quét ra 0 object, map ván nào cũng y hệt, không lỗi nào báo. Nay
   `StickmanEnvironmentBuilder.Place` (chỗ DUY NHẤT rải cây/đá/bụi) tự gắn (`rangeX 1.1` <
   khoảng rải 3.4 để khỏi chồng). Thêm loại trang trí mới ngoài đường `Place` thì phải nhớ gắn.
10. **QUÂN SỐ THEO BẬC KHÓ TẮT cho mode mà quân số LÀ luật chơi** (`AddGameSessionShared(...,
   scaleTroops: false)`): đấu tướng (hai đạo quân đứng xem) · loạn chiến FFA (mỗi người một
   phe — nhân quân chỉ phình đúng phe teamId 2, méo luật chứ không khó lên) · đấu trường
   (quân đã do `ArenaMode` nhồi từng đợt).

Gắn vào scene: `StickmanDemoBuilder.AddGameSessionShared(playerTeam, enemyTeam[, scaleTroops])`
— **chỉ cho scene CHƠI ĐƯỢC**, scene quan sát AI và bàn thử thì không (ở đó không có ván nào
để thắng). Đã phủ: 7 chế độ (funnel `FinishModeScene`) · 4 kiểu chơi mới · 4 trung cổ ·
doanh trại · 2 zombie · đột nhập · 3 thuỷ chiến. Sân map (`Demo_29..31`) CỐ Ý đứng ngoài —
nó có vòng chơi lại riêng (map ngẫu nhiên theo seed + leo thang + CSV).


---

## ⚠⚠ MODE KINH TẾ DOANH TRẠI — XÂY DỰNG · TỔ CANH NHÀ · THẺ LỆNH (2026-09-05)

Chi tiết + bảng giá: `Docs/KnowledgeBase/EconomyCamp.md`. Bốn quyết định mới của
`Demo_20_WarCamp`, **mỗi cái nối vào một hệ ĐÃ CÓ chứ không đẻ cơ chế mới**:

| Mảnh | Ở đâu | Nối vào hệ nào |
|---|---|---|
| `CampBuildYard` · `CampBuildSite` · `CampBuildKind` | Gameplay | móng là `ResourceNode` kiểu `Build` — `AIStateWork` vốn đã biết xây |
| Tháp canh xây được | Gameplay | `GarrisonPost` + `StickmanClimbZone` + sàn một chiều ⇒ cung thủ tự trèo lên bằng `AIBehavior.Garrison` |
| Rào chắn xây được | Gameplay | `Fortification` kiểu `Barricade` ⇒ `UpdateBlockedPath` tự biết đập |
| `CampHomeGuard` | Gameplay | `AIBehavior.PatrolRoute` + `SetPatrolRoute` |
| `CampUnitOrderHud` | Gameplay | thẻ IMGUI nổi trên đầu, `StickmanUI.ClaimPanel` |
| **BẾN CẢNG** (`CampBuildKind.Harbor`, 2026-09-07) | Gameplay khai · **Naval** lắp | `BaseBuilding` có cấp + cầu tàu; phần hải quân gắn qua `CampBuildSite.Raised` — xem `Docs/AgentRules/Naval.md` §14 |

⚠⚠ **THÊM MỘT LOẠI CÔNG TRÌNH LÀ SỬA SÁU CHỖ, và chỗ dễ sót nhất là `CampGameUi.BuildKinds`.**
Enum hợp lệ · bảng giá có · `Raise` viết xong — mà không liệt kê ở mảng đó thì **KHÔNG XÂY
ĐƯỢC BẰNG BẤT CỨ CÁCH NÀO**, và không lỗi nào báo vì không ai gọi `TryOrder`. Ba nhà lính đã
dính một lần; TRẠM QUÂN Y dính lần thứ hai và nằm chết từ 2026-09-06 tới 2026-09-07 (đã vá
cùng đợt bến cảng). Đủ bộ: 1 giá trị enum · 1 dòng `CampBuildInfo.NameOf` · 1 dòng `BriefOf` ·
1 dòng `DefaultCost` · 1 nhánh `CampBuildSite.Raise` · **1 dòng `CampGameUi.BuildKinds`**
(+ `EconomyProfile.buildings` của từng map, vì asset là bản bake của bảng giá trong code).

⚠ Nếu loại mới khai `IsProduction()` thì phải kiểm CẢ `CampProductionBuilding.OfferedTiers`:
hàm đó mặc định trả `Level` cho mọi loại «sản xuất», nên bấm vào BẾN CẢNG lại ra bảng bán bộ
binh — `TryRecruit` chạy trót lọt vì nó chỉ hỏi `OfferedTiers`. Chuồng ngựa và bến cảng đều
phải khai ngoại lệ ở đó.

⚠⚠ **`StickmanAgent.KeepsOwnOrders` LÀ NGOẠI LỆ THỨ BA CỦA LỆNH TUYẾN.**
`CommandNode.ApplyToAgent` và `MatchModeBase.ApplyOrders` ghi đè `SetBehavior` **mỗi nhịp**,
nên mọi nhiệm vụ NHIỀU PHA của một tầng khác đều bị lôi đi giữa chừng — hỏng trong im lặng,
nhìn vào chỉ thấy một anh lính bỏ việc. Hai ngoại lệ cũ (`Garrison` · `Escalade`) là giá trị
`AIBehavior` cố định; cái này là TRẠNG THÁI đổi được lúc chạy nên phải là một CỜ trên agent
(và nhờ vậy `CommandNode` không phải `GetComponent` mỗi nhịp). Cờ cũng tắt luôn `HoldingLine`:
đóng băng một người đang đi tuần là cả tổ canh nhà đứng chôn chân mỗi lần tướng hô «giữ tuyến».
Chủ hiện tại: `CampHomeGuard`, `CampUnitOrderHud` (lệnh «theo tôi»).

⚠⚠ **`GarrisonDirector.EnsureInScene()` sau khi dựng tháp GIỮA TRẬN.** `OnSceneLoaded` của nó
THOÁT SỚM khi sổ `GarrisonPost` còn rỗng, nên scene không bake sẵn tháp thì **không có bộ điều
phối nào tồn tại**. Thiếu dòng đó là cái tháp vừa xây đứng trống tới hết trận, không lỗi nào
báo. Thêm loại công trình sinh `GarrisonPost` lúc chạy thì phải gọi lại.

⚠⚠ **DỰNG CÔNG TRÌNH VÀO OBJECT CON ĐANG TẮT, BẬT SAU CÙNG.** `ConfigureAsStructure` chỉ có
tác dụng khi chạy TRƯỚC lúc object được bật (`_buildBodyHitboxes` đọc một lần ở `Awake`), mà
`CampBuildSite.Raise` chạy từ `Update` của một object ĐANG BẬT. Kèm luật cũ: `GetComponent ??
AddComponent` cho `Fortification` (bẫy `[RequireComponent]` chèn một bản mặc định 3 máu).

⚠⚠ **CÓ CÔNG TRƯỜNG THÌ PHẢI CÓ THỢ.** `TeamEconomy.AutoAssignWorkers` khoá cứng worker của
phe máy vào vàng/củi mỗi 0.75 giây ⇒ nhánh «tự tìm node gần nhất» của `AIStateWork` KHÔNG BAO
GIỜ chạy cho họ. Đặt móng xong mà quên vế này thì tướng máy trả tiền rồi ngồi nhìn. Chừa lại
ít nhất MỘT người đào vàng.

⚠⚠ **LỆNH «ĐI XÂY» PHẢI TỰ HẾT HẠN** (`AIStateWork.TickFind`). Công trường là node dùng xong
thì biến mất, khác hẳn mỏ vàng/rừng củi vốn còn mãi — không trả lệnh về `Automatic` thì đúng
khoảnh khắc khánh thành, người thợ đó đứng chôn chân tới hết trận.

⚠ **Trần quân số và nhịp tuyển đọc qua `TeamEconomy.PopulationCap` / `.TrainCooldown`**, không
đọc thẳng `_profile.*`: trại lính cộng vào hai số đó, bỏ sót một chỗ là cái trại vừa xây không
có tác dụng gì và không có lỗi nào báo.

⚠ **`EconomyProfile.BuildCost` phải có nhánh lùi** (`CampBuildInfo.DefaultCost`): asset đã bake
trước bản này không có mảng `buildings`, mà field serialized thì Unity nạp giá trị ĐÃ LƯU —
không có nhánh đó thì mọi công trình giá 0 và cả hệ xây dựng thành miễn phí trong im lặng.

⚠ **PHẢI BẤM LẠI TOOL:** `★ Bảng điều khiển` → *Doanh trại (hậu cần chiến tranh)* và
*Bộ AI theo gameplay*. Đã tự kiểm: cả hai mục chuyển VÀNG (scene/asset cũ hơn file nguồn).

## ⚠⚠ GIẢI CỨU TÙ BINH — GHIM NGƯỜI TRONG LỒNG · CHẠY VỀ · TRUY SÁT (2026-09-06)

`Demo_32_Rescue` · `PrisonerRescue` · `PrisonerCage` · `StickmanMedievalModeBuilder.BuildRescue`.

⚠⚠⚠ **NGUYÊN NHÂN GỐC CỦA "TÙ BINH BAY LƠ LỬNG GIỮA TRỜI": MỘT THAM CHIẾU SCRIPT KHÔNG CÓ GUID.**

`RescuedPrisoner` từng được khai làm **class PHỤ ở cuối `PrisonerRescue.cs`**. Unity **chỉ sinh
`MonoScript` cho class TRÙNG TÊN FILE**, nên `AddComponent<RescuedPrisoner>()` của builder ghi
vào scene một tham chiếu **không có `guid`**:

```
m_Script: {fileID: 1245339734}          ← không có guid:
m_EditorClassIdentifier: Xoi.Stickman.Gameplay::RescuedPrisoner
```

Đo trên `Demo_32_Rescue.unity`: **78 MonoBehaviour khác đều có guid, đúng 6 cái không có — và
cả 6 là component này**, mỗi tù binh một cái. Lúc chạy màn đã bake,
`GetComponent<RescuedPrisoner>()` trả về **null** cho MỌI tù binh. Trong Editor lúc dựng thì
mọi thứ trông vẫn đúng (component sống trong bộ nhớ); **chỉ bản LƯU là mất**, và không một
dòng log nào nói về tù binh.

Sáu hệ hỏi cái nhãn ấy, cả sáu cùng trả lời sai:

| Hệ | Hỏi gì | Hậu quả |
|---|---|---|
| `CivilizationTeamAssigner.Apply` | `INoAutoDress`? | khoác trọn loadout — **nón sắt, giáp, vũ khí**; bốc trúng kỵ binh thì `StickmanMount` nâng cả nhóm `Sprite` lên lưng ngựa |
| `GameSession.ShuffleFormations` | `ScriptedUnit`? | **HOÁN CHỖ ĐỨNG** tù binh với lính `HuntTarget` cùng phe ⇒ tù binh văng ra chỗ đội cứu, mà `LockUp` chỉ ép lại **Y** ⇒ treo giữa trời |
| `GameSession.ApplyTroopCount` | `ScriptedUnit`? | bậc khó nhân bản / xoá bớt tù binh |
| `RespawnDirector.CaptureTemplates` | `ScriptedUnit`? | tù binh thành **khuôn hồi sinh** |
| `MatchModeBase.ApplyOrders` | `ScriptedUnit`? | bị lôi vào đội hình mỗi 2 giây |
| `PrisonerRescue.WasPrisoner` | có nhãn không? | **về tới nơi KHÔNG được tính** ⇒ «đưa về 0/3» đứng im tới hết giờ |

⚠⚠ **LUẬT: MonoBehaviour/ScriptableObject nào được BAKE vào scene/prefab/asset thì PHẢI có
file trùng tên.** Class phụ chỉ an toàn khi nó sinh ra hoàn toàn lúc chạy bằng `AddComponent`
(`FlashOverlay`, `PoolManager`, `TransientVfx`, `StickmanBodyHitbox`…) — thứ đó không bao giờ
đi qua đường serialize. Đã quét cả dự án: 10 class phụ, chỉ mình `RescuedPrisoner` bị bake.
`StickmanDoctor` nay có phép đo **«Component MẤT SCRIPT trong scene/prefab/asset»** quét đúng
dấu hiệu `m_Script` không guid trên mọi YAML.

⚠ Vá cả cho scene CŨ: `PrisonerCage.Awake` **dán lại nhãn** nếu thiếu (`AddComponent`). Phải ở
`Awake` chứ không `Start` — mọi kẻ hỏi nhãn đều hỏi trong `Start`, mà Unity chạy hết `Awake`
rồi mới tới `Start` nào. Đúng khuôn `PushBarsInFront` ("áp cả lúc chạy, đừng chỉ sửa builder").

⚠⚠ **VẾ THỨ HAI — GHIM MỖI FRAME.** Kể cả khi nhãn còn nguyên, ghim một lần lúc `Start` vẫn
không đủ: sau `Start` còn `MapStudio.DropPeopleToGround` (đổi map → hạ mọi
`StickmanFighterController` xuống nền mới, kẹp cả X qua `layout.SafeX`) và
`RespawnDirector.ReturnTeamsToSpawn` (chơi lại → kéo về điểm ra quân). Người thường bị dời sai
chỗ thì **trọng lực chữa hộ**; người KINEMATIC thì đứng nguyên ở đó.

Chữa bằng **HAI VẾ ĐỘC LẬP**, đừng chỉ làm một:
1. `PrisonerCage.LateUpdate` **ghim lại mỗi frame** — đứng SAU mọi hệ khác trong frame nên
   không phụ thuộc thứ tự `Start`/`Update` của ai. Toạ độ **dựng lại từ collider song sắt**
   (`CageAnchor`) chứ không nhớ một `Vector3` chết: lồng TREO và ĐUNG ĐƯA, ghim theo mốc tĩnh
   là người đứng yên còn cũi lắc quanh họ. Cao độ lấy theo **BÀN CHÂN**
   (`StickmanLocomotion.GroundOffset`), không lấy gốc transform — cùng bẫy đã dính ở móng ngựa.
2. `IPinnedInPlace` (Core) — *"đừng dời tôi, tôi đang bị treo/nhốt/trói"*. `MapStudio` và
   `RespawnDirector` hỏi qua interface, không gõ tên `RescuedPrisoner`. **Có TRẠNG THÁI**
   (`PinnedNow`) chứ không phải marker rỗng như `INoAutoDress`: thả ra rồi thì họ là người
   bình thường và **phải** được hạ xuống đất như mọi ai.
Thêm hệ dời-người-hàng-loạt thứ ba sau này thì chỉ cần hỏi vế 2; vế 1 vẫn đỡ được kể cả khi quên.

⚠⚠ **ĐIỀU KIỆN THẮNG NÀO CŨNG PHẢI CÓ NGƯỜI ĐI VỀ PHÍA NÓ.** Đây là §4b nhìn từ phía NGƯỢC
LẠI: lần trước là *đội cứu* không biết đi phá lồng; lần này là **chính tù binh** không biết đi
về điểm tập kết. `PrisonerCage.FreeAll` thả người ra rồi giao `HuntTarget` (= "đi tìm địch mà
đánh"), trong khi luật đếm NGƯỜI VỀ TỚI ĐIỂM TẬP KẾT ⇒ sáu người tay không lao vào giữa trại
đánh tới chết, thanh «đưa về 0/3» đứng im tới hết giờ, không lỗi nào báo. Nay `PrisonerRescue.
DriveEscapees` lái họ bằng hai trạng thái:

| Trạng thái | Hành vi | Vì sao |
|---|---|---|
| mặc định | `AIBehavior.Travel` → điểm tập kết | `AIStateTravel` đi một chiều, KHÔNG đánh, và **đứng lại đợi** khi địch lọt `travelHoldRadius` (5) — đó chính là nhịp hộ tống |
| bị dí sát (`_lastStandRange` 2.2) | `HuntTarget` kẻ đang dí | `Travel` xoá `Target` mỗi frame ⇒ thiếu vế này là "cứu ra để đứng chịu chết" |

⚠ Ngưỡng đánh trả phải **NHỎ HƠN** `travelHoldRadius`, và phải có **VÙNG CHẾT** (nhả ở
`×1.6`): một ngưỡng đơn thì kẻ địch đứng đúng mép vành làm tù binh rung giữa "đánh" và "chạy"
mỗi nhịp — họ mãi mãi không hoàn thành việc nào (§5c).
⚠ Module `AIWeaponScavenge` **vẫn chạy đè** lên `Travel` (nó ở pha `AfterState` và chỉ bỏ qua
`Flee`/`Fetch`/`Work`), nên ai đi ngang giá vũ khí vẫn tiện tay lụm — không cần code riêng.

⚠ **VỀ TỚI NƠI = BĂNG BÓ + QUAY LẠI ĐÁNH** (`OnRescued`: `Heal(MaxHealth)` + `HuntTarget`).
Cứu người mà phần thưởng chỉ là một con số trên HUD thì màn chỉ có một hướng khó dần đều.
Cho người vừa cứu nhập đội là màn có ĐÀ: cứu sớm thì phần sau dễ hơn. Builder phải rải vũ khí
**ở điểm tập kết** cho vế này chạy được.

⚠⚠ **LÍNH GÁC PHẢI BỎ LỒNG MÀ ĐUỔI — VÀ CẮT NGƯỜI CHẶN ĐẦU** (`DriveManhunt`).
`GuardTarget` có LEASH (`guardLeashRange` 7): địch chạy ra xa chốt là họ BỎ, quay về canh cái
lồng **RỖNG** ⇒ "phá lồng xong là xong, dắt người đi bộ về không ai cản". `HuntTarget` gỡ leash.
Nhưng đuổi từ phía sau thì hai bên cùng tốc độ, **không bao giờ bắt kịp** — nên một người phải
chạy VÒNG LÊN TRƯỚC giữ chốt `ChotChanDuong` (mốc dời mỗi nhịp, luôn nằm giữa người chạy và
điểm tập kết, không quá 60% quãng còn lại). Có **SỔ** `_chasing` chứ không chấm lại từ đầu mỗi
nhịp: không có sổ thì cứ 0.8s cả tốp bốc mục tiêu mới, đổi hướng giữa chừng, không ai đuổi kịp
ai (§5c). Ưu tiên cắt người có chốt **ĐÃ VỠ** (thất nghiệp); rút từ lồng còn nguyên thì vẫn
giữ luật "chỉ rút, không bỏ trống".
⚠ `SendGuardsHome` và chi viện lồng đều phải **bỏ qua người đang truy sát** (`IsOnManhunt`),
không thì hai luật giằng nhau kéo họ về mỗi 0.8 giây.
⚠ Hết người chạy thì **`ReleaseBlocker`** trả người về chốt — thả `_blocker = null` suông là
mất một lính gác đứng canh một chỗ trống giữa đồng tới hết trận.

⚠ **BÁO ĐỘNG THEO ĐỢT** (`RaiseAlarm` / `DriveReserves`). Lồng vỡ = một đợt dự bị xông ra sau
`_alarmDelay` (7s × `Difficulty.timeScale`). Đội dự bị nhận diện bằng **HÀNH VI `Ambush`**, không
bằng tên object hay mảng kéo tay ⇒ builder chỉ việc spawn thêm người ở `Ambush`, còn scene CŨ
chưa dựng lại thì sổ rỗng và mode chạy y như trước.
⚠⚠ **NGƯỜI ĐANG NGỦ KHÔNG PHẢI LÍNH ĐANG TRỰC:** `CollectSides` phải loại `Ambush` khỏi
`_guards`. Để lẫn vào là `DriveManhunt` bốc luôn họ đi truy sát — mà `SetBehavior(HuntTarget)`
CHÍNH LÀ cái đánh thức ⇒ cả cơ chế "viện binh ra theo đợt" bị đi vòng qua trong im lặng.
⚠ Viện binh đứng **SAU lồng cuối** (x ≥ 22) nên luôn phải chạy ngược chiều đoàn tù binh; sinh
ở phía điểm tập kết là thành chặn sẵn, không còn là viện.

⚠ Giờ tăng 180s → **200s**: từ nay tù binh phải ĐI BỘ cả quãng đường về (trước đây luật đếm
người về nhưng không ai đi về, nên đồng hồ chưa từng phải trả tiền cho quãng đường đó). Chuyến
xa nhất là lồng 3 (x = 18) về x = −26 — 44 đơn vị, ~15s chạy suông, cộng các lần đứng khựng.

⚠ **PHẢI BẤM LẠI TOOL:** `★ Bảng điều khiển` → mục dựng scene trung cổ (*16. Prisoner Rescue*).
Đội dự bị · giá vũ khí ở điểm tập kết · lính gác thứ 5 của lồng 3 · giờ 200s đều nằm trong
builder, chưa dựng lại thì scene cũ chỉ có phần chạy lúc runtime (ghim lồng · chạy về · truy sát).

### ⚠⚠ Bổ sung 2026-09-05 — hai lỗi "không ai hỏi câu đó"

**`ResourceNode` PHẢI CÓ CHỦ.** `FindNearestAvailable` quét 60 đơn vị mà không hỏi node của
ai, trong khi hai doanh trại chỉ cách nhau 44 ⇒ nông dân đi **xây nhà cho phe địch** (và đào
mỏ địch khi mỏ nhà đầy chỗ). Chốt: `_teamId` mặc định **−1 = trung lập** + `BelongsTo`, và
worker truyền phe của mình vào. Mặc định phải là −1 chứ không phải 0: 45 scene đã bake không
có trường này, để 0 là mọi node thuộc "phe 0" và không worker nào làm được gì.

**CẤP TRANG BỊ LÀ BẤT BIẾN, KHÔNG PHẢI THAO TÁC MỘT LẦN.** Có ít nhất năm tầng cùng ghi số đó
(`UnitRankGear` · `WeaponTierSetter` · `UnitLoadout` · `CivilizationDefinition` · 
`StickmanExperience`), nên đặt đúng lúc sinh là chưa đủ — sai TÙY LÚC. `TeamEconomy.TickTierAudit`
soát lại mỗi 2 giây bằng phép áp idempotent. Đây là khuôn chung: **thứ gì nhiều chủ cùng ghi
thì phải có một nhịp soát, đừng đi tìm "đường gọi nào ghi sai".**

## BỐN CÔNG TRÌNH XÂY ĐƯỢC THÊM (2026-09-06)

| Loại | Giá (vàng/củi/công/trần) | Nối vào hệ |
|---|---|---|
| Hàng rào `Palisade` | 6 / 20 / 5 / 3 | `Fortification` kiểu Wall `passableForOwner` — vành đai dài, khác Rào chắn ở CỠ và số lượng, không phải ở cơ chế |
| Hầm bẫy `TrapPit` | 12 / 6 / 4 / 2 | `AreaHazard` kiểu Fire mang PHE mình |
| Cột cờ `Flagpole` | 16 / 8 / 3 / 1 | `CampBuildYard.BonusGuards` → `CampHomeGuard.MaxTarget` |
| Chuồng gia súc `Pasture` | 20 / 14 / 6 / 1 | `ResourceNode` kiểu Crop CÓ MỌC LẠI thuộc phe |

⚠ **Chủ của `AreaHazard` phải là GameObject CÓ `TeamMember`** — `Spawn` đọc phe từ đó. Truyền
một object trần là `_ownerTeam = −1` và cái bẫy đốt cả quân mình, không lỗi nào báo.
⚠ **Chuồng gia súc cố ý KHÔNG cộng thẳng của cải vào kho theo nhịp.** "Thu nhập thụ động" là
một cơ chế thứ hai chạy song song với cả hệ nông dân, và nó làm mọi quyết định chia người
thành vô nghĩa. Chuồng phải trả giá bằng NGƯỜI như mọi nguồn khác.
⚠ **`CampHomeGuard.MaxTarget` hỏi sân xây dựng, không tự đếm cột cờ** — đếm ở hai chỗ là có
ngày hai số lệch nhau.
⚠ **Màu theo nền văn minh**: `CivilizationTeamAssigner.For(team).bannerColor`, hỏi ở MỘT chỗ
(`CampBuildSite.BannerTint`). Gameplay (tầng 4) KHÔNG tham chiếu được Map (tầng 6) nên công
trình trại không dùng được bộ chi tiết lắp ghép — cái khoác được lên chúng là màu cờ và tỉ lệ.
Đừng phá ranh giới đó bằng một reference ngược.
⚠ **Công trình phòng thủ ra tuyến trước** (`CampBuildYard.NextSlotX`): tháp canh · rào chắn ·
hàng rào · hầm bẫy. Hậu cần ở sau: nhà kho · trại lính · chuồng · cột cờ.
⚠ `CampGameUi.BuildKindCount` nay SUY TỪ `BuildKinds.Length`, không phải hằng gõ tay — thêm
loại mà quên sửa hằng là `IndexOutOfRange` ngay lúc dựng HUD.

### ⚠⚠ Bổ sung 2026-09-05 (đợt năm) — CHIA VIỆC CHO NÔNG DÂN

**Bộ chia việc phải chạy cho CẢ HAI PHE, không chỉ phe máy.** `AutoAssignWorkers` từng nằm
trong `if (_autoSpend)`, nên nông dân của người chơi rơi vào nhánh "lấy node gần nhất" của
`AIStateWork` — mà mỏ vàng nằm cạnh kho còn rừng củi thì xa hơn ⇒ cả ván chỉ có vàng, không
bao giờ nâng nổi nhà. Lệnh TAY vẫn thắng tuyệt đối qua `WorkerResourceOrder.IsManual`.

⚠ **`IsManual` phải là một CỜ RIÊNG, đừng suy ra từ `_task != Automatic`.** Bộ chia việc cũng
ghi `MineGold`/`ChopWood` vào đúng trường đó, nên suy ra kiểu ấy là mọi worker do máy chia đều
bị coi là "người chơi đã chỉ định" và bộ chia việc tự khoá chính nó sau nhịp đầu tiên.

⚠⚠ **CÔNG TRƯỜNG ĐI TRƯỚC MỎ VÀNG.** `FindNearestAvailable` xếp theo KHOẢNG CÁCH — sai trục:
mỏ/rừng là nguồn VÔ HẠN (chậm một phút không mất gì), công trường là việc HỮU HẠN và nó KHOÁ
mọi móng khác cho tới khi xong. Không ưu tiên thì móng đứng nguyên tới hết trận và bảng xây
dựng báo "đang xây dở" mãi mãi.

⚠ **Mốc tài nguyên phải tính CẢ hai đích chi tiêu.** `DesiredWoodStock` = max(củi nâng nhà,
củi của công trình đắt nhất còn xây được). Chỉ hỏi "đủ củi nâng nhà chưa" thì nâng xong là cả
tổ dồn sang vàng và phe đó không bao giờ xây nổi cái gì.

⚠ **Danh sách "có những loại nào" đọc từ ENUM** (`CampBuildYard.OrderedKinds`), không kê tay:
kê tay thì thêm một loại công trình là âm thầm sót ở bảng số củi. Thứ tự HIỂN THỊ thì chỗ nào
cần cứ tự kê, nhưng đừng dùng bản kê đó để trả lời câu "có những loại nào".

### ⚠⚠ Bổ sung 2026-09-06 — NHÀ LÍNH SẢN XUẤT QUÂN

**Không có nhà lính là không có quân** (`TeamEconomy._requireHalls`). Ba nhà: cận chiến · tầm xa ·
chuồng ngựa (`CampProductionBuilding`). Cấp nhà lính = cấp lính CAO NHẤT mua được; nâng chỉ khi
NHÀ CHÍNH cao hơn — nhà chính là trục công nghệ, nhà lính là nhánh. Cấp thấp vẫn mua được rẻ.

⚠ **Cấp là thứ MUA, không còn là thứ của nhà chính.** `TickTierAudit` ghim lại `WeaponTierSetter.Tier`
của TỪNG người; ghim theo `RecruitTier` như trước là xoá sạch lựa chọn cấp của người chơi mỗi 2 giây.

⚠ **Tàn tích phải trả ô đất.** `CampBuildSite.IsRuined` (nhà có máu đã chết / object đã bị dọn) và
`CampBuildYard.CountOf` bỏ qua nó — không thì một nhà lính bị phá là phe đó mất vĩnh viễn quyền mua
quân, và bảng nói "đã đủ 1 nhà lính" trong khi sân trống.

### Bổ sung 2026-09-08 — TƯỚNG MUA Ở NHÀ CHÍNH (`CampGeneral`)

**BA BINH CHỦNG, MỖI PHE MỘT TƯỚNG SỐNG.** Bảng nhà chính bán `Tướng bộ binh` · `Tướng cung` ·
`Tướng kỵ` (bảng thứ tự `CampGameUi.GeneralKinds` — đọc từ đó chứ đừng kê tay ở chỗ vẽ). Đã có
tướng thì ba hàng gộp lại còn một dòng đọc. Ngã thì mua lại được.

| Số (`EconomyProfile`) | Nghĩa |
|---|---|
| `generalCost` · `generalWoodCost` | giá gốc; 0 = màn KHÔNG bán tướng, HUD ẩn hẳn hàng này |
| `generalHouseLevel` | cấp nhà chính tối thiểu — tướng là MỐC CÔNG NGHỆ, không phải lính đắt tiền |
| `generalArcherSurcharge` · `generalCavalrySurcharge` | phụ phí theo binh chủng |
| `generalCostPerLevel` | giá lên theo cấp nhà chính, vì tướng cũng MẠNH lên theo cấp |
| `generalLoadout` | bộ đồ chủ tướng (tuỳ chọn) — chỉ áp cho tướng BỘ BINH |

`TeamEconomy.GeneralBlockReason(kind)` trả lý do (`đã có tướng` · `cần nhà chính cấp N` ·
`chưa có giống ngựa` · `hết chỗ quân` · `thiếu vàng/củi`) và HUD in thẳng lên nút. ⚠ Làm xám nút
mà không nói lý do thì người chơi không biết phải làm gì tiếp — ba lý do đó là ba việc khác hẳn nhau.

**Sinh qua đúng ruột `TeamEconomy.TrainInternal`** (cùng prefab · nền văn minh · cây chỉ huy) với
cấp trang bị `GearTiers.Max`, rồi gắn `ScriptedUnit` (không hồi sinh miễn phí qua `RespawnDirector`,
không bị bậc khó nhân đôi, và **`CampHomeGuard.PickRecruit` bỏ qua** nên tổ canh nhà không bắt
tướng đi tuần) + `CampGeneral`:

* **Mạnh** — máu ×2.5 · sát thương ×1.35 · nhịp đòn ×1.15 · nhận đòn ×0.8 · kháng choáng 0.6.
  Cùng khuôn `HeroCommander` nhưng số NHỎ HƠN: tướng mua bằng tiền không được ngang nhân vật
  người chơi, không thì người chơi thành khán giả trong trận của chính mình.
* **Cấp** — `_level` = cấp nhà chính lúc mua; mỗi cấp cộng máu · sát thương · bán kính hào quang.
  Không có vế này thì giữa ván tướng hết đáng tiền, trong khi nhà lính thì có cấp.
* **Thông minh** — cấp AI 4, GIỮ được: `INoPlaybook` để playbook (khai `smarts = 2` cho cả sân,
  áp lại mỗi 3 giây) bỏ qua, và `Update` ghim lại khi `AIDifficultyDirector` hạ xuống.
* **Hào quang** — quân cùng phe trong bán kính vừa hồi sĩ khí (cùng cơ chế cột cờ
  `CampBuildYard.ApplyFlagMorale`) vừa nhận buff **ĐỌC ĐƯỢC** qua `CampGeneralAura`: nhận đòn
  ×0.85, đánh nhanh ×1.12, kèm vệt sáng dưới chân. ⚠ Sĩ khí một mình là con số VÔ HÌNH — nó chỉ
  đổi hành vi lúc quân sắp vỡ trận, mà trận doanh trại thì ít lính, nên người chơi trả tiền cho
  thứ họ không cảm nhận được.
* **Gục chờ cứu** — `StickmanDowned` (15s nằm chờ, cứu 1 lần). Xem cái bẫy ngay dưới.
* **Tổ trưởng** — `CommandStructure.AttachAsOfficer` đôn tướng lên bậc 2 và kéo tối đa 3 lính
  trơn về dưới quyền, nên quân bám quanh tướng thành đội hình. Chỉ kéo LÍNH TRƠN: kéo một tổ
  trưởng là cả tổ của người đó đi theo, cây vẫn hợp lệ nên không lỗi nào báo.

⚠⚠ **AI KHÔNG TỰ CỨU TƯỚNG GỤC** — `AIRescueModule` đọc `AIProfile.rescueRadius`, mặc định **0**
(module tự tắt). Nên NGƯỜI CỨU LÀ NGƯỜI CHƠI: `StickmanDowned.CountHelpers` đếm mọi đồng đội còn
đứng được trong bán kính, kể cả nhân vật người chơi. Đây là CHỦ Ý — tướng gục thành một lý do để
bạn chạy tới, thay vì một cái chết lặng lẽ mất 40 vàng. Muốn lính tự cứu thì bật `rescueRadius`
trong `AIProfile` của màn; đừng sửa `AIProfile_Default` (ảnh hưởng cả dự án).

⚠ **KHÔNG gắn `FieldCommander`.** Phe người chơi ra lệnh lên GỐC ẢO ở nhà chính; dán nhãn chủ
tướng lên tướng mua là `TeamCommander.WatchNamedCommander` dựng lại cây với ông ta làm gốc, và
tướng ngã là ba nút «Tấn công · Giữ tuyến · Về thủ» chết lặng. Tướng mua là ĐƠN VỊ MẠNH kiêm tổ
trưởng, không phải cái vô lăng. Tướng máy phe đỏ vẫn là `TuongDo` dựng sẵn (hồi sinh qua
`ScriptedUnit.Respawns`).

**HUD** (`CampGameUi`): dòng tướng trên thanh tài nguyên (binh chủng · cấp · thanh máu 10 ô · đang
gục thì đếm ngược) + nút «TỚI TƯỚNG» đưa camera tới rồi trả về người chơi + báo động khi gục/ngã.
⚠ Trả camera bằng `PlayerCharacter.Current` chứ đừng nhớ transform cũ: người chơi có thể đã hồi
sinh vào THÂN MỚI trong lúc đang xem tướng. ⚠ `CampGeneral.Fell`/`DownedChanged` là sự kiện TĨNH —
`OnDisable` phải gỡ, không thì mỗi lần chơi lại thêm một người nghe đã chết.

**Tướng máy tự mua** (`TeamEconomy.ShouldBuyGeneral` trong `AutoSpend`): đặt SAU hạ tầng, TRƯỚC
lính thường, đòi đã có `aiUpgradeArmySize` quân và không đang bị đánh nhà. ⚠ Không có vế này thì
người chơi có tướng còn phe máy không — ván nghiêng hẳn một phía trong khi mọi hệ đều chạy đúng.

**Bẫy im lặng đã chốt** — `StickmanDoctor` «Tướng mua ở nhà chính»: `generalHouseLevel` cao hơn
`headquartersMaxLevel` thì nút vẫn hiện, vẫn nói lý do đàng hoàng, mà lý do đó KHÔNG BAO GIỜ hết.

**Tiếng**: `General/Hire` · `General/Down` · `General/Fall` (xem `KnowledgeBase/Audio.md`).

### Bổ sung 2026-09-08 (chiều) — TÁM VIỆC LÀM CHẾ ĐỘ DOANH TRẠI SÂU HƠN

**Chẩn đoán trước khi sửa:** mỗi phe có mỏ vàng và rừng RIÊNG, nằm trong trại, gắn cứng theo phe
(`ResourceNode._teamId`), trữ lượng 10.000 tức vô hạn cả ván. Giữa hai trại là khoảng trống. Nên
KHÔNG CÓ LÝ DO NÀO ra khỏi nhà cho tới lúc đủ quân tràn sang, và quyết định duy nhất là tiêu vàng
vào đâu. Bản BẮN SÚNG của chính chế độ này đã có điểm tiếp tế giữa sân từ lâu; bản trung cổ chưa.

1. **MỎ TRANH CHẤP + ĐIỂM TIẾP TẾ giữa sân** (`StickmanWarCampBuilder.CreateMidField`). Mỏ để
   `_teamId` = −1 (`BelongsTo` cho mọi phe), trữ lượng **CÓ HẠN** (900, khác mỏ nhà) nên có nhịp:
   ai ra sớm ăn nhiều, hết mỏ là lợi thế chốt lại. Điểm tiếp tế là `CapturePoint` +
   `SupplyPointIncome`, `_scorePerSecond = 0` (không phải màn đua điểm). Hai thứ ăn theo hai cách
   khác nhau có chủ ý: mỏ ăn bằng NGƯỜI (phải cử thợ ra chỗ nguy hiểm), điểm ăn bằng CHỖ ĐỨNG
   (kéo LÍNH ra giữa) — có cả hai thì cả hai loại quân đều có việc ở giữa sân.
   ⚠ **ĐỐI XỨNG LÀ BẮT BUỘC.** Hai nhà chính ở ∓24; bản đầu đặt MỘT điểm tiếp tế ở x = 6, tức
   tặng phe đỏ 12 đơn vị đường đi — nó luôn tới trước, và người chơi không bao giờ hiểu vì sao
   mình thua cuộc đua đó. Nay hai điểm ∓9: mỗi phe một điểm dễ giữ, cướp điểm địch là một nước đi.
2. **LƯƠNG THỰC** (`EconomyProfile.crop*`, `TeamEconomy.TickFood`). Lính ăn lúa mỗi giây; hết lúa
   ⇒ `IsStarving` ⇒ **không tuyển được quân** + **thu nhập thụ động về 0**. Bãi chăn nuôi
   (`CampBuildKind.Pasture`) nay mới có lý do tồn tại: trước đó nông dân gặt lúa về kho rồi lúa
   nằm đó, `TeamEconomy` không tiêu vào đâu cả.
   ⚠⚠ **HAI VAN CHỐNG KẸT CỨNG, thiếu một là ván đấu chết đứng** (đã dính cả hai lúc mới bật hệ):
   · `cropFreeSoldiers` (6) — ngần này lính ĐẦU TIÊN không tốn lúa. Nguồn lúa duy nhất là bãi chăn
     nuôi, một công trình KHÔNG bắt buộc, nên "mọi lính đều ăn lúa" nghĩa là mua một lính xong là
     đói vĩnh viễn, không mua được gì nữa tới hết trận. `IsStarving` cũng đo theo mốc này.
   · `CampBuildYard.SuggestNext` phải có **`Pasture`** — tướng máy trước đó KHÔNG BAO GIỜ xây nó
     (danh sách gồm 14 loại, thiếu đúng cái này), nên phe đỏ đói vĩnh viễn và cả trận đứng im
     trong khi mọi hệ vẫn chạy đúng.
   Kèm `startingCrop` (40) để người chơi có một quãng đánh trước khi phải nghĩ tới bãi.
   ⚠ **Cố ý KHÔNG phạt sát thương khi đói**: `DamageDealtScale` là MỘT ô số mà `HeroCommander` và
   `CampGeneral` cùng ghi — thêm người ghi thứ ba là ô đó thành số rác. Hậu quả của đói nằm trong
   chính tầng kinh tế.
3. **BẢNG NÂNG CẤP TOÀN QUÂN** (`CampTech`): LÒ RÈN (+1 cấp trang bị cho quân mua sau) · NÔNG CỤ
   (nông dân làm nhanh hơn) · QUÂN LƯƠNG (nới trần quân số). Mua một lần, vĩnh viễn, không mất khi
   nhà sập. Ba trục KHÁC NHAU (đồ · kinh tế · quy mô) nên mua cái nào trước là quyết định thật.
   ⚠⚠ **NÔNG CỤ hỏi qua `WorkSpeed` ở Core.** `AIStateWork` ở module AI (2), `CampTech` ở Gameplay
   (4) — gọi thẳng là gãy ranh giới module, mà biên dịch gộp cả `Assets/` thì KHÔNG lộ ra. Gameplay
   khai nguồn trả lời bằng `WorkSpeed.SetProvider`, đúng khuôn `ContestedZones`.
   ⚠ Hỏi theo NGƯỜI ĐANG ĐÀO, không theo cái mỏ: mỏ giữa sân trung lập, hai phe cùng đào.
4. **BÁO ĐỘNG TRẠI** (`CampGameUi.CampAlarmText`). `TeamEconomy.HomeUnderAttack` đo được từ lâu
   nhưng KHÔNG chỗ nào trên giao diện đọc nó: người chơi dắt quân đi đánh, nhà bị đập, chỉ biết khi
   quay về. Nay hiện trên dòng tướng (hai báo động không bao giờ cần cùng lúc), đứng TRÊN mọi tin
   về tướng vì nhà sắp mất gấp hơn máu một người.
5. **ĐIỂM TẬP KẾT** (`CampRallyPoint` + `CampRallyEscort`). Quân mới mua đi tới mốc rồi mới nhập
   tuyến. Dùng `SetKeepsOwnOrders(true)` + `GuardTarget`, cùng cửa với tổ canh nhà.
   ⚠⚠ **PHẢI CÓ HẠN GIỜ** (20s): cờ `KeepsOwnOrders` làm cây chỉ huy bỏ qua người đó hoàn toàn,
   nên bất kỳ nhánh hỏng nào (mốc trong tường, bị chặn đường) là anh ta đứng ngoài mọi mệnh lệnh
   tới hết trận, không lỗi nào báo. Hạn giờ là van cho cả những nhánh chưa nghĩ tới.
   ⚠ Không dùng `RallyBanner`: đó là "CẢ ĐẠO QUÂN theo tôi" (ghi đè mốc tuyến của gốc), còn đây chỉ
   NGƯỜI MỚI và chỉ tới khi họ tới nơi. Hai ý định khác nhau thì hai cơ chế.
   ⚠ Cắm ở chỗ NHÂN VẬT NGƯỜI CHƠI đứng, không phải chỗ chạm màn hình: lúc bảng mở thì ngón tay
   đang ở trên bảng. Không có nhân vật thì KHÔNG cắm (mốc ở gốc toạ độ sẽ hút quân ra chỗ chết).
6. **LỆNH RIÊNG CHO TỔ CỦA TƯỚNG** (`CampGameUi.OrderGeneralWing`). Trước đây chỉ có hai mức:
   TOÀN QUÂN hoặc TỪNG NGƯỜI — không tách được hai gọng kìm. Tướng đã là tổ trưởng thật
   (`AttachAsOfficer`), nên chỉ cần hai nút trỏ vào `SetManualStance`/`ClearManualStance` của node
   đó. Không đụng gốc: gốc vẫn là vô lăng của ba nút toàn quân.
7. **NGÀY / ĐÊM** (`DayNightCycle`, ngày 90s · đêm 55s). Hệ có sẵn mà chế độ này chưa từng bật.
   `nightSpawners` để RỖNG: đây không phải màn thủ đêm, đêm chỉ đổi ánh sáng và tầm nhìn.
8. **BẢNG TỔNG KẾT** (`GameSession.CampStatsLine`): vàng kiếm được · quân đã mua · quân ngã · hạ
   được. Đọc thẳng sổ `TeamEconomy` (`Stat*`) chứ không dựng hệ đếm thứ hai — hai nguồn đếm là hai
   con số nói khác nhau về cùng một ván.

⚠ **CẦN DỰNG LẠI SCENE** cho mục 1, 3 (bảng công nghệ) và 7: chúng nằm trong builder. Mục 2, 4, 5,
6, 8 là thuần runtime, scene cũ ăn ngay.

#### Bốn cái bẫy của chính đợt này (rà lại mới thấy, 2026-09-08)

* ⚠⚠ **`CapturePoint` LÀ MỐC TIẾN QUÂN, kể cả khi `_scorePerSecond = 0`.** Nó khai
  `IContestedZone` và tự đăng ký, mà `CommandNode.ComputeLineAnchor` ĐỌC `ContestedZones` **TRƯỚC**
  `pushToEnemyBase`. Nên hai điểm tiếp tế giữa sân kéo cả đạo quân về giữa thay vì đánh nhà chính:
  hai phe lật qua lật lại quyền sở hữu, cùng đứng đó, và **ván không bao giờ kết thúc** trong khi
  HUD vẫn ghi luật thắng là phá nhà. Chốt bằng cờ mới `CapturePoint._isCampaignObjective` (mặc
  định TRUE cho mọi màn chiếm điểm); vùng chỉ SINH LỢI phải tắt nó.
* ⚠⚠ **`_manualStance` chỉ được đọc ở GỐC cây.** `DecideAsSubordinate` không hề đọc nó, nên nút
  «Tổ tướng: ĐÁNH» (đặt lệnh tay lên một node CẤP DƯỚI) không đổi được gì — nó chỉ bật
  `_manualLocked`, tức TƯỚC quyền tự rút của tổ đó. Bấm «Về thủ» toàn quân rồi bấm nút này thì tổ
  tướng thủ chặt hơn chứ không tấn công: nút hứa một việc và làm việc ngược lại. Nay
  `DecideAsSubordinate` trả `_manualStance` của CHÍNH node trước, rồi mới tới `UnderManualOrder`.
* ⚠⚠ **`Destroy(this)` rồi `OnDisable` cũng gọi `Release()` là chạy HAI LẦN.** `CampRallyEscort`
  trả quyền, bị `CampHomeGuard` nhận vào tổ canh nhà trong cùng frame, rồi `OnDisable` cuối frame
  trả quyền LẦN NỮA — tước cờ của tổ canh nhà. HUD in "Giữ nhà 1/1" mà người đó đi theo tuyến, và
  tổ không chọn ai khác vì danh sách vẫn chứa anh ta. Mọi lớp tự huỷ kiểu này phải có cờ chốt
  (`_released`), cùng khuôn `_applied` của `CampGeneralAura`.
* ⚠ **Field-initializer của `EconomyProfile` là giá trị của MỌI asset cũ trên đĩa.** `techCost = 30f`
  làm bốn màn khác dùng chung `CampGameUi` tự mọc ba nút nâng cấp sáng, có giá, bấm không ăn (chỉ
  builder Doanh trại dựng `CampTech`). Trường tính năng mới phải mặc định **0 = tắt**; builder nào
  muốn thì tự khai số.

### ⚠⚠ Bổ sung 2026-09-06 (chiều) — TRẠM QUÂN Y & DỜI NHÀ

**Ba van chống bất tử của trạm quân y** (chi tiết ở `Docs/KnowledgeBase/EconomyCamp.md` §13):
khoá hồi khi vừa ăn đòn (2.5s) · trần cấp tuyệt đối `infirmaryMaxLevel` NGOÀI luật "không vượt
cấp nhà chính" · `Heal` tự kẹp ở máu tối đa. **Van số 1 là quan trọng nhất** — không có nó thì
hai tuyến chém nhau giữa trạm và bên có trạm không bao giờ chết.

⚠ **Một hàm trả lời cho CẢ đặt móng lẫn dời nhà** (`CampBuildYard.SpotBlockReason`). Hai bản kê
luật riêng thì sớm muộn "đặt được mà dời tới đó lại không được", và người chơi đọc ra là bảng
hên xui.

⚠⚠ **`NextSlotX` phải ĐI TÌM CHỖ TRỐNG THẬT, không tin vào chỉ số đếm.** Từ ngày công trình bị
phá được và dời được, "số nhà đã có × khoảng cách" không còn là một ô trống — một cái nhà sập
làm mọi cái sau tụt chỉ số, và ô đó có thể đã bị dời nhà khác vào ⇒ hai công trình mọc chồng
lên nhau, không lỗi nào báo.

⚠ **Nút không làm được việc thì phải NÓI LÝ DO.** Nút ◀ ▶ bấm mà nhà đứng im, không kèm chữ,
thì người chơi tưởng hỏng — trong khi luật đang làm đúng việc ("đè lên nhà kho").

## ART THẬT CHO CÔNG TRÌNH TRẠI · CẤP NHÀ NHÌN RA ĐƯỢC (2026-09-06)

### Móc nối tầng, không phải reference ngược

Bộ chi tiết lắp ghép (271 mảnh art thật) ở tầng MAP (6); công trình doanh trại ở tầng GAMEPLAY (4).
Tầng thấp không tham chiếu lên tầng cao, nên `CampBuildSite` vẽ nhà bằng **khối chữ nhật tô màu**
trong khi 271 tấm art nằm ngay bên cạnh — đúng câu *"hình ảnh chưa được tích hợp vào gameplay"*.

Chữa bằng factory hook (AGENTS §Module):

| Mảnh | Tầng | Việc |
|---|---|---|
| `CampBuildingArt` + `ICampBuildingArtist` | Gameplay | sổ đăng ký + đơn đặt hàng |
| `CampStructureArtist` | Map | bản cài đặt duy nhất, tự đăng ký ở `RuntimeInitializeOnLoadMethod` |
| `CampBuildSite.TryDressWithArt` | Gameplay | hỏi trước, không ai nhận thì vẽ khối màu như cũ |

⚠ **Đừng bỏ đường vẽ dự phòng.** Sổ chỉ có người nhận khi tầng Map được nạp và `MapLibrary` có
bảng chi tiết. Bài test và sân thử không nạp thư viện map — bỏ nhánh khối màu là mấy scene đó có
công trình VÔ HÌNH, mà `BaseBuilding` vẫn sống và vẫn có máu nên không lỗi nào báo.

⚠ Dựng ở chế độ **bóng nền** (`silhouette = true`): `CampBuildSite` đã tự có hitbox trigger và
`BaseBuilding`. Dựng nhà "thật" là mỗi căn có hai hitbox chồng nhau (một mũi tên ăn hai lần) và
mấy mảnh `Solid` biến nhà trang trí thành vật cản đặc giữa doanh trại.

### Cấp nhà phải NHÌN RA ĐƯỢC

Bản cũ nâng cấp chỉ `localScale *= 1.06f` — nhà cấp 3 to hơn cấp 1 đúng 12 %, cùng một khối chữ
nhật nâu. Người chơi bỏ vàng ra rồi không thấy gì đổi.

⚠⚠ **Đổi VAI NHÀ theo cấp cũng không đủ — đã thử và hỏng.** `HouseStyle` khoá số tầng theo vai:
`Barracks` là `minFloors = maxFloors = 1`. Nên `heightHint` gấp rưỡi vẫn ra đúng một cái nhà một
tầng y hệt, và nhà lính cấp 1 với cấp 2 chỉ khác nhau đúng cái cờ.

Chốt: **vai giữ nguyên (nghề đọc được qua cả ba cấp), cấp mọc thêm CÔNG TRÌNH PHỤ.**

| Cấp | Cụm |
|---|---|
| 1 | nhà chính |
| 2 | + chái thấp bên phải + cờ trên nóc |
| 3 | + tháp bên trái + cột cờ + nền đá |

Cánh phụ đặt sát (0.75–0.78 × bề ngang) và thấp hơn hẳn — đặt xa là hai công trình rời nhau, mà ô
đất mỗi công trình chỉ rộng chừng đó. Vẫn là bóng nền: tháp phụ không có thang, không có suất đứng
(cho nó suất đứng là quân nhà tự leo lên một cái tháp trang trí).

`CampProductionBuilding.TryUpgrade` gọi `CampBuildSite.RedressForLevel`; không vẽ được thì rơi về
cách phóng to cũ. `RedressForLevel` chỉ gỡ đúng nhánh `Art` — quét sạch con là mất thanh máu,
mất hitbox và `BaseBuilding.Setup` trỏ vào một transform đã chết.

## CÔNG TRÌNH BỊ PHÁ PHẢI XÂY LẠI ĐƯỢC (2026-09-07)

`CampBuildYard.CountOf` và `SpotBlockReason` đều đã biết bỏ qua công trình đã sập — nhưng câu hỏi
"đã sập chưa" thì trả lời sai.

⚠⚠ `CampBuildSite.IsRuined` cũ trả `transform.childCount == 0` cho mọi thứ không phải nhà lính.
Mà **công trình sập KHÔNG bị xoá**: `Fortification` không bao giờ tự huỷ, `BaseBuilding` chỉ tự
huỷ khi có `ruinDespawnSeconds > 0` (chỉ nhà lính khai số đó). Nên rào chắn · hàng rào · chòi canh
bị phá xong **vẫn đếm là còn sống mãi mãi**: mức trần loại đó khoá cứng, ô đất khoá cứng, người
chơi không xây lại được cái vừa mất. Không lỗi nào báo — object vẫn còn, `childCount` vẫn khác 0.

Nay hỏi đúng component giữ máu: `_production` → `BaseBuilding.IsDie` → `Fortification.IsDie` →
(không có máu thì còn object là còn).

### Dọn tàn tích

`TickRuin` huỷ móng sau `RuinLingerSeconds` = 8 giây. Chờ chứ không dọn ngay vì hai lẽ: người chơi
phải KỊP THẤY nó sập, và rào/hàng rào khai `repairable: true` (nông dân có pha đi sửa) nên dọn
ngay là cướp mất cơ hội cứu. Sửa xong thì `IsRuined` trả false và đồng hồ tự đặt lại.

### ⚠ Tàn tích vẫn chiếm chỗ

`SpotBlockReason` **thôi bỏ qua** công trình đã sập. Bản cũ bỏ qua với ý "ô đất coi như trống",
nhưng cái xác vẫn đứng đó suốt 8 giây — đặt móng mới lên đúng chỗ là hai công trình chồng khít
lên nhau. Mức trần thì vẫn thả ngay (`CountOf` bỏ qua tàn tích), nên xây lại được liền, chỉ là
xây chỗ khác hoặc đợi dọn xong.

### ⚠⚠ Bổ sung 2026-09-07 — THÂN BỊ DỌN MANG THEO LUÔN CÂU TRẢ LỜI

Vá trên vẫn hụt đúng cái loại đã khai `ruinDespawnSeconds`: **nhà lính**.

`BaseBuilding.SetSiegeRules(ruinDespawnSeconds: 8)` gọi `Destroy(gameObject)` trên CẢ object thân
— mà object đó giữ `BaseBuilding` LẪN `CampProductionBuilding`. Tám giây sau cú sập, cả ba câu
hỏi của `IsRuined` (`_production` → `BaseBuilding` → `Fortification`) đều trả null, rồi câu cuối
(`transform.childCount == 0`) trả **false** vì giàn giáo `_scaffold` vẫn nằm đó, chỉ tắt đi.

Móng thành "còn sống" vĩnh viễn ⇒ `CountOf` vẫn đếm ⇒ **nhà lính tầm xa bị phá là không xây lại
được bao giờ**, nút chỉ nói khô khốc *"đã đủ 1 nhà lính tầm xa"*. Không lỗi nào báo.

Nay `CampBuildSite` nhớ một cờ `_hadBody` (đặt trong `Raise()` khi có `BaseBuilding` hoặc
`Fortification` con). Móng nào TỪNG có thân mà nay không còn thân thì là tàn tích:
`IsRuined` trả true trước khi rơi xuống `childCount`, và `Update` dọn luôn cái móng.

⚠ Bài học chung: **đừng đo "còn sống" bằng số con hay bằng sự tồn tại của object**. Object có thể
bị dọn bởi một hệ khác (ở đây là luật công thành), và lúc ấy mọi câu hỏi "có component X không"
đều trả null — im lặng, giống hệt trạng thái "chưa dựng gì". Phải có một cờ nói *"cái này đã từng
có"* thì mới phân biệt được "chưa có" với "đã mất".

## CÂN BẰNG MODE KINH TẾ — TƯỚNG MÁY PHẢI NHÌN SANG PHE KIA (2026-09-07)

Người dùng báo: *"mua thật nhiều lính cấp 1 rồi tấn công là phá được nhà, địch không có lính
phòng bị"*. Không phải "AI ngu" — hai con số của tướng máy đều **không hỏi phe kia đang có gì**.

### Lỗ 1 — ba anh lính là khoá sạch tiền để nâng cấp

`TeamEconomy.UpgradeReserve` giữ TOÀN BỘ giá nâng nhà ngay khi `Population >= aiUpgradeArmySize`
(**3**). Đúng khi hai bên ngang nhau — lính cấp cao trả lại được ở trận dài. Nhưng người chơi có
nước đi rẻ hơn hẳn: mua thật nhiều lính CẤP 1 rồi kéo sang ngay. Tướng máy ngồi tích tiền với ba
anh lính trong sân, và nhà nó sập trước khi cái cấp mới kịp có nghĩa.

Chốt: `TeamEconomy.IsOutnumbered` (`Population < RivalArmy`) — bị áp đảo thì **tiền thành QUÂN,
không thành CẤP**. Nới cả `UpgradeReserve` LẪN nhánh nâng nhà chính trong `AutoSpend`; nhánh sau
tiêu tiền TRƯỚC cả `UpgradeReserve` nên thiếu nó thì chốt kia vô nghĩa. Bắt kịp quân số là hai
nhánh tự mở lại — không ai bị khoá cứng.

### Lỗ 2 — phòng bị hoàn toàn PHẢN ỨNG

`CampHomeGuard.DecideTarget` cũ chỉ có hai mức: yên bình = **1** người, có địch trong sân =
`intruders + 1`. Tức phòng bị chỉ lớn lên **sau khi** quân người chơi đã đứng giữa trại — lúc ấy
tổ giữ nhà gom được vài người thì nhà đã mất nửa máu.

Chốt: thêm mức **RĂN ĐE** đo bằng `RivalArmy` × `RivalShare` (0.4 — dưới 0.5 có chủ ý, vì mode
này thắng bằng PHÁ NHÀ ĐỊCH nên hai bên cùng thủ là ván đấu đứng im). Người chơi nuôi càng đông
thì càng nhiều người ở lại giữ nhà, và đó vẫn là quân THẬT mua bằng tiền thật — không sinh ra từ
không khí, không đụng máu/damage (xem `AIDifficultyDirector`: ăn gian số là người chơi cảm nhận
được ngay).

Và trần: `MaxTarget` (4 + cột cờ) là trần của **BẢNG NGƯỜI CHƠI** — nhỏ để họ không lỡ tay nhốt
cả đạo quân ở nhà. Tướng máy chấm lại mỗi 1,5 giây theo cục diện nên dùng `AutoMaxTarget` =
`max(MaxTarget, quân/2)`; giữ trần cứng 4 thì quân người chơi đông tới đâu, nhà địch cũng chỉ có
bốn người giữ. **Nửa quân là hết mức.**

⚠ `RivalArmy` là MỘT con số cho CẢ HAI lỗ. Đếm ở hai nơi là có ngày hai số lệch nhau, rồi tướng
máy vừa dốc hết ra tuyến vừa tưởng mình đang thủ.

## TÍNH CÁCH TƯỚNG MÁY — MỘT VÁN MỘT ĐỐI THỦ KHÁC (2026-09-07)

`CampAiStyle` + `CampAiStyles` (`Assets/Scripts/Gameplay/Camp/CampAiStyle.cs`).

Vấn đề: mọi con số của tướng máy — nhịp xuất quân, ngưỡng gom quân, mua lính cấp mấy, tích tiền
nâng cấp hay không — đều là **MỘT bộ duy nhất**, nên ván nào cũng y hệt ván nào. Tìm ra một nước
đi thắng được bộ số đó (*"tạo nhiều lính cùi cấp 1 rồi tấn công"*) là từ đó về sau ván nào cũng
thắng bằng đúng nước ấy.

| Tính cách | Nhịp đánh | Ví tiền | **Hở ở đâu** |
|---|---|---|---|
| QUẤY RỐI | ra quân mỗi 13s, đợt ngắn 8s, `regroupSpread = 0` (không chờ gom) | lính rẻ, dự trữ ×0.55 | từng đợt mỏng — thủ chắc là gãy |
| GOM QUÂN | 34s/đợt, đợt dài 20s, gom chặt (26) | lính tốt, dự trữ ×1 | quãng nín thở dài — bị đánh sớm thì đuối |
| BIỂN NGƯỜI | 20s/đợt, đợt 15s | dồn HẾT vào lính cấp thấp (dự trữ ×0.3), +2 nông dân | cấp thấp — quân tinh nhuệ cắt được |
| TINH NHUỆ | 30s/đợt, đợt 16s | nhịn ăn lên cấp (×1.6), mua cấp CAO NHẤT | ít quân — biển người tràn được |

⚠ **Mỗi tính cách phải có một chỗ HỞ đọc ra được.** Một tính cách mạnh đều là tính cách duy nhất
người chơi từng gặp (ba cái kia thành nền), và ta quay lại đúng vấn đề ban đầu.

### Ba cái bẫy của bản vá này

* **`CommandDoctrine` là ScriptableObject DÙNG CHUNG.** Sửa thẳng lên nó là hai phe cùng đổi tính
  cách, và ở Editor thì thay đổi **ghi đè lên asset** — ván sau mở ra đã mang sẵn số của ván
  trước. `Personalize` luôn `Instantiate` một bản sao.
* **`AIPlaybook` áp lại học thuyết MỖI 3 GIÂY** (`reapplyInterval` của builder). Không gọi
  `MarkDoctrineFromScene()` sau khi gán bản sao thì tính cách sống được đúng ba giây rồi biến
  mất — không lỗi nào báo.
* **Chỉ phe MÁY** (`_autoSpend`). Phe người chơi cũng có `TeamEconomy`, mà "tính cách" ở đây nói
  về cách TIÊU TIỀN và NHỊP XUẤT QUÂN — hai thứ người chơi tự quyết.

### Và phải HIỆN RA

Thanh tài nguyên in thêm `· địch: QUẤY RỐI`. Không hiện thì người chơi chỉ thấy "ván này địch đánh
lạ" mà không bao giờ học được cách đọc nó; một cái tên biến sự ngẫu nhiên thành thứ CHƠI ĐƯỢC.
Cùng bài học với `AISmartsTable.SummaryFor` (*"bấm xong rồi mà không biết AI có khôn hơn thật
không"*).

⚠ `_rollStyle` tắt được: đo cân bằng mà để ngẫu nhiên thì hai lần đo không so được với nhau.

## DEMO_20 BA TẦNG — HẦM CHẠY DƯỚI TRẠI, MÓNG NHÀ BÁM ĐỒI (2026-09-07)

Màn «Kinh tế · doanh trại» là scene **bake** (`StickmanWarCampBuilder`), không đi qua hệ map — nên bảng luật map không chạm tới nó (người dùng báo *"không thấy 3 tầng"* đúng vì thế).

Từ 2026-09-08 phần hầm + đồi + cầu đá nằm ở helper chung **`StickmanTieredTerrain`** (Editor) — builder khai `Layout` rồi `Build`; Demo_20 và `Demo_15_Escort` cùng dùng (xem Escort.md). Sửa mối nối tầng thì sửa ở helper, đừng chép về builder.

* **Hầm chạy DƯỚI trại** [16..38] mỗi bên: nhà chính, kho, nông dân đứng trên NẮP (`TunnelLid`, tag Ground). Miệng trước phía sân, miệng sau sau lưng kho ⇒ địch chui xuống trước trại, trồi lên sau nhà chính. Đây là thứ hệ lô không làm được (lô không chồng lô); scene bake tự đặt khoảng nên làm được.
* **Móng nhà hỏi mặt đất thật**: `CampBuildYard.GroundYAt` → `TerrainGround.SurfaceYAt`; `MoveTo` bám theo. Bản cũ đặt mọi móng ở `_groundY` cứng — đúng khi đất phẳng, sai ngay khi có đồi (nhà lơ lửng / chôn).
* **Không đặt móng lên cầu thang** (`StickmanStairs.Span`): một cái rào ở miệng hầm là bịt tuyến dưới cho cả hai phe mà không lỗi nào báo.
* **Sau trại cố ý PHẲNG**: mỏ/rừng/kho là helper cũ (`AILabBuilder.Node/Prop`, `CreateHouseShared`) đặt ở `GroundTop` cứng; cho đồi chạy qua là chúng lơ lửng. Đồi chỉ ở sân giữa (±16), nơi không có gì đặt sẵn ngoài cầu vượt (chân thang có khoảng phẳng riêng).
* **AI dùng các tầng**: `LaneNav` tự dựng đồ thị khi scene nạp; học thuyết bật `useHighRoad` + `pincerDepth`, và `CampAiStyle` phân hướng theo tính cách (quấy rối = gọng kìm vào lưng, tinh nhuệ/gom quân = đường trên).

## NGỰA CHỈ TỚI TỪ CHUỒNG · CẤP LÍNH TỚI TỪ NHÀ LÍNH (2026-09-07)

### Lính cưỡi ngựa dù chưa xây chuồng

`TeamEconomy.TryTrainInternal` gọi `CivilizationTeamAssigner.Dress` → `UnitLoadout.ApplyTo`, mà hàm ấy **phát lại TRỌN BỘ loadout theo quân chủng** — loadout kỵ binh của nền văn minh có `mount`, nên một anh BỘ BINH mua ở nhà lính ra lò ĐÃ CƯỞI NGỰA dù phe chưa có chuồng nào. Không lỗi nào báo — `CivilizationTeamAssigner` đã ghi chính cơ chế này trong chú thích (bẫy tù binh cưỡi ngựa).

Chốt: ở mode **nhà lính** (`_requireHalls`), sau khi khoác nền văn minh thì **gỡ con ngựa** nếu `fallbackMount == null`. Ngựa là thứ phải TRẢ GIÁ: xây chuồng (xác suất theo cấp) hoặc mua ngựa rời. Mode khác không đổi — ở đó `TryTrainCavalry` đi qua `forcedLoadout`.

### Cấp lính: NHÀ CHÍNH mở trần, NHÀ LÍNH quyết

Chuỗi thật: cấp nhà chính → trần cho cấp nhà lính (`CampProductionBuilding.UpgradeBlockReason`) → cấp nhà lính = cấp lính mua được. Nhưng HUD in *"lính mặc đồ cấp {RecruitTier}"* theo **cấp nhà chính** và nút nâng in *"Nâng nhà → đồ cấp N"* — hai bảng nói ngược với thứ đang chạy, người chơi nâng nhà chính xong không hiểu vì sao lính vẫn cấp cũ. Nay HUD đọc **cấp nhà lính cao nhất** (`HallTierText`) và nút nâng nói đúng việc nó làm: *"mở nhà lính cấp N"*.

## KHOẢNG TRỐNG SAU MỖI NHÀ (2026-09-07)

`CampBuildYard.MinSpacing` cũ chỉ vừa đủ để hai nhà không đè lên nhau, nên chúng đứng sát nhau
thành một dãy tường liền. Trên map vòng đó là hỏng hẳn một tính năng: cánh quân vòng ra sau lưng
tới nơi và **không có chỗ nào để đứng đánh**, vì "phía sau nhà" rộng đúng 0.

`RearClearance = 1.6` cộng thêm vào `MinSpacing`, và mọi phép đo khoảng cách trong `SpotBlockReason`
đổi sang `MapWrap.Distance` — trên map vòng hai cái nhà ở hai mép là **hàng xóm**.

## CƯỚP CỜ: VÁC CỜ PHẢI TRẢ GIÁ, VÀ NGƯỜI CHƠI PHẢI THẤY CỜ Ở ĐÂU (2026-09-08)

### Cái giá của việc vác cờ — `CaptureTheFlag._carrySpeedScale` (0.78)

Trước lần này người vác giữ NGUYÊN tốc độ và vẫn leo thang được, nên chiến thuật tối ưu là
chộp cờ rồi chạy vòng vòng, hoặc trèo lên chỗ cao mà đứng. Cả hai biến *"giành cờ"* thành
*"đuổi bắt một người chạy nhanh bằng mình"* — không có cách nào bắt kịp, trận đứng lại ở thế
bế tắc, và không con số nào nói ra.

⚠⚠ **DÙNG LẠI Ô `SetCarryLoad` CỦA THANG CÔNG THÀNH, ĐỪNG ĐẺ Ô THỨ CHÍN.** Ô ấy vốn gói sẵn
đúng hai vế cần: **đi chậm** VÀ **không bám thang được** (`StickmanLocomotion.TryEnterClimb`
chặn ở `IsCarryingLoad`), mà `StickmanAgent.LaneAccess` cũng đã đọc cờ ấy nên `LaneNav` tự
không định tuyến người vác qua đường thang. Thêm ô riêng cho lá cờ là ba chỗ phải nhớ sửa cho
một luật. (Các ô độc lập của `StickmanLocomotion`: giáp · trạng thái · bơi · ra đòn · vác đồ ·
độ nặng vũ khí · sức khoẻ · dốc — lá cờ dùng chung ô "vác đồ".)

⚠ Cái giá của việc dùng chung ô: **một người không thể vừa vác THANG CÔNG THÀNH vừa vác CỜ** —
buông thứ này là `ClearCarryLoad` trả tốc độ cho cả thứ kia. Hôm nay vô hại (map cướp cờ không
có thang công thành), nhưng ngày nào ghép hai thứ vào một màn thì phải tách ô, đừng chữa bằng
cách nhớ thứ tự gọi.

⚠⚠ **TRẢ TỐC ĐỘ VÀ BỎ NHIỆM VỤ PHẢI Ở CHUNG MỘT HÀM** (`ReleaseCarrierBrain`). Ba đường thoát
đi qua đó: cờ rơi vì người vác chết · bị cướp giữa chừng · mode bị huỷ. Tách ra là sót đúng một
đường, và người đó **đi chậm tới hết trận** dù cờ đã sang tay từ lâu — không lỗi nào báo, chỉ
có một anh lính tự nhiên lê chân mà không ai đoán ra là do lá cờ. Giữ `_carrierLegs` riêng, đừng
đọc lại từ `_carrier`: người vác chết thì `_carrier` đã null trước khi kịp trả.

### Lá cờ lên la bàn — `WorldMarkers.Register(_flag, Objective)`

Cả trận chỉ có MỘT vật tranh chấp mà trước lần này nó không có dấu nào. AI thì biết chính xác
cờ ở đâu (mode dời cột mốc cho chúng mỗi frame), **người chơi là bên DUY NHẤT bị bịt mắt**: cờ
rơi ngoài khung hình là chạy loanh quanh đi tìm. `PaintFlag` gọi thêm `WorldMarkers.SetTeam` nên
dấu đổi màu theo phe đang vác — xa mấy cũng đọc được cục diện.
⚠ Gỡ dấu trong `OnDestroy`: sổ giữ `Transform`, để lại là lần vẽ HUD sau ném
`MissingReferenceException` giữa lúc đang vẽ.

## CHIẾM ĐIỂM: CHỐT HỒI SINH TIẾN THEO ĐẤT CHIẾM ĐƯỢC (2026-09-08)

`CaptureScoreMode._forwardSpawn` — quân ra lò ở điểm SÂU NHẤT phe đó đang giữ ("sâu nhất" = xa
NHÀ MÌNH nhất, đo bằng `MapWrap.Distance` nên map vòng vẫn đúng). Luật đầy đủ, các bẫy và bảng
tra ở [Respawn.md](Respawn.md) mục «Chốt hồi sinh biết tiến lên».

Cộng với hiệp phụ (`HoldsForOvertime`), hai mode tranh chấp nay có đủ ba vế của thể loại:
**thắng thì được thưởng đường về ngắn hơn** · **thua thì vẫn còn cửa lật** (thanh chiếm chưa
chạy hết là chưa hết giờ) · **hoà thì đá thêm, có trần**.

## ⚠⚠ MODE NẰM TRONG SCENE LÀ MODE CHỈ CÓ Ở MỘT KIỂU NHÌN (2026-09-13)

Đo được trên cây mã: **36 lớp trọng tài, 13 gắn được lên mọi map, 22 chỉ được `AddComponent`
bởi builder SCENE.** Hệ quả: 22 kiểu chơi đó **không tồn tại ở sân 3/4** — không phải vì thiếu
map (cả 28 `MissionType` đều đã có map 3/4), mà vì không có chỗ nối.

Bảng phân loại 22 mode và ba công thức chuyển: [`Docs/KnowledgeBase/ModePortTo34.md`](../KnowledgeBase/ModePortTo34.md).

### Luật khi thêm / chuyển một kiểu chơi

1. **Luật thắng không liên quan tới kiểu nhìn thì ĐỪNG gắn nó vào scene.** Thêm một giá trị
   `ModeKind` + một `case` trong `MapModeBinder` là mode chạy trên mọi map, cả hai kiểu nhìn —
   đây là phép NHÂN mà `GameFactory.md` nói tới. `BattlefieldMode` là bản mẫu.
2. **Mode cần đồ đạc thì NỐI vào đồ map đã dựng, đừng dựng bản thứ hai.** `MapWarCampSetup` là
   bản mẫu: map `WarEconomy` đã có trại · kho · mỏ · nông dân, lớp lắp ráp chỉ thêm ví + ban
   xây dựng + bảng điều khiển.
3. ⚠⚠ **`EditorSetup` bọc `#if UNITY_EDITOR` là bức tường khoá mode trong scene.** Nâng nó
   thành `Setup` runtime rồi để `EditorSetup` gọi lại — giữ MỘT nguồn sự thật. Đã làm cho
   `TeamEconomy` và `CampBuildYard`.
4. ⚠ **Thiếu thứ không bịa được thì BÁO rồi thôi, đừng lắp một nửa.** Bảng giá trống mà vẫn lắp
   ví là kiểu chơi kinh tế không có kinh tế: xây gì cũng miễn phí, và không có lỗi nào báo.
5. ⚠ **Sân 3/4 không chỉ là "map khác".** Mọi phép đặt chỗ theo trục X phải hỏi lại chiều sâu:
   ban xây dựng đặt mọi móng ở một `groundY` là cả cái trại nằm trên một đường thẳng
   (`CampBuildYard.NextSlotDepth`), đội hình xếp theo X là cả đạo quân nối đuôi nhau
   (`GroundFormation`).
6. **Mỗi mode mới phải có phép đo trong `StickmanDoctor`** nói rõ nó hỏng trong im lặng kiểu
   gì — xem «Dàn trận» và «Doanh trại».
