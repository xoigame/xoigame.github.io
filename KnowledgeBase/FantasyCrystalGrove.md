# Rừng Pha Lê — thiết kế Fantasy

`Genre_Fantasy_CrystalGrove` là màn phòng thủ Fantasy chơi được. Nó lấy khung rõ ràng của
`SiegeCamp` Trung cổ — có cổng thật, tuyến thủ, các đợt và điều kiện thắng/thua — nhưng đổi câu
hỏi chiến thuật theo chủng tộc Fantasy, không chỉ thay tên lính hoặc tăng máu.

Người chơi là tiên nữ cầm đũa phép, bảo vệ Cổng Rừng Pha Lê ở phía trái bản đồ. Địch tiến từ
phải sang; cổng sập hoặc người chơi ngã thì thua. Dọn sạch sáu hồi thì thắng.

## Bố cục map

```
[Cổng Rừng Tiên] ─ tiên + lùn giữ tuyến ─ đường pha lê mở ─ tổ harpy ─ tổ rồng
     x=-28                x=-26..-18          x=0            x=12       x=34
```

Pha lê là trang trí, không có collider. Đường chiến đấu chỉ có một làn rõ ràng để AI mặt đất
không kẹt vào cảnh; cổng là `BaseBuilding` thật, có máu và là objective của cả trận.

## Chín chủng tộc, chín quyết định

| Chủng | Phe | Vai trò AI | Điều người chơi phải xử lý |
|---|---|---|---|
| Tiên tộc | Thủ | Giữ cổng, cứu đồng minh, pháp sư/cung đứng sau | Bảo toàn tuyến phép và dùng mana đúng thời điểm |
| Lùn | Thủ | Tuyến chặn chậm, không rút, chia mục tiêu để giữ bề ngang | Đứng sau lá chắn lùn thay vì lao ra một mình |
| Goblin | Xâm lăng | Chạy sát, phân tán mục tiêu, máu thấp thì rút | Hạ quấy rối sớm, không để tuyến thủ bị kéo giãn |
| Orc | Xâm lăng | Xung phong theo cụm, không rút, xúm một điểm | Giữ mặt trận và bảo vệ pháp sư hậu tuyến |
| Skeleton | Xâm lăng | Bầy chậm, không sợ, không thay phiên | Dùng cung/phép diện rộng để không bị bào mòn |
| Troll | Xâm lăng | Công thành chậm, ưu tiên Cổng Rừng hơn quân lính | Chọn giữa chặn troll hay xử lý hộ vệ của nó |
| Quỷ | Xâm lăng | Săn mục tiêu tầm xa, áp sát nhanh, không rút | Canh pháp sư/cung, không để quỷ xuyên tuyến |
| Harpy | Xâm lăng | Bay, bổ xuống và thi triển phép từ trên không | Đổi góc ngắm, hạ quái bay trước khi nó kéo vỡ đội hình |
| Rồng | Xâm lăng | Boss bay; dưới 45% máu tăng nhịp lao/phép | Giữ vị trí và dồn sát thương kết liễu |

`FantasyRaceTactics` nhân bản `AIProfile` trên từng cá thể rồi tinh chỉnh đúng vài quyết định
(chạy/rút, chia mục tiêu, ưu tiên công trình hoặc săn tầm xa). Vì vậy Fantasy tái sử dụng nguyên
FSM `StickmanAgent`, đội hình, `MeleeCombatStrategy`, `CasterCombatStrategy`, mana và vũ khí từ
Trung cổ; không có một nhánh AI song song để bảo trì. Harpy và rồng là ngoại lệ đúng nghĩa:
chúng dùng `FantasyAirRaider` vì navigation mặt đất không thể đại diện cho bay.

