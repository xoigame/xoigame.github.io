## GIAO DIỆN — luật để bấm được trên điện thoại

Toàn bộ HUD dự án vẽ bằng IMGUI với hằng số PIXEL. Trên desktop 96 dpi thì `RowHeight = 26f`
≈ 6.9 mm — bấm được. Trên điện thoại 400 dpi thì đúng 26 px ấy ≈ **1.6 mm**: nhìn không ra,
bấm không trúng. Đây KHÔNG phải chuyện thẩm mỹ mà là **không thao tác được**.
Mười hai luật, ruột nằm ở `Assets/Scripts/Core/UI/StickmanUI.cs`:

⚠ **ĐIỆN THOẠI LÀ MẶC ĐỊNH, KHÔNG PHẢI BẢN PHỤ.** Luật bao trùm cả mục này: **mọi tính năng
phải dùng được CHỈ BẰNG NGÓN TAY.** Phím tắt là lối tắt cho desktop, KHÔNG BAO GIỜ là đường
duy nhất — thêm phím tắt mới thì phải thêm nút trên màn hình **trong cùng lần sửa**, không để
lại sau. Và **nhãn thì bấm không được**: bảng chỉ huy từng vẽ dòng chữ `[F9] hiện bảng chỉ huy`
bằng `GUI.Label`, nên trên điện thoại cả cái bảng đó **không có cách nào mở** — không lỗi nào
báo, chỉ là một tính năng lặng lẽ biến mất trên nửa số máy.

⚠⚠ **DÍNH LẦN THỨ HAI, VÀ LẦN NÀY LÀ CỬA RA CỦA CẢ VÁN CHƠI.** `GameSession.DrawResult` vẽ
`SPACE — ván tiếp theo` và `T — chơi lại` bằng `GUI.Label`, còn `HandleResultKeys` chỉ nghe
BÀN PHÍM. Trên điện thoại thì **bảng kết quả là ngõ cụt tuyệt đối**: thắng xong ngồi nhìn cái
bảng, không có gì bấm được, hết đường chơi ván sau — mà chính "ván sau" là toàn bộ giá trị
chơi lại của tầng game. Không lỗi nào báo. Ba điều rút ra, áp cho MỌI màn hình chặn luồng
(kết quả · tạm dừng · chọn thưởng · xác nhận):
· **Màn hình nào CHẶN luồng chơi thì lối thoát PHẢI là `GUI.Button`**, không được chỉ là phím.
  Tự hỏi: *"rút bàn phím ra thì còn ra khỏi màn hình này được không?"*
· **Đừng chỉ tin `Input.GetMouseButtonDown` để nhận chạm** — đó là chuột GIẢ LẬP TỪ CHẠM,
  `simulateMouseWithTouches` là một cờ có thể tắt. Hỏi thêm `Input.touches`.
· **Nút chặn-luồng KHÔNG được `LoadScene` ngay trong `OnGUI`** — nó huỷ chính object đang vẽ
  dở, IMGUI mất khối GUIClip đang mở và Unity nhả một tràng *"pushing more GUIClips than you
  are popping"*. Đặt cờ, thực thi ở `Update`.
· Ngược lại: màn hình có NHIỀU LỰA CHỌN thì **đừng cho chạm-nền kích hoạt** (bảng kết quả có
  "ván mới" và "chơi lại cùng seed" — chạm nhầm là mất luôn cái seed đang muốn soi). Chạm nền
  chỉ hợp với màn hình một-lối-ra như màn bắt đầu.


1. **MỌI `OnGUI` KHAI BÁO Ở DÒNG ĐẦU** — `StickmanUI.Begin()` (vẽ trong khung đã scale), hoặc
   `StickmanUI.End()` (muốn PIXEL THẬT). Khai ở ĐẦU chứ không dọn ở cuối: IMGUI đầy chỗ
   `return` giữa chừng, bắt nhớ `End()` trước từng `return` là kiểu luật chắc chắn có ngày
   quên — mà quên một chỗ là HUD vẽ SAU nó phóng to gấp đôi, lỗi nhìn như ma ám. Khai ở đầu
   thì **thứ tự vẽ không còn quan trọng** và không ai phải dọn cho ai.
2. **KHÔNG dùng `Screen.width`/`Screen.height` trong code GUI** — dùng `StickmanUI.Width`/
   `.Height` (đơn vị thiết kế, ĐÃ trừ tai thỏ/bo góc). Dùng `Screen.*` là HUD lệch đúng bằng
   hệ số scale, desktop không thấy (scale 1) nhưng điện thoại thì bay ra ngoài màn.
3. **Điểm từ `WorldToScreenPoint` phải qua `StickmanUI.FromScreen`** — nó là pixel THẬT còn
   khung GUI đang scale; tự `Screen.height - screen.y` là nhãn bám vật trong thế giới bay
   khỏi màn hình.
4. **Cái gì BẤM ĐƯỢC thì cao bằng `StickmanUI.Row`** — 34 đơn vị trên desktop, 44
   (`StickmanUI.TouchTarget`, ≈ 9–10 mm) trên cảm ứng; hàng phụ như tab dùng
   `StickmanUI.SmallRow`. **ĐỪNG gõ lại `IsTouch ? TouchTarget : 26f` trong từng HUD** như bản
   cũ: cỡ nút nằm rải mỗi file một bản thì chỉnh một nấc phải đi sửa cả chục chỗ, mà sót một
   chỗ là đúng chỗ đó bấm không trúng. Desktop nâng 26 → 34 vì phản hồi thật của người dùng
   ("khó bấm cả trên editor") — chuột nhắm chính xác hơn ngón tay, nhưng dải chữ cao 26 trong
   cửa sổ editor nhỏ vẫn quá mảnh. Nút nhỏ hơn số này là LỖI GIAO DIỆN, không phải "gọn gàng".
5. **HUD phải vừa khung `560 × 400` đơn vị** (`StickmanUI.MinDesignWidth/Height`). Phóng to
   thì khung vẽ HẸP đi (khung = pixel ÷ scale), nên HUD vẽ rộng hơn số này sẽ **ép cả giao
   diện của mọi màn hình nhỏ co lại theo** — không phải chỉ riêng nó bị tràn.
6. **`StickmanTouchControls` là NGOẠI LỆ DUY NHẤT** — cần ảo + nút bấm tự hit-test
   `Input.touches` bằng toạ độ màn hình THẬT, và vốn đã đo mọi thứ theo tỉ lệ `Screen.height`
   nên không phụ thuộc dpi. Cho nó đi qua thước đo chung là chỗ vẽ lệch hẳn khỏi chỗ chạm.
   Nó gọi `StickmanUI.End()` ở dòng đầu.
7. **Đoán sai cỡ thì sửa TẠI MÁY THẬT, đừng build lại**: nút `×1.2` trên thanh chọn scene
   nhích cỡ giao diện một nấc và nhớ luôn (PlayerPrefs). Cỡ tự đoán theo `Screen.dpi`
   (rơi về ước lượng theo độ phân giải khi dpi trả 0 — khá nhiều máy và mọi trình giả lập).
8. **Vẽ dưới thanh chọn scene thì HỎI `DemoSceneSwitcher.BarBottom`, đừng gõ `56f`.**
   Bảy HUD từng gõ cứng số đó — vừa đúng cho thanh cao 26 trên desktop, nhưng cảm ứng thanh
   cao 44 (đáy 64) nên bảng ĐÈ LÊN đúng cái thanh cần bấm. Số nào hai HUD cùng phải biết thì
   phải có MỘT CHỦ, không phải hai bản chép tay.
8b. ⚠⚠ **GÓC TRÊN-PHẢI CŨNG PHẢI CÓ MỘT CHỦ — `StickmanUI.CornerButton`.**
   Đây là mục 8 lặp lại ở trục NGANG, và nó đã dính thật. Dưới thanh chọn scene, góc phải là
   chỗ ĐÔNG NHẤT dự án: xưởng map · ô chọn nền văn minh · bảng mục tiêu · kho tài nguyên ·
   sân map đều tự neo vào `Width − <số của riêng mình>` ở CÙNG một cao độ. Mỗi HUD tính đúng
   phần của nó, ghép lại thì đè nhau: nút **«NỀN VĂN MINH»** (rộng 268) phủ kín nút **«Xưởng
   map»** (rộng 118) ⇒ cái nút dưới **không còn bấm được**, và không có lỗi nào báo.
   · **Nút** xin ô qua `StickmanUI.TopRightButton(slot)` — bảng bề rộng nằm ở Core, xếp
     phải→trái theo thứ tự enum. Thêm nút góc mới = 1 giá trị enum + 1 bề rộng, KHÔNG đi sửa
     toạ độ mấy nút cũ.
   · **Bảng** neo mép phải thì bắt đầu ở `StickmanUI.TopRightPanelTop` (dưới hàng nút). Không
     có nút góc nào thì thuộc tính này tự trả về mốc cũ, nên không chừa dải trống vô nghĩa.
   · **Chỉ MỘT bảng góc được bung** (`SetCornerPanel`/`CornerPanelOpen`): hai bảng cùng neo
     mép phải và cùng rộng 250–420 thì bung cả hai là lại đè nhau, chỉ khác chỗ. Vì vậy hai
     HUD BỎ cờ `_open` riêng, hỏi chung trọng tài ở Core.
   ⚠ **Đăng ký theo VÒNG ĐỜI (`OnEnable`/`OnDisable`), đừng đếm trong `OnGUI`.** `OnGUI` chạy
   nhiều lượt mỗi frame (Layout rồi Repaint) và thứ tự giữa các component không có gì bảo
   đảm — đếm ở đó thì hàng nút NHẢY CHỖ giữa hai lượt vẽ, tệ hơn hẳn cái lỗi đang chữa.

9. **Bảng chữ dài phải ĐÓNG ĐƯỢC và CUỘN ĐƯỢC.** `StickmanDemoHud` có nút ▲/▼ (phím **H**),
   trạng thái nhớ qua `PlayerPrefs` — bấm R hay đổi bài là component sinh lại từ đầu, không
   nhớ thì người chơi phải đóng lại mỗi lần vào bài mới, và chính cái đó mới gây khó chịu.
   Ruột bảng nằm trong `BeginScrollView`: hướng dẫn vài bài dài hơn cả màn hình điện thoại
   nằm ngang, không cuộn thì mấy dòng cuối bị cắt và không cách nào đọc tới.
10. **THỬ BỐ CỤC ĐIỆN THOẠI NGAY TRONG EDITOR — nút `PC / ĐT` trên thanh chọn scene**
   (`StickmanUI.ForceTouch`, nhớ qua PlayerPrefs). Bật là ĐỔI TRỌN BỘ: cỡ hàng lên 44, hàng
   phụ lên 44, và `StickmanTouchControls` hiện cần ảo + nút bấm.
   ⚠ **Kéo Game view về tỉ lệ điện thoại là KHÔNG ĐỦ**: `Input.touchSupported` trên Windows
   trả FALSE nên `IsTouch` vẫn false → vẫn là bố cục DESKTOP (hàng 34). Nhìn thì tưởng đã xem
   giao diện mobile, thực ra chưa xem lần nào — đây đúng là cách UI mobile bị bỏ quên hết lần
   này tới lần khác. Trên máy thật nút này TỰ ẨN (`Application.isMobilePlatform`), không ai
   tắt nhầm được.
   Còn nợ hai phím chưa có nút: `Tab` (đổi tab ở bàn thử) · `F` (đổi văn minh ở sân đấu).
   Ai đụng vào hai HUD đó thì thêm nút luôn.
