## ⚠⚠ MỘT MÀN CHƠI HOÀN CHỈNH GỒM GÌ — VÀ CÁI GÌ IM LẶNG KHI THIẾU (2026-09-16)

Đo cả 50 mode ngày 2026-09-16 sau câu hỏi *"smoke test mấy chế độ chơi cũ và sửa lại cho thành
1 gameplay hoàn chỉnh với UIUX đầy đủ"*. Kết quả: mọi thứ **biên dịch xanh**, mọi mode **có
luật thắng thua đúng**, nhưng hai mảnh của vòng chơi bị thiếu ở hàng chục chỗ — và cả hai đều
thiếu trong im lặng, vì cái mặc định của lớp gốc là *"không vẽ gì"*.

### Bốn mảnh bắt buộc

| Mảnh | Khai ở đâu | Thiếu thì người chơi thấy gì |
|---|---|---|
| **TÊN màn** | `MissionName` (abstract) | không thể thiếu — trình biên dịch chặn |
| **DẠY CHƠI** | `MissionBrief` (abstract) | không thể thiếu — trình biên dịch chặn |
| **HUD trong lúc chơi** | `StatusLine` (virtual → **chuỗi rỗng**) | **màn chơi CÂM** — xem mục 1 |
| **ĐƯỜNG VỀ sau khi hết ván** | `GameSession`, hoặc nút của `MatchModeBase` | **ngõ cụt trên điện thoại** — xem mục 2 |

Hai mảnh trên là `abstract` nên không ai quên được. Hai mảnh dưới là `virtual` với mặc định
rỗng — và đó chính là lý do chúng thiếu ở 8 và 21 chỗ.

> Luật rút ra: **một mặc định "không làm gì" là một cái bẫy có hẹn giờ.** Thứ bắt buộc phải có
> thì để `abstract`; thứ không thể để `abstract` thì phải có PHÉP ĐO canh.

---

### 1. HUD — `StatusLine` mặc định là CHUỖI RỖNG

`MatchModeBase.OnGUI` chỉ vẽ khi `StatusLine` khác rỗng. Mode nào không khai thì chạy suốt ván
mà **không hiện một con số nào**: chỉ tiêu, đạn còn lại, đồng hồ đều nằm trong đầu trọng tài, và
người chơi biết mình đang đứng đâu vào **đúng giây ván kết thúc** — tức lúc không còn làm gì được
nữa.

Đo 2026-09-16: **8/50 mode** câm — `AppleShotMode` · `ArcheryTrialMode` · `DeployPhaseMode` ·
`HuntMode` · `RanchMode` · `TowerHoldMode` · `WuxiaTournamentMode` · `WuxiaTrainingMode`.

⚠⚠ **IN ĐÚNG MẤY CON SỐ MÀ CÂU KẾT THÚC DÙNG.** Cái người chơi theo dõi và cái trọng tài chấm
phải là **một**. Ví dụ đã suýt sai ở `RanchMode`: trọng tài chấm trên `_peakProduced` (mốc cao
nhất) còn HUD định in `Produced` (sản lượng hiện tại) — chuồng mất là `TotalProduced` của nó biến
theo và **con số trên HUD tụt xuống**, người chơi đọc ra là game ăn gian.

⚠ Có luật riêng thì nói ra trên HUD, đừng để nó là một bất ngờ: `TowerHoldMode` in thẳng
*"ĐỊCH ĐẶT CHÂN LÊN SÀN LÀ THUA"*, vì đó là luật duy nhất khiến chiều cao có giá.

⚠ Pha chạy ở `Time.timeScale = 0` (bày trận) thì HUD là thứ **duy nhất** còn nói được: không có
nó, người chơi đặt quân tới lúc hết tiền mới biết mình đã hết tiền.

⚠ Đừng in một hạn mức không tồn tại. `HuntMode` cho nhặt lại tên (`_recoverArrows`), nên số tên
**không phải** đồng hồ đếm ngược — in nó như một hạn mức là doạ người chơi bằng một luật không có.

**Phép đo canh:** Doctor › «Màn chơi có dòng HUD không». Lớp con của `ArcadeModeBase` được MIỄN
(lớp gốc đã khai `StatusLine` cho cả họ) — đo mà không trừ nhóm đó là bốn cảnh báo oan, và một
bảng khám kêu oan bốn dòng là bảng khám lần sau không ai đọc.

---

### 2. ⚠⚠ ĐƯỜNG VỀ — 21 scene từng là NGÕ CỤT trên điện thoại

`MatchModeBase.Finish` giao màn hình kết quả cho `GameSession`. Scene nào **không có**
`GameSession` thì nhánh `else` chỉ dán thêm một **nhãn chữ** vào băng-rôn:

```csharp
_banner = reason + "   (bấm R chơi lại)";   // ← bản cũ
```

Điện thoại **không có bàn phím**. Ván xong là ngồi nhìn cái băng-rôn vĩnh viễn, không có gì bấm
được, không có đường ra.

