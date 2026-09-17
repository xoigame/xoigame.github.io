## ⚠⚠ ARPG KIỂU DIABLO — anh hùng BỀN VỮNG, đồ ROLL ngẫu nhiên, 5 chương + hầm vô tận (2026-09-09)

Thể loại **Trung cổ**, một anh hùng **đơn độc**. Hai `MissionType`: `DungeonDelve = 22` (hầm
ngục) và `BossLair = 23` (hang trùm). Hai scene: `Demo_64_ARPG_ThiTran`, `Demo_65_ARPG_HamNguc`.
Nút dựng: **`★ ARPG · Diablo 2D`** trong Bảng điều khiển.

### ⚠⚠ ĐIỀU LÀM NÓ KHÁC MỌI KIỂU CHƠI KHÁC CỦA HỆ MAP

Thứ đi qua giữa các ván **không phải một con số độ khó** mà là **MỘT NHÂN VẬT CÓ ĐỒ**
(`ArpgHero`, lưu trong `PlayerProfile`). Mọi kiểu chơi khác mở màn bằng hai đạo quân do map
phát; ở đây phe người chơi là ĐÚNG MỘT người, và sức mạnh của người đó nằm trong **bản lưu**
chứ không nằm trong `MapDefinition`.

Hệ quả bắt buộc nhớ khi sửa:
- **Đừng áp `GameDifficulty` lên phe người chơi** ở hai kiểu này (nhân quân số, nâng cấp vũ khí
  phe mình...). Bậc khó của ARPG là `ArpgDifficulty`, và nó ăn vào **QUÁI**, không ăn vào anh hùng.
- **Đừng bật đường cong độ khó** (`MissionContext.escalation`). Viện binh bơm quân vào chỗ vừa
  dọn xong, phá đúng nhịp *"đánh một cụm → thở → nhìn đồ rơi → đi tiếp"* mà cả thể loại sống nhờ.
- **Đừng thêm đồng hồ trận.** Không ai mở túi so hai món đồ khi còn 40 giây.

### BỐN TRỤ, VÀ CHỖ CHÚNG THẬT SỰ NẰM

| Trụ | File | Ghi chú sống còn |
|---|---|---|
| Anh hùng bền vững | `Core/ArpgHero.cs`, `ArpgRun.cs` | lưu qua `PlayerProfile.arpgHero`; `ArpgRun` là `static` nên **mọi thay đổi đáng giữ phải gọi `ArpgRun.Persist()` ngay tại chỗ** |
| Đồ roll affix | `Core/ArpgItem.cs`, `ArpgAffix.cs` | độ hiếm = `GearTiers` 0–5, **không có thang thứ hai** |
| Chỉ số → nhân vật | `Combat/ArpgStatBinder.cs` | **cửa duy nhất** vặn số lên `StickmanController` |
| Thế giới | `Core/ArpgWorld.cs` | 5 chương × 4 màn (3 hầm + 1 trùm) × 3 bậc khó + hầm vô tận |

### ⚠⚠ BẪY SỐ MỘT: MẤY Ô SỐ NHÂN LÀ **MỘT Ô**, KHÔNG PHẢI CHỒNG BUFF

`DamageDealtScale` · `DamageTakenScale` · `AttackSpeedScale` mỗi cái là **một ô số**, và đã có
bốn người ghi: `HeroCommander`, `CampGeneral`, `ArenaMode`, `ZombieSquadUpgrades`.
`EconomyProfile` **đã từ chối** thành người ghi thứ năm và ghi rõ lý do trong tooltip của nó.

`ArpgStatBinder` giải bằng cách **nhớ phần của chính mình** (`_appliedDamage`…) rồi mỗi lần làm
mới thì **chia ra phần cũ, nhân vào phần mới** — đúng khuôn `MartialQi.GuardBody`. Cách đó chỉ
đúng khi **không có người ghi thứ hai trên cùng nhân vật**, nên:

> **Anh hùng ARPG KHÔNG được mang `CampGeneral` / `HeroCommander` / `StickmanExperience`.**

`MapArpgDungeon.TryBindHero` **gỡ `StickmanExperience`** khỏi người chơi (prefab lính có sẵn nó).
Mất chốt đó là hai hệ cùng ghi máu tối đa, máu nhảy qua nhảy lại, **không lỗi nào báo**.
`StickmanArpgCheck` canh đúng chốt này.