11. ⚠⚠ **"DỄ BẤM" ĐO BẰNG KHOẢNG CÁCH TỚI GỐC NGÓN CÁI, KHÔNG ĐO BẰNG CỠ NÚT.**
   Ngón cái quay quanh MỘT ĐIỂM ở góc dưới-phải; quá **~55 mm** là phải ĐỔI CÁCH CẦM MÁY, mà
   đổi cách cầm giữa trận nghĩa là **buông cần ảo**. Bố cục cũ của `StickmanTouchControls` là
   lưới chữ nhật 3 cột × 2 hàng cộng một HÀNG NGANG chạy dọc mép trên — đo ra **5 trong 12 nút
   nằm ở 58–86 mm**. Nút vẫn to 11 mm và vẫn "đủ chuẩn kích thước", nên đọc code chẳng thấy gì
   sai; **chỉ ĐO mới thấy**.
   Nay xếp theo **CUNG NGÓN CÁI** quanh nút ĐÁNH: tâm ĐÁNH · vòng 1 NHẢY·ĐỠ·CHẠY · vòng 2
   VŨ KHÍ·NHẶT·NGỰA·⋯ · vòng 3 (KHAY ⋯, chỉ bung khi bấm) BÒ·KÉO·GIỮ·CHẠM·CAM·+·−.
   Đo lại trên 1080p/402 dpi: nút thường trực xa nhất **83 → 35 mm**, số nút ngoài tầm với
   **5 → 0**, vùng ngắm-bắn tự do **53 → 54%** diện tích.
   · ⚠ **MỖI NÚT MỘT CHỖ ĐỨNG CỐ ĐỊNH.** Nút ngữ cảnh ẩn đi thì để TRỐNG ô của nó, tuyệt đối
     không dồn mấy nút còn lại lên — dồn là mỗi trận nút nằm một chỗ khác, và trí nhớ ngón tay
     (thứ duy nhất cho phép bấm trúng mà không rời mắt khỏi trận) mất sạch.
   · ⚠ **KẸP chứ không BỎ**: nút tràn mép màn hình / đội lên HUD thì kéo về, đừng bỏ vẽ — chỗ
     đứng phải TẤT ĐỊNH.
   · ⚠ **Cụm nút KHÔNG được đội lên hàng nút HUD góc trên-phải** (`StickmanUI.TopRightPanelTop`).
     Hai hệ đó KHÔNG BIẾT NHAU (IMGUI ↔ `Input.touches` tự hit-test), chồng lên nhau là MỘT cú
     chạm kích CẢ HAI và **không lỗi nào báo**. Bản cũ để hàng nút cỡ nhìn nằm đúng dải ngang
     của thanh chọn scene, đo ra là vùng bắt nút `−` ăn lẹm nút «R Chơi lại» ~26 px.

12. ⚠⚠ **CỠ NÚT PHẢI CÓ SÀN/TRẦN TÍNH BẰNG MILIMET, KHÔNG CHỈ THEO % CHIỀU CAO MÀN HÌNH**
   (`StickmanUI.PixelsPerMm` — CHỦ DUY NHẤT của "một milimet là bao nhiêu pixel").
   Thứ quyết định bấm có trúng không là **NGÓN TAY — một cỡ trên mọi máy**, không phải màn
   hình. Cùng con số `0.17 × Screen.height` ra nút 11 mm trên điện thoại (vừa) và **23 mm trên
   máy tính bảng 10 inch**, kèm cả cụm trải ra tới **173 mm** tính từ gốc ngón cái. Kẹp lại
   [10 … 13 mm] thì tablet về **13 mm / xa nhất 43 mm**.
   · ⚠ **CHỈ kẹp trên máy thật** (`Application.isMobilePlatform`): trên PC `Screen.dpi` là dpi
     của màn hình MÁY TÍNH (~96), kẹp theo nó thì nút co còn một phần tư và nút **PC / ĐT** hết
     soi được bố cục điện thoại — tức mất đúng công cụ sinh ra để khỏi phải build mới biết.
   · ⚠ `Screen.dpi` trả **0** trên kha khá thiết bị và mọi trình giả lập ⇒ `StickmanUI.Dpi` vá
     sẵn (đoán theo cạnh ngắn). Đừng chép lại phép đoán đó ở chỗ thứ hai.

13. ⚠⚠ **VÙNG BẮT LÀ HÌNH TRÒN VÀ PHẢI THA THỨ CHO CÚ BẤM HỤT — vì "bấm hụt" ở đây KHÔNG
   PHẢI là không có gì xảy ra, mà là MỘT HÀNH ĐỘNG SAI.** Chạm nền màn hình = **NGẮM & BẮN**,
   nên hụt vài milimet là nhân vật quay ngoắt sang hướng ngón vừa chạm rồi chém một nhát trời
   ơi — đó là phần lớn cảm giác *"điều khiển nhân vật không được"*.
   Nút vẽ ra hình TRÒN nên vùng bắt chữ nhật thừa ra bốn GÓC, đúng chỗ hai nút kề nhau tranh
   nhau. Nay bắt theo **hình tròn bán kính `_touchSnap` = 1.5 × bán kính vẽ** (diện tích gấp
   2.25 lần), và **gần TÂM nào thì ăn nút đó** (chuẩn hoá theo bán kính từng nút để nút to
   không ăn hiếp nút nhỏ bên cạnh).
   · ⚠ Đọc `Max(_touchSnap, _touchPadding)`: `_touchSnap` là field MỚI (scene đã bake nhận giá
     trị khởi tạo trong code) còn `_touchPadding` đã nằm trong 40+ file scene và không tự đổi.
   · ⚠ **PHẢN HỒI PHẢI VẼ RA NGOÀI RÌA NÚT**: ngón tay che kín cái nút đang bấm, nên mọi hiệu
     ứng vẽ BÊN TRONG đều vô hình đúng lúc cần nhất. Vòng sáng loé ra ngoài mới phân biệt được
     "máy chưa nhận" với "máy nhận rồi mà nhân vật đang bận hồi chiêu" — không phân biệt được
     thì cả hai đều bị đọc thành "bấm không ăn".

14. ⚠ **NÚT KHÔNG DÙNG ĐƯỢC THÌ ẨN ĐI — chỗ đặt nút là tài nguyên KHAN HIẾM NHẤT.** Màn hình
   điện thoại nằm ngang rộng ~150 mm mà tầm với ngón cái chưa tới 50 mm, nên một nút cả ván chỉ
   dùng vài lần mà chiếm chỗ suốt trận là **đẩy nút hay dùng ra xa tầm với**. Khuôn có sẵn:
   `StickmanTouchInput.MountAvailable` → nay thêm `PickupAvailable` (`StickmanPickupPrompt` ghi)
   và `CanGuard` (`StickmanFighterController` ghi), đều là **ĐẦU VÀO GHI MỖI FRAME** nên không
   ai phải nhớ tắt hộ. Cầm cung mà vẫn hiện nút ĐỠ thì đó là một nút **bấm vào không xảy ra
   gì** — nó dạy người chơi rằng bấm nút ở game này là hên xui, và từ đó mọi lần bấm hụt THẬT
   đều bị đổ cho "game lag".
   ⚠ Nút hiếm dùng thì cho vào **KHAY ⋯** (tự đóng sau 7 s không ai đụng), đừng xoá: khay để mở
   thì nó ăn đúng phần màn hình mà cử chỉ ngắm-bắn đang cần. ⚠ Chỉ nút TRONG KHAY mới gia hạn
   đồng hồ tự đóng — để mọi cú bấm gia hạn thì hễ còn đánh nhau là khay không bao giờ đóng.

15. ⚠⚠ **LIA CAMERA PHẢI CÓ ĐỦ HAI TRỤC.** Kênh lia (`StickmanTouchInput.AddCameraPan`) từng
   là một `float` trục X, và **cả hai** hệ camera của dự án cũng chỉ giữ offset ngang
   (`DemoCameraFollow._manualOffsetX` · `StickmanAILabHud._panOffset`) — nên kéo màn hình chỉ
   xem được TRÁI/PHẢI. Không lỗi nào báo: cú kéo vẫn được đọc, chỉ là thành phần Y bị vứt đi.
   Mà map của dự án dựng theo **cả chiều DỌC** — tường thành cao 2.4 có mặt đi được, tháp canh
   có sàn cho cung thủ trấn thủ, đường trên tầng hai của map lắp ghép, hồ nước dưới chân — nên
   thiếu trục Y là **bỏ mất nửa cái map**, và bài «Địa hình cao» của AI Lab thì không có cách
   nào ngó lên xem chuyện gì đang xảy ra trên mặt tường.
   · ⚠ **Trục dọc KHÔNG có "mép map" để kẹp** (`_mapFromX/_mapToX` chỉ khai bề ngang). Kẹp
     theo **SỐ MÀN HÌNH** tính từ khung nhìn ĐANG CÓ — cùng lý do trục ngang tính lề tại chỗ
     thay vì trừ sẵn một con số chết: phóng to thì mỗi màn hình ít unit hơn, cảm giác lia vẫn
     y hệt ở mọi mức zoom. Lên nhiều hơn xuống (1.1 / 0.7 màn hình): dưới mặt đất chỉ có nền
     trời, thứ đáng xem đều ở TRÊN.
   · ⚠ **KẸP CHÍNH PHẦN LIA TAY, không chỉ kẹp kết quả** — kéo quá giới hạn mà vẫn cộng dồn
     thì lúc kéo ngược lại phải kéo hết đoạn thừa camera mới nhúc nhích, nhìn như bị kẹt.
   · ⚠ **Mọi chỗ reset lia phải reset CẢ HAI TRỤC** (nút CAM · phím V · hồi sinh · đổi map ·
     đổi bài test). Sót một chỗ là camera về đúng cột dọc mà vẫn treo lơ lửng trên cao.
   · ⚠ **HAI HỆ CAMERA, PHẢI SỬA CẢ HAI.** AI Lab cố ý KHÔNG dùng `DemoCameraFollow` (mỗi bài
     tự đặt khung nhìn), nên nó có bản lia riêng — sửa một bên là bên kia vẫn cụt trục.

