# Thuỷ chiến — thuyền, AI trên thuyền, hải tặc

> Đọc file này TRƯỚC khi sửa bất cứ thứ gì trong `Assets/Scripts/Naval/`.
> Tóm tắt một dòng: **con thuyền là MỘT MẢNH ĐẤT BIẾT ĐI, có máu và chìm được.**
> Mọi thứ khác trong dự án không cần biết nó tồn tại.

---

## 0. Vì sao thuỷ chiến là phép thử tốt cho kiến trúc

Dự án đã có: rig, ragdoll, 20 vũ khí, FSM 12 hành vi, chỉ huy phân cấp, công sự, hệ map.
Thuỷ chiến đụng vào GẦN NHƯ TẤT CẢ, nhưng đúng ra chỉ được phép thêm **hai khái niệm mới**:

| Khái niệm mới | Vì sao hệ cũ không có |
|---|---|
| **SÀN DI ĐỘNG** | `StickmanLocomotion` ghi đè `velocity.x` mỗi nhịp — mọi mặt đất trong dự án đứng yên |
| **ĐƯỜNG ĐI ≠ HƯỚNG TỚI ĐỊCH** | mọi state đều `MoveTowardsX(target.x)`; giữa hai thuyền là NƯỚC |

Còn lại đều là đồ cũ dùng lại: máu thuyền là `Fortification`, chòi quan sát là `GarrisonPost`,
dây leo là `StickmanClimbZone`, chết đuối đi qua `TakeDamage`, mép boong là mép vực, luật
thắng là `MatchModeBase`. **Chỗ nào phải viết mới cái thứ ba là chỗ đó đang thiết kế sai.**

---

## 1. Giải phẫu một con thuyền

```
Ship_<Tên>                     ← ShipVessel + Rigidbody2D KINEMATIC  (chỉ MỘT RB cho cả thuyền)
├── Visual                     ← nhóm NGHIÊNG khi chìm
│   ├── Than                   ← ShipHull : Fortification + TeamMember, collider TRIGGER
│   │   └── Mau/Fill           ← thanh máu thân thuyền
│   ├── CotBuom · Buom · Co
├── Boong                      ← BoxCollider2D ĐẶC = ĐẤT THẬT (ngoài Visual, giữ phẳng)
├── ChoiQuanSat                ← sàn một chiều (PlatformEffector2D)
├── DayLeo                     ← StickmanClimbZone
├── ChoDungBan                 ← GarrisonPost
├── Phao_N/Nong                ← ShipCannon + đầu nòng
├── Suat/…                     ← ShipStation (TayLai · SuatPhao · SuatBan)
└── VanApMan/Van               ← BoardingPlank (tắt sẵn, bật khi móc xích)
```

### ⚠ Bốn luật cấu trúc, phá cái nào cũng hỏng câm

**1. THUYỀN KHÔNG ĐƯỢC LÀ `StickmanController`.**
Nhìn thì giống công sự (có máu, phá được) nên phản xạ đầu tiên là cho `ShipVessel` kế thừa
`Fortification`. Làm vậy là hỏng NGAY: `StickmanLocomotion.HasGroundAt` cố tình bỏ qua mọi
collider có `StickmanController` ở nhánh cha (*"người không phải đất"*). Boong khi đó không
được tính là mặt đất → **mọi người trên thuyền bị coi là ĐANG RƠI**: không nhảy được, không
chặn được mép, `StickmanBodyAnimator` chơi động tác rơi vĩnh viễn. Không có lỗi nào báo.
→ Root là MonoBehaviour thuần; máu nằm ở con `ShipHull`.

**2. CHỈ MỘT `Rigidbody2D`, ĐẶT Ở ROOT.**
Thêm RB riêng cho thân thuyền là collider của nó thành một body khác, `MovePosition` của root
kéo boong đi còn thân đứng lại — con thuyền tách làm hai. `StickmanController._rigBody` đã
null-safe ở mọi đường (tiền lệ: `BaseBuilding`).

**3. BOONG KHÔNG NẰM TRONG NHÓM `Visual`.**
Nhóm đó nghiêng khi chìm. Boong nghiêng là người đứng trên trượt lung tung. Thân/buồm/cờ thì
nghiêng, boong giữ phẳng rồi **tắt hẳn** khi chìm quá 55%.

**4. THÂN THUYỀN LÀ COLLIDER TRIGGER.**
Tường thành phải cản chân, thân thuyền thì không — người đi trên boong đứng ngay phía trên nó.
Để đặc là quân trên boong bị chính thuyền mình chặn lối, và `StickmanAgent.ProbeObstacle`
(vốn bỏ qua trigger) sẽ nhận thân thuyền của phe địch làm vật cản đáng đập giữa lúc đang
đánh nhau trên boong.

---

## 2. SÀN DI ĐỘNG — sửa lõi ở đúng một chỗ

`StickmanLocomotion.FixedUpdate` là **chỗ duy nhất ghi vận tốc** trong cả dự án (đó là lý do
chặn mép vực đặt ở đó). Nên vế "thuyền đi thì người đi theo" cũng phải đặt đúng ở đó:

```csharp
float carrierX = CarrierVelocity.x;
velocity.x = carrierX + Mathf.MoveTowards(velocity.x - carrierX, targetX, accel * dt);
```

Tức là **tính trong hệ quy chiếu của boong**. Nhờ đặt đúng chỗ, mọi nguồn di chuyển đều dính
mà không nguồn nào phải biết mình đang trên thuyền: người chơi, AI, giãn cách đội hình, né đạn,
kite, rút lui, gỡ kẹt.

**Con thuyền được DÒ RA TỪ CHÍNH TIA DÒ ĐẤT ĐÃ CÓ** (`RefreshProbes` → collider trúng →
`attachedRigidbody` → `GetComponent<ShipVessel>()`, có cache theo instance). Không có hàm
"lên thuyền"/"xuống thuyền" nào cả — nên nhảy sang thuyền khác, bị hất văng, hay spawn giữa
boong đều đúng, không ai phải nhớ gọi gì.

### Ba vế phụ, thiếu vế nào cũng thấy ngay

| Vế | Thiếu thì sao |
|---|---|
| `MeasureTravel` **trừ** `CarrierVelocity` | đứng im trên thuyền chạy mà chân quạt rối rít (`TravelSpeed` là thứ `StickmanLegWalker` đọc) |
| Giữ `_carrier` khi ĐANG BAY | nhảy trên boong là bị hãm lại giữa trời, tiếp đất đã lùi mấy mét |
| Buông `_carrier` khi thuyền tắt | thuyền chìm xong người vẫn ăn vận tốc của một con thuyền không còn tồn tại |

### `SetSwimming` — ô hệ số RIÊNG

Dưới nước đi chậm. Hệ số đó **để riêng**, không dùng chung ô với vật cưỡi / giáp / trạng thái
(`SpeedScale = _speedMultiplier × _encumbrance × _statusSlowdown × _swimScale`). Đây là lần
thứ tư áp cùng một luật đã ghi trong AGENTS.md: bốn chủ khác nhau ghi chung một biến thì chủ
nào ghi sau thắng, và triệu chứng là *"rơi xuống nước xong bộ giáp hết nặng"*.

---

## 3. Áp mạn — vì sao phải có state riêng

`AIStateSeek` đi tới mục tiêu bằng `MoveTowardsX(target.x)`. Trên biển cái đó **hỏng câm**:
giữa hai thuyền là nước, mà chặn mép vực nằm ngay tại chỗ ghi vận tốc → lính đi tới mạn rồi
đứng đó vĩnh viễn, giơ kiếm về phía thằng địch cách bốn mét. Van gỡ kẹt
(`UpdateDeadlockBreaker`) thì bật **XÔNG LIỀU**, tức là dí mặt vào lan can mạnh hơn.

Cái thiếu là một khái niệm: **đường đi không trùng với hướng tới mục tiêu**. Muốn sang bên kia
thì phải đi tới TẤM VÁN trước, dù tấm ván nằm ngược hướng với kẻ định giết — cùng lý do
`AIStateGarrison` phải có pha "tới chân thang" thay vì đi thẳng tới chỗ đứng bắn.

### Bốn pha của `AIStateBoarding` (`AIBehavior.Board`)

```
DỌN BOONG  →  CHỜ Ở MẠN  →  QUA VÁN  →  SANG TỚI NƠI (trao lái cho FSM thường)
```

- **DỌN BOONG đứng TRƯỚC TẤT CẢ.** Đang chuẩn bị tràn sang mà sau lưng có địch vừa nhảy vào
  thì quay lại đánh mới đúng. Bỏ vế này là hai bên đi xuyên qua nhau, mỗi bên chiếm một con
  thuyền rỗng.
