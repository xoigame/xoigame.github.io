## Thay sprite / skin / effect / âm thanh

### Quy tắc mới — giáp WWII / tunic nhìn ngang (2026-09-11)

Giáp WWII là **một thân áo/tunic liền** nhìn ngang, hướng mặt +X. Silhouette phải có dáng áo
tham khảo trung cổ (ngực hơi cong, vai dốc liền thân, cổ áo nhỏ, eo/đai và tà áo cong), không
phải hình hộp cứng. Cấm tuyệt đối cầu vai rời, tay áo/ống tay, bao tay, cổ tay, bàn tay, lỗ
nách/armhole opening và mọi khoảng khoét. Cánh tay vẫn do rig + IK điều khiển; sprite thân chỉ
được cung cấp phần torso kín. Prompt/art intake dùng câu:
`solid torso-only tunic, strict side view facing +X, no shoulder pads, no sleeves, no armholes or armpit openings, no gauntlets, no wrists, no hands`.
Quy tắc này áp cho mọi nền mới, đặc biệt `WWII_USA`, `WWII_UK`, `WWII_USSR`, `WWII_Germany`,
`WWII_Japan`; giữ nón/vũ khí và animation dùng chung, không sửa rig.

> **2026-09-09 — hệ thứ tư: NGOẠI HÌNH (`StickmanLook`).** Thân màu · tay chân dày · dáng đầu ·
> tóc mới · mặt · áo · sau lưng · đuôi, bốc theo thời kỳ, chủng Fantasy có hồ sơ riêng. Câu
> *"thân + đầu luôn đen"* dưới đây nay là MẶC ĐỊNH (hồ sơ `Plain`), không còn là cấm — luật đầy
> đủ ở [CharacterLook.md](CharacterLook.md). Tóc cũ (`decos`) tự tắt khi có tóc mới; nón overlay
> vẫn của hệ này.

- **Nhân vật — cả bộ**: `StickmanSkinSet` + `StickmanSkinBinder` (đổi 1 asset là đổi cả bộ hình).
  Sprite rig phải đúng SỐ LƯỢNG + THỨ TỰ bone (xem "Hai sự thật kỹ thuật").
- **Nhân vật — TỪNG BỘ PHẬN** (shop bán đầu/thân/tay/chân rời): `CosmeticPart` (asset,
  Create > Stickman > Cosmetic Part) + `StickmanCosmetics` (component giữ trạng thái đang mặc).
  Binder xếp **3 lớp, lớp sau đè lớp trước**: mặc định (sprite gốc, ghi nhớ lúc Rebuild
  Bindings) → SkinSet (cả bộ) → ghi đè lẻ (`SetPart`). Nhờ lớp 1 mà `ResetPart` trả được
  đúng một bộ phận về gốc. 10 khoá chuẩn trong `StickmanPartKeys`; một khoá ăn cả part
  sống lẫn part `*Ragdoll` nên chết vẫn đúng hình. Bán theo bộ (`CosmeticGroup.Arms/Legs`)
  = 1 asset đổi cả 4 bộ phận. Dựng bằng `Tools > Stickman > Cosmetics`
  (`Add SkinBinder to Selected` → `Create Default Parts` → `Validate All Parts`).
  **Không đụng anim/logic**: clip chỉ animate IK target + góc `body_1`, còn combat/AI/ragdoll
  đọc bone transform + collider — không cái nào đọc sprite. Ràng buộc duy nhất vẫn là SỐ BONE.
  Hệ này THAY hình bộ phận, khác `StickmanEquipment` (ĐẮP thêm nón/giáp/khiên lên trên) và
  khác `StickmanAppearance` (overlay tóc/râu + nón trên đầu) — ba hệ chồng lên nhau được.
- **Trang trí đầu + nón (tóc, râu, nón hiệp sĩ/viking...)**: hệ `StickmanAppearance` +
  `StickmanAppearanceSet` — OVERLAY vẽ đè lên đầu đen, KHÔNG đụng SpriteSkin nên PNG nào
  cũng dùng được ngay, không cần rig. Thả PNG vào `Assets/Sprites/Heads/Decos|Helmets` →
  `Tools > Stickman > Appearance > 2. Build Appearance Set` là xong; index -1 = random mỗi
  lần spawn (mỗi lính một mặt một nón). Scale/offset tool tự đo từ RigMetrics.
  Bậc vẽ: tóc/râu 7, nón 8 (nón trùng bậc cẳng tay gần — chỉ chồng khi giơ tay quá đầu, chấp nhận).
  ⚠ **KHÔNG CÒN LỚP "MẶT" cho lính thường.** Vẽ nguyên khuôn mặt người lên đầu stickman là
  bỏ mất chất của dự án (thân + đầu LUÔN ĐEN), và nó biến mất lúc chết để lại một cục đen —
  hai lỗi cùng một nguyên nhân: cái mặt THAY cái đầu chứ không ĐẮP THÊM vào. Nay là TÓC/RÂU
  (`decos[]`), có xác suất KHÔNG CÓ (`decoChance`, mặc định 0.7) vì cả tiểu đội cùng có tóc
  thì tóc thành đồng phục, không còn phân biệt được ai với ai.
  ⚠ **Bộ zombie / ninja KHÔNG đổi gì**: cái mặt của chúng giờ là "món trang trí" duy nhất
  trong bộ riêng, đặt thẳng `decoIndex = 0` — không nhánh code riêng, không bốc trượt.
  ⚠ **HAI KHỔ CANVAS, đừng chép hệ số qua lại**: mặt 64×68 (`FaceCanvasHeadRatio`) vs trang
  trí 96×104 (`DecoCanvasHeadRatio`) — trang trí cần lề rộng để gai tóc/chòm râu THÒ RA
  NGOÀI khối đầu, và chính cái thò ra đó mới làm nó đọc thành "tóc" chứ không thành "cái mũ".
  Chép `decoScale` của bộ chung sang bộ mặt là lệch cỡ đầu, không lỗi nào báo.
  ⚠ Ba scene thuỷ chiến đã BAKE object `AppearanceFace` vào file scene; `StickmanAppearance`
  tự dọn nó lúc dò rig — đổi tên lớp mà không dọn là cái mặt cũ nằm lại vĩnh viễn, không ai
  điều khiển và không theo xác.
