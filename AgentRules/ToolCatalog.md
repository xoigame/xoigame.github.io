## Bảng tool (Tools > Stickman > **Nâng cao** > ...)

> Việc hằng ngày thì mở `★ Bảng điều khiển` (Ctrl+Alt+S) — bảng dưới đây là danh mục ĐẦY ĐỦ
> để tra, không phải đường đi thường dùng. **Mọi dòng trong bảng nằm dưới `Nâng cao/`**,
> trừ nhóm `Build > …` vẫn ở tầng ngoài.

| Menu | Việc |
|---|---|
| **★ Bảng điều khiển** (Ctrl+Alt+S) | **CỬA DUY NHẤT.** 7 tab xếp theo VIỆC MUỐN LÀM + ô tìm kiếm + chấm xanh/đỏ đo bằng file có thật. Tab *Bắt đầu* gợi ý đúng MỘT việc nên bấm tiếp; tab *Chơi thử* mở thẳng scene. Danh sách chuẩn nằm ở `StickmanToolbox.Sections` — tool sinh asset/scene vẫn phải nối 1 dòng có `proof`; mọi `[MenuItem("Tools/Stickman/…")]` mới chưa khai sẽ **tự hiện ngay trong tab đoán được** ở cụm `TỰ NHẬN`, không cần nhắc thêm. |
| **⟳ Mở LẠI bảng điều khiển (khi bấm không thấy gì)** | **ĐƯỜNG THOÁT KHI BẤM ★ MÀ KHÔNG CÓ GÌ XẢY RA** (2026-09-12). Triệu chứng: menu bấm được, `Open()` chạy đủ, KHÔNG exception nào, màn hình vẫn trống. Nguyên nhân: `UserSettings/Layouts/*.dwlt` lưu từ bố cục HAI cửa sổ chính; lượt mở sau Unity từ chối (log: *"Trying to create a second main window from layout when one already exists"*) nhưng cửa sổ bảng vẫn được giải tuần tự và vẫn CẮM trong container không bao giờ được dựng — `Show()`/`Focus()` chạy vào hư không, và gán `position` cho cửa sổ đang cắm thì Unity bỏ qua. Nút này đóng mọi bản đang sống rồi tạo cửa sổ RỜI giữa editor. ★ cũng tự gọi nó: sau `Focus()` một nhịp mà cửa sổ không cầm focus thì dựng lại + in số đo ra Console. ⚠ Đừng đoán "có thấy được không" bằng toạ độ — đã bắt nhầm cửa sổ hợp lệ; `hasFocus` mới là phép đo. Chữa gốc: `Window > Layouts > Default` |
| **★ Bảng điều khiển › tab «Tất cả tool (menu)»** | **GƯƠNG MENU (2026-09-09).** Liệt kê ĐỦ mọi mục `[MenuItem("Tools/Stickman/…")]` trong assembly (238 mục, so với 166 nút đã khai trên bảng), nhóm theo nhánh, mỗi mục một nút Chạy — chạy qua đúng dây chuyền như nút thường. Mục đã có nút riêng thì đánh dấu ●. Ô «Tìm» của bảng cũng tìm luôn trong danh sách này, nên không còn câu trả lời *"tool đó vẫn nằm trong menu Nâng cao"*. Không xoá menu gốc: `[MenuItem]` còn là đường gọi của phím tắt và của tool khác. Nguồn: `StickmanMenuMirror` |
| **Trường quay > 🎬 Trường quay (quay video)** (= Bảng điều khiển › tab 🎬 Trường quay) | VIDEO QUẢNG CÁO MXH: chọn kịch bản (`Resources/Cinematics/*.asset` — đại chiến · ám sát · công thành · đấu tướng · 3 thời kỳ), XEM THỬ hoặc QUAY: vào Play, AI tự diễn, camera tự chọn góc + kill-cam + slow-mo, Unity Recorder ghi 1080×1920 / 1920×1080 @ 60 fps vào `Recordings/`, hết phim tự thoát Play. Kèm nút **QUAY HẾT một mẻ** (hàng đợi nhiều phim, tự vào/ra Play từng cái) và **Soạn kịch bản TỰ ĐỘNG** (máy đọc kho nền văn minh + trang bị rồi tự viết video mới theo hạt giống). Có bong bóng THOẠI trên đầu nhân vật, tiếng phim (`Cine/*`, sinh bằng Âm thanh › «Sinh tiếng BÙ») và tắt sạch giao diện khi quay. Khối **🎲 Máy quay vô tận**: in KHO TỔ HỢP (cốt truyện × thời kỳ × cặp nền văn minh × nhịp dựng) rồi «⏺∞ SOẠN & QUAY N phim» — soạn N kịch bản mới, lưu asset, quay lần lượt. Kèm «1. Dựng trường quay» (chỉ scene `Demo_72_Cinematic` — **kho kịch bản để TRỐNG**, bảng mẫu tự mọc lại đã xoá 2026-09-15 theo yêu cầu *"xoá hết các samples đó đi tôi sẽ tạo chi tiết từng cái"*), «3. Soạn kịch bản NGẪU NHIÊN», «4. Dọn kịch bản tự động», «5. DỌN kho phim», «6/7. Soạn phim TRƯNG BÀY / CHIẾN TRƯỜNG». Luật: [Cinematic.md](Cinematic.md) |
| **Trường quay > 8. 📏 CHẠY THẬT + ĐO một phim (play mode)** | `StickmanCinematicProbe` — THƯỚC ĐO PHIM: dựng đúng bộ phim đó trong Play mode, lấy mẫu mỗi vòng `EditorApplication.update` rồi in bảng số (phim dài thật bao nhiêu · nhân vật chính trụ mấy giây · máy quay có lia không) ra Console + `ReportPath`. Lấp chỗ trống: trước đó mọi câu hỏi ấy đều trả lời bằng MÔ HÌNH (`CinematicAutoWriter.WholeVideoSeconds` cộng các nhịp, không biết `WaitUntil` chờ bao lâu) và mô hình sai thì **không dòng nào đỏ**. ⚠ Chỉ ĐỌC kịch bản — cố ý KHÔNG gọi `StickmanCinematicWindow.Launch` (nó chạy `AutoRepairForProfile`, tức SỬA asset trước khi đo). Batch: `-executeMethod StickmanCinematicProbe.RunBatch -cineProbeScript <tên> -cineProbeSeconds 180` (không kèm `-quit`; 0 = phim chạy hết, 1 = đụng trần giờ). Luật: [Cinematic.md](Cinematic.md) |
| **Art > ★ Đặt hàng ART — sinh prompt ChatGPT** (= Bảng điều khiển › Hình › «★ ĐẶT HÀNG ART») | **CỬA ĐẶT HÀNG HÌNH.** Sinh `Docs/ArtOrders/` — mỗi bộ một file: 31 nền văn minh (nón · giáp · khiên · skin vũ khí, kèm MÃ MÀU CỜ của nền), 7 nhóm vũ khí (cỡ tính từ `WeaponHeightRatio`), công trình · bối cảnh · thú · ngoại hình · đạn · thuyền · phù hiệu. Danh sách món đọc từ `WeaponArtGenerator.AllSpriteNames` + `CivilizationDefinition` + `StickmanArtSource.ExpectedArtProof` LÚC BẤM nên không bao giờ cũ, và mỗi đơn kèm sẵn lệnh `intake_*.py` để nhận art về. Ràng buộc chung nằm ở MỘT hằng số `StickmanArtPrompt.StyleBible` — đó là thứ làm mọi bộ hình ra cùng một kiểu. Không đặt `TierN/`·`Variants/` (tool tự sinh từ tấm gốc). Luật: [AssetGeneration.md](AssetGeneration.md) |
| **Appearance > 4. Dựng bộ NGOẠI HÌNH nhân vật (4 thời kỳ)** (= Bảng điều khiển › Nhân vật › «★ Ngoại hình nhân vật») | Vẽ bù 58 tấm `Sprites/Looks/` rồi dựng `Resources/Looks/LookSet_{Medieval,Modern,Fantasy,Wuxia}` + hồ sơ `Settings/Looks/`. Mọi scene tự khoác lúc nạp (`StickmanLookBootstrap`); chủng Fantasy theo hồ sơ thẻ. Bảng số: `StickmanLookBuilder.Specs`. Luật: [CharacterLook.md](CharacterLook.md) |
| Art > Ngoại hình — vẽ LẠI bộ tóc · áo · đuôi (code) (= Bảng điều khiển › Nhân vật › «Vẽ LẠI riêng bộ ngoại hình») | vẽ lại 58 tấm bộ ngoại hình (tấm nhãn codegen), không dựng set — lối tắt khi chỉ sửa `StickmanLookArt*`, thay vì chạy cả 9 generator của «★ Vẽ LẠI TOÀN BỘ art code». Xong nhớ dựng lại set ở dòng trên |
| **Art > 14. Soi cắt art sân 3/4 (đo, không sửa)** · **15. Sửa cắt art sân 3/4 (bỏ mảnh rời)** | `StickmanGroundArtSpriteRepairTool` — một lượt cắt sheet cũ để lại CÙNG một rect mẫu cho nhiều tấm `Sprites/Buildings/GroundArtV2`, nên Unity nạp cả canvas và dải rễ/cỏ của ô kế bên nổi lơ lửng trên bụi/rào/lau. Tool đo alpha thật từng PNG, lấy component lớn nhất làm vật chính, chỉ giữ mảnh nhỏ nằm sát nó. **Chỉ sửa SpriteRect/pivot, KHÔNG xoá pixel nguồn** — mảnh rời vẫn còn trong PNG. Nút 14 chỉ ĐO; chứng: `Logs/GroundArtSpriteRepairAudit.txt`. Bấm sau khi nhận art 3/4 mới |
| **Art > 16. Vẽ lại foreground do code (giữ art tay)** | `StickmanForegroundCodeArtTool` — cửa HẸP để vẽ lại riêng phần tiền cảnh do code sở hữu (cây/đá/bụi của `StickmanEnvironmentArt`, mặt tiền/lan can của `StickmanStructureArt`, panel gần của xe trong `StickmanBuildingArt`) rồi bake lại `StructurePartSet` để map runtime nhận đúng sprite cùng GUID. ⚠ KHÔNG đụng sáu tấm `Sprites/Environment/Foreground` (art tay, không nhãn codegen): mọi đường ghi vẫn qua `StickmanArtSource.CanCodeWrite`. Dùng khi chỉ cần sửa foreground mà không chạy cả mẻ art. Chứng: `Logs/ForegroundCodeArtAudit.txt` |
| **Appearance > 6. Bật hoặc TẮT bộ ngoại hình** (= Bảng điều khiển › Nhân vật › «Bật / TẮT bộ ngoại hình») | ĐƯỜNG LÙI một cú bấm khi art ngoại hình chưa ưng: đặt `disabled` trên 4 `LookSet` ⇒ `Load` trả null ⇒ sân về đúng như trước khi có hệ, hồ sơ + art còn nguyên. Bấm lại để bật |
| Appearance > 5. Nhận art TAY bộ ngoại hình | cài pivot/PPU/border theo hợp đồng cho PNG thả vào `Sprites/Looks/` + khoá nhãn `stickman:hand`. Chạy sẵn trong «★ Ngoại hình nhân vật»; đơn hàng ChatGPT: [LookArt-ChatGPT-Order.md](../KnowledgeBase/LookArt-ChatGPT-Order.md) |
| **Rig & Kiểm tra > ⚠ Vì sao còn VÀNG?** | **Cửa trả lời “bấm mà nó không tắt”.** In cho mọi dòng *CÓ THỂ CẦN CHẠY LẠI*: nguồn mới nhất · chứng cũ nhất · số file cũ hơn + KẾT LUẬN (chứng có ART · nguồn là asset sinh ra · nguồn vừa sửa · một file lẻ kéo cả dòng), kèm bảng “file nào bị import lại nhiều nhất” đọc từ `Logs/Editor.log`. Chỉ ĐO. ⚠ Từ 2026-09-09, dòng vàng của tool idempotent tự tắt sau khi chạy nhờ mốc đối chiếu `StickmanRunLog` (`UserSettings/StickmanRunLog.txt`) — còn vàng sau khi bấm thì đó là vàng THẬT |
| **Rig & Kiểm tra > ★ KHÁM SỨC KHOẺ DỰ ÁN** | **MỘT CỬA: dự án đang hỏng chỗ nào.** Gom mọi phép đo vào một bảng ĐỎ/VÀNG — thang cấp lệch bậc · khiên sai bậc vẽ · vũ khí câm · màn chơi thiếu cần ảo · thiếu giỏ tiếp đạn · art thiếu · nón chưa chấm pivot · script lọt ra ngoài module · **số tuning khai mà chưa asset nào bật** · **bảng điều khiển tự soi mình** (việc có file chứng mà không suy được nguồn ⇒ mục vàng không bao giờ sáng · đường dẫn nguồn/chứng khai sai ⇒ đo hỏng trong im lặng · menu chưa lên bảng). Mỗi dòng kèm CÁCH SỬA. Bấm sau mỗi lần làm xong một việc |
| **Vỏ game & Công thức > ★ Dựng MÀN HÌNH CHÍNH + danh sách màn** | Dựng `Menu_Main` (chơi tiếp · chọn màn · cài đặt · xoá tiến trình) và **đẩy nó lên scene số 0**. Không có nó thì bản build mở lên rơi thẳng vào bàn thử vũ khí |
| **Vỏ game & Công thức > ★ Dựng MỌI màn từ công thức** | Dựng scene từ file JSON trong `Assets/Settings/Recipes` — máy lo đúng thứ tự 11 bước. Công thức SAI thì KHÔNG dựng, chỉ réo tên trường. Kèm hai nút: *Tạo công thức MẪU* và *Soi công thức (đo, không dựng)* |
| **Genres > 1. Build Genre Assets** | sinh 3 asset `GenreDefinition` + `MapTheme` (Trung cổ / Hiện đại / Fantasy) từ mảng `Specs` |
| **Genres > 2. Build ALL Genre Scenes (9 bài)** | dựng 9 scene test: mỗi thể loại 3 bài, tự đăng ký vào ô chọn scene (F1) |
| Genres > Trung cổ \| Hiện đại \| Fantasy > ... | dựng LẺ từng bài test |
| **Genres > Hiện đại > 11. Lạc về trung cổ** | `Demo_59_TimeSlip` — SÁU lính hiện đại giữ doanh trại qua **6 hồi công trại** của quân trung cổ (bộ binh → cung thủ → tường khiên → rìu nặng → máy bắn đá → xe phá cổng + chủ tướng). Hòm đạn **có đáy** (`AmmoCache.SetStock`, 6 lượt) nên trận tự trôi sang nhặt kiếm giáo của địch; kèm trạm băng bó, giá vũ khí trung cổ trong trại và kho đạn dự phòng mở ở hồi 4 (đặt NGOÀI cổng). Màn TRỘN HAI THỜI ĐẠI: không gắn bộ lọc thể loại, nền văn minh chỉ **khoác áo** (`LookOnly` — `FullRoster` sẽ phát lại vũ khí theo quân chủng và xoá sạch kịch bản hồi), kho vũ khí do trọng tài khai theo phe — luật ở [Genres.md](Genres.md), phép đo ở Doctor › «Màn Lạc về trung cổ» |
| **Genres > Trung cổ > Zombie > 1..4** | prefab zombie + AIProfile + ActionSet, và 2 scene: TIẾP TẾ (cõng đồ về cứ điểm) · THỦ TRẠI (giữ doanh trại) |
| **Build > 0. Bảng dựng** | **MỞ CÁI NÀY TRƯỚC.** Bảng đánh dấu 4 bước: xanh = đã có kết quả trên đĩa, đỏ = chưa chạy, kèm nút chạy đúng bước còn thiếu. Trạng thái đo bằng FILE CÓ THẬT (không phải cờ nhớ) nên xoá scene đi là bảng biết ngay |
| **Build > 1. Asset gốc** | art · vũ khí+đạn · Fighter/Dummy · NPC+AIProfile · trang bị · âm thanh · bảng AI. KHÔNG dựng scene nào — nhẹ nhất, mọi bước sau đều cần nó |
| **Build > 2. Bàn thử + AI** | 8 scene: thử vũ khí · testbed · súng · sân tập động tác · AI đánh nhau · bảo vệ VIP · AI Lab · thủ nhà |
| **Build > 3. Chế độ chơi** | các bài CHƠI ĐƯỢC: 4 kiểu chơi mới · 3 kiểu trung cổ · zombie · **7 chế độ** (thêm `Demo_25_CastleDefense` thủ thành) · doanh trại · thành luỹ |
| **Build > 4. Ba thời kỳ + map** | 9 scene Trung cổ/Hiện đại/Fantasy (mỗi thời kỳ một TAB riêng ở F1) · 15 nền văn minh + sân đấu · hệ thống map |
| **Build > 9c. ★ DỰNG LẠI TẤT CẢ — map → kịch bản → scene** | (= Bảng điều khiển › Thể loại & Map › «★★ DỰNG LẠI TẤT CẢ», đánh dấu `destructive`) (2026-09-13) Một nút cho *"sửa map logic khá nhiều rồi, dựng lại tất cả, bỏ bản cũ đi"*. ⚠⚠ **«9. Chạy HẾT» KHÔNG thay được nút này**: builder trong dự án idempotent nên map/scene/kịch bản dựng bằng luật CŨ vẫn tính là «đã có kết quả» (`Job.IsDone`) và bị bỏ qua — bấm xong mà nội dung không đổi, không lỗi nào báo. Bốn bước, **thứ tự là luật**: (1) xoá kịch bản phim TỰ ĐỘNG `Cine_Auto_*` (chúng bake theo sân cũ); (2) FORCE kho map · map mặc định mọi thể loại × kiểu nhìn · sân mặt đất — mượn ĐÚNG bảng `StickmanMapRebuildBatch.JobTitles` để hai nút không dựng ra hai kho map khác nhau; (3) đồng bộ map mặc định của Trường quay (`RefreshGameplayMaps` — kịch bản phim ĐỌC kho map lúc dựng sân, chạy trước bước 2 là đồng bộ theo kho map cũ). ⚠ Không còn bước "đổ lại kịch bản mẫu": bảng `Samples` xoá 2026-09-15, mẻ FORCE không được đẻ thêm phim; (4) FORCE mọi scene qua `StickmanSceneRebuildBatch`. ⚠ **KHÔNG xoá asset map**: `RebuildAllDefaultsForAllGenres` ghi đè đúng nhóm map do máy sinh, còn map người dùng tự lưu nằm cùng thư mục và `MergeExistingMaps` cố ý giữ chúng — xoá sạch thư mục cho "chắc" là mất map tay, thứ không có đường dựng lại. ⚠ Trạng thái ở `SessionState` + `[InitializeOnLoadMethod]` (một mẻ có hàng chục lần ghi asset ⇒ domain reload ⇒ mọi `static` và `EditorApplication.update` đã đăng ký đều chết). Batch: `-executeMethod StickmanRebuildAllBatch.RunBatch` (không `-quit`) |
| **Build > 9b. FORCE dựng lại MỌI SCENE (không đụng art)** | (= Bảng điều khiển › Thể loại & Map › «★ FORCE dựng lại MỌI SCENE», ngay dưới nút FORCE map — nút này KHÔNG khai `proof`, trạng thái của nó là mấy chục dòng scene ở tab *Bắt đầu*) (2026-09-12) chạy **53 việc dựng scene** trong dây chuyền và BỎ nhóm art — «dựng lại scene» không được kéo theo một lượt sinh art (luật AGENTS: không ghi đè art thật bằng rebuild toàn bộ). Báo cáo `Logs/SceneRebuild.result.txt` so dấu thời gian `.unity` trước/sau và tách ba nhóm: **đã ghi lại** · **có builder mà không đổi byte** · **KHÔNG CÓ BUILDER** (kho 97 scene nhiều hơn số scene dây chuyền dựng được — vế này trước đây không nút nào nói ra). Batch: `-executeMethod StickmanSceneRebuildBatch.RunBatch` (không `-quit`), thêm `-sceneRebuildResume` để chạy tiếp mẻ dở hoặc `-sceneRebuildFrom N` để bắt đầu ở việc thứ N (dùng khi chạy ở clone khác). ⚠ Mẻ này phải sống qua HAI thứ: **domain reload** (trạng thái ở `SessionState` + `[InitializeOnLoadMethod]`, chạy mỗi lần MỘT việc vì hàng đợi dây chuyền không sống qua reload) và **tiến trình Unity chết** (tiến độ ghi ra `Logs/SceneRebuild.state.txt` sau mỗi việc) |
| Create Demo Scenes (All) — chạy lại mọi tool | Bấm hộ cả 4 bước liền mạch. **Máy yếu thì đừng bấm** — gần 40 scene trong một lần bấm; dùng bảng dựng bấm từng bước, cùng kết quả mà editor được nghỉ giữa các bước |
| Demo Scenes > 1..7 | dựng lại lẻ từng scene test |
| Demo Scenes > 7. Modern Weapons | **scene thử SÚNG HIỆN ĐẠI** (`Demo_7_ModernWeapons`) — tách khỏi Demo_1 vốn là bộ trung cổ |
| Demo Scenes > 9..12 | **4 KIỂU CHƠI MỚI** (`StickmanGameplayBuilder`): `Demo_21_Arena` đấu trường sinh tử (wave + chọn 1/3 thưởng giữa đợt, `ArenaMode`) · `Demo_22_DayNight` chu kỳ ngày/đêm (ngày khai thác, đêm giữ nhà, `DayNightCycle`) · `Demo_23_CTF` **CƯỚP CỜ = GIỮ CỜ TÍNH GIỜ** (một lá cờ duy nhất trên THỀM CAO giữa sân, ai vác thì phe đó cộng điểm mỗi giây, hết 3 phút ai nhiều hơn thì thắng; sân HAI LÀN — đường đất thông suốt + đường trên chạy dọc map với 3 lối lên mỗi bên — nên có đường vòng sau lưng địch; có `RespawnDirector` hồi sinh cả hai phe — `CaptureTheFlag`) · `Demo_24_TugOfWar` kéo co giữ tuyến (tiền tuyến trôi theo cán cân quân số, `TugOfWarLine`) |
| Demo Scenes > 16. Prisoner Rescue | **GIẢI CỨU TÙ BINH** (`Demo_32_Rescue`): 3 **LỒNG TREO** (`StickmanFortBuilder.CreateHangingCage` — cũi sắt treo trên giá gỗ, đung đưa tòn ten qua `PrisonerCage._swingPivot`; song sắt là `Fortification` kiểu Gate nên phá bằng đường damage có sẵn), **4 lính gác vây quanh mỗi lồng** (`GuardTarget` vào chính cái lồng). Tù binh: **KHÔNG vũ khí, KHÔNG giáp** (`MakePrisoner` xoá `_startingEquipment` + rút sạch kho, chỉ để `Weapon_Fists`), **TREO LƠ LỬNG** (Rigidbody2D → Kinematic, thả ra thì trả Dynamic để RƠI ra khỏi lồng), và có **dáng bị nhốt** (`StickmanActionType.Captive` — hai tay bám song, chân buông, loop). Bị nhốt thì TẮT `TeamMember` → biến mất khỏi `TeamMember.All` + khỏi lưới nên **không ai bắn xuyên song sắt giết được** (không cần thêm cờ "đừng nhắm tôi" nào). Luật đếm NGƯỜI VỀ TỚI ĐIỂM TẬP KẾT, không đếm lồng đã mở |
| Demo Scenes > 13..15 | **3 KIỂU CHƠI TRUNG CỔ** (`StickmanMedievalModeBuilder`): `Demo_26_Raid` cướp bóc làng (hai phe chơi hai trò khác nhau — cướp đua ĐỒNG HỒ, làng chỉ cần CẦM CHÂN; giết dân thường thì cướp được CỘNG GIỜ, `VillageRaid`) · `Demo_27_Champion` đấu tướng trước trận (hai tướng đấu tay đôi, quân đứng xem; tướng ngã thì 40% quân bên đó bỏ chạy rồi mới tổng chiến — lấy SĨ KHÍ làm luật chơi, `ChampionDuel`) · `Demo_28_SiegeCamp` vây thành dài ngày (thắng bằng ĐÓI: chắn ĐƯỜNG TIẾP LƯƠNG cho kho trong thành cạn; cạn lương = 35% quân thủ bỏ trốn, `SiegeCamp`). Cả ba KHÔNG thêm cơ chế AI nào mới — lắp lại `Flee`/`GuardTarget`/`QueryNear` có sẵn, đó là phép thử cho kiến trúc |
| Demo Scenes > 8. War Camp | **MODE DOANH TRẠI** (`Demo_20_WarCamp`, người chơi = 1 lính phe xanh): mỗi phe một `WarCamp` — worker khai thác → kho; LÚA nuôi trại đẻ lính TAY KHÔNG (holder.Unequip, lính tự ra giá lấy vũ khí nhờ weaponSeekRadius) · GỖ nuôi xưởng rèn random (WeaponPickup nằm mãi, tier = cấp trại) · VÀNG tự nâng cấp trại; lính mới nhập cây chỉ huy (CommandStructure.Attach); tướng đánh theo **NHỊP XUẤT QUÂN** (`CommandDoctrine.sortieInterval/sortieDuration` — tổng tấn công một đợt rồi rút về thủ; học thuyết `Doctrine_WarCamp`). Nhà chính sập = trại ngừng sản xuất |
| **Naval > 1. Dựng hệ thuỷ chiến** | 4 hạng thuyền (`Assets/Settings/Ships/`) + art thuyền + tính cách thuỷ thủ/hải tặc + **4 scene**: `Demo_34_SeaBattle` · `Demo_35_PirateRaid` · `Demo_36_IslandAssault` · `Demo_49_NavalCommand`. Bảng số nằm ở `StickmanNavalBuilder.Specs` — sửa ở đó rồi bấm lại, đừng sửa tay Inspector |
| Naval > 2. Chỉ sinh asset hạng thuyền | ghi lại 4 `ShipDefinition` + `AIProfile_Sailor` / `AIProfile_Pirate`, không dựng scene |
| Naval > 3..5 | dựng lại LẺ từng bài thuỷ chiến |
| **Naval > 6. CHIẾN TRANH HAI ĐẢO (Demo_49)** | (thay bài «Giành cảng» cũ) doanh trại kinh tế đầy đủ — nông dân · mỏ vàng · rừng củi · cây công trình · nhà lính có cấp — nhưng bản đồ bị CẮT ĐÔI bằng biển; mảnh mới duy nhất là **BẾN CẢNG** (`CampBuildKind.Harbor`) và từ đó là thuyền · chuyến đò · quân đổ bộ. Luật thắng vẫn là phá nhà chính (`EconomyRaceMode` bản Island). Đổi bố cục thì đọc phần "mấy con số không được đổi bừa" trong `StickmanNavalBuilder.IslandWar.cs` |
| Naval > 0. Sinh art placeholder thuyền | thân · buồm · cờ · cột · pháo. Thay art thật = thả PNG cùng tên vào `Assets/Sprites/Naval/` (tool KHÔNG đè file đã có) |
| **Maps > 1. Build Map System (3 thể loại)** | **HỆ THỐNG XÂY MAP**: sinh `Resources/MapLibrary.asset` + **25 map mẫu (7 × 3 thể loại + 4 battle royale)** (`Assets/Settings/Maps/`) + 3 công thức map ngẫu nhiên (+ 2 công thức battle royale nằm ngoài kho) + kho đồ nhặt `lootWeapons` + 3 BỘ QUÂN (`GenreKit`: trung cổ / hiện đại / fantasy) + loadout súng & trượng phép + học thuyết công/thủ (`Doctrine_MapAssault/MapDefend`) + tính cách quân công thành & dân thường. Bảng số map mẫu nằm trong `StickmanMapSystemBuilder.Blueprints` — sửa ở đó rồi bấm lại nút, đừng sửa tay Inspector |
| Maps > 2. Create Map Arenas (3 sân) | dựng `Demo_29_MapMedieval` · `Demo_30_MapModern` · `Demo_31_MapFantasy` — mỗi thể loại một sân, chỉ hiện map của bộ mình (F2 chọn map · N map ngẫu nhiên · F5 chơi lại) |
| Maps > Sân > Trung cổ / Hiện đại / Fantasy | dựng lại lẻ một sân |
| **Maps > 7. Build Battle Royale (3 sân)** | (= `★ Battle Royale — 3 sân` ở Bảng điều khiển) vẽ bù dù/máy bay/thuốc/thùng → dựng lại kho map (nạp `MapLibrary.lootWeapons` + 6 map mẫu `Med/Mod/Fan_Royale(Squad)` + 3 công thức `Recipe_Royale_*`) → dựng `Demo_56_RoyaleMedieval` · `Demo_57_RoyaleModern` · `Demo_58_RoyaleFantasy` → **dựng lại vỏ game** (menu chính đọc cùng catalog). Mỗi ván một map, F5 = map mới, nút HUD đổi ĐƠN/TỔ 4 và «Xem bot đấu». Luật: `Docs/AgentRules/BattleRoyale.md` |
| **Maps > 8. Build PHỐ MỞ — GTA 2D** | (= `★ PHỐ MỞ — GTA 2D` ở Bảng điều khiển) **sinh tiếng thành phố** (`Audio > 5` + `Audio > 4`: còi cảnh sát · còi xe · tiền · lên sao · thoát — thiếu là `PlayKey` im lặng trả về) → dựng lại kho map (cần `lootWeapons` cho tiệm súng + `structureParts` cho nhà) → ghi HAI công thức `Recipe_City_Modern` · `Recipe_City_Medieval` + hai map mẫu `Mod_City` · `Med_City` → dựng **HAI scene** `Demo_70_CityOpenWorld` (hiện đại) và `Demo_71_TownOpenWorld` (trung cổ), mỗi cái **kèm KHO XE MẪU riêng** (ô tô / xe ngựa) (thiếu nó là phố không có xe cộ, mất luôn việc trộm xe và gara xoá sao) → dựng lại vỏ game. Thành phố **giữ nguyên** giữa các ván (`newMapEachRound: false`). Luật: `Docs/AgentRules/OpenWorld.md` |
| Maps > Sân > Battle Royale — Trung cổ / Hiện đại / Fantasy | dựng lại lẻ một sân battle royale |
| **Maps > 8b. Map 3/4 CÓ TÊN — Bến Đò Đầm Lầy · Cầu Đầm Lầy** | (= Bảng điều khiển › Thể loại & Map › «Map 3/4 CÓ TÊN») hai sân MẶT ĐẤT **thiết kế tay** (seed cố định) thay vì bốc theo công thức chung: biome `Swamp` ⇒ sông chắn ngang ⇒ một CẦU nhanh mà chật (điểm chiếm nằm trên cầu) và một BẾN LỘI chậm ×0.6 nhưng vòng được ra sườn. Vẫn đi qua `MapGenerator.Generate` rồi chỉ ghi đè ô làm nên bản sắc. Chứng: `Assets/Settings/Maps/Map_Grd_*.asset`; bảng số ở `StickmanGroundLandmarkMaps.All`. Bấm xong mở `Demo_70`/`Demo_71` → F2 chọn tên map — không thấy sông là biome bị ghi đè, kiểm `map.biome`. Batch: `-executeMethod StickmanGroundLandmarkMaps.RunBatch -quit` |
| **Rig & Kiểm tra > Soát chuỗi điểm nối của kiểu chơi** | Hỏi 8 câu cho MỌI `MissionType`: đã nối vào `MissionPlan` · `MapBlueprint` · `MapKitPlanner` · `MapAssembler` · `MapTypes` (tên/lời dẫn/LUẬT THẮNG) · `MapStudio` · map mẫu · kho map chưa. Bấm sau khi thêm một kiểu chơi mới — đây là thứ thay cho việc rà bằng trí nhớ (`StickmanMissionChainCheck`, cũng nằm trong Doctor) |
| Maps > 3. Bake map đang chọn thành scene | MapDefinition → scene tĩnh `Map_<key>.unity` (cảnh + mục tiêu bake sẵn để kéo tay chỉnh; quân đội do `MapPopulator` ra lúc Play) |
| Maps > 4. Sinh 1 map ngẫu nhiên thành asset | lưu một map random ra đĩa để chỉnh tiếp / đưa vào kho |
| **Maps > 9. SMOKE mọi map — dựng thật + luật + thang + chân công trình** | (= Bảng điều khiển › «SMOKE mọi map trong kho») dựng từng `MapDefinition` (cả `Saved/`, cả 3/4) vào scene tạm bằng đúng `MapAssembler.Build` không quân, chạy 18 luật map + `kit.Validate`, rồi đo thêm: thang trèo / cầu thang có CẠNH trong `LaneNav` không (không có = AI không thấy), chân CÔNG TRÌNH có đứng trên `SurfaceY` không, và kê ĐƯỜNG DẪN + component của mọi vật chắn bị réo. Báo cáo `Logs/MapSmoke.result.txt`. Batch: `-executeMethod StickmanMapSmokeTest.RunBatch -smokeFilter <lọc>` — lọc = chuỗi con đường dẫn, nhiều điều kiện cách `;`, `!` để loại (VD `Maps/Map_;!Grd_` = map mẫu 2D). Cái thước |
| **Maps > 9b. SMOKE + AI ĐI THỬ mọi map (play mode)** | (= «SMOKE + AI ĐI THỬ») vào Play, dựng từng map CÓ QUÂN, cho AI chạy 15–18 s (timeScale 2): quân KẸT · RƠI khỏi đất · ra NGOÀI map · lỗi Console, luật map đo ở frame đầu sau khi dựng. ~20 s/map. Báo cáo `Logs/MapSmokePlay.result.txt`. Batch KHÔNG kèm `-quit`: `-executeMethod StickmanMapSmokeTest.RunPlayBatch -smokeFilter Maps/Map_Med -smokeSeconds 15`. Cái thước |
| **Maps > 9c. SMOKE scene đã bake (play mode)** | (= «SMOKE scene đã bake») mở từng `_Scenes/*.unity` trong Play, chờ 2.5 s cho `MapDressing`/`MapPopulator`, đo chân mọi hình dưới `Canh_Dap_Them` so mặt đất THẬT (`TerrainGround.SurfaceYAt` hay tia dò — thứ YAML không thấy vì đắp lúc chạy), thang/cầu thang có cạnh `LaneNav`, lỗi Console lúc nạp. Batch không `-quit`: `-executeMethod StickmanMapSmokeTest.RunScenesBatch -sceneFilter Demo_`. Báo cáo `Logs/SceneSmoke.result.txt`. Cái thước |
| **Maps > 10. FORCE dựng lại MỌI map + sân map (dây chuyền)** | (= «★ FORCE dựng lại MỌI map + sân map») xếp đúng thứ tự vào dây chuyền: bộ mảnh ghép → kho map → sân mặt đất (`Grd_*`) → map mặc định MỌI thể loại · kiểu nhìn → 3 sân map → 3 sân Battle Royale. Thứ tự là luật: «Hệ thống map» chạy SAU hai việc kia là kho mất map. Batch: `-executeMethod StickmanMapRebuildBatch.RunBatch` (không `-quit`). Luật: [MapKit.md](MapKit.md) mục SMOKE |
| **Animation > 1. Build Action Sets (4 bộ)** | sinh 4 bộ động tác toàn thân (Soldier/Heavy/Agile/Boss) — khung ở `StickmanActionSetBuilder`, style phụ nối thêm từ `StickmanActionBuilder` |
| Animation > 4. Build Style Pack Preview | 1 bộ gom ĐỦ MỌI STYLE để xem/chỉnh cho dễ (nhân vật trong game dùng 4 bộ trên) |
| Animation > 5. Add Body Animator to Prefabs | gắn `StickmanBodyAnimator` + bộ động tác vào Fighter / NPC / Dummy |
| Animation > 6. Create Traversal Scene | **sân tập động tác** (`Demo_12_Traversal`): bục nhảy cao dần · khe phải nhảy qua · thang · dây đu · hầm phải bò · vật chắn để ngồi nấp · bia tập |
| **Animation > 7. Xưởng động tác (Demo_67)** | dựng `Demo_67_AnimLab` — CHỌN NHÂN VẬT rồi xem LẦN LƯỢT từng clip của bộ đó (kể cả style xoay trọn vòng, thứ `Pick` cấm bốc ngẫu nhiên nên trong trận không bao giờ thấy). Bảng trái ghi số của clip, liệt kê loại CHƯA CÓ style nào và clip không bao giờ chạy được. Đây là chỗ soi động tác trước khi THÊM/SỬA |

