# TRƯỜNG QUAY — setup asset & quy trình làm video

Hướng dẫn **thao tác**: cài gì, bấm nút nào, đặt file ở đâu để hệ Trường quay ra được video
đăng YouTube Shorts / TikTok / Reels. Luật và bẫy kỹ thuật nằm ở
[Docs/AgentRules/Cinematic.md](../AgentRules/Cinematic.md) — file này không nhắc lại chúng.

> Ai đọc: người dựng video (không cần biết code) và AI rẻ. Mỗi bước có **cách tự kiểm** —
> đừng đi tiếp khi bước trước chưa xanh.

---

## 0. Một phút để hiểu hệ này là gì

Không có "sân riêng cho phim". Máy dựng **đúng cái map người chơi sẽ chơi**, thả AI vào đánh
thật, rồi một máy quay đọc **bảng phân cảnh** để chọn góc. Nên:

- Asset của game đẹp lên ⇒ video đẹp lên, không phải làm gì thêm.
- Thêm một nền văn minh / một kiểu chơi ⇒ số video dựng được **tự lớn lên**.
- Sửa một con số cân bằng ⇒ video phản ánh đúng bản game hiện tại.

Hai đường ra:

| Đường | Ở đâu | Ra cái gì |
|---|---|---|
| **QUAY** | Unity Editor › Bảng điều khiển › 🎬 Trường quay | file `.mp4` trong `Recordings/` |
| **XEM** | trong game, kể cả bản build trên điện thoại | màn hình **Rạp phim** (`CinematicGallery`) |

⚠ Không ghi được `.mp4` từ trong game: Unity Recorder là package **Editor-only**.

---

## 1. Cài Unity Recorder (một lần, chỉ cần cho việc QUAY)

1. `Window > Package Manager` → góc trái `+` → **Add package by name** → `com.unity.recorder`.
2. Mở `Assets/Editor/Xoi.Stickman.Editor.asmdef`, mục **Assembly Definition References** thêm:
   `Unity.Recorder.Editor` · `Unity.Recorder` · `Unity.Recorder.Base`.

**Tự kiểm:** Console không còn `CS0246: RecorderController could not be found`.

Nếu Console báo `MissingReferenceException` cho `CinematicScript` kèm `Invalid GUILayout state` khi
bấm tạo/quay một mẻ, đóng cửa sổ rồi mở lại sau khi Unity import xong asset. Bản hiện tại đã xếp hàng
series bằng path sau sự kiện IMGUI và nạp lại asset sau khi đổi scene; lỗi không được quay lại khi code
được biên dịch/import đầy đủ.

Nếu lượt kế tiếp báo `InvalidOperationException: This cannot be used during play mode` tại
`SaveCurrentModifiedScenesIfUserWants`, Unity vẫn đang chuyển khỏi Play Mode. Hàng đợi hiện tự chờ
đến khi cả trạng thái Play và trạng thái chuyển Play đều tắt rồi mới lưu scene và mở tập tiếp theo.

⚠ Bước 2 **bắt buộc** dù package đã cài và `autoReferenced: true`: tự-tham-chiếu chỉ áp cho
assembly định sẵn `Assembly-CSharp-Editor`, không áp cho asmdef riêng. Thiếu nó thì lỗi hiện ra
như "package cài hỏng", và người ta gỡ ra cài lại mấy lần mà vẫn thế.

---

## 2. Dựng trường quay (một lần)

Bảng điều khiển (`Ctrl+Alt+S`) › tab **🎬 Trường quay** › **«Dựng trường quay»**.

Nó tạo:

| Thứ | Đường dẫn |
|---|---|
| Scene trường quay + **Rạp phim** | `Assets/_Scenes/Demo_72_Cinematic.unity` |
| Kịch bản phim (máy soạn + bạn duyệt; **không có bản mẫu**) | `Assets/Resources/Cinematics/Cine_*.asset` |
| Asset **thương hiệu** + logo vẽ bù | `Assets/Resources/Cinematics/Brand.asset` · `Assets/Art/Brand/Watermark_Stickman.png` |

**Tự kiểm:** mở scene, bấm Play → hiện danh sách phim (Rạp), bấm **▶ XEM** thì phim chạy.

