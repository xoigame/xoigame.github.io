## BỐI CẢNH & HÌNH CÔNG TRÌNH (nền trời · mặt đất · cây · lửa · tường thành)

Trước đây mọi thứ không phải nhân vật đều là `Square.png` TÔ MÀU: mặt đất một mảng xám, tường
thành là cái cột, tháp canh là cột + tấm ván, nhà là một hình vẽ tay 220×180. Nhìn ra ngay là
bản nháp. Nay chia làm hai đường, cố ý khác nhau:

| | Vẽ bằng CODE | Art THẬT (vẽ tay / AI) |
|---|---|---|
| Cái gì | nền trời ngày/đêm · đồi xa · trăng · sao · mặt cỏ · cây · đá · lửa | tường thành · tháp · cổng · nhà |
| Vì sao | cần **lặp liền mạch**, **màu khớp tuyệt đối**, **alpha sạch** | cần đẹp, và mỗi nền văn minh một kiểu |
| Ở đâu | `StickmanEnvironmentArt` → `Sprites/Environment/` | `StickmanBuildingArt` → `Sprites/Buildings/<Nền>/` |

**Sáu điều cần nhớ:**

1. **`StructureSkin` là chỗ DUY NHẤT đổi hình công trình.** Nó vẽ art vào một object CON và
   chỉ TẮT RENDERER của khối vuông cũ — **collider giữ nguyên tuyệt đối**. Nhờ vậy đổi nền văn
   minh giữa trận không bao giờ đổi luật chơi (AI phá tường, `TryStepUp` từ chối bước lên công
   trình, lính không đi xuyên đều đo bằng collider).
   ⚠ Object mang collider của tường bị `localScale = (rộng, cao, 1)` — con thừa hưởng cái méo
   đó, nên `SetArt` phải **chia ngược `lossyScale` của cha**. Quên là tường nào cũng dẹp lét.
2. **Tường/cổng KÉO VỪA KHUNG (`stretch: true`), tháp/nhà GIỮ TỈ LỆ GỐC.** Vật CHẮN ĐƯỜNG thì
   hình phải trùng đúng chỗ chắn — hình thò ra ngoài là lính trông như đi xuyên tường và cả hệ
   "phá mới qua được" thành nói dối. Còn tháp/nhà thì mái chìa rộng hơn chân đế mới ra dáng.
3. **TƯỜNG ĐÃ ĐƯỢC NỚI RỘNG: `thickness = max(thickness, height × 1.15)`.** Số cũ (0.9 rộng ×
   2.4 cao) là tỉ lệ của cái CỘT, không phải bức tường. Kích thước nay suy từ
   `MapBuildRules.WallArtAspect` + `WallArtWalkableRatio`; cả scene dựng tay và map runtime
   dùng cùng một công thức — lệch nhau là hai đường dựng thành ra hai kiểu tường.
4. **Phe bốc nền văn minh LÚC CHẠY**, còn tường/tháp dựng sẵn từ lúc build scene. Cầu nối là
   `CivilizationTeamAssigner.DressStructures()`: quét `StructureSkin` (KHÔNG kê tên class công
   trình — bài học của `SelectBestEnemy`), hỏi `TeamMember` ở cha, rồi áp
   `CivilizationDefinition.BuildingSprite(role)`.
   ⚠ Công trình TRUNG LẬP (phe −1, không `TeamMember`) GIỮ art mặc định — rào giữa đường là
   của chung, khoác cờ một phe lên là đọc sai trận.
   ⚠ Nền chưa khai art thì `BuildingSprite` trả null và **KHÔNG được gọi `SetArt(null)`** —
   gọi vào là lột mất art mặc định, để lại khối xám.