- **NỀN VĂN MINH TRUNG CỔ** (Âu · Thập tự · Viking · Nhật · Trung Hoa · Ả Rập): chia phe
  bằng ĐỒ (nón + giáp + khiên + vũ khí đúng chất), KHÔNG nhuộm màu thân.
  **THÂN + ĐẦU LUÔN ĐEN** — `StickmanArchetype.bodyTint/limbTint` để TRẮNG (ApplyTint thoát
  sớm), builder truyền `NoTint` cho cả 9 archetype. Nhuộm thân làm mất chất stickman.
  Một nền = 1 asset `CivilizationDefinition` trỏ vào AppearanceSet + 2 EquipmentDefinition +
  **ĐỦ BỘ quân chủng** (`roster`, 6–9 `UnitLoadout` mỗi nền một cây vũ khí khác nhau —
  `LoadoutFor(role)` bốc ngẫu nhiên nên tuyến cận chiến ra đủ kiếm/rìu/chùy/thương/kích).
  **CHIA VŨ KHÍ = CHIA BÀI KHÔNG LẶP** (`LoadoutFor` + `ResetDealer`): bốc ngẫu nhiên độc lập
  từng lính thì có lúc ra cả tuyến toàn cung — xác suất nhỏ nhưng không bao giờ bằng 0.
  **KỴ BINH** (`MountDefinition` + `StickmanMount` + `StickmanHorse`): ×1.55 tốc độ, +3 máu.
  · **Ngựa có RIG IK 2D THẬT, đúng công nghệ của stickman**: mỗi chân là `LimbSolver2D` trên
  chuỗi `Upper → Lower → Foot`, code CHỈ dời 4 IK target (y hệt `StickmanLegWalker` dời IK
  chân người) — móng BÁM ĐẤT thật, không phải xoay sprite cho có. KHÔNG dùng SpriteSkin:
  SpriteSkin bind theo CHỈ SỐ nên sprite mới bắt buộc qua Skinning Editor, còn `LimbSolver2D`
  chỉ cần CHUỖI TRANSFORM nên sinh bằng code được.
  Art: `Horse_Body.png` (không chân, **pivot đặt ở CHỖ YÊN**) + `Horse_LegUpper/LegLower.png`
  (pivot ĐẦU TRÊN). Pha đi theo QUÃNG ĐƯỜNG (`TravelSpeed`, không phải `Velocity`),
  nước kiệu = hai chân CHÉO NHAU cùng pha, gối trước/sau gập NGƯỢC nhau (`LimbSolver2D.flip`).
  · **PIVOT TÍNH TỪ CHÂN NGỰA — chuỗi độ cao: đất → `legLength` → `withersHeight` (yên).**
  Khớp vai/hông đặt ở đúng `legLength` trên mặt đất để móng duỗi thẳng thì chạm `y = 0`.
  Và **NÂNG KỴ SĨ = `withersHeight − chiều cao HÔNG lúc đứng`**, KHÔNG phải `withersHeight`:
  ngồi lên yên là HÔNG nằm ở lưng ngựa, không phải BÀN CHÂN — nâng thẳng `withersHeight` là
  nhân vật ĐỨNG TRÊN YÊN, hông vọt cao hơn lưng ngựa nguyên một quãng bằng chiều cao hông của
  chính nó (đã dính 1 lần). Đo hông từ rig (`body_1` so với root vốn sát đất), đừng gõ số.
  Con ngựa phải hạ đúng QUÃNG NÂNG đó, không phải `withersHeight`.
  · **XƯƠNG NGỰA KHÔNG MANG SCALE, hình treo làm con riêng** — gắn SpriteRenderer thẳng lên
  khúc xương rồi co khúc xương cho vừa sprite là khúc dưới (con của khúc trên) ăn scale HAI
  LẦN, chân ngắn còn ~47%, `Limb.Solve` không với tới đích nên chân duỗi đơ và móng lơ lửng —
  nhìn y hệt "ngựa KHÔNG có IK" (đã dính 1 lần).
  · MỘT KHÚC chân phải dài **0.62 × legLength** — để đúng 0.5 là hai khúc vừa khít chiều cao
  khớp, GỐI KHÔNG CÒN CHỖ GẬP, `Limb.Solve` gặp đích ngoài tầm với là duỗi thẳng chân → móng
  lơ lửng ở hai đầu sải. Biên độ sải = `strideDistance / 4` (chống trượt chân, đúng công thức
  của `StickmanLegWalker`) và bị kẹp ≤ `0.73 × legLength`. **Cỡ thân co theo `bodyLength`**
  (mõm → đuôi), đừng suy ra từ chiều cao — suy gián tiếp là ra con ngựa bé bằng con lừa.
  · Bậc vẽ RIÊNG `MountFarLeg` 0 · `MountBody` 1 · `MountNearLeg` 2 — cả con ngựa dưới toàn
  bộ kỵ sĩ, KHÔNG trùng bậc nào của rig (trùng bậc = Unity xếp theo khoảng cách camera = đảo
  qua đảo lại tuỳ frame, đúng bẫy của cái nón).
  · **MỐC 0 LÀ MẶT ĐẤT, KHÔNG PHẢI GỐC TRANSFORM.** Gốc nhân vật nằm THẤP HƠN mặt đất `0.089`
  (`groundCollider` là hình TRÒN r=0.2 ở `Sprite`-local y=0.555, đáy nó mới là chỗ chạm đất:
  `0.555×0.25 − 0.2×0.25`). Đặt vật lên "mặt đất" mà lấy `transform.position.y` là chôn nó
  xuống ngần ấy — bằng gần 1/3 chiều dài chân ngựa nên nhìn ra ngay (đã dính 1 lần: móng lún,
  kỵ sĩ ngồi thấp hơn yên). Đo bằng `StickmanLocomotion.GroundOffset`, đừng gõ số.
  · **VẬT CƯỠI KHÔNG CHỈ CÓ NGỰA**: `StickmanHorse` dựng THÂN + 4 CHÂN IK từ 3 sprite và mấy
  con số — nó KHÔNG biết con vật đó là gì. Nên **lạc đà** (Ả Rập) và **voi chiến** (Đại Việt,
  Ấn Độ) chỉ là bộ sprite khác + bộ số khác, KHÔNG thêm dòng code chạy nào. Thêm loài = 4 hàm
  vẽ trong `WeaponArtGenerator` + 1 dòng trong mảng `Horses` (khai `art:` và `legRatio:`).
  Hai ràng buộc khi vẽ: **pivot thân = CHỖ YÊN**, và **bụng nằm dưới pivot đúng
  `W × (1 − legRatio) / bodyRatio` pixel** (chân trước/sau ở `pivotX ± 0.17/0.15 × W`).
  **Lưng cao thì đòi vũ khí dài** — `minMeleeReach = withersHeight × 1.3` tự loại đao ngắn
  khỏi lưng voi/lạc đà, đúng lý do lịch sử tượng binh cầm thương. Không viết điều kiện riêng.
  · **BỐN GIỐNG NGỰA** (`Horses` trong `StickmanCivilizationBuilder`, asset ra
  `Assets/Settings/Mounts/`): Ngựa chiến · Chiến mã nặng · Tuấn mã · Ngựa thảo nguyên. Cùng
  art, khác SỐ + MÀU nên cân bằng vẫn đo trên một thang chung. Mỗi nền văn minh một giống →
  hai phe khác nhau ngay ở CÁCH CHẠY, không chỉ ở bộ giáp.
  · **HỆ MÀU LÔNG — art phải vẽ THANG XÁM.** `SpriteRenderer.color` NHÂN vào sprite, art vẽ
  nâu sẵn thì tô gì cũng ra nâu × màu đó. Vẽ trắng thì tint chính là màu lông thật, phần tối
  (bụng/bờm/móng) giữ nguyên TỈ LỆ. `coatColors[]` bốc ngẫu nhiên mỗi con; `coatVariation`
  nhiễu theo hệ số NHÂN (cộng thì ngựa đen thành xám, ngựa trắng bị kẹp trần).
  **YÊN LÀ SPRITE RIÊNG** — vẽ chung là ngựa trắng ra yên trắng. `SetCoat` NHÂN chứ không GÁN,
  không thì mất luôn sắc tối 0.72 của chân xa.
  · **NGỰA CÓ MÁU RIÊNG** (`maxHealth` + `damageShare`): đòn trúng kỵ binh thì ngựa hứng một
  phần — đó là "giáp" của kỵ binh. Trừ vào BỂ MÁU SONG SONG (`OnOwnerDamaged`), KHÔNG chen vào
  `TakeDamage` (chỗ đã có khiên/thế thủ/trang bị tranh nhau). `bonusHealth` để **0**, không thì
  tính hai lần. **Ngựa gục mà kỵ sĩ còn sống → tụt xuống đất đánh tiếp.**
  · **NGÃ NGỰA bằng chính bộ IK, không ragdoll** (`StickmanHorse.PlayDeath`): kéo 4 IK target
  chụm vào gầm rồi hạ + nghiêng thân, chân tự gập theo. Ragdoll hoá là +5 RB +4 joint MỖI con.
  · **NGỰA MẤT CHỦ** (`RiderlessHorse`): kỵ sĩ ngã mà ngựa sống → tách khỏi xác, đi lang thang,
  ai cũng chém được, lính chưa có ngựa đi ngang là leo lên cưỡi.
  Kế thừa `StickmanController` (có máu) nhưng **KHÔNG gắn `TeamMember`** — thiếu TeamMember thì
  `AreEnemies` trả true cho mọi phe (ai cũng đánh được) mà `TeamMember.All` không chứa nó nên
  `FindNearestEnemy` không bao giờ đi săn nó. Collider để **TRIGGER**, đặc thì nó chắn lối và
  cả tiểu đội đứng lại đập vì `UpdateBlockedPath` coi mọi StickmanController-không-phải-người
  là vật cản. Phải **tự lật** (hết là con của nhóm `Sprite`) và phải **cắt nguồn tốc độ**
  (`DetachFromRider`) — không cắt thì nó đọc `TravelSpeed` của CÁI XÁC = 0, ngựa trượt đi mà
  chân đứng im.
  · **NGỰA LÀ CON CỦA NHÓM `Sprite`, KHÔNG PHẢI CỦA ROOT** — nhân vật quay đầu bằng
  `Sprite.localScale.x = -1`, treo vào root là ngựa nằm NGOÀI phép lật đó (quay trái thì kỵ sĩ
  nhìn một đằng ngựa nhìn một nẻo). Treo vào `Sprite` là nó soi gương theo, khỏi viết dòng xử
  lý lật nào; đổi lại phải HẠ NGƯỢC đúng `withersHeight` vì `Sprite` vừa được nâng lên ngần ấy.
  (`LimbSolver2D` chạy đúng qua scale âm vì nó giải bằng `InverseTransformPoint`/`localRotation`
  — hai thứ CÓ tính scale, khác `TransformDirection`; xem bẫy hình học số 4.)
  · Kỵ sĩ NGỒI qua `StickmanLegWalker.SetMounted` — component đó là chủ sở hữu duy nhất của
  IK chân, và lúc cưỡi nó KHOÁ `SetActionLegs` để động tác toàn thân không đè mất dáng ngồi.
  · KHÔNG nâng root: root sát đất nên hệ di chuyển không phải sửa gì; nhóm `Sprite`
  (rig + ragdoll + hitbox) được nâng lên `withersHeight` (= 62% chiều cao nhân vật, lưng ngựa
  ngang hông người). Chết thì TÁCH ngựa ra world TRƯỚC khi hạ `Sprite`, rồi `SetActive(true)`
  lại — `EnableRagdoll` tắt cả nhóm `Sprite` TRƯỚC khi bắn event `Died` nên quên bật là xác
  ngựa vô hình.
  ⚠ `UnitSpec.shield` (khiên trang bị) CHỈ đặt cho vũ khí MỘT TAY — 2 tay / song kiếm / cung
  mà đeo khiên là ra cảnh hai tay hai khiên.
  Quy ước folder: `Assets/Sprites/Civilizations/<Key>/` với tiền tố tên file
  `Face_*` · `Helm_*` · `Armor*` · `Shield*` (KHÔNG có Shield = văn minh không dùng khiên, VD Nhật).
  Thay art = thả PNG vào folder → `Tools > Stickman > Civilizations > 2` (tool tự đo scale).
  Bảng vũ khí từng nền = `Specs` trong `StickmanCivilizationBuilder.cs` (nguồn sự thật duy nhất).
  **SKIN VŨ KHÍ theo văn hoá** (`WeaponSkinSet`): thả `Weapon_<Loại>.png` vào folder của nền
  (tên sau `_` phải khớp `enum WeaponType`) → cung Nhật khác hình cung Âu nhưng **dùng CHUNG
  prefab**, chỉ đổi `Visual.sprite`. Tip/chỗ nắm/hitbox/chỉ số giữ nguyên nên cân bằng hai phe
  vẫn tuyệt đối bằng nhau — điều mà làm 2 prefab riêng KHÔNG bảo đảm được.
  **MỌI CHẾ ĐỘ GAMEPLAY ĐỀU CHIA VĂN MINH** — builder gọi
  `StickmanDemoBuilder.AddCivilizationAssignerShared(FullRoster)` trước khi lưu scene: 7 chế độ
  7 chế độ (`StickmanModeBuilder.FinishModeScene`) · 4 kiểu chơi mới · doanh trại · thành luỹ · 4 kiểu trung cổ · Demo_3 · **Demo_4 (bảo vệ VIP)** · Demo_6. ⚠ Demo_4 từng bị SÓT — nó là scene chơi được duy nhất ra một màu xám trong khi 15 nền art nằm không. Thêm scene chơi được mới thì nhớ dòng này. **Chơi lại (`R`) là bốc cặp mới** vì `GameRun._rng` chạy tiếp qua
  các lần nạp scene; riêng nút "Chơi lại ván này" của `GameSession` cố ý giữ nguyên seed.
  ⚠ **KHÔNG chia cho**: ba thể loại Hiện đại/Fantasy (nền văn minh chỉ dành cho trung cổ) ·
  zombie (chia là cả bầy đội nón Viking) · thuỷ chiến (hải tặc đã có nền riêng) · đột nhập
  (loadout ninja là kịch bản của màn).
  ⚠ **KHOÁC ÁO Ở `Start`, KHÔNG PHẢI Ở `Awake`.** `DressExistingUnits` duyệt `TeamMember.All`,
  mà danh sách đó do `TeamMember.OnEnable` ghi vào — Unity gọi Awake/OnEnable của object trong
  scene theo THỨ TỰ KHÔNG XÁC ĐỊNH. Chạy ở Awake là khoác áo cho đúng những ai TÌNH CỜ đăng ký
  trước; ai đăng ký sau đứng nguyên bộ mặc định, và hay trúng NGƯỜI CHƠI (builder dựng người
  chơi sau cùng) — *"nhân vật của mình không giống nền văn minh của team"*, không lỗi nào báo.
  Việc CHIA nền vẫn ở `Awake` để quân sinh sớm hỏi `For(teamId)` là có câu trả lời.
  ⚠ **NGƯỜI CHƠI HỒI SINH = MỘT THÂN MỚI**, chưa ai khoác áo. Assigner nghe `PlayerCharacter.Changed`
  rồi tự `Dress` — cùng lý do camera/HUD/ô nhặt đồ đều nghe sự kiện đó thay vì bắt bên hồi sinh
  nhớ gọi bốn hệ.
  ⚠ **QUÂN SINH GIỮA TRẬN phải gọi `CivilizationTeamAssigner.Dress(go, teamId)`** ngay sau khi
  đặt `TeamMember.TeamId` — `EnemyWaveSpawner` · `ArenaMode` · `TeamEconomy` · `WarCamp` ·
  **`DuelLabHud.RebuildSide`** đã nối.
  ⚠⚠ **"DỰNG LẠI TỪ KHUÔN" CŨNG LÀ SINH QUÂN GIỮA TRẬN — và đây là chỗ đã dính**
  (2026-09-05, *"AI Lab đối kháng bấm chơi lại thì mất nền văn minh, mất nón giáp"*).
  `DuelLabHud` chụp KHUÔN NGUỘI của hai đấu sĩ rồi `Instantiate` lại mỗi lần «ĐẶT LẠI SÂN».
  Khuôn bê theo mấy cái nón/giáp đang treo trên xương, nhưng `StickmanEquipment` dựng hai sổ
  `_equippedDefs`/`_equippedVisuals` MỚI ở `Awake` nên nó không biết gì về chúng:
  `DiscardStrayGear` huỷ sạch rồi mặc lại `_startingEquipment` = bộ đồ MẶC ĐỊNH của builder,
  không phải bộ của nền (§4d-bis). Kết quả: bấm đặt lại một cái là hai đấu sĩ trở về stickman
  trơn, **trong khi bảng vẫn in tên nền** — bảng nói dối, và không lỗi nào báo.
  ⚠ Nhận diện chỗ phải gọi bằng câu hỏi *"object này có `Awake` chạy SAU khi màn đã dựng
  xong không"*, ĐỪNG kê danh sách spawner: khuôn/hồi sinh/nhân bản theo bậc khó đều là
  `Instantiate` chứ không phải "spawner", nên kê tên là kiểu gì cũng sót.
  Trước đây hàm `Dress` **không có một người gọi nào** dù chú thích nói có: đánh tới giữa trận
  là mỗi phe có hai kiểu lính, không đọc ra phe nữa.
  ⚠ **NGƯỜI CHƠI chỉ đổi VẺ NGOÀI, giữ nguyên vũ khí.** `ApplyTo` phát vũ khí theo quân chủng
  mà người chơi không có `StickmanAgent` nên rơi về `Melee` — vào bài thử cung cũng bị nhét
  kiếm vào tay ngay giây đầu.
  ⚠ **`ApplyLookTo` PHẢI THAY CẢ NÓN, và chỉ THAY chứ không PHÁT THÊM.**
  `CivilizationDefinition` từng KHÔNG CÓ ô `helmet` — tool vẫn sinh đủ 15 asset
  `Equip_<Nền>_Helm` nhưng ở đường `LookOnly` không ai tham chiếu tới chúng, nên
  `Demo_8_AILab` cả hai phe đội chung một cái nón sắt phát theo cấp: nhìn vào không đọc ra
  nền văn minh nào, mà **không lỗi nào báo**. Nay có `civ.helmet` và `WearEquipment` mặc nó.
  ⚠ Kèm chốt `HasSlot`: chỉ THAY món đang mặc, KHÔNG phát thêm cho ai chưa có. Cấp lính
  (`UnitRank`) mới là thứ quyết định ai được đội nón / mặc giáp — khoác thêm ở đây là dân
  binh cũng có 6 điểm giáp + sức nặng, tức đổi VẺ NGOÀI mà đổi luôn cân bằng, đúng thứ
  `ApplyLookTo` sinh ra để tránh. Ai không có slot vẫn nhận nón OVERLAY của nền (hàm gán
  `appearanceSet` của chính nền đó ở cuối).

  **CHIA PHE NGẪU NHIÊN**: `CivilizationTeamAssigner` trong scene → mỗi ván hai phe bốc hai
  nền khác nhau. `FullRoster` (đổi cả vũ khí — Demo_3/6 + chế độ chơi) vs `LookOnly` (giữ
  nguyên vũ khí, chỉ đổi vẻ ngoài — **Demo_8_AILab**, vì bài test đã phát đúng cây cần thử).
  Runtime tra qua `Assets/Resources/CivilizationLibrary.asset`.
  **BỐN NỀN BỔ SUNG** (`Byzantine` Đông La Mã · `Ottoman` · `Rus` Slav · `Persia` Ba Tư): mỗi
  nền chọn một DÁNG NGOÀI khác hẳn — vòm tròn + che má rủ · khăn xếp to bản có chóp · chóp
  nhọn cao nhất bộ + khiên giọt nước · vòm thấp + khăn quấn mảnh. Trùng dáng thì dù màu khác
  vẫn không phân biệt nổi lúc hai phe trộn vào nhau; màu chỉ là vế thứ hai.
  Ottoman là nền trung cổ DUY NHẤT có thuốc súng (cấm vệ hoả mai đứng cạnh nỏ và cung).
  **NỀN THỨ 15 — AI CẬP CỔ ĐẠI** (`Egypt`): khăn **NEMES** sọc vàng-lam + rắn uraeus giữa
  trán · áo vải lanh có **vòng cổ usekh** · khiên da bò **đáy phẳng, đỉnh vòm** (ngược hẳn
  khuôn `Heater`) · **KHOPESH** (đao lưỡi liềm) và **chuỳ** thay kiếm thẳng · tuyến cung dày,
  có cả **cung thủ chiến xa** (dùng lại đúng khuôn kỵ xạ Mông Cổ: `mounted` + `rank: Levy`).
  Cưỡi `Courser` (ngựa kéo xe — nhẹ và nhanh nhất bộ).
  ⚠ KHÔNG đẻ cây vũ khí mới cho khopesh: `WSaber` đã đúng LỚP (lưỡi cong một tay, đeo khiên
  được). Thêm prefab chỉ để đổi tên là thêm một cây phải cân bằng lại + gắn tiếng + nối bảng.
  ⚠ **Nền mới nối vào CUỐI mảng `Specs`, đừng chèn giữa** — `LoadAllCivilizations` đi theo
  thứ tự mảng đó, mà `CivilizationArena` của `Demo_19` đã bake **CHỈ SỐ** hai phe vào scene.
  ⚠ `CivilizationArtGenerator` chỉ BÙ file thiếu (`GenerateMissing`); menu "1" mới ghi đè và
  có hộp xác nhận — trước đó `EnsureAll` gọi `GenerateAll` nên suýt đè mất bộ nón art thật.
  ⚠ **ART CỦA DỰ ÁN LÀ ART NHÌN NGANG — ĐỐI XỨNG TRÁI–PHẢI LÀ DẤU HIỆU VẼ SAI GÓC NHÌN.**
  Nón Ai Cập từng vẽ khăn NEMES với HAI VẠT đối xứng rủ hai bên (quy ước hình CHÍNH DIỆN).
  Lên người thì thành hai cái chân vải thò xuống hai bên cái đầu, và cả tấm art đọc ra
  "nằm ngang 90°". Nhìn ngang thì chỉ thấy MỘT vạt, và nó rủ về phía SAU (−X). Cùng một luật
  với vũ khí (mũi quay +X) và với tóc dài / đuôi khăn của bộ trang trí.

