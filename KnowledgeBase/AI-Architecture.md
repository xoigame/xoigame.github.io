# Kiến trúc hệ AI — bản đồ tổng, luật module, chỗ sửa cho từng việc

Tài liệu TỔNG HỢP toàn hệ AI: hệ được chia tầng thế nào, **hợp đồng** nào giữ cho các tầng
không dính nhau, và **muốn sửa/thêm gì thì đụng đúng chỗ nào** để không lan sang code khác.

Đọc file này TRƯỚC khi sửa bất kỳ file nào trong `Assets/Scripts/AI/`.
Chi tiết từng mảng: [AI-NPC.md](AI-NPC.md) (não cá nhân) · [AI-Command.md](AI-Command.md)
(cây chỉ huy) · [StickmanCombat-AI.md](StickmanCombat-AI.md) (lý thuyết nền).

## 1. Bản đồ tầng

Sáu tầng, phụ thuộc CHỈ ĐI TỪ TRÊN XUỐNG (tầng dưới không biết tầng trên tồn tại):

```
TẦNG 5 — DEBUG (chỉ scene demo, không vào game thật)
    CommandHierarchyHud (F9) · StickmanAILabHud (Demo_8) · StickmanTestbedHud (Demo_5)
    TeamCommandHud · StickmanAgent._logStateChanges
        │ chỉ ĐỌC state/số liệu, không ra lệnh (trừ nút bấm gọi API công khai)
        ▼
TẦNG 4 — CHỈ HUY (Assets/Scripts/AI/Command/)
    TeamCommander (sở chỉ huy) → CommandNode (Composite: tướng/tổ trưởng/lính)
    CommandOrder xuống ↓ · SectorReport lên ↑ · số liệu trong CommandDoctrine (asset)
        │ chỉ DỜI CỘT MỐC (Anchor) + SetBehavior/SetHoldingLine — không đụng FSM
        ▼
TẦNG 3 — PHE
    TeamMember (registry sống: OnEnable vào danh sách, OnDisable rời)
    EnemyWaveSpawner (sinh quân theo đợt, gắn behavior + objective lúc spawn)
        ▼
TẦNG 2 — NÃO CÁ NHÂN (Assets/Scripts/AI/)
    StickmanAgent (điều phối) ── AIState (FSM: Idle/Seek/Combat/Guard/Retreat
                              │           + PatrolRoute/Flee/Ambush/Fetch/Follow/Work)
                              ├─ ICombatStrategy (Melee/Ranged/Throwable — chọn theo vũ khí)
                              ├─ HealthProfileSwitcher (đổi tính cách theo % máu — như boss phase)
                              └─ StickmanExperience (giết địch → XP → lên cấp: IQ + tier vũ khí + máu)
    Hệ khai thác: ResourceNode (cây/mỏ/ruộng/giếng/công trường) + ResourceDepot (kho phe)
                  — registry OnEnable/OnDisable như TeamMember, AIStateWork tự tìm qua đó
        │ chỉ gọi FACADE, không đụng weapon/pose/pool/IK
        ▼
TẦNG 1 — THÂN THỂ (Facade — người chơi và NPC dùng CHUNG)
    StickmanFighterController (AimAt/AttackNow/EquipWeapon/SetGuard)
    StickmanLocomotion (Move/Stop/Jump/Climb — CHỖ DUY NHẤT ghi vận tốc)
        ▼
TẦNG 0b — BỘ AI CỦA MÀN CHƠI (nối gameplay ↔ AI)
    AIPlaybook (vai trò→tính cách · doctrine · cấp IQ · hệ số ĐỊA HÌNH MAP)
    ▲ gắn vào scene bằng AIPlaybookBinder (áp cả scene, hoặc RIÊNG từng phe)
        ▼
TẦNG 0 — DỮ LIỆU (asset, không code)
    AIProfile (tuning 1 kiểu NPC) · AISmartsTable (cấp thông minh — trục dọc của cái đầu)
    UnitLoadout (vũ khí+máu+trang bị) · StickmanArchetype (danh tính hình ảnh)
    CommandDoctrine (tính cách ông tướng) · AIProfiles_Lab/* (số cho từng bài test)
```

## 1b. BA TẦNG NHÌN TỪ GAMEPLAY — AI cá nhân · AI team · AI điều phối

Người thiết kế màn chơi nghĩ về AI bằng BA CÂU HỎI, và mỗi câu đã có đúng một chỗ trả lời.
Đây là bản đồ dịch giữa ngôn ngữ gameplay và bản đồ tầng ở trên:

