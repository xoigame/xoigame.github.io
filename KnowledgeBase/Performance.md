# Đo lag / RAM khi Play trong Unity

## Cách chạy

1. Mở đúng scene bị lag. Chờ Unity biên dịch xong.
2. Bảng điều khiển (Ctrl+Alt+S) → Rig & Kiểm tra → **Đo FPS + RAM (30 giây)**.
   Có thể bấm trước Play để hẹn lần Play tiếp theo; tool không mở/đổi/lưu scene.
3. Play, giữ Game view ở trạng thái chơi bình thường, tái hiện lúc đông quân/giao tranh.
   Không bật Deep Profile trong phép đo đầu; không chạy builder/Doctor cùng lúc đo.
4. Đọc `Logs/StickmanPerformance.csv` (mỗi giây) và `.json` (đầu/cuối phiên).
   Pause/Stop kết thúc sớm. Nếu crash, CSV giữ các mẫu đã ghi; JSON có thể chỉ chứa snapshot đầu.
   Mỗi lần đo ghi đè báo cáo cũ: sao lưu trước khi đo lượt so sánh.
5. So sánh cùng scene, quân số, kích thước Game view và thời gian chơi. Đo thêm sau vài lần
   Play/Stop và đổi màn để tìm tăng trưởng lặp lại, không chỉ mức RAM cao ban đầu.

## Đọc số đúng nghĩa

- FPS = số frame Play / thời gian thực giữa hai mẫu, không phải thời gian riêng CPU/GPU.
- `managedBytes`: heap Mono đang dùng; `allocatedBytes` và `reservedBytes`: allocator Unity,
  **không phải** working set/private bytes của Windows và có chi phí Editor.
- `gcCollections`: bộ đếm GC gen 0 tích lũy, lấy chênh lệch giữa các mẫu.
- Snapshot object/weapon/rigidbody đếm cả object inactive trong scene; texture/material có cả
  asset Editor đang nạp. Texture lớn chưa tự chứng minh là leak.
- Snapshot chỉ quét ở đầu/cuối để không làm nhiễu vòng đo FPS mỗi giây. CSV có chi phí ghi đĩa nhỏ;
  không dùng số này thay Unity CPU/GPU Profiler khi cần xác định hàm đang nghẽn.
- Compile thành công không chứng minh hết crash/10 FPS. Cần tái hiện scene thật và log crash tương ứng.

## Những đường đã chặn trong code

- `StickmanAudio`: trần 96 tiếng cùng lúc; chỉ thu hồi một lần/frame; bỏ DontSave khỏi root/con.
- `EffectManager`: trần active theo `_maxSize` (mặc định 64/prefab), cache callback trả về pool.
- `TransientVfxPool`: trần 32/prefab, bỏ DontDestroyOnLoad và DontSave để dọn cùng scene.
- `FloatingMark`: trần 128 dấu; root có trách nhiệm hủy sprite/texture tự tạo khi thoát Play.
- `HitStop`: bỏ DontSave để runner không tích lại qua các lượt Play; giữ nguyên nhịp khựng.
- Khi chạm trần, bỏ bớt âm thanh/hình mới; không đổi đường tính sát thương hay đạn.
- `WaterSurface`: hai LineRenderer dùng chung material tự tạo, hủy material trong OnDestroy.
- `PhysicsQuery` (2026-09-08): thay `Physics2D.RaycastAll`/`OverlapCircleAll` ở 6 chỗ chạy MỖI FRAME hoặc MỖI PHÁT ĐẠN
  (`GunfireRaycast` — mọi viên hitscan; `DroppedItem` ×2; `WaypointMover`; `MagicWeapon` hồi máu; `Aircraft`; `Parachute`)
  bằng bộ đệm chung tự nới. Giữ đúng hành vi `RaycastAll` (tôn trọng `queriesHitTriggers`, xếp theo khoảng cách).
  ⚠ Không gọi lồng nhau trong vòng lặp đang đọc kết quả. Doctor «Tia dò CẤP PHÁT» quét text `Assets/Scripts` để chặn chỗ mới.
