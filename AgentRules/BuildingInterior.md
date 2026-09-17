## ⚠⚠ ĐI VÀO CÔNG TRÌNH — HAI LỚP · Ô HỎI VÀO · AI TỰ VÀO RA

Bộ dựng: `Assets/Scripts/Map/Structure/BuildingInteriorKit.cs` · `StructurePartSet.HaiLop.cs` ·
`StructureAssembler.OpenBay`. Bộ chạy: `Assets/Scripts/Combat/Structures/BuildingInterior.cs` ·
`BuildingEnterPrompt.cs` · `Assets/Scripts/AI/Work/BuildingVisitDirector.cs`.
Art: `Assets/Editor/Art/StickmanStructureArt.HaiLop.cs` + `.HaiLopDoDac.cs`.
Bản ráp thử: `.claude/skills/stickman-assets/scripts/two_layer_building.py`.
Nền tảng (chi tiết · văn phạm · pivot): [StructureKit.md](StructureKit.md).

### 1. THUẬT TOÁN HAI LỚP — MỘT CÔNG THỨC, HAI PHÉP CHIẾU, **CÙNG MỘT KHỔ**

User: *"khi đi vào thì nó có chi tiết bên trong, có nghĩa là bạn phải vẽ 2 lớp, 1 lớp bên ngoài
và 1 lớp bên trong… thuật toán tạo 2 lớp"*, rồi *"kích thước ở layer bên ngoài và layer bên
trong phải khớp nhau"*.

**Bệnh cũ:** `Part_House_Floor*` và `Part_Room_*` là hai hàm vẽ TAY RIÊNG BIỆT, còn `OpenBay`
bốc gian trong bằng `Pick(Interior)` — một lần tung xúc xắc **không hỏi bức tường vừa dựng**.
Nhà ĐÁ mở ra thấy vách KHUNG GỖ. Từ ngoài không ai phát hiện; chỉ người **bước vào** mới thấy.

| Dùng chung | Mặt ngoài 260×120 | Mặt trong 260×120 |
|---|---|---|
| `WallFace()` — một hàm tô vật liệu, cờ `inside` tối 38 % + đổi hướng sáng | mặt tường | vách sau |
| `PostXs()` — nhịp cột | cột khung gỗ | **xà trần** |
| `BayXs()` — nhịp ±0.32 | (cửa sổ do văn phạm đặt đè) | **ô sáng vách sau** |

**16 kiểu nhà × 2 lớp = 32 tấm**: gạch nung · gỗ súc · đất trình tường · phên trát bùn · đá quý
tộc · nhà nguyện · kho hàng · cối xay · chuồng ngựa · hầm rượu · chung cư · văn phòng · cửa hàng
· nhà xe · trạm y tế · kho quân nhu.

⚠⚠ **CÙNG KHỔ LÀ THỨ MỞ KHOÁ TẤT CẢ.** Bản đầu vẽ phòng 150×100 rồi co về `coreW × 0.62` — một
Ô CỬA nhìn vào, không phải một CĂN PHÒNG. Hệ quả đo được: cửa sổ hai lớp **không thể** thẳng
hàng (cửa sổ ngoài ở ±0.32 bề ngang TẦNG, ô chỉ rộng 0.62 ⇒ cửa sổ trong phải ở ±0.52 bề ngang
PHÒNG = ngoài khung ảnh). Cho hai tấm cùng khổ thì ràng buộc ấy biến mất: **1 px trong = 1 px
ngoài**. *(Luật cũ «hai lớp không thể thẳng hàng» ĐÃ BỎ — nó chỉ đúng với cỡ cũ.)*

⚠⚠ **BA CHỖ, MỘT CON SỐ.** Cỡ 2.6×1.2 khai ở: `ShellW/H` = `RoomW/H` (art) · cặp
`House_Floor_X` + `Room_X` (bảng) · `OpenBay` (đọc cỡ khai của tấm gian trong để mở ô). Lệch một
chỗ là gian trong bị co/kéo và hai lớp thôi trùng pixel — Doctor «Hai lớp…» đo đúng vế này.