> **Bấm Play thẳng trong scene** (không qua Rạp) thì mỗi lần là **một phim khác** — máy soạn bốc
> lại toàn bộ; `R` = xem bộ khác nữa, `Space` bỏ nhịp, `Esc` dừng. Seed của mỗi bộ in ra Console:
> gặp bộ hay thì dán seed vào ô «Hạt giống sân» của một kịch bản để lấy lại đúng bộ đó.
> Muốn xem đi xem lại ĐÚNG một bản (khi đang chỉnh nó): tắt ô **«Mỗi lần xem một phim khác»**
> trên `CinematicDirector`.

---

## 3. Đặt LOGO và tên kênh (watermark + credit)

Bước 2 đã gắn sẵn **một logo vẽ bù** (stickman vung kiếm trong vòng tròn) để tính năng chạy
được ngay. Thay bằng logo thật bất cứ lúc nào — tool **không bao giờ ghi đè** file đã có.

Mở `Assets/Resources/Cinematics/Brand.asset` trong Inspector:

| Ô | Đặt gì | Ghi chú |
|---|---|---|
| `watermark` | Sprite logo | PNG **nền trong suốt**, cạnh dài ≥ 256 px, vuông hoặc ngang |
| `corner` | `TopLeft` | ⚠ khổ dọc chỉ góc TRÊN-TRÁI là an toàn — xem mục 5 |
| `opacity` | 0.6 – 0.8 | chìm vừa đủ, không tranh chỗ với trận đánh |
| `heightFraction` | 0.05 – 0.08 | cao bao nhiêu phần vùng an toàn |
| `channel` | `@tenkenh` | dòng chữ nhỏ cạnh logo |
| `channelAlways` | bật | hiện suốt phim (tắt = chỉ ở thẻ cuối) |
| `endTitle` / `endSub` | tên hãng ở thẻ cuối | thay `XOIGAME` / `stickman war` |
| `credit` | dòng ghi công | hiện ở thẻ cuối; bỏ trống = không hiện |

### Nhập logo đúng cách

1. Chép file vào `Assets/Art/Brand/` (thư mục tự tạo được).
2. Chọn file → Inspector: `Texture Type = Sprite (2D and UI)`, `Alpha Is Transparency` ✔,
   `Compression = None` (logo nén là chữ rỗ), `Filter Mode = Bilinear` → **Apply**.
3. Kéo Sprite đó vào ô `watermark` (đè lên tấm vẽ bù).

Muốn lấy lại tấm vẽ bù: xoá file `Assets/Art/Brand/Watermark_Stickman.png` rồi bấm
`Tools > Stickman > Nâng cao > Trường quay > 3. Vẽ BÙ logo chìm mặc định`.

**Tự kiểm:** bấm **▶ XEM THỬ** → logo nằm trong khung an toàn (hai vạch xanh), không đè lên
người, không bị cắt mép.

⚠ Đổi logo giữa chừng thì **giữ nguyên** `Brand.asset`, chỉ đổi Sprite bên trong: mọi kịch bản —
kể cả những bộ máy sẽ tự soạn về sau — đọc chung một asset này. Nút «Dựng lại trường quay»
**không ghi đè** `Brand.asset`.

---

## 4. Sinh tiếng phim (một lần)

Bảng điều khiển › **Âm thanh** › «Sinh tiếng BÙ cho khoá còn câm» → tạo 14 file `.wav` trong
`Assets/Sounds/SFX/Cine/`.

**Tự kiểm:** Doctor «Tiếng phim đã sinh chưa» **xanh**.

Thiếu tiếng thì phim **vẫn quay được**, chỉ mất tiếng nhấn — đó là loại lỗi không ai gọi tên
được nhưng ai xem cũng thấy "video này nhạt", và thường chỉ phát hiện sau khi đã đăng.

---

## 5. Khổ video và VÙNG AN TOÀN

Quy trình mới có hai lựa chọn chính trong ô **Kiểu phát hành**:

- **Màn hình ngang · phim dài (16:9):** 1920×1080, khuôn tự soạn 180–300 giây (3–5 phút), giữ đủ mạch phim.
- **Màn hình đứng · Shorts/TikTok (9:16):** 1080×1920, khuôn 59–60 giây, mở nhanh và đuôi gọn.

