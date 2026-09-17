## SỔ BẪY AI THEO NGÀY

Tách khỏi [AI.md](AI.md) ngày 2026-09-08 vì file gốc 2 298 dòng — quá dài để một AI ít ngữ
cảnh nạp trước khi sửa (xem [FileSize.md](FileSize.md)). **Không một chữ nào bị đổi khi
tách.** Phần LUẬT ở `AI.md`; phần dưới đây là NHẬT KÝ: mỗi mục một lỗi có thật đã sửa, đọc
khi đụng đúng mảng đó chứ không cần đọc hết.

## ⚠⚠ HAI LỖI "AI NGU" ĐÃ SỬA 2026-09-05 — ĐÁNH TRẢ & NHẢY QUÁ NHIỀU

### 1. Đứng chịu đòn vì luật nào cũng đúng — `AIProfile.retaliateDamageShare`

`OnOwnerDamaged` đã có luật đổi mục tiêu khi bị đánh, nhưng nó xét TỪNG CÚ và luôn nhường cho
hai thứ: *"đang giáp lá cà thì dứt điểm đứa trước mặt"* và *"đứa gần hơn thì xử trước"*. Đứng
đập một cái cổng (gần hơn, lại đang đánh dở) trong khi một cung thủ nã vào lưng suốt cả phút
thoả **cả hai** — mỗi luật đều trả lời đúng câu nó được hỏi.

Cái thiếu là một câu hỏi KHÁC: **"tôi đang mất máu vì ai?"** — tức TRÍ NHỚ về sức ép, không
phải thêm một phép so khoảng cách. `TrackPressure` cộng dồn sát thương theo TỪNG kẻ trong
`retaliateWindow` giây; vượt `retaliateDamageShare` × máu tối đa thì quay ra đánh nó, **cắt
ngang mọi luật nhường**.

⚠ Đo bằng PHẦN MÁU, không đếm số cú đánh: ba mũi tên ghim vào lưng khác hẳn ba viên sỏi.
⚠ Đổi kẻ đánh là XOÁ SỔ, không cộng chung — cái đáng đổi mục tiêu là MỘT nguồn dai dẳng.
⚠ `retaliateCooldown` là bắt buộc: thiếu nó thì hai cung thủ thay nhau bắn làm nhân vật xoay
qua xoay lại và không đánh được đứa nào — đổi một cái ngu lấy một cái ngu khác.

### 2. Nhảy né đạn nuốt mất cả trận đánh

Ba lỗ hổng cộng lại thành *"nó nhảy quá nhiều"* + *"gặp địch mà không biết đánh"*:

| Lỗ hổng | Hậu quả | Chốt |
|---|---|---|
| Không có CẬN DƯỚI (`rel <= 0.45` là hết) | nhảy vì những mũi tên đã trượt dưới chân (cửa sổ quét rộng tới −0.12 thân) | thêm `JumpEvadeAbove = -0.10`, hạ trần xuống 0.35 |
| Dùng chung `dodgeCooldown` (0.9s) | nhảy là cú né ĐẮT NHẤT (mất bám đất + mất một nhịp ra đòn) mà lại rẻ như lách ngang | `AIProfile.jumpDodgeCooldown` = 3s, nhịp RIÊNG |
| Né dọc không hỏi "tôi có đang đánh nhau không" | người lính kề dao vào cổ địch nhưng cả trận chỉ nhảy lên nhảy xuống | `meleeNoDodgeReach` — có địch trong 1.35× tầm đánh thì KHÔNG né dọc |

⚠ `CanEvadeVertically` nay CHO PHÉP quân đang cưỡi: ngựa nhảy tốt hơn người, cấm nó là kỵ binh
phi ngang tuyến cung thủ mà không có đường sống nào. Kèm `StickmanLocomotion.MountedJumpScale`
(1.45) — cưỡi vào là bàn chân đã ở lưng chừng con ngựa nên cú bật 0.40 của người đi bộ gần như
không đọc ra, và người dùng kết luận *"ngựa không nhảy được"*.

⚠ Cấp AI cao NHÂN thêm `dodgeChanceScale` (cấp 2 = ×1.35) nhưng KHÔNG nhân nhịp nghỉ của cú
nhảy — trần cứng đó là thứ giữ cho cấp cao không quay lại thành cào cào.

---

## ⚠ HAI LUẬT ĐƠN VỊ CHỐT NGÀY 2026-09-05

**NÔNG DÂN KHÔNG CƯỠI NGỰA.** Chốt ở `StickmanAgent.SetBehavior` — đó là chỗ DUY NHẤT mà
"người này là thợ" trở thành sự thật, nên mọi đường đi tới nghề nông đều được hưởng (thuê
thêm · hồi sinh · đổi lệnh giữa trận · một hệ nào đó ngày mai mới có). `AIMountModule` cũng hỏi
thẳng `AIBehavior.Work` chứ không chỉ dựa vào `IsCombatant`: hai cờ đó hôm nay trùng nhau,
nhưng `IsCombatant` nghĩa là *"có được tính vào cán cân quân số không"* — ngày mai ai nới nó
ra là nông dân lại cưỡi ngựa đi gặt, và không lỗi nào báo.

**NGỰA KHÔNG NHẢY — CHỐT Ở `StickmanLocomotion.Jump`** (luật chốt lại 2026-09-05, thay cho
`MountedJumpScale` của bản trước). Con ngựa là một tấm hình gắn dưới nhóm `Sprite` của kỵ sĩ,
không có bộ động tác riêng: mọi cú nhảy đều thành *"cả người lẫn ngựa trượt thẳng lên trời rồi
rơi xuống"* trong khi hai chân người vẫn kẹp yên. Chặn ở HÀM `Jump` chứ không ở từng chỗ gọi —
người chơi bấm phím, `UpdateJumpOverGap`, cú nhảy đệm khi vừa tiếp đất, cả ba đều đi qua đó.

