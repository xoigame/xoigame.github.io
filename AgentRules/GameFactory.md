## ⚠⚠ XƯỞNG GAME — bốn trục NHÂN để một bộ khung đẻ ra NHIỀU game (2026-09-09)

User hỏi: *"làm sao để dự án tạo được nhiều game khác nhau?"* Đo trước khi trả lời:

| Đo (2026-09-09) | Số | Nghĩa |
|---|---:|---|
| `class … : MatchModeBase` | 35 | 35 kiểu chơi |
| `RefereeSpec` trong công thức JSON | 30 | 5–6 mode chưa có đường vào JSON |
| `MissionType` | 20 | kiểu nhiệm vụ dựng được LÚC CHẠY |
| vật thể tên là "một game" | **0** | ← chỗ hỏng gốc |
| tầng luật biến thể | **0** | |
| mode khai `SupportedRoles` | **0/35** | ba vai có sẵn, không ai tiêu |

**Chẩn đoán:** dự án đang **CỘNG** game — muốn game thứ 36 thì viết class thứ 36. Bốn trục
dưới đây **NHÂN**: chúng áp lên MỌI kiểu chơi đã có, nên thêm một dòng dữ liệu là thêm nội
dung cho cả 35 mode cùng lúc.

### 1. GÓI GAME — `GamePack` · một game = một khối JSON

`Assets/Scripts/Core/Run/GamePack.cs` · `GamePackRun.cs` · `Assets/Scripts/Map/Story/GamePackRunner.cs`

Một gói khai: thể loại · **vai người chơi** · chuỗi chặng · luật biến thể · quỹ mạng · có
thưởng giữa chặng không. Mỗi chặng khai `mission` (một `MissionType`), tên, lời dẫn, luật
riêng, bậc khó ép.

⚠⚠ **GÓI GAME KHÔNG ĐẺ SCENE.** Cách hiển nhiên là dựng sẵn 5 scene cho gói 5 chặng — sai:
sửa một dòng JSON là phải dựng lại 5 scene, và "thêm một game" thành một việc phải bấm nút
Editor (AI yếu không làm được — luật 6 `CheapAI.md`). Thay vào đó một chặng = **một lời nhắn
gửi sang sân map** (`MapArenaRequest`), dựng lúc chạy trên đúng bốn sân đã có.

⚠ Trạng thái chuyến đi phải nằm ở `GamePackRun` (static, sống qua reload scene). Để trong
MonoBehaviour là mất sạch ở chặng thứ hai.

⚠ `GamePackRunner` tự sinh (`DontDestroyOnLoad`) và tự cắm `MutatorBinder` + `MatchChallengeTracker`
vào từng scene vừa nạp. Không scene nào phải gắn sẵn gì — đó là lý do hệ này không đụng
60+ scene cũ.

### 2. LUẬT BIẾN THỂ — `MutatorTable` · trục rẻ nhất dự án

`Assets/Scripts/Core/Run/MatchMutators.cs` · `ActiveMutators.cs` ·
`Assets/Scripts/Gameplay/Shell/MutatorBinder.cs`

18 luật gốc × 10 loại hiệu lực, mỗi luật khai thêm **phe đích** (0 = cả hai · 1 = mình ·
2 = địch). Cùng một hiệu lực, đổi phe là một luật chơi khác: *Thuỷ tinh* (mọi người 1 máu) và
*Địch bằng giấy* (chỉ địch 1 máu) là hai game.

⚠⚠ **CẮM-SAU, KHÔNG HỎI-MỘT-LẦN.** `RunPerkBinder` quét sổ một lần ở `Start` — đúng cho phần
thưởng, SAI cho luật. Một luật "mọi người một máu" bỏ sót quân tiếp viện thì nó không còn là
luật. `MutatorBinder` nghe `TeamMember.AnySpawned` suốt trận.

⚠⚠ **HAI BIẾN TOÀN CỤC PHẢI TRẢ LẠI:** `Physics2D.gravity` và `Time.timeScale` sống qua cả
scene. Đặt mà không trả là ván sau vẫn còn trọng lực mặt trăng, không lỗi nào báo. Đặt
`timeScale` thì phải báo cho `HitStop.RestoreScale`, không thì mỗi cú đánh trúng là trận tự
nhảy về tốc độ thường.

⚠ **ÁP LẠI PHẢI RA CÙNG KẾT QUẢ.** Object bị tắt/bật lại (pool) thì sự kiện sinh bắn hai lần.
Áp kiểu "máu hiện tại × 0.5" thì lần hai còn một phần tư. Binder nhớ **số gốc** từng người rồi
luôn tính từ số gốc.

⚠ **CHỈ GHI KHI CÓ LUẬT.** `DamageDealtScale`/`DamageTakenScale`/`AttackSpeedScale` là ô dùng
chung (hào quang tướng, buff nội công, choáng). Ghi đè vô điều kiện — kể cả bằng đúng số gốc —
là xoá buff của người khác mỗi lần có ai hồi sinh.

### 3. VAI NGƯỜI CHƠI — `MatchModeBase.SupportedRoles` · nhân ba, tiền đã trả một nửa