5. **LUẬT PHÂN CHIA: cái gì TĨNH thì là SPRITE, cái gì CHUYỂN ĐỘNG thì là HẠT.**
   · **Nền trời để ĐƠN GIẢN** (`SkyBackdrop`): hai dải chuyển màu (ngày/đêm) chồng nhau đổi
   alpha, một mặt trời hoặc mặt trăng, và **hai tuyến ĐỒI xa** có parallax. Hết. Nền là chỗ
   cho mắt NGHỈ — nền càng rối thì trận đánh phía trước càng khó đọc. Hai đường chân trời
   gợn sóng ở hai độ sâu là thứ rẻ nhất mà làm nền 2D đẹp lên nhiều nhất; đừng chồng thêm
   tuyến cây xa nữa.
   · **SAO là `ParticleSystem`**, không phải ảnh lát gạch cho mờ-tỏ. Bản đầu làm kiểu ảnh:
   cả mảng sao nhấp nháy CÙNG MỘT NHỊP nên mắt đọc ra "màn hình đang chớp" chứ không đọc ra
   "sao đang lấp lánh". Mỗi ngôi sao là một HẠT thì nó tự sinh, tự sáng, tự tắt theo nhịp
   riêng, và chỉnh thưa/dày/to/nhỏ chỉ là đổi số trên component.
   · **NGÀY / ĐÊM KHÔNG ĐẺ HỆ THỨ HAI.** Dự án đã có `DayNightCycle` (mode `Demo_22`) với sự
   kiện `PhaseChanged`; `SkyBackdrop` chỉ NGHE nó. **Ban đêm mới có trăng + sao và trời tối;
   ban ngày trời sáng bình thường.** Scene không có chu kỳ thì đứng yên ở `_startAtNight`
   (mặc định NGÀY — phần lớn bài test là trận đánh ban ngày).
   ⚠ **Màu nền camera chỉ ghi khi KHÔNG có `DayNightCycle`** — chu kỳ đã tự lerp rồi, hai chỗ
   cùng ghi một biến là đúng cái bẫy "mỗi transform một chủ".
   · Đồi vẽ **THANG XÁM (trắng)** rồi tint bằng `SpriteRenderer.color` — nhờ vậy hoà được từ
   xanh ban ngày sang xanh tím ban đêm chỉ bằng đổi màu, không cần hai bộ ảnh (cùng bài học
   với hệ màu lông ngựa).
   · Trời phải **BÁM CAMERA** (map dài 60 unit mà màn hình chỉ thấy ~24 — trời đứng yên là
   chạy sang mép map thì hết trời); ô phát hạt phải **CO GIÃN THEO KHUNG NHÌN** vì mỗi scene
   một `orthographicSize`; `prewarm = true` BẮT BUỘC, thiếu là vào trận đêm trời trống trơn
   rồi sao mới lác đác mọc.
6. **Lửa (`CampFire`) = ĐẾ sprite + NGỌN LỬA sprite co giãn + ĐỐM LỬA `ParticleSystem`.**
   · Ngọn lửa giữ hình đặc vì nó cần đọc ra dáng từ xa; nhấp nháy bằng **TỔNG BA SIN lệch tần**
   (11.3 / 6.7 / 3.1 Hz), KHÔNG bằng `Random` mỗi frame — random mỗi frame ra lửa rung giật.
   Mỗi đống lửa một `seed`, không thì cả sân cháy đồng loạt như một.
   · Đốm lửa là HIỆU ỨNG nên là hạt thật: dải màu theo đời hạt (vàng → cam → đỏ → tắt), nhỏ
   dần, noise lắc ngang, trọng lực ÂM cho hơi nóng đẩy lên. Bản đầu tự nuôi một mảng
   `SpriteRenderer` rồi dời tay từng cái mỗi frame — chạy được, nhưng đó là viết lại một hệ
   hạt tệ hơn: không noise, không dải màu theo đời hạt, và sửa gì cũng phải mở code.
   ⚠ **Object hạt phải xoay −90° quanh X.** `ParticleSystem` phát theo **+Z local** còn game
   này 2D; không xoay là tàn lửa bay thẳng vào mặt camera, mà vì bay dọc trục nhìn nên trông
   như đứng im tại chỗ.
   ⚠ Particle KHÔNG nhận `Sprite`, nó cần **`Material`**. `StickmanEnvironmentArt` sinh sẵn
   `Mat_Star.mat` / `Mat_Ember.mat` bằng shader **`Sprites/Default`** — luôn có mặt (không bị
   strip khỏi build) và tôn trọng MÀU ĐỈNH, tức `startColor`/`colorOverLifetime` ăn thẳng vào.

7. **MÔI TRƯỜNG PHẢI ĐỌC RA TỪ SILHOUETTE, KHÔNG CHỈ TỪ MÀU NHUỘM** (2026-09-08).
   · Chân trời: mỗi biome một `HillShape` — cồn cát răng cưa LỆCH (sườn khuất gió dốc, tối
   hơn), núi tuyết gai nhọn, núi lửa nón sườn lõm + miệng lõm, đầm phẳng có cây chết chữ Y.
   Mọi hàm cao độ TUẦN HOÀN theo bề rộng ảnh — không thì mạch lát gạch hở, không lỗi nào báo.
   · Prop: `MapLibrary.biomeProps` (sa mạc cọ/xương rồng · tuyết thông tuyết/bạch dương · đầm
   liễu/lau · núi lửa bazan · thu bạch dương). `MapScenery.ScatterFoliage` hỏi bảng đó TRƯỚC,
   không có dòng cho biome thì rơi về bộ chung — map đồng cỏ/rừng không đổi một pixel.
   · Sửa xong phải bấm «★ Vẽ LẠI TOÀN BỘ art code» rồi `Maps > 1. Build Map System` (nối
   sprite mới vào `MapLibrary`), và NHÌN `Docs/ArtSheets/Environment.png`.

**Đồ trang trí KHÔNG BAO GIỜ CÓ COLLIDER.** Cây/đá/bụi/lửa là hình thuần. Gắn collider vào là
`StickmanAgent.UpdateBlockedPath` nhận nhầm chúng làm vật cản và cả tiểu đội đứng đập một bụi cỏ.