16. ⚠⚠ **BẢNG HUD KHÔNG ĐƯỢC TỰ ĐOÁN CHIỀU CAO — `GUILayout.BeginArea` CẮT CỤT TRONG IM LẶNG.**
   `DuelLabHud` khai `height = Row * 4 + 96` — một con số gõ tay không liên quan gì tới thứ
   đang vẽ (mỗi phe 7 hàng: tên · thanh máu · máu · vũ khí · cấp AI + quân số · «đang» · bộ
   đếm). Nội dung cao hơn thì `BeginArea` cắt, và **cái bị cắt lại đúng là HÀNG NÚT dưới cùng**
   (▶ BẮT ĐẦU · ĐẶT LẠI SÂN · Hồi máu): bảng vẫn hiện, chữ vẫn đọc được, chỉ là không bấm được
   cái nút quan trọng nhất — người dùng đọc ra là *"menu tràn ra khỏi màn hình, không bấm được"*.
   · **ĐO, đừng đoán**: bọc nội dung trong `BeginVertical`, đọc `GUILayoutUtility.GetLastRect()
     .height` ở nhịp **Repaint** rồi dùng cho frame SAU (nhịp Layout chưa có số). Trễ một frame
     ở lần hiện đầu, đổi lại không bao giờ đoán sai nữa.
   · **KẸP vào chỗ còn trống** (dưới `SceneBarBottom`) và **BỌC TRONG SCROLL VIEW** làm lưới
     đỡ: cửa sổ thấp / người dùng bấm ×1.45 phóng giao diện thì vẫn có lúc không vừa, mà cắt
     cụt là mất nút còn cuộn thì luôn tới được.
   · **Nhãn DÀI phải `wordWrap`** — không bọc dòng thì IMGUI cắt ở mép bảng, câu cụt giữa chừng
     mà không có gì báo. ⚠ CHỈ cho nhãn ĐỨNG MỘT MÌNH MỘT HÀNG: nhãn bọc dòng nằm trong hàng
     NGANG bị GUILayout co về bề rộng tối thiểu rồi xuống dòng lung tung, cả hàng cao vọt lên.
   · **Câu dài thì tách ra HÀNG RIÊNG**, đừng nhét cạnh mấy cái nút — bốn nút đã ăn hơn nửa bề
     ngang, phần còn lại không đủ cho một câu 66 ký tự.

17. ⚠⚠ **HAI BẢNG CÙNG MỘT MÀN HÌNH PHẢI BIẾT CHỖ CỦA NHAU — `StickmanUI.LeftPanelRight`.**
   Bảng «ĐẤU TAY ĐÔI» canh GIỮA màn hình còn bảng AI Lab chiếm nguyên cột trái rộng 370 từ
   trên xuống dưới. Mỗi bên tính đúng phần của mình, ghép lại thì **đè lên nhau** và mấy nút
   nằm dưới không bấm được — **không lỗi nào báo**. Đây đúng bài học đã ghi cho
   `SceneBarBottom` và `TopRightButton`: **số nào hai HUD cùng phải biết thì phải có MỘT CHỦ**,
   không phải hai bản chép tay. Bảng phụ nay neo mép PHẢI và tự thu bề rộng để không lấn cột trái.

   ⚠ **MỘT PHÍM MỘT CHỦ.** `C` từng vừa là BÒ (`StickmanFighterController._crawlKey`) vừa là
   "camera về nhân vật" (`DemoCameraFollow`) — bò một cái là camera giật về, mà bảng hướng dẫn
   thì ghi mỗi nghĩa camera nên không ai lần ra. Camera nay là `V`
   (`DemoCameraFollow._recenterKey`) và trên điện thoại là nút **CAM**.

| Thiết bị | scale | khung (đơn vị) | hàng 44 đơn vị |
|---|---|---|---|
| Điện thoại 1080p (400 dpi) | 2.7 | 711 × 400 | 7.5 mm |
| Điện thoại 720p (290 dpi) | 1.8 | 711 × 400 | 6.9 mm |
| Máy tính bảng (264 dpi) | 2.8 | 729 × 547 | 11.9 mm |
| Desktop 1080p | 1.0 | 1920 × 1080 | 11.6 mm |

⚠ **MUỐN GIAO DIỆN ĐIỆN THOẠI TO/NHỎ THÌ CHỈNH `MinDesignHeight`, ĐỪNG CHỈNH `Row`.**
Trên điện thoại chính `MinDesignHeight` là ràng buộc chặt nhất (`scale = pixel ÷ số này`), nên
khung vẽ luôn cao đúng ngần ấy đơn vị — hàng 44 trong khung 300 chiếm 15% màn hình (thô kệch),
trong khung 400 còn 11%. Kéo `Row` xuống thì nút bé đi nhưng CHỮ vẫn to nguyên, giao diện càng
lệch; đổi `MinDesignHeight` thì cả cỡ chữ, khoảng cách, bề dày khung đều co theo cùng tỉ lệ.


---

## ⚠⚠ BẢNG ĐÃ KHAI VÙNG THÌ CHẠM VÀO ĐÓ KHÔNG ĐƯỢC TÍNH LÀ NGẮM & BẮN (2026-09-05)

`StickmanTouchControls.HandlePointer` nay hỏi `StickmanUI.PointerOverHud(pos)` **trước** nhánh
"còn lại: NGẮM & BẮN" và trả `true` để giữ chỗ ngón.

Vì sao: IMGUI và `Input.touches` là HAI KÊNH KHÔNG BIẾT NHAU. `ClaimFinger` đã chữa bẫy này cho
cụm nút cảm ứng — nhưng cụm đó do chính file kia vẽ nên nó tự biết. Mọi bảng IMGUI khác (mua
lính, phân công nông dân, xây công trình, thẻ lệnh trên đầu nhân vật) thì không: bấm một nút
vừa bấm nút VỪA vung một nhát kiếm trời ơi.

⚠⚠ **Kèm theo, `StickmanUI.PointerOverHud` phải chấp nhận sổ của frame TRƯỚC.** `ClaimPanel`
chỉ được gọi trong `OnGUI`, mà Unity chạy `OnGUI` **sau** `Update`/`LateUpdate` của cùng frame.
Nên mọi caller đọc `Input` — đúng những caller cần hàm này nhất (`DemoCameraFollow.LateUpdate`,
`StickmanTouchControls.Update`) — hỏi ở frame N thì sổ mới nhất là của frame N−1: so
`!= Time.frameCount` là một chốt chặn **KHÔNG BAO GIỜ ĐÓNG**, và không có lỗi nào báo. Bảng vừa
đóng để lại một frame chiếm chỗ thừa, rẻ hơn nhiều so với việc cả cơ chế nằm chết.

⚠ **Hệ quả: bảng nào bung ra thì PHẢI `ClaimPanel`.** `GameModeHud` (mua lính / xây / phân công)
và `CampUnitOrderHud` (thẻ nổi trên đầu) đã khai. Thêm bảng mới mà quên là dính lại y hệt.

⚠ **Đường CHUỘT THÔ của desktop cũng phải hỏi** — `StickmanFighterController.GetInputDown/Hold`
(nhánh `Input.GetMouseButton`) chặn khi con trỏ nằm trên bảng. `GetInputUp` thì **KHÔNG** hỏi:
đó là nhịp BẮN của kiểu kéo-thả, nuốt mất cú nhả là người chơi kẹt vĩnh viễn ở thế tích lực.

⚠ **Khai ĐÚNG phần thật sự vẽ ra, không khai cả cột.** `GameModeHud` cấp cho mình một `area`
cao gần hết màn hình để còn chỗ cuộn, nhưng cái HỘP chỉ cao bằng nội dung — khai cả cột là biến
nửa phải màn hình thành vùng chết với cử chỉ ngắm-bắn. Đo bằng `GUILayoutUtility.GetLastRect()`
ở nhịp **Repaint** rồi dùng cho frame sau (nhịp Layout chưa có số), đúng khuôn `DuelLabHud`.

⚠ **`OnGUI` chạy vài lượt mỗi frame** (Layout rồi Repaint): `FindObjectsByType` /
`FindAnyObjectByType` trong đó là một lần quét cả scene NHÂN với số lượt vẽ. Chụp kết quả theo
nhịp (0.5 giây) hoặc cache tham chiếu — xem `CampUnitOrderHud.RefreshSoldierCache`.

---

## ⚠⚠ CHẾ ĐỘ CHƠI DÙNG CANVAS THẬT, KHÔNG DÙNG IMGUI (2026-09-05)

IMGUI (`OnGUI` + `StickmanUI`) là bảng **ĐO ĐẠC**: dựng nhanh, không cần asset, hợp cho AI Lab
· bảng cân bằng · công cụ soi. Nó KHÔNG hợp làm giao diện của một chế độ chơi, vì bốn lý do đo
được:

| IMGUI | Canvas (uGUI) |
|---|---|
| `Input` và IMGUI là hai kênh không biết nhau ⇒ bấm nút kèm một nhát chém, phải tự vá bằng `ClaimPanel` | `EventSystem` + `GraphicRaycaster` nuốt trọn cú bấm |
| Nút không có trạng thái — xám thì không nói được vì sao | `Button.interactable` + nhãn nói LÝ DO |
| Tự đo cỡ bằng một hệ riêng (`StickmanUI.Scale`) | `CanvasScaler` co theo khổ thiết kế |
| Vẽ lại toàn bộ mỗi frame, `OnGUI` chạy nhiều lượt | chỉ đổi khi số đổi |

Mẫu: `CampGameUi` + `CampUiKit` (dựng bằng CODE, không prefab — cả dự án dựng scene bằng tool;
một prefab UI là thêm một file phải nhớ dựng lại và phải mở Unity mới sửa được).

⚠⚠ **NỐI HAI HỆ BẰNG `StickmanUI.RegisterPointerBlocker`.** Bảng Canvas không đi qua
`ClaimPanel`, mà hai bên đọc `Input` (`StickmanTouchControls`, `StickmanFighterController`) chỉ
biết hỏi `PointerOverHud`. Không đăng ký thì bấm nút trên Canvas **vẫn** kèm một nhát chém —
đúng cái bẫy `ClaimPanel` sinh ra để chữa cho IMGUI, lặp lại ở hệ mới. Core KHÔNG tham chiếu
`UnityEngine.UI`: tầng nào dựng Canvas thì tầng đó đăng ký câu trả lời (factory hook).
⚠ Và phải `Unregister` ở `OnDisable` — để lại hàm trỏ vào object đã huỷ là mọi cú bấm trên sân
bị nuốt tới hết ván.

⚠ **MỘT CHUYỆN, MỘT BẢNG.** Gắn cả `CampGameUi` lẫn `GameModeHud`/`TeamCommandHud` vào cùng
scene là hai bảng cùng vẽ ví tiền và cùng phát lệnh — sớm muộn nói ngược nhau. Builder của
`Demo_20_WarCamp` cố ý KHÔNG gắn hai cái kia nữa; `CommandHierarchyHud` (F9) thì giữ vì nó là
công cụ soi, mặc định ẩn.

⚠ **Chọn người bằng NÚT NỔI TRÊN ĐẦU, không bằng "chạm vào thân".** Cú chạm lên sân đã có chủ
(ngắm & bắn) — một cử chỉ MỘT CHỦ. Nút Canvas nằm ở kênh khác nên không có cách nào bấm nhầm.

⚠ Bốn nút của bảng ĐƠN VỊ dùng lại cho mọi loại đơn vị ⇒ **`onClick.RemoveAllListeners()` trước
khi nối lại**. Quên là sau vài lần đổi người, một cú bấm chạy cả chuỗi lệnh cũ.

## ⚠⚠ MỘT NÚT NGỮ CẢNH — SÁU Ô NỔI PHẢI ĐI QUA TRỌNG TÀI (2026-09-06)

