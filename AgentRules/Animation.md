## Hệ animation — BA TẦNG, không có Animator Controller

### ⚠⚠ MỪNG CHIẾN THẮNG TRẬN + ĐA DẠNG HOÁ ĐỢT HAI (2026-09-13, user: *"tôi muốn thêm animation
mừng chiến thắng trận, ngoài ra mỗi loại animation cho nhiều kiểu khác nhau để đa dạng animation"*)

**Ba mảnh cho lễ ăn mừng, thiếu mảnh nào thì hai mảnh kia là công viết ra bằng không:**

| Mảnh | Ở đâu | Làm gì |
|---|---|---|
| 7 CLIP | `StickmanActionSetBuilder.Victory.cs` | `win_sky` · `win_fist` · `win_wave` · `win_dance` · `win_kneel` · `win_bow` · `win_howl` (bầy xác) — đều là STYLE của `Cheer`, `weight = 0` |
| BẢNG TÊN + phép BỐC | `StickmanBodyAnimator.Victory.cs` | `VictoryStyles` + trọng số + `PlayVictory()` + `RequestRest()` |
| ĐIỀU PHỐI | `VictoryCelebration` (Gameplay) | ai ăn mừng, lúc nào, bao lâu |

⚠⚠ **CỬA DUY NHẤT LÀ `MatchModeBase.AnyFinished`** — sự kiện tĩnh mà cả 41 mode đi qua khi
`Finish()` chốt kết quả (cùng thủ pháp `MatchChallengeTracker`). Nhờ vậy **không mode nào phải
sửa**, và mode thứ 42 tự có lễ ăn mừng. Component tự cắm bằng `RuntimeInitializeOnLoadMethod` →
`EnsureOn(mode.gameObject)`; hook đó chỉ NỐI SỰ KIỆN, không đặt gì vào trạng thái toàn cục (nó
chạy MỘT LẦN cho cả phiên Play, không phải mỗi scene).

⚠⚠ **`outcome.winner`, KHÔNG PHẢI `_playerWon`.** Phe thắng ăn mừng kể cả khi đó là phe ĐỊCH —
người thua nhìn bên kia reo hò, và đó chính là thứ làm cú thua có sức nặng (cùng lý do
`MusicDirector` đặt khí sắc `Defeat` chứ không tắt nhạc). `winner = −1` (hoà) thì không ai ăn
mừng: cả hai bên cùng reo là hình nói dối về luật chơi.

⚠⚠ **PHA BAN ĐẦU PHẢI LỆCH — con số quan trọng nhất của cả tính năng.** Cả tiểu đội nhận tin
thắng trong CÙNG MỘT FRAME; cho tất cả `PlayVictory()` ngay là **cả hàng giơ tay một lượt**, một
cú giật tập thể còn tệ hơn đứng yên. Nhịp đầu rải trong `[0, 1.1 s]`. Đúng bài học đã trả giá ở
bộ đếm đổi dáng đứng (2026-09-10).

⚠⚠ **DÁNG CHỮ KÝ Ở NHỊP ĐẦU, BỐC NGẪU NHIÊN TỪ NHỊP HAI.** Khoảnh khắc người chơi nhìn lâu nhất
là nhịp ĐẦU (bảng kết quả vừa hiện, camera còn đứng). Bốc đều ở nhịp đó thì luôn có vài cặp đứng
cạnh nhau ra trùng dáng — mắt bắt được ngay. Nên nhịp đầu bốc theo `GetEntityId()` (cố định cho
từng người ⇒ thành TÍNH CÁCH), nhịp sau mới bốc theo trọng số **và cấm lặp lại cái vừa ra** (trùng
LIỀN KỀ đọc ra "clip bị kẹt" chứ không ra "ngẫu nhiên").
· ⚠ `GetEntityId()` chứ không `GetInstanceID()`: Unity 6000.5 khai tử hàm cũ — **lỗi `CS0619`,
  không phải cảnh báo**. `EntityId` không so số học được, phải qua `GetHashCode()`.
· ⚠ Băm rồi mới chia dư: id của object sinh liền nhau là số LIỀN KỀ, lấy thẳng phần dư thì cả
  hàng quân nhận dáng theo đúng thứ tự bảng — một chu kỳ lặp còn dễ thấy hơn trùng ngẫu nhiên.

⚠ **KHÔNG ĐỘNG VÀO AI.** Lễ ăn mừng nằm HẲN ở tầng animator: không `SetBehavior`, không
`SetKeepsOwnOrders`, không tắt `StickmanAgent`. Ván đã đóng nhưng thế giới vẫn chạy (bảng kết quả
KHÔNG dừng `Time.timeScale` — chỉ màn briefing mới dừng), mà mọi lệnh cấp cho AI ở nhịp này đều
cần một ĐƯỜNG NHẢ, và ở đây không còn nhịp nào để nhả. `Cheer` ưu tiên 14 nên nó tự chồng lên
nhịp đi đứng mà không phải giành quyền với ai.

⚠ **BẦY XÁC PHẢI KHOÁ RIÊNG.** `Zombie()` chỉ gỡ `Idle`/`AttackBody`/`Hurt` của lính chứ **không
gỡ `Cheer`**, nên sáu dáng ăn mừng của người vẫn nằm nguyên trong bộ zombie. `ZombieUnit.Start`
gọi `SetVictoryStyles(VictoryHowlStyle)` — thiếu dòng đó là cả bầy xác đứng vẫy tay chào và nhún
nhảy khi người chơi ngã.

⚠ **`Rest` NAY ĐÃ CÓ CHỦ.** Trước 2026-09-13 `sit`/`recline` có ở cả 5 bộ mà **không code path
nào gọi `Play(Rest)`** — hai clip chết. Chủ đầu tiên: `StickmanBodyAnimator.RequestRest()`
(cờ TỰ HẾT HẠN sau một frame, đúng khuôn `IsSteering` — vì người chơi KHÔNG có agent để dọn cờ
hộ), và ~35% quân thắng trận ngồi bệt xuống ở nửa sau lễ. `ResolveAmbientType` đọc cờ đó **SAU**
mọi tư thế do trạng thái ép và **kèm `!IsMoving`** (clip lặp + `legWeightWhileMoving` thấp ⇒ xin
lúc đang đi là nửa người ngồi mà hai chân vẫn bước).
· ⚠ **HẾT LỄ KHÔNG ĐƯỢC TẮT HẲN**: cờ tự hết hạn nên ngừng xin là cả hàng người ngồi BẬT DẬY một
  lượt, đúng lúc người chơi đang đọc bảng kết quả. `Update` giữ lại riêng nhóm ngồi.
· ⚠ Ngồi rồi thì **thôi hô**: `Cheer` ưu tiên 14 thắng `Rest` 6, nên vừa ngồi vừa xin hô là người
  "ngồi" lại đứng bật lên mỗi 2 giây.
· Bộ đếm ĐỔI DÁNG chỉ chạy cho `Idle`; mở cho `Rest` là việc của lần sau.

**ĐA DẠNG HOÁ ĐỢT HAI — mọi loại lên ≥ 4 kiểu bốc được** (`StickmanActionSetBuilder.VarietyMove.cs`
+ `.VarietyFight.cs`, 33 clip):

| Loại | Bốc được TRƯỚC | Sau |
|---|---|---|
| `Climb` · `Roll` · `Rest` · (`AttackBody` · `Hurt` của bộ **Zombie**) | **2** | 4 |
| `Jump` · `Fall` · `Land` · `Crawl` · `ClimbIdle` · `Rope` · `Swim` · `Hurt` · `HitImpact` · `Block` · `Captive` · `Knockdown` · `GetUp` · `Work` · `Carry` · `Cheer` | 3 | 4 |

⚠⚠ **VÌ SAO 3 CHƯA ĐỦ:** `Pick` bốc độc lập cho từng người ⇒ xác suất hai người cạnh nhau trùng
kiểu là **1/N** — N = 2 ⇒ 50%, N = 3 ⇒ 33%, N = 4 ⇒ 25%. Ở hàng 30 lính cùng trèo thang thì 33%
vẫn là **mười** người trùng với người bên cạnh. Nặng nhất là bộ **Zombie**: `Zombie()` gỡ HẲN
style `AttackBody`/`Hurt` của lính nên hai loại NỔ RA NHIỀU NHẤT TRÊN MÀN HÌNH chỉ còn đúng hai
kiểu — 50% số cú vồ trùng hình với con bên cạnh.

⚠ **MỖI KIỂU MỚI ĐỔI MỘT TRỤC KHÁC**, không chỉ khác biên độ: ở cỡ nhìn thật (~40 px) lệch biên
độ 20% là không phân biệt được. Ví dụ `Carry/back` đảo CHIỀU NGHIÊNG thân (ba kiểu cũ đều ngả ra
sau), `Swim/tread` dựng thân ĐỨNG (ba kiểu cũ đều nằm ngang), `Crawl/scuttle` đổi TẦN SỐ.

