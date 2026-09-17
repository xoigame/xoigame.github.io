# Bay — quy trình, bảng số, cách thêm đơn vị có cánh, cách sửa khi "bay thấy sai"

Luật bắt buộc nằm ở [Docs/AgentRules/Flight.md](../AgentRules/Flight.md). File này là phần TRA
SÂU: bấm nút nào, số nào đổi được, thêm một đơn vị bay ra sao, và triệu chứng nào ứng với
nguyên nhân nào.

## 1. Dựng và chơi thử

1. `Tools ▸ Stickman ▸ Nâng cao ▸ Art ▸ **★ Vẽ lại CÁNH stickman**` — sinh bốn tấm
   `Assets/Resources/Wings/Wing_<KiểuCánh>.png`. Chỉ cần chạy MỘT LẦN; chạy lại không đè lên
   tấm bạn tự đặt (`StickmanArtSource` canh vế đó).
2. `Nâng cao ▸ AI ▸ **8. Build AI Playbooks**` — ghi lại `Playbook_Arcane.asset` với module
   `Wings`. **Bỏ bước này thì con máy có cánh mà không bao giờ cất cánh.**
3. `Nâng cao ▸ Genres ▸ Fantasy ▸ **4. Không chiến (cánh bay)**` — dựng
   `Genre_Fantasy_Sky.unity`.
4. Play. Bạn cầm kiếm, mang cánh LÔNG VŨ.

| Thao tác | Phím | Cảm ứng |
|---|---|---|
| Bung cánh | **NHẢY (Space) lần thứ hai, khi đang trên không** | nút NHẢY lần hai |
| Lên / xuống | `W` `S` (hoặc ↑ ↓) | cần ảo dọc (`ClimbAxis`) |
| Bay ngang | `A` `D` | cần ảo ngang (`MoveAxis`) |
| Liệng | **thả cần dọc** | thả cần |
| Cụp cánh đáp | giữ `S` khi sát mặt đất | giữ nút NGỒI |

⚠ Phím nhảy mượn lại đúng khuôn khinh công võ lâm: trên đất là cú nhảy thường, giữa trời là
bung cánh. Không tốn thêm phím nào, và trên điện thoại không phải học thêm nút.

## 2. Bảng số — `WingSpec.Of` (hằng trong code, đổi thì KHÔNG cần dựng lại scene)

| | `Feathered` | `Bat` | `Insect` | `Powered` |
|---|---|---|---|---|
| Tốc độ ngang | 4.6 | 5.4 | 3.5 | **6.2** |
| Tốc độ leo | 3.0 | 3.4 | 2.6 | **4.6** |
| Chìm khi liệng | **0.78** | 1.35 | **0.55** | 3.2 |
| Trần bay (từ mặt đất) | 6.4 | 7.5 | **4.6** | **11** |
| Giá cất cánh | 10 | 12 | **7** | 15 |
| Hao/giây — bay ngang | 5.5 | 7 | 6 | **19** |
| Hao/giây — **treo tại chỗ** | 11 | **17** | **3.5** | 22 |
| Hao/giây — leo | 10 | 12 | 9 | **26** |
| Bổ nhào ×tốc | 1.8 | **2.15** | 1.35 | 1.6 |
| Thưởng sát thương bổ nhào | 0.80 | **1.05** | 0.35 | 0.50 |
| Trúng đòn mất thể lực | 15 | 16 | **20** | 12 |

Đọc bảng theo CÂU HỎI, không theo cột "cái nào mạnh":

- **`Feathered`** chìm chậm nhất ⇒ tắt cánh vẫn đi xa. Hợp lối vào-ra: bổ xuống, chém, liệng ra.
- **`Bat`** bổ nhanh và đau nhất, nhưng treo tại chỗ tốn gấp đôi ⇒ **không ngồi lì trên trời được**.
- **`Insect`** treo gần như miễn phí (sàn bắn di động), đổi lại trần 4.6 ⇒ **luôn nằm trong tầm cung thủ**.
- **`Powered`** trần cao nhất, leo nhanh nhất — an toàn nhất, đổi lại ngốn gấp ba và hết nhiên
  liệu là rơi thẳng (`glideSink` 3.2).

**Thể lực dùng CHUNG với nước rút** (`StickmanLocomotion.Stamina`, mặc định 100). Bay và chạy
rút cùng rút một bể — cố ý, để bay là một quyết định có giá.

**Gánh nặng vũ khí:** `WeightPenalty = clamp(0.7 + kg/6, 0.7, 2.2)`, nhân vào giá cất cánh và
mọi khoản hao. Cầm cây 9 kg thì hao gấp ~2.2 lần cây tay không.

## 3. Thêm một đơn vị có cánh — BỐN mảnh, đừng sót mảnh nào

```csharp
// 1 + 2: bộ lái + HÌNH. Cửa DUY NHẤT, đừng tự AddComponent.
GameObject npc = StickmanDemoBuilder.SpawnNpcShared("QuyCanhDoi", 14f, TeamB, WSword,
                                                    AIBehavior.HuntTarget, null);
StickmanDemoBuilder.AddWingsShared(npc, WingClass.Bat);

// Người chơi thì bật cờ cầm lái:
StickmanDemoBuilder.AddWingsShared(player, WingClass.Feathered, playerControlled: true);
```

