## CỠ NHÌN CỦA CAMERA — `StickmanCameraZoom` (một cỡ cho cả dự án)

Camera được bake vào từng scene với `orthographicSize` **từ 3.2 tới 10** — chênh nhau 3.2 lần.
Nhân vật cao 0.73 unit nên tuỳ màn mà nó chiếm **3.6% tới 11.4%** chiều cao màn hình: đổi bài
một cái là cỡ người nhảy loạn, và không có "cảm giác cỡ người" ổn định nào để thiết kế art hay
HUD theo. Không phải mỗi map một ý đồ — chỉ là mỗi builder gõ một số, không ai đối chiếu với ai.
Kèm theo đó, số hay gặp nhất (7 ⇒ khung nhìn cao 14 unit) là **nhìn quá xa**: nhân vật 5% chiều
cao màn hình ⇒ 1.5 cm trên desktop nhưng **3.6 mm** trên điện thoại nằm ngang, mũi tên thì 1.5 mm.

Sáu luật:

1. **CỠ NHÌN ĐO BẰNG THẾ GIỚI, KHÔNG NHÂN VÀO CỠ CỦA SCENE.** Nhân hệ số vào là giữ nguyên
   chênh lệch 3.2 lần — vẫn "chỗ to chỗ nhỏ", chỉ đều hơn một chút. **`DesignViewHeight` = 5.0**
   (nhân vật kể cả nón chiếm ~15.5% chiều cao — cỡ đã chốt trên máy thật: bản 4.5 bị chê hơi to,
   user soi thấy mức `0.9×` mới đúng, mà 4.5 ÷ 0.9 = 5.0) là số quyết định tất cả.
   **Áp GIỐNG NHAU cho máy tính, Editor và điện thoại** — một khoá PlayerPrefs chung cho hệ số
   người chơi tự chỉnh; chia hai bộ nhớ theo nền tảng là quay lại đúng bệnh đang chữa.
2. ⚠ **NEO VÀO CHIỀU CAO — ĐÓ LÀ CÁCH DUY NHẤT ĐỂ EDITOR VÀ ĐIỆN THOẠI NHÌN GIỐNG NHAU.**
   `orthographicSize` đo theo chiều cao, nên neo chiều cao là mọi tỉ lệ màn hình ra đúng một
   cỡ người; đổi lại màn hẹp thấy ít bề ngang hơn — chuyện đó không tránh được, chỉ chọn được
   cái nào cố định. `DesignViewWidth` (5) chỉ là **lưới an toàn** cho cửa sổ gần vuông và cố ý
   để THẤP: số cũ (9.5) cắn ở mọi tỉ lệ hẹp hơn 20:9 — tức gần như mọi cửa sổ Game view — nên
   Editor tự lùi camera ra và nhân vật ở đó BÉ HƠN máy thật, đúng câu "sao không đồng bộ với
   editor".
   ⚠ Cỡ chuẩn HẸP HƠN TẦM CUNG (`_effectiveRange` = 8 > nửa khung ~4.5): cung thủ địch bắn tới
   được mình từ ngoài khung hình. Đó là **cái giá của việc chơi gần**, đã chốt — bấm `-` một
   hai nhát là thấy hết tầm bắn và mức đó được nhớ lại.
   ⚠ **Số cỡ nhìn phải HIỆN RA Ở CẢ HAI HUD** — nhãn `1.0×` giữa hai nút `-` `+` (cảm ứng) và
   dòng *Cỡ nhìn [- =]* trong bảng hướng dẫn (desktop). Mức zoom nhớ qua `PlayerPrefs`, mà
   **PlayerPrefs nằm RIÊNG trên từng máy**: Editor một bộ, điện thoại một bộ. Không hiện con số
   thì hai bên đang ở hai mức khác nhau mà không ai lần ra được — đúng câu *"trên editor zoom
   hơi lớn, không rõ mobile thế nào"*.
   ⚠ **KHÔNG LƯU hệ số zoom** — mỗi lần vào game là về đúng cỡ chuẩn, `+` `-` chỉ sống trong
   một lần chơi. Lưu qua `PlayerPrefs` là sinh ra một lớp lỗi không lần ra được: PlayerPrefs
   nằm RIÊNG trên từng máy nên Editor và điện thoại giữ hai hệ số khác nhau, nhìn ra hai cỡ
   người khác nhau dù chạy cùng một dòng code — và sửa `DesignViewHeight` cũng không tới được
   máy nào đang giữ số cũ. Nhớ `[RuntimeInitializeOnLoadMethod]` để tắt Domain Reload vẫn đúng.
