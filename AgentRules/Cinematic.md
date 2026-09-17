# ⚠⚠ TRƯỜNG QUAY — video quảng cáo MXH: AI tự diễn, camera tự quay, Recorder ghi .mp4 (2026-09-09)

> **Setup asset & quy trình bấm nút:** [Docs/KnowledgeBase/CinematicStudio.md](../KnowledgeBase/CinematicStudio.md).
> File này chỉ chứa LUẬT và BẪY.

User: *"quay video AI tự điều phối chơi thành video quảng cáo… dựng cảnh chiến tranh, dựng cảnh
ám sát rồi nó thực thi hành động, giống dựng phim vậy."* Hệ nằm ở module **Map (6)**
(`Assets/Scripts/Map/Cinematic*.cs`) vì nó cần `MapAssembler` + `MatchDirector`; phần ghi file ở
`Assets/Editor/Cinematic/StickmanCinematicRecorder.cs` (Unity Recorder 5.x, Editor-only).

⚠⚠ **CỠ GAME VIEW LÀ MỘT MẮT XÍCH RIÊNG** — `StickmanGameView` ép Game view về đúng khổ trước
khi ghi; thiếu nó thì phim đúng khổ trên giấy, sai khổ trên mắt. Chi tiết + vì sao phải dùng
reflection: [CinematicStudio.md](../KnowledgeBase/CinematicStudio.md).

### 1. Bảy mảnh, mỗi mảnh một câu

| Mảnh | File | Trả lời câu |
|---|---|---|
| **Kịch bản** `CinematicScript` (asset) | `CinematicScript.cs` · `CinematicTypes.cs` | quay CÁI GÌ: sân + hai đạo quân + **bảng phân cảnh** (`List<CinematicBeat>`) |
| **Đạo diễn** `CinematicDirector` | `CinematicDirector.cs` | chạy bảng phân cảnh: dựng sân (vai Observer, `HoldVerdict`), ra lệnh AI qua `TeamCommander.Issue`, giữ `timeScale` |
| **Máy quay** `CinematicCamera` + **lớp phủ** `CinematicOverlay` | `CinematicCamera.cs` · `CinematicOverlay.cs` | nhìn ĐÂU, rộng BAO NHIÊU, chuyển cảnh, kill-cam; thanh đen · tối/mở · thẻ tựa · phụ đề |
| **Dàn diễn viên** `CinematicCast` | `CinematicCast.cs` | "ai đang là vai X" + **chỗ nóng** (nhiệt của cú đánh/cái chết 1.5 s) + **mốc** (`CinematicCue`) |
| **Bảng phân cảnh mẫu** | `CinematicTemplates.cs` + `.More.cs` + `.Wave3.cs` · `CinematicLines.cs` | **28 cốt truyện** dựng sẵn + kho lời thoại theo thời kỳ |
| **Máy soạn** `CinematicAutoWriter` | `CinematicAutoWriter.cs` · `.Cuts.cs` | đọc asset ĐANG CÓ rồi tự viết kịch bản mới; rải chuyển cảnh; bốc kiểu nhìn; `CountCombinations` đếm kho tổ hợp |
| **Trục kịch tính** `CinematicStory` | `CinematicStory.cs` | cùng trận đánh, kể thành câu chuyện khác: kèo dưới · báo thù · phản bội · truyền thuyết · lời cuối |
| **Bộ phim nhiều tập** `CinematicSeries` | `CinematicSeries.cs` · `CinematicGallery.cs` | giữ cùng thế giới/hai phe, sinh nhiều tập seed nối tiếp và phát đúng thứ tự |
| **Thương hiệu** `CinematicBrand` | `CinematicBrand.cs` | logo chìm · tên kênh · thẻ cuối · dòng ghi công, khai MỘT chỗ cho mọi video |
| **Rạp chiếu** `CinematicGallery` | `CinematicGallery.cs` | xem/soạn phim NGAY TRONG GAME, chạy được trên điện thoại |
| **Thoại · tiếng · câm HUD** | `CinematicSpeech.cs` · `CinematicAudio.cs` · `CinematicHudSilencer.cs` | bong bóng nói · stinger 2D · tắt mọi giao diện |

Editor: `StickmanCinematicBuilder` (scene `Demo_72_Cinematic`, kho kịch bản để TRỐNG + máy soạn tự động ở
`Assets/Resources/Cinematics/`) · `StickmanCinematicWindow` (chọn · xem thử · QUAY) ·
`StickmanCinematicRecorder` (bật/tắt Recorder theo `playModeStateChanged`, quay cả MỘT MẺ hoặc một bộ nhiều tập).
Bảng điều khiển › tab **🎬 Trường quay**.

### 2. Luật

1. **SÂN LÀ SÂN CỦA GAME.** Kịch bản → `CinematicScript.BuildMap` → một `MapDefinition` tạm →
   `MapAssembler.Build(..., roleOverride: Observer)`. Không có "sân riêng cho phim", không spawn
   quân bằng tay: thứ quay được là thứ người chơi sẽ chơi, và mọi luật AI/rig/vũ khí áp dụng
   nguyên vẹn. Kịch bản chỉ được đổi CÁC TRƯỜNG có sẵn của `MapDefinition`/`ArmySpec`.
   Đã chốt cho phim: `wrapAround = false` (camera bám người bước qua mép là nhảy nguyên bề
   ngang), `escalation.enabled = false` (đúng số quân đã khai), `pitCount = 0`.
2. **AI KHÔNG BIẾT MÌNH ĐANG ĐÓNG PHIM.** Lệnh của kịch bản (`CinematicOrder`) đi qua
   `TeamCommander.Issue(CommandStance)` — đúng cửa người chơi bấm nút chỉ huy. Không thêm cờ
   "cinematic" vào `StickmanAgent`/state. Phe không có tướng (ám sát: phe B chỉ có sát thủ) thì
   lệnh rơi, cố ý — sát thủ tự chạy `AIStateInfiltrate`.
3. **GIÂY CỦA KỊCH BẢN LÀ GIÂY THẬT.** Mọi `seconds` đếm bằng `unscaledTime`; slow-motion chỉ
   đổi `Time.timeScale` của trận. `HitStop` trả về `HitStop.RestoreScale` (Core) — Director
   đặt số này mỗi lần đổi tốc độ; **chủ slow-motion phải trả về 1 khi xong** (`Teardown`).
4. **CỠ NHÌN KHAI BẰNG BỀ NGANG (unit), KHÔNG PHẢI `orthographicSize`.**
   `size = width / (2·aspect)`: khổ dọc 9:16 và ngang 16:9 thấy CÙNG bề ngang sân, chỉ khác
   phần trời/đất. Bảng mặc định: toàn cảnh `min(2·halfWidth, 30)` · lia 10 · bám 6 · chỗ nóng 8
   · zoom dí 4 · kill-cam 4.5. X kẹp trong mép map theo cỡ đang có.

   ⚠⚠ **TRẦN CỠ NHÌN TÍNH NGƯỢC TỪ SỐ PIXEL NGƯỜI CAO TRONG FILE** (`MinBodyPixels` = 105 ⇒
   `H = 0.73 · chiều-cao-file-px / 105`). Bản trước gõ cứng `MaxViewHeight = 22`: nhân vật cao
   **64 px** trên khung 1920, và **người dùng gửi ảnh chụp báo "không thấy nhân vật"** (2026-09-09).

   ⚠ **ĐƠN VỊ PHẢI LÀ PIXEL, KHÔNG PHẢI PHẦN TRĂM KHUNG.** Bản sửa đầu tiên khai "người chiếm
   6.2% chiều cao" — nghe hợp lý nhưng SAI ở khổ ngang: khung 16:9 chỉ cao 1080 px (khổ dọc cao
   1920) nên cùng 6.2% ra **39 px**, tệ hơn cả cái đang phải sửa. Người xem đo bằng mắt trên
   MÀN HÌNH, tức bằng pixel. Chiều cao file suy từ tỉ lệ: `1080 / min(1, aspect)` — đúng cho cả
   bốn khổ vì cả bốn đều có cạnh ngắn 1080.

   | khổ | trần cao | bề ngang thấy | người cao | (trước) |
   |---|---|---|---|---|
   | 9:16 | 13.35 unit | 7.5 unit | **105 px** | 64 px |
   | 4:5 | 9.39 | 7.5 | 105 | 45 |
   | 1:1 | 7.51 | 7.5 | 105 | 36 |
   | 16:9 | 7.51 | **13.4** | 105 | 36 |

   Đổi số này phải chạy «Tự kiểm luật chơi» (bài *khung hình đọc được trên điện thoại* — đo
   bằng pixel của file thật, không bằng phần trăm).

   ⚠ **PHẦN ĐẤT LỘ RA PHẢI CO THEO CỠ NHÌN** (`dirt = min(2.6, size·0.5)`). Bản trước kẹp
   `minY = groundTop − 1.2 + size` với hằng số 1.2 không co: cảnh càng rộng thì mặt đất càng
   bị đẩy sát đáy, còn ~10% khung là đất và phần còn lại là trời trống.

5. ⚠⚠ **ĐƯỜNG RAY CỦA MÁY QUAY LÀ DẢI CÓ NGƯỜI, KHÔNG PHẢI BỀ NGANG MAP.**
   `fromX`/`toX` của mọi cảnh không bám người là **tỉ lệ trên `CinematicCast.CrowdSpan`**.
   Đo theo bề ngang map thì cảnh toàn ngắm vào x = 0 — mà hai đạo quân đứng ở `lineAt ±0.55`
   của nửa map 26 unit (±14), nên ở khổ dọc (khung rộng ~7 unit) camera nhìn đúng vào **bãi
   đất trống giữa hai đạo quân**. Sân dựng đúng, quân đứng đúng, không lỗi nào báo.
   Hết người sống thì rơi về bề ngang map như cũ.
6. ⚠⚠ **KHUNG XEM THỬ PHẢI LÀ KHUNG SẼ GHI** (`CinematicFrame`). Máy quay cắt `Camera.rect`
   thành ô đúng tỉ lệ khổ video, canh giữa cửa sổ; Unity tự tính lại `Camera.aspect` theo ô đó.
   Không có bước này thì duyệt góc quay ở cửa sổ 16:9 rồi quay ra 9:16 là **cụt hai bên**, và
   chỉ phát hiện sau khi đã quay. Hai lớp chữ (`CinematicOverlay`, `CinematicSpeech`) đo theo
   `CinematicFrame.Gui` chứ không theo `Screen`, nếu không thanh đen bám mép CỬA SỔ thay vì mép
   VIDEO. Ô camera phải được TRẢ LẠI ở `OnDestroy` — quên là mọi thứ mở sau đó nhìn qua một khe hẹp.
7. **KHÔNG CÓ CAMERA THỨ HAI.** Director tắt `DemoCameraFollow` trong lúc quay và bật lại ở
   `Teardown`; `CinematicCamera` tự áp `CameraShake` (cùng công thức Perlin). Hai component
   cùng ghi `transform.position` một camera là hình giật — luật cũ ở Camera.md.
8. **MÀN HÌNH SẠCH = `StickmanUI.Filming`.** Cờ ở Core; `GameHudSuppressed` gồm nó, và những
   nút CỐ Ý không nghe `HudOpen` (⚙ `StickmanDevMenu`, ≡ `StickmanHudToggle`, đồng hồ
   `DayNightCycle`, đếm ngược `AreaHazard`, `ModePrompt`) phải hỏi nó ở dòng đầu `OnGUI`.
   Thêm một HUD tự nổi mới thì thêm dòng đó — một nút ⚙ ở góc video là quay lại từ đầu.
   Là CỜ chứ không phải PlayerPrefs: hết phim / thoát Play là về false.
9. **LỜI NHẮN EDITOR → PLAY ĐI QUA PLAYERPREFS** (`CinematicRequest`), đọc xong là xoá. Static
   thì Domain Reload xoá (bật) hoặc sống dai sang lần Play sau (tắt) — cả hai đều sai. Kịch
   bản gửi bằng TÊN trong `Resources/Cinematics/` nên kịch bản mới phải nằm trong đó (hoặc kéo
   tay vào `CinematicDirector._script`).
10. **KILL-CAM CÓ NHỊP NGHỈ 2.5 s** và chỉ bật ở cảnh có `killCam = true`. Hai cái chết liền nhau
   dí cả hai là giật cục; chỗ nóng đã kéo camera về đó rồi.
11. ⚠⚠ **`Assets/Editor` CÓ ASMDEF RIÊNG (`Xoi.Stickman.Editor`) NÊN PHẢI KHAI PACKAGE.**
   Thêm `Unity.Recorder.Editor` · `Unity.Recorder` · `Unity.Recorder.Base` vào `references` của
   `Assets/Editor/Xoi.Stickman.Editor.asmdef`, nếu không Unity báo
   `CS0246: RecorderController could not be found` dù package đã cài và `autoReferenced: true`
   (tự-tham-chiếu chỉ áp cho assembly định sẵn `Assembly-CSharp-Editor`, không áp cho asmdef).
   ⚠ Phép kiểm biên dịch tay **không bắt được** lỗi này nếu ném cả `Library/ScriptAssemblies` vào
   refs — phải tham chiếu ĐÚNG danh sách asmdef khai (xem memory `unity-compile-check-without-editor`).
12. **RECORDER KHOÁ FPS** (`CapFrameRate`): mỗi khung video là một bước thời gian cố định, máy
   yếu không rớt khung — Editor lúc quay giật là bình thường, xem file. Ghi vào `Recordings/`
   (ngoài `Assets/`, không commit). Recorder là package Editor-only: runtime KHÔNG import
   `UnityEditor.Recorder`.

