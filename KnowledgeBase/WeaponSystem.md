# Hệ thống vũ khí Stickman (26 cây: 20 trung cổ + 6 SÚNG HIỆN ĐẠI)

> Code: `Assets/Scripts/Combat/`, `Assets/Scripts/Weapon/`
> Tool: `Tools > Stickman > Weapons`
> Kiến trúc asset: **1 prefab base + prefab variant cho từng vũ khí**
> Phân lớp & bảng chỉ số cân bằng: **[WeaponDesign.md](WeaponDesign.md)**

## 0. Ý tưởng nền — vì sao không cần AnimationClip cho từng vũ khí

Rig của dự án animate **IK target**, không xoay từng khúc xương (xem `StickmanRigPaths`,
AGENTS.md mục 2). Nên một "dáng cầm" chỉ cần **2 Vector2 + 2 góc**:

```
WeaponHoldPose { ikArmL, ikArmR, weaponAngle, headAngleOffset, offHandWeaponAngle }
```

`StickmanProceduralAnimator` lerp giữa các pose ở `LateUpdate` → ra động tác vung/đâm/kéo cung.
Không cần Animator Controller, không cần bake clip. Thêm vũ khí mới = thêm pose.

Hệ toạ độ IK tay (nhớ khi chỉnh tay): `IKArmL/IKArmR` là con của `boneHead`, mà `body_1`
đã xoay 90° → trong local space đó **-Y là hướng ngắm (ra trước mặt)**, **+X là lên/ra sau**.

**Góc vũ khí = KHÔNG GIAN NGẮM** (`ApplyAimSpaceAngle`): 0° = mũi chỉ thẳng mục tiêu,
dương = ngóc lên, âm = chúc xuống — KHÔNG phải góc local theo bàn tay (bàn tay xoay theo IK,
neo góc vào nó là vũ khí ngoáy). Cách cầm từng loại: `WeaponHolding-Reference.md`.
Số tham chiếu từ prefab cung gốc: `IKArmL = (-0.026, -1.919)` (tay trái đẩy cung ra trước),
`IKArmR = (-0.051, -0.34)` (tay phải kéo dây sát người).

## 1. Cây prefab (base → variant)

```
Assets/Prefabs/Weapons/
  Weapon_Base                    khung rỗng: Visual (SpriteRenderer) + Tip (mũi / điểm bắn)
  ├── Weapon_MeleeBase           + MeleeWeapon      — hitRadius, sweepSamples, nhịp đòn dùng chung
  │   ├── Weapon_Sword           kiếm      variant: sprite + pose + Slash
  │   ├── Weapon_Spear           giáo      variant: sprite + pose + Thrust
  │   ├── Weapon_Saber           đao
  │   ├── Weapon_SaberShort      đao ngắn
  │   ├── Weapon_SaberLong       đao dài   (2 tay)
  │   ├── Weapon_DualSabers      song đao  (+ con OffHandBlade = lưỡi tay trái)
  │   ├── Weapon_DualSwords      song kiếm (+ con OffHandBlade)
  │   ├── Weapon_Lance           thương    (2 tay, dài nhất)
  │   └── Weapon_Warhammer       búa cận chiến (2 tay)
  ├── Weapon_RangedBase          + RangedWeapon     — pool size, recoil time dùng chung
  │   ├── Weapon_Bow             variant (+ con BowString, LoadedArrow)
  │   └── Weapon_Gun             variant
  ├── Weapon_ThrowableBase       + ThrowableWeapon  — nhịp ném, ammo dùng chung
  │   ├── Weapon_Javelin         lao
  │   ├── Weapon_Hammer          búa ném
  │   ├── Weapon_Bomb            bom
  │   └── Weapon_Grenade         lựu đạn
  └── Weapon_ShieldBase          + ShieldWeapon     — đỡ đòn + đập khiên (kế thừa MeleeWeapon)
      └── Weapon_Shield          khiên cầm tay (tay TRÁI)

Assets/Prefabs/Projectiles/
  Proj_Base                      SpriteRenderer + Rigidbody2D + ProjectileController (KHÔNG collider)
  └── Proj_Arrow / Proj_Bullet / Proj_Javelin / Proj_Hammer / Proj_Bomb / Proj_Grenade
                                 variant: sprite + scale + collider hợp với hình + override

Assets/Prefabs/
  Character.prefab               rig gốc — KHÔNG đụng vào
  ├── StickmanFighter            variant: đổi controller, cầm đủ 16 vũ khí
  └── StickmanDummy              variant: bia tập bắn (StickmanController thuần)
```

**Được gì:** sửa `Weapon_MeleeBase` là kiếm + giáo ăn theo; sửa rig trong `Character.prefab`
là Fighter + Dummy ăn theo. Field nào variant tự đặt sẽ tô **xanh** trong Inspector,
chuột phải → *Revert* là quay về giá trị base.

**Vì sao có tầng giữa (`Weapon_MeleeBase`...):** `WeaponBase` là class abstract nên không
`AddComponent` thẳng vào `Weapon_Base` được. Tầng giữa vừa giải quyết chuyện đó, vừa là nơi
để default dùng chung cho cả nhóm.

**Vì sao `Proj_Base` không có collider:** variant thêm được component nhưng bỏ component của
base thì rối. Arrow/Bullet/Javelin cần `BoxCollider2D`, Hammer/Bomb cần `CircleCollider2D`
→ để base trống, variant tự thêm đúng loại. `ProjectileController` lấy collider bằng
`GetComponent<Collider2D>()` nên loại nào cũng chạy.

## 2. Cây class

