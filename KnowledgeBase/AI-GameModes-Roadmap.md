# Roadmap chế độ chơi — để CẬP NHẬT AI

> **Đợt tiếp theo (2026-09-08):** [Roadmap-NextWave.md](Roadmap-NextWave.md) — còn GAME nào,
> AI nào, TÍNH NĂNG nào (cho Luna) đáng thêm, đo trên trạng thái 31 mode hiện tại.

> Trả lời câu "còn chế độ chơi nào nữa để nâng AI?". Mỗi chế độ được chọn vì nó
> ÉP AI học một kỹ năng mới — không phải chỉ đổi map. Cập nhật: 2026-08.
>
> AI hiện có (xem `AI-NPC.md`): FreeRoam/Hunt/Guard · FSM 5 state · cây chỉ huy
> (Attack/Hold/Defend/Regroup/Retreat, kế nhiệm, học thuyết) · wave spawner ·
> 3 vai trò lính · né đạn · tinh thần · tập trung hoả lực · nhặt đồ · khiên · thể lực.
>
> **Giới hạn kiến trúc lớn nhất hiện tại:** `StickmanAgent.Target` là
> `StickmanController` — AI CHỈ BIẾT ĐÁNH NGƯỜI. Mọi chế độ có mục tiêu
> không phải người (cổng, tháp, xe hàng, điểm chiếm) đều đụng trần này.

## Bảng tổng — xếp theo GIÁ TRỊ NÂNG AI trên CÔNG SỨC

| # | Chế độ | AI học được gì MỚI | Tái dùng | Công sức |
|---|---|---|---|---|
| 1 | **Chiếm điểm (King of the Hill)** | đánh nhau VÌ MỘT VÙNG: bám zone, ưu tiên địch trong zone, chỉ huy điều quân giữa các điểm | cây chỉ huy (anchor = điểm), Guard leash | ★★ |
| 2 | **Công thành (Siege)** | **đánh mục tiêu KHÔNG PHẢI NGƯỜI** — mở trần kiến trúc targeting | Hunt + cây chỉ huy | ★★★ |
| 3 | **Hộ tống xe hàng (Escort)** | bảo vệ mục tiêu DI CHUYỂN: đội hình bám theo, chặn hướng phục kích | Guard (objective động), formation | ★★ |
| 4 | **Đấu trường 1v1 (Duel)** | không học gì mới — nhưng là PHÒNG LAB cân bằng 16 vũ khí + tuning strategy | testbed, CombatStrategies | ★ |
| 5 | **Loạn chiến FFA (Last Man Standing)** | chọn mục tiêu khi AI CŨNG LÀ MỒI: cân "đánh ai" vs "né đám đông", cơ hội chủ nghĩa | SelectBestEnemy (nhiều phe) | ★ |
| 6 | **Kinh tế kiểu Stick War** | TẦNG CHIẾN LƯỢC: tướng máy quản tiền, chọn loại lính mà sinh, đổi đội hình theo tình thế | UnitLoadout, coin, wave spawner, doctrine | ★★★★ |
| 7 | **Boss trận** | AI theo PHASE: đổi bộ đòn theo máu, đòn báo trước (telegraph) cho người né | rig scale to, ProceduralAnimator | ★★★ |
| 8 | **Ám sát (vision cone)** | tầm nhìn CÓ HƯỚNG + truyền tin báo động — nền cho mọi stealth sau này | Guard, aggro | ★★★ |

## Chi tiết từng chế độ

### 1. Chiếm điểm — ĐỀ XUẤT LÀM ĐẦU TIÊN
2–3 vòng tròn trên map, đứng trong đó chiếm dần, giữ đủ lâu thì ăn điểm.

**AI cần thêm** (đều nhỏ):
- `CapturePoint` (MonoBehaviour): đếm người từng phe trong vùng, tiến độ chiếm — thuần gameplay, không đụng AI
- `CommandNode`: khi stance = Attack/Defend, **anchor dời về điểm chiếm** thay vì tiền tuyến địch (đổi `ComputeOwnAnchor` — cây chỉ huy vốn đã lái lính bằng anchor nên gần như miễn phí)
- `SelectBestEnemy`: cộng điểm ưu tiên cho địch ĐANG ĐỨNG TRONG zone (thêm 1 term vào công thức chấm điểm có sẵn)
- HUD: thanh tiến độ chiếm

