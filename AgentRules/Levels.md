### ⚠⚠ THANG BẬC MÀN — LEVEL DESIGN CHO MỌI CHẾ ĐỘ CHƠI (2026-09-12)

User: *"thêm level design cho tất cả chế độ chơi để sau này làm game hoàn thiện từ level thấp
tới level cao; level thấp thì map đơn giản, level cao thì khó hơn và map phức tạp hơn"*.

Đo trước khi làm:

| Đo (2026-09-12) | Số | Nghĩa |
|---|---:|---|
| `MissionType` (kiểu chơi dựng được lúc chạy) | 28 | |
| bậc khó `GameRun.Tier` | 5 | CHỈ đổi quân địch |
| chỗ bậc khó chạm vào **hình dáng map** | **0** | ← chỗ hỏng gốc |
| `GamePackStage.tier` ép bậc khó cho một chặng | có ô | `GamePackRun.ForcedTier()` **KHÔNG AI GỌI** |
| chuỗi màn dễ → khó của một kiểu chơi | **0/28** | |

Dự án có **độ khó** nhưng chưa có **thiết kế màn**: bậc 0 và bậc 4 dựng ra cùng một cái sân —
cùng bấy nhiêu bục, cùng bấy nhiêu vật chắn, bốc ngẫu nhiên trong cùng một khoảng. Leo hết
thang mà không bao giờ thấy một cái map khác trước.

### Một bậc = HAI con số, và cố ý chỉ hai

`Assets/Scripts/Core/Run/LevelLadder.cs` — `LevelPlan { level, tier, complexity }`.

| Con số | Đi tới đâu | Thành cái gì |
|---|---|---|
| `tier` 0..4 | `GameRun.Tier` → `GameDifficulty.For` | cấp AI · quân số hai phe · cấp vũ khí địch · giờ trận |
| `complexity` 0..1 | `MapGenerator.Fill` → `MapBlueprint.Apply` → `MapLevelShape` | bề ngang · dáng địa hình · đồi · bục · thang · vật chắn · hồ · sông · ba tầng · ngày đêm |

12 bậc. Bậc 1–2 nấc «Dễ», 3–5 «Thường», 6–8 «Khó», 9–11 «Rất khó», 12 «Địa ngục»; độ rắc rối
trải 0.00 → 1.00 (bảng `Tiers`/`Complexities` là **nguồn sự thật**).

⚠⚠ **THANG NẰM Ở CORE NÊN NÓ KHÔNG BIẾT `MissionType`** (module 6) — cùng lý do
`GamePackStage.mission` là một CHUỖI. Chia việc: **Core giữ ĐƯỜNG CONG, Map giữ HÌNH DÁNG.**
Muốn "map cướp cờ ở bậc cao khác map hộ tống ở bậc cao" thì sửa `MapBlueprint.Spec` của kiểu
chơi ấy — nhét một bảng theo kiểu chơi vào `LevelLadder` là dự án có HAI bảng nói về hình dáng
map, và chúng lệch nhau ở lần sửa thứ nhất.

### Độ rắc rối đi vào map bằng HAI cách

`Assets/Scripts/Map/Build/MapLevelShape.cs`

1. **LỆCH CÁI VÒI BỐC SỐ.** `MapBlueprint.Spec` đã khai sẵn KHOẢNG cho mọi con số của từng kiểu
   chơi (bề ngang 24–34, bục 1–4…). Chơi tự do thì bốc đều; theo bậc thì bốc lệch — bậc 1 sát
   mép dưới, bậc 12 sát mép trên. **Thay cái vòi, không thay bảng**: thêm bậc hay đổi cả đường
   cong không đụng một dòng nào của bảng luật map.
2. **MỞ KHOÁ THEO NGƯỠNG**, cho những thứ "có hay không":

| Ngưỡng | Mở ra |
|---:|---|
| 0.20 | THANG leo lên bục |
| 0.30 | tự suy MỐC PHỤC KÍCH từ địa hình (chỗ nằm phục · chỗ bắn tỉa) |
| 0.55 | SÔNG chắn ngang sân 3/4 (cầu + bến lội) |
| 0.62 | một vòng NGÀY/ĐÊM trôi qua trong trận |
| 0.72 | HỒ NƯỚC + cầu (1 hồ; từ 0.90 là 2) |
| 0.80 | BA TẦNG — mái để bắn xuống, cống ngầm để đi vòng (cần nửa rộng ≥ 26) |
| 0.90 | MỞ MÀN TRONG ĐÊM |

⚠⚠ **KHÔNG CÓ NGƯỠNG "KHE VỰC", và đừng thêm.** `MapGenerator.Sanitize` đặt `pitCount = 0` cho
**mọi** kiểu chơi ngay dòng đầu ("hố không cầu chỉ có một kết quả: hai phe dí nhau ở hai bờ"),
và đo 2026-09-12 thì **0/28** bảng `MapBlueprint.For` khai hố > 0. Một ngưỡng khe vực vì thế
KHÔNG BAO GIỜ bật — nó chỉ *trông như* một tính năng. Trục "chỗ hẹp bắt buộc phải qua" của dự
án là HỒ + CẦU (sân ngang) và SÔNG + BẾN LỘI (sân 3/4): cả hai đều có đường qua nên map khó ĐI
mà không bế tắc.