⚠⚠ **`GenerateMissing` KHÔNG BAO GIỜ LÀM MỚI ĐƯỢC MỘT TẤM NÀO — DÂY CHUYỀN PHẢI TỰ DỌN.**
Nó cố ý chỉ bù file THIẾU (để không xoá mất art thật), nên bấm "chạy hết" bao nhiêu lần cũng
ra art vẽ theo luật CŨ, đứng cạnh mấy tấm mới sinh: đúng câu *"art cũ art mới lẫn lộn"*, và
không lỗi nào báo vì mỗi nền vẫn đủ nón đủ giáp. Trước đây việc dọn CHỈ có ở một mục menu
riêng, tức chỉ xảy ra khi có người nhớ bấm — thứ mà LUẬT VÀNG cấm.
Nay `StickmanDemoBuilder.Prepare(rebuildAll)` gọi `CivilizationArtGenerator.CleanStaleArtSilent()`,
giữ nguyên hai chốt chặn: đúng KHỔ generator **và** cũ hơn file generator, nên art THẬT không
bao giờ bị đụng. Bộ art theo CẤP (`<nền>/TierN/`) thì xoá thẳng cả thư mục — nó 100% do code
sinh, không ai thả art thật vào đó.

⚠ **DỰNG LẠI DỰ ÁN: `Tools > Stickman > Build > 0. Bảng dựng`** → bấm **1 → 2 → 3 → 4**
(hoặc "Chạy hết"). 30 việc, chia 4 nhóm.

