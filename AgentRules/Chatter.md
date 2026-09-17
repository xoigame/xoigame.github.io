## ⚠⚠ BONG BÓNG THOẠI — AI HÔ HÀO THEO NGỮ CẢNH (tiếng Anh + giọng)

Kho câu: `Assets/Scripts/Units/BattleLines.cs` (+ `.Fantasy.cs` · `.More.cs`).
Vẽ + chống spam: `Assets/Scripts/Gameplay/Shell/BattleChatter.cs`.
Nguồn sự kiện: `BattleChatterDirector.cs` · gắn bù `BattleChatterBootstrap.cs`.
Giọng: `Assets/Editor/Audio/StickmanAudioSynth.Voice.cs` (khoá `Voice/<Slot>`).
Bản xem trước: `.claude/skills/stickman-assets/scripts/chatter_preview.py` · `voice_preview.py`.

User (2026-09-09): *"thêm hệ thống balloon hiện text AI hô hào, tham khảo bên dựng film… AI ngẫu
nhiên hô hào, nói chuyện theo ngữ cảnh trong game bằng tiếng anh… có thêm voice càng tốt, nhưng
đừng spam quá nhiều chỉ 1, 2 nhân vật nói khi có 1 sự kiện nào đó… tạo thật nhiều mẫu câu"*.

### 1. MỘT KHO CÂU, HAI NGƯỜI DÙNG

**572 câu tiếng Anh · 20 tình huống × 4 thể loại (đủ 80/80 ô).** `BattleLines` đặt ở **`Units` (3)** vì
`GameGenre` khai ở đó: Core (0) không thấy enum, Map (6) thì Gameplay (4) không với tới. Units là
module THẤP NHẤT nhìn thấy nó, nên trận đánh (Gameplay), phim (Map) và xưởng (Editor) dùng CHUNG.

⚠⚠ **TRƯỚC BẢN NÀY CÓ HAI KHO, VÀ CHÚNG KHÁC NGÔN NGỮ.** Phim đọc `CinematicLines` (tiếng Việt);
trong trận thì **không có gì cả**. Cùng một đội quân nói hai thứ tiếng — lộ ra ngay khi quay phim
từ chính ván đang chơi. Nay `CinematicLines` chỉ còn là **bộ ánh xạ 8 ô** sang `BattleLines`,
không giữ câu nào. Mọi template phim đi qua `CinematicLines.Pick` nên đó là chỗ khớp duy nhất —
không template nào phải sửa.

⚠ **`rng == null` Ở PHIM PHẢI TẤT ĐỊNH.** `BattleLines.Pick` mặc định dùng `UnityEngine.Random`
(đúng cho trận đánh). Phim dựng lại từ cùng seed phải ra cùng lời, nên `CinematicLines.Pick` tự
tạo `System.Random` có hạt cố định theo ô thay vì để rơi vào random toàn cục.

⚠ **CÂU ≤ 42 KÝ TỰ.** Dài hơn thì bong bóng che mất người bên cạnh và người chơi không đọc kịp
trước khi nó tắt. Câu dài để dành cho phim (`CinematicSpeech` có khung 9:16 và thời gian đọc riêng).

⚠ **THIẾU Ô THÌ LÙI VỀ `Medieval`**, không trả rỗng — một bong bóng câm hiện lên rồi tắt nhìn ra
là lỗi đồ hoạ. (Đợt hai đã lấp đủ 80/80 ô, nhưng luật lùi vẫn giữ cho ô thêm sau này.)

⚠⚠ **ĐỢT MỞ RỘNG DÙNG `More`, KHÔNG DÙNG `Add`** (`BattleLines.More.cs`). `Add` **ghi đè cả
mảng**, nên một đợt mở rộng gọi `Add` là xoá sạch đợt trước: kho tưởng dày lên mà vừa mất một
nửa, và **không có gì báo** — bốc câu vẫn chạy, chỉ ít lựa chọn hơn. Đúng thứ phép đo «ô dưới 4
câu» sinh ra để bắt. *(Chính script đếm của tôi đã dính bản sao của lỗi này: nó gộp một lượt theo
thứ tự glob nên `BattleLines.cs` xử lý SAU `.More.cs` và ghi đè phần nối — báo 403 câu trong khi
thật ra là 572. Dụng cụ đo nói dối theo hướng dễ chịu.)*

