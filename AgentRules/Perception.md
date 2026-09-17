## ⚠⚠ GIÁC QUAN CỦA AI — TAI (`NoiseField`) · BẢN ĐỒ NGUY HIỂM (`DangerField`) · LỰU ĐẠN CÓ Ý ĐỒ · DÁNG LÓ RA BẮN (2026-09-08)

User: *"trong chế độ hiện đại có gì thêm mới, thêm ý tưởng giúp tôi, AI, gameplay, animation
thêm hết vào"*.

Code: `Assets/Scripts/Combat/World/NoiseField.cs` (tai) · `Assets/Scripts/Combat/Weapons/DangerField.cs`
(bản đồ) · `Assets/Scripts/AI/Modules/AIHearingModule.cs` · `Assets/Scripts/AI/Modules/AIGrenadeModule.cs` ·
`StickmanBodyAnimator.PeekStyle` + clip trong `StickmanActionBuilder.AddIdleStyles`.
Số bật/tắt: `AIProfile.hearingScale` · `investigateNoiseRange` · `dangerAvoidWeight` ·
`grenadeIntentRange` · `grenadeFlashRange` · `grenadeCooldown`.

Đọc kèm: [Shooter.md](Shooter.md) (bốn vế "đánh như một tiểu đội" có từ trước) ·
[ModernFront.md](ModernFront.md) · [AI.md](AI.md) · [Animation.md](Animation.md).

---

### 1. VÌ SAO — AI CỦA DỰ ÁN CHỈ CÓ MỘT GIÁC QUAN

Tới trước đợt này, mọi quyết định của `StickmanAgent` bắt nguồn từ đúng một câu hỏi: *thấy hay
không thấy* (`CanSee` + `visionRange` × `WorldLighting.VisionScale`). Với trung cổ thì đủ —
người ta đánh nhau ở tầm hai mét, thấy nhau trước khi nghe nhau. Bắn súng thì ngược hẳn:

- **Súng bắn XA HƠN TẦM NHÌN.** Bị bắn tỉa từ ngoài `visionRange` thì bản cũ không có MỘT cơ
  chế nào để phản ứng — cả tiểu đội đứng chết dần "mà không thấy ai cả".
- **Đêm** kéo tầm nhìn còn 0.65. Không có tai thì màn đêm chỉ làm AI NGU ĐI, chứ không làm nó
  KHÁC ĐI — mà "khác đi" mới là lý do một map có ngày và đêm.
- Không có tai thì **không có giảm thanh, không có bắn-rồi-đổi-ổ, không có lẻn** — mất luôn nửa
  số động từ mà một game bắn súng sống bằng.

Song song, mỗi hệ tự đoán *"chỗ nào nguy hiểm"* một kiểu và **không hệ nào biết điều hệ kia biết**:
`FindCover` chọn vật che gần nhất kể cả cái đang hứng trọn hai khẩu trung liên; `AIStateFlee`
chạy ngược hướng địch — mà trên map ba nước, "ngược hướng nước A" rất hay là "thẳng vào nước B".

---

### 2. `NoiseField` — CÁI TAI

Sổ TĨNH (không phải component: quên kéo object vào scene là cả màn im lặng mà không lỗi nào báo).

| API | Ý nghĩa |
|---|---|
| `Report(at, loudness, teamId, kind, sourceId)` | phát một tiếng. `loudness` là **BÁN KÍNH thế giới**, không phải decibel |
| `TryHear(listener, team, hearing, out Heard)` | tiếng ĐỊCH **nổi bật nhất** nghe được |
| `HearsEnemy(...)` · `LiveCount` | câu hỏi rút gọn / số đo cho bảng soi |

- **Nổi bật ≠ gần nhất**: điểm = `bán kính × tai − khoảng cách`. Chọn theo khoảng cách thì cả
  tuyến quay đầu vì một tiếng sột soạt trong khi quả pháo đang rơi xuống sở chỉ huy.