⚠ **`OpenBay` MỞ Ô THEO CỠ KHAI CỦA TẤM GIAN TRONG**, không phải một hệ số cứng. Tấm khai đúng
khổ tầng ⇒ phủ TRỌN; 14 tấm CŨ khai 1.5×1.0 ⇒ mở theo đúng tỉ lệ của chúng, tức **giữ nguyên
hành vi cũ** thay vì bị kéo dãn. Nới cỡ không phá bản cũ.

⚠⚠ **MỞ TRỌN BỀ NGANG CHỈ KHI CHẮC CHẮN SẼ BỊ GIẤU** (`fullBay`). `BuildingInteriorKit.FitsShelter`
là **một nguồn sự thật** cho câu *"căn này trú được không"*, và CẢ HAI bên phải hỏi nó: văn phạm
hỏi để quyết mở ô rộng bao nhiêu, `Apply` hỏi để quyết có dựng `BuildingInterior` không. Kê hai
bộ số là có một khoảng giữa chúng — nhà mở toang mà **không ai đóng lại**: đứng ngoài nhìn thấy
hết ruột, không lỗi nào báo.

⚠⚠ **KHÔNG VẼ CỬA SỔ Ở LỚP NGOÀI.** Văn phạm đặt `PartSlot.Window` ĐÈ LÊN tấm tầng. Vẽ sẵn ô
kính là mỗi căn có HAI hàng cửa sổ chồng nhau. Mọi `Part_House_Floor*` cũ đều là TƯỜNG TRƠN.

⚠⚠ **GHÉP ĐÔI BẰNG TÊN: `House_Floor_<X>` ↔ `Room_<X>`** (`StructurePartSet.PairedRoom`). Không
phải luật bịa mới — bảng cũ đã tự tuân thủ ở 6 dòng. Thiếu bạn đôi thì **rơi về bốc ngẫu nhiên**
(nhạt đi, không gãy), nên an toàn hơn một field bắt buộc.

⚠⚠ **GIỮA PHÒNG LÀ CHỖ NGƯỜI ĐỨNG.** Stickman cao ~1.7 world trong tầng cao 1.2 ⇒ thân người
phủ kín cột giữa. Lò sưởi vẽ chính giữa là lò sưởi **không ai thấy bao giờ**. Đồ bám hai vùng
mép (0.045 / 0.63), chừa giữa ~34 %.

⚠⚠ **PHÒNG RỘNG RA THÌ THÊM ĐỒ, KHÔNG KÉO DÃN ĐỒ.** Đổi 1.5 → 2.6 world; nhân toạ độ lên 1.73
là ra thùng rượu BÉO, giường dài như thuyền. Mỗi món vẽ ở **cỡ thật** rồi neo vào vùng.

⚠ **ĐO BẰNG BẢN RÁP THỬ, ĐỪNG ĐOÁN.** `two_layer_building.py` ráp đúng thứ tự tường → cửa sổ →
gian trong → **NGƯỜI cao 170 px**. Cả ba luật ⚠⚠ ở trên chỉ lộ ra ở bước ráp, không lộ ra khi
nhìn từng tấm art rời. Thước sai (người 73 px) thì bản ráp **nói dối theo hướng dễ chịu**.

**Thêm một kiểu nhà = ĐÚNG HAI dòng**: một ở `Shells` (art), một cặp `House_Floor_X` + `Room_X`
(bảng). Không viết thêm hàm vẽ nào.

### 2. Ô HỎI "VÀO NHÀ KHÔNG?" — `BuildingEnterPrompt`

User: *"khi user đi ngang thì nó hiện popup hỏi vào không, nếu user bấm vào thì vào công trình"*.

⚠⚠ **CƠ CHẾ ĐÃ CHẠY ĐÚNG TỪ 2026-09-09, NHƯNG VÔ HÌNH Ở 50 SCENE.** `BuildingInterior.AtDoor`
(lời mời) chỉ được ĐỌC ở **đúng một chỗ**: `MapBattleRoyale.Hud`. Ở map trung cổ, thế giới mở,
đấu trường, MOBA, doanh trại… người chơi đứng trước cửa, "bấm LÊN để vào" chạy đúng, mà không có
gì trên màn hình nói cho họ biết. *Một cơ chế không ai biết là một cơ chế không tồn tại* — cùng
bài học thanh đỡ đồng đội dậy.

- Ô là `GUI.Button` (chạm được), đi qua `StickmanPromptArbiter` với `PriorityEnterBuilding = 25`
  — trên cổng làng (20), dưới lên ngựa (30). Không qua trọng tài thì sáu ô chồng lên nhau.