Dự án có sáu ô hỏi nổi quanh nhân vật: nhặt vũ khí · lên ngựa · cổng làng · máy công thành ·
lái tàu · (cũ) cầu thang. Mỗi cái tự dò mục tiêu, **tự tính chỗ vẽ** và tự hit-test ngón tay.
Đứng ở chỗ đông việc là ba bốn ô chồng lên nhau ở những toạ độ khác nhau — người chơi phải
nhìn xem cái nào nằm đâu rồi mới bấm được. Người dùng đọc ra đúng một câu: *"tooltip quá nhiều"*.

**Luật:** ô nổi ngữ cảnh KHÔNG được tự vẽ. Trong `Update` phải xin suất bằng
`StickmanPromptArbiter.Offer(this, priority, distance, anchor)`; trong `OnGUI` phải hỏi
`IsWinner(this)` trước khi vẽ, và đặt ô bằng `StickmanPromptArbiter.Place(...)` tại
`WinnerAnchor`. Ưu tiên cao thắng; bằng ưu tiên thì gần hơn thắng.

Thang ưu tiên (`StickmanPromptArbiter`): lái tàu 50 · máy công thành 40 · ngựa 30 · cổng 20 ·
nhặt đồ 10. Việc ĐANG LÀM DỞ khai `distance: 0` để thắng tuyệt đối — mất ô "Rời máy"/"Buông
lái" là trên điện thoại không còn đường nào rời ghế.

**⚠ BẪY ĐÃ DÍNH KHI LÀM BẢN NÀY:** cả `SiegeEnginePrompt` lẫn `ShipHelmPrompt` có nhánh
*"đang ngồi/đang cầm lái"* **thoát sớm** (`TickOperating(...); return;`). Đặt lời xin suất ở
DƯỚI nhánh ấy thì `_held` luôn null tại chỗ đó ⇒ ô "Rời máy" không bao giờ được vẽ, và không
lỗi nào báo. Xin suất PHẢI đặt TRƯỚC mọi `return` sớm của `Update`.

**⚠ Vẽ ở CHỖ CHUNG (trên đầu người chơi), không neo vào món đồ.** Neo vào đồ thì chỗ bấm nhảy
theo cảnh vật (ô máy công thành từng treo cao 2.2 trên cái tháp, bay gần hết màn hình) và hai ô
cùng hiện lại chồng nhau — đúng thứ trọng tài sinh ra để dẹp. Neo cố định thì ngón cái biết
trước phải đưa tới đâu.

Nút NHẶT / NGỰA trên bảng cảm ứng (`StickmanTouchInput.PickupAvailable`, `MountAvailable`) là
đường ĐỘC LẬP, không đi qua trọng tài — giữ nguyên, đó là lưới an toàn khi ô nổi nhường suất.

### ⚠⚠ Ô NGỮ CẢNH PHẢI TỰ BẮT CHẠM — `GUI.Button` KHÔNG ĐỦ (2026-09-15)

User: *"tooltip nhặt đồ · lên ngựa trên mobile không có tác dụng"*.

**IMGUI chỉ theo được MỘT chạm.** Trên điện thoại ngón trái luôn đang giữ cần ảo, nên cú bấm
của ngón phải vào một `GUI.Button` **không ăn**: ô vẫn vẽ ra, vẫn sáng, bấm vào không xảy ra gì.
Không lỗi, không log — người chơi đọc ra là "game lag", chứ không ai ngờ cả đường bấm ấy chưa
từng tồn tại trên mobile.

Đo ngày 2026-09-15: **5/6 ô dính** (chỉ `VillageGatePrompt` có đường chạm riêng). Chú thích trong
`VillageGatePrompt` còn ghi *"đúng khuôn `SiegeEnginePrompt`"* — mà `SiegeEnginePrompt` thì không
hề có đường ấy: một câu khẳng định không ai đo lại. Nặng nhất là ô MÁY CÔNG THÀNH và ô BÁNH LÁI:
đang ngồi máy/cầm lái thì ô chính là **đường ra duy nhất** trên điện thoại.

**Luật:** ô ngữ cảnh nào có `GUI.Button` thì PHẢI có đường chạm riêng:

1. giữ `touchRect` mà `StickmanPromptArbiter.Place(...)` trả ra (đừng `out _`), và **xoá cờ**
   `_hasTouchRect` ở đầu `OnGUI` — giữ ô cũ là bấm vào khoảng không vẫn ăn;
2. trong `Update` quét `Input.GetTouch` tìm `TouchPhase.Began` nằm trong ô, bỏ qua ngón đã bị
   `StickmanTouchInput.IsFingerClaimed`, rồi `ClaimFinger` (không thì vừa nhặt vừa vung dao);
3. chặn `GUI.Button` bằng `&& Input.touchCount == 0` — hai đường cùng ăn một cú bấm là vào rồi
   ra ngay, nhìn ra y hệt "bấm không ăn".

Khuôn chuẩn: `VillageGatePrompt.ReadTouch`. Phép đo: Doctor › «Rớt đồ & ô nhặt» soi mọi
`*Prompt*.cs` có `Place(...)` + `GUI.Button` mà thiếu `Input.GetTouch`.

## BẢNG XÂY DOANH TRẠI — BẤM VÀO NGƯỜI, KHÔNG BẤM VÀO DANH SÁCH (2026-09-06)

### Ba thứ đã đổi

1. **Danh sách 11 hàng nút → BỘ CHỌN `◀ tên nhà ▶`** nằm trong bảng của chính nông dân đang
   chọn. Trần chiều cao bảng không đổi khi thêm loại — trước đây mỗi loại mới làm bảng dài
   thêm một nấc, và mấy loại cuối tụt khỏi màn hình điện thoại.
2. **Thẻ nổi trên đầu → VÙNG CHẠM TRONG SUỐT phủ lên thân** người / nhà. Chỉ cái đang chọn mới
   sáng lên và hiện chữ.
3. **Đặt móng và cử thợ gộp thành MỘT cú bấm** (`PlacePicked`). Trước đây tách hai bước, ai
   không biết bước hai thì cái móng nằm mãi ở 0 %.

### ⚠ Luật KHÔNG đổi: một cử chỉ MỘT CHỦ

Vùng chạm vẫn là **nút Canvas**, chỉ là trong suốt và đặt đúng chỗ cái thân. Cú chạm lên SÂN đã
thuộc về ngắm & bắn (`StickmanTouchControls`); đọc thẳng chuột/ngón rồi bắn tia vào scene là hai
chủ tranh nhau một cú chạm, và người chơi vừa chọn người vừa vung kiếm. `EventSystem` nuốt trọn
cú bấm trên nút — đổi CHỖ và ĐỘ TRONG SUỐT không đụng gì tới luật ấy.

⚠ **Alpha 0 vẫn nhận được cú bấm** — `Image.raycastTarget` mới là công tắc. Đừng "tối ưu" bằng
cách tắt renderer hay `enabled = false`: vùng chạm biến mất và không còn gì bấm được.
⚠ **Cỡ vùng chạm ĐO THEO CAMERA** (`HitSizeFor`), không gõ hằng pixel. Người cao 0.75 world;
gõ cứng 104 px thì zoom vào chỉ phủ nửa thân, zoom ra thì phủ luôn ba người bên cạnh — bấm một
người chọn trúng người khác, tệ hơn hẳn cái thẻ nổi nó thay thế. Sàn 30 (ngón tay), trần 170.
⚠ **Bỏ thẻ là bỏ luôn lời mời gọi.** Vùng chạm trong suốt không tự giới thiệu, nên dòng
`_buildStatus` ở bảng NHÀ CHÍNH phải giữ câu "Bấm vào một NÔNG DÂN để chọn nhà và đặt móng"
khi chưa chọn ai. Đó là thứ duy nhất còn dạy cách xây.

### ⚠ BẪY IM LẶNG — loại có trong enum mà không có trong danh sách UI

`CampBuildKind` có 11 loại; `CampGameUi.BuildKinds` từng chỉ liệt kê 8. Ba nhà lính
(`MeleeHall` · `ArcherHall` · `Stable`) **không xây được bằng bất cứ cách nào**, mà không gì
báo: enum hợp lệ, giá có, `TryOrder` chạy — chỉ là không ai gọi nó. Người chơi báo "không thấy
nhà lính để xây".

Chốt: `WarnMissingBuildKinds()` chạy lúc dựng HUD, so `BuildKinds` với `Enum.GetValues` và
`LogError` gọi thẳng tên loại còn thiếu. Thêm loại thì sửa **cả hai** chỗ (`CampBuildKind` và
`BuildKinds`); `BuildKindCount` đã suy từ `BuildKinds.Length` nên không phải sửa chỗ thứ ba.

### Hai hệ thẻ chồng nhau

`CampUnitOrderHud` (IMGUI) và `CampGameUi` (Canvas) từng cùng vẽ thẻ trên đầu — trên máy người
dùng chúng chồng thành một rừng nút, và hai chỗ đổi việc cho cùng một người theo hai luật khác
nhau. Nay `_drawLegacyTags` mặc định TẮT; component vẫn giữ vì nó còn giữ sổ hộ tống
(`_escorts`) mà `CampGameUi` gọi vào.

## NGĂN KÉO GỠ LỖI — MỘT CHỦ CHO CỘT TRÁI (2026-09-06)

Góc trên-phải đã có một chủ (`StickmanUI.TopRightButton`). Cột TRÁI thì chưa: bảng hướng dẫn,
bảng chỉ huy và mấy bảng công cụ đều tự vẽ một nút bật/tắt ở `x = 12` rồi tự cộng lấy một cao
độ từ mốc hơi khác nhau — ghép lại thì nút nọ đè nút kia, **cái dưới không bấm được**, không
lỗi nào báo.

### Ba mảnh

| Mảnh | Việc |
|---|---|
| `StickmanUI.DevPanel` + `RegisterDev/UnregisterDev` | sổ đăng ký, **mỗi lúc MỘT bảng** (`OpenDevPanel`) |
| `StickmanDevMenu` (tự mọc mọi scene) | vẽ nút `⚙`, xổ danh sách, mở/đóng |
| `StickmanUI.GameHudSuppressed` | HUD chơi game tự thu khi HUD gom (`≡`) hoặc ngăn kéo bung |

Thêm bảng gỡ lỗi mới = **1 giá trị enum + 1 lời gọi `RegisterDev`**. Không vẽ thêm nút nổi nào,
không sửa toạ độ của bảng nào khác.

### ⚠ Bẫy đã gặp trong chính bản vá này

Chèn nút `⚙` vào giữa `≡` và thanh chọn scene thì **thanh scene vẽ đè lên nó** — vì
`DemoSceneSwitcher` tự tính `HudToggleRect.xMax + 6`. Đúng lớp lỗi đang chữa, do chính bản vá
gây ra. Chốt: `StickmanUI.TopLeftBarX` là chủ duy nhất của cái mép ấy, và nó **không chừa chỗ
cho `⚙` khi scene không có bảng gỡ lỗi nào** (lúc đó nút cũng không được vẽ).

