# Archetype — làm nhân vật KHÁC BIỆT mà không cần rig sprite mới

> Trả lời: "sprite các nhân vật phải khác biệt, đủ cho tất cả mode; animation cũng phù hợp".
> Cập nhật: 2026-08.

## Vấn đề

Mọi lính đều là variant của `Character.prefab` → nhìn vào sân 20 người **giống hệt nhau**.
Không phân biệt nổi khiên với cung, lính thường với sát thủ; phe chỉ nhận ra nhờ cái cờ bé
tí trên đầu.

## Vì sao KHÔNG sinh sprite thân mới cho từng loại

`SpriteSkin` bind bone **theo CHỈ SỐ** (xem AGENTS.md mục 1). Sprite thân mới bắt buộc phải
rig đúng số bone + thứ tự trong **Skinning Editor** — Unity không mở API cho bước này, nên
**không sinh bằng code được**. Mỗi bộ thân mới = một buổi ngồi rig tay.

Nên khác biệt hình ảnh đến từ **4 tầng KHÔNG cần rig**, cả 4 đều sinh tự động:

| Tầng | Cơ chế | Ghi chú |
|---|---|---|
| 1. **Màu** | `StickmanArchetype.bodyTint` / `limbTint` | Rẻ nhất, mạnh nhất. Stick War phân biệt quân đúng bằng màu |
| 2. **Mặt + nón** | `StickmanAppearance` (overlay) | 4 mặt × 6 nón có sẵn |
| 3. **Trang bị** | `StickmanEquipment` | Giáp, khiên, mũ đắp thêm |
| 4. **Động tác** | `StickmanActionSet` | Nặng nề / nhanh nhẹn / boss — cùng bộ xương, khác chất |

Ai có sprite thân **rig sẵn** thì gắn thêm `CosmeticPart` — hệ đó thay hẳn hình bộ phận,
chồng lên 4 tầng trên được.

## `StickmanArchetype` — một asset = một loại nhân vật

Gói trọn: loadout (vũ khí/máu/trang bị) + AIProfile (tính cách) + ActionSet (động tác)
+ màu + mặt/nón + tỉ lệ.

```
Tools > Stickman > Archetypes > Build All Archetypes
```

| Archetype | Màu thân / tay chân | Nón | Động tác | Dùng ở mode |
|---|---|---|---|---|
| **Shield** | xám sắt / xanh thép | Norman | Heavy | 3, 13, 14, 17 |
| **Melee** | xanh thép / nâu da | Viking | Soldier | 3, 13, 14, 17 |
| **Ranged** | xanh rừng / nâu da | Cap | Agile | 3, 13, 14, 17 |
| **Assassin** | đen bóng tối | (trần) | Agile | 4 Guard, 15 Escort |
| **Bodyguard** | tím hoàng gia / xanh thép | Winged | Soldier | 4, 15 |
| **Commander** | tím hoàng gia, **to 1.12×** | Roman | Soldier | mọi mode có chỉ huy |
| **Brawler** | đỏ máu, **mỗi đứa một sắc riêng** | random | Agile | 16 FFA |
| **Villager** | nâu dân dã | (trần) | Soldier | 17 Kinh tế |
| **Boss** | trắng xương / đỏ, **to 2×** | mũ trụ kín | Boss | 18 |

**Loạn chiến (Demo_16) đặc biệt**: ai cũng một phe riêng nên cờ phe vô dụng — mỗi đấu sĩ
được nhuộm một sắc xoay quanh vòng màu (`Color.HSVToRGB(i / n, ...)`), nhận ra nhau bằng
chính ngoại hình.

## `StickmanActionSet` — 4 bộ động tác

```
Tools > Stickman > Animation > 1. Build Action Sets (4 bộ)
```

Trước đây `StickmanBodyAnimator` đã có sẵn nhưng **không có asset nào** — animation toàn
thân chưa từng chạy. Giờ có 4 bộ, mỗi bộ 14 động tác (Idle · Jump · Fall · Land · Crouch ·
Crawl · ClimbIdle · Climb · Rope · Hurt · HitImpact · AttackBody · Block · Roll):

| Bộ | Biên độ | Tốc độ | Độ nặng | Ai dùng |
|---|---|---|---|---|
| Soldier | 1.0 | 1.0 | 0.3 | lính thường, vệ sĩ, chủ tướng |
| Heavy | 0.75 | 0.75 | 1.0 | khiên, búa — khuỵu sâu khi tiếp đất |
| Agile | 1.25 | 1.35 | 0.0 | sát thủ, cung, đấu sĩ |
| Boss | 1.6 | 0.6 | 1.4 | boss — chậm, biên độ rất lớn |

**Cả 4 bộ dựng từ MỘT hàm** `BuildSet(scale, speed, weighty)` — thêm bộ mới chỉ cần 1 dòng,
không phải gõ tay 14 động tác. Idle có 2 style (`breathe` / `shift`) nên mỗi lính bốc một
kiểu, đám đông đỡ như copy-paste.

## Hai đường áp archetype — ĐỪNG NHẦM

| | Runtime | Edit-time |
|---|---|---|
| Hàm | `StickmanArchetype.ApplyTo(go)` | `StickmanDemoBuilder.ApplyArchetypeShared(go, arch)` |
| Khi nào | sau `Instantiate` (TeamEconomy, wave spawner) | lúc dựng scene |
| Cách ghi | set thẳng property | qua `SerializedObject` |
| Vì sao khác | Awake đã chạy xong | **không ghi qua SerializedObject thì Play xong Stop là mất** |

## Thêm loại nhân vật mới

1. Mở `StickmanArchetypeBuilder.BuildAll()`, thêm một dòng `Make(...)`
2. Chạy `Build All Archetypes`
3. Gọi `ApplyArchetypeShared(npc, StickmanArchetypeBuilder.Get("TênMới"))` trong builder scene

Muốn bộ động tác riêng: thêm 1 dòng vào `StickmanActionSetBuilder` với 3 số
(scale / speed / weighty).