**KỴ BINH KHÔNG NÉ DỌC.** `CanEvadeVertically` loại quân đang cưỡi. Cú né dọc phát động tác
`Jump` kiểu *tuck* (CO GỐI) — người đang ngồi trên yên co gối thì đọc ra là lỗi rig chứ không
ra một cú né, và cả tuyến kỵ binh nhấp nhô mỗi lần có mũi tên bay thấp. Ngựa **vẫn nhảy được**
khi người chơi bấm (`StickmanLocomotion.Jump` không chặn ai) và khi phải vượt khe
(`UpdateJumpOverGap`); `MountedJumpScale` 1.45 giữ cho cú nhảy đó đọc ra được.

**NÔNG DÂN KHÔNG CƯỠI NGỰA — LỖ CUỐI CÙNG (2026-09-06).** `AIMountModule` đã chặn, nhưng con ngựa
hoang KHÔNG đi qua module đó: `RiderlessHorse.TryPickUpRider` tự trao ngựa cho BẤT KỲ
`StickmanFighterController` nào đứng trong `strayMountRadius`, mà nông dân là một fighter đầy đủ.
Chốt ở chính `CanTake`: hỏi `IUnitBrain.IsCombatant` (mới thêm vào Core để Combat hỏi được mà
không nhìn lên AI). Bài học: **một hệ có hai đường vào thì phải chặn ở cả hai, hoặc chặn ở nút
thắt chung** — ở đây nút thắt chung là `CanTake`.

---

## ⚠⚠ CẢ TUYẾN BẬT LÊN MỘT LƯỢT — SỔ NHẢY THEO PHE (2026-09-06)

Người dùng báo *"nhiều AI nhảy lên cùng lúc"*. Cái nhịp đó KHÔNG phải ngẫu nhiên — **chính hệ
của mình tạo ra nó**: `CommandNode` bắt cung thủ **cùng buông dây một lượt** (loạt tên), nên cả
chùm tên tới đích trong vài phần trăm giây; cả hàng phòng thủ cùng thoả `rel <= JumpEvadeBelow`
và `timeToHit >= JumpLeadTime` trong **cùng một frame**. Chuyện y hệt xảy ra khi cả tiểu đội
hành quân tới **cùng một mép vực**.

⚠ **Rải bằng số ngẫu nhiên cho từng người là KHÔNG ĐỦ.** Nguồn kích hoạt chung một thời điểm, mà
cửa sổ phản ứng chỉ rộng `dodgeReactionTime` (0.45s) và cửa nhảy chỉ là `timeToHit ∈ [0.18,
0.45]` = **0.27 giây**. Sáu người rải đều trong ngần ấy vẫn là sáu cú nhảy cách nhau 0.045s —
mắt vẫn đọc ra "cùng lúc".

Chốt: `StickmanAgent.JumpSlotFree()` / `MarkJumped()` — một **ô mỗi phe** ghi *"người gần nhất
vừa rời mặt đất lúc nào, ở đâu"*. Trong `jumpStagger` (0.18s) và trong `jumpStaggerRadius`
(7 world) chỉ MỘT người được nhảy. **Cả hai** đường nhảy của AI đi qua nó
(`UpdateJumpOverGap`, `UpdateDodge`); người chơi thì không bao giờ bị chặn.

⚠ **Ai chậm chân phải né được kiểu KHÁC, không phải đứng chịu trận.** Nhánh nhảy bị khoá thì
rơi xuống ngồi thụp / lách ngang — và chính chỗ đó làm hàng quân trông như những người khác
nhau. Nếu chặn mà không có đường rơi xuống thì đổi một lỗi hình ảnh lấy một lỗi hành vi.

⚠ **`stored > Time.time` = sổ của LẦN CHẠY TRƯỚC.** Tắt Domain Reload thì `static` sống qua các
lần bấm Play trong khi `Time.time` reset về 0 — thiếu vế đó là vào màn mới cả phe bị khoá nhảy
cho tới khi đồng hồ đuổi kịp con số cũ, và không lỗi nào báo. Cùng bẫy mà `GarrisonDirector.Install`
chữa bằng "gỡ handler trước khi đăng ký".

⚠ Nhịp nghỉ sau khi nhảy có **rung nhẹ** (`× Random.Range(0.85f, 1.25f)`): hai người bị khoá
cùng một lúc mà nghỉ đúng bằng nhau thì lần sau lại bật lên cùng nhau. Cùng thủ pháp với
`shakenDuration * Random.Range(0.7f, 1.3f)` ở `OnSomeoneDied`.

---

## ⚠ VỀ TRẠM QUÂN Y RỒI RA ĐÁNH TIẾP — `AIHealPostModule` (2026-09-06)

Máu dưới `healPostSeekPercent` → bỏ trận về `HealingPost` gần nhất; đầy tới
`healPostLeavePercent` → ra đánh tiếp.

⚠⚠ **HAI NGƯỠNG PHẢI KHÁC NHAU** (0.35 vs 0.9). Dùng chung một ngưỡng là lính vừa đủ máu đã
chạy ra, ăn một nhát lại chạy vào — cái trạm thành một **cửa xoay**. Đây là vòng trễ, cùng họ
với `moraleRoutThreshold` / `moraleReturnThreshold`.