13. **THOẠI LÀ CỦA MỘT NGƯỜI, KHÔNG PHẢI CỦA MÀN HÌNH.** Nhịp `Say` bám `Transform` của vai;
    vai chưa có hoặc đã chết thì câu đó **bỏ hẳn**, không dựng bong bóng lơ lửng giữa trời.
    Viền bong bóng lấy màu phe (`TeamMember.ColorOf`) — xem một giây biết ai nói, khỏi đề tên.
    Mốc treo bong bóng đo bằng `2.92 × lossyScale.y` (đúng công thức `StickmanAgent.BodyHeight`)
    chứ KHÔNG gõ cứng: gõ cứng là bong bóng chui vào mặt người to và bay lơ lửng trên đầu người bé.
    Bong bóng và lớp phủ đo bằng **pixel thật** và tự đặt lại `GUI.matrix`: cỡ chữ phải là một
    phần cố định của chiều cao khung hình ở mọi khổ, không theo cỡ giao diện của game.
14. **TIẾNG PHIM PHÁT 2D** (`CinematicAudio` → `StickmanAudio.PlayUi`) và **cúi nhạc nền** khi có
    cú nhấn. Phát 3D thì camera lia một cái là trống mở màn nghe lệch sang trái. Tiếng của TRẬN
    (kiếm, tên, bước chân) vẫn là 3D như cũ — lớp phim không đụng vào. Thiếu clip thì **im, không nổ**;
    Doctor «Tiếng phim đã sinh chưa» là chỗ báo. Sinh bằng Bảng điều khiển › Âm thanh › «Sinh tiếng BÙ».
15. **MÀN HÌNH SẠCH CÓ HAI LỚP.** Lớp một: cờ `StickmanUI.Filming` — mọi `OnGUI` phải hỏi ở dòng đầu.
    Lớp hai: `CinematicHudSilencer` tự tắt component **chỉ vẽ** (có `OnGUI`, không có `Update`) và
    **mọi `Canvas`**, rồi bật lại lúc dọn. Cái vừa vẽ vừa chạy logic thì **không được tắt** (tắt là
    hỏng trận đang quay) ⇒ bắt buộc tự có cổng; Doctor «HUD chưa câm khi quay phim» đếm đúng nhóm đó.
16. **MÁY SOẠN ĐỌC ASSET, KHÔNG CHÉP TÊN.** `CinematicAutoWriter` hỏi `MapLibrary.kits` (thời kỳ nào
    có trang bị), `MapLibrary.hordePrefab` (có bầy zombie không) và `CivilizationLibrary` (cặp nền
    văn minh). Không có bảng tên nào gõ cứng trong đó — thêm một nền văn minh vào dự án là số video
    dựng được tự lớn lên. Cùng `seed` ⇒ cùng kịch bản, **kể cả lời thoại**.
    **BẢY trục biến thiên**: cốt truyện (28) × thời kỳ có asset (≤4) × cặp nền văn minh CÓ THỨ TỰ
    (`n×(n−1)`) × **trục kịch tính** (6) × **kiểu nhìn** (ngang · 3/4) × **nhịp dựng** (3: dồn dập ·
    điềm đạm · trailer) × rải chuyển cảnh × hạt giống sân. `CountCombinations`
    in ra con số thật để câu «bao giờ hết kịch bản» có câu trả lời ĐO ĐƯỢC.
    ⚠ Cốt truyện nào mà ĐỊA HÌNH hay VÙNG ĐẤT là một nửa lý do cảnh đó quay được (hẻm núi phục
    kích · pháo đài tử thủ · núi lửa săn rồng · đầm lầy vết nứt) thì KHOÁ, không bốc lại.
17. **HAI PRESET PHÁT HÀNH.** `LandscapeLong` = 16:9 (1920×1080), phim dài **180–300 giây**;
    `PortraitShort` = 9:16 (1080×1920), Shorts/TikTok/Reels **59–60 giây**. Máy soạn chỉ co giãn
    đúng hai loại nhịp: cảnh `Action` và nhịp chờ dài — chúng là thời gian TRÔI. Cảnh `Action`
    khai `seconds = 0` được cấp ngân sách tối thiểu trước khi cân, nếu không nó chạy qua trong
    cùng một frame và làm file ngắn hơn phép đo. `WaitUntil` bắt được mốc sớm vẫn giữ phần thời
    gian còn lại của nhịp; mốc là điểm đồng bộ, không phải lệnh cắt cụt cảnh. Không đụng thẻ tựa,
    thoại, cú cắt: đó là bộ xương của phim. `Square11` và `Portrait45` là khổ tương thích cũ,
    không phải lựa chọn chính của quy trình mới.
18. **QUAY MỘT MẺ**: hàng đợi nằm ở `SessionState` (static chết theo Domain Reload mỗi lượt vào Play),
    và phim sau chỉ được bắt đầu ở `delayCall` **sau khi** Play mode thoát hẳn — phải chờ cả
    `isPlaying` lẫn `isPlayingOrWillChangePlaymode` đều `false`. Nút tạo series trong
    `OnGUI` phải chụp **path asset** rồi dùng `QueueDeferred` sau khi IMGUI kết thúc; đổi scene ngay
    trong sự kiện layout có thể huỷ wrapper `CinematicScript`, làm nổ `MissingReferenceException`
    và kéo theo `Invalid GUILayout state`.

19. ⚠⚠ **CHỮ ĐO THEO VÙNG AN TOÀN, HÌNH ĐO THEO CẢ KHUNG** (`CinematicFrame.Safe`).
    Khổ dọc bị nền tảng đè: cột nút mép **phải ~13%**, tên kênh + mô tả mép **dưới ~17%**,
    thanh trạng thái mép **trên ~5%**. Thẻ tựa · phụ đề · bong bóng thoại · logo phải nằm
    trong ô đó; trận đánh thì không. Mép an toàn suy từ **TỈ LỆ KHUNG** chứ không từ giá trị
    `CinematicAspect` — thêm một khổ mới không phải sửa bảng.
    ⚠ Đây là lỗi chỉ lộ ra **sau khi đăng**: trong Unity, trong .mp4 và trong mọi trình phát
    trên máy tính, chữ vẫn hiện đủ. Lúc XEM THỬ có hai vạch xanh vẽ ranh giới; lúc QUAY thì không.

20. **THƯƠNG HIỆU KHAI MỘT CHỖ** — `Resources/Cinematics/Brand.asset` (`CinematicBrand`).
    Logo chìm · tên kênh · thẻ cuối · dòng ghi công. ⚠ Không nhét vào kịch bản: máy soạn đẻ ra
    hàng trăm `Cine_Auto_*` và người dùng còn xoá cả lô đi soạn lại — logo nằm trong đó là mất
    theo. Nút «Dựng lại trường quay» **không ghi đè** asset này.

21. **TRỤC KỊCH TÍNH LÀ TRỤC THỨ NĂM VÀ QUAN TRỌNG NHẤT** (`CinematicStory`).
    Bốn trục kia đổi SÂN · ÁO · NHỊP; trục này đổi **lý do người xem muốn một bên thắng**.
    Mỗi trục làm đúng ba việc: lệch cán cân · chèn chữ/thoại ở ba mốc · đổi cái kết. KHÔNG
    đụng cốt truyện (hai trục nhân nhau) và KHÔNG chèn cảnh quay (đó là việc của `ApplyRhythm`).
    ⚠ `CanApply` phải từ chối ghép sai: "kèo dưới" áp lên song đấu là chia quân số cho 0 người,
    "phản bội" cần một ông tướng để ra lệnh rút mà loạn chiến / vòng bo / bầy zombie không có.

22. **CHUYỂN CẢNH: MÁY CHỈ RẢI LÊN CÚ CẮT CÒN TRỐNG.** `Fade`/`Glide` khai tay là ý đồ người
    viết — `DressTransitions` chỉ đụng những cú còn để `Cut`, nên sửa mẫu bằng tay luôn thắng
    máy. Cú cắt ngay sau thẻ tựa giữ nguyên (thẻ đã che cú nhảy rồi). Lia vụt (`WhipPan`) phải
    có tiếng vút đi kèm, không thì tai nghe ra "hình lỗi"; trong pipeline tự động ưu tiên `Glide`
    và chỉ để `WhipPan` hiếm. `CinematicCamera` phải dùng easing + trần tốc độ, không lùi ngược
    rồi lao tới đích; rung được cộng sau vị trí nền để không tích lũy thành giật.

23. ⚠⚠ **SÂN 3/4 (`ViewPlane.Ground`): TRỤC Y LÀ XA/GẦN, KHÔNG PHẢI ĐỘ CAO.**
    Máy quay đọc `CinematicCamera.BaseY` để dịch giữa hai nghĩa; cảnh không bám người phải
    có `size ≥ HalfDepth·1.05` (không thì nửa sân phía xa không bao giờ lọt khung) và Y kẹp
    trong `[NearEdge+size, FarEdge−size]`. Áp luật "mặt đất ở 1/5 dưới khung" của sân ngang
    vào đây là camera dí sát mép GẦN rồi ở nguyên đó — quân đánh nhau ngoài khung, không lỗi nào báo.
    ⚠ `CinematicScript.MakeGroundField` tắt bục/thang/hố/đồi/nối vòng và đặt `cameraSize` theo
    bề sâu: kịch bản dựng `MapDefinition` **bằng tay** nên KHÔNG đi qua `MapGenerator.ApplyGroundPlane`.
    ⚠ `Fill` phải TRẢ `plane` về `Side` mỗi lần đổ mẫu, nếu không đổi từ «Ẩu đả» sang một cốt
    truyện có tường là dựng bục trong sân không trọng lực.
    Cốt truyện nào quay được ở 3/4: `CinematicAutoWriter.CanFilmOnGround` (mọi thứ sống bằng
    CHIỀU CAO — công thành, tử thủ trên tường, hầm nhiều tầng, rồng bay — ở lại sân ngang).

24. **RẠP CHIẾU CHẠY Ở RUNTIME** (`CinematicGallery`) nên có mặt trong bản build điện thoại;
    nó bật `CinematicDirector.ShellPresent` ở `Awake` để Đạo diễn không tự chạy đè lên menu.
    ⚠ Về menu phải gọi `Dismiss()` chứ không phải `Stop()`: `Stop` để nguyên khung hình cuối và
    **`StickmanUI.Filming` vẫn bật**, nên mọi giao diện — kể cả cái rạp — vẫn câm, và người ta
    ngồi chờ menu hiện ra mãi mãi. ⚠ Rạp KHÔNG ghi được .mp4: Recorder là package Editor-only.

25. ⚠⚠ **KHUNG HÌNH ĐO TỪ ĐÁY VÙNG AN TOÀN, KHÔNG PHẢI ĐÁY KHUNG.** Luật 19 nói CHỮ; luật này
    nói HÌNH. Ở khổ dọc, mặt đất đặt cách đáy KHUNG một quãng `dirt` là nó rơi đúng vào dải 17%
    mà nền tảng phủ tên kênh + mô tả lên ⇒ **bàn chân của cả trận đánh nằm sau chữ của YouTube**.
    Máy quay trừ thêm `2·size·bottomInset` (xem `CinematicCamera.BottomInset`). Trong file .mp4
    vẫn thấy đủ, nên lỗi này chỉ lộ ra sau khi đăng.

26. **THANH ĐEN CHỈ DÀNH CHO KHỔ NGANG** (`CinematicFrame.LetterboxFor`, ngưỡng tỉ lệ 0.95).
    Letterbox là ngôn ngữ của 16:9 — cắt nó thành 2.35:1 cho ra vẻ điện ảnh. Ở 9:16 nó ăn
    **15% chiều cao** của đúng cái khổ mà chiều cao là tài sản duy nhất, và ăn CHỒNG lên dải
    nền tảng vốn đã che.

27. ⚠⚠ **KHÔNG MỘT KHUNG HÌNH GIAO DIỆN NÀO ĐƯỢC LỌT VÀO FILE.** `Run()` nhả một frame trước
    khi dựng sân, nên nếu cờ `StickmanUI.Filming` bật trong coroutine thì **một frame menu Rạp
    phim nằm ở đầu MỌI file .mp4** — Recorder bấm ghi ngay lúc `EnteredPlayMode`, cùng frame với
    `Director.Start`. Cờ phải bật ĐỒNG BỘ trong `Play()`, và `CinematicGallery.OnGUI` hỏi thêm
    `CinematicRequest.Recording` làm lớp chặn thứ hai.

28. **THƯƠNG HIỆU PHẢI SỐNG ĐƯỢC LÚC MỞ HỘP.** `Brand.asset` sinh ra kèm một logo VẼ BÙ
    (`StickmanCinematicBrandArt`) — không có nó thì tính năng chết trong im lặng: asset có,
    phim quay xong, chỉ là không video nào có logo. Tấm vẽ bù **không bao giờ ghi đè** file đã
    có và không gán đè ô `watermark` đã có hình; Doctor «Logo chìm của video còn trống» réo khi
    thiếu. Art thật vẫn đi đường đặt hàng (AssetGeneration.md) — đây chỉ là chỗ trám.

29. ⚠⚠ **DÒNG NHẮC TRÊN MÀN HÌNH LÀ MỘT LỜI HỨA — CODE PHẢI GIỮ.** `Finish()` đặt
    `_run = null` ngay khi phim hết, mà đúng khoảnh khắc đó lớp phủ ghi *"HẾT — R quay lại"*;
    van `if (_run == null) return;` ở đầu `Update` biến dòng chữ ấy thành lời nói dối — màn hình
    đen, phím R chết, không còn đường ra ngoài trừ tắt Play. Không lỗi nào báo vì mọi mảnh đều
    đúng, chỉ có cái van đóng sai lúc. Nay phím **R xét TRƯỚC van**; Esc/Space vẫn nằm sau (chúng
    chỉ có nghĩa khi phim đang chạy). Thêm phím mới thì hỏi: *nó có nghĩa lúc phim ĐÃ HẾT không?*

