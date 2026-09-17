## VỎ GAME & CÔNG THỨC DỰNG MÀN — ba lõi để bộ asset thành MỘT CON GAME

Bốn lõi cũ (**AI · vũ khí · map · art**) đều cùng một loại: **lõi SẢN XUẤT NỘI DUNG**. Chúng
làm ra quân, cây vũ khí, bản đồ, tấm art. Nhưng nội dung không tự thành game — đo được:
**0 file ghi hồ sơ ra đĩa**, giao diện là 35 file `OnGUI` kiểu debug, và đường DUY NHẤT vào
50 màn chơi được là ô chọn scene F1 (công cụ của người làm game). Ba lõi dưới đây lấp đúng
chỗ đó, và cả ba đều **KHÔNG thêm cơ chế chơi nào** — chỉ nối thứ đã có thành một vòng đời.

### 1. LƯU TRỮ — `Core/SaveSystem` + `Core/PlayerProfile`

`GameRun` sống qua reload scene nhưng nó là `static`: **tắt game là mất sạch**. Không có save
thì không có chiến dịch, không mở khoá được gì, và **không có lý do nào mở game lần thứ hai**.

**MỘT CỬA DUY NHẤT** — mọi hệ hỏi qua `SaveSystem.Current`, không hệ nào tự ghi file. Bốn
luật, và cả bốn đều là một lỗi có thật ở đâu đó:
· **CÓ SỐ PHIÊN BẢN + ĐƯỜNG NÂNG CẤP** (`SaveSystem.Version` / `Migrate`) — thêm một trường
  rồi đọc file cũ mà không có version thì hồ sơ hỏng **trong im lặng**, cùng họ với bẫy
  "asset còn 5 ô của thang cũ". Nâng **TỪNG BẬC**, và hồ sơ tới từ phiên bản TƯƠNG LAI thì
  **không đụng vào** — đoán mò cách hạ cấp là làm hỏng thật một hồ sơ vốn còn lành.
· **GHI NGUYÊN TỬ** (`.tmp` → `File.Replace` → giữ `.bak`) — ghi đè thẳng mà tắt máy giữa
  chừng là hồ sơ CỤT, mất trắng.
· **HỎNG THÌ ĐỪNG LÀM SẬP GAME** — file rách thì đổi tên thành `.broken` rồi đi tiếp bằng hồ
  sơ mới. Ném exception ở đây nghĩa là người chơi **không vào nổi game**, đắt hơn nhiều so
  với mất tiến trình. ⚠ ĐỔI TÊN chứ đừng XOÁ: đó là thứ duy nhất còn lại của tiến trình họ.
· **LƯU Ở CHỖ ĐÓNG VÁN, KHÔNG LƯU MỖI FRAME** — `GameSession.ReportOutcome` gọi
  `SaveSystem.RecordMatch` ngay sau `GameRun.RecordResult` (gọi SAU để hồ sơ mang đúng bậc
  khó của VÁN SAU). Ghi đĩa liên tục vừa tốn vừa dễ rách nếu tắt máy đúng lúc.
⚠ `GameRun.RestoreFromProfile` là đường DUY NHẤT ghi đè trạng thái run từ bên ngoài — chỉ
`SaveSystem` được gọi. Mở cho ai cũng gọi thì "ván thứ mấy / bậc khó" có hai nguồn sự thật.
⚠ Nạp lại **ĐÚNG SEED CŨ** (không `Reseed`): cả điểm của việc lưu là mở lại game thì map,
cặp nền văn minh và bố cục quân phải y hệt lúc tắt.

### 2. VỎ GAME — `Gameplay/GameShell` + `Gameplay/GameMenuConfig`

Ba màn hình: CHÍNH → CHỌN MÀN → CÀI ĐẶT (âm lượng · cỡ giao diện · xoá tiến trình).