Dự án có sẵn `PlayerRole` (Hero · Commander · Observer) và `CommanderPlayHud`, nhưng **0/35
mode khai nó chơi được vai nào**. Cùng một màn hộ tống: Hero = hành động, Commander = dàn
trận, Observer = auto-battler.

Mặc định `SupportedRoles` = Hero + Observer. Mode nào lo được mốc ra lệnh cho cây chỉ huy thì
override và kê thêm `PlayerRole.Commander`. Doctor đếm con số này — **nó chỉ được TĂNG**.

### 4. THỬ THÁCH PHỤ — `MatchChallengeTable` · bám lên cả 35 mode cùng lúc

`Assets/Scripts/Core/Run/MatchChallenges.cs` · `MatchChallengeRun.cs` ·
`Assets/Scripts/Gameplay/Modes/MatchChallengeTracker.cs`

Mỗi ván bốc **ba** thử thách theo `GameRun.Seed` (cùng seed ⇒ cùng ba lá). Đạt đủ ba ⇒ thêm
một lần chọn phần thưởng (`RunPerks`). "Thắng" và "thắng trong 90 giây mà không mất ai" là hai
ván khác nhau trên cùng một map, cùng một mode, cùng một bộ số.

⚠ Nó bám được lên mọi mode vì **chỉ nghe hai sự kiện tĩnh có sẵn** — `TeamMember.AnyDied` và
`MatchModeBase.AnyFinished` — cộng `MatchOutcome.duration`. Thêm một `ChallengeKind` cần cảm biến
MỚI thì phải cắm cảm biến trước, không thì lá đó bày ra mỗi ván và không bao giờ đạt.

⚠ **THUA THÌ KHÔNG LÁ NÀO ĐẠT**, kể cả lá đã đủ số. Thử thách cộng thêm vào một chiến thắng,
không phải giải an ủi.

### Năm phép đo canh chừng (`★ KHÁM SỨC KHOẺ DỰ ÁN`)

`Assets/Editor/Doctor/StickmanDoctor.GameFactory.cs` — cả năm đọc văn bản nguồn + bảng, không mở scene:

| Phép đo | Bẫy nó canh |
|---|---|
| Chặng trỏ vào kiểu chơi có thật | `"Seige"` thay vì `"SiegeStarve"` ⇒ bốc map ngẫu nhiên, không lỗi nào |
| Luật biến thể có thật | `"ironmn"` ⇒ luật lặng lẽ không tồn tại |
| **Mỗi `MutatorKind` phải có người ÁP** | «viết xong nhưng KHÔNG AI GẮN»: luật có tên, hiện HUD, không làm gì |
| **Mỗi `ChallengeKind` phải có người ĐO** | lá bày ra mỗi ván, không bao giờ đạt |
| Mode khai được mấy vai | phép đo ĐẾM, con số chỉ được tăng |

⚠ Hai phép đo giữa **quét văn bản**, cố ý không dùng reflection: vế áp nằm trong thân hàm mà
reflection không đọc được, còn một bảng kê tay thì chính nó là điểm nối thứ hai có thể quên
(cùng lý do `StickmanMissionChainCheck` cũng quét văn bản).

### Cửa vào

`Tools > Stickman > Nâng cao > Gameplay > ★ Xưởng game` (`StickmanGameFactory`) — xem gói, soi
từng chặng (kiểu chơi có thật? kho map có màn nào? luật có thật?), **▶ Chơi thử**, và ghi bốn
bảng ra JSON.

Khối **«TÍNH NĂNG THEO CHẾ ĐỘ CHƠI»** (`StickmanGameFactory.Features.cs`, 2026-09-16) là trục
NHÂN thứ năm nhìn thấy được: mỗi hàng một kiểu chơi, cột cuối là những hệ mode ấy TẮT
(`MatchModeBase.Features` — xem [FeatureToggles](FeatureToggles.md)), kèm dòng «tính năng nào
chưa mode nào tắt». Bảng đọc bằng cách **gọi thật** property trên một `GameObject` TẮT SẴN —
object tắt thì Unity không gọi `Awake`, nên không mode nào kịp ghi vào sổ `GameFeatures` thật.

⚠ Bốn bảng (`GamePacks` · `Mutators` · `RunPerks` · `MatchChallenges`) mặc định chỉ nằm trong C#.
Bấm nút ghi mới có file trong `Assets/Resources/` để sửa bằng văn bản. **Có file rồi thì JSON
là nguồn ưu tiên** — sửa bảng gốc trong C# sẽ không còn tác dụng. Nút ghi hỏi trước khi đè.

⚠ **Gói dựng từ KỊCH BẢN user đi vào `Resources/GamePacksExtra.json`** (2026-09-12) — file
CỘNG THÊM, nạp sau cùng: trùng `id` thì thay, còn lại nối vào cuối. Nhờ vậy AI thêm một game
từ kịch bản mà không phải xuất (và đóng băng) cả bảng gốc. Doctor đọc `GamePackTable.All` nên
gói extra được khám y như gói gốc. Quy trình nhập kịch bản: skill `stickman-story`.