⚠ **VẼ NÓN BẰNG CODE — BA LUẬT, phá luật nào cũng ra "cái bàn có chân"** (đã dính với Đại
  Việt · Mông Cổ · Ấn Độ: nón thành cái chụp đèn trên tấm ván, và cái bánh kem xếp tầng):
  1. **MỘT KHỐI LIỀN CÓ VIỀN** — chi tiết nằm TRONG khối. Ghép `Rect` phẳng cạnh nhau là mắt
     đọc ra "mấy tấm ván xếp chồng", không đọc ra cái nón. Dùng `EllipseShape` + `EllipseRing`
     + `ClipToEllipse` (vẽ hoa văn tràn ra rồi CẮT theo khối) và `ConeShape` cho chóp.
  2. **DẢI PHẢI HẸP HƠN VÒM** và cong theo vòm. Dải rộng hơn khối chính là ra ngay "tấm ván
     kê dưới" — đó đúng là thứ đã biến cái vòm Mông Cổ thành cây nấm.
  3. **DƯỚI `FaceLine` (16) LÀ MẶT** — chỉ được vẽ hai BÊN, cấm bịt ngang. Và `CutFace` phải
     gọi **SAU CÙNG**: cắt trước rồi vẽ viền là cái viền vẽ lại đúng phần vừa cắt (ra một cung
     tròn lơ lửng dưới cằm).
  ⚠ **PHẢI NHÌN ART TRƯỚC KHI CHỐT.** Bộ nón hỏng tồn tại lâu vì không ai render ra xem. Cách
  rẻ nhất mà không cần mở Unity: **`.claude/skills/stickman-assets/scripts/canvas.py`** — bản
  mô phỏng `PixelCanvas` trùng tên hàm + trùng công thức (tự lật trục y vì Unity y-up còn PIL
  y-down), có `sheet()` ghép contact sheet và `opaque_bounds()` đo phần vẽ được. Vẽ thử, NHÌN,
  rồi mới port số sang C#. Xem `Docs/KnowledgeBase/AssetGeneration.md`.
  Sân test: `Demo_19_Civilizations` — nút ◀ ▶ đổi văn minh từng phe lúc chơi.