```
StickmanController                 máu + chết + ragdoll (dùng chung mọi stickman)
└── StickmanFighterController      input/ngắm → đẩy xuống holder   (AI cũng dùng được)
    ├── StickmanProceduralAnimator ghi đè IK tay + góc đầu + góc vũ khí
    └── StickmanWeaponHolder       gắn vũ khí vào handR/handL, đổi vũ khí
        └── WeaponBase             ┬ RangedWeapon     cung, súng
                                   ├ MeleeWeapon      kiếm, đao, thương, búa cận chiến, song đao...
                                   │   └ ShieldWeapon khiên cầm tay (+ đỡ đòn)
                                   └ ThrowableWeapon  lao, búa ném, bom, lựu đạn
                                        ↓
                                   ProjectilePoolManager → ProjectileController → Explosion
```

| Class | Việc |
|---|---|
| `WeaponBase` | cooldown, tích lực, pose, gây damage, gắn tay |
| `RangedWeapon` | bắn projectile, dây cung (LineRenderer — phần dây ở `RangedWeapon.BowString.cs`), tản đạn, auto-fire, giật nòng |
| `MeleeWeapon` | pose windup→strike, quét hitbox tròn dọc đường đi mũi vũ khí; combo đổi tay cho song đao |
| `ShieldWeapon` | kế thừa `MeleeWeapon` — thêm đỡ đòn theo cung trước mặt + độ bền tự hồi |
| `ThrowableWeapon` | ném chính nó đi, ẩn hình trên tay, hết cooldown "rút" cây mới |
| `ProjectileController` | 1 class cho mọi vật bay: cắm/xuyên/xoay/nổ |
| `ProjectilePoolManager` | nhiều pool tra theo key (`arrow`, `bullet`, `javelin`, `hammer`, `bomb`, `grenade`) |
| `Explosion` | damage + đẩy ragdoll theo bán kính, giảm dần ra mép |

## 3. Hai mươi sáu vũ khí — khác nhau ở đâu

**Hai bộ tách bạch, mỗi bộ một scene test riêng**: 20 cây trung cổ (index 0–19, thử ở
`Demo_1_Weapons`) và 6 cây súng hiện đại (index 20–25, thử ở `Demo_7_ModernWeapons`).
Bảng chỉ số chi tiết của bộ súng: [WeaponDesign.md](WeaponDesign.md) mục 3b.

Index trong cột đầu chính là **thứ tự trong `StickmanWeaponHolder`** (= `UnitLoadout.weaponIndex`,
= phím số trong scene demo). Thứ tự này lấy từ `StickmanWeaponBuilder.LeafWeaponPaths`.
**Thêm vũ khí mới thì NỐI VÀO CUỐI bảng đó**, đừng chèn giữa kẻo lệch mọi loadout đã lưu.

| # | Vũ khí | Variant của | Lớp | Tích lực | Đặc điểm |
|---|---|---|---|---|---|
| 0 | Cung | RangedBase | Bow | ✔ | tốc độ tên theo lực kéo, dây cung rung khi bắn |
| 1 | Kiếm | MeleeBase | Melee | ✘ | chém vòng + nhát đâm kết, thước đo chuẩn |
| 2 | Giáo | MeleeBase | Polearm | ✘ | đâm thẳng, 2 tay, vùng chết 55% tầm |
| 3 | Súng | RangedBase | Firearm | ✘ | auto-fire, tản đạn 1.5°, đạn không rơi, xuyên 1 |
| 4 | Lao | ThrowableBase | Thrown | ✔ | bay thẳng, cắm vào mục tiêu, xuyên 1 |
| 5 | Búa ném | ThrowableBase | Thrown | ✔ | xoay tít 900°/s, không cắm, knockback ×2 |
| 6 | Bom | ThrowableBase | Explosive | ✔ | vòng cung, nổ khi chạm hoặc sau 2.5s, bán kính 2.2 |
| 7 | **Đao** | MeleeBase | Melee | ✘ | bản to dần về mũi, **toàn nhát chém** — dồn dập hơn kiếm |
| 8 | **Đao ngắn** | MeleeBase | LightMelee | ✘ | tầm ngắn nhất (~0.9), cooldown 0.22 — nhanh nhất bộ |
| 9 | **Đao dài** | MeleeBase | HeavyMelee | ✘ | 2 tay, damage 2, cooldown 0.72, vùng chết 20% |
| 10 | **Song đao** | MeleeBase | Melee | ✘ | 2 lưỡi, combo 4 nhát ĐỔI TAY, nhát cuối cả hai cùng bổ |
| 11 | **Song kiếm** | MeleeBase | Melee | ✘ | như song đao nhưng thiên ĐÂM, nhát kết ×1.7 |
| 12 | **Thương** | MeleeBase | Polearm | ✘ | cây dài nhất (~3.6), vùng chết 62% — bị áp sát là vô dụng |
| 13 | **Búa cận chiến** | MeleeBase | HeavyMelee | ✘ | chậm nhất (0.8s), knockback 3 — đẩy văng mạnh nhất |
| 14 | **Khiên** | **ShieldBase** | Shield | ✘ | tay TRÁI: đỡ đòn trước mặt + đập khiên (xem §3.1) |
| 15 | **Lựu đạn** | ThrowableBase | Explosive | ✔ | ngòi 1.2s (không nổ khi chạm), bán kính 1.6 — ném gần vẫn sống |
| 16 | **Rìu chiến** | MeleeBase | Melee | ✘ | 1 tay, damage 1.3, toàn nhát bổ — cầm kèm khiên được |
| 17 | **Chùy** | MeleeBase | Melee | ✘ | 1 tay, knockback 2 (đập văng) — cầm kèm khiên được |
| 18 | **Nỏ** | RangedBase | Bow | ✘ | KHÔNG tích lực: bắn ngay, tên bay 30 xuyên táo, nạp 1.3s |
| 19 | **Kích** | MeleeBase | Polearm | ✘ | cán dài + lưỡi rìu: combo trộn ĐÂM thẳng và QUÉT rìu ăn cả cụm |
| | | | | | *— hết bộ trung cổ, dưới đây là BỘ SÚNG (Demo_7) —* |
| 20 | **Súng lục** | RangedBase | Firearm | ✘ | **1 tay** (cây súng duy nhất), bắn phát một, mốc giữa của bộ |
| 21 | **Tiểu liên** | RangedBase | Firearm | ✘ | liên thanh 0.09s/viên, tản 5° — phải áp sát mới trúng |
| 22 | **Súng trường** | RangedBase | Firearm | ✘ | liên thanh cân bằng, tầm ăn 8 — thước đo của bộ súng |
| 23 | **Súng săn** | RangedBase | Firearm | ✘ | **6 viên/phát**, tản 9°: gần thì nát cả cụm, xa thì vô dụng |
| 24 | **Bắn tỉa** | RangedBase | Firearm | ✘ | 4 sát thương/phát, đạn 45 u/s, nạp 1.6s, tầm ăn 14 (xa nhất) |
| 25 | **Phóng lựu** | RangedBase | Explosive | ✘ | bắn quả nổ bay vòng cung, sát thương nằm ở VỤ NỔ |

