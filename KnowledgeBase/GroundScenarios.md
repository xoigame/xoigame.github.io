# Kịch bản sân 3/4 — AI · xây map · gameplay có cốt truyện (2026-09-12)

User: *"xem hệ thống AI, xây map và gameplay cho các thể loại view 3/4; lên ý tưởng và chế độ
chơi, thuật toán xây map sao cho có cốt truyện có nội dung, sinh ra đúng vị trí, có điều kiện
thắng thua theo game design."*

Luật đi kèm: `Docs/AgentRules/WorldPlane.md` §14–16. File này là phần **soát · thiết kế · thuật toán**.

## 1. Soát ba mảng của sân 3/4 (trước đợt này)

| Mảng | Đã có | Thiếu (đo được) |
|---|---|---|
| **AI** | đi 2D (`MoveOnPlane`), bám chiều sâu (`PublishDepthTarget`), vòng sườn (`FlankingDepthFor`), giãn cách 2 trục, chọn cầu/bến lội (`RouteDepth`), ẩn trong cỏ (`HiddenFrom`), sóng 4 phía, mọi state đã port | AI không có **ý định địa hình**: không tự tìm đồi để giữ, không tự dùng cỏ cao để phục kích, không phá cầu. Nó *hưởng* địa hình khi mục tiêu nằm trên đó — vì vậy mốc nhiệm vụ phải nằm đúng chỗ (mục 3) |
| **Xây map** | mặt sàn + tường biên, cảnh chia vùng (làng · ruộng · trại · phế tích · rừng), đường cái, sông · cầu · bến lội, cỏ cao, đồi, ụ cát; 25 nhiệm vụ × 4 thể loại × 2 kiểu nhìn sinh tự động | mốc nhiệm vụ đặt theo `DepthAt(x)` (hàm sin) — **không biết cây cầu ở đâu**. Map có địa danh mà ván chơi không dùng địa danh |
| **Gameplay** | 25 luật thắng của `MatchRules.DefaultFor`, 11 trọng tài rời, ngày/đêm nhuộm sân, đánh tập hậu, bao vây, vòng bo 2 trục | không có **bối cảnh**: HUD chỉ hiện tên nhiệm vụ + seed; người chơi không biết vì sao mình ở đây, giữ cái gì, mất cái gì |

## 2. Thiết kế: một ván 3/4 có cốt truyện gồm bốn lớp

```
KỊCH BẢN (map có tên)           ai · ở đâu · vì sao · thắng thua        StickmanGroundLandmarkMaps
   ↓ biome · forceRiver · night · timeLimit · nhiệm vụ · quân số
ĐỊA DANH (cảnh có ý)             cầu · bến lội · đồi · cỏ cao · làng · trại   MapGroundField.*  → Mark()
   ↓ sổ địa danh
MỐC NHIỆM VỤ (đúng vị trí)       điểm chiếm · cờ · tuyến xe · VIP          MapAssembler hỏi Landmarks
   ↓
LUẬT THẮNG THUA                  MatchRules.DefaultFor + timeLimit = đêm    MatchDirector (hiện cốt truyện 20 s)
```

Nguyên tắc: **kịch bản không thêm MissionType** (thêm một nhiệm vụ là 13 chỗ nối — `map-missions-studio`).
Một kịch bản = nhiệm vụ có sẵn + bộ số của map + địa danh được ép có + văn bản bối cảnh. Luật
thắng thua vì thế luôn là luật đã được trọng tài và AI hiểu.

## 3. Thuật toán «sinh ra đúng vị trí»

1. **Dựng cảnh trước, ghi sổ** — `MapGroundField.Compose` gọi `ResetLandmarks()` rồi từng bộ phận
   `Mark(kind, x, y)`: sông ghi *Bridge* + *Ford*; `BuildHills` ghi *Hill*; `BuildTallGrass` ghi
   *TallGrass*; xóm ghi *Village*; trại ghi *Camp*.
2. **Điểm chiếm** (`ObjectiveSpots`): lấy theo thứ tự **cầu → đồi → làng → bến lội → trại**, bỏ
   địa danh sát mép (|x| > halfWidth − 3) và địa danh cách điểm đã chọn < 4.5; thiếu thì bù lưới
   đều theo x với `SnapDepthOutOfRiver`. Sắp theo x để «Điểm 1..n» đọc trái → phải.
   ⇒ Bến Đò: điểm giữa nằm **trên cầu**, hai điểm kia trên **hai gò đồi** — ba chỗ đáng đánh nhau.
3. **Lá cờ**: trên cầu nếu có sông (tranh cờ = tranh cầu), không thì `GroundPoint(0)`.
4. **Xe hàng**: waypoint lấy `RoadDepthAt(x)` ⇒ xe đi đường cái, qua cầu; hộ tống phải giữ cầu.
   VIP không cần sửa: `AIStateTravel` đi bằng `MoveTowardsOnPlane` ⇒ `RouteDepth` tự chọn cầu/bến.
5. **Sóng địch**: cửa viện binh bốn mép (có sẵn) — với sông, sóng bờ bên kia buộc phải qua cầu/bến.
6. **Quân hai phe**: khối đội hình hai bên (`GroundFormationSlot`, có sẵn); sông ở dải giữa nên
   trận đầu luôn là trận giành chỗ qua.

