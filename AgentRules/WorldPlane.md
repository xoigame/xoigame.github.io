## ⚠⚠ KIỂU NHÌN LÀ MỘT TRỤC RIÊNG — `WorldPlane` (2026-09-09)

User: *"game chỉ có màn hình 2D đi theo trục ngang, tôi muốn 1 loại mới là gameview 2D đi theo
trục X và Y, kiểu không có chiều cao… Copy tất cả thể loại chơi hiện có sang mode đó."*

`Assets/Scripts/Core/World/WorldPlane.cs`

| | `ViewPlane.Side` (mặc định, mọi thứ cũ) | `ViewPlane.Ground` (mới) |
|---|---|---|
| Trục Y nghĩa là | **ĐỘ CAO** | **CHIỀU SÂU** (xa/gần) |
| Trọng lực | có | **tắt** (`Physics2D.gravity = 0`) |
| Nhảy · leo · cầu thang · mép vực · rơi hố | có nghĩa | không |
| Thứ tự vẽ giữa hai người | bậc đếm ỔN ĐỊNH | **theo Y** (gần thì vẽ đè) |
| Hình nhân vật | ngang, quay trái/phải | **y hệt** — dùng lại 100% rig · ragdoll · art |

### 1. Vì sao là TRỤC RIÊNG, không phải `GameGenre` thứ 5

Thể loại trả lời *"đánh nhau bằng gì"* (kiếm · súng · phép · nội công); kiểu nhìn trả lời
*"trục Y nghĩa là gì"*. Hai câu độc lập ⇒ chúng **NHÂN**: 4 thể loại × 2 kiểu nhìn = 8 bộ nội
dung từ một kho asset. Nhồi vào `GameGenre` là phải khai lại toàn bộ vũ khí · nền văn minh ·
map cho bản top-down — đúng cái bẫy `GameFactory.md` gọi là *"CỘNG game thay vì NHÂN game"*.

Hệ quả thực tế: **không có mode nào được chép sang cả.** 35 `MatchModeBase` và 22 `MissionType`
chạy nguyên xi; thứ duy nhất phải sinh thêm là asset map khai `plane = Ground`.

### 2. Chọn 3/4 (beat-em-up), KHÔNG phải nhìn thẳng từ đỉnh đầu

Nhìn thẳng từ trên xuống đòi vẽ lại 230+ sprite, cả rig 2D IK và bỏ luôn hệ ragdoll ngang.
Bản 3/4 giữ nhân vật là hình NGANG quay trái/phải — Y chỉ quyết định **thứ tự vẽ**, không
quyết định dáng. Chi phí art bằng 0.

### 3. Bốn chỗ nắm cả hệ (sửa ở đây, không sửa lẻ)

| Chỗ nắm | File | Nó gánh cái gì |
|---|---|---|
| **Trọng lực** | `WorldPlane.Enter/Restore` | Một dòng `Physics2D.gravity = 0` làm tên bay thẳng, đồ rơi đứng yên, ragdoll không rơi — **không sửa `gravityScale` của một prefab nào** |
| **Bước đi** | `StickmanLocomotion.Ground.cs` | Trục sâu đi RIÊNG (`_steerDepth` + mốc lái tự động), ghi tại đúng chỗ ghi `velocity.x` |
| **Hình học AI** | `WorldPlane.Reach` · `StickmanAgent.Ground.cs` | Thước đo đổi từ `\|dx\|` sang 2D; mốc chiều sâu đặt MỘT LẦN ở nơi agent chọn mục tiêu |
| **Chỗ đứng trong map** | `MapAssembler.GroundPoint` | Cái phễu DUY NHẤT biến `float x` thành `Vector3` — 20 hàm dựng mục tiêu ăn theo miễn phí |

### 4. Bẫy im lặng — đã dính, đừng dính lại

⚠⚠ **BIẾN TOÀN CỤC PHẢI TRẢ LẠI.** `WorldPlane` là biến thứ ba cùng họ với `Physics2D.gravity`
và `Time.timeScale` (xem `MutatorBinder`). `Enter` nhớ trọng lực **một lần** (gọi hai lần mà
nhớ lại lần hai là nhớ đúng số 0 mình vừa đặt ⇒ trả về 0 ⇒ mọi scene ngang sau đó mất trọng
lực vĩnh viễn). Có thêm `RuntimeInitializeOnLoadMethod` làm chốt chặn mỗi lần nạp scene.

⚠⚠⚠ **`RuntimeInitializeOnLoadMethod` KHÔNG CHẠY MỖI LẦN NẠP SCENE — nó chạy MỘT LẦN cho cả
phiên Play.** Bản đầu cắm chốt trả trọng lực vào đó và chú thích rằng nó chạy "mọi lần nạp
scene". Hậu quả trên máy người dùng: chơi một map top-down → bấm F1 sang scene NGANG bất kỳ →
**cả scene bay lơ lửng**, không nhảy được, quân ra sai vị trí. Im lặng tuyệt đối vì scene ngang
không hề biết `WorldPlane` tồn tại. Nay nghe `SceneManager.sceneLoaded` và trả trọng lực **vô
điều kiện** (không hỏi sổ `_applied` — chính lỗi này là một đường thoát không chạy qua
`Restore`), cộng một `LogError` nếu scene ngang mở ra mà trọng lực bằng 0.

⚠⚠ **Ý ĐỊNH LÁI TAY ĐO BẰNG THỜI GIAN, KHÔNG BẰNG `Time.frameCount`.** `MoveDepth` gọi từ
`Update`, còn `DepthInput` đọc từ `FixedUpdate` — mà `FixedUpdate` chạy **TRƯỚC** `Update` trong
một frame. Phép so `_depthSteerFrame == Time.frameCount` **không bao giờ đúng**, tức người chơi
**không đi lên/xuống được một chút nào** trong 100% số nhịp. Không lỗi nào báo: đi ngang vẫn
bình thường, chỉ trục sâu câm.

⚠⚠ **`MapAssembler.EnterPlane` PHẢI GỌI CẢ KHI MAP LÀ SÂN NGANG**, và ở CẢ HAI đường vào
(`Build` cho map sinh lúc chạy, `Populate` cho scene bake). Chơi map top-down rồi bấm
F2 đổi sang map ngang trong cùng một sân — nhánh `else` (`WorldPlane.Restore`) là thứ duy nhất
trả lại trọng lực.

⚠⚠ **`DistanceToTarget` phải đo 2D.** Đo `\|dx\|` ở sân này thì địch cách 4 đơn vị theo chiều
sâu vẫn ra "trong tầm chém": cả tiểu đội **đứng chém không khí**, mãi mãi, không lỗi nào báo.

⚠⚠ **`TravelSpeed` phải đo 2D.** Nó nuôi guồng chân. Đo `\|velocity.x\|` thì người chạy thẳng
theo chiều sâu có tốc độ 0 ⇒ chân đứng im ⇒ **cả người trượt như đi patin** (`FootSliding.md`,
nhưng trượt 100%).

⚠⚠ **Bù độ rơi và trần dốc ngắm phải TẮT.** `ballisticLiftPerUnit` cộng `distance × lift` vào
Y, mà Y giờ là chiều sâu ⇒ mọi cung thủ bắn lệch có hệ thống về phía xa. `ClampAimElevation`
kẹp dốc về 1.2 ⇒ bắn trượt mọi mục tiêu không gần ngang hàng. (Vế `MinAimRun` thì GIỮ — nó
chống lật thân khi mục tiêu nằm thẳng theo trục sâu, chuyện xảy ra liên tục ở sân này.)

⚠ **Vào tầm chưa đủ, phải CÙNG HÀNG.** Lưỡi kiếm nằm phía trước mặt (trục X); vùng chạm của
nó không với tới kẻ đứng thẳng phía xa. `ShouldAttack` chặn đòn cận chiến khi chưa cùng hàng
(`StickmanAgent.AlignedInDepth`), lái tự động lo phần kéo lại gần.

⚠ **Xác phải có hệ số HÃM.** `StickmanRagdollDefinition` khai `linearDamping = 0` — đúng ở sân
ngang vì trọng lực dừng cú văng. Không trọng lực thì xác giữ nguyên xung lực và **trôi mãi**,
nên `FreezeCorpseWhenResting` không bao giờ đông cứng nó: mỗi cái xác là một ragdoll mô phỏng
tới hết ván. Đặt ở `StickmanController.DampRagdollForGroundPlane`, không sửa bảng đã bake.

⚠ **Đi chéo không được nhanh hơn đi thẳng** (√2 = +41%). Kẹp theo TỔNG vận tốc phẳng, và chỉ
ở nhịp đi lại thường — phản lực trúng đòn và bước dồn cố ý vượt tốc độ đi bộ.

⚠ **Tuyến quân trải theo CHIỀU SÂU.** `CommandNode` xếp cấp dưới lùi dần theo X; ở sân này đó
là cả đạo quân **nối đuôi nhau** đâm vào địch. Tuyến thật vuông góc với hướng tiến.

### 5. Cơ chế và kiểu chơi SINH RA TỪ kiểu nhìn này

Bốn thứ dưới đây **không diễn đạt được ở sân ngang**. Chúng là lý do trục Y đáng có, chứ không
phải trang trí thêm.

