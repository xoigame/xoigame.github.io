## MUỐN LÀM X THÌ MỞ FILE NÀO, BẤM NÚT NÀO (2026-09-08)

Bảng tra một trang cho **việc thường gặp nhất**. Mục đích: một AI ít ngữ cảnh (hoặc người mới)
KHÔNG phải dò khắp 573 file để biết bắt đầu từ đâu. Cột «Luật» là file phải đọc TRƯỚC khi sửa.

⚠ Bảng này chỉ trỏ đường. Nó **không thay** luật trong cột thứ ba, và **không được** dài ra
thành một bản sao của bộ luật.

### Vòng làm việc chung

| Bước | Làm gì |
|---|---|
| 1 | Đọc luật của mảng mình đụng (bảng dưới) |
| 2 | Sửa code |
| 3 | `powershell -File Docs/Tools/Verify.ps1` — đồng bộ .csproj + biên dịch + soát luật |
| 4 | Trong Unity: «★ Tự kiểm luật chơi» (test thuần) rồi «★ KHÁM SỨC KHOẺ DỰ ÁN» |
| 5 | Còn ĐỎ là chưa xong |
| 6 | ./Docs/Tools/NextTasks.ps1 -Changed <file> — còn nợ gì, và việc tiếp theo là gì ([NextTask](NextTask.md)) |

### Nhân vật · chiến đấu

| Muốn làm | Mở file | Luật |
|---|---|---|
| Thêm/sửa một cây vũ khí | `Assets/Editor/Weapons/StickmanWeaponBuilder*.cs` · asset `Assets/Settings/Weapons` | [Weapons.md](Weapons.md) |
| Nón lệch / đội ngược / không ôm đầu | Bảng điều khiển › «Chỉnh neo nón BẰNG TAY» (`StickmanHelmetAnchorTuner.cs`) — chọn đúng CẤP đang thấy, nhích, Lưu · cả bộ: `stickman-assets/scripts/helm_tier_fix.py` | [Equipment.md](Equipment.md) |
| Đổi cách AI chọn mục tiêu, đánh trả, rút lui | `Assets/Scripts/AI/Agent/StickmanAgent.cs` · `CombatStrategies.cs` | [AI.md](AI.md) · [AI-Notes.md](AI-Notes.md) |
| Thêm một trạng thái AI mới | `Assets/Scripts/AI/States/AIState*.cs` (mỗi trạng thái một file) | [AI.md](AI.md) |
| Đổi sĩ khí / thêm nguồn giữ hoặc bào sĩ khí (kỳ binh, tiếng hét) | `Assets/Scripts/AI/Command/StickmanBannerBearer.cs` · `AIProfile` mục morale | [Morale.md](Morale.md) |
| Đổi tầng chỉ huy (đội hình, thế trận, lệnh) | `Assets/Scripts/AI/Command/` · `TeamCommander.cs` | [Command.md](Command.md) |
| Thêm module hành vi (leo, cưỡi, tiếp đạn…) | `Assets/Scripts/AI/Modules/` | [AI.md](AI.md) |
| Thêm/sửa một nền văn minh | 8 điểm nối — xem luật, đừng tự dò | [CivilizationIntake.md](CivilizationIntake.md) |
| Thêm một con QUÁI / sinh vật / nhân vật đặt tên (AI + chiến đấu + hình) | 9 điểm nối — xem luật; đo bằng «★ Soát hồ sơ sinh vật» | [CreatureIntake.md](CreatureIntake.md) |
| Đổi thang cấp trang bị | `Assets/Scripts/Core/Combat/GearTiers.cs` · `Assets/Settings/WeaponTiers.asset` | [Weapons.md](Weapons.md) |
| **Xem / thêm / sửa ĐỘNG TÁC của một nhân vật** | xem trước: Bảng điều khiển › «Xưởng ĐỘNG TÁC (Demo_67)» → Play, `[ ]` đổi nhân vật, `← →` đi hết từng clip. Sửa số: `Assets/Editor/Rig/StickmanActionSetBuilder.cs` (style cơ bản) · `StickmanActionBuilder.cs` (style phụ) → «Dựng bộ ĐỘNG TÁC» | [Animation.md](Animation.md) |
| **Nghiên cứu / tích hợp dynamic rig 2D** | `Assets/Scripts/Combat/Rig/StickmanDynamicRig.cs` · `Assets/Editor/Rig/StickmanDynamicRigBuilder.cs` → `Tools > Stickman > Nâng cao > Rig & Kiểm tra > Thêm dynamic rig vào Character` | [DynamicRig.md](DynamicRig.md) · [RigInvariants.md](RigInvariants.md) · [Animation.md](Animation.md) |

### Chế độ chơi · màn

