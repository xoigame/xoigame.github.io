# AI NPC — FSM + Strategy trên nền hệ vũ khí

> Code: `Assets/Scripts/AI/` · Tool: `Tools > Stickman > AI` · Tuning: asset `AIProfile`
> NPC làm được: tự đi tuần, tìm địch, tự đánh (đúng lối đánh của vũ khí đang cầm),
> đánh trả khi bị tấn công, săn mục tiêu chỉ định, bảo vệ mục tiêu (có leash), rút lui khi yếu máu.

## 0. Hành vi tham khảo từ các game 2D quen thuộc

| Hành vi trong hệ này | Thấy ở game nào |
|---|---|
| Unit tự đi - tự đánh - giữ vị trí | Stick War, Age of War (lane battle) |
| Aggro khi bị đánh lén (đang yên bị bắn là quay ra trả đũa) | Terraria, Starbound |
| Ranged giữ dải khoảng cách, lùi khi bị áp sát (kite) | bot MOBA, archer trong Kingdom Rush |
| Guard có leash (không bị dụ ra xa khỏi thứ đang bảo vệ) | minion/pet MMO, tower defense hero |
| Rút lui khi máu thấp, hết nguy hiểm lại quay về | Age of War, RimWorld pawn |

## 1. Kiến trúc — pattern nào nằm ở đâu

```
StickmanAgent (não — MonoBehaviour duy nhất của AI)
├── FSM: AIState (STATE pattern, plain class — không tốn GameObject)
│     AIStateIdle → AIStateSeek → AIStateCombat
│     AIStateGuard (behavior Guard)      AIStateRetreat (máu thấp, check ở tầng agent)
├── ICombatStrategy (STRATEGY pattern — lối đánh theo NHÓM vũ khí đang cầm)
│     MeleeCombatStrategy / RangedCombatStrategy / ThrowableCombatStrategy
│     (CombatStrategyBase.Tick là TEMPLATE METHOD: đứng đúng tầm → ngắm → đánh)
├── OBSERVER: nghe StickmanController.Damaged (aggro-on-hit) + Died (tắt não, dừng chân)
└── FACADE: chỉ gọi StickmanFighterController.AimAt/AttackNow/EquipWeapon
            + StickmanLocomotion.Move/Stop — không đụng weapon/pose/pool bao giờ
```

Hạ tầng đi kèm:

| Component | Việc |
|---|---|
| `TeamMember` | phe (teamId) + sổ đăng ký tĩnh → `FindNearestEnemy(pos, team, range)` không GameObject.Find |
| `StickmanLocomotion` | đi ngang bằng `Rigidbody2D.linearVelocity` (đúng rule ragdoll), freeze rotation, **đi bộ/chạy + thể lực** |
| `StickmanLegWalker` | bước chân procedural: đung đưa IKLegL/IKLegR theo tốc độ — không cần clip Walk |
| `AIProfile` (ScriptableObject) | TOÀN BỘ số tuning: tầm nhìn, dải khoảng cách đánh, ngưỡng rút lui, leash... |

## 2. Bản đồ design pattern của TOÀN hệ combat (trả lời "áp dụng pattern")

| Pattern | Ở đâu | Giải quyết gì |
|---|---|---|
| **State (FSM)** | `AIStates.cs` | mỗi trạng thái 1 class, tự quyết định chuyển đi đâu — thêm state mới không sửa state cũ |
| **Strategy** | `CombatStrategies.cs`; cả 3 nhánh `WeaponBase` cũng là strategy của "cách ra đòn" | đổi vũ khí = đổi lối đánh, không if/else theo WeaponType rải rác |
| **Template Method** | `CombatStrategyBase.Tick`, `WeaponBase.TryAttack` (cooldown→DoAttack→feedback), `AIState.Enter/Tick/Exit` | khung cố định, class con chỉ override từng bước |
| **Observer** | event `Died`/`Damaged` (controller), `WeaponChanged` (holder) — drop đồ, aggro, UI đều là subscriber | thêm phản ứng mới không sửa StickmanController |
| **Facade** | `StickmanFighterController` (AimAt/AttackNow/EquipWeapon) | player và AI lái CÙNG một nhân vật qua cùng một mặt tiền |
| **Object Pool + Singleton** | `ProjectilePoolManager` (`UnityEngine.Pool`) | không Instantiate/Destroy đạn lúc chơi |
| **Prototype** | cây prefab base → variant (Weapon_Base, Proj_Base, Character) | thêm vũ khí/nhân vật = clone + override |
| **Parameter Object** | `DamageInfo` (damage, hướng, điểm trúng, nguồn) | pipeline hit truyền 1 struct, thêm field không vỡ chữ ký |

Pipeline một đòn đánh chuẩn (combat → attack → hit):

```
FSM Combat → Strategy.Tick → Fighter.AttackNow(charge)            [Facade]
  → Holder.Attack → WeaponBase.TryAttack (cooldown? charge đủ?)   [Template Method]
    → DoAttack (con: bắn / quét hitbox / ném)                     [Strategy]
      → StickmanController.TakeDamage(DamageInfo)                 [Parameter Object]
        → trừ máu → Damaged / Died (event)                        [Observer]
            → aggro AI, rớt vũ khí, rớt trang bị, loot, UI máu...
```

## 3. FSM chi tiết

```
                 thấy địch (scan)              vào tầm vũ khí
   Idle/Patrol ────────────────► Seek ────────────────────► Combat
      ▲   ▲                       │  địch chết/thoát tầm nhìn  │ ra khỏi tầm ×1.2 (hysteresis)
      │   └───────────────────────┴────────◄──────────────────┘
      │        máu ≤ retreatHealthPercent (check ở AGENT, state nào cũng thoát được)
      └──────◄ Retreat ◄─────────────────────────────────────────
               (chạy tới khi địch xa retreatSafeDistance hoặc hết retreatMaxDuration)

   Guard (behavior GuardTarget): thay thế Idle/Seek —
   bám Objective ở guardFollowDistance; địch lọt vào guardEngageRange quanh Objective → đánh;
   địch (hoặc chính mình) xa Objective quá guardLeashRange → bỏ, quay về.
```

**Vệ sĩ không chỉ bám đuôi — 6 việc nó tự làm** (`AIStateGuard`):

| Việc | Cách làm |
|---|---|
| **Giữ tuyến, không lao ra** | chỉ đánh khi địch đã vào trong `guardScreenDistance + guardHoldMargin` tính từ VIP; xa hơn thì đứng đợi. `UpdateStalemateBreaker` cũng bị tắt khi đang gác — không "xông liều" |
| **Đứng chắn**, không đứng đè nhau | chỗ đứng gác = phía địch đang tới, lùi ra từng nấc theo `StickmanAgent.GuardSlot` (`guardScreenDistance` + `guardSpacing`). Chưa thấy địch thì kèm hai bên |
| **Chia mục tiêu** | `SelectBestEnemy(range, vị trí VIP)` — chấm điểm từ chỗ VIP đứng, có `maxAttackersPerTarget` nên 2 vệ sĩ ôm 2 thằng khác nhau |
| **VIP/NHÀ dính đòn là xông ra** | nghe `Damaged` của thứ được bảo vệ → nhắm thẳng kẻ vừa đánh (kể cả bắn lén ngoài `guardEngageRange`), leash nới `guardAvengeLeashScale` lần trong `guardAvengeTime` giây. **`guardAlarmResponders` đứa gần nhất** rời tuyến (`GuardRankTo`), còn lại giữ chỗ — thủ nhà bị đánh 2 mặt nên mặc định 2 đứa, chứ 1 đứa thì không kịp dọn |
| **Báo động thì TỰ ĐI TÌM địch** | trong cơn báo động, tầm quét quanh mục tiêu nới thành `guardAlarmEngageRange` (12) thay vì `guardEngageRange` (6). Nhờ đó kẻ vừa đánh nhà mà chết là vệ sĩ tự tìm đứa khác quanh nhà mà dọn, không quay về đứng gác ngay giữa lúc đang bị đánh |
| **Đi tới đi lui khi gác** | tới chỗ gác rồi thì đi qua đi lại trong `guardPatrolRadius`, tới mỗi đầu đứng ngó `guardPatrolPauseTime` giây rồi quay đầu. Nhịp lệch pha theo `GuardSlot` + random → cả tốp không bước đều như duyệt binh. **Thấy bóng địch trong `guardAlertRange` là ngừng dạo ngay**, đứng quay mặt về hướng đó |
| **Không bị dụ** | hết giờ truy kích là leash về `guardLeashRange`, bỏ mục tiêu, về chỗ gác |

