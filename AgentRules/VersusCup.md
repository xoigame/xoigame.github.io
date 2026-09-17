## ⚠⚠ ĐỐI KHÁNG TRANH CÚP — `MissionType.ChampionshipCup` (2026-09-09)

User: *"thêm giúp tôi chế độ game đối kháng cho trung cổ, đánh giành cup vô địch, cho 2 loại view luôn"*

Tám võ sĩ · sơ đồ loại trực tiếp · mỗi trận ba hiệp · thắng tới cuối là nâng cúp.
Chạy ở **cả hai kiểu nhìn** (`ViewPlane.Side` và `ViewPlane.Ground`).

| Mảnh | File | Nó gánh cái gì |
|---|---|---|
| **Hạ đo ván** | `StickmanKnockout` (Combat) | Đòn chí mạng → quật ngã, KHÔNG chết. Cửa mở/đóng bằng `Arm` |
| **Trọng tài trận** | `ChampionshipCupMode` (Gameplay) | Bốn pha: giới thiệu → đánh → nghỉ hiệp → nghỉ trận |
| **Ban tổ chức** | `ChampionshipCupMode.Bracket.cs` | Hạt giống · mô phỏng nhánh bên kia · sổ kỷ lục (`SaveBag "cup.bestRound"`) |
| **Bảng máu** | `ChampionshipCupHud` | Hai thanh máu đối xứng · đèn hiệp · đồng hồ hiệp · **sơ đồ nhánh** ở nhịp nghỉ |
| **Đồ đạc** | `MapChampionshipCup` + `MapAssembler.BuildChampionshipCup` | Tâm đài · hai góc · ghế ngoài đài · bảy đấu thủ máy |
| **Máy quay** | `VersusCamera` (Gameplay) | Khung bám TRUNG ĐIỂM hai võ sĩ + lùi vừa đủ để chứa cả hai |
| **Vòng dây** | `ChampionshipCupMode.Ring.cs` | Kẹp hai người trong sàn đấu suốt hiệp (`RingHalf`) |
| **Lời hô** | `ChampionshipCupMode.Callout.cs` + HUD | "ĐÁNH!" · "HẠ ĐO VÁN!" · "VÔ ĐỊCH" — chữ lớn GIỮA màn hình |
| **Điều khiển võ sĩ** | `ChampionshipCupMode.Fighters.cs` | Dựng lại mỗi hiệp · mở/đóng cửa KO · lên đài / về ghế |
| **Phép đo** | `StickmanDoctor.Cup.cs` | Bốn cái bẫy của asset map + **khung hình có chứa nổi cả hai không** |

### 0. ⚠⚠ ĐỐI KHÁNG = HAI NGƯỜI TRONG **MỘT KHUNG HÌNH** (2026-09-14)

User: *"đối kháng là 2 nhân vật đấu với nhau, giống mấy game đối kháng đó"*

Bản 2026-09-09 có đủ trọng tài, đủ hiệp, đủ bảng máu — và **chơi ra không giống game đối kháng**.
Lý do là một phép cộng hai con số nằm ở hai tầng khác nhau:

| Đo cái gì | Ở đâu | Bao nhiêu |
|---|---|---|
| Bề ngang khung hình, 16:9 | `StickmanCameraZoom.DesignViewHeight` = 5 | **8.9 unit** (nửa: 4.44) |
| Hai góc đài cách nhau | `MapAssembler.CupCornerReach` = 3.4 | **6.8 unit** |
| Camera bám ai | `DemoCameraFollow` | **một người** |

⇒ Đối thủ đứng cách tâm màn hình 6.8 > 4.44: **nằm NGOÀI mép màn hình ngay khung hình đầu tiên
của mọi hiệp đấu.** Người chơi chạy về phía một cái tên trên thanh máu, gặp nhau, đánh, rồi lại
mất dấu. Đó là một trận đuổi bắt, không phải một trận đối kháng.

