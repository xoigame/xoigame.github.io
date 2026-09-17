# Cân bằng hai mode merge mới — cách đo, và cách chạy lại (2026-09-17)

Luật rút ra nằm ở [Docs/AgentRules/IdleMerge.md](../AgentRules/IdleMerge.md). File này là
**quy trình**: mô hình dùng để đo, các bộ số đã quét, và lệnh chạy lại.

```powershell
python Docs/Tools/MergeBalanceSim.py
```

Không cần Unity, không thư viện ngoài, khoảng 40 giây. Script in ra ASCII không dấu (console
Windows mặc định không phải UTF-8).

## 1. Mô hình trận đánh — Lanchester bình phương

Mỗi lính bậc `t` có máu `100·p` và sát thương `10·p`, với `p = f^(t-1)`.

Đặt `A = dps_thủ / máu_công`, `B = dps_công / máu_thủ`. Bất biến Lanchester cho:

```
(N_thủ · p_thủ)² − (N_công · p_công)² = const
```

Vì máu **và** sát thương cùng nhân theo bậc, luật bình phương **rút gọn về tổng tuyến tính**
`P = Σp`, và quân còn lại sau trận là `P' = √(P_thủ² − P_công²)`.

⚠ Chính vì thế câu *"hệ số 2.0 thì phép nhập hoà vốn"* của `MergeArmyTable` là đúng: hai lính
bậc N thành một lính bậc N+1 đổi `2p` lấy `f·p`.

⚠ Bản mô phỏng ĐẦU TIÊN dùng `Σp²` và cho ra kết quả vô nghĩa (mọi chính sách chơi bằng nhau).
Sai ở chỗ `Σp²` là công thức khi chỉ MỘT trong hai (máu hoặc sát thương) nhân theo bậc.

**Giới hạn:** mô hình không tả được tầm với từng cây vũ khí, cung thủ đứng sau bắn tự do, hay
chuyện quân hai đầu sân không cứu nhau được. Nó là điểm bắt đầu đo được — bản cân bằng cuối phải
chơi thử trong Unity.

## 2. Ba hạng người chơi

| Hạng | Chính sách nhập | Dùng để trả lời |
|---|---|---|
| không nhập | 0% | *"cơ chế mang tên kiểu chơi có đáng làm không"* |
| nhập vừa | 50% mỗi cặp gặp được | *"người chơi thường được gì"* |
| nhập giỏi | 100% | *"trần của kiểu chơi ở đâu"* |

Cả ba đều có **tự tuyển** (vàng đủ + còn ô trống thì mua): đó là cái làm mode thành *idle*, và
cũng là cách tách bạch "công của phép nhập" khỏi "công của việc bấm nhanh tay".

## 3. Các đợt quét đã chạy

| Đợt | Quét gì | Kết luận |
|---|---|---|
| 1 | 36 bộ (thu nhập × giá × nhịp), `Σp²` | mô hình sai — mọi chính sách bằng nhau |
| 2 | 48 bộ, thu nhập PHẲNG | **bác bỏ bản thiết kế**: không bộ nào quá 6 phút |
| 3 | 54 bộ, thu nhập leo theo bậc | x3.5, nhưng chỉ ~10 phút |
| 4 | 108 bộ (nhịp × ô × ramp quân × ramp bậc × mạng) | chốt: 15s · 6 ô/bên · +1 quân/4 đợt · +1 bậc/11 đợt · 20 mạng |
| 5 | hệ số bậc 2.0 / 2.24 / 2.4 / 2.6 | 2.24 (suy ra từ bảng 4 bậc) giữ được x3.8 |
| 6 | vàng vắng mặt 0 → 24 giờ | bão hoà ở **30 phút** |
| 7 | 2048: ngưỡng thả ra sân 0 / 5 / 6 / 7 | hai đồng hồ ngược nhau, đo được |

## 4. Bộ số đang dùng

| | idle (`Demo_91`) | 2048 (`Demo_92`) |
|---|---|---|
| Thu nhập | 6 vàng/giây | — (không có ví) |
| Giá tuyển | `30 × PowerOf(bậc cao nhất − 2)` | — |
| Thưởng mỗi mạng | `14 × PowerOf(bậc của nó)` | — |
| Nhịp đợt | 15 s | 22 s |
| Quân mỗi đợt | `2 + đợt/4` **mỗi đầu** | `1 + đợt/2` |
| Bậc địch | `1 + đợt/11` (trần 8) | `1 + đợt/3` (trần 6) |
| Mạng | 20 | 10 |
| Bàn | 6 + 6 ô | 4×4 |
| Hệ số bậc | 2.24 (`MergeTierLadder`) | 2.24 |

## 5. Sửa số thì làm gì

1. Sửa hằng trong `Docs/Tools/MergeBalanceSim.py` (`IDLE = dict(...)`) và chạy lại.
2. Bộ số mới phải giữ **cả hai vế**: không-nhập sống 3–6 phút (đủ để học, đủ để thấy mình đang
   thua), có-nhập ≥ 15 phút (có đường đi lên thật).
3. Chép số sang `IdleMergeMode` / `Merge2048Mode` **và** sang bảng ở `IdleMerge.md`. Một con số
   trong code mà tài liệu ghi khác là thứ không có phép đo nào bắt được.
4. Chơi thử trong Unity: mô phỏng không biết tầm với của cây vũ khí.