### ⚠ uGUI và IMGUI là hai kênh không biết nhau

`CampGameUi` là uGUI neo góc trên-trái `y = 12`; `≡`, `⚙`, thanh scene là IMGUI ở đúng dải ấy.
Không có gì tự ngăn chúng chồng nhau. Hai vế đã chữa:
* `ApplyTopBarOffset` đẩy thanh tài nguyên xuống dưới `SceneBarBottom` **mỗi frame** (người
  dùng đổi cỡ giao diện giữa trận bằng `CycleScale`, và desktop/cảm ứng khác nhau);
* quy đổi ĐƠN VỊ THIẾT KẾ → ĐƠN VỊ CANVAS bằng `canvasRect.rect.height / StickmanUI.Height` —
  gán thẳng `SceneBarBottom` vào `anchoredPosition` là đúng số sai đơn vị.

⚠ Thu HUD bằng `Canvas.enabled`, **không** `SetActive`: tắt object là `Update` của chính nó
ngừng chạy và không còn ai bật lại — HUD biến mất vĩnh viễn.

### ⚠ Phím tắt và nút phải đọc CÙNG MỘT nguồn

`[H]` và `[F9]` từng đảo một biến riêng (`_open`, `_visible`) trong khi bảng đọc ngăn kéo ⇒
**bấm lần đầu không ăn**. Nay cả hai đọc `StickmanUI.DevPanelOpen(...)`; hai field cũ giữ lại
chỉ để scene đã bake không mất tham chiếu, và có chú thích nói rõ chúng không còn quyết định gì.

### Đo bố cục (đơn vị thiết kế)

| | `≡` | `⚙` | thanh scene bắt đầu | bảng gỡ lỗi bắt đầu |
|---|---|---|---|---|
| desktop | 12..83 | 89..137 | 143 | y = 60 |
| cảm ứng | 12..104 | 110..172 | 178 | y = 68 |

Hàng nút kết thúc ở y = 42 (desktop) / 52 (cảm ứng), thanh tài nguyên bắt đầu ở y = 64 / 72 —
không cặp nào chồng.

### Còn lại

Mới gom **hai** bảng (`Tutorial`, `Command`). `DevPanel` đã chừa sẵn ô cho `Testbed`, `AILab`,
`DuelLab`, `TeamCommand`, `Roster` — mấy bảng đó hiện KHÔNG vẽ nút ở cột trái nên chưa gây
chồng lấn; chuyển chúng vào ngăn kéo là việc tiếp theo, không phải việc gấp.

---

## ⚠⚠ TRÊN ĐIỆN THOẠI, HAI GÓC DƯỚI KHÔNG PHẢI CỦA HUD (2026-09-06)

`StickmanTouchControls` chiếm sẵn:

* **góc trái-dưới = vùng CẦN ẢO** — `InStickZone` nhận cả `x < 45%` màn hình **và** `y < 70%`,
  tức gần trọn nửa dưới bên trái. Đây là vùng lớn hơn người ta tưởng rất nhiều.
* **góc phải-dưới = cụm nút ĐÁNH** — nút đánh + ba vòng nút quanh nó.

Bảng Canvas đặt vào hai chỗ đó thì `PointerOverUi` vẫn chặn được "bấm nút kèm nhát chém",
**nhưng cái cần thì bị CHE** — người chơi không đi lại được. Chặn kênh không cứu được việc
chiếm chỗ.

Luật: **bảng của chế độ chơi đặt ở CỘT PHẢI-TRÊN trên cảm ứng** (x > 45% nên ngoài vùng cần,
y trên cụm nút), **mở từng cái một** qua một thanh nút, mặc định ĐÓNG. Desktop thì hai góc dưới
vẫn trống, cứ dùng.

⚠ Nút «PC/ĐT» đổi `StickmanUI.IsTouch` **giữa trận** ⇒ bố cục phải tự soi lại theo nhịp
(`CampGameUi.ApplyLayout(force: false)`), không chỉ đặt một lần ở `Start`.

---

## ⚠⚠ MỞ BẢNG RA LỆNH THÌ CẤT ĐIỀU KHIỂN ĐI (2026-09-06)

Hai câu hỏi KHÁC NHAU, và trước bản này chỉ có một câu được trả lời:

| Câu hỏi | Cơ chế | Chữa được gì |
|---|---|---|
| *"ngón NÀY của ai"* | `StickmanUI.PointerOverHud` + `ClaimPanel` | bấm nút không kèm nhát chém / không kéo cần |
| *"lúc này người chơi có đang LÁI nhân vật không"* | `StickmanUI.RegisterControlSuppressor` | bảng không CHE mất cần ảo |

Chặn kênh **không** cứu được việc chiếm chỗ. Khi mở bảng ra lệnh (bấm vào lính · nông dân ·
công trình), người chơi đang làm việc của một ông tướng chứ không phải của một đấu sĩ — cần ảo
lúc đó chỉ tổ che màn hình. `StickmanTouchControls.ShouldShow` hỏi `ControlsSuppressed`, và vì
gate đó dùng chung cho cả `Update` lẫn `OnGUI` nên ẩn là ngừng luôn việc nhận ngón (không có
nút vô hình nào còn ăn cú chạm), kèm `StickmanTouchInput.Clear()` nên không nút nào kẹt.

⚠ **Là một HÀM, không phải cờ bool.** Cờ thì bảng bị huỷ giữa chừng là kẹt vĩnh viễn "đang mở"
và người chơi mất điều khiển tới hết ván, không gì báo. Và phải `Unregister` ở `OnDisable`.

⚠ **Luôn chừa một cú bấm để ĐÓNG**: thanh nút mở/đóng và thẻ nổi trên đầu KHÔNG tính là "đang
mở bảng" — cất luôn cả chúng là khoá cứng người chơi. Bấm lại chính thẻ đang chọn = bỏ chọn.

## ⚠⚠ UI PHẢI THẮNG CẦN ẢO, KHÔNG CHỈ THẮNG NGẮM-BẮN

`StickmanTouchControls.HandlePointer` nay hỏi `PointerOverHud` **TRƯỚC vùng cần ảo**, không chỉ
trước nhánh ngắm-bắn. Vùng cần phủ `x < 45%` VÀ `y < 70%` — gần trọn nửa dưới bên trái — nên
mọi nút Canvas nằm trong đó (thẻ lệnh nổi trên đầu lính) vừa bấm được nút VỪA kéo cần đi theo
ngón: nút thì ăn, mà nhân vật cũng chạy. Không lỗi nào báo.

⚠ **Bảng nào bung ra thì PHẢI `ClaimPanel`** — đó là điều kiện để hai luật trên có tác dụng.
Đã khai thêm cho các bảng có mặt ở MỌI scene: `DemoSceneSwitcher` (thanh chọn scene + danh
sách), `StickmanDemoHud` (bảng hướng dẫn), `TeamCommandHud` (lệnh toàn quân), `MatchDirector`
(bảng mục tiêu map). Còn một số bảng của công cụ/lab chưa khai — tra bằng:
`for f in $(grep -rl "GUILayout.BeginArea" Assets/Scripts --include=*.cs); do grep -q ClaimPanel $f || echo $f; done`

## ⚠⚠ DA GIAO DIỆN LÀ MỘT SKIN CHUNG, KHAI Ở `StickmanUI.Begin()` (2026-09-06)

41 màn HUD của dự án vẽ bằng IMGUI và **không màn nào khai `GUI.skin`**, nên tất cả rơi về
skin mặc định của Unity: hộp xám bệch, nút be vàng, chữ đen. Đó không phải giao diện của một
trò chơi, đó là giao diện của Inspector — và vì nó là MẶC ĐỊNH nên đã 41 lần không ai sửa.

`StickmanUITheme.Skin` dựng bằng code (ảnh nền 9-slice góc bo + viền sáng + dốc sáng, bảng màu
tối kính, màu nhấn hổ phách) và được gán trong `StickmanUI.Begin()` — chỗ DUY NHẤT mọi HUD đi
qua ở dòng đầu `OnGUI`. Một chỗ sửa, cả bộ giao diện đổi. Đúng đòn bẩy `WeaponArtGenerator.Save`
đã dùng cho art.

- **Sửa màu thì sửa bảng hằng số đầu `StickmanUITheme`**, đừng gõ màu trong từng HUD.
- **`End()` cũng gán skin.** Nó sinh ra để trả KHUNG TOẠ ĐỘ về pixel thật (cần ảo cảm ứng tự
  hit-test), không phải để màn đó xin giao diện mặc định. Bỏ dòng đó là đúng một màn hiện ra
  với hộp xám be.

⚠⚠ **GIỮ NGUYÊN SỐ ĐO** — `border`, `padding`, `margin`, `fontSize`. Đây là ràng buộc, không
phải sự dè dặt: 41 màn đã tự tính layout tay theo số đo cũ; đổi padding là chữ tràn ra ngoài
nút ở những màn không ai mở ra xem, mà IMGUI thì **không có lỗi nào báo**. Đổi MÀU và ẢNH NỀN
thì hình đổi hoàn toàn còn hộp vẫn đúng chỗ cũ.

⚠ HUD nào cache `GUIStyle` vào field thì phải dựng nó **TRONG `OnGUI`, SAU `Begin()`** (mẫu
`EnsureStyles()`), không dựng ở `Awake`/`Start` — lúc đó `GUI.skin` chưa phải skin của dự án
và cái style cache lại sẽ giữ hình mặc định tới hết phiên.

⚠ Texture của skin mang `HideAndDontSave`; static reset sau mỗi lần compile nên nó tự dựng lại.
Đổi bảng màu lúc đang chạy thì gọi `StickmanUITheme.Invalidate()`.

### Tiếng bấm — đo bằng `GUIUtility.hotControl`, không bắt sự kiện chuột

`StickmanUI.Begin()` lấy mẫu `GUIUtility.hotControl` **một lần mỗi frame**; 0 → khác 0 nghĩa là
một control THẬT SỰ giành được con trỏ ⇒ kêu `Ui/Click`. Bắt `EventType.MouseDown` thay vào đó
là mọi cú bấm xuống SÂN cũng kêu — mà bấm xuống sân là ra đòn, không phải thao tác giao diện.

⚠ Lấy mẫu MỘT LẦN mỗi frame là bắt buộc: có màn chạy 4–5 lượt vẽ trong một frame, lấy mẫu mỗi
lượt là một cú bấm kêu mấy tiếng chồng lên nhau.
⚠ Nhận ra chậm đúng một frame (~16 ms) vì `Begin()` chạy trước khi HUD kịp vẽ cái nút. Đổi lại
là không phải xen vào code vẽ của 41 màn.

## HÀNG NÚT GÓC PHẢI ĐÃ TRỐNG · HUD TRẠI TO RA (2026-09-07)

### Ba bảng gỡ lỗi cuối cùng đã vào ngăn kéo

`CẤP AI [F3]`, `NỀN VĂN MINH [F4]` và `Xưởng map` là bảng GỠ LỖI, nhưng chúng nằm ở một sổ đăng
ký RIÊNG (`StickmanUI.CornerButton`) nên hiện ra thành **ba cái nút to chiếm nguyên một hàng
ngang ngay trên đầu trận đánh**, trong khi ngăn kéo `⚙` ở cột trái chỉ có hai mục.

