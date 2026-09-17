### ⚠⚠ ĐOÀN XE CÔNG THÀNH — NĂM LOẠI MÁY, TỔ MÁY TỰ VẬN HÀNH, TƯỚNG ĐI CÙNG XE (2026-09-05)

User: *"xe công thành có lính đẩy nó đi — xe phá cổng, xe lên tường, xe bắn đá, nỏ bự, đại
bác — và AI biết sử dụng và điều phối"*. Sân: **`Demo_41_SiegeTrain`** (`Fortifications > 4`).

⚠⚠ **CỖ MÁY TỪNG ĐỨNG CHỜ TỚI HẾT TRẬN.** `SiegeEngine` có `_crewNeeded` từ lâu — vế cân
bằng đúng — nhưng **không một dòng AI nào đi vận hành nó**: tổ máy chỉ là ai TÌNH CỜ đứng
trong bán kính. Ở `Demo_26` cái xe phá cổng nằm ngoài đồng, lính đi ngang cũng đang chạy đi
chỗ khác. Không lỗi nào báo — cỗ máy vẫn "hợp lệ", chỉ là chưa bao giờ lăn bánh. Đúng loại
*"code có sẵn mà không ai gọi"*.

| Mảnh | Ở đâu | Việc |
|---|---|---|
| **5 loại** `SiegeEngineKind` | Combat | `Ram` húc công trình · **`Tower`** đẩy tới sát tường rồi **CẬP BẾN** (bật `StickmanClimbZone` trong thân + ván một chiều sang mặt tường) · `Catapult` cầu vồng + cháy · `Ballista` bắn thẳng vào NGƯỜI · **`Cannon`** đạn nổ bay căng, phá công trình trước, nạp chậm nhất bộ (7 s) |
| **GHẾ** `TryReserveSeat/RenewSeat/ReleaseSeat` · `CrewSlotX(i)` | Combat | mỗi máy đúng `_crewNeeded` ghế; xe được đẩy thì ghế xếp hàng **SAU** xe, máy bắn thì hai bên. Ghế không gia hạn 1.5 s là mở |
| **SỨC ĐẨY** `PushScale` | Combat | đủ tổ = 1.0, thêm người +15% mỗi người, trần 1.3. **Thiếu tổ = xe DỪNG** — đó là chỗ phe thủ có việc để làm |
| `AISiegeCrewModule` (`AIModuleKind.SiegeCrew`, trong `DefaultKinds`) | AI | cận chiến/khiên tự tới ghế, ra dáng ĐẨY (`SetCarrying`) khi xe lăn; buông ghế khi bị dí sát mặt, xin lại sau 2.5 s; cam kết `siegeCrewCommit` |
| `CommandDoctrine.escortSiegeEngines` + `siegeEscortLead` | AI | **XE ĐI ĐÂU QUÂN THEO ĐÓ**: thế Tấn công KẸP mốc tuyến không vượt quá xe đang trên đường (`TryNearestAdvancing`). Bật ở `Doctrine_Raid` + `Doctrine_Aggressive` |
| `AIProfile.siegeEngineTargetBonus` (4) | AI | phe thủ cận chiến ưu tiên PHÁ máy địch còn sống — khác khúc tường bất tử |

⚠⚠ **VAI HỢP VỚI LOẠI MÁY — HỎI Ở CỖ MÁY (`SiegeEngine.AcceptsRole`), ĐỪNG KÊ LẠI TRONG
MODULE.** Bản đầu loại `Ranged`/`Support` khỏi **MỌI** ghế với lý do *"cung thủ bắn yểm hộ có
giá hơn đứng đẩy"* — đúng cho XE ĐƯỢC ĐẨY, và **sai hoàn toàn cho MÁY BẮN**: xạ thủ chính là
người hợp nhất để vận hành khẩu nỏ/pháo, nhưng lại là người DUY NHẤT không bao giờ nhận được
ghế. Cả tuyến cung đứng bắn cung tay trong khi khẩu đại bác ngay cạnh không ai đụng tới, và
**không có lỗi nào báo**. Nay: xe ĐẨY cần sức (cận chiến/khiên), máy BẮN thì ai cũng dùng
được — hỏi ở cỗ máy nên mai thêm loại thứ bảy thì module không phải biết gì thêm.

