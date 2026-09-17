## ⚠⚠ NGOẠI HÌNH NHÂN VẬT — `StickmanLook`: que đen thành nhân vật KHÁC DÁNG (2026-09-09)

User gửi 7 ảnh tham chiếu (Stick Warriors · Stickman Warrior · Super Stickman Dragon Warriors ·
Stick Fight · game ghép quân) và chốt: *"vẽ nhân vật stickman giống vậy cho đa dạng HÌNH DÁNG,
không nhất thiết chỉ màu sắc như hiện tại; vẽ lại cho cả 3 mode, nhất là fantasy; thêm skill để
sau này yêu cầu vẽ thêm"*. Bảng đọc ảnh ra số ở `Docs/KnowledgeBase/CharacterLook.md`; skill làm
việc là `.claude/skills/stickman-look/`.

### 1. Luật cũ đổi thế nào

Luật cũ *"THÂN + ĐẦU LUÔN ĐEN, nhận diện bằng đồ"* nay là **mặc định**, không còn là **cấm**:

| | Trước | Nay |
|---|---|---|
| Màu thân | luôn đen | que đen là hồ sơ `Plain`; hồ sơ khác được đổi màu thân/tay/chân |
| Dáng | một que | ống tay/chân dày 0 → 0.12 world, đầu tròn/vuông/bầu dục/nhọn, to 1.0–1.18× |
| Nhận diện | nón · giáp · khiên · vũ khí | + tóc · mặt · áo · vật sau lưng · đuôi · băng đầu |
| Phe | bắp tay chủ đạo màu phe | GIỮ NGUYÊN — `StickmanTeamTint` nhuộm cả ống bắp tay |

Vế không đổi: **thân là RIG CŨ**. Không thay sprite SpriteSkin, không đổi xương/IK/animation/ragdoll.
Mọi thứ mới là OVERLAY bám xương (cùng cơ chế nón/giáp) + `SpriteRenderer.color` trên que gốc
(sprite `stickman.png` vẽ TRẮNG, màu đen là `color` của renderer — nên đổi màu không cần shader).

### 2. Ba tầng, mỗi tầng một file

| Tầng | File | Việc |
|---|---|---|
| Dữ liệu | `Assets/Scripts/Combat/Appearance/StickmanLookProfile.cs` | `StickmanLookSpec` (struct: màu 6 bộ phận · độ dày · dáng đầu · 7 sprite đắp + màu) và vỏ asset `StickmanLookProfile` |
| Kho theo thời kỳ | `Assets/Scripts/Combat/Appearance/StickmanLookSet.cs` | `Resources/Looks/LookSet_<GameGenre>` — kho sprite/màu từng trục + xác suất + hồ sơ đặt tên; `Roll(seed)` bốc theo TỪNG TRỤC; `TryGet(tag)` |
| Áp lên rig | `Assets/Scripts/Combat/Appearance/StickmanLook.cs` + `.Overlays.cs` | nhuộm que · ống `Sliced` theo chiều dài xương · đầu/tóc/mặt/băng ghim `keepUpright` · áo/sau lưng/đuôi `followBoneLean` · xác giữ lớp đắp |
| Phát cho cả sân | `Assets/Scripts/Units/StickmanLookAssigner.cs` | `Start` + hook `CivilizationTeamAssigner.Dressing`; nhường `INoAutoDress` và `StickmanLook.Locked` |
| Gắn vào scene bake | `Assets/Scripts/Demo/StickmanLookBootstrap.cs` | `sceneLoaded` → thời kỳ từ `GenreWeaponPolicyBinder` (rồi tên scene) → gắn assigner; loại trừ menu · zombie · đột nhập · thuỷ chiến · tủ kính nền |
| Chủng Fantasy | `FantasyCreatureLook.ApplyRaceOutfit` | hồ sơ thẻ = tên chủng trong `LookSet_Fantasy`; màu thân ghi đè bằng `FantasyRacePalette`; **không** tóc/mặt/đầu (đầu là art phẳng của chủng); chủng có đuôi catalog thì bỏ đuôi hồ sơ |
| Sân Fantasy — 9 chủng chính | `FantasyUnifiedRaceArt` + `FantasyUnifiedLook` + `FantasyUnifiedRigLayout` | ba sheet `Unified` (Levy · Regular · Elite), mỗi ô là **một nhân vật hoàn chỉnh** skin bằng 11 bone của rig chung: đầu, thân, nón/giáp native và chi tiết bậc liền một silhouette; không đắp Equipment/helmet/rank badge rời |
| Bậc Fantasy — fallback | `FantasyRigPaint.BuildRankInsignia` + `FantasyRaceArt.RankFor` | giữ cho chủng chưa có sprite Unified; đọc **một nguồn** `FantasyRaceLoadout.Rank`, chỉ đắp phù hiệu lên `body_1` của biped; không sửa SpriteSkin/bone/IK/ragdoll |
| Art vẽ bù | `Assets/Editor/Art/StickmanLookArt*.cs` | 58 tấm `Assets/Sprites/Looks/<Loại>/` — trắng + xám + viền; nối vào «Vẽ bù» · «Vẽ lại» · chứng · contact sheet |
| Bảng số | `Assets/Editor/Units/StickmanLookBuilder.cs` | **NGUỒN SỰ THẬT** "thời kỳ nào có gì": `Specs` (kho + xác suất + hồ sơ `Pf(...)`) → 4 set + hồ sơ `Assets/Settings/Looks/` |
| Phép đo | `Assets/Editor/Doctor/StickmanDoctor.Look.cs` | set thiếu/ô null/thẻ trùng/chủng thiếu hồ sơ · art thiếu · **5 điểm nối** (đọc văn bản nguồn) |