⚠⚠ **KHÔNG CÓ MỘT DÒNG CODE NÀO SAI ĐỂ MÀ TÌM.** Trọng tài chấm đúng, HUD vẽ đúng, map đặt đúng,
camera bám đúng người nó được giao. Tệ hơn: chú thích trong `MapBlueprint` và `MapAssembler.Cup`
đều ghi *"cả hai võ sĩ phải nằm gọn trong một khung hình"* — một câu **chưa bao giờ đúng**, và vì
nó nằm trong chú thích nên mọi lượt sửa sau đều tin nó. Còn `StickmanDoctor` thì canh
`halfWidth ≤ 22` vì cùng niềm tin ấy: một phép đo hiệu chuẩn trên một con số không có thật.

#### Chữa bằng ba mảnh, không mảnh nào giành quyền của mảnh khác

1. **`VersusCamera`** — mốc rỗng đặt ở TRUNG ĐIỂM hai võ sĩ, giao cho `DemoCameraFollow.SetTarget`
   (nên phần mượt · trần trễ · kẹp mép map vẫn là của camera cũ), cộng một yêu cầu khung mỗi
   frame qua `StickmanCameraZoom.RequestFit`. Chạy ở `Update` — `DemoCameraFollow` đọc ở
   `LateUpdate`, nên thứ tự do Unity bảo đảm chứ không do `[DefaultExecutionOrder]` ai đó sửa được.
2. **`StickmanCameraZoom.RequestFit(rộng, cao)`** — sàn cỡ nhìn sống **đúng một frame**. Hết trận
   là không ai đặt nữa và cỡ nhìn tự về chuẩn: không có cái cờ nào để quên tắt. Kẹp ở `MaxZoom`
   để khung không nở vô hạn.
3. **`ChampionshipCupMode.RingHalf` = 7** — vòng dây. Máy quay có TRẦN lùi, nên quá ~22 unit là
   nó hết đường; mà một hiệp hết giờ chấm bằng phần trăm máu nên *"đang dẫn thì chạy"* là lối
   chơi CÓ LỢI. Kẹp toạ độ X (không dựng collider — sân mặt đất cố ý không chặn bằng collider,
   xem `WorldPlane.md`), và chỉ kẹp ở pha GIỚI THIỆU + pha ĐÁNH: hết hiệp là hai người được dời
   ra ghế, mà ghế nằm ngoài vòng dây.

Đo được, ở mọi tỉ lệ màn hình (cỡ nhìn · phần trăm chiều cao màn hình mà một thân người chiếm):

| Tỉ lệ | Trần lùi | Đầu hiệp (cách 6.8) | Hai mép đài (cách 14) |
|---|---|---|---|
| 4:3 | 7.25 | 3.90 → người cao 11.9% | 6.60 → 7.0% |
| 16:9 | 7.25 | 2.93 → **15.9%** | 4.95 → 9.4% |
| 21:9 | 7.25 | 2.50 → 18.6% | 3.77 → 12.3% |

⚠ **Phép đo mới: `StickmanDoctor` › «Máy quay đối kháng».** Nó so THẲNG ba hằng số công khai
(`DesignViewHeight` · `MaxZoom` · `RingHalf` + `CupCornerReach` + `SidePad`) ở bốn tỉ lệ màn
hình, và bắt đầu từ tỉ lệ HẸP NHẤT — vì cỡ nhìn neo theo CHIỀU CAO nên màn càng hẹp càng thấy ít
bề ngang, tức **lỗi luôn lộ ở 4:3 trước và máy dev 16:9 chạy cả ngày không thấy gì**. Nới
`RingHalf`, hạ `MaxZoom` hay nâng `DesignViewHeight` đều phải chạy lại phép đo này.

#### Và một nửa nữa của "giống game đối kháng": LỜI HÔ

`MatchModeBase.Announce` vẽ ra hộp **520×30 sát mép trên** — đúng chỗ để kể diễn biến một trận
đánh lớn, và đúng chỗ mắt người chơi KHÔNG ở trong một trận đối kháng (mắt dán vào giữa màn hình,
chỗ hai người đang đứng). Hệ quả không phải mất một chi tiết: lỡ chữ "ĐÁNH!" là **không biết hiệp
đã bắt đầu**, tức đứng im nửa giây đầu mỗi hiệp — đúng nửa giây quyết định ai chạm đòn trước.

