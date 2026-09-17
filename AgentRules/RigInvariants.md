## Hai sự thật kỹ thuật KHÔNG được quên

1. **SpriteSkin bind theo CHỈ SỐ**: `boneTransforms[i]` ↔ `sprite.GetBones()[i]`.
   Sprite mới đúng số bone + thứ tự là vào rig ngay.
   **KHÔNG bật AutoRebind** — sprite dự án đặt tên bone `bone_1/bone_2` còn transform là
   `armL/body_1`, bật lên là SpriteSkin xoá binding + log `Rebind failed`.
2. **Animation animate IK target, không xoay xương**: curve chỉ nằm trên `body_1`
   (`localEulerAnglesRaw.z`) và 4 IK target (`m_LocalPosition.x/y`). Đường dẫn chuẩn
   trong `StickmanRigPaths`: tay = `body_1/body_2/boneHead/IKArmL|R`,
   chân = `SolverGroup/Solver_legL|R/IKLegL|R`.
   Clip cũ (Walk_1/Run_1/Kick1/Idle_1) và `characterController.controller` **đã bị xoá**
   vì trỏ vào rig cũ. Animator trên `Bone` đang để trống controller — bake clip mới
   bằng `StickmanAnimationRecipe` rồi tạo controller.
3. **Sprite PPU = 100, root prefab scale = 0.25.** Sprite cũ để PPU 300 + scale 0.3 —
   sai tỉ lệ so với rig chuẩn. Đừng đổi PPU của `stickman.png`.
   ⚠ **ĐỔI CỠ NHÂN VẬT THÌ NHÂN, ĐỪNG GÁN THẲNG `localScale`.** Root đang là **0.25**, nên
   `localScale = Vector3.one * 1f` KHÔNG ra "bằng lính thường" mà ra **GẤP 4 LẦN** — và
   không có lỗi nào báo, vì code làm đúng cái được bảo làm. Mẫu đúng là
   `ApplyArchetypeShared`: `npc.transform.localScale *= archetype.scaleMultiplier`.
   Đã dính 1 lần ở `StickmanZombieBuilder.BuildBreed` — cả năm loại zombie thành khổng lồ
   (loại `Brute` để 1.35 nên ra 5.4×). Nay biến thể zombie **bỏ hẳn trục cỡ người**: loại
   khác nhau ở CHỈ SỐ + MẶT, còn `localScale` thì variant KHÔNG đụng tới, cứ thừa hưởng base.