**Gắn vào scene ở ĐÚNG MỘT CHỖ**: `StickmanDemoBuilder.NewScene` (mọi scene dựng tay đi qua đó)
và `MapScenery.Build` + `StickmanMapSystemBuilder.CreateArenaScene` (map sinh lúc chạy). Đặt vào
từng builder thì kiểu gì cũng sót vài bài — mà sót thì KHÔNG có lỗi nào báo, chỉ là màn đó vẫn
nền xám như cũ.

### HỢP ĐỒNG NỐI ART MAP ↔ CODE SINH HÌNH HỌC

Đọc thêm **`Docs/KnowledgeBase/MapArtGeometryRules.md`** trước khi vẽ hoặc thay một tấm
`Wall / Tower / Gate / Stairs / House`. Nguồn số duy nhất là `MapBuildRules`: cả
`MapCastle` (runtime) và `StickmanFortBuilder` (scene bake) chỉ được gọi công thức ở đó; alias
cũ chỉ để giữ API, không phải chỗ sửa số.

1. **Collider và cao độ gameplay là nguồn sự thật.** Art nằm trong `StructureSkin`/object
   `Art`, không được đổi collider để “vừa hình”. Sprite công trình dùng pivot **đáy giữa**, chân
   ảnh phải trùng `GroundY`. Tường và cổng kéo đúng footprint; tháp/nhà giữ tỉ lệ gốc nhưng
   không được lấn sang ô nối bên cạnh.
2. **Tường ↔ cầu thang phải có một mối nối thật:** mặt đi tường là
   `groundTop + height`; bậc chót kết thúc đúng cao độ đó; chân thang không hở và đầu cao chồng
   vào mép tường `MapBuildRules.StairWallOverlap`. Không tạo lại công thức bậc trong builder mới.
   Mỗi bậc rise ≤ `StepRise`, quãng ngang dùng `StepRun`; art cầu thang phủ đúng tổng span.
3. **Cổng là một footprint gameplay, không phải ảnh trang trí đứng cạnh collider.** Bề rộng
   tối thiểu suy từ `GateArtAspect`; cổng đóng dùng art tĩnh, cổng mở dùng lá cửa động, không
   vẽ hai lớp chồng nhau. Cao độ chân cổng phải cùng mặt đất với hai đoạn tường kề.
4. **Tháp phải đọc được sàn đứng:** platform dày `TowerPlatformThickness`, thang cao thêm
   `TowerLadderOverrun`, art tháp tính từ `towerWalkableRatio` (mặc định `397/470`, hợp lệ
   `0.45..0.90`). Không vẽ mái kín lên trên sàn garrison. Lan can phía trước ở layer
   foreground để che thân lính; thân tháp không được đưa lên foreground.

⚠⚠⚠ **TỈ LỆ SÀN THÁP PHẢI ĐO TRÊN CHÍNH TẤM ART, VÀ BỀ NGANG PHẢI ĐƯỢC CẤP ĐỦ**
(2026-09-05, người dùng gửi ảnh `Demo_39`: khối đá tháp nằm THỤT HẲN dưới một tấm ván gỗ lơ lửng).
Hai lỗi chồng nhau, cả hai câm lặng:

| # | Sai ở đâu | Đo được |
|---|---|---|
| 1 | `DefaultTowerArtWalkableRatio` = **344/470** trỏ vào ĐƯỜNG CÔNG-XÔN (chỗ ban công chìa ra), không phải MẶT ĐI của lan can | mặt đi thật ở **397/470**; lệch 0.113 × chiều cao tháp |
| 2 | `StructureSkin` guard bề ngang (`NonStretchWidthAllowance` 1.75) kẹp theo **BỀ NGANG CỘT ĐÁ** (`columnWidth`) chứ không theo bề ngang BAN CÔNG | tháp cao 3.6 cần hệ số 0.80, guard chỉ cho **0.547** ⇒ art co còn 68% ⇒ ban công tụt thêm ~1.1 world |

⚠ **NGUỒN SỰ THẬT LÀ TẤM ART, KHÔNG PHẢI COLLIDER** — nhưng chỉ ở đúng ba số này. Nay
`MapCastle.BuildTowerCore` suy NGƯỢC: `artHeight = TowerArtHeightFor(height, ratio)` →
`artWidth = artHeight × TowerArtAspect` (320/470) → **nửa sàn** =
`artWidth × TowerArtBalconyRatio (245/320) / 2` (kẹp trong `[cột/2+0.35 … cột/2+1.1]`) → **trục
thang** = `artWidth × TowerArtShaftRatio (195/320) / 2 + 0.22`, kẹp trong mép sàn. Collider vẫn
là luật (`GarrisonPost`, `PlatformEffector2D`, `StickmanClimbZone` không đổi một dòng); art chỉ
QUYẾT ĐỊNH ba con số hình học đó, thay vì art phải chạy theo ba con số gõ tay.
⚠ **CÓ ART THÌ TẮT HÌNH DỰ PHÒNG**: thanh ván gỗ + lan can gỗ tiền cảnh chỉ dành cho tháp CHƯA
có hình. Để cả hai là hai cái sàn chồng nhau ở hai cao độ — đúng thứ trong ảnh. **Collider GIỮ
NGUYÊN**: tắt renderer, không tắt luật.
⚠ **GUARD BỀ NGANG NAY BIẾT KÊU** (`StructureSkin`): guard bóp art xuống là log một dòng warning
kèm phần trăm. Không có dòng đó thì "art bé hơn ý muốn" nhìn y hệt "art vẽ sai tỉ lệ", và đã tốn
một vòng chẩn đoán vì vậy.
⚠ **Thay tấm `Tower.png` khác tỉ lệ thì phải đo lại BỐN hằng số** (`DefaultTowerArtWalkableRatio`
· `TowerArtAspect` · `TowerArtBalconyRatio` · `TowerArtShaftRatio`). Cách đo: quét cột alpha lấy
bề rộng theo từng hàng — hàng rộng nhất ở nửa trên là BAN CÔNG, dải hẹp ổn định phía dưới là
THÂN, mặt đi là hàng ngay trên đỉnh lan can.