> **LUẬT BẢO VỆ: người bảo vệ và người được bảo vệ PHẢI cùng `_teamId`.**
> `AIStateGuard` tìm kẻ đột nhập bằng `FindNearestEnemy(vị trí Objective, teamId của MÌNH, ...)`
> — khác phe là chính VIP bị tính là địch đứng ngay trước mặt vệ sĩ.
> Hệ phe là **nhị phân**: khác `_teamId` = địch, KHÔNG có "trung lập".
> Người chơi muốn đứng về phe bảo vệ thì cũng phải đặt cùng `_teamId` với VIP
> Trong `Demo_4_Guard` thì **chính người chơi là VIP**: 3 vệ sĩ lấy `player.transform`
> làm `_objective`, cả 4 đều `TeamGuardSide`.

### Bảo vệ CÔNG TRÌNH (Demo_6 — thủ nhà)

`BaseBuilding` kế thừa `StickmanController` nên nhà chính **là một "nhân vật"** với phần còn
lại của hệ thống: có máu, có `TeamMember`, AI địch tự nhắm tới qua `AcquireTarget`, ăn damage
qua đúng một đường `TakeDamage`. **Không phải sửa một dòng AI hay vũ khí nào** — chỉ cần gán
`SetBehavior(GuardTarget, house.transform)` là lính biết gác nhà y như gác VIP:

- `Watch()` bắt `BaseBuilding.Damaged` → nhà ăn đòn là cả tổ gác biết ngay
- `GuardPostX` lấy vị trí nhà làm gốc → lính tự dàn hàng chắn hai bên nhà theo `GuardSlot`
- Nhà sập (`OnDeath`) → tắt máy sinh quân, xám màu + nghiêng (không có ragdoll để đổ)

Máy sinh quân của nhà là chính `EnemyWaveSpawner` cũ, chỉ đổi `_spawnBehavior = GuardTarget`
và `_namePrefix` — cùng một component vừa làm máy đẻ giặc vừa làm máy đẻ quân mình.

### Địch vào theo đợt — `EnemyWaveSpawner`

Một component runtime (`Assets/Scripts/Gameplay/Modes/EnemyWaveSpawner.cs`), mọi số liệu ở Inspector:

- `_spawnPoints` nhiều điểm → mỗi đợt đổi một bên (lần lượt trái/phải)
- `_nextWaveWhenAliveBelow` — đợt sau **chỉ ra khi đợt trước gần hết**, đây là cái làm nên nhịp "lần lượt"
- `_startSize` / `_growEveryWaves` / `_maxSize` — độ khó tăng dần; `_maxAlive` chặn dồn cục
- `_weaponCycle` — xoay vòng vũ khí cho từng đứa; `_maxWaves = 0` = đánh mãi

Mỗi đứa sinh ra được gán phe + `SetBehavior(HuntTarget, mục tiêu)` + cắm cờ phe
(`DemoTeamFlag.Attach` — dùng chung với tool dựng scene nên cờ không lệch nhau).
HUD đếm đợt nằm trong `StickmanDemoHud`.

- Hướng đánh giá khoảng cách theo trục X (arena ngang) — đủ cho stickman 2D side-view.
- Hysteresis 20% giữa Seek↔Combat để không nhấp nháy ở mép tầm đánh.
- Đòn "do dự" `attackHesitation × random(0.5–1.5)` giữa 2 đòn cho đỡ như máy.

## 4. Ba lối đánh (Strategy)

| Strategy | Dải khoảng cách (AIProfile) | Ngắm | Ghi chú |
|---|---|---|---|
| Melee | `0 → meleeRange (0.85)` | tâm người | áp sát rồi vung, charge luôn = 1 |
| Ranged | `rangedMin (2.2) → rangedMax (6)` | tâm + bù rơi `ballisticLiftPerUnit × dist` **chỉ khi vũ khí UseCharge** (cung có trọng lực, súng bắn thẳng) | bị áp sát là lùi (kite) |
| Throwable | `throwMin (1.6) → throwMax (4.5)` | bù rơi ×1.6 (ném vòng cung) | charge theo khoảng cách |

### ĐỨNG CÁCH BAO XA = TÙY VŨ KHÍ CỦA CẢ HAI (`MeleeCombatStrategy.AdvantageRange`)

Không phải cứ áp sát là tốt. Cận chiến tính tầm ƯU THẾ theo vũ khí **của mình so với
của đối thủ** (đọc `WeaponBase.EffectiveRange` / `MinEffectiveRange` của cả hai bên):

| Tình huống | Đứng ở đâu | Vì sao |
|---|---|---|
| Vũ khí mình **dài hơn** (giáo/thương gặp kiếm) | rìa tầm mình (`myReach × 0.95`) | đâm tới nó mà nó với không tới mình |
| Vũ khí mình **ngắn hơn** (kiếm gặp giáo) | chui vào trong **tầm hụt** của nó (`theirMin × 0.85`) | giáo đâm hụt khi bị ôm sát |
| Đối thủ cầm **cung/súng** | áp sát luôn | đứng xa cung thủ = đứng cho nó bắn |

Giữa dải có vùng chết `rangeTolerance × 0.5` — trong vùng đó thì đứng yên, khỏi tiến-lùi giật cục.

**Thân người KHÔNG chắn đường ai.** `TeamMember._passThroughEnemies` (mặc định bật) cho
lính đi xuyên qua cả đồng đội lẫn địch — giữ khoảng cách là việc của AI, không phải của
va chạm. Để thân người chặn nhau là sinh ra cảnh hai thằng dính cứng ai cũng kẹt.

Nhờ vậy có thêm nước **lách qua người** (`CombatStrategyBase.BackOffOrSlipPast`): gần quá thì
lùi, lùi không được (sau lưng là vực / bị dồn) thì đi xuyên sang phía bên kia — như đấu sĩ
đảo bộ, thay vì đứng chịu trận.

`AIProfile.bodyPushRadius` (0.42, bằng bề ngang thân) chỉ là lực đẩy MỀM để sprite không chồng
khít lên nhau — **phải nhỏ hơn tầm chém nhiều**, để to như `separationRadius` (0.7, dành cho
đồng đội) là hai phe dạt ra không bao giờ vào nổi tầm đánh.

**Bị bắn thì phải quay ra xử thằng bắn** (`OnOwnerDamaged`): chỉ được phớ lờ nếu đang
giáp lá cà sát nách với đứa khác (trong `reach × 1.3`). Đứng không mà để cung thủ nã từng
phát là lỗi logic, không phải "AI bình tĩnh".

### Tiến / lùi / nhích — cho đỡ giống máy

NPC không đứng chôn chân bắn nhau. `CombatStrategyBase.UpdatePosition` chia 3 vùng quanh
**khoảng cách ưa thích** = `lerp(MinRange, MaxRange, preferredRangePercent)`:

```
   xa hơn (ưa thích + tolerance)  →  TIẾN vào
   trong vùng chết ±tolerance     →  đứng + thỉnh thoảng NHÍCH qua lại (strafe, có biên độ)
   gần hơn (ưa thích − tolerance) →  LÙI ra (chậm hơn tiến: backpedalSpeedScale)
```

- **Đánh rồi rút**: ra đòn xong thì lùi `meleeBackoffTime` giây rồi mới áp vào lại
  (cận chiến lùi nguyên nhịp, ranged lùi nửa nhịp) — hook `OnAttacked()`.
- **Vùng chết** (`rangeTolerance`) tránh cảnh tiến-lùi giật cục ở mép tầm đánh.
- **Strafe có biên độ** (`strafeDistance`): nhích quá biên là tự quay đầu, không trôi khỏi vị trí.
- Melee riêng: sát quá (< 55% tầm vung) thì nhích ra cho vừa tay vung, xa quá (> 90%) thì áp vào.

Charge vũ khí tích lực: `lerp(minAttackCharge → 1, theo dist/MaxRange)` — xa kéo căng, gần buông nhẹ.

## 5. Dùng thế nào

**Nhanh nhất:** `Tools > Stickman > Create Demo Scenes (All)` → bấm Play →
F3 = `Demo_3_AIBattle` (3v3 tự đánh), F4 = `Demo_4_Guard` (vệ sĩ bảo vệ VIP).

**Tool (khuyến nghị):**
1. `Tools > Stickman > AI > 1. Create NPC Prefab + Default AI Profile`
   → `StickmanNPC.prefab` (variant của StickmanFighter) + `Assets/Settings/AIProfile_Default.asset`
2. `2. Create AI Demo Scenes` → dựng `Demo_3_AIBattle` (2 phe 3v3, cờ xanh vs đỏ) và
   `Demo_4_Guard` (**vệ sĩ bảo vệ VIP trước sát thủ** — Guard vs Hunt).
3. Nhân vật có sẵn trong scene: chọn nó → `Add AI to Selected Fighter`.