7b-soi. **BA VIỆC MÀ HỆ VĂN MINH TỪNG KHÔNG LÀM ĐƯỢC — và cả ba đều im lặng.**

· ⚠⚠ **KHÔNG CÓ CÁCH NÀO CHỌN NỀN.** `CivilizationTeamAssigner` bốc ngẫu nhiên lúc `Awake` và
  không có đường can thiệp: muốn xem phe xanh mặc đồ Viking thì phải bấm `R` tới lúc bốc trúng
  — 15 nền nên trung bình 15 lần. Art của 15 nền có đủ mà **không soi có chủ đích được**.
  Nay có `CivilizationPickerHud` (nút «NỀN ▾» góc phải, phím **F4**): ◀ tên ▶ đổi nền từng
  phe · «Xáo đồ» đổi tổ hợp nón/giáp · «Ngẫu nhiên» bốc lại cả sân · «Vũ khí ngẫu nhiên cho
  tôi». Nó **KHÔNG sinh lại ai** — gọi `SetTeamCivilization` khoác lại lên chính đội đang
  đứng đó (kể cả công trình), nên so được "cùng đội quân, khác nền".
  ⚠ `CivilizationPickerBootstrap` gắn bù lúc nạp scene: 21 scene đã BAKE không phải dựng lại.