Khổ vuông 1:1 và dọc 4:5 vẫn đọc được để bảo toàn các asset cũ, nhưng không còn là preset chính.

| Khổ | Pixel | Đăng ở đâu | Máy tự đặt |
|---|---|---|---|
| `Portrait916` | 1080×1920 @ 60 fps | **YouTube Shorts** · TikTok · Reels | dài **59–60 s** · đuôi ≤4.3 s · mở màn 0.35 s |
| `Portrait45` | 1080×1350 | bài đăng dọc Facebook / Instagram | khổ cũ · dài 22–34 s |
| `Square11` | 1080×1080 | bài đăng vuông | khổ cũ · dài 24–38 s |
| `Landscape169` | 1920×1080 | YouTube thường · Facebook | dài **180–300 s** · đuôi đầy đủ |

**Chọn khổ dọc là chọn luôn cả bộ luật short-form** — không có ô "nền tảng" riêng để quên đổi.
Vì sao ba con số đó: Shorts/TikTok chấm bài bằng **tỉ lệ xem hết** và **tự phát lại**, nên (a) mỗi
giây thừa là một cơ hội để người ta lướt, (b) đuôi dài làm vòng lặp gãy, (c) cửa sổ quyết định
nằm trong ~1.5 giây đầu — mở màn từ màn hình đen mất 1.2 giây trong số đó là bỏ phí gần hết.

**Vùng an toàn** là phần khung mà giao diện của nền tảng **không** đè lên. Ở khổ dọc, YouTube
Shorts vẽ đè: cột nút (thích · bình luận · chia sẻ) ở mép **phải ~13%**, tên kênh + tiêu đề +
mô tả ở mép **dưới ~17%**, thanh trạng thái máy ở mép **trên ~5%**.

Máy tự giữ **mọi thứ chữ** (thẻ tựa · phụ đề · bong bóng thoại · logo) trong vùng đó; **hình**
(trận đánh) vẫn dùng cả khung. Lúc **XEM THỬ** có hai vạch xanh mảnh vẽ ra ranh giới — lúc QUAY
thì không.

⚠ Đây là lỗi chỉ lộ ra **sau khi đăng**: trong Unity, trong file `.mp4` và trong mọi trình phát
trên máy tính, chữ vẫn hiện đầy đủ. Duyệt góc quay xong hãy nhìn lại hai vạch xanh một lần nữa.

---

## 6. Quay ra file

1. Bảng điều khiển › 🎬 Trường quay → chọn kịch bản.
2. Chọn **Kiểu phát hành** (ngang phim dài hoặc đứng Shorts/TikTok), rồi đổi **fps** / **hạt giống sân** nếu muốn.
3. **▶ XEM THỬ** để duyệt góc quay — `R` quay lại · `Space` bỏ nhịp · `Esc` dừng.
4. **⏺ QUAY ra .mp4** → file nằm ở `Recordings/` (ngoài `Assets/`, không commit).

Cạnh mỗi video có một file **`.txt` cùng tên** — mở ra là có sẵn **tựa · mô tả · hashtag** để
chép thẳng sang YouTube/TikTok, kèm hạt giống để dựng lại đúng trận đó. Không phải nghĩ tựa nữa.

Quay cả mẻ: **«⏺⏺ QUAY HẾT N kịch bản»**, hoặc khối **Máy quay vô tận** →
**«⏺∞ SOẠN & QUAY N phim»** (máy tự soạn N kịch bản mới rồi quay lần lượt).

⚠ Lúc quay, Editor **giật là bình thường**: Recorder khoá fps để mỗi khung là một bước thời gian
cố định. Xem file, đừng xem cửa sổ.

**Hạt giống sân:** `0` = mỗi lần một sân khác. Số cố định = **quay lại y hệt** — dùng khi muốn
sửa một nhịp rồi quay lại đúng bối cảnh cũ.

---

## 7. Rạp phim trên điện thoại

Cùng scene `Demo_72_Cinematic`, nên **bản build Android/iOS/PC đều có**:

| Nút | Làm gì |
|---|---|
| **▶ XEM** | chiếu bộ đang chọn |
| **▶ XEM TẬP** | với asset có nhãn `Tập n/N`, xem từ tập đang chọn rồi tự chuyển sang tập kế tiếp |
| **🎲 PHIM MỚI** | máy soạn một bộ **hoàn toàn mới** rồi chiếu ngay |
| **▶▶ CHIẾU LIÊN TỤC** | soạn phim mới nối nhau không dứt (máy trưng bày, livestream) |
| **⟳ NẠP LẠI KHO** | đọc lại `Resources/Cinematics` |

Đang xem: **nút Back** (Android) hoặc **chạm hai lần** để về danh sách. Khổ tự chọn theo màn
hình đang cầm, không theo khổ lưu trong asset.

### 7a. Sản xuất một bộ phim nhiều tập

Trong cửa sổ **🎬 Trường quay**, chọn kịch bản gốc rồi ở khối **🎞 Bộ phim nhiều tập** chọn số
tập (2–30) và bấm **TẠO & QUAY N TẬP**. Máy lưu các asset `Cine_Auto_Series_*_E01ofNN` vào
`Resources/Cinematics/`, giữ cùng hai phe/cốt truyện/thế giới, sinh seed mới ổn định cho từng
tập, sau đó Recorder quay lần lượt. Rạp nhận diện `seriesId` và khi bấm **▶ XEM TẬP** sẽ tự
chiếu tiếp cho đến tập cuối; phim đơn không bị ảnh hưởng.

Tập 1 là bản kịch bản gốc; từ tập 2, máy tự viết lại bảng phân cảnh theo cùng kịch bản để tránh
các tập giống hệt nhau. Kịch bản `Custom` giữ nguyên nhịp người dùng viết, chỉ đổi seed sân.

---

## 8. Vô tận kịch bản — máy soạn dựa vào đâu

Máy soạn (`CinematicAutoWriter`) **đọc asset đang có lúc chạy**, không có bảng tên nào chép cứng.
Bảy trục nhân với nhau:

| Trục | Lấy từ đâu | Thêm asset thì sao |
|---|---|---|
| Cốt truyện (28) | `CinematicScenario` | thêm kiểu chơi ⇒ thêm cốt truyện |
| Thời kỳ (≤4) | `MapLibrary.kits` | thêm bộ trang bị ⇒ thêm thời kỳ |
| Cặp nền văn minh `n×(n−1)` | `CivilizationLibrary` | **thêm 1 nền ⇒ số cặp tăng ~2n** |
| Trục kịch tính (6) | `CinematicArc` | kể thẳng · kèo dưới · báo thù · phản bội · truyền thuyết · lời cuối |
| **Kiểu nhìn (2)** | `ViewPlane` | sân ngang · **sân 3/4 beat-em-up** — xem mục 8b |
| Nhịp dựng (3) | dồn dập · điềm đạm · trailer | |
| Chuyển cảnh + hạt giống sân | sân · thời tiết · quân số · lời thoại | |
| Lượt biên tập nội dung | logline · câu hỏi · mục tiêu · bước ngoặt · cao trào | cùng seed ⇒ cùng mạch chữ/tiếng |
| Nguồn biên kịch | `CinematicWritingMode.Algorithm` hoặc `.Ai` | biết asset do máy offline hay AI lắp |

Cửa sổ 🎬 in ra **con số tổ hợp thật** để câu "bao giờ hết kịch bản" có câu trả lời đo được.

### 8a. Mỗi video là một câu hỏi và một câu trả lời

Máy tự cắm hai thứ vào mọi phim, không phải khai gì:

| Chỗ | Cái gì | Dựng từ đâu |
|---|---|---|
| Mở màn | **Câu móc** — "20 NGƯỜI vs 20 NGƯỜI — AI CÒN ĐỨNG?" | quân số · tên hai nền văn minh · trục kịch tính |
| Trước thẻ logo | **Thẻ kết quả THẬT** — "NHÀ TỐNG THẮNG · còn 4 người · 21 mạng · 34 giây" | trọng tài của chính trận đó |

Trận chưa ngã ngũ thì thẻ kết quả nói tình hình đang có ("12 · 3 còn đứng") — **không bịa ra
người thắng**, vì người xem đếm được người còn đứng ngay trong khung hình.

### 8a.1. Đạo diễn tự động theo 5 hồi