Damage mặc định = 1 và `StickmanController._maxHealth` = 1 → **một phát chết**, đúng chất stickman.
Muốn "trâu" hơn thì tăng `_maxHealth` trên nhân vật.

### 3.0 Kiếm + khiên — khiên tay phụ

Vũ khí ngắn 1 tay (`_allowOffHandShield`: **kiếm, đao, đao ngắn**) cầm được KÈM khiên:
trong kho có `ShieldWeapon` là `StickmanWeaponHolder.UpdateOffHandShield` tự giơ nó lên tay
trái (`_pairShieldWithOneHanded`, mặc định bật). Ở chế độ tay phụ:

- Tay trái BỎ pose của vũ khí chính, đứng yên ở thế thủ (`ShieldWeapon._guardIkArmL/_guardAngle`,
  animator `SetOffHandShield`) → kiếm vung thoải mái mà khiên vẫn che người
- Khiên CHỈ ĐỠ (đập là việc của vũ khí chính), và đỡ được cả LÚC kiếm đang vung
- Sorting = NearLimb (8), ngay dưới kiếm (9) — che thân nhưng không che lưỡi kiếm
- Đổi sang vũ khí 2 tay / song đao là tự cất; chết thì rớt cả kiếm lẫn khiên (văng lệch hướng)
- Bấm sang slot khiên thì nó thành vũ khí chính như cũ (đập khiên được)

### 3.1 Khiên cầm tay — `ShieldWeapon`

`ShieldWeapon` **kế thừa `MeleeWeapon`** nên phần "đập khiên" dùng lại nguyên bộ máy combo +
hitbox có sẵn; phần riêng chỉ là **đỡ đòn**:

- Đòn tới trong `_blockArcDegrees` (200°) quanh hướng đang nhìn thì **bị chặn**, người không mất máu
- Mỗi lần đỡ bào `_blockCapacity` (4) — đòn nhẹ tới đâu cũng tối thiểu 0.5; hết là **vỡ tạm**
  `_brokenTime` (1.5s) rồi tự hồi `_regenPerSecond` (1.2/giây)
- **Đang vung đập khiên = hở sườn**, không đỡ được (tắt bằng `_blockWhileAttacking`)

Đường damage: `StickmanController.TakeDamage` → `StickmanEquipment.TryAbsorb` (khiên/nón TRANG BỊ)
→ `StickmanWeaponHolder.TryBlock` → `WeaponBase.TryBlock` (khiên VŨ KHÍ) → mới trừ máu.

| | Khiên **trang bị** (`EquipmentDefinition` slot Shield) | Khiên **vũ khí** (`Weapon_Shield`) |
|---|---|---|
| Đỡ | đủ `hitsBlocked` đòn rồi **RƠI mất** | độ bền **tự hồi**, không rơi |
| Hướng | mọi hướng (theo collider) | chỉ cung trước mặt |
| Đánh trả | không | đập khiên, knockback 2.6 |
| Hợp với | lính thường ăn 1 đòn là mất khiên | lính khiên đứng tuyến đầu |

### 3.2 Song đao / song kiếm — `HandGrip.DualWield`

Lưỡi thứ hai **nằm ngay trong prefab vũ khí** (`OffHandBlade/Visual` + `OffHandBlade/Tip`),
`StickmanWeaponHolder` chỉ **mượn** nó sang xương `handL` trong lúc cầm rồi trả về chỗ cũ lúc
cất đi — nhờ vậy **rớt đồ / nhặt đồ vẫn đi nguyên đôi**, không bao giờ rơi mất một cây.

Ba mảnh ghép:

| Nơi | Field / việc |
|---|---|
| `WeaponBase` | `_offHandWeapon` (lưỡi 2), `_offHandGripLocalPosition` (chỗ nắm trên handL), `_offHandRestLocalPosition/Angle` (chỗ nằm lúc cất đi — lệch chéo cho ra dáng một ĐÔI) |
| `WeaponHoldPose` | thêm `offHandWeaponAngle` — góc riêng của lưỡi tay trái |
| `MeleeWeapon.Swing` | thêm `useOffHand` — nhát này quét hitbox từ `_offHandHitPoint` (mũi lưỡi trái) |