| Muốn làm | Mở file | Luật |
|---|---|---|
| **Thêm một chế độ chơi — ĐỌC CẢ HAI DÒNG RỒI CHỌN** | ⚠ hai đường khác nhau, chọn sai là viết xong mà không ai gắn | |
|  ↳ chế độ chạy ở **MỌI MAP** (bình thường chọn cái này) | thêm giá trị `MissionType` rồi nối đủ **8 điểm** — bấm «Soát chuỗi điểm nối của kiểu chơi» để nó chỉ ra chỗ thiếu | [MapSystem.md](MapSystem.md) §*24 KIỂU NHIỆM VỤ* |
|  ↳ chế độ chỉ sống trong **MỘT SCENE dựng tay** | `Assets/Scripts/Gameplay/<Tên>Mode.cs` kế thừa `MatchModeBase` + builder trong `Assets/Editor/` | [Gameplay.md](Gameplay.md) · khuôn ở `Docs/Templates/` |
| **Làm game chơi từ màn DỄ tới màn KHÓ** (mọi chế độ) | ĐÃ CÓ — mỗi chế độ một thang 12 bậc soạn sẵn. Soi: Bảng điều khiển › ★ Thang bậc màn. Chỉnh đường cong: ba mảng trong `Assets/Scripts/Core/Run/LevelLadder.cs` | [Levels.md](Levels.md) |
| Bậc cao mà map vẫn y hệt bậc thấp | `Assets/Scripts/Map/Build/MapLevelShape.cs` (ngưỡng mở khoá) — rồi chạy Doctor nhóm «Thang bậc màn» | [Levels.md](Levels.md) |
| **Sửa luật map/gameplay xong, muốn dựng lại HẾT (bỏ bản cũ)** | `Build > 9c. ★ DỰNG LẠI TẤT CẢ` — KHÔNG dùng «9. Chạy HẾT» (builder idempotent nên bỏ qua thứ đã dựng bằng luật cũ) | [ToolCatalog.md](ToolCatalog.md) |
| Dựng lại một scene demo | Bảng điều khiển › nút của scene đó | [GameShell.md](GameShell.md) |
| QUAY VIDEO quảng cáo (AI tự diễn, camera tự quay) | Bảng điều khiển › 🎬 Trường quay; kịch bản = asset `Assets/Resources/Cinematics/*.asset` | [Cinematic.md](Cinematic.md) |
| Sửa LỜI THOẠI trong video | `Assets/Scripts/Map/Cinematic/CinematicLines.cs` (ô = khoảnh khắc × thời kỳ) | [Cinematic.md](Cinematic.md) |
| User GỬI KỊCH BẢN (phim/game) muốn dựng đúng bối cảnh + nội dung + nhân vật chính | skill `stickman-story`: phim → JSON vào inbox `CinematicAiProjectInbox.json` (`setting` chọn cốt truyện/phe/sân · `hero`/`nemesis` có tên · cảnh `Landmark`/`Reveal`/`Rush` · nhịp `Weather`); game → gói trong `Resources/GamePacksExtra.json` (chặng có `civA/civB · night · weather · biome`, gói có `hero`) | [Cinematic.md](Cinematic.md) luật 39 · 44–47 · [GameFactory.md](GameFactory.md) |
| Thêm cốt truyện phim / cảnh quay mới | `CinematicTemplates.cs` + enum ở `CinematicTypes.cs` | [Cinematic.md](Cinematic.md) mục 3 |
| Sửa màn MOBA hai làn (trụ, lính đợt, cửa hàng, ví tướng) | `Assets/Scripts/Gameplay/Moba*.cs` + `Assets/Editor/Modes/StickmanMobaBuilder.cs`, rồi bấm lại «★ MOBA hai làn» | [Moba.md](Moba.md) |
| Thêm loại nhà cho mode Doanh trại | **sáu chỗ**: `CampBuildKind.cs` (enum · NameOf · BriefOf · DefaultCost) · `CampBuildSite.Raise` · `CampGameUi.BuildKinds` | [ModernFront.md](ModernFront.md) |
| Sửa THẾ GIỚI MỞ (phố GTA 2D) — quận, dân, xe, cảnh sát, việc, tiệm | `Assets/Scripts/Map/Maps/MapOpenWorld.*.cs`, rồi bấm «★ PHỐ MỞ — GTA 2D» | [OpenWorld.md](OpenWorld.md) |
| Chỉnh số một QUẬN (nhà cao thấp, đông dân, cảnh sát nhanh chậm, tiền việc) | `Assets/Scripts/Map/City/CityDistricts.cs` — bảng `Table`, KHÔNG rắc số vào chỗ khác | [OpenWorld.md](OpenWorld.md) mục 2 |
| Chỉnh SAO TRUY NÃ (tội đáng mấy nhiệt, nguội nhanh chậm, cảnh sát ra bao nhiêu) | `Assets/Scripts/Map/Maps/MapOpenWorld.Wanted.cs` — `HeatOf` · `StarHeat` · `MaxCops` | [OpenWorld.md](OpenWorld.md) mục 3 |
| Đổi TÊN/LỚP DA của phố mở theo thời kỳ (quận · tiệm · lính · xe) | `Assets/Scripts/Map/City/CityDistricts.cs` — mục «LỚP DA THEO THỜI KỲ». KHÔNG rắc `if (Medieval)` vào `MapOpenWorld.*` | [OpenWorld.md](OpenWorld.md) mục 1b |
| Sửa TIẾNG của phố mở (còi cảnh sát, tiếng tiền…) | `Assets/Editor/Audio/StickmanAudioSynth.City.cs` + bảng `Recipes` ở `StickmanAudioSynth.cs`, rồi bấm ★ PHỐ MỞ | [OpenWorld.md](OpenWorld.md) mục 3c |
| Thêm một loại VIỆC THUÊ trong phố mở | `MapOpenWorld.Jobs.cs` — một nhánh `StartJob` + một nhánh `CheckDone` | [OpenWorld.md](OpenWorld.md) mục 6 |
| Sửa kinh tế doanh trại (giá, thu, trần quân) | `Assets/Scripts/Gameplay/Camp/TeamEconomy.cs` · asset `EconomyProfile` | [WarCampEconomy](Gameplay.md) |
| Sửa chiến dịch Tam Quốc (bản đồ, lượt, AI) | `Assets/Scripts/Gameplay/ThreeKingdoms/ThreeKingdomsCampaign.cs` | [ThreeKingdoms.md](ThreeKingdoms.md) mục 7 |
| Sửa màn trận của chiến dịch | `Assets/Scripts/Gameplay/Camp/CampaignBattleMode.cs` | [ThreeKingdoms.md](ThreeKingdoms.md) mục 7c |
| Cân bằng chiến dịch | Bảng điều khiển › «Mô phỏng chiến dịch Tam Quốc» rồi đọc Console | [ThreeKingdoms.md](ThreeKingdoms.md) mục 7c |

