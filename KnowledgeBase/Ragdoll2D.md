# Ragdoll 2D trong Unity — Knowledge Base

> Tổng hợp từ Unity Manual, Unity Discussions và kinh nghiệm 3 project stickman
> (AssetStickMan / StickManVsBubble_Archer / Last Tower). Cập nhật: 2026-08.

## 1. Ragdoll 2D là gì

Ragdoll = nhân vật được điều khiển bằng physics thay vì animation. Trong 2D, mỗi bộ phận
(đầu, thân, tay, chân) là một `Rigidbody2D` + `Collider2D`, nối với nhau bằng joint
(thường là `HingeJoint2D`). Khi nhân vật chết/bị đánh bay, tắt animation và để physics
điều khiển → chuyển động "bún" tự nhiên.

## 2. Cấu tạo một ragdoll 2D chuẩn

### Thành phần mỗi part
| Component | Setting khuyến nghị |
|---|---|
| `Rigidbody2D` | mass ≈ nhau giữa các part (chênh tối đa 2x); Interpolate = Interpolate nếu camera bám theo |
| `CapsuleCollider2D` | cho tay/chân/thân (khớp hình dáng tốt hơn Box) |
| `CircleCollider2D` | cho đầu |
| `HingeJoint2D` | nối part con → Rigidbody2D part cha |

### Cây joint (giống dự án này)
```
bodyRagdoll (gốc, không joint)
├── headRagdoll   → hinge về body, limits [-60, 90]
├── armL/armR     → hinge về body (tự do)
│   └── handL/handR → hinge về arm
└── legL/legR     → hinge về body
    └── footL/footR → hinge về leg
```

### Setting joint quan trọng
- `Enable Collision` = **false** (các part nối nhau không va chạm nhau)
- `Auto Configure Connected Anchor` = false, set anchor tại vị trí khớp (vai, cổ, háng...)
- `Use Limits`: đầu nên giới hạn (VD [-60, 90]) để không xoay vòng tròn;
  các chi có thể để tự do cho hiệu ứng "bún", hoặc giới hạn theo giải phẫu nếu muốn thật
- **Limit quá hẹp (< 5–15°) gây jitter** — muốn khóa trục thì set limit = 0 hẳn
- `Break Force/Torque` = Infinity (không muốn rời khớp) hoặc giá trị hữu hạn nếu muốn đứt tay chân

## 3. Chuyển đổi Animation ↔ Ragdoll (pattern của dự án)

### Cách dự án này làm (2 bản thể - swap)
Nhân vật có 2 nhóm:
- **Sprite group**: bone + SpriteSkin + Animator (khi sống)
- **Ragdoll parts**: nằm INACTIVE bên trong các bone (để tự động khớp vị trí/góc theo pose
  hiện tại của animation), mỗi part có SpriteRenderer riêng

Khi chết (`StickmanController.TakeDamage`):
```csharp
_isDie = true;
_rigBody.simulated = false;                    // tắt physics root
foreach (part in ragdollParts) {
    part.parent = ragdollGroup;                // reparent ra ngoài bone hierarchy
    part.SetActive(true);                      // bật Rigidbody2D + joint
}
ragdollGroup.SetActive(true);
spriteGroup.SetActive(false);                  // tắt bản animation
headRagdoll.AddForce(hitDir * 10, ForceMode2D.Impulse);  // đẩy theo hướng trúng đòn
```

**Điểm hay của pattern này:** vì ragdoll parts là con của bone, chúng thừa hưởng đúng pose
tại thời điểm chết → không bị "teleport" về T-pose. Reparent ra group riêng để joint
không bị transform bone (đang bị Animator ghi đè) kéo lại.

### Cách khác (tham khảo)
- **1 bản thể**: cùng skeleton, bật/tắt `Animator.enabled` và `Rigidbody2D.simulated`.
  Gọn hơn nhưng SpriteSkin + physics dễ conflict.
- **Active ragdoll**: ragdoll luôn simulate, dùng motor/AddTorque kéo về pose animation
  (xem GitHub: Hairibar.Ragdoll, sergioabreu-g/active-ragdolls). Đẹp nhất nhưng khó tune.

## 4. Chống jitter / tách khớp (Unity Manual: Joint and Ragdoll stability)