**Inspector từng NPC:**
- `TeamMember._teamId` — phe
- `StickmanAgent._behavior` — FreeRoam / HuntTarget / GuardTarget
- `StickmanAgent._objective` — kẻ cần giết (Hunt) hoặc người cần bảo vệ (Guard)
- `StickmanWeaponHolder._startIndex` — cầm vũ khí nào lúc spawn (0=Bow 1=Sword 2=Spear 3=Gun 4=Javelin 5=Hammer 6=Bomb)
- Tuning cả loại NPC → sửa asset `AIProfile` (hoặc tạo profile mới cho archer nhát gan/berserker...)

**Từ code (script màn chơi / wave spawner):**
```csharp
agent.SetBehavior(AIBehavior.HuntTarget, playerTransform);   // cả bầy xông vào player
agent.SetBehavior(AIBehavior.GuardTarget, towerTransform);   // quay về giữ trụ
```

## 5.1 Chỉ huy cả phe — `TeamCommander`

1 component / phe, phát 1 lệnh cho TẤT CẢ agent cùng `teamId`:

| Lệnh | Làm gì | Cài đặt thực tế |
|---|---|---|
| **Tấn công** | hành quân sang căn cứ địch, gặp ai đánh nấy | `SetBehavior(HuntTarget, enemyBase)` |
| **Rút về phòng thủ** | quay về giữ căn cứ nhà, chỉ đánh đứa bén mảng tới (có leash) | `SetBehavior(GuardTarget, homeBase)` |
| Tự do | tuần tra quanh chỗ đứng | `SetBehavior(FreeRoam)` |

Lệnh tấn công dùng được vì `AIStateSeek` biết **hành quân tới 1 ĐIỂM**: khi behavior là
`HuntTarget` mà `Objective` không phải nhân vật, agent đi về hướng điểm đó và vẫn quét
tìm địch dọc đường.

Scene `Demo_3_AIBattle` có sẵn 2 commander + bảng nút dưới đáy màn hình (`TeamCommandHud`),
mỗi phe 10 lính (4 cận chiến, 3 bắn, 3 ném) và 1 cột căn cứ ở mỗi đầu bản đồ.

Gọi từ code:

```csharp
commander.CommandAttack();    // cả phe xông lên
commander.CommandDefend();    // cả phe rút về giữ nhà
```

## 5.2 Không bắn nhầm đồng đội

`TeamMember.CanDamage(source, victim, friendlyFire)` là cửa duy nhất, được gọi ở cả 3 đường damage:

| Đường | Hành vi khi trúng đồng đội |
|---|---|
| `ProjectileController` (tên/đạn/lao/búa) | bay XUYÊN QUA, không trúng, không mất đạn |
| `WeaponBase.ApplyHit` + `MeleeWeapon` | lưỡi đi xuyên qua, vẫn chém trúng địch đứng phía sau |
| `Explosion` (bom) | không trừ máu đồng đội (vẫn có lực đẩy) |

Muốn bật lại friendly fire: `_friendlyFire` trên vũ khí / prefab đạn.
Nguồn damage không có `TeamMember` (bẫy, môi trường) thì luôn gây damage bình thường.

## 5.3 Animation di chuyển — chạy tới / đi bộ / giật lùi

`StickmanLegWalker` có 3 kiểu bước (`Gait`), tự chọn theo tốc độ + hướng đi so với hướng nhìn:

| Kiểu | Khi nào | Đặc điểm |
|---|---|---|
| Đi bộ | tốc độ < `runThreshold` × `MaxSpeed` | sải ngắn, nhấc thấp, thân hơi chúi |
| **Chạy lao tới** | tốc độ cao + đi ĐÚNG hướng nhìn | sải dài 0.95, nhấc cao 0.45, thân chúi 14° |
| **Đi giật lùi** | đi NGƯỢC hướng nhìn (kite, đánh rồi rút) | sải ngắn 0.32, lệt bệt, thân ngửa -9° |

`MaxSpeed` là trần tốc độ của CHẾ ĐỘ ĐANG DÙNG (đi bộ hay chạy), nên chạy vẫn ra kiểu bước
"chạy lao tới" nhưng nhịp chân nhanh hơn hẳn — `_phase` cộng theo tốc độ THẬT.
Chuyển kiểu có blend (`gaitBlendSpeed`) nên không giật. Ngả thân xoay `body_1`,
không đụng tới tay/đầu (do `StickmanProceduralAnimator` giữ) nên vừa chạy vừa ngắm bắn được.

## 5.33 Thể lực (stamina) — bình thường ĐI BỘ, chạy thì tốn sức

Bình thường nhân vật **đi bộ** (`_walkSpeed`). Muốn nhanh thì **chạy** (`_runSpeed`) — và chạy
thì hao thể lực; cạn sức là **cấm chạy** cho tới khi nghỉ đủ. Toàn bộ nằm trong
`StickmanLocomotion`, player và NPC dùng chung một cơ chế.

| Trạng thái | Tốc độ | Thể lực |
|---|---|---|
| Đứng yên | 0 | hồi `_idleRegenPerSecond` (nhanh nhất — 22/giây) |
| Đi bộ | `_walkSpeed` (2.2) | hồi `_walkRegenPerSecond` (10/giây) |
| Chạy | `_runSpeed` (3.9) | **hao** `_runCostPerSecond` (25/giây → chạy liền 4 giây là cạn) |
| Kiệt sức | về đi bộ, xin chạy cũng không được | phải hồi tới `_recoverPercent` × max (30%) mới chạy lại được |

Hai chi tiết chống giật cục — đừng bỏ:
- `_regenDelay` (0.7s): vừa thôi chạy thì chưa hồi ngay, nếu không người chơi nhấp nhả
  phím Shift là chạy được vô hạn.
- `_recoverPercent` (30%): không có ngưỡng này thì cạn sức xong hồi được 1 giọt lại chạy
  đúng 1 frame rồi cạn — nhân vật giật như đèn nháy.

Cách gọi (giống `Move`, phải gọi MỖI FRAME — `Stop()` tự tắt cờ chạy):

```csharp
locomotion.Move(direction, run: true);   // đi + xin chạy
locomotion.SetRun(false);                // về đi bộ
bool thatSuChay = locomotion.IsRunning;  // xin chạy + đang đi + còn sức
locomotion.StaminaPercent;               // 0..1 cho thanh UI (event StaminaChanged)
locomotion.RefillStamina();              // hồi sinh / sang màn
```

- **Người chơi**: giữ `Shift` (đổi được ở `StickmanFighterController._runKey`).
  *Camera demo lia bằng `Alt` + A/D — Shift đã dành cho chạy.*
- **NPC**: quyết định gom hết trong `StickmanAgent.UpdateRun()`, chạy SAU khi state đã chọn
  hướng đi. Cố ý gom một chỗ: để mỗi state tự bật cờ chạy thì chỉ cần một state quên tắt là
  NPC chạy tới kiệt sức rồi đứng thở giữa trận. NPC chỉ chạy 3 lúc:

| Lúc | Điều kiện trong `AIProfile` |
|---|---|
| Đuổi / hành quân còn xa | `runChaseDistance` (4) — tới gần thì về đi bộ cho dễ xoay xở |
| Xông liều phá bế tắc | `runWhenCharging` |
| Rút lui | `runWhenRetreating` — chạy bằng mọi giá, kể cả sắp kiệt |

`runStaminaReserve` (25%): còn dưới ngần đó sức thì NPC thôi chạy, để dành cho lúc chạy trốn.
Đang giao chiến (`AIStateCombat`) thì KHÔNG bao giờ chạy — chạy vào tầm chém là lao quá đà.

Muốn một nhân vật chạy thoải mái (hình nộm, boss): tắt `_useStamina` trên `StickmanLocomotion`,
hoặc tắt `canRun` trong `AIProfile` để NPC chỉ đi bộ.

Xem tại chỗ: `Demo_5_Testbed` tab *Animation* có nút **Chạy (tốn sức)** + thanh thể lực;
tab *AI* hiện `sức %` của từng NPC. Scene demo thường thì HUD hiện thanh thể lực của người chơi.

## 5.35 Chiến thuật 3 tuyến — `UnitRole` + `UnitLoadout`

Mỗi phe không còn là 10 con giống nhau mà là **đội hình 3 tuyến**, mô tả bằng asset
`UnitLoadout` (Create > Stickman > Unit Loadout) — thêm loại lính mới không cần sửa code:

| Vai trò | Vũ khí | Máu | Trang bị | Cách đứng |
|---|---|---|---|---|
| **Shield** (khiên) | kiếm | 2 | khiên (đỡ 2 đòn) + nón | **Tuyến đầu**: tiến tới tầm chém rồi CẮM CHỐT, không lùi, không rút lui — lấy thân che đồng đội |
| **Melee** (cận chiến) | giáo | **3** | nón + giáp | Tuyến giữa: xông lên đánh, đánh rồi rút lấy nhịp |
| **Ranged** (tầm xa) | cung | **1** | không | Tuyến sau: **không bao giờ vượt lên trước** tuyến khiên/cận chiến |

