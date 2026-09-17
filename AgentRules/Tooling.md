## Nguyên tắc số 1: TOOLING-FIRST

### Đo FPS / RAM và vòng đời pool runtime

`StickmanPerformanceDiagnostics` nằm ở Bảng điều khiển → Rig & Kiểm tra; đo 30 giây khi được yêu cầu.
Quy trình và giới hạn số đo: [Performance](../KnowledgeBase/Performance.md).
Doctor có check **Giới hạn SFX và VFX đang chạy**: đo active/cap và cờ DontSave trên root pool khi Play.
`ObjectPool.maxSize` chỉ chặn số object trả về pool, không chặn số đang chạy: kiểm cap **trước Get**.
Không gắn `HideAndDontSave`/`DontSave` lên GameObject pool runtime: cờ này có thể giữ object qua
đổi scene/thoát Play. VFX ngắn thuộc scene; audio dùng DontDestroyOnLoad bình thường, không DontSave.
`FloatingMark` có trần 128 dấu và root hủy sprite/texture tự tạo; `HitStop` cũng không dùng DontSave.
Material tạo bằng `new` phải có chủ hủy; `WaterSurface` dùng chung một material cho hai đường, hủy ở OnDestroy.
Bảng điều khiển không quét proof/asset trong Play. Không chạy Doctor hay quét object mỗi frame.
Không kết luận memory leak từ một mẫu RAM cao hoặc FPS đã sửa chỉ dựa vào compile.

Mọi thao tác lặp lại được PHẢI là tool trong menu `Tools > Stickman` (code ở `Assets/Editor/`),
với số liệu mặc định lấy từ `Docs/KnowledgeBase/`. AI làm việc với dự án này:
1. Tìm tool có sẵn trước (bảng tool ở cuối file) — đừng dựng tay cái tool đã làm được
2. Chưa có tool mà việc sẽ lặp lại → VIẾT TOOL MỚI rồi mới chạy, đừng làm tay một lần
3. Setting/số liệu mới → ghi vào định nghĩa tool hoặc ScriptableObject, đừng hardcode rải rác

### ★ MỘT CỬA DUY NHẤT — `Tools > Stickman > ★ Bảng điều khiển` (Ctrl+Alt+S)

Bộ tool đã lên hơn 100 mục menu. Xếp theo HỆ THỐNG (Weapons / AI / Genres / Maps...) thì
người viết code tra được, còn người đang cần làm MỘT việc cụ thể thì không — đó là lúc menu
biến thành mê cung và câu hỏi *"giờ bấm cái nào?"* không có chỗ nào trả lời.

`StickmanToolCenter.cs` là chỗ trả lời câu đó. Nó xếp theo **VIỆC MUỐN LÀM**, mỗi nút kèm
một câu *bấm khi nào*, có ô TÌM KIẾM, và chấm xanh/đỏ đo bằng **FILE CÓ THẬT** (cùng khuôn
`StickmanBuildPipeline`) nên không bao giờ nói dối. Tám tab:
**Bắt đầu** (dự án thiếu gì, gợi ý ĐÚNG MỘT việc nên bấm tiếp) · **Chơi thử** (mở thẳng
scene, khỏi lục Project) · **Vũ khí** · **Nhân vật** · **AI** · **Động tác · Effect · Tiếng** ·
**Thể loại & Map** · **Rig & Kiểm tra**.

Menu `Tools > Stickman` giờ chỉ còn **ba mục** ở tầng ngoài:
`★ Bảng điều khiển` · `Build/` (dây chuyền dựng 0–4, 9) · **`Nâng cao/`** — nơi chứa ĐỦ
hơn 100 mục cũ, không xoá cái nào, chỉ dọn khỏi đường đi hằng ngày. **Mọi đường dẫn menu ghi
trong file này giờ có tiền tố `Nâng cao/`** (trừ nhóm `Build/`): `Tools > Stickman > Weapons >
Balance Report` đọc là `Tools > Stickman > Nâng cao > Weapons > Balance Report`.

### ★ KHÁM SỨC KHOẺ DỰ ÁN — VIẾT MỘT `Check`, ĐỪNG VIẾT CÁI ⚠ THỨ 1 043

`Tools > Stickman > Nâng cao > Rig & Kiểm tra > ★ KHÁM SỨC KHOẺ DỰ ÁN`
(`Assets/Editor/Doctor/StickmanDoctor.cs`) — **MỘT CỬA** cho câu hỏi *"dự án đang hỏng chỗ nào"*.

⚠⚠ **FILE NÀY DÀI 8 800 DÒNG VÀ CÓ HƠN 1 000 DẤU ⚠. Đó là định dạng dành cho người ĐỌC HẾT
và NHỚ HẾT.** Ai không đọc nổi ngần ấy — người mới, hoặc một AI yếu có cửa sổ ngữ cảnh nhỏ —
thì mọi cái ⚠ trong đây **bằng không**, vì không cái nào tự chặn được gì. `StickmanDoctor`
đổi định dạng của luật: **từ VĂN BẢN PHẢI ĐỌC sang PHÉP ĐO MÁY TỰ CHẠY.** Người dùng chỉ cần
nhớ đúng một câu: *"làm xong thì bấm ★ Khám sức khoẻ; còn ĐỎ thì chưa xong."*

**LUẬT, một dòng:**

> **Gặp một bẫy hỏng-trong-im-lặng thì VIẾT MỘT `Check` TRƯỚC, viết đoạn ⚠ SAU.**
> Đoạn ⚠ vẫn nên viết — nhưng để GIẢI THÍCH cái dòng đỏ, không phải để THAY nó.

Thêm phép đo = thêm MỘT phần tử vào `StickmanDoctor.Checks`, và nó phải trả lời đủ **ba câu**:
sai ở đâu (**kèm SỐ ĐO**) · vì sao nguy hiểm (`Check.Why`) · **SỬA BẰNG CÁCH NÀO** (bấm nút
nào, sửa file nào). Thiếu câu thứ ba thì người đọc biết mình hỏng mà không biết làm gì tiếp —
một dòng đỏ như vậy chỉ tổ gây lo.

⚠ **ĐO BẰNG THỨ CÓ THẬT** (file trên đĩa · asset đã bake · GUID trong YAML của scene ·
attribute trong assembly), KHÔNG bằng cờ nhớ — đúng khuôn `StickmanReadiness`.
⚠ **KHÔNG MỞ SCENE NÀO**: mọi phép đo về scene đọc thẳng file `.unity` dạng text (khuôn
`StickmanModeAudit`). Mở scene là đụng vào scene người dùng đang làm dở.
⚠ **KHÔNG vẽ huy hiệu số đỏ thường trực** như `StickmanReadiness`: Doctor quét toàn bộ asset
+ mọi file scene, chạy trong `OnGUI` là treo cả bảng mỗi lần vẽ lại. Nó là một cú BẤM.

⚠⚠ **PHÉP ĐO MỚI PHẢI ĐƯỢC HIỆU CHUẨN TRÊN DỮ LIỆU THẬT TRƯỚC KHI BÀN GIAO — cảnh báo GIẢ
giết bảng nhanh hơn là không có bảng.** Đã dính ngay trong lần dựng đầu, cả hai lần đều là
"đúng luật nhưng báo nhầm đối tượng":
· **vũ khí câm** réo 6 prefab GỐC (`Weapon_Base`, `Weapon_MeleeBase`…) — clip nằm ở từng
  variant nên gốc không có là bình thường. Chốt bằng `LeafWeaponPrefabs()`, nhận diện gốc
  bằng **QUAN HỆ THẬT** (`PrefabUtility.GetCorrespondingObjectFromSource`), KHÔNG bằng cái
  tên kết thúc bằng "Base";
· **số tuning chết lặng** réo `flankCommitTime` — nó để 0 ở cả 37 asset nhưng đã được chữa
  bằng **SÀN ĐỌC-LÚC-CHẠY** (`AIProfile.FlankCommitTime`). Field nào đọc qua sàn/hệ số kiểu
  đó phải khai vào `IntentionallyOff` **kèm lý do**.
⚠ Giữ `IntentionallyOff` NGẮN: miễn trừ bừa là phép đo mất sạch tác dụng, mà **một cảnh báo
lúc nào cũng sáng thì vô dụng ngang một cảnh báo không bao giờ sáng**.

**Phép đo hay nhất của bảng — «SỐ TUNING KHAI MÀ CHƯA AI BẬT»**: field có người ĐỌC trong code
mà MỌI asset đều để 0 = một tính năng đã viết xong nhưng **chưa chạy lần nào**. Đây chính là
cách *vòng ra sau lưng* và *mưa tên đồng loạt* nằm chết nhiều tháng (§2e-quet) — code đủ, tài
liệu đủ, không asset nào bật. Trước đây phải rà tay mới thấy; nay nó là một dòng vàng.