30. **MỖI LẦN XEM MỘT PHIM KHÁC** (`CinematicDirector._randomEachPlay`, mặc định BẬT): bấm Play
    trong scene hay bấm R đều **soạn một kịch bản mới** thay vì tua lại bản gán sẵn — cửa "vô
    tận kịch bản" cho người không mở cửa sổ Trường quay. `PlayRandom` **in SEED ra Console**: gặp
    bộ hay thì đó là đường duy nhất tìm lại nó (dán seed vào ô «Hạt giống sân»).
    ⚠ Đường **QUAY** không bao giờ ngẫu nhiên: có `CinematicRequest` thì chạy đúng kịch bản đó,
    và khổ lấy từ asset chứ không theo cửa sổ Editor (`AspectForScreen` chỉ dùng cho đường XEM).
    ⚠ Xem thử xong thì **mở màn lại** để thấy cái sân sau trận; lúc GHI thì không — màn đen là
    khung hình cuối của phim, mở lại là dán mấy khung sân trống vào đuôi file .mp4.

31. ⚠⚠ **MỖI VIDEO LÀ MỘT CÂU HỎI VÀ MỘT CÂU TRẢ LỜI.** Mở màn là **câu móc** dựng từ SỐ LIỆU
    thật của kịch bản (`CinematicBlurb.Hook` — "20 NGƯỜI vs 20 NGƯỜI — AI CÒN ĐỨNG?"), kết là
    **thẻ kết quả thật** (`BeatKind.Verdict` — đọc `MatchDirector.Outcome` + `CinematicCast`).
    Thiếu vế đầu thì người xem không có lý do ở lại; thiếu vế sau thì họ xem xong không biết vừa
    xem cái gì — và đó là toàn bộ sức hút của thể loại "AI tự đánh".
    ⚠ Câu móc là `Caption` chứ không phải `Title`: thẻ tựa CHẶN nhịp và che nửa khung, mà giây
    đầu không được đứng hình. `Caption` cũng không tính vào `EstimatedSeconds` nên nó **miễn phí**.
    ⚠ Thẻ kết quả **không được bịa**: chưa có phán quyết thì nói tình hình đang có
    ("12 · 3 còn đứng"), vì người xem đếm được người còn đứng ngay trong khung hình đó.
    ⚠ Nó đứng TRƯỚC thẻ logo — người ta tới để biết ai thắng, không phải để xem tên hãng.

32. **CHỮ ĐỂ ĐĂNG BÀI SINH KÈM FILE .mp4** (`WriteUploadNotes` → `<tên video>.txt`: tựa · mô tả ·
    hashtag · thông số). Quay mười phim rồi ngồi gõ mười cái tựa là chỗ người ta bỏ cuộc, mà máy
    đã biết đủ để viết. Ghi NGAY lúc bắt đầu quay (dừng giữa chừng vẫn còn chữ), UTF-8 **có BOM**
    (mở bằng Notepad — ngoại lệ có chủ ý so với luật không-BOM của mã nguồn; file không nằm trong repo).
    ⚠ Chữ trong phim và chữ đăng bài dùng CHUNG `CinematicBlurb` — hai bản chép tay thì tựa video
    và câu móc trong video sẽ nói hai chuyện khác nhau.

33. ⚠⚠ **KHỔ DỌC = LUẬT SHORT-FORM** (`CinematicScript.IsShortForm`). Shorts/TikTok/Reels chấm
    bài bằng **tỉ lệ xem hết** và **tự phát lại**. Hai preset chính đổi theo khổ; khổ tương thích cũ
    vẫn giữ khuôn riêng để asset cũ không bị kéo dài bất ngờ:

    | | khổ preset dọc 9:16 | khổ cũ 4:5 / vuông | ngang 16:9 |
    |---|---|---|---|
    | khuôn thời lượng | **59–60 s** | 22–38 s | **180–300 s** |
    | khối kết (kết quả + logo + tối màn) | **≤ 4.3 s** | đầy đủ | đầy đủ 6.5 s |
    | cú mở màn | **≤ 0.35 s** | như khai | như khai |

    `Portrait45` và `Square11` chỉ là khổ tương thích cũ; chúng không phải preset mới.

    ⚠ Suy từ KHỔ chứ không thêm một enum "nền tảng": hai ô cấu hình nói cùng một chuyện là hai ô
    sẽ có ngày mâu thuẫn (chọn 9:16 mà quên đổi "nền tảng" ⇒ video dọc 50 giây, đuôi 6.5 giây).

    ⚠ **CÚ MỞ MÀN ĂN MẤT ĐÚNG CÁI CỬA SỔ QUYẾT ĐỊNH.** Thứ giữ người xem nằm trong ~1.5 giây đầu,
    mà bản trước tiêu 1.2 giây trong đó để mở ra từ màn hình ĐEN: gần hết cửa sổ ấy không có gì
    trên màn hình. Ở rạp đó là mở màn; trên điện thoại đó là một video "không có gì".

    ⚠ **ĐUÔI DÀI GIẾT VÒNG LẶP.** Khối kết cũ 6.5 s là 22% của một video 30 giây dành cho phần
    SAU KHI trận đã xong. Giữ thẻ kết quả (đó là câu trả lời của cả phim), bóp phần thương hiệu,
    bỏ dòng ghi công ở khổ dọc — nó vẫn còn nguyên trong file `.txt` đăng bài.

    ⚠ `EstimatedSeconds` **phải đếm `BeatKind.Verdict`**: nó giữ màn hình 2.4–3 giây thật, quên
    nó là khuôn thời lượng nói dối đúng ngần ấy và mọi video dài hơn khoảng đã chốt.

34. ⚠⚠ **CHỖ NÓNG BÁM MỘT CỤM, KHÔNG LẤY TRUNG BÌNH.** Bản trước cộng mọi điểm nhiệt rồi chia:
    có HAI ổ đánh nhau ở hai đầu sân thì trung bình rơi vào **khoảng đất trống ở giữa** — camera
    ngắm chỗ không có ai trong khi cả hai ổ đều đang có chuyện để quay. Càng đông quân càng nhiều
    ổ, tức nó hỏng nặng nhất đúng lúc phim đáng xem nhất, và không báo gì. Nay: lấy điểm nóng
    NHẤT làm tâm rồi chỉ trung bình các điểm trong bán kính `ClusterRadius` (5 unit ≈ một cảnh cận).

35. ⚠⚠ **KHUNG PHẢI CÓ NGƯỜI — van tự chữa cuối cùng** (`CinematicCast.AnyAliveInside`).
    Mọi phép chọn chỗ đều có thể ngắm hụt: vai đang bám vừa chết, ổ đánh nhau vừa tan, kịch bản
    khai `fromX` trỏ ra rìa. Khi đó khung vẫn đúng luật và camera vẫn mượt — chỉ là **không có ai
    trong đó**. Van hỏi thẳng "trong khung sắp tới có ai còn sống không", không có thì kéo về
    người gần nhất, TRỄ 0.35 s để một người đi ngang mép khung không làm camera giật.
    ⚠ Đây là van CUỐI, không phải chỗ chữa nguyên nhân: thấy nó phải làm việc liên tục thì lỗi
    nằm ở phép chọn chỗ phía trên.

36. **BÌNH LUẬN THEO DIỄN BIẾN** (`CinematicPlayByPlay`) — phim nói ra thứ vừa xảy ra trong chính
    trận nó quay: chủ tướng ngã · một mình ba mạng · còn một người · vỡ trận · lật kèo. Ba luật:
    **chỉ nói thật** (mỗi câu buộc vào một phép đo), **nói ít** (mỗi loại một lần, cách nhau ≥5 s),
    **im từ thẻ kết quả trở đi** (đừng đè lên câu trả lời của bộ phim).
    ⚠ Chuỗi hạ tính bằng `CinematicCast.KillerFrom(info)` — **không** đọc `_lastKiller`: cú chết
    không có nguồn (rơi vực, cháy) giữ nguyên giá trị cũ ⇒ gán nhầm mạng cho người khác, và bảng
    "một mình ba mạng" đếm sai trong im lặng.
    ⚠ Là phụ đề nên không chặn nhịp, không che khung, không tính vào thời lượng — nó không bao
    giờ làm vỡ khuôn 59–60 giây.

37. **BẢNG TỈ SỐ SỐNG là NỘI DUNG, không phải giao diện game** — ngoại lệ có chủ ý của luật «màn
    hình sạch», tắt được ở `CinematicBrand.showTally`. Câu móc hỏi *"ai còn đứng?"*; bảng này là
    chỗ người xem theo dõi câu trả lời hình thành.
    ⚠ **MỘT SỐ hay HAI SỐ là chuyện của kiểu chơi.** Loạn chiến và battle royale chia mỗi người
    một phe, nên đếm theo "phe 1 · phe 2" ra **"1 · 0" giữa một sân mười sáu người** — một con số
    nói dối ngay giữa khung hình. Nhận ra bằng PHÉP ĐO (tổng người sống lớn hơn hẳn tổng hai phe
    khai) chứ không bằng danh sách `MissionType`, để kiểu chơi mới cũng đúng.

38. **MỖI BẢN TỰ SOẠN PHẢI CÓ MẠCH 5 HỒI** (`CinematicAutoWriter.Story`). Storyboard mẫu cung
    cấp hành động thật; lượt biên tập đọc các mốc đó rồi nối thành **móc → mục tiêu → va chạm →
    bước ngoặt → cao trào → kết quả** bằng logline, câu hỏi trung tâm, Caption, Music và Sfx.
    Cảnh Action quá dài ở preset ngang được chia thành montage Action–cutaway–Action, giữ nguyên
    tổng giây nhưng đổi góc nhìn và điểm nhấn âm thanh; không sinh chữ ngẫu nhiên rời cảnh, không
    bịa người thắng.
    `CinematicScript.logline` và `storyQuestion` là metadata dùng chung cho Inspector và file
    `.txt` cạnh video; lựa chọn câu vẫn đi theo seed để cùng một hạt giống dựng lại cùng một
    ý đồ. Tập series giữ logline của bộ, còn trận và nhịp chiến đấu được sinh mới.
    Sau Story, `CinematicAutoWriter.Visuals` bù coverage còn thiếu (Establishing → PanAcross →
    Follow → PunchIn, thêm Static cutaway cho phim ngang) và soundscape mở/mốc kết; các shot mới
    vẫn qua `FitDuration`, nên hình ảnh nhiều hơn mà không vượt khuôn 59–60 s hoặc 180–300 s.
    `CinematicLook` đọc `CinematicScript.visualMood` để phủ ambient wash, vignette, grain và
    pulse theo Sfx/Shake/SlowMo. Đây là GI-lite tương thích Built-in RP; GI/2D Light thật vẫn
    thuộc hệ Lighting URP tùy chọn và chỉ được bật bằng tool cài đặt render.

39. **AI CHỈ ĐƯỢC LẮP QUA JSON CÓ CẤU TRÚC** (`CinematicAiBridge`). Cửa sổ Trường quay có hai
    đường viết: `Algorithm` chạy offline theo seed, hoặc `Ai` sao chép prompt rồi nhập JSON
    storyboard từ AI. Cầu AI phải kiểm tra `kind`/enum, giới hạn tối đa 96 nhịp, tự bổ sung
    `Title`/`Verdict`/`End` nếu thiếu và gọi `AutoRepairForProfile` trước khi asset được quay. AI chỉ
    viết ý đồ, chữ, nhịp, `visualMood` và `setPreset`; map, đội hình, kết quả thắng thua và thời
    lượng cuối vẫn do dữ liệu thật của Unity quyết định. Quy trình nâng cao có hai bước rõ ràng:
    prompt dàn ý 6 hồi trước, prompt storyboard sau khi người dùng duyệt dàn ý; không coi một
    danh sách shot ngẫu nhiên là kịch bản hoàn chỉnh. Không đặt API key hay lời gọi mạng vào
    runtime/game.
    **Khối `setting` (2026-09-12, user: "nhập kịch bản thì dựng đúng bối cảnh"):** JSON được
    khai thêm bối cảnh — `scenario` · `genre` · `plane` · `aspect` · `civA/civB` (TÊN THẬT
    trong `CivilizationLibrary`, khớp gần đúng) · `soldiersA/B` · `night` · `weather` · `seed`.
    Cầu kiểm HẾT rồi mới áp (một tên sai = từ chối cả storyboard kèm danh sách tên đúng, không
    để lại asset đổ dở); áp thì đi đường thật: `CinematicTemplates.Fill` đổ sân,
    `CinematicAutoWriter.ApplyGroundPlane` chuẩn hoá 3/4 (chỉ cho cốt truyện `CanFilmOnGround`),
    đội hình CO GIÃN giữ hình dáng mẫu (ô 0 giữ 0 — ám sát không tự mọc cung thủ). `scenario`
    rỗng = không có khối (JsonUtility luôn dựng object mặc định cho field vắng mặt — đừng kiểm
    null). Quy trình nhập kịch bản từ user: skill `stickman-story`.

40. **PRESET PHIM TRƯỜNG PHẢI ĐI QUA MAP THẬT** (`CinematicSetPresets`). `Auto` giữ hành vi
    bốc cũ; preset cụ thể chỉ ghi các trục `MapBiome`/`TerrainStyle`/`WeatherKind`/đêm-ngày và
    grade vào `CinematicScript`, sau đó `BuildMap` vẫn dùng `MapAssembler`. Không tạo scene phim
    riêng, không gắn art giả trong Director. Timeline đạo diễn (`CinematicDirectorWindow`) dùng
    `CinematicPreflight` để đo trước Title/Establishing/Action/Verdict/End, cue âm thanh, preset,
    series và khuôn 59–60 s hoặc 180–300 s; nút `AutoFix` phải gọi
    `CinematicAutoWriter.AutoRepairForProfile` để tự thêm nhịp bắt buộc, cấp thời lượng và cân
    khuôn. Không bắt người dùng sửa từng dòng; pass phải idempotent và giữ nội dung đã có.

