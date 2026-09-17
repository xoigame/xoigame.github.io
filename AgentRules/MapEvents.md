### ⚠⚠ MỐC SỰ KIỆN CỦA MAP + ĐU DÂY LÊN TƯỜNG — `MapEventMarker` (2026-09-05)

User đặt: *"AI đu dây lên tường thành, bắt thang lên; thiết kế các mốc vị trí sự kiện cho map"*.

**Mốc sự kiện là DỮ LIỆU THUẦN** (`Map/MapEventMarker.cs`, không collider, **không
`TeamMember`**): một điểm trên map kèm `MapEventKind` · phe · bán kính · **sức chứa**. Mười loại:
`Spawn` · `Rally` · `Ambush` · `Sniper` · `Breach` · `Supply` · `Defend` · `Patrol` · `Retreat` ·
`Objective`.

⚠⚠ **KHÔNG GẮN `TeamMember` LÀ CỐ Ý** — đúng khuôn `RiderlessHorse.All` và `AmmoCache`: gắn vào
là cái mốc lọt vào radar chọn mục tiêu và mọi vòng ĐẾM QUÂN (`SkirmishMode`, trần hồi sinh)
phải nhớ lọc ra. Phe lưu thẳng bằng `_teamId`, **−1 = trung lập** (`Serves` trả true cho mọi phe).

⚠⚠ **KHAI MÀ KHÔNG AI GỌI LÀ KHAI SUÔNG** — bài học `volleyWaitTime` / `GenreDefinition.Uses()`.
Nên mốc được nối đủ **ba đầu** ngay trong lần làm đầu:

| Đầu | Ở đâu | Việc |
|---|---|---|
| **ĐẶT TAY** | `MapDefinition.events[]` (`PlacedEvent`) + tab **«Mốc sự kiện»** của Xưởng map | người thiết kế chọn loại/phe/bán kính/sức chứa rồi bấm đặt |
| **TỰ SUY** | `MapAssembler.BuildEventMarkers` (`map.autoEvents`, mặc định **BẬT**) | mỗi mốc sinh quân → `Spawn`; mỗi mục tiêu → `Objective`; mặt tường ngoài → `Breach` |
| **AI ĐỌC** | `MapAssembler.ApplyEventRoles` | lính ĐANG RẢNH trong 18 đơn vị nhận vai theo mốc gần nhất: `Ambush` → `AIBehavior.Ambush` · `Sniper`/`Defend` → `GuardTarget` vào chính cái mốc |

⚠ **SỨC CHỨA LÀ VẾ BẮT BUỘC** (`TryClaim`/`ResetClaims`): không có trần thì cả tiểu đội dồn vào
một ổ phục kích — đúng bệnh mà `GarrisonPost` chia suất để tránh ngay từ đầu.
⚠ **CHỈ CƯỚP LÍNH RẢNH** (`FreeRoam`/`HuntTarget` không có cột mốc) — kẻ đang vác thang, trấn thủ,
hộ tống, đẩy xe đều có việc NHIỀU PHA, cướp là hỏng nhiệm vụ của màn.
⚠ **`MapBuildRules.CheckEventMarkers`** đo từng mốc: nằm trong map · không lơ lửng trên vực ·
không cao hơn mặt đất 3.5 / thấp hơn 0.6. Một mốc đặt giữa không khí thì AI đi tới rồi đứng
dưới chân nó tới hết trận, **không lỗi nào báo**.

**ĐU DÂY LÊN TƯỜNG — KHÔNG MỘT LUẬT AI MỚI NÀO.** `StickmanClimbZone` đã có cờ `IsRope`
(chuyền ngang được, leo chậm hơn) từ lâu mà **chưa map nào dựng một sợi dây nào**. Nay
`AutoBreachMarkers` thả dây dọc MẶT NGOÀI tường thành (`Setup(isRope: true, ...)`) kèm một mốc
`Breach`, nên quân công có đường lên mặt tường **ngoài cổng và ngoài cầu thang**.
⚠⚠ **`LaneNav` TỪNG Bỏ QUA THÁNG DÂY** — vòng dựng cạnh leo lọc `!zone.IsRope`, nên sợi dây
dựng ra **không nằm trong đồ thị**: AI không bao giờ lập được lộ trình qua nó, và luật 6 của
`MapBuildRules` vẫn báo *"tầng cô lập"*. Nay dây là một cạnh leo bình thường, **chi phí ×1.35**
— có cầu thang thì AI vẫn chọn cầu thang, dây là đường **có giá**, không phải đường tắt.
⚠ **Đất cong là MỘT nút** trong `LaneNav`: cả dải `TerrainGround` quy về `BaseY`, và `FindNode`
lùi về nút đó cho ai đang đứng trên đỉnh đồi — không thì người trên đồi rơi ra ngoài đồ thị.

⚠ **KHÔNG phải dựng lại scene nào** cho phần cơ chế (mọi thứ là code runtime + field MỚI), nhưng
**map đã bake phải dựng lại** để có mốc + dây: bấm *Hệ thống map* rồi mở lại sân map.


