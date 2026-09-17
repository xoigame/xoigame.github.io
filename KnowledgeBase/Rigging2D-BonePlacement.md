# Rigging 2D & Gắn Xương Thông Minh — cho Ragdoll

> Kiến thức gắn xương (bone placement) cho nhân vật 2D: người, stickman, quái vật —
> và cách map rig sang ragdoll. Tổng hợp từ Unity docs + biomechanics + kinh nghiệm dự án.
> Cập nhật: 2026-08.

## 1. Workflow chuẩn của Unity 2D Animation (Skinning Editor)

Thứ tự 7 bước (làm đúng thứ tự, đỡ phải làm lại):

1. **Create Bone** — click đặt điểm đầu, click đặt điểm cuối; click tiếp để nối chain.
   Muốn bone rời (không nối) → nhấn `ESC` rồi vẽ bone mới, sau đó set parent thủ công
2. **Auto Geometry** — generate mesh cho từng sprite (hoặc tất cả)
3. **Edit Geometry** — sửa mesh: thêm vertex ở vùng gập (khớp), giảm vertex vùng cứng
4. **Auto Weights** — chỉ chạy khi sprite có geometry VÀ bone cắt qua sprite đó
5. **Weight Slider / Weight Brush** — sửa weight tay: đỏ = ảnh hưởng mạnh, xanh = yếu
6. **Bone Influence / Sprite Influence** — gỡ bone không liên quan ra khỏi sprite
   (VD: bone chân KHÔNG được ảnh hưởng sprite tay)
7. **Preview Pose** — xoay thử từng bone kiểm tra deform; `Reset Pose` để về mặc định

**Quy tắc weight quan trọng:**
- Tại vùng KHỚP: 2 bone/vertex là đủ; vùng phức tạp (vai, hông, thân) tối đa 4
- Chuyển tiếp weight phải mượt (gradient) — weight gãy đột ngột = mesh gập như giấy
- Với ragdoll kiểu dự án này (mỗi part 1 sprite riêng): weight từng part về đúng 1–2 bone
  của part đó, để khi tách part ra làm ragdoll không bị "dính thịt" part khác

## 2. Nguyên tắc VÀNG khi đặt xương (mọi loại nhân vật)

1. **Pivot bone đặt TẠI TÂM XOAY của khớp** — không phải mép sprite:
   - Vai: giữa "hốc vai" (chỗ tay gặp thân), KHÔNG phải đầu vai ngoài
   - Khuỷu tay/đầu gối: chính giữa nếp gập
   - Hông: giữa "ổ khớp háng" (trong thân, không phải mép ngoài đùi)
   - Cổ: chân cổ (chỗ cổ gặp thân), head bone chạy từ đó lên đỉnh đầu
2. **Bone chạy dọc TRỤC GIỮA của chi** (center-line) — bone lệch trục → mesh xoắn khi xoay
3. **Số bone = số đoạn cần xoay độc lập** — đừng thêm bone thừa (nặng + khó weight)
4. **Root bone đặt ở HÔNG/khối trọng tâm** (pelvis is the root) — mọi thứ là con của nó;
   dự án này: `Bone` (root) → `body_1` → `body_2` → head/arms, và legs từ body_1
5. **Rig ở pose trung tính** nhưng khuỷu tay/đầu gối hơi CONG SẴN theo chiều gập tự nhiên —
   để `LimbSolver2D` biết chiều gập (đỡ phải tick Flip)
6. **Đặt tên bone nhất quán** (`armL`, `handL`, `legR`, `footR`...) — `SpriteSkin.AutoRebind`
   tìm bone theo TÊN, và code tìm head ragdoll theo tên chứa "head"
7. Chuẩn bị art: mỗi part 1 layer (PSB + PSD Importer), phần khớp **vẽ CHỒNG lên nhau**
   (overlap) để khi xoay không hở thịt — vai tròn, khuỷu tròn

## 3. Bản đồ xương NGƯỜI / STICKMAN (chuẩn cho ragdoll)

```
Bone (root, tại hông)
└── body_1 (hông→ngực)            ← có thể tách body_2 (ngực→cổ) nếu muốn thân dẻo
    ├── head (chân cổ→đỉnh đầu)
    ├── armL (vai→khuỷu)
    │   └── handL (khuỷu→bàn tay)     ← stickman gộp cẳng tay+bàn tay = 1 bone
    ├── armR ─ handR (như trên)
    ├── legL (háng→gối)
    │   └── footL (gối→bàn chân)      ← stickman gộp cẳng chân+bàn chân
    └── legR ─ footR (như trên)
```
- Người chi tiết hơn: tách `lowerArm` + `hand` riêng, `shin` + `foot` riêng (thêm 4 part)
- IK: `LimbSolver2D` mỗi tay (effector = handL/R) + mỗi chân (effector = footL/R),
  target đặt trong `SolverGroup`, quản lý bởi `IKManager2D` trên root

