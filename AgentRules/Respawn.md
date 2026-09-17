## HỒI SINH + CHẾ ĐỘ TÍNH GIỜ (Assets/Scripts/Gameplay/Shell/RespawnDirector.cs · CaptureTheFlag.cs)

Dự án vốn KHÔNG có hồi sinh: chết là nằm đó tới hết trận. Với màn "diệt sạch địch" thì đúng,
nhưng với **mọi chế độ TÍNH GIỜ** (giữ cờ, chiếm điểm, kéo co) thì nó tự tàn — đánh vài phút
là hai bên hết quân, cái đồng hồ vẫn chạy còn sân thì trống trơn. Sáu điều cần nhớ:

1. **SINH NGƯỜI MỚI, KHÔNG DỰNG XÁC DẬY** — đúng bài học zombie. Flow chết đã tắt
   `Rigidbody2D.simulated` của root, tháo `*Ragdoll` sang nhóm khác, tắt nhóm `Sprite`, tắt
   một loạt script per-frame, rồi hẹn giờ đóng băng + dọn xác. Đảo ngược từng bước là chép
   lại nửa flow chết theo chiều ngược, và mỗi lần thêm một bước vào flow chết là phải nhớ
   thêm một bước vào đây.
2. **KHUÔN LÀ BẢN SAO CỦA LÍNH TRONG SCENE, KHÔNG PHẢI PREFAB** — đúng lý do
   `GameSession.ApplyTroopCount` nhân bản lính có sẵn: lính trong scene đã được builder gắn
   đủ loadout · archetype · tính cách · cấp IQ · cờ phe · **cột mốc `_objective`** · cây chỉ
   huy. Dựng lại từ prefab là chắc chắn sót một thứ, mà sót thì KHÔNG có lỗi nào báo — chỉ là
   đứa hồi sinh đánh ngu hơn đứa gốc.
   ⚠ Chụp khuôn trong `Start()`, lúc mọi thứ còn NGUYÊN VẸN. Chụp lúc chết thì cái chụp được
   đã là cái xác.
3. ⚠ **KHO KHUÔN PHẢI TẮT TRƯỚC KHI NHÉT KHUÔN VÀO.** `Instantiate` vào một cha ĐANG TẮT thì
   `Awake`/`OnEnable` của bản sao không bao giờ chạy. Làm ngược lại (`Instantiate` xong mới
   `SetActive(false)`) thì trong đúng khoảnh khắc đó `TeamMember.OnEnable` đã ghi tên cái
   khuôn vào `All` + vào lưới không gian, và `PlayerCharacter.OnEnable` đã CƯỚP danh hiệu
   "người chơi hiện tại" — camera/HUD nối vào một cái khuôn nằm ở `y = -500`.
4. ⚠ **NGƯỜI CHƠI PHẢI ĐƯỢC NỐI LẠI DÂY**: camera (`DemoCameraFollow.SetTarget`) · bảng HUD
   (`StickmanDemoHud.SetPlayer`) · ô nhặt đồ (`StickmanPickupPrompt.SetPlayer`). Ba setter đó
   phải có bản **RUNTIME** (không bọc `#if UNITY_EDITOR`) — thiếu cái nào cũng không có lỗi
   báo, chỉ là camera đứng nhìn cái xác trong khi người chơi đi lại ngoài khung hình.
   Xác người chơi cố ý KHÔNG tự dọn (`_despawnCorpse = false` lúc dựng scene), nên nối dây
   xong là phải `Destroy` nó, không thì mỗi lượt chết để lại một cái xác vĩnh viễn.
5. ⚠ **ĐẾM QUÂN THÌ PHẢI LỌC `is StickmanFighterController`.** Tường/tháp/cổng của phe cũng
   có `TeamMember` và cũng "còn sống" — đếm cả vào thì trần `_maxAlivePerTeam` bị mấy cái
   tháp ăn mất suất và phe đó lúc nào cũng thiếu người, không lỗi nào báo.