Đây **đúng** lớp lỗi mà `GameSession.DrawResultButtons` đã sửa một lần rồi và ghi rõ ngay tại chỗ
*"PHẢI LÀ NÚT, KHÔNG PHẢI NHÃN"*. Nó sống sót được ở nhánh **không có tầng game** vì đó là nhánh
của "màn demo thì thôi" — và 21 scene đang đi đúng nhánh đó: đua ngựa · đua xe · đua vượt chướng
ngại · đi săn · trại chăn nuôi · trường bắn · kỵ xạ · bắn đĩa · bắn táo · cố thủ tháp · sinh tồn ·
đột nhập · hoá thân trùm · đấu pháo · bắn loạt · công thành Tam Quốc · 5 scene `Genre_*`.

Nay `MatchModeBase` tự vẽ nút **▶ CHƠI LẠI MÀN NÀY** khi hết ván mà không có `GameSession`.

⚠ **CHỈ ĐẶT CỜ, ĐỪNG `LoadScene` NGAY TRONG `OnGUI`.** Nạp scene huỷ luôn object đang vẽ dở,
IMGUI mất khối GUIClip đang mở và Unity nhả một tràng *"pushing more GUIClips than you are
popping"*. Nạp ở `LateUpdate`.

⚠ Cao `StickmanUI.Row` (44 trên cảm ứng ≈ 9–10 mm), không gõ số pixel; và gọi
`StickmanUI.ClaimPanel` để cú bấm không kèm theo một nhát chém xuống sân.

⚠ **Màn tự lo đường chơi lại thì phải TẮT nút này** (`ShowsReplayButton => false`). `ArcadeModeBase`
chơi lại bằng **một cú chạm bất kỳ** và cố ý **không nạp scene** (nạp scene mất cả giây — đúng thứ
giết vòng "một lần nữa thôi"). Để cả hai đường cùng sống thì chạm trúng nút là nạp scene, chạm
trượt nút là ván mới tức thì: **cùng một cú chạm, hai kết quả khác nhau**.

---

### 3. MỘT CỬA CHO MỌI BẢNG GỠ LỖI — nút `⚙`

`StickmanDevMenu` gom mọi bảng gỡ lỗi vào một ngăn kéo, **mỗi lúc một bảng**
(`StickmanUI.SetDevPanel`). Thêm bảng mới = 1 giá trị enum + 1 lời gọi `RegisterDev`, không vẽ
thêm nút nào.

⚠⚠ Nhưng cuộc dọn dẹp ấy **làm dở**: đo 2026-09-16 thì **5/11 ô của `DevPanel` là ô chết** —
`Testbed` · `AILab` · `DuelLab` · `TeamCommand` · `Roster` có enum, có chỗ, **0 lần đăng ký**.
Năm bảng tương ứng vẫn bật/tắt theo `StickmanUI.HudOpen`, tức theo nút `≡` của **HUD chơi game**.
Dự án vì thế có **hai ngăn kéo cho cùng một loại thứ**: nắp đã đục sẵn lỗ, không ai cắm phích vào.

> Dấu hiệu phải tìm: **một giá trị enum không có chỗ nào GHI nó.** Cùng họ với
> «tính năng xong mà không ai chọn» — xem `Docs/AgentRules/TaskIndex.md`.

⚠ Bảng nào là **nội dung chính của scene lab** (`Testbed` · `AILab` · `Roster`) thì TỰ MỞ lần đầu
nếu chưa bảng nào bật; không có vế ấy thì mở scene ra là một cái sân trống và người dùng phải đoán
rằng có một nút `⚙` ở góc.

⚠⚠ **Nhưng đừng cho bảng PHỤ tự mở.** `TeamCommandHud` có mặt trong **scene chơi thật**
(`StickmanGameplayBuilder` · `StickmanDemoBuilder`), mà `StickmanUI.GameHudSuppressed` thu HUD
trận đấu lại ngay khi có một bảng gỡ lỗi bật ⇒ tự mở nó là **vào trận phát là mất HUD chơi game**,
không lỗi nào báo. `DuelLabHud` cũng không tự mở: nó sống chung scene với `StickmanAILabHud`, hai
bảng cùng đòi tự mở là một cuộc đua mà kết quả đổi theo thứ tự component trong scene.

---

### 4. Cách chạy lại phép đo

| Muốn biết | Bấm / chạy |
|---|---|
| Mode nào câm (không có HUD) | Doctor › «Màn chơi có dòng HUD không» |
| Mode nào chưa vào công thức JSON | Doctor › «Kiểu chơi vào được công thức JSON» |
| Scene nào có AI mà không có trọng tài | `Tools > Stickman > Nâng cao > Rig & Kiểm tra > Soi TẤT CẢ màn chơi` |
| Bảng gỡ lỗi nào chưa vào ngăn kéo `⚙` | tìm `DevPanel.X` không có `RegisterDev` tương ứng |