`StickmanProceduralAnimator.SetWeapon(weapon, offHandGrip, offHandWeapon)` xoay lưỡi trái theo
`pose.offHandWeaponAngle`. Lưu ý `OffHandGrip` (bám cán, cho giáo/súng 2 tay) và `OffHandWeapon`
(lưỡi thứ hai) **loại trừ nhau**: song đao để `offHandGrip = null` nên tay trái đi theo `pose.ikArmL`.

Sorting: lưỡi tay phải = `NearWeapon` (9), lưỡi tay trái = `FarWeapon` (6) — đúng bảng
`StickmanSorting` (tay trái là tay xa).

## 4. Menu tool

| Menu | Ra cái gì |
|---|---|
| **Create Demo Scenes (All)** | 4 scene test riêng (vũ khí / rớt đồ / AI / guard) + thanh UI chuyển scene — tự chạy mọi bước dưới nếu còn thiếu |
| 1. Generate Placeholder Art | `Assets/Sprites/Weapons/*.png` — vẽ bằng code, PPU 100, **pivot ngay chỗ tay nắm** |
| 2. Build Weapon + Projectile Prefabs | cả cây base + variant ở mục 1 |
| 3. Create Character Variants | `StickmanFighter.prefab` + `StickmanDummy.prefab` (variant của `Character.prefab`) |
| 4. Create Demo Scene | dựng lại `Demo_1_Weapons` — đất, pool, người chơi, GIÁ VŨ KHÍ 11 cây, 5 bia thưa dần |
| Build Everything (1-4) | chạy tuốt |
| **New Weapon Variant from Selection** | chọn 1 base trong Project → sinh variant mới để điền |
| **Mount Selected Weapon on Character** | gắn tạm prefab vũ khí vào tay nhân vật trong scene để chỉnh pose |
| **Unmount Weapons in Scene** | gỡ mấy cái vừa gắn tạm |

Bước 3 làm gì với `Character.prefab` (không unpack, giữ link để thành variant):
- đổi `ArcherPlayerController` → `StickmanFighterController`, copy nguyên wiring ragdoll qua `SerializedObject`
- thêm `StickmanProceduralAnimator` + `StickmanWeaponHolder`, tự dò rig theo `StickmanRigPaths`
- **tắt** `handL/Bow` và `handR/tempArrow` cũ (variant không xoá được con của base, chỉ tắt được)
  — cung giờ là `Weapon_Bow.prefab`; dây cung mượn `LineRenderer` của rig gốc để lấy MATERIAL,
  còn hình học (mặt phẳng dây · nửa sải · quãng kéo · bề dày) ĐO TỪ ART (`StickmanRigMetrics.TryMeasureBowString`)
- nạp 20 prefab vũ khí (`LeafWeaponPaths`) vào `_weaponPrefabs`; holder Instantiate vào tay lúc Awake

Điều khiển trong scene demo: chuột trái = đánh (giữ để tích lực), lăn chuột = đổi vũ khí,
phím `1..9` = 9 cây đầu, **`Shift + 1..9` = 9 cây tiếp** (kho 26 cây > 9 phím số nên chia 2 trang).
Scene chuyên đề thì LỌC kho cho gọn: `Demo_7_ModernWeapons` chỉ nạp 6 cây súng vào
`_weaponPrefabs` (hàm `EquipOnly` trong `StickmanDemoBuilder`) nên phím `1..6` là đủ.
HUD trong `Demo_5_Testbed` có nút bấm riêng từng cây + hiện chỗ cầm/tầm với của cây đang cầm.

## 4.1 Hitbox nhân vật — vì sao đạn hay "trượt"

Rig gốc khi CÒN SỐNG chỉ có đúng **1 collider**: `groundCollider` hình tròn bán kính 0.2 local
≈ **0.05 world** ở hông (nhân vật cao ~1 world). Collider thân/tay/chân/đầu nằm hết trong các
part ragdoll đang TẮT → đạn bay xuyên qua người là chuyện bình thường.

`StickmanHitboxes` (tự chạy trong `StickmanController.Awake`, tắt bằng `_buildBodyHitboxes`)
copy collider của **từng part ragdoll** ra một object anh em đang bật, để **trigger**, gắn cùng bone:

- hitbox bám xương → đúng tư thế đang đứng/vung tay
- nằm trong group `Sprite` → lúc chết group tắt, hitbox tự biến mất, ragdoll thật tiếp quản
- không có Rigidbody2D riêng → thuộc về RB của root (compound collider)
- nhờ đó `DamageInfo.point` là điểm trúng THẬT → bắn vào chân thì chân văng

## 4.2 Combo — đòn đánh không lặp một kiểu

`MeleeWeapon._combo` là mảng các **nhát** (`Swing`), mỗi nhát có pose + nhịp + `damageScale`
+ `hitRadiusScale` riêng. Đánh liên tiếp thì xoay vòng qua từng nhát; ngừng quá
`_comboResetTime` giây thì về nhát đầu. Để mảng trống = dùng 1 nhát mặc định như cũ.

| Vũ khí | Combo dựng sẵn |
|---|---|
| Kiếm | chém xuôi (trên xuống) → chém ngược (dưới lên) → **đâm kết** (×1.5 damage, hitbox to hơn) |
| Giáo | đâm nhanh → **đâm dài lấy đà** (×1.4 damage, tầm xa hơn) |
| Đao | chém xuôi → chém ngược → **chém ngang lấy đà** (×1.5, hitbox ×1.25) |
| Đao ngắn | rạch → rạch ngược → **đâm nhanh** (×1.3) — cả combo dưới 0.6s |
| Đao dài | bổ dọc → **chém ngang** (×1.35, hitbox ×1.25) |
| Song đao | phải → **trái** (`useOffHand`) → phải → **song bổ cả hai lưỡi** (×1.6) |
| Song kiếm | phải rạch → trái rạch → trái đâm → **song đâm** (×1.7) |
| Thương | đâm thẳng → **đâm xuyên lấy đà** (×1.6, tầm xa nhất) |
| Búa cận chiến | bổ dọc → **quét ngang** (×1.3, hitbox ×1.3) |
| Khiên | 1 nhát: **đập khiên** (damage thấp, knockback 2.6) |

