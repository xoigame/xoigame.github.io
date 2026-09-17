## ⚠⚠ BAY — BỐN ĐƯỜNG LÊN TRỜI, MỘT SỔ, MỘT LUẬT ĐÁP TRẢ (2026-09-10)

User: *"thêm loại stickman có cánh có thể bay được… vừa có cánh bay, bay trên khinh khí cầu,
và cưỡi quái bay như cưỡi rồng, chim"*.

Trước đợt này dự án đã có **ba** thứ biết bay, và cả ba đều không nói chuyện được với AI:

| Đã có | Ở đâu | Tầng |
|---|---|---|
| Quái bay (`FantasyAirRaider`) — harpy · rồng · imp · wisp · gryphon | Gameplay | 4 |
| Khinh khí cầu (`Aircraft.Balloon`) — sàn bắn biết bay | Gameplay | 4 |
| Cưỡi quái bay (`FantasySkyMount`) — trèo lên lưng rồi lái | Gameplay | 4 |
| Khinh công võ lâm — vọt lên rồi liệng | Combat | 1 |

Thứ **thiếu** là cái user hỏi đầu tiên: một **bộ binh biết cất cánh**. Và thiếu cả một thứ
không ai để ý: **phe dưới đất không có mắt nhìn lên**.

---

### 1. HAI KHÁI NIỆM BỊ GỘP LÀM MỘT — VÀ ĐÓ LÀ CÁI HỎNG TO NHẤT

`StickmanLocomotion.IsAirborne` = `!IsGrounded && !IsClimbing`. Nghĩa THẬT của nó là
*"đang NHẢY hoặc đang RƠI"* — mất điều khiển, kéo dài vài phần mười giây. Khoảng chục cổng
trong `StickmanAgent` đọc nó với nghĩa *"lúc này chưa làm gì được, chờ tiếp đất"*.

Kẻ BAY thì lá cờ đó bật **suốt trận**. Ghép hệ bay vào đúng nó là:

- `TryStartClimb` không bao giờ chạy · `CanEvadeVertically` luôn `false` · nấp/thụp bị chặn;
- và nặng nhất: `TargetOnAnotherLevel` **trả `false`** cho mục tiêu bay (vì luật cũ nói
  *"địch đang nhảy KHÔNG tính là tầng khác"* — đúng với cú nhảy, sai với đôi cánh). Hậu quả
  đo được: một kẻ bay lượn ở cao 6 đơn vị bị xếp vào **CÙNG TẦNG**, nên cả tiểu đội cận chiến
  đứng ngay bên dưới **vung kiếm vào không khí tới hết trận**. `TargetOutOfVerticalReach`
  không bao giờ bật ⇒ không ai đổi mục tiêu, không ai đi tìm cung. **Không một dòng log nào.**

⚠⚠ **Hai khái niệm, hai lá cờ.** `IsAirborne` giữ nguyên nghĩa cũ; bay là
`StickmanLocomotion.IsFlying` — một thuộc tính hỏi ngược `StickmanWings`, đúng khuôn
`IsMounted` đã có. Nhân vật không có cánh thì `_wings` mãi null ⇒ luôn `false` ⇒ **hành vi y
hệt trước**. Đó là lý do thêm được ô này vào file nhạy cảm nhất dự án mà không đổi gì của ai.

⚠ **KHÔNG nhét trạng thái bay vào `StickmanLocomotion`.** Luật này đã ghi ở
[Wuxia.md](Wuxia.md) khi khinh công chọn ghi thẳng `linearVelocity`: file đó nhiều hệ dựa vào
nhất dự án, thêm một ô là mọi nhân vật của mọi thể loại đổi hành vi nhảy/rơi. `StickmanWings`
tự ghi `linearVelocity` và tự quản `gravityScale`.

---

### 2. SỔ TRỜI — `AirLayer` (Combat, tầng 1)

Tầng AI (2) **không tham chiếu lên Gameplay (4) được**, nên bộ não bộ binh không có cách nào
hỏi *"có ai trên trời không"*. Đó là lý do trước nay **chỉ ụ pháo phòng không** (`Vehicle._antiAir`,
cũng tầng 4) biết máy bay tồn tại.

`AirLayer` đặt ở Combat vì nó cần `TeamMember`; AI · Units · Gameplay đều đọc xuống được.
**Cả bốn đường lên trời cùng ghi vào đây**, nên thêm đường thứ năm mai sau là *không phải sửa AI*.

