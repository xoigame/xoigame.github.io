### ⚠⚠ THỂ LOẠI BẮN SÚNG — Counter-Strike / Đột Kích sang 2D (2026-09-05)

User: *"tương tự trung cổ: hệ súng · AI · animation · chế độ chơi · map và công trình · art ·
cỡ đạn và số đạn · bốn lực lượng Cảnh sát/Quân đội/Cướp/Khủng bố · team deathmatch · đặt bom ·
zombie · các chế độ khác giống CS/Đột Kích"*. Chi tiết: `Docs/KnowledgeBase/Shooter.md`.
**Không có `ShooterAgent`, không có hệ hồi sinh thứ hai** — mọi thứ đi trên bộ khung trung cổ;
cái mới nằm đúng ở bốn chỗ game bắn súng THẬT SỰ khác game kiếm cung:

| Mảnh | Ở đâu | Nguồn sự thật |
|---|---|---|
| **BĂNG ĐẠN + NẠP** (bể thứ hai bên cạnh KHO/`AmmoCache`): bắn trừ băng, cạn tự nạp, trúng đòn/đổi cây cắt nạp, dáng nạp = base pose của holder, người chơi **X**/nút **NẠP** (chung ô với ĐỠ), AI nạp sớm + bắn loạt | `RangedWeapon` · `StickmanWeaponHolder.ApplyReloadPose` · `RangedCombatStrategy` | `StickmanShooterWeaponBuilder.Magazines` |
| **VÙNG KHÓI · LỬA · CHỚP** từ đạn nổ (`_hazardKind` trên prefab đạn): khói chặn radar AI (`SmokeBlocks`), lửa áp `Burn`, chớp `Stun` + trắng màn người chơi | `Combat/AreaHazard` · `ProjectileController.Explode` · `StickmanAgent` | prefab đạn |
| **BỐN LỰC LƯỢNG = `CivilizationDefinition` có `genre` + `sideArms`** (vũ khí phụ mở trong kho để AI rút chớp/khói/Molotov) | `StickmanCivilizationBuilder.Modern.cs` · `ModernFactionArt.cs` | `ModernSpecs` |
| **SÁU LUẬT THẮNG** Demo_42..47: TDM đếm mạng · đặt-gỡ bom theo VÒNG · zombie bùng phát trong đội · cứu con tin dẫn về · gun game leo thang 11 cây · NGƯỜI CUỐI CÙNG (10 người, 5s, 1 người hoá zombie) | `Gameplay/TeamDeathmatchMode · BombDefusalMode + BombSite · HostageRescueMode + Hostage · GunGameMode` · `Zombie/ZombieOutbreakMode · ZombieLastManMode + ZombieOutbreakKit` | `StickmanShooterModeBuilder` |