Máy không chỉ bốc một mẫu rồi kéo dài thời gian. Sau khi chọn cốt truyện, thời kỳ, hai phe,
trục kịch tính và kiểu nhìn, `CinematicAutoWriter.Story` đọc các mốc thật trong storyboard để
đặt lại nhịp kể:

`MÓC → MỤC TIÊU → VA CHẠM → BƯỚC NGOẶT → CAO TRÀO → KẾT QUẢ`

Mỗi bản sinh được ghi `logline` và `storyQuestion` vào asset. Caption mục tiêu xuất hiện sau thẻ
tựa, bước ngoặt xuất hiện sau cú va chạm đầu tiên, còn cao trào đi cùng Riser và mood Danger.
Tiếng va chạm được chọn theo loại nhiệm vụ (kiếm, đám đông hoặc bầy gầm), nên hình–tiếng–chữ
cùng hướng về một sự kiện thay vì ba lớp rời nhau. Các mẫu cũ có thể chọn **🎬 Đạo diễn lại nội
dung + cân nhịp** trong cửa sổ Trường quay.

Ở preset ngang, một cảnh Action bị kéo quá dài được tự chia thành montage Action–cutaway–Action
và thêm WhipPan/Flash cùng Sfx. Tổng thời lượng không đổi, nhưng khung hình không bị đứng im một
góc trong hàng chục giây.

Sau đó pass `CinematicAutoWriter.Visuals` kiểm tra độ phủ hình: nếu storyboard thiếu thì tự thêm
toàn cảnh đọc sân, một cú lia nối địa lý, một cú bám tiền tuyến, punch-in ở cao trào và Static
cutaway cho phim ngang. Nó cũng xếp cue mở màn, trống trước cao trào và sting kết. Các shot mới
được cân lại trong cùng `FitDuration`, nên không làm preset dài hơn.

`CinematicScript.visualMood` chọn không khí Dawn/Storm/Fire/Arcane/Night/Victory/Defeat. Khi chạy,
`CinematicLook` phủ ambient wash, vignette, grain và pulse theo hiệu ứng âm thanh lên
`CinematicOverlay`; đây là lớp GI-lite tương thích Built-in RP. Project hiện chưa bật URP nên
không tự đổi pipeline để tạo 2D GI thật; phần đó vẫn dùng `Tools > Stickman > Lighting` khi dự án
được phép chuyển sang URP.

### 8a.1b. Preset phim trường và timeline đạo diễn

Mở **🎬 Timeline đạo diễn + checklist** từ cửa sổ Trường quay, hoặc vào menu
`Tools > Stickman > Nâng cao > Trường quay`. Có 8 preset sân/không khí dùng chung map thật:

| Preset | Ý đồ |
|---|---|
| `DawnMeadow` | đồng cỏ sáng, sạch, giới thiệu hai phe |
| `NightForest` | rừng đêm, sương/đom đóm, ám sát |
| `BurningVillage` | làng thu, tàn lửa, raid/công phá |
| `StormFront` | giông bão, tương phản lạnh, chiến trường |
| `ArcaneRift` | núi lửa/hẻm núi, tro, Fantasy |
| `SnowSiege` | pháo đài tuyết, bão tuyết, tử thủ |
| `DesertAmbush` | hẻm cát, bụi, phục kích |
| `WuxiaMoonlight` | rừng đêm, grade lạnh, song đấu kiếm hiệp |

`Auto` không đổi asset cũ. Preset cụ thể chỉ ghi biome/địa hình/đêm-thời tiết/grade vào
`CinematicScript`, sau đó vẫn đi qua `MapDefinition` và `MapAssembler`; nó không tạo một sân
giả tách khỏi gameplay. Timeline hiển thị từng nhịp, 6 hồi và tổng giây. Checklist bắt các lỗi
thường chỉ thấy sau khi quay: thiếu Establishing/Action/Verdict/End, thiếu cue tiếng, sai khuôn
thời lượng, grade/preset hỏng và số tập không hợp lệ.

Checklist không còn là danh sách bắt người dùng sửa tay. Nút **🤖 Tự sửa checklist bằng thuật
toán** gọi `CinematicAutoWriter.AutoRepairForProfile`: tự tạo Title/Shot/Verdict/End khi thiếu,
đưa `AllowVerdict` về đúng trước kết quả, cấp giây cho mọi Shot 0 giây, bù nhịp hình–tiếng và
chạy lại cân thời lượng. Pass này giữ shot/thoại/lệnh đã có, có thể bấm lặp lại không nhân đôi,
và Recorder cũng tự gọi nó trước khi mở scene.

