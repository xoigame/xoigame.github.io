# Prompt Particle Effect — thiết kế và cách dùng

## Mục tiêu

`Prompt Particle Effect` là tool Editor để đi từ một mô tả ngắn tới một effect có thể dùng
ngay trong hệ VFX hiện tại:

```text
prompt
  → recipe có giới hạn
  → texture PNG procedural
  → material + shader
  → prefab ParticleSystem nhiều lớp
  → EffectInstance + metadata + JSON thông số
  → (tuỳ chọn) EffectLibrary
```

Mở tại `Tools > Stickman > Nâng cao > Effects > Prompt Particle Effect`, hoặc tab
`Động tác · Effect · Tiếng` trên `Tools > Stickman > ★ Bảng điều khiển`.

## Vì sao MVP dùng prompt compiler thay vì gọi LLM trực tiếp

Unity Editor không nên giao cho một model tự do tạo component/asset. Một prompt compiler
deterministic có ba lợi ích:

1. asset luôn có cấu trúc đúng `EffectInstance` + ParticleSystem;
2. thông số được clamp, tổng burst tối đa 160 hạt;
3. không cần API key, mạng hoặc xử lý lỗi JSON trong lúc đang build asset.

Sau này có thể thêm adapter LLM, nhưng adapter chỉ được trả về JSON theo schema recipe rồi
đưa qua cùng `Parse`/`ClampLayers`/`BuildPrefab`; không cho model gọi `AssetDatabase` trực tiếp.

## Từ khóa hiện có

| Nhóm | Ví dụ |
|---|---|
| recipe | `lửa/fire`, `khói/smoke`, `tia/spark`, `phép/magic`, `máu/blood`, `bụi/dust`, `nổ/explosion`, `chém/slash` |
| màu | `đỏ/red`, `xanh dương/blue`, `xanh lá/green`, `tím/purple`, `vàng/gold`, `trắng/white` |
| cỡ/nhịp | `nhỏ/small/tiny/nhanh`, `lớn/large/huge/khổng lồ` |
| event | `hit/trúng`, `block/đỡ`, `hurt/dính đòn`, `death/chết`, `pickup/nhặt`, `spawn/xuất hiện`, `explosion/nổ` |

Ví dụ:

```text
lửa cam nổ kèm tia sáng lớn
khói xanh độc bay chậm
purple magic burst with bright sparks
small blood hit
```

## Asset sinh ra

Mỗi lần build có cùng tên sẽ cập nhật đúng bộ generated asset:

- `Assets/Sprites/Effects/PromptGenerated/<name>_Core.png`
- `Assets/Sprites/Effects/PromptGenerated/<name>_Spark.png`
- `Assets/Materials/Effects/PromptGenerated/<name>_Core.mat`
- `Assets/Materials/Effects/PromptGenerated/<name>_Spark.mat`
- `Assets/Prefabs/Effects/PromptGenerated/<name>.prefab`
- `Assets/Settings/ParticleEffects/<name>.json`
- `Assets/Settings/ParticleEffects/LastBuild.json`

Prefab dùng `Sprites/Default` làm shader mặc định theo quy ước particle của project. Particle
nhận `startColor` và `colorOverLifetime`, còn texture đã có alpha mềm nên không cần tạo thêm
một hệ shader additive dễ lệch giữa pipeline. Mỗi child ParticleSystem xoay `-90°` quanh X,
`simulationSpace = World`, renderer nằm trên sorting layer `character` và có order cao hơn
nhân vật.

## Tích hợp gameplay

Nếu bật `Gắn vào dòng fallback của EffectLibrary`, tool sẽ thay fallback chung của event đã
chọn và giữ nguyên các dòng riêng theo `WeaponClass`. Gameplay vẫn gọi:

```csharp
EffectManager.Play(EffectEvent.Hit, point, direction);
```

Không `Instantiate` prefab effect trực tiếp. `EffectManager` tiếp tục là mặt tiền và pool.
`EffectInstance` đã được bổ sung reset/play/clear cho ParticleSystem khi object tái sử dụng
từ pool.

## Kiểm tra trước khi bàn giao

1. Chạy tool và mở prefab sinh ra; kiểm tra child particle có Material, không để trống.
2. Chạy một scene có `EffectManager`, gọi đúng `EffectManager.Play` và kiểm tra effect tái sử dụng
   nhiều lần không giữ hạt cũ.
3. Tắt/bật `Gắn vào EffectLibrary` để kiểm tra cả hai workflow.
4. Mở `★ Bảng điều khiển`: `Prompt → Particle Effect` phải đỏ khi xoá `LastBuild.json`,
   xanh sau khi build, vàng khi sửa builder/runtime source.
5. Chạy `Rig & Kiểm tra` và test mobile/PC; giới hạn 160 hạt chỉ là guardrail, không thay thế
   profiling trên thiết bị thật.

## Giai đoạn tiếp theo

- thêm `IParticlePromptProvider` ở Editor để nhận JSON từ LLM/asset file mà không phụ thuộc
  nhà cung cấp;
- thêm preview scene chuyên dụng có play/stop, scrub thời gian và slider burst/lifetime;
- thêm preset `ring`, `trail`, `beam`, `shockwave` khi gameplay có nhu cầu thật;
- nếu cần art raster bespoke, dùng ảnh tham chiếu hoặc ImageGen bên ngoài rồi đưa vào thư mục
  art nguồn; compiler chỉ giữ phần material/particle wiring và không ghi đè art người dùng.