### Map · công trình · art

| Muốn làm | Mở file | Luật |
|---|---|---|
| Sửa luật sinh map theo kiểu chơi | `Assets/Scripts/Map/Build/MapBuildRules.cs` · `MapAssembler.cs` | [MapSystem.md](MapSystem.md) |
| Thêm chi tiết công trình lắp ghép | `Assets/Editor/Art/StickmanStructureArt*.cs` | [ArtGeometry.md](ArtGeometry.md) |
| Đặt art mới cho ChatGPT vẽ | không sửa code — soạn đơn hàng | [WeaponArt-ChatGPT-Prompt.md](../KnowledgeBase/WeaponArt-ChatGPT-Prompt.md) |
| Thêm kiểu tóc / áo / đuôi / nhân vật cố định (ngoại hình) | `.claude/skills/stickman-look/scripts/lookart.py` → `Assets/Editor/Art/StickmanLookArt.*.cs` → `StickmanLookBuilder.Specs`, rồi «★ Ngoại hình nhân vật» | [CharacterLook.md](CharacterLook.md) |
| Vẽ bù bằng code (chỉ khi chưa có art thật) | `Assets/Editor/*ArtGenerator*.cs` | [ArtGeometry.md](ArtGeometry.md) |

### Hạ tầng · chất lượng

| Muốn làm | Mở file | Luật |
|---|---|---|
| Thêm một phép đo chống «hỏng trong im lặng» | `Assets/Editor/Doctor/StickmanDoctor.Invariants.cs` | [FileSize.md](FileSize.md) (mục cuối) |
| Thêm test cho luật tính bằng số | `Assets/Editor/Doctor/StickmanSelfTest.cs` | chú thích đầu file đó |
| Tách một file quá dài | script trong scratchpad + luật | [FileSize.md](FileSize.md) |
| Thêm một nút vào Bảng điều khiển | `Assets/Editor/Pipeline/StickmanToolCenter.cs` | [Tooling.md](Tooling.md) |
| Thêm một job dựng hàng loạt | `Assets/Editor/Pipeline/StickmanBuildPipeline.cs` | [Tooling.md](Tooling.md) |
| **Quyết định/quy trình mới cần nhớ cho task sau** | Phân loại theo [Persistence.md](Persistence.md): skill · rule · KnowledgeBase/memory · ProjectMap; nối link vào INDEX/TaskIndex | [Persistence.md](Persistence.md) |
| `dotnet build` báo thiếu file / thừa file | `powershell -File Docs/Tools/SyncProjects.ps1` | [FileSize.md](FileSize.md) |

### Ba câu hỏi hay hỏng nhất

1. **«Sửa xong mà trong game không thấy gì đổi»** → thứ đó đã **bake vào scene/prefab**; phải
   dựng lại bằng nút tương ứng, không phải chỉ sửa code. Xem [GameShell.md](GameShell.md).
2. **«Thêm rồi mà nút vẫn không bấm được»** → còn chỗ nối chưa nối (loại nhà 6 chỗ, nền văn minh
   8 điểm). Bấm «★ KHÁM SỨC KHOẺ DỰ ÁN» — nay có phép đo cho cả hai.
3. **«Biên dịch đỏ mà code của tôi không sai»** → .csproj lệch với đĩa, hoặc phiên khác đang sửa
   dở. Chạy `Verify.ps1 -Changed <file bạn sửa>` để tách phần lỗi của mình.