| Ngôn ngữ gameplay | Là tầng nào | Trả lời câu hỏi gì | Số ở đâu |
|---|---|---|---|
| **AI CÁ NHÂN** | Tầng 2 — `StickmanAgent` + FSM + Strategy | *một thằng lính* đánh/đỡ/né/chạy trốn thế nào | `AIProfile` (+ `AISmartsTable` trục IQ) |
| **AI TEAM** | Tầng 4, node GIỮA — `CommandNode` bậc ≥2 (tổ trưởng) | *một tổ* — dẫn đầu tổ, chia đợt sóng, dồn đánh một đứa (`UpdateFocusTarget`), **che chở lính tụt máu** (`UpdateOfficerCover`), tổ trưởng ngã thì đôn cấp phó | `CommandDoctrine` (`squadSpacing` · `focusFire*` · `officerCover*` · `officerSuccession`) |
| **AI ĐIỀU PHỐI** | Tầng 4, node GỐC — chủ tướng + `CommandDoctrine` | *cả phe* — đánh hay thủ (cán cân lực lượng), tấn công MỤC TIÊU nào (cờ hiệu > điểm chiếm > nhà địch trong `ComputeLineAnchor`), **dàn lớp khiên/cận chiến/tầm xa theo quân mình · quân địch · ý đồ thắng**, phòng thủ MỤC TIÊU nào (**chia cánh về cứu nhà** `UpdateHomeDefense`), giữ dự bị, nhịp xuất quân, vỡ trận | `CommandDoctrine` (`attackRatio…` · `formation*` · `keepReserve` · `homeDefense*` · `sortie*` · `rout*`) |

Lệnh đi XUỐNG qua đúng một đường (dời cột mốc + `SuggestTarget`), nên lính "nhận lệnh rồi
thực thi bằng AI cá nhân" đúng nghĩa đen: tắt hai tầng trên đi thì tầng dưới vẫn chạy y nguyên.

**Màn nào dùng tầng nào** — không phải màn nào cũng dựng cây chỉ huy, và đó là CỐ Ý:

| Kiểu màn | AI team + điều phối là ai |
|---|---|
| Trận DÀN QUÂN (Demo_3 · 7 chế độ · 3 thể loại · doanh trại · hệ map · AILab) | cây `CommandNode` + `CommandDoctrine` — builder gọi `CreateCommanderShared` (hệ map dựng lúc chạy trong `MapAssembler`) |
| Màn KỊCH BẢN (hộ tống · cướp làng · đấu tướng · vây thành · giải cứu) | **CHÍNH MODE SCRIPT** (`VillageRaid`/`ChampionDuel`/`SiegeCamp`…) — nó `SetBehavior` từng vai theo kịch bản. ⚠ ĐỪNG nhét thêm `TeamCommander` vào: `ApplyToAgent` của cây sẽ ghi đè behavior kịch bản mỗi nhịp (vệ sĩ bị lôi khỏi đoàn hộ tống, lính gác bị kéo khỏi tháp) |
| BẦY zombie | `ZombieDirector` — bầy không có sĩ quan, đó là cái làm nó ra "bầy" |
| THUỶ CHIẾN | `ShipCaptain` (mỗi thuyền) + `NavalBattle` — con thuyền là đơn vị chiến thuật, không phải tiểu đội |
| ĐỘT NHẬP (ninja) | không có — sát thủ đơn độc, hô hoán đội hình là hỏng bài |

**Trục ngang × trục dọc** (cùng triết lý với hệ vũ khí):
- Trục NGANG của não = `AIProfile` (kiểu NPC: archer nhát gan, kiếm sĩ liều mạng...).
- Trục DỌC của não = `AISmartsTable` (cấp 1 lính mới → cấp 3 lão luyện, áp lên MỌI profile).
- Máu/damage KHÔNG nằm trong hệ AI — đó là `UnitLoadout` + cấp vũ khí (`WeaponTierTable`).

## 2. Dòng chảy 1 frame của não (`StickmanAgent.Update`)

Pipeline CỐ ĐỊNH, mỗi bước một hàm `Update*` riêng — thứ tự là hợp đồng, đừng xáo:

```
UpdateCornered          hình học: sau lưng có vực không? (tính 1 lần/frame, nơi khác chỉ đọc)
UpdateLastStand         cờ BỀN tử chiến (không đọc lại IsCornered mỗi frame — xem bẫy §6)
kiểm tra Retreat        yếu máu + có địch → đổi state (bỏ qua với hành vi Flee/Fetch —
                        hai hành vi đó tự lo chạy, Retreat hết giờ là QUAY LẠI ĐÁNH)
UpdateStalemateBreaker  lâu không ra đòn → xông liều
UpdateDeadlockBreaker   đòi đi mà không dời chỗ / quay qua quay lại → gỡ kẹt
UpdateRetarget          ĐÁNH ĐỂ THẮNG: theo nhịp chấm điểm lại chiến trường, đổi mục tiêu
                        theo cục diện (retargetInterval; switchMargin giữ chân, lệnh giao thắng)
UpdateWeaponSwap        ĐỔI VŨ KHÍ theo tình huống: cụm đông→bom · rùa thủ→búa nặng ·
                        bị áp sát→cận chiến · địch kite→tầm xa (weaponSwapInterval)
   (trong state)        TRÍ NHỚ: Seek nhớ chỗ thấy lần cuối rồi LÙNG (memoryDuration);
                        Combat ghi nhớ liên tục vì đang giáp mặt
Current.Tick            FSM chạy — TRUNG TÂM quyết định của frame
UpdateDodge             NÉ ĐẠN giành tay lái đúng khoảnh khắc có đạn (chồng lên state).
                        Game nhìn ngang nên né theo CHIỀU DỌC: đạn thấp → NHẢY, đạn cao →
                        NGỒI THỤP, ngang ngực → nhường cho UpdateProjectileGuard
UpdateProjectileGuard   QUAY MẶT VỀ MŨI TÊN + GIƠ KHIÊN/VŨ KHÍ ĐỠ (phần HẠ thế thủ chạy ở
                        ĐẦU frame — xem ReleaseProjectileGuard, AGENTS §3b-neten)
UpdateAoeAvoid          né VÙNG NỔ: lựu đạn/bom rơi gần → chạy khỏi bán kính (mạnh hơn dodge)
UpdateTakeCover         NGỒI THỤP né tên (coverChance) — kiểu tránh "rẻ" khi né lăn đang hồi
UpdateTraversal         nhảy khe / leo thang (sau state — state đã chọn hướng đi)
ApplyCommitDirection    gỡ kẹt ghi đè hướng (sau traversal để cú nhảy vẫn được thực hiện)
UpdateSeekWeapon        TAY KHÔNG → tự đi tới vũ khí rơi gần nhất (weaponSeekRadius)
UpdateTaunt             khiêu khích: gợi ý địch quanh đây đổi mục tiêu sang mình (tauntRadius)
UpdateSupport           THẦY THUỐC: hồi máu đồng đội thương nặng nhất + chúc phúc buff máu
ApplySeparation         giãn cách CỘNG THÊM vào hướng đi (không ghi đè)
UpdateRun               chốt đi bộ/chạy — SAU CÙNG, khi hướng đã xong
```

**Muốn thêm một "phản xạ" mới** (kiểu né đạn, nhảy khe): viết một hàm `Update*` mới, chèn
đúng tầng trong pipeline (trước hay sau `Current.Tick`?), số liệu bỏ vào `AIProfile` —
**KHÔNG sửa state nào cả**. Đó chính là cách dodge/traversal/last-stand đã được thêm mà
FSM không đổi một dòng.

## 3. Tám hợp đồng giữ cho sửa-một-chỗ-không-lan

| # | Hợp đồng | Nhờ nó mà... |
|---|---|---|
| C1 | **AI chỉ gọi Facade**: `Fighter.AimAt/AttackNow/EquipWeapon/SetGuard` + `Locomotion.Move/Stop`. Cấm đụng weapon/pose/pool/IK | sửa hệ vũ khí / animation thoải mái, AI không hay biết; player và NPC dùng chung 1 nhân vật |
| C2 | **Số liệu ở asset, code đọc `Agent.Profile`** (bản đã qua bảng cấp) — không hardcode, không đọc thẳng asset gốc | tuning không cần compile; cấp thông minh áp vào mà state/strategy không biết gì |
| C3 | **State là plain class, TỰ quyết chuyển state** (Enter/Tick/Exit); agent chỉ cung cấp `ChangeState` + câu hỏi (`AcquireTarget`, `DistanceToTarget`...) | thêm/sửa 1 state không đụng state khác; không tốn GameObject |
| C4 | **Strategy chọn theo `weapon.Category`** (`CurrentStrategy`), cache `Profile` lúc dựng → đổi profile phải qua `SetProfile` (tự dựng lại) | thêm vũ khí mới KHÔNG sửa AI — miễn nó thuộc 1 trong các Category có sẵn |
| C5 | **Cấp thông minh = biến đổi profile** (`AISmartsTable.Apply` trả BẢN SAO runtime), không chạm code hành vi | thêm/sửa cấp chỉ sửa `DefaultLevels()`; nhiều NPC chung 1 profile khác cấp không đụng nhau |
| C6 | **Lệnh xuống, báo cáo lên; chỉ huy DỜI CỘT MỐC** — không gọi lại `SetBehavior` mỗi nhịp (nó thoát sớm khi lệnh không đổi) | sửa não lính không đụng cây chỉ huy và ngược lại; tướng chết → lính vẫn tự đánh (leaderless) |
| C7 | **`TeamMember` là registry theo OnEnable/OnDisable**; mọi radar (`SelectBestEnemy`, `TeamCommander`) quét qua nó và bỏ object tắt. Vòng quét NÓNG (mỗi frame / mỗi agent) phải đi qua **lưới không gian** `TeamMember.QueryNear`, không duyệt `All` | tắt 1 vùng/1 lính là nó biến mất khỏi mọi hệ — AI Lab bật tắt vùng mà không lẫn quân; và trận đông người không sập FPS vì O(n²) |
| C8 | **Mọi thứ lặp lại = tool + bài test**: số chuẩn trong builder (`EnsureDoctrine`, `EnsureLabProfiles`, `AISmartsTable.DefaultLevels`), chạy lại tool là asset về chuẩn | hành vi mới nào cũng có sân thử riêng trong `Demo_8_AILab`, hỏng là thấy ngay ở đâu |
| C9 | **MỘT CỬA cho ba tầng ra lệnh**: ai muốn lái chân một người lính thì xin PHIẾU `(chủ · cấp · hạn)` — `agent.TryTakeOrders(this, OrderAuthority.Director)`; tầng điều phối chỉ HỎI `CanOrder`. Nhiệm vụ nhiều pha TỰ KHAI bằng `AIState.OwnsItsOrders`, không chép tay vào `ApplyToAgent` | thêm mode/state nhiều pha KHÔNG phải sửa file ở tầng chỉ huy; chủ biến mất thì phiếu tự hết, hết lớp lỗi "lính bị khoá khỏi mọi mệnh lệnh tới hết trận". Luật: [Command.md](../AgentRules/Command.md) · đo: Doctor «Thang quyền ra lệnh» |

