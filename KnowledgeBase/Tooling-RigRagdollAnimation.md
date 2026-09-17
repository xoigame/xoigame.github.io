# Tool Pipeline: Rig → Ragdoll → Animation → Skin Swap

> Toàn bộ tool tự viết trong `Assets/Editor/`, data asset trong `Assets/Scripts/Rig/`.
> Menu: **Tools > Stickman**. Cập nhật: 2026-08.

## 0. Cơ chế nền — 2 sự thật quyết định mọi thứ

**(1) SpriteSkin nối xương THEO CHỈ SỐ.**
`spriteSkin.boneTransforms[i]` ứng với `sprite.GetBones()[i]`.
→ Sprite mới chỉ cần rig **đúng số bone + đúng thứ tự** là vào rig ngay, khỏi cấu hình.
Rig hiện tại: mỗi part 1 bone, riêng `body` 2 bone (`body_1`, `body_2`).

> ⚠️ **KHÔNG bật AutoRebind** trên rig này. AutoRebind khớp bone theo *tên*
> (hoặc guid của component `Bone`). Sprite của dự án đặt tên bone là `bone_1`/`bone_2`
> còn transform tên `armL`/`body_1`… → không khớp → SpriteSkin sẽ **xoá binding** và log
> `Rebind failed`. Cứ để tắt, bind theo chỉ số vẫn chạy đúng.

**(2) Animation KHÔNG xoay từng xương — nó animate IK target.**
Curve chỉ nằm trên (đường dẫn theo **rig chuẩn**, xem `StickmanRigPaths`):
| Path | Attribute |
|---|---|
| `body_1` | `localEulerAnglesRaw.z` |
| `body_1/body_2/boneHead` | `localEulerAnglesRaw.z` |
| `body_1/body_2/boneHead/IKArmL` | `m_LocalPosition.x/y` |
| `body_1/body_2/boneHead/IKArmR` | `m_LocalPosition.x/y` |
| `SolverGroup/Solver_legL/IKLegL` | `m_LocalPosition.x/y` |
| `SolverGroup/Solver_legR/IKLegR` | `m_LocalPosition.x/y` |

IK **tay** là con của `boneHead` → xoay đầu để ngắm thì tay đi theo (cung/súng luôn đúng hướng).
IK **chân** dưới `SolverGroup` → chân độc lập với hướng ngắm.

> Clip cũ `Walk_1/Run_1/Kick1/Idle_1` + `characterController.controller` **đã bị xoá**
> (trỏ vào rig cũ, không dùng lại được). Animator trên `Bone` hiện để trống controller.
> Bake clip mới bằng `StickmanAnimationRecipe` rồi tự tạo Animator Controller.
> Cần lấy lại clip cũ để tham khảo: `git show 4425a9e:Assets/Animator/Walk/Walk_1.anim`

`LimbSolver2D` tự giải xương tay/chân. → 1 pose = **10 con số** thay vì xoay 10 khúc xương.
Đó là lý do có thể sinh animation từ ảnh tham chiếu.

---

## 1. Ragdoll — tool hoá

**Asset:** `StickmanRagdollDefinition` (Create > Stickman > Ragdoll Definition)
Mô tả từng part: bone nào, mass, collider gì, nối về đâu, giới hạn góc.

**Tạo bộ mặc định:** `Tools > Stickman > Create Default Humanoid Ragdoll Definition`
→ 10 part người, mass theo tỉ lệ cơ thể thật, góc khớp giải phẫu
(khuỷu `0/145`, gối `-145/0`, cổ `-40/40`, vai `-60/180`, háng `-20/120`).

**Dựng ragdoll:** chọn nhân vật → `Tools > Stickman > Build or Refresh Ragdoll` → chọn definition.

Tool tự làm:
- Tạo `<bone>Ragdoll` **nằm trong bone**, inactive → giữ đúng pose lúc chết
- `Rigidbody2D` (mass/damping/interpolate/collision mode)
- Collider (Capsule/Circle/Box) theo định nghĩa
- `HingeJoint2D` nối về part cha, **anchor TỰ TÍNH** từ vị trí bone:
  `anchor = part.InverseTransformPoint(bone.position)`,
  `connectedAnchor = parent.InverseTransformPoint(bone.position)`
  → tâm khớp chính xác, khớp không "trôi" (đây là phần tay hay làm sai nhất)
- Copy sprite + sorting order từ part Skin cùng tên
- Wire lại mảng `_ragdollObjects` trên `StickmanController`

Chạy lại tool bất cứ lúc nào = refresh (idempotent, không tạo trùng part).

---

## 2. Animation — tool hoá

