## ĐƯA MỘT THỨ VỀ ĐÍCH — "bảo vệ VIP" và "hộ tống hàng" là MỘT nhiệm vụ, HAI cái skin

`IEscortJourney` (Core) · `AIBehavior.Travel` + `AIStateTravel` (AI) · `WaypointMover` +
`EscortMissionMode` (Gameplay) · `MapObjective` (Map). Sân: **`Demo_4_Guard`** (đưa GIÁO SĨ
về làng) · **`Demo_15_Escort`** (đưa XE HÀNG về kho) · map `ProtectVip`/`Escort` · AI Lab bài 3.

⚠⚠ **"BẢO VỆ VIP" CŨ THẮNG BẰNG CÁCH ĐỨNG YÊN — ĐÓ LÀ CẢ VẤN ĐỀ.** Luật cũ là *giữ VIP sống
tới hết giờ*, nên chiến thuật tối ưu là lùi vào góc rồi chờ đồng hồ; không có tuyến đường thì
không có chỗ nào nguy hiểm hơn chỗ nào, không có "sắp tới nơi rồi", và ở `Demo_4` thì chính
NGƯỜI CHƠI là VIP nên **không có ai để bảo vệ** — cái tên màn nói dối. Nay nó là ĐÚNG một
nhiệm vụ với hộ tống: **thứ được hộ tống TỰ ĐI từ A về B, tới nơi là thắng, mất nó là thua.**

| Vế | Xe hàng | VIP / giáo sĩ |
|---|---|---|
| Đi bằng gì | `WaypointMover` dời THẲNG transform | `AIStateTravel` đi bằng CHÂN qua hệ di chuyển |
| Là cái gì | công trình (`BaseBuilding`) | người (`StickmanNPC` + `StickmanAgent`) |
| Trọng tài · HUD · nhãn mục tiêu | **giống hệt nhau** — cùng hỏi `IEscortJourney` | |

**BỐN CÂU HỎI CỦA HỢP ĐỒNG** (`JourneyActive` · `JourneyArrived` · `JourneyLost` ·
`JourneyProgress` · `JourneyBlocked`): giữ NHỎ, chỉ hỏi *"chuyến đi tới đâu rồi"*. Đừng thêm
"đi kiểu gì" — phình ra là tầng thấp lại biết quá nhiều về tầng cao.
⚠ `JourneyActive` là vế BẮT BUỘC: hợp đồng được `StickmanAgent` implement, mà một ông VIP
đứng gác cũng là `StickmanAgent` — không hỏi thì HUD in "quãng đường 0%" cho người không đi
đâu cả, và luật thắng đi tìm "thứ đang trên đường" bốc trúng ông ta.

**BA LUẬT CỦA `AIStateTravel`, thiếu cái nào cũng hỏng TRONG IM LẶNG:**

1. **KHÔNG BAO GIỜ ĐÁNH** — xoá `Target` mỗi frame (khuôn `Flee`/`Fetch`), và **`Travel` phải
   nằm NGOÀI `IsCombatant`**. Vế thứ hai mới là vế chết người: `MatchModeBase.ApplyOrders` và
   `CommandNode.ApplyToAgent` ghi đè behavior MỖI NHỊP, nên thiếu nó là VIP nhận lệnh "đi giữ
   đoàn" và **không bao giờ nhấc chân về phía cái làng** — nhìn vào chỉ thấy cả đoàn đứng
   nhìn nhau. Kèm theo: loại `Travel` khỏi nhánh rút lui và nhánh aggro-khi-bị-đánh.
2. **CÓ ĐỊCH THÌ ĐỨNG LẠI, ĐỪNG CHẠY** (`AIProfile.travelHoldRadius` 5). Đây là thứ sinh ra
   nhịp hộ tống: đoàn dừng ⇒ vệ sĩ xông ra dọn ⇒ dọn xong đoàn đi tiếp. Cho chạy tiếp là tự
   đâm vào ổ phục kích; cho BỎ CHẠY (kiểu dân thường) là chuyến đi lùi lại và không bao giờ xong.
   ⚠ Phải có VÙNG CHẾT (`travelResumeRadius` 6.5 > hold 5) và **phải QUÉT bằng bán kính ĐI
   TIẾP**: quét bằng bán kính dừng thì kẻ vừa lùi ra tới vành 6.5 biến mất khỏi tầm quét,
   `_threat` về null và đoàn đi tiếp ngay — vùng chết mất tác dụng hoàn toàn (§5c).
