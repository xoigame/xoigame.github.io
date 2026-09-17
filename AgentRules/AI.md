## AI NPC (Assets/Scripts/AI/)

### GIỮ HÀNG KHI ĐÁNH & ĐÁNH THEO TỔ — kỷ luật đội hình + tổ 2–4 người (2026-09-16)

User: *"AI làm việc teamwork theo đội hình, cover và support lẫn nhau"*.

Bảng: `FormationDiscipline` · `Fireteam` · Trạng thái trên lính: `StickmanAgent.Formation.cs` ·
Hành động: `AIFireteamModule` (`AIModuleKind.Fireteam`, nằm trong `DefaultKinds`).

**Vì sao cần — ba tầng dàn quân đều TẮT ngay khi có địch.** Dự án đã có đủ `TeamCommander`
(chọn hình) → `GroundFormation` / `BuildFormationSlots` (phát chỗ đứng) → `CommandNode` (dời cột
mốc). Nhưng cả ba chỉ DỜI ĐƯỢC CỘT MỐC, mà cột mốc chỉ có nghĩa khi trong tầm nhìn không có
địch: `ApplyToAgent` ở thế `Attack` phát `HuntTarget` cho mọi lính, và `SelectBestEnemy` chấm
điểm theo *khoảng cách TỪ MÌNH* — không một dòng nào hỏi *"kẻ đó cách CHỖ ĐỨNG của tôi bao xa"*.

| Lỗ hổng | Trước 2026-09-16 | Nay |
|---|---|---|
| Đánh nhau là tan hình | bảng điểm mục tiêu không biết chỗ đứng tồn tại | `FormationDiscipline.StrayPenalty` cộng vào `SelectBestEnemy` |
| `TryGetFormationLimitX` quét CẢ PHE, **không trần khoảng cách** — một anh cận chiến lao lên ở nửa sân bên kia là mở khoá cho toàn bộ tuyến cung | mốc `frontX` lấy từ người ở xa nhất, bất kể đứng đâu | chỉ tính người trong `formationLookRadius` (10), lọc lại theo chiều sâu ở sân 3/4 |
| Che chắn không biết đội hình | `FindWard` chỉ lọc bán kính ⇒ khiên cánh trái chạy ngang cả tuyến sang che cung cánh phải | lọc thêm `InReach`, ở **cả hai đầu** (lúc nhận ca và lúc đang che) |
| Không có đơn vị phối hợp nhỏ | chỉ có *cả phe* và *một người* | `Fireteam` 2–4 người |

**Dây xích, không phải cái chuồng.** Khoản PHẠT ĐIỂM có trần (24), không phải phép cấm: kẻ
ngoài dây vẫn đánh được khi không còn ai khác, nên không có ca *"cả tuyến đứng nhìn nhau"*. Kẻ
đang KỀ MẶT (`inContact`) được miễn — bỏ đứa đang chém mình để giữ hàng là tự nộp lưng. Trần 24
phải dưới `LivingFirstPenalty` (200), không thì một người SỐNG ở xa bị chấm tệ hơn một BỨC TƯỜNG
ở gần và cả tuyến quay ra gặm công trình.

⚠⚠ **CÓ GIỮ THÌ PHẢI CÓ TRẢ.** Van bung ở `StickmanAgent.NoteFormationScan`: thấy địch NHƯNG
toàn ở ngoài dây suốt `formationLeashPatience` (5 s) thì nhả dây 6 s rồi xiết lại. Hai vế đều
cần — không có vế *"có địch"* thì cánh quân đứng giữa đồng không cũng tự nhả dây rồi đi lang
thang; không có vế *"trong dây"* thì địch nấp sau góc tường là đồng hồ chạy tiếp. Van CÓ HẠN,
không phải bung một lần rồi thôi: bung vĩnh viễn thì đội hình chỉ sống trong 3 giây đầu trận.

⚠ Dây chỉ tồn tại với người được cây chỉ huy xếp vào hàng (`InFormation`), và **miễn vô điều
kiện** cho `KeepsOwnOrders` (người vác cờ · tổ canh nhà · lính nhận lệnh tay) — cùng ba ngoại lệ
mà `CommandNode.ApplyToAgent` đã phải chừa. Màn không có `TeamCommander` thì hành vi y như trước.

**Tổ 2–4 người.** Mọi cơ chế phối hợp trước đợt này đều là CƠ HỘI (quét bán kính, thấy ai cần thì
giúp, xong thả). Cách đó không làm được ba thứ: ① luân phiên vận động (cần một nhóm CỐ ĐỊNH biết
nhau là ai — hai người bốc lại mỗi nhịp thì không ai chờ ai); ② dồn hoả lực ở tầm CẶP ĐÔI
(`targetSpreadPenalty` cố ý CHIA mục tiêu ra, đúng ở tầm tuyến nhưng ở tầm cặp thì thành *"mỗi
người gặm một nửa"*); ③ ưu tiên che cho người TỔ MÌNH (`SquadSupport.MateBonus`).

⚠⚠ Phép gom **DÍNH**: tổ đã có thì giữ, chỉ gỡ người chết hoặc đã trôi quá `fireteamRadius × 1.6`;
dưới 2 người mới giải tán. Gom lại từ đầu mỗi nhịp là thành viên đổi liên tục, phiên vận động
không bao giờ chạy hết một vòng, và nhìn ra là *"AI chạy tới chạy lui"* — cùng họ với khe đứng
bốc bằng HÀM BĂM và tie-break `Random.value` mỗi frame. Nhịp gom 2.5 s cho CẢ SÂN: `Refresh` tự
chặn bằng mốc static nên 60 lính gọi 60 lần trong một frame thì đúng một lần chạy thật.

⚠⚠ **CHỈ NGƯỜI BẮN ĐƯỢC MỚI ĐỨNG YỂM.** Bắt một anh cầm kiếm đứng nhìn bạn xông lên là vứt đi
nửa sức đánh của tổ để đổi lấy một dáng đứng đẹp — với màn trung cổ (gần như toàn cận chiến) thì
đó là tự thua. Hỏi bằng CÂY ĐANG CẦM (`SquadSupport.ShootsFromAfar`), không hỏi `UnitRole`. Và
chỉ đứng khi BẮN ĐƯỢC THẬT (có mục tiêu sống trong tầm hiệu quả): thiếu vế đó thì *"yểm trợ"*
thành đứng chôn chân ngoài tầm, tổ không bao giờ tới chỗ địch.

**Số** (`AIProfile`): `formationLeash` 4 · `formationLeashPatience` 5 · `formationLookRadius` 10 ·
`fireteamRadius` 6 · `fireteamBoundTime` 2.5. Bậc IQ khai `teamwork = false` thì
`AISmartsTable.Apply` đưa `formationLeash` · `fireteamRadius` · `fireteamBoundTime` về 0 —
`formationLookRadius` thì KHÔNG (nó là trần của một phép quét, không phải một khả năng).

⚠⚠ **`formationLeash` PHẢI NHỎ HƠN `visionRange`** — bẫy bắt được ngay trong đợt viết: bản đầu
đặt 7, mà `AIProfile_Default.visionRange` cũng là 7. Người đứng đúng chỗ thì mọi ứng viên nhìn
thấy đều nằm trong dây ⇒ khoản phạt không bao giờ khác 0 và cả cơ chế KHÔNG TỒN TẠI, trong khi
module lắp đủ, số khác 0, tài liệu có mục đều nói *"đã bật"*. Cùng họ `AIWatchModule`/`Resupply`.
Và phải LỚN HƠN `ContactRange` (2.6): dưới đó thì kẻ đã áp vào tuyến cũng bị chê.

⚠⚠ **NGƯỜI RỤNG KHỎ TỔ PHẢI QUAY LẠI ĐƯỢC.** Bước ghép tham lam chỉ ghép người lẻ VỚI NGƯỜI LẺ KHÁC, nên một anh vừa bị gỡ ra (đi lạc · xong nhiệm vụ riêng · vừa hồi sinh) mà quanh đó ai cũng có tổ thì ở lẻ tới hết trận — dù tổ ngay bên cạnh chỉ có 2 người và thừa 2 chỗ. Nên có bước **XIN VÀO TỔ CÓ SẮN** chạy TRƯỚC bước ghép, và nó phải đo tới đúng cái mốc mà bước dọn dùng (người ĐẦU DANH SÁCH) — hai bước đo hai mốc khác nhau thì có ca vào được rồi rụng ngay nhịp sau, rồi lại vào: một cái máy rung.

**Đo**: `Docs/Tools/sim_leash.py` (mô phỏng theo THỜI GIAN — một lần chấm điểm thì `stray` ≈
`distance` nên nhìn không ra; dây xích là cái chốt chống TRÔI DẦN). Tầm nhìn 20: trôi khỏi chỗ
đứng **7.58 → 5.03**, bề rộng tuyến **13.26 → 7.96**; tầm nhìn 7 (số thật) thì kẻ nhử nằm ngoài
tầm mắt nên nhỏ hơn: **4.63 → 4.03**. `Docs/Tools/sim_fireteam.py`: phép gom DÍNH cắt số lần đổi tổ từ **178 → 9** lần / 30 nhịp (12 lính), **0 người mồ côi**. · Doctor › «Kỷ luật đội hình & tổ chiến đấu» (bảng phạt +
số trong asset + nối dây module + bảng cấp, không cần Play) · AI Lab bài **32 «Giữ hàng & đánh
theo tổ»** — hai phe y hệt, khác đúng ba con số, **bắt buộc có sở chỉ huy ở cả hai phe** (không
có thì không ai vào hàng và bài test xanh cho cả hai dù cơ chế có hay không) và kẻ nhử phải là
TAY BẮN (tầm nhìn 7 nên một cái xác đứng im ở rìa sân thì không ai thấy).

### CHE CHẮN & YỂM TRỢ ĐỒNG ĐỘI — hai kiểu nhìn, một bảng (2026-09-13)

User: *"cải thiện AI ở view 3/4 và ngang, nó biết support nhau và cover cho nhau"*.

Bảng: `SquadSupport` · Hành động: `AICoverAllyModule` (`AIModuleKind.CoverAlly`, nằm trong
`DefaultKinds`) · Lính khiên sân 3/4: `MeleeCombatStrategy.UpdateGroundShieldPosition`.

**Vì sao cần.** Dự án đã tự tay biến bốn lúc thành "đánh vào lúc này là ăn" — và CHỈ ĐỊCH
đọc được chúng:

| Lúc hở sườn | Cơ chế kéo ĐỊCH tới | Phe mình trước 2026-09-13 |
|---|---|---|
| Đang NIỆM CHÚ | `interruptCastBonus` (trúng đòn là vỡ bài) | không ai biết |
| Đang GỤC | `finishDownedBonus` + `ReviveProgress` | chỉ có người đi CỨU (`AIRescueModule`), không ai CHE |
| Đang NẠP ĐẠN | `IsReloading` làm `ShouldAttack` trả false — cây súng câm | không ai biết |
| Tuyến sau BỊ ÁP SÁT | `ScoreRangedHunt` dạy địch đi săn cung thủ | không ai biết |

Vế che duy nhất trước đó là lính khiên (`UpdateShieldPosition`), chấm điểm theo VAI + khoảng
cách trục X, **không có sổ xí phần** (cả tuyến khiên ra cùng một đáp án ⇒ ba người che một
ông) và **không chạy ở sân 3/4** (xem bẫy ① dưới).

**Cơ chế.** `NeedOf` đọc sáu cờ lý do (`Rear · Reloading · Casting · Downed · Pressed ·
Cornered`) từ trạng thái THẬT, không quét lưới thêm lần nào; `Weight` cộng dồn (gục 6 > niệm 4
> áp sát/nạp 3 > bị đánh 2 > tuyến sau 1). `Urgent` **cố ý không chứa `Rear`**: che vì "nó là
cung thủ" thì cả tuyến cận chiến ôm lấy tuyến sau suốt trận — đó là ĐỔI ĐỘI HÌNH (việc của
`CommandNode`/`GroundFormation`), không phải che chắn. `ThreatTo` chọn kẻ để chắn (vừa đánh nó
→ địch gần nó nhất → kẻ nó đang đánh); `ScreenSpot` trả chỗ đứng: **sân ngang chỉ đổi X theo dấu
`MapWrap.Delta`; sân 3/4 là vector 2D** (trục Y ở đó là CHIỀU SÂU). Sổ xí phần có hạn ⇒ một
người che một người, cùng khuôn `CoverTactics.Claim` và `AIRescueModule.ClaimRescue`.

Hai cách support, chọn theo CÂY ĐANG CẦM (không theo `UnitRole` — lính đổi vũ khí giữa trận):
cận chiến **chắn bằng thân + `SuggestTarget` kéo aggro**; tầm xa/phép **đứng lại bắn kẻ đang dồn
đồng đội** ("anh nạp, tôi bắn"). ⚠ Kéo aggro là vế CÓ THẬT về cơ chế: `GunfireRaycast` ghi rõ
*"đồng đội: xuyên qua"* — đứng chắn KHÔNG đỡ được viên đạn nào, nên nếu không kéo được kẻ kia
sang đánh mình thì cú che chỉ là một cái xác đứng đẹp.

**⚠⚠ HAI BẪY IM LẶNG PHÁT HIỆN TRONG ĐỢT NÀY** (cả hai đều biên dịch xanh, không log một dòng):

① **`TryUpdateGroundPosition` trả `true` cho MỌI frame ở sân 3/4**, mà cả bốn strategy đều mở
đầu `UpdatePosition` bằng nó (`CombatStrategies.cs` 1804 · 2422 · 2832 · 3070). Nghĩa là mọi
luật viết SAU dòng đó chỉ tồn tại ở SÂN NGANG — trong đó có cả nghề của lính khiên. Trên sân
3/4, lính khiên đánh y hệt lính kiếm. Thêm luật cho cận chiến/tầm xa mà quên vế 3/4 là lặp lại
đúng lỗi này; nhánh mới phải đặt TRƯỚC `TryUpdateGroundPosition` hoặc nằm trong chính nó.

② **`PublishDepthTarget` nuốt trục sâu của 27 lời gọi `MoveTowardsOnPlane`** (12 state + 8
module). Hàm đó đặt mốc chiều sâu, rồi vài dòng sau trong CÙNG frame `ApplyGroundPlaneSteering`
(nằm sau `TickModules`) ghi đè bằng chiều sâu của KẺ ĐỊCH. Hậu quả ở sân 3/4: người đi cứu /
rút lui / đi nạp đạn / lên xe chạy đúng X nhưng bị kéo lệch chiều sâu. Sửa bằng đầu vào
GHI-MỖI-FRAME `StickmanAgent.RequestDepthTarget` (`MoveTowardsOnPlane` tự gọi, 27 chỗ không
phải sửa dòng nào): **lời nói rõ thắng lái tự động**, hết frame là tự trả lái về mục tiêu/cột mốc.

**Số** (`AIProfile`, mục "Hỗ trợ / che chắn đồng đội"): `coverAllyRadius` 5.5 · `coverFireRadius`
9 · `coverAllyCommit` 2.5; dùng lại `coverDistance` 1.1 và `assistRadius`. Bậc IQ khai
`teamwork = false` thì `AISmartsTable.Apply` ĐƯA CẢ HAI BÁN KÍNH VỀ 0 — thêm luật phối hợp mới
mà quên dòng đó là cái nhãn "không biết phối hợp" nói dối.

**Đo**: Doctor › «Che chắn & yểm trợ đồng đội» (hình học thuần + nối dây module + bảng cấp,
không cần Play) · AI Lab bài **31 «Che chắn & yểm trợ đồng đội»** — hai phe y hệt nhau, khác
đúng hai con số, kẻ đột kích sinh ra SAU LƯNG tuyến sau (đặt ở giữa sân thì tuyến đầu chặn nó
dọc đường và bài test xanh cho cả hai phe dù cơ chế có hay không).

### Người VÁC BÁU VẬT bỏ trận mà chạy (2026-09-07)

`AIBehavior.CarryPrize` + `AIStateCarryPrize` — hành vi thứ 15, dành cho người vừa nhặt được
lá cờ ở CƯỚP CỜ (`MapFlag` hệ map · `CaptureTheFlag` scene dựng tay).

- **Bẫy đã dính:** người vác cờ vẫn là lính thường, mà CHÍNH lá cờ thì chỉ mặt anh ta cho mọi
  kẻ địch quanh đó (`SuggestCarrierToEnemies` / `FocusFireOnCarrier`). `AIStateSeek` thấy địch
  trong tầm là xông vào — tức anh ta đứng lại đọ sức với đúng cái vòng vây mà mode vừa gọi
  tới. Cờ đổi tay ngay tại chỗ nó rơi, không phe nào tích nổi vài giây điểm. Không lỗi nào báo.
- **Luật:** không thấy địch → chạy về `Objective` (căn cứ phe mình; bỏ trống thì lấy
  `HomePosition`) rồi đứng đó ăn điểm. Thấy địch → chạy ngược hướng nó. Bị dí trong
  `meleeRange × 1.35` liên tục 1.6 s → QUAY LẠI ĐÁNH (chạy mãi trước kẻ nhanh bằng mình là
  chết với 0 sát thương). Hết đường lui → tử chiến, KHÔNG ngồi thụp như `Flee`.
- ⚠ Chốt chạy/về có TRỄ (`ShakenOffFactor` 1.6). Vào `retreatSafeDistance` thì chạy, phải
  thoát hẳn ×1.6 mới tính là cắt đuôi — so thẳng với một ngưỡng là ping-pong tại vạch đó khi
  cái nhà nằm đúng phía kẻ đuổi (§5c).
- ⚠ `NavigationFocus` trả CHỖ AN TOÀN, không phải kẻ địch: mặc định của `AIState` là "có địch
  thì địch", tức tầng tìm đường lái người vác cờ XUỐNG CẦU THANG về phía kẻ đang đuổi.
- ⚠ Vào/ra bằng `StickmanAgent.BeginCarryingPrize` / `EndCarryingPrize` — hai hàm này tự bật
  `KeepsOwnOrders` và NHỚ lệnh cũ. Thiếu `KeepsOwnOrders` thì `CommandNode.ApplyToAgent` và
  `MatchModeBase.TickOrders` ghi đè `SetBehavior` mỗi nhịp và kéo anh ta về đội hình ngay giây
  sau. Trọng tài phải gọi `EndCarryingPrize` qua tham chiếu **StickmanAgent đã lưu**, không
  qua `_carrier`: người vừa chết có thể đã bị huỷ, và lúc đó không còn đường nào gỡ cờ —
  người đó hồi sinh xong đứng ngoài mọi lệnh suốt phần còn lại của trận.
- Người vác cờ KHÔNG đi nhặt/nâng cấp vũ khí (`AIWeaponPickupModule` · `TickUpgrade` đã loại).


### Phối hợp quyết định chiến đấu (2026-09-06)

- Dò đạn: chọn viên có thời gian chạm ngắn nhất, dùng chung kết quả trong một frame.
  Né/đỡ/núp không được giành quyền nhau; đạn ngang thân nhường cơ hội đỡ nếu có khả năng,
  cúi chỉ tránh đạn đủ cao. Đỡ chỉ tính khi `Fighter.IsGuarding` thực sự bật;
  muốn hủy đòn đang ra phải qua `Interrupt` và xác suất của profile, không hủy pha Strike.
- Nhận diện đòn bằng **người đánh + SwingId**, không dùng SwingId riêng lẻ.
  Đang chờ lượt vây đánh vẫn phải đỡ mối đe dọa cận chiến khác.
- Đổi vũ khí giữ `CanAutoSwapTo`/genre/ammo; không đổi giữa đỡ, choáng, niệm hoặc nạp đạn.
  Chọn cận chiến có độ hụt tầm nhỏ nhất rồi mới so tầm với; đổi mục tiêu phải xóa lịch sử
  khoảng cách. Đếm cụm bằng truy vấn không gian + khoảng cách 2D, không chỉ cùng tọa độ X.
- Bảo vệ nhà/VIP: tăng trọng số kẻ đang đánh mục tiêu cần bảo vệ theo máu còn thiếu của
  mục tiêu đó, vẫn dùng `defendObjectiveBonus` và thứ tự ưu tiên lệnh hiện có.
- Kiểm tra hồi quy combat/chọn vũ khí bằng `StickmanCombatValidation`; xem đường dẫn tool
  và giới hạn phép đo trong [HitReaction](HitReaction.md). Hành vi theo cấp AI vẫn cần
  quan sát `Demo_8_AILab`, đặc biệt đấu tay đôi và thang cấp; preview test không thay thế.

NPC tự đi tuần / tìm địch / đánh đúng lối của vũ khí đang cầm / đánh trả khi bị tấn công /
săn mục tiêu / bảo vệ mục tiêu (có leash) / rút lui khi yếu máu.
**Sửa/thêm gì trong hệ AI → đọc `Docs/KnowledgeBase/AI-Architecture.md` TRƯỚC**: bản đồ 6 tầng,
8 hợp đồng module, bảng "muốn X sửa đúng chỗ nào", pipeline Update của não, và danh sách bẫy
đã dính — mục tiêu là sửa một chỗ không lan sang chỗ khác.
Chi tiết + bản đồ design pattern: `Docs/KnowledgeBase/AI-NPC.md`. Bốn điều cần nhớ:

1. **FSM = State pattern** (`AIStates.cs`): Idle/Seek/Combat/Guard/Retreat + 5 hành vi mới —
   **PatrolRoute** (tuần theo TUYẾN waypoint, `_patrolWaypoints`) · **Flee** (dân thường: chỉ
   bỏ chạy, không bao giờ đánh, bị dồn thì ngồi ôm đầu) · **Ambush** (nằm im, địch lọt
   `ambushTriggerRange` mới bung) · **FetchObjective** (chạy lấy đồ ở Objective rồi mang về
   `_returnPoint`; event `FetchPickedUp/FetchDelivered`) · **Follow** (bám thủ lĩnh, chỉ đánh
   kẻ dí sát/đánh mình, leash theo thủ lĩnh) · **Work** (WORKER khai thác: tự tìm
   `ResourceNode` — đốn cây/đào vàng/gặt lúa/múc nước/xây nhà — làm một chuyến rồi mang về
   `ResourceDepot` phe mình; công trường thì cộng công tại chỗ tới khi nhà hiện lên; không
   bao giờ đánh — thấy địch là bỏ việc chạy về kho). MỖI NHỊP LÀM có tiếng nghề + vụn văng
   (`ResourceNode.PlayWorkBeat`: clip trên node, effect `Hit` bảng chung, `FloatingMark` màu
   theo tài nguyên); giao kho leng keng + effect `Pickup`; xây xong effect `Spawn` + bụi.
   Trang bị thợ: archetype `Worker` (nón lá `Equip_NonLa` + giỏ mây `Equip_GioMay` slot Back +
   rìu, sprite sinh bằng code trong WeaponArtGenerator). Mỗi state 1 class thường (không MonoBehaviour).
   ⚠ **GIÃN CÁCH NHƯỜNG ĐƯỜNG BẤT ĐỐI XỨNG** (`StickmanAgent.SeparationPriority`, 3 bậc:
   đang đi 0 < đứng yên 1 < đứng làm nhiệm vụ 2 — Work/Guard/Ambush/giữ tuyến): mỗi agent CHỈ
   nhận lực đẩy từ đồng đội cùng bậc hoặc cao bậc hơn — người ĐI NGANG tự lách/chậm lại chứ
   KHÔNG xô được thợ đang đốn cây hay vệ sĩ đang đứng chốt; hai đứa cùng bậc trùng chỗ vẫn tự
   tách (không trùng vị trí), riêng 2-vs-2 lấy EntityId phân định để chỉ MỘT đứa dạt, chỗ làm
   việc không bị trôi dần. Sửa lại thành đẩy đối xứng là quay về bug "đi ngang hích thợ văng chỗ".
   **Lối đánh = Strategy** (`CombatStrategies.cs`) chọn theo NHÓM vũ khí đang cầm — đổi vũ khí
   là NPC tự đổi cách đánh (melee áp sát, ranged kite, throw vòng cung).
1b. **Phản xạ nằm trong pipeline Update của agent** (không nằm trong state): né đạn · **né
   VÙNG NỔ** (`aoeAvoidEnabled` — lựu đạn rơi gần là chạy khỏi bán kính, mặc định bật) ·
   **ngồi thụp né tên** (`coverChance`, mặc định 0) · vượt địa hình · **tay không tự đi nhặt
   vũ khí** (`weaponSeekRadius`) · **NHẶT VŨ KHÍ TỐT HƠN** (`weaponUpgradeGain`, xem ngay
   dưới) · **khiêu khích kéo aggro** (`tauntRadius`, mặc định 0) ·
   **vây đánh thay phiên** (`surroundWaitDistance` + `maxAttackersPerTarget` — hết suất thì
   đứng vòng ngoài chờ, không bỏ đi) · **THẦY THUỐC** (`healAmount/healInterval/healRadius` —
   mỗi nhịp hồi máu đồng đội thương nặng nhất trong tầm, chấm xanh lá bay lên; `buffMaxHealth`
   = CHÚC PHÚC cộng máu tối đa MỘT LẦN mỗi đồng đội, chấm vàng; cần `StickmanController.Heal`).
   Muốn lính "cuồng máu" đổi tính cách theo % máu thì gắn
   `HealthProfileSwitcher` (tổng quát hoá phase của BossController cho lính thường).
2. **AI chỉ gọi Facade**: `StickmanFighterController.AimAt/AttackNow/EquipWeapon/SetGuard` +
   `StickmanLocomotion.Move/Stop`. KHÔNG cho AI đụng thẳng weapon/pose/pool.