## 4. MUỐN X → SỬA ĐÚNG CHỖ NÀO

Bảng tra chính — mỗi dòng ghi rõ chỗ ĐƯỢC sửa và chỗ KHÔNG ĐƯỢC đụng:

| Muốn | Sửa ở | KHÔNG đụng |
|---|---|---|
| Chỉnh tính cách 1 kiểu NPC (nhát/liều, tầm nhìn, nhịp đánh) | asset `AIProfile` (hoặc tạo profile mới, gán vào `StickmanAgent._profile`). Bộ preset đặt tên sẵn: `Assets/Settings/AIProfiles/` (Nhát gan / Cuồng chiến / Cẩn trọng / Sát thủ / Săn tướng / Rình rập / Hộ vệ — tool `AI > 6`, số chuẩn trong `StickmanAIPersonalityBuilder`) | code |
| Lính đổi tính cách theo % máu (cuồng máu...) | gắn `HealthProfileSwitcher` + mảng ngưỡng→profile (một chiều, đi qua `SetProfile` nên giữ cấp IQ) | BossController, state |
| Chỉnh nhịp LÊN CẤP / phần thưởng mỗi cấp | `ExperienceTable.DefaultMilestones()` rồi chạy `AI > 7` (XP/mạng + mốc: IQ · tier vũ khí · máu). Cộng XP từ nguồn ngoài: `StickmanExperience.GainXp` | code combat (ghi công qua event `TeamMember.AnyDied` + `DamageInfo.source`) |
| NPC khôn/ngu hơn | `StickmanAgent._smartsLevel` (0-3); lúc chạy `SetSmartsLevel(n)` | AIProfile, state, strategy |
| Thêm/chỉnh CẤP thông minh | `AISmartsTable.DefaultLevels()` rồi chạy `Tools > Stickman > AI > 5` | StickmanAgent (đã nối sẵn) |
| Thêm KIỂU LÍNH mới (vũ khí + máu + trang bị + hình) | asset `UnitLoadout` + `StickmanArchetype` | prefab NPC, code AI |
| Thêm HÀNH VI nền mới | class mới trong `AIStates.cs` + giá trị mới trong enum `AIBehavior` + nhánh trong `StickmanAgent.DefaultState()`. Mẫu mới nhất: `AIStatePatrolRoute` / `Flee` / `Ambush` / `Fetch` / `Follow` — cả 5 vào đúng đường này, không sửa state cũ | các state có sẵn, strategy, Facade |
| Thêm LỐI ĐÁNH cho nhóm vũ khí MỚI (Category mới) | class mới trong `CombatStrategies.cs` (kế thừa `CombatStrategyBase`, override từng bước của Template Method) + 1 case trong `StickmanAgent.CurrentStrategy` + 1 dòng dựng trong `Awake`/`SetProfile` | FSM, các strategy có sẵn |
| Thêm BINH CHỦNG có lối đánh riêng (kỵ binh, pháo thủ...) | Strategy riêng + điều kiện chọn trong `CurrentStrategy` (mẫu: `CavalryCombatStrategy` chọn theo `agent.IsMounted`). **Luôn làm kèm vế đối trọng** — kỵ binh đi với `braceAgainstCavalry` của lính giáo | FSM, các binh chủng khác |
| Đổi AI cho MỘT MÀN CHƠI / MAP | asset `AIPlaybook` + gắn `AIPlaybookBinder` vào scene (tool `AI > 8` sinh 8 bộ mẫu). Map rộng/hẹp/nhiều tầng → `visionScale`/`spacingScale`/`terrainTraversal`; màn phá công trình → `objectiveIsStructure` | code AI, profile gốc (playbook tạo BẢN SAO runtime) |
| Vũ khí mới thuộc Category CŨ | không sửa AI gì cả (C4); nếu vũ khí có "tính cách" riêng → `WeaponBase.AiPreferredRangePercent` | AI |
| Thêm PHẢN XẠ mới (kiểu né đạn/nhảy khe) | hàm `Update*` mới chèn vào pipeline §2 + field số trong `AIProfile` | state (trừ khi phản xạ phải đổi state) |
| Thêm TIÊU CHÍ chọn mục tiêu (vd ưu tiên healer) | cộng điểm trong `StickmanAgent.SelectBestEnemy` + field bonus trong `AIProfile` (theo mẫu `zoneTargetBonus`/`structureTargetBonus`) — **mặc định phải TRUNG TÍNH** (0 = hành vi cũ) | FSM, strategy |
| Mục tiêu KHÔNG PHẢI NGƯỜI (cổng, xe, nhà, trụ) | class kế thừa `StickmanController` + gắn `TeamMember` (mẫu: `BaseBuilding`, `DestructibleTarget`) — tự lọt radar AI | AI |
| Đổi tính cách ÔNG TƯỚNG (liều/thủ, ngưỡng rút) | asset `CommandDoctrine` | CommandNode |
| Tổ trưởng CHE CHỞ lính tụt máu (tầng AI team) | `CommandDoctrine.officerCoverHealthPercent/officerCoverRange` (logic: `CommandNode.UpdateOfficerCover` — đi qua `SuggestTarget`, chỉ sĩ quan standoff 0). 0 = tắt | FSM lính, `SelectBestEnemy` |
| Lính biết CHE / YỂM TRỢ nhau (tầng AI cá nhân, **cả hai kiểu nhìn**) | `AIProfile.coverAllyRadius` · `coverFireRadius` · `coverAllyCommit` (bảng lý do + hình học: `SquadSupport`; hành động: `AICoverAllyModule`; lính khiên sân 3/4: `MeleeCombatStrategy.UpdateGroundShieldPosition`). 0 = tắt. Đo: Doctor «Che chắn & yểm trợ» + AI Lab bài 31 | `CommandNode.UpdateOfficerCover` (đó là tầng TEAM — sĩ quan chỉ điểm mục tiêu, không phải lấy thân ra chắn), đội hình |
| Nhà bị đột kích sau lưng → CHIA CÁNH về cứu (tầng điều phối) | `CommandDoctrine.homeDefenseRadius/homeDefenseMinHold` (logic: `CommandNode.UpdateHomeDefense` — cùng khuôn `UpdateReserve`, ghi đè lệnh cánh lùi nhất). 0 = tắt | FSM lính, các cánh khác |
| Đội hình cả phe theo quân mình/địch/mục tiêu | `TeamCommander.SetFormationIntent` (Map gọi từ `MissionPlan`) + `CommandDoctrine.formation*`; slot áp qua `CommandNode.SetFormationLayout`, không reset FSM | `Demo_8_AILab` › “Đội hình thích ứng (AI team)” |
| Bật/chỉnh QUÂN DỰ BỊ | `CommandDoctrine.keepReserve/reserveCommitRatio/reserveMinHold` (logic ở `CommandNode.UpdateReserve` — ghi đè lệnh sau Distribute, trước children Resolve) | FSM lính |
| Chỉnh nhịp ĐỔI VŨ KHÍ / ĐÒN NHỬ | `AIProfile.weaponSwapInterval` · `feintChance/feintCooldown` (logic: `StickmanAgent.UpdateWeaponSwap`, `CombatStrategyBase.TryFeint`) | state, weapon |
| AI biết ĐỌC ĐÒN (phản công lúc địch thu tay · nhử bước · cắt vung để đỡ · né kẹp / mắt sau lưng) | `AIProfile.punishChance` · `baitChance/baitCooldown` · `guardCancelChance` · `sandwichAwareness` · `blockReactionTime` (logic: `CombatStrategyBase.UpdatePunish / UpdateBait / TryEscapeSandwich / FindSwingingThreat / UpdateBlock`, đọc `StickmanProceduralAnimator.Phase`). Thang cấp: `AISmartsTable.Level.canPunish · canBait · canCancelIntoGuard · spatialAwareness` + hệ số/sàn. AGENTS §3b-docdon | `MeleeWeapon.TryBlock` (nó CỐ Ý từ chối khi đang vung — đó là lý do phải CẮT vung), animator |
| AI biết NÉ TÊN (nhảy qua / ngồi thụp) và GIƠ KHIÊN ĐỠ TÊN | `AIProfile.projectileGuardChance` · `duckDuration` (logic: `StickmanAgent.UpdateDodge` chọn NHẢY/THỤP/lách theo độ cao đạn bay qua, `UpdateProjectileGuard` quay mặt + giơ thế thủ). Mốc dọc là hằng số trong `StickmanAgent` (`JumpEvadeBelow` · `DuckEvadeAbove`) — đo theo phần chiều cao thân, không gõ số world. AGENTS §3b-neten | `CombatStrategyBase.UpdateBlock` (nó chỉ NHƯỜNG khi `IsGuardingIncoming`), `TryBlock` của vũ khí |
| Đo "cấp N có thắng 2 lính cấp N−1 không" | AI Lab bài 29 «Thang cấp AI» (`DuelLabHud.EditorSetupLadder` — tỉ số ván, «tự đánh tiếp»), rồi chỉnh `AISmartsTable.DefaultLevels()` + chạy lại tool bảng cấp | profile từng bài |
| Cây chỉ huy sâu/rộng hơn | `TeamCommander._ranks` / `._branching` trong scene | code |
| Kế nhiệm khi sĩ quan chết | `CommandDoctrine.commanderSuccession` / `.officerSuccession` | CommandNode |
| Boss đổi tính cách theo phase | `agent.SetProfile(profilePhaseN)` lúc chạy (mẫu: `BossController`) — cấp thông minh giữ nguyên qua các phase | state |
| Thêm BÀI TEST AI | 1 hàm `Build*Zone` trong `StickmanAILabBuilder` + 1 dòng trong list `scenarios` (+ profile riêng vào `EnsureLabProfiles` nếu cần) | HUD (data-driven), các zone khác |
| Sinh quân theo đợt/kịch bản | `EnemyWaveSpawner.EditorSetup/EditorSetFlavor/EditorSetPacing` trong builder | AI |
| Thêm HẬU QUẢ sau khi trúng đòn (cháy/độc/choáng/ngã) | 1 giá trị `StatusEffectType` + 1 nhánh trong `StickmanStatus` + khai `StatusApplication` trên vũ khí. **Mặc định `chance = 0`** | `TakeDamage` (trạng thái vẫn đi qua nó), `WeaponBase.Damage` (đừng cộng thẳng vào damage) |
| Vũ khí gây hiệu ứng đặc biệt (tên lửa, đao độc, búa quật ngã) | mảng `_onHitStatus` trên prefab vũ khí — **chạy lại Balance Report sau đó** | code AI, code vũ khí |
| Thêm loại CÔNG TRÌNH mới (thang, máy, tháp...) | class kế thừa `Fortification` + 1 giá trị `FortKind` + 1 hàm `Create*` trong `StickmanFortBuilder` (mẫu: `SiegeLadder`, `SiegeEngine`) — tự có máu, tự lọt radar AI | `SelectBestEnemy`, `UpdateBlockedPath` |
| Cho một BINH CHỦNG chọn mục tiêu KHÁC bộ binh (kỵ binh đột kích tuyến sau) | MODULE riêng đặt `agent.Target` ở pha `BeforeState` + cờ CAM KẾT trên agent (mẫu: `AICavalryRaidModule` + `IsRaiding`/`BeginRaid`/`EndRaid`, số trong `AIProfile.cavalryRaid*`) | `SelectBestEnemy` — đừng nhét `if (IsMounted)` vào đó, mọi bộ binh trong sân sẽ phải trả phí cho một luật chỉ dành cho người đang cưỡi |
| Dáng đứng riêng theo TÌNH HUỐNG (canh gác, mệt, sợ) | thêm 1 STYLE cho `Idle` trong `StickmanActionSetBuilder` với **`weight = 0`** (chỉ gọi đúng tên mới ra) + 1 kênh trên `StickmanBodyAnimator` (mẫu: `SentryStyle`/`SetStandingWatch`), state/module xin qua đầu vào ghi-mỗi-frame `StickmanAgent.RequestSentry` | `StickmanActionType` (không cần loại mới) · `SetDefaultIdleStyle` (ô đó là style GỐC của loại nhân vật — zombie lê chân) · `IsAmbientClip` |