- **NGHE KHÔNG CẦN NHÌN THẤY** — cố ý không bắn tia kiểm vật cản: tiếng đi vòng qua góc tường,
  và toàn bộ giá trị của cái tai là nó biết những gì con mắt không thấy. Muốn tường chắn tiếng
  thì hạ `loudness` ở nơi phát, ĐỪNG thêm raycast (vài trăm phép mỗi frame cho một hệ vốn chỉ
  cần một phép trừ).

⚠⚠ **VÒNG ĐỆM 96 Ô + GỘP THEO NGUỒN.** Trận ba nước có ~40 khẩu súng, khẩu liên thanh bắn 10
phát/giây ⇒ 400 tiếng/giây. Mỗi phát một ô mới thì **tiếng nhỏ biến mất**: tiếng bước chân của
kẻ đang lẻn vòng sau lưng bị 400 tiếng súng đẩy khỏi vòng đệm trước khi ai kịp nghe. Hệ vẫn
"chạy", chỉ là phần đáng giá nhất của nó không bao giờ xảy ra. Nên mỗi NGUỒN (một khẩu súng,
một cái xe) chiếm **đúng một ô**; báo lại thì làm mới ô cũ. Tiếng TO hơn thay chỗ, tiếng nhỏ hơn
chỉ gia hạn — không thì một tiếng bước chân xoá mất tiếng nổ vừa phát của chính người đó.

⚠ **`GetEntityId().GetHashCode()`, KHÔNG phải `GetInstanceID()`** — hàm kia đã obsolete ở phiên
bản Unity của dự án và làm build ĐỎ.

#### Ai phát ra tiếng

| Nguồn | Bán kính | Ghi ở đâu |
|---|---:|---|
| Phát súng | `RangedWeapon.NoiseRadius` | `RangedWeapon.ReportGunshotNoise` |
| Nổ (lựu đạn · pháo · bom) | `max(12, bán kính nổ × 4)` | `ProjectileController.ReportBlastNoise` |
| Bước chân **khi CHẠY** | 6 | `StickmanFootsteps.ReportStepNoise` |

⚠⚠ **`RangedWeapon._noiseRadius` MẶC ĐỊNH −1 ("tự tính"), KHÔNG PHẢI 0.** Dự án có hơn 60 prefab
vũ khí đã bake; nếu mặc định là 0 thì cái tai ra đời trong trạng thái CẢ SÂN CÂM và chỉ sống lại
sau khi ai đó nhớ bấm lại tool cho từng cây — đúng khuôn *"tính năng làm xong mà không code path
nào chọn tới"*. Trường **MỚI** thêm vào một MonoBehaviour/ScriptableObject thì asset cũ (không có
dòng đó trong YAML) nhận **giá trị khởi tạo trong code**, nên −1 tới được mọi cây súng đã dựng.
Công thức tự tính chia đúng một ranh giới có sẵn: có BĂNG ĐẠN ⇒ là SÚNG (`clamp(tầm × 1.5, 14, 60)`),
không có ⇒ CUNG/NỎ/LAO (4, gần như im). Vì thế không cần một cờ `isFirearm` thứ hai.
`_noiseRadius = 0` **là** khai báo GIẢM THANH — Doctor «Cái TAI của AI bị bịt» réo nếu cây đó
không nằm trong `StickmanDoctor.SilencedWeapons`.

⚠⚠ **TIẾNG BƯỚC PHẢI BÁO TRƯỚC MỌI CỬA CỦA PHẦN ÂM THANH.** `StickmanFootsteps` bản cũ thoát ngay
dòng đầu khi `_source == null`, mà phần lớn prefab CHƯA gán clip bước chân — nối tiếng-của-AI vào
tiếng-của-loa thì cả sân đi lại như ma. Cùng lý do, `NoiseField` và `StickmanAudio` là **hai hệ
tách rời**: gộp lại là một cây súng chưa có file `.wav` trở thành cây súng giảm thanh mà không ai
khai báo điều đó.

