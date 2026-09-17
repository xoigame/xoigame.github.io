## FANTASY — pháp sư, mana, 30 chủng tộc

Thể loại thứ ba dùng CHUNG rig / FSM / animation với Trung cổ và Hiện đại.

Mục 1–5 là *"vế đã có ở hai thể loại kia, Fantasy thiếu"*. Mục 6–14 là vế RIÊNG của
Fantasy mà hai thể loại kia không có: trường phái phép · hệ bay · trùm ba pha · nhiệm vụ săn
rồng · bộ art phẳng · kháng-khắc nguyên tố · cưỡi quái bay · vết nứt hư không. Mục 0 là bảng mà
tất cả những cái đó cùng đọc.

### 0. MỘT BẢNG LÀ NGUỒN CỦA TẤT CẢ — `FantasyRaceCatalog`

`FantasyRaceCatalog.Of(kind)` trả bộ số của một chủng: vai trò · màu · tai/sừng/hàm/cánh/đuôi ·
cỡ đầu, cỡ thân · có bay không + độ cao lượn · trường phái phép. **Art, tính cách, chuyển động
và hệ bay đều đọc bảng này.**

Thêm chủng = nối giá trị vào cuối `FantasyCreatureKind` + thêm một `case` ở catalog — đó là hai
điểm ĐẦU. Từ 2026-09-09 một chủng có **9 điểm nối** (kháng/khắc · tính cách · cơ chế · hình học
đầu · art · hồ sơ dáng/áo · chỗ ra sân) và một phép đo «★ Soát hồ sơ sinh vật»: đọc
[CreatureIntake.md](CreatureIntake.md) trước khi thêm. Đợt 2026-09-09 nối 5 chủng: Nhện · Nhớt ·
Người sói · Oan hồn · Wyvern, và nhà thứ sáu **Bầy Hoang** (`WildSwarm`).

⚠⚠ **ĐỪNG KÊ TAY DANH SÁCH CHỦNG.** `FantasyRaceTactics` từng viết thẳng
`_kind == Harpy || _kind == Dragon` để nhận ra quái bay. Lúc nối imp · wisp · gryphon vào enum,
ba chủng BAY đó rơi vào nhánh mặt đất và bị áp profile đi bộ — **không lỗi nào báo**, chỉ thấy
"mấy con bay cứ đơ ra". Hỏi `FantasyRaceCatalog.Flies(kind)`.

⚠ `FantasyRaceStyle.flies` mới là cờ quyết định, **không phải** `wing`. Tiên có cánh côn trùng
nhưng ĐI BỘ (nó là pháp sư tuyến sau). Phép đo canh: `StickmanDoctor` › *"Chủng BAY mà không có
bộ lái bay"* — nó soi chính bảng, nên không bao giờ báo động giả trên màn toàn bộ binh.

Mười nhà (`FantasyHouses`, `Count = 10`): Liên minh Tiên · Bộ tộc Orc · Quái vật · Giới Đá · Bầy Hoang ·
Vương quốc · Bầy Khổng lồ · Triều Huyết · Bộ lạc Đầm lầy ·
Triều Bất Tử. ⚠ **Roster nhà CHỈ nhận chủng đi bộ.** Cho một chủng bay vào roster là ra con
gryphon ĐI BỘ mà `FantasyRaceTactics` lại bỏ qua (vì bảng nói nó bay) — nó không có tính cách nào.

### 0b. CỠ VÀ HÌNH DÁNG — `FantasyRaceCatalog.BodyOf` (2026-09-09)

User: *"không nhất thiết vẽ kích thước của stickman, chủng to lớn thì vẽ to lớn, chủng nhỏ thì
vẽ nhỏ… có chủng nhân mã thì vẽ nhân mã… không cần form stickman mà vẽ theo hình dáng chủng tộc
fantasy… vẽ monster thì kích thước hình dáng theo monster, vẽ rồng"*.

`BodyOf(kind)` (`FantasyRaceCatalog.Body.cs`) trả **chiều cao THẬT** (đất → đỉnh đầu, world) +
`FantasyBodyPlan` + tỉ lệ thân/đầu. Nó là nguồn của cả art lẫn cỡ trên sân:
`Of().bodyScale = height / 0.73` và `Of().headScale = head / 0.150` — **không ghi tay nữa**.

| | thấp nhất | mốc | cao nhất |
|---|---|---|---|
| Chiều cao | wisp 0.34 · imp 0.44 · goblin 0.52 | **người 0.73** | treant 1.45 · khổng lồ 1.75 · rồng 2.10 |

Bảy kiểu cơ thể (`FantasyBodyPlan`): `Biped` (21 chủng, giữ rig) · `Centaur` (mình ngựa 4 chân) ·
`Quadruped` (rồng · wyvern · gryphon) · `Arachnid` (nhện 8 chân) · `Serpent` (naga, đuôi cuộn) ·
`Blob` (slime · wisp) · `Spectre` (banshee · lich, không chân).

⚠ **Chủng nào được giấu rig là do VŨ KHÍ quyết định, không do hình.** Nhân mã cầm cung, naga và
lich cầm trượng (`FantasyRaceLoadout` phát vũ khí thật) — giấu tay là cây cung treo lơ lửng. Nên
ba plan giữa chỉ thay NỬA DƯỚI. Sáu chủng nhóm cuối đều dùng vũ khí cơ thể nên giấu hết được.

⚠ Luật vẽ, ba cái bẫy im lặng và phép đo: [AssetGeneration.md](AssetGeneration.md) mục
*"HÌNH DÁNG LÀ CỦA CHỦNG"*.

### 0c. VŨ KHÍ — HAI HỆ, ĐỪNG TRỘN (2026-09-09)

User: *"rồng, monster đâu có dùng vũ khí, rồng thì phun lửa… tôi muốn bộ vũ khí cho fantasy,
cho từng chủng tộc"*.

**Đo được trước khi sửa:** mọi loài "đánh bằng thân" đều đi qua `UseNaturalWeaponsOnly()`, tức
cầm `Weapon_Fists` — **sát thương 0.35 · tầm 0.35, yếu nhất và ngắn nhất dự án**. Con rồng cắn
đau đúng bằng một nông dân đấm tay không. Và vệt lửa của rồng chỉ tồn tại trong
`FantasyDragonBoss` (bộ lái mà chỉ màn săn rồng gắn) — rồng sinh ở chỗ khác không phun phát nào.

| | VŨ KHÍ CƠ THỂ | VŨ KHÍ CẦM TAY theo chủng |
|---|---|---|
| Là gì | hàm · nanh · vuốt · nắm đá · sừng · cành | rìu orc, cung tiên, búa lùn… |
| Cơ chế | `WeaponType` RIÊNG (`Maw` 74 … `Bough` 79) | **`WeaponSkinSet`** — cùng cây, khác hình |
| Có sprite? | **KHÔNG** — cái hàm đã nằm trong art THÂN | có, thả vào `Sprites/Fantasy/Races/<Chủng>/` |
| Bảng tra | `FantasyRaceCatalog.TryNaturalWeapon` | `TrySignatureWeapon` + `FantasyRaceWeaponSkins` |
| Ai dùng | rồng · wyvern · gryphon · harpy · imp · sói · nhện · slime · golem · minotaur · troll · treant | 17 chủng biết rèn |