### ⚠⚠ CHẠY HÀNG LOẠT THÌ ĐỪNG HỎI — `StickmanBatch` (2026-09-09)

User: *"khi bấm «chạy lại hết» thì nó tự chạy khỏi hỏi lại tôi, tự OK, tự reload luôn"*.

Bấm «Chạy lại hết 54 việc» rồi đi làm việc khác, quay lại thấy dây chuyền **đứng ở việc thứ
hai** vì một `EditorUtility.DisplayDialog` đang chờ người bấm. Trong `Assets/Editor` có **80 hộp
thoại** + 5 chỗ hỏi lưu scene nằm trên đường chạy đó.

**Luật:** mọi hộp thoại trong `Assets/Editor` gọi `StickmanBatch.Ask(…)`, mọi chỗ hỏi lưu scene
gọi `StickmanBatch.SaveScenes()`. Ngoài mẻ thì chúng **y hệt** `EditorUtility.DisplayDialog` /
`SaveCurrentModifiedScenesIfUserWantsTo`. Trong mẻ (`StickmanBatch.Silent`, do
`StickmanBuildPipeline` bật/tắt cùng `_running`):

| Loại hộp | Trong mẻ |
|---|---|
| một nút (báo cáo) | không hiện, đổ thẳng vào Console |
| hai nút (“chạy tiếp?”) | **tự đồng ý**, ghi một dòng log |
| hai nút có mùi MẤT DỮ LIỆU (ghi đè · xoá · đổ lại · reset) | **tự TỪ CHỐI** + log vàng |
| hỏi lưu scene | lưu luôn (`SaveOpenScenes`), không bỏ thay đổi |

⚠⚠ **VẾ THỨ BA MỚI LÀ VẾ QUAN TRỌNG.** "Tự OK hết" nghe tiện, nhưng trong 80 hộp đó có
*"Ghi đè kịch bản bạn đã sửa tay?"* — tự đồng ý là xoá công người dùng mà không ai kịp thấy.
Đo lại sau khi đổi: chỉ **2 hộp** dính nhóm này («Xoá art code-gen lỗi thời?» · «Gắn nhãn art
hiện có?») — cả hai đều thuộc tool `destructive`, vốn đã bị loại khỏi mẻ, nên bấm tay vẫn hỏi
đủ như cũ.

⚠⚠ **SỬA CODE TRONG LÚC MỘT MẺ ĐANG CHẠY = GIẾT MẺ ĐÓ.** Hàng đợi nằm trong biến
`static`; Unity biên dịch lại là domain reload, là hàng đợi **bốc hơi** — thanh tiến trình
biến mất, nửa số việc không chạy, không một dòng nào nói là nó đã chết. Đo được
2026-09-09: `StickmanWuxiaAllBuilder.cs` bị sửa lúc **18:43** trong khi mẻ bắt đầu lúc 18:41 ⇒
bốn trong tám file kết quả giữ dấu 18:41, dòng «★ VÕ LÂM» vàng lại ngay sau khi vừa chạy.
Nay `StickmanBuildPipeline` ghi cờ vào `SessionState` (sống qua reload, chết khi đóng Editor):
nạp lại mà cờ còn bật thì **kêu một dòng vàng** thay vì im. Phần việc dở vẫn nằm nguyên
trên bảng — bấm lại là chạy tiếp đúng phần còn thiếu.

⚠ `Silent` và `_running` **phải đi chung một hàm** (`StickmanBuildPipeline.SetRunning`): `_running`
được tắt ở bốn đường thoát khác nhau, tách hai cờ ra thì kiểu gì cũng có một đường quên tắt
`Silent` — và từ lúc đó MỌI hộp thoại trong Editor đều tự trả lời.

### ⚠⚠ NỐI TOOL VÀO BẢNG: TRUYỀN METHOD GROUP, ĐỪNG BỌC LAMBDA (2026-09-09)

Khối *TOOL TỰ NHẬN VÀO BẢNG* so theo **LỚP KHAI BÁO của delegate**
(`Run.Method.DeclaringType`). Lambda `() => Foo.Open()` thuộc class ẩn `<>c` của trình biên
dịch, nên lớp `Foo` **không được tính là đã có trên bảng** — nút nằm ngay trước mắt mà
bảng vẫn réo tên. Đã dính với cửa sổ Trường quay.

```csharp
new Tool("…", "…", () => StickmanCinematicWindow.Open(), …)   // sai: bảng không thấy
new Tool("…", "…", StickmanCinematicWindow.Open, …)          // đúng
```

Cùng lý do với `Job`: lambda thì `StickmanReadiness` không suy được file nguồn ⇒ mục *CÓ
THỂ CẦN CHẠY LẠI* không bao giờ sáng — đó là lý do `Job` có tham số `extraSources`. Phải
bọc lambda (vì cần truyền tham số) thì **khai `extraSources` tay**, và khai chính file
builder chứ không chỉ file dữ liệu runtime (đã hụt đúng vậy ở «Sinh lại danh sách màn cho
menu» và «Quét folder → AppearanceSet»: cả hai khai `GameMenuConfig.cs` / `StickmanRigMetrics.cs`
mà quên builder của mình).

**File `partial` được tính tự động (2026-09-09).** `StickmanReadiness.ScriptPathsOf` lấy
`{Lớp}.cs` **cộng mọi `{Lớp}.*.cs`**, và nở luôn cho từng đường dẫn khai tay trong
`extraSources`. Trước đó chỉ hỏi đúng một file, nên bảng số nằm trong
`StickmanCivilizationBuilder.Modern.cs`, `StickmanActionSetBuilder.WuxiaStance.cs`,
`StickmanBuildingArt.Civilizations.cs`… sửa xong mà bảng im — 7 tool dính, không lỗi nào báo.
⇒ **Tách một builder dài thành partial không còn làm hỏng phép đo**; nhưng tách sang một lớp
TÊN KHÁC thì vẫn phải khai `extraSources`.

**⚠⚠ DỜI THƯ MỤC CŨNG TỪNG LÀM HỎNG PHÉP ĐO NÀY — và nó im suốt (2026-09-15).**
`ScriptPathsOf`/`ScriptPathOf` xưa ghép cứng `$"Assets/Editor/{tên lớp}.cs"`, tức giả định mọi
builder nằm PHẲNG ở gốc `Assets/Editor`. Đợt *"sắp xếp 1048 file .cs vào thư mục theo TÍNH
NĂNG"* dời hết vào thư mục con ⇒ đo được **0/340 file còn nằm phẳng**, nên phép suy nguồn trả
RỖNG cho **mọi** tool trên bảng. Hậu quả: bảng đo "cần chạy lại" bằng cách so mtime NGUỒN với
CHỨNG, không có nguồn thì không có gì để so — **sửa bảng số trong bất kỳ builder nào xong,
dòng của nó không bao giờ vàng nữa**. Biên dịch xanh, Doctor xanh, mọi phép so vẫn đúng; chỉ
là không ai hỏi tới file builder.

**Đo bằng chính Doctor, trước và sau khi sửa** (cùng repo, cách nhau một lần sửa):

| | trước | sau |
|---|---:|---:|
| Tool bị báo «có chứng, KHÔNG có nguồn để so» | 12 | **0** |
| Việc bảng báo «CÓ THỂ CẦN CHẠY LẠI» | 11 | **72** |

Tức **61 tool đang báo "đã dựng đủ, không có gì cũ"** trong khi builder của chúng đã sửa mới
hơn kết quả trên đĩa. Đó là con số thật của một phép đo chết trong im lặng.

Đã sửa: `StickmanReadiness.EditorScriptOf` tìm ĐỆ QUY dưới `Assets/Editor` và nhớ theo tên lớp
(đo: 0 tên file `.cs` trùng nhau trong 340 file, nên phép tra đơn nghĩa). Bài học chung: **một
phép đo ghép cứng đường dẫn là một phép đo có hạn dùng** — đợt dọn thư mục kế tiếp sẽ giết nó,
và nó chết không kêu. Đây cũng là lý do Doctor có phép đo «Tool có file chứng nhưng không có
file nguồn nào để so»: chính phép đo ấy đã bắt được lỗi này.

**Đo lại toàn bộ** — lớp nào có `[MenuItem("Tools/Stickman/…")]` mà bảng không gọi bằng
method group:

```bash
grep -rl 'MenuItem("Tools/Stickman' Assets/Editor/*.cs
```

rồi đối chiếu với `StickmanToolCenter.cs` + `StickmanBuildPipeline.cs`. (Bảng điều khiển đã
làm đúng việc này bằng reflection mỗi lần mở — tin nó trước.)

### BẢNG TỰ NHẬN TOOL CHƯA KHAI — VÀ VÌ SAO VẪN PHẢI KHAI TAY (2026-09-10)