2b. **AI ĐÁNH ĐỂ THẮNG, không chỉ lao lên giết đứa gần nhất**:
   · `SelectBestEnemy` chấm điểm chiến lược: kết liễu kẻ sắp chết (`finishWoundedBonus`) ·
     chặt đầu tướng (`commanderTargetBonus`) · xử kẻ đang PHÁ NHÀ / đánh người mình bảo vệ
     (`defendObjectiveBonus`) · flank tuyến sau (`flankRangedBonus`) · né ổ hỗn chiến.
   · **CÓ NÊN LAO VÀO CUNG THỦ KHÔNG** (`ScoreRangedHunt`) — trước đây `rangedTargetBonus` là
     một HẰNG SỐ MÙ (5): cung thủ cách 20m vẫn "đáng đánh hơn" kiếm sĩ cách 14m, nên lính bỏ
     tuyến chạy xuyên đội hình địch rồi chết giữa đường. Nay là phép tính ba câu hỏi:
     **xa quá không** (`rangedChargeReach` 12, ngoài tầm thì thưởng tắt dần về 0; kỵ binh ×2 vì
     băng khoảng trống là nghề của nó) · **có ai chặn đường không** (`rangedEscortPenalty` 1.8
     mỗi lính cận chiến địch NẰM GIỮA — chính là câu `cavalryPikeAvoid` hỏi cho kỵ binh, nay bộ
     binh cũng hỏi, nhờ vậy đội hình "cung nấp sau khiên" mới có nghĩa) · **mình có hợp việc
     không** (`rangedHunterSelfScale` 0.25 — mình cũng cầm cung thì BẮN TRẢ, chạy lại gần là tự
     vứt lợi thế). ⚠ Cấp IQ 1 TẮT phép này (`smartTargeting = false`) → lao ngu như bản cũ:
     đó chính là cái ngu của lính mới, đừng "sửa".
   · `UpdateRetarget` (pipeline, nhịp `retargetInterval` = 1.5s): chấm điểm LẠI giữa trận —
     cục diện đổi là đổi mục tiêu theo; `targetSwitchMargin` giữ chân nên không đổi vặt,
     kẻ ĐƯỢC GIAO luôn thắng, xông liều/tử chiến thì theo lao.
   · **KHÔNG LAO QUÁ ĐÀ**: xông liều mà lọt vào TẦM HỤT của vũ khí là đòn nào cũng trượt —
     `UpdatePosition` nhánh charge giờ BĂNG XUYÊN QUA (cam kết `SlipCommitTime` 0.35s, sang
     bên kia đánh sau lưng) hoặc LÙI ra đúng tầm; `ShouldAttack` lúc xông cũng không vung
     khi `distance < WeaponMinReach × 0.8` (tử chiến ở mép vực thì vẫn vung — hết chỗ sửa).
     Pha lách PHẢI CÓ CAM KẾT — bỏ cam kết là frame sau hết nhịp lách, nhân vật đứng khựng
     GIỮA NGƯỜI ĐỊCH (đã dính 1 lần).
   · **ĐỔI VŨ KHÍ theo tình huống** (`UpdateWeaponSwap`, nhịp `weaponSwapInterval`, cấp IQ 1
     bị tắt qua `smartSwap`): địch túm tụm ≥3 → rút vũ khí NỔ · địch rùa thế thủ → đổi BÚA
     NẶNG (HeavyMelee) · bị áp sát khi cầm xa → rút cận chiến dài nhất kho · địch kite ngoài
     tầm >2.5s → rút vũ khí tầm xa. Không đổi giữa cú vung.
   ⚠⚠ **MỘT LỖI, BỐN TRIỆU CHỨNG — "cả sân toàn cung thủ".** Nhánh 4 của module đổi vũ khí
     (địch kite → rút vũ khí tầm xa) từng chỉ hỏi `distance > rangedMinRange + 1` (3.2) và
     `chưa đánh > 2.5s`. **Cả hai đều ĐÚNG suốt quãng HÀNH QUÂN** tới chỗ địch, nên mọi lính
     cận chiến rút cung ra TRƯỚC KHI kịp chạm địch lần đầu. Bốn thứ hỏng cùng lúc:
     *cả sân thành cung thủ* · *bài "combo cận chiến" dùng cung* · *không thấy combo* (combo
     chỉ chạy cho cận chiến) · *AI không biết đỡ* (`IsMeleeThreatSwinging` đòi ĐỊCH đang vung
     CẬN CHIẾN). Ba triệu chứng sau trông như lỗi của hệ combo/đỡ đòn, mà gốc lại ở đây.
     Nay đòi đủ BA: xa hơn `meleeGiveUpDistance` (7) · chưa đánh được · **và KHÔNG rút ngắn
     được khoảng cách** so với nhịp trước — vế cuối mới phân biệt "đang tiến tới" với
     "đuổi mãi không tới".
     ⚠ **Vế THỨ TƯ (2026-09-08): phải đang RẢNH CHÂN ĐỂ ĐUỔI** — đang ở `AIStateSeek`, không
     `HoldingLine`, không `GuardTarget`/`PatrolRoute`. Lính bị cây chỉ huy đóng băng (`Hold`)
     hay giữ chốt có dây xích thì khoảng cách KHÔNG BAO GIỜ rút ngắn dù địch đứng yên, nên ba
     vế trên đều đúng và bộ binh vừa mua ở nhà lính rút cung ra sau hai nhịp — người dùng đọc
     ra *"mua cận chiến mà ra tầm xa"* (War Camp, cùng gốc với Command.md «LỆNH TAY PHẢI
     THẮNG Ở CẢ CẤP DƯỚI»). Không đuổi được vì bị GIỮ khác với không đuổi được vì bị KITE.
     ⚠ Bài test xoay quanh MỘT loại vũ khí (combo, đỡ đòn) phải **RÚT SẠCH KHO**
     (`StickmanAILabBuilder.StripToWeapon`), đổi `_startIndex` là chưa đủ — cùng bài học
     `MakePrisoner` / `StripToClaws`.
   · ⚠⚠ **NGẮT NIỆM CHÚ** (`AIProfile.interruptCastBonus`, mặc định 6 = BẬT): địch ĐANG NIỆM
     phép được cộng điểm ưu tiên trong `ScoreStrategicTarget`.
     `MagicWeapon` đã có đủ vế cơ chế — niệm dở mà trúng đòn là VỠ BÀI (`OnOwnerDamaged`) — và
     mục *Hệ thống vũ khí §2* ghi thẳng rằng **"đó là cách cận chiến khắc chế pháp sư"**. Nhưng
     đo ra thì `IsCasting` chỉ được đọc ở đúng MỘT chỗ: `CasterCombatStrategy` của CHÍNH pháp
     sư ("đang niệm dở thì không chồng bài mới"). **Không một đường nào của AI hỏi xem MỤC TIÊU
     có đang niệm không** — nên cú ngắt, thứ được thiết kế làm điểm yếu DUY NHẤT của pháp sư,
     chỉ xảy ra khi tình cờ vung trúng nhịp. Không lỗi nào báo; nhìn vào chỉ thấy pháp sư mạnh
     quá đáng.
     ⚠ Chỉ cộng khi ĐANG niệm, KHÔNG cộng cho "kẻ cầm trượng" nói chung — cộng cho cả cây
     trượng là pháp sư bị săn suốt trận kể cả lúc đứng không, tức biến một cơ hội TÍNH BẰNG
     GIÂY thành một luật ưu tiên thường trực. Hai thứ khác hẳn nhau.
   · **ĐÒN NHỬ** (`feintChance/feintCooldown`, `CombatStrategyBase.TryFeint` + cửa sổ
     `StickmanAgent.IsFeinting`): nhá bộ vào đòn (PlayAction AttackBody, KHÔNG hitbox) —
     địch đọc `IsFeinting` trong `IsMeleeThreatSwinging` nên giơ thế thủ y như bị vung thật,
     tốn lượt đỡ + blockCooldown; đòn THẬT nối liền ngay sau (0.3s). Cấp IQ 1 bị tắt (đi kèm
     nhóm combo). Khắc chế trực tiếp hệ đỡ đòn — kéo-búa-bao ở tầng kỹ thuật.
   ⚠ **ĐỠ ĐÒN: COOLDOWN LÀ GIÁ CỦA VIỆC ĐÃ ĐỠ, KHÔNG PHẢI GIÁ CỦA VIỆC TRƯỢT XÚC XẮC.**
     `UpdateBlock` bản cũ nạp trọn `blockCooldown` (1.6s) NGAY CẢ KHI trượt `blockChance` —
     một lần trượt là khoá 1.6s dù chưa hề giơ tay. Nhân với chance 0.5 và `blockDuration`
     0.6s thì tỉ lệ đỡ THỰC TẾ chỉ còn ~19% thời gian, và người xem đọc ra đúng một câu
     *"AI không biết đỡ"* — không lỗi nào báo, hệ vẫn chạy đủ. Nay trượt chỉ khoá
     `SameSwingLockout` (0.35s, vừa đủ để không gieo lại 60 lần/giây cho CÙNG một nhát).
   Cận chiến biết **ĐỠ ĐÒN** (thấy địch vung là có cơ hội giơ thế thủ, `AIProfile.block*`)
   và **TUNG CHUỖI COMBO** (`AIProfile.comboChance/comboMaxHits` — các nhát sau đánh liền
   không do dự tới nhát kết rồi mới lùi). Xem `Docs/KnowledgeBase/AI-NPC.md` mục 5.45.

2b-nhip. ⚠⚠ **CỬA SỔ COMBAT PHẢI RỘNG HƠN NHỊP RA-VÀO CỦA CHÍNH STRATEGY —
   `ICombatStrategy.EngageRange`.** Đây là MỘT lỗi nuốt gọn BỐN hành vi cùng lúc, và cả bốn
   đều biến mất trong im lặng.

   `AIStateCombat` từng gõ cứng *"xa hơn `MaxRange × 1.2` thì trả tay lái về Seek"*. Nhưng
   nhịp **đánh-xong-lùi-ra** của cận chiến (`meleeBackoffTime` 0.45s × `backpedalSpeedScale`
   0.65 × tốc độ đi) đi lùi tới **~0.7 đơn vị**, trong khi cả cửa sổ chỉ rộng ~0.2 quanh tầm
   chém. Nghĩa là **LẦN NÀO lùi cũng vượt ngưỡng** → nhảy sang Seek. Mà Seek chỉ biết
   `MoveTowardsX` đi thẳng vào mục tiêu, và **cả bốn thứ sau đều nằm trong `strategy.Tick`
   nên Seek không chạy cái nào**:

   | Mất cái gì | Người dùng đọc ra |
   |---|---|
   | nhịp ĐÁNH-RỒI-RÚT (`IsBackingOff`) | *"không biết nhấp tới lui"* |
   | **ĐỠ ĐÒN** (`UpdateBlock`) | *"nó không biết đỡ"* |
   | NHÍCH QUA LẠI (`UpdateStrafe`) | *"chỉ biết đứng một chỗ"* |
   | TẦM ƯU THẾ (`AdvantageRange` — đứng ngoài tầm với của địch) | *"không biết giữ khoảng cách"* |

   Nay `AIStateCombat` hỏi **chính strategy** (`EngageRange`), và `MeleeCombatStrategy` trả
   `MaxRange × 1.2 + BackoffRoom` — quãng lùi đo từ **tốc độ đi THẬT của chính nhân vật**
   (giáp nặng lùi ngắn hơn), không gõ số.
   ⚠ Vào Combat vẫn ở `MaxRange` (Seek), ra ở `EngageRange` → hysteresis THẬT, không nhấp nháy.
   ⚠ Bài học chung: **ngưỡng CHUYỂN STATE không được gõ ở state; phải hỏi thứ đang chạy bên
   trong nó cần bao nhiêu chỗ.** Thêm strategy mới có nhịp ra-vào rộng (đấu sĩ, né lăn) thì
   override `EngageRange`, đừng nới hằng số trong `AIStateCombat` — nới ở đó là nới cho cả
   cung thủ lẫn pháp sư.

2b-ne. **NÉ ĐÒN CẬN CHIẾN** (`CombatStrategyBase.TryMeleeEvade` + `AIProfile.meleeEvade*`):
   thấy địch VUNG mà không đỡ được thì **DẠT RA khỏi tầm nó**, hoặc **LAO VÀO TRONG tầm hụt**
   của nó (`meleeEvadeInsideChance` — chỉ với địch cầm giáo/thương: chui vào trong là cú đâm
   trượt qua vai, và đó cũng là cách duy nhất để kiếm ngắn xử cây giáo).
   · **Vì sao cần dù ĐÃ CÓ thế thủ**: thế thủ đòi ba cửa cùng mở — vũ khí `CanGuard`, xúc xắc
     trúng, `blockCooldown` đã hồi. Ba cửa đó đóng thì trước đây nhân vật **không còn phản
     ứng nào cả**, đứng yên ăn trọn nhát chém.
   · ⚠ **ĐỠ ĐƯỢC THÌ ĐỠ — né là LỐI THOÁT, không phải lựa chọn ngang hàng** (`CanBlockNow`).
     Né chạy trong `UpdatePosition` nên nó luôn bốc TRƯỚC `UpdateBlock`; cho hai cơ chế tranh
     lượt là hệ đỡ đòn — thứ có pose riêng, có độ bền, có **đòn NHỬ** sinh ra để khắc chế nó —
     mất trắng một nửa số cú vung mà nhìn vào không ai biết vì sao.
   · ⚠ **PHẢI CÓ CAM KẾT** (`meleeEvadeTime` 0.3s), y như pha lách xuyên: bỏ cam kết thì frame
     sau luật giữ tầm kéo ngược lại ngay và nhân vật chỉ GIẬT một cái tại chỗ (§5c).
   · ⚠ Gieo xúc xắc **một lần cho mỗi cú vung** (`SameSwingLockout`), không phải mỗi frame —
     cùng bài học với `UpdateBlock`.
   · ⚠ **LÍNH KHIÊN (`UnitRole.Shield`) KHÔNG né** — nghề của nó là đứng chắn; khiên dạt ra
     là tuyến đầu thủng. Xông liều / tử chiến cũng không né (cả hai là quyết định "không lùi").
   · Cấp AI 1 tắt hẳn né (đi cùng nhóm `canDodge` — không biết né tên thì cũng không biết dạt
     khỏi cú chém); cấp cao né nhiều hơn theo `dodgeChanceScale`.