5b. ⚠ **RA QUÂN PHẢI ĐẶT XUỐNG ĐẤT — ĐỪNG TIN CAO ĐỘ CỦA CÁI MỐC** (`RespawnDirector.DropToGround`).
   Đo được từ `Demo_32_Rescue`: mốc hồi sinh bake ở `y = −1` trong khi mặt đất ở `y = −2`, nên
   quân ra sân LƠ LỬNG cách đất một đơn vị rồi rơi. Một mình thì chỉ chớp mắt, nhưng mode có
   HÀNG ĐỢI nên lúc nào cũng có người đang rơi — nhìn ra đúng câu *"có mấy lính sinh ra ở trên
   trời"*. Không lỗi nào báo, và **dựng lại scene cũng không chữa được** vì chính cái mốc bake
   sai. Chữa ở CHỖ RA QUÂN chứ đừng đi sửa toạ độ từng mốc trong từng scene: mốc là thứ người
   ta kéo tay, còn "đứng trên mặt đất" là luật của mọi lần ra quân. Tia dò phải bắn từ CAO HƠN
   mốc (mốc có thể nằm dưới đất) và bỏ qua NGƯỜI (quân đang đứng chờ ở cửa không phải nền).

6. **CÓ HAI HỆ, `RespawnDirector` LÀ HỆ RỘNG HƠN.** `PlayerRespawn` (chỉ người chơi, tự gắn
   vào mọi scene qua `PlayerRespawnBootstrap`) **tự tắt** khi scene đã có `RespawnDirector` —
   hai hệ cùng chạy là người chơi được sinh HAI thân mỗi lượt chết. `RespawnDirector` khai
   `ITroopSource` nên câu hỏi "màn này còn đẻ quân không" vẫn trả lời đúng cho mọi ai hỏi.
   ⚠⚠ **NHƯỌNG ĐƯỜNG PHẢI ĐI CẢ HAI CHIỀU** (2026-09-09, từ `MissionType.TeamDeathmatch`).
   Bản cũ chỉ có chiều một: `PlayerRespawn.Start` hỏi *"scene này có `RespawnDirector` chưa"*
   ĐÚNG MỘT LẦN rồi nhớ mãi câu trả lời. Trong scene bake sẵn thì đúng — cả hai cùng nằm sẵn
   trong scene. Nhưng **map SINH LÚC CHẠY dựng `RespawnDirector` SAU ĐÓ** (`MapArena.Start` →
   `MapAssembler.Build`), nên câu hỏi một lần ấy rơi đúng vào nhịp chưa có ai để thấy, và không
   bao giờ hỏi lại ⇒ hai hệ cùng chạy, người chơi có hai thân. Nay `RespawnDirector.Start` tự
   đi **tắt** mọi `PlayerRespawn` đang bật (`YieldPlayerRespawn`). Đây là khuôn chung
   *"cắm-sau thắng hỏi-một-lần"*: bên ĐẾN SAU tự đi báo, đừng bắt bên đến trước đoán trước.

7. **HỒI SINH ĐẾM GIÂY LÀ TRANG BỊ CHUẨN CỦA MỌI CHẾ ĐỘ CHƠI** (`StickmanDemoBuilder.
   AddRespawnDirectorShared(blueX, redX, ...)` — bản nhiều phe nhận `(teamId, x)[]` cho FFA):
   cả người chơi lẫn NPC (kể cả giáo sĩ, nông dân) chết là vào hàng chờ rồi ra lại từ điểm
   hồi sinh của phe. HAI đồng hồ trên màn hình: đồng hồ TO của người chơi + dòng nhỏ
   `⟳ N quân chờ hồi sinh — Xs` (thiếu dòng này thì hồi sinh của bot là VÔ HÌNH: lính chết
   nằm đó, người mới hiện ở mép sân, không ai nối được hai sự kiện với nhau).
   Đã phủ: Demo_13..18 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 32 · 33 · 2 zombie.
   **NGOẠI LỆ duy nhất: THUỶ CHIẾN** — điểm hồi sinh đặt đâu trên mặt biển cũng là chết đuối,
   đặt trên boong thì thuyền chìm kéo cả điểm hồi sinh xuống theo.
   Bốn luật giữ cho hồi sinh KHÔNG phá luật chơi:
   · Nhân vật kịch bản KHÔNG hồi sinh — `ScriptedUnit` (boss · hai vị tướng đấu tay đôi ·
     tù binh · VIP): chết là chết hẳn, đúng vai trò của họ.
   · **DÂN THƯỜNG (Flee) KHÔNG hồi sinh** — `CaptureTemplates` bỏ qua: màn cướp làng giết
     dân được CỘNG GIỜ, dân sống lại là cày giờ vô hạn.
   · Mode coi "người chơi chết = thua" phải HỎI RespawnDirector trước (`BossFightMode` ·
     `ArenaMode` · `LastStandingMode`): có hồi sinh đang chạy thì chết chỉ là MẤT THỜI GIAN.
   · Mode giữ DANH SÁCH nhân vật (đoàn phu của `ZombieSupplyMission`) phải GHI DANH THÊM
     người hồi sinh theo nhịp — danh sách chụp lúc Start chỉ biết đoàn gốc, phu mới mà
     không nối event thì chuyến giao của nó không được đếm.