Vì sao đầu tiên: công nhỏ nhất mà đổi hẳn CHẤT trận đánh — hai phe có lý do để tụ về một chỗ, cây chỉ huy có bài toán "chia quân giữ 2 điểm" thật sự.

### 2. Công thành — ĐÁNG LÀM VÌ MỞ TRẦN KIẾN TRÚC
Phe công phá cổng/tháp, phe thủ giữ N phút.

**Cập nhật AI cốt lõi — interface hoá mục tiêu:**
```csharp
public interface IDamageable {              // StickmanController implement sẵn
    bool IsDie { get; }
    Transform transform { get; }
    void TakeDamage(DamageInfo info);
    int TeamId { get; }
}
```
- `StickmanAgent.Target` đổi kiểu sang `IDamageable` (giữ property `TargetController` cho code cũ)
- `DestructibleTarget`: máu + đổ sập (đổi sprite / bung mảnh vỡ) + TeamMember để lọt vào radar địch
- `CombatStrategies` khỏi sửa: mục tiêu đứng yên là ca dễ nhất của melee/ranged

Làm xong cái này thì tháp canh, xe phá thành, rào chắn, nhà chính... đều miễn phí về sau.
Đây là lý do nó đáng ★★★ dù scene thì đơn giản.

### 3. Hộ tống xe hàng
Xe (hoặc VIP đi bộ) tự chạy theo đường; vệ sĩ hộ tống; phục kích spawn dọc đường.

**AI cần thêm:**
- `WaypointMover` cho xe — thuần gameplay
- `AIStateGuard` đã bám objective động (VIP là Transform) — chỉ cần thêm **giữ đội hình
  quanh mục tiêu đang đi**: chia slot trước/sau/trên xe thay vì bu một chỗ (mở rộng
  `TryGetShieldAnchorX` thành slot theo hướng di chuyển)
- Wave spawner đã có "spawn theo đợt hai bên" — dùng lại nguyên

### 4. Đấu trường 1v1 (giải đấu)
Bracket 16 vũ khí đấu loại trực tiếp, người xem đặt cửa. **Không thêm AI** — giá trị là
phòng lab: chạy tự động N trận → bảng thắng/thua từng cặp vũ khí → lộ ngay vũ khí nào
OP, strategy nào ngu. Nên có nút "chạy 100 trận nhanh (timeScale 10)" xuất bảng ra Console.
Gắn thẳng vào Testbed làm tab thứ 3 được.

### 5. Loạn chiến FFA
8–12 lính, MỖI ĐỨA MỘT PHE (`TeamMember.TeamId` khác nhau — hệ phe đã hỗ trợ sẵn).

**AI cần thêm (ít mà thú):** term mới trong `SelectBestEnemy`:
- trừ điểm mục tiêu đang bị nhiều đứa khác vây (nhảy vào là ăn ké đòn lạc)
- cộng điểm mục tiêu YẾU MÁU (kết liễu kẻ sắp chết — cơ hội chủ nghĩa)
- khi 2 đứa khác đang đánh nhau gần đó → đứng ngoài chờ (đục nước béo cò) = state nhỏ mới

### 6. Kinh tế kiểu Stick War — CHẾ ĐỘ ĐINH, để sau cùng
Giết địch ra coin (LootDropper có rồi) → về nhà tiêu coin sinh lính (UnitLoadout có rồi).

**Cập nhật AI tầng CHIẾN LƯỢC (mới hoàn toàn):**
- `TeamEconomy`: ví tiền mỗi phe + hàng chờ sinh lính
- Tướng máy quyết định **mua loại lính gì** theo tình báo có sẵn trong `SectorReport`:
  địch nhiều ranged → mua khiên; địch rùa → mua ranged; thua đau → để dành đánh lớn
- Thêm vào `CommandDoctrine`: khẩu vị chi tiêu (tiết kiệm/vung tay), tỉ lệ đội hình mong muốn
- Người chơi phe kia cũng mua bằng coin nhặt được → thành game hoàn chỉnh đúng nghĩa

### 7. Boss trận
1 stickman PHÓNG TO (rig scale 0.5–0.6, mass × 4) máu dày, 3 phase theo % máu.

**AI cần thêm:**
- `BossStrategy : ICombatStrategy` — bảng đòn theo phase, đòn có **báo trước**
  (pose windup giữ lâu + đổi màu) để người chơi kịp né; đòn AOE dậm đất (dùng `Explosion` sẵn)