⚠⚠ **`Menu_Main` PHẢI LÀ SCENE SỐ 0** (`StickmanShellBuilder.PutMenuFirstInBuildSettings`).
Unity nạp scene ĐẦU DANH SÁCH khi chạy bản build — quên bước này thì game mở lên rơi thẳng
vào bàn thử vũ khí, mọi thứ "chạy đúng" mà không ai tìm thấy menu. Doctor canh đúng vế này.
⚠⚠ **DANH SÁCH MÀN KHÔNG ĐỌC THẲNG `DemoSceneCatalog`.** Catalog nằm ở module **Demo** — thứ
`AGENTS.md` ghi rõ *"★ game thật thì BỎ"*. Đọc thẳng là **bỏ Demo thì mất luôn menu**, tức bộ
khung hết bóc ra được. Nên catalog là danh sách của NGƯỜI LÀM GAME, `GameMenuConfig`
(Resources, tầng Gameplay) là danh sách của NGƯỜI CHƠI; tool lọc từ cái trước sang cái sau,
chỉ lấy nhóm «Chế độ chơi» và chỉ màn **có file thật trên đĩa**.
⚠ **Màn hình chặn luồng thì lối thoát PHẢI là `GUI.Button`** — đây là bẫy đã trả giá ở bảng
kết quả của `GameSession` (chữ "SPACE — ván tiếp theo" vẽ bằng `GUI.Label` nên trên điện
thoại bảng kết quả là **ngõ cụt tuyệt đối**). Tự hỏi: *"rút bàn phím ra thì còn ra khỏi màn
hình này được không?"*
⚠ **ĐỪNG `LoadScene` trong `OnGUI`** — nó huỷ chính object đang vẽ dở. Đặt cờ, chạy ở `Update`.
⚠ Slider âm lượng chỉ LƯU khi số thật sự đổi: nó trả giá trị mới mỗi frame kéo.

### 3. CÔNG THỨC DỰNG MÀN — `Editor/SceneRecipe` + `StickmanRecipeBuilder`

Dựng một màn hiện nay là gọi ĐÚNG THỨ TỰ **11 bước**; quên một dòng là hỏng, và gần như dòng
nào cũng hỏng trong im lặng (quên trọng tài ⇒ trận trôi mãi · quên `AddGenrePolicy` ⇒ lính
trung cổ ném lựu đạn · quên `AddRespawnDirector` ⇒ không có giỏ đạn · quên đăng ký catalog ⇒
scene có file mà F1 không thấy). Người viết code phải NHỚ; **một AI yếu thì không nhớ nổi** —
nó sẽ chép builder cũ rồi sót đúng dòng không ai để ý.

> **Thứ tự là việc của MÁY, nội dung là việc của người.**

⚠ **CỐ Ý LÀ JSON, không phải asset kéo-thả**: đối tượng dùng nó là một AI chỉ sửa được VĂN
BẢN. Asset thì phải mở Unity mà kéo.
⚠ **CÔNG THỨC SAI THÌ KHÔNG DỰNG** — `SceneRecipe.Validate()` réo tên TRƯỜNG (sân quá hẹp ·
người cuối hàng đứng ngoài map · màn «diệt sạch địch» mà không có phe địch · `genre` sai
chính tả). Dựng một màn hỏng còn tệ hơn không dựng, vì nó **trông như đã xong**.
⚠ **THÊM MỘT BƯỚC BẮT BUỘC MỚI thì thêm ở `StickmanRecipeBuilder.Build`** — mọi màn dựng bằng
công thức đều được hưởng ngay. Đó chính là điểm của lõi này; nhét vào từng builder là quay
lại đúng chỗ xuất phát.
⚠ Công thức mẫu khai **ĐỦ MỌI TRƯỜNG**, kể cả trường đang để mặc định: người ta sẽ CHÉP nó,
và trường nào không có trong mẫu thì coi như không tồn tại.

**Cả ba lõi đều được `★ KHÁM SỨC KHOẺ DỰ ÁN` canh** (vỏ game chưa dựng / menu không phải
scene 0 / danh sách rỗng / công thức lỗi / công thức chưa dựng thành scene) — đúng LUẬT VÀNG:
việc còn nợ phải ĐO ĐƯỢC trên bảng, không phải nhắc bằng lời.

## ⚠⚠ BỐN THỨ LÀM NÊN "MỘT CON GAME" — NHẠC · THÀNH TỰU · HƯỚNG DẪN · NGÔN NGỮ (2026-09-08)

Trước ngày này dự án có 25 kiểu chơi, 70 vũ khí, 63 scene — và:

| Đo được | Trước | Vì sao không ai thấy |
|---|---|---|
| Nhạc nền | **0 dòng code** (`music` không xuất hiện trong 425 file runtime) | Không có gì HỎNG. Mọi phép đo đều xanh |
| Hướng dẫn người chơi | Chỉ có bảng gỡ lỗi «Hướng dẫn màn này» trong NGĂN KÉO DEV | Người làm game thấy nó mỗi ngày nên tưởng người chơi cũng thấy |
| Lý do chơi tiếp | `PlayerProfile` chỉ nhớ thắng/thua/màn đã qua | Thắng ván thứ ba là hết thứ mới |
| Đa ngôn ngữ | **0 chuỗi** đi qua bảng dịch | Chữ tiếng Việt đóng cứng rải trong 425 file |

