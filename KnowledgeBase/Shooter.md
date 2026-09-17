# Thể loại BẮN SÚNG — Counter-Strike / Đột Kích chuyển sang 2D (2026-09-05)

Người dùng đặt: *"Tương tự trung cổ: hệ vũ khí bắn súng, AI, animation, chế độ chơi, map và
công trình, hình ảnh cho công trình và nhân vật, cỡ đạn và số đạn, đủ loại vũ khí, hai team
trong bốn lực lượng Cảnh sát · Quân đội · Cướp · Khủng bố, team deathmatch, đặt bom, zombie
và các chế độ khác giống Counter-Strike / Đột Kích."*

Toàn bộ đi trên **đúng bộ khung của thể loại trung cổ**. Không có `ShooterAgent`, không có
`GunHolder`, không có hệ hồi sinh thứ hai. Cái mới nằm ở đúng bốn chỗ mà game bắn súng THẬT SỰ
khác game kiếm cung: **băng đạn** · **vùng khói/lửa/chớp** · **bốn lực lượng là nền văn minh**
· **năm luật thắng**.

---

## 1. Băng đạn + nạp (`RangedWeapon`)

Cung đã có `_ammo` (KHO) + `AmmoCache` (giỏ tiếp tế). Súng thêm một bể thứ hai: **BĂNG**.

| Việc | Ở đâu |
|---|---|
| `_magazineSize` (0 = không băng, hành vi cũ) · `_reloadTime` · hai dáng nạp `_reloadPose/_reloadPoseB` | `RangedWeapon` |
| Bắn trừ BĂNG; băng cạn → **tự nạp** (`TickMagazine`), rút `TakeReserve` từ KHO | `RangedWeapon.DoAttack` / `WeaponBase.TakeReserve` |
| Nạp bị cắt khi trúng đòn (`Interrupt`) và khi cất/đổi cây (`OnUnequipped`) | `RangedWeapon` |
| Dáng nạp = **base pose** của holder (`ApplyReloadPose`), KHÔNG phải `PlayAttack` | `StickmanWeaponHolder` |
| Người chơi: phím **X** + nút **NẠP** (chung ô với ĐỠ — hai nút không bao giờ cùng hiện) | `StickmanFighterController` · `StickmanTouchControls` |
| AI: nạp SỚM khi băng dưới `reloadEarlyFraction` và đang xa/đang lùi; bắn theo LOẠT `burstShots`/`burstPause` | `RangedCombatStrategy` · `AIProfile` |
| HUD: `băng 12/30 · kho 60`, `ĐANG NẠP 45%`; F9: `↻NẠP` / `◍12|60` | `StickmanDemoHud` · `CommandHierarchyHud` |
| Bảng số băng/kho/nạp của 13 cây | `StickmanShooterWeaponBuilder.Magazines` — **nguồn sự thật**, bake vào prefab |

⚠ **`IsReady` hỏi thêm `!IsBusy`** — đang nạp hay băng rỗng thì `ShouldAttack` không vung.
⚠ **Hoả mai và súng phun lửa CỐ Ý không băng** (`StickmanDoctor.NoMagazine`). Doctor có phép đo
«Súng chưa khai BĂNG ĐẠN»: súng lớp `Firearm` mà `_magazineSize = 0` là VÀNG.
⚠ Phím **R** là "chơi lại scene" của `DemoSceneSwitcher`, nên nạp là **X**.

## 2. Vùng hiệu ứng — `AreaHazard` (Combat)

`AreaHazardKind { Smoke, Fire, Flash }`, sinh từ `ProjectileController.Explode` (field
`_hazardKind/_hazardRadius/_hazardDuration/_hazardMagnitude` trên prefab đạn).

| Loại | Làm gì | Ai hỏi |
|---|---|---|
| **Khói** | chặn tầm nhìn AI 13 s (`SmokeBlocks(a, b)`) — kề mặt (≤1.5) vẫn thấy | `StickmanAgent` (vòng quét địch + vòng kề mặt) |
| **Lửa** (Molotov · bom nổ) | mỗi 0.4 s áp `Burn` cho địch của người ném đứng trong vùng | `StickmanStatus` |
| **Chớp** | `Stun` giảm dần theo khoảng cách (trừ chủ), người chơi bị **`FlashOverlay`** trắng màn | `StickmanStatus` · IMGUI |

⚠ Hạt/hình vẽ lúc chạy (đĩa 64 px), layer `character` bậc `Effect − 100` để không chìm sau
thân đen. ⚠ Đạn về pool phải xoá ba số hazard (cùng bẫy `_statusRuntime`).

## 3. Tám cây mới + bảng đạn

`WeaponType` 53..60: **ổ xoay** (`Revolver`) · **AK** (`Carbine`) · **súng săn liên thanh**
(`AutoShotgun`) · **súng trường ngắm nhẹ** (`ScoutRifle`) · **chớp** (`Flashbang`) · **khói**
(`SmokeGrenade`) · **Molotov** · **RPG** (`Rpg`, đạn `rocket` nổ bán kính 2.2). Builder:
`StickmanShooterWeaponBuilder` (partial của `StickmanWeaponBuilder`), art vẽ bù:
`StickmanShooterArt` (partial `WeaponArtGenerator`). `Proj_Bullet` co từ 0.9 → **0.42** (viên
đạn cỡ 0.9 đọc ra như mũi tên).

| Cây | băng | kho | nạp (s) |
|---|---|---|---|
| Súng lục 12/36/1.3 · Ổ xoay 6/24/2.2 · Tiểu liên 30/90/1.7 · Súng trường 30/90/2.1 · AK 30/90/2.4 | | | |
| Súng săn 7/28/2.9 · Săn liên thanh 8/32/3.2 · Bắn tỉa 5/20/2.6 · Ngắm nhẹ 10/40/2.2 | | | |
| Phóng lựu 6/12/3.2 · Trung liên 100/200/4.6 · RPG 1/3/3.8 · Súng cổ (`Gun`) 20/60/1.8 | | | |

## 4. Bốn lực lượng = nền văn minh thể loại Hiện đại

`CivilizationDefinition` có **`genre`** + **`sideArms`** (vũ khí phụ mở trong kho — lựu đạn
chớp/khói/Molotov để `AIWeaponSwapModule` rút ra khi địch túm tụm). Bảng:
`StickmanCivilizationBuilder.Modern.cs` (`ModernSpecs`, partial). Art vẽ bù: `ModernFactionArt.cs`
(nón · giáp · khiên chống bạo động · mặt nạ/kính), thư mục `Sprites/Civilizations/<Police|Army|Robbers|Terrorist>/`.

| Lực lượng | Chất | Chủ lực | `sideArms` |
|---|---|---|---|
| Cảnh sát | khiên chống bạo động + súng lục, SWAT | tiểu liên · súng săn · ngắm nhẹ | chớp · khói |
| Quân đội | giáp đầy đủ, chậm mà lì | súng trường · trung liên · phóng lựu · RPG · quân y | lựu đạn · khói |
| Cướp | ĐÔNG và NHẸ (Levy) | ổ xoay · tiểu liên · săn liên thanh · dao găm | Molotov |
| Khủng bố | AK + RPG, thô mà nặng | AK · săn liên thanh · ngắm nhẹ · ném lựu đạn | Molotov · khói · lựu đạn |