- Gắn ở **cấp scene** (`BuildingEnterPromptBootstrap`, khuôn `StickmanMountPromptBootstrap`) nên
  có mặt ở mọi chế độ kể cả scene bake từ lâu. Chỉ gắn khi scene có `PlayerCharacter`.
- **Ô RA phải hiện suốt lúc đang ở trong.** "Đi khỏi khuôn nhà là ra" đúng trên desktop, nhưng
  một tầng rộng 2.6 trên màn hình điện thoại thì người chơi không biết mép nhà ở đâu — không có
  đường ra tường minh là **ngõ cụt** (bài học ô XUỐNG NGỰA).
- ⚠ `RequestEnter()` chỉ **giơ tay xin**, `PlayerInside` mới duyệt (`Contains` + tầng trệt). Đặt
  `_playerIn = true` thẳng từ nút là gian trong bật lên giữa đồng và không gì kéo họ ra.
- ⚠ Lời xin sống **đúng một nhịp** — `Forget()` xoá ở mọi nhánh thoát. Giữ lại là bấm hụt một
  lần rồi lần sau đi ngang **tự dưng vào nhà**.
- ⚠ `Act()` chốt một lần mỗi frame: một cú chạm có thể vừa kích đường cảm ứng vừa sinh click
  IMGUI ⇒ VÀO rồi RA ngay, nhìn ra là "bấm không ăn".

### 2b. ĐI NGANG ≠ Ở TRONG — BA CÁI VAN, VÀ NGƯỜI XEM KHÔNG BAO GIỜ BỊ GIẤU

User (2026-09-09, thế giới mở): *"trong chế độ GTA khi đi qua mấy căn nhà nó bị lúc hiện lúc ẩn"*.

Một dãy phố `MapOpenWorld` là nhà rộng **3.2–8** nối nhau, hẻm chỉ **0.7–2** ⇒ khuôn nhà phủ
khoảng **ba phần tư** mặt đường, mà thân nhà là collider TRIGGER nên ai cũng đi xuyên. Ở chiến
trường (nhà đứng lẻ, đi vòng) lỗi này không lộ ra — chỉ một dãy phố liền nhau mới đủ dày. Ba
van, cả ba nằm trong `BuildingInterior`:

| Van | Bệnh nếu thiếu |
|---|---|
| **`IsViewer` — người xem không bao giờ bị giấu** | Phép giấu lọc theo `TeamMember` + `StickmanFighterController`, mà NGƯỜI CHƠI đúng cả hai. Từ khi "vào nhà" là một QUYẾT ĐỊNH, đi ngang nhà = *người xem ĐỨNG NGOÀI* (chưa bấm) + *cái thân Ở TRONG* (đúng toạ độ) ⇒ hệ **tắt renderer của chính người xem**. Nhân vật nhấp nháy suốt dãy phố. |
| **`StillDrift` — đồng hồ ở lại chỉ chạy khi ĐỨNG LẠI** | Ô chờ `HideDwell` 0.6 s không cứu được: đi bộ 2.2 world/giây thì băng qua một căn mất **1.5–3.5 s**, dư giờ. Người qua đường vẫn tắt ở giữa nhà, hiện lại ở hẻm, tắt tiếp ở căn sau. Mốc phải **dời theo chân** rồi đếm lại từ đầu. |
| **`UpPressed` đo SƯỜN LÊN, không đo phím đang giữ** | W/↑ là phím LEO (`HandleTraversalInput`), và cần ảo đẩy chéo lên cũng cho `StairAxis > 0.4` suốt quãng chạy. Đọc "đang giữ" là chạy dọc phố **vào rồi ra từng căn**, gian trong bật/tắt liên tục. Sườn lên đo **một lần mỗi khung hình cho CẢ dãy** (`_upFrame`): mỗi căn tự nhớ thì căn hỏi trước ăn cú bấm, các căn sau chỉ thấy "đang giữ". |

⚠ Van thứ hai **không** làm mất tính năng: người giữ chốt trong nhà (`AIStateGarrison`,
`BuildingVisitDirector`) đứng yên nên vẫn bị giấu như cũ. Phép thử giữ đúng quan hệ giữa hai con
số nằm ở «★ Tự kiểm luật chơi», nhóm *Nhà vào được: đi ngang KHÔNG bị giấu*
(`BuildingInterior.DwellQualifies` — phép toán thuần).