Cơ chế giữ đội hình (`StickmanAgent.TryGetFormationLimitX`): lính tầm xa tìm đồng đội
tuyến trước đang ở xa nhất về phía địch, rồi tự giới hạn không tiến quá
`formationSpacing` phía sau người đó. Hết sạch tuyến trước thì tự lo thân (hết giới hạn).

Áp dụng ở cả `CombatStrategyBase.AdvanceTowardsEnemy` (lúc đánh) lẫn `AIStateSeek.MarchToObjective`
(lúc hành quân theo lệnh tấn công) — nên đội hình giữ được cả khi di chuyển.

Khiên chặn đạn thật sự vì nó đứng trước: mũi tên bay tới va vào collider của khiên/người khiên
trước khi tới được lính tầm xa phía sau.

## 5.37 Cảm giác chiến trường thật — 5 cơ chế

Không còn cảnh 10 con dồn cục vào 1 chỗ đánh chung 1 mục tiêu:

| Cơ chế | Ở đâu | Làm gì |
|---|---|---|
| **Giãn cách** | `StickmanAgent.ApplySeparation()` | đồng đội gần hơn `separationRadius` thì đẩy nhau ra (kiểu separation của boids). CỘNG vào hướng đi state vừa quyết chứ không ghi đè → vẫn đánh bình thường, chỉ là tự tản thành hàng. Trùng khít thì đẩy ngẫu nhiên 1 bên cho hết kẹt |
| **Chia mục tiêu** | `SelectBestEnemy()` | điểm = khoảng cách + (số đồng đội đã nhắm nó × `targetSpreadPenalty`) − thưởng-cứu-đồng-đội. Quá `maxAttackersPerTarget` người vây thì nhường, đi tìm đứa khác |
| **Ứng cứu đồng đội** | `IsAttackingMyAlly()` | ai đang đánh đồng đội trong `assistRadius` thì được ưu tiên `assistBonus` — cả nhóm tự quay sang gỡ vây |
| **Che chắn** | `MeleeCombatStrategy.UpdateShieldPosition()` | lính khiên tìm người cần che (`FindAllyToCover`, ưu tiên lính tầm xa / ai đang bị vây) rồi chen vào giữa người đó và địch, cách `coverDistance` |
| **Sĩ khí → rút có tổ chức** | `StickmanAgent.Morale` + `AIStateRetreat` | đồng đội chết/trúng đòn làm giảm thanh sĩ khí; dưới ~8% thì rút về sau đồng đội còn vững hoặc căn cứ, hồi đủ rồi trở lại nhiệm vụ cũ. `IsShaken` vẫn chỉ là nhịp khựng ngắn để trận không lao thẳng một mạch |

Ba thứ này cộng lại tạo ra nhịp trận đánh tự nhiên: xông lên → có người ngã → cả tuyến
chùn lại giãn ra → ai vỡ thì rút sau tuyến/căn cứ → hồi sĩ khí → nhập lại rồi tràn lên lần nữa.
Không hề có script "wave" nào cả, tất cả là hành vi cá nhân cộng hưởng.

### 5.37a Sĩ khí thật — rút về nhà chứ không biến mất khỏi trận

`AIProfile.moraleRadius = 0` tắt trọn hệ (zombie/quái vô cảm). Khi bật, `moraleBase` là sức
chịu đựng của Levy; `UnitLoadout.rank` và `CommandNode.rank` tăng tier, lấy tier cao nhất để
Regular/Elite và sĩ quan chịu được nhiều thương vong hơn. Mỗi đồng đội chết trong bán kính đều
trừ `moraleLossPerAllyDeath` — **không debounce**; debounce chỉ dành cho animation khựng
`shakenDuration`, không được dùng để bỏ qua một hàng quân bị quét sạch.

Khi dưới `moraleRoutThreshold`, `AIStateRetreat` tìm một đồng đội cùng phe, còn vững và nằm về
phía căn cứ, rồi đứng lùi thêm `moraleRallyBehindOffset`. Không có người che thì dùng `HomeX` của
`CommandNode`; scene không có chỉ huy dùng điểm spawn. Tại hậu phương/căn cứ thanh hồi nhanh;
chỉ đạt `moraleReturnThreshold` mới trở về behavior cũ. Vì vậy AI không bỏ map, không đổi sang
`FreeRoam`, và không chạy-ra/vào liên tục. `CommandNode.SectorReport` nhân `CombatReadiness`, nên
chỉ huy nhìn thấy một đội đang hoảng là yếu thật và chọn giữ tuyến/phòng thủ thay vì tổng tiến công.

**Ai đánh mình**: `StickmanAgent.LastAttacker` + `IsUnderAttack` (3 giây) — ghi từ event
`Damaged`, dùng cho cả aggro lẫn cho đồng đội biết mà tới cứu.

## 5.38 Vượt địa hình — nhảy qua khe, leo thang lên tầng có địch

`StickmanAgent.UpdateTraversal()` chạy **sau FSM, trước giãn cách** — cùng kiểu chồng lớp
với né đạn: state chỉ biết "đi về phía X", còn chuyện đường đi bị **khe hở** hay **bậc cao**
chặn thì xử ở đây.

**Cố ý KHÔNG pathfinding.** Stickman đánh nhau theo trục ngang nên chỉ cần hai câu hỏi:

| Tình huống | Xử lý |
|---|---|
| Đang muốn đi về hướng có VỰC (`IsLedgeAhead`) và địch ở bên kia | `Jump()` — nhảy qua, nghỉ `jumpCooldown` giây |
| Địch cao/thấp hơn quá `climbHeightThreshold` và quanh đây có thang | đi tới chân thang → `EnterClimb` → leo tới ngang tầng địch → buông |

Chốt chặn để NPC không tự sát: chỉ nhảy khi **địch thật sự ở bên kia khe** (không thì đứng
mép vực bấm nhảy là rơi xuống hố), và chỉ chọn thang **với tới được tầng cần đến**
(đi lên thì đỉnh thang phải cao hơn mình). Sát mặt địch rồi (`jumpMinDistance`) thì đánh,
không nhảy.

Tuning: `AIProfile` mục *Vượt địa hình* — `canJumpGaps`, `jumpCooldown`, `jumpMinDistance`,
`canClimb`, `climbHeightThreshold`, `climbSearchRadius`. Tắt cả hai cờ = hành vi cũ
(chỉ đi trên mặt phẳng).

Động tác nhảy/leo do `StickmanBodyAnimator` tự lo — xem `Docs/KnowledgeBase/Animation.md`.

## 5.4 Né đạn — AI không cắm đầu đi thẳng

`StickmanAgent.UpdateDodge()` chạy **sau** FSM mỗi frame, giành tay lái đúng khoảnh khắc
có đạn bay tới (state vẫn lo đánh đấm bình thường):

1. `ProjectileController.Active` — sổ đăng ký đạn đang bay (không `FindObjectsOfType`)
2. Với mỗi viên của ĐỊCH: tính thời điểm bay gần mình nhất `t = dot(toSelf, v) / |v|²`
   và khoảng cách gần nhất tại thời điểm đó
3. Nếu `0 < t < dodgeReactionTime` và khoảng cách < `dodgeMissMargin` → sắp trúng
4. Lắc xúc xắc `dodgeChance` (0.6 = né 6/10 lần, đừng để 1 kẻo bất khả xâm phạm)
5. Né NGANG khỏi trục đạn trong `dodgeDuration` giây, rồi nghỉ `dodgeCooldown`

Né ngang có tác dụng vì đạn được ngắm vào chỗ đứng CŨ và mất thời gian bay tới —
bước sang bên đúng lúc là nó bay trượt.

## 5.45 Đỡ đòn (thế thủ) & combo — AI đấu kiếm có nhịp

Hai cơ chế nằm chung trong `CombatStrategyBase.Tick` (mọi strategy hưởng, nhưng thực tế
chỉ vũ khí cận chiến kích hoạt):

**Đỡ đòn** — `UpdateBlock()`, chạy TRƯỚC bước quyết định đánh:

1. Chỉ khi vũ khí đang cầm THỦ được (`MeleeWeapon._canGuard` → `Fighter.CanGuard`)
2. Thấy MỤC TIÊU đang VUNG vũ khí cận chiến (`ProceduralAnimator.IsAttacking`) trong
   tầm với của nó (×1.3 vì lúc vung tay duỗi xa hơn) → lắc xúc xắc `blockChance`
3. Trúng thì `Fighter.SetGuard(true)` trong `blockDuration` giây (nhân random 0.8–1.2)
   rồi hạ xuống đánh trả; trượt hay trúng đều vào `blockCooldown` — không thì NPC
   thành rùa rụt cổ chỉ thủ không đánh