7b-dot. ⚠⚠⚠ **HỒI SINH RA QUÂN THEO ĐỢT — LẺ TẺ TỪNG ĐỨA LÀ NỘP MẠNG TỪNG ĐỨA**
   (`RespawnDirector.ReleaseWaves`, 2026-09-04 — *"AI công thành đi lẻ tẻ từng thằng vào"*).
   Đồng hồ hồi sinh của mỗi người chạy RIÊNG, nên quân ra lò từng đứa một. Mà điểm hồi sinh
   cách tiền tuyến cả chục đơn vị (`Demo_26_Raid`: **30**), nên mỗi anh lính đi bộ MỘT MÌNH
   suốt quãng đó rồi lao vào giữa cả một đội hình địch và chết ngay. Không lỗi nào báo: mỗi
   lượt hồi sinh đều đúng giờ của nó.
   Nay gom `_waveSize` (3) người của CÙNG MỘT PHE rồi thả một lượt.
   ⚠ **Gom ở CỬA RA QUÂN, đừng bắt AI đứng chờ nhau ở tiền tuyến** — bắt chờ là quay lại đúng
   bẫy ĐÓNG BĂNG của thế trận `Regroup` (§4b-dongbang): cả cánh quân đứng như tượng trong khi
   đồng đội bị chém trước mặt. Ở cửa ra quân thì họ vẫn đánh ngay khi gặp địch, chỉ khác là
   CÙNG RA CỬA.
   ⚠ **BẮT BUỘC CÓ HẠN CHỜ** (`_waveWindow` 4s): còn đúng một người trong hàng đợi thì không
   bao giờ đủ đợt, và anh ta không bao giờ ra sân.
   ⚠ Xét theo TỪNG PHE, và NGƯỜI CHƠI miễn hẳn — bắt người chơi ngồi đợi hai con bot chết nữa
   mới được sống lại là hỏng phần chơi (cùng lý do người chơi được miễn trần quân số).
   ⚠ Vế thứ hai của cùng triệu chứng: **đừng chia cánh khi quân ít.** Gọng kìm đòi ≥3 cánh
   (§4b-kim); toán cướp ~7 người mà chia ra thì mỗi mũi hai ba anh lần lượt lao vào đội hình
   đông hơn. `Doctrine_Raid.pincerDepth` nay là **0**.

7b-dan. ⚠⚠ **TRẦN QUÂN SỐ ĐẾM LÍNH, KHÔNG ĐẾM DÂN THƯỜNG** (`RespawnDirector.AliveOf`,
   2026-09-03 — *"tôi muốn hai phe cứ hồi sinh và đánh tới hết giờ"*).
   Trần trả lời câu *"phe đó còn đủ quân chưa"*, và ai chờ chỗ quá `_npcSlotWaitLimit` (20 s)
   thì **BỊ BỎ LƯỢT**. Nên đếm nhầm là một phe **lặng lẽ ngừng hồi sinh**: ở màn cướp làng, phe
   làng có dân thường (`AIBehavior.Flee`) và thợ — họ là `StickmanFighterController` đầy đủ nên
   ăn suất của trần, nhưng không đánh một nhát nào. Đông dân thì lính xếp hàng 20 giây rồi bị
   huỷ lượt, và cái làng mỏng dần đi cho tới hết giờ trong khi đồng hồ vẫn chạy. **Không lỗi
   nào báo** — hàng đợi vẫn chạy, chỉ là ai cũng bị bỏ.
   Nay `AliveOf` hỏi `StickmanAgent.IsCombatant` — đúng câu hỏi cây chỉ huy dùng để bỏ qua
   thợ/dân (`CommandNode.CollectAgents`). Ai KHÔNG có `StickmanAgent` (người chơi) vẫn tính là
   lính.
   ⚠ Thêm loại nhân vật "có mặt trên sân mà không chiến đấu" (tù binh, phu khiêng, thợ rèn) thì
   tự hỏi ngay: **nó có nên chiếm một suất của trần hồi sinh không?**