5. **Mỗi lần đổi art hoặc công thức:** mở `★ Bảng điều khiển` → `Thể loại & Map` →
   `Công trình văn minh` (nếu đổi PNG) → `Cổng + tháp vào scene gameplay Trung cổ` (nếu đổi
   scene builder) → `Kiểm tra khớp art ↔ hình học map`. Nếu đổi công thức trong `MapBuildRules`,
   phải dựng lại cả asset/scene liên quan; chấm vàng/đỏ trên bảng là khoản chưa bake, không
   được bàn giao bằng lời nhắc trong chat.

### Thay art công trình bằng art thật

1. Thả sheet PNG vào `Assets/Art_Incoming/` (nền TRONG SUỐT, các vật xếp một hàng ngang cách
   nhau khoảng trống, cùng đường chân). Đặt tên file = tên bộ: `Europe.png` · `Viking.png` ·
   `Nature.png`...
   ⚠ **KHÔNG có bộ lửa trại / lò lửa / đuốc.** Art vẽ tay luôn vẽ luôn ngọn lửa vào ảnh, mà
   lửa PHẢI ĐỘNG — nhét ảnh có lửa sẵn vào chỗ cái ĐẾ là ra hai ngọn lửa chồng nhau, một cái
   đứng im. Đế lửa giữ bản vẽ bằng code.
2. Bấm `Tools > Stickman > Nâng cao > Buildings > 2. Cắt sheet trong Art_Incoming`.
3. Tool tìm các **ĐẢO PIXEL ĐẶC** ngăn nhau bởi khoảng trong suốt, cắt khít từng vật, đặt PPU
   100 + **pivot ĐÁY GIỮA**, rồi gắn thẳng vào asset `Civ_<Tên>`.

⚠ **FORM THÀNH QUÁCH — bốn nét, thiếu cái nào là đọc không ra thành** (rút từ 13 ảnh tham
chiếu, chi tiết ở `Fortifications.md` mục 9): răng cưa HẸP và NHIỀU · chân LOE (battered base)
· trụ đứng chia nhịp · khe bắn tên rải đều có gờ đá quanh.
⚠ **ĐỈNH THÁP PHẢI LOE RA VÀ ĐỂ HỞ**, không đội mái chóp — `GarrisonPost` cho cung thủ ĐỨNG
TRÊN sàn tháp, mà mái chóp thì không ai đứng lên được. Art nói ngược lại cơ chế của chính mình
là lỗi nặng hơn art xấu. Mái chóp để dành cho tháp TRANG TRÍ (không có `GarrisonPost`).
⚠ Sửa art công trình thì vẽ thử bằng **`.claude/skills/stickman-assets/scripts/envcanvas.py`**
(bản mô phỏng `EnvCanvas`) rồi NHÌN, đừng đọc code mà đoán — đúng khuôn `canvas.py` của bộ vũ khí.

⚠ Cắt theo đảo pixel chứ KHÔNG chia 4 ô đều: chia đều chỉ đúng khi người vẽ đặt vật đúng tâm
mỗi ô — không bao giờ xảy ra. Dò pixel thì tấm nào cũng cắt được và tự cho khung bao khít nên
pivot đáy giữa rơi đúng chân công trình.

⚠ Đọc file bằng `File.ReadAllBytes` + `Texture2D.LoadImage`, KHÔNG qua `sprite.texture.GetPixels`
— texture chưa bật `isReadable` là `GetPixels` ném lỗi, mà bật lên là bắt cả bộ art reimport
(cùng bài học với `StickmanRigMetrics.FitOpaqueWidth`).

⚠ **Sửa xong PHẢI DỰNG LẠI SCENE mới thấy.** Scene đã bake sẵn trên đĩa; đổi code builder không
tự chui vào scene cũ. Bấm `Tools > Stickman > Build > 0. Bảng dựng` → 1 → 2 → 3 → 4.