| Thứ | Ở đâu | Vì sao sân ngang không có |
|---|---|---|
| **ĐÁNH TẬP HẬU** — đòn từ sườn ×1.25, sau lưng ×1.55 | `StickmanFlankBonus`, một cửa ở `TakeDamage` | Sân ngang chỉ có trái/phải, và nhân vật luôn quay về phía địch ⇒ "vòng ra sau lưng" đòi đi XUYÊN QUA đối thủ |
| **BAO VÂY** (`MissionType.Encircle`) — bịt 5/8 cung quanh chủ soái và giữ | `MapEncirclement` | Quanh một người ở sân ngang chỉ có hai phía: "bị vây" vừa xảy ra liên tục vừa không có đường thoát |
| **SÓNG BỐN PHÍA** — cửa viện binh thêm ở mép gần và mép xa | `MapAssembler.CreateWaveSpawner` | Hai cửa trái/phải là tất cả những gì sân ngang có |
| **VÒNG BO HAI TRỤC** | `MapBattleRoyale.InZone(Vector2)` | Vòng bo một trục ở sân hai chiều là một BĂNG DỌC: lùi về mép xa đứng là an toàn vĩnh viễn |
| **ĐỘI HÌNH CÓ HÌNH** — 7 thế trận (hàng ngang · hàng dọc · mũi nêm · hạc dực · ô vuông · vòng tròn · tản khai), người chơi CHỈ ĐỊNH hoặc tướng máy tự chọn | `GroundFormation` · `TeamCommander.Ground.cs` · `FormationHud` (F4) | Một trục chỉ xếp được THỨ TỰ trước–sau; "bọc sườn", "vành kín bốn mặt", "tản ra tránh mưa tên" đều cần trục thứ hai. Luật: `Command.md` § đội hình sân 3/4 |

⚠⚠ **AI PHẢI BIẾT LUẬT MỚI, KHÔNG CHỈ NGƯỜI CHƠI.** `StickmanAgent.FlankingDepthFor` cho lính
cận chiến vòng ra sườn (chọn bên theo `EntityId` nên một tiểu đội tự tách thành hai gọng kìm).
Thiếu vế này thì đánh tập hậu là *"bảng được người chơi tôn trọng, bị AI bỏ qua"* — đúng lỗi dự
án đã dính với bộ chiêu thức theo môn phái.

⚠ **BAO VÂY ĐO BẰNG CUNG, KHÔNG ĐẾM ĐẦU NGƯỜI.** Đếm đầu người thì dồn cả 8 lính vào một phía
cũng "thắng" — đo được: 8 người dồn một phía chỉ bịt **2/8** cung, 5 người dàn đều bịt đủ 5
(`Docs/Tools/sim_groundplane.py`).

### 6. TRỌNG TÀI RỜI — `ModeKind`, trục nhân thứ hai

`Assets/Scripts/Core/Run/ModeKind.cs` · `Assets/Scripts/Map/Match/MapModeBinder.cs`

35 lớp `MatchModeBase` sống trong scene Demo dựng tay, nên phần lớn **chỉ chơi được ở đúng một
map, một kiểu nhìn, một thể loại**. Nhưng chúng gần như đều là bộ LUẬT THẮNG thuần tuý — đếm
mạng, thang vũ khí, giữ mục tiêu — không cần hình hài riêng của cái scene chứa chúng.

`MapDefinition.attachMode` gắn một trọng tài rời lên map SINH LÚC CHẠY, `MapModeBinder` nối nó
vào những thứ map đã có (người chơi, hai phe, cửa viện binh, cột mốc). 11 trọng tài × 23 nhiệm
vụ × 4 thể loại × 2 kiểu nhìn — **không thêm một scene nào**.

⚠ Không phải mode nào cũng có mặt, và đó là chủ ý: `BombDefusalMode` cần bãi đặt bom,
`MobaLaneMode` cần trụ và làn, `NavalBattle` cần mặt nước. Nối bừa thì mode chạy, HUD hiện, và
luật thắng **không bao giờ đạt được** — im lặng hơn hẳn việc vắng mặt. Chúng cần `MissionType`
riêng để map DỰNG RA đồ đạc của chúng.

⚠ Bảng ghép mode↔nhiệm vụ nằm ở `StickmanGroundPlaneBuilder.ModePairs` — ghép sai là cùng một
lỗi im lặng (đấu trường không có cửa viện binh, ám sát không có ai để giết).

### 7. HÌNH HỌC CÔNG TRÌNH — thứ KHÔNG chuyển sang được

⚠⚠ **THÀNH PHẢI XOAY 90°, KHÔNG PHẢI ĐỔI ART.** Ở sân ngang, bức tường chạy theo TRỤC X và
chặn đường bằng **CHIỀU CAO** (không trèo qua nổi ⇒ phải đập cổng). Ở sân mặt đất không có
chiều cao: đúng bức tường ấy nằm **song song với hướng tấn công**, cao 3 đơn vị trong một sân
sâu 18, và địch **đi vòng qua trong hai giây**. Trận vẫn chạy, thành vẫn đứng, không lỗi nào
báo. Bản mặt đất (`MapCastle.Ground.cs`) dựng tường chạy theo TRỤC SÂU, trải hết dải đi lại,
cổng ở giữa là chốt chặn duy nhất.

⚠⚠ **TƯỜNG CHẠY DỌC CẦN ART RIÊNG — XOAY TẤM NGANG 90° LÀ SAI.** Trong phép chiếu 3/4 thẳng
(không xoay iso), hai mặt dài của một bức tường chạy gần→xa hướng về ±X nên thấy **nghiêng
hết**; thứ duy nhất còn thấy là MẶT TRÊN. Xoay tấm tường ngang thì phần "chiều cao" của ảnh
(răng cưa, lối đi) nằm theo trục X — răng cưa chìa ra hai bên tường thay vì vươn lên màn hình.
Đo được: chân đế dày 1.1 mà art phủ **2.42, gấp 2.2 lần**. Nên có `RoleWallPost`/`RoleGatePost`
— một ĐỐT tường nhìn từ trên, xếp chồng dọc Y và để `StickmanDepthSort` lo che nhau.

⚠ **ĐỪNG GÕ HỆ SỐ CO GIÃN.** Bản đầu nhân 2.2 và 1.8 cho "trông vừa mắt"; đo lại thì cả hai
đều sai. `DressGroundPiece` suy hết từ CHÂN ĐẾ: vật là khối đứng (tháp, nhà) thì khớp bề ngang
và giữ tỉ lệ ảnh; vật là mặt phẳng nhìn từ trên (đốt tường, cổng) thì phủ đúng chân đế.

**BỘ ART 3/4** (`StickmanBuildingArt.Ground.cs`, 10 tấm: nhà · đình · tháp · tường ngang ·
cổng ngang · đốt tường dọc · cổng dọc · cây · đá · bụi). Ba nét làm nên góc nhìn — thiếu nét
nào cũng tụt về "nhìn ngang", và lượt vẽ đầu thiếu cả ba:
**(1) thấy MẶT TRÊN** (mái là hình thang thu hẹp lên trên, tường có dải lối đi sáng màu);
**(2) BÓNG ĐỔ ở chân**; **(3) ánh sáng từ trên** (mặt trên sáng nhất, mép dưới tối nhất).

⚠ Đây là art VẼ BÙ (`AssetGeneration.md` luật 0) — trước đợt này dự án không có một tấm 3/4
nào. Muốn đẹp hơn thì đặt ChatGPT vẽ đúng khổ rồi thả đè; `StickmanArtSource` giữ art tay.

**BÓNG ĐỔ NHÂN VẬT** (`StickmanGroundShadow`) không phải trang trí: ở sân này thứ DUY NHẤT nói
cho mắt biết ai đứng đâu theo chiều sâu là toạ độ Y của bàn chân — mà bàn chân lẫn vào nền, và
người xa với người gần trông y hệt nhau. Gắn ở `StickmanController.EnsureSortingGroup` (chỗ
mọi nhân vật đi qua) nên không prefab/scene nào phải sửa.
⚠ `GroundOffset` là `chân − gốc` nên nó ÂM: phải CỘNG. Trừ là bóng bay lên ngang bụng.

### 8. KIỂU CHƠI CHỈ SỐNG Ở SÂN MẶT ĐẤT

Ba kiểu chơi cần một trục mà sân ngang **không có**. Chúng bị KHOÁ vào `ViewPlane.Ground`, và
nguồn sự thật là **`MissionInfo.RequiresGroundPlane`** — hỏi hàm đó, đừng kê lại danh sách.

| Kiểu chơi | Cần gì ở sân ngang không có |
|---|---|
| **Bao vây** (`Encircle`) | quanh một người phải có 360°; sân ngang chỉ có hai phía |
| **MOBA hai làn** (`MobaLanes`) | hai làn là hai dải CHIỀU SÂU; sân ngang chồng chúng thành một |
| **Tam Quốc** (`ThreeKingdomsClash`) | ba kinh đô đặt thành TAM GIÁC; xếp thẳng hàng thì nước giữa luôn chết trước |

⚠⚠ **BỐN NƠI CÙNG HỎI CÂU NÀY** — `MapGenerator` (ép lúc sinh), `StickmanMapSystemBuilder`
(map mẫu dựng bằng tool, **KHÔNG** đi qua `MapGenerator`), `StickmanDoctor` (phép đo), Xưởng
map. Chép danh sách ra bốn nơi là sót ít nhất một, và chỗ sót KHÔNG BÁO LỖI: map sinh ra ở sân
ngang, mở lên chơi được, luật thắng đơn giản không bao giờ đạt. Đã dính đúng vậy với
`Med_Encircle` trong chính đợt này.

⚠ MOBA và Tam Quốc đều cần một **cửa RUNTIME** (`Setup`) — bản `EditorSetup` của chúng nằm
trong `#if UNITY_EDITOR` nên map sinh lúc chạy không gọi được, và đó là lý do trước nay chúng
chỉ tồn tại trong scene dựng tay. Cùng khuôn `MobaTower.SetupTower` / `EditorSetupTower`.