⚠ **Bốn chốt của tổ máy, thiếu cái nào cũng ra "cả tiểu đội bỏ trận đi ôm cái xe"**: ghế
(một người một ghế) · đang giáp lá cà thì thôi · vai hợp với loại máy (trên) · cam kết.

⚠⚠ **GHẾ PHẢI NHẬN `StickmanController`, KHÔNG NHẬN `IUnitBrain`.** Bản đầu khoá ghế theo bộ
não — mà **người chơi không có agent**, nên cỗ máy hoành tráng nhất trận là thứ duy nhất người
chơi chỉ được đứng nhìn, và cái ô nhắc "bấm F để dùng" không có gì để gọi. Thêm một hệ mà bên
trong hỏi `IUnitBrain` thì tự hỏi ngay: *"người chơi dùng được không?"*

**Ô NHẮC** (`SiegeEnginePrompt` + `SiegeEnginePromptBootstrap`): đứng gần máy PHE MÌNH thì
hiện `GUI.Button` nổi trên đầu cỗ máy — *"[F] Dùng đại bác"*, *"[F] Đẩy xe phá thành"*. Chữ
trên nút nói ĐÚNG việc sắp làm, không phải "dùng máy" chung chung.
· **XE ĐẨY**: vào suất là đứng góp sức, xe tự lăn; người chơi vẫn đi lại được (không khoá
  `UseMoveInput` như tay lái thuyền — đi khỏi bán kính thì ghế tự hết hạn, không cần khoá gì).
· **MÁY BẮN**: máy IM, chờ người chơi **bấm ĐÁNH** (`HasHumanGunner` → `RequestFire`). Cho họ
  chọn thời điểm là thứ biến cỗ máy thành pha chơi thật — đổi lại ô nhắc PHẢI ghi rõ trạng
  thái (*"nạp 3.2s"* / *"SẴN SÀNG — bấm ĐÁNH"*), không thì họ ngồi vào rồi tưởng máy hỏng.
· ⚠ Vẫn đi qua ĐÚNG `_fireInterval`: máy trong tay người chơi không được bắn nhanh hơn trong
  tay AI, không thì "cầm máy" thành nút thắng chứ không phải một lựa chọn.
· ⚠ **KHÔNG thêm nút vào cụm nút cảm ứng** — cụm đó đã chật (§11: chỗ đặt nút là tài nguyên
  khan hiếm nhất), và một nút chỉ dùng được khi đứng cạnh cỗ máy mà chiếm chỗ suốt trận là
  đẩy nút hay dùng ra xa tầm ngón cái. Ô nổi tại chỗ tự đến rồi tự đi.
· ⚠ Nhả suất ở **bốn đường**: bấm lại · chết · máy chết/cập bến · đi quá xa.
· ⚠ Bootstrap gắn **MỘT** ô cho cả scene (không gắn lên từng máy — năm máy là năm ô cùng vẽ,
  cùng đọc phím, cùng tranh một suất) và scene đã bake KHÔNG phải dựng lại.

⚠⚠ **CỖ MÁY TỪNG CÂM TUYỆT ĐỐI — và không phép đo nào bắt được.** Đo 2026-09-05: `SiegeEngine`
không có một `AudioClip` nào; nó chỉ gọi `EffectManager.Play` (HÌNH), mà cả **17 ô `clip` của
`EffectLibrary` đều TRỐNG** — cố ý, vì mọi tiếng của trận đánh vốn tới từ VŨ KHÍ hoặc GIỌNG
NÓI. Máy công thành rơi đúng vào kẽ giữa hai hệ: nó **không phải `WeaponBase`** nên bảng
`StickmanAudioBuilder.Library` không với tới, và phép đo *«vũ khí câm»* của Doctor cũng không
réo vì nó chỉ quét prefab vũ khí. Đại bác nã đạn trong im lặng hoàn toàn.
⚠ **Gắn ở `StickmanFortBuilder.AttachEngineAudio`**, không qua `Audio > 2`: máy công thành
**KHÔNG CÓ PREFAB** — nó dựng bằng code ngay trong builder scene, nên tool gắn-tiếng-vào-prefab
không có gì để gắn. Dùng lại clip CÓ SẴN (`Hit_Hammer` húc cổng · `Throw_Heavy` bật cần ·
`Explosion_Small` thuốc súng · `Bow_Shoot` dây nỏ · `Bash_Shield` ván cập bến), và **nạp
không được thì log warning** — không thì lại câm trong im lặng lần nữa.
⚠ **Bài học rộng hơn:** thêm một thứ GÂY SÁT THƯƠNG mà không phải `WeaponBase` thì tự hỏi
ngay *"ai phát tiếng cho nó?"* — hai hệ tiếng của dự án đều đi qua prefab vũ khí.

