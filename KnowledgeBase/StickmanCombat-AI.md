# Stickman Combat & AI NPC — Pattern Guide

> **Hệ AI NPC đã implement xong** — xem `AI-NPC.md` (FSM + Strategy, tool dựng arena).
> File này giữ làm nền lý thuyết + hướng mở rộng (Behavior Tree, đội hình).

> Cho các game tương lai: stickman 2D ragdoll — bắn cung, bắn súng, đánh nhau, NPC có AI.
> Nền tảng: pattern đã chạy thật trong Last Tower + kiến thức tổng hợp. Cập nhật: 2026-08.

## 1. Kiến trúc combat chung

```
StickmanController (base)          ← sống/chết, ragdoll, TakeDamage(Vector2 hitDir)
├── ArcherPlayerController         ← kéo-thả bắn cung (đã có trong dự án)
├── GunnerController (tương lai)   ← bắn súng: aim theo chuột/target, raycast hoặc projectile
├── FighterController (tương lai)  ← cận chiến: hitbox theo animation event
└── NpcController (tương lai)      ← AI: FSM/Behavior Tree điều khiển các controller trên
```

Nguyên tắc: **mọi damage đi qua `TakeDamage(Vector2 directHit)`** — hướng lực trúng đòn
truyền vào để ragdoll bay đúng hướng. Weapon không cần biết nhân vật là player hay NPC.

## 2. Bắn cung (đã implement — ArcherPlayerController)

Flow: `BeginDrag` → `UpdateDrag` (pullPercent = InverseLerp(minDrag, maxDrag)) →
`EndDragAndMaybeShoot` → `ArrowPoolManager.SpawnArrow(pos, rot, dir * force)`.

Chi tiết đáng nhớ:
- Drag đo bằng **pixel screen-space**, aim = `Atan2(dragDir)`; flip trái/phải bằng
  `localScale.x = ±1` trên body + công thức góc `180 - angle` khi flip
- Đầu xoay mượt bằng `LerpAngle(current, target, dt * aimLerpSpeed)`
- Kéo dây cung: lerp IK arm target + `LineRenderer.SetPosition(1, ...)` theo pullPercent
- Sau bắn: rung dây cung bằng coroutine `Sin(t * frequency) * strength * (1-t)`
- Arrow: `LateUpdate` xoay theo `linearVelocity`; trúng mục tiêu → `simulated=false`,
  `SetParent(target)` để cắm vào ragdoll; lifetime tự despawn về pool

## 3. Bắn súng (pattern cho tương lai)

- **Hitscan** (pistol/rifle): `Physics2D.Raycast(muzzle, aimDir, range, hitMask)` →
  `hit.collider.GetComponentInParent<StickmanController>()?.TakeDamage(aimDir * knockback)`
  + muzzle flash + LineRenderer tracer 1 frame
- **Projectile** (rocket, đạn chậm): dùng lại pattern ArrowController + pool, tắt xoay theo velocity nếu không cần
- Recoil: đẩy `IKArm` target giật lên rồi lerp về (giống bow tension đảo ngược)
- Aim hai tay cầm súng: 1 `LimbSolver2D` mỗi tay, cả 2 target là con của object "Gun",
  xoay object Gun theo aim → 2 tay tự bám
- Súng văng ra khi chết: gun là child của hand bone; khi TakeDamage → `SetParent(null)`,
  bật Rigidbody2D của gun

## 4. Cận chiến / đánh nhau (pattern cho tương lai)

- Hitbox: collider trigger trên tay/chân bone, CHỈ bật trong frame đòn đánh
  (Animation Event `EnableHitbox()` / `DisableHitbox()`)
- Damage: `OnTriggerEnter2D` → nếu đối tượng khác team → `TakeDamage(hướng đòn)`;
  hướng = `(target.pos - attacker.pos).normalized + Vector2.up * 0.3f` cho đẹp
- Knockback không chết: AddForce vào root Rigidbody2D + stun timer, KHÔNG bật ragdoll
- Hit-stop (khựng hình khi trúng): `Time.timeScale = 0.05f` trong 0.05–0.1s thật
  (coroutine WaitForSecondsRealtime) — cảm giác đòn nặng hơn hẳn
- Đòn kết liễu mới bật full ragdoll + impulse lớn

## 5. AI NPC (pattern cho tương lai)

### FSM (đủ cho hầu hết NPC stickman)
```csharp
enum NpcState { Idle, Patrol, Chase, Attack, Retreat, Dead }
// Update() { switch(_state) { ... } } — mỗi state một hàm, chuyển state có điều kiện rõ ràng
```
- Idle→Chase: thấy địch (`Vector2.Distance` < sightRange + optional raycast che khuất)
- Chase→Attack: vào tầm đánh (melee ~1m, archer/gunner giữ khoảng cách bắn)
- Attack→Retreat: máu thấp / reload
- Bất kỳ→Dead: `TakeDamage` đủ chết → FSM dừng, ragdoll tiếp quản (`if (_isDie) return;`)

### Khi nào dùng Behavior Tree
- FSM > ~6–7 state chuyển nhau chằng chịt → đổi sang BT (selector/sequence tách
  decision khỏi action). Tham khảo MasterArcher-Game: dùng **Arbor** (plugin FSM/BT
  visual, có sẵn license trong project đó)
- Tự viết BT đơn giản: node `Selector`, `Sequence`, `Leaf(Func<bool>)` ~100 dòng là đủ

### AI archer/gunner ngắm bắn
- Tính lực/độ cao bắn parabol tới target:
  `v = dir * Sqrt(g * dist / Sin(2 * angle))` hoặc đơn giản hơn — bắn thẳng khi gần
- Thêm random sai số theo độ khó: `aimDir + Random.insideUnitCircle * inaccuracy`
- Cooldown bắn = `_reloadTime` (dùng lại pattern reload của ArcherPlayerController)

### Team & target
- `enum Team { Player, Enemy, Neutral }` trên StickmanController (Last Tower/MasterArcher
  đều có `m_Team`); tìm target = quét collider trong sightRange, lọc khác team, gần nhất
- Layer riêng cho mỗi team + `Physics2D.OverlapCircle(pos, range, enemyMask)` rẻ hơn quét tag

## 6. Pooling & performance (game đông NPC)

- Mọi projectile qua `ObjectPool<T>` (UnityEngine.Pool) — pattern ArrowPoolManager
- NPC chết: để ragdoll nằm vài giây → fade → trả về pool (reset: reparent ragdoll parts
  về đúng bone cũ, restore localPos/Rot đã cache lúc Awake, `SetActive` đảo lại)
- SpriteSkin: tắt `Always Update`; nhiều NPC → cân nhắc GPU deformation (URP + SRP Batcher)
- Tắt `SpriteSkin` + `Animator` của NPC ngoài màn hình (`OnBecameInvisible`)

## Nguồn

- FSM 2D enemy controller: https://pavcreations.com/finite-state-machine-for-ai-enemy-controller-in-2d/
- Unity Learn — Finite State Machines: https://learn.unity.com/tutorial/finite-state-machines-1
- Toptal — Unity FSM tutorial: https://www.toptal.com/developers/unity/unity-ai-development-finite-state-machine-tutorial
- FSM vs Behavior Tree: https://respawn.outlookindia.com/gaming/gaming-guides/game-ai-for-beginners-fsm-behavior-trees-pathfinding
- Ví dụ FSM 2D trên GitHub: https://github.com/theGusPassos/unity-finite-state-machine
- Unity 2D ragdoll tutorial: https://generalistprogrammer.com/unity/unity-2d-ragdoll-character-tutorial/