⚠ Tam Quốc sinh **nước thứ ba tại chỗ** (`MapAssembler.ThreeKingdoms.cs`) thay vì thêm `armyC`
vào `MapDefinition` — thêm field là 100+ asset map cũ phải trả lời một câu hỏi vô nghĩa với
chúng. Cùng khuôn `BuildDuel` (nhiệm vụ tự sinh nhân vật của nó).

### 9. HỆ THỐNG DÙNG CHUNG — cái nào tự chạy, cái nào phải sửa

| Hệ | Ở sân mặt đất | |
|---|---|---|
| Thời tiết | **tự chạy** | `WeatherAmbience` bám camera, hạt dùng `gravityModifier` riêng chứ không phải `Physics2D.gravity` |
| Đèn 2D (URP) | **tự chạy** | `Light2D` đặt theo toạ độ thế giới, không quan tâm trục Y nghĩa là gì |
| Hiệu ứng | **tự chạy** | `EffectManager` sinh theo toạ độ; bậc vẽ `Effect` nằm trên mọi thứ |
| **Ngày / đêm** | **PHẢI SỬA** | xem dưới |

⚠⚠ **NGÀY/ĐÊM PHẢI NHUỘM MẶT SÂN.** `DayNightCycle` đổi `camera.backgroundColor` và
`SkyBackdrop` — cả hai đều là BẦU TRỜI, thứ chiếm phần lớn khung hình ở sân ngang. Ở sân mặt
đất bầu trời **không tồn tại**: khung hình gần như toàn bộ là mặt sân. Nên chu kỳ chạy đúng,
`WorldLighting.NightAmount` lên tới 1, AI thu tầm nhìn thật — mà **màn hình gần như không đổi
màu**, và người chơi đọc ra thành "đêm bị hỏng". `MapGroundNight` nhuộm mặt sân, tường, công
trình và đồ rải.
⚠ KHÔNG nhuộm nhân vật: thân stickman vốn đã ĐEN, tối thêm là mất đường bao — mà đọc trận về
đêm phụ thuộc đúng cái đường bao đó. Đêm làm NỀN tối đi để người NỔI LÊN.
⚠ Nhớ màu ban ngày MỘT LẦN rồi luôn tính TỪ màu gốc; nhân dồn lên màu hiện tại là vài chục
frame sau cả sân đen kịt.

### 10. BÀN THỬ AI — `MapGroundLabHud` [F3]

⚠ **KHÔNG port `Demo_8_AILab` sang.** 29 khu của nó xếp dọc trục X và mỗi khu là một bài test
của sân ngang (trèo tường · nhảy khe · tụt sàn · leo thang · địch ở tầng khác) — **không cái
nào tồn tại ở đây**. Chép sang là 29 khu trống, bấm vào không có gì xảy ra.

Bàn thử gắn thẳng lên sân map thật (không dựng scene lab riêng — lab tách ra là mọi bài test
đúng trong lab rồi sai trong trận) và hỏi những câu của SÂN MẶT ĐẤT: hai thanh cấp AI cho hai
phe, công tắc đánh tập hậu để xem lại **cùng một ván** có và không có luật, chiều sâu của
người chơi, và số cung vòng vây.

### 11. Làm gì để chơi

```
Tools > Stickman > Nâng cao > Maps > 8. Build SÂN MẶT ĐẤT (top-down 3/4, mọi kiểu chơi)
```

Sinh `Recipe_Ground_<thể loại>` + map mẫu cho mỗi (thể loại × nhiệm vụ) + 4 sân
`Demo_70..73_MapGround*`. Trong sân: **A/D** đi ngang · **W/S** ra xa / lại gần · **F2** chọn
nhiệm vụ · **N** sinh map mới · **F5** chơi lại.

Phép đo: «★ KHÁM SỨC KHOẺ DỰ ÁN» › *Sân mặt đất* (`StickmanDoctor.GroundPlane.cs`) — bắt map
top-down còn khai bục/hố/đồi/thang/`wrapAround`, và khung nhìn hẹp hơn bề sâu.

### 12. Còn nợ

- **PHỐ MỞ nay CHẠY ĐƯỢC** (`MapOpenWorld.Ground.cs`): lòng đường ở giữa, hai dãy nhà hai bên,
  tầm với cửa tiệm đo 2D. Chìa khoá là nhận ra **một con phố VỐN là một trục** — thứ sân mặt
  đất thêm vào không phải "thành phố hai chiều" mà là HAI DÃY NHÀ hai bên đường (đúng hình ảnh
  GTA 1–2). Nhờ vậy mọi hệ cũ (sao truy nã · cướp xe · việc thuê · băng đảng) chạy nguyên vẹn
  vì chúng hỏi `.x`, mà `.x` không đổi nghĩa.
  ⚠ **CÒN THIẾU:** phố CẮT NGANG, ngã tư, ô phố vuông. Thành phố hiện là MỘT con phố dài, chưa
  phải một lưới ô phố.
- **Đã trả xong:** vật trang trí và công trình nay xếp lớp theo chiều sâu
  (`StickmanDepthSort`, gắn tự động ở `MapSpawn` — cái phễu mọi vật của map đi qua);
  `LaneNav` thoát ngay ở `TryRoute` nên không còn quét collider mỗi 6 giây.

### 13. CẢNH VẬT SÂN 3/4 — `MapGroundField.Detail.cs` (2026-09-09)

User: *"tối ưu tạo map cho cả view 3/4, thêm nhiều chi tiết"*. Bản trước dựng sân 3/4 bằng ĐÚNG
bốn thứ — một tấm sàn, một vệt cỏ mép gần, bốn tường biên, và một vòng rải 10–70 vật bốc đều
trong **ba tấm hình** (cây · đá · bụi). Ở nhìn ngang thì bầu trời, đường chân trời và quả đồi
gánh phần nền; ở 3/4 thì **mặt sàn chiếm hết khung hình**, nên một mặt sàn phẳng rắc đều ba loại
vật đọc ra tấm bạt trải sân tập.

**Art:** bộ `Ground` lên **36 tấm** (`StickmanBuildingArt.GroundProps.cs`, 26 tấm mới) — vết đất ·
đường mòn · ao · hàng rào · giậu · luống cây · bao cát · thùng · lều · giếng · xe · đống rơm ·
lửa trại · cột mốc · đèn · sạp hàng · tường đổ · tượng đá · thông · cây chết · gốc cây · lau sậy.
Bảng tên vai ở **`StickmanBuildingArtRoles`** (assembly RUNTIME) — phía Editor trỏ sang, không gõ
lại chuỗi: runtime không import được namespace editor-only, mà hai bản chuỗi thì trôi khỏi nhau
và biểu hiện là *art vẽ xong nằm chết*. `MapLibrary.groundProps` là BẢNG vai→hình, builder quét
`GroundPropRoles` nên thêm tấm mới không phải sửa wiring.

**Bốn luật dựng cảnh** (đều là luật CHƠI, không phải luật đẹp):

| # | Luật | Vì sao |
|---|---|---|
| 1 | **CHIA VÙNG, không rải đều** | rải đều = entropy cao nhất, mọi chỗ giống mọi chỗ. Dải XA (làng · rừng · tuyến cây nền) · dải GIỮA (đường cái · ruộng) · dải GẦN (chỉ vệt đất + đồ thấp) |
| 2 | **Dải giữa sân trống** (`CentreLane` 0.16) | chỗ hai đạo quân gặp nhau |
| 3 | **Vật cao chỉ ở nửa xa** (`TallProp` 0.7 · `TallPropMinDepth` −0.15) | `StickmanDepthSort` xếp lớp ĐÚNG, và "đúng" nghĩa là cái lều ở mép gần CHE cả trận đánh |
| 4 | **Không collider, một cái cũng không** | `UpdateBlockedPath` nhận nhầm deco làm vật cản. Muốn vật chắn thật thì dựng `Fortification` |

**Ba con số đã sai ở bản đầu, và cả ba chỉ nhìn ra bằng MẮT** (bản mô phỏng
`.claude/skills/stickman-assets/scripts/ground_field_preview.py` render cả sân ra PNG):

| Sai | Đo được | Sửa |
|---|---|---|
| Lùm cây đếm theo BỀ NGANG (`hw × 0.22 × density`) | sân 22×6.5 biome *rừng rậm* ra **3 cây** — và lùm rơi vào dải giữa bị `continue` bỏ luôn lượt | đếm theo DIỆN TÍCH (`hw × hd × 0.075 × density`, 2..26) + **bốc lại** thay vì bỏ lượt |
| Đồ thấp `hw × hd × 0.10` | **14 vật** cho sân 44×13 world ⇒ nửa dưới màn hình trống trơn | `× 0.45` (30..220) + lượt VỆT ĐẤT riêng cho dải gần |
| Làng và ruộng mỗi cái tự bốc một phía | ¼ số seed dồn cả hai sang cùng bên, nửa map trống | một `villageSide`, ruộng lấy `-villageSide`, lùm cây luân phiên |

Thêm hai thứ bản đầu không có: **TUYẾN CÂY NỀN** chạy suốt mép xa (`Backdrop` 0.86 — nó đóng khung
cả sân, thiếu là mép trên màn hình thành một dải màu phẳng), và **ĐƯỜNG CÁI LƯỢN** theo sin
(thẳng băng thì đọc ra cuộn băng dính dán ngang màn hình). Ao **né hành lang đường** ±1.8, không
thì có seed ra cái ao nằm đè lên mặt đường và hàng rào chạy xuyên qua giữa hồ.

**Dáng sân** (`FieldMood`) là hàm của `mission` + `biome`, không phải enum mới: làng · ruộng ·
trại · phế tích · ao · mật độ cây · hai vai cây. Kinh tế/hộ tống ra làng + ruộng; sinh tồn/zombie
ra phế tích; sa mạc và núi lửa gần như trụi.

