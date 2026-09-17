## Coding conventions

- Serialized field: `[SerializeField] private Type _camelCase;` — KHÔNG dùng public field mới
  (field public cũ giữ tương thích qua `[FormerlySerializedAs]`)
- Null-check mọi reference serialized trước khi dùng (asset này hay bị thiếu wiring)
- Object pooling: dùng `UnityEngine.Pool.ObjectPool<T>` (xem `ArrowPoolManager`) — không tự viết pool mới
- Input: hỗ trợ cả touch và mouse (xem `GetInputDown/Hold/Up` trong ArcherPlayerController).
  **ĐIỆN THOẠI**: `StickmanTouchControls` (cần ảo + nút) ghi vào `StickmanTouchInput`,
  `StickmanFighterController` CỘNG THÊM vào bàn phím chứ không thay thế — bốn kiểu ngắm,
  tích lực, leo thang đều chạy nguyên đường cũ.
  ⚠ Hai luật bắt buộc: (1) tự hit-test `Input.touches`, KHÔNG dùng `GUI.Button` (IMGUI chỉ
  theo được MỘT chạm, mà phải vừa đi vừa đánh); (2) nút nào nhận ngón nào thì GIỮ CHỖ ngón đó
  (`ClaimFinger`) — phần ngắm/bắn chỉ dùng ngón chưa ai giữ, không thì bấm nút Nhảy cũng bị
  tính thành chạm-để-bắn. `StickmanTouchControls` để `[DefaultExecutionOrder(-100)]` cho
  chắc chắn chạy TRƯỚC controller.
  **BỐ CỤC BA VÙNG — mỗi ngón một việc, không tranh nhau:**
  · **nửa trái dưới = CẦN ẢO** — CHỈ lo "đi đâu": trái/phải là đi, dọc là leo thang/đu dây,
  kéo xuống mạnh là NGỒI;
  · **góc phải = NÚT** — ĐÁNH (to nhất) · NHẢY · ĐỠ · NHẶT · **CHẠY** · BÒ, hàng trên
  VŨ KHÍ · **KÉO / GIỮ / CHẠM** (ba KIỂU BẮN, chọn thẳng, mục đang dùng thì sáng) · CAM ·
  **+ -** (cỡ nhìn);
  · **chỗ trống còn lại = NGẮM & BẮN** (một ngón, neo ở NHÂN VẬT — xem luật ngay dưới);
  **HAI NGÓN** ở chỗ trống = lia camera (trung điểm dời) + đổi cỡ nhìn (khoảng cách đổi),
  bấm **CAM** là camera về lại nhân vật (thay phím `C`).
  ⚠ **CẦN ẢO CHỈ ĐƯỢC LO MỘT VIỆC.** Bản đầu nhét cả CHẠY (đẩy sát rìa) lẫn NHẢY (đẩy lên)
  vào chính cái cần đang điều tốc độ — và cả hai hỏng theo cùng một kiểu: ngưỡng nằm trên
  đúng trục mà ngón đang phải điều, nên không tách được ý định này khỏi ý định kia. Muốn đi
  nhanh mà không chạy thì không có cách; muốn chạy thì phải ghì ngón sát rìa suốt quãng
  đường, trôi vào trong một chút là tụt về đi bộ; đi chéo lên một chút là nhảy dựng. Người
  chơi đọc tất cả những cái đó ra thành đúng một câu: **"cần ảo không mượt"**. Nay CHẠY và
  NHẢY là NÚT (`_runFromStick` · `_stickUpJumps` mặc định TẮT); nút CHẠY **bấm nhát = CHỐT,
  giữ = chạy trong lúc giữ** (phân biệt bằng thời gian giữ, không đẻ nút thứ hai).
  ⚠ **QUA VÙNG CHẾT LÀ PHẢI ĐI ĐƯỢC NGAY** (`_minMoveAxis` 0.62, `_deadZone` 0.12).
  `StickmanLocomotion` nhân THẲNG trục đi vào tốc độ (`move * _walkSpeed`), nên trả `delta.x`
  thô là vừa qua ngưỡng 0.22 nhân vật lê chân ở 22% tốc độ. Cần ảo KHÔNG có lực hồi như cần
  thật — ngón không "cảm" được mình đang ở đâu trên cái đĩa đó, nên nửa trong của dải là dải
  KHÔNG ĐIỀU ĐƯỢC: phải remap `[deadZone..1] → [_minMoveAxis..1]`.
  ⚠ **GỐC CẦN CHẠY THEO NGÓN khi kéo quá rìa** (`_floatingStick`). Không có thì kéo lố hai
  lần bán kính rồi kéo ngược lại, cần vẫn báo "hết cỡ" cho tới lúc ngón đi hết quãng lố —
  người chơi đọc ra là "bấm không ăn". Cùng họ với luật vùng-chết/quán-tính của AI: chỗ nào
  có độ trễ giữa Ý ĐỊNH và PHẢN HỒI thì phải khử.
  ⚠ **TRỤC DỌC PHẢI CÓ VÙNG CHẾT RIÊNG + LUẬT TRỘI** (`_verticalDeadZone` 0.32, và |y| phải
  hơn |x| × 1.2). Dùng chung vùng chết với trục ngang là đi ngang mà ngón chệch lên/xuống một
  chút thì `ClimbAxis` khác 0 — mà `HandleTraversalInput` chỉ cần `|vertical| > 0.01` là BÁM
  NGAY vào thang/dây đứng cạnh đó, đúng thứ mà chú thích trong controller nói là "rất khó
  chịu" và cố tình chống. Kèm đó là ngồi thụp giữa lúc đang chạy chéo xuống.
  ⚠ **VÙNG BẤM RỘNG HƠN HÌNH VẼ** (`_touchPadding` 1.18) và nút phải **CÓ VIỀN TỐI**
  (`DrawDisc`): ngón che kín cái nút đang bấm nên không ai ngắm trúng tâm, còn một đĩa trắng
  alpha 0.22 thì trên nền trời sáng là không nhìn thấy gì. Nới VÙNG BẮT, đừng vẽ nút to lên —
  vẽ to là ăn mất chỗ nhìn trận đánh, thứ vốn đã thiếu trên màn hình điện thoại.
  ⚠⚠ **"KÉO THÌ NÓ XOAY LUNG TUNG" LÀ BỐN LỖI CỘNG LẠI, và cả bốn đều câm lặng.** Bản cũ biến
  chính nút ĐÁNH thành cần ngắm rồi lấy `AimVector = ngónHiệnTại − chỗChạmXuống`. Đo ra thì
  hỏng cả bốn mặt:

  ⚠ **CẬP NHẬT 2026-09-16 — GỐC KÉO CỦA `DragPull` QUAY LẠI TƯƠNG ĐỐI (A→B), theo quyết định
  của người dùng sau khi chơi thử.** Ba mặt còn lại (làm mượt · vùng chết · lật thân có quán
  tính) GIỮ NGUYÊN, và `PointAim`/`ClickShot` vẫn neo ở nhân vật. Chi tiết ở cuối mục này.

  | Mặt | Vì sao | Chốt chặn |
  |---|---|---|
  | **Gốc kéo TƯƠNG ĐỐI** | mốc VÔ HÌNH và ĐỔI MỖI LẦN BẤM ⇒ cùng một vị trí ngón cho ra hướng khác nhau ở mỗi phát; người chơi không có cách nào học được ánh xạ | `StickmanTouchInput.AimPointer` chỉ công bố **CHỖ NGÓN ĐANG Ở**; `StickmanFighterController.TryGetAimPoint` đo hướng **TỪ NHÂN VẬT** tới đó — đúng khuôn MasterArcher `bowAndArrow.prepareArrow` (`viTriCung − viTriChuot`, WORLD space) |
  | **Không làm mượt** | bản gốc `ArcherPlayerController.UpdateAimRotation` (Last Tower) lerp góc đầu bằng `_aimLerpSpeed`; **bản port bỏ mất vế đó** ⇒ mỗi pixel rung của ngón đi thẳng vào rig | `SmoothAim` — lerp theo **GÓC** (`Mathf.LerpAngle`), hệ số `1 − Exp(−k·dt)` cho khỏi phụ thuộc frame rate. ⚠ CHỈ cho đường NGƯỜI CHƠI; `AimAt`/`SetAimDirection` (AI) vẫn gán thẳng, thêm trễ vào đó là đổi cân bằng của mọi NPC |
  | **Vùng chết quá hẹp** | `_aimDeadZone` 3% chiều cao màn hình ≈ **4 mm**. Ngay ngoài vòng đó góc nhạy nhất: ngón nhích 5 mm là quét trọn 360° | Bỏ hẳn vùng chết tương đối; thay bằng **BÁN KÍNH TỐI THIỂU** `_minPullWorld` (0.8 world unit) quanh nhân vật — sát người thì góc là số nhiễu, giữ hướng cũ |
  | **Lật thân không có quán tính** | `|aim.x| > 0.08` là nón vỏn vẹn **4.6°**, đối xứng hai phía ⇒ ngắm gần thẳng đứng là cả rig SOI GƯƠNG mỗi frame | `_flipThreshold` 0.25 **có quán tính**: ngưỡng luôn nằm ở phía ĐỐI DIỆN hướng đang quay. Cùng họ `targetSwitchMargin` / `WatchSide` bên AI |

  ⚠ **HỆ QUẢ BẮT BUỘC CỦA VIỆC NEO Ở NHÂN VẬT: cử chỉ phải ở trên NỀN MÀN HÌNH.** Nút ĐÁNH nằm
  chết ở góc dưới-phải, nên neo vào nhân vật thì nó chỉ với tới được một nón hẹp phía trên-trái —
  ánh xạ tuyệt đối đòi ngón phải ĐI LẠI ĐƯỢC QUANH NHÂN VẬT. Vì vậy ngón tự do ĐỔI CHỦ: trước
  là LIA CAMERA, nay là NGẮM & BẮN; lia camera dời sang HAI NGÓN (trung điểm dời = lia, khoảng
  cách đổi = zoom, đọc chung một cặp ngón trong `UpdatePinch`). **Một cử chỉ MỘT CHỦ** — để cả
  hai cùng đọc ngón tự do thì mỗi lần kéo xem xung quanh lại bắn một phát.
  Nút ĐÁNH vẫn còn, chỉ thôi kiêm cần ngắm: bấm nó = đánh theo **hướng đang đi** (đứng yên thì
  giữ hướng cũ) — đủ cho cận chiến/súng, và là đường bấm-một-phát nhìn thấy được.

  ⚠ **NGÓN NGẮM BỊ CỬ CHỈ HAI NGÓN GIÀNH MẤT thì BỎ cú đánh, ĐỪNG NHẢ**
  (`StickmanTouchInput.CancelAttack` → `StickmanFighterController.CancelCharge`). Nhả = BẮN;
  người chơi vừa đặt ngón thứ hai xuống để zoom mà mất một phát tên thì họ đọc ra "game tự bắn
  linh tinh". Không có kênh HUỶ riêng thì lựa chọn duy nhất là nhả — đó là lý do phải có nó.

  ⚠⚠ **MỐC "KHÔNG CÓ NGÓN NÀO" KHÔNG ĐƯỢC LÀ `-1`** (`StickmanTouchControls.NoFinger`).
  Chuột trong Editor được giả làm một "ngón" mang id `-1`, nên `_stickFinger == fingerId` là
  ĐÚNG NGAY TỪ NHỊP ĐẦU khi chưa ai cầm cần — mọi cú bấm chuột rơi thẳng vào nhánh cần ảo và
  **không nút nào bấm được khi thử bố cục điện thoại bằng chuột**, đúng cái việc mà nút
  `PC / ĐT` sinh ra để làm. Không lỗi nào báo, chỉ là bấm không ăn.

  ⚠⚠ **NHỊP NHẢ NGÓN CHÍNH LÀ NHỊP BẮN — ĐỪNG XOÁ ĐIỂM NGẮM Ở ĐÓ.** `PublishAim` bản cũ thấy
  hết `held` là `ClearAim()` ngay, mà `ReleaseAttack()` (đặt `AttackUpThisFrame`) và
  `PublishAim()` chạy trong CÙNG MỘT frame. Tới lượt controller (chạy sau, vì
  `StickmanTouchControls` khai `-100`) thì điểm ngắm đã mất → `DirectionToPointer` rơi xuống
  nhánh *"nhắm theo hướng đang đi"* → **buông tay cái là nhân vật quay ngoắt theo hướng chân
  đang chạy rồi bắn về đó**. Đúng triệu chứng *"drag cung xong nhân vật quay sai hướng drag"*,
  và không lỗi nào báo: suốt lúc kéo vệt chấm vẫn chỉ đúng hướng, chỉ sai ở đúng cái frame
  quyết định — nên nhìn rất giống lỗi của hệ vũ khí. Chỉ xoá khi ngón đã rời **TỪ FRAME
  TRƯỚC**, và `AimPointer` phải được ghi **cả ở nhịp `Ended`** (cú vẩy cuối trước khi nhấc tay
  thường là quãng đi xa nhất).
  ⚠ Đo bằng cờ RIÊNG `_aimEndedThisFrame`, **KHÔNG** đo bằng `AttackUpThisFrame`: nút ĐÁNH ở
  góc phải cũng bật cờ đó, và lúc ấy điểm ngắm đang là ĐỒ THỪA của phát bắn trước ⇒ cú bấm nút
  bắn về hướng của lần kéo trước. Đây là họ hàng của luật "kênh `Consume*` chỉ trả về MỘT LẦN":
  mọi thứ sống đúng một frame thì phải hỏi *ai còn cần đọc nó trong frame này nữa không* trước
  khi dọn.

  ⚠ **NGÓN NGẮM BIẾN MẤT KHÔNG KỊP BÁO `Ended`** (nhấc rất nhanh, mất focus, app chuyển nền)
  thì `ReadPointers` phải NHẢ ĐÒN hộ. Bỏ vế này là `AttackHeld` kẹt true VĨNH VIỄN: nhân vật
  giữ nguyên thế tích lực, không bắn ra phát nào và cũng không bấm lại được.

  ⚠ **`DragPull` và `PointAim` ĐỌC CÙNG MỘT NGÓN nhưng hiểu khác nhau** — và cả hai chạy y
  hệt trên chuột lẫn cảm ứng:
  · `DragPull` = **vectơ kéo A→B**, bắn theo **B→A** (ngược chiều kéo), lực = ĐỘ DÀI cú kéo.
    Mốc A là chỗ ngón chạm xuống, được ghim lúc `BeginDrag` và hiện ra bằng `_startTouchIcon`.
  · `PointAim` = hướng `ngón − nhânVật`, ánh xạ tuyệt đối, lực tính theo thời gian giữ.
  ⚠⚠ **ĐÃ THỬ NEO KÉO-THẢ Ở NHÂN VẬT (2026-09-16) VÀ NGƯỜI DÙNG BÁC.** Lý do lúc đó là "mốc
  chạm xuống vô hình nên kéo thấy xoay lung tung", nhưng đo `nhânVật − ngón` biến cú kéo thành
  cú CHỈ ĐIỂM: đặt ngón chỗ nào bắn ra hướng đó, mất cảm giác giương cung, và lực hoá thành
  "đứng xa thì mạnh". Vế mốc vô hình chữa bằng HÌNH (chấm mốc ở A + vệt chấm A→B), không chữa
  bằng cách đổi gốc đo.
  ⚠ Bản cũ hơn nữa còn ép `DragPull → PointAim` khi có cảm ứng, mà hai kiểu đó NGƯỢC CHIỀU
  NHAU: ai đang ở kiểu kéo-thả mà cầm điện thoại thì kéo ra sau lại bắn ra sau — một lời nói
  dối câm lặng. Đừng dựng lại cái nhánh đi vòng đó.