41. ⚠⚠ **NHÓM MÓC LÀ BẤT KHẢ XÂM PHẠM** (2026-09-12, user: *"cốt truyện rời rạc"*). Mọi mẫu mở
    bằng `Shot(Follow/PunchIn, 0 s, X)` → tiếng → `Say(X)` → chờ. Lượt bù coverage cũ chèn lia
    ngang ở `firstShot + 1`, tức GIỮA cảnh bám và câu thoại: camera bỏ người nói đi lia sân trong
    lúc bong bóng còn treo — rời rạc từ giây thứ hai, không phép đo nào báo vì mọi nhịp vẫn chạy.
    Mọi cảnh do máy chèn (toàn cảnh · lia · bám · dí · «thứ đang giành») đi qua
    `CinematicAutoWriter.AfterOpeningGroup` (đứng SAU nhóm móc — kể cả đoạn đối đáp hai cận —
    và sau thẻ tựa), `LeadActor` (va chạm nhìn qua NGƯỜI DẪN CHUYỆN của cốt truyện: xe hàng ·
    sát thủ · võ tướng · mũi nhọn) và `ClimaxActor` (dí vào người gánh cao trào). Cutaway của
    montage phim ngang bám VAI THẬT xoay vòng (mũi nhọn địch · người gánh cao trào · mũi nhọn ta
    · chủ tướng địch), không bám `None` — bám `None` là rơi về đúng chỗ nóng đang nhìn, tức một cú
    "lia vụt sang cùng một chỗ" mỗi 14 giây. Cảnh «thứ đang giành» là `Follow · Contested` đặt
    TRƯỚC cao trào (cái giá → gương mặt → đòn), không phải `Static` (cảnh đứng yên đọc `fromX`,
    bỏ qua `actor`) và không đặt sau cao trào ngay trước thẻ kết quả.
    Đo: «Tự kiểm luật chơi» bài *ngữ pháp dựng* — câu thoại móc của sát thủ / võ tướng / chủ
    tướng phải nằm trong cảnh bám đúng người đó.