Vật ném lệch nhịp ngẫu nhiên ±20% mỗi cú cho đỡ giống nhau.

Hai quy tắc combo dễ quên:

- **Góc pose lerp TUYẾN TÍNH, không LerpAngle** (`WeaponHoldPose.Lerp`): đường vung là một
  phần của pose. Nhát bổ +140° → -45° phải quét 185° qua MẶT TRƯỚC; LerpAngle chọn đường
  ngắn 175° vòng sau lưng → mọi nhát bổ biến thành chém hất từ dưới lên. Muốn vung quá
  nửa vòng thì ghi góc liên tục (VD 200°), đừng wrap về [-180, 180].
- **Reset combo bốc nhát mở màn ngẫu nhiên** (`_randomizeComboStart`, trừ nhát kết):
  AI ra đòn thưa hơn `_comboResetTime` mà luôn quay về nhát 0 là cả trận chỉ thấy đúng
  một kiểu chém. Đánh dồn dập vẫn đi tuần tự tới nhát kết như cũ.

**Đơn vị `_hitRadius` là WORLD** (nhân vật cao ~1 unit): kiếm 0.10, giáo 0.09, đao 0.11,
đao dài 0.14, búa cận chiến 0.20 (đầu búa to), khiên 0.22 (mặt khiên bè).
Đặt 0.3 như số "rig space" là hitbox to bằng 1/3 người — trúng lung tung.

## 4.3 Thế thủ — đỡ đòn bằng vũ khí cận chiến

Ba tầng đỡ đòn, KHÁC nhau ở chỗ chủ động hay bị động:

| Tầng | Cách kích hoạt | Rơi/vỡ |
|---|---|---|
| Khiên trang bị (`EquipmentDefinition.blocksHits`) | bị động, cứ mặc là đỡ | đỡ đủ số đòn thì RƠI mất |
| Khiên cầm tay (`ShieldWeapon`) | bị động, cứ cầm là đỡ cung trước mặt | độ bền tự hồi, vỡ tạm `_brokenTime` |
| **Thế thủ (`MeleeWeapon._canGuard`)** | **CHỦ ĐỘNG: phải đang GIƠ mới đỡ** | độ bền riêng, VỠ THẾ là tự hạ vũ khí |

Cách hoạt động của thế thủ:

- **Player: GIỮ CHUỘT PHẢI** (`StickmanFighterController._guardWithRightMouse`) — giơ vũ khí
  chắn chéo trước mặt theo `MeleeWeapon._guardPose` (một `WeaponHoldPose` như mọi pose khác,
  chỉnh bằng nút **Capture** trong Inspector vũ khí, cùng quy trình mục 5).
- **AI tự giơ** khi thấy địch vung vũ khí cận chiến trong tầm — tuning trong `AIProfile`
  (`blockChance` / `blockDuration` / `blockCooldown`, xem `Docs/KnowledgeBase/AI-NPC.md`).
- Đòn từ cung `_guardArcDegrees` trước mặt bị chặn hết damage, bào `_guardCapacity`;
  hết là **VỠ THẾ**: hạ vũ khí, chờ `_guardBrokenTime` giây (độ bền hồi đầy) mới giơ lại được.
  Vẫn giữ chuột phải thì hết cữ vỡ tự giơ lại.
- **Ra đòn là hạ thế thủ** (`DoAttack` tự tắt) và đang vung thì không đỡ được — không có
  chuyện vừa chém vừa thủ. Đỡ trúng có recoil (giật tay về sau,
  `StickmanProceduralAnimator.ApplyPoseImpulse`) + chỗ cắm `_guardBlockClip` / `_guardBlockVfx`.
- Đường damage không đổi: `TakeDamage` → `StickmanEquipment.TryAbsorb` →
  `StickmanWeaponHolder.TryBlock` (khiên tay phụ đỡ trước → vũ khí chính) → trừ máu.

## 5. Chỉnh dáng cầm cho đẹp (đừng ngồi đoán số)

Pose sinh ra từ tool chỉ là điểm xuất phát — IK solver xoay tay theo target nên phải nhìn mới biết.

1. Kéo `StickmanFighter` vào scene
2. Chọn prefab vũ khí trong Project → `Tools > Stickman > Weapons > Mount Selected Weapon on Character`
3. Kéo `IKArmL` / `IKArmR` trong Scene view, xoay vũ khí cho ưng
4. Inspector vũ khí → mục **"Pose — bắt từ scene"** → `Capture` ở đúng pose (`Preview` để xem lại)
5. Trên instance vũ khí bấm **Overrides > Apply All** để ghi ngược vào prefab variant
6. `Unmount Weapons in Scene` cho sạch

Góc cầm cơ bản đã tính sẵn từ rig (xoay tích luỹ của bàn tay so với `boneHead`):
**tay phải ≈ -74°**, **tay trái ≈ 0°** — góc để vũ khí vẽ theo +X trỏ đúng hướng ngắm.
Pose trong tool viết dạng `RightHandBaseAngle + x` cho dễ dò.

### 5.1 Gốc xương bàn tay là CỔ TAY, không phải nắm tay

Đây là cái bẫy làm vũ khí trông "lơ lửng bên cạnh người":

