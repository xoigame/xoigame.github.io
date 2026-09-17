# Battle Royale — quy trình, bảng số, cân bằng, đặt art

Luật bắt buộc nằm ở [Docs/AgentRules/BattleRoyale.md](../AgentRules/BattleRoyale.md). File này là
phần TRA SÂU: dựng thế nào, số nào đo được, cân bằng bằng gì, sửa khi "chơi thấy sai", đặt art.

## 1. Dựng và chơi

1. `★ Bảng điều khiển` › **★ Battle Royale — 3 sân** (= `Maps > 7`). Nút tự làm bốn việc: vẽ bù
   art (`Prop_Parachute · Prop_Bomber · Prop_Medkit · Prop_Potion · Prop_SupplyCrate`) → dựng lại
   kho map (nạp `MapLibrary.lootWeapons` + hình, sinh 6 map mẫu + 3 công thức royale) → dựng
   `Demo_56_RoyaleMedieval`, `Demo_57_RoyaleModern`, `Demo_58_RoyaleFantasy` → dựng lại vỏ game
   (menu chính lấy màn từ cùng một catalog).
2. Play. Cả sân lên **một chuyến mở màn — mỗi thời kỳ một phương tiện, cả ba đều BAY**: trung
   cổ là **khinh khí cầu**, hiện đại là **máy bay vận tải**, fantasy là **đại bàng khổng lồ**.
   Bấm **NHẢY** (Space, hoặc nút NHẢY) để rời phương tiện rồi **rơi dù ~7.6 giây**, **A·D** lái
   dù trong lúc rơi. Chạm đất: **E** nhặt vũ khí, chạy qua là nhặt nón/giáp/thuốc, **H** (hoặc
   nút THUỐC) dùng thuốc sớm. Vạch màu dưới món đồ = cấp của nó. Cột sáng cam = **khu đồ dày**.
3. Dải xanh hai bên là NGOÀI VÒNG; vạch trắng là vòng KẾ; HUD có **la bàn** chỉ chạy về bên nào.
4. **F5** = map mới cùng kiểu. Nút *«Ván sau: ĐƠN / TỔ 4»* đổi cỡ tổ cho map random kế. Nút
   *«Xem bot đấu»* dựng lại ván ở vai `Observer` — đây là bài test tự động, xem mục 4.

## 2. Bảng số (hằng trong code — đổi thì KHÔNG cần dựng lại scene)

| Việc | Số | Vì sao |
|---|---|---|
| Chuyến mở màn | cao độ đất + 13; tốc độ 11 (máy bay · đại bàng) hoặc 8.5 (khinh khí cầu trôi, không động cơ); chiều bốc theo seed | map nửa 40 ⇒ 8–11 s: đủ để chọn chỗ, không đủ để ai đó vét hết một khu |
| Rơi dù | 1.7 world/s, lái ngang 2.4 | ~7.6 s treo dù; lái đủ để đổi ý một lần, không đủ để bay ngang map |
| Đồ rải mở màn (chỉnh **bốn lần**) | vũ khí = **0.26** × nửa map · giáp **0.07** × · thuốc **0.11** × (sàn 8/2/3) | map nửa 46 ⇒ 12 cây / 3 giáp / 5 thuốc; cộng hai khu dày (14 cây) ra **~26 cây cho ~20 người**. Bốn mốc: 1.00/0.35/0.45 → *"nhiều quá"* → 0.28/0.10/0.15 → *"ít hơn nữa"* → 0.15/0.055/0.085 → *"quá ít vũ khí"* → mốc hiện tại. **"Ít trang bị" và "đủ vũ khí" là HAI TRỤC**: giáp cắt sâu (còn 1/5), vũ khí giữ hào phóng. |
| Khu đồ dày | 2 khu (3 khi nửa map ≥ 44), cách nhau ≥ 55% nửa map | ba khu trên map vừa thì đồ tốt có ở khắp nơi, "liều mạng vào khu dày" hết là lựa chọn |
| Cấp vũ khí (thường) | 0: 50% · 1: 25% · 2: 14% · 3: 8% · 4: 3% | cấp ≥ 3 đòi tay nghề (`WeaponMastery.TierBonus`) nên đồ xịn là của khu dày và thùng |
| Cấp vũ khí (khu đồ dày) | 1: 20% · 2: 35% · 3: 30% · 4: 15%, **+7 cây · 3 giáp · 3 thuốc** rải thêm | đó là cái GIÁ phải trả để giàu nhanh — ~45% số tổ nhảy vào đây |
| Thùng tiếp tế | 35 s đầu, rồi mỗi 45 s, rơi vào VÒNG KẾ; mở: 2 vũ khí cấp 3/4/5 (35/40/25%) + giáp 4–5 + 2 thuốc (+ giỏ đạn) | rơi vào vòng kế = ai cũng sắp phải tới đó |
| Vòng bo 6 pha (chờ · thu · còn lại · **% máu/giây** ngoài vòng) | 28·22·60% ·3% → 20·18·38% ·5% → 16·15·22% ·7.5% → 14·12·12% ·11% → 12·10·5% ·16% → 10·8·0% ·25% | tổng ≈ 3 phút 5 s tới khi khép; sau khép tăng +10%/s. **Ghi bằng PHẦN TRĂM** vì lính có 2–3 máu còn người chơi có thể có 10 — số máu tuyệt đối làm vòng bo giết lính nhanh gấp 5 lần |
| Tầm săn của não tổ | 8 + 16 × tính khí, **× 0.35 trong 45 s đầu** | đầu ván là pha nhặt đồ; không thu tầm thì cả sân đánh nhau ngay khi chạm đất và vòng bo thành đồ trang trí |
| Thuốc | hồi max(3, 40% máu tối đa); túi 3 liều; tự dùng < 55% máu và yên 1.6 s | một luật cho người và máy |
| Gục chờ cứu (chỉ tổ) | nằm 14 s · đỡ dậy 3 s · 2 lần/ván · `rescueRadius` 8 | dài hơn mặc định vì map rộng; bán kính hẹp để lính không bỏ tuyến chạy nửa map |
| Não tổ | 0.8 s/nhịp; ưu tiên khu đồ dày trong 45 s đầu (đếm từ lúc CHẠM ĐẤT, không phải từ lúc dựng map) | tổ nhát chỉ đánh kẻ tới gần, tổ hung đi tìm |
| ~~Xe (hiện đại)~~ | **ĐÃ GỠ 2026-09-08** | user: *"tạm thời bỏ phương tiện xe cộ ra khỏi battle royale"*. Xoá hẳn `SpawnVehicles` + kho xe trong tool, không để cờ tắt |