⚠ **Hai bảng KHÔNG được chồng nhau** — thứ tự gọi sẽ quyết định con vật cầm gì. Troll và
minotaur từng nằm ở cả hai, và hai dòng `Club`/`Greataxe` của chúng là CODE CHẾT suốt từ đầu
vì `FantasyRaceLoadout.RuleFor` xếp cả hai vào nhóm cơ thể.

⚠ **Vũ khí cơ thể phải `_isFallback = false`.** Để cờ dự phòng thì `AIModules` cho con rồng đi
nhặt kiếm dưới đất trong mười giây. Phát bằng `EquipType` + `KeepCurrentWeaponOnly()`, KHÔNG
phải `UseNaturalWeaponsOnly()` (hàm đó chỉ giữ đúng cây MANG CỜ dự phòng).

⚠ **Vì sao skin chứ không phải enum mới:** 8 chủng × 8 loại = 64 `WeaponType` + 64 prefab, và
cân bằng giữa hai phe thành chuyện KỶ LUẬT của người sửa. Đi đường skin thì nó là BẤT BIẾN
theo kiến trúc.

**PHUN LỬA:** `FantasyDragonbornBreath.SetupFor(kind)` — rồng (4 vũng, tầm 7.5) · wyvern (3,
5.4) · long nhân (2, 3.4). Gắn ở `EnsureBehaviour`, nút thắt mà mọi đường sinh quái đi qua.

**Đặt art:** `★ ĐẶT HÀNG ART` có sẵn hai bộ — `fantasy-creature-body` (thân quái) và
`fantasy-weapon-<Chủng>`.

### 0d. CƠ CHẾ THÊM 2026-09-09 — chết theo chủng · tơ nhện · nọc thằn lằn · thư viện

- **`FantasyDeathStyle`** — sáu kiểu chết, gắn cho MỌI chủng ở `EnsureBehaviour`. Trước bản
  này cả 30 chủng chết y hệt nhau, mà khoảnh khắc chết là thứ người chơi nhìn nhiều nhất.
  Ngưỡng "con to" (`Crash`) đọc từ `BodyOf().height >= 1.15`, KHÔNG liệt kê tên chủng — thêm
  một chủng cao là nó tự có cái chết nặng.
  ⚠ Cố ý KHÔNG sinh mảnh vỡ vật lý: mọi thứ trên xác phải nằm trong nhóm `Ragdoll` để ăn
  chung freeze/fade/despawn. Mảnh ngoài nhóm đó sống mãi sau khi xác đã dọn — không lỗi nào báo.
- **`FantasySpiderWeb`** (làm chậm) và **`FantasyLizardVenom`** (độc xuyên giáp) — hai cơ chế
  vốn NẰM SẴN TRONG MÔ TẢ chủng mà chưa từng có code. Cả hai dùng `StickmanStatus.Apply`,
  không nuôi hệ trạng thái thứ hai.
- **`FantasyBestiary`** (phím **B** trong sân Văn minh) — bảng cả 30 chủng: cột cỡ vẽ theo
  chiều cao THẬT, cộng vai · vũ khí (cầm tay hay cơ thể) · có cơ chế hay không. Đây là phép
  kiểm rẻ nhất cho cả hệ: ba chủng từng có đủ bảng/art/luật mà KHÔNG CÓ CHỖ SINH, và không ai
  phát hiện ra vì muốn biết phải mở sáu file. ⚠ Màn này CHỈ ĐỌC — thêm nút "sinh thử" là tạo
  ra đường sinh quái thứ bảy.

### 1. HÌNH HÀI CHỦNG TỘC PHẢI ĐI QUA MỘT CỬA

`FantasyRaceTeamAssigner` (Gameplay) là bản Fantasy của `CivilizationTeamAssigner`. Bảng
"nhà nào gồm chủng nào" là `FantasyHouses` — **một nguồn**, sân Văn minh đọc tên/ghi chú từ đó.

| | Trung cổ | Hiện đại | Fantasy |
|---|---|---|---|
| Bộ khoác áo | `CivilizationTeamAssigner` | `ModernFactionLook` | `FantasyRaceTeamAssigner` |
| Builder gọi | `AddCivilizationAssignerShared` | (arena tự gắn) | `AddFantasyRaceAssignerShared` |

⚠ **Màn Fantasy không gọi assigner = cả sân stickman ĐEN TRƠN cầm trượng**, không lỗi nào báo.
Phép đo canh: `StickmanDoctor` › *"Màn Fantasy mà cả sân là stickman ĐEN TRƠN"*.

⚠ Quân sinh GIỮA TRẬN đi qua hook `CivilizationTeamAssigner.Dressing` (Units không tham chiếu
lên được Gameplay). Đừng thêm lời gọi vào từng chỗ sinh quân — mười chỗ, kiểu gì cũng sót một.

⚠ Chủng chọn theo `UnitRole`, không bốc ngẫu nhiên: khiên/cận chiến = tuyến trước
(lùn · orc · skeleton), tầm xa/hỗ trợ = tuyến sau (tiên · goblin · quỷ). Hình và hành vi phải
nói CÙNG một câu. Đơn vị đã có `FantasyRaceLoadout` (roster đặt tay) thì assigner bỏ qua.

⚠⚠ **KHÔNG khoác cho NGƯỜI CHƠI.** `FantasyRaceLoadout` chốt luật vũ khí của chủng bằng
`KeepCurrentWeaponOnly()` — đúng với NPC (mỗi con giữ một cây của roster), nhưng với người chơi
nó **xoá sạch kho vũ khí, chỉ chừa cây đang cầm**: vào bàn thử phép là không đổi được sang bài
nào khác, và không có lỗi nào báo — chỉ thấy *"bấm đổi vũ khí không ăn"*. Bộ dạng người chơi là
quyết định CỦA MÀN (Rừng Pha Lê gắn tay), không phải thứ bộ chia phe tự ý áp.

### 2. AI PHÁP SƯ — ba quyết định, cả ba mượn từ hai thể loại kia

`CasterCombatStrategy`:

| Quyết định | Mượn từ | Vì sao Fantasy cần hơn |
|---|---|---|
| **Núp để niệm** (`CoverTactics`) | nấp bắn Hiện đại | trúng đòn giữa lúc niệm là **VỠ BÀI**, mất cả mana — đắt hơn hẳn mất máu |
| **Không mở bài dài khi sắp bị cắt** | (mới) | `_interruptOnDamage` vốn chỉ là hình phạt ngẫu nhiên vì AI không biết nó tồn tại |
| **Cạn mana thì về `ManaFont`** | giỏ tiếp đạn Trung cổ | trước nay đường ra duy nhất là ĐỨNG CHỜ hồi |

- Cổng bật vật che là `AIProfile.coverSeekRadius > 0` — cùng cổng với lính súng, profile cũ
  (bằng 0) giữ nguyên hành vi.
- Ngưỡng "bài dài" là `castTime ≥ 0.25 s`; đũa phép (0.18 s) và cây không vỡ bài KHÔNG bị
  chặn — chúng là lối thoát lúc bị dí.
- `AIProfile_PhapSu` tắt `stalemateTimeout` (bằng 0): `IsCharging` vừa tắt hệ bám vật che vừa
  kéo pháp sư vào đúng vùng mọi bài đều bị cắt.