Đây là hình dạng chuẩn của một **bẫy im lặng** — chỉ khác là nó ăn vào CẢM GIÁC chứ không
vào logic. Doctor nay có hai phép đo cho nó: `AreaShellContent` và `AreaSceneShell`.

### Một nút, bốn bảng

`★ Bảng điều khiển` → *Vỏ game & Công thức* → **«★ Dựng NHẠC · THÀNH TỰU · HƯỚNG DẪN ·
NGÔN NGỮ»**, rồi **«Vá nhạc + bảng báo + la bàn vào scene đã dựng»**.

| Bảng | Asset | Runtime | Ai gọi |
|---|---|---|---|
| Nhạc | `Resources/StickmanMusicBank.asset` | `MusicDirector` (tự dựng, `DontDestroyOnLoad`) | `MusicCue` lúc mở màn · `MusicBattleDriver` khi đánh nhau · `GameSession.ReportOutcome` khi kết trận |
| Thành tựu | `Resources/StickmanAchievements.asset` | `Achievements` (static) | `SaveSystem.RecordMatch` (ván/thắng) · `ProgressTracker` (giết · số loại vũ khí) |
| Hướng dẫn | `Resources/StickmanTutorial.asset` | `NoticeBoard` | tự chạy bước `OnStart`; code gọi `NoticeBoard.Teach(id)` |
| Ngôn ngữ | `Resources/StickmanLocTable.asset` | `Loc` (static) | mọi chỗ bọc `Loc.T("key", "chữ tiếng Việt")` |

### ⚠ LUẬT SỐ 1 CỦA HỆ DỊCH: TIẾNG VIỆT LÀ THAM SỐ DỰ PHÒNG

`Loc.T("hud.ammo", "Đạn")` — **không** phải `Loc.T("hud.ammo")`.

Vì sao khuôn này chứ không phải khuôn key thuần: bọc một chuỗi mà quên điền bảng thì vẫn ra
đúng tiếng Việt như cũ. Không có đường nào để một lần bọc dở dang làm mất chữ trên màn hình
— nên việc bọc **chia nhỏ được vô hạn**, làm dần từng mảng, và giao được cho AI rẻ tiền.

Bảng dịch sinh **NGƯỢC từ code** (tool quét `Loc.T`/`Loc.F` trong `Assets/Scripts`), không gõ
tay. Quét lại KHÔNG xoá bản dịch đã điền. Hai chỗ dùng cùng key mà khác chữ tiếng Việt thì
tool réo tên file — đó là lỗi sẽ hiện ra sau khi dịch chứ không phải trước.

### ⚠ Thành tựu: bộ đếm ghi đĩa CÓ NHỊP

`Achievements.Count(...)` cộng trong bộ nhớ; chỉ ghi đĩa khi **có mục vừa mở** hoặc khi gọi
`Achievements.Flush()`. Đếm sát thương mà lưu file mỗi đòn là hàng nghìn lần ghi đĩa một
trận — trên điện thoại đó là giật hình thấy được.

Bộ đếm nằm trong hồ sơ dưới dạng **hai mảng song song** (`counterKeys` ↔ `counterValues`) vì
`JsonUtility` không lưu được `Dictionary`. Viết `Dictionary` ở đó thì compile xanh, chạy đúng
suốt phiên, rồi **tắt game là mất sạch** — im lặng.

### ⚠ Đếm công trạng qua ĐÚNG MỘT CỬA

* Ván / thắng: `SaveSystem.RecordMatch` — cửa duy nhất mà cả 25 mode đi qua.
* Giết: `TeamMember.AnyDied` (`ProgressTracker`), **không** rải vào từng đường sát thương.
  Sáu đường gây sát thương (cận chiến · đạn · hitscan · nổ · lửa · phép) mà nhét tay thì bảo
  đảm có chỗ đếm hai lần, có chỗ quên.
* Nhạc thắng/thua: `GameSession.ReportOutcome` — cùng lý do.

### Nhạc: code chỉ VẼ BÙ

Tool sinh 6 file `.wav` dự phòng vào `Assets/Sounds/Music/` **chỉ khi file chưa có**, kèm
`PROMPT_nhac.txt` để đặt nhạc thật bằng Gemini. Thay nhạc = đè file cùng tên, không sửa code.
Đây đúng là luật của `AssetGeneration` áp cho tiếng.

`MusicBattleDriver` đo quanh CAMERA chứ không đo cả map: map vòng dài 200 đơn vị, một trận
đánh ở đầu kia mà đổi nhạc thì nhạc nói dối về thứ đang ở trước mắt người chơi.