**VÌ SAO NÚT "ALL" CŨ LÀM CRASH — và vì sao chia bước KHÔNG đủ để chữa.**
Một mục menu của Unity chạy **TRỌN VẸN TRONG MỘT FRAME EDITOR**. Nút cũ dựng ~40 scene bên
trong một lời gọi, nên cả 40 scene nằm gọn trong đúng frame đó: Unity không chạy được vòng
dọn dẹp của chính nó, không drain được hàng đợi import, không thu hồi được bộ nhớ native.
Phình tới lúc hết RAM rồi **tắt ngang, không kịp báo lỗi**.
⚠ Gọi `UnloadUnusedAssetsImmediate` giữa chừng **KHÔNG đủ** — nó chỉ thả được thứ đã hết tham
chiếu, còn undo stack và hàng đợi import vẫn giữ chặt tới hết frame. Chia thành 4 mục menu
cũng KHÔNG đủ nếu vẫn còn một nút bấm chạy cả 4 trong một lời gọi.

**CÁCH DUY NHẤT ĐÚNG: ĐỪNG CHẠY TRONG MỘT FRAME.** `StickmanBuildPipeline` xếp việc vào hàng
đợi rồi nhả cho `EditorApplication.update` — **mỗi tick làm ĐÚNG MỘT việc**. Giữa hai việc,
editor chạy trọn một frame của nó. Lâu hơn vài giây, nhưng chạy XONG.