Quy tắc chung khi bảng trên bảo "thêm field vào AIProfile": **giá trị mặc định phải giữ
nguyên hành vi cũ** (0 = tắt / hệ số 1) — mọi asset profile cũ chưa ghi field mới sẽ dùng
default trong code, thêm field mà default đổi hành vi là MỌI NPC trong game đổi tính.

## 5. Quy trình sửa lỗi (debug playbook)

Theo thứ tự — đa số lỗi dừng ở bước 1-2:

1. **Mở `Demo_8_AILab`** (F1 → "AI Lab"), chọn bài gần nhất với lỗi, bật **"Soi state từng
   NPC"**: thấy ngay con nào kẹt ở state nào, mục tiêu là ai, cấp IQ mấy, máu bao nhiêu.
   Kéo thời gian 0.25x mà nhìn. Chưa có bài test cho tình huống đó → **viết bài test trước,
   sửa lỗi sau** (bài test ở lại làm lính gác hồi quy).
2. Lỗi dính tới PHE/đội hình → **F9** (cây chỉ huy): ai chỉ huy ai, lệnh gì đang chạy,
   thế trận nào. "2 phe không chịu đánh nhau" nhìn ở đây trước tiên.
3. Lỗi 1 con cụ thể → bật `StickmanAgent._logStateChanges` trên đúng con đó.
4. Lỗi nghi do TUNING chứ không phải code → so `Agent.Profile` (bản runtime, đã qua bảng cấp)
   với asset gốc; nhớ `_smartsLevel > 0` là số ĐÃ bị biến đổi.