· ⚠⚠ **CẢ PHE ĐỘI CHUNG MỘT CÁI NÓN.** `ApplyTo` (đường FullRoster = MỌI scene đánh trận)
  truyền `wearEquipment: false` với lý do "loadout đã mặc giáp/khiên rồi". Đúng, nhưng loadout
  chỉ mang **NÓN CHÍNH** của nền ⇒ `helmetVariants`/`armorVariants` **không bao giờ được dùng
  tới trong trận thật**, chỉ đường `LookOnly` (AI Lab) mới thấy. Nhìn ra ĐỒNG PHỤC, và không
  lỗi nào báo vì ai cũng có một cái nón. Nay truyền `true` — an toàn vì `WearEquipment` chỉ
  **THAY** món đang mặc (chốt `HasSlot` ở cả nón · giáp · khiên), dân binh đầu trần vẫn đầu
  trần, cân bằng theo `UnitRank` không đổi một điểm giáp nào.
  ⚠ `PickVariant` bốc theo mã băm nên cố định theo từng người (chống "đồ nhấp nháy") — đổi lại
  là **không xáo lại được**. `CivilizationDefinition.GearSalt` là hạt giống chung để nút «Xáo
  đồ» đổi cả sân mà trong một lần xáo vẫn tất định.

· ⚠⚠ **SCENE TRUNG CỔ THIẾU HẲN ASSIGNER = CẢ SÂN DÙNG ART MẶC ĐỊNH.**
  `Genre_Medieval_Battle` · `Genre_Medieval_Siege` · `Demo_34_Escalade` chưa bao giờ gọi
  `AddCivilizationAssignerShared`, nên hai phe ra trận đều là stickman đen trơn đội cái nón sắt
  phát theo cấp — đúng thời kỳ mà 15 nền sinh ra để phục vụ. Đã thêm vào builder; scene đã bake
  thì `CivilizationPickerBootstrap` gắn bù theo QUY ƯỚC TÊN (`Genre_Medieval_*`, cùng quy ước
  `StickmanGenreSceneBuilder.GenreOfScene` đang dùng).
  ⚠ Bài THỬ VŨ KHÍ được miễn: nó có `CivilizationSkinPreview` và người chơi phải giữ nguyên cây
  đang thử — thêm assigner FullRoster vào là nó phát lại vũ khí theo quân chủng.