`Playbook_Arcane` (`genre = Fantasy`) là bộ AI của thể loại. ⚠ Ba bài Fantasy trước đây gắn
`Playbook_FieldBattle` — một bộ khai `genre = Medieval`, phát tính cách CUNG THỦ cho pháp sư:
`coverSeekRadius = 0`, không có module `ManaWell`, `stalemateTimeout` mặc định.

### 3. MANA KHÔNG PHẢI ĐẠN — hai đường tiếp tế

`ManaFont` (Combat) rót mana LIÊN TỤC theo giây; `AIManaWellModule` (`AIModuleKind.ManaWell`)
đưa pháp sư về. Cố ý KHÔNG dùng lại `AmmoCache`: trượng khai `UsesAmmo = false`, nên
`NeedsRefill` không bao giờ thấy pháp sư cần gì, còn `AIResupplyModule` thì lại lôi cung thủ về
đứng cạnh mạch mana.

⚠ Đừng đặt mạch trùm lên điểm hồi sinh hoặc chỗ đứng lúc mở màn — nằm sẵn trong vùng là MANA
VÔ HẠN và không có gì báo (cùng bẫy đã ghi ở `AmmoCache`).

### 4. NIỆM CHÚ PHẢI CÓ DÁNG

`WeaponBase.IsChanneling` / `ChannelPose` là khái niệm CHUNG cho "đang bận một việc đứng yên có
dáng riêng": súng NẠP BĂNG, trượng NIỆM CHÚ. `StickmanWeaponHolder.ApplyChannelPose` ghi base
pose mỗi frame; `MagicWeapon` nội suy nghỉ → giơ trượng theo `CastProgress`, rồi cú ĐẨY PHÉP đi
qua `PlayAttack` (như độ giật của súng) để thân và chân vào tấn theo.

⚠ Tắt cờ niệm TRƯỚC khi gọi `PlayAttack` — còn bật là base pose và cú đẩy tranh nhau dáng tay.

⚠ Giơ trượng càng cao = bài càng sắp ra. Đó là TÍN HIỆU cho địch đọc mà lao vào cắt; bỏ dáng đi
là luật vỡ bài mất nửa còn lại của nó.

### 5. VẬT CHE FANTASY

`StickmanBuildingArt.Fantasy` sinh `Prop_RuneStone` (ngang ngực) · `Prop_Crystal` (cao) ·
`Prop_ArcaneWard` (thấp) · `Prop_ManaFont` + `Prop_ManaGlow`. Dựng bằng
`StickmanShooterModeBuilder.CoverArtShared` — **cùng một đường** với vật che Hiện đại.

⚠ Dựng vật che bằng `Square.png` kéo giãn thì nó KHÔNG phải `Fortification`, không vào
`Fortification.All`, và `CoverTactics` coi cả sân là TRỐNG — đúng bẫy `Genre_Modern_Cover` đã
dính một lần. Art code chỉ là bản nháp; prompt bản đẹp ở
`Docs/KnowledgeBase/EnvironmentArt-ChatGPT-Prompt.md`.


### 6. TRƯỜNG PHÁI PHÉP — `SpellSchool` (2026-09-08)

Trước đó mọi bài phép TRÚNG RỒI đều giống hệt nhau: chỉ là một con số sát thương, khác mỗi màu
viên đạn. Người chơi không có lý do đổi bài, AI không có gì để chọn.

`SpellSchoolTable` (Core) nói **hậu quả sau khi trúng**, và mỗi trường phái phải trả lời được
câu *"lúc nào tôi muốn cây này thay vì cây kia"*:

| Trường phái | Hiệu ứng | Hệ số sát thương | Lúc nào muốn |
|---|---|---|---|
| Hư không | (không) | 1.00 | sạch, ổn định, khó chơi sai |
| Lửa | Cháy 3.5 s | 0.72 | cụm đông, địch nhiều máu |
| Băng | Chậm 45%, 2.6 s | 0.68 | chặn xung phong, mua thời gian cho tuyến sau |
| Sét | nhảy 3 lần, yếu dần 0.62 | 0.60 | bầy đứng sát nhau |
| Ám | hút 35% máu | 0.80 | pháp sư đơn độc tự nuôi mình |
| Thánh | hồi máu đồng đội | 0.00 | giữ tuyến đứng lâu gấp đôi |
| Đất | Ngã sấp 55%, xuyên giáp 0.45 | 0.85 | mở khoá cho cận chiến vào |
| Độc | Độc 6 s, xuyên giáp 0.60 | 0.65 | khắc lính giáp nặng |

⚠ **Hệ số sát thương là CÁI GIÁ của hiệu ứng phụ.** Đây là chỗ dễ hỏng cân bằng nhất: cho lửa
vừa cháy dai vừa đánh mạnh bằng hư không thì không ai cầm cây khác nữa.

⚠ `Arcane` là MẶC ĐỊNH và không gắn gì. Trượng cũ không khai trường phái thì hành vi **y hệt
trước** — không cây nào bị đổi cân bằng ngầm.

⚠ **SÉT không dùng `ProjectileController`.** Nó đánh TỨC THÌ rồi nhảy. Lý do: vật bay không báo
ngược về vũ khí, nên "nhảy dây chuyền" sẽ phải thêm cả một đường callback chỉ để phục vụ một
trường phái. Sét tức thì cũng đúng hơn về cảm giác — nó là tia chớp, không phải hòn đá bay.

⚠ Mục tiêu đầu của tia sét chọn theo **hướng ngắm**, không theo khoảng cách. Lấy gần nhất thì
tia sét luôn quay ra sau đánh con đang bám lưng thay vì con người chơi đang nhắm.

### 7. HỆ BAY — `FantasyAirRaider` (viết lại 2026-09-08)

Bản cũ chỉ là một **cái đồng hồ**: lượn ở `_hoverHeight`, cứ `_diveEvery` giây thì xuống
`_diveHeight` rồi lên. Ba hậu quả, không cái nào có gì báo:

1. **Bay xuyên núi** — độ cao đo từ `y = 0` tuyệt đối, không đo từ MẶT ĐẤT.
2. **Bổ nhào không liên quan tới trận đánh** — đồng hồ chạy cả khi không có ai trong tầm.
3. **Bắn rơi không có cảm giác gì** — chết là `enabled = false`, thân vẫn Kinematic, nên con
   vật **đứng chết cứng giữa trời**.

Nay là máy trạng thái `FantasyFlightState`: `Cruise → Approach → Dive → Climb`, cộng `Hover`
(wisp đứng hồi máu), `Perch` (hạ cánh — trả về `StickmanAgent`/`StickmanLocomotion`, đánh bằng
FSM bộ binh, KHÔNG có nhánh combat thứ hai) và `Falling` (thân về Dynamic, ragdoll lo phần rơi).

⚠ `Fly()` luôn kẹp đích trên `GroundAt(x) + _minGroundClearance`. Bỏ vế đó ra là quay lại bản cũ.
⚠ Gryphon `_huntsFliers`: nếu không tìm ra con bay nào thì **mới** hạ xuống đánh bộ binh — không
thì "săn quái bay" chỉ là một dòng ghi chú không ai thực thi.