### Giới hạn góc khớp thực tế (HingeJoint2D limits, nhìn ngang / side-view)

| Khớp | Lower / Upper (độ) | Ghi chú |
|---|---|---|
| Cổ (head↔body) | **-40 / +40** (dự án đang dùng -60/+90 — kịch tính hơn, OK) | gật/ngửa đầu |
| Vai (arm↔body) | -60 / +180 | tay giơ cao được, ra sau ít |
| Khuỷu (hand↔arm) | **0 / +145** | CHỈ gập 1 chiều! chiều dương tùy hướng rig |
| Cổ tay | -80 / +70 | nếu có bone bàn tay riêng |
| Háng (leg↔body) | -20 / +120 | đá cao trước, ra sau ít |
| Gối (foot↔leg) | **-145 / 0** | CHỈ gập 1 chiều, NGƯỢC với khuỷu tay |
| Cổ chân | -50 / +20 | nếu có bone bàn chân riêng |
| Thân (body_2↔body_1) | -30 / +30 | nếu thân 2 đoạn |

**Lưu ý dấu:** dấu +/- phụ thuộc chiều rig và nhân vật quay trái/phải — cứ set thử,
Play, kéo ragdoll xem gối/khuỷu có gập ngược không rồi đảo dấu. Khuỷu và gối gập
NGƯỢC chiều nhau là đúng giải phẫu.
**Đừng set limit hẹp < 5–15°** (jitter) — muốn khóa thì để 0 hẳn.
Dự án hiện để tay chân tự do (không limit) → kiểu "bún" hài hước; muốn xác thực
hơn thì áp bảng trên.

### Phân bố mass ragdoll (tỷ lệ cơ thể thật, đã làm tròn cho game)

| Part | Mass đề xuất | Part | Mass đề xuất |
|---|---|---|---|
| body (thân) | 1.0 | leg (đùi) | 0.7 |
| head | 0.5 | foot (cẳng+bàn chân) | 0.45 |
| arm (cánh tay) | 0.35 | hand (cẳng+bàn tay) | 0.25 |

Quy tắc: part nối nhau chênh ≤ 2x (0.25 vs 1.0 là chênh 4x giữa hand–body nhưng chúng
KHÔNG nối trực tiếp — chain hand(0.25)→arm(0.35)→body(1.0) từng bước ≤ 2x → ổn).
Dự án hiện để tất cả = 1: đơn giản, hơi "đều đều" — nâng cấp theo bảng nếu muốn tự nhiên hơn.

## 4. Gắn xương QUÁI VẬT (monster) — theo từng kiểu thân

### a) Quái 2 chân to (ogre, golem, boss)
Same map người nhưng: thân 2–3 bone (to = cần dẻo), thêm bone bụng nếu bụng phệ cần rung.
Ragdoll: mass thân lớn hơn nữa (thân 1.5–2.0), Collision Detection = Continuous cho part to.

### b) Quái 4 chân (chó, sói, bò)
```
root (giữa lưng) → spine_1 → spine_2 (2-3 đoạn lưng)
├── neck → head (cổ 1-2 bone)
├── tail_1 → tail_2 → tail_3 (đuôi = chain 3-5 bone)
├── legFront (vai→khuỷu) → footFront   ×2
└── legBack (hông→gối)  → footBack     ×2   ← gối chân sau gập NGƯỢC chân trước
```
- Dựng skeleton **từ xương sống ra ngoài**, rồi IK từng chân, rồi phụ (đuôi, tai)
- Ragdoll: mỗi đốt spine + mỗi đoạn chân 1 rigidbody; đuôi hinge tự do ±45°/đốt

### c) Rắn / sâu / tentacle
- Chain đều **5–8 bone cùng độ dài** — càng nhiều đốt càng mượt (nhưng nặng weight)
- Ragdoll: hinge mỗi đốt limit ±30–45°; tổng chain vẫn cong đẹp mà không gập gãy
- Đây cũng là cách làm TÓC, ÁO CHOÀNG, DÂY THỪNG vật lý (chain hinge + gravity)

### d) Quái bay (dơi, rồng)
- Cánh = chain 2–3 bone (cánh trong→cánh ngoài→màng), gốc tại "vai cánh"
- Khi chết: cánh hinge tự do → tự gấp lại khi rơi, rất tự nhiên

### e) Slime / jelly / blob
- **KHÔNG cần bone** — 3 lựa chọn:
  1. Squash & stretch bằng scale animation (rẻ nhất, hợp bộ khung này)
  2. Sprite Shape + động vertex
  3. Nếu muốn "jelly vật lý": vòng 6–10 rigidbody nhỏ quanh mép nối SpringJoint2D
     vào tâm + với nhau (soft-body giả) — đắt, chỉ dùng cho boss

### f) Nhện / nhiều chân
- Mỗi chân 2 bone (đùi→cẳng), 6–8 chân; KHÔNG ragdoll từng chân khi đông con —
  chết thì co chân lại bằng animation rồi mới bật ragdoll thân