Nay cả ba dùng `DevPanel` (`MapStudio = 7`, `Civilization = 8`, `AILevel = 9`). Hàng nút góc phải
**không còn ai dùng** — `CornerButton`/`TopRightButton`/`RegisterCorner` giữ lại làm khuôn cho nút
góc sau này, nhưng bảng gỡ lỗi mới thì vào ngăn kéo, đừng mở lại hàng nút.

⚠ Cái được thêm mà không phải viết dòng nào: `GameHudSuppressed` đã tính cả `OpenDevPanel`, nên
mở «Cấp AI» giờ **tự thu HUD trại**. Hồi còn là `CornerPanel` thì nó không tính vào đó — bảng gỡ
lỗi và HUD trại vẽ chồng lên nhau, và đó là đúng lớp lỗi mà ngăn kéo sinh ra để chữa.

Panel neo theo `StickmanUI.RightPanelEdge` thay cho `TopRightButton(...).xMax` đã mất.

### HUD trại: một hệ số, không sửa 30 chỗ

| Số | Cũ | Mới | Vì sao |
|---|---|---|---|
| `CampUiKit.TouchRow` | 46 | **58** | 46 là mức SÀN của hướng dẫn cảm ứng (~8 mm ở khổ điện thoại) — bấm trúng nhưng phải nhìn mà bấm, giữa lúc đánh nhau |
| `CampUiKit.FontScale` | — | **1.28** | nhân trong `Label`, chỗ DUY NHẤT mọi dòng chữ đi qua |
| bề ngang bảng | 430 | **540** | chữ to hơn thì phải có chỗ |

⚠ Đừng đi sửa tay từng cỡ chữ ở 30 chỗ gọi: thứ bậc đã cân sẵn (12 ghi chú &lt; 13 nút &lt; 15
tiêu đề &lt; 18 số), nhân đều thì giữ nguyên thứ bậc, còn sửa tay thì lần sau sót một chỗ là
bảng nhìn lởm chởm.

### ⚠⚠ `childForceExpandWidth` GHI ĐÈ `flexibleWidth = 0`

`CampUiKit.Width(target, preferred, flexible)` ghim bề ngang một phần tử trong hàng ngang. Nhưng
`HorizontalLayoutGroup` khi bật force-expand ép **mọi** con thành `flexible = max(flexible, 1)` —
`flexibleWidth = 0` vừa đặt bị ghi đè ngay lúc tính bố cục, và cái nút `✕` rộng đúng bằng cả cái
tiêu đề bên cạnh. Không lỗi nào báo, chỉ là bố cục "không chịu nghe lời".

Nên `Width` TỰ TẮT `childForceExpandWidth` của hàng cha khi `flexible <= 0`.

### Hai đường thoát mới

* **Nút `✕` trên bảng đơn vị** — bảng bung ra khi bấm trúng nhân vật, mà bấm trúng thì dễ nên
  người chơi mở nhầm liên tục; trước đây đường ra duy nhất là bấm vào chỗ trống cho đúng.
* **Bấm vào TÊN NHÀ ở bộ ◀ ▶ thì xổ cả bảng** (11 loại, 3 cột, neo giữa màn hình, tự đóng khi
  chọn). Bộ ◀ ▶ gọn nhưng bắt bấm tới 10 lần để tới loại cuối, và trong lúc bấm thì không thấy
  được loại khác có gì — muốn so giá hai loại phải cuộn qua cuộn lại mà nhớ bằng đầu.
  Nút trong bảng vẫn BẤM ĐƯỢC khi thiếu tiền (chọn trước rồi đi kiếm vàng là nhịp chơi bình
  thường); nút «ĐẶT MÓNG» mới là chỗ chặn.

## ⚠⚠ HAI GÓC DƯỚI DỌN VÀO TRONG NHÀ CHÍNH · CÔNG TẮC «CẦM QUÂN ↔ CHỈ HUY» (2026-09-07)

Mode kinh tế trước đây có hai bảng THƯỜNG TRỰC: «NHÀ CHÍNH» góc trái-dưới (thuê nông dân, nâng
nhà) và «LỆNH TOÀN QUÂN» góc phải-dưới (công/thủ, số người giữ nhà). Trên điện thoại chúng ăn gần
nửa màn hình SUỐT VÁN cho những việc người chơi chỉ bấm vài lần — mà hai góc dưới lại đúng là chỗ
ngón cái nằm (xem mục *HAI GÓC DƯỚI KHÔNG PHẢI CỦA HUD*).

### Luật: việc CỦA MỘT THỨ thì nằm TRONG thứ đó

Cả hai bảng nay là các hàng trong **bảng nhà chính** — bấm vào cái nhà là ra đủ việc của nó:
thuê nông dân · nâng nhà · **chọn nhà để xây** · ra lệnh toàn quân · số người giữ nhà. Lúc rảnh
sân trống trơn; hai bảng còn lại (đơn vị · công trình) chỉ bung ra khi có thứ được chọn, và không
bao giờ cùng lúc.

* Thuê nông dân **mượn hàng mua số 0** của bảng công trình — nhà chính không bán lính nên năm
  hàng mua ấy đang để không. Đừng đẻ thêm hàng nút riêng chỉ để làm dài cái bảng.
* Nút nâng nhà giữ nguyên câu cũ *"Nâng nhà → đồ cấp N (giá)"*: **dọn bảng thì dọn cả chữ của
  nó**. "Nâng nhà chính (20 vàng)" là một khoản chi không có lý do.

### ⚠ BỘ CHỌN NHÀ CHỈ CÓ MỘT BỘ — nó DỜI sang bảng đang mở

Xây nhà nay mở được từ HAI chỗ: bấm một NÔNG DÂN (người sẽ đi xây) hoặc bấm NHÀ CHÍNH (cái nhà
đứng yên một chỗ suốt ván, còn nông dân thì đang chạy lung tung ngoài mỏ — bấm trúng người đang
chạy là việc khó nhất trong cả HUD này).

Dựng HAI bộ nút là hai chỗ phải nhớ cùng một luật (`_pickIndex`, lý do chặn, nhãn giá, bảng xổ) và
chắc chắn có ngày nói lệch nhau mà không lỗi nào báo. `CampGameUi.AttachPicker` **SetParent** bộ
chọn sang NƠI CHỨA đang mở (`_unitPanel`, hoặc `_buildingScrollContent` — xem mục cuộn bên dưới) —
an toàn vì hai bảng không bao giờ cùng mở. Hàng «Nâng cấp · Đóng» của bảng công trình là con TRỰC
TIẾP của `_buildingPanel`, đứng ngoài nơi chứa đó nên không cần `SetAsLastSibling()` để giữ đáy nữa.

### ⚠⚠ BẢNG NHÀ CHÍNH PHẢI CUỘN — KHÔNG ĐƯỢC TỰ CAO VÔ HẠN (2026-09-17)

Bảng công trình gộp mua (tới 7 hàng) · lệnh toàn quân · tổ tướng · tập kết · giữ nhà · bộ chọn
nhà — hơn chục hàng cộng lại. `CampUiKit.Column` cũ đoán chiều cao bằng TỔNG các con
(`ContentSizeFitter`), không có trần: bảng NHÀ CHÍNH cao hơn cả màn hình, hàng trên cùng (thuê
nông dân, mua tướng) vẽ NGOÀI khung nhìn — không thấy, không bấm được, không lỗi nào báo — và
phần còn lại đè lên các thanh HUD/IMGUI khác gần đỉnh màn hình. Người dùng báo đúng hai triệu
chứng này: *"menu tràn ra khỏi màn hình, và bị UI khác đè"*.

Chốt: mọi hàng "có thể nhiều" nay là con của `_buildingScrollContent`
(`CampUiKit.ScrollColumn`, trần `CampGameUi.BuildingScrollHeight` = 320) thay vì con trực tiếp
của `_buildingPanel`. Tiêu đề/ghi chú và hàng «Nâng cấp · Đóng» đứng NGOÀI vùng cuộn nên luôn
thấy được. `CampUiKit.FitScrollHeight` co Ô lại đúng nội dung khi ít hơn trần (chuồng ngựa, trạm
quân y chỉ 1-2 hàng thì không dư khoảng trống).

⚠ Đổi bộ chọn (`StepPicker` · `PickKind` · `PlacePicked`) phải dựng lại **CẢ HAI** bảng, NGƯỜI
trước NHÀ sau. Gọi mỗi `RefreshUnitPanel` như bản cũ là đặt móng xong từ nhà chính thì bộ chọn
biến mất — hàm ấy thấy `_selected == null` nên tắt luôn bộ chọn đang nằm trong bảng nhà chính.

### ⚠⚠ Dọn bảng thì phải dọn cả LỜI MỜI

Bỏ hai bảng thường trực là màn hình lúc rảnh **không còn cái nút nào tự giới thiệu** — vùng chạm
trên người và trên nhà đều trong suốt. Dòng nhắc (`_buildStatus`) vì thế dời lên **thanh tài
nguyên**, chỗ luôn hiện: *"Bấm NHÀ CHÍNH: thuê dân · nâng cấp · xây nhà · ra lệnh."*, và nhường
chỗ cho tiến độ công trường khi đang xây. Đây là thứ DUY NHẤT còn dạy người chơi cách chơi.

### CÔNG TẮC «CẦM QUÂN ↔ CHỈ HUY»

Người chơi cùng lúc là một đấu sĩ và một ông tướng, mà hai vai tranh nhau đúng MỘT cử chỉ: cú kéo
trên sân. Đang cầm quân thì kéo là NGẮM & CHÉM ⇒ muốn bấm một nông dân ở đầu kia map là phải chạy
bộ tới. Công tắc ở thanh `ThanhCheDo` (dưới thanh tài nguyên, có ở CẢ máy tính lẫn điện thoại)
buông nhân vật ra: `CampGameUi.IsCommandPanelOpen` trả true ⇒ cần ảo và cụm nút biến mất, và cú
kéo thành LIA MAP.

Ba điều bắt buộc:

1. **Buông thì phải buông HẲN.** Cất cần ảo mới xong một nửa. Desktop: chuột trái trên sân vẫn là
   một nhát chém. Cảm ứng: cần ảo tắt nghĩa là `StickmanTouchInput.Active` false, và lúc ấy
   `StickmanFighterController.TryGetAimTouch` quay về luật cũ *"ngón tự do nào cũng là ngón
   ngắm"* — mỗi cú kéo xem map lại kèm một phát bắn. Nên `GetInputDown`/`GetInputHold` hỏi
   `StickmanUI.ControlsSuppressed` trước. **KHÔNG** chặn `GetInputUp`: nuốt cú nhả giữa lúc tích
   lực là kẹt vĩnh viễn ở thế giương cung.
2. **Nút phải nói TRẠNG THÁI ĐANG Ở + VIỆC SẼ LÀM** trên hai dòng. Nút một chữ ("Chỉ huy") thì bấm
   xong không ai biết mình vừa bật hay vừa tắt.