⚠⚠ **`CivilizationLibrary.Count/Get/Random/RandomExcept` KHÔNG THAM SỐ = TRUNG CỔ** (cố ý —
hơn mười chỗ của 15 nền được viết trước khi bốn lực lượng vào chung sổ). Thể loại khác hỏi
`CountOf/GetOf/RandomOf/RandomExcept(genre, …)`. `CivilizationTeamAssigner._genre` (builder
truyền qua `AddCivilizationAssignerShared(mode, genre, fixedByTeam)`), `MapAssembler` và
`MapGenerator` bốc theo `GenreOf(map)`. Kit map Hiện đại nay `useCivilizations = true`.
⚠ `LoadAuthoredSpritesByPrefix` lọc bỏ art code-gen; **không có art thật thì lấy tấm vẽ bù** —
không thì bốn lực lượng ra trận KHÔNG NÓN KHÔNG GIÁP mà không lỗi nào báo.
⚠ Rank khai TAY từng quân chủng: luật mặc định `Ranged → Levy` (đầu trần) đúng cho cung thủ,
nhưng cả bộ súng đều là "Ranged".

## 5. Bảy chế độ (Demo_42..48) — `StickmanShooterModeBuilder` + `StickmanModernCampBuilder`

| Scene | Mode | Luật |
|---|---|---|
| `Demo_42_TeamDeathmatch` | `TeamDeathmatchMode` | đếm MẠNG (chỉ người giết người; bắn đồng đội −1), 30 mạng hoặc hết 300 s; hồi sinh vô hạn |
| `Demo_43_BombDefusal` | `BombDefusalMode` + `BombSite` | theo VÒNG: đặt (3.5 s) → nổ 40 s / gỡ 7 s / chết sạch / hết giờ; thắng 3 vòng; **trong vòng không hồi sinh** |
| `Demo_44_ZombieOutbreak` | `ZombieOutbreakMode` (module Zombie) | sau 12 s **hai người trong đội** biến thành zombie; lây qua `ZombieInfection`; trụ 150 s |
| `Demo_45_HostageRescue` | `HostageRescueMode` + `Hostage` | cởi trói (F / AI 1.2 s) → con tin `Follow` → về điểm tập kết; 2/3 là thắng, 200 s |
| `Demo_46_GunGame` | `GunGameMode` | mỗi mạng lên một cây (thang 11 cây, dao cuối); cấp theo TÊN nên hồi sinh giữ cấp |
| `Demo_47_ZombieLastMan` | `ZombieLastManMode` + `ZombieOutbreakKit` (module Zombie) | **10 người · 5 giây · MỘT người hoá zombie**; sân ĐÓNG (không có bầy ngoài); zombie **30 máu** và mỗi viên đạn **đẩy lùi 0.36**; trụ 120 s là thắng, **bị cắn là thua** |
| `Demo_48_ModernCamp` | `EconomyRaceMode` (skin bắn súng) + `SupplyPointIncome` | **KINH TẾ DOANH TRẠI bản bắn súng**: thợ hậu cần + điểm tiếp tế giữa sân ra tiền; xây nhà lính rồi mua ba tuyến súng; **phá sở chỉ huy địch là thắng**. Chi tiết: `EconomyCamp.md` §17 |

