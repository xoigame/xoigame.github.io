## ⚠⚠ CÔNG TẮC TÍNH NĂNG THEO CHẾ ĐỘ CHƠI — `GameFeature` · `GameFeatures` · `MatchModeBase.Features` (2026-09-15, đợt hai 2026-09-16)

User: *"nhiều tính năng chồng chéo nhau, có chế độ chơi cần tính năng này không cần tính năng
kia… viết module sao cho bật tắt tính năng tuỳ từng chế độ, tránh sửa 1 cái ảnh hưởng tùm lum."*

### Đo trước khi thiết kế

| Đo (2026-09-15) | Số | Nghĩa |
|---|---:|---|
| Assembly xếp tầng (`.asmdef`) | 10/10 biên dịch riêng | tầng **assembly** đã tách xong ([Modules](Modules.md)) |
| File `.cs` theo thư mục tính năng | 1048 đã xếp | tầng **thư mục** đã xong ([FolderLayout](FolderLayout.md)) |
| Lớp `: MatchModeBase` | 41 | 41 kiểu chơi |
| Mode nói được "ván này KHÔNG dùng hệ X" | **0/41** | ← chỗ hỏng gốc |
| Hook `[RuntimeInitializeOnLoadMethod] Install` tự cắm vào MỌI scene | 27 (0 hỏi mode) | thi bắn cung một mình vẫn có lính bình luận, chòi canh, đuốc đêm, phần thưởng giữa ván |
| File có `RuntimeInitializeOnLoadMethod` | 149 (106 là `ResetStatics` — đúng, giữ) | phần còn lại là hệ tự bật |
| `FindObjectsByType` / `FindAnyObjectByType` | 241 | hệ tìm nhau bằng quét scene — không ai hỏi "ván này có cần tôi không" |
| Script trên `Character.prefab` | 5 | tính năng LẮP LÚC CHẠY (`MapAssembler` 65 `AddComponent`) — nhiều đường tạo, nên cổng KHÔNG đặt ở chỗ lắp |
| `StickmanAgent.cs` | 6635 dòng · 16 `Update*` nối cứng | hệ tuỳ chọn (sĩ khí, nấp, né AoE) sống chung pipeline với lõi |
| Nhánh `WorldPlane` trong Combat + AI | 147 | trục KIỂU NHÌN — không phải tính năng, xem [WorldPlane](WorldPlane.md) |

**Chẩn đoán:** dự án đã tách được HAI tầng (assembly · thư mục) nhưng chưa có tầng thứ BA — *ván
này dùng gì*. Vì thiếu nó, cách duy nhất để một mode "không dùng hệ X" là sửa vào hệ X (thêm
`if` giữa Update), tức chạm vào file mà 30 mode khác đang dựa — đúng cái lan "tùm lum".

### Bốn tầng tách, mỗi tầng một phép đo

| Tầng | Tách cái gì | Phép đo | Luật |
|---|---|---|---|
| 1 · **Assembly** | tham chiếu chỉ đi xuống | `Modules > Kiểm tra kiến trúc` | [Modules](Modules.md) |
| 2 · **Thư mục tính năng** | sửa X thì mở đâu | Doctor «Thư mục tính năng» | [FolderLayout](FolderLayout.md) |
| 3 · **Công tắc theo mode** | ván này CHẠY gì | Doctor «Công tắc tính năng» ×5 + bảng trong `★ Xưởng game` | **file này** |
| 4 · **Mode sở hữu luật** | luật thắng nằm ở mode, không ở hệ | `MatchModeBase` là khuôn + hook | [Gameplay](Gameplay.md) · [GameFactory](GameFactory.md) |

### Cơ chế — một công tắc, hai người bấm, một chỗ hỏi

`Assets/Scripts/Core/Run/GameFeature.cs` (Core — không biết hệ nào tồn tại):

| Mảnh | Là gì |
|---|---|
| `enum GameFeature` | DANH MỤC tính năng tuỳ chọn. Mỗi giá trị = một hệ có thể tắt. Nối vào cuối, không đổi số. |
| `struct FeatureSet` | tập bit bất biến: `All` · `None` · `Without(...)` · `Union` · `Except` · `ParseCsv` |
| `static GameFeatures` | SỔ đang bật = `Mode ∖ PackOff`. `SetMode(set, owner)` · `SetPackOff` · `Has` · **`Bind(this, …)`** · `Changed` |
| `MatchModeBase.Features` (Gameplay) | MODE khai. Mặc định `FeatureSet.All` ⇒ 41 mode cũ y như trước. `Awake` gọi `SetMode(Features, this)`. |
| `GamePack.featuresOff` · `GamePackStage.featuresOff` (Core) | GÓI GAME JSON tắt thêm bằng CSV tên; `GamePackRun.ApplyStageRules` áp, mọi đường ra trả `None`. |

