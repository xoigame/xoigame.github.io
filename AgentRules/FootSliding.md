## Chống TRƯỢT CHÂN (foot sliding)

**Nguyên nhân gốc — SẢI CHÂN phải khớp với quãng thân đi.** Bàn chân chạm đất suốt nửa chu kỳ
`cos(phase) ≤ 0`, lướt từ `+stride` về `−stride` = **2 × stride** trong không gian rig; ra thế
giới nhân thêm **tỉ lệ rig (0.25)**. Cùng lúc thân đi được `π / cadence` (không phụ thuộc tốc độ).

```
2 × stride × rigScale = π / cadence   →   stride = π / (2 × rigScale × cadence)
```

Số gõ tay cũ **quên nhân tỉ lệ rig 0.25**: đi bộ chân chỉ đi được **50%** quãng thân, đi lùi
còn **31%** → trượt như đi trên băng, LÚC NÀO CŨNG TRƯỢT chứ không riêng khi đánh.
`StickmanLegWalker._autoCalibrateStride` (mặc định BẬT) tự tính lại từ `cadence` +
`_ikLegL.lossyScale` → tỉ lệ 1.000× ở mọi kiểu bước, tự đúng cả với boss phóng to.

⚠️ **stride và cadence KHÔNG còn độc lập.** Muốn chạy trông hùng hổ hơn thì chỉnh
`stepHeight` + `bodyLean` (không ảnh hưởng trượt), ĐỪNG kéo dài `strideLength`.


`StickmanLegWalker` BỎ HẲN chu kỳ bước khi `_actionWeight >= 0.999` — nên động tác toàn thân
chiếm trọn chân trong lúc nhân vật đang đi là bàn chân đứng im còn thân vẫn trôi = **trượt như
đi trên băng**. Đó là lý do có `StickmanActionClip.legWeightWhileMoving`:

- **1.0** — động tác TỰ NÓ LÀ cách di chuyển (nhảy · rơi · bò · leo · đu dây · lăn · **bị nhốt**):
  chân đứng yên là đúng, người đang bay/bám chứ không bước
- **0.35** — ngồi · tiếp đất: hạ người là chính, chân vẫn phải bước nếu đang đi
- **0.15–0.2** — DÁNG THÂN thuần tuý (ra đòn · đỡ đòn · trúng đòn · đứng thở):
  nhường chân lại cho bước đi, chỉ giữ chút dáng tấn

`StickmanBodyAnimator.LegWeight()` nội suy theo `TravelSpeed / WalkSpeed` — đứng yên thì động
tác vẫn chiếm chân trọn vẹn, càng đi nhanh càng trả chân về cho bước đi. **THÂN và TAY giữ
nguyên độ đậm** nên đòn đánh không bị nhạt.

