## MODULE HOÁ — dự án này là BỘ KHUNG, không phải một game

Mỗi thư mục dưới `Assets/Scripts/` là **MỘT assembly riêng** (`.asmdef`), xếp TẦNG, và
**tham chiếu chỉ đi TỪ TRÊN XUỐNG**. Nhờ vậy dự án game khác lấy được ĐÚNG PHẦN CẦN thay vì
phải bê cả 190 file. Chi tiết: `Docs/KnowledgeBase/Modules.md` · skill `stickman-module`.
Assembly là tầng MỘT; tầng hai là thư mục tính năng ([FolderLayout](FolderLayout.md)); tầng ba
là **ván này CHẠY gì** — công tắc tính năng theo chế độ chơi ([FeatureToggles](FeatureToggles.md)).

```
0 Core  →  1 Combat  →  2 AI  →  3 Units  →  4 Gameplay  →  5 Naval  →  6 Map
                                                          →  7 Zombie →  8 Demo  →  9 Editor
```

| Module | Cho cái gì | Bỏ được khi |
|---|---|---|
| **Core** | enum vũ khí · `DamageInfo` · dữ liệu rig · pool · `StickmanUI` · **hợp đồng giữa module** | không bao giờ |
| **Combat** | nhân vật + ragdoll + di chuyển + phe + vũ khí + trang bị + trạng thái + hiệu ứng + công trình | không, nếu còn đánh nhau |
| **AI** | FSM · lối đánh theo vũ khí · module lắp rời · cây chỉ huy · playbook · ẩn thân | game chỉ có người chơi |
| **Units** | loadout · archetype · 15 nền văn minh · skin vũ khí · thể loại | game tự quyết trang bị |
| **Gameplay** | luật thắng thua (15 mode) · hồi sinh · bậc khó · kinh tế · ngày/đêm · camera · cần ảo | game tự viết luật ván |
| **Naval** · **Map** · **Zombie** | ba gói TUỲ CHỌN | không có biển / map sinh / zombie → bỏ ngay |
| **Demo** | ô chọn scene (F1) · bảng chỉ huy (F9) · AI Lab · bàn thử | ★ **game thật thì bỏ** |
| **Editor** | hơn 100 mục tool | asset đã chốt, không sinh lại |

**Phép thử của module hoá:** xoá hẳn `Assets/Scripts/Naval` mà phần còn lại vẫn biên dịch.
Đã kiểm: 10/10 module biên dịch RIÊNG được.

⚠⚠ **LỖI `type could not be found` SAU KHI CHIA MODULE = THAM CHIẾU NGƯỢC TẦNG, KHÔNG PHẢI
THIẾU REFERENCE.** Chữa bằng cách thêm reference vào `.asmdef` là tạo VÒNG TRÒN và giết luôn
khả năng bóc module — nửa năm sau không tách được gì nữa. Ba cách chữa ĐÚNG:

| Tầng thấp cần gì ở tầng cao | Cách đảo | Mẫu có sẵn |
|---|---|---|
| HỎI một câu | interface NHỎ trong `Core/StickmanContracts.cs` | `IUnitBrain` · `IPriorityTarget` · `INoAutoDress` · `IWeaponSkinSource` |
| TÌM một danh sách | SỔ ĐĂNG KÝ tĩnh ở Core, tầng cao `Register` lúc `OnEnable` | `ContestedZones` · `MovingPlatforms` · `RepairSites` |
| TẠO RA một đối tượng | CHỖ CẮM `static Func<>` ở tầng thấp, tầng cao cắm bằng `[RuntimeInitializeOnLoadMethod]` | `AI/NavalStateFactory` ← `Naval/NavalBootstrap` |

⚠ Interface phải NHỎ, chỉ hỏi MỘT câu — phình to là tầng thấp lại biết quá nhiều về tầng cao,
chỉ khác cái tên.

⚠ **ĐẶT FILE MỚI VÀO TẦNG CAO NHẤT MÀ NÓ CẦN.** Sai lầm hay gặp là đặt quá THẤP — bản cũ để
`StickmanLocomotion`/`TeamMember`/`UnitLoadout` trong `AI/` nên module Combat phải tham chiếu
ngược lên AI, và hai cái dính chặt không bóc ra được. Đặt cao rồi hạ xuống thì dễ, ngược lại
thì phải sửa cả chuỗi.

⚠ **File nằm trần ở `Assets/Scripts/` rơi vào `Assembly-CSharp`** — nó thấy được TẤT CẢ nên
ranh giới biến mất, mà compile vẫn xanh. `Modules > Kiểm tra kiến trúc` réo tên file đó.

⚠ **ĐỪNG dời class `MonoBehaviour`/`ScriptableObject` sang FILE khác** — asset trỏ vào script
bằng **GUID của FILE**, dời class là mọi prefab/asset dùng nó thành `Missing (Mono Script)`.
Dời cả FILE (kèm `.meta`) thì an toàn. `enum`/`struct` thuần thì tự do.
*(Vì vậy `GenreDefinition` ở lại `Units/GameGenre.cs` dù enum `GameGenre` đã sang Core.)*

