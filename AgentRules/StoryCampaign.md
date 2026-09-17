## ⚠⚠ CỐT TRUYỆN THANG BẬC — mỗi chế độ chơi là MỘT GAME có mở bài · thân bài · kết luận · intro (2026-09-13)

User: *"các chế độ game hiện tại đang không có cốt truyện và điều kiện thắng thua hoàn chỉnh…
dựng sao cho thành một game hoàn chỉnh có mở bài, thân bài, kết luận và có intro; thiết kế map
phù hợp từng loại game"*. Đo trước khi sửa:

| Đo (2026-09-13) | Số | Nghĩa |
|---|---:|---|
| Thang bậc 12 chặng cho mỗi kiểu chơi (`LevelCampaignWriter`) | 27 | đã có |
| Lời dẫn từng chặng | câu MÁY suy từ ngưỡng | đúng, không phải chuyện |
| Gói có mở bài / kết luận | **0** | bảng kết gói in lại câu bán game |
| Chặng gói game chạy trên sân map mà `GamePackRunner` NGHE được kết trận | **3/28** | ← lỗ hổng gốc |

Vế cuối là lý do "thắng thua không hoàn chỉnh": sân map (`Demo_29..31/63/70..73`) dùng trọng
tài **`MatchDirector`** (tầng Map), còn người chạy gói chỉ nghe `MatchModeBase.AnyFinished`.
Với mọi map không khai `attachMode`, thắng xong **không sang chặng · không ghi hồ sơ · không nhạc
· không nút đi tiếp** — chỉ có một băng-rôn của `MatchDirector` và nút «CHƠI LẠI» của sân.

### Bốn mảnh, và mảnh nào cũng là DỮ LIỆU hoặc một cửa duy nhất

| Mảnh | Ở đâu | Việc |
|---|---|---|
| Cốt truyện | `Assets/Resources/StoryArcs/*.json` (một kiểu chơi một khối `arcs[]`) | mở bài · 3 hồi × 4 nhịp · kết thắng · kết thua · bối cảnh từng hồi |
| Tên theo thời kỳ | `Assets/Scripts/Map/Story/StoryCast.cs` | điền `{HERO}` `{FOE}` `{PLACE}` lúc SOẠN; `{A}` `{B}` (tên phe) để `SagaLines.Fill` điền lúc HIỆN |
| Đan vào gói | `LevelCampaignWriter.Build` → `WeaveStory` | `GamePackStage.act · actTitle · outcome · biome · weather · night`; `GamePack.prologue · epilogueWin · epilogueLose · hero · foe` |
| Hiện ra | `StoryIntroHud` (mở bài/mở hồi, CHẶN LUỒNG, nút ▶) · `GamePackRunner.Story.cs` (bảng KẾT CHẶNG có «Chặng tiếp ▶» · lời kết gói · «Về menu») | |
| Trọng tài sân map | `MatchDirector.AnyEnded` (tĩnh) → `GamePackRunner.HandleFinished` | ghi `GameRun.RecordResult` · `SaveSystem.RecordMatch` · nhạc · bảng thưởng KHI scene không có `GameSession` |

### Luật

- **Cốt truyện là JSON, viết MỘT LẦN cho cả bốn thời kỳ.** 28 × 4 bản là thứ không ai duy trì.
  Chữ dùng ô trống; tên riêng và địa danh do `StoryCast` chọn TẤT ĐỊNH theo (thời kỳ × kiểu chơi)
  — `Build` phải thuần, bốc ngẫu nhiên là tên nhân vật đổi giữa chặng 3 và 4.
- **3 hồi × 4 nhịp = `LevelLadder.MaxLevel`.** Đổi số bậc thì viết thêm nhịp; thiếu nhịp thì chặng
  ấy rơi về tên bậc + câu máy (không sập). Hồi 1 **ban ngày, không thời tiết dữ** — bậc thấp là bài
  dạy chơi (`Levels.md`). Bối cảnh hồi đi qua `GamePackStageDress` nên `biome`/`weather` phải là tên
  enum thật.