⚠⚠ CÒN LẠI, CHƯA SỬA: `BuildingInterior.Hidden` (MẮT AI) vẫn đo bằng `DeepInside` thuần, nên
cảnh sát/lính tuần **mất dấu người chơi chỉ vì họ đi ngang khuôn một căn nhà**, trong khi cái
thân vẫn hiện rõ trên màn hình. Muốn siết thì siết ở ĐÚNG MỘT CHỖ: cho `Hidden` hỏi cùng câu
hỏi *"ai đang thật sự trú trong đây"* (người chơi: `PlayerIsIn`; AI: đã bị giấu), đừng viết một
phép đo "có bị che không" thứ hai.

### 3. AI TỰ VÀO VÀ RA — `BuildingVisitDirector`

User: *"AI thì tự vào và ra"*.

⚠⚠ **CHỖ DUY NHẤT BẢO AI VÀO NHÀ TỪNG LÀ `MapBattleRoyale.Brain`.** Mọi chế độ khác, lính **đi
xuyên qua** căn nhà (thân nhà là collider TRIGGER) và không bao giờ dừng — tức cả hệ nhà-vào-được
chỉ có người chơi dùng.

**Không thêm một luật AI nào.** Bộ này chỉ giao việc rồi thu lại:

| Cần | Dùng lại |
|---|---|
| vào nhà rồi ở lại | `AIBehavior.Garrison` → `AIStateGarrison` tự tìm `GarrisonPost` gần nhất |
| chỗ đứng trong nhà | `GarrisonPost "Cho_Dung_Gac"` `BuildingInteriorKit` dựng sẵn (phe −1 trung lập) |
| leo lên gác | `StickmanClimbZone` / `StickmanStairs` của chính căn nhà |
| biến mất khỏi radar | `BuildingInterior.Hidden`, đã cắm sẵn trong `StickmanAgent` |

⚠⚠ **`SetKeepsOwnOrders(true)` LÀ BẮT BUỘC.** `CommandNode.ApplyToAgent` và
`MatchModeBase.TickOrders` ghi đè `SetBehavior` **mỗi nhịp**. Thiếu cờ này thì người vừa được
bảo vào nhà bị lệnh tuyến lôi ngược ra ngay giây sau — nhìn vào chỉ thấy *"AI đi tới cửa rồi
quay đầu"*, không lỗi nào báo. Khuôn `BeginCarryingPrize` / `CampHomeGuard` / `Escalade`.

⚠⚠ **NHỚ LỆNH CŨ + CÓ ĐƯỜNG THẢ Ở MỌI NHÁNH** (hết giờ · chết · nhà bị phá · `OnDisable`).
Người kẹt `KeepsOwnOrders` vĩnh viễn là một người lính **không nhận lệnh nữa cho tới hết ván**.
Trả về `Garrison` cũ thì kẹt trong nhà ⇒ đổi sang `HuntTarget`, đúng cách `EndCarryingPrize` xử.

⚠ **CHỈ GHÉ LÚC RẢNH**: bỏ qua người đang `KeepsOwnOrders` (tầng khác đang giữ họ), đang vác cờ,
đang `Flee`/`Garrison`/`Escalade`, và **người chơi** (họ có ô bấm riêng — giật quyền là đúng lỗi
`StickmanMountPrompt` đã sửa). Mỗi nhịp gửi **một** người: gửi cả nhóm là một tiểu đội biến mất
trong cùng một giây và người chơi đọc ra *"quân mình tự nhiên bốc hơi"*.

Số: xét lại mỗi 1.7 s · tầm 9 · mỗi căn ≤ 2 khách · cả sân ≤ 6 · ở lại 7–18 s (ngẫu nhiên để cả
xóm không cùng ra một lúc).

### 4. Chạy lại sau khi sửa

«Bộ chi tiết công trình lắp ghép (asset)» → «Tủ kính công trình lắp ghép (Demo_40)» → Doctor
(«Hai lớp — tầng nhà phải có gian trong ghép đôi» đo cả GHÉP ĐÔI lẫn KHỚP CỠ).