7b. ⚠⚠ **TRẦN QUÂN SỐ KHÔNG ĐƯỢC ÁP CHO NGƯỜI CHƠI — và hàng đợi PHẢI CÓ HẠN CHỜ.**
   `RespawnDirector._maxAlivePerTeam` sinh ra để phe MÁY khỏi phình quân, nhưng bản cũ áp
   đều cho cả người chơi và khi quá trần thì **hoãn vô hạn** (`dueTime = Time.time + 1f` mỗi
   nhịp). Ở màn có **NGUỒN ĐẺ QUÂN THỨ HAI** — doanh trại `WarCamp` giữ đủ `_maxSoldiers`
   lính suốt trận, máy sinh quân theo đợt — thì nguồn đó ăn hết suất và hàng đợi treo TỚI HẾT
   TRẬN. Đo được ở `Demo_20_WarCamp`: trần 10, mà hai trại mỗi bên tự nuôi 8 lính.
   Triệu chứng: HUD đứng ở `⟳ 5 quân chờ hồi sinh — 0s` và `HỒI SINH SAU 0…` **không bao giờ
   nhúc nhích** — vì `_playerDueTime` không được dời theo mỗi lần hoãn nên đồng hồ đóng băng
   ở 0. Đọc ra đúng câu *"lâu lâu nó không hồi sinh"*, không lỗi nào báo, chỉ thoát được bằng
   cách chơi lại ván. Ba chốt:
   · **Người chơi MIỄN trần** — bắt người chơi ngồi đợi một con bot chết mới được sống lại là
     hỏng hẳn phần chơi; thừa một suất quân thì không ai đọc ra.
   · **NPC chờ chỗ quá `_npcSlotWaitLimit` (20s) thì BỎ LƯỢT** — trần đầy nghĩa là phe vẫn đủ
     quân, nên bỏ mới đúng ý đồ van an toàn; treo hàng đợi chỉ làm cái van nói dối.
   · **Đồng hồ đang chờ chỗ phải NÓI "chờ chỗ trống"**, đừng hiện `0s`: một đồng hồ đếm ngược
     không bao giờ nhúc nhích là lời nói dối, người xem đọc ra là hệ hồi sinh hỏng.
   ⚠ Bài học chung: **màn đã có nguồn đẻ quân riêng thì trần của `RespawnDirector` là trần
   CHUNG của cả hai nguồn** — đừng gắn hai nguồn vào một phe rồi để trần đếm gộp mà không có
   đường thoát.

7c. ⚠⚠ **AI KHÔNG ĐƯỢC PHÉP MẤT THÌ PHẢI KHAI `IRespawnPriority`** (hợp đồng ở Core, cạnh
   `IRespawnDelay`). Chủ tướng (`FieldCommander`) được miễn trần từ trước; interface này là
   đường khai cho những nhân vật KHÔNG phải chủ tướng mà mất đi thì hỏng luật chơi.
   Chủ đầu tiên: **tướng MOBA** (`MobaHero`). Đo được ở `Demo_63_Moba`: hàng đợi hồi sinh ở đó
   CHỈ có bốn tướng (lính đợt không được `CaptureTemplates` chụp khuôn), nhưng `AliveOf` đếm cả
   lính đợt — mà mỗi phe nuôi tới 24 con. Trần 4 ⇒ tướng chờ 20 s rồi **bị bỏ lượt vĩnh viễn**;
   sau vài phút phe máy không còn tướng nào và bảng tỉ số hiện ☠ tới hết trận.
   Vá hai lớp: builder để `maxAlivePerTeam: 0`, **và** `MobaHero` khai interface để scene đã bake
   trước đó cũng tự lành. Phép đo: `StickmanMobaCheck.CheckRespawnCap`.
   ⚠ Miễn trần **không phải** miễn giờ chờ — giờ chờ vẫn là việc của `IRespawnDelay`.