⚠ **ĐI BỘ = IM (bán kính 0).** Đây là động từ RÓN RÉN của cả dự án: muốn lẻn thì đi, muốn nhanh
thì chấp nhận bị nghe. 6 < tầm nhìn ban ngày (9) nên ban ngày nó gần như không đổi gì; ban đêm
mắt tụt xuống dưới 6 và lúc đó **tai mới là thứ phát hiện kẻ chạy vòng sau lưng**.

---

### 3. `DangerField` — BẢN ĐỒ NGUY HIỂM

⚠ **ĐỪNG NHẦM VỚI `ThreatBoard`.** Hai tên rất giống, hai câu hỏi khác hẳn:

- `ThreatBoard` = **SỔ HUNG THẦN**, hỏi về MỘT NGƯỜI: *"thằng kia vừa giết mấy mạng?"*
- `DangerField` = **BẢN ĐỒ**, hỏi về MỘT CHỖ: *"đứng ở toạ độ x thì có chết không?"*

Cố ý không gộp: gộp thì "chỗ nguy hiểm" phải đi hỏi từng người xem ai đang đứng đâu — đúng cái
vòng lặp mà bản đồ sinh ra để thay thế.

**MỘT CHIỀU LÀ ĐỦ** và đó là món quà của góc nhìn ngang: mảng theo trục X, ô rộng 2.0, mỗi phe
một lớp. Rẻ hơn lưới hai chiều vài trăm lần. ⚠ Đừng "nâng cấp" lên hai chiều vì nghe sang hơn —
giá phải trả là thật, cái lợi thì chưa ai đo được.

⚠⚠ **CHỈ SỐ LÀ PHE BỊ THIỆT, KHÔNG PHẢI PHE BẮN.** `Add(x, team, amount)` = *"chỗ x nguy hiểm
ĐỐI VỚI phe team"*. Ghi nhầm chiều thì mọi thứ vẫn chạy, số vẫn đẹp, và cả tuyến đi tìm chỗ nấp
**ở đúng chỗ vừa có người của mình bị bắn chết** — hỏng hoàn toàn mà không lỗi nào báo.

| Nguồn | Điểm | Vì sao |
|---|---:|---|
| `TeamMember.AnyDied` (tự động, chỉ tính NGƯỜI) | 1.0 | bằng chứng mạnh nhất, nhưng THƯA và tới quá muộn |
| Agent trúng đòn (`StickmanAgent.OnOwnerDamaged`) | 0.25 | nguồn DÀY — bản đồ phải sáng lên TRƯỚC khi có người chết |
| Đứng trong bán kính một vụ nổ | 0.5 | chỉ ghi cho phe của người ĐANG đứng trong tầm, không rải cả map |

Phân rã theo half-life 6 s (không dùng ngưỡng bật/tắt — ngưỡng cứng đặt trên một con số đang trôi
thì mỗi lần nó đi qua mốc là cả tuyến đổi quyết định một lượt, đúng cặp luật giằng nhau §5c).
Công trình sập KHÔNG ghi sổ: chân cổng bị đánh dấu "chết chóc" là cả cánh quân né luôn con đường
duy nhất vào thành.

⚠⚠ **ĐĂNG KÝ EVENT PHẢI Ở PHA MUỘN HƠN PHA DỌN SỔ.** `TeamMember.ResetStatics` đặt thẳng
`AnyDied = null` ở pha `SubsystemRegistration`, và `DangerField` **cùng assembly** (`Xoi.Stickman.Combat`).
Unity không hứa thứ tự giữa hai hàm cùng pha trong cùng assembly ⇒ đăng ký ở đó là canh bạc 50/50,
rơi nhánh xấu thì bản đồ trắng suốt trận mà không lỗi nào báo. Nên `DangerField` dọn sổ ở
`SubsystemRegistration` và **nối dây ở `BeforeSceneLoad`**. (`ThreatBoard` thoát bẫy nhờ nằm ở
assembly `Xoi.Stickman.AI` — nạp sau `Combat` vì có tham chiếu. Đó là MAY, không phải luật.)