```
handR (gốc = CỔ TAY, x=0)  ──────────────►  effectArmR (đầu ngón, x≈0.75)
                              nắm tay ở ~73% → x ≈ 0.55
```

Để `_gripLocalPosition = (0,0,0)` là gắn vũ khí vào cổ tay, lệch khỏi bàn tay đúng một khúc
xương — quy ra world là **~18% chiều cao nhân vật**, nhìn rất rõ. Con số 0.73 lấy từ chính rig:
cây `Bow` dựng sẵn trong `Character.prefab` nằm ở `x = 0.553` trên xương bàn tay dài `0.7535`.

Tool tự đo qua `StickmanRigPaths.GripPointOnHand()` nên đổi tỉ lệ nhân vật là số tự cập nhật.
Muốn chỉnh tay: Inspector vũ khí có nút **"Bắt vị trí cầm"** — kéo vũ khí vào đúng nắm tay
trong Scene view rồi bấm, khỏi gõ số.

Prefab do bản tool cũ dựng (grip = 0) được `StickmanSceneUtils.EnsureAllAssets` phát hiện và
dựng lại tự động.

### 5.2 Cầm 1 tay / cầm 2 tay

`WeaponBase._offHandGrip` = điểm trên cán mà tay còn lại nắm vào.

- **Bỏ trống** → cầm 1 tay (kiếm, lao, búa, bom, cung): tay phụ đi theo pose.
- **Có gán** → cầm 2 tay (giáo, súng): `StickmanProceduralAnimator` ép IK tay phụ bám theo
  điểm nắm ở mọi tư thế, kể cả lúc đang vung — pose không cần tả tay phụ nữa.

Tool dựng sẵn: giáo nắm ở `x = 1.1` (giữa cán), súng ở `x = 0.55` (đỡ nòng).

### 5.3 Thứ tự vẽ (sorting order)

Bảng chuẩn nằm ở `StickmanSorting`, **số đo từ `Character.prefab`**:

| Bậc | Bộ phận |
|---|---|
| 3 | bàn tay / bàn chân XA |
| 4 | cẳng tay / cẳng chân XA |
| 5 | THÂN |
| 6 | ĐẦU · vũ khí tay xa · giáp ngực |
| 7 | bàn tay / bàn chân GẦN · nón |
| 8 | cẳng tay / cẳng chân GẦN |
| 9 | vũ khí / khiên cầm ở tay GẦN |

Hai điều dễ tưởng nhầm:

1. **Bàn tay vẽ SAU cẳng tay** (7 < 8, và 3 < 4). Rig gốc cố ý vậy cho khớp vai/khuỷu không hở —
   đừng "sửa cho hợp lý".
2. **Quay trái/phải KHÔNG cần đảo order.** Rig lật bằng `localScale.x = -1`, thao tác đó không
   đụng sorting order, quan hệ gần/xa giữ nguyên. Điều kiện duy nhất: đồ gắn thêm phải lấy bậc
   **theo bộ phận nó bám vào** (`StickmanSorting.WeaponOrder/EquipmentOrder`), không phải số cố định.

`StickmanSorting.Apply` lấy mốc là renderer tên `Visual` và giữ nguyên KHOẢNG CÁCH tương đối của
các phần phụ — nên bậc của dây cung / mũi tên nạp sẵn phải ghi **so với thân cung**, không phải
một số tuyệt đối.

⚠⚠ Chính vì giữ khoảng cách mà **dây cung chép từ rig (order 0) vĩnh viễn thấp hơn thân cung 6 bậc**:
thân cung ở 6, dây ở 0 ⇒ dây chìm sau cả THÂN NGƯỜI (5) lẫn cẳng tay gần (8). Sợi dây có đó mà
không bao giờ nhìn thấy, và không có lỗi nào báo. Nay builder ghi **dây = bậc thân cung + 1**, mũi
tên nạp sẵn **+2** (hai cái cùng +1 là TRÙNG bậc trong một `SortingGroup` ⇒ đảo qua đảo lại tuỳ frame).

## 6. Thêm vũ khí mới (không cần code)

1. `Tools > Stickman > Weapons > New Weapon Variant from Selection` với base đúng nhóm
   (Melee / Ranged / Throwable)
2. Đổi sprite ở con `Visual`, kéo `Tip` ra đúng mũi vũ khí
3. Điền `_weaponType` (thêm giá trị vào `enum WeaponType` nếu là loại mới), damage, cooldown, pose
4. Nếu bắn/ném: tạo variant của `Proj_Base`, đặt `_projectileKey` riêng, gán `_projectilePrefab`
5. Kéo prefab vào `_weaponPrefabs` của `StickmanWeaponHolder`

Chỉ viết class mới khi hành vi thật sự khác (khiên đỡ, súng hitscan, kiếm combo 3 nhát):
kế thừa `WeaponBase`, override `DoAttack(charge, aimDir)` — rồi tạo thêm 1 category base cho nó.

## 7. Rớt vũ khí / trang bị / loot — và nhặt lại

```
chết ──► StickmanController.Died (event)
          ├─ StickmanWeaponHolder.OnOwnerDied  → DropCurrentWeapon() → WeaponPickup
          ├─ StickmanEquipment.OnOwnerDied     → DropAll()           → DroppedItem
          └─ LootDropper.OnOwnerDied           → bảng prefab + chance → DroppedItem
```

- `DroppedItem.MakeDropped(go, impulse)` — nền vật lý chung: thêm RB2D + collider tự đo theo
  sprite, văng + xoay, chạm tag `Ground` thì đóng băng (bodyType Static) để nhân vật đi ngang
  không đá văng; trigger nhặt vẫn hoạt động vì character có Rigidbody2D.