Bẫy đã tránh: `GroundPoint` là cái phễu duy nhất — mọi mốc vẫn đi qua nó (kể cả khi đã có địa
danh, `SnapDepthOutOfRiver` bảo đảm không mốc nào dưới nước).

## 4. Sáu kịch bản đã dựng (`Maps › 8b`, tab Chế độ chơi › 3/4)

| Map | Thể loại · nhiệm vụ | Địa hình ép | Thắng | Thua |
|---|---|---|---|---|
| Bến Đò Đầm Lầy | Trung cổ · Chiếm cứ điểm | đầm lầy ⇒ sông; điểm giữa trên cầu, hai điểm trên đồi | đủ điểm chiếm | đối phương đủ điểm |
| Cầu Đầm Lầy | Hiện đại · Tử chiến đồng đội | sông + ụ cát hai đầu cầu | đủ mạng hạ | hết giờ ít hơn |
| Giữ Cầu Tới Bình Minh | Trung cổ · Bảo vệ doanh trại | rừng + `forceRiver`, **đêm dài = timeLimit 150 s** | trụ tới sáng / diệt sạch | nhà chính đổ |
| Xe Lương Qua Cầu | Trung cổ · Hộ tống | đồng cỏ + `forceRiver`; xe bám đường ⇒ qua cầu | xe tới kho | xe vỡ |
| Sứ Giả Qua Sông | Fantasy · Bảo vệ VIP | rừng + `forceRiver`; VIP tự chọn cầu/bến | VIP về làng | VIP ngã |
| Đầm Ma | Trung cổ · Xác sống | đầm lầy, **đêm 180 s**, sóng bốn mép | trụ tới sáng | nhà chính đổ |

Điều kiện thắng thua **không viết mới**: chúng là `MatchRules.DefaultFor(mission)`; kịch bản chỉ
đặt `timeLimit` và `dayNight` sao cho đồng hồ, bầu trời và văn bản bối cảnh nói cùng một điều
(«tới bình minh» = đêm dài đúng bằng giới hạn giờ).

## 5. Ý tưởng chế độ chơi 3/4 (chưa làm — xếp theo chi phí)

| Chế độ | Cốt lõi | Cần thêm gì |
|---|---|---|
| **Giữ cầu / phá cầu** (Holdout biến thể) | phe thủ có thể phá cầu (đã có), phe công phải sửa hoặc lội; thắng khi giữ tới giờ | AI job «phá cầu» cho phe công khi thua thế; job «sửa cầu» đã có qua `NeedsRepair` |
| **Săn trong cỏ** (FreeForAll biến thể) | sân toàn cỏ cao, tầm nhìn 3 đơn vị, tiếng bước chân là manh mối | recipe biome riêng + `AIHearingModule` bật mạnh hơn |
| **Lũ dâng** (Survival biến thể) | mỗi đợt sóng nước dâng thêm một dải: bến lội mất → đồi là đảo | `RiverCrossing` mở rộng thành mực nước theo đợt |
| **Đổi bờ** (TugOfWar trên sông) | tuyến đầu là bờ sông; đẩy được địch khỏi bờ bên kia là thắng | `MapFrontLine` đọc vị trí theo địa danh sông |
| **Đưa đò** (Escort biến thể) | xe là con đò, chỉ đi trên nước, hai phe tranh bến | `WaypointMover` dọc sông + ràng buộc vùng nước |
| **Đốt kho lương bên kia sông** (AssaultCamp biến thể) | trại địch bên kia sông; công thành phải qua cầu dưới tên | có sẵn (AssaultCamp + forceRiver); thiếu văn bản |
| **Đêm dài nhất** (ZombieHorde nhiều đêm) | 3 đêm liên tiếp, ngày là lúc sửa cầu · dựng ụ cát | `EscalationSettings` theo chu kỳ ngày/đêm |

Mỗi dòng đều **không cần MissionType mới** trừ «Đưa đò».

## 6. Việc còn nợ để AI *chủ động* dùng địa hình

- Bảng điểm mục tiêu của AI (`MapMissionAI`/`CommandNode`) cộng điểm cho mốc trên đồi và trừ cho
  mốc phải lội; hiện AI chỉ hưởng địa hình khi mốc đã nằm đúng chỗ.
- `AIStateAmbush` chọn vạt cỏ cao gần tuyến địch làm chỗ nấp.
- Job phá cầu / giữ cầu theo `CommandNode` (xem `Command.md`).
- Tìm đường 2D vẫn không cần — chưa có collider chắn nào ngoài công trình.

## 7. Cách đo

- Xem trước bố cục: `.claude/skills/stickman-assets/scripts/ground_field_preview.py` (mood `ben_do`).
- Smoke play-mode từng map: `StickmanMapSmokeTest.RunPlayBatch -smokeFilter <key>` trong bản clone
  (bộ lọc là phép VÀ giữa các từ; mỗi map một lượt).
- Doctor › *Sân mặt đất*: map có tên phải đúng biome · `forceRiver` · nhiệm vụ, nếu không sông không mọc.
