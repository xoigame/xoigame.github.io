### ⚠⚠ BA NHIỆM VỤ MỚI CỦA HỆ MAP — CƯỚP CỜ · KÉO CO · CƯỚP LÀNG (2026-09-05)

User: *"xưởng map đang thiếu xây map cho nhiều chế độ chơi; map phải hợp gameplay, AI di chuyển
đúng nội dung, có đủ điều kiện thắng thua và thử thách"*. Hệ map (Xưởng map · sân `Demo_29..31` ·
map bake) nay có **10 kiểu nhiệm vụ**; ba kiểu mới KHÔNG mượn trọng tài của scene dựng tay
(`CaptureTheFlag` · `TugOfWarLine` · `VillageRaid` là `MatchModeBase` — hai trọng tài chạy song
song là §4b-bis), mà đi đúng đường của hệ map: `MatchDirector` chấm, cây chỉ huy lái bằng CỘT MỐC.

| Nhiệm vụ | Cơ chế (Map) | Vế thắng (`MatchGoal`) | AI biết chơi nhờ |
|---|---|---|---|
| `CaptureFlag` cướp cờ | `MapFlag` — nhặt (khoảng cách 2 chiều) · đi theo người vác · +1 điểm/giây · rơi khi người vác ngã (khoá 0.9 s) · nằm 22 s không ai nhặt thì về chỗ cắm | `FlagScore` ≥ `captureScoreToWin` cho cả hai phe; hết giờ so điểm | cả hai phe lấy CHÍNH LÁ CỜ làm mốc địch (`attackTargetA = attackTargetB = cờ`) + `SuggestTarget` người vác cho địch quanh 20 |
| `TugOfWar` kéo co | `MapFrontLine` — trôi về phía phe ÍT quân hơn trong bán kính 7 (0.35/người, trần 2.2), cột mốc leo theo thềm | `PushLine` chạm trại địch; hết giờ theo VỊ TRÍ TUYẾN (không hoà) | cả hai phe lấy TUYẾN làm mốc địch — đông hơn ở tuyến là đẩy được |
| `RaidVillage` cướp làng | `BuildCamp` (đình + thành luỹ có CỔNG) + dãy nhà dân vai **`MapObjectiveRole.House`** sau đình + `MapVillage` (mốc = nóc nhà còn sống gần phía cướp nhất) | `RazeCount` ≥ `housesToBurn` cho cướp; `SurviveTime` + `Wipe` cho làng | cướp: `attackerBreaksStructures` + mốc trôi sang nhà kế; làng: `DefendObjective` |

⚠⚠ **HẾT GIỜ PHẢI CÓ VERDICT — `MatchDirector.TryTimeoutVerdict`.** Trước đây đồng hồ chỉ có
nghĩa qua vế `SurviveTime`; nhiệm vụ có giờ mà không có vế đó thì hết giờ **không có gì xảy ra** và
trận chạy mãi. Nay hết giờ (không có vế `SurviveTime`) thì so điểm cờ / vị trí tuyến / điểm chiếm,
rồi quân số còn sống, rồi phe chủ nhà — kéo co và cướp cờ **không có hoà** (§7b tầng game).
⚠ **THÊM MỘT KIỂU NHIỆM VỤ = 13 CHỖ, KHÔNG PHẢI 3** (câu "đúng 3 chỗ" trong `MapSystem.md` §4
là số của ngày đầu): `MissionType` · `MissionInfo` (tên · lời dẫn · `NeedsClock` · `PlayerAttacks`) ·
`MatchRules.DefaultFor` · `MatchDirector.IsMet/ProgressText` · `MissionPlan.For/ForScene` ·
`MapMissionAI.Decide` · `MapBlueprint.For/Validate` · `MapGenerator.BuildSettings/Sanitize` ·
`MapKitPlanner.FixedLots/Wishlist` · `MapCastle.DefaultFor` · `MapAssembler.BuildMission/
ResolveTargetsFromScene` · ba bảng `Missions` (`MapStudio` · `StickmanMapMaker` ·
`StickmanGenreMissionCatalogBuilder` + `CoveredByScene`) · `StickmanMapSystemBuilder.Blueprints/
SettingsFor/EscalationFor`. Sót chỗ nào là kiểu chơi đó hỏng câm ở đúng chỗ đó (không map mẫu ·
không lô · không mốc cho AI · không entry F1).
⚠ **XƯỞNG MAP IN LUẬT THẮNG** (`MapStudio.DrawWinRules`): núm theo nhiệm vụ (giờ trận · điểm ·
số nóc nhà · máu nhà · sóng viện binh) rồi in ĐÚNG danh sách vế `ResolveRules()` mà trọng tài sẽ
chấm. Map không có kết cục đọc được thì không có ván sau.
⚠ Medieval của ba kiểu này khai `CoveredByScene` (`Demo_23_CTF` · `Demo_24_TugOfWar` ·
`Demo_26_Raid`) nên F1 không có dòng bản-map trùng; Modern/Fantasy có (9 map mẫu mới ở
`Blueprints`). **Phải bấm lại «Hệ thống map»** (mục đã VÀNG: `StickmanMapSystemBuilder.cs` đổi) và
«Catalog thể loại».