- Chưa đụng: **85** file `OnGUI` (đếm lại 2026-09-15; con số 52 cũ đã lỗi thời). Đo thân hàm:
  chỉ **3** file làm việc nặng (quét sổ / `GetComponent`) ngay trong `OnGUI` —
  `MapGroundLabHud`, `CampVehicleWorkshop`, `CampSiegeWorkshop`, cả ba là panel/debug chỉ
  hiện khi mở; 8/85 file có chặn theo `Event.current.type`. Nợ này NHỎ hơn tưởng.
  Sáu HUD người chơi nhìn thấy đã ghi nợ ở `UI.md`.
- `StickmanToolCenter`: ngừng quét asset/proof trong Play; vẫn có nút đo.
- Doctor kiểm trần active và cờ DontSave khi đang Play; chạy ngoài Play không kiểm được hai điều này.

Không cần rebuild art/prefab/scene cho các thay đổi runtime này.
`Holder.BuildWeaponList` vẫn dựng toàn bộ danh sách vũ khí cho mỗi nhân vật; chưa chuyển sang lazy
vì các hệ tier/appearance truy cập danh sách này. Dùng số weapon/character để đánh giá trước khi sửa.

Tham chiếu Unity: [DontSave và vòng đời object](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/HideFlags.DontSave.html),
[ObjectPool constructor](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/Pool.ObjectPool_1-ctor.html).

## Bài kiểm tra hồi quy native (không đo FPS)

`Assets/Editor/Doctor/StickmanPerformanceRegression.cs` cung cấp entry point
`StickmanPerformanceRegression.RunBatch`. Chỉ chạy khi **không có Editor khác mở dự án**:
Unity đúng phiên bản, `-batchmode -nographics -projectPath <repo> -executeMethod
StickmanPerformanceRegression.RunBatch -logFile <log>`; **không thêm `-quit`**, bài test tự thoát.

Bài test dùng scene rỗng trong bộ nhớ của process batch, không ghi scene asset. Tạo 512 yêu cầu
mỗi loại SFX/VFX, kiểm trần thực, kiểm Doctor nhận biết cờ DontSave, unload scene kiểm hủy VFX
và material nước, rồi Play/Stop hai lần kiểm không còn root pool/hit-stop và sprite/texture dấu nổi.
Audio không có thiết bị ở headless có thể kết thúc ngay; kiểm trần, không kiểm chất lượng tiếng.
Chỉ kết luận bài này pass khi log có `[Performance Regression] ALL PASS` và process trả mã 0.

## Đợt 2026-09-09 — CHỖ TỐN NHẤT DỰ ÁN: bảng chấm điểm mục tiêu của AI

Ba đợt trước đã dọn xong âm thanh, VFX, pool, và tia dò cấp phát. Đợt này đo bằng câu hỏi khác:
*"cái gì nhân theo SỐ QUÂN?"* — và tìm ra một chỗ đắt hơn tất cả những chỗ đã sửa cộng lại.

### Đo được (trước khi sửa)

`StickmanAgent.SelectBestEnemy` duyệt trọn `TeamMember.All`, và với **từng ứng viên** lại gọi
`CountAlliesTargeting`, `MaxAttackersOn` và `IsAttackingMyAlly` — cả ba cũng duyệt trọn
`TeamMember.All`, mỗi vòng kèm một `GetComponent<StickmanAgent>()`. Tổng cộng **tám** hàm trong
file ấy có khuôn *quét trọn sổ + `GetComponent` từng phần tử*.

| Đại lượng | Trước | Sau |
|---|---|---|
| Vòng NGOÀI của một lần chấm điểm | N (cả sân, kể cả công trình) | mật độ quanh mình (vài chục ô lưới) |
| `GetComponent<StickmanAgent>` trong vòng quét | 11 chỗ | **0** |
| Ước tính ở trận 100 quân, MỘT người MỘT nhịp quét | ~20 000 lượt `GetComponent` | vài trăm lượt tra Dictionary |

Chi phí này nhân theo SỐ AGENT, nên nó là N³ trên cả sân. Không có triệu chứng nào ngoài FPS:
biên dịch xanh, Doctor xanh, và "đông quân thì chậm" nghe như một sự thật hiển nhiên.

### Đã sửa