⚠⚠ **CẢ ĐOÀN XE TỪNG ĐỨNG CHÔN CHÂN VÌ MỘT CÁI TÊN TRÙNG (sửa 2026-09-07).** Triệu chứng
user báo: *"xe công thành user không điều khiển được, AI cũng không dùng nó"*. Gốc: `SiegeEngine`
đặt sổ tĩnh của mình đúng bằng tên `All`, nên nó **CHE** `Fortification.All`. Trong chính lớp
con, chữ `All` trần không còn nghĩa "mọi công trình" mà là "mọi máy công thành" —
`FindEnemyStructure` viết `var all = All;` rồi lọc `if (fort is SiegeEngine) continue;`, tức
duyệt một sổ toàn máy công thành rồi **bỏ qua đúng hết**, và luôn trả null. Hệ quả: xe phá
thành không bao giờ tìm ra cổng để húc, xe lên tường không bao giờ tìm ra tường để cập —
đứng im cả trận dù tổ máy đã ngồi đủ ghế. Biên dịch xanh (`SiegeEngine` LÀ `Fortification`),
không một dòng lỗi.
· Nay sổ máy tên là **`SiegeEngine.AllEngines`**; chỗ tìm mục tiêu ghi rõ `Fortification.All`.
· ⚠ **Lớp con của lớp CÓ SỔ TĨNH thì đừng đặt sổ riêng trùng tên.** Doctor có phép đo
  *«Lớp con CHE hàm thông điệp / sổ tĩnh của lớp cha»* — đo bằng phản chiếu, không cần scene.

⚠⚠ **UNITY CHỈ GỌI HÀM THÔNG ĐIỆP Ở LỚP DẪN XUẤT NHẤT.** `Fortification` khai
`private void OnEnable/OnDisable/Update`, còn `SiegeEngine` (và `SiegeLadder`) khai lại đúng
tên đó — nên bản của lớp cha **không bao giờ chạy**: cỗ máy nằm ngoài `Fortification.All`,
ngoài `RepairSites` (thợ không vá được cái xe dù builder khai `repairable: true`), và
`LaneNav` không được báo bẩn. C# cũng **không** kêu CS0108, vì thành viên private của lớp cha
vốn không nằm trong tầm nhìn của lớp con — hỏng hoàn toàn trong im lặng. Nay ba hàm ấy là
`protected virtual` ở `Fortification`, `protected override` + gọi `base` ở hai lớp con.

⚠⚠ **Ô NHẮC KHÔNG ĐƯỢC LỌC THEO `HasFreeSeat`.** Bản đầu của `SiegeEnginePrompt.FindEngine`
bỏ qua cỗ máy đã kín ghế — mà từ ngày `AISiegeCrewModule` chạy thì ghế máy phe mình gần như
**lúc nào cũng kín**, nên người chơi đứng sát khẩu đại bác của chính mình mà không thấy ô nào
hiện ra, và cả nhánh "đuổi một AI nhường chỗ" (`EvictOne`) trong `Take` thành code chết vì
không bao giờ tới được. Việc của `FindEngine` chỉ là CHỌN cỗ máy gần nhất; ai được ngồi là
chuyện của `Take`.