⚠ Bốn clip zombie nối vào `ZombieStyles()`, **không** vào `GroundedAndChores` — nối nhầm chỗ là
chúng chui vào cả bốn bộ của người và mỗi cú đánh của lính có vài phần trăm ra dáng vồ của xác
sống, đúng cái bẫy mà `Zombie()` phải `RemoveAll` để chữa.

⚠ Trần đã kiểm bằng phép đo tĩnh trên chính mã nguồn builder (Boss `scale = 1.6`): đỉnh góc thân
`Roll/shoulder` **99.2 < 110** (`SpinThreshold`), đỉnh `|ikArm|` **1.34 < 1.396**
(`ClampToReach`), không clip nào trùng `(loại, style)` với bản đã bake.

⚠ **PHÉP ĐO:** `StickmanDoctor.Animation.cs` › «Dáng MỪNG CHIẾN THẮNG thiếu trong bộ động tác» —
hỏi thẳng `StickmanBodyAnimator.VictoryStyles` rồi đối chiếu với clip đã bake, kèm luật
`weight = 0`. Cần nó vì `Pick` **không trả `null` khi thiếu tên** mà rơi về bốc ngẫu nhiên: gõ
sai một tên hoặc quên dựng lại bộ động tác thì phe thắng vẫn hô `raise`/`pump`/`roar` y như giữa
trận — **nhìn vào không ai ngờ là lễ ăn mừng chưa bao giờ chạy**.

⚠ **Chạy lại tool:** Bảng điều khiển › «Dựng bộ ĐỘNG TÁC» (ba file phần mới + bảng tên runtime đã
được khai vào `extraSources`, nên bảng biết mà báo VÀNG). Soi từng clip: Xưởng `Demo_67_AnimLab`.

### ⚠⚠ ĐA DẠNG HOÁ + ĐỔI DÁNG ĐỨNG THEO THỜI GIAN (2026-09-10, user: *"thêm các animation idle
đa dạng, và tôi muốn mỗi loại animation đều đa dạng, và nó play ngẫu nhiên"*)

Hai nửa, và **thiếu nửa nào thì nửa kia gần như vô nghĩa**:

| Nửa | Ở đâu | Làm gì |
|---|---|---|
| **Kho style** | `StickmanActionSetBuilder.Variety.cs` (+ `ZombieIdleVariety`) | 5 dáng đứng · 2 dáng bám thang · 2 kiểu bơi · kiểu thứ ba cho 7 loại · 3 biến thể dáng zombie |
| **Bộ đếm đổi dáng** | `StickmanBodyAnimator.Variety.cs` | đứng yên 7–16 s thì đổi sang một dáng đứng khác, pha lệch nhau giữa từng người |

⚠⚠ **VÌ SAO THÊM CLIP THÔI THÌ KHÔNG ĐỦ — cửa chặn trong `Play()`.** `Play` trả `false` ngay khi
đang chơi đúng loại đó, clip `loop`, và bên gọi KHÔNG nêu tên style. Cửa đó **đúng và phải giữ**
(`UpdateAmbientAction` gọi `Play(Idle)` mỗi frame; bỏ cửa là `Pick` bốc mỗi frame một kiểu,
`_clipTime` reset mãi, nhân vật ĐỨNG HÌNH ở khung đầu). Hệ quả không ai để ý: **một anh lính bốc
trúng `breathe` lúc spawn thì thở đúng kiểu đó tới lúc chết.** `_randomStyleEveryTime = true` chỉ
cứu được động tác CHỚP NHOÁNG — chúng chạy hết rồi nhả; động tác NỀN thì không bao giờ chạy hết.
Nên bảy dáng đứng cũ chỉ tạo khác biệt **giữa các người**, không bao giờ tạo khác biệt **theo thời
gian**, mà quãng đứng chờ lại đúng là quãng người xem nhìn lâu nhất.

⚠ **BỘ ĐẾM CHỈ CHẠY CHO `Idle`.** `Crouch`/`Crawl`/`Climb`/`Block`/`Carry`/`Captive`/`Knockdown` là
tư thế GIỮ theo trạng thái mà người chơi đang ĐỌC — đổi giữa chừng là nhiễu, không phải đa dạng.
`Fall` sống 1–2 giây. `Rest` thì **không code path nào phát** (đo 2026-09-10: `sit`/`recline` có ở
cả 5 bộ mà không nơi nào gọi `Play(Rest)`) — nối vào chỗ dùng trước, rồi mới mở bộ đếm cho nó.

⚠ **DÁNG DO TRẠNG THÁI ÉP THÌ KHÔNG ĐƯỢC ĐỔI** (gác · lái · vận công · thế tấn · ló bắn · sắp gục
· nhìn đêm): mỗi cái nói ra một sự thật về nhân vật, bốc ngẫu nhiên đè lên là hình nói dối về luật
chơi. Cửa duy nhất cho phép đổi là dáng NỀN CỦA LOÀI, và khi đó chỉ đổi trong đúng gia đình dáng
của loài (`SetDefaultIdleStyles`).

⚠⚠ **`_idleFamilyStyle` — thiếu nó thì cú đổi dáng của zombie sống ĐÚNG MỘT FRAME.** Dáng nền của
loài được `UpdateAmbientAction` xin lại mỗi frame (`style = _ambientIdleStyle`), mà `Play` gọi KÈM
TÊN thì không đi qua cửa chặn ở trên — nó `Pick` ra đúng `shamble` và kéo ngược lại ngay. Lính
thường không dính vì frame sau `style` là `null`. Không gì báo; nhìn vào chỉ thấy zombie *"vẫn y
như cũ"*. Nên khi đang giữ một biến thể, hàm bốc phải **nhắc lại tên biến thể đó ở mọi frame**.

⚠ **PHA BAN ĐẦU PHẢI NGẪU NHIÊN.** Cả tiểu đội spawn cùng một frame; ai cũng hẹn đúng
`_idleShuffleSeconds` thì 10 giây sau **cả hàng đổi dáng một lượt** — một cú giật tập thể, tệ hơn
đứng yên. Lần hẹn ĐẦU bốc trong `[0, max]`, các lần sau mới `[min, max]`.

⚠ **CROSSFADE 0.6 s, KHÔNG DÙNG `blendInTime` CỦA CLIP (0.08 s).** 0.08 đúng cho lúc từ chạy/đánh
vào đứng (phải bắt kịp ngay), nhưng đứng → đứng thì 5 frame đọc ra một cú GIẬT. Sửa
`_fadeLeft`/`_fadeTime` chứ **đừng ghi vào `_clip.blendInTime`**: clip là dữ liệu dùng chung cho
mọi nhân vật đang cầm cùng `StickmanActionSet`.

#### Phép đo, và hai con bọ nó moi ra

⚠⚠ **ĐẾM STYLE PHẢI THEO LUẬT CỦA `PickWeighted`, KHÔNG THEO TỔNG SỐ CLIP** — hai con số lệch rất
xa: bộ Soldier có `AttackBody` **31 clip mà chỉ 4** vào được vòng bốc, `Idle` 20 clip mà chỉ 7. Ba
van phải tính đủ: `weight = 0` (cửa khoá chủ ý) · style vượt `SpinThreshold` bị loại · **mọi
weight = 0 thì rơi về BỐC ĐỀU** (bỏ nhánh này là réo oan bộ zombie). Phép đo:
`StickmanDoctor.Animation.cs` › «Loại động tác chỉ có MỘT kiểu», hai dòng riêng vì cách sửa khác
hẳn nhau (phải viết thêm clip / đã có clip mà bị một cái van chặn).

Chạy lần đầu, phép đo moi ra đúng hai thứ không ai nhìn thấy được bằng mắt:

- **`ActionSet_Boss/Roll`: 3 clip, 1 bốc được.** `tumble` đỉnh `75° × scale`, mà bộ Boss có
  `scale = 1.6` ⇒ 120 ≥ 110, bị coi là cú xoay trọn vòng; `forward` cố ý 360°. Tức **con boss to
  nhất sân không bao giờ lăn né** — nó chỉ dịch chân 12.8°. Hạ xuống 66 (× 1.6 = 105.6), đúng
  tiền lệ `sprawl` 71 → 64.
- **`Idle/tired` weight 1.** Từ 2026-09-07 nó đã là dáng do TRẠNG THÁI lái
  (`StickmanBodyAnimator.WoundedStyle`, gọi đích danh khi máu sắp cạn) nhưng weight chưa hạ, nên
  một anh lính ĐẦY MÁU vẫn bốc trúng và đứng thở dốc — cái thông tin "nhìn dáng biết nên dồn vào
  ai" thành lời nói dối. Nay `weight = 0`.