### ⚠⚠ BẪY SỐ HAI: `SetMaxHealth` HỒI ĐẦY MÁU

`StickmanController.SetMaxHealth` đặt `_health = _maxHealth` cho người còn sống — đúng ở chỗ nó
sinh ra (spawn quân, đặt máu công trình). Nhưng binder gọi lại **mỗi lần đổi một món đồ**, nên
dùng bản đó là mở túi đổi cái nhẫn qua lại = **hồi đầy máu miễn phí giữa trận trùm**. Dùng
`SetMaxHealthKeepingRatio` (thêm 2026-09-09). Cùng họ với bẫy `StickmanEquipment.RefreshGearRule`.

### ⚠⚠ BẪY SỐ BA: MỘT DÒNG CHỈ SỐ / MỘT HÌNH CHIÊU KHÔNG AI ĐỌC

- Thêm giá trị vào `ArpgAffixKind` mà không ai đọc ⇒ món đồ vẫn ghi *"+18% chí mạng"* và con số
  đó **vô nghĩa**. Bảng «núm thật» nằm ngay trong chú thích của enum — nó là hợp đồng.
- Thêm giá trị vào `ArpgSkillShape` mà `ArpgSkillCaster.Execute` thiếu `case` ⇒ chiêu **trừ khí
  thế, vào hồi chiêu, hiện tên trên HUD và không làm gì**.
- `StatusEffectType` **không có giá trị "None"** (mặc định là `Burn = 0`). Cổng gieo trạng thái
  là **`duration > 0`**, không phải loại. Chiêu khai trạng thái mà quên `duration` thì không bao
  giờ dính; chiêu không định gieo gì mà lỡ có `duration` thì **mọi nhát chém đều đốt cháy**.

Cả ba do `StickmanArpgCheck` đo (menu «Soát hệ ARPG», và Doctor gọi tự động).

### ⚠⚠ BẪY SỐ BỐN: QUÁI PHẢI LỚN THEO **CẤP**, KHÔNG CHỈ THEO BẬC KHÓ

Máu anh hùng lớn khoảng **+11.9 mỗi cấp** (22 ở cấp 1 → 681 ở cấp 40). Bản đầu chỉ nhân sức
quái theo bậc khó, nên con quái ở Chương V đánh đúng bằng con ở Chương I: **chiến dịch càng đi
càng dễ**, từ giữa game không có cách nào thua, và cả hệ trang bị mất lý do tồn tại (không ai
cần giáp tốt hơn khi 47 đòn mới chết).

`ArpgRun.CurrentLifeScale`/`CurrentDamageScale` nhân **hai trục**: bậc khó (hoặc tầng hầm) ×
`ArpgWorld.LevelLifeScale/LevelDamageScale`. Phép đo là bảng «số đòn để anh hùng gục» ở
[KnowledgeBase/Arpg.md](../KnowledgeBase/Arpg.md) §3b — **cột đó phải PHẲNG** suốt chiến dịch.
Không có lỗi nào báo chuyện này; nó chỉ lộ ra khi ngồi tính bằng số hoặc khi chơi tới Chương IV
và thấy chán.

### ⚠⚠ BẪY SỐ NĂM: BA CHIÊU CHẠY TRONG MỘT FRAME LÀ BA CHIÊU HỎNG

Hai hình chiêu KHÔNG làm xong trong một frame được, và cả hai đều hỏng trong im lặng:

| Hình | Hỏng thế nào nếu làm gọn trong một frame |
|---|---|
| `Dash` | `StickmanLocomotion.FixedUpdate` ghi đè `linearVelocity.x` MỖI nhịp vật lý (~20 ms) ⇒ cú lướt bị xoá trước khi mắt thấy. Phải giữ một CỬA SỔ rồi ghi lại vận tốc trong `FixedUpdate` của chính mình — đúng cách `MartialQinggong` làm |
| `Volley` | `WeaponBase.TryAttack` mở đầu bằng `if (!IsReady) return false` ⇒ vòng `for` bắn 7 phát ra **đúng một** mũi. Phải rải qua nhiều frame và gọi `WeaponBase.ClearCooldown()` từ phát thứ hai |