⚠⚠ **MÀN THỨ BẢY — `Demo_48_ModernCamp` «ĐỘT CHIẾM CĂN CỨ»** (2026-09-07, user: *"sửa chế độ
tấn công doanh trại của nhau bên hiện đại, gameplay giống kinh tế doanh trại bên trung cổ nhưng
phù hợp cho bắn súng"*): bản BẮN SÚNG của `Demo_20_WarCamp`, dùng lại NGUYÊN hệ kinh tế
(`TeamEconomy` · `CampBuildYard` · `CampHomeGuard` · `CampGameUi` · `EconomyRaceMode`). Khác bốn
chỗ: **hai dòng tiền** (thợ hậu cần + `SupplyPointIncome` trên `CapturePoint` giữa sân) · **ba
tuyến súng** (`Loadout_Mod_Breacher/Assault/Rifleman`) · **`Playbook_Shooter`** cho lính nhưng
**`Doctrine_WarCamp`** cho tướng · địa hình vật che của `StickmanShooterModeBuilder`.
⚠ Sở chỉ huy phải `SetSiegeRules(rangedImmune: false)` — mặc định `BaseBuilding` MIỄN đạn, mà
màn này chỉ có súng ⇒ nhà bất tử, trận không có hồi kết, không lỗi nào báo.
⚠ Không có kỵ binh (mount toàn thú): `cavalryCost`/`horseCost` 9999 + `fallbackCavalryMount = null`.
Nút «Chuồng ngựa» vẫn hiện vì `CampGameUi.BuildKinds` là mảng TĨNH — ẩn hẳn thì phải sửa `CampGameUi`.
Chi tiết + bảng số: `Docs/KnowledgeBase/EconomyCamp.md` §17.

⚠⚠ **MÀN THỨ TÁM — `Demo_55_ModernFront` «MẶT TRẬN BA NƯỚC»** (2026-09-08, user: *"tham khảo
chế độ chơi tam quốc camping làm chế độ chơi chiến tranh hiện đại giữa 3 nước nhưng thuật toán
phù hợp cho bắn súng và hiện đại"*): ba QUỐC GIA hiện đại trên map VÒNG, kế thừa trọng tài ba phe
của Tam Quốc và đổi bốn chỗ thuật toán (sức đo cả XE và ĐIỂM TIẾP TẾ · vu hồi khi BẾ TẮC · năm
HỌC THUYẾT đổi luôn `CommandDoctrine` · xưởng cơ giới bán xe). Luật đầy đủ:
[ModernFront.md](ModernFront.md).

⚠⚠ **ĐỢT 2026-09-08 — AI CÓ THÊM MỘT GIÁC QUAN.** Tới trước đợt này AI chỉ biết *thấy hay không
thấy*, mà súng thì bắn XA HƠN TẦM NHÌN: bị bắn tỉa từ ngoài `visionRange` là không có một cơ chế
nào phản ứng. Nay có `NoiseField` (tai) · `DangerField` (bản đồ chỗ chết chóc, KHÁC `ThreatBoard`)
· `AIGrenadeModule` (khói để ĐI · chớp để VÀO · lửa để ĐUỔI) · dáng `peek` (ló ra bắn).
Luật đầy đủ + bẫy: [Perception.md](Perception.md). Ý tưởng còn lại cho thể loại này:
`Docs/KnowledgeBase/ModernWarfare-NextWave.md`.

Tám cây mới (`WeaponType` 53..60): ổ xoay · AK · súng săn liên thanh · súng trường ngắm nhẹ ·
chớp · khói · Molotov · RPG. `Proj_Bullet` co 0.9 → 0.42 (viên đạn cỡ mũi tên đọc ra là tên).

⚠⚠ **`CivilizationLibrary.Count/Get/Random/RandomExcept` KHÔNG THAM SỐ = TRUNG CỔ, cố ý.** Hơn
mười chỗ (ô chọn nền, tủ kính, bàn thử, AI Lab, đấu tướng) được viết cho 15 nền; từ ngày bốn
lực lượng vào chung sổ, để chúng lọt vào là phe trung cổ bốc trúng "Cảnh sát" cầm súng trường.
Thể loại khác hỏi `CountOf/GetOf/RandomOf/RandomExcept(genre, …)`; `CivilizationTeamAssigner`
mang `_genre` (builder truyền qua `AddCivilizationAssignerShared(mode, genre, fixedByTeam)`);
`MapAssembler`/`MapGenerator` bốc theo `GenreOf(map)`; kit map Hiện đại `useCivilizations = true`.
⚠ **`LoadAuthoredSpritesByPrefix` lọc sạch art code-gen** — không có art thật thì phải LẤY TẤM
VẼ BÙ, không thì lực lượng mới ra trận không nón không giáp mà không lỗi nào báo.
⚠ **Đặt bom đánh theo VÒNG mà không viết hệ hồi sinh thứ hai:** `RespawnDirector.HoldRespawns`
giữ hàng đợi suốt vòng, `ResetRound()` thả hết + kéo người sống về căn cứ + hồi máu.
⚠ **`ModePrompt` + `IModePrompt` là ô hỏi [F] DÙNG CHUNG** (đặt bom · gỡ bom · cởi trói) —
ba mode chỉ khác CHỮ và việc xảy ra khi bấm; ba bản chép là ba chỗ phải nhớ luật "IMGUI theo
được một ngón" và nối dây khi hồi sinh. Mode `Register` ở `OnEnable`, `EnsureInScene` tự gắn.
⚠ **Con tin TẮT `TeamMember` + `StickmanAgent` cho tới khi được cứu** (khuôn tù binh trong
lồng) — có `TeamMember` là cả hai phe nhắm bắn từ giây đầu. Cứu xong bật lại với phe người cứu.
⚠ **Bệnh nhân số 0 không có ai giết** (`ZombieInfection` đòi kẻ giết là zombie) → `ZombieDirector.TurnByPlague`
giết bằng `TakeDamage(forceScale 0)` rồi `ScheduleRise` thẳng; người chơi và chủ tướng được miễn
(luật chọn người nằm ở `ZombieOutbreakKit`, DÙNG CHUNG cho cả hai mode có bệnh nhân số 0).
⚠⚠ **Demo_44: BỊ LÂY THÌ CHƠI TIẾP BẰNG THÂN XÁC SỐNG** (`ZombiePossession`, khuôn CS «Zombie
Mod») — tắt agent + mở `UseInput` + thêm nhãn `PlayerCharacter`; người chơi chết KIỂU GÌ cũng
đứng dậy và xác họ không bị `_maxAlive` chặn. Kéo theo: phe NGƯỜI phải là trường riêng
(`_humanTeam`), kết ván bằng `Finish(phe)` chứ không `Win`/`Lose`. Demo_47 CỐ Ý không có luật
này. Demo_47 bù bằng **MÙI MÁU** (mỗi người ngã xuống thúc cả bầy). Chi tiết: `Zombie.md`.
⚠⚠ **Demo_47 «NGƯỜI CUỐI CÙNG»: MÁU TRÂU phải đi kèm ĐẠN ĐẨY LÙI.** 30 máu mà đạn không đẩy
được là súng thành vô dụng (`ZombieDirector._riseHealth` + `_risePush`, đọc bởi `ZombieFlinch`).
Và prefab phải là VARIANT (`StickmanZombie_Shambler`) — `StickmanZombie.prefab` gốc KHÔNG mang
`ZombieFlinch` nên "bắn bị lùi" biến mất trong im lặng. Sân ĐÓNG: không gắn `ZombieWaveDirector`.
⚠⚠ **AI BẮN SÚNG PHẢI ĐÁNH NHƯ MỘT TIỂU ĐỘI — BỐN VẾ** (2026-09-07, user: *"AI, animation cách
nó chiến đấu không giống các game 3D bắn súng, biết nấp bắn"*). Hệ NẤP đã có từ trước và đang
bật (`RangedCombatStrategy.TryHoldCover` · `FindCover` · nhịp ló-ra-bắn/thụt-vào · nằm giữa sân
trống · ngắm ĐẦU phần ló trên vật che · `stalemateTimeout = 0` cấm xông liều). Bốn thứ CÒN
THIẾU, đều bật bằng SỐ trên `AIProfile_BanSung` (0 = hành vi cũ):

| Vế | Số | Thiếu nó thì đọc ra thế nào |
|---|---|---|
| **BẮN ÁP CHẾ** | `suppressMagazineFloor` 0.45 | Bị chắn ⇒ bản cũ NGỪNG BẮN HẲN. Nay dí đạn vào MÉP vật che của địch (`ComputeAimPoint` trả mép trên, `NotifyShotAt` để nó biết mà nằm im). Chỉ khi nó nấp sau vật che THẬT (chắn vì địa hình thì đổi chỗ mới đúng), chỉ súng Standard/trung liên, chỉ khi băng còn > 45% |
| **TIẾN THEO CẶP** | `boundingHoldTime` 1.6 | Mọi lính chạy CÙNG một luật và tự quyết một mình ⇒ hễ mất đường bắn quá 0.6 s là CẢ TUYẾN cùng bỏ vật che nhích lên một nhịp. Nay mỗi phe một "vé đi"; ai không có vé thì ở lại nấp và áp chế |
| **NẤP THẤP THÌ NẰM** | `coverProneBelowBodyFraction` 0.55 | Bao cát cao 0.30 / thân 0.73: ngồi (hạ rig ~0.14) vẫn hở hơn nửa người — vừa chết oan vừa **nhìn không ra là đang nấp** |
| **CHIẾM CHỖ CAO** | `GarrisonPost` trên sàn cao / nóc container (`StickmanShooterModeBuilder.Perch`) | `FindCover` LOẠI THẲNG cover lệch tầng > 1.2 (cố ý) và không luật nào khác bảo lính bắn súng leo lên ⇒ sàn cao chỉ là đồ trang trí với AI. Hệ chỗ đứng bắn của cung thủ mặt thành đã có sẵn (`GarrisonDirector` tự gắn, tự thay người); map bắn súng chỉ thiếu việc KHAI BÁO |

⚠⚠ Hai bẫy của bắn áp chế, cả hai đều hỏng câm: **(1)** `HasLineOfFire` phải hỏi đường bắn tới
NGƯỜI, không tới mép vật che (`_computingLos`) — không thì hễ bắt đầu áp chế là mãi mãi thấy
"bị chắn" vì đang tự ngắm vào bao cát, cả tổ bắn vào chỗ nấp trống tới hết trận; **(2)** chỉ
`NotifyShotAt` khi THẬT SỰ có phát đạn (sau mọi cửa `ShouldAttack`) — ghim ngay lúc quyết định
là địch nằm bẹp vĩnh viễn vì một khẩu súng chưa bắn viên nào.
⚠ **`GarrisonPost` phải KHAI PHE**: `GarrisonDirector.Tick` bỏ qua post trung lập (`TeamId < 0`)
CÓ CHỦ Ý ("tháp hoang giữa map không phải của ai") — khai −1 là không ai lên, không lỗi nào báo.
⚠⚠ **Demo_44 từng hỏng câm hai chỗ, chữa 2026-09-07**: **(a)** scene có `ZombieWaveDirector`
nhưng `BeginWave` CHỈ được gọi từ mode (xem `ZombieWaveMode`) ⇒ bầy tám loại **không bao giờ ra
trận**, trái hẳn chú thích trong builder — nay `ZombieOutbreakMode` cầm nhịp đợt (`_waveBreak`
14 s, đóng máy ở `OnFinished`, và vế thắng "dập được ổ dịch" tự tắt khi màn có bầy theo đợt);
**(b)** scene không có `RespawnDirector` ⇒ `PlayerRespawnBootstrap` gắn `PlayerRespawn` và người
chơi vẫn sống lại — nay có director quỹ mạng 0, đúng luật đã ghi trong chú thích.

⚠⚠ **AI NÚP SAU CÁI GÌ THÌ ĐẠN PHẢI CẮM VÀO CÁI ĐÓ.** `Fortification.BlocksProjectiles` chỉ
đúng với **`FortKind.Barricade`**, và cả hai đường đạn (`GunfireRaycast` cho hitscan ·
`ProjectileController` cho đạn thật) đều hỏi CHÍNH nó qua `IProjectileCover` — một nguồn.
`RangedCombatStrategy.FindCover` cũng chỉ nhận vật che chặn được đạn, nên khai sai kiểu là AI
lặng lẽ bỏ qua cả cái vật cản đó. Chặn đạn: bao cát · thùng · jersey · xe · Rào chắn · **Hàng
rào** (sửa 2026-09-07: trước khai `Wall` nên chặn chân mà không chặn đạn). KHÔNG chặn: thềm ·
container · cầu vượt (là SÀN) · nhà/tường/cổng (`IRangedDamageImmune`, đạn bay xuyên).
⚠ `passableForEveryone` dùng `Physics2D.IgnoreCollision` theo CẶP collider — nó KHÔNG đụng tới
raycast, nên vật che vẫn chặn đạn dù người đi xuyên được. Đó là định nghĩa "cover" của dự án.
⚠ **VẬT CHE** = rào trung lập `passableForEveryone` + `indestructible` + art qua
`StructureSkin.SetArt`: nhường làn, không máu để AI gặm, nhưng Barricade vẫn `BlocksProjectiles`.
Container = `CreateTerrace` (sàn một chiều) + cầu thang hai bên.
⚠ Doctor: **«Súng chưa khai BĂNG ĐẠN»** — lớp `Firearm` mà `_magazineSize = 0` là VÀNG; hoả mai
và súng phun lửa khai ở `NoMagazine`. `Playbook_Shooter` là playbook đầu tiên `genre = Modern`.
⚠ **PHẢI BẤM LẠI TOOL**: *Art · vũ khí…* (VÀNG) → *★ Vẽ bù art* (ĐỎ: 9 súng + 10 vật che + art
bốn lực lượng) → *★ 15 nền văn minh* (dựng luôn bốn lực lượng) → *Bộ AI theo gameplay* →
*★ Hiện đại — 6 chế độ BẮN SÚNG* (hoặc job Demo_42..47 nhóm 3).