4. Đang giơ thế thủ = nhịp đó KHÔNG ra đòn; đang xông liều (`IsCharging`) thì không thủ
5. Tên/đạn bay tới thì NÉ (mục 5.4), không đỡ — đỡ là chuyện của khiên
6. Thoát state Combat/Guard là hạ thế thủ (`AIStateCombat.Exit`) — strategy chỉ hạ được
   khi còn được Tick

**Combo** — sau mỗi đòn mở màn thành công, lắc xúc xắc `comboChance`:

- Trúng → mở CHUỖI: `min(comboMaxHits, số nhát của vũ khí)` nhát, các nhát sau tung
  NGAY khi cooldown vũ khí xong — bỏ `attackHesitation`, bỏ backoff "đánh rồi rút",
  nên chuỗi đi tuần tự tới **nhát kết** của `MeleeWeapon._combo` (nhát mạnh nhất)
- Hết chuỗi mới lùi ra lấy nhịp như cũ → trận đấu có nhịp: vờn — ập vào tung chuỗi — rút
- Địch văng khỏi tầm (knockback) hay mình chuyển sang thủ là bỏ chuỗi dở

Số tuning đều trong `AIProfile`: `blockEnabled/blockChance/blockDuration/blockCooldown`
và `comboChance/comboMaxHits`.

## 5.47 Tử chiến — bị dồn tới mép vực

`StickmanLocomotion` đã cấm đi xuống vực, nhưng cấm ĐI thôi thì chưa đủ: cái phải sửa là
**Ý ĐỊNH** của AI. Máu thấp → `StickmanAgent.Update` đẩy vào `Retreat` → chạy tới mép vực →
`AIStateRetreat` thấy vực nên quay lại đánh → tiến lên vài bước → **hết `IsCornered`** →
máu vẫn thấp nên lại xin chạy → quay đầu về phía vực... Mỗi vòng đổi ý là `SetAimDirection`
lật thân một lần, nên nhân vật đứng **xoay vòng vòng** ngay bên mép vực.

Chữa bằng một **cờ bền**, không phải trạng thái tức thời:

| Thứ | Nghĩa | Dùng để |
|---|---|---|
| `IsCornered` | HÌNH HỌC: đang đứng sát mép, lùi là rơi | dò tức thời mỗi frame |
| `IsMakingLastStand` | QUYẾT ĐỊNH: đã chọn đánh tới cùng, thôi chạy | dính lại qua nhiều frame |
| `FightsToTheDeath` | `IsCornered \|\| IsMakingLastStand` | **cái mà strategy đọc** |

- Vào tử chiến: chạm mép lúc đang chạy, hoặc máu thấp mà đã bị dồn vào chân tường.
- Trong lúc tử chiến: không vào `Retreat` nữa (kể cả `ForceRetreat` từ chỉ huy — lệnh rút mà
  sau lưng là vực thì rút = chết), không lùi (`TryBackpedal` đứng lại), đánh ở mọi khoảng cách.
- Thoát: đẩy lui được địch (không còn ai trong `disengageRange`) và đã qua `lastStandMinDuration`
  — có ngưỡng thời gian này thì địch nhích ra một bước không làm nhân vật đổi ý ngay.
- Soi bằng **F9**: state có hậu tố **†** là đang tử chiến.

## 5.475 Kẻ HUNG THẦN — xúm vào giết kẻ đang cày mạng (`ThreatBoard`)

Bảng chấm mục tiêu chấm ứng viên bằng thứ nó **đang là** (gần/xa, máu, vũ khí, có phải chủ
tướng không) và không có ô nào hỏi nó **vừa làm gì**. Nên một ông chủ soái chém đổ cả hàng vẫn
được chấm y hệt anh dân binh đứng cạnh: luật chia mục tiêu rải người đều ra, và cả tuyến lần
lượt đi vào lưỡi kiếm đó — **không lỗi nào báo**.

`ThreatBoard` (tầng AI, sổ tĩnh) nghe `TeamMember.AnyDied`, mỗi mạng cộng 1 điểm cho kẻ giết,
phân rã **half-life 8 giây**, trần 4. `RampageWeight` trả phần vượt ngưỡng 1 mạng.

| Mảnh | Việc |
|---|---|
| `AIProfile.rampageTargetBonus` (7) | ưu tiên thêm trong `ScoreModeBonuses` = `bonus × weight` |
| `AIProfile.rampageExtraAttackers` (3) | nới trần vây đánh: 3 → tối đa 6 người |
| `StickmanAgent.MaxAttackersOn` | **nút thắt duy nhất** trả lời "mấy người được đánh nó" |
| `StickmanAgent.NoticeRampage` | rút ngắn nhịp chấm điểm lại xuống 0.2 s khi có tin dữ |

**Bốn chỗ dễ sai:**

1. **Chỉ cộng điểm là chưa đủ** — `maxAttackersPerTarget` (3) vẫn đuổi người thứ tư đi tìm
   mục tiêu khác, và "tập trung tiêu diệt" dừng ở đúng ba người.
2. **Trần phải hỏi ở một hàm** — `SelectBestEnemy` hỏi *"có được NHẮM nó không"*,
   `ShouldWaitTurn` hỏi *"có được ĐÁNH nó không"*. Nới một chỗ mà quên chỗ kia thì người thứ
   tư chạy tới nơi rồi **đứng vòng ngoài không vung nhát nào**.
3. **Nhịp hỏi** — bảng điểm chỉ chạy mỗi `retargetInterval` (1.5 s), mà hung thần hạ người
   nhanh hơn thế. Rút ngắn nhịp, **đừng tự gán `Target`**: gán thẳng là đẻ ra đường chọn mục
   tiêu thứ hai không đi qua nón tầm nhìn, luật cùng tầng, ẩn thân.
4. **Số phải đo** — bộ đầu (half-life 7 + bonus 5) chỉ kéo nổi 1 người sau 3 mạng, tức cơ chế
   gần như vô hình. Bộ hiện tại cho bậc thang: 2 mạng chưa kéo ai · 3 mạng kéo 2 · 4 mạng kéo
   3 · 5 mạng kéo 4.

Bonus tối đa (21) **cố ý nhỏ hơn** khoản phạt khác tầng (60) và người-trước-nhà (200): hung
thần đứng trên mặt tường thì cận chiến vẫn không bỏ tuyến leo lên.

Soi bằng **F9**: hung thần mang hậu tố **⚡HUNG THẦN &lt;streak&gt;**, lính đang nhắm nó hiện
**⚡** sau tên mục tiêu. Bài test: AI Lab bài 27 (hai trận, một bên tắt bonus làm đối chứng).

## 5.48 PHÁ VÒNG LẶP — "quay qua quay lại, tiến không được lùi không được"

Mọi vòng lặp trong hệ AI này đều cùng một hình dạng: **hai luật đúng đắn kéo ngược nhau**,
mỗi luật lại đọc đúng cái mà luật kia vừa đổi. Không có cái nào sai, nhưng ghép lại thì
nhân vật đứng rung tại chỗ.

### Bốn cặp đã tìm ra (đã sửa từng cặp)

| Cặp giằng nhau | Biểu hiện | Cách chữa |
|---|---|---|
| giữ tầm ↔ **mốc đội hình** | lính tầm xa TIẾN/LÙI đổi nhau **mỗi frame** ở đúng mốc: lùi xong thì chưa tới mốc → tiến, tiến xong thì quá mốc → lùi | `AIProfile.formationDeadband` — chia 3 vùng: chưa tới mốc *tiến* · quanh mốc **đứng** · vượt hẳn mới *lùi* |
| **chia mục tiêu** ↔ khoảng cách | hai địch xấp xỉ nhau ở hai bên → mỗi nhịp quét đổi mục tiêu → lật thân qua lại, ngắm dở lại thôi | `AIProfile.targetSwitchMargin` — kẻ ĐANG nhắm được cộng sẵn điểm ưu ái, đứa khác phải hơn HẲN mới đổi |
| **tử chiến** ↔ lách qua người | `TryBackpedal` trả false vì *không thèm lùi*, `BackOffOrSlipPast` hiểu nhầm thành *không lùi được* → đi xuyên qua địch, sang bên kia lại quá gần → xuyên ngược về | tách hai lý do (`CanSlipPast`), tử chiến thì **đứng mà đánh**; lách cũng có nhịp nghỉ |
| **rút lui** ↔ máu thấp | hết `retreatMaxDuration` → về đánh → frame sau máu vẫn thấp, địch vẫn trong tầm nhìn → lại xin chạy | `AIProfile.retreatCooldown` — chạy xong phải ĐÁNH ít nhất ngần này giây mới được xin chạy tiếp |