### BỐI CẢNH THEO THỜI KỲ + KHÔNG KHÍ THEO KIỂU CHƠI (2026-09-05)

Trước đó **mọi map của mọi thời kỳ dùng CHUNG một cái nền**: hai tuyến đồi xanh, không thời
tiết, không hạt lửng. `MapTheme.backdropShape` (`Mountains`/`Skyline`/`Spires`) chỉ được đọc
bởi mấy tam giác màu phẳng của `MapScenery.BuildBackdrop`, còn `SkyBackdrop` — thứ người chơi
thật sự nhìn — không biết gì về nó.

#### a. Chân trời ba hình, và MÀU mới là thứ quyết định bối cảnh

`SkyBackdrop.ApplyHorizon(shape, hillFarDay, hillNearDay)` — gọi LÚC CHẠY nên **scene đã bake
không phải dựng lại**. Art mới: `Hill_Far_City`/`Hill_Near_City` (nhà cao tầng, cửa sổ khoét,
ăng-ten) · `Hill_Far_Spire`/`Hill_Near_Spire` (cột đá nhọn).

⚠ Đồi vẽ **THANG XÁM** nên màu thật nằm ở `MapTheme.hillFar`/`hillNear`. Đổi mỗi HÌNH mà giữ
màu mặc định là map hiện đại vẫn có chân trời xanh lá; đổi mỗi MÀU thì map hiện đại vẫn là
một dãy đồi. Cần cả hai.
⚠ Thiếu art của thời kỳ nào thì **LÙI VỀ ĐỒI**, không để trống — nền trời trống trơn là thứ
không ai đọc ra nguyên nhân.
⚠⚠ **CHỌN BỘ SỐ ĐÚNG VỚI MỌI SEED.** Seed của art sinh bằng code là `string.GetHashCode()`,
bản mô phỏng Python **không tái tạo được**. Cột đá fantasy bản đầu nhìn đẹp trong bản mô phỏng
nhưng art Unity sinh ra là một dãy **bướu tròn có lông** (nền cao 0.26 gợn 0.14 + bướu bán
kính `hw × 0.9`). Chốt bằng cách render **SÁU seed** rồi mới chọn: nền THẤP và PHẲNG
(0.10/0.035), cột CAO và RỘNG (halfW 22/34, cao 62–192), thêm một cột phụ nép bên cạnh.

#### b. Không khí là HẠT, và nó tra theo KIỂU CHƠI

`Combat/WeatherAmbience.cs` + `Map/MapAtmosphere.cs`. Hai lớp, cố ý tách:
· **lớp CHÍNH** (`WeatherKind`): mưa · tuyết · lá rơi · tro tàn · **tàn lửa bay lên**;
· **lớp HẠT LỬNG** (`WeatherMotes`): bụi · sương · **đom đóm (chỉ ban đêm)**.
Gộp làm một thì không bao giờ có "mưa trong màn sương" — cảnh đáng xem nhất.

⚠ **KHÔNG có mưa trong bảng mặc định**: 260 hạt/giây, vệt dọc chạy ngang khung hình, cạnh
tranh trực tiếp với thứ người chơi cần đọc (mũi tên đang bay, cây vũ khí đang vung). Bật tay
trên từng map — đó là quyết định của người thiết kế màn, không phải mặc định cho 63 map.
⚠ **KHÔNG đụng gameplay**: sương KHÔNG thu tầm nhìn AI (việc của `WorldLighting`, và nó ĐỔI
CÂN BẰNG). Bậc khó cũng không được chỉnh độ dày hạt.

⚠⚠ **BẬC VẼ: mưa ở layer `foreground`, KHÔNG phải order lớn** (`WeatherFront` = 40) — mọi thứ
trong `Default` không có bậc nào đưa nó ra TRƯỚC nhân vật. Sương thì ngược lại
(`WeatherBack` = −12, layer `Default`): nó là KHÔNG KHÍ giữa người xem và hậu cảnh; đưa ra
trước là cả trận đánh bị phủ mờ.

⚠ Bốn bẫy particle 2D gom hết trong `EnsureSystem`, đừng chép ra chỗ khác: xoay **−90° quanh
X** · particle cần **`Material`** chứ không nhận `Sprite` · **`prewarm = true`** · ô phát
**co theo khung nhìn**.
⚠ `ps.noise` trả về **STRUCT COPY** — `ps.noise.enabled = false` không biên dịch được
(CS1612). Mọi module của `ParticleSystem` phải lấy ra biến rồi mới ghi.

