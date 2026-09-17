## Rớt đồ / nhặt đồ / trang bị

### ⚠⚠ HAI CƠ CHẾ TRANG BỊ — `GearRule` (Core), chọn bằng `GearRules.SetMatch`

Bộ đồ trên người trả lời HAI câu hỏi khác hẳn nhau, và trước đây chỉ có câu thứ nhất:

| | **`GearRule.Armor`** — GIÁP (mặc định) | **`GearRule.Insignia`** — PHÙ HIỆU |
|---|---|---|
| Đòn trúng | trừ vào `armor` trước, thừa mới vào máu | đi THẲNG vào máu |
| Hết giáp / hết `hitsBlocked` | món đồ **VĂNG XUỐNG ĐẤT** | **KHÔNG BAO GIỜ RỚT** |
| `weight` (sức nặng) | có — giáp dày thì đi chậm | **KHÔNG** |
| Hitbox riêng của món đồ | có (`EquipmentHitbox`) | không — tên ghim vào NGƯỜI như thể trần |
| Chết | đồ ở lại trên xác | đồ ở lại trên xác (**giống nhau**) |

⚠⚠ **VÌ SAO CẦN CƠ CHẾ THỨ HAI: KÊNH ĐỌC CẤP AI TỰ XOÁ MÌNH GIỮA TRẬN.** Bộ đồ là kênh DUY
NHẤT đọc cấp AI từ xa (`UnitRankGear`: cấp 0 đầu trần → cấp 5 mũ trụ kín — xem §3b-do). Nhưng
ở cơ chế GIÁP thì đánh vài nhát là nón văng ra, và từ đó **một con cấp 5 nhìn y hệt một con
cấp 0** — không lỗi nào báo, chỉ là cái thang cấp bậc nhạt dần theo thời gian trận đánh, và
người xem không có cách nào biết mình vừa mất thông tin. PHÙ HIỆU biến bộ đồ thành một tấm
biển tên không đánh rớt được.

⚠⚠ **PHÙ HIỆU BỎ CẢ `armor` LẪN `weight`, CÓ CHỦ Ý — bỏ một nửa tệ hơn không bỏ.** Giữ
`weight` mà bỏ `armor` thì cấp AI cao hoá ra CHỈ TOÀN BẤT LỢI (đi chậm, không được gì); bỏ
`weight` mà giữ `armor` thì cấp cao được cộng lén một lớp máu ẩn. Bỏ cả hai thì bộ đồ trung
tính tuyệt đối về cân bằng, và câu hỏi của §3b-do — *"CÙNG bộ đồ đó, đánh khôn hơn thì hơn
được bao nhiêu?"* — quay lại trả lời được.

⚠⚠ **HỆ QUẢ PHẢI BIẾT TRƯỚC: Ở PHÙ HIỆU THÌ NÓN KHÔNG CHẮN ĐÒN VÀO ĐẦU.**
`HasHeadProtection` trả false ⇒ luật *"đầu trần là điểm yếu chí mạng"* áp cho tất cả. Đúng
với "chỉ mất máu và chết", nhưng nhìn thì một ông đội mũ trụ vẫn chết vì một mũi tên vào đầu.
Muốn nón chắn headshot mà không hao mòn thì đó là **cơ chế THỨ BA, phải khai riêng** — đừng
nới `GearProtects`, nới là quay về đúng "giáp vô hạn" mà cơ chế này sinh ra để tránh.

⚠⚠ **HỎI Ở ĐÚNG MỘT CHỖ: `StickmanEquipment.GearProtects`.** Sáu đường đi qua nó — dựng
hitbox (`Equip`) · chặn trọn đòn (`CanBlock`) · trừ điểm giáp (`AbsorbDamage`) · chặn mũi tên
ghim (`ProtectiveSlotCoversPoint`) · sức nặng (`RefreshEncumbrance`) · và `TryAbsorb`. Kê lại
luật ở từng chỗ dùng là kiểu gì cũng sót một chỗ, mà sót thì hỏng TRONG IM LẶNG: một cái nón
"chỉ để nhìn" vẫn lặng lẽ nuốt đòn hộ, hoặc vẫn làm chủ nhân đi chậm.
⚠ Vế dễ quên nhất là `ProtectiveSlotCoversPoint`: `blocksHits` là giá trị BAKE trong asset,
không đổi theo cơ chế — thiếu chốt ở đó thì đồ không đỡ gì mà **mũi tên vẫn nảy ra** thay vì
ghim vào người.

**BA CÁCH CHỌN CƠ CHẾ**, theo thứ tự ưu tiên:
1. `GearRules.SetMatch(GearRule.Insignia)` — cả ván, gọi từ mode/builder/bootstrap;
2. `StickmanEquipment._gearRule` (`GearRuleSetting`, mặc định `FollowMatch`) — ép RIÊNG một
   nhân vật, dùng khi màn cố ý trộn hai cơ chế (cả sân PHÙ HIỆU, riêng boss vẫn có giáp thật);
3. nút **«Trang bị»** trong bảng **CẤP AI (F3)** — đổi lúc chơi để so hai bên.

⚠ **ĐỔI LUẬT GIỮA TRẬN ĂN NGAY LÊN NGƯỜI ĐANG ĐỨNG TRONG SÂN.** `GearRules.Changed` →
`StickmanEquipment.RefreshGearRule` thêm/bớt đúng LỚP BẢO HỘ trên bộ đồ ĐANG MẶC, không sinh
lại ai và **không dựng lại visual** (`Equip` lại là món đồ nháy một cái và `EquipmentStabilizer`
chụp tư thế nghỉ ngay giữa cú vung). Không có sự kiện này thì đổi luật chỉ ăn cho quân SINH RA
SAU, còn cả sân đang đánh vẫn chạy luật cũ trong khi bảng báo đã đổi — bảng nói dối.
⚠ `RefreshGearRule` **BẤT BIẾN**: gọi lại không dựng chồng hitbox và không nạp đầy lại giáp
đang hao dở, không thì mỗi cú bấm nút là một liều hồi giáp miễn phí cho cả sân.