**DẤU TRÊN F9** (`⚙xe phá thành ĐANG ĐẨY` · `⚙đại bác (thiếu 1)`): module tổ máy **giành tay
lái** khỏi state để kéo người ra khỏi tuyến, và việc đó VÔ HÌNH — nhìn vào chỉ thấy một anh
lính bỏ hàng đi đâu đó. Đúng luật F9 đã ghi: *"thêm một cơ chế lái chân nhân vật thì thêm luôn
một dấu ở đây"*. Hỏi ngược qua `SiegeEngine.SeatedOn` (sổ máy luôn rất ít) thay vì bắt agent
giữ thêm field — ghế là sự thật nằm ở CỖ MÁY, nhân đôi sang agent là hai chỗ nói ngược nhau.

**NỎ CỐ ĐỊNH** (`SiegeEngineKind.FixedBallista`) — giá ba chân cắm đất, **MỘT người**, nạp
**5.5 s** (chậm nhất họ nỏ) đổi lấy một phát **16 sát thương**, tầm 24, đạn bay 28 (gần như
thẳng). ⚠ Nó hỏi CÂU KHÁC `Ballista`, không phải "cùng thứ với vài con số khác": nỏ xe cần tổ
hai người và đi theo đoàn công thành, còn cái này là vũ khí PHÒNG THỦ đặt sẵn ở chốt — câu hỏi
của nó là *"có đáng để MỘT người rời tuyến ra đứng bắn không"*. Art vẽ **giá ba chân, không
bánh xe**: nhìn là biết nó không đi đâu cả.
⚠ **Xe lên tường cập bến là ghế MỞ HẾT** — tổ đẩy xong việc, `TryStartClimb` sẵn có tự thấy
thang trong xe. Không viết đường trèo riêng. **Thang trong xe cao đúng `CastleWall.walkY`**
(builder truyền `towerTopY`) — xe chở thang tới, không tự đo; lệch là trèo tới đỉnh rồi hụt chân.
⚠ **Xe chỉ húc thứ PHÁ ĐƯỢC** (`IsIndestructible` bị loại) và **KHÔNG húc máy/thang** cùng
sổ `Fortification.All`; `Tower` chỉ cập vào thứ **có nóc đi được** — cập vào cổng là trèo lên
nóc cổng rồi đứng đó.
⚠ **Mốc tuyến bị KẸP chứ không bị THAY**: xe tới nơi (đang húc / đã cập bến) là
`TryNearestAdvancing` không trả nó nữa và tuyến tự do. Vẫn là DỜI CỘT MỐC, không `SetBehavior`.
⚠ `escortSiegeEngines` là field MỚI ⇒ asset học thuyết đã bake nhận `false`; hai hàm
`EnsureRaidDoctrine` / `EnsureDoctrine("Doctrine_Aggressive")` ghi tay `true` — đúng luật
*"tool phải ghi ĐỦ mọi trường nó làm chủ"*.
⚠ **Playbook khai `modules` tay phải nối `AIModuleKind.SiegeCrew`** — đã nối cho cả ba
danh sách tay; và Doctor nay có phép đo *«Playbook khai modules tay mà thiếu module TỰ TẮT»*
(Resupply · SiegeCrew) để lần thêm module thứ tư không lặp lại cái bẫy đã dính ba lần.
⚠ Art năm loại là VẼ BÙ bằng code (`StickmanBuildingArt.Siege*`); art thật đặt ChatGPT, thả
PNG cùng tên vào `Sprites/Buildings/Default/`. `Siege_Tower.png` phải khổ CAO — builder co
theo chiều cao mặt tường.
⚠ Công thức JSON có `engines[]` (`kind · x · team · crew · hp · facing · towerTopY`) — AI yếu
thêm máy vào màn bằng một dòng, không đụng builder.
⚠ **PHẢI DỰNG LẠI** `Demo_26_Raid` (tướng cướp mới đi cùng xe) và bấm *Bộ AI theo gameplay*
(playbook có module mới) — cả hai đã VÀNG trên Bảng điều khiển vì `SiegeEngine.cs` /
`AISiegeCrewModule.cs` nằm trong `extraSources`.

