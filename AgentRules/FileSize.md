## ⚠⚠ TRẦN 800 DÒNG CHO FILE NGUỒN — VÀ VÌ SAO NÓ LÀ LUẬT, KHÔNG PHẢI SỞ THÍCH (2026-09-08)

Dự án có **254 000 dòng** trong **573 file**, trong đó **80 file vượt 800 dòng** và file to nhất
là **6 313 dòng**. Con số đó không phải chuyện thẩm mỹ, nó là **giá tiền của mỗi lần sửa**:

- Một AI mạnh đọc trọn file 6 000 dòng thì tốn ngữ cảnh gấp mười lần cần thiết cho một sửa đổi
  ba dòng.
- Một **AI RẺ** (ít ngữ cảnh) thì **không đọc nổi**: nó đọc nửa file, đoán nốt phần còn lại, và
  đoán sai. Mọi luật ⚠ nằm ở nửa không đọc đều bằng không.
- Người cũng vậy: không ai đọc lại 6 000 dòng trước khi sửa, nên các bẫy trong đó chỉ còn tác
  dụng với người đã từng viết chúng.

Vì thế: **file nguồn mới không được quá 800 dòng.**

### Phép đo

`StickmanDoctor.Invariants.cs` › «File nguồn quá dài»:

| Trường hợp | Bảng khám báo |
|---|---|
| File **mới** > 800 dòng | **ĐỎ** — phải tách trước khi coi là xong |
| File trong **sổ nợ** dài thêm > 50 dòng | VÀNG — nợ chỉ được ngắn đi |
| Tổng nợ còn lại | VÀNG một dòng — nhắc tách dần |

Sổ nợ: [`Docs/Tools/FileSizeBaseline.txt`](../Tools/FileSizeBaseline.txt) — chốt hiện trạng ngày
2026-09-08. Tách bớt một file thì **sửa lại số trong sổ**; tách hết thì xoá dòng đó đi.

### Tách thế nào cho an toàn

1. **Một lớp dài** → file phần: `Tên.Cụm.cs`, lớp khai `partial`. Ví dụ đã làm:
   `StickmanStructureArt.cs` 5 661 → 839 + 6 file phần; `StickmanWeaponBuilder.cs` 4 133 → 810 +
   5 file phần.
2. **Một file nhiều lớp** → mỗi lớp một file, đặt tên theo lớp. Ví dụ: `AIStates.cs` 2 984 → 146
   dòng (lớp cơ sở) + 13 file `AIStateXxx.cs`.
3. **Không đổi một dòng logic nào trong lúc tách.** Tách và sửa cùng lượt là cách chắc chắn nhất
   để không biết lỗi đến từ đâu. Tách xong chạy `Docs/Tools/Verify.ps1`, XANH rồi mới sửa tiếp.

⚠ **Lớp `static` thì file phần cũng phải `static partial`** — C# đòi mọi phần khai giống hệt
nhau. ⚠ Nhớ chép đủ `using`, kể cả dòng đầu có BOM (đã dính: mất `using System.Collections.Generic`).

⚠⚠ **MonoBehaviour vẫn phải nằm trong file cùng tên** — Unity nối script theo TÊN FILE. File
phần `Foo.Cụm.cs` thì được (Doctor hiểu dấu chấm), `Bar.cs` chứa `class Foo : MonoBehaviour` thì
**mọi scene/prefab bake sẵn mất script** mà biên dịch vẫn xanh. Có phép đo riêng canh việc này.

### Trần cho tài liệu

Cùng lý do, **file luật cũng trần 800 dòng** (phép đo «File luật quá dài», mức VÀNG). Cách tách:
phần LUẬT giữ ở file gốc, phần NHẬT KÝ BẪY THEO NGÀY tách sang `<Tên>-Notes.md` và thêm dòng vào
[INDEX.md](INDEX.md). Đã làm với [AI.md](AI.md) → [AI-Notes.md](AI-Notes.md).

⚠ Tách tài liệu **không được cắt giữa một mục**: cắt ở ranh giới `## `, và ghi ở đầu file mới
rằng nó tách từ đâu, ngày nào, không đổi chữ.

### Nguyên tắc gốc

> Luật nào cần NHỚ mới đúng thì sớm muộn cũng sai. Biến nó thành PHÉP ĐO.

Trần dòng chỉ là một cách nói khác của điều đó: file càng ngắn thì luật trong nó càng có cơ hội
được đọc. Khi phải chọn giữa "viết thêm một đoạn ⚠" và "viết một `Check` trong Doctor", chọn cái
thứ hai — xem [`StickmanDoctor.cs`](../../Assets/Editor/Doctor/StickmanDoctor.cs).
