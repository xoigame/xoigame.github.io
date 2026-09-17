## Ragdoll physics rules (từ Unity manual + kinh nghiệm các project)

- Mass các part chênh nhau tối đa ~2x (hiện tại tất cả = 1, ổn)
- HingeJoint2D: mỗi part con connect về part cha (hand→arm→body, foot→leg→body, head→body)
- Head joint dùng limits [-60, 90]; các joint khác để tự do hoặc limit ≥ 5–15°
  (limit quá nhỏ gây jitter — hoặc lock hẳn về 0)
- `Enable Collision` giữa các part nối joint = OFF (tránh tự đá nhau)
- Bật `Interpolate` trên ragdoll parts nếu thấy giật hình
- Nếu ragdoll giật/tách khớp: tăng `Physics2D velocityIterations` lên 10–20
- Đừng scale khác 1 trên transform chứa Rigidbody2D/Joint
- Di chuyển nhân vật sống bằng `Rigidbody2D.MovePosition/MoveRotation` hoặc velocity — không set Transform trực tiếp