- Rigidbody2D API mới: `linearVelocity` (không dùng `velocity`), `bodyType` (không dùng `isKinematic`)
- KHÔNG `using TreeEditor;` hay bất kỳ namespace editor-only nào trong runtime script (vỡ build)
- Comment tiếng Việt OK (theo style hiện có)


## ⚠⚠ CẦU THANG ĐỌC `StairAxis`, KHÔNG ĐỌC `ClimbAxis` (2026-09-06)

Cần ảo có HAI trục dọc, và dùng nhầm trục là mất hẳn khả năng điều khiển cầu thang.

| Trục | Ngưỡng | Dùng cho |
|---|---|---|
| `StickmanTouchInput.ClimbAxis` | `\|y\| > 0.32` **và** `\|y\| > \|x\| × 1.2` | thang trèo, đu dây |
| `StickmanTouchInput.StairAxis` | `\|y\| > 0.18` **và** `\|y\| > \|x\| × 0.55` | cầu thang xéo |

**Vì sao phải tách:** thang trèo đứng ngay cạnh đường đi, chỉ cần trục dọc khác 0 là
`StickmanFighterController` bám vào — nên nó phải KHÓ ăn. Nhưng leo cầu thang xéo là đẩy CHÉO
theo hướng dãy bậc chạy tới; đẩy chéo 45° có `|y| ≈ |x|` nên **luôn trượt luật trội** ⇒ trục
dọc trả 0 ⇒ không ai đòi leo ⇒ thang giữ nguyên trạng thái ĐI XUYÊN và người chơi đi thẳng qua
nó. Muốn leo thì phải bẻ ngón gần thẳng đứng — mà thẳng đứng thì `MoveAxis` về 0 nên đứng im
tại chỗ. **Hai luật ép nhau, không có ngóc ngách nào leo được bằng cần**, và không lỗi nào báo.
Nguyên văn báo lỗi: *"ở cầu thang các tầng không điều khiển để đi lên đi xuống hay đi ngang
theo ý muốn được"*.