- **`Assets/Scripts/AI/Agent/StickmanAgent.Roster.cs` (file mới)** — sổ tra `TeamMember → StickmanAgent`
  và ba bộ đệm quét lưới. `StickmanAgent.AgentOf(member)` thay cho `GetComponent` ở **11 chỗ**.
  ⚠⚠ Ghi sổ ở `Awake`/`OnDestroy` **chứ không** `OnEnable`/`OnDisable`: `GetComponent` trả về
  component kể cả khi nó đang TẮT, mà dự án có ~10 chỗ tắt agent bằng tay (`Hostage`,
  `Parachute`, `FantasyAirRaider`, `DuelLabHud`, khinh khí cầu). Ghi theo `OnEnable` là bỏ
  những người ấy khỏi phép đếm chia mục tiêu ⇒ **đổi hành vi AI trong im lặng**.
- **`SelectBestEnemy`** — vòng ngoài hỏi `TeamMember.QueryNear` thay vì duyệt sổ.
  ⚠ Bán kính là `range + |origin.x − transform.position.x|`: phép lọc ngay dưới đo từ `origin`
  (sân ngang) hoặc từ `transform.position` (sân mặt đất), mà vệ sĩ quét quanh NGƯỜI MÌNH BẢO VỆ
  nên hai tâm ấy khác nhau. Cộng đúng khoảng lệch thì lưới trả **tập cha** ⇒ không mất một ai.
- **`IsAttackingMyAlly`** — `QueryNearWrapped` theo `Profile.assistRadius`. Phải là bản THEO VÒNG
  vì phép lọc đo bằng `MapWrap.Distance`.
- **`SurroundRank`** — `QueryNearWrapped` quanh MỤC TIÊU, bán kính `mine + 0.01`. Chỉ đồng đội
  gần mục tiêu hơn mình mới cộng được một hạng, nên ai xa hơn không bao giờ đổi kết quả; khoảng
  đệm giữ nguyên ca `Mathf.Approximately` (bằng nhau thì so `EntityId`).
  Gọi từ `ShouldWaitTurn` — tức MỖI KHUNG HÌNH cho mọi người đang giao chiến.
- **`MapFallGuard.Update`** — đảo thứ tự: so độ cao trước, `GetComponent` sau (cùng bẫy đã sửa
  ở `MapWrapZone` đợt trước). Hai phép lọc đều là VÀ nên không đổi ai được cứu.

**Tập kết quả bất biến.** Mọi thay đổi trên đều là *thu hẹp về một tập cha đã chứng minh*, hoặc
*đổi cách lấy cùng một tham chiếu*. Không có phép tối ưu "gần đúng" nào — nếu có thì AI đã đổi
hành vi, và đó là thứ không đo được bằng FPS.

### Còn nợ, đã ghi lý do

`CountAlliesTargeting` đếm đồng đội nhắm cùng mục tiêu ở **bất kỳ đâu** nên không có bán kính
nào để thu hẹp; nay nó chỉ còn bị gọi (mật độ × 1) lần thay vì (N × 1). Muốn O(1) thì phải nuôi
một sổ đếm ngay tại chỗ gán `StickmanAgent.Target` — đó là ĐỔI NGHĨA một ô trên FILE TRỤC
(279 file dùng), phải đo bằng `BlastRadius.py` và bàn với người trước khi làm.

13 chỗ «quét sổ lồng quét sổ» còn lại đều nằm trên **một đối tượng mỗi scene** (trọng tài, đạo
diễn, HUD) chứ không nhân theo số quân — N² hữu hạn, chỉ đáng sửa khi phép đo FPS chỉ đích danh.
Danh sách và lý do từng dòng nằm trong `KnownNestedScans` ở `StickmanDoctor.Perf.cs`.

### Hai phép đo canh chừng (`★ KHÁM SỨC KHOẺ DỰ ÁN`)

`Assets/Editor/Doctor/StickmanDoctor.Perf.cs` — đọc văn bản nguồn, không mở scene, không cần Play:

| Phép đo | Bẫy nó canh | Hiện tại |
|---|---|---|
| Quét TOÀN SỔ + `GetComponent` mỗi khung hình | vòng duyệt sổ nằm thẳng trong `Update`/`LateUpdate` | **0** |
| Quét TOÀN SỔ lồng trong vòng quét khác | N² mỗi lần gọi; nợ cũ khai ở `KnownNestedScans` kèm lý do | **0 mới** |

Lời khai `per-frame-ok:` **kèm lý do** trong thân vòng làm Doctor thôi réo — đó là chỗ ghi nợ
có lý do, không phải công tắc tắt cảnh báo. Khuôn đúng vẫn là *so toạ độ trước, hỏi component sau*.