⚠ **`TripCommit`** (8s) là bắt buộc — thiếu cam kết là đúng vòng lặp §5c: chạy về nửa đường thì
hết bị dí, hết bị dí thì quay lại đánh, quay lại đánh thì lại thấy sắp chết. Cùng khuôn
`rescueCommit` / `mountSeekCommit` / `resupply TripCommit`.

⚠ Module nằm trong `DefaultKinds` và **tự tắt ở dòng đầu** khi `HealingPost.All` rỗng. Để ngoài
bộ mặc định là phải nhớ khai ở từng playbook — quên một chỗ thì cả phe đứng chết dí ngoài trận
trong khi cái trạm vừa xây không ai dùng, và KHÔNG có lỗi nào báo.

⚠ `HealingPost` nằm ở tầng **Combat** (khuôn `AmmoCache`), không phải Gameplay — nhờ vậy module
AI tra thẳng được, khỏi đẻ thêm interface bắc cầu ở Core.

## ⚠⚠ LUẬT VIẾT CHO NGƯỜI, ÁP LÊN CÔNG TRÌNH THÌ SAI (2026-09-07)

Ba lỗi cùng một gốc, đều im lặng, đều lộ ra ở mode kinh tế — nơi **NHÀ CHÍNH là điều kiện thắng**
nên công trình thôi là vật cản dọc đường và trở thành ĐÍCH của trận.

### 1. Chủ tướng đứng canh một cái nhà tới hết trận

`AIStateGuard` chỉ đánh khi: đang báo động · địch bước vào `HoldLine` · địch lọt vào tầm vũ khí.
Cả ba viết cho một kẻ **BIẾT ĐI** — đứng ở chỗ gác chờ nó tới. Cái nhà thì đứng yên và không
đánh trả, nên không vế nào bật lên.

Chủ tướng lùi `commandStandoff` = 5 sau tuyến (`CommandNode.ComputeSelfAnchor`), mà `HoldLine` =
`guardScreenDistance` 1.6 + `guardHoldMargin` 2 = **3.6**, tầm chém ~1.5. Nó đứng **cách nhà chính
địch đúng 5 đơn vị, canh chừng, tới hết trận** — đúng câu *"tướng của địch không biết phá nhà"*.

Chốt: mục tiêu KHÔNG phải `StickmanFighterController` thì **đi tới nó**, đừng chờ. Đặt SAU phép
kiểm `leash` nên tổ canh nhà vẫn không bỏ nhà chạy đi đập công trình ở đầu kia map.

### 2. Cam kết "đập vật cản" nuốt luôn phản xạ đánh trả

`IsBreakingObstacle` miễn trừ CẢ `UpdateEngageNearby` LẪN `UpdateRetarget`. Lý do ghi ở đó đúng —
**với một cái cổng**: địch bên kia cổng vĩnh viễn với không tới, quay ra đánh nhau với chúng là cả
toán đứng trước cổng tới hết trận.

Nhưng lý do ấy chỉ đúng cho kẻ **Ở BÊN KIA**. Thứ chắn đường trong mode kinh tế là nhà chính nằm
giữa trại địch, còn quân giữ nhà đứng **ngay bên này**, cùng mặt đất, chém vào lưng. Miễn trừ vô
điều kiện ⇒ cả cánh quân gặm cái nhà cho tới lúc chết sạch mà không đỡ một nhát: *"đặt mục tiêu
tấn công nhà, dọc đường gặp địch thì bị giết hết mà không biết đánh trả"*.

Chốt hẹp có chủ ý — bỏ cam kết khi kẻ đang đánh mình **còn sống · là NGƯỜI · CÙNG PHÍA vật cản**
(`ShouldBreakOffObstacle` + `IsOnMySideOf`, đo bằng DẤU hiệu toạ độ x như mọi phép đo ngang khác).
Địch bên kia cổng vẫn không kéo được ai ra khỏi việc phá cổng.

⚠ Và phải `DropObstacleFocus()` HẲN, kèm `ObstacleBreakOffCooldown` 3 giây. Chỉ đổi `Target` thôi
là vô nghĩa: `UpdateBlockedPath` chạy TRƯỚC `UpdateEngageNearby` trong cùng một nhịp, nên frame
sau nó ghi mục tiêu về cái nhà — cú đổi ý không sống quá một frame, im lặng hoàn toàn. Không có
cooldown thì cái nhà vẫn chình ình trước mặt, dò lại là nhận lại đúng nó.

### Bài học chung

Mỗi lần thêm một loại mục tiêu KHÔNG PHẢI NGƯỜI, phải soát lại mọi luật có dạng *"chờ nó tới"*,
*"nó sẽ chết đi nhường chỗ"*, *"nó đánh trả nên phải né"*. Công trình không tới, không chết đi
(nó **luôn** `TargetAlive` nên mọi nhánh `if (!TargetAlive) quét lại` không bao giờ chạy), và
không đánh trả. Xem thêm hai vá cùng họ: `MeleeCombatStrategy` (thôi nhập nhử trước cái cổng) và
`SelectBestEnemy` (tầm xa không nhắm công trình).

### 3. Phản xạ "có người ngay cạnh tôi" bị tắt đúng lúc ĐANG HÀNH QUÂN

`UpdateEngageNearby` mở đầu bằng `if (!TargetAlive) return;`, nên nó chỉ cứu được đúng một cảnh:
đang nhắm CÔNG TRÌNH mà có người áp sát. Một cánh quân **đang hành quân** thì `Target == null` —
bị loại ngay dòng đầu.

Mà hành quân mới là lúc cần nó nhất. Lúc ấy việc nhận ra địch phụ thuộc hoàn toàn vào nhịp quét
của `AIStateSeek` → `SelectBestEnemy(VisionRange)`, mà đường đó có **ba cửa hẹp cùng lúc**:

| Cửa | Số đo |
|---|---|
| `VisionRange` = `visionRange` × `WorldLighting.VisionScale` | ĐÊM còn 0.65 ⇒ 7 → **4.55** |
| Nón nhìn `CanSee` | hai đạo quân đi ngược chiều đều quay mặt về trước ⇒ ngoài nón của nhau |
| Độ trễ nhận ra `Notice()` theo CẤP AI | chỉ được miễn trong `ContactRange` **2.6** |

Lính chạy ~3 đơn vị/giây băng qua dải 2.6 → 4.55 trong **chưa tới nửa giây**, nên với bất kỳ độ
trễ nào nó "nhận ra" SAU KHI đã đi qua: *"trên đường tấn công gặp địch, nó cứ đi ngang qua cho
địch giết"*.

Chốt: hàm này chạy cả khi KHÔNG có mục tiêu — nó là cửa duy nhất không đi qua cả ba (quét thẳng
sổ `TeamMember` trong 6 đơn vị mỗi 0.25 giây, `NoticeThreatNow()` mở khoá độ trễ ngay). Chỉ nhường
khi ĐANG ĐÁNH MỘT NGƯỜI SỐNG — giật ai đó ra khỏi trận giáp lá cà để đổi sang đứa gần hơn nửa mét
là đổi một cái ngu lấy cái khác. Nón nhìn vẫn giữ ngoài `ContactRange` để không vô hiệu hoá
`useVisionCone` của chế độ ám sát.

## TRANH THỦ: GIẾT NÔNG DÂN · PHÁ NHÀ NẾU CÓ THỂ (2026-09-07)

Hai khoản chấm điểm mới, cùng một tinh thần: **TRANH THỦ chứ không BỎ TRẬN**.

### Nông dân địch đáng giết hơn một anh lính đứng cùng chỗ

`AIProfile.workerTargetBonus` (mặc định **5**, cùng cỡ `rangedTargetBonus`). Ở mode kinh tế, vàng
và củi ĐI QUA tay nông dân — giết một người là phe kia mất cả dòng thu lẫn khoản tiền đã bỏ ra
thuê, và cái mất ấy kéo dài suốt phần trận còn lại. Một anh lính chết chỉ mất đúng một anh lính.

Nhận diện bằng **VIỆC ĐANG LÀM** (`AIBehavior.Work`), không kê tên prefab — cùng nguồn sự thật với
`IsCombatant`, nên nông dân được vũ trang hay lính bị điều đi xây đều cho câu trả lời khớp nhau.

⚠ Vì sao KHÔNG cần cờ bật/tắt theo màn: `AIBehavior.Work` chỉ tồn tại ở mode kinh tế, nên ở màn
khác dòng này không bao giờ được cộng. Và 5 là một khoản trừ NHỎ còn phải thắng quán tính
`targetSwitchMargin` (4) — lính đang giao chiến không buông địch để chạy đi tìm thợ.

### Đứng sát nhà mà quanh mình trống thì cứ đập

`LivingFirstPenalty` (**200**) đúng cho câu *"đừng bỏ người mà đi đập nhà"*, nhưng nó nuốt luôn
cảnh ngược lại: đang đứng SÁT nhà chính địch, quanh mình không một bóng người, mà bảng điểm vẫn
bắt chạy 15 đơn vị sang chỗ một anh lính — vì 15 < 201. Cái nhà là ĐIỀU KIỆN THẮNG, còn cú chạy
ấy chỉ cho phe kia thêm thời gian.

Ngoại lệ mở khi CẢ HAI cùng đúng, không có vế thứ ba:

1. công trình đã nằm **trong tầm vung** (`smashReach` = tầm vũ khí × 1.25) — không phải "đi tới đó đã";
2. **không có người sống nào trong `ContactRange`** (2.6) — tức không ai đang chém mình.

Người mà lẽ ra nó bỏ đi đánh đang ở xa hơn 2.6; ai bước vào là khoản phạt trở lại ngay nhịp quét
sau, và `UpdateEngageNearby` còn cắt ngang trong 0.25 giây. Ngoài tầm vung thì phạt vẫn nguyên
200, nên vế "NGƯỜI TRƯỚC, NHÀ SAU" không bị vô hiệu ở bất kỳ ca biên nào.

⚠ Phép hỏi "quanh mình có ai không" là **LƯỜI**: chỉ chạy khi thật sự có một công trình trong tầm
vung, và nhớ kết quả cho cả vòng chấm điểm. Hỏi vô điều kiện là thêm một truy vấn không gian cho
mỗi nhịp quét của mỗi con lính, đổi lấy một câu trả lời hầu như luôn là "có".

## ⚠⚠ SỢI DÂY CỦA LÍNH GÁC KHÔNG ĐƯỢC CẤM NGƯỜI TA ĐỠ ĐÒN (2026-09-07)

Triệu chứng: *"ra lệnh tấn công hay phòng thủ thì nó cứ đi thẳng tới, không biết đánh địch xung
quanh"*. Người dùng ngờ cấp AI — **không phải**: cấp 0 đã được vá thành "vụng chứ không tê liệt"
(2026-09-04), `reactionDelay` 0.35s, và `smartTargeting` chỉ nói về chuyện săn cung thủ.

Gốc nằm ở `AIStateGuard`. Vế *"nó đang dí sát mặt"* nằm trong nhánh `else if`, tức chỉ được hỏi
**SAU KHI** phép kiểm dây đã kịp vứt mục tiêu đi. Hai cửa, cửa nào cũng đóng sập đúng lúc cần mở:

* `targetFromProtect > leash` — thằng đang chém mình đứng xa CHỖ GÁC thì bỏ, dù nó ở ngay trước
  mũi kiếm;
* `selfFromProtect > leash` — **và đây mới là cửa giết người: chính MÌNH đang ở xa chỗ gác.** Ra
  lệnh PHÒNG THỦ là cả cánh quân quay đầu về mốc mới, nên suốt quãng hành quân ấy vế này LUÔN
  đúng ⇒ mọi mục tiêu đều bị vứt, và họ đi thẳng qua mặt địch cho tới khi về tới nơi.

Chốt: nhấc `atMyThroat` (`DistanceToTarget <= max(MaxRange, personalSpace)`) lên **TRƯỚC** phép
kiểm dây, và cho nó miễn cả hai cửa.

Sợi dây sinh ra để chống ĐÚNG MỘT thứ: bị dụ rời chỗ gác. Nó không có quyền cấm người ta đỡ một
nhát kiếm đang bổ xuống đầu — ở đâu cũng vậy.

⚠ Bài học chung với hai vá cùng ngày (`UpdateEngageNearby` khoá nhầm khi không có mục tiêu,
`IsBreakingObstacle` nuốt phản xạ đánh trả): **mọi luật kiểu "bỏ qua mục tiêu này" phải tự hỏi
"kể cả khi nó đang chém tôi?"**. Ba luật đều đúng với câu chúng được hỏi, và cả ba đều trả lời sai
cho cùng một cảnh — người chơi thấy y hệt nhau: lính đi ngang qua địch mà không đánh.

## NHÀ ĐỊCH BỎ NGỎ THÌ ĐÁNH NGAY (2026-09-07)

`CommandDoctrine.raidUndefendedRadius` (9) + `raidUndefendedMax` (1). Tướng máy quét quanh căn cứ
địch; còn ≤1 lính sống thì **TỔNG TẤN CÔNG ngay**.

⚠ Đặt **TRƯỚC** cả khối `sortieInterval` trong `DecideAsCommander`, có chủ ý: nhịp xuất quân là
một cái **ĐỒNG HỒ**, nó không nhìn ra sân. Cả đạo quân địch vừa kéo đi đánh chỗ khác, nhà chính
của họ trống trơn — mà tướng máy đang ở pha "rút về thủ" nên ngồi đợi thêm hai mươi giây nữa. Đó
là cửa sổ duy nhất để thắng ván đấu, và nó đóng lại trước khi đồng hồ kêu.

⚠ Vẫn qua cửa `retreatRatio`: nhà bỏ ngỏ không phải lý do để một phe sắp bị xoá sổ dốc nốt mấy
mạng cuối đi xa nhà. Cùng cửa mà khối `sortie` đang dùng.

⚠⚠ **CHỈ ĐẾM NGƯỜI.** Công trình cũng nằm trong sổ `TeamMember` (nhà chính, tháp, cổng) và chúng
LUÔN đứng đúng ở đó — đếm cả chúng thì không bao giờ có cái nhà nào "bỏ ngỏ", luật này chết lặng
và không lỗi nào báo. Cùng bẫy với `IsRuined` đếm `childCount`: **đừng đo người bằng một phép đếm
nhận cả đồ vật.**

## CUỘC ĐUA PHÁ NHÀ — `WinningRace` (2026-09-07)

Luật người dùng: *"nhà đang bị phá thì ưu tiên giết địch phá nhà, nhưng nếu phá nhà địch gần xong trước thì ưu tiên phá nhà địch"*.

Vế đầu đã có sẵn ở hai tầng: lính (`defendObjectiveBonus` — kẻ đang đánh công trình phe mình được cộng điểm theo mức nguy) và tướng (`UpdateHomeDefense` chia một cánh về khi địch lọt quanh nhà). Vế sau là **ngoại lệ duy nhất** của cả hai: `CommandNode.WinningRace` = nhà địch ≤ 30% **VÀ** thấp hơn nhà mình. Hai vế phải cùng đúng — hai nhà cùng 20% mà bỏ nhà mình là đánh cược, không phải đua.

Ba chỗ đọc cùng một câu: `DecideAsCommander` (giữ Attack kể cả đang pha rút của nhịp xuất quân), `UpdateHomeDefense` (không chia cánh về), `CampHomeGuard.DecideTarget` (không rút thêm người về dù có địch trong sân). ⚠ Ba tầng phải nói cùng một điều: tướng gọi quân đi phá nhà trong lúc tổ canh nhà lôi từng người quay về là không ai tới được đâu.

Máu nhà vào tầng AI qua `TeamCommander.RefreshAnchors` → `SetBaseHealth`: hai mốc là `Transform` của nhà chính, mà `BaseBuilding : StickmanController` nên đọc được máu không cần biết tầng Gameplay.

## LÀN TẤN CÔNG — CHIA HAY GOM (2026-09-07)

Người dùng: *"AI khi tấn công có thể đánh từ nhiều hướng hoặc có sở thích gom một hướng"*.

Bốn làn tới được trại địch: **mặt đất** · **đường trên** (`useHighRoad`) · **hầm** (`useLowRoad`, mới) · **vòng sau lưng** (`pincerDepth`). `CommandDoctrine.attackLanes`:

* **Split** — mọi làn đã bật cùng chạy, mỗi làn một cánh (hành vi cũ).
* **Concentrate** — mỗi đợt xuất quân bốc ĐÚNG MỘT làn và `ApplyToFreeWings` dồn MỌI cánh vào đó. `laneRotate` = xoay vòng qua từng đợt (địch không đoán được) hay giữ một làn cả trận ("sở thích", chọn theo phe để hai tướng cùng học thuyết không giống nhau).