**Asset:** `StickmanAnimationRecipe` (Create > Stickman > Animation Recipe)
= danh sách `Key { time, StickmanPose }` + frameRate + loop.

`StickmanPose` = `bodyAngle`, `headAngle`, `ikArmL`, `ikArmR`, `ikLegL`, `ikLegR`.

**Workflow tay (pose → clip):**
1. Kéo nhân vật (đang trong scene) vào ô **Character** trên Inspector của recipe
2. Trong Scene View kéo IK target (`IKArmL`, `IKLegR`…) cho ra pose
3. Đặt **Capture at time** → bấm **Capture Pose → add key** (time tự +0.25s mỗi lần)
4. Bấm nút tên pose để **preview** lại pose đó lên nhân vật
5. **Bake Clip** → sinh `.anim` vào `Assets/Animator/Generated/`

Bake lại đè lên clip cũ **giữ nguyên GUID** → Animator đang tham chiếu không bị đứt.

**Workflow "gửi ảnh → ra clip":**
Đưa ảnh tham chiếu (sprite sheet các pose, hoặc ảnh chuỗi động tác). Tôi đọc ảnh,
ước lượng `bodyAngle` + 4 vị trí IK cho từng pose, rồi ghi thẳng vào recipe asset.
Bạn bấm Bake là ra clip. Đây là **first pass** — vẫn nên preview từng key rồi chỉnh tay,
không phải motion capture.

**Số key thường dùng:** walk/run 4 key (contact → down → passing → up), idle 2–3 key,
attack 3–4 key (anticipation → strike → follow-through).

---

## 3. Skin swap — đổi hình giữ rig

**Asset:** `StickmanSkinSet` (Create > Stickman > Skin Set) = map `partKey → Sprite`.
**Component:** `StickmanSkinBinder` trên root nhân vật.

1. Bấm **Rebuild Bindings** → quét mọi `SpriteRenderer` con, kể cả ragdoll đang tắt
   (tự strip hậu tố `Ragdoll`, tự map `hand`→`handR`, `foot`→`footR`)
2. Gán **Skin Set** → sprite apply ngay trong editor lẫn lúc `Awake`
3. **Check SkinSet Compatibility** → báo part nào sprite mới sai số bone

Đổi toàn bộ ngoại hình nhân vật = đổi 1 ô SkinSet.
Part ragdoll là `SpriteRenderer` thường → sprite nào cũng được, không cần rig.

**Rig art mới cho part có SpriteSkin:** dùng **Copy/Paste rig** trong Skinning Editor
(copy từ sprite cũ sang sprite mới) → giữ nguyên số bone, thứ tự, tên, guid.

---

## 4. Bảng tra nhanh menu

| Menu | Làm gì |
|---|---|
| Create Demo Character Prefab | Sinh `DemoStickman.prefab` + SkinSet mặc định từ `Character.prefab` |
| Create SkinSet from Selection | Chụp sprite hiện tại của nhân vật thành SkinSet asset |
| Enable AutoRebind on Selection | (hiếm dùng — chỉ khi tên bone sprite khớp tên transform) |
| Build or Refresh Ragdoll | Dựng/cập nhật toàn bộ ragdoll từ definition |
| Create Default Humanoid Ragdoll Definition | Sinh definition mẫu 10 part |
| Validate Rig (Selection) | Báo lệch số bone, boneTransforms null, AutoRebind nguy hiểm |
| Check SkinSet Compatibility | Sprite trong SkinSet có swap được không |

Nút tương đương nằm sẵn trong Inspector của `StickmanSkinBinder` và `StickmanAnimationRecipe`.

---

## 5. Giới hạn — cái gì tool KHÔNG làm được

- **Rig sprite (vẽ bone + geometry + weight paint)** phải làm tay trong Skinning Editor.
  Unity không mở API cho bước này; tool chỉ lo phần hierarchy/ragdoll/animation.
- **Sinh animation từ ảnh** là ước lượng, không phải mocap — luôn cần chỉnh lại bằng preview.
- Tool đọc bone theo **tên**; đổi tên bone trong rig thì phải sửa definition tương ứng.

## Nguồn

- SpriteSkin API & rebind: `Library/PackageCache/com.unity.2d.animation@*/Runtime/SpriteSkin.cs`,
  `SpriteSkinHelpers.GetSpriteBonesTransforms`
- Actor skinning workflow: https://docs.unity3d.com/Packages/com.unity.2d.animation@10.0/manual/CharacterRig.html
- AnimationClip.SetCurve: https://docs.unity3d.com/ScriptReference/AnimationClip.SetCurve.html
- AnimationUtility.SetAnimationClipSettings: https://docs.unity3d.com/ScriptReference/AnimationUtility.SetAnimationClipSettings.html
