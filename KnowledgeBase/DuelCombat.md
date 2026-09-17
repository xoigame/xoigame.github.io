# Nhịp đấu sĩ — dò đòn · nhấp nhả · dội lại · phản đòn

AI Lab bài **28 «Đấu tay đôi»** (`StickmanAILabBuilder.BuildDuelZone` + `DuelLabHud`) · luật ở
`CombatStrategyBase` / `MeleeCombatStrategy` · dội lại ở `StickmanController.ApplyRebound` ·
động tác ở `StickmanActionBuilder` (`Idle/duel` · `Hurt/rebound` · `AttackBody/jab`).

## 1. Trước và sau

| Trước (đã có) | Thiếu | Nay |
|---|---|---|
| thủ (`UpdateBlock`), né (`TryMeleeEvade`), nhử (`TryFeint`), combo, đánh-rồi-lùi, nhích qua lại | **kẻ đánh không trả giá gì khi chém vào khiên** — chỉ người đỡ giật tay | `ApplyRebound`: khựng 0.42 s, bật lùi, cắt đòn dở, đứt combo; `Hurt/"rebound"` |
| | **đỡ xong không phản đòn** — giữ thế thủ hết giờ rồi mới đánh, lúc địch đã đứng vững | `Blocked` → `StickmanAgent.IsRiposting`: hạ thế thủ ngay, bỏ do dự, bước dồn vào |
| | **không có nhịp tiến-lùi** — áp vào tầm ưu thế rồi đứng chém | `UpdateMeasure`: lọt vào dải sát tầm thì đứng NGOÀI tầm nhích 0.35–0.9 s, rồi vào hoặc NHẤP NHẢ (một nhát rồi lùi) |
| | **AI không bước dồn** (`ApplyLunge` chỉ người chơi dùng) | `TryLungeIntoTarget` khi ra đòn từ rìa tầm; phản đòn dồn ×1.35, nhấp ×0.7 |
| | dáng thân combo bốc ngẫu nhiên | `MeleeWeapon.BodyStyleForSwing`: mở màn / giữa / kết theo LỚP vũ khí |
| | đứng giữa trận thì thở như lính rảnh | `StickmanBodyAnimator.StanceStyle` — AI xin mỗi frame khi giáp mặt địch |

## 2. Số trên `AIProfile` (field MỚI — asset cũ nhận giá trị khởi tạo)

| Field | Mặc định | Nghĩa |
|---|---|---|
| `meleeMeasureMin` / `Max` | 0.35 / 0.9 s | dò đòn bao lâu; 0 ở `Max` = tắt |
| `meleeProbeChance` | 0.35 | sau khi dò, bao nhiêu phần là nhấp nhả |
| `meleeLungeStep` | 1 | cỡ bước dồn (0 = tắt) |
| `riposteWindow` | 0.6 s | cửa sổ phản đòn sau khi đỡ được |

`AISmartsTable`: cấp không `canCombo` (tân binh) tắt luôn phản đòn + nhấp nhả; dò đòn chia
theo `thinkScale` (cấp thấp lưỡng lự lâu hơn).

## 3. Thứ tự trong `Tick`, và vì sao

1. xin **thế tấn** (chỉ khi giáp mặt người, không phải công trình);
2. **đang dội** → đứt combo, chờ 0.2 s, thoát — đây là cái giá của việc chém vào khiên;
3. `UpdateBlock` (đang thủ mà `IsRiposting` → hạ ngay);
4. phản đòn → `_nextAttackTime = now`, `ShouldAttack` nới tới `MaxRange × 1.25`;
5. `ShouldAttack` (cận chiến: **đang dò thì không vung**, trừ khi địch tự lọt vào tầm);
6. nhử (không nhử lúc phản đòn — nó đang hở sẵn);
7. `AttackNow` → bước dồn → nếu là nhát nhấp: lùi hẳn, không combo.

Trong `MeleeCombatStrategy.UpdatePosition`: né → vòng → xông → **dò đòn** → tầm ưu thế.
Dò đòn đặt sau ba phản xạ/lệnh tổ và trước luật giữ tầm.

## 4. Bẫy

- **Dội lại chỉ cho đòn CÓ LỰC** (`forceScale > 0`) — cháy/độc đi chung `TakeDamage` mà không
  có ai để dội (quy ước `forceScale = 0`, xem `ApplyHitStun`).
- **Dò đòn chỉ mở khi ĐI TỪ NGOÀI vào** (`_wasOutOfReach`) và có `_nextMeasureTime` sau mỗi
  lần — không thì lùi-dò-vào-lùi-dò mãi mà không ai chạm ai (§5c).
- **Địch lọt vào tầm lúc đang dò thì thôi dò** — nó tới trước thì đánh nó trước.
- **Kẻ đang dội không được combo tiếp** — nếu không thì cái khiên chỉ là một cú trượt.
- `DuelLabHud` **rút module** của hai đấu sĩ ở `Start`: `AIWeaponSwapModule` sẽ đổi cây khác
  ngay khi thấy địch kite, mà ở đây vũ khí do người xem chọn.
- Style mới gọi ĐÍCH DANH (`weight = 0`); tên không có trong bộ (zombie) thì `Pick` trả null
  và `OnAttackStarted` rơi về bốc ngẫu nhiên — không đứng đơ.
- **Phải chạy lại `Build Action Sets`** — ba style nằm trong `StickmanActionBuilder.cs`, bộ
  trên đĩa chưa có; chưa chạy thì thế tấn / dội lại không hiện, không lỗi nào báo (Bảng điều
  khiển báo vàng vì file đó là `extraSources` của mục ấy).
