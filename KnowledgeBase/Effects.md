# Hệ EFFECT (VFX) — đánh / trúng / đỡ / chết

Mục tiêu: **khai báo MỘT chỗ, cả game có effect**. Không đi cắm prefab hiệu ứng vào từng
cây vũ khí, từng nhân vật.

```
Chỗ xảy ra chuyện                EffectManager.Play(...)          EffectLibrary
  WeaponBase.PlayAttackFeedback  →  Attack   + lớp vũ khí   →  tra bảng → prefab
  WeaponBase.ApplyHit            →  Hit      + lớp vũ khí          ↓
  ProjectileController.OnTrigger →  Hit                        ObjectPool theo prefab
  StickmanController.TakeDamage  →  Block / Hurt / Death           ↓
  ProjectileController.Explode   →  Explosion                  EffectInstance chạy
  WeaponPickup                   →  Pickup                     (to dần + mờ dần + trôi)
```

## 1. Bốn mảnh ghép

| File | Việc |
|---|---|
| `Assets/Scripts/Combat/Effects/EffectLibrary.cs` | **Bảng**: `(sự kiện, lớp vũ khí) → prefab + cỡ + âm thanh`. ScriptableObject |
| `Assets/Scripts/Combat/Effects/EffectManager.cs` | **Mặt tiền + pool**: `EffectManager.Play(...)`, `ObjectPool` theo từng prefab |
| `Assets/Scripts/Combat/Effects/EffectInstance.cs` | **Một effect đang chạy**: to dần / mờ dần / trôi / xoay, hết giờ trả về pool |
| `Assets/Editor/Effects/StickmanEffectBuilder.cs` | **Tool 1 nút**: sinh sprite + prefab + ghi bảng |

`EffectEvent`: `Attack · Hit · Block · Hurt · Death · Explosion · Pickup · Spawn · Land ·
Collapse · Build · BuildComplete · Burn`.

⚠ Ba cái cuối thêm 2026-09-08, lấp ba chỗ TRƯỚC ĐÂY im lặng hoặc nổ nhầm hiệu ứng:

| Sự kiện | Chỗ gọi | Trước đây |
|---|---|---|
| `Build` | `ResourceNode.FinishTrip` (mỗi nhát búa / nhát rìu) | **chỉ có TIẾNG**, không một hạt bụi |
| `BuildComplete` | `ResourceNode.FinishConstruction` · `CampBuildSite.Raise` | dùng chung `Spawn` ⇒ khánh thành trôi qua không ai thấy |
| `Burn` | `BaseBuilding.OnHitForFire` | `Explosion` ⇒ mái nhà gỗ bắt lửa trông y hệt thùng thuốc súng |

Cùng ngày, `BaseBuilding.Die` đổi từ `Explosion` sang `Collapse` — `DestructibleTarget` đã dùng
`Collapse` từ lâu, nên hai đường phá công trình của game từng nổ ra hai hiệu ứng khác hẳn nhau
tuỳ vào việc nó được dựng bằng script nào.

⚠⚠ Thêm giá trị vào enum mà QUÊN bấm «Dựng bộ EFFECT (1 nút)» thì `Resolve` trả null và chỗ gọi
im lặng bỏ qua — không lỗi, không log, chỉ là không có gì nổ ra. Doctor «Sự kiện effect MỚI chưa
có dòng trong bảng» canh đúng bẫy này. Xem thêm [AgentRules/Lighting.md](../AgentRules/Lighting.md)
cho phần ÁNH SÁNG đi kèm (vụ nổ và chớp đầu nòng nay tự có đèn, khai một chỗ trong `EffectManager`).

## 2. Cắm là chạy

`Tools > Stickman > Effects > Build Effect Set (1 nút)` sinh ra:

- sprite placeholder → `Assets/Sprites/Effects` (vệt chém, tia va chạm, máu, chớp nòng, nổ, đỡ đòn, khói, lấp lánh)
- prefab effect → `Assets/Prefabs/Effects`
- **bảng** → `Assets/Resources/EffectLibrary.asset`

Bảng nằm trong `Resources` là có chủ ý: `EffectManager` tự nạp nó, và nếu scene chưa có
manager thì lần `Play` đầu tiên nó **tự dựng manager**. Nghĩa là scene nào cũng có effect,
kể cả scene bạn tự tạo tay. Muốn chỉnh số (cỡ pool, tắt effect) thì
`Tools > Stickman > Effects > Add Effect Manager to Scene` rồi sửa trong Inspector.

Tool dựng scene demo đã tự gọi bước này (`StickmanSceneUtils.EnsureAllAssets`).

Muốn tạo một effect particle mới từ mô tả, dùng `Tools > Stickman > Nâng cao > Effects >
Prompt Particle Effect` hoặc nút `Prompt → Particle Effect` trên ★ Bảng điều khiển. Tool
MVP nhận prompt Việt/Anh, sinh texture PNG + material `Sprites/Default` + prefab
ParticleSystem nhiều lớp + JSON thông số, rồi tuỳ chọn thay fallback trong `EffectLibrary`.
Chi tiết keyword, thư mục output và roadmap nằm ở
[ParticleEffectPromptTool.md](ParticleEffectPromptTool.md).

