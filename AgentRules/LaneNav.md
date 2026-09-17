### ⚠⚠ ĐỒ THỊ LÀN — `LaneNav`: AI ĐỊNH VỊ ĐƯỢC ĐƯỜNG ĐI (2026-09-05)

`Assets/Scripts/Combat/World/LaneNav.cs` · `StickmanAgent.TryLaneRoute` · `MapBuildRules` luật 6 ·
tool `Maps > 8. Soi ĐỒ THỊ LÀN` · F9 vẽ đồ thị lên Scene view. Chi tiết:
`Docs/KnowledgeBase/LaneNav.md`.

Trước đây AI trả lời *"làm sao tới chỗ nó"* bằng BỐN hàm rời nhau và cả bốn đều là **"cái
thang GẦN NHẤT nối hai cao độ"** (`TryPlanTraversal` · `FindStairsBetweenLevels` ·
`FindClimbBetweenLevels` · `FindClimbZoneNear`). Đúng với một bức tường một cầu thang; sai
ngay khi phải đi HAI chặng, khi thang gần nhất dẫn lên tầng KHÁC, hay khi đích cùng cao độ
mà bị cổng chắn — mỗi lần sai là một vòng đi tới đi lui, không lỗi nào báo.

Nay có MỘT đồ thị dựng từ vật lý scene: **NÚT** = mặt đứng được (đất · thềm · mặt tường ·
sàn tháp, gồm cả đoạn nào là sàn MỘT CHIỀU) · **CẠNH** = cầu thang · thang trèo · tụt sàn ·
cổng (công sự chắn làn CẮT nút làm đôi, chi phí hỏi luật LÚC CHẠY: quân nhà cửa đóng = ∞,
quân địch = 14 nếu phá được). `TryRoute` trả về BƯỚC ĐẦU TIÊN; AI lái theo nó ở
`UpdateTraversal` TRƯỚC mọi hàm cũ, và **không có đường thì mọi hàm cũ chạy y như trước**.

⚠ **Walk / Gate KHÔNG giành tay lái** — state đi thẳng, cổng thì `UpdateBlockedPath` phá. Chỉ
`Stairs` (cả LÊN lẫn XUỐNG) và `Drop` mới lái; `Climb` giao cho `TryTakeClimbRoute` kèm CHIỀU
(`_climbRouteUp`), và `UpdateClimbing` nay có nhánh **cam kết TỤT XUỐNG** + **leo lên tới cột
mốc khi KHÔNG CÓ mục tiêu** — bản cũ `!TargetAlive → ExitClimb` ngay nhịp đầu, tức trèo tới
một cột mốc là bất khả thi.
⚠ **Edit mode không chạy `Awake`** ⇒ `StickmanStairs._span` rỗng. `Rebuild` gọi
`EnsureMeasured()` và quét `FindObjectsByType`, KHÔNG dùng `StickmanStairs.All` — cùng lý do
`FortPlan.Validate()` phải tự kiểm chân cầu thang.
⚠ **Cổng đóng/mở/vỡ không cần dựng lại** (cạnh hỏi luật lúc chạy). Chỉ thang / cầu thang /
công sự BẬT TẮT mới `MarkDirty()` — đã nối ở `OnEnable/OnDisable` của cả ba; thêm loại cạnh
mới thì nối tương tự. Lưới đỡ: dựng lại mỗi 6 giây.
⚠ **Luật 6 của `MapBuildRules` hỏi CHÍNH đồ thị này**: tầng CÔ LẬP · LÊN ĐƯỢC MÀ KHÔNG XUỐNG ·
lô sinh quân không tới được đình/vùng chiếm (cổng coi là phá được). "Map này AI có đi tới mục
tiêu được không" nay đo bằng đúng thứ AI sẽ đo, không phải một bản mô phỏng riêng.
⚠ Mô phỏng Python cùng công thức: `scratchpad/lanenav_sim.py` — sửa hằng số nào trong
`LaneNav` thì chạy nó trước.
⚠ **SÀN MỘT CHIỀU CỦA CÔNG TRÌNH LÀ NÚT** (2026-09-11): `CollectSurfaces` từng bỏ mọi collider có
`StickmanController` ở cha trừ mặt trên của công sự — nên sàn gác trong nhà chính (`BuildingInteriorKit`,
`PlatformEffector2D` dưới `Gian_Trong`) không thành nút, thang đứng `Thang_Dung_*` có chân mà không đỉnh,
AI coi nó không tồn tại (user: *"cầu thang đứng AI không di chuyển được"*). Nay: nhân vật bỏ; công sự giữ
luật cũ (chỉ mặt `WalkableTopY` — `Stack` chồng thùng có 4 nóc thùng một chiều, nhận hết là 4 "tầng" giả);
công trình khác nhận đúng sàn `usedByEffector`. Phép đo: smoke `Maps › 9` réo «THANG TRÈO CÔ LẬP».