- Ragdoll definition riêng cho size to (mass/limit — tool RagdollBuilder dựng được luôn)
- Lưu ý: scale root 0.5 vẫn giữ scale 1 trên transform chứa Rigidbody2D (rule ragdoll)

### 8. Ám sát (stealth-lite)
Lẻn qua lính gác giết mục tiêu rồi thoát. **AI cần thêm — đều là nền tảng dùng lại được:**
- Tầm nhìn CÓ HƯỚNG (hình quạt theo `Flip` + raycast chắn tường) thay vì bán kính tròn
- 3 mức cảnh giác: thường → nghi ngờ (đi tới chỗ thấy động) → báo động (gọi cả trại — 
  truyền tin qua `TeamMember.All` trong bán kính)
- Đây là bước đầu nếu sau này muốn làm game lén lút; không thì để cuối.

## ĐÃ LÀM (2026-08) — trạng thái hiện tại

Cả 8 mục đã triển khai. Scene: `Demo_13_Capture` … `Demo_18_Boss`
(tool: **Tools > Stickman > Game Modes > Build ALL Mode Scenes**).

| # | Chế độ | Class mới | AI đã nâng ra sao |
|---|---|---|---|
| 1 | Chiếm điểm | `CapturePoint` | `CommandNode.ComputeLineAnchor` khi Attack lấy **điểm tranh chấp** làm anchor (`BestForTeam`); `AIProfile.zoneTargetBonus` cho lính ưu tiên địch đứng trong vùng |
| 2 | Công thành | `DestructibleTarget` | **KHÔNG interface hoá** — kế thừa `StickmanController` nên công trình tự lọt radar, 0 dòng AI phải sửa. `structureTargetBonus` chỉnh thứ tự ưu tiên phá/đánh |
| 3 | Hộ tống | `WaypointMover` | Guard objective là Transform ĐANG CHẠY (FSM vốn hỗ trợ); xe dừng khi có địch gần |
| 4 | Duel lab | — | Gộp vào tab AI của Testbed (`Demo_5`) thay vì scene riêng |
| 5 | Loạn chiến | — | `finishWoundedBonus` (kết liễu kẻ yếu) + `crowdAvoidPenalty` (né ổ hỗn chiến, đếm MỌI phe chứ không chỉ đồng đội) + `AIProfile_FFA` |
| 6 | Kinh tế | `TeamEconomy`, `EconomyProfile` | **Tầng chiến lược mới**: tướng máy đọc role địch → `ChooseRole()` khắc chế (địch cung → mua khiên). `UnitLoadout.ApplyTo` + `StickmanController.SetMaxHealth` cho spawn runtime |
| 7 | Boss | `BossController` | Đổi **AIProfile theo phase** (Strategy pattern) thay vì viết state mới; `StickmanAgent.SetProfile` dựng lại strategy. Đòn báo trước: khựng + đổi màu |
| 8 | Ám sát | — | `AIProfile.useVisionCone` + `CanSee()` (quạt theo hướng lật, vẫn nghe được kẻ sát lưng) + 3 mức cảnh giác `RaiseAlert` + hô hoán `alertShoutRadius` |

**Quyết định đáng nhớ:** roadmap ban đầu đề xuất interface `IDamageable` cho mục 2.
Khi làm thật thì kế thừa `StickmanController` rẻ hơn hẳn — đổi kiểu `Target` sẽ lan ra
~10 file (radar, chấm điểm, AssignedTarget, strategies). Giá phải trả là công trình mang
theo vài field ragdoll không dùng; đổi lại KHÔNG sửa một dòng AI nào.

Mọi số tuning mới nằm trong `AIProfile` (mục "Chế độ chơi") và **mặc định vô hại** —
scene không dùng mode nào thì hành vi y hệt trước.

## Thứ tự đề xuất

```
Đợt 1 (rẻ, ăn ngay):    1. Chiếm điểm   →   4. Duel lab (tab Testbed)   →   5. FFA
Đợt 2 (mở kiến trúc):   2. Công thành (IDamageable)   →   3. Hộ tống
Đợt 3 (đinh):           6. Kinh tế Stick War   →   7. Boss   →   8. Ám sát
```

Nguyên tắc khi làm: mỗi chế độ = 1 scene demo mới trong `DemoSceneCatalog` + 1 hàm dựng
trong `StickmanDemoBuilder` (quy trình có sẵn), số tuning vào ScriptableObject
(`CapturePointSettings`, `EconomyDoctrine`...), KHÔNG hardcode.