`ChampionshipCupMode.Callout.cs` giữ CHỮ (mode), `ChampionshipCupHud.DrawCallout` giữ MÀU và CỠ
(HUD) — cùng ranh giới mà bảng máu đã theo. Bung 1.35× → 1× rồi mờ dần; **không `ClaimPanel`**,
vì chữ nằm ngay giữa sân chỗ người chơi bấm để ra đòn, khai chiếm chỗ là nuốt mất đúng cú chạm
đầu hiệp — nó sẽ gây ra chính cái nó sinh ra để chữa.

### 1. Vì sao là kiểu chơi RIÊNG, không phải `ChampionDuel` có thêm mấy hiệp

Dự án đã có ba cuộc đấu tay đôi: `ChampionDuel` (đấu tướng trước trận), `MapDuelRing` (bản hệ
map của nó), `WuxiaTournamentMode` (thủ đài Hoa Sơn). Cả ba đều **ĐẤU TỚI CHẾT, đúng một lần**,
và người thua biến khỏi ván. Đó là luật của một trận địa, không phải của một môn thể thao.

Đối kháng đảo đúng vế ấy: **kết thúc một hiệp phải ĐẢO NGƯỢC ĐƯỢC.** Người thua hiệp 1 còn phải
đứng dậy đánh hiệp 2. Hệ quả không phải một cái cờ mà là cả một cơ chế mới, và ba thứ nữa:

- **Đồng hồ đổi vai.** Ở mọi mode khác, hết giờ là kết cục PHỤ. Ở đây nó là kết cục THƯỜNG GẶP
  NHẤT của một hiệp, và chấm bằng **phần trăm máu** — tức người chơi có một lựa chọn mà không
  mode nào khác cho: *"đang dẫn máu thì lùi ra giữ, hay vào ăn nốt?"*
- **Thua không phải là chết**, nên nhịp dò đòn · nhấp nhả · phản đòn của [DuelCombat](DuelCombat.md)
  mới có giá: nhử hụt ở hiệp 1 thì hiệp 2 đánh lại.
- **Có đường đi.** Ba trận nặng dần theo hạt giống ⇒ độ khó là một ĐƯỜNG CONG, không phải một núm.

### 2. Hạ đo ván nằm TRƯỚC cái chết, và ĐƯỢC HỎI TRƯỚC `StickmanDowned`

`StickmanController.TakeDamage` hỏi `StickmanKnockout.TryKnockOut` **trước** `StickmanDowned`.
Máu giữ ở một tia, võ sĩ bị quật ngã bằng `StickmanStatus.TryKnockdown` (`IsIncapacitated` khoá
cả AI lẫn tầng đọc input). Không một dòng nào của flow chết bị đụng tới.

⚠⚠ **Thứ tự ấy là một luật.** Hai hệ trả lời cùng câu hỏi *"đòn này có thành cái chết không?"*
nhưng thuộc hai kiểu chơi khác nhau. Hỏi `StickmanDowned` trước thì trên võ đài võ sĩ nằm đếm
ngược chờ một đồng đội **không tồn tại**, rồi CHẾT THẬT giữa hiệp 1 — trận ba hiệp kết thúc ở
hiệp một và không lỗi nào báo.

⚠ **Hai thứ sẵn có đều không dùng lại được, và lý do đáng nhớ.** Sinh lại thân mới mỗi hiệp
(luật *"sinh người mới, không dựng xác dậy"*) buộc phải chép đúng nhân dạng võ sĩ — nền văn
minh, nón/giáp, cây vũ khí, cấp AI, `PlayerCharacter`, camera — sáu lần một trận. `StickmanDowned`
thì sai nghĩa cả ba vế: nó đếm ngược để chết thật, cần đồng đội tới đỡ, và tính suất cứu.

⚠ **Đóng cửa KO ngay khi hiệp kết thúc** (`EndBout`). Không đóng thì cú đánh cuối còn đang bay
hạ nốt người kia lúc cả hai đang đi về góc — bảng hiệp cộng thêm một điểm cho một hiệp chưa hề
được đánh.

⚠ **`IsDown` phải hỏi cả `IsDie`.** `StickmanKnockout` chỉ chặn được đòn đi qua `TakeDamage`;
rơi khỏi đài hay một hệ nào đó gọi thẳng `Die()` thì cờ KO vẫn false, và hiệp chạy tới hết giờ
với một cái xác nằm giữa đài — cái xác ấy còn "thắng hiệp" nếu nó tình cờ nhiều máu hơn.