## 5. Từ RIG sang RAGDOLL — quy trình map 1:1

Nguyên tắc: **mỗi bone chính = 1 ragdoll part**. Với từng bone:

1. Tạo GameObject `<tên>Ragdoll` là CON của bone đó (inactive) — tự khớp pose lúc chết
2. `SpriteRenderer`: copy sprite + sorting order của part đó
3. Collider: `CapsuleCollider2D` dọc theo bone (size ≈ sprite part), đầu = `CircleCollider2D`
4. `Rigidbody2D`: mass theo bảng mục 3
5. `HingeJoint2D`: connect về rigidbody của **part cha theo giải phẫu**
   (hand→arm→body; foot→leg→body; head→body)
   - **Anchor đặt ĐÚNG vị trí pivot bone** (= tâm khớp) — anchor lệch là khớp "trôi"
   - `Auto Configure Connected Anchor` = OFF rồi tự đặt
   - `Enable Collision` = OFF
6. Limit theo bảng mục 3 (hoặc thả tự do nếu muốn kiểu hài)
7. Test: Play → gọi `TakeDamage(hướng)` → kiểm tra: giữ pose lúc chết? khuỷu/gối gập đúng chiều? có jitter?

## 6. Tools nên biết

| Tool | Dùng làm gì |
|---|---|
| **PSD Importer** (`com.unity.2d.psdimporter`) | Import .psb nhiều layer → tự tách part + dựng hierarchy. Settings: Sprite Mode=Multiple, ✅Mosaic, ✅Character Rig, ✅Use Layer Grouping |
| **Skinning Editor** (trong Sprite Editor) | Toàn bộ rig: bone/geometry/weight — tool chính |
| **2D IK** (trong 2d.animation) | `LimbSolver2D` (2 bone), `CCDSolver2D`/`FabrikSolver2D` (chain dài — dùng cho đuôi/tentacle khi CẦN điều khiển; từ v13 đã burst, nhanh) |
| **Sprite Library + Sprite Resolver** | Swap skin/outfit/vũ khí không đổi rig |
| **Sprite Shape** (`com.unity.2d.spriteshape`) | Địa hình + quái dạng mềm |
| Photopea (free, web) / Krita / Photoshop | Vẽ + tách layer, export .psb (Photopea export được .psb miễn phí) |
| Tham khảo ngoài: Spine, DragonBones, Creature | Chỉ để học concept — dự án này dùng Unity 2D Animation là đủ |

## 7. Lỗi hay gặp & cách sửa

| Triệu chứng | Nguyên nhân | Sửa |
|---|---|---|
| Mesh xoắn/vặn khi xoay khớp | bone lệch trục giữa; weight tràn part khác | đặt lại bone theo center-line; Bone Influence gỡ bone thừa |
| Khớp hở thịt khi gập | art không vẽ overlap tại khớp | vẽ chồng phần khớp (tròn hóa đầu khớp) |
| IK gập ngược chiều | rig thẳng đơ, solver không biết chiều | rig cong sẵn nhẹ hoặc tick `Flip` trên LimbSolver2D |
| Ragdoll gập ngược gối | dấu limit sai | đảo lower/upper |
| Ragdoll rung bần bật | limit quá hẹp / mass chênh / scale ≠ 1 | xem Ragdoll2D.md mục 4 |
| Part ragdoll lệch pose lúc chết | ragdoll part không nằm trong bone | luôn để part inactive TRONG bone, chỉ reparent lúc chết |
| AutoRebind không tìm thấy bone | tên/hierarchy không khớp rig | đặt tên bone = tên transform, giữ đúng cây |

## Nguồn

- Unity — Actor skinning & weighting workflow: https://docs.unity3d.com/Packages/com.unity.2d.animation@10.0/manual/CharacterRig.html
- Unity — Preparing artwork (.psb, layer): https://docs.unity3d.com/Packages/com.unity.2d.animation@9.0/manual/PreparingArtwork.html
- Unity — Rigging with PSD Importer: https://docs.unity3d.com/Packages/com.unity.2d.animation@9.0/manual/ex-psd-importer.html
- Unity 2D Rigging — weight painting guide: https://indexof.website/lite/5/unity-2d-rigging
- Bones in Unity 2D overview: https://daily.jovis.ai/game-development/from-flat-to-fantastic-animating-2d-sprites-with-bones-in-unity/
- Ragdoll physics (joint types, limits): https://en.wikipedia.org/wiki/Ragdoll_physics
- Ragdoll physics in games — blend animation: https://mocaponline.com/blogs/mocap-news/ragdoll-physics-animation-guide
- Joint constraints for ragdoll (GameDev.net): https://gamedev.net/forums/topic/324795-joint-constraints-for-ragdoll-physics/
- Character rigging production guide (creature concepts): https://game-ace.com/blog/character-rigging-for-video-games/
- Skeletal animation: https://en.wikipedia.org/wiki/Skeletal_animation
