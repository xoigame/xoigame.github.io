## Tech stack

- **Unity 6000.5.9f1** — kiểm tra `ProjectSettings/ProjectVersion.txt`.
  Bộ package 2D đi kèm: `2d.animation 15.1.0` + `2d.common 14.0.1` + `2d.spriteshape 15.0.3`,
  `ugui 2.5.0`, `multiplayer.center 1.0.1` (2 cái cuối = bản builtin của editor này).
  **Editor và bộ package 2D phải đi theo cặp.** Mở project bằng editor cũ hơn (VD 6000.0.x) là
  `com.unity.2d.common` vỡ compile ngay (`EntityId`, `SpriteFitInfo` không tồn tại ở bản cũ),
  và 3 module `physicscore2d` / `adaptiveperformance` / `vectorgraphics` cũng chưa có.
  Đổi editor → hạ/nâng package 2D tương ứng rồi xoá `Packages/packages-lock.json` cho nó resolve lại.
- **com.unity.2d.animation** (Unity 2D Animation package) — KHÔNG dùng Anima2D
  (Anima2D đã bị Unity khai tử từ 2021, thay bằng 2D Animation package)
- Rig: `SpriteSkin` + bone hierarchy + `IKManager2D` + `LimbSolver2D` (2D IK nằm trong package 2D Animation)
- Physics: `Rigidbody2D` + `HingeJoint2D` + `CapsuleCollider2D`/`CircleCollider2D` cho ragdoll