- `WeaponPickup` — vũ khí nằm đất: trigger tròn (bán kính world 0.5, tự chia scale), delay 0.6s;
  stickman sống có `StickmanWeaponHolder` chạm vào → `holder.AddWeapon(weapon, equip: true)`,
  physics gỡ sạch, vũ khí về tay. Đặt vũ khí sẵn trong scene làm spawner: kéo prefab vũ khí
  vào scene + AddComponent `WeaponPickup`.
- `StickmanEquipment` + `EquipmentDefinition` (Create > Stickman > Equipment) — mũ/giáp/đồ lưng
  gắn thẳng vào bone (Head→boneHead, Body/Back→body_2) nên xoay theo đầu. Chết thì đồ Ở LẠI
  trên xác (chuyển sang part ragdoll); chỉ rớt khi hết `armor` hoặc hết `hitsBlocked`.
- `LootDropper` — coin/máu/item: bảng `prefab + chance + count`, không cần code.
- Tắt rớt vũ khí: `_dropWeaponOnDeath` trên holder. Chỉnh lực văng: `_dropImpulse`.

## 8. Thay sprite / skin — quy trình chuẩn (Sprite Pivot Tool)

`Tools > Stickman > Sprite Pivot Tool` — thay art thật cho placeholder không cần đụng code:

1. Kéo PNG mới vào `Assets/Sprites/Weapons/` (vũ khí vẽ **mũi quay sang phải +X**)
2. Mở tool, chọn texture → **click lên hình đúng chỗ tay cầm** → Apply Pivot (PPU giữ 100)
3. Kéo prefab vũ khí vào ô → **"Gán sprite vào Visual + auto Tip"** — Tip/muzzle/hitbox
   tự nhảy ra mép phải sprite mới
4. Đạn/vật ném: kéo prefab `Proj_*` vào → **"Gán sprite + auto collider theo bounds"**
5. Hình dài/ngắn khác hẳn bản cũ → chỉnh lại pose (Mount → Capture)

Thay hình NHÂN VẬT: dùng `StickmanSkinSet` + `StickmanSkinBinder` (sprite phải rig đúng
số lượng + thứ tự bone — xem `Tooling-RigRagdollAnimation.md`).
Thay hình TRANG BỊ: đổi sprite trong asset `EquipmentDefinition`.

## 9. Effect & âm thanh — chỗ cắm sẵn

| Chỗ cắm | Field | Khi nào chạy |
|---|---|---|
| Mọi vũ khí | `_attackVfx` + `_attackClip` | mỗi lần ra đòn, sinh tại Muzzle |
| Cung/súng | `_drawClip`, `_shootClip`, `_muzzleFlash` | kéo dây / bắn |
| Kiếm/giáo | `_swingClip`, `_hitClip` | vung / trúng |
| Ném | `_throwClip` | vật rời tay |
| Projectile | `_launchClip`, `_hitClip`, `_explosionVfx` | bắn / trúng / nổ |
| Nhân vật | `_hurtClip`, `_deathClip`, `_deathVfx` | trúng đòn / chết |
| Nhặt đồ | `_pickupClip` | nhặt vũ khí |

Tất cả là prefab/AudioClip kéo-thả, VFX tự Destroy — không cần viết code.
Âm thanh dùng `AudioSource.PlayClipAtPoint` (đủ cho sandbox; game thật muốn pool audio
thì thay 1 chỗ trong từng class).

## 9.5 Bốn kiểu ngắm / bắn cho người chơi (AimMode)

Cùng một cây cung, nhưng **cách người chơi bắn nó** thì tuỳ game. Đổi bằng phím **M** lúc chơi,
hoặc gán từ code: `fighter.Aiming = AimMode.AutoFire;`

| Kiểu | Thao tác | Lực bắn | Hợp với |
|---|---|---|---|
| `DragPull` | bấm giữ, **kéo NGƯỢC** hướng muốn bắn, thả ra | kéo càng xa càng mạnh | mobile, kiểu Angry Birds |
| `PointAim` | rê chuột để ngắm, **GIỮ** để kéo căng cung, thả ra bắn | theo thời gian giữ | PC, kiểm soát tốt nhất |
| `ClickShot` | **click phát ăn ngay** về đúng điểm click, không cần giữ | cố định `_clickShotCharge` | bắn nhanh, mobile tap |
| `AutoFire` | không cần bấm gì, chỉ lo chạy | tự tính theo khoảng cách | idle / auto-battle |

Cả bốn đều đổ về cùng một chỗ:

```
lấy hướng ngắm → chốt _aimDirection → _holder.Attack(charge, _aimDirection)
```

Khác nhau đúng 2 điểm: **lấy hướng ở đâu** và **tính lực thế nào**. Nên thêm kiểu thứ năm
(giữ để tự bắn liên tục, ngắm bằng joystick ảo...) chỉ là thêm 1 hàm `Handle*` trong
`StickmanFighterController` — không đụng vào bất kỳ file vũ khí nào.

### AutoFire tính toán gì

1. Tìm địch còn sống gần nhất trong `_autoFireRange` (qua `TeamMember.FindNearestEnemy`, nên
   **không bao giờ tự bắn đồng đội**). Vũ khí cận chiến thì tầm bị siết về đúng tầm chém —
   không thì nhân vật đứng cách 8 unit vung kiếm vào không khí.
2. Ngắm vào **tâm người** (`_autoAimHeight`), rồi **bù độ rơi**: `+ khoảng cách × _autoAimLiftPerUnit`.
   Chỉ bù cho vũ khí tích lực (tên/lao/bom bay theo trọng lực); đạn súng `gravityScale = 0`
   nên bắn thẳng. Đúng công thức `RangedCombatStrategy` mà AI đang dùng.