## 3. Sửa effect — 3 mức, chọn mức thấp nhất đủ dùng

| Muốn gì | Sửa ở đâu |
|---|---|
| Đổi HÌNH của một effect | thay `Sprite` trong prefab ở `Assets/Prefabs/Effects` |
| Đổi nhịp: sống bao lâu, to ra bao nhiêu, trôi lên hay không | `EffectInstance` trên chính prefab đó |
| Đổi effect cho **một lớp vũ khí** (VD súng ra khói khác) | thêm/sửa dòng trong `EffectLibrary` |
| Cắm effect RIÊNG cho đúng một cây vũ khí / một nhân vật | `_attackVfx` trên `WeaponBase`, `_deathVfx` trên `StickmanController`, `_explosionVfx` trên `ProjectileController` — **prefab riêng luôn thắng bảng chung** |

Dùng art thật: chỉ cần prefab có `EffectInstance`. Prefab `ParticleSystem` cũng được —
để `_lifetime` bằng thời gian hạt sống là xong (nhớ tắt `_fadeOut` nếu không có SpriteRenderer).

## 4. Bảng tra hoạt động thế nào

`EffectLibrary.Resolve(sự kiện, lớp vũ khí, có cầm vũ khí không)`:

1. tìm dòng **chỉ định đúng lớp vũ khí** (`anyWeapon = false`) → thắng
2. không có thì lấy dòng **dùng chung** (`anyWeapon = true`)
3. vẫn không có → trả null, chỗ gọi im lặng bỏ qua (không văng lỗi, không log rác)

Bảng mặc định do tool ghi ra:

| Sự kiện | Dùng chung | Riêng theo lớp |
|---|---|---|
| Attack | vệt chém | đao ngắn ×0.75 · búa lớn ×1.4 · giáo ×1.15 · **cung/súng → chớp nòng** · lao/bom → khói · khiên → tia va chạm |
| Hit | tia va chạm | búa lớn ×1.4 |
| Block | tia đỡ (xanh thép) | |
| Hurt | máu | |
| Death | máu ×2 | |
| Explosion | quả cầu lửa | |
| Pickup | lấp lánh | |
| Spawn | khói | |

## 5. Những chỗ dễ sai

| Triệu chứng | Nguyên nhân |
|---|---|
| Không thấy effect nào | chưa chạy `Build Effect Set`, hoặc xoá mất `Assets/Resources/EffectLibrary.asset` |
| Effect to bằng cả màn hình | nhân vật chỉ cao ~0.73 unit (rig scale 0.25) — cỡ effect chỉnh bằng `_startScale/_endScale` trên prefab và cột `scale` trong bảng, đừng scale prefab |
| Vệt chém quay ngược | `EffectInstance._alignToDirection` xoay theo `WeaponBase.AimDirection` = **aimDir của đòn vừa đánh**, không phải `transform.right` (rig lật bằng `localScale.x = -1` nên `right` không đổi chiều) |
| Effect bị che sau nhân vật | `sortingOrder` của SpriteRenderer trong prefab — nhân vật dùng 3..9 (xem `StickmanSorting`), effect nên ≥ 11 |
| Effect còn dính trên xác | `_followSpawner` đang bật; effect đứng yên tại chỗ nổ thì tắt nó đi |
| Muốn tắt hết để đo FPS | `EffectManager._muted` |

## 6. Thêm một sự kiện mới (VD: đỡ đòn hoàn hảo, hồi máu)

1. thêm giá trị vào `EffectEvent`
2. thêm dòng trong `StickmanEffectBuilder.BuildLibrary()` (hoặc thêm tay trong asset)
3. gọi `EffectManager.Play(EffectEvent.<mới>, vị trí, hướng, vũ khí)` ở chỗ xảy ra chuyện

Không sửa gì trong `EffectManager` — nó chỉ tra bảng và lấy pool.

---

## Hai sự kiện mới + NHUỘM MÀU trong bảng (2026-09-06)

`EffectEvent.Land` (tiếp đất) và `EffectEvent.Collapse` (công trình sập). Cả hai **dùng LẠI**
`Fx_Dust`, chỉ đổi `scale` và `tint`:

| Sự kiện | Prefab | Cỡ | Màu | Nổ ở đâu |
|---|---|---|---|---|
| `Land` | `Fx_Dust` | 0.55 | nâu đất | `StickmanLocomotion.UpdateGroundState`, tại **`FeetPosition()`** |
| `Collapse` | `Fx_Dust` | 2.6 | xám đá | `DestructibleTarget.OnDeath` |

`EffectLibrary.Entry` có thêm field `tint`. Vẽ hai prefab bụi gần giống hệt nhau thì mỗi lần
đổi bụi phải sửa cả hai, mà sót một cái thì **không có gì báo**.

