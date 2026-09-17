# Xưởng game — còn trục NHÂN nào để bộ khung đẻ ra nhiều game (2026-09-09)

> Trả lời câu của user: *"lên thêm ý tưởng cần tích hợp, sao cho nó tạo được nhiều game khác nhau"*.
> Tiếp nối [Roadmap-NextWave.md](Roadmap-NextWave.md) (đợt trước liệt kê **game nào còn thiếu**);
> file này hỏi câu khác: **cái gì làm cho số game NHÂN LÊN** thay vì cộng thêm một.
> Luật đã chốt của đợt này: [GameFactory.md](../AgentRules/GameFactory.md).

## 0. ĐO TRƯỚC — vì sao "thêm mode" không phải câu trả lời

| Đo (2026-09-09) | Số | Cách đo |
|---|---:|---|
| Kiểu chơi | 35 | `grep -rhoE "class [A-Za-z]+ *: *MatchModeBase"` |
| Trọng tài vào được công thức JSON | 30 | `RefereeSpec` trong `StickmanRefereeTable` |
| Kiểu nhiệm vụ dựng được LÚC CHẠY | 20 | `MissionType` |
| File C# | 811 | `find Assets/Scripts Assets/Editor -name "*.cs"` |
| **Vật thể tên là "một game"** | **0 → 1** | `GamePack` (đợt này) |
| **Tầng luật biến thể** | **0 → 18** | `MutatorTable` (đợt này) |
| **Mode khai `SupportedRoles`** | **0/35** | chưa ai tiêu |
| `InfluenceMap` / `ThreatMap` | 0 | vẫn còn thiếu từ đợt trước |
| Hot-seat / chơi chung một máy | 0 | `grep -i "hotseat\|splitscreen"` |

35 mode nghĩa là **tối đa 35 game**, và mỗi game tiếp theo tốn đúng bằng game trước. Bốn trục
đợt này thì khác: mỗi thứ thêm vào nhân lên trên **toàn bộ** kho có sẵn.

## 1. ĐÃ LÀM ĐỢT NÀY (2026-09-09)

| Trục | Cái mới | Nhân ra sao |
|---|---|---|
| Gói game | `GamePack` · `GamePackRun` · `GamePackRunner` | chuỗi chặng + vai + luật = **một game trong một khối JSON**, không đẻ scene |
| Luật biến thể | `MutatorTable` (18 luật) · `ActiveMutators` · `MutatorBinder` | 18 × 20 kiểu nhiệm vụ ≈ **360 bộ luật** từ ~250 dòng dữ liệu |
| Vai người chơi | `MatchModeBase.SupportedRoles` | trục **nhân ba** trên đúng nội dung cũ (Hero · Chỉ huy · Ngồi xem) |
| Thử thách phụ | `MatchChallengeTable` · `MatchChallengeRun` · `MatchChallengeTracker` | 3 lá mỗi ván, bám lên **cả 35 mode** vì chỉ nghe sự kiện tĩnh có sẵn |
| Cửa vào | `★ Xưởng game` | soi từng chặng · ▶ chơi thử · ghi 4 bảng ra JSON |
| Canh chừng | 5 phép đo trong `StickmanDoctor.GameFactory.cs` | hai phép đo canh đúng bẫy «viết xong nhưng không ai gắn» |

Hai sự kiện tĩnh mới mở cửa cho tầng trên mà không ai phải sửa `GameSession` (file ấy đã vượt
trần và nằm trong sổ nợ): `TeamMember.AnySpawned` và `MatchModeBase.AnyFinished`.

## 1b. ĐỢT HAI (2026-09-09) — sáu viên gạch ở CORE

Câu hỏi khác: *"thêm một THỂ LOẠI chưa từng có thì phải sửa Core mấy chỗ?"* Đo được năm chỗ
Core đang bắt mọi game mới cộng thêm vào chính nó; sáu viên gạch dưới đây gỡ từng chỗ.