`WaitUntil` vẫn đồng bộ theo sự kiện thật, nhưng khi sự kiện tới sớm nó giữ nốt phần thời gian
đã cấp cho cảnh. Vì vậy `EstimatedSeconds` và file `.mp4` không còn chênh lớn chỉ vì AI va chạm
nhanh hơn dự kiến; bấm Space vẫn bỏ qua nhịp như trước.

### 8a.2. Hai cách viết: thuật toán hoặc AI

Cửa sổ 🎬 ghi nguồn vào `CinematicScript.writingMode`:

- **Thuật toán offline** (`Algorithm`): `CinematicAutoWriter` chọn cốt truyện, nền văn minh,
  trục kịch tính, nhịp dựng và seed. Cùng seed cho cùng storyboard; không cần mạng.
- **AI biên kịch** (`Ai`): bấm **📋 Sao chép prompt AI**, đưa prompt vào AI, yêu cầu trả đúng
  JSON, sao chép JSON về clipboard rồi bấm **📥 Lắp JSON AI từ clipboard** để ghi đè asset đang
  chọn, hoặc **📥 Tạo asset AI mới** để giữ nguyên asset mẫu và lưu bản mới trong
  `Resources/Cinematics`.
- **AI từ cuộc hội thoại dự án**: khi bạn nhắn yêu cầu trong project chat, storyboard JSON được
  ghi vào `Assets/Resources/Cinematics/CinematicAiProjectInbox.json`. Xưởng phim hiện **📡 Lắp
  từ project inbox** hoặc **📡 Tạo asset từ inbox**; nội dung đi qua cùng một bộ kiểm tra và cân
  thời lượng, không có API key trong Unity.

Prompt đã gửi kèm khổ, thời lượng, nhiệm vụ, phe, mặt sân, logline và câu hỏi trung tâm. AI chỉ
điền `title`, `logline`, `storyQuestion`, `arc`, `visualMood`, `setPreset` và mảng `beats`; `CinematicAiBridge` kiểm tra
toàn bộ enum, bỏ dữ liệu lỗi trước khi ghi, bảo đảm có `Title`/`Verdict`/`End`, thêm lệnh cho
trọng tài nếu cần, rồi gọi `AutoRepairForProfile` (pass này bao gồm `FitToProfile`). Vì vậy một AI viết 17 giây cho preset dọc hoặc 90
giây cho preset ngang cũng không tạo video hụt: Unity kéo các nhịp trôi về **59–60 giây** hoặc
**180–300 giây**, còn nội dung AI vẫn được giữ.

Đây là cầu AI không phụ thuộc nhà cung cấp: không khóa Unity vì HTTP, không cất API key trong
project, và JSON đã nhập nằm trong asset nên có thể sửa, undo, dựng series hoặc quay lại cùng
storyboard.

Timeline có quy trình AI hai bước: **Copy prompt DÀN Ý** để AI chốt logline, câu hỏi, 6 hồi,
motif hình ảnh, sound plan và mầm tập sau; dán dàn ý đã duyệt vào xưởng; rồi **Copy prompt
STORYBOARD từ dàn ý** để AI chuyển từng hồi thành Shot/Caption/Say/Sfx JSON. Đây là cách giữ
nội dung liền mạch thay vì hỏi AI sinh một danh sách shot rời rạc. AI của cuộc hội thoại dự án
vẫn có thể ghi storyboard JSON vào project inbox như quy trình trên.

### 8c. Máy tự bình luận trận đấu

Trong lúc quay, phim theo dõi trận thật và thả một dòng phụ đề khi có chuyện đáng nói:

| Máy nói khi | Câu |
|---|---|
| chủ tướng một phe ngã | `CHỦ TƯỚNG {tên phe} ĐÃ NGÃ` |
| một người hạ ≥3 mạng trong 8 giây | `MỘT MÌNH BA MẠNG` |
| một phe còn đúng 1 người (từng ≥4) | `{tên phe} CÒN MỘT NGƯỜI` |
| một phe mất >70% quân | `{tên phe} VỠ TRẬN` |
| phe đang thua vươn lên dẫn | `{tên phe} LẬT KÈO` |

