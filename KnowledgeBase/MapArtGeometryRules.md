# Hợp đồng art công trình ↔ hình học map

Tài liệu này là quy tắc làm art để hình vẽ khớp với map do code sinh ra. Gameplay không đọc
silhouette của ảnh: collider, `WalkableTopY`, `StickmanStairs` và `PlatformEffector2D` mới là
nguồn sự thật. Art phải bám các mốc đó, không được sửa collider chỉ để che một hình vẽ lệch.

## Nguồn sự thật

| Phần | Nguồn duy nhất | Dùng cho |
|---|---|---|
| Số bậc, độ cao, quãng ngang, độ chồng vào tường | `Assets/Scripts/Map/Build/MapBuildRules.cs` | `MapCastle`, `MapScenery`, `StickmanFortBuilder` |
| Collider, mặt đất, sàn đứng | `MapCastle` + `Fortification` + `StickmanStairs` | gameplay và AI |
| Gắn sprite, pivot, scale bù cha | `Assets/Scripts/Combat/Structures/StructureSkin.cs` | Wall/Tower/Gate/House |
| Tỷ lệ sàn riêng từng nền văn minh | `CivilizationDefinition.towerWalkableRatio` | Tower |
| Cắt PNG và gắn vào asset văn minh | `StickmanBuildingArt` | `Civ_<Key>.asset` |

Không gõ lại các số này trong prompt vẽ, builder mới hoặc scene YAML. Nếu cần đổi hình học,
đổi `MapBuildRules` trước rồi dựng lại các asset/scene liên quan.

## Chuẩn tấm ảnh

- PNG nền trong suốt, cắt theo đảo pixel đặc; không để padding trong suốt ở bốn góc.
- Mỗi công trình có baseline rõ, pivot **đáy giữa**, PPU 100. Chân ảnh là chỗ đặt xuống
  `GroundY`, không phải tâm canvas.
- Tỷ lệ canvas của một tấm thay thế phải khớp tỷ lệ ô lắp ghép trong sai số
  `MapBuildRules.StructureSocketAspectTolerance = 0.08`. Nếu không khớp, builder dùng bản
  art chuẩn đã hiệu chuẩn; runtime vẫn ép bounds theo footprint khai báo để scene cũ không
  làm lệch mối nối.
- Sheet có thể chứa `Wall / Tower / Gate / House` theo hàng ngang, nhưng mỗi đảo phải cắt
  khít. Không chia bốn ô đều vì chiều rộng bốn công trình khác nhau.
- Art nhìn ngang, không dùng phối cảnh 3D làm thay đổi vị trí chân hoặc mặt sàn. Phần mái,
  răng cưa, tay vịn được phép nhô lên; phần dùng để đứng phải nằm đúng mốc gameplay.

## Các mối nối bắt buộc

### Tường thành

Mặt đi được của tường nằm ở `groundTop + height`. Tấm art mặc định có mặt này ở `246/320`
chiều cao ảnh, nên code dùng:

```text
artHeight = wallHeight / WallArtWalkableRatio
artWidth  = artHeight * WallArtAspect
```

Mỗi khúc tường dài dùng đúng `artWidth`; ghép nhiều khúc để giữ lỗ châu mai không bị kéo
dài. Khi `StructureSkin` kéo art tường vừa footprint, hình không được thò sang vùng mà
collider không chắn.

### Cầu thang ↔ tường / bục

- `steps = StepsFor(height)` và `rise = height / steps`; mỗi bậc không vượt `MaxStepRise`.
- `StepRun` là quãng ngang của một bậc. Chân, đầu cao và span đều phải suy từ cùng công thức.
- Đầu cao của thang kết thúc đúng mặt tường/bục và chồng vào mép tường một khoảng
  `StairWallOverlap`; không để khe pixel hay khe collider ở mối nối.
- Art cầu thang mặc định có phần mặt bậc ở `206/260`, vì vậy:

```text
artHeight = rise / StairArtWalkableRatio
artWidth  = steps * StepRun
```

  Art phải phủ hết span từ chân tới mép nối. Đổi hướng dùng flip, không vẽ một bản thứ hai có
  hình học khác.

### Cổng thành