| Viên gạch | Triệu chứng đo được | Nhân ra sao |
|---|---|---|
| `StatChannel` + `UnitStats` | `SetMaxHealth` bị **27 file** ghi đè; giáp + lên cấp giành nhau | buff · perk · luật · hào quang · trạng thái CHỒNG được và GỠ được |
| `SaveBag` | `PlayerProfile` có trường riêng cho từng game | game mới tự cất số, Core không cần biết game nào tồn tại |
| `WorldThing` | **7 class** kế thừa `StickmanController` (1182 dòng) | thứ không chiến đấu khỏi phải làm stickman |
| `InputVerbs` | `StickmanTouchInput` là danh sách động tác stickman | thể loại mới khai nút của nó, không sửa Core |
| `MatchOutcome.score/.rank` | struct chỉ trả lời "ai thắng" | mở họ thể loại tính điểm · xếp hạng · nhiều sao |
| `ScreenSpec` + `ScreenRenderer` | **65 file `OnGUI`** vs 20 file Canvas | màn hình thứ 66 trở đi khai bằng dữ liệu |

Người dùng thật đầu tiên: `GamePackPicker` — bảng chọn game **trong game** (trước đó gói game
chỉ mở được từ Editor). Hai phép đo Doctor mới đếm nợ cũ và **chỉ được giảm**.

## 1c. ĐỢT BA (2026-09-09) — CHIẾN DỊCH VÔ TẬN: máy soạn MÀN CHƠI

Câu của user: *"tham khảo chế độ phim trường… cũng có chế độ tạo màn game ngẫu nhiên như vậy,
tôi tham gia vào trận đánh, bạn tạo kịch bản và tôi điều khiển 1 nhân vật trong đó."*

Đợt một cho **một game = một khối JSON**; ai đó vẫn phải VIẾT khối JSON ấy. Đợt này bỏ nốt
người viết: `SagaAutoWriter` đọc kho map + kho nền văn minh + bảng luật rồi tự soạn ra gói,
đúng khuôn `CinematicAutoWriter` đã chứng minh ở Trường quay — chỉ khác đầu ra là **chơi được**
(vai `Hero`) thay vì quay được (vai `Observer`).

| Trục | Cái mới | Nhân ra sao |
|---|---|---|
| Cốt truyện | 10 `SagaArc`, mỗi hồi một hình dáng chuỗi chặng | 10 × (thời kỳ có map) |
| Kiểu nhìn | `ViewPlane` Side/Ground vào `GamePack.plane` | **nhân đôi** khi sân 3/4 đã dựng |
| Hồi nối hồi | `SagaRun` — thắng hết chặng thì SOẠN hồi sau | vòng chơi không có điều kiện dừng |
| Lời dẫn | `SagaLines` + `SagaBriefHud` | `GamePackStage.brief` lần đầu có người vẽ |
| Cửa vào | `GamePackPickerHook` → nút ở menu chính | bảng chọn game hết cảnh "không ai gắn" |
| Canh chừng | 3 phép đo `StickmanDoctor.Saga.cs` | một phép đo CHẠY THẬT máy soạn 24×4 |

Đo trên kho map thật (2026-09-09): Trung cổ 9/10 cốt truyện · Hiện đại 8 · Fantasy 8 · Võ lâm 5.
Tỉ lệ phải THAY chặng: 0% · 5% · 5% · 36% (Võ lâm mới có 9 map). Kho tổ hợp đếm được (cốt
truyện × cặp nền văn minh có thứ tự × tên đất × số chặng) là hàng chục nghìn hồi, và **mỗi map
hoặc nền văn minh thêm vào làm con số đó lớn lên mà không sửa dòng nào**.

Còn thiếu để 3/4 vào được chiến dịch: bấm «Maps › 8. Build SÂN MẶT ĐẤT» (sinh `Recipe_Ground_*`,
map `Map_Grd_*` và 4 scene sân). Máy soạn tự phát hiện và tự dùng — luật ở `GameFactory.md`.

### 1c-2. Đợt hai của chiến dịch (cùng ngày) — «nhiều kịch bản hơn, và TÔI ở trong đó»

Đo lại bản đầu rồi mới sửa. Hai chỗ hụt, cả hai đều không phải lỗi:

| Đo được ở bản đầu | Vì sao nó hụt |
|---|---|
| **10 hình dáng chuỗi trận** (mỗi hồi một danh sách viết tay) | mọi trục khác chỉ đổi *lớp áo*: sân, quân, luật, tên đất. Đến hồi thứ mười một là người chơi nhận ra khung xương |
| **0 nhân vật** | người chơi là "một Hero", địch là "phe kia", hai hồi liền nhau không liên quan gì nhau — chuỗi trận sinh tự động đọc ra như bài tập |

Năm thứ thêm vào, đều là trục NHÂN chứ không phải nội dung cộng thêm:

| Trục | Cái mới | Đo được |
|---|---|---|
| **Ngữ pháp** thay danh sách | `SagaGrammar`: vai (`MissionRole` 8) × vị trí (`SagaSlot` 4) × hai bảng trọng số | **3651/4000** hồi Trung cổ là hình dáng KHÁC NHAU (Hiện đại 3454 · Fantasy 3416 · Võ lâm 2681) |
| **Kẻ thù có tên** | `SagaCast`: tên · biệt danh · hằn học 0–3, sống qua nhiều hồi | mỗi bậc hằn học = **một mã luật thật** cho phe địch, không phải một câu văn |
| **Biến cố** | `SagaTwistKind` (9) mượn mã `MutatorTable` | mỗi chặng từ hồi 2 trở đi có ~40–85% cơ hội có biến cố |
| **Ngã rẽ** | `SagaForkHud` + `saga.path` | 2 ngả/chặng, và gói vẫn được SOẠN LẠI từ chuỗi số — không lưu gói |
| **Danh tính người chơi** | tên + danh hiệu lên theo việc đã làm | 5 bậc danh hiệu, đếm từ số liệu chiến dịch đã có sẵn |

Bốn cái đầu nhân với nhau: một hồi 5 chặng có 2⁴ = 16 đường đi × 9 biến cố mỗi chặng, TRÊN
3651 hình dáng. Đó là lý do bản này không cần thêm nội dung viết tay để "vô tận" là thật.

⚠ Ngã rẽ ở đây là bản NHẸ của mục 2.4 (`RunMap` + `RewardDraft`): nhánh chỉ đổi *chặng kế
tiếp*, chưa có bản đồ chuyến đi nhìn thấy trước và chưa gắn với bảng thưởng.

## 2. CÒN NỢ — xếp theo (giá trị ÷ công)

### 2.1 Luật THẮNG ghép từ mảnh — ★★★, trục sâu nhất còn lại

Đây là thứ *chưa* làm được, và là lý do mode thứ 36 vẫn phải là một class mới.

Hôm nay mỗi mode là một class nguyên khối tự quyết "ai thắng". Đề xuất: tách thành **mảnh
ghép** dùng chung — *giữ vùng · hộ tống mốc di động · sống sót N giây · diệt VIP · thu N tài
nguyên · phá công trình · tới đích · giữ tỉ số*. Một mode = **danh sách mảnh + luật tính
điểm** (`AllOf` / `AnyOf` / `Race`).

- 8 mảnh ghép 2–3 cái ⇒ hàng trăm bộ luật thắng, không class mới nào.
- Cái bẫy «35 mode / 30 trọng tài» tự biến mất: không còn class để quên nối.
- **Việc khó nằm ở cảm biến**, không ở luật: mỗi mảnh cần một `IObjectiveProbe` mà thứ có
  sẵn trong scene (`CapturePoint`, xe hộ tống, `DestructibleTarget`) phải implement. Đặt
  interface ở Core cạnh `IContestedZone`/`IEscortJourney` — đúng khuôn `StickmanContracts.cs`.
- ⚠ Đo vùng ảnh hưởng trước: đổi `StickmanAgent.Target` sang mục tiêu-không-phải-người là
  thứ `AI-GameModes-Roadmap.md` đã né một lần bằng cách cho `DestructibleTarget` kế thừa
  `StickmanController`. Đừng mở lại vết đó mà không chạy `BlastRadius.py`.

### 2.2 `ThreatMap` dùng chung — ★★★, mở cả một LỚP AI

Vẫn 0 kết quả grep, vẫn là lỗ hổng lớn nhất của tầng AI. Một lưới "chỗ nào nguy hiểm" cập
nhật theo đạn/xác/tháp mở một lúc: lén lút (né tầm nhìn), thủ tháp (đi vòng), battle royale
(đường an toàn vào vòng), pháo binh (đứng đâu khỏi chết), rút lui thông minh. Hiện mỗi hệ tự
đoán một kiểu.

