# ĐUA — trục LỰC ĐẨY và kiểu chơi `MissionType.Race` (2026-09-15)

Ý tưởng, bảng so sánh và 12 game mọc ra từ trục này: [Roadmap-RaceWave.md](../KnowledgeBase/Roadmap-RaceWave.md).
File này chỉ ghi **luật phải giữ**.

## 1. ĐUA LÀ MỘT TRỤC, KHÔNG PHẢI MỘT MODE

⚠⚠ **Cấm viết `HorseRaceMode` rồi `CarRaceMode`.** Một cuộc đua = ba thứ dữ liệu, không thứ nào
là code mới:

| Thứ | File | Nó trả lời |
|---|---|---|
| `RacerSpec` (26 dòng, 4 thể loại) | `Assets/Scripts/Core/Run/RacerSpec.cs` | *chạy bằng gì* |
| `RaceTrack` + `RaceGate` | `Assets/Scripts/Gameplay/Race/` | *đường đi đâu* |
| `RaceRules` | `Assets/Scripts/Core/Run/RaceRules.cs` | *thắng thế nào* |
| `Racer` | `Assets/Scripts/Gameplay/Race/Racer.cs` | một tay đua: lắp lực đẩy · đếm cổng · chỉ đường cho AI · gỡ ván treo |
| `RaceMode` | `Assets/Scripts/Gameplay/Race/RaceMode.cs` | trọng tài: đếm ngược · xếp hạng · kết cục |

Hai cái túi đựng asset, cố ý tách khỏi luật:

| Thứ | Nó giữ | Vì sao tách |
|---|---|---|
| `RaceLineup` (component trong scene) | `MountDefinition[]` do bộ dựng scene rót | scene dựng tay có bước build để rót asset |
| `RaceLibrary` (asset `Resources/RaceLibrary.asset`) | cùng thứ đó, cho map SINH LÚC CHẠY | map của xưởng map không có bước build nào; vật cưỡi nằm ngoài `Resources/` nên `Resources.Load` theo tên không tới |
| `MapRace` (component trên map) | đường đua + luật + phe người chơi | đoàn đua dựng ở pha 6, **người chơi mới có ở pha 11** — `AttachReferee` gắn trọng tài VÀ đưa người chơi vào cuộc đua |

⚠ `RaceLineup.ResolveMount` là **cửa duy nhất** tra vật cưỡi (scene trước, kho chung sau). Hai
đường tra ở hai nơi thì một ngày map dựng tay có ngựa còn map sinh ra thì không, mà không lỗi
nào báo.

⚠⚠ `MapRace.AttachReferee` có HAI vế; vế thứ hai dễ quên: không gắn `Racer` cho người chơi thì
ván vẫn chạy đẹp (AI vẫn phi, HUD vẫn hiện) — chỉ là **người chơi không có trong cuộc đua**.

Trọng tài (`RaceMode`) dùng chung cho mọi kiểu đua. Thêm kiểu đua mới = thêm MỘT DÒNG `RacerSpec`
(và, nếu cần, một đường đua). Thêm một `MatchModeBase` nữa là CỘNG game — xem `GameFactory.md`.

## 2. TỐC ĐỘ KHÔNG NẰM TRONG BẢNG ĐUA

⚠⚠ `RacerSpec` **không có ô tốc độ**, và đó là chủ ý. Con ngựa nhanh bao nhiêu là việc của
`MountDefinition.speedMultiplier` (voi 1.05 … báo 1.95); chiếc xe là `VehicleSpec.speed`
(tăng 2.9 … jeep 6.5). Chép số sang bảng đua là hai nguồn sự thật cho một con số: sửa bảng cân
bằng ngựa xong thì cuộc đua vẫn chạy bằng số cũ, **không lỗi nào báo**.

Chỗ duy nhất được vặn là `trim` (0.85 … 1.15) và `handling` / `stamina` — hai thứ mà asset gốc
không có.

⚠ **Ô tốc độ riêng:** cuộc đua ghi vào `StickmanLocomotion.SetRaceTrim`, **không** vào
`SetSpeedMultiplier` (ô của `StickmanMount`). Dùng chung ô là con ngựa mất chênh lệch giống —
đúng bẫy *"mặc giáp xong thì con ngựa hết nhanh"* mà cả họ ô tốc độ sinh ra để tránh.

⚠ **Xe:** tay đua máy lái bằng `Vehicle.SetRaceThrottle` (ghi MỖI FRAME, lệnh sống 0.25 giây).
KHÔNG dùng `SetCivilianCruise`: chế độ xe phố có vế **phanh khi có người phía trước** — trên
đường đua nó nghĩa là cả đoàn xe nối đuôi nhau và không ai vượt được ai.

