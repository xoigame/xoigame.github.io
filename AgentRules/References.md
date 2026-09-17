## Tài liệu nội bộ

- `Docs/ProjectMap/index.html` — **BẢN ĐỒ DỰ ÁN** (mở thẳng bằng trình duyệt, không cần build):
  sơ đồ tư duy 7 nhánh · cây phân cấp 10 module đọc từ asmdef thật · cây rig nhân vật ·
  24 hệ thống con tra được bằng ô tìm kiếm · **bảng số 5 cấp AI + 5 cấp vũ khí** ·
  kho 51 scene · dây chuyền dựng · **sổ bẫy im lặng**.
  Đây là chỗ nhìn thấy HÌNH DẠNG tổng thể; `AGENTS.md` vẫn là nguồn sự thật của LUẬT.
  ⚠ **LÀM XONG MỘT VIỆC LỚN THÌ CẬP NHẬT TRANG NÀY** — mục *Cách cập nhật* (cuối trang) ghi rõ
  sửa ở đâu. Tra theo TÊN MỤC, đừng theo số (số xê dịch khi thêm mục mới):
  thêm hệ thống → 1 thẻ ở *Hệ thống con* (nhớ `data-mod` + `data-tags` để lọc/tìm được) ·
  thêm scene → 1 dòng ở *Kho scene* · đổi asmdef → sửa sơ đồ ở *Cây phân cấp module* ·
  đổi bảng số cấp → *Cấp độ AI* / *Cấp độ vũ khí* ·
  **dính một lỗi hỏng-trong-im-lặng → 1 dòng ở *Sổ bẫy im lặng*** (ghi `AGENTS.md` trước,
  rồi tóm sang đây).
  Số liệu trên trang phải ĐO LẠI, đừng gõ tay — lệnh đếm nằm sẵn ở mục *Cách cập nhật*.
- `Docs/KnowledgeBase/Modules.md` — **module hoá + bàn giao sang dự án khác**: 10 assembly xếp
  tầng, lấy phần nào cho game mới, 5 hợp đồng đảo cạnh, 3 cái bẫy khi động vào cấu trúc.
  Đọc TRƯỚC khi thêm/dời file script hoặc khi gặp lỗi "type could not be found".
- `Docs/KnowledgeBase/CodeMap.md` — **bản đồ code**: 64 file script làm gì, ai gọi ai,
  sơ đồ phụ thuộc, 7 chỗ dễ sai khi sửa. Đọc TRƯỚC khi mở file lạ ra sửa.
- `Docs/KnowledgeBase/Animation.md` — **hệ animation 3 tầng** (tay/vũ khí · bước đi · động tác
  toàn thân): nhảy · ngồi · bò · leo · đu dây · trúng đòn · dáng thân khi ra đòn, mỗi loại
  nhiều style. Đọc TRƯỚC khi thêm động tác mới hoặc khi thấy nhân vật giật/kẹt tư thế.
- `Docs/KnowledgeBase/Tooling-RigRagdollAnimation.md` — **tool pipeline** (Tools > Stickman): dựng ragdoll, bake animation từ pose IK, swap skin
- `Docs/KnowledgeBase/Audio.md` — **âm thanh**: bộ SFX đã chọn, clip nào kêu ở đâu, tool import/gắn, còn gì trong gói chưa dùng
- `Docs/KnowledgeBase/GeminiAudioOrders.md` — **bộ prompt âm thanh**: prompt Gemini/Lyria/TTS, tên file, thư mục/key Unity, nhạc nền và tiếng Trường quay
- `Docs/KnowledgeBase/Ragdoll2D.md` — toàn bộ kiến thức ragdoll 2D
- `Docs/KnowledgeBase/Rigging2D-BonePlacement.md` — gắn xương thông minh (người/quái vật), map rig→ragdoll, bảng limit khớp + mass
- `Docs/KnowledgeBase/Anima2D-to-2DAnimation.md` — Anima2D vs 2D Animation package, migration
- `Docs/KnowledgeBase/ArtWorklist.md` — **DANH SÁCH ART CÒN THIẾU**, sinh bằng cách đọc
  file có thật trong `Sprites/Civilizations/` nên không bao giờ lỗi thời. Mỗi lô có prompt
  điền sẵn + lệnh `intake` đi kèm. Đọc trước khi đặt art, đừng tự kê danh sách tay.
- `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md` — **BỘ PROMPT sinh art bằng ChatGPT**:
  vũ khí · nón · giáp · khiên · vật cưỡi. Có sáu ràng buộc dán vào đầu mọi prompt, bảng khổ
  ảnh đã tính theo `WeaponHeightRatio` cho 30 cây, bốn luật vẽ nón (vành · diềm gáy · vòm
  ≥96 px · hẹp hơn vành), luật tỉ lệ 0.80 của giáp, luật THANG XÁM của vật cưỡi, bảng mô tả
  15 nền văn minh, và bảng "thả file vào đâu, bấm nút nào". Đọc TRƯỚC khi định tự vẽ art
  bằng code cho một thứ cần ĐẸP.