⚠ Cùng đợt: `shamble` hạ về `weight = 0` cho đồng bộ với `reach`/`lurch` (cả ba đều gọi đích danh
theo loài), và `StickmanActionSetBuilder.WuxiaStance.cs` được nối vào `extraSources` của nút «Dựng
bộ ĐỘNG TÁC» — nó thiếu từ đầu, nên sửa thế tấn một môn phái xong bảng vẫn XANH.

⚠ **Chạy lại tool:** Bảng điều khiển › «Dựng bộ ĐỘNG TÁC». Bảng số nằm trong CODE, asset là bản
BAKE. Soi từng clip mới: Xưởng động tác `Demo_67_AnimLab`.

### ⚠ XƯỞNG ĐỘNG TÁC — CHỖ NHÌN THẤY TỪNG CLIP (2026-09-09, user: *"thêm 1 mục chọn nhân vật và
có thể xem lần lượt animation của nó, để có thể thêm và sửa animation"*)

`Demo_67_AnimLab` (`StickmanAnimationViewer` + `StickmanAnimationLabBuilder`, nút ở Bảng điều
khiển › Động tác · Effect · Tiếng). Hai trục ◀ ▶ như tủ kính art: **NHÂN VẬT** (mọi
`StickmanArchetype`, cộng hàng riêng cho bộ động tác không archetype nào dùng) và **ĐỘNG TÁC**
(đi hết mọi clip của bộ đó theo thứ tự loại → style).

⚠⚠ **VÌ SAO KHÔNG CHỈ LÀ TIỆN NGHI:** 124 clip mỗi bộ, mà clip chỉ nổ ra khi có đúng tình huống
chiến đấu / di chuyển — nên quá nửa số style **chưa ai từng nhìn thấy**, kể cả người vừa viết ra
chúng. Nặng nhất là nhóm XOAY TRỌN VÒNG: `Pick` cấm bốc ngẫu nhiên chúng (mục 5d), nên trong
trận **không có đường nào** thấy được. Xưởng gọi ĐÍCH DANH tên style nên xem được cả nhóm đó.

⚠ **Vòng sửa:** sửa bảng số ở `StickmanActionSetBuilder.cs` (style cơ bản) hoặc
`StickmanActionBuilder.cs` (style phụ) → «Dựng bộ ĐỘNG TÁC» → trong xưởng bấm ⟲ (nạp lại). Đừng
gõ tay vào Inspector của asset: asset là bản BAKE, lần dựng sau ghi đè sạch.

⚠ Xưởng **ĐO chứ không nhớ** — in thẳng ba thứ hỏng-trong-im-lặng: clip TRÙNG (loại, style)
(`Pick` trả cái đầu, bản sau vĩnh viễn không được bốc) · clip RỖNG KHUNG (`BuildLookup` bỏ qua) ·
động tác ĐANG CHẠY khác cái vừa chọn (`Play` từ chối vì ưu tiên — không in ra thì người xem đang
chấm điểm nhầm clip). Cùng ba thứ đó có phép đo ngoài Play: Doctor nhóm
`StickmanDoctor.Animation.cs`, cộng «bộ động tác không có đường nào soi được».

⚠⚠ **`IsAmbientClip` nay là `public` vì Doctor ĐO cái luật "mọi clip `loop` phải là loại nền"** —
chép bảng đó sang Doctor là hai bản sự thật. Hiệu chuẩn trên dữ liệu thật moi ra đúng một ngoại
lệ: `Swim/stroke` lặp mà `Swim` không phải loại nền, **và như thế là ĐÚNG** — `WaterZone` nắm cả
hai đầu (`OnTriggerStay2D` phát, `OnTriggerExit2D` `Release`). Chữa bằng cách nhét `Swim` vào
`IsAmbientClip` là **giết dáng bơi**: `UpdateAmbientAction` nhả ngay mọi clip nền mà
`ResolveAmbientType` không trả về, và nó không biết gì về nước. Nên ngoại lệ khai ở
`HasReleaseOwner` KÈM tên dòng code nhả nó ra — giữ danh sách đó ngắn.

### ⚠ BÀI QUYỀN · TRÊU CHỌC · ĐỨNG RẢNH (2026-09-07, user: *"thêm các loại animation như bài quyền, idle phức tạp, các animation trêu chọc"*)

Ba nhóm động tác cho quãng **KHÔNG ĐÁNH NHAU** — quân dàn hàng chờ lệnh, lính gác đứng đêm, hai bên nhìn nhau trước khi xáp. Trước đó cả sân chỉ có ĐÚNG HAI dáng đứng được bốc ngẫu nhiên (`breathe` · `shift`), nên hàng quân đọc ra một dãy tượng cùng thở — mà đây lại đúng là quãng người xem nhìn lâu nhất.

| Nhóm | Là gì | Bốc thế nào |
|---|---|---|
| **Bài quyền** | `StickmanActionType.Kata` — LOẠI MỚI. 3 style: `form` (tấn → đâm → bổ → quét → thu thế) · `spin` (xoay người quét) · `salute` (bái tổ) | `AIKataModule` (trong bộ mặc định), 20–45 s một lần khi thật sự rảnh |
| **Trêu chọc** | STYLE của `Cheer`: `mock` (vẫy gọi) · `point` (chỉ mặt) · `bang` (đập vũ khí vào khiên) | `AITauntModule` bốc theo `EntityId` — cùng một người luôn chọc cùng một kiểu, nên nó thành TÍNH CÁCH chứ không thành nhiễu |
| **Đứng rảnh** | STYLE của `Idle`: `stretch` (vươn vai) · `checkgear` (chỉnh thế cầm) · `scan` (ngó quanh, dịch chân) | `Pick` bốc ngẫu nhiên theo trọng số, đều dưới `breathe` (1.0) |

⚠⚠ **CHỈ `Kata` LÀ LOẠI MỚI, và nó phá luật "ưu tiên thêm STYLE" có lý do đọc được.** Luật của file này là thêm style chứ đừng thêm loại (thêm loại là phải nhớ nối vào `IsAmbientClip` · bảng ưu tiên · `DefaultLegWeightWhileMoving` · `DefaultOvershoot`). Bài quyền không lách được ở đúng một điểm: nó **chơi MỘT LẦN và DÀI**, còn `Idle` thì `loop` + nằm trong `IsAmbientClip` (bị coi là tư thế nền, không có điểm kết thúc) và `Cheer` thì ưu tiên 14 — cao hơn cả trúng đòn. Nhét vào một trong hai thì hoặc nhân vật KẸT trong bài quyền, hoặc bài quyền CHẶN mất phản ứng chiến đấu.

⚠⚠ **`Kata` ƯU TIÊN 2 — CON SỐ QUAN TRỌNG NHẤT CỦA CẢ NHÓM**, không phải mấy toạ độ. Bài quyền dài 2–3 giây; để ngang `Cheer` (14) là địch xông tới mà lính vẫn múa cho hết bài rồi mới rút kiếm, và nhìn vào chỉ thấy "AI đơ" chứ không ai ngờ tới cái clip.

⚠ **Ưu tiên thấp vẫn CHƯA ĐỦ — module còn phải TỰ TỪ CHỐI múa.** `AIKataModule` có bốn cửa, cửa nào cũng phải qua: không có mục tiêu · không `IsUnderFire` · đang đứng yên trên đất · không cưỡi. Thiếu cửa `IsUnderFire` là lính đứng múa quyền trong khi tên bay qua đầu.

⚠ **Ba kiểu trêu chọc để `weight = 0`** (đúng tiền lệ `sentry`/`helm`/`bless`): `Cheer` còn là động tác HÔ XUNG TRẬN. Để > 0 là cả đạo quân xung phong trông như đang chọc ghẹo nhau. Bảng tên nằm ở `StickmanBodyAnimator.MockStyles` — thêm kiểu thì thêm vào đó, đừng kê tay ở `AITauntModule`.

⚠ **Góc thân dưới `SpinThreshold` (110°) KỂ CẢ SAU KHI NHÂN `scale`** — bộ Boss có scale 1.6 nên trần thực dụng là ~66°. Vượt là clip bị coi là "cú xoay trọn vòng" và không bao giờ được bốc ngẫu nhiên nữa: style nằm trong asset mà không bao giờ xuất hiện. `spin` đi tới 46° (×1.6 = 73.6°) là đã cân nhắc.

⚠ **Chạy lại tool** sau khi sửa: Bảng điều khiển › «Dựng bộ ĐỘNG TÁC» (`StickmanActionSetBuilder`) — bảng số nằm trong CODE, asset là bản BAKE nên sửa code xong không bấm là không có gì đổi.


