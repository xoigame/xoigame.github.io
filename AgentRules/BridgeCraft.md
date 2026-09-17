## ⚠⚠ CẦU THÂN MỀM — VÀ MỘT CON SỐ GÕ TAY CAO GẤP SÁU LẦN (2026-09-16)

Code: `Assets/Scripts/Gameplay/Bridge/`. Màn: `Demo_90_BridgeCraft`. Bộ dựng:
`StickmanBridgeCraftBuilder`. Tham khảo ngoài: *Poly Bridge*.

⚠ **Không nhầm với `StickmanBridgeBuilder`** (màn «GIỮ CẦU»): ở đó cây cầu là ĐỊA HÌNH có sẵn mà
hai phe tranh nhau; ở đây cầu là thứ người chơi **làm ra**.

### 1. Vì sao kiểu chơi này hợp bộ khung này

Dự án đã có sẵn thứ đắt nhất của thể loại: **một hệ khớp vật lý 2D đã chỉnh tay** (rig 20 khớp
`HingeJoint2D`, `breakForce`, vật liệu đàn hồi). Cái còn thiếu chỉ là **một cách cho NGƯỜI CHƠI
đặt khớp**. Và phần thưởng thì đúng thứ dự án bán giỏi nhất: **xem một thứ sập**.

### 2. ⚠⚠ ĐIỂM LÀ SỐ THANH CÒN THỪA, không phải "qua được hay không"

Chấm nhị phân thì ai cũng xây kín cả khe là xong, và kiểu chơi mất luôn câu hỏi của nó —
*"ít thanh nhất mà vẫn đỡ nổi"*.

Đây cũng là lý do **ngân sách phải RỘNG** (22 thanh cho khe 16 đơn vị). Ngân sách chặt biến bài
toán thành một câu đố có đúng một đáp án; ngân sách rộng thì mỗi người có một cây cầu.

### 3. ⚠⚠ `breakForce` — ĐO RA, KHÔNG GÕ

Bản đầu gõ **2600**. Tính lực thật:

| Loại cầu | Tải | Lực thanh lớn nhất |
|---|---:|---:|
| **CÓ GIẰNG** (5 nhịp, giàn cao 2.6) | 195 N | **300 N** |
| THẲNG, võng 0.6 | 98 N | **655 N** |
| THẲNG, võng 0.15 | 98 N | 2621 N |

Ở 2600 thì **không cây cầu nào gãy được** — kể cả một sợi chỉ bắc ngang — và cả bài toán kết cấu
biến mất. **Cao gấp 6 lần.**

Cửa sổ đúng: **390–459 N** — cao hơn 300 để giàn có giằng đứng được, thấp hơn 655 để cầu thẳng
sập. Chọn **450**, sát mép trên, vì xe **đang chạy** nên tải động còn nhân thêm 1.5–2 lần so với
phép tính tĩnh.

⚠ **Cửa sổ hẹp — chỉ gấp 2.2 lần.** Con số này **phải chơi thử rồi chỉnh**: cầu có giằng mà cũng
gãy ⇒ nâng lên; cầu thẳng mà vẫn đứng ⇒ hạ xuống.

> Bài học chung với `Frontier.md`: **một hằng số vật lý gõ tay gần như luôn sai theo BẬC, không
> phải theo phần trăm.** Tính ra con số trước rồi hãy gõ.

### 4. Bốn cái bẫy đã chặn

⚠⚠ **THANH PHẢI CÓ THÂN RIÊNG**, đừng nối thẳng nút-với-nút. `HingeJoint2D` nối hai nút trực tiếp
thì cây cầu **không có khối lượng nào ở giữa** — nó không võng, không gãy, và cả bài toán kết cấu
biến mất.

⚠⚠ **NÚT NEO PHẢI LÀ `Static`.** Để `Dynamic` thì cả cây cầu tự rơi ngay khi bấm CHẠY — kể cả một
cây cầu dựng đúng — và người chơi không có cách nào hiểu vì sao.

⚠⚠ **`flatGround: false` là bắt buộc ở builder.** Dải đất phẳng mặc định chạy suốt sân; có nó thì
cái "vực" chỉ là một vệt màu và xe cứ thế lăn qua — cả kiểu chơi biến mất mà không có gì báo.

⚠ **Đẩy xe bằng VẬN TỐC BÁNH** (`JointMotor2D`), không đẩy thân xe. Đẩy thân thì xe trượt trên mặt
cầu như trên băng và không ai đọc ra được "cầu có đỡ nổi không".

### 5. Hình dạng sân — cũng là luật chơi

| Số | Giá trị | Vì sao |
|---|---|---|
| Khe vực | 16 đơn vị | tầm thanh 4.5 ⇒ ít nhất **bốn nhịp** mới bắc qua; khe hẹp hơn thì một thanh là xong |
| Lưới nút | 2 hàng × 9 cột | **hàng trên là thứ làm ra được giàn tam giác** — chỉ một hàng thì mọi cây cầu đều là một sợi dây |
| Ngân sách | 22 thanh | rộng tay, vì điểm là số thừa |
| Tầm một thanh | 4.5 đơn vị | |