## 3. Cân bằng — đo bằng `royale.csv`

Mỗi ván kết thúc ghi một dòng vào thư mục của `MatchStats` (`royale.csv`, chỉ trong Editor) và
một dòng `[RoyaleStats]` ở Console:

```
thoi_diem;map;the_loai;seed;co_to;so_to;hang;so_mang;song_giay;pha_bo
```

Đọc bảng đó để chỉnh, đừng chỉnh theo cảm giác:

| Nhìn thấy | Nghĩa là | Chỉnh |
|---|---|---|
| `song_giay` thường < 60 | chết ngay lúc mới nhảy — đồ quá thưa hoặc khu dày quá đông | tăng hệ số vũ khí trong `ScatterLoot`, hoặc giảm tỉ lệ tổ nhắm khu dày (`BoardPlane`) |
| `pha_bo` thường ≥ 5 | ván kéo tới lúc vòng khép mới xong — thiếu giao tranh giữa ván | giảm `wait` các pha giữa, hoặc tăng `aggression` |
| `pha_bo` thường ≤ 1 mà `so_to` còn 1–2 | **cả sân chết trước khi vòng kịp thu** — vòng bo và tiếp tế thành đồ trang trí | giảm `Phase.burn` các pha đầu, hoặc giảm tầm săn đầu ván (`× 0.35`), hoặc bớt quân trong `Blueprints` |
| `hang` của người chơi luôn 1 | bot quá yếu | tăng `smartsLevel` ở blueprint, hoặc cho AI nhặt được cấp cao hơn |
| `so_mang` gần 0 mà `hang` cao | trốn được là thắng — vòng bo chưa ép | tăng `dps` các pha cuối |

## 4. Bài test tự động (bot đấu bot)

Nút **«Xem bot đấu»** trên HUD nạp lại sân ở vai `Observer` qua `MapArenaRequest` — không có
nhân vật người chơi, 20 bot chạy hết ván và **vẫn ghi `royale.csv`**. Bấm vài lần liên tiếp là
có một mẫu số liệu đủ để chỉnh. Đây là cách đo cân bằng rẻ nhất: mỗi ván ~4 phút, không cần
người, và đi qua đúng một đường dựng ván với lúc chơi thật (`MapArena.Start`).

⚠ Ván bot KHÔNG ghi hồ sơ người chơi (`SaveResult` chỉ chạy khi có tổ người chơi) — kỷ lục hạng
không bị bơm bởi mấy ván xem máy đánh nhau.

## 5. Hiệu năng

Một ván có ~20 nhân vật ragdoll + ~70 món đồ. Đồ **không tốn vật lý**: `DroppedItem.Settle` đổi
`bodyType` sang `Static` ngay khi chạm đất (trigger nhặt vẫn chạy). Cần đo thì bấm Doctor mục
«Giới hạn SFX và VFX đang chạy» và `Nâng cao > Rig & Kiểm tra > Chụp số liệu hiệu năng`.

## 6. Chơi thấy sai → sửa ở đâu