7b-roster. **`Demo_37_CivRoster` — TỦ KÍNH TRƯNG BÀY DÀN NHÂN VẬT** (`Civilizations > 4`).
Chọn nền → **MỘT** nhân vật đứng diễn động tác lặp lại (`StickmanShowcasePose`), và **BỐN
TRỤC RỜI** để lật từng món: **vũ khí · nón · giáp · cấp vật liệu**, mỗi trục một cặp nút ◀ ▶
và tự vòng lại ở hai đầu.
⚠ **ĐỪNG quay lại DANH SÁCH PHẲNG.** Bản đầu nhân (quân chủng × nón × giáp × cấp) thành **135
trang** rồi cho đúng một cặp nút đi qua. Muốn so *"cùng cái nón này, cấp 1 với cấp 5 khác nhau
ra sao"* thì phải bấm 5 lần, mà trên đường đi nó đổi luôn cả quân chủng lẫn giáp — tức **không
so được đúng thứ mình muốn so**, trong khi so-được chính là lý do cái tủ kính tồn tại. Bốn trục
rời thì mỗi nút đổi ĐÚNG MỘT THỨ, ba thứ kia đứng im.
⚠ **Ở đây CỐ Ý phát đồ KHÔNG theo `UnitRank`** (`ForceGear` gọi thẳng `Equip`). Trong trận thì
`WearEquipment` chỉ THAY món đang mặc (chốt `HasSlot`) để dân binh khỏi được cộng lén điểm giáp
— đúng cho trận đánh, nhưng ở tủ kính thì quân chủng `Levy` không có slot nào, bấm nút nón mãi
không thấy gì đổi và **hai phần ba bộ nón của nền không có đường nào nhìn thấy**. Bảng mô tả
ghi rõ cấp lính để không ai đọc nhầm thành luật chơi.
⚠ Trục nào cũng phải **KẸP LẠI khi đổi nền** (`ClampAxes`): nền mới ít kiểu nón hơn thì chỉ số
cũ làm `HelmetAt` trả null và nhân vật ra đầu trần TRONG IM LẶNG — người soi tưởng nền đó
thiếu art. Đây là "contact sheet" của bộ art dựng bằng CHÍNH RIG THẬT — trước
đó không có chỗ nào nhìn thấy vài trăm tổ hợp hình đó, nên lỗi art sống rất lâu.
· **Không đánh nhau**: cùng một phe + `StickmanAgent` bị TẮT HẲN (đặt hành vi Idle là chưa đủ —
  pipeline vẫn quét địch, vẫn giãn cách, hàng ngũ trôi dần trong lúc đang soi).