Nhân vật nhảy · rơi · tiếp đất · ngồi · bò · leo thang · đu dây · lăn né · **bị nhốt**, và có
dáng thân riêng lúc ra đòn / trúng đòn / đỡ đòn. **Mỗi loại có nhiều STYLE** (nhảy thẳng /
co gối / dang chân / lộn vòng...). Chi tiết: `Docs/KnowledgeBase/Animation.md`.

**SÁU ĐỘNG TÁC BỔ SUNG** (`StickmanActionSetBuilder.GroundedAndChores`, có ở cả 5 bộ):
`Knockdown` ngã sấp · `GetUp` bò dậy · `Work` vung dụng cụ · `Carry` khiêng · `Cheer` hô ·
`Rest` ngồi nghỉ. Ba cái đầu tiên đã nối vào chỗ dùng: `ResourceNode.PlayWorkBeat` giờ có
DÁNG (trước chỉ có tiếng nghề + vụn văng, thợ đứng thở trong khi cây tự rụng dăm), và
`AITauntModule` hô có hình chứ không chỉ có tiếng.
⚠ Ngã sấp/bò dậy do `StickmanStatus` LÁI (cờ `IsKnockedDown`), animator chỉ ĐỌC — đồng hồ chỉ
được nằm một chỗ, hai chỗ đếm là hai thời điểm đứng dậy khác nhau giữa hình và luật.
`UpdateGetUp` bắt CẠNH XUỐNG của cờ đó ngay trong animator, không đẻ thêm event.

⚠ **THÊM ĐỘNG TÁC `loop = true` thì PHẢI nối tên vào `StickmanBodyAnimator.IsAmbientClip`.**
Clip lặp thì `IsClipFinished` không bao giờ true, nên nếu nó không được coi là động tác NỀN,
`Play()` sẽ bảo vệ nó VĨNH VIỄN — không động tác nào cắt ngang được và nhân vật kẹt cứng ở tư
thế đó tới lúc chết. Động tác nền GIỮ LÂU (ngồi, bám thang, `Captive` bị nhốt) thì điều khiển
bằng TRẠNG THÁI trong `ResolveAmbientType`, KHÔNG gọi `PlayAction` — `PlayAction` là cho động
tác chớp nhoáng, dùng cho tư thế giữ lâu thì frame sau nó tự trả về Idle.

Năm điều cần nhớ:

1. **MỖI TRANSFORM CHỈ MỘT CHỦ** — luật quan trọng nhất, phá là nhân vật giật theo thứ tự script:
   `StickmanProceduralAnimator` giữ IKArmL/R + góc boneHead + góc vũ khí ·
   `StickmanLegWalker` giữ IKLegL/R + góc `body_1` ·
   `StickmanBodyAnimator` giữ **rig root localPosition.y** và MƯỢN hai cái kia qua
   `SetActionLegs` / `SetActionArms` (có `weight` nên blend vào/ra mượt).
   Script mới ĐỪNG ghi thẳng IK — mượn qua API.
   **Phân biệt ĐẦU VÀO và BIẾN TÍCH LUỸ**: tham số của `SetActionLegs/Arms` được ghi lại
   MỖI FRAME (đầu vào), còn `_appliedLean` v.v. thì cộng dồn qua frame. Sửa góc kiểu
   "trừ bớt một vòng" phải làm trên BẢN SAO cục bộ + dùng phép IDEMPOTENT
   (`Mathf.DeltaAngle`), đừng trừ thẳng vào biến tích luỹ — trừ mỗi frame là góc chạy vô
   hạn, nhân vật XOAY TRÒN không dừng (đã dính 1 lần ở cú lộn/lăn 360°).
   Cùng lý do, **`_fadeFrom` lúc CROSSFADE phải bỏ vòng nguyên** (`StickmanBodyAnimator`):
   clip lộn/lăn kết ở `bodyAngleOffset` = ±360, mà `StickmanActionPose.Lerp` cố tình lerp
   TUYẾN TÍNH (để cú lộn chạy trọn vòng) — giữ nguyên ±360 làm điểm xuất phát là lúc hoà
   sang động tác thường nó quay NGƯỢC trọn một vòng, mỗi lần né/lăn xong lại xoay một cái.
   Cắt vòng ở chỗ chụp `_fadeFrom`, ĐỪNG đổi `Lerp` sang `LerpAngle` (đổi là mất cú lộn).
   Và **`_appliedLean` phải được `WrapNear` về vòng gần đích TRONG `ApplyBodyLean`** (mọi
   nhánh, kể cả nhánh động tác chiếm trọn chân): clip nhảy "flip" kết ở 360°, sang Fall/Land
   thì pose đã bỏ vòng nguyên nhưng góc ĐANG ÁP còn ở ~360 — thiếu WrapNear ở đó là nhân vật
   quay ngược trọn vòng GIỮA TRỜI và gập úp xuống đất lúc tiếp đất (đã dính 1 lần).
   Hai bẫy anh em: **flip thân theo hướng ngắm phải có VÙNG CHẾT** (`ApplyAim`: |aim.x| >
   0.08 mới đổi hướng — nhảy qua đầu mục tiêu là aim.x đổi dấu mỗi frame, thân lật qua lật
   lại như xoay vòng); **bù chiều cao rig cho IK chân đi RIÊNG qua tham số `lift` của
   `SetActionLegs` ở lực đầy đủ**, không trộn vào offset chân — offset bị nhân weight chân
   (hạ khi đang đi) nên bù thiếu là bàn chân lún xuống dưới mặt đất lúc tiếp đất.
1b. ⚠⚠ **`legWeightWhileMoving` PHẢI LẤY TỪ MỘT CHỖ:
   `StickmanActionClip.DefaultLegWeightWhileMoving(type)`.** Trường này quyết định động tác
   được chiếm CHÂN bao nhiêu khi người đang đi; để 1 cho một dáng THÂN là
   `StickmanLegWalker` bỏ hẳn chu kỳ bước → **bàn chân đứng im mà người vẫn trôi**.
   Đã dính đúng vậy: bảng nằm trong `StickmanActionSetBuilder`, còn `StickmanActionBuilder`
   (builder thứ hai, nối các STYLE phụ vào cùng bộ) **không biết mà gọi** nên mọi style của nó
   nhận giá trị khởi tạo `1f`. Quá nửa số cú đánh bốc trúng style của file đó
   (`AttackBody/stagger` 0.8 + `gut` 0.6 so với `flinch` 1.0) ⇒ *"vừa đánh vừa đi thì khựng
   rồi trượt như đi trên băng"*, không lỗi nào báo. Nay bảng nằm **cạnh chính cái field**
   trong `StickmanActionTypes.cs` (runtime) và cả hai builder đều gọi nó.

1c. ⚠ **BÙ SẢI CHÂN THEO PHẦN BỊ ĐỘNG TÁC CHIẾM** (`StickmanLegWalker`, `strideScale`).
   Kết quả cuối là `Lerp(bướcĐi, dángĐộngTác, w)` nên biên độ bước chỉ còn `(1−w)` trong khi
   THÂN vẫn đi đủ quãng — chênh bao nhiêu là trượt bấy nhiêu. Chia ngược `1/(1−w)` thì bàn
   chân đi đúng quãng thân đi.

1d. ⚠ **MỐC "LỘN NGƯỢC" LÀ 110°, KHÔNG PHẢI 170°** (`StickmanActionSet.SpinThreshold`). Câu
   hỏi đúng không phải *"clip này có quay trọn 360 không"* mà **"có lúc nào cái đầu chúc xuống
   đất không"**. `Land/"roll"` đi tới −160° — lọt lưới 170 nên vẫn được bốc ngẫu nhiên ở ~18%
   số lần tiếp đất, và một động tác ưu tiên cao hơn cắt ngang đúng lúc đó là thân đứng lại ở
   tư thế **CẮM ĐẦU XUỐNG ĐẤT**.