⚠ **GIỮ NGUYÊN TÊN CLASS `FantasyAirRaider`.** `Genre_Fantasy_CrystalGrove.unity` đã bake tham
chiếu tới GUID của file đó; tách sang file mới là scene mất sạch bộ lái bay, không báo lỗi.

Nhịp cánh do **PHA BAY** quyết định (`FantasyRaceMotion.FlapByFlight`), không phải bảng theo
chủng: bổ nhào thì CỤP cánh (trọng lượng nằm ở chỗ nó thôi vỗ), vọt lên thì vỗ mạnh nhất, bị
bắn rơi thì xoãi cánh không vỗ nữa.

### 8. RỒNG — TRÙM BA PHA (`FantasyDragonBoss`)

Trước đó con rồng chạy đúng cùng bộ với harpy, khác mỗi máu và cỡ: người chơi làm MỘT việc
(đứng bắn lên trời) từ đầu tới cuối. Mỗi pha phải đổi **câu hỏi** đặt cho người chơi:

| Pha | Máu | Nó làm gì | Câu hỏi cho người chơi |
|---|---|---|---|
| SẢI CÁNH | 100–66% | bay cao, rải VỆT LỬA dọc đất | *đứng đâu cho khỏi cháy?* |
| BỔ NHÀO | 66–33% | hạ thấp, bổ dày, GỌI IMP | *dọn quân phụ hay dồn hết vào rồng?* |
| NỔI ĐIÊN | <33% | ĐÁP XUỐNG, quạt cánh hất văng | *áp sát ăn gấp đôi, hay kéo ra mất thời gian?* |

⚠ Vệt lửa rải **THÀNH VỆT** theo hướng bay, không phải một quả cầu ở chỗ mục tiêu đang đứng:
một quả cầu thì né bằng cách đi một bước, còn một vệt thì bắt người chơi ĐỌC hướng bay.
⚠ Ngưỡng `_rampagePhaseAt` phải TRÙNG `FantasyAirRaider.SetPerchThreshold` — lệch hai con số là
con rồng đáp xuống vào một lúc khác với lúc HUD báo đổi pha.
⚠ Quạt cánh sát thương THẤP, lực CAO: nó không giết, nó MỞ KHOẢNG CÁCH.

### 9. SĂN RỒNG — `MissionType.DragonHunt = 18`

Nhiệm vụ riêng của thể loại. Bộ đo `MapDragonHunt`; luật thắng thua ở `MapTypes.BuildRules`.

- **Thắng:** dọn sạch bầu trời (rồng + bầy imp nó gọi).
- **Thua:** nó đốt xong nhà chính, **hoặc** hết giờ mà nó còn bay.

⚠ Vế "hết giờ" là thứ giữ nhịp cho ván: không có nó thì người chơi ngồi sau ụ che vô hạn và
**pha 3 không bao giờ xảy ra**.
⚠ Map: KHÔNG vực (đang ngước lên né lửa mà chết vì ngã hố là chết vì địa hình), KHÔNG map vòng,
`halfWidth ≥ 28`, và ụ che DÀY — vệt lửa chỉ là một quyết định khi có chỗ để chạy TỚI.
⚠ `MapDragonHunt` rải `ManaFont` LỆCH VỀ SÂN NHÀ, không trùm lên chỗ đứng mở màn (mana vô hạn).

### 10. ART FANTASY — BỘ PHẲNG, không phải painted (2026-09-08)

Atlas `FantasyRaceParts_v3` là art PAINTED kiểu render 3D cho đầu · thân · chi · bàn tay · bàn
chân. Nhưng runtime `FantasyRigPaint` **CHỈ DÙNG CÁI ĐẦU** — thân/tay/chân vẫn là silhouette
stickman nhuộm một màu phẳng. Trên sân ra **một cái đầu orc vẽ bóng đổ chi tiết cắm trên một
hình que xanh lá phẳng lì**: hai ngôn ngữ hình trong cùng một nhân vật, và 80% số tấm vẽ ra
không ai nhìn thấy. **Đó là chỗ "art Fantasy xấu" nằm, không phải chất lượng từng tấm.**

Bộ hiện hành: `FantasyRaceSilhouetteArt` (Editor) sinh `Resources/Fantasy/Races/Flat/{Chủng}.png`
— màu PHẲNG + viền tối dày + MỘT điểm nhấn sáng (con mắt), đúng bản sắc dự án (*thân stickman
đen; nhận diện bằng mặt/dáng/trang bị*). Nút: **★ Fantasy — VẼ LẠI toàn bộ đầu chủng tộc**.

⚠ Đầu là MỘT ĐA GIÁC KÍN nhìn nghiêng (gáy → đỉnh đầu → gò mày → sống mũi → mõm → hàm → cằm),
**không phải chồng hình tròn**. Bản nháp đầu tiên dựng bằng ellipse và mọi chủng ra "quả bóng
có gắn sừng".
⚠ Mọi bộ phận bám vào **MỐC NEO lấy từ chính đa giác** (`Marks`), không bám toạ độ cố định —
bản nháp thứ hai bám toạ độ và sừng/nanh BAY LƠ LỬNG ngoài đầu ngay khi đổi `headScale`.
⚠ Xem trước bằng Python (`preview_fantasy.py`, công thức trùng khít) **trước khi** port sang C#.
Ba lỗi hình trên đều bắt được theo cách đó, không cần mở Unity.
⚠ `FantasyRaceArt.FaceFor` ưu tiên bộ phẳng → atlas painted → atlas mặt đời đầu. Thiếu tấm là
nó **rơi xuống tầng dưới trong im lặng** (chủng mới đội đầu chủng cũ). Phép đo canh:
`StickmanDoctor` › *"Chủng Fantasy THIẾU ART ĐẦU"*.

⚠⚠ **CÁNH VÀ ĐUÔI LÀ VẾ HAY BỊ QUÊN NHẤT.** `FantasyCreatureLook.Build()` `return` ngay sau
khi dựng đầu, nên nhánh `Wings()`/`Horns()` trong `switch` bên dưới là **CODE CHẾT** mỗi khi
có art đầu — mà sau khi chạy tool vẽ art thì LUÔN có. Trước 2026-09-08 hậu quả là *rồng và
harpy bay mà không có cánh*, và `FantasyRaceMotion.Flap()` tìm `WingL`/`WingR` không thấy nên
**cả hệ nhịp vỗ cánh theo pha bay không điều khiển gì cả**. Không một dòng log nào.

Nay cánh/đuôi dựng trong `BuildArtLook` từ `Wing_{Chủng}.png` / `Tail_{Chủng}.png`
(`FantasyRaceSilhouetteArt.Wings.cs`). **Tên object là HỢP ĐỒNG**: `WingL` · `WingR` · `Tail`
— đổi tên là chuyển động câm lặng.

⚠ Cánh vẽ **chĩa về −X** (ra sau), pivot **mép phải**. Vẽ ngược là nhịp vỗ thành chong chóng
quay trước mặt con vật. Ba lỗi hình bắt được nhờ xem trước: lông vũ dựng bằng tam giác nhọn ra
"mớ vụn có khe hở" (phải là hình thoi CÓ BỤNG để các chiếc chồng kín) · màng cánh dơi nối
thẳng đỉnh ngón nên bao ngoài LỒI thành cái máy bay giấy (phải VÒNG LÕM giữa hai ngón) · rễ
treant không có gốc chung nên ra ba cái que rời.

