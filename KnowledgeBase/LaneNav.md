# Đồ thị làn — `LaneNav` (AI định vị được đường đi)

`Assets/Scripts/Combat/World/LaneNav.cs` · hỏi từ `StickmanAgent.TryLaneRoute` · kiểm bằng
`MapBuildRules.CheckLaneConnectivity` · soi bằng **F9** (vẽ đồ thị lên Scene view) và
`Tools > Stickman > Nâng cao > Maps > 8. Soi ĐỒ THỊ LÀN của scene đang mở`.

## 1. Vì sao cần

Game đi ngang một làn, nhưng map lắp ghép có nhiều TẦNG: mặt đất · thềm · mặt tường · sàn
tháp · đường trên. Trước đây AI trả lời câu *"làm sao tới chỗ nó"* bằng bốn hàm rời nhau, và
cả bốn đều là **"cái thang GẦN NHẤT nối hai cao độ"**:

| Hàm | Trả lời được | Sai khi |
|---|---|---|
| `StickmanStairs.TryPlanTraversal` | một cầu thang nối đúng hai cao độ | phải đi HAI chặng (1→2→3) |
| `FindStairsBetweenLevels` | cầu thang gần nhất | cầu thang gần nhất dẫn lên tầng KHÁC |
| `FindClimbBetweenLevels` / `FindClimbZoneNear` | thang gần nhất | thang ở phía bên kia bức tường |
| (không có) | — | đích CÙNG cao độ mà bị cổng chắn, hay nằm bên kia một thềm |

Mỗi lần sai là một vòng lặp đi tới đi lui, và không lỗi nào báo.

## 2. Đồ thị là gì

**NÚT** = một mặt đứng được, đo từ collider THẬT trong scene:
- mọi collider đặc không thuộc người / bậc thang / sàn biết đi → mép trên là một mặt;
- công sự chỉ góp mặt nếu `HasWalkableTop` (mặt tường, sàn tháp), và chỉ đúng cái mặt đó;
- gồ ghề thấp hơn `LowBumpHeight` (0.5) trên một mặt rộng hơn thì KHÔNG phải tầng (ụ che);
- các mặt cùng cao độ (±0.14) chạm/chồng nhau (khe ≤ 0.3) gộp thành MỘT nút — mặt tường +
  sàn gỗ + bậc chót thành một nút, cầu phủ mép hồ nối hai bờ thành một nút;
- nút nhớ các đoạn là **sàn một chiều** (`usedByEffector`) để biết tụt xuống được ở đâu.

**CẠNH**:

| Loại | Từ đâu | Đi được khi | Chi phí |
|---|---|---|---|
| `Stairs` | `StickmanStairs` (không phải `StairMode.Pass`) | luôn | run × 1.2 + rise × 1.5 |
| `Climb` | `StickmanClimbZone` (không phải dây) | `canClimb` và không vác thang | cao × 2.5 + 1 |
| `Drop` | đoạn sàn một chiều → nút ngay dưới | luôn (một chiều) | cao × 1.6 + 1.5 |
| `Gate` | công sự CHẮN LÀN (không `PassableForEveryone`) cắt nút làm đôi | xem `GateCost` | 0.3 / 14 / ∞ |

`GateCost`: sập / nhường làn / `WouldLetThrough(unit)` → 0.3 · quân NHÀ mà cửa đóng → ∞
(đợi lệnh, không phá cổng nhà mình) · quân ĐỊCH → 14 nếu phá được, ∞ nếu bất tử hoặc
`breakObstacles` tắt (ninja).

**HỎI**: `TryRoute(chân mình, chân nó, LaneAccess)` → `LaneStep` = bước ĐẦU TIÊN của lộ trình
(Dijkstra, có cộng quãng đi bộ trên nút để hai cầu thang ở hai đầu mặt tường không bị chấm
như nhau). Cùng nút → `Walk`.

## 3. AI dùng thế nào (`StickmanAgent`)

`UpdateTraversal` hỏi `TryLaneRoute` TRƯỚC mọi hàm cũ. Bốn loại bước, bốn cách xử:

| Bước | Ai lái |
|---|---|
| `Walk` / `Gate` | KHÔNG giành lái — state đi thẳng; cổng thì `UpdateBlockedPath` lo phá |
| `Stairs` | `DriveLane`: tới đầu vào → `RequestStairs` mỗi frame → đi hết dãy bậc (cả lên lẫn xuống); tới đầu ra thì buông |
| `Climb` | đặt `_climbRouteZone` + `_climbRouteUp`, `TryTakeClimbRoute` lái; `UpdateClimbing` có nhánh **cam kết tụt xuống** và **leo lên tới cột mốc khi không có mục tiêu** |
| `Drop` | tới toạ độ rồi `DropThroughPlatform` |

Không có đồ thị / không có đường → `false` và mọi hàm cũ chạy y như trước. `UpdateUnreachableTarget`
cũng hỏi đồ thị (ép, không chờ nhịp) trước khi bỏ tầng.

Dấu trên F9: `↦bậc` (đang đi cầu thang theo đồ thị) · `↦tụt` (sắp tụt sàn) · `↑thang` · `↑bậc`
(lối cũ) · `⇅bỏ-tầng`.

## 4. Kiểm "không kẹt" (`MapBuildRules` luật 6)

Chạy sau mọi map sinh và trong tool soi. Ba dòng đỏ, mỗi dòng là một lớp kẹt đã trả giá:
- **tầng CÔ LẬP** — không cạnh nào (thềm không cầu thang);
- **LÊN ĐƯỢC MÀ KHÔNG XUỐNG** — nóc tháp không sàn tụt, không thang;
- **lô sinh quân KHÔNG TỚI ĐƯỢC mục tiêu** (đình / vùng chiếm) với `LaneAccess.Anyone`
  (cổng coi là phá được).

## 5. Bẫy

- **Edit mode không chạy `Awake`** → `StickmanStairs._span` rỗng. `LaneNav.Rebuild` gọi
  `EnsureMeasured()` và quét bằng `FindObjectsByType`, KHÔNG dùng `StickmanStairs.All`.
- **Cổng đóng/mở/vỡ không cần dựng lại** — cạnh cổng hỏi luật lúc chạy. Chỉ thang/cầu
  thang/công sự BẬT TẮT mới `MarkDirty()` (đã nối ở `OnEnable/OnDisable` của cả ba).
- **Chân cầu thang rơi vào ô cửa cổng** thì không có nút nào chứa nó (nút đã bị cắt) → cạnh
  cầu thang đó biến mất. Bố cục FortKit không làm vậy; tool soi sẽ réo "tầng cô lập".
- **Mục tiêu đang bay** thì không hỏi (chờ nó đáp).
- Kỵ binh không hỏi đồ thị (không leo được gì cả).

## 6. Mô phỏng

`scratchpad/lanenav_sim.py` (cùng công thức) trên toà thành mẫu + thềm + tháp: 8 tình huống —
qua cổng · lên tường bằng cầu thang · phá cổng rồi trèo tháp · tụt sàn tháp · quân nhà cửa
đóng không có đường · không biết trèo không lên tháp. Sửa hằng số nào trong `LaneNav` thì
chạy lại nó trước.