1e. ⚠⚠ **NỘI SUY TỪNG-ĐOẠN LÀM ĐỘNG TÁC DỪNG HẲN Ở MỖI KHUNG HÌNH.**
   `StickmanActionClip.Sample` cũ nối hai khung bằng `Mathf.SmoothStep`. SmoothStep có đạo
   hàm **bằng 0 ở CẢ HAI đầu**, nên mỗi khung hình là một điểm **VẬN TỐC = 0**: động tác đi
   một đoạn → đứng lại → đi tiếp. Clip trong dự án có 3–5 khung cách nhau 0.1–0.3 giây, tức
   nhân vật khựng 2–4 lần trong mỗi cú nhảy / cú đánh / cú trúng đòn. Đo được: ở
   `Jump/"tuck"` vận tốc thân tại khung giữa là **0.1 °/s** (đứng im) trong khi vận tốc đỉnh
   là 60 °/s. Không lỗi nào báo — từng đoạn một đều "mượt", chỉ có chỗ NỐI là chết.
   Nay mặc định là **Catmull-Rom không đều** (`ActionInterpolation.Spline`): đường cong đi
   xuyên qua mọi khung với vận tốc liên tục. Cùng phép đo: khung giữa 36.7 °/s (chảy qua),
   và vận tốc ĐỈNH giảm 15–32% ở mọi clip vì không còn phải bù cho những lần dừng.
   · ⚠ **Phải là bản KHÔNG ĐỀU** (tiếp tuyến tính theo MỐC THỜI GIAN thật, không theo chỉ số
     khung): khung trong dự án cách nhau rất lệch (0.04s nối 0.22s), dùng công thức đều thì
     đoạn ngắn bị thổi tiếp tuyến lên nhiều lần và động tác vọt ra ngoài rồi giật ngược.
   · ⚠ **Clip LẶP phải nối vòng qua chỗ nối** (`Neighbour` dời mốc ±`duration`), và phải nhận
     ra khung đầu TRÙNG khung cuối — builder viết pose y hệt ở t=0 và t=duration cho vòng lặp
     khép kín, coi chúng là hai khung riêng thì tiếp tuyến ở chỗ nối bị dẹt và clip vẫn giật
     đúng một nhịp MỖI VÒNG, ở đúng chỗ dễ thấy nhất (dáng đứng lặp cả trận).
   · ⚠ **`Spline` = 0 là CỐ Ý.** `StickmanActionSet` đã bake trên đĩa không có trường này
     trong YAML nên nạp về `default(int)` = 0 — để Spline ở 0 thì asset cũ cũng mượt ngay,
     không phải dựng lại. (Vẫn nên dựng lại để lấy `overshoot`, xem 1f.)
   · Giữ `Smoothed` cho clip nào CỐ Ý muốn từng nhịp tách bạch (dáng máy móc, giật cục).

1f. **ĐÀ VỌT QUÁ LÀ THỨ LÀM ĐÒN ĐÁNH CÓ SỨC NẶNG** (`StickmanActionClip.overshoot` +
   `DefaultOvershoot(type)`). Cơ thể thật không dừng đúng điểm đến: nó đi lố rồi bị cơ kéo về.
   Bỏ nó thì động tác vẫn ĐÚNG nhưng "khô". Hai nhóm: động tác CÓ LỰC (đấm 0.22 · trúng đòn
   0.26 · tiếp đất 0.18) vọt nhiều; tư thế GIỮ LÂU (ngồi 0 · thủ 0.03 · đứng yên 0.05) gần
   như không vọt — mấy cái này người xem nhìn suốt nhiều giây, vọt là ra "đang lắc lư", và
   với `Crouch` thì nó còn đẩy trọng tâm xuống sâu hơn số đã cân bằng.
   ⚠ **Mức vọt CÓ TRẦN theo biên độ của chính bốn khung quanh chỗ nối**, không phải nhân tự
   do: nhịp thở (biên độ 0.012) và cú lộn (360°) phải được vọt theo TỈ LỆ của mình. Trần này
   cũng là thứ giữ IK chân không bị đẩy ra ngoài tầm với — `ClampToReach` chỉ lo được TAY.
   ⚠ **Bảng `DefaultOvershoot` nằm CẠNH CHÍNH CÁI FIELD** trong `StickmanActionTypes.cs`, y
   như `DefaultLegWeightWhileMoving` — dự án có HAI builder ghi vào cùng một bộ động tác
   (`StickmanActionSetBuilder` + `StickmanActionBuilder`), bảng nào chỉ nằm ở một bên thì bên
   kia nhận giá trị khởi tạo và sai TRONG IM LẶNG (đã trả giá đúng một lần với
   `legWeightWhileMoving`).

1g. ⚠⚠ **BƯỚC ĐI TỪNG TRƯỢT CHÂN NGAY CẢ KHI SẢI CHÂN ĐÃ HIỆU CHUẨN ĐÚNG.**
   `StrideFor` được suy ra từ giả định **bàn chân lùi ĐỀU trong pha trụ**, nhưng `ComputeLeg`
   lại vẽ bằng `sin`: trong nửa chu kỳ chạm đất, `sin` chạy nhanh nhất ở giữa (hệ số π/2) và
   chậm dần về hai đầu, trong khi THÂN đi đều. Cộng cả bước thì bằng 0 — nên phép hiệu chuẩn
   vẫn báo "khớp tuyệt đối 1.000×" — nhưng từng khoảnh khắc thì bàn chân trượt tới lúc đặt
   gót, trượt lui quá đà ở giữa, rồi trượt tới lúc nhấc gót. **Đo được: vận tốc trượt đỉnh
   bằng 99.9% tốc độ thân.** Không lỗi nào báo, và phép đo cũ nói rằng mọi thứ đều ổn.
   Nay pha trụ đi **TUYẾN TÍNH** theo pha (`_groundLockedStance`) → trượt đỉnh **0.0%**.
   · Pha ĐƯA CHÂN nối bằng Hermite có tiếp tuyến hai đầu ĐÚNG BẰNG tiếp tuyến pha trụ, nên
     chỗ nối liền cả vị trí lẫn vận tốc; đường cong ra đúng dáng thật (nấn ná lúc nhấc gót,
     vụt tới ở giữa, hãm lại trước khi đặt gót).
   · Độ nhấc đổi từ `max(0, cos)` sang `sin²`: bản cũ có **GÓC NHỌN** ở lúc đặt/nhấc gót
     (vận tốc dọc nhảy bậc từ tối đa về 0 — cái "cạch" mà mắt đọc ra là bàn chân bị dập
     xuống đất). Đo được: gia tốc dọc đỉnh **15 441 → 49** (đi bộ), **52 211 → 164** (chạy).
   · Mốc phát sự kiện `Stepped` KHÔNG đổi (vẫn là phase = π/2 + kπ) nên tiếng bước và bụi
     chân vẫn khớp y như trước.

1h. **BA THỨ LÀM BƯỚC ĐI "CÓ NGƯỜI" CHỨ KHÔNG PHẢI "CÓ HAI CÁI CHÂN ĐANG ĐUNG ĐƯA":**
   · **NHÚN HÔNG** (`StickmanLegWalker.WalkBob`, biên độ = `_bodyBob` × độ nhấc chân của kiểu
     bước) — hông hạ ở nhịp hai chân cùng chạm đất rồi về mốc ở giữa pha trụ. Cái hông trôi
     ngang tuyệt đối phẳng là dấu hiệu số 1 của "trượt trên băng", kể cả khi bàn chân đã khoá
     đất đúng.
     ⚠⚠ **CHỐT MỘT FRAME RỒI MỚI ĐỔI.** `StickmanBodyAnimator` (order −5) ĐỌC số này rồi cộng
     vào rig root; `StickmanLegWalker` (order 0) bù ngược đúng ngần ấy vào IK chân. Nếu bên bù
     chân tính lại từ pha MỚI thì hai bên lệch nhau một frame nhún — ở tốc độ chạy, một frame
     bằng gần 1/3 biên độ, tức **bàn chân thọc xuống đất rồi nhấc lên mỗi frame**. Nên: bù
     chân bằng ĐÚNG số BodyAnimator vừa đọc, XONG mới tính số cho frame sau (cuối `LateUpdate`).
     Cùng lý do, nhánh "động tác chiếm hẳn chân" phải **ÁP TRƯỚC, TẮT SAU**.
   · **LẮC THÂN** theo bước (`_stepSway`, ô RIÊNG với `_lean`) — nhét dao động 1×/bước vào
     `_lean` là chính phép lerp đổi-kiểu-bước dập tắt nó.
   · **ĐÁNH TAY** (`StickmanProceduralAnimator.AddStepSway`, đọc `LegWalker.ArmSwing`) — trước
     đây tay hoàn toàn thuộc quyền vũ khí nên nhân vật CHẠY với hai cánh tay đóng băng tuyệt
     đối. Hai tay vung ngược nhau, chéo tay chéo chân.
     ⚠ **CHỈ DỜI IK TAY, KHÔNG ĐỘNG `weaponAngle`**: góc vũ khí neo trong KHÔNG GIAN NGẮM
     (0 = mũi chỉ thẳng mục tiêu), nên bàn tay nhích mà nòng vẫn chỉ đúng chỗ. Vung cả góc vũ
     khí là vừa đi vừa bắn sẽ trượt, và cả bốn kiểu ngắm của người chơi sai theo.
     ⚠ **Nhịp thở NHƯỜNG CHỖ khi đang đi** — hai dao động cùng biên độ chồng lên nhau ra thứ
     nhìn như tay run, và ngoài đời cũng không ai đọc được nhịp thở của người đang chạy.
   ⚠ Ba số tuning này là **FIELD MỚI** nên nhận đúng giá trị khởi tạo trong code kể cả ở
   prefab/scene đã bake — KHÔNG phải chạy tool vá gì cả. (Ngược lại với việc sửa field ĐÃ CÓ.)