`StairAxis` vẫn trả 0 khi đẩy NGANG THUẦN, nên bất biến gốc *"đi xuyên là mặc định, leo lên
phải đòi"* còn nguyên — đi ngang qua chân thang không bị nhấc lên nóc tường.

**⚠ CÚ ĐẨY XUỐNG MANG HAI Ý ĐỊNH TRÁI NGƯỢC**, phân biệt bằng đúng một câu hỏi hình học
(`StickmanStairs.IsOnUpperDeck`, xem `StickmanFighterController.ApplyStairIntent`):

- đứng TRÊN mặt tường / sàn gác → *"cho tôi đi xuống"* ⇒ `RequestStairs()`, thang phải ĐẶC;
- đứng DƯỚI ĐẤT ở chân thang → *"cho tôi chui qua gầm"* ⇒ `RequestStairsPass()`, thang phải XUYÊN.

Đoán sai chiều nào cũng thành bẫy: nhầm vế một là từ nóc tường ấn xuống thì lọt thẳng qua cầu
thang mà rơi; nhầm vế hai là đi ngang qua chân thang bị lôi lên nóc.

**Ô bấm "▲ Leo lên" đã bị bỏ** (`StickmanStairsPrompt` xoá 2026-09-06) — nó chỉ tồn tại vì
trục dọc không dùng được cho cầu thang. Đừng dựng lại nó; sửa ngưỡng trục là đủ.