## ⚠⚠ CÔNG THỨC JSON NAY BIẾT 8 TRỌNG TÀI, KHÔNG PHẢI 2 (2026-09-08)

Đo trước khi sửa: `SceneRecipe.IsKnownReferee` chỉ nhận `Skirmish` và `None`, trong khi dự án
có **28 lớp kế thừa `MatchModeBase`**. Hệ quả: AI yếu điền JSON chỉ dựng được màn đánh nhau
thường; 26 kiểu còn lại phải viết builder C# và nhớ đúng 11 bước — đúng thứ nó làm sai.

Nay `SceneRecipe.Referees` = Skirmish · None · **Capture · Escort · Deathmatch · LastStanding ·
Hostage · Bomb**, và mảng `objectives[]` (kind: Capture · Waypoint · Hostage · Extraction ·
BombSite) là DỮ LIỆU của mục tiêu. Một chỗ rẽ nhánh duy nhất: `StickmanRecipeBuilder.AddReferee`.

### Luật: thêm mode = thêm nhánh công thức, KHÔNG CHỈ thêm builder
Thêm một `MatchModeBase` mới mà không nối vào `Referees` + `AddReferee` + `ValidateObjectives`
= mode đó chỉ AI mạnh dựng được. Xem `CheapAI.md` §6.

### `Validate` chặn đúng lỗi im lặng đắt nhất của hệ mode
Trọng tài mà thiếu mục tiêu của nó thì **trận không bao giờ kết thúc** — không lỗi nào báo.
Nên mỗi trọng tài đòi đúng loại mục tiêu ngay ở pha kiểm: Capture ≥1 Capture; Escort ≥2
Waypoint; Hostage ≥1 Hostage + ĐÚNG 1 Extraction, `rescuesToWin` ≤ số con tin; Bomb ≥1
BombSite; LastStanding cần `hasPlayer` và `lives ≥ 1` (hồi sinh vô hạn thì `CountRivals()`
không bao giờ về 0).

### Xe hàng xuất phát ở Waypoint đầu — cố ý không có `cartX`
Thêm một trường là thêm một cách để xe đứng một nơi, đường bắt đầu một nơi khác.

### Còn ngoài công thức (cần nội dung riêng, không phải chỉ số)
Boss · zombie theo đợt · thuỷ chiến · doanh trại kinh tế · Tam Quốc · battle royale. Mỗi cái
cần một builder C# — đó là việc của AI mạnh, và phải ghi rõ khi AI yếu hỏi.

## ⚠⚠ NGÔN NGỮ MẶC ĐỊNH CỦA GAME LÀ TIẾNG ANH (2026-09-08)

`Loc.DefaultLanguage = "en"`. Đừng lẫn hai khái niệm:

| | Là gì | Giá trị |
|---|---|---|
| `Loc.BaseLanguage` | chuỗi TRONG CODE viết bằng tiếng gì | `vi` |
| `Loc.DefaultLanguage` | người chơi THẤY tiếng gì khi chưa chọn | **`en`** |

Tách được hai thứ đó là nhờ khuôn `Loc.T("key", "chữ tiếng Việt")` — chú thích, tài liệu và
chuỗi dự phòng vẫn tiếng Việt (người làm game đọc), màn hình thì tiếng Anh.

### Bản tiếng Anh nằm trong CODE, không trong asset

`Assets/Editor/Pipeline/StickmanEnglishStrings.cs` — một `Dictionary<string,string>`. Vì sao không để
trong `.asset`: asset phải mở Unity mới sửa được, còn file code thì sửa bằng trình soạn thảo
(đúng thứ AI rẻ làm được — `CheapAI.md` §7), đi cùng git, thấy trong diff. Tool
«Bảng dịch (quét ngược từ code)» đổ nó vào cột `en` của `LocTable`.

### ⚠ HAI NGUỒN KHOÁ — nguồn thứ hai KHÔNG quét ra được

Máy quét tìm `Loc.T("chuỗi hằng", …)`. Nhưng mẹo hướng dẫn và thành tựu tra bằng khoá **ghép
lúc chạy** (`Loc.T("tut." + step.id, …)`), nên quét không thấy một khoá nào của chúng. Tool
phải nạp thêm từ `TutorialBook` và `AchievementTable` (`AddGeneratedKeys`). Quên bước đó thì
toàn bộ hướng dẫn và tên thành tựu vĩnh viễn ra tiếng Việt mà bảng vẫn báo "đủ".

### ⚠ Máy quét BỎ dòng chú thích

