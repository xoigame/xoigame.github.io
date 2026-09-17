# Performance — hiệu năng: đo trước, sửa đúng lớp chi phí (2026-09-15)

Luật cho mọi việc dính chữ «lag / giật / FPS / draw call / GC / RAM».
Quy trình đo và lịch sử từng đợt: `Docs/KnowledgeBase/Performance.md`. Skill: `stickman-perf`.

## PERF-1 · Đo trước khi sửa, so với lần đo trước

- Cửa đo duy nhất: Bảng điều khiển → Rig & Kiểm tra → **«Đo FPS + RAM (30 giây)»**
  (`Logs/StickmanPerformance.csv/.json`). Sửa xong đo lại CÙNG scene, CÙNG quân số —
  một lời khẳng định «đã nhanh hơn» phải kèm DIFF hai lần đo.
- «Đông quân thì chậm» không phải chẩn đoán. Câu hỏi đúng: *chi phí này nhân theo cái gì*
  (số quân? số khung hình? cả hai?) — lớp N×frame và N² mỗi nhịp mới là thứ giết FPS.

## PERF-2 · Năm lớp chi phí đã có chủ — sửa trong khuôn, đừng phát minh lại

| Lớp | Khuôn bắt buộc | Phép đo canh |
|---|---|---|
| GC mỗi frame/phát đạn | `PhysicsQuery` thay `RaycastAll`/`OverlapCircleAll`; pool có sẵn / `ObjectPool<T>` | Doctor «Tia dò CẤP PHÁT» |
| Quét sổ quân trong tick | so toạ độ TRƯỚC – `GetComponent` SAU; hỏi lưới `TeamMember.QueryNear`; `StickmanAgent.AgentOf` | Doctor «Quét TOÀN SỔ…» ×2 |
| Tìm object mỗi nhịp | sổ đăng ký tĩnh (`Fortification.All`, `CapturePoint.All`…) ghi ở `Awake`/`OnDestroy` | — (khuôn có sẵn khắp repo) |
| SFX/VFX bùng nổ | trần active của `StickmanAudio`/`EffectManager`/`TransientVfxPool`/`FloatingMark` | `StickmanPerformanceRegression.RunBatch` |
| **Draw call (GPU)** | SpriteAtlas theo ĐƠN VỊ CÙNG-XUẤT-HIỆN — xem PERF-3 | Doctor «Họ sprite chưa vào atlas» + «Atlas sai cấu hình» |

- Nợ có lý do ghi bằng `per-frame-ok:` trong thân vòng hoặc `KnownNestedScans`
  (`StickmanDoctor.Perf.cs`) — kèm LÝ DO ĐO ĐƯỢC, không phải công tắc tắt cảnh báo.

## PERF-3 · SpriteAtlas — luật nhóm và ba điều cấm

- **Nhóm theo đơn vị cùng-xuất-hiện, không theo «loại»**: Unity nạp CẢ atlas khi một sprite
  trong đó được vẽ. Mỗi nền văn minh một atlas (trang phục + nhà + lớp nón của đúng civ đó);
  vũ khí theo TIER; map theo HỌ thư mục. Kế hoạch suy từ cây thư mục thật
  (`StickmanAtlasBuilder.PlanGroups`) — thêm civ/tier là tự có atlas, không có bảng gõ tay.
- **Cấm 1 — art rig và thư mục `Resources/`**: `stickman.png` + file lẻ gốc `Assets/Sprites`
  bind theo SpriteSkin/chỉ số (luật Rig). Texture trong `Resources/` luôn được đóng vào build
  ⇒ atlas hoá là SHIP HAI BẢN (tốn cả dung lượng lẫn RAM); muốn atlas thì phải dời ra khỏi
  `Resources/` và đổi chỗ nạp trước.
- **Cấm 2 — Tight packing / xoay / mipmap**: Tight làm `sprite.textureRect` ném exception
  (`CinematicOverlay` đang đọc nó); xoay làm sprite trên uGUI quad vẽ ngược; mipmap phí RAM.
  Builder đặt FullRect · không xoay · không mipmap · padding 4; Doctor canh cấu hình trôi.
- **Cấm 3 — một sprite hai atlas**: thư mục packable là ĐỆ QUY. Thư mục con đã có atlas riêng
  (tier, civ) thì cha chỉ được khai FILE LẺ. Thêm file lẻ mới (Weapons/ gốc, HelmetLayers)
  thì bấm lại «★ Đóng gói Sprite Atlas»; PNG mới trong thư mục packable thì atlas tự nhận.