⚠ Bộ art 3/4 **chưa từng được sinh ra** trên máy này (`Assets/Sprites/Buildings/Ground/` trống) —
mọi ô `groundXxxSprite` đang null và sân 3/4 đang rơi về art nhìn ngang. Bấm
`Maps > Build hệ thống map` (nó gọi cả `BuildGroundSet` + `BuildGroundPropSet`), hoặc hai mục
`Art > Vẽ công trình SÂN MẶT ĐẤT (3/4)` và `Art > Vẽ ĐỒ RẢI sân 3/4 (vẽ bù)`.
(2026-09-12: bộ art đã có 36 tấm trên đĩa — đoạn cảnh báo trên là lịch sử.)

### 14. ĐỊA HÌNH CÓ TỐC ĐỘ + SÔNG — `GroundTerrainZone` · `MapGroundField.River.cs` (2026-09-12)

User: *"xem chế độ view 3/4 đang thiếu gì, thêm ý tưởng gameplay và tạo map"*.

**Soát ra:** sau ba đợt, sân 3/4 có vật lý · AI · cảnh vật · 25 nhiệm vụ · 11 trọng tài, nhưng
**mặt sân ĐỒNG NHẤT**. Không độ cao (đúng), đồ rải không collider (đúng, mục 13 luật 4) ⇒ đứng
đâu cũng như đâu, đi lối nào cũng bằng nhau; bùn · nước · đường cái chỉ là HÌNH. Kiểu nhìn có
hai trục mà không có một QUYẾT ĐỊNH nào về đường đi — hai đạo quân gặp nhau ở giữa và đánh.

**Chữa bằng VÙNG TỐC ĐỘ, không collider, không tìm đường** (`Assets/Scripts/Combat/World/GroundTerrainZone.cs`):

| Thứ | Ở đâu | Luật |
|---|---|---|
| Vùng | `GroundTerrainZone` (Combat) | Rect thế giới + hệ số kẹp [0.2 .. 1.6] + bậc ưu tiên. Không sprite, không collider |
| Tốc độ | `SpeedAt` → `StickmanLocomotion._terrainScale` | nhân vào `SpeedScale` đúng tiền lệ `_slopeScale`; đọc ở ĐẦU `FixedUpdate`, TRƯỚC `targetX` |
| Đường đi | `RouteDepth(from, to)` | vùng chậm (< 0.75) chắn ≥ 1.6 × HalfDepth giữa mình và đích ⇒ trả độ sâu của CHỗ QUA rẻ nhất, đo bằng THỜI GIAN (quãng ÷ hệ số) |
| Ai hỏi | `StickmanAgent.PublishDepthTarget` · `StickmanLocomotion.MoveTowards` | cùng một hàm ⇒ AI TÔN TRỌNG bảng, không phải "người chơi tôn trọng, AI bỏ qua" lần ba |

**SÔNG** (`MapGroundField.River.cs`, `FieldMood.river`): dải giữa sân (±12 % bề ngang), chạy hết bề
sâu. Nước sâu ×0.32 (ưu tiên 0) · **CẦU** trên tuyến đường cái ×1.0 (ưu tiên 2, rộng 2.6) ·
**BẾN LỘI** ở nửa sâu đối diện ×0.6 (ưu tiên 1, rộng 2.1). Lội được, nhưng trả giá — cầu nhanh
mà chật, bến lội chậm mà vòng ra sườn được (`StickmanFlankBonus` ×1.25). Đầm lầy LUÔN có sông;
Annihilation · CapturePoints · TugOfWar · CaptureFlag · TeamDeathmatch bốc 30 % theo seed
(`RiverFits`); xe hàng · VIP · bao vây KHÔNG có (chúng đi theo `DepthAt`, không theo cầu).

Ba chỗ biết sông tồn tại, không hơn: `Stand` (không gì đứng trong nước), ụ cát + vệt đất né,
và **`MapAssembler.GroundPoint`** kéo mốc rơi vào nước lên cầu/bến lội gần nhất
(`SnapDepthOutOfRiver`) ⇒ điểm chiếm giữa sân tự thành «GIỮ CẦU» mà 20 hàm dựng mục tiêu không
phải biết gì.

⚠ Bẫy đã chặn: hệ số 0 = chôn chân vĩnh viễn (kẹp `MinSpeed`); vũng nhỏ không phải sông
(`RouteDepth` bỏ qua vùng thấp hơn 1.6 × HalfDepth); đích nằm TRONG nước thì đi thẳng; `MoodOf`
LUÔN bốc một số cho sông để chuỗi seed không lệch giữa map có và không có điều kiện; vùng đọc
theo gốc rig, sai lệch bàn chân không đáng kể vì vùng đo bằng mét.

**Map có tên** (`Assets/Editor/Maps/StickmanGroundLandmarkMaps.cs`, menu `Maps > 8b`, `BuildAll` gọi
`EnsureAll`): **Bến Đò Đầm Lầy** (`Grd_Medieval_BenDo`, Chiếm cứ điểm, 24×11, seed 9120) ·
**Cầu Đầm Lầy** (`Grd_Modern_CauDamLay`, Tử chiến đồng đội, 26×10, seed 9121). Vẫn sinh qua
`MapGenerator.Generate` rồi ghi đè biome · bề sâu · quân số; không điền tay cả asset.
Xem trước bố cục: `.claude/skills/stickman-assets/scripts/ground_field_preview.py` (mood `ben_do`).

### 15. ĐỢT HAI 2026-09-12 (*"làm hết dùm tôi"*) — bảy luật chơi CHỈ sân 3/4 mới có, đã làm

Tất cả đều là VÙNG (`GroundTerrainZone`) hoặc đọc vùng — không collider, không tìm đường mới.

| Luật | Ở đâu | Số |
|---|---|---|
| **Cỏ cao che tầm nhìn** | `MapGroundField.Terrain.cs` (2–4 vạt, dải gần + dải xa) · `GroundTerrainZone.HiddenFrom` · `StickmanAgent.Ground.SightBlocked` thay `FloorBlocksSight` trong `FindNearestEnemyRaw` | trong cỏ chỉ bị thấy < 3 đơn vị; đi ×0.9 |
| **Đồi giả** | `BuildHills` (1–2 gò ở nửa xa) · `StickmanTerrainBonus` — gọi ở đầu `StickmanFlankBonus.Apply` (cùng cửa `TakeDamage`) | đứng trên đánh ra ×1.2; bị đánh lên dốc ×0.85 |
| **Cầu phá được** | hai gờ cầu là thân `Fortification` (Barricade, đội −1, passable, KHÔNG objective; ván không collider nên đạn bay ngang cầu vẫn bay) · `RiverCrossing.PollBridge` | máu `BridgeHealth` 240; sập ⇒ vùng cầu ×0.32, ván tắt, `EffectEvent.Collapse`. `FinishFort` khai repairable nên thợ sửa được |
| **Mưa dâng nước** | `RiverCrossing.PollFlood` đọc `WeatherAmbience.Kind == Rain` | bến lội ×0.6 → ×0.32, tối màu; tạnh thì trả lại (nhớ màu gốc MỘT lần) |
| **Ngã xuống nước choáng** | `StickmanLocomotion.Ground.UpdateGroundTerrainScale`: bước vào nước sâu KHI đang bị hất (`_hitRecoilUntil`) | `StatusEffectType.Stun` 0.8 s; tự bước xuống thì không |
| **Ngựa chỉ qua cầu** | bến lội `mountsAllowed = false`; `SpeedAt/RouteDepth(mounted)` bỏ vùng cấm ngựa, lội thẳng = vô cực | kỵ binh luôn vòng cầu |
| **Bao vây trên sông** | `MapEncirclement.Measure`: cung có điểm dò (0.6 R) rơi xuống nước sâu ⇒ tính là BỊT | chủ soái trên cầu chỉ cần bịt hai đầu + hai bờ |

**Phản hồi khi lội:** `StickmanAudio.PlayKey("Water/Splash")` khi bước xuống, tiếng khẽ theo nhịp
khi còn lội (`TravelSpeed > 0.4`). Chưa có hạt nước — `EffectEvent` không có `Splash`, thêm là
việc của `EffectLibrary` (Effects.md).

**Lệnh chỉ huy theo chiều sâu**: soát ra ĐÃ CÓ — `SquadCommand.OrderMove(Vector2)` truyền `point.y`,
`CommandNode` xếp tuyến theo trục sâu khi `IsGround`. Không phải nợ.

**Doctor**: `CheckGroundPlaneMaps` thêm phép đo map có tên — asset phải tồn tại, `plane = Ground`,
biome và nhiệm vụ đúng bảng `StickmanGroundLandmarkMaps.Expected()`, nhiệm vụ phải qua
`MapGroundField.RiverFits` (nay `public`, và là điều kiện CẦN của sông kể cả ở Đầm lầy — xe hàng ·
VIP · bao vây · MOBA không bao giờ có sông chắn).

⚠ Bẫy đã chặn trong đợt này: `FieldFloorOrder` chỉ được phép −1..+3 ở luật bậc vẽ, sông dùng
+4..+8 ⇒ smoke phạm luật. Nay `WorldPlane.FieldFloorLayers` là nguồn sự thật cho dải mặt sàn,
luật đọc nó, và bảng lớp ghi ngay tại hằng số. Thêm lớp = tăng số + ghi bảng, không gõ số thô.

**Còn thiếu thật (chưa làm, có lý do):**
1. **Không có tìm đường 2D.** Không cần cho tới khi sân có collider chắn thật; hiện mọi "chắn" là
   vùng tốc độ và `RouteDepth`. Thêm collider trước khi có lưới ô/flow field là AI húc tường.