Nút: Bảng điều khiển › Nhân vật › **«★ Ngoại hình nhân vật — vẽ bộ + dựng 4 bộ theo thời kỳ»**
(= `Appearance > 4`; cũng chạy trong «★ Vẽ bù art còn thiếu», «★ Vẽ LẠI TOÀN BỘ art code» và
dây chuyền bậc 0). Không bấm thì `StickmanLookSet.Load` trả null và sân **y như cũ** — hỏng mềm.

### 3. Hợp đồng khổ art (đổi là lệch cỡ, không lỗi nào báo)

| Loại | Canvas | Mốc | Cỡ lúc chạy |
|---|---|---|---|
| tóc · mặt · băng · dáng đầu | 128×128, pivot tâm | tâm đầu = (64,64), **bán kính đầu 32 px** | `rigHeadDiam / (64 px / PPU) × headScale` — đường kính đầu rig đo từ sprite `headRagdoll` |
| áo · sau lưng | 96×128, pivot (0.5, 0.75) = **khớp vai** | thân dài **72 px** (vai → hông) | `rigTorsoLen / (72 px / PPU)`, rigTorsoLen = `body_2.x + boneHead.x` |
| đuôi | 128×64, pivot (0.9375, 0.5) = gốc đuôi mép phải | đuôi kéo về −X | cùng thang với áo |
| ống | 48×24, viên nang, border 12/0/12/0 | `Sliced`; co ĐỒNG DẠNG `t/0.24` rồi kéo `size.x` | `t = limbThickness / lossyScale` (world → rig) |

Hằng số hợp đồng: `StickmanLook.HeadDiameterPx = 64`, `TorsoLengthPx = 72` ↔ `StickmanLookArt` ↔
`lookart.py`. Mọi tấm NHÌN NGANG, +X là trước mặt (một con mắt, một vạt, đuôi khăn rủ về −X).

**Màu là hợp đồng**: mảng chính TRẮNG (nhân `color` ra màu thật) · mảng phụ xám 150 · mảng tối
xám 92 · viền (24,22,28). Vẽ màu thật vào tấm là tấm đó chỉ có MỘT màu mãi mãi.

### 3a. Ba bậc Fantasy đọc được ngay trên sân