⚠ **`ResetForRound` phải `ClearAll`**, không chỉ gỡ `Knockdown`: cú KO thường tới sau một chuỗi
đòn nên võ sĩ hay bước vào hiệp sau còn dư cháy/độc/chảy máu — hiệp 2 mở màn đã mất máu dần
trong khi bảng máu hiện 100%.

### 2b. ⚠⚠ NGỒI NGOÀI = TẮT HẲN `StickmanAgent`, không phải "ra lệnh đứng yên"

**Lỗi đã đo được, không phải đề phòng.** Bản đầu cho sáu võ sĩ chờ lượt nhận `GuardTarget` vào
ghế và nhắc lại mỗi 2 giây. Nghe thì đủ — nhưng `AIStateGuard` **xông ra** đánh bất cứ địch nào
lọt vào `AIProfile.guardEngageRange` **quanh chỗ gác** (mặc định **6**), mà ghế gần nhất cách
tâm đài 7.5 còn góc đài chỉ cách tâm 3.4 ⇒ người chơi đứng ở góc chỉ cách ghế **4.1 đơn vị**.

Sáu võ sĩ đang chờ sẽ lần lượt nhảy vào giữa hiệp, và **lệnh nhắc ghế không cứu được**: xông ra
đánh nằm BÊN TRONG hành vi `GuardTarget`, còn `SetBehavior` thì cố ý không reset gì khi lệnh
trùng lệnh cũ. Trận vẫn chạy, vẫn có người thắng, không lỗi nào báo — chỉ là kiểu chơi 1 chọi 1
lặng lẽ thành hỗn chiến 7 người.

⚠ **Nới ghế ra xa KHÔNG chữa được.** Cần > 6 + 3.4 = 9.4, mà nửa map của kiểu chơi này bị kẹp
≤ 22 (preset dùng 16), nên tám cái ghế tràn khỏi mép sân rồi bị `SafeX` dồn về đúng một điểm —
đổi một lỗi im lặng lấy một lỗi im lặng khác (xem `MapSystem.md`, `MapScenery.Line`).

`ChampionshipCupMode.SetBenched` tắt `StickmanAgent` — cách duy nhất không phụ thuộc con số
trong `AIProfile` hay bề rộng map, và là khuôn có sẵn của dự án (`Hostage`, `Parachute`,
`FantasyAirRaider`, `Vehicle.Crew` đều tắt agent bằng tay). An toàn với sổ tra agent vì sổ ấy
ghi ở `Awake`/`OnDestroy` chứ không phải `OnEnable`.

⚠ **Thứ tự bắt buộc:** lên đài thì BẬT agent rồi mới ra lệnh (`SetAgent` bỏ qua agent đang tắt
⇒ đảo thứ tự là hai võ sĩ đứng như tượng suốt hiệp); rời đài thì DỜI VỀ GHẾ rồi mới tắt (tắt
trước là đông cứng ngay giữa đài).

⚠ **Võ sĩ ngồi ngoài KHÔNG được `Arm` cửa KO**, nên họ vẫn chết thật nếu ăn đòn lạc. Vì thế
`Simulate` cho người đã ngã luôn thua trận mô phỏng — một cái xác "thắng" rồi bước vào trận sau
là mọi hiệp còn lại kết thúc ở khung hình đầu.

### 3. Sơ đồ nhánh, và vì sao ở đây nó đúng còn ở Võ lâm thì không

`WuxiaTournamentMode` **cố ý** chọn thủ đài vì sáu môn phái không phải luỹ thừa của hai ⇒ phải
có suất miễn đấu, thứ người xem không đọc ra được trên sân. Lý do ấy không áp vào đây: số võ sĩ
do map đặt, và `TrimToPowerOfTwo` cắt phần thừa ngay lúc mở giải. Đổi lại, sơ đồ nhánh cho thứ
mà thủ đài không có — **hạt giống**.

⚠ **Người chơi luôn là hạt giống 1** (`ComposeRoster`), và map phát đấu thủ máy theo sức mạnh
**giảm dần** (`BuildChampionshipCup`). Bảng hạt giống chuẩn (1–8, 4–5, 2–7, 3–6) khi đó cho
người chơi gặp kẻ yếu nhất ở vòng đầu và kẻ mạnh nhất ở chung kết. Thả người chơi vào một ô bất
kỳ, hoặc phát đều tay cho bảy đấu thủ, là ba vòng đấu thành ba lần tung đồng xu.