2. **Phố mở** vẫn một con phố (mục 12).
3. **Cầu chỉ bị người chơi phá** — AI không nhắm `Fortification` passable (`FindNearestEnemyUnit`
   chỉ trả người). Muốn AI phá cầu cần một job chỉ huy riêng (`Command.md`).
4. **Camera** không zoom theo bề sâu — chủ ý để không đổi tỉ lệ hình giữa trận.

### 16. KỊCH BẢN SÂN 3/4 — địa danh → mốc nhiệm vụ → luật thắng (2026-09-12, đợt ba)

User: *"lên ý tưởng và chế độ chơi, thuật toán xây map sao cho có cốt truyện, sinh ra đúng vị trí,
có điều kiện thắng thua"*. Thiết kế đầy đủ, bảng kịch bản và ý tưởng chế độ:
[Docs/KnowledgeBase/GroundScenarios.md](../KnowledgeBase/GroundScenarios.md). Luật rút gọn:

- **Sổ địa danh** `MapGroundField.Landmarks.cs`: bộ cảnh `Mark()` cầu · bến lội · đồi · cỏ cao ·
  làng · trại lúc dựng; `MapAssembler` HỎI sổ khi đặt mốc, KHÔNG rải theo `DepthAt` nữa:
  điểm chiếm = `ObjectiveSpots` (cầu → đồi → làng → bến lội → trại, giãn ≥ 4.5, bù lưới khi
  thiếu); cờ = trên cầu; waypoint xe hàng = `RoadDepthAt(x)` (xe đi đường cái ⇒ qua cầu).
  Mọi mốc vẫn đi qua `GroundPoint`/`SnapDepthOutOfRiver` — không mốc nào dưới nước.
- **Kịch bản không thêm `MissionType`.** Một kịch bản = nhiệm vụ có sẵn + `biome` + `forceRiver`
  (field mới trên `MapDefinition`, mặc định false) + `dayNight` (đêm dài = `timeLimit` ⇒ «trụ tới
  bình minh» là luật thật) + văn bản `description`. Luật thắng thua luôn là `MatchRules.DefaultFor`.
- **Cốt truyện hiện trên HUD**: `MatchDirector` in `description` 20 giây đầu dưới tên map.
- `RiverFits` nay mở cho DefendCamp · AssaultCamp · Survival · ZombieHorde · ZombieConvoy ·
  Escort · ProtectVip · FreeForAll (xe/VIP đã biết qua cầu). Vẫn đóng: Encircle · MOBA · Tam Quốc
  · phố mở · đốt làng · giải cứu · công thành đói · BR · cúp/đấu · ARPG.
- Sáu map có tên (`Maps > 8b`): Bến Đò Đầm Lầy · Cầu Đầm Lầy · Giữ Cầu Tới Bình Minh · Xe Lương
  Qua Cầu · Sứ Giả Qua Sông · Đầm Ma. Doctor đo cả `forceRiver`.

⚠ AI vẫn chỉ *hưởng* địa hình khi mốc nằm đúng chỗ; nó chưa tự tìm đồi, chưa tự nấp cỏ, chưa phá
cầu — nợ ghi ở GroundScenarios.md mục 6.

