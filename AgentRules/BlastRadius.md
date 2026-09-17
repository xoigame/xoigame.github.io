## ⚠⚠ VÙNG ẢNH HƯỞNG — chống "sửa chỗ này hỏng chỗ khác" (2026-09-08)

Lỗi *"sửa một chỗ, hỏng một chỗ khác"* trong dự án này **không** tới từ code dở. Nó tới từ
việc không ai biết **chỗ đang sửa có bao nhiêu chỗ khác đang dựa vào**. Người làm lâu năm giữ
con số đó trong đầu; một AI rẻ thì không — nó sẽ sửa một hàm mà 200 file đang gọi rồi báo "xong".

**Lệnh trả lời trước khi sửa:**

```bash
python Docs/Tools/BlastRadius.py
```

Không tham số = soi các file đang sửa (`git status`). `--hubs` = xếp hạng file nguy hiểm nhất.
Không cần Unity, chạy ~2 giây.

---

## Bốn kiểu lan, và chỉ kiểu 1 là thứ người ta nghĩ tới

| # | Kiểu lan | Dấu hiệu | Phép đo |
|---|---|---|---|
| 1 | **FAN-IN** — nhiều nơi gọi | đổi chữ ký hàm ⇒ vỡ compile hàng loạt | `BlastRadius.py` |
| 2 | **ĐÃ BAKE** — số nằm trong prefab/scene | **compile xanh, chạy y như cũ, không lỗi nào báo** | `BlastRadius.py` (dòng `⚠ ĐÃ BAKE`) + bảng điều khiển «⚠ N việc cần chạy lại» |
| 3 | **TẦNG** — sửa ở Core thì lan lên hết | không thấy gì cho tới lúc chạy | cột `lan tới tầng` |
| 4 | **CHE HÀM** — lớp con khai lại `Update`/sổ tĩnh trùng tên | bản của lớp cha **không bao giờ chạy**, C# không cảnh báo | Doctor «Lớp con CHE hàm thông điệp» |

Kiểu 2 là kiểu đắt nhất và cũng khó tin nhất: sửa bảng số trong code, bấm Play, **game y hệt
lúc chưa sửa**. Không có gì hỏng để mà tìm.

---

## Mười file TRỤC — đo ngày 2026-09-08

Chạm vào đây là chạm vào cả dự án. Con số là **fan-in** (bao nhiêu file khác nhắc tới kiểu
khai trong file đó).

| Fan-in | KB | File | Nó là hợp đồng của cái gì |
|---:|---:|---|---|
| 208 | 312 | `AI/StickmanAgent.cs` | toàn bộ hành vi NPC |
| 195 | 52 | `Combat/StickmanController.cs` | máu · chết · ragdoll · nhận sát thương |
| 195 | 22 | `Combat/TeamMember.cs` | phe, sổ quân, sự kiện chết |
| 141 | 24 | `Core/WeaponTypes.cs` | enum 70 vũ khí + `DamageInfo` |
| 127 | 82 | `Combat/StickmanFighterController.cs` | người chơi điều khiển |
| 115 | 5 | `Combat/EffectLibrary.cs` | bảng sự kiện hiệu ứng |
| 103 | 63 | `Combat/WeaponBase.cs` | hợp đồng chung mọi vũ khí |
| 85 | 130 | `Combat/StickmanLocomotion.cs` | đi · đứng · bám đất |
| 71 | 27 | `Core/StickmanContracts.cs` | interface dùng chung |
| 70 | 80 | `AI/AIProfile.cs` | mọi số tính cách AI |

### Luật trên file trục: **THÊM, đừng ĐỔI NGHĨA**

* Thêm field / hàm / enum **nối vào cuối** → an toàn, 208 chỗ kia không biết cũng không sao.
* Đổi **ý nghĩa** một field đang có, đổi thứ tự enum, đổi giá trị mặc định → lan không kiểm
  soát được. Muốn đổi thì phải đọc hết chỗ dùng, không có đường tắt.
* Đổi tên field serialized → **bắt buộc** `[FormerlySerializedAs]`, không thì mọi asset đã
  bake mất giá trị **trong im lặng**.

---

## Công thức sửa AN TOÀN — bốn bước, đúng thứ tự

1. **ĐO trước:** `python Docs/Tools/BlastRadius.py`. Mức `CAO` thì dừng lại đọc mục trên.
2. **Sửa ở LÁ, đừng sửa ở TRỤC.** Nhu cầu mới gần như luôn làm được bằng một file MỚI
   (fan-in = 0) + một điểm nối nhỏ. Ví dụ có thật trong repo: thanh la bàn cần biết vị trí
   mục tiêu, mà mục tiêu nằm ở tầng cao hơn → **không** sửa `CompassBar` để nhìn lên tầng Map,
   mà thêm `Core/WorldMarkers.cs` (sổ ở Core) rồi tầng cao tự ghi tên vào.
3. **KIỂM bằng lệnh:** `python Docs/Tools/CompileCheck.py --mine`.
4. **BẤM LẠI NÚT** nếu dòng `⚠ ĐÃ BAKE` có xuất hiện. Không bấm = kiểu lan số 2, và bạn sẽ
   tưởng mình chưa sửa gì.

---

## Ba lối THOÁT khi tầng thấp cần thứ ở tầng cao