⚠ **BA trục cùng lên theo hạt giống: máu · cấp AI · CẤP RÈN vũ khí.** Dày máu thêm mà vẫn đánh
như tân binh thì chung kết chỉ LÂU hơn chứ không KHÓ hơn. Trục thứ ba tồn tại để **dập một chỗ
nhiễu có thật**: mỗi nền văn minh mang một cây vũ khí khác nhau (đo được — bảy `Loadout_*_Melee`
khai bảy chỉ số khác nhau, và đó là chủ ý: bảy đối thủ phải đánh khác nhau), nhưng nền được bốc
theo con trỏ đi vòng **độc lập với hạt giống**. Gặp hôm hạt giống cuối bốc trúng búa tạ còn hạt
giống nhì bốc trúng dao găm thì tứ kết nặng hơn chung kết — đúng cái *"ba lần tung đồng xu"* mà
bảng hạt giống sinh ra để tránh. `GearTiers` là trục đúng để chữa: nó không đụng tới LOẠI vũ khí
nên giữ nguyên phần biến hoá, và cấp cao đổi cả chất liệu lẫn kiểu rèn của hình nên người chơi
NHÌN cây vũ khí là biết mình đang gặp ai.

Đo bằng `Docs/Tools/sim_cup_bracket.py` (giải 8 người): máu 11.2 → 16.3 → 18.9, cấp AI 1 → 4 → 5,
cấp rèn 0 → 3 → 4.

⚠⚠ **Ghép người chơi vào bảng đấu lúc `Start`, KHÔNG lúc map dựng.** `MapAssembler` dựng nhiệm
vụ ở pha 6 còn `SpawnPlayer` chạy pha 10 — lúc `BuildChampionshipCup` chạy thì **trên sân chưa
có người chơi**. Map tự nhét người chơi vào bảng là nhét một tham chiếu null, và triệu chứng
không phải một `NullReferenceException` mà là *"giải đấu bỏ qua trận của tôi"*. Đó là lý do
`MapChampionshipCup` tồn tại: pha 6 nhét đồ vào túi, pha 11 (`CreateDirector`) mới gắn trọng tài.

⚠ **Nhánh bên kia được MÔ PHỎNG, không đánh thật** (`Simulate`). Cho bảy võ sĩ máy lần lượt lên
đài là người chơi ngồi xem ba trận không có mình trước mỗi trận có mình. Sức mạnh đo từ số THẬT
của võ sĩ (`MaxHealth` × cấp AI) chứ không phải một bảng gõ tay — gõ tay là bảng đấu nói một
đằng, trận thật một nẻo. Có nhiễu ±30% để hạt giống thấp vẫn lật được kèo, và **người đã ngã thì
luôn thua** (xem §2b).

### 3b. ⚠⚠ Người chơi ĐỔI THÂN thì bảng đấu phải trỏ theo

`RespawnDirector`/`PlayerRespawn` **huỷ cái xác rồi dựng thân mới**, nên ô hạt giống 1 giữ một
tham chiếu đã chết. `IsDown` coi tham chiếu rỗng là *"đã ngã"* ⇒ mọi hiệp còn lại kết thúc ngay
khung hình đầu ⇒ người chơi **thua 0–2 mà chưa đánh nhát nào**, không lỗi nào báo.

`ChampionshipCupMode` nghe `PlayerCharacter.Changed`, thay tham chiếu, **gắn lại `StickmanKnockout`
cho thân mới** (thân sinh từ prefab nên không có sẵn) và mở lại cửa KO nếu đang giữa hiệp. Cùng
họ với camera / HUD / ô nhặt đồ: mọi thứ trỏ vào người chơi đều phải nghe sự kiện này (khuôn của
`ArenaMode.OnPlayerChanged`).

### 4. Vạch đích: `MatchRules.DefaultFor` trả về danh sách RỖNG

Cùng khuôn `MissionType.OpenWorldCity`. Trọng tài rời là chủ duy nhất của ván.