Ba kiểu cổng — chọn theo **hệ đó là gì**:

| Cổng | Dùng khi | Mẫu có thật |
|---|---|---|
| `private void Awake() => GameFeatures.Bind(this, GameFeature.X);` **trong file của chính component** | hệ là một MonoBehaviour | 14 component: `BattleChatter`(+`Director`) · `GarrisonDirector` · `NightTorches` · `BuildingVisitDirector` · `RunPerkBinder`(+`Picker`) · `HeroCommander` · `MatchStats` · `StickmanScreenFx` · `PlayerRespawn` · ba `*Prompt` |
| `if (!GameFeatures.Has(GameFeature.X)) return;` ở property/hàm VÀO của hệ | hệ không phải component (một mảng hàm trong lớp lớn) | `StickmanAgent`: `MoraleEnabled` · `UpdateTakeCover` · `UpdateAoeAvoid` · `BeginLastStand` |
| `AIPlaybook` + `AIModule` | KHẢ NĂNG CỦA NPC (thầy thuốc, khiêu khích, nhặt đồ) — đã có tầng riêng, **đừng bọc lại** | [AI](AI.md) |

⚠⚠ **CỔNG NẰM TRONG `Awake` CỦA CHÍNH COMPONENT, KHÔNG Ở CHỖ TẠO — đây là một lỗi đã xảy ra
thật.** Bản đầu (2026-09-15) đặt `Bind(go.AddComponent<X>(), …)` trong installer, vì lúc đó
installer *trông như* đường tạo duy nhất. Đo lại ngày hôm sau: **14 component có cổng nhưng 22
chỗ tạo**. `HeroCommander` một mình có 6 — năm builder scene (`WarCamp` · `ModernFront` ·
`ModernCamp` · `ThreeKingdomsCamp` · `IslandWar`) **bake thẳng component vào scene**, không đường
nào đi qua installer; `MapAssembler` tạo `MatchStats` và `StickmanMountPrompt` lúc dựng map;
`GamePackRunner.Story` tạo `RunPerkBinder` + `RunPerkPicker`. Cổng ở installer phủ đúng một
đường và **im lặng bỏ sót phần còn lại**: mode khai tắt, HUD nói đã tắt, hệ vẫn chạy.
Một cổng trong `Awake` phủ MỌI đường — installer, map dựng lúc chạy, builder bake sẵn, prefab,
và cả đường tạo thứ 23 chưa ai viết. Doctor «cổng phải nằm trong Awake của CHÍNH component»
bắt mọi `Bind` có đối số đầu khác `this`.

⚠⚠ **THỨ TỰ KHÔNG QUAN TRỌNG — và đó là điểm quyết định thứ hai.** Mode có thể được gắn SAU khi
scene đã nạp (`MapModeBinder.Attach` chạy sau khi dựng map), tức SAU khi 27 hook `sceneLoaded` đã
đẻ ra director. Một cổng HỎI-MỘT-LẦN lúc đó sẽ thấy `All` và bật hết. Vì thế `Bind` không hỏi một
lần mà GHI TÊN vào sổ: sổ đổi (mode khai · gói đổi · đổi scene) là mọi component đã ghi tên được
bật/tắt lại. `Has` chỉ đúng cho thứ sinh ra SAU khi mode đã ở trong scene, hoặc cho hệ không phải
component (bốn hệ trong `StickmanAgent` — chúng được HỎI mỗi lần chạy nên luôn đọc số mới nhất).

⚠ **Không có `OnDestroy` ở `MatchModeBase`, và đó là chủ ý.** 25 lớp con đang khai `private void
OnDestroy()` — thêm bản ở lớp cha là bị CHE trong im lặng (bẫy 4 [BlastRadius](BlastRadius.md)).
Sổ nhớ CHỦ (`owner`) của tập mode; chủ chết (đổi scene) thì `Mode` tự là `All`.

### Ranh giới — cái gì LÀ tính năng, cái gì KHÔNG

