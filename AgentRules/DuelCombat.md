### ⚠⚠ NHỊP ĐẤU SĨ — DÒ ĐÒN · NHẤP NHẢ · DỘI LẠI · PHẢN ĐÒN (2026-09-05)

User: *"biết né đòn đỡ đòn, đánh trúng đòn đỡ thì dội lại, nhử địch, nhấp nhả tấn công chứ
không chỉ cắm đầu chém, đánh có tiến có lùi như có võ công"*. Đo lại thì thủ · né · nhử · combo
· đánh-rồi-lùi ĐÃ CÓ; thiếu đúng bốn thứ, và cả bốn nay ở `CombatStrategyBase` /
`StickmanController`. Chi tiết + thứ tự trong `Tick`: `Docs/KnowledgeBase/DuelCombat.md`.

| Thiếu | Nay |
|---|---|
| chém vào khiên KHÔNG trả giá gì (chỉ người đỡ giật tay) | `StickmanController.ApplyRebound` — kẻ đánh khựng 0.42 s + bật lùi + cắt đòn dở + ĐỨT COMBO; `Hurt/"rebound"` |
| đỡ xong giữ thế thủ hết giờ mới đánh | `Blocked` → `StickmanAgent.IsRiposting`: hạ thủ ngay, bỏ do dự, bước dồn ×1.35 |
| áp vào tầm ưu thế rồi đứng chém | `UpdateMeasure`: lọt vào dải sát tầm thì đứng NGOÀI tầm nhích 0.35–0.9 s rồi mới VÀO hoặc NHẤP NHẢ (một nhát rồi lùi) |
| AI không bước dồn | `TryLungeIntoTarget` (mượn `ApplyLunge` của người chơi, có `scale`) |

⚠ **Dội lại chỉ cho đòn CÓ LỰC** (`forceScale > 0`) — cháy/độc đi chung `TakeDamage`, quy
ước `forceScale = 0` (xem `ApplyHitStun`). Và `IsRebounding` chặn ở CÙNG CỬA với `IsHitStunned`
(`StickmanWeaponHolder.Attack`), người chơi cũng dội.
⚠ **Dò đòn chỉ mở khi ĐI TỪ NGOÀI vào + có nhịp nghỉ** (`_wasOutOfReach`, `_nextMeasureTime`)
— không thì lùi-dò-vào-lùi-dò mãi không ai chạm ai (§5c). Địch tự lọt vào tầm lúc đang dò
thì thôi dò.
⚠ **Dáng thân combo theo NHÁT + LỚP vũ khí** (`MeleeWeapon.BodyStyleForSwing` →
`StickmanProceduralAnimator.NextAttackBodyStyle`): mở màn bước tới, giữa xoay hông, kết bổ
xuống — không còn ba cú bốc ngẫu nhiên. Tên không có trong bộ thì rơi về ngẫu nhiên.
⚠ **Thế tấn** (`StickmanBodyAnimator.StanceStyle`, xin mỗi frame khi giáp mặt NGƯỜI) và ba
style mới (`Idle/duel` · `Hurt/rebound` · `AttackBody/jab`) đều `weight = 0` — gọi đích danh.
**Phải chạy lại `Build Action Sets`**, mục đó VÀNG trên bảng vì `StickmanActionBuilder.cs`
là `extraSources`.
⚠ Bốn field mới trên `AIProfile` (`meleeMeasureMin/Max` · `meleeProbeChance` ·
`meleeLungeStep` · `riposteWindow`) là field MỚI → 34 asset nhận giá trị khởi tạo, cả dự án
có nhịp này. `AISmartsTable`: cấp không `canCombo` tắt phản đòn + nhấp nhả; dò đòn chia
`thinkScale`.
⚠ **Sân đo: AI Lab bài 28 «Đấu tay đôi»** — hai AI máu 40, `AIProfile_Lab_Duelist` bật đủ,
`DuelLabHud` đổi **nền văn minh · nón/giáp (cấp 0–5) · vũ khí · cấp AI · quân số** từng bên,
in nhãn hành vi (`CombatStrategyBase.DebugLabel`:
DỘI · THỦ · PHẢN-ĐÒN · nhử · né · dò · nhấp · combo · lùi) + bộ đếm đỡ/dội/trúng. HUD rút
module của hai đấu sĩ ở `Start` (không thì `AIWeaponSwap` đổi cây khác). Nhãn đó cũng hiện
trên F9 trong `[...]`.