---

## ⚠⚠ ĐẨY CẦN SANG TRÁI MÀ NGƯỜI KHÔNG QUAY — HƯỚNG NGẮM LÀ NGUỒN DUY NHẤT CỦA `_flip` (2026-09-17)

Code: `StickmanFighterController.ApplyAim` (khối "ĐI SANG BÊN NÀO THÌ QUAY MẶT SANG BÊN ẤY") +
cờ `_aimClaimed`. Nguyên văn báo lỗi: *"drag joystick nhân vật qua trái phải thì nó không xoay
người"*.

`_flip` chỉ có ĐÚNG MỘT nguồn: `_aimDirection`. Mà kiểu ngắm MẶC ĐỊNH của dự án là **KÉO &
THẢ**, và ở kiểu đó hướng ngắm CHỈ được ghi trong lúc ngón **đang kéo** (`UpdateDrag`). Đi lại
không ghi gì cả ⇒ đẩy cần sang trái thì nhân vật đi được mà thân vẫn quay phải: **đi giật lùi
suốt trận**. Bàn phím `A`/`D` dính y hệt. Không lỗi nào báo — cả hai hệ đều "chạy đúng".

⚠ Nhánh dự phòng *"không ai chỉ chỗ → nhắm theo hướng đang đi"* đã có sẵn trong
`DirectionToPointer` **từ lâu**, nhưng hàm đó chỉ được gọi ở `PointAim`/`ClickShot` — tức lời
giải nằm ngay trong file mà đường mặc định không bao giờ đi qua. Cùng hình dạng với *"tính năng
đã viết xong, thiếu đúng một dòng nối từ đầu vào"*.