### 2. CHỐNG SPAM LÀ TÍNH NĂNG CHÍNH, KHÔNG PHẢI PHẦN PHỤ

Trận 60 người mà ai cũng hô thì màn hình thành một trang chữ bay và **không câu nào được đọc** —
thêm chữ vào lại làm mất chữ. Bốn cái van, thiếu cái nào cũng hỏng:

| Van | Số | Chặn cái gì |
|---|---|---|
| `GlobalGap` | 2.6 s | hai sự kiện dồn nhau (một loạt tên trúng bốn người) |
| `SlotGap` | 9 s | cùng một câu lặp — "Target down" mỗi ba giây là tiếng ồn |
| `SpeakerGap` | 14 s | một anh lắm mồm nói cả trận |
| `Capacity` | 2 | trần CỨNG: không bao giờ có bong bóng thứ ba |

⚠⚠ **MỖI SỰ KIỆN CHỈ 1 NGƯỜI NÓI**, và 28 % số lần mới có người thứ hai **đáp lời sau 0.9 s**.
Đáp ngay là hai người cùng hét, không ra đối đáp. Đây là đúng chữ người dùng đặt.

⚠ **CHỈ HIỆN TRONG BÁN KÍNH 16** quanh người chơi (không có người chơi thì quanh camera). Bỏ qua
người đang trốn trong nhà (`BuildingInterior.Hidden`) — họ đã bị tắt renderer, bong bóng sẽ nổi
trên một chỗ trống.

⚠ Sổ "người này im tới lúc nào" khoá theo `GetEntityId` **trong chính `BattleChatter`**, cố ý
KHÔNG thêm field vào `TeamMember`: đó là component nằm trên mọi nhân vật của mọi scene đã bake.
(Unity 6000.5 bỏ `GetInstanceID` — dùng `GetEntityId`.)

### 3. VẼ — MƯỢN CÁI NHÌN CỦA PHIM, KHÔNG MƯỢN CÁI KHUNG

Hình dáng (viền theo màu phe · đuôi ba bậc chỉ xuống đầu · chữ hiện dần · bóng đổ) sao chép
`CinematicSpeech`. Nhưng **phép đo thì ngược**: phim tự đo theo `Screen.height` vì không ai bấm
vào video, còn trong trận mọi thứ phải qua `StickmanUI.Begin()` cho đúng cỡ điện thoại (luật «một
bộ da cho 41 HUD»). Chép cả phần đo là bong bóng to bằng nửa màn hình.

⚠⚠ **BA HỆ TOẠ ĐỘ** (bẫy quen của `StickmanPromptArbiter.Place`): `WorldToScreenPoint` trả pixel
THẬT đếm từ DƯỚI lên; khung GUI đã co giãn và đếm y TỪ TRÊN xuống. Quy đổi một lần bằng
`StickmanUI.FromScreen`.

⚠ **ĐO HỘP BẰNG CÂU ĐẦY ĐỦ**, không phải phần đã hiện — không thì hộp lớn dần theo từng chữ và
nhìn ra là nó đang "thở".