✔ **Tính năng:** hệ TUỲ CHỌN, tháo ra thì ván vẫn chơi được — lính bình luận · chòi canh · đuốc
đêm · thăm công trình · phần thưởng giữa ván · người chơi ra lệnh tổ · thống kê · hiệu ứng
màn hình · hồi sinh người chơi · ba lời nhắc bấm · sĩ khí · nấp · né vùng nổ · tử chiến
(14 giá trị, 2026-09-16). Bốn cái cuối nằm TRONG `StickmanAgent` — cổng đặt ở property/hàm
vào của từng hệ (`MoraleEnabled` · `UpdateTakeCover` · `UpdateAoeAvoid` · `BeginLastStand`),
không đụng pipeline `Update`.

✘ **Không phải tính năng:** lõi mà mọi ván cần và THỨ TỰ giữa chúng là hợp đồng — máu · chết ·
ragdoll · di chuyển · phe · vũ khí · chuỗi FSM của AI (`AI-Architecture.md` §2). Cũng không
phải: **kiểu nhìn** (`WorldPlane`, trục riêng) · **thể loại** (`GameGenre`, lọc dữ liệu) · **luật
theo phe** (`MutatorTable` có phe đích) · **hình học map** (`StickmanStairsBootstrap` quét bậc
thang là đo hình, không phải tuỳ chọn).

### Luật

1. **Mặc định là TẤT CẢ.** Không mode nào phải sửa để hành vi cũ giữ nguyên. Mode biết mình
   không cần gì thì `public override FeatureSet Features => FeatureSet.All.Without(...)`.
2. **Một tính năng, MỘT cổng, trong `Awake` của chính component** (hệ không phải component thì ở
   property/hàm vào của nó). Không đặt ở chỗ `AddComponent`, không nằm trong `Update` của hệ
   khác, không rải `if (Has)` khắp nơi.
3. **Giá trị enum mới nối vào CUỐI và phải có người GẮN trong cùng một đợt sửa.** Khai mà không
   gắn = tắt trên giấy. Doctor «mỗi tính năng phải có người GẮN» đọc văn bản nguồn, réo tên.
4. **`Bind` SỞ HỮU `enabled` của component** (một ô một chủ). Bị tắt thì `Update`/`OnGUI`/
   `OnEnable`-`OnDisable` ngừng đúng nghĩa. **Ba thứ KHÔNG tự ngừng theo `enabled`:**
   coroutine · event tĩnh · **cửa TĨNH đi qua `_instance`**. Hai cái đầu gỡ trong `OnDisable`
   (mẫu: `StickmanScreenFx`); cái thứ ba phải tự kiểm `!_instance.enabled` ngay trong hàm tĩnh.
   ⚠ Đã dính: `BattleChatter.Event`/`.Say` là cửa mà cả dự án gọi, và chúng chỉ hỏi `_instance
   == null`. Tắt `Chatter` mà thiếu vế `enabled` thì lính **vẫn nói y như cũ** trong khi bảng
   báo đã tắt — hệt bẫy «viết xong nhưng không ai gắn», chỉ khác là lần này cổng có gắn.
5. **Gói game tắt bằng TÊN, và mọi đường ra đều trả `None`** (`Advance` thắng/thua · `Abandon` ·
   `ApplyStageRules`). Bỏ gói giữa chừng mà tính năng vẫn tắt là cùng họ với trọng lực mặt trăng
   của `MutatorBinder`.
6. **Tắt là để BỚT VIỆC, không để sửa lỗi.** Một hệ chạy sai ở mode X thì sửa hệ đó (hoặc cho
   nó hỏi đúng câu qua hợp đồng Core), không tắt cho khuất mắt.

### Trùng lặp và kế thừa — được và không được

User cho phép trùng code. Chốt ranh giới để trùng đúng chỗ:

| | Được | Không được |
|---|---|---|
| **Trùng code** | giữa hai MODE: mỗi mode sở hữu luật thắng của nó, chép 30 dòng còn hơn tham số hoá lớp cha bằng cờ (`AppleShotMode` ghi rõ vì sao không gộp vào `ArcheryTrialMode`) | ở tầng DÙNG CHUNG (Core/Combat/AI/Units): hai bản của một hệ là hai chỗ sửa bug, một chỗ sẽ bị quên |
| **Kế thừa** | `MatchModeBase` là KHUÔN: lớp con chỉ override hook (`Features` · `SupportedRoles` · `BuildOrders` · `DecideCampaign` · `OnFinished`); `ArcheryTrialMode` ba bản = lớp con chỉ khác cấu hình | tầng kế thừa thứ ba; lớp con khai lại `Awake`/`OnDestroy`/`Update` mà không gọi `base` (che hàm); `: StickmanController` cho thứ AI không cần đánh (dùng `WorldThing`) |
| **`partial class`** | chia FILE theo mảng để giữ trần 800 dòng ([FileSize](FileSize.md)) | rẽ nhánh theo mode/thể loại trong cùng một class — `ThreeKingdomsCampaign` 27 partial là trần, không phải mẫu |
| **Thành phần** | tính năng của nhân vật = component lắp lúc dựng + cổng; `AIModule` cho khả năng NPC | field/`if` mới trong `StickmanController` · `StickmanLocomotion` · `StickmanAgent` cho một mode |