### Tuyến hầm `UpdateLowRoad` — đối xứng `UpdateHighRoad`, cùng khuôn DỜI CỘT MỐC

Hai pha vì hầm có HAI miệng: (1) mốc đặt ở SÀN HẦM ngay chân thang ra → `RequestStairsIfNeeded` của từng lính thấy "mục tiêu ở tầng khác" nên tự chui xuống miệng gần; (2) cánh tới chân thang ra → mốc nhấc lên mặt đất sau miệng ấy, đẩy tiếp. ⚠ Giữ mốc DƯỚI SÀN suốt pha 1: đặt thẳng lên mặt đất bên kia là lính chọn đường mặt đất (ngắn hơn) và cái hầm thành trang trí.

Phân biệt thang HẦM với thang CẦU: đầu thấp chìm dưới mặt đất ≥ 0.6 (`TerrainGround.SurfaceYAt`; không có đồi thì lấy cao độ ông tướng — ông ta đứng trên mặt đất). Thang ra = thang cùng `LowY` (±0.15) nằm xa hơn về phía địch.

⚠ Làn ĐẤT luôn nằm trong vòng xoay: tướng chỉ có "đi hầm" thì đợt nào cũng chui hầm và tổ canh nhà địch chỉ cần đứng ở miệng hầm.

Tính cách (`CampAiStyle`): QUẤY RỐI gom + xoay (đất→hầm→vòng lưng) · GOM QUÂN gom + giữ một hướng · BIỂN NGƯỜI chia hết · TINH NHUỆ gom lên đường trên cả trận.

## TẦNG NÀO THẤY TẦNG ĐÓ — `FloorBlocksSight` (2026-09-07)

Người dùng: *"lính đang trên ground thì không phát hiện địch dưới hầm mà follow được"*.

Hỏi VẬT LÝ chứ không so "số tầng": giữa hai điểm (chênh cao ≥ 0.8) có collider tag `Ground` không-trigger chắn thì không thấy. Nắp hầm là `Ground` ⇒ dưới hầm vô hình với mặt đất và ngược lại; sàn cầu vượt KHÔNG tag ⇒ trên cầu vẫn thấy (giữ luật *"lính tầm ngắn lên đó để giết lính tầm xa"* 2026-09-04). Chỉ hỏi khi lệch tầng nên không đụng hai người hai bên một quả đồi.

Áp ở bốn cửa: `SelectBestEnemy` · `UpdateEngageNearby` · `HasLivingEnemyWithin` · `FindNearestEnemyRaw`; và `UpdateFloorSight` buông mục tiêu sau 1s bị đất chắn (không đụng vật cản đang đập). `CampHomeGuard.CountIntruders` vẫn đếm theo x: đó là BÁO ĐỘNG, không phải tầm nhìn — tổ canh nhà biết có kẻ dưới hầm nhưng chỉ đánh được khi nó trồi lên miệng.

## KỲ BINH THEO CHUỒNG NGỰA (2026-09-07)

`TeamEconomy.TryTrainAt`: bộ binh mua ở nhà lính có xác suất ra lò đã cưỡi ngựa = `stableCavalryChance` (0.18) + (cấp chuồng − 1) × `stableCavalryPerLevel` (0.10), trần `stableCavalryMax` (0.4). Chưa có chuồng = 0. Chỉ bộ binh (`UnitRole.Melee`). Mua ngựa rời ở chuồng vẫn còn — đây là đường thứ hai. Bảng nhà lính in số % ra — không in thì không ai biết vì sao phải nâng chuồng.

## VỀ CỨU NHÀ: LUẬT ĐÚNG NHƯNG CÓ MỘT CHỐT KHOÁ NÓ LẠI (2026-09-07)

Người dùng: *"tôi qua đánh nhà của địch nhưng tướng địch không quay về ứng cứu, và không mua lính dồn dập ra ứng cứu"*.

`CommandNode.UpdateHomeDefense` đã có đủ luật chia cánh về cứu nhà từ trước, và học thuyết `Doctrine_WarCamp` cũng đã bật `homeDefenseRadius = 10`. Nhưng dòng đầu tiên của hàm chốt `_subordinates.Count < 2` → thoát. Cây chỉ huy của `Demo_20_WarCamp` dựng bằng `ranks: 2, branching: 12` — **một** sở chỉ huy nắm thẳng cả 12 lính, tức gốc chỉ có **ĐÚNG MỘT** cánh. Toàn bộ phần thân hàm chưa từng chạy một lần nào.

**Bài học:** một chốt bảo vệ (`< 2` cánh thì không chia được) có thể vô hiệu hoá trọn một hệ thống khi HÌNH DẠNG dữ liệu ở scene này khác scene mà luật được viết cho. Chốt vẫn đúng logic; cái sai là nó im lặng. Trước khi tin "luật đã có rồi", kiểm xem ở scene ĐANG NÓI TỚI thì điều kiện vào có bao giờ đúng không.

**Luật:**
* Chỉ có MỘT cánh thì kéo chính nó về. Mất nhà là thua ngay; mũi tấn công lát nữa đi tiếp, `homeDefenseMinHold` tự trả nó lại tuyến. Van thật sự là `WinningRace` (nhà địch sắp sập trước thì đánh nốt), không phải số cánh.
* Tín hiệu "nhà đang bị phá" phải ĐO ĐƯỢC: `CommandNode.HomeUnderAttack(teamId)` bật khi **máu nhà TỤT** giữa hai nhịp `SetBaseHealth`. Khác hẳn "có địch quanh nhà" — cung thủ đứng ngoài `homeDefenseRadius` bắn sập nhà thì vế sau mù hoàn toàn.
* Đã có báo động thì **dự bị đang ở hậu cứ không còn là cớ để khỏi về**: nhà tụt máu tức là dự bị đang không cản nổi.
* Ghi **MỐC THỜI GIAN** tự hết hạn, đừng ghi CỜ bật/tắt — cờ thì phải có ai đó nhớ tắt.