| Ai ghi sổ | `AirKind` | Ghi ở đâu |
|---|---|---|
| Stickman có cánh | `OwnWings` | `StickmanWings` |
| Quái bay | `Beast` | `FantasyAirRaider` |
| Khinh khí cầu / máy bay | `Balloon` | `Aircraft` |
| **Người NGỒI trên thứ đang bay** | theo cái chở | `VehicleRider` |

⚠⚠ **Người cưỡi phải TỰ KHAI.** `VehicleRider.SitAt` ghim bằng TOẠ ĐỘ chứ không đổi cha, nên
`AirLayer` không suy ra được bằng cách dò cây transform. Thiếu vế này thì người đứng trong giỏ
khinh khí cầu và người cưỡi rồng bị xếp vào cùng tầng với bộ binh — cả tuyến cận chiến xúm
dưới bụng quả cầu vung kiếm.

⚠ `VehicleRider.IsFlyingNow` hỏi chủ chỗ ngồi bằng `GetComponentInParent`, **KHÔNG** gọi
`AirLayer.IsFlying`: sổ trời duyệt qua chính nó để trả lời ⇒ **đệ quy vô hạn**.

⚠ `AirLayer.GroundAt` là **một bản duy nhất** cho cả bốn đường. `FantasyAirRaider` từng đo cao
độ từ `y = 0` tuyệt đối và con rồng lượn trong lòng đồi trên mọi map có địa hình.

---

### 3. STICKMAN CÓ CÁNH — `StickmanWings` + `WingSpec`

Khác `FantasyAirRaider` ở một điểm quyết định: con quái bay **sinh ra trên trời và sống trên
trời**, bộ lái sở hữu chuyển động cả trận. Cái này là bộ binh **MƯỢN** bầu trời rồi trả lại:
nó đi bộ, đánh nhau, leo thang, cất cánh khi cần, đáp xuống đánh tiếp bằng đúng FSM cũ.

**Bốn kiểu cánh, bốn quyết định khác nhau** (`WingSpec.Of` — một bảng là nguồn của tất cả):

| | `cruiseSpeed` | `glideSink` | `ceiling` | `hoverDrain` | Lúc nào muốn |
|---|---|---|---|---|---|
| `Feathered` | 4.6 | **0.78** | 6.4 | 11 | liệng giỏi nhất — lối vào-ra |
| `Bat` | 5.4 | 1.35 | 7.5 | **17** | bổ nhào nhanh nhất, KHÔNG ngồi lì được |
| `Insect` | 3.5 | 0.55 | **4.6** | **3.5** | sàn bắn di động, đổi lại trần thấp ⇒ luôn trong tầm cung |
| `Powered` | 6.2 | **3.2** | **11** | 22 | an toàn nhất, đổi lại hết nhiên liệu là rơi thẳng |

⚠⚠ **THỂ LỰC DÙNG CHUNG VỚI NƯỚC RÚT**, cố ý. Bay và chạy rút cùng rút một bể
(`StickmanLocomotion.AddStamina`) nên bay là một QUYẾT ĐỊNH có giá, không phải trạng thái luôn
bật. Đẻ thanh thứ hai là bay thành miễn phí. Đây cũng là **toàn bộ đường phản đòn của phe dưới
đất** — xem mục 4.

⚠ **Gánh nặng vũ khí** (`WeightPenalty`) dùng lại đúng bảng `WeaponBase.Weight` đã có, không
đẻ bảng thứ hai. Cầm cây nặng nhất thì thời gian bay rụng quá nửa ⇒ chọn vũ khí và chọn lối
đánh là MỘT quyết định.

⚠ **Trả trọng lực ở CẢ HAI cửa ra** (`Land` và `OnDisable`). `StickmanLocomotion` đã dính đúng
bẫy này: component ngừng chạy giữa lúc `gravityScale = 0` thì nhân vật **kẹt lơ lửng tới hết
trận**, không lỗi nào báo.

**Phím:** NHẢY khi ĐANG TRÊN KHÔNG = bung cánh (mượn đúng khuôn khinh công — không tốn thêm
phím nào). W/S = lên/xuống · A/D = ngang · thả cần = LIỆNG · giữ S sát đất = cụp cánh đáp.
Cảm ứng đọc `MoveAxis`/`ClimbAxis`, cờ mời bấm là `StickmanTouchInput.WingsAvailable` /
`WingsFlying` (ghi MỖI FRAME, khuôn `MountAvailable`).

---

### 4. TRÊN TRỜI THÌ ĐÁNH NHAU KHÁC — `AirCombat`, MỘT CỬA

Ba luật, gọi từ `StickmanController.TakeDamage` — cửa mà **mọi** đòn của **mọi** phe đều qua.
Cùng khuôn `ArpgCrit.Active` / `StickmanFlankBonus.Active` ngay cạnh nó; `AirCombat.Active`
đóng khi trời trống nên màn không có ai bay chỉ trả một phép so số.