⚠⚠ **BA TRỤC CỦA `velocityOverLifetime` PHẢI CÙNG MỘT KIỂU ĐƯỜNG CONG — kể cả trục KHÔNG DÙNG**
(2026-09-07). Cả 12 nhánh thời tiết/hạt lửng khai `vel.x`/`vel.y` bằng `MinMaxCurve(min, max)`
⇒ kiểu `TwoConstants`, còn `vel.z` để nguyên mặc định `Constant`. Unity kiểm cả cụm lúc `Play()`
và réo *"Particle Velocity curves must all be in the same mode"* — mà `Restart(ps)` chạy MỖI LẦN
dựng lại thời tiết (đổi map · đổi nhiệm vụ · đổi thời kỳ) nên Console đỏ liên tục.
Chốt: khai thẳng `vel.z = new ParticleSystem.MinMaxCurve(0f, 0f)` ngay sau `vel.space`, TRƯỚC
`switch` — "đứng yên theo chiều sâu" đúng ý một game đi ngang, và đưa cả ba trục về cùng kiểu.
⚠ Bẫy này KHÔNG chỉ ở trục z: đổi một nhánh sang `MinMaxCurve(curve)` (đường cong) mà để nhánh
kia là hai hằng số cũng vỡ y hệt. Cùng luật cho `forceOverLifetime`, `limitVelocityOverLifetime`
và `rotationOverLifetime` **khi bật `separateAxes`** (đang tắt nên `rot.z` một mình vẫn hợp lệ).

#### c. Bản mô phỏng Python từng NÓI DỐI hai lần (đã sửa `envcanvas.py`)

| Sai | Hậu quả |
|---|---|
| `_blend` lấy `max(da, a)` cho alpha — **không cộng dồn** | art dựng bằng nhiều lớp mỏng (sương, quầng sáng, khói) hiện ra gần như trong suốt trong bản xem trước, trong khi Unity vẽ đậm. Đo được: `Haze` alpha đỉnh **3/255** thay vì 111 |
| `FillRectF` làm tròn rồi gọi `FillRect` **exclusive** | mọi `FillRectF(x, y, x, y, …)` (giọt mưa, gân lá, dải một hàng) vẽ ra **con số không** — `Rain` alpha đỉnh **0**, tấm art rỗng hoàn toàn |

Cả hai nay khớp C#: alpha "over" đúng công thức, `FillRectF` inclusive + khử răng cưa mép
ngang. ⚠ Dụng cụ đo nói dối theo hướng tệ nhất: nó bảo art hỏng trong khi art đúng.

⚠ **PHẢI BẤM LẠI TOOL**: `★ Vẽ bù art còn thiếu` → `Asset thể loại` → `Hệ thống map` → dựng
lại sân map + scene tay. `StickmanEnvironmentBuilder.cs` nay nằm trong
`StickmanBuildPipeline.SceneSharedSources` nên mọi scene tự chuyển VÀNG khi sửa bối cảnh.

## NÚI NON + MÂY NGẪU NHIÊN (2026-09-06)

`SkyBackdrop.ScatterHorizon(seed)` rải những ĐỈNH RỜI ở giữa hai tuyến đồi lặp, cộng một lớp
mây trôi. `MapScenery.ApplyAtmosphere` gọi nó với seed suy từ TÊN MAP — mỗi map một dãy núi
riêng, mà chơi lại vẫn đúng dãy ấy.

Art: `Peak_Round · Peak_Jagged · Peak_Mesa · Peak_Twin` + `Cloud_Puff · Cloud_Wide · Cloud_Wisp`.

⚠ **Vẽ bằng ALPHA, không bằng màu.** `SkyBackdrop` nhân màu ngày/đêm vào cả tấm (cùng đường với
hai tuyến đồi), nên hoa văn phải nằm ở ĐỘ ĐẶC. Vẽ xanh lá là về đêm ra xanh lá tối.
⚠ **KHÔNG collider, không vào `layout`.** Ở độ cao đó một collider còn tệ hơn ở mặt đất:
`LaneNav` sẽ thấy một "mặt đi" lơ lửng giữa trời.
⚠ **MẬT ĐỘ, không phải SỐ LƯỢNG.** Bản đầu lấy dải cuộn = 7 × nửa khung nhìn rồi rắc 14 ngọn
vào đó: khung nhìn rộng ~35 đơn vị mà dải rộng 245 ⇒ trung bình **2 ngọn** trong khung, và có
seed thì màn hình TRỐNG TRƠN. Nay khai `PeakSpacing = 6.5` / `CloudSpacing = 8` rồi mới suy
`span = count × spacing`.
⚠ Dải cuộn còn bị kẹp `≥ 2.5 × nửa khung nhìn`: hẹp hơn là vật cuộn vòng ngay trong tầm mắt và
người chơi thấy một ngọn núi NHẢY từ mép này sang mép kia.
⚠ Chia đều rồi XÊ DỊCH (`(i + rand·0.85) × spacing`): rắc thuần ngẫu nhiên ra chỗ chụm ba ngọn
chỗ trống hoác; chia đều mà không xê dịch thì ra hàng rào cọc.
⚠ Trần cao 4.4: đồi gần 2.2, đồi xa 3.4 — đỉnh rời phải nhô lên được mà không chiếm nửa khung
hình. Bản đầu để 5.2 và ở cỡ thật nó là một bức tường chắn ngang trời.

Công thức cuộn (giữ nguyên nhịp parallax): `rel = Repeat(baseX − camX·(1−p) + span/2, span) −
span/2`, rồi `x = camX + rel`. Camera đi thêm `d` thì `rel` giảm `d·(1−p)` ⇒ vật đi thêm `d·p`.