3. **MỐC XUẤT PHÁT CHỐT MỘT LẦN** lúc vào state. Đo lại mỗi frame thì bị đẩy lùi nửa bước là
   thanh tiến độ nhảy lung tung, người xem đọc ra là "đang đi lùi".

⚠⚠ **MAP CÓ VỰC = CHUYẾN ĐI DỪNG VĨNH VIỄN.** `StickmanAgent.UpdateJumpOverGap` chỉ nhảy khi
**có ĐỊCH ở bên kia khe** — mà người đi đường không có địch nào cả. Nên nó đứng ở mép tới hết
trận, không lỗi nào báo. `MapBlueprint` đã cấm vực + thang cho `ProtectVip` (và cấm vực cho
`Escort`); thêm map tay thì phải giữ luật đó.

⚠ **GỠ KẸT PHẢI HƯỚNG VỀ ĐÍCH, KHÔNG VỀ PHÍA ĐỊCH.** `PickBreakoutDirection` mặc định húc về
phía địch — đúng cho lính, nhưng VIP bị chèn giữa đám vệ sĩ của chính mình mà húc về phía sát
thủ là nó tự đi nộp mạng. Nhánh riêng cho `Travel` đã có; thêm hành vi "không đánh nhau" mới
thì phải tự hỏi lại câu này.

⚠ **CÁI LÀNG Ở ĐÍCH MANG VAI `Structure`, KHÔNG PHẢI `Headquarters`.** Vai kia là mục tiêu của
luật "phá nhà chính địch" — đặt nhầm là địch thắng bằng cách đốt đúng cái đích mà mình đang cố
đi tới. Và cho nó máu rất cao: không luật nào chấm nó, nhưng một cây tên lạc phá sập vạch đích
thì chuyến đi hết chỗ để tới.

⚠ **`MissionInfo.NeedsClock(ProtectVip)` = false.** Để đồng hồ lại là hai luật thắng cùng lúc,
mà luật "đứng yên tới hết giờ" bao giờ cũng dễ hơn luật "đi hết quãng đường" — tức quay về
đúng bản cũ.

⚠ **Hỏi `MissionPlan.objectiveMoves`, ĐỪNG kê vai trò.** `MapMissionAI` từng chỉ nhận `Cargo`
ở nhánh "mục tiêu biết đi"; từ ngày VIP cũng đi bộ thì màn bảo vệ VIP rơi xuống nhánh "mục
tiêu đứng yên" — phe giữ dàn quân quanh chỗ VIP ĐANG ĐỨNG rồi ở lại đó, còn phe cướp không
bao giờ biết "nó sắp về tới nơi rồi".

**MÀN 1 DỄ, MÀN SAU KHÓ DẦN** — không đẻ hệ mới: `GameRun` đã lo (thắng → `Tier + 1` → ván
sau `GameDifficulty` khôn hơn/đông hơn). Vế còn thiếu đã vá: **`GameSession.ApplyWaveSize`**
nhân quân cho MÁY SINH QUÂN của phe địch.
⚠ `ApplyTroopCount` nhân bản lính CÓ SẴN trong scene, mà màn xoay quanh viện binh (hộ tống,
thủ trại, sinh tồn, đấu trường) thì phe địch có **0 lính lúc bắt đầu** — nhân với con số
không. Thiếu vế này thì bậc "Địa ngục" ra đúng ngần ấy địch như bậc "Dễ", và người chơi đọc ra
là *"thắng rồi mà màn sau chẳng khó hơn"*.
⚠ Chỉ nhân độ ĐÔNG, KHÔNG đụng `maxWaves` (số đợt là vạch đích của màn) và không rút ngắn nhịp
ra quân (đợt sau chồng lên đợt trước là mất luật "dọn gần hết mới ra đợt mới").

⚠ **Sóng VÔ HẠN ở `Demo_4` KHÔNG phạm luật "kiểu chơi vô tận phải có vạch đích"** — vạch đích
là CÁI LÀNG. Nhưng vì vậy nó **không được dùng `SkirmishMode`** (chấm bằng "diệt sạch địch",
mà `IsProducing` không bao giờ tắt ⇒ trận chạy mãi): trọng tài là `EscortMissionMode`.