⚠⚠ **GỐC TRANSFORM NẰM THẤP HƠN BÀN CHÂN — ĐÃ DÍNH (2026-09-09).** Người dùng báo: *"nó đang
nằm ngang đầu, nhích lên trên đầu 1 xíu"*, kèm ảnh bong bóng cắt ngang cái đầu. Nguyên nhân: tôi
lấy `2.92 × lossyScale.y` (= `StickmanAgent.BodyHeight`) rồi coi đó là khoảng cách từ GỐC lên
đỉnh đầu — nhưng `BodyHeight` đo từ **bàn chân**, mà bàn chân lại cao hơn gốc đúng
`StickmanLocomotion.GroundOffset` (đáy collider trừ gốc, đo từ collider chứ không gõ số). Đúng
công thức: **`GroundOffset + BodyHeight + 0.3` chừa đầu**, và nới trần kẹp 2.2 → 3.4 vì với nhân
vật to (boss, kỵ sĩ) cái trần cũ cắt thêm một nhát nữa.
⚠ Đo MỘT LẦN lúc đẩy bong bóng rồi cache (`Bubble.headTop`) — `GetComponent` mỗi frame cho một
tính năng trang trí là lãng phí, mà chiều cao không đổi giữa câu.
⚠ `CinematicSpeech.HeadTopOf` **vẫn còn công thức cũ** (thiếu `GroundOffset`) — bong bóng phim bị
kẹp vào vùng an toàn nên ít lộ, nhưng đó là cùng một lỗi. Sửa thì sửa cả hai.

### 3b. ĐỘNG TÁC ĐI KÈM LỜI

User: *"kết hợp với animation"*.

⚠⚠ **KHÔNG THÊM LOẠI ĐỘNG TÁC MỚI.** `StickmanActionType.Cheer` đã là "giơ vũ khí lên hét" và có
sẵn bốn style: mặc định (hô xung trận) · `MockStyle` vẫy gọi · `PointStyle` chỉ mặt · `BangStyle`
đập khiên. Thêm một `ActionType` mới là phải nhớ khai `IsAmbientClip` (quên là nhân vật **kẹt
cứng** ở tư thế đó tới lúc chết), lo `Play`/`Pick`, lo độ ưu tiên — cảnh báo ghi ngay trong
`StickmanBodyAnimator`.

| Ô | Động tác |
|---|---|
| `Charge` · `Rally` · `Victory` | `Cheer` mặc định — hất tay ra sau rồi giơ vũ khí |
| `Taunt` | bốc một trong `MockStyles` (khỏi cả tiểu đội chọc giống nhau) |
| `Contact` · `Flank` · `AllyDown` · `BossAppears` · `WaveIncoming` | `PointStyle` — chỉ vào chỗ có chuyện |
| còn lại | KHÔNG có động tác |

⚠⚠ **KHÔNG PHẢI CÂU NÀO CŨNG KHOA TAY, VÀ ĐÓ LÀ CHỦ Ý.** `Cheer` ưu tiên **cao hơn cả trúng
đòn**, nên gọi nó giữa lúc đang chém là **cắt ngang cú chém** — lính vừa vung kiếm bỗng đứng khoa
tay, người chơi đọc ra là "AI bị đơ". Nên chỉ những ô nói LÚC RẢNH mới có động tác, **và** vẫn bỏ
qua nếu người đó đang ra đòn (`StickmanProceduralAnimator.IsAttacking`). Mấy ô còn lại (trúng
đòn, sắp chết, hết đạn) chỉ có bong bóng — mà đó cũng là lúc người ta không rảnh để khoa tay.

### 4. NGUỒN SỰ KIỆN — HAI ĐƯỜNG, CẦN CẢ HAI

**Sự kiện thật** (`TeamMember.AnyDied`): chính xác, biết ai giết ai. Kẻ giết nói `Kill`, đồng đội
người ngã nói `AllyDown`. ⚠ Trộn hai vế là lính **reo hò khi đồng đội mình chết**. ⚠ Bốc xúc xắc
60/40 nghiêng về `AllyDown`: không chọn trước thì `Kill` luôn thắng (gọi trước) và `AllyDown` gần
như không bao giờ nghe thấy.

**Quan sát trạng thái** (`Sweep`, 1.3 s/lượt): `Contact` · `LowHealth` · `Idle` — ba thứ KHÔNG
phát ra event nào; đợi event là chúng không bao giờ được nói tới. ⚠ Quét chậm và chỉ quanh người
xem: `TeamMember.All` có thể 200 người, quét mỗi frame cho một tính năng trang trí là lấy khung
hình của trận đánh đổi lấy chữ. ⚠ Cờ `_sawEnemy` chỉ hạ khi hai bên rời nhau — thiếu nó thì mỗi
lượt quét lại là một lần "chạm mặt" và câu mở màn kêu mãi suốt trận.