⚠ **Nổ bụi ở CHÂN, không ở gốc transform** — gốc nằm ngang hông, nổ ở đó thì trông như nhân
vật bốc khói giữa bụng.

⚠ `EffectInstance.ApplyStep` **không được thoát sớm khi `_fadeOut` tắt** nữa: vòng lặp đó giờ
áp cả màu nhuộm, thoát sớm là riêng nhóm effect không tan dần (vệt chém, chớp đầu nòng) lặng
lẽ bỏ qua `tint`.

⚠ **Cổng vỡ KHÔNG nổ thêm bụi.** `Fortification : DestructibleTarget`, nên `OnDeath` bên đó đã
nổ `Collapse` ở đúng chỗ đó rồi; `VillageGate` chỉ thêm TIẾNG gỗ vỡ (`Gate/Break`).

⚠ Sự kiện mới cần bấm lại **`Effects > Build Effect Set (1 nút)`** — bảng `EffectLibrary.asset`
đã bake không tự có dòng mới, và thiếu dòng thì `Resolve` trả null rồi chỗ gọi im lặng bỏ qua.

---

## NĂM SỰ KIỆN "TRẬN ĐÁNH ĐỂ LẠI DẤU VẾT" (2026-09-09)

`EffectEvent.Stain · Casing · Ricochet · Heal · Splash`. Bảng ở
`StickmanEffectBuilder.Juice.cs`; hai chỗ khai chung nằm trong `EffectManager`.

| Sự kiện | Nổ ở đâu | Trước đây |
|---|---|---|
| `Stain` | `StickmanController.Die` → `BattleStains.Drop` (ở **bàn chân**) | mọi dấu vết của cái chết sống 0,35 s; đánh ba phút xong sân sạch như chưa có ai chết |
| `Casing` | `EffectManager.FlashLight` — **mọi phát súng**, khai một chỗ | súng không nhả vỏ đạn |
| `Ricochet` | `ProjectileController` → `ShotFeedback.Ricochet` (đạn KHÔNG cắm, KHÔNG nổ) | đạn đập vào tường đá ra hiệu ứng y hệt cắm vào người |
| `Heal` | `HealPickup.Consume`, `MedkitBag.Use` | được cứu và nhặt được đồ nổ ra CÙNG một hiệu ứng vàng |
| `Splash` | `WaterZone.OnTriggerEnter2D` | rơi xuống biển toé ra tia VÀNG của đòn đánh |

Cộng thêm hai thứ dùng LẠI hiệu ứng cũ, không thêm sự kiện nào:

- **Bụi khi chạy** — `StickmanFootsteps.KickDust` phát `Land` cỡ 0.34, CÁCH BƯỚC, chỉ khi chạy.
- **Hồi máu** — dùng lại `Fx_Sparkle` nhuộm xanh (`EffectLibrary.Entry.tint`).

### Bốn cái van của vũng máu (`BattleStains`)

⚠⚠ **TRẦN 22 VŨNG.** Một trận công thành có hơn trăm cái chết; không có trần thì mặt đất là một
tấm thảm đỏ đặc và pool của prefab đó ăn hết suất của mọi effect khác.

⚠ **KHOẢNG CÁCH TỐI THIỂU 0,42.** Chỗ hẹp (cổng thành, chân cầu thang) là chỗ chết nhiều nhất;
mười vũng chồng lên một điểm thì alpha cộng lại ra một vệt ĐEN TUYỀN, đọc ra là lỗi vẽ.

⚠⚠ **NỔ Ở BÀN CHÂN.** `info.point` nằm ngang ngực ⇒ vũng máu lơ lửng giữa không trung. Cùng bẫy
đã ghi ở `EffectEvent.Land`.

⚠⚠ **XẾP DƯỚI CHÂN NGƯỜI.** Prefab bộ chung dùng `sortingOrder = Effect` (25000) — nằm TRÊN mọi
thứ. Vũng máu phải ở `GroundMark` (−10), nên bộ này có hàm dựng prefab riêng nhận `sortingOrder`
TUYỆT ĐỐI (`BuildJuicePrefab`).

⚠ `Fx_Stain._lifetime` (26 s trong builder) phải KHỚP `BattleStains.Life`. Doctor «Vũng máu: hạn
dùng prefab khớp sổ BattleStains» đo hai số đó, vì chúng ở hai file khác nhau và sẽ trôi.

### Đèn đi kèm — khai trong `EffectManager`, không rải

`Block`/`Ricochet` → tia lửa (`Spark`) · `BuildComplete` → quầng ấm (`Flare`) · `Heal` → quầng
xanh · chiêu thức võ lâm lớn → `Flare` **nhuộm màu ngũ hành của phái** (qua `PlayTinted`).

⚠⚠ Chiêu nổ liên tục (`MartialHit`, `MartialQinggong`) **cố ý không chớp**: trần 24 suất của
`StickmanLightFlash` đầy liên tục thì mấy cú chớp ĐÁNG giá (nổ, đầu nòng) bị nuốt.