- **Lời dẫn chặng = câu truyện + câu máy** (dòng dưới). Bỏ câu máy là mất thông tin "bậc này vừa mở
  khoá cái gì" — thứ người chơi cần để không ngã xuống hồ ở bậc 9.
- **Intro chặn luồng CHỈ ở chặng mở hồi** (`GamePack.OpensAct`) và chặng đầu có mở bài; chặng khác
  dùng `SagaBriefHud` 8 giây. Không bao giờ mở cả hai. Thua rồi chơi lại đúng chặng: không mở lại
  (`IntroShown`); mở gói lại từ bảng chọn: `ForgetIntros`.
- **Dừng trận thì trả đúng nhịp:** `StoryIntroHud` nhớ `timeScale` + `HitStop.RestoreScale` rồi trả
  y nguyên — đặt cứng về 1 là xoá luật «tua nhanh». `Filming` bật thì tự tắt, không dừng.
- **Một cửa kết trận:** cả `MatchModeBase.AnyFinished` lẫn `MatchDirector.AnyEnded` đều đổ vào
  `HandleFinished`; `_advancedThisMatch` chốt. Ghi tầng game CHỈ khi `GameSession.Current == null`
  (scene có `GameSession` đã ghi ở `ReportOutcome`) — hai lần là đếm thành tựu đôi.
- **`MatchDirector` nhường bảng kết quả** khi `GamePackRun.Active || Finished` — hai bảng chồng
  nhau là bẫy «một cạnh màn hình hai chủ» (`UI.md`).
- **Sân map ẩn thanh «Chọn map · Map mới · CHƠI LẠI» khi có gói đang chạy** (`MapArena.DrawControlBar`):
  dựng lại ván giữa gói là một ván lệch kiểu chơi với con trỏ chặng. Phím F5/N còn: `WatchForRematch`
  — vừa thua thì mở lại chốt (đúng là chơi lại chặng), vừa thắng thì nạp thẳng sân chặng sau.
- **Hết gói thì về `Menu_Main`** (`Application.CanStreamedLevelBeLoaded` — không có scene menu thì
  chỉ bỏ gói). Đứng lại giữa sân với gói đã đóng là ngõ cụt.
- Phần thưởng chuyến đi trên sân map: `RunPerkPicker` cắm lúc kết trận nếu có lá chờ; `RunPerkBinder`
  cắm SAU khi `MapArena.Current` có giá trị (áp ở `Start` một lần — cắm sớm là áp vào sân trống).

### Thêm / sửa cốt truyện

1. Mở file JSON theo nhóm (`_Field` · `_Journey` · `_Champions` · `_Dark`), chép khối gần nhất.
2. `mission` = tên `MissionType`; 3 `acts`, mỗi hồi `title · biome · weather · night · outcome ·
   beats[4]{title, brief}`; `heroRole`/`foeRole` là VAI («Người dẫn đoàn»), tên riêng máy ghép.
3. Không mở Unity: kiểm bằng Doctor nhóm «Cốt truyện» (4 phép đo: phủ · cấu trúc · đan vào gói ·
   nối dây) — hoặc `python` đọc JSON đối chiếu enum như Doctor làm.
4. Phố mở (`OpenWorldCity`) cố ý không có cốt truyện — không phải một chặng.

### Còn nợ

- Văn bản cốt truyện là tiếng Việt (như ba gói gốc); bản tiếng Anh chưa có — chuỗi giao diện đã bọc
  `Loc.T` (`story.*`), nội dung thì chưa.
- Gói viết tay / từ kịch bản (`GamePacksExtra.json`) có thể khai `prologue · epilogue* · act` — chưa
  gói nào khai; skill `stickman-story` nên điền khi dựng game từ kịch bản.