**Chặng có BỐI CẢNH riêng** (2026-09-12): `GamePackStage.civA/civB · night · weather · biome`
(chuỗi, rỗng = để sân bốc) và `GamePack.hero` (tên nhân vật chính, hiện trên tấm bảng dẫn nhập).
`GamePackStageDress.Apply` đắp lên map ở `MapArena.Rebuild` NGAY SAU `SagaMapDress` — trên bản
sao, chỉ khi `stage.HasSetting`; nền văn minh chỉ áp ở thể loại `UsesCivilizations`, tra bằng
`CivilizationLibrary.FindByName` (khớp gần đúng — cùng phép tra với cầu AI phim). Tên sai ⇒
cảnh báo Console + để sân bốc; Doctor «Gói game: chặng khai BỐI CẢNH có thật» réo TRƯỚC khi ai
phải chơi tới chặng đó.

## SÁU VIÊN GẠCH Ở CORE — để thể loại MỚI không phải sửa Core (2026-09-09, đợt hai)

Bốn trục trên nhân được số game **trên bộ khung hiện có**. Sáu viên gạch dưới đây trả lời câu
khác: *"thêm một THỂ LOẠI chưa từng có thì phải sửa Core mấy chỗ?"* Đo trước khi làm — năm chỗ
Core đang bắt mọi game mới **cộng thêm vào Core**:

| Chỗ | Đo được | Viên gạch |
|---|---|---|
| Nhân vật | 7 class kế thừa `StickmanController` (1182 dòng): cả `BaseBuilding` lẫn `RiderlessHorse` | `WorldThing` |
| Ô chỉ số | `SetMaxHealth` bị **27 file** ghi; `DamageTakenScale` 7 file — đều ghi đè | `StatChannel` + `UnitStats` |
| Lưu | `PlayerProfile` có `bestArenaWave`, `bestRoyalePlacement`, `cityMoney`… | `SaveBag` |
| Điều khiển | `StickmanTouchInput` là danh sách động tác stickman | `InputVerbs` |
| Kết quả ván | `MatchOutcome` chỉ có `winner` | `score` + `rank` |
| Màn hình | **65 file `OnGUI`, 20 file Canvas** | `ScreenSpec` + `ScreenRenderer` |

### 5. `StatChannel` + `UnitStats` — một đại lượng, nhiều nguồn

`Assets/Scripts/Core/Combat/StatChannel.cs` · `Assets/Scripts/Combat/Character/UnitStats.cs`

Ghi **theo nguồn**, không ghi đè: `UnitStats.Of(x).DamageTaken.Set("aura:general", 0.8f, StatOp.Mul)`
và `Remove("aura:general")` khi tướng chết. Công thức cố định `(nền + Σ Add) × Π Mul` nên hai
nguồn đặt theo thứ tự nào cũng ra cùng một số.

⚠⚠ **ĐẶT LẠI CÙNG MỘT NGUỒN LÀ BẤT BIẾN** — đây là thứ khiến mọi lớp áp-hiệu-ứng không còn
phải tự nhớ "số gốc" của từng người. `MutatorBinder` là người dùng đầu tiên và đã bỏ được cả
sổ số gốc lẫn câu né *«chỉ ghi khi có luật»*.

⚠ Đây là hệ SONG SONG, không phải bản thay thế: 27 chỗ gọi `SetMaxHealth` vẫn chạy nguyên.
Chuyển dần — hệ nào có thể CHỒNG với hệ khác thì chuyển; đổi nền THẬT (lên cấp, đổi loại lính)
thì ghi thẳng vẫn đúng. Doctor «Ô chỉ số: còn bao nhiêu chỗ ghi đè thẳng» đếm số còn lại.

⚠ Lệnh ĐẶT TUYỆT ĐỐI (luật «một đòn là chết» đặt máu = 1) **không** đi qua kênh — kênh chỉ biết
cộng và nhân. Ghi thẳng ở đó an toàn vì tự nó đã bất biến.

### 6. `SaveBag` — túi lưu theo khoá

`SaveBag.Best("royale.bestPlacement", 3)` · `SaveBag.Add("goals.totalMet", 2)`.
Sống trong `PlayerProfile.bag`, một file lưu, một nguồn sự thật.

⚠ **KHOÁ PHẢI CÓ TIỀN TỐ** `<hệ>.<số>` — không có thì hai game đặt trùng tên và ghi đè nhau
trong im lặng. ⚠ Túi **không tự ghi đĩa**: đổi xong gọi `SaveBag.SaveIfDirty()`.
Doctor «Hồ sơ lưu không phình theo số game» đếm số trường cũ còn lại — chỉ được GIẢM.

### 7. `WorldThing` — thứ tồn tại mà KHÔNG cần biết đánh nhau

Ô đất trồng trọt, cần gạt, hòm đồ, ô đặt trụ, mảnh ghép. Có máu tuỳ chọn, phe tuỳ chọn,
`Hit`/`Use`/`Break`/`Restore`, sổ tĩnh `All` + `FindNearest(vị trí, bán kính, nhãn)`.

⚠ **KHÔNG lật lại quyết định `DestructibleTarget : StickmanController`** — quyết định ấy đúng
cho thứ CẦN bị AI đánh (0 dòng AI phải sửa). Bảng chọn: *AI phải tự tìm tới và đánh → kế thừa
như cũ; người chơi chạm/đập/nhặt còn AI không quan tâm → `WorldThing`.*