- `Docs/KnowledgeBase/WeaponHolding-Reference.md` — **cách cầm từng loại vũ khí** (tham khảo
  Stick War + tài liệu animation combat): đối trọng chéo, dáng kẹp nách của giáo, neo tay cung
- `Docs/KnowledgeBase/WeaponDesign.md` — **hệ thống hoá vũ khí**: 9 lớp `WeaponClass`, bảng chỉ số
  chuẩn, tính cách AI theo lớp, quy trình thêm vũ khí mới cho cân bằng
- `Docs/KnowledgeBase/WeaponSystem.md` — **hệ vũ khí đa loại** (cung/súng/kiếm/giáo/lao/búa/bom):
  kiến trúc, tool dựng 1 nút, cách chỉnh pose, cách thêm vũ khí mới
- `Docs/KnowledgeBase/Effects.md` — **hệ effect** (đánh / trúng / đỡ / chết / nổ): bảng
  `EffectLibrary` tra theo lớp vũ khí, pool, cách thay art thật
- `Docs/KnowledgeBase/AI-Architecture.md` — **TỔNG HỢP hệ AI**: bản đồ 6 tầng, 8 hợp đồng
  giữ module không dính nhau, bảng "muốn X → sửa đúng chỗ nào", debug playbook, bẫy đã dính.
  Đọc TRƯỚC khi sửa bất kỳ file nào trong `Assets/Scripts/AI/`.
- `Docs/KnowledgeBase/AI-NPC.md` — **hệ AI NPC** (FSM + Strategy): hành vi, tuning, bản đồ design pattern
- `Docs/KnowledgeBase/Genres.md` — **BA THỂ LOẠI** (Trung cổ / Hiện đại / Fantasy): luật
  module để thêm thể loại không phải sửa code cũ, nhánh vũ khí PHÉP + mana, `CasterCombatStrategy`,
  `MapTheme` xây map theo chủ đề, 9 bài test. Đọc TRƯỚC khi thêm thể loại hoặc vũ khí kiểu mới.
- `Docs/KnowledgeBase/Civilizations.md` — **13 nền văn minh trung cổ**: quy ước folder/tên sprite,
  bảng vũ khí từng nền, cách thêm nền mới. Đọc TRƯỚC khi thay art nón/giáp/khiên theo phe.
- `Docs/KnowledgeBase/Archetypes-Visual-Identity.md` — **làm nhân vật KHÁC BIỆT**: 9 archetype
  (màu + tóc/nón + động tác + loadout) cho mọi mode; 4 bộ ActionSet. Đọc TRƯỚC khi định
  "vẽ sprite mới cho từng loại lính" — sprite thân mới BẮT BUỘC rig tay, không sinh bằng code được.
- `Docs/KnowledgeBase/AI-GameModes-Roadmap.md` — **8 chế độ chơi (ĐÃ LÀM XONG)**: bảng
  class mới + AI nâng cấp gì cho từng mode. Thêm mode mới thì đọc file này TRƯỚC.
  Cũ: roadmap chế độ chơi để nâng AI: 8 chế độ
  xếp theo giá-trị/công-sức, mỗi cái ghi rõ AI học được gì mới + tái dùng gì. Muốn thêm mode
  mới thì đọc file này TRƯỚC, làm theo thứ tự đợt 1→3
- `Docs/KnowledgeBase/AI-Command.md` — **chỉ huy phân cấp** (Composite + Chain of command): cây n bậc, học thuyết đánh/thủ, kế nhiệm khi sĩ quan tử trận
- `Docs/KnowledgeBase/DuelCombat.md` — **nhịp đấu sĩ**: dò đòn · nhấp nhả · dội lại khi chém vào
  khiên · phản đòn; thứ tự trong `Tick`, số trên `AIProfile`, sân đo AI Lab bài 28. Đọc TRƯỚC
  khi sửa `MeleeCombatStrategy` hoặc thêm phản ứng theo đòn.
- `Docs/KnowledgeBase/LaneNav.md` — **ĐỒ THỊ LÀN**: nút = mặt đứng được, cạnh = cầu thang / thang /
  tụt sàn / cổng; AI hỏi bước kế tiếp, luật dựng map hỏi "có kẹt không". Đọc TRƯỚC khi sửa
  tầng vượt địa hình của `StickmanAgent` hoặc thêm loại lối đi mới.