| Triệu chứng | Nguyên nhân thường gặp | Sửa |
|---|---|---|
| Ván kết thúc ngay giây thứ ba, "hoà" | `MatchDirector.HoldVerdict` không được bật (map tự xây, hoặc sửa `Begin`) | xem luật §Bẫy — cờ này phải bật suốt chuyến bay |
| Cả sân tay không tới hết ván | `MapLibrary.lootWeapons` rỗng | Doctor «Battle royale» đỏ → `Maps > 1` |
| Phương tiện mở màn / dù / thuốc / thùng vô hình | thiếu `Prop_Balloon` · `Prop_Bomber` · `Eagle_Body` · `Prop_Parachute` · `Prop_Medkit` · `Prop_Potion` · `Prop_SupplyCrate` | `★ Vẽ bù art còn thiếu` rồi `Maps > 1`; Doctor nói rõ thiếu tấm nào của thời kỳ nào |
| Nhảy xong đứng luôn trên đất, không có pha rơi | phương tiện đặt ở cao độ mặt đất, hoặc `ChuteArt` trả null | cả ba thời kỳ đều phải BAY (cao độ 13) và đều có dù — xem luật §Bẫy |
| Có thanh màu lơ lửng ngang bụng nhân vật | `LootTierMark` không được gỡ lúc trao vũ khí | `WeaponPickup.GiveTo` phải gọi `LootTierMark.Remove` |
| Lính không nhặt cây xịn | tay nghề: cấp AI 2 = tay nghề 3, cây cấp 3 lớp súng/nặng đòi 4 | tăng `smartsLevel` ở blueprint |
| Chỗ trú trên map | `MapBuildRules.ShelterDensity` = 1 cho battle royale | ~10 công trình vào-được mỗi map (một chỗ mỗi ~9 bước); `Wants` nhận 7 loại: nhà · lô cốt · điện · phế tích · ruộng · chợ · cối xay |
| Nhân vật XOAY tại chỗ | mốc ở điểm đối xứng của map vòng | `_wrapHeading` giữ hướng trong vùng lưỡng lự rộng 3 |
| Map "kẹt" ở mép | vòng bị tắt nhầm khi dựng map mới | `MapWrap` có chủ sở hữu; `MapWrapZone` tự bật lại |
| AI tay không đi lang thang | `NearestWeapon` chỉ quét bán kính 18 | quét cả vòng an toàn, hết thì ra khu đồ dày |
| Tổ AI đi qua đi lại một chỗ | bốn nguyên nhân khác nhau cùng triệu chứng | xem luật §Map vòng · não tổ — chữa một cái rồi vẫn loop là bình thường, phải đi hết cả bốn |
| Người đi tới mép map thì kẹt | map khai `wrapAround` mà thiếu viền đất, hoặc tường biên còn trong scene đã bake | `MapScenery.WrapSkirt` = 16; `MapWrapZone` gỡ `Tuong_Bien_*` lúc chạy |
| Hộ tống/áp tải xong quá nhanh | map bị bật `wrapAround` — đoàn xe lách qua mép | Doctor «Map vòng» báo; 5 kiểu chơi đo theo trục x phải để `wrapAround = false` |
| Tổ máy đứng yên ngoài vòng | tổ chưa chạm đất, hoặc mốc rơi vào nước | `TickBrain` chỉ tính người đã chạm đất; xem `Squad.doing` |
| Đồng đội không ai cứu | đang chơi ĐƠN (cố ý không bật), hoặc profile chưa có bản sao | xem `EnableDownedForSquads` |
| Vòng bo không ai thắng được / có quân mới | map tự xây còn tướng / viện binh | `MapBlueprint.Validate` réo; tắt trong Xưởng map |
| Người chơi gục mà camera đứng | chơi ĐƠN (không có đồng đội để xem) | luật: đơn thì hết ván với người chơi — F5 |

## 7. Đặt art (ChatGPT) — thay hình vẽ bù

Thả file cùng tên vào `Assets/Sprites/Buildings/Modern/`, nền trong suốt, pivot GIỮA; tool
không ghi đè art thật. Prompt chung: *"2D game sprite, flat pixel-clean vector style, thick dark
outline, no background, single object centered, side view"* + từng món:

- `Prop_Parachute.png` (220×160): *round parachute canopy, olive with a white panel, suspension
  lines converging at the bottom, no person*.
- `Prop_Bomber.png` (kích thước theo art hiện có): máy bay chở quân nhìn ngang, thân dài, cánh
  thẳng — dùng lại tấm của máy bay ném bom.
- `Prop_Medkit.png` (110×90): *white first-aid box with red cross and a small handle on top*.
- `Prop_Potion.png` (70×100): *round glass flask with red healing liquid and a cork stopper*.
- `Prop_SupplyCrate.png` (120×100): *wooden supply crate with two dark straps and a yellow cross mark*.

Tiếng: rơi dù / mở thùng / còi báo vòng chưa có clip riêng — hiện dùng `EffectEvent.Spawn/Land/
Pickup` có sẵn. Muốn thêm thì đặt Gemini theo `Docs/KnowledgeBase/Audio.md`.

## 8. Còn thiếu (việc tiếp theo, đã cân nhắc)

- **Chơi mạng.** Kiến trúc hiện tại là AI chạy máy local + ragdoll vật lý, không sẵn cho đồng bộ
  mạng. Battle royale offline với bot là hướng đã chọn; online là một dự án khác từ đầu.
- **Đọc số cân bằng từ nhiều ván một lần** — hiện phải mở `royale.csv` bằng tay.
- **Tiếng riêng** cho vòng bo và thùng tiếp tế.