## Ổ PHỤC KÍCH PHẢI XA ĐOÀN, RA TỪ NHIỀU HƯỚNG, VÀ MAP HỘ TỐNG CÓ BA TẦNG (2026-09-08)

Người dùng báo: *"lính xuất hiện xa vị trí hiện tại của đoàn hộ tống rồi lao tới tấn công; có 3
tầng đường hầm và trên cao giống war map; lính xuất hiện từ nhiều hướng"*. Ba vế, ba chỗ sửa:

1. **Cửa quân phải CÁCH XA mục tiêu biết đi** — `EnemyWaveSpawner._minDistanceFromTarget`
   (`SetMinDistanceFromTarget`). Có số này thì mỗi đợt chỉ xoay vòng trong các cửa cách mục tiêu
   ≥ ngần ấy **tại thời điểm ra quân**; không cửa nào đủ xa thì lấy cửa xa nhất. Cửa cố định dọc
   đường (bản cũ: 6 / 14 / 22) là bẫy câm: xe bò tới ngay cạnh cửa thì cả đợt hiện ra TRONG lòng
   đoàn, không có nhịp "thấy địch từ xa lao tới", mà cửa vẫn hợp lệ nên không lỗi nào báo.
   ⚠ Đo bằng `MapWrap.Distance` (Core) để map vòng vẫn đúng. 0 = tắt — mọi màn thủ trụ không đổi.
   ⚠ Đo được: Doctor «Ổ phục kích nhắm XE HÀNG mà cửa quân không có khoảng cách tối thiểu» đọc
   YAML: spawner có `_target` là Transform của object mang `WaypointMover` mà số này = 0 (hoặc
   scene bake trước khi có trường) thì réo. Chỉ đo XE; VIP đi bộ là `StickmanAgent`, nhìn YAML
   không phân biệt được với lính gác.
2. **Nhiều hướng = nhiều cửa ở nhiều tầng, thứ tự XEN KẼ.** `Demo_15_Escort` có MỘT spawner,
   MƯỜI cửa (`StickmanModeBuilder.CreateAmbush`): mép Tây · hầm Đông xa · cầu Tây · đỉnh đồi
   Đông · hầm Tây gần · mép Đông · đỉnh đồi Tây · hầm Đông gần · cầu Đông · hầm Tây xa; khoảng
   cách tối thiểu **9** (> bán kính xe dừng 5 + tầm quét vệ sĩ). Spawner xoay vòng theo thứ tự
   khai nên hai đợt liên tiếp không cùng hướng: chặn đầu · đuổi sau · trồi lên từ giếng · tụt từ
   cầu xuống. Lính là `HuntTarget` nên tự lao vào xe; đường lên/xuống tầng do `LaneNav` lo
   (giếng = nắp một chiều + `StickmanClimbZone`, cầu = mặt một chiều ⇒ bước `Drop`).
   ⚠ `EnemyWaveSpawner.SpawnWave` chỉ bám độ chênh mặt đồi cho đứa thứ 2–3 khi cửa ĐỨNG TRÊN
   mặt đồi (`OnSurfaceTolerance` 1.1). Cửa ở sàn hầm / mặt cầu cũng có `TerrainGround` phủ cùng x
   — bám theo là đứa thứ hai trên cầu bị đẩy xuống dưới mặt cầu và rơi, trong hầm thì chôn vào nóc.
   Hệ map (`MapAssembler.CreateWaveSpawner`): nhiệm vụ có `MissionPlan.objectiveMoves` (hộ tống ·
   VIP) và sóng nhắm đúng `guardTargetA` thì có **4 cửa ở cả hai mép** (xen kẽ phía) + khoảng
   cách tối thiểu `halfWidth × 0.35` kẹp [6, 12]. Sóng thủ trại / sinh tồn / kinh tế giữ 2 cửa.
   ⚠ Hệ lô không có hầm ("lô không chồng lô", xem Gameplay.md mục Demo_20) — nhiều hướng ở map
   lô chỉ là hai mép; muốn ba tầng thì đó là scene bake.