⚠ `WorldThing` **không lọt vào radar địch**, và đó là tính năng: thêm một luống rau mà cả đạo
quân quay sang chém nó mới là hỏng.

### 8. `InputVerbs` — bảng động từ điều khiển

`InputVerbs.Register("td.place", "Đặt trụ", VerbKind.Press, "td")` rồi
`InputVerbs.ConsumePress("td.place")`. HUD hỏi `InGroup("td")` để tự bày nút.

⚠ Hệ SONG SONG với `StickmanTouchInput`, không thay nó. Cái cần là **thể loại mới không phải
thêm trường vào một class ở Core nữa** — đúng ngày viết luật này, một đợt việc khác đang phải
đổi `MartialSkill1Ready`/`2`/`3` thành mảng vì bốn chiêu võ lâm đã làm nó vỡ.

### 9. `MatchOutcome.score` / `.rank`

0 = "ván này không tính điểm" (mọi mode cũ giữ nguyên). Mode có con số đáng nhớ thì gọi
`SetTally(score, rank)` — `ZombieWaveMode` khai số đợt đã trụ làm ví dụ mẫu.
Mở đường cho họ thể loại tính điểm / xếp hạng / nhiều sao mà trước đây không có chỗ báo cáo.

### 10. `ScreenSpec` + `ScreenRenderer` — màn hình khai bằng dữ liệu

Một màn hình = một danh sách dòng (`Heading` · `Text` · `Button` · `Stat` · `Card` ·
`Separator`), `ScreenRenderer.Draw` trả `id` vừa bấm. Không `Rect` nào tính tay, không prefab,
không Canvas — AI yếu dựng được một màn hình mới mà không mở Unity.

⚠ **KHÔNG nạp scene tại chỗ nhận `id`** (vỡ `GUIClip`): đặt cờ, `Update` mới nạp.
⚠ Không đụng 65 `OnGUI` cũ; giá trị nằm ở chỗ **màn hình thứ 66 trở đi không phải vẽ tay**.

Người dùng thật đầu tiên: `GamePackPicker` (module Map) — **bảng chọn game trong game**, đồng
thời là bằng chứng `ScreenSpec` + `SaveBag` + `GamePackRunner` chạy được cùng nhau.

### Còn nợ — đọc trước khi hứa với user

**Luật THẮNG vẫn chưa ghép được từ mảnh.** Bốn trục trên nhân được *bối cảnh, số, tay lái và
mục tiêu phụ*; điều kiện thắng thì vẫn nằm nguyên trong 35 class mode, nên mode thứ 36 vẫn
phải là một class mới. Đó là trục nhân sâu nhất và chưa làm — kế hoạch ở
[Roadmap-GameFactory.md](../KnowledgeBase/Roadmap-GameFactory.md).

**Trục 2D và hot-seat vẫn chưa có.** `MapWrap` chỉ có `MinX/MaxX` và **186 file** bám trục x —
mọi game top-down / lưới chiến thuật không có nhà ở đây; vá ngược vào 186 file là đổi tim dự
án, nên nếu cần thì làm **module riêng**, đừng retrofit. Hot-seat hai người một máy vẫn là 0.

**Chưa chơi thử thật.** Toàn bộ hệ này mới qua biên dịch và phép đo văn bản; chưa ai bấm
▶ Chơi thử một gói từ đầu đến cuối trong Unity, và `GamePackPicker` chưa được mở từ menu nào —
nó phải được gọi bằng `GamePackPicker.Open()`.

## ⚠⚠ CHIẾN DỊCH VÔ TẬN — máy soạn MÀN CHƠI, em song sinh của Trường quay (2026-09-09)

User: *"tham khảo chế độ phim trường… cũng có chế độ tạo màn game ngẫu nhiên như vậy, tôi tham
gia vào trận đánh, bạn tạo kịch bản và tôi điều khiển 1 nhân vật trong đó. Vô lượng kịch bản,
vô lượng vòng chơi, và asset sẽ được đưa thêm vào và nó cũng tích hợp vào sản xuất màn chơi."*

Trường quay (`Cinematic.md`) đọc asset đang có rồi viết ra một VIDEO khác nhau mỗi hạt giống.
Hệ này đọc đúng những thứ ấy rồi viết ra một **gói game chơi được**, vai `Hero`.

### 1. Mười mảnh, mỗi mảnh một câu

Mọi file ở `Assets/Scripts/Map/`.