### 2.3 Hot-seat hai người một máy — ★, nhân mọi mode đối kháng

`hotseat` · `splitscreen` · netcode đều = 0. Hai ngón tay hai mép màn hình, **0 dòng mạng**.
Nhân toàn bộ mode đối kháng (đấu tướng, kéo co, cướp cờ, arena) thành game "chơi với bạn" —
thứ dễ lan nhất trên mobile. Nối vào `PlayerRole` như một vai thứ tư hoặc một cờ của gói game.

### 2.4 `RunMap` + `RewardDraft` — ★★, nối nốt vòng meta

`RunPerks` đã xây, `GamePack` vừa cho chuỗi chặng THẲNG. Còn thiếu **bản đồ chuyến đi có
nhánh** (3–4 nhánh, chọn đường). Khi có, mỗi gói chỉ cần đổi bảng thưởng là ra một game khác.

### 2.5 Ragdoll làm ĐỒ CHƠI, không chỉ làm lính — ★★

Viên ngọc của dự án đang chỉ phục vụ chiến tranh. Bốn game *khác thể loại hẳn*, dùng rig +
ragdoll, gần như không cần AI: leo vách · phóng người đo khoảng cách · thể thao ragdoll (vật,
đá cầu) · đường cạm bẫy. Đây là bằng chứng bộ khung không phải "máy đẻ game chiến tranh".
⚠ Bốn thứ này KHÔNG chui vào `MissionType` được — chúng cần một trục "kiểu ván" khác.

### 2.6 Không gian 2D thật — ★★★★, và KHUYÊN ĐỪNG retrofit

`MapWrap` chỉ có `MinX/MaxX`; **186 file** bám `position.x`/`MoveTowardsX`. Mọi game top-down
hoặc lưới chiến thuật không có nhà ở đây. Vá ngược vào 186 file là đổi tim dự án — nếu thật
sự cần thì làm **module riêng dùng chung rig + art + Core**.

### 2.7 Dây chuyền để game RA ĐƯỢC — ★

- **Vỏ theo gói**: `MusicMood`, `StickmanUITheme`, `Loc` đã có; thiếu sợi dây "gói quyết định
  menu · nhạc · màu · tên". Rẻ, nhưng là thứ khiến hai gói *trông* như hai game.
- **Xem lại ván bằng `Seed`**: seed đã in ra màn hình; ghi seed + input ⇒ clip quảng cáo tự
  động và repro bug chính xác.
- **`BattleSim` chạy đêm ra bảng cân bằng cho gói MỚI** — cách duy nhất để AI rẻ cân một game
  nó chưa từng chơi.

## 3. KHÔNG nên làm (để khỏi mất công đo lại)

| Ý | Vì sao không |
|---|---|
| Dựng sẵn scene cho từng chặng gói game | đã thử trên giấy và bỏ: sửa một dòng JSON phải dựng lại N scene, và "thêm game" thành việc phải bấm nút Editor |
| Interface hoá `StickmanAgent.Target` chỉ để làm mục tiêu mới | `DestructibleTarget` kế thừa `StickmanController` đã giải quyết với 0 dòng AI; mở lại chỉ khi 2.1 thật sự cần |
| Thêm `MutatorKind` "nghe hay" mà chưa có đường áp | Doctor sẽ réo ngay — và đúng thế: luật có tên mà không làm gì là nợ, không phải nội dung |
| Netcode | 2.3 lấy được 80% giá trị với 2% công |

## 4. Việc kiểm chưa chạy

Toàn bộ đợt này mới qua `Verify.ps1` (biên dịch XANH) và các phép đo văn bản. **Chưa ai bấm
▶ Chơi thử một gói từ đầu đến cuối trong Unity**, nên chưa biết: sân map có đủ màn cho cả 15
chặng của ba gói gốc không, `MapArenaRequest` có bị nút «Chơi lại ván này» tiêu mất không, và
HUD ba dòng thử thách có đè lên HUD sẵn có ở màn nào không.