3. **Ba tầng dùng chung**: hầm + đồi + cầu đá của Demo_20 tách thành `StickmanTieredTerrain`
   (Editor). Builder khai `Layout` (mép · hầm · giếng · đồi · cầu) rồi `Build`; `Demo_15_Escort`
   dựng với `NewSceneShared(flatGround: false)`, hầm `[−27 … 27]`, ba giếng ở −19 · 0 · 19 (0 nằm
   trong thung lũng dưới cầu), đồi/cầu y Demo_20. Helper `LogError` khi giếng ngoài hầm hoặc đè
   lên sườn đồi, thang cầu không nằm dưới mặt cầu — hai lỗi câm nhất của bản Demo_20 ban đầu.
   ⚠ Xe hàng chui DƯỚI cầu: `WaypointMover.FollowGround` bỏ qua mặt cao hơn 1.2 so với xe nên
   không nhảy lên mặt cầu; mặt cầu chỉ cao hơn đỉnh đồi 1.5. Hạ `bridgeRise` xuống dưới 1.2 là xe
   "trèo" lên cầu ở nhịp đầu tiên nó đi qua — không lỗi nào báo.
   ⚠ Xe đi ngang NẮP giếng (một chiều, tag Ground): đi trên được. Địch trong hầm cách xe < 5
   (đo cả trục y) vẫn làm xe DỪNG — cố ý giữ, đó là nhịp "nghe động dưới đất".

## BỐN THỨ LÀM CHUYẾN ĐI THÀNH MỘT VÁN CHƠI (2026-09-08)

Sau khi ổ phục kích biết ra từ ba tầng và nhiều hướng, màn vẫn thiếu bốn thứ: người chơi không
có lý do ở lại bên đoàn, sức ép không đổi theo quãng đường, không biết địch tới từ đâu, và mọi
kẻ địch đều CHẠY TỚI chứ không ai NẰM CHỜ.

### 1. ĐẨY XE — `WaypointMover.PushScale`

Xe đi nhanh chậm theo SỐ VỆ SĨ bám sát (`_pushRadius` 3.5): 1 người = ×1.0, mỗi người thêm
`+0.25`, trần `×1.5`; không ai đẩy thì bò `×0.35`. Đây là thứ biến *"đi theo cái xe"* từ lời
dặn thành LUẬT: bỏ đoàn đi săn địch là chuyến đi chậm lại ngay, và HUD nói ra bằng số.

⚠⚠ **ĐỪNG ĐỂ `_idlePushScale` = 0.** Màn hộ tống cố ý không có đồng hồ, nên "xe đứng hẳn"
không phải thua chậm mà là **ván treo vĩnh viễn** — đoàn chết sạch giữa đường thì không còn gì
đẩy, không còn gì chấm. Bò chậm thì ván luôn có chỗ kết thúc (về đích, hoặc xe bị phá).
⚠ **Chỉ đếm NGƯỜI** (`StickmanFighterController`): sổ `TeamMember` chứa cả công trình, mà
CHÍNH CÁI XE cũng nằm trong sổ với phe của đoàn — không lọc thì xe tự đếm mình là một người đẩy
và nhánh "không ai đẩy" không bao giờ chạm tới.
⚠ **Lọc CHIỀU CAO** (`_pushSlackY` 1.4): map ba tầng thì người dưới hầm (−2.4) và người trên cầu
(+2.7) nằm đúng một toạ độ X với xe. Không lọc thì một anh đi lạc dưới hầm vẫn "đẩy" cái xe
trên mặt đất — hệ số nhảy lên mà quanh xe không có ai.

### 2. SỨC ÉP THEO QUÃNG ĐƯỜNG, KHÔNG THEO GIỜ — `EscortMissionMode.Surges`

