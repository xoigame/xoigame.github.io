# LÀM TRÙM — đảo vai, và cơ chế NHẬP THÂN (2026-09-16)

Code: `Assets/Scripts/Gameplay/Modes/BossRampageMode.cs` ·
`Assets/Scripts/Gameplay/Shell/PlayerPossession.cs`. Màn: `Demo_79_Rampage`.

## 1. `PlayerPossession` — ba việc, thiếu cái nào cũng ra một loại hỏng khác

Khoảng cách giữa "một con quái do máy điều khiển" và "một con quái do NGƯỜI điều khiển" đúng
bằng **hai cái công tắc**: `StickmanFighterController` tự đọc bàn phím khi `UseMoveInput` bật,
còn NPC tắt cờ đó và để `StickmanAgent` lái.

| Việc | Thiếu thì |
|---|---|
| **TẮT NÃO CŨ** (`StickmanAgent` + bộ lái riêng như `FantasyDragonBoss`) | hai chủ cùng ghi vận tốc ⇒ nhân vật rung và tự bỏ chạy khỏi tay người chơi |
| **DỜI NHÃN** `PlayerCharacter` | HUD · hồi sinh · `PlayerCharacter.Current` vẫn trỏ vào thân cũ đứng chôn chân ở góc map |
| **DỜI MÁY QUAY** (`DemoCameraFollow.SetTarget`) | người chơi điều khiển một thứ nằm ngoài khung hình |

⚠ Thân cũ **không bị huỷ** — nó chỉ thôi làm người chơi. Huỷ đi thì mọi hệ đang cầm tham chiếu
tới nó (mốc nhiệm vụ, sổ quân, camera) phải xử lý một object chết giữa chừng, mà chẳng để làm gì.

Dùng được cho mọi thứ khác: làm một con thú, đổi thân giữa trận, xem-rồi-nhảy-vào.

## 2. Đảo vai là một kiểu chơi, không phải một cái skin

`MissionType.DragonHunt` đã có sẵn con rồng ba pha và đạo quân đi săn. Mode này dùng **đúng
chúng**, đổi ai cầm — và mọi câu hỏi lật ngược: *"tránh vệt lửa thế nào"* → *"quét vệt lửa vào
đâu"*; *"sợ pha bổ nhào"* → *"lúc nào đáng bổ nhào"*.

## 3. Hai vế chặn «bấm để thắng»

Trùm mạnh gấp mấy chục lần một người lính. Nếu phần thưởng là "giết nhiều" thì người chơi đứng
một chỗ quạt cánh tới hết giờ.

1. **Chỉ tiêu là CÔNG TRÌNH, không phải mạng người.** Nhà rải khắp map ⇒ trùm phải DI CHUYỂN,
   và đường đi mới là chỗ quân bắn được nó.
2. **CUNG chỉ với tới khi trùm Ở TRÊN KHÔNG; GIÁO chỉ với tới khi nó XUỐNG ĐẤT.** Không có vế
   này thì độ cao là một lựa chọn không có giá và cả hệ bay (`FantasyAirRaider`) thành trang trí.

⚠ Chỉ tiêu **không được lớn hơn số nhà có thật**: người chơi phá sạch bản đồ mà vẫn thua vì
thiếu một cái nhà không tồn tại. `BossRampageMode.Start` tự hạ chỉ tiêu và kêu một dòng cảnh báo.

⚠ Quân đồn trú **bám nhà** (`GuardTarget`/`FreeRoam` quanh làng), KHÔNG đuổi tự do: đuổi tự do
thì cả 14 người thành một cái đuôi dài sau lưng trùm và ngôi làng trống trơn cho đốt thong thả.

## 4. KHÔNG bake con quái vào scene

Bộ khoác áo fantasy (`FantasyCreatureLook` · `FantasyRaceMotion` · `FantasyRaceTactics` ·
`FantasyRaceCatalog.ApplyAffinity` · `FantasyAirRaider.SetupFromRace`) là các cửa **chạy lúc
chơi** — đúng đường `MapDragonHunt` đã đi. Gắn tay ở bộ dựng scene thì con rồng ra một stickman
**đen trơn** và không lỗi nào báo ([Fantasy.md](Fantasy.md) mục 1).

⚠⚠ **MIỄN LỬA là bắt buộc**: trùm đứng trong chính vệt lửa nó phun. Thiếu `ApplyAffinity` là nó
tự thiêu mình và ván kết thúc khi người chơi chưa bấm gì.