3. **Nút không được ăn theo `IsCommandPanelOpen`** — chính nó là đường ra. Và tắt chỉ huy thì bỏ
   chọn hết + `StickmanTouchInput.PressRecenter()`: còn một bảng đang mở là công tắc bấm xong
   không thấy gì xảy ra, còn camera đứng ở đầu kia map là cần ảo hiện ra điều khiển một nhân vật
   không nhìn thấy.

## MUA LÍNH GIỮA TRẬN — THANH MUA NHANH (2026-09-07)

Quân mua ở NHÀ LÍNH (2026-09-06) là đúng về luật — nhưng nó bắt người chơi **chạy về tận nơi**
giữa lúc đang đánh, mà đúng lúc ấy mới là lúc cần thêm quân nhất. Thanh `ThanhMuaNhanh` (cột
PHẢI-TRÊN, dưới thanh chế độ) mua một phát không rời tay lái.

### ⚠⚠ Thanh này KHÔNG được tính là "đang mở bảng thao tác"

Cả bộ HUD có một luật: mở bảng ra lệnh thì CẤT cần ảo và cụm nút đánh đi (`IsCommandPanelOpen`).
Đúng cho mọi bảng khác — lúc ấy người chơi đang làm việc của ông tướng. Nhưng thanh này sinh ra
cho đúng cảnh NGƯỢC LẠI: tay trái vẫn lái nhân vật, tay phải với lên mua thêm một anh lính. Cho
nó cất điều khiển đi là **xoá sạch lý do nó tồn tại**.

Không phải làm gì thêm để đạt điều đó — nó chỉ là nút Canvas, `CampUiKit.PointerOverUi` đã lo vế
"cú bấm này không lọt xuống thành một nhát chém".

### Chỗ đặt và hai trạng thái

* Cột PHẢI-TRÊN, dưới thanh chế độ (y = 156). Hai góc dưới là của cần ảo và cụm nút đánh — đặt
  vào đó là vừa mua được lính vừa mất tay lái.
* Một nút hai trạng thái **«Cấp: TỐI ĐA ↔ RẺ NHẤT»**: cùng một thanh phục vụ cả hai lối chơi
  («ít lính xịn» / «nhiều lính rẻ», xem bảng nhà lính) mà không bắt mở bảng ra chọn từng cấp.
* Nút phải **nói LÝ DO**, không chỉ xám đi: *chưa có nhà* · *hết chỗ quân* · *thiếu vàng (N)* là
  ba việc phải làm khác hẳn nhau. Một cái nút xám câm thì người chơi chỉ học được rằng thanh này
  hên xui — cùng luật với bảng nhà lính và bộ chọn nhà.

### Bấm loại lính thì XỔ BẢNG CẤP, đừng bắt đoán (2026-09-07)

Bản đầu của thanh mua nhanh có một nút hai trạng thái «Cấp: TỐI ĐA ↔ RẺ NHẤT». Sai ở chỗ: nó bắt
người chơi **ĐOÁN** lần bấm tới sẽ ra cấp mấy, và **giá thì không thấy** cho tới khi đã mua.

Nay bấm «Bộ binh» / «Cung thủ» là xổ bảng cấp ngay dưới thanh — mỗi cấp một dòng kèm giá, bấm là
mua, bảng **ở nguyên** (mua liền ba bốn anh là chuyện thường; đóng sau mỗi cú bấm là bắt mở lại
ba bốn lần giữa lúc đang đánh). Cùng lý do đã ghi cho bộ chọn nhà (`BuildKindList`): bộ ◀ ▶ gọn,
nhưng **không cho SO SÁNH**.

⚠ Neo ngay DƯỚI thanh mua nhanh, KHÔNG neo giữa màn hình như bảng chọn nhà: bảng này bung ra giữa
lúc đang đánh nhau, che mất sân là đổi một cái tiện lấy một cái chết.

⚠ Trạng thái "đang mở bảng nào" là `CampBuildKind?` **nullable**, không phải một giá trị `None`
thêm vào enum: `CampBuildKind` được duyệt bằng `Enum.GetValues` ở `WarnMissingBuildKinds` và
`CampBuildYard.OrderedKinds`, nên một giá trị "không phải loại nào" sẽ bị báo là loại nhà THIẾU
trong danh sách UI, và mọi bảng giá phải thêm một dòng vô nghĩa.

## ⚠⚠ THANH LA BÀN + BẢNG BÁO — HAI THỨ MỚI Ở MÉP TRÊN VÀ ĐÁY GIỮA (2026-09-08)

Luật chỗ đứng đã có từ trước (hai góc dưới là của cần ảo và nút bắn; hai góc trên là của nút
bấm). Hai thành phần mới lấp đúng hai chỗ CÒN TRỐNG:

| Thành phần | Chỗ đứng | Việc |
|---|---|---|
| `CompassBar` | GIỮA mép trên | Dải ngang: địch/quân mình/mục tiêu đang ở bên trái hay bên phải |
| `FieldMinimap` | Góc trên-trái, DƯỚI hàng nút | Ô chữ nhật vẽ TRỌN map, hai trục — xem mục riêng bên dưới |
| `NoticeBoard` | GIỮA, cách đáy 96 px | Một hàng đợi cho CẢ mẹo hướng dẫn LẪN thành tựu vừa mở |

Cả hai là **Canvas thật (uGUI)**, không IMGUI — theo mục *CHẾ ĐỘ CHƠI DÙNG CANVAS THẬT*.

### ⚠ Vì sao LA BÀN là dải NGANG (và vì sao điều đó KHÔNG cấm bản đồ nhỏ)

Thanh la bàn phủ ~60 unit **quanh camera**. Trong phạm vi đó, câu hỏi duy nhất đáng trả lời là
*"nó ở bên trái hay bên phải TÔI"* — một trục. Vẽ ô vuông cho đúng câu hỏi ấy thì 90% diện tích
là khoảng trống.

Trên **map vòng** (`MapWrap`) thì dải ngang còn giải một bài toán mà người chơi không tự tính
được: trái và phải gặp nhau, nên hướng ngắn nhất tới mục tiêu KHÔNG suy ra từ hiệu hai toạ độ
— phải hỏi `MapWrap.Delta`.

⚠ **Đừng đọc mục này thành "dự án cấm minimap".** Nó nói về một HUD CỤC BỘ. Câu *"tôi đang ở
khúc nào của map"* là câu khác, một dải 60 unit không trả lời được, và đó là việc của
`FieldMinimap` ở mục dưới. Hai thứ cùng sống, hai ô khác nhau.

## ⚠⚠ BẢN ĐỒ NHỎ — `FieldMinimap`, HAI TRỤC, CHẠY Ở MỌI CHẾ ĐỘ (2026-09-14)

User: *"tôi muốn bạn thêm tính năng mini map cho các chế độ chơi"*

`Assets/Scripts/Gameplay/Shell/FieldMinimap.cs`

Ô chữ nhật ở góc trên-trái, vẽ **trọn chiều dài map** cộng một khung chỉ chỗ camera đang nhìn.
Nó KHÔNG thay `CompassBar` — hai thứ trả lời hai câu khác nhau:

| | `CompassBar` | `FieldMinimap` |
|---|---|---|
| Phủ | ~60 unit QUANH camera | **cả map** |
| Trả lời | "nó bên trái hay bên phải tôi" | "tôi ở khúc nào, mục tiêu còn xa không" |
| Trục | một (X) | **hai** (X và Y) |
| Ô | TopCenter | TopLeft (phần dưới) |

### ⚠⚠ Y ĐỔI NGHĨA THEO SÂN — đây là toàn bộ phần khó

| Sân | Y nghĩa là | Mép dọc lấy ở đâu |
|---|---|---|
| `ViewPlane.Ground` (3/4) | **CHIỀU SÂU** | có sẵn: `WorldPlane.NearEdge/FarEdge` — CỐ ĐỊNH |
| `ViewPlane.Side` (ngang) | **ĐỘ CAO** | **không tồn tại** → phải tự co giãn (`FitSideBand`) |

⚠ Sân 3/4 thì **đừng** cho dải dọc tự co theo đám đông: dải đi lại là LUẬT CHƠI, co nó là bản
đồ nói dối về chỗ đứng được phép.

⚠ Sân ngang thì ngược lại, **không có "mép trên của map"** — `DemoCameraFollow` đã ghi đúng
điều đó, và đó là lý do `SetMapRange` hai tham số TẮT mép dọc. Map là heightfield cộng
thành/tháp/cầu nhiều tầng: một dải cứng thì map đồi núi tràn ra ngoài, map phẳng thì cả đám
dính vào một vạch. Nên dải **nở NGAY, co CHẬM** (`Lerp` 0.08) và có sàn `_minSideBand`. Co ngay
thì mỗi lần một người chết là bản đồ giật nảy, và người chơi đọc ra là *"bản đồ lỗi"*.

### ⚠ Quá trần chấm thì LẤY THƯA, đừng cắt cụt

`TeamMember.All` xếp theo **thứ tự sinh ra**, mà map thường sinh từng cụm một đầu. Cắt cụt ở
chấm thứ 48 = **nửa map bên kia trống trơn** trong khi ở đó đang có cả một đạo quân. Lấy thưa
theo `stride` thì mật độ đúng khắp map.

### ⚠ `Normalize` phải được KHAI trục, không được tự đoán

Bản đầu đoán "có phải trục X không" bằng `Mathf.Approximately(min, MapWrap.MinX)`. Sai: dải
ĐỘ CAO hoàn toàn có thể trùng số với mép trái map (mặt đất quanh 0 là chuyện thường), và khi
đó toạ độ dọc bị đem quấn theo trục ngang — chấm nhảy loạn theo chiều dọc, **không lỗi nào báo**.
Nay `wrap` là tham số do bên gọi khai.

### ⚠ Biến mất khi ĐANG QUAY PHIM

Nghe `StickmanUI.GameHudSuppressed` (gom HUD · mở bảng gỡ lỗi · `Filming`). Góc màn hình dính
một ô bản đồ thì cả cuộn phim hỏng, và không ai xem lại trước khi xuất.

### Nối vào chế độ chơi ở ĐÂU

Ba chỗ, cùng chỗ với `CompassBar` — thêm mode mới thì không phải nhớ gì:

| Chỗ | Việc |
|---|---|
| `StickmanShellContentBuilder.PatchScene` | vá vào MỌI scene chơi được đã dựng |
| `StickmanRecipeBuilder` | scene sinh từ công thức |
| `StickmanTimeSlipBuilder` | scene vượt thời gian |

Phép đo: `StickmanDoctor.CheckSceneShell` đọc YAML (KHÔNG mở scene) và đếm màn chơi được còn
thiếu. Nút sửa: Bảng điều khiển › Vỏ game & Công thức › «Vá nhạc + bảng báo + la bàn + BẢN ĐỒ
NHỎ vào scene đã dựng».

⚠ **Đừng** thêm `FieldMinimap.cs` vào `StickmanShellContentBuilder.Sources`: danh sách đó quyết
định BỐN BẢNG vỏ game (nhạc · thành tựu · hướng dẫn · ngôn ngữ) đã cũ hay chưa. Thêm vào là mỗi
lần sửa bản đồ nhỏ lại báo "bảng nhạc cũ" — một dòng vàng sai mà dựng lại chưa chắc xoá được.

