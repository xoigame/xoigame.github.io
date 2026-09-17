# Anima2D vs Unity 2D Animation Package

> Cập nhật: 2026-08. Kết luận cho dự án này: **KHÔNG dùng Anima2D** —
> dự án đã dùng đúng Unity 2D Animation package (`com.unity.2d.animation`).

## 1. Số phận Anima2D

- Anima2D là plugin skeletal animation 2D bên thứ ba, được Unity mua lại năm 2017
  và phát miễn phí trên Asset Store
- **Unity đã ngừng phát triển Anima2D** và gỡ khỏi Asset Store từ **đầu tháng 2/2021**
- Không hỗ trợ Unity 2019.3+ (AssetDatabase v2) → không thể dùng trên Unity 6
- Unity chỉ định người kế nhiệm chính thức: **2D Animation package**

Các component Anima2D cũ (nếu gặp trong project cổ): `Bone2D`, `SpriteMesh`,
`SpriteMeshInstance`, `SpriteMeshAnimation`, `IkCCD2D`, `IkLimb2D`, `PoseManager`, `Control`.
**Dự án này không có bất kỳ component nào trong số đó** — đã kiểm tra toàn bộ Assets.

## 2. Bảng quy đổi Anima2D → 2D Animation package

| Anima2D | 2D Animation package |
|---|---|
| `SpriteMesh` asset (mesh editor riêng) | Skinning Editor trong Sprite Editor (geometry + weight) |
| `SpriteMeshInstance` | `SpriteRenderer` + `SpriteSkin` |
| `Bone2D` | Bone tạo trong Skinning Editor + GameObject Transform thường |
| `IkCCD2D` | `CCDSolver2D` (trong IKManager2D) |
| `IkLimb2D` | `LimbSolver2D` |
| `IkGroup` | `IKManager2D` |
| `PoseManager` | không có tương đương trực tiếp (dùng Animation clip) |
| `Control` | IK target Transform thường |

**Không có công cụ migrate tự động.** Migrate = re-rig sprite trong Skinning Editor rồi
làm lại animation (giữ được logic gameplay, mất data rig cũ).

## 3. 2D Animation package — bản đồ tính năng

Dự án đang dùng (đã update theo Unity 6000.5 → package **15.1.0**):

- **Skinning Editor** (trong Sprite Editor): tạo bone, geometry, weight painting
- **`SpriteSkin`** (runtime): deform sprite theo bone
  - `Root Bone`: transform gốc của hierarchy bone
  - `Auto Rebind`: tự tìm bone theo TÊN transform khớp với rig — hierarchy + tên phải khớp
  - `Always Update`: tiếp tục deform khi ra ngoài camera (tắt để tối ưu)
- **2D IK** (nằm TRONG package 2D Animation từ v5+, không còn là package riêng):
  - `IKManager2D`: quản lý danh sách solver + weight
  - `LimbSolver2D`: 2 bone (tay/chân) — dự án dùng cái này
  - `CCDSolver2D` / `FabrikSolver2D`: chuỗi n bone (từ 13.0 đã burst-compile, nhanh hơn)
- **Sprite Library / Sprite Resolver**: swap sprite runtime (skin/outfit khác nhau)
- **Deformation**: CPU (dynamic batching, tốt cho nhiều nhân vật ít poly) hoặc
  GPU qua SRP Batcher (cần URP; Project Settings > Player > GPU Skinning = GPU (Batched));
  GPU không hỗ trợ Android GLES3/WebGL

## 4. Lịch sử version (để biết khi upgrade editor)

| Package | Unity editor | Ghi chú |
|---|---|---|
| 10.x | 6000.0 | dự án dùng 10.2.0 khi còn Unity 6000.1.4 |
| 11.0.0 | 6000.1 | chỉ bugfix, không breaking change |
| 12.x | 6000.2 | |
| 13.x | 6000.3 (LTS) | burst-compiled FABRIK/CCD, tối ưu deformation per-sprite |
| 14.x | 6000.4 | bounds theo bone, tối ưu batch deformation |
| **15.x** | **6000.5** | **← dự án đang ở đây (15.1.0)**; giảm memory khi init |
| 16.x | 6000.6 | profiler module riêng |

Package được Unity tự chọn đúng major theo editor version — **không cần tự ghim version**,
chỉ cần mở Package Manager và Update khi upgrade editor.

## 5. Bài học từ upgrade lần này (2026-08)

- Mở project bằng Unity 6000.5.7f1 → Unity TỰ nâng manifest:
  2d.animation 10.2.0 → 15.1.0, 2d.common 9.1.0 → 14.0.1, spriteshape 10.1.0 → 15.0.3,
  ugui 2.0.0 → 2.5.0 (builtin), collections/mathematics thành builtin
- Xuất hiện `ProjectSettings/PhysicsCoreProjectSettings2D.asset` (Physics Core 2D mới,
  Box2D v3) — vô hại, commit bình thường
- Prefab rig + ragdoll + IK cũ hoạt động nguyên vẹn, không cần sửa
- Script dùng `linearVelocity` từ trước nên không bị API breaking

## Nguồn

- Thông báo khai tử Anima2D: https://discussions.unity.com/t/discontinuing-anima2d-consider-2d-animation-for-skeletal-animation-in-unity/824097
- 2D Animation docs (latest): https://docs.unity3d.com/Packages/com.unity.2d.animation@latest/
- Changelog đầy đủ: https://github.com/needle-mirror/com.unity.2d.animation/blob/master/CHANGELOG.md
- SpriteSkin manual: https://docs.unity3d.com/Packages/com.unity.2d.animation@10.2/manual/SpriteSkin.html
- Unity Learn — Rigging a Sprite with Anima2D (tham khảo lịch sử): https://learn.unity.com/tutorial/rigging-a-sprite-with-anima2d