- `Docs/KnowledgeBase/MapKit.md` — **map LẮP GHÉP từ lô đất** cho cả 7 kiểu chơi: lô bắt buộc
  theo kiểu chơi · lô lấp theo `Wishlist` · `MapAssembler` đặt mục tiêu vào đúng lô. Đọc TRƯỚC
  khi sửa địa hình map sinh hoặc thêm kiểu nhiệm vụ.
- `Docs/KnowledgeBase/StructureKit.md` — **công trình LẮP từ chi tiết nhỏ** (tháp · nhà · tường ·
  cổng): bảng chi tiết · văn phạm theo loại · pivot đáy-giữa · va chạm theo chi tiết · `Validate()`
  · tủ kính `Demo_40`. Đọc TRƯỚC khi thêm kiểu công trình hoặc chi tiết mới.
- `Docs/KnowledgeBase/FortKit.md` — **thành LẮP GHÉP** từ chi tiết rời theo seed: bảng chi
  tiết · trục `s` · 9 luật `Validate` · thứ tự nhượng bộ cho vừa chỗ · tool Xưởng/Tủ kính/Soi
  90 tổ hợp. Đọc TRƯỚC khi thêm kiểu tường/tháp/cổng hoặc sửa bố cục `Demo_26_Raid`.
- `Docs/KnowledgeBase/Fortifications.md` — **công sự**: vật cản phải phá mới qua · tường thành +
  cầu thang · tháp canh có cung thủ trấn thủ · thợ xây và SỬA. Đọc TRƯỚC khi thêm loại công
  trình hoặc khi thấy AI dí mặt vào tường.
- `Docs/KnowledgeBase/MapArtGeometryRules.md` — **hợp đồng art ↔ hình học**: pivot, baseline,
  footprint, tỉ lệ sàn tháp và các mối nối tường–thang–cổng. Đọc TRƯỚC khi vẽ hoặc thay art
  công trình map.
- `Docs/KnowledgeBase/NavalWarfare.md` — **thuỷ chiến**: thuyền là SÀN DI ĐỘNG có máu, áp mạn, tay lái/pháo cần người, biển là cái vực, hải tặc. Đọc TRƯỚC khi sửa `Assets/Scripts/Naval/` hoặc khi thấy người trên thuyền bị coi là đang rơi.
- `Docs/KnowledgeBase/EconomyCamp.md` — **mode kinh tế doanh trại** (`Demo_20_WarCamp`):
  vòng chơi vàng/củi, bốn công trình xây được và mỗi cái nối vào hệ nào, tổ canh nhà đi
  tuần, thẻ lệnh bấm trên đầu từng người, thứ tự tiêu tiền của tướng máy, bảng giá.
  Đọc TRƯỚC khi sửa `TeamEconomy` / `CampBuild*` / `CampHomeGuard`.
- `Docs/KnowledgeBase/MapSystem.md` — **hệ thống xây map + điều kiện thắng thua**: MapDefinition/
  MapRecipe/MapLibrary, 7 kiểu nhiệm vụ, luật thắng dạng danh sách vế, map random theo seed,
  bake map thành scene. Đọc TRƯỚC khi thêm màn chơi hoặc sửa luật thắng thua.
- `Docs/KnowledgeBase/StickmanCombat-AI.md` — pattern combat (cung/súng/cận chiến) + AI NPC (lý thuyết nền)
- `Docs/KnowledgeBase/AssetGeneration.md` — **sinh asset bằng code/AI**: pixel art (API
  `PixelCanvas`, ba luật vẽ nón, đo phần vẽ được), particle effect (tĩnh=sprite / động=hạt,
  bốn bẫy), âm thanh (tổng hợp WAV, cách ĐO cái không nghe được, luật gắn tiếng).
  Đọc TRƯỚC khi sửa bất kỳ `*ArtGenerator` nào, thêm hiệu ứng, hoặc làm tiếng mới.
- `.claude/skills/stickman-maps/` — **skill XÂY MAP theo gameplay**: bảng luật địa hình cho
  7 kiểu chơi, quy trình lưu/xoá map, và NHẬT KÝ SỬA LUẬT. User báo map sai thì sửa
  `MapBlueprint` + ghi một dòng vào nhật ký đó, ĐỪNG sửa tay từng asset.
- `.claude/skills/stickman-setup/` — checklist tạo nhân vật mới (viết cho Claude
  nhưng AI nào đọc cũng dùng được)
- `.claude/skills/stickman-assets/` — skill sinh asset (hình · hạt · tiếng) + hai script chạy
  được: `scripts/canvas.py` (bản mô phỏng `PixelCanvas` để xem art trước khi port sang C#)
  và `scripts/sfx.py` (tổng hợp + ĐO file WAV)