5. Chọn Scene view khi đang chọn nhân vật: tia dò vực (xanh = có đất, đỏ = vực) —
   cho các lỗi "không chịu lùi", "xoay vòng cạnh vực".

## 6. Bẫy đã dính — sửa lại lần nữa là có lỗi cũ quay về

Đây là các chỗ CỐ Ý viết như vậy; refactor "cho gọn" là dính lại đúng bug cũ:

- **`IsMeleeThreatSwinging` chỉ nhận `animator.IsCommitted` (Windup + Strike)** — đổi về
  `IsAttacking` là giơ thế thủ cả lúc nhát đã qua (pha thu tay ~45% cú đánh), đốt
  `blockCooldown` vào một cú đỡ vô ích và nhát thật kế tiếp ăn trọn.
- **`MeleeWeapon.TryBlock` từ chối khi `Animator.IsAttacking`** — `SetGuard(true)` giữa lúc
  đang vung KHÔNG đỡ được gì dù cờ bật. Muốn đỡ thì `Interrupt()` cú vung trước
  (`guardCancelChance`); đừng "sửa" bằng cách bỏ chốt trong `TryBlock` — bỏ là vừa chém vừa đỡ.
- **`MeleeCombatStrategy.UpdatePosition` phải gọi `ContinueSlip` ở đầu** — nó override trọn
  hàm gốc, quên dòng đó là cam kết lách sống đúng một frame (đã dính, 2026-09-05).
