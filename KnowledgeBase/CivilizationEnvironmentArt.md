# Art bối cảnh theo nền văn minh

## Mục tiêu

Giữ chung rig, gameplay và tỉ lệ map; thay đổi cảm giác của từng nền bằng ba lớp hình ảnh:

1. nền xa và địa hình;
2. vật trang trí không collider;
3. bộ công trình `Wall / Tower / Gate / House`.

Không nhuộm thân stickman. Silhouette, vật liệu và kiến trúc phải là dấu hiệu chính; màu chỉ là
lớp hỗ trợ.

## Bản định hướng hiện tại

- Board tổng quan 15 nền: `Assets/Art/Civilizations/Civilization_Environment_Overview.png`.
- Sheet công trình đã có: `Assets/Art_Incoming/DaiViet.png`, `Arab.png`, `Japan.png`, `China.png`,
  `India.png`, `Mongol.png`, `Byzantine.png`.
- Map kiểm thử cố định: `Assets/Settings/Maps/Map_Med_CivShowcase.asset` (Đại Việt công thành Nhật).

Quy tắc kích thước, pivot và các điểm nối art ↔ collider được tách riêng tại
[`MapArtGeometryRules.md`](MapArtGeometryRules.md). Đây là tài liệu nguồn cho việc vẽ lại
Wall/Tower/Gate/Stairs/House theo đúng map sinh và scene bake.

Thứ tự panel trong board là trái sang phải, trên xuống dưới:

`Europe, Crusader, Viking, Japan, China, Arab, DaiViet, India, Mongol, Byzantine, Ottoman, Persia, Rus, Pirate, Egypt`.

## Ngôn ngữ hình ảnh

| Nền | Kiến trúc / silhouette | Nền xa + trang trí | Vật liệu / bảng màu |
|---|---|---|---|
| Europe | thành đá, mái đỏ, tháp nhọn | đồi xanh, thùng, xe gỗ | đá xám, gỗ nâu, đỏ gạch |
| Crusader | thành đá sáng, cổng vòm, tháp vuông | trại hành quân, cờ hai màu | limestone, trắng, đỏ |
| Viking | nhà gỗ mái cỏ, palisade | bờ biển, thuyền, khiên gỗ | gỗ tối, rêu, xanh biển |
| Japan | cổng và mái cong, tháp nhiều tầng | tre, cầu gỗ, anh đào | sơn đỏ, chàm, gỗ tuyết tùng |
| China | thành gạch, mái ngói nhiều tầng | tre, đèn, sân nước | son đỏ, ngọc, ngói xanh |
| Arab | thành sa thạch, mái vòm, tháp mảnh | ốc đảo, lều, chum | vàng cát, xanh ngọc, đồng |
| DaiViet | thành gạch laterite, nhà gỗ nâng sàn, mái cong | tre, ruộng nước, chuối / sen | đỏ đất, xanh tre, son đỏ |
| India | cổng đá chạm khắc, tháp đền | cột đá, vải, cây nhiệt đới | sa thạch, teal, saffron |
| Mongol | trại felt, tháp gỗ, palisade thấp | thảo nguyên, xe, lều tròn | vàng cỏ, nâu da, xanh trời |
| Byzantine | mái vòm, tường đá sáng, khối cân xứng | cột, bình gốm, vườn | tím, vàng, marble |
| Ottoman | dome, minaret, cổng gạch | chợ vải, đèn, chum | kem, turquoise, đồng |
| Persia | iwan, gạch men xanh, tháp vuông | vườn, vòi nước, thảm | lapis, turquoise, vàng sa mạc |
| Rus | tường gỗ, mái onion dome, tháp gỗ | tuyết / rừng, xe, đống củi | xanh lạnh, gỗ đỏ nâu, vàng |
| Pirate | pháo đài gỗ, cầu cảng, tháp canh | cọc neo, thùng, dây thừng | gỗ bạc màu, xanh biển, cát |
| Egypt | mastaba / cổng đền, tháp sa mạc | cọ, tượng, chum nước | sa thạch, xanh lapis, vàng |

## Bộ code theo nền — khi chưa có sheet (2026-09-08)

Bảng "Ngôn ngữ hình ảnh" ở trên đã được đổi thành số trong
`StickmanBuildingArt.Civilizations.CivStyles`: nền nào chưa có sheet thật nhận bộ
Wall/Tower/Gate/House do code vẽ theo đúng dòng của nó (Viking palisade cọc nhọn + mái cỏ,
Arab sa thạch răng cưa bậc + vòm turquoise, Rus gỗ tròn + củ hành, Egypt pylon xiên + dải
lapis-vàng, Pirate ván bạc màu + tổ quạ, Mongol lều tròn…). Thả sheet vào `Art_Incoming` và cắt
là bộ code nhường chỗ — `Save` hỏi nhãn, không phải sửa gì. Muốn đổi bản sắc một nền thì sửa
MỘT dòng `Style(...)`, bấm «★ Vẽ LẠI TOÀN BỘ art code», nhìn
`Docs/ArtSheets/Buildings_Civilizations.png`.

## Quy ước sheet công trình

Sheet đưa vào `Assets/Art_Incoming/` phải có đúng bốn vật tách rời theo thứ tự:

`Wall → Tower → Gate → House`

Nền phải trong suốt, khoảng alpha giữa các vật đủ rộng để `StickmanBuildingArt.SliceSheet` tách
được bằng đảo pixel. Sau khi cắt, tool tự gắn sprite vào `Civ_<Key>.asset`.

## Kích thước dùng trên map

Collider vẫn là chuẩn gameplay; art chỉ được đặt lên trên và neo đáy giữa. Các footprint hiện
tại của map sinh là: nhà chính `2.2 × 2.6`, tháp phụ `1.1 × 3.2`, xe hàng `2.2 × 1.4`.
Tường và cổng kéo vừa khung chắn; nhà và tháp giữ tỉ lệ gốc nhưng mái/gờ mái chỉ được rộng tối
đa `1.75×` footprint để không lấn sang công trình kế bên.

Tường dùng mặt trên của collider làm lối đi thật và có cầu thang ở phía trong. Tháp dùng sàn
`PlatformEffector2D` một chiều để lính trèo xuyên từ dưới lên rồi đứng trên ban công. Nếu art
tháp có ban công cao/thấp khác nhau, chỉnh `towerWalkableRatio` trong `Civ_<Key>.asset` để
mặt sàn hình ảnh trùng mặt sàn gameplay. Builder còn sinh một `LanCanTruoc` riêng trên sorting
layer `foreground`: lan can che phần thân lính, nhưng thân tháp vẫn nằm sau nhân vật; không
đưa toàn bộ sprite tháp lên foreground.

## Pilot Đại Việt

`DaiViet.png` và `Japan.png` là hai bản showcase để kiểm tra scale, pivot đáy giữa, silhouette
và khả năng đọc trong gameplay. Nút tích hợp đã chạy cả cắt sheet, nối asset nền văn minh và dựng lại
nền văn minh:

`Tools > Stickman > ★ Bảng điều khiển > Thể loại & Map > Công trình văn minh — cắt, gắn & tích hợp vào game`

Sau đó mở scene có thành luỹ để kiểm tra: cổng vẫn đi xuyên được, tháp vẫn có sàn garrison,
tường vẫn dùng collider của `Fortification`, còn art chỉ là lớp `StructureSkin`.