Cổng là chốt gameplay có footprint thật. Bề rộng tối thiểu được suy từ `GateArtAspect` của
ảnh (mặc định `380/380 = 1`), không ép ảnh vuông vào một khe hẹp. Chân cổng cùng `groundTop`
với tường kề; trụ cổng nằm trong collider cổng.

Cổng đóng hiển thị art `Gate` tĩnh. Khi là `VillageGate` mở, phải ẩn art cổng đóng và chỉ
hiển thị hai cánh động; khi đóng lại mới hiện art tĩnh. Không để vòm/trụ của art tĩnh chồng
lên lá cửa động.

### Tháp canh

Thân tháp có sàn một chiều dày `TowerPlatformThickness`; `WalkableTopY` là mặt trên sàn,
không phải đáy sàn. Thang cao tới `height + TowerPlatformThickness + TowerLadderOverrun`
để nhân vật có vùng nhả an toàn.

Ảnh tháp được scale từ tỷ lệ ban công:

```text
artHeight = (towerHeight + TowerPlatformThickness) / towerWalkableRatio
```

`towerWalkableRatio` hợp lệ trong `0.45..0.90`, mặc định `344/470`. Đỉnh tháp phải để hở
cho `GarrisonPost`; không vẽ mái chóp kín lên vị trí lính đứng. Lan can phía trước là lớp
foreground để che thân lính nhưng đầu/vũ khí vẫn lộ; thân tháp và art nền không được đưa hết
lên foreground.

Sheet công trình có nền caro trắng bị bake kín sau lan can/xà gỗ phải được làm sạch alpha
trước khi cắt sprite. Flood-fill từ mép ảnh không bắt được các vùng kín này; dùng nút
`Sửa nền caro trắng trong tháp Mongol` trên Bảng điều khiển để sửa cả `Tower.png` và sheet
`Art_Incoming`, tránh tái tạo nền trắng khi cắt lại.

### Nhà và công trình phụ

Nhà giữ tỉ lệ gốc, neo đáy giữa và không được phình vượt giới hạn footprint của
`StructureSkin`. Vật trang trí quanh nhà không có collider. Nếu một công trình được thiết kế
để chặn đường, nó phải là `Fortification` thật hoặc có `StickmanStairs`/lối qua theo
`MapBuildRules`.

### Sân mặt đất 3/4

- `Y` là chiều sâu: vật đứng ở Y nhỏ vẽ đè vật đứng ở Y lớn. Deco động phải ở sorting layer
  `character` để so được với `StickmanSortingGroup`; chỉ vật tiền cảnh cố ý che nhân vật mới
  ở layer `foreground`.
- Bố cục sinh theo vùng, không rải đều: đường cái và tim đội hình phải trống vật cao; cây/lều
  nằm ở dải xa, dải gần chỉ dùng hoa/đá/gốc thấp. Các số giữ trong
  `MapBuildRules.GroundBattleLaneHalfDepth` và `GroundRoadClearance`.
- Đường và ụ che dùng cùng một tuyến cong theo seed. Ụ che là `Fortification` có collider
  thật và art `Sandbag`; nó chặn đạn, cho hai phe đi xuyên, không gắn `MapObjective`. Không
  dùng `BoxCollider2D` lên cây/lều/đá để giả làm vật cản.

## Quy trình sau khi vẽ

1. Đặt sheet vào `Assets/Art_Incoming/`, chạy tool cắt/gắn công trình văn minh.
2. Mở `Tools > Stickman > ★ Bảng điều khiển` → `Thể loại & Map`.
3. Chạy theo thứ tự: công trình văn minh → `Cổng + tháp vào scene gameplay Trung cổ` → map
   showcase nếu cần xem bốn vai trò cạnh nhau.
4. Bấm `Kiểm tra khớp art ↔ hình học map (scene đang mở)`. Phải xử lý mọi cảnh báo về chân
   ảnh, footprint, tỷ lệ sàn tháp, span cầu thang và lối qua trước khi giao map.

Khi đổi công thức hoặc field dữ liệu, bảng điều khiển phải báo job art/asset/scene thiếu hoặc
cũ. Không coi câu “nhớ bấm tool” trong chat là trạng thái hoàn thành.