2b-tuongmuctieu. ⚠⚠⚠ **CÔNG TRÌNH NHƯỜNG LÀN KHÔNG PHẢI MỤC TIÊU CỦA AI CẢ**
   (`SelectBestEnemy`, 2026-09-04 — *"nó nhảy lên tường rồi chĩa vũ khí xuống, lấy bức tường
   làm target"*). Bức tường khai `passableForEveryone` **không chắn ai** và **không nằm trong
   điều kiện thắng nào**: đập nó không mở được đường (đường vốn đã mở), không giết được ai
   (người đứng trên vẫn nguyên), không cộng một điểm nào. Nhưng nó vẫn là một `Fortification`
   CÓ MÁU của phe địch — nên khi trong tầm không còn ai SỐNG, bảng điểm bốc đúng nó, cả toán
   quay ra gặm một bức tường vô nghĩa, và vì nó nằm giữa đường nên nhìn ra là *"bu ở tường"*.
   Không lỗi nào báo: theo mọi luật đang có thì nó đúng là mục tiêu hợp lệ.
   ⚠ CỔNG · NHÀ · THÁP **không** bị loại — chúng chặn thật hoặc nằm trong điều kiện thắng. Chỉ
   thứ tự khai *"tôi không chắn ai"* mới bị bỏ.
   ⚠ Đây là vế thứ hai của 2b-chanduong ngay dưới: cái kia bỏ tường khỏi *"cái gì chắn đường
   tôi"*, cái này bỏ tường khỏi *"đáng đánh nhất là ai"*. **Hai đường nhận mục tiêu, phải bịt
   cả hai** — bịt một đường thôi thì triệu chứng y hệt và rất dễ tưởng là bản vá không ăn.

2b-cua45. ⚠⚠⚠ **KHÔNG PHẢI HAI ĐƯỜNG — CÓ NĂM. HAI CỬA CÒN LẠI GÁN THẲNG `Target`, KHÔNG ĐI
   QUA BẢNG ĐIỂM** (2026-09-04, người dùng báo *"AI tập trung đánh cái tường thành"* **ba lượt
   liền**, sau mỗi lần vá lại thấy y hệt).

   Chú thích trong `SelectBestEnemy` đã tiên đoán đúng: *"ba dòng lọc là ba lần vá BẢNG ĐIỂM
   cho cùng một triệu chứng, và cửa thứ tư lại mở ra ở chỗ khác."* Đo ra thì có **hai** cửa
   nữa, và cả hai đều **bỏ qua trọn bộ bảng điểm** vì chúng gán `Agent.Target` trực tiếp:

   | Cửa | Ở đâu | Vì sao lọt |
   |---|---|---|
   | **4 — chỉ huy chỉ điểm** | `CommandNode.PickFocusTarget` → `SuggestTarget` | vòng chọn "tập trung hoả lực" duyệt `TeamMember.All` **trần**; tường BẤT TỬ nên `healthFraction` luôn = 1, lại đứng YÊN ngay trước mũi đội hình nên `distance` nhỏ ⇒ **nó thắng điểm**, rồi cả tổ bị chỉ vào bức tường |
   | **5 — "đứa dí sát mặt thì xử trước"** | `AIStateSeek` → `FindNearestEnemy` → `Agent.Target = blocker` | `FindNearestEnemyRaw` hỏi thẳng `TeamMember`, sổ đó chứa cả công trình. Mà tường khai `passableForEveryone` nên quân **đi xuyên qua nó** ⇒ lúc nào cũng nằm trong `personalSpace` ⇒ frame nào cũng nhận tường làm mục tiêu |

   ⚠ Cửa 5 là cửa NẶNG NHẤT và khó thấy nhất, vì nó là **hệ quả trực tiếp của việc cho tường
   nhường làn**: chính cái làm quân không bị kẹt lại làm quân luôn đứng sát nó.

   **Chốt, ở hai nút thắt:**
   · `StickmanAgent.IsWorthAttacking(target)` — MỘT nguồn sự thật ("công trình này có đáng
     đánh không"); `SelectBestEnemy` chuyển sang dùng chính nó để hai bản không lệch nhau,
     `SuggestTarget` hỏi nó làm lưới chặn cuối cho **mọi** đường chỉ điểm, và
     `PickFocusTarget` hỏi nó để đừng chọn ngay từ đầu.
   · `TeamMember.FindNearestEnemyUnit` — bản quét **CHỈ TRẢ NGƯỜI**, `FindNearestEnemyRaw`
     chuyển sang gọi nó.

   ⚠⚠ **LỌC TRONG VÒNG QUÉT, ĐỪNG LỌC SAU KHI NHẬN.** `FindNearestEnemy` trả về CÁI GẦN NHẤT;
   lọc sau thì hễ bức tường gần hơn người là hàm trả **null** và người đứng ngay sau tường bị
   bỏ sót hoàn toàn — đổi một lỗi thấy được lấy một lỗi câm.

   ⚠⚠ **VÀ CHẶN Ở `PickFocusTarget` LÀ BẮT BUỘC, KHÔNG THỪA.** Chặn mỗi đầu NHẬN
   (`SuggestTarget`) thì `_focusTarget` vẫn bám bức tường suốt `focusFireHold` giây ⇒ cơ chế
   tập trung hoả lực tê liệt trong im lặng: lệnh vẫn phát, bên kia vẫn bỏ, không ai báo gì.

   ⚠ **HƠN 20 CHỖ GỌI `FindNearestEnemy` ĐỀU NÓI VỀ NGƯỜI** — `blocker` · `prey` · `threat` ·
   `intruder` · *"quanh đây có địch không"*. Nên lọc người là ĐÚNG NGỮ NGHĨA, không phải một
   ngoại lệ. Nó còn chữa kèm một lỗi câm khác: `AIResupplyModule` hỏi *"có địch dí sát mặt
   không"* để quyết định có đi nạp đạn hay không ⇒ trước đây **đứng cạnh tường là không bao
   giờ đi nạp**.
   ⚠ Đường đánh CÔNG TRÌNH không mất: nó đi lối riêng — `SelectBestEnemy` (bảng điểm) và
   `ProbeObstacle` (*"cái gì đang chắn đường tôi"*). `AcquireTarget` cũng không đi qua
   `FindNearestEnemy`, nên phá cổng / phá nhà chính giữ nguyên.

   ⚠⚠ **BÀI HỌC CHẨN ĐOÁN, đắt hơn cả bản vá.** Đếm cho đủ **MỌI đường ghi vào `Target`**
   trước khi tuyên bố đã bịt: `grep -rn "Target = \|SuggestTarget(" Assets/Scripts/AI`. Vá
   bảng điểm rồi báo xong — ba lần liên tiếp — là vì mỗi lần chỉ nhìn MỘT đường. Bảng điểm
   không phải cửa duy nhất, nó chỉ là cửa DỄ THẤY nhất.

2b-chanduong. ⚠⚠ **TƯỜNG NHƯỜNG LÀN THÌ KHÔNG BAO GIỜ LÀ VẬT CẢN — HỎI LUẬT, ĐỪNG HỎI
   TRẠNG THÁI** (`ProbeObstacle`, 2026-09-04 — *"AI lấy cái tường làm target"*).
   `WouldLetThrough` trả FALSE cho người đang đứng TRÊN NÓC — đúng, vì ở đó chính khối ấy là
   đất dưới chân họ. Nhưng đó là câu trả lời về **VA CHẠM**, còn `ProbeObstacle` đang hỏi
   *"cái gì chắn đường tôi"*. Ai đứng cao hơn chân tường một quãng — trên bậc thang, trên gò,
   trên chính mặt tường — liền nhận bức tường CHO ĐI XUYÊN làm vật cản và quay ra đập nó. Kèm
   `IsBreakingObstacle` có cam kết nên nó bám luôn, và cả toán dồn về đó. Không lỗi nào báo:
   mỗi hàm trả lời đúng câu nó được hỏi, chỉ là bị hỏi nhầm câu.
   Chốt: công trình khai `passableForEveryone` **theo định nghĩa là không bịt làn**, nên bỏ qua
   thẳng ở `ProbeObstacle`. Kèm một vế nữa: **đừng đập thứ mình đang đứng trên**
   (`Locomotion.GroundCollider` thuộc chính công trình đó).
   ⚠ Bài học: `WouldLetThrough` là câu hỏi VA CHẠM. Chỗ nào hỏi về ĐƯỜNG ĐI thì phải hỏi
   `PassableForEveryone` / hình học, đừng mượn câu trả lời của hệ khác.

2b-dingang. ⚠⚠⚠ **"HAI TEAM ĐI NGANG QUA NHAU" — BẢNG ĐIỂM ĐÚNG NHƯNG HỎI QUÁ THƯA**
   (`UpdateEngageNearby`, 2026-09-04). Ba thứ cộng lại, cái nào đứng riêng cũng hợp lý:

   | Vế | Số | Nghĩa |
   |---|---|---|
   | nhịp đổi ý | `retargetInterval` **1.5 s** | lính chạy ~3 đơn vị/giây ⇒ mỗi nhịp **đi hết 4.5 đơn vị** |
   | va chạm | `TeamMember._passThroughEnemies` mặc định **BẬT** | quân hai phe đi XUYÊN QUA nhau được (để gọng kìm lách được) |
   | nón nhìn | `useVisionCone` mặc định **TẮT** | không phải thủ phạm, đã loại trừ |

   Nên một anh lính đang nhắm cái nhà ở cuối làng có thể **xuyên qua trọn một hàng quân địch**
   rồi mới tới nhịp nghĩ lại. Bảng chấm điểm đã xếp công trình sau mọi mục tiêu sống
   (`LivingFirstPenalty`) — nhưng bảng ấy chỉ được HỎI mỗi 1.5 giây, và đó mới là chỗ hỏng.
   Nay có cửa NHANH 0.25 s cho đúng một tình huống: **đang nhắm công trình mà có người sống
   trong 6 đơn vị → bỏ ngay, đánh người trước.**
   ⚠ KHÔNG đụng `IsBreakingObstacle`: thứ đang CHẶN ĐƯỜNG vẫn phải đập kể cả lúc có địch quanh
   mình, không thì cả toán đứng đánh nhau trước cánh cổng đóng tới hết trận.
   ⚠ Kèm **KỀ MẶT** (`ContactRange` 2.6) trong `SelectBestEnemy`: trong tầm đó thì bỏ qua nón
   tầm nhìn, bỏ qua luật chia mục tiêu, và bỏ luôn độ trễ nhận ra. Người ta không cần nhìn kỹ
   mới biết có kẻ đang vung kiếm cách mình nửa mét.
   ⚠ Bài học: **một luật ưu tiên đúng mà nhịp hỏi lại quá thưa thì trên màn hình nó không tồn
   tại.** Chỉnh bảng điểm xong phải hỏi tiếp: *"bao lâu nó mới được hỏi một lần, và trong ngần
   ấy thời gian nhân vật đi được bao xa?"*

2b-nguoi. ⚠⚠⚠ **NGƯỜI TRƯỚC, NHÀ SAU — `targetsStructures` LÀ MỘT KHOẢN CỘNG ĐIỂM, VÀ NÓ
   THẮNG CẢ NGƯỜI ĐANG CHÉM MÌNH** (`LivingFirstPenalty` = 200, luật người dùng chốt
   2026-09-04). `TeamOrder.targetsStructures` đảo dấu `structureTargetBonus` (−6 → +6) để quân
   công thôi NÉ công trình — đúng ý đồ, sai cách: nó thành một khoản CỘNG, nên cái nhà đứng yên
   thắng luôn người đang vung kiếm vào mặt mình. Cả toán đứng đập tường trong khi dân binh chém
   sau lưng — *"AI chỉ chăm chăm phá làng mà không đánh nhân vật xung quanh"*. Không lỗi nào
   báo: bảng điểm chấm đúng công thức của nó.
   Nay công trình luôn xếp SAU mọi mục tiêu SỐNG trong tầm quét.
   ⚠ **HỮU HẠN, không loại thẳng**: dọn sạch địch quanh mình rồi thì công trình là ứng viên duy
   nhất và nó thắng — nhà vẫn cháy, cổng vẫn vỡ, điều kiện thắng của màn vẫn đạt được.
   ⚠ `UpdateBlockedPath` **không đi qua bảng điểm này**: thứ CHẶN ĐƯỜNG vẫn bị đập ngay, kể cả
   khi đang có địch quanh mình. Hai câu hỏi khác nhau — *"đáng đánh nhất là ai"* và *"cái gì
   đang chắn đường tôi"* — và chỉ câu đầu mới qua bảng điểm.
   ⚠ Bài học: **"thôi né X" và "ưu tiên X" là hai việc khác nhau.** Đảo dấu một khoản phạt là
   biến cái thứ nhất thành cái thứ hai mà không ai để ý.

2b-hungthan. ⚠⚠ **KẺ ĐANG CÀY MẠNG PHẢI BỊ CẢ TUYẾN XÚM VÀO — `ThreatBoard`**
   (user chốt 2026-09-04: *"kẻ nào đang giết nhiều người phe mình liên tục thì AI xung quanh
   tập trung tiêu diệt kẻ đó"*).

   Bảng điểm mục tiêu chấm ứng viên bằng thứ nó ĐANG LÀ — gần hay xa, máu bao nhiêu, cầm vũ khí
   gì, có phải chủ tướng không — và **không có một ô nào hỏi nó VỪA LÀM GÌ**. Nên một ông chủ
   soái (`HeroCommander`: máu ×4, sát thương ×1.6) đứng giữa tuyến chém đổ cả hàng vẫn được chấm
   y hệt anh dân binh đứng cạnh: luật chia mục tiêu tiếp tục rải người đều ra, và cả tuyến lần
   lượt đi vào lưỡi kiếm đó. **Không lỗi nào báo** — mỗi lính đều đang chấm đúng công thức.

   **BA MẢNH, mỗi mảnh ở đúng tầng của nó:**

   | Mảnh | Ở đâu | Việc |
   |---|---|---|
   | `ThreatBoard` | **AI** | sổ TĨNH nghe `TeamMember.AnyDied`; mỗi mạng +1, phân rã theo half-life **8 s**, trần 4 |
   | `AIProfile.rampageTargetBonus` (7) | AI | ô điểm RIÊNG trong `ScoreModeBonuses`, nhân với phần VƯỢT ngưỡng |
   | `StickmanAgent.MaxAttackersOn` | AI | nới trần vây đánh (`rampageExtraAttackers` 3 → tối đa 6 người) |

   ⚠⚠ **VẾ THỨ BA LÀ VẾ HAY BỊ QUÊN, VÀ THIẾU NÓ THÌ CƠ CHẾ CHỈ LÀ LỜI NÓI.** Cộng điểm thôi
   thì `maxAttackersPerTarget` (3) vẫn đuổi người thứ tư đi tìm mục tiêu khác — "tập trung tiêu
   diệt" dừng ở đúng ba người. Và trần phải hỏi ở **MỘT HÀM DUY NHẤT**: `SelectBestEnemy` hỏi
   *"có được NHẮM nó không"*, `ShouldWaitTurn` hỏi *"có được ĐÁNH nó không"* — nới một chỗ mà
   quên chỗ kia thì người thứ tư chạy tới nơi rồi **đứng vòng ngoài không vung một nhát nào**.

   ⚠⚠ **NHỊP HỎI PHẢI ĐƯỢC RÚT NGẮN, KHÔNG THÌ Ô ĐIỂM KHÔNG TỒN TẠI TRÊN MÀN HÌNH** (§2b-dingang
   lặp lại). Bảng điểm chỉ được hỏi mỗi `retargetInterval` = **1.5 s**, mà hung thần hạ người
   nhanh hơn thế. `StickmanAgent.NoticeRampage` (gọi từ `OnSomeoneDied`) ép chấm điểm lại sau
   0.2 s khi đồng đội TRONG TẦM NHÌN ngã dưới tay một kẻ đã có streak.
   ⚠ Chỉ RÚT NGẮN NHỊP, tuyệt đối **không tự gán `Target`** — gán thẳng là đẻ ra đường chọn mục
   tiêu thứ hai không đi qua nón tầm nhìn, luật cùng tầng, ẩn thân hay quán tính đổi mục tiêu.
   ⚠ Đặt TRƯỚC chốt `MoraleEnabled`: zombie để `moraleRadius = 0` nên hàm thoát sớm ở đó, mà
   bầy zombie thì càng phải biết xúm vào.

   ⚠ **PHÂN RÃ LIÊN TỤC, KHÔNG NGƯỠNG BẬT/TẮT**: ngưỡng cứng đặt trên một con số đang trôi thì
   mỗi lần nó đi qua mốc là cả tuyến đổi mục tiêu một lượt (§5c). Half-life cũng chính là luật
   gỡ: kẻ đó ngừng chém là ~13 giây sau cả tuyến tự tản ra, không cần cơ chế nào khác.

   ⚠ **CHỈ ĐẾM NGƯỜI GIẾT NGƯỜI**: nạn nhân là công trình thì không tính (đập vỡ năm cái cổng
   không làm ai thành hung thần — đếm cả thì cả cánh quân bỏ trận đánh để bu vào anh lính đang
   phá cổng); kẻ giết cũng phải là người; bắn nhầm đồng đội không tính. Kẻ đang GỤC trả streak 0
   — để nó cãi với `downedTargetPenalty` là cả tuyến bỏ trận đi đâm một cái xác nằm im.

   ⚠⚠ **SỐ PHẢI ĐO, ĐỪNG CHỌN CHO ĐẸP.** Bản đầu để half-life 7 + bonus 5 và mô phỏng cho thấy
   nó **gần như vô hình**: giết ba mạng liên tiếp mới kéo nổi ĐÚNG MỘT người đổi mục tiêu — tức
   thêm một cơ chế rồi không ai nhìn thấy nó chạy, đúng loại "khai mà không chạy" ở §2e-quet.
   Bộ 8 s + 7 cho bậc thang đọc được: **2 mạng chưa kéo ai · 3 mạng kéo 2 người · 4 mạng kéo 3 ·
   5 mạng kéo 4**. Cách đo: mô phỏng `distance + attackers × targetSpreadPenalty − bonus` so với
   điểm của mục tiêu đang bám (đã trừ `targetSwitchMargin`).
   ⚠ Bonus TỐI ĐA (21) CỐ Ý nhỏ hơn `OtherFloorPenalty` (60) và `LivingFirstPenalty` (200): hung
   thần đứng trên mặt tường thì cận chiến **vẫn không** bỏ tuyến leo lên, và người vẫn xếp trước
   nhà. Nới bonus quá hai mốc đó là lặng lẽ phá hai luật cứng.

   ⚠ Nối vào bảng cấp AI: khối `if (!tier.teamwork)` của `AISmartsTable` tắt cả hai ô — xúm vào
   giết kẻ cày mạng LÀ phối hợp, cấp "không biết phối hợp" mà vẫn tự dồn về một mục tiêu thì cái
   nhãn đó nói dối.

   ⚠ **SOI BẰNG F9**: hung thần mang hậu tố `⚡HUNG THẦN <streak>`, lính đang nhắm nó hiện `⚡`
   sau tên mục tiêu. Bắt buộc phải có: "cả đám bu vào một đứa" nhìn y hệt hình dạng của LỖI chia
   mục tiêu, không có con số thì mỗi lần báo lỗi lại phải đoán.

   ⚠ Bài test: **AI Lab bài 27 «Kẻ hung thần»** — hai trận giống hệt, phe xanh bên phải để
   `rampageTargetBonus = 0` làm đối chứng. Bài này CỐ Ý đặt ba lính đỏ thường CHẮN TRƯỚC: chỉ có
   mỗi hung thần trên sân thì AI nào cũng nhắm nó, có cơ chế hay không cũng vậy — **bài test nói
   dối**. Điều đáng xem là lúc phe xanh BỎ mấy đứa gần để đi xử đứa xa hơn.

   ⚠ **KHÔNG phải dựng lại scene nào cho phần cơ chế** — toàn bộ là code runtime, và hai field
   trong `AIProfile` là field MỚI nên 34 asset đã bake nhận đúng giá trị khởi tạo trong code.
   Chỉ `Demo_8_AILab` phải dựng lại vì có bài test mới (Bảng điều khiển tự báo vàng).

2b-cong. ⚠⚠ **TẦM XA KHÔNG NHẮM CÔNG TRÌNH, VÀ ĐẠN BAY XUYÊN NHÀ + CẦU THANG**
   (user chốt 2026-09-04). Cung/nỏ/súng/phép vốn **không phá được nhà** (`IRangedDamageImmune`),
   nên chọn một cái nhà làm mục tiêu là đứng bắn vào không khí trong khi lính địch chạy ngang
   trước mặt — đọc ra ngay là *"AI hỏng"*, mà bảng chấm điểm vẫn đúng công thức của nó.
   · `ScoreStrategicTarget` loại thẳng công trình khi người chấm đang cầm vũ khí TẦM XA
     (`IsRangedFighter(Fighter)`). **Cận chiến giữ nguyên** — đó là cách phá cổng, đốt nhà; và
     `UpdateBlockedPath` vẫn cho mọi loại quân đập thứ chắn đường mình.
   · `ProjectileController.HandleHit` bỏ qua **dãy bậc** (`StickmanStairs`) và **nhà**
     (`IRangedDamageImmune` nay BAY XUYÊN thay vì cắm lại). Dãy bậc là những KHỐI ĐẶC chạy từ
     mặt đất lên mặt bậc, tức một bức tường đặc với mọi tia bắn ngang — đặt cạnh tường thành là
     nó chắn trọn đường bắn của cả tuyến cung.
   ⚠⚠ **TƯỜNG THÀNH và THÁP CŨNG KHÔNG CHẶN ĐẠN NỮA** (user chốt 2026-09-04). Cung và lao
   không phá được tường, nên mỗi mũi trúng nó chỉ là một mũi mất trắng. Tệ hơn: tường + tháp là
   hai khối CAO nằm giữa sân, nên chúng chắn trọn đường bắn của cả tuyến cung — cung thủ đứng
   dưới không với được người trên mặt tường, người trên tường bắn xuống thì vướng chính cái
   tường mình đứng, và ai đứng sau cái tháp thì bất khả xâm phạm.
   ⚠ **CỔNG cũng thôi chặn từ 2026-09-04 — xem §2b-cong-ter. Chỉ còn RÀO CHẮN.**
   ⚠⚠ **THANG CÔNG THÀNH VẪN CHẶN — vế này bắt buộc**: *"phe thủ bắn gãy thang"* là cơ chế có
   thật (`AIProfile.ladderTargetBonus` mặc định DƯƠNG + `SiegeLadder.DropRiders`). Cho đạn bay
   xuyên thang là giết luôn cơ chế đó mà không ai báo.

2b-cong-bis. ⚠⚠⚠ **VÀ CÂU CUỐI CỦA MỤC TRÊN LÀ MỘT LỜI NÓI DỐI — TƯỜNG/THÁP KHÔNG HỀ CHẶN
   ĐẠN** (2026-09-04, từ báo cáo *"AI nhắm cái nhà hay toà tháp, mũi tên đi xuyên qua nên bắn
   ra rất xa, trúng nhân vật bên dưới"*).

   Bản vá ở 2b-cong viết *"nhà thì bay xuyên"* rồi thi hành bằng `IRangedDamageImmune` — mà
   `Fortification` (tường · tháp · cổng · rào) **cũng** khai interface đó. Nên một dòng
   `if (stickman is IRangedDamageImmune) return;` đã mở toang cả bộ công sự: mũi tên xuyên qua
   tường thành rồi cắm vào người đứng sau. Không lỗi nào báo, và chính chú thích ngay dưới nó
   khẳng định điều ngược lại.

   **GỐC: MỘT INTERFACE TRẢ LỜI HAI CÂU KHÁC NHAU.**

   | Câu hỏi | Nhà | Tường · tháp · cổng | Thang công thành |
   |---|---|---|---|
   | đòn tầm xa có **PHÁ** được không (`IRangedDamageImmune`) | không | không | không |
   | mũi tên có **DỪNG LẠI** không (`IProjectileCover` — MỚI) | **không** | **CÓ** | không |

   *(Cột giữa đúng tới 2026-09-04; nay chỉ còn RÀO CHẮN chặn — xem §2b-cong-ter.)*

   · Nhà không chặn: một dãy nhà ven đường mà hút đạn là bịt kín làn bắn của cả trận.
   · Tường/tháp CHẶN — đó là toàn bộ lý do công sự tồn tại trong một trận có cung. Bỏ vế này
     thì đứng sau tường cũng chết như đứng ngoài đồng.
   · **Thang công thành KHÔNG chặn** (`SiegeLadder` override `BlocksProjectiles => false`): nó
     là một khung rỗng, và nó dựng đúng chỗ hai bên đang bắn nhau nhất — cho nó hút đạn thì
     mưa tên của phe thủ cắm hết vào thang thay vì vào đám đang trèo, mà thang lại miễn sát
     thương tầm xa nên số đạn đó mất trắng.

   ⚠ **THÊM MỘT CÂU HỎI MỚI THÌ THÊM MỘT INTERFACE MỚI**, đừng mượn cái đang có vì "nó cũng
   đang đúng cho hai trong ba trường hợp". Đây là lần thứ hai dự án trả giá cho việc gộp câu
   hỏi (lần trước: `HandGrip` bị hỏi thay cho *"vũ khí này chiếm mấy tay"* — xem §4c).

   **HAI LỖ CÒN LẠI CỦA CÙNG BÁO CÁO, cả hai đều ở phía AI:**

   1. **`StructureRejected` (1000) CHƯA BAO GIỜ LÀ MỘT PHÉP LOẠI.** Nó chỉ bảo đảm công trình
      không **thắng** một mục tiêu sống; khi trong tầm chỉ còn mỗi cái tháp thì nó vẫn là ứng
      viên DUY NHẤT và vẫn được chọn. Nay `SelectBestEnemy` **`continue` bỏ qua hẳn** khi
      người chấm cầm vũ khí tầm xa.
      ⚠ Và phải lọc **CẢ NHÁNH DỰ PHÒNG** (`FindNearestEnemyRaw`): nó hỏi thẳng `TeamMember`,
      mà sổ đó chứa cả công trình — đó là cái cửa sau đưa đúng cái tháp vừa bị loại quay lại
      tay cung thủ. Lọc một chỗ mà quên chỗ kia thì bộ lọc coi như không có.

   2. **CUNG THỦ BỊ TƯỜNG CHẮN THÌ RÚT CẬN CHIẾN** (`AIWeaponSwapModule` nhánh 0 — mới).
      `UpdateBlockedPath` CỐ Ý cho mọi loại quân bám thứ đang chắn đường mình, kể cả cung thủ
      kẹt sau cánh cổng. Từ ngày tường chặn đạn thì cung thủ đó sẽ nã tên vào mặt gỗ tới hết
      trận (cổng miễn sát thương tầm xa). Đổi sang cây LÀM ĐƯỢC VIỆC đúng là nghề của module
      ứng biến vũ khí; kho không có cận chiến thì `FindBestMeleeIndex` trả −1 và mọi thứ giữ
      nguyên như cũ.

   ⚠ **KHÔNG phải dựng lại scene nào** — toàn bộ là code runtime.

2b-cong-ter. ⚠⚠ **CHỈ CÒN RÀO CHẮN CHẶN ĐẠN — VÀ LUẬT ĐÓ CHỈ ĐƯỢC KHAI Ở MỘT CHỖ**
   (`Fortification.BlocksProjectiles`, user chốt 2026-09-04: *"cái cửa bị trúng tên, tôi muốn
   nó giống các công trình khác không bị trúng tên"*).

   Cổng là công trình cuối cùng còn hút đạn, với lý do ghi ở §2b-cong: *"cổng thấp, nằm đúng
   tầm người, là vật che có chủ ý"*. Lý do đó nghe hợp lý nhưng bỏ qua một sự thật đơn giản
   hơn: **cổng đã miễn sát thương tầm xa**, nên mỗi mũi cắm vào nó là một mũi MẤT TRẮNG — và
   trên màn hình một cánh cửa tua tủa tên đọc ra là lỗi va chạm, không đọc ra "cổng đang bị vây".

   Hệ quả CÓ CHỦ Ý: cổng khép lại vẫn cho hai tuyến cung bắn qua nhau. Cái cổng từ nay chặn
   CHÂN chứ không chặn TÊN — muốn phá thì phải xáp mặt, đúng vế *"team tấn công cần dùng vũ khí
   cận chiến đánh sập"*.

   ⚠⚠ **VÀ ĐỢT NÀY DỌN NỐT MỘT NGUỒN SỰ THẬT THỨ HAI.** `ProjectileController.HandleHit` có
   một bảng kê tay `Kind == Wall || Kind == Tower` chạy **TRƯỚC** khối `IProjectileCover` —
   tức hai chỗ cùng trả lời một câu hỏi. Nó đã lệch nhau ngay ở lần sửa này (cổng thôi chặn ở
   `BlocksProjectiles`, mà bảng kê ở `HandleHit` không biết). Nay bảng kê đã xoá; muốn đổi luật
   thì sửa `Fortification.BlocksProjectiles`, đừng thêm dòng vào `HandleHit`.
   ⚠ RÀO CHẮN (`Barricade`) giữ nguyên — nó thấp ngang người, nằm giữa đồng trống, và cả lý do
   nó tồn tại là làm VẬT CHE. `SiegeLadder` vẫn override `false` (§2b-cong-bis).

2b-ngam. ⚠⚠⚠ **AI CHĨA VŨ KHÍ LÊN TRỜI KHI ĐI QUA CHÂN TƯỜNG — KẸP DỐC NGẮM**
   (`StickmanAgent.ClampAimElevation`, 2026-09-04: *"khi đi qua tường thành nó cứ hướng lên
   phía trên là sao"*).

   Đây là MẶT TRÁI của §5b-tang (*"mọi phép đo của AI là khoảng cách NGANG"*). Kẻ đứng trên mặt
   tường NGAY TRÊN ĐẦU đọc ra là *"cách 0 mét"* nên nó thắng bảng điểm rất dễ, và `AimAt` thì
   trung thành chĩa vũ khí đúng vào đó: cả hàng quân đi bộ qua chân tường vừa đi vừa **dựng
   ngược vũ khí lên trời**. Không lỗi nào báo — hàm ngắm đang làm đúng cái nó được bảo làm.

   Ba thứ hỏng cùng lúc, và cái thứ ba là cái xấu nhất:
   · CẬN CHIẾN chĩa lên một người nó không với tới nổi (`CanEngageAcrossLevel` = false);
   · CUNG lia gần thẳng đứng — góc mà không quỹ đạo đạn nào của dự án bắn được;
   · `|aim.x|` tụt về gần 0 ⇒ chạm vùng chết lật thân của `StickmanFighterController.ApplyAim`
     ⇒ cả rig **soi gương qua lại mỗi frame**.

   Chốt: mọi đường ngắm của AI đi qua `StickmanAgent.AimTowards`, nó kẹp DỐC (`dy/|dx|`) —
   **cung 1.2 (~50°) · cận chiến 0.7 (~35°)**; mục tiêu ngay trên đầu (`|dx| < 0.6`) thì mượn
   một quãng ngang tối thiểu theo hướng đang quay mặt, không thì aim gần như dọc và thân lật
   qua lại mỗi frame.
   ⚠ **KẸP DỐC, KHÔNG CẤM NGẮM LÊN**: bắn lên mặt tường vẫn là việc đúng của cung thủ — chỉ là
   muốn bắn thì phải LÙI RA lấy góc, đúng như ngoài đời, và chính vế đó tự đẩy cung thủ ra khỏi
   chân tường thay vì đứng chết dí ở đó.
   ⚠ **ĐỪNG SIẾT DỐC CẬN CHIẾN XUỐNG NỮA** cho "đẹp hơn": cận chiến còn phải với tới người đứng
   cao hơn mình một hai bậc ở cự ly rất gần (dx ~0.6, dy ~0.4 đã là dốc 0.67). Siết quá là nhát
   chém đi ngang dưới chân họ và **trượt mà không ai hiểu vì sao**.
   ⚠ Chỉ áp cho AI (`StickmanAgent.AimTowards` + `CombatStrategyBase`), KHÔNG áp cho người
   chơi: bốn kiểu ngắm của người chơi là phần CHƠI, kẹp vào là ăn trộm quyền điều khiển.

2b-ngo. ⚠⚠⚠ **THẤY MÀ KHÔNG ĐUỔI: `visionRange` LỚN HƠN `disengageRange` LÀ MỘT VÀNH ĐAI
   ĐỨNG NGƠ** (2026-09-04, từ báo cáo *"AI thấy địch/đích tấn công mà không biết lao ra nghênh
   chiến"*).

   `AIStateSeek` vứt mục tiêu ngay khi nó xa hơn `disengageRange`. Nên hễ tầm NHÌN rộng hơn
   tầm ĐUỔI là có nguyên một vành đai mà AI **nhìn thấy địch rồi lập tức bỏ**: nhặt → bỏ →
   nhặt lại mỗi nhịp quét. Không lỗi nào báo — `AcquireTarget` và `Seek` đều đang làm đúng
   phần việc của mình.

   Đo được: **7/34 asset `AIProfile`** vi phạm, và cái dính nặng nhất đúng là cái đáng ra
   không được dính:

   | Profile | nhìn | đuổi (cũ) | vành đai ngơ |
   |---|---|---|---|
   | `AIProfile_Ninja` | 16 | 10 | **6.0** — hơn một phần ba tầm nhìn |
   | `AIProfile_TowerGuard` | 12 | 10 | 2.0 — mà cả NGHỀ của nó là đứng cao NHÌN XA |
   | `AIProfile_Pirate` · 3 pha `Boss` | 12 | 10 | 2.0 |
   | `AIProfile_Sailor` | 11 | 10 | 1.0 |

   Chốt bằng **`AIProfile.DisengageRange`** = `Max(disengageRange, visionRange × 1.15)`, đọc
   LÚC CHẠY. Mọi chỗ đọc đã chuyển sang nó; đọc thẳng `disengageRange` từ nay là sai.
   · ⚠ **Sửa ở CHỖ ĐỌC, đừng đi sửa 7 asset**: `disengageRange` là field SERIALIZED nên asset
     đã bake giữ số cũ, và cây thứ 8 gõ tay ngày mai lại dính y hệt. Đúng khuôn `SteadyAimTime`
     / `StickmanLocomotion.SpeedTuning` / `StickmanController.ImpactTuning`.
   · ⚠ **Có LỀ (1.15) chứ không chỉ `Max(vision, disengage)`**: bỏ đuổi ở đúng mép tầm nhìn
     thì địch nhích nửa bước là mất mục tiêu, bước lại là có — cùng cái nhấp nháy, chỉ hẹp
     hơn. Đây là VÙNG CHẾT của cặp luật "thấy" ↔ "đuổi" (§5c).
   · ⚠ Zombie khai `disengageRange = 999` (ngửi thấy là theo tới chết) vẫn qua nguyên — `Max`
     không cắt gì.
   · `AIPlaybook.visionScale` và `AISmartsTable.visionScale` ĐÃ nhân cả hai trường nên không
     tự đẻ ra vành đai; chỉ số gõ tay trong asset mới đẻ.

   ⚠ Đây mới là MỘT trong ba nguồn "đứng ngơ" của cùng một báo cáo — xem tiếp 2b-tudi (nguồn
   NẶNG NHẤT: cả bộ máy tự đi tìm địch bị khoá) và §2d (lính gác cố ý đợi).

2b-tudi. ⚠⚠⚠ **CẢ BỘ MÁY "TỰ ĐI TÌM ĐỊCH" BỊ KHOÁ SAU MỘT CỜ MÀ HẦU HẾT MÀN KHÔNG BAO GIỜ
   BẬT** (2026-09-04, cùng báo cáo *"AI thấy địch mà không biết lao ra nghênh chiến"* — người
   dùng xác nhận thấy ở **mọi màn**, kể cả lính thường đang tấn công).

   `AIStateIdle` có sẵn nhánh tự hành quân tới chỗ địch (`leaderlessHuntRange`, khai **30**
   ở **cả 34 asset `AIProfile`**). Nhưng nó bị chốt sau đúng một câu `Agent.IsLeaderless`, mà
   cờ đó **chỉ `CommandNode` mới bật** — tức chỉ đúng lúc chủ tướng vừa tử trận. Hệ quả:

   > Màn nào KHÔNG có `TeamCommander` thì nhánh đó **không bao giờ chạy một lần nào**.

   Và đó là phần lớn dự án: AI Lab · các màn để MODE phát lệnh · sân map · mọi màn chưa gắn
   cây chỉ huy. Ở đó lính chỉ quanh quẩn trong `patrolRadius` quanh chỗ spawn và chỉ nhúc
   nhích khi địch mò vào `visionRange` — mặc định **7**, tức **hẹp hơn cả bề ngang khung nhìn
   (8.9)**. Người xem thấy hai đạo quân cùng nằm trên MỘT màn hình mà không bên nào xông lên.
   Không lỗi nào báo: `AIStateIdle` đang làm đúng thứ nó được bảo làm.

   **Câu hỏi ĐÚNG không phải *"chủ tướng tôi còn sống không"* mà *"tôi có việc nào khác
   không"*.** Mất chỉ huy chỉ là MỘT lý do rơi vào Idle, không phải lý do duy nhất — lý do
   thường gặp hơn nhiều là `HuntTarget` + objective NULL (§4b đã ghi: *"lính KHÔNG CÓ GÌ để
   đi tới nên lang thang tại chỗ"*), và `FreeRoam` (bộ mặc định của mọi builder scene).

   Nay `AIStateIdle.ShouldHuntAlone` hỏi ba chốt, thiếu cái nào cũng đổi hành vi màn khác:
   · **NGHỀ CỦA TÔI LÀ ĐÁNH** (`IsCombatant`) — thợ · dân thường · phu khiêng không đi săn;
   · **KHÔNG AI GIAO CHỖ ĐỨNG** (`Objective == null`) — có cột mốc thì `AIStateSeek.
     MarchToObjective` lo, còn lính giữ tuyến/gác/phục kích nằm ở STATE KHÁC hẳn
     (`GuardTarget` · `Ambush` · `Garrison` · `Work` không đi qua Idle);
   · **KHÔNG ĐANG GIỮ TUYẾN** (`HoldingLine`) — chủ tướng bảo đứng thì đứng.

   ⚠ **TẦM XA / HỖ TRỢ VẪN KHÔNG ĐƯỢC VƯỢT TUYẾN** trong lúc tự đi tìm. `HuntAlone` gọi thẳng
   `Locomotion.Move` nên nó KHÔNG đi qua chỗ giữ đội hình của `CombatStrategyBase.UpdatePosition`
   — thiếu vế này là ông thầy thuốc (`SpawnPriestShared` khai `FreeRoam`, vai Support) lóc cóc
   DẪN ĐẦU cả đạo quân đi tìm địch, đúng thứ mốc đội hình sinh ra để chặn. Nay `HuntAlone` hỏi
   `TryGetFormationLimitX`.

   ⚠ **Đội quân đứng xem của `ChampionDuel` KHÔNG bị đụng** — nó dùng `GuardTarget` vào một
   cột mốc, tức ở `AIStateGuard`. Đã soát: mọi chỗ khai `AIBehavior.FreeRoam` trong dự án đều
   là lính ĐÁNG RA PHẢI ĐÁNH (squad AI Lab · màn thể loại · lính trung cổ · đấu trường).

   ⚠ **KHÔNG phải dựng lại scene nào** — code runtime.

   ⚠ Còn một nguồn "đứng như tượng" nữa và nó CỐ Ý, chưa đụng: `AIStateGuard` chỉ xông ra khi
   địch vào trong `guardScreenDistance + guardHoldMargin` (≈3.6). Đúng cho VỆ SĨ kèm VIP, sai
   cho một TUYẾN THỦ — §2d ghi cách chữa (`AIPlaybook.guardRangeScale`, hiện chỉ bật ở Defense
   2.6 · Survival 2.8). Đó là quyết định của TỪNG MÀN, không phải một con số chung.

2b-can. ⚠⚠ **CÁN VŨ KHÍ CŨNG GÂY DAMAGE — nhưng NHẸ HƠN ĐẦU** (user chốt 2026-09-04:
   *"giáo, kích chỉ cho đánh trúng phần đầu thôi, phần gỗ không gây damage"*).

   `MeleeWeapon.SweepHits` quét MỘT hình tròn quanh MŨI vũ khí. Với cây ngắn thì bán kính
   0.25 phủ trọn cây nên không ai để ý; với họ CÁN DÀI thì khúc gỗ đi XUYÊN QUA người mà
   không có gì xảy ra. Đo được (tầm lấy từ bảng "với tới từ trên yên", `_hitRadius` 0.25,
   `_reachExtension` 1.3):

   | Cây | tầm | tay→mũi | cán CHẾT | % cán |
   |---|---|---|---|---|
   | Thương | 0.94 | 0.53 | 0.28 | **53%** |
   | Kích | 0.90 | 0.50 | 0.25 | **50%** |
   | Giáo | 0.79 | 0.42 | 0.17 | **40%** |
   | Đao dài | 0.60 | 0.27 | 0.02 | 7% |
   | Kiếm · búa cận chiến · côn dài | ≤0.57 | ≤0.25 | 0 | 0% — mũi phủ trọn cây |

   Nay có `_haftDamageScale` (sát thương **và lực đẩy** của cú quật bằng cán) +
   `_headLengthPercent` (đoạn ĐẦU tính từ mũi, ăn đòn đầy đủ). Bảng theo LỚP:
   **Polearm 0.35 / đầu 0.22** · **HeavyMelee 0.35 / đầu 0.40** · còn lại **0**.

   ⚠⚠ **THỨ TỰ QUÉT LÀ HỢP ĐỒNG: MŨI TRƯỚC, CÁN SAU.** `_hitThisSwing` cho mỗi nạn nhân đúng
   MỘT lần trúng mỗi nhát, nên ai bị mũi với tới thì đã ăn đòn ĐẦY trước khi vòng quét cán
   chạy tới. Đảo lại là mọi cú đâm trúng đích cũng chỉ còn sát thương khúc gỗ, và không có gì
   báo.

   ⚠ **CẮT BỎ ĐOẠN MŨI ĐÃ PHỦ** (`haftLength = Min(theo tỉ lệ, length − radius)`). Nhờ vế
   HÌNH HỌC này mà bật cán cho cả họ vũ khí ngắn cũng VÔ HẠI: kiếm dài 0.25 từ tay tới mũi mà
   bán kính quét đã 0.25 ⇒ `haftLength` ra số âm, hàm thoát ngay, không tốn một tia nào. Chỉ
   ba cây thật sự dài mới thêm 1–2 vòng quét. Đo bằng hình học nên đổi `_hitRadius` hay đổi
   cỡ vũ khí là nó tự đúng theo — không phải đi chỉnh lại bảng lớp.

   ⚠⚠ **LỰC ĐẨY PHẢI GIẢM THEO, KHÔNG CHỈ SÁT THƯƠNG.** `StickmanController.ApplyHitStun`
   tính độ choáng bằng `forceScale^0.4`, mà `forceScale` chính là `Knockback` — nên nếu chỉ
   nhân sát thương thì cú quật bằng cán vẫn khoá đòn nạn nhân y hệt cú đâm bằng mũi, tức
   "nhẹ hơn" chỉ đúng một nửa. `WeaponBase.ApplyHit` nay nhận thêm `forceScale` (âm = dùng
   `Knockback` như cũ).

   ⚠⚠ **ĐÂY LÀ MỘT LEVER CÂN BẰNG, KHÔNG PHẢI MỘT BẢN VÁ HÌNH HỌC.** Vùng chết
   (`_minRangePercent`, giáo 0.55–0.62) là ĐIỂM YẾU DUY NHẤT của họ vũ khí dài — luật cũ
   *"bị áp sát là VÔ DỤNG"* nay thành *"bị áp sát thì chỉ còn khúc gỗ"*. Nới `_haftDamageScale`
   lên cao là xoá luôn điểm yếu đó và giáo thành vũ khí mạnh nhất bộ.
   · Vì vậy vòng quét cán CỐ Ý **không áp `_minRangePercent`** (đó chính là điểm), còn vòng
     quét mũi thì vẫn áp.
   · Và `Weapons > Balance Report` đã được sửa để KHÔNG NÓI DỐI: phần phạt vùng chết nay nhân
     `(1 − haftDamage)`, cột ghi chú in *"vùng chết 62% (cán còn 35%)"*. Không sửa vế này thì
     bảng vẫn chấm giáo như thể nó bất lực hoàn toàn ở tầm gần — nói dối theo hướng CÓ LỢI cho
     chính cây vừa được buff.

   ⚠ Gizmo (`OnDrawGizmosSelected`) vẽ luôn mấy vòng quét cán bằng đúng phép tính đó, nên
   "cây này cán ăn từ đâu tới đâu" nhìn là biết.

   ⚠ **PHẢI BẤM LẠI TOOL** — hai số nằm trong prefab đã bake. `★ Bảng điều khiển` → *Art · vũ
   khí · nhân vật · NPC · trang bị · âm thanh* (cùng nút với đợt sửa tầm ném ở §7b-tambay).
   Chưa bấm thì `_haftDamageScale` = 0 ở mọi cây và hành vi y hệt bản cũ.

2b-dan. ⚠⚠⚠ **ĐẠN CÓ HẠN + GIỎ TIẾP TẾ — CÁI GIÁ CỦA MỘT PHÁT BẮN LÀ QUÃNG ĐƯỜNG, KHÔNG
   PHẢI SÁT THƯƠNG** (user chốt 2026-09-04: *"cung, giáo quá mạnh, muốn có giới hạn số lượng
   mũi tên và mũi giáo"*).

   §7b-nerf đã nerf tầm xa một lượt bằng SÁT THƯƠNG và người dùng vẫn báo "quá mạnh" — đúng,
   vì thứ làm cung mạnh không phải con số damage mà là **đứng ngoài tầm với mà bắn bao nhiêu
   cũng được**. `_ammo` để −1 (vô hạn) ở mọi cây nên lợi thế đó KHÔNG CÓ GIÁ. Hạ damage chỉ
   làm trận dài ra, không đổi được cán cân.

   **BỐN MẢNH, và mảnh nào thiếu cũng biến ba mảnh kia thành cái bẫy:**

   | Mảnh | Ở đâu | Việc |
   |---|---|---|
   | ĐẾM ĐẠN | `WeaponBase._ammo` / `_maxAmmo` / `Reload` | một chỗ cho CẢ cung lẫn lao |
   | HẾT = TAY KHÔNG | `WeaponBase.RefreshAmmoVisual` | cây rỗng ẨN HÌNH |
   | CHỖ NẠP | `AmmoCache` (Combat) | đứng trong bán kính 1.1 s → đầy CẢ KHO |
   | AI BIẾT ĐI NẠP | `AIResupplyModule` (bộ mặc định) | về giỏ, không có giỏ thì bỏ cây rỗng |

   ⚠⚠ **`_ammo` DỜI LÊN `WeaponBase`, KHÔNG để hai bản ở hai lớp con.** `RangedWeapon` và
   `ThrowableWeapon` mỗi lớp từng có một `_ammo` riêng y hệt nhau — nạp lại thì phải viết hai
   lần, và cây thứ ba (`MagicWeapon`? nỏ liên thanh?) lại một lần nữa. Tên field GIỮ NGUYÊN
   nên prefab đã bake vẫn nạp đúng (Unity khớp theo TÊN trong cả cây kế thừa).

   ⚠⚠ **HẾT ĐẠN = TAY KHÔNG là TOÀN BỘ phần phản hồi.** Không có thanh đạn trên đầu ai cả,
   nên thứ duy nhất nói "thằng này bắn hết rồi" là cây vũ khí BIẾN MẤT khỏi tay — đọc được từ
   xa, đúng ở mọi cỡ nhìn, không tốn một pixel giao diện. HUD người chơi in thêm `đạn 9/14`.
   · ⚠ `RefreshAmmoVisual` phải NHƯỜNG khi đang CẤT TẠM (leo thang): `SetStowed` là chủ của
     hình lúc đó và nó nhớ trạng thái để trả lại đúng lúc rút ra. Ghi đè ở đây là leo thang
     xong cây lao vừa ném đi hiện ra một bản ma.
   · ⚠ `Equip` cũng phải hỏi `HasAmmo` chứ đừng `SetVisualActive(true)`: cầm lên một cây đã
     cạn mà thấy nó hiện ra thì người chơi bấm mãi không hiểu vì sao không bắn được.

   **BẢNG SỐ ĐẠN** (`StickmanWeaponBuilder.SetAmmo`):

   | Cây | đạn | nghĩa là |
   |---|---|---|
   | Cung | 10 | ~13 giây bắn liên tục — trọn một đợt xung phong, không trọn trận |
   | Nỏ 8 · Trường cung 6 · Hoả mai 6 | | mỗi phát càng đắt thì mang càng ít |
   | Ná dây | 14 | đá nhặt đâu chả có, nhưng yếu nhất bộ |
   | Lao 5 · Búa ném 4 · Lựu đạn 3 · Bom 2 | | bom nổ một phát chết lính 3 máu |

   ⚠⚠ **VÙNG NẠP KHÔNG ĐƯỢC TRÙM LÊN ĐIỂM HỒI SINH** (dính ngay lần đầu, 2026-09-04: user báo
   *"bắn hoài không thấy hết mũi tên"*). Bản đầu đặt giỏ cách mốc hồi sinh **1.4** với bán kính
   **1.7** ⇒ người ĐỨNG NGAY MỐC đã nằm trong vùng nạp, cứ 1.1 giây đầy đạn một lần. Tức là
   **đạn vô hạn cho bất kỳ ai nán lại chỗ xuất phát** — mà đó đúng là chỗ người chơi đứng lúc
   mở màn và chỗ quân hồi sinh rơi xuống. Không lỗi nào báo: đếm đạn chạy đúng, nạp chạy đúng,
   chỉ là hai vùng chồng lên nhau.
   Nay **3.0 / bán kính 1.3** ⇒ vùng nạp ở 1.7…4.3 tính từ mốc: phải CHỦ Ý bước sang mới nạp
   được. Cái giá của một phát bắn là quãng đường, nên quãng đường đó không được bằng không.
   ⚠ Bài học rộng hơn: **thêm một vùng có tác dụng liên tục thì phải hỏi ngay "chỗ nào người ta
   đã đứng sẵn trong đó rồi"** — điểm hồi sinh, chỗ spawn, chốt gác, vòng chiếm.

   ⚠⚠ **HAI MODULE HAI PHA LẬT QUA LẬT LẠI — cung thủ ôm cây cung VÔ HÌNH** (user báo
   2026-09-04: *"AI bắn cung nhiều quá mà không thấy hết cung quay về nạp đạn hay đổi vũ khí"*).
   `AIWeaponSwapModule` nhánh 4 (*"địch kite ngoài tầm → rút vũ khí tầm xa"*) lấy cây tầm xa
   ĐẦU TIÊN trong kho mà **không hỏi còn đạn không**, trong khi `AIResupplyModule` vừa đổi
   người đó sang cận chiến vì cung đã cạn. Hai module chạy hai pha khác nhau (`BeforeState` ↔
   `AfterState`) nên chúng lật nhau: cung thủ hết tên đứng ôm cây cung vô hình, không bắn
   được, cũng không đi nạp. Đúng §5c, và không lỗi nào báo.
   · Chốt ở **`StickmanWeaponHolder.CanAutoSwapTo`** (cửa thứ ba: *còn đạn không*), KHÔNG chốt
     ở từng module — mai có module thứ ba đi tìm vũ khí trong kho thì nó vẫn phải đi qua đó.
     Đúng khuôn bộ lọc thể loại đã chốt ở chính hàm này.
   · ⚠ CHỈ chặn đường TỰ ĐỔI. `EquipIndex` gọi thẳng (loadout · kịch bản · người chơi bấm số)
     không bị đụng — người chơi có quyền cầm cây cung rỗng đi về giỏ mà nạp.

   ⚠⚠ **KHAI `modules` BẰNG TAY THÌ KHÔNG ĐƯỢC HƯỞNG `DefaultKinds`** (`Make` gán
   `modules ?? DefaultKinds` — THAY THẾ, không cộng thêm). Bẫy này đã lặp **bốn lần**:
   `CavalryRaid` → `Watch` → `Resupply` → và 2026-09-08 là `FireArrow`.

   Lần thứ tư đắt nhất: **Siege** và **Raid** kê tay 8 module mà cả 8 đều đã có trong bộ mặc
   định, nên việc duy nhất chúng làm là đánh rơi `FireArrow` — ở đúng hai bộ AI lấy CÔNG TRÌNH
   làm mục tiêu. `AIFireArrowModule` (viết riêng cho việc đốt nhà) nằm im, `Demo_26_Raid` chỉ
   còn cách CHÉM cho nhà hết máu, và nhìn vào không phân biệt được với *"màn này cố ý không cho
   đốt"*. Chữa tận gốc: **thôi kê tay**. Raid nay không truyền `modules`; Siege dùng
   `Without(WeaponScavenge)` (bộ mặc định TRỪ đúng một ngoại lệ có lý do).
   ⚠ Phép đo tự động thay cho việc phải nhớ: `StickmanDoctor` mục *«Bộ AI đánh CÔNG TRÌNH mà
   không ai châm được lửa»* — đọc ASSET đã bake, `objectiveIsStructure` mà thiếu `FireArrow`
   là ĐỎ (sửa code xong chưa bấm lại nút thì asset vẫn cũ, và mục này nói ra điều đó).

   ⚠ **SỐ ĐẠN PHẢI HIỆN TRÊN F9** (`◍7/10` · `○HẾT ĐẠN`). Cả hệ tiếp tế VÔ HÌNH nếu không in
   ra: cây hết đạn thì ẩn hình, nên nhìn vào chỉ thấy một anh lính tay không đứng đó — không
   phân biệt được *"hết tên đang đi nạp"* với *"AI hỏng"*. Một ảnh chụp F9 phải trả lời được
   câu đó.

   ⚠ **TIẾN ĐỘ NẠP PHẢI HIỆN RA** (`AmmoCache.ProgressFor` → HUD *"ĐANG NẠP 60% (đứng yên)"*).
   Nạp mất 1.1 giây đứng YÊN mà trong quãng đó không có gì đổi trên màn hình — người chơi bước
   tới, chờ nửa giây, thấy cây cung chưa hiện lại thì bỏ đi và kết luận "cái giỏ hỏng".

   ⚠⚠ **SÚNG HIỆN ĐẠI CỐ Ý ĐỂ VÔ HẠN.** Tiểu liên nhịp 0.175 s thì một "băng" 20 viên hết
   trong **3.5 giây** — cái đó đòi cơ chế BĂNG ĐẠN + nạp tại chỗ, một hệ khác hẳn cái giỏ.
   Khai hạn cho chúng mà không có hệ nạp là ba màn hiện đại đứng hình sau bốn giây. Hoả mai
   thì CÓ hạn: nó là cây trung cổ, nhịp nạp 1.95 s.

   ⚠⚠ **GIỎ GẮN KÈM `AddRespawnDirectorShared`, KHÔNG bắt từng builder nhớ.** Đó là NÚT THẮT:
   mọi màn chơi được đều gọi nó và nó đã biết mốc "nhà" của từng phe ⇒ hơn 25 màn được lo
   trong một lần sửa, màn thứ 26 tự có. Bắt từng builder nhớ một dòng là kiểu gì cũng sót một
   màn — mà sót thì cả tuyến cung màn đó bắn hết băng rồi đứng TAY KHÔNG tới hết trận, KHÔNG
   có lỗi nào báo. Đúng khuôn `AddCivilizationAssignerShared`.
   · Loạn chiến (mỗi người một phe) đặt MỘT giỏ TRUNG LẬP giữa sân — đặt theo phe là ra một
     rừng giỏ.
   · **Bàn thử vũ khí và MỌI vùng AI Lab đều phải có giỏ.** Bàn thử không có giỏ là 14 phát
     sau hết thử được cây cung; AI Lab không có giỏ là mọi bài có cung thủ TỰ BIẾN CHẤT sau
     ~19 giây (module bỏ cung đi lượm cây khác) — bài "săn cung thủ", "tường khiên", "đội hình
     tuyến" đều nói dối từ giây thứ 20, không lỗi nào báo. Cùng họ với luật *"bài test AI mà
     ít quân là bài test nói dối"*.

   **THỨ TỰ QUYẾT ĐỊNH CỦA `AIResupplyModule`** — không hiển nhiên, đừng đảo:
   1. **Địch dí sát mặt → đổi cận chiến, ĐỪNG chạy.** Quay lưng chạy 20 đơn vị lúc bị kèm là
      chết chắc; cái giá phải trả bằng quãng đường lúc rảnh, không bằng mạng.
   2. **Có giỏ trong `resupplyRange` (22) → đi nạp.** Ưu tiên HƠN việc đổi sang kiếm: đổi sang
      kiếm là cây cung không bao giờ được nạp lại nữa (module chỉ nhìn cây ĐANG CẦM), và cả
      tuyến cung lặng lẽ thoái hoá thành bộ binh sau một băng đạn.
   3. **Không có giỏ → đổi cây khác trong kho, hết cách mới VỨT.** `AIWeaponScavengeModule`
      (đã trong bộ mặc định) tự thấy tay không mà đi lượm — ở đây KHÔNG chép lại đường nhặt đồ.
   ⚠ Có CAM KẾT `TripCommit` 9 s, nếu không thì đúng vòng lặp §5c: quay lưng về giỏ thì hết bị
   dí, hết bị dí thì quay lại đánh, quay lại đánh thì lại thấy mình rỗng đạn…
   ⚠ `resupplyRange` phải RỘNG hơn tầm nhìn nhiều — cái giỏ nằm sau lưng tuyến, quét đúng
   `visionRange` (7) là không cung thủ nào tìm ra nó và cả hệ tiếp tế nằm chết.
   ⚠ `AmmoCache` nạp **CẢ KHO**, không riêng cây đang cầm: nạp một cây thì lính đổi sang cây
   thứ hai là lại phải chạy về, và cái vòng đó đọc ra thành "AI chạy đi chạy lại".

   ⚠ **GIỎ KHÔNG GẮN `TeamMember`** — gắn là nó lọt vào radar chọn mục tiêu và mọi vòng ĐẾM
   QUÂN (`SkirmishMode`, trần hồi sinh) phải nhớ lọc ra. Phe lưu thẳng bằng `_teamId`, **−1 =
   trung lập**. "Phá được giỏ tiếp tế" là một quyết định thiết kế khác, để dành.

   ⚠⚠ **CHỨNG CỦA BƯỚC DỰNG VŨ KHÍ NAY LÀ FILE RIÊNG** (`StickmanWeaponBuilder.ProofPath` =
   `Assets/Settings/WeaponBuild.txt`). Nó từng mượn `StickmanFighter.prefab`/`StickmanNPC.prefab`
   — hai file bị CHẠM BỞI NHIỀU ĐƯỜNG KHÁC (dựng lại nhân vật, gắn động tác, gắn tiếng, Unity
   reimport). Đo được ngay trong đợt này: sửa bảng số đạn lúc 17:34, hai prefab nhân vật mang
   mtime 17:39 vì một đường khác vừa chạm vào ⇒ bảng điều khiển báo **XANH** trong khi
   `Weapon_Bow.prefab` không hề có `_ammo`. Mục xanh mà việc chưa chạy — đúng thứ LUẬT VÀNG
   cấm, và nó nói dối theo hướng tệ nhất.
   ⚠ Luật rút ra: **file chứng phải là thứ CHỈ bước đó ghi.** Mượn một file mà đường khác cũng
   chạm vào thì phép đo hỏng đúng lúc cần nó nhất.

   ⚠⚠ **MỖI PHE MỘT GIỎ, VÀ PHẢI NHÌN RA GIỎ CỦA PHE NÀO** (user chốt 2026-09-04).
   `AddRespawnDirectorShared` vốn đã dựng HAI giỏ (một cho mỗi phe), nhưng cả hai là cùng một
   cái giỏ mây nâu — mà `AmmoCache.Serves` thì chặn theo phe. Nghĩa là đứng nhầm giỏ địch sẽ
   **đứng mãi không nạp được và không có gì nói vì sao**: đúng loại hỏng câm lặng.
   · Chốt bằng CỜ HIỆU (`AmmoBasket_Flag.png`) — art vẽ **THANG XÁM**, `AmmoCache` nhuộm bằng
     `TeamMember.ColorOf` lúc chạy. Một tấm cho mọi phe, đúng khuôn bộ lông ngựa và
     `CommandInsigniaSet`; vẽ sẵn xanh/đỏ vào art là hai tấm phải nhớ sửa cùng nhau và phe
     thứ ba (zombie) thì không có tấm nào. Phe −1 tự ra XÁM vì đó là nhánh `default` của
     `ColorOf` — không cần ca riêng.
   · Cột cờ cắm ở MÉP TRÁI ngang miệng giỏ: chỗ duy nhất không lọt vào bó tên xoè lên.
     ⚠ Cờ là object CON nên phải **chia ngược cỡ của cha** (`0.30f / parentScale`) — bẫy
     `localScale` quen thuộc của dự án.
   · **AI Lab chia giỏ theo PHE** (xanh biên trái · đỏ biên phải), không để trung lập: phòng
     thí nghiệm là chỗ NHÌN hành vi, thấy cung thủ xanh chạy về giỏ XANH thì mới đọc ra "nó
     đang đi tiếp tế". Hai giỏ xám giống hệt nhau thì chỉ thấy lính chạy lung tung.
   · Còn TRUNG LẬP đúng hai chỗ, và đều có lý do: **loạn chiến** (mỗi người một phe — đặt theo
     phe là ra một rừng giỏ) và **bàn thử vũ khí** (ở đó bia mang team 9, không có hai phe nào).

   ⚠ **ART**: `Sprites/Environment/AmmoBasket.png` (giỏ mây + bó tên xoè + lao + búa dựa sườn)
   và `AmmoBasket_Flag.png`. Cả hai tên đã nối vào `StickmanEnvironmentArt.AllSpriteNames` nên
   tự vào `StickmanArtSource.ExpectedArtProof` — thiếu một tấm là mục *Vẽ bù art* ĐỎ trên bảng.
   Đường bao đã soi ở 56 px và 40 px: thứ đọc ra "chỗ lấy đạn" là NAN QUẠT cán tên xoè khỏi
   miệng giỏ, nên bó tên vẽ CAO HƠN thân giỏ; lông đuôi phải nằm TRÊN vành (vành vẽ sau, che
   mất phần dưới) không thì bó tên đọc thành nắm que.

2b-dauhieu. ⚠⚠ **ĐÃ BỎ CỜ LỆNH + NGÙ** (`UnitInsignia`, user chốt 2026-09-04). Hai lý do:
   · **cờ cắm sau lưng bị NGƯỢC khi quay trái** — rig lật gương bằng `localScale.x = -1` nên
     mọi thứ treo dưới nhóm `Sprite` đều soi gương theo; với một lá cờ có hoa văn thì soi gương
     đọc ra ngay là "cờ bị lật". Chữa thì phải vẽ bản gương riêng hoặc bù dấu — thêm một trục
     phải nhớ mãi mãi.
   · **ngù/quân hàm từng là kênh DUY NHẤT đọc ra cấp AI**, nhưng nay `UnitRankGear` đổi CẢ BỘ
     ĐỒ theo cấp (không nón → nón/giáp kiểu 1 → kiểu 2…), tức cấp đã đọc được bằng ĐƯỜNG BAO ở
     cỡ thật. Giữ cả hai là HAI KÊNH cho MỘT thông tin.
   ⚠ `ApplyLegacyCrown` GIỮ LẠI: vương miện là object đã BAKE trong scene cũ, và hàm này là chỗ
   duy nhất tắt nó khi chủ tướng tử trận. `ApplyBanner`/`ApplyPlume` giữ lại nhưng không ai gọi.

2c. **KỴ BINH = Strategy RIÊNG** (`CavalryCombatStrategy`, chọn khi `agent.IsMounted` + cầm
   cận chiến): vòng xung phong 4 nhịp — LẤY ĐÀ → ĐÂM XUYÊN (không dừng) → VƯỢT QUA
   (`overrunDistance`) → VÒNG LẠI (`wheelTime`). KHÔNG dùng lại `MeleeCombatStrategy` được
   vì cả khung của nó là "giữ đúng tầm, đánh xong lùi lấy nhịp" = đứng yên một chỗ, ngược
   hẳn với kỵ binh. Cung/phép trên lưng ngựa vẫn kite như thường (kỵ xạ).
   ⚠ **Vế đối trọng BẮT BUỘC**: `braceAgainstCavalry` — lính cầm `Polearm` thấy kỵ binh vào
   `braceRange` thì CHÚC GIÁO đứng vững (không lùi, đâm ngay khi nó vào tầm,
   `CombatStrategyBase.IsBracing`). Bỏ vế này là kỵ binh vô đối: lính giáo cứ lùi thì
   không cú đâm nào chạm được con ngựa đang phi.
2c-bis. **ĐỘT KÍCH TUYẾN SAU** (`AICavalryRaidModule`, `AIProfile.cavalryRaid*`): Strategy lo
   "đánh THẾ NÀO", module này lo "đánh AI". Trước đó kỵ binh vẫn chấm mục tiêu bằng
   `SelectBestEnemy` chung với bộ binh — mà hàm đó chấm gần như theo KHOẢNG CÁCH, nên con ngựa
   chạy 3 mét rồi húc vào ông khiên gần nhất: mất sạch giá trị của binh chủng cơ động.
   Nay đang cưỡi thì nó tự **bỏ qua tuyến đầu, phi thẳng vào cung thủ / pháp sư / thầy thuốc /
   chủ tướng / dân sự**. **BỐN VẾ, thiếu vế nào cũng hỏng**:
   · `cavalryRaidRange` (16) **RỘNG HƠN `visionRange`** — mồi ngon vốn nằm SAU tuyến đầu, quét
   đúng tầm nhìn thì nó chỉ thấy mấy ông khiên trước mặt;
   · **CHỈ nhắm mồi ĐÁNG đột kích** — không ai đáng thì trả lái về FSM, đừng ép nó bỏ tuyến
   đầu bằng mọi giá ("đột kích" một ông khiên thì thà đứng đánh);
   · `cavalryRaidCommit` (5s) **CAM KẾT** — suốt quãng phi qua tuyến đầu lúc nào cũng có đứa
   gần hơn con mồi, chấm điểm lại giữa đường là quay đầu giữa đà (đúng vòng lặp §5c);
   · `cavalryPikeAvoid` **NÉ RỪNG GIÁO** — mồi có `Polearm` đứng che thì trừ điểm. Bỏ vế này
   thì `braceAgainstCavalry` khắc chế được cái gì? Kỵ binh có phải CHỌN đường vào đâu.
   ⚠ Cam kết đó được đọc ở **NĂM chỗ**, thiếu chỗ nào cũng vỡ: `UpdateRetarget` · `AIStateSeek`
   (không bỏ mồi vì xa hơn `disengageRange` — mồi VỐN ở xa) · `AIStateSeek` luật "đứa dí sát
   mặt thì xử trước" (kỵ binh băng qua cả tuyến nên frame nào cũng dính) · `OnOwnerDamaged`
   (phi qua mưa tên, quay ra đánh trả từng đứa là không bao giờ tới nơi) · và chính module
   (nhường `IsBreakingObstacle` — có rào chắn ngang thì đập rào trước). Soi bằng **F9**: hậu
   tố **⚔**. Dấu ⚔ nhấp nháy tắt-bật = cam kết quá ngắn so với quãng đường, nới
   `cavalryRaidCommit` chứ ĐỪNG nới tầm quét.
2c-ter. ⚠⚠ **ĐỊCH DÀN NHIỀU CUNG THÌ KỴ BINH DỒN VÀO DỌN TUYẾN CUNG**
   (`AIProfile.cavalryRangedSwarm` = 1.6, user chốt 2026-09-04).

   `cavalryRangedBonus` là một con số CỐ ĐỊNH (10), nên **một ông cung lẻ đứng giữa đám kiếm
   và cả một tuyến cung mười người đáng giá y như nhau** với con ngựa. Nhưng đó là hai tình
   huống khác hẳn: cái đầu kệ nó cũng được, cái sau thì không ai dọn là thua trận — mà đó
   chính là việc binh chủng kỵ tồn tại để làm.

   Nay giá trị con mồi TẦM XA được nhân thêm:
   `nhân = 1 + cavalryRangedSwarm × (lính tầm xa ÷ tổng lính địch quanh đó)`.

   | Tỉ lệ cung của địch quanh đó | giá trị mồi | kỵ binh chịu phi xa tới |
   |---|---|---|
   | 0% | 10.0 | 10.0 (như cũ) |
   | 20% | 13.2 | 13.2 |
   | 35% | 15.6 | 15.6 |
   | ≥50% | 18.0+ | 16.0 — kịch `cavalryRaidRange`, tức thấy cung ở đâu là đi |

   ⚠ **ĐO THEO TỈ LỆ, KHÔNG THEO SỐ LƯỢNG.** 5 cung trong 40 quân là chuyện thường; 5 cung
   trong 8 quân mới là một tuyến cung phải đi dọn. Đếm đầu người thì map đông quân nào cũng
   kích hoạt còn map ít quân thì không bao giờ.

   ⚠ **ĐO TRONG `cavalryRaidRange`, KHÔNG ĐO CẢ SÂN** — nó trả lời đúng câu cần hỏi (*"chỗ tôi
   sắp phi tới có phải một tuyến cung không"*) và dùng lại đúng cái `_buffer` vừa quét, không
   tốn thêm vòng nào.

   ⚠ **RỪNG GIÁO VẪN CÒN TÁC DỤNG** — `PikeScreenPenalty` là điểm PHẠT, không phải quyền phủ
   quyết. Ở 70% cung + 2 giáo che, cung thủ KHÔNG được che vẫn thắng cung thủ có che một
   khoảng 14 đơn vị. Tức kỵ binh vẫn phải đi tìm cánh sườn hở, chỉ là không còn bị một hàng
   giáo mỏng doạ lui khỏi cả một tuyến cung — đúng ý đồ: **quân đông cung là quân sợ kỵ binh.**

   ⚠⚠ **MỒI VỪA CHẾT THÌ CHỌN CON TIẾP THEO NGAY** (`_hadPrey` → `_nextScan = 0`).
   `IsRaiding` tự tắt khi mồi chết, nhưng cửa `_nextScan` (`cavalryRaidInterval` 1.2 s) thì
   không biết — nên sau MỖI mạng con ngựa đứng ngơ hơn một giây rồi mới đi tìm mục tiêu mới.
   Nhân với cả một tuyến cung thì *"lao vào giết hết lính tầm xa"* hoá ra đi bộ từng chặng,
   và không có gì báo.

   ⚠ **BÀI 21 CỦA AI LAB NAY CÓ CỤM CUNG THỦ** (4 cung đỏ nấp SAU tuyến kiếm). Trước đó bài
   kỵ binh chỉ có kiếm và giáo, tức luật này KHÔNG CÓ CHỖ NÀO ĐỂ NHÌN — đúng bài học của bài
   26: *hệ nào không có chỗ để nhìn thì lỗi của nó sống bao lâu cũng được*. Đặt SAU tuyến kiếm
   là có chủ ý: phải thấy con ngựa PHI QUA đám kiếm mà không dừng lại chém.

2d. **BỘ AI THEO GAMEPLAY — `AIPlaybook`** (`Assets/Settings/Playbooks/`, tool `AI > 8`):
   một asset gom **vai trò → tính cách · học thuyết cho tướng · cấp IQ · hệ số theo ĐỊA HÌNH
   MAP** (`visionScale`/`spacingScale`/`retreatScale`/`terrainTraversal`/`objectiveIsStructure`).
   Builder scene chỉ gắn `AIPlaybookBinder` + chọn playbook, KHÔNG gán tay từng NPC nữa.
   8 bộ sẵn: Skirmish · FieldBattle · Siege · Defense · WarCamp · Duel · Stealth · Survival.
   **BẢNG GÁN THEO SCENE** (mỗi màn một bộ — thêm mode mới thì thêm 1 dòng, đừng để trống):
   Demo_3 dàn trận→FieldBattle · Demo_4 VIP→Stealth · Demo_6 thủ nhà→Defense ·
   Demo_13 chiếm điểm→FieldBattle · Demo_14 công thành→Siege · Demo_15 hộ tống→Defense ·
   Demo_16 loạn chiến→Duel · Demo_17 kinh tế→WarCamp · Demo_18 boss→Survival ·
   Demo_20 doanh trại→WarCamp · Demo_21 đấu trường→Duel · Demo_22 ngày/đêm→Survival ·
   Demo_23 cướp cờ→Skirmish · Demo_24 kéo co→FieldBattle ·
   Demo_26 cướp làng→Skirmish · Demo_27 đấu tướng→FieldBattle · Demo_28 vây thành→Defense ·
   Demo_32 giải cứu tù binh→Stealth.
   Sáu scene chế độ tra qua `StickmanModeBuilder.PlaybookFor(sceneName)`, ba scene trung cổ
   qua `StickmanMedievalModeBuilder.PlaybookFor(sceneName)` — mỗi builder MỘT bảng tra.
   Ba tầng xếp chồng theo THỨ TỰ: profile theo vai trò → hệ số map (bản sao runtime) →
   `AISmartsTable` theo cấp. Hai phe gán 2 playbook khác nhau = bài test AI hay nhất.
   Scene có máy sinh quân thì đặt `reapplyInterval` > 0 để lính mới cũng nhận đúng bộ AI.
   ⚠⚠ **SỐ GÁC MẶC ĐỊNH LÀ SỐ CỦA VỆ SĨ KÈM VIP — dùng cho THỦ TRẠI là cả tuyến ĐỨNG NHƯ
   TƯỢNG.** `guardHoldMargin` = 2 nghĩa là *chỉ xông ra khi địch đã vào trong ~3.6 unit tính
   từ thứ đang bảo vệ; xa hơn thì ĐỨNG YÊN đợi nó tới* — đúng cho vệ sĩ (lao ra là bỏ trống
   VIP), nhưng ở màn THỦ TRẠI thì việc phải làm là CHẶN TỪ XA, mà địch lại đi từ mép map vào.
   Suốt quãng đó không ai nhúc nhích: đọc ra thành *"AI không biết phải làm gì"*.
   Chữa bằng `AIPlaybook.guardRangeScale` (Defense 2.6 · Survival 2.8) — nó nhân **cả bốn số
   đi cùng nhau**: `guardHoldMargin` · `guardPatrolRadius` · `guardAlertRange` ·
   `guardLeashRange`. Nới một cái mà quên ba cái kia thì lính xông ra được nhưng bị leash kéo
   về ngay, hoặc không bao giờ THẤY địch để mà xông.
2d-bis. **MODULE — KHẢ NĂNG LẮP RỜI** (`Assets/Scripts/AI/Modules/`): bốn khả năng TÙY CHỌN
   (`AIHealerModule` thầy thuốc · `AITauntModule` khiêu khích · `AIWeaponSwapModule` ứng biến
   vũ khí · `AIWeaponScavengeModule` nhặt vũ khí) đã bóc khỏi `StickmanAgent` thành class rời.
   `AIPlaybook.modules` khai báo màn này lắp cái nào — bỏ trống = lắp cả bộ mặc định.
   **RANH GIỚI, đừng module hoá bừa**: chỉ khả năng ĐỘC LẬP + mặc định tắt mới thành module.
   Phần LÕI (tử chiến → rút lui → phá bế tắc → FSM tick → né đạn → vượt địa hình → giãn cách
   → chạy) Ở LẠI pipeline cứng vì **THỨ TỰ giữa chúng là hợp đồng** — tháo một mắt là vỡ hành vi.
   Module khai `Phase`: `BeforeState` cho cái ĐỔI ĐIỀU KIỆN state sắp đọc (đổi vũ khí — chậm
   một nhịp là nó lao vào giáp lá cà bằng cây cung vừa bỏ xuống), `AfterState` cho cái GIÀNH
   TAY LÁI khỏi state (đi nhặt đồ) hoặc chạy độc lập (hô, hồi máu).
   ⚠ `SetModules` phải THOÁT SỚM khi trùng bộ đang lắp — cùng lý do với `SetProfile`:
   `AIPlaybookBinder` áp lại theo nhịp, dựng lại module mỗi lần là xoá đồng hồ hồi máu /
   nhịp đổi vũ khí của cả sân.
   ⚠ Demo_20 doanh trại sinh lính TAY KHÔNG, sống nhờ `AIWeaponScavenge` — tháo module đó
   khỏi playbook WarCamp là cả trại đứng không vũ khí.
   · **CÔNG BINH** (`AIEngineerModule` + `AIProfile.engineerRange`, mặc định 0 = tắt): đi VÁC
   thang công thành đang nằm chờ và DỰNG lên cho cả đội trèo. `SiegeLadder` vốn đã có đủ cơ
   chế khiêng/dựng và `AIStateEscalade` đã biết dùng — nhưng nó đòi nguyên một HÀNH VI, phải
   khai lúc dựng scene, nên cái thang chỉ dùng được ở đúng hai màn công thành; thả một cái
   thang vào màn khác thì nó nằm đó tới hết trận vì **không ai có việc đi vác nó**. Module thì
   lắp vào lính THƯỜNG, vẫn đánh nhau như cũ, gặp thang thì tách ra dựng rồi quay lại.
   ⚠ Ba chốt: `TryReserve` (một người một thang, không thì cả tổ bỏ trận đi vác) · đang giáp
   lá cà thì thôi · `engineerCommit` (14s) — bỏ dở là thang rơi rồi nhịp sau lại đi nhặt, nhìn
   ra một anh lính chạy tới chạy lui ôm cái thang (§5c). Bật ở `siegeProfile` của hệ map.
   · **BẮT NGỰA HOANG** (`AIMountModule` + `AIProfile.mountSeekRadius`, mặc định **9 = BẬT**):
   kỵ sĩ ngã mà ngựa còn sống thì lính bộ gần nhất tách ra chạy tới cưỡi lên.
   ⚠⚠ **`RiderlessHorse` CỐ Ý KHÔNG GẮN `TeamMember`** — nhờ vậy `AreEnemies` trả true cho mọi
   phe (ai cũng chém được) mà `TeamMember.All` không chứa nó (không ai đi SĂN nó). Đúng ý đồ,
   nhưng vế trái của nó là **AI KHÔNG CÓ ĐƯỜNG NÀO NHÌN THẤY CON NGỰA**: `QueryNear` không trả
   về nó, nên cách DUY NHẤT để lên ngựa là TÌNH CỜ đi ngang trong `strayMountRadius` (vài đơn
   vị). Con ngựa đứng cách tuyến 8 mét gặm cỏ tới hết trận, không lỗi nào báo. Nay có sổ riêng
   `RiderlessHorse.All` — kênh cho việc "đi bắt", KHÔNG đụng radar địch.
   ⚠ Module **không tự gọi `StickmanMount.Mount`**: chỉ lái người tới gần rồi để
   `RiderlessHorse.TryPickUpRider` trao ngựa như cũ. Hai chỗ cùng trao là hai bộ luật (thời
   gian chờ `_mountableAt`, chênh cao, "đang cưỡi con khác chưa") phải khớp nhau mãi mãi — và
   cái thứ hai chắc chắn có ngày lệch.
   ⚠ Bốn chốt như `AIRescueModule`: đang giáp lá cà thì thôi · MỘT người MỘT con (sổ xí phần
   STATIC) · cam kết `mountSeekCommit` · bán kính hẹp. Nằm trong `DefaultKinds` vì nó tự tắt
   ngay dòng đầu khi sổ ngựa rỗng — để ngoài là phải nhớ khai ở từng playbook có kỵ binh.

   Thêm module mới = 1 class + 1 giá trị `AIModuleKind` + 1 dòng trong `AIModuleLibrary.Create`.
   · ⚠⚠ **NHẶT VŨ KHÍ TỐT HƠN** (`AIWeaponScavengeModule.TickUpgrade` +
   `AIProfile.weaponUpgradeGain` 1.25 / `weaponUpgradeRadius` 7): **cả hệ CẤP VŨ KHÍ từng
   không có một người dùng AI nào.** `WeaponTierTable` · `WeaponTierLook` · 5 bậc vật liệu ·
   ~190 tấm art theo cấp — tất cả chỉ đổi chỉ số và hình của cây được PHÁT lúc dựng scene.
   Cây tinh xảo mà một ông tinh nhuệ vừa đánh rơi thì nằm đó tới lúc `DroppedItem` dọn đi, vì
   module bản cũ có đúng một điều kiện: **`held != null && !held.IsFallback` → thoát**, tức
   CHỈ nhặt khi tay không. Một anh dân binh cầm kiếm cấp 1 đi ngang cây kiếm huyền thoại mà
   không liếc mắt — không lỗi nào báo, hệ cấp vẫn "chạy đúng".
   Bốn chốt chặn:
   · **PHẢI HƠN HẲN** (hơn 25% sát thương/giây) — sát 1.0 là lính đổi vũ khí vì hơn nhau 1%,
     mà mỗi lần đổi là RỚT cây cũ xuống đất ⇒ vòng nhặt-rớt-nhặt vô tận (§5c);
   · **CÙNG `Category`** — không thì lính khiên tuyến đầu nhặt cây cung và tuyến thủng;
   · ⚠ **KHÔNG BỎ KHIÊN.** `ShieldWeapon` kế thừa `MeleeWeapon` nên DPS của nó gần 0 ⇒ *mọi*
     cây kiếm là "nâng cấp khổng lồ", và cả tuyến khiên vứt khiên đi trong mười giây đầu.
     Cái khiên là VAI TRÒ, không phải một lựa chọn sát thương;
   · **một cây một người + cam kết** (khuôn `AIRescueModule`).
   ⚠ Tới nơi thì gọi thẳng `WeaponPickup.GiveTo`, ĐỪNG dựa vào trigger: `HandleInRange` bắt AI
   đang cầm vũ khí **lắc xúc xắc MỘT LẦN DUY NHẤT cho mỗi người** (`_aiRollOncePerCharacter`)
   — trượt là con đó vĩnh viễn không nhặt được cây đó nữa. Xúc xắc ấy dành cho lần đi ngang
   TÌNH CỜ; đây là một quyết định có chủ ý.
   · **ĐỘT KÍCH TUYẾN SAU** (`AICavalryRaidModule`) — xem mục 2c-bis. Nằm trong `DefaultKinds`
   (module tự tắt ngay dòng đầu khi `!agent.IsMounted`, bộ binh chỉ trả một phép so bool):
   để ngoài bộ mặc định thì phải nhớ khai tay ở TỪNG playbook có kỵ binh, mà quên một chỗ là
   cả cánh kỵ của màn đó đánh y hệt bộ binh và **không có lỗi nào báo**. Playbook nào khai
   `modules` bằng tay (Siege, Duel) thì phải tự nối vào — Siege đã nối, Duel cố ý không (đấu
   tay đôi không có tuyến sau để đột kích).
   · **BÁO ĐỊCH** (`AISpotterModule` + `AIProfile.spotShareRadius`, mặc định 0 = tắt): thấy
   địch thì HÔ toạ độ cho đồng đội quanh mình. Trước đó mỗi NPC chỉ biết cái NÓ tự nhìn thấy
   nên một tiểu đội đi cạnh nhau vẫn phản ứng rời rạc — đứa đi đầu đánh tới chết trong khi
   đứa sau 3 mét đứng ngơ vì vật cản che tầm nhìn. Đây là khác biệt giữa ĐÁM ĐÔNG và ĐỘI HÌNH.
   KHÔNG viết state mới: tin rót thẳng vào TRÍ NHỚ (`ReceiveSpotReport`) mà `AIStateSeek`
   vốn đã biết đi lùng theo. Ba chốt chặn: đang CÓ mục tiêu sống thì bỏ qua (mắt thật hơn
   tai) · trí nhớ tắt thì bỏ qua · tin xa hơn chỗ đang nhớ thì bỏ qua. Bật theo màn qua
   `AIPlaybook.spotShareRadius` (FieldBattle/Siege 8, Defense/WarCamp 7; Duel & Stealth để 0 —
   ám sát mà hô toáng lên là hỏng bài).
2g. **CANH GÁC + ĐỘT NHẬP** (`AIWatchModule` · `StickmanStealth` · `AIStateInfiltrate`):
   · **LÍNH GÁC** (`AIProfile.watchRadius` > 0, mặc định 0 = tắt): đứng chốt thì giữ dáng
     cảnh giới và đảo hướng theo nhịp. Ẩn thân đứng im không bị lính gác xuyên qua; khi ninja
     di chuyển/lộ, radar bình thường của `StickmanAgent` phát hiện và xử lý như mục tiêu khác.
   · **ĐỨNG CANH GÁC — dáng + hành vi** (`AIProfile.sentryStance` / `.sentryScanInterval`,
     mặc định BẬT): trong ca gác thì đứng **thế cảnh giới** (chân tấn, vũ khí sẵn sàng, đảo
     mắt) thay vì đứng thở như lính rảnh, và **ĐẢO HƯỚNG QUAN SÁT** theo nhịp — đứng gác mà
     nhìn mãi một phía thì địch vòng lối kia là đi thẳng vào không ai hay.
     · **KHÔNG thêm `StickmanActionType` mới** — chỉ thêm 1 STYLE `"sentry"` cho `Idle` (tên
     nằm ở `StickmanBodyAnimator.SentryStyle`), nên `Play`/`Pick`/`IsAmbientClip` chạy y
     nguyên, không có luật "clip loop phải khai vào IsAmbientClip" nào phải nhớ thêm.
     ⚠ Style khai **`weight = 0`** → KHÔNG BAO GIỜ bị bốc ngẫu nhiên, chỉ ai gọi đúng tên mới
     ra dáng gác. Để `weight > 0` là lính đang đánh nhau cũng đứng nghiêm giữa trận.
     · **Ô RIÊNG, không dùng chung với `SetDefaultIdleStyle`**: cái đó là style GỐC của loại
     nhân vật (zombie lê chân), khai một lần lúc sinh ra. Canh gác thì bật tắt liên tục —
     chung một ô là lính gác hết ca xong xoá luôn dáng lê chân của con zombie.
     · **`StickmanAgent.RequestSentry()` là ĐẦU VÀO GHI MỖI FRAME**, không phải cờ bền (cùng
     khuôn `StickmanLegWalker.SetActionLegs`): không ai phải nhớ TẮT khi thoát state/chết/đổi
     playbook, và ba nguồn cùng đòi được mà không giẫm nhau — `AIStateGuard` (đứng chốt) ·
     `AIStateGarrison` (trực trên tháp) · `AIWatchModule` (nghề gác, đúng cả khi state là
     Idle/Patrol). `SentryScan`/`RequestSentryStance` đặt ở LỚP GỐC `AIState` vì "đứng chốt"
     có ở nhiều state không họ hàng gì nhau; chép hai bản là hai nhịp đảo hướng khác nhau.
     ⚠ **Đảo hướng theo ĐỒNG HỒ, không theo cái vừa nhìn thấy** — mọi luật đổi hướng đọc lại
     thứ mình vừa đổi đều thành vòng lật qua lật lại (§5c). Thấy địch THẬT thì nhánh 2 của
     `StandGuard` chặn trước và nhường hướng cho `WatchSide` (vốn đã có quán tính).
     ⚠ **Phải chạy lại `Tools > Stickman > Animation > 1. Build Action Sets`** — bộ động tác
     cũ trên đĩa chưa có style này. Chưa chạy thì `Pick` không thấy tên, rơi về idle ngẫu
     nhiên: không lỗi, chỉ là không thấy dáng gác.
   · **ĐỔI GÁC** (`AIProfile.watchShiftTime` / `.watchRestTime`, mặc định 0 = gác liên tục như
     cũ): mỗi lính gác một CA; hết ca thì nghỉ, thôi quét và thôi dáng cảnh giới.
     ⚠ **PHA LỆCH THEO TỪNG NGƯỜI** (mã băm của object, cùng khuôn `PickVariant` của hệ nón).
     Dùng chung một đồng hồ là tới giờ CẢ TRẠM cùng nghỉ một lúc — có một cửa sổ không ai
     canh và ninja đi thẳng vào. Lệch pha thì tất định theo từng người (không nhấp nháy) mà
     cả trạm không bao giờ trống.
   · **ẨN THÂN** (`StickmanStealth`): chỉ ẩn khi ĐỨNG IM; `Move`/leo/nhảy hoặc còn trượt là
     hiện hình ngay. Khi còn đứng yên, radar địch không phát hiện; vòng quét mục tiêu của
     `StickmanAgent` vẫn hỏi `StickmanStealth.IsHiddenFrom` ở đúng MỘT điểm cắm nên chọn mục
     tiêu · chỉ huy · vây đánh · né đạn không phải biết gì về ẩn thân. Ra tay/trúng đòn cũng lộ;
     sau `_rehideDelay` và khi đứng im thì ẩn lại được. Lính gác không xuyên qua ẩn thân.
   · **ĐÒN HIỂM** cộng damage trong `StickmanStealth`, KHÔNG sửa `WeaponBase` — ninja dùng
     đúng vũ khí của bộ chung nên cân bằng vũ khí không đổi; tháo component là mất sạch,
     không để lại dấu trong hệ vũ khí. Đâm sau lưng ăn trọn, đối mặt chỉ nửa.
   · **`AIBehavior.Infiltrate`** (`AIStateInfiltrate`): chọn mồi theo GIÁ TRỊ (VIP → tướng →
     cung thủ trên tháp → lính thường, không theo khoảng cách) → áp sát (ngồi thấp khi vào
     gần) → **LEO THANG** lên tháp/tường → đâm → lộ thì rút vào bóng tối chờ ẩn lại.
     `OwnsTraversal` khi đang leo (cùng bài học với `AIStateGarrison`: pipeline có luật
     "hết địch thì buông thang", mà ninja leo lúc chưa ai thấy nó thì đúng là chưa có địch).
     ⚠ **LEO CẢ HAI CHIỀU.** Chỉ có chiều LÊN thì đâm xong ông cung thủ là ninja kẹt vĩnh
     viễn trên sàn tháp: mép sàn là mép vực nên hệ di chuyển không cho bước ra (đúng thiết
     kế), mà nó lại không biết quay lại cái thang. `_afterClimb` nhớ "leo xong về pha nào" —
     leo là PHƯƠNG TIỆN, dùng cho cả lúc đi săn lẫn lúc RÚT.
     ⚠ **NINJA KHÔNG PHÁ CỬA** (`AIProfile.breakObstacles = false`): vung dao vào cái cổng là
     mất sạch phần ẩn thân. Bị chặn thì nó đo "đòi đi mà không dời chỗ" (`TravelSpeed`, không
     phải `Velocity`) rồi đi tìm thang mà LEO QUA. Cái thang thử mà không tới nổi chân nó thì
     bị gạch tên có hạn (`RejectLadder`) — không có quán tính đó là nhảy qua nhảy lại giữa
     hai pha mỗi 2.5 giây (§5c).
   · Ninja KHÔNG phải `IsCombatant` — cây chỉ huy không lôi nó ra tuyến đầu.
   · **BỘ MẶT RIÊNG** (`AppearanceSet_Ninja` — khăn trùm bịt kín, chỉ hở KHE MẮT, KHÔNG nón):
     đúng khuôn `AppearanceSet_Zombie`. Đừng nhét mặt này vào bộ CHUNG — mọi lính để
     `_decoIndex = -1` (bốc ngẫu nhiên) nên sẽ có ông lính khiên trùm khăn ninja. Ẩn thân là
     cơ chế phải ĐỌC ĐƯỢC: không có mặt riêng thì ninja chỉ là "một ông lính bị mờ 45%".
   · **RÚT SẠCH KHO, chỉ để đao ngắn** (`StripToSaber`): prefab NPC mang sẵn cả bảng vũ khí
     nên module mặc định `AIWeaponSwap` rút cung ra ngay nhịp quét đầu. Cùng bài học với
     `MakePrisoner` / `StripToClaws` — đổi `_startIndex` là CHƯA ĐỦ.
   · Sân test: `Demo_33_Infiltration` — **KHÔNG có tường/cổng**: game nhìn ngang chỉ có MỘT
     làn đi, một dãy công trình đặc là bịt kín đường sang, mà sát thủ thì không phá cửa. Rào
     cản nằm theo chiều DỌC: ba chòi canh `passable: true` (chân tháp đi xuyên qua được, sàn
     thì không). Trong hệ map: `ArmySpec.infiltrators` (số sát thủ) và tuyến tầm xa của phe
     GIỮ TRẠI tự mang module canh gác.

2e. **NĂM CƠ CHẾ NỀN thêm sau** (đều tắt-được, mặc định trung tính):
   · **TRÍ NHỚ CHIẾN TRƯỜNG** (`memoryDuration/searchRadius/searchDuration`) — mất tầm nhìn
     KHÔNG quên ngay: nhớ chỗ thấy lần cuối, tới đó LÙNG SỤC rồi mới bỏ (`AIStateSeek.SearchLastKnown`).
     Trước đó địch lùi sau vật cản một bước là NPC đứng ngơ.
   · **TƯỜNG KHIÊN** (`shieldWallReactTime`) — lính khiên thấy tên bay tới thì DỪNG + giơ
     khiên (`agent.IsUnderFire`, dùng lại bộ dò của né đạn, cache theo frame).
   · **LOẠT TÊN** (`AIProfile.volleyWaitTime` + `CommandDoctrine.volleyInterval/volleyWindow`) —
     cung thủ GIỮ ĐẠN chờ chỉ huy hô nhịp rồi cả tuyến buông dây một lượt; chờ quá lâu thì
     bắn tự do (chống kẹt khi mất chỉ huy).
     ⚠⚠ **CƠ CHẾ NÀY TỪNG NẰM CHẾT SUỐT — code đủ, tài liệu đủ, mà KHÔNG SCENE NÀO BẬT.**
     `volleyInterval` để 0 ở mọi học thuyết và `volleyWaitTime` để 0 ở mọi profile, nên
     `UpdateVolley` thoát ngay dòng đầu và `CanFireVolley` luôn trả true: một mưa tên đồng
     loạt — thứ đọc được từ xa, nói cho người chơi biết tuyến cung địch còn chỉ huy hay đã
     tan — chưa từng xuất hiện lần nào. Nay `EnsureDoctrine` đặt **4.5s/1.4s** và tính cách
     *Rình rập* đặt `volleyWaitTime` **7s**.
     ⚠ **`volleyWaitTime` PHẢI DÀI HƠN `volleyInterval`.** Nó là VAN CHỐNG KẸT cho lúc chủ
     tướng TỬ TRẬN, không phải một độ trễ thường trực — để ngắn hơn là van nhả đạn trước khi
     cửa sổ loạt kịp mở, tuyến cung không bao giờ đồng loạt, và nhìn ra y hệt lúc chưa bật.
     ⚠⚠ **KHÔNG CÓ AI HÔ NHỊP THÌ KHÔNG PHẢI CHỜ AI** (`CommandNode.TeamUsesVolley`, gốc cây
     tự ghi tên vào sổ mỗi nhịp `UpdateVolley`). Thiếu vế này thì bật loạt ở học thuyết là mọi
     cung thủ của scene KHÔNG có chủ tướng (bàn thử, phần lớn zone AI Lab, mọi màn kịch bản
     lấy mode script làm tầng điều phối) lặng lẽ trả thêm `volleyWaitTime` giây cho phát ĐẦU
     TIÊN — không lỗi nào báo, chỉ là *"sao cung bắn chậm hơn trước"*.
   · **PHỐI HỢP TỔ** (`flankCommitTime/flankDepth`) — đứa GẦN NHẤT giữ mặt, đứa sau vòng ra
     SAU LƯNG mục tiêu (đánh sau lưng thì nó không đỡ được). Có CAM KẾT như pha lách xuyên.
   · **ĐIỀU PHỐI ĐỘ KHÓ** (`AIDifficultyDirector`) — đo cán cân quân số theo thời gian rồi
     tự `SetSmartsLevel` phe máy. CHỈ đổi cái đầu, không đụng máu/damage (ăn gian là lộ).
     ⚠ Đừng gắn vào scene TEST AI thuần — nó làm hỏng phép so sánh giữa hai bộ AI.
2e-lan. ⚠⚠⚠ **"AI TỤ TẬP Ở NGOÀI KHÔNG ĐÁNH VÀO LÀNG" = BẾ TẮC HÌNH HỌC Ở DÃY BẬC, KHÔNG
   PHẢI LỖI QUYẾT ĐỊNH** (2026-09-04, sau bốn lượt chẩn đoán sai).

   Đo `Demo_26_Raid` bằng `scan_lane.py` (đọc thẳng file `.unity`, không cần mở Unity) — cái
   gì ĐẶC nằm trong làn đi bộ, xếp theo x:

   | Vật | x | Cao | Trạng thái |
   |---|---|---|---|
   | tường làng | −5.00 … −1.26 | 2.0 | `passableForEveryone` — **đi xuyên được** |
   | **DÃY BẬC** | **−1.26 … 3.50** | **2.0 → 0.14** | `StickmanStairs` — xuyên là mặc định |
   | cổng làng | 5.95 … 7.45 | 1.9 | chốt chặn thật, phải PHÁ |

   Cầu thang nằm ở mặt TRONG (`stairsInside: true`), nên với quân đi từ phía tây thì thứ chắn
   mặt là **ĐẦU CAO** của nó — một khối đá 2 đơn vị — còn **CHÂN THANG lại ở x 3.50, tức BÊN
   KIA chính cái khối đang chắn**. Cả dãy dài **4.76 đơn vị** và nằm TRỌN trong làn.

   Ghép với `StickmanAgent.RequestStairsIfNeeded`: cung thủ làng trấn thủ TRÊN MẶT TƯỜNG, tức
   mục tiêu ở TẦNG KHÁC ⇒ quân cướp **ĐÒI LEO** ngay khi tới nơi. Mà `ShouldBeSolidFor` cũ cấp
   ĐẶC vô điều kiện cho `WantsStairs`, nên cả dãy bậc hoá tường đá **với đúng những người đang
   cần dùng nó**. Từ đó họ:
   · **không đập được** — bậc thang KHÔNG phải `Fortification`, `ProbeObstacle` chỉ nhận
     `StickmanController` nên nó không thấy gì để đánh;
   · **không leo được** — chân thang ở phía bên kia khối đang chắn;
   · **không đi tiếp được** — làn chỉ có một.
   ⇒ Xếp thành một hàng đứng im ở x ≈ −1.26, mà nhìn vào thì đó đúng là "chân tường thành".
   **Không lỗi nào báo**: mọi hàm đều trả lời đúng câu nó được hỏi.

   Chốt: **đòi leo thôi là chưa đủ, phải ĐANG ĐỨNG Ở CHÂN THANG** (`WantsStairs &&
   IsAtLowEntrance`). Ai còn đang đi tới chân thang thì cứ cho xuyên như mặc định — tới nơi là
   thang đặc lại đúng lúc cần. Ba vế "đang trên mặt thang / ở đầu cao / đang ở tầng trên" nằm
   phía trên lo trọn phần ĐI XUỐNG nên không mất vế nào.
   ⚠ **ĐỪNG chữa bằng cách cấm quân tấn công đòi leo**: trèo lên mặt tường giết cung thủ là một
   đường đánh HỢP LỆ (`AIStateEscalade` + thang công thành sinh ra chính vì thế). Thứ sai là
   "đòi leo" biến cả khối đá thành tường với người còn cách nó năm mét.

   ⚠⚠ **BÀI HỌC CHẨN ĐOÁN, đắt hơn bản vá.** Bốn lượt trước tôi đi tìm ở tầng QUYẾT ĐỊNH (bảng
   điểm mục tiêu · học thuyết · thế trận · chia cánh) vì triệu chứng đọc ra là "AI không chịu
   tấn công". Thứ mở được nút thắt là một PHÉP ĐO HÌNH HỌC mất ba phút: *"đi từ chỗ quân cướp
   tới cái làng thì gặp những khối đặc nào, và khối nào mở được?"*. **Gặp "AI đứng im" thì đo
   LÀN ĐI TRƯỚC, đừng đọc code AI trước** — AI đứng im vì không đi được thì đọc bao nhiêu bảng
   điểm cũng không thấy gì.

   ⚠⚠ **VÀ CHỐT `WantsStairs` MỘT MÌNH LÀ CHƯA ĐỦ — PHẢI LÀ MỘT BẤT BIẾN.** Dãy bậc có tới
   BỐN điều kiện lật nó sang ĐẶC (`IsOnSurface` · `IsAtHighEntrance` · `IsOnUpperDeck` ·
   `WantsStairs`); vá đúng một đường thì điều kiện thứ năm sẽ đem cái kẹt quay lại. Nay có một
   câu HÌNH HỌC không cãi được, đặt ngay trước mọi luật "đòi leo":

   > **Ở TẦNG DƯỚI thì cầu thang chỉ ĐẶC ở đúng CỬA VÀO** (`feet.y <= LowY + StepHeight × 1.5`
   > mà không `IsAtLowEntrance` ⇒ luôn cho XUYÊN).

   Đứng ở mặt đất mà không ở chân thang thì bậc trước mặt cao hơn tầm bước rất nhiều (ở đây
   2.0 so với `_stepHeight` 0.18 — gấp **11 lần**): từ chỗ đó cái thang không phải cầu thang,
   nó là một cái VÁCH. Đặc lên thì không ai leo được thêm một bậc nào, chỉ có thêm một chỗ để
   kẹt.
   ⚠ **ÉP XUYÊN KHÔNG BAO GIỜ ĐẺ RA BẾ TẮC** (xấu nhất là "đi qua chỗ đáng lẽ leo", rồi tới
   chân thang `IsAtLowEntrance` bật lại ngay); **ép ĐẶC thì có**. Thêm luật mới cho cầu thang
   thì luật đó chỉ được phép ép XUYÊN, đừng ép ĐẶC.
   ⚠ Ba luật đi-xuống phía trên không bị đụng: cả ba đòi bàn chân ĐÃ Ở TRÊN. Đã mô phỏng 7
   tình huống (tới vách · giữa nhịp bậc · ở chân thang đòi leo · đang leo · miệng thang trên
   mặt tường · đi dọc mặt tường · xuống tới bậc chót) — cả 7 ra đúng.

   ⚠⚠⚠ **VÀ CÒN MỘT CÁI NỮA Ở HỆ "CẦU THANG GIẢ": HỎI ĐỘ CAO CỦA *MẶT DỐC* THAY VÌ CỦA
   *BÀN CHÂN*** (`StickmanStairs.CanStartRide`, 2026-09-04 — *"nó luôn bắt đi lên"* +
   *"khựng khựng khi đi qua"*).

   Từ khi cầu thang chuyển sang MẶT DỐC GIẢ (`UpdateStairRide` — snap bàn chân vào
   `SurfaceYAt` thay vì nhấc từng bậc), cửa vào ride viết:
   `if (surface > LowY + 0.25f) return true;` — tức *"chỗ này của cái DỐC nằm trên cao thì
   cõng luôn, khỏi hỏi ai"*. Nghe như đang nói về người ĐANG ĐI XUỐNG, nhưng nó nói về **CÁI
   DỐC**, không nói về **NGƯỜI**.

   Đo trên `Demo_26_Raid` (dốc chạy từ (3.50, −2.00) lên (−1.26, 0.00)): người đi bộ ở mặt
   đất bị tóm lên trong dải **x 2.80 … 2.90** — chỗ mà mặt dốc vừa vượt mốc 0.25 mà vẫn còn
   nằm trong cửa sổ 0.30 phía trên bàn chân. Đi ngang qua đó là **bị cõng thẳng lên mặt
   tường**, và cú snap vào/ra mặt dốc chính là cái *"khựng khựng"*. Dải chỉ rộng 0.10 đơn vị
   nên nó không xảy ra mọi lần — đúng kiểu lỗi "lúc bị lúc không" khó tả nhất.

   Chốt: hỏi `feet.y > LowY + 0.25f`. Ở TRÊN CAO (vừa bước từ mặt tường vào miệng dốc, hoặc
   đang đi xuống dở) thì cõng luôn — hỏi ý định giữa dốc là thả người ta rơi. Còn ở MẶT ĐẤT
   thì phải ĐÒI, đúng luật gốc **"ĐI XUYÊN LÀ MẶC ĐỊNH, LEO LÊN PHẢI ĐÒI"**.
   ⚠ Mô phỏng lại toàn dải x sau khi sửa: KHÔNG còn x nào tóm được người đi bộ; người đòi leo
   ở chân thang vẫn được cõng, người trên mặt tường đi xuống vẫn được cõng.
   ⚠ **Cái tay vịn chéo trong art KHÔNG có collider** — hình thang là một tấm sprite
   (`StairArtWalkRatio`), collider chỉ có ở các khối bậc. Đừng đi tìm collider ở đó.

   ⚠ `MapBuildRules` luật 2b (`CheckBlockingTerrain`) bắt được đúng loại này, nhưng nó chỉ chạy
   cho MAP SINH. Scene dựng tay thì phải tự chạy `scan_lane.py`.

2e-quet. ⚠⚠⚠ **QUÉT TOÀN BỘ HỆ AI (2026-09-04) — BA CƠ CHẾ ĐÃ KHAI MÀ CHƯA CHẠY LẦN NÀO.**

Người dùng hỏi *"sao cứ sai lắc nhắc vậy"*. Câu trả lời đo được: sửa từng triệu chứng thì
không bao giờ hết, vì lỗi nằm ở một LOẠI — **thứ khai ra rồi không ai bật**. Phép quét (viết
lại được, xem cuối mục) so ba thứ với nhau:
· mọi field serialized của `AIProfile` (211) và `CommandDoctrine` (55);
· mọi chỗ ĐỌC field đó trong `Assets/Scripts` + `Assets/Editor`;
· GIÁ TRỊ THẬT trong 34 asset `AIProfile` + 10 asset `CommandDoctrine`.

Ba loại kết quả, và loại thứ hai mới là loại giết người:

| Loại | Nghĩa | Tìm ra |
|---|---|---|
| khai mà KHÔNG AI ĐỌC | code chết, vô hại | `shieldWallSpacing` · `rangedWeight` · `shieldWeight` · `woundedWeight` |
| **có đọc nhưng MỌI ASSET đều 0** | **tính năng chết lặng** | `flankCommitTime` · `rescueRadius` |
| hai hệ cùng ghi một ô | ghi đè câm | `AIPlaybook.doctrine` (xem dưới) |

**1. VÒNG RA SAU LƯNG CHƯA TỪNG XẢY RA** (`flankCommitTime = 0` ở **cả 34** asset).
`TryFlank` thoát ngay dòng đầu, nên *"đứa gần nhất giữ mặt, đứa sau vòng ra sau lưng"* là một
đoạn tài liệu chứ không phải một hành vi — mọi trận là hai hàng người húc thẳng vào nhau, và
đó chính là thứ làm nó không giống một trận đánh.
⚠ Chữa bằng **SÀN** `AIProfile.FlankCommitFloor` (2.4 s), KHÔNG bằng hệ số nhân như
`SpeedTuning`/`ImpactTuning`/`SteadyAimTuning`: mấy cái đó cứu được vì giá trị bake khác 0, còn
ở đây `0 × bất cứ gì` vẫn là 0. Asset vẫn NÂNG lên được, chỉ không hạ dưới sàn.
⚠ An toàn vì `TryFlank` đã tự chốt chặt: chỉ mở pha vòng khi CÒN XA (`distance >= MaxRange ×
1.2`), khi mình KHÔNG phải đứa giữ mặt (`SurroundRankOf > 0`), và không áp cho kẻ xông liều /
tử chiến. Tới nơi là thôi vòng, nên 2.4 s là TRẦN chứ không phải thời lượng cố định.

**2. MƯA TÊN KHÔNG CÓ Ở MÀN CƯỚP LÀNG** (`volleyInterval = 0` ở `Doctrine_Raid` và
`Doctrine_VillageHold`). `EnsureRaidDoctrine`/`EnsureVillageDoctrine` **không đi qua**
`StickmanDemoBuilder.EnsureDoctrine`, nên hai bộ này bỏ sót đúng hai con số mà bộ chung đã đặt
từ lâu (4.5 / 1.4). Profile cung (`AIProfile_RinhRap`) thì đã có `volleyWaitTime = 7` đúng luật
*"van chống kẹt phải DÀI HƠN nhịp loạt"* — tức nửa kia của cơ chế vẫn nằm chờ suốt.
⚠ Bài học: **viết một hàm `Ensure*` RIÊNG là tự nhận trách nhiệm khai ĐỦ mọi trường**. Copy bố
cục của bộ chung rồi quên vài dòng thì không có gì báo.

**3. PLAYBOOK GHI ĐÈ HỌC THUYẾT CỦA BUILDER SCENE** — lỗi nặng nhất của đợt quét.
`AIPlaybook.Apply` gọi `TeamCommander.SetDoctrine` cho MỌI tướng của phe, tức bộ AI DÙNG CHUNG
đè lên học thuyết mà builder vừa đặt riêng cho màn. Đo được ở `Demo_26_Raid`: builder đặt
`Doctrine_VillageHold` (tắt quân dự bị, tắt chia cánh về cứu nhà, `defenseDepth` tính đúng bằng
`hallX − gateX`) rồi `Playbook_Defense` đè lại bằng `Doctrine_Defensive` — bộ có `keepReserve` +
`homeDefenseRadius 12` + `attackRatio 1.5`, tức **phần lớn dân binh đứng ở dãy nhà tới hết
trận**. Nghĩa là cả §4b-vekhi (viết ra chính để chữa việc đó) chưa từng có hiệu lực.
Nay playbook là MẶC ĐỊNH: `SetDefaultDoctrine` nhường khi builder đã chọn.
⚠⚠ **ĐO BẰNG "BUILDER CÓ TRUYỀN DOCTRINE KHÔNG", ĐỪNG ĐO BẰNG `_doctrine != null`.**
`CreateCommander` lùi về `_balancedDoctrine` khi không ai truyền gì ⇒ `_doctrine` KHÔNG BAO GIỜ
null ⇒ lấy nó làm mốc là khoá playbook của CẢ DỰ ÁN, chữa một scene bằng cách làm hỏng hai chục
scene khác. Cờ `_doctrineFromScene` được đặt ở `CreateCommanderShared` — chỗ DUY NHẤT còn nhìn
thấy ý định của người gọi. Hiện có 6 chỗ truyền: 2 ở `Demo_26_Raid`, 4 ở AI Lab.

**CÒN MỘT CƠ CHẾ CHƯA BẬT, CỐ Ý ĐỂ LẠI: GỤC NGÃ & CỨU VIỆN.**
`rescueRadius = 0` ở cả 34 profile, và `StickmanDowned` chỉ được gắn ở ĐÚNG MỘT bài AI Lab —
nên ngoài bài đó, không ai gục và không ai được đỡ dậy. Bật nó cần BA thứ (component trên
lính · `rescueRadius > 0` · `AIModuleKind.Rescue` trong `modules` của playbook) và nó **đổi
luật thắng**: mỗi mạng phải giết tới hai ba lần, trong khi màn cướp làng chạy đồng hồ 150 s và
quân cướp phải đốt được 3 nóc nhà. Đó là một quyết định CÂN BẰNG, không phải một bản vá — đừng
bật lén.

⚠ **CHẠY LẠI PHÉP QUÉT** khi thêm field mới vào `AIProfile`/`CommandDoctrine`: đọc field từ
file `.cs`, đếm chỗ đọc trong hai thư mục script, rồi đọc giá trị thật từ YAML của asset. Ba
câu hỏi, ba dòng kết quả — và nó bắt được đúng cái loại lỗi mà đọc code không bao giờ thấy.

2f. **HIỆU NĂNG — LƯỚI KHÔNG GIAN** (`TeamMember.QueryNear`): chia trục X thành ô rộng 3,
   `TeamMember` tự đổi ô trong LateUpdate (1 phép chia). `ApplySeparation` (chạy MỖI FRAME
   cho MỖI agent) và `TeamMember.FindNearestEnemy` đã chuyển sang lưới — đây là hai chỗ
   O(n²) nặng nhất. **Thêm vòng quét mới thì dùng `QueryNear`, đừng duyệt `TeamMember.All`**
   trừ khi thật sự cần cả sân (đếm quân, thống kê).
3. **Số tuning nằm trong asset `AIProfile`** (Create > Stickman > AI Profile) — không hardcode.
   Phe = `TeamMember._teamId`; hành vi = `StickmanAgent._behavior` + `_objective`.
   **Bộ TÍNH CÁCH preset** ở `Assets/Settings/AIProfiles/` (tool `AI > 6`): Nhát gan · Cuồng
   chiến · Cẩn trọng · Sát thủ (vision cone) · Săn tướng · Rình rập (bắn tỉa) · Hộ vệ (taunt) ·
   **Thầy thuốc** (heal + chúc phúc).
   10 archetype đã được gắn sẵn tính cách tương ứng (Build All Archetypes). Học thuyết chỉ huy
   thêm `Doctrine_Defensive` (thủ chờ) + `Doctrine_Guerrilla` (đánh-rút).
   ⚙ **MỌI BẢNG SỐ AI TỰ CHẠY** trong `StickmanSceneUtils.EnsureAllAssets` (bước 4b: bảng cấp
   thông minh + bảng kinh nghiệm + tính cách/học thuyết) — bấm `Create Demo Scenes (All)` hoặc
   bất kỳ tool dựng scene nào là đủ bộ, không cần bấm lẻ `AI > 5/6/7`.
3b-cap0. ⚠⚠⚠ **CẢ THANG CẤP AI ĐÃ NÂNG (2026-09-04, user: *"cấp 0 quá ngu, tôi quá mạnh"*).**

   **Cấp 0 nay là "VỤNG", không phải "TÊ LIỆT".** Bản cũ tắt sạch `canBlock` · `canDodge` ·
   `canRetreat` · **`canTraverse`** · `teamwork` · `smartPickup`, kèm `reactionDelay` **0.75 s**
   và `thinkScale` **0.45** (hơn BA GIÂY mới cân nhắc lại mục tiêu một lần). Đó không phải một
   đối thủ dở, đó là một hình nộm — và `canTraverse = false` còn khoá luôn cầu thang, nên ở màn
   có tường thành thì cả phe đứng dưới chân tường tới hết trận.
   Nay cấp 0 vẫn là bậc THẤP NHẤT nhưng **CHƠI ĐƯỢC**: đi lại đủ đường, biết lùi, biết đỡ
   (vụng), biết né (vụng). Thứ nó chưa có là mấy **KỸ NĂNG HỌC ĐƯỢC**: đánh combo, chọn mục
   tiêu khôn, đổi vũ khí theo tình huống, bù độ rơi khi bắn xa.

   Thang mới (cấp 1 vẫn là **CẤP NEO** — mọi hệ số = 1, tức đúng bộ số của `AIProfile`):

   | Cấp | tầm nhìn | phản xạ | nhịp nghĩ | trễ nhận ra | khựng | đỡ | combo | né |
   |---|---|---|---|---|---|---|---|---|
   | 0 Tân binh | 0.95 | 0.90 | 0.85 | 0.35 | 1.30 | 0.70 | — | 0.60 |
   | 1 Chính quy | 1.00 | 1.00 | 1.00 | 0.22 | 1.00 | 1.00 | 1.00 | 1.00 |
   | 2 Thiện chiến | 1.15 | 1.60 | 1.40 | 0.16 | 0.50 | 1.50 | 1.40 | 1.35 |
   | 3 Lão luyện | 1.35 | 2.30 | 1.80 | 0.10 | 0.25 | 2.00 | 1.80 | 1.70 |
   | 4 Cao thủ | 1.55 | 3.00 | 2.30 | 0.06 | 0.14 | 2.50 | 2.20 | 2.10 |
   | 5 Huyền thoại | 1.80 | 3.60 | 2.80 | 0.03 | 0.08 | 3.00 | 2.60 | 2.50 |

   ⚠ **`AISmartsTable.asset` LÀ BẢN BAKE** — sửa `DefaultLevels()` xong PHẢI chạy lại tool ghi
   asset, không thì Unity nạp giá trị đã lưu và **không có gì đổi cả**. `AISmartsTable.cs` đã
   nằm trong `extraSources` của job AI Lab nên Bảng điều khiển tự báo vàng.
   ⚠ **Bậc khó không dùng cấp 0** (`GameDifficulty` chạy 1→5): cấp 0 là một bài thử hợp lệ,
   chọn tay bằng nút «CẤP AI» (F3), chỉ không phải thứ để phát cho người chơi mới.
   ⚠ Bài học giữ lại: **một cấp khai `can* = false` không phải "yếu hơn", nó là "mất hẳn một
   khả năng"** — và nếu khả năng đó là cách DUY NHẤT đi tới mục tiêu của màn thì cấp ấy không
   chơi được. Thêm cờ `can*` mới thì phải soát xem bậc nào đang phát cấp có cờ đó.


3b-docdon. ⚠⚠⚠ **ĐỌC ĐÒN — cấp N phải thắng 2 lính cấp N−1 (cùng vũ khí · cùng nón giáp), và
   *"AI không biết đỡ đòn, không biết nhấp nhá dụ địch đánh để mình đánh"*** (user chốt 2026-09-05).

   Bốn kỹ năng mới, đều là CÁI ĐẦU (không đụng máu/damage/vũ khí), đều đọc **PHA CÚ ĐÁNH** của
   địch — `StickmanProceduralAnimator.Phase` (`Windup → Strike → Recover`, kèm `SwingId` ·
   `ThreatTimeLeft` · `RecoverTimeLeft`). `IsAttacking` gộp cả ba pha làm một nên trước đây AI
   không có cách nào phân biệt *"nó vừa GIƠ"* với *"nó vừa HỤT"* — mà đó là hai câu trả lời
   ngược nhau (giơ thế thủ / lao vào đánh).

   | Kỹ năng | Ở đâu | Số (`AIProfile`, field MỚI ⇒ 38 asset nhận mặc định) |
   |---|---|---|
   | **PHẢN CÔNG lúc địch HỞ** | `CombatStrategyBase.UpdatePunish` — địch vào pha THU TAY mà mình trong `EngageRange` ⇒ cửa sổ = quãng thu tay + 0.3 s: bỏ do dự, bỏ nhử, bỏ lùi, dồn vào đánh (đi chung đường `opening` với phản đòn sau khi đỡ) | `punishChance` 0.5 |
   | **NHỬ BƯỚC** (nhấp nhá) | `UpdateBait` — đứng ngoài tầm nó, BƯỚC VÀO mép tầm (0.22 s) cho nó vung, LÙI RA (0.32 s) cho nó hụt; nó thu tay thì `UpdatePunish` mở cửa. Chỉ nhử kẻ RẢNH TAY + vũ khí ĐÃ HỒI + KHÔNG giơ thế thủ; nó cắn câu sớm thì lùi ngay | `baitChance` 0.25 · `baitCooldown` 3 |
   | **CẮT VUNG ĐỂ ĐỠ** | `UpdateBlock` — **`MeleeWeapon.TryBlock` TỪ CHỐI khi `Animator.IsAttacking`, kể cả pha thu tay**, nên bản cũ `SetGuard(true)` giữa lúc đang vung rồi tin là đã đỡ: cờ bật, cooldown chạy, nhát vẫn trúng — và nặng nhất ở CẤP CAO vì cấp cao đánh dày nhất. Nay `Interrupt()` cú vung của mình rồi mới giơ: ở WINDUP mất nhát đó (giá thật), ở THU TAY xác suất gấp đôi (không mất gì), ở STRIKE không cắt | `guardCancelChance` 0.35 |
   | **NÉ KẸP + mắt sau lưng** | `TryEscapeSandwich` — hai địch cận chiến hai bên ⇒ LÁCH QUA đứa không chém được mình lúc này (thu tay · choáng · chưa hồi) cho cả hai về MỘT phía; `FindSwingingThreat` — đỡ/né cả kẻ KHÔNG PHẢI mục tiêu đang vung, và QUAY MẶT về nó suốt lúc giữ thế thủ (thế thủ chỉ che hướng nhìn) | `sandwichAwareness` 1 |

   Kèm ba chốt ở hệ đỡ — thiếu chúng thì *"AI không biết đỡ"* còn nguyên:
   · `IsMeleeThreatSwinging` CHỈ nhận WINDUP + STRIKE (`IsCommitted`). `IsAttacking` còn đúng
     suốt pha thu tay (~45% cú đánh) ⇒ bản cũ giơ thế thủ cả lúc nhát ĐÃ QUA: đốt `blockCooldown`
     cho một cú đỡ không đỡ gì, và nhát THẬT kế tiếp tới đúng lúc thế thủ chưa hồi.
   · `blockReactionTime` (0.08 ÷ `reactionScale`): đồng hồ từ lúc THẤY nó giơ, mỗi cú vung một
     mốc (`SwingId`) — windup kiếm chỉ 0.12 s nên trục này mảnh, đừng kỳ vọng nó gánh cả thang.
   · GIỮ ĐÚNG TỚI LÚC CÚ VUNG QUA rồi hạ (kẹp trong `blockDuration`); nó chém hụt thì hạ sớm ⇒
     phản công ngay. Kẻ `punishChance = 0` vẫn giữ hết giờ như cũ.
   ⚠ Lộ ra khi soi, đã sửa kèm: `MeleeCombatStrategy.UpdatePosition` override trọn hàm gốc mà
   KHÔNG chép đoạn đi tiếp pha LÁCH ⇒ cận chiến lách được ĐÚNG MỘT FRAME — cái *"đứng khựng
   giữa người địch"* mà `SlipCommitTime` sinh ra để chữa, nhãn «lách» vẫn hiện nên không ai
   thấy lạ. Nay cả hai override gọi `ContinueSlip`.

   **THANG** (`AISmartsTable.Level`: `canPunish` · `punishChanceScale` · `canBait` ·
   `baitChanceScale` · `canCancelIntoGuard` · `guardCancelFloor` · `spatialAwareness`):
   cấp 0 TẮT cả bốn (đó chính là bốn thứ cấp 1 hơn nó) · cấp 1 = NEO (×1) · cấp 2..5 nhân
   1.4/1.7/1.9/2.0 (phản công) · 1.4/1.8/2.2/2.6 (nhử) · sàn cắt vung 0.45/0.6/0.75/0.9.
   ⚠ `guardCancelFloor` là SÀN (`Max`), KHÔNG phải hệ số — `0 × gì` vẫn là 0 (bài `flankCommitTime`).
   ⚠ **`AISmartsTable.asset` là BẢN BAKE** — mục *Asset gốc* trên ★ Bảng điều khiển đã VÀNG
   (`AISmartsTable.cs` nằm trong `extraSources`, đã kiểm mtime). Chưa bấm thì bảng cũ nạp
   `Level` thiếu field ⇒ mọi cấp nhận `canPunish = true` không nhân, tức cấp 0 cũng biết phản công.
   ⚠ **MẶC ĐỊNH CỐ Ý BẬT** (khác luật *"field mới phải trung tính"*): người dùng muốn CẢ SÂN
   khôn hơn chứ không phải một profile, và scene không ép cấp (−1) cũng phải được hưởng. Muốn
   một loại quái "không biết đọc đòn" thì để 0 trên profile của nó.

   **BENCH — AI Lab bài 29 «Thang cấp AI»** (`DuelLabHud.EditorSetupLadder`): trái 1 × cấp N,
   phải 2 × cấp N−1, cùng kiếm cấp 2 · cùng nón · cùng 8 máu; ◀ ▶ đổi bậc; «[x] tự đánh tiếp» +
   tỉ số VÁN (hoà theo giờ 90 s để bench không treo khi hai bên nhử nhau mãi). Đây là THƯỚC ĐO;
   luật *"cấp N thắng 2 cấp N−1"* là MỤC TIÊU, **chưa phải số đã đo** — AI không chạy được
   Unity nên chưa có ván nào được đếm. Bậc nào trái thua nhiều thì chỉnh `DefaultLevels()` rồi
   chạy lại tool bảng cấp, đừng vá từng profile.
   ⚠ Thang ĐÔI (mỗi bậc gấp đôi bậc dưới ⇒ cấp 5 = 16 lính cấp 1) là đòi hỏi RẤT cao với cùng
   máu cùng vũ khí: một nhát trúng như nhau ở mọi cấp, nên lợi thế chỉ tới từ số nhát TRÚNG/HỤT.
   Bench mới trả lời được có tới không — đừng hứa trước.
   ⚠ Soi bằng nhãn «đang:» của bảng đấu / F9: `nhử-vào` · `nhử-ra` · `PHẢN-CÔNG` · `né-kẹp`.
   Không có nhãn thì "nhử bước" và "đứng ngơ rồi lùi" nhìn y hệt nhau.

3b-neten. ⚠⚠⚠ **NÉ TÊN: GAME NHÌN NGANG THÌ NÉ NGANG LÀ CHẠY DỌC THEO ĐƯỜNG ĐẠN**
   (user báo 2026-09-05: *"AI không biết cầm khiên lên đỡ, hay giơ vũ khí ra đỡ, hay biết núp
   biết né, ngoài ra AI cũng không biết nhảy để né cung, hoặc ngồi xuống"*).

   Bốn chỗ hỏng, **cả bốn đều câm lặng** — mọi hàm đang trả lời đúng câu nó được hỏi:

   | # | Sai ở đâu | Đo được |
   |---|---|---|
   | 1 | **Né đạn đi SAI TRỤC.** `UpdateDodge` chỉ bước SANG BÊN theo trục X, ra xa kẻ bắn — mà mũi tên cũng bay theo đúng trục đó và nhanh gấp nhiều lần người | bước ra xa chỉ làm nó tới **muộn hơn một nhịp**, không làm nó trượt. Trong game nhìn ngang, hai trục né THẬT chỉ có LÊN và XUỐNG |
   | 2 | **Bộ dò "đạn sắp trúng mình" đo từ GỐC TRANSFORM** (ngang bàn chân) rồi so với `dodgeMissMargin` 0.45 | cửa sổ phủ **−0.74 → +0.49 thân**: quá nửa tầm quét nằm DƯỚI MẶT ĐẤT, còn NGỰC · VAI · ĐẦU (0.49→1.0) **không bao giờ được tính là mối đe doạ**. Né đạn · tường khiên · nấp đều đọc chung hàm này nên cả ba cùng mù |
   | 3 | **KHÔNG AI GIƠ KHIÊN VÌ TÊN.** `MeleeWeapon.TryBlock`/`ShieldWeapon.TryBlock` CHẶN ĐƯỢC đạn từ phía trước — nhưng hệ đỡ của AI chỉ hỏi đúng một câu *"địch có đang VUNG CẬN CHIẾN không"* (`IsMeleeThreatSwinging`) | dưới mưa tên, **không một ai giơ khiên lên**. Cơ chế đỡ đạn có sẵn mà chưa bao giờ chạy — đúng họ *"code có sẵn mà không ai gọi"* |
   | 4 | **NGỒI XUỐNG RỒI TỰ NHỔM LÊN.** Vào tư thế ngồi luôn chạy clip `crouchDown` (hạ rig **−0.55**); hết clip thì `Play(Crouch, null)` BỐC NGẪU NHIÊN style lặp: `squat` (−0.55) hoặc `low` (**−0.11**) | một nửa số lần ngồi, thân **bật lên 0.11 world = 15% chiều cao người** ngay sau khi vừa hạ xuống — và với AI thì nó nhổm đúng vào đường mũi tên vừa cúi tránh |

   **BA LỐI NÉ, CHỌN THEO ĐỘ CAO ĐẠN SẼ BAY QUA** (`StickmanAgent.UpdateDodge`, mốc tính theo
   PHẦN CHIỀU CAO THÂN — 0 = bàn chân, 1.0 = đỉnh đầu):

   | Đạn bay qua ở | Làm gì | Vì sao (đo được) |
   |---|---|---|
   | **≤ 0.45 thân** | **NHẢY** (`Jump` style `tuck`) | `_jumpSpeed` 4.5 nâng bàn chân qua mốc 0.45 thân trong **80 ms**; cung thủ ngắm `aimHeightOffset` 0.3 = **rel 0.29** nên ĐA SỐ mũi tên rơi vào đây |
   | **≥ 0.82 thân** | **NGỒI THỤP** | clip ngồi hạ rig 0.55 × 0.25 = **0.1375 world ≈ 19% thân** ⇒ đỉnh đầu tụt về 0.81 thân, tên cao hơn thế bay qua |
   | 0.45..0.82 (ngang ngực) | **GIƠ KHIÊN / VŨ KHÍ ĐỠ** | không trục nào né được — đây là việc của tay, không phải của chân |

   `StickmanAgent.UpdateProjectileGuard` (`AIProfile.projectileGuardChance` 0.55): **QUAY MẶT
   VỀ PHÍA MŨI TÊN rồi giơ thế thủ**. ⚠ Vế quay mặt là BẮT BUỘC — cả hai `TryBlock` đều đo
   `IsAttackFromFront`, giơ khiên mà quay lưng thì đòn vẫn lọt, tức bỏ một nhịp đánh để đổi lấy
   con số không. Nó cũng là phần NHÌN THẤY của cơ chế: nhân vật xoay người, đưa khiên ra chắn.

   ⚠⚠ **HAI CHỦ CÙNG GHI THẾ THỦ THÌ PHẢI TÁCH HAI PHA.** `CombatStrategyBase.UpdateBlock`
   (đỡ cận chiến) và phản xạ đỡ tên cùng gọi `SetGuard`. Chốt: strategy `return true` khi
   `agent.IsGuardingIncoming` (giữ nguyên, không đánh nhịp đó), còn agent thì **HẠ thế thủ ở
   ĐẦU frame (trước state) và GIƠ ở CUỐI frame (sau state)**. Gộp làm một là đúng cái frame cửa
   sổ đóng lại, strategy vừa kịp giơ cho một cú vung THẬT rồi bị hạ ngay — cướp mất cú đỡ của
   nó, không lỗi nào báo.

   ⚠ `duckDuration` (0.45 s) là cú thụp NÉ, khác `coverChance` (nấp lâu) — hai hệ cùng gọi
   `SetCrouch` nên mỗi hệ tự dọn phần của mình (`UpdateTakeCover` nhường khi `IsDucking`).
   ⚠ Không nhảy/thụp khi đang TRÈO · đang BAY · CƯỠI NGỰA · VÁC THANG (`CanEvadeVertically`).
   ⚠ Hai field mới trên `AIProfile` ⇒ 38 asset đã bake nhận giá trị khởi tạo, **không phải dựng
   lại profile nào**; `AISmartsTable.Apply` cho `projectileGuardChance` đi CHUNG trục với đỡ
   cận chiến (`canBlock` / `blockChanceScale`) — cùng một cái tay, cùng một cây vũ khí.
   ⚠ **PHẢI BẤM LẠI**: *Build Action Sets* (đã VÀNG — sửa độ sâu clip ngồi) và *Demo_8 — AI Lab*
   (bài 12 đổi thành «Né tên: NHẢY · THỤP · ĐỠ», ba cung thủ ba cự ly để có đủ loại đường đạn).
   Soi bằng «Soi state» / F9: nhãn `ĐỠ-TÊN` · `thụp`.

3b-thang. ⚠⚠ **THANG CẤP AI LÀ 0–5, SÁU BẬC, CHỈ SỐ = CHÍNH BẬC ĐÓ** (user chốt 2026-09-03).
   `Cấp 0 Tân binh · 1 Chính quy · 2 Thiện chiến · 3 Lão luyện · 4 Cao thủ · 5 Huyền thoại`.
   Cùng khuôn `GearTiers` (§7b-thang05), nên hai hệ cấp của dự án đọc chung một cách.

   ⚠⚠ **"KHÔNG ÉP CẤP" NAY LÀ `-1` (`AISmartsTable.Off`), KHÔNG PHẢI 0.** Đây là chỗ chết
   người của đợt đổi thang: bản cũ lấy 0 làm *"tắt hệ cấp"*, mà 0 giờ là bậc TÂN BINH thật —
   để nguyên là **mọi NPC không khai cấp lặng lẽ tụt xuống ngu nhất**, và không lỗi nào báo.
   · `StickmanAgent._smartsLevel` mặc định `AISmartsTable.Off`;
   · `StickmanNPC.prefab` đã đổi giá trị bake `0 → -1` (đo được: đó là chỗ DUY NHẤT trong cả
     dự án bake trường này, nên đổi thang rẻ hơn tưởng);
   · mọi phép so `level <= 0` phải thành `level < 0`, và `> 0` thành `>= 0`.
   ⚠ Số gõ cứng ở CALL SITE đều dịch xuống một bậc: playbook · `ExperienceTable` ·
   `GameDifficulty.enemySmarts` · `MapTypes` · `ArenaMode` · `AIDifficultyDirector` · AI Lab.
   Sửa bảng mà quên call site là mọi màn khôn hơn đúng một bậc so với ý đồ.

   ⚠⚠ **BỐN CHỖ CÒN SÓT, TÌM RA 2026-09-03** — đợt đổi thang sót đúng những chỗ làm cấp 0
   thành vô hình, nên bấm «Cấp 0 — Tân binh» là *không có gì xảy ra*:

   | Chỗ | Sai | Hậu quả |
   |---|---|---|
   | `UnitRankGear.LateUpdate` | `level <= 0` + `FirstGearedLevel = 2` | cả thang trang bị lệch một bậc (xem 3b-do) |
   | `TeamAILevelDirector.Reapply` | `level <= 0` | chọn cấp 0 xong quân MỚI không bao giờ nhận — ô chọn loãng dần |
   | `EnemyWaveSpawner._spawnedSmartsLevel` | khởi tạo `0` + so `> 0` | 0 vừa là "chưa khai" vừa là một bậc thật |
   | `StickmanAILabHud` (Soi state) | `> 0` | bài test cấp thấp nhất không hiện `[IQ 0]` |

   ⚠ Cách tự bắt cho lần sau: `grep -n "SmartsLevel\|smartsLevel" -r Assets/Scripts` rồi soi
   MỌI phép so với 0. Trường nào dùng 0 làm "chưa khai" thì phải đổi khởi tạo sang
   `AISmartsTable.Off`, không chỉ đổi phép so.

3b. **CẤP ĐỘ AI — NĂM BẬC, MỘT CÁI THANG DUY NHẤT** (`StickmanAgent._smartsLevel` + bảng
   `Assets/Resources/AISmartsTable.asset`): 0 = tắt · 1 tân binh · **2 chính quy = CẤP NEO
   (đúng profile gốc)** · 3 thiện chiến · 4 lão luyện · 5 cao thủ. Cấp là BỘ HỆ SỐ biến đổi
   AIProfile lúc chạy, CHỈ đổi cái đầu — KHÔNG đổi máu/damage.
   Số chuẩn nằm trong `AISmartsTable.DefaultLevels()` (code là nguồn sự thật, tool ghi lại asset).
   Đổi lúc chạy: `agent.SetSmartsLevel(n)` — áp lên profile GỐC, không cộng dồn cấp lên cấp.
   Bài test: `Demo_8_AILab` › "Cấp độ AI" (cấp 5 chấp 3 con cấp 1, cùng máu cùng vũ khí).

   **BA TRỤC CỦA "THÔNG MINH", ĐỪNG LẪN NHAU** — ba thứ này hỏng theo ba kiểu khác nhau:

   | Trục | Là gì | Ngu thì trông ra sao |
   |---|---|---|
   | `reactionScale` | PHẢN XẠ THÂN THỂ: quét địch dày hơn, thấy đạn sớm hơn, hồi thế thủ nhanh hơn | ăn đòn vì né/đỡ muộn |
   | `thinkScale` | TỐC ĐỘ SUY NGHĨ: chia nhịp CÂN NHẮC LẠI (`retargetInterval` · `weaponSwapInterval` · `spotShareInterval` · `cavalryRaidInterval` · `watchInterval`) | bám chết quyết định cũ — đuổi theo cái xác, cầm cung đi đánh giáp lá cà |
   | `reactionDelay` | **TRỄ NHẬN RA** (giây): địch phải nằm trong tầm nhìn LIÊN TỤC ngần đó thì cái đầu mới thấy nó | *đứng ngơ* rồi mới xông vào — trục dễ đọc nhất trên màn hình |

   ⚠ **`reactionDelay` là số TUYỆT ĐỐI, không phải hệ số** — nên cấp NEO (2) vẫn có 0.30s
   (đúng thời gian phản xạ thị giác của người thật). Luật *"cấp 2 = y hệt profile gốc"* nói về
   các HỆ SỐ biến đổi profile; đây là trục MỚI nằm ở agent. **Cấp 0 (tắt hệ cấp) mới là 0** —
   nhờ vậy 40+ scene cũ không đổi một chút nào.

   ⚠⚠ **TRỄ NHẬN RA CẮM Ở TẦNG QUAN SÁT, KHÔNG Ở TỪNG STATE** (`StickmanAgent.Notice`, cửa
   duy nhất của `FindNearestEnemyFrom` + `SelectBestEnemy`). Nhờ vậy chọn mục tiêu · rút lui ·
   sĩ khí · vây đánh · trấn thủ đều chậm theo cùng một nhịp mà KHÔNG state nào phải biết là có
   hệ này — đúng khuôn điểm cắm DUY NHẤT của hệ ẩn thân. Rải `if` vào từng state là chắc chắn
   sót một đường, mà sót thì không có lỗi nào báo.
   · ⚠ **Đo bằng "CÓ ĐỊCH trong tầm nhìn liên tục bao lâu", KHÔNG đo theo TỪNG địch** — đo
     theo từng đứa thì giữa đám đông hai địch thay nhau đứng gần nhất và đồng hồ reset mỗi
     nhịp: tân binh KHÔNG BAO GIỜ vào trận.
   · ⚠ **Thấy đứt quãng dưới 0.35s vẫn tính là liên tục** (`SightGapTolerance`): tầm nhìn nhấp
     nháy suốt (địch lách sau vật cản, đổi ô lưới, quạt nhìn quét qua).
   · ⚠ **Đã vào trận rồi thì hết trễ** (`AwarenessMemory` 4s). Bắt trả trễ cho từng lần đổi
     mục tiêu giữa lúc hỗn chiến là ra một anh lính khựng liên tục.
   · ⚠ **BỊ ĐÁNH và ĐỒNG ĐỘI HÔ thì nhận ra NGAY** (`NoticeThreatNow`, gọi từ `OnOwnerDamaged`
     + `ReceiveSpotReport`). Thiếu vế này thì tân binh có `Target` (aggro đặt thẳng) nhưng mọi
     hàm hỏi địch vẫn trả null — hai nguồn nói hai kiểu, và nó đứng chịu đòn tới lúc hết trễ.
   · Soi bằng **F9**: hậu tố **?** = đang ngơ ra. Thấy dấu đó kéo dài khắp sân là cấp AI quá
     thấp so với nhịp trận, KHÔNG phải AI hỏng.

3b-do. ⚠⚠ **CẤP ĐỘ AI KHÔNG LIÊN QUAN TỚI TRANG BỊ — BA TRỤC RIÊNG, ĐỪNG BUỘC VÀO NHAU.**
   (Luật do người dùng chốt 2026-09-01, sau khi thử buộc chúng lại với nhau và bỏ.)

   | Trục | Là gì | Ai quyết |
   |---|---|---|
   | **CẤP AI** | kỹ năng: phản xạ · nhịp nghĩ · đỡ/né/combo/phối hợp | `AISmartsTable` + `_smartsLevel` |
   | **CẤP VŨ KHÍ** | chất liệu + chỉ số cây đang cầm | `WeaponTierTable` + `WeaponTierSetter`; mốc `ExperienceTable.weaponTier`; `GameDifficulty.enemyWeaponTier` |
   | **MANG TRANG BỊ** | ai được đội nón / mặc giáp | `UnitRank` trên `UnitLoadout`, builder của màn phát lúc dựng scene |

   · **`AISmartsTable` CHỈ CHỨA SỐ CỦA CÁI ĐẦU** — không có `weaponTier`, không có `gearRank`.
     `Apply()` chỉ biến đổi `AIProfile`; nó không được biết `EquipmentDefinition` là gì.
   · **Vì sao phải tách:** cấp lính là một trục CÂN BẰNG thật (dân binh chạy 100% tốc độ ·
     tinh nhuệ đủ giáp còn 82% — `EquipmentDefinition.weight`). Buộc nó vào cấp AI thì mỗi lần
     đổi một con số trên HUD là **lặng lẽ đổi luôn cân bằng của cả màn**, và mất luôn câu duy
     nhất đáng hỏi: *"CÙNG bộ đồ đó, đánh khôn hơn thì hơn được bao nhiêu?"* — không so được
     nữa vì cả hai vế đều đổi cùng lúc.
   · Muốn "địch vừa khôn vừa xịn" thì khai HAI con số (VD `GameDifficulty`: `enemySmarts` +
     `enemyWeaponTier`), đừng suy cái nọ ra cái kia.
   ⚠ Đã xoá hẳn `AILevelApplier` (Units) và chỗ cắm `UnitOutfitService` (Core) — hai thứ sinh
   ra chỉ để buộc ba trục lại. Đừng dựng lại chúng.

   ⚠⚠ **SỬA LUẬT 2026-09-02 — CẤP AI LÀ THANG CẤP BẬC, ĐỌC BẰNG BỘ ĐỒ** (`UnitRankGear`,
   tầng Units). Người dùng chốt đè lên một phần mục này. Thang (đã sửa lại theo **thang 0–5**
   ngày 2026-09-03, xem 3b-thang):

   | Cấp AI | Trên người |
   |---|---|
   | **−1** (`AISmartsTable.Off`) | KHÔNG ÉP GÌ — giữ nguyên bộ đồ màn đã phát |
   | 0 tân binh | **KHÔNG nón, KHÔNG giáp** |
   | 1..5 | bộ đồ cấp tương ứng (`<nền>/Tier1..Tier5/`) |

   ⚠⚠⚠ **BẢN ĐẦU CỦA `UnitRankGear` CHẾT LẶNG HAI LẦN — CẢ HAI ĐÃ SỬA 2026-09-03.**
   Người dùng báo *"chọn cấp AI mà trang bị không đổi, và không biết AI có khôn hơn chưa"*.
   Rà ra ba lỗi chồng nhau, không lỗi nào báo gì:

   | # | Sai ở đâu | Vì sao câm |
   |---|---|---|
   | 1 | leo thang bằng `CivilizationDefinition.HelmetForRank` | `helmetVariants`/`armorVariants` **RỖNG ở cả 15 nền** (đo được: `Civ_*.asset` chỉ có một `helmet` + một `armor`) ⇒ `Clamp(step, 0, count-1)` luôn ra 0 ⇒ **cấp nào cũng chung một cái nón**. Art theo cấp nằm ở `EquipmentDefinition.tierSprites` (6 ô, ô 0 trống), KHÔNG ở variant |
   | 2 | `if (level <= 0) return;` + `FirstGearedLevel = 2` | thang cũ ("0 = tắt"). Từ ngày `Off = −1` thì **cả thang lệch một bậc**: cấp 0 không làm gì, cấp 1 bị cởi sạch đồ |
   | 3 | `Attach` chỉ gọi từ `UnitLoadout.ApplyTo` + `CivilizationTeamAssigner.Dress` | cả hai là đường RUNTIME phát đồ. Quân BAKE SẴN không đi qua đường nào — đo được **0/45 scene** có component này. Đường `LookOnly` (AI Lab, bàn thử) gọi `ApplyLookTo`, cũng không qua loadout ⇒ **AI Lab không có một `UnitRankGear` nào** |

   Chốt: đọc `tierSprites` qua **`StickmanEquipment.SetGearTier(cấp)`** (trục đã có sẵn và
   đã bake đủ 6 ô cho cả 15 nền), so `level < 0`, và gắn bù bằng
   **`UnitRankGearBootstrap`** lúc nạp scene (khuôn `AILevelPickerBootstrap`) + một dòng
   `Attach` trong `CivilizationTeamAssigner.Apply` — chỗ DUY NHẤT cả `FullRoster` lẫn
   `LookOnly` đi qua.

   ⚠ **"NÓN BAY KHỎI ĐẦU" KHI ĐỔI CẤP GIỮA TRẬN LÀ LỖI CŨ, ĐÃ HẾT — đừng lấy nó làm lý do
   cấm `SetGearTier` lần nữa.** Chú thích cũ cấm đường này vì thử một lần thấy nón lệch hẳn.
   Nguyên nhân thật không nằm ở `RefreshTierSprites`: lúc đó `tierScales`/`tierOffsets` còn
   là **mảng 5 ô** của thang cũ trong khi `GearTiers.IndexOf` tra bằng CHÍNH CẤP ĐÓ ⇒ mọi cấp
   lấy cỡ/chỗ đặt của cấp KẾ TIẾP. Cách tự kiểm: đếm phần tử `tierScales` trong
   `Equip_*_Helm.asset` — bằng **5** là asset còn thang cũ, **dựng lại 15 nền văn minh
   TRƯỚC**, đừng đi sửa code đặt nón.

   ⚠ **CHỦ CỦA `GearTier`:** cấp AI = −1 thì `UnitRankGear` KHÔNG ĐỤNG GÌ (40+ scene cũ giữ
   nguyên tuyệt đối, `WeaponTierSetter` vẫn là chủ); cấp AI ≥ 0 thì nó nói lời cuối về BỘ ĐỒ,
   còn VŨ KHÍ vẫn thuộc `WeaponTierSetter`. Nó **chụp `_baseTier`** trước lần đầu đụng vào và
   TRẢ LẠI khi cấp về −1 — không có vế trả lại thì nút *«Trả cả sân về theo scene»* nói một
   đằng (cái đầu về đúng) màn hình một nẻo (bộ đồ ở lại cấp vừa thử).

   ⚠⚠ **"CẤP 0 = ĐẦU TRẦN" PHẢI LÀ BẤT BIẾN, KHÔNG PHẢI MỘT THAO TÁC CHẠY-MỘT-LẦN.**
   `StickmanEquipment.Equip` nay CẤT thẳng vào `_stowedByTier` khi đang ở cấp 0 (slot nón/
   giáp). Thiếu chốt đó thì đổi NỀN VĂN MINH giữa trận (nút «NỀN» F4 → `WearEquipment`) làm
   lính cấp 0 mọc lại cái nón, mà sổ cất vẫn giữ món CŨ nên lên cấp lại đội nón của nền TRƯỚC.

   ⚠⚠ **CHẤT LIỆU KHÔNG CÒN LÀ MỘT TRỤC** (xem `GearTiers`: *"cấp là một MÓN ĐỒ KHÁC, không
   phải một lớp màu"*). Bản luật cũ ở đây viết *"cấp AI đổi KIỂU đồ, nâng cấp đổi CHẤT đồ"* —
   vế sau đã chết theo trục chất liệu, nên nay chỉ còn MỘT trục bộ đồ và cấp AI là chủ của nó
   khi được ép. Cấp VŨ KHÍ (`WeaponTierTable` · mốc `ExperienceTable.weaponTier`) vẫn riêng.

   ⚠⚠ **VIỆC NÀY ĐỔI CÂN BẰNG, VÀ ĐÓ LÀ CHỦ Ý.** Cởi nón/giáp của cấp 0 là bỏ THẬT điểm giáp
   + sức nặng, nên tân binh mỏng hơn và chạy nhanh hơn. Cái mất chính là phép so mà mục này
   viết ra để bảo vệ: *"CÙNG bộ đồ đó, đánh khôn hơn thì hơn được bao nhiêu?"* — từ nay cấp AI
   kéo theo cả trang bị nên hai vế đổi cùng lúc. Ai cần phép so cũ thì cho `_smartsLevel` BẰNG
   NHAU rồi chỉ đổi `AIProfile`.

   ⚠ **KHÔNG PHÁT ĐỒ CHO AI VỐN KHÔNG CÓ.** "Ai ĐƯỢC đội nón" vẫn là của `UnitRank` (`Levy`
   đầu trần · `Regular` có nón · `Elite` nón + giáp). `UnitRankGear` chỉ làm việc trên món
   nhân vật ĐÃ CÓ lúc vào trận, nên cung thủ `Levy` vẫn đầu trần ở mọi cấp. Phát thêm cho họ
   là cộng lén điểm giáp cho CẢ TUYẾN TẦM XA — vế đó của mục này còn nguyên hiệu lực.

   ⚠ **KHÔNG PHẢI NHỚ MÓN GỐC NỮA** — `SetGearTier(0)` tự CẤT định nghĩa vào `_stowedByTier`
   rồi mặc lại khi lên cấp, nên `UnitRankGear` không cần `_baseHelmet`/`_baseArmor` như bản
   cũ. (Vế "nhớ trước khi cởi" vẫn còn hiệu lực, chỉ là nó nằm trong `StickmanEquipment`.)

   ⚠ **TẦNG:** `UnitRankGear` nằm ở **Units**; cấp AI hỏi qua `IUnitBrain` ở Core, bộ đồ qua
   `StickmanEquipment` (Combat) — không tham chiếu ngược lên đâu cả. Gắn ở BA đường:
   `UnitLoadout.ApplyTo` · `CivilizationTeamAssigner.Apply` (cả FullRoster lẫn LookOnly) ·
   `UnitRankGearBootstrap` lúc nạp scene (quân bake sẵn — **đây là đường đã thiếu**).

   ⚠ **ART ĐÃ ĐỦ 5 CẤP** (`<nền>/Tier1..Tier5/Helm_*.png` + `Armor_*.png`, và 15/15 asset
   `Equip_*_Helm`/`_Armor` có đúng 6 ô `tierSprites`/`tierScales`/`tierOffsets`). Ghi chú cũ
   ở đây nói *"mỗi nền 3 kiểu nón, 1 kiểu giáp, thang đang cụt"* — đó là số đo của trục
   `helmetVariants` ĐÃ BỎ, đừng đọc nó rồi đi đặt thêm 60 tấm art.
   ⚠ Dân binh (`UnitRank.Levy`) đầu trần ở MỌI cấp — đúng thiết kế, nên ở AI Lab chỉ khoảng
   2/3 số lính đổi hình khi bấm. Đó KHÔNG phải lỗi.

3b-team. **Ô CHỌN CẤP ĐỘ AI CHO TỪNG PHE** (`TeamAILevels` + `TeamAILevelDirector` ở Gameplay,
   `AILevelPickerHud` + `AILevelPickerBootstrap` ở Demo — nút **«CẤP AI»** góc trên-phải, phím
   **F3**). Dùng được ở MỌI scene có bot: AI Lab · 7 chế độ chơi · sân map.
   Không sinh lại ai — áp thẳng `SetSmartsLevel` lên chính những người đang đứng trong sân,
   nên so được *"cùng đội quân đó, cấp 1 đánh với cấp 5 thì ra sao"*.
   ⚠ **ĐỔI CÁI ĐẦU và BỘ ĐỒ** (nón/giáp theo cấp — xem 3b-do); cấp VŨ KHÍ, máu, damage giữ
   nguyên.
   ⚠⚠ **BẢNG PHẢI HIỆN KẾT QUẢ, KHÔNG PHẢI HIỆN LỰA CHỌN** (thêm 2026-09-03). Bản cũ bấm
   xong chỉ in lại đúng con số vừa bấm, nên câu *"không biết AI có thông minh hơn chưa"* KHÔNG
   CÓ CHỖ NÀO TRẢ LỜI — mà giữa lựa chọn và kết quả có cả một dãy chỗ nuốt được lệnh (playbook
   áp lại · quân mới mang cấp prefab · dân thường bị loại). Nay mỗi phe có thêm một dòng:
   **`k/n lính đã đổi`** (đếm bằng `agent.SmartsLevel` THẬT) + **cấp đó đổi cái gì**
   (`AISmartsTable.SummaryFor` — sinh từ chính bảng số, không gõ tay: phản xạ · nhịp nghĩ ·
   tầm nhìn · biết/chưa biết đỡ-né-combo-phối hợp · bộ đồ cấp mấy).
   ⚠ Dòng đó phải SINH TỪ BẢNG. Gõ tay là nó lỗi thời ngay lần đầu ai chỉnh `DefaultLevels()`,
   và **một bảng mô tả nói dối còn tệ hơn không có bảng nào**.
   ⚠⚠ **MẶC ĐỊNH LÀ "theo scene" (−1), KHÔNG phải cấp 2.** Nhiều bài test cố ý gán cấp KHÁC
   NHAU cho từng NPC trong CÙNG một phe (`Demo_8_AILab` › "Cấp độ AI": một con cấp 5 chấp ba con
   cấp 1 cùng phe đỏ). Một cái van "áp cấp N cho cả phe" mà bật sẵn là **xoá sạch bài test đó
   mà không có lỗi nào báo** — nhìn vào chỉ thấy bốn con đánh như nhau.
   ⚠ **Phải có `TeamAILevelDirector` áp lại theo nhịp**, không áp một lần rồi thôi: gần như mọi
   màn đáng chơi đều có nguồn đẻ quân (hồi sinh · viện binh · doanh trại · nhân bản theo bậc
   khó). Quân sinh sau mang cấp gốc của prefab, nên chọn "phe đỏ cấp 5" xong đánh một lúc là cả
   sân đầy lính cấp mặc định — ô chọn lặng lẽ hết tác dụng. Cùng lý do `AIPlaybookBinder` có
   `reapplyInterval`.
   ⚠ Bậc khó của ván (`GameSession`) nay cũng đi qua sổ này (`TeamAILevels.Set(enemyTeam, …)`)
   thay vì tự lặp rồi gọi `SetSmartsLevel` — nhờ vậy quân sinh sau không loãng về cấp gốc của
   prefab. `GameDifficulty.enemySmarts` chạy 1→5 theo bậc, còn `enemyWeaponTier` vẫn là con số
   RIÊNG của bậc đó.
   ⚠ Scene ĐÃ BAKE không cần dựng lại: `AILevelPickerBootstrap` gắn bù lúc nạp scene (khuôn
   `CivilizationPickerBootstrap`). Gắn **CẢ HAI** component — thiếu director là đúng cái bẫy ở trên.

   ⚠⚠ **VÀ PLAYBOOK PHẢI NHƯỜNG QUYỀN CHO Ô CHỌN — nếu không thì nút này là ĐỒ TRANG TRÍ.**
   `AIPlaybookBinder._reapplyInterval` áp lại playbook theo nhịp (đúng: quân mới ra lò phải
   nhận đúng bộ AI), mà `AIPlaybook.ApplyToAgent` thấy `SmartsLevel` khác `playbook.smartsLevel`
   là kéo về. Ghép với `TeamAILevelDirector` áp lại mỗi 2s thì thành **ping-pong**: cứ vài giây
   cấp lại bị lật, và nhìn vào đúng là *"bấm nút không có tác dụng"* — không lỗi nào báo, cả hai
   bên đều đang làm đúng phần việc của mình (§5c).

   Chốt bằng sổ **`AILevelOverrides` ở CORE** — và nó PHẢI ở Core, không được ở Gameplay: kẻ ghi
   đè là `AIPlaybook` (tầng **AI**), mà AI không được tham chiếu ngược lên Gameplay nơi
   `TeamAILevels` sống. Đây đúng khuôn `ContestedZones`/`MovingPlatforms`: **tầng thấp chỉ HỎI
   MỘT CÂU** (*"phe này có đang bị ép cấp không"*), còn việc ÁP cấp lên từng nhân vật vẫn là của
   `TeamAILevels` — chỗ có `StickmanAgent` để mà gọi.
   ⚠ `TeamAILevels.Set` phải GHI XUỐNG cả sổ Core; dọn thì dọn CẢ HAI (`ClearAll`), không thì
   phe đó được miễn trừ playbook vĩnh viễn.

   ⚠⚠ **KẺ GHI ĐÈ THỨ BA LÀ HỆ KINH NGHIỆM.** `StickmanExperience.ApplyMilestone` cũng gọi
   `SetSmartsLevel` khi lính đủ XP. Ở AI Lab — nơi hai phe đánh nhau liên tục — chỉ vài giây là
   mốc kinh nghiệm nổ và cấp vừa chọn bị đè mất; người dùng đọc ra đúng câu *"bấm chuyển cấp AI
   thì nó vẫn lên cấp"*. Nay nó cũng hỏi `AILevelOverrides` trước.
   ⚠ CHỈ chặn vế CÁI ĐẦU — vũ khí · nón/giáp · vật cưỡi vẫn lên bình thường, vì chính ô chọn
   ghi rõ nó *"KHÔNG đụng máu, damage hay cấp vũ khí"*.

   ⚠⚠ **VÀ Ở SCENE QUAN SÁT, BẤM VÀO BẢNG CÒN BỊ TÍNH LÀ KÉO CAMERA** —
   `StickmanUI.ClaimPanel` / `.PointerOverHud`. `DemoCameraFollow._observerDrag` đọc THẲNG
   `Input.GetMouseButtonDown(0)` để cho scene không-có-nhân-vật lia camera; mà `Input` và IMGUI
   là **hai kênh không biết nhau**, nên mỗi cú bấm nút trên bảng «CẤP AI»/«NỀN VĂN MINH» cũng
   là một cú kéo màn hình: bảng trôi đi dưới ngón tay và người dùng đọc ra là *"bấm không chọn
   được"*. Không lỗi nào báo.
   ⚠ Bẫy này **CHỈ LỘ Ở AI LAB / sân đấu bot**: màn chơi có nhân vật thì `_observerDrag` tự tắt
   (`_target != null`) và bảng bấm ngon lành — nên nó đọc ra thành *"chế độ chơi thì được, AI
   Lab thì không"*, và người ta đi tìm lỗi ở cái bảng thay vì ở cái camera.
   ⚠ Bảng nào MỞ RA thì phải tự khai vùng bằng `ClaimPanel` (khai cả cái NÚT, không chỉ thân
   bảng). Thêm bảng góc mới mà quên khai là dính lại y hệt.
   ⚠ `PointerOverHud` phải ĐỔI HỆ trước khi so — `_panels` là ĐƠN VỊ THIẾT KẾ y hướng XUỐNG,
   `Input.mousePosition` là PIXEL THẬT y hướng LÊN. Quên là đúng ở desktop (scale 1) và trượt
   hẳn trên điện thoại.

   ⚠ **THANG CỦA Ô CHỌN LÀ 0–5, SÁU NẤC** — nhưng nấc 0 là *"— theo scene"* (KHÔNG ép), không
   phải "cấp 0 ngu nhất": `AISmartsTable` chỉ định nghĩa 5 bậc (1..5) và `SmartsLevel = 0`
   nghĩa là TẮT hệ cấp, thứ mà 40+ scene đang dựa vào. Muốn 0 thành một bậc kỹ năng thật thì
   phải thêm phần tử vào `DefaultLevels()` và đổi nghĩa số 0 ở mọi chỗ — đó là một quyết định
   khác, đừng lặng lẽ đổi nhãn.
3b-dau. ⚠⚠ **PHÙ HIỆU — NHÌN VÀO PHẢI BIẾT AI CHỈ HUY VÀ AI ĐÁNH KHÔN HƠN**
   (`UnitInsignia` + `CommandInsigniaSet`, tool `AI > 10`).

   Hai trục quan trọng nhất của hệ AI trước đây **không đọc được bằng mắt**:

   | Trục | Bản cũ | Hỏng thế nào |
   |---|---|---|
   | **chủ tướng / tổ trưởng / lính** | một Ô VUÔNG VÀNG cắm ở EDITOR (`StickmanDemoBuilder.AttachCrown`) | chủ tướng do `TeamCommander` TỰ CHỌN lúc `Start`, và `CommandNode.PickHeir` ĐÔN CẤP PHÓ lên thay khi tướng tử trận — **người kế nhiệm không có dấu gì**, vương miện cũ thì tự ẩn theo xác. Từ giữa trận trở đi cả phe không còn ai đeo dấu chỉ huy |
   | **cấp AI 1–5** | KHÔNG CÓ GÌ, chỉ có ở bảng debug F9 | mà nó đổi ở BỐN đường lúc chạy: nút «CẤP AI» (F3) · `TeamAILevels` · `AIDifficultyDirector` · `StickmanExperience` lên cấp |

   Nay ba dấu, đọc từ dữ liệu ĐÃ CÓ, **không thêm field nào vào ai**:
   **CỜ LỆNH sau lưng** (`CommandNode.IsCommander`) · **NGÙ trên nón** (`Rank ≥ 2` mà không
   phải gốc) · **CHẤT LIỆU CÂY VŨ KHÍ** theo `StickmanAgent.SmartsLevel` (xem 3b-do).

   ⚠ **KHÔNG dùng SCALE và KHÔNG nhuộm thân** (luật do người dùng chốt 2026-09-02). Cỡ người
   là trục cân bằng của archetype/quái/boss — mượn nó làm dấu hiệu là hai thông tin dùng
   chung một kênh; còn thân + đầu LUÔN ĐEN là chất stickman của cả dự án.

   ⚠ **HỎI LẠI MỖI FRAME, ĐỪNG GÁN MỘT LẦN LÚC DỰNG SCENE** — đó chính là cái làm vương miện
   nói dối. Rẻ vì chụp lại kết quả (3 phép so sánh int rồi thoát, đúng khuôn `DemoTeamFlag`
   chụp `_shownHealth`); chỉ khi con số THẬT SỰ đổi mới đụng renderer.

   ⚠ **HỎI `CommandNode.IsCommander`, ĐỪNG SO `Rank >= 3`.** Bậc gốc cây là
   `Mathf.Max(_ranks, rank + 1)`, tức đi theo `TeamCommander._ranks` của TỪNG SCENE — scene
   nào để cây 2 bậc thì chủ tướng có `Rank == 2` và phép so bằng số phát NGÙ cho ông tướng
   rồi để cả phe không có cây cờ nào, **không lỗi nào báo**.

   ⚠ **MỘT DẤU CHỈ HUY, MỘT CHỦ.** `UnitInsignia` nhận luôn quyền bật/tắt cái vương miện đã
   bake (`ApplyLegacyCrown`) — hai dấu chỉ huy mà có thể nói ngược nhau thì đúng bằng không
   có dấu nào.

   ⚠ **AI GẮN COMPONENT: `StickmanAgent.Awake` tự gắn**, đúng khuôn nó đã tự gắn
   `StickmanLocomotion`/`TeamMember`. Nhờ đó **40+ scene đã bake KHÔNG phải dựng lại**; và
   scene để `_smartsLevel = 0` (tắt hệ cấp) mà không có cây chỉ huy thì nó không mọc ra thứ
   gì — hình cũ giữ nguyên tuyệt đối. `SmartsLevel = 0` nghĩa là TẮT HỆ, không phải "cấp thấp
   nhất"; số vạch = `SmartsLevel − 1` nên cấp 1 (tân binh) cũng trống, đúng quy ước vạch kinh
   nghiệm.

   ⚠ **VẠCH KHÔNG TÔ MÀU PHE.** Phe đã được nói bằng chính thanh máu ngay trên đầu nó; hai
   thông tin dùng chung một kênh màu thì không đọc ra cái nào — cùng lý do
   `CivilizationTeamAssigner` đã phải BỎ HẲN đường tô thanh máu theo màu cờ nền văn minh.
   Ngược lại, CỜ và NGÙ thì **art vẽ THANG XÁM rồi tint bằng `TeamMember.ColorOf`** (thủ
   thuật của bộ lông ngựa) nên một tấm dùng cho mọi phe, và nó kiêm luôn việc đọc ra phe.

   ⚠ **NGÙ HOÀ BẬC VỚI NÓN** (cùng `HeadGear` = 8) nên phải **NHÍCH Z ÂM** (gần camera hơn):
   để hoà bậc trần là Unity xếp tiếp theo khoảng cách camera và thứ tự đảo qua đảo lại tuỳ
   frame — đúng cái bẫy đã làm "nón lúc trên lúc dưới". **CỜ thì `followBoneLean`** như giáp
   (cán cắm sau lưng, thân ngả tới bao nhiêu cờ ngả bấy nhiêu); ghim đứng là cây cờ đứng im
   trong khi người gập về trước.

   ⚠ **CỠ VÀ CHỖ ĐẶT ĐO TỪ RIG** (`StickmanRigMetrics`) rồi BAKE vào asset — lớp đo chỉ chạy
   được trên Editor. Gõ tay là đổi skin / phóng to boss một cái là cờ lệch khỏi lưng mà không
   lỗi nào báo. Sửa `BannerHeightRatio`/`PlumeHeightRatio`/`PlumeLift` trong
   `StickmanInsigniaBuilder` rồi **bấm lại tool**, đừng sửa tay asset.

   ⚠ **Art hiện tại là VẼ BÙ bằng code** — theo LUẬT NGUỒN ASSET thì bản thật phải đặt
   ChatGPT; đơn hàng đã viết sẵn ở `WeaponArt-ChatGPT-Prompt.md` mục **6**. Thả PNG cùng tên
   vào `Assets/Sprites/Insignia/` là `WeaponArtGenerator.Save` tự chừa ra (nhãn nguồn art).

   ⚠⚠ **TOOL PHẢI GHI ĐỦ MỌI TRƯỜNG NÓ LÀM CHỦ — ĐỂ CHO FIELD INITIALIZER LO LÀ SỐ CHẾT
   TRONG ASSET.** Bản đầu của `StickmanInsigniaBuilder` chỉ ghi các trường của CỜ và NGÙ, còn
   số QUÂN HÀM thì để giá trị khởi tạo trong `CommandInsigniaSet.cs` lo. Nhưng asset là thứ
   ĐÃ BAKE: Unity nạp GIÁ TRỊ ĐÃ LƯU, không nạp field initializer. Nên khi bố cục quân hàm
   được thiết kế lại, asset cũ vẫn đưa số CŨ cho runtime — và **bấm lại tool cũng không chữa**
   vì tool không đụng tới mấy trường đó. Đo được: `chevronHeight` 0.30 vốn là chiều cao của Ô
   VUÔNG xếp ngang, đem sang bố cục SỌC thì mỗi sọc dày 0.30 ⇒ cả hàng phình thành một **CỘT
   TRẮNG treo từ thanh máu xuống tận đầu nhân vật**. Không lỗi nào báo. Đây là bẫy "sửa bug
   bằng đổi mặc định" đã ghi ở mục khiên, lặp lại nguyên xi.
   ⚠ Kèm LƯỚI CHẶN ở runtime (`UnitInsignia.ClampRankMetrics`): kẹp theo chính THANH MÁU —
   một sọc luôn dài ≥ 2.5 lần bề dày (không bao giờ ra ô vuông), cả hàng ≤ 70% bề ngang thanh
   máu (không bao giờ ra "thanh máu thứ hai"), và luôn nằm dưới đáy thanh máu. Chốt HAI ĐẦU
   vì asset là thứ người ta kéo tay sửa được, còn hình sai thì không ai báo.

   ⚠⚠ **BA TRỤC PHẢI CÙNG KHÁC, KHÔNG PHẢI MỘT.** Quân hàm cấp AI và vạch kinh nghiệm
   (`StickmanExperience.PipSprite`) là hai hệ đo hai thứ khác hẳn nhau, nhưng bản đầu vẽ
   chúng GIỐNG NHAU ở cả ba mặt đáng kể: cùng Ô VUÔNG, cùng tông VÀNG, cùng nằm sát thanh máu.
   Người dùng đọc ra *"bị dư 2 dấu hiệu"*. Nay khác ở **hình** (sọc ~4:1 vs ô vuông) ·
   **màu** (bạc lạnh vs vàng — vàng là màu ĐÃ CÓ CHỦ của vạch kinh nghiệm + vương miện) ·
   **phía** (dưới thanh máu vs trên). Khác một trục thôi thì ở cỡ thật vẫn lẫn.

   ⚠ Mục tool khai `proof` = chính `Resources/CommandInsigniaSet.asset`, nên **chưa chạy là
   Bảng điều khiển hiện chấm ĐỎ**. Không có asset thì cờ + ngù im lặng không hiện (quân hàm
   vẫn chạy vì nó là hình khối thuần, không cần art) — cái im lặng đó ĐO ĐƯỢC, đúng LUẬT VÀNG.

3c. **KINH NGHIỆM & TRƯỞNG THÀNH** (`StickmanExperience` + bảng `Assets/Resources/ExperienceTable.asset`,
   tool `AI > 7`): giết địch → XP (kẻ có `DamageInfo.source` của phát kết liễu ăn trọn — nghe
   event `TeamMember.AnyDied`, KHÔNG đụng code combat) → đủ XP là LÊN CẤP. Mỗi mốc cấp mở khoá
   theo bảng: `smartsLevel` (CHỈ cái đầu) + `weaponTier` (cấp vũ khí, chỉ NÂNG không hạ) +
   `maxHealthBonus` (cộng máu GỐC + hồi đầy). Vạch vàng trên đầu = số cấp đã lên.
   Bốn mốc chạy hết thang cấp AI: 2 → 3 → 4 → 5.
   ⚠ Ba trường đó là BA TRỤC RIÊNG (xem 3b-do), cố ý không suy ra từ nhau — mốc nào muốn
   "khôn lên mà vẫn cầm đồ cũ" thì để `weaponTier = 0`, và ngược lại.
   XP ngoài (nhiệm vụ...) cộng bằng `GainXp(amount)`; event `LeveledUp` cho UI/effect.
   `AI > 1` tự gắn component vào prefab NPC; nhịp mặc định chậm (2 mạng → cấp 2) nên trận demo
   ngắn gần như không đổi. Bài test: `Demo_8_AILab` › "Kinh nghiệm & trưởng thành".
4. **Dựng bằng tool**: `Tools > Stickman > AI > 1. Create NPC Prefab` (StickmanNPC = variant
   của StickmanFighter) → `2. Create AI Arena Scene` (2 phe 3v3 + kịch bản vệ sĩ/sát thủ).
   Di chuyển qua `StickmanLocomotion` (Rigidbody2D.linearVelocity), bước chân procedural
   qua `StickmanLegWalker` (đung đưa IK chân) — không cần clip Walk.
5b. **NÉ ĐẠN KHÔNG PHẢI NHÀO LỘN**: `StickmanAgent.UpdateDodge` phải TRUYỀN RÕ style
   (`AIProfile.dodgeStyle`, mặc định `sidestep` — dài 0.3s, khớp `dodgeDuration`).
   Để trống là `Pick` bốc ngẫu nhiên trong kho `Roll`, trúng style `forward` = thân quay
   trọn 360° trong 0.68s, dài GẤP ĐÔI cú né → nhân vật còn xoay sau khi đã đứng yên; cả
   tiểu đội né liên tục (cooldown 0.9s) là cả sân trông như bị xoay tròn (đã dính 1 lần).

5d. **KHÔNG BAO GIỜ BỐC NGẪU NHIÊN MỘT CÚ XOAY TRỌN VÒNG** (`StickmanActionSet.Pick` →
   `IsSpin`). Cú lộn/lăn đi QUA **180° = đầu chúc thẳng xuống đất** rồi mới về 360°. Một động
   tác ưu tiên cao hơn cắt ngang đúng khoảng giữa đó (tiếp đất 45 > nhảy 40) là thân đứng lại
   ở tư thế **CẮM ĐẦU XUỐNG ĐẤT** — không lỗi nào báo, chỉ là thỉnh thoảng nhảy một cái lại
   chúi đầu, cả người chơi lẫn AI.
   Đã dính **HAI LẦN theo đúng một kiểu**: né đạn bốc trúng `Roll/"forward"` (lăn 360°), và
   nhảy bốc trúng `Jump/"flip"` (lộn 360°, weight 0.35 nên ~1/8 cú nhảy). Cả hai lần đầu đều
   chữa ở CHỖ GỌI (truyền rõ tên style) — nên lần sau thêm một style xoay mới là dính lại.
   Nay chặn ở **CHÍNH HÀM CHỌN**: style xoay trọn vòng vẫn dùng được nhưng phải **GỌI ĐÚNG
   TÊN**, lúc đó bên gọi đã tự chịu trách nhiệm là có đủ thời gian cho nó quay hết.
   ⚠ Lọc xong mà KHÔNG CÒN style nào thì tự bỏ lọc — thà ra cú lộn còn hơn đứng đơ.
   ⚠ Lưới an toàn thứ hai ở `StickmanBodyAnimator`: cú lộn CỐ Ý mà bị cắt ngang thì
   `_fadeFrom.bodyAngleOffset` quá **90°** được kéo về 0 — quá nửa vòng thì không còn đường
   nào về thẳng mà không đi qua vùng chúc đầu, nên coi như vòng quay đã xong và xuất phát từ
   tư thế ĐỨNG. Phép bỏ vòng nguyên (±360 → 0) chỉ cứu được cú lộn ĐÃ XONG, không cứu được
   cú bị cắt giữa chừng.

5b-tang. ⚠⚠ **ĐỊCH Ở TẦNG KHÁC — CẢ HỆ AI TỪNG KHÔNG BAO GIỜ HỎI CÂU NÀY.**
   Mọi phép đo khoảng cách của AI đều là KHOẢNG CÁCH NGANG (`StickmanAgent.DistanceToTarget`
   và `distance` trong `CombatStrategyBase.Tick`) — đúng cho game đi ngang, cho tới lúc có
   TƯỜNG THÀNH. Địch đứng trên mặt tường cao 2.4 NGAY TRÊN ĐẦU thì khoảng cách ngang ≈ 0:
   · `AIStateSeek` thấy "đã trong tầm chém" → nhảy sang Combat;
   · `MeleeCombatStrategy` thấy "gần quá" → lùi ra rồi tiến vào rồi lùi...;
   · `ShouldAttack` thấy dưới `MinRange` → KHÔNG vung;
   · cả tiểu đội cùng chấm một mục tiêu nên **tất cả hội tụ về CÙNG MỘT TOẠ ĐỘ X**.
   Trên màn hình: hai cụm quân đứng dồn cục dưới chân tường, không đánh, không đi. **Không
   lỗi nào báo** — mọi hàm đều trả lời đúng câu nó được hỏi, chỉ là không ai hỏi về chiều CAO.
   Ba chốt đã đặt:
   · `TargetHeightGap` / `LevelGap` (= `StepHeight × 4.5`, neo vào tầm bước nên boss ×1.6 tự
     co giãn) / `TargetOnAnotherLevel` — ⚠ địch ĐANG BAY không tính là tầng khác, không thì
     mỗi lần đối thủ nhảy là state nhấp nháy;
   · `CanEngageAcrossLevel` — cung/súng/lao/phép BẮN LÊN được, cận chiến thì KHÔNG. Đây là
     chỗ tách hai lối chơi công thành: cung thủ đứng dưới bắn lên, bộ binh phải LEO hoặc PHÁ
     CỔNG. `AIStateSeek`/`AIStateCombat` không cho cận chiến khoá vào mục tiêu với-không-tới,
     để tầng vượt địa hình còn cửa lái họ đi tìm cầu thang;
   · `AIProfile.crossLevelPenalty` (7) — cận chiến BỚT mê mục tiêu ở tầng khác, nên nó tự
     chọn CỔNG hoặc kẻ cùng mặt đất trước. Không CẤM hẳn: có cầu thang thì vẫn leo lên xử.

5b-ket2tang. ⚠⚠⚠ **"THẰNG TRÊN MUỐN NHẢY XUỐNG, THẰNG DƯỚI MUỐN BAY LÊN" — BẾ TẮC HAI CHIỀU
   Ở BỨC TƯỜNG** (`UpdateUnreachableTarget`, 2026-09-04). Hai người ở hai tầng cùng khoá vào
   nhau, mà cận chiến thì `CanEngageAcrossLevel` = false nên **không ai chạm được ai**. Mỗi
   khung hình cả hai đều "đang đi về phía kẻ đáng đánh nhất", nên không lỗi nào báo và cũng
   không van gỡ kẹt nào bật (họ vẫn nhúc nhích được, chỉ là vô ích).

   Hai vế chữa:
   · **BỎ CHỐT "gần đây CÓ cầu thang thì cấm tụt"** trong `TryDropOffPlatform`. Ý đúng nhưng
     hỏi sai câu: mặt tường thì LÚC NÀO cũng có cầu thang, nên nó cấm tụt vĩnh viễn — và nếu
     `RequestStairsIfNeeded` không dựng được lộ trình thì kẻ trên nóc không còn đường nào
     xuống. `IsTakingStairRoute` mới là câu hỏi đúng: nó chỉ true khi lộ trình THẬT SỰ đang
     được đi. Có lộ trình thì đi bộ, không có thì tụt còn hơn đứng.
   · **BÁM MỘT MỤC TIÊU VỚI-KHÔNG-TỚI QUÁ `VerticalGiveUp` (1.5 s) THÌ BỎ.** `OtherFloorPenalty`
     đã lo phần *"có ai cùng tầng thì đánh người đó"*; hàm này lo vế còn lại — khi CHỈ CÒN kẻ ở
     tầng khác. Bỏ mục tiêu ra thì state quay về `MarchToObjective`, tức đi tiếp về phía
     cổng/nhà, dọc đường gặp ai đánh nấy và tự nhiên đi tới chỗ có cầu thang.
   ⚠⚠⚠ **CÓ LỐI LÊN/XUỐNG THÌ ĐI LỐI ĐÓ — BỎ MỤC TIÊU LÀ SINH RA VÒNG LẶP ĐI TỚI ĐI LUI**
   (sửa lần ba, 2026-09-04). Bản trước bỏ thẳng mục tiêu rồi để state `MarchToObjective`. Nhưng
   **cột mốc nhiệm vụ thường nằm NGƯỢC HƯỚNG kẻ địch** — phe thủ có mốc ở cổng phía sau, phe
   công có mốc ở nhà phía trước — nên nó đi ra xa 5 giây, hết hạn nhớ thì bốc lại đúng kẻ ấy và
   đi ngược về: **một vòng lặp ~6.5 giây, và không bao giờ đánh nhau**. Không lỗi nào báo, mỗi
   nhịp đều đang làm một việc hợp lý.
   Việc ĐÚNG khi không với tới là **đi tìm LỐI** (`FindClimbBetweenLevels` → `TryTakeClimbRoute`),
   không phải bỏ đi rồi quay lại. Chỉ khi KHÔNG có lối nào mới bỏ tầng — và lúc đó nhớ **12
   giây** (`UnreachableMemory`), đủ dài để nó đi được một quãng có nghĩa.
   ⚠ Thang phải phủ TRỌN khoảng cao độ giữa hai bên: đỉnh tới được tầng cao, chân chạm tầng
   thấp. Thiếu một đầu là leo tới nơi rồi vẫn không sang được.

   ⚠⚠ **PHẢI BỎ CẢ CÁI TẦNG, ĐỪNG CHỈ BỎ MỘT NGƯỜI** (`_skipCrossLevelUntil`, sửa lần hai).
   Bản đầu nhớ đúng MỘT mục tiêu vừa bỏ — nhưng trên mặt tường thường có vài người, nên nó chỉ
   xoay vòng: bỏ anh A (1.5 s) → bốc anh B → bỏ anh B → bốc anh C… **vẫn đứng nguyên dưới chân
   tường suốt**, chỉ khác là mũi tên ngắm nhảy qua nhảy lại. Câu đúng phải là *"tôi không lên
   được TẦNG ĐÓ"*, không phải *"tôi không với tới NGƯỜI ĐÓ"*.
   ⚠ **PHẢI NHỚ** (`UnreachableMemory` 5 s): thiếu vế này là bỏ rồi bốc lại mỗi 0.2 giây,
   đứng y như cũ. Kề mặt (`ContactRange`) thì kệ — lúc đó nó với tới thật.
   ⚠ Đang đi cầu thang hoặc đang trèo thì KHÔNG tính là kẹt: lúc đó nó đang giải quyết vấn đề.

5b-tang2. ⚠⚠ **CẬN CHIẾN ĐÁNH MỤC TIÊU CÙNG TẦNG THÔI — PHẠT PHẢI DỨT KHOÁT**
   (`OtherFloorPenalty` = 60, luật người dùng chốt 2026-09-04).
   `crossLevelPenalty` (7) chỉ là một khoản trừ CỘNG THÊM, nên nó thua ngay khi kẻ ở tầng khác
   tình cờ gần hơn — mà mọi phép đo khoảng cách của AI là khoảng cách NGANG (§5b-tang), và kẻ
   đứng trên mặt tường **ngay trên đầu** đọc ra là *"cách 0 mét"*. Kết quả: cả tuyến cận chiến
   khoá vào mấy ông cung thủ trên nóc, đứng dưới chân tường vung kiếm vào không khí, trong khi
   địch cùng mặt đất đi lại ngay cạnh. Không lỗi nào báo — bảng điểm chấm đúng công thức của nó.
   Khoản phạt nay lớn hơn mọi khoản CỘNG của bảng gộp lại (kết liễu 6 + tướng 8 + phá nhà 6 +…),
   tức *"chỉ chọn khi KHÔNG CÒN AI cùng tầng"*.
   ⚠ **HỮU HẠN, không loại thẳng như công trình**: hết địch cùng tầng thì phải còn chọn được kẻ
   trên tường, không thì `RequestStairsIfNeeded`/`TryStartClimb` không có mục tiêu để mà đi tìm
   cầu thang — cả cánh quân đứng ngơ vì *"không có ai để đánh"*.

5b-doidau. ⚠⚠ **THU QUYỀN ĐI XUYÊN LÚC THÂN CÒN TRONG KHỐI = ĐẨY VĂNG**
   (`Fortification.StillInsideMe`, 2026-09-04 — *"đứng dưới chân tường nhảy lên thì đụng đầu
   dội lại"*). Tường cho người đi bộ NGANG QUA chân tường, đo bằng `AtFootOf` (bàn chân thấp
   hơn đáy tường 0.35). Nhưng NHẢY là bàn chân vọt qua mốc đó ngay, nên nhịp quét kế THU quyền
   **trong lúc thân còn nằm gọn trong khối đá** ⇒ Box2D thấy hai vật chồng nhau và đẩy bật ra.
   Luật này đã có sẵn ở `VillageGate` (*"ai đang đứng trong ô cửa thì luôn giữ quyền"*) và ở
   `StickmanStairs` (*"ai đã lọt vào trong khối bậc thì luôn được đi xuyên"*) — chỉ là tường
   chưa áp. **Thêm một công trình cho-đi-xuyên mới thì phải áp cả ba vế: cấp · thu · và ĐỪNG
   THU KHI CÒN CHỒNG.**

5b-thuoc. ⚠⚠ **RÚT LUI PHẢI LÙI VỀ PHÍA THẦY THUỐC, KHÔNG LÙI MÙ RA SAU**
   (`AIProfile.healerSeekRadius` = 12, mặc định BẬT · `StickmanAgent.TryGetHealerRetreatX`).

   **Dự án KHÔNG có hồi máu tự nhiên** — đo được: không một dòng `regen` nào trong
   `StickmanController`. Đường DUY NHẤT để lấy lại máu là đứng trong `healRadius` (3.5) của ai
   đó mang `AIHealerModule`. Mà `AIStateRetreat` bản cũ chỉ chạy NGƯỢC HƯỚNG kẻ địch — tức là
   chạy ra xa MỌI THỨ, kể cả thầy thuốc. Kết quả: **lính rút lui không bao giờ được băng bó**,
   hết `retreatMaxDuration` thì quay vào tuyến với đúng số máu cũ rồi chết, còn ông giáo sĩ
   đứng cách đó 6 mét cả trận không có việc gì làm. Không lỗi nào báo.

   ⚠ Mỉa mai là AI đã BIẾT thầy thuốc đáng giá: `AICavalryRaidModule` chấm mồi đột kích theo
   `healAmount > 0`. Nó biết đi GIẾT thầy thuốc của địch mà không biết chạy về phía thầy thuốc
   của mình — dấu hiệu điển hình của một cơ chế mới làm xong MỘT NỬA.

   ⚠ **Chỉ nhận thầy thuốc nằm ĐÚNG PHÍA đang rút.** Nằm bên kia kẻ vừa suýt giết mình thì
   "chạy về chỗ an toàn" hoá ra là chạy xuyên qua nó — đúng cặp luật giằng nhau ở §5c, và bên
   thua là người xem đang nhìn một anh lính tự nộp mạng.
   ⚠ **Tới nơi thì ĐỨNG YÊN** (`arriveDistance`): chạy tiếp là ra khỏi `healRadius` ngay nhịp
   sau và cả chuyến rút thành công cốc.
   ⚠ **Mép vực thắng tất** — van `IsLedgeAhead` của retreat cũ vẫn chạy trước.
   ⚠ Hỏi bằng `Profile.healAmount` của ĐỒNG ĐỘI, đừng đẻ thêm nhãn *"tôi là thầy thuốc"*:
   nguồn sự thật cho câu đó vốn đã là con số ấy (`AIHealerModule` cũng hỏi nó), thêm một cờ
   nữa là hai chỗ có thể nói ngược nhau.

5c. **MỌI VÒNG LẶP ĐỀU LÀ HAI LUẬT ĐÚNG KÉO NGƯỢC NHAU** — không luật nào sai, ghép lại thì
   nhân vật đứng rung tại chỗ. Đã dính 5 cặp: giữ tầm ↔ mốc đội hình (tiến/lùi đổi nhau MỖI
   FRAME) · chia mục tiêu ↔ khoảng cách (đổi mục tiêu mỗi nhịp quét → lật thân qua lại) ·
   tử chiến ↔ lách qua người (đi xuyên qua nhau qua lại) · rút lui ↔ máu thấp (chạy-quay-chạy) ·
   **đi tuần quanh chỗ gác ↔ về lại chỗ gác, khi CHỖ GÁC BIẾT ĐI** (xem ngay dưới).
   Chữa từng cặp bằng **VÙNG CHẾT / QUÁN TÍNH**, số nằm trong `AIProfile`:
   `formationDeadband` · `targetSwitchMargin` · `retreatCooldown`.
   **Thêm luật mới quyết định hướng đi thì phải tự hỏi: luật này có đọc đúng cái mà luật kia
   vừa đổi không?** Nếu có → bắt buộc có vùng chết, KHÔNG được so thẳng `>=`.

   ⚠⚠ **MỐC ĐỨNG YÊN vs MỐC BIẾT ĐI LÀ HAI BÀI TOÁN KHÁC NHAU — `AIStateGuard`.**
   Vệ sĩ neo chỗ gác vào chính người mình bảo vệ (`GuardPostX` = `protectPos.x ± …`). Với cái
   NHÀ / cái LỒNG thì mốc đứng im nên mọi luật quanh nó đều đúng; với **VIP là NGƯỜI CHƠI**
   thì mốc trôi theo mỗi bước chân, và ba luật vốn đúng bắt đầu kéo ngược nhau — nhìn ra đúng
   câu *"AI xoay qua xoay lại, không biết phải làm gì"*. Bốn chốt đã đặt, thiếu cái nào cũng
   còn lật:
   · **ĐANG ĐI THÌ BÁM THEO, KHÔNG ĐI TUẦN** — tuần tra là đi qua đi lại quanh một điểm ĐỨNG
     YÊN; điểm ấy trôi thì vệ sĩ đi về đầu tuyến cũ (nay ở sau lưng), lệch quá bán kính, luật
     "về chỗ gác" kéo ngược lại, rồi lại quay đầu. Đo bằng **QUÃNG ĐƯỜNG THẬT** của mốc
     (`TrackProtect`), không hỏi `linearVelocity` — mốc có thể là Transform trần, và vận tốc
     là Ý ĐỊNH đi chứ không phải quãng đã đi (cùng bài học `TravelSpeed`).
   · **NHÁNH "BÁM THEO" PHẢI ĐỨNG TRƯỚC NHÁNH "THẤY ĐỊCH THÌ ĐỨNG NHÌN"** — cả hai nhánh sau
     đều bắt vệ sĩ ĐỨNG LẠI, mà đứng lại thì vài bước sau lại lệch chỗ. Để sai thứ tự là đúng
     lúc đáng bám sát nhất (VIP vừa đi vừa có địch quanh) nó lại chôn chân rồi cuống lên chạy
     theo, mặt quay về địch rồi quay về VIP luân phiên. Đúng: **chân bám đoàn, mặt quay về địch**.
   · **VÙNG CHẾT cho ngưỡng "lệch quá thì về chỗ"** (`_returningToPost`): ngưỡng BẮT ĐẦU đi về
     rộng hơn ngưỡng COI LÀ ĐÃ TỚI.
   · **QUÁN TÍNH cho "bên nào đáng chắn"** (`UpdateThreatPicture`): hai chỗ đứng cách nhau tới
     `2 × guardScreenDistance`, nên đổi ý một nhịp là vệ sĩ phải BĂNG QUA NGƯỜI VIP. `WatchSide`
     đã học bài này rồi mà `PostSideFrom` thì sót — nó so thẳng `left <= right` (hai địch xấp xỉ
     nhau ở hai bên là lật MỖI NHỊP QUÉT) và nhảy giữa "trống"/"có địch" khi địch lảng vảng đúng
     mép `guardAlertRange`. Nay có khoảng chênh tối thiểu + cấm đổi ý trong `ThreatHoldTime`.
   ⚠ **Đích của một chuyến tuần phải TÍNH LẠI MỖI FRAME theo chỗ gác hiện tại**, đừng chốt một
   toạ độ `x` lúc xuất phát — đó chính là cái làm vệ sĩ đi về một chỗ đã nằm sau lưng cả đoàn.

   Van an toàn cuối là `StickmanAgent.UpdateDeadlockBreaker()` — nó KHÔNG cần biết lý do:
   cứ `deadlockWindow` giây chấm một lần, "ĐÒI ĐI mà không dời chỗ" hoặc "đổi hướng quá nhiều
   lần" → trước hết `TryJumpPastDeadlock()` thử **NHẢY QUA** khe/bục địa hình ngay hướng đang
   đòi đi — phải có chỗ đáp trong `jumpGapReach`, không ở cầu thang / giữa trời, giữ nhịp
   `jumpCooldown` và sổ nhảy theo phe. Không có chướng ngại vượt an toàn mới **XÔNG LIỀU** (còn
   mục tiêu) hoặc **CHỐT HƯỚNG** đi thẳng, ghi đè state + tắt giãn cách cho bằng thoát ra. Đo
   `Locomotion.Steer` (Ý ĐỊNH đi) chứ không đo vận tốc thật; ra được đòn là xoá sổ theo dõi.
   Soi bằng **F9**: hậu tố `»` = đang gỡ kẹt, `!` = xông liều, `†` = tử chiến. `»` nhấp nháy
   khắp sân = có cặp luật mới giằng nhau, đi tìm cặp đó chứ đừng nới số. Chi tiết:
   `Docs/KnowledgeBase/AI-NPC.md` mục 5.48.

5. **KHÔNG BAO GIỜ ĐI XUỐNG VỰC** — `StickmanLocomotion` bắn 3 tia xuống (dưới chân + 2 bên)
   và CẮT thành phần vận tốc đi về phía không có đất. Chặn ngay chỗ vận tốc được ghi ra nên
   mọi nguồn đều dính: AI lùi khi kite, né đạn, giãn cách đội hình, rút lui, cả người chơi giữ phím.
   Hết đường lui thì AI **QUAY LẠI TỬ CHIẾN** (`StickmanAgent.BeginLastStand`): bỏ hẳn ý định
   rút lui, không kite, không đánh-rồi-rút, vung vũ khí ở mọi khoảng cách — giữ tới khi đẩy
   lui được địch (`AIProfile.lastStand*`). ⚠ Phải là **CỜ BỀN**, không được chỉ đọc
   `IsCornered`: `IsCornered` là hình học tức thời, rời mép một bước là tắt, máu vẫn thấp nên
   lính lại xin chạy → chạy tới mép → quay lại → chạy tới mép, mỗi vòng lật thân một lần nên
   nó đứng **XOAY VÒNG VÒNG** cạnh vực (đã dính 1 lần ở Demo_3). Chỗ đọc để quyết định
   "không lùi nữa" là `FightsToTheDeath`, không phải `IsCornered`.
   Tia dò hiện trong Scene view khi chọn nhân vật (xanh = có đất, đỏ = vực).
6. **Đi bộ là mặc định, chạy tốn thể lực** (`StickmanLocomotion`): player giữ `Shift`,
   NPC do `StickmanAgent.UpdateRun()` quyết (đuổi xa / xông liều / rút lui — tuning trong
   `AIProfile`). Cạn thể lực là cấm chạy tới khi hồi đủ `_recoverPercent`. Muốn cho ai đó
   chạy vô tư thì tắt `_useStamina`. Chi tiết: `Docs/KnowledgeBase/AI-NPC.md` mục 5.33.


---


---

**SỔ BẪY THEO NGÀY** (mỗi mục là một lỗi đã sửa, đọc khi đụng đúng mảng đó):
[AI-Notes.md](AI-Notes.md).