⚠ **KHÔNG lưu qua `PlayerPrefs`, và mặc định là `Armor`.** Đây là quyết định THIẾT KẾ của màn
chứ không phải tuỳ chọn của người chơi — nhớ lại giữa các lần chạy là mai mở dự án lên thấy
giáp "không ăn" mà không lần ra được vì sao (cùng lý do `StickmanCameraZoom` cố ý không nhớ
mức zoom). Mặc định `Armor` ⇒ 45 scene đã bake hành xử y hệt như trước.

⚠ **KHÔNG phải dựng lại scene nào** — toàn bộ là code runtime, và `_gearRule` là field MỚI nên
prefab/scene đã bake nhận đúng giá trị khởi tạo trong code.


- **Chết là rớt vũ khí đang cầm** (mặc định bật, tắt bằng `_dropWeaponOnDeath` trên
  `StickmanWeaponHolder`). Vũ khí rớt thành `WeaponPickup` — stickman sống đi ngang là nhặt lại.
- **Nhặt bằng chân — ba món KHÔNG hỏi phím** (2026-09-08, battle royale): `HealPickup` (thiếu máu
  ăn ngay, đầy máu bỏ `MedkitBag` 3 liều, tự dùng < 55% máu + yên 1.6 s, người chơi bấm H) ·
  `GearPickup` (Units — nón/giáp/khiên: mặc nếu slot trống hoặc cấp thấp hơn; `SetGearTier`
  TRƯỚC `Equip`, AI phải `UnitRankGear.PinTier`) · `AmmoCache` trung lập. Lột sạch kho mà VẪN
  nhặt được: `StickmanWeaponHolder.DropArsenal` (khác `UseNaturalWeaponsOnly` — cửa đó chặn
  `AddWeapon`). Luật đầy đủ: [BattleRoyale.md](BattleRoyale.md).
- **Trang bị**: `StickmanEquipment` (trên root nhân vật) + asset `EquipmentDefinition`
  (Create > Stickman > Equipment: sprite + slot Head/Body/Back + offset).
  Đổi hình trang bị = đổi sprite trong asset, không đụng prefab.
  ⚠ **CHẾT KHÔNG LÀM RỤNG TRANG BỊ** (`dropOnDeath` đã bỏ hẳn). Xác vẫn đội nón, vẫn mặc
  giáp — đồ chuyển sang part ragdoll và lăn theo xác. Đường DUY NHẤT để món đồ rơi xuống đất
  là bị ĐÁNH RỚT: hết điểm `armor` (`AbsorbDamage`) hoặc hết lượt `hitsBlocked`
  (`ConsumeBlock`). Nhờ vậy nhìn cái xác là đọc được trận đánh: còn nón = chưa ai bắn trúng
  đầu nó. Bản cũ rớt sạch lúc chết nên xác nào cũng trần trụi giống xác nào, và cái đầu ĐEN
  TRƠN hiện ra ngay giây nhân vật ngã.
- **GIÁP = BỂ ĐIỂM RIÊNG TỪNG SLOT** (`EquipmentDefinition.armor`), nón một bể, giáp thân một
  bể. Đòn trúng người TRỪ VÀO GIÁP TRƯỚC, thừa bao nhiêu mới vào máu; **hết điểm là món đồ
  VĂNG RA** (`StickmanEquipment.AbsorbDamage`).
  ⚠ Đừng nhầm với `blocksHits`/`hitsBlocked` (khiên/nón đếm theo LƯỢT, chặn trọn một đòn rồi
  rơi). Đếm lượt thì cây kim và cái búa tạ tốn như nhau — không cân bằng được. Có `armor > 0`
  thì đếm ĐIỂM, hai hệ chạy song song và món nào dùng hệ nào là do asset khai.
  ⚠ **Món có `armor` PHẢI được cấp hitbox** (`Equip` xét `blocksHits || armor > 0`): thiếu
  hitbox thì mọi đòn rơi về slot THÂN — bắn vỡ đầu vẫn trừ giáp ngực và cái nón không bao giờ
  văng được. Đòn không rõ chỗ trúng (vụ nổ) thì THÂN hứng, cố ý vậy.
  ⚠ **`Destroy` CỦA UNITY HOÃN TỚI CUỐI FRAME — TẮT TRƯỚC, HUỶ SAU.** `DropSlot` gỡ
  `EquipmentStabilizer` bằng `Destroy`, nhưng component đó khai `[DefaultExecutionOrder(50)]`
  và mỗi `LateUpdate` GHI THẲNG `transform.position` = vị trí xương. `DropSlot` chạy trong
  `TakeDamage` (pha Update), nên LateUpdate ngay sau đó vẫn sống và kéo món đồ về chỗ cũ trên
  người — xung lực vừa cộng bị xoá sạch, đúng triệu chứng *"hết giáp mà nón không văng ra"*.
  Đòn đó GIẾT LUÔN nhân vật thì tệ hơn: `EnableRagdoll` tháo xương sang group `Ragdoll` rồi
  tắt group `Sprite`, cái stabilizer còn sống ghi món đồ tới chỗ khúc xương vừa bị dời —
  *biến mất khỏi tầm mắt*. `enabled = false` có hiệu lực NGAY, `Destroy` thì không.
  ⚠ **`DropSlot` phải `SetActive(true)`** như `StickmanWeaponHolder.DropCurrentWeapon`: slot
  có thể đang bị `SetSlotVisible` tắt (luật MỘT KHIÊN). Rớt một GameObject đang tắt thì nó vừa
  vô hình vừa KHÔNG chạy `DroppedItem.Update` — không rơi, không mờ, không dọn, nằm nguyên
  tại chỗ mãi mãi mà mắt không thấy gì.
