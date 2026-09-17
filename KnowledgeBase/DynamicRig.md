# Dynamic Rig 2D — nghiên cứu và cách dùng

Ngày ghi nhận: 2026-09-11.

## Kết luận ngắn

Rig hiện tại đã có nền phù hợp để làm dynamic pose: SpriteSkin biến dạng sprite theo bone Transform,
2D IK giải chuỗi bone hướng tới target, còn code dự án đã quy định target là nơi animation ghi. Vì
vậy lớp tích hợp đầu tiên nên là secondary-motion chạy qua hai owner hiện có, không thêm một hệ rig
thứ ba tranh quyền ghi Transform.

Unity Animation Rigging là package constraint rig riêng, hợp cho rig 3D/world interaction; nó không
phải điều kiện cần để tạo quán tính cho stickman 2D. Active ragdoll cũng là bài toán khác: nó phải
được kiểm riêng về mass/joint/solver và xung đột với SpriteSkin. Hai hướng đó chưa bật trong prefab
gốc.

Nguồn Unity: [2D IK](https://docs.unity3d.com/Packages/com.unity.2d.animation@15.1/manual/2DIK.html),
[SpriteSkin](https://docs.unity3d.com/Packages/com.unity.2d.animation@15.1/manual/SpriteSkin.html),
[Animation Rigging](https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.3/manual/index.html),
[Two Bone IK](https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.3/manual/constraints/TwoBoneIKConstraint.html),
[Ragdoll stability](https://docs.unity3d.com/Manual/RagdollStability.html).

## Bằng chứng từ project

- Unity Editor: `6000.5.9f1`; package trực tiếp `com.unity.2d.animation 15.1.0`.
- `Character.prefab` có `Animator` + `IKManager2D` + bốn `LimbSolver2D`; `AutoRebind` đang tắt.
- `StickmanProceduralAnimator` là owner của IK tay, đầu và vũ khí; `StickmanLegWalker` là owner
  của IK chân và `body_1`; `StickmanBodyAnimator` giao pose xuống hai owner này.
- Scene Editor đang mở lúc tích hợp là `Demo_40_StructureKit`, không có nhân vật/bone để chạy
  visual test; không mở scene khác và không làm bẩn scene người dùng.
- `com.unity.animation.rigging` không có trong `Packages/manifest.json`. Không cài vì POC này dùng
  2D IK sẵn có. `com.unity.pipeline 0.6.0-exp.1` đã được cài để Unity CLI skill điều khiển Editor.

## Slice đã tích hợp

`Assets/Scripts/Combat/Rig/StickmanDynamicRig.cs`:

1. Đọc `Rigidbody2D.linearVelocity`, lấy delta theo frame thành gia tốc.
2. Tạo ngả thân theo gia tốc dọc hướng nhìn, có trần 5 độ.
3. Đổi gia tốc sang local space của `boneHead`, đảo chiều để tạo trễ tay, có trần 0.06 rig unit.
4. Dùng `SmoothDamp`, không cấp phát và không Raycast mỗi frame.
5. Gọi `SetDynamicBodyLean` và `SetDynamicArmOffset`; action weight nhường phần tay bị pose khác
   chiếm. Khi chết, tắt hoặc Rigidbody không mô phỏng thì tín hiệu trở về 0.

`Assets/Editor/Rig/StickmanDynamicRigBuilder.cs` thêm nút:

`Tools > Stickman > Nâng cao > Rig & Kiểm tra > Thêm dynamic rig vào Character`.

Builder mở prefab bằng `PrefabUtility`, thêm component tối đa một lần, resolve wiring và lưu lại;
không sửa YAML bằng shell. Component đã được gắn vào `Character.prefab` qua menu Unity live.

## Cách tiếp tục trong các task sau

1. Đọc [DynamicRig.md](../AgentRules/DynamicRig.md), [Rig.md](../AgentRules/Rig.md),
   [RigInvariants.md](../AgentRules/RigInvariants.md), [Animation.md](../AgentRules/Animation.md)
   trước khi sửa.
2. Kiểm tra `git status --short` trong phạm vi; giữ thay đổi người dùng.
3. Nếu Editor mở, chạy `unity status`/`unity pipeline list` rồi dùng `unity list` để tìm command.
   Recompile bằng Unity CLI; nếu Editor đang có thay đổi chưa lưu thì không tự kill/restart theo PID.
4. Dùng builder để gắn/cập nhật prefab, `get_component_properties` để proof wiring, sau đó Verify +
   Doctor/Validate Rig. Chỉ Play/ảnh khi có scene nhân vật phù hợp.

## Lộ trình chưa làm

- Pha 2: recoil/hit impulse qua API đã có của `StickmanProceduralAnimator`, kèm kiểm tra hit-stun và
  không nhân đôi với `HitReaction`.
- Pha 3: airborne/landing secondary pose qua `StickmanBodyAnimator`, không ghi root từ component mới.
- Pha 4: active ragdoll chỉ trong proof scene riêng, có bảng mass/joint/solver, benchmark và nút
  bật rõ ràng; không mặc định đưa vào Character.