3. ⚠ **AI GỌI:** ai làm chủ camera thì hỏi `SizeFor(aspect)` mỗi frame và gọi `ConsumeInput()`
   — `DemoCameraFollow` (44 scene chơi) · `StickmanAILabHud` (phòng thí nghiệm). ĐỪNG gán
   `orthographicSize` ở chỗ khác: hai chủ ghi chung một biến là cỡ nhìn nhấp nháy theo thứ tự
   script. Phần đọc lệnh zoom (chụm 2 ngón · nút · phím) gom trong `ConsumeInput` và **chốt
   theo frame** — kênh `Consume*` chỉ trả về MỘT LẦN, hai người cùng đọc là nuốt mất của nhau.
4. ⚠ **GIỚI HẠN LIA PHẢI TÍNH TỪ MÉP MAP, KHÔNG TRỪ LỀ SẴN.** Đây là chỗ làm *"zoom xong thấy
   map xê dịch"*. Builder cũ cất `mépMap + cỡCamera × 1.6` vào `_minX/_maxX` — số CHẾT tính từ
   cỡ camera bake, trong khi lề thật phụ thuộc khung nhìn ĐANG có (tỉ lệ màn hình + mức zoom).
   Nay builder khai `_mapFromX/_mapToX` (và `MapAssembler` gọi `SetMapRange`), còn
   `DemoCameraFollow` tính lề mỗi frame: **mép thế giới luôn trùng mép màn hình ở mọi mức
   zoom**. Scene cũ tự suy ngược mép map từ `_minX/_maxX` nên không phải dựng lại.
   Cùng lý do, `StickmanAILabHud.MaxPan` đo bằng cỡ ĐANG NHÌN, không phải `scenario.cameraSize`.
5b. ⚠ **CỠ NHÌN GẦN ĐÒI CAMERA PHẢI BIẾT NHÌN VÀO ĐÂU.** Scene QUAN SÁT (không có người chơi
   để bám: `Demo_19`, sân đấu AI, map ở vai `Observer`) trước đây để camera đứng ở `x = 0`. Ở
   khung cao 14 unit thì đứng giữa map vẫn thấy cả hai phe nên không ai để ý; ở cỡ chuẩn mới
   thì giữa map là **khoảng trống** — mở scene ra thấy trời với núi, tưởng scene hỏng.
   `DemoCameraFollow.ResolveFocus` nay bám **trung điểm của CẶP ĐỊCH GẦN NHAU NHẤT** (chỗ đang
   đánh nhau). ⚠ Lấy trung bình cả sân là ra đúng khoảng trống giữa hai phe; và phải lọc
   `StickmanFighterController` còn sống — tường/tháp cũng có `TeamMember`.

5. ⚠ **PHÒNG THÍ NGHIỆM AI DÙNG CHUNG CỠ CHUẨN.** Trước đây mỗi bài tự đặt cỡ riêng (6→12) nên
   chấm hành vi AI ở một cỡ người khác hẳn lúc chơi thật — chấm ở cỡ khác thì chấm cái gì. Bài
   nào rộng thì LIA (kéo màn hình / ◀ ▶) hoặc bấm `-`; hàng nút *Cỡ nhìn* nằm ngay trên bảng
   vì đó là chỗ duy nhất của phòng thí nghiệm.
   ⚠ **NGOẠI LỆ DUY NHẤT: `Demo_5_Testbed`** — hai tab đặt cỡ 1.2 (soi dáng cầm vũ khí, gần
   gấp đôi cỡ chuẩn) và 4. Đó là KHUNG HÌNH CỦA BÀI, không phải số gõ bừa; ép chuẩn hoá vào là
   mất công dụng của tab đó.