## 3. BA CÁCH KẾT THÚC — THIẾU CÁI NÀO CŨNG LÀ VÁN TREO

1. có người về đích → xếp theo thứ tự về;
2. không còn ai đang chạy → chấm theo quãng đường;
3. **hết giờ → cũng chấm theo quãng đường, KHÔNG hoà.**

⚠ `MatchRules.DefaultFor` trả **danh sách rỗng** cho `Race` (cùng khuôn `ChampionshipCup` ·
`OpenWorldCity`). Thêm một vế `Wipe` cho đỡ trống là ván tự kết thúc khi một tay đua ngã.

⚠ `MissionInfo.NeedsClock(Race)` = **false**, dù cuộc đua có giới hạn giờ: đồng hồ nằm trong
`RaceRules.timeLimit` và do `RaceMode` chấm. Bật thêm đồng hồ của `MatchDirector` là hai trọng
tài tuyên bố hai kết quả.

⚠ `RaceRules.stuckReset` (mặc định 6 giây) là vế chống treo thứ tư: rơi hố / lật xe / kẹt giữa
hai vật cản thì `Racer` đưa về cổng vừa qua. Đặt 0 chỉ khi đường đua phẳng tuyệt đối.

## 4. AI TAY ĐUA

`AIBehavior.Race` → `AIStateRace`. **Không** dùng lại `AIStateTravel`: người đi đường *đứng lại
đợi* khi bị chắn, tay đua đứng lại là mất hạng.

⚠⚠ Tay đua PHẢI khai `SetKeepsOwnOrders(true)` (`Racer.Setup` làm việc đó). Thiếu nó thì
`CommandNode.ApplyToAgent` / `MatchModeBase.ApplyOrders` ghi đè hành vi ở nhịp sau và **cả đoàn
đua bỏ đường chạy ra giữa sân đánh nhau**. Map đua cũng xoá tướng của cả hai phe
(`MapBlueprint.Apply`) để không ai ngồi đó ra lệnh.

⚠ Mốc của tay đua là **cổng kế tiếp của chính người đó**, `Racer` ghi thẳng vào
`StickmanAgent.Objective` MỖI NHỊP (không chỉ lúc qua cổng: một cú choáng gọi `SetBehavior` là
mốc bị xoá và tay đua đứng im tới hết ván).

## 5. HÌNH DẠNG ĐƯỜNG ĐUA DO MẶT PHẲNG QUYẾT ĐỊNH

| | sân ngang `ViewPlane.Side` | sân 3/4 `ViewPlane.Ground` |
|---|---|---|
| Hình | tuyến A→B, một lượt | **vòng kín**, 3 vòng |
| Làn | không có (lách = nhảy) | độ lệch theo CHIỀU SÂU |

⚠ Không mở núm «số vòng» cho map sân ngang: một vòng trên một trục duy nhất là chạy tới rồi
chạy ngược lại — nửa cuộc đua đi ngược chiều cả đoàn.

⚠ Map đua **không được có vực, thang, bục** (`MapBlueprint.Validate` chặn): rơi xuống hố trên
đường đua không giết ai, nó chỉ tạo ra một ván treo nhỏ. Nửa rộng ≥ 55.

## 6. HAI PHÉP ĐO PHẢI CHẠY KHI ĐỔI BẢNG SỐ

| Đo | Ngưỡng | Vì sao |
|---|---|---|
| Chênh lệch tốc độ CẢ BẢNG asset | 1.6× – 2.2× | mỗi giống phải có tính cách |
| Chênh lệch trong MỘT sân đua | **≤ 1.4×** | rộng hơn thì người chót về sau người nhất >7 giây, hết nửa đường không còn ai trong khung hình |
| Trần giờ | ≈ 3× thời gian người thắng | 150 giây cho một cuộc đua 23 giây là một cái đồng hồ không bao giờ có nghĩa |

Cách đo và số đã đo: [Roadmap-RaceWave.md](../KnowledgeBase/Roadmap-RaceWave.md) mục 5.

## 7. NƠI PHẢI NỐI KHI THÊM THỨ MỚI

- thêm giống vật cưỡi → bấm lại «Đua > 0. Kho vật cưỡi» (map sinh lúc chạy đọc
  `Resources/RaceLibrary.asset`; thiếu nó thì mọi map đua thành đua CHẠY BỘ mà không báo gì);
- thêm màn đua dựng tay → `StickmanRaceBuilder` + một dòng trong `StickmanToolCenter`;
- thêm `MissionType` → 13 chỗ, xem [MapMissions.md](MapMissions.md); phép đo là
  «Soát chuỗi điểm nối của kiểu chơi» + Doctor «kiểu chơi chưa có bảng phân cảnh».