Nguyên tắc gốc: **sửa ở LÁ, đừng sửa ở TRỤC** ([BlastRadius](BlastRadius.md)). Tính năng mới =
file mới + một dòng cổng; mode mới = lớp con + một dòng `Features`.

### Phép đo (`★ KHÁM SỨC KHOẺ DỰ ÁN` — `Assets/Editor/Doctor/StickmanDoctor.Features.cs`)

| Phép đo | Bẫy nó canh |
|---|---|
| Mỗi `GameFeature` phải có người GẮN | «viết xong nhưng KHÔNG AI GẮN» — tắt trên giấy |
| Gói game `featuresOff` trỏ vào tính năng có thật | gõ sai tên ⇒ lặng lẽ không tắt gì |
| **Cổng phải nằm trong `Awake` của CHÍNH component** | `Bind` ở chỗ tạo ⇒ hở mọi chỗ tạo khác (đã đo: 22 chỗ tạo / 14 component) |
| Installer toàn cục mới phải qua cổng (mốc 4, chỉ được giảm) | hệ mới lại thành "mọi ván đều chạy" |
| Số mode khai `Features` chỉ được tăng (mốc 7) | trục có mà không ai dùng |

Cả năm đọc văn bản nguồn + enum thật, không mở scene.

**Nhìn bằng mắt:** `Tools > Stickman > Nâng cao > Gameplay > ★ Xưởng game` › khối **«TÍNH NĂNG
THEO CHẾ ĐỘ CHƠI»** — mỗi hàng một kiểu chơi, cột cuối là những gì mode ấy tắt, kèm dòng «tính
năng nào chưa mode nào tắt». Bảng đọc bằng cách **GỌI THẬT** `Features` trên một `GameObject`
TẮT SẴN (object tắt ⇒ Unity không gọi `Awake` ⇒ không mode nào kịp ghi vào sổ thật), không quét
chữ `.Without(`.

### Còn nợ — đọc trước khi hứa với user

| Việc | Trạng thái | Ghi chú |
|---|---|---|
| 14 component tự gắn cổng trong `Awake` — phủ đủ **22 chỗ tạo** | ✔ | Chatter ×2 · Garrison · NightTorches · BuildingVisits · RunPerks ×2 · HeroCommander (6 chỗ tạo) · Telemetry (2) · ScreenFx · PlayerRespawn (2) · Prompts ×3 |
| 4 hệ tuỳ chọn TRONG `StickmanAgent` | ✔ | Morale (`MoraleEnabled`) · TakeCover · AoeAvoid · LastStand (`BeginLastStand`, cửa vào — ai đang tử chiến chạy nốt) |
| 7 mode khai `Features` | ✔ | `AppleShotMode` · `ArcheryTrialMode` (ba bản) · `ChampionshipCupMode` · `HuntMode` · `RanchMode` · `RaceMode` · `ArcadeModeBase` (phiên khác tự dùng trục này ngay hôm sau) |
| Bảng mode × tính năng trong `★ Xưởng game` | ✔ | `StickmanGameFactory.Features.cs` — gọi thật trên object TẮT SẴN |
| 4 installer cố ý ngoài cổng | — | `MatchBattleDirector` (lõi trận) · `StickmanStairsBootstrap` (hình học) · `MapStudioBootstrap` · `SagaDevPanel` (đồ nghề) — Doctor đếm đúng 4 |
| Cổng `Has` ở chỗ lắp lúc dựng (`MapAssembler`, `CivilizationTeamAssigner`) | ○ | dành cho tính năng lắp lên QUÂN (ngựa, dù, đuốc…) — chưa tính năng nào cần tới |
| 34/41 mode chưa khai `Features` | ○ | mở bảng trong `★ Xưởng game` mà rà; mặc định TẤT CẢ là hành vi cũ, không phải lỗi |

Quy trình chuyển một hệ sang cổng, bảng 27 installer và câu hỏi thường gặp:
`Docs/KnowledgeBase/FeatureToggles.md`.