Sân Fantasy dùng **mảnh cơ thể đã cắt**, không dùng một ảnh toàn thân bị kéo bằng SpriteSkin. Chín
chủng đang xuất trận (Tiên · Lùn · Orc · Skeleton · Goblin · Troll · Quỷ · Harpy · Rồng) phải đủ
`Head · Torso · Limb · Hand · Foot` trong `FantasyRaceParts_v3`. Đây là những phần cơ thể của cùng
một thiết kế — không phải nón, giáp hoặc đồ trang trí lắp thêm.

`FantasyCreatureLook` luôn đi qua `FantasyRigPaint`. `Torso` bám thân, `Limb` bám vai/hông,
`Hand` bám cổ tay và `Foot` bám cổ chân; mỗi mảnh là con trực tiếp của bone tương ứng. Vì vậy
idle/chạy/đánh/IK do `StickmanBodyAnimator` điều khiển các transform chung mà không kéo giãn pixel
ở khuỷu hay đầu gối. Khi chết, từng mảnh được giao cho ragdoll tương ứng bằng `StickmanCorpseGear`.

Ba bậc vẫn đọc theo `FantasyRaceLoadout.Rank` bằng dấu hiệu Levy · Regular · Elite trên thân; không
có sprite nón/giáp rời. Sau khi thay art, bấm `Tools > Stickman > Nâng cao > Art > Fantasy — cắt
mảnh theo rig Stickman` (`FantasyUnifiedRigBuilder`, tên lớp giữ tương thích). Tool dùng Sprite
Editor data provider để trim/cắt/pivot 45 mảnh, không sửa `.meta` tay; Doctor đo đủ 45/45 trước
khi bàn giao.

`Rank_{Levy,Regular,Elite}.png` dưới đây là đường lùi cho các chủng chưa được đặt art Unified,
không phải art chính của sân chín chủng.

`UnitRank` đã là nguồn số liệu của máu/sĩ khí và **cũng là nguồn duy nhất của art bậc**: `Levy`
(dân binh) · `Regular` (chính quy) · `Elite` (tinh nhuệ). Ba PNG nằm tại
`Assets/Resources/Fantasy/Races/Rank/Rank_{Levy,Regular,Elite}.png`: canvas **96×128**,
pivot giữa, PPU 100, nhìn ngang +X, nền alpha, nét **xám** để `FantasyRigPaint.RankTint` nhuộm
nâu · lam · vàng. Không vẽ màu đội hoặc màu chủng vào PNG.

`BuildRankInsignia` chỉ gắn một overlay vào `body_1` của `FantasyBodyPlan.Biped`, bậc vẽ
`BodyGear + 1`: trên áo để biểu tượng rõ, sau tay gần để không che động tác. Centaur/naga/rồng
vẫn dùng dáng cơ thể riêng, không ép một huy hiệu ngực lên body plan không có ngực người. Mảnh
phù hiệu đi qua `StickmanCorpseGear` lúc ragdoll; **cấm** đụng `SpriteSkin`, hierarchy rig hoặc
đổi `UnitRank` chỉ để đổi hình. Doctor «Bậc Fantasy thiếu art phân biệt Levy/Regular/Elite» phải
xanh trước khi bàn giao.

### 4. Bậc vẽ và phá hoà bậc (`StickmanSorting`)

đuôi 2 · sau lưng 3 (z+.006) · ống xa 3/4 · ống thân 5 · áo 6 (z+.004, **SAU giáp thật**) · dáng
đầu 6 (z−.003, đầu gốc **tắt**) · tóc 7 (z−.001) · mặt 7 (z−.002) · băng 8 (z−.001) · ống gần
7/8/10. Cùng bậc thì Unity xếp theo khoảng cách camera → nhấp nháy: mọi lớp mới PHẢI có z riêng.