| Mảnh | File | Trả lời câu |
|---|---|---|
| **Máy soạn** `SagaAutoWriter` | `SagaAutoWriter.cs` | soạn CÁI GÌ: thời kỳ · kiểu nhìn · cốt truyện · chuỗi chặng · biến cố · bậc khó · luật · hai ngả mỗi chặng |
| ↑ phần đọc kho | `SagaAutoWriter.Library.cs` | KHO đang có gì: kiểu chơi nào dựng được ở (thể loại × kiểu nhìn), hồi nào ghép nổi, kho tổ hợp bao nhiêu |
| **Ngữ pháp** `SagaGrammar` | `SagaGrammar.cs` | hình dáng một hồi: vai (`MissionRole`) × vị trí (`SagaSlot`) × bảng trọng số; và bảng biến cố |
| **Kho chữ** `SagaLines` | `SagaLines.cs` | tên hồi · tên đất · lời dẫn ghép câu · tên người · biệt danh · danh hiệu · lời khích của kẻ thù |
| **Dàn nhân vật** `SagaCast` | `SagaCast.cs` | NGƯỜI CHƠI LÀ AI và KẺ NÀO đang đuổi theo; hằn học → luật thật cho phe địch |
| **Vòng vô tận** `SagaRun` | `SagaRun.cs` | hồi nào tiếp theo · đường đi · lưu gì · khi nào hết |
| **Trang trí** `SagaMapDress` | `SagaMapDress.cs` | đắp lên map vừa sinh: nền văn minh hai phe · vùng đất · thời tiết · đêm · cỡ trận · dáng quân địch · vũ khí mở màn |
| **Kệ dựng sẵn** `SagaShelf` | `SagaShelf.cs` | năm chuyến đã soạn sẵn có tên, cả kệ chỉ tốn MỘT hạt giống |
| **Ba màn hình** | `SagaBriefHud.cs` · `SagaForkHud.cs` · `SagaDevPanel.cs` | tấm bảng đầu chặng (đọc kịch bản) · bảng chọn ngã rẽ · cửa vào trong ngăn kéo `⚙` |

Ba cửa vào, và **cửa thứ ba là cửa duy nhất dùng được trên máy thật**:

| Cửa | Ở đâu | Dùng khi |
|---|---|---|
| `★ Xưởng game` › khối **∞** | cửa sổ Editor | soạn thử · xem ngã rẽ · ▶ chơi thử |
| **CHIẾN DỊCH · CHỌN GAME** | menu chính (`GamePackPickerHook`, mẫu của `MapPickerHook`) | người chơi mở từ menu |
| **ngăn kéo `⚙` › ∞ Chiến dịch vô tận** (`SagaDevPanel`) | **MỌI scene, kể cả bản điện thoại** | chơi ngay tại chỗ, không cần về menu |

⚠ Cửa thứ ba tự mọc ra ở mọi scene (cùng khuôn `StickmanDevMenu`) vì hai cửa kia đều vắng mặt
trên điện thoại: một cái là cửa sổ Editor, một cái chỉ có ở `Menu_Main` — mà đang chơi dở thì
không có đường quay về đó.

### 2. Luật

1. **KHÔNG ĐẺ RA THỨ MỚI Ở TẦNG DƯỚI.** Máy soạn chỉ sinh một `GamePack` — mọi thứ đã chạy cho
   gói viết tay (`GamePackRun` · `GamePackRunner` · `MutatorBinder` · thử thách · perk) chạy
   nguyên. Không có "chế độ chiến dịch" nào trong `MatchModeBase`.
2. ⚠⚠ **HÀM SOẠN PHẢI THUẦN.** `Compose(seed, chapter)` cùng tham số ⇒ cùng gói, không đọc
   `Random` toàn cục, không ghi trạng thái. Nhờ vậy **bản lưu của một chiến dịch dài vô hạn
   là HAI SỐ** (`saga.seed`, `saga.chapter`) — không file gói nào ra đĩa, không gì để lệch.
3. ⚠⚠ **GÓI SOẠN LÚC CHẠY PHẢI ĐĂNG KÝ LẠI SAU MỖI LẦN NẠP SCENE.** `GamePackTable.Register`
   chỉ sống trong bộ nhớ; mỗi chặng là một lần nạp scene và mỗi lần vào Play là một Domain
   Reload. Mọi cửa vào đi qua `SagaRun.EnsurePack()`; `GamePackRunner.OnSceneLoaded` gọi
   `SagaRun.RestoreIfNeeded()` **trước** mọi câu hỏi về gói.
4. ⚠⚠ **KHÔNG HỎI `MapLibrary.HasMapFor` ĐỂ BIẾT DỰNG ĐƯỢC HAY KHÔNG.** Hàm ấy cố ý hỏng-mềm:
   khớp kiểu chơi nhưng lệch thể loại thì vẫn trả map đó làm đường lui. Máy soạn dùng
   `SagaAutoWriter.CanBuild` (khớp **kiểu chơi × thể loại × kiểu nhìn**), nếu không thì Võ lâm
   "dựng được" màn zombie chỉ vì Trung cổ có một màn.
5. **THIẾU CHẶNG THÌ THAY, THIẾU CỐT TRUYỆN THÌ BỎ.** Mỗi hồi khai `Signature` — kiểu chơi làm
   nên cái tên nó; thiếu cái đó thì hồi ấy không được bốc. Các chặng khác thay được
   (`Alternatives`), vì chúng là bối cảnh.
6. **PHẦN THƯỞNG KHÔNG BỊ XOÁ GIỮA HAI HỒI.** `GameRun.StartNew` gọi `RunPerks.Clear` — đúng
   cho "chuyến mới", sai cho "hồi tiếp theo". `SagaRun.OpenChapter` chụp `RunPerks.Serialize()`
   trước rồi `Restore` sau. Bậc khó vẫn leo theo hồi nên chuyến đi không thành trò đùa.