⚠⚠ **BẬC THẤP PHẢI TẮT, KHÔNG CHỈ "ÍT ĐI".** Bậc 1 mà vẫn có một cái thang và một chỗ phục kích
thì nó chỉ là bậc 6 nhỏ hơn, không phải MỘT BÀI DẠY CHƠI.

⚠⚠ **SÂN 3/4 BỊ SAN PHẲNG SAU ĐÓ.** `MapGenerator.ApplyGroundPlane` chạy sau `Sanitize` và đặt
lại địa hình · đồi · hố · hồ · bục · thang · ba tầng về 0 cho mọi map mặt đất (trừ Phố mở) — đó
là luật của kiểu nhìn ấy. Nên sân 3/4 có trục rắc rối RIÊNG, `MapLevelShape.ApplyGround`: **BỀ
SÂU** (70% → 100% khoảng của công thức) và **CON SÔNG**. Quên vế đó là leo 12 bậc trên sân mặt
đất mà sân nào cũng y hệt nhau, và không lỗi nào báo.

⚠ **THỨ TỰ:** `MapBlueprint.Apply` (bốc số + luật riêng của kiểu chơi) → `MapLevelShape.Apply`
(bậc nói câu áp chót) → `Sanitize` (lưới an toàn cuối, nói câu cuối) → `ApplyGroundPlane`.
Bậc màn cố ý bật thứ rắc rối mà KHÔNG hỏi kiểu chơi có chịu được không; `Sanitize` mới là chỗ
gỡ những tổ hợp chơi không được.

⚠ **XÊ DỊCH ±0.14** (`MapLevelShape.Jitter`) giữ nguyên: hai ván cùng bậc phải khác nhau, không
thì bậc 3 chơi mười lần là mười cái map giống hệt. Lệch là XÊ DỊCH TRUNG TÂM, không đóng băng.

### Một thang cho mỗi chế độ — gói game SOẠN, không viết tay

`Assets/Scripts/Map/Story/LevelCampaignWriter.cs`

Thang bậc **là một `GamePack`**: mã `lv_<kiểuchơi>_<thờikỳ>`, 12 chặng cùng một `MissionType`,
`level` tăng dần, `lives = 0` (thua thì chơi lại đúng bậc đang đứng). Viết tay thì 28 × 12 =
**336 chặng** trong JSON và chúng lệch với `LevelLadder` ngay lần chỉnh cân bằng đầu tiên; nên
gói được soạn từ hai bảng đã có, y khuôn `SagaAutoWriter`.

⚠ Đăng ký KHÔNG sống qua Domain Reload (và `GamePackTable.Reload()` xoá sạch) —
`LevelCampaignWriter.RestoreIfNeeded()` dựng lại từ chính MÃ GÓI, gọi ở `GamePackRunner.OnSceneLoaded`.

⚠ Kiểu chơi nào có thang: hỏi `SagaAutoWriter.CanBuild` — **một nguồn sự thật**, đừng chép danh
sách. Nó đã biết Phố mở không phải một chặng (không trọng tài, không vạch đích), bầy zombie cần
prefab thật, rồng và vết nứt chỉ có ở Fantasy.

⚠⚠ **THANG SOẠN RA KHÔNG GẮN LUẬT BIẾN THỂ NÀO**, dù ô `mutators` có sẵn. Đó là lựa chọn, không
phải chỗ còn thiếu: luật biến thể đổi **LUẬT CHƠI** chứ không đổi độ khó. Gắn `ironman` (không
hồi sinh) vào bậc 12 của `TeamDeathmatch` là biến cuộc đua số mạng thành ván diệt sạch — vạch
đích `KillScore` không bao giờ tới, trận trôi vĩnh viễn, **không lỗi nào báo**. Muốn an toàn thì
phải kê thêm bảng "kiểu chơi nào chịu được luật nào", tức một điểm nối nữa phải nhớ. Gói viết
tay (`GamePacks.json`, `GamePacksExtra.json`, kịch bản user) thì cứ tự do gắn — ở đó có người
đọc và chịu trách nhiệm từng chặng.

### Bậc khó KHÔNG tự trôi khi đang leo thang

`GameRun.Level` + `GameRun.SetLevel` là **cửa duy nhất** đặt bậc, và nó ghi luôn `Tier`.

⚠⚠ `GameRun.RecordResult` bỏ vế "thắng thì khó lên, thua thì dễ xuống" khi `Level > 0`. Bậc màn
là một THIẾT KẾ: bậc 5 phải khó đúng bằng bậc 5 dù người chơi vừa thắng năm ván liền. Để vế trôi
chạy chồng lên thì chặng sau mở ra bằng bậc khó của ván TRƯỚC cộng một, và cái tên «Bậc 5» in
trên bảng dẫn nhập thành nói dối.