`WeaponBase.ClearCooldown` là **cửa hẹp chỉ cho chiêu bắn loạt**: nó không đụng tới đạn và
không đụng `IsBusy`. Đừng gọi nó ở nhịp đánh thường hay từ AI — đó là bỏ hẳn tốc đánh khỏi
bảng cân bằng vũ khí.

### ⚠⚠ NHÌN PHẢI RA HẦM NGỤC — BỐN VẾ, VÀ CHÚNG LÀ **DỮ LIỆU**, KHÔNG PHẢI ART MỚI

Người dùng chạy thử bản đầu và nói *"nhìn không giống game Diablo"* (2026-09-09, kèm ảnh: bãi
cỏ xanh giữa trưa, núi, thông, và một tuyến lính trung cổ đội mũ trụ cầm khiên tròn dàn hàng).
Không có gì SAI trong code — nó chạy đúng y như thiết kế. Cái sai nằm ở chỗ thiết kế chưa khai
bốn ô dữ liệu:

| Vế | Khai ở đâu | Bỏ nó thì ra cái gì |
|---|---|---|
| **Quái là XÁC SỐNG** | `MapAssembler.BuildArpgDungeon` → `context.hordeTeam = armyB.teamId` | lính trung cổ có khiên — một ván dàn trận |
| **ĐẦU CỤM + TRÙM là lính CÓ GIÁP** | cờ `horde` của factory hook | cả sân một loại quái, không đọc được con nào đáng sợ |
| **ĐÊM VĨNH VIỄN** | `ArpgArena` → `dayNight.startAtNight`, `dayLength = 9999` | trời xanh giữa trưa |
| **Không đồ đồng quê** | `ArpgArena` → `economyProps = false`, `lakeCount = 0` | ruộng, kho lúa, hồ nước trong hầm |

⚠ `hordeTeam` là cơ chế CÓ SẴN của hai màn zombie (`SpawnUnit` đổi sang `MapLibrary.hordePrefab`,
giữ nguyên rig/ragdoll/hitbox/AI). Đừng đẻ đường sinh quái riêng cho ARPG — thiếu prefab bầy thì
nó tự rơi về lính thường, hỏng MỀM.

⚠ Cụm quái phải **xê dịch ngẫu nhiên**, không xếp cách đều: cách đều ra một HÀNG NGANG thẳng
tắp, và đó chính là thứ làm ảnh chụp trông như dàn trận.

### ⚠⚠ BẪY SỐ SÁU: SINH RA DƯỚI LÒNG ĐẤT

Người dùng báo *"có sinh ra ở dưới lòng đất"* cùng lượt trên. `MapAssembler.GroundPoint` neo theo
`TerrainY + 1` nên đường sinh CHUẨN không lún — nhưng có thứ xê dịch nhân vật NGAY SAU đó:
`UnitLoadout` gắn `StickmanMount` (lên ngựa là **nâng cả nhóm `Sprite`, kể cả `groundCollider`**,
bù lại bằng `SetVisualLift` — lệch một nhịp là lún nửa người), và Unity đẩy nhân vật ra khỏi
collider mà nó vừa sinh chồng lên.

`MapArpgDungeon` có hai chốt, và **cả hai đều áp cho ANH HÙNG chứ không chỉ cho quái** (anh hùng
do `MapAssembler.SpawnPlayer` sinh, không đi qua đường sinh quái):
`LandOnGround` (đo lại mặt đất ở đúng chỗ nó đang đứng, lún thì kéo lên) và `StripMount` (hầm
ngục không có kỵ binh). Anh hùng lún thì **luôn** kêu, không rơi vào hạn ngạch "một lần mỗi màn".

### ⚠⚠ BẪY SỐ BẢY: BƯỚC PHỤ LÀM HỎNG BƯỚC CHÍNH

`ArpgStatBinder.Start` làm ba việc: **chỉ số** · mặc đồ · khoác dáng. Hai việc sau đụng vào ASSET
CÓ THỂ THIẾU (prefab đổi tên, bộ hồ sơ dáng chưa dựng) — và ở bản đầu chúng chạy TRƯỚC. Một
exception ở bước dáng là `Start` dừng giữa chừng, `Refresh()` không bao giờ chạy, và anh hùng vào
hầm với **máu tối đa của prefab, không một chỉ số nào của hồ sơ**.