### TIỀN VÀ QUÂN PHẢI NGHE CHUNG MỘT TIẾNG CHUÔNG

*"khi bị phá nhà thì ưu tiên giết địch, không cần để dành tiền"*. `TeamEconomy.HomeUnderAttack` đo bằng **tổng máu công trình của phe tụt giữa hai nhịp** (nhà chính + mọi `CampProductionBuilding`), cộng thêm vế `CommandNode.HomeUnderAttack`. Đang báo động thì:

* `UpgradeReserve()` trả **0** — không giữ lại một đồng nào, kể cả `savingsFloor`;
* **không** nâng nhà chính, **không** nâng nhà lính, **không** đặt móng nhà mới (móng chỉ thành nhà sau vài chục giây, trận thì đang phân định ngay bây giờ);
* ngưỡng `_nextTrainTime` hạ 60% ⇒ mua lính dồn dập.

⚠ Hạ **NGƯỠNG ĐỌC** chứ đừng sửa 7 chỗ đặt `_nextTrainTime` — một chỗ sửa, không chỗ nào quên.

⚠ Nhà vừa SẬP cũng làm tổng máu tụt, và đó vẫn đúng là báo động (nhà không tự sập). Nhà mới xây làm tổng TĂNG nên không báo nhầm.

## THANG BẬC MỤC TIÊU CỦA TƯỚNG MÁY (2026-09-07)

Người dùng chốt thứ tự, cao xuống thấp: **giữ nhà mình → phá nhà địch → diệt địch xung quanh → đi tuần các cửa địch có thể chui vào**. Ghi ra đây vì trước đó thứ tự này chỉ nằm rải rác trong từng luật con, nên mỗi luật đều "đúng" mà hợp lại vẫn ra một tướng máy đi lang thang.

| Bậc | Bật khi | Ai thi hành |
|---|---|---|
| 1. Giữ nhà | `CommandNode.HomeUnderAttack` (máu nhà TỤT) | cánh gần nhà nhất **+ chính chủ tướng** |
| — trừ khi | `WinningRace` (nhà địch < 30% máu **và** thấp hơn nhà mình) | đánh nốt, đừng đổi ván thắng lấy ván hoà |
| 2. Phá nhà địch | mặc định | mốc tuyến của gốc |
| 3. Diệt địch quanh mình | có địch trong tầm | `UpdateEngageNearby` (chạy cả khi KHÔNG có mục tiêu) |
| 4. Tuần tra | lúc rảnh | `CampHomeGuard` → `AIBehavior.PatrolRoute` |

### CHÍNH CHỦ TƯỚNG PHẢI VỀ, KHÔNG CHỈ CÁNH CON

*"tôi qua đánh nhà chính của địch, nhưng tướng địch không đuổi theo tiêu diệt tôi hay lính của phe tôi"*.

`UpdateHomeDefense` ghi đè `_order` của một **cánh con**. Chủ tướng đứng ở **GỐC**, mà mốc của gốc tính từ thế trận (`ComputeLineAnchor`) chứ không nhận lệnh của ai — **không có đường nào để ra lệnh cho nó**. Ở trại lính cây chỉ huy lại chỉ có MỘT cánh, nên "chia một cánh về" hoá ra là *quân về mà tướng ở lại*. Đúng cái người dùng nhìn thấy.

Chốt: `_rescueAnchorX` / `_rescueUntil` ghim thẳng mốc tuyến của GỐC vào chỗ kẻ đang phá nhà, đọc ở đầu `ComputeLineAnchor`. Hai mức phân biệt có chủ ý:

* chỉ **thấy địch quanh nhà** → cánh con về là đủ, tướng đánh tiếp (khỏi bỏ mũi công);
* nhà **đang tụt máu** → mất nhà là thua ngay ⇒ tướng về.

⚠ **Bài học chung:** khi một hệ thống "ra lệnh cho cấp dưới", hỏi ngay *ai ra lệnh cho cái gốc?* Gốc không có cấp trên, nên mọi luật viết dưới dạng ghi-đè-lệnh đều **không với tới nó** — phải có một đường riêng.

### TUYẾN TUẦN PHẢI ÔM CỬA, KHÔNG PHẢI ĐỨNG CẠNH CỬA

`AIStatePatrolRoute` chỉ đi **GIỮA** các mốc. Mốc đầu để ở `MouthInnerX + 1.5` = 20.5 ⇒ tuyến [20.5 … 31.5], mà giếng trong ở **19** thì **nằm ngoài tuyến**. Đó lại đúng là giếng nguy hiểm nhất (gần giữa sân nhất = cửa địch chui lên trước tiên): người canh nhà đi qua đi lại suốt trận mà không lần nào ngó tới nó. Nay mốc đầu lùi **vào trong** (`MouthInnerX − 2` = 17) ⇒ tuyến [17 … 34.5] ôm cả hai giếng và đi ngang nhà chính.

⚠ Mốc tuần đặt **PHÍA TRONG** thứ cần canh, không phải phía ngoài. Kiểm bằng cách hỏi *"mốc đầu và mốc cuối có KẸP cái cửa vào giữa không?"*