**Luật 19 — mọi thứ trong sân** (`MapBuildRules.Ground.cs`, 2026-09-12, user: *"lắp ráp map có
đúng chưa, trong phạm vi battlefield thôi"*): vật đứng (có `StickmanDepthSort`) trong sân ±0.6;
mốc nhiệm vụ · điểm chiếm trong sân ±0.3 và KHÔNG dưới nước; vùng địa hình (trừ nước) không thò
ra ngoài. Mép thế giới (nền · tường biên · tuyến cây nền · nước sông · nền đường) được miễn theo
tên. Lần đo đầu bắt được đúng một lỗi: **tường thành mặt đất đứng dưới sông** (thành vươn 10–18
đơn vị tới dải giữa, sông cũng ở dải giữa) — nay `BuildCastleGround` dừng tường trước bờ 2 đơn vị
và đặt cổng thẳng hàng với cầu. Đo trên 104 map 3/4 (Trung cổ · Fantasy · Hiện đại): 104 qua.
⚠ Hai «chốt chặn» cùng nằm ở dải giữa (thành và sông) sẽ đè nhau — thứ nào dựng sau phải hỏi thứ
dựng trước (`MapGroundField.HasRiver / RiverX / BridgeDepth`).

### 17. AI ĐI LẠI Ở SÂN 3/4 — bốn lỗi làm quân «kẹt đường · dồn cục» (2026-09-12, đợt bốn)

User: *"AI còn bị kẹt đường và kẹt map, không di chuyển đúng logic, dồn cục; điều phối quân đội
cho hợp lý"*. Cả bốn đều là **luật một trục chạy trên sân hai trục**, và cả bốn đều im lặng.

| # | Lỗi | Ở đâu | Biểu hiện |
|---|---|---|---|
| 1 | **Bộ gỡ kẹt đo bằng `\|Δx\|`** | `UpdateDeadlockBreaker` | Lính đi thuần theo chiều sâu có `\|Δx\|` ≈ 0 ⇒ cửa sổ nào cũng chấm «kẹt» ⇒ chốt một hướng NGANG 1.6 s (bỏ mục tiêu) và **tắt cả hai vế giãn cách** suốt thời gian đó ⇒ dồn cục. Nghỉ 2 s rồi lặp: ~1.6 trong mỗi 4 s quân đi sai hướng |
| 2 | **Bộ gỡ kẹt đọc ý định bằng `Steer`** | cùng chỗ | Người bị chặn theo CHIỀU SÂU có `Steer` ≈ 0 ⇒ `wantedToMove` không bao giờ đúng ⇒ bộ gỡ kẹt **không bao giờ chạy** cho họ |
| 3 | **`AIStateTravel` đứng lại theo BÁN KÍNH** | `UpdateThreat` | Địch cách 5 đơn vị theo chiều sâu không chắn gì, nhưng bán kính không biết điều đó ⇒ xe hàng · VIP · sứ giả đứng im tới hết ván. Đo được: 2 ca kẹt duy nhất trong 36 map đều là `AIStateTravel` |
| 4 | **Hành quân không có đội hình** | `AIStateSeek.MarchToObjective` | `TryGetFormationLimitX` bị tắt hẳn ở sân mặt đất và **không có gì thay thế** ⇒ cả tiểu đội bay vào một hình tròn bán kính 0.35 |

**Chữa** (`StickmanAgent.GroundStuck.cs` · `StickmanAgent.GroundFormation.cs`):

- **Đo phẳng**: `PlanarIntent` (Steer + DepthInput) · `PlanarTravelFrom(anchor)`. Sân ngang trả
  đúng số cũ nên không một hành vi nào của nó đổi.
- **Thoát kẹt bằng LÁCH NGANG, không quay đầu** (`PickBreakoutVector`): xoay hướng muốn đi 90°
  về phía tâm sân (giữa sân thì theo `EntityId` để tiểu đội tách hai dòng), pha lại 35 % hướng
  gốc. Quanh vật cản ở sân 3/4 có 360° — quay đầu là lời giải của sân một trục.
- **Giãn cách KHÔNG tắt trong lúc chốt hướng ở sân mặt đất** (`SeparationAllowedWhileCommitting`):
  lách ngang đã vuông góc với chỗ bị chặn nên hai lực không triệt nhau.
- **Chắn đường = TRONG HÀNH LANG, không phải trong bán kính** (`BlocksTravel`): ở phía trước
  theo hướng đi và lệch ngang ≤ 1.6.
- **Chỗ đứng riêng quanh mốc** (`StationAt`): 9 khe theo chiều sâu cách nhau `separationRadius`
  × 1.2, đánh số bằng BỘ ĐẾM tăng dần (⚠ **không băm** — mô phỏng cho thấy `hash % 9` để lại
  3–4 cặp trùng khe, khoảng cách 0.00); lùi theo vai: khiên 0 · cận chiến 0.7 · tầm xa 2.4.
  Đây là bản mặt đất của `TryGetFormationLimitX`. Đo bằng mô phỏng: 9 quân một mốc = **36 cặp
  chồng**, có chỗ đứng riêng = **0 cặp**, gần nhất 0.84.
- ⚠ `AIStateSeek` và `PublishDepthTarget` phải nhắm **cùng một** chỗ đứng, không thì trục X đi
  một đằng trục sâu lái một nẻo và người đi chéo mãi không tới.

**Hai lỗi map lộ ra nhờ phép đo** (không phải AI): mốc phá vây của `MapEncirclement` kẹp đúng
vào mép sân ⇒ chủ soái bị dí vào tường (nay chừa lề 1.5); và **gờ cầu của tôi ở đợt trước là
collider ĐẶC** ⇒ ở sân 3/4 nó là bức tường chắn ngang mặt cầu (nay là TRIGGER — đạn và đòn chém
vẫn trúng vì `MeleeWeapon` quét với `useTriggers = true`, nên cầu vẫn phá được).

**Lỗi thứ năm, chỉ lộ ra khi AI đã đi được** (`AIStateTravel`): cờ `_arrived` chốt VĨNH VIỄN.
`MapEncirclement` dời mốc phá vây tới cung hở nhất mỗi nhịp, nhưng chủ soái chạy tới cửa đầu
tiên, «tới nơi», rồi đứng im hết ván trong khi vòng vây khép lại và cửa mở ở chỗ khác — cả vế
PHÁ VÂY của kiểu chơi biến mất. Nay đích rời ra xa hơn **hai lần** tầm tới thì đi tiếp (hai lần
chứ không một, để không nhấp nháy tới-chưa-tới mỗi khi mốc nhích).

**Phép đo mới**: smoke play-mode in thêm `chồng N` — số người còn sống có ≥ 2 đồng đội trong
0.55 (`StickmanMapSmokeTest.CountClumped`). Hai người sát nhau là bình thường; ba người chụm một
chỗ thì không còn là đội hình.

### 18. MENU ĐỘ KHÓ AI (2026-09-12)

`AIDifficultyChoice` (Core) — một con số trong hồ sơ người chơi, áp cho MỌI phe máy.

- **Không đụng máu hay sát thương**, chỉ đổi bậc `AISmartsTable` (nhịp nghĩ · độ trễ nhận ra ·
  đỡ đòn · phối hợp · nhặt đồ). Nhân máu lên là thứ người chơi phát hiện nhanh nhất.
- Mặc định `Auto` (−1) = «theo màn chơi», **không phải bậc 0** (bậc 0 là TÂN BINH thật). Cùng
  cái bẫy đã ghi ở đầu `TeamAILevels`.
- Chỗ áp DUY NHẤT: `MapAssembler.ApplyChosenDifficulty` — nơi duy nhất biết phe nào của người
  chơi, có những phe nào, và lúc nào quân bắt đầu sinh. Scene dựng tay (AI Lab) không đi qua đó
  nên bài test «bốn NPC khác cấp cùng một phe» còn nguyên.
- ⚠ Chọn lại «theo màn chơi» phải `TeamAILevels.ClearAll()`: sổ đó TĨNH, sống qua scene — không
  xoá là độ khó cũ bám dai và người chơi đọc ra thành «game tự nhiên khó lên».
- ⚠⚠ **ÁP SAU KHI RA QUÂN, KHÔNG PHẢI TRƯỚC** — bản đầu của tôi đặt trước `BuildArmy` và **không
  tới một ai**, im lặng hoàn toàn: `TeamAILevels.Set` chỉ quét agent ĐANG CÓ trong scene, còn
  `ApplyToNewUnit` (hàm sinh ra đúng để lo quân mới) thì **không một chỗ nào trong dự án gọi**;
  thêm nữa `SpawnUnit` tự gọi `SetSmartsLevel(army.smartsLevel)` nên có áp trước cũng bị ghi đè.
  Nay `SpawnUnit` gọi `TeamAILevels.ApplyToNewUnit` ở cái phễu mọi người lính đi qua, nên viện
  binh và quân hồi sinh cũng đúng cấp. Bài học cũ, dính lại: *đo mắt xích CUỐI*.
- Hai chỗ bấm: nút **Địch: …** trên thanh `DemoSceneSwitcher` (50 màn, kể cả bốn sân 3/4) và
  hàng **Độ khó AI** trong màn hình cài đặt của `GameShell` (chỉ có ở `Menu_Main`, `Demo_59` —
  đó là lý do phải có cả nút trên thanh).

### 19. ĐỢT NĂM 2026-09-12 — bậc vẽ · vật chắn · xác ngã · art thống nhất

User: *"tạo map 3/4 order layer lung tung, hình ảnh rời rạc không thống nhất, AI di chuyển lung
tung, khi chết không có ragdoll, muốn có collider thành quách hợp lý"*. Năm triệu chứng, và
**không cái nào là chuyện thẩm mỹ** — mỗi cái là một con số sai, đo được.

#### 19.1 «Order layer lung tung» — bậc gốc bị CỘNG THẲNG vào chiều sâu

`StickmanWorldSorting` cách nhau 10 bậc mỗi tầng; ở sân 3/4 thì **20 bậc = 1 đơn vị chiều sâu**.
`StickmanDepthSort` cộng thẳng bậc gốc vào ⇒ mỗi LOẠI vật tự nhận một ĐỘ LỆCH CHIỀU SÂU GIẢ:

| Vật | Bậc gốc | Quy ra chiều sâu |
|---|---|---|
| cây · đá · lều (`BackProp`) | −50 | **lùi 2.41** |
| nhà (`Building`) | −40 | lùi 1.91 |
| tường thành (`Structure`) | −30 | lùi 1.41 |

Tức cái cây phải đứng gần hơn người **2.4 đơn vị (22 % cả bề sâu sân 11)** mới được vẽ đè lên
người: đi sau gốc cây vẫn hiện nguyên hình trước gốc cây. Và vì mỗi loại một độ lệch, thứ tự
giữa cây và tường cạnh nhau cũng sai theo một hằng số khác nữa — đó là chữ «lung tung».

Chữa: `WorldPlane.SortingTieBreak` ép bậc gốc vào ±6 (= 0.3 đơn vị) rồi mới cộng. Thứ tự tương
đối trong bảng giữ nguyên tuyệt đối, nhưng CHỖ ĐỨNG luôn thắng LOẠI VẬT.
⚠ KHÔNG sửa bảng gốc: ở sân ngang nó đúng, và nó đã bake vào 90+ scene. Chỗ sai là phép CỘNG.

⚠ **Ba mốc chiều sâu phải là MỘT.** Vật neo ở CHÂN ĐẾ (`bottomY`), bóng đổ vẽ ở BÀN CHÂN, mà
`StickmanSortingGroup` lại xếp theo GỐC TRANSFORM — cao hơn bàn chân 0.089 (`GroundOffset`).
Nay dùng `DepthAnchorY` = gốc + `GroundOffset`.

#### 19.2 «Hình ảnh rời rạc» — 13/36 tấm chưa bao giờ đi qua hậu kỳ

Nguyên nhân không nằm ở tấm nào, nó nằm ở một cái van: `EnvCanvas.Refine` thoát sớm khi
`IsWash()` chấm tấm đó là MẢNG LOÃNG — thoát **trước** cả `Shade`, `Crease`, `EdgeOutline`.
Van đó hiệu chuẩn cho mây/mưa (*alpha trung bình < 0.90*), mà cây · bụi · đá · xe · rào của bộ
3/4 vẽ bằng `Blob` (mép tãi) nên alpha trung bình rơi đúng 0.78…0.90.

Đo được: **13/36 tấm (36 %)**, và đúng là toàn bộ nhóm hữu cơ — Tree · TreePine · TreeDead ·
Bush · Rock · RockSmall · Reed · Flowers · Fence · Cart · Campfire · Lamp · Sandbag. Xếp cạnh
House/Keep/Tower (có viền, có khối) thì mắt đọc ra hai bộ art khác nhau.

⚠⚠ **KHÔNG ĐƯỢC CHỮA BẰNG CÁCH SỬA `IsWash`.** Đã thử tách bằng "lõi đặc" và ĐO trên art thật:
mây `Cloud_Puff` lõi đặc **77 %**, lau sậy `Reed` **59 %** — hai nhóm CHỒNG LÊN NHAU, không
ngưỡng nào tách được. Nới van là mây với mưa bị viền đen.
Chữa ở chỗ khác: `IsWash` là PHÉP ĐOÁN cho nơi gọi không biết mình vẽ gì; bộ 3/4 thì BIẾT (không
có tấm mây nào). Nên bộ này đi đường riêng — `EnvCanvas.GroundFinish`, hậu kỳ VÔ ĐIỀU KIỆN, cộng
ba việc thống nhất: **chuẩn hoá dốc sáng** (đo dốc sẵn có rồi bù phần thiếu, không áp dốc cố
định), **vết chạm đất** ở đáy thân, **bóng đổ bẹt + viền** đồng nhất.

| | trước | sau |
|---|---|---|
| dốc sáng đỉnh/đáy | 1.06 … 3.29 (giải 2.23) | 1.38 … 2.74 (**giải 1.36**) |
| viền phủ | 4 % … 81 % | **43 % … 93 %** |

⚠ Vết chạm đất KHÔNG thừa so với bóng đổ: vật có hàng đáy ĐẶC KÍN (tường 100 % · luống rau
100 % · cổng 100 % · đụn rơm 87 % · tượng 85 % · lều 83 %) thì ê-líp bóng rơi trọn vào chỗ đã
đục, `1 − alpha` bằng 0, và **không một pixel bóng nào được vẽ**.
Nhìn trước khi sửa số: `.claude/skills/stickman-assets/scripts/ground_unify_preview.py` (giữ 1:1
với C#). ⚠ Phải bấm lại hai mục `Art > Vẽ công trình SÂN MẶT ĐẤT (3/4)` và `Art > Vẽ ĐỒ RẢI sân
3/4` thì 36 tấm mới sinh lại — sửa code không đụng được vào PNG đã nằm trên đĩa.

#### 19.3 «AI di chuyển lung tung» — luật một trục chạy trên sân hai trục, lần hai (tiếp §17)

`ApplySeparation` vẫn đo `distance = |dx|` ở **cả hai sân**, trong khi `ApplyDepthSeparation`
(sinh sau, đợt §13) đã đo 2D và chú thích đúng cái bẫy này. Mà `StickmanAgent.GroundFormation` thì **CỐ Ý**
trải cả tiểu đội theo CHIỀU SÂU tại **cùng một X** (tuyến quân vuông góc hướng tiến). Hai thứ đó
gặp nhau:

> đội hình 9 người, giãn 0.84: **72/72 cặp (100 %)** lọt bán kính giãn cách theo `|dx|` dù thực
> tế cách nhau tới 6.8 đơn vị. Mỗi người nhận tổng lực đẩy 8.0, kẹp về 1.0 — **đẩy hết cỡ sang
> ngang**. Và vì `|dx| ≈ 0`, cả 72 cặp rơi vào nhánh `Random.value` **bốc lại MỖI FRAME** ⇒ hướng
> đẩy đảo 50 lần/giây. Cả đội hình run bần bật tại chỗ.

Chữa: thước đổi theo sân (`WorldPlane.Reach`), và phá hoà bằng `StableSide` (so `GetEntityId`,
đối xứng ngược nên hai người tách ra hai phía) thay cho đồng xu. Sau: **0/72**.
⚠ Cùng bài học với «đánh số chỗ đứng bằng BỘ ĐẾM, không băm»: chỗ nào phá hoà cũng phải ỔN ĐỊNH.

#### 19.4 «Chết không có ragdoll» — ragdoll bật, nhưng không có gì bẻ gập nó

`WorldPlane.Enter` tắt `Physics2D.gravity` (đúng). Nhưng ragdoll không phải hệ "rơi xuống": nó là
10 khúc xương nối bằng khớp, và thứ DUY NHẤT bẻ gập nó thành cái xác nằm là trọng lực kéo từng
khúc xuống trong khi bàn chân tì đất. Không trọng lực ⇒ khớp vẫn mềm, vẫn đung đưa, mà **bộ xương
đứng nguyên tại chỗ**; `DampRagdollForGroundPlane` hãm nốt xung lực trong ~1 giây ⇒ xác đứng
thẳng bất động. Mọi hàm đều trả đúng, không lỗi nào báo.

`StickmanGroundCorpse`: trọng lực RIÊNG của xác (11 u/s², hướng xuống màn hình) + **mặt sàn RIÊNG
cho từng xác**, chốt tại bàn chân đúng lúc ngã.
⚠ Sàn phải là của TỪNG xác: mỗi người đứng ở một chiều sâu khác nhau, "mặt đất dưới chân tôi" trên
màn hình chính là toạ độ Y bàn chân tôi. Một con số chung là xác ở mép xa rơi xuyên nửa sân về phía
người xem.
⚠ Đo sàn từ chính BỘ XƯƠNG, đừng hỏi `GroundOffset`: lúc đó nhóm `Sprite` vừa tắt nên nó trả 0.
⚠ Đẩy khỏi sàn bằng VẬN TỐC, không ghi `body.position` — ghi vị trí một mắt xích giữa nhịp vật lý
trong khi 9 khớp đang giữ nó là cái xác giật từng cơn (cùng lý do `ClampToField` cắt bằng vận tốc).
Đo: đầu rơi 0.73 đơn vị trong **0.40 s**, nằm yên ở 0.6 s, lún sâu nhất 4 cm. Hệ số hãm hạ
2.2/1.6 → 1.3/1.2 vì nay đã có sàn + ma sát tiêu tán.

#### 19.5 «Collider thành quách hợp lý» — mở luật «không collider», và cái giá của việc mở

Luật 4 của `MapGroundField.Detail` («không collider, một cái cũng không») đúng với hoàn cảnh của
nó: AI sân này đi ĐƯỜNG THẲNG, một khối đặc là cả tiểu đội húc vào nó tới hết ván. Cái giá là
**nhà · tháp · tường đổ · tượng đá đều đi xuyên qua được** — đọc ra ngay là map chưa lắp xong.

Mở được vì nay có đường vòng. `GroundObstacle` khai **cả hai vế cùng lúc, từ cùng một Rect chân
đế**: collider thật + một cửa `RouteDepth`. Khai một vế là bẫy im lặng, nên `Attach` tự gắn
`BoxCollider2D` thay vì để nơi gọi tự nhớ.

⚠ **CHÂN ĐẾ KHÔNG PHẢI CẢ TẤM HÌNH.** Quy ước art 3/4: đáy sprite = mép GẦN của chân đế, phần
vươn lên màn hình là CHIỀU CAO vẽ thêm. Lấy cả bounds là cái nhà cao 2 đơn vị chặn 2 đơn vị CHIỀU
SÂU của sân sâu 11. Bảng `MapGroundField.Solids`: khối đứng 26 % bề cao ảnh · khối thấp 55 % ·
**cây chỉ có GỐC** (24 % bề ngang, sâu 0.3 — người đi lọt dưới tán). Hàng rào và giậu **cố ý không
chặn**: chúng rải thành hàng dài, cho chặn là bịt kín nửa sân theo chiều sâu.

`RouteDepth` cắt một LÁT DỌC tại vật chắn rồi tìm khe theo chiều sâu. Đo trên hình học thật:

| Hình | Kết quả |
|---|---|
| Tường thành 8 đốt, cổng rộng 3.2 ở giữa | khe duy nhất = **cái cổng**; đích ở độ sâu −4.5 · 0 · +4.8 đều lái về ±1.0 |
| Một cái nhà lẻ (2.0 × 0.6) | đứng phía gần → lách mép gần (+0.10); đứng phía xa → lách mép xa (+1.90) |

Tức cả đạo quân tự dồn về cổng mà **không ai viết luật "đi tới cổng"** — đó đúng là hình học mà
`MapCastle.Ground` dựng ra để có.
⚠ Bịt kín không còn khe thì trả `to.y` (đi thẳng vào tường). Đó là câu trả lời ĐÚNG:
`UpdateBlockedPath` sẽ chuyển sang ĐẬP. Bịa một đường vòng không tồn tại mới là chỗ AI đi lòng vòng.
⚠ Vật chắn phá được phải hỏi `IsDie` mỗi lần quét, KHÔNG trông vào `OnDisable`: công trình chết vẫn
giữ nguyên GameObject («Destroyed is not deleted»), và cổng vỡ mà sổ vẫn báo bịt là cả đạo quân
đứng trước lỗ thủng rồi đi vòng chỗ khác.
⚠ `TryStepUp` nay tắt ở sân 3/4 — "nhấc lên một nấc" ở đây là DỊCH RA XA. Trước đợt này vế đó
không cần vì sân không có collider đứng nào; chân đế mỏng nhất (0.26) lớn hơn `_stepHeight` (0.18)
chỉ là một sự trùng hợp giữa hai con số không liên quan.

**Một phễu duy nhất:** `GroundRoute.Depth` = `GroundTerrainZone.RouteDepth` (sông) **rồi mới**
`GroundObstacle.RouteDepth` (vật chắn). Cả `StickmanAgent.RoutedDepth` lẫn
`StickmanLocomotion.MoveTowards` gọi đúng hàm đó.
⚠ THỨ TỰ: sông chọn CHỖ QUA, vật chắn chỉ lách quanh một khối. Hỏi ngược lại thì vật chắn lách ta
khỏi đầu cầu rồi sông kéo về cầu — người đi zíc-zắc trước mũi cầu tới hết ván.

**Phép đo — luật 20** (`MapBuildRules.Obstacles.cs`, chạy trên map ĐÃ DỰNG): mốc nhiệm vụ nằm
trong vật chắn · **lát cắt bị bịt kín** (quét theo X, dùng đúng phép gộp của `RouteDepth` nên phép
đo và hành vi không trôi khỏi nhau) · chân đế lệch collider.

## ⚠⚠ SÂN 3/4 "NHÌN THIẾU THỨ GÌ ĐÓ" — BỐN THỦ PHẠM ĐÃ BẮT (2026-09-13)

Phản hồi nguyên văn: *"trong chế độ 3/4 đang thiếu effect và light. Map đang design rời rạc,
camera nhiều khi theo không kịp, hiệu ứng đi qua nước chưa chân thật, độ lớn map khá lớn"*.
Bốn trong năm cái là LỖI THẬT, và ba cái không phải lỗi của riêng sân 3/4.

### ① Lớp không khí chưa bao giờ chạy trên map SINH

`MapScenery.ApplyAtmosphere` (mưa · tuyết · lá · bụi · sương · đom đóm; ba tầng kiểu chơi →
thể loại → map) có ĐÚNG MỘT người gọi: `MapDressing`, component của scene **dựng tay**.
`MapAssembler` chưa bao giờ gọi ⇒ mọi map sinh (cả hai kiểu nhìn) giữ mặc định `None/None`.
Nhìn ra rõ nhất ở sân 3/4 vì ở đó `SkyBackdrop` cũng tắt. Nay gọi ngay sau khi dựng địa hình.
Phép đo: smoke Play «Sân dựng xong mà `WeatherAmbience` vẫn None/None».

### ② Thứ gắn thêm vào vật ĐÃ ĐƯỢC XẾP THEO CHIỀU SÂU phải tự tính lại order

`StickmanDepthSort` ghi order của vật bằng `SortingTieBreak(base) + SortingFromDepth(y)` — một
số có thể tới hàng trăm. Bất cứ thứ gì gắn thêm (quầng đèn đêm, vệt sóng nước, thanh máu…) mà
ghi một HẰNG SỐ nhỏ sẽ **chìm sau mặt sân**: thêm vào mà không thấy gì, không lỗi nào báo.
Luật: tính cùng công thức rồi cộng offset nhỏ (xem `MapGroundField.LightAtNight`).

### ③ Dải lát phải có LẬT và LỆCH SÁNG

Đường và vệt đất lát cùng một sprite hàng chục lần cạnh nhau. Giữ nguyên chiều + nguyên màu là
mắt bắt được nhịp lặp và đọc ra "dán tile" — đó chính là cảm giác *"map rời rạc"*. `Floor` nay
nhận `shade` (±4–5 %), và mọi vật đứng lệch cỡ ±12 % (`Stand`). ⚠ KHÔNG đổi `scale` của tile
đường: bước lát tính từ bề rộng gốc với 38 % chồng mép, phóng to thu nhỏ là mở khe.

### ④ Bề ngang map: thang của SÂN NGANG không dùng lại được

Mấy chục dòng `halfWidth = Max(…)` theo kiểu chơi được hiệu chuẩn cho sân một trục. Sân 3/4 có
trục sâu gánh bớt bố cục, nên `ApplyGroundPlane` nhân `GroundWidthScale = 0.68` (sàn 16) —
một chỗ DUY NHẤT để chỉnh to/nhỏ. Đo trước khi sửa: trung vị 94 đơn vị ≈ 3 màn hình cho 5–9
quân mỗi phe.

### ⑤ Camera: trần trễ ×0.6 ở sân 3/4

Sân thường MỎNG HƠN khung nhìn ⇒ camera bị ghim theo trục dọc, toàn bộ việc bám dồn vào trục
ngang, mà người chơi lại đi CHÉO được. Cùng bộ số với sân ngang thì đọc ra là "theo không kịp".

### ⑥ Lội nước: một chủ cho câu hỏi, một chủ cho phần vẽ

`StickmanLocomotion.Ground` đã sở hữu *"có đang ở trong nước không"* (đổi tốc độ, phát
`Water/Splash`, choáng khi bị hất xuống nước sâu). `StickmanWaterWake` **chỉ vẽ** vòng sóng và
được chính chủ đó gọi — bản đầu tự quét vùng lần nữa với ngưỡng riêng, và hệ quả là tiếng một
đằng hình một nẻo.

### Còn nợ: đèn 2D thật

Dự án **chưa cài URP**, nên không có `Light2D` nào — đây là chuyện của CẢ dự án, không riêng
sân 3/4. Bật bằng ba bước trong `Lighting.md` (mỗi bước có nút quay lui). Trong lúc chưa bật,
"ánh sáng" của sân 3/4 là: nhuộm đêm (`MapGroundNight`) + bóng đổ (`StickmanGroundShadow`) +
quầng ấm ở nhà/lều/tháp về đêm (`NightGlow`, mục ②).

## ⚠⚠ LẮP RÁP MAP: LÁNG GIỀNG, VÀ HAI LOẠI CÔNG TRÌNH (2026-09-13)

Người dùng chốt hai luật, và cả hai đều là luật THIẾT KẾ có chỗ thi hành trong code:

> *"khi tạo map 2D hoặc 3/4 thì lắp ráp để tránh rời rạc — phải xem xung quanh nó là gì rồi
> thêm đối tượng phù hợp"* · *"có 2 loại công trình: một loại có CÔNG NĂNG (nhà, cầu, đường),
> một loại để DECO. Có công năng thì phải phù hợp với logic game"*.

### ① Rải độc lập không bao giờ ra bố cục

`MapGroundField` rải bằng những vòng lặp riêng (cây một vòng, đá một vòng…). Mỗi vòng đúng luật
của nó, nhưng cộng lại thì không vật nào có QUAN HỆ với vật nào — và art đẹp hơn không chữa
được: một tấm đẹp đứng một mình vẫn là một tấm đứng một mình.

`MapGroundField.Neighbours` chạy CUỐI `Compose`: đọc lại sổ vật vừa đặt, tra bảng `Companions`
rồi mọc thêm đúng thứ hợp lý (nhà → đống củi · hàng rào; cây chết → nấm · gốc cụt; phế tích →
bia mộ · đá vụn). Ba ràng buộc bắt buộc:

- **đặt qua đúng `Stand`** — mọi luật sân (nước · làn giữa · vật cao ở nửa xa · chồng chỗ) nằm
  trong đó; tự `new GameObject` là mở lại từng cái bẫy một;
- **duyệt BẢN CHỤP** — thứ mới mọc không được đẻ tiếp, nếu không là phản ứng dây chuyền;
- ⚠⚠ **ngân sách đo theo SỐ VẬT ĐANG CÓ, không theo diện tích.** Bản đầu đặt trần
  "0.085 vật / đơn vị diện tích" và biến cả pha thành hàm KHÔNG LÀM GÌ: sân mẫu đã có sẵn mật
  độ 0.28 ⇒ ngân sách luôn 0. Bắt được bằng `ground_field_preview.py` (163 vật vào, 163 ra),
  không bằng đọc code.

### ② Hai loại công trình — phải khai CẢ HAI phía

| Loại | Khai ở đâu | Hệ quả trong game |
|---|---|---|
| **CÓ CÔNG NĂNG** | `MapGroundField.Solids.SolidKindOf` | chặn đường thật + `GroundObstacle` cho AI đi vòng |
| **DECO** | `MapGroundField.Solids.RoleIsDeco` | trong suốt với logic: bước qua được, `UpdateBlockedPath` không nhận nhầm |

⚠⚠ **Khai tường minh cả hai, đừng suy "không có trong bảng chặn nghĩa là deco".** Suy như vậy
thì một vai art mới QUÊN phân loại sẽ lặng lẽ thành deco — cái kho thóc vừa vẽ xong là một tấm
hình đi xuyên qua được, và không ai biết cho tới khi nhìn thấy trong game.

Đường và cầu cũng là "công trình có công năng": mặt cầu đã là `GroundTerrainKind.Road` từ trước,
còn **con đường** thì tới 2026-09-13 mới có vùng tốc độ của nó (×1.12) — trước đó nó chỉ là một
dải màu, tức xương sống bố cục của cả cái sân không mang một tí luật chơi nào.

### ③ Một vai art phải có ĐỦ BỐN CHỖ

file art · `AllGroundPropRoles` (kho quét) · một chỗ gọi tên nó (pha rải hoặc bảng láng giềng) ·
phân loại công năng/deco. Thiếu chỗ nào cũng ra đúng một triệu chứng *"vẽ xong mà trong game
không thấy"*. Bảng khám «Đồ rải sân 3/4» đo đủ bốn.

## ⚠⚠ TƯỜNG THÀNH 3/4: CHẶN THẬT · CHỈ QUA CỔNG · LEO LÊN BẰNG CẦU THANG (2026-09-15)

User: *"trong chế độ 3/4 tôi muốn phần tường thành không thể đi qua được, chỉ đi qua cổng thành,
nhưng có thể leo lên tường thành từ cầu thang"*.

**Vế "không đi qua được" ĐÃ ĐÚNG SẴN** — đo ngày 2026-09-15 trên map `AssaultCamp_Medieval_ground`:
mỗi đốt `Tuong_*` có collider ĐẶC (`MapSpawn.Block(solid: true)`), không đốt nào khai
`passableForEveryone`, và chỉ CỔNG mới `passableForOwner` (quân nhà qua được, quân địch phải đập).
Phép đo nay là luật thường trực: `MapBuildRules.CheckWallsReallyBlock`.

⚠ Hai thứ khác nhau, đừng lẫn: **sổ `GroundObstacle` chỉ dạy AI ĐI VÒNG**, nó không chặn ai cả;
thứ giữ chân người chơi là collider. Mất collider mà còn sổ thì AI vẫn ngoan ngoãn dồn về cổng
trong khi người chơi đi bộ xuyên tường — nhìn vào không thấy gì sai cả.

**Vế "leo lên tường" thì chưa có** (chú thích cũ của `MapCastle.Ground` ghi thẳng: *"phần thang để
trống vì ở sân này không ai leo lên tường"*). Nay có, và nó KHÔNG dùng lại `StickmanStairs`:

| | Sân ngang | Sân 3/4 |
|---|---|---|
| "Lên tường" nghĩa là | bàn chân cao hơn (`WalkableTopY`) | **được đứng TRONG dải X của tường** |
| Leo bằng | `StickmanStairs`, từng nấc `_stepHeight` | `GroundWallClimb` — cấp quyền đi xuyên |
| Vẽ | tự đúng vì cao hơn | `StickmanSortingGroup.RequestDepthBias` kéo mốc về phía người xem |

Cơ chế (`GroundWallClimb`, một cái cho mỗi toà thành):

1. **Chỉ lên được từ CẦU THANG** — ô đất sát mặt TRONG tường (`MapCastle.AddWallStairs`, hai cái
   kèm hai mép cổng). Ô thang **không có collider**: ở sân này nó không nhấc ai lên cao, nó chỉ là
   một chỗ đứng nói *"được phép bước vào dải tường"*. Đặt thang ở mặt NGOÀI là tặng quân công thành
   một đường lên tường miễn phí và cái cổng hết là chốt chặn.
2. **Đang ở trên tường** = `Physics2D.IgnoreCollision` theo CẶP với mọi đốt tường. Vào dải tường ở
   chỗ khác thì collider chặn như cũ.
3. **Không thu quyền lúc thân còn nằm trong đá** — thu sớm là Box2D thấy hai vật chồng nhau và bắn
   người văng ra (cùng bẫy `Fortification.StillInsideMe`).
4. **Cấp lại theo nhịp 0.25 s** — `IgnoreCollision` là trạng thái theo cặp và Unity XOÁ nó mỗi khi
   một collider tắt/bật; mất quyền một nhịp là bị đẩy bật khỏi tường.

5. **MÉP NGOÀI là một lát collider riêng** (`MepNgoai`, dày 0.14, KHÔNG nằm trong sổ leo): người
   trên tường đi xuyên được THÂN tường, nên nếu không có lát này thì cầu thang biến thành một lỗ
   thủng và *"chỉ đi qua cổng"* hết đúng. Để vật lý chặn, **đừng kẹp toạ độ bằng tay** — kẹp tay
   là thân người bị đẩy ra rồi kéo lại mỗi frame, mắt đọc thành rung giật.

⚠ Ở sân này đứng trên tường **không cho lợi thế độ cao** (không có độ cao): nó cho một CHỖ ĐỨNG và
một đường vượt tuyến tường mà không phải phá cổng. Ai leo lên vẫn bị đánh như thường.

⚠ Còn nợ: **AI chưa biết chủ động leo tường** (`GarrisonPost` của tháp vẫn đặt ở mặt trong, mặt
đất). Muốn cung thủ thủ thành đứng trên tường thì thêm post trên dải tường và cho `AIStateGarrison`
đi qua ô cầu thang — nhớ rằng đường lên là một Ô ĐẤT, không phải một cái thang có bậc.

Phép đo: `MapBuildRules` luật 20 — «tường phải chặn thật» và «có tường thì phải có cầu thang lên
tường» (mất vế sau thì không có gì hỏng nhìn thấy được).