⚠ **`SplitByBlockers` không được tuỳ thứ tự** (2026-09-11): chốt nằm ở MÉP nút (tường bất tử xử trước,
cổng kề nó tới sau) từng chỉ gọt mép và không thêm cạnh — sân thành nối ra ngoài chỉ bằng cạnh ∞ của
tường, «Lô sinh quân KHÔNG TỚI ĐƯỢC đình» lúc réo lúc không tuỳ `FindObjectsByType`. `LinkAcross` gọt
mép xong vẫn nối nút với hàng xóm bên kia chốt bằng cạnh Gate của chính chốt đó. Cùng ngày: thân đặc của
công sự nhận qua luật `WalkableTopY` thì kéo `y` về `WalkableTopY` (cột tháp canh dưới sàn 0.25 từng là
một "tầng" 1 đơn vị không cạnh). Luật đo: một vi phạm lúc có lúc không giữa hai lần dựng cùng seed =
thứ tự duyệt, tìm nhánh `continue` bỏ qua việc thêm cạnh.

## ⚠⚠ CẮT TRƯỚC, NỐI SAU — thứ tự hai lượt của `SplitByBlockers` (2026-09-13)

Bản cũ vừa CẮT nút vừa THÊM cạnh trong cùng một vòng lặp, nên **mỗi nhát cắt làm hỏng những cạnh
đã thêm trước đó**: cạnh cũ vẫn trỏ vào `id` của nút vừa bị cắt, mà nửa mang `id` ấy có thể đã nằm
tít bên kia. Một toà thành là dãy `ngoài │ TƯỜNG │ sân │ CỔNG │ ngoài`; cổng xử trước thì cạnh rẻ
của nó trỏ vào mảnh CŨ, còn sân thành đẻ ra sau chỉ còn đúng một cạnh — cạnh ∞ của bức tường BẤT TỬ.
Với AI, **toà thành không có lối vào**.

Đo được (`Maps › 9`, bộ `Med_`): sân `x[11.1..19.2]` của `Med_Siege` chỉ có `Gate→#0` của
`Thanh_2_TuongThanh_Khuc1(BẤT TỬ)`, còn `Thanh_2_CongThanh` — cái cổng PHÁ ĐƯỢC ngay cạnh đó —
không sinh ra cạnh nào. 8/12 map `Med_` hỏng đều đúng hình này.

**Nay:** `SplitByBlockers` chạy **hai lượt** — lượt 1 cắt hết (thuần hình học, không cạnh nào),
lượt 2 mới nối. Lúc đó mép các nút đã chốt nên *"nút sát bên trái / bên phải chốt này"* có đáp án
duy nhất, không phụ thuộc thứ tự `FindObjectsByType`. Kèm theo:

* `GateLinkReach` **5.0** (số cũ 0.6 chỉ với qua được MỘT bức tường mỏng; dãy `tường │ cổng │ tường`
  của một toà thành đo được rộng **1.5–4.5**).
* Nới tầm thì phải kèm `SpanIsBlocked`: quãng giữa hai nút phải được **lấp kín bằng thân công sự**.
  Không có vế này thì cùng tầm ấy với luôn qua một CÁI HỐ — nối hai bờ hố bằng cạnh "phá là qua
  được" là dạy AI đi thẳng xuống nước.
* Lượt 2 xét **cả chốt đang nhường làn / đã sập**: chúng không cắt gì, nhưng nếu hàng xóm đã cắt nút
  thì chính chúng là LỐI ĐI rẻ giữa hai mảnh (cổng mở cạnh bức tường bất tử).
* `LaneNav.CostOf(edge, who)` công khai — luật dựng map cần biết cạnh giá ∞ hay 14, không thì dòng
  réo chỉ nói được "có cạnh".

## ⚠ "NỀN" LÀ MỘT TẬP, KHÔNG PHẢI MỘT NÚT (luật 6, 2026-09-13)

`CheckLaneConnectivity` cũ lấy ĐÚNG MỘT nút — cái rộng nhất ở cao độ mặt đất — rồi đòi mọi tầng phải
về được đúng nó. Nhưng mặt đất của map có thành bị chính toà thành chia thành NHIỀU VÙNG (ngoài tây │
sân │ ngoài đông), cả ba đều là mặt đất thật, đều có cầu thang lên tường của riêng nó. Kết quả: cả nửa
map bên kia bức tường bất tử bị đọc ra *"không lên được từ mặt đất"* — **41 dòng đỏ trên bộ `Med_`,
cả 41 đều sai**, và chúng chôn mất những dòng đỏ đúng.

Nay: tầng chỉ cần leo lên được từ **MỘT vùng mặt đất nào đó**. Việc hai vùng mặt đất không thông nhau
là câu hỏi KHÁC — vẫn báo, nhưng ở mức **cảnh báo** («MẶT ĐẤT BỊ CẮT RỜI») và có **nói tên cái chắn**,
vì tường thành bất tử chia đôi sân là chuyện CỐ Ý (tường là địa hình, vào bằng thang công thành).

Phép chẩn đoán nằm ở `MapBuildRules.Lane.cs` (`DescribeLaneIsland`): in ra cạnh + giá (`[∞]`,
`[đích cũng cô lập]`), hàng xóm cùng tầng + khe, lô/hố/hầm quanh mép, và **tên từng công sự chắn**
kèm cờ BẤT TỬ / nhường làn / đã sập. Không có nó thì dòng réo chỉ nói "không nối về nền" và ba lần
sửa trước đều đoán sai chỗ.