Trên màn hình nó hiện ra là thanh máu `0 / 30` trong khi cấp 1 phải là `22 / 22`, còn Console thì
báo lỗi ở một bước hoàn toàn khác. Nay: `Refresh()` chạy TRƯỚC, hai bước kia đi qua `TryStep`
(bắt exception, vẫn in lỗi). Và HUD có **một dòng đỏ** khi máu tối đa thật lệch khỏi máu mà hồ sơ
đòi — kiểu hỏng này phải nhìn thấy được, không được chỉ nằm trong Console.

### ⚠⚠ BẪY SỐ TÁM: PHẢN ĐÒN DỘI QUA DỘI LẠI = TRÀN NGĂN XẾP

Anh hùng có dòng «phản đòn» gặp quái «Gai Ngược»: nó đánh mình → mình phản → nó
`HealthDamaged` → nó phản → mình `HealthDamaged` → mình phản… **tất cả đồng bộ trong một
`TakeDamage`**, game đứng hình ngay nhát đầu. Mọi sát thương "theo nhịp" của dự án (phản đòn ·
cháy · độc) đều đi với `forceScale = 0` — đó là cái mốc: **chỉ phản đòn VẬT LÝ**, cả hai bên
(`ArpgStatBinder.OnHurt` · `ArpgMonsterRank.OnHurt`). Doctor canh chuỗi `info.forceScale <= 0f`
ở cả hai file.

### BỐN THỨ LÀM MỘT CĂN HẦM KHÁC MỘT DẢI SÂN CÓ QUÁI (2026-09-09, đợt ba)

| Thứ | Ở đâu | Quyết định nó ép người chơi trả lời |
|---|---|---|
| **Đền thờ** (`ArpgShrine`, 6 loại) | `MapArpgDungeon.Props.cs` | dùng phúc lành ngay hay để dành cho trùm |
| **Rương** (`ArpgChest`, 12% vàng) | cùng file | đi vòng qua cụm quái lấy hay đánh xuyên |
| **Quái canh trụ** (`TickSealGuardians`) | cùng file | đứng đâu trước khi vung nhát cuối vào cột |
| **Trùm ba pha** (`BossController`, pha cuối gọi quân) | cùng file | giữ chiêu quét tới 30% máu hay xả sớm |

- Phúc lành THEO MÀN (Trí Tuệ · Vận May) rót vào `ArpgRun.RunXpBonus/RunMagicFindBonus`, tự về 0
  khi vào màn mới, **không lưu hồ sơ** — mang sang được là người chơi lùng đền ở màn dễ trước.
- Một phím **F** cho cả ba: nhặt · mở rương · cầu phúc, lấy thứ GẦN NHẤT; dòng nhắc nói rõ sắp
  làm gì. Ba phím thì không ai nhớ và cảm ứng hết chỗ.
- `BossController.Setup` là cửa cấu hình LÚC CHẠY — `EditorSetup` nằm trong `#if UNITY_EDITOR`,
  gọi nó từ runtime là Editor xanh còn bản build ĐỎ.
- **Số sát thương bay** vẽ bằng IMGUI neo toạ độ thế giới (`MapArpgDungeon.Hud.DrawFloaters`);
  chí mạng vàng và to hơn, và số trắng bị nuốt trong cùng khung hình để không ra hai con số.
- **Đánh cược** ở cửa hàng (`ArpgLootRoller.RollGambleTier`): không bao giờ ra xám, 10% tím/cam,
  KHÔNG ăn `magicFind` — cược là cược.

### ⚠ BẪY SỐ CHÍN: `BaseBuilding` LÀ MỘT `StickmanController`

Nên TRỤ PHONG ẤN cũng mang `TeamMember` phe địch và cũng bắn `TeamMember.AnyDied` khi vỡ. Không
lọc thì đập một cái cột được XP, được vàng, rơi ra đồ và cộng một mạng vào sổ — tiến trình bị
thổi phồng trong im lặng, và người chơi tối ưu bằng cách đi đập cột. `ArpgSpoils` lọc bằng
`StickmanFighterController` (kiểu của mọi nhân vật thật; công trình chỉ là `StickmanController`
trần đã qua `ConfigureAsStructure`).

### ⚠ BẪY SỐ MƯỜI: MAP KHÔNG ĐI QUA `MatchModeBase`