Bản đầu đọc cả file một lần và nuốt luôn **ví dụ trong chú thích của chính `Loc.cs`**
(`Loc.T("hud.ammo", "Đạn")`), đẻ ra hai khoá ma. Khoá ma không làm hỏng gì — nên nó nằm đó
mãi, và mỗi lần soi độ phủ lại báo thiếu bản dịch cho hai thứ không tồn tại.

### Thiếu bản dịch = LỘ TIẾNG VIỆT, Doctor đo

Khoá chưa dịch rơi về chuỗi tiếng Việt trong code. Đúng về kỹ thuật (thà ra chữ Việt còn hơn ô
trống), nhưng với người chơi nước ngoài đó là một dòng chữ lạ. Phép đo Doctor «Chữ LỘ TIẾNG
VIỆT» liệt kê đúng khoá còn thiếu.

## ⚠⚠ BẢNG TRỌNG TÀI — thêm kiểu chơi là thêm MỘT DÒNG (2026-09-08)

Trước hôm nay, cho một mode vào công thức JSON là nhớ sửa **hai** chỗ: nối tên vào
`SceneRecipe.Referees` rồi thêm một khối `if` nữa vào `StickmanRecipeBuilder.AddReferee`.
Quên khối `if` thì công thức nhận tên đó là **hợp lệ** rồi dựng ra một scene KHÔNG CÓ
TRỌNG TÀI: đánh sạch quân địch xong trận vẫn trôi, không có ván sau, **không lỗi nào báo**.
Đo được: 31 mode, công thức biết 8.

Nay ba vế (tên · luật · cách dựng) nằm chung một dòng, nên không còn chỗ để lệch:

```csharp
// Assets/Editor/Modes/StickmanRefereeTable.cs
new RefereeSpec("Capture", typeof(CaptureScoreMode),
    "giữ vùng cộng điểm, đủ `scoreToWin` thì thắng",
    StickmanRefereeBuilds.Capture,
    needs: new[] { "Capture>=1" }),
```

| Vế | Ai đọc |
|---|---|
| `Name` | `SceneRecipe.Referees` (danh sách hợp lệ) + mẫu JSON — **sinh ra**, không gõ tay |
| `Needs` («Capture>=1», «Base==2») | `SceneRecipe.Validate` + bộ sinh mẫu tự thử |
| `Build` | bước 7 của `StickmanRecipeBuilder` |
| `ModeType` | Doctor đối chiếu với mọi class `: MatchModeBase` |

⚠ **Thêm mode mà quên dòng ở bảng** → Doctor «Kiểu chơi vào được công thức JSON» réo tên
class. Cố ý loại thì khai vào `StickmanRefereeTable.NotInRecipe` **kèm lý do thật** — im
lặng bỏ qua thì không. Ba cái đang loại: `CampaignBattleMode` (cần bối cảnh chiến dịch),
`NavalBattle` (cần biển, công thức chỉ tả sân trên bộ), `EconomyRaceMode` (cần một «CampKit»
chưa có — đây là việc CÒN NỢ, không phải kiểu chơi bị loại).

⚠ **Mẫu JSON sinh từ bảng, không viết tay.** Bản cũ là một câu liệt kê tám cái tên; nó đứng
yên trong khi bảng dài ra, nên ai đọc mẫu cũng tin rằng dự án chỉ có tám kiểu chơi. Nút
«4. Tạo công thức mẫu CHO MỌI TRỌNG TÀI» dựng một `SceneRecipe` THẬT rồi `JsonUtility.ToJson`
— mẫu không thể lệch với trường có thật — và chạy `Validate()` trên từng mẫu ngay lúc sinh.
Mẫu nào đỏ nghĩa là **luật trong bảng sai**, không phải mẫu sai.

⚠ Mẫu nằm ở `Assets/Settings/Recipes/_mau/` (thư mục con) nên «Dựng MỌI màn» KHÔNG dựng
chúng — `LoadAll` chỉ đọc `.json` ngay trong `Recipes/`. Chép ra ngoài rồi sửa.

### Loại mục tiêu — thứ CÓ THẬT trong sân, không phải cái nhãn

Trọng tài dựng ra nó rồi cầm lấy làm điều kiện thắng, nên mỗi loại phải có một hình hài:
`Capture` · `Waypoint` · `Extraction` · `BombSite` · `Base` · `Flag` (vùng và đường) ·
`Keep` · `Tower` · `House` · `Cage` · `Gate` (công trình) · `Hostage` · `Boss` · `Champion` ·
`Vip` (người). `y` = 0 nghĩa là đứng trên mặt đất; `team` = 0 nghĩa là để trọng tài tự quyết.