| Luật | Ai chịu | Vì sao PHẢI có |
|---|---|---|
| **Bổ nhào cộng sát thương + lực** theo `DiveCharge` (tốc rơi THẬT) | người dưới đất | cho kẻ bay LÝ DO xuống thấp; không có thì lượn cao là lối chơi tối ưu duy nhất |
| **Trúng đòn giữa trời bào thể lực** (`hitStaminaLoss`) | kẻ bay | **đường BẮN HẠ của bộ binh**; không có thì bay là bất khả xâm phạm |
| **Đòn phòng không +75%** vào mục tiêu bay | kẻ bay | cho phe dưới đất một LỰA CHỌN chuẩn bị, không chỉ chịu trận |

⚠ Thưởng bổ nhào theo `DiveCharge` (0…1) chứ không phải một cục cố định: bổ hụt gần hết đà thì
gần như không được gì — đó chính là thứ biến cú bổ thành quyết định về THỜI ĐIỂM.

⚠ Bào thể lực tính trên con số **ĐÃ** cộng thưởng phòng không, không thì cây phòng không chỉ
hơn cây thường ở thanh máu.

---

### 5. AI — `AIWingModule` (`AIModuleKind.Wings = 22`)

⚠⚠ **KHÔNG có nhánh chiến đấu thứ hai cho lúc đang bay.** Bay xong vẫn ngắm bằng vũ khí cũ,
vẫn `CombatStrategy` cũ. Bài học đã ghi ở `FantasyAirRaider.Perch` và `FantasySkyMount`
(*"KHÔNG VIẾT HỆ BAY THỨ HAI"*). Module chỉ làm ba việc: CẤT CÁNH · LÁI · ĐÁP.

**Bốn lý do cất cánh, hỏi theo thứ tự sống-còn trước:**

1. **THOÁT VÂY** — bị ≥3 địch trong 1.9 đơn vị;
2. **SĂN KẺ BAY** — mục tiêu đang bay;
3. **VƯỢT** — `TargetOutOfVerticalReach` (đôi cánh THAY cho việc đi tìm thang);
4. **BỔ NHÀO** — địch dưới đất trong `VisionRange × 0.55`.

⚠⚠ **PHẢI CÓ TRỄ HAI ĐẦU** (`MinAirTime` 1.4 s + `TakeOffCooldown` 2.2 s). Không có thì điều
kiện lật qua lật lại từng frame và nhân vật **nhấp nhô lên xuống tại chỗ** — cùng hình dạng lỗi
với ngưỡng rời trận của `AIStateCombat`.

⚠ **Đáp SỚM hơn lúc cạn sức** (`LandStaminaPercent` 0.22): bay tới giọt cuối là RƠI, mà rơi thì
mất lái + ăn sát thương rơi. Người chơi được phép liều, AI thì không nên tự sát vì hết xăng.

⚠ Chưa đủ cao hơn địch thì **LẤY ĐỘ CAO trước**. Bay ngang tầm rồi bổ là bổ vào lưng ghế:
không tốc rơi ⇒ không thưởng, và cú đánh đọc ra như một cú va chạm.

---

### 6. HÌNH VÀ NHỊP VỖ — `StickmanWingRig`

Neo y hệt `StickmanLook.BodyLayer`: **con cứng của xương `body_2`**, đặt ở mốc khớp vai, xoay
−90°. Không stabilizer, không góc nghỉ chụp lúc `Setup` — nên không có cái góc nghỉ nào để sai
khi quân sinh giữa trận hoặc hồi sinh (lỗi *"chi tiết nhảy chỗ khi quay"* 2026-09-09).

⚠⚠ **TÊN OBJECT LÀ HỢP ĐỒNG** — `WingFar` · `WingNear`. Cùng luật `WingL`/`WingR` của
`FantasyCreatureLook`: đổi tên là bộ chuyển động tìm không thấy và **cả hệ vỗ cánh câm lặng**.

⚠ **Cả hai cánh ở SAU lưng** (dưới `StickmanSorting.Body`). Cho cánh gần lên trước thân là nó
che mặt, che vũ khí, che cả cú đánh.

⚠ Hai cánh vỗ **lệch pha** 0.55 rad. Vỗ trùng khít thì hai tấm chồng làm một và đôi cánh đọc ra
như MỘT tấm bìa.