⚠ **KHÔNG chống spam ở director.** Mọi đường đi qua `BattleChatter.Event`, nơi có đủ bốn van.
Hai bộ luật cho cùng một việc thì khi lính im bặt không ai biết cái nào đang bịt miệng.

**Chưa nối**: `Breach` · `Capture` · `WaveIncoming` · `BossAppears` · `Victory` · `Defeat` ·
`Retreat` · `Rally` · `Reload` · `Flank` · `Hurt` · `Taunt` · `Hide` · `Heal` có câu và có giọng
nhưng **chưa có chỗ gọi** — thêm một dòng `BattleChatter.Event(Slot.X, pos, team)` ở nơi sự kiện
đó xảy ra là xong, không cần đụng gì khác.

### 5. GIỌNG — VÀ NÓ KHÔNG PHẢI TIẾNG ANH

⚠⚠ **`Voice/*` LÀ TIẾNG HÔ CÓ NGỮ ĐIỆU, KHÔNG PHẢI GIỌNG ĐỌC.** Dự án không có bộ đọc chữ (TTS).
Cái sinh ra là chuỗi âm tiết bằng formant nguyên âm, đường cao độ đi LÊN khi báo động và đi XUỐNG
khi tuyên bố (`VoiceMood`: Flat · Shout · Alarm · Pain · Soft). Tai nghe ra *"có người đang hét
gì đó, giọng gấp"* — đủ để đi kèm chữ, **không đủ để thay chữ**. Đừng mô tả nó như giọng đọc.

20 khoá × **6 biến thể = 120 wav**: ba giọng NAM + ba giọng NỮ (bảng `Pitches` = 112 · 132 · 152
· 178 · 205 · 232 Hz). ⚠ Biến thể phải đổi **cao độ**, không chỉ đổi hạt nhiễu — cùng cao độ thì
sáu biến thể vẫn nghe ra MỘT người nói sáu lần, và một đạo quân toàn giọng nam trầm nghe ra dàn
đồng ca chứ không ra đám đông. Đo bằng tự tương quan trên bản mô phỏng: sáu biến thể ra
127 · 150 · 181 · 207 · 246 · 269 Hz (cao hơn bảng ~14 % vì đường ngữ điệu `Shout` bắt đầu ở
1.12) — tức chúng **thật sự tách ra**, không phải chỉ khai ra rồi tin.

⚠ Bong bóng chữ **không phụ thuộc** vào tiếng: `PlayKey` im lặng bỏ qua khoá thiếu. Gỡ hết wav
thì phần chữ vẫn chạy nguyên vẹn.
⚠ Muốn giọng THẬT thì đặt ngoài (`Docs/KnowledgeBase/Audio.md`) rồi thả file trùng tên khoá vào
`Assets/Sounds/SFX/Voice/`. Tool `overwrite: false` nên không bao giờ đè bản thu thật.

⚠⚠ **AI KHÔNG NGHE ĐƯỢC.** Không được viết xong rồi tuyên bố "giọng nghe rất đã". Vòng kiểm:
`voice_preview.py` đo (dài · đỉnh dBFS · rms) → vẽ dạng sóng → **đưa wav cho người dùng nghe**.
⚠ Bản mô phỏng phải là BẢN SAO công thức, không phải "một cách làm tương đương": lần đầu tôi gõ
`Resonator` theo sách giáo khoa và nó đo một thứ khác hẳn với C#.

### 6. Phép đo và chạy lại

Doctor «Lời thoại — kho câu và khoá giọng» đo ba vế, cả ba đều hỏng trong im lặng: ô thiếu câu
(lùi về Medieval, không ai biết) · ô **dưới 4 câu** (nghe lại lần thứ ba trong cùng trận) · khoá
`Voice/<ô>` lệch tên (bong bóng hiện nhưng CÂM).

Sinh giọng: «Tools > Stickman > Nâng cao > Audio > 5. Sinh tiếng BÙ cho khoá còn câm».