### ⚠⚠ HAI KIỂU CHƠI CHƯA CÓ AI ĐÚNG VIỆC — CƯỚP CỜ · CHIẾM ĐIỂM (2026-09-07)

User: *"ai cướp được cờ sẽ ưu tiên chạy né địch để tránh bị giết mất cờ; chế độ chiếm cứ điểm
AI sẽ cố gắng chiếm các cứ điểm khác và bảo vệ nó"*. Cả hai đều hỏng TRONG IM LẶNG — mọi hệ
chạy đúng phần việc của nó, chỉ là không ai trả lời câu hỏi của KIỂU CHƠI.

| Kiểu chơi | Trước đây (câm) | Nay |
|---|---|---|
| `CaptureFlag` | Người vác cờ vẫn là lính thường, mà chính lá cờ chỉ mặt anh ta cho cả phe địch quanh 20 → đứng lại đọ sức với đúng cái vòng vây mode vừa gọi tới; cờ đổi tay ngay tại chỗ nó rơi | `MapFlag.PickUp` / `CaptureTheFlag.TakeFlag` gọi `StickmanAgent.BeginCarryingPrize` → hành vi `CarryPrize` (chạy về sân nhà, né địch, bị dí lâu mới đánh trả). Trả lệnh cũ ở `Drop`/`ReturnHome`. Xem [AI.md](AI.md) |
| `CapturePoints` | Mốc tuyến là *"vùng gần nhất CHƯA thuộc về mình"*, nên chiếm xong điểm 1 là **cả phe bỏ đi** và địch quay lại lấy không gặp ai; hơn `_scoreLeadToHold` điểm thì `CampaignIntent.Hold` **đóng băng cả phe giữa sân** (`SetHoldingLine`), không giữ gì cả | `ZoneGarrisonDuty` (mỗi phe một tổ, dựng trong `MapAssembler.BuildCaptureZones`) rút một phần quân bám đúng vòng vừa lấy được; `MapMissionAI.ContestPoints` bỏ hẳn `Hold` — còn điểm mở chưa lấy thì `Press`, cầm hết rồi mới `Fallback` |

⚠ **`ZoneGarrisonDuty` phải có TRẦN** (`_maxShare` 0.45, `_perZone` 2). Luật thắng vẫn là ĐUA
ĐIỂM: cả phe ngồi ôm mấy cái vòng tròn là ngồi chờ thua bằng một kiểu khác. Người trong tổ khai
`KeepsOwnOrders` (nếu không thì `CommandNode.ApplyToAgent` kéo họ ra tuyến ngay nhịp sau), và
tổ tự thả người khi điểm đó rơi vào tay địch.
⚠ **`ContestPoints` đếm điểm còn lấy được bằng `IsOpenFor`**, không đếm trần: map có thể khoá
điểm sau (`CapturePoint._requires`, tuyến đẩy A → B → C), và đếm cả điểm đang khoá là cả cánh
quân hành quân tới một cái vòng đứng bao lâu cũng không chiếm được.
⚠ **SCENE BAKE TỰ LÀNH.** `MapAssembler.ResolveTargetsFromScene` nay dựng tổ giữ điểm cho map
chiếm điểm đã bake, và khai lại hai căn cứ cho `MapFlag` (`SetSafeSpots` — mấy trường của lá cờ
là `private` KHÔNG `[SerializeField]` nên map bake không nhớ gì cả). Không có hai vế này thì map
cũ chơi y như trước mà không có lỗi nào báo, và người dùng phải bake lại — thứ LUẬT VÀNG cấm.