Bản đầu của hệ này viết một `ArpgDungeonMode : MatchModeBase` rất tử tế — và nó là **code chết**:
scene map không gắn mode, trọng tài là `MatchDirector`. Đã bỏ; phần kết ván nằm trong
`MapArpgDungeon.OnMatchEnded` (nghe `MatchDirector.MatchEnded`). Trước khi viết một lớp mới,
**grep xem có ai `AddComponent` hay kéo tham chiếu tới nó chưa**.

### ĐỘ HIẾM = `GearTiers`, AFFIX LÀ TRỤC MỚI DUY NHẤT

| Cấp | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Màu (`LootTierMark`) | xám | trắng | lục | lam | tím | cam |
| Số dòng affix | 0 | 1 | 2 | 3 | 4 | 5 |

- **Cấp đồ (`itemLevel`) TÁCH khỏi độ hiếm**: cấp quyết định mỗi dòng MẠNH bao nhiêu, độ hiếm
  quyết định có MẤY dòng. Gộp lại là một món cam đầu game khoá cứng nửa chiến dịch sau.
- Nón/giáp/khiên **không bao giờ ở cấp 0** (`GearTiers` quy cấp 0 = "không mặc gì").
- `magicFind` chỉ đẩy trọng số **từ cấp 2 trở lên**. Nhân đều thì tỉ lệ không đổi và dòng
  «+% cơ hội đồ tốt» **nói dối**.
- Trần của mọi chỉ số nằm ở **`ArpgStats.Clamp` — một chỗ**. Đừng kê điều kiện ở từng chỗ đọc
  (đúng bẫy `GearProtects`: sáu đường đi qua nó).

### KHÍ THẾ, KHÔNG PHẢI MANA

Trung cổ không có mana. `ArpgFury` **đầy lên khi đánh** thay vì cạn dần — mana làm người chơi
LÙI RA để hồi (đúng với pháp sư), còn ARPG cận chiến cần cái ngược lại. Nó **tự tụt khi ra khỏi
giao tranh** (5 s), nếu không thì người chơi tích đầy ở cụm dễ rồi mang nguyên bể sang con trùm.

Ba bể tài nguyên của dự án, đừng nhầm: `MagicWeapon` mana (Fantasy, trên cây vũ khí) ·
`MartialQi` nội công (Võ lâm, hồi bằng ngồi vận công) · `ArpgFury` khí thế (ARPG) ·
và `StickmanLocomotion` stamina là ngân sách **CHẠY**, không phải chiêu thức.

### CHẾT KHÔNG MẤT ĐỒ, KHÔNG MẤT CẤP

Ván đó mất, tiến trình thì không. Phạt mất đồ ở một game một mình chỉ tạo ra thói quen chơi
rón rén — tức là **chơi ít đi**.

### 20 MÀN DỰNG LÚC CHẠY, KHÔNG PHẢI 60 SCENE

`ArpgArena` (`[DefaultExecutionOrder(-120)]`) dựng `MapDefinition` từ `ArpgWorld` rồi gửi qua
`MapDraftRelay` — **đúng đường xưởng map dùng để chơi thử map chưa lưu**.

- **Phải chạy trước `MapArena`**: `MapArena.Start` đọc `MapArenaRequest` một lần rồi thôi. Đặt
  lời nhắn sau đó là người chơi bấm "Chương III" và rơi vào một map dàn trận bất kỳ.
- **Thêm một chương = thêm một dòng vào `ArpgWorld`**, không dựng thêm scene. Đây là điều kiện
  để AI rẻ sửa được nội dung (xem [CheapAI.md](CheapAI.md)).
- Hai map mẫu trong `StickmanMapSystemBuilder` (`Med_ArpgDungeon`, `Med_ArpgBoss`) chỉ để kho
  map không trống và để `StickmanMissionChainCheck` đo được — **map thật không lấy từ đó**.

### HAI NGOẠI LỆ CÓ CHỦ Ý SO VỚI LUẬT CHUNG CỦA HỆ MAP

| Luật chung | ARPG làm ngược | Vì sao |
|---|---|---|
| Map NỐI VÒNG cho mọi kiểu chơi ([MapSystem.md](MapSystem.md)) | `wrapAround = false` | hầm phải có ĐẦU và CUỐI thì cửa ra mới là một cái đích |
| Vực/hố là địa hình bình thường | `pitCount = 0` | một mình một mạng: ngã hố là mất chuyến đi vì ĐỊA HÌNH |

