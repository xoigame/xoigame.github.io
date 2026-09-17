# Thang bậc màn — quy trình và bảng số

Luật ở [Docs/AgentRules/Levels.md](../AgentRules/Levels.md). File này là phần *làm thế nào* và
*con số ra bao nhiêu*.

## 1. Chơi một thang bậc (người chơi)

Menu chính → **CHỌN GAME** → thẻ **▦ Thang bậc màn** → chọn thời kỳ → chọn chế độ chơi →
chọn bậc.

- Mỗi chế độ có **12 bậc**. Bậc mở tới «bậc xa nhất đã tới + 1» — luôn nhảy lại được vào bậc
  đang dở, nhưng không nhảy thẳng vào bậc 12.
- Thua **không mất tiến trình**: chơi lại đúng bậc đang đứng (`lives = 0`).
- Thắng một bậc là mở bậc kế và tự sang bậc đó.
- Tiến trình lưu ở `pack.lv_<kiểuchơi>_<thờikỳ>.stage` trong `SaveBag` — cùng sổ với mọi gói
  game khác.

## 2. Soi thiết kế màn (người làm game)

`Tools > Stickman > Nâng cao > Gameplay > ★ Thang bậc màn (level design)`

Cửa sổ **dựng thật** map của từng bậc trong bộ nhớ rồi in bảng, nên nó không phải bản chép của
luật mà là chính cái luật đang chạy. Bấm số bậc là vào Play thẳng bậc đó.

⚠ Bảng trong cửa sổ bốc số **tất định** (luôn lấy điểm giữa khoảng) để hai lần mở cho cùng một
bảng. Ván chơi thật vẫn xê dịch ±0.14 quanh điểm của bậc (`MapLevelShape.Jitter`) — hai ván cùng
bậc không bao giờ ra đúng một cái map.

## 3. Bảng số — đo ngày 2026-09-12

Đường cong (`LevelLadder`):

| Bậc | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Bậc khó | Dễ | Dễ | Thường | Thường | Thường | Khó | Khó | Khó | Rất khó | Rất khó | Rất khó | Địa ngục |
| Rắc rối | 0.00 | 0.08 | 0.17 | 0.27 | 0.38 | 0.48 | 0.57 | 0.66 | 0.75 | 0.84 | 0.92 | 1.00 |
| Tên | Nhập môn | Bước ra sân | Đụng độ | Địa hình xấu | Có chỗ nấp | Lên cao | Đất gãy | Trời tối | Qua nước | Ba tầng | Đêm trắng | Địa ngục |

Bậc khó thành con số cụ thể ở `GameDifficulty.For` — cấp AI 1→5, quân địch ×0.75→×2, quân mình
×1.25→×0.8, cấp vũ khí địch 1→3, giờ trận ×1.35→×0.75. **Không đụng máu/sát thương của địch**
(xem `GameDifficulty`: người chơi cảm thấy bị ăn gian).

Ví dụ một thang thật — **Bảo vệ doanh trại** (số lấy từ `MapBlueprint.For(DefendCamp)` sau khi
lệch theo bậc):

| Bậc | Địa hình | Nửa rộng | Đồi | Bục | Vật chắn | Mở thêm |
|---:|---|---:|---:|---:|---:|---|
| 1 | Plateaus | 50.4 | 1.60 | 2 | 3 | — |
| 2 | Plateaus | 51.8 | 1.64 | 2 | 3 | — |
| 3 | Plateaus | 53.5 | 1.69 | 2 | 4 | — |
| 4 | Plateaus | 55.3 | 1.74 | 3 | 4 | thang |
| 5 | Plateaus | 57.2 | 1.79 | 3 | 4 | thang · phục kích |
| 6 | Plateaus | 59.0 | 1.84 | 3 | 4 | thang · phục kích |
| 7 | Plateaus | 60.7 | 1.89 | 3 | 5 | + sông (sân 3/4) |
| 8 | Plateaus | 62.3 | 1.93 | 3 | 5 | + ngày/đêm |
| 9 | **Fortress** | 63.9 | 1.98 | 4 | 5 | + hồ ×1 |
| 10 | Fortress | 65.5 | 2.02 | 4 | 6 | + ba tầng |
| 11 | Fortress | 67.0 | 2.06 | 4 | 6 | hồ ×2 · **mở màn trong ĐÊM** |
| 12 | Fortress | 68.4 | 2.10 | 4 | 6 | như bậc 11, bậc khó lên Địa ngục |