1i. **DÁNG ĐỨNG NÓI RA MÁU CÒN BAO NHIÊU** (`StickmanBodyAnimator.WoundedStyle` = `"tired"`).
   Dưới 30% máu thì dáng đứng yên chuyển sang gập người thở dốc, trên 38% thì thôi.
   Không thêm style mới: `"tired"` có sẵn trong kho từ đầu nhưng **chưa ai gọi tới**, nên nó
   chỉ nằm chờ được bốc ngẫu nhiên — tức một anh lính đầy máu cũng có thể ra dáng kiệt sức.
   Nay nó có ĐÚNG MỘT lý do để xuất hiện, và đó là thông tin gameplay đọc được từ xa: nhìn
   hàng quân là biết nên dồn vào ai, trong khi thanh máu thì bé và chồng lên nhau.
   ⚠ **PHẢI CÓ VÙNG CHẾT** (30% vào / 38% ra): giáo sĩ hồi máu nhỏ giọt quanh ngưỡng thì một
   ngưỡng đơn sẽ bật/tắt mỗi nhịp hồi, mà mỗi lần bật/tắt là `Play` đổi clip + reset
   `_clipTime` → dáng đứng GIẬT LIÊN TỤC, không lỗi nào báo. Đúng họ với mấy cặp luật giằng
   nhau ở mục AI §5c.

1i-bis. ⚠⚠ **BỊ THƯƠNG LÀ MỘT HỆ BA VẾ, VÀ CẢ BA PHẢI HỎI CHUNG MỘT CHỦ.**
   Dưới 30% máu thì nhân vật **gập người thở dốc khi đứng** (1i) · **đi chậm lại** · **đi CÀ
   NHẮC** — chân đau chống đất ít hơn, lê sát mặt đất, hông gật xuống mỗi lần dồn tải.

   | Vế | Ở đâu | Số |
   |---|---|---|
   | dáng ĐỨNG | `StickmanBodyAnimator.WoundedStyle` | style `"tired"` |
   | TỐC ĐỘ | `StickmanLocomotion.WoundedScale` — **Ô RIÊNG**, xem §5c-move | `WoundedSpeedFloor` = **55%** lúc kiệt nhất |
   | DÁNG ĐI | `StickmanLegWalker` (`_limp*`) | duty **43/57**, chân đau nhấc còn **32%**, hông sụp chênh **3.4 lần** |

   ⚠⚠ **CHỦ CỦA CÂU HỎI "CÓ ĐANG BỊ THƯƠNG KHÔNG" LÀ `StickmanController.IsWounded`** (kèm
   `WoundedSeverity` 0→1 để nội suy). Trước đây ngưỡng + vùng chết nằm trong chính
   `StickmanBodyAnimator` vì dáng đứng là chỗ DUY NHẤT đọc nó; thêm hai hệ nữa mà để mỗi hệ
   tự đếm là **ba thời điểm "bắt đầu thương" khác nhau** — nhân vật lê chân trong khi dáng
   đứng vẫn hùng dũng, hoặc chạy đủ tốc trong lúc đã gập người. Không lỗi nào báo. Cùng khuôn
   `StickmanStatus.IsKnockedDown`: một nơi LÁI, animator chỉ ĐỌC.

   ⚠⚠ **CÀ NHẮC LÀM BẰNG DUTY CYCLE, TUYỆT ĐỐI KHÔNG RÚT SẢI CHÂN.** Cách "hiển nhiên" (chân
   đau bước ngắn lại) phá thẳng phép hiệu chuẩn của `StrideFor` — bàn chân phải lùi ĐÚNG bằng
   quãng thân tiến tới, rút 20% là bên đó **trượt 20%**, đúng cái bug đã phải đi sửa hai lần
   (§1g). Cách đúng: giữ nguyên VẬN TỐC bàn chân lúc chạm đất, chỉ đổi PHẦN THỜI GIAN nó chạm
   đất — chân đau chống ngắn, chân lành gánh lâu; đó cũng đúng là cà nhắc ngoài đời (né tải
   khỏi bên đau). Biên độ bù theo **`amp = 2 × duty`** nên
   `dforward/dp = −amp/(π·duty) = −2/π` **bất kể duty**. Đo lại bằng Python: trượt đỉnh
   **0.00%** tốc độ thân ở mọi mức duty 0.40–0.60, và hai duty cộng lại bằng 1 nên luôn có
   đúng MỘT chân chống đất (không hoá nhảy lò cò).

   ⚠⚠ **NHÚN HÔNG LỆCH PHẢI DÙNG `Sin`, KHÔNG PHẢI `Cos` — dùng nhầm là cà nhắc BIẾN MẤT
   TRONG IM LẶNG.** Nhún gốc `(1 − cos 2p)/2` cực đại ở `p = π/2, 3π/2` (lúc ĐỔI CHÂN = lúc
   nhận tải) và bằng ĐÚNG 0 ở `p = 0, π` (giữa pha trụ). Chân trái chống quanh `p = π` nên nó
   nhận tải ở `p = π/2` — mà ở đó `cos` bằng 0, tức hệ số lệch **không tác dụng vào đâu cả**,
   còn chỗ nó mạnh nhất thì nhún gốc đã bằng 0. Đo được: bản `Cos` cho hai nhịp chênh nhau
   **1.00 lần** (tức không lệch gì), bản `Sin` cho **3.44 lần**. Đã dính đúng một lần, và chỉ
   phát hiện được bằng cách ĐO — đọc code thì cả hai đều xuôi tai.

   ⚠ **Chân đau BỐC THEO NHÂN VẬT** (mã băm instance, chọn một lần ở `Awake`), không bốc lại
   mỗi lần bị thương: đổi chân giữa chừng là nhìn ra ngay "què chân trái xong lại què chân
   phải". Cùng luật với `CivilizationDefinition.PickVariant` — và nhờ vậy cả tiểu đội bị
   thương không cùng lê một bên chân.

   ⚠ **KHÔNG phải dựng lại scene nào**: mấy số tuning đều là **field MỚI**, nên 44 scene đã
   bake nhận đúng giá trị khởi tạo trong code (khác hẳn việc sửa một field ĐÃ CÓ — Unity nạp
   giá trị đã lưu). Cũng không có ActionSet nào phải build lại: `"tired"` vốn đã nằm trong
   kho, còn dáng đi thì thuần procedural.

   ⚠ Tắt cho boss / quái cố ý vô cảm bằng `_woundedSlowdown` (Locomotion) và
   `_limpWhenWounded` (LegWalker). Kỵ binh tự khỏi cà nhắc mà không cần dòng nào: `SetMounted`
   để `_actionWeight = 1` nên `LateUpdate` bỏ luôn chu kỳ bước.

1j. ⚠⚠ **THÊM STYLE THỨ HAI CHO MỘT LOẠI ĐỘNG TÁC THÌ PHẢI SOI LẠI TRẦN "XOAY TRỌN VÒNG".**
   `StickmanActionSet.SpinThreshold` = 110° và nó đo trên góc **ĐÃ NHÂN `scale` của bộ** —
   bộ Boss có `scale 1.6`. `Knockdown/"sprawl"` viết 71° nên ở bộ Boss thành **113.6°**, tức
   bị xếp là "cú xoay trọn vòng" và CẤM bốc ngẫu nhiên. Suốt thời gian nó là style DUY NHẤT
   của Knockdown thì lưới an toàn *"loại hết thì thôi không loại nữa"* đỡ hộ; nhưng ngay khi
   thêm style thứ hai, boss **không bao giờ ngã kiểu sprawl nữa** — style vẫn nằm trong asset
   mà không bao giờ xuất hiện, và không có lỗi nào báo. Đã hạ về 64/66 (Boss 105.6°).
   ⚠ Cách soi: lấy góc lớn nhất của clip × 1.6 rồi so với 110. Còn hai chỗ CỐ Ý vượt trần và
   đúng như vậy: `Land/"roll"` (256°) và `Roll/"tumble"` ở bộ Boss (120°) — cả hai đều được
   gọi ĐÍCH DANH nên không cần bốc ngẫu nhiên.