⚠ Phe **người chơi** cũng phải có người canh: trước để `target: 0, autoDecide: false` ⇒ phe xanh không ai đi tuần và không bao giờ tự quyết, bảng HUD luôn hiện 0 nên đọc ra như hệ thống hỏng. Nay 1 người + tự quyết; người chơi vẫn chỉnh tay đè lên được.

## THỢ CHẠY TRỐN: VỀ KHO CHỈ KHI KHO KHÔNG NẰM BÊN KIA KẺ ĐỊCH (2026-09-07)

`AIStateWork.FleeFromThreat` luôn lấy **hướng kho** làm hướng chạy. Ở mode kinh tế mỏ/rừng nằm NGOÀI CÙNG, kho ở giữa, địch tới từ phía giữa sân — nên trong đúng cái thế thường gặp nhất, "hướng kho" và "hướng kẻ địch" là một: thợ bỏ cuốc rồi **chạy thẳng vào lưỡi kiếm**. Code chạy đúng ý đã viết, không lỗi nào báo.

**Luật:** hướng chạy = hướng kho **chỉ khi** nó trùng hướng ra xa kẻ địch; ngược lại chạy ra xa trước đã, sống rồi `Phase.Find` chọn lại node. Mọi luật "chạy về chỗ an toàn" phải hỏi thêm *"đường về có đi qua kẻ địch không?"*

## TỔ CANH NHÀ CHIA CỬA MÀ CANH (2026-09-07)

Tuyến tuần dài 17.5 (ôm hai giếng + nhà chính). Cả tổ đi chung một tuyến thì dính thành một cụm, cụm ở đâu thì nửa còn lại của trại **không có ai**. Đông mà vẫn hở — nhìn ra là "canh nhà không ăn thua", không phải "thiếu người".

`CampHomeGuard.SpreadRoutes`: 1 người → cả tuyến; ≥ 2 → chẵn canh **nửa trong** (phía giữa sân, địch tới trước), lẻ canh **nửa ngoài** (phía kho/mỏ, chỗ bị vòng lưng). ⚠ Chỉ phát lại khi **số người đổi** — `SetPatrolRoute` mỗi nhịp là cả tổ giậm chân tại chỗ. Đổi tuyến giữa chừng an toàn vì `AIStatePatrolRoute` kẹp chỉ số theo tuyến hiện tại.

### RÀ SOÁT 2026-09-07 — những gì ĐÃ ĐÚNG, đừng sửa lại

Rà cả mode War Camp theo yêu cầu *"xem và cải thiện AI hai team"*. Các hệ sau **đã có và đúng**, ghi lại để lần sau không đi tìm lỗi ở chỗ không có lỗi: tính cách tướng máy chỉ áp cho phe máy (`ApplyStyle` gated `_autoSpend`) · lính mua giữa trận nhập cây qua `TeamEconomy → Enlist` · cả hai phe `autoCommand: true` · `Population`/`RivalArmy` lọc `IsCombatUnit` nên nông dân không làm tướng máy thủ thừa · thợ có dò hiểm hoạ + `StickmanActionType.Work` · ưu tiên xây > đốn > đào có chừa người đào vàng.

## ⚠⚠ BÀN ĐẤU TỰ ĐỘNG — THƯỚC ĐO CHO 70 CÂY × 5 BẬC THÔNG MINH (2026-09-08)

Trước ngày này mọi quyết định cân bằng của dự án đều dựa vào *"nhìn thấy có vẻ mạnh"*.
`Weapons > Balance Report` chỉ đọc **chỉ số trong prefab** — nó biết cây búa ghi 3 sát
thương, nhưng không biết cây búa có bao giờ CHẠM được vào người cầm giáo không.

`BattleSim` (`Assets/Scripts/Gameplay/Modes/BattleSim.cs`) + `Demo_60_BattleLab` đo thứ kia: rig
thật, AI thật, vật lý thật. Mở scene, bấm Play, đọc `Reports/BattleSim_tong_*.csv`.

### Ba quyết định kỹ thuật — mỗi cái là một bẫy đã tránh

1. **`Time.timeScale` cao NHƯNG `fixedDeltaTime` GIỮ NGUYÊN.** Nhân cả `fixedDeltaTime` thì
   chạy nhanh hơn nhiều — và bảng số thu được là bảng của MỘT GAME KHÁC: bước vật lý dài ra
   thì đòn xuyên qua nhau, ragdoll bật khác đi. Đây là cái bẫy chính của mọi bàn mô phỏng.
2. **Đổi bên mỗi hiệp.** Sân không đối xứng tuyệt đối (dốc, thứ tự cập nhật, hướng gió của
   tên). Số hiệp CHẴN thì lệch tự triệt tiêu.
3. **Trần thời gian được GHI LẠI.** Hai cây cùng thủ đứng nhìn nhau tới hết giờ. Ghi "hoà" mà
   không ghi vì sao thì bảng nói dối: 40% hoà vì cân bằng khác hẳn 40% hoà vì AI không biết
   tiến lên.

⚠ Bộ mặc định chỉ **12 cây** (2 415 cặp × 4 hiệp ≈ 9 660 trận là không ai đợi nổi). Muốn rộng
hơn thì sửa mảng `_weapons` ngay trên component trong scene.

⚠ Báo cáo ghi ra `<gốc dự án>/Reports/`, **ngoài** `Assets/` — ghi vào `Assets/` thì mỗi lần
chạy Unity import lại một bảng số tạm thời.

⚠ `BattleSim` đổi `Time.timeScale` toàn cục — CHỈ gắn vào scene bàn thử, đừng gắn vào màn chơi.