Bản art ĐẸP (painted đúng rig) vẫn là đường ChatGPT: prompt ở
`Docs/KnowledgeBase/FantasyArt-ChatGPT-Prompt.md`.


### 11. KHÁNG &amp; KHẮC NGUYÊN TỐ — `ElementalAffinity` (2026-09-08)

Trường phái phép cho mỗi bài một hậu quả riêng, nhưng nếu mọi mục tiêu đều ăn đòn như nhau
thì người chơi chọn bài MỘT LẦN rồi dùng mãi — cây có hệ số cao nhất là cây đúng, hết.

`ElementalAffinity` (Combat) làm câu hỏi đổi theo TỪNG kẻ địch. Bảng số theo chủng ở
`FantasyRaceCatalog.AffinityOf`; `ApplyAffinity` là **một cửa duy nhất** để gắn.

| Chủng | Miễn | Khắc bởi | Miễn trạng thái |
|---|---|---|---|
| Rồng | lửa | băng ×2 | cháy |
| Treant | độc | **lửa ×2.5** | độc |
| Golem | đất | sét ×2 | độc·máu·ngã·chậm |
| Skeleton · Lich | ám | thánh ×2.2 | độc·máu |
| Quỷ · Imp | lửa | thánh/băng ×2 | cháy |
| Troll | băng | **lửa ×2.4** | — |
| Naga | băng | sét ×2.2 | — |
| Wisp | thánh | ám ×2 | độc·máu |
| Lùn | đất | lửa ×1.6 | — |
| Orc · Minotaur | — | băng ×1.8 | — |
| Harpy · Gryphon | — | sét ×2 | — |
| Tiên | — | ám ×2 | — |
| Goblin | — | lửa ×2 | — |

⚠ **Mỗi chủng khắc bởi ĐÚNG MỘT trường phái, miễn nhiều nhất MỘT.** Cho một con vừa miễn hai
vừa khắc hai là người chơi không đọc nổi, và "mang cây nào" biến thành trò thử-sai.

⚠ **`Arcane` là giá trị TRUNG TÍNH**, không phải một lỗ hổng: hư không vốn là "không nguyên
tố" và là mặc định của mọi vũ khí cũ — chặn nó là chặn luôn mọi đòn thường trên đời.

⚠ **Chốt chặn miễn nhiễm TRẠNG THÁI đặt trong `StickmanStatus.TryApply`**, không rải ở từng
nguồn. Đó là cửa duy nhất mà vũ khí · đạn · vùng lửa · bẫy đều đi qua, nên chặn một chỗ là bộ
xương miễn độc trước MỌI nguồn độc, kể cả nguồn thêm sau này.

⚠ Vế AI là `AIModuleKind.SpellChoice` (`Playbook_Arcane`). **Thiếu module này thì cả hệ khắc
chế chỉ có tác dụng với NGƯỜI CHƠI** — đội máy đứng phun lửa vào con rồng miễn lửa suốt trận.
Nó chọn theo THỨ ĐANG ĐỨNG TRƯỚC MẶT; `WeaponSwap` chọn theo CỰ LY. Hai trục, lắp chung được.

### 12. CƯỠI QUÁI BAY — `FantasySkyMount`

Người chơi bấm **F** cạnh con gryphon để trèo lên, lái nó, và vẫn bắn/niệm phép xuống.

⚠ **KHÔNG có hệ bay thứ hai.** `FantasyAirRaider.SetPilot()` chỉ đổi nguồn lệnh; đường bay
vẫn qua đúng `Fly()`, nên luật đo mặt đất · bắn rơi · hạ cánh chỉ tồn tại MỘT bản — và người
chơi cũng không lái được con vật chui xuống lòng đồi.

Mượn nguyên: `VehicleRider.SitAt(..., RiderPosture.Gunner)` (đứng thẳng, giữ vũ khí, chỉ mất
đôi chân — đúng cách lính đứng trong giỏ khinh khí cầu) và `MoveAxis`/`ClimbAxis` (cùng bộ
phím đi bộ, nên điện thoại không phải học nút mới).

⚠ Con vật **chết là phải thả người cưỡi NGAY**: `VehicleRider` ghim ở `LateUpdate`, không thả
là người cưỡi treo lơ lửng giữa trời tới hết trận (bẫy đã dính một lần ở khinh khí cầu).

⚠ Cưỡi thì con vật **đổi phe theo người cưỡi** — không thì người chơi ngồi trên lưng một con
đang cắn chính đồng đội mình.

### 13. VẾT NỨT HƯ KHÔNG — `MissionType.ArcaneRift = 19`

Mấy vết nứt **TRÔI NGANG** nhả quái liên tục; đập vỡ hết là thắng.

⚠⚠ **Vế DI CHUYỂN là toàn bộ lý do nhiệm vụ này tồn tại.** `Survival` hỏi *"trụ được bao
lâu?"* và lời giải tối ưu luôn là **chọn một chỗ tốt rồi đứng yên** — chọn MỘT LẦN, xong ván.
Nứt trôi thì câu hỏi thành *"bỏ chỗ đang đứng lúc nào?"*, và phải trả lời lại vài lần mỗi ván.
Bỏ vế trôi đi thì nên xoá nhiệm vụ này và dùng `Survival`.

⚠ Luật thắng là `Destroy(MapObjectiveRole.Structure)`, **không phải `Wipe`**: quái sinh vô tận
nên "diệt sạch địch" không bao giờ đúng — phải phá đúng NGUỒN.

⚠ Vết nứt phải gọi `MapObjective.Attach`. Không gắn nhãn thì đập vỡ hết nứt **vẫn không
thắng**, và không có gì báo — ván chỉ đơn giản không bao giờ kết thúc.

⚠ Map: rộng nhất nhóm Fantasy (`halfWidth ≥ 30`), **nhiều thềm/thang hơn ụ che** — nứt trôi
nên giá trị nằm ở chỗ ĐI LẠI NHANH, không phải một chỗ nấp tốt.

### 14. TÁM CHỦNG 2026-09-09 + VŨ KHÍ ĐẶC TRƯNG (`TrySignatureWeapon`)

`FantasyCreatureKind` nay 30 giá trị; `FantasyHouses.Count = 10`. Tám chủng nối qua **đúng 9 điểm
của `CreatureIntake.md`** bằng một script sinh từ bảng (`gen_races.py`) — không sửa tay 72 chỗ.

| Chủng | Vai | Cơ chế riêng | Vũ khí đặc trưng | Khắc bởi |
|---|---|---|---|---|
| Elf | tầm xa | — (nấp + giữ khoảng cách) | Longbow | ám |
| Con người | tuyến trước | — **cố ý không có mánh**: là MỐC để đo mọi chủng khác | Sword (+ nón/giáp người) | — |
| Khổng lồ | công thành | `FantasyGiantStomp` — giậm đất hất văng + ngã | Warhammer | sét |
| Ogre | tuyến trước | `FantasyOgreRage` — dưới nửa máu thì nhanh & lì, **một chiều** | Club | lửa |
| Nhân mã | quấy rối | — (kỵ xạ: bắn rồi chạy) | HorseBow | băng |
| Long nhân | tuyến trước | `FantasyDragonbornBreath` — vệt lửa ngắn trước khi giáp lá cà | Greatsword | băng |
| Ma cà rồng | quấy rối | `FantasyVampireHunger` — hút máu mỗi đòn; đêm không rút (gương người sói) | Runeblade | thánh ×2.5 |
| Người thằn lằn | quấy rối | — (phục kích từ vật che) | Trident | băng |