Ba nấc theo `JourneyProgress`: **30%** (+1 quân/đợt) · **60%** (+1) · **85%** (+2, "đợt chặn
cuối"). Mỗi nấc gọi `AddPressure` rồi **thả ngay một đợt**.

⚠⚠ **VÌ SAO KHÔNG ĐO BẰNG ĐỒNG HỒ.** Sức ép theo giờ thưởng cho lối chơi RÙA: đứng một chỗ dọn
sạch địch rồi mới nhích thì đồng hồ vẫn chạy, đợt vẫn ra đều, mà xe chẳng đi — người chơi giỏi
nhất là người đi chậm nhất. Đo bằng quãng đường thì mỗi bước tiến "mua" đúng một phần sức ép, và
chuyến đi có một ĐƯỜNG CONG (yên → chặn giữa đường → đợt cuối ngay trước cổng kho).
⚠ **Phải THẢ NGAY, không chỉ nới số**: chỉ nới thì nấc 85% mới có tác dụng ở đợt kế tiếp — mà
đợt ấy còn cách cả chục giây, người chơi về tới kho trước, và "đợt chặn cuối" chưa từng xảy ra
một lần nào trong ván.
⚠ `AddPressure` **cộng dồn** và chỉ nới ĐỘ ĐÔNG. Đừng đổi sang `SetPacing`: hàm đó ghi đè cả
bảng nhịp builder đã cân.
⚠ `OnFinished` gọi `StopWaves`: không có vế đó thì xe về tới kho, bảng kết quả hiện lên, mà viện
binh vẫn ùn ùn ra sau lưng.

### 3. BÁO ĐỘNG CÓ HƯỚNG — `Announce(text, seconds)`

Nghe `EnemyWaveSpawner.WaveStarted`, đọc `LastSpawnPosition` rồi in *"ĐỢT 3 — địch DƯỚI HẦM,
ĐUỔI TỪ SAU!"*. Tầng đọc theo trục Y (`TierSlack` 1.2), phía đọc theo trục X so với **hướng đi
của đoàn**.

⚠ Trên map một tầng thì "có đợt mới" là đủ; trên map ba tầng hai phía thì đó là tin vô dụng —
người chơi không biết quay mặt về đâu, và cả công phu rải cửa khắp ba tầng chỉ đọng lại thành
*"tự nhiên chết"*.
⚠ **Hướng đi đo từ chính đoàn**, KHÔNG thêm câu thứ sáu vào `IEscortJourney`. Hợp đồng ấy chỉ
được hỏi *"chuyến đi tới đâu rồi"*; thêm "đi hướng nào" là mở cửa cho "đi bằng gì", "đi nhanh
không". Vùng chết 0.05 — thiếu nó thì xe đứng im vẫn "đổi hướng" theo nhiễu số thực và báo động
lật qua lật lại.
⚠ **Lọc máy sinh quân theo PHE**: màn nào có viện binh cho cả hai bên thì báo động réo đúng lúc
quân NHÀ ra lò. Đúng một lần là người chơi thôi tin cái băng-rôn.
⚠ `MatchModeBase.Announce(text, seconds)` là bản CÓ HẠN mới thêm; bản một tham số vẫn đứng mãi
(kết quả ván). Mọi chỗ vẽ đọc property `Banner`, đừng đọc thẳng `_banner`.

### 4. Ổ NẰM SẴN, MỖI TẦNG MỘT Ổ — `StickmanModeBuilder.CreateAmbushNests`

Ba ổ × 2 người, hành vi `Ambush`: **hầm** (giếng giữa, ngay dưới nắp đoàn đi qua) · **cầu** (cung
thủ trên mặt cầu, bung ra là TỤT XUỐNG — thứ duy nhất trong màn đánh từ trên xuống) · **sau đồi
Đông** (khuất tới phút chót, ngay trước quãng cuối về kho).

Máy sinh quân trả lời *"địch tới từ đâu"*; ổ nằm sẵn trả lời câu khác hẳn: *"chỗ này có gì đang
đợi mình"*. Đợt quân bao giờ cũng có quãng thấy nó lao tới nên thưởng cho người ở lại giữ đoàn;
ổ phục kích chỉ bung khi tới sát nên thưởng cho người biết đi trước dò đường. Hai thứ ép hai lối
chơi ngược nhau — phải có cả hai.

⚠⚠ **KẺ NẰM PHỤC KHÔNG ĐƯỢC LÀM XE DỪNG** (`WaypointMover.HasEnemyNearby` bỏ qua
`StickmanAgent.IsLyingInWait`). Xe dừng ở vành 5, ổ chỉ bung ở `ambushTriggerRange` 3.5: kẻ nằm
trong hầm ngay dưới đường xe cách 3.1 theo chiều dọc, nên xe khựng từ khoảng cách 5.0 và **không
bao giờ tới đủ gần để nó bung ra** — chuyến đi treo vĩnh viễn. Không lỗi nào báo: xe đang làm
đúng luật "thấy địch thì đợi vệ sĩ dọn", kẻ phục đang làm đúng luật "nằm im tới khi có mồi".
Lọc TRONG vòng quét chứ không lọc sau khi nhận (cùng lý do `TeamMember.FindNearestEnemyUnit`
phải là hàm riêng).
⚠⚠ **NHỊP SÓNG PHẢI CỘNG CẢ SỐ QUÂN NẰM SẴN.** Nhịp mặc định là `maxAlive` 5 ·
`nextWaveWhenAliveBelow` 2, mà màn có 6 kẻ nằm phục ngay từ đầu ⇒ `Blocked()` đúng ngay nhịp đầu
và **không một đợt nào ra sân**. Nay khai tay: `nextWaveWhenAliveBelow` 7 · `maxAlive` 11.
Đổi `NestSize` thì phải cân lại hai số này.
⚠ **Đặt ổ ở x mà đoàn ĐI QUA**: `AIStateAmbush` chỉ giữ TRỤC X của mốc; ổ lệch khỏi tuyến thì
nằm đó tới hết trận, không ai gặp — nội dung chết, không lỗi nào báo.
⚠⚠ **Ổ TRÊN CAO PHẢI TRỪ HAO CHIỀU CAO.** `ambushTriggerRange` 3.5 đo theo ĐƯỜNG CHIM BAY, mà
mặt cầu cao hơn mặt đất 2.7. Đặt ổ giữa thung lũng (x = 4, đất −1.8) thì khoảng cách xuống đoàn
đúng **3.50** — nằm ngay trên vành, tức có ván nó bung có ván không và không nhìn ra được vì sao.
Ra **x = 6** (đất đã lên −1.03) còn **2.73**, dư 0.77. Bảng đo:

| x | mặt đất | ổ trên cầu | ổ → đoàn | mặt cầu − xe |
|---|---|---|---|---|
| 4 | −1.80 | 1.70 | **3.50** ✗ sát vành | 2.50 |
| 6 | −1.03 | 1.70 | **2.73** ✓ | 1.73 |
| 9.5 (đỉnh đồi) | −0.80 | 1.70 | 2.50 | 1.50 |

⚠ Cột cuối cũng là phép kiểm cho vế "xe chui DƯỚI cầu": `FollowGround` chỉ bám mặt nào chênh
**< 1.2**, mà chỗ sát nhất giữa mặt cầu và xe là **1.50** — còn dư 0.30. Hạ `bridgeRise` (1.5)
hay nâng `hillTop` (1.2) là ăn vào đúng khoảng dư đó, và xe sẽ TRÈO LÊN CẦU ở nhịp đầu tiên nó
đi ngang — không lỗi nào báo, chỉ thấy cái xe tự nhiên bay lên trời.
⚠ `SpawnNpcShared` bake cao độ `GroundTop + 1`, nên ổ trong hầm / trên cầu phải ĐẶT LẠI toạ độ
sau khi dựng. Dời NHÂN VẬT thì an toàn — khác hẳn công trình (`StructureSkin` bake `_groundY`).

## TRẠM KIỂM SOÁT — CHỐT HỒI SINH ĐI THEO ĐOÀN (2026-09-08)

`EscortMissionMode.Checkpoints` = **35%** và **70%** quãng đường. Qua mỗi trạm: chốt hồi sinh
của phe hộ tống dời tới chỗ đoàn đang đứng (`RespawnDirector.MoveTeamSpawn`), và thứ đang hộ
tống được vá `_checkpointRepair` (25%) máu tối đa.

⚠⚠ **VÌ SAO MODE NÀY CẦN NÓ HƠN MỌI MODE KHÁC.** Đoàn đi MỘT CHIỀU từ mép này sang mép kia, mà
chốt hồi sinh đứng yên ở vạch xuất phát: tới cuối chuyến, một vệ sĩ chết là phải lội gần hết
chiều dài bản đồ mới quay lại được. Nghĩa là **càng gần thắng thì đoàn càng mỏng người** — đúng
lúc sức ép theo quãng đường đang dâng cao nhất (nấc 85% là "đợt chặn cuối"). Hai luật đều đúng,
gặp nhau thì thành một cái dốc không leo nổi, và không con số nào nói ra; người chơi chỉ thấy
*"gần tới kho thì tự nhiên vỡ trận"*.

⚠ **Vá máu là PHẦN THƯỞNG CHO TIẾN ĐỘ, không phải hồi máu tự động** — mỗi mốc đúng một lần. Cho
hồi liên tục là luật "mất nó là thua" mất hết trọng lượng, mà đó là cả luật thắng của mode.

⚠ Trạm đặt XEN KẼ với nấc sức ép (địch 30/60/85, ta 35/70): trùng mốc thì hai băng-rôn đè nhau
trong cùng một giây và người chơi chỉ đọc được một cái.