Ba thứ phải dọn giữa hai việc, thiếu cái nào cũng vẫn phình:
`UnloadUnusedAssetsImmediate` (asset hết tham chiếu — phải bản ĐỒNG BỘ, bản async chỉ xong ở
frame sau) · **`Undo.ClearAll()`** (undo stack giữ tham chiếu tới MỌI object vừa tạo — chỗ giữ
nhiều nhất mà hay bị bỏ sót) · `GC.Collect()`.

Thêm một lớp nữa ở `StickmanDemoBuilder.FinishSceneShared`: dọn sau **mỗi scene**. Đặt ở đó vì
mọi builder scene đều đi qua đó, nên builder mới cũng được dọn mà khỏi nhớ gì thêm.

**Huỷ giữa chừng vẫn giữ phần đã dựng** — trạng thái đo bằng FILE CÓ THẬT nên mở lại bảng là
chạy tiếp được từ chỗ dở ("Chỉ chạy các việc CÒN THIẾU").

⚠ **ĐỪNG bọc bước sinh asset trong `AssetDatabase.StartAssetEditing()`.** Nghe thì nhanh hơn
thật, nhưng trong batch đó `LoadAssetAtPath` trả **null** cho file vừa ghi — mà cả bộ
generator (`WeaponArtGenerator.Save`, `CivilizationArtGenerator.Save`...) đều load lại sprite
ngay sau khi ghi để trả về. Bọc vào là art sinh ra mà không ai cầm được nó.