Và **Cướp cờ** để thấy mỗi kiểu chơi một dáng khác (bảng `MapBlueprint.Spec` quyết định):

| Bậc | 1 | 4 | 7 | 10 | 12 |
|---|---|---|---|---|---|
| Địa hình | Flat | Hills | Plateaus | Plateaus | Plateaus |
| Nửa rộng | 50.4 | 56.2 | 62.7 | 68.5 | 72.0 |
| Bục / chắn | 2 / 2 | 3 / 3 | 3 / 4 | 4 / 5 | 4 / 5 |

⚠ Bậc 11 và 12 gần như cùng một cái map — đó là **cố ý**: bước cuối là một bước ĐỘ KHÓ (Rất khó
→ Địa ngục), không phải một bước địa hình. Map đã mở hết những thứ nó có ở bậc 11.

## 4. Chỉnh cân bằng

| Muốn đổi | Sửa ở |
|---|---|
| Bao nhiêu bậc, bậc nào khó bao nhiêu | `LevelLadder.MaxLevel` + ba mảng `Tiers` · `Complexities` · `Names` (cùng độ dài) |
| Bậc mấy thì có thang / sông / hồ / ba tầng / đêm | các hằng `…From` trong `MapLevelShape` |
| Hai ván cùng bậc khác nhau bao nhiêu | `MapLevelShape.Jitter` |
| Map của MỘT kiểu chơi rộng/gãy tới đâu | `MapBlueprint.For(<kiểu chơi>)` — khoảng số, bậc chỉ chạy dọc khoảng ấy |
| Bậc khó thành bao nhiêu quân / cấp AI | `GameDifficulty.For` |

Sửa xong: bấm **★ KHÁM SỨC KHOẺ DỰ ÁN** — nhóm «Thang bậc màn» có 5 phép đo, trong đó phép đo
*«bậc THẬT SỰ đổi map»* dựng thật map bậc 1 và bậc 12 của cả 28 kiểu chơi rồi đếm số ô khác nhau.

## 5. Kiểm nhanh không cần Unity

```powershell
./Docs/Tools/Verify.ps1 -Changed Assets/Scripts/Core/Run/LevelLadder.cs
```

Biên dịch xanh **không** chứng minh bậc có tác dụng — đó là việc của Doctor. Ba câu hỏi hay phải
trả lời khi có ai báo "leo bậc mà không thấy khác gì":

1. `GameRun.Level` có > 0 không? (chơi màn lẻ, không qua gói ⇒ Level = 0 ⇒ không có bậc nào cả —
   đúng thiết kế).
2. Map có đi qua `MapGenerator.Generate` không? Map **bake sẵn** trong kho không được sinh lại
   nên bậc không đổi được hình dáng của nó; gói thang bậc dùng `MapArenaRequest.SetFresh` nên
   luôn sinh map mới.
3. Sân đang chơi là 3/4 hay ngang? Sân 3/4 bị `ApplyGroundPlane` san phẳng — trục rắc rối của nó
   chỉ có bề sâu và con sông.

## 6. Còn nợ

- Sân 3/4 mới có **hai** trục rắc rối (bề sâu · sông). Vùng địa hình chậm chân
  (`GroundTerrainZone`) là ứng viên tiếp theo — xem `MapArtGeometryRules.md`.
- Thang soạn tự động cố ý **không gắn luật biến thể** (lý do ở `Levels.md`). Nếu sau này muốn
  bậc cao có luật riêng thì phải kê bảng "kiểu chơi nào chịu được luật nào" trước.
- Phép đo «bậc thật sự đổi map» chỉ dựng map **sân ngang**; phần 3/4 chưa có phép đo tự động.