Luật nhường: có tóc mới → `StickmanAppearance.SetDeco(None)` (tóc cũ tắt); có NÓN (thật qua
`HasSlot(Head)` hoặc overlay qua `ShowsHelmetOverlay`) → **băng đầu không dựng**, và chốt một
chiều trong `LateUpdate` như nón overlay.

### 5. Ai được áp, ai để yên

- `INoAutoDress` (zombie · tù binh · máy bay): không đụng.
- `StickmanLook.Locked` = hồ sơ CÓ CHỦ ĐÍCH (chủng Fantasy · `StickmanArchetype.look` · kịch bản):
  assigner bỏ qua, **bất kể thứ tự `Start`** — đây là lý do có cờ, không phải "gọi sau thắng".
- `Apply` gọi lại được: dọn lớp cũ, trả màu que rồi mới đắp — nên hai bộ áp chồng cũng không rò.
- Xác: `Died` → `StickmanCorpseGear.KeepOn(lớp, part ragdoll của xương)`; `body_1` không có part
  → dùng `bodyRagdoll`. Part ragdoll cache LÚC CÒN SỐNG (`CacheRagdollPart` ở lúc dựng lớp).

### 6. Thêm một kiểu tóc / áo / nhân vật (quy trình, đừng làm tay)

1. Vẽ ở **Python** trước: `lookart.py` (hàm cùng tên C#) → `look_preview.py` ghép nguyên con →
   **NHÌN**, kể cả ô 40 px. Sửa tới khi đọc ra ở cỡ nhỏ.
2. Chép số sang `StickmanLookArt.Head.cs` / `.Body.cs` + thêm tên vào mảng `*Names`.
3. Nối vào kho thời kỳ: `StickmanLookBuilder.Specs` (mảng `hairs/torsos/...`), và/hoặc một hồ sơ
   `Pf("Thẻ", ...)`.
4. Bấm «★ Ngoại hình nhân vật» → nhìn `Docs/ArtSheets/Looks_*.png` → Doctor.
5. Art đẹp: đặt ChatGPT theo `WeaponArt-ChatGPT-Prompt.md` mục 12, thả PNG CÙNG TÊN vào
   `Assets/Sprites/Looks/<Loại>/` — code chừa ra theo nhãn, không cần sửa gì.

Chủng Fantasy mới = một dòng `Pf("<Chủng>", thick:, torso:, ...)`; quên thì Doctor réo.

### 7. Bẫy đã tính trước

- **Ống che mất màu phe** → `StickmanTeamTint.Apply` gọi `StickmanLook.SetTeamArm` (ống bắp tay
  gần nhận màu phe, ống kia trả màu hồ sơ khi quay đầu). Bỏ dòng đó là phe không đọc ra.
- **Que dưới ống khác màu ống ở khuỷu** → Fantasy lấy màu từ `FantasyRacePalette` (đúng bảng
  `FantasyRigPaint` nhuộm mỗi nhịp), `farShade = 0.83`.
- **`EquipmentStabilizer.Setup` giữa cú vung** → `_restAngle` sai vĩnh viễn. Áp lúc sinh/`Start`,
  đừng áp trong hit-stop.
- **Bốc trục mới chèn giữa `Roll`** → mọi seed cũ đổi người. Trục mới nối CUỐI.
- **Sửa generator rồi bấm «Vẽ bù»** → không đổi byte nào (cố ý). Dùng «Vẽ LẠI TOÀN BỘ».

### Áo phải TỐI hơn thân, và tương phản ≥ 1.6 (2026-09-09)

Sprite áo là mặt nạ TRẮNG nhân với màu áo; thân là một màu phẳng. Hai hệ quả, cả hai đều đã dính:

- **Áo sáng hơn thân ⇒ áo thành NỀN, không thành trang phục.** Tiên khai áo `#e8e8f0` trên thân
  tím sáng `#ad6bf0` ⇒ cả phe Liên minh Tiên ra một mảng trắng dính nhau, ở 40 px không đọc ra
  hình gì. Naga (`#c0d0d0` trên lam) cùng lỗi.
- **Áo cùng sắc, chỉ khác độ sáng chút ít ⇒ áo VÔ HÌNH.** Minotaur khố `#6a4a2a` trên thân
  `#754229`: tỉ số độ chói **1.02** — tức bằng không. Golem 1.11, Lùn 1.35.

Phép đo trước khi khai một hồ sơ: tỉ số độ chói WCAG áo/thân **≥ 1.6** *và* áo tối hơn thân.
Kiểm bằng `look_preview.py` ở ô 40 px — không nhìn bản to; bản to cái gì cũng đẹp.

⚠ Ngoại lệ có chủ ý: **sáng-trên-tối** vẫn đúng (Quỷ: băng xương `#d0c0b0` trên thân đỏ thẫm,
tỉ số 4.3). Luật là *áo không được sáng hơn một thân đã sáng*, không phải "áo luôn phải tối".

⚠ Bộ chia phe Fantasy ghi ĐÈ màu thân bằng `FantasyRacePalette` — nên màu thân trong hồ sơ
Fantasy là màu **mặc định** chứ không phải màu trên sân. Đo tương phản với màu ở
`FantasyRaceCatalog.Of(kind).body`, không đo với `body:` của `Pf(...)`.

### 8. Lớp thân là CON CỨNG của xương; art xấu thì ĐẶT ChatGPT, đừng vá hàm vẽ (2026-09-09, đợt ba)

User báo: *"vị trí chi tiết sai khi quay qua quay lại hai bên"* và *"hình vẽ xấu quá"*.

- **Áo · sau lưng · đuôi · phụ thân nay là con CỨNG của xương thân** (`localRotation = −90°`,
  hằng `OnTorsoBone`), không còn `EquipmentStabilizer followBoneLean`. Stabilizer chụp góc nghỉ
  lúc `Setup` và đặt lại theo hệ THẾ GIỚI mỗi frame: áp hồ sơ lúc rig đang giữa một dáng (sinh giữa
  trận, hồi sinh) là góc nghỉ sai vĩnh viễn, và khi quay đầu cái lệch ấy soi gương ⇒ "chi tiết
  nhảy chỗ". Con cứng đi theo xương y như que gốc, nhóm `Sprite` lật là lật theo, không có góc
  nghỉ để sai. Đầu/tóc/mặt/băng vẫn stabilizer `keepUpright` (xương đầu xoay theo hướng ngắm).
- **Quy ước trục**: xương thân của rig xoay +90° (trục X chỉ LÊN) ⇒ tấm art "đứng thẳng, +X là
  trước mặt" phải xoay −90° khi làm con của xương. Mọi lớp bám xương thân sau này dùng đúng
  hằng đó, đừng tự đo góc.
- **Art xấu ⇒ đường ChatGPT có tool lắp, không phải "sửa vài con số"**: template có mốc
  (`intake_look.py --templates`), prompt mục 12/12b của `WeaponArt-ChatGPT-Prompt.md`, nhận về
  bằng `intake_look.py <png> <Tên>` (xoá nền, quy thang xám, ép khổ), rồi «★ Ngoại hình nhân
  vật» chạy `StickmanLookArt.ConfigureHandArt` (pivot/PPU/border theo hợp đồng + khoá
  `stickman:hand`). Quy trình đầy đủ ở skill `stickman-look` mục *Art đẹp*.

### Tóc phải NHƯỜNG nón — và râu phải cùng màu tóc (2026-09-09)

⚠⚠ **Nón che cả sọ, nên mọi mảng tóc vẽ ở thể tích sọ đều chọc ra NGOÀI nón.** Tóc nằm ở tầng
`StickmanSorting.HeadDeco` (7) ngay dưới nón (`HeadGear` = 8), và trước 2026-09-09
`StickmanLook.LateUpdate` **chỉ giấu băng đầu** — tóc chưa từng bị đụng tới. Đo trên ảnh thật
(nón Crusader chồng lên cả 15 kiểu): afro · wild · long · bob thành **quả cầu vàng đội nón**;
spiky · flame · mohawk · swept thành **vành gai toả ra như mặt trời**. Biên dịch sạch, không
một dòng log.

Luật: đội nón thật (`StickmanEquipment.HasSlot(Head)`) thì tóc **đổi sang biến thể `Hair_Under*`
hoặc TẮT HẲN** — chốt một chiều như băng đầu (nón rớt thì đầu trần, không hiện lại).

| Tóc gốc | Dưới nón | Vì sao |
|---|---|---|
| `Hair_Ponytail` | `Hair_UnderTail` | bản sắc nằm ở đuôi thò ra sau |
| `Hair_Long` | `Hair_UnderLong` | phần xoã xuống vai |
| `Hair_Braid` | `Hair_UnderBraid` | bím rủ sau gáy |
| `Hair_Mane` | `Hair_UnderMane` | bờm vốn đã ở quanh gáy, dưới vành nón |
| 11 kiểu còn lại | *(tắt)* | mũ tóc là chính ⇒ không còn gì để vẽ |

Bảng ở `StickmanLookArt.UnderHelmOf` — **một nguồn**. Biến thể `Hair_Under*` = đúng hình của
kiểu gốc **bỏ `HairCap`**, không vẽ lại từ đầu.

⚠ `StickmanLookSet.hairUnderHelms` là mảng **SONG SONG** với `hairs`: `Roll` bốc MỘT chỉ số rồi
dùng cho cả hai. Lệch độ dài là lính tóc gai đội nón lại lòi ra đuôi ngựa của người khác.
Phép đo canh: Doctor › *"Bộ ngoại hình theo thời kỳ (StickmanLook) chưa dựng / thiếu ô"*.

⚠ Đừng "điền cho đủ 15" biến thể: kiểu nào mũ tóc là chính thì biến thể của nó RỖNG, và một
tấm rỗng nhìn y hệt tắt nhưng vẫn tốn một sprite + một renderer mỗi lính.

⚠⚠ **RÂU LÀ TÓC — phải cùng màu.** `spec.faceColor` vốn bốc ĐỘC LẬP với `hairColor`, nên lính
bốc ngẫu nhiên ra được **tóc đen + râu trắng**. Các hồ sơ đặt tên (Viking · King · Lùn) đã khớp
tay hai màu này từ lâu — chỉ đường bốc ngẫu nhiên quên, tức phần lớn lính trên sân. Nay
`Face_Beard` ép `faceColor = hairColor`; mọi mặt khác (mắt · sẹo · kính · mặt nạ) giữ màu riêng —
buộc chúng theo màu tóc là mất hết sắc thái.

### 9. Art phải CÓ KHỐI, và phải có ĐƯỜNG LÙI (2026-09-09, đợt bốn)

User: *"hình ảnh mới thêm vào vẽ quá xấu, làm xấu hết tất cả hình đang có"*. Hai bài học, cả hai
là luật cho mọi bộ art code sau này:

**(a) BA MỨC XÁM LÀ KHÔNG ĐỦ.** Bản đầu chỉ có trắng · xám · viền; runtime NHÂN màu vào là cả
tấm ra ba sắc của một màu ⇒ mắt đọc thành *một mảng phẳng dán lên người*. Nay **thang SÁU MỨC**
(`Hi 255 · Lit 236 · Base 205 · Mid 150 · Shade 104 · Dark 70`, viền 24) và bốn primitive bắt
buộc ở `StickmanLookArt`: `GradShape` (khối gradient) · `Fold` (nếp = nét tối KỀ nét sáng) ·
`Seam`/`Stud` (đường may, khuy) · `Polish` (mép trên-trái nâng một nấc, mép dưới-phải hạ một nấc).
⚠ `Base` = 205 chứ không phải 255 là CHỦ Ý: chừa chỗ cho hai mức sáng hơn, và mắt đọc màu theo
ĐIỂM SÁNG NHẤT chứ không theo mảng nền.

**(b) KHUÔN BA BƯỚC cho mọi tấm có chi tiết**: khối bằng `GradShape` → chụp `Snapshot()` → vẽ chi
tiết TRÀN → `ClipToOpaque(snap)` → phần cố ý nhô ra vẽ SAU. Bỏ bước cắt là cổ áo thành mảng đen
nổi trên vai (đã dính ở vòng đầu). Đây đúng luật `ClipToEllipse` của bộ nón, chỉ là quên áp.

**(c) HỆ KHOÁC LÊN CẢ GAME THÌ PHẢI TẮT ĐƯỢC — VÀ VẶN NHỎ ĐƯỢC.** `StickmanLookSet.detail`
(`StickmanLookDetail` TẮT · GỌN · ĐỦ) + nút «★ Mức ngoại hình: TẮT → GỌN → ĐỦ» trên Bảng điều
khiển (bấm là sang mức kế), hoặc chọn THẲNG mức ở menu `Nâng cao › Appearance › 6. Mức ngoại
hình` (có dấu tích ở mức đang đặt) — `StickmanLookSwitch`. Mức nằm trên ASSET (bản build cũng
đọc), không phải EditorPrefs; phép thử của hợp đồng này ở «★ Tự kiểm luật chơi» nhóm *Ngoại hình*.

| Mức | Khoác gì | Dùng khi |
|---|---|---|
| **TẮT** (mặc định) | không gì — `Load` trả null, sân về ĐÚNG trước khi có hệ | art chưa ưng |
| **GỌN** | màu thân · tay chân dày · dáng đầu · tóc | *"thêm vào lung tung quá"* |
| **ĐỦ** | thêm mặt · băng đầu · áo · sau lưng · đuôi · phụ thân | art đã ưng |

⚠ **BA mức chứ không phải bật/tắt** (user 2026-09-09): *"quá xấu"* và *"thêm vào lung tung quá"*
là HAI lời phàn nàn khác nhau. Chỉ có TẮT thì người dùng phải chọn giữa "sân 20 que giống hệt"
và "sân lổn nhổn" — cái họ muốn nằm ở giữa.
⚠ Mức GỌN **tỉa SAU khi bốc** (`StickmanLookSet.Reduce`), không phải bốc ít đi: bốc ít đi là đổi
thứ tự gọi `rng` ⇒ cùng một seed ra hai dàn nhân vật khác nhau ở hai mức.
⚠ GỌN **không tỉa hồ sơ ĐẶT TÊN** (chủng Fantasy, Viking, Vua) — "lung tung" là nói đường bốc
ngẫu nhiên; áo của họ là bản sắc có chủ đích.
⚠ Ba cửa vào phải cùng hỏi công tắc: `StickmanLookAssigner` và `FantasyCreatureLook` đi qua
`Load` nên tự tắt; **`StickmanArchetype.ApplyLook` cầm thẳng asset hồ sơ** nên phải hỏi
`HighestDetail` — quên chỗ đó là tắt được một nửa, kiểu hỏng khó tin nhất.
⚠ `StickmanLookBuilder` **không được ghi `detail`**: dựng lại art là đúng lúc người ta hay bấm
nút, bật lại thứ họ vừa tắt là phản bội cái công tắc.
⚠ Luật chung: **bất kỳ hệ nào áp lên MỌI nhân vật ở MỌI scene đều phải có một công tắc**, vì khi
nó sai thì nó không sai một chỗ mà sai cả game — và công tắc phải **mặc định TẮT**, vì hệ đó chỉ
nên bật khi có người NHÌN và đồng ý.

**(d) Art đẹp thì ĐẶT, đừng vá thêm**: đơn hàng 90 tấm điền sẵn ở
[LookArt-ChatGPT-Order.md](../KnowledgeBase/LookArt-ChatGPT-Order.md) (9 lô, kèm template có mốc
và tool nhận về). Bản code chỉ cần đủ "đọc ra ở 40 px" — đẹp là việc của ChatGPT.