## MÔI TRƯỜNG (BIOME) + NGÀY/ĐÊM PHỦ CẢ SÂN (2026-09-07)

Người dùng: *"cải thiện background — đa dạng môi trường hơn, nhiều chi tiết lắp ghép hợp lý,
effect, thời tiết phù hợp, ngày/đêm có hiệu ứng"*. Đo trước khi sửa: cả game có ĐÚNG BA bối cảnh
(một `MapTheme`/thời kỳ), 60+ map chia nhau ba bầu trời và ba màu đất; chu kỳ ngày/đêm chỉ
đổi nền trời + màu camera — lính, nhà, đất vẫn sáng như ban ngày.

### a. `MapBiome` — trục ĐỘC LẬP với thể loại (`Core/MapBiome.cs`)

Bảy môi trường: Đồng cỏ · Rừng · Rừng thu · Sa mạc · Tuyết · Đầm lầy · Núi lửa. Thể loại vẫn
quyết định HÌNH chân trời (đồi/phố/cột đá) + bộ công trình; biome chỉ **nhuộm và chọn**:

| Biome đụng vào | Ở đâu | Cách |
|---|---|---|
| màu thân đất | `MapScenery.Build` → `BiomePalette.Ground` | trộn 70/30 với màu thể loại |
| dải cỏ | `MapLibrary.GroundTopFor` / `TerrainGround.Setup(topTint)` | có tấm `Ground_Top_<Suffix>` thì dùng, không thì nhuộm tấm chung |
| hai tuyến đồi + tuyến cây gần + sắc trời ngày | `SkyBackdrop.ApplyHorizon(…, biome)` | `BiomePalette.Hills` · tấm `Hill_*_<Suffix>` nếu có · lớp `Hang_Cay_Gan` (rừng/đầm) |
| thời tiết mặc định | `MapAtmosphere.ForBiome` + `Roll(…, biome, seed)` | trục thứ BA, sau thể loại, trước đợt thời tiết theo seed; sa mạc/núi lửa không mưa |
| tỉ lệ cây/đá/nhà + tán cây | `MapScenery.DecoKindFor` · `StructureRequest.canopyKey/canopyTint` | rừng 52% cây, núi lửa 64% đá+vách; tán thông/liễu theo biome, rừng thu nhuộm cam |
| tiếng nền | `BiomeKeyFor(…, biome)` | `BiomePalette.Look.ambienceKey` |

Bốc: `MapGenerator` (`BiomePalette.Roll(genre, seed)`, trọng số lệch — đồng cỏ vẫn phổ biến
nhất) · `MapDressing` (scene không có map: theo seed tên scene) · Xưởng map (núm «Môi trường») ·
25 map mẫu khai tay trong `StickmanMapSystemBuilder.Blueprints`.

⚠ **Biome KHÔNG đổi hình chân trời của HIỆN ĐẠI/FANTASY** (`SkyBackdrop.FarSprite` chỉ tra tấm
biome khi `shape == Mountains`): sa mạc hiện đại vẫn là phố — phố là chất thời kỳ, cát là màu.
⚠ **Đất đã bake thì không nhuộm được** (`MapDressing` chỉ đổi trời · thời tiết · cây rải).
⚠ Art biome hiện là **BẢN NHÁP vẽ bằng code** (`GenerateBiomeHills` · năm `Ground_Top_*`).
Đặt art thật qua ChatGPT: `Docs/KnowledgeBase/EnvironmentArt-ChatGPT-Prompt.md` — cùng tên file
là thế vào được, mọi tấm nạp theo tên và **thiếu thì lùi về tấm của thể loại**, không để trống.

### b. Ngày/đêm phủ cả sân — `SkyBackdrop.UpdateWorldWash`

Một tấm phủ bán trong suốt bám camera ở layer `foreground`, order `WeatherFront − 2` (dưới
mưa, trên mọi thứ khác; HUD là `OnGUI` nên không bị nhuộm): đêm sâu xanh thẫm alpha 0.42, bình
minh/hoàng hôn ửng cam alpha 0.16. Không có chu kỳ và không mở màn đêm ⇒ alpha 0, scene cũ
không đổi một pixel. Kèm: lửa trại **rộng + đậm theo `NightAmount`** (`CampFire`), **sương sớm**
5h–8h dày lên rồi tan (`WeatherAmbience.UpdateNightGate`), đom đóm/sao như cũ.

⚠ Game KHÔNG có hệ đèn 2D — đừng thử "đèn thật" cho từng ngọn đuốc bằng cách chồng thêm
`SpriteRenderer` sáng: một tấm phủ là đủ để cả sân nói cùng một giờ; điểm sáng là việc của
`CampFire`/đom đóm (hạt), đúng luật "tĩnh là sprite, động là hạt".

### c. Chu kỳ ngày/đêm "khí quyển" cho MỌI kiểu chơi