1k. **SÁU LOẠI ĐỘNG TÁC TỪNG CHỈ CÓ ĐÚNG MỘT KIỂU** — nay mỗi loại có hai
   (`StickmanActionSetBuilder.SecondStyles`): ngã sấp `facedown` · bò dậy `twist` · làm việc
   `dig` · khiêng `shoulder` · ngồi nghỉ `recline` · hô `pump`.
   Vì sao đúng sáu cái này: kho style phụ (`StickmanActionBuilder`) đã lo mấy động tác CHỚP
   NHOÁNG rồi, nhưng sáu loại này lại là mấy loại người xem **NHÌN LÂU NHẤT** — hàng chục xác
   nằm cùng một tư thế ở màn zombie, cả đoàn tiếp tế khiêng giống hệt nhau, cả doanh trại ngồi
   một kiểu. Một style = cả tiểu đội trùng nhau tới từng frame.
   ⚠ Vẫn KHÔNG thêm `StickmanActionType` nào: thêm LOẠI là phải nhớ nối vào `IsAmbientClip` +
   bảng ưu tiên + `DefaultLegWeightWhileMoving` + `DefaultOvershoot`; thêm STYLE thì cả bộ máy
   chạy nguyên. Đúng tiền lệ `sentry` / `helm` / `bless`.

2. **Động tác = dữ liệu, không phải clip.** `StickmanActionSet` (asset) chứa
   `StickmanActionClip[]`: `type` + `style` + `keys[]` + `armMode` + `priority`.
   `StickmanBodyAnimator` lerp giữa các khung ở `LateUpdate`. Thêm động tác = thêm dữ liệu
   trong `StickmanActionBuilder.cs` rồi bấm `Tools > Stickman > Animation > 1`.
3. **NGỒI = HẠ RIG ROOT, không phải kéo chân lên.** `bodyHeightOffset` hạ cả rig xuống `d`,
   IK chân được BÙ NGƯỢC `|d|` để bàn chân đứng yên → gối tự co. Kéo IK chân lên thì thành
   "co chân lên trời" còn người vẫn đứng. Pose chân ghi bằng OFFSET so với tư thế nghỉ
   (đổi skin vẫn đúng); pose tay ghi TUYỆT ĐỐI theo hệ `WeaponHoldPose`.
3b. **TRÈO THANG = BA VẾ, thiếu vế nào cũng ra "trôi lên thang".** Đây là chỗ đã sai một lần
   và sai trong im lặng — clip có đủ, chỉ là nhìn không ra động tác nào:
   · **HAI TAY ĐI LÊN, KHÔNG DUỖI RA TRƯỚC.** `ikArmL/R` nằm trong không gian NGẮM của
     `boneHead`: `-Y` là hướng ngắm (NGANG), `+X` mới là LÊN TRỜI (đo từ `AimTarget` trong rig
     gốc: (−0.009, −2.963) — thuần −Y). Bản cũ ghi `(−0.02, −1.7)` = hai tay chĩa thẳng ra
     trước mặt, còn chân thì lệch 0.08 (bằng 1/3 tầm nhấc chân của một bước đi). Kèm đó
     `bodyAngle` DƯƠNG ≈ 20° cho người ÁP VÀO thang — đó là khác biệt giữa "bám thang" và
     "đứng thẳng giơ tay".
   · **ÉP HƯỚNG NGẮM VỀ NGANG khi đang bám thang** (`StickmanFighterController.ApplyAim`):
     `boneHead` xoay theo mục tiêu, mà tay lại neo trong không gian ấy — đang chúc mũi xuống
     một thằng dưới đất thì "hai tay với lên" bị xoay theo và chọc sang ngang.
   · **CẤT VŨ KHÍ** (`StickmanWeaponHolder.SetStowed`, ghi mỗi frame theo `IsClimbing`): hai
     tay bận nắm bậc thì không ai vác kiếm chĩa ra trước. Cất tạm ≠ `Unequip`: cây vẫn là
     `Current`, chỉ TẮT HÌNH + cấm ra đòn, nên nhịp hồi chiêu · thế thủ · lưỡi thứ hai của
     song đao không bị tháo ra lắp vào mỗi lần chạm thang. Rút lại thì trả về ĐÚNG trạng thái
     hình lúc cất (cây lao vừa ném đi đang cố tình ẩn — bật bừa là hiện ra một cây lao ma).
     `OnDeath` phải gọi `SetStowed(false)`: chết lúc đang leo thì `Update` không chạy nữa, cây
     rớt xuống đất sẽ VÔ HÌNH.
4. **Phần lớn TỰ ĐỘNG.** BodyAnimator đọc `StickmanLocomotion` (đang bay? ngồi? bám thang?)
   chọn động tác nền; động tác chớp nhoáng chen ngang theo `priority` qua sự kiện
   `Jumped` / `Landed` / `Damaged` / `DealtHit` (mới — đòn của MÌNH ăn) /
   `AttackStarted` (mới). **Đỡ được đòn thì KHÔNG rúm người** — phân biệt bằng máu có tụt không.
5b. **NGỒI = ĐỨNG YÊN HẲN** (`StanceSpeedScale` trả 0 cho `Crouch`, cả người chơi lẫn AI).
   Ngồi là tư thế NẤP; "vừa ngồi vừa lết ngang" đọc ra ngay là lỗi. Muốn đi thấp thì có **BÒ**
   (`Crawl`) — đó mới là tư thế đi lại, và `AIStateInfiltrate` (ninja bò tới gần con mồi) đã
   chuyển sang dùng nó: để `SetCrouch` là ninja đứng chôn chân giữa đường, không lỗi nào báo.
   ⚠ Trả 0 THẲNG TRONG CODE, cố ý không đọc `_crouchSpeedScale` nữa — số đó đã bake 0.45 vào
   prefab NPC và vào người chơi của 44 scene, nên luật phải nằm ở chỗ KHÔNG AI BAKE ĐƯỢC.
   Cùng lý do có `StickmanLocomotion.SpeedTuning` (0.82): hằng số nhân lúc ĐỌC để chỉnh tốc độ
   chung cả dự án, vì `_walkSpeed` đã nằm trong prefab lẫn 44 scene.

5c-move. **MỖI NGUỒN LÀM CHẬM MỘT Ô RIÊNG** — vật cưỡi · giáp · trạng thái · bơi · **đang ra
   đòn** (`SetActionSlowdown`, `StickmanFighterController` ghi mỗi frame theo
   `StickmanProceduralAnimator.IsAttacking`, còn 60%) · **SỨC KHOẺ** (`WoundedScale`, xem
   §1i-bis). Vung vũ khí mà vẫn phi hết tốc là đòn không có sức nặng. Nhét chung một biến là
   đánh xong một nhát thì bộ giáp hết nặng, hoặc hồi máu xong thì hết dính bùn.
   ⚠ `WoundedScale` là ô DUY NHẤT **không có setter** — nó ĐỌC THẲNG `_owner.WoundedSeverity`.
   Nguồn của nó chỉ có MỘT (máu), khác hẳn `RequestSentry` vốn có ba nguồn cùng đòi nên mới
   cần kiểu "đầu vào ghi mỗi frame"; đọc thẳng thì không builder nào phải nhớ nối dây, và
   cũng không có đường nào để quên tắt lúc hồi máu.

5. **Đi lại trong địa hình nằm ở `StickmanLocomotion`** (chỗ duy nhất ghi vận tốc):
   `Jump` có coyote time + jump buffer + cắt đà khi thả phím; `SetCrouch/SetCrawl` nhân tốc độ;
   `EnterClimb/Climb/ExitClimb` cho thang (hút về trục) và dây (chuyền ngang được).
   **Vẽ chuyển động thì hỏi `TravelSpeed`/`TravelVelocityX` (quãng đường THẬT đo giữa 2 nhịp
   vật lý), đừng hỏi `Velocity`** — `Velocity` là vận tốc ta vừa ghi vào Rigidbody, bị chắn
   đường thì nó vẫn báo đang chạy và chân quạt tại chỗ.
   **Đang bay thì KHÔNG chặn mép vực** — không thì nhảy qua khe bị cắt đà rơi thẳng xuống hố.
   **Tia dò "đang đứng trên đất" phải NGẮN** (`_groundProbeDepth` 0.12), tách khỏi tia dò vực
   (0.7): nhân vật chỉ cao ~0.73 nên tia dài vẫn chạm đất suốt nửa cú nhảy → nhảy được vô hạn
   giữa trời. Phím: Space nhảy · Ctrl ngồi · C bò · W/S leo (camera về nhân vật là `V`, KHÔNG phải `C`). Sân tập: `Demo_12_Traversal`.
   **AI cũng biết vượt địa hình**: `StickmanAgent.UpdateTraversal()` nhảy qua khe khi địch ở
   bên kia, leo thang khi địch ở tầng khác (`AIProfile` mục *Vượt địa hình*).