Xem thêm [5.47](#547-tử-chiến--bị-dồn-tới-mép-vực): cặp thứ năm (`IsCornered` ↔ máu thấp).

### Van an toàn: bộ dò kẹt KHÔNG CẦN BIẾT LÝ DO

Sửa từng cặp thì luôn còn cặp chưa nghĩ ra. Nên có thêm một lớp cuối, chạy ở
`StickmanAgent.UpdateDeadlockBreaker()`, chỉ nhìn **kết quả** chứ không nhìn nguyên nhân.

Cứ `deadlockWindow` (2.5s) chấm một lần, đọc `StickmanLocomotion.Steer` — tức **Ý ĐỊNH ĐI**
của AI, không phải vận tốc thật (cái đang tìm chính là "muốn đi mà không đi được"):

```
ĐÒI ĐI ≥ nửa cửa sổ  VÀ  dời chỗ < deadlockMinTravel   → kẹt
              HOẶC  đổi hướng ≥ deadlockFlipCount lần   → đang "quay qua quay lại"
```

Bắt được thì gỡ theo **ba nấc**:

1. **Có khe / bục địa hình ngay hướng đang đòi đi + chỗ đáp an toàn** →
   `TryJumpPastDeadlock()` thử **NHẢY QUA**. Dùng đúng `canJumpGaps` · `jumpGapReach` ·
   `jumpCooldown` và `JumpSlotFree()` của cú nhảy qua khe thường; không nhảy giữa cầu thang,
   giữa trời, qua biển hay qua vực không có đất. Không gọi cho ca chỉ đổi hướng qua lại — đó là
   giằng co quyết định, không phải vật cản.
2. **Còn mục tiêu + còn quyền xông** → `XÔNG LIỀU` (`IsCharging`, cơ chế có sẵn: bỏ giữ tầm,
   bỏ đội hình, bỏ tinh thần, lao vào đánh).
3. **Không** → `CHỐT HƯỚNG` (`IsBreakingDeadlock`): chọn một hướng rồi đi thẳng
   `deadlockCommitTime` giây, **ghi đè hướng đi của state** và **tắt luôn giãn cách**.
   Phải thô như vậy: giãn cách chính là một trong những lực đang giữ chân nó, vừa chốt
   vừa bị đẩy ngược thì gỡ làm sao được. Dời chỗ thật một đoạn là ra khỏi vùng hai luật
   giằng nhau, tự khắc hết kẹt.

Chi tiết cần nhớ khi sửa chỗ này:

- **Đo `Steer` chứ không đo `Velocity`/`TravelSpeed`.** Đứng yên vì không có gì để làm
  (lính gác giữ tuyến) thì `Steer = 0` → không tính là kẹt, đúng như mong muốn.
- **Ra được đòn là xoá sổ theo dõi** (`NotifyAttacked` → `ResetDeadlockWatch`). Đứng đúng tầm
  chém mà chém liên tục thì đúng là không dời chỗ, nhưng đó là đang đánh nhau chứ không kẹt.
- **Huỷ chốt hướng khi ĐÁNH ĐƯỢC, không phải khi VÀO TẦM.** Lấy tầm vũ khí làm mốc thì cung thủ
  (tầm ~6) huỷ ngay ở frame đầu → hoá ra bộ gỡ kẹt không bao giờ chạy cho tầm xa, mà kẹt ở
  mốc đội hình lại chính là ca hay gặp nhất của cung thủ.
- **Chốt xong phải xoá số liệu cũ.** Không thì lúc hết giờ chốt nó đem số liệu của cửa sổ
  trước ra chấm và báo kẹt ngay lập tức.
- **Chốt mà vẫn không nhúc nhích thì lần sau đổi hướng** (`_lastCommitFailed`) — húc vào tường
  hay bị cả đám chèn thì chốt lại đúng hướng cũ chẳng giải quyết gì.
- **Nhảy chỉ là thử đúng một lần khi thấy khe/bục thật.** `UpdateJumpOverGap` vẫn là đường
  bình thường, còn `TryJumpPastDeadlock` chỉ là lưới cuối sau cả cửa sổ `deadlockWindow`; dùng
  chung cooldown và sổ nhảy theo phe để một nhóm không biến thành cào cào khi cùng kẹt.

### Soi bằng F9

Hậu tố sau tên state (`StickmanAgent.StateName`):

| Dấu | Nghĩa |
|---|---|
| `»` | đang **gỡ kẹt** — vừa bị bắt là quay qua quay lại / đi mãi không tới đâu |
| `!` | đang **xông liều** — bế tắc quá lâu, bỏ giữ tầm/đội hình mà lao vào |
| `†` | đang **tử chiến** — bị dồn tới vực, bỏ hẳn ý định rút lui |

Thấy `»` nhấp nháy liên tục ở nhiều lính = **có cặp luật mới đang giằng nhau**, xem lại luật
vừa thêm gần đây chứ đừng chỉ nới số trong `AIProfile`.

## 5.5 Trang bị đỡ đòn — khiên & nón

`EquipmentDefinition.blocksHits` + `hitsBlocked`:

| Món | Slot | Đỡ | Trúng thì |
|---|---|---|---|
| Khiên | `Shield` (gắn handL) | 2 đòn | khiên văng xuống đất, người sống |
| Nón | `Head` (gắn boneHead) | 1 đòn | nón rơi ra, người sống |

Cách hoạt động: món đỡ đòn được gắn thêm **collider trigger + `EquipmentHitbox`**.
`StickmanController.TakeDamage` hỏi `StickmanEquipment.TryAbsorb(info)` TRƯỚC khi trừ máu —
`DamageInfo.hitCollider` cho biết đòn trúng đúng món nào. Không có collider (vụ nổ) thì
dò theo điểm trúng có nằm trong hình món đồ không.

Hết lượt đỡ → `DropSlot()` → món đồ thành `DroppedItem` văng theo hướng đòn đánh.

## 5.6 Nhặt đồ — bấm nút / lắc xúc xắc

Đi ngang KHÔNG còn tự nhặt:

- **Người chơi**: `StickmanPickupPrompt` hiện nút `[E] Nhặt <tên vũ khí>` ngay trên món đồ —
  bấm phím E hoặc bấm chuột vào nút mới nhặt.
- **AI**: `WeaponPickup._aiPickupChance` (0.35) — mỗi NPC chỉ lắc xúc xắc **1 lần** cho mỗi món
  (`_aiRollOncePerCharacter`), trượt rồi thì thôi, khỏi bám theo món đồ.
  NPC đang **tay không** thì luôn nhặt bất kể xác suất.

## 5.7 Cấp độ thông minh — `AISmartsTable`

Trục DỌC của não NPC, song song với cấp vũ khí (`WeaponTierTable` là trục dọc của súng đạn,
bảng này là trục dọc của CÁI ĐẦU). Một con cấp 3 thắng nhiều con cấp 1 **cùng máu cùng vũ khí**
— thắng bằng quyết định, không phải chỉ số buff chìm.

- **Gán cấp**: `StickmanAgent._smartsLevel` (0 = tắt, giữ nguyên profile).
  Đổi lúc chạy: `agent.SetSmartsLevel(n)` — đi qua `SetProfile` nên strategy dựng lại ngay,
  và luôn áp lên profile **GỐC** (không cộng dồn cấp lên cấp).
- **Bảng cấp**: `Assets/Resources/AISmartsTable.asset` (thiếu asset thì dùng số mặc định
  trong code — không bao giờ null, cùng kiểu `AIProfile.GetOrDefault`). Số chuẩn nằm trong
  `AISmartsTable.DefaultLevels()`; tool `Tools > Stickman > AI > 5` ghi lại asset từ code.
- **Cơ chế**: mỗi cấp là MỘT BỘ HỆ SỐ biến đổi `AIProfile` → `Apply()` trả về **bản sao
  runtime** của profile (nhiều NPC dùng chung 1 profile với cấp khác nhau vẫn không đụng nhau).

| | Cấp 1 — Lính mới | Cấp 2 — Chính quy | Cấp 3 — Lão luyện |
|---|---|---|---|
| Tầm nhìn | ×0.75 | ×1 | ×1.25 |
| Phản xạ (quét địch, thấy đạn, hồi thế thủ) | ×0.5 | ×1 | ×2 |
| Do dự giữa 2 đòn | ×3 | ×1 | ×0.3 |
| Đỡ đòn (thế thủ) | KHÔNG biết | theo profile | chance ×1.8 |
| Combo | KHÔNG biết | theo profile | chance ×1.6, +1 nhát |
| Né đạn | KHÔNG biết | theo profile | chance ×1.5 |
| Bù độ rơi của đạn | KHÔNG (bắn xa trượt) | có | có |
| Rút lui khi yếu máu | KHÔNG (đứng chịu chết) | có | có |
| Nhảy khe / leo thang | KHÔNG | có | có |
| Phối hợp (chia mục tiêu, cứu đồng đội, săn tướng) | KHÔNG (bu một đứa) | có | có |

**Cấp 2 là cấp NEO** (mọi hệ số = 1): NPC hiện có để `_smartsLevel = 0` hay 2 đều đánh y như cũ.
Cấp KHÔNG đổi máu/damage — muốn lính cấp cao trâu hơn thì cộng thêm bằng `UnitLoadout`/cấp vũ khí.

Bài test: `Demo_8_AILab` › **"Cấp độ AI"** — tay đôi IQ2 vs IQ1, và 1 con IQ3 chấp 3 con IQ1.

## 5.8 Hành vi mở rộng + tính cách preset

**5 hành vi nền mới** (enum `AIBehavior`, mỗi cái một state trong `AIStates.cs`):

| Hành vi | Làm gì | Field liên quan |
|---|---|---|
| `PatrolRoute` | tuần theo TUYẾN waypoint (ping-pong), tới mốc đứng ngó; đánh xong quay lại mốc gần nhất | `StickmanAgent._patrolWaypoints`, `patrolPauseTime` |
| `Flee` | dân thường: thấy địch là chạy hết tốc, KHÔNG BAO GIỜ đánh (kể cả bị chém); bị dồn thì ngồi ôm đầu | `retreatSafeDistance`, `visionRange` |
| `Ambush` | nằm IM tại Objective/chỗ spawn, địch lọt tầm mới bung; đánh xong về nằm tiếp | `ambushTriggerRange` |
| `FetchObjective` | chạy tới Objective "lấy đồ" rồi mang về `_returnPoint`; không ham đánh, chỉ né | event `FetchPickedUp` / `FetchDelivered` |
| `Follow` | bám theo thủ lĩnh (Objective), chia chỗ bằng GuardSlot; chỉ đánh kẻ dí sát/đánh mình, leash theo thủ lĩnh | `guardFollowDistance`, `guardLeashRange` |
| `Work` | WORKER: tự tìm `ResourceNode` (đốn cây/đào vàng/gặt lúa/múc nước/xây nhà), làm `gatherDuration` giây/chuyến (gỗ-vàng-xây vung dụng cụ, lúa-nước ngồi thụp) rồi mang về `ResourceDepot` phe mình; công trường cộng công tại chỗ tới khi `doneVisual` (ngôi nhà) hiện lên. KHÔNG đánh — thấy địch là bỏ việc CHẠY về kho. **Phản hồi nghe/nhìn**: mỗi nhịp làm `node.PlayWorkBeat()` phát clip nghề (`_workClip` trên node) + effect `Hit` bảng chung + vụn `FloatingMark` màu tài nguyên; kho `Store()` leng keng + effect `Pickup`; xây xong effect `Spawn` + bụi khánh thành. **Trang bị**: archetype `Worker` = nón lá + giỏ mây (slot Back) + rìu, `Loadout_Worker` 2 máu | số nằm trên node (`amount/gatherDuration/maxWorkers/regrowTime` + clip/màu vụn) |

**5 phản xạ/cơ chế mới** (pipeline Update của agent — xem AI-Architecture.md §2):
né VÙNG NỔ (`aoeAvoidEnabled`, mặc định BẬT — lựu đạn rơi gần là chạy khỏi bán kính) ·
ngồi thụp né tên (`coverChance`, mặc định 0) · tay không tự đi nhặt vũ khí
(`weaponSeekRadius`, cấp IQ 1 bị tắt) · khiêu khích kéo aggro (`tauntRadius` → `SuggestTarget`
địch quanh đây) · vây đánh thay phiên (`surroundWaitDistance` + `maxAttackersPerTarget`:
hết suất thì đứng vòng ngoài chờ, đứa trong ngã là trám vào — xếp hạng theo khoảng cách nên
không ai tranh suất). Thêm 1 tiêu chí chọn mục tiêu: `flankRangedBonus` (ưu tiên xử tuyến sau).

**Đổi tính cách theo máu**: component `HealthProfileSwitcher` (cạnh StickmanAgent) — mảng
ngưỡng %máu → AIProfile, một chiều như boss phase, đi qua `SetProfile` nên giữ nguyên cấp IQ.

**Thầy thuốc** (cơ chế pipeline `UpdateSupport`, bật qua profile — preset `AIProfile_ThayThuoc`):
mỗi `healInterval` giây HỒI `healAmount` máu cho đồng đội thương nặng nhất trong `healRadius`
(kể cả bản thân, chấm XANH LÁ `FloatingMark` bay lên); `buffMaxHealth` = CHÚC PHÚC cộng máu
tối đa MỘT LẦN cho mỗi đồng đội gặp lần đầu (kèm hồi đầy, chấm VÀNG). Nền tảng:
`StickmanController.Heal(amount)`. Thầy thuốc thường đi kèm hành vi `Follow` (bám đội, chỉ tự vệ).

**7 tính cách preset** (`Assets/Settings/AIProfiles/`, tool `Tools > Stickman > AI > 6`,
số chuẩn trong `StickmanAIPersonalityBuilder`): Nhát gan · Cuồng chiến · Cẩn trọng ·
Sát thủ (vision cone + flank) · Săn tướng · Rình rập (bắn tỉa, tích lực đầy) · Hộ vệ (taunt +
cứu đồng đội). 9 archetype được gắn sẵn: Shield/Bodyguard→Hộ vệ, Ranged/Commander→Cẩn trọng,
Assassin→Sát thủ, Brawler→Cuồng chiến, Villager→Nhát gan.
Học thuyết mới: `Doctrine_Defensive` (thủ chờ) · `Doctrine_Guerrilla` (đánh-rút).

Bài test: `Demo_8_AILab` bài 11–15 (tuần tra tuyến · né bom & nấp · dân thường & chạy việc ·
tính cách · vây thay phiên).

## 5.9 Kinh nghiệm & trưởng thành — `StickmanExperience` + `ExperienceTable`

Giết địch → XP → LÊN CẤP. Cấp trưởng thành là TRỤC TỔNG HỢP nối 3 trục đã có:

| Mốc (mặc định) | Tổng XP | Mở khoá |
|---|---|---|
| Cấp 2 — Cứng tay | 16 | IQ 2 · +1 máu gốc (hồi đầy) |
| Cấp 3 — Thiện chiến | 40 | vũ khí TINH LUYỆN (tier 2) · +2 máu |
| Cấp 4 — Lão luyện | 80 | IQ 3 · vũ khí tier 3 · +3 máu |
| Cấp 5 — Cao thủ | 140 | vũ khí tier 4 · +5 máu |

- **XP mỗi mạng** = `killXp (8) + máu tối đa nạn nhân × xpPerVictimHealth (2)` — giết đứa trâu
  bổ hơn giết lính 1 máu. Lính 1 máu = 10 XP → 2 mạng lên cấp 2.
- **Ghi công KHÔNG đụng code combat**: `StickmanExperience` nghe event chết toàn cục
  `TeamMember.AnyDied`; ai là `DamageInfo.source` của phát kết liễu thì ăn trọn XP —
  chém / tên / đạn / bom đều tự đúng vì mọi nguồn damage vốn đã ghi source.
- **Áp mốc**: `SetSmartsLevel` (giữ nguyên nếu đang cao hơn) · `weapon.SetTier` cho CẢ KHO
  (chỉ nâng, không hạ — đổi vũ khí giữa trận vẫn hưởng cấp) · `SetMaxHealth(gốc + bonus)`
  hồi đầy máu. Máu GỐC đo một lần lúc Awake — không cộng dồn bonus lên bonus.
- **Bảng**: `Assets/Resources/ExperienceTable.asset` (tool `AI > 7`; số chuẩn trong
  `ExperienceTable.DefaultMilestones()` — code là nguồn sự thật). Thiếu asset thì dùng số
  trong code, không bao giờ null.
- **Nguồn XP ngoài** (nhiệm vụ, hộ tống...): `experience.GainXp(amount)`. UI/effect cắm vào
  event `LeveledUp`. Vạch vàng trên đầu = số cấp đã lên (tự ẩn khi chết, tắt bằng
  `_showLevelPips`).
- `AI > 1` tự gắn `StickmanExperience` vào prefab NPC — mọi trận demo đều có trưởng thành,
  nhịp mặc định chậm nên trận ngắn gần như không đổi.

Bài test: `Demo_8_AILab` › **"Kinh nghiệm & trưởng thành"** — tân binh IQ 1 farm mạng từ
wave vô hạn, lên cấp trước mắt mình (soi Lv/XP trong bảng NPC).

## 5.10 Kỵ binh, chống kỵ, vỡ trận — và BỘ AI THEO MÀN CHƠI

**Kỵ binh** (`CavalryCombatStrategy`, tự chọn khi `agent.IsMounted` + cầm cận chiến):
vòng xung phong 4 nhịp — **lấy đà** (xa hơn `chargeStartRange`) → **đâm xuyên** (vung mà
KHÔNG dừng) → **vượt qua** (`overrunDistance` — phanh gấp sau lưng địch nhìn như xe đụng
tường) → **vòng lại** (`wheelTime`). Đây là Strategy riêng chứ không phải cờ trong
`MeleeCombatStrategy`, vì cả khung của melee là "giữ tầm, đánh xong lùi lấy nhịp" = đứng
yên — ngược hẳn kỵ binh. Kỵ xạ (cung/phép trên ngựa) vẫn kite như thường.

**Chống kỵ** (`braceAgainstCavalry`, `CombatStrategyBase.IsBracing`): lính cầm `Polearm`
thấy kỵ binh vào `braceRange` thì **chúc giáo đứng vững** — không lùi, không đánh-rồi-rút,
đâm ngay khi nó vào tầm (nới cận trong `ShouldAttack`). **Luôn làm kèm kỵ binh**: thiếu vế
này thì lính giáo cứ lùi, không cú đâm nào chạm được ngựa đang phi, và kỵ binh thành vô đối.

**Vỡ trận** (`CommandDoctrine.routCasualtyRatio`, `CommandNode.CheckRout`): một tổ còn dưới
tỉ lệ quân đó mà đang chạm địch thì tan hàng bỏ chạy về nhà. Trận trung cổ tan bằng tinh
thần chứ không bằng người cuối cùng.

**`AIPlaybook` — bộ AI của MÀN CHƠI** (`Assets/Settings/Playbooks/`, tool `AI > 8`):
gom *vai trò→tính cách · học thuyết · cấp IQ · hệ số địa hình map* vào một asset; scene chỉ
gắn `AIPlaybookBinder`. Ba tầng xếp chồng theo thứ tự **profile vai trò → hệ số map (bản sao
runtime) → cấp IQ**. 8 bộ: Skirmish · FieldBattle · Siege · Defense · WarCamp · Duel ·
Stealth · Survival. Hai phe gán hai playbook khác nhau là ra ngay bài test "lối đánh nào
thắng lối đánh nào". Scene có máy sinh quân thì đặt `reapplyInterval` > 0.

Bài test: `Demo_8_AILab` › **"Kỵ binh & rừng giáo"** (bài 21).

## 6. Những chỗ dễ sai

| Triệu chứng | Nguyên nhân |
|---|---|
| NPC đứng im không đánh | thiếu `ProjectilePoolManager` trong scene (vũ khí ranged), hoặc 2 con cùng `_teamId` |
| NPC không thấy địch | `visionRange` nhỏ hơn khoảng cách spawn; Guard chỉ thấy địch quanh **Objective** |
| Hai thằng khác phe đứng ĐÈ LÊN nhau không ai đánh ai | `personalSpace` đang 0. Ai dí sát mặt là phải xử trước — cả lính hành quân (`AIStateSeek`) lẫn vệ sĩ giữ tuyến (`AIStateGuard`) đều quét bán kính này |
| Vệ sĩ đứng DÍNH CHÙM lên nhau | hai chỗ gác trùng nhau. Chỉ số đứng phải đếm theo **số đứa cùng chắn MỘT bên** (địch tới một phía thì cả tốp cùng bên — lấy `slot/2` là slot 0 và 1 ra cùng chỗ), và `guardPatrolRadius` phải **nhỏ hơn nửa khoảng cách giữa hai chỗ gác** (code đã tự kẹp) |
| Vệ sĩ chết sạch ngay đợt đầu | NPC trần chỉ có **1 MÁU** (`StickmanFighter._maxHealth = 1`) — phải `ApplyLoadout` (máu + nón/giáp/khiên) như `SpawnBodyguard` làm |
| Vệ sĩ lao vào đám đông rồi chết | `guardHoldMargin` đặt quá lớn (thành "thấy là đuổi"), hoặc đang chạy bản cũ chưa có tuyến gác |
| Vệ sĩ bỏ VIP quay ra đánh người chơi | người chơi khác `_teamId` với vệ sĩ — không có phe trung lập, cho người chơi cùng phe VIP |
| NPC bị đánh không trả đũa | `_aggroWhenHit` tắt, hoặc kẻ đánh không có `TeamMember` khác phe |
| Nhân vật lăn tròn / xoay vòng vòng | root dùng collider TRÒN — `StickmanController` khoá `freezeRotation` lúc Awake; nếu tắt `_freezeRotationWhileAlive` là lăn như quả bóng |
| Đồng đội xô đẩy / kẹt nhau | `TeamMember._passThroughAllies` đang tắt. Lưu ý Unity reset `IgnoreCollision` khi collider bật lại → đã lọc lại ở event `Died` |
| Xác chắn đường | như trên — xác cũng được lọc va chạm với đồng đội |
| Vũ khí rớt chắn đường | collider vật rớt để TRIGGER, tiếp đất bằng raycast (`DroppedItem`) — không bao giờ chặn nhân vật |
| Chân giật khi flip | stride đổi dấu theo `lossyScale.x` — nếu rig con custom khác cấu trúc thì chỉnh `_strideLength` âm |
| Bắn trượt xa | tăng `ballisticLiftPerUnit` (cung) — súng không bù rơi vì đạn thẳng |
| Cả 2 phe đứng nhìn nhau | cả hai là ranged và đứng đúng mép dải khoảng cách — giảm `rangedMaxRange` hoặc thêm melee |
| Lính rung tại chỗ, tiến không được lùi không được | mốc đội hình không có vùng chết — xem 5.48, `formationDeadband` |
| Lính lật thân qua lại, không đánh ai | đổi mục tiêu mỗi nhịp quét — tăng `targetSwitchMargin` (nên > `targetSpreadPenalty`) |
| Chạy đi rồi quay lại, lặp mãi, không đánh phát nào | `retreatCooldown` = 0 — hết giờ chạy là frame sau xin chạy tiếp ngay |
| Hai thằng đi xuyên qua nhau qua lại | lách qua người không có nhịp nghỉ, hoặc đang tử chiến mà vẫn cho lách |
| Cả sân nhấp nháy dấu `»` | có cặp luật mới giằng nhau — bộ gỡ kẹt đang phải chữa cháy liên tục, tìm cặp đó chứ đừng nới số |
| Bắn trúng đồng đội | `_friendlyFire` trên vũ khí/đạn đang bật — tắt đi (mặc định đã tắt) |
| Ra lệnh mà lính không đổi hành vi | `TeamCommander._teamId` không khớp `TeamMember._teamId` của lính |
| Lệnh tấn công mà lính đứng im | chưa gán `_enemyBase` cho commander → không có điểm để hành quân tới |
| Lính vẫn dồn cục 1 chỗ | tăng `separationRadius` / `separationStrength` trong `AIProfile` |
| Cả tiểu đội bu 1 mục tiêu | tăng `targetSpreadPenalty`, giảm `maxAttackersPerTarget` |
| Trận đánh cứ lao thẳng, không có nhịp | `shakenDuration` = 0 là tắt tinh thần — đặt 1.5–2s cho có tiến/lui |
| Khiên không chịu che ai | `coverDistance` / `assistRadius`; khiên chỉ che khi còn cách địch > 70% tầm chém |
| NPC né đạn quá giỏi / quá kém | `dodgeChance` (0.6) và `dodgeReactionTime` (0.45s) trong `AIProfile` |
| NPC không thèm nhặt vũ khí | `WeaponPickup._aiPickupChance`; nhớ là mỗi con chỉ lắc 1 lần/món |
| Bắn trúng khiên mà vẫn chết | `EquipmentDefinition.blocksHits` chưa bật, hoặc hết `hitsBlocked` |
| Xác bay quá xa khi bị bắn thêm | `_corpseHitForceScale` (0.2) trên `StickmanController` |

## 7. Mở rộng

- **State mới** (VD: Stunned, Celebrate): class kế thừa `AIState`, thêm getter ở agent, chuyển tới từ state khác. Không đụng state cũ.
- **Lối đánh mới** (VD: bomber tự sát): class kế thừa `CombatStrategyBase`, override 4 hook.
- **NPC loại mới** = prefab variant của StickmanNPC + AIProfile mới — không cần code.
- Cần AI phức tạp hơn FSM (đội hình, chỉ huy) → xem `StickmanCombat-AI.md` mục Behavior Tree; project `MasterArcher-Game` có plugin Arbor FSM tham khảo.

## Nguồn

- Game AI Pro / Programming Game AI by Example (Mat Buckland) — FSM + Steering cơ bản
- Refactoring.guru — State, Strategy, Observer, Template Method
- Hành vi unit: Stick War, Age of War, Terraria (aggro), Kingdom Rush (kite/leash)