Không cần rebuild art/prefab/scene cho các thay đổi này.

## Đợt 2026-09-15 — NỬA GPU: draw call, ~4 500 PNG không một SpriteAtlas nào

Bốn đợt trước đều dọn CPU/GC. Đợt này hỏi câu còn lại: *"GPU đổi texture bao nhiêu lần một
khung hình?"* — và câu trả lời là dự án có ~4 526 PNG mà `Assets` không có một `.spriteatlas*`
nào. Mỗi texture khác nhau là một lần break batch: thân stickman (cùng `stickman.png`) batch
thành một, nhưng nón + vũ khí + nhà + cây mỗi thứ một texture ⇒ vài trăm draw call một khung
hình. `m_SpritePackerMode: 4` (SpriteAtlas V2) bật sẵn từ đầu trong EditorSettings — chỉ
thiếu chính các atlas.

### Đã làm

- **`Assets/Editor/Art/StickmanAtlasBuilder.cs` (file mới)** — nút «★ Đóng gói Sprite Atlas
  (giảm draw call)» ở tab Rig & Kiểm tra, dựng ~60 atlas vào `Assets/Sprites/Atlases/`.
  Kế hoạch nhóm suy từ CÂY THƯ MỤC THẬT (`PlanGroups`), không có bảng civ gõ tay.
- **Luật nhóm — theo đơn vị CÙNG-XUẤT-HIỆN, không theo «loại»**: Unity nạp CẢ atlas khi một
  sprite trong đó được vẽ, nên «một atlas mọi nón» nghĩa là đội một chiếc nón Arab kéo 460
  tấm nón của 30 civ vào RAM. Nhóm đúng: mỗi CIV một atlas (trang phục `Civilizations/<X>` +
  nhà `Buildings/<X>` + lớp nón `HelmetLayers/Sprites_Civilizations_<X>_*`); vũ khí theo
  TIER (`Weapons/Tier<n>` + `Weapons/Variants/Tier<n>`); map theo HỌ (Structures,
  Environment, Building_Ground/Modern/Fantasy…, Props, Naval, Vehicles…).
- **Cấu hình**: FullRect (KHÔNG Tight — `CinematicOverlay` đọc `sprite.textureRect`, Tight
  làm nó ném exception) · không xoay (sprite uGUI quad vẽ ngược) · không mipmap · padding 4 ·
  trang 2048 (tấm lớn nhất: nhà 1774px) · sRGB + bilinear khớp cách import PNG hiện tại.
- **Loại trừ, có lý do**: `stickman.png` + file lẻ gốc `Assets/Sprites` (art rig, SpriteSkin
  bind theo chỉ số — luật Rig). Và **mọi thứ nằm trong một thư mục `Resources/`**
  (`Sprites/Resources/Generated` 4 file, `Assets/Resources/Fantasy/Races/Flat` 92 file):
  texture trong `Resources/` LUÔN được đóng vào build, nên atlas hoá nó là **ship hai bản** —
  vừa tốn dung lượng vừa tốn RAM, đúng ngược ý định. Muốn art phẳng chủng tộc vào atlas thì
  phải DỜI nó ra khỏi `Resources/` và đổi chỗ nạp sang tham chiếu trực tiếp trước — đó là
  việc riêng, phải đo.
- **Chống trùng**: thư mục packable là ĐỆ QUY nên `Weapons/` gốc và `Variants/` gốc chỉ khai
  FILE LẺ đích danh; các tier là atlas riêng. Một sprite hai atlas = Unity warning + phí RAM.
- **Hai phép đo mới** (`Assets/Editor/Doctor/StickmanDoctor.Atlas.cs`): «Họ sprite chưa vào
  atlas» (kể cả file lẻ mới thêm — so GUID trong `.spriteatlasv2`) và «Atlas sai cấu hình»
  (Tight/xoay/mipmap bật lại). Nút builder có `proofResolver` đòi ĐỦ mọi atlas theo kế
  hoạch, nên bảng điều khiển tự ĐỎ khi thêm civ/tier mà chưa chạy lại.

### Cách vận hành về sau

- PNG mới rơi vào thư mục đã packable (thêm nón cho civ có sẵn, thêm variant tier có sẵn):
  atlas TỰ NHẬN lúc pack, không cần bấm gì.