⚠⚠ **ÁP ĐỘ KHÓ TRƯỚC KHI NẠP SCENE.** `GamePackRun.ApplyStageDifficulty()` gọi ở
`GamePackRunner.PostArenaRequest` (trước `LoadScene`), vì map sinh trong `MapArena.Start` và bậc
khó chụp trong `GameSession.Awake` — **cả hai chạy TRƯỚC sự kiện `sceneLoaded`**. Áp muộn là mọi
chặng mở ra bằng thiết kế của chặng trước rồi tự đúng lại từ chặng sau: lỗi lệch-một-nhịp không
ai báo. Hàm áp lại ra cùng kết quả nên `OnSceneLoaded` gọi thêm lần nữa (cho trường hợp bấm Play
thẳng vào scene chặng) là vô hại. `GameSession.Start` đọc lại `GameDifficulty` vì nhịp
`sceneLoaded` nằm GIỮA `Awake` và `Start`.

⚠ `GamePackRun.Abandon()` trả `Level` về 0. Bỏ gói giữa chừng rồi bấm một màn lẻ mà bậc còn
nguyên là màn lẻ ấy vẫn bị ép độ khó của chặng vừa bỏ dở — cùng họ với hai biến toàn cục
`Physics2D.gravity`/`Time.timeScale` mà `MutatorBinder` phải trả.

### Cửa vào

- **Người chơi:** bảng CHỌN GAME → thẻ «▦ Thang bậc màn» → chọn chế độ → chọn bậc
  (`Assets/Scripts/Map/Story/LevelPicker.cs`). Bậc mở tới «bậc xa nhất đã tới + 1»; tiến trình đọc từ
  đúng khoá `pack.<id>.stage` mà `GamePackPicker` đã đặt tên — thang bậc LÀ một gói game, không
  phải một hệ lưu thứ hai.
- **Người làm game:** `Tools > Stickman > Nâng cao > Gameplay > ★ Thang bậc màn (level design)`.
  Cửa sổ **dựng thật** map của từng bậc rồi in bảng (địa hình · bề ngang · bục · hồ · thang ·
  ba tầng · đêm), bấm số là vào Play thẳng bậc đó. Cửa sổ chỉ ĐỌC, không ghi asset nào.

### Năm phép đo canh chừng

`Assets/Editor/Doctor/StickmanDoctor.Levels.cs`

| Phép đo | Bẫy nó canh |
|---|---|
| Đường cong chỉ đi lên | bậc 7 dễ hơn bậc 6 — người chơi đọc ra ngay, không lỗi nào báo |
| **Bậc THẬT SỰ đổi map** | ⚠⚠ đứt dây `LevelPlan` ⇒ 12 bậc vẫn chạy, vẫn in «Bậc 12 · Địa ngục», sân y hệt bậc 1 |
| Mọi ngưỡng đều có bậc chạm tới | ngưỡng cao hơn bậc cuối ⇒ tính năng nằm trong code, không ai gặp |
| Chế độ nào cũng có thang | kho map thiếu màn mẫu ⇒ chế độ biến mất khỏi bảng chọn bậc |
| Bậc của chặng hợp lệ | chặng mang tên «Bậc 13» mà chạy bằng độ khó trôi nổi |

⚠ Phép đo thứ hai **không đọc code** — nó dựng thật map bậc 1 và bậc 12 rồi đếm số ô khác nhau,
chia **HAI XÔ**: *hình dáng* (bề ngang · địa hình · đồi · bục · vật chắn — đến từ vế lệch vòi) và
*tính năng* (hồ · sông · thang · ba tầng · phục kích · ngày đêm — đến từ vế ngưỡng). Gộp hai xô
thành một con số là mất đúng thông tin cần: đứt NỬA dây vẫn đếm ra 5–6 ô khác nhau và bảng vẫn
xanh. Đo ngày 2026-09-12 trên 28 kiểu chơi: xô hình dáng thấp nhất là 1 (Giải đấu tranh cúp — võ
đài cố định), xô tính năng thấp nhất là 2.

### Thêm một bậc / sửa đường cong

1. `LevelLadder.MaxLevel` + ba mảng `Tiers` · `Complexities` · `Names` (phải cùng độ dài).
2. Không đụng gì khác: gói thang bậc được soạn lại, lời dẫn từng chặng suy từ ngưỡng, cửa sổ
   tool và bảng chọn đều đọc `MaxLevel`.
3. Chạy Doctor — nhóm «Thang bậc màn» bắt cả ba lỗi hay gặp (mảng lệch độ dài, đường cong đi
   xuống, ngưỡng rơi ra ngoài thang).
4. Thêm bậc là thêm NHỊP TRUYỆN: 3 hồi × 4 nhịp = 12 trong `Resources/StoryArcs/*.json` — xem
   [StoryCampaign](StoryCampaign.md). Thiếu nhịp thì bậc ấy rơi về tên bậc + câu máy, Doctor réo.
