## Nâng nhóm `Sprite` = nâng luôn CHÂN ĐẾ VẬT LÝ

`groundCollider` nằm ở `Character → Sprite → Collider → groundCollider`. Mà nhiều thứ nâng
nhóm `Sprite` lên (rõ nhất: `StickmanMount.RaiseRider` cho kỵ sĩ ngồi lên yên).

Nâng `Sprite` → collider lên theo → nhân vật lơ lửng → trọng lực kéo root TỤT XUỐNG đúng
quãng vừa nâng → mọi thứ khác treo dưới `Sprite` (con ngựa!) chìm theo. Đo thật: lún 0.311,
bằng **97% chiều dài chân ngựa** — đúng triệu chứng "ngựa thấp hơn mặt đường".

Chữa: nâng hình bao nhiêu thì hạ collider ngần ấy — `StickmanLocomotion.SetVisualLift(lift)`
lúc nâng, `SetVisualLift(0)` lúc trả về.

**Trước khi nâng BẤT KỲ nhóm nào của rig, hỏi: trong đó có collider vật lý không?**