Trước đây chỉ sinh tồn/zombie có chu kỳ (bảng luật). Nay: `MapGenerator` bật ~30% map thường
với ngày DÀI (80–120s) · đêm 35–55s · tầm nhìn đêm **0.8** (mềm hơn 0.65 của sinh tồn — ở đây
đêm là không khí, không phải luật); Xưởng map có nút «Chu kỳ NGÀY / ĐÊM» + ba núm; map mẫu
khai `slowCycle`. Sinh tồn vẫn đúng bộ số cũ (`DayNightSettings.Default`).

⚠ **Phải bấm lại** `★ Vẽ bù art còn thiếu` (15 tấm mới) → `Maps > 1` (25 map mẫu nhận biome +
`biomeGroundTops`) → dựng lại scene (`SkyBackdrop` nhận bộ chân trời biome). Bảng điều khiển
tự VÀNG vì `StickmanEnvironmentBuilder.cs` nằm trong `SceneSharedSources`.

### d. Chi tiết · nguồn sáng · 4 kiểu thời tiết mới · thứ tự vẽ (2026-09-07)

- **Cây cỏ nhỏ** `MapScenery.ScatterFoliage`: bụi · túm cỏ · đá nhỏ · cây nhỏ (thông/sồi/chết)
  rải 1–3 đơn vị một cái theo biome (rừng dày gấp đôi, sa mạc/núi lửa chỉ đá + cây chết), nhuộm
  `canopyTint` của biome. Thuần sprite, KHÔNG collider. Art từ `MapLibrary.bush/grassTuft/rock/tree*`.
- **Nguồn sáng** `MapScenery.ScatterFires` + `PlaceFire` (`CampFire.Setup` lúc chạy): lửa trại
  dọc map 13–22 đơn vị/cái (đầm lầy = lò than, núi lửa = không), **đuốc hai đầu hầm chui**, **lò than
  hai đầu tầng 3 của đường trên** + hàng cột lan can mỏng. `CampFire` tự rộng/đậm về đêm.
- **Cửa sổ sáng đèn về đêm** — `Combat/NightGlow`: quầng mềm sinh lúc chạy (không asset), gắn cho
  mọi chi tiết `PartSlot.Window` trong `StructureAssembler.PlacePart`, alpha theo `NightAmount`,
  nhấp nháy tổng hai sin lệch tần. Không chu kỳ ⇒ tắt hẳn.
- **Thời tiết mới** (`WeatherKind` 6–9): **Giông** (mưa dày xiên + SÉT: `SkyBackdrop.Flash` loé lớp
  phủ cả sân, 4–11 s một lần) · **Bão tuyết** (bông nhỏ bay ngang, ô phát cả khung nhìn) · **Bão
  cát** (bụi vàng cuộn ngang theo noise — sa mạc 28% map) · **Cánh hoa** (rừng/rừng thu/fantasy
  12%). Đợt mạnh trong `MapAtmosphere.Roll`: tuyết→bão tuyết (xứ tuyết 45%), mưa→giông 35%.
  Vật liệu dùng lại Rain/Snow/Dust/Leaf — KHÔNG thêm art. Tiếng: giông = Rain, bão tuyết = Snow,
  bão cát = `Ambience/Wind` (chưa có clip thì im — bank tự bỏ qua), sét = `Weather/Thunder`.

**THỨ TỰ VẼ đã rà (sorting layer `Default` < `character` < `foreground`):**

| Lớp | Layer / order | Vì sao |
|---|---|---|
| Cây nhỏ hậu cảnh | Default `BackProp−2` (−52) | sau cả cây/lều `BackProp`, trước núi khung |
| Bụi · đá · túm cỏ | Default `NearProp` (−14) / `BackProp` | −14 vẫn SAU vòng điểm chiếm `GroundMark` (−10) và lửa `Prop` (−6): mốc gameplay không bị cỏ che |
| Lửa trại · đuốc hầm · lò than mái | Default `Prop` (−6), quầng −8 | trước sàn/bậc/đất; quầng đuốc hầm hắt lên mặt đất phía trên là cố ý (ánh sáng qua miệng hầm) |
| Lan can mái | Default `StructureTrim` (−28) | sau sàn `Platform` (−26): chỉ phần nhô trên sàn hiện, không đè lính |
| Quầng cửa sổ | Default = order cửa sổ + 1 | đè lên đúng ô cửa, vẫn sau người |
| Phủ màu đêm / sét | **foreground** `WeatherFront−2` (38) | trên MỌI thứ ở Default+character (đúng ý: cả sân một giờ), dưới mưa (40); HUD `OnGUI` không dính |
| Bão cát / bão tuyết | foreground `WeatherFront` (40) | như mưa |

⚠ Cây cỏ CỐ Ý không lên `foreground`: cỏ che trước mặt lính là mất đọc trận đánh — luật "nền là
chỗ cho mắt nghỉ". Muốn tiền cảnh thật thì làm riêng một lớp thưa ở `Occluder`, đừng đẩy cả bụi.