⚠ **AssetDatabase KHÔNG ĐÁNG TIN LÚC UNITY ĐANG BẬN — và đệ quy phải có ĐÁY.**
`EditorApplication.update` vẫn nổ trong lúc biên dịch script / import asset; ở khoảng đó
`LoadAssetAtPath` trả null cho file có thật và `IsValidFolder` nói cả **"Assets"** không hợp lệ.
Hai vế chữa, thiếu vế nào cũng còn hỏng: `StickmanBuildPipeline.Tick` **bỏ qua tick** khi
`isCompiling || isUpdating` (chờ một frame, không mất việc nào), và
`StickmanRigTools.EnsureFolder` **dừng ở GỐC** — bản cũ cứ false là leo lên cha nên leo qua
"Assets" tới chuỗi rỗng rồi `Path.GetDirectoryName("")` ném `Invalid path`, giết đúng việc
ĐẦU TIÊN của dây chuyền (`WeaponArtGenerator.GenerateAll`). Folder đã có trên đĩa mà
AssetDatabase chưa thấy thì **nạp lại** chứ đừng `CreateFolder` — nó đẻ ra "Weapons 1" bên
cạnh còn art vẫn ghi vào folder cũ, tra đường dẫn nào cũng trượt.

⚠ **HUD CỦA SCENE CHỈ DỰNG Ở MỘT CHỖ: `StickmanDemoBuilder.FinishSceneShared`.**
Trước đây có HAI bản chép tay (`FinishScene` riêng cho scene của chính DemoBuilder, và
`FinishSceneShared` cho hơn mười builder còn lại) — và chúng đã lệch nhau thật: bản riêng có
`StickmanTouchControls`, bản chung THIẾU. Hậu quả: chế độ chơi · ba thể loại · trung cổ · thuỷ
chiến · đột nhập · công sự · doanh trại · zombie · sân tập đều **không điều khiển được trên
điện thoại**, mà không có lỗi nào báo — nhân vật chỉ đứng im. Nay `FinishScene` là lối tắt gọi
`FinishSceneShared`.
⚠ **Scene đã bake KHÔNG tự sửa theo code builder** — và điều đó đúng cho cả **SỐ TUNING**,
không chỉ cho component còn thiếu: field ĐÃ CÓ trong YAML thì Unity nạp GIÁ TRỊ ĐÃ LƯU, chỉ
field MỚI THÊM mới nhận giá trị khởi tạo trong code. Hạ vùng chết cần ảo từ 0.22 xuống 0.12
mà quên chạy tool thì cả 40 scene vẫn giữ 0.22 — sửa xong cầm máy lên thấy y hệt lúc chưa sửa.
`StickmanTouchPatchTool.SyncTuning` chép từ một component VỪA TẠO (không kê bảng số trong
tool: kê tay là ngày mai chính nó ghi đè bằng số cũ). Vá bằng
`Tools > Stickman > Nâng cao > UI > Vá HUD + điều khiển cảm ứng vào scene đã dựng` (mở từng scene,
thêm cái còn thiếu rồi lưu — chạy qua `StickmanBuildPipeline` nên **mỗi frame một scene**,
không phình bộ nhớ). Rẻ hơn nhiều so với dựng lại cả bộ chỉ vì một component.

⚠ **BIẾN TĨNH CHẾT KHI "CHẠY TIẾP" — van tự lành ở `StickmanDemoBuilder.EnsurePrepared`.**
Mấy scene của chính `StickmanDemoBuilder` (Demo_1/3/4/5/6/7) KHÔNG tự gọi `PrepareShared` như
các builder khác — chúng dựa vào việc BƯỚC 1 của dây chuyền đã chạy và để lại loadout, trang bị,
học thuyết trong biến `static`. Biến tĩnh mất trắng ở hai tình huống rất thường gặp:
· **chạy tiếp dây chuyền** (bước 1 đã XANH nên bị bỏ qua → không ai gán biến tĩnh nữa);
· **Unity nạp lại domain** (sửa script giữa chừng → mọi `static` về null).
Cả hai đều không có lỗi nào báo cho tới lúc một builder chạm `loadout.weaponIndex` rồi ném
`NullReferenceException` (đã dính 1 lần ở Demo_3 `SpawnSquad`).
⚠ **THÊM LOADOUT/TRANG BỊ MỚI THÌ PHẢI NỐI VÀO `EnsurePrepared`.** Hàm đó đo bằng chính các biến tĩnh, nên quên một biến là biến đó vẫn null lúc dây chuyền chạy tiếp — và builder nào chạm vào nó thì nổ `NullReferenceException` GIỮA CHỪNG, chết cả dây chuyền. Đã dính với `_priestUnit` (giáo sĩ AI Lab bài 3).
⚠ **Builder TỰ DỰNG SCENE phải tự gọi `EnsurePreparedShared()`** — nó không đi qua `NewScene` nên không được hưởng van tự lành nằm trong đó (`StickmanAILabBuilder`, `BuildTestbedScene`).
`EnsurePrepared()` đo bằng CHÍNH CÁC BIẾN TĨNH — không bằng cờ "đã chuẩn bị rồi", đúng khuôn
"đo bằng thứ CÓ THẬT" của `StickmanReadiness`. Nó nằm ở `NewScene` (chỗ mọi scene đều đi qua)
và ở `BuildTestbedScene` (bàn thử tự dựng scene nên KHÔNG qua `NewScene` — builder nào tự dựng
scene thì phải tự gọi).

**DANH SÁCH BUILDER CHỈ NẰM MỘT CHỖ**: mảng `StickmanBuildPipeline.Steps`. Thêm builder mới
thì nối vào đó — cả 4 menu, cả bảng đánh dấu, cả nút "chạy hết" đều tự có. Bản cũ liệt kê tay
trong `CreateAllDemoScenes`, nên thêm builder mà quên nối là scene có file mà không bao giờ
được dựng lại.

⚠ **HAI BẪY "DỰNG XONG MÀ KHÔNG THẤY GÌ"** (đã dính, đừng làm lại):

1. **Đừng dò "đã đủ art chưa" bằng DANH SÁCH RÚT GỌN.** `CivilizationArtGenerator.EnsureAll`
   từng chỉ kiểm "có nón + có skin vũ khí", nên khi thêm loại file mới thì loại đó KHÔNG BAO
   GIỜ được sinh ra — sai hai lần theo đúng một kiểu (lần đầu mất skin vũ khí, lần sau mất
   sạch GIÁP của 5 nền). Danh sách kiểm phải sửa mỗi lần thêm file mới mà không ai nhớ.
   Nay `EnsureAll` gọi thẳng `GenerateMissing` — hàm đó tự bỏ qua file đã có nên luôn đúng
   và không bao giờ lỗi thời.
2. **Module tự đăng ký bài thì phải TỰ LÀNH LẠI.** 9 scene ba thể loại do
   `StickmanGenreSceneBuilder` tự đăng ký; builder đó không chạy (lỗi giữa chừng trong
   "Create Demo Scenes (All)") là file scene nằm trên đĩa mà bấm F1 **không thấy tab nào cho
   ba thời kỳ**. Nay `EnsureCatalog` gọi luôn `RegisterAll()` — quét theo FILE CÓ THẬT nên
   tool nào chạy cũng dựng lại đủ ba tab. Cùng tinh thần với `PruneCatalogToExistingScenes`:
   catalog tự khớp lại với đĩa.

**BA THỜI KỲ = BA TAB RIÊNG.** `DemoSceneCatalog.Category` có `Medieval`/`Modern`/`Fantasy`
tách hẳn (giá trị `Genre` cũ giữ lại cho asset cũ khỏi lệch). Mỗi thời kỳ 3 bài: thử vũ khí ·
đánh nhau · bài đặc thù (công thành / dùng vật che / đấu tay đôi). Dựng bằng
`Genres > 2`. Bài **thử vũ khí trung cổ** có `CivilizationSkinPreview` — nút ◀ ▶ (hoặc phím
`[` `]`) đổi nền văn minh NGAY TẠI CHỖ để thấy hình vũ khí đổi.
⚠ Nó dùng `ApplyLookTo` chứ KHÔNG dùng `ApplyTo`: `ApplyTo` áp cả loadout nên đổi luôn cây
đang cầm theo quân chủng của nền — đang thử cây thương thì nhảy sang cây cung, mất sạch ý
nghĩa bài thử.