**Demo_47 khác Demo_44 ở LUẬT, không ở mức khó** (2026-09-07, user: *"trong 10 nhân vật ban đầu,
hết 5s đếm ngược sẽ có 1 nhân vật hoá zombie… nếu zombie đánh chết 1 nhân vật thì nhân vật đó
biến thành zombie… zombie có máu trâu và bắn bị lùi ra xa"*):

| | Demo_44 BÙNG PHÁT | Demo_47 NGƯỜI CUỐI CÙNG |
|---|---|---|
| Nguồn zombie | 2 người trong đội + `ZombieWaveDirector` | CHỈ đồng đội — **sân đóng**, "người + zombie" luôn = 10 |
| Máu zombie | mặc định director (2) | **30** ≈ hơn một băng súng trường (30 × 0.9) |
| Đạn dùng để | GIẾT | **ĐẨY LÙI** — `ZombieFlinch._push` 0.36 (loại thường 0.18): với súng trường ~0.70 u/s đẩy ngược so với 1.36 u/s bước lê ⇒ **một khẩu ghìm được một con, hai khẩu mới đẩy lùi thật** |
| Người chơi chết | ngồi xem nốt ván | **THUA ngay** (`RespawnDirector` quỹ mạng 0) |

⚠ Máu trâu và lực đẩy là SỐ CỦA `ZombieDirector` (`_riseHealth` · `_risePush`), không phải nhánh
`if` trong mode: director là chỗ DUY NHẤT sinh zombie nên đường "bệnh nhân số 0" và đường "lây từ
xác đồng đội" không thể lệch số nhau.
⚠ Prefab phải là **variant `StickmanZombie_Shambler`**, không phải `StickmanZombie.prefab` gốc —
bản gốc KHÔNG mang `ZombieFlinch` (chỉ tám variant có), thiếu nó thì "bắn bị lùi" mất trong im
lặng. Director gắn bù khi `_risePush > 0`, nhưng chọn đúng variant thì còn được mặt + vuốt của loại.
⚠ `ZombieOutbreakKit` giữ hai LUẬT dùng chung của mọi màn có bệnh nhân số 0: *ai được phép hoá*
(người chơi và chủ tướng được miễn) và *đếm người còn sống*. Chép sang mode thứ hai là hai bản
luật trôi khỏi nhau mà không lỗi nào báo.

**Ba mảnh dùng chung:**
· `ModePrompt` + `IModePrompt` — ô hỏi [F] bám trên đầu, tự hit-test chạm; mode đăng ký ở
  `OnEnable`, `EnsureInScene` nên scene bake không phải dựng lại.
· `RespawnDirector.HoldRespawns` + `ResetRound()` — vòng: giữ hàng đợi suốt vòng, hết vòng thả
  hết + kéo người sống về căn cứ + hồi máu. **Không viết hệ hồi sinh thứ hai.**
· `Playbook_Shooter` (`genre = Modern`): tuyến súng cẩn trọng, khiên hộ vệ, quân y, nhìn 1.25×,
  hô báo địch 9.

**Địa hình:** `Cover()` = `CreateBarricade` trung lập + `SetPassableForEveryone(true)` +
`SetIndestructible(true)` + art qua `StructureSkin.SetArt` — nhường làn, không có máu để AI gặm,
nhưng **`BlocksProjectiles`** (Barricade là loại duy nhất còn chặn đạn). `Container()` =
`CreateTerrace` (sàn một chiều) + cầu thang hai bên + art `Prop_Container`. Vật che hiện đại:
`StickmanBuildingArt.Modern.cs` (`Prop_Sandbag · Jersey · Container · Crate · Barrel · Car ·
BombSite · AmmoCrate · Wire · Catwalk`, nằm trong `ExpectedArtProof`).

## 5b. AI bắn súng đánh như một TIỂU ĐỘI (2026-09-07)

User: *"AI, animation cách nó chiến đấu không giống các game 3D bắn súng, biết nấp bắn"*.

**Đã có sẵn từ đợt trước** (đừng viết lại): `RangedCombatStrategy` bám vật che (`TryHoldCover`,
xí phần mỗi vật che một người, cam kết 4 s), nhịp **ló ra bắn — thụt vào** (ngồi khi nạp / bị
bắn / nghỉ giữa loạt), **nằm** giữa sân trống (`proneChance`), kiểm **đường bắn** rồi **ngắm
ĐẦU** khi địch nấp (`ShooterTactics`), mỗi cây súng một lối đánh (`RoleOf`), và cấm xông liều
(`stalemateTimeout = 0`). Cả 6 scene bắn súng đều đã bake `Playbook_Shooter`.

**Bốn vế thêm vào, đều là SỐ trên `AIProfile_BanSung` (0 = hành vi cũ):**

| Vế | Số | Cơ chế | Đo được ở đâu |
|---|---|---|---|
| Bắn áp chế | `suppressMagazineFloor` 0.45 | Mất đường bắn mà địch đang nấp sau vật che ⇒ vẫn bắn, nhưng ngắm **mép trên vật che** (`WalkableTopY + 0.06`); gọi `NotifyShotAt` cho địch để `IsUnderFire` của nó bật ⇒ nó nằm im | nhãn `ápchế` ở HUD debug AI |
| Tiến theo cặp | `boundingHoldTime` 1.6 | `_moveTokens` theo PHE: mỗi lúc chỉ một người được rời vật che tiến lên; người giữ vé thì KHÔNG áp chế (đang chạy thì bắn cho ai) | nhãn `đixung` |
| Nấp thấp thì nằm | `coverProneBelowBodyFraction` 0.55 | Vật che thấp hơn 55 % thân ⇒ `SetCrawl` thay `SetCrouch`; `_proneUntil` gia hạn 1.2 s mỗi nhịp nên rời cover là tự đứng dậy | nhãn `nằm` |
| Chọn cover CAO hơn | — | `FindCover` trừ điểm theo `tall = chiều cao / thân` (đáng đi thêm ~1.5 đơn vị) | — |
| Chiếm chỗ cao | `GarrisonPost` trên sàn cao | `StickmanShooterModeBuilder.Perch` đặt post lên catwalk/nóc container, `accessOffsetX` = chân cầu thang (`MapBuildRules.StairRunFor`). `GarrisonDirector` tự gắn vào scene, chỉ gọi lính **Ranged**, tự thay người khi kẻ gác ngã | TDM: T→phe 1, P→phe 2; Bom: sàn B→phe thủ; Con tin: sàn trong trại→phe bắt cóc; hai màn zombie: cả hai→phe người |

⚠⚠ **Đường bắn phải đo tới NGƯỜI, không tới mép vật che.** `ComputeAimPoint` trả mép khi đang áp
chế, mà `HasLineOfFire` lại dùng chính hàm đó ⇒ không có cờ `_computingLos` thì hễ bắt đầu áp
chế là **vĩnh viễn** thấy "bị chắn": cả tổ đứng xả đạn vào cái bao cát mà địch đã bỏ đi từ lâu.
⚠⚠ **Chỉ ghim khi thật sự có phát đạn.** `NotifyShotAt` đặt sau mọi cửa của `ShouldAttack`
(ngắm chắc tay · loạt tên · cooldown) — ghim ở chỗ quyết định là địch nằm bẹp vĩnh viễn vì một
khẩu súng đang chờ hồi cò.
⚠ **Post trung lập là post chết**: `GarrisonDirector` cố ý bỏ qua `TeamId < 0`.
⚠ Đây là **BẢNG SỐ GHI RA ASSET** — sửa `StickmanAIPersonalityBuilder` xong phải bấm lại
*8 TÍNH CÁCH + học thuyết*, không thì `AIProfile_BanSung.asset` giữ số cũ (0 = tắt) và không có
lỗi nào báo; sửa `StickmanShooterModeBuilder` xong phải dựng lại 6 scene mới có `GarrisonPost`.

## 6. Bẫy đã dính trong đợt này

| Bẫy | Chốt |
|---|---|
| `LoadAuthoredSpritesByPrefix` lọc sạch art code-gen ⇒ lực lượng mới không nón/giáp | fallback về tấm gốc vẽ bù khi không có art thật |
| `CivilizationLibrary.Count` gộp cả hai thể loại ⇒ phe trung cổ bốc trúng "Cảnh sát" | không tham số = Trung cổ; thể loại khác hỏi `*Of(genre)` |
| Đặt bom mà `RespawnDirector` vẫn đẻ quân giữa vòng | `HoldRespawns` suốt vòng; `OnFinished` trả lại |
| Con tin có `TeamMember` ⇒ cả hai phe nhắm bắn từ đầu | `Hostage.Awake` TẮT `TeamMember` + `StickmanAgent`, bật lại khi cứu với phe người cứu |
| `ZombieInfection` cần kẻ giết là zombie ⇒ bệnh nhân số 0 không có ai giết | mode giết bằng `TakeDamage(forceScale 0)` rồi `ScheduleRise` thẳng |
| Gun game: `AIWeaponSwapModule`/`CivilizationTeamAssigner` phát lại cây khác | `SetSwapPool([cây cấp])` + assigner `LookOnly` + rà lại mỗi 0.4 s |
| `EnvCanvas` là lớp `internal` lồng trong `StickmanEnvironmentArt` | file partial mới phải khai `using EnvCanvas = StickmanEnvironmentArt.EnvCanvas;` |
| `CivilizationArtGenerator` có field `Light` ⇒ helper `Light()` không gọi được | partial dùng `Shade()/Tint()` |

## 7. Chạy

`★ Bảng điều khiển` → *Art · vũ khí · nhân vật · NPC · trang bị · âm thanh* (VÀNG: tám cây +
băng) → *★ Vẽ bù art còn thiếu* (ĐỎ: 9 tấm súng + 10 vật che + art bốn lực lượng) → *★ 15
nền văn minh* (dựng luôn bốn lực lượng) → *Bộ AI theo gameplay* (`Playbook_Shooter`) →
*★ Hiện đại — 6 chế độ BẮN SÚNG* (hoặc từng job Demo_42..47 ở dây chuyền nhóm 3). Rồi
`★ KHÁM SỨC KHOẺ` — mục «Súng chưa khai BĂNG ĐẠN» phải XANH.

Art đẹp: `WeaponArt-ChatGPT-Prompt.md` §2 (8 cây), §10 (bốn lực lượng), §11 (vật che).

---

## 8. ĐỢT HAI (2026-09-05, user: *"AI này là AI trung cổ dính chùm; vừa cầm súng vừa mang lựu đạn; ngồi nằm bắn né đạn; súng to súng nhỏ; hết đạn mới cầm dao hoặc về thùng tiếp tế"*)

| Vế | Ở đâu | Cách làm |
|---|---|---|
| **BỘ SÚNG CS** — chính (to, hai tay) · phụ (súng lục/ổ xoay) · dao · lựu đạn | `Combat/ShooterKit` · `CivilizationDefinition.ConfigureShooterKit` (gọi ở cả `ApplyTo` lẫn `ApplyLookTo` khi `genre == Modern`) | kit = kho tự đổi (`SetSwapPool`), phím **1..4**, nút VŨ KHÍ lật trong bốn ô, **G** / nút **LỰU ĐẠN** = `QuickThrow` (cầm lựu đạn → ném theo hướng ngắm → tự cầm lại cây cũ). Lựu đạn bốc từ `sideArms` theo mã băm nhân vật |
| **Dao chỉ khi HẾT ĐẠN** | `AIWeaponSwapModule` luật 3 | súng lớp `Firearm` còn đạn thì KHÔNG rút cận chiến khi bị áp sát (súng săn dí sát mặt là lúc nó mạnh nhất) |
| **Ném xong cầm lại súng** | `AIWeaponSwapModule` luật 0b | đang cầm `Explosive` mà vừa ném / hết quả / cụm tan → `kit.BestGunIndex()` |
| **Hết băng chính thì về THÙNG** | `AIResupplyModule` | cửa vào hỏi cả `kit.PrimaryOutOfAmmo`; còn cây bắn được + có địch thì đánh đã; đi về thùng thì cầm súng phụ; thứ tự đổi cây: súng phụ → dao → đồ ném |
| **DÀN HÀNG** | `RangedCombatStrategy.PreferredRangeFor` + `AIProfile.rangedSpreadJitter` | mỗi người một mốc đứng theo MÃ BĂM (tất định) trong [1−x … 1] × tầm ưa thích |
| **BÁM VẬT CHE** | `RangedCombatStrategy.TryHoldCover` + `AIProfile.coverSeekRadius` | rào chắn đạn nằm giữa mình và địch, mỗi cover MỘT người (sổ xí phần 3 s), cam kết 4 s; tới nơi: **ngồi khi nạp / bị bắn, đứng để bắn** |
| **Cover không chặn đạn của người nấp** | `ProjectileController.FiredFromBehind` | chủ đạn đứng trong 1.4 của cover → đạn bay qua (ló ra bắn); đạn từ xa vẫn dừng |
| **Nằm/ngồi né đạn có tác dụng và AI biết hạ nòng** | `RangedCombatStrategy.ComputeAimPoint` | mục tiêu đang bò → ngắm sát đất, đang ngồi → hạ 0.12. Người chơi: Ctrl ngồi (đứng yên, bắn được), C/nút BÒ nằm |
| **Tính cách riêng** | `AIProfile_BanSung` (`StickmanAIPersonalityBuilder.ShooterKey`) | giãn cách 1.6, cover 7, jitter 0.35, `shieldWallReactTime` 0.25 (mở `IsUnderFire`), coverChance 0.5, steadyAim 0.1 |
| Roster | `ModernSpecs` | không còn quân chủng chỉ cầm dao / chỉ cầm lựu đạn — ai cũng có súng chính; dao và lựu đạn tới từ kit |
| **Lựu đạn NỔ THEO NGÒI dù không trúng ai** | `ProjectileController.IsFused` (`_fuseTime > 0 && !_explodeOnImpact`) | đạn ngòi chạm đất / người / vật che chỉ NẢY (kêu một tiếng, ≤4 lần/giây) rồi `LateUpdate` nổ khi hết ngòi. Trước đây chạm đất là `Despawn()` như mũi tên → quả nào không bay đủ 1.2 s trên không là biến mất |
| **Bắn hạ KHÔNG rớt đồ** | `GenreDefinition.dropsLootOnDeath` → `GenreWeaponPolicy.LootDropsEnabled` (binder đăng ký) | Hiện đại = false (`StickmanGenreBuilder` `noLootOnDeath`). `StickmanWeaponHolder.OnOwnerDied` · `LootDropper` · `AIResupplyModule` (vứt cây rỗng) cùng hỏi một cờ. Mặc định true nên trung cổ y như cũ |

⚠ Không có `ShooterKit` (trung cổ, hoặc quên khoác lực lượng) thì mọi thứ y như cũ: kho phẳng
theo `RosterWeaponIndices`, module rút dao khi bị áp sát. Ba số mới của `AIProfile` mặc định 0.
⚠ **Phải bấm**: *Bộ AI theo gameplay* (sinh `AIProfile_BanSung` + `Playbook_Shooter`) → *★ 15
nền văn minh* (roster mới) → *★ Hiện đại — 5 chế độ BẮN SÚNG* (tool này gọi `StickmanGenreBuilder.EnsureAll`
nên `Genre_Modern.asset` nhận cờ `dropsLootOnDeath = false`; scene cũ chưa dựng lại vẫn rớt đồ).

## 9. ĐỢT BA (2026-09-06, user: *"vũ khí quá to, hiệu ứng bắn và đạn lệch, đạn nhỏ hơn; AI khá ngu; map phải có chỗ núp; hai chế độ: đạn thật / đạn giả raycast có hệ số hụt"*)

| Vế | Ở đâu | Cách làm |
|---|---|---|
| **HAI CHẾ ĐỘ ĐẠN** | `Core/GunfireSettings` (PlayerPrefs) · `RangedWeapon.UseHitscan/FireHitscan` · `Combat/GunfireRaycast` · `Combat/BulletTracer` | Đổi bằng **nút «Đạn: THẬT ➤ / GIẢ ◉»** trên THANH CHỌN MÀN (`DemoSceneSwitcher`, cạnh nút cỡ chữ và ĐT/PC) — chỉ hiện khi đang cầm súng; điện thoại không có F6 nên đây là đường chính. Bàn phím vẫn có **F6**, và bảng Hướng dẫn có một nút nữa. Đạn thật = như cũ. Hitscan = tia `GunfireRaycast.Trace` (CÙNG bộ lọc với `ProjectileController.HandleHit`: chủ đạn, cầu thang, vật che + `FiredFromBehind`, đồng đội xuyên) + vệt `BulletTracer` + chớp nòng như cũ. Chỉ **viên chì bay thẳng** (`ProjectileController.IsBulletLike`: không nổ, không cắm, không rơi, sống ≥1 s) mới thành tia — phóng lựu · RPG · súng phun lửa · cung giữ đạn thật dù ở chế độ hitscan. Ép riêng từng cây: `RangedWeapon._fireMode` |
| **HỆ SỐ BẮN HỤT** | `RangedWeapon.HitChance` · `RangedWeapon._accuracy` (0.85) · `StickmanController.AimAccuracy` ← `AIProfile.aimAccuracy` | gốc × tầm (1 tới ½ tầm hiệu quả, xuống 0.3 ở 1.6× tầm) × mục tiêu (ngồi 0.75 · nằm 0.5) × mình (đang chạy 0.65 · ngồi 1.15 · nằm 1.3) × `AimAccuracy` (AI `AIProfile_BanSung` 0.8, người chơi 1); kẹp 3–97 %. Hụt = viên SƯỢT (lệch 2.5–6°) bay tới chỗ cắm + `NotifyShotAt` cho nạn nhân |
| **AI biết mình BỊ BẮN dù không có viên đạn** | `StickmanController.NotifyShotAt/TimeSinceShotAt` → `StickmanAgent.IsUnderFire` | hitscan trúng hay sượt đều báo; 0.5 s |
| **AI không bắn vào bao cát** | `ShooterTactics.HasLineOfFire` (cache 0.2 s) trong `RangedCombatStrategy.ShouldAttack` | tia từ nòng tới điểm ngắm (bỏ qua người); cắm vào vật che/đất trước khi tới nửa thân mục tiêu = không bóp cò. Bị chặn > 0.6 s → bỏ chỗ nấp, NHÍCH TỚI (`UpdatePosition`) |
| **AI ngắm ĐẦU khi địch đứng sau cover** | `ShooterTactics.CoverShielding` + `HeadY` trong `ComputeAimPoint` | nó đứng sau bao cát: ngực bị che, đầu ló — ngắm 0.86 thân. Ngồi/nằm sau cover: không có đường bắn → lựu đạn |
| **Lựu đạn PHÁ COVER** | `AIWeaponSwapModule` luật 1b | cầm súng, địch nấp sau vật che, > 1.2 s không bắn được, trong tầm ném → rút `Explosive` |
| **Nhịp LÓ RA – THỤT VÀO** | `TryHoldCover`: `wantLow` thêm `Time.time < _burstPauseUntil` | ngồi trong lúc nghỉ giữa hai loạt, đứng để bắn loạt kế |
| **NẰM BẮN giữa sân trống** | `HoldOpenFieldStance` + `AIProfile.proneChance` (BanSung 0.4) | không có cover mà bị bắn tới, xa hơn 2× tầm tối thiểu: 40 % nằm 2–3.5 s bắn trả; nạp giữa sân → ngồi. `OnDisengaged` (đổi chiến thuật / rời trận) trả tư thế — không có nó lính ném xong lựu đạn vẫn nằm |
| **Cover phía trước vẫn được chọn** | `FindCover` | bỏ cận trên `MaxRange × 0.95`; cover xa địch hơn tầm bắn chỉ bị cộng 3 vào điểm — AI tiến lên từng tuyến cover thay vì đứng giữa sân vì "không có cover đúng tầm" |
| **Mũi nòng ĐO TỪ PIXEL** | `StickmanRigMetrics.TryMeasureMuzzle` → `StickmanWeaponBuilder.SetupGunVisual` (15 cây súng) | tâm của 4 cột opaque ngoài cùng bên phải. Số tay cũ lệch tới 0.08–0.09 ở trung liên / RPG / súng phun lửa (art thật khác khổ art vẽ bù) → chớp nòng nổi trên nòng. Thay art là tự đúng; số tay chỉ còn là dự phòng |
| **Súng nhỏ lại ~15 %** | `StickmanWeaponBuilder.WeaponHeightRatio` | súng lục 0.22 · ổ xoay 0.25 · tiểu liên 0.34 · phóng lựu 0.44 · súng săn 0.52 · trường 0.53 · AK 0.55 · săn liên thanh 0.54 · phun lửa 0.56 · ngắm nhẹ 0.58 · bắn tỉa 0.62 · trung liên 0.62 · RPG 0.68 (giữ THỨ TỰ; cùng bài học cung 0.74 thay vì 0.90) |
| **Vệt đạn KHÔNG phải tia laser** | `BulletTracer` (`MaxLength` 1.0 · `Width` 0.012 · alpha 0.24–0.34 · sống 0.04 s) | bản đầu vẽ nguyên đường tia tới điểm dừng, dày 0.028, alpha 0.95 ⇒ nhìn ra cây laser chỉ vào nạn nhân (*"tia raycast quá rõ nét"*). Nay chỉ là HƠI THUỐC dài 1 đơn vị trước nòng, không chạm mục tiêu. Phần nhìn thấy của phát bắn là **chớp nòng** (`EffectEvent.Attack` → `Fx_Muzzle`, chung bảng với đạn thật) + **tia va chạm** (`EffectEvent.Hit`) chỗ đạn cắm |
| **Đạn nhỏ lại** | `Proj_Bullet` scale 0.42 → **0.30** (0.096 × 0.042 world), hộp va chạm cao 0.16 local | viên nhỏ 30 u/s không lọt khe hitbox |
| **MAP có chỗ núp THẬT** | `StickmanShooterModeBuilder` hằng `SandbagH 0.30 · JerseyH 0.45 · CrateH 0.52 · CarH 0.66`, `Cover(..., floorY)`, `Catwalk(l, r, h, stairsSide)` | người cao 0.73, nòng đứng ~0.40: bao cát 0.6 / jersey 0.8 / xe 1.05 cũ là BỨC TƯỜNG với đạn ngang. Nay bao cát = nằm khuất, jersey/thùng = ngồi khuất, xe = đứng cũng chỉ ló đầu; bao cát trên NÓC container; sàn cao (`Prop_Catwalk`, một cầu thang) bắn xuống qua mọi cover nhưng lộ cả người. Năm scene dựng lại: cover đối xứng cách 3–4 |
| Playbook | `Playbook_Shooter` `smarts: 2` | |

⚠ **Phải bấm**: *Art · vũ khí…* (đo nòng + cỡ súng + đạn mới) → *Bộ AI theo gameplay* (`aimAccuracy`,
`proneChance`, smarts 2) → *★ Hiện đại — 5 chế độ BẮN SÚNG* (map mới). Chưa nhìn thật trong Unity:
nhịp ló/thụt, cỡ súng trên người, vệt đạn hitscan — cần người dùng xem.
⚠ Hitscan KHÔNG xuyên nhiều người (`_pierceCount` chỉ có ở đạn thật) và không có "né đạn" — thay
vào đó tư thế và cover đổi xác suất trúng. Hai chế độ cân bằng KHÁC nhau, cố ý.

## 10. ĐỢT BỐN (2026-09-06, user: *"thêm nhiều loại súng, cơ chế lái xe jeep có súng gắn, zombie máu trâu bắn thì giật lại như Crossfire, thêm bom nổ, giới hạn băng đạn phải về thùng lấy, hiệu ứng nạp theo từng loại súng, AI hợp với từng súng và map"*)

### 10a. Ba khẩu mới (61 · 62 · 63)

| Cây | Cái làm nên nó | Số |
|---|---|---|
| **Minigun sáu nòng** (`Minigun`, 61) | phải **GIỮ CÒ 0.9 s cho nòng quay** mới ra viên đầu (`RangedWeapon._spinUpTime`) — 0.9 s đứng phơi giữa sân là cái giá | 0.45 sát thương/viên · nhịp 0.07 · băng 150 · kho 450 · nạp 6 s · 16 kg (nặng nhất bộ) · tản 5° |
| **Súng cối** (`Mortar`, 62) | **đạn bay CẦU VỒNG 48°** (`_launchAngleDegrees`) — thứ DUY NHẤT bắn được người đang nấp sau bao cát | nổ 3.5 bán kính 2.4 · băng 2 · kho 8 · nạp 3.4 s · tầm 12 · **vùng chết 5** |
| **Tiểu liên một tay** (`MachinePistol`, 63) | ô SÚNG PHỤ liên thanh — rút nhanh hơn nạp lại khẩu chính | 0.55 · nhịp 0.09 · băng 25 · kho 75 · tầm 4.5 · tản 4.5° |

Art vẽ bù: `WeaponArtGenerator.GenerateMinigun/GenerateMortar/GenerateMachinePistol/GenerateMortarShell`
(`StickmanShooterArt.cs`). Đạn cối `Proj_MortarShell` (trọng lực 1, nổ khi chạm).
⚠ Tầm súng cối là **hệ quả của vật lý**, không phải một con số tự do: `R = v²·sin(2θ)/g` =
11² × sin96° / 9.81 ≈ **12.3** — đổi `_minSpeed/_maxSpeed` hay `_launchAngleDegrees` là đổi tầm,
phải sửa `_effectiveRange` theo, không thì AI đứng sai chỗ và quả nào cũng rơi hụt.

### 10b. XE JEEP — `Gameplay/Vehicle` + `VehicleRider` + `StickmanVehicleBuilder`

| Vế | Cách làm |
|---|---|
| Xe là một **MỤC TIÊU** | `Vehicle : DestructibleTarget` (⊂ `StickmanController`) — đạn, lựu đạn, vụ nổ, radar AI đều đã biết nói chuyện với lớp này. Không sửa một dòng nào của hệ AI hay hệ đạn |
| Lên/xuống | `IModePrompt` → ô **[F]** dùng chung với đặt bom / cứu con tin. Chỉ mời lên xe **phe mình** |
| Người ngồi | `VehicleRider` ghim vào ghế mỗi `LateUpdate` **và** khai `IPinnedInPlace` — thiếu vế hai thì `RespawnDirector` kéo người ngồi trên xe về căn cứ trong khi xe chạy tiếp |
| Vũ khí nóc | MỘT INSTANCE THẬT của `Weapon_*.prefab` (cùng băng đạn, cùng kiểu nạp). Chủ = **cái xe** khi trống, đổi sang **người lái** khi có người lên — mạng tính đúng cho họ |
| Kíp AI | `_aiCrew`: bò tới `_standoff` của địch gần nhất trong dải `_patrolRadius` rồi bắn. CỐ Ý đơn giản — xe không nấp, không nhặt đồ, không leo cầu thang |
| Chết | nổ (bán kính 3.2, sát thương 4) + để lại vùng lửa 5 s |

⚠ **Xe không leo cầu thang và không lên sàn cao.** Map có xe phải có dải đất phẳng đủ dài.
Xe trong 4 màn: TDM (súng trường / minigun, kíp AI) · Đặt bom (bắn tỉa, xe của người chơi) ·
Zombie (minigun giữa sân) · Con tin (tiểu liên, xe của người chơi).

### 10c. Zombie kiểu Crossfire

| Vế | Ở đâu |
|---|---|
| **Bắn là GIẬT LẠI** | `Zombie/ZombieFlinch` — mỗi viên khoá bước `0.16 × lực` giây + đẩy lùi. ⚠ Phải làm ở tầng `StickmanLocomotion` chứ không phải `AddForce` vào ragdoll: zombie đặt vận tốc mỗi frame nên cú đẩy vào ragdoll bị nuốt sạch ngay frame sau |
| **Máu trâu = KHÔNG dừng được** | cột `flinchResist` trong `StickmanZombieBuilder.Breeds`: Xác giáp 0.55 · Quái biến dị 0.8 · **Chúa tể 0.95** (đạn không cản nổi — phải né hoặc dùng nổ) |
| **Trần chống khoá cứng** | `_maxStaggerRate` 0.6 — không có nó thì minigun (0.07 s/viên) đóng băng vĩnh viễn cả bầy |
| **Bầy theo ĐỢT vào màn bắn súng** | `StickmanZombieBuilder.AddWaveDirectorShared` trong `Demo_44`. Trước đây màn này CHỈ có lây nhiễm ⇒ zombie luôn là xác đồng đội (1.5 máu), cả tám loại đã dựng sẵn không bao giờ ra mặt |
| **Bom nổ** | `Gameplay/ExplosiveBarrel` (máu 2, nổ 3.5/bán kính 2.6, trễ 0.15 s để dây chuyền đọc ra được) rải ở TDM · đặt bom · zombie · con tin. Cộng với `Bloater` nổ khi chết đã có sẵn |

### 10d. Băng đạn + hiệu ứng nạp theo từng cây

`RangedWeapon.ReloadStyle`: **Magazine** (thay băng) · **Shell** (nhét từng viên — súng săn, ổ
xoay: mỗi viên một nhịp, **bóp cò giữa chừng là dừng nạp bắn ngay**) · **Bolt** (kéo quy lát —
mốc đổi tay 0.72) · **Belt** (dây đạn — 0.45) · **Shell_Load** (thả đạn vào nòng). Khai ở cột thứ
năm của `StickmanShooterWeaponBuilder.Magazines` — **một bảng, 16 khẩu**.
`RangedWeapon.MagazineReserve` đếm KHO theo **BĂNG**, HUD in "còn 3 băng"; kho luôn là bội số
nguyên của cỡ băng. Hết băng dự trữ → HUD nói thẳng *"về thùng đạn"*, `AIResupplyModule` đã lo phần AI.

### 10e. AI theo từng loại súng — `RangedCombatStrategy.GunRole`

| Vai | Đổi gì |
|---|---|
| **Súng săn** | chỗ đứng × 0.45 — phải áp vào mới có sức |
| **Bắn tỉa** | chỗ đứng ≥ 95% tầm — bị dí là thành cái gậy |
| **Hoả lực nặng** (trung liên · minigun) | × 0.85, giữ cover quét một dải |
| **Đạn cầu vồng** (súng cối) | **BỎ QUA luật đường bắn thẳng** — hỏi "có thấy nó không" là hỏi sai câu với khẩu bắn qua đầu vật che, và câu trả lời "không" khoá cứng nó cả trận; ngắm thẳng CHÂN mục tiêu (góc phóng nằm trong cây súng) |

Thêm: **cover phải CÙNG TẦNG** (`|Δy| ≤ 1.2`) — trước đây chỉ so X nên bao cát trên nóc container
được chấm cho lính đứng dưới đất, và anh ta đứng ép vào tường suốt trận.

⚠ **Phải bấm**: *Art · vũ khí · nhân vật…* (3 khẩu mới + xe + bánh) → *Bộ AI theo gameplay* →
*★ Hiện đại — 5 chế độ BẮN SÚNG*. Chưa chạy Unity: cảm giác lái xe, nhịp quay nòng minigun, tầm
rơi thật của đạn cối, và độ giật của zombie — bốn thứ này cần nhìn tận mắt.

## 11. ĐỢT NĂM (2026-09-06, user: *"bắn súng thì không rớt nón và giáp, mặc định KHÔNG có armor; AI hiện đại phải NÚP BẮN chứ không lao vào như cận chiến; map phải có chỗ núp; bài test AI hiện đại không có gì để test"*)

### 11a. Không giáp, không rớt nón — LUẬT THEO THỂ LOẠI

`GenreDefinition.gearRule` → `GenreWeaponPolicyBinder` → `GearRules.SetMatch`. Thể loại Hiện đại
khai **`GearRule.Insignia`** (`StickmanGenreBuilder` cột `insigniaGear`), nghĩa là nón/giáp:
không có điểm giáp · không có sức nặng · **không bao giờ bị đánh rớt**. Cơ chế `Insignia` đã có
sẵn từ trước (`Core/GearRules`) — đợt này chỉ nối nó vào thể loại, cùng đường với bộ lọc vũ khí
và cờ không-rớt-đồ. Trung cổ / Fantasy giữ nguyên `GearRule.Armor`.

### 11b. AI bắn súng THÔI LAO VÀO — hai chỗ, một triệu chứng

| Gốc | Sửa |
|---|---|
| `AIProfile.stalemateTimeout` = 3 s: *"có mục tiêu mà 3 giây không ra đòn nào thì XÔNG THẲNG vào"*. Với cận chiến đó là luật chống nhấp nhứ; với súng thì **3 giây không bắn là chuyện bình thường** (đang nạp, đang thụt sau bao cát, đang chờ địch ló) ⇒ cứ 3 giây cả tuyến súng lại bỏ cover chạy vào mặt địch | `AIProfile_BanSung.stalemateTimeout = 0` (+ `chargeCooldown` 999) |
| `RangedCombatStrategy.UpdatePosition` nhường quyền cho cờ xông liều (`!agent.IsCharging` trong điều kiện `tactics`) ⇒ đang xông thì hệ bám cover TẮT HẲN | bỏ vế `IsCharging`: cây súng không bao giờ có lý do lao vào tận mặt — nó mạnh nhất ở đúng tầm đang đứng |

### 11c. Ba bài test HIỆN ĐẠI dựng lại (`StickmanGenreSceneBuilder`)

| Scene | Trước | Sau |
|---|---|---|
| `Genre_Modern_Weapons` | 3 anh lính cầm súng lục đi rong — không đo được gì | **TRƯỜNG BẮN**: bia đứng yên (6 máu) ở cự ly **5·10·15·20·25** có cột mốc số; một hàng mỗi loại vật che để thấy cái gì che tới đâu; sàn cao; hai thùng phuy nổ dây chuyền; thùng đạn; xe súng cối |
| `Genre_Modern_Firefight` | sân TRỐNG + playbook `FieldBattle` (**học thuyết trung cổ**) ⇒ hai tổ súng lao vào đánh giáp lá cà | ba tuyến vật che mỗi bên + container giữa + playbook **`Shooter`**; mỗi tổ đủ sáu vai (trường · tiểu liên · săn · bắn tỉa · trung liên · **súng cối**) để đo *cự ly mỗi loại tự chọn* |
| `Genre_Modern_Cover` | `BuildWall` = khối vuông cao **1.4** (người cao 0.73) chỉ có sprite + collider: **không phải `Fortification`** ⇒ `Fortification.All` rỗng ⇒ bộ tìm vật che của AI thấy sân trống; lại không chặn đạn; lại cao hơn đầu | **HÀNH LANG** 4 tuyến vật che mỗi bên (`CoverShared` — đúng bộ của màn chơi thật) + khoảng trống 6 ở giữa + sàn cao cho bắn tỉa + playbook `Shooter` |

⚠ `Begin()` của MỌI bài test thể loại nay gắn `AddGenrePolicyShared(genre)`. Trước đây 11 bài
test chạy luật mặc định (trung cổ) — tức bài test *"thể loại này dùng vũ khí gì"* không thi hành
chính danh sách nó đang đo, và lính hiện đại vẫn bị bắn rớt nón.

⚠ Bộ vật che nay có MỘT chủ: `StickmanShooterModeBuilder.CoverShared / CatwalkShared /
ContainerShared / BarrelShared / JeepShared` + các hằng `SandbagH 0.30 · JerseyH 0.45 ·
CrateH 0.52 · CarH 0.66 · ContainerH 1.6 · CatwalkH 2.3`. Màn nào tự dựng vật che riêng là màn
đó có một bộ cỡ thứ hai — và đó đúng là lỗi của `Genre_Modern_Cover` cũ.

⚠ **Phải bấm**: *Genres > 1. Build Genre Assets* (hoặc bất kỳ tool nào gọi `EnsureAll`) để
`Genre_Modern.asset` nhận `gearRule = Insignia` → *Bộ AI theo gameplay* → *Genres > Modern* (ba
bài test) → *★ Hiện đại — 5 chế độ BẮN SÚNG*.

## 12. ĐỢT SÁU (2026-09-07, user: *"cải thiện phương tiện; thêm xe tăng, thiết giáp, máy bay ném bom, trực thăng và lính thả dù; AI · animation vũ khí hợp với khí tài; map thiết kế cho khí tài"*)

### 12a. GIÁP — trục cân bằng mới của cả thể loại

`DamageInfo.explosive` (chỉ `Explosion.Detonate` bật) + `IArmoredTarget.BulletResistance` (Core)
→ `Vehicle.TakeDamage` / `Aircraft.TakeDamage` gạt phần sát thương KHÔNG NỔ.

| Khí tài | Kháng đạn thường | Nghĩa là |
|---|---|---|
| Jeep | 0 | đạn xuyên hết — nhanh nhưng mỏng |
| Thiết giáp | 0.75 | súng trường vẫn hạ được, nhưng phải cả tổ |
| **Xe tăng** | **1.0** | **MIỄN đạn thường** — chỉ RPG · súng cối · lựu đạn · thùng phuy hạ được |
| Máy bay ném bom | 0.85 | thực tế chỉ RPG với tay |
| Trực thăng | 0.4 | súng máy bắn rớt được |

⚠⚠ **Giáp chặn CẢ đòn cận chiến** (vuốt zombie, dao) vì chúng cũng không nổ. Nên **KHÔNG đặt xe
tăng vào màn zombie**: bầy zombie sẽ không có cách nào chạm tới nó. Thiết giáp (0.75) thì được.
⚠ AI bộ binh biết đường: `AIWeaponSwapModule` luật **1c** — thấy `IArmoredTarget` kháng ≥ 0.5 thì
rút đồ NỔ. Không có luật này thì cả tiểu đội đứng xả súng trường vào xe tăng suốt trận, thấy đòn
có ra, hiệu ứng có nổ, mà máu địch không suy suyển — và không lỗi nào báo.

### 12b. Ba xe mặt đất — MỘT lớp `Vehicle`, ba dòng số

`VehicleKind { Jeep, Apc, Tank }`. Khác nhau ở `StickmanVehicleBuilder.SpecOf`: dài · cao · tốc độ ·
máu · kháng đạn · giật nòng · bán kính nổ · **số ghế chở quân**. Không đẻ ba lớp — cách lái giống hệt.

· **THIẾT GIÁP CHỞ QUÂN**: `_passengerSeats` + `_startingTroops` (builder khai, `Start` nhét vào ghế).
Kíp AI chạy tới `standoff` rồi **`Unload()`** — lính nhảy xuống hai bên, bật `StickmanAgent`, đi săn
địch như lính thường. Người chơi lái thì bấm **E** để đổ quân. Xe nổ cũng `Unload()` trước (lính
nhảy ra rồi mới ăn vụ nổ).

### 12c. Animation theo khí tài

| Chi tiết | Ở đâu |
|---|---|
| **Giật nòng** sau mỗi phát (pháo tăng 0.24, súng máy 0.05) | `Vehicle.OnAnyAttacked` nghe `WeaponBase.AnyAttacked`, `AimTurret` nội suy về 0 |
| **Thân nghiêng theo đà** (tăng tốc ngửa, phanh chúi) | `Vehicle.ApplyThrottle` → `_hull` |
| **Bánh / xích quay theo tốc độ** | `_wheels`, `Prop_Track` là sprite riêng nên quay được |
| **Cánh quạt quay 1800°/s**, thân trực thăng nghiêng theo hướng bay | `Aircraft.Update` → `_rotor`, `Move` → `_hull` |
| **Dù đung đưa** rồi gỡ khi chạm đất | `Parachute` (rơi 1.7/s, lắc ±8°) |
| **Máy bay trúng đạn: rơi xoay + khói, chạm đất mới NỔ** | `Aircraft.Fall` → `Crash` |

⚠ Hai khẩu **chỉ gắn trên khí tài**: `TankCannon` (64, đạn nổ bay thẳng, nạp 2.4 s) và `BombBay`
(65, thả bom rơi tự do). CỐ Ý **không** nằm trong `LeafWeaponPaths` (không nhét vào kho 60 cây của
mọi nhân vật) và **không** trong `GenreDefinition.weapons` (bộ binh không nhặt được).

### 12d. Không quân — `AirSupportDirector`

Mỗi phe một hàng `TeamAir { teamId, homeX, farX, dropX }`. Cứ `bomberInterval` giây một lượt **ném
bom** (bay ngang, thả khi DƯỚI BỤNG có địch — thả sớm theo hướng bay vì bom rơi mất ~1.1 s),
`heliInterval` giây một chuyến **trực thăng**: bay tới `dropX`, treo, thả từng lính dù, hết quân thì
lượn quanh mặt trận xả minigun; thủng dưới 30 % máu thì bay về và biến mất.

⚠ Lính dù là `StickmanNPC` bình thường — phe · súng · **áo nền văn minh** qua
`CivilizationTeamAssigner.DressUnit` (cửa mới: `Start` chỉ khoác cho ai có mặt lúc mở màn, nên lính
sinh giữa trận trước đây là một anh stickman đen trơn giữa một phe Cảnh sát).
⚠ Máy bay **phải là prefab** (`Assets/Prefabs/Vehicles/Aircraft_*.prefab`) vì chúng sinh ra giữa trận.

### 12e. `Demo_48_ThietGiap` — map dựng THEO khí tài

Bốn luật địa hình của một map có xe (ghi trong `BuildArmoredAssault`):

1. **HÀNH LANG XE PHẲNG** suốt chiều dài — xe không leo cầu thang, không lên sàn cao; một cụm bậc
   chắn ngang là cái xe kẹt tới hết trận.
2. **Vật che bộ binh LÙI VỀ HAI RÌA**, khỏi hành lang xe — không thì xe cán lên chỗ nấp.
3. **Sàn cao + công sự cho bộ binh** — chỗ duy nhất xe không tới được; đây là vế cân bằng, thiếu nó
   thì xe tăng vô đối.
4. **Khoảng trời trống** ở giữa: máy bay bay ở cao độ 8.5, trực thăng treo 6.5.

Sân rộng 80 (−40..40), mỗi phe: 1 xe tăng · 1 thiết giáp chở 4 lính · không quân; người chơi cầm
**RPG** và có sẵn một jeep minigun đậu ở căn cứ. Luật thắng dùng lại `TeamDeathmatchMode` (40 mạng /
420 s) — không viết mode thứ bảy chỉ để đổi bối cảnh.
Màn TỬ CHIẾN (`Demo_42`) nay cũng có trực thăng thả dù (KHÔNG có xe tăng: sân 52 đầy vật che, một
khối miễn đạn thường chạy dọc sân là hết trận).

⚠ **Phải bấm**: *Art · vũ khí · nhân vật…* (2 khẩu + 7 tấm art khí tài) → *Bộ AI theo gameplay* →
*★ Hiện đại — 5 chế độ BẮN SÚNG* (hoặc *Modern > 8. Thiết giáp*).

## 13. ĐỢT BẢY (2026-09-07, user: *"ai cũng biết lái khí tài; thêm màn giống chiến tranh; thêm vũ khí còn thiếu; vẽ hình còn thiếu; thêm xe chở lính và xe ngựa chở lính cho trung cổ"*)

### 13a. AI BIẾT LÊN XE — `AIVehicleModule`

`Combat/DrivableVehicles` (interface `IDrivableVehicle` + sổ tĩnh) là cây cầu: `Vehicle` sống ở
**Gameplay (4)** còn module AI ở **tầng 2** — tầng dưới không tham chiếu lên được. Đúng khuôn
`ContestedZones` / `GenreWeaponPolicy`: tầng thấp khai một câu hỏi nhỏ, tầng cao đăng ký người trả lời.

| Vế | Cách làm |
|---|---|
| Tìm & đi tới | `AIProfile.vehicleSeekRadius` (BanSung 14); **mỗi xe một người đi tới** (sổ xí phần tĩnh) — không thì cả tiểu đội nhắm một cái xe rồi chín người đứng ngơ |
| Chỉ lấy xe KHI CÓ VIỆC | phải `agent.TargetAlive` — thiếu vế này thì mở màn cả sân chạy đi đỗ xe |
| Lên lái | `Vehicle.TryBoardAi` → `StickmanAgent` bị TẮT: **cái xe lái, không phải anh lính ngồi trong nó**; `Leave()` bật lại |
| Ai cũng có | `AIModuleLibrary.DefaultKinds` có `Vehicle`; module tự tắt khi `vehicleSeekRadius = 0`, nên trung cổ không đổi hành vi |

### 13b. XE CHỞ LÍNH — hiện đại và TRUNG CỔ

`VehicleKind.Truck` (6 ghế, nhanh, không súng) và **`VehicleKind.Wagon`** — XE NGỰA kéo, 4 ghế,
chậm bằng nửa xe tải. Cùng MỘT lớp `Vehicle`: khác nhau ở bảng số (`StickmanVehicleBuilder.SpecOf`)
và tấm hình, không ở cách chở người. Xe ngựa vẫn là `TeamMember` nên vật che biết nhường làn, đạn
và lửa vẫn phá được, `AIVehicleModule` vẫn cho lính leo lên lái.
Art xe ngựa nằm ở thư mục **`Default`** (trung cổ) chứ không phải `Modern`; `LoadVehicleArt` tự
chọn thư mục theo tiền tố `Prop_Wagon`. Hai cỗ xe ngựa đã vào `Genre_Medieval_Battle`.

### 13c. Ba thứ vũ khí còn thiếu

| Cây | Vì sao nó lấp một lỗ thật |
|---|---|
| **Bắn tỉa chống tăng** (`AntiMaterielRifle`, 68 · chỉ số kho 64) | trước đợt này bộ binh chỉ hạ được xe bằng RPG/cối — cả hai đều phải **bò tới gần**. Khẩu này khoét giáp từ 16 đơn vị nhờ `armorPierce` 0.9, và `Vehicle.TakeDamage` nay trừ giáp theo xuyên giáp (`resist × (1 − armorPierce)`) — không có vế đó thì cái tên của nó nói dối |
| **Pháo phòng không** (`AntiAirGun`, 69) | không có nó thì máy bay bay qua đầu tự do. Gắn trên Ụ (`CreateAaMount`) — một `Vehicle` đứng yên khai `_antiAir`, nên nó ưu tiên nhắm máy bay (`FindEnemy` nhân 0.4 vào khoảng cách) |
| **Mìn** (`Gameplay/Landmine`) | vũ khí của BẢN ĐỒ, không phải của người lính: nó đặt ra đúng một câu hỏi — *"đi đường nào"*. Không có máu, không vào radar AI (một cái bẫy mà AI né được thì không còn là bẫy), có giờ mở chốt 1.5 s |

### 13d. `Demo_49_ChienTuyen` — màn GIỐNG CHIẾN TRANH nhất

Dùng `CaptureScoreMode` (giữ đất cộng điểm, 180 điểm) chứ không đếm mạng: **chiến tranh có TUYẾN**,
đếm mạng thì hai bên chỉ cần gặp nhau ở đâu đó và bắn. Bố cục: ba cứ điểm (−14 · 0 · +14), mỗi cái
là một cụm công sự + sàn cao; giữa chúng là đất trống có **BÃI MÌN** — nhanh thì dính mìn, an toàn
thì chậm. Mỗi phe: ụ pháo phòng không, xe tăng, xe tải chở 6 lính, một jeep **để trống** (bạn không
lấy thì lính AI lấy), máy bay ném bom + trực thăng thả dù. Người chơi cầm bắn tỉa chống tăng.

### 13e. Vẽ hình còn thiếu — và cái bẫy đằng sau nó

Đã thêm generator cho 16 tấm: `TankCannon` · `BombBay` · `AntiMaterielRifle` · `AntiAirGun`
(vũ khí) · `Prop_Tank` · `Prop_Apc` · `Prop_Track` · `Prop_Bomber` · `Prop_Helicopter` ·
`Prop_Rotor` · `Prop_Parachute` · `Prop_Truck` · `Prop_AaMount` · `Prop_Mine` (hiện đại) ·
`Prop_Wagon` · `Prop_WagonWheel` (trung cổ).

⚠⚠ **BẪY ĐÃ DÍNH**: `WeaponArtGenerator.AllSpriteNames` và `StickmanBuildingArt.DefaultRoles` là
CHỨNG của mục «Vẽ bù art» trên Bảng điều khiển. Bốn khẩu của đợt trước (minigun · cối · tiểu liên
một tay · đạn cối) **thiếu hẳn tên trong danh sách đó**, nên bảng không bao giờ báo đỏ dù tấm hình
không tồn tại, `EnsureAll` không sinh, và cây súng ra trận với `sprite = null` — nhìn ra là *"cầm
tay không mà vẫn bắn"*. Thêm một khẩu súng mà quên một dòng ở hai danh sách này là đúng cái bẫy đó.

⚠ **Phải bấm**: *Art · vũ khí · nhân vật…* (16 tấm hình + 2 khẩu mới) → *Bộ AI theo gameplay*
(`vehicleSeekRadius`, module `Vehicle`) → *★ Hiện đại — 5 chế độ BẮN SÚNG* (hoặc *Modern > 9. Chiến
tuyến*) → *Genres > Medieval* (xe ngựa vào màn trận trung cổ).