42. ⚠⚠ **CÚ CẮT THEO QUÃNG ĐƯỜNG THẬT, KHÔNG THEO XÚC XẮC** (user: *"camera chuyển cảnh chưa
    logic"*). Hai tầng:
    · **Máy soạn** (`DressTransitions`) chọn theo QUAN HỆ hai cảnh, không còn `rng` 10/6/18%:
      vào cận → Flash · bung rộng >1.6× → Glide · cảnh RỘNG sau ≥4 cú → Wipe (không quét vào mặt
      người) · cận người này → cận người khác → Cut đối đáp (sau một cú dí → WhipPan, hiếm) ·
      cùng người chỉ đổi cỡ → Glide · hai cảnh chỗ nóng liền → Glide · còn lại → Cut.
    · **Máy quay** (`CinematicCamera.DecideTransition`, hàm thuần) xét quãng đường lúc `SetShot`:
      Glide/WhipPan mà `quãng ÷ trần tốc độ > 45% thời lượng cảnh` (cảnh 0 s tính 2.5 s) là
      KHÔNG TỚI ĐÍCH ⇒ đổi thành Cut — bản trước bay 4 giây qua bãi đất trống cho một cảnh 2 giây;
      Cut sang khung cách <1.6 unit với cỡ lệch <1.35× là NHẢY HÌNH ⇒ đổi thành Glide.
      Flash · Fade · Wipe là cú cắt có lý do nhìn thấy được — giữ nguyên.
    Đổi số nào thì chạy lại bài *ngữ pháp dựng* (bốn cặp vào/ra cố định).

43. **NGƯỜI NÓI PHẢI Ở TRONG KHUNG** (`CinematicCamera.Glance`). Bản trước bong bóng thoại bám
    người ở NGOÀI khung, `CinematicSpeech` kẹp nó vào mép vùng an toàn: người xem đọc một câu
    của ai đó không có mặt trên màn hình. Nay mỗi `Say` Đạo diễn hỏi máy quay; người nói chưa
    trong 82% khung thì LƯỚT sang (không cắt), bề ngang ≤7, giữ đúng thời gian đọc câu
    (`CinematicSpeech.ReadTime`) rồi về cảnh đang quay. Ưu tiên dưới kill-cam; đổi cảnh hoặc
    người nói ngã là hết liếc. Kèm: bình luận theo diễn biến đợi `CinematicOverlay.CaptionBusy`
    (`ShowCaption` THAY câu cũ — đè lên câu móc là mất một trong hai), và `HasCaptionNear` đo
    thêm GIÂY phim (≥4 s) chứ không chỉ đếm nhịp — ba nhịp lệnh 0 giây từng làm năm lượt viết phụ
    đề cùng thấy "chỗ này trống".

44. **NHÂN VẬT CÓ TÊN KHÔNG PHẢI NGƯỜI SINH THÊM** (2026-09-12, user: *"kịch bản có nhân vật
    chính"*). `CinematicScript.hero` / `.nemesis` (`CinematicCastMember`: tên · danh hiệu · vai
    NEO · lookTag/lookSeed · nhân máu). Đạo diễn `BindPrincipals` SAU hai frame chờ quân `Start`:
    lấy đúng người đang giữ vai neo (ChampionA, CommanderB…), đặt tên · khoác `StickmanLook`
    (`locked`) · `SetMaxHealth` · treo bảng tên (`CinematicSpeech.Tag`, dưới chân, viền màu phe),
    rồi `CinematicCast.Bind`. Từ đó vai `Hero`/`Nemesis` dùng như mọi vai; nhiệt kế trận ×1.6 khi
    dính tới họ; kill-cam dí cái chết của họ **kể cả cảnh không bật killCam**; thẻ kết quả nói
    thêm số phận hero; bình luận gọi đúng tên (`{HERO} SẮP NGÃ` · `ĐÃ NGÃ` · `MỘT MÌNH BA MẠNG`).
    ⚠ Vai neo phải là NGƯỜI (`CinematicCastMember.IsPersonAnchor`) — neo vào nhà chính là bỏ qua
    có cảnh báo. Vai neo không có ai trên sân (cốt truyện không sinh võ tướng) thì phim chạy tiếp
    không có nhân vật ấy; `HeroDown` chỉ báo khi ĐÃ gắn được.
    Mốc mới: `HeroDown` · `NemesisDown` · `HeroHurt` (<35% máu) · `LastFew` (≤ max(4, 20%)) ·
    `LandmarkLost` — cao trào canh theo chuyện thật, không theo giây đoán.

45. **CAMERA NGẮM ĐƯỢC NƠI CHỐN** — vai `CinematicActor.Landmark` + `CinematicBeat.landmark`
    (`CinematicLandmark`: Gate · Tower · Wall · Barricade · Village · Prison · Flag · Depot ·
    HighGround · BreachPoint · Chokepoint). `CinematicCast.FindLandmark` đọc `Fortification.All` ·
    `MapObjective.All` · `MapEventMarker.All` của map VỪA DỰNG — không bảng toạ độ; nhiều cái cùng
    loại thì lấy cái CÒN ĐỨNG gần tâm đám đông. Map không có mốc ⇒ vai null ⇒ camera rơi về chỗ
    nóng (van «khung phải có người» vẫn chạy). Đạo diễn đặt `CurrentLandmark` ở nhịp `Shot`
    TRƯỚC `SetShot` — mốc `LandmarkLost` đo trên chính mốc ấy ("trước có, giờ không").
    Doctor «Kịch bản phim nối đủ chỗ» có thêm cặp `CinematicLandmark ↔ FindLandmark`.

46. **KÉO LÙI · LAO VÀO** (`ShotKind.Reveal` / `Rush`): bề ngang chạy `widthFrom → width` theo
    `seconds` (Reveal: cận 4 → toàn sân; Rush: toàn sân → cận 4), tâm bám vai/mốc, không có thì
    chỗ nóng. ⚠ Cảnh CHẠY theo thời lượng — 0 s là đứng im ở khung mở; `EnsureBeatDurations` cấp
    5.5 s / 2.8 s. Máy soạn: phim NGANG mở hồi BÀY bằng `Reveal(LeadActor)` và vào cao trào bằng
    `Rush(ClimaxActor)` thay punch-in; khổ dọc giữ nguyên (lùi ra là người thành hạt vừng — luật 4).
    Preflight tính Reveal là "đã bày nơi chốn" và Reveal/Rush là cảnh có người.

47. **ĐỔI TRỜI GIỮA PHIM** (`BeatKind.Weather`: `weather` + `nightPhase` 0/1/2 + cường độ ở
    `timeScale`). Đi thẳng vào sân thật: `WeatherAmbience.SetWeather` (Combat) và
    `DayNightCycle.ForcePhase` (Gameplay — cửa public mới, đi đúng `BeginPhase` để spawner đêm ·
    tiếng nền · sự kiện không lệch). ⚠ Sân chỉ có `DayNightCycle` khi map bật chu kỳ:
    `CinematicScript.BuildMap` đọc `NeedsDayNightCycle` (có nhịp Weather đổi pha) và bật chu kỳ
    với pha 6000 s — nhịp Weather mới là người bấm, sân không tự lật. Nhịp không chờ, không tính
    vào thời lượng.

48. ⚠⚠ **KHUNG CÓ NGƯỜI VẪN CÓ THỂ LÀ KHUNG CHẾT** (2026-09-12, user: *"camera nhiều lúc không
    chiếu vào cảnh cao trào, đang đánh nhau, mà chiếu 1 nhân vật đứng im"*). Van 35 hỏi *"trong
    khung có ai còn sống không"* — chủ tướng đứng ở hậu phương trả lời CÓ, nên van im lặng trong
    khi cả trận đánh nổ ra ngoài khung. Hai tầng sửa:
    · **Gốc — máy soạn không dí vào người không tham chiến.** `ClimaxActor` mặc định trả
      `CommanderA`, mà chủ tướng trong dự án này CHỈ HUY TỪ XA ⇒ đúng cú vào cao trào là một
      người đứng yên. Nay: `Hero` (nếu kịch bản có) → `LastKiller` (chắc chắn vừa đánh) → mũi
      nhọn; `LeadActor` cũng ưu tiên `Hero`. `LastKiller` chưa có ai thì `Find` trả null và máy
      quay rơi về CHỖ NÓNG — vẫn đúng tinh thần hơn lưng chủ tướng.
    · **Lưới — van «cảnh chết» ở máy quay** (`CinematicCamera.ApplyDeadShotValve`, hàm thuần
      `ShouldAbandonActor`), áp cho MỌI kịch bản kể cả viết tay và AI. Hỏi *"vai đang bám có
      ĐANG CÓ CHUYỆN không"* bằng ba vế, vế nào cũng đủ: **địch còn sống trong 5 unit** ·
      **nhiệt còn sống trong 5 unit** (`CinematicCast.IsEngaged`) · **đang đi >0.55 u/s**
      (máy quay tự lấy mẫu vị trí — vế này cứu cảnh sát thủ đang lẻn, chưa ai đánh ai).
      Im quá **1.1 s** ⇒ bỏ vai, về chỗ nóng, nới khung tối thiểu 6 unit; vai có chuyện trở lại
      và **giữ được 0.45 s** ⇒ trả khung. Đo trên mô phỏng: chủ tướng đứng im cả trận ⇒ camera
      ở lại trận 10.9/12 s và chỉ đổi khung MỘT lần; bận/rảnh chớp nhoáng 0.5 s ⇒ **không đổi
      lần nào** (nhịp im chưa bao giờ đủ 1.1 s) — van không dao động.
    ⚠ `BattleStarted` (`_clashCount > 0`) là vế BẮT BUỘC: trước cú chạm đầu tiên cả sân đứng im
    là ĐÚNG Ý (dàn trận, lệnh `HoldAll`) — bỏ vế đó là camera giật khỏi cảnh dàn trận ở giây thứ hai.
    ⚠ Chỉ áp cho vai là NGƯỜI (`CinematicCast.IsPersonActor`). Cổng thành · xe hàng · nhà chính ·
    mốc địa hình đứng im là BẢN CHẤT của chúng; kéo camera khỏi một cái cổng vì "nó không đánh
    nhau" là hỏng đúng cảnh người viết muốn. Van cũng không chạy đè kill-cam và cú liếc người nói.
    ⚠ Không có chỗ nóng thật (trận vừa ngưng tay) thì Ở LẠI với vai — van 35 vẫn là lưới cuối.
    Đo: «Tự kiểm luật chơi» — bốn cặp `ShouldAbandonActor` + bài *cú dí vào cao trào không được
    nhắm chủ tướng*.

49. ⚠⚠ **THUẬT TOÁN ĐẠO DIỄN — BA TẦNG** (2026-09-12, user: *"thiết kế thuật toán … tạo ra
    một bộ phim có cao trào thu hút, đúng trọng tâm"*). Cả đường MÁY SOẠN lẫn đường KỊCH BẢN
    USER đi qua đúng một cửa (`DressVisualRhythm` → `AutoRepairForProfile`), nên không có
    "phim tự động hay hơn phim người viết" hay ngược lại.

    **Tầng 1 — BỘ DÒ (một nguồn, hai người tiêu thụ).** `CinematicPlayByPlay.Poll()` nay trả
    `CinematicMoment` (`line` · `kind` · `severity` 0–1 · `subject`) thay vì một chuỗi. Bản
    trước trả mỗi CÂU CHỮ nên máy quay **không bao giờ biết vừa có chuyện gì**: người xem đọc
    dòng "CHỦ TƯỚNG ĐÃ NGÃ" trong khi màn hình là một bãi cỏ. ⚠ Không được viết bộ dò thứ hai
    cho máy quay — hai bên sẽ lệch ngưỡng ngay lần đầu ai đó chỉnh.

    **Tầng 2 — PHẢN XẠ SỐNG.** `CinematicDirector.TakeMoment`: phụ đề LUÔN nói; `severity ≥ 0.6`
    và có `subject` thì `CinematicCamera.Punctuate` dí vào đúng người (bề ngang 6.5→4.2, giữ
    1→1.9 s, chậm 0.5→0.25×, rung, chớp, tiếng va — đều nội suy theo độ nặng). Dùng CHUNG bộ máy
    kill-cam (`_killTarget`/`_killSeverity`/`_killWidth`) nên hai đường không đánh nhau; cú nặng
    hơn thắng cú đang chạy.
    ⚠⚠ **CỐ Ý KHÔNG CẮT NGẮN NHỊP ĐANG CHẠY.** Cách hiển nhiên là bỏ cảnh đang quay để nhảy vào
    khoảnh khắc — nhưng mỗi giây cắt đi là một giây rút khỏi khuôn 59–60 s / 180–300 s (luật 33),
    mà khuôn ấy là hợp đồng với nền tảng. Cú dí đè lên khung 1–1.9 s rồi trả lại cảnh: thấy đúng
    khoảnh khắc, tổng thời lượng không đổi một giây. Đây cũng là cách trực tiếp thể thao làm.

    **Tầng 3 — ĐƯỜNG CONG LÚC SOẠN** (`CinematicAutoWriter.Tension.cs`, gọi ở cuối
    `DressVisualRhythm`, TRƯỚC `FitDuration` để ngân sách tự cân lại). Bốn luật phòng dựng:
    · **khung siết dần** — trần bề ngang hồi giữa 72%, hồi cao trào 52% của cảnh rộng nhất hồi
      mở (sàn 4); chỉ SIẾT cảnh vượt trần, không nới cảnh đã hẹp (cảnh cận ở phút đầu là ý đồ).
    · **cắt nhanh dần** — cảnh hồi cao trào ≤ 70% thời lượng trung bình hồi mở (sàn 1.4 s dọc /
      2.2 s ngang). Nhịp ngắn lại là cách duy nhất khán giả CẢM được "sắp tới rồi".
    · **im lặng trước cú nổ** — chèn `Sfx(Heartbeat)` + `SlowMo(0.55, 0.7)` ngay trước cao trào.
    · **cao trào chờ MỐC THẬT** — chèn `WaitUntil(ClimaxCue, 4 s dọc / 9 s ngang)`: có hero →
      `HeroHurt`, đấu tướng → `ChampionDead`, có chủ tướng → `CommanderDead`, còn lại →
      `HalfFallen`. Đây là mảnh quan trọng nhất: bản cũ đặt cao trào ở ~80% danh sách nhịp, nên
      trận ngã ngũ sớm thì "cao trào" quay vào bãi chiến trường đã tàn.
    ⚠ `Reveal`/`Rush` KHÔNG bị siết — chúng là cú máy chạy từ bề ngang này sang bề ngang kia;
    bóp một đầu là giết cú máy mà bảng vẫn trông "đúng luật".

    ⚠⚠ **RANH GIỚI BA HỒI ĐO BẰNG THỨ TỰ CẢNH, KHÔNG BẰNG GIÂY.** Bản đầu chia theo giây tích
    luỹ — nghe tự nhiên hơn — nhưng chính lượt này SỬA giây, nên lần chạy sau ranh giới dịch lên
    và cắt thêm. Mô phỏng trên một bảng thật: **66.8 → 65.5 → …**, tức mỗi lần bấm «Tự sửa» phim
    ngắn đi hơn một giây và không phép đo nào báo. Thứ tự cảnh không đổi khi sửa bề ngang/thời
    lượng ⇒ chia theo nó là idempotent. Đo: «Tự kiểm luật chơi» — *khung siết dần* · *cao trào
    chờ mốc thật* · *chạy hai lần ra cùng số giây*.

50. ⚠⚠ **CHỮ TRONG VIDEO LÀ TIẾNG ANH; TOOLTIP/LOG GIỮ TIẾNG VIỆT** (2026-09-13, user:
    *"text tiếng anh nhé"*). Kênh phát cho người xem quốc tế, còn bảng điều khiển là của người
    dựng. Đã đổi: thẻ tựa + phụ đề của cả 28 bảng mẫu · câu móc và ghi chú đăng bài
    (`CinematicBlurb`) · phụ đề theo diễn biến (`CinematicPlayByPlay`) · thẻ kết quả
    (`VerdictHeadline` + `HeroFate`) · trục kịch tính (`CinematicStory`) · lời dẫn mục tiêu ·
    bước ngoặt · cao trào (`CinematicAutoWriter.Story`) · chữ dự phòng (`EnsureTitle`, cầu AI).
    ⚠ THOẠI đã tiếng Anh từ trước: `CinematicLines` chỉ ÁNH XẠ sang `BattleLines` (kho dùng
    chung với lính trong trận) — đừng dựng kho thoại thứ hai cho phim.
    Đo: `Resources/Cinematics/Cine_*.asset` sau khi dựng lại phải **0/30 chuỗi tiếng Việt**.

51. ⚠⚠ **BẢN MẪU PHẢI ĐI QUA ĐÚNG LƯỢT BIÊN TẬP CỦA BẢN TỰ SOẠN** (2026-09-13).
    `StickmanCinematicBuilder.EnsureSamples` dừng ở `CinematicScript.Fill` — tức storyboard THÔ
    của cốt truyện. Hệ quả đo được trên bản cũ trong git: **52.1 · 56.4 · 63.4 · 77.7 giây** cho
    khuôn 59–60 (0/4 đúng khuôn), không mạch 5 hồi, không đường cong kịch tính, cao trào không
    chờ mốc thật. Recorder có gọi `AutoRepairForProfile` trước khi ghi, nên **XEM THỬ một đằng,
    FILE quay ra một nẻo** — và không gì báo vì asset vẫn hợp lệ, vẫn quay được.
    Nay `EnsureSamples` gọi `AutoRepairForProfile(script)` ngay sau `Fill`. Sau khi dựng lại:
    **30/30 đúng khuôn 59–60 s**, 29/30 có cao trào chờ mốc thật.
    ⚠⚠ **BẢNG MẪU ĐÃ XOÁ HẲN 2026-09-15** (user: *"khi tôi chạy tool thì nó add lại các phim
    cũ"* → *"xoá hết các samples đó đi tôi sẽ tạo chi tiết từng cái"*) — luật này giữ lại làm
    BẰNG CHỨNG cho yêu cầu "mọi cửa soạn asset phải qua `AutoRepairForProfile`", nay áp cho
    `Compose` và `GenerateBattleFilms`. Kho `Resources/Cinematics` để trống sau khi dựng; menu 5
    chỉ còn DỌN `Cine_Auto_*` + đồng bộ map, không đổ lại kịch bản nào.
    Nút: `Trường quay > 5. ★ DỌN KHO PHIM (xoá bản máy soạn cũ)`; batch:
    `-executeMethod StickmanCinematicBuilder.RebuildLibraryBatch`.
    Doctor «Lượt đạo diễn nội dung đã nối» canh đúng dòng gọi này.

52. ⚠⚠ **TÂM CỦA DẢI CÓ NGƯỜI KHÔNG PHẢI CHỖ CÓ NGƯỜI** (2026-09-13, user: *"góc quay camera
    force lung tung … quay không có ai"*). Cảnh toàn khai `width = 26` chỉ THẬT SỰ thấy **13.3
    unit** ở khổ ngang và **7.5** ở khổ dọc — cỡ nhìn bị chặn để người cao ≥105 px (luật 4).
    `RailCenter()` trả điểm giữa DẢI có người = 0, mà hai đạo quân dàn ở `lineAt ±0.55` của nửa
    map 26 unit (±14.3) ⇒ đo được: **0/20 người trong khung**. Van «khung phải có người» có bắt,
    nhưng nó chờ 0.35 s rồi giật sang người gần nhất — đó đúng là "force lung tung".
    Nay `CinematicCast.DensestSpot(halfView)` trả tâm của CỤM ĐÔNG NHẤT lọt vừa khung (cửa sổ
    trượt; hoà thì lấy cụm gần tâm dải hơn, để không nhảy qua lại giữa hai phe). Đo lại cùng thế
    trận: **10/20 người** — trọn một đạo quân. Dùng cho `Establishing` và cho vế rơi cuối của
    `HotOrLast`; `PanAcross` giữ nguyên rail vì một cú lia QUA bãi trống là đúng ngữ pháp.
    ⚠ `VisibleHalfWidth(width)` phải dùng ĐÚNG công thức của `LateUpdate` — chọn chỗ ngắm theo
    con số `width` khai là chọn cho một khung KHÔNG TỒN TẠI.

53. ⚠⚠ **HÌNH DẠNG VIDEO là một TRỤC, và trục nào không ai BỐC thì coi như không có**
    (2026-09-14, user: *"Thêm ý tưởng về nội dung bộ phim"*). `CinematicFormat` mở bốn hình:
    **Single** (một trận) · **Rounds** (đối đầu N hiệp, có bảng tỉ số, hỏi *"bên nào mạnh hơn"*
    thay vì *"ai thắng trận này"*) · **Ladder** (bậc thang: mỗi hiệp một phe đông thêm, kết bằng
    «THEY BROKE AT n») · **Highlight** (đánh số khoảnh khắc rồi tổng kết). Kèm theo: `povHero`
    (bám vai chính, khung ≤9 unit), `silent` (bỏ CHỮ, giữ MÁY QUAY), sổ đời `CinematicChronicle`
    (tập sau recap SỐ PHẬN THẬT và đòi món nợ CÓ THẬT thay vì mấy dòng phụ đề).
    ⚠ Máy soạn phải **`DressFormat(script, rng)`** ngay sau `DressPlane`. Thiếu dòng đó thì cả
    ba hình mới chạy được, có menu, có test — mà **không một video tự động nào dùng tới**.
    Doctor «Lượt đạo diễn nội dung đã nối» canh đúng dòng gọi này.

54. ⚠⚠ **`EstimatedSeconds` LÀ ĐỘ DÀI MỘT HIỆP, KHÔNG PHẢI ĐỘ DÀI VIDEO** (2026-09-14).
    Format nhiều hiệp chạy đúng bảng phân cảnh ấy N lần, nên bảng báo *"58 giây"* trong khi
    người xem nhận **300 giây**. Một con số ĐÚNG trả lời một câu hỏi KHÁC với câu người đọc
    đang hỏi — cửa sổ Recorder từng khoe "vừa khuôn" bằng chính con số đó.
    Nay mọi chỗ so với khuôn đi qua **`CinematicAutoWriter.WholeVideoSeconds(script)`**
    (= `EstimatedSeconds × RoundCount + 1.8 × (RoundCount + 1)` cho thẻ hiệp và thẻ tổng kết),
    và **`RoundCount` là nguồn sự thật DUY NHẤT** mà cả máy soạn lẫn Đạo diễn đọc.

55. ⚠⚠ **CHIA KHUÔN CHO N LÀ PHÉP TOÁN ĐÚNG NHƯNG VÔ NGHĨA NẾU BẢNG KHÔNG BÓP XUỐNG TỚI ĐÓ**
    (2026-09-14). Khổ dọc 59–60 s chia ba ra 17.3 s/hiệp, trong khi **sàn đo được của một hiệp
    là 38.4 s** (dọc) / **48.4 s** (ngang): thẻ tựa, phụ đề, nhịp chờ mốc cao trào 9 s và sàn
    1.2–1.5 s của từng cú máy đều không co được. Tự kiểm bắt tại chỗ: *"3 hiệp ⇒ cả video
    122.5 s, ngoài khuôn 59–60 s"*.
    Nay `MinRoundSeconds = 50` + `MaxRounds(aspect)` kẹp số hiệp theo SỨC CHỨA của khổ ⇒
    **nhiều hiệp là đặc quyền của khổ ngang** (16:9 chứa 5 hiệp); khổ dọc muốn chia khúc thì
    dùng **Highlight** — cùng ý đồ mà không phải dựng lại sân N lần.
    ⚠ Sàn này ĐI THEO bảng phân cảnh: thêm một nhịp không co được là phải đo lại. Đừng nới dung
    sai của phép thử cho nó xanh.

56. ⚠⚠ **CẢ KHO PHIM TỪNG LÀ MỘT KHỔ** (2026-09-14). `Compose` khai `aspect = Portrait916` làm
    mặc định và **không người gọi nào truyền khác** ⇒ đo trên YAML: **42/42 asset là phim dọc
    60 giây**. Cả nhánh PHIM DÀI — montage cắt cảnh, mạch 5 hồi trải 3–5 phút, đối đầu nhiều
    hiệp, bậc thang — có code, có test, có menu, mà **không một asset nào chạy qua**. Không phép
    đo nào trên CODE thấy được: code hoàn toàn đúng, chỉ là chưa ai chọn tới.
    Nay `PickAspect` bốc **60% dọc · 40% ngang** khi người gọi không chỉ định (`aspect` nhận
    `null`), và bản mẫu chia cứng **cứ ba bản một bản 16:9** (chia theo chỉ số, không random, để
    đổ lại kho bao nhiêu lần cũng ra một danh sách).
    Doctor «Kho phim còn đúng luật dựng» đo trên ASSET: kho chỉ có MỘT khổ ⇒ VÀNG; thời lượng
    CẢ VIDEO lệch khuôn ⇒ VÀNG.
    Đo sau khi dựng lại: **42/42 đúng khuôn · 28 dọc / 14 ngang · 0 chuỗi tiếng Việt trên màn
    hình · 42/42 cao trào chờ mốc thật**; loạt trưng bày ra **2 Rounds (300 s và 265 s) · 1
    Highlight**. Nút: `Trường quay > 6. ★ Soạn 12 phim TRƯNG BÀY`; batch:
    `-executeMethod StickmanCinematicBuilder.GenerateShowcaseBatch`.

57. ⚠⚠ **PHÉP ĐO TÌM CODE BẰNG TÊN FILE BÁO ĐỎ OAN KHI AI ĐÓ TÁCH FILE** (2026-09-14).
    Ba dòng đỏ của «lượt đạo diễn nội dung» (preset phim trường · `WaitUntil` cắt cụt · grade
    hình) đều là oan: code vẫn nối đủ, chỉ dọn sang `CinematicDirector.Beats.cs` và
    `CinematicAutoWriter.Repair.cs` cho vừa trần 800 dòng. **Báo đỏ oan nguy hơn báo thiếu** —
    người đọc học cách bỏ qua bảng. Nay dùng `ReadRepoPartials("…/Foo.cs")`: đọc `Foo.cs` cùng
    mọi `Foo.*.cs` cạnh nó. Dùng nó cho MỌI class partial; giữ `ReadRepoFile` khi phép đo cần
    cắt đúng một khối trong đúng một file (ví dụ `Section(writer, "Deck =")`).

58. ⚠⚠ **LƯỢT TẠO HÌNH KHÔNG ĐƯỢC LÀM PHIM NGẮN ĐI** (2026-09-14). `ShapeTension` siết nhịp hồi
    cao trào; phần giây lấy đi không trả lại thì `FitDuration` phải kéo bù ở lượt sau, kéo bù
    làm một cảnh Action vượt lại ngưỡng 18 s, `ExpandLongFormShots` chia montage **lần nữa** —
    bấm «Tự sửa» hai lần là phim ngang **32 nhịp/180 s hoá 36 nhịp/189 s**.
    Hai sửa, cả hai đều cần: (a) `GiveBackToOpening` trả đúng số giây đã siết về **hồi mở** —
    tổng không đổi nên `FitDuration` không có gì để kéo, mà cao trào siết + mở màn thở ra chính
    là cái ĐÀ luật muốn tạo; (b) `HasClimaxRun` tìm chữ ký «chờ ĐÚNG mốc cao trào + tiếng tim
    ngay sau» trên **CẢ bảng** thay vì trong cửa sổ quanh chỗ sắp chèn — montage đẩy «cảnh hành
    động cuối» trôi cả chục nhịp nên khối cũ rơi ra ngoài cửa sổ.

59. ⚠⚠ **CHỌN LẠI MỖI FRAME LÀ MỘT CÁI MÁY RUNG** (2026-09-14, user: *"camera bị shake rung
    lắc"*). Thủ phạm KHÔNG phải nhịp `Shake` — đếm trên 42 asset: **0.6 nhịp/phim, độ mạnh
    0.35–0.55**, và `WeaponBase`/`MartialArtist` chỉ rung khi có NGƯỜI CHƠI nên phim không chạm
    tới. Thứ rung là **chỗ ngắm**: `ResolveShot` gọi `DensestSpot` 60 lần một giây trên những
    người đang di chuyển.
    Hai lỗi chồng nhau, mô phỏng đúng thuật toán cũ (20 người, hai phe tiến vào nhau, 8 giây):
    · **Ứng viên đo bằng MÉP TRÁI, khung thật đo bằng TÂM** — điểm trả về là trung bình của một
      cửa sổ mà mép trái là một người, nên nó có thể không nằm trên cụm nào. Đo: **10 cú nhảy
      >0.5 u, lớn nhất 12.70 unit** — camera lao qua lao lại giữa hai đạo quân ở đúng trần
      `ComfortPanMaxSpeed` = 6.5 u/s.
    · **Không có trí nhớ** — hai cụm bằng nhau thì "cụm đông nhất" đổi chủ mỗi khi ai đó bước qua
      mép cửa sổ.
    Sửa hai vế, cả hai đều cần: ① ứng viên là **KHUNG ĐẶT TRÊN MỖI NGƯỜI** (cùng một thước với
    khung thật) ⇒ cú nhảy lớn nhất còn **3.78 u**; ② `CinematicCamera.StableCrowdAim` giữ cụm
    đang quay, bám theo **trung bình của chính những người trong khung** (`CinematicCast.CrowdWindow`)
    và chỉ hỏi lại sau `CrowdAimHold = 1 s`, chỉ đổi khi cụm khác đông hơn **`CrowdAimMargin = 2`
    người** ⇒ còn **1.66 u · 3 lần**, mà số người trong khung gần như không đổi (13.1 → 12.8/20).
    Cắt sang cảnh mới thì xoá trí nhớ — đó là lúc DUY NHẤT đổi cụm mà không ai thấy giật.
    ⚠ Hết người thì rơi về `RailCenter()` nhưng **không xoá trí nhớ**: quân khuất sau công trình
    một nhịp không được thành một cú lia về giữa map.
    Doctor «Lượt đạo diễn nội dung đã nối» canh `StableCrowdAim` + `CrowdWindow`.

60. ⚠⚠ **LƯỢT NHẤN PHẢI CHẠY SAU LƯỢT SỬA, KHÔNG PHẢI TRƯỚC** (2026-09-15, user: *"tập trung
    vào đánh nhau và chiến trường hơn"*). `CinematicAutoWriter.EmphasiseCombat` đổi cảnh bối cảnh
    ở hồi giữa/cao trào thành cảnh ĐÁNH (giữ nguyên 1/3 đầu để khán giả còn biết đang xem trận
    gì; `Reveal`/`Rush` miễn trừ) và nhân quân ×1.9. Gọi nó TRƯỚC `AutoRepairForProfile` thì
    `DressVisualRhythm` trong lượt sửa **dán lại đúng những cảnh vừa bị đổi đi** — đo ra y hệt kho
    cũ, tức là lượt nhấn trông như không tồn tại. Nhấn SAU thì không ai đè lên.
    ⚠ Và lượt nhấn KHÔNG được đụng `seconds` (chỉ đổi loại cảnh · bề ngang · quân số) — nhờ vậy
    khuôn thời lượng vẫn nguyên và không phải sửa lại lần nữa (luật 54).
    Nút: `Trường quay > 7. ★ Soạn 8 phim CHIẾN TRƯỜNG`; batch:
    `-executeMethod StickmanCinematicBuilder.GenerateBattleFilmsBatch`.
    Đối chứng CÙNG cốt truyện, kho cũ → loạt mới: **53→64% · 76→88% · 72→89%** thời lượng có
    người đánh nhau, quân số **×2.2** (23 → 58 người), sàn của cả loạt nâng từ 42% lên 58%.

61. ⚠⚠ **NHỊP `WaitUntil` KHÔNG PHẢI THỜI GIAN CHẾT — NÓ GIỮ NGUYÊN CẢNH ĐANG QUAY**
    (2026-09-15). Phép đo đầu tiên của «phần trăm đánh nhau» đếm nó vào mẫu số như một nhịp
    không-đánh-nhau, mà đo ra nó chiếm tới **38% thời lượng một phim** (nhịp chờ mốc cao trào của
    phim dài có timeout 9 giây). Kết quả: lượt nhấn chiến trường báo **35% so với nền 32%** — nhìn
    như vô dụng — trong khi nó đã đổi gần hết cảnh bối cảnh của hồi giữa. Đếm lại cho nhịp chờ
    THỪA KẾ loại cảnh đứng trước nó: nền thật là **73%**, loạt mới **77%**, và chênh lệch thật nằm
    ở SÀN (42% → 58%) cùng quân số.
    Cùng họ với luật 54: một con số ĐÚNG trả lời một câu hỏi KHÁC với câu người đọc đang hỏi.
    ⚠ Thẻ tựa và thẻ kết quả thì PHỦ KÍN màn hình nên không tính là đang thấy trận.

62. ⚠⚠ **MỌI CHỖ NGẮM SUY RA TỪ ĐÁM ĐÔNG PHẢI CÓ TRẦN TỐC ĐỘ** (2026-09-15, user: *"camera lia
    quá nhanh và giật giật"* — ngay sau bản sửa của luật 59). Luật 59 thay cú nhảy RỜI RẠC bằng
    `StableCrowdAim`, nhưng bản đầu của nó **đặt thẳng** chỗ ngắm bằng trung bình của những người
    trong khung, rồi frame sau lại lấy khung quanh chỗ ngắm mới — tức là một vòng **mean-shift
    chạy 60 lần/giây**. Đo trên đám đông **ĐỨNG YÊN**: chỗ ngắm nhảy **5.06 unit trong MỘT frame,
    đỉnh 132 u/s**, gấp 20 lần trần lia `ComfortPanMaxSpeed` của chính máy quay. Đổi lia-qua-lia-lại
    lấy lia-quá-nhanh.
    Thuốc: `Mathf.MoveTowards` với `CrowdAimDrift = 2.2 u/s`. Đo lại: đỉnh **2.2 u/s**, mà tốc độ
    TRUNG BÌNH (0.14 u/s) và số người trong khung (20/20) **không đổi** — trần chỉ cắt cú giật,
    không làm máy quay bám hụt. 2.2 bám kịp một đạo quân xung phong (~1.8 u/s).
    ⚠ Cùng bệnh, chỗ thứ ba: `CinematicCast.HotSpot` cũng là một **argmax chạy mỗi frame** (mẫu
    nhiệt mạnh nhất làm tâm cụm); trận càng đông thì tâm càng đổi chủ giữa hai frame. `SteadyHot`
    bóp nó bằng đúng trần ấy. Chốt của cả hai bị xoá ở `SetShot` — cú cắt là chỗ DUY NHẤT được
    phép nhảy, vì người xem không thấy.
    ⚠ Kill-cam và cảnh bám một VAI CỤ THỂ **không** đi qua trần: chúng là ý đồ của người dựng.

63. ⚠⚠ **HẰNG SỐ HIỆU CHUẨN TRÊN TRẬN NHỎ HOÁ THÀNH TẦN SỐ Ở TRẬN LỚN** (2026-09-15).
    `KillCamCooldown = 2.5 s` là một cái VAN khi trận có 20 quân — nhưng loạt phim chiến trường
    có 45–78 quân, tức là gần như lúc nào cũng vừa có người ngã, nên cái van biến thành **nhịp**:
    cả phim là một chuỗi cú dí cách nhau đúng 2.5 giây. Và cú dí có thể nhắm một người ở đầu kia
    sân — không phải một cú máy, mà là một cú quăng.
    Hai van, cả hai đo trên trạng thái THẬT chứ không trên số khai trong kịch bản:
    · `NearFrame` — cú ngã phải nằm trong (hoặc sát) khung THẬT (`orthographicSize` hiện tại,
      không phải `width` kịch bản khai — luật 52); nhân vật CÓ TÊN được miễn.
    · `CrowdKillCamPenalty` — nhịp nghỉ giãn thêm theo số người CÒN SỐNG (20 quân giữ 2.5 s,
      70 quân thành ~7.5 s). Đếm người còn sống chứ không đếm quân số ban đầu: cuối trận còn vài
      người thì mỗi cái chết lại đáng quay trở lại.

64. ⚠⚠⚠ **HAI THÀNH PHẦN CÙNG GHI TRANSFORM CAMERA — ĐÂY MỚI LÀ "RUNG LẮC" THẬT**
    (2026-09-15, user: *"nó vẫn bị shake camera, rung lắc"* — sau BA lượt sửa ở chỗ ngắm đều
    không chạm tới nó).
    `MapAssembler.Build` gọi `camera.gameObject.AddComponent<DemoCameraFollow>()` khi camera chưa
    có, và component vừa thêm thì **đang bật**. Bản cũ dựng sân xong mới tắt nó ⇒ đúng. Lượt thêm
    ĐỐI ĐẦU NHIỀU HIỆP đưa phần dựng sân vào **trong vòng lặp** mà để lệnh tắt ở lại phía trên
    vòng ⇒ từ hiệp đầu tiên đã có hai thành phần cùng ghi `camera.transform.position` mỗi
    `LateUpdate`, mỗi cái một `SmoothDamp` và một `ApplyShake` Perlin riêng. Nó còn làm
    `CameraShake.Decay` chạy HAI lần mỗi frame (cú rung tắt nhanh gấp đôi).
    ⚠ Biên dịch xanh, Doctor xanh, tự kiểm xanh, và **mọi phép đo trên thuật toán NGẮM đều đúng**
    — vì chỗ ngắm không phải thủ phạm. Đây là lý do luật lõi viết «mỗi transform chỉ một chủ».
    Ba hàng rào, đặt cùng lúc:
    · `CinematicDirector.BlockGameplayCamera()` gọi SAU **mỗi** lượt dựng sân (trong `SetupRound`),
      không phải một lần trước vòng;
    · `CinematicCamera.ClaimTransform()` — máy quay tự soát mỗi 0.5 s và tắt kẻ tranh quyền, kèm
      một dòng cảnh báo; bất kỳ đường nào thêm lại `DemoCameraFollow` giữa phim cũng bị chặn;
    · Doctor soát **THỨ TỰ** (lệnh nhường phải đứng sau `MapAssembler.Build`), không soát sự có mặt.

65. ⚠⚠ **PHÉP ĐO ĐỌC CHỮ THÌ CHÍNH TÀI LIỆU CỦA NÓ LÀM NÓ XANH** (2026-09-15). Thử làm hỏng có
    chủ ý — comment dòng `BlockGameplayCamera();` — mà phép đo thứ tự ở luật 64 **vẫn xanh**: dòng
    đã comment vẫn chứa tên hàm, và đoạn chú thích giải thích luật thì lại càng chứa.
    Nay dùng `StickmanDoctor.CodeOnly(...)` (bỏ mọi dòng bắt đầu bằng `//`) trước khi `IndexOf`.
    Mô phỏng lại đúng logic ấy: **không lọc → xanh cả bản đúng lẫn bản hỏng; có lọc → xanh với bản
    đúng, ĐỎ với bản hỏng.**
    ⚠ Luật chung: viết xong một phép đo tìm-bằng-chữ thì phải **cố ý làm hỏng một lần** và xem nó
    có đỏ không. Phép đo không bao giờ đỏ được thì tệ hơn không có — xem thêm «Bẫy im lặng» ở
    AGENTS.md.

66. ⚠⚠ **BỐ CỤC PHÁT SÓNG — BỐN KHỐI, CỐ ĐỊNH** (2026-09-15, user: *"Intro 2 team · thân bài
    đánh nhau · kết bài kết quả · và credit xoigame hiện lên"*).
    ```
      MỞ     Fade → THẺ HAI PHE → câu móc → một cảnh phe A → một cảnh phe B
      THÂN   đánh nhau
      KẾT    thẻ kết quả
      CREDIT thẻ XOIGAME → dòng ghi công → tối màn → End
    ```
    Ba mảnh đều ĐÃ CÓ trong bảng phân cảnh, chỉ nằm sai chỗ — đo trên asset thật: thẻ tên hai phe
    ở **nhịp 11** (sau câu móc và bốn cảnh), thẻ XOIGAME ở **nhịp 58** còn thẻ kết quả mãi **nhịp
    63**. Tức là người xem thấy tên hãng TRƯỚC khi biết ai thắng.
    ⚠⚠ Thủ phạm là `EnsureVerdictAndEnd`: nó chèn thẻ kết quả **ngay trước `End`**, mà khối kết
    của template là «kết quả → tiếng nhấn → logo → ghi công → tối màn → End» — chèn trước `End`
    là chèn SAU logo. Chính template đã ghi đúng ý đồ trong chú thích của nó («thẻ kết quả đứng
    TRƯỚC thẻ logo»), và lượt sửa vô hiệu hoá ý đồ đó mà không ai báo. Nay chèn ngay sau **CẢNH
    CUỐI** (`LastIndex(s, BeatKind.Shot)`), nên mọi thẻ chữ của khối kết tự khắc nằm sau kết quả.
    ⚠ `CinematicAutoWriter.ShapeBroadcast` là lượt **SẮP XẾP**, không phải lượt viết thêm: viết
    thêm một bộ thẻ nữa là video có hai thẻ tựa. Hai cảnh giới thiệu phe ngắm bằng **vai**
    (`FrontlinerA`/`FrontlinerB`), không bằng tỉ lệ dải, và lấy giây từ chính cảnh đứng sau nên
    khuôn thời lượng không đổi.

67. ⚠⚠ **NHỊP NHANH = NHIỀU CÚ CẮT, KHÔNG PHẢI PHIM NGẮN** (2026-09-15, user: *"nhịp phim nên
    nhanh hơn"*). Đo trên kho: **4.6 giây một cảnh** (trung vị 4.2, dài nhất 15.4) — mỗi cảnh đều
    kịp "hết chuyện" trước khi cắt. Khuôn thời lượng là hợp đồng (luật 54), nên `QuickenCuts`
    **chia** cảnh dài thành nhiều cảnh (`MaxCutSeconds = 3`, sàn `MinCutSeconds = 1.1`) thay vì
    bóp tổng.
    ⚠⚠ VÀ MỘT CÚ CẮT CHỈ ĐƯỢC TÍNH LÀ CẮT NẾU KHUNG ĐỔI. Chia một cảnh thành hai cảnh Y HỆT nhau
    là thêm một nhịp VÔ HÌNH: bảng đếm ra "12 cảnh" mà mắt vẫn thấy một cú máy dài. Nên mảnh chẵn
    đổi bề ngang (×0.7) và thả vai về `None` để máy quay nhảy sang chỗ nóng.
    ⚠ `Reveal`/`Rush` miễn trừ — chia đôi là giết cú máy (cùng lý do với `ShapeTension`).

68. ⚠⚠ **TỈ LỆ DẢI PHẢI TRẢI TRÊN KHOẢNG CÓ NGƯỜI, KHÔNG TRÊN BỀ DÀI DẢI** (2026-09-15, user:
    *"không lia camera qua khoảng trống"*). `RailCenter() + k · RailHalf()` trải đều từ người
    ngoài cùng bên trái tới người ngoài cùng bên phải — nhưng đầu trận hai đạo quân đứng ở
    `lineAt ±0.55` của nửa map 26 unit, tức **gần ba mươi unit đất trống ở giữa**, và `CrowdSpan`
    gộp cả hai thành MỘT dải. Đo trên kho: **89 giây** (≈4% thời lượng) cảnh ngắm-theo-tỉ-lệ rơi
    vào chỗ cách mọi tuyến quân hơn 8 unit.
    `CinematicCast.DenseRun(maxGap, prefer, …)` cắt dải thành các KHOẢNG (hai người cách nhau quá
    một khung là hai khoảng) và trả khoảng đông nhất; `CinematicCamera.OccupiedAt` trải tỉ lệ của
    `PanAcross`/`Static` trong khoảng đó, kẹp thêm nửa khung vào hai mép (ngắm đúng người ngoài
    cùng thì nửa khung vẫn là đất trống).

69. ⚠⚠⚠ **NHÂN QUÂN MÀ KHÔNG NỚI SÂN LÀ XOÁ SẠCH MỘT PHE TRONG MẤY GIÂY ĐẦU** (2026-09-15,
    user: *"thiếu cân bằng giữa 2 phe dẫn đến mới vào là 1 team chết hết, và nó không còn gì để
    chiếu"*). Lượt nhấn chiến trường nhân quân ×1.9 mà giữ nguyên `halfWidth`:
    **kho cũ 0.46 quân/u → loạt mới 1.12** (cao nhất 1.41). Người cao 0.93 u và cần chừng ấy bề
    ngang để đứng đánh, nên ở mật độ đó hai tuyến đã chồng lên nhau ngay lúc dựng: cả trận thành
    một cái cối xay, một phe bị xoá trong mấy giây, và video 300 giây còn lại 240 giây quay mấy
    người thắng đi lại.
    ⚠ KHÔNG phải lỗi TỈ LỆ hai phe — đo ra trung vị chênh lệch sức mạnh chỉ **1.10×**, và ba phim
    lệch nhất đều lệch CÓ CHỦ ĐÍCH (ám sát 9 vs 1, săn rồng 18 vs 3, dò hầm 1 vs 12). Cân lại
    những cái đó là giết chính cốt truyện. Thủ phạm là MẬT ĐỘ — một con số không ai nhìn vào.
    Nay `ScaleForBattlefield` làm ba bước đúng thứ tự: **nới sân trước** (trần `halfWidth = 40`
    của `DressStage`) → tính sức chứa ở `BattleDensityCap = 0.55` → nhân quân bằng số NHỎ HƠN.
    Đo lại: **0.55 quân/u · sân 77.6 u · khoảng cách hai tuyến 29 → 42.7 u**, quân 57.8 → 43.
    `CinematicAutoWriter.TroopDensity(script)` là phép đo dùng chung cho tự kiểm và báo cáo.

70. ⚠⚠ **MỘT MÁY SOẠN, HAI ĐƯỜNG RA, HAI KẾT QUẢ KHÁC NHAU** (2026-09-15). `GenerateAuto` gọi
    thẳng `Compose` và **không** gọi `AutoRepairForProfile`, nên lượt bố cục/nhịp cắt đặt ở lượt
    sửa chỉ chạm tới 38 bản mẫu — 12 kịch bản trưng bày ra lò với thẻ tên hai phe ở nhịp 9–13 và
    nhịp cắt 4.6 giây. Bảng phân cảnh nào cũng hợp lệ nên không gì báo; chỉ lộ ra khi đo
    **từng phim** thay vì đo trung bình cả kho (trung bình vẫn đẹp vì 38 > 12).
    Lượt nào phải đúng cho MỌI phim thì gọi ở CẢ HAI đường, và phải idempotent để chạy hai lần
    không cộng dồn (`HasTeamIntro`; cảnh ≤ `MaxCutSeconds` thì không chia nữa).
    Đo sau khi nối: **bố cục đúng 50/50**, nhịp **2.3 s/cảnh** (từ 4.6), cảnh dài nhất 5.5 s
    (từ 15.4), **11.8 cảnh/phút** (từ 5.6).

71. ⚠ **QUAY PHIM THÌ NÓN/GIÁP KHÔNG RỜI KHỎI NGƯỜI** (2026-09-15, user: *"trong chiếu phim thì
    bật mode không rớt nón giáp đi"*). Trong GAME, nón văng khỏi đầu là một thông tin. Trong PHIM
    thì nền văn minh của hai phe được đọc bằng NÓN VÀ GIÁP — đánh tới giữa trận là cả sân thành
    một đám stickman đen giống hệt nhau, khán giả hết phân biệt được ai với ai.
    `StickmanEquipment.KeepGearOn` (= `StickmanUI.Filming`) chặn ĐÚNG việc món đồ rời khỏi người
    ở hai cửa `AbsorbDamage` và `ConsumeBlock`. ⚠ Điểm giáp vẫn trừ, vẫn chặn sát thương, vẫn hết
    — cân bằng trận đánh KHÔNG đổi, chỉ cái vỏ ở lại. Chặn cả phần trừ giáp là biến phim thành
    một trận khác với trận người xem tưởng mình đang xem.

72. ⚠ **HẠT PHIM PHẢI LÁT 1:1, KHÔNG ĐƯỢC KÉO GIÃN** (2026-09-15, user: *"hiệu ứng pixel to ở ban
    đêm làm khó nhìn quá"*). `CinematicOverlay` vẽ texture hạt **32×32 `FilterMode.Point`** bằng
    `ScaleMode.StretchToFill`: ở khung dọc 1080×1920 mỗi texel thành **34×60 pixel màn hình** —
    một tấm lưới ô vuông, lộ nhất trên nền TỐI vì hạt sáng nằm trên nền đen. Nay dùng
    `DrawTextureWithTexCoords` với số lần lặp = kích thước khung / kích thước texture, cộng xê
    dịch gốc lát theo thời gian (hạt đứng yên đọc ra là màn hình bẩn), và hạ alpha 0.2 → 0.12.

73. ⚠⚠⚠ **BỀ NGANG THẤY ĐƯỢC LÀ TRẦN CỨNG: 13.3 u NGANG · 7.5 u DỌC** (2026-09-15, user:
    *"nhiều lúc zoom gần quá không thấy toàn cảnh và nhân vật nào"*). Luật «người cao ≥105 px»
    (luật 4) chặn cỡ nhìn, nên kịch bản khai `width` bao nhiêu cũng vô nghĩa quá ngưỡng ấy —
    `CinematicCamera.MaxVisibleWidth(aspect)` là con số thật. Một hàng 20 lính đứng cạnh nhau đã
    ~18–20 u, nên **khổ dọc không bao giờ thấy quá ~8 người trong một khung**.
    ⇒ Muốn "toàn cảnh" thì **THU SÂN cho vừa con số này**, không có cách nào nới camera. Đó là
    hình học, không phải lỗi camera sửa được.
    ⚠⚠ SỐ NÀY PHẢI TÍNH TỪ HẰNG SỐ CỦA CHÍNH MÁY QUAY, ĐỪNG LẤY CHIỀU CAO NGƯỜI Ở CHỖ KHÁC.
    Bản đầu của luật này ghi **17.0 u** cho khổ ngang vì lấy `0.928` (thước người của hệ art) thay
    cho `CinematicCamera.BodyHeight = 0.73`. Tính đúng: `0.73 × (1080 / min(1, aspect)) / 105 ×
    aspect` → **13.3 u** (16:9) · **7.5 u** (9:16 · 1:1 · 4:5). Cặp (17.0 · 9.5) ứng với
    `MinBodyPixels ≈ 82.5`, tức một bản hiệu chuẩn CŨ — dùng nó là dựng sân rộng hơn khung 28%.
    Cỡ sân theo khổ: **dọc 6–12 u / 2–8 quân**, **ngang 12–20 u / 8–14 quân** (sân rộng hơn bề
    ngang thấy được thì chấp nhận là KHÔNG ôm hết trận, phải có lý do — ví dụ nút cổ chai).
    Cửa nhận kịch bản in số đo ngay lúc nhận (`CinematicAiBridge.FrameFitLine`) — và nó đọc thẳng
    `CinematicCamera.MaxVisibleWidth`, nên nó ĐÚNG kể cả khi tài liệu ghi sai: *"Sân 12 u · khung
    thấy 7.5 u · 8 quân ⇒ khung chỉ ôm được 63% bề ngang sân"*. Tin con số của tool, không tin
    con số chép tay trong luật.

74. ⚠⚠ **MỘT TRƯỜNG CHỈ ĐI ĐƯỢC MỘT CHIỀU LÀ MỘT TRƯỜNG NÓI DỐI** (2026-09-15). Cửa nhận kịch
    bản có `night` (bool) nhưng `ApplySetting` chỉ bật: khai `night: false` cho một cốt truyện mà
    mẫu vốn là đêm thì phim **vẫn ra ban đêm**, và không gì báo. Nay có `timeOfDay: "Day"|"Night"`.
    ⚠ Cùng lỗi ở đội hình: `soldiersA` là TỔNG rồi chia cho mọi ô, tối thiểu 1 mỗi ô — nên «một
    người giữ cầu» khai `soldiersA: 1` ra **5 người** (khiên + kiếm + cung + hỗ trợ + chủ tướng).
    Có những kịch bản mà con số 1 là CẢ Ý TƯỞNG. Nay khai được `forceA`/`forceB` theo TỪNG Ô
    (`-1` = giữ của mẫu), và nó ghi đè phép chia theo tổng.
    ⚠ Và cả đường nhận kịch bản trước nay chỉ bấm được bằng tay — thêm
    `-executeMethod CinematicAiBridge.CreateFromInboxBatch` để kịch bản gửi vào có thể ĐO được
    ngay, không phải nhờ người dùng bấm nút.

75. ⚠⚠ **BẢNG PHÂN CẢNH VIẾT TAY LÀ Ý ĐỒ, KHÔNG PHẢI BẢN NHÁP ĐỂ TRANG ĐIỂM** (2026-09-15).
    `DressVisualRhythm` sinh ra để VÁ bảng do máy soạn: thêm toàn cảnh · lia · bám · dí. Với bảng
    do NGƯỜI viết nó làm đúng điều ngược lại — đo trên kịch bản «MỘT NGƯỜI GIỮ CẦU» (10 cảnh
    `Static` cố ý đứng yên): asset ra có thêm **3 Follow · 1 PanAcross · 1 Establishing · 1 PunchIn
    · 1 Action**, tức bảy cảnh không ai viết, trong đó một CÚ LIA giữa một bộ phim cố ý không lia.
    Nay `writingMode == Ai` và có ≥4 cảnh thì lượt vá đứng ngoài; bảng vẫn được cân thời lượng và
    dán tiếng. (Dưới 4 cảnh là bảng còn dở, vẫn vá.)

76. ⚠ **NHÂN VẬT CHÍNH PHẢI MẠNH HƠN HẲN VAI PHỤ** (2026-09-15, user: *"nhân vật chính lúc nào
    cũng mạnh hơn nhiều so với nhân vật phụ, để nó theo nội dung"*). Một mình cầm cự đám đông chỉ
    ĐỌC RA ĐƯỢC nếu anh ta thật sự hơn hẳn; cân bằng đều là phim chết ở giây thứ mười.
    Hai trục, dùng CẢ HAI — chỉ nhân máu là ra một bao cát dai, không phải một người giỏi:
    · `hero.healthMultiplier` **≥ 3** khi đánh với số đông (2.0–2.5 khi 1v1);
    · `forceA.smarts = 3` (lão luyện) so với `forceB.smarts = 1` (lính mới) — hơn nhau CÁI ĐẦU thì
      anh ta đỡ được, chọn đòn được.
    ⚠ Đây là luật của KỊCH BẢN, không phải của máy soạn: `CinematicAutoWriter` vẫn cân hai phe như
    cũ (xem luật 69 — cân lại cốt truyện lệch có chủ đích là giết cốt truyện đó).

77. ⚠ **KHUNG KHOÁ CỨNG LÀ MỘT HỆ QUẢ HÌNH HỌC, KHÔNG PHẢI MỘT CỜ** (2026-09-15). Máy quay kẹp
    `x` trong `±(halfWidth − halfView)`. Khi sân hẹp hơn khung (`halfView ≥ halfWidth`) thì
    `limit = 0` và **camera không dịch được một đơn vị nào, bất kể cảnh loại gì**. Nhờ vậy phim
    «một khung hình duy nhất» chỉ cần: sân ≤ bề ngang thấy được, và mọi cảnh khai `width` đủ rộng.
    Không cần thêm cờ «khoá camera» nào cả — và cũng đừng thêm.
    ⚠ Kill-cam khai `width` riêng (4.5 u) nên nó được phép nhích ±0.4 u ở sân 6 u; muốn đứng im
    tuyệt đối thì bỏ `killCam`.

78. ⚠⚠⚠ **CÂN BẰNG NHÂN VẬT PHẢI TÍNH TỪ DPS, KHÔNG BỐC SỐ** (2026-09-15, user: *"lính phe địch
    quá mạnh, giết được lính thủ cầu, nên mới chiếu 5s là kết thúc rồi"*).
    Số gốc của dự án: **máu người thường 3.0**; kiếm 1.0 sát thương mỗi **0.35 s** = 2.86 DPS;
    cung 1.5 mỗi ~1.2 s = 1.25 DPS. Từ đó suy ra thẳng:
    ```
    hero ×6  = 18 HP   vs 2 kiếm + 1 cung (6.96 DPS)  →  sống  2.6 giây
    hero ×40 = 120 HP  vs 2 kiếm         (5.71 DPS)  →  sống 21.0 giây áp lực ĐẦY
    trụ 45 giây dưới áp lực liên tục                  →  cần ×104
    ```
    ⚠⚠ Trần cũ `Mathf.Clamp(multiplier, 0.25f, 6f)` được hiệu chuẩn cho anh hùng ĐỨNG GIỮA ĐẠO
    QUÂN (có đồng đội chia lửa). Áp nguyên nó cho phim «một người chống tất cả» là **chặn mất cả
    một thể loại**, mà không gì báo: phim vẫn quay, chỉ kết thúc ở giây thứ năm. Trần nay ×60 —
    vẫn là trần, vì bất tử thì hết kịch tính.
    ⚠ Và ba lẽ thiết kế rẻ hơn thổi máu:
    · **bỏ tay bắn xa** khỏi phe địch trong phim có khiên — tên bay qua khiên thì cái khiên (và
      cả tiền đề "cầu hẹp") thành vô nghĩa;
    · **hạ máu tốp lính** (`forceB.health = 0.7`) — người hùng hạ mỗi người trong 0.7 giây thay
      vì 1.0, tức là áp lực giảm 30% mà không ai thành bao cát;
    · **đợt nhỏ, thưa ra** (`waveSize` 2 mỗi 8 giây) — số người ĐỒNG THỜI mới là thứ giết, không
      phải tổng số người.

### 3. Quay hoài không hết

Cửa sổ 🎬 có khối **Máy quay vô tận**: chọn số phim mỗi mẻ rồi bấm «⏺∞ SOẠN & QUAY N phim» —
máy soạn N kịch bản mới (mỗi phim một hạt giống), lưu thành asset `Cine_Auto_*`, xếp hàng quay
lần lượt, xong tự thoát Play. «Dọn kịch bản TỰ ĐỘNG» xoá riêng nhóm `Cine_Auto_*`, giữ 19 bản mẫu.

⚠ Kịch bản được LƯU TRƯỚC KHI QUAY chứ không soạn thẳng vào bộ nhớ: phim nào ra đẹp thì còn
asset để sửa lại và quay lại; soạn trong bộ nhớ là xem xong không tìm lại được.

### 3a. Bộ phim nhiều tập

Khối **Bộ phim nhiều tập** trong cửa sổ 🎬 nhận một kịch bản gốc và tạo 2–30 tập. Tập 1 giữ
nguyên bảng phân cảnh; các tập sau viết lại nhịp bằng cùng cốt truyện, thời kỳ, hai phe, sân và
trục kịch tính, chỉ đổi seed theo hàm tất định. Mỗi asset mang `seriesId`, `episodeNumber` và
`episodeCount`, tên `Cine_Auto_Series_*_E01ofNN`, rồi được `StickmanCinematicRecorder.Queue`
ghi thành từng `.mp4`/`.txt` theo đúng thứ tự. `CinematicGallery` gom các asset cùng `seriesId`
và tự phát tập kế tiếp; phim đơn và **CHIẾU LIÊN TỤC** vẫn giữ nguyên hành vi cũ.

⚠ Đây là tiếp nối ở cấp **bộ phim**: mỗi tập dựng một trận mới nhưng nhận diện được cùng thế
giới và hai phe. Kịch bản `Custom` không bị máy đổ lại — chỉ đổi seed sân và gắn số tập.

### 4. Thêm

| Muốn thêm | Chỗ nối | Phép đo |
|---|---|---|
| Cốt truyện mới (VD thuỷ chiến, đua xe) | `CinematicScenario` + nhánh `CinematicTemplates.Fill` (thân hàm ở `.Wave3.cs`) + trọng số trong `CinematicAutoWriter.Deck` | Doctor «Kịch bản phim nối đủ chỗ» + «Cốt truyện phim có vào bộ bài máy soạn» |
| Kiểu chơi mới (`MissionType`) | một cốt truyện dùng nó | Doctor «Kiểu chơi nào chưa có cốt truyện phim» |
| Chuyển cảnh mới | `CinematicTransition` + nhánh `CinematicCamera.SetShot` (+ chỗ vẽ ở `CinematicOverlay`) | Doctor «Kịch bản phim nối đủ chỗ» |
| Trục kịch tính mới | `CinematicArc` + nhánh `CinematicStory.Apply` + `CanApply` + một dòng trong `PickArc` | ↑ và «Tự kiểm luật chơi» |
| Khổ video mới | `CinematicAspect` + `CinematicDirector.AspectOf` + `StickmanCinematicWindow.Resolution` | «Tự kiểm luật chơi» (hai bảng phải khớp tỉ lệ) |
| Cảnh quay mới | `ShotKind` + nhánh `CinematicCamera.ResolveShot` | ↑ |
| Mốc chờ mới | `CinematicCue` + nhánh `CinematicCast.Check` | ↑ |
| Lệnh AI mới | `CinematicOrder` + nhánh `CinematicDirector.Apply` | ↑ |
| Vai mới | `CinematicActor` + nhánh `CinematicCast.Find` | Doctor «Kịch bản phim nối đủ chỗ» |
| Mốc địa hình mới | `CinematicLandmark` + nhánh `CinematicCast.FindLandmark` (`.Principals.cs`) đọc sổ đăng ký thật | ↑ |
| Nhân vật có tên | KHÔNG thêm code: điền `hero`/`nemesis` trong asset hoặc JSON (`CinematicAiBridge.CastMember`) | Console «[Phim] … neo vào vai …» khi vai neo trống |
| Tiếng phim mới | `CinematicSfx` + nhánh `CinematicAudio.KeyOf` + một `Recipe` trong `StickmanAudioSynth` (renderer ở `.Cine.cs`) | ↑ và «Tiếng phim đã sinh chưa» |
| Kiểu nhịp mới | `BeatKind` + nhánh `CinematicDirector.RunBeat` + hàm dựng trong `CinematicBeat` | ↑ |
| Lời thoại | sửa `CinematicLines` (ô = khoảnh khắc × thời kỳ) — không sửa nhịp phim | — |
| Chỉ đổi quân / nhịp / khổ | sửa asset trong Inspector, nút «Đổ lại mẫu» để về mẫu | — |

⚠ Thêm giá trị enum Ở CUỐI — chỉ số đã bake vào asset kịch bản.

### 5. Phép đo tự động

| Chạy ở đâu | Đo gì |
|---|---|
| Doctor «Kịch bản phim nối đủ chỗ» | 12 cặp enum ↔ switch (cốt truyện · cảnh · mốc · lệnh · vai · tiếng · kiểu nhịp — `RunBeat` ở `.Beats.cs` · chuyển cảnh · trục kịch tính · grade · preset · **mốc địa hình**) |
| Doctor «Cốt truyện phim có vào bộ bài máy soạn» | mỗi cốt truyện có dòng trong `AutoWriter.Deck` (vế `Samples` bỏ 2026-09-15 cùng bảng mẫu) |
| Doctor «Lượt đạo diễn nội dung đã nối» | cửa gọi `Story`, cấp thời gian Action, montage phim ngang, metadata và phần giữ `WaitUntil` |
| Doctor «Lượt đạo diễn nội dung đã nối» (vế máy quay) | `StableCrowdAim` + `CrowdWindow` còn nguyên — mất là khung tự lia qua lại giữa hai phe |
| Doctor «Kho phim còn đúng luật dựng» | đo trên ASSET: kho không được chỉ có MỘT khổ · thời lượng **CẢ VIDEO** (`WholeVideoSeconds`) phải trong khuôn |
| Doctor «Tiếng phim đã sinh chưa» | 12 file `.wav` dưới `Assets/Sounds/SFX/Cine/` |
| Doctor «HUD chưa câm khi quay phim» | bảng vừa vẽ vừa chạy logic mà thiếu cổng `StickmanUI.Filming` |
| Doctor «Kiểu chơi nào chưa có cốt truyện phim» | mọi `MissionType` (trừ `OpenWorldCity`) có ít nhất một bảng phân cảnh |
| Doctor «Logo chìm của video còn trống» | `Brand.asset` có tồn tại và có `watermark` + `channel` (chỉ réo khi đã dựng trường quay) |
| «★ Tự kiểm luật chơi» | ô khung đúng tỉ lệ khổ · **28 cốt truyện** có nhịp kết + thoại + tiếng · máy soạn ra phim theo preset **180–300 s ngang / 59–60 s dọc** và **cùng hạt giống ra cùng phim** · **người ≥ 4.5% chiều cao khung** ở mọi khổ · vùng an toàn nằm trong khung và chừa mép phải/dưới nhiều hơn · **khổ dọc chừa đáy ≥12% và KHÔNG kẻ thanh đen** · trục kịch tính chèn thật và từ chối ghép sai · sân 3/4 không có bục · **mỗi cốt truyện có ĐÚNG một thẻ kết quả** · **câu móc nằm trong 6 nhịp đầu** · **khổ dọc: mở màn ≤0.4 s · đuôi ≤5 s** · **ngữ pháp dựng**: câu thoại móc nằm trong cảnh bám đúng người nói (nhóm móc không bị xé) · `DecideTransition` lướt-không-tới ⇒ cắt, cắt-gần-y-khung ⇒ lướt · van «cảnh chết»: chưa đánh thì không bỏ vai · đang có chuyện thì bám tiếp · im >1.1 s giữa trận thì bỏ; cú dí cao trào không nhắm chủ tướng · **khung siết dần · cao trào chờ mốc thật · lượt sửa chạy hai lần ra cùng số giây** · **khuôn thời lượng đo bằng CẢ VIDEO ở mọi số hiệp (2·3·5·7 × dọc/ngang), số hiệp bị kẹp theo sức chứa của khổ** |

### 6. Bẫy đã đoán trước (chưa chơi thử thật — 2026-09-09)

- Chưa bấm nút trong Unity, chưa quay thử: hai lần biên dịch tách assembly xanh, Doctor có phép
  đo. Lần đầu quay: kiểm (a) `Hold` có giữ được hai đạo quân đứng yên ở `lineAt ±0.55` không
  (tầm nhìn AI ngắn hơn khoảng cách ~28 unit); (b) sát thủ có tới được VIP đang đi
  (`ProtectVip` là hộ tống di chuyển) trong 25 s không — nếu không, tăng timeout hoặc hạ
  `halfWidth`; (c) `GameViewInputSettings` có tự đổi cỡ Game view sang 1080×1920 không.
- `MatchDirector` khi được chấm (`AllowVerdict`) tự slow-motion lúc kết thúc — Director đè lại
  `timeScale` mỗi `LateUpdate`, cố ý: phim là chủ thời gian.
- `SkyBackdrop`/`WeatherAmbience` bám camera bằng `LateUpdate` — thứ tự với `CinematicCamera`
  không định; nếu thấy trời trễ một khung thì đặt Script Execution Order cho `CinematicCamera` sớm hơn.