**Ô CHỌN SCENE CÓ TAB NHÓM.** Danh sách đã hơn 25 bài nên `DemoSceneSwitcher` gom theo
`DemoSceneCatalog.Category`: **Cơ bản · AI · Chế độ chơi · Thể loại**. Chọn 2 nhịp
(nhóm → bài) nhưng mỗi nhịp chỉ vài dòng, thay vì cuộn một cột dài.
Phím: **F1** mở · **◀ ▶** đổi tab · **▲ ▼ + Enter** chọn bài · **Esc** đóng · **R** chơi lại.
Nhóm RỖNG không hiện tab. Thêm nhóm mới = thêm 1 giá trị `Category`.
Dropdown chọn bài của **AI Lab** cũng CUỘN được (kẹp ~8 dòng rồi cuộn — 15 bài đổ thẳng ra là
tràn màn hình, mấy bài cuối bấm không tới).

⚠⚠ **MỘT KIỂU CHƠI = MỘT DÒNG.** Tab «Chế độ chơi» của Trung cổ từng có **hai dòng cho cùng
một kiểu chơi**: bảy scene dựng tay (Demo_3 · Demo_6 · Demo_14 · Demo_4 · Demo_15 · Demo_13 ·
Demo_22) và bảy dòng bản MAP của đúng bảy nhiệm vụ ấy do `StickmanGenreMissionCatalogBuilder`
đăng ký — *"Đưa giáo sĩ về làng"* với *"Bảo vệ VIP"* là một, *"Hộ tống"* với *"Hộ tống hàng"*
là một, *"Chiếm điểm"* với *"Chiếm cứ điểm"* là một. Người chơi không có cách nào biết hai
dòng đó khác nhau ở chỗ nào, và bảy dòng thừa đẩy danh sách dài gấp rưỡi.
Nay bảng `CoveredByScene` khai rõ "kiểu chơi này đã có màn dựng tay rồi" và bản map bị GỠ.
· ⚠ Khai kèm **TÊN SCENE**, không phải cờ bool, và kiểm bằng **file có thật**: xoá
  `Demo_15_Escort` đi thì dòng "Hộ tống hàng" của bản map tự hiện lại — chứ không phải kiểu
  chơi đó lặng lẽ biến mất khỏi menu.
· ⚠ Modern/Fantasy CỐ Ý để trống bảng đó: chúng chưa có màn dựng tay nào cho bảy nhiệm vụ
  này, nên bản map là đường DUY NHẤT tới chúng.
· ⚠ **Phải GỠ, không chỉ "thôi không đăng ký"**: `BuildCatalog` cố ý GỘP chứ không ghi đè
  (để module nào tự đăng ký bài cũng sống chung được), nên bỏ đăng ký thôi thì dòng cũ nằm
  lại trong asset vĩnh viễn — và `PruneCatalogToExistingScenes` không dọn được vì file sân
  map vẫn còn. Module tự đăng ký thì cũng phải tự gỡ được (`DemoSceneCatalog.EditorRemove`).
· Bản map của mấy nhiệm vụ đó KHÔNG mất: mở «Sân map · Trung cổ» rồi **F2** là chọn được
  đúng map ấy (có hàng lọc theo kiểu chơi), **N** sinh map ngẫu nhiên.

**LUẬT XẾP NHÓM — một câu hỏi duy nhất: *người chơi có điều khiển nhân vật không?***
· CÓ → **Chế độ chơi** (`Gameplay`), trừ khi là BÀN THỬ (vào để xem vũ khí/chỉnh pose, không
  phải chơi một ván có thắng thua) thì để **Cơ bản** (`Core`);