6. ⚠ **AI LAB / BÀN THỬ KHÔNG ĐƯỢC CÓ CẦN ẢO.** `StickmanTouchPatchTool.HasPlayer` phải hỏi
   nhãn **`PlayerCharacter`**, ĐỪNG hỏi "fighter mà không có agent": `StickmanDummy` (bia tập)
   là variant của `StickmanFighter` nên thừa hưởng `_useInput = true` và tất nhiên không có
   agent — luật cũ trả true ở mọi scene có một cái bia, và tool nhét cần ảo + nút ĐÁNH vào hai
   chỗ chỉ để NGỒI XEM.

Đổi cỡ lúc chơi: **`+` `-`** trên HUD cảm ứng · **chụm 2 ngón** · phím **`-` / `=`** trên máy
tính · hàng *Cỡ nhìn* trong AI Lab. Hệ số KHÔNG lưu lại (mỗi lần chơi tính từ cỡ chuẩn), kẹp trong `[0.6 … 2.9]` (trần
2.9 = khung cao 14.5 unit, đúng cỡ bake cũ của phần lớn scene — không nới trần thì không có
cách nào lùi ra xem đội hình).
⚠ **KHÔNG dùng con lăn chuột** — nó đã là phím ĐỔI VŨ KHÍ
(`StickmanFighterController._switchWeaponWithScroll`); một cử chỉ hai chủ thì kiểu gì cũng có
một bên hỏng (đúng bài học phím `C` vừa bò vừa gọi camera).


## CỠ NHÌN SÂN 3/4 — `GroundViewHeight` = 7 (2026-09-17)

Sân mặt đất có SỐ RIÊNG vì trục Y ở đó là **chiều sâu**, không phải độ cao: cắt bớt chiều cao
khung là cắt đúng dải đi lại, chứ không phải cắt trời. Nhưng số cũ (9) làm nhân vật chỉ chiếm
**8.1%** chiều cao màn hình — bé hơn sân ngang 1.8 lần, đúng cái chênh lệch `StickmanCameraZoom`
sinh ra để xoá. Nay **7** ⇒ khung `12.4 × 7.0` unit ở 16:9, nhân vật **10.4%** (to hơn 1.29 lần).

Vì sao KHÔNG hạ hẳn về `DesignViewHeight` (5) cho bằng sân ngang:

* Bề sâu thấy được còn **5 unit**, trong khi `AIProfile.visionRange` = 7 và tầm súng 6–12 —
  ở sân ngang chuyện "bị bắn từ ngoài khung" chỉ xảy ra theo bề NGANG, ở sân 3/4 nó xảy ra
  theo CẢ HAI trục vì cả hai đều là mặt đất.
* Trần lùi xem toàn cảnh tụt còn `5 × 2.9 = 14.5` unit < bề sâu sân (`halfDepth` 8–11 ⇒ 16–22):
  **không mức zoom nào** nhìn hết được sân nữa. Với 7 thì trần là 20.3 — vẫn phủ gần hết.

Muốn đổi tiếp thì sửa đúng hằng số đó; đừng gán `orthographicSize` theo map (luật 3).

## KÉO MỘT NGÓN ĐỂ LIA MAP — `DemoCameraFollow.ReadObserverDrag` (2026-09-07)

Nguồn kéo chính (`StickmanTouchInput.ConsumeCameraPan`, chụm hai ngón) do `StickmanTouchControls`
nạp, mà component đó tự ẩn khi `StickmanUI.ControlsSuppressed`. `ReadObserverDrag` là nguồn THỨ
HAI, tự đọc chạm/chuột — nó chỉ được bật khi **cú kéo đang rảnh chủ** (luật *một cử chỉ MỘT CHỦ*):

* scene QUAN SÁT (`_target == null`);
* người chơi đang nằm chờ hồi sinh (`TargetIsDown`);
* **`StickmanUI.ControlsSuppressed`** — người chơi đã buông nhân vật: đang mở bảng ra lệnh, hoặc
  đang ở chế độ chỉ huy của mode kinh tế (xem `UI.md`).