**Sửa ở TẦNG HƯỚNG NGẮM, không lật thẳng `_flip`**: đầu, hai tay và cây vũ khí đều đọc
`_aimDirection`; lật riêng thân là mặt quay một đằng người một nẻo.

**Cửa là `_aimClaimed`** — cờ đặt lại đầu mỗi `Update`, bật lên ở `SmoothAim` (mọi đường ngắm
của người chơi) và `SetAimDirection` (tự động / AI). Frame nào đã có chủ hướng ngắm thì cú đi
KHÔNG được bẻ nòng: vừa chạy sang trái vừa bắn sang phải là chuyện bình thường.

⚠ `_isDragging`/`_isCharging` vẫn phải nằm trong cửa **dù đã có `_aimClaimed`**: cú kéo NGẮN hơn
`_minPullWorld` thì `UpdateDrag` cố ý không ghi hướng (góc sát mốc là số nhiễu) — thiếu vế này
thì vừa giương cung vừa bước một bước là người tự quay ngoắt đi.

⚠ Đọc `_locomotion.Steer`, KHÔNG `MoveInput`: `MoveInput` có cộng lực giãn cách đội hình
(`SetSeparationBias`) — thứ không phải ý định của người chơi.

---

## ⚠⚠ MỘT NÚT XOAY VÒNG KHÔNG PHẢI LÀ CHỖ CHỌN — BA KIỂU BẮN, BA MỤC (2026-09-17)