· **Bày theo CHỈ SỐ** (`HelmetAt`/`ArmorAt`), không để `PickVariant` bốc — bốc thì không bao
  giờ chắc đã nhìn qua hết mọi cái nón.
· **Bảng tên ghi TÊN SPRITE**, không ghi `displayName`: cả ba kiểu nón một nền đều tên "Nón
  Trung cổ châu Âu", nhìn vào không biết tấm PNG nào cần sửa.
· ⚠ KHÔNG dùng `FinishSceneShared` — hàm đó gắn cần ảo + nút ĐÁNH, mà đây là màn NGỒI XEM
  (cùng luật với AI Lab / bàn thử).
  Chi tiết: `Docs/KnowledgeBase/Civilizations.md`.
- **Vũ khí**: `Tools > Stickman > Sprite Pivot Tool` — click đặt pivot đúng CHỖ TAY CẦM
  (vũ khí vẽ mũi quay sang +X), rồi bấm "Gán sprite vào Visual + auto Tip" là xong;
  Tip/muzzle/hitbox tự chạy theo mép sprite mới. Với đạn: "Gán sprite + auto collider".
- **Trang bị**: đổi sprite trong `EquipmentDefinition`.
- **Effect**: có HỆ EFFECT dùng chung — khai báo MỘT chỗ (`EffectLibrary` ở
  `Assets/Resources/EffectLibrary.asset`), cả game có hiệu ứng. Chi tiết:
  `Docs/KnowledgeBase/Effects.md`. Bốn điều cần nhớ:
  1. Dựng bằng tool: `Tools > Stickman > Effects > Build Effect Set (1 nút)`
     (sprite → prefab → bảng). Tool dựng scene demo tự gọi bước này.
  2. Gọi ở mọi nơi bằng `EffectManager.Play(EffectEvent.Attack, vị trí, hướng, vũ khí)` —
     KHÔNG tự Instantiate prefab hiệu ứng. Effect chạy qua `ObjectPool`, không sinh rác.
  3. Bảng tra theo **(sự kiện + LỚP VŨ KHÍ)**: kiếm ra vệt chém, súng ra chớp nòng,
     búa lớn ra tia to hơn — thêm vũ khí mới chỉ cần thêm 1 dòng trong bảng.
  4. Prefab cắm RIÊNG vẫn thắng bảng chung: `_attackVfx` (vũ khí) · `_deathVfx` (nhân vật) ·
     `_explosionVfx` (đạn).