3. Lực kéo theo khoảng cách: sát mặt thì `_autoFireMinCharge`, xa thì căng dần tới 1 —
   khỏi bắn vọt qua đầu địch đứng gần.
4. Nhịp bắn = cooldown vũ khí **cộng thêm** `_autoFireInterval` cho đỡ như súng máy.

### Lưu ý

- `ClickShot` và `AutoFire` **không chạy pha tích lực**, nên dây cung không có animation kéo căng
  — bắn xong vẫn có rung dây + pose giật (`RangedWeapon.DoAttack` tự lo). Muốn thấy dây kéo
  thì dùng `DragPull` / `PointAim`.
- Đổi kiểu giữa chừng tự huỷ pha tích lực đang dở (`Aiming` setter gọi `CancelCharge`), không kẹt
  trạng thái nửa vời.
- **AI không dùng đường này.** NPC tắt `_useInput` rồi gọi thẳng `AimAt()` + `AttackNow()`,
  nên đổi `AimMode` chỉ ảnh hưởng nhân vật người chơi.

## 10. AI/NPC dùng chung hệ thống

`StickmanFighterController` tắt `_useInput` là thành NPC:

```csharp
fighter.EquipWeapon(WeaponType.Spear);
fighter.AimAt(target.position);
fighter.AttackNow(charge: 0.8f);
```

Pattern FSM/aim-lead xem `Docs/KnowledgeBase/StickmanCombat-AI.md`.

## 11. Những chỗ dễ sai

| Triệu chứng | Nguyên nhân |
|---|---|
| `Chưa đăng ký projectile key '...'` | vũ khí thiếu `_projectilePrefab` (vũ khí tự Register lúc Equip) |
| Vũ khí cầm ngược / chĩa sai hướng | `weaponAngle` trong pose — sửa bằng Capture, đừng xoay prefab |
| Sửa base mà variant không đổi theo | field đó đang bị variant override (tô xanh) — chuột phải → *Revert* |
| Bắn trúng chính mình | projectile check `owner` theo `IsChildOf` — nhớ truyền `owner` khi Spawn |
| Bom nảy ngược vào người ném | đã xử lý: projectile tắt va chạm với collider chủ nhân, trả lại khi về pool |
| Bom không giết được người ném | mặc định vậy — bật `_explosionHitsOwner` trên `Proj_Bomb` nếu muốn |
| Mũi tên biến mất khi mục tiêu chết | đã xử lý: tên cắm vào **part ragdoll** gần nhất, không cắm vào group `Sprite` |
| Vung kiếm không trúng dù chạm hình | hitbox lấy tại `Tip`; chỉnh `_hitRadius` (WORLD) hoặc tăng `_sweepSamples` |
| Đạn xuyên qua người | `_buildBodyHitboxes` trên `StickmanController` bị tắt — bật lên (mặc định bật) |
| Xác chắn đường | `TeamMember._passThroughCorpses` (mặc định bật) — xác mọi phe đều đi xuyên qua được |
| Đổi vũ khí xong tay vẫn dáng cũ | pose lerp theo `_poseLerpSpeed` (mặc định 14) — tăng lên nếu muốn snap |
| Cung cũ vẫn lơ lửng trong tay | `handL/Bow` gốc phải ở trạng thái tắt trên variant Fighter |
| Vũ khí rớt xong không nhặt được | người nhặt phải CÒN SỐNG và có `StickmanWeaponHolder`; delay 0.6s sau khi rớt |
| Vũ khí rớt bị nhân vật đá văng | chưa chạm tag `Ground` nên chưa đóng băng — kiểm tra tag mặt đất |
| Trang bị không rớt khi chết | ĐÚNG THIẾT KẾ — chết không làm rụng đồ. Muốn nó rớt thì phải ĐÁNH RỚT: đặt `armor` > 0 (hoặc `blocksHits`) rồi bắn trúng đúng món đó |
| Vũ khí lơ lửng cách bàn tay một đoạn | `_gripLocalPosition` = 0 → đang bám CỔ TAY. Xem mục 5.1 |
| Nón văng sang bên cạnh đầu, khiên lộn ngược | thiếu `keepUpright` → `EquipmentStabilizer` không được gắn |
| Nón to/nhỏ không khớp đầu | scale gõ tay; để tool đo bằng `StickmanRigMetrics` |
| Cung nổi trước bụng nhưng bàn tay chìm sau lưng | đồ gắn thêm dùng order cố định thay vì `StickmanSorting` |
| Giáo/súng chỉ có 1 tay cầm | chưa gán `_offHandGrip` — xem mục 5.2 |

## 12. Quan hệ với code cũ

- `ArcherPlayerController` + `ArrowController` + `ArrowPoolManager` **giữ nguyên**,
  `Character.prefab` **không bị sửa** — hệ mới nằm ở các variant.
- `StickmanController` nâng cấp tương thích ngược: thêm máu + `TakeDamage(DamageInfo)`;
  `TakeDamage(Vector2)` bản cũ vẫn chí mạng. Class con override **`OnDeath(DamageInfo)`**
  thay vì override `TakeDamage` (hook chạy cho mọi đường damage).

## Nguồn

- Unity Manual — Prefab Variants (override, revert, added/removed component)
- Unity Manual — `Physics2D.OverlapCircle` (ContactFilter2D + List, không alloc)
- Unity Manual — `ObjectPool<T>` (`UnityEngine.Pool`)
- `Docs/KnowledgeBase/Ragdoll2D.md`, `Rigging2D-BonePlacement.md`, `StickmanCombat-AI.md`