Đây là chỗ AI yếu hay phá luật module nhất ("cho nhanh"), và phá xong thì bộ khung mất khả
năng tách ra dùng lại.

| Lối | Dùng khi | Ví dụ có thật |
|---|---|---|
| **Registry ở Core** | tầng thấp cần ĐỌC thứ tầng cao tạo ra | `WorldMarkers` — điểm chiếm (Gameplay/Map) tự ghi tên, `CompassBar` chỉ đọc |
| **Interface nhỏ** | tầng thấp cần GỌI một hành vi | `ITroopSource`, `IDamageable` |
| **Hook / factory** | tầng thấp cần một câu trả lời mà chỉ tầng cao biết | `StickmanUI.RegisterPointerBlocker` (Core không được biết uGUI) |

**Không bao giờ** thêm reference ngược trong `.asmdef` để chữa lỗi compile.

---

## Thêm TÍNH NĂNG MỚI mà không lan

Thứ tự ưu tiên, từ an toàn nhất:

1. **File mới ở tầng đúng** + đăng ký qua registry/hook. Fan-in = 0.
2. **Partial class** của một file trục (`X.TinhNangMoi.cs`) — code mới nằm riêng, dễ gỡ.
   Đây là cách repo đã dùng: `StickmanBuildingArt.Modern.cs`, `StickmanNavalBuilder.Demos.cs`.
3. **Field mới + nhánh `if`** trong file trục — chỉ khi hai cách trên không được, và field mới
   phải **mặc định TẮT** (xem quá nhiệt của `RangedWeapon`: `_shotsToOverheat = 0`).

⚠ Mặc định TẮT là luật, không phải gợi ý: 70 vũ khí đã bake trong prefab, bật mặc định là cả
kho đột nhiên đổi hành vi mà không ai khai.

---

## Sửa MỘT LỖI mà không đẻ lỗi khác

1. Viết ra **một câu** mô tả lỗi bằng thứ ĐO ĐƯỢC ("xe hàng dừng ở waypoint 3"), không phải
   cảm giác ("hộ tống bị lag").
2. `BlastRadius.py` trên file nghi ngờ. Fan-in cao ⇒ khả năng cao là **nơi GỌI** sai, không
   phải nơi bị gọi.
3. Sửa xong, hỏi lại: *"thay đổi này có đổi nghĩa thứ gì mà 200 chỗ kia đang tin không?"*
4. Nếu lỗi thuộc loại **im lặng** (không exception, không log) thì viết thêm một phép đo trong
   `StickmanDoctor` — luật cũ của dự án, và nó chính là thứ giữ cho lỗi đó không quay lại.

---

## TÁCH FILE TRỤC THÀNH `partial` — cách làm, và khi nào ĐỪNG làm

`StickmanAgent.cs` = **6 328 dòng / 312 KB / fan-in 208** trong MỘT file. Ai sửa gì trong đó
cũng phải cuộn qua 6 000 dòng của người khác, và hai người sửa hai việc khác nhau vẫn đụng
nhau. Repo đã có khuôn chữa: `ThreeKingdomsCampaign.cs` tách thành 6 file `partial`
(`.Ai.cs`, `.Battle.cs`, `.Economy.cs`, `.Diplomacy.cs`, `.Captives.cs`).

### Vì sao tách `partial` là AN TOÀN
Trình biên dịch ghép lại thành đúng một class — **không đổi một byte hành vi nào**, không đụng
prefab, không đụng GUID, `[SerializeField]` giữ nguyên thứ tự. Cái được là: mỗi việc một file,
`git blame` đọc được, và hai người sửa hai mảng thì không còn đụng nhau.

### Công thức (theo đúng mốc `//====` đã có sẵn trong file)
1. Đổi `public class StickmanAgent` → `public partial class StickmanAgent` (file gốc giữ
   khai báo, field, `Awake`/`Update`).
2. Cắt theo mốc `//====` sang các file cùng thư mục, tên `StickmanAgent.<Việc>.cs`:
   `Traversal` (vượt địa hình · leo · nhảy) · `Evade` (né đạn · né nổ · lệch nhịp) ·
   `Formation` (đội hình · giãn cách) · `Stuck` (phá bế tắc · điểm nóng kẹt).
3. Mỗi file mới mở đầu bằng `public partial class StickmanAgent {`, KHÔNG chép lại field.
4. `python Docs/Tools/CompileCheck.py` — phải **XANH ngay lần đầu**. Đỏ = cắt lệch dấu ngoặc,
   `git checkout` rồi cắt lại; đừng "sửa cho hết đỏ".

### ⚠⚠ KHI NÀO ĐỪNG LÀM
**Khi file đó đang có dấu `M` trong `git status`.** Tách file là viết lại toàn bộ nội dung của
nó; phiên khác (hoặc bạn, ở nhánh khác) đang sửa dở thì mọi thay đổi của họ tan trong im lặng.
Ngày 2026-09-08 đã hoãn đúng vì lý do này: `StickmanAgent.cs` + 8 file AI khác đang được sửa
song song.

Tách file trục là việc của **một phiên riêng, cây làm việc sạch, không làm gì khác** — chính
nó là một thao tác "đụng rất nhiều thứ", nên phải cô lập nó ra.