· KHÔNG, chỉ ngồi xem máy đánh nhau → **AI**;
· Scene giới thiệu THỂ LOẠI → `Medieval`/`Modern`/`Fantasy`.
Cách chấm nhanh: builder của scene đó có gọi `SpawnPlayerShared` không.
⚠ **`Core` = 0 nên entry QUÊN khai `category` sẽ âm thầm rơi vào tab "Cơ bản"** — đúng lỗi đã
dính: 4 chế độ chơi (đấu trường · ngày/đêm · cướp cờ · kéo co) nằm lẫn trong tab bàn thử suốt
một thời gian. Thêm entry là PHẢI ghi `category`.
⚠ **MODULE TỰ ĐĂNG KÝ BÀI THÌ ĐỪNG XIN CATALOG BẰNG `EnsureCatalogShared()`** —
StackOverflow, đã dính 1 lần và nó GIẾT LUÔN EDITOR (StackOverflowException không catch được;
sau đó mọi lệnh ghi AssetDatabase báo "Failure occurred updating SourceAssetDB. Permission
denied" rồi Unity crash hẳn). Vòng: `EnsureCatalog` gọi `StickmanGenreSceneBuilder.RegisterAll()`
cho ba tab thể loại tự lành lại → `RegisterAll` xin catalog bằng `EnsureCatalogShared()` =
chính nó → lặp vô tận. Nay `EnsureCatalog` có cờ `_buildingCatalog`: đang dựng dở mà ai xin
thì ĐƯA ASSET (`LoadOrCreateCatalog`), không dựng lại từ đầu. Cả 5 module tự đăng ký bài
(thể loại · zombie · công sự · đột nhập · map) đều xin catalog theo kiểu đó — nối module mới
vào `BuildCatalog` thì cờ này là thứ duy nhất che cho anh.

⚠ **Một scene chỉ được đăng ký ở MỘT chỗ.** `Demo_21_Fortress` từng có mặt cả trong danh sách
gốc của `StickmanDemoBuilder` lẫn trong `StickmanFortBuilder.RegisterInCatalog` với HAI nhóm
khác nhau → nó nhảy tab tuỳ builder nào chạy sau. Đăng ký hai chỗ thì hai chỗ phải khai
CÙNG một nhóm.

⚠ **Dựng scene mà không nối vào nút "All" thì bài test BIẾN MẤT KHÔNG BÁO LỖI.**
`PruneCatalogToExistingScenes()` xoá mọi entry không có file `.unity`, nên scene chỉ dựng được
bằng nút lẻ sẽ bị dọn khỏi ô chọn scene ngay lần chạy "All" kế tiếp. Đã dính với
`Demo_12_Traversal` (chỉ `Animation > 1` mới dựng). Thêm scene mới → nối builder của nó vào
`CreateAllDemoScenes` NGAY, đừng để lần sau.

**Mỗi tính năng một scene test riêng, không nhồi chung 1 scene.** Lúc chơi có **Ô CHỌN SCENE**
(`DemoSceneSwitcher`) ở góc trên trái: bấm vào ô hoặc phím **F1** để xổ danh sách, mũi tên +
Enter để chọn, Esc đóng, `R` chơi lại. **Là DROPDOWN chứ không phải dãy nút** — dãy nút cũ tràn
khỏi mép phải màn hình từ scene thứ 13 trở đi. Danh sách scene nằm trong asset
`DemoSceneCatalog` — thêm bài test mới = thêm 1 dòng trong asset + 1 hàm dựng scene, không sửa UI.
**Không có scene "Rớt & nhặt đồ" riêng nữa** (trùng với `Demo_1_Weapons`): giá vũ khí dưới đất
và 3 bia mặc nón/giáp/khiên + rơi coin đều nằm luôn trong scene vũ khí.

**Ngoại lệ duy nhất — `Demo_5_Testbed` có 2 TAB trong 1 scene** (`StickmanTestbedHud`):
tab *Animation* (đổi vũ khí xem dáng cầm + đòn đánh, kéo góc ngắm/lực tích, đọc thẳng số IK
tay để chỉnh pose) và tab *AI* (soi state từng NPC, kéo chậm `Time.timeScale` mà xem).
Hai tab là hai VÙNG cách nhau 100 unit, vùng không xem bị `SetActive(false)` → không ảnh
hưởng nhau. Phím `Tab` đổi tab, `R` dựng lại.

Mọi tool dựng scene đều gọi `StickmanSceneUtils.EnsureAllAssets()` trước (thiếu art/prefab/NPC
thì tự chạy tool sinh ra) và `ValidateScene()` sau (log lỗi nếu đất mất collider, thiếu pool đạn...).
**Dựng đất phải dùng `StickmanSceneUtils.CreateGround()`** — set size collider bằng tay,
không tin auto-fit: sprite null là collider ra size 0, nhân vật rơi xuyên đất.
| Build or Refresh Ragdoll | dựng ragdoll từ `StickmanRagdollDefinition`, tự wire controller |
| Bake Clip (Inspector của AnimationRecipe) | capture pose IK trong scene → sinh `.anim` |
| Create SkinSet from Selection / Rebuild Bindings | đổi toàn bộ hình nhân vật giữ nguyên rig |
| Validate Rig / Check SkinSet Compatibility | chạy TRƯỚC khi báo "xong" |
| Weapons > 1..4 / Build Everything | sprite placeholder → prefab base+variant → nhân vật → scene demo |
| Weapons > New Weapon Variant from Selection | thêm vũ khí mới từ base |
| Weapons > Balance Report | đo DPS/tầm/điểm cả bộ, chỉ mặt cây lệch cân bằng — chạy sau MỖI lần thêm/sửa vũ khí |
| Weapons > Tiers > 1 / 2 | tạo bảng cấp độ · đặt cấp cho vũ khí đang chọn |
| Weapons > Mount / Unmount | gắn vũ khí vào tay trong scene để chỉnh pose (Capture) |
| **Weapons > Quét nền caro/viền sáng (chỉ báo cáo)** | (= Bảng điều khiển › Vũ khí › «Quét nền caro / viền sáng vũ khí») ĐO trước khi sửa: đếm pixel nền caro/matte sáng còn sót trong `Sprites/Weapons/Tier0..5/{Crossbow,Hammer,Trident}.png`, in từng file + số pixel ứng viên ra Console. KHÔNG ghi file. Cái thước |
| **Weapons > Sửa nền caro + viền trắng (3 họ, Tier0-5)** | (= Bảng điều khiển › Vũ khí › «Sửa nền caro + viền trắng», gắn cờ **ghi đè**) GHI ĐÈ 18 PNG của ba họ trên: bỏ pixel nền caro/matte sáng, giữ nguyên khổ · hướng · PPU · pivot của importer, **sao lưu bản gốc ra ngoài `Assets/`** trước khi ghi. Là tool sửa art ĐÃ XÁC NHẬN lỗi, không phải generator: không có `proof`, không bao giờ chạy trong nút «chạy lại hết». Bấm sau khi nút báo cáo ở trên chỉ đúng file |
| **Fortifications > Bộ chi tiết công trình lắp ghép (asset) · Tủ kính công trình lắp ghép (Demo_40) · Soi 4 loại × 40 seed** | **StructureKit**: bake bảng chi tiết (đế · thân · sàn · lan can · mái · deco · tầng · khối tường · trụ · cánh cổng) → dựng `Demo_40_StructureKit` (hàng tháp/nhà/tường/cổng lắp ngẫu nhiên theo seed, HUD đổi loại/seed/dựng lại, «Thả lính thử», soi collider + ô cắm) → thước chạy `Validate()` 160 kế hoạch. Art vẽ bù: `Fortifications > Art chi tiết công trình lắp ghép` |
| **Fortifications > 4. Sân thử ĐOÀN XE CÔNG THÀNH (Demo_41)** | 5 loại máy (phá cổng · lên tường · bắn đá · nỏ lớn · đại bác) trước một toà thành thật. Xem tổ máy tự vào GHẾ đẩy xe, mất người là xe dừng, tuyến quân đi cùng xe, xe lên tường cập bến rồi lính trèo. F9 xem ai là tổ máy |
| **Fortifications > 1. Create Fortress Scene** | dựng `Demo_21_Fortress`: rào chắn trung lập giữa đường · tường thành + cầu thang · cổng · tháp canh có thang; cung thủ đỏ tự leo lên trấn thủ, cận chiến xanh leo lên giết, thợ đỏ tự vá tường. API `CreateBarricade/CreateGate/CreateWall/CreateStairs/CreateTower` dùng lại được từ builder khác |
| Sprite Pivot Tool | đặt pivot sprite bằng click + gán vào prefab vũ khí/đạn |
| Cosmetics > Add SkinBinder to Selected | gắn bộ máy đổi hình từng bộ phận vào nhân vật (tự Rebuild Bindings) |
| Cosmetics > Create Default Parts from Selected | sinh 10 `CosmeticPart` hình gốc làm mốc — nhân bản rồi thay sprite là ra món shop |
| Cosmetics > Validate All Parts | quét mọi `CosmeticPart` xem sprite có đúng SỐ BONE không, chạy TRƯỚC khi đem bán |
| Cosmetics > Reset Selected to Default Look | trả nhân vật về hình nguyên bản |
| Effects > Build Effect Set (1 nút) | sinh sprite + prefab effect + bảng `EffectLibrary` (Resources) |
| Effects > Add Effect Manager to Scene | gắn bảng điều effect vào scene để chỉnh số / tắt effect |
| Inspector vũ khí > Bắt vị trí cầm | ghi chỗ nắm tay sau khi kéo vũ khí trong scene |
| Inspector EquipmentDefinition > Mặc thử / Capture | chỉnh vị trí nón/giáp/khiên bằng mắt |
| Archetypes > Build All Archetypes | 10 archetype: màu/tóc/nón/động tác/loadout riêng cho từng loại lính mọi mode (kèm `Worker` — nón lá + giỏ mây + rìu) |
| Animation > 1. Build Action Sets | 4 bộ động tác toàn thân (Soldier/Heavy/Agile/Boss) × 14 động tác |
| Appearance > 1..3 | **tóc/râu + nón** random cho nhân vật: sinh art tạm (8 món trang trí) → quét folder `Sprites/Heads/*` thành `AppearanceSet` (tự đo scale theo đầu) → gắn `StickmanAppearance` vào Fighter/Dummy. Thay art thật = thả PNG vào `Sprites/Heads/Decos` rồi chạy lại bước 2 |
| **Art > ★ Vẽ bù art còn thiếu bằng code** | PHƯƠNG ÁN DỰ PHÒNG khi hết token AI: chạy cả 7 generator ở chế độ **chỉ bù chỗ thiếu**. Art của bạn (tấm không mang nhãn «do code vẽ») KHÔNG bị đụng — bấm lúc nào cũng an toàn |
| **Art > Khoá art đang chọn** | đánh dấu tấm art bạn tự tìm/tự đặt là GIỮ TAY — mọi tool vẽ chừa ra vĩnh viễn |
| **Art > Gắn nhãn «do code vẽ» cho art hiện có** | chạy MỘT LẦN: cho phép tool vẽ lại đè lên art nháp đang có. Khoá tay art thật TRƯỚC khi bấm |
| **Art > Đếm art còn vẽ bằng code** | còn bao nhiêu tấm chưa phải art thật, nằm ở nhóm nào — con số này phải đi xuống |
| Civilizations > 1..3 | **15 nền văn minh trung cổ**: sinh art tạm (nón/giáp/khiên từng nền) → quét `Sprites/Civilizations/<Key>/` thành `Civ_*` (AppearanceSet + trang bị + 3 loadout) → dựng sân `Demo_19` hai phe đổi văn minh bằng nút ◀ ▶ |
| **Civilizations > 7. Dàn nhân vật theo nền văn minh** | dựng `Demo_37_CivRoster` — TỦ KÍNH: chọn nền → cả dàn quân chủng xếp hàng, diễn động tác lặp lại, bảng tên ghi TÊN FILE nón/giáp. Kéo ngang xem hết. Đây là chỗ soi art của cả 15 nền |
| **WWII > 1. Integrate AI Art (side tunic + battlefield)** | (= Bảng điều khiển › Nhân vật › «Art WWII — cắt sheet 5 nền vào intake») nhận ART THẬT đặt ngoài về: đọc sheet 5 cột ở `Assets/Art_Incoming/WWII`, bỏ nền caro bằng flood-fill từ mép, cắt theo hàng rồi ghi `Helm_*`/`Armor_*` + 8 vai súng vào `Sprites/Civilizations/WWII_{USA,UK,USSR,Germany,Japan}`, kèm phông `Sprites/WorldWarTwo/WWII_Battlefield_Backdrop.png`. **File đã có không bị đè** (luật nguồn asset). Chứng: `WorldWarTwoArtBuilder.Paths()` — nón + giáp của CẢ 5 nền, vì tool cắt theo CỘT nên hỏng một cột là một nền mặc đồ hiện đại giữa trận WWII mà không có lỗi nào báo |
| **Civilizations > 6. Soi bộ nón 15 nền** | ĐO chứ không nhìn suông: cỡ nón sau khi fit · phép đo vành có kẹp mép cửa sổ không · bóng ngoài nền nào TRÙNG nền nào · tấm nào còn là bản nháp khổ cũ. Không sửa gì, chỉ in bảng ra Console |
| **Civilizations > 12 + 13. Trim nón trong suốt** (= Bảng điều khiển › Nhân vật › «Soi trim nón» + «Trim nón trong suốt») | (2026-09-13) `Helm_*.png` của 15 nền là canvas 256×256 phần lớn trong suốt. **12** chỉ ĐO: cắt được bao nhiêu viền, tấm nào CHẠM MÉP (chỉ thêm được viền an toàn), tấm nào còn màu ẩn dưới alpha 0 → `Logs/HelmetTrimAudit.txt`. **13** GHI ĐÈ: trim theo alpha TỪNG tấm (chừa 4px), dời pivot + `*.headanchor.json` đúng số pixel đã bỏ nên nón KHÔNG nhảy chỗ trên rig, rồi **tự bake lại lớp mặt ngoài/mặt sau + đo lại cỡ nón** — bỏ bước bake là runtime vẫn đeo tấm 256×256 cũ và lượt trim không có tác dụng nào. ⚠ `proof` là `.txt` nhưng thứ ghi ra là PNG ⇒ phải khai `stage: RankArt`; và phải `skipStaleCheck` vì nút này ghi vào `Sprites/Civilizations` — đúng thư mục mà job «★ 15 nền văn minh» khai làm NGUỒN, để hai dòng không đá vàng qua lại vĩnh viễn. Chạy «Smoke trang bị trên dàn nhân vật» ngay sau. Nguồn: `StickmanHelmetTrimTool` |
| AI > 1. Create NPC Prefab | StickmanNPC.prefab (variant của Fighter) + AIProfile mặc định |
| AI > 2. Create AI Arena Scene | scene 2 phe tự đánh + kịch bản vệ sĩ bảo vệ VIP |
| AI > 3. Add Team Commanders to Scene | gom NPC theo phe → sở chỉ huy + cột mốc căn cứ + bảng lệnh + HUD F9 |
| AI > 4. Create AI Lab Scene | **PHÒNG THÍ NGHIỆM AI** (`Demo_8_AILab`): 34 bài test AI THUẦN (2 phe NPC, không người chơi) — săn địch · tuần tra · bảo vệ GIÁO SĨ · chỉ huy · tấn công/bảo vệ mục tiêu · combo · nhử vào bẫy phục kích · đỡ & phản đòn · cấp độ AI · tuần tra tuyến + phục kích · né bom & nấp · dân thường & chạy việc · tính cách · vây đánh thay phiên · khai thác · thầy thuốc · ứng biến vũ khí · quân dự bị · kỵ binh · tổ trưởng che chở · chia quân cứu nhà · đội hình thích ứng · **gục ngã & cứu đồng đội** (6v6 bất đối xứng: xanh mang `AIRescueModule`, đỏ không — nhìn quân số hai bên sau 30 giây) · **địa hình cao** (bài DUY NHẤT có tường + cầu thang hai bên + cung trấn thủ) · **kẻ hung thần** (hai trận giống hệt, một bên tắt `rampageTargetBonus` làm đối chứng — xem cả tuyến BỎ mấy đứa đứng gần để đi xử kẻ đang cày mạng) · **đấu tay đôi** (hai AI máu 40, đổi vũ khí / cấp AI từng bên, đọc nhịp dò → nhấp → thủ → phản đòn → dội) · **trại chiến trên MAP VÒNG** (hai tướng máy tự đánh MÃI, có hồi sinh — bài để NGỒI XEM mà chỉnh game) · **che chắn & yểm trợ** · **giữ hàng & đánh theo tổ** · **tầng niềm tin** (2026-09-16: hai tướng quân số y hệt, mỗi bên giấu một tổ MAI PHỤC, khác đúng `intelSightScale` — F9 cho thấy hai CÁN CÂN khác nhau ngay từ đầu, và cán cân của bên bị lừa nhảy một nấc khi mai phục bung ra) · **thể lực** (2026-09-16: búa chiến 3.5 kg 7.5 nhát tới kiệt so với kiếm 1.2 kg 13.3 nhát — hiệp đầu búa ăn đứt rồi chậm hẳn lại; cả hai phe bật `pressExhaustedBonus` nên AI chủ động dồn vào kẻ đang đuối). DROPDOWN trên HUD chọn bài (đổi bài = reload cho trạng thái sạch, chỉ bật đúng vùng đó), GIỮ nút ◀ ▶ (hoặc A/D) lia camera xem map, kéo chậm thời gian + bảng soi state NPC. Số AI từng bài nằm ở `Assets/Settings/AIProfiles_Lab/AIProfile_Lab_*` (tool ghi đè lại mỗi lần chạy — sửa số thì sửa trong `StickmanAILabBuilder.EnsureLabProfiles`) |
| — bài *Bảo vệ giáo sĩ* | **GIÁO SĨ** thay cho VIP cũ: trượng thánh (index 31 → `RoleForWeaponShared` xếp `UnitRole.Support` nên tự đứng SAU tuyến) · áo vải cấp `Levy` · profile `AIProfile_ThayThuoc` bật `healAmount`/`buffMaxHealth` nên module `AIHealerModule` có việc làm. Có **dáng BAN PHƯỚC** (`StickmanBodyAnimator.BlessStyle` — một STYLE của `Cheer`, `weight = 0` nên không bao giờ bị bốc ngẫu nhiên, đúng tiền lệ `SentryStyle`/`HelmStyle`). Khác VIP cũ ở chỗ nó ĐÓNG GÓP cho trận đánh nên có LÝ DO để bảo vệ, không chỉ là cái mốc phải giữ |
| AI > 5. Create AI Smarts Table | ghi lại `Assets/Resources/AISmartsTable.asset` — **bảng CẤP ĐỘ AI 5 bậc** (tân binh → chính quy → thiện chiến → lão luyện → cao thủ; mỗi bậc khai cả trễ nhận ra · nhịp suy nghĩ · cấp vũ khí · cấp lính) từ số chuẩn trong `AISmartsTable.DefaultLevels()`. Gán cấp: `_smartsLevel` trên `StickmanAgent`, hoặc nút «CẤP AI» (F3) đổi cả phe |
| AI > 6. Build AI Personalities | sinh **7 TÍNH CÁCH AI** (`Assets/Settings/AIProfiles/AIProfile_NhatGan|CuongChien|CanTrong|SatThu|SanTuong|RinhRap|HoVe`) + 2 học thuyết (`Doctrine_Defensive`, `Doctrine_Guerrilla`) từ số chuẩn trong `StickmanAIPersonalityBuilder`. Archetype builder tự gọi rồi gắn tính cách cho 10 archetype |
| AI > 7. Create Experience Table | ghi lại `Assets/Resources/ExperienceTable.asset` — **bảng KINH NGHIỆM & LÊN CẤP** (XP mỗi mạng + các mốc cấp: IQ / cấp vũ khí / máu) từ số chuẩn trong `ExperienceTable.DefaultMilestones()`. NPC nhận XP qua component `StickmanExperience` (AI > 1 tự gắn) |
| **AI > 9. Ninja & Canh gác** | sinh `AIProfile_Ninja` + `AIProfile_TowerGuard` + `Loadout_Ninja` + `AppearanceSet_Ninja` (mặt khăn trùm) và dựng `Demo_33_Infiltration`: ba chòi canh đi xuyên chân được, lính gác soi kẻ ẩn rồi hô báo động, 2 ninja trèo thang ám sát cung thủ rồi tụt xuống lấy đầu VIP (người chơi cũng là ninja). Tool tự chạy lại `Build Action Sets` vì cả bài xoay quanh dáng TRÈO |
| AI > 8. Build AI Playbooks | sinh **8 BỘ AI THEO GAMEPLAY** (`Assets/Settings/Playbooks/Playbook_Skirmish|FieldBattle|Siege|Defense|WarCamp|Duel|Stealth|Survival`): mỗi bộ gom vai trò→tính cách · học thuyết · cấp IQ · hệ số theo địa hình map. Gắn vào scene bằng `AIPlaybookBinder` (builder scene tự làm qua `StickmanDemoBuilder.AddPlaybookShared`). Số chuẩn trong `StickmanPlaybookBuilder` |
| AI > Add AI to Selected Fighter | gắn não AI cho nhân vật đang chọn trong scene |
| Audio > 1. Import SFX from Asset Pack | copy clip đã chọn từ gói SFX ngoài vào `Assets/Sounds/SFX` (kèm .meta để giữ GUID) |
| Audio > 2. Wire SFX to Prefabs | gắn clip vào 16 vũ khí · 6 loại đạn · giọng nhân vật · trang bị · bước chân |
| Audio > 3. Wire SFX in Open Scene | gắn tiếng nhặt cho vũ khí nằm dưới đất trong scene đang mở |

## Vỏ game — nhạc · thành tựu · hướng dẫn · ngôn ngữ · bàn đấu (2026-09-08)

| Tool | Việc |
|---|---|
| **Vỏ game & Công thức > ★ Dựng NHẠC · THÀNH TỰU · HƯỚNG DẪN · NGÔN NGỮ** | Một nút cho cả bốn bảng trong `Resources/`. Nhạc SINH BÙ bằng code (dự phòng) — file nhạc thật KHÔNG bị đè, đúng luật «chỉ vẽ bù» |
| **Vỏ game & Công thức > Bảng nhạc nền (+ sinh nhạc bù)** | 6 khí sắc: menu · chuẩn bị · giao chiến · nguy · thắng · thua. Kèm `Assets/Sounds/Music/PROMPT_nhac.txt` để đặt nhạc thật bằng Gemini |
| **Vỏ game & Công thức > Bảng thành tựu** | 12 mốc dài hạn nối vào bộ đếm có sẵn (giết · ván · thắng · phá thành · cứu người · số loại vũ khí) |
| **Vỏ game & Công thức > Sổ hướng dẫn người chơi** | 9 mẹo một câu, hiện ĐÚNG MỘT LẦN trong đời hồ sơ. Khác hẳn bảng «Hướng dẫn màn này» trong ngăn kéo gỡ lỗi — cái đó cho NGƯỜI LÀM GAME |
| **Vỏ game & Công thức > Bảng dịch (quét ngược từ code)** | Đọc mọi `Loc.T("key", "chữ")` trong `Assets/Scripts` rồi dựng bảng. Bản dịch đã điền KHÔNG bị xoá khi quét lại; hai chỗ cùng key khác chữ thì réo tên file |
| **Vỏ game & Công thức > Vá nhạc + bảng báo + la bàn vào scene** | Thả `MusicCue`, `MusicBattleDriver`, `NoticeBoard`, `CompassBar`, `ProgressTracker` vào MỌI màn CHƠI ĐƯỢC. Mỗi frame một scene; màn không có người chơi thì bỏ qua |
| **AI > ★ Bàn đấu tự động — cân bằng vũ khí (Demo_60)** | Dựng `Demo_60_BattleLab`. Mở scene → Play → mọi cặp vũ khí đấu 4 hiệp (đổi bên mỗi hiệp) → 2 file CSV ở `<gốc dự án>/Reports/`. Cột `tiLeThang` cho biết cây nào lệch |

Hai phép đo mới trong Doctor: **«Vỏ game CÂM»** (thiếu bảng nào) và **«Màn chơi được mà KHÔNG
có nhạc / bảng báo / la bàn»** (đọc YAML scene, không mở scene).

## Lệnh chạy ngoài Unity (`Docs/Tools/*.ps1`)

| Lệnh | Việc |
|---|---|
| `Docs/Tools/Verify.ps1 [-Changed <file>]` | **VÒNG KIỂM RẺ NHẤT**, không cần mở Unity: đồng bộ `.csproj` → `dotnet build` → soát bộ luật. Tách riêng "lỗi của bạn" khỏi lỗi phiên khác đang sửa dở |
| `Docs/Tools/AlgorithmLoop.ps1 [-NoRebuild] [-Filter X] [-Play]` | **SỬA THUẬT TOÁN XONG THÌ BẤM CÁI NÀY.** Dựng lại mọi scene default → đo lại bộ map + scene đã bake → **SO VỚI LẦN TRƯỚC**, in `ĐÃ SỬA ĐƯỢC · CÒN LẠI · ĐẺ THÊM`. Chỉ `ĐẺ THÊM > 0` mới trả mã khác 0, kèm tên map/scene và loại lỗi MỚI. Chạy trên bản clone nên không phải đóng Unity. Luật + bốn cái bẫy: [Tooling.md](Tooling.md) |
| `Docs/Tools/AgentContext.ps1 -Check` | soát liên kết + ngân sách của bộ tài liệu (chỉ sửa docs thì chạy cái này là đủ) |
| `Docs/Tools/ProjectMapStats.ps1 -Apply` | đo lại mọi ô `data-stat` trong `Docs/ProjectMap/index.html` — số liệu ghi bằng tool, không gõ tay |