⚠⚠ **VŨ KHÍ ĐẶC TRƯNG là một ĐIỂM NỐI THỨ 10**, và trước 2026-09-09 nó **không tồn tại**:
`FantasyRaceLoadout` chỉ `KeepCurrentWeaponOnly()` — mỗi con GIỮ CÂY NÓ TÌNH CỜ SINH RA VỚI.
Orc cầm cung, elf cầm búa, và "vũ khí đặc trưng" chỉ có trong tooltip. Nay
`FantasyRaceCatalog.TrySignatureWeapon(kind, out type)` là một nguồn cho cả 18 chủng, và
loadout gọi `holder.EquipType(type)` **TRƯỚC** `KeepCurrentWeaponOnly()`.

⚠ Thứ tự đó là hợp đồng: khoá kho trước rồi mới đổi cây là kho chỉ còn một cây và `EquipType`
không thấy gì. Không có cây trong kho (bị lọc theo thể loại màn) thì trả false, giữ cây đang
cầm — cầm nhầm cây vẫn hơn hẳn tay không (cùng luật `EquipNamed`).

⚠ Năm chủng của bộ quái 2026-09-09 (nhện · nhớt · người sói · oan hồn · wyvern) **cố ý không
có** cây đặc trưng: chúng đánh bằng thân. Đừng "điền cho đủ bảng".

⚠ Cơ chế theo NGƯỠNG có ba trục, cùng một khuôn "đổi profile": người sói/ma cà rồng theo
**GIỜ**, ogre theo **MÁU** (một chiều — hồi máu không hết điên, vì "đánh nó xuống nửa máu là
làm nó nguy hiểm hơn" mới là câu hỏi), khổng lồ theo **KHOẢNG CÁCH** (chỉ giậm khi có địch
trong tầm — giậm theo đồng hồ là bẫy "đồng hồ không liên quan tới trận đánh" của hệ bay cũ).

Bốn nhà mới: **Vương quốc** (Người/Elf) · **Bầy Khổng lồ** (Khổng lồ/Nhân mã; Ogre đặt tay) ·
**Triều Huyết** (Long nhân/Ma cà rồng) · **Bộ lạc Đầm lầy** (Thằn lằn/Naga). ⚠ Naga ở tuyến sau
của cả Giới Đá lẫn Đầm lầy — hợp lệ vì `KindFor` tra theo NHÀ, nhưng đừng để một chủng thành
tuyến trước ở nhà này và tuyến sau ở nhà kia: hình và hành vi sẽ nói hai câu.

### 15. ĐẦU NHỎ XÍU — art phẳng phải được TRIM (2026-09-09)

`FantasyCreatureLook.FaceScaleFor` tính cỡ đầu bằng `rigHeadWidth / face.bounds.size.x`, tức nó
cần sprite **BÁM SÁT khối đầu**. Atlas painted cũ đi qua `SliceTrimmed` nên đúng; bộ art phẳng
để nguyên canvas 96×96 có biên trong suốt rộng, khối đầu chỉ chiếm 1/3 bề ngang ⇒ **đầu bị thu
nhỏ**. Đo được trên chính bộ art:

| Chủng | Bề ngang vẽ | Canvas | Đầu nhỏ đi |
|---|---|---|---|
| Wisp | 36 px | 96 | **2.67×** |
| Human | 41 px | 96 | 2.34× |
| Orc | 45 px | 96 | 2.13× |
| Fairy · Elf | 50 px | 96 | 1.92× |
| Dragon | 79 px | 96 | 1.22× |

⚠⚠ Chênh lệch giữa các chủng cũng là lỗi: wisp nhỏ đi 2.67× còn rồng chỉ 1.22×, nên **cỡ đầu
giữa các chủng sai tương quan với nhau** chứ không chỉ sai tuyệt đối. Đây là thứ dễ đổ nhầm cho
`headScale` trong bảng và đi chỉnh số ở đó — chỉnh mãi không đúng, vì lỗi nằm ở khổ ảnh.

Luật: **generator phải TRIM về biên không trong suốt trước khi ghi**, và ghim `spritePivot`
vào **TÂM SỌ** (`SpriteAlignment.Custom`), không phải tâm ảnh.

⚠ Vì sao không dùng lại `.headanchor.json` như bộ nón: `StickmanRigMetrics` nằm ở
`Assets/Editor/` — **runtime không đọc được sidecar**. Nên phép đo phải bake vào chính khổ ảnh
và pivot.

⚠ Vì sao pivot phải là tâm SỌ chứ không phải tâm ẢNH: sừng dài, mõm rồng và bờm kéo lệch trọng
tâm hình. Trim xong mà để `Center` là cái đầu treo lệch khỏi cổ đúng bằng phần thò ra.

### 16. NHÀ THUẦN CHỦNG · ART LÚC CHẾT (2026-09-09)

**42 nhà = 12 LIÊN MINH (kê tay, ghép hai chủng khác vai) + 30 THUẦN CHỦNG (một chủng một nền
văn minh).** Chỉ số ≥ `FantasyHouses.AllianceCount` nghĩa là nhà thuần; chủng lấy từ
`FantasyRaceCatalog.All[i - AllianceCount]`.

⚠⚠ **Không kê tay 30 giá trị enum.** Bảng chủng còn dài thêm, mà mỗi lần thêm chủng lại phải
nhớ thêm một giá trị enum + một `case` ở ba hàm là chắc chắn sót — đúng cái bẫy "điểm 9: chỗ ra
sân" đã dính với Ogre và Minotaur (có đủ 8 điểm nối mà **chưa từng xuất hiện**). Tính từ
`FantasyRaceCatalog.All` thì thêm chủng là TỰ có nền văn minh.

⚠ Giá trị 0–11 KHÔNG đổi ⇒ scene đã bake nhà liên minh vẫn đúng.

⚠⚠ **BỘ CHIA PHE PHẢI GẮN BỘ LÁI BAY.** Trước đó nó chỉ khoác HÌNH và TÍNH CÁCH; `FantasyAirRaider`
do từng builder màn gắn tay. Nên harpy/gryphon đi qua đường này vừa **không bay** (không ai lái)
vừa **không có tính cách** (`FantasyRaceTactics` cố ý bỏ qua chủng bay vì "đã có bộ lái bay lo")
— nó đứng làm hình nộm, không một dòng log. Bẫy chỉ lộ ra khi nhà thuần chủng mở đường cho
chủng bay ra sân qua bộ chia phe.

#### Art lúc CHẾT phải đi ĐÚNG CỬA của lúc sống

Hai lỗi riêng biệt, cùng triệu chứng *"art khi chết không đồng bộ với khi sống"*:

1. **ĐẦU ĐỔI NGUỒN.** Sống đi qua `FantasyRaceArt.FaceFor` (ưu tiên bộ PHẲNG hiện hành); chết đi
   qua `PartFor(kind, "Head")` — hàm đó **chỉ đọc atlas painted cũ**. Mọi chủng đổi đầu ngay khi
   chết, và 13 chủng nối sau (không có trong atlas cũ) thì `PartFor` trả null ⇒ **xác đội đầu
   stickman đen trơn**.