#### Ai đọc bản đồ

- **`CoverTactics.Find`** cộng `DangerField.At(x, phe) × dangerAvoidWeight` vào điểm chỗ nấp.
  Hai bao cát giống hệt nhau về hình học, nhưng một cái vừa có hai đồng đội gục sau lưng — bản
  trước không phân biệt được, nên cả tiểu đội lần lượt chạy vào đúng cái ổ đó, mỗi người một lượt.
- **`AIStateRetreat` — VÁCH LỬA CŨNG LÀ MỘT CÁI VỰC.** `IsLedgeAhead` chặn cái vực bằng ĐẤT;
  vế này chặn cái vực bằng ĐẠN. Điều kiện hai vế: phía trước (cách 6 đơn vị) đã có ≥ 1 cái chết
  còn nóng **và** chết chóc hơn HẲN chỗ đang đứng (`> here × 1.5 + 0.5`) — vì "phía trước có
  nguy hiểm" thì giữa trận lúc nào chả đúng. Gặp vách lửa thì `BeginLastStand` tại chỗ.
- `SaferSide(x, team, lookAhead)` có sẵn cho hệ sau (chọn chỗ đổ bộ, chọn mục tiêu pháo, đặt mìn).
  ⚠ Hai bên bằng nhau trả **0**, không trả +1: mặc định một hướng nghĩa là cả tuyến chạy dồn về
  một phía trong ván đầu, lúc bản đồ còn trắng.

⚠ `dangerAvoidWeight` mặc định **2.5** (phá lệ "0 = tắt" của `AIProfile`) — không có rủi ro đổi
hành vi màn cũ, vì đầu trận bản đồ TRẮNG nên số này nhân với 0.

---

### 4. `AIHearingModule` — BA MỨC PHẢN ỨNG

⚠⚠ **CHỐT CHẶN CHÍNH: NGHE CHỈ CÓ TÁC DỤNG KHI KHÔNG THẤY GÌ.** Module tự tắt ngay dòng đầu khi
`agent.TargetAlive`. Thiếu vế đó thì mỗi phát súng bên kia sân giật một người ra khỏi trận đánh
của họ và cả tuyến quay như chong chóng theo tiếng ồn to nhất. **Tai lấp khoảng trống của MẮT,
không cạnh tranh với nó** — đó cũng là lý do hệ này an toàn cho cả 4 thể loại đang chạy.

1. **QUAY MẶT** về hướng tiếng — luôn luôn, rẻ nhất, và là thứ người xem đọc ra đầu tiên.
2. **NGHI NGỜ / BÁO ĐỘNG** qua `StickmanAgent.RaiseAlert` — dùng lại nguyên hệ tầm nhìn quạt của
   chế độ ám sát, KHÔNG đẻ hệ báo động thứ hai. Tiếng NỔ báo động ngay; tiếng khác chỉ gây nghi ngờ.
3. **ĐI TỚI XEM** — chỉ khi `investigateNoiseRange > 0` (mặc định **0**: lính gác chốt và lính
   đang giữ vật che PHẢI đứng yên; "đi tra tiếng động" là cách nhanh nhất để bỏ trống một cái cổng).

⚠ **CÓ MỎ NEO.** Đi tra thì đo từ CHỖ ĐỨNG BAN ĐẦU (`_postX`), không phải chỗ hiện tại. Đo từ chỗ
hiện tại thì mỗi tiếng súng mới lại nới thêm bán kính một lần, và anh lính gác đi bộ hết bản đồ
trong ba phút — mỗi bước đều "trong bán kính cho phép".