⚠ **CHÉP FILE SANG DỰ ÁN KHÁC PHẢI KÈM `.meta`** — GUID nằm trong đó, thiếu là mọi tham chiếu
đứt sạch mà lúc chép không có lỗi nào. Nút XUẤT ở `Modules > Bảng module` đã tự lo.

⚠ **Lỗi `namespace 'UnityEngine.U2D' does not exist` KHÔNG phải lỗi tầng — là THIẾU KHAI
PACKAGE.** Không có asmdef thì code thấy mọi package; có asmdef rồi thì mỗi assembly **dùng
namespace đó phải khai trực tiếp** từng cái
vào `"references"`: `Unity.2D.Animation.Runtime` · `Unity.2D.IK.Runtime` ·
`Unity.2D.Common.Runtime` · `UnityEngine.UI`. Module BUILT-IN của engine
(`UnityEngine.Rendering`, `SceneManagement`…) thì không phải khai.

⚠ **Biên dịch gộp cả `Assets/` một cục KHÔNG bắt được lỗi tầng** (mọi type đều thấy nhau).
Phải để Unity biên dịch từng assembly, hoặc bấm `Modules > Kiểm tra kiến trúc`.


### Enum dùng chung phải ở Core, không lồng trong lớp ở tầng cao (2026-09-05)

Bản đầu của hệ thời tiết khai `WeatherAmbience.Weather`/`.Motes` là enum LỒNG trong component
(**Combat**), rồi cho `MapTheme` (**Core**) khai kiểu đó — tham chiếu NGƯỢC TẦNG.

⚠⚠ **`dotnet build` gộp cả `Assets/` một cục vẫn XANH** vì lúc đó mọi type đều thấy nhau; chỉ
Unity mới báo (Core không tham chiếu Combat trong `.asmdef`). Đây đúng cái bẫy mục này đã ghi:
*biên dịch gộp KHÔNG chứng minh được ranh giới module*.

Chốt: `Core/WeatherKinds.cs` giữ `WeatherKind` · `WeatherMotes`. `enum`/`struct` thuần thì dời
file tự do (không asset nào trỏ vào bằng GUID), khác hẳn `MonoBehaviour`/`ScriptableObject`.
Cách tự bắt: sau khi thêm field vào một type ở Core, `rg` xem nó có nhắc tên type nào của tầng
cao hơn **trong code** (không tính chú thích) không.

### `internal` = CÙNG ASSEMBLY, không phải "cùng dự án" (2026-09-07)

`MapWrap` (**Core**) khai `internal static void RaiseWrapped(...)` với ý "chỉ người trong nhà
gọi", mà người gọi duy nhất — `MapWrapZone` — nằm ở **Combat**. Mỗi thư mục là một assembly
riêng, nên `internal` đóng đúng vào mặt người gọi hợp lệ: `MapWrapZone.cs … CS0117 'MapWrap'
does not contain a definition for 'RaiseWrapped'`.

⚠ Đây là bẫy **ngược chiều** với mục trên: bản gộp một cục thì `internal` mở toang và không
ai thấy gì; tách module xong mới vỡ, và thông báo lỗi nói *"không có hàm này"* chứ không nói
*"không cho anh gọi"* nên rất dễ đi tìm nhầm chỗ (tưởng mất hàm, tưởng chưa biên dịch lại).

Chốt: hàm ở tầng thấp mà tầng CAO HƠN phải gọi thì để `public`, và ghi rõ **ai là người gọi
và ở assembly nào** ngay trên hàm — `internal` chỉ dùng cho thứ thật sự không ra khỏi thư mục.

## Sổ ở Core cho câu hỏi ngược tầng — `WorkSpeed` (2026-09-08)

`AIStateWork` (module 2 — AI) đếm nhịp làm việc của nông dân, nhưng thứ QUYẾT ĐỊNH nhịp đó là bảng
nâng cấp `CampTech` (module 4 — Gameplay). Tầng thấp không được tham chiếu lên tầng cao.

Cách chữa (đúng khuôn `ContestedZones`, `INoAutoDress`, `INoPlaybook`): **câu hỏi hạ xuống Core,
câu trả lời do tầng cao khai**. `WorkSpeed.ScaleFor(teamId)` sống ở `Core/StickmanContracts.cs`;
`CampTech.OnEnable` gọi `WorkSpeed.SetProvider(...)`, `OnDisable` của bảng CUỐI CÙNG gỡ nguồn.