- **CHỜ Ở MẠN: cận chiến ĐỨNG, tầm xa BẮN.** Chưa có ván thì cận chiến không có việc gì ngoài
  đứng đúng mạn mà chờ (đứng sẵn để lúc ván bắc ra thì tràn qua NGAY). Tầm xa thì trao lái cho
  `CombatState` — nước không cản mũi tên, và đó chính là nhịp đấu pháo của trận. Trao lái cho
  cận chiến là quay lại đúng cảnh dí mặt vào lan can.
- **QUA VÁN đi HAI CHẶNG** (giữa ván → boong địch). Mốc trung gian giữ cho lính bám đúng trục
  tấm ván lúc bị lực giãn cách xô ngang.
- **`OwnsTraversal` = true khi đang qua ván.** Một cú nhảy qua khe giữa tấm ván rộng nửa mét
  là rơi xuống biển (cùng bài học với `AIStateGarrison` / `AIStateInfiltrate`).
- **`HandOff()` KHÔNG gọi `DefaultState()`** — hành vi của lính này vẫn là `Board`, gọi
  `DefaultState()` là quay lại chính state này: vòng lặp vô tận.

### Ván áp mạn: phải KHOÁ THUYỀN trước

`BoardingPlank.Deploy` gọi `ShipVessel.Grapple` trước khi bật tấm ván. Hai thuyền trôi độc lập
thì đầu kia tuột khỏi mạn ngay nhịp sau và người đang đi giữa ván rơi xuống biển. Khoá lại
chính là **ÁP MẠN** — đúng cách thuỷ chiến thật diễn ra, và nó biến hai con thuyền thành MỘT
sàn đấu.

⚠ **VÁN NẰM NGANG → hai hạng thuyền phải cùng `deckHeight`.** Hệ di chuyển ghi thẳng vận tốc
ngang nên mặt dốc thì trượt (đúng lý do công sự phải dùng CẦU THANG BẬC RỜI thay vì dốc
nghiêng). `Deploy` kêu lên console khi chênh quá `_maxDeckGap`, chứ không im lặng bắc một cây
cầu không ai qua được. Mọi hạng trong `StickmanNavalBuilder.Specs` để **1.1**.

⚠ **ĐÃ MÓC XÍCH THÌ KHÔNG RÚT ĐƯỢC** (`ShipCaptain.ShouldRetreat`). Không có luật này thì
thuyền vừa bắc ván, quân vừa tràn sang, hụt máu một chút là thuyền trưởng ra lệnh rút — bung
xích, thu ván, và toàn bộ đội áp mạn kẹt lại trên thuyền địch trong khi thuyền nhà bỏ đi.
Áp mạn là quyết định MỘT CHIỀU.

---

## 3b. ⚠ VÌ SAO LÍNH TỪNG TỰ NHẢY XUỐNG BIỂN (đã sửa, đừng làm lại)

Triệu chứng: đánh được một lúc thì quân hai bên **lần lượt nhảy khỏi mạn thuyền và chết đuối**,
không ai bắn phát nào. Nhìn như AI phát điên, thật ra là hai luật đúng ghép lại thành một luật sai.

`StickmanAgent.UpdateJumpOverGap` cũ hỏi đúng ba câu: *có mép trước mặt không · địch có ở bên
kia không · đã hồi đủ nhịp nhảy chưa*. **Không có câu nào hỏi bên kia CÓ GÌ.** Trên bộ nó sống
sót được vì khe vực thường hẹp và bên kia thường có đất. Trên biển thì "bên kia mép" là mặt
nước trải dài tới chân trời, mà địch thì luôn đứng ở đó — nên điều kiện nhảy đúng MỌI LÚC.

Chữa ở GỐC, không chữa ở thuyền: `StickmanLocomotion.HasLandingSpot(direction, maxDistance)`
dò vài điểm phía trước xem có mặt đất nào đứng được không, và `UpdateJumpOverGap` bắt buộc
phải qua nó (`AIProfile.jumpGapReach`, mặc định 2.6).