- Nút: Bảng điều khiển → Rig & Kiểm tra → **«★ Đóng gói Sprite Atlas (giảm draw call)»**
  (`Assets/Editor/Art/StickmanAtlasBuilder.cs`). Atlas ở `Assets/Sprites/Atlases/`.
- **Đo lại được:** «Đo draw call của scene (đếm texture)» (`StickmanDrawCallAudit`) đọc file
  `.unity` trên đĩa, đếm số texture khác nhau rồi quy ra số atlas — phép đo draw call DUY NHẤT
  chạy được khi không bật Play. Là **cận dưới** (sorting xen kẽ vẫn cắt batch; phần sinh lúc
  chạy không thấy): dùng để SO TRƯỚC/SAU, đừng tuyên bố số tuyệt đối.
  Đo 2026-09-15 trên 100 scene: **1 865 → 333** texture (−82%).

## PERF-4 · `Resources/` là thuế dung lượng build

- Mọi thứ trong một thư mục `Resources/` đi theo **mọi bản build**, kể cả thứ không một dòng
  code runtime nào nạp — và không phép đo nào khác nhìn ra, vì asset vẫn hợp lệ.
- **Art NGUỒN authoring không được nằm trong `Resources/`** — cả file đặt tên `*_Source.png`
  lẫn THƯ MỤC sheet nguồn (`RigRows`). Chỗ đúng là `Assets/Art_Incoming/<nhóm>/` (khuôn:
  `WorldWarTwoArtBuilder.IncomingFolder`); builder đọc theo hằng đường dẫn nên dời xong chỉ
  cần sửa hằng **và `extraSources` ở bảng điều khiển**. Dời PHẢI kèm `.meta` (giữ GUID).
  Đo 2026-09-15: **22,7 MB** (4 tấm `_Source` 11,5 MB + `RigRows` 11,2 MB) đóng vào mọi bản
  build cho đúng con số không; `Resources/Fantasy/Races` 43 MB → 21 MB.
- Doctor «Art NGUỒN / thư mục chỉ editor dùng nằm trong Resources/» bắt HAI dạng: file
  `*_Source.*`, và thư mục con của `Resources/` mà **tên nó xuất hiện trong code editor nhưng
  không hề xuất hiện trong `Assets/Scripts`**. ⚠ Đo bằng TÊN, không bằng "đường dẫn nào nạp
  tới": gần như mọi `Resources.Load` trong dự án nhận HẰNG/BIẾN, nên dò theo literal sẽ báo
  oan hàng loạt — mà phép đo hay báo oan thì người ta học cách bỏ qua, tệ ngang không có.
- Đây cũng là lý do atlas KHÔNG gộp sprite trong `Resources/`: atlas hoá chúng là ship hai bản.
  Muốn atlas thì dời ra khỏi `Resources/` và đổi chỗ nạp trước — `Resources.LoadAll` nạp theo
  THƯ MỤC nên việc đó là đổi cách nạp, phải đo.

## PERF-5 · Nợ đã biết, đừng mở lại thiếu số đo

- 85 file `OnGUI` (IMGUI vẽ lại mỗi sự kiện, không chỉ mỗi frame). **Đã đo 2026-09-15: chỉ
  3 file làm việc nặng (quét sổ / `GetComponent`) ngay trong `OnGUI`** —
  `MapGroundLabHud`, `CampVehicleWorkshop`, `CampSiegeWorkshop`, và cả ba là panel/debug
  chỉ hiện khi mở. Nợ này NHỎ hơn tài liệu cũ tưởng; chỉ sửa khi phép đo FPS chỉ đích danh.
  ⚠ Thêm `OnGUI` mới thì đừng quét sổ trong đó — `OnGUI` chạy nhiều lần mỗi khung hình.
- `CountAlliesTargeting` (O(N) không thu hẹp được): muốn O(1) là đổi nghĩa ô trên FILE TRỤC —
  đo bằng `BlastRadius.py` và bàn với người trước.
- Mọi tối ưu phải giữ TẬP KẾT QUẢ BẤT BIẾN (thu về tập cha đã chứng minh, hoặc đổi cách lấy
  cùng tham chiếu). Tối ưu «gần đúng» là đổi hành vi AI trong im lặng — cấm.