2. **CÁNH/ĐUÔI BIẾN MẤT.** Chúng là con của `FantasyLook`, nằm dưới nhóm Sprite SỐNG — nhóm đó bị
   TẮT khi chết. Lớp đắp của `StickmanLook` sống sót được là nhờ nó tự gọi
   `StickmanCorpseGear.KeepOn` ở `Died`; cánh/đuôi Fantasy thì **không ai giao**. Con rồng chết
   là mất cánh.

Luật: mọi đường lấy art của XÁC phải gọi **cùng một hàm** mà lúc sống gọi, và mọi thứ đắp thêm
phải được `KeepOn` sang part ragdoll. Thêm một lớp đắp mới = thêm một dòng vào `OnOwnerDied`.

### 17. `FantasyRaceTactics` LÀ MỘT CỬA — và ba lỗi rà soát 2026-09-09 tìm ra

`FantasyRaceTactics` là component mà **MỌI** đường sinh quái đều gắn (bộ chia phe · sân Văn minh ·
vết nứt hư không · trùm gọi quân phụ · săn rồng · builder màn xâm lăng). Nên nó — không phải bộ
chia phe — là chỗ đặt những thứ *mọi con Fantasy đều phải có*:

| Đặt ở `FantasyRaceTactics.Start` | Vì sao |
|---|---|
| `EnsureBehaviour` | cơ chế riêng của chủng |
| `ApplyAffinity` | kháng/khắc nguyên tố |
| `FantasyAirRaider` cho chủng bay | không có thì vừa không bay vừa không có tính cách |
| tinh chỉnh `AIProfile` | tính cách chủng (chỉ chủng đi bộ) |

⚠⚠ **Lỗi 1 — kháng/khắc chỉ chạy ở hai chỗ.** `ApplyAffinity` từng được gọi ở bộ chia phe và
`MapDragonHunt` thôi, nên quân của **sân Văn minh không có kháng/khắc nào** — cả hệ tám trường
phái im lặng ở đúng cái sân dựng ra để soi nó.

⚠⚠ **Lỗi 2 — chủng bay đứng làm hình nộm.** Nhánh chủng-bay `return` sớm (đúng: bộ lái bay lo
tính cách), nhưng **không ai gắn bộ lái bay** ở đường bộ chia phe / sân Văn minh. Harpy và Dragon
có sẵn trong roster sân Văn minh và đã dính đúng lỗi này.

⚠⚠ **Lỗi 3 — cỡ đầu lúc chết ≠ lúc sống.** Sống chia theo BỀ NGANG và nhân `FaceCover`; xác có
công thức riêng dùng `max(rộng, cao)` và quên nhân. Chủng có đầu CAO hơn RỘNG lệch nặng nhất:
**treant 1.53× · lùn 1.37× · khổng lồ 1.19×**. Nay cả hai gọi
`FantasyCreatureLook.HeadScaleFor` — **một hàm**.

#### Sân Văn minh phải đếm theo BẢNG NHÀ

`FantasyCivilizationArena.Step` từng đếm theo `Factions.Length` (roster gõ tay = 3), nên dù bảng
nhà đã lên 42 thì hai nút ◀ ▶ **chỉ đi qua ba nhà** — 39 nhà thêm sau vô hình. Chính chú thích
đầu file đã dặn *"thêm nhà mới phải nối vào CẢ HAI"*, nhưng không ai nối nổi vì roster phải gõ tay.

Nay `SpecOf` **tự sinh roster** cho nhà chưa có (hai tuyến trước + bốn tuyến sau, vũ khí mặc định
theo vai — `FantasyRaceLoadout` tự đổi sang vũ khí đặc trưng ngay sau đó). Thêm chủng ⇒ tự có nhà
thuần ⇒ tự chơi được, không phải nhớ gõ bảng thứ hai.

⚠ Ba roster gõ tay đầu tiên GIỮ NGUYÊN — chúng đã cân số máu/vũ khí bằng tay.

### 18. "KHÔNG THẤY GÌ LÀ FANTASY" — bốn lỗi im lặng còn lại (2026-09-09)

Người chơi mở sân lên và nói *hình dạng kích thước không đúng · AI không khác gì · tính năng không
có gì fantasy*. Đo thẳng vào code thì cả ba cảm giác đều đúng, và **không cái nào là thiếu tính
năng** — đều là thứ đã viết mà không nối tới chỗ nhìn thấy được:

| Cảm giác | Đo được | Sửa |
|---|---|---|
| **Kích thước sai** | `bodyScale` (khổng lồ 1.55 · rồng 1.35 · imp 0.70) chỉ áp ở 3 chỗ đặc biệt; bộ chia phe + sân Văn minh **không** áp ⇒ khổng lồ to bằng orc | `FantasyRaceTactics.ApplyBodyScale()` — một cửa, có cờ; **bỏ** 3 chỗ áp tay (nhân hai lần) |
| **Đầu tách rời lúc chết** | `FantasyHeadReplacement` dán vào XƯƠNG; `headRagdoll` tách ra ngã theo thân, xương đứng nguyên ⇒ **hai đầu** | `FantasyCreatureLook.OnOwnerDied` tắt bản sống; đầu xác là việc của `FantasyCorpseLook` |
| **Tia sét vô hình** | `MagicWeapon.CastChain` đánh tức thì, không sinh hiệu ứng nào | `BulletTracer.Show(from, at, true)` mỗi cú nhảy |
| **AI không khác gì** | trận MẶC ĐỊNH (Tiên/Lùn vs Orc/Goblin/Troll) **không con nào có cơ chế** — cơ chế nằm hết ở nhà thứ 6 trở đi | `FantasyOrcWarCry` (con đầu chạm địch ⇒ cả bầy orc trong 4.5 đổi màu, lao lên 6 s, mỗi con gầm 1 lần) · `FantasyTrollRegen` (0.9 máu/s sau 2.5 s không trúng đòn — lý do troll SỢ LỬA) |
| ↑ phía Tiên cũng vậy | Lùn/Tiên: "không rút · ưu tiên cứu" chỉ là số trong `AIProfile` | `FantasyDwarfShieldWall` (hai lùn kề nhau ≤1.35 ⇒ ăn 60% sát thương, ánh thép; tách ra là tắt — NHÂN/CHIA `DamageTakenScale` hệ số của mình, không gán tuyệt đối) · `FantasyFairyBlessing` (3 s một lần chữa 0.35 cho đồng minh bị thương nhất trong 3.0, dấu nổi của túi cứu thương) |

Doctor có check **«TRẬN ĐẦU TIÊN không có cơ chế nào nhìn thấy được»**: mỗi roster gõ tay của sân
Văn minh phải gọi ≥1 chủng `HasBehaviour` — đo trên văn bản nguồn, không cần scene.

Bài học chung cho ba mục 16–18: **tính năng không được nhìn thấy = không tồn tại**. Khi thêm cơ
chế, phải trả lời *người xem thấy nó ở đâu* (đổi màu · hiệu ứng · thanh máu) và *nó có ra sân
trong trận đầu tiên không*. Viết xong Doctor-check chưa đủ; Doctor không nhìn màn hình.