Mỗi loại nói **đúng một lần**, cách nhau tối thiểu 5 giây, và **im hẳn** từ thẻ kết quả trở đi.
Không có câu nào "cho có không khí" — mỗi câu buộc vào một phép đo trên trận thật.

Kèm **bảng tỉ số sống** ở đỉnh khung (`12 · 9`, màu theo phe). Ở loạn chiến / battle royale nó tự
đổi thành `CÒN 12` vì ở đó mỗi người một phe. Tắt ở `Brand.asset` → `showTally`.

### 8b. Quay ở view 3/4 (beat-em-up)

Sân 3/4 (`ViewPlane.Ground`): X **và** Y đều là mặt đất, **không có độ cao**, không trọng lực.
Nhân vật vẫn là hình ngang quay trái/phải như cũ — rig · ragdoll · animation · art dùng lại
nguyên vẹn.

**Vì sao nó hợp video ngắn:** hai bên **vòng ra sau lưng nhau** được, nên khung hình lúc nào
cũng có người ở nhiều lớp. Sân ngang thì tất cả xếp thành đúng một hàng, và cảnh nào cũng
giống cảnh nào.

| Cách dùng | Thao tác |
|---|---|
| Một kịch bản **luôn** ở 3/4 | chọn cốt truyện **ẨU ĐẢ** (`Cine_AuDa_3phan4`) |
| Đổi một kịch bản có sẵn sang 3/4 | Inspector → `plane = Ground`, chỉnh `halfDepth` (7–12) |
| Để máy tự bốc | máy soạn tự đổi ~30% các cốt truyện hợp lệ sang 3/4 |

⚠ **Cốt truyện nào sống bằng CHIỀU CAO thì ở lại sân ngang** — công thành, vây thành, tử thủ
trên tường, hầm ngục nhiều tầng, săn rồng (rồng BAY). Ép sang 3/4 không nổ, không lỗi: nó chỉ
dựng ra một trận đánh thiếu mất cái làm nên trận đó. Danh sách được phép:
`CinematicAutoWriter.CanFilmOnGround`.

⚠ Đặt `plane = Ground` là **bục · thang · hố · đồi · nối vòng tự tắt** (`MakeGroundField`) —
khai chúng trong Inspector cũng không có tác dụng, đừng mất công.

**Muốn nhiều video hơn thì thêm asset, không phải thêm code:** một nền văn minh mới, một bộ
trang bị thời kỳ mới, một kiểu chơi mới — cả ba đều tự chảy vào máy soạn.

---

## 9. Hỏng thì xem ở đây