Thiếu vế thứ ba thì công tắc «CẦM QUÂN ↔ CHỈ HUY» cất được cần ảo nhưng cú kéo vẫn không thành lia
map, và người chơi vẫn phải chạy bộ sang đầu kia map để bấm một nông dân.

### ⚠⚠ ĐƯỜNG CHẠM CŨNG PHẢI HỎI `PointerOverHud`

Đường CHUỘT đã hỏi từ lâu, đường CHẠM thì chưa — không lộ vì scene nào bật `_observerDrag` cũng
chỉ có bảng IMGUI thưa thớt. Nay mode kinh tế bật nó giữa một HUD Canvas kín nửa màn hình: thiếu
câu hỏi ấy là mỗi cú bấm nút mua lính cũng kéo cả map trôi đi dưới ngón tay.

Chỉ hỏi ở nhịp **`TouchPhase.Began`**. Hỏi luôn ở nhịp kéo thì ngón lướt ngang qua một cái bảng là
cú kéo đứt quãng, camera giật từng khúc.

## ⚠⚠ ĐỘ TRỄ CAMERA PHẢI ĐO BẰNG MÀN HÌNH, KHÔNG BẰNG GIÂY (2026-09-09)

User: *"camera nhiều lúc không theo kịp nhân vật"*.

`DemoCameraFollow` bám bằng `Vector3.SmoothDamp(…, _smoothTime)`. Độ trễ đứng yên của
`SmoothDamp` với mục tiêu chạy đều là **`tốc độ × smoothTime`** — tính bằng UNIT thì cố
định, nhưng cái MẮT nhìn thấy là TỈ LỆ VỚ MÀN HÌNH. `_smoothTime = 0.25` được chọn hồi
camera còn bake `orthographicSize` 7–10; từ khi `StickmanCameraZoom` chuẩn hoá khung nhìn về
cao 5 unit (nửa màn hình ~4.44) thì cùng con số ấy thành:

| Tốc độ | Lệch tâm — cam cũ (size 7) | Lệch tâm — cỡ chuẩn bây giờ |
|---|---|---|
| đi bộ 2.2 | 4% | 12% |
| chạy 3.9 | 8% | 21% |
| ngựa 6.0 | 12% | 33% |
| ngựa cấp 5 ≈ 7.4 | 14% | 40% |
| xe / khinh công ≈ 11 | 21% | **61%** |

61% nửa màn hình = nhân vật dính mép. Đo bằng
`.claude/skills/stickman-assets/scripts/camlag2.py` (port công thức `SmoothDamp` của Unity,
mục tiêu nhảy từng bước 50 Hz đúng như rigidbody để `Interpolate: None`).

**Cách chữa — `_maxLagScreens` (mặc định 0.15):** không kẹp camera bằng tay sau khi lọc (kéo
tay là truyền luôn cái giật 50 Hz vào camera), mà **siết chính hằng số lọc**:
`smoothTime = clamp(trần / tốc độ mục tiêu, 0.05, _smoothTime)`. Độ trễ bị chặn đúng bằng
trần mà camera vẫn chỉ đi qua MỘT bộ lọc. Đo lại: mọi tốc độ đều về **14%**, độ gập ghềnh
3–11% (ở tốc độ chạy là 3%, không nhìn ra).

⚠ **Chỉ siết TRỤC NGANG.** Độ trễ dọc chính là cảm giác "nặng" của cú nhảy; siết nó theo
tốc độ chạy ngang thì vừa chạy vừa nhảy là cả màn hình giật theo từng bước chân.

⚠ **Sửa bằng FIELD MỚI, không hạ `_smoothTime`.** `_smoothTime` đã bake trong 44 scene: đổi
mặc định trong code thì scene cũ vẫn giữ 0.25 và không gì thay đổi. Field MỚI thì scene cũ
không có dòng nào để đè ⇒ nhận đúng mặc định trong code.

→ Muốn hết **gập ghềnh** tận gốc thì bật `Rigidbody2D.interpolation = Interpolate` cho nhân
vật (hiện `Character.prefab` để `None` cho cả 11 rigidbody) — việc đó đụng asset chung nên
phải cân nhắc riêng, không gộp vào đợt này.