- **Bộ dò "đạn sắp trúng mình" đo từ TÂM THÂN, không từ gốc transform** — gốc nằm ngang bàn
  chân, lấy nó làm tâm là quét mất nửa tầm xuống dưới đất và bỏ sót mọi phát bắn vào ngực/đầu.
  Ba hệ đọc chung hàm đó: né đạn · tường khiên (`IsUnderFire`) · nấp.
- **Đỡ tên: HẠ thế thủ ở đầu frame, GIƠ ở cuối frame** — gộp làm một là cướp mất cú đỡ mà
  `UpdateBlock` vừa giơ cho một cú vung cận chiến thật.
- **`AISmartsTable.Level.guardCancelFloor` là SÀN (`Mathf.Max`), không phải hệ số** — profile để
  0 mà nhân thì mãi là 0, tính năng chết lặng đúng kiểu `flankCommitTime`.

- **`SetBehavior` thoát sớm khi lệnh không đổi** — gọi lại nó mỗi nhịp là `Target = null` +
  reset FSM, lính văng khỏi Combat đúng lúc sắp ra đòn. Chỉ huy phải DỜI CỘT MỐC thay vì
  phát lại lệnh.
- **Tử chiến là CỜ BỀN (`FightsToTheDeath`), không phải đọc `IsCornered` trực tiếp** —
  `IsCornered` là hình học tức thời, rời mép một bước là tắt → nhấp nhứ xoay vòng ở mép vực.
- **`_nextRetreatAllowed`**: chạy xong phải đánh một lúc mới được xin chạy tiếp — bỏ là
  chạy-quay-chạy-quay vô tận.
- **`dodgeStyle` phải chỉ định rõ** (mặc định `sidestep`) — để trống là bốc trúng cú lộn 360°
  dài gấp đôi cú né, cả sân xoay tròn.
- **Strategy cache `Profile` lúc dựng** — đổi profile/cấp PHẢI qua `SetProfile`/`SetSmartsLevel`
  (tự dựng lại strategy); gán thẳng `Profile` là boss phase 2 vẫn đánh số phase 1.
- **`SetSmartsLevel` áp lên profile GỐC** (`_profile` được `SetProfile` ghi nhớ) — không được
  áp bảng cấp lên bản đã biến đổi (cộng dồn cấp lên cấp).
- **Vẽ chuyển động hỏi `TravelSpeed`, không hỏi `Velocity`** — bị chắn đường thì `Velocity`
  vẫn báo đang chạy.