⚠⚠ **Đừng "chữa" bằng cách thêm `Wipe` cho đỡ trống.** Cả tám võ sĩ đứng trên sân suốt giải và
**không ai chết**, nên mọi vạch đích đếm đầu người vừa không bao giờ đạt được, vừa (nếu một võ
sĩ chết thật vì lý do khác) cướp mất quyền tuyên bố của trọng tài thật.

⚠ Cùng lý do: **không bật `RespawnDirector`** và **không đặt `attachMode`** cho map kiểu này.

### 5. Võ đài phải TRỐNG — bốn cách trốn là bốn cách hỏng luật hiệp

Hiệp hết giờ chấm bằng phần trăm máu ⇒ **bất cứ thứ gì cho người ta trốn được đều biến thành
"ai đang dẫn thì bỏ chạy là thắng"**. Nên bục · thang · vực · ụ che đều bị ép về 0 ở **ba** chỗ
(`MapBlueprint.For` · `MapBlueprint.Validate` · `MapGenerator.Sanitize`), và `StickmanDoctor.Cup.cs`
đo lại trên asset thật vì asset còn ba đường vào khác không qua `MapGenerator`.

⚠ **Nửa rộng ≤ 22** (preset `Med_Cup` dùng 16): hai võ sĩ ra khỏi khung hình thì hai thanh máu
ở đầu màn hình đang tả một trận người chơi không nhìn thấy.

⚠ **Hai đạo quân bị xoá SẠCH ở `MapBlueprint.Apply`, không phải bằng `armySize = (0,0)`.**
`Resize` kẹp sàn ở MỘT người (`Mathf.Max(1, …)`) nên khai 0 vẫn ra một lính mỗi phe — và anh
lính phe đỏ ấy lao vào đánh người chơi giữa hiệp. Tám võ sĩ do nhiệm vụ sinh riêng.

⚠ **Ghế ngoài đài nằm ngoài hai góc** (`CupSeatStart` 7.5 > `CupCornerReach` 3.4) để hai người
đang đấu không va vào khán giả. Nhưng khoảng ấy **không** đủ để khán giả khỏi xông vào — đó là
việc của §2b.

⚠ **Không cây chỉ huy** (`MapBlueprint.Apply` tắt `commander`): `CommandNode.ApplyToAgent` nhắc
lệnh mỗi nhịp nên nó bật lại và ra lệnh cho sáu võ sĩ đang ngồi ngoài ngay frame sau.

⚠ **`SeatWaiting` (2 s) vẫn giữ** dù AI đã tắt — nó là lưới an toàn cho trường hợp một hệ khác
bật lại `StickmanAgent` (hồi sinh, playbook của scene, tool gỡ lỗi), đúng khuôn "phát lại theo
nhịp" của `ChampionDuel.TickMelee`.

### 6. Hai kiểu nhìn — không có một dòng nào hỏi `WorldPlane`

Hai góc đài nằm theo trục X ở sân nào cũng đúng, và mọi chỗ đứng đi qua `MapAssembler.GroundPoint`
— cái phễu duy nhất biết sân này là sân ngang hay sân mặt đất ([WorldPlane](WorldPlane.md) §3).
Trọng tài chỉ nhận `Transform` góc đài và không tự tính toạ độ nào.

`StickmanGroundPlaneBuilder` duyệt **mọi** `MissionType` nên bản mặt đất sinh ra miễn phí —
đúng điều file đó tự dặn: *"nếu một ngày file này phải dài ra để hỗ trợ thêm nhiệm vụ X thì đó
là dấu hiệu trục kiểu nhìn đã bị rò rỉ"*. Không thêm một dòng nào ở đó.

### 6b. Bảng máu, sơ đồ nhánh, và tiếng

**Hai thanh máu ĐỐI XỨNG** (vơi từ giữa ra hai bên) chứ không cùng vơi về một phía: chênh lệch
máu là thứ quyết định hiệp hết giờ, cùng gốc thì mắt đọc được ngay, khác gốc thì phải so hai độ
dài — một phép tính giữa lúc tay đang bận.

**Sơ đồ nhánh** chỉ hiện ở nhịp NGHỈ (`ShowingBracket` = giới thiệu trận hoặc vừa xong một trận):
vẽ đè lúc đang đánh là che mất chính cái sân mà hai thanh máu đang mô tả. Cặp của người chơi được
**tô nền**, không chỉ đổi màu chữ — giữa bảy dòng tên nền văn minh lạ hoắc, một sắc chữ khác
không đủ để mắt bắt ngay.