8. **CHẾT = THÀNH KHÁN GIẢ** (`DemoCameraFollow.TargetIsDown`): trong lúc đếm ngược hồi sinh,
   kéo màn hình (chạm/chuột) hoặc **A/D không cần Alt** để lia xem chiến trường — người chết
   không vung kiếm được nên hai phím đó không còn chủ. Hồi sinh xong `SetTarget` thân mới tự
   kéo camera về nhân vật (`_manualOffsetX = 0`). Đo bằng `IsDie` THẬT mỗi frame, không cờ nhớ.

### CƯỚP CỜ = GIỮ CỜ TÍNH GIỜ (`Demo_23_CTF`)

**Một lá cờ duy nhất** cắm trên nóc thành giữa sân. Chạm vào là vác lên; đang vác thì phe đó
**cộng điểm mỗi giây**; giết người vác là cờ RƠI tại chỗ; hết 3 phút ai nhiều điểm hơn thì
thắng. Không còn "vác cờ địch về cột nhà mình" — kiểu cũ hỏng ở BA chỗ, cả ba trong im lặng:

| Chỗ hỏng | Vì sao |
|---|---|
| `AIStateFetch` xong việc là ĐỨNG IM VĨNH VIỄN | `_delivered = true` rồi thì `Tick` chỉ còn `Locomotion.Stop()`; muốn chạy chuyến nữa phải `SetBehavior` lại mà KHÔNG AI GỌI |
| `_hasFetched` bật khi **TỚI NƠI**, không phải khi **CẦM ĐƯỢC CỜ** | đứa khác vừa vác cờ đi thì nó vẫn quay đầu chạy về "giao" tay không |
| Fetch **không bao giờ đánh ai** (`Agent.Target = null` mỗi frame) | mất hẳn vế "phe kia phải tấn công giành lại" — tức là mất phần CHƠI |

**Lái AI bằng cách DỜI CỘT MỐC, không gọi lại `SetBehavior`** (đúng khuôn cây chỉ huy §4):
mỗi phe một Transform `Anchor_*`, lính để `AIBehavior.HuntTarget` trỏ vào đó ngay từ lúc dựng
scene, mode mỗi frame dời cái mốc tới chỗ lá cờ. Cờ rơi → cả hai phe đổ về tranh; cờ trong tay
địch → mốc bám theo người vác nên cả phe kia đuổi đánh; cờ trong tay phe mình → đồng đội tự
xúm lại giữ. **Không state mới, không hành vi mới, không một dòng nào trong `Assets/Scripts/AI/`
phải sửa.** Vế thứ hai là `StickmanAgent.SuggestTarget` chỉ mặt người vác cho phe địch quanh đó
— dùng lại đúng API của chỉ huy nên đã có sẵn luật lịch sự (đang kề dao vào cổ đứa khác thì
đánh nốt, đang rút lui thì kệ).

⚠ **Nhặt cờ đo bằng KHOẢNG CÁCH THẬT (2 chiều)**, không phải chênh lệch `x` như bản cũ: map giờ
có thành có bậc, đo mỗi `x` thì đứng DƯỚI CHÂN THÀNH cũng vác được lá cờ cắm trên nóc.

⚠ **Cờ nằm lâu không ai nhặt thì TỰ VỀ CHỖ CẮM** (`_idleReturnTime`). Van chống ván chết đứng:
cờ rơi trên mặt thành / dưới khe mà không ai với tới thì cả trận hết chuyện để làm.

⚠⚠ **SÂN CŨ (`CreateKeep`, ĐÃ BỎ) TỰ CHẶN CHÍNH NÓ.** Nó dựng ba KHỐI ĐÁ ĐẶC giữa sân rồi
tin vào "cầu thang hai bên" — mà cầu thang mặc định là ĐI XUYÊN và không ai bảo nó đặc lên
(§7d-vong). Kết quả: cả hai phe đi xuyên qua thang rồi bám vách tới hết giờ. Đó là ảnh chụp
người dùng gửi 2026-09-03.

**SÂN MỚI LÀ HAI LÀN, KHÔNG CÓ MỘT KHỐI ĐẶC NÀO TRONG LÀN ĐI:**