- Thêm CIV mới / TIER mới / FILE LẺ ở `Weapons/` gốc hay `HelmetLayers/`: bấm lại nút —
  builder ghi đè nguyên vẹn trên cùng đường dẫn nên GUID giữ nguyên, chạy lại luôn an toàn.
- Packing thật diễn ra lúc Play/Build (V2); lần Play đầu sau khi dựng atlas sẽ chậm hơn
  một nhịp import — bình thường.
- ⚠ Đo TRƯỚC/SAU bằng «Đo FPS + RAM (30 giây)» trên cùng scene đông quân; draw call xem ở
  Game view → Stats, Frame Debugger, hoặc «Đo draw call của scene (đếm texture)» (chạy được KHÔNG cần Play). Atlas đổi trần RAM texture theo NHÓM (nạp một
  sprite = nạp cả atlas của nhóm đó) — nếu RAM tăng bất thường thì nghi ngờ nhóm quá to,
  tách nhóm chứ đừng tắt atlas.

### Đo được sau khi đóng gói (100 scene, `StickmanDrawCallAudit`)

| | texture rời | sau atlas | giảm |
|---|---:|---:|---:|
| 100 scene cộng độc lập | 1 865 | 333 | **82 %** |
| `Genre_WWII_OperationBreakthrough` | 35 | 5 | 86 % |
| `Genre_Fantasy_CrystalGrove` | 36 | 17 | 53 % ← *xem dưới* |

⚠ Đây là **cận dưới** của số lần đổi texture, không phải draw call thật: thứ tự vẽ xen kẽ vẫn
cắt batch, và quân/map sinh LÚC CHẠY không nằm trong file scene. Dùng để SO TRƯỚC/SAU.

`CrystalGrove` lệch hẳn vì nó dùng 13 tấm art chủng tộc trong `Assets/Resources/Fantasy/Races/`
— thư mục bị atlas loại trừ CÓ CHỦ Ý (atlas hoá sprite trong `Resources/` là ship hai bản).
Đó là nợ đã biết, không phải lỗi.

### Cùng đợt: 22,7 MB art nguồn nằm nhầm trong `Resources/`

Đo phần "đứng ngoài atlas" dẫn thẳng tới một khoản lãng phí khác, không liên quan draw call:
bốn tấm art NGUỒN authoring (`FantasyRaceParts_v3_Source.png` 2560×4608 và ba tấm nữa) nằm
trong `Assets/Resources/Fantasy/Races/`. **Mọi thứ trong `Resources/` đi theo mọi bản build**,
kể cả thứ không ai nạp lúc chạy — mà ba tấm ấy chỉ có `FantasyRaceArtBuilder` (code EDITOR)
đọc, tấm thứ tư (`_v2_Source`) thì không còn ai nhắc tới.

Lần theo tiếp thì `RigRows/` (9 sheet art rig theo chủng, **11,2 MB**) cũng vậy: builder khai
nó là *"nguồn thật của bước art"*, không một tham chiếu runtime nào, 0 scene/prefab/asset dùng
GUID của chúng.

Đã dời tất cả sang `Assets/Art_Incoming/Fantasy/` kèm `.meta` (giữ GUID) và sửa bốn hằng đường
dẫn trong builder + một dòng `extraSources` ở bảng điều khiển. Tổng đưa ra khỏi build:
**22,7 MB**; `Resources/Fantasy/Races`: **43 MB → 21 MB**. Runtime KHÔNG đổi — đã kiểm
không có `Resources.LoadAll` nào ở thư mục gốc `Fantasy/Races`; mọi đường nạp đều trỏ thư mục
con (`Flat`, `Rank`) hoặc đúng tên bản đã xử lý. Doctor «Art NGUỒN nằm trong Resources/» canh
chỗ mới.

⚠ Khuôn đúng đã có sẵn trong dự án từ trước: `WorldWarTwoArtBuilder.IncomingFolder =
"Assets/Art_Incoming/WWII"`. Builder fantasy là ngoại lệ duy nhất, vì tài liệu của nó ghi
*"art nguồn luôn giữ cạnh bản đã xử lý"* — đúng về tổ chức file, nhưng trả giá bằng dung lượng
build khi "cạnh nhau" lại nằm trong `Resources/`.