7. **LỜI DẪN CÓ Ô TRỐNG, ĐIỀN LÚC HIỆN RA.** `{A}`/`{B}` được điền từ nền văn minh THẬT của map
   vừa dựng (`SagaBriefHud`), không phải lúc soạn — map sinh ngẫu nhiên nên tên phe chỉ có thật
   sau khi sân dựng xong. Phe mình đọc theo `MatchModeBase.PlayerTeam` so với `ArmySpec.teamId`,
   **không đoán armyA**.
8. **TẤM BẢNG KHÔNG CHẶN TRẬN**: tự tắt sau 8 giây thật hoặc ngay khi chạm; không đụng
   `Time.timeScale`; câm khi `StickmanUI.GameHudSuppressed` (luật 7 `Cinematic.md`).

9. ⚠⚠ **HỒI ĐƯỢC GHÉP, KHÔNG ĐƯỢC CHỌN.** Bản đầu khai mỗi hồi bằng một DANH SÁCH `MissionType`
   viết tay ⇒ 10 hồi = đúng 10 hình dáng, và tới hồi thứ mười một là người chơi nhận ra. Nay
   mỗi chặng bốc **vai** (`MissionRole`) theo trọng số *hồi × vị trí*, rồi bốc một kiểu chơi
   hợp vai trong số thứ kho map dựng được. Đo trên kho thật: **3651/4000 hồi Trung cổ là hình
   dáng khác nhau** (Võ lâm 2681/4000 vì kho mỏng hơn).
   ⚠ **Chữ ký của hồi bị ÉP vào cao trào** — bốc tự do thì một hồi «Bùng phát» có thể không có
   chặng zombie nào và cái tên hồi thành nói dối.
   ⚠ Bảng trọng số đánh theo **chỉ số enum**: thêm một `SagaArc` mà quên thêm hàng thì hồi ấy
   im lặng không bao giờ được bốc. Doctor đếm `ArcRowCount` đúng vì chuyện này.

10. ⚠⚠ **BIẾN CỐ PHẢI CÓ HIỆU LỰC THẬT.** `SagaTwistKind` mượn một mã trong `MutatorTable`
   (`SagaGrammar.MutatorOf`) chứ KHÔNG viết hiệu lực riêng: đường áp đã có sẵn ở `MutatorBinder`
   và đã có phép đo canh. Một biến cố chỉ có chữ là dạng nguy hiểm nhất của bẫy «viết xong
   nhưng không ai gắn» — người chơi ĐỌC được lời hứa rồi đánh một trận y hệt mọi trận khác.

11. **KẺ THÙ CÓ TÊN LÀ TRẠNG THÁI THẬT, KHÔNG SUY RA TỪ HẠT GIỐNG.** «Nó đã thoát hai lần rồi»
   là kết quả của việc người chơi đã làm ⇒ nằm trong `SaveBag`, không nằm trong seed. Mỗi bậc
   hằn học = thêm một mã luật cho **phe địch** (`SagaCast.GrudgeMutators`), nên "ngày càng đáng
   sợ" là một con số chứ không phải một câu văn. Nó chỉ NGÃ khi chặng cao trào là một trận
   **tay đôi** và người chơi thắng — thắng kiểu khác thì nó chạy thoát và hằn học thêm một bậc.

12. ⚠⚠ **NGÃ RẼ LÀ MỘT CHUỖI SỐ, KHÔNG PHẢI MỘT GÓI ĐÃ SỬA.** Chọn xong thì `saga.path` dài
   thêm một ký tự và gói được **soạn lại** từ (hạt giống · hồi · đường đi). Sửa thẳng vào gói
   là phải lưu cả gói, và cái gói ấy lệch với máy soạn ngay lần sửa đầu tiên.
   ⚠ Chọn xong **phải viết lại lời nhắn gửi sang sân map** (`GamePackRunner.RepostStage`): nó
   đã được đặt lúc trận trước kết thúc, tức TRƯỚC khi người chơi chọn. Quên là bảng ghi nhận
   mà ván sau vẫn là ván cũ.
   ⚠ Bảng chọn xin ô `MidLeft` qua `ScreenZones` — ô giữa là của thẻ kết quả trận và ô
   giữa-phải là của bảng phần thưởng, mà cả hai đều hiện đúng lúc này.

13. ⚠ **MỖI CHẶNG MỘT SÂN LẠ — KHÔNG PHẢI MỘT TUỲ CHỌN.** Người chạy gói gửi lời nhắn bằng
   `MapArenaRequest.SetFresh` (không phải `Set`), nên sân luôn SINH MAP MỚI kể cả khi người
   dùng đã tắt công tắc «🎲 Mỗi ván một map mới» ở menu F1. Công tắc ấy vẫn đúng cho các màn
   lẻ (tắt để tập lại đúng một map), nhưng với chiến dịch thì chơi lại một chặng vừa thua trên
   đúng cái map cũ là **học thuộc map**, không phải chơi lại. Map mẫu trong kho chỉ để nói
   KIỂU CHƠI.