5b-climb. ⚠⚠ **THANG TRÈO PHẢI ĐI ĐƯỢC CẢ HAI CHIỀU — "lên được, xuống không được" là bug,
   không phải thiết kế.** `StickmanClimbZone.Contains` cố ý CẮT ở `TopY + _topOvershoot` (0.35)
   để người trèo vượt đỉnh được nhả ra đứng hẳn lên sàn. Nhưng chính cái cắt đó làm chiều
   NGƯỢC LẠI bất khả thi: đã đứng trên nóc thang thì `CanGrabFrom` trả false → bấm xuống không
   bám lại được, và người chơi **kẹt trên nóc tháp / thang công thành cho tới lúc chết**, không
   lỗi nào báo. Ba vế, thiếu vế nào cũng còn hỏng:
   · `CanGrabToDescend` + `FindToDescend` — nới trần lên `TopY + DescendReach` (1.2), giữ
     nguyên luật lệch trục nên chỉ ai đứng ĐÚNG miệng thang mới với xuống được;
   · `EnterClimb` **kéo người vào TRONG vùng** (`ClampInto`) — không kéo thì nhịp vật lý sau
     `UpdateClimbMovement` thấy "vượt đỉnh" là nhả thang + HẨY NGƯỢC LÊN: bấm xuống lại nảy lên;
   · **KHÔNG bám để tụt khi đang đứng ở ĐÁY thang** (`FeetPoint.y <= BottomY + 0.3`) — chỗ đó
     bấm NGỒI phải ra ngồi, không ra "bám thang rồi nhả ngay" (nhấp nháy mỗi frame, nhìn thì
     tưởng nút ngồi hỏng).
   ⚠ **ĐANG BÁM THANG THÌ NÚT NHẢY = LÊN, NÚT NGỒI = XUỐNG.** Trên điện thoại trục DỌC của cần
   ảo có vùng chết riêng (0.32) + luật trội (|y| > |x|×1.2) nên leo bằng cần rất khó ăn — mà
   hai nút đó lúc bám thang KHÔNG CÓ CHỦ (`SetCrouch`/`SetCrawl` vốn đã thoát sớm khi
   `IsClimbing`). Một nút một chủ theo NGỮ CẢNH, không phải hai chủ cùng lúc.
   ⚠ Đổi nghĩa nút nhảy thì phải **NUỐT cờ `ConsumeJumpPressed`** và bỏ qua hẳn khối NHẢY
   (`onLadder`): `Jump()` lúc đang bám thang = `ExitClimb()` + bật ra, tức là bấm nút để trèo
   lên thì lại bị hất khỏi thang. Đánh đổi đã chấp nhận: không còn nhảy khỏi thang giữa chừng,
   xuống thang bằng cách trèo tới đáy (kiểu thang của game đi ngang).
   ⚠⚠ **RỜI THANG Ở ĐỈNH LÀ BƯỚC LÊN SÀN, KHÔNG PHẢI NHẢY** (`StickmanLocomotion.ExitClimbAtTop`,
   2026-09-03 — video *"leo thang tháp xong bay lên trời"*). Ba thứ cộng lại thành một cú bật
   thẳng lên ~1.5 unit từ nóc tháp, cái nào cũng đúng khi đứng riêng: `ExitClimb` để lại MỘT
   lượt nhảy giữa trời (đúng cho buông tay GIỮA thang) · đỉnh thang hẩy lên `0.45 × jumpSpeed`
   để người trèo lọt hẳn lên sàn · và người chơi đang GIỮ/MASH phím NHẢY để leo (trên thang,
   nhảy = leo) — đúng frame rời thang thì phím ấy đổi nghĩa thành NHẢY THẬT. Nay hai đường rời
   thang ở đỉnh (`aboveTop` + "tới gần đỉnh mà thôi leo") đi qua `ExitClimbAtTop`: thu lượt
   nhảy về 0 + khoá `Jump()` 0.25 s. Buông tay giữa thang (`Jump()` lúc `IsClimbing`, thang
   biến mất) vẫn giữ lượt nhảy như cũ.
   ⚠ "Bấm XUỐNG mà không tụt xuống được" ở thang đứng là họ hàng: nhánh *"tụt tới đất thì
   buông"* hỏi mỗi `IsGrounded`, mà đứng trên SÀN GỖ ở đỉnh thì `IsGrounded` cũng true ⇒ bám
   → buông → bám mỗi nhịp. Nay hỏi thêm `atFoot` (chân ≤ `BottomY + 0.3`, cùng ngưỡng với
   `TryGrabClimb`).

## ⚠⚠ BƠI — CƠ CHẾ ĐÚNG MÀ HÌNH NÓI DỐI (2026-09-08)

`WaterZone` có từ lâu và làm đúng ba việc: hạ tốc độ (`StickmanLocomotion.SetSwimming`), trừ
máu xuyên giáp, bọt nước. Nó **không** đổi dáng — nên lính lội biển vẫn chạy dáng đi bộ, chân
giẫm trên mặt nước.

Không phép đo nào bắt được: cơ chế đúng, con số đúng, chỉ có hình là sai. Đây là anh em của
bẫy «art nói ngược lại cơ chế» ở mái chóp tháp.

**Đã vá:** `StickmanActionType.Swim` (22) + clip `stroke` trong `StickmanActionSetBuilder`.
`WaterZone.OnTriggerStay2D` gọi `body.Play(StickmanActionType.Swim)` — gọi mỗi nhịp là AN
TOÀN vì `StickmanBodyAnimator.Play` tự thoát khi động tác LẶP cùng loại đang chạy. Lúc ra
khỏi nước dùng `Release()` **chứ không** `Stop()`: mép nước là chỗ người ta ra vào liên tục,
cắt phựt nhìn như giật hình.

Ba thứ làm nên "đang bơi" thay vì "đang bò dưới nước" — đây là bộ số, đừng chỉnh mò:

| Vế | Giá trị | Vì sao |
|---|---|---|
| Thân ngả | `bodyAngle` **62–64°** | Bò chỉ 22–25°. Người bơi NẰM trên mặt nước |
| Hạ rig | `bodyHeight` **−0.62…−0.66** | Chìm quá nửa thân — vế phân biệt rõ nhất khi thu hình xuống 40 px |
| Tay | `ActionArmMode.Override` | Bơi mà tay còn chìa cây kiếm ra trước là hình nói ngược lại việc đang làm |

⚠ **PHẢI BẤM LẠI TOOL**: `Nâng cao/Animation/1. Build Action Sets (4 bộ)` — clip nằm trong
asset đã bake, sửa code builder không tự vào asset cũ.

⚠ **CƯỠI thì KHÔNG cần action type.** Dáng ngồi ngựa đã có đường riêng —
`StickmanLegWalker.SetMounted(sitLegFar, sitLegNear, angle)` lấy số từ `MountDefinition`.
Đừng đẻ thêm `StickmanActionType.Ride`: hai chủ cùng ghi IK chân là vi phạm luật «mỗi
transform một chủ».


### ⚠ BỘ THEO THỂ LOẠI — file PHẦN của `StickmanActionSetBuilder`

Hai thể loại đã có bộ động tác riêng, và cả hai theo đúng luật «thêm STYLE, đừng thêm LOẠI»:

| Bộ | File | Gồm |
|---|---|---|
| **VÕ LÂM** | `Assets/Editor/Rig/StickmanActionSetBuilder.Wuxia.cs` | 4 bài quyền môn phái (`Kata`) · 3 dáng ra chiêu (`AttackBody`) · vận công (`Idle/qi`) · khinh công (`Jump`/`Fall`) |
| **TAM QUỐC** | `Assets/Editor/Rig/StickmanActionSetBuilder.ThreeKingdoms.cs` | 8 dáng tuyệt kỹ danh tướng (`AttackBody/tk_*`) · 3 dáng lễ nghi đơn đấu (`Cheer/tk_challenge`·`tk_salute`·`tk_triumph`) · `Idle/tk_banner` · `Work/tk_drum` |

⚠ **MỌI CLIP TRONG HAI BỘ NÀY `weight = 0`** — chúng chỉ ra khi có ai gọi ĐÍCH DANH. Để > 0 là
lính Trung cổ thỉnh thoảng giương Thanh Long đao, hoặc zombie đứng ôm quyền bái nhau.

⚠ **Tên style là HỢP ĐỒNG với module Gameplay.** Sai một chữ thì `Pick` không tìm thấy và rơi về
dáng ngẫu nhiên cùng loại — chiêu vẫn ra, chỉ là sai dáng, **không lỗi nào báo**. Doctor có phép đo
«Tam Quốc: động tác đã bake chưa» rút tên style THẲNG từ builder rồi soi asset đã bake.

⚠ **HAI FILE NÀY LÀ `extraSources` của job «Dựng 4 bộ động tác»** — nguồn suy ra từ tên tool không
tự bắt file phần, nên thiếu khai là sửa một bài quyền / một tuyệt kỹ xong bảng vẫn XANH.
Chi tiết Tam Quốc: `Docs/AgentRules/ThreeKingdoms.md` mục 11g.