Sân `Genre_Fantasy_Civilizations` phải sinh đủ cả chín chủng để kiểm art/runtime: Liên minh Tiên
có Tiên/Lùn, Bộ tộc Orc có Orc/Goblin, còn Quái vật có Skeleton/Troll/Quỷ/**Harpy/Rồng**. Harpy
và Rồng nhận role cận chiến để vào cùng flow test nhưng `FantasyRaceLoadout` luôn rút vũ khí đang
chọn về nắm đấm tự nhiên vô hình trước khi AI chạy.

## Trang bị theo chủng và cấp

`FantasyRaceLoadout` là nguồn sự thật cho outfit/vũ khí Fantasy. Nó implement `INoAutoDress`,
nên `CivilizationTeamAssigner` không thể mặc nhầm nón, giáp hoặc khiên Trung cổ lên quái vật.
Mỗi unit vẫn dùng thang chung `UnitRank`, nhưng rank chỉ hiện đồ khi **chủng đó cho phép**:

| Chủng | Levy | Regular | Elite | Vũ khí rời |
|---|---|---|---|---|
| Lùn, Orc | không đồ | nón native | nón + giáp native | có, giữ đúng một cây roster |
| Goblin | không đồ | không đồ | nón + giáp scavenged native | có, giữ đúng một cây roster |
| Tiên, Skeleton, Quỷ | cơ thể/art native | như Levy | như Levy | có (cung/trượng/lưỡi hái/focus) |
| Troll, Harpy, Rồng | cơ thể là giáp | như Levy | như Levy | **không** — chỉ dùng nắm đấm fallback vô hình cho hitbox/combo |

"Native" nghĩa là `FantasyRigPaint` vẽ mảng tương ứng theo xương sau IK; không tạo
`EquipmentDefinition` của người rồi đắp lên người quái. Với loài không cầm đồ, policy rút cả
kho vũ khí về `Weapon_Fists` (không có sprite) và chặn nhặt vũ khí về sau. Chỉ `Unequip()` là
không đủ vì AI vẫn có thể rút lại cây khác từ kho prefab ở nhịp kế tiếp.

## Nhịp gameplay

| Hồi | Địch | Câu hỏi gameplay |
|---|---|---|
| 1 | 2 goblin cung + 2 goblin vuốt | Dập quấy rối nhanh hay để chúng lôi giãn tuyến? |
| 2 | 2 orc + thủ lĩnh runeblade | Giữ tuyến trước trước đợt xung phong cụm? |
| 3 | 4 skeleton giáo + pháp sư xương | Xử lý bầy đông và nguồn phép ở sau? |
| 4 | Troll phá cổng + 3 quỷ | Chặn công thành, đồng thời cứu hậu tuyến bị săn? |
| 5 | 2 harpy | Có đổi góc ngắm lên sinh vật đang bổ xuống? |
| 6 | Rồng Rift | Có kết liễu boss khi nhịp tấn công của nó tăng? |

Tiên tộc có cung thủ, pháp sư băng và tu sĩ thánh; lùn có búa/khiên. Các trượng vẫn đi qua
`MagicWeapon`: mana, niệm phép bị ngắt khi trúng đòn, projectile, cooldown và effect đều dùng
lại hệ hiện có. Quái bay chỉ tắt `StickmanAgent`/`StickmanLocomotion`; đòn đánh vẫn gọi
`StickmanFighterController.AimAt` và `AttackNow`.

## Ngôn ngữ hình ảnh và intake art

Fantasy phải đọc ra bằng **mặt lẫn thân/tay/chân cùng một style side-view**, không phải đầu AI
chi tiết đội trên người stickman đen. Tiên/lùn/goblin/orc/skeleton/troll/quỷ/harpy/rồng vẫn dùng
các dấu hiệu cánh, râu, tai, sừng và rune; `FantasyRigPaint` gắn sprite thật vào endpoint xương
để chúng đi cùng IK khi chạy, đánh và né.

Art nguồn là `Assets/Resources/Fantasy/Races/FantasyRaceFaces_v1_Source.png` và
`FantasyRaceBodies_v1_Source.png`; bộ runtime chính là
`FantasyRaceParts_v2_Source.png`, một sheet 5 cột × 9 hàng (Head/Torso/Limb/Hand/Foot × 9 chủng)
vẽ **nghiêng ngang — side profile quay phải**. `FantasyRaceArtBuilder.PrepareArt()` là cửa intake
duy nhất: giữ source, flood-fill nền caro RGB chỉ từ mép vào thành alpha, cắt/trim từng mảnh và
đặt pivot đúng điểm gắn rig (tâm cho đầu/thân/đoạn chi, cổ tay/cổ chân cho Hand/Foot). Kết quả là `FantasyRaceParts_v2.png` với 45 sprite có tên
`{Race}_{Part}`; `FantasyRigPaint` lấy đúng phần đó cho mỗi xương. Không được dán một full-body
sprite đứng im lên rig — art thay SpriteSkin phải có đúng bone/weight. Bộ part AI chưa có
bone/weight nên `FantasyRigPaint` dùng xương/IK gốc làm dữ liệu chuyển động, **tắt renderer
stickman gốc** rồi render body Fantasy; vì thế nó là thay toàn bộ silhouette, không phải overlay
nón/giáp và cũng không tranh quyền `StickmanBodyAnimator`.

## Animation theo chủng

`FantasyRaceMotion` KHÔNG ghi bone/IK. `StickmanBodyAnimator` vẫn là chủ của dáng đi, vung vũ
khí, trúng đòn và ragdoll; component Fantasy chỉ animate lớp art phụ trong `LateUpdate`:

| Chủng | Bộ body animation | Chuyển động art phụ |
|---|---|---|
| Tiên, Goblin, Harpy, Quỷ | `ActionSet_Agile` | Cánh đập nhanh / tai giật / rune đập nhịp |
| Orc | `ActionSet_Soldier` | Nhún vai trước khi xung phong |
| Lùn, Skeleton | `ActionSet_Heavy` | Nhịp nặng, râu/sọ lắc nhẹ |
| Troll, Rồng | `ActionSet_Boss` | Bước dậm, nhún nặng; rồng đập cánh chậm và rộng |

Đây là phân công một chủ cho mỗi transform: rig không bị hai script giành quyền, trong khi người
chơi vẫn đọc được ngay nhịp và bản chất từng chủng từ xa.

Hai ảnh định hướng đã tạo cho màn:

- `Assets/Art/Fantasy/CrystalGrove/CrystalGrove_KeyArt.png` — tranh key art cho layout, palette và kẻ địch.
- `Assets/Art/Fantasy/CrystalGrove/CrystalGrove_Weapons_v2.png` — sheet trượng lửa/băng/bão/tử linh + rune blade. Năm món nằm một hàng ngang, nền alpha trong suốt, cán trái và đầu/lưỡi phải để cắt sprite ổn định.
- `Assets/Resources/Fantasy/Races/FantasyRaceFaces_v2.png` — atlas đầu production đã bỏ nền, trim và chấm pivot.
- `Assets/Resources/Fantasy/Races/FantasyRaceBodies_v1.png` — atlas toàn thân production đã bỏ nền/trim, dùng làm nguồn style chung.
- `Assets/Resources/Fantasy/Races/FantasyRaceParts_v2.png` — production sheet 45 mảnh side-view thực sự gắn vào rig.

Scene và atlas đều được khai trong Bảng điều khiển/build pipeline với proof riêng.
`FantasyRaceTactics.cs`, `FantasyRaceArt.cs`, `FantasyRaceLoadout.cs`, `FantasyRaceMotion.cs` và `FantasyRigPaint.cs` nằm trong `extraSources`,
nên sửa luật AI, art runtime hoặc animation sẽ làm Bảng điều khiển báo màn cần dựng lại; bước còn
nợ không nằm trong một lời nhắc bàn giao.