⚠ Bảng khai `StickmanUI.ClaimPanel`: cột trái là vùng dùng chung, và đó là cách `StickmanUI` chặn
một cú chạm vào bảng xuyên xuống sân thành một cú ra đòn (trên điện thoại là mất một nhịp mỗi lần
người chơi đọc bảng).

⚠⚠ **`GUIStyle` dùng chung phải ĐẶT LẠI mỗi lượt vẽ.** `_nameStyle`/`_roundStyle` được cả thanh
máu lẫn bảng nhánh dùng; bảng nhánh đổi cỡ chữ, màu và căn lề. Vì `OnGUI` vẽ thanh máu TRƯỚC bảng
nhánh, cái lệch không hiện ra ở khung hình gây lỗi mà ở khung hình SAU — tên võ sĩ lặng lẽ tụt
xuống 12pt và xám đi kể từ lần đầu bảng bung ra, và không bao giờ trở lại.

**Tiếng đi qua KHOÁ**, không qua field kéo tay, và dùng lại khoá SẴN CÓ chứ không đẻ khoá mới:
mở hiệp `Character/Shout` · hạ đo ván `General/Down` · hết giờ `City/Clear` · thắng trận
`Build/Done`. Khoá chưa có clip thì im — không màn nào vỡ vì thiếu asset (xem `Audio.md`).

**★ SẠCH MÁU ★** — thắng một hiệp mà chưa mất giọt máu nào. Không đổi luật (vẫn đúng một hiệp),
nhưng nó là thứ duy nhất trong màn thưởng cho việc đánh HAY chứ không chỉ đánh THẮNG.

### 7. Làm gì để chơi

```
Tools > Stickman > Maps > 1. Hệ thống map          → preset «Med_Cup» (sân NGANG)
Tools > Stickman > Nâng cao > Maps > 8. Build SÂN MẶT ĐẤT → Map_Grd_Medieval_ChampionshipCup
```

Sân ngang: mở sân map Trung cổ, chọn *«Giải đấu tranh cúp»* trong menu «Chế độ chơi».
Sân mặt đất: mở `Demo_70_MapGroundMedieval`, bấm **F2** chọn *Giải đấu tranh cúp*.

Phép đo: «★ KHÁM SỨC KHOẺ DỰ ÁN» › *Giải đấu tranh cúp* và *Kiểu chơi (MissionType) nối thiếu điểm*.

### 8. Còn nợ

- **Chưa có ART riêng cho võ đài** — sàn đài, dây quây, khán đài đều chưa vẽ; hiện tại nó là
  một dải đất phẳng có mấy cái mốc. Đây là art VẼ BÙ chưa làm, không phải một quyết định
  (xem [AssetGeneration](AssetGeneration.md) luật 0).
  ⚠ Từ 2026-09-14 món nợ này NẶNG THÊM một bậc: vòng dây (§0) đã có thật trong luật chơi nhưng
  **vô hình** — người chơi đi tới mép sàn thì khựng lại mà không có gì giải thích vì sao. Cặp
  cột góc + hai sợi dây ở `RingHalf` = 7 là mảnh art nhỏ nhất đủ trả nợ.
- **Tiếng mới chỉ là DÙNG LẠI khoá cũ** (§6b) — chưa có tiếng cồng riêng, chưa có tiếng đám đông,
  chưa có nhạc nền giải đấu. Đặt Gemini theo `Audio.md` rồi thả vào `StickmanSoundBank`.
- **Chưa có khán giả** — sáu võ sĩ chờ lượt ngồi ngoài là tất cả những gì có ở ringside.
- **Hai thanh máu chưa có ảnh chân dung** võ sĩ; nhận diện đối thủ hiện chỉ dựa vào tên nền văn minh.
- **Chưa có preset cho Hiện đại · Fantasy · Võ lâm ở sân ngang** (bản mặt đất thì có sẵn).
  Ba thời kỳ đó chạy được nhưng đấu thủ mang tên đánh số vì chỉ Trung cổ có bảng nền văn minh.