- ⚠⚠ **GIÁP NEO THEO VAI, KHÔNG NEO THEO TÂM THÂN** (`StickmanRigMetrics.ArmorAnchorY` =
  `shoulderOffset − (0.5 − ArmorArmholeFromTop) × ArmorHeight`; user chốt 2026-09-03: *"cổ tay /
  ống tay của giáp phải ở ngay cánh tay"*). Đo trên rig: hông (`body_2`) ở 0.306, **vai
  (gốc `armR`, treo dưới `boneHead`) ở 0.481** — thân chỉ dài 0.175 trong khi giáp cao 0.368
  (phủ cả đùi, có chủ ý). Neo cũ `bodyCenterOffset × 0.9` đặt TÂM giáp vào tâm thân nên
  lỗ tay tụt xuống dưới vai **0.048** — cánh tay mọc ra từ giữa ngực giáp, không lỗi nào báo.
  Neo theo vai thì giáp cao bao nhiêu lỗ tay vẫn đúng chỗ. `shoulderOffset` ĐO từ prefab
  (`Measure()`), fallback 0.1746 = `boneHead` local 0.6982 × 0.25.
  · Cái giá: mép trên giáp chồng lên đáy đầu ~0.07, mà giáp (`BodyGear`) và đầu (`Head`)
    **cùng bậc 6** → `StickmanEquipment.Equip` đẩy slot Body ra sau bằng `BehindZNudge`
    (cổ áo khuất sau đầu là đúng giải phẫu; đầu chìm sau cổ áo thì không). Đây là chủ thứ
    tư của bậc 6 — xem 2h-sort.
  · `ArmorArmholeFromTop` = 0.18 là tỉ lệ ĐO trên bộ art 15 nền (art vẽ theo giải phẫu
    người thật, vai ngay dưới cổ áo). Art mới vẽ lỗ tay chỗ khác thì đổi số này, đừng
    đổi neo.
- **GIÁP PHỦ GẦN TRỌN THÂN** (`StickmanRigMetrics.ArmorHeight` = `bodyHalfHeight × 2 ×
  ArmorTorsoCoverage`, 0.92). ⚠ Số cũ là `bodyHalfHeight * 1.1f` — nhân với **NỬA** chiều cao
  thân nên giáp chỉ phủ **55%**, co lại quanh bụng và chừa nguyên khúc cổ + ngực ĐEN TRƠN
  phía trên: đúng triệu chứng *"giáp vẽ ngắn hơn body"*. Không lỗi nào báo vì cái tên
  `bodyHalfHeight` đọc thoáng qua vẫn xuôi. Con số này có **MỘT CHỦ** — hai builder (15 nền
  văn minh, bộ chung) đều gọi `ArmorHeight`, gõ tay hai chỗ là hai bộ giáp dài ngắn khác nhau
  trên cùng một cái thân.
  ⚠ **Fit theo CHIỀU CAO thì TỈ LỆ tấm art quyết định bề rộng.** Bộ code-gen là 57×71 (rộng
  ≈ 0.8 × cao) nên ra bộ giáp cân đối; `Armor_Japan` là art thật vẽ NGHIÊNG 3/4, phần vẽ được
  98×252 (0.39) nên cùng công thức ra một dải giáp hẹp bằng nửa cái đầu. Art sai tỉ lệ thì
  phải VẼ LẠI, đừng đi chữa công thức — chữa công thức là 14 nền kia hỏng theo.
- **GIÁP NÉN NGANG PHẢI GIỮ ĐÚNG TÂM DỌC**: `ArmorScale` cố ý trả `Vector2` vì giáp chỉ
  được nén theo X. Khi bù canvas trong suốt, dùng `OpaqueCenterOffset(sprite, scale, ...)`,
  không lấy `scale.x` cho cả hai trục: lấy X cho Y kéo phần vẽ lệch khỏi neo vai, đáy giáp
  hở/lòi thân sau dù chiều cao đã đo đúng. Builder phải bake lại offset cấp sau khi đổi phép
  đo này; `StickmanRigMetrics.TryMeasureArmorCoverage` là phép đo dùng chung (rộng, cao,
  tâm, mép trên/dưới), không nhân bản công thức ở từng tool. Chạy `Civilizations/9` để bake,
  rồi chạy `Civilizations/8` — smoke chỉ kiểm tra và FAIL khi sai, không tự bake che mất hồi quy.
- **ĐÁNH RỚT THÌ RƠI NGAY DƯỚI CHÂN, ĐỪNG NÉM ĐI** (`EquipmentDefinition.DefaultKnockImpulse`
  = **1.2**). Vật rớt có mass 1 nên số này chính là vận tốc (unit/s) và hướng gần như NGANG
  (lấy theo hướng đòn). Số cũ **3** ném cái nón đi ~1.09 unit ≈ **1.5 lần chiều cao nhân vật**,
  chưa kể pha LĂN sau đó — nhìn ra "nón bay vèo sang tận đầu kia", và người chơi không nhặt
  lại được. ⚠ `blockKnockImpulse` là field SERIALIZED: 15 nền + bộ chung đã bake số 3 vào
  asset, nên đổi mặc định trong code KHÔNG cứu được — hai builder phải GHI THẲNG
  `EquipmentDefinition.DefaultKnockImpulse` (đúng bẫy "sửa bug bằng đổi mặc định").
- **GIÁP DÀY = ĐI CHẬM** (`EquipmentDefinition.weight` → `StickmanEquipment.EncumbranceFor`).
  Đây là CÁI GIÁ của giáp, không có nó thì mặc giáp là lời tuyệt đối. Giảm theo hàm mũ
  (mỗi đơn vị nặng lấy **4%** phần CÒN LẠI) + sàn **82%** — hàm tuyến tính thì chồng đủ đồ là
  đứng yên tại chỗ.
  ⚠ **Số cũ (11% / sàn 62%) CHÊNH QUÁ XA**: tinh nhuệ chậm hơn dân binh gần một nửa, nhìn ra
  cảnh ông mặc giáp lê chân như lội bùn còn ông cởi trần phóng như tên — cái giá lớn tới mức
  trận nào cũng chỉ còn một lựa chọn. Nay dân binh 100% · chính quy 96% · tinh nhuệ 82%.
  ⚠ Hệ số này để **RIÊNG** (`Locomotion.SetEncumbrance`), KHÔNG dùng chung ô với hệ số vật
  cưỡi (`SetSpeedMultiplier`): hai chủ khác nhau cùng ghi một biến là mặc giáp xong con ngựa
  hết nhanh, hoặc lên ngựa xong bộ giáp hết nặng.
- **CẤP LÍNH quyết định được mặc gì** (`UnitRank` trên `UnitLoadout`):
  `Levy` dân binh — đầu trần, không giáp, **100% tốc độ** ·
  `Regular` chính quy — có nón, 89% ·
  `Elite` tinh nhuệ — nón + giáp, 9 điểm giáp nhưng chỉ **62% tốc độ**.
  Cấp SUY RA TỪ VAI TRÒ trong `UnitSpec.DefaultRank` (kỵ binh + lính khiên = Elite · cận chiến
  = Regular · **tầm xa = Levy**), khai rõ chỉ khi muốn phá luật. Vế "tầm xa không giáp" là vế
  cân bằng quan trọng nhất: cho cung thủ mặc giáp là quay lại đúng cảnh *tầm xa áp chế tầm
  gần* đã phải đi sửa một lần.
  ⚠ **MỘT ĐẦU MỘT NÓN**: nón của `StickmanAppearance` là OVERLAY (không rớt được), nón của
  `StickmanEquipment` slot Head là nón THẬT (có giáp, văng ra được). Lính được phát nón thật
  thì phải TẮT overlay — không thì đội hai nón chồng KHÍT lên nhau nên nhìn vẫn như một cái,
  cho tới lúc nón thật bị đánh rớt và cái overlay **vẫn còn nguyên trên đầu**.
  Triệu chứng: *"vớt nón rồi mà vẫn thấy nón"*. Luật này phải áp ở **BA đường**, đã dính đủ
  ba (mỗi đường một lần):
  · `UnitLoadout.ApplyTo` — runtime, phát loadout;
  · `StickmanDemoBuilder.ApplyArchetypeShared` — EDITOR, dựng scene. Nó gọi `ApplyLoadout`
    (phát nón thật) rồi NGAY SAU ĐÓ ghi đè `_helmetIndex` của archetype, bật lại overlay;
  · `CivilizationDefinition.ApplyLookTo` — đổi vẻ ngoài GIỮA TRẬN (`CivilizationTeamAssigner`),
    chạy SAU loadout nên cũng bật lại overlay.
  Cách chốt: hỏi `StickmanEquipment.HasSlot(EquipmentSlot.Head)` (runtime) hoặc đọc
  `_startingEquipment` (editor) — đọc TRẠNG THÁI THẬT chứ đừng tin vào thứ tự gọi hàm.
  Bảng số giáp nằm ở `HelmetArmor/BodyArmor/HelmetWeight/BodyWeight` trong
  `StickmanCivilizationBuilder` — nguồn sự thật duy nhất.
- **Loot tuỳ ý** (coin, máu...): `LootDropper` — bảng prefab + tỉ lệ, nghe event `Died`.
- **MỌI ĐỒ RƠI TỰ DỌN**: nằm một lúc → **mờ dần** → biến mất (`DroppedItem._despawnTime`
  + `_fadeTime`). Hạn: vũ khí 25s (`StickmanWeaponHolder._dropLifetime`), trang bị 20s
  (`EquipmentDefinition.droppedDespawnTime`), loot 20s (`LootDropper._despawnTime`).
  **Bắt đầu mờ là TẮT COLLIDER → không nhặt được nữa** — cho nhặt thì vừa bấm xong đồ tan
  trong tay. Vũ khí ĐẶT SẴN trong scene (giá vũ khí ở Demo_1/Demo_7) để `-1` = nằm mãi,
  đừng đổi kẻo hỏng bài test.
- Nền vật lý chung: `DroppedItem.MakeDropped(go, impulse, despawn, rest)` — tự thêm
  Rigidbody2D + collider theo sprite, chạm đất thì đóng băng (Static) để không bị đá văng
  lung tung.
  ⚠ **HAI KIỂU NẰM, chọn sai là nhìn ra ngay** (`DroppedItem.RestStyle`):
  · `FlatAlongX` (vũ khí) — xoay thẳng về 0°/180° lúc chạm đất, vì sprite vũ khí vẽ dọc trục
  +X nên "nằm ngang" mới ra dáng cây kiếm nằm trên đất;
  · `Tumble` (**nón · giáp · loot**) — nảy, **LĂN LÓC** một quãng rồi nằm nghiêng ở đâu thì
  nằm, KHÔNG ép góc. Nón/giáp không có "dáng nằm đúng" nào: ép về 0°/180° thì cái nón vừa bị
  đánh văng ra lại **đứng ngay ngắn như đang đội trên một cái đầu vô hình**.
  ⚠ **ĐẶT XUỐNG ĐẤT PHẢI ĐO ĐÁY CỦA PHẦN VẼ ĐƯỢC** (`Sprite.GetPhysicsShape` = biên alpha),
  KHÔNG đo `renderer.bounds`. Khung bao gồm cả viền trong suốt — mà nón/giáp của dự án chừa
  viền **12%–42%** (đúng con số ở luật đặt nón) nên đặt khung bao chạm đất là phần HÌNH nổi
  lên khỏi mặt đất đúng bằng cái viền rỗng đó: *"lăn lóc mà lơ lửng, không nằm trên mặt đất"*.
  Tệ hơn khi đang LĂN — khung bao của hình chữ nhật ĐANG XOAY phình to nhất ở 45°, nên mỗi
  vòng lăn lại nhấc món đồ lên hạ xuống, nhìn ra "không có trọng lực". Đây là họ hàng của luật
  `FitOpaqueWidth` ở mục đặt nón, chỉ khác là phải đọc được LÚC CHẠY (`GetPixels` đòi bật
  `isReadable`, còn biên alpha thì importer sinh sẵn).
  ⚠ Pha lăn phải **TỰ DÒ ĐẤT MỖI FRAME + tắt trọng lực**: collider của vật rớt là TRIGGER (để
  không chắn đường nhân vật) nên không có mặt đất vật lý nào để tì lên. Lăn khỏi mép đất thì
  trả trọng lực về cho nó rơi tiếp. Góc xoay đi theo QUÃNG LĂN (`v = ω·r`) chứ không phải một
  tốc độ xoay cố định — không thì nhìn ra "vừa trượt vừa quay tại chỗ".


---

## ⚠⚠ "KHIÊN BAY RA RỒI MÀ TAY VẪN CẦM KHIÊN" — MỘT NGƯỜI HAI KHIÊN (2026-09-14)

User: *"khi AI bị đánh rớt khiên, thì cái khiên bay ra rồi, nhưng trên tay thấy vẫn cầm khiên"*.

Dự án có HAI hệ khiên (`StickmanWeaponHolder.ShieldOnNearHand` ghi rõ): khiên **CẦM TAY**
(`ShieldWeapon`, có độ bền, tự hồi) và khiên **TRANG BỊ** (`EquipmentSlot.Shield`, đỡ đủ số đòn
rồi RỚT). Luật MỘT KHIÊN (`SyncEquipmentShield`) ẩn cái trang bị đi khi tay đang cầm cái kia —
nên mắt chỉ thấy một cái, và không ai nhận ra roster đang phát **cả hai cho cùng một lính**:
`StickmanCivilizationBuilder` vừa nhét `Equip_*_Shield` vào `equipment` vừa bật `carriesShield`
(đo 2026-09-14: **20+ loadout**, đủ mọi nền văn minh).

Hỏng ở đâu: lúc khiên CẦM TAY rớt (`DropOffHandShield`, chết hoặc bị tước), `RefreshHandLayout`
chạy lại, `_offHandShield` đã null ⇒ luật MỘT KHIÊN **bật cái trang bị lên** — một cái khiên mới
hiện ra trên tay đúng lúc cái cũ đang bay đi. Cả hai đều là khiên hợp lệ nên không lỗi nào báo.

Ba vế đã sửa:

1. `SyncEquipmentShield` hỏi **ĐÃ TỪNG CẦM KHIÊN TAY CHƯA** (`_shieldGranted && _shieldEverEquipped`),
   không hỏi "đang cầm không" — ai đã giơ khiên tay một lần thì khiên trang bị ẩn suốt đời: mất
   khiên là mất hẳn. ⚠ Không dùng riêng `_shieldGranted`: hồ sơ có thể bật `carriesShield` mà kho
   vũ khí đã bị thể loại lọc mất cây khiên — người đó ra trận không có khiên nào cả.
2. Slot đang ẩn **KHÔNG còn trong trận**: `CanBlock` · `AbsorbDamage` · `FirstArmoredSlot` ·
   `ProtectiveSlotCoversPoint` đều hỏi `IsSlotVisible` trước. Bản cũ không hỏi ở đâu cả — mọi
   cổng đều để ngỏ cho một món VÔ HÌNH đỡ đòn rồi văng ra (đòn không kèm collider dò theo
   `renderer.bounds`, còn giáp thì `FirstArmoredSlot` trả về slot ẩn khi thân không mặc giáp).
   ⚠ `renderer.enabled` KHÔNG bắt được: `SetSlotVisible` tắt cả GameObject.
3. Phép đo: Doctor › «Rớt đồ & ô nhặt» đếm loadout phát hai khiên và nêu tên — dọn ở
   `StickmanCivilizationBuilder` là hết hẳn (hiện mới chỉ vô hại, vẫn cộng sức nặng).

## ⚠⚠ SÂN 3/4: ĐỒ RỚT PHẢI HẠ VỀ CHÂN, KHÔNG THÌ KHÔNG AI NHẶT ĐƯỢC (2026-09-14)

User: *"trong chế độ 3/4 khi đi ngang qua vũ khí không hiện tooltip nhặt vũ khí"*. BA thủ phạm
độc lập, cùng cho một triệu chứng:

**① Ô nhặt bám nhầm người (thủ phạm chính, đo được).** `PlayerCharacter.Changed` chỉ bắn MỘT LẦN
(lúc thân người chơi bật lên). Map SINH LÚC CHẠY gắn ô nhặt trong `MapAssembler.EnsurePlayerPrompts`
— tức SAU đó — nên ô đăng ký vào một sự kiện không bao giờ bắn lại nữa, rồi `Awake` lấy tạm
`FindAnyObjectByType<StickmanFighterController>()` và bám vào **một NPC bất kỳ** (sân đo được 42
lính) tới hết ván. Sửa: nghe xong thì hỏi luôn `PlayerCharacter.Current` (đúng khuôn
`StickmanScreenFx`). Luật chung: **ai nghe `Changed` thì phải bắt kịp `Current`** — Doctor soi chữ
trong mã nguồn, và ngay lượt chạy đầu nó bắt thêm **5 lớp khác** cùng lỗi: `StickmanDemoHud`
(thanh máu bám NPC), `DemoCameraFollow`, `CivilizationTeamAssigner`, `ArenaMode`,
`ChampionshipCupMode` — đã vá cùng đợt. Smoke Play đo `BoundPlayer == người chơi` (25/25 map 3/4 xanh sau khi sửa).

**② Ô chộp `Camera.main` một lần — bẫy chờ.** `_camera` null thì `OnGUI` thoát ở dòng đầu: dò mục
tiêu vẫn chạy, nút cảm ứng vẫn sáng, chỉ cái chữ là không hiện. Scene dựng sẵn có máy quay từ lúc
nạp nên `Awake` bắt được; nhưng sân nào dựng máy quay SAU (harness smoke mở scene RỖNG là ví dụ đo
được — `MapAssembler.SetupCamera` chỉ chỉnh cái sẵn có, không tạo mới) thì ô câm vĩnh viễn.
`StickmanMountPrompt` dò lại mỗi nhịp từ trước; nay `StickmanPickupPrompt` và `ShipHelmPrompt` cũng
vậy, và Doctor canh mọi lớp `*Prompt*`.

**③ Món đồ nằm ở CHIỀU SÂU của bàn tay.** Vũ khí rời tay ở chỗ bàn tay, cao hơn chân ~0.45. Sân
ngang: trọng lực kéo về đất. Sân 3/4: trọng lực = 0 và trục Y là CHIỀU SÂU, nên nó nằm lại lơ
lửng phía sau lưng người ngã — cộng cú hất `+ Vector2.up * 0.6` × xung lực 2.5 thì trôi hơn MỘT
đơn vị, xa hơn cả tầm nhặt (`WeaponPickup` 0.6 · ô gợi ý 0.9). Nhìn vào: đứng đè lên hình mà
không có gợi ý nào.

Sửa: `DroppedItem.PrepareGroundDrop(item, feetCủaChủ, ref impulse)` — hạ điểm xuất phát về chân
+ kẹp xung lực (`GroundImpulseCeiling` 1.2 ⇒ trượt ~0.25). Một phễu cho MỌI đường rớt; trước đây
chỉ `StickmanEquipment.DropSlot` biết luật này, đường rớt vũ khí thì không.

Phép đo: Doctor › «Rớt đồ & ô nhặt» (nối dây + chữ trong mã nguồn: ai nghe `Changed` phải hỏi
`Current`, ô ngữ cảnh phải dò lại `Camera.main`, ba đường rớt phải qua `PrepareGroundDrop`) và
smoke Play `CheckPlayerPrompts` — nay kiểm cả **ô đang bám ai** và **có vẽ ra được không**,
không chỉ "có component hay không".

## ⚠⚠ ĐỒ ĐEO LƯNG / GIÁP THÂN BỊ "NGƯỢC" KHI QUAY MẶT — SOI GƯƠNG THIẾU MỘT NỬA (2026-09-05)

`EquipmentStabilizer.Apply` ở nhánh `followBoneLean` (slot `Body` + `Back`) đặt vị trí bằng
`anchor + lean * offset` trong **toạ độ THẾ GIỚI** — tức offset KHÔNG đi qua phép lật gương
`localScale.x = -1` của nhóm `Sprite`. Thành phần `x` đã được nhân `flip`, nhưng phép **XOAY**
thì chưa: quay mặt sang trái, thân ngả một đằng còn cái offset xoay một nẻo.

Đo trên GIỎ MÂY của nông dân (offset ≈ `(∓0.15, +0.28)`, thân ngả ~18° lúc đi): giỏ lẽ ra nằm
ở `x = +0.23` sau lưng thì rơi về `x = +0.06` — **trượt vào giữa thân**. Đó là câu *"cái giỏ
sau lưng bị ngược khi đi từ trái sang phải"*, và không có lỗi nào báo. Giáp thân cũng dính,
chỉ là offset của nó nhỏ nên nhìn ra là "giáp hơi lệch".

Chốt: **soi gương GÓC cho phần VỊ TRÍ** khi `flip < 0` (`Quaternion.Euler(0,0,-leanAngle)`).
Phần `transform.rotation` GIỮ NGUYÊN `lean` — món đồ nằm trong cùng nhóm bị lật với xương nên
phép lật áp cho cả hai như nhau, sửa cả hai vế là lại sai theo chiều ngược lại.

⚠ Bài học chung: một offset tính trong KHÔNG GIAN NHÂN VẬT mà đem cộng vào toạ độ THẾ GIỚI thì
phải soi gương **cả hướng lẫn phép xoay**, không chỉ dấu của `x`.

---

## ⚠⚠ NÓN GIỮ THẲNG PHẢI SOI RIÊNG SPRITE (2026-09-11)

Mọi art đầu vẽ mặt sang **+X**. `EquipmentStabilizer` đặt `rotation = identity` để nón không
xoay theo xương đầu, nhưng world rotation đó không mang theo scale âm của nhóm `Sprite`. Kết
quả là nhân vật quay một hướng mà nón vẫn hiện chiều kia: vành/lỗ mắt cắt vào mặt, đuôi nón ra
phía trước; người xem thường tưởng là sai offset hoặc sai cỡ.

Chốt: sau khi ghim rotation, dùng `TransformVector(Vector3.right)` để đo **chiều vẽ thực tế**
(API direction/rotation không đo được scale âm), rồi `SpriteRenderer.flipX` sao cho +X trùng
hướng `_flipRoot`. Inspector `Mặc thử` phải gọi cùng `EquipmentStabilizer.AlignSpriteWithFacing`,
nếu không preview đúng mà Play sai. `StickmanHelmetFitTool` bake lại cỡ/neo từng cấp từ vành
hoặc `.headanchor.json`; `StickmanDoctor` mục «Nón giữ thẳng vẫn đúng chiều · cỡ · điểm neo»
kiểm hai đường và tất cả `EquipmentDefinition` slot Head; `StickmanEquipmentRosterSmoke`
phải chạy đủ nón/giáp, cấp 1–5, hai hướng trong `Demo_37_CivRoster` trước khi bàn giao.

⚠ **Mọi `Helm_*.png` phải có `.headanchor.json`** (kể cả placeholder, WWII, overlay
`Heads/Helmets`). Thiếu là rơi về `ScanBrim`: art có đuôi khăn/tấm che tai thì hàng rộng nhất
lệch tâm ⇒ nón trôi khỏi đầu (2026-09-11, `Helm_Mongol_Cap` + 51 tấm khác). Neo cho art không
có lỗ khoét: `stickman-assets/scripts/helm_anchor_nofid.py` (hình học) hoặc
`helm_anchor_handtune.py` (bảng chỉnh tay, soi render), rồi `sync_helm_anchor_assets.py`;
Doctor mục trên đã báo Warn «thiếu neo đầu» — không được để nó vàng.

⚠⚠ **Soát nón phải soát BẢN CẤP, không phải bản gốc.** `SpriteForTier(1..5)` luôn trả
`<nền>/TierN/Helm_<nền>.png`; bản gốc chỉ hiện khi `tierSprites` rỗng. Bộ art cấp 2026-09-10 là
145 nón KHÁC NHAU vẽ mặt sang −X (đội ngược khi nhân vật quay phải) — lỗi *"nón bị ngược"* nằm
ở đây, không ở `EquipmentStabilizer`. Sửa bằng `helm_tier_fix.py` (soi gương một lần theo sổ
`helm_tier_mirror.done`, sidecar riêng từng cấp, `tierScales = 100/d_i`, `tierOffsets = 0`).
Art mới theo cấp phải vẽ mặt sang +X và đi qua script này trước khi bàn giao.
⚠⚠⚠ **VÌ SAO NÓN "SAI HOÀI" TRONG KHI SMOKE PASS (gốc rễ, chốt 2026-09-12):** smoke và
Doctor trước đây chỉ kiểm **số trên asset KHỚP CÔNG THỨC suy từ neo** — tức TÍNH TỰ NHẤT QUÁN.
Neo đầu sai thì mọi số vẫn khớp răm rắp, smoke PASS 1710/1710 mà người chơi vẫn thấy nón hở.
Nay có **cổng HÌNH HỌC** đo thẳng pixel (`StickmanRigMetrics.TryMeasureHeadExposure`, một nguồn
đo cho cả Doctor lẫn smoke): đĩa đầu (cỡ NHÌN THẤY = 1.04× số đo — sprite đầu to hơn collider)
đặt vào neo, cung đỉnh-sọ→gáy hở >8% là FAIL, 3.5–8% là Warn; mặt hở không gate (mũ lưỡi trai
hở mặt 38% là đúng). Đồ đội HỞ ĐẦU CÓ CHỦ Ý (trâm Nga Mi, khăn Thiếu Lâm…) khai ở
`StickmanRigMetrics.OpenHeadwearSprites` — xoá tên là cổng đỏ lại ngay. Pivot VŨ KHÍ cũng có
cổng riêng trong Doctor: pivot (chỗ tay cầm) phải nằm TRONG phần vẽ của sprite trên prefab —
đã bắt 3 cây kích lệch 10–14 px khiến tay nắm vào khoảng trống.

⚠⚠ **Chấm điểm rồi mới sửa**: `helm_tier_fix.estimate` đo chỗ đặt cơ bản trước; đạt ngưỡng
(hở chỏm/gáy ≤3%, hở đầu ≤15%) thì GIỮ NGUYÊN. Sửa hàng loạt một tập mà phần lớn đã đúng là
làm hỏng cái đang chạy tốt — đã mắc ba lần trong một phiên.
Chỗ đặt đầu trong nón **đo từng tấm** (quét FFT, hở ít nhất, phạt nặng chỗ hở ở chỏm/gáy), không
dùng một hằng số nhích cho cả bộ — nhích cả bộ thì chỏm kín nhưng đầu thò ra trước-dưới, đọc ra
là *"nón bị cắt phía trước"*. Đầu VẼ RA to hơn bán kính đo 4% (`m_Size 1.04` vs `radius 0.5`).
Chỉnh MỘT tấm bằng mắt: Bảng điều khiển › «Chỉnh neo nón BẰNG TAY» (`StickmanHelmetAnchorTuner`)
— chọn định nghĩa + cấp, nhích bằng mũi tên, Lưu (ghi sidecar → chấm pivot → `Rebake`). Không
sửa `localScale`/`tierOffsets` bằng tay trên asset: `Rebake` sẽ ghi đè lại từ neo.

### NÓN HAI LỚP — KHÔNG CROP PIXEL, KHÔNG ĐỂ MẶT SAU CHE ĐẦU (2026-09-12)

Nón văn minh được bake thành hai sprite song song trong `EquipmentDefinition`: `headFrontSprite`
ở `StickmanSorting.HeadGear = 8` và `headBackSprite` ở `StickmanSorting.HeadBack = 5`.
Đầu rig giữ order 6, nên thứ tự bất biến là **mặt ngoài → đầu → mặt sau**. Root `Equip_Head`
vẫn giữ renderer mặt ngoài, `EquipmentStabilizer`, collider và hitbox cũ; `HeadBack` chỉ là
child renderer để không phá gameplay/hệ rơi đồ. `EquipmentStabilizer` soi `flipX` cho cả hai
renderer khi nhân vật quay trái/phải.

`StickmanHelmetLayerTool.BakeAll` đọc PNG nguồn bằng `LoadImage`. PNG hiện có là một mặt phẳng,
không chứa depth mask, nên tool **giữ MỌI pixel nguồn ở `HeadFront`**; lưỡi liềm hẹp sau gáy
(`−0.50 × bán-kính` theo −X) chỉ được **chép thêm** vào `HeadBack`. Tuyệt đối không chuyển hay
xóa pixel khỏi `HeadFront`: dù renderer đúng `8 > 6 > 5`, alpha rỗng giữa Front/Back sẽ lộ đầu
đen thành một lỗ lõm và nhìn như nón bị cắt. Muốn có mặt sau nhìn thấy thật phải có art hai lớp
do hoạ sĩ khai riêng, không thể suy ra từ PNG một lớp. Tool ghi lại `sourceOpaque`, `frontOpaque`,
`backOpaque` và chỉ nhận khi `frontOpaque == sourceOpaque`; không được crop/trim theo bounds alpha.
Các lớp đi cùng canvas, PPU và pivot nguồn nên không làm nón nhích hoặc co lại.

Sau khi thay PNG/sidecar: chạy **11. Tách lớp nón: mặt ngoài · đầu · mặt sau**, rồi **10. Đo lại
cỡ · chỗ đặt nón**, sau đó **8. Smoke trang bị roster**. Smoke phải thấy đủ hai renderer và
đúng order ở cả 5 cấp × 2 hướng; Doctor chỉ báo thiếu lớp cho `EquipmentDefinition` văn minh.

---

## ⚠⚠ HAI CHỦ CÙNG GHI `GearTier` — `UnitRankGear.PinTier` (2026-09-05)

`UnitRankGear.LateUpdate` ghi `SetGearTier(cấp AI)` **MỖI FRAME** khi cấp AI ≥ 0. Nghĩa là bất
kỳ tầng nào khác đặt `GearTier` cũng bị xoá ngay nhịp sau, **âm thầm**.

Đã dính thật ở MODE KINH TẾ DOANH TRẠI: người chơi nâng nhà chính lên cấp 3, `TeamEconomy` đặt
bộ đồ theo cấp nhà, và mọi lính vẫn mặc y cấp 1 vì `Playbook_WarCamp` khai `smarts = 1`. Người
dùng đọc ra: *"nâng nhà mà lính không thấy có cấp độ gì"*.

Chốt: `UnitRankGear.PinTier(tier)` — ghim thì THẮNG cấp AI; `PinTier(-1)` trả quyền lại.
**Không** chữa bằng cách bỏ quyền của cấp AI: ở AI Lab thì *"đổi cấp AI phải thấy đổi bộ đồ"*
mới là hành vi đúng. Hai chủ, và **người ghim nói lời cuối** — ghim là quyết định CÓ CHỦ Ý của
màn, còn cấp AI là mặc định.

## ⚠⚠ CẤP NHÀ → TIER PHẢI CỘNG MỘT, KHÔNG DÙNG THẲNG

Nhà chính bắt đầu ở cấp **0**, mà `GearTiers` cấp 0 nghĩa là **ĐẦU TRẦN · THÂN TRẦN · gậy
gộc**. Dùng thẳng cấp nhà làm tier thì suốt cả đoạn đầu ván (phần lớn thời gian chơi) mọi lính
mua ra bị CỞI SẠCH nón/giáp của nền văn minh — và người dùng báo hai câu cùng lúc: *"lính mua
không theo nền văn minh"* và *"nâng nhà chả thấy lính đổi gì"*. Cả hai là CÙNG một dòng code.

`TeamEconomy.RecruitTier = houseLevel + 1`: cấp nhà 0 = tier 1 (bộ THƯỜNG của nền, giống đồng
đội), rồi 1→2, 2→3, 3→4. Bốn bậc nhìn ra được, không bậc nào là "cởi đồ".

⚠ Nâng nhà phải áp cấp cho **quân đang sống** (`RetierLivingTroops`), không chỉ lính mua sau:
trả 60 vàng mà cả đội trên sân không đổi một sợi thì vẫn là "nâng nhà chẳng thấy gì".
⚠ Nhưng CHỈ cộng máu ở đường SINH LÍNH (`addHealth`), không cộng lại mỗi lần nâng — không thì
một anh lính sống qua ba lần nâng có nhiều máu hơn hẳn lính mua mới cùng cấp, mà không có gì
trên màn hình nói vì sao.