3. **Playbook của màn phải kê `AIModuleKind.Wings`** — hiện chỉ `Playbook_Arcane` có. Gắn bộ
   khác là con vật đứng dưới đất đánh như bộ binh.
4. **Nhân vật phải có `StickmanLocomotion` với thể lực bật** — đó là nhiên liệu.

⚠ Mảnh 3 nằm trong asset nên `AddWingsShared` không với tới được. Đây là lý do có phép đo
Doctor *"Cánh mà AI không biết bay"*.

## 4. Bốn đường lên trời cùng ghi một sổ

`AirLayer` (Combat, tầng 1) là chỗ duy nhất biết ai đang ở trên không:

| Ai | `AirKind` | Ghi ở |
|---|---|---|
| Stickman có cánh | `OwnWings` | `StickmanWings` |
| Quái bay (harpy · rồng · imp · wisp · gryphon) | `Beast` | `FantasyAirRaider` |
| Khinh khí cầu · máy bay · trực thăng | `Balloon` | `Aircraft` |
| Người NGỒI trên thứ đang bay (giỏ cầu, lưng rồng) | theo cái chở | `VehicleRider` |

Thêm đường thứ năm mai sau = cài `IAirborneActor` + `AirLayer.Register`, **không phải sửa AI**.

**Cưỡi quái bay** vẫn đi đường cũ: `FantasySkyMount` (phím `F` khi đứng trong 2.4 đơn vị) trao
tay lái cho người qua `FantasyAirRaider.SetPilot` — cố ý KHÔNG có hệ bay thứ hai. Muốn cưỡi một
con CHIM thì con chim phải là một sinh vật có `StickmanFighterController` + `FantasyAirRaider`
+ `FantasySkyMount`, không phải `StickmanBird` (thứ đó là chim cảnh, không máu không phe).

## 5. Triệu chứng → nguyên nhân

| Nhìn thấy | Gần như chắc chắn là |
|---|---|
| Nhân vật **trượt trong không khí, không có cánh** | thiếu `StickmanWingRig` hoặc thiếu tấm PNG — chạy «★ Vẽ lại CÁNH stickman» |
| **Bấm phím bay không ăn** | hết thể lực, hoặc nhân vật không có `StickmanLocomotion`, hoặc `SetUseStamina(false)` |
| Con máy **có cánh mà không bao giờ bay** | playbook thiếu `AIModuleKind.Wings` |
| Kẻ bay **nhấp nhô lên xuống tại chỗ** | ai đó sửa `MinAirTime` / `TakeOffCooldown` về 0 |
| Cả tiểu đội **đứng dưới vung kiếm vào không khí** | `TargetOnAnotherLevel` không nhận ra mục tiêu bay — kiểm `AirLayer.IsFlying` |
| Kẻ bay **bất khả xâm phạm** | phe kia toàn cận chiến — Doctor có phép đo riêng cho việc này |
| Nhân vật **kẹt lơ lửng sau khi chết / đổi scene** | `gravityScale` không được trả — kiểm `Land()` ở CẢ `OnDisable` |
| Bay **xuyên qua đồi** | ai đó bỏ vế kẹp `AirLayer.GroundAt` |
| Cánh vỗ **như chong chóng trước mặt** | tấm art vẽ ngược — cánh phải chĩa về −X, pivot mép phải |

## 6. Cân bằng — ba núm, và cái nào ảnh hưởng gì

1. **Muốn bay ÍT đi:** tăng `cruiseDrain`/`hoverDrain`, hoặc giảm `_maxStamina` của profile.
   Đây là núm ảnh hưởng mạnh nhất và ít tác dụng phụ nhất.
2. **Muốn bay KHÓ SỐNG hơn:** tăng `hitStaminaLoss` — mỗi phát trúng bào sâu hơn, tức là cho
   phe dưới đất nhiều quyền hơn mà không đụng gì tới tốc độ.
3. **Muốn bổ nhào ĐÁNG hơn:** tăng `diveDamageBonus`. ⚠ Đây là núm dễ hỏng cân bằng nhất —
   thưởng nhân theo `DiveCharge`, mà `DiveCharge` lại chạm 1.0 rất dễ với `Bat`.

⚠ **Đừng cân bằng bằng cách hạ `ceiling` xuống dưới tầm cung (≈8).** Trần thấp làm kẻ bay luôn
bị bắn, nhưng nó cũng xoá luôn lý do bay. Muốn phạt thì phạt bằng THỂ LỰC, đừng phạt bằng
hình học.

## 7. Liên quan

[Fantasy.md](Fantasy.md) (quái bay, rồng ba pha) · [Shooter.md](Shooter.md) (pháo phòng không) ·
[Wuxia.md](Wuxia.md) (khinh công) · [AI-Architecture.md](AI-Architecture.md) (module) ·
[AssetGeneration.md](AssetGeneration.md) (luật vẽ bù, đặt art ChatGPT).
