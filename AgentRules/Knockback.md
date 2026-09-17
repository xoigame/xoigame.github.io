## Lực hất khi trúng đòn — CÓ TRẦN, VÀ THANG PHẢI NÉN

`StickmanController.ApplyImpulse` (part trúng đòn) + `ApplyDeathBodyImpulse` (hất cả thân) là
hai chỗ đẩy **ragdoll** của nhân vật: cú đánh KẾT LIỄU và cái xác. Người còn sống không nhận
impulse vào part; lùi khi trúng đòn do `StickmanLocomotion.ApplyHitRecoil` điều khiển thân,
có trần và tắt dần theo hit-stun. Xem [HitReaction](HitReaction.md); không thêm `AddForce` vào rig sống.

⚠⚠ **BẢNG `knockback` KHÔNG PHẢI VẬN TỐC — ĐỪNG NHÂN THẲNG.** Bản cũ làm đúng vậy và không có
trần nào: búa cận chiến (`knockback` 3.0) cho part trúng đòn `3 × _hitForceMultiplier(10)` =
**30 u/s**, cộng cú hất cả thân thành 37.5. Nhân vật cao 0.73 và chạy ~3 u/s, nên cái xác bay
**121 đơn vị = 166 lần chiều cao chính nó**, vượt xa cả bề ngang map. Đó là câu *"một số vũ khí
làm bay nhân vật quá mạnh"*.

Ba vế, và vế nào cũng cần:

| Vế | Là gì | Vì sao |
|---|---|---|
| `ShapeImpactScale` | nén thang: `knockback^0.4` | Mắt đọc lực hất theo **TẦM BAY**, mà tầm bay đi theo **BÌNH PHƯƠNG** vận tốc. Bảng trải 0.4→3.0 (7.5 lần) để thẳng là quãng bay chênh **56 lần**: chỉ còn hai loại đòn, "gãi nhẹ" và "bắn tên lửa" |
| `ImpactTuning` (0.21) | hằng số nhân **lúc ĐỌC** `_hitForceMultiplier` | Field đó là SERIALIZED, số 10 đã bake vào `Character.prefab` + mọi variant + lính của 44 scene. Đổi default trong code thì **không có gì đổi cả** — cùng bẫy "sửa bug bằng đổi mặc định" |
| `MaxImpactSpeed` 4 / `MaxBodyLaunchSpeed` 5 | trần tuyệt đối | VAN AN TOÀN cho vũ khí cấp 5 / hệ số nổ / prefab gõ nhầm |

⚠ **TRẦN PHẢI ĐẶT CAO HƠN MỌI VŨ KHÍ TRONG BẢNG.** Bản chỉnh đầu để trần 4.9 và nó CẮN từ chuỳ
trở lên — chuỳ · búa ném · bắn tỉa · đao dài · khiên · búa cận chiến ra **cùng một con số**, cân
bằng xong thì sáu vũ khí nặng hất giống hệt nhau. Việc nén thang là của `ShapeImpactScale`; trần
chỉ để chặn giá trị điên rồ.

⚠ **KHUNG NHÌN LÀ THỨ CHỐT SỐ, không phải cảm giác.** Cỡ nhìn chuẩn
(`StickmanCameraZoom.DesignViewHeight` 5.0, 16:9) chỉ thấy **~8.9 đơn vị** bề ngang — xác bay xa
hơn nửa con số đó là ra khỏi màn hình và người chơi không thấy đòn của mình ăn vào đâu. Mốc đã
chọn: nhẹ nhất ~0.9 đơn vị, nặng nhất ~4.4 (nửa khung hình), chênh nhau 5 lần về tầm bay.

⚠ **`Explosion` là nhánh THỨ HAI và nó từng bị bỏ sót cả hai vế**: không nhân `mass` (cái đầu
mass 0.5 bay nhanh GẤP BA cái thân 1.6 → bom xé xác ra rồi bắn cái đầu đi mất) và không có trần.
Thêm nguồn đẩy mới thì phải đi qua đúng hai hằng số trên.
