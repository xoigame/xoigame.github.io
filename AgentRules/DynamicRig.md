## DYNAMIC RIG — LUẬT CHO SECONDARY-MOTION 2D

### 1. Định nghĩa trong project này

`DynamicRig` là lớp procedural tạo quán tính phụ cho rig stickman 2D: đọc vận tốc/gia tốc của
Rigidbody2D rồi đưa tín hiệu vào các owner IK hiện có. Nó không phải `active ragdoll`, không phải
Animator Controller, và không tự tạo một cây xương mới.

Hiện thực chuẩn là `StickmanDynamicRig` ở `Assets/Scripts/Combat/`, gắn vào prefab gốc
`Assets/Prefabs/Character.prefab`. Component này mặc định chỉ làm ngả thân nhẹ và trễ IK tay;
ragdoll khi chết vẫn do `StickmanController` quản lý.

### 2. Luật bắt buộc

- Không thêm `com.unity.animation.rigging` cho rig 2D này chỉ để né kiến trúc hiện có. Project dùng
  `com.unity.2d.animation` + `IKManager2D`/`LimbSolver2D`; Animation Rigging 3D là nhánh nghiên cứu
  riêng, chỉ mở khi có yêu cầu và một proof scene độc lập.
- Dynamic component không được ghi trực tiếp `IKArmL/L/R`, `IKLegL/R`, `body_1`, `boneHead`,
  SpriteSkin hay ragdoll Transform. Gọi API của owner: `StickmanProceduralAnimator` sở hữu tay,
  `StickmanLegWalker` sở hữu chân/thân, `StickmanBodyAnimator` chỉ giao pose qua API.
- Dynamic offset phải có trần, spring/settle hữu hạn, và nhường `action`, cầm hai tay, khiên, leo,
  chết. Không để secondary-motion phá pose gameplay hoặc chạy sau khi ragdoll bật.
- Dùng `Rigidbody2D.linearVelocity`/tín hiệu quãng đường thật theo đúng owner; không thêm Raycast/
  allocation mỗi frame để đo chuyển động nếu không có bằng chứng cần thiết.
- Không bật `SpriteSkin` Auto Rebind, không đổi hierarchy, PPU 100, root scale 0.25, thứ tự bone
  hoặc binding index để tạo hiệu ứng động.
- Gắn/cập nhật prefab bằng tool trong `Tools > Stickman > Nâng cao > Rig & Kiểm tra`; không sửa
  YAML prefab bằng tay cho thao tác lặp lại. Builder phải idempotent.
- Mọi thay đổi runtime mới nằm trong module cao nhất cần dùng (hiện tại Combat), file dưới 800 dòng;
  giữ class `MonoBehaviour` cùng file và không tạo script trần ở `Assets/Scripts/`.

### 3. Cửa kiểm tra trước bàn giao

1. `Verify.ps1 -Changed` cho mọi file code đã sửa.
2. Unity `recompile_status` không có lỗi; chạy Doctor/Validate Rig trước khi báo xong.
3. Kiểm tra prefab không có component dynamic trùng, không mất wiring IK/SpriteSkin, và dynamic
   tắt sạch khi `IsDie`/`Rigidbody2D.simulated == false`.
4. Nếu chưa có scene nhân vật để Play/nhìn trực tiếp, phải ghi rõ là compile + prefab proof, không
   gọi đó là kiểm thử hình ảnh.

### 4. Hướng mở rộng an toàn

Hit-recoil, airborne pose và active ragdoll là ba pha riêng. Mỗi pha cần API/metrics riêng và proof
scene trước khi đưa vào prefab gốc; không trộn vào `StickmanDynamicRig` bằng cách ghi Transform trực
tiếp.