```
      ┌─ THỀM CỜ (một chiều, +2.55) ─┐          ← lá cờ ở đây, chỉ 2 cửa lên
  ════╧═══ ĐƯỜNG TRÊN (một chiều, +1.50) ═══╧════  ← chạy suốt map, tụt xuống chỗ nào cũng được
   ▲        ▲              ▲                       ← 3 cầu thang mỗi bên (ĐI XUYÊN được)
  ────────────── ĐƯỜNG DƯỚI = MẶT ĐẤT ───────────  ← thông từ mép này sang mép kia
```

Ba thứ nó giải quyết, mỗi thứ do một mảnh của bố cục lo:
· **KHÔNG KẸT** — làn đất thông tuyệt đối (đo được: 78 `BoxCollider2D` = 74 bậc thang + 3 thềm
  + 1 mặt đất, KHÔNG có khối đặc nào khác);
· **ĐI VÒNG ĐẰNG SAU** — đường dưới chạy NGAY DƯỚI đường trên của địch, nên lách xuống là đi
  lọt qua cả tuyến rồi leo lên bằng cái thang ngoài cùng (±23), sau lưng họ;
· **NHIỀU ĐƯỜNG CHO NGƯỜI VÁC CỜ** — 3 lối lên mỗi bên + tụt xuyên sàn được ở BẤT KỲ đâu, nên
  người vác chạy đường trên ngay trên đầu đám đang đánh nhau rồi thả mình xuống phía sau.

⚠ Cao độ chọn theo SỐ BẬC, không gõ mét: `StepRise` 0.15 nên 1.50 = 10 bậc và 1.05 = 7 bậc,
chia hết nên bậc chót khớp đúng mặt sàn (gõ số lẻ là hụt chân ngay chỗ đông người).

**ĐỘI HỘ TỐNG CỜ** (`CaptureTheFlag.BuildOrders` + `Side.escortAnchor`): bản cũ dời DUY NHẤT
một cột mốc và đặt nó ĐÚNG CHỖ LÁ CỜ cho cả hai phe — với phe đang cầm cờ, điều đó nghĩa là
**cả đội chạy tới đứng đè lên chính người vác**, hệ giãn cách đẩy nhau ra, không ai chắn được
đòn nào. Nay mỗi phe chia làm hai bằng `TeamOrder.share`: **40% HỘ TỐNG** (`GuardTarget` vào
mốc thứ hai, mode đặt nó GIỮA người vác và mối đe doạ gần nhất) + phần còn lại ĐI TRANH CỜ.
⚠ `noRetreat` cho đội hộ tống — ngưỡng rút lui nằm trong TÍNH CÁCH (cẩn trọng 0.45), không
khai thì vệ sĩ tụt một phần tư máu là bỏ người vác mà chạy, trong khi cả nhiệm vụ của nó là
đứng lại đỡ đòn hộ.
⚠ `CaptureTheFlag.Update` phải gọi `TickOrders()` — màn này có `RespawnDirector`, thiếu nó là
đánh vài lượt xong cả sân toàn lính "đánh đứa gần nhất" và đội hộ tống biến mất trong im lặng.


## CHỐT HỒI SINH BIẾT TIẾN LÊN (2026-09-08)

`RespawnDirector.MoveTeamSpawn(teamId, position, lift)` — dời chỗ ra quân của một phe. Vì
`TeamSpawn.point` vốn là một `Transform`, dời nó là xong, không hệ nào khác phải biết.

⚠⚠ **ĐÂY LÀ CÂN BẰNG, KHÔNG PHẢI TIỆN NGHI.** Mọi mode có mục tiêu DỜI DẦN (chiếm điểm, hộ
tống) đều mắc cùng một bệnh: đánh càng lâu, mặt trận càng xa nhà, nên **phe đang THẮNG bị phạt
nặng hơn phe đang thua** — mỗi cái chết mất cả quãng lội bộ, trong khi phe thủ ra lò ngay cạnh
mục tiêu. Trận bị kéo ngược về giữa sân và không ai dứt điểm được; nhìn vào chỉ thấy *"đánh mãi
không xong"* hoặc *"gần thắng thì tự nhiên vỡ"*, mà không con số nào nói ra.

Hai nơi dùng:

| Mode | Chốt dời tới đâu | Xét lại khi nào |
|---|---|---|
| Chiếm điểm (`CaptureScoreMode`) | điểm phe đó đang giữ mà **xa NHÀ MÌNH nhất** | mỗi `_forwardSpawnInterval` (1s) |
| Hộ tống (`EscortMissionMode`) | chỗ đoàn đang đứng, tại **trạm 35% và 70%** | một lần mỗi trạm |

⚠⚠ **PHẢI XÉT LẠI MỖI NHỊP, KHÔNG PHẢI CHỈ LÚC CHIẾM ĐƯỢC.** Mất lại cái điểm ấy mà chốt còn
nằm đó thì cả phe **ra lò giữa lòng địch** tới hết trận — vòng lặp chết chóc không có đường
thoát, và không dòng nào nói vì sao. `CaptureScoreMode.UpdateForwardSpawn` tính lại từ danh
sách điểm ĐANG SỞ HỮU; không giữ điểm nào thì lùi hẳn về nhà.

⚠⚠ **NHỚ CHỖ NHÀ Ở `Start`, ĐỪNG ĐỌC LẠI GIỮA TRẬN.** Từ nhịp thứ hai trở đi cái Transform ấy
đã bị chính mode dời đi, nên "chỗ nhà" đọc ra là chỗ tiền tuyến lần trước. Mất sạch điểm thì lẽ
ra lùi về nhà, thực tế lùi về đúng chỗ vừa mất. Đọc bằng `TryGetTeamSpawn` một lần rồi cache.

⚠ **`lift` không được bỏ.** Điểm chiếm và xe hàng đều neo ở MẶT ĐẤT, mà quân ra lò đúng toạ độ
chốt: đặt ngay mặt đất là cả đợt hồi sinh nằm nửa người trong đất. Mặc định 1.0 đúng bằng
`StickmanDemoBuilder.RespawnAnchor`.

⚠ **ĐỪNG dùng chung Transform chốt hồi sinh làm CỘT MỐC CHỈ HUY.** Hai hệ cùng ghi một Transform
mỗi frame thì cái nào chạy sau thắng, và không ai đọc ra vì sao cả đạo quân đứng nhầm chỗ. Mốc
chỉ huy có Transform riêng (`Anchor_*`).

## HIỆP PHỤ — ĐỪNG THỔI CÒI GIỮA LÚC CÒN TRANH NHAU (2026-09-08)

`MatchModeBase.HoldsForOvertime(contested, text)` + `IsOvertime`. Dùng ở `CaptureTheFlag`
(hoà điểm) và `CaptureScoreMode` (hoà điểm **hoặc** còn thanh chiếm đang chạy).

Kết thúc tệ nhất của cả ba mode tranh chấp là tiếng còi rơi vào đúng khoảnh khắc giằng co:
thanh chiếm còn 90%, người vác cờ còn hai bước, hai bên hoà đúng một điểm. Ván hay nhất bị cắt
ngang bởi một con số đếm ngược, và người chơi đọc ra là *"game ăn gian"*.

⚠⚠ **ĐIỀU KIỆN GIA HẠN PHẢI TỰ NGÃ NGŨ, HOẶC PHẢI CÓ TRẦN.** Thanh chiếm thì tự tắt (chạy tới 1
hoặc tụt về 0). "Còn hoà" thì KHÔNG: cờ rơi vào chỗ không ai tới, hai phe cùng chết đúng nhịp
đó, AI bận đánh ở góc sân — hoà có thể hoà mãi. Nên cả hai mode đều có `_overtimeCap`
(cướp cờ 45s, chiếm điểm 40s). Không có trần thì ván **không bao giờ kết thúc** và không lỗi nào
báo, vì mọi nhịp đều đang làm đúng việc của nó.
⚠ Đưa vào `contested` một điều kiện có thể đúng mãi mà QUÊN trần — "còn quân sống", "còn điểm
chưa của mình" — là đúng cái bẫy đó. Trần là thứ bắt buộc, không phải tuỳ chọn.
⚠ HUD phải in ra chữ "HIỆP PHỤ": đồng hồ về 0:00 mà ván chưa xong, không có dòng nào giải thích
thì người chơi đọc thành *"game treo"*.