| Triệu chứng | Nguyên nhân thường gặp | Sửa |
|---|---|---|
| Bấm QUAY không ra file | chưa cài Recorder / chưa khai asmdef | mục 1 |
| Video **không thấy nhân vật**, toàn trời | cảnh khai `width` quá lớn | hạ `width` của nhịp đó; trần cỡ nhìn đã tự chặn để người luôn cao ≥ 105 px |
| Camera nhìn vào **bãi đất trống** | (đã sửa) máy quay đo theo bề ngang map | cập nhật code mới nhất — nay đo theo **dải có người** |
| Chữ bị nút của YouTube che | chữ nằm ngoài vùng an toàn | mục 5 |
| Video **câm tiếng nhấn** | chưa sinh `Cine/*` | mục 4 |
| Mạch phim **rời rạc / chỉ đánh nhau** | asset cũ chưa có lớp biên tập | bấm **🎬 Đạo diễn lại nội dung + cân nhịp** hoặc sinh lại kịch bản tự động |
| Muốn tự viết bằng AI | chưa có storyboard đúng schema | chọn **AI biên kịch**, sao chép prompt, dán JSON rồi bấm **Lắp JSON AI** |
| AI trả Markdown / thêm lời giải thích | JSON có fence hoặc prose | cầu AI tự bóc JSON; nếu enum/số nhịp sai, Unity báo nhịp lỗi và không ghi asset |
| Video **hết sớm hơn khuôn** | cảnh Action = 0 hoặc WaitUntil kết thúc ngay khi bắt được mốc | cập nhật code mới; máy đã cấp thời gian tối thiểu và giữ phần còn lại của nhịp |
| Có nút ⚙ / thanh máu trong khung | HUD mới thiếu cổng `StickmanUI.Filming` | Doctor «HUD chưa câm khi quay phim» |
| Kiểu chơi mới không bao giờ lên video | chưa có cốt truyện dùng `MissionType` đó | Doctor «Kiểu chơi nào chưa có cốt truyện phim» |
| Ngựa chìm dưới đất | (đã sửa) đo `GroundOffset` khi vật lý chưa đồng bộ | cập nhật code mới nhất |
| Đầu video có **một khung menu** | (đã sửa) cờ câm HUD bật trễ một frame | cập nhật code mới nhất |
| Khổ dọc có **hai thanh đen** trên/dưới | (đã sửa) letterbox nay chỉ dành cho khổ ngang | cập nhật code mới nhất |
| Bàn chân nhân vật nằm sau chữ của YouTube | (đã sửa) khung hình nay đo từ đáy VÙNG AN TOÀN | cập nhật code mới nhất |
| Video không có logo | `Brand.asset` chưa gắn `watermark` | mục 3; Doctor «Logo chìm của video còn trống» |
| Phim hết, **bấm R không quay lại** | (đã sửa) van `_run == null` chặn luôn cả phím R | cập nhật code mới nhất |
| Phim hết, màn hình **đen thui** | (đã sửa) xem thử nay tự mở màn lại; lúc ghi vẫn giữ màn đen | cập nhật code mới nhất |
| Muốn xem lại ĐÚNG bộ vừa xem | mỗi lần Play là một bộ mới | tắt «Mỗi lần xem một phim khác», hoặc dán seed in ở Console |
| Kịch bản mới không hiện trong bảng chọn | asset không nằm trong `Resources/Cinematics/` | chép vào đó |

---

## 10. Thêm một cốt truyện mới (cho người biết code)

Bảng nối đủ chỗ nằm ở [Cinematic.md § Thêm](../AgentRules/Cinematic.md). Tóm tắt: một giá trị
`CinematicScenario` + một hàm trong `CinematicTemplates.Wave3.cs` + một `case` trong `Fill` +
một dòng `CinematicAutoWriter.Deck` (bảng mẫu `StickmanCinematicBuilder.Samples` đã xoá 2026-09-15).

Quên chỗ nào thì **Doctor réo** — không có chỗ nào hỏng trong im lặng.

## ⚠⚠ CỠ GAME VIEW LÀ MỘT MẮT XÍCH RIÊNG (2026-09-15)

Code: `Assets/Editor/Cinematic/StickmanGameView.cs`.

`CinematicWindow.Resolution` tính đúng 1080×1920 và đưa cho Recorder — **nhưng không ai đổi cỡ
Game view**. Game view còn 16:9 thì `CinematicFrame.ViewportFor` vẽ khung dọc thành một **dải
hẹp kẻ viền đen giữa màn hình ngang**: phim đúng khổ trên giấy, sai khổ trên mắt. Và nếu
Recorder chụp Game view thì file `.mp4` cũng ra đúng như vậy.

> User 2026-09-15: *"không phải là màn hình dọc quay video tiktok như tôi mong muốn"*.

⚠⚠ **Một giả định được ghi ra rồi để đó vẫn là một giả định.** Chính `Cinematic.md` mục «Bẫy đã
đoán trước» đã ghi câu hỏi *"`GameViewInputSettings` có tự đổi cỡ Game view sang 1080×1920
không"* từ **2026-09-09**, và câu trả lời suốt sáu ngày sau đó là **KHÔNG** — vì không có gì đi
hỏi nó. Viết câu hỏi vào luật không thay được một phép đo hay một mắt xích.

⚠ **Phải dùng reflection**: `GameViewSizes` · `GameViewSize` · `GameView` đều `internal` trong
`UnityEditor`, không có API công khai nào đặt cỡ Game view. Mọi lỗi ở đó **chỉ cảnh báo, không
ném** — đổi cỡ màn xem thử mà hỏng thì không đáng để hỏng cả mẻ quay.

Nút: cửa sổ Trường quay đặt cỡ trước khi bấm ghi; 1080×1920 cho phim dọc, 1920×1080 cho ngang.