- **Âm thanh**: 86 clip trong `Assets/Sounds/SFX/` (chọn từ gói *Ultimate SFX Bundle*
  ở `E:\Project\AssetGame`). Gắn bằng `Tools > Stickman > Audio > 2` — bảng trong
  `StickmanAudioBuilder.cs` là nguồn sự thật, thêm vũ khí mới thì thêm 1 dòng rồi bấm lại nút,
  ĐỪNG kéo tay từng ô AudioClip. Phủ **42/42 vũ khí · 11/11 loại đạn**.
  ⚠ **THÊM VŨ KHÍ MÀ QUÊN NỐI VÀO BẢNG THÌ KHÔNG CÓ LỖI NÀO BÁO** — cây đó chỉ lặng lẽ không
  kêu, giữa trận đông người thì tai không nghe ra. Đã dính đúng vậy: 20 cây (rìu · chuỳ · kích ·
  vuốt · **nắm đấm** · nỏ · trường cung · ná · cả **6 cây trượng phép**) và 5 loại đạn phép nằm
  câm cho tới lúc rà lại từng prefab. Nay `WireToPrefabs` tự đối chiếu với **file prefab CÓ THẬT**
  trên đĩa (`FindSilentPrefabs`) rồi réo tên cây còn câm — đừng thay bằng danh sách gõ tay,
  chính nó sẽ lỗi thời theo đúng cái cách đang chữa.
  · **PHÉP đi đường riêng**: `MagicWeapon` KHÔNG kế thừa `MeleeWeapon`/`RangedWeapon` nên không
  nhánh nào trong `WireWeapon` chạm tới nó — phải có nhánh riêng cho `_castClip` (niệm) +
  `_releaseClip` (phóng). Nghe ra được đang niệm hay đã phóng là điều kiện để đọc trận: niệm dở
  mà trúng đòn là VỠ BÀI, không có tiếng niệm thì người chơi không biết lúc nào nên lao vào cắt.
  · **THẾ THỦ** (`MeleeWeapon._guardBlockClip`) lấy `DefaultGuardClip` cho MỌI cây cận chiến,
  không kê tay từng dòng — kê tay 25 dòng thì thêm cây mới lại quên đúng một ô, và ô quên đó
  chỉ đỡ đòn trong im lặng.
  · **Đạn phép KHÔNG gán `Launch`** — tiếng phóng đã do `_releaseClip` của cây trượng kêu, gán
  thêm là mỗi phát hai tiếng chồng nhau (cùng bẫy với `_attackClip` của khiên).
  · `EffectLibrary.clip` để TRỐNG là **cố ý**, không phải thiếu: cả 8 `EffectEvent` đều đã có
  tiếng ở phía vũ khí hoặc phía giọng nói, đổ thêm vào bảng effect là kêu hai lần. Bước chân do `StickmanFootsteps` lo (nghe event
  `StickmanLegWalker.Stepped`, đi bộ / chạy 2 bộ clip khác nhau).
  Chi tiết: `Docs/KnowledgeBase/Audio.md`.
- **Phát tiếng phải qua `StickmanAudio.Play/PlayVaried`, KHÔNG dùng `AudioSource.PlayClipAtPoint`**
  — nó là AudioSource 3D, camera game này ở z = -10 nên rolloff bóp âm lượng còn ~1/10
  (triệu chứng: cắm clip đủ chỗ mà chơi không nghe thấy gì).
- **Tiếng nhân vật khi đánh nhau**: `StickmanCombatVoice` trên `Character.prefab` — gắng sức
  khi ra đòn (`WeaponBase.AnyAttacked`), kêu khi trúng đòn (`Damaged`), hét khi chết (`Died`),
  hô xung trận khi AI xông liều. Có giọng nam/nữ random mỗi nhân vật.
  **Đừng gán thêm `StickmanController._hurtClip`/`_deathClip`** — kêu 2 tiếng chồng nhau.
- **Không dùng nhạc nền** (đã thử rồi bỏ): chỉ tiếng vũ khí + tiếng người + bước chân.
- Gắn âm thanh chạy TỰ ĐỘNG 1 lần qua `StickmanAudioAutoWire` lúc Unity nạp script;
  đổi clip/thêm vũ khí thì bấm tay `Audio > 2`.


---

## ⚠⚠ NHÂN VẬT KỊCH BẢN CHỈ ĐỔI VẺ NGOÀI THEO NỀN VĂN MINH (2026-09-05)

`CivilizationTeamAssigner.Apply` có ba đường: `ApplyLookTo` (chỉ nón/giáp/khiên/skin) ·
`ApplyTo` (TRỌN BỘ loadout theo quân chủng) · bỏ qua hẳn.

`ScriptedUnit` — tướng, đức vua, VIP, boss — phải đi đường **`ApplyLookTo`**:

* Đi `ApplyTo` thì loadout của nền XOÁ SẠCH thứ builder đã cố ý đặt: vũ khí cấp 3, bộ giáp
  tinh nhuệ, 2.5× máu. Ông tướng thành một anh lính thường mang vương miện.
* Bỏ qua hẳn thì giữa một phe Viking có một ông chỉ huy đội nón chung chung — đúng câu người
  dùng báo: *"tướng của địch không trang bị theo nền văn hoá"*.

Cùng khuôn với NGƯỜI CHƠI (đã có sẵn ngay trên), và cùng lý do: **quân chủng của họ không do
nền văn minh quyết định, nhưng bản sắc hình ảnh thì có.**