### NHẶT ĐỒ PHẢI BẤM NÚT

Ba món của battle royale (`HealPickup`, `GearPickup`, `AmmoCache`) đi qua là ăn — ở đó đồ nào
cũng hơn tay không. Ở ARPG thì **ngược**: 90% món rơi ra là rác, túi chỉ 24 ô, và món đang mặc có
thể tốt hơn món dưới chân. Tự nhặt là túi đầy sau một cụm quái, và cơ chế túi đồ tự biến thành
hình phạt. `ArpgItemPickup` yêu cầu bấm (`F` hoặc nút).

### CHUỖI ĐIỂM NỐI (giống mọi `MissionType` khác — xem [MapSystem.md](MapSystem.md) §2)

`MapTypes` (enum) · `MissionInfo` · `MatchRules` · `MissionPlan` · `MapBlueprint` ·
`MapKitPlanner` · `MapAssembler.BuildMission` · `MapStudio.Missions` ·
`StickmanMapSystemBuilder.Blueprints`. Đo bằng «Soát chuỗi điểm nối của kiểu chơi».

### PHÉP ĐO

- **«Soát hệ ARPG»** (`StickmanArpgCheck`, Doctor gọi tự động): hình chiêu có nhánh code chưa ·
  dòng chỉ số có ai đọc chưa · chiêu khai trạng thái có `duration` chưa · bảng chương hợp lệ
  (mỗi chương 4 màn, màn cuối là trùm, cấp quái tăng dần, hầm phải có trụ) · hai scene đã dựng
  chưa · hai chốt chống tranh ô máu còn nguyên chưa.
- Sau khi sửa bảng số: bấm lại **`★ ARPG · Diablo 2D`** (nút khai `extraSources` là mấy file
  bảng, nên bảng báo "cũ" khi bạn sửa chúng mà chưa bấm lại).

### BA THỨ KHÔNG ĐƯỢC BỎ, VÌ BỎ LÀ CƠ CHẾ QUAY NGƯỢC CHỐNG CHÍNH NÓ

- **BÌNH THUỐC** (`ArpgLootRoller.TryDropPotion`) — chỉ Chiến Binh có chiêu hồi máu; dòng «hồi
  máu/giây» là AFFIX nên có thể cả chương không roll được món nào. Bỏ thuốc là ba lớp còn lại
  không qua nổi bậc Ác Mộng. Hồi theo **phần trăm** máu tối đa: máu anh hùng đi từ 22 lên hơn
  1000, nên một bình 3 máu đến giữa game là rác nằm trên sàn.
- **NÚT «BỎ DỞ · VỀ THỊ TRẤN»** (`ArpgInventoryHud`) — túi có trần 24 ô. Không có đường ra giữa
  chừng thì túi đầy = kẹt, và người chơi hợp lý sẽ chọn TỰ CHẾT. Cơ chế túi biến thành một lời
  mời tự sát.
- **NÚT «XUỐNG TẦNG KẾ»** (bảng kết ván, hầm vô tận) — thiếu nó thì `ArpgTownGate.DescendRift`
  không ai gọi và hầm vô tận chỉ chơi được đúng một tầng.
- **CHIÊU ĐẦU TIÊN Ở CẤP 1** (`ArpgRun.GrantFirstSkill`) — không có nó thì thanh phím là ba ô
  trống và mười phút đầu không có gì để bấm. Mười phút đầu ấy nói sai về cả trò chơi.

### CÒN THIẾU (chưa làm, đừng tưởng đã có)

- **Chưa chơi thử thật một ván nào** — toàn bộ mới biên dịch xanh. Bảng số đã hiệu chuẩn bằng
  PHÉP TÍNH (xem KnowledgeBase §3b) nhưng máu/sát thương nền của quái là ước lượng.
- Thị trấn là **màn hình**, không phải nơi đi lại được.
- Chưa có tiếng "nhặt đồ" / "mở rương" / "cầu phúc" trong `StickmanSoundBank`.
- Đền, rương, cửa ra, trụ đều là ĐỒ Ô VUÔNG (`ArpgCatalog.Square`) — chưa có art thật.
- Chưa có minimap; chỉ đường bằng MỘT mũi tên tới trụ gần nhất.
- Chưa có mercenary / thú cưng; chưa có ổ cắm ngọc; chưa có công thức chế đồ.