---

### 5. `AIGrenadeModule` — BA QUẢ, BA CÂU HỎI KHÁC NHAU

Dự án đã có đủ mảnh (ba `WeaponType`, `sideArms` của bốn lực lượng, `AreaHazard`, `SmokeBlocks`).
Thiếu đúng **một cái đầu quyết định ném quả nào, lúc nào, vào đâu**. Cửa duy nhất trước đây là
`AIWeaponSwapModule` nhánh 1 — *"địch túm tụm ≥ 3 thì rút vũ khí NỔ"* — đúng với quả nổ, sai với
cả ba quả kia:

| Quả | Ném khi | Vào đâu |
|---|---|---|
| **KHÓI** | Bị chặn đường bắn, địch còn xa (≥ 9), và giữa hai bên là BÃI TRỐNG | **60 %** quãng đường — che TUYẾN, không che mặt địch |
| **CHỚP** | Địch nấp sau vật che **và** đủ gần để xông vào (≤ `grenadeFlashRange`) | thẳng vào chỗ địch |
| **LỬA** | Địch nấp sau vật che ở tầm XA (không định xông), hoặc ≥ 3 địch tụ một chỗ | thẳng vào chỗ địch — ép nó rời chỗ nấp |

⚠⚠ **KHÓI CHE CẢ HAI CHIỀU.** `StickmanAgent.SmokeBlocks` không hỏi ai ném quả đó. Nên ý đồ KHÓI
chỉ bật khi người này **đang bị chặn đường bắn** — đằng nào cũng không bắn được — và cái nó mua
là quyền **ĐI**. Bỏ vế đó thì cả tuyến ném khói vào mặt nhau rồi đứng thộn trong sương mù.

⚠ **MỘT QUẢ MỘT LÚC + NGUỘI** (`grenadeCooldown`, 11 s ở hồ sơ `BanSung`): không có đồng hồ thì
một người ném hết ba quả trong một giây rưỡi vì cả ba điều kiện cùng đúng ở cùng một khung hình.

⚠ **KHÔNG NÉM QUA ĐẦU ĐỒNG ĐỘI ĐANG Ở PHÍA TRƯỚC** — đường bay cầu vồng nên `HasLineOfFire` không
trả lời được câu này; kiểm bằng khoảng cách theo X (đồng đội trong 55 % quãng đường ⇒ thôi).

⚠ **LỰC NÉM = `sqrt(tầm muốn / tầm tối đa) + 0.1`, sàn 0.35.** Đạn cầu vồng đi được quãng đường
tỉ lệ BÌNH PHƯƠNG vận tốc, còn lực tích nội suy tuyến tính vào vận tốc. Cộng thêm một chút vì hai
sai lầm **không cân nhau**: ném HỤT là quả khói rơi dưới chân mình (tự bịt mắt mình — đúng tai nạn
hệ này sinh ra để tránh), ném QUÁ thì quả khói rơi sau lưng địch mà vẫn che được tuyến.

⚠ Luồng **cầm → ném → trả súng** vẫn chỉ có MỘT bản: `ShooterKit.QuickThrow(index, charge)`.
Module không tự dựng bản thứ hai; nó chỉ chọn *quả nào* và *ném mạnh cỡ nào*.

---

### 6. DÁNG **LÓ RA BẮN** (`StickmanBodyAnimator.PeekStyle`)

Hệ nấp bắn đã đúng về LUẬT từ 2026-09-07. Nhưng nửa *"đứng dậy bắn"* của cái nhịp ló-ra/thụt-vào
dùng **dáng đứng thường** — cùng dáng với anh lính rảnh đứng thở giữa hậu cứ. Trên màn hình, hai
trạng thái đối lập nhất của một trận đấu súng chỉ khác nhau đúng một cú hạ người. Vế *"AI biết
nấp bắn"* vì thế mới đúng một nửa: **máy tính đã biết, người xem chưa đọc được.**