1. Mass các Rigidbody nối joint không chênh quá ~2x (10x là jitter chắc chắn)
2. Không scale ≠ 1 trên transform có Rigidbody/Joint (dự án này root scale 0.3 —
   scale ĐỀU và ở root, các part scale 1 → chấp nhận được, nhưng tránh scale lệch)
3. Tăng `Project Settings > Physics 2D > Velocity Iterations` lên 10–20 nếu khớp lỏng
4. Bật `Interpolate` trên Rigidbody2D nếu hình giật (nhất là khi camera follow)
5. Không set Transform trực tiếp trên body đang simulate — dùng `MovePosition/MoveRotation`
6. Joint limit quá hẹp → jitter; lock hẳn (0°) hoặc nới ≥ 5–15°
7. Va chạm tốc độ cao xuyên collider → đổi `Collision Detection` = Continuous cho part nặng

## 5. Layer & collision matrix

- Tạo layer riêng `Ragdoll` cho các part, tắt va chạm Ragdoll×Ragdoll trong
  `Physics 2D > Layer Collision Matrix` nếu muốn các nhân vật chết không vướng nhau
- Dự án hiện để tất cả layer Default — chạy được vì `EnableCollision` off trong joint,
  nhưng nhiều ragdoll cùng lúc sẽ va nhau → cân nhắc layer riêng khi làm game đông NPC

## 6. Unity 6.3+ / 6.5: Physics Core 2D (Box2D v3)

- Unity 6.3 thêm low-level 2D physics API mới trên nền **Box2D v3** (multithreaded,
  deterministic hơn); Unity 6.5 đổi tên `LowLevelPhysics2D` → `PhysicsCore2D`
  (namespace `Unity.U2D.Physics`, asset `PhysicsCoreProjectSettings2D.asset`)
- Code `Rigidbody2D/HingeJoint2D` cũ vẫn chạy bình thường (backward compatible) —
  KHÔNG cần migrate; chỉ dùng API mới khi cần hiệu năng cực cao (hàng nghìn body)
- API đổi tên đáng chú ý từ Unity 6: `velocity` → `linearVelocity`,
  `drag` → `linearDamping`, `angularDrag` → `angularDamping`, `isKinematic` → `bodyType`

## 7. Checklist tạo ragdoll cho stickman mới

1. Rig sprite bằng Skinning Editor (2D Animation package): tạo bone, auto-weight
2. Dựng bone hierarchy trong scene, thêm `SpriteSkin` cho mỗi part (hoặc cả nhân vật)
3. Thêm IK: `IKManager2D` ở root bone + `LimbSolver2D` cho mỗi tay/chân, target đặt trong SolverGroup
4. Tạo ragdoll part INACTIVE trong mỗi bone: SpriteRenderer (copy sprite + sorting order),
   Rigidbody2D, Capsule/CircleCollider2D, HingeJoint2D nối về part cha
5. Set anchor joint tại khớp; head limit [-60, 90]; EnableCollision off
6. Gắn `StickmanController` ở root: wire `_ragdollObjects[]`, `_groupSpriteGroup`,
   `_groupRagdollGroup`, `_headRagdoll` (tự tìm theo tên "head" nếu bỏ trống)
7. Test: gọi `TakeDamage(hướng)` → ragdoll phải giữ nguyên pose lúc chết rồi đổ xuống

## Nguồn

- Unity Manual — Joint and Ragdoll stability: https://docs.unity3d.com/Manual/RagdollStability.html
- Unity Manual — Hinge Joint 2D: https://docs.unity3d.com/Manual/class-HingeJoint2D.html
- Unity Learn — Creating Ragdolls: https://learn.unity.com/tutorial/creating-ragdolls-2019
- Unity Discussions — Transition from 2D bone-based animation to ragdoll: https://discussions.unity.com/t/transition-from-2d-bone-based-animation-to-ragdoll/225085
- Unity Discussions — Combine ragdoll physics + skeletal animation 2D: https://discussions.unity.com/t/how-to-combine-ragdoll-physics-and-skeletal-animation-in-2d/859763
- Unity Discussions — Physics Core 2D in Unity 6.5: https://discussions.unity.com/t/physics-core-2d-in-unity-6-5/1715178
- Hairibar.Ragdoll (keyframed + physics): https://github.com/hairibar/Hairibar.Ragdoll
- Active ragdolls (3D nhưng cùng nguyên lý): https://github.com/sergioabreu-g/active-ragdolls