- **`regroupSpread` phải RỘNG HƠN bề dày đội hình** — không thì cả phe kẹt ở TẬP KẾT vĩnh viễn.
- **AI Lab: mỗi lần load chỉ MỘT vùng được bật, tắt từ `Awake`** (trước mọi `Start`) — nhờ C7
  mà các bài dùng chung phe 1/2 không lẫn quân; đổi bài = reload scene, đừng đổi sang bật/tắt
  vùng giữa chừng (spawner/cây chỉ huy của bài cũ còn sống).
- **Cam kết của kỵ binh đột kích (`IsRaiding`) phải được TÔN TRỌNG ở 5 chỗ** — `UpdateRetarget`,
  `AIStateSeek` (luật `disengageRange`), `AIStateSeek` (luật "đứa dí sát mặt xử trước"),
  `OnOwnerDamaged`, và chính module (nhường `IsBreakingObstacle`). Bỏ chỗ nào cũng ra cùng một
  triệu chứng: mục tiêu nhấp nháy giữa mồi ở tuyến sau và đứa gần nhất, con ngựa quay đầu giữa
  đà. Đây là §5c ở dạng "module xin — state đè", chữa bằng MIỄN LUẬT chứ không phải nới số.
- **Dáng canh gác xin qua `RequestSentry()` MỖI FRAME, không phải bật/tắt cờ bền** — đổi sang
  cờ bền là chỉ cần một đường thoát state quên gọi tắt thì lính đứng nghiêm giữa lúc đánh
  nhau, và ba nguồn (Guard/Garrison/Watch) bắt đầu giẫm chân nhau.
- **Giãn cách đồng đội là NHƯỜNG ĐƯỜNG BẤT ĐỐI XỨNG, không phải đẩy đối xứng**
  (`SeparationPriority`: đang đi 0 < đứng yên 1 < đứng làm nhiệm vụ 2; chỉ nhận lực đẩy từ
  bậc ≥ mình, 2-vs-2 phân định bằng EntityId). Sửa về đẩy đối xứng "cho gọn" là người đi
  ngang lại hích thợ đang đốn cây / vệ sĩ đang đứng chốt văng khỏi chỗ (đã dính 1 lần).

## 7. Checklist trước khi khai "xong" một thay đổi AI

- [ ] Số mới nằm trong asset (`AIProfile`/`AISmartsTable`/`CommandDoctrine`/loadout), không hardcode
- [ ] Field mới có default TRUNG TÍNH (hành vi cũ giữ nguyên khi chưa ai gán)
- [ ] Code mới chỉ gọi Facade (C1) — không import gì từ Combat ngoài API công khai của Fighter
- [ ] Đổi profile/cấp lúc chạy đi qua `SetProfile`/`SetSmartsLevel`
- [ ] Có bài test trong `Demo_8_AILab` (hoặc scene demo có sẵn) tái hiện được hành vi mới
- [ ] Chạy lại tool liên quan (`AI > 1..5`, `Create Demo Scenes`) — asset sinh từ tool phải
      được ghi lại từ số trong code
- [ ] Xem lại §6 — thay đổi có chạm bẫy nào không

## Bàn quan sát: Trại chiến trên map vòng (AI Lab vùng 30, 2026-09-07)

`StickmanAILabBuilder.BuildWarCampZone(29)` — hai tướng MÁY tự đánh nhau, đánh mãi, để ngồi xem mà
chỉnh game. Ba thứ bắt buộc, thiếu cái nào thì bàn này nói dối:

1. **Đủ cánh** — cây 2 bậc × 3 nhánh. Cánh vòng và tổ giữ hậu tự tắt khi phe < 3 cánh, nên bàn
   2 cánh thì hai cơ chế mới không bao giờ chạy và người xem kết luận "AI không biết vòng" trong
   khi luật đang cố ý im lặng.
2. **Đánh liên tục** — có `RespawnDirector`; đọc nhịp điều phối cần vài chục lượt giao tranh.
3. **Map vòng thật** — `MapWrapZone` phủ đúng bề ngang vùng. Vùng không được chọn thì bị
   `SetActive(false)` nên `MapWrapZone` tắt theo: không có chuyện lính bài khác bị vòng lây, dù
   `MapWrap` là sổ TĨNH dùng chung.

Hai trại đặt ở ±20 trên vòng 92 — **cách nhau 40 < nửa chu vi 46**, xem luật ở MapSystem.

### ⚠ Lỗi đã sửa cùng lượt: `DressLab` chạy 30 lần

`DressLab()` bị gọi từ `BeginZone`, mà `BeginZone` chạy một lần cho MỖI vùng ⇒ scene có 30 cái
`MapDressing`, mỗi cái tự quét toàn bộ collider + sprite của scene rồi dựng một bộ núi khung riêng.
30 lớp núi chồng nhau ở cùng chỗ, 30 lượt quét — không lỗi nào báo, chỉ là scene nặng và núi đậm
màu bất thường. Nay `DressLab` tự thoát khi đã có một bản trong scene.