`StickmanToolAdoption.cs`. Trước đây mục menu chưa khai chỉ được **réo tên**, và cách chữa duy
nhất là *sửa code* — nghĩa là từ lúc viết xong builder tới lúc ai đó rảnh tay khai nó, tính năng
mới **nằm ngoài bảng**. Nay bảng tự kéo mọi mục `[MenuItem("Tools/Stickman/…")]` chưa khai vào
đúng tab, ngay lượt vẽ kế tiếp, không sửa dòng nào.

Tab được **đoán bằng dữ liệu, không bằng bảng gõ tay**: mỗi nút đã khai biết lớp chủ của nó, mỗi
lớp chủ biết mục menu của mình nằm nhánh nào ⇒ `Nâng cao/Trường quay` tự học được là thuộc tab
«🎬 Trường quay». Bốn bước, dừng ở bước đầu tiên có câu trả lời: nhánh y hệt đã có phiếu → nhánh
trùng ĐOẠN CUỐI (`Maps` ↔ `Nâng cao/Maps`) → tiêu đề tab chứa đoạn cuối (`Modules` → «Module &
bàn giao») → chịu, để ở tab «Tất cả tool (menu)» (gương menu vốn liệt kê đủ).

⚠⚠ **TỰ NHẬN KHÔNG THAY ĐƯỢC MỘT DÒNG KHAI TAY.** Nút tự nhận chỉ có tên; nó **không có `proof`**
nên không có chấm xanh/đỏ, và vì thế **không bao giờ lọt vào mục *CHƯA CHẠY* / *CÓ THỂ CẦN CHẠY
LẠI*** — builder chỉ được tự nhận thì bảng vẫn không biết nó đã chạy hay chưa. Tool sinh ra asset
thì vẫn phải `new Tool(…, proof: …)`; tool soi/chạy-một-lần thì để tự nhận là đủ. Khối ở tab «Bắt
đầu» đổi tên thành *TOOL TỰ NHẬN VÀO BẢNG* và nói đúng chuyện còn thiếu đó.

⚠ **Không cho phần tự nhận ghi ngược vào `StickmanToolbox.Sections`.** `Unregistered()` đo "chưa
khai" bằng chính mảng ấy; mảng tự nuốt phần tự nhận thì lượt đo sau thấy cái gì cũng "đã khai" và
khối cảnh báo tắt ngóm — bảng nói dối rằng tool nào cũng có mô tả và file chứng. Phần tự nhận
sống riêng, chỉ cộng vào **lúc vẽ**.

⚠ **Mục `validate: true` bị loại** ở cả `Unregistered()` lẫn gương menu: nó chỉ trả true/false cho
Unity, gọi nó chẳng làm gì — mà từ lúc mỗi dòng thành một NÚT THẬT thì đó là nút bấm vào im lặng
tuyệt đối.

### ⚠ TÍNH NĂNG MỚI CẦN CHẠY TOOL → PHẢI BÁO ĐƯỢC LÀ "CHƯA CHẠY"