Code: ba mục `KÉO` · `GIỮ` · `CHẠM` trong khay ⋯ (`StickmanTouchControls`) ·
`StickmanTouchInput.RequestAimMode` / `CurrentAimMode` · `StickmanFighterController.HandleAimModeInput`.

Bản cũ là MỘT nút «NGẮM» xoay vòng. Hỏng ba chỗ cùng lúc:

1. **nút không nói mình đang ở kiểu nào** — người chơi phải bắn thử một phát mới biết;
2. **muốn về kiểu quen phải bấm tới ba lần GIỮA TRẬN**;
3. vòng quay dựng bằng `Enum.GetValues(typeof(AimMode))` nên lôi luôn **`AutoFire`** — kiểu MÁY
   TỰ KHOÁ ĐỊCH VÀ TỰ BẮN, viết cho ván idle/auto-battle — vào tay người chơi chỉ vì nó nằm
   chung enum. Bấm nhầm một cái là nhân vật tự đánh, con trỏ hết tác dụng, không có gì trên màn
   hình nói tại sao.

⚠⚠ **Danh sách của NGƯỜI CHƠI phải là một bảng khai tay** (`_playerAimModes`), không phải cả
enum. Cùng họ với luật *"đếm cái mà bộ chọn thật sự chọn được"*: một giá trị lọt vào vòng quay
chỉ vì nó tồn tại là một lựa chọn chưa ai thiết kế. `AutoFire` vẫn đặt được bằng
`StickmanFighterController.Aiming` từ code/scene — đúng chỗ của nó.

⚠ `CurrentAimMode` là `AimMode?` và **null khi chưa ai nói** (chưa có người chơi, người chơi vừa
chết). Đừng mặc định về `DragPull`: mục sáng mà thật ra chưa ai chọn là một lời nói dối câm —
đúng thứ ba mục này sinh ra để chữa. Controller ghi MỖI FRAME, `Clear()` đặt lại null.

⚠ Thêm hai mục là thêm hai góc trên vòng 3 (`115°`, `102°`) — giữ luật XEN KẼ với vòng 2
(180/146/112/90) và khoảng cách 13° (= đúng `2·r3`, các nút chạm nhau chứ không chồng nhau).
Phím `M` vẫn còn, nay chỉ chạy qua ba kiểu ấy.