⚠ Pivot đầu = **tâm HỘP SỌ** (trung bình gáy·đỉnh·gò mày·góc hàm), không phải trọng tâm đa giác:
mõm rồng kéo trọng tâm về trước, đặt pivot ở đó là cả cái đầu lùi ra sau cổ. Sửa generator xong
phải bấm «★ Fantasy — VẼ LẠI toàn bộ đầu chủng tộc» (PNG mới ghi đè pivot).


### 19. XƯƠNG CHÂN CHO CHỦNG KHÔNG PHẢI HAI CHÂN (2026-09-15)

Chủng HAI CHÂN mượn nguyên rig stickman nên đi/chạy/đánh đúng từ ngày đầu. Mười chủng còn lại
thì không: cả con vật chỉ là **một tấm PNG có sẵn bốn (hoặc tám) cái chân vẽ chết bên trong**,
dán vào nhóm `Sprite`. Trên sân con rồng **trượt ngang với bộ chân đứng im**. Không lỗi biên
dịch, không một dòng log — đúng loại bẫy phải chặn bằng phép đo chứ không bằng một đoạn ⚠.

**Cách chữa: không viết hệ đi bộ thứ hai.** Dự án đã có chuỗi xương 2 khúc + `LimbSolver2D` chạy
cho 14 con vật (`StickmanHorse`), và sải chân ở đó SUY RA từ tầm với nên không thể trượt chân.
Việc còn lại chỉ là cắt art và nối số.

| Mảnh | File | Vai trò |
|---|---|---|
| bảng xương | `FantasyBeastLayout.cs` (**runtime**) | số chân · chiều dài chân · chỗ khớp trước/sau · pivot tấm thân · bề dày chân |
| dựng | `FantasyBeastRig.cs` | đo rig thật → đặt nút → gọi `StickmanHorse.Build` → giao xác lúc chết |
| art | `FantasyRaceSilhouetteArt.Legs.cs` | vẽ `LegUpper_<Chủng>` · `LegLower_<Chủng>`; `.Plans.cs` thôi vẽ chân vào thân |
| N chân | `StickmanHorse.Build(..., legCount, frontLegX, rearLegX)` | 4 chân mặc định giữ y nguyên; nhện 8 · wyvern 2 |

⚠⚠ **BẢNG XƯƠNG PHẢI NẰM Ở RUNTIME.** Trước đây bộ số hình dáng nằm private trong tool vẽ
(`QuadrupedShape`), nên lúc chạy không ai hỏi được nó. Hai bảng là art và xương lệch nhau mà
không ai báo. Nay tool vẽ hỏi lại đúng `FantasyBeastRigTable`.

**Hai hợp đồng hình học** — sai là chân rời khỏi thân hoặc móng lơ lửng, cả hai đều im lặng:

1. **Pivot tấm thân = `layout.pivotY`.** `StickmanHorse.BuildBody` thả pivot vào đúng độ cao đó
   rồi mọc chân ra từ chính chỗ ấy. Với nhân mã đây là **CHỖ YÊN** (chỗ thân người mọc ra), đúng
   hợp đồng cũ của bộ thú; với rồng/nhện thì là đường khớp.
2. **Pivot khúc chân ở ĐẦU TRÊN, và tấm cao ĐÚNG MỘT KHÚC** (`legLength × 0.62`). `AddVisual` co
   sprite theo chiều cao, nên vẽ thừa một cái móng thò ra ngoài khung là cả khúc chân bị nén lại
   đúng bằng phần thừa.

⚠ **NHÂN MÃ CO THEO CHỖ YÊN, KHÔNG THEO CHIỀU CAO TỔNG.** Thân người là rig stickman, hông nó
nằm cố định ở ~0.35 chiều cao — mình ngựa phải vừa khít khoảng ĐẤT → HÔNG. Co theo chiều cao
tổng là con ngựa to gần gấp đôi và **thân người ngồi lọt trong bụng nó**. Naga/oan hồn dính cùng
một lỗi theo chiều ngược lại: tấm nửa dưới thả vào `y = 0` nên cuộn đuôi tụt hẳn xuống dưới chân.

⚠ **MẶT ĐẤT ĐO BẰNG ĐẦU IK CHÂN, KHÔNG ĐO BẰNG BOUNDS RENDERER.** Lúc `FantasyCreatureLook`
dựng (ngay sau `Instantiate`, trước `LateUpdate` đầu tiên) thì `IKManager2D` CHƯA giải lần nào:
hai bàn chân còn ở tư thế lưu trong prefab, cao hơn chỗ chúng sẽ đứng **0.18 world ≈ 19% chiều
cao người**. Ai đo đáy renderer ở thời điểm đó cho cả con vật lơ lửng đúng ngần ấy.

⚠ **`StickmanMount.DiscardStrayMount` quét vật cưỡi thừa theo LỚP.** Bộ chân này cũng là
`StickmanHorse`, nên nó phải mang cờ `IsBodyRig = true` — thiếu cờ là một chủng bốn chân vừa trèo
lên vật cưỡi thì bộ chân của CHÍNH NÓ bị huỷ, im lặng tuyệt đối.

#### Chủng hai chân KHÔNG có vỏ ngực — và tấm cũ vẫn còn trong game tới hôm nay

Mục 10 ghi rằng bản 2026-09-09 đã bỏ vỏ ngực `Torso_*` cho 21 chủng hai chân (ảnh chụp trong
game ra *một cái đầu to, một khối hộp, hai que chân*). Đúng một nửa: **tool vẽ thôi sinh tấm đó,
còn runtime vẫn đọc file cũ trên đĩa**. Tấm cao 0.25 với pivot ở ĐÁY, dán ở gốc nhóm `Sprite` ⇒
nó nằm quanh ỐNG CHÂN suốt từ đó. `FantasyRaceArt.FigureFor` nay trả `null` cho `Biped`: bản sắc
chủng hai chân là **CỠ THẬT + HÌNH ĐẦU** (+ bộ mảnh painted khi có).

Bài học: *bỏ một thiết kế thì phải bỏ ở CẢ HAI đầu* — chỗ SINH ra asset và chỗ ĐỌC asset. Bỏ một
đầu thì thứ đã bỏ vẫn sống trong game, mà tài liệu lại ghi là đã xong.

#### Phép đo canh (Doctor, ba dòng)

| Dòng | Đo gì |
|---|---|
| «Chủng Fantasy THIẾU ART CHÂN» | 5 chủng có đủ `LegUpper_`/`LegLower_`/thân chưa |
| «Art chân Fantasy KHÔNG KHỚP bảng xương» | pivot tấm thân · pivot khúc chân · chiều cao khúc so với bảng |
| «Quái Fantasy lắp ra KHÔNG đứng trên mặt đất» | **LẮP THẬT** lên `StickmanNPC.prefab` trong scene prefab riêng rồi đo móng so với đầu IK chân |

Dòng thứ ba là dòng duy nhất trả lời được câu cuối. Hai dòng trên chỉ soi asset; đã hiệu chuẩn
bằng cách cố tình dời nút rig +0.35 local ⇒ cả 5 chủng báo lệch +0.087 world, đúng bằng
`0.35 × 0.25` (scale gốc prefab).