Đặt ở tầng locomotion vì đây **không phải bệnh của thuỷ chiến** — nó là bệnh của mọi map có
hố sâu, chỉ là trên biển thì lộ ra ngay. Vá riêng cho thuyền (kiểu "nếu đang ở trên thuyền thì
đừng nhảy") là để nguyên cái bug cho map khác, và đẻ thêm một nhánh `if (isShip)` đúng thứ
AGENTS.md dặn tránh.

⚠ **Ba chỗ khác cùng bệnh, đã vá cả ba:**

| Chỗ | Cũ | Nay |
|---|---|---|
| `AINavalModule.Abandon` | thuyền chìm thì tới mép là NHẢY | chỉ nhảy khi bên kia có chỗ đáp — không thì con thuyền chìm thành bàn đạp nhảy xuống biển |
| `BoardingPlank.Update` | bung xích là thu ván ngay | **không thu ván khi còn người đang đi trên đó** — thu đúng lúc đó là người ta rơi thẳng xuống nước |
| `AIProfile` thuỷ thủ/hải tặc | `retreatHealthPercent` mặc định | để **0** — trên biển không có chỗ chạy, xem §9 |

Còn hai đường xuống nước vẫn CÒN và **cố ý giữ**: bị đánh văng khỏi mạn (knockback là vật lý
thật, chặn nó là mất luôn cảm giác của cú búa), và đứng trên boong một con thuyền chìm hẳn.

---

## 4. Con thuyền cần NGƯỜI — đây là cái khác biệt lớn nhất so với bộ chiến

`ShipStation` là một suất làm việc: **Helm** (tay lái) · **Gun** (pháo thủ) · **Marine**
(chỗ đứng bắn). Cả ba đều là **ĐẦU VÀO GHI MỖI FRAME**, không phải cờ bền — cùng khuôn
`StickmanLegWalker.SetActionLegs` và `StickmanAgent.RequestSentry`:

```
ShipStation.Update  →  người giữ suất còn SỐNG và còn ĐỨNG ĐÚNG CHỖ?
                       Helm → vessel.RequestHelm()
                       Gun  → cannon.RequestFire(gunner)
```

Nhờ vậy **giết người lái là con thuyền TRÔI**, đánh văng pháo thủ khỏi vị trí là khẩu pháo im,
và thuyền chìm kéo cả tổ xuống nước cũng tự làm liệt con thuyền — cả ba mà không có một dòng
xử lý riêng nào. Đây là thứ làm thuỷ chiến khác bộ chiến: **giết một người thì liệt cả con
thuyền, không phải chỉ trừ đi một mạng.**

### Bánh lái phải NHÌN THẤY ĐƯỢC

`ShipStation` là một điểm vô hình. Nếu chỉ có nó thì cách duy nhất để người chơi biết chỗ nào
lái được là đi mò dọc boong tới khi ô hỏi hiện lên — và ai không mò trúng sẽ kết luận là
thuyền không lái được. Nên mỗi thuyền dựng kèm một **BÁNH LÁI** (`Ship_Wheel`, `BuildWheel`)
đặt đúng chỗ đứng, ở ĐUÔI thuyền. Một cái bánh lái vẽ sẵn giải thích luật chơi mà không cần
một dòng chữ nào.

⚠ Bánh lái treo vào ROOT chứ không vào `Visual` — `Visual` nghiêng lúc chìm, mà bánh lái phải
đứng đúng chỗ `ShipStation` cho tới lúc boong tắt hẳn.

### Dáng đứng lái thuyền

`StickmanBodyAnimator.HelmStyle` = `"helm"` — lại là một **STYLE của `Idle`**, không phải một
`StickmanActionType` mới, đúng tiền lệ dáng canh gác. Thêm loại động tác mới thì phải nhớ khai
tên vào `IsAmbientClip` (clip `loop` mà quên là nhân vật **kẹt cứng** ở tư thế đó tới lúc chết),
phải lo `Play`/`Pick`/độ ưu tiên. Thêm một style thì cả bộ máy chạy nguyên.

Ba thứ làm nên "đang lái" (xem `StickmanActionSetBuilder`): hai tay ra trước ngang nhau nắm
vành (`ActionArmMode.Override` — `Blend` thì pose cầm vũ khí kéo tay về thế thủ, thành nửa nắm
lái nửa giơ kiếm) · chân tấn rộng · nhún theo sóng. Vế thứ ba là thứ làm con thuyền có cảm
giác đang chạy dù boong vẽ ra vẫn phẳng.

⚠ **`IsSteering` TỰ HẾT HẠN sau một frame** (`RequestSteering()` ghi mỗi frame), khác
`IsStandingWatch` vốn do agent dọn hộ. Lý do: **người chơi KHÔNG có `StickmanAgent`**, nên
không có nhịp nào dọn cờ hộ. Bắt bên gọi nhớ tắt là buông lái xong vẫn ôm bánh lái vô hình đi
khắp boong — mà chỗ "nhớ tắt" lại nằm đúng ở những đường hiếm chạy (chết, thuyền chìm).

⚠ Bộ động tác trên đĩa **phải dựng lại** mới có style này, nên `Naval > 2` gọi thẳng
`StickmanActionSetBuilder.EnsureAll(rebuild: true)`. `EnsureAll(false)` sẽ thấy bộ cũ còn đủ
rồi bỏ qua, và `Pick` không thấy tên style sẽ rơi về idle ngẫu nhiên: **không lỗi, chỉ là
không thấy dáng lái**.

### Người chơi cầm lái — `ShipHelmPrompt`

Đứng gần bánh lái thì hiện **ô bấm được** "[F] Cầm lái"; đang lái thì "[F] Buông lái · ◀ ▶ bẻ lái".

- **Là `GUI.Button`, không phải `GUI.Label`.** Luật giao diện của dự án: mọi tính năng phải
  dùng được CHỈ BẰNG NGÓN TAY. Bảng chỉ huy từng vẽ dòng `[F9] hiện bảng` bằng nhãn nên trên
  điện thoại **không có cách nào mở** — im lặng biến mất trên nửa số máy.
- **Phím F, không dùng chung E với nhặt đồ**: đứng ở bánh lái mà dưới chân có cây kiếm rơi thì
  một phím hai việc.
- **Trái/phải lúc cầm lái là BẺ LÁI, không phải bước chân**: `UseMoveInput` bị tắt và cùng bộ
  phím/cần ảo đó chuyển sang `ShipVessel.SteerManual`. Không tắt thì bấm sang trái là vừa bẻ
  lái vừa đi khỏi bánh lái, mà `ShipStation` thấy người rời vị trí là cắt luôn tay lái — bấm
  lái thì mất lái, một vòng luẩn quẩn không ai hiểu tại sao.
- **`SteerManual` ĐÈ lệnh thuyền trưởng theo TỪNG FRAME**, chứ không tắt hẳn `ShipCaptain`:
  ông ta còn lo móc xích và bắc ván. Tắt là người chơi lái sát mạn thuyền địch mà không có cầu
  nào bắc ra, và trận đứng lại. Ưu tiên tính theo frame chứ không theo thứ tự `Update` — thứ
  tự giữa các component là thứ Unity không bảo đảm.
- **Buông lái ở BỐN đường**: bấm lại · chết · thuyền chìm · mất suất. Thiếu đường nào là có một
  cách để người chơi kẹt vĩnh viễn trong trạng thái "đang lái" mà không đi lại được.

### `AINavalModule` — ai đi vào suất, ai bỏ thuyền

Chạy ở pha `AfterState` (GIÀNH TAY LÁI khỏi state, cùng nhóm với module đi nhặt vũ khí).
Nằm trong `AIModuleLibrary.DefaultKinds` và **tự tắt ngay dòng đầu** khi scene không có
`WaterZone` — cùng lý do `AICavalryRaidModule` nằm trong bộ mặc định: để ngoài thì phải nhớ
khai tay ở từng playbook, mà quên một chỗ là cả thuỷ thủ đoàn đứng chết đuối theo con thuyền
và **không có lỗi nào báo**.

Hai việc, đúng thứ tự:

1. **THUYỀN CHÌM THÌ BỎ THUYỀN** — đè lên tất cả. Không có nó thì thân vỡ, boong tụt xuống
   nước, và cả tiểu đội vẫn đứng đó đánh nhau cho tới khi chết đuối cả lũ: với `StickmanAgent`
   thì không có gì thay đổi cả, địch vẫn trong tầm, máu vẫn đầy. *"Thuyền đang chìm"* là thông
   tin mà **không state nào trong FSM biết cách đọc.**
   Ưu tiên: tấm ván đang bắc → thuyền cùng phe gần nhất → thuyền BẤT KỲ (thà sang thuyền địch
   đánh tiếp còn hơn chết đuối chắc chắn). Tới mép mà chưa qua được thì **NHẢY**.
2. **VÀO SUẤT LÀM VIỆC** — ưu tiên theo **VŨ KHÍ ĐANG CẦM**, dùng lại đúng cách
   `CurrentStrategy` chọn lối đánh, không đẻ thêm một trường "vai trò thuỷ thủ" thứ hai để rồi
   phải đồng bộ với loadout. Cung thủ mà đi cầm lái là mất một tay bắn, mà tay lái ở đuôi
   thuyền thì bắn không tới ai.
   ⚠ **Có địch trên boong là BỎ SUẤT NGAY** — cùng bài học với `AIStateGarrison`: pháo thủ
   đứng nạp đạn trong khi có thằng cầm rìu sau lưng không phải là AI khôn, đó là bia tập.

---

## 5. Thuyền trưởng — não của CON THUYỀN, không phải của người

`ShipCaptain` với `StickmanAgent` là đúng quan hệ giữa `CommandNode` và lính: một bên nói
**làm gì**, một bên lo **làm thế nào**. Thuỷ thủ đoàn không cần biết thuyền trưởng đang định
gì, và thuyền trưởng không quan tâm ai đang cầm cây gì.

```
TIẾP CẬN → DÀN MẠN (nã pháo tầm xa) → SÁP LẠI → MÓC XÍCH + BẮC VÁN
                                                  ↘ RÚT (thân < fleeHullPercent, chưa móc xích)
```

Bỏ nhịp **DÀN MẠN** thì thuyền nào cũng lao thẳng vào áp mạn và mấy khẩu pháo thành đồ trang
trí. Bỏ nhịp **SÁP LẠI** thì trận nào cũng chỉ là hai hàng cung thủ bắn nhau qua mặt nước.

⚠ **HAI LUẬT KÉO NGƯỢC NHAU — phải có VÙNG CHẾT và CAM KẾT** (AGENTS.md §5c).
"Giữ tầm nã pháo" và "sáp vào áp mạn" đọc CÙNG một con số (khoảng cách hai thuyền) và kéo về
hai phía. So thẳng `>=` là con thuyền tiến/lùi đổi nhau mỗi frame — rung tại chỗ giữa biển,
đúng cái bệnh đã dính bốn lần ở tầng bộ binh. Nên có `_rangeDeadband` (1.4) cho nhịp dàn mạn
và `_closeCommit` (6s) khoá quyết định sáp lại.

Trôi vào quá gần thì **sáp vào cho xong**, không lùi ra bắn tiếp — lùi ra là mở lại đúng vòng
lặp vừa chữa.

Lệnh (`ShipOrder`): `Hold` · `Engage` · `SailTo` · `Flee`.
⚠ **Trọng tài chỉ nói ĐI ĐÂU, không nói AI ĐI.** `NavalBattle.IssueOrders` chỉ điền đích đến
cho thuyền nào builder đã giao `SailTo`. Bản đầu ép mọi thuyền phe người chơi cùng `SailTo`
một toạ độ — thuyền yểm trợ liền bỏ nhiệm vụ, bám đuôi thuyền đổ bộ, hai con chen nhau một chỗ.

---

## 6. Pháo — vì sao KHÔNG phải một `WeaponBase`

Cám dỗ đầu tiên là làm khẩu pháo thành một `RangedWeapon` cỡ lớn rồi cho pháo thủ "cầm".
Nhưng `WeaponBase` gắn vào xương `handR`, ăn `WeaponHoldPose`, và đi qua bảng cân bằng
(`StickmanWeaponBalance`: `Điểm = DPS × HệSốTầm × HệSốTiệnÍch`, mốc ≈ 3.5). Một khẩu 6 damage
tầm 16 **phá nát cả bảng cân bằng vũ khí cầm tay** — và tệ hơn, ai nhặt được là chạy bộ với
khẩu pháo trên tay.

Nên pháo là **THIẾT BỊ CỦA CON THUYỀN**: đứng đúng chỗ thì nó bắn, rời chỗ thì im. Không vào
kho vũ khí, không rơi ra khi chết, không đụng cân bằng.

**Pháo nhắm THÂN THUYỀN, không nhắm người.** Đó là cái làm hai tuyến hoả lực không giẫm chân
nhau: pháo lo đánh chìm, cung thủ trên lan can lo dọn người. Cho pháo bắn người thì cung thủ
thành thừa, mà thuyền thì không bao giờ chìm.

Ba chi tiết đã tính sẵn:

- **Nhịp nạp CỐ Ý CHẬM** (4.5s). Pháo bắn nhanh là trận kết thúc trước khi ai kịp áp mạn — mà
  áp mạn mới là phần chơi được.
- **Chia đều HAI MẠN** (chẵn phải, lẻ trái). Game nhìn ngang nên thuyền địch chỉ có thể ở trái
  hoặc phải; để pháo một mạn là nửa số trận con thuyền đứng nhìn mà không bắn được phát nào.
- **Đường dự phòng `FireDirect`** khi chưa đăng ký prefab đạn. Thiếu pool thì pháo cứ nháy lửa
  đầu nòng mỗi 4 giây mà thuyền địch không mất một điểm máu, và **không có lỗi nào báo** —
  thà bắn không thấy viên đạn còn hơn một trận đánh không bao giờ kết thúc.

---

## 7. Biển — cái "vực" của thuỷ chiến

**Phần hay nhất là phần KHÔNG phải viết.** Mép boong vốn đã là mép vực với `StickmanLocomotion`
(bắn tia xuống không thấy đất → cắt vận tốc đi về phía đó), nên:

- lính tự biết không bước xuống biển;
- AI kite lùi tới mạn thuyền là tự dừng;
- ai bị dồn ra mũi thuyền thì `IsCornered` bật lên → `BeginLastStand()` quay lại **TỬ CHIẾN**.

Toàn bộ cảm giác *"bị dồn tới mạn thuyền"* có sẵn, miễn phí.

`WaterZone` chỉ còn một vế: **rơi xuống là chết đuối**, trừ máu theo nhịp qua đúng một đường
`TakeDamage` (nên giáp · hiệu ứng chết · rơi đồ · cộng XP cho kẻ đẩy đều chạy như mọi cái chết
khác), chứ không giết ngay — người chơi rơi sát mạn còn một nhịp để leo lại.

⚠ **Chỉ ăn NGƯỜI**, lọc bằng "có `StickmanLocomotion`". Không lọc thì `ShipHull` (cũng là
`StickmanController`) nằm ngập trong nước sẽ tự mất máu và **mọi con thuyền tự chìm sau vài
giây** mà không ai bắn phát nào.

**ĐÁY BIỂN = object "Ground" bị dìm xuống.** `StickmanSceneUtils.ValidateScene` bắt buộc scene
phải có object tên "Ground" — và nó đúng: thiếu mặt đất thì tên bay ra khỏi map không bao giờ
được thu hồi, bom không bao giờ nổ. Nên thay vì xoá, `SinkGroundToSeabed` hạ nó xuống làm đáy
biển. Vừa qua được kiểm tra, vừa đúng vật lý.

---

## 8. Chòi quan sát — phép thử của kiến trúc

Cột buồm có `StickmanClimbZone` (dây leo) + `GarrisonPost` (suất đứng bắn) + sàn
`PlatformEffector2D` một chiều. Cung thủ mang `AIBehavior.Garrison` **tự trèo lên đứng bắn mà
không có một dòng AI nào viết mới**.

Đó là phép thử: *một cái tháp trôi trên mặt nước vẫn là một cái tháp.* Nếu phải sửa
`AIStateGarrison` để nó chạy được trên thuyền thì `GarrisonPost` đang phụ thuộc vào chuyện
"đứng yên" ở đâu đó — và chỗ đó mới là chỗ cần sửa.

---

## 9. Hải tặc (nền văn minh thứ 10)

Hải tặc **không phải một loại nhân vật mới** — vẫn là `CivilizationDefinition` như 9 nền
trung cổ kia, khác ở BỘ ĐỒ và BẢNG QUÂN CHỦNG:

| | Hải tặc |
|---|---|
| Nón | khăn bịt đầu đỏ + đuôi khăn (`Helm_Pirate`) |
| Giáp | áo choàng da, đai chéo (`Armor_Pirate`) |
| Khiên | **KHÔNG CÓ** — cố ý, y như Nhật Bản; builder hiểu "thiếu file = nền này không dùng khiên" |
| Tuyến đầu | **song đao** thay cho lính khiên: đổi khả năng đỡ lấy sức ép áp sát |
| Quân chủng | đao ngắn · rìu áp mạn · đao thuỷ thủ · lao móc · **súng hoả mai** · **ném lựu đạn** |
| Kỵ binh | không có |
| Cấp lính | **`Levy` HẾT BỘ** — khai rõ để phá luật cấp mặc định |

Súng hoả mai mượn `Weapon_Pistol` của bộ hiện đại: bảng vũ khí là **bảng chung cho cả dự án**,
`GenreDefinition.weapons` chỉ là bộ lọc — nên mượn qua thời kỳ là hợp lệ và cân bằng vẫn đo
trên đúng một thang.

### ⚠ ĐÔNG và NHẸ — và vì sao phải khai `Levy` cho CẢ BỘ

Luật cấp mặc định (`UnitSpec.DefaultRank`) cho vai `Shield` → **Tinh nhuệ** và `Melee` →
**Chính quy**. Áp thẳng vào hải tặc là ra một bọn cướp biển mặc giáp 9 điểm và **chạy chỉ còn
62% tốc độ** — chậm hơn cả bộ binh chính quy, tức là ngược hẳn thứ định làm. Nên cả bộ khai rõ
`rank: UnitRank.Levy`, đúng cách kỵ xạ Mông Cổ phá luật "cưỡi ngựa = tinh nhuệ".

Đổi lại bằng **SỐ LƯỢNG**: thuyền cướp chở 5–6 tên áp mạn so với 2–3 của hải quân, trên đảo là
7 giữ so với 4 đổ bộ. Chúng thắng bằng việc trèo lên được boong trước khi bị bắn chìm, không
phải bằng việc đứng đấu tay đôi.

⚠ **`ApplyLookTo(unit, wearEquipment: false)` cho hải tặc, `true` cho hải quân.** Đây là chỗ
duy nhất phân biệt hai bên về đồ: bật thì mặc nón + giáp THẬT (có điểm giáp, có sức nặng kéo
tốc độ xuống), tắt thì chỉ còn lớp nhìn (khăn bịt đầu). Và phải là `ApplyLookTo` chứ KHÔNG
phải `ApplyTo` — `ApplyTo` áp cả loadout nên nó đổi luôn cây vũ khí theo quân chủng của nền,
xoá sạch việc phân vai (người lái cầm cận chiến, xạ thủ cầm cung). Đúng bài học của
`CivilizationSkinPreview`.

⚠ **"Hải tặc không có sprite"** từng là bug thật, và nguyên nhân không nằm ở art: bộ art đã
sinh ra đủ và `Civ_Pirate` đã có, nhưng **không ai ÁP nó lên quân trong scene thuỷ chiến** —
nên hai phe ra trận đều là stickman đen trơn giống hệt nhau. Nay `CrewShip`/`SpawnAshore` nhận
tham số `civ`, và `CivOf(key)` tự dựng bộ văn minh nếu máy chưa từng bấm `Civilizations > 2`
(bộ đó KHÔNG nằm trong `EnsureAllAssets`).

Tính cách: `AIProfile_Pirate` — liều, combo cao, **không rút lui**.

### ⚠ Vì sao thuỷ thủ để `retreatHealthPercent = 0`

Trên biển **không có chỗ nào để chạy**. Cho ngưỡng rút lui > 0 là cả boong lùi về đuôi thuyền
rồi đứng rung ở đó: mép boong là mép vực nên van TỬ CHIẾN bật lên rồi tắt liên tục. Đây đúng
là cặp luật kéo ngược nhau ở AGENTS.md §5c (rút lui ↔ máu thấp), và ở đây cách chữa rẻ nhất là
**bỏ hẳn một vế** thay vì thêm vùng chết.

---

## 10. Bốn bài test

| Scene | Luật thắng | Dạy được gì |
|---|---|---|
| `Demo_34_SeaBattle` | `SinkFleet` — hết thuyền HOẶC hết quân | đủ 4 nhịp: nã pháo · móc xích · tràn boong · bỏ thuyền chìm |
| `Demo_35_PirateRaid` | `EscortConvoy` — thuyền hàng tới cảng | thuyền buôn không rút được khi bị móc xích; mất lái là đứng giữa biển |
| `Demo_36_IslandAssault` | `SeizeIsland` — giữ `CapturePoint` đủ điểm | đổ bộ qua CẦU TÀU (boong ngang bờ), tháp canh trên đảo |
| `Demo_49_NavalCommand` | `PortAssault` — phá cảng địch, giữ cảng nhà | ván DÀI HƠI: ví tiền, thuyền dự bị, nâng pháo, rút về vá, bộ chỉ huy hạm đội (§10b) |

⚠ **`EliminateEnemies` phải đếm CẢ THUYỀN CẢ NGƯỜI.** Vế "hết thuyền là thua" một mình chưa
đủ: đội áp mạn giết sạch thuỷ thủ đoàn địch thì con thuyền địch vẫn nổi (không ai bắn nó), và
trận đứng lại vĩnh viễn với một chiếc thuyền ma. Đây đúng là bài học `EliminateEnemies` của hệ
map soi từ đầu kia.

⚠ **`GameSession` NAY ĐÃ GẮN ĐƯỢC** (ghi lại cho khỏi lạc: đoạn này từng viết ngược). Lý do
cấm cũ là `ApplyTroopCount` nhân bản lính theo bậc khó rồi đặt bản sao lệch ngang một quãng —
trên bộ thì lệch vài mét vẫn là bãi đất, trên thuyền thì lệch ra khỏi mạn là **rơi xuống biển
chết đuối ngay giây đầu**, bậc khó càng cao phe máy càng chết nhiều. Đã vá ở gốc: hàm đó hỏi
`MovingPlatforms.Under` (tức `ShipVessel.SpansX`) rồi **kẹp bản sao vào trong boong**. Bài học
giữ lại: nhân bản lính ở map có vực/biển thì phải kẹp vị trí vào nền đứng được.
⚠ Bản sao chỉ đếm những gì ĐANG BẬT, nên kho thuyền dự bị và mẫu thuỷ thủ của `Demo_49`
(object tắt) không bị bậc khó đụng tới — đúng ý.

---

## 10b. GIÀNH CẢNG — thuỷ chiến có kinh tế (2026-09-07, ĐÃ NGHỈ)

> ⚠ Mode này KHÔNG còn scene nào dựng ra — `Demo_49` nay là «Chiến tranh hai đảo»
> (§10c). `NavalPort` · `NavalWarChest` · `NavalFleetCommand` · `NavalGoal.PortAssault`
> vẫn còn trong code (chúng là hệ chung, dựng được lúc chạy), nhưng đọc mục này như
> đọc lịch sử: đừng đi sửa chúng để chữa map hai đảo.

### Bệnh: không có chỗ nào đáng tới, không có chỗ nào đáng giữ

Ba bài đầu đều là một trận đánh MỘT HIỆP với hạm đội bake sẵn: hết thuyền hoặc hết người thì
xong. Người chơi không có quyết định nào ngoài vung kiếm, thuyền trưởng thì chạy đúng một kịch
bản (nã pháo 9 giây → luôn luôn sáp vào áp mạn). Người dùng đọc ra đúng một câu:
*"nó lao vào vô nghĩa"* — và câu đó đúng theo cả hai nghĩa: từng con thuyền không chọn lối
đánh, và cả ván không có mục tiêu nào ngoài việc giết.

### Bốn hệ mới (đều là hệ CHUNG, không phải mã riêng của scene)

| Hệ | Trả lời câu gì | Chỗ dễ sai nhất |
|---|---|---|
| `NavalPort` | đánh đi đâu · giữ cái gì · rút về đâu · tiền ở đâu | quên rằng **chỉ pháo phá được cảng** (`ImmuneToRanged`) |
| `NavalWarChest` | tiêu tiền vào đâu | mua lính bằng prefab thay vì **nhân bản mẫu có sẵn** ⇒ mất `AIModuleBinder` |
| `NavalFleetCommand` | chiếc nào giữ nhà, chiếc nào đi đánh | không chừa chiếc nào đi đánh ⇒ hai bên cùng thủ, ván đứng im |
| `ShipCaptain` (tầng lối đánh) | sáp vào hay giữ tầm hay rút | nghĩ lại mỗi frame ⇒ thuyền rung tại chỗ (§5c) |

### Vòng chơi

1. **Vàng chảy về theo MÁU CẢNG** (`_incomePerSecond × HealthPercent`, sàn `_minIncomeShare`)
   + thưởng giết người + thưởng đánh chìm. Cảng nát ⇒ nghèo đi ⇒ mỗi phát đạn vào cảng có tác
   dụng NGAY chứ không phải đợi tới lúc nó sập.
2. **Bốn nút** (phím 1–4, `NavalCommandHud`): thuỷ thủ · vá thân · nâng pháo · hạ thuỷ thuyền
   dự bị. Giá tăng dần theo số lần mua; nâng pháo là khoản duy nhất mạnh theo cấp số nên đáng
   để dành.
3. **Phe máy tiêu tiền theo thứ tự ưu tiên đọc được** (`NavalWarChest.Plan`): hết thuyền → mua
   thuyền; hết thuyền CÓ PHÁO mà địch có cảng → mua thuyền (không pháo = không có cửa thắng);
   có chiếc rách nặng → vá; thua quân số → mua lính; dư tiền → nâng pháo.
   ⚠ Không đủ tiền cho khoản đang ưu tiên thì **ĐỂ DÀNH**, không tiêu tạm vào khoản rẻ hơn —
   một ông đô đốc thấy tiền là mua lính thì không bao giờ gom nổi một chiếc thuyền.
4. **Thuyền rách rút về bến nhà** được ụ sửa vá dần (`NavalPort.Update`), vá tới
   `_returnHullPercent` thì quay ra. Đây là vế làm cho "rút lui" thành một NƯỚC ĐI; không có ụ
   sửa thì con thuyền rách nằm ở góc bản đồ tới hết trận và trông như AI bị treo.
   ⚠ Ngưỡng quay ra (0.72) phải CAO HƠN ngưỡng rút (0.25) — vùng chết, không thì thuyền ra vào
   cửa cảng liên tục. Và chỉ áp vùng chết **khi có cảng còn sống**: không có chỗ vá thì máu
   không bao giờ hồi, con thuyền sẽ chạy tới hết trận.

### Mấy con số của `Demo_49_NavalCommand` không được đổi bừa

· kho hàng ở ±53 · giới hạn chạy tàu ±41 · chiếc đánh cảng đứng cách kho `cannonRange × 0.75`
(12) tức đúng ±41 — dời kho ra xa hoặc thu giới hạn vào là nó đứng NGOÀI TẦM suốt trận mà
không lỗi nào báo (nhìn vào chỉ thấy một chiếc thuyền đậu im giữa biển);
· bến ±45, bán kính ụ sửa 11 — thuyền rút về chỉ tới được ±41, phải nằm gọn trong bán kính;
· kè cảng thấp hơn mặt boong 0.04 — bằng nhau thì quân trên chiếc vừa hạ thuỷ có thể bị tính
là đứng trên KÈ và bị bỏ lại trên bờ; thấp hơn `_stepHeight` (0.18) thì lại thành bậc.

### Ba cái bẫy đã trả giá

1. **Pháo bắn vào không khí.** `Fortification.ImmuneToRanged = true` ⇒ `ProjectileController`
   và `Explosion` đều bỏ qua công trình. Pháo cũ `return` ngay sau khi bắn viên đạn, nên chỉ
   cần trong scene có một người cầm cây ném bom (`Register("bomb")`) là mọi khẩu pháo thành đồ
   trang trí. Nay damage đi thẳng vào mục tiêu, viên đạn chỉ là phần nhìn thấy được — và cũng
   nhờ vậy pháo mới bắn được cảng.
2. **Thuyền dự bị cất một mình.** Thuỷ thủ không được parent vào thuyền (§1) nên tắt mỗi con
   thuyền là cả tổ lái đứng lơ lửng giữa biển, chết đuối ở giây đầu, trong khi chiếc thuyền còn
   nằm im trong kho. Phải gom cả nhóm vào một object ĐỨNG YÊN rồi tắt cả nhóm.
3. **`NavalBattle` không `override OnPlayerTeamChanged`.** Lớp cha đã ghi sẵn bẫy này mà thuỷ
   chiến vẫn dính: chọn phe đỏ ở màn bắt đầu là `_playerTeam == _enemyTeam == 2`, mọi phép so
   đem phe mình so với chính mình.

---

## 10c. CHIẾN TRANH HAI ĐẢO — `Demo_49_IslandWar` (2026-09-07)

**Thay hẳn `Demo_49_NavalCommand`.** §10b vẫn đúng về mặt bài học, nhưng cái mode đó đã không
còn scene nào dựng ra nữa — đọc nó như đọc lịch sử, đừng đi sửa `NavalPort` để chữa map này.

### Bệnh của bài giành cảng: đúng thuốc, nhưng liều quá nhỏ

Bài cũ chữa được đúng cái nó nhắm tới — hạm đội thôi lao vào nhau vô nghĩa. Nhưng nhìn lại cả
ván thì trần của nó rất thấp: **bốn cái nút mua**, và mọi thứ đáng làm đều xảy ra trên mặt
nước. Hai hòn đảo hai bên chỉ là hai cái nền để đặt kho hàng. Người chơi hết một ván vẫn chỉ
có đúng một loại quyết định — *tiêu tiền vào khoản nào trong bốn khoản này*.

Mà dự án đã có sẵn một vòng chơi dày hơn hẳn ở ngay bên cạnh: `Demo_20_WarCamp` — nông dân,
mỏ vàng, rừng củi, mười hai loại công trình, nhà lính có cấp, tổ canh nhà, bảng Canvas thật.
Nó chỉ thiếu đúng một thứ mà thuỷ chiến có: **một lý do để cần thuyền**.

### Cách ghép: cắt đôi bản đồ, thêm ĐÚNG MỘT loại công trình

Toàn bộ mode mới = doanh trại + biển + `CampBuildKind.Harbor`. Không có luật thắng mới
(`EconomyRaceMode` bản `Island`: phá nhà chính địch), không có ví tiền thứ hai
(`TeamEconomy` vẫn là chỗ duy nhất giữ vàng), không có HUD mới (`CampGameUi`).

| Mảnh mới | Ở đâu | Việc |
|---|---|---|
| `CampBuildKind.Harbor` | Gameplay | một `BaseBuilding` có cấp + CẦU TÀU chồm ra mặt nước |
| `CampBuildSite.Raised` | Gameplay | sự kiện tĩnh: "phe N vừa xây xong loại K" |
| `CampHarborShop` | Gameplay | sổ đăng ký: HUD hỏi "bấm vào bến thì mua được gì" |
| `IslandHarbor` | Naval | chỗ đậu · cấp bến · hàng đợi · ụ sửa |
| `TroopTransport` | Naval | chuyến đò: nhận khách → vượt biển → đổ quân → về |
| `IslandFleetYard` | Naval | ba khoản mua: đò · chiến thuyền · nâng sức chở |
| `IslandWarCommand` | Naval | lắp bến · tiêu tiền cho phe máy · gọi lính xuống thuyền |

⚠ **Hai cây cầu giữa Gameplay (4) và Naval (5) đều là ĐẢO CẠNH, không phải reference ngược.**
Gameplay KỂ LẠI (`Raised`) và HỎI (`CampHarborShop`); Naval NGHE và TRẢ LỜI. Đây cũng là lý do
thêm bến vào một map trên bộ không hỏng gì: ở đó không có ai nghe, và cái bến chỉ là một cái
nhà đẹp có cầu tàu.

### Vòng chơi

1. Hai nông dân đào vàng / đốn củi (bấm THẺ trên đầu để đổi việc — y hệt doanh trại).
2. **Nhà lính** → mua được quân. **Bến cảng** → đóng được thuyền. Bến là công trình ĐẮT NHẤT
   bảng (34 vàng + 30 củi, 8 công) và cố ý: nó là cửa DUY NHẤT sang được đảo bên kia, nên nếu
   rẻ ngang nhà kho thì cả ván không còn ngã rẽ nào — ai cũng xây bến trước rồi mới tính.
3. Bấm vào bến: **thuyền chở quân** · **chiến thuyền** · **nâng sức chở** · **xuất phát ngay**.
   Bấm nút nâng cấp của bến để nuôi thêm một chiếc nữa cùng lúc.
4. Chuyến đò đậu ở cầu tàu, **lính tự đi ra lên thuyền**, đủ người (hoặc hết kiên nhẫn 14 giây)
   thì vượt biển, cập bến địch, đổ quân, quay về lấy chuyến sau.
5. Quân đổ bộ nhận mục tiêu là **nhà chính địch** và từ giây đó là bộ binh bình thường.

### Ba mảnh ghép mà nếu làm khác đi thì hỏng CÂM

#### 1. Hành khách phải có mục tiêu NẰM TRÊN CHÍNH CON THUYỀN

Đây là toàn bộ cái khó của cả hệ, và nó không nằm ở chỗ ai cũng nghĩ.

Một anh lính đứng trên boong mà mục tiêu là một điểm trên ĐẤT LIỀN thì anh ta sẽ đi tới đó —
tức bước xuống biển. Mép boong vốn đã là mép vực nên anh ta không rơi ngay, nhưng anh ta
**đứng rung ở mạn suốt chuyến**, và van gỡ kẹt (`IsCornered`) thì bật TỬ CHIẾN. Đúng bệnh §10
của luật thuỷ chiến, chỉ khác là ở đây không ai phát lệnh sai cả — chỉ là chưa ai phát lệnh
ĐÚNG.

Cách chữa: `TroopTransport.Muster` là một object **CON của con thuyền**, đặt giữa boong. Nó
trôi theo boong, nên *"đứng cạnh mục tiêu"* và *"đứng yên trên boong"* là **cùng một việc** —
`AIStateGuard` có sẵn lo hết, không một trạng thái AI nào mới, không hàm lên-thuyền /
xuống-thuyền nào.

Kèm theo ba vế bắt buộc:
- `SetKeepsOwnOrders(true)` lúc còn trên thuyền — thiếu là `CommandNode.ApplyToAgent` phát
  lệnh tuyến ở nhịp sau và cả tốp quay ra mạn nhìn về đất liền;
- **bỏ cờ đó khi đổ bộ** — không bỏ là một anh lính đứng im tới hết trận mà không hệ nào
  nhận lại;
- **thuyền chìm thì trả tự do** (`ShipVessel.Sank`) — người nhảy sang được thuyền khác
  (`AINavalModule.Abandon`) vẫn ôm một mục tiêu đã bị huỷ.

#### 2. Bến phải có Ô ĐẤT CỐ ĐỊNH ở mép nước

`CampBuildYard` xếp công trình theo hai dãy ô đất (hậu phương / tiền tuyến), tìm chỗ trống rồi
đặt. Trên đảo, "phía địch" đúng là phía biển nên bến vào dãy tiền tuyến là hợp lý — nhưng
**không đủ**: một cái tháp canh xây trước sẽ chiếm mất ô đầu và đẩy bến lùi vào giữa đảo.

Hậu quả không phải "cái bến hơi lệch". Cầu tàu là **đất đứng được**, và mép cầu là **chỗ mạn
thuyền gối vào** (`IslandHarbor.BerthX`). Bến lùi vào trong ⇒ cầu tàu nằm trọn trên cạn ⇒
chiếc đò cập vào một chỗ không có cầu, và cả tốp quân đứng ở mép nước không chịu lên thuyền.

Nên bến có `CampBuildYard._harborX` — toạ độ đo sẵn lúc dựng map — và đi kèm hai ngoại lệ:
được **miễn phép đo bán kính đất trại** (mép nước hiếm khi nằm trong bán kính đo từ nhà chính;
nới bán kính cho cả trại thì nhà kho mọc xuống biển) và **không dời được** (dời một nấc là mép
cầu rời khỏi mặt nước).

#### 3. Mặt đảo cao ĐÚNG BẰNG mặt boong — và mọi helper đều đặt ở mặt NƯỚC

`ShoreY = WaterY + 1.1` (bài học `Demo_36`: chênh quá `_stepHeight` 0.18 là quân không bước
lên bờ được; ở đây hụt một chút còn là rơi xuống biển).

Nhưng `CreateHouseShared` · `SpawnNpcShared` · `SpawnFarmerShared` · `SpawnPlayerShared` ·
`StickmanAILabBuilder.Node` đều đặt ở `StickmanSceneUtils.DefaultGroundTop` — mà ở map này
cao độ đó là MẶT NƯỚC. Quên `Lift()` thì nhà chính chôn nửa thân, nông dân sinh ra TRONG lòng
đảo, mỏ vàng nằm dưới chân không ai đào được. **Không lỗi nào báo** — mọi hàm đều đang làm
đúng phần việc của nó.

### Hàng đợi ở bến — vì sao phải có

Từ cấp bến 1 đã có HAI chiếc cùng phe, và cả hai nhắm đúng một chỗ đậu. Hai boong chồng nhau
là lỗi THẬT chứ không phải chuyện thẩm mỹ: `ShipVessel.At` trả về chiếc nào là tuỳ thứ tự
trong sổ, nên người đứng ở khúc chồng **không biết mình đang trên chiếc nào** — chiếc kia chạy
đi thì anh ta bị kéo theo con thuyền sai, hoặc đứng lại giữa biển.

`IslandHarbor.QueueX(ship, slot)` lùi mỗi bậc đúng một chiều dài boong + 1.5. Bậc suy từ THỨ
TỰ TRONG SỔ `TroopTransport.All` (thứ tự `OnEnable` = thứ tự hạ thuỷ): tất định, và một chiếc
chìm đi thì cả hàng tự dồn lên mà không ai phải dọn sổ. Chỉ chiếc ở slot 0 mới nhận khách —
gọi lính xuống một chiếc đậu lùi ra biển là gọi họ ra đứng ở mép vực.

Có hai hàng đợi, hai đầu chuyến: `HomeSlot` (AtHome/Loading) và `LandingSlot` (Crossing/Landing).

### Tướng máy: phân biệt "thiếu tiền" với "bị chặn vì cấu trúc"

`IslandWarCommand.PlanPurchase` xếp một danh sách ưu tiên rồi lấy khoản đầu tiên **không bị
chặn vì cấu trúc**:

1. chưa có chiếc đò nào → mua đò (luôn luôn đứng đầu: không có đò thì cả ván là hai phe cày
   vàng nhìn nhau);
2. địch đã có chiến thuyền mà mình chưa → mua chiến thuyền (đò không pháo gặp chiến thuyền là
   chìm cùng cả tốp quân trên boong — mất một chuyến đầy nặng hơn hẳn một trận thua trên bộ);
3. quân đã dư → thêm một chiếc đò (hai chuyến song song ép nhanh gấp đôi);
4. hết chỗ đậu → dồn tiền vào SỨC CHỞ (khoản duy nhất mạnh lên mà không tốn suất bến);
5. còn chỗ → thêm chiến thuyền.

⚠⚠ **Hai kiểu "chưa mua được" hoàn toàn khác nhau.** *Thiếu vàng* → cứ để dành, vài chục giây
nữa là mua được (đúng bài học `NavalWarChest.ThinkAndSpend`: ông tướng thấy tiền là tiêu thì
không bao giờ gom nổi chiếc thuyền đầu tiên). *Hết chỗ đậu / hết thuyền trong kho / đã nâng
kịch trần* → có bao nhiêu vàng cũng vô ích, và để dành cho nó là **treo vĩnh viễn**: ngồi trên
một đống vàng tới hết trận trong khi khoản đáng mua thật (nâng cấp bến) đứng ngay dòng dưới.
Tách bằng `IslandFleetYard.StructureBlockReason`.

⚠ Và **không đua đóng thuyền khi trên đảo chưa có quân**: xưởng thuyền với `TeamEconomy` moi
tiền từ CÙNG một cái kho, nên hai bộ mua cùng chạy là chúng giành nhau từng đồng.

⚠ `CampBuildYard._navalMap` đẩy `Harbor` lên ngay sau nhà lính trong `SuggestNext`. Thiếu cờ
này thì phe máy chơi rất giỏi ván kinh tế của chính nó rồi **hoà tới hết giờ** — đúng bệnh
"chiếm đảo mà không ai bước vào vòng chiếm". Là một CỜ DỮ LIỆU của map chứ không phải phép dò
lúc chạy: câu hỏi thật ("không có bến thì có sang được đảo địch không") chỉ Naval trả lời
được, mà Gameplay nằm DƯỚI Naval.

### Điều phối cho CẢ HAI phe, kể cả phe người chơi

Đây là lựa chọn có chủ ý, và nó khác với `TeamEconomy.autoSpend`:

- **TIÊU TIỀN** là quyết định của người chơi — phe xanh `autoSpend: false`, bấm nút.
- **"AI BƯỚC LÊN CÁI THUYỀN ĐANG ĐẬU"** thì không. Bắt người chơi dắt từng anh lính ra cầu tàu
  là biến một ván chiến thuật thành một ván bấm chuột.

Người chơi vẫn đè lên được ở hai chỗ: tự đi bộ lên boong (không có luật nào cấm), và nút
«Xuất phát ngay» ở bảng bến.

### Bảng số của `Demo_49_IslandWar` — không đổi bừa

| Số | Giá trị | Vì sao |
|---|---|---|
| mặt đảo | `WaterY + 1.1` | bằng mặt boong; chênh > 0.18 là không bước lên được |
| mép đảo | ±25 | |
| ô đất bến | ±26.5 | nhà rộng 2.1 (±25.45…±27.55, TRỌN trên đảo), cầu dài 4.2 ⇒ mép cầu ±21.25 (chồm ra nước 3.75) |
| chỗ đậu của đò | ±16.65 | mép cầu + (halfDeck 5.5 − chồm 0.9); chiến thuyền ±15.65 |
| giới hạn chạy tàu | ±19 | phải RỘNG hơn chỗ đậu **và** chừa chỗ cho hàng đợi (chiếc thứ hai ở ±4.15). Bản nháp để hai đảo cách nhau 36 (giới hạn ±13) thì chỗ đợi rơi sang **nửa sân địch** |
| nhà chính | ±44 | quãng vượt biển 33.3 ⇒ ~20 giây mỗi chiều ở `cruiseSpeed` 1.7 |
| bán kính đất trại | 14 | ô đất [±30…±58], 8 ô. Kẹp từ HAI phía: nới ra thì ô đất tiền tuyến chiếm mất ô của bến (bến báo «hết chỗ» vĩnh viễn), thu vào thì không đủ chỗ cho 12 loại công trình. Khoảng hở gần bến nhất **4.9** (tối thiểu 2.6) |
| sức chở | 3 + 2/cấp, trần 9 | boong đổ bộ dài 11; nhồi hơn là "AI tụ tập ở mạn thuyền" (§13) |
| số thuyền | cấp bến + 1 (2…4) | cấp 1 phải cho HAI chiếc, không thì không bao giờ mua nổi chiến thuyền đầu tiên |
| kho thuyền | 5 đò + 3 chiến / bên | ⚠ **van chống bế tắc**: chiếc đã hạ thuỷ KHÔNG quay lại kho được (`NextReserve` tìm nhóm còn TẮT, mà chìm là bị huỷ), nên số chiếc trong kho **chính là tổng số thuyền một phe đóng được trong cả trận**. Kho nông thì hai phe bắn chìm hết thuyền của nhau là không ai sang được đảo ai nữa — mà `EconomyRaceMode` không có giới hạn giờ |

### Hai lỗi của bản dựng đầu tiên (2026-09-07)

Người dùng báo: *"AI không hoạt động, nhà ở dưới đất"*. Đo lại scene đã bake thì ra **hai
nguyên nhân hoàn toàn khác nhau**, và không cái nào là lỗi của thuỷ chiến — cả hai lộ ra vì
đây là map đầu tiên có mặt đất khác cao độ mặc định (đảo −0.9 vs `DefaultGroundTop` −2.0).

**1. Nhà ở dưới đất — art bám vào cao độ đã BAKE, không bám vào cái thân.** `StructureSkin`
giữ riêng `_groundY` và mỗi lần khoác art nó đặt lại hình về đúng đó; `CreateHouseShared` bake
thẳng `GroundTop` vào số ấy. Nên dời nhà sau khi dựng là **thân đi, hình ở lại**: nhà chính
đứng ở −0.9 còn hình nằm ở −2.0, chìm ngang mặt nước. Chữa ở gốc bằng tham số `groundY`.
⚠ Bài học rộng hơn cái map này: **một phép dời `transform` không với tới được dữ liệu đã bake
bên trong component.** `Lift()` dùng được cho nhân vật và mỏ vàng (không giữ cao độ nào),
không dùng được cho thứ tự nhớ mặt đất của mình.

**2. AI không hoạt động — mọi mối nối ĐỀU ĐÚNG, cái sai là mở màn.** Đo được: nông dân khai
`_behavior = 8` (Work) · node đúng phe đúng loại · `FindNearestAvailable` chỉ đo `|Δx|` nên
cao độ không ảnh hưởng · `CampBuildYard` bake `_navalMap = 1`, `_harborX = ±26.5`,
`_groundY = −0.9` · ví tiền nối đủ kho và nhà chính. Không có gì hỏng. Cái sai là màn mở ra
với **đúng bốn người trên cả bản đồ** (hai nông dân mỗi đảo) và cả hạm đội nằm trong kho, nên
phải chờ hết chuỗi *đào vàng → nhà lính → mua quân → bến cảng → đóng thuyền → chở quân* mới
có thứ đáng nhìn. Chữa: bốn lính mở màn mỗi đảo + tướng đỏ — **không** phát thuyền sẵn.

### Bốn phép đo của Doctor

«Hai đảo — bến / xưởng thuyền nối thiếu»: xưởng thuyền mà không có bộ điều phối (không ai lắp
`IslandHarbor`) · kho thuyền rỗng · không chiếc nào mang `TroopTransport` (hạm đội đánh nhau
rất hăng ngoài khơi mà không ai đổ bộ) · `_navalMap` bật mà `_harborX = 0`.

Cả bốn hỏng theo đúng một kiểu: **ván chơi vẫn chạy trọn vẹn, chỉ là không ai sang được bờ bên
kia**. Không exception, không object đỏ — chỉ có hai phe cày vàng tới hết giờ và người chơi
đọc ra là *"AI không biết đánh"*.

---

## 10d. ⚠⚠ THUỶ CHIẾN TỪNG CÓ NGƯỜI NÉM BOM (2026-09-07)

Người dùng báo *"bỏ ném bom đi"*. Gốc không nằm ở thuỷ chiến — `GenreWeaponPolicy` đã ghi sẵn
cả cơ chế lẫn bài học từ trước. Thuỷ chiến chỉ là mảng duy nhất chưa bao giờ đi qua chốt đó.

Ba mảnh ghép lại:

1. `StickmanWeaponHolder.Awake` Instantiate **CẢ BẢNG vũ khí** vào xương tay mọi nhân vật,
   `Weapon_Bomb` (chỉ số 6) nằm trong đó.
2. `AIWeaponSwapModule` quét thẳng kho tìm "cây NỔ" mỗi khi địch **túm tụm ≥3** — mà một cái
   BOONG THUYỀN thì lúc nào cũng túm tụm: đó chính là thiết kế của áp mạn. Nên ở đây điều kiện
   ấy đúng gần như MỌI LÚC, chứ không phải thỉnh thoảng như trên bộ.
3. Hai cửa chặn thì thuỷ chiến hở **cả hai**: scene thuỷ chiến không có
   `CivilizationTeamAssigner` (nền chốt lúc dựng) nên `AddCivilizationAssignerShared` — chỗ
   tiện tay gắn bộ lọc thể loại cho hơn 20 builder khác — không bao giờ chạy; còn `CrewShip`
   thì **cố ý** dùng `ApplyLookTo` chứ không `ApplyTo` (giữ việc phân vai: người lái cầm cận
   chiến, xạ thủ cầm cung), mà `ApplyTo` mới là chỗ DUY NHẤT gọi `SetSwapPool`.

Chữa bằng MỘT dòng trong `CreateSea` (`EnsureNoThrownBombs` →
`StickmanDemoBuilder.AddGenrePolicyShared(GameGenre.Medieval)`), vì đó là hàm mà **mọi** scene
thuỷ chiến đều gọi ở dòng đầu — cả bốn bài được bọc trong một lần sửa, và bài thứ năm cũng tự
được bọc. Bắt từng builder nhớ thêm một dòng là kiểu gì cũng sót một bài, mà bài sót thì lặng
lẽ có người ném bom giữa một trận kiếm-cung.

---

## 11. Bảng tra — muốn X thì sửa đâu

| Muốn | Sửa ở |
|---|---|
| Thêm hạng thuyền | `StickmanNavalBuilder.Specs` (+ 1 phần tử) |
| Đổi số của một hạng | vẫn `Specs` — **đừng sửa tay asset**, lần chạy sau bị ghi đè |
| Thuyền đi nhanh/chậm | `ShipDefinition.cruiseSpeed` |
| Thuyền lì hơn / dễ chìm hơn | `hullHealth`, `fleeHullPercent` |
| Thuyền lì lợm hơn / nhát hơn khi chọn áp mạn | `ShipCaptain._boardingEdge` (hơn quân mấy lần thì mới tràn sang) |
| Nã pháo lâu hơn trước khi chịu sáp vào | `ShipCaptain._bombardPatience` |
| Thuyền rút về vá sớm/muộn | `_fleeHullPercent` (rút) và `_returnHullPercent` (quay ra) — giữ khoảng cách giữa hai số |
| Giá mua lính / thuyền, tốc độ ra vàng | `NavalWarChest` (`_crewCost`, `_shipCost`, `_incomePerSecond`…) |
| Cảng dai/dễ vỡ hơn | `StickmanNavalBuilder.BuildWarehouse` (hp 200 — đo theo hoả lực thật: 1 chiến thuyền ra ~1.33 dps vì chỉ khẩu đúng mạn bắn được) |
| Ụ sửa vá nhanh/chậm | `NavalPort._repairPerSecond` / `_repairRadius` |
| Hạm đội bỏ nhà đi đánh nhiều/ít hơn | `NavalFleetCommand._homeThreatRange` |
| Thêm thuyền dự bị cho một phe | thêm `BuildReserveShip(...)` vào danh sách trong `StickmanNavalBuilder.IslandWar.cs` |
| Thuyền rung tại chỗ giữa biển | nới `_rangeDeadband` / `_closeCommit` — **đừng** sửa `broadsideRange` |
| Lính đứng ở mạn không chịu tràn sang | xem `BoardingPlank.Between` có trả ván không; sau đó xem `boardingSearchRange` |
| Lính đứng chết đuối theo thuyền | playbook/binder có `AIModuleKind.Naval` không |
| Chết đuối nhanh/chậm | `WaterZone._damagePerTick` / `_tickInterval` |
| **Lính vẫn nhảy xuống nước** | xem §3b — kiểm `AIProfile.jumpGapReach` và `HasLandingSpot` |
| Đổi phím cầm lái | `ShipHelmPrompt._key` (mặc định F) |
| Dáng lái xấu / không hiện | sửa clip `"helm"` trong `StickmanActionSetBuilder`, rồi chạy lại `Naval > 2` |
| Hải tặc mặc giáp nặng | `heavyGear: false` ở `CrewShip`, và `rank: Levy` trong `Specs` của civ |
| Hải tặc ít quá | tăng `boarders:` ở ba scene trong `StickmanNavalBuilder.Demos.cs` |
| Thêm loại suất làm việc mới | `ShipStationRole` + 1 nhánh trong `ShipStation.Update` |
| Thêm luật thắng thuỷ chiến | `NavalGoal` + 1 nhánh `Tick*` + 1 nhánh `StatusLine` |
| **HAI ĐẢO** — giá thuyền / nâng sức chở | `IslandFleetYard` (`_transportGold`, `_capacityGold`…) |
| Một chuyến chở nhiều/ít quân hơn | `TroopTransport.EditorSetup(baseCapacity, capacityPerTier)` ở `BuildIslandTransport` |
| Bến nuôi được nhiều thuyền hơn | `IslandHarbor.MaxShips` (đang `Level + 1`) |
| Đò chờ lính lâu hơn trước khi đi | `TroopTransport._loadPatience` |
| Phe máy giữ nhiều/ít quân ở nhà hơn | `IslandWarCommand._homeReserve` / `_minArmyToAttack` |
| Lính ở xa bến không chịu ra thuyền | `IslandWarCommand._callRange` (34 — đảo rộng 42) |
| Đảo to/nhỏ, bến xa/gần mép nước | hằng số ở đầu `StickmanNavalBuilder.IslandWar.cs` — đọc bảng số ở §10c TRƯỚC |
| Giá công trình trên đảo | `EnsureIslandEconomyProfile` (asset `EconomyProfile_HaiDao`, KHÔNG dùng chung với doanh trại) |
| Thêm khoản mua ở bến | `FleetPurchase` + 1 nhánh `CostOf`/`NameOf`/`StructureBlockReason` + 1 dòng `OffersFor` |
| Chiếc đò không cập được bến | so `IslandSailLimit` với `IslandHarbor.BerthX` — giới hạn phải RỘNG hơn chỗ đậu |

---

## 12. Còn nợ (ghi rõ để không ai tưởng là đã có)

1. **Thuyền chỉ đi NGANG.** Không có xoay mạn, không có gió, không có buồm ăn gió. Trong game
   nhìn ngang thì "quay mạn" không có ý nghĩa hình học — nên pháo chia đều hai mạn thay vì
   bắt thuyền xoay.
2. **Nhân vật vẽ ĐÈ lên mặt nước.** Rig nằm sorting layer `character` (vẽ sau `Default`), nên
   lớp nước trong suốt không phủ được người đang chìm. Muốn phủ thì phải có một lớp nước riêng
   trên layer `character`.
3. **Chưa có `AIPlaybook` cho thuỷ chiến.** Ba scene gắn `AIProfile` + `AIModuleBinder` thẳng
   lên từng NPC (tiền lệ: `StickmanStealthBuilder`). Thêm `Playbook_Naval` là bước tiếp theo
   tự nhiên.
4. **Chưa nối vào hệ map** (`MissionType` / `MapDefinition`). Ba scene đang là scene dựng tay.
   Nối vào thì "thêm một trận thuỷ chiến" mới thành "thêm một asset".
5. **Cây chỉ huy chưa biết gì về thuyền.** `CommandNode` vẫn dời cột mốc theo trục X như trên
   bộ; nó không hiểu "cột mốc kia nằm bên kia mặt nước".