14. **KỆ KỊCH BẢN DỰNG SẴN = MỘT CON SỐ** (`SagaShelf`). Trường quay lưu `Cine_Auto_*` thành
   asset vì một video cần asset để sửa và quay lại; màn chơi thì không, nên cả kệ 5 chuyến chỉ
   là **một hạt giống** trong `SaveBag` (chuyến thứ i = `Mix(shelf, 500+i)`).
   ⚠ Kệ phải ĐỨNG YÊN giữa các lượt vẽ — bốc lại mỗi frame thì người chơi vừa thấy một cái tên
   hay, chớp mắt đã thành cái khác. Và tên chuyến phải được NHỚ: muốn có tên là phải soạn thật
   hồi 1, mà soạn thì quét cả kho map — gọi trong `OnGUI` × 5 ô là thấy giật ngay trên điện thoại.

15. ⚠⚠ **TRANG TRÍ LÀM VIỆC TRÊN BẢN SAO** (`SagaMapDress`). Map gửi tới sân có thể là một
   **asset trong kho** (đường `Play(requested)` khi tắt «mỗi ván một map»). Sửa thẳng là **ghi
   đè file trên đĩa** — hỏng vĩnh viễn và chỉ lộ ra nhiều ngày sau khi có người mở lại map ấy.
   `Instantiate` một `ScriptableObject` rẻ hơn cái giá đó rất nhiều.
   Bốn thứ được đắp thêm, tất cả ĐỌC KHO lúc chạy nên asset mới tự chảy vào:
   *nền văn minh hai phe* (chỉ khi `MapLibrary.UsesCivilizations` — ép nền La Mã lên lính hiện
   đại là hỏng chất của bộ đó) · *vùng đất + thời tiết + đêm* (thời tiết phải HỢP vùng đất) ·
   *cỡ trận* (mở màn nhỏ → cao trào lớn) · *vũ khí mở màn* lấy từ `GenreKit.playerWeapons`.
   ⚠ **KHÔNG đụng `CommandDoctrine`**: học thuyết đã có chủ (`MapAssembler.PickDoctrine` chọn
   theo thế trận — phe đi phá nhà phải có học thuyết tiến tới nhà địch, ép cái khác vào là cái
   nhà không bao giờ sập). Nét của kẻ thù nói bằng **dáng quân** (cung / khiên / sát thủ / đông
   ẩu / tinh nhuệ), thứ vừa an toàn vừa nhìn thấy được ngay trên sân.
   ⚠ Ô quân nào vốn = 0 thì GIỮ 0 — công thức map cố ý không cho kiểu chơi ấy có cung thủ.

16. **PHỐ MỞ KHÔNG PHẢI MỘT CHẶNG.** `OpenWorldCity` bị loại khỏi máy soạn: nó là một thành phố
   để sống trong đó, không có vạch đích — nhét vào giữa một hồi thì người chơi đứng giữa phố
   không biết bao giờ mới xong.

17. ⚠⚠ **LỜI DẪN CHẶNG PHẢI NỐI MẠCH — ba mảnh, không phải một câu bốc** (2026-09-12, user:
   *"kịch bản rời rạc"*). Bản trước `StageBrief` chỉ biết VỊ TRÍ (mở/giữa/cuối) + một câu sức ép
   bốc rời, nên chặng 2 của «Cắt đường» đọc y như chặng 2 của «Giải cứu», và không câu nào nhắc
   tới thứ người chơi vừa làm ở chặng 1. Nay `SagaLines.StageBrief(arc, vị trí, có-chặng-trước,
   vai-chặng-trước, chỗ-chặng-trước, rng)` ghép:
   **[nối]** «Đã phá được cửa bắc.» — đọc `MissionRole` + `spot` của chặng vừa xong (chặng chỉ tiến
   khi THẮNG, `GamePackRun.Advance`, nên câu này không nói dối) →
   **[mạch]** `SagaLines.ArcThread(arc, slot)` — mỗi cốt truyện BỐN câu theo [Mở · Leo thang ·
   Khúc quanh · Cao trào], đọc dọc một hàng ra một chương có đầu có cuối →
   **[sức ép]** câu chung như cũ.
   `SagaOption` mang thêm `spot`; `OptionAt` nhận `previous`; `Compose` truyền chặng trước theo
   vòng lặp, `TryGetOptions` soạn lại chặng trước theo `path` — cùng một hàm nên bảng chọn và gói
   thật đọc cùng câu, và máy vẫn THUẦN (Doctor «ngã rẽ» soạn hai lần vẫn y hệt).
   ⚠ `Threads` đánh theo CHỈ SỐ `SagaArc` như bảng trọng số: thêm cốt truyện mà quên hàng thì
   hồi ấy rơi về kho câu chung cũ — Doctor «cốt truyện nối đủ chỗ» réo `SagaLines.ArcThread`.

### 3. Trục KIỂU NHÌN — sân mặt đất 3/4 (beat-em-up)

`ViewPlane` (Core, `WorldPlane.cs`) là trục ĐỘC LẬP với thể loại, nên nó **nhân**: 4 thời kỳ ×
2 kiểu nhìn. Máy soạn bốc kiểu nhìn **theo HỒI**, và chỉ bốc `Ground` khi cả hai thứ có thật:

- kho map có màn `plane = Ground` cho (thể loại × kiểu chơi) đó, **và**
- **scene sân mặt đất đã dựng** — `MapArenaRequest.HasGroundArena` hỏi thẳng Unity
  (`Application.CanStreamedLevelBeLoaded`), không đọc danh sách gõ tay.

Chưa bấm «Maps › 8. Build SÂN MẶT ĐẤT» thì chiến dịch chạy toàn sân ngang và **không hứa gì
về 3/4**. Bấm nút đó xong là số hồi soạn được tự lớn lên — không sửa dòng nào.

⚠ `GamePack.plane` quyết định **scene sân** (`MapArenaRequest.SceneFor(genre, plane)`) và
`GamePackRunner` phải tìm map bằng `SagaAutoWriter.FindMap` (ba điều kiện). Kho có hai map cho
cùng một (thể loại × kiểu chơi) từ khi có sân 3/4; gửi nhầm là một chặng ngang mở ra map không
trọng lực — và khi tắt «mỗi ván một map» thì map ấy được chơi Y NGUYÊN.

### 4. Mobile

Bảng chọn game và tấm bảng lời dẫn đều là màn hình **bấm bằng ngón tay**, nên:

⚠⚠ **ĐO BẰNG `StickmanUI.Width/Height`, KHÔNG BẰNG `Screen.*`** sau khi gọi `StickmanUI.Begin()`
— `Begin` đặt `GUI.matrix` đã scale và cắt vùng an toàn. Trộn hai hệ toạ độ thì trên máy bàn
không thấy gì sai còn trên điện thoại bảng chạy ra ngoài mép.

⚠⚠ **`ScreenRenderer` LẤY CỠ HÀNG TỪ `StickmanUI.Row`.** Trước 2026-09-09 nó gõ cứng 34/68 —
tức mọi màn hình khai bằng dữ liệu có nút cao 34 trên điện thoại, dưới mức bấm trúng 44 mà cả
Apple lẫn Google khuyến nghị. Bấm trượt thì người chơi tưởng game đơ và **không lỗi nào báo**.

### 5. Phép đo tự động (`★ KHÁM SỨC KHOẺ DỰ ÁN`)

`Assets/Editor/Doctor/StickmanDoctor.Saga.cs` — không mở scene nào:

| Phép đo | Bẫy nó canh |
|---|---|
| Soạn được ở thời kỳ nào | kho map mỏng dần tới lúc nút «∞» bấm vào không vào được ván; và **có map 3/4 nhưng chưa dựng sân** |
| Chặng soạn ra dựng được thật | chạy thật 24 hạt giống × 4 hồi, soi từng chặng: kiểu chơi · map đúng (thể loại × kiểu nhìn) · mã luật |
| Cốt truyện nối đủ bốn chỗ | thêm `SagaArc` mà quên **hàng trọng số** / `Signature` / `ArcTitle` / `ArcBrief` / **`ArcThread` (4 câu mạch)** — không chỗ nào gây lỗi biên dịch |
| **Biến cố có hiệu lực thật** | biến cố CHỈ CÓ CHỮ: mã luật của nó không tồn tại (hoặc bị `Mutators.json` xoá) |
| **Ngã rẽ có thật và soạn lại y hệt** | hai ngả ra kết quả giống nhau (nút trang trí); và máy soạn mất tính thuần ⇒ bấm «chơi tiếp» ra một hồi khác |

⚠ Ba phép đo cuối **gọi thật** thay vì quét văn bản: bảng trọng số và mấy cái `switch` đều trả
lời được bằng một lời gọi, mà gọi thật thì không bao giờ lệch với thứ chạy trong game.

### 6. Thêm

| Muốn thêm | Chỗ nối | Phép đo |
|---|---|---|
| Cốt truyện mới | `SagaArc` + một **hàng** `SagaGrammar.ArcWeights` + `Signature` + `SagaLines.ArcTitle`/`ArcBrief` + một **hàng 4 câu** `SagaLines.Threads` | «cốt truyện nối đủ bốn chỗ» |
| Biến cố mới | `SagaTwistKind` + `SagaGrammar.MutatorOf` (mã CÓ THẬT) + `SagaLines.Twist`/`TwistName` | «biến cố có hiệu lực thật» |
| Vai mới | `MissionRole` + cột trong CẢ HAI bảng trọng số + nhánh `SagaGrammar.RoleOf` | «chặng soạn ra dựng được thật» |
| Đổi nhịp một hồi | sửa **hàng** của nó trong `ArcWeights` — không đụng file nào khác | — |
| Lời dẫn hay hơn · tên người · lời khích | chỉ sửa `SagaLines` — không đụng máy soạn | — |
| Nội dung cho MỌI hồi cùng lúc | thêm map / nền văn minh / luật vào bảng; máy soạn đọc lúc chạy | «soạn được ở thời kỳ nào» (kho tổ hợp phải TĂNG) |

⚠ Thêm giá trị `SagaArc` / `SagaTwistKind` **ở cuối**: chỉ số được trộn vào hạt giống (và
`SagaArc` còn là chỉ số hàng của bảng trọng số), chèn giữa là đổi hết mọi chiến dịch đang lưu.