Làm xong một tính năng thì gần như luôn còn một bước *"chạy tool"* (dựng lại bộ động tác,
sinh asset, dựng scene test). Bước đó **hỏng trong im lặng**: quên chạy thì KHÔNG có lỗi nào
báo, chỉ có hành vi sai lúc chơi — chính cái bẫy đã ghi ở hệ động tác (*"Pick không thấy tên,
rơi về idle ngẫu nhiên: không lỗi, chỉ là không thấy dáng gác"*).

`StickmanReadiness.cs` biến cái im lặng đó thành **con số đỏ trên thanh công cụ của Bảng điều
khiển** (`⚠ N việc chưa chạy`, hiện ở MỌI tab). Ba câu hỏi, đều đo bằng thứ CÓ THẬT — file
trên đĩa và attribute trong assembly, KHÔNG bằng cờ nhớ trong `EditorPrefs`:

| Mục | Nghĩa | Đo bằng |
|---|---|---|
| ○ **CHƯA CHẠY** (đỏ) | file kết quả không có trên đĩa | `proof` của Job/Tool |
| ◐ **CÓ THỂ CẦN CHẠY LẠI** (vàng) | file `.cs` khai dữ liệu MỚI HƠN file kết quả — "vừa sửa bảng số mà quên bấm lại nút" | dấu thời gian file |
| · **TOOL TỰ NHẬN VÀO BẢNG** | có `[MenuItem("Tools/Stickman/…")]` mà chưa ai khai tay — bảng đã tự kéo vào tab đoán được, còn thiếu mô tả + `proof` | reflection |

### ⚠⚠ "BẤM NÓ KHÔNG HOÀN THÀNH" = GHI LẠI ASSET KHÔNG ĐỔI, HÀNG NGHÌN LẦN (2026-09-09)

Triệu chứng: bấm một nút dựng scene, thanh tiến trình đứng im hàng phút, Console không
một dòng lỗi. Đo trên `Logs/Editor.log` (KHÔNG phải `%LOCALAPPDATA%/Unity/Editor/Editor.log`
— file ấy có thể của project khác đang mở) của MỘT phiên làm việc:

| File | Số lượt import |
|---|---|
| `Assets/Settings/AIProfile_Default.asset` | **1561** |
| `Genre_*` · `MapTheme_*` (8 file) | **290 mỗi file** |
| `Doctrine_Defensive/Guerrilla` | 147 mỗi file |
| — tổng | **8575 lượt *Asset Pipeline Refresh*** |

Mỗi lượt kèm *Refreshing native plugins* ~0.1–0.2 giây ⇒ cộng lại là hàng phút chỉ để
ghi đi ghi lại mấy file không đổi một byte. Hai cỗ máy:

1. **`SaveAssets()` nằm trong hàm NỀN.** `StickmanAIBuilder.EnsureDefaultProfile()` gọi
   `SaveAssets` mỗi lần, mà nó là nguồn baseline: `StickmanAIPersonalityBuilder.Ensure` gọi nó
   **10 lần** (mỗi tính cách một lần), AI Lab và zombie cũng gọi — và `EnsureAll` thì chạy
   trong `StickmanSceneUtils.EnsureAllAssets`, tức **trước MỖI lượt dựng scene**.
   ⇒ **`Ensure*` KHÔNG ĐƯỢC `SaveAssets`.** Cửa lưu là của người gọi (menu / dây chuyền).
2. **`SetDirty` vô điều kiện.** Hàm `Ensure*` idempotent ghi đúng con số cũ rồi vẫn
   `SetDirty` ⇒ lượt `SaveAssets` sau đó ghi + import lại toàn bộ.
   ⇒ Dùng `StickmanAssetSave.Snapshot()` + `MarkDirtyIfChanged()`.

**Cách đo lại** (từ gốc repo) — xem file nào đang bị ghi lại nhiều nhất:

```bash
grep -ao "Path: Assets/[^']*'" Logs/Editor.log | sort | uniq -c | sort -rn | head
```

### ⚠⚠ SÁU KIỂU "BẤM MÀ DÒNG VÀNG KHÔNG TẮT" (2026-09-09)

Mục *CÓ THỂ CẦN CHẠY LẠI* đo bằng **so mtime**: nguồn (`.cs` + `extraSources`) mới hơn
file chứng thì vàng. Sáu cách làm cho phép đo ấy nói dối — cả sáu đã xảy ra thật:

**1. Tool chỉ MỞ CỬA SỔ mà vẫn khai `proof`.** «Prompt → Particle Effect» có
`Run = OpenWindow`: bấm «Chạy» thì cửa sổ hiện ra rồi hết, không file nào đổi dấu ⇒ vàng
vĩnh viễn. ⇒ Tool KHÔNG tự sinh ra file chứng phải khai `skipStaleCheck: true`.

**2. Asset được ghi lại DÙ NỘI DUNG KHÔNG ĐỔI.** `EditorUtility.SetDirty` +
`AssetDatabase.SaveAssets()` luôn ghi file, mtime nhảy lên. Đo được: bấm
«★ VÕ LÂM — DỰNG TẤT CẢ» lúc 13:28:30 ⇒ nó dựng lại mọi nền văn minh ⇒ `Civ_Wu.asset`
mang dấu mới ⇒ ba dòng «Tam Quốc…» (scene vừa bake lúc 13:28:06–14, khai `Civ_*.asset`
là nguồn) chuyển vàng **ngay sau khi vừa dựng xong**. ⇒ Dùng
`StickmanAssetSave.SaveKeepingUnchanged(<thư mục>)` thay `AssetDatabase.SaveAssets()`: nó
trả lại mtime cho file có băm giống hệt. Cùng bài học với
`StickmanArtSource.WritePng` (*"không ghi lại thứ không đổi"*).

**3. Nguồn được ghi SAU khi kết quả đã lưu.** Tool dựng scene mà cuối lượt mới
`SaveAssets()` một asset nó khai là nguồn thì nguồn **luôn** mới hơn scene. ⇒ Ghi asset
XONG rồi mới bake scene (đúng thứ tự `RankArt → RankAsset → RankWire → RankScene`), và
tool dựng scene phải khai `stage: StickmanReadiness.RankScene`.

**4. Tool CHỈ LẤP CHỖ TRỐNG mà không khai `skipStaleCheck`.** «Tiếng bù cho khoá còn câm»
chạy `Generate(overwrite: false)`: nó sinh đúng file CÒN THIẾU. Bấm lúc 15:20 ⇒ 11 file mới
ra đúng giờ, nhưng 21 file của đợt trước vẫn mang dấu cũ hơn `StickmanAudioSynth.cs` — mà
`IsOlder` chỉ cần **MỘT** file cũ hơn là kêu vàng ⇒ bấm mãi không tắt. ⇒ Việc kiểu
"vẽ bù / sinh bù" chỉ có hai trạng thái ĐỎR/XANH: khai `skipStaleCheck: true` **cho cả
`Tool` LẪN `Job`** (cờ này vừa được thêm cho `Job` — trước đó chỉ `Tool` có, nên dòng vàng
của dây chuyền không ai tắt được).

**5. `proof` kể cả thứ tool KHÔNG GHI RA.** «★ VÕ LÂM — DỰNG TẤT CẢ» khai chín thứ, trong
đó có `Sprites/Civilizations/Shaolin/Weapon_Saber.png`. Bấm nút lúc 15:24 ⇒ tám thứ kia mang
dấu mới, riêng tấm PNG vẫn ở 12:36 vì **art đi theo LUẬT NGUỒN ASSET** (code chỉ vẽ bù,
không ghi đè) ⇒ dòng đó vàng vĩnh viễn. ⇒ **`proof` là "thứ việc NÀY ghi ra", không phải
"thứ việc này cần có".** Cần có mà thiếu thì builder tự DỪNG và réo tên nút — đó mới là
chỗ báo. (Giữ danh sách đầy đủ cho bảng báo cuối lượt thì được, nhưng `ProofPaths()` đưa
cho bảng phải lọc bớt.)

**6. KẾT QUẢ ĐÚNG RỒI NÊN KHÔNG AI GHI LẠI NÓ — và nguồn thì vừa bị CHẠM.** Đây là mặt
trái của cách sửa (2): builder idempotent dùng `StickmanAssetSave.MarkDirtyIfChanged` **cố ý
không ghi file khi số y hệt**. Ngày 2026-09-09 có một lượt chuẩn hoá làm **387 file `.cs`
cùng mang dấu 20:11** (nội dung KHÔNG đổi — `git diff` rỗng), trong khi
`AIProfile_CuongChien.asset` và `Genre_Medieval.asset` giữ dấu 06:30. Hai dòng «8 TÍNH CÁCH»
và «Dựng asset 3 thể loại» **vàng vĩnh viễn: bấm bao nhiêu lần cũng không tắt**, vì không lần
bấm nào có quyền làm file kết quả mới hơn. Người dùng đọc ra *"2 tool này không chạy được"* —
và đọc vậy là đúng.

⇒ Câu hỏi thật không phải *"kết quả có mới hơn nguồn không"* mà *"kết quả đã được ĐỐI CHIẾU
với bảng số hiện tại chưa"*. `StickmanRunLog` (`UserSettings/StickmanRunLog.txt`) ghi mốc đối
chiếu cho từng file chứng **mỗi khi một việc chạy xong không lỗi** — gọi ở đúng MỘT chỗ,
`StickmanBuildPipeline.Tick` ngay sau `job.Run()` — và `StickmanReadiness` lấy
`max(mtime, mốc đối chiếu)` làm tuổi kết quả. Ba ràng buộc phải giữ:

* **chỉ ghi mốc cho file CÓ THẬT** — tool bỏ ngang (chưa chọn gì, huỷ hộp thoại) thì mục ĐỎ
  *chưa chạy* vẫn đỏ; sổ chỉ hạ được mức NGHI NGỜ, không dựng bằng chứng từ không khí;
* **đừng chạm mtime của file kết quả cho xong** — kết quả của tool này là NGUỒN của tool khác
  (asset nền văn minh → scene bake nó), chạm là mọi scene vàng oan, đúng con bọ (2) ở trên;
* **nút nào cũng phải mang `proof` theo** khi bọc tool lẻ thành `Job` tạm, không thì dây
  chuyền không có gì để ghi mốc (`StickmanReadiness.Item.Proof`).

Sổ nằm ở `UserSettings/` — cùng hạng với mtime: sự thật CỦA MÁY NÀY, không commit, xoá đi thì
bảng quay về hành vi so-mtime cũ.

**Phân biệt với VÀNG THẬT:** phiên khác (hoặc chính bạn) vừa sửa file `.cs` của builder
thì vàng là ĐÚNG — bấm là tắt. Kiểm bằng dấu thời gian trước khi đi sửa code:

```powershell
Get-Item Assets/Editor/<Builder>.cs, Assets/_Scenes/<Scene>.unity |
  Select-Object Name, LastWriteTime
```

### ⚠⚠ LUẬT VÀNG: "NHỚ BẤM TOOL NHÉ" KHÔNG PHẢI LÀ MỘT CÁCH BÀN GIAO

**Bảo người dùng chạy tool bằng LỜI — trong chat, trong commit message, trong changelog — là
CHƯA LÀM XONG VIỆC.** Lời nói không có chỗ nào để tra lại: hôm sau mở dự án ra thì không ai
biết còn nợ bước nào, và cái nợ đó **hỏng trong im lặng** (không lỗi, chỉ là hành vi sai lúc
chơi). Đúng một dòng luật:

> **Việc "cần chạy tool" PHẢI ĐO ĐƯỢC TRÊN BẢNG ĐIỀU KHIỂN.** Không hiện được ở đó thì coi
> như tính năng chưa bàn giao.

⚠⚠ **LUẬT VÀNG CÓ HAI VẾ, VÀ VẾ THỨ HAI HAY BỊ QUÊN: DẶN "BẤM NÚT X" THÌ PHẢI TỰ KIỂM
LÀ BẢNG CÓ THẬT SỰ HIỆN X.** Khai `proof`/`extraSources` đúng là chưa đủ — còn phải chắc
rằng **thứ mình vừa sửa nằm trong tầm quét của phép đo**. Đã dính ngay trong ngày đặt luật
bậc chạy (2026-09-02): sửa 75 file `*.headanchor.json` (chỗ đặt + cỡ nón) rồi dặn *"bấm ★ 15
nền văn minh"* — mà `NewestInFolder` chỉ quét `*.png`, file neo đổi thì dấu thời gian thư mục
đứng im, bảng báo *"dự án đã dựng đủ, không có gì cũ"* và người dùng **không tìm ra nút nào
để bấm**. Lời dặn chỉ tồn tại trong chat, đúng thứ luật này cấm.
Chốt hai vế:
· `NewestInFolder` quét **`*.png` + `*.headanchor.json`** (file SIDECAR cũng là NGUỒN — nó
  quyết định cỡ và chỗ đặt bake vào asset). CỐ Ý không quét `*.*`: `.meta` bị Unity chạm
  liên tục, quét cả nó là mục vàng sáng suốt ngày.
· **Trước khi báo xong một việc có bước "bấm tool"**: mô phỏng phép đo (mtime nguồn mới nhất
  so với proof) và xác nhận mục đó SẼ VÀNG/ĐỎ. Không vàng được thì chưa bàn giao — sửa phép
  đo trước, dặn sau. Thêm loại file sidecar mới (`*.json` cạnh art) thì nối đuôi nó vào
  `NewestInFolder` NGAY trong lần sửa đó.

Đã dính đúng một lần: sửa bố cục cần ảo + vùng chết cần ảo trong `StickmanTouchControls.cs`
xong phải đi dặn miệng *"nhớ bấm tool vá scene"* — vì tool vá KHÔNG khai `proof`, nên bảng
không có gì để đo và câu nhắc đó chỉ tồn tại trong một khung chat.

**LUẬT KHI THÊM TÍNH NĂNG MỚI — ba dòng, đừng bỏ dòng nào:**

1. Tool nào SINH RA FILE thì khai `proof:` = đường dẫn file đó. Không khai `proof` thì tool
   chạy được nhưng **không bao giờ báo thiếu** — đúng cái vòng im lặng đang chữa.

   ⚠⚠ **`proof` PHẢI LÀ THỨ CHÍNH TOOL ĐÓ SINH RA — chứng trỏ nhầm file còn tệ hơn không có
   chứng.** Mục *"Gắn sprite theo CẤP vào prefab vũ khí"* từng khai `proof` là
   `Weapon_Sword.prefab` — file do **builder VŨ KHÍ** tạo, không phải tool này. Nên nó **xanh
   ngay từ lần dựng đầu tiên và xanh mãi mãi**, dù chưa chạy lần nào. Đo được: cả **48 prefab
   vũ khí có `_tierSprites: []`**, tức `WeaponBase.ApplyTierLook` lặng lẽ rơi về **NHUỘM MÀU**
   — đúng câu người dùng báo *"lên cấp mà chỉ đổi màu"*, trong khi bảng điều khiển không có
   một dòng nào báo, và cả 190 tấm art theo cấp (`Sprites/Weapons/Tier1..5`) nằm không.
   Cái chấm xanh khi ấy chỉ nói *"file kia tồn tại"*, không nói *"việc này đã chạy"*.
   Không có file kết quả tự nhiên nào thì **ghi một file chứng riêng** (khuôn
   `StickmanAnchorPivots.ProofPath` / `StickmanWeaponTierArt.ProofPath`).
   ⚠ Và ghi file chứng ở **CẢ HAI đường ra**, kể cả nhánh "còn cây thiếu art": tool ĐÃ chạy,
   phần gắn được đã gắn, cây thiếu thì đã réo tên trong Console. Chỉ ghi ở nhánh hoàn hảo thì
   một cây vũ khí mới chưa có art là cả mục **đỏ vĩnh viễn, bấm mãi không hết** — cái đỏ nói
   dối cũng tệ như cái xanh nói dối.
2. Nối 1 dòng vào đúng `Section` trong `StickmanToolbox`. Quên thì mục *TOOL CHƯA ĐƯA VÀO
   BẢNG* sẽ réo — đó là lưới bắt cuối, không phải chỗ để tool nằm luôn.
3. **Sửa xong mà người dùng phải bấm gì đó → khai luôn cho bảng biết**, rồi mới báo là xong.
   Ba trường hợp, ba cách khai:

   | Kiểu việc | Khai thế nào |
   |---|---|
   | Tool SINH file mới | `proof:` = file kết quả |
   | Bảng số nằm ở file KHÁC (script runtime) | thêm `extraSource:` = file đó |
   | Tool **VÁ HÀNG LOẠT FILE CÓ SẴN** (scene đã bake) | `proof` là **hàm trả danh sách** (`Func<string[]>`) quét lúc chạy — xem `StickmanTouchPatchTool.ProofScenes` |

⚠⚠ **LAMBDA LÀM MẤT FILE NGUỒN — `Job` DÙNG LAMBDA PHẢI KHAI `extraSources`.**

`StickmanReadiness.OwnerOf` **cố ý trả null cho lambda** (class ẩn `<>c` của trình biên dịch),
vì quy lambda về file bọc ngoài thì sửa dây chuyền một dòng là mọi việc đều báo "cần chạy lại".
Đúng, nhưng có mặt trái: **việc dùng lambda thì KHÔNG CÓ FILE NGUỒN NÀO ĐỂ SO** → mục
*◐ CÓ THỂ CẦN CHẠY LẠI* không bao giờ sáng cho việc đó.

Đã dính đúng ở việc NẶNG NHẤT của dây chuyền — *"Art · vũ khí · nhân vật · NPC · trang bị ·
âm thanh"* (`() => StickmanDemoBuilder.PrepareShared(...)`). Sửa bảng cỡ vũ khí trong
`StickmanWeaponBuilder.cs` xong, bảng điều khiển **vẫn im**; người dùng không có cách nào biết
mình đang nợ một lần bấm nút, và phải nghe dặn miệng trong chat — đúng cái mà LUẬT VÀNG cấm.

**Luật, ba dòng:**
1. `Job` mà `run` là **lambda** → BẮT BUỘC khai `extraSources` = các file `.cs` khai dữ liệu.
2. `Job` gọi thẳng một `static void Foo()` thì khỏi khai — nguồn tự suy ra từ delegate.
3. **Sửa bảng số trong file nào thì file đó phải nằm trong `proof`/`extraSources` của một mục
   nào đó.** Không thì việc "cần chạy lại" chỉ tồn tại trong đầu người vừa sửa.

⚠ Cách tự kiểm sau khi sửa bảng số: mở `★ Bảng điều khiển`, con số đỏ `⚠ N việc chưa chạy`
PHẢI nhúc nhích. Không nhúc nhích = chưa khai nguồn, và tính năng coi như chưa bàn giao.

⚠⚠ **HELPER DÙNG CHUNG CŨNG LÀ NGUỒN — `StickmanBuildPipeline.SceneSharedSources`.**
`StickmanReadiness` suy file nguồn từ `Run.Method.DeclaringType`, tức **chỉ nhìn file của
chính builder đó**. Nhưng gần như mọi builder scene đều gọi helper dùng chung của
`StickmanDemoBuilder` (`FinishSceneShared`, `SpawnNpcShared`, `AddCivilizationAssignerShared`…),
nên sửa MỘT helper ở đó là **40+ scene đang mang bố cục cũ** trong khi
`StickmanGenreSceneBuilder.cs` không hề đổi ngày ⇒ mục *◐ CÓ THỂ CẦN CHẠY LẠI* **không bao
giờ sáng** cho mấy scene đó. Đã dính đúng vậy khi gắn bộ lọc vũ khí theo thể loại vào
`AddCivilizationAssignerShared`: một dòng quyết định "màn trung cổ có ném bom được không",
mà không scene nào báo là cần dựng lại.
Nay `Job.ExtraSources` **tự kèm `SceneSharedSources`** cho mọi việc có `proof` là file
`.unity` — job scene mới cũng được hưởng, khỏi nhớ.
⚠ Giữ danh sách đó NGẮN: nhét file nào cũng vào là mọi scene vàng suốt ngày, mà **một cái
vàng lúc nào cũng sáng thì vô dụng ngang một cái không bao giờ sáng**.

⚠ **Tool vá scene: ĐỪNG khai đại MỘT scene làm đại diện.** `StickmanReadiness.Claimed` sẽ để
dây chuyền nuốt mất dòng đó ngay khi scene ấy cũng đang chờ dựng lại — người dùng dựng lại
đúng một scene rồi bảng im, trong khi 40 scene còn lại vẫn mang số cũ. Khai danh sách ĐỘNG =
"mọi scene đang có trên đĩa" thì scene nào cũ hơn file nguồn cũng réo được.

⚠ **Tool dùng dây chuyền mà nằm trong nút «chạy lại hết» thì `StickmanBuildPipeline.Run` phải
NỐI HÀNG, không được vứt mẻ thứ hai.** Nút đó gọi `Run` hai lần trong cùng một frame (một cho
tool lẻ, một cho các việc của dây chuyền); bản cũ thấy `_running` là log một dòng warning rồi
bỏ luôn — bấm một nút mà chỉ nửa số việc chạy. Vế chống bấm hai lần vẫn còn: việc TRÙNG TÊN
đang chờ thì không nối thêm.

Nguồn của mục VÀNG **suy ra từ chính delegate** (`Run.Method.DeclaringType` →
`Assets/Editor/<Tên>.cs`), KHÔNG khai tay — bảng khai tay thì thêm builder mới phải nhớ cập
nhật, mà quên là mất đúng cảnh báo này. Bảng số nằm ở file KHÁC (VD `AISmartsTable.DefaultLevels()`
trong script runtime) thì khai thêm qua `extraSource:`.

⚠ Job/Tool nào cũng đòi CÙNG một file kết quả thì chỉ cái ĐẦU hiện (`StickmanReadiness.Claimed`).
Bỏ khử trùng là một scene thiếu hiện hai dòng và bấm chạy hai lần.

⚠⚠ **«CHẠY LẠI HẾT» PHẢI CHẠY THEO THỨ TỰ PHỤ THUỘC, KHÔNG THEO THỨ TỰ HIỂN THỊ.**
`RunBatch` bản cũ đi đúng thứ tự mảng `Jobs` rồi mới tới Tool. Nghe hợp lý, nhưng trong mảng đó
việc *«★ 15 nền văn minh — art theo CẤP + asset»* nằm ở nhóm 3, tức **SAU cả chục scene thể
loại**. Bấm một nút thì **20 scene được dựng bằng bộ nền văn minh CŨ**, xong asset mới mới
sinh ra — mọi việc đều báo "chạy xong", vào game thấy y hệt lúc chưa bấm, **không lỗi nào báo**.

**BỐN BẬC** (`StickmanReadiness.RankArt/RankAsset/RankWire/RankScene`), và chuỗi đọc từ dưới lên:
scene BAKE asset, asset ĐO art.

| Bậc | Là gì | Nhận diện |
|---|---|---|
| 0 **ART** | tool sinh PNG | `proof` là `.png` hoặc nằm trong `Assets/Sprites/` |
| 1 **ASSET** | Job sinh prefab / ScriptableObject | Job có `proof` không phải `.unity` |
| 2 **GẮN** | tool đổ art vào asset đã có | tool còn lại |
| 3 **SCENE** | Job dựng scene | `proof` là `.unity` (`Job.BuildsScene`) |

⚠ **PHÉP SUY BẬC CHỈ LÀ LƯỚI ĐỠ — tool ghi vào thứ mà file chứng KHÔNG NÓI TỚI thì phải khai
`stage:` bằng tay.** Đã dính ngay: *«Chấm pivot nón + giáp»* ghi vào **`.meta` của từng tấm
PNG** nhưng file chứng là `Assets/Settings/AnchorPivots.txt` ⇒ bị suy thành bậc 2, tức chạy SAU
việc đo cỡ nón/giáp (`BuildAssets`) vốn đọc chính pivot ấy — **đo bằng pivot CŨ**. Nay nó khai
`stage: StickmanReadiness.RankArt`.

⚠ Trong một bậc thì giữ nguyên thứ tự cũ (`OrderBy` của LINQ là phép xếp ỔN ĐỊNH) — mảng `Jobs`
vốn đã xếp theo phụ thuộc trong từng nhóm, đừng phá.

⚠ **BẢNG PHẢI HIỆN ĐÚNG THỨ TỰ SẼ CHẠY.** `Missing()`/`Stale()` cùng đi qua `InRunOrder`. Hiện
một đằng chạy một nẻo thì người đọc bảng rút ra kết luận sai về cái đang xảy ra — mà bảng này
sinh ra chính là để nói thật.

⚠⚠ **VÀ KHỪU TRÙNG ĐÓ LÀM NGƯỜI DÙNG ĐI TÌM MỘT CÁI NÚT KHÔNG TỒN TẠI** (dính 2026-09-02). Thêm một `Tool` vào bảng điều khiển đòi `CivilizationLibrary.asset` — trong khi dây chuyền đã có sẵn một `Job` đòi đúng file ấy. Job được xét TRƯỚC, nên nút mới bị nuốt sạch khỏi khối *CÓ THỂ CẦN CHẠY LẠI*; người dùng báo *"không thấy tool"* rồi bấm nhầm Job kia — vốn chỉ chạy MỘT trong ba bước, nên art thay xong nhìn vào game vẫn y nguyên.
⚠ **ĐỪNG chữa bằng cách đặt file chứng KHÁC** — thành hai mục cùng đòi bấm, tệ hơn. Chữa bằng cách cho cả hai **gọi ĐÚNG MỘT HÀM**, và đặt hàm ấy trong CHÍNH builder (ở đây: `StickmanCivilizationBuilder.BuildAssetsWithTiers`). Đặt trong lớp `StickmanToolbox` thì còn hỏng thêm một vế nữa: `ScriptPathOf` đi tìm `Assets/Editor/StickmanToolbox.cs` — file KHÔNG TỒN TẠI (lớp đó nằm trong `StickmanToolCenter.cs`) ⇒ không suy được nguồn, phải khai tay `extraSources`, quên là mục không bao giờ vàng.

⚠ Đừng thêm TAB mới trừ khi thật sự là một loại việc khác — thêm tab là quay lại đúng cái
bệnh đang chữa.


### `dotnet build` không có `-t:Rebuild` có thể báo XANH trong khi code đang hỏng (2026-09-05)

Đợt thêm hệ thời tiết dính thật: **bốn lỗi** cùng lúc — `StickmanWorldSorting.WorldLayerId`
không tồn tại (CS0117) · `ps.noise.enabled = …` gán vào struct copy (CS1612) ·
`StructureKind.Farm = 10` trùng `Bunker = 10` khiến `switch` có hai nhánh cùng nhãn (CS0152) ·
`StructurePlan.FootprintMinX` là thuộc tính chỉ-đọc (CS0200). Bản build **tăng dần báo 0 lỗi
qua nhiều lượt liên tiếp**; chỉ `-t:Rebuild` mới lộ ra.

**Lệnh kiểm chuẩn từ gốc repo:**

```bash
python gen_csproj.py && dotnet build ScratchAll.csproj -nologo -v q -t:Rebuild
```

⚠ Đọc dòng tổng kết **`N Error(s)`**, đừng chỉ `grep error` — lọc nhầm chuỗi là bỏ sót cả bảng.
⚠ Bản build gộp này chỉ chứng minh **cú pháp và chữ ký**; ranh giới module vẫn phải kiểm bằng
Unity hoặc `Modules > Kiểm tra kiến trúc` (xem `Modules.md`).

## PHÉP ĐO AN TOÀN CÔNG TRÌNH LẮP GHÉP (2026-09-07)

`StickmanStructureSafety.Check` — một mục trong `StickmanDoctor`, đo MỌI `StructureKind` × 2 thời
kỳ × 12 hạt cho ba lỗi người dùng nêu (*"không bị kẹt, không bị rớt vô lý, không cản nhân vật vô lý"*):

| Lỗi | Đo bằng gì |
|---|---|
| **RỚT VÔ LÝ** | có `walkY` cao hơn `MaxSafeDrop` (4.5) mà `access`/`extraStairs`/`extraLadders` đều rỗng |
| **KẸT** | hai mảnh `PartCollision.Solid` chồng lấn > 0.25 theo CẢ HAI chiều — thân người lọt vào giữa là Box2D không đẩy ra được |
| **CẢN VÔ LÝ** | mảnh `Solid` chạm đất, cao > 0.6 (quá tầm bước), trên một công trình không có lối lên |

⚠ Đo trên **kế hoạch** (`StructureAssembler.Plan`), KHÔNG dựng GameObject. Kế hoạch đã biết đủ mọi
toạ độ mà không chạm scene, nên quét được cả trăm tổ hợp trong một nhịp, chạy được ở chế độ Edit,
và **không mở scene người dùng đang làm dở** (luật Doctor). Dựng thật thì mỗi tổ hợp là một cây
GameObject phải dọn, sót một cái là scene người dùng bẩn.

⚠ KHÔNG thay `MapBuildRules`: bên kia đo scene ĐÃ DỰNG (vật lý thật, đồ đặt tay), bên này đo BẢN
THIẾT KẾ — bắt lỗi trước khi nó kịp vào scene nào. Một lỗi trong văn phạm nhân lên thành hàng chục
cái bẫy vì công trình được rải khắp mọi map.

Báo cáo gom MỘT dòng cho mỗi loại × thời kỳ, kèm số hạt dính và một ví dụ — bảng Doctor dài quá
thì người ta thôi đọc, và đó là cách nhanh nhất để một phép đo tốt thành vô dụng.

### Nhóm phép đo «CÓ AI GẮN KHÔNG» — `StickmanDoctor.Wiring.cs` (2026-09-09)

Đợt rà toàn dự án (xem [Audit-2026-09-09.md](../KnowledgeBase/Audit-2026-09-09.md)) cho một kết
luận đáng nhớ hơn mọi lỗi lẻ: **lớp lỗi đắt nhất là thứ biên dịch xanh, Doctor xanh, và không ai
gọi**. Bốn phép đo hỏi đúng câu ấy ở bốn tầng:

| Phép đo | Đỏ/vàng khi | Cách khai nợ có chủ ý |
|---|---|---|
| Class runtime: có ai gắn không | không .cs nào nhắc tên, không .prefab/.unity/.asset nào chứa (GUID script hoặc `m_EditorClassIdentifier`) | `KnownUnwired[tên] = lý do` trong file phép đo |
| Giá trị enum: có ai dùng không | giá trị của 14 enum then chốt không xuất hiện dạng `Enum.Value` ở đâu | bỏ giá trị, hoặc nối tính năng |
| Kiểu nhiệm vụ: kho map có màn không | ĐỎ khi `MissionType` không có map nào; VÀNG khi thiếu ở một thể loại | dựng map bằng «Xưởng map» |
| Update: có tra component mỗi khung không | `GetComponent`/`FindObjectsByType`/`new List` trong `Update` không có nhịp, không phải cắm-sau `if (_x == null)` | `// per-frame-ok: <vì sao>` ngay trong thân Update |

⚠ **SO TOẠ ĐỘ TRƯỚC, HỎI COMPONENT SAU.** Vòng lặp qua `TeamMember.All` mà gọi `GetComponent`
cho từng người rồi mới so vị trí là nhân chi phí với số quân × số khung để rồi 99 % `continue`.
Đảo thứ tự (so x, `continue`, rồi mới hỏi) giữ nguyên ngữ nghĩa và **không cần cache** — cache là
dính bẫy hỏi-một-lần với thứ được gắn sau như `IPinnedInPlace` (xem `MapWrapZone`).

⚠ Mẫu bắt `??`/`?.` trên đối tượng Unity đã mở rộng thêm `FindAnyObjectByType` · `transform.Find`
· `FindNearestEnemy`. Trước 2026-09-09 nó chỉ biết `GetComponent`/`FindObjectOfType` nên 5 chỗ
lọt lưới suốt.

### ⚠⚠ SỬA THUẬT TOÁN THÌ PHẢI SO VỚI LẦN TRƯỚC — `Docs/Tools/AlgorithmLoop.ps1` (2026-09-13)

User: *"mỗi lần sửa thuật toán là dựng lại tất cả scene default đang có để biết có sửa được hay chưa"*.

Ba mảnh đã có sẵn và đều chạy tốt — nút dựng lại scene (`StickmanSceneRebuildBatch`), thước đo bộ
map và thước đo scene đã bake (`StickmanMapSmokeTest`). Nhưng cả ba chỉ in ra **trạng thái hiện
tại** (*"139 map phạm"*), trong khi câu người vừa sửa thuật toán cần là câu **so sánh**: *"trước
319, giờ 139, và KHÔNG đẻ thêm cái nào"*. Thiếu vế cuối thì một thay đổi vá 200 chỗ + làm hỏng 5
chỗ khác vẫn đọc ra "tốt hơn nhiều", và 5 chỗ ấy đi thẳng vào bản build.

```powershell
powershell -File Docs/Tools/AlgorithmLoop.ps1                      # cả kho: dựng lại + đo + so
powershell -File Docs/Tools/AlgorithmLoop.ps1 -NoRebuild -Filter Med_   # vòng lặp nhanh khi đang sửa
powershell -File Docs/Tools/AlgorithmLoop.ps1 -Play                # thêm AI đi thử (kẹt · rơi)
```

Bốn bước: cất mốc → dựng lại mọi scene default → đo lại → **so**. In ra ba con số
**ĐÃ SỬA ĐƯỢC · CÒN LẠI · ĐẺ THÊM**, và chỉ `ĐẺ THÊM > 0` mới trả mã khác 0 (kèm tên đúng map/scene
và LOẠI lỗi mới). `-NoRebuild` khi thuật toán sửa nằm ở RUNTIME (AI, va chạm, đồ thị làn) nên scene
trên đĩa không đổi — nhanh hơn nhiều.

**Bốn cái bẫy đã cắn thật khi dựng script này, ghi lại để đừng viết lại sai:**

| Bẫy | Vì sao chết | Cách chữa |
|---|---|---|
| **Khoá so là CẢ CÂU** | câu có toạ độ, id nút, seed — đổi một hằng số là cả trăm dòng "khác" dù vẫn đúng một bệnh | khoá = `(map/scene, LOẠI lỗi)`, cắt ở `:` `(` `'` đầu tiên — cùng cách `KindOf` của smoke gom nhóm |
| **`Start-Process -Wait`** | nó đợi cả CÂY tiến trình; Unity đẻ `AssetImportWorker` sống dai hơn editor ⇒ **treo vô hạn** dù mẻ xong từ lâu (đo: editor thoát 07:22, script vẫn đứng sau 10 phút). PID mà `-PassThru` trả về cũng có thể là tiến trình MỒI | đợi bằng cách đếm `Unity.exe` có **đường dẫn `-logFile` CỦA MÌNH** trên dòng lệnh — mỗi bước một log riêng nên không bắt nhầm mẻ của phiên khác |
| **Mốc và lượt đo KHÁC PHẠM VI** | mốc `-Filter Med_` (29 map) so với lượt `-Filter Med_Siege` (1 map) ⇒ 28 map kia "biến mất" ⇒ báo **đã sửa được 11** trong khi không ai sửa gì | dán nhãn phạm vi **lúc đo**, cạnh chính báo cáo, rồi để nhãn đi theo báo cáo; khác phạm vi thì **từ chối so** |
| **Đóng dấu nhãn bằng tham số của lần gõ hiện tại** | báo cáo đang nằm đó là của LƯỢT TRƯỚC — đóng dấu bằng `$Filter` hiện tại là nói dối về chính nó (đúng lỗi ở dòng trên, phiên bản tinh vi hơn) | nhãn sinh ra ở bước ĐO (`Set-ScopeStamp`), `Save-Snapshot` chỉ **chép** nhãn theo |

### Bản clone chạy ngầm — `_Batch/` TRONG repo

`Docs/Tools/BatchClone.ps1` dựng một project THỨ HAI tại `_Batch/` (gốc repo, đã `.gitignore`):
`Library`/`Temp` riêng, còn `Assets`/`Packages`/`ProjectSettings` là **junction** trỏ về bản
thật. Nhờ vậy chạy được `-batchmode -executeMethod` trong khi người dùng vẫn mở Editor.

⚠⚠ **ĐỂ TRONG REPO, ĐỪNG ĐẺ THƯ MỤC CLONE BÊN NGOÀI** (2026-09-15, user: *"đừng tạo mấy cái
_XoiBatch bên ngoài, tạo trong dự án này luôn đi"*). Trước đó có ba thư mục `..\_XoiBatch`,
`..\_XoiBatch2`, `..\_XoiBatchHelm` — mỗi cái ~11 GB nằm cạnh repo, không `.gitignore` nào
nhắc tới, và dọn repo thì chúng ở lại. `_Batch/` ngang hàng `Assets/` nên Unity KHÔNG import nó.

⚠⚠ **MỘT LƯỢT BATCH TREO LÀ MỌI LƯỢT SAU CHẾT CÂM.** Tiến trình cũ để lại `ArtifactDB-lock`,
`SourceAssetDB-lock`, `EditorInstance.json` trong `Library`; lượt sau dừng ngay ở dòng
*"Successfully changed project path"*, log 55 dòng, mã thoát 1, **không một chữ nào nói vì sao**.
Script tự tắt tiến trình còn ôm `_Batch` và xoá ba file đó trước mỗi lần chạy.

```powershell
./Docs/Tools/BatchClone.ps1                                              # dựng / làm mới
./Docs/Tools/BatchClone.ps1 -Run StickmanCinematicBuilder.RebuildLibraryBatch
./Docs/Tools/BatchClone.ps1 -Refresh                                     # chép lại Library
```

⚠ Script chạy trên **bản clone** (`-Clone`, mặc định `_Batch/` NGAY TRONG repo — dựng bằng `Docs/Tools/BatchClone.ps1`, đã `.gitignore`): chỉ copy `Library`, còn
`Assets` · `Packages` · `ProjectSettings` là junction trỏ về repo thật — nên nó đo ĐÚNG code vừa
sửa mà không phải đóng Unity đang mở. Lần đầu tốn ~2 phút copy, lần sau dùng lại.

⚠ Cây mã không biên dịch được thì script **dừng và nói rõ**, không im lặng đo trên bản cũ. Lỗi ở
file mình KHÔNG sửa = phiên khác đang sửa dở; đợi rồi chạy lại.

## MẺ DỰNG CHẠY TIẾP SAU DOMAIN RELOAD — và giá thật của một dòng `Refresh` (2026-09-13)

User: *"mỗi lần chạy tool lại khá lâu và phải bấm reload scene, mới chạy tiếp"*. Hai triệu
chứng, đo bằng `Logs/Editor.log` (dòng `Asset Pipeline Refresh (id=…): Total: N seconds`):

| Việc | Số lần trong một phiên | Tổng | Mỗi lượt |
|---|---|---|---|
| `AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport)` | 6 | 69 s | **11.5 s** |
| `AssetDatabase.Refresh()` | 43 | 0.6 s | 0.014 s |
| Kết thúc một lô import (mỗi `SaveAndReimport`/`ImportAsset` lẻ) | 1410 | 67 s | 0.047 s |
| Refresh mang cờ `ForceDomainReload` | 1 | 23.5 s | 23.5 s |
| `Flush()` giữa hai việc (`UnloadUnusedAssetsImmediate` + `GC`) | 51 | **1.5 s** | 30 ms |

**Luật rút ra:**

1. **`Refresh(ForceSynchronousImport)` quét CẢ dự án** — đắt hơn `Refresh()` thường **800 lần**
   trong repo này. Chỉ dùng khi thật sự cần mọi thứ trên đĩa; ghi xong N file rồi đọc lại
   chính N file đó thì dùng `AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport)`
   cho từng đường dẫn (đã có sẵn ở `StickmanMapSystemBuilder`, `StickmanGroundPlaneBuilder`).
   Refresh đứng CUỐI hàm mà sau nó không ai đọc asset nữa thì bỏ cờ đi.
2. **ĐỪNG chữa bằng `AssetDatabase.StartAssetEditing`.** Depth của nó là trạng thái NATIVE,
   sống tới khi đóng Editor: một exception lọt ra giữa Start và Stop là kẹt cả phiên, mọi lượt
   ghi `.meta` hỏng, chỉ khởi động lại Unity mới thoát. Luật đã ghi ở `StickmanArtSource.cs`.
3. **`Flush()` vô tội** — đừng tối ưu nó, nó giữ bộ nhớ khỏi leo thang và chỉ tốn 1.5 s/phiên.

**Mẻ dựng sống qua domain reload** (`StickmanBuildPipeline.Resume.cs`): hàng đợi nằm trong
biến `static` + `EditorApplication.update`, nên mọi lượt Unity nạp lại assembly đều **xoá sạch
nó** — kể cả khi lý do là một phiên AI song song vừa sửa một file `.cs`. Bản cũ chỉ *cảnh báo*
rồi bắt bấm lại nút. Nay: `SaveResumePoint()` ghi TIÊU ĐỀ phần việc còn lại vào `SessionState`
sau mỗi việc, `ResumeIfCutOff()` (`[InitializeOnLoadMethod]` + `EditorApplication.delayCall`)
tra ngược tiêu đề qua `Jobs` → `StickmanToolbox.Sections` rồi tự xếp lại hàng.

- ⚠ Chỉ lưu **tiêu đề**, không lưu delegate. Việc lẻ do một mẻ khác tự dựng (VD job phụ mà
  `StickmanMapRebuildBatch` chèn thêm) không nằm trong hai bảng khai ⇒ tra không ra: mẻ **kể
  tên chúng ra Console**, không nuốt. Thêm một việc lẻ kiểu đó thì nhớ khai vào một trong hai bảng.
- ⚠⚠ Van `MaxAttempts = 3`: việc đang chạy dở lúc reload chưa kịp `_index++` nên nó chạy lại —
  đúng, vì builder ở đây idempotent. Nhưng nếu CHÍNH việc đó gây reload thì mẻ quay vòng mãi.
  Quá 3 lần thì BỎ nó, réo tên, chạy tiếp phần sau.
- Vào Play Mode thì `ClearResumePoint()` — vào Play cũng là một lượt domain reload, mà ở đó
  người dùng CỐ Ý bỏ mẻ.
- Cuối mẻ in **tổng giây + 5 việc chậm nhất** (`ReportTimes`). Số cũng ở `SessionState` nên mẻ
  bị cắt rồi chạy tiếp vẫn cộng đủ hai nửa. Tối ưu tiếp thì đọc con số đó, đừng đoán.

### Hộp thoại NATIVE của Unity chặn mẻ — chữa bằng cách dọn chỗ, không chặn được (2026-09-14)

User: *"bấm chạy hết tất cả tool thì nó tự bấm reload, tự đồng ý hết, không cần hỏi tôi"*. Hộp
đang chặn là **của Unity, không phải của dự án**:

> *The open scene(s) have been modified externally — The following open scene(s) have been
> changed on disk: `Assets/_Scenes/Demo_72_Cinematic.unity`. Do you want to reload the scene(s)?*

Unity dựng nó ở tầng C++ mỗi khi một `.unity` **đang mở** bị đổi trên đĩa. `StickmanBatch.Ask`
chỉ bọc được `EditorUtility.DisplayDialog` của mình nên **không với tới**, và không có API công
khai nào tắt nó. ⇒ Chữa ở vế còn lại: `PrepareWorkspace()` (gọi từ `Tick`, trước việc đầu tiên)
lưu scene đang mở, nhớ đường dẫn vào `SessionState`, mở một scene RỖNG; `RestoreWorkspace()` ở
`Finish` mở lại đúng scene đó — cho cả đường xong lẫn đường bị huỷ.

- Chỉ dọn khi **đáng**: scene đang mở phải nằm trong `Assets/_Scenes` (chỗ duy nhất builder ghi),
  VÀ mẻ có mùi ghi scene (>1 việc, hoặc có việc khai file chứng `.unity`). Bấm lẻ một nút sinh
  art thì scene người dùng đang mở được để yên.
- **LƯU trước khi đóng**: `EditorSceneManager.NewScene` bỏ thay đổi chưa lưu mà không hỏi một tiếng.
- Đặt ở `Tick` chứ không ở `Run`: `Run` được bấm từ `OnGUI`, mở/đóng scene giữa một sự kiện GUI là vỡ.

**Đã soát phần còn lại (2026-09-14)** — mẻ không còn hộp thoại nào chặn: chỉ 7 chỗ gọi thẳng
`EditorUtility.DisplayDialog` ngoài `StickmanBatch`, và không chỗ nào nằm trên đường chạy hàng
loạt (4 chỗ trong EditorWindow tương tác, `StickmanRebuildAllBatch` + `StickmanWeaponAlphaCleanup`
đều khai `destructive: true` nên `StickmanReadiness.RunBatch` đã loại). Vế **tự từ chối câu hỏi
có mùi mất dữ liệu** (`StickmanBatch.Risky`) vẫn giữ nguyên — đếm trong `Logs/Editor.log` và
`Editor-prev.log`: nó **chưa lần nào** phải từ chối, tức nó không chặn việc gì, chỉ đứng đó phòng thân.

⚠⚠ **DỌN MỘT LẦN LÀ KHÔNG ĐỦ** (user 2026-09-14: *"vẫn có lúc nó kêu reload scene"*). Vài job
tự duyệt scene — `StickmanMapArtMigration.ReplaceBakedMapsWithArtV2` và
`StickmanWiringArt.RewireBakedScenes` mở từng `.unity` bằng `OpenScene`, sửa, `SaveScene`, rồi
trong `finally` chỉ mở lại scene ban đầu **nếu nó có path**. Ta vừa để lại một scene RỖNG (không
path) nên vế đó không chạy ⇒ **scene cuối cùng của vòng lặp ở lại trên màn hình**, và job kế ghi
đè đúng file đó ⇒ hộp thoại quay lại giữa mẻ. Nên `KeepWorkspaceClear()` chạy trước **mỗi** việc,
không chỉ việc đầu; quyết định "mẻ này có dọn không" thì chốt MỘT LẦN vào `SessionState`
(`GuardKey`) — hỏi lại mỗi vòng là sai, vì `LooksLikeSceneBatch` đếm việc CÒN LẠI và hàng đợi cạn
dần nên đến việc cuối nó trả false, đúng lúc vẫn cần dọn. Chỉ scene ĐẦU TIÊN (của người dùng)
được nhớ để mở lại; scene do job để lại thì đóng không nhớ.

⚠ Còn một đường KHÔNG chữa được từ đây: phiên khác (AI song song, batch Unity thứ hai) ghi `.unity`
trong lúc editor của bạn đang mở scene đó — hộp thoại vẫn hiện, vì nó không đi qua dây chuyền nào.

---

## ⚠⚠ MỘT VIỆC, HAI PHÉP ĐO — VÀ CHÚNG ĐÃ LỆCH NHAU (2026-09-16)

Bộ động tác được dựng bởi **hai đường**, và tới đợt này hai đường khai nguồn KHÁC NHAU:

| Đường | Khai nguồn |
|---|---|
| Nút «Dựng bộ ĐỘNG TÁC» (`StickmanToolCenter`) | 13 file, đầy đủ |
| Job phase-0 của dây chuyền (`PrepareShared` → `EnsureAllAssets` → `EnsureAll`) | **KHÔNG một file nào** |

Hậu quả: sửa một dáng xong thì nút trong bảng **VÀNG**, còn mẻ «DỰNG LẠI TẤT CẢ» coi việc đó
là xong và **bỏ qua**. Hai phép đo cho cùng một việc, không lỗi nào báo.

Nay danh sách nằm ở **`StickmanActionSetBuilder.SourceFiles`** — cả hai đường đọc chung
(`MergeSources` trong dây chuyền). Thêm một file phần thì sửa ĐÚNG MỘT chỗ.

⚠ Cùng lỗi ở tool «8 TÍNH CÁCH + học thuyết»: nó sinh CẢ hai `CommandDoctrine` nhưng chỉ khai
`AIProfile.cs` làm nguồn ⇒ thêm field học thuyết xong bảng vẫn XANH.

### ⚠⚠ DẤU THỜI GIAN KHÔNG ĐỦ CHO PREFAB

`StickmanFighter.prefab` bị **rất nhiều việc khác** ghi vào. Chỉ cần một lượt ghi không liên
quan là dòng «có thể cần chạy lại» XANH trở lại — trong khi component vẫn CHƯA được gắn.
Đo được ngay trong đợt này: prefab ghi lúc 19:40:09 (sau lần sửa builder 19:39:25) nên bảng báo
XANH, mà `StickmanStamina` **không có trên một prefab nào**.

Lưới «class không ai gắn» cũng không bắt được: builder có NHẮC TÊN component nên nó coi là đã
nối. Nên phải có phép đo **theo NỘI DUNG**: Doctor › «Component đi kèm bộ động tác CHƯA có trên
prefab» đọc GUID script trong YAML của `StickmanFighter` / `StickmanNPC`.

Đây đúng lỗi đã trả giá **2026-09-03** (prefab người chơi thiếu SÁT THƯƠNG RƠI, không gì báo) —
lần đó chữa bằng cách khai `proof`, mà `proof` theo mtime thì chữa chưa hết.

**Luật rút ra: thứ gì được BAKE VÀO một file mà nhiều việc khác cũng ghi vào thì phép đo phải
đọc NỘI DUNG, không đọc dấu thời gian.**