⚠ Không ai khai thì trả 1 — mọi màn cũ chạy y như trước, không phải sửa gì.
⚠ Kẹp giá trị trong sổ ([0.4, 1]), đừng tin bảng số: một số đặt sai không được phép biến nông dân
thành bất tử hoặc đứng im vĩnh viễn.
⚠⚠ **Biên dịch gộp cả `Assets/` KHÔNG lộ ra lỗi này** — phải compile từng assembly mới thấy. Đã
dính HAI lần trong cùng một ngày: bản nháp gọi thẳng `CampTech.Owns` từ `AIStateWork` (AI → Gameplay),
và `CampRallyPoint` gọi `StickmanSceneUtils.LoadSquare()` — lớp nằm trong `Assets/Editor`, tức
**không tồn tại trong bản build**. Cả hai đều "biên dịch sạch" rồi Unity báo lỗi ngay.

**Phép kiểm đúng là HAI lần compile RIÊNG:**
1. `Assets/Scripts` một mình → phải sạch tuyệt đối;
2. `Assets/Editor` một mình, tham chiếu dll vừa dựng ở bước 1.

Gộp hai thư mục là đo một thứ KHÁC với thứ Unity đo. Runtime cần ô vuông trắng thì tự dựng bằng
`Sprite.Create(Texture2D.whiteTexture, …)` (xem `CampGeneral.Square`), đừng mượn tool dựng scene.

## Repo GAME mượn bộ khung bằng SUBMODULE — `ProjectSettings/` không đi theo (2026-09-09)

Bộ khung là repo riêng; game thật nằm ở repo khác và gắn repo này vào `Assets/XoiStickman`
bằng `git submodule` (sửa core từ trong dự án game rồi push thẳng về core). Lệnh, bảng cấu
hình và sáu bẫy: `Docs/KnowledgeBase/Submodule.md`. Đo hộ: `Docs/Tools/UseAsSubmodule.ps1`.

⚠⚠ **Bốn thứ hỏng TRONG IM LẶNG khi thiếu** (đều nằm ngoài submodule):

| Thứ | Đo được | Thiếu thì |
|---|---|---|
| Sorting layer `character` = `1203916601` | 112 renderer ghi `m_SortingLayerID` | rơi về `Default`, art đè sai thứ tự, không lỗi |
| Tag `Ground` · `Bullet` | 9 chỗ `CompareTag` trong runtime | `UnityException` lúc chạy |
| sparse-checkout `/Assets/` | 265 file ngoài `Assets/` | Unity rải `.meta` vào cây làm việc của repo core |
| `activeInputHandler` ≠ 1 | `Input.GetKey` khắp Combat/Gameplay | `InvalidOperationException` |

⚠ **Đừng chạy tool `Tools > Stickman` trong dự án GAME.** Hơn 100 đường dẫn `"Assets/..."` ghi
cứng trong `Assets/Editor` sẽ trỏ vào `Assets/` của game, tool vẫn báo thành công còn asset
sinh ra nằm ngoài submodule. Sinh art / dựng scene / cân bằng thì mở dự án bộ khung mà chạy.

⚠ Submodule mặc định đứng ở **detached HEAD** — commit sửa core mà quên `git checkout main`
là mất sạch ở lần `git submodule update` sau, không cảnh báo gì.

## Sửa từ trong game: để ở GAME hay đẩy vào CORE (2026-09-15)

Hỏi ba câu, trả lời trước khi `git add`; `UseAsSubmodule.ps1 -Status` in sẵn ba câu này kèm
danh sách file đã sửa (đã gắn nhãn module) và thứ tự đẩy an toàn:

1. **Game khác cũng dùng được?** — không → để bên game, hết chuyện.
2. **Có tên riêng của game trong code** (tên màn, tên nhân vật, số cân bằng của game)? — có →
   để bên game. Core không được biết tên một game cụ thể.
3. **Đổi hành vi MẶC ĐỊNH của bộ khung?** — có → **đừng sửa thẳng**: thêm cờ bật-tắt (mặc định
   giữ hành vi cũ) hoặc chỗ cắm, rồi bật ở phía game. Mẫu: `StickmanContracts.cs`, `NavalStateFactory`.

**Thứ tự đẩy: PUSH CORE TRƯỚC, luôn luôn.** Repo game chỉ ghi một SHA; push game trước là
người khác clone về dính `upload-pack: not our ref`. `-Status` báo cả ba trạng thái này (core
còn commit chưa push · mốc trong repo game đã lệch · submodule detached).

**File mới bên game hoá ra là đồ dùng chung** → `-Promote '<file>' -Into '<thư mục trong bộ khung>'`:
dời kèm `.meta` (GUID giữ nguyên, prefab/scene không đứt), rồi in `using` của file và tên
assembly đích để soát phụ thuộc ngược tầng ngay. Dời xong phải tự sửa `namespace` cho khớp
module và chạy Kiểm tra kiến trúc ở **dự án bộ khung**.

⚠ Một máy có **hai bản sao core** (xưởng + submodule), chúng chỉ gặp nhau trên GitHub. Đẩy core
từ trong game xong phải `git pull` ở xưởng **trước khi** chạy tool, nếu không tool chạy trên
bản cũ và ghi đè mất phần vừa đẩy.