### ⚠ Gộp mẹo hướng dẫn với thành tựu vào MỘT bảng

Hai nguồn khác nhau nhưng CÙNG một chỗ đứng. Tách hai bảng là hai thứ có thể hiện đè lên
nhau — và lỗi đó chỉ lộ ra đúng lúc người chơi vừa mở được thành tựu vừa chạm bước hướng dẫn,
tức gần như không bao giờ bắt được lúc test.

### ⚠ Mọi chấm phải cho ngón tay ĐI XUYÊN QUA

`raycastTarget = false` cho từng chấm VÀ cho tấm nền. Thanh nằm ở mép trên — vuốt camera
ngang qua đó mà bị nuốt là mất cú vuốt, và người chơi không biết vì sao.

### ⚠ Thẻ CÀI ĐẶT nay cao 470 px, không phải 300

Thêm ba thanh (nhạc · tiếng động · ngôn ngữ) + dòng thành tựu vào `GameShell.DrawSettings`.
Giữ 300 px thì nút «Quay lại» — neo vào `card.yMax` — nằm ĐÈ lên hàng cuối: bấm vào chỗ tưởng
là nút lại trúng thanh trượt, và trên điện thoại thì gần như không thoát ra được.

### ⚠ BA thanh âm lượng, không phải một

Rất nhiều người chơi trên điện thoại tắt nhạc mà vẫn cần nghe tiếng bước chân / tiếng lên
đạn. Một thanh là ép họ chọn giữa "im hết" và "ồn hết". `AudioListener.volume` là thanh TỔNG;
`musicVolume` và `sfxVolume` NHÂN vào nó (xem `SaveSystem.SyncUi`, `StickmanAudio.SfxScale`).

### ⚠ Món nợ còn lại: 48 file vẫn dùng IMGUI

Đo ngày 2026-09-08: **48 file có `OnGUI`, 8 file dùng uGUI**. Phần lớn 48 file đó là HUD gỡ
lỗi (đúng chỗ của IMGUI). Nhưng `GameShell`, `GameModeHud`, `GameSession`, `PlayerRespawn`,
`MatchModeBase`, `ModePrompt` là **người chơi nhìn thấy** — chúng vẫn còn nợ theo luật
*CHẾ ĐỘ CHƠI DÙNG CANVAS THẬT*. Thành phần mới phải dựng bằng Canvas ngay từ đầu; đừng nối
thêm vào nợ cũ.

## ⚠⚠ ĐA MÀN HÌNH: MỘT SỔ CHIA VÙNG, VÀ NÓ ĐO ĐƯỢC (2026-09-08)

Luật chỗ đứng đã có trong file này từ lâu — nhưng nó là **văn xuôi**, không có gì bắt buộc.
Người viết HUD mới (nhất là AI yếu) gõ một toạ độ trông hợp lý rồi đi tiếp, và chỗ đè nhau chỉ
lộ ra khi người chơi báo *"bấm không được"*.

Nay chỗ đứng là thứ **đi xin**: `ScreenZones.Request(ScreenZone.TopCenter, "CompassBar")`.

### Chín ô

| Ô | Của ai |
|---|---|
| TopLeft | hàng nút bảng + menu gỡ lỗi ở DẢI TRÊN; `FieldMinimap` giữ phần DƯỚI của ô |
| TopRight | hàng nút bảng, menu gỡ lỗi |
| **TopCenter** | thanh la bàn, đồng hồ trận, tiến độ mục tiêu |
| MidLeft · MidRight | bảng danh sách (chọn lính, chọn nhà) |
| **MidCenter** | bảng CHẶN: kết quả trận, menu, xác nhận |
| **BottomCenter** | bảng báo, mẹo, thanh mua nhanh |
| BottomLeft · BottomRight | **NGÓN CÁI** — cần ảo và cụm nút. Không HUD nào khác được vào |

`ScreenZones.Request` **réo `LogWarning` ngay** khi hai HUD cùng đòi một ô, và
`Conflicts()` liệt kê cả hai kiểu va (cùng ô · lấn vào ô ngón cái).

### ⚠ Ô MidCenter KHÔNG bị dải điều khiển cắt — kèm một điều kiện

Đo được (tool «Soi bố cục ở 12 khổ màn hình»): trên **điện thoại nằm ngang**, tầm với ngón cái
55 mm chiếm **42% chiều cao màn** — vì máy nằm ngang chỉ cao ~68 mm. Trừ tiếp dải trên và hai
hàng nút thì ô giữa còn **51 đơn vị**: không đủ cho một bảng kết quả trận, trên đúng khổ máy
phổ biến nhất.

Nên MidCenter được dùng cả phần dưới — **với điều kiện**: bảng nào xin ô này **phải** đăng ký
`StickmanUI.RegisterControlSuppressor`. Bảng chặn thì cần ảo và cụm nút đã được cất đi, dải
điều khiển lúc đó không có ai đứng. Không đăng ký mà vẫn phủ xuống đáy = bảng nằm đè lên cụm
nút **đang bấm được**.

### ⚠⚠ CANVAS PHẢI TREO VÀO `CampUiKit.SafeRoot(canvas)`, KHÔNG treo thẳng vào canvas

`CanvasScaler` chỉ lo TỈ LỆ — nó không biết gì về tai thỏ, bo góc, vạch home. Treo thẳng vào
canvas thì trên máy thật:
* bảng neo mép trên chui sau **tai thỏ**;
* nút neo mép dưới nằm dưới **vạch home của iOS** — vuốt lên là THOÁT GAME thay vì bấm nút;
* máy bo góc mạnh cắt mất một phần vùng bấm ở góc.

Không lỗi nào báo, và ở Editor thì không bao giờ thấy. `SafeAreaPanel` đo lại mỗi khi khổ màn
đổi (xoay máy · chia đôi màn hình · bật bàn phím), không chỉ ở `Start`.

### Hai không gian thiết kế, một cầu nối

`StickmanUI`/`ScreenZones` đo bằng đơn vị thiết kế; Canvas đo bằng đơn vị `CanvasScaler`.
Cầu nối duy nhất: `CampUiKit.DesignToCanvas(canvas)` = `StickmanUI.Scale ÷ canvas.scaleFactor`.
Đặt bảng vào ô bằng `CampUiKit.PlaceInZone(...)`, đừng tự nhân tay.

⚠ Tính từ `scaleFactor` chứ **không** đo `rect.width` của tấm gốc: ở `Start` Unity chưa chạy
lượt layout nào nên `rect` còn bằng 0, và mọi bảng đặt lúc đó dồn về một điểm.

### Bấm nút nào để kiểm

`★ Bảng điều khiển` › *Rig & Kiểm tra* › **«Soi bố cục ở 12 khổ màn hình»** — đo ĐT rẻ · ĐT dài
20:9 · **dựng đứng** · tablet · iPad 4:3 · PC cửa sổ nhỏ. Doctor cũng chạy phép đo này.

## ⚠⚠ VẼ RA CÁI NÚT THÌ BẤM PHẢI CÓ TIẾNG NÓI — VÀ NÚT KHÔNG CÓ VIỆC PHẢI NHƯỜNG CHỖ (2026-09-09)

Người dùng báo đúng một câu: *"cái button popup này bấm không có tác dụng"* — ảnh chụp là ô hỏi
`QUÁN RƯỢU — no rồi` của thành phố mở (`MapOpenWorld`). Đường bấm KHÔNG hỏng: `ModePrompt` vẽ
`GUI.Button` + tự hit-test `Input.touches`, chuột và ngón tay đều tới nơi. Hỏng là ở đầu kia —
`Activate` chạy vào một nhánh `return;` không nói gì.

### Luật 1 — mọi nhánh `return` của `Activate` phải để lại một dấu vết

`TryGetPrompt` trả về chữ ⇒ `ModePrompt` vẽ ra một **cái nút**. Người chơi đọc "có nút" là "bấm
được". Nên mỗi nhánh `Activate`/`UseShop` thoát sớm phải `Banner`/`Announce` lý do. Bốn nhánh
từng im lặng ở tiệm (đóng cửa · máu đang đầy · **no rồi** · đang không bị truy nã) cộng một nhánh
ở `HostageRescueMode` (bật `_playerWorking` rồi `TickPlayerRescue` tắt lại ngay vì còn địch).

Khuôn có sẵn để chép: `StickmanPickupPrompt` — quá tay nghề thì vẫn hiện ô, `GUI.enabled = false`
cho nhìn ra là không bấm được, **và** chữ nói rõ vì sao. Chú thích ngay trong file đó đã ghi:
*"im lặng là người chơi tưởng game hỏng"*.

### Luật 2 — ô hỏi KHÔNG có việc thì nhường suất cho ô đang có việc

`ModePrompt` chỉ vẽ **một** ô, và nó lấy nguồn ĐĂNG KÝ TRƯỚC NHẤT trả `true` — không phải nguồn
gần nhất. `reach` của tiệm bằng nửa bề ngang toà nhà, nên cả mặt tiền cả chục đơn vị thuộc về
tiệm. Tiệm không bán được gì mà vẫn giữ ô thì cả dải đó là **vùng chết của nút [F]**:

* cướp tiệm xong (3 sao, xe cảnh sát đang tới) đứng ngay cạnh xe tẩu thoát vẫn **không lên xe
  được** — tiệm vừa bị cướp đang chiếm ô hỏi;
* đứng trước gara cạnh chính chiếc xe của mình, ô ghi "phải đưa xe vào" mà nút không cho làm.

`MapOpenWorld.PromptShop` là chỗ chốt: tiệm `idle` **và** chỗ khác có việc thật (mốc việc · xe ·
người để trấn lột) ⇒ trả `null`, nhường. Không ai có việc thì vẫn hiện chữ của tiệm — người chơi
cần đọc được "no rồi" để biết mình vừa bấm cái gì.

### ⚠ `idle` do CHÍNH nhánh viết chữ khai, không dò lại

`ShopOffer(..., out bool idle)`: nhánh nào dựng câu chữ thì nhánh đó nói luôn "bấm có đổi được gì
không". Dò lại ở hàm thứ hai là hai phép đo lệch nhau — đúng lỗi *"ô hỏi ghi một việc mà bấm ra
việc khác"* mà đầu file `MapOpenWorld.Shops.cs` đã phải cảnh báo. Cùng lý do, `TryGetPrompt` và
`Activate` nay gọi **chung** `PromptShop` thay vì hai chuỗi `if` chép song song.

### Rà lại khi thêm ô hỏi mới

Sáu nguồn `IModePrompt` (`MapOpenWorld` · `Vehicle` · `BombDefusalMode` · `HostageRescueMode` ·
`VillageRaid` · `MobaLaneMode`) và năm ô đi qua `StickmanPromptArbiter` (nhặt đồ · cổng làng ·
lên ngựa · máy công thành · tay lái tàu). Thêm nguồn mới thì tự hỏi đúng hai câu: *bấm vào lúc
"không làm gì được" thì người chơi thấy gì?* và *lúc mình không có việc, ai đang bị mình chặn?*