- Là **STYLE của `Idle`**, không phải `StickmanActionType` mới — đúng tiền lệ `qi` / `duel` /
  `sentry`: tư thế LẶP-VÀ-GIỮ theo trạng thái, cắt được bởi mọi thứ của chiến đấu. Loại mới thì
  phải nối lại `IsAmbientClip` + bảng ưu tiên + `DefaultOvershoot` + `DefaultLegWeightWhileMoving`,
  mà `UpdateAmbientAction` **vẫn** ép `Idle` đè lên mỗi frame vì nhân vật đang đứng yên.
- Số lấy từ `duel` (đã chạy tốt) và chỉ đổi hai trục: `bodyAngle` −5 → **+7 (chồm tới, tì vào mép
  vật che)**, `height` −0.16 → **−0.12** (vẫn thấp nhưng phải ló đủ để nhìn qua mép), `headAngle`
  sang ÂM (cúi theo đường ngắm). Nhịp 0.9 s — ngắn hơn `duel`, đọc ra là thở gấp.
- ⚠ **KHÔNG ĐỤNG TAY** (`Key` chứ không `KeyArms`): dáng CẦM SÚNG phải là chủ tuyệt đối ở đúng
  khoảnh khắc cây súng đang nhả đạn.
- ⚠ **Ưu tiên: thua `sentry`, THẮNG `duel`.** Phải thắng thế tấn, không thì dáng này KHÔNG BAO GIỜ
  ra — `CombatStrategyBase.Tick` xin thế tấn mỗi frame hễ đang giáp mặt một đối thủ biết vung, mà
  lính nấp sau bao cát thì luôn đang giáp mặt ai đó.
- ⚠ Chỉ xin khi ĐỨNG. Đang nằm/ngồi thì `Idle` không còn là động tác nền và dáng này chọi với
  dáng bò — hai chỗ cùng ghi một tư thế.

---

### 7. BẪY IM LẶNG ĐÃ BIẾN THÀNH PHÉP ĐO

| Doctor | Bắt cái gì |
|---|---|
| «Cái TAI của AI bị bịt» | súng khai `_noiseRadius = 0` (AI không bao giờ nghe thấy nó) · có hồ sơ bật `grenadeIntentRange` mà KHÔNG nền văn minh nào khai `sideArms` |
| «Playbook khai modules tay…» | playbook khai `modules` tay mà thiếu `Hearing` / `Grenade` ⇒ phe đó điếc / không ném quả nào |
| «…thiếu style Idle» | bộ động tác chưa bake `peek` ⇒ `Pick` lặng lẽ rơi về dáng ngẫu nhiên |

### 8. PHẢI BẤM LẠI TOOL

```
Tools > Stickman > ★ Bảng điều khiển
  1. Animation › «Build Action Sets (4 bộ)»          → bake dáng `peek` vào cả 5 bộ
  2. AI       › «Build AI Personalities»            → nạp số mới cho AIProfile_BanSung
  3. AI       › «Bộ AI theo gameplay»               → playbook nhận hai module mới
  4. Rig & Kiểm tra › «★ KHÁM SỨC KHOẺ DỰ ÁN»       → phải không có mục đỏ mới
```

⚠ Bảng số động tác nằm trong **CODE**, asset là bản **BAKE**: sửa `StickmanActionBuilder` mà quên
bấm bước 1 thì animator xin một cái tên KHÔNG TỒN TẠI và `Pick` rơi về bốc ngẫu nhiên — nhân vật
vẫn có dáng, không lỗi nào báo.

Trạng thái 2026-09-08: code biên dịch sạch (`Docs/Tools/Verify.ps1`, 0 lỗi). **CHƯA bấm bốn nút
trên** — dáng `peek` và các số mới của `AIProfile_BanSung` chưa tồn tại trên đĩa cho tới khi bấm.