**Nhịp vỗ do PHA BAY quyết định, không do kiểu cánh** — cùng luật `FantasyRaceMotion.FlapByFlight`:
bổ nhào thì CỤP (trọng lượng nằm ở chỗ nó THÔI vỗ) · vọt lên thì vỗ mạnh nhất · **bị bắn rơi thì
XOÃI, biên độ 0** (rơi mà vẫn vỗ hết cỡ là hình nói "đang cố bay lên" trong khi thân đi xuống).

`FlightPhase` (Core) là từ vựng CHUNG — đổi tên từ `FantasyFlightState`, an toàn vì trường
`_state` là `private` **không** `[SerializeField]` nên không scene/prefab nào bake tên kiểu.

**Art:** `Resources/Wings/Wing_<KiểuCánh>.png`, sinh bằng «★ Vẽ lại CÁNH stickman». Cả bốn tấm
đi qua `FantasyRaceSilhouetteArt.EmitWing` — dùng lại đúng ba hình cánh đã trả giá bằng ba lỗi
hình (lông vũ tam giác nhọn ra "mớ vụn"; màng dơi nối thẳng đỉnh ngón thành "máy bay giấy";
lông vũ xếp chồng ngang ra "bìa các-tông"). Bản đẹp vẫn là đường ChatGPT; code chỉ VẼ BÙ.

---

### 7. BỐN MẢNH, BỐN TẦNG — VÀ PHÉP ĐO CANH CHÚNG

Một bộ cánh chạy được cần bốn thứ, thiếu cái nào cũng **biên dịch xanh, không log**:

| Mảnh | Ở đâu | Thiếu thì |
|---|---|---|
| `StickmanWings` | Combat | không ai bay |
| `StickmanWingRig` + PNG | Combat + Resources | **bay mà KHÔNG CÓ CÁNH** — đọc ra là lỗi vật lý, đi tìm sai chỗ |
| `AIModuleKind.Wings` trong playbook | Editor | con máy **không bao giờ cất cánh** |
| `StickmanLocomotion` (thể lực) | Combat | `CanTakeOff` `false` vĩnh viễn — *"bấm bay không ăn"* |

⚠ **Cửa duy nhất lắp đúng**: `StickmanDemoBuilder.AddWingsShared` (lo mảnh 1 + 2). Mảnh 3 ở
playbook nên hàm đó không với tới — đó là lý do phải có phép đo.

**Bốn Check trong `StickmanDoctor.Flight.cs`** (đọc thẳng file text, không mở scene):
*"Cánh không có hình"* · *"Cánh mà AI không biết bay"* · *"Cánh không có thể lực"* ·
*"Kẻ bay mà không ai đáp trả được"*.

⚠ Check cuối là phép đo về **VÁN CHƠI**, không về code: màn nào có kẻ bay mà phe kia toàn cận
chiến thì mọi mảnh đều đúng, chỉ có trận đánh là hỏng.

---

### 8. BÀI KIỂM — `Genre_Fantasy_Sky` (FT · Không chiến)

⚠⚠ **Hệ bay dựng trên sân trống không chứng minh được gì**: bay lên rồi đáp xuống đúng chỗ vừa
đứng, người xem đọc ra là hiệu ứng trang trí. Bài này có **toà thành có cổng**, nên đôi cánh
thành một quyết định đọc được: quân bộ phải phá cổng, kẻ có cánh bay thẳng qua nóc.

| Đo cái gì | Nhìn vào đâu |
|---|---|
| Cánh đưa được qua tường | người chơi qua nóc, quân bộ dồn ở cổng |
| Thể lực LÀ cái giá thật | treo tại chỗ rụng nhanh nhất; cạn là RƠI |
| Bộ binh đáp trả được | cung thủ `Garrison` trên mặt tường bắn lên, mỗi phát bào thể lực |
| Cận chiến BỎ mục tiêu bay | lính giáo không đứng vung giáo vào không khí |
| AI tự biết cất cánh | con quỷ cánh dơi phe đỏ tự bung cánh |

⚠ Phe đỏ có **đúng một** con biết bay: cho cả tuyến bay là không còn ai ở dưới để thấy sự khác
nhau giữa hai con đường — mà đó là toàn bộ nội dung của bài.

---

### 9. LIÊN QUAN

[Fantasy.md](Fantasy.md) mục 7–8 (quái bay · rồng ba pha) · [Vehicles.md](Vehicles.md) mục 12
(khinh khí cầu) · [Wuxia.md](Wuxia.md) (khinh công — đường lên trời thứ tư) ·
[AI.md](AI.md) (module · `TargetOnAnotherLevel`) · [CharacterLook.md](CharacterLook.md) (neo
overlay lên xương thân) · [AssetGeneration.md](AssetGeneration.md) (luật vẽ bù).